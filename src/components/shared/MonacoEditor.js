import { jsx as _jsx } from "react/jsx-runtime";
import Editor from '@monaco-editor/react';
export function MonacoEditor({ value, onChange, language = 'plaintext', readOnly = false, height = '100%', minHeight, }) {
    function handleChange(val) {
        if (onChange) {
            onChange(val ?? '');
        }
    }
    return (_jsx("div", { style: { height, minHeight }, children: _jsx(Editor, { height: height, value: value, language: language, theme: "vs-dark", onChange: handleChange, loading: _jsx("div", { className: "flex items-center justify-center h-full text-gray-500 text-sm", children: "Loading editor..." }), options: {
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                readOnly,
                automaticLayout: true,
            } }) }));
}
