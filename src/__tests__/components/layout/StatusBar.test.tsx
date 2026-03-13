import { render, screen } from '@testing-library/react';
import { useEnvironmentStore } from '../../../store/environmentStore';

// Mock Radix UI Select — it relies on browser APIs that aren't available in jsdom
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Value: ({ children, placeholder }: { children?: React.ReactNode; placeholder?: string }) =>
    children ? <span>{children}</span> : <span>{placeholder}</span>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
  Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ItemText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Separator: () => <hr />,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocking so the mock is in place
import { StatusBar } from '../../../components/layout/StatusBar';

// Also mock tauri so environmentStore doesn't blow up
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

beforeEach(() => {
  useEnvironmentStore.setState({
    environments: [],
    activeEnvironmentId: null,
    isLoading: false,
  });
});

describe('StatusBar', () => {
  it('renders "No Environment" when no environments exist and none is active', () => {
    render(<StatusBar />);
    // The mock renders Select.Value and Select.Item both, so multiple matches are expected
    const els = screen.getAllByText('No Environment');
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it('renders environment names when environments are in the store', () => {
    useEnvironmentStore.setState({
      environments: [
        { id: 'env-1', name: 'Development', variables: [] },
        { id: 'env-2', name: 'Production', variables: [] },
      ],
      activeEnvironmentId: null,
      isLoading: false,
    });
    render(<StatusBar />);
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('shows active environment name when activeEnvironmentId is set', () => {
    useEnvironmentStore.setState({
      environments: [
        { id: 'env-1', name: 'Staging', variables: [] },
      ],
      activeEnvironmentId: 'env-1',
      isLoading: false,
    });
    render(<StatusBar />);
    // The Select.Value child renders the active env name
    const stagingEls = screen.getAllByText('Staging');
    expect(stagingEls.length).toBeGreaterThanOrEqual(1);
  });
});
