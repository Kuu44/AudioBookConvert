import React from 'react';
import { ProgressBar } from './ProgressBar';

interface ConversionBarProps {
  onStart: () => void;
  isRunning: boolean;
  canStart: boolean;
  progress: { completed: number; total: number };
  eta: string | null;
}

export const ConversionBar: React.FC<ConversionBarProps> = ({
  onStart, isRunning, canStart, progress, eta
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
          {isRunning ? 'Processing...' : 'Start Conversion'}
        </button>
      </div>
    </div>
  );
};
