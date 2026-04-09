import { stripMp3Chunk, concatenateUint8Arrays } from './mp3';
import { EdgeTtsService } from './edgeTtsService';
import { persistence, PersistenceService } from './persistence';

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
  sourceCleanup: TextCleanupReport;
  generatedAt: string;
  durationMs: number;
};

export type TextCleanupSample = {
  preview: string;
  occurrences: number;
  paragraphsRemoved: number;
  wordsRemoved: number;
};

export type TextCleanupReport = {
  originalTextLength: number;
  cleanedTextLength: number;
  originalWordCount: number;
  cleanedWordCount: number;
  removedParagraphBlocks: number;
  removedParagraphs: number;
  removedWordCount: number;
  repeatedBlockSamples: TextCleanupSample[];
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

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function countWords(text: string) {
  const normalized = normalizeWhitespace(text);
  return normalized.length === 0 ? 0 : normalized.split(' ').length;
}

function previewWords(text: string, wordLimit = 12) {
  const normalized = normalizeWhitespace(text);
  if (normalized.length === 0) {
    return '';
  }

  return normalized.split(' ').slice(0, wordLimit).join(' ');
}

function splitIntoParagraphs(text: string) {
  return text
    .split(/\n\s*\n+/)
    .map((paragraph) => normalizeWhitespace(paragraph))
    .filter((paragraph) => paragraph.length > 0);
}

function blocksMatch(paragraphs: string[], leftStart: number, rightStart: number, length: number) {
  for (let index = 0; index < length; index += 1) {
    if (paragraphs[leftStart + index] !== paragraphs[rightStart + index]) {
      return false;
    }
  }

  return true;
}

function collapseRepeatedParagraphBlocks(sourceText: string) {
  const paragraphs = splitIntoParagraphs(sourceText);
  const cleanedParagraphs: string[] = [];
  const repeatedBlockSamples: TextCleanupSample[] = [];
  let removedParagraphBlocks = 0;
  let removedParagraphs = 0;
  let removedWordCount = 0;
  const maxBlockParagraphs = Math.min(80, paragraphs.length);

  for (let start = 0; start < paragraphs.length;) {
    let bestMatch: { length: number; repeats: number } | null = null;
    const remaining = paragraphs.length - start;

    for (let blockLength = 1; blockLength <= Math.min(maxBlockParagraphs, remaining); blockLength += 1) {
      const block = paragraphs.slice(start, start + blockLength);
      const blockWordCount = countWords(block.join(' '));
      if (blockWordCount < 10) {
        continue;
      }

      let repeats = 1;
      while (start + (repeats * blockLength) + blockLength <= paragraphs.length) {
        if (!blocksMatch(paragraphs, start, start + (repeats * blockLength), blockLength)) {
          break;
        }
        repeats += 1;
      }

      if (repeats > 1) {
        const currentCoverage = blockLength * repeats;
        const bestCoverage = bestMatch ? bestMatch.length * bestMatch.repeats : 0;
        if (!bestMatch || currentCoverage > bestCoverage || (currentCoverage === bestCoverage && blockLength > bestMatch.length)) {
          bestMatch = { length: blockLength, repeats };
        }
      }
    }

    if (bestMatch) {
      const block = paragraphs.slice(start, start + bestMatch.length);
      const repetitionsRemoved = bestMatch.repeats - 1;
      const blockWordCount = countWords(block.join(' '));

      cleanedParagraphs.push(...block);
      removedParagraphBlocks += repetitionsRemoved;
      removedParagraphs += bestMatch.length * repetitionsRemoved;
      removedWordCount += blockWordCount * repetitionsRemoved;
      repeatedBlockSamples.push({
        preview: previewWords(block.join(' ')),
        occurrences: bestMatch.repeats,
        paragraphsRemoved: bestMatch.length * repetitionsRemoved,
        wordsRemoved: blockWordCount * repetitionsRemoved,
      });

      start += bestMatch.length * bestMatch.repeats;
      continue;
    }

    cleanedParagraphs.push(paragraphs[start]);
    start += 1;
  }

  const cleanedText = normalizeWhitespace(cleanedParagraphs.join('\n\n'));

  return {
    cleanedText,
    report: {
      originalTextLength: normalizeWhitespace(sourceText).length,
      cleanedTextLength: cleanedText.length,
      originalWordCount: countWords(sourceText),
      cleanedWordCount: countWords(cleanedText),
      removedParagraphBlocks,
      removedParagraphs,
      removedWordCount,
      repeatedBlockSamples,
    } satisfies TextCleanupReport,
  };
}

export function prepareSourceText(sourceText: string) {
  return collapseRepeatedParagraphBlocks(sourceText);
}

export function splitTextIntoChunks(text: string, chunkSize: number) {
  const normalized = normalizeWhitespace(text);
  if (normalized.length === 0) {
    return [];
  }

  const words = normalized.split(' ');
  const chunks: string[] = [];
  let currentWords: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    const nextLength = currentWords.length === 0 ? word.length : currentLength + 1 + word.length;

    if (currentWords.length > 0 && nextLength > chunkSize) {
      chunks.push(currentWords.join(' '));
      currentWords = [word];
      currentLength = word.length;
      continue;
    }

    currentWords.push(word);
    currentLength = nextLength;
  }

  if (currentWords.length > 0) {
    chunks.push(currentWords.join(' '));
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

  const { cleanedText, report: sourceCleanup } = prepareSourceText(sourceText);
  const chunks = splitTextIntoChunks(cleanedText, chunkSize);

  if (chunks.length === 0) {
    throw new ConversionError('No pronounceable content was found.', {
      code: 'empty-input',
      retryable: false,
      details: 'Text normalization removed all usable content.',
    });
  }

  if (sourceCleanup.removedParagraphBlocks > 0) {
    console.log(
      `[runConversion] Source cleanup removed ${sourceCleanup.removedParagraphBlocks} repeated block(s), ${sourceCleanup.removedParagraphs} paragraph(s), and ${sourceCleanup.removedWordCount} word(s).`,
    );
    if (sourceCleanup.repeatedBlockSamples.length > 0) {
      const sample = sourceCleanup.repeatedBlockSamples[0];
      console.log(`[runConversion] Cleanup sample: ${sample.preview} (x${sample.occurrences})`);
    }
  } else {
    console.log('[runConversion] Source cleanup found no repeated passage blocks.');
  }

  await delay(50);

  const sessionId = PersistenceService.generateSessionId(file.name, chunks.length, voice);
  await persistence.init();

  const chunkAudio: Uint8Array[] = new Array(chunks.length);
  const concurrency = Math.min(request.ttsThreads || 6, chunks.length);
  let currentIndex = 0;
  let completed = 0;

  console.log(`[runConversion] Starting synthesis for ${chunks.length} chunks with concurrency ${concurrency} (Session: ${sessionId})`);

  // Notify UI that chunking is done and synthesis is starting
  request.onProgress?.(0, chunks.length);

  const workers = Array.from({ length: concurrency }, async (_, workerId) => {
    const workerService = new EdgeTtsService();
    try {
      while (true) {
        const idx = currentIndex++;
        if (idx >= chunks.length) break;

        // Check persistence first
        const existingChunk = await persistence.getChunk(sessionId, idx);
        if (existingChunk) {
          chunkAudio[idx] = existingChunk;
          completed += 1;
          request.onProgress?.(completed, chunks.length);
          continue;
        }

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
        
        // Save to persistence immediately
        await persistence.saveChunk(sessionId, idx, chunkBytes);

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
      textLength: cleanedText.length,
      sourceCleanup,
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
