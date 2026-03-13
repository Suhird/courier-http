import { create } from 'zustand';
import type { Collection, SavedRequest } from '../types';
import * as tauri from '../lib/tauri';

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;

  fetchCollections: () => Promise<void>;
  saveCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  exportCollection: (id: string) => Promise<void>;
  saveRequestToCollection: (collectionId: string, request: SavedRequest) => Promise<void>;
  deleteRequestFromCollection: (collectionId: string, requestId: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>()((set) => ({
  collections: [],
  isLoading: false,

  fetchCollections: async () => {
    set({ isLoading: true });
    try {
      const collections = await tauri.getCollections();
      set({ collections });
    } finally {
      set({ isLoading: false });
    }
  },

  saveCollection: async (collection: Collection) => {
    await tauri.saveCollection(collection);
    const collections = await tauri.getCollections();
    set({ collections });
  },

  deleteCollection: async (id: string) => {
    await tauri.deleteCollection(id);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
  },

  exportCollection: async (id: string) => {
    await tauri.exportCollection(id);
  },

  saveRequestToCollection: async (collectionId: string, request: SavedRequest) => {
    const updatedCollection = await tauri.saveRequestToCollection(collectionId, request);
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId ? updatedCollection : c,
      ),
    }));
  },

  deleteRequestFromCollection: async (collectionId: string, requestId: string) => {
    const updatedCollection = await tauri.deleteRequestFromCollection(collectionId, requestId);
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId ? updatedCollection : c,
      ),
    }));
  },
}));
