import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from localStorage
    const savedUser = localStorage.getItem('certichain_user');
    const savedToken = localStorage.getItem('certichain_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const data = response.data;
    localStorage.setItem('certichain_token', data.token);
    localStorage.setItem('certichain_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (formData) => {
    const response = await authAPI.signup(formData);
    const data = response.data;
    localStorage.setItem('certichain_token', data.token);
    localStorage.setItem('certichain_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('certichain_token');
    localStorage.removeItem('certichain_user');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isInstitutionAdmin = user?.role === 'INSTITUTION_ADMIN';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout,
      isAuthenticated, isSuperAdmin, isInstitutionAdmin, isStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
