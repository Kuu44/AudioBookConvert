import React from 'react';
import { CustomNumberInput } from './CustomNumberInput';

interface ControlSlidersProps {
  speed: string;
  onSpeedChange: (speed: string) => void;
  pitch: string;
  onPitchChange: (pitch: string) => void;
  volume: string;
  onVolumeChange: (volume: string) => void;
  chunkSize: string;
  onChunkSizeChange: (chunkSize: string) => void;
  ttsThreads: number;
  onTtsThreadsChange: (threads: number) => void;
  autoPilot: boolean;
  onAutoPilotChange: (autoPilot: boolean) => void;
  performanceTier: 'turbo' | 'standard' | 'stability';
  onPerformanceTierChange: (tier: 'turbo' | 'standard' | 'stability') => void;
  showAdvanced: boolean;
  onShowAdvancedChange: (show: boolean) => void;
}

export const ControlSliders: React.FC<ControlSlidersProps> = ({
  speed, onSpeedChange,
  pitch, onPitchChange,
  volume, onVolumeChange,
  ttsThreads, onTtsThreadsChange,
  chunkSize, onChunkSizeChange,
  autoPilot, onAutoPilotChange,
  performanceTier, onPerformanceTierChange,
  showAdvanced, onShowAdvancedChange
}) => {
  const speeds = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
  const pitches = ['Very Low', 'Low', 'Normal', 'High', 'Very High'];
  const volumes = ['Soft', 'Normal', 'Loud'];

  return (
    <div className="settings-panel">
      <div className="control-group">
        <label className="label-row">
          <span>Speed</span>
          <span className="value-display">{speed}</span>
        </label>
        <input
          type="range"
          min="0" max="4" step="1"
          value={speeds.indexOf(speed)}
          aria-label="Adjust narration speed"
          onChange={(e) => onSpeedChange(speeds[parseInt(e.target.value)])}
        />
      </div>

      <div className="control-group">
        <label className="label-row">
          <span>Pitch</span>
          <span className="value-display">{pitch}</span>
        </label>
        <input
          type="range"
          min="0" max="4" step="1"
          value={pitches.indexOf(pitch)}
          aria-label="Adjust voice pitch"
          onChange={(e) => onPitchChange(pitches[parseInt(e.target.value)])}
        />
      </div>

      <div className="control-group">
        <label className="label-row">
          <span>Volume</span>
          <span className="value-display">{volume}</span>
        </label>
        <input
          type="range"
          min="0" max="2" step="1"
          value={volumes.indexOf(volume)}
          aria-label="Adjust output volume"
          onChange={(e) => onVolumeChange(volumes[parseInt(e.target.value)])}
        />
      </div>

      <div style={{ 
        marginTop: 'var(--space-6)', 
        paddingTop: 'var(--space-4)', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Auto-Pilot Mode</span>
            {autoPilot && <span className="badge" style={{ background: 'var(--accent)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>Recommended</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={autoPilot} 
                onChange={(e) => onAutoPilotChange(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
            <button 
              type="button"
              onClick={() => onShowAdvancedChange(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: showAdvanced ? 'var(--accent)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease'
              }}
              title="Advanced Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
          </div>
        </div>

        {autoPilot && (
          <div className="tier-selector" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {(['stability', 'standard', 'turbo'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => onPerformanceTierChange(tier)}
                style={{
                  padding: '12px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: performanceTier === tier ? 'var(--accent)' : 'transparent',
                  background: performanceTier === tier ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                  color: performanceTier === tier ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{tier}</span>
                <span style={{ fontSize: '9px', fontWeight: 400, opacity: 0.6 }}>
                  {tier === 'turbo' ? '48 Cores' : tier === 'standard' ? '24 Cores' : '12 Cores'}
                </span>
              </button>
            ))}
          </div>
        )}

        {showAdvanced && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
            <div className="control-group" style={{ flex: 1 }}>
              <label className="label-row" style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                Workers
              </label>
              <CustomNumberInput
                value={ttsThreads}
                min={1} max={64}
                onChange={onTtsThreadsChange}
                ariaLabel="Number of parallel synthesis workers"
                disabled={autoPilot}
              />
            </div>
            <div className="control-group" style={{ flex: 1 }}>
              <label className="label-row" style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                Chunk size
              </label>
              <CustomNumberInput
                value={chunkSize}
                min={400} max={12000} step={100}
                onChange={(val) => onChunkSizeChange(val.toString())}
                ariaLabel="Number of characters per synthesis request"
                disabled={autoPilot}
              />
            </div>
          </div>
        )}
      </div>

      {/* Optimization Tips Info Box */}
      <div style={{
        marginTop: 'var(--space-6)',
        padding: 'var(--space-3)',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        lineHeight: '1.4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          💡 Optimization Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Auto-Pilot:</strong> Optimized for stability. Turbo mode uses 48 parallel workers for maximum synthesis speed.
          </div>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Crash-Resilient:</strong> All progress is saved automatically to local storage. If Edge crashes, just reload and re-select the file to resume!
          </div>
        </div>
      </div>
    </div>
  );
};
