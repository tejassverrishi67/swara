/**
 * ElevenLabs TTS client — server-side only.
 *
 * The API key is never exposed to the browser.
 * The frontend calls /api/tts which proxies through this service.
 *
 * Returns the audio as a Buffer (MP3) on success, null on failure.
 */

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const TTS_TIMEOUT_MS = 8000;

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
}

function getConfig(): ElevenLabsConfig | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) return null;
  return { apiKey, voiceId };
}

/**
 * Generates speech audio via ElevenLabs.
 * Returns audio Buffer on success, null if unconfigured or request fails.
 * Applies a hard timeout — never hangs the demo.
 */
export async function generateSpeechViaElevenLabs(text: string): Promise<Buffer | null> {
  const config = getConfig();
  if (!config) return null;

  const url = `${ELEVENLABS_API_URL}/${config.voiceId}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
      TTS_TIMEOUT_MS
    );

    if (!response.ok) {
      console.warn('[elevenlabs] API returned', response.status, response.statusText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn('[elevenlabs] TTS call failed:', err);
    return null;
  }
}

export function isElevenLabsConfigured(): boolean {
  return !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}
