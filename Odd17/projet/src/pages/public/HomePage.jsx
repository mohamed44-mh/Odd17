import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  Building,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Share2,
  Target,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-secondary-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-secondary-300 border border-white/15 mb-6">
            <Sparkles className="w-4 h-4 text-secondary-400" />
            <span>Objectif de Développement Durable n°17 • Partenariats mondiaux</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Ensemble, construisons un avenir meilleur
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
            EventPartner connecte les associations à but non lucratif, les entreprises citoyennes et les bénévoles engagés pour multiplier l'impact des initiatives collectives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-base font-bold px-8 py-4 rounded-xl shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Découvrir les événements</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/events/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-base font-semibold px-7 py-4 rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
            >
              <span>Publier un événement</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Comment ça marche ? – 3 étapes visuelles */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-soft-lg border border-slate-200/80 px-6 py-10 sm:px-12 sm:py-14">

          {/* Titre */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-4 py-1.5 rounded-full border border-secondary-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
              Simple, rapide et efficace
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-900 tracking-tight">
              Comment fonctionne EventPartner ?
            </h2>
          </div>

          {/* 3 étapes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

            {/* Ligne de connexion (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-secondary-200 via-accent/40 to-secondary-200 z-0" />

            {/* Étape 1 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:shadow-soft transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-white flex items-center justify-center mb-5 shadow-soft group-hover:scale-105 transition-transform">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="w-7 h-7 rounded-full bg-primary-900 text-white text-xs font-extrabold flex items-center justify-center mb-3">1</div>
              <h3 className="text-base font-bold text-primary-900 mb-2">Une association publie</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Une association crée un événement solidaire et précise ses besoins : bénévoles, matériel, soutien financier ou compétences.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:shadow-soft transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary-500 to-secondary-300 text-primary-900 flex items-center justify-center mb-5 shadow-soft group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <div className="w-7 h-7 rounded-full bg-secondary-500 text-primary-900 text-xs font-extrabold flex items-center justify-center mb-3">2</div>
              <h3 className="text-base font-bold text-primary-900 mb-2">Bénévoles & entreprises rejoignent</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Les bénévoles postulent pour participer et les entreprises proposent un partenariat RSE. Chaque engagement est suivi en temps réel.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:shadow-soft transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-orange-400 text-white flex items-center justify-center mb-5 shadow-soft group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div className="w-7 h-7 rounded-full bg-accent text-white text-xs font-extrabold flex items-center justify-center mb-3">3</div>
              <h3 className="text-base font-bold text-primary-900 mb-2">L'impact est créé</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                L'événement se réalise avec les ressources nécessaires. L'association valide les présences et les partenariats sont officialisés.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold px-7 py-3 rounded-xl shadow-soft transition-all hover:-translate-y-0.5"
            >
              <span>Rejoindre la plateforme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. Types d'utilisateurs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            Une plateforme pensée pour chaque acteur
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Rejoignez l'écosystème qui correspond à votre manière d'agir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bénévole */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-6 shadow-xs">
                🤝
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">Bénévoles</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Donnez du sens à votre temps libre en rejoignant des actions écologiques, éducatives ou solidaires près de chez vous.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Candidature en 1 clic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suivi de ses engagements
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
            >
              M'inscrire comme bénévole
            </Link>
          </div>

          {/* Association */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-6 shadow-xs">
                🏛️
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">Associations</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Structurez vos événements, recrutez des forces vives et recevez des dons matériels ou financiers d'entreprises locales.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Spécification des besoins ciblés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des candidatures reçues
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
            >
              Créer mon espace Association
            </Link>
          </div>

          {/* Entreprise */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-6 shadow-xs">
                🏢
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">Entreprises</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Incarnez concrètement votre politique RSE via le mécénat financier, le don de matériel informatique et le prêt de compétences.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Soutien ciblé selon vos valeurs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Indicateurs RSE quantifiés
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            >
              Rejoindre en tant qu'Entreprise
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Section Partenariats & Impact */}
      <section className="bg-primary-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-400">
              Notre engagement collaboratif
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Les partenariats au cœur de notre raison d'être
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Découvrez comment EventPartner crée des ponts durables entre associations, entreprises engagées et bénévoles pour un impact réel et mesurable.
            </p>
          </div>

          <Link
            to="/about"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-secondary-400 hover:bg-secondary-300 text-primary-950 font-bold px-6 py-3.5 rounded-xl shadow-soft transition-colors"
          >
            <span>Notre approche partenariale</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
