import { render, screen } from '@testing-library/react';
import { ResponseBody } from '../../../components/response/ResponseBody';

// Mock the shared MonacoEditor wrapper which itself uses @monaco-editor/react
vi.mock('../../../components/shared/MonacoEditor', () => ({
  MonacoEditor: ({
    value,
    language,
  }: {
    value: string;
    language: string;
    readOnly?: boolean;
    height?: string;
  }) => (
    <div data-testid="monaco-editor" data-language={language}>
      {value}
    </div>
  ),
}));

describe('ResponseBody', () => {
  describe('Language detection from Content-Type', () => {
    it('application/json → language="json"', () => {
      render(<ResponseBody body="{}" headers={{ 'content-type': 'application/json' }} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'json');
    });

    it('text/html → language="html"', () => {
      render(<ResponseBody body="<html/>" headers={{ 'Content-Type': 'text/html' }} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'html');
    });

    it('application/xml → language="xml"', () => {
      render(<ResponseBody body="<root/>" headers={{ 'content-type': 'application/xml' }} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'xml');
    });

    it('text/plain → language="plaintext"', () => {
      render(<ResponseBody body="hello" headers={{ 'content-type': 'text/plain' }} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'plaintext');
    });

    it('empty headers → language="plaintext"', () => {
      render(<ResponseBody body="hello" headers={{}} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'plaintext');
    });

    it('CONTENT-TYPE (all caps key) with application/json → language="json"', () => {
      render(<ResponseBody body="{}" headers={{ 'CONTENT-TYPE': 'application/json' }} />);
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'json');
    });
  });

  describe('JSON pretty-printing', () => {
    it('valid JSON body → pretty-printed version passed to editor', () => {
      const rawJson = '{"name":"Alice","age":30}';
      const prettyJson = JSON.stringify(JSON.parse(rawJson), null, 2);
      render(<ResponseBody body={rawJson} headers={{ 'content-type': 'application/json' }} />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor.textContent).toBe(prettyJson);
    });

    it('invalid JSON body → raw body passed as-is (no error thrown)', () => {
      const rawBody = 'not valid json {{{';
      render(<ResponseBody body={rawBody} headers={{ 'content-type': 'application/json' }} />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor.textContent).toBe(rawBody);
    });

    it('non-JSON body (text/plain) → raw body unchanged', () => {
      const rawBody = 'just plain text';
      render(<ResponseBody body={rawBody} headers={{ 'content-type': 'text/plain' }} />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor.textContent).toBe(rawBody);
    });
  });
});
