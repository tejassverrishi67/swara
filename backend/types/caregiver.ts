import type { SelectedConcept } from '@/types/intent';
import type { Expression } from '@/types/expression';

/**
 * Message sent over BroadcastChannel from user page to caregiver page.
 * The caregiver view updates on every concept selection change —
 * before any sentence is generated or spoken.
 */
export type CaregiverMessage =
  | { type: 'CONCEPTS_UPDATE'; concepts: SelectedConcept[] }
  | { type: 'EXPRESSION_SELECTED'; expression: Expression | null }
  | { type: 'SPEAKING'; text: string; isLiteral: boolean }
  | { type: 'CLEARED' };

/**
 * Local state maintained by the caregiver view.
 */
export interface CaregiverState {
  concepts: SelectedConcept[];
  selectedExpression: Expression | null;
  lastSpoken: { text: string; isLiteral: boolean } | null;
  isConnected: boolean;
}
