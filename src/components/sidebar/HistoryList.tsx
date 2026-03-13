import { useHistoryStore } from '../../store/historyStore';
import { useRequestStore } from '../../store/requestStore';
import { MethodBadge } from '../shared/Badge';

function formatTimestamp(iso: string): string {
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

  function handleLoadEntry(request: import('../../types').RequestConfig) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Header row with clear button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 flex-shrink-0">
        <span className="text-xs text-gray-500 uppercase tracking-wide">History</span>
        {entries.length > 0 && (
          <button
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            onClick={handleClearHistory}
          >
            Clear
          </button>
        )}
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            No history yet
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer text-sm border-b border-gray-800/50"
              onClick={() => handleLoadEntry(entry.request)}
            >
              <MethodBadge method={entry.request.method} />
              <div className="min-w-0 flex-1">
                <div className="text-gray-300 truncate">{entry.request.url || '(no URL)'}</div>
                <div className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
