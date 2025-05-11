import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from '../features/recipes/components/Home';
import RecipesPage from '../features/recipes/components/RecipesPage';
import RecipeDetailPage from '../features/recipes/components/RecipeDetailPage';
import NewBakePage from '../features/baking/components/NewBakePage';
import StageSelectionPage from '../features/baking/components/StageSelectionPage';
import TimingsPage from '../features/baking/components/TimingsPage';
import BakeTimerPage from '../features/baking/components/BakeTimerPage';
import AnalysisPage from '../features/analysis/components/AnalysisPage';
import BakeAnalysisPage from '../features/analysis/components/BakeAnalysisPage';
import SettingsPage from '../features/settings/components/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      <Route path="/new-bake" element={<NewBakePage />} />
      <Route path="/new-bake/:recipeId" element={<NewBakePage />} />
      <Route path="/select-stages/:recipeId" element={<StageSelectionPage />} />
      <Route path="/timings" element={<TimingsPage />} />
      <Route path="/timings/:id" element={<BakeTimerPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/analysis/:id" element={<BakeAnalysisPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
