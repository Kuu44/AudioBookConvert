import { useMemo, useState } from 'react';

const supportedFileExtensions = ['txt', 'fb2', 'epub', 'zip'] as const;
const supportedVoices = [
  { value: 'en-US-AriaNeural', label: 'Aria (en-US)' },
  { value: 'en-US-GuyNeural', label: 'Guy (en-US)' },
  { value: 'en-GB-LibbyNeural', label: 'Libby (en-GB)' }
] as const;
const supportedSpeeds = ['Slow', 'Normal', 'Fast'] as const;

const minChunkSize = 400;
const maxChunkSize = 4000;
const defaultChunkSize = '1200';

export type SupportedVoiceValue = (typeof supportedVoices)[number]['value'];
export type SupportedSpeedValue = (typeof supportedSpeeds)[number];

export type SelectedFileSummary = {
  name: string;
  extension: string;
  size: number;
  type: string;
};

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let current = bytes / 1024;
  let unitIndex = 0;

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }

  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function isSupportedExtension(extension: string) {
  return supportedFileExtensions.includes(extension as (typeof supportedFileExtensions)[number]);
}

function createFileSummary(file: File): SelectedFileSummary {
  const extension = getExtension(file.name);

  return {
    name: file.name,
    extension: extension || 'unknown',
    size: file.size,
    type: file.type || 'application/octet-stream'
  };
}

export function useWorkflowState() {
  const [selectedFile, setSelectedFile] = useState<SelectedFileSummary | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [chunkSizeText, setChunkSizeText] = useState(defaultChunkSize);
  const [speed, setSpeed] = useState<SupportedSpeedValue>('Normal');
  const [dictionaryMode, setDictionaryMode] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const chunkSize = Number(chunkSizeText);
  const chunkSizeValid = Number.isInteger(chunkSize) && chunkSize >= minChunkSize && chunkSize <= maxChunkSize;
  const voiceValid = supportedVoices.some((voice) => voice.value === selectedVoice);
  const canStart = Boolean(selectedFile && voiceValid && chunkSizeValid && !fileError && !settingsError);

  const accept = supportedFileExtensions.map((extension) => `.${extension}`).join(', ');

  const statusSummary = useMemo(() => {
    if (fileError) {
      return fileError;
    }

    if (!selectedFile) {
      return 'No file selected yet. Pick a supported source file to unlock conversion.';
    }

    return `Loaded ${selectedFile.name} (${selectedFile.extension.toUpperCase()}, ${formatBytes(selectedFile.size)}).`;
  }, [fileError, selectedFile]);

  const voiceSummary = useMemo(() => {
    if (!voiceValid) {
      return 'Voice is not selected yet.';
    }

    return `Voice selected: ${selectedVoice}.`;
  }, [selectedVoice, voiceValid]);

  const settingsSummary = useMemo(() => {
    if (settingsError) {
      return settingsError;
    }

    return `Chunk size ${chunkSizeText} characters, speed ${speed}, dictionary mode ${dictionaryMode ? 'on' : 'off'}.`;
  }, [chunkSizeText, dictionaryMode, settingsError, speed]);

  const readinessSummary = useMemo(() => {
    if (canStart) {
      return 'Ready to start conversion.';
    }

    return 'Start conversion is blocked until a supported file, a voice, and valid settings are present.';
  }, [canStart]);

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      setFileError('Select a TXT, FB2, EPUB, or ZIP file to continue.');
      return;
    }

    const file = fileList[0];
    const extension = getExtension(file.name);

    if (!isSupportedExtension(extension)) {
      setFileError(`Unsupported file type: .${extension || 'unknown'}. Use TXT, FB2, EPUB, or ZIP.`);
      return;
    }

    setSelectedFile(createFileSummary(file));
    setFileError(null);
  }

  function handleVoiceChange(nextVoice: string) {
    setSelectedVoice(nextVoice);
  }

  function handleChunkSizeChange(nextChunkSizeText: string) {
    setChunkSizeText(nextChunkSizeText);

    if (nextChunkSizeText.trim().length === 0) {
      setSettingsError('Chunk size is required.');
      return;
    }

    const nextValue = Number(nextChunkSizeText);
    if (!Number.isInteger(nextValue) || nextValue < minChunkSize || nextValue > maxChunkSize) {
      setSettingsError(`Chunk size must stay between ${minChunkSize} and ${maxChunkSize}.`);
      return;
    }

    setSettingsError(null);
  }

  function handleSpeedChange(nextSpeed: string) {
    if (supportedSpeeds.includes(nextSpeed as SupportedSpeedValue)) {
      setSpeed(nextSpeed as SupportedSpeedValue);
      setSettingsError(null);
      return;
    }

    setSettingsError('Select one of the supported speed options.');
  }

  function handleDictionaryModeChange(nextDictionaryMode: boolean) {
    setDictionaryMode(nextDictionaryMode);
  }

  return {
    accept,
    canStart,
    chunkSizeText,
    dictionaryMode,
    fileError,
    handleChunkSizeChange,
    handleDictionaryModeChange,
    handleFileSelection,
    handleSpeedChange,
    handleVoiceChange,
    readinessSummary,
    selectedFile,
    selectedVoice,
    settingsError,
    settingsSummary,
    speed,
    statusSummary,
    supportedVoices,
    voiceSummary,
    voiceValid
  };
}
