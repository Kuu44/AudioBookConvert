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
          <label className="label-row" style={{ fontSize: 'var(--text-xs)' }}>TTS Threads</label>
          <CustomNumberInput 
            value={ttsThreads}
            min={1} max={15}
            onChange={onTtsThreadsChange}
            ariaLabel="Number of parallel TTS workers"
          />
        </div>
        <div className="control-group" style={{ flex: 1 }}>
          <label className="label-row" style={{ fontSize: 'var(--text-xs)' }}>Chunk Size</label>
          <CustomNumberInput 
            value={chunkSize}
            min={400} max={12000} step={100}
            onChange={(val) => onChunkSizeChange(val.toString())}
            ariaLabel="Number of characters per synthesis request"
          />
        </div>
      </div>
    </div>
  );
};
