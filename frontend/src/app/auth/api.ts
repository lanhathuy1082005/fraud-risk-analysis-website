/// <reference types="vite/client" />
/**
 * api.ts
 * -------
 * All HTTP communication with the FastAPI backend.
 *
 * Base URL is read from the VITE_API_URL environment variable.
 * During local development set it in a .env file:
 *
 *   VITE_API_URL=http://localhost:8000
 *
 * Every function that requires authentication attaches the JWT
 * from sessionStorage via the Authorization: Bearer header.
 *
 * Error handling convention:
 *   - Success → returns the data object
 *   - Failure → throws an Error with a human-readable message
 */

import { loadToken } from './jwt';

// ─── base URL ────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

// ─── internal helpers ─────────────────────────────────────────────────────────

/**
 * Build common headers.
 * Attaches Authorization header when a token exists in sessionStorage.
 */
function buildHeaders(includeAuth = false): HeadersInit {
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
async function extractError(res: Response): Promise<string> {
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

// ─── auth endpoints ───────────────────────────────────────────────────────────

/**
 * POST /register
 *
 * Maps to your backend's UserRegister model:
 *   { email: EmailStr, name: str, password: str }
 *
 * Returns UserPublic on success: { email, name, uuid }
 */
export async function apiRegister(payload: {
  name:     string;
  email:    string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/register`, {
    method:  'POST',
    headers: buildHeaders(),
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }
}

/**
 * POST /login
 *
 * FastAPI's OAuth2PasswordRequestForm expects form-encoded data:
 *   username=<email>&password=<password>
 *
 * Returns Token: { access_token: str, token_type: str }
 */
export async function apiLogin(email: string, password: string): Promise<string> {
  // FastAPI OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
  const body = new URLSearchParams();
  body.append('username', email);   // FastAPI OAuth2 uses "username" field
  body.append('password', password);

  const res = await fetch(`${BASE_URL}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  const data: { access_token: string; token_type: string } = await res.json();
  return data.access_token;
}

/**
 * GET /me  (or whichever endpoint returns the current user's profile)
 *
 * Used on app mount to restore the session from a stored JWT.
 * Returns UserPublic: { email, name, uuid }
 *
 * Throws if the token is missing or rejected by the backend.
 */
export async function apiGetMe(): Promise<{ email: string; name: string; uuid: string }> {
  const res = await fetch(`${BASE_URL}/me`, {
    method:  'GET',
    headers: buildHeaders(true),   // attach Authorization header
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  return res.json();
}

// ─── authenticated request helper ─────────────────────────────────────────────

/**
 * Generic helper for any future authenticated API call.
 * Attach the JWT automatically and parse JSON response.
 *
 * Usage:
 *   const data = await authFetch<TransactionPublic[]>('/transactions');
 */
export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(true),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(await extractError(res));
  }

  return res.json() as Promise<T>;
}
