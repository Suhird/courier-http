import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import { Save } from 'lucide-react';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';
import { Sidebar } from './components/sidebar/Sidebar';
import { SaveRequestModal } from './components/sidebar/SaveRequestModal';
import { useCollectionStore } from './store/collectionStore';
import { useEnvironmentStore } from './store/environmentStore';
import { useHistoryStore } from './store/historyStore';
import { useRequestStore } from './store/requestStore';
import { RequestBuilder } from './components/request/RequestBuilder';
import { ResponseViewer } from './components/response/ResponseViewer';
export default function App() {
    const fetchCollections = useCollectionStore((s) => s.fetchCollections);
    const fetchEnvironments = useEnvironmentStore((s) => s.fetchEnvironments);
    const fetchHistory = useHistoryStore((s) => s.fetchHistory);
    const activeTabId = useRequestStore((s) => s.activeTabId);
    const tabs = useRequestStore((s) => s.tabs);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [requestHeight, setRequestHeight] = useState(340);
    const dragStartY = useRef(0);
    const dragStartHeight = useRef(0);
    const onPointerDown = useCallback((e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartY.current = e.clientY;
        dragStartHeight.current = requestHeight;
        document.body.style.cursor = 'row-resize';
    }, [requestHeight]);
    const onPointerMove = useCallback((e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId))
            return;
        const delta = e.clientY - dragStartY.current;
        const newHeight = Math.min(Math.max(dragStartHeight.current + delta, 150), 600);
        setRequestHeight(newHeight);
    }, []);
    const onPointerUp = useCallback((e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        document.body.style.cursor = '';
    }, []);
    useEffect(() => {
        fetchCollections();
        fetchEnvironments();
        fetchHistory();
    }, []);
    return (_jsxs("div", { className: "h-screen flex flex-col bg-[#0f0f1e] text-gray-200 overflow-hidden", children: [_jsx(TabBar, {}), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx("div", { className: "w-64 bg-[#1a1a2e] border-r border-gray-800 flex flex-col", children: _jsx(Sidebar, {}) }), _jsx("div", { className: "flex-1 flex overflow-hidden", children: _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("div", { className: "flex items-center justify-end px-3 py-1 bg-[#1a1a2e] border-b border-gray-800 flex-shrink-0", children: _jsxs("button", { onClick: () => setSaveModalOpen(true), className: "flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors", title: "Save current request to a collection", children: [_jsx(Save, { size: 14 }), _jsx("span", { className: "text-xs ml-0.5", children: "Save" })] }) }), _jsx("div", { style: { height: requestHeight }, className: "overflow-hidden flex-shrink-0", children: _jsx(RequestBuilder, {}) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("div", { onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, className: "h-1.5 bg-orange-500/60 hover:bg-orange-500 cursor-row-resize flex-shrink-0 transition-colors flex items-center justify-center group select-none", title: "Drag to resize", children: _jsx("div", { className: "w-8 h-0.5 rounded-full bg-orange-300/60 group-hover:bg-orange-200 transition-colors" }) }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(ResponseViewer, {}) })] })] }) })] }), _jsx(StatusBar, {}), activeTab && (_jsx(SaveRequestModal, { isOpen: saveModalOpen, onClose: () => setSaveModalOpen(false), requestConfig: activeTab.request }))] }));
}
