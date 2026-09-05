/**
 * Parses and validates the LLM response JSON.
 *
 * If the response is malformed, has wrong schema, invalid tones,
 * missing fields, or wrong count — this returns null and the
 * caller falls back to the local fallback generator.
 *
 * The LLM must pass ALL validation checks or the response is rejected.
 */
import type { Expression } from '@/types/expression';
import { isValidTone } from '@/data/tones';

export interface ParseResult {
  success: true;
  expressions: Expression[];
}

export interface ParseError {
  success: false;
  reason: string;
}

export function parseAndValidateLLMResponse(raw: string): ParseResult | ParseError {
  // 1. Extract JSON from the response (LLM sometimes wraps in markdown)
  const jsonString = extractJSON(raw);
  if (!jsonString) {
    return { success: false, reason: 'No valid JSON found in response' };
  }

  // 2. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { success: false, reason: 'JSON parse failed' };
  }

  // 3. Validate top-level shape
  if (typeof parsed !== 'object' || parsed === null || !('expressions' in parsed)) {
    return { success: false, reason: 'Missing "expressions" key' };
  }

  const { expressions } = parsed as { expressions: unknown };

  if (!Array.isArray(expressions)) {
    return { success: false, reason: '"expressions" is not an array' };
  }

  // 4. Validate we got exactly 3
  if (expressions.length !== 3) {
    return {
      success: false,
      reason: `Expected 3 expressions, got ${expressions.length}`,
    };
  }

  // 5. Validate each expression
  const validatedExpressions: Expression[] = [];
  for (let i = 0; i < expressions.length; i++) {
    const expr = expressions[i];
    if (typeof expr !== 'object' || expr === null) {
      return { success: false, reason: `Expression ${i} is not an object` };
    }

    const { tone, text } = expr as Record<string, unknown>;

    if (typeof tone !== 'string' || !isValidTone(tone)) {
      return {
        success: false,
        reason: `Expression ${i} has invalid tone: "${tone}". Must be from fixed pool.`,
      };
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return { success: false, reason: `Expression ${i} has empty or missing text` };
    }

    validatedExpressions.push({ tone, text: text.trim() });
  }

  // 6. Check for duplicate tones
  const tones = validatedExpressions.map((e) => e.tone);
  if (new Set(tones).size !== tones.length) {
    return { success: false, reason: 'Duplicate tone labels found' };
  }

  return { success: true, expressions: validatedExpressions };
}

/** Extracts a JSON object from a string, handling markdown code blocks */
function extractJSON(raw: string): string | null {
  const trimmed = raw.trim();

  // Try direct parse first
  if (trimmed.startsWith('{')) return trimmed;

  // Strip markdown code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) return codeBlockMatch[1];

  // Try to find JSON object anywhere in the string
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return null;
}
