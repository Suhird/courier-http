import { create } from 'zustand';
import * as tauri from '../lib/tauri';
export const useEnvironmentStore = create()((set, get) => ({
    environments: [],
    activeEnvironmentId: null,
    isLoading: false,
    fetchEnvironments: async () => {
        set({ isLoading: true });
        try {
            const environments = await tauri.getEnvironments();
            set({ environments });
        }
        finally {
            set({ isLoading: false });
        }
    },
    saveEnvironment: async (environment) => {
        await tauri.saveEnvironment(environment);
        const environments = await tauri.getEnvironments();
        set({ environments });
    },
    deleteEnvironment: async (id) => {
        await tauri.deleteEnvironment(id);
        set((state) => ({
            environments: state.environments.filter((e) => e.id !== id),
            // Clear active environment if it was the deleted one
            activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        }));
    },
    setActiveEnvironment: (id) => {
        set({ activeEnvironmentId: id });
    },
    getActiveVariables: () => {
        const { environments, activeEnvironmentId } = get();
        if (activeEnvironmentId === null)
            return {};
        const env = environments.find((e) => e.id === activeEnvironmentId);
        if (!env)
            return {};
        return env.variables
            .filter((v) => v.enabled)
            .reduce((acc, v) => {
            acc[v.key] = v.value;
            return acc;
        }, {});
    },
}));
