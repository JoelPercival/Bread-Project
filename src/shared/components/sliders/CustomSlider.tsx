import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './CustomSlider.css';

// Pakistan green color from the project's color palette
const PAKISTAN_GREEN = '#283618';

interface CustomSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  valueFormatter = (val) => val.toString(),
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  // Calculate percentage for background fill
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <label className="text-sm font-medium text-bread-brown-700">{label}</label>}
          {showValue && (
            <motion.span 
              key="slider-thumb" 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold bg-bread-crumb text-bread-brown-800 px-2 py-0.5 rounded"
            >
              {valueFormatter(localValue)}
            </motion.span>
          )}
        </div>
      )}
      
      <div className="relative" style={{ height: '24px' }}>
        {/* Custom track - explicitly styled */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            height: '4px',
            backgroundColor: '#E5D6B5', // bread-brown-200
            borderRadius: '9999px',
            zIndex: 1
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: '#8B5E34', // bread-crust
              borderRadius: '9999px'
            }}
          ></div>
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            background: 'transparent',
            cursor: 'pointer',
            zIndex: 2
          }}
          className="custom-slider-input"
          // Add a data attribute to reference in CSS
          data-thumb-color={PAKISTAN_GREEN}
        />
      </div>
      
      <div className="flex justify-between text-xs text-bread-brown-600 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default CustomSlider;
