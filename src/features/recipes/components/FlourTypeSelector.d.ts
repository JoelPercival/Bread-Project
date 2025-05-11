import { FlourType } from '../../../types';

interface FlourTypeSelectorProps {
  flourTypes: FlourType[];
  onChange: (flourTypes: FlourType[]) => void;
  availableFlourTypes: FlourType[];
}

declare const FlourTypeSelector: React.FC<FlourTypeSelectorProps>;
export default FlourTypeSelector;
