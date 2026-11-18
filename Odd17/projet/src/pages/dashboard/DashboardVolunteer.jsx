import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, deleteParticipation } from '../../api/eventApi';
import Spinner from '../../components/common/Spinner';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Trash2,
  AlertCircle,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';

export default function DashboardVolunteer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'rejected'
  const [actionMessage, setActionMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Erreur chargement dashboard bénévole:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const handleCancelParticipation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer votre candidature pour cet événement ?')) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteParticipation(id);
      setActionMessage({ type: 'success', text: 'Votre candidature a été retirée avec succès.' });
      fetchVolunteerData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du retrait de la candidature.' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Chargement de votre suivi de candidatures...</p>
      </div>
    );
  }

  const participations = data?.participations || [];
  const stats = data?.stats || {
    total_applications: participations.length,
    accepted_count: participations.filter((p) => p.status === 'accepted').length,
    pending_count: participations.filter((p) => p.status === 'pending').length,
    rejected_count: participations.filter((p) => p.status === 'rejected').length,
  };

  const filteredParticipations = participations.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Bannière de bienvenue */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft mb-8 relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary-400/10 rounded-l-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md border border-amber-400/30">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Espace Bénévole • Suivi des Demandes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bonjour, {user?.name} !
          </h1>
          <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
            Suivez l'avancement de toutes vos candidatures solidaires en temps réel. Découvrez dès qu'une association valide ou traite votre participation.
          </p>
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
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs uppercase font-bold px-2 py-1 hover:opacity-75"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Cartes de statistiques en temps réel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div
          onClick={() => setFilterStatus('all')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'all'
              ? 'border-primary-600 ring-2 ring-primary-100'
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Candidatures</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary-900 mt-2">{stats.total_applications}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toutes vos demandes soumises</div>
        </div>

        <div
          onClick={() => setFilterStatus('pending')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">En Attente</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.pending_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">En cours d'examen par l'asso</div>
        </div>

        <div
          onClick={() => setFilterStatus('accepted')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'accepted'
              ? 'border-emerald-500 ring-2 ring-emerald-100'
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Acceptées</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.accepted_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Validées, félicitations !</div>
        </div>

        <div
          onClick={() => setFilterStatus('rejected')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'rejected'
              ? 'border-rose-500 ring-2 ring-rose-100'
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase">Refusées</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{stats.rejected_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Non retenues pour cette fois</div>
        </div>
      </div>

      {/* Liste des candidatures */}
      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-secondary-500" />
              <span>Suivi détaillé de vos candidatures</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Affichage {filteredParticipations.length} sur {participations.length} candidature(s)
            </p>
          </div>

          {/* Filtres rapides */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-white shadow-xs text-primary-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Toutes ({participations.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              En attente ({stats.pending_count})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'accepted' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Acceptées ({stats.accepted_count})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'rejected' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Refusées ({stats.rejected_count})
            </button>
          </div>
        </div>

        {filteredParticipations.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-primary-900">Aucune candidature trouvée</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterStatus === 'all'
                ? "Vous n'avez pas encore postulé à un événement solidaire."
                : `Aucune candidature avec le statut "${filterStatus}".`}
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-soft transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explorer les événements à venir</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredParticipations.map((p) => {
              const event = p.event;
              const formattedDate = p.created_at
                ? new Date(p.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Date inconnue';

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Info événement & candidature */}
                  <div className="flex items-start gap-4 flex-1">
                    {event?.banner_image ? (
                      <img
                        src={event.banner_image}
                        alt={event?.title || 'Événement'}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 border border-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                        <Calendar className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {event?.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {event.category.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Postulé le {formattedDate}</span>
                      </div>

                      <h3 className="text-base font-extrabold text-primary-900 truncate">
                        {event?.title || p.event_title || 'Événement solidaire'}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        {event?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                            {event.location}
                          </span>
                        )}
                        <span className="font-medium text-slate-700">
                          Par : {event?.user?.organization_name || event?.organization_name || 'Association organisatrice'}
                        </span>
                      </div>

                      {p.motivation && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 italic">
                          "{p.motivation}"
                        </div>
                      )}

                      {/* Message clair et instantané sur la décision */}
                      {p.status === 'accepted' && (
                        <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>
                            <strong>Félicitations !</strong> Votre candidature a été <strong>validée</strong> par l'association organisatrice. Rendez-vous sur place le jour de l'événement !
                          </span>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span>
                            L'association organisatrice n'a pas pu retenir votre candidature pour cette session (places limitées). Nous vous remercions pour votre esprit solidaire.
                          </span>
                        </div>
                      )}
                      {p.status === 'pending' && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>Votre demande a été transmise avec vos coordonnées et est en cours d'examen par les organisateurs.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* État du statut ("ta9adome talabhom") */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:border-l md:border-slate-100 md:pl-5 flex-shrink-0">
                    <div className="flex flex-col items-start md:items-end">
                      {p.status === 'pending' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>En attente de réponse</span>
                        </div>
                      )}
                      {p.status === 'accepted' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Candidature acceptée !</span>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Candidature non retenue</span>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-400 mt-1">
                        {p.status === 'pending' && "L'association examine votre demande"}
                        {p.status === 'accepted' && "Vous faites partie de l'équipe bénévole"}
                        {p.status === 'rejected' && "Quota atteint ou profil non retenu"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {event && (
                        <Link
                          to={`/events/${event.slug || event.id}`}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-primary-900 hover:bg-slate-50 transition-colors"
                          title="Voir l'événement"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleCancelParticipation(p.id)}
                          disabled={deletingId === p.id}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Annuler ma candidature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
