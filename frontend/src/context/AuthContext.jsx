import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// This is a standalone AuthContext you can add to your project
// when you're ready to integrate authentication

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setCurrentUser(res.data);
        } catch (error) {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    setCurrentUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // Register function
  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    setCurrentUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 