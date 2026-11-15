import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Handshake, ArrowRight, Building } from 'lucide-react';

export default function EventCard({ event }) {
  if (!event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg border border-slate-100 overflow-hidden flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1">
      <div>
        {/* Image de bannière */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={event.banner_image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          {/* Badge Catégorie */}
          {event.category && (
            <span className="absolute top-3 left-3 bg-primary-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              {event.category.name}
            </span>
          )}
          {/* Badge Partenaire présent */}
          {event.accepted_partnerships_count > 0 && (
            <span className="absolute top-3 right-3 bg-secondary-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Handshake className="w-3.5 h-3.5" />
              <span>Partenaire RSE</span>
            </span>
          )}
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Organisateur */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{event.user?.organization_name || event.user?.name || 'Association'}</span>
          </div>

          {/* Titre */}
          <h3 className="text-lg font-bold text-primary-900 line-clamp-2 mb-2 leading-snug">
            {event.title}
          </h3>

          {/* Description courte */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>

          {/* Métadonnées : Date et Lieu */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary-500 flex-shrink-0" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary-500 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de la carte */}
      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-50">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
          <Users className="w-4 h-4 text-amber-500" />
          <span>
            {event.accepted_participations_count || 0}
            {event.max_volunteers > 0 ? ` / ${event.max_volunteers}` : ''} bénévole(s)
          </span>
        </div>

        <Link
          to={`/events/${event.slug || event.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
        >
          <span>Voir détails</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
