'use client';

import { useState } from 'react';
import type { Concept, ConceptCategory } from '@/types/concept';
import { CONCEPTS, CONCEPTS_BY_CATEGORY } from '@/data/concepts';
import { CONCEPT_CATEGORIES } from '@/types/concept';
import { ConceptTile } from './ConceptTile';
import { CategoryTabs } from './CategoryTabs';

interface ConceptBoardProps {
  selectedIds: string[];
  onToggle: (concept: Concept) => void;
  canAddMore: boolean;
}

/**
 * The main AAC tile board.
 * Renders concepts from the data layer through ConceptTile — fully data-driven.
 * Supports category filtering via CategoryTabs.
 */
export function ConceptBoard({ selectedIds, onToggle, canAddMore }: ConceptBoardProps) {
  const [activeCategory, setActiveCategory] = useState<ConceptCategory | 'all'>('all');

  const visibleConcepts =
    activeCategory === 'all' ? CONCEPTS : (CONCEPTS_BY_CATEGORY[activeCategory] ?? []);

  return (
    <section aria-label="Concept tile board" className="flex flex-col gap-4">
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {visibleConcepts.length === 0 ? (
        <p className="py-8 text-center text-slate-500">No concepts in this category.</p>
      ) : (
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          }}
          role="list"
          aria-label={`${activeCategory === 'all' ? 'All' : activeCategory} concepts`}
        >
          {visibleConcepts.map((concept) => (
            <div key={concept.id} role="listitem">
              <ConceptTile
                concept={concept}
                isSelected={selectedIds.includes(concept.id)}
                onToggle={onToggle}
                disabled={!canAddMore}
              />
            </div>
          ))}
        </div>
      )}

      {!canAddMore && (
        <p className="text-center text-xs text-amber-400/80" role="status">
          Maximum 8 concepts selected. Remove one to add another.
        </p>
      )}
    </section>
  );
}
