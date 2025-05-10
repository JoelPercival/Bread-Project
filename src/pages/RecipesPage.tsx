import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import RecipeCard from '../components/Recipe/RecipeCard';
import Button from '../components/UI/Button';
import useStore from '../store';
import { PlusCircle, Search, Croissant } from 'lucide-react';
import { motion } from 'framer-motion';

const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const recipes = useStore((state) => state.recipes);
  const duplicateRecipe = useStore((state) => state.duplicateRecipe);
  const deleteRecipe = useStore((state) => state.deleteRecipe);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredRecipes(
        recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(lowerCaseSearch) ||
          (recipe.breadType && recipe.breadType.toLowerCase().includes(lowerCaseSearch)) ||
          recipe.flourTypes.some(flour => 
            flour.name.toLowerCase().includes(lowerCaseSearch) && flour.percentage > 0
          )
        )
      );
    }
  }, [searchTerm, recipes]);
  
  const handleViewRecipe = (id: string) => {
    navigate(`/recipes/${id}`);
  };
  
  const handleDuplicateRecipe = (id: string) => {
    const newId = duplicateRecipe(id);
    if (newId) {
      navigate(`/recipes/${newId}`);
    }
  };
  
  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(id);
    }
  };
  
  const handleStartBake = (id: string) => {
    navigate(`/timings/${id}`);
  };
  
  return (
    <Layout title="Recipes">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-bread-brown-200 rounded-md focus:ring-bread-crust focus:border-bread-crust"
          />
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bread-brown-400" 
          />
        </div>
        
        <Button
          variant="primary"
          onClick={() => navigate('/new-bake')}
          icon={<PlusCircle size={18} />}
        >
          New Recipe
        </Button>
      </div>
      
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          {recipes.length === 0 ? (
            <div className="bg-bread-brown-100 rounded-lg p-8 max-w-md mx-auto flex flex-col items-center text-center">
              <h2 className="font-serif text-xl text-bread-brown-800 mb-2">No recipes yet</h2>
              <Croissant size={64} className="mx-auto text-bread-crust mb-4" />
              <p className="text-bread-brown-600 mb-6">
                Create your first bread recipe to get started on your baking journey.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/new-bake')}
                icon={<PlusCircle size={18} />}
              >
                Create Recipe
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-xl text-bread-brown-800 mb-2">No matching recipes</h2>
              <p className="text-bread-brown-600">
                Try adjusting your search or create a new recipe.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * (index % 6) }}
            >
              <RecipeCard
                recipe={recipe}
                onDuplicate={handleDuplicateRecipe}
                onDelete={handleDeleteRecipe}
                onView={handleViewRecipe}
                onStartBake={handleStartBake}
              />
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default RecipesPage;