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

  function handleClose(e: React.MouseEvent, tabId: string) {
    e.stopPropagation();
    closeTab(tabId);
  }

  return (
    <div className="bg-[#1a1a2e] flex items-center gap-0.5 px-2 border-b border-gray-800 overflow-x-auto shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2 flex items-center gap-2 cursor-pointer text-sm whitespace-nowrap hover:bg-white/5 rounded-t transition-colors',
              isActive
                ? 'border-b-2 border-orange-500 text-gray-200'
                : 'text-gray-400',
            )}
          >
            <MethodBadge method={tab.request.method} />
            <span className="max-w-[140px] truncate">{tab.name}</span>
            <button
              onClick={(e) => handleClose(e, tab.id)}
              className="ml-1 p-0.5 rounded hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-colors"
              aria-label="Close tab"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <button
        onClick={addTab}
        className="ml-1 p-1.5 text-gray-600 hover:text-orange-400 hover:bg-white/5 rounded transition-colors shrink-0"
        aria-label="New tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
