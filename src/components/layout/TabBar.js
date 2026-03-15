import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRequestStore } from '../../store/requestStore';
import { MethodBadge } from '../shared/Badge';
export function TabBar() {
    const tabs = useRequestStore((s) => s.tabs);
    const activeTabId = useRequestStore((s) => s.activeTabId);
    const addTab = useRequestStore((s) => s.addTab);
    const closeTab = useRequestStore((s) => s.closeTab);
    const setActiveTab = useRequestStore((s) => s.setActiveTab);
    function handleClose(e, tabId) {
        e.stopPropagation();
        closeTab(tabId);
    }
    return (_jsxs("div", { className: "bg-[#1a1a2e] flex items-center gap-0.5 px-2 border-b border-gray-800 overflow-x-auto shrink-0", children: [tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (_jsxs("div", { onClick: () => setActiveTab(tab.id), className: cn('px-3 py-2 flex items-center gap-2 cursor-pointer text-sm whitespace-nowrap hover:bg-white/5 rounded-t transition-colors', isActive
                        ? 'border-b-2 border-orange-500 text-gray-200'
                        : 'text-gray-400'), children: [_jsx(MethodBadge, { method: tab.request.method }), _jsx("span", { className: "max-w-[140px] truncate", children: tab.name }), _jsx("button", { onClick: (e) => handleClose(e, tab.id), className: "ml-1 p-0.5 rounded hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-colors", "aria-label": "Close tab", children: _jsx(X, { size: 12 }) })] }, tab.id));
            }), _jsx("button", { onClick: addTab, className: "ml-1 p-1.5 text-gray-600 hover:text-orange-400 hover:bg-white/5 rounded transition-colors shrink-0", "aria-label": "New tab", children: _jsx(Plus, { size: 14 }) })] }));
}
