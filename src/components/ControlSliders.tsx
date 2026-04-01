import React from 'react';
import { CustomNumberInput } from './CustomNumberInput';

interface ControlSlidersProps {
  speed: string;
  onSpeedChange: (speed: string) => void;
  pitch: string;
  onPitchChange: (pitch: string) => void;
  volume: string;
  onVolumeChange: (volume: string) => void;
  ttsThreads: number;
  onTtsThreadsChange: (threads: number) => void;
  chunkSize: string;
  onChunkSizeChange: (chunkSize: string) => void;
}

export const ControlSliders: React.FC<ControlSlidersProps> = ({
  speed, onSpeedChange,
  pitch, onPitchChange,
  volume, onVolumeChange,
  ttsThreads, onTtsThreadsChange,
  chunkSize, onChunkSizeChange
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

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <div className="control-group" style={{ flex: 1 }}>
          <label className="label-row" style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>Parallel Workers</label>
          <span style={{ fontSize: '9px', opacity: 0.5, fontWeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            1 worker = 1 CPU core. More = Quicker conversion
          </span>
          <CustomNumberInput
            value={ttsThreads}
            min={1} max={15}
            onChange={onTtsThreadsChange}
            ariaLabel="Number of parallel synthesis workers"
          />
        </div>
        <div className="control-group" style={{ flex: 1 }}>
          <label className="label-row" style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <span>Chunk Size</span>
            <span style={{ fontSize: '9px', opacity: 0.5, fontWeight: 400 }}>
              {chunkSize} chars (~{Math.round(Number(chunkSize) * 0.06)}MB x {ttsThreads} workers = {Math.round(Number(chunkSize) * 0.06 * ttsThreads) > 1024 ? `${(Math.round(Number(chunkSize) * 0.06 * ttsThreads) / 1024).toFixed(2)} GB` : `${Math.round(Number(chunkSize) * 0.06 * ttsThreads)} MB`} RAM)
            </span>
          </label>
          <CustomNumberInput
            value={chunkSize}
            min={400} max={12000} step={100}
            onChange={(val) => onChunkSizeChange(val.toString())}
            ariaLabel="Number of characters per synthesis request"
          />
        </div>
      </div>

      {/* Optimization Tips Info Box */}
      <div style={{
        marginTop: 'var(--space-2)',
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
            <strong style={{ color: 'var(--text-secondary)' }}>Parallel Workers:</strong> Set to match your CPU cores. Modern PCs (4-8+ cores) work best with 6-12 workers for maximum speed.
          </div>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Chunk Size:</strong> Controls RAM usage per worker. <strong>4000-8000</strong> chars is the sweet spot.
          </div>
        </div>
      </div>
    </div>
  );
};
