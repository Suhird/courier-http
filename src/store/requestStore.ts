import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RequestTab, RequestConfig, HttpResponse } from '../types';

const defaultRequest = (): RequestConfig => ({
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  auth: { type: 'none' },
  bodyType: 'none',
  bodyRaw: '',
  bodyFormPairs: [],
});

const createTab = (overrides?: Partial<RequestTab>): RequestTab => ({
  id: uuidv4(),
  name: 'New Request',
  request: defaultRequest(),
  isLoading: false,
  ...overrides,
});

interface RequestState {
  tabs: RequestTab[];
  activeTabId: string | null;

  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabRequest: (id: string, updates: Partial<RequestConfig>) => void;
  setTabResponse: (id: string, response: HttpResponse) => void;
  setTabLoading: (id: string, loading: boolean) => void;
  loadRequestInTab: (tabId: string, request: RequestConfig, savedRequestId?: string) => void;
}

const initialTab = createTab();

export const useRequestStore = create<RequestState>()((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,

  addTab: () => {
    const tab = createTab();
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  closeTab: (id: string) => {
    set((state) => {
      const index = state.tabs.findIndex((t) => t.id === id);
      if (index === -1) return state;

      const newTabs = state.tabs.filter((t) => t.id !== id);

      // If no tabs remain, open a fresh one
      if (newTabs.length === 0) {
        const fresh = createTab();
        return { tabs: [fresh], activeTabId: fresh.id };
      }

      // Pick adjacent tab: prefer the one after, fall back to the one before
      let newActiveId = state.activeTabId;
      if (state.activeTabId === id) {
        const nextTab = newTabs[index] ?? newTabs[index - 1];
        newActiveId = nextTab.id;
      }

      return { tabs: newTabs, activeTabId: newActiveId };
    });
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  updateTabRequest: (id: string, updates: Partial<RequestConfig>) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, request: { ...tab.request, ...updates } } : tab,
      ),
    }));
  },

  setTabResponse: (id: string, response: HttpResponse) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, response } : tab)),
    }));
  },

  setTabLoading: (id: string, loading: boolean) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, isLoading: loading } : tab)),
    }));
  },

  loadRequestInTab: (tabId: string, request: RequestConfig, savedRequestId?: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              request,
              savedRequestId,
              response: undefined,
              isLoading: false,
            }
          : tab,
      ),
    }));
  },
}));
