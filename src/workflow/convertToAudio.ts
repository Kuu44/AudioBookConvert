import { stripMp3Chunk, concatenateUint8Arrays } from './mp3';
import { EdgeTtsService } from './edgeTtsService';

const supportedAudioSourceExtensions = ['txt', 'fb2', 'epub', 'zip'] as const;

export type ConversionPhase = 'idle' | 'preparing' | 'converting' | 'finalizing' | 'succeeded' | 'failed';

export type ConversionArtifact = {
  name: string;
  downloadName: string;
  mimeType: 'audio/mpeg';
  size: number;
  url: string;
  sourceFileName: string;
  sourceMimeType: string;
  voice: string;
  chunkSize: number;
  chunkCount: number;
  speed: string;
  dictionaryMode: boolean;
  textLength: number;
  generatedAt: string;
  durationMs: number;
};

export type ConversionRequest = {
  file: File;
  voice: string;
  chunkSize: number;
  speed: string;
  pitch: string;
  volume: string;
  ttsThreads: number;
  gapMs: number;
  dictionaryMode: boolean;
  timeoutMs?: number;
  onProgress?: (completed: number, total: number) => void;
};

export type ConversionSuccess = {
  phase: 'succeeded';
  artifact: ConversionArtifact;
};

export type ConversionFailureCode =
  | 'missing-file'
  | 'unsupported-file'
  | 'invalid-settings'
  | 'empty-input'
  | 'timeout'
  | 'adapter';

export class ConversionError extends Error {
  code: ConversionFailureCode;
  retryable: boolean;
  details?: string;

  constructor(message: string, options: { code: ConversionFailureCode; retryable: boolean; details?: string }) {
    super(message);
    this.name = 'ConversionError';
    this.code = options.code;
    this.retryable = options.retryable;
    this.details = options.details;
  }
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function isSupportedSourceFile(file: File) {
  const extension = getFileExtension(file.name);
  return supportedAudioSourceExtensions.includes(extension as (typeof supportedAudioSourceExtensions)[number]);
}

function getFileStem(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(0, lastDot) : fileName;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function speedToRate(speed: string) {
  switch (speed) {
    case 'Very Slow': return '-30%';
    case 'Slow': return '-15%';
    case 'Fast': return '+15%';
    case 'Very Fast': return '+30%';
    default: return '+0%';
  }
}

function pitchToValue(pitch: string) {
  switch (pitch) {
    case 'Very Low': return '-50Hz';
    case 'Low': return '-25Hz';
    case 'High': return '+25Hz';
    case 'Very High': return '+50Hz';
    default: return '+0Hz';
  }
}

function volumeToValue(volume: string) {
  switch (volume) {
    case 'Soft': return '-30%';
    case 'Loud': return '+30%';
    default: return '+0%';
  }
}

function createTimeoutError(timeoutMs: number) {
  return new ConversionError(`Conversion timed out after ${timeoutMs}ms.`, {
    code: 'timeout',
    retryable: true,
    details: `The Edge TTS adapter exceeded the ${timeoutMs}ms budget.`,
  });
}

export function normalizeConversionError(error: unknown) {
  if (error instanceof ConversionError) {
    return error;
  }

  if (error instanceof Error) {
    return new ConversionError(error.message || 'Conversion failed.', {
      code: 'adapter',
      retryable: true,
      details: error.stack ?? undefined,
    });
  }

  return new ConversionError('Conversion failed.', {
    code: 'adapter',
    retryable: true,
    details: typeof error === 'string' ? error : undefined,
  });
}

function splitTextIntoChunks(text: string, chunkSize: number) {
  const chunks: string[] = [];

  for (let offset = 0; offset < text.length; offset += chunkSize) {
    const chunk = text.slice(offset, offset + chunkSize).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

function encodeWavFromPcm(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;

  function writeString(value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
    offset += value.length;
  }

  writeString('RIFF');
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString('data');
  view.setUint32(offset, dataSize, true);
  offset += 4;

  for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
    const clamped = clamp(samples[sampleIndex], -1, 1);
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function decodeMp3Chunk(context: AudioContext, chunk: Uint8Array): Promise<AudioBuffer> {
  const buffer = Uint8Array.from(chunk).buffer;
  return context.decodeAudioData(buffer);
}

async function fetchChunkAudio(
  service: EdgeTtsService,
  text: string,
  voice: string,
  speed: string,
  pitch: string,
  volume: string,
  chunkIdx: number,
): Promise<Uint8Array> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!service.isReady()) {
        await service.connect();
      }

      const audio = await service.send({
        text,
        voice,
        pitch: pitchToValue(pitch),
        rate: speedToRate(speed),
        volume: volumeToValue(volume),
      });

      return stripMp3Chunk(audio);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[fetchChunkAudio] Chunk ${chunkIdx} attempt ${attempt} failed: ${lastError.message}`);
      
      service.disconnect();
      if (attempt < maxRetries) {
        await delay(500 * attempt); // Exponential backoff
      }
    }
  }

  throw lastError || new Error(`Failed to fetch chunk ${chunkIdx} after ${maxRetries} attempts`);
}

async function runConversion(request: ConversionRequest): Promise<ConversionSuccess> {
  const { file, voice, chunkSize, speed, dictionaryMode } = request;

  if (!file) {
    throw new ConversionError('Select a supported source file before starting conversion.', {
      code: 'missing-file',
      retryable: false,
    });
  }

  if (!isSupportedSourceFile(file)) {
    throw new ConversionError(`Unsupported file type for ${file.name}.`, {
      code: 'unsupported-file',
      retryable: false,
      details: 'Only TXT, FB2, EPUB, and ZIP sources are accepted by this workflow.',
    });
  }

  if (!voice || chunkSize < 400 || chunkSize > 12000 || !Number.isInteger(chunkSize)) {
    throw new ConversionError('Conversion settings are invalid.', {
      code: 'invalid-settings',
      retryable: false,
      details: 'Voice, chunk size, speed, and dictionary mode must be valid before conversion starts.',
    });
  }

  const sourceText = await file.text();

  if (sourceText.trim().length === 0) {
    throw new ConversionError('Source file is empty.', {
      code: 'empty-input',
      retryable: false,
      details: 'The adapter requires text content to synthesize an audio artifact.',
    });
  }

  const normalizedText = sourceText.replace(/\s+/g, ' ').trim();
  const chunks = splitTextIntoChunks(normalizedText, chunkSize);

  if (chunks.length === 0) {
    throw new ConversionError('No pronounceable content was found.', {
      code: 'empty-input',
      retryable: false,
      details: 'Text normalization removed all usable content.',
    });
  }

  await delay(50);

  const chunkAudio: Uint8Array[] = new Array(chunks.length);
  const concurrency = Math.min(request.ttsThreads || 6, chunks.length);
  let currentIndex = 0;
  let completed = 0;

  console.log(`[runConversion] Starting synthesis for ${chunks.length} chunks with concurrency ${concurrency}`);

  // Notify UI that chunking is done and synthesis is starting
  request.onProgress?.(0, chunks.length);

  const workers = Array.from({ length: concurrency }, async (_, workerId) => {
    const workerService = new EdgeTtsService();
    try {
      while (true) {
        const idx = currentIndex++;
        if (idx >= chunks.length) break;

        const chunkText = chunks[idx];
        const chunkBytes = await fetchChunkAudio(
          workerService,
          chunkText,
          voice,
          speed,
          request.pitch,
          request.volume,
          idx
        );
        
        chunkAudio[idx] = chunkBytes;
        completed += 1;
        
        request.onProgress?.(completed, chunks.length);

        if (completed % 10 === 0) {
          console.log(`[runConversion] Progress: ${completed}/${chunks.length}`);
          await delay(0);
        }
      }
    } catch (error) {
      console.error(`[runConversion] Worker ${workerId} failed:`, error);
      throw error;
    } finally {
      workerService.disconnect();
    }
  });

  try {
    await Promise.all(workers);
  } catch (error) {
    console.error(`[runConversion] Parallel synthesis failed:`, error);
    throw error;
  }

  const allChunksReady = chunkAudio.every((chunk): chunk is Uint8Array => chunk instanceof Uint8Array && chunk.length > 0);
  if (!allChunksReady) {
    throw new ConversionError('One or more audio chunks failed to synthesize.', {
      code: 'adapter',
      retryable: true,
      details: 'The TTS service returned an incomplete chunk set.',
    });
  }

  const mergedAudio = concatenateUint8Arrays(chunkAudio);
  console.log(`[runConversion] Concatenated ${chunkAudio.length} chunks into ${mergedAudio.length} bytes`);
  const audioBlob = new Blob([mergedAudio.buffer as ArrayBuffer], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);
  console.log(`[runConversion] Created Blob URL: ${audioUrl}`);

  await delay(50);

  return {
    phase: 'succeeded',
    artifact: {
      name: file.name,
      downloadName: `${getFileStem(file.name)}-converted.mp3`,
      mimeType: 'audio/mpeg',
      size: audioBlob.size,
      url: audioUrl,
      sourceFileName: file.name,
      sourceMimeType: file.type || 'application/octet-stream',
      voice,
      chunkSize,
      chunkCount: chunks.length,
      speed,
      dictionaryMode,
      textLength: normalizedText.length,
      generatedAt: new Date().toISOString(),
      durationMs: 0,
    },
  };
}

export async function convertToAudio(request: ConversionRequest): Promise<ConversionSuccess> {
  const timeoutMs = request.timeoutMs ?? 30 * 60 * 1000;
  let timeoutHandle: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      reject(createTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([runConversion(request), timeoutPromise]);
  } finally {
    if (timeoutHandle !== undefined) {
      window.clearTimeout(timeoutHandle);
    }
  }
}
