import * as Tabs from '@radix-ui/react-tabs';
import { useRequestStore } from '../../store/requestStore';
import { ParamsTab } from './ParamsTab';
import { HeadersTab } from './HeadersTab';
import { AuthTab } from './AuthTab';
import { BodyTab } from './BodyTab';
import type { AuthConfig, KeyValuePair } from '../../types';

const TAB_TRIGGER_CLASS =
  'px-4 py-2 text-sm text-gray-400 data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 hover:text-gray-200 cursor-pointer outline-none';

export function RequestBuilder() {
  const { tabs, activeTabId, updateTabRequest } = useRequestStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No active tab
      </div>
    );
  }

  const { request } = activeTab;

  return (
    <div className="flex flex-col h-full">
      <Tabs.Root defaultValue="params" className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Tabs.List className="flex border-b border-gray-800 bg-transparent shrink-0">
          <Tabs.Trigger value="params" className={TAB_TRIGGER_CLASS}>
            Params
          </Tabs.Trigger>
          <Tabs.Trigger value="headers" className={TAB_TRIGGER_CLASS}>
            Headers
          </Tabs.Trigger>
          <Tabs.Trigger value="auth" className={TAB_TRIGGER_CLASS}>
            Auth
          </Tabs.Trigger>
          <Tabs.Trigger value="body" className={TAB_TRIGGER_CLASS}>
            Body
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="params" className="flex-1 min-h-0 overflow-auto p-3">
          <ParamsTab
            pairs={request.params}
            onChange={(pairs: KeyValuePair[]) => updateTabRequest(activeTab.id, { params: pairs })}
          />
        </Tabs.Content>

        <Tabs.Content value="headers" className="flex-1 min-h-0 overflow-auto p-3">
          <HeadersTab
            pairs={request.headers}
            onChange={(pairs: KeyValuePair[]) => updateTabRequest(activeTab.id, { headers: pairs })}
          />
        </Tabs.Content>

        <Tabs.Content value="auth" className="flex-1 min-h-0 overflow-auto">
          <AuthTab
            auth={request.auth}
            onChange={(auth: AuthConfig) => updateTabRequest(activeTab.id, { auth })}
          />
        </Tabs.Content>

        <Tabs.Content value="body" className="flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <BodyTab
              bodyType={request.bodyType}
              bodyRaw={request.bodyRaw}
              bodyFormPairs={request.bodyFormPairs}
              onChange={(updates) => updateTabRequest(activeTab.id, updates)}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
