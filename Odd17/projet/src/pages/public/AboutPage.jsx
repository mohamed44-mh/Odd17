import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Globe,
  Target,
  Users,
  Building,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* 1. Hero & Mission */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-600 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-secondary-200 mb-4">
            <Globe className="w-4 h-4 text-secondary-500" />
            <span>Mission & Raison d'être</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-900 tracking-tight leading-tight">
            Fédérer les énergies pour des partenariats durables
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            EventPartner est une plateforme d'engagement sociétal qui répond aux exigences de l'Objectif de Développement Durable n°17 des Nations Unies, en transformant chaque événement en un catalyseur de coopération tripartite.
          </p>
        </div>

        {/* 2. Le Problème & La Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center text-xl mb-6">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-primary-900 mb-3">
                Le Problème identifié
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                Aujourd'hui, les associations sur le terrain font face à un manque structurel de moyens humains et de financements, tandis que les entreprises peinent à identifier des causes authentiques pour concrétiser leur politique RSE. De leur côté, les citoyens expriment un fort désir d'agir sans trouver de cadre clair et flexible.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-red-600">
              Fractionnement des initiatives & manque de visibilité
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl mb-6">
                💡
              </div>
              <h2 className="text-xl font-bold text-primary-900 mb-3">
                La Solution EventPartner
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                Une infrastructure numérique qui centralise les besoins des événements (matériel, logistique, compétences, bénévoles) et permet aux entreprises et bénévoles de s'engager avec précision. Chaque contribution est tracée et valorisée pour créer un cercle vertueux d'entraide.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600">
              Coopération ciblée, mesurable et sans intermédiaire inutile
            </div>
          </div>
        </div>

        {/* 3. Section Partenariats (Cibles 17.16 & 17.17) */}
        <div className="bg-gradient-to-tr from-primary-900 via-primary-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-soft relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary-400/10 rounded-l-full pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-2 block">
              Cadre international des Nations Unies
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              Notre engagement pour des partenariats durables
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
              EventPartner s'appuie sur deux principes fondamentaux pour créer des ponts durables entre acteurs de la société civile, du secteur privé et des organisations associatives :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="text-secondary-400 font-extrabold text-sm mb-1">
                  Cible 17.16 • Partenariats multipartites
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Mobiliser et partager les connaissances, l'expertise, les technologies et les ressources financières pour soutenir l'action collective au bénéfice de l'ensemble des objectifs.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="text-amber-400 font-extrabold text-sm mb-1">
                  Cible 17.17 • Partenariats public-privé & société civile
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Encourager et promouvoir des partenariats publics, public-privé et de la société civile efficaces, bâtis sur l'expérience et les stratégies éprouvées des parties prenantes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Piliers d'Action & Synergie ODD 17 */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-soft border border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-3.5 py-1.5 rounded-full border border-secondary-200">
              Synergie & Coopération Durable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-900 tracking-tight mt-3">
              L'Alliance Tripartite au Service de l'Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Comment EventPartner concrétise l'ODD 17 au Maroc en unissant les forces vives du tissu associatif, des entreprises citoyennes et des bénévoles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pilier 1 : Mécénat & RSE */}
            <div className="p-8 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-soft">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-blue-700 tracking-wide">
                      Pilier Institutionnel
                    </span>
                    <h3 className="text-base font-bold text-primary-900">
                      Mécénat & Engagement RSE
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Nous offrons aux entreprises marocaines un cadre structuré et transparent pour concrétiser leur Responsabilité Sociétale (RSE). Les partenariats s'articulent autour de soutiens financiers, de dons de matériel et de mécénat de compétences.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Conventions de partenariat claires et valorisantes pour l'entreprise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Alignement avec les priorités de développement durable au Maroc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Transparence totale et suivi des actions sponsorisées</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pilier 2 : Société Civile & Bénévolat */}
            <div className="p-8 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-soft">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wide">
                      Pilier Communautaire
                    </span>
                    <h3 className="text-base font-bold text-primary-900">
                      Action Associative & Bénévolat
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Les associations et collectifs locaux publient leurs initiatives et mobilisent les énergies bénévoles. Chaque événement devient une opportunité de rassembler des compétences et de répondre directement aux défis de terrain.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Recrutement et gestion simplifiés des bénévoles engagés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Rayonnement régional pour les associations marocaines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Co-construction de projets à fort impact social et écologique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Avantages & Appel à l'action */}
        <div className="text-center pt-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">
            Prêt à conjuguer vos forces avec les nôtres ?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow-soft transition-all"
            >
              <span>Rejoindre la plateforme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-7 py-3.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span>Poser une question</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
