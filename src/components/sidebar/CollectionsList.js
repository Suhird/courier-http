import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRight, ChevronDown, Trash2, MoreHorizontal, FolderOpen, Download, Plus, GripVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';
import { MethodBadge } from '../shared/Badge';
// ---------------------------------------------------------------------------
// SortableRequestItem
// ---------------------------------------------------------------------------
function SortableRequestItem({ item, onDelete, onLoad, }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const [isHovered, setIsHovered] = useState(false);
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, ...attributes, className: "flex items-center gap-2 pl-6 pr-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: onLoad, children: [_jsx("span", { ...listeners, className: "text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0", onClick: (e) => e.stopPropagation(), children: _jsx(GripVertical, { size: 13 }) }), _jsx(MethodBadge, { method: item.request.method }), _jsx("span", { className: "text-gray-300 truncate flex-1", children: item.name }), isHovered && (_jsx("button", { className: "p-0.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0", onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                }, title: "Delete request", children: _jsx(Trash2, { size: 12 }) }))] }));
}
// ---------------------------------------------------------------------------
// CollectionsList
// ---------------------------------------------------------------------------
export function CollectionsList() {
    const { collections, saveCollection, deleteCollection, exportCollection, deleteRequestFromCollection } = useCollectionStore();
    const { activeTabId, addTab, loadRequestInTab } = useRequestStore();
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [hoveredCollectionId, setHoveredCollectionId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    function toggleExpand(id) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    }
    function handleCreateCollection() {
        if (!newName.trim())
            return;
        saveCollection({ id: uuidv4(), name: newName.trim(), requests: [] });
        setNewName('');
        setIsCreating(false);
    }
    function handleDeleteCollection(e, id) {
        e.stopPropagation();
        deleteCollection(id);
    }
    function handleExportCollection(id) {
        exportCollection(id);
    }
    function handleLoadRequest(collectionId, requestId, request) {
        let tabId = activeTabId;
        if (!tabId) {
            addTab();
            // After addTab, activeTabId is updated — get the fresh value
            tabId = useRequestStore.getState().activeTabId;
        }
        if (tabId) {
            loadRequestInTab(tabId, request, requestId);
        }
    }
    function handleDeleteRequest(collectionId, requestId) {
        deleteRequestFromCollection(collectionId, requestId);
    }
    function handleDragEnd(event, collectionId) {
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        const collection = collections.find((c) => c.id === collectionId);
        if (!collection)
            return;
        const oldIndex = collection.requests.findIndex((r) => r.id === active.id);
        const newIndex = collection.requests.findIndex((r) => r.id === over.id);
        const newRequests = arrayMove(collection.requests, oldIndex, newIndex);
        saveCollection({ ...collection, requests: newRequests });
    }
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex-1 overflow-auto", children: [collections.length === 0 && (_jsx("div", { className: "text-center text-gray-600 text-sm py-8 px-4", children: "No collections yet" })), collections.map((collection) => {
                        const isExpanded = expandedIds.has(collection.id);
                        const isHovered = hoveredCollectionId === collection.id;
                        return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between px-3 py-2 hover:bg-white/5 cursor-pointer text-sm", onClick: () => toggleExpand(collection.id), onMouseEnter: () => setHoveredCollectionId(collection.id), onMouseLeave: () => setHoveredCollectionId(null), children: [_jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [isExpanded ? (_jsx(ChevronDown, { size: 14, className: "text-gray-400 flex-shrink-0" })) : (_jsx(ChevronRight, { size: 14, className: "text-gray-400 flex-shrink-0" })), _jsx(FolderOpen, { size: 13, className: "text-orange-400 flex-shrink-0" }), _jsx("span", { className: "text-gray-200 truncate", children: collection.name }), _jsx("span", { className: "text-gray-600 text-xs flex-shrink-0", children: collection.requests.length })] }), isHovered && (_jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "p-0.5 text-gray-500 hover:text-red-400 transition-colors", onClick: (e) => handleDeleteCollection(e, collection.id), title: "Delete collection", children: _jsx(Trash2, { size: 13 }) }), _jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsx("button", { className: "p-0.5 text-gray-500 hover:text-gray-300 transition-colors", title: "More options", children: _jsx(MoreHorizontal, { size: 13 }) }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "bg-[#1a1a2e] border border-gray-700 rounded-md shadow-xl py-1 min-w-[140px] z-50", side: "right", align: "start", children: _jsxs(DropdownMenu.Item, { className: "flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 cursor-pointer outline-none", onSelect: () => handleExportCollection(collection.id), children: [_jsx(Download, { size: 13 }), "Export"] }) }) })] })] }))] }), isExpanded && (_jsxs("div", { children: [collection.requests.length === 0 && (_jsx("div", { className: "pl-8 pr-3 py-1.5 text-xs text-gray-600", children: "No requests" })), collection.requests.length > 0 && (_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: (event) => handleDragEnd(event, collection.id), children: _jsx(SortableContext, { items: collection.requests.map((r) => r.id), strategy: verticalListSortingStrategy, children: collection.requests.map((req) => (_jsx(SortableRequestItem, { item: req, onDelete: () => handleDeleteRequest(collection.id, req.id), onLoad: () => handleLoadRequest(collection.id, req.id, req.request) }, req.id))) }) }))] }))] }, collection.id));
                    })] }), _jsx("div", { className: "border-t border-gray-800 p-2", children: isCreating ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("input", { autoFocus: true, type: "text", value: newName, onChange: (e) => setNewName(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter')
                                    handleCreateCollection();
                                if (e.key === 'Escape') {
                                    setIsCreating(false);
                                    setNewName('');
                                }
                            }, placeholder: "Collection name", className: "flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0" }), _jsx("button", { onClick: handleCreateCollection, className: "px-2 py-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors", children: "Add" }), _jsx("button", { onClick: () => { setIsCreating(false); setNewName(''); }, className: "px-2 py-1 text-xs text-gray-500 hover:text-gray-300 rounded transition-colors", children: "\u2715" })] })) : (_jsxs("button", { className: "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors", onClick: () => setIsCreating(true), children: [_jsx(Plus, { size: 13 }), "New Collection"] })) })] }));
}
