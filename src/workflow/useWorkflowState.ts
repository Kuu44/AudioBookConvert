import { useEffect, useMemo, useRef, useState } from 'react';
import { convertToAudio, normalizeConversionError, type ConversionArtifact, type ConversionPhase } from './convertToAudio';
import { voices } from './voices';

const supportedFileExtensions = ['txt', 'fb2', 'epub', 'zip'] as const;
const defaultChunkSize = '4000';
const minChunkSize = 400;
const maxChunkSize = 8000;

export type SelectedFileSummary = {
  name: string;
  extension: string;
  size: number;
  type: string;
};

type ConversionState = {
  phase: ConversionPhase;
  artifact: ConversionArtifact | null;
  error: string | null;
  errorCode: string | null;
  isRunning: boolean;
  progress: { completed: number; total: number };
  startTime: number | null;
  eta: string | null;
};

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
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
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFileSummary | null>(null);
  const [selectedSourceFile, setSelectedSourceFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-AvaMultilingualNeural');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [chunkSizeText, setChunkSizeText] = useState(defaultChunkSize);
  const [speed, setSpeed] = useState<string>('Normal');
  const [pitch, setPitch] = useState<string>('Normal');
  const [volume, setVolume] = useState<string>('Normal');
  const [dictionaryMode, setDictionaryMode] = useState(true);
  const [ttsThreads, setTtsThreads] = useState(24);
  const [gapMs, setGapMs] = useState(0);
  const [streamToDisk, setStreamToDisk] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [performanceTier, setPerformanceTier] = useState<'turbo' | 'standard' | 'stability'>('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    removeSilence: false,
    normalize: false,
    compressor: false,
    fadeIn: false,
    eq: false,
    deEss: false
  });

  const [fileError, setFileError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<ConversionState>({
    phase: 'idle',
    artifact: null,
    error: null,
    errorCode: null,
    isRunning: false,
    progress: { completed: 0, total: 0 },
    startTime: null,
    eta: null
  });

  const chunkSize = autoPilot ? 2000 : Number(chunkSizeText);
  const threads = autoPilot ? (performanceTier === 'turbo' ? 48 : performanceTier === 'standard' ? 24 : 12) : ttsThreads;
  
  const chunkSizeValid = Number.isInteger(chunkSize) && chunkSize >= minChunkSize && chunkSize <= 12000;
  const voiceValid = voices.some((v) => v.value === selectedVoice);
  const canStart = Boolean(selectedFile && selectedSourceFile && voiceValid && chunkSizeValid && !fileError && !settingsError && !conversion.isRunning);

  const accept = supportedFileExtensions.map((ext) => `.${ext}`).join(', ');
  const activeJobId = useRef(0);
  const artifactUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (artifactUrlRef.current) URL.revokeObjectURL(artifactUrlRef.current);
    };
  }, []);

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      setSelectedFile(null);
      setSelectedSourceFile(null);
      setFileError('Select a TXT, FB2, EPUB, or ZIP file to continue.');
      return;
    }
    const file = fileList[0];
    const extension = getExtension(file.name);
    if (!isSupportedExtension(extension)) {
      setSelectedFile(null);
      setSelectedSourceFile(null);
      setFileError(`Unsupported file: .${extension}. Use TXT, FB2, EPUB, or ZIP.`);
      return;
    }
    setSelectedFile(createFileSummary(file));
    setSelectedSourceFile(file);
    setFileError(null);
  }

  useEffect(() => {
    if (selectedFile && selectedVoice && chunkSizeValid) {
      import('./persistence').then(async ({ PersistenceService, persistence }) => {
        const sid = PersistenceService.generateSessionId(selectedFile.name, chunkSize, selectedVoice);
        const count = await persistence.getSessionChunksCount(sid);
        setSessionProgress(count);
        if (count > 0 && !conversion.isRunning) {
          setShowResumePrompt(true);
        } else {
          setShowResumePrompt(false);
        }
      });
    } else {
      setSessionProgress(0);
      setShowResumePrompt(false);
    }
  }, [selectedFile, selectedVoice, chunkSize, chunkSizeValid, conversion.isRunning]);

  const handleVoiceChange = (v: string) => setSelectedVoice(v);
  const handleChunkSizeChange = (v: string) => setChunkSizeText(v);
  const handleSpeedChange = (v: string) => setSpeed(v);
  const handlePitchChange = (v: string) => setPitch(v);
  const handleVolumeChange = (v: string) => setVolume(v);
  const handleTtsThreadsChange = (v: number) => setTtsThreads(v);
  const handleGapMsChange = (v: number) => setGapMs(v);
  const handleStreamToDiskChange = (v: boolean) => setStreamToDisk(v);
  const handleDictionaryModeChange = (v: boolean) => setDictionaryMode(v);
  const handleAutoPilotChange = (v: boolean) => setAutoPilot(v);
  const handlePerformanceTierChange = (v: 'turbo' | 'standard' | 'stability') => setPerformanceTier(v);
  const handleShowAdvancedChange = (v: boolean) => setShowAdvanced(v);
  const handleClearPersistence = async () => {
    if (selectedFile && selectedVoice) {
      const { PersistenceService, persistence } = await import('./persistence');
      const sid = PersistenceService.generateSessionId(selectedFile.name, chunkSize, selectedVoice);
      await persistence.deleteSession(sid, 999999);
      setSessionProgress(0);
      setShowResumePrompt(false);
    }
  };
  const toggleProcessingOption = (opt: keyof typeof processingOptions) => setProcessingOptions(p => ({ ...p, [opt]: !p[opt] }));

  async function handleStartConversion() {
    if (!canStart || !selectedSourceFile) return;

    const nextJobId = activeJobId.current + 1;
    activeJobId.current = nextJobId;

    const startTime = Date.now();
    setConversion({
      phase: 'converting',
      artifact: null,
      error: null,
      errorCode: null,
      isRunning: true,
      progress: { completed: 0, total: 0 },
      startTime,
      eta: 'Calculating...'
    });

    try {
      const result = await convertToAudio({
        file: selectedSourceFile,
        voice: selectedVoice,
        chunkSize,
        speed,
        pitch,
        volume,
        ttsThreads: threads,
        gapMs,
        dictionaryMode,
        onProgress: (completed, total) => {
          const now = Date.now();
          const perChunk = completed > 0 ? (now - startTime) / completed : 0;
          const etaMs = perChunk * (total - completed);
          const etaStr = etaMs > 60000 ? `~${Math.ceil(etaMs / 60000)}m remaining` : etaMs > 0 ? `~${Math.ceil(etaMs / 1000)}s remaining` : 'Calculating...';
          setConversion(c => ({ ...c, progress: { completed, total }, eta: etaStr }));
        }
      });

      if (activeJobId.current !== nextJobId) return;
      artifactUrlRef.current = result.artifact.url;
      setConversion(c => ({ ...c, phase: 'succeeded', artifact: result.artifact, isRunning: false }));
    } catch (err) {
      if (activeJobId.current !== nextJobId) return;
      const failure = normalizeConversionError(err);
      setConversion(c => ({ ...c, phase: 'failed', error: failure.message, errorCode: failure.code, isRunning: false }));
    }
  }

  async function resetWorkflow() {
    // If we succeeded, we can clear the persistence to save user disk space
    if (conversion.phase === 'succeeded' && selectedFile && selectedVoice) {
      try {
        const { PersistenceService, persistence } = await import('./persistence');
        // Total chunks is artifact.chunkCount
        const count = (conversion.artifact as any)?.chunkCount || 0;
        const sid = PersistenceService.generateSessionId(selectedFile.name, count, selectedVoice);
        await persistence.deleteSession(sid, count);
      } catch (e) {
        console.warn('Failed to clear persistence after success:', e);
      }
    }

    setConversion({
      phase: 'idle',
      artifact: null,
      error: null,
      errorCode: null,
      isRunning: false,
      progress: { completed: 0, total: 0 },
      startTime: null,
      eta: null
    });
    setSelectedFile(null);
    setSelectedSourceFile(null);
    setTextInput('');
    setSessionProgress(0);
    setShowResumePrompt(false);
  }

  return {
    accept, canStart, chunkSizeText, conversionArtifact: conversion.artifact,
    conversionError: conversion.error, conversionPhase: conversion.phase,
    dictionaryMode, fileError, handleChunkSizeChange, handleDictionaryModeChange,
    handleFileSelection, handleSpeedChange, handlePitchChange, handleVolumeChange,
    handleTtsThreadsChange, handleGapMsChange, handleStreamToDiskChange,
    handleAutoPilotChange, handlePerformanceTierChange, handleShowAdvancedChange,
    handleClearPersistence,
    toggleProcessingOption, handleStartConversion, handleVoiceChange,
    selectedFile, selectedSourceFile, selectedVoice, settingsError, speed, pitch, volume,
    ttsThreads, gapMs, streamToDisk, processingOptions, voices,
    autoPilot, performanceTier, showAdvanced,
    sessionProgress, showResumePrompt, 
    textInput, setTextInput,
    isConversionRunning: conversion.isRunning, progress: conversion.progress, eta: conversion.eta,
    resetWorkflow
  };
}


