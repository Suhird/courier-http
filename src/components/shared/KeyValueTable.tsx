import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { KeyValuePair } from '../../types';

interface KeyValueTableProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueTable({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueTableProps) {
  function handleToggle(id: string, enabled: boolean) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, enabled } : p)));
  }

  function handleKeyChange(id: string, key: string) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, key } : p)));
  }

  function handleValueChange(id: string, value: string) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, value } : p)));
  }

  function handleDelete(id: string) {
    onChange(pairs.filter((p) => p.id !== id));
  }

  function handleAdd() {
    onChange([...pairs, { id: uuidv4(), key: '', value: '', enabled: true }]);
  }

  return (
    <div className="flex flex-col gap-0.5">
      {pairs.map((pair) => (
        <div
          key={pair.id}
          className="flex items-center gap-2 bg-[#16213e] rounded px-2 py-0.5 group"
        >
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => handleToggle(pair.id, e.target.checked)}
            className="w-3.5 h-3.5 shrink-0 accent-orange-500 cursor-pointer"
          />
          <input
            type="text"
            value={pair.key}
            onChange={(e) => handleKeyChange(pair.id, e.target.value)}
            placeholder={keyPlaceholder}
            className="bg-transparent border-0 outline-none text-sm text-gray-200 placeholder-gray-600 w-full px-2 py-1.5"
          />
          <div className="w-px h-4 bg-gray-700 shrink-0" />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => handleValueChange(pair.id, e.target.value)}
            placeholder={valuePlaceholder}
            className="bg-transparent border-0 outline-none text-sm text-gray-200 placeholder-gray-600 w-full px-2 py-1.5"
          />
          <button
            onClick={() => handleDelete(pair.id)}
            className="shrink-0 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete row"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 mt-1 px-2 py-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors w-fit"
      >
        <Plus size={13} />
        Add
      </button>
    </div>
  );
}
