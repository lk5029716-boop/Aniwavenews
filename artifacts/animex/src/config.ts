export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://aniwavenews.onrender.com";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
