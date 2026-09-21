import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const AUTHORIZED_ADMIN_EMAIL = 'iadeshchandra@gmail.com';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Pre-flight check against hardcoded administrator email
    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setErrorMessage('Access denied: Unauthorized administrator identity.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      // Verify authenticated Firebase user strictly matches administrator identity
      if (userCredential.user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setErrorMessage('Access denied: Unauthorized administrator account.');
        return;
      }

      // Clear any legacy demo session flags
      localStorage.removeItem('syncops_admin_demo_session');
      localStorage.removeItem('cla_admin_demo_session');

      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Firebase Login Error:', err);
      const error = err as { code?: string; message?: string };
      
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid administrator credentials. Please verify your email and password.');
      } else if (
        error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/network-request-failed'
      ) {
        setErrorMessage('Authentication network or configuration failure. Please verify connection.');
      } else {
        setErrorMessage(error.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-page"
      className="min-h-screen bg-slate-950 text-slate-300 flex flex-col justify-center items-center p-4 sm:p-6 antialiased"
    >
      {/* Background ambient gradient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        {/* Top Logo & Identity */}
        <div className="text-center mb-8">
          <Link
            to="/"
            id="login-logo-link"
            className="inline-flex items-center gap-2.5 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              SyncOps <span className="text-indigo-400 font-mono text-sm">Studio Terminal</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white mt-4 tracking-tight">
            Terminal Access
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Restricted to verified lead architect authentication only.
          </p>
        </div>

        {/* Login Card */}
        <div
          id="login-form-card"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative overflow-hidden"
        >
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start gap-2.5 leading-relaxed"
            >
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="admin-login-form" onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="admin-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="iadeshchandra@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full min-h-[44px] pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full min-h-[44px] pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="admin-submit-login-btn"
              disabled={loading}
              className="w-full min-h-[44px] mt-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            id="login-back-home-link"
            className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors inline-flex items-center gap-1.5"
          >
            &larr; Return to SyncOps Studio Home
          </Link>
        </div>
      </div>
    </div>
  );
};
