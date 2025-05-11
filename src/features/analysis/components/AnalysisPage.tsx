import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import BakeCard from './BakeCard';
import BakeFilters from './BakeFilters';
import Button from '../../../components/UI/Button';
import { useBakingStore } from '../../baking/store/bakingStore';
import { useRecipeStore } from '../../recipes/store/recipeStore';
import { BarChart as ChartBar, ChevronRightCircle, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const bakeSessions = useBakingStore((state) => state.bakeSessions);
  const recipes = useRecipeStore((state) => state.recipes);
  
  // Only show completed bakes (with safety check for array) - using useMemo to prevent infinite renders
  const completedBakes = useMemo(() => {
    return Array.isArray(bakeSessions)
      ? bakeSessions.filter(bake => bake.endTime)
      : [];
  }, [bakeSessions]);
  
  // Import FiltersState type from BakeFilters
  interface FiltersState {
    breadType: string | null;
    minHydration: number;
    maxHydration: number;
    flourType: string | null;
    minCrumbRating: number;
    minCrustRating: number;
    minFlavorRating: number;
  }
  
  // Initialize filters
  const [filters, setFilters] = useState<FiltersState>({
    breadType: null,
    minHydration: 0,
    maxHydration: 100,
    flourType: null,
    minCrumbRating: 0,
    minCrustRating: 0,
    minFlavorRating: 0,
  });
  
  // Initialize filteredBakes state with an empty array instead of a derived value
  const [filteredBakes, setFilteredBakes] = useState<typeof completedBakes>([]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...completedBakes]; // Create a copy to avoid mutating the original
    
    if (filters.breadType) {
      filtered = filtered.filter(bake => {
        const recipe = Array.isArray(recipes) ? recipes.find(r => r.id === bake.recipeId) : null;
        return recipe?.breadType === filters.breadType;
      });
    }
    
    if (filters.flourType) {
      filtered = filtered.filter(bake => {
        const recipe = Array.isArray(recipes) ? recipes.find(r => r.id === bake.recipeId) : null;
        return recipe?.flourTypes && Array.isArray(recipe.flourTypes) ? recipe.flourTypes.some(
          flour => flour.name === filters.flourType && flour.percentage > 0
        ) : false;
      });
    }
    
    if (filters.minHydration > 0) {
      filtered = filtered.filter(bake => {
        const recipe = Array.isArray(recipes) ? recipes.find(r => r.id === bake.recipeId) : null;
        return recipe && typeof recipe.hydration === 'number' && recipe.hydration >= filters.minHydration;
      });
    }
    
    if (filters.minCrumbRating > 0) {
      filtered = filtered.filter(bake => bake.ratings && typeof bake.ratings.crumb === 'number' && bake.ratings.crumb >= filters.minCrumbRating);
    }
    
    if (filters.minCrustRating > 0) {
      filtered = filtered.filter(bake => bake.ratings && typeof bake.ratings.crust === 'number' && bake.ratings.crust >= filters.minCrustRating);
    }
    
    if (filters.minFlavorRating > 0) {
      filtered = filtered.filter(bake => bake.ratings && typeof bake.ratings.flavor === 'number' && bake.ratings.flavor >= filters.minFlavorRating);
    }
    
    setFilteredBakes(filtered);
  }, [filters, completedBakes, recipes]);
  
  // Get all unique bread types (with safety check)
  const availableBreadTypes = Array.isArray(recipes) 
    ? Array.from(
        new Set(
          recipes
            .filter(recipe => recipe && recipe.breadType)
            .map(recipe => recipe.breadType)
        )
      ).filter(Boolean) as string[]
    : [];
  
  // Get all unique flour types (with safety check)
  const availableFlourTypes = Array.isArray(recipes)
    ? Array.from(
        new Set(
          recipes.flatMap(recipe => 
            recipe && recipe.flourTypes && Array.isArray(recipe.flourTypes)
              ? recipe.flourTypes
                  .filter(flour => flour && typeof flour.percentage === 'number' && flour.percentage > 0)
                  .map(flour => flour.name || '')
              : []
          )
        )
      ).filter(Boolean) as string[]
    : [];
  
  const handleUpdateFilters = (updatedFilters: Partial<FiltersState>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...updatedFilters }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      breadType: null,
      minHydration: 0,
      maxHydration: 100,
      flourType: null,
      minCrumbRating: 0,
      minCrustRating: 0,
      minFlavorRating: 0,
    });
  };
  
  const getRecipeForBake = (bakeId: string) => {
    const bake = bakeSessions.find(b => b.id === bakeId);
    if (!bake) return null;
    
    return recipes.find(r => r.id === bake.recipeId) || null;
  };
  
  const viewBakeDetails = (bakeId: string) => {
    navigate(`/analysis/${bakeId}`);
  };
  
  return (
    <Layout title="Analysis Dashboard">
      <BakeFilters
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        availableBreadTypes={availableBreadTypes}
        availableFlourTypes={availableFlourTypes}
      />
      
      {completedBakes.length === 0 ? (
        <div className="bg-bread-brown-100 rounded-lg p-8 text-center">
          <ChartBar size={48} className="mx-auto text-bread-brown-400 mb-3" />
          <h2 className="font-serif text-xl text-bread-brown-800 mb-2">No Bakes Completed Yet</h2>
          <p className="text-bread-brown-600 mb-6 max-w-md mx-auto">
            Complete a bake to start analyzing your bread making progress.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/new-bake')}
            icon={<PlusCircle size={18} />}
          >
            Start New Bake
          </Button>
        </div>
      ) : (
        <>
          {filteredBakes.length === 0 ? (
            <div className="bg-bread-brown-100 rounded-lg p-8 text-center">
              <h2 className="font-serif text-xl text-bread-brown-800 mb-2">No Results Found</h2>
              <p className="text-bread-brown-600 mb-4">
                Try adjusting your filters to see more results.
              </p>
              <Button
                variant="outline"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {completedBakes.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-medium text-bread-brown-700 mb-2">Average Ratings</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xl font-bold text-bread-crust">
                          {(
                            completedBakes.reduce((sum, bake) => sum + bake.ratings.crumb, 0) / 
                            completedBakes.length
                          ).toFixed(1)}
                        </div>
                        <div className="text-xs text-bread-brown-600">Crumb</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-bread-crust">
                          {(
                            completedBakes.reduce((sum, bake) => sum + bake.ratings.crust, 0) / 
                            completedBakes.length
                          ).toFixed(1)}
                        </div>
                        <div className="text-xs text-bread-brown-600">Crust</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-bread-crust">
                          {(
                            completedBakes.reduce((sum, bake) => sum + bake.ratings.flavor, 0) / 
                            completedBakes.length
                          ).toFixed(1)}
                        </div>
                        <div className="text-xs text-bread-brown-600">Flavor</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-medium text-bread-brown-700 mb-2">Most Baked</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        completedBakes.reduce((acc: Record<string, number>, bake) => {
                          const recipe = recipes.find(r => r.id === bake.recipeId);
                          if (recipe) {
                            acc[recipe.name] = (acc[recipe.name] || 0) + 1;
                          }
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, count], index) => (
                          <div key={`analysis-item-${index}`} className="flex justify-between">
                            <span className="text-bread-brown-600">{name}</span>
                            <span className="font-medium text-bread-brown-800">{count}x</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-medium text-bread-brown-700 mb-2">Hydration Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-bread-brown-600">Highest Rated</span>
                        <span className="font-medium text-bread-brown-800">
                          {(() => {
                            const bakesByHydration = completedBakes.reduce((acc: Record<number, any[]>, bake) => {
                              const recipe = recipes.find(r => r.id === bake.recipeId);
                              if (recipe) {
                                const hydration = recipe.hydration;
                                if (!acc[hydration]) acc[hydration] = [];
                                acc[hydration].push(bake);
                              }
                              return acc;
                            }, {});
                            
                            const hydrationRatings = Object.entries(bakesByHydration).map(([hydration, bakes]) => {
                              const avgRating = bakes.reduce((sum, bake) => {
                                return sum + (bake.ratings.crumb + bake.ratings.crust + bake.ratings.flavor) / 3;
                              }, 0) / bakes.length;
                              
                              return { hydration: parseInt(hydration), avgRating };
                            });
                            
                            if (hydrationRatings.length === 0) return 'N/A';
                            
                            return `${hydrationRatings.sort((a, b) => b.avgRating - a.avgRating)[0].hydration}%`;
                          })()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-bread-brown-600">Average</span>
                        <span className="font-medium text-bread-brown-800">
                          {(
                            completedBakes.reduce((sum, bake) => {
                              const recipe = recipes.find(r => r.id === bake.recipeId);
                              return sum + (recipe?.hydration || 0);
                            }, 0) / completedBakes.length
                          ).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-bread-brown-600">Range</span>
                        <span className="font-medium text-bread-brown-800">
                          {(() => {
                            const hydrations = completedBakes.map(bake => {
                              const recipe = recipes.find(r => r.id === bake.recipeId);
                              return recipe?.hydration || 0;
                            }).filter(h => h > 0);
                            
                            if (hydrations.length === 0) return 'N/A';
                            
                            return `${Math.min(...hydrations)}% - ${Math.max(...hydrations)}%`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBakes.map((bake, index) => {
                  const recipe = getRecipeForBake(bake.id);
                  if (!recipe) return null;
                  
                  return (
                    <motion.div
                      key={bake.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * (index % 6) }}
                    >
                      <BakeCard
                        bake={bake}
                        recipe={recipe}
                        onClick={() => viewBakeDetails(bake.id)}
                      />
                    </motion.div>
                  );
                })}
              </div>
              
              {completedBakes.length > 9 && (
                <div className="text-center mt-8">
                  <Button
                    variant="primary"
                    onClick={() => {}}
                    icon={<ChevronRightCircle size={18} />}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default AnalysisPage;
