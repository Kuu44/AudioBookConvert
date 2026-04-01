import React from 'react';

interface OutputPanelProps {
  artifact: { url: string; downloadName: string; size: number; mimeType: string } | null;
  error: string | null;
  isRunning: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ artifact, error, isRunning }) => {
  if (!artifact && !error && !isRunning) return null;

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
    <div className="pipeline-section glass-card" style={{ marginTop: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>3. Final Output</h3>
      
      {isRunning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid var(--border)', 
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Synthesis in progress... Be patient for long books.
        </div>
      )}

      {artifact && (
        <div style={{ 
          background: 'var(--success-bg)', 
          border: '1px solid var(--success-border)', 
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '2px' }}>
              ✓ Audiobook Ready
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {artifact.downloadName} · {formatSize(artifact.size)}
            </div>
          </div>
          <a 
            href={artifact.url} 
            download={artifact.downloadName}
            className="start-btn"
            style={{ 
              textDecoration: 'none', 
              fontSize: '14px', 
              padding: '8px 20px',
              background: 'var(--success)'
            }}
          >
            Download Now
          </a>
        </div>
      )}

      {error && (
        <div style={{ 
          background: 'var(--error-bg)', 
          border: '1px solid var(--error-border)', 
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          color: 'var(--error)',
          fontSize: 'var(--text-sm)'
        }}>
          ⚠️ Error during conversion: {error}
        </div>
      )}
    </div>
  );
};
