import { useRequestStore } from '../store/requestStore';
import { useEnvironmentStore } from '../store/environmentStore';
import { useHistoryStore } from '../store/historyStore';
import { executeRequest, appendHistory } from '../lib/tauri';
import { interpolate } from '../lib/interpolate';
export function useRequestSend() {
    const { tabs, activeTabId, setTabResponse, setTabLoading } = useRequestStore();
    const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
    async function handleSend() {
        if (!activeTab || activeTab.isLoading)
            return;
        const vars = useEnvironmentStore.getState().getActiveVariables();
        const config = {
            ...activeTab.request,
            url: interpolate(activeTab.request.url, vars),
            params: activeTab.request.params.map((p) => ({ ...p, value: interpolate(p.value, vars) })),
            headers: activeTab.request.headers.map((h) => ({ ...h, value: interpolate(h.value, vars) })),
        };
        setTabLoading(activeTab.id, true);
        try {
            const response = await executeRequest(config);
            setTabResponse(activeTab.id, response);
            await appendHistory({ request: config, response });
            useHistoryStore.getState().fetchHistory();
        }
        catch (err) {
            setTabResponse(activeTab.id, {
                status: 0,
                statusText: String(err),
                headers: {},
                body: String(err),
                durationMs: 0,
                sizeBytes: 0,
            });
        }
        finally {
            setTabLoading(activeTab.id, false);
        }
    }
    return { handleSend };
}
