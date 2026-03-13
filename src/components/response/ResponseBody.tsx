import { MonacoEditor } from '../shared/MonacoEditor';

interface ResponseBodyProps {
  body: string;
  headers: Record<string, string>;
}

function detectLanguage(headers: Record<string, string>): string {
  const ct = Object.entries(headers).find(([k]) => k.toLowerCase() === 'content-type')?.[1] ?? '';
  if (ct.includes('json')) return 'json';
  if (ct.includes('html')) return 'html';
  if (ct.includes('xml')) return 'xml';
  return 'plaintext';
}

export function ResponseBody({ body, headers }: ResponseBodyProps) {
  const language = detectLanguage(headers);

  let displayBody = body;
  if (language === 'json') {
    try {
      displayBody = JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      displayBody = body;
    }
  }

  return (
    <div className="h-full">
      <MonacoEditor value={displayBody} language={language} readOnly height="100%" />
    </div>
  );
}
