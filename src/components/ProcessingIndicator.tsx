import React from 'react';

export const ProcessingIndicator: React.FC = () => {
  return (
    <div className="hero-animation-container">
      <div className="sonic-orb">
        <div className="sonic-ripple" />
        <div className="sonic-ripple" />
        <div className="sonic-ripple" />
        
        <div className="waveform-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="wave-bar" 
              style={{ 
                animationDelay: `${i * 0.1}s`,
                height: '14px',
                width: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '99px'
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
