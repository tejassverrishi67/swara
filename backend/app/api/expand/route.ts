/**
 * POST /api/expand
 *
 * Accepts selected concepts, builds a StructuredIntent,
 * attempts Groq LLM generation, falls back to local generator on any failure.
 *
 * The frontend always receives a valid response — never a 500 error
 * from LLM failure. usedFallback=true indicates the local path was used.
 *
 * Hard timeout: 3 seconds on the Groq call (enforced inside groq-client.ts).
 */
import { NextRequest, NextResponse } from 'next/server';
import type { ExpandRequest, ExpandResponse } from '@/types/expression';
import type { SelectedConcept } from '@/types/intent';
import type { SemanticType } from '@/types/concept';
import { buildStructuredIntent } from '@/lib/intent/intent-builder';
import { generateExpressionsViaGroq } from '@/lib/ai/groq-client';
import { generateFallbackExpressions } from '@/lib/ai/fallback';

export async function POST(req: NextRequest) {
  let body: ExpandRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { concepts, language = 'en' } = body;

  if (!Array.isArray(concepts) || concepts.length === 0) {
    return NextResponse.json(
      { error: 'At least one concept must be selected.' },
      { status: 400 }
    );
  }

  if (concepts.length > 10) {
    return NextResponse.json(
      { error: 'Maximum 10 concepts per request.' },
      { status: 400 }
    );
  }

  // Cast the incoming concepts to SelectedConcept[] (semanticType validated by Concept data layer)
  const typedConcepts: SelectedConcept[] = concepts.map((c) => ({
    ...c,
    semanticType: c.semanticType as SemanticType,
  }));

  // Build structured intent (provides context + constraints for the LLM)
  const intent = buildStructuredIntent(typedConcepts);

  // Attempt LLM generation — returns null on any failure (timeout, error, bad response)
  let usedFallback = false;
  let expressions = await generateExpressionsViaGroq(intent, language);

  if (!expressions) {
    // Use local fallback — always works, no network required
    expressions = generateFallbackExpressions(intent);
    usedFallback = true;
  }

  const response: ExpandResponse = { expressions, usedFallback };
  return NextResponse.json(response);
}
