import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import RecipeForm from '../components/Recipe/RecipeForm';
import Button from '../components/UI/Button';
import useStore from '../store';
import { ArrowLeft } from 'lucide-react';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const recipes = useStore((state) => state.recipes);
  const recipe = recipes.find(r => r.id === id);
  
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
    navigate(`/new-bake/${recipeId}`);
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