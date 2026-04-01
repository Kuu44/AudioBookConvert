import React from 'react';
import { ToggleSwitch } from './ToggleSwitch';

interface ProcessingSettingsProps {
  options: {
    removeSilence: boolean;
    normalize: boolean;
    compressor: boolean;
    fadeIn: boolean;
    eq: boolean;
    deEss: boolean;
  };
  onToggle: (option: keyof ProcessingSettingsProps['options']) => void;
  gapMs: number;
  onGapChange: (gap: number) => void;
  streamToDisk: boolean;
  onStreamChange: (stream: boolean) => void;
}

export const ProcessingSettings: React.FC<ProcessingSettingsProps> = ({
  options, onToggle, gapMs, onGapChange, streamToDisk, onStreamChange
}) => {
  return (
    <div className="processing-settings" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="toggle-grid">
        <div className={`toggle-card ${options.removeSilence ? 'active' : ''}`} onClick={() => onToggle('removeSilence')}>
          <div className="toggle-info">
            <span>🔇 Remove Silence</span>
            <span>Trims pause gaps</span>
          </div>
          <ToggleSwitch active={options.removeSilence} onToggle={() => onToggle('removeSilence')} />
        </div>

        <div className={`toggle-card ${options.normalize ? 'active' : ''}`} onClick={() => onToggle('normalize')}>
          <div className="toggle-info">
            <span>📊 Normalize</span>
            <span>Uniform volume</span>
          </div>
          <ToggleSwitch active={options.normalize} onToggle={() => onToggle('normalize')} />
        </div>

        <div className={`toggle-card ${options.compressor ? 'active' : ''}`} onClick={() => onToggle('compressor')}>
          <div className="toggle-info">
            <span>🎚️ Compressor</span>
            <span>Rich voice depth</span>
          </div>
          <ToggleSwitch active={options.compressor} onToggle={() => onToggle('compressor')} />
        </div>

        <div className={`toggle-card ${options.fadeIn ? 'active' : ''}`} onClick={() => onToggle('fadeIn')}>
          <div className="toggle-info">
            <span>🔊 Fade-In</span>
            <span>Smooth start</span>
          </div>
          <ToggleSwitch active={options.fadeIn} onToggle={() => onToggle('fadeIn')} />
        </div>

        <div className={`toggle-card ${options.eq ? 'active' : ''}`} onClick={() => onToggle('eq')}>
          <div className="toggle-info">
            <span>🎛️ EQ (Broadcast)</span>
            <span>Pro studio feel</span>
          </div>
          <ToggleSwitch active={options.eq} onToggle={() => onToggle('eq')} />
        </div>

        <div className={`toggle-card ${options.deEss ? 'active' : ''}`} onClick={() => onToggle('deEss')}>
          <div className="toggle-info">
            <span>✨ De-Ess</span>
            <span>Clean 's' sounds</span>
          </div>
          <ToggleSwitch active={options.deEss} onToggle={() => onToggle('deEss')} />
        </div>
      </div>

      <div className="control-group">
        <label className="label-row">
          <span>Gap Between Chunks</span>
          <span className="value-display">{gapMs}ms</span>
        </label>
        <input 
          type="range" 
          min="0" max="500" step="10" 
          value={gapMs} 
          onChange={(e) => onGapChange(parseInt(e.target.value))}
        />
      </div>

      <div className={`toggle-card ${streamToDisk ? 'active' : ''}`} onClick={() => onStreamChange(!streamToDisk)}>
        <div className="toggle-info">
          <span>💾 Stream to Disk</span>
          <span>For very large audiobooks</span>
        </div>
        <ToggleSwitch active={streamToDisk} onToggle={() => onStreamChange(!streamToDisk)} />
      </div>
    </div>
  );
};
