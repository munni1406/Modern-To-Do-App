import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Talk directly to the backend — bypasses CRA proxy to avoid 405 errors
const API = axios.create({ baseURL: 'http://localhost:5000' });

// const API = axios.create({ baseURL: 'http://localhost:3001' });


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed';
      if (error.response) {
        message = error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Is the backend running?';
      } else {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await API.post('/api/signup', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      let message = 'Signup failed';
      if (error.response) {
        message = error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Is the backend running?';
      } else {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
