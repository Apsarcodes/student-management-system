import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

const getStoredAuth = () => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const localUser = localStorage.getItem('user');
  const sessionUser = sessionStorage.getItem('user');

  return {
    token: localToken || sessionToken,
    user: localUser || sessionUser,
  };
};

const persistAuth = (jwtToken, userData, rememberMe = true) => {
  if (rememberMe) {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return;
  }

  sessionStorage.setItem('token', jwtToken);
  sessionStorage.setItem('user', JSON.stringify(userData));
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const persistUserOnly = (updatedUser) => {
  if (localStorage.getItem('token')) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return;
  }

  if (sessionStorage.getItem('token')) {
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    return;
  }

  localStorage.setItem('user', JSON.stringify(updatedUser));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredAuth().token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { token: storedToken, user: storedUser } = getStoredAuth();

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } catch (error) {
          clearStoredAuth();
        }
      }

      try {
        const res = await authService.getCurrentUser();
        if (res && res.success && res.data) {
          setUser(res.data);
          setToken(storedToken);
          persistUserOnly(res.data);
          return;
        }

        throw new Error('Session invalid');
      } catch (err) {
        console.warn('Session verification failed:', err);
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password, rememberMe = false) => {
    const res = await authService.login({ usernameOrEmail, password, rememberMe });
    if (res.success && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      persistAuth(jwtToken, userData, rememberMe);
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
      persistAuth(jwtToken, userInfo, true);
      return userInfo;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      clearStoredAuth();
      setUser(null);
      setToken(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    persistUserOnly(updatedUser);
  };

  const refreshUser = async () => {
    const { token: storedToken } = getStoredAuth();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return null;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        persistUserOnly(res.data);
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
