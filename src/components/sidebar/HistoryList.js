import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useHistoryStore } from '../../store/historyStore';
import { useRequestStore } from '../../store/requestStore';
import { MethodBadge } from '../shared/Badge';
function formatTimestamp(iso) {
    const date = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${hours}:${minutes}`;
}
export function HistoryList() {
    const { entries, clearHistory } = useHistoryStore();
    const { activeTabId, addTab, loadRequestInTab } = useRequestStore();
    function handleLoadEntry(request) {
        let tabId = activeTabId;
        if (!tabId) {
            addTab();
            tabId = useRequestStore.getState().activeTabId;
        }
        if (tabId) {
            loadRequestInTab(tabId, request);
        }
    }
    function handleClearHistory() {
        if (window.confirm('Clear all history?')) {
            clearHistory();
        }
    }
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-gray-800 flex-shrink-0", children: [_jsx("span", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "History" }), entries.length > 0 && (_jsx("button", { className: "text-xs text-gray-500 hover:text-red-400 transition-colors", onClick: handleClearHistory, children: "Clear" }))] }), _jsx("div", { className: "flex-1 overflow-auto", children: entries.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-gray-600 text-sm", children: "No history yet" })) : (entries.map((entry) => (_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer text-sm border-b border-gray-800/50", onClick: () => handleLoadEntry(entry.request), children: [_jsx(MethodBadge, { method: entry.request.method }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "text-gray-300 truncate", children: entry.request.url || '(no URL)' }), _jsx("div", { className: "text-xs text-gray-500", children: formatTimestamp(entry.timestamp) })] })] }, entry.id)))) })] }));
}
