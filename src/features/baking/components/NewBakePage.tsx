import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import RecipeForm from '../../recipes/components/RecipeForm';
import { useRecipeStore } from '../../recipes/store/recipeStore';

const NewBakePage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();
  
  const recipes = useRecipeStore(state => state.recipes);
  const recipe = recipeId ? recipes.find(r => r.id === recipeId) : undefined;
  
  const handleSave = (id: string) => {
    navigate(`/recipes/${id}`);
  };
  
  const handleStartBake = (recipeId: string) => {
    navigate(`/timings/${recipeId}`);
  };
  
  return (
    <Layout title={recipe ? `Bake ${recipe.name}` : 'New Bake'}>
      <RecipeForm
        initialRecipe={recipe}
        onSave={handleSave}
        onStartBake={handleStartBake}
      />
    </Layout>
  );
};

export default NewBakePage;
