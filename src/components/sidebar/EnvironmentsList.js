import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Edit2, Trash2, Plus, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useEnvironmentStore } from '../../store/environmentStore';
export function EnvironmentsList() {
    const { environments, saveEnvironment, deleteEnvironment } = useEnvironmentStore();
    const [editState, setEditState] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    function handleCreateEnvironment() {
        if (!newName.trim())
            return;
        saveEnvironment({ id: uuidv4(), name: newName.trim(), variables: [] });
        setNewName('');
        setIsCreating(false);
    }
    function handleDeleteEnvironment(id) {
        deleteEnvironment(id);
        // Close edit panel if deleting the currently edited env
        if (editState?.envId === id) {
            setEditState(null);
        }
    }
    function handleEditOpen(env) {
        if (editState?.envId === env.id) {
            setEditState(null);
            return;
        }
        setEditState({
            envId: env.id,
            variables: env.variables.map((v) => ({ ...v })),
        });
    }
    function handleSaveEdit(env) {
        if (!editState)
            return;
        saveEnvironment({ ...env, variables: editState.variables });
        setEditState(null);
    }
    function handleAddVariable() {
        if (!editState)
            return;
        setEditState((prev) => prev
            ? {
                ...prev,
                variables: [
                    ...prev.variables,
                    { id: uuidv4(), key: '', value: '', enabled: true },
                ],
            }
            : null);
    }
    function handleDeleteVariable(varId) {
        if (!editState)
            return;
        setEditState((prev) => prev
            ? { ...prev, variables: prev.variables.filter((v) => v.id !== varId) }
            : null);
    }
    function handleVariableChange(varId, field, value) {
        if (!editState)
            return;
        setEditState((prev) => prev
            ? {
                ...prev,
                variables: prev.variables.map((v) => v.id === varId ? { ...v, [field]: value } : v),
            }
            : null);
    }
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex-1 overflow-auto", children: [environments.length === 0 && (_jsx("div", { className: "text-center text-gray-600 text-sm py-8 px-4", children: "No environments yet" })), environments.map((env) => {
                        const isEditing = editState?.envId === env.id;
                        return (_jsxs("div", { className: "border-b border-gray-800/50", children: [_jsxs("div", { className: "flex items-center justify-between px-3 py-2 hover:bg-white/5 text-sm", children: [_jsx("span", { className: "text-gray-200 truncate flex-1", children: env.name }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsx("button", { className: `p-1 transition-colors ${isEditing
                                                        ? 'text-orange-400'
                                                        : 'text-gray-500 hover:text-gray-300'}`, onClick: () => handleEditOpen(env), title: "Edit variables", children: _jsx(Edit2, { size: 12 }) }), _jsx("button", { className: "p-1 text-gray-500 hover:text-red-400 transition-colors", onClick: () => handleDeleteEnvironment(env.id), title: "Delete environment", children: _jsx(Trash2, { size: 12 }) })] })] }), isEditing && editState && (_jsxs("div", { className: "bg-[#13132a] border-t border-gray-800 px-3 py-2", children: [_jsxs("div", { className: "space-y-1 mb-2", children: [editState.variables.length === 0 && (_jsx("div", { className: "text-xs text-gray-600 py-1", children: "No variables" })), editState.variables.map((v) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("input", { type: "checkbox", checked: v.enabled, onChange: (e) => handleVariableChange(v.id, 'enabled', e.target.checked), className: "w-3 h-3 accent-orange-500 flex-shrink-0" }), _jsx("input", { type: "text", value: v.key, onChange: (e) => handleVariableChange(v.id, 'key', e.target.value), placeholder: "Key", className: "flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0" }), _jsx("input", { type: "text", value: v.value, onChange: (e) => handleVariableChange(v.id, 'value', e.target.value), placeholder: "Value", className: "flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0" }), _jsx("button", { className: "text-gray-600 hover:text-red-400 transition-colors flex-shrink-0", onClick: () => handleDeleteVariable(v.id), children: _jsx(Trash2, { size: 11 }) })] }, v.id)))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { className: "flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors", onClick: handleAddVariable, children: [_jsx(Plus, { size: 11 }), "Add Variable"] }), _jsxs("button", { className: "flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-2 py-0.5 rounded transition-colors", onClick: () => handleSaveEdit(env), children: [_jsx(Check, { size: 11 }), "Save"] })] })] }))] }, env.id));
                    })] }), _jsx("div", { className: "border-t border-gray-800 p-2", children: isCreating ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("input", { autoFocus: true, type: "text", value: newName, onChange: (e) => setNewName(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter')
                                    handleCreateEnvironment();
                                if (e.key === 'Escape') {
                                    setIsCreating(false);
                                    setNewName('');
                                }
                            }, placeholder: "Environment name", className: "flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0" }), _jsx("button", { onClick: handleCreateEnvironment, className: "px-2 py-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors", children: "Add" }), _jsx("button", { onClick: () => { setIsCreating(false); setNewName(''); }, className: "px-2 py-1 text-xs text-gray-500 hover:text-gray-300 rounded transition-colors", children: "\u2715" })] })) : (_jsxs("button", { className: "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors", onClick: () => setIsCreating(true), children: [_jsx(Plus, { size: 13 }), "New Environment"] })) })] }));
}
