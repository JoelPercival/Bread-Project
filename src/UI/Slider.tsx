import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Slider.module.css';

interface SliderProps {
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

const Slider: React.FC<SliderProps> = ({
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
      
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-bread-brown-200 rounded-full">
          <div
            className="h-full bg-bread-crust rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className={`${styles.slider} w-full h-6 cursor-pointer`}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'var(--tw-bg-color, #f5e6ca)', // fallback for track
            height: '6px',
            width: '100%',
            outline: 'none',
            margin: 0,
            padding: 0,
            color: 'var(--tw-bg-color)',
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-bread-brown-600 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;