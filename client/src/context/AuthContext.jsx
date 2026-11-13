import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get('/auth/me');
        setUser(res.data);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    setUser(res.data);
    return res.data;
  };

  const sendOtp = async (email, name) => {
    const res = await API.post('/auth/send-otp', { email, name });
    return res.data;
  };

  const verifyOtpAndRegister = async (registrationDataWithOtp) => {
    const res = await API.post('/auth/verify-otp-and-register', registrationDataWithOtp);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
