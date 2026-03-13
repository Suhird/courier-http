import { render, screen } from '@testing-library/react';
import { ResponseHeaders } from '../../../components/response/ResponseHeaders';

describe('ResponseHeaders', () => {
  it('empty headers → renders "No headers" text', () => {
    render(<ResponseHeaders headers={{}} />);
    expect(screen.getByText('No headers')).toBeInTheDocument();
  });

  it('renders a table when headers are provided', () => {
    render(<ResponseHeaders headers={{ 'content-type': 'application/json' }} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders "Header Name" column header', () => {
    render(<ResponseHeaders headers={{ 'content-type': 'application/json' }} />);
    expect(screen.getByText('Header Name')).toBeInTheDocument();
  });

  it('renders "Value" column header', () => {
    render(<ResponseHeaders headers={{ 'content-type': 'application/json' }} />);
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders each key-value pair in table cells', () => {
    render(<ResponseHeaders headers={{ 'content-type': 'application/json' }} />);
    expect(screen.getByText('content-type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
  });

  it('renders multiple headers, all visible', () => {
    render(
      <ResponseHeaders
        headers={{
          'content-type': 'application/json',
          'x-request-id': 'abc-123',
          'cache-control': 'no-cache',
        }}
      />,
    );
    expect(screen.getByText('content-type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText('x-request-id')).toBeInTheDocument();
    expect(screen.getByText('abc-123')).toBeInTheDocument();
    expect(screen.getByText('cache-control')).toBeInTheDocument();
    expect(screen.getByText('no-cache')).toBeInTheDocument();
  });

  it('header names rendered with font-mono class', () => {
    render(<ResponseHeaders headers={{ 'content-type': 'application/json' }} />);
    const cell = screen.getByText('content-type');
    expect(cell).toHaveClass('font-mono');
  });
});
