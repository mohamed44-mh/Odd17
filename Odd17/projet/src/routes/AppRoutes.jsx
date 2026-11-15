import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages Publiques
import HomePage from '../pages/public/HomePage';
import EventsListPage from '../pages/public/EventsListPage';
import EventDetailPage from '../pages/public/EventDetailPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';

// Pages Authentification
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Gestion Événements (Protégée pour Association / Admin)
import EventFormPage from '../pages/events/EventFormPage';

// Dashboards par Rôle
import DashboardVolunteer from '../pages/dashboard/DashboardVolunteer';
import DashboardAssociation from '../pages/dashboard/DashboardAssociation';
import DashboardEnterprise from '../pages/dashboard/DashboardEnterprise';
import DashboardAdmin from '../pages/dashboard/DashboardAdmin';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Pages Publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<ProtectedRoute><EventsListPage /></ProtectedRoute>} />
      <Route path="/events/:idOrSlug" element={<EventDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* 2. Pages Authentification */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 3. Publication et Édition d'Événements */}
      <Route
        path="/events/create"
        element={
          <ProtectedRoute allowedRoles={['association', 'admin']}>
            <EventFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['association', 'admin']}>
            <EventFormPage />
          </ProtectedRoute>
        }
      />

      {/* 4. Dashboards par Rôle */}
      <Route
        path="/dashboard/volunteer"
        element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <DashboardVolunteer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/association"
        element={
          <ProtectedRoute allowedRoles={['association', 'admin']}>
            <DashboardAssociation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/enterprise"
        element={
          <ProtectedRoute allowedRoles={['enterprise', 'admin']}>
            <DashboardEnterprise />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
