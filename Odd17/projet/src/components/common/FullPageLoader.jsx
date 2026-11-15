import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { Globe, HeartHandshake, Users, Building2, CalendarCheck } from 'lucide-react';

const messages = [
  { icon: HeartHandshake, text: 'Connexion des associations avec des bénévoles engagés…' },
  { icon: Building2,      text: 'Mise en relation des entreprises avec des causes locales…' },
  { icon: CalendarCheck,  text: 'Chargement des événements et initiatives solidaires…' },
  { icon: Users,          text: 'Préparation de votre espace collaboratif…' },
  { icon: Globe,          text: 'Vérification de votre session en cours…' },
];

export default function FullPageLoader({ message }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = messages[msgIndex];
  const Icon = current.icon;
  const displayText = message || current.text;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary-900 via-primary-800 to-slate-900 text-white px-4">

      {/* Halos décoratifs */}
      <div className="absolute w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl -top-16 -left-16 pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 bg-accent/10 rounded-full blur-3xl -bottom-16 -right-16 pointer-events-none animate-pulse" />

      {/* Logo animé */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary-700 to-secondary-500 shadow-2xl flex items-center justify-center border border-white/20">
          <Globe className="w-12 h-12 text-white" style={{ animation: 'spin 10s linear infinite' }} />
        </div>
        {/* Badge icône thématique */}
        <div className="absolute -bottom-3 -right-3 w-9 h-9 bg-accent rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 transition-all duration-500">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Nom de la plateforme */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
        Event<span className="text-secondary-400">Partner</span>
      </h1>
      <p className="text-xs font-semibold uppercase tracking-widest text-secondary-200/70 mb-8">
        Associations · Entreprises · Bénévoles
      </p>

      {/* Message rotatif */}
      <div className="flex items-center gap-3 bg-white/8 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 max-w-xs text-center">
        <Spinner size="sm" color="accent" />
        <span className="text-sm text-slate-200 font-medium leading-snug transition-all duration-500">
          {displayText}
        </span>
      </div>

      {/* Points de progression */}
      <div className="flex gap-2 mt-6">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === msgIndex ? 'w-6 bg-secondary-400' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
