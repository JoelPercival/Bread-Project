import React from 'react';
import { Recipe } from '../../types';
import Card from '../../UI/Card';
import Button from '../../UI/Button';
import { Copy, PlayCircle, Trash } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onStartBake: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onDuplicate,
  onDelete,
  onView,
  onStartBake,
}) => {
  const activeFlours = recipe.flourTypes.filter(flour => flour.percentage > 0);
  
  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(recipe.id);
  };

  const handleStartBake = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onStartBake(recipe.id);
  };

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDuplicate(recipe.id);
  };


  return (
    <Card className="overflow-visible" interactive onClick={() => onView(recipe.id)}>
      <div className="p-4 border-b border-bread-earth-yellow">
        <h3 className="font-serif font-semibold text-lg text-bread-dark-moss-green line-clamp-1">
          {recipe.name}
        </h3>
        <p className="text-sm text-bread-pakistan-green">
          {recipe.breadType || 'Custom'} • {recipe.hydration}% Hydration
        </p>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-xs text-bread-brown-500 uppercase">Flours</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {activeFlours.map(flour => (
              <span 
                key={flour.id} 
                className="px-2 py-0.5 bg-bread-brown-100 text-bread-brown-700 text-xs rounded-full"
              >
                {flour.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-bread-brown-500 uppercase">Weight</p>
          <p className="text-sm font-medium text-bread-brown-700">
            {recipe.doughWeight}g
            {recipe.numberOfLoaves > 1 && ` (${recipe.numberOfLoaves} loaves)`}
          </p>
        </div>
        
        <div className="mt-4 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(recipe.id);
            }}
            icon={<Copy size={16} />}
          >
            Copy
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe.id);
              }}
              icon={<Trash size={16} />}
              className="text-error-500 hover:bg-error-100"
            />
            
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartBake(recipe.id);
              }}
              icon={<PlayCircle size={16} />}
            >
              Start Bake
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;