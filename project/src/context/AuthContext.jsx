// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

/**
 * Custom hook to easily access the authentication context.
 * @returns {object} The authentication context value.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provides authentication state and functions to its children components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True on initial load
  const [error, setError] = useState(null);

  // This effect runs once on app startup to check for an existing session.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        // Only try to authenticate if a token exists in storage.
        if (token) {
          try {
            // **FIXED**: apiService.getCurrentUser() now returns the user object directly.
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // If fetching the user fails, the token might be expired. Try to refresh it.
            console.warn('Access token might be expired, attempting to refresh...');
            try {
              await apiService.refreshToken();
              // After a successful refresh, fetch the user data again.
              const currentUser = await apiService.getCurrentUser();
              setUser(currentUser);
            } catch (refreshError) {
              // If the refresh fails, the session is invalid. Clear storage and log out.
              console.error('Failed to refresh token:', refreshError);
              localStorage.clear();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        setError('Failed to initialize authentication');
      } finally {
        // Set loading to false after the initialization attempt is complete.
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // The empty dependency array ensures this runs only once.

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      // **FIXED**: apiService.login() now returns the unwrapped { user, accessToken, ... } object.
      const data = await apiService.login(credentials);
      setUser(data.user); // Set the user state directly from the response.
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.register(userData);
      // After registration, the user still needs to log in.
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch(error) {
      console.error("Logout API call failed, but clearing session anyway.", error);
    } finally {
      // Always clear the user state and error message on logout.
      setUser(null);
      setError(null);
    }
  };

  // The value provided to consuming components.
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    setError,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
