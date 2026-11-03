/**
 * API configuration and URL resolution.
 * If VITE_API_URL is set in environment variables (e.g. pointing to a hosted Cloud Run or custom backend),
 * apiUrl() prepends that domain.
 * Otherwise, relative paths are used (/api/...) which works seamlessly locally, in AI Studio,
 * and with Vercel rewrites or serverless functions.
 */

export const API_BASE_URL: string = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
    : ''
);

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
