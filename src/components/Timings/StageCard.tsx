import React, { useState, useEffect } from 'react';
import { StageProgress } from '../../types';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlarmClock, Play, Pause } from 'lucide-react';

interface StageCardProps {
  stage: StageProgress;
  onComplete: () => void;
  onUpdateNotes: (notes: string) => void;
  isActive: boolean;
  isPreviousCompleted: boolean;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  onComplete,
  onUpdateNotes,
  isActive,
  isPreviousCompleted,
}) => {
  const [notes, setNotes] = useState(stage.notes);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && !stage.completed && !isPaused) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, stage.completed, isPaused]);
  
  // Format time from seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const handleNotesSave = () => {
    onUpdateNotes(notes);
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-lg text-bread-brown-800">
              {stage.stageName}
            </h3>
            
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
                
                {isActive && !stage.completed && (
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
              placeholder="Add notes for this stage..."
              value={notes}
              onChange={handleNotesChange}
              onBlur={handleNotesSave}
              className="w-full p-2 text-sm border border-bread-earth-yellow rounded-md min-h-[80px] focus:ring-bread-dark-moss-green focus:border-bread-dark-moss-green"
              disabled={stage.completed}
            />
          </div>
          
          {!stage.completed && isActive && isPreviousCompleted && (
            <Button
              variant="primary"
              fullWidth
              onClick={onComplete}
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