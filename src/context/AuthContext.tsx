import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AUTHORIZED_ADMIN_EMAILS } from '../data/syncOpsData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        console.warn('Firebase Auth State listener notice:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    user?.email && 
    AUTHORIZED_ADMIN_EMAILS.some(
      (adminEmail) => adminEmail.toLowerCase() === user.email?.toLowerCase()
    )
  );

  const login = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && credential.user) {
      try {
        await updateProfile(credential.user, { displayName });
      } catch (err) {
        console.warn('Profile update notice:', err);
      }
    }
    return credential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
