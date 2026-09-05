/**
 * POST /api/emergency
 *
 * Emergency TTS endpoint — completely isolated from the AI pipeline.
 *
 * Path:
 *   EMERGENCY TILE → /api/emergency → PREDEFINED PHRASE → TTS → IMMEDIATE AUDIO
 *
 * This endpoint:
 * - Does NOT call the LLM
 * - Does NOT accept arbitrary text (uses only the predefined phrase)
 * - Does NOT require concept selection
 * - Does NOT require confirmation
 *
 * It is the deliberate exception to the normal confirmation rule.
 */
import { NextRequest, NextResponse } from 'next/server';
import { EMERGENCY_CONFIG } from '@/data/emergency';
import { generateSpeechViaElevenLabs, isElevenLabsConfigured } from '@/lib/tts/elevenlabs';

export async function POST(_req: NextRequest) {
  // The emergency phrase is fixed — never user-provided, never LLM-generated
  const text = EMERGENCY_CONFIG.ttsText;

  if (!isElevenLabsConfigured()) {
    return NextResponse.json({
      error: 'ElevenLabs not configured',
      fallbackText: text,
      provider: 'browser-fallback',
      phrase: EMERGENCY_CONFIG.displayText,
    });
  }

  const audioBuffer = await generateSpeechViaElevenLabs(text);

  if (!audioBuffer) {
    return NextResponse.json({
      error: 'TTS generation failed',
      fallbackText: text,
      provider: 'browser-fallback',
      phrase: EMERGENCY_CONFIG.displayText,
    });
  }

  return NextResponse.json({
    audioBase64: audioBuffer.toString('base64'),
    provider: 'elevenlabs',
    phrase: EMERGENCY_CONFIG.displayText,
  });
}
