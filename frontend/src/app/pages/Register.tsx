import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Shield, Lock, Mail, User, AlertCircle,
  Eye, EyeOff, CheckCircle2, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// ─── password strength ───────────────────────────────────────────────────────

interface StrengthResult {
  score:  number;     // 0 – 4
  label:  string;
  color:  string;
  bar:    string;
}

function getPasswordStrength(pw: string): StrengthResult {
  let score = 0;
  if (pw.length >= 8)                    score++;
  if (pw.length >= 12)                   score++;
  if (/[A-Z]/.test(pw))                  score++;
  if (/[0-9]/.test(pw))                  score++;
  if (/[^A-Za-z0-9]/.test(pw))          score++;

  const levels = [
    { label: '',          color: 'text-gray-400',  bar: 'bg-gray-200'  },
    { label: 'Weak',      color: 'text-red-600',   bar: 'bg-red-500'   },
    { label: 'Fair',      color: 'text-orange-600', bar: 'bg-orange-500' },
    { label: 'Good',      color: 'text-yellow-600', bar: 'bg-yellow-500' },
    { label: 'Strong',    color: 'text-green-600',  bar: 'bg-green-500'  },
    { label: 'Very strong', color: 'text-green-700', bar: 'bg-green-600' },
  ];

  const clamped = Math.min(score, 5) as 0|1|2|3|4|5;
  return { score: clamped, ...levels[clamped] };
}

// ─── validation helpers ──────────────────────────────────────────────────────

function validateEmail(email: string): string {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return '';
}

function validatePassword(pw: string): string {
  if (!pw)          return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Register() {
  const navigate       = useNavigate();
  const { register }   = useAuth();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const strength = getPasswordStrength(password);

  // ── field-level validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!name.trim())           next.name     = 'Full name is required.';
    const emailErr = validateEmail(email);
    if (emailErr)               next.email    = emailErr;
    const pwErr = validatePassword(password);
    if (pwErr)                  next.password = pwErr;
    if (!confirm)               next.confirm  = 'Please confirm your password.';
    else if (confirm !== password) next.confirm = 'Passwords do not match.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    const result = await register({ name: name.trim(), email, password });
    setLoading(false);

    if (!result.success) {
      setGlobalError(result.error ?? 'Registration failed. Please try again.');
      return;
    }

    setSuccess(true);
    // Redirect to login after 2.5 s
    setTimeout(() => navigate('/'), 2500);
  };

  const clearFieldError = (field: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  // ── success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-lg shadow-xl p-10">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created</h2>
            <p className="text-sm text-gray-600 mb-1">
              Your account has been successfully registered.
            </p>
            <p className="text-xs text-gray-400">Redirecting you to the login page…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── register form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Fraud Detection System
          </h1>
          <p className="text-sm text-slate-400">
            Confidence-Aware Adaptive Risk Scoring
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">

          {/* Card header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create Account</h2>
            <p className="text-sm text-gray-600">
              Register to access the fraud analysis platform
            </p>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="e.g. Jane Smith"
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="you@organisation.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.bar : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-medium ${strength.color}`}>{strength.label}</p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); clearFieldError('confirm'); }}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirm ? 'border-red-400 bg-red-50' : confirm && confirm === password ? 'border-green-400' : 'border-gray-300'}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.confirm}
                </p>
              )}
              {!errors.confirm && confirm && confirm === password && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Banking Fraud Detection System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
