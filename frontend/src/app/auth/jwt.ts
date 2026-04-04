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

// ─── decode (no verification) ────────────────────────────────────────────────

/**
 * Decode the JWT payload without verifying the signature.
 *
 * Signature verification is the backend's responsibility.
 * We only decode here to read display claims (name, email, exp)
 * that the backend already validated when it issued the token.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64 + '==='.slice((base64.length + 3) % 4);
    return JSON.parse(atob(padded)) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token's exp claim is in the future.
 * This is a lightweight client-side check only — the backend
 * always performs the authoritative expiry check on every request.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}

// ─── RegisterPayload (shared type used by AuthContext + Register page) ────────

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}
