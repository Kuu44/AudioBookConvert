import React from 'react';

interface CustomNumberInputProps {
  value: number | string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value, min, max, step = 1, onChange, ariaLabel
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
        disabled={numValue <= min}
        style={{ opacity: numValue <= min ? 0.3 : 1 }}
        aria-label={`Decrease ${ariaLabel}`}
      >
        −
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        aria-label={ariaLabel}
      />
      <button 
        type="button"
        className="number-input-btn" 
        onClick={handleIncrement}
        disabled={numValue >= max}
        style={{ opacity: numValue >= max ? 0.3 : 1 }}
        aria-label={`Increase ${ariaLabel}`}
      >
        +
      </button>
    </div>
  );
};
