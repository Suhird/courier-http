import type { BodyType, KeyValuePair, RequestConfig } from '../../types';
import { KeyValueTable } from '../shared/KeyValueTable';
import { MonacoEditor } from '../shared/MonacoEditor';

interface BodyTabProps {
  bodyType: BodyType;
  bodyRaw: string;
  bodyFormPairs: KeyValuePair[];
  onChange: (updates: Partial<Pick<RequestConfig, 'bodyType' | 'bodyRaw' | 'bodyFormPairs'>>) => void;
}

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'none' },
  { value: 'json', label: 'json' },
  { value: 'text', label: 'text' },
  { value: 'xml', label: 'xml' },
  { value: 'html', label: 'html' },
  { value: 'form-urlencoded', label: 'form-urlencoded' },
  { value: 'form-data', label: 'form-data' },
];

const LANGUAGE_MAP: Record<string, string> = {
  json: 'json',
  text: 'plaintext',
  xml: 'xml',
  html: 'html',
};

export function BodyTab({ bodyType, bodyRaw, bodyFormPairs, onChange }: BodyTabProps) {
  const isEditorType = bodyType === 'json' || bodyType === 'text' || bodyType === 'xml' || bodyType === 'html';
  const isFormType = bodyType === 'form-urlencoded' || bodyType === 'form-data';

  return (
    <div className="flex flex-col h-full">
      {/* Body type button group */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-800 flex-wrap">
        {BODY_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange({ bodyType: value })}
            className={
              bodyType === value
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 px-3 py-1 text-sm rounded'
                : 'text-gray-400 hover:text-gray-200 px-3 py-1 text-sm rounded'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {bodyType === 'none' && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No body
          </div>
        )}

        {isEditorType && (
          <MonacoEditor
            value={bodyRaw}
            onChange={(value) => onChange({ bodyRaw: value })}
            language={LANGUAGE_MAP[bodyType]}
            height="100%"
          />
        )}

        {isFormType && (
          <div className="h-full overflow-auto p-2">
            <KeyValueTable
              pairs={bodyFormPairs}
              onChange={(pairs) => onChange({ bodyFormPairs: pairs })}
              keyPlaceholder="key"
              valuePlaceholder="value"
            />
          </div>
        )}
      </div>
    </div>
  );
}
