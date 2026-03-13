import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';

export function StatusBar() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore((s) => s.setActiveEnvironment);

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  function handleValueChange(value: string) {
    setActiveEnvironment(value === 'none' ? null : value);
  }

  return (
    <div className="bg-[#0a0a14] text-xs text-gray-400 px-3 py-1 flex items-center gap-3 border-t border-gray-800 shrink-0">
      <span className="text-gray-600">Environment:</span>

      <Select.Root
        value={activeEnvironmentId ?? 'none'}
        onValueChange={handleValueChange}
      >
        <Select.Trigger className="flex items-center gap-1 text-xs text-gray-300 hover:text-orange-400 transition-colors outline-none cursor-pointer">
          <Select.Value>{activeEnv?.name ?? 'No Environment'}</Select.Value>
          <ChevronDown size={11} className="text-gray-600" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-50 bg-[#1a1a2e] border border-gray-700 rounded shadow-xl overflow-hidden"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <Select.Viewport className="p-1">
              <Select.Item
                value="none"
                className="flex items-center justify-between gap-6 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded cursor-pointer outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-200"
              >
                <Select.ItemText>No Environment</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={11} className="text-orange-400" />
                </Select.ItemIndicator>
              </Select.Item>

              {environments.length > 0 && (
                <Select.Separator className="my-1 h-px bg-gray-700" />
              )}

              {environments.map((env) => (
                <Select.Item
                  key={env.id}
                  value={env.id}
                  className="flex items-center justify-between gap-6 px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 hover:bg-white/5 rounded cursor-pointer outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-100"
                >
                  <Select.ItemText>{env.name}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={11} className="text-orange-400" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
