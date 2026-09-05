/**
 * Literal builder — converts selected concepts directly to text.
 *
 * CRITICAL: This function must NEVER call the LLM.
 * The literal path is:
 *   CONCEPTS → LITERAL TEXT → TTS
 *
 * It preserves exactly what the user selected.
 * No rewriting. No inference. No additional meaning.
 *
 * Example: Doctor + Morning + Leg + Hurt → "Doctor. Morning. Leg. Hurt."
 */
import type { SelectedConcept } from '@/types/intent';

/**
 * Converts selected concepts to a simple literal phrase.
 * Each concept becomes a word or short phrase, separated by periods.
 */
export function buildLiteralPhrase(concepts: SelectedConcept[]): string {
  if (concepts.length === 0) return '';
  return concepts.map((c) => c.label).join('. ') + '.';
}

/**
 * Builds a slightly more readable literal phrase for display purposes.
 * Still contains ONLY selected concepts — no added words.
 */
export function buildLiteralDisplayText(concepts: SelectedConcept[]): string {
  if (concepts.length === 0) return '';
  return concepts.map((c) => c.label).join(' · ');
}
