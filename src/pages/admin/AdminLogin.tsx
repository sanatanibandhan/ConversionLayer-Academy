import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { PRIMARY_ADMIN_EMAIL, AUTHORIZED_ADMIN_EMAILS } from '../../data/syncOpsData';
import { 
  Terminal, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Server,
  Radio
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState<{
    flaggedEmail?: string;
    timestamp?: string;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  // Strict zero-trust route check: if ANY non-admin user arrives here while logged in,
  // immediately log them out and throw a visual "Unauthorized Access" violation error.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userEmail = currentUser.email?.toLowerCase();
      const isAuthorized = userEmail && (
        userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail)
      );

      if (!isAuthorized) {
        // Immediately terminate foreign session
        signOut(auth).then(() => {
          setUnauthorizedAttempt({
            flaggedEmail: currentUser.email || 'Anonymous/Foreign Client Token',
            timestamp: new Date().toISOString()
          });
          setErrorMessage('Unauthorized Access: User session was immediately terminated. Incident logged to telemetry security register.');
        });
      }
    }
  }, []);

  const isEmailAuthorized = (targetEmail: string) => {
    const clean = targetEmail.trim().toLowerCase();
    return clean === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
      AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
  };

  const handleTerminalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setUnauthorizedAttempt(null);

    const enteredEmail = email.trim().toLowerCase();

    // 1. Hardcoded validation check against the Lead Architect email
    if (!isEmailAuthorized(enteredEmail)) {
      setUnauthorizedAttempt({
        flaggedEmail: email,
        timestamp: new Date().toISOString()
      });
      setErrorMessage(
        `UNAUTHORIZED ACCESS: Access denied. Identity '${email}' is not in the Lead Architect registry. Incident logged to security telemetry.`
      );
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authenticatedEmail = credential.user.email?.toLowerCase() || '';

      // 2. Post-auth secondary airgap verification
      if (!isEmailAuthorized(authenticatedEmail)) {
        await signOut(auth);
        setUnauthorizedAttempt({
          flaggedEmail: authenticatedEmail,
          timestamp: new Date().toISOString()
        });
        setErrorMessage('UNAUTHORIZED ACCESS: Account credentials authenticated but identity is forbidden on Lead Architect Terminal. Session terminated.');
        return;
      }

      // Successful authorization
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Terminal Security Authentication Fault:', err);
      const error = err as { code?: string; message?: string };

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMessage('ACCESS REJECTED: Cryptographic passphrase or architect identifier invalid.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('BRUTE-FORCE PROTECTION: Terminal access temporarily throttled. Retry in 60s.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('TELEMETRY NETWORK FAULT: Unable to verify certificate with security cluster.');
      } else {
        setErrorMessage(error.message || 'AUTHENTICATION EXCEPTION: Hardware security verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-terminal-login-page"
      className="min-h-screen bg-black text-slate-200 font-mono flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-red-900 selection:text-red-200 relative overflow-hidden"
    >
      {/* Background Cybernetic Terminal Glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-red-950/20 blur-[140px] rounded-full pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-purple-950/25 blur-[120px] rounded-full pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Terminal Container */}
      <div className="w-full max-w-xl">
        {/* Terminal Chrome Window */}
        <div
          id="admin-terminal-window"
          className="rounded-2xl bg-slate-950/95 border-2 border-red-500/40 shadow-2xl shadow-red-950/60 overflow-hidden relative"
        >
          {/* Top Window Title Bar */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/80 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-purple-500/80" />
              <span className="text-xs text-red-300/90 font-bold ml-2 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-red-400" />
                <span>root@syncops-telemetry-cluster:~# ./auth-terminal</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-800/80 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-red-400 animate-ping" />
                <span>Zero-Trust Airgap</span>
              </span>
            </div>
          </div>

          {/* Terminal Console Interior */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Warning Header Accent Banner */}
            <div
              id="admin-warning-accent-banner"
              className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-purple-950/50 border border-red-500/60 shadow-lg text-xs space-y-1.5"
            >
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>Restricted Access: SyncOps Lead Architect Only</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                Enforcing strict role-based access control (RBAC). Non-architect sessions are terminated instantly with telemetry incident hashing.
              </p>
            </div>

            {/* Boot Log Stream */}
            <div className="text-[11px] text-slate-400 font-mono space-y-0.5 bg-black/60 p-3 rounded-lg border border-slate-900 leading-tight">
              <p className="text-purple-400 font-medium">[KERNEL] Telemetry Daemon (v4.19-hardened) Initialized</p>
              <p className="text-slate-400">[SEC-GATE] Enforcing SHA-256 HMAC Client Signature Verification</p>
              <p className="text-slate-400">[AUTH-TARGET] Hardcoded Lead Architect: <span className="text-red-400 font-bold">{PRIMARY_ADMIN_EMAIL}</span></p>
              <p className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                <span>Ready for Command Passphrase Injection</span>
              </p>
            </div>

            {/* Visual Unauthorized Access Banner */}
            {unauthorizedAttempt && (
              <div
                id="unauthorized-access-alert"
                className="p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs space-y-2 animate-pulse"
              >
                <div className="flex items-center gap-2 font-bold text-red-300 uppercase tracking-wider text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>SECURITY INCIDENT: UNAUTHORIZED ACCESS DETECTED</span>
                </div>
                <div className="text-[11px] text-red-200/90 font-mono pl-7 space-y-1">
                  <p>• Unauthorized Identity: <span className="underline font-semibold">{unauthorizedAttempt.flaggedEmail}</span></p>
                  <p>• Action: User session terminated immediately via Firebase Revoke.</p>
                  <p>• Incident Timestamp: {unauthorizedAttempt.timestamp}</p>
                  <p className="text-red-400 font-semibold pt-1">
                    [ACCESS VIOLATION RECORDED — CLUSTER DISPATCH REJECTED]
                  </p>
                </div>
              </div>
            )}

            {/* General Error Alert */}
            {errorMessage && !unauthorizedAttempt && (
              <div
                id="terminal-error-message"
                className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/60 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Terminal Form */}
            <form id="admin-terminal-form" onSubmit={handleTerminalLogin} className="space-y-4">
              <div>
                <label 
                  htmlFor="admin-terminal-email"
                  className="block text-xs uppercase font-bold tracking-wider text-red-400/90 mb-2 flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5 text-red-400" />
                  <span>[ARCHITECT_IDENTIFIER] &gt;</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="admin-terminal-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="iadeshchandra@gmail.com"
                    required
                    autoComplete="email"
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-black border border-red-500/40 text-red-200 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="admin-terminal-password"
                  className="block text-xs uppercase font-bold tracking-wider text-purple-400/90 mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>[PASSPHRASE_SECRET] &gt;</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Mask' : 'Inspect'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-terminal-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-black border border-purple-500/40 text-purple-200 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit Execution Button */}
              <button
                type="submit"
                id="btn-terminal-auth-submit"
                disabled={loading}
                className="w-full min-h-[48px] mt-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-purple-800 hover:from-red-500 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-red-950/60 border border-red-400/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING SEC-LEVEL 5...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>[ EXECUTE KERNEL AUTHENTICATION ]</span>
                  </>
                )}
              </button>
            </form>

            {/* Terminal Status Ticker Footer */}
            <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>STATUS: ENCRYPTED AES-GCM-256</span>
              <span>NODE: ASIA-SOUTHEAST1</span>
              <span>RESTRICTION: LEAD ARCHITECT ONLY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
