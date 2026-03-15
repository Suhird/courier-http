import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ResponseHeaders({ headers }) {
    const entries = Object.entries(headers);
    if (entries.length === 0) {
        return _jsx("p", { className: "text-gray-500 text-sm p-4", children: "No headers" });
    }
    return (_jsx("div", { className: "overflow-auto h-full", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-[#0f0f1e] text-gray-500 text-xs uppercase tracking-wide", children: [_jsx("th", { className: "px-4 py-2 text-left font-mono", children: "Header Name" }), _jsx("th", { className: "px-4 py-2 text-left font-mono", children: "Value" })] }) }), _jsx("tbody", { children: entries.map(([key, value], index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#16213e]', children: [_jsx("td", { className: "px-4 py-2 font-mono text-gray-300", children: key }), _jsx("td", { className: "px-4 py-2 font-mono text-gray-300", children: value })] }, key))) })] }) }));
}
