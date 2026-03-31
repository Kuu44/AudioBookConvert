import type { ReactNode } from 'react';

import { InputSurface } from './components/InputSurface';
import { VoiceSettings } from './components/VoiceSettings';
import { useWorkflowState } from './workflow/useWorkflowState';

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className = ''
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`.trim()} aria-label={title}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="panel-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const workflow = useWorkflowState();

  return (
    <main className="app-shell">
      <div className="backdrop" aria-hidden="true" />
      <header className="hero">
        <p className="eyebrow">Microsoft Edge workflow shell</p>
        <div className="hero-copy">
          <h1>AudioBookConvert</h1>
          <p>
            A browser-hosted conversion desk for supported text and ebook inputs,
            voice selection, and conversion settings.
          </p>
        </div>
        <div className={`hero-status ${workflow.canStart ? 'ready' : 'blocked'}`} role="status" aria-live="polite">
          {workflow.readinessSummary}
        </div>
      </header>

      <div className="workflow-grid">
        <SectionCard
          eyebrow="01"
          title="Upload"
          description="Supported inputs are surfaced before conversion begins."
        >
          <InputSurface
            accept={workflow.accept}
            fileError={workflow.fileError}
            onFileSelection={workflow.handleFileSelection}
            selectedFile={workflow.selectedFile}
          />
        </SectionCard>

        <SectionCard
          eyebrow="02"
          title="Voice"
          description="Choose a target voice before the start action becomes meaningful."
        >
          <VoiceSettings
            chunkSizeText={workflow.chunkSizeText}
            dictionaryMode={workflow.dictionaryMode}
            onChunkSizeChange={workflow.handleChunkSizeChange}
            onDictionaryModeChange={workflow.handleDictionaryModeChange}
            onSpeedChange={workflow.handleSpeedChange}
            onVoiceChange={workflow.handleVoiceChange}
            selectedVoice={workflow.selectedVoice}
            settingsError={workflow.settingsError}
            speed={workflow.speed}
            supportedVoices={workflow.supportedVoices}
          />
        </SectionCard>

        <SectionCard
          eyebrow="03"
          title="Settings"
          description="Conversion controls are grouped together for a clean preflight check."
          className="settings-panel"
        >
          <div className="settings-grid">
            <div className="setting-row">
              <span className="setting-label">File readiness</span>
              <strong className="setting-value">{workflow.statusSummary}</strong>
            </div>
            <div className="setting-row">
              <span className="setting-label">Voice readiness</span>
              <strong className="setting-value">{workflow.voiceSummary}</strong>
            </div>
            <div className="setting-row">
              <span className="setting-label">Control readiness</span>
              <strong className="setting-value">{workflow.settingsSummary}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="04"
          title="Status"
          description="The shell exposes readiness and validation state explicitly."
          className="status-panel"
        >
          <div className="status-stack">
            <div className={`status-line ${workflow.canStart ? 'ready' : 'blocked'}`}>
              {workflow.canStart ? 'Ready to start conversion.' : 'Start conversion is blocked.'}
            </div>
            <ul className="status-notes">
              <li>{workflow.statusSummary}</li>
              <li>{workflow.voiceSummary}</li>
              <li>{workflow.settingsSummary}</li>
            </ul>
            <button type="button" className="start-button" disabled={!workflow.canStart}>
              Start conversion
            </button>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
