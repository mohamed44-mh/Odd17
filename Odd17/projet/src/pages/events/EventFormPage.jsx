import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategories, getEvent, createEvent, updateEvent } from '../../api/eventApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import FullPageLoader from '../../components/common/FullPageLoader';
import {
  Calendar,
  MapPin,
  Image,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function EventFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    location: '',
    address: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_volunteers: 0,
    banner_image: '',
    needs: [],
  });

  // Charger les catégories et l'événement si mode édition
  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.categories || []);

        if (isEditMode) {
          const evtRes = await getEvent(id);
          const evt = evtRes.event;

          // Contrôle d'autorisation propriétaire ou admin
          if (evt.user_id !== user?.id && user?.role !== 'admin') {
            alert("Action non autorisée : vous n'êtes pas l'organisateur de cet événement.");
            navigate('/events', { replace: true });
            return;
          }

          // Formatage des dates pour datetime-local
          const toLocalIso = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          };

          setFormData({
            title: evt.title,
            category_id: evt.category_id || '',
            description: evt.description,
            location: evt.location,
            address: evt.address || '',
            start_date: toLocalIso(evt.start_date),
            end_date: toLocalIso(evt.end_date),
            registration_deadline: toLocalIso(evt.registration_deadline),
            max_volunteers: evt.max_volunteers || 0,
            banner_image: evt.banner_image || '',
            needs: evt.needs || [],
          });
        }
      } catch (err) {
        setGeneralError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditMode, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Gestion des besoins dynamiques (needs)
  const handleAddNeed = () => {
    setFormData((prev) => ({
      ...prev,
      needs: [
        ...prev.needs,
        {
          type: 'volunteer_skill',
          title: '',
          description: '',
          target_quantity: 1,
          unit: 'personnes',
        },
      ],
    }));
  };

  const handleRemoveNeed = (index) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.filter((_, i) => i !== index),
    }));
  };

  const handleNeedChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.needs];
      updated[index] = { ...updated[index], [field]: value };
      // Ajustement automatique de l'unité selon le type
      if (field === 'type') {
        if (value === 'financial') updated[index].unit = '€';
        else if (value === 'volunteer_skill') updated[index].unit = 'personnes';
        else if (value === 'material') updated[index].unit = 'unités';
      }
      return { ...prev, needs: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setValidationErrors({});
    setSubmitting(true);

    try {
      if (isEditMode) {
        await updateEvent(id, formData);
        navigate(`/events/${id}`);
      } else {
        const res = await createEvent(formData);
        navigate(`/events/${res.event.slug || res.event.id}`);
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'événement.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullPageLoader message="Chargement du formulaire..." />;
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Lien retour */}
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux événements</span>
          </Link>
        </div>

        {/* Carte formulaire */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full border border-secondary-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isEditMode ? 'Mise à jour' : 'Publier l\'événement'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-900 tracking-tight">
              {isEditMode ? 'Modifier l\'événement' : 'Publier un nouvel événement'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              Définissez les objectifs, le calendrier et les besoins précis de votre initiative.
            </p>
          </div>

          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre et Catégorie */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre de l'événement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Caravane éducative et formation au numérique solidaire"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 font-medium"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 font-medium"
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category_id && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.category_id[0]}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description détaillée & objectifs ODD <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Présentez la mission, le programme de la journée, les compétences attendues et l'impact recherché..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 leading-relaxed font-normal"
              />
              {validationErrors.description && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.description[0]}</p>
              )}
            </div>

            {/* Ville et Adresse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Casablanca, Rabat, Marrakech, Agadir..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse précise ou point de rendez-vous
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: Centre Culturel Sidi Moumen, Boulevard d'Anfa..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>
            </div>

            {/* Dates : Début, Fin, et Date limite d'inscription */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date & Heure de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date & Heure de fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date limite d'inscription (optionnel)
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>
            </div>

            {/* Nombre max de bénévoles & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bénévoles max (0 = illimité)
                </label>
                <input
                  type="number"
                  min="0"
                  name="max_volunteers"
                  value={formData.max_volunteers}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL de l'image de couverture
                </label>
                <input
                  type="url"
                  name="banner_image"
                  value={formData.banner_image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
              </div>
            </div>

            {/* Prévisualisation de l'image */}
            {formData.banner_image && (
              <div className="mt-2">
                <p className="text-[11px] font-bold text-slate-400 mb-1">Aperçu de la bannière :</p>
                <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={formData.banner_image}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Section Besoins ciblés (event_needs) uniquement en mode création */}
            {!isEditMode && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-primary-900">
                      Besoins de l'événement (Bénévolat, Matériel, Financement)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Permet aux entreprises et bénévoles de répondre précisément à vos attentes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNeed}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-secondary-600 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un besoin</span>
                  </button>
                </div>

                {formData.needs.length > 0 ? (
                  <div className="space-y-3">
                    {formData.needs.map((need, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center animate-fade-in"
                      >
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Type</label>
                          <select
                            value={need.type}
                            onChange={(e) => handleNeedChange(idx, 'type', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="volunteer_skill">Compétences / Bénévoles</option>
                            <option value="financial">Financement (MAD)</option>
                            <option value="material">Matériel / Prêt</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Intitulé</label>
                          <input
                            type="text"
                            required
                            value={need.title}
                            onChange={(e) => handleNeedChange(idx, 'title', e.target.value)}
                            placeholder="Ex: Tentes de terrain, 5 000 MAD"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Quantité cible</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={need.target_quantity}
                            onChange={(e) => handleNeedChange(idx, 'target_quantity', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Unité</label>
                          <input
                            type="text"
                            value={need.unit}
                            onChange={(e) => handleNeedChange(idx, 'unit', e.target.value)}
                            placeholder="ex: personnes, €"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveNeed(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Supprimer ce besoin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                    Aucun besoin spécifique ajouté pour le moment. Cliquez sur « Ajouter un besoin » pour en lister.
                  </p>
                )}
              </div>
            )}

            {/* Bouton de validation Orange */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Link
                to="/events"
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Spinner size="sm" color="white" />}
                <span>{isEditMode ? 'Enregistrer les modifications' : 'Publier mon événement'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
