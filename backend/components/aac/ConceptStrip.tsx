'use client';

import { X } from 'lucide-react';
import type { SelectedConcept } from '@/types/intent';

interface ConceptStripProps {
  concepts: SelectedConcept[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

/**
 * Displays the currently selected concepts as a horizontal strip.
 * Each concept chip can be removed individually.
 * The strip is visible before any AI generation — it represents the user's raw intent.
 */
export function ConceptStrip({ concepts, onRemove, onClear }: ConceptStripProps) {
  if (concepts.length === 0) {
    return (
      <div
        className="flex min-h-[64px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-800/30 px-4"
        aria-label="No concepts selected"
      >
        <p className="text-sm text-slate-500">
          Tap tiles below to build your message
        </p>
      </div>
    );
  }

  return (
    <div
      aria-label={`Selected concepts: ${concepts.map((c) => c.label).join(', ')}`}
      className="flex min-h-[64px] flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-800/40 px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        {concepts.map((concept, index) => (
          <span key={concept.id} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-slate-600 text-sm font-light" aria-hidden="true">+</span>
            )}
            <span
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-900/40 pl-3 pr-1 py-1.5"
            >
              <span className="text-sm font-semibold text-indigo-200">{concept.label}</span>
              <button
                onClick={() => onRemove(concept.id)}
                aria-label={`Remove ${concept.label}`}
                className="rounded-lg p-0.5 text-indigo-400 hover:bg-indigo-800/50 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          </span>
        ))}
      </div>

      {concepts.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onClear}
            aria-label="Clear all selected concepts"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
