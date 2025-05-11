import React from 'react';
import { BakingStage } from '../../../types';
import { SortableProvider } from '../../../components/Timings/SortableContext';
import SortableStageCard from '../../baking/components/stages/SortableStageCard';
import { Plus } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { AnimatePresence } from 'framer-motion';

interface BakingStageEditorProps {
  stages: BakingStage[];
  onChange: (stages: BakingStage[]) => void;
}

const BakingStageEditor: React.FC<BakingStageEditorProps> = ({
  stages,
  onChange,
}) => {
  // Handler for drag-and-drop reordering using @dnd-kit
  const handleDragEnd = (activeId: string, overId: string | null) => {
    if (!overId || activeId === overId) return;
    const oldIndex = stages.findIndex((stage) => stage.id === activeId);
    const newIndex = stages.findIndex((stage) => stage.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const newStages = [...stages];
    const [moved] = newStages.splice(oldIndex, 1);
    newStages.splice(newIndex, 0, moved);
    // Update order property for each stage
    const updatedStages = newStages.map((item, idx) => ({ ...item, order: idx }));
    onChange(updatedStages);
  };
  
  const toggleStageInclusion = (id: string) => {
    onChange(
      stages.map(stage =>
        stage.id === id ? { ...stage, included: !stage.included } : stage
      )
    );
  };
  
  // The remove functionality is handled by the toggle inclusion feature instead
  // We're keeping stages and just marking them as not included rather than removing them
  
  const handleAddStage = () => {
    const newStage: BakingStage = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Stage',
      order: stages.length,
      included: true,
      description: ''
    };
    
    onChange([...stages, newStage]);
  };
  
  const handleEditStageName = (id: string, name: string) => {
    onChange(
      stages.map(stage =>
        stage.id === id ? { ...stage, name } : stage
      )
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-bread-brown-700">Baking Stages</h3>
      </div>
      <SortableProvider items={stages.map(s => s.id)} onDragEnd={handleDragEnd}>
        <div className="space-y-2">
          <AnimatePresence>
            {[...stages].sort((a, b) => a.order - b.order).map((stage) => (
              <SortableStageCard
                key={stage.id}
                id={stage.id}
                stage={{
                  ...stage,
                  stageName: stage.name || '',
                  name: stage.name || '',
                }}
                isActive={false}
                isPreviousCompleted={true}
                onComplete={() => {}}
                onUpdateNotes={() => {}}
                onStageNameChange={(name: string) => handleEditStageName(stage.id, name)}
                onToggleInclusion={() => toggleStageInclusion(stage.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableProvider>
      <Button
        variant="outline"
        onClick={handleAddStage}
        icon={<Plus size={16} />}
        className="w-full mt-2"
      >
        Add Stage
      </Button>
    </div>
  );
};

export default BakingStageEditor;
