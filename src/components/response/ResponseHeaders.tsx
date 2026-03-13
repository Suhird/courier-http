interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm p-4">No headers</p>;
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0f0f1e] text-gray-500 text-xs uppercase tracking-wide">
            <th className="px-4 py-2 text-left font-mono">Header Name</th>
            <th className="px-4 py-2 text-left font-mono">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#16213e]'}
            >
              <td className="px-4 py-2 font-mono text-gray-300">{key}</td>
              <td className="px-4 py-2 font-mono text-gray-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
