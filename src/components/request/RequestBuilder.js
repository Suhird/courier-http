import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Tabs from '@radix-ui/react-tabs';
import { useRequestStore } from '../../store/requestStore';
import { ParamsTab } from './ParamsTab';
import { HeadersTab } from './HeadersTab';
import { AuthTab } from './AuthTab';
import { BodyTab } from './BodyTab';
const TAB_TRIGGER_CLASS = 'px-4 py-2 text-sm text-gray-400 data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 hover:text-gray-200 cursor-pointer outline-none';
export function RequestBuilder() {
    const { tabs, activeTabId, updateTabRequest } = useRequestStore();
    const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
    if (!activeTab) {
        return (_jsx("div", { className: "flex items-center justify-center h-full text-gray-500 text-sm", children: "No active tab" }));
    }
    const { request } = activeTab;
    return (_jsx("div", { className: "flex flex-col h-full", children: _jsxs(Tabs.Root, { defaultValue: "params", className: "flex flex-col flex-1 min-h-0 overflow-hidden", children: [_jsxs(Tabs.List, { className: "flex border-b border-gray-800 bg-transparent shrink-0", children: [_jsx(Tabs.Trigger, { value: "params", className: TAB_TRIGGER_CLASS, children: "Params" }), _jsx(Tabs.Trigger, { value: "headers", className: TAB_TRIGGER_CLASS, children: "Headers" }), _jsx(Tabs.Trigger, { value: "auth", className: TAB_TRIGGER_CLASS, children: "Auth" }), _jsx(Tabs.Trigger, { value: "body", className: TAB_TRIGGER_CLASS, children: "Body" })] }), _jsx(Tabs.Content, { value: "params", className: "flex-1 min-h-0 overflow-auto p-3", children: _jsx(ParamsTab, { pairs: request.params, onChange: (pairs) => updateTabRequest(activeTab.id, { params: pairs }) }) }), _jsx(Tabs.Content, { value: "headers", className: "flex-1 min-h-0 overflow-auto p-3", children: _jsx(HeadersTab, { pairs: request.headers, onChange: (pairs) => updateTabRequest(activeTab.id, { headers: pairs }) }) }), _jsx(Tabs.Content, { value: "auth", className: "flex-1 min-h-0 overflow-auto", children: _jsx(AuthTab, { auth: request.auth, onChange: (auth) => updateTabRequest(activeTab.id, { auth }) }) }), _jsx(Tabs.Content, { value: "body", className: "flex-1 min-h-0 overflow-hidden", children: _jsx("div", { className: "flex flex-col h-full", children: _jsx(BodyTab, { bodyType: request.bodyType, bodyRaw: request.bodyRaw, bodyFormPairs: request.bodyFormPairs, onChange: (updates) => updateTabRequest(activeTab.id, updates) }) }) })] }) }));
}
