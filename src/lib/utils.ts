import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to a human-readable string.
 * @example formatBytes(1024) => "1.0 KB"
 * @example formatBytes(1048576) => "1.0 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * @example formatDuration(150) => "150ms"
 * @example formatDuration(1500) => "1.5s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Return a Tailwind text-color class based on HTTP status code.
 * 2xx => text-green-400, 3xx => text-blue-400, 4xx => text-yellow-400,
 * 5xx => text-red-400, else text-gray-400
 */
export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-yellow-400';
  if (status >= 500 && status < 600) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Return a Tailwind text-color class based on HTTP method.
 * GET=blue, POST=green, PUT=orange, PATCH=yellow, DELETE=red, else gray
 */
export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':    return 'text-blue-400';
    case 'POST':   return 'text-green-400';
    case 'PUT':    return 'text-orange-400';
    case 'PATCH':  return 'text-yellow-400';
    case 'DELETE': return 'text-red-400';
    default:       return 'text-gray-400';
  }
}
