import React, { useState } from 'react';
import { FlourType } from '../../../types';
import CustomSlider from '../../../components/UI/CustomSlider';
import Button from '../../../components/UI/Button';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlourTypeSelectorProps {
  flourTypes: FlourType[];
  onChange: (flourTypes: FlourType[]) => void;
  availableFlourTypes: FlourType[];
}

const FlourTypeSelector: React.FC<FlourTypeSelectorProps> = ({
  flourTypes,
  onChange,
  availableFlourTypes,
}) => {
  const [activeFlours, setActiveFlours] = useState<FlourType[]>(flourTypes);
  const [isValid, setIsValid] = useState(true);
  const [totalPercentage, setTotalPercentage] = useState(0);
  
  const calculateTotalPercentage = (flours: FlourType[]) => {
    return flours
      .filter(flour => flour.percentage > 0)
      .reduce((sum, flour) => sum + flour.percentage, 0);
  };

  const handlePercentageChange = (id: string, percentage: number) => {
    setActiveFlours(prevFlours => {
      const newFlours = prevFlours.map(flour =>
        flour.id === id ? { ...flour, percentage } : flour
      );
      
      const currentTotal = calculateTotalPercentage(newFlours);
      setTotalPercentage(currentTotal);
      
      // Update validation status
      const newIsValid = Math.abs(currentTotal - 100) < 0.1;
      setIsValid(newIsValid);
      
      // Update parent if percentages are valid or there are no active flours
      if (newIsValid || newFlours.every(flour => flour.percentage === 0)) {
        onChange(newFlours);
      }
      
      return newFlours;
    });
  };
  
  const handleRemoveFlour = (id: string) => {
    setActiveFlours(prevFlours =>
      prevFlours.map(flour =>
        flour.id === id ? { ...flour, percentage: 0 } : flour
      )
    );
  };
  
  const handleAddFlour = (flour: FlourType) => {
    // Check if this flour is already in the active flours
    const existingFlour = activeFlours.find(f => f.name === flour.name);
    
    if (existingFlour) {
      // If it exists but has 0%, set it to some default percentage
      setActiveFlours(prevFlours =>
        prevFlours.map(f =>
          f.id === existingFlour.id ? { ...f, percentage: 10 } : f
        )
      );
    } else {
      // Otherwise add it as a new flour type
      setActiveFlours(prevFlours => [
        ...prevFlours,
        { ...flour, percentage: 10, id: flour.id }
      ]);
    }
  };
  
  // Get flours that are active (percentage > 0)
  const visibleFlours = activeFlours.filter(flour => flour.percentage > 0);
  
  // Get flours that can be added (not already active)
  const addableFlours = availableFlourTypes.filter(
    flour => !visibleFlours.some(f => f.name === flour.name)
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Flour Types</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isValid ? 'text-green-500' : 'text-red-500'}`}>
            Total: {totalPercentage}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddFlour(addableFlours[0])}
            disabled={activeFlours.length >= availableFlourTypes.length}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Flour
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {visibleFlours.map((flour) => (
          <motion.div
            key={flour.id}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                  {flour.name}
                </label>
                <div className="relative">
                  <CustomSlider
                    value={flour.percentage}
                    onChange={(value: number) => handlePercentageChange(flour.id, value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    valueFormatter={(value: number) => `${value}%`}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveFlour(flour.id)}
                disabled={activeFlours.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!isValid && (
        <div className="flex items-center space-x-2">
          <p className="text-sm text-red-500">
            Flour percentages must add up to 100%. Try:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const total = calculateTotalPercentage(activeFlours);
              const remaining = 100 - total;
              const lastFlour = activeFlours[activeFlours.length - 1];
              if (lastFlour) {
                handlePercentageChange(lastFlour.id, remaining);
              }
            }}
          >
            Auto-fill last flour
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlourTypeSelector;
