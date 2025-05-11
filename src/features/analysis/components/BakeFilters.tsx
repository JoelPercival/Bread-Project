import React from 'react';
import Button from '../../../components/UI/Button';
import CustomSlider from '../../../components/UI/CustomSlider';
import { Filter, X } from 'lucide-react';

interface FiltersState {
  breadType: string | null;
  minHydration: number;
  maxHydration: number;
  flourType: string | null;
  minCrumbRating: number;
  minCrustRating: number;
  minFlavorRating: number;
}

interface BakeFiltersProps {
  filters: FiltersState;
  onUpdateFilters: (filters: Partial<FiltersState>) => void;
  onResetFilters: () => void;
  availableBreadTypes: string[];
  availableFlourTypes: string[];
}

const BakeFilters: React.FC<BakeFiltersProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  availableBreadTypes,
  availableFlourTypes,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'number') {
      if (value > 0) return true;
    } else if (value !== null) {
      return true;
    }
    return false;
  });
  
  return (
    <div className="bg-bread-cornsilk rounded-lg shadow-md overflow-hidden mb-6">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Filter size={18} className="text-bread-brown-500 mr-2" />
          <h3 className="font-medium text-bread-brown-800">Filters</h3>
          {hasActiveFilters && (
            <span className="ml-2 bg-bread-crust text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <button className="text-bread-brown-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-bread-brown-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                Bread Type
              </label>
              <select
                value={filters.breadType || ''}
                onChange={(e) => onUpdateFilters({ breadType: e.target.value || null })}
                className="w-full p-2 border border-bread-brown-200 rounded-md"
              >
                <option value="">Any Type</option>
                {availableBreadTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                Flour Type
              </label>
              <select
                value={filters.flourType || ''}
                onChange={(e) => onUpdateFilters({ flourType: e.target.value || null })}
                className="w-full p-2 border border-bread-brown-200 rounded-md"
              >
                <option value="">Any Flour</option>
                {availableFlourTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <CustomSlider
                min={50}
                max={100}
                value={filters.minHydration}
                onChange={(value: number) => onUpdateFilters({ minHydration: value })}
                label="Min Hydration %"
                valueFormatter={(value: number) => `${value}%`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                Minimum Ratings
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <select
                    value={filters.minCrumbRating}
                    onChange={(e) => onUpdateFilters({ minCrumbRating: Number(e.target.value) })}
                    className="w-full p-2 border border-bread-brown-200 rounded-md text-sm"
                  >
                    <option value="0">Crumb ✯</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        Crumb ✯ {rating}+
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <select
                    value={filters.minCrustRating}
                    onChange={(e) => onUpdateFilters({ minCrustRating: Number(e.target.value) })}
                    className="w-full p-2 border border-bread-brown-200 rounded-md text-sm"
                  >
                    <option value="0">Crust ✯</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        Crust ✯ {rating}+
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <select
                    value={filters.minFlavorRating}
                    onChange={(e) => onUpdateFilters({ minFlavorRating: Number(e.target.value) })}
                    className="w-full p-2 border border-bread-brown-200 rounded-md text-sm"
                  >
                    <option value="0">Flavor ✯</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        Flavor ✯ {rating}+
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                icon={<X size={16} />}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BakeFilters;
