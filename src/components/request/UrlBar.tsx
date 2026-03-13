import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import type { HttpMethod } from '../../types';
import { MethodBadge } from '../shared/Badge';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface UrlBarProps {
  method: HttpMethod;
  url: string;
  isLoading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function UrlBar({ method, url, isLoading, onMethodChange, onUrlChange, onSend }: UrlBarProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-gray-800">
      {/* Method selector */}
      <Select.Root value={method} onValueChange={(val) => onMethodChange(val as HttpMethod)}>
        <Select.Trigger
          className="flex items-center gap-1.5 bg-[#16213e] border border-gray-700 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500/50 cursor-pointer hover:border-gray-600 shrink-0"
          aria-label="HTTP Method"
        >
          <Select.Value>
            <MethodBadge method={method} />
          </Select.Value>
          <ChevronDown size={12} className="text-gray-500" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-50 bg-[#0d1b2a] border border-gray-700 rounded shadow-lg overflow-hidden"
            position="popper"
            sideOffset={4}
          >
            <Select.Viewport className="p-1">
              {HTTP_METHODS.map((m) => (
                <Select.Item
                  key={m}
                  value={m}
                  className="flex items-center px-2 py-1.5 rounded cursor-pointer outline-none hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50"
                >
                  <Select.ItemText>
                    <MethodBadge method={m} />
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* URL input */}
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) onSend(); }}
        placeholder="https://api.example.com/endpoint"
        className="flex-1 bg-[#16213e] border border-gray-700 rounded px-3 py-1.5 text-base outline-none focus:border-orange-500/50 text-gray-200 placeholder-gray-600"
      />

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={isLoading}
        className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded disabled:opacity-50 shrink-0 transition-colors"
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </div>
  );
}
