'use client';

import { CONCEPT_CATEGORIES, CATEGORY_LABELS, type ConceptCategory } from '@/types/concept';

interface CategoryTabsProps {
  activeCategory: ConceptCategory | 'all';
  onCategoryChange: (category: ConceptCategory | 'all') => void;
}

const CATEGORY_EMOJIS: Record<ConceptCategory | 'all', string> = {
  all: '⊞',
  people: '👥',
  'body-needs': '🩺',
  'time-degree': '⏱️',
  function: '⚡',
  social: '💬',
  emotion: '💭',
};

/**
 * Category filter tabs for the concept board.
 * Horizontal scrollable on small screens. Touch-friendly height.
 */
export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const tabs: Array<{ id: ConceptCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    ...CONCEPT_CATEGORIES.map((cat) => ({ id: cat, label: CATEGORY_LABELS[cat] })),
  ];

  return (
    <nav
      aria-label="Concept categories"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`category-tab-${tab.id}`}
          onClick={() => onCategoryChange(tab.id)}
          aria-pressed={activeCategory === tab.id}
          className={[
            'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5',
            'text-sm font-semibold transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
            'whitespace-nowrap',
            activeCategory === tab.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200',
          ].join(' ')}
        >
          <span aria-hidden="true">{CATEGORY_EMOJIS[tab.id]}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
