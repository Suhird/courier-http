import { cn, formatBytes, formatDuration, getStatusColor, getMethodColor } from '../../lib/utils';

describe('cn()', () => {
  it('combines multiple class names', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('handles truthy conditional classes', () => {
    expect(cn('base', true && 'added')).toBe('base added');
  });

  it('handles falsy conditional classes (omits them)', () => {
    expect(cn('base', false && 'skipped')).toBe('base');
  });

  it('handles undefined values', () => {
    expect(cn('base', undefined)).toBe('base');
  });

  it('handles null values', () => {
    // clsx treats null as falsy
    expect(cn('base', null as unknown as string)).toBe('base');
  });

  it('deduplicates conflicting Tailwind classes — last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('deduplicates other conflicting Tailwind utilities', () => {
    expect(cn('text-red-400', 'text-green-400')).toBe('text-green-400');
  });

  it('returns empty string when given no arguments', () => {
    expect(cn()).toBe('');
  });
});

describe('formatBytes()', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats 512 bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats 1023 bytes (just below 1 KB)', () => {
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats exactly 1024 bytes as 1.0 KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats 1536 bytes as 1.5 KB', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats exactly 1 MB (1048576 bytes)', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB');
  });

  it('formats exactly 1 GB (1073741824 bytes)', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB');
  });
});

describe('formatDuration()', () => {
  it('formats 0 ms', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('formats 999 ms (just below 1 second)', () => {
    expect(formatDuration(999)).toBe('999ms');
  });

  it('formats exactly 1000 ms as 1.0s', () => {
    expect(formatDuration(1000)).toBe('1.0s');
  });

  it('formats 1500 ms as 1.5s', () => {
    expect(formatDuration(1500)).toBe('1.5s');
  });

  it('formats 2000 ms as 2.0s', () => {
    expect(formatDuration(2000)).toBe('2.0s');
  });
});

describe('getStatusColor()', () => {
  it('returns text-green-400 for 200', () => {
    expect(getStatusColor(200)).toBe('text-green-400');
  });

  it('returns text-green-400 for 201', () => {
    expect(getStatusColor(201)).toBe('text-green-400');
  });

  it('returns text-green-400 for 299', () => {
    expect(getStatusColor(299)).toBe('text-green-400');
  });

  it('returns text-blue-400 for 300', () => {
    expect(getStatusColor(300)).toBe('text-blue-400');
  });

  it('returns text-blue-400 for 301', () => {
    expect(getStatusColor(301)).toBe('text-blue-400');
  });

  it('returns text-yellow-400 for 400', () => {
    expect(getStatusColor(400)).toBe('text-yellow-400');
  });

  it('returns text-yellow-400 for 404', () => {
    expect(getStatusColor(404)).toBe('text-yellow-400');
  });

  it('returns text-red-400 for 500', () => {
    expect(getStatusColor(500)).toBe('text-red-400');
  });

  it('returns text-red-400 for 503', () => {
    expect(getStatusColor(503)).toBe('text-red-400');
  });

  it('returns text-gray-400 for 0', () => {
    expect(getStatusColor(0)).toBe('text-gray-400');
  });

  it('returns text-gray-400 for 100 (1xx not handled)', () => {
    expect(getStatusColor(100)).toBe('text-gray-400');
  });
});

describe('getMethodColor()', () => {
  it('returns text-blue-400 for GET', () => {
    expect(getMethodColor('GET')).toBe('text-blue-400');
  });

  it('is case-insensitive — get returns text-blue-400', () => {
    expect(getMethodColor('get')).toBe('text-blue-400');
  });

  it('returns text-green-400 for POST', () => {
    expect(getMethodColor('POST')).toBe('text-green-400');
  });

  it('returns text-orange-400 for PUT', () => {
    expect(getMethodColor('PUT')).toBe('text-orange-400');
  });

  it('returns text-yellow-400 for PATCH', () => {
    expect(getMethodColor('PATCH')).toBe('text-yellow-400');
  });

  it('returns text-red-400 for DELETE', () => {
    expect(getMethodColor('DELETE')).toBe('text-red-400');
  });

  it('returns text-gray-400 for HEAD', () => {
    expect(getMethodColor('HEAD')).toBe('text-gray-400');
  });

  it('returns text-gray-400 for OPTIONS', () => {
    expect(getMethodColor('OPTIONS')).toBe('text-gray-400');
  });

  it('returns text-gray-400 for an unknown method', () => {
    expect(getMethodColor('UNKNOWN')).toBe('text-gray-400');
  });
});
