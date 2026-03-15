import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FolderOpen, Clock, Globe } from 'lucide-react';
import { CollectionsList } from './CollectionsList';
import { HistoryList } from './HistoryList';
import { EnvironmentsList } from './EnvironmentsList';
const sections = [
    { id: 'collections', icon: FolderOpen, label: 'Collections' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'environments', icon: Globe, label: 'Environments' },
];
export function Sidebar() {
    const [activeSection, setActiveSection] = useState('collections');
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "flex items-center gap-1 p-2 border-b border-gray-800 flex-shrink-0", children: sections.map(({ id, icon: Icon, label }) => (_jsx("button", { title: label, onClick: () => setActiveSection(id), className: `p-1.5 rounded transition-colors ${activeSection === id
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-gray-500 hover:text-gray-300'}`, children: _jsx(Icon, { size: 16 }) }, id))) }), _jsxs("div", { className: "flex-1 overflow-auto", children: [activeSection === 'collections' && _jsx(CollectionsList, {}), activeSection === 'history' && _jsx(HistoryList, {}), activeSection === 'environments' && _jsx(EnvironmentsList, {})] })] }));
}
