import { create } from 'zustand';
import type { Environment } from '../types';
import * as tauri from '../lib/tauri';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  isLoading: boolean;

  fetchEnvironments: () => Promise<void>;
  saveEnvironment: (environment: Environment) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  setActiveEnvironment: (id: string | null) => void;

  // Returns variables of the active environment as a { key: value } map (enabled only)
  getActiveVariables: () => Record<string, string>;
}

export const useEnvironmentStore = create<EnvironmentState>()((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  isLoading: false,

  fetchEnvironments: async () => {
    set({ isLoading: true });
    try {
      const environments = await tauri.getEnvironments();
      set({ environments });
    } finally {
      set({ isLoading: false });
    }
  },

  saveEnvironment: async (environment: Environment) => {
    await tauri.saveEnvironment(environment);
    const environments = await tauri.getEnvironments();
    set({ environments });
  },

  deleteEnvironment: async (id: string) => {
    await tauri.deleteEnvironment(id);
    set((state) => ({
      environments: state.environments.filter((e) => e.id !== id),
      // Clear active environment if it was the deleted one
      activeEnvironmentId:
        state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
    }));
  },

  setActiveEnvironment: (id: string | null) => {
    set({ activeEnvironmentId: id });
  },

  getActiveVariables: (): Record<string, string> => {
    const { environments, activeEnvironmentId } = get();
    if (activeEnvironmentId === null) return {};

    const env = environments.find((e) => e.id === activeEnvironmentId);
    if (!env) return {};

    return env.variables
      .filter((v) => v.enabled)
      .reduce<Record<string, string>>((acc, v) => {
        acc[v.key] = v.value;
        return acc;
      }, {});
  },
}));
