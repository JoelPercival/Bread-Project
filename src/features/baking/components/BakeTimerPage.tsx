import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import BakeTimer from './BakeTimer';
import Button from '../../../components/UI/Button';
import { useBakingStore } from '../store/bakingStore';
import { useRecipeStore } from '../../recipes/store/recipeStore';
import { ArrowLeft } from 'lucide-react';

const BakeTimerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const bakeSessions = useBakingStore(state => state.bakeSessions);
  const recipes = useRecipeStore(state => state.recipes);
  const startBakeSession = useBakingStore(state => state.startBakeSession);
  const setCurrentBakeSession = useBakingStore(state => state.setCurrentBakeSession);
  
  const [bakeSession, setBakeSession] = useState(
    Array.isArray(bakeSessions) ? bakeSessions.find(b => b.id === id) : undefined
  );
  const [recipe, setRecipe] = useState<any>(null);
  
  // Initial setup effect - only runs when id or recipes change
  useEffect(() => {
    if (!id) return;

    // Add safety checks for bakeSessions and recipes arrays
    const existingBake = Array.isArray(bakeSessions) ? bakeSessions.find(b => b.id === id) : undefined;
    
    // First try to find recipe by existing bake's recipeId
    let matchedRecipe = existingBake && Array.isArray(recipes)
      ? recipes.find(r => r.id === existingBake.recipeId)
      : Array.isArray(recipes) ? recipes.find(r => r.id === id) : undefined;

    if (!existingBake && matchedRecipe) {
      // Create new bake session from recipe
      const newBakeId = startBakeSession(matchedRecipe.id);
      // Add safety check before calling find on bakeSessions
      const newBake = Array.isArray(bakeSessions) ? bakeSessions.find(b => b.id === newBakeId) : undefined;
      
      if (newBake) {
        setBakeSession(newBake);
        setRecipe(matchedRecipe);
        setCurrentBakeSession(newBake);
        // Use replace to avoid adding to history stack
        navigate(`/timings/${newBakeId}`, { replace: true });
      } else {
        navigate('/timings');
      }
    } else if (existingBake && matchedRecipe) {
      setBakeSession(existingBake);
      setRecipe(matchedRecipe);
      setCurrentBakeSession(existingBake);
    } else {
      navigate('/timings');
    }
  }, [id, recipes, startBakeSession, setCurrentBakeSession]);
  
  // Separate effect for updating bake session state
  useEffect(() => {
    if (id && bakeSession?.id === id) {
      const updatedBake = bakeSessions.find(b => b.id === id);
      if (updatedBake && JSON.stringify(updatedBake) !== JSON.stringify(bakeSession)) {
        setBakeSession(updatedBake);
      }
    }
  }, [id, bakeSessions]);
  
  const handleCompleteBake = () => {
    setCurrentBakeSession(null);
    navigate('/timings');
  };
  
  if (!bakeSession || !recipe) {
    return null;
  }
  
  return (
    <Layout title="Bake Timer">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => navigate('/timings')}
        icon={<ArrowLeft size={16} />}
      >
        Back to Timings
      </Button>
      
      <BakeTimer
        bakeSession={bakeSession}
        recipe={recipe}
        onComplete={handleCompleteBake}
      />
    </Layout>
  );
};

export default BakeTimerPage;
