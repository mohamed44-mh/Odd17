import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, logoutApi, getUserApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(true); // État global pour éviter le flash de la page login
  const [error, setError] = useState(null);

  /**
   * Calcule l'URL du dashboard selon le rôle de l'utilisateur
   */
  const getRoleDashboard = useCallback((userObj) => {
    if (!userObj || !userObj.role) return '/';
    switch (userObj.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'association':
        return '/dashboard/association';
      case 'enterprise':
        return '/dashboard/enterprise';
      case 'volunteer':
      default:
        return '/dashboard/volunteer';
    }
  }, []);

  /**
   * Vérification de la session au démarrage
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await getUserApi();
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (err) {
        console.error('Session invalide ou expirée:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Connexion
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await loginApi(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la connexion.';
      setError(msg);
      throw err;
    }
  };

  /**
   * Inscription
   */
  const register = async (userData) => {
    setError(null);
    try {
      const data = await registerApi(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription.';
      setError(msg);
      throw err;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      if (token) {
        await logoutApi();
      }
    } catch (err) {
      console.warn('Erreur lors de la déconnexion sur le serveur:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    authLoading,
    error,
    login,
    register,
    logout,
    getRoleDashboard,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

export default AuthContext;
