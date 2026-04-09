import React from 'react';
import './styles.css';
import { useWorkflowState } from './workflow/useWorkflowState';

// Components
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { VoiceSelector } from './components/VoiceSelector';
import { ControlSliders } from './components/ControlSliders';
import { ProcessingSettings } from './components/ProcessingSettings';
import { ConversionBar } from './components/ConversionBar';
import { ErrorScreen } from './components/ErrorScreen';
import { ConversionDashboard } from './components/ConversionDashboard';
import { SuccessScreen } from './components/SuccessScreen';

export function App() {
  const {
    accept,
    canStart,
    chunkSizeText,
    conversionArtifact,
    conversionError,
    conversionPhase,
    fileError,
    handleChunkSizeChange,
    handleFileSelection,
    handleSpeedChange,
    handlePitchChange,
    handleVolumeChange,
    handleTtsThreadsChange,
    handleGapMsChange,
    toggleProcessingOption,
    handleStartConversion,
    handleVoiceChange,
    selectedFile,
    selectedVoice,
    speed,
    pitch,
    volume,
    ttsThreads,
    gapMs,
    autoPilot,
    performanceTier,
    showAdvanced,
    handleAutoPilotChange,
    handlePerformanceTierChange,
    handleShowAdvancedChange,
    processingOptions,
    isConversionRunning,
    progress,
    eta,
    sessionProgress,
    showResumePrompt,
    handleClearPersistence,
    selectedSourceFile,
    textInput,
    setTextInput,
    resetWorkflow
  } = useWorkflowState();

  let appStatus = "Offline";
  if (conversionPhase === 'idle') {
    appStatus = canStart ? "Ready" : "Offline";
  } else if (conversionPhase === 'preparing' || (isConversionRunning && progress.total === 0)) {
    appStatus = "Calculating";
  } else if (isConversionRunning) {
    appStatus = "Processing";
  } else if (conversionPhase === 'succeeded') {
    appStatus = "Ready";
  } else if (conversionPhase === 'failed') {
    appStatus = "Error";
  }

  return (
    <>
      <div className="blobs-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container">
        <Header status={appStatus} />

        {conversionPhase === 'failed' ? (
          <ErrorScreen error={conversionError} onReset={resetWorkflow} />
        ) : conversionPhase === 'succeeded' ? (
          <SuccessScreen artifact={conversionArtifact} onReset={resetWorkflow} />
        ) : isConversionRunning ? (
          <ConversionDashboard 
            progress={progress}
            eta={eta}
            selectedFile={selectedFile}
            selectedVoice={selectedVoice}
            speed={speed}
          />
        ) : (
          <>
            {/* Hero Section */}
            <section className="pipeline-section" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--space-2)', marginBottom: 'var(--space-4)'
            }}>
              <div style={{
                textAlign: 'center', maxWidth: '600px', margin: 'var(--space-4) auto',
                animation: 'fade-in 0.8s var(--ease-out)'
              }}>
                <p style={{ fontSize: '1.1rem' }}>
                  Convert your massive documents into rich, natural audio with the power of Edge TTS and client-side processing.
                </p>
              </div>
            </section>

            <UploadZone
              onFileSelect={handleFileSelection}
              selectedFile={selectedFile}
              error={fileError}
              accept={accept}
              textInput={textInput}
              onTextInputChange={setTextInput}
            />

            <div className="pipeline-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>2. Configuration</h3>

              <div className="settings-grid">
                <div className="glass-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <VoiceSelector
                      selectedVoice={selectedVoice}
                      onVoiceChange={handleVoiceChange}
                      speed={speed}
                      pitch={pitch}
                      volume={volume}
                      selectedSourceFile={selectedSourceFile}
                      rawTextInput={textInput}
                    />
                    <ControlSliders
                      speed={speed} onSpeedChange={handleSpeedChange}
                      pitch={pitch} onPitchChange={handlePitchChange}
                      volume={volume} onVolumeChange={handleVolumeChange}
                      ttsThreads={ttsThreads} onTtsThreadsChange={handleTtsThreadsChange}
                      chunkSize={chunkSizeText} onChunkSizeChange={handleChunkSizeChange}
                      autoPilot={autoPilot} onAutoPilotChange={handleAutoPilotChange}
                      performanceTier={performanceTier} onPerformanceTierChange={handlePerformanceTierChange}
                      showAdvanced={showAdvanced} onShowAdvancedChange={handleShowAdvancedChange}
                    />
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Sonic Optimization Pipeline
                  </div>
                  <ProcessingSettings
                    options={processingOptions}
                    onToggle={toggleProcessingOption}
                    gapMs={gapMs}
                    onGapChange={handleGapMsChange}
                  />
                </div>
              </div>
            </div>

            <ConversionBar
              onStart={handleStartConversion}
              isRunning={false}
              canStart={canStart}
              progress={progress}
              eta={eta}
              sessionProgress={sessionProgress}
              showResumePrompt={showResumePrompt}
              onClearSession={handleClearPersistence}
            />
          </>
        )}
      </div>
    </>
  );
}

export default App;