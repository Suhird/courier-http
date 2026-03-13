import { useState } from 'react';
import { FolderOpen, Clock, Globe } from 'lucide-react';
import { CollectionsList } from './CollectionsList';
import { HistoryList } from './HistoryList';
import { EnvironmentsList } from './EnvironmentsList';

type Section = 'collections' | 'history' | 'environments';

const sections: { id: Section; icon: typeof FolderOpen; label: string }[] = [
  { id: 'collections', icon: FolderOpen, label: 'Collections' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'environments', icon: Globe, label: 'Environments' },
];

export function Sidebar() {
  const [activeSection, setActiveSection] = useState<Section>('collections');

  return (
    <div className="flex flex-col h-full">
      {/* Section switcher */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-800 flex-shrink-0">
        {sections.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setActiveSection(id)}
            className={`p-1.5 rounded transition-colors ${
              activeSection === id
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'collections' && <CollectionsList />}
        {activeSection === 'history' && <HistoryList />}
        {activeSection === 'environments' && <EnvironmentsList />}
      </div>
    </div>
  );
}
