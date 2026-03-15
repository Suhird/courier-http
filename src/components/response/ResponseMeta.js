import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, Database } from 'lucide-react';
import { StatusBadge } from '../shared/Badge';
import { formatBytes, formatDuration } from '../../lib/utils';
export function ResponseMeta({ status, statusText, durationMs, sizeBytes }) {
    return (_jsxs("div", { className: "flex items-center gap-4 px-4 py-2 border-b border-gray-800 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StatusBadge, { status: status }), _jsx("span", { className: "text-gray-300", children: statusText })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-gray-500" }), _jsx("span", { className: "text-gray-400", children: formatDuration(durationMs) })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Database, { className: "w-3.5 h-3.5 text-gray-500" }), _jsx("span", { className: "text-gray-400", children: formatBytes(sizeBytes) })] })] }));
}
