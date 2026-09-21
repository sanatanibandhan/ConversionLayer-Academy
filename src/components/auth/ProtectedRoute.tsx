import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Admin Protected Route:
 * Strictly ensures the user is logged in AND their email belongs to AUTHORIZED_ADMIN_EMAILS.
 * If unauthorized or unauthenticated, redirects to /admin/login or home.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        id="auth-loading-screen"
        className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
        </div>
        <p className="text-sm font-mono text-slate-400">Verifying Administrator Security Credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Client Protected Route:
 * Ensures any authenticated client can access their client dashboard and project portals.
 * If unauthenticated, redirects to /login.
 */
export const ClientProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        id="client-auth-loading-screen"
        className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
        </div>
        <p className="text-sm font-mono text-slate-400">Verifying Client Authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

