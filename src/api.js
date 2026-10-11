// API requests use VITE_API_BASE_URL in hosted deployments. Leave it unset for local Vite proxy.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
export const isRemoteApi = /^https?:\/\//i.test(API_BASE_URL);

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
