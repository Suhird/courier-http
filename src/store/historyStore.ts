import { create } from 'zustand';
import type { HistoryEntry, AppendHistoryPayload } from '../types';
import * as tauri from '../lib/tauri';

interface HistoryState {
  entries: HistoryEntry[];
  isLoading: boolean;

  fetchHistory: () => Promise<void>;
  appendHistory: (payload: AppendHistoryPayload) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  entries: [],
  isLoading: false,

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const entries = await tauri.getHistory();
      set({ entries });
    } finally {
      set({ isLoading: false });
    }
  },

  appendHistory: async (payload: AppendHistoryPayload) => {
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
