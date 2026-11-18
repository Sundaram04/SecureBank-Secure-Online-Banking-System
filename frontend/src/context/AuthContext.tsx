import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { fetchCsrfToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<{ mfaRequired: boolean; email?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of CSRF cookie and profile
    const init = async () => {
      await fetchCsrfToken();
      await refreshProfile();
    };
    init();
  }, []);

  const login = async (email: string, password: string, mfaCode?: string) => {
    await fetchCsrfToken();
    const res = await api.post('/auth/login', { email, password, mfaCode });
    if (res.data.success) {
      if (res.data.data.mfaRequired) {
        return { mfaRequired: true, email: res.data.data.email };
      }
      setUser(res.data.data.user);
      return { mfaRequired: false };
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const isAdmin = user ? user.roles?.includes('ROLE_ADMIN') : false;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
