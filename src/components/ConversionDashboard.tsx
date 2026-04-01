import React, { useEffect, useState } from 'react';
import { ProcessingIndicator } from './ProcessingIndicator';
import { ProgressBar } from './ProgressBar';

const snarkyTexts = [
  "Teaching the AI to read...",
  "Bribing the voice actors...",
  "Compressing audio matter...",
  "Synthesizing sonic waves...",
  "Tuning the pitch forks...",
  "Clearing throat parameters...",
  "Summoning the narrator ghost...",
];

interface ConversionDashboardProps {
  progress: { completed: number; total: number };
  eta: string | null;
  selectedFile: { name: string; extension: string; size: number } | null;
  selectedVoice: string;
  speed: string;
}

export const ConversionDashboard: React.FC<ConversionDashboardProps> = ({ 
  progress, eta, selectedFile, selectedVoice, speed 
}) => {
  const [snarkyIndex, setSnarkyIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSnarkyIndex(prev => (prev + 1) % snarkyTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isCalculating = progress.total === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-6)',
      padding: 'var(--space-8) 0',
      minHeight: '60vh',
      animation: 'fade-in 0.8s var(--ease-out)'
    }}>
      {/* File Context Header */}
      <div className="glass-card" style={{ 
        display: 'flex', 
        gap: 'var(--space-4)', 
        alignItems: 'center', 
        padding: 'var(--space-3) var(--space-6)',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ fontSize: '1.5rem' }}>🎙️</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            {selectedFile?.name || "Text Snippet"}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {selectedVoice.split('-').pop()} • {speed} Speed
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        <ProcessingIndicator />
        <div style={{ 
          color: 'var(--accent)', 
          fontSize: 'var(--text-base)', 
          fontWeight: 600,
          opacity: 0.9,
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          {snarkyTexts[snarkyIndex]}
        </div>
      </div>

      {isCalculating ? (
        <div style={{
          padding: 'var(--space-4)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>
          Calculating optimal chunks...
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <ProgressBar completed={progress.completed} total={progress.total} eta={eta} />
        </div>
      )}
    </div>
  );
};
