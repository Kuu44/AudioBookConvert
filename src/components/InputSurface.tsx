import type { SelectedFileSummary } from '../workflow/useWorkflowState';

export function InputSurface({
  accept,
  selectedFile,
  fileError,
  onFileSelection
}: {
  accept: string;
  selectedFile: SelectedFileSummary | null;
  fileError: string | null;
  onFileSelection: (files: FileList | null) => void;
}) {
  return (
    <div className="upload-surface" aria-label="Upload surface">
      <div className="upload-cta">
        <span className="upload-title">Drop files here</span>
        <span className="upload-copy">or browse for a source file.</span>
      </div>

      <label className="file-picker">
        <span className="file-picker-label">Source file</span>
        <input
          aria-label="Source file"
          accept={accept}
          className="file-input"
          type="file"
          onChange={(event) => onFileSelection(event.currentTarget.files)}
        />
      </label>

      <div className="format-list" aria-label="Supported formats">
        {accept
          .split(', ')
          .map((format) => format.replace('.', '').toUpperCase())
          .map((format) => (
            <span key={format} className="format-pill">
              {format}
            </span>
          ))}
      </div>

      <p className="hint">Accepted source types: TXT, FB2, EPUB, and ZIP.</p>

      <div className="selection-summary" aria-label="Selected file summary">
        {selectedFile ? (
          <>
            <p className="summary-title">Selected file</p>
            <dl className="summary-grid">
              <div>
                <dt>Name</dt>
                <dd>{selectedFile.name}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{selectedFile.extension.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{selectedFile.size.toLocaleString()} bytes</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="summary-empty">No file selected.</p>
        )}
      </div>

      {fileError ? (
        <p className="field-error" role="alert">
          {fileError}
        </p>
      ) : null}
    </div>
  );
}
