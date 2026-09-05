/**
 * Fixed application-controlled tone pool.
 *
 * IMPORTANT: The LLM is instructed to select from this list only.
 * Any LLM response containing a tone not in this pool is rejected
 * and the local fallback is used instead.
 *
 * Never allow the LLM to invent tone labels — this is a communication
 * safety system where predictable, user-understandable labels matter.
 */
export const TONE_POOL = [
  'DIRECT',
  'POLITE',
  'WARM',
  'FORMAL',
  'CASUAL',
  'URGENT',
  'REASSURING',
] as const;

export type Tone = (typeof TONE_POOL)[number];

export function isValidTone(value: unknown): value is Tone {
  return typeof value === 'string' && (TONE_POOL as readonly string[]).includes(value);
}

/** Human-readable descriptions shown in the UI for each tone */
export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  DIRECT: 'Clear and to the point',
  POLITE: 'Courteous and considerate',
  WARM: 'Friendly and caring',
  FORMAL: 'Professional and respectful',
  CASUAL: 'Relaxed and informal',
  URGENT: 'Pressing and immediate',
  REASSURING: 'Calm and comforting',
};

/** Tailwind color classes for tone badges */
export const TONE_COLORS: Record<Tone, string> = {
  DIRECT: 'bg-slate-700 text-slate-100 border-slate-500',
  POLITE: 'bg-indigo-900/60 text-indigo-200 border-indigo-500',
  WARM: 'bg-orange-900/60 text-orange-200 border-orange-500',
  FORMAL: 'bg-blue-900/60 text-blue-200 border-blue-500',
  CASUAL: 'bg-emerald-900/60 text-emerald-200 border-emerald-500',
  URGENT: 'bg-red-900/60 text-red-200 border-red-500',
  REASSURING: 'bg-violet-900/60 text-violet-200 border-violet-500',
};
