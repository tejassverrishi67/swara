'use client';

import { Sparkles, Volume2, AlertTriangle } from 'lucide-react';
import type { Expression } from '@/types/expression';
import { ExpressionCard } from './ExpressionCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ExpressionPanelProps {
  expressions: Expression[];
  selectedExpression: Expression | null;
  isLoading: boolean;
  usedFallback: boolean;
  onSelect: (expression: Expression) => void;
  onSpeak: () => void;
  isSpeaking: boolean;
  ttsProvider: 'elevenlabs' | 'browser' | null;
}

/**
 * Panel displaying the 3 AI-generated expression candidates.
 *
 * The SPEAK button is only active after an expression is selected.
 * No audio plays automatically — explicit user action required.
 * This enforces: AI SUGGESTS. USER DECIDES.
 */
export function ExpressionPanel({
  expressions,
  selectedExpression,
  isLoading,
  usedFallback,
  onSelect,
  onSpeak,
  isSpeaking,
  ttsProvider,
}: ExpressionPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8">
        <LoadingSpinner size="lg" label="Generating expressions..." />
        <p className="text-sm text-slate-400">Building your expressions…</p>
      </div>
    );
  }

  if (expressions.length === 0) return null;

  return (
    <section
      aria-label="Expression candidates"
      className="flex flex-col gap-4 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-300">Choose your expression</h2>
        </div>
        {usedFallback && (
          <span
            className="flex items-center gap-1 rounded-full bg-amber-900/40 border border-amber-700/40 px-2 py-0.5 text-xs text-amber-300"
            title="AI unavailable — showing template-based expressions"
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Local fallback
          </span>
        )}
      </div>

      {/* Principle reminder */}
      <p className="text-xs text-slate-500 italic">
        AI suggests — you decide. Select an expression, then press SPEAK.
      </p>

      {/* Expression cards */}
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Expression options">
        {expressions.map((expr, i) => (
          <ExpressionCard
            key={`${expr.tone}-${i}`}
            expression={expr}
            isSelected={selectedExpression?.tone === expr.tone}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </div>

      {/* Speak button — only active after explicit selection */}
      <div className="border-t border-slate-700/40 pt-4">
        <button
          id="speak-selected-button"
          onClick={onSpeak}
          disabled={!selectedExpression || isSpeaking}
          aria-label={
            !selectedExpression
              ? 'Select an expression first, then speak'
              : isSpeaking
              ? 'Speaking...'
              : `Speak: ${selectedExpression.text}`
          }
          className={[
            'flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4',
            'text-base font-bold transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
            selectedExpression && !isSpeaking
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 active:scale-95'
              : 'bg-slate-800/60 text-slate-500 cursor-not-allowed',
          ].join(' ')}
        >
          <Volume2 className="h-5 w-5" aria-hidden="true" />
          {isSpeaking ? 'Speaking…' : 'SPEAK'}
        </button>

        {/* TTS provider label — clearly distinguish ElevenLabs from browser fallback */}
        {ttsProvider && (
          <p className="mt-1.5 text-center text-xs text-slate-500">
            {ttsProvider === 'elevenlabs' ? '🎙️ ElevenLabs TTS' : '🔊 Browser TTS (fallback)'}
          </p>
        )}
      </div>
    </section>
  );
}
