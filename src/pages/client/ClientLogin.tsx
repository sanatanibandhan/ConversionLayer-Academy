import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ClientLogin: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/client/dashboard';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (user) {
      navigate('/client/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await register(email.trim(), password, fullName.trim() || undefined);
      } else {
        await login(email.trim(), password);
      }

      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Client Auth Error:', err);
      const error = err as { code?: string; message?: string };
      
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email address already exists. Please sign in instead.');
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid email or password. Please check your credentials or create a new account.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(error.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('client123456');
    setErrorMessage('');
  };

  return (
    <div
      id="client-login-page"
      className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 antialiased relative overflow-hidden"
    >
      {/* Background ambient lighting effects */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            to="/"
            id="client-login-back-home-link"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Return to SyncOps Agency</span>
          </Link>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white tracking-tight">SyncOps Client Portal</h1>
              <span className="text-xs font-mono text-indigo-400">DEPLOYMENT &amp; MILESTONE SUITE</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2">
            Access your active tracking architectures, monitor delivery milestones, and fund project stages securely.
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              id="tab-mode-signin"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Client Sign In
            </button>
            <button
              type="button"
              id="tab-mode-register"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              New Client Registration
            </button>
          </div>

          {errorMessage && (
            <div
              id="client-auth-error-alert"
              role="alert"
              className="p-3.5 mb-5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5" htmlFor="client-full-name">
                  Company or Representative Name
                </label>
                <input
                  id="client-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nordic Brands E-Commerce Inc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5" htmlFor="client-email">
                Client Corporate Email Address *
              </label>
              <input
                id="client-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@yourdomain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
              <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                Must match the client email assigned in your project deployment statement.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5" htmlFor="client-password">
                Password *
              </label>
              <input
                id="client-password"
                type="password"
                required
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              id="client-auth-submit-btn"
              disabled={loading}
              className="w-full min-h-[44px] mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Identity...</span>
                </>
              ) : isRegisterMode ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span>Register &amp; Access Projects</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Sign In to Client Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Testing / Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>Quick Test Credentials</span>
              <span className="text-slate-500">Click to fill</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                id="btn-quick-fill-nordic"
                onClick={() => handleQuickFill('client@nordicbrand.com')}
                className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center justify-between min-h-[36px]"
              >
                <span>client@nordicbrand.com</span>
                <span className="text-[10px] text-indigo-400">Sample Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Sub-links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Internal SyncOps Lead Architect?{' '}
            <Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 underline font-mono">
              Admin Login Terminal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
