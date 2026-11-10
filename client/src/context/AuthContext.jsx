import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [card, setCard] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campuspass_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('campuspass_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setStudent(res.data.data.student);
            setCard(res.data.data.card);
          }
        } catch (error) {
          console.warn('[Auth] Stored session invalid or expired:', error.message);
          localStorage.removeItem('campuspass_token');
          localStorage.removeItem('campuspass_user');
          setToken(null);
          setUser(null);
          setStudent(null);
          setCard(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser, student: receivedStudent, card: receivedCard } = res.data.data;
        
        localStorage.setItem('campuspass_token', receivedToken);
        localStorage.setItem('campuspass_user', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        setStudent(receivedStudent);
        setCard(receivedCard);
        
        return { success: true, user: receivedUser };
      }
    } catch (error) {
      const message = error.response?.data?.message || (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Check that the API and database are running, then try again.'
        : error.request
          ? 'Cannot reach the API. Start the project with `npm run dev` from the project folder, then try again.'
          : error.message || 'Sign in failed. Please try again.');
      return { success: false, error: message };
    }
  };

  // Registration handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser, student: receivedStudent, card: receivedCard } = res.data.data;
        
        localStorage.setItem('campuspass_token', receivedToken);
        localStorage.setItem('campuspass_user', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        setStudent(receivedStudent);
        setCard(receivedCard);
        
        return { success: true, user: receivedUser };
      }
    } catch (error) {
      const message = error.response?.data?.message || (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Check that the API and database are running, then try again.'
        : error.request
          ? 'Cannot reach the API. Start the project with `npm run dev` from the project folder, then try again.'
          : error.message || 'Registration failed. Please try again.');
      return { success: false, error: message };
    }
  };

  // Admin Registration handler
  const registerAdmin = async (formData) => {
    try {
      const res = await api.post('/auth/register-admin', formData);
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        
        localStorage.setItem('campuspass_token', receivedToken);
        localStorage.setItem('campuspass_user', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        setStudent(null);
        setCard(null);
        
        return { success: true, user: receivedUser };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED'
          ? 'Request timed out while connecting to database. Please try again.'
          : error.message || 'Admin registration failed. Please verify server and database connectivity.');
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('campuspass_token');
    localStorage.removeItem('campuspass_user');
    setToken(null);
    setUser(null);
    setStudent(null);
    setCard(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        card,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        registerAdmin,
        logout,
        setStudent,
        setCard,
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

