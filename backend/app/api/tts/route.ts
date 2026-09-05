/**
 * POST /api/tts
 *
 * Secure backend proxy for ElevenLabs TTS.
 * The ElevenLabs API key is NEVER exposed to the browser.
 *
 * Flow:
 *   1. Validate request
 *   2. Call ElevenLabs (with timeout)
 *   3. Return audio as base64 MP3 on success
 *   4. Return { error, fallbackText } on failure — frontend uses browser TTS
 *
 * The frontend MUST NOT pretend browser TTS is ElevenLabs.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { TTSRequest } from '@/types/audio';
import { generateSpeechViaElevenLabs, isElevenLabsConfigured } from '@/lib/tts/elevenlabs';

export async function POST(req: NextRequest) {
  let body: TTSRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text } = body;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  if (text.length > 1000) {
    return NextResponse.json({ error: 'text exceeds 1000 character limit' }, { status: 400 });
  }

  // If ElevenLabs is not configured, tell the frontend to use browser TTS immediately
  if (!isElevenLabsConfigured()) {
    return NextResponse.json({
      error: 'ElevenLabs not configured',
      fallbackText: text.trim(),
      provider: 'browser-fallback',
    });
  }

  const audioBuffer = await generateSpeechViaElevenLabs(text.trim());

  if (!audioBuffer) {
    // ElevenLabs failed — tell frontend to fall back to browser TTS
    return NextResponse.json({
      error: 'TTS generation failed',
      fallbackText: text.trim(),
      provider: 'browser-fallback',
    });
  }

  return NextResponse.json({
    audioBase64: audioBuffer.toString('base64'),
    provider: 'elevenlabs',
  });
}
