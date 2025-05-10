import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  label,
}) => {
  const handleClick = (rating: number) => {
    // Toggle off if clicking the same star
    onChange(rating === value ? 0 : rating);
  };
  
  const sizes = {
    sm: { star: 16, spacing: 1 },
    md: { star: 24, spacing: 2 },
    lg: { star: 32, spacing: 3 },
  };
  
  const { star: starSize, spacing } = sizes[size];
  
  return (
    <div className="flex flex-col">
      {label && (
        <span className="text-sm font-medium text-bread-dark-moss-green mb-1">{label}</span>
      )}
      <div className="flex items-center">
        {[...Array(max)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= value;
          
          return (
            <motion.button
              key={`star-${index}`}
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => handleClick(starValue)}
              className={`focus:outline-none mr-${spacing}`}
              style={{ color: isFilled ? '#dda15e' : '#606c38' }}
              aria-label={`Rate ${starValue} of ${max}`}
            >
              <Star 
                size={starSize} 
                fill={isFilled ? '#dda15e' : 'none'} 
              />
            </motion.button>
          );
        })}
        
        <span className="ml-2 text-sm text-bread-pakistan-green">
          {value > 0 ? value : ''}
        </span>
      </div>
    </div>
  );
};

export default StarRating;