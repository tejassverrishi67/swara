'use client';

import { Eye, Radio, Clock } from 'lucide-react';
import type { CaregiverState } from '@/types/caregiver';
import { CATEGORY_LABELS } from '@/types/concept';
import type { ConceptCategory } from '@/types/concept';

interface CaregiverBoardProps {
  state: CaregiverState;
  isSupported: boolean;
}

/**
 * Caregiver live view — read-only observation interface.
 *
 * Shows intent forming in real time via BroadcastChannel.
 * Updates BEFORE the final sentence is spoken.
 *
 * The caregiver cannot modify the user's message.
 * This is purely an observation/support interface.
 */
export function CaregiverBoard({ state, isSupported }: CaregiverBoardProps) {
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-amber-400 text-sm">
          BroadcastChannel is not supported in this browser.
          Open Swara in a modern browser (Chrome, Edge, Firefox) for caregiver sync.
        </p>
      </div>
    );
  }

  const hasActivity = state.concepts.length > 0 || state.lastSpoken;

  return (
    <div className="flex flex-col gap-6">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div
          className={[
            'h-2.5 w-2.5 rounded-full',
            state.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600',
          ].join(' ')}
          aria-hidden="true"
        />
        <span className="text-xs text-slate-400">
          {state.isConnected
            ? 'Listening for concept updates from user screen'
            : 'Waiting for connection…'}
        </span>
      </div>

      {/* Live intent section */}
      <section aria-label="Live user intent" className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Current Intent
          </h2>
          <span className="ml-auto text-xs text-slate-600">
            {state.concepts.length} concept{state.concepts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {state.concepts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-800/30 p-6 text-center">
            <p className="text-sm text-slate-500">
              {hasActivity ? 'Concepts cleared.' : 'Waiting for user to select concepts…'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {state.concepts.map((concept, index) => (
              <div
                key={concept.id}
                className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3"
                aria-label={`Concept ${index + 1}: ${concept.label}`}
              >
                <span className="text-xs font-bold text-slate-600 w-5 text-right">{index + 1}</span>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-200">{concept.label}</span>
                  <span className="text-xs text-slate-500">
                    {CATEGORY_LABELS[concept.category as ConceptCategory] ?? concept.category}
                    {' · '}
                    {concept.semanticType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Selected expression (if any) */}
      {state.selectedExpression && (
        <section aria-label="Selected expression" className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-400" aria-hidden="true" />
            Selected Expression
          </h2>
          <div className="rounded-xl border border-violet-700/40 bg-violet-950/30 p-4">
            <p className="text-xs text-violet-400 mb-1 uppercase tracking-wider">
              {state.selectedExpression.tone}
            </p>
            <p className="text-slate-200 text-base">"{state.selectedExpression.text}"</p>
          </div>
        </section>
      )}

      {/* Last spoken */}
      {state.lastSpoken && (
        <section aria-label="Last spoken" className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            Last Spoken
            {state.lastSpoken.isLiteral && (
              <span className="ml-1 text-xs text-emerald-500/60">(literal)</span>
            )}
          </h2>
          <div className="rounded-xl border border-emerald-700/30 bg-emerald-950/20 p-4">
            <p className="text-slate-200 text-base">"{state.lastSpoken.text}"</p>
          </div>
        </section>
      )}
    </div>
  );
}
