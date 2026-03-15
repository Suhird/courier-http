import { jsx as _jsx } from "react/jsx-runtime";
import { MonacoEditor } from '../shared/MonacoEditor';
function detectLanguage(headers) {
    const ct = Object.entries(headers).find(([k]) => k.toLowerCase() === 'content-type')?.[1] ?? '';
    if (ct.includes('json'))
        return 'json';
    if (ct.includes('html'))
        return 'html';
    if (ct.includes('xml'))
        return 'xml';
    return 'plaintext';
}
export function ResponseBody({ body, headers }) {
    const language = detectLanguage(headers);
    let displayBody = body;
    if (language === 'json') {
        try {
            displayBody = JSON.stringify(JSON.parse(body), null, 2);
        }
        catch {
            displayBody = body;
        }
    }
    return (_jsx("div", { className: "h-full", children: _jsx(MonacoEditor, { value: displayBody, language: language, readOnly: true, height: "100%" }) }));
}
