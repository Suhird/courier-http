import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyValueTable } from '../../../components/shared/KeyValueTable';
const makePair = (overrides = {}) => ({
    id: 'test-id-1',
    key: 'Content-Type',
    value: 'application/json',
    enabled: true,
    ...overrides,
});
describe('KeyValueTable', () => {
    describe('Rendering', () => {
        it('renders empty table (no pairs) with "+ Add" button', () => {
            const onChange = vi.fn();
            render(_jsx(KeyValueTable, { pairs: [], onChange: onChange }));
            expect(screen.getByText(/Add/)).toBeInTheDocument();
        });
        it("renders a pair's key and value as input values", () => {
            const onChange = vi.fn();
            const pair = makePair();
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const inputs = screen.getAllByRole('textbox');
            expect(inputs[0]).toHaveValue('Content-Type');
            expect(inputs[1]).toHaveValue('application/json');
        });
        it('renders the enabled checkbox checked when enabled=true', () => {
            const onChange = vi.fn();
            const pair = makePair({ enabled: true });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });
        it('renders the enabled checkbox unchecked when enabled=false', () => {
            const onChange = vi.fn();
            const pair = makePair({ enabled: false });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
        });
        it('renders multiple pairs', () => {
            const onChange = vi.fn();
            const pairs = [
                makePair({ id: 'id-1', key: 'Accept', value: 'application/json' }),
                makePair({ id: 'id-2', key: 'Authorization', value: 'Bearer token' }),
            ];
            render(_jsx(KeyValueTable, { pairs: pairs, onChange: onChange }));
            expect(screen.getByDisplayValue('Accept')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Bearer token')).toBeInTheDocument();
        });
        it('uses keyPlaceholder and valuePlaceholder props', () => {
            const onChange = vi.fn();
            // Must pass a pair so inputs are rendered; placeholders only show on inputs, not when empty
            const pair = makePair({ key: '', value: '' });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange, keyPlaceholder: "Header Name", valuePlaceholder: "Header Value" }));
            const inputs = screen.getAllByRole('textbox');
            expect(inputs[0]).toHaveAttribute('placeholder', 'Header Name');
            expect(inputs[1]).toHaveAttribute('placeholder', 'Header Value');
        });
    });
    describe('Interactions', () => {
        it('clicking "+ Add" calls onChange with a new pair appended', () => {
            const onChange = vi.fn();
            render(_jsx(KeyValueTable, { pairs: [], onChange: onChange }));
            fireEvent.click(screen.getByText(/Add/));
            expect(onChange).toHaveBeenCalledOnce();
            const [newPairs] = onChange.mock.calls[0];
            expect(newPairs).toHaveLength(1);
            expect(newPairs[0]).toMatchObject({ key: '', value: '', enabled: true });
            expect(typeof newPairs[0].id).toBe('string');
            expect(newPairs[0].id).toBeTruthy();
        });
        it('changing key input calls onChange with updated key', () => {
            const onChange = vi.fn();
            const pair = makePair({ key: 'OldKey' });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const keyInput = screen.getByDisplayValue('OldKey');
            fireEvent.change(keyInput, { target: { value: 'NewKey' } });
            expect(onChange).toHaveBeenCalledWith([{ ...pair, key: 'NewKey' }]);
        });
        it('changing value input calls onChange with updated value', () => {
            const onChange = vi.fn();
            const pair = makePair({ value: 'old-value' });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const valueInput = screen.getByDisplayValue('old-value');
            fireEvent.change(valueInput, { target: { value: 'new-value' } });
            expect(onChange).toHaveBeenCalledWith([{ ...pair, value: 'new-value' }]);
        });
        it('toggling checkbox calls onChange with updated enabled=false', () => {
            const onChange = vi.fn();
            const pair = makePair({ enabled: true });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(onChange).toHaveBeenCalledWith([{ ...pair, enabled: false }]);
        });
        it('toggling checkbox back calls onChange with enabled=true', () => {
            const onChange = vi.fn();
            const pair = makePair({ enabled: false });
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(onChange).toHaveBeenCalledWith([{ ...pair, enabled: true }]);
        });
        it('clicking delete button calls onChange with the pair removed', () => {
            const onChange = vi.fn();
            const pair = makePair();
            render(_jsx(KeyValueTable, { pairs: [pair], onChange: onChange }));
            const deleteBtn = screen.getByRole('button', { name: /delete row/i });
            fireEvent.click(deleteBtn);
            expect(onChange).toHaveBeenCalledWith([]);
        });
    });
});
