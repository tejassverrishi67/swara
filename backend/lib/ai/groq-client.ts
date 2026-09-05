/**
 * Groq LLM client — server-side only.
 *
 * This is the ONLY file that contains Groq-specific code.
 * Swapping providers means replacing this file only.
 * All callers use the generateExpressions() interface.
 *
 * Architecture:
 *   TRY GROQ (3-second timeout)
 *   ↓ success: parse + validate → return expressions
 *   ↓ failure: return null → caller uses local fallback
 */
import Groq from 'groq-sdk';
import type { StructuredIntent } from '@/types/intent';
import type { Expression } from '@/types/expression';
import { buildLLMPrompt } from './prompt-builder';
import { parseAndValidateLLMResponse } from './response-parser';
import type { SupportedLanguage } from '@/data/languages';

/** Maximum time to wait for Groq before falling back. */
const LLM_TIMEOUT_MS = 3000;

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Attempts to generate expressions via Groq.
 * Returns null if the API key is missing, the call times out,
 * throws an exception, or returns an invalid response.
 *
 * The caller MUST fall back to generateFallbackExpressions() on null.
 */
export async function generateExpressionsViaGroq(
  intent: StructuredIntent,
  language: SupportedLanguage = 'en'
): Promise<Expression[] | null> {
  const client = getGroqClient();
  if (!client) return null;

  const { systemPrompt, userMessage } = buildLLMPrompt(intent, language);

  try {
    const result = await withTimeout(
      client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4, // Low temperature for more controlled, predictable output
        max_tokens: 512,
        response_format: { type: 'json_object' },
      }),
      LLM_TIMEOUT_MS
    );

    const rawContent = result.choices[0]?.message?.content;
    if (!rawContent) return null;

    const parsed = parseAndValidateLLMResponse(rawContent);
    if (!parsed.success) {
      console.warn('[groq-client] Invalid LLM response:', parsed.reason);
      return null;
    }

    return parsed.expressions;
  } catch (err) {
    if (err instanceof Error && err.message === 'LLM_TIMEOUT') {
      console.warn('[groq-client] Groq timed out after', LLM_TIMEOUT_MS, 'ms');
    } else {
      console.warn('[groq-client] Groq call failed:', err);
    }
    return null;
  }
}

/** Wraps a promise with a hard timeout. Throws Error('LLM_TIMEOUT') if exceeded. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('LLM_TIMEOUT')),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}
