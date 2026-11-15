import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDashboard,
  deleteEvent,
  updateParticipationStatus,
  deleteParticipation,
  updatePartnershipStatus,
  deletePartnership,
  updateUserStatus,
  deleteUser,
} from '../../api/eventApi';
import Spinner from '../../components/common/Spinner';
import {
  Shield,
  Users,
  Calendar,
  Handshake,
  Heart,
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
  AlertTriangle,
  Lock,
  Unlock,
  UserCheck,
  Search,
} from 'lucide-react';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'participations' | 'partnerships' | 'users'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Erreur chargement dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Actions Événements (Supprimer, etc.)
  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`[ADMIN] Êtes-vous sûr de vouloir supprimer définitivement l'événement "${title}" ?`)) return;
    try {
      setProcessingId(id);
      await deleteEvent(id);
      setActionMessage({ type: 'success', text: `Événement "${title}" supprimé par l'administration.` });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Actions Candidatures Bénévoles (Accepter, Refuser, Supprimer)
  const handleUpdateParticipation = async (id, status) => {
    try {
      setProcessingId(id);
      await updateParticipationStatus(id, status);
      setActionMessage({
        type: 'success',
        text: `Statut de la candidature mis à jour sur "${status === 'accepted' ? 'Acceptée' : 'Refusée'}".`,
      });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteParticipation = async (id) => {
    if (!window.confirm('[ADMIN] Supprimer cette candidature ?')) return;
    try {
      setProcessingId(id);
      await deleteParticipation(id);
      setActionMessage({ type: 'success', text: 'Candidature supprimée.' });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Actions Partenariats Entreprises (Accepter, Refuser, Supprimer)
  const handleUpdatePartnership = async (id, status) => {
    try {
      setProcessingId(id);
      await updatePartnershipStatus(id, status);
      setActionMessage({
        type: 'success',
        text: `Statut du partenariat mis à jour sur "${status === 'accepted' ? 'Accepté' : 'Refusé'}".`,
      });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePartnership = async (id) => {
    if (!window.confirm('[ADMIN] Supprimer ce partenariat ?')) return;
    try {
      setProcessingId(id);
      await deletePartnership(id);
      setActionMessage({ type: 'success', text: 'Partenariat supprimé.' });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Actions Utilisateurs (Suspendre / Réactiver, Supprimer)
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'suspended' ? 'suspendre' : 'réactiver';
    if (!window.confirm(`[ADMIN] Souhaitez-vous ${actionLabel} le compte de "${targetUser.name}" ?`)) return;

    try {
      setProcessingId(targetUser.id);
      await updateUserStatus(targetUser.id, nextStatus);
      setActionMessage({
        type: 'success',
        text: `Compte de ${targetUser.name} ${nextStatus === 'suspended' ? 'suspendu' : 'réactivé'}.`,
      });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement de statut.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`[ADMIN ATTENTION] Supprimer définitivement l'utilisateur "${targetUser.name}" et toutes ses données associées ?`)) return;
    try {
      setProcessingId(targetUser.id);
      await deleteUser(targetUser.id);
      setActionMessage({ type: 'success', text: `Utilisateur "${targetUser.name}" supprimé.` });
      fetchAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Chargement de la console d'administration...</p>
      </div>
    );
  }

  const events = data?.events || [];
  const participations = data?.participations || [];
  const partnerships = data?.partnerships || [];
  const users = data?.users || [];
  const stats = data?.stats || {
    users_count: users.length,
    events_count: events.length,
    participations_count: participations.length,
    partnerships_count: partnerships.length,
  };

  // Filtres de recherche textuelle
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParticipations = participations.filter((p) =>
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartnerships = partnerships.filter((p) =>
    p.user?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Admin</span>;
      case 'association':
        return <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Association</span>;
      case 'enterprise':
        return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Entreprise</span>;
      case 'volunteer':
      default:
        return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Bénévole</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header Super Admin */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-primary-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft mb-8 relative overflow-hidden border border-purple-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md border border-purple-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Panneau Super-Administrateur • Contrôle Global</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Console d'Administration • {user?.name}
            </h1>
            <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
              Supervisez, éditez ou supprimez tous les événements du site, validez ou refusez toutes les demandes (bénévoles et partenariats), et gérez les comptes utilisateurs.
            </p>
          </div>

          <Link
            to="/events/create"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-soft transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Créer un événement Admin</span>
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

      {/* KPI Cards Admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div
          onClick={() => setActiveTab('events')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'events' ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tous les Événements</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-primary-900 mt-2">{stats.events_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Voir, modifier, supprimer</div>
        </div>

        <div
          onClick={() => setActiveTab('participations')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'participations' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Demandes Bénévoles</span>
            <Heart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.participations_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sur tout le site</div>
        </div>

        <div
          onClick={() => setActiveTab('partnerships')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'partnerships' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase">Partenariats RSE</span>
            <Handshake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{stats.partnerships_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toutes les offres</div>
        </div>

        <div
          onClick={() => setActiveTab('users')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            activeTab === 'users' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Utilisateurs</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.users_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gérer les comptes</div>
        </div>
      </div>

      {/* Barre d'onglets & Recherche globale */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 mb-6 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveTab('events'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'events' ? 'bg-purple-900 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous les Événements ({events.length})
          </button>
          <button
            onClick={() => { setActiveTab('participations'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'participations' ? 'bg-purple-900 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Toutes les Demandes ({participations.length})
          </button>
          <button
            onClick={() => { setActiveTab('partnerships'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'partnerships' ? 'bg-purple-900 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous les Partenariats ({partnerships.length})
          </button>
          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-purple-900 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Comptes Utilisateurs ({users.length})
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Onglet 1 : TOUS LES ÉVÉNEMENTS ("yxof, 3dle, ymhi kolxi") */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-primary-900">
              Tous les événements du site ({filteredEvents.length})
            </h2>
            <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold">
              Privilèges Super Admin : Voir, Modifier, Supprimer
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun événement correspondant.</div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((ev) => (
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
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                        <Calendar className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {ev.category && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {ev.category.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          ID #{ev.id} • {ev.location} • {new Date(ev.start_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-primary-900 truncate">{ev.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">
                          Organisateur : {ev.user?.organization_name || ev.user?.name || `User #${ev.user_id}`}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          {ev.accepted_participations_count || 0} bénévole(s)
                        </span>
                        <span>•</span>
                        <span className="text-blue-700 font-bold">
                          {ev.accepted_partnerships_count || 0} partenaire(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Admin : Voir, Modifier, Supprimer */}
                  <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-5">
                    <Link
                      to={`/events/${ev.slug || ev.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Voir l'événement"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Voir</span>
                    </Link>
                    <Link
                      to={`/events/${ev.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                      title="Modifier cet événement"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      disabled={processingId === ev.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Supprimer cet événement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet 2 : TOUTES LES DEMANDES BÉNÉVOLES */}
      {activeTab === 'participations' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-primary-900">
              Toutes les demandes de bénévoles ({filteredParticipations.length})
            </h2>
            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-bold">
              Modération Admin
            </span>
          </div>

          {filteredParticipations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune candidature trouvée.</div>
          ) : (
            <div className="space-y-4">
              {filteredParticipations.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                        #{p.id}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-primary-900">{p.user?.name || 'Bénévole'}</h4>
                        <p className="text-xs text-slate-400">{p.user?.email}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2">
                      <span className="font-semibold text-slate-500">Événement : </span>
                      <span className="font-bold text-primary-900">{p.event?.title || `Event #${p.event_id}`}</span>
                    </p>

                    {p.motivation && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{p.motivation}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:border-l md:border-slate-100 md:pl-5">
                    <div className="flex items-center gap-1.5">
                      {p.status === 'accepted' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Acceptée
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Refusée
                        </span>
                      )}
                      {p.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          En attente
                        </span>
                      )}
                    </div>

                    {/* Actions de modération Admin */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateParticipation(p.id, 'accepted')}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Accepter"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateParticipation(p.id, 'rejected')}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Refuser"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParticipation(p.id)}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                        title="Supprimer la candidature"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet 3 : TOUS LES PARTENARIATS ENTREPRISES */}
      {activeTab === 'partnerships' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-primary-900">
              Tous les partenariats d'entreprises ({filteredPartnerships.length})
            </h2>
            <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-bold">
              Modération Admin
            </span>
          </div>

          {filteredPartnerships.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun partenariat trouvé.</div>
          ) : (
            <div className="space-y-4">
              {filteredPartnerships.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-secondary-800 bg-secondary-50 px-2.5 py-0.5 rounded-md border border-secondary-200">
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:border-l md:border-slate-100 md:pl-5">
                    <div className="flex items-center gap-1.5">
                      {p.status === 'accepted' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Accepté
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Refusé
                        </span>
                      )}
                      {p.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          En attente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdatePartnership(p.id, 'accepted')}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Accepter le partenariat"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdatePartnership(p.id, 'rejected')}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Refuser le partenariat"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePartnership(p.id)}
                        disabled={processingId === p.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                        title="Supprimer l'offre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet 4 : COMPTES UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-primary-900">
              Comptes enregistrés sur la plateforme ({filteredUsers.length})
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
              Gestion de la sécurité
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-primary-900">{u.name}</span>
                        {getRoleBadge(u.role)}
                        {u.status === 'suspended' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Suspendu
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {u.email} {u.organization_name && `• ${u.organization_name}`} {u.city && `• ${u.city}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions Utilisateur : Suspendre / Réactiver, Supprimer */}
                  <div className="flex items-center gap-2">
                    {u.id !== user.id && (
                      <>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          disabled={processingId === u.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Suspendre</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Réactiver</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={processingId === u.id}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          title="Supprimer ce compte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
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
