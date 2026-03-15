import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { Badge, MethodBadge, StatusBadge } from '../../../components/shared/Badge';
describe('Badge', () => {
    it('renders children', () => {
        render(_jsx(Badge, { children: "Hello" }));
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    it('applies custom className', () => {
        render(_jsx(Badge, { className: "custom-class", children: "Text" }));
        const el = screen.getByText('Text');
        expect(el).toHaveClass('custom-class');
    });
    it('has base classes font-mono, text-xs, etc.', () => {
        render(_jsx(Badge, { children: "Base" }));
        const el = screen.getByText('Base');
        expect(el).toHaveClass('font-mono');
        expect(el).toHaveClass('text-xs');
        expect(el).toHaveClass('font-semibold');
        expect(el).toHaveClass('rounded');
    });
});
describe('MethodBadge', () => {
    it('GET → renders text "GET" with blue color classes', () => {
        render(_jsx(MethodBadge, { method: "GET" }));
        const el = screen.getByText('GET');
        expect(el).toBeInTheDocument();
        expect(el).toHaveClass('bg-blue-900/50');
        expect(el).toHaveClass('text-blue-300');
    });
    it('POST → renders with green color classes', () => {
        render(_jsx(MethodBadge, { method: "POST" }));
        const el = screen.getByText('POST');
        expect(el).toHaveClass('bg-green-900/50');
        expect(el).toHaveClass('text-green-300');
    });
    it('PUT → renders with orange color classes', () => {
        render(_jsx(MethodBadge, { method: "PUT" }));
        const el = screen.getByText('PUT');
        expect(el).toHaveClass('bg-orange-900/50');
        expect(el).toHaveClass('text-orange-300');
    });
    it('PATCH → renders with yellow color classes', () => {
        render(_jsx(MethodBadge, { method: "PATCH" }));
        const el = screen.getByText('PATCH');
        expect(el).toHaveClass('bg-yellow-900/50');
        expect(el).toHaveClass('text-yellow-300');
    });
    it('DELETE → renders with red color classes', () => {
        render(_jsx(MethodBadge, { method: "DELETE" }));
        const el = screen.getByText('DELETE');
        expect(el).toHaveClass('bg-red-900/50');
        expect(el).toHaveClass('text-red-300');
    });
    it('HEAD → renders with purple color classes', () => {
        render(_jsx(MethodBadge, { method: "HEAD" }));
        const el = screen.getByText('HEAD');
        expect(el).toHaveClass('bg-purple-900/50');
        expect(el).toHaveClass('text-purple-300');
    });
    it('OPTIONS → renders with gray color classes', () => {
        render(_jsx(MethodBadge, { method: "OPTIONS" }));
        const el = screen.getByText('OPTIONS');
        expect(el).toHaveClass('bg-gray-700/50');
        expect(el).toHaveClass('text-gray-300');
    });
    it('lowercase "get" → uses GET color classes, renders "get" as text', () => {
        render(_jsx(MethodBadge, { method: "get" }));
        const el = screen.getByText('get');
        expect(el).toBeInTheDocument();
        expect(el).toHaveClass('bg-blue-900/50');
        expect(el).toHaveClass('text-blue-300');
    });
    it('unknown method → gray fallback color', () => {
        render(_jsx(MethodBadge, { method: "CUSTOM" }));
        const el = screen.getByText('CUSTOM');
        expect(el).toHaveClass('bg-gray-700/50');
        expect(el).toHaveClass('text-gray-300');
    });
});
describe('StatusBadge', () => {
    it('200 → green color classes', () => {
        render(_jsx(StatusBadge, { status: 200 }));
        const el = screen.getByText('200');
        expect(el).toHaveClass('bg-green-900/50');
        expect(el).toHaveClass('text-green-300');
    });
    it('201 → green color classes', () => {
        render(_jsx(StatusBadge, { status: 201 }));
        const el = screen.getByText('201');
        expect(el).toHaveClass('bg-green-900/50');
        expect(el).toHaveClass('text-green-300');
    });
    it('301 → blue color classes', () => {
        render(_jsx(StatusBadge, { status: 301 }));
        const el = screen.getByText('301');
        expect(el).toHaveClass('bg-blue-900/50');
        expect(el).toHaveClass('text-blue-300');
    });
    it('404 → yellow color classes', () => {
        render(_jsx(StatusBadge, { status: 404 }));
        const el = screen.getByText('404');
        expect(el).toHaveClass('bg-yellow-900/50');
        expect(el).toHaveClass('text-yellow-300');
    });
    it('500 → red color classes', () => {
        render(_jsx(StatusBadge, { status: 500 }));
        const el = screen.getByText('500');
        expect(el).toHaveClass('bg-red-900/50');
        expect(el).toHaveClass('text-red-300');
    });
    it('0 → default gray color classes', () => {
        render(_jsx(StatusBadge, { status: 0 }));
        const el = screen.getByText('0');
        expect(el).toHaveClass('bg-gray-700/50');
        expect(el).toHaveClass('text-gray-300');
    });
    it('renders the status number as text', () => {
        render(_jsx(StatusBadge, { status: 418 }));
        expect(screen.getByText('418')).toBeInTheDocument();
    });
});
