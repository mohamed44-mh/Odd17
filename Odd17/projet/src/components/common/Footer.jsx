import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary-900 text-white border-t border-primary-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Colonne 1 : Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary-500 to-secondary-300 flex items-center justify-center text-primary-950 font-bold shadow-soft">
                <Globe className="w-5 h-5 text-primary-900" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Event<span className="text-secondary-400">Partner</span>
              </span>
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed">
              La plateforme collaborative qui réunit associations, entreprises engagées et bénévoles pour démultiplier l'impact social et écologique.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-secondary-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15">
              <span>Partenariats & Impact</span>
            </div>
          </div>

          {/* Colonne 2 : Liens rapides */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-400 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">Explorer les événements</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">À propos & Mission</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contactez-nous</Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Écosystème Rôles */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-400 mb-4">
              Parties Prenantes
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Espace Bénévoles (Engagement)</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Espace Associations (Création de projet)</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Espace Entreprises (Partenariats RSE)</Link>
              </li>
              <li>
                <Link to="/events/create" className="hover:text-white transition-colors">Publier un besoin ou événement</Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Contact rapide & Engagement */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-400 mb-4">
              Engagement & Support
            </h4>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Une question ou une proposition de coopération multipartite ?
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary-400" />
                <a href="mailto:eventPatner@gmail.com" className="hover:text-white transition-colors">eventPatner@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary-400" />
                <span>Maroc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barème de bas de page */}
        <div className="pt-8 border-t border-primary-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EventPartner. La plateforme collaborative qui connecte associations, entreprises et bénévoles.</p>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>Données réelles et traçabilité</span>
            <span>•</span>
            <span>Sécurisé par Sanctum</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
