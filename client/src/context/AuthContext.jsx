import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user from localStorage on mount
    const storedUser = localStorage.getItem('taxUserInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
        localStorage.removeItem('taxUserInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('taxUserInfo', JSON.stringify(userData));
  };

  const socialLogin = (platform) => {
    const mockUser = {
      name: `${platform} Guest`,
      email: `guest@${platform.toLowerCase()}.com`,
      token: 'mock-token-' + Date.now(),
      isSocial: true,
      platform
    };
    login(mockUser);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taxUserInfo');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
