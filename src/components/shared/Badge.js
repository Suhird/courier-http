import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Badge({ children, className }) {
    return (_jsx("span", { className: cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold', className), children: children }));
}
export function MethodBadge({ method }) {
    const colors = {
        GET: 'bg-blue-900/50 text-blue-300',
        POST: 'bg-green-900/50 text-green-300',
        PUT: 'bg-orange-900/50 text-orange-300',
        PATCH: 'bg-yellow-900/50 text-yellow-300',
        DELETE: 'bg-red-900/50 text-red-300',
        HEAD: 'bg-purple-900/50 text-purple-300',
        OPTIONS: 'bg-gray-700/50 text-gray-300',
    };
    return (_jsx(Badge, { className: colors[method.toUpperCase()] ?? 'bg-gray-700/50 text-gray-300', children: method }));
}
export function StatusBadge({ status }) {
    let color = 'bg-gray-700/50 text-gray-300';
    if (status >= 200 && status < 300)
        color = 'bg-green-900/50 text-green-300';
    else if (status >= 300 && status < 400)
        color = 'bg-blue-900/50 text-blue-300';
    else if (status >= 400 && status < 500)
        color = 'bg-yellow-900/50 text-yellow-300';
    else if (status >= 500)
        color = 'bg-red-900/50 text-red-300';
    return _jsx(Badge, { className: color, children: status });
}
