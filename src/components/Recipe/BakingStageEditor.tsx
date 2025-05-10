import React from 'react';
import { BakingStage } from '../../types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, X, Plus, Edit } from 'lucide-react';
import Button from '../UI/Button';
import { AnimatePresence, motion } from 'framer-motion';

interface BakingStageEditorProps {
  stages: BakingStage[];
  onChange: (stages: BakingStage[]) => void;
}

const BakingStageEditor: React.FC<BakingStageEditorProps> = ({
  stages,
  onChange,
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    onChange(updatedItems);
  };
  
  const toggleStageInclusion = (id: string) => {
    onChange(
      stages.map(stage =>
        stage.id === id ? { ...stage, included: !stage.included } : stage
      )
    );
  };
  
  const handleRemoveStage = (id: string) => {
    onChange(stages.filter(stage => stage.id !== id));
  };
  
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
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="baking-stages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              <AnimatePresence>
                {stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided) => (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center p-3 bg-white rounded-md shadow-sm ${
                          !stage.included ? 'opacity-60' : ''
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                          <GripVertical size={18} className="text-bread-brown-400" />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="inline-block">
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => handleEditStageName(stage.id, e.target.value)}
                              className="font-medium text-bread-brown-800 bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleStageInclusion(stage.id)}
                            className={`w-4 h-4 rounded-sm mr-2 border ${
                              stage.included
                                ? 'bg-bread-crust border-bread-crust'
                                : 'border-bread-brown-300'
                            }`}
                          >
                            {stage.included && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-full h-full text-white"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveStage(stage.id)}
                            className="text-bread-brown-400 hover:text-bread-brown-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
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