import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useRequestStore } from '../../store/requestStore';
import { ResponseMeta } from './ResponseMeta';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';
const TAB_TRIGGER_CLASS = 'px-4 py-2 text-sm text-gray-400 data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 hover:text-gray-200 cursor-pointer outline-none';
export function ResponseViewer() {
    const { tabs, activeTabId } = useRequestStore();
    const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
    const [copied, setCopied] = useState(false);
    if (!activeTab) {
        return null;
    }
    if (activeTab.isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" }) }));
    }
    if (!activeTab.response) {
        return (_jsx("div", { className: "flex items-center justify-center h-full text-gray-600 text-sm", children: "Send a request to see the response" }));
    }
    const { response } = activeTab;
    function handleCopy() {
        navigator.clipboard.writeText(response.body).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }
    return (_jsxs("div", { className: "flex flex-col h-full border-t border-gray-800", children: [_jsx(ResponseMeta, { status: response.status, statusText: response.statusText, durationMs: response.durationMs, sizeBytes: response.sizeBytes }), _jsxs(Tabs.Root, { defaultValue: "body", className: "flex flex-col flex-1 overflow-hidden", children: [_jsxs(Tabs.List, { className: "flex items-center border-b border-gray-800 bg-transparent shrink-0", children: [_jsx(Tabs.Trigger, { value: "body", className: TAB_TRIGGER_CLASS, children: "Body" }), _jsx(Tabs.Trigger, { value: "headers", className: TAB_TRIGGER_CLASS, children: "Headers" }), _jsx("div", { className: "ml-auto pr-2", children: _jsxs("button", { onClick: handleCopy, className: "flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors", title: "Copy response body", children: [copied ? _jsx(Check, { size: 13, className: "text-green-400" }) : _jsx(Copy, { size: 13 }), _jsx("span", { children: copied ? 'Copied!' : 'Copy' })] }) })] }), _jsx(Tabs.Content, { value: "body", className: "flex-1 h-full overflow-hidden", children: _jsx(ResponseBody, { body: response.body, headers: response.headers }) }), _jsx(Tabs.Content, { value: "headers", className: "flex-1 h-full overflow-auto", children: _jsx(ResponseHeaders, { headers: response.headers }) })] })] }));
}
