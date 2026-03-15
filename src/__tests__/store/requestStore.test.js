import { useRequestStore } from '../../store/requestStore';
// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------
const makeRequest = (overrides = {}) => ({
    method: 'GET',
    url: 'https://api.example.com',
    params: [],
    headers: [],
    auth: { type: 'none' },
    bodyType: 'none',
    bodyRaw: '',
    bodyFormPairs: [],
    ...overrides,
});
const makeResponse = (overrides = {}) => ({
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    body: '{"ok":true}',
    durationMs: 123,
    sizeBytes: 11,
    ...overrides,
});
// ---------------------------------------------------------------------------
// Reset store before every test
// ---------------------------------------------------------------------------
beforeEach(() => {
    useRequestStore.setState({ tabs: [], activeTabId: null });
    useRequestStore.getState().addTab();
});
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useRequestStore — initial state', () => {
    it('starts with exactly one tab', () => {
        const { tabs } = useRequestStore.getState();
        expect(tabs).toHaveLength(1);
    });
    it('activeTabId matches the single tab id', () => {
        const { tabs, activeTabId } = useRequestStore.getState();
        expect(activeTabId).toBe(tabs[0].id);
    });
});
describe('useRequestStore — addTab()', () => {
    it('adds a second tab', () => {
        useRequestStore.getState().addTab();
        expect(useRequestStore.getState().tabs).toHaveLength(2);
    });
    it('switches activeTabId to the new tab', () => {
        useRequestStore.getState().addTab();
        const { tabs, activeTabId } = useRequestStore.getState();
        expect(activeTabId).toBe(tabs[1].id);
    });
    it('new tab has default request (method GET, empty url)', () => {
        useRequestStore.getState().addTab();
        const { tabs } = useRequestStore.getState();
        const newTab = tabs[1];
        expect(newTab.request.method).toBe('GET');
        expect(newTab.request.url).toBe('');
    });
});
describe('useRequestStore — closeTab()', () => {
    it('closing a non-active tab preserves activeTabId', () => {
        useRequestStore.getState().addTab();
        const { tabs, activeTabId: originalActiveId } = useRequestStore.getState();
        // active is tabs[1]; close tabs[0]
        useRequestStore.getState().closeTab(tabs[0].id);
        expect(useRequestStore.getState().activeTabId).toBe(originalActiveId);
    });
    it('closing the active tab (with more tabs remaining) switches to an adjacent tab', () => {
        useRequestStore.getState().addTab();
        const { tabs } = useRequestStore.getState();
        // active is tabs[1]; close it
        const closedId = tabs[1].id;
        useRequestStore.getState().closeTab(closedId);
        const { tabs: remaining, activeTabId } = useRequestStore.getState();
        expect(remaining).toHaveLength(1);
        expect(activeTabId).not.toBe(closedId);
        expect(activeTabId).toBe(remaining[0].id);
    });
    it('closing the last remaining tab creates a fresh tab (length stays 1)', () => {
        const { tabs } = useRequestStore.getState();
        const onlyTabId = tabs[0].id;
        useRequestStore.getState().closeTab(onlyTabId);
        const { tabs: newTabs, activeTabId } = useRequestStore.getState();
        expect(newTabs).toHaveLength(1);
        // The new tab should be fresh (different id)
        expect(newTabs[0].id).not.toBe(onlyTabId);
        expect(activeTabId).toBe(newTabs[0].id);
    });
    it('closing a tab id that does not exist makes no change', () => {
        const stateBefore = useRequestStore.getState();
        useRequestStore.getState().closeTab('non-existent-id');
        const stateAfter = useRequestStore.getState();
        expect(stateAfter.tabs).toHaveLength(stateBefore.tabs.length);
        expect(stateAfter.activeTabId).toBe(stateBefore.activeTabId);
    });
});
describe('useRequestStore — setActiveTab()', () => {
    it('sets activeTabId to the given id', () => {
        useRequestStore.getState().addTab();
        const { tabs } = useRequestStore.getState();
        const firstTabId = tabs[0].id;
        useRequestStore.getState().setActiveTab(firstTabId);
        expect(useRequestStore.getState().activeTabId).toBe(firstTabId);
    });
});
describe('useRequestStore — updateTabRequest()', () => {
    it('merges a partial update into the tab request', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().updateTabRequest(tabId, { method: 'POST', url: 'https://new.example.com' });
        const updated = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(updated.request.method).toBe('POST');
        expect(updated.request.url).toBe('https://new.example.com');
    });
    it('updating method does not wipe other request fields', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().updateTabRequest(tabId, { url: 'https://set.example.com' });
        useRequestStore.getState().updateTabRequest(tabId, { method: 'DELETE' });
        const updated = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(updated.request.url).toBe('https://set.example.com');
        expect(updated.request.method).toBe('DELETE');
    });
    it('does not affect other tabs', () => {
        useRequestStore.getState().addTab();
        const { tabs } = useRequestStore.getState();
        const [tab1, tab2] = tabs;
        useRequestStore.getState().updateTabRequest(tab1.id, { url: 'https://tab1.example.com' });
        const tab2state = useRequestStore.getState().tabs.find((t) => t.id === tab2.id);
        expect(tab2state.request.url).toBe('');
    });
});
describe('useRequestStore — setTabResponse()', () => {
    it('sets the response on the correct tab', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        const response = makeResponse();
        useRequestStore.getState().setTabResponse(tabId, response);
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.response).toEqual(response);
    });
    it('does not affect other tabs', () => {
        useRequestStore.getState().addTab();
        const { tabs } = useRequestStore.getState();
        const [tab1, tab2] = tabs;
        useRequestStore.getState().setTabResponse(tab1.id, makeResponse());
        const tab2state = useRequestStore.getState().tabs.find((t) => t.id === tab2.id);
        expect(tab2state.response).toBeUndefined();
    });
});
describe('useRequestStore — setTabLoading()', () => {
    it('sets isLoading to true', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().setTabLoading(tabId, true);
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.isLoading).toBe(true);
    });
    it('sets isLoading back to false', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().setTabLoading(tabId, true);
        useRequestStore.getState().setTabLoading(tabId, false);
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.isLoading).toBe(false);
    });
});
describe('useRequestStore — loadRequestInTab()', () => {
    it('loads a new request config into the tab', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        const newRequest = makeRequest({ method: 'PUT', url: 'https://loaded.example.com' });
        useRequestStore.getState().loadRequestInTab(tabId, newRequest, 'saved-req-1');
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.request).toEqual(newRequest);
    });
    it('clears response (sets to undefined)', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        // First give the tab a response
        useRequestStore.getState().setTabResponse(tabId, makeResponse());
        // Now load a new request
        useRequestStore.getState().loadRequestInTab(tabId, makeRequest());
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.response).toBeUndefined();
    });
    it('sets savedRequestId', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().loadRequestInTab(tabId, makeRequest(), 'my-saved-id');
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.savedRequestId).toBe('my-saved-id');
    });
    it('sets isLoading to false', () => {
        const { tabs } = useRequestStore.getState();
        const tabId = tabs[0].id;
        useRequestStore.getState().setTabLoading(tabId, true);
        useRequestStore.getState().loadRequestInTab(tabId, makeRequest());
        const tab = useRequestStore.getState().tabs.find((t) => t.id === tabId);
        expect(tab.isLoading).toBe(false);
    });
});
