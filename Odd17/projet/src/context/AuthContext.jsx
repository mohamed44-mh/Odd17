import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';
import { loginApi, registerApi, logoutApi } from '../api/authApi.js';
import { DEFAULT_ACCOUNTS } from '../services/firestoreService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.email) {
        const emailLower = parsed.email.toLowerCase();
        // Vérification stricte par email uniquement pour les comptes de test officiels
        const found = (DEFAULT_ACCOUNTS || []).find(
          (a) => a.email.toLowerCase() === emailLower
        );
        if (found) {
          const merged = { ...found, ...parsed, id: parsed.id || found.id, uid: parsed.uid || found.uid };
          localStorage.setItem('user', JSON.stringify(merged));
          return merged;
        }
      }
      return parsed;
    } catch (_) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Calcule l'URL du dashboard selon le rôle de l'utilisateur
   */
  const getRoleDashboard = useCallback((userObj) => {
    if (!userObj) return '/';
    const role = (userObj.role || '').toLowerCase();
    const email = (userObj.email || '').toLowerCase();
    const name = (userObj.organization_name || userObj.name || '').toLowerCase();

    if (role === 'admin' || email.includes('admin') || name.includes('admin')) {
      return '/dashboard/admin';
    }
    if (
      role === 'association' ||
      email.includes('aljisr') ||
      name.includes('aljisr') ||
      name.includes('al jisr') ||
      name.includes('fondation') ||
      email.includes('fmv') ||
      email.includes('fmps') ||
      email.includes('enactus') ||
      email.includes('amee') ||
      email.includes('alamal') ||
      email.includes('foret')
    ) {
      return '/dashboard/association';
    }
    if (
      role === 'enterprise' ||
      email.includes('greentech') ||
      name.includes('greentech') ||
      email.includes('atlas') ||
      email.includes('sahara') ||
      email.includes('entrep')
    ) {
      return '/dashboard/enterprise';
    }
    return '/dashboard/volunteer';
  }, []);

  /**
   * Écoute en temps réel de l'état d'authentification Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userEmail = (firebaseUser.email || '').toLowerCase();
          const defaultInfo = (DEFAULT_ACCOUNTS || []).find((a) => a.email.toLowerCase() === userEmail);

          let userData = null;

          // 1. Priorité absolue aux comptes officiels (Association, Entreprise, Admin)
          if (defaultInfo) {
            userData = {
              ...defaultInfo,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
            };
          }

          // 2. Recherche dans Firestore si disponible
          if (!userData) {
            try {
              const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDocSnap.exists()) {
                userData = { id: firebaseUser.uid, ...userDocSnap.data() };
              }
            } catch (_) {}
          }

          // 3. Recherche dans les utilisateurs inscrits en local
          if (!userData) {
            try {
              const localUsers = JSON.parse(localStorage.getItem('ep_users_store') || '[]');
              const found = localUsers.find((u) => (u.email || '').toLowerCase() === userEmail);
              if (found) {
                userData = { ...found, id: firebaseUser.uid, uid: firebaseUser.uid };
              }
            } catch (_) {}
          }

          // 4. Utiliser les données du profil stocké localement si l'email correspond
          if (!userData) {
            try {
              const stored = JSON.parse(localStorage.getItem('user') || 'null');
              if (stored && (stored.email || '').toLowerCase() === userEmail) {
                userData = stored;
              }
            } catch (_) {}
          }

          // 5. Profil par défaut (Bénévole) pour nouvel utilisateur
          if (!userData) {
            const cleanName =
              firebaseUser.displayName ||
              userEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim() ||
              'Bénévole';

            userData = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
              email: firebaseUser.email,
              role: 'volunteer',
              organization_name: '',
              city: 'Casablanca',
              status: 'active',
            };
          }

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
