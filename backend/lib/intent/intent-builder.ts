/**
 * Builds a StructuredIntent from the user's selected concepts.
 *
 * The StructuredIntent is passed to the LLM system prompt to:
 * 1. Communicate exactly what the user selected
 * 2. Generate explicit constraints that prevent hallucination
 * 3. Provide a readable summary for context
 */
import type { StructuredIntent, SelectedConcept } from '@/types/intent';

export function buildStructuredIntent(concepts: SelectedConcept[]): StructuredIntent {
  const intentSummary = buildIntentSummary(concepts);
  const constraints = buildConstraints(concepts);

  return {
    concepts,
    intentSummary,
    constraints,
  };
}

function buildIntentSummary(concepts: SelectedConcept[]): string {
  if (concepts.length === 0) return 'No concepts selected.';
  const labels = concepts.map((c) => c.label);
  return `The user selected these concepts: ${labels.join(', ')}.`;
}

/**
 * Generates explicit negative constraints for the system prompt.
 * These tell the LLM what it must NOT add to the generated expressions.
 */
function buildConstraints(concepts: SelectedConcept[]): string[] {
  const selectedLabels = new Set(concepts.map((c) => c.label.toLowerCase()));
  const selectedSemanticTypes = new Set(concepts.map((c) => c.semanticType));

  const constraints: string[] = [
    'Do NOT add any facts, events, causes, diagnoses, or actions not present in the selected concepts.',
    'Do NOT invent time references unless a time concept was explicitly selected.',
    'Do NOT invent people or relationships not in the selected concepts.',
    'Do NOT suggest a diagnosis, medical history, or clinical assessment.',
    'Do NOT add qualifying adverbs or adjectives not supported by the selected concepts.',
    'Only use the exact concepts provided — do not infer additional meaning.',
  ];

  // Add specific constraints based on what was NOT selected
  if (!selectedSemanticTypes.has('time')) {
    constraints.push('No time was selected — do NOT introduce time references (yesterday, today, last night, etc.).');
  }

  if (!selectedSemanticTypes.has('person')) {
    constraints.push('No person was selected — do NOT introduce named people or relationships.');
  }

  if (!selectedSemanticTypes.has('action')) {
    constraints.push('No action was selected — do NOT introduce verbs implying specific activities (walking, falling, etc.).');
  }

  return constraints;
}
