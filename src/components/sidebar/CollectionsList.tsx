import { useState } from 'react';
import { ChevronRight, ChevronDown, Trash2, MoreHorizontal, FolderOpen, Download, Plus, GripVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';
import { MethodBadge } from '../shared/Badge';
import type { SavedRequest, RequestConfig } from '../../types';

// ---------------------------------------------------------------------------
// SortableRequestItem
// ---------------------------------------------------------------------------

function SortableRequestItem({
  item,
  onDelete,
  onLoad,
}: {
  item: SavedRequest;
  onDelete: () => void;
  onLoad: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 pl-6 pr-3 py-1.5 hover:bg-white/5 cursor-pointer text-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onLoad}
    >
      {/* Drag handle */}
      <span
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </span>

      <MethodBadge method={item.request.method} />
      <span className="text-gray-300 truncate flex-1">{item.name}</span>

      {isHovered && (
        <button
          className="p-0.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete request"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollectionsList
// ---------------------------------------------------------------------------

export function CollectionsList() {
  const { collections, saveCollection, deleteCollection, exportCollection, deleteRequestFromCollection } =
    useCollectionStore();
  const { activeTabId, addTab, loadRequestInTab } = useRequestStore();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCreateCollection() {
    if (!newName.trim()) return;
    saveCollection({ id: uuidv4(), name: newName.trim(), requests: [] });
    setNewName('');
    setIsCreating(false);
  }

  function handleDeleteCollection(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteCollection(id);
  }

  function handleExportCollection(id: string) {
    exportCollection(id);
  }

  function handleLoadRequest(collectionId: string, requestId: string, request: RequestConfig) {
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

  function handleDeleteRequest(collectionId: string, requestId: string) {
    deleteRequestFromCollection(collectionId, requestId);
  }

  function handleDragEnd(event: DragEndEvent, collectionId: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const oldIndex = collection.requests.findIndex((r) => r.id === active.id);
    const newIndex = collection.requests.findIndex((r) => r.id === over.id);
    const newRequests = arrayMove(collection.requests, oldIndex, newIndex);

    saveCollection({ ...collection, requests: newRequests });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {collections.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8 px-4">
            No collections yet
          </div>
        )}
        {collections.map((collection) => {
          const isExpanded = expandedIds.has(collection.id);
          const isHovered = hoveredCollectionId === collection.id;

          return (
            <div key={collection.id}>
              {/* Collection header */}
              <div
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5 cursor-pointer text-sm"
                onClick={() => toggleExpand(collection.id)}
                onMouseEnter={() => setHoveredCollectionId(collection.id)}
                onMouseLeave={() => setHoveredCollectionId(null)}
              >
                {/* Left: chevron + name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                  )}
                  <FolderOpen size={13} className="text-orange-400 flex-shrink-0" />
                  <span className="text-gray-200 truncate">{collection.name}</span>
                  <span className="text-gray-600 text-xs flex-shrink-0">
                    {collection.requests.length}
                  </span>
                </div>

                {/* Right: action buttons (visible on hover) */}
                {isHovered && (
                  <div
                    className="flex items-center gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="p-0.5 text-gray-500 hover:text-red-400 transition-colors"
                      onClick={(e) => handleDeleteCollection(e, collection.id)}
                      title="Delete collection"
                    >
                      <Trash2 size={13} />
                    </button>

                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          className="p-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-[#1a1a2e] border border-gray-700 rounded-md shadow-xl py-1 min-w-[140px] z-50"
                          side="right"
                          align="start"
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 cursor-pointer outline-none"
                            onSelect={() => handleExportCollection(collection.id)}
                          >
                            <Download size={13} />
                            Export
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
              </div>

              {/* Expanded request list */}
              {isExpanded && (
                <div>
                  {collection.requests.length === 0 && (
                    <div className="pl-8 pr-3 py-1.5 text-xs text-gray-600">
                      No requests
                    </div>
                  )}
                  {collection.requests.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, collection.id)}
                    >
                      <SortableContext
                        items={collection.requests.map((r) => r.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {collection.requests.map((req) => (
                          <SortableRequestItem
                            key={req.id}
                            item={req}
                            onDelete={() => handleDeleteRequest(collection.id, req.id)}
                            onLoad={() => handleLoadRequest(collection.id, req.id, req.request)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Collection */}
      <div className="border-t border-gray-800 p-2">
        {isCreating ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCollection();
                if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
              }}
              placeholder="Collection name"
              className="flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0"
            />
            <button
              onClick={handleCreateCollection}
              className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setIsCreating(false); setNewName(''); }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={13} />
            New Collection
          </button>
        )}
      </div>
    </div>
  );
}
