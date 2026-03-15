import { renderHook } from '@testing-library/react';
import { useRequestSend } from '../../hooks/useRequestSend';
import { useRequestStore } from '../../store/requestStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useHistoryStore } from '../../store/historyStore';
import * as tauri from '../../lib/tauri';
import type { RequestConfig, HttpResponse } from '../../types';

// Mock the tauri bridge (same pattern as store tests)
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

beforeEach(() => {
  vi.clearAllMocks();
  useRequestStore.setState({ tabs: [], activeTabId: null });
  useRequestStore.getState().addTab();
  useEnvironmentStore.setState({ environments: [], activeEnvironmentId: null, isLoading: false });
  useHistoryStore.setState({ entries: [], isLoading: false });
});

describe('useRequestSend — handleSend()', () => {
  it('is a no-op when activeTabId is null', async () => {
    useRequestStore.setState({ tabs: [], activeTabId: null });
    const { result } = renderHook(() => useRequestSend());
    await result.current.handleSend();
    expect(tauri.executeRequest).not.toHaveBeenCalled();
  });

  it('is a no-op when activeTab.isLoading is true', async () => {
    const { tabs, activeTabId } = useRequestStore.getState();
    useRequestStore.setState({
      tabs: tabs.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t),
    });
    const { result } = renderHook(() => useRequestSend());
    await result.current.handleSend();
    expect(tauri.executeRequest).not.toHaveBeenCalled();
  });

  it('calls executeRequest, setTabResponse, appendHistory, fetchHistory on success', async () => {
    const response = makeResponse();
    vi.mocked(tauri.executeRequest).mockResolvedValue(response);
    vi.mocked(tauri.appendHistory).mockResolvedValue({ id: 'h1', timestamp: '2026-01-01T00:00:00Z', request: makeRequest(), response });
    vi.mocked(tauri.getHistory).mockResolvedValue([]);

    const { result } = renderHook(() => useRequestSend());
    await result.current.handleSend();

    expect(tauri.executeRequest).toHaveBeenCalledTimes(1);
    expect(tauri.appendHistory).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(tauri.getHistory).toHaveBeenCalledTimes(1));

    const { tabs, activeTabId } = useRequestStore.getState();
    const tab = tabs.find(t => t.id === activeTabId)!;
    expect(tab.response?.status).toBe(200);
    expect(tab.isLoading).toBe(false);
  });

  it('sets status:0 error response when executeRequest throws', async () => {
    vi.mocked(tauri.executeRequest).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRequestSend());
    await result.current.handleSend();

    const { tabs, activeTabId } = useRequestStore.getState();
    const tab = tabs.find(t => t.id === activeTabId)!;
    expect(tab.response?.status).toBe(0);
    expect(tab.response?.statusText).toContain('Network error');
    expect(tab.isLoading).toBe(false);
  });

  it('interpolates {{variables}} in url, params, and headers before sending', async () => {
    useEnvironmentStore.setState({
      environments: [{
        id: 'env1',
        name: 'Test',
        variables: [
          { key: 'BASE_URL', value: 'https://api.example.com', enabled: true, secret: false },
        ],
      }],
      activeEnvironmentId: 'env1',
      isLoading: false,
    });

    const { tabs, activeTabId } = useRequestStore.getState();
    useRequestStore.setState({
      tabs: tabs.map(t =>
        t.id === activeTabId
          ? {
              ...t,
              request: {
                ...t.request,
                url: '{{BASE_URL}}/users',
                params: [{ key: 'foo', value: '{{BASE_URL}}', enabled: true }],
                headers: [{ key: 'X-Origin', value: '{{BASE_URL}}', enabled: true }],
              },
            }
          : t
      ),
    });

    const response = makeResponse();
    vi.mocked(tauri.executeRequest).mockResolvedValue(response);
    vi.mocked(tauri.appendHistory).mockResolvedValue({ id: 'h1', timestamp: '2026-01-01T00:00:00Z', request: makeRequest(), response });
    vi.mocked(tauri.getHistory).mockResolvedValue([]);

    const { result } = renderHook(() => useRequestSend());
    await result.current.handleSend();

    const calledWith = vi.mocked(tauri.executeRequest).mock.calls[0][0];
    expect(calledWith.url).toBe('https://api.example.com/users');
    expect(calledWith.params[0].value).toBe('https://api.example.com');
    expect(calledWith.headers[0].value).toBe('https://api.example.com');
  });
});
