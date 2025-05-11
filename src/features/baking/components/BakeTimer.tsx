import React, { useState, useEffect } from 'react';
import { BakeSession, Recipe } from '../../../types';
import { useBakingStore } from '../store/bakingStore';
// StageCard not directly used, only via SortableStageCard
import { SortableProvider } from '../../../components/Timings/SortableContext';
import SortableStageCard from './stages/SortableStageCard';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import StarRating from '../../../components/UI/StarRating';
import { Save, PlusCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface BakeTimerProps {
  bakeSession: BakeSession;
  recipe: Recipe;
  onComplete: () => void;
}

const BakeTimer: React.FC<BakeTimerProps> = ({
  bakeSession,
  recipe,
  onComplete,
}) => {
  // We don't directly use updateBakeSession as we use more specific update methods
  const completeBakeSession = useBakingStore((state) => state.completeBakeSession);
  const updateStageProgress = useBakingStore((state) => state.updateStageProgress);
  const markStageComplete = useBakingStore((state) => state.markStageComplete);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [ratings, setRatings] = useState({
    crumb: 0,
    crust: 0,
    flavor: 0
  });
  const [notes, setNotes] = useState({
    wentWell: '',
    tryNext: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  
  // Find the first incomplete stage (with safety check)
  const activeStageIndex = Array.isArray(bakeSession.stageProgress) 
    ? bakeSession.stageProgress.findIndex(stage => !stage.completed)
    : -1;

  // For drag-and-drop: maintain a local order of stage IDs (with safety check)
  const [stageOrder, setStageOrder] = useState<string[]>(
    Array.isArray(bakeSession.stageProgress) 
      ? bakeSession.stageProgress.map(stage => stage.id)
      : []
  );

  useEffect(() => {
    // Sync order if session changes (with safety check)
    if (Array.isArray(bakeSession.stageProgress)) {
      setStageOrder(bakeSession.stageProgress.map(stage => stage.id));
    }
  }, [bakeSession.stageProgress]);

  const handleDragEnd = (activeId: string, overId: string | null) => {
    if (!overId || activeId === overId) return;
    const oldIndex = stageOrder.indexOf(activeId);
    const newIndex = stageOrder.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...stageOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      setStageOrder(newOrder);
      // Optionally, update the bakeSession in your store/state here if you want to persist the new order
      // updateBakeSession(bakeSession.id, { ...bakeSession, stageProgress: newOrder.map(id => bakeSession.stageProgress.find(s => s.id === id)!) });
    }
  };

  
  useEffect(() => {
    const startTime = new Date(bakeSession.startTime).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = now - startTime;
      setElapsedTime(Math.floor(elapsed / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [bakeSession.startTime]);
  
  // Format elapsed time for display
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get the current elapsed time from the stage card to ensure accurate completion time
  const handleCompleteStage = (stageId: string, currentElapsedSeconds?: number) => {
    // First save the current elapsed time if provided
    if (typeof currentElapsedSeconds === 'number' && currentElapsedSeconds > 0) {
      updateStageProgress(bakeSession.id, stageId, { 
        elapsedSeconds: currentElapsedSeconds,
        lastUpdated: new Date()
      });
    }
    
    // Then mark the stage as complete
    markStageComplete(bakeSession.id, stageId);
    
    // If this was the last stage, show completion form
    const remainingStages = bakeSession.stageProgress.filter(stage => !stage.completed).length;
    if (remainingStages <= 1) {
      setShowCompletionForm(true);
    }
  };
  
  const handleUpdateNotes = (stageId: string, notes: string) => {
    updateStageProgress(bakeSession.id, stageId, { notes });
  };
  
  // Handle updating and persisting stage timer values
  const handleUpdateStageTimer = (stageId: string, elapsedSeconds: number) => {
    updateStageProgress(bakeSession.id, stageId, { 
      elapsedSeconds,
      lastUpdated: new Date()
    });
  };
  
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setSelectedImages(prevFiles => [...prevFiles, ...fileArray]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleCompleteBake = () => {
    const completionData = {
      ratings,
      notes,
      endTime: new Date()
    };
    
    completeBakeSession(bakeSession.id, completionData);
    onComplete();
  };
  
  // Calculate completion percentage (with safety check)
  const completedStages = Array.isArray(bakeSession.stageProgress) 
    ? bakeSession.stageProgress.filter(stage => stage.completed).length 
    : 0;
  const totalStages = Array.isArray(bakeSession.stageProgress) 
    ? bakeSession.stageProgress.length 
    : 1; // Prevent division by zero
  const completionPercentage = Math.round((completedStages / totalStages) * 100);
  
  return (
    <div>
      <Card className="mb-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl text-bread-brown-800">
              {recipe.name}
            </h2>
            <p className="text-sm text-bread-brown-600">
              {recipe.breadType || 'Custom'} • {recipe.hydration}% Hydration
            </p>
          </div>
          
          <div className="flex items-center bg-bread-crumb px-3 py-1 rounded-full">
            <Clock size={18} className="text-bread-brown-500 mr-2" />
            <span className="font-mono text-bread-brown-800 font-medium">
              {formatElapsedTime()}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-bread-brown-800">
                  Progress: {completionPercentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-bread-brown-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-bread-crust"
              ></motion.div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Create a lookup map for stage id to stage object for fast access */}
      {(() => {
        // Safety check: ensure stageProgress is an array before trying to use it
        if (!Array.isArray(bakeSession.stageProgress) || bakeSession.stageProgress.length === 0) {
          return (
            <div className="p-4 border border-bread-crust rounded-md bg-bread-crumb">
              <p className="text-center text-bread-brown-800">No baking stages found. Please return to the recipe page and try again.</p>
            </div>
          );
        }
        
        const stageMap = new Map(bakeSession.stageProgress.map(s => [s.id, s]));
        return (
          <SortableProvider items={stageOrder} onDragEnd={handleDragEnd}>
            <div className="space-y-2 mb-6">
              {stageOrder.map((id, index) => {
                const stage = stageMap.get(id);
                
                // Safety check: skip this stage if it doesn't exist in the map
                if (!stage) return null;
                
                // Find the previous stage (if any) and check if it's completed
                let isPreviousCompleted = true;
                if (index > 0) {
                  const prevStage = stageMap.get(stageOrder[index - 1]);
                  isPreviousCompleted = !!prevStage?.completed;
                }
                return (
                  <SortableStageCard
                    key={stage.id}
                    id={stage.id}
                    stage={stage}
                    onComplete={() => handleCompleteStage(stage.id)}
                    onUpdateNotes={(notes) => handleUpdateNotes(stage.id, notes)}
                    onUpdateStageTimer={(elapsedSeconds: number) => handleUpdateStageTimer(stage.id, elapsedSeconds)}
                    isActive={index === activeStageIndex}
                    isPreviousCompleted={isPreviousCompleted}
                  />
                );
              })}
            </div>
          </SortableProvider>
        );
      })()}

      
      {showCompletionForm && (
        <Card className="p-4 mb-6">
          <h3 className="font-serif text-xl text-bread-brown-800 mb-4">
            Complete Your Bake
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-bread-brown-700">Rate Your Results</h4>
              
              <div className="space-y-3">
                <StarRating
                  value={ratings.crumb}
                  onChange={(value) => setRatings({ ...ratings, crumb: value })}
                  label="Crumb Quality"
                />
                
                <StarRating
                  value={ratings.crust}
                  onChange={(value) => setRatings({ ...ratings, crust: value })}
                  label="Crust Quality"
                />
                
                <StarRating
                  value={ratings.flavor}
                  onChange={(value) => setRatings({ ...ratings, flavor: value })}
                  label="Flavor"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-bread-brown-700">Notes</h4>
              
              <div>
                <label className="block text-sm text-bread-brown-600 mb-1">
                  What went well?
                </label>
                <textarea
                  value={notes.wentWell}
                  onChange={(e) => setNotes({ ...notes, wentWell: e.target.value })}
                  className="w-full p-2 border border-bread-brown-200 rounded-md min-h-[80px] focus:ring-bread-crust focus:border-bread-crust"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm text-bread-brown-600 mb-1">
                  What to try next time?
                </label>
                <textarea
                  value={notes.tryNext}
                  onChange={(e) => setNotes({ ...notes, tryNext: e.target.value })}
                  className="w-full p-2 border border-bread-brown-200 rounded-md min-h-[80px] focus:ring-bread-crust focus:border-bread-crust"
                ></textarea>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-bread-brown-700">Add Photos</h4>
              <p className="text-sm text-bread-brown-500 mb-2">
                Document your bake with photos
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedImages.map((file, index) => (
                  <div key={`stage-timer-${index}`} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selected ${index}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error-500">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
                
                <label className="w-20 h-20 border-2 border-dashed border-bread-brown-300 rounded flex items-center justify-center cursor-pointer hover:bg-bread-brown-50">
                  <PlusCircle size={24} className="text-bread-brown-400" />
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelection} />
                </label>
              </div>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              onClick={handleCompleteBake}
              icon={<Save size={18} />}
            >
              Save Bake Log
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BakeTimer;
