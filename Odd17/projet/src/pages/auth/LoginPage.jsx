import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { forgotPasswordApi } from '../../api/authApi';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Globe, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const { login, getRoleDashboard, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // État de la modale "Mot de passe oublié"
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState(null);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/events', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Détection des alertes d'URL (ex: déconnexion forcée ou compte suspendu)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('suspended') === '1') {
      setErrorMessage('Votre compte est suspendu. Veuillez contacter l\'administrateur.');
    } else if (params.get('expired') === '1') {
      setInfoMessage('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      const destination = location.state?.from?.pathname || '/events';
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMessage('Accès refusé : ce compte est suspendu.');
      } else if (err.response?.status === 401) {
        setErrorMessage('Adresse e-mail ou mot de passe incorrect.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Impossible de contacter le serveur. Vérifiez que l\'API Laravel est lancée.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotSubmitting(true);
    setForgotFeedback(null);
    try {
      const res = await forgotPasswordApi(forgotEmail);
      setForgotFeedback({
        type: 'success',
        text: res.message || 'Lien de réinitialisation envoyé.',
      });
    } catch (err) {
      setForgotFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de l\'envoi.',
      });
    } finally {
      setForgotSubmitting(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-soft border border-slate-100 p-8 sm:p-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-800 to-secondary-500 mx-auto flex items-center justify-center text-white shadow-soft mb-4">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary-900 tracking-tight">
            Connexion à EventPartner
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            La plateforme collaborative qui connecte associations, entreprises et bénévoles
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Message d'information */}
        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-blue-700 text-sm animate-fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-semibold text-secondary-500 hover:text-secondary-700 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton Orange d'action principale */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-accent hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Redirection inscription */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-bold text-primary-800 hover:text-secondary-500 transition-colors">
            Créer un compte
          </Link>
        </div>
      </div>

      {/* Modal Mot de passe oublié */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setForgotFeedback(null);
        }}
        title="Réinitialiser votre mot de passe"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="text-xs text-slate-500">
            Saisissez l'adresse e-mail associée à votre compte EventPartner. Nous vous enverrons les instructions de récupération.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Votre adresse e-mail
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="votre.email@exemple.fr"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
            />
          </div>

          {forgotFeedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                forgotFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {forgotFeedback.text}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={forgotSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center gap-1.5"
            >
              {forgotSubmitting && <Spinner size="sm" color="white" />}
              Envoyer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
