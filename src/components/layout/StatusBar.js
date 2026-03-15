import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';
export function StatusBar() {
    const environments = useEnvironmentStore((s) => s.environments);
    const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);
    const setActiveEnvironment = useEnvironmentStore((s) => s.setActiveEnvironment);
    const activeEnv = environments.find((e) => e.id === activeEnvironmentId);
    function handleValueChange(value) {
        setActiveEnvironment(value === 'none' ? null : value);
    }
    return (_jsxs("div", { className: "bg-[#0a0a14] text-xs text-gray-400 px-3 py-1 flex items-center gap-3 border-t border-gray-800 shrink-0", children: [_jsx("span", { className: "text-gray-600", children: "Environment:" }), _jsxs(Select.Root, { value: activeEnvironmentId ?? 'none', onValueChange: handleValueChange, children: [_jsxs(Select.Trigger, { className: "flex items-center gap-1 text-xs text-gray-300 hover:text-orange-400 transition-colors outline-none cursor-pointer", children: [_jsx(Select.Value, { children: activeEnv?.name ?? 'No Environment' }), _jsx(ChevronDown, { size: 11, className: "text-gray-600" })] }), _jsx(Select.Portal, { children: _jsx(Select.Content, { className: "z-50 bg-[#1a1a2e] border border-gray-700 rounded shadow-xl overflow-hidden", position: "popper", sideOffset: 4, align: "start", children: _jsxs(Select.Viewport, { className: "p-1", children: [_jsxs(Select.Item, { value: "none", className: "flex items-center justify-between gap-6 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded cursor-pointer outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-200", children: [_jsx(Select.ItemText, { children: "No Environment" }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { size: 11, className: "text-orange-400" }) })] }), environments.length > 0 && (_jsx(Select.Separator, { className: "my-1 h-px bg-gray-700" })), environments.map((env) => (_jsxs(Select.Item, { value: env.id, className: "flex items-center justify-between gap-6 px-3 py-1.5 text-xs text-gray-300 hover:text-gray-100 hover:bg-white/5 rounded cursor-pointer outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-gray-100", children: [_jsx(Select.ItemText, { children: env.name }), _jsx(Select.ItemIndicator, { children: _jsx(Check, { size: 11, className: "text-orange-400" }) })] }, env.id)))] }) }) })] })] }));
}
