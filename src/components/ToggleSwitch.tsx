import React from 'react';

interface ToggleSwitchProps {
  active: boolean;
  onToggle: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ active, onToggle }) => {
  return (
    <div 
      className={`toggle-switch ${active ? 'active' : ''}`} 
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        width: '38px',
        height: '20px',
        borderRadius: '99px',
        backgroundColor: active ? 'var(--accent)' : 'var(--bg-elevated)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s var(--ease-spring)',
        border: '1px solid var(--border)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: active ? '20px' : '2px',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'all 0.2s var(--ease-spring)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
};
