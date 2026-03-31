import type { ReactNode } from 'react';

const supportedFormats = ['TXT', 'FB2', 'EPUB', 'ZIP'];
const voices = [
  'en-US-AriaNeural',
  'en-US-GuyNeural',
  'en-GB-LibbyNeural'
];
const settings = [
  { label: 'Chunk size', value: '1,200 chars' },
  { label: 'Speed', value: 'Normal' },
  { label: 'Dictionary mode', value: 'On' }
];

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
        <div className="hero-status" role="status" aria-live="polite">
          Shell mounted. Waiting for an upload, a voice, and conversion settings.
        </div>
      </header>

      <div className="workflow-grid">
        <SectionCard
          eyebrow="01"
          title="Upload"
          description="Supported inputs are surfaced before conversion begins."
        >
          <div className="upload-surface" aria-label="Upload surface">
            <div className="upload-cta">
              <span className="upload-title">Drop files here</span>
              <span className="upload-copy">or browse for a source file.</span>
            </div>
            <div className="format-list" aria-label="Supported formats">
              {supportedFormats.map((format) => (
                <span key={format} className="format-pill">
                  {format}
                </span>
              ))}
            </div>
            <p className="hint">Accepted source types: TXT, FB2, EPUB, and ZIP.</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="02"
          title="Voice"
          description="Choose a target voice before the start action becomes meaningful."
        >
          <div className="voice-list" role="list" aria-label="Available voices">
            {voices.map((voice, index) => (
              <article key={voice} className={`voice-card${index === 0 ? ' selected' : ''}`} role="listitem">
                <p className="voice-name">{voice}</p>
                <p className="voice-meta">{index === 0 ? 'Default selection' : 'Available option'}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="03"
          title="Settings"
          description="Conversion controls are grouped together for a clean preflight check."
          className="settings-panel"
        >
          <div className="settings-grid">
            {settings.map((setting) => (
              <div key={setting.label} className="setting-row">
                <span className="setting-label">{setting.label}</span>
                <strong className="setting-value">{setting.value}</strong>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="04"
          title="Status"
          description="The shell exposes readiness and validation state explicitly."
          className="status-panel"
        >
          <div className="status-stack">
            <div className="status-line ready">Ready to configure conversion.</div>
            <ul className="status-notes">
              <li>No file selected.</li>
              <li>No voice locked in yet.</li>
              <li>No conversion changes applied.</li>
            </ul>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
