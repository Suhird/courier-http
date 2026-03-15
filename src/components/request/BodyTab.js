import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KeyValueTable } from '../shared/KeyValueTable';
import { MonacoEditor } from '../shared/MonacoEditor';
const BODY_TYPES = [
    { value: 'none', label: 'none' },
    { value: 'json', label: 'json' },
    { value: 'text', label: 'text' },
    { value: 'xml', label: 'xml' },
    { value: 'html', label: 'html' },
    { value: 'form-urlencoded', label: 'form-urlencoded' },
    { value: 'form-data', label: 'form-data' },
];
const LANGUAGE_MAP = {
    json: 'json',
    text: 'plaintext',
    xml: 'xml',
    html: 'html',
};
export function BodyTab({ bodyType, bodyRaw, bodyFormPairs, onChange }) {
    const isEditorType = bodyType === 'json' || bodyType === 'text' || bodyType === 'xml' || bodyType === 'html';
    const isFormType = bodyType === 'form-urlencoded' || bodyType === 'form-data';
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "flex items-center gap-1 px-3 py-2 border-b border-gray-800 flex-wrap", children: BODY_TYPES.map(({ value, label }) => (_jsx("button", { onClick: () => onChange({ bodyType: value }), className: bodyType === value
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 px-3 py-1 text-sm rounded'
                        : 'text-gray-400 hover:text-gray-200 px-3 py-1 text-sm rounded', children: label }, value))) }), _jsxs("div", { className: "flex-1 overflow-hidden", children: [bodyType === 'none' && (_jsx("div", { className: "flex items-center justify-center h-full text-gray-500 text-sm", children: "No body" })), isEditorType && (_jsx(MonacoEditor, { value: bodyRaw, onChange: (value) => onChange({ bodyRaw: value }), language: LANGUAGE_MAP[bodyType], height: "100%" })), isFormType && (_jsx("div", { className: "h-full overflow-auto p-2", children: _jsx(KeyValueTable, { pairs: bodyFormPairs, onChange: (pairs) => onChange({ bodyFormPairs: pairs }), keyPlaceholder: "key", valuePlaceholder: "value" }) }))] })] }));
}
