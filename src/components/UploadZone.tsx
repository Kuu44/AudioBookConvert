import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (files: FileList | null) => void;
  selectedFile: { name: string; size: number; extension: string } | null;
  error: string | null;
  accept: string;
  textInput: string;
  onTextInputChange: (val: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, selectedFile, error, accept, textInput, onTextInputChange }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let current = bytes / 1024;
    let unitIndex = 0;
    while (current >= 1024 && unitIndex < units.length - 1) {
      current /= 1024;
      unitIndex++;
    }
    return `${current.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const submitText = () => {
    if (!textInput.trim()) return;
    const file = new File([textInput], "pasted_text.txt", { type: "text/plain" });
    const dt = new DataTransfer();
    dt.items.add(file);
    onFileSelect(dt.files);
  };

  return (
    <div className="pipeline-section" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--space-3)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>1. Preparation</h3>
        {!selectedFile && (
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-elevated)', 
            borderRadius: 'var(--radius-full)', 
            padding: '4px',
            border: '1px solid var(--border)'
          }}>
            <button 
              onClick={() => setMode('upload')}
              disabled={mode === 'upload'}
              style={{ 
                background: mode === 'upload' ? 'var(--accent)' : 'transparent',
                color: mode === 'upload' ? 'white' : 'var(--text-secondary)',
                border: 'none', borderRadius: 'var(--radius-full)', padding: '4px 16px', 
                cursor: mode === 'upload' ? 'default' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600
              }}>File</button>
            <button 
              onClick={() => setMode('text')}
              disabled={mode === 'text'}
              style={{ 
                background: mode === 'text' ? 'var(--accent)' : 'transparent',
                color: mode === 'text' ? 'white' : 'var(--text-secondary)',
                border: 'none', borderRadius: 'var(--radius-full)', padding: '4px 16px', 
                cursor: mode === 'text' ? 'default' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600
              }}>Text</button>
          </div>
        )}
      </div>
      
      {!selectedFile ? (
        mode === 'upload' ? (
          <div 
            className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              ref={inputRef}
              type="file" 
              accept={accept}
              onChange={(e) => onFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>📄</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Drop files here or click to browse</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              TXT · FB2 · EPUB · ZIP
            </div>
          </div>
        ) : (
          <div className="upload-zone" style={{ flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'stretch', cursor: 'default' }}>
            <textarea 
              value={textInput} 
              onChange={e => onTextInputChange(e.target.value)}
              placeholder="Paste or type your text here..."
              style={{ 
                width: '100%', minHeight: '180px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
                resize: 'vertical', fontFamily: 'inherit', outline: 'none', fontSize: 'var(--text-sm)'
              }}
            />
            <button 
              onClick={submitText}
              disabled={!textInput.trim()}
              style={{
                background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                padding: '10px 24px', cursor: textInput.trim() ? 'pointer' : 'not-allowed', alignSelf: 'flex-end',
                opacity: textInput.trim() ? 1 : 0.5, fontWeight: 600, fontSize: 'var(--text-sm)', transition: 'all 0.2s'
              }}
            >
              Use Text
            </button>
          </div>
        )
      ) : (
        <div className="file-info-bar">
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{selectedFile.name}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {selectedFile.extension.toUpperCase()} · {formatSize(selectedFile.size)}
            </div>
          </div>
          <button 
            onClick={() => {
              onFileSelect(null);
            }}
            aria-label="Remove selected file"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '8px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'var(--error)', 
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: 'var(--text-sm)'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
