import { useState } from 'react';
import { Edit2, Trash2, Plus, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useEnvironmentStore } from '../../store/environmentStore';
import type { EnvVariable, Environment } from '../../types';

interface EditState {
  envId: string;
  variables: EnvVariable[];
}

export function EnvironmentsList() {
  const { environments, saveEnvironment, deleteEnvironment } = useEnvironmentStore();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreateEnvironment() {
    if (!newName.trim()) return;
    saveEnvironment({ id: uuidv4(), name: newName.trim(), variables: [] });
    setNewName('');
    setIsCreating(false);
  }

  function handleDeleteEnvironment(id: string) {
    deleteEnvironment(id);
    // Close edit panel if deleting the currently edited env
    if (editState?.envId === id) {
      setEditState(null);
    }
  }

  function handleEditOpen(env: Environment) {
    if (editState?.envId === env.id) {
      setEditState(null);
      return;
    }
    setEditState({
      envId: env.id,
      variables: env.variables.map((v) => ({ ...v })),
    });
  }

  function handleSaveEdit(env: Environment) {
    if (!editState) return;
    saveEnvironment({ ...env, variables: editState.variables });
    setEditState(null);
  }

  function handleAddVariable() {
    if (!editState) return;
    setEditState((prev) =>
      prev
        ? {
            ...prev,
            variables: [
              ...prev.variables,
              { id: uuidv4(), key: '', value: '', enabled: true },
            ],
          }
        : null,
    );
  }

  function handleDeleteVariable(varId: string) {
    if (!editState) return;
    setEditState((prev) =>
      prev
        ? { ...prev, variables: prev.variables.filter((v) => v.id !== varId) }
        : null,
    );
  }

  function handleVariableChange(varId: string, field: keyof EnvVariable, value: string | boolean) {
    if (!editState) return;
    setEditState((prev) =>
      prev
        ? {
            ...prev,
            variables: prev.variables.map((v) =>
              v.id === varId ? { ...v, [field]: value } : v,
            ),
          }
        : null,
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {environments.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8 px-4">
            No environments yet
          </div>
        )}
        {environments.map((env) => {
          const isEditing = editState?.envId === env.id;

          return (
            <div key={env.id} className="border-b border-gray-800/50">
              {/* Environment row */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-white/5 text-sm">
                <span className="text-gray-200 truncate flex-1">{env.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    className={`p-1 transition-colors ${
                      isEditing
                        ? 'text-orange-400'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    onClick={() => handleEditOpen(env)}
                    title="Edit variables"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    onClick={() => handleDeleteEnvironment(env.id)}
                    title="Delete environment"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Inline edit panel */}
              {isEditing && editState && (
                <div className="bg-[#13132a] border-t border-gray-800 px-3 py-2">
                  {/* Variable table */}
                  <div className="space-y-1 mb-2">
                    {editState.variables.length === 0 && (
                      <div className="text-xs text-gray-600 py-1">No variables</div>
                    )}
                    {editState.variables.map((v) => (
                      <div key={v.id} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={v.enabled}
                          onChange={(e) => handleVariableChange(v.id, 'enabled', e.target.checked)}
                          className="w-3 h-3 accent-orange-500 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={v.key}
                          onChange={(e) => handleVariableChange(v.id, 'key', e.target.value)}
                          placeholder="Key"
                          className="flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0"
                        />
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => handleVariableChange(v.id, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0"
                        />
                        <button
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                          onClick={() => handleDeleteVariable(v.id)}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add variable + Save */}
                  <div className="flex items-center justify-between">
                    <button
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      onClick={handleAddVariable}
                    >
                      <Plus size={11} />
                      Add Variable
                    </button>
                    <button
                      className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-2 py-0.5 rounded transition-colors"
                      onClick={() => handleSaveEdit(env)}
                    >
                      <Check size={11} />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Environment */}
      <div className="border-t border-gray-800 p-2">
        {isCreating ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateEnvironment();
                if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
              }}
              placeholder="Environment name"
              className="flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-orange-500/50 min-w-0"
            />
            <button
              onClick={handleCreateEnvironment}
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
            New Environment
          </button>
        )}
      </div>
    </div>
  );
}
