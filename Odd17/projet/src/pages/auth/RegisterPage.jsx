import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { Eye, EyeOff, User, Mail, Phone, Lock, Building, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register, getRoleDashboard } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'volunteer', // 'volunteer' | 'association' | 'enterprise'
    organization_name: '',
    city: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      // Réinitialiser les champs spécifiques si on repasse à bénévole
      organization_name: selectedRole === 'volunteer' ? '' : prev.organization_name,
      city: selectedRole === 'volunteer' ? '' : prev.city,
    }));
  };

  // Validation côté client (React)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom complet est obligatoire.';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'adresse e-mail est obligatoire.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'adresse e-mail invalide.';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas.';
    }

    if (['association', 'enterprise'].includes(formData.role)) {
      if (!formData.organization_name.trim()) {
        newErrors.organization_name = 'Le nom de votre structure est requis.';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'La ville de rattachement est requise.';
      }
    }

    if (!formData.terms) {
      newErrors.terms = 'Vous devez accepter les conditions pour continuer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = await register(formData);
      setSuccessMessage('Compte créé avec succès ! Redirection vers votre espace...');
      setTimeout(() => {
        navigate(getRoleDashboard(user));
      }, 1500);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-soft border border-slate-100 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary-500 bg-secondary-50 px-3 py-1 rounded-full border border-secondary-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
            Rejoindre la communauté EventPartner
          </span>
          <h2 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            Créer un compte EventPartner
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Faites partie des acteurs du changement en connectant vos forces.
          </p>
        </div>

        {/* Message d'erreur général */}
        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du Rôle / Type de compte */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Type de compte <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  formData.role === 'volunteer'
                    ? 'border-secondary-500 bg-secondary-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-lg mb-1">🤝</div>
                <div className="text-sm font-bold text-primary-900">Bénévole</div>
                <div className="text-xs text-slate-500 mt-0.5">Participer aux actions</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('association')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  formData.role === 'association'
                    ? 'border-secondary-500 bg-secondary-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-lg mb-1">🏛️</div>
                <div className="text-sm font-bold text-primary-900">Association</div>
                <div className="text-xs text-slate-500 mt-0.5">Organiser & recruter</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('enterprise')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  formData.role === 'enterprise'
                    ? 'border-secondary-500 bg-secondary-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-lg mb-1">🏢</div>
                <div className="text-sm font-bold text-primary-900">Entreprise</div>
                <div className="text-xs text-slate-500 mt-0.5">Partenariats & RSE</div>
              </button>
            </div>
          </div>

          {/* Champs dynamiques pour Association & Entreprise */}
          {['association', 'enterprise'].includes(formData.role) && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
              <div className="text-xs font-bold text-primary-900 uppercase tracking-wide">
                Informations sur la structure ({formData.role === 'association' ? 'Association' : 'Entreprise'})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de l'organisation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      placeholder={formData.role === 'association' ? 'Ex: Association Al Karam' : 'Ex: Maroc Telecom'}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.organization_name ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-secondary-400`}
                    />
                  </div>
                  {errors.organization_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.organization_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Casablanca, Rabat, Marrakech"
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.city ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-secondary-400`}
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nom complet */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nom complet du contact <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Yassine El Amrani"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                  errors.name ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                } focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email et Téléphone en deux colonnes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@exemple.ma"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                    errors.email ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Téléphone (optionnel)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Mot de passe et confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8 caractères min."
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                    errors.password ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors`}
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
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirmation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirmer"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                    errors.password_confirmation ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex="-1"
                >
                  {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>
              )}
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-accent border-slate-300 rounded focus:ring-accent"
              />
              <span className="text-xs text-slate-600 leading-snug">
                J'accepte les conditions générales d'utilisation et m'engage à respecter les principes de collaboration et de solidarité d'EventPartner.
              </span>
            </label>
            {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
          </div>

          {/* Bouton de soumission Orange (Action principale) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-accent hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Création en cours...
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Footer redirection login */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-primary-800 hover:text-secondary-500 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
