import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Auth verification failed:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: userToken, ...userData } = res.data;
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    const { token: userToken, ...userDataObj } = res.data;
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userDataObj);
    return userDataObj;
  };

  const sendOtp = async (email, name) => {
    const res = await API.post('/auth/send-otp', { email, name });
    return res.data;
  };

  const verifyOtpAndRegister = async (registrationDataWithOtp) => {
    const res = await API.post('/auth/verify-otp-and-register', registrationDataWithOtp);
    const { token: userToken, ...userData } = res.data;
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtpAndRegister,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
