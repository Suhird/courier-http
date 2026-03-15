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
import { UrlBar } from './components/request/UrlBar';
import { useRequestSend } from './hooks/useRequestSend';
export default function App() {
    const fetchCollections = useCollectionStore((s) => s.fetchCollections);
    const fetchEnvironments = useEnvironmentStore((s) => s.fetchEnvironments);
    const fetchHistory = useHistoryStore((s) => s.fetchHistory);
    const { tabs, activeTabId, updateTabRequest } = useRequestStore();
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const { handleSend } = useRequestSend();
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [leftWidth, setLeftWidth] = useState(480);
    const containerRef = useRef(null);
    const dragStartX = useRef(0);
    const dragStartWidth = useRef(0);
    const onDragStart = useCallback((e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartX.current = e.clientX;
        dragStartWidth.current = leftWidth;
        document.body.style.cursor = 'col-resize';
    }, [leftWidth]);
    const onDragMove = useCallback((e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId))
            return;
        const containerWidth = containerRef.current?.offsetWidth ?? 960;
        const maxWidth = containerWidth * 0.70;
        const delta = e.clientX - dragStartX.current;
        const newWidth = Math.min(Math.max(dragStartWidth.current + delta, 300), maxWidth);
        setLeftWidth(newWidth);
    }, []);
    const onDragEnd = useCallback((e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        document.body.style.cursor = '';
    }, []);
    useEffect(() => {
        fetchCollections();
        fetchEnvironments();
        fetchHistory();
    }, []);
    return (_jsxs("div", { className: "h-screen flex flex-col bg-[#0f0f1e] text-gray-200 overflow-hidden", children: [_jsx(TabBar, {}), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx("div", { className: "w-64 bg-[#1a1a2e] border-r border-gray-800 flex flex-col", children: _jsx(Sidebar, {}) }), _jsxs("div", { ref: containerRef, className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("div", { className: "flex items-center justify-end px-3 py-1 bg-[#1a1a2e] border-b border-gray-800 flex-shrink-0", children: _jsxs("button", { onClick: () => setSaveModalOpen(true), className: "flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors", title: "Save current request to a collection", children: [_jsx(Save, { size: 14 }), _jsx("span", { className: "text-xs ml-0.5", children: "Save" })] }) }), _jsx(UrlBar, { method: activeTab?.request.method ?? 'GET', url: activeTab?.request.url ?? '', isLoading: activeTab?.isLoading ?? false, onMethodChange: (method) => activeTab && updateTabRequest(activeTab.id, { method }), onUrlChange: (url) => activeTab && updateTabRequest(activeTab.id, { url }), onSend: handleSend }), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx("div", { style: { width: leftWidth }, className: "flex-shrink-0 overflow-hidden", children: _jsx(RequestBuilder, {}) }), _jsx("div", { onPointerDown: onDragStart, onPointerMove: onDragMove, onPointerUp: onDragEnd, className: "w-1.5 bg-gray-800 hover:bg-orange-500/60 cursor-col-resize flex-shrink-0 flex items-center justify-center group select-none transition-colors", title: "Drag to resize", children: _jsx("div", { className: "h-8 w-0.5 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" }) }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(ResponseViewer, {}) })] })] })] }), _jsx(StatusBar, {}), activeTab && (_jsx(SaveRequestModal, { isOpen: saveModalOpen, onClose: () => setSaveModalOpen(false), requestConfig: activeTab.request }))] }));
}
