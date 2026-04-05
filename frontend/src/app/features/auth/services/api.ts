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


import { fetchHelper } from "../../../shared/utils/apiHelpers";
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
  return await fetchHelper<void>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  },
  false // don't include auth token for registration
  );
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


  const data = await fetchHelper<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, password: password})
  },
  false // don't include auth token for login
  );
  return data.access_token;
}

/**
 * GET /me  
 *
 * Used on app mount to restore the session from a stored JWT.
 * Returns UserPublic: { email, name, uuid }
 *
 * Throws if the token is missing or rejected by the backend.
 */
export async function apiGetMe(): Promise<{ email: string; name: string; uuid: string }> {
  return await fetchHelper<{ email: string; name: string; uuid: string }>('/auth/me');
}




