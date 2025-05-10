import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import BakeTimer from '../components/Timings/BakeTimer';
import Button from '../components/UI/Button';
import useStore from '../store';
import { ArrowLeft } from 'lucide-react';

const BakeTimerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const bakeSessions = useStore((state) => state.bakeSessions);
  const recipes = useStore((state) => state.recipes);
  const startBakeSession = useStore((state) => state.startBakeSession);
  const setCurrentBakeSession = useStore((state) => state.setCurrentBakeSession);
  
  const [bakeSession, setBakeSession] = useState(bakeSessions.find(b => b.id === id));
  const [recipe, setRecipe] = useState<any>(null);
  
  // Initial setup effect - only runs when id or recipes change
  useEffect(() => {
    if (!id) return;

    const existingBake = bakeSessions.find(b => b.id === id);
    
    // First try to find recipe by existing bake's recipeId
    let matchedRecipe = existingBake 
      ? recipes.find(r => r.id === existingBake.recipeId)
      : recipes.find(r => r.id === id);

    if (!existingBake && matchedRecipe) {
      // Create new bake session from recipe
      const newBakeId = startBakeSession(matchedRecipe.id);
      const newBake = bakeSessions.find(b => b.id === newBakeId);
      
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