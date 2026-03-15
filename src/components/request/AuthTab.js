import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
const AUTH_TYPES = [
    { value: 'none', label: 'No Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'api-key', label: 'API Key' },
    { value: 'oauth2', label: 'OAuth 2.0' },
];
const inputClass = 'bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 w-full outline-none focus:border-orange-500/50';
export function AuthTab({ auth, onChange }) {
    function handleTypeChange(type) {
        onChange({ ...auth, type });
    }
    return (_jsxs("div", { className: "flex flex-col gap-4 p-4", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Auth Type" }), _jsxs(Select.Root, { value: auth.type, onValueChange: (val) => handleTypeChange(val), children: [_jsxs(Select.Trigger, { className: "flex items-center justify-between bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-orange-500/50 cursor-pointer hover:border-gray-600 w-full", "aria-label": "Auth type", children: [_jsx(Select.Value, {}), _jsx(ChevronDown, { size: 13, className: "text-gray-500 shrink-0" })] }), _jsx(Select.Portal, { children: _jsx(Select.Content, { className: "z-50 bg-[#0d1b2a] border border-gray-700 rounded shadow-lg overflow-hidden", position: "popper", sideOffset: 4, children: _jsx(Select.Viewport, { className: "p-1", children: AUTH_TYPES.map(({ value, label }) => (_jsx(Select.Item, { value: value, className: "flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50", children: _jsx(Select.ItemText, { children: label }) }, value))) }) }) })] })] }), auth.type === 'none' && (_jsx("p", { className: "text-gray-500 text-sm", children: "No authentication" })), auth.type === 'bearer' && (_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Token" }), _jsx("input", { type: "text", value: auth.bearer?.token ?? '', onChange: (e) => onChange({ ...auth, bearer: { token: e.target.value } }), placeholder: "Bearer token", className: inputClass })] })), auth.type === 'basic' && (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Username" }), _jsx("input", { type: "text", value: auth.basic?.username ?? '', onChange: (e) => onChange({ ...auth, basic: { username: e.target.value, password: auth.basic?.password ?? '' } }), placeholder: "Username", className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Password" }), _jsx("input", { type: "password", value: auth.basic?.password ?? '', onChange: (e) => onChange({ ...auth, basic: { username: auth.basic?.username ?? '', password: e.target.value } }), placeholder: "Password", className: inputClass })] })] })), auth.type === 'api-key' && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Key Name" }), _jsx("input", { type: "text", value: auth.apiKey?.key ?? '', onChange: (e) => onChange({
                                    ...auth,
                                    apiKey: { key: e.target.value, value: auth.apiKey?.value ?? '', addTo: auth.apiKey?.addTo ?? 'header' },
                                }), placeholder: "X-API-Key", className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Value" }), _jsx("input", { type: "text", value: auth.apiKey?.value ?? '', onChange: (e) => onChange({
                                    ...auth,
                                    apiKey: { key: auth.apiKey?.key ?? '', value: e.target.value, addTo: auth.apiKey?.addTo ?? 'header' },
                                }), placeholder: "API key value", className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Add To" }), _jsxs(Select.Root, { value: auth.apiKey?.addTo ?? 'header', onValueChange: (val) => onChange({
                                    ...auth,
                                    apiKey: { key: auth.apiKey?.key ?? '', value: auth.apiKey?.value ?? '', addTo: val },
                                }), children: [_jsxs(Select.Trigger, { className: "flex items-center justify-between bg-[#16213e] border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-orange-500/50 cursor-pointer hover:border-gray-600 w-full", "aria-label": "Add to", children: [_jsx(Select.Value, {}), _jsx(ChevronDown, { size: 13, className: "text-gray-500 shrink-0" })] }), _jsx(Select.Portal, { children: _jsx(Select.Content, { className: "z-50 bg-[#0d1b2a] border border-gray-700 rounded shadow-lg overflow-hidden", position: "popper", sideOffset: 4, children: _jsxs(Select.Viewport, { className: "p-1", children: [_jsx(Select.Item, { value: "header", className: "flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50", children: _jsx(Select.ItemText, { children: "Header" }) }), _jsx(Select.Item, { value: "query", className: "flex items-center px-3 py-1.5 rounded cursor-pointer outline-none text-sm text-gray-300 hover:bg-gray-700/50 data-[highlighted]:bg-gray-700/50", children: _jsx(Select.ItemText, { children: "Query Param" }) })] }) }) })] })] })] })), auth.type === 'oauth2' && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Access Token" }), _jsx("input", { type: "text", value: auth.oauth2?.accessToken ?? '', onChange: (e) => onChange({
                                    ...auth,
                                    oauth2: {
                                        accessToken: e.target.value,
                                        tokenType: auth.oauth2?.tokenType ?? 'Bearer',
                                        addTo: 'header',
                                    },
                                }), placeholder: "Access token", className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Token Type" }), _jsx("input", { type: "text", value: auth.oauth2?.tokenType ?? 'Bearer', onChange: (e) => onChange({
                                    ...auth,
                                    oauth2: {
                                        accessToken: auth.oauth2?.accessToken ?? '',
                                        tokenType: e.target.value,
                                        addTo: 'header',
                                    },
                                }), placeholder: "Bearer", className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs text-gray-500 uppercase tracking-wider", children: "Add To" }), _jsx("input", { type: "text", value: "Header", disabled: true, className: `${inputClass} opacity-50 cursor-not-allowed` })] })] }))] }));
}
