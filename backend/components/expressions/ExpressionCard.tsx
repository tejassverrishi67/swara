'use client';

import { CheckCircle2, Volume2 } from 'lucide-react';
import type { Expression } from '@/types/expression';
import { ToneBadge } from '@/components/ui/ToneBadge';
import { TONE_DESCRIPTIONS } from '@/data/tones';

interface ExpressionCardProps {
  expression: Expression;
  isSelected: boolean;
  onSelect: (expression: Expression) => void;
  index: number;
}

/**
 * A single AI-generated expression candidate.
 *
 * Selecting this card does NOT trigger speech.
 * The user must explicitly press SPEAK after selecting.
 * This boundary ("AI SUGGESTS. USER DECIDES.") is enforced here.
 */
export function ExpressionCard({ expression, isSelected, onSelect, index }: ExpressionCardProps) {
  return (
    <button
      id={`expression-card-${index}`}
      onClick={() => onSelect(expression)}
      aria-pressed={isSelected}
      aria-label={`${expression.tone} expression: ${expression.text}${isSelected ? ', selected' : ''}`}
      className={[
        'w-full rounded-2xl border-2 p-4 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'active:scale-[0.98]',
        isSelected
          ? 'border-indigo-400 bg-indigo-900/30 shadow-lg shadow-indigo-950/50'
          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-700/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <ToneBadge tone={expression.tone} size="sm" />
            <span className="text-xs text-slate-500">{TONE_DESCRIPTIONS[expression.tone]}</span>
          </div>
          <p
            className={[
              'text-base font-medium leading-snug',
              isSelected ? 'text-white' : 'text-slate-200',
            ].join(' ')}
          >
            "{expression.text}"
          </p>
        </div>

        {isSelected ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" aria-hidden="true" />
        ) : (
          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-600 mt-0.5" aria-hidden="true" />
        )}
      </div>

      {isSelected && (
        <p className="mt-2 text-xs text-indigo-400/80 flex items-center gap-1">
          <Volume2 className="h-3 w-3" aria-hidden="true" />
          Press SPEAK to play this expression
        </p>
      )}
    </button>
  );
}
