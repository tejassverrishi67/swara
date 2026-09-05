/**
 * Request body for POST /api/tts
 */
export interface TTSRequest {
  text: string;
  language?: 'en' | 'hi' | 'ta';
  /** If true, this is the emergency phrase — highest priority */
  emergency?: boolean;
}

/**
 * Successful TTS response — contains audio as base64-encoded MP3.
 */
export interface TTSSuccessResponse {
  audioBase64: string;
  /** Which provider generated this audio */
  provider: 'elevenlabs' | 'browser-fallback';
}

/**
 * Error response from /api/tts.
 * The frontend should fall back to browser SpeechSynthesis when this is received.
 */
export interface TTSErrorResponse {
  error: string;
  /** Text that should be passed to browser SpeechSynthesis as fallback */
  fallbackText: string;
  provider: 'browser-fallback';
}

export type TTSResponse = TTSSuccessResponse | TTSErrorResponse;

export function isTTSError(r: TTSResponse): r is TTSErrorResponse {
  return 'error' in r;
}
