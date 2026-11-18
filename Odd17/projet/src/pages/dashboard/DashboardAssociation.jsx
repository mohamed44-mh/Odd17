import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDashboard,
  deleteEvent,
  updateParticipationStatus,
  updatePartnershipStatus,
} from '../../api/eventApi';
import Spinner from '../../components/common/Spinner';
import {
  Building2,
  CalendarPlus,
  Users,
  Handshake,
  MapPin,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Package,
  GraduationCap,
  Sparkles,
  Inbox,
  Calendar,
  Mail,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  CalendarClock,
  Star,
} from 'lucide-react';

export default function DashboardAssociation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'participations' | 'partnerships'
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);

  const fetchAssociationData = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Erreur chargement dashboard association:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociationData();
  }, []);

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive de l'événement "${title}" ?`)) return;
    try {
      setProcessingId(id);
      await deleteEvent(id);
      setActionMessage({ type: 'success', text: `Événement "${title}" supprimé avec succès.` });
      fetchAssociationData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateParticipation = async (id, status) => {
    try {
      setProcessingId(id);
      await updateParticipationStatus(id, status);
      setActionMessage({
        type: 'success',
        text: `Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !`,
      });
      fetchAssociationData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdatePartnership = async (id, status) => {
    try {
      setProcessingId(id);
      await updatePartnershipStatus(id, status);
      setActionMessage({
        type: 'success',
        text: `Partenariat ${status === 'accepted' ? 'accepté' : 'refusé'} avec succès !`,
      });
      fetchAssociationData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Chargement de votre console d'association...</p>
      </div>
    );
  }

  const events = data?.events || [];
  const participations = data?.all_participations || [];
  const partnerships = data?.all_partnerships || [];
  const stats = data?.stats || {
    my_events_count: events.length,
    pending_participations_count: 0,
    accepted_volunteers_count: 0,
    pending_partnerships_count: 0,
    accepted_partnerships_count: 0,
    total_funds_received: 0,
  };

  const filteredParticipations = participations.filter((p) => {
    if (selectedEventFilter === 'all') return true;
    return (
      String(p.event_id) === String(selectedEventFilter) ||
      events.some(
        (ev) =>
          (String(ev.id) === String(selectedEventFilter) || String(ev.slug) === String(selectedEventFilter)) &&
          (String(p.event_id) === String(ev.slug) || String(p.event_id) === String(ev.id))
      )
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header Association */}
      <div className="bg-gradient-to-r from-emerald-950 via-primary-900 to-primary-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft mb-8 relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-400/10 rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md border border-emerald-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Espace Association • Gestion des Initiatives & Demandes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.organization_name || user?.name}
            </h1>
            <p className="mt-2 text-slate-300 max-w-2xl text-sm flex items-center gap-2 flex-wrap">
              <span>Contact : {user?.name}</span>
              {user?.city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-secondary-300 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.city}
                  </span>
                </>
              )}
            </p>
          </div>

          <Link
            to="/events/create"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-soft transition-all transform hover:-translate-y-0.5"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Créer un événement</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-semibold border animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs uppercase font-bold px-2 py-1">
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div
          onClick={() => setActiveTab('events')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'events' ? 'border-primary-600 ring-2 ring-primary-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 uppercase">Événements Publiés</div>
          <div className="text-2xl font-black text-primary-900 mt-2">{stats.my_events_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Organisés par votre structure</div>
        </div>

        <div
          onClick={() => setActiveTab('participations')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'participations' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-amber-700 uppercase">Candidatures à traiter</div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.pending_participations_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.accepted_volunteers_count} bénévole(s) validé(s)
          </div>
        </div>

        <div
          onClick={() => setActiveTab('partnerships')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'partnerships' ? 'border-secondary-500 ring-2 ring-secondary-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-secondary-700 uppercase">Partenariats reçus</div>
          <div className="text-2xl font-black text-secondary-600 mt-2">{stats.pending_partnerships_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.accepted_partnerships_count} validé(s)
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
            activeTab === 'events'
              ? 'bg-primary-900 text-white shadow-soft'
              : 'text-slate-600 hover:text-primary-900 hover:bg-slate-100'
          }`}
        >
          Mes Événements ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('participations')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'participations'
              ? 'bg-primary-900 text-white shadow-soft'
              : 'text-slate-600 hover:text-primary-900 hover:bg-slate-100'
          }`}
        >
          <span>Demandes Bénévoles</span>
          {stats.pending_participations_count > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
              {stats.pending_participations_count}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'partnerships'
              ? 'bg-primary-900 text-white shadow-soft'
              : 'text-slate-600 hover:text-primary-900 hover:bg-slate-100'
          }`}
        >
          <span>Offres Partenaires</span>
          {stats.pending_partnerships_count > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary-400 text-secondary-950 font-black">
              {stats.pending_partnerships_count}
            </span>
          )}
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-primary-900">Événements sous votre gestion</h2>
            <Link
              to="/events/create"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              + Nouvel événement
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-bold text-primary-900">Vous n'avez pas encore publié d'événement</p>
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-soft"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publier votre premier événement</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {ev.banner_image ? (
                      <img
                        src={ev.banner_image}
                        alt={ev.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 border border-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                        <Calendar className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {ev.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {ev.category.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {ev.location} • {new Date(ev.start_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-primary-900 truncate">{ev.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="font-semibold text-emerald-700">
                          {ev.accepted_participations_count || 0} / {ev.max_volunteers || '∞'} bénévoles
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-secondary-700">
                          {ev.accepted_partnerships_count || 0} partenaire(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-5 flex-wrap">
                    <button
                      onClick={() => { setSelectedEventFilter(ev.id); setActiveTab('participations'); }}
                      className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Gérer les candidatures reçues"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Candidatures ({ev.accepted_participations_count || 0})</span>
                    </button>
                    <Link
                      to={`/events/${ev.slug || ev.id}`}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-primary-900 hover:bg-slate-50 transition-colors"
                      title="Voir"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/events/${ev.slug || ev.id}/edit`}
                      className="p-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(ev.id || ev.slug, ev.title)}
                      disabled={processingId === ev.id || processingId === ev.slug}
                      className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidatures bénévoles */}
      {activeTab === 'participations' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary-900">
                Demandes de participation reçues
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Consultez les informations et coordonnées de chaque bénévole avant de valider.
              </p>
            </div>

            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filtrer par événement :</span>
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-primary-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="all">Tous mes événements ({participations.length})</option>
                  {events.map((ev) => {
                    const count = participations.filter(
                      (p) =>
                        String(p.event_id) === String(ev.id) ||
                        String(p.event_id) === String(ev.slug)
                    ).length;
                    return (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {filteredParticipations.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-bold text-primary-900">Aucune candidature pour cet événement</p>
              <p className="text-xs text-slate-500 mt-1">Dès qu'un bénévole postule, vous pourrez le valider ou le refuser ici.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParticipations.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base shadow-xs">
                        {(p.user?.name || p.user_name || 'B').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-primary-900">{p.user?.name || p.user_name || 'Bénévole'}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mt-0.5">
                          {(p.user?.email || p.user_email) && (
                            <a href={`mailto:${p.user?.email || p.user_email}`} className="text-secondary-600 hover:underline flex items-center gap-1 font-semibold">
                              <Mail className="w-3.5 h-3.5" /> {p.user?.email || p.user_email}
                            </a>
                          )}
                          {(p.user?.phone || p.phone) ? (
                            <a href={`tel:${p.user?.phone || p.phone}`} className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold">
                              <Phone className="w-3.5 h-3.5" /> {p.user?.phone || p.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">Tél : Non renseigné</span>
                          )}
                          {(p.user?.city || p.city) && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-secondary-500" /> {p.user?.city || p.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-700 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-500">Événement :</span>
                      <span className="font-bold text-primary-900">
                        {p.event?.title || p.event_title || (events.find(e => String(e.id) === String(p.event_id) || String(e.slug) === String(p.event_id))?.title) || 'Événement Solidaire'}
                      </span>
                      {p.created_at && (
                        <span className="text-slate-400 text-[11px]">
                          • Postulé le {new Date(p.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>

                    {p.motivation && (
                      <div className="mt-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
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

                  <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-5 flex-shrink-0">
                    {p.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateParticipation(p.id, 'accepted')}
                          disabled={processingId === p.id}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => handleUpdateParticipation(p.id, 'rejected')}
                          disabled={processingId === p.id}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {p.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Acceptée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Refusée
                          </span>
                        )}
                        <button
                          onClick={() => handleUpdateParticipation(p.id, p.status === 'accepted' ? 'rejected' : 'accepted')}
                          disabled={processingId === p.id}
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
      )}

      {/* Partenariats entreprises */}
      {activeTab === 'partnerships' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-primary-900 pb-6 border-b border-slate-100 mb-6">
            Propositions de partenariats entreprises ({partnerships.length})
          </h2>

          {partnerships.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Handshake className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-bold text-primary-900">Aucune offre de partenariat reçue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerships.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-secondary-800 bg-secondary-50 px-2 py-0.5 rounded-md border border-secondary-200">
                        {p.type === 'financial' && 'Mécénat Financier'}
                        {p.type === 'material' && 'Don Matériel'}
                        {p.type === 'skills' && 'Mécénat de Compétences'}
                      </span>
                      {p.proposed_value && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {p.proposed_value}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-primary-900">
                      {p.user?.organization_name || p.user?.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contact : {p.user?.name} ({p.user?.email}) • Pour : <span className="font-semibold text-slate-700">{p.event?.title}</span>
                    </p>

                    {p.description && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{p.description}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-5">
                    {p.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdatePartnership(p.id, 'accepted')}
                          disabled={processingId === p.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => handleUpdatePartnership(p.id, 'rejected')}
                          disabled={processingId === p.id}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {p.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Partenariat Accepté
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Partenariat Refusé
                          </span>
                        )}
                        <button
                          onClick={() => handleUpdatePartnership(p.id, p.status === 'accepted' ? 'rejected' : 'accepted')}
                          disabled={processingId === p.id}
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
      )}
    </div>
  );
}
