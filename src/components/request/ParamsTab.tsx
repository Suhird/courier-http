import type { KeyValuePair } from '../../types';
import { KeyValueTable } from '../shared/KeyValueTable';

interface ParamsTabProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

export function ParamsTab({ pairs, onChange }: ParamsTabProps) {
  return (
    <div className="h-full overflow-auto">
      <KeyValueTable pairs={pairs} onChange={onChange} keyPlaceholder="param" valuePlaceholder="value" />
    </div>
  );
}
