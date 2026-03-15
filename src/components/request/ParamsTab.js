import { jsx as _jsx } from "react/jsx-runtime";
import { KeyValueTable } from '../shared/KeyValueTable';
export function ParamsTab({ pairs, onChange }) {
    return (_jsx("div", { className: "h-full overflow-auto", children: _jsx(KeyValueTable, { pairs: pairs, onChange: onChange, keyPlaceholder: "param", valuePlaceholder: "value" }) }));
}
