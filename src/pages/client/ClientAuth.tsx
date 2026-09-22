import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Server,
  Zap
} from 'lucide-react';

export const ClientAuth: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/client/dashboard';

  // If already authenticated, redirect straight to client portal
  useEffect(() => {
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
          setErrorMessage('Password must be at least 6 characters for enterprise compliance.');
          setLoading(false);
          return;
        }
        const displayName = fullName.trim() 
          ? (companyName.trim() ? `${fullName.trim()} (${companyName.trim()})` : fullName.trim())
          : undefined;

        await register(email.trim(), password, displayName);
      } else {
        await login(email.trim(), password);
      }

      // Successful auth -> route directly to client dashboard
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Client Auth Exception:', err);
      const error = err as { code?: string; message?: string };

      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An enterprise account with this email already exists. Please log in.');
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid credentials. Please verify your email and password or register.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Security standard not met: Password must be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid business email address.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network timeout connecting to Firebase Auth. Please check connectivity.');
      } else {
        setErrorMessage(error.message || 'Authentication encountered an issue. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (clientEmail: string) => {
    setEmail(clientEmail);
    setPassword('client123456');
    setErrorMessage('');
  };

  return (
    <div
      id="client-auth-page"
      className="min-h-screen w-full flex bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white"
    >
      {/* ========================================================= */}
      {/* LEFT PANEL: AUTHENTICATION FORM (Glassmorphic Dark UI)    */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 z-10 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 relative">
        {/* Subtle background glow behind left panel */}
        <div 
          className="absolute top-12 left-12 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" 
          aria-hidden="true" 
        />

        {/* Top Header & Brand */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            id="client-auth-home-link"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 group-hover:text-indigo-300 transition-all shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight flex items-center gap-1.5">
                SyncOps <span className="text-indigo-400 font-mono text-sm">Studio</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Client Telemetry Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline text-slate-400">Status:</span>
            <span className="text-emerald-300 font-medium">Gateway Active</span>
          </div>
        </div>

        {/* Center Main Card Form */}
        <div className="max-w-md w-full mx-auto my-8 sm:my-10">
          <div
            id="client-auth-card"
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/60 relative overflow-hidden"
          >
            {/* Top Accent Gradient Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />

            {/* Mode Switcher Segmented Control */}
            <div 
              id="auth-mode-toggle"
              className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6"
            >
              <button
                type="button"
                id="tab-btn-login"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage('');
                }}
                className={`py-2.5 text-xs font-mono font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isRegisterMode
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="tab-btn-register"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMessage('');
                }}
                className={`py-2.5 text-xs font-mono font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isRegisterMode
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Form Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isRegisterMode ? 'Deploy Client Workspace' : 'Welcome to SyncOps Portal'}
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {isRegisterMode
                  ? 'Access real-time conversion monitoring, escrow milestone tracking, and container deliverables.'
                  : 'Sign in with your enterprise credentials to review server telemetry pipelines.'}
              </p>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div
                id="client-auth-error-banner"
                className="mb-5 p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-3 animate-fadeIn leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form id="client-auth-form" onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div>
                    <label 
                      htmlFor="client-fullname-input"
                      className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="client-fullname-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        required
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="client-company-input"
                      className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Company / Domain <span className="text-slate-500 lowercase font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Server className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="client-company-input"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Omnichannel (acme.com)"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label 
                  htmlFor="client-email-input"
                  className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="client-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@brand.com"
                    required
                    autoComplete="email"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="client-password-input"
                    className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  {!isRegisterMode && (
                    <span className="text-[11px] font-mono text-slate-500">
                      Standard Firebase Guard
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="client-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-client-auth-submit"
                disabled={loading}
                className="w-full min-h-[46px] mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-medium text-sm shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isRegisterMode ? 'Provisioning Workspace...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Private Portal' : 'Access Client Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fill for testing */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 text-center">
                Demo Quick-Fill Access
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  id="btn-quickfill-demo"
                  onClick={() => handleQuickFill('demo.client@syncops.io')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>demo.client@syncops.io</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & encryption badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono border-t border-slate-900 pt-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit Encrypted Client Session</span>
          </div>

          <Link
            to="/"
            className="hover:text-slate-300 transition-colors"
          >
            &larr; Back to SyncOps Public Agency
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: BRANDING SHOWCASE (Desktop only)             */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 overflow-hidden border-l border-slate-800/40">
        {/* Animated Cybernetic Telemetry Data Grid SVG */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
                <circle cx="0" cy="0" r="1.5" fill="rgba(129, 140, 248, 0.4)" />
              </pattern>
              <radialGradient id="portal-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.25)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <circle cx="65%" cy="40%" r="300" fill="url(#portal-gradient)" />
          </svg>
        </div>

        {/* Ambient Top Glow Orbs */}
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" 
          aria-hidden="true" 
        />
        <div 
          className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Top Ticker: Real-Time Telemetry Stats */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-mono text-indigo-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SIGNAL DEDUPLICATION: 100% RELIABILITY</span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            EMQ SLA: 8.5+ GUARANTEE
          </span>
        </div>

        {/* Central Branding Hub */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          {/* Glowing Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl shadow-indigo-500/30">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-white">
              <Cpu className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          {/* Core Trust Tagline */}
          <div className="space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono tracking-wider uppercase">
              Enterprise Telemetry Infrastructure
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Bypass Ad Blockers &amp; Safari ITP With Zero Signal Degradation.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              SyncOps Studio engineers hardened Server-Side GTM, Meta CAPI pipelines, and first-party ID graphs that safeguard revenue attribution across millions in monthly ad spend.
            </p>
          </div>

          {/* Three Key Value Pillars */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  365-Day First-Party Cookie Longevity
                </span>
                <span className="text-[11px] text-slate-400 leading-normal">
                  Custom subdomain CNAME routing restores browser memory destroyed by 7-day Apple WebKit limits.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Escrow-Backed Turnaround &amp; Milestones
                </span>
                <span className="text-[11px] text-slate-400 leading-normal">
                  Funds remain protected in verified escrow until your lead architect verifies container health.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Turnkey Handover &amp; Video Walkthroughs
                </span>
                <span className="text-[11px] text-slate-400 leading-normal">
                  Direct container JSON exports, staging tests, and custom Loom video documentation for your team.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Testimonial Card */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                AN
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-200 font-medium line-clamp-1">
                &ldquo;Zero double-counting on Black Friday and our EMQ score surged to 9.8/10.&rdquo;
              </p>
              <span className="text-[10px] font-mono text-slate-400">
                Aura Nutrition (Omnichannel CPG) • Verified Client
              </span>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/80 shrink-0">
            ★ 5.0 SLA
          </span>
        </div>
      </div>
    </div>
  );
};
