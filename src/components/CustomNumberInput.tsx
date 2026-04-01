import React from 'react';

interface CustomNumberInputProps {
  value: number | string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value, min, max, step = 1, onChange, ariaLabel, disabled = false
}) => {
  const numValue = typeof value === 'string' ? parseInt(value) || min : value;

  const handleDecrement = () => {
    if (numValue > min) onChange(numValue - step);
  };

  const handleIncrement = () => {
    if (numValue < max) onChange(numValue + step);
  };

  return (
    <div className="number-input-container">
      <button 
        type="button"
        className="number-input-btn" 
        onClick={handleDecrement}
        disabled={disabled || numValue <= min}
        style={{ opacity: (disabled || numValue <= min) ? 0.3 : 1 }}
        aria-label={`Decrease ${ariaLabel}`}
      >
        −
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        aria-label={ariaLabel}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'auto' }}
      />
      <button 
        type="button"
        className="number-input-btn" 
        onClick={handleIncrement}
        disabled={disabled || numValue >= max}
        style={{ opacity: (disabled || numValue >= max) ? 0.3 : 1 }}
        aria-label={`Increase ${ariaLabel}`}
      >
        +
      </button>
    </div>
  );
};
