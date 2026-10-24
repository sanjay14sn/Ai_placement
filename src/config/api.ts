// ─────────────────────────────────────────────────────────────────────────────
// AI Campus OS — API Configuration
// Resolves live or development API base URL & Backend origin
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_API_URL = 'https://api.aicampusintelligent.com/api';

const rawUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();

// Strip any trailing slashes
const cleanUrl = rawUrl.replace(/\/+$/, '');

// Ensure API_BASE always points to the /api endpoint
export const API_BASE = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

// BACKEND_BASE is the host origin without /api (used for uploads/media & socket.io)
export const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '');

/**
 * Normalizes media, upload, and avatar URLs:
 * Handles full URLs (http/https/blob/data) and relative paths like /uploads/...
 */
export const getMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};
