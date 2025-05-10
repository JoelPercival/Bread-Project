// JSX requires React to be in scope, even if not explicitly used
// In newer React versions with the new JSX transform, this import isn't needed
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import NewBakePage from './pages/NewBakePage';
import TimingsPage from './pages/TimingsPage';
import BakeTimerPage from './pages/BakeTimerPage';
import AnalysisPage from './pages/AnalysisPage';
import BakeAnalysisPage from './pages/BakeAnalysisPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/new-bake" element={<NewBakePage />} />
        <Route path="/new-bake/:recipeId" element={<NewBakePage />} />
        <Route path="/timings" element={<TimingsPage />} />
        <Route path="/timings/:id" element={<BakeTimerPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/analysis/:id" element={<BakeAnalysisPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;