import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import useStore from '../store';
import { motion } from 'framer-motion';
import { Clock, PlusCircle, ArrowRight } from 'lucide-react';

const TimingsPage: React.FC = () => {
  const navigate = useNavigate();
  const bakeSessions = useStore((state) => state.bakeSessions);
  const recipes = useStore((state) => state.recipes);
  const currentBakeSession = useStore((state) => state.currentBakeSession);
  
  // Filter out only active bake sessions (no endTime)
  const activeBakes = bakeSessions.filter(bake => !bake.endTime);
  
  // Get recently completed bakes
  const recentBakes = bakeSessions
    .filter(bake => bake.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
    .slice(0, 3);
  
  const getRecipeForBake = (bakeId: string) => {
    const bake = bakeSessions.find(b => b.id === bakeId);
    if (!bake) return null;
    
    return recipes.find(r => r.id === bake.recipeId) || null;
  };
  
  // Continue a bake in progress
  const continueBake = (bakeId: string) => {
    navigate(`/timings/${bakeId}`);
  };
  
  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Calculate completion percentage
  const calculateCompletion = (bakeId: string) => {
    const bake = bakeSessions.find(b => b.id === bakeId);
    if (!bake) return 0;
    
    const completedStages = bake.stageProgress.filter(stage => stage.completed).length;
    const totalStages = bake.stageProgress.length;
    
    return Math.round((completedStages / totalStages) * 100);
  };
  
  // Auto-redirect to current bake if there's only one active
  useEffect(() => {
    if (currentBakeSession) {
      navigate(`/timings/${currentBakeSession.id}`);
    }
  }, [currentBakeSession, navigate]);
  
  return (
    <Layout title="Bake Timings">
      <div className="space-y-8">
        {activeBakes.length === 0 ? (
          <div className="bg-bread-brown-100 rounded-lg p-8 text-center">
            <Clock size={48} className="mx-auto text-bread-brown-400 mb-3" />
            <h2 className="font-serif text-xl text-bread-brown-800 mb-2">No Active Bakes</h2>
            <p className="text-bread-brown-600 mb-6 max-w-md mx-auto">
              You don't have any bakes in progress. Start a new bake to track your bread baking process.
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
          <div>
            <h2 className="font-serif text-xl text-bread-brown-800 mb-4">Active Bakes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBakes.map((bake, index) => {
                const recipe = getRecipeForBake(bake.id);
                if (!recipe) return null;
                
                return (
                  <motion.div
                    key={bake.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card className="overflow-visible" interactive onClick={() => continueBake(bake.id)}>
                      <div className="p-4 border-b border-bread-brown-100">
                        <h3 className="font-medium text-lg text-bread-brown-800">
                          {recipe.name}
                        </h3>
                        <p className="text-sm text-bread-brown-600">
                          Started on {formatDate(bake.startTime)}
                        </p>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-bread-brown-600">Progress</span>
                            <span className="font-medium text-bread-brown-800">
                              {calculateCompletion(bake.id)}%
                            </span>
                          </div>
                          <div className="w-full bg-bread-brown-100 rounded-full h-2">
                            <div 
                              className="bg-bread-crust h-2 rounded-full" 
                              style={{ width: `${calculateCompletion(bake.id)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            continueBake(bake.id);
                          }}
                          icon={<ArrowRight size={16} />}
                        >
                          Continue Baking
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        {recentBakes.length > 0 && (
          <div>
            <h2 className="font-serif text-xl text-bread-brown-800 mb-4">Recently Completed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBakes.map((bake, index) => {
                const recipe = getRecipeForBake(bake.id);
                if (!recipe) return null;
                
                return (
                  <motion.div
                    key={bake.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card className="overflow-visible" interactive onClick={() => navigate(`/analysis/${bake.id}`)}>
                      <div className="p-4 border-b border-bread-brown-100">
                        <h3 className="font-medium text-lg text-bread-brown-800">
                          {recipe.name}
                        </h3>
                        <p className="text-sm text-bread-brown-600">
                          Completed on {formatDate(bake.endTime!)}
                        </p>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-bread-brown-50 p-2 rounded text-center">
                            <div className="text-bread-crust font-bold">{bake.ratings.crumb}</div>
                            <div className="text-xs text-bread-brown-600">Crumb</div>
                          </div>
                          <div className="bg-bread-brown-50 p-2 rounded text-center">
                            <div className="text-bread-crust font-bold">{bake.ratings.crust}</div>
                            <div className="text-xs text-bread-brown-600">Crust</div>
                          </div>
                          <div className="bg-bread-brown-50 p-2 rounded text-center">
                            <div className="text-bread-crust font-bold">{bake.ratings.flavor}</div>
                            <div className="text-xs text-bread-brown-600">Flavor</div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${bake.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/new-bake')}
            icon={<PlusCircle size={20} />}
          >
            Start New Bake
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TimingsPage;