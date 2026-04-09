import React from 'react';
import { type ConversionArtifact } from '../workflow/convertToAudio';

interface SuccessScreenProps {
  artifact: ConversionArtifact | null;
  onReset: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ artifact, onReset }) => {
  if (!artifact) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let current = bytes / 1024;
    let unitIndex = 0;
    while (current >= 1024 && unitIndex < units.length - 1) {
      current /= 1024;
      unitIndex++;
    }
    return `${current.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-6)',
      padding: 'var(--space-8) 0',
      minHeight: '60vh',
      animation: 'fade-in 0.8s var(--ease-out)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'rgba(52, 211, 153, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem',
        color: 'var(--success)',
        marginBottom: 'var(--space-2)'
      }}>
        ✓
      </div>
      
      <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Audiobook Created!</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '500px' }}>
        Your majestic audio file is ready for your ears.
      </p>

      {/* Stats Box */}
      <div className="glass-card" style={{
        marginTop: 'var(--space-4)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-4)',
        textAlign: 'left',
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.03)'
      }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Name</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artifact.downloadName}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Size</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--success)' }}>{formatSize(artifact.size)}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voice Persona</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artifact.voice.split('-').pop()}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pacing</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artifact.speed}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chunks Synced</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artifact.chunkCount} internal segments</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MIME</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{artifact.mimeType} / MP3</div>
        </div>
      </div>

      <div className="glass-card" style={{
        marginTop: 'var(--space-2)',
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(96, 165, 250, 0.18)',
        padding: 'var(--space-4)',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Cleanup</div>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
          {artifact.sourceCleanup.removedParagraphBlocks > 0
            ? `${artifact.sourceCleanup.removedParagraphBlocks} repeated block${artifact.sourceCleanup.removedParagraphBlocks === 1 ? '' : 's'} removed`
            : 'No repeated passage blocks detected'}
        </div>
        <div style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
          {artifact.sourceCleanup.removedWordCount > 0
            ? `${artifact.sourceCleanup.removedWordCount} words were removed before synthesis.`
            : 'The cleaned text was passed through unchanged before synthesis.'}
        </div>
        <div style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
          Word-safe chunking stayed enabled for the full conversion.
        </div>
        {artifact.sourceCleanup.repeatedBlockSamples.length > 0 && (
          <div style={{ marginTop: 'var(--space-3)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
            Example removed block: “{artifact.sourceCleanup.repeatedBlockSamples[0].preview}” <span style={{ color: 'var(--text-secondary)' }}>×{artifact.sourceCleanup.repeatedBlockSamples[0].occurrences}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <button 
          onClick={onReset}
          className="start-btn"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', minWidth: '160px' }}
        >
          Finish & Convert Another
        </button>

        <a 
          href={artifact.url} 
          download={artifact.downloadName}
          className="start-btn"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success)', minWidth: '160px', fontWeight: 700 }}
        >
          ⬇️ Save Audiobook
        </a>
      </div>
    </div>
  );
};
