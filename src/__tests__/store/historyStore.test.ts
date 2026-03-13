import { useHistoryStore } from '../../store/historyStore';
import * as tauri from '../../lib/tauri';
import type { RequestConfig, HttpResponse, HistoryEntry, AppendHistoryPayload } from '../../types';

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

const makeHistoryEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'hist-1',
  timestamp: '2026-03-12T10:00:00.000Z',
  request: makeRequest(),
  response: makeResponse(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Reset store before every test
// ---------------------------------------------------------------------------

beforeEach(() => {
  useHistoryStore.setState({ entries: [], isLoading: false });
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useHistoryStore — fetchHistory()', () => {
  it('calls tauri.getHistory', async () => {
    vi.mocked(tauri.getHistory).mockResolvedValue([]);

    await useHistoryStore.getState().fetchHistory();

    expect(tauri.getHistory).toHaveBeenCalled();
  });

  it('sets entries in state from tauri response', async () => {
    const entries: HistoryEntry[] = [
      makeHistoryEntry({ id: 'h-1' }),
      makeHistoryEntry({ id: 'h-2' }),
    ];
    vi.mocked(tauri.getHistory).mockResolvedValue(entries);

    await useHistoryStore.getState().fetchHistory();

    expect(useHistoryStore.getState().entries).toEqual(entries);
  });

  it('sets isLoading true then false around the fetch', async () => {
    const loading: boolean[] = [];
    let resolveGetHistory!: (v: HistoryEntry[]) => void;
    const deferred = new Promise<HistoryEntry[]>((res) => { resolveGetHistory = res; });

    vi.mocked(tauri.getHistory).mockReturnValue(deferred);

    const fetchPromise = useHistoryStore.getState().fetchHistory();
    loading.push(useHistoryStore.getState().isLoading);

    resolveGetHistory([]);
    await fetchPromise;
    loading.push(useHistoryStore.getState().isLoading);

    expect(loading[0]).toBe(true);
    expect(loading[1]).toBe(false);
  });
});

describe('useHistoryStore — appendHistory()', () => {
  it('calls tauri.appendHistory with the payload', async () => {
    const payload: AppendHistoryPayload = { request: makeRequest(), response: makeResponse() };
    const entry = makeHistoryEntry({ id: 'new-entry' });
    vi.mocked(tauri.appendHistory).mockResolvedValue(entry);

    await useHistoryStore.getState().appendHistory(payload);

    expect(tauri.appendHistory).toHaveBeenCalledWith(payload);
  });

  it('prepends the returned HistoryEntry to entries (newest first)', async () => {
    const entry = makeHistoryEntry({ id: 'newest' });
    vi.mocked(tauri.appendHistory).mockResolvedValue(entry);

    await useHistoryStore.getState().appendHistory({ request: makeRequest(), response: makeResponse() });

    expect(useHistoryStore.getState().entries[0].id).toBe('newest');
  });

  it('preserves existing entries after the new one', async () => {
    const existing = makeHistoryEntry({ id: 'old-entry' });
    useHistoryStore.setState({ entries: [existing] });

    const newEntry = makeHistoryEntry({ id: 'new-entry' });
    vi.mocked(tauri.appendHistory).mockResolvedValue(newEntry);

    await useHistoryStore.getState().appendHistory({ request: makeRequest(), response: makeResponse() });

    const { entries } = useHistoryStore.getState();
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('new-entry');
    expect(entries[1].id).toBe('old-entry');
  });
});

describe('useHistoryStore — clearHistory()', () => {
  it('calls tauri.clearHistory', async () => {
    vi.mocked(tauri.clearHistory).mockResolvedValue(undefined);

    await useHistoryStore.getState().clearHistory();

    expect(tauri.clearHistory).toHaveBeenCalled();
  });

  it('sets entries to an empty array', async () => {
    useHistoryStore.setState({
      entries: [makeHistoryEntry({ id: 'h-1' }), makeHistoryEntry({ id: 'h-2' })],
    });
    vi.mocked(tauri.clearHistory).mockResolvedValue(undefined);

    await useHistoryStore.getState().clearHistory();

    expect(useHistoryStore.getState().entries).toEqual([]);
  });
});
