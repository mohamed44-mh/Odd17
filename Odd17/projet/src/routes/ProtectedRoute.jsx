import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/common/FullPageLoader';

/**
 * Route protégée :
 * 1. Affiche l'écran de chargement plein écran tant que la session est en cours de vérification (anti-flash)
 * 2. Redirige vers /login si non connecté
 * 3. Vérifie les rôles autorisés si définis
 * 4. Bloque l'accès si le compte est suspendu
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, authLoading, getRoleDashboard } = useAuth();
  const location = useLocation();

  // Étape 1 : Pendant la vérification du token, afficher le loader anti-flash
  if (authLoading) {
    return <FullPageLoader message="Vérification de vos accès en cours..." />;
  }

  // Étape 2 : Utilisateur non connecté -> redirection vers la page de login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Étape 3 : Compte suspendu
  if (user.status === 'suspended') {
    return <Navigate to="/login?suspended=1" replace />;
  }

  // Étape 4 : Contrôle du rôle si restreint
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirection automatique vers son propre dashboard légitime
    const targetDashboard = getRoleDashboard(user);
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
}
