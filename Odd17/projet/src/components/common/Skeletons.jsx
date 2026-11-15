import React from 'react';

/**
 * Skeleton Loader pour les cartes d'événements ou statistiques
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-card p-6 shadow-soft border border-slate-100 animate-pulse flex flex-col justify-between h-64"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-8 bg-slate-200 rounded w-28"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Loader pour les tableaux (ex: candidatures, demandes de partenariats)
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-card shadow-soft border border-slate-100 overflow-hidden animate-pulse">
      {/* En-tête de tableau factice */}
      <div className="bg-slate-100/70 p-4 border-b border-slate-200 grid grid-cols-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-300 rounded w-3/4"></div>
        ))}
      </div>

      {/* Lignes du tableau */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 grid grid-cols-4 gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-slate-200 rounded"
                style={{ width: `${60 + ((rowIndex + colIndex) % 4) * 10}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default { CardSkeleton, TableSkeleton };
