import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StageCard from './StageCard';

interface SortableStageCardProps {
  id: string;
  stage: any;
  onComplete: () => void;
  onUpdateNotes: (notes: string) => void;
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
      <StageCard {...props} onStageNameChange={props.onStageNameChange} onToggleInclusion={props.onToggleInclusion} />
    </div>
  );
};

export default SortableStageCard;
