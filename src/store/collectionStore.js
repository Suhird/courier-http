import { create } from 'zustand';
import * as tauri from '../lib/tauri';
export const useCollectionStore = create()((set) => ({
    collections: [],
    isLoading: false,
    fetchCollections: async () => {
        set({ isLoading: true });
        try {
            const collections = await tauri.getCollections();
            set({ collections });
        }
        finally {
            set({ isLoading: false });
        }
    },
    saveCollection: async (collection) => {
        await tauri.saveCollection(collection);
        const collections = await tauri.getCollections();
        set({ collections });
    },
    deleteCollection: async (id) => {
        await tauri.deleteCollection(id);
        set((state) => ({
            collections: state.collections.filter((c) => c.id !== id),
        }));
    },
    exportCollection: async (id) => {
        await tauri.exportCollection(id);
    },
    saveRequestToCollection: async (collectionId, request) => {
        const updatedCollection = await tauri.saveRequestToCollection(collectionId, request);
        set((state) => ({
            collections: state.collections.map((c) => c.id === collectionId ? updatedCollection : c),
        }));
    },
    deleteRequestFromCollection: async (collectionId, requestId) => {
        const updatedCollection = await tauri.deleteRequestFromCollection(collectionId, requestId);
        set((state) => ({
            collections: state.collections.map((c) => c.id === collectionId ? updatedCollection : c),
        }));
    },
}));
