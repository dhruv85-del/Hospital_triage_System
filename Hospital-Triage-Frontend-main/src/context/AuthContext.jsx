import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../services/api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.getSession()
      .then((response) => {
        if (active) setUser(response.user || null);
      })
      .catch((error) => {
        console.error('Unable to restore authentication session:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      setUser(null);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    return authApi.logout()
      .finally(() => {
        setUser(null);
        setLoading(false);
      });
  };

  const value = {
    user,
    role: user?.role || 'GUEST',
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
