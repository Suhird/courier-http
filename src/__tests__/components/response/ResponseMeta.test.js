import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { ResponseMeta } from '../../../components/response/ResponseMeta';
describe('ResponseMeta', () => {
    it('renders the status code via StatusBadge', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 512 }));
        expect(screen.getByText('200')).toBeInTheDocument();
    });
    it('renders statusText', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 512 }));
        expect(screen.getByText('OK')).toBeInTheDocument();
    });
    it('renders formatted duration for 150ms', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 150, sizeBytes: 512 }));
        expect(screen.getByText('150ms')).toBeInTheDocument();
    });
    it('renders formatted duration for 2000ms → 2.0s', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 2000, sizeBytes: 512 }));
        expect(screen.getByText('2.0s')).toBeInTheDocument();
    });
    it('renders formatted size for 512 bytes → "512 B"', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 512 }));
        expect(screen.getByText('512 B')).toBeInTheDocument();
    });
    it('renders formatted size for 1024 bytes → "1.0 KB"', () => {
        render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 1024 }));
        expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    });
    it('renders Clock icon (svg element present)', () => {
        const { container } = render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 512 }));
        // lucide-react renders SVGs; check at least 2 SVGs are present (Clock + Database)
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
    it('renders Database icon (svg element present)', () => {
        const { container } = render(_jsx(ResponseMeta, { status: 200, statusText: "OK", durationMs: 100, sizeBytes: 512 }));
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
});
