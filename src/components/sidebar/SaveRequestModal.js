import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useCollectionStore } from '../../store/collectionStore';
export function SaveRequestModal({ isOpen, onClose, requestConfig }) {
    const { collections, saveCollection, saveRequestToCollection } = useCollectionStore();
    const [requestName, setRequestName] = useState('');
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const isNewCollection = selectedCollectionId === '__new__';
    async function handleSave() {
        if (!requestName.trim())
            return;
        setIsSaving(true);
        try {
            let collectionId = selectedCollectionId;
            if (isNewCollection) {
                if (!newCollectionName.trim())
                    return;
                const newCollection = {
                    id: uuidv4(),
                    name: newCollectionName.trim(),
                    requests: [],
                };
                await saveCollection(newCollection);
                collectionId = newCollection.id;
            }
            if (!collectionId)
                return;
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
        }
        finally {
            setIsSaving(false);
        }
    }
    function handleOpenChange(open) {
        if (!open) {
            onClose();
        }
    }
    return (_jsx(Dialog.Root, { open: isOpen, onOpenChange: handleOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/60 z-40" }), _jsxs(Dialog.Content, { className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-2xl w-[400px] p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Dialog.Title, { className: "text-gray-200 font-medium", children: "Save Request" }), _jsx(Dialog.Close, { asChild: true, children: _jsx("button", { className: "text-gray-500 hover:text-gray-300 transition-colors", children: _jsx(X, { size: 16 }) }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Request Name" }), _jsx("input", { type: "text", value: requestName, onChange: (e) => setRequestName(e.target.value), placeholder: "My Request", className: "w-full bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50", autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "Collection" }), _jsxs(Select.Root, { value: selectedCollectionId, onValueChange: setSelectedCollectionId, children: [_jsxs(Select.Trigger, { className: "w-full flex items-center justify-between bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-orange-500/50 data-[placeholder]:text-gray-600", children: [_jsx(Select.Value, { placeholder: "Select a collection..." }), _jsx(Select.Icon, { children: _jsx(ChevronDown, { size: 14, className: "text-gray-500" }) })] }), _jsx(Select.Portal, { children: _jsx(Select.Content, { className: "bg-[#1a1a2e] border border-gray-700 rounded-md shadow-xl overflow-hidden z-[60]", children: _jsxs(Select.Viewport, { className: "py-1", children: [collections.map((c) => (_jsx(Select.Item, { value: c.id, className: "flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5 cursor-pointer outline-none data-[highlighted]:bg-white/5", children: _jsx(Select.ItemText, { children: c.name }) }, c.id))), _jsx(Select.Separator, { className: "h-px bg-gray-700 my-1" }), _jsx(Select.Item, { value: "__new__", className: "flex items-center px-3 py-1.5 text-sm text-orange-400 hover:bg-white/5 cursor-pointer outline-none data-[highlighted]:bg-white/5", children: _jsx(Select.ItemText, { children: "+ New Collection..." }) })] }) }) })] })] }), isNewCollection && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-400 mb-1", children: "New Collection Name" }), _jsx("input", { type: "text", value: newCollectionName, onChange: (e) => setNewCollectionName(e.target.value), placeholder: "My Collection", className: "w-full bg-[#0f0f1e] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50" })] }))] }), _jsxs("div", { className: "flex items-center justify-end gap-2 mt-5", children: [_jsx(Dialog.Close, { asChild: true, children: _jsx("button", { className: "px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors", children: "Cancel" }) }), _jsx("button", { onClick: handleSave, disabled: isSaving ||
                                        !requestName.trim() ||
                                        !selectedCollectionId ||
                                        (isNewCollection && !newCollectionName.trim()), className: "px-4 py-1.5 text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: isSaving ? 'Saving...' : 'Save' })] })] })] }) }));
}
