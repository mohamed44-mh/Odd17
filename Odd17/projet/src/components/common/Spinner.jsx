import React from 'react';

/**
 * Composant Spinner réutilisable avec tailles et couleurs personnalisables
 */
export default function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-14 h-14 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-800 border-t-transparent',
    secondary: 'border-secondary-400 border-t-transparent',
    accent: 'border-accent border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label="Chargement en cours"
      className={`inline-block rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`}
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
}
