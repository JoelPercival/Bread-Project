import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StageCard from './StageCard';

interface SortableStageCardProps {
  id: string;
  stage: {
    id: string;
    stageName?: string;
    name?: string;
    notes?: string;
    completed?: boolean;
    included?: boolean;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    elapsedSeconds?: number;
    lastUpdated?: Date;
    order?: number;
  };
  onComplete: (elapsedSeconds?: number) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateStageTimer?: (elapsedSeconds: number) => void;
  isActive: boolean;
  isPreviousCompleted: boolean;
  onStageNameChange?: (name: string) => void;
  onToggleInclusion?: () => void;
}

const SortableStageCard: React.FC<SortableStageCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Drag handle */}
      <div {...listeners} className="absolute left-0 top-4 cursor-grab z-10 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical text-bread-brown-400"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
      </div>
      <StageCard 
        stage={{
          id: props.stage.id || '',
          stageName: props.stage.stageName || props.stage.name || '',
          notes: props.stage.notes || '',
          completed: props.stage.completed || false,
          included: typeof props.stage.included === 'boolean' ? props.stage.included : true,
          startTime: props.stage.startTime,
          endTime: props.stage.endTime,
          duration: props.stage.duration,
          elapsedSeconds: props.stage.elapsedSeconds || 0,
          lastUpdated: props.stage.lastUpdated,
          order: props.stage.order || 0
        }}
        onComplete={props.onComplete}
        onUpdateNotes={props.onUpdateNotes}
        onUpdateStageTimer={props.onUpdateStageTimer}
        isActive={props.isActive}
        isPreviousCompleted={props.isPreviousCompleted}
        onStageNameChange={props.onStageNameChange}
        onToggleInclusion={props.onToggleInclusion}
      />
    </div>
  );
};

export default SortableStageCard;
