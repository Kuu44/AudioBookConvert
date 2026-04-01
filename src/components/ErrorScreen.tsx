import React from 'react';

interface ErrorScreenProps {
  error: string | null;
  onReset: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onReset }) => {
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
        background: 'rgba(239, 68, 68, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem',
        color: 'var(--error)',
        marginBottom: 'var(--space-2)'
      }}>
        ⚠️
      </div>
      
      <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--error)' }}>Conversion Failed</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '500px' }}>
        We encountered a problem while trying to generate your audio.
      </p>

      {/* Error Details Box */}
      {error && (
        <div className="glass-card" style={{
          marginTop: 'var(--space-4)',
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid var(--error-border)',
          color: 'var(--error)',
          padding: 'var(--space-4)',
          textAlign: 'left',
          fontSize: 'var(--text-sm)',
          fontFamily: 'monospace',
          wordBreak: 'break-word',
          lineHeight: '1.5'
        }}>
          {error}
        </div>
      )}

      {/* Optimization Tip for Timeouts */}
      {(error?.toLowerCase().includes('timeout') || error?.includes('1007')) && (
        <div style={{
          maxWidth: '500px',
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-md)',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <strong>Tip for large files:</strong> The Microsoft Edge servers often drop connections if you send chunks that are too large. Try lowering your <strong>Chunk Size</strong> (e.g., to 4000) or reducing your <strong>Parallel Workers</strong>.
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <button 
          onClick={onReset}
          className="start-btn"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', minWidth: '160px' }}
        >
          Back to Configuration
        </button>
      </div>
    </div>
  );
};
