import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Globe, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, getRoleDashboard } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleNavItem = () => {
    if (!user) return null;
    const role = (user.role || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const name = (user.organization_name || user.name || '').toLowerCase();

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
      return { name: 'Mes Demandes & Événements', path: '/dashboard/association' };
    }
    if (
      role === 'enterprise' ||
      email.includes('greentech') ||
      name.includes('greentech') ||
      email.includes('atlas') ||
      email.includes('sahara') ||
      email.includes('entrep')
    ) {
      return { name: 'Mes Partenariats', path: '/dashboard/enterprise' };
    }
    if (role === 'admin' || email.includes('admin') || name.includes('admin')) {
      return { name: 'Administration', path: '/dashboard/admin' };
    }
    return { name: 'Mes Candidatures', path: '/dashboard/volunteer' };
  };

  const roleItem = getRoleNavItem();
  const navLinks = isAuthenticated
    ? [
        { name: 'Événements', path: '/events' },
        ...(roleItem ? [roleItem] : []),
      ]
    : [
        { name: 'Accueil', path: '/' },
        { name: 'À propos', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ];

  const getRoleBadge = (userObj) => {
    const role = (userObj?.role || '').toLowerCase();
    const email = (userObj?.email || '').toLowerCase();
    const name = (userObj?.organization_name || userObj?.name || '').toLowerCase();

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
      return <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Association</span>;
    }
    if (
      role === 'enterprise' ||
      email.includes('greentech') ||
      name.includes('greentech') ||
      email.includes('atlas') ||
      email.includes('sahara') ||
      email.includes('entrep')
    ) {
      return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Entreprise</span>;
    }
    if (role === 'admin' || email.includes('admin') || name.includes('admin')) {
      return <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Admin</span>;
    }
    return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Bénévole</span>;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/events" : "/"} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-800 to-secondary-500 flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-primary-900 leading-none">
              Event<span className="text-secondary-500">Partner</span>
            </span>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
              Partenariats & Impact
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors py-1 border-b-2 ${isActive(link.path)
                ? 'text-primary-800 border-accent font-bold'
                : 'border-transparent hover:text-primary-800'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Link
                to={getRoleDashboard(user)}
                className="flex items-center space-x-2 text-sm font-semibold text-primary-900 bg-secondary-50 hover:bg-secondary-100 px-3.5 py-2 rounded-xl transition-colors border border-secondary-200"
              >
                <LayoutDashboard className="w-4 h-4 text-secondary-500" />
                <span className="max-w-[150px] truncate">{user.organization_name || user.name}</span>
                {getRoleBadge(user)}
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-primary-900 hover:text-primary-700 px-4 py-2 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold text-white bg-accent hover:bg-accent-hover px-4 py-2 rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Rejoindre
              </Link>
            </div>
          )}
        </div>

        {/* Bouton Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-primary-900 rounded-lg hover:bg-slate-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${isActive(link.path)
                  ? 'bg-primary-50 text-primary-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  to={getRoleDashboard(user)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-50 text-primary-900 text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-secondary-500" />
                    {user.organization_name || user.name}
                  </span>
                  {getRoleBadge(user)}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-xl font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-primary-900 bg-slate-100 rounded-xl"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-bold text-white bg-accent rounded-xl"
                >
                  Rejoindre
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
