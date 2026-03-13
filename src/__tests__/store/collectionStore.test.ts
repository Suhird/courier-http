import { useCollectionStore } from '../../store/collectionStore';
import * as tauri from '../../lib/tauri';
import type { RequestConfig, HttpResponse, Collection, SavedRequest } from '../../types';

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

const makeRequest = (overrides = {}): RequestConfig => ({
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

const makeResponse = (overrides = {}): HttpResponse => ({
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  body: '{"ok":true}',
  durationMs: 123,
  sizeBytes: 11,
  ...overrides,
});

const makeSavedRequest = (overrides: Partial<SavedRequest> = {}): SavedRequest => ({
  id: 'req-1',
  name: 'Get Users',
  request: makeRequest(),
  ...overrides,
});

const makeCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'col-1',
  name: 'My Collection',
  requests: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Reset store before every test
// ---------------------------------------------------------------------------

beforeEach(() => {
  useCollectionStore.setState({ collections: [], isLoading: false });
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCollectionStore — fetchCollections()', () => {
  it('calls tauri.getCollections', async () => {
    vi.mocked(tauri.getCollections).mockResolvedValue([]);

    await useCollectionStore.getState().fetchCollections();

    expect(tauri.getCollections).toHaveBeenCalled();
  });

  it('sets collections in state from tauri response', async () => {
    const cols: Collection[] = [makeCollection({ id: 'col-a', name: 'Alpha' })];
    vi.mocked(tauri.getCollections).mockResolvedValue(cols);

    await useCollectionStore.getState().fetchCollections();

    expect(useCollectionStore.getState().collections).toEqual(cols);
  });

  it('sets isLoading true then false around the fetch', async () => {
    const loading: boolean[] = [];
    let resolveGetCollections!: (v: Collection[]) => void;
    const deferred = new Promise<Collection[]>((res) => { resolveGetCollections = res; });

    vi.mocked(tauri.getCollections).mockReturnValue(deferred);

    const fetchPromise = useCollectionStore.getState().fetchCollections();
    loading.push(useCollectionStore.getState().isLoading);

    resolveGetCollections([]);
    await fetchPromise;
    loading.push(useCollectionStore.getState().isLoading);

    expect(loading[0]).toBe(true);
    expect(loading[1]).toBe(false);
  });
});

describe('useCollectionStore — saveCollection()', () => {
  it('calls tauri.saveCollection with the collection', async () => {
    const col = makeCollection();
    vi.mocked(tauri.saveCollection).mockResolvedValue(undefined);
    vi.mocked(tauri.getCollections).mockResolvedValue([col]);

    await useCollectionStore.getState().saveCollection(col);

    expect(tauri.saveCollection).toHaveBeenCalledWith(col);
  });

  it('refreshes collections from tauri.getCollections after saving', async () => {
    const col = makeCollection({ id: 'fresh-col' });
    vi.mocked(tauri.saveCollection).mockResolvedValue(undefined);
    vi.mocked(tauri.getCollections).mockResolvedValue([col]);

    await useCollectionStore.getState().saveCollection(col);

    expect(tauri.getCollections).toHaveBeenCalled();
    expect(useCollectionStore.getState().collections).toEqual([col]);
  });
});

describe('useCollectionStore — deleteCollection()', () => {
  it('calls tauri.deleteCollection with the id', async () => {
    const col = makeCollection({ id: 'del-col' });
    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.deleteCollection).mockResolvedValue(undefined);

    await useCollectionStore.getState().deleteCollection('del-col');

    expect(tauri.deleteCollection).toHaveBeenCalledWith('del-col');
  });

  it('removes the collection from local state (optimistic delete)', async () => {
    const col = makeCollection({ id: 'to-remove' });
    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.deleteCollection).mockResolvedValue(undefined);

    await useCollectionStore.getState().deleteCollection('to-remove');

    expect(useCollectionStore.getState().collections).toHaveLength(0);
  });
});

describe('useCollectionStore — exportCollection()', () => {
  it('calls tauri.exportCollection with the id', async () => {
    vi.mocked(tauri.exportCollection).mockResolvedValue(undefined);

    await useCollectionStore.getState().exportCollection('export-col-id');

    expect(tauri.exportCollection).toHaveBeenCalledWith('export-col-id');
  });
});

describe('useCollectionStore — saveRequestToCollection()', () => {
  it('calls tauri.saveRequestToCollection with collectionId and request', async () => {
    const col = makeCollection({ id: 'col-1' });
    const req = makeSavedRequest({ id: 'req-new', name: 'New Request' });
    const updatedCol = makeCollection({ id: 'col-1', requests: [req] });

    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.saveRequestToCollection).mockResolvedValue(updatedCol);

    await useCollectionStore.getState().saveRequestToCollection('col-1', req);

    expect(tauri.saveRequestToCollection).toHaveBeenCalledWith('col-1', req);
  });

  it('updates the collection in state with the returned updated collection', async () => {
    const col = makeCollection({ id: 'col-1', requests: [] });
    const req = makeSavedRequest({ id: 'req-new' });
    const updatedCol = makeCollection({ id: 'col-1', requests: [req] });

    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.saveRequestToCollection).mockResolvedValue(updatedCol);

    await useCollectionStore.getState().saveRequestToCollection('col-1', req);

    const stored = useCollectionStore.getState().collections.find((c) => c.id === 'col-1')!;
    expect(stored.requests).toHaveLength(1);
    expect(stored.requests[0].id).toBe('req-new');
  });
});

describe('useCollectionStore — deleteRequestFromCollection()', () => {
  it('calls tauri.deleteRequestFromCollection with collectionId and requestId', async () => {
    const req = makeSavedRequest({ id: 'req-to-del' });
    const col = makeCollection({ id: 'col-1', requests: [req] });
    const updatedCol = makeCollection({ id: 'col-1', requests: [] });

    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.deleteRequestFromCollection).mockResolvedValue(updatedCol);

    await useCollectionStore.getState().deleteRequestFromCollection('col-1', 'req-to-del');

    expect(tauri.deleteRequestFromCollection).toHaveBeenCalledWith('col-1', 'req-to-del');
  });

  it('updates the collection in state with the returned updated collection', async () => {
    const req = makeSavedRequest({ id: 'req-to-del' });
    const col = makeCollection({ id: 'col-1', requests: [req] });
    const updatedCol = makeCollection({ id: 'col-1', requests: [] });

    useCollectionStore.setState({ collections: [col] });
    vi.mocked(tauri.deleteRequestFromCollection).mockResolvedValue(updatedCol);

    await useCollectionStore.getState().deleteRequestFromCollection('col-1', 'req-to-del');

    const stored = useCollectionStore.getState().collections.find((c) => c.id === 'col-1')!;
    expect(stored.requests).toHaveLength(0);
  });
});
