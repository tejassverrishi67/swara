'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Mic2, FileText, Sparkles, Users } from 'lucide-react';

import type { Concept } from '@/types/concept';
import type { SupportedLanguage } from '@/data/languages';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, DEFAULT_LANGUAGE } from '@/data/languages';
import { buildLiteralPhrase } from '@/lib/intent/literal-builder';

import { ConceptBoard } from '@/components/aac/ConceptBoard';
import { ConceptStrip } from '@/components/aac/ConceptStrip';
import { ExpressionPanel } from '@/components/expressions/ExpressionPanel';
import { EmergencyTile } from '@/components/emergency/EmergencyTile';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

import { useConceptSelection } from '@/hooks/useConceptSelection';
import { useExpressions } from '@/hooks/useExpressions';
import { useTTS } from '@/hooks/useTTS';

/**
 * Main SWARA AAC user interface.
 *
 * Complete connected flow:
 *   Tile selection → Concept strip → Express → Expression candidates
 *   → User selection → SPEAK → TTS
 *
 *   OR: SPEAK LITERALLY → literal phrase → TTS (no LLM)
 *   OR: EMERGENCY → predefined phrase → immediate TTS
 */
export default function SwaraPage() {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [error, setError] = useState<string | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const {
    selectedConcepts,
    addConcept,
    removeConcept,
    clearConcepts,
    isSelected,
    broadcastSpeaking,
    canAddMore,
    isEmpty,
  } = useConceptSelection();

  const {
    state: expressionState,
    selectedExpression,
    generateExpressions,
    selectExpression,
    reset: resetExpressions,
    isLoading: isExpanding,
    hasExpressions,
    expressions,
    usedFallback,
  } = useExpressions();

  const { speak, speakEmergency, state: ttsState, isLoading: ttsLoading, isPlaying, provider } = useTTS();

  // ── Tile toggle ──────────────────────────────────────────
  const handleTileToggle = useCallback(
    (concept: Concept) => {
      if (isSelected(concept.id)) {
        removeConcept(concept.id);
      } else {
        addConcept(concept);
      }
      // Reset expressions when concepts change
      resetExpressions();
      setError(null);
    },
    [isSelected, removeConcept, addConcept, resetExpressions]
  );

  const handleClear = useCallback(() => {
    clearConcepts();
    resetExpressions();
    setError(null);
  }, [clearConcepts, resetExpressions]);

  // ── Express (AI path) ────────────────────────────────────
  const handleExpress = useCallback(async () => {
    if (isEmpty) {
      setError('Select at least one concept first.');
      return;
    }
    setError(null);
    await generateExpressions(selectedConcepts, language);
  }, [isEmpty, selectedConcepts, language, generateExpressions]);

  // ── Speak selected expression (requires explicit user action) ──
  const handleSpeak = useCallback(async () => {
    if (!selectedExpression) return;
    broadcastSpeaking(selectedExpression.text, false);
    await speak(selectedExpression.text, language);
  }, [selectedExpression, speak, language, broadcastSpeaking]);

  // ── Speak Literally (NO LLM — entirely separate path) ───
  const handleSpeakLiterally = useCallback(async () => {
    if (isEmpty) {
      setError('Select at least one concept first.');
      return;
    }
    const literalPhrase = buildLiteralPhrase(selectedConcepts);
    broadcastSpeaking(literalPhrase, true);
    await speak(literalPhrase, language);
  }, [isEmpty, selectedConcepts, speak, language, broadcastSpeaking]);

  // ── Emergency (completely isolated from AI pipeline) ────
  const handleEmergency = useCallback(async () => {
    setIsEmergencyActive(true);
    await speakEmergency();
    setIsEmergencyActive(false);
  }, [speakEmergency]);

  const isSpeaking = isPlaying || ttsLoading;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
              <Mic2 className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">SWARA</h1>
              <p className="text-xs text-slate-500 leading-none">AAC Communication</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select language"
              className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>

            {/* Caregiver view link */}
            <Link
              href="/caregiver"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
              aria-label="Open caregiver view in new tab"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Caregiver
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-5">
        {/* Error banner */}
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* Expression state error */}
        {expressionState.status === 'error' && (
          <ErrorBanner message={expressionState.message} />
        )}

        {/* ── Top bar: Emergency + Concept Strip ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {/* Emergency tile — always visible */}
          <div className="shrink-0">
            <EmergencyTile onActivate={handleEmergency} isActivating={isEmergencyActive} />
          </div>

          {/* Concept strip */}
          <div className="flex-1">
            <ConceptStrip
              concepts={selectedConcepts}
              onRemove={removeConcept}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap gap-3">
          {/* Express — AI path */}
          <button
            id="express-button"
            onClick={handleExpress}
            disabled={isEmpty || isExpanding || isSpeaking}
            aria-label="Generate AI expressions from selected concepts"
            className={[
              'flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3.5',
              'text-sm font-bold transition-all duration-150 min-w-[140px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
              isEmpty || isExpanding || isSpeaking
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/50 active:scale-95',
            ].join(' ')}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isExpanding ? 'Thinking…' : 'EXPRESS'}
          </button>

          {/* Speak Literally — NO LLM path */}
          <button
            id="speak-literally-button"
            onClick={handleSpeakLiterally}
            disabled={isEmpty || isSpeaking}
            aria-label="Speak selected concepts literally without AI rewriting"
            title="Bypass AI — speak concepts as-is"
            className={[
              'flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3.5',
              'text-sm font-bold transition-all duration-150 min-w-[160px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
              isEmpty || isSpeaking
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/80 active:scale-95',
            ].join(' ')}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            SPEAK LITERALLY
          </button>
        </div>

        {/* Literal path clarification */}
        {!isEmpty && (
          <p className="text-xs text-slate-600 -mt-2">
            <span className="text-emerald-600 font-semibold">SPEAK LITERALLY</span>{' '}
            bypasses AI — speaks exactly: "{selectedConcepts.map((c) => c.label).join('. ')}."
          </p>
        )}

        {/* ── TTS status ── */}
        {isSpeaking && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-700/40 bg-indigo-950/30 px-4 py-2" role="status">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
            <span className="text-sm text-indigo-300">
              {provider === 'browser' ? '🔊 Browser TTS (ElevenLabs unavailable)' : '🎙️ Speaking…'}
            </span>
          </div>
        )}

        {/* ── Expression panel (shown after Express) ── */}
        {(hasExpressions || isExpanding) && (
          <ExpressionPanel
            expressions={expressions}
            selectedExpression={selectedExpression}
            isLoading={isExpanding}
            usedFallback={usedFallback}
            onSelect={selectExpression}
            onSpeak={handleSpeak}
            isSpeaking={isSpeaking}
            ttsProvider={provider}
          />
        )}

        {/* ── Concept Board ── */}
        <ConceptBoard
          selectedIds={selectedConcepts.map((c) => c.id)}
          onToggle={handleTileToggle}
          canAddMore={canAddMore}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-3 text-center">
        <p className="text-xs text-slate-600">
          SWARA AAC · AI SUGGESTS. USER DECIDES.
        </p>
      </footer>
    </div>
  );
}
