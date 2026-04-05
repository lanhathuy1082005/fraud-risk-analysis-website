/**
 * jwt.ts
 * -------
 * Client-side JWT utilities.
 *
 * Responsibilities:
 *   - Store / retrieve / remove the JWT token in sessionStorage.
 *   - Decode the token payload for reading claims (name, email, exp).
 *
 * What this file does NOT do (moved to the backend):
 *   - Sign or generate tokens   → done by FastAPI using python-jose
 *   - Verify HMAC signatures    → done by FastAPI
 *   - Store user records        → done by PostgreSQL via SQLModel
 *   - Hash passwords            → done by FastAPI using passlib/bcrypt
 */

// ─── storage key ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'fds_jwt';   // sessionStorage only — cleared on tab close

// ─── types ───────────────────────────────────────────────────────────────────

/**
 * Claims the backend embeds inside the JWT payload.
 * Must stay in sync with the FastAPI token generation logic.
 */
export interface JWTPayload {
  sub:   string;   // user email (FastAPI convention)
  name:  string;   // user display name
  email: string;
  iat:   number;   // issued-at  (unix seconds)
  exp:   number;   // expiry     (unix seconds)
}

// ─── token storage ───────────────────────────────────────────────────────────

/** Save JWT to sessionStorage after a successful login. */
export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/** Load JWT from sessionStorage (returns null if absent). */
export function loadToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/** Remove JWT from sessionStorage on logout. */
export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ─── token parsing ───────────────────────────────────────────────────────────

/**
 * Decode a JWT payload (without verifying the signature — the backend already did).
 * Errors silently return null.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64URL decode (with padding restoration)
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=');

    const json = atob(base64);
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT has expired.
 * Returns true if the token's `exp` is in the past.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();  // convert unix seconds to milliseconds
}

// ─── registration types ──────────────────────────────────────────────────────

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}
