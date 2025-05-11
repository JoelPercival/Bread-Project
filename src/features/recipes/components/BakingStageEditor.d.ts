import { BakingStage } from '../../../types';

interface BakingStageEditorProps {
  stages: BakingStage[];
  onChange: (stages: BakingStage[]) => void;
}

declare const BakingStageEditor: React.FC<BakingStageEditorProps>;
export default BakingStageEditor;
