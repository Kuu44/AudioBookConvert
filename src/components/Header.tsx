import React from 'react';

interface HeaderProps {
  status: string;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 'var(--space-6)',
      padding: 'var(--space-2) 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: '1.5rem' }}>🎧</span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AudioBookConvert</h1>
        <span style={{ 
          fontSize: 'var(--text-xs)', 
          color: 'var(--text-tertiary)', 
          letterSpacing: '0.05em', 
          textTransform: 'uppercase',
          marginLeft: 'var(--space-2)',
          marginTop: '4px'
        }}>
          Text-to-Speech v2
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '6px 12px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status === 'Ready' ? 'var(--success)' : 
                      status === 'Calculating' ? '#fbbf24' : // Amber/Yellow
                      status === 'Processing' ? '#3b82f6' :  // Blue
                      status === 'Error' ? 'var(--error)' : 'var(--text-tertiary)',
          boxShadow: status === 'Ready' ? '0 0 8px var(--success)' : 
                     status === 'Calculating' ? '0 0 8px #fbbf24' : 
                     status === 'Processing' ? '0 0 8px #3b82f6' : 'none',
          transition: 'all 0.3s'
        }} />
        {status}
      </div>
    </header>
  );
};
