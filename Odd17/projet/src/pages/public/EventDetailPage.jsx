import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent, participateInEvent, proposePartnership, deleteEvent, updateParticipationStatus, updatePartnershipStatus } from '../../api/eventApi';
import { useAuth } from '../../context/AuthContext';
import FullPageLoader from '../../components/common/FullPageLoader';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  MapPin,
  Users,
  Building,
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Euro,
  Package,
  Award,
  Edit3,
  Trash2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  CalendarClock,
  Star,
  GraduationCap,
} from 'lucide-react';

export default function EventDetailPage() {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [userParticipation, setUserParticipation] = useState(null);
  const [userPartnership, setUserPartnership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modale Participation Bénévole
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteerMotivation, setVolunteerMotivation] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState(user?.phone || '');
  const [volunteerSubmitting, setVolunteerSubmitting] = useState(false);
  const [volunteerFeedback, setVolunteerFeedback] = useState(null);

  useEffect(() => {
    if (user?.phone) {
      setVolunteerPhone(user.phone);
    }
  }, [user]);

  // Modale Partenariat Entreprise
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerData, setPartnerData] = useState({
    event_need_id: '',
    type: 'financial',
    proposed_value: '',
    description: '',
  });
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerFeedback, setPartnerFeedback] = useState(null);

  // Modale Confirmation Suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // État de gestion des candidatures par l'organisateur
  const [actionFeedback, setActionFeedback] = useState(null);
  const [updatingReqId, setUpdatingReqId] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEvent(idOrSlug);
        setEvent(res.event);
        setUserParticipation(res.user_participation);
        setUserPartnership(res.user_partnership);
      } catch (err) {
        setError('Impossible de trouver cet événement ou erreur de chargement.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [idOrSlug]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Soumission Candidature Bénévole
  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerSubmitting(true);
    setVolunteerFeedback(null);
    try {
      const candidatePhone = volunteerPhone || user?.phone || '';
      const res = await participateInEvent(event.id, {
        motivation: volunteerMotivation || "Je suis disponible et motivé pour participer.",
        phone: candidatePhone,
        name: user?.name,
        email: user?.email,
        city: user?.city,
        bio: user?.bio,
        skills: user?.skills,
        availability: user?.availability,
        experience_level: user?.experience_level,
      });
      setUserParticipation(res.participation);
      setVolunteerFeedback({
        type: 'success',
        text: res.message || 'Candidature enregistrée avec succès !',
      });
      const refreshed = await getEvent(idOrSlug);
      setEvent(refreshed.event);
      setTimeout(() => {
        setIsVolunteerModalOpen(false);
      }, 1500);
    } catch (err) {
      setVolunteerFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de l\'envoi de la candidature.',
      });
    } finally {
      setVolunteerSubmitting(false);
    }
  };

  // Actions de l'Organisateur pour valider/refuser les demandes de cet événement
  const handleUpdateParticipation = async (participationId, status) => {
    try {
      setUpdatingReqId(participationId);
      await updateParticipationStatus(participationId, status);
      const res = await getEvent(idOrSlug);
      setEvent(res.event);
      setActionFeedback({
        type: 'success',
        text: `Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !`,
      });
    } catch (err) {
      setActionFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la mise à jour de la candidature.',
      });
    } finally {
      setUpdatingReqId(null);
    }
  };

  const handleUpdatePartnership = async (partnershipId, status) => {
    try {
      setUpdatingReqId(partnershipId);
      await updatePartnershipStatus(partnershipId, status);
      const res = await getEvent(idOrSlug);
      setEvent(res.event);
      setActionFeedback({
        type: 'success',
        text: `Partenariat ${status === 'accepted' ? 'accepté' : 'refusé'} avec succès !`,
      });
    } catch (err) {
      setActionFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la mise à jour du partenariat.',
      });
    } finally {
      setUpdatingReqId(null);
    }
  };

  // Soumission Offre Partenaire Entreprise
  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    setPartnerSubmitting(true);
    setPartnerFeedback(null);
    try {
      const res = await proposePartnership(event.id, {
        event_need_id: partnerData.event_need_id || null,
        type: partnerData.type,
        proposed_value: partnerData.proposed_value ? parseFloat(partnerData.proposed_value) : null,
        description: partnerData.description,
      });
      setUserPartnership(res.partnership);
      setPartnerFeedback({
        type: 'success',
        text: res.message || 'Offre de partenariat transmise avec succès !',
      });
      setTimeout(() => {
        setIsPartnerModalOpen(false);
      }, 1500);
    } catch (err) {
      setPartnerFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la soumission du partenariat.',
      });
    } finally {
      setPartnerSubmitting(false);
    }
  };

  // Suppression de l'événement
  const handleDeleteEvent = async () => {
    setDeleteSubmitting(true);
    try {
      await deleteEvent(event.id || event.slug);
      navigate('/dashboard/association', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return <FullPageLoader message="Chargement des détails de l'événement..." />;
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary-900 mb-2">Événement introuvable</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin = isAuthenticated && (
    user?.role === 'admin' ||
    (user?.id && String(event.user_id) === String(user.id)) ||
    (user?.uid && String(event.user_id) === String(user.uid)) ||
    (user?.email && event.user_email && user.email.toLowerCase() === event.user_email.toLowerCase()) ||
    (user?.organization_name && event.organization_name && user.organization_name.toLowerCase().trim() === event.organization_name.toLowerCase().trim()) ||
    (user?.email && event.user_id && user.email.toLowerCase().includes(String(event.user_id).replace('user_', '')))
  );

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tous les événements</span>
          </Link>

          {/* Outils Édition / Suppression pour l'Organisateur ou Admin */}
          {isOwnerOrAdmin && (
            <div className="flex items-center gap-2">
              <Link
                to={`/events/${event.slug || event.id}/edit`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-secondary-500" />
                <span>Modifier</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Hero Card de l'événement */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
          {/* Grande bannière */}
          <div className="relative h-72 sm:h-96 w-full bg-slate-200">
            <img
              src={event.banner_image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-900/30 to-transparent" />

            {/* Badges superposés */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              {event.category && (
                <span className="bg-primary-900/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                  {event.category.name}
                </span>
              )}
              <span className="bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Partenariat Certifié
              </span>
            </div>

            {/* Titre & Ville dans la bannière */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-300 mb-2">
                <MapPin className="w-4 h-4 text-secondary-400" />
                <span>{event.location}</span>
                {event.address && <span>• {event.address}</span>}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Barre d'informations rapides & Call to action */}
          <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-600">
              <div>
                <div className="font-bold text-slate-400 uppercase tracking-wide text-[10px] mb-1">
                  Date de début
                </div>
                <div className="font-semibold text-primary-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-400 uppercase tracking-wide text-[10px] mb-1">
                  Bénévoles mobilisés
                </div>
                <div className="font-semibold text-primary-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>
                    {event.accepted_participations_count || 0} / {event.max_volunteers || 'Illimité'}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-400 uppercase tracking-wide text-[10px] mb-1">
                  Partenaires RSE
                </div>
                <div className="font-semibold text-primary-900 flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-secondary-500" />
                  <span>{event.accepted_partnerships_count || 0} partenaire(s)</span>
                </div>
              </div>
            </div>

            {/* Zone d'action (Boutons Participer / Soutenir / Gestion) */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {isOwnerOrAdmin ? (
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to={`/events/${event.slug || event.id}/edit`}
                    className="inline-flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-soft transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Modifier l'événement</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                  <Link
                    to="/dashboard/association"
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition-all"
                  >
                    <Users className="w-4 h-4 text-secondary-500" />
                    <span>Gérer les candidatures ({event.accepted_participations_count || 0})</span>
                  </Link>
                </div>
              ) : !isAuthenticated ? (
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-soft transition-all"
                >
                  Se connecter pour participer ou soutenir
                </Link>
              ) : (
                <>
                  {/* Action Bénévole */}
                  {user?.role === 'volunteer' && (
                    <>
                      {userParticipation ? (
                        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>
                            Candidature {userParticipation.status === 'accepted' ? 'Validée' : 'en Attente'}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsVolunteerModalOpen(true)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          <span>🤝 Participer comme bénévole</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Action Entreprise */}
                  {user?.role === 'enterprise' && (
                    <>
                      {userPartnership ? (
                        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                          <Handshake className="w-4 h-4 text-blue-600" />
                          <span>
                            Partenariat proposé ({userPartnership.status === 'accepted' ? 'Validé' : 'en Attente'})
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsPartnerModalOpen(true)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          <span>🏢 Proposer un partenariat RSE</span>
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Grille Contenu : Description & Besoins */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Colonne Gauche : Description détaillée & Participants */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-primary-900 mb-4 pb-2 border-b border-slate-100">
                  À propos de cet événement
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                  {event.description}
                </div>
              </div>

              {/* Partenaires Entreprises confirmés */}
              <div>
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-secondary-500" />
                  <span>Partenaires engagés ({event.accepted_partnerships?.length || 0})</span>
                </h3>
                {event.accepted_partnerships && event.accepted_partnerships.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.accepted_partnerships.map((partner) => (
                      <div
                        key={partner.id}
                        className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 flex items-start gap-3"
                      >
                        <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-primary-900">
                            {partner.user?.organization_name || partner.enterprise_name || partner.user?.name || 'Entreprise Partenaire'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Soutien : <span className="font-semibold text-blue-700">
                              {partner.type === 'financial' ? 'Mécénat & Soutien Matériel' : (partner.type === 'material' ? 'Don en Nature & Matériel' : (partner.type === 'skills' ? 'Mécénat de Compétences' : 'Partenariat RSE Solidaire'))}
                            </span>
                            {partner.description && ` — ${partner.description}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun partenaire entreprise encore confirmé.</p>
                )}
              </div>
            </div>

            {/* Colonne Droite : Besoins ciblés (event_needs) & Organisateur */}
            <div className="space-y-6">
              {/* Carte Organisateur */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-3">
                  Organisé par
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-800 text-white font-bold flex items-center justify-center text-lg">
                    {event.user?.organization_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-900 text-sm">
                      {event.user?.organization_name || event.user?.name}
                    </h4>
                    <span className="text-xs text-slate-500">Contact : {event.user?.name}</span>
                  </div>
                </div>
                {event.user?.phone && (
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-700">Tél :</strong> {event.user.phone}
                  </div>
                )}
              </div>

              {/* Besoins identifiés */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-primary-900">
                    Besoins de l'événement
                  </h3>
                  <span className="text-xs text-secondary-600 font-bold">
                    {event.needs?.length || 0} identifié(s)
                  </span>
                </div>

                {event.needs && event.needs.length > 0 ? (
                  <div className="space-y-3">
                    {event.needs.map((need) => {
                      const percent = need.target_quantity > 0
                        ? Math.min(100, Math.round((need.current_quantity / need.target_quantity) * 100))
                        : 0;
                      return (
                        <div key={need.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between font-bold text-primary-900 mb-1">
                            <span>{need.title}</span>
                            <span className="text-secondary-600">
                              {need.current_quantity} / {need.target_quantity} {need.unit}
                            </span>
                          </div>
                          {need.description && (
                            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                              {need.description}
                            </p>
                          )}
                          {/* Barre de progression */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-accent h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun besoin spécifique renseigné.</p>
                )}
              </div>
            </div>
          </div>

          {/* Panneau de gestion des candidatures réservé au créateur de l'événement ou admin */}
          {isAuthenticated && user && (
            event.user_id === user.id ||
            event.user_id === user.uid ||
            user.role === 'admin' ||
            (event.user?.email && user.email && event.user.email.toLowerCase() === user.email.toLowerCase()) ||
            (user.organization_name && event.organization_name && user.organization_name.toLowerCase() === event.organization_name.toLowerCase()) ||
            (user.role === 'association' && (user.email || '').toLowerCase().includes((event.user_id || '').replace('user_', '')))
          ) && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-white/10 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Panneau de Contrôle Organisateur</span>
                    </div>
                    <h3 className="text-xl font-black">
                      Gestion des Candidatures & Demandes reçues pour votre événement
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      En tant qu'organisateur, examinez le profil complet de chaque candidat (contact, motivation) et décidez de l'accepter ou de le refuser.
                    </p>
                  </div>
                </div>
              </div>

              {actionFeedback && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-bold border ${actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                  <span>{actionFeedback.text}</span>
                  <button onClick={() => setActionFeedback(null)} className="uppercase text-[10px] font-black">Fermer</button>
                </div>
              )}

              {/* Candidatures de bénévoles reçues */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft mb-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <h4 className="text-base font-extrabold text-primary-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-secondary-500" />
                    <span>Candidatures de bénévoles reçues ({event.participations?.length || 0})</span>
                  </h4>
                </div>

                {!event.participations || event.participations.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Aucune candidature de bénévole reçue pour cet événement pour l'instant.</p>
                ) : (
                  <div className="space-y-4">
                    {event.participations.map((p) => (
                      <div key={p.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                              {(p.user?.name || p.user_name || p.name || 'B').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="text-sm font-extrabold text-primary-900">{p.user?.name || p.user_name || p.name || 'Bénévole'}</h5>
                              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mt-0.5">
                                {(p.user?.email || p.user_email || p.email) && (
                                  <a href={`mailto:${p.user?.email || p.user_email || p.email}`} className="text-secondary-600 hover:underline flex items-center gap-1 font-semibold">
                                    <Mail className="w-3 h-3" /> {p.user?.email || p.user_email || p.email}
                                  </a>
                                )}
                                {(p.user?.phone || p.phone) ? (
                                  <a href={`tel:${p.user?.phone || p.phone}`} className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold">
                                    <Phone className="w-3 h-3" /> {p.user?.phone || p.phone}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">Tél: Non renseigné</span>
                                )}
                                {p.user?.city && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <MapPin className="w-3 h-3" /> {p.user.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {p.motivation && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                              "{p.motivation}"
                            </div>
                          )}

                          {/* Bouton Plus d'informations */}
                          <button
                            onClick={() => setExpandedCandidate(expandedCandidate === p.id ? null : p.id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 hover:text-secondary-900 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{expandedCandidate === p.id ? "Masquer les détails" : "Plus d'informations"}</span>
                            {expandedCandidate === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {/* Panneau d'informations détaillées */}
                          {expandedCandidate === p.id && (
                            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-secondary-50/30 border border-secondary-100 space-y-3 animate-fade-in">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary-600 flex items-center gap-1.5 pb-2 border-b border-secondary-100">
                                <Star className="w-3.5 h-3.5" />
                                Profil complet du candidat
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {p.user?.bio && (
                                  <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                      <FileText className="w-3 h-3" /> Bio
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed">{p.user.bio}</p>
                                  </div>
                                )}

                                {p.user?.skills && (
                                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" /> Compétences
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {typeof p.user.skills === 'string'
                                        ? p.user.skills.split(',').map((skill, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary-50 text-secondary-800 text-[11px] font-semibold border border-secondary-200">
                                              {skill.trim()}
                                            </span>
                                          ))
                                        : Array.isArray(p.user.skills)
                                          ? p.user.skills.map((skill, i) => (
                                              <span key={i} className="px-2 py-0.5 rounded-md bg-secondary-50 text-secondary-800 text-[11px] font-semibold border border-secondary-200">
                                                {skill}
                                              </span>
                                            ))
                                          : null}
                                    </div>
                                  </div>
                                )}

                                {p.user?.availability && (
                                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                      <CalendarClock className="w-3 h-3" /> Disponibilité
                                    </div>
                                    <p className="text-xs text-slate-700 font-semibold">{p.user.availability}</p>
                                  </div>
                                )}

                                {p.user?.experience_level && (
                                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                      <GraduationCap className="w-3 h-3" /> Niveau d'expérience
                                    </div>
                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                      p.user.experience_level === 'expert' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                      p.user.experience_level === 'intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>
                                      {p.user.experience_level === 'beginner' && '🌱 Débutant'}
                                      {p.user.experience_level === 'intermediate' && '⚡ Intermédiaire'}
                                      {p.user.experience_level === 'expert' && '🏆 Expert'}
                                      {!['beginner', 'intermediate', 'expert'].includes(p.user.experience_level) && p.user.experience_level}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {!p.user?.bio && !p.user?.skills && !p.user?.availability && !p.user?.experience_level && (
                                <p className="text-xs text-slate-400 italic text-center py-2">Ce candidat n'a pas encore renseigné d'informations de profil détaillées.</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-4 flex-shrink-0">
                          {p.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleUpdateParticipation(p.id, 'accepted')}
                                disabled={updatingReqId === p.id}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accepter</span>
                              </button>
                              <button
                                onClick={() => handleUpdateParticipation(p.id, 'rejected')}
                                disabled={updatingReqId === p.id}
                                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Refuser</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              {p.status === 'accepted' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepté
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5" /> Refusé
                                </span>
                              )}
                              <button
                                onClick={() => handleUpdateParticipation(p.id, p.status === 'accepted' ? 'rejected' : 'accepted')}
                                disabled={updatingReqId === p.id}
                                className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                              >
                                Changer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offres de partenariats entreprises reçues */}
              {event.partnerships && event.partnerships.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
                  <h4 className="text-base font-extrabold text-primary-900 flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                    <Handshake className="w-5 h-5 text-secondary-500" />
                    <span>Propositions de partenariats entreprises ({event.partnerships.length})</span>
                  </h4>

                  <div className="space-y-4">
                    {event.partnerships.map((pr) => (
                      <div key={pr.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                              {pr.type === 'financial' && 'Mécénat & Soutien'}
                              {pr.type === 'material' && 'Don Matériel & Nature'}
                              {pr.type === 'skills' && 'Mécénat de Compétences'}
                            </span>
                          </div>
                          <h5 className="text-sm font-extrabold text-primary-900">{pr.user?.organization_name || pr.user?.name}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Contact : {pr.user?.name} ({pr.user?.email}) {pr.user?.phone && `• Tél: ${pr.user.phone}`}
                          </p>
                          {pr.description && (
                            <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic border border-slate-100">
                              "{pr.description}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-4 flex-shrink-0">
                          {pr.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleUpdatePartnership(pr.id, 'accepted')}
                                disabled={updatingReqId === pr.id}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accepter</span>
                              </button>
                              <button
                                onClick={() => handleUpdatePartnership(pr.id, 'rejected')}
                                disabled={updatingReqId === pr.id}
                                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Refuser</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${pr.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                {pr.status === 'accepted' ? 'Partenariat Validé' : 'Partenariat Refusé'}
                              </span>
                              <button
                                onClick={() => handleUpdatePartnership(pr.id, pr.status === 'accepted' ? 'rejected' : 'accepted')}
                                disabled={updatingReqId === pr.id}
                                className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                              >
                                Changer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modale Candidature Bénévole */}
      <Modal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        title="Rejoindre l'équipe bénévole"
      >
        <form onSubmit={handleVolunteerSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Vous postulez pour : <strong>{event.title}</strong>. Vos coordonnées (nom, email, téléphone) seront transmises à l'organisateur pour étudier votre candidature.
          </p>

          {user?.phone ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Téléphone associé à votre compte :</span>
                <span className="font-semibold text-slate-800">{user.phone}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ✓ Transmis
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numéro de téléphone pour vous joindre (optionnel)
              </label>
              <input
                type="tel"
                value={volunteerPhone}
                onChange={(e) => setVolunteerPhone(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Votre message de motivation / disponibilités
            </label>
            <textarea
              rows="4"
              value={volunteerMotivation}
              onChange={(e) => setVolunteerMotivation(e.target.value)}
              placeholder="Ex: Je suis disponible tout le week-end et j'ai une expérience en logistique d'événement..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary-400"
            />
          </div>

          {volunteerFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                volunteerFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {volunteerFeedback.text}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsVolunteerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={volunteerSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {volunteerSubmitting && <Spinner size="sm" color="white" />}
              <span>Envoyer ma candidature</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modale Proposition Partenariat Entreprise */}
      <Modal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        title="Proposer un partenariat RSE"
      >
        <form onSubmit={handlePartnerSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Formulez votre proposition de soutien pour <strong>{event.title}</strong>.
          </p>

          {/* Type de soutien */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type de soutien RSE <span className="text-red-500">*</span>
            </label>
            <select
              value={partnerData.type}
              onChange={(e) => setPartnerData({ ...partnerData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
            >
              <option value="financial">Mécénat financier (Don pécuniaire)</option>
              <option value="material">Don ou prêt de matériel</option>
              <option value="skills">Mécénat de compétences / Accompagnement</option>
            </select>
          </div>

          {/* Besoin ciblé (optionnel) */}
          {event.needs && event.needs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cibler un besoin spécifique de l'événement (optionnel)
              </label>
              <select
                value={partnerData.event_need_id}
                onChange={(e) => setPartnerData({ ...partnerData, event_need_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
              >
                <option value="">Soutien global à l'événement</option>
                {event.needs.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title} ({n.current_quantity}/{n.target_quantity} {n.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Valeur ou description du don */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimation du don en nature ou matériel
            </label>
            <input
              type="text"
              value={partnerData.proposed_value}
              onChange={(e) => setPartnerData({ ...partnerData, proposed_value: e.target.value })}
              placeholder="Ex: 50 packs ou kits complets"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Détails de votre proposition <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows="3"
              value={partnerData.description}
              onChange={(e) => setPartnerData({ ...partnerData, description: e.target.value })}
              placeholder="Précisez le matériel fourni, le nombre d'heures ou les modalités du soutien..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          {partnerFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                partnerFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {partnerFeedback.text}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={partnerSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {partnerSubmitting && <Spinner size="sm" color="white" />}
              <span>Soumettre l'offre</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modale de Confirmation de Suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Êtes-vous sûr de vouloir supprimer définitivement l'événement <strong>« {event.title} »</strong> ? Cette action supprimera également tous les besoins et candidatures associés.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeleteEvent}
              disabled={deleteSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-soft flex items-center gap-2 cursor-pointer"
            >
              {deleteSubmitting && <Spinner size="sm" color="white" />}
              <span>Confirmer la suppression</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
