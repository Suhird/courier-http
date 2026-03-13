import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import type { AuthConfig } from '../../types';

interface AuthTabProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

const AUTH_TYPES: { value: AuthConfig['type']; label: string }[] = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api-key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
];

const inputClass =
  'bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 w-full outline-none focus:border-orange-500/50';

export function AuthTab({ auth, onChange }: AuthTabProps) {
  function handleTypeChange(type: AuthConfig['type']) {
    onChange({ ...auth, type });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Auth type selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500 uppercase tracking-wider">Auth Type</label>
        <Select.Root value={auth.type} onValueChange={(val) => handleTypeChange(val as AuthConfig['type'])}>
          <Select.Trigger
            className="flex items-center justify-between bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-orange-500/50 cursor-pointer hover:border-gray-600 w-full"
            aria-label="Auth type"
          >
            <Select.Value />
            <ChevronDown size={13} className="text-gray-500 shrink-0" />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="z-50 bg-[#0d1b2a] border border-gray-700 rounded shadow-lg overflow-hidden"
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className="p-1">
                {AUTH_TYPES.map(({ value, label }) => (
                  <Select.Item
                    key={value}
                    value={value}
                    className="flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50"
                  >
                    <Select.ItemText>{label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Conditional fields */}
      {auth.type === 'none' && (
        <p className="text-gray-500 text-sm">No authentication</p>
      )}

      {auth.type === 'bearer' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Token</label>
          <input
            type="text"
            value={auth.bearer?.token ?? ''}
            onChange={(e) => onChange({ ...auth, bearer: { token: e.target.value } })}
            placeholder="Bearer token"
            className={inputClass}
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={auth.basic?.username ?? ''}
              onChange={(e) =>
                onChange({ ...auth, basic: { username: e.target.value, password: auth.basic?.password ?? '' } })
              }
              placeholder="Username"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={auth.basic?.password ?? ''}
              onChange={(e) =>
                onChange({ ...auth, basic: { username: auth.basic?.username ?? '', password: e.target.value } })
              }
              placeholder="Password"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Key Name</label>
            <input
              type="text"
              value={auth.apiKey?.key ?? ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  apiKey: { key: e.target.value, value: auth.apiKey?.value ?? '', addTo: auth.apiKey?.addTo ?? 'header' },
                })
              }
              placeholder="X-API-Key"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Value</label>
            <input
              type="text"
              value={auth.apiKey?.value ?? ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  apiKey: { key: auth.apiKey?.key ?? '', value: e.target.value, addTo: auth.apiKey?.addTo ?? 'header' },
                })
              }
              placeholder="API key value"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Add To</label>
            <Select.Root
              value={auth.apiKey?.addTo ?? 'header'}
              onValueChange={(val) =>
                onChange({
                  ...auth,
                  apiKey: { key: auth.apiKey?.key ?? '', value: auth.apiKey?.value ?? '', addTo: val as 'header' | 'query' },
                })
              }
            >
              <Select.Trigger
                className="flex items-center justify-between bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-orange-500/50 cursor-pointer hover:border-gray-600 w-full"
                aria-label="Add to"
              >
                <Select.Value />
                <ChevronDown size={13} className="text-gray-500 shrink-0" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="z-50 bg-[#0d1b2a] border border-gray-700 rounded shadow-lg overflow-hidden"
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport className="p-1">
                    <Select.Item
                      value="header"
                      className="flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50"
                    >
                      <Select.ItemText>Header</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      value="query"
                      className="flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50"
                    >
                      <Select.ItemText>Query Param</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>
      )}

      {auth.type === 'oauth2' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Access Token</label>
            <input
              type="text"
              value={auth.oauth2?.accessToken ?? ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  oauth2: {
                    accessToken: e.target.value,
                    tokenType: auth.oauth2?.tokenType ?? 'Bearer',
                    addTo: 'header',
                  },
                })
              }
              placeholder="Access token"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Token Type</label>
            <input
              type="text"
              value={auth.oauth2?.tokenType ?? 'Bearer'}
              onChange={(e) =>
                onChange({
                  ...auth,
                  oauth2: {
                    accessToken: auth.oauth2?.accessToken ?? '',
                    tokenType: e.target.value,
                    addTo: 'header',
                  },
                })
              }
              placeholder="Bearer"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Add To</label>
            <input
              type="text"
              value="Header"
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
