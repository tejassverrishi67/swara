import type { SemanticType } from '@/types/concept';

/**
 * A validated, structured representation of user intent built from selected concepts.
 * Passed to the LLM as structured context to reduce semantic drift.
 */
export interface StructuredIntent {
  /** The raw selected concepts in order of selection */
  concepts: SelectedConcept[];
  /** Human-readable summary for the LLM system prompt */
  intentSummary: string;
  /**
   * Explicit constraints derived from the concepts.
   * These are injected into the system prompt to prevent hallucination.
   */
  constraints: string[];
}

export interface SelectedConcept {
  id: string;
  label: string;
  semanticType: SemanticType;
  category: string;
}
