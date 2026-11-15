import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, deletePartnership } from '../../api/eventApi';
import Spinner from '../../components/common/Spinner';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Trash2,
  Coins,
  Package,
  GraduationCap,
  Sparkles,
  Inbox,
  Handshake,
} from 'lucide-react';

export default function DashboardEnterprise() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEnterpriseData = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error('Erreur chargement dashboard entreprise:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const handleCancelPartnership = async (id) => {
    if (!window.confirm('Voulez-vous retirer cette offre de partenariat ?')) return;
    try {
      setDeletingId(id);
      await deletePartnership(id);
      setActionMessage({ type: 'success', text: 'Proposition de partenariat retirée avec succès.' });
      fetchEnterpriseData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du retrait.' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Chargement de votre espace mécénat & RSE...</p>
      </div>
    );
  }

  const partnerships = data?.partnerships || [];
  const stats = data?.stats || {
    total_proposals: partnerships.length,
    accepted_count: partnerships.filter((p) => p.status === 'accepted').length,
    pending_count: partnerships.filter((p) => p.status === 'pending').length,
    total_funds_committed: 0,
  };

  const filtered = partnerships.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'financial':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
            <Coins className="w-3 h-3" /> Mécénat Financier
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
            <Package className="w-3 h-3" /> Don Matériel
          </span>
        );
      case 'skills':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200">
            <GraduationCap className="w-3 h-3" /> Mécénat de Compétences
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header Entreprise */}
      <div className="bg-gradient-to-r from-blue-950 via-primary-900 to-primary-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft mb-8 relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-400/10 rounded-l-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-400/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md border border-blue-400/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Espace Entreprise • Partenariats & RSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.organization_name || user?.name}
          </h1>
          <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
            Suivi de vos propositions de partenariats solidaires (mécénat financier, matériel ou de compétences) alignées sur l'ODD 17.
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
          <button onClick={() => setActionMessage(null)} className="text-xs uppercase font-bold px-2 py-1">
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div
          onClick={() => setFilterStatus('all')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'all' ? 'border-primary-600 ring-2 ring-primary-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 uppercase">Partenariats Soumis</div>
          <div className="text-2xl font-black text-primary-900 mt-2">{stats.total_proposals}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toutes vos offres</div>
        </div>

        <div
          onClick={() => setFilterStatus('pending')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'pending' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-amber-700 uppercase">En Négociation</div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.pending_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">En cours d'étude par l'asso</div>
        </div>

        <div
          onClick={() => setFilterStatus('accepted')}
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-xs border transition-all ${
            filterStatus === 'accepted' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100'
          }`}
        >
          <div className="text-xs font-bold text-emerald-700 uppercase">Partenariats Validés</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.accepted_count}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Signés & Actifs</div>
        </div>
      </div>

      {/* Liste des partenariats */}
      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-secondary-500" />
              <span>Suivi de vos propositions de partenariats</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Affichage de {filtered.length} proposition(s)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg ${filterStatus === 'all' ? 'bg-white font-bold text-primary-900 shadow-xs' : 'text-slate-500'}`}
            >
              Tous ({partnerships.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg ${filterStatus === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500'}`}
            >
              En attente ({stats.pending_count})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-lg ${filterStatus === 'accepted' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-500'}`}
            >
              Acceptés ({stats.accepted_count})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-primary-900">Aucune offre de partenariat</p>
            <p className="text-xs text-slate-500 mt-1">Explorez les initiatives associatives et soutenez leurs projets.</p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-soft transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Découvrir les initiatives ODD 17</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => {
              const event = p.event;
              const formattedDate = p.created_at
                ? new Date(p.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Date inconnue';

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getTypeBadge(p.type)}
                      {p.proposed_value && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          Valeur estimée : {p.proposed_value}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">Envoyé le {formattedDate}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-primary-900 mt-1">
                      {event?.title || 'Événement partenaire'}
                    </h3>

                    {event?.user?.organization_name && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Association bénéficiaire : <span className="font-semibold text-slate-700">{event.user.organization_name}</span>
                      </p>
                    )}

                    {p.description && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{p.description}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:border-l md:border-slate-100 md:pl-5 flex-shrink-0">
                    <div className="flex flex-col items-start md:items-end">
                      {p.status === 'pending' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>En cours d'étude</span>
                        </div>
                      )}
                      {p.status === 'accepted' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Partenariat accepté</span>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Partenariat décliné</span>
                        </div>
                      )}
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
                          onClick={() => handleCancelPartnership(p.id)}
                          disabled={deletingId === p.id}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Retirer la proposition"
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
