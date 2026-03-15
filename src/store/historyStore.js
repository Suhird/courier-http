import { create } from 'zustand';
import * as tauri from '../lib/tauri';
export const useHistoryStore = create()((set) => ({
    entries: [],
    isLoading: false,
    fetchHistory: async () => {
        set({ isLoading: true });
        try {
            const entries = await tauri.getHistory();
            set({ entries });
        }
        finally {
            set({ isLoading: false });
        }
    },
    appendHistory: async (payload) => {
        const entry = await tauri.appendHistory(payload);
        set((state) => ({
            entries: [entry, ...state.entries],
        }));
    },
    clearHistory: async () => {
        await tauri.clearHistory();
        set({ entries: [] });
    },
}));
