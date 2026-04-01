import React, { useState } from 'react';
import { voices, multilingualVoices, standardVoices } from '../workflow/voices';
import { EdgeTtsService } from '../workflow/edgeTtsService';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  speed: string;
  pitch: string;
  volume: string;
  selectedSourceFile: File | null;
  rawTextInput: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange, 
  speed, 
  pitch, 
  volume,
  selectedSourceFile,
  rawTextInput
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handlePreview = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    
    let textToRead = "Hello, this is a sample of my voice. I hope you find it satisfying.";

    if (selectedSourceFile) {
      if (selectedSourceFile.name.toLowerCase().endsWith('.txt')) {
        try {
          const chunk = selectedSourceFile.slice(0, 1000); // Only read first 1KB
          const chunkText = await chunk.text();
          const cleanText = chunkText.replace(/\s+/g, ' ').trim();
          if (cleanText.length > 0) {
            // Find first two sentences or take the first 150 chars
            const sentences = cleanText.match(/.*?[.!?]+(\s|$)/g) || [];
            if (sentences.length > 0 && (sentences[0] || '').length > 5) {
              textToRead = sentences.slice(0, 2).join(' ').trim();
            } else {
              textToRead = cleanText.slice(0, 150).trim();
            }
          }
        } catch (e) {
          console.warn("Could not extract preview text:", e);
        }
      } else {
        textToRead = `This voice will be used to narrate your file, ${selectedSourceFile.name}.`;
      }
    } else if (rawTextInput && rawTextInput.trim().length > 0) {
      const cleanText = rawTextInput.replace(/\s+/g, ' ').trim();
      if (cleanText.length > 0) {
        const sentences = cleanText.match(/.*?[.!?]+(\s|$)/g) || [];
        if (sentences.length > 0 && (sentences[0] || '').length > 5) {
          textToRead = sentences.slice(0, 2).join(' ').trim();
        } else {
          textToRead = cleanText.slice(0, 150).trim();
        }
      }
    }

    const service = new EdgeTtsService();
    try {
      await service.connect();
      const audioData = await service.send({
        text: textToRead,
        voice: selectedVoice,
        pitch: pitch === 'Normal' ? '+0Hz' : pitch === 'Low' ? '-25Hz' : pitch === 'Very Low' ? '-50Hz' : pitch === 'High' ? '+25Hz' : '+50Hz',
        rate: speed === 'Normal' ? '+0%' : speed === 'Slow' ? '-15%' : speed === 'Very Slow' ? '-30%' : speed === 'Fast' ? '+15%' : '+30%',
        volume: volume === 'Normal' ? '+0%' : volume === 'Soft' ? '-30%' : '+30%'
      });
      
      const blob = new Blob([audioData as any], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsPreviewing(false);
      };
      await audio.play();
    } catch (err) {
      console.error('Preview failed:', err);
      setIsPreviewing(false);
    } finally {
      service.disconnect();
    }
  };

  const currentLabel = voices.find(v => v.value === selectedVoice)?.label || "Select Voice";

  const renderOption = (v: any) => (
    <div 
      key={v.value} 
      className={`custom-select-option ${selectedVoice === v.value ? 'is-selected' : ''}`}
      onClick={() => {
        onVoiceChange(v.value);
        setIsOpen(false);
      }}
    >
      {v.label} ({v.locale || 'en-US'}, {v.gender})
    </div>
  );

  return (
    <div className="control-group">
      <label className="label-row">
        <span>Target Voice</span>
        <span className="value-display">{selectedVoice.split('-').pop()?.replace('Neural', '')}</span>
      </label>
      
      <div style={{ display: 'flex', gap: 'var(--space-2)', position: 'relative' }}>
        <div className={`custom-select-container ${isOpen ? 'is-open' : ''}`}>
          <div 
            className="custom-select-trigger" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{currentLabel}</span>
          </div>
          
          {isOpen && (
            <div className="custom-select-menu">
              <div className="custom-select-group-title">✨ Multilingual</div>
              {multilingualVoices.map(renderOption)}
              
              <div className="custom-select-group-title">🇺🇸 US English</div>
              {standardVoices.filter(v => v.locale === 'en-US').map(renderOption)}
              
              <div className="custom-select-group-title">🇬🇧 UK English</div>
              {standardVoices.filter(v => v.locale === 'en-GB').map(renderOption)}
              
              <div className="custom-select-group-title">🌍 Other</div>
              {standardVoices.filter(v => !['en-US', 'en-GB'].includes(v.locale)).map(renderOption)}
            </div>
          )}
        </div>
        
        <button 
          className="voice-preview-btn" 
          onClick={handlePreview}
          disabled={isPreviewing}
          aria-label={isPreviewing ? 'Preview loading' : 'Play voice sample'}
          style={{ 
            opacity: isPreviewing ? 0.5 : 1,
            cursor: isPreviewing ? 'wait' : 'pointer',
            height: '38px',
            width: '38px'
          }}
        >
          {isPreviewing ? '⏳' : '▶'}
        </button>
      </div>
    </div>
  );
};
