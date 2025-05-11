import React, { useState, useEffect, useRef } from 'react';
import { StageProgress } from '../../../../types';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlarmClock, Play, Pause } from 'lucide-react';

interface StageCardProps {
  stage: StageProgress;
  onComplete: (elapsedSeconds?: number) => void; // Updated to accept elapsed time
  onUpdateNotes: (notes: string) => void;
  onUpdateStageTimer?: (elapsedSeconds: number) => void; // Add new prop for stage timer persistence
  isActive: boolean;
  isPreviousCompleted: boolean;
  onStageNameChange?: (name: string) => void;
  onToggleInclusion?: () => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  onComplete,
  onUpdateNotes,
  onUpdateStageTimer,
  isActive,
  isPreviousCompleted,
  onStageNameChange,
  onToggleInclusion,
}) => {
  // Use refs for editing to avoid controlled component issues
  const stageNameRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [isEditingName, setIsEditingName] = useState((stage?.stageName || '') === 'New Stage');
  
  // Handle saving the stage name when editing is done
  const handleNameSave = () => {
    if (onStageNameChange && stageNameRef.current) {
      onStageNameChange(stageNameRef.current.value);
    }
    setIsEditingName(false);
  };
  // No longer using state for notes - using ref instead
  // Calculate elapsed time based on stage start time or stored elapsed seconds
  const calculateInitialElapsedTime = (): number => {
    // Guard against undefined/null stage
    if (!stage) return 0;
    
    // If we have stored elapsed seconds, use those
    if (typeof stage.elapsedSeconds === 'number') {
      return stage.elapsedSeconds;
    }
    
    // If the stage has a start time, calculate elapsed time from that
    if (stage.startTime) {
      try {
        const now = new Date();
        const startTime = new Date(stage.startTime);
        return Math.floor((now.getTime() - startTime.getTime()) / 1000);
      } catch (error) {
        console.error('Error calculating elapsed time:', error);
        return 0;
      }
    }
    
    // Default to 0 if no other data available
    return 0;
  };
  
  const [elapsedTime, setElapsedTime] = useState(calculateInitialElapsedTime());
  const [isPaused, setIsPaused] = useState(false);
  
  // Save the current timer value whenever it changes significantly
  useEffect(() => {
    // Don't save on initial render or small increments
    const shouldSave = elapsedTime > 0 && 
                      elapsedTime % 10 === 0 && // Save every 10 seconds
                      elapsedTime !== stage.elapsedSeconds;
    
    if (shouldSave && onUpdateStageTimer) {
      onUpdateStageTimer(elapsedTime);
    }
  }, [elapsedTime, stage?.elapsedSeconds, onUpdateStageTimer]);
  
  // Timer effect with safety checks
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Only run the timer if all conditions are met and stage exists
    if (isActive && stage && !stage.completed && !isPaused) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      
      // Save on unmount if active - with safety checks
      if (isActive && stage && !stage.completed && typeof onUpdateStageTimer === 'function' && elapsedTime > 0) {
        onUpdateStageTimer(elapsedTime);
      }
    };
  }, [isActive, stage, stage?.completed, isPaused, onUpdateStageTimer, elapsedTime]);
  
  // No longer needed as we're using uncontrolled components with refs
  
  // Format time from seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleNotesSave = () => {
    if (notesRef.current && typeof onUpdateNotes === 'function') {
      onUpdateNotes(notesRef.current.value);
    }
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  return (
    <motion.div
      className="my-4"
      animate={{
        scale: isActive ? 1 : 0.98,
        opacity: isActive ? 1 : 0.8
      }}
    >
      <Card className={`relative overflow-visible ${stage.completed ? 'bg-bread-brown-100' : 'bg-white'}`}>
        <div className="p-4">
           <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0 pl-6">
              {stage?.completed ? (
                <h3 className="font-medium text-lg text-bread-brown-800">
                  {stage?.stageName || ''}
                </h3>
              ) : isEditingName ? (
                <form onSubmit={(e) => { e.preventDefault(); handleNameSave(); }}>
                  <input
                    ref={stageNameRef}
                    type="text"
                    defaultValue={stage?.stageName || ''}
                    onBlur={handleNameSave}
                    autoFocus
                    className="font-medium text-lg text-bread-brown-800 bg-transparent border-b border-bread-brown-200 focus:outline-none focus:border-bread-crust"
                    placeholder="Stage name"
                  />
                </form>
              ) : (
                <h3 className="font-medium text-lg text-bread-brown-800 cursor-pointer" onClick={() => setIsEditingName(true)}>
                  {stage?.stageName || ''}
                </h3>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {stage.completed ? (
                <span className="flex items-center text-success-500 text-sm">
                  <CheckCircle size={16} className="mr-1" />
                  Complete
                </span>
              ) : isActive ? (
                <span className="flex items-center text-bread-crust text-sm">
                  <Clock size={16} className="mr-1" />
                  In Progress
                </span>
              ) : (
                <span className="flex items-center text-bread-brown-500 text-sm">
                  <Clock size={16} className="mr-1" />
                  Waiting
                </span>
              )}
              {!stage.completed && (
                <input
                  type="checkbox"
                  checked={stage.included}
                  onChange={onToggleInclusion || (() => {})} 
                  readOnly={!onToggleInclusion} 
                  className="accent-bread-crust ml-2"
                  title={stage.included ? 'Deselect stage' : 'Select stage'}
                />
              )}
            </div>
           </div>

          {(isActive || stage.completed) && (
            <div className="bg-bread-brown-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlarmClock size={16} className="text-bread-brown-400 mr-2" />
                  <span className="font-mono text-lg font-medium text-bread-brown-800">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                {isActive && stage && !stage.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePause}
                    icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <textarea
              ref={notesRef}
              placeholder="Add notes for this stage..."
              defaultValue={stage?.notes || ''}
              onBlur={handleNotesSave}
              className="w-full p-2 text-sm border border-bread-earth-yellow rounded-md min-h-[80px] focus:ring-bread-dark-moss-green focus:border-bread-crust"
              disabled={stage?.completed}
            />
          </div>

          {!stage?.completed && isActive && isPreviousCompleted && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                // Save the current elapsed time when marking complete
                if (onUpdateStageTimer) {
                  onUpdateStageTimer(elapsedTime);
                }
                // Then call onComplete with the current elapsed time
                onComplete(elapsedTime);
              }}
              icon={<CheckCircle size={16} />}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StageCard;
