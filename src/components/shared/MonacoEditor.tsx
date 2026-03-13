import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  minHeight?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  height = '100%',
  minHeight,
}: MonacoEditorProps) {
  function handleChange(val: string | undefined) {
    if (onChange) {
      onChange(val ?? '');
    }
  }

  return (
    <div style={{ height, minHeight }}>
      <Editor
        height={height}
        value={value}
        language={language}
        theme="vs-dark"
        onChange={handleChange}
        loading={
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Loading editor...
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
