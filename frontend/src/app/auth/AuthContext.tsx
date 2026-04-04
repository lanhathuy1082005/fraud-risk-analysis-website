/**
 * AuthContext.tsx
 * ---------------
 * Global authentication state for the app.
 *
 * Flow:
 *  Login    → POST /login  → receive JWT → save to sessionStorage → decode claims
 *  Register → POST /register → success → caller redirects to login
 *  Mount    → load token from sessionStorage → GET /me to verify it's still valid
 *  Logout   → remove token from sessionStorage → reset state
 *
 * No user data is stored in the browser.
 * The JWT is the only item kept in sessionStorage.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  JWTPayload,
  RegisterPayload,
  saveToken,
  loadToken,
  removeToken,
  decodeToken,
  isTokenExpired,
} from './jwt';

import {
  apiLogin,
  apiRegister,
  apiGetMe,
} from './api';

// ─── types ───────────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  isLoading:       boolean;
  user:            JWTPayload | null;
  token:           string | null;
}

interface AuthContextType extends AuthState {
  login:    (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout:   () => void;
  register: (payload: RegisterPayload)        => Promise<{ success: boolean; error?: string }>;
}

// ─── context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading:       true,
  user:            null,
  token:           null,
  login:           async () => ({ success: false }),
  logout:          () => {},
  register:        async () => ({ success: false }),
});

// ─── provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading:       true,
    user:            null,
    token:           null,
  });

  // ── session restore on mount ──────────────────────────────────────────────
  //
  // On every page load / refresh:
  //  1. Read any stored JWT from sessionStorage
  //  2. If found and not client-side expired, call GET /me to confirm it's
  //     still valid on the backend (handles revocation, server restarts etc.)
  //  3. Decode the claims from the token for display (name, email)
  //  4. If anything fails, clear the token and show the login screen
  //
  useEffect(() => {
    const restore = async () => {
      const stored = loadToken();

      if (stored && !isTokenExpired(stored)) {
        try {
          // Verify with the backend — throws if token is invalid/expired server-side
          await apiGetMe();

          // Token is valid — decode claims for the UI
          const payload = decodeToken(stored);
          if (payload) {
            setState({ isAuthenticated: true, isLoading: false, user: payload, token: stored });
            return;
          }
        } catch {
          // Backend rejected the token — clean up silently
          removeToken();
        }
      } else if (stored) {
        // Client-side check says expired — remove immediately
        removeToken();
      }

      setState(s => ({ ...s, isLoading: false }));
    };

    restore();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  //
  // Calls POST /login (FastAPI OAuth2PasswordRequestForm).
  // On success the backend returns { access_token, token_type }.
  // We save the token, decode the payload, and update state.
  //
  const login = async (
    email:    string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token   = await apiLogin(email, password);
      const payload = decodeToken(token);

      if (!payload) {
        return { success: false, error: 'Received an invalid token from the server.' };
      }

      saveToken(token);
      setState({ isAuthenticated: true, isLoading: false, user: payload, token });
      return { success: true };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // ── register ──────────────────────────────────────────────────────────────
  //
  // Calls POST /register.
  // On success the backend creates the user in PostgreSQL.
  // We do NOT auto-login after registration — the user is directed to the
  // login page to sign in with their new credentials.
  //
  const register = async (
    payload: RegisterPayload,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiRegister(payload);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────
  //
  // Removes the JWT from sessionStorage and resets auth state.
  // No server call needed unless your backend maintains a token blocklist.
  //
  const logout = () => {
    removeToken();
    setState({ isAuthenticated: false, isLoading: false, user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
