import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import RecipeForm from './RecipeForm';
import Button from '../../../components/UI/Button';
import { useRecipeStore } from '../store/recipeStore';
import { Recipe } from '../../../types';
import { ArrowLeft } from 'lucide-react';

// RecipeState is already defined in the store

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const recipes = useRecipeStore(state => state.recipes);
  // Add safety check to ensure recipes is an array before using find
  const recipe = Array.isArray(recipes) ? recipes.find((r: Recipe) => r.id === id) : undefined;
  
  useEffect(() => {
    if (id && !recipe) {
      // Recipe not found, redirect to recipes page
      navigate('/recipes');
    }
  }, [id, recipe, navigate]);
  
  const handleSave = () => {
    navigate('/recipes');
  };
  
  const handleStartBake = (recipeId: string) => {
    // Navigate to the stage selection page instead of directly to the bake page
    navigate(`/select-stages/${recipeId}`);
  };
  
  if (!recipe) {
    return null;
  }
  
  return (
    <Layout title="Edit Recipe">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => navigate('/recipes')}
        icon={<ArrowLeft size={16} />}
      >
        Back to Recipes
      </Button>
      
      <RecipeForm
        initialRecipe={recipe}
        onSave={handleSave}
        onStartBake={handleStartBake}
      />
    </Layout>
  );
};

export default RecipeDetailPage;
