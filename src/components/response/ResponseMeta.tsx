import { Clock, Database } from 'lucide-react';
import { StatusBadge } from '../shared/Badge';
import { formatBytes, formatDuration } from '../../lib/utils';

interface ResponseMetaProps {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
}

export function ResponseMeta({ status, statusText, durationMs, sizeBytes }: ResponseMetaProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 text-sm">
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <span className="text-gray-300">{statusText}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-400">{formatDuration(durationMs)}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-400">{formatBytes(sizeBytes)}</span>
      </div>
    </div>
  );
}
