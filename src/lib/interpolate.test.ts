import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('replaces a single variable', () => {
    expect(interpolate('https://{{baseUrl}}/api', { baseUrl: 'example.com' })).toBe(
      'https://example.com/api',
    );
  });

  it('replaces multiple variables', () => {
    expect(
      interpolate('{{protocol}}://{{host}}/{{path}}', {
        protocol: 'https',
        host: 'api.example.com',
        path: 'v1/users',
      }),
    ).toBe('https://api.example.com/v1/users');
  });

  it('leaves unknown variables unchanged', () => {
    expect(interpolate('Hello {{name}}, your id is {{id}}', { name: 'Alice' })).toBe(
      'Hello Alice, your id is {{id}}',
    );
  });

  it('handles an empty variables map', () => {
    expect(interpolate('https://{{baseUrl}}/api', {})).toBe('https://{{baseUrl}}/api');
  });

  it('passes through a template with no variables', () => {
    expect(interpolate('https://example.com/api', { baseUrl: 'other.com' })).toBe(
      'https://example.com/api',
    );
  });

  it('handles adjacent variables', () => {
    expect(interpolate('{{a}}{{b}}', { a: 'foo', b: 'bar' })).toBe('foobar');
  });
});
