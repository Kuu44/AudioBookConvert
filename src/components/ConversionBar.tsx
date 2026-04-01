import React from 'react';
import { ProgressBar } from './ProgressBar';

interface ConversionBarProps {
  onStart: () => void;
  isRunning: boolean;
  canStart: boolean;
  progress: { completed: number; total: number };
  eta: string | null;
  sessionProgress?: number;
  showResumePrompt?: boolean;
  onClearSession?: () => void;
}

export const ConversionBar: React.FC<ConversionBarProps> = ({
  onStart, isRunning, canStart, progress, eta, sessionProgress = 0, showResumePrompt = false, onClearSession
}) => {
  return (
    <div className="conversion-bar">
      <div className="bar-content">
        {isRunning ? (
          <ProgressBar 
            completed={progress.completed} 
            total={progress.total} 
            eta={eta} 
          />
        ) : (
          <div style={{ flex: 1, color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            {!canStart ? '⚠️ Select a file and voice to unlock conversion' : '✨ Configuration ready. Headset on?'}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {showResumePrompt && (
            <button 
              type="button" 
              onClick={onClearSession}
              style={{
                background: 'none', border: 'none', color: 'var(--text-tertiary)', 
                fontSize: '10px', textDecoration: 'underline', cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              Clear saved progress
            </button>
          )}
          <button 
            className="start-btn" 
            onClick={onStart}
            disabled={!canStart || isRunning}
            style={{
              minWidth: '200px',
              background: isRunning ? 'var(--bg-elevated)' : 'var(--accent-gradient)',
              color: isRunning ? 'var(--text-tertiary)' : 'white'
            }}
          >
            {isRunning ? 'Processing...' : (showResumePrompt ? `Resume (${sessionProgress} saved)` : 'Start Conversion')}
          </button>
        </div>
      </div>
    </div>
  );
};
