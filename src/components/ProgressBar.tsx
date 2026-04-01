import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  eta: string | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, eta }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="label-row" style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
          {completed}/{total} chunks ({percentage}%)
        </span>
        <span style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>{eta}</span>
      </div>
      <div className="progress-轨道" style={{ height: '10px' }}>
        <div 
          className="progress-bar" 
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
