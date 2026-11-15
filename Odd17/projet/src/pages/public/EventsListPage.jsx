import React, { useState, useEffect, useCallback } from 'react';
import { getEvents, getCategories, getCities } from '../../api/eventApi';
import EventCard from '../../components/events/EventCard';
import { CardSkeleton } from '../../components/common/Skeletons';
import Spinner from '../../components/common/Spinner';
import { Search, RotateCcw, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);

  // Charger les catégories et villes au montage
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([getCategories(), getCities()]);
        setCategories(catRes.categories || []);
        setCities(cityRes.cities || []);
      } catch (err) {
        console.error('Erreur chargement métadonnées filtres:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Charger les événements filtrés
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category_id: selectedCategory || undefined,
        city: selectedCity || undefined,
        date_filter: dateFilter === 'all' ? undefined : dateFilter,
        sort_by: sortBy,
        page: currentPage,
        per_page: 20,
      };

      const res = await getEvents(params);
      setEvents(res.data || []);
      setPaginationMeta({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        from: res.from,
        to: res.to,
      });
    } catch (err) {
      console.error('Erreur chargement événements:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedCity, dateFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setDateFilter('upcoming');
    setSortBy('date_asc');
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de page */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full border border-secondary-200 mb-2">
            <span>Actions Multipartites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-900 tracking-tight">
            Explorer les Événements & Initiatives
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Rejoignez une action solidaire, prêtez main-forte comme bénévole ou proposez un soutien matériel/financier en tant qu'entreprise.
          </p>
        </div>

        {/* Barre d'outils simplifiée : Recherche & Filtres essentiels */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Champ de recherche direct */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher une action, mot-clé, cause..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-400 transition-all"
              />
            </div>

            {/* Filtre Catégorie */}
            <div className="min-w-[190px]">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filtrer par catégorie"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary-400 cursor-pointer shadow-2xs"
              >
                <option value="">Toutes les thématiques</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Ville */}
            <div className="min-w-[150px]">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filtrer par ville"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary-400 cursor-pointer shadow-2xs"
              >
                <option value="">Toutes les villes</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton Réinitialiser si un filtre est actif */}
            {(search || selectedCategory || selectedCity) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Effacer les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Compteur de résultats */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
          <span>
            {paginationMeta ? (
              <>
                Affichage de <strong className="text-primary-900">{paginationMeta.total}</strong> événement(s)
              </>
            ) : (
              'Recherche en cours...'
            )}
          </span>
        </div>

        {/* Contenu principal : Grille ou Skeletons ou État vide */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-primary-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Aucune action ne correspond à vos critères de recherche actuels. Essayez de modifier vos filtres.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-soft transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer tous les filtres</span>
            </button>
          </div>
        )}

        {/* Pagination */}
        {paginationMeta && paginationMeta.last_page > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-primary-800 text-white shadow-soft'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage >= paginationMeta.last_page}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
