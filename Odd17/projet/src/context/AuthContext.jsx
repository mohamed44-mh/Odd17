import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { loginApi, registerApi, logoutApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(true);
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
   * Écoute en temps réel de l'état d'authentification Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDocSnap.exists()
            ? { id: firebaseUser.uid, ...userDocSnap.data() }
            : {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email,
                email: firebaseUser.email,
                role: 'volunteer',
              };
          const t = await firebaseUser.getIdToken();
          setUser(userData);
          setToken(t);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', t);
        } catch (err) {
          console.warn('Session refresh error:', err);
        }
      } else {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (!storedUser || !storedToken) {
          setUser(null);
          setToken(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
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
      const msg = err.response?.data?.message || err.message || 'Erreur lors de la connexion.';
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
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'inscription.";
      setError(msg);
      throw err;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Erreur lors de la déconnexion Firebase:', err);
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
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

export default AuthContext;
