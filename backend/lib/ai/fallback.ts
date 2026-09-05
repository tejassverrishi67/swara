/**
 * Local fallback for AI expression generation.
 *
 * This runs entirely locally — no API key, no network, no external SDK.
 * It is the foundation that the real LLM is layered on top of.
 *
 * When the LLM times out, fails, or returns invalid output,
 * this function produces a valid response in the correct schema.
 *
 * The fallback NEVER adds unsupported facts. It only uses the
 * exact concepts the user selected.
 */
import type { Expression } from '@/types/expression';
import type { StructuredIntent } from '@/types/intent';
import { TONE_POOL, type Tone } from '@/data/tones';

/**
 * Generates 3 fallback expressions from a structured intent.
 * Uses template-based generation — purely deterministic, no AI.
 */
export function generateFallbackExpressions(intent: StructuredIntent): Expression[] {
  const labels = intent.concepts.map((c) => c.label);
  const literalPhrase = labels.join('. ') + '.';

  // Determine which 3 tones are most relevant to the concept types
  const tones = selectFallbackTones(intent);

  return [
    {
      tone: tones[0],
      text: buildFallbackText(labels, tones[0]),
    },
    {
      tone: tones[1],
      text: buildFallbackText(labels, tones[1]),
    },
    {
      tone: tones[2],
      // Always include a purely literal option in fallback
      text: literalPhrase,
    },
  ];
}

/**
 * Selects 3 contextually appropriate tones from the fixed pool
 * based on the semantic types present in the intent.
 */
function selectFallbackTones(intent: StructuredIntent): [Tone, Tone, Tone] {
  const semanticTypes = new Set(intent.concepts.map((c) => c.semanticType));
  const hasSymptom = semanticTypes.has('symptom') || semanticTypes.has('body-part');
  const hasUrgentNeed = semanticTypes.has('need') || semanticTypes.has('action');
  const hasPerson = semanticTypes.has('person');
  const hasEmotion = semanticTypes.has('emotion');
  const hasSocial = semanticTypes.has('social');

  if (hasSymptom && hasPerson) return ['DIRECT', 'POLITE', 'WARM'];
  if (hasSymptom) return ['DIRECT', 'URGENT', 'POLITE'];
  if (hasUrgentNeed) return ['DIRECT', 'POLITE', 'FORMAL'];
  if (hasEmotion) return ['WARM', 'REASSURING', 'CASUAL'];
  if (hasSocial) return ['CASUAL', 'WARM', 'POLITE'];
  return ['DIRECT', 'POLITE', 'CASUAL'];
}

/**
 * Builds a simple fallback expression from concept labels.
 * Uses minimal sentence structure — only the concepts, joined differently per tone.
 * Never adds facts not present in the concepts.
 */
function buildFallbackText(labels: string[], tone: Tone): string {
  const joined = labels.join(', ');

  switch (tone) {
    case 'DIRECT':
      return `${labels.join('. ')}.`;
    case 'POLITE':
      return `${joined}.`;
    case 'WARM':
      return `${joined}.`;
    case 'FORMAL':
      return `Regarding: ${joined}.`;
    case 'CASUAL':
      return `${joined}.`;
    case 'URGENT':
      return `${labels.join('! ')}!`;
    case 'REASSURING':
      return `${joined}.`;
    default:
      return `${labels.join('. ')}.`;
  }
}
