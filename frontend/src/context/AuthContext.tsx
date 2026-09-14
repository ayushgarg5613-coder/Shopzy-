import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  login: (identifier: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const switchRole = async (targetRole: UserRole) => {
    try {
      setLoading(true);
      const res = await api.switchDemoUser(targetRole);
      if (res.success && res.user) {
        setAuthToken(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, role?: UserRole): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.login(identifier, role);
      if (res.success && res.user) {
        setAuthToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        loading,
        switchRole,
        login,
        logout,
      }}
    >
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
