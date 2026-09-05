'use client';

import type { Concept } from '@/types/concept';
import { CATEGORY_COLORS } from '@/types/concept';

interface ConceptTileProps {
  concept: Concept;
  isSelected: boolean;
  onToggle: (concept: Concept) => void;
  disabled?: boolean;
}

/**
 * A single AAC concept tile. Designed for large touch targets.
 * Clear selected/unselected visual states for accessibility.
 */
export function ConceptTile({ concept, isSelected, onToggle, disabled }: ConceptTileProps) {
  const categoryColor = CATEGORY_COLORS[concept.category];

  return (
    <button
      id={`tile-${concept.id}`}
      onClick={() => onToggle(concept)}
      disabled={disabled && !isSelected}
      aria-pressed={isSelected}
      aria-label={`${concept.label}${isSelected ? ', selected' : ''}`}
      className={[
        'relative flex flex-col items-center justify-center gap-1.5',
        'rounded-2xl border-2 p-3 transition-all duration-150',
        'min-h-[88px] w-full text-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'active:scale-95',
        isSelected
          ? `border-indigo-400 bg-indigo-600/30 shadow-lg shadow-indigo-900/40 ring-1 ring-indigo-500/50`
          : `border-slate-700/60 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-700/60`,
        disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {/* Selected indicator */}
      {isSelected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
          ✓
        </span>
      )}

      {/* Category color strip */}
      <span className={`tile-category-bar category-${concept.category}`} aria-hidden="true" />

      <span className="text-2xl leading-none" aria-hidden="true">
        {concept.icon}
      </span>
      <span
        className={[
          'text-xs font-semibold leading-tight',
          isSelected ? 'text-indigo-200' : 'text-slate-300',
        ].join(' ')}
      >
        {concept.label}
      </span>
    </button>
  );
}
