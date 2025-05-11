import React from 'react';
import { BakeSession, Recipe } from '../../../types';
import Card from '../../../components/UI/Card';
import { Star, Clock, BookCopy } from 'lucide-react';

interface BakeCardProps {
  bake: BakeSession;
  recipe: Recipe;
  onClick: () => void;
}

const BakeCard: React.FC<BakeCardProps> = ({ bake, recipe, onClick }) => {
  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Calculate duration in hours and minutes
  const calculateDuration = () => {
    if (!bake.startTime || !bake.endTime) return 'N/A';
    
    const start = new Date(bake.startTime).getTime();
    const end = new Date(bake.endTime).getTime();
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;
  };
  
  // Calculate average rating
  const calculateAverageRating = () => {
    const { crumb, crust, flavor } = bake.ratings;
    const sum = crumb + crust + flavor;
    const count = 3;
    
    return sum > 0 ? (sum / count).toFixed(1) : 'N/A';
  };
  
  return (
    <Card interactive onClick={onClick}>
      <div className="aspect-w-16 aspect-h-9 bg-bread-brown-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-bread-brown-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.6 13.11l5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16 4.6 18.05 4.6 13.11Z"/>
              <path d="m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 6.5 2 8.5a7.71 7.71 0 0 0 2 4.83"/>
              <path d="M8 6c0-1.55.24-4-2-4-2 0-2.5 2.17-2.5 4"/>
              <path d="m14.5 13.5 2.29 1c.73.3 1.21.7 1.21 1.5v3.5c0 1.71-.5 2.5-2.5 2.5a7.71 7.71 0 0 1-4.83-2"/>
              <path d="M18 16c1.55 0 4-.24 4 2 0 2-2.17 2.5-4 2.5"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-bread-brown-800 line-clamp-1">
              {recipe.name}
            </h3>
            <p className="text-sm text-bread-pakistan-green">
              {formatDate(bake.created)}
            </p>
          </div>
          
          <div className="flex items-center bg-bread-brown-100 px-2 py-1 rounded">
            <Star size={14} className="text-bread-brown-500 mr-1" />
            <span className="text-sm font-medium text-bread-brown-800">
              {calculateAverageRating()}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <Clock size={14} className="text-bread-earth-yellow mr-1" />
            <span className="text-xs text-bread-pakistan-green">
              {calculateDuration()}
            </span>
          </div>
          
          <div className="flex items-center">
            <BookCopy size={14} className="text-bread-earth-yellow mr-1" />
            <span className="text-xs text-bread-pakistan-green">
              {recipe.hydration}% Hydration
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BakeCard;
