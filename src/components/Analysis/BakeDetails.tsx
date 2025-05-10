import React from 'react';
import { BakeSession, Recipe } from '../../types';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { Star, Clock, ArrowLeft } from 'lucide-react';

interface BakeDetailsProps {
  bake: BakeSession;
  recipe: Recipe;
  onBack: () => void;
  onCloneRecipe: () => void;
}

const BakeDetails: React.FC<BakeDetailsProps> = ({
  bake,
  recipe,
  onBack,
  onCloneRecipe,
}) => {
  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format time from Date to readable string
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
      ? `${hours} hours ${minutes} minutes`
      : `${minutes} minutes`;
  };
  
  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        icon={<ArrowLeft size={16} />}
      >
        Back to Analysis
      </Button>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-serif text-2xl text-bread-brown-800">
              {recipe.name}
            </h2>
            <p className="text-bread-pakistan-green">
              {formatDate(bake.created)}
            </p>
          </div>
          
          <Button
            variant="secondary"
            onClick={onCloneRecipe}
          >
            Clone & Adjust Recipe
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-bread-brown-100 p-4 rounded-lg">
            <h3 className="font-medium text-bread-dark-moss-green mb-2">Bake Details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-bread-pakistan-green">Type:</span>
                <span className="font-medium text-bread-brown-800">
                  {recipe.breadType || 'Custom'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-bread-pakistan-green">Hydration:</span>
                <span className="font-medium text-bread-brown-800">
                  {recipe.hydration}%
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-bread-pakistan-green">Duration:</span>
                <span className="font-medium text-bread-brown-800">
                  {calculateDuration()}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-bread-pakistan-green">Started:</span>
                <span className="font-medium text-bread-brown-800">
                  {formatTime(bake.startTime)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-bread-pakistan-green">Completed:</span>
                <span className="font-medium text-bread-brown-800">
                  {bake.endTime ? formatTime(bake.endTime) : 'In Progress'}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-bread-brown-100 p-4 rounded-lg">
            <h3 className="font-medium text-bread-dark-moss-green mb-2">Ratings</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-bread-pakistan-green">Crumb</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= bake.ratings.crumb ? '#F59E0B' : 'none'}
                        stroke={star <= bake.ratings.crumb ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-bread-pakistan-green">Crust</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= bake.ratings.crust ? '#dda15e' : 'none'}
                        stroke={star <= bake.ratings.crust ? '#dda15e' : '#606c38'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-bread-pakistan-green">Flavor</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= bake.ratings.flavor ? '#F59E0B' : 'none'}
                        stroke={star <= bake.ratings.flavor ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-bread-brown-100 p-4 rounded-lg">
            <h3 className="font-medium text-bread-dark-moss-green mb-2">Flours Used</h3>
            <ul className="space-y-1 text-sm">
              {recipe.flourTypes
                .filter(flour => flour.percentage > 0)
                .map(flour => (
                  <li key={flour.id} className="flex justify-between">
                    <span className="text-bread-pakistan-green">{flour.name}:</span>
                    <span className="font-medium text-bread-brown-800">
                      {flour.percentage}%
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-bread-dark-moss-green mb-2">Stage Progress</h3>
            <div className="bg-white border border-bread-brown-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-bread-brown-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-bread-brown-500 uppercase tracking-wider">Stage</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-bread-brown-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-bread-brown-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bread-brown-200">
                  {bake.stageProgress.map((stage) => (
                    <tr key={stage.id}>
                      <td className="px-4 py-3 text-sm font-medium text-bread-brown-800">
                        {stage.stageName}
                      </td>
                      <td className="px-4 py-3 text-sm text-bread-pakistan-green">
                        {stage.duration ? `${stage.duration.toFixed(0)} min` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-bread-pakistan-green">
                        {stage.notes || 'No notes'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-bread-dark-moss-green mb-2">What Went Well</h3>
              <div className="bg-white border border-bread-brown-200 rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-bread-brown-800 whitespace-pre-line">
                  {bake.notes.wentWell || 'No notes recorded'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-bread-dark-moss-green mb-2">What To Try Next</h3>
              <div className="bg-white border border-bread-brown-200 rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-bread-brown-800 whitespace-pre-line">
                  {bake.notes.tryNext || 'No notes recorded'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BakeDetails;