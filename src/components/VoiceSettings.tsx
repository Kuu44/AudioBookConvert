import type {
  SupportedSpeedValue,
  SupportedVoiceValue
} from '../workflow/useWorkflowState';

export function VoiceSettings({
  chunkSizeText,
  dictionaryMode,
  onChunkSizeChange,
  onDictionaryModeChange,
  onSpeedChange,
  onVoiceChange,
  selectedVoice,
  settingsError,
  speed,
  supportedVoices
}: {
  chunkSizeText: string;
  dictionaryMode: boolean;
  onChunkSizeChange: (value: string) => void;
  onDictionaryModeChange: (checked: boolean) => void;
  onSpeedChange: (value: string) => void;
  onVoiceChange: (value: string) => void;
  selectedVoice: string;
  settingsError: string | null;
  speed: SupportedSpeedValue;
  supportedVoices: ReadonlyArray<{ value: SupportedVoiceValue; label: string }>;
}) {
  return (
    <div className="voice-settings">
      <fieldset className="control-block">
        <legend>Voice</legend>
        <label className="field">
          <span className="field-label">Target voice</span>
          <select
            aria-label="Target voice"
            className="select-input"
            value={selectedVoice}
            onChange={(event) => onVoiceChange(event.currentTarget.value)}
          >
            <option value="">Select a voice</option>
            {supportedVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="control-block">
        <legend>Conversion settings</legend>
        <label className="field">
          <span className="field-label">Chunk size</span>
          <input
            aria-label="Chunk size"
            className="number-input"
            inputMode="numeric"
            min={400}
            max={4000}
            type="number"
            value={chunkSizeText}
            onChange={(event) => onChunkSizeChange(event.currentTarget.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Conversion speed</span>
          <select
            aria-label="Conversion speed"
            className="select-input"
            value={speed}
            onChange={(event) => onSpeedChange(event.currentTarget.value)}
          >
            <option value="Slow">Slow</option>
            <option value="Normal">Normal</option>
            <option value="Fast">Fast</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input
            checked={dictionaryMode}
            type="checkbox"
            onChange={(event) => onDictionaryModeChange(event.currentTarget.checked)}
          />
          <span>Dictionary mode</span>
        </label>
      </fieldset>

      <div className="control-summary" aria-label="Control summary">
        <p className="summary-title">Current controls</p>
        <ul className="status-notes compact">
          <li>Voice: {selectedVoice || 'none selected'}</li>
          <li>Chunk size: {chunkSizeText}</li>
          <li>Speed: {speed}</li>
          <li>Dictionary mode: {dictionaryMode ? 'on' : 'off'}</li>
        </ul>
      </div>

      {settingsError ? (
        <p className="field-error" role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
