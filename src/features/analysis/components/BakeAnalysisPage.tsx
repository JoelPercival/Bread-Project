import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../shared/components/Layout/Layout';
import BakeDetails from './BakeDetails';
import useStore from '../../../store';

const BakeAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const bakeSessions = useStore((state) => state.bakeSessions);
  const recipes = useStore((state) => state.recipes);
  const duplicateRecipe = useStore((state) => state.duplicateRecipe);
  
  const bake = bakeSessions.find(b => b.id === id);
  const recipe = bake ? recipes.find(r => r.id === bake.recipeId) : null;
  
  if (!bake || !recipe) {
    navigate('/analysis');
    return null;
  }
  
  const handleBack = () => {
    navigate('/analysis');
  };
  
  const handleCloneRecipe = () => {
    const newRecipeId = duplicateRecipe(recipe.id);
    if (newRecipeId) {
      navigate(`/recipes/${newRecipeId}`);
    }
  };
  
  return (
    <Layout title="Bake Analysis">
      <BakeDetails
        bake={bake}
        recipe={recipe}
        onBack={handleBack}
        onCloneRecipe={handleCloneRecipe}
      />
    </Layout>
  );
};

export default BakeAnalysisPage;
