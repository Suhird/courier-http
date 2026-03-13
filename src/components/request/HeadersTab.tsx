import type { KeyValuePair } from '../../types';
import { KeyValueTable } from '../shared/KeyValueTable';

interface HeadersTabProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

export function HeadersTab({ pairs, onChange }: HeadersTabProps) {
  return (
    <div className="h-full overflow-auto">
      <KeyValueTable pairs={pairs} onChange={onChange} keyPlaceholder="header" valuePlaceholder="value" />
    </div>
  );
}
