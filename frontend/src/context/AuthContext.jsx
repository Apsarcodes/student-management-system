import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend silently
          const res = await authService.getCurrentUser();
          if (res && res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password, rememberMe = false) => {
    const res = await authService.login({ usernameOrEmail, password, rememberMe });
    if (res.success && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { token: jwtToken, ...userInfo } = res.data;
      setToken(jwtToken);
      setUser(userInfo);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
    return null;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isFaculty = user?.role === 'STAFF' || user?.role === 'FACULTY';
  const isStaff = isFaculty;
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isStaff,
        isFaculty,
        isStudent,
        login,
        register,
        logout,
        updateCurrentUser,
        refreshUser,
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
