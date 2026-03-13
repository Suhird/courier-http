import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useCollectionStore } from '../../store/collectionStore';
import type { RequestConfig } from '../../types';

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestConfig: RequestConfig;
}

export function SaveRequestModal({ isOpen, onClose, requestConfig }: SaveRequestModalProps) {
  const { collections, saveCollection, saveRequestToCollection } = useCollectionStore();

  const [requestName, setRequestName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isNewCollection = selectedCollectionId === '__new__';

  async function handleSave() {
    if (!requestName.trim()) return;

    setIsSaving(true);
    try {
      let collectionId = selectedCollectionId;

      if (isNewCollection) {
        if (!newCollectionName.trim()) return;
        const newCollection = {
          id: uuidv4(),
          name: newCollectionName.trim(),
          requests: [],
        };
        await saveCollection(newCollection);
        collectionId = newCollection.id;
      }

      if (!collectionId) return;

      await saveRequestToCollection(collectionId, {
        id: uuidv4(),
        name: requestName.trim(),
        request: requestConfig,
      });

      // Reset and close
      setRequestName('');
      setSelectedCollectionId('');
      setNewCollectionName('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl w-[400px] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-gray-200 font-medium">
              Save Request
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {/* Request name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Request Name</label>
              <input
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="My Request"
                className="w-full bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50"
                autoFocus
              />
            </div>

            {/* Collection selector */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Collection</label>
              <Select.Root value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                <Select.Trigger className="w-full flex items-center justify-between bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-orange-500/50 data-[placeholder]:text-gray-600">
                  <Select.Value placeholder="Select a collection..." />
                  <Select.Icon>
                    <ChevronDown size={14} className="text-gray-500" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-[#1a1a2e] border border-gray-700 rounded-md shadow-xl overflow-hidden z-[60]">
                    <Select.Viewport className="py-1">
                      {collections.map((c) => (
                        <Select.Item
                          key={c.id}
                          value={c.id}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 cursor-pointer outline-none data-[highlighted]:bg-white/5"
                        >
                          <Select.ItemText>{c.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                      <Select.Separator className="h-px bg-gray-700 my-1" />
                      <Select.Item
                        value="__new__"
                        className="flex items-center px-3 py-1.5 text-sm text-orange-400 hover:bg-white/5 cursor-pointer outline-none data-[highlighted]:bg-white/5"
                      >
                        <Select.ItemText>+ New Collection...</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* New collection name (conditional) */}
            {isNewCollection && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">New Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="My Collection"
                  className="w-full bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                !requestName.trim() ||
                !selectedCollectionId ||
                (isNewCollection && !newCollectionName.trim())
              }
              className="px-4 py-1.5 text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
