/**
 * Builds the system prompt and user message for LLM expression generation.
 *
 * The prompt is engineered to:
 * 1. Constrain the LLM to only the fixed tone pool
 * 2. Prevent semantic drift / hallucination
 * 3. Return a machine-parseable JSON schema
 */
import type { StructuredIntent } from '@/types/intent';
import { TONE_POOL } from '@/data/tones';
import type { SupportedLanguage } from '@/data/languages';

export interface LLMPrompt {
  systemPrompt: string;
  userMessage: string;
}

export function buildLLMPrompt(
  intent: StructuredIntent,
  language: SupportedLanguage = 'en'
): LLMPrompt {
  const toneList = TONE_POOL.join(', ');
  const conceptList = intent.concepts
    .map((c) => `- ${c.label} (type: ${c.semanticType})`)
    .join('\n');
  const constraintList = intent.constraints.map((c) => `- ${c}`).join('\n');

  const languageInstruction =
    language === 'en'
      ? 'Respond in English.'
      : language === 'hi'
      ? 'Respond in Hindi (Devanagari script).'
      : 'Respond in Tamil (Tamil script).';

  const systemPrompt = `You are a communication assistant for a person using an AAC (Augmentative and Alternative Communication) system.

Your task: Generate exactly 3 short, natural expressions for the user based ONLY on the concepts they selected.

CRITICAL SAFETY RULES — READ CAREFULLY:
- You MUST only use the exact concepts provided. Do NOT add any facts, events, causes, times, people, diagnoses, or actions that are not in the selected concepts.
- The user cannot correct you if you put wrong words in their mouth. Accuracy is essential.
- Do NOT claim hallucinations are impossible — they are possible. Minimize them by sticking strictly to the given concepts.

TONE RULES:
- Choose 3 different tones from this EXACT list: ${toneList}
- Do NOT invent new tone names. Only use tones from the list above.
- Choose tones that are contextually relevant to the concepts.

OUTPUT FORMAT — respond with ONLY valid JSON, no other text:
{
  "expressions": [
    { "tone": "TONE_FROM_LIST", "text": "Expression text here." },
    { "tone": "TONE_FROM_LIST", "text": "Expression text here." },
    { "tone": "TONE_FROM_LIST", "text": "Expression text here." }
  ]
}

${languageInstruction}`;

  const userMessage = `Selected concepts:
${conceptList}

Intent summary: ${intent.intentSummary}

Constraints — do NOT violate these:
${constraintList}

Generate 3 expressions now.`;

  return { systemPrompt, userMessage };
}
