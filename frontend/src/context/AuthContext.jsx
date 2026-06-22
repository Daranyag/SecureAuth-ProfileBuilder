import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/users/me');
        if (res.data.success) {
          const userData = res.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          if (userData.themeMode) {
            document.documentElement.setAttribute('data-theme', userData.themeMode);
            localStorage.setItem('theme', userData.themeMode);
          }
          if (userData.accentColor) {
            document.documentElement.setAttribute('data-color', userData.accentColor);
            localStorage.setItem('accentColor', userData.accentColor);
          }
        } else {
          // Cleared by interceptor or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    // Listen for global logout events (from axios interceptors)
    const handleGlobalLogout = () => {
      setUser(null);
      setError('Session expired or account blocked');
    };
    window.addEventListener('auth-logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  // Register User
  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        if (userData.themeMode) {
          document.documentElement.setAttribute('data-theme', userData.themeMode);
          localStorage.setItem('theme', userData.themeMode);
        }
        if (userData.accentColor) {
          document.documentElement.setAttribute('data-color', userData.accentColor);
          localStorage.setItem('accentColor', userData.accentColor);
        }

        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // Removed soft delete

  // Update Profile Data (name, email, profileImage, settings)
  const updateProfileState = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    if (updatedUser.themeMode) {
      document.documentElement.setAttribute('data-theme', updatedUser.themeMode);
      localStorage.setItem('theme', updatedUser.themeMode);
    }
    if (updatedUser.accentColor) {
      document.documentElement.setAttribute('data-color', updatedUser.accentColor);
      localStorage.setItem('accentColor', updatedUser.accentColor);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
