import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const AUTHORIZED_ADMIN_EMAIL = 'iadeshchandra@gmail.com';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase Auth State check:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
        <p className="text-sm font-mono text-slate-400">Verifying Security Credentials...</p>
      </div>
    );
  }

  // Strict route guard: user must be logged in AND email must strictly equal iadeshchandra@gmail.com.
  // If unauthorized, redirect to home ('/') to hide existence of admin portal.
  if (!user || user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
