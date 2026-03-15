import { useEnvironmentStore } from '../../store/environmentStore';
import * as tauri from '../../lib/tauri';
// ---------------------------------------------------------------------------
// Mock the tauri bridge
// ---------------------------------------------------------------------------
vi.mock('../../lib/tauri', () => ({
    getEnvironments: vi.fn(),
    saveEnvironment: vi.fn(),
    deleteEnvironment: vi.fn(),
    getCollections: vi.fn(),
    saveCollection: vi.fn(),
    deleteCollection: vi.fn(),
    exportCollection: vi.fn(),
    saveRequestToCollection: vi.fn(),
    deleteRequestFromCollection: vi.fn(),
    getHistory: vi.fn(),
    appendHistory: vi.fn(),
    clearHistory: vi.fn(),
    executeRequest: vi.fn(),
}));
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
const makeEnvironment = (overrides = {}) => ({
    id: 'env-1',
    name: 'Test Env',
    variables: [],
    ...overrides,
});
// ---------------------------------------------------------------------------
// Reset store before every test
// ---------------------------------------------------------------------------
beforeEach(() => {
    useEnvironmentStore.setState({ environments: [], activeEnvironmentId: null, isLoading: false });
    vi.clearAllMocks();
});
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useEnvironmentStore — fetchEnvironments()', () => {
    it('sets isLoading true then false around the fetch', async () => {
        const loading = [];
        let resolveGetEnvironments;
        const deferred = new Promise((res) => { resolveGetEnvironments = res; });
        vi.mocked(tauri.getEnvironments).mockReturnValue(deferred);
        const fetchPromise = useEnvironmentStore.getState().fetchEnvironments();
        // Should be loading now
        loading.push(useEnvironmentStore.getState().isLoading);
        resolveGetEnvironments([]);
        await fetchPromise;
        // Should no longer be loading
        loading.push(useEnvironmentStore.getState().isLoading);
        expect(loading[0]).toBe(true);
        expect(loading[1]).toBe(false);
    });
    it('loads environments returned by tauri.getEnvironments', async () => {
        const envs = [makeEnvironment({ id: 'env-a', name: 'Alpha' })];
        vi.mocked(tauri.getEnvironments).mockResolvedValue(envs);
        await useEnvironmentStore.getState().fetchEnvironments();
        expect(useEnvironmentStore.getState().environments).toEqual(envs);
    });
    it('handles an empty array from tauri.getEnvironments', async () => {
        vi.mocked(tauri.getEnvironments).mockResolvedValue([]);
        await useEnvironmentStore.getState().fetchEnvironments();
        expect(useEnvironmentStore.getState().environments).toEqual([]);
    });
});
describe('useEnvironmentStore — saveEnvironment()', () => {
    it('calls tauri.saveEnvironment with the environment', async () => {
        const env = makeEnvironment();
        vi.mocked(tauri.saveEnvironment).mockResolvedValue(undefined);
        vi.mocked(tauri.getEnvironments).mockResolvedValue([env]);
        await useEnvironmentStore.getState().saveEnvironment(env);
        expect(tauri.saveEnvironment).toHaveBeenCalledWith(env);
    });
    it('calls tauri.getEnvironments to refresh the list', async () => {
        const env = makeEnvironment();
        vi.mocked(tauri.saveEnvironment).mockResolvedValue(undefined);
        vi.mocked(tauri.getEnvironments).mockResolvedValue([env]);
        await useEnvironmentStore.getState().saveEnvironment(env);
        expect(tauri.getEnvironments).toHaveBeenCalled();
    });
    it('updates environments state after save', async () => {
        const env = makeEnvironment({ id: 'new-env', name: 'New' });
        vi.mocked(tauri.saveEnvironment).mockResolvedValue(undefined);
        vi.mocked(tauri.getEnvironments).mockResolvedValue([env]);
        await useEnvironmentStore.getState().saveEnvironment(env);
        expect(useEnvironmentStore.getState().environments).toEqual([env]);
    });
});
describe('useEnvironmentStore — deleteEnvironment()', () => {
    it('calls tauri.deleteEnvironment with the id', async () => {
        const env = makeEnvironment({ id: 'del-env' });
        useEnvironmentStore.setState({ environments: [env] });
        vi.mocked(tauri.deleteEnvironment).mockResolvedValue(undefined);
        await useEnvironmentStore.getState().deleteEnvironment('del-env');
        expect(tauri.deleteEnvironment).toHaveBeenCalledWith('del-env');
    });
    it('removes the environment from state', async () => {
        const env = makeEnvironment({ id: 'to-remove' });
        useEnvironmentStore.setState({ environments: [env] });
        vi.mocked(tauri.deleteEnvironment).mockResolvedValue(undefined);
        await useEnvironmentStore.getState().deleteEnvironment('to-remove');
        expect(useEnvironmentStore.getState().environments).toHaveLength(0);
    });
    it('sets activeEnvironmentId to null when deleted env was active', async () => {
        const env = makeEnvironment({ id: 'active-env' });
        useEnvironmentStore.setState({ environments: [env], activeEnvironmentId: 'active-env' });
        vi.mocked(tauri.deleteEnvironment).mockResolvedValue(undefined);
        await useEnvironmentStore.getState().deleteEnvironment('active-env');
        expect(useEnvironmentStore.getState().activeEnvironmentId).toBeNull();
    });
    it('preserves activeEnvironmentId when a different env is deleted', async () => {
        const env1 = makeEnvironment({ id: 'env-1' });
        const env2 = makeEnvironment({ id: 'env-2' });
        useEnvironmentStore.setState({ environments: [env1, env2], activeEnvironmentId: 'env-1' });
        vi.mocked(tauri.deleteEnvironment).mockResolvedValue(undefined);
        await useEnvironmentStore.getState().deleteEnvironment('env-2');
        expect(useEnvironmentStore.getState().activeEnvironmentId).toBe('env-1');
    });
});
describe('useEnvironmentStore — setActiveEnvironment()', () => {
    it('sets activeEnvironmentId to the given id', () => {
        useEnvironmentStore.getState().setActiveEnvironment('env-42');
        expect(useEnvironmentStore.getState().activeEnvironmentId).toBe('env-42');
    });
    it('can be set to null', () => {
        useEnvironmentStore.setState({ activeEnvironmentId: 'something' });
        useEnvironmentStore.getState().setActiveEnvironment(null);
        expect(useEnvironmentStore.getState().activeEnvironmentId).toBeNull();
    });
});
describe('useEnvironmentStore — getActiveVariables()', () => {
    it('returns {} when activeEnvironmentId is null', () => {
        useEnvironmentStore.setState({ environments: [], activeEnvironmentId: null });
        expect(useEnvironmentStore.getState().getActiveVariables()).toEqual({});
    });
    it('returns {} when active environment is not found in the list', () => {
        useEnvironmentStore.setState({ environments: [], activeEnvironmentId: 'ghost-env' });
        expect(useEnvironmentStore.getState().getActiveVariables()).toEqual({});
    });
    it('returns only enabled variables as a { key: value } map', () => {
        const env = makeEnvironment({
            id: 'env-vars',
            variables: [
                { id: 'v1', key: 'BASE_URL', value: 'https://api.example.com', enabled: true },
                { id: 'v2', key: 'TOKEN', value: 'abc123', enabled: true },
            ],
        });
        useEnvironmentStore.setState({ environments: [env], activeEnvironmentId: 'env-vars' });
        expect(useEnvironmentStore.getState().getActiveVariables()).toEqual({
            BASE_URL: 'https://api.example.com',
            TOKEN: 'abc123',
        });
    });
    it('filters out disabled variables', () => {
        const env = makeEnvironment({
            id: 'env-mixed',
            variables: [
                { id: 'v1', key: 'ENABLED_KEY', value: 'hello', enabled: true },
                { id: 'v2', key: 'DISABLED_KEY', value: 'world', enabled: false },
            ],
        });
        useEnvironmentStore.setState({ environments: [env], activeEnvironmentId: 'env-mixed' });
        const vars = useEnvironmentStore.getState().getActiveVariables();
        expect(vars).toHaveProperty('ENABLED_KEY', 'hello');
        expect(vars).not.toHaveProperty('DISABLED_KEY');
    });
});
