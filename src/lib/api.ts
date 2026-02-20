const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const buildApiUrl = (path: string) => {
  if (!path) return normalizedBaseUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${normalizedBaseUrl}${path}`;
  return `${normalizedBaseUrl}/${path}`;
};
