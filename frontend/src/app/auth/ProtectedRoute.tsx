/**
 * ProtectedRoute.tsx
 * -------------------
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  - While the auth state is still being verified (isLoading), renders a
 *    neutral loading screen so the app doesn't flash the login page.
 *  - If the user is authenticated, renders children normally.
 *  - If not authenticated, redirects to "/" (the Login page).
 */

import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';
import { Shield } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Still verifying token from sessionStorage — show a minimal loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
