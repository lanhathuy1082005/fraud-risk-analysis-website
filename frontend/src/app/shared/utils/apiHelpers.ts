import { loadToken } from './../../features/auth/services/jwt';

// ─── base URL ────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

// ─── internal helpers ─────────────────────────────────────────────────────────

/**
 * Build common headers.
 * Attaches Authorization header when a token exists in sessionStorage.
 */
export function buildHeaders(includeAuth = false): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = loadToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Parse a FastAPI error response into a readable string.
 * FastAPI returns { detail: string | { msg: string }[] }
 */
export async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { msg: string }) => d.msg).join(', ');
    }
    return `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

// ─── authenticated request helper ─────────────────────────────────────────────

/**
 * Generic helper for any future authenticated API call.
 * Attach the JWT automatically and parse JSON response.
 *
 * Usage:
 *   const data = await authFetch<TransactionPublic[]>('/transactions');
 */
export async function fetchHelper<T>(
  path: string,
  options: RequestInit = {},
  includeAuth = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(includeAuth),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  return res.json() as Promise<T>;
}