import type { Tone } from '@/data/tones';

/**
 * A single AI-generated expression candidate.
 * The tone must always come from the fixed TONE_POOL — never LLM-invented.
 */
export interface Expression {
  tone: Tone;
  text: string;
}

/**
 * The full response from /api/expand.
 * Always contains exactly 3 expressions when successful.
 * usedFallback=true means the local fallback was used (LLM failed/timed out).
 */
export interface ExpandResponse {
  expressions: Expression[];
  /** True if local fallback was used instead of the LLM */
  usedFallback: boolean;
}

export interface ExpandRequest {
  concepts: Array<{
    id: string;
    label: string;
    semanticType: string;
    category: string;
  }>;
  language?: 'en' | 'hi' | 'ta';
}
