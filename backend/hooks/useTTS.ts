'use client';

/**
 * Manages TTS playback.
 *
 * Flow:
 *   speak(text) → POST /api/tts → play audio
 *   If /api/tts returns fallback error → use browser SpeechSynthesis
 *
 * The fallback is clearly labeled — the UI shows "Browser TTS" not "ElevenLabs".
 * Audio is never automatically played — callers must explicitly invoke speak().
 */
import { useState, useCallback, useRef } from 'react';
import type { TTSResponse } from '@/types/audio';
import { isTTSError } from '@/types/audio';
import type { SupportedLanguage } from '@/data/languages';
import { LANGUAGE_LOCALE } from '@/data/languages';

type TTSState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'playing'; provider: 'elevenlabs' | 'browser' }
  | { status: 'error'; message: string };

export function useTTS() {
  const [state, setState] = useState<TTSState>({ status: 'idle' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setState({ status: 'idle' });
  }, []);

  /** Speaks text via ElevenLabs (preferred) or browser TTS (fallback). */
  const speak = useCallback(
    async (text: string, language: SupportedLanguage = 'en') => {
      if (!text.trim()) return;
      stopAudio();
      setState({ status: 'loading' });

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language }),
        });

        const data: TTSResponse = await res.json();

        if ('audioBase64' in data && data.audioBase64) {
          // ElevenLabs audio — play via Audio element
          const audioSrc = `data:audio/mpeg;base64,${data.audioBase64}`;
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          setState({ status: 'playing', provider: 'elevenlabs' });
          audio.onended = () => setState({ status: 'idle' });
          audio.onerror = () => {
            setState({ status: 'error', message: 'Audio playback failed.' });
          };
          await audio.play();
        } else if (isTTSError(data)) {
          // Browser TTS fallback — clearly distinct from ElevenLabs
          useBrowserTTS(data.fallbackText ?? text, language, () =>
            setState({ status: 'idle' })
          );
          setState({ status: 'playing', provider: 'browser' });
        }
      } catch {
        // Network error — use browser TTS as last resort
        useBrowserTTS(text, language, () => setState({ status: 'idle' }));
        setState({ status: 'playing', provider: 'browser' });
      }
    },
    [stopAudio]
  );

  /** Speaks the emergency phrase via /api/emergency (bypasses normal TTS flow). */
  const speakEmergency = useCallback(async () => {
    stopAudio();
    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/emergency', { method: 'POST' });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        audioRef.current = audio;
        setState({ status: 'playing', provider: 'elevenlabs' });
        audio.onended = () => setState({ status: 'idle' });
        await audio.play();
      } else {
        useBrowserTTS(data.fallbackText, 'en', () => setState({ status: 'idle' }));
        setState({ status: 'playing', provider: 'browser' });
      }
    } catch {
      useBrowserTTS('I need help right now. Please come immediately.', 'en', () =>
        setState({ status: 'idle' })
      );
      setState({ status: 'playing', provider: 'browser' });
    }
  }, [stopAudio]);

  return {
    state,
    speak,
    speakEmergency,
    stopAudio,
    isLoading: state.status === 'loading',
    isPlaying: state.status === 'playing',
    provider: state.status === 'playing' ? state.provider : null,
  };
}

/** Uses browser Web Speech API. Clearly labeled, not disguised as ElevenLabs. */
function useBrowserTTS(text: string, language: SupportedLanguage, onEnd: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE_LOCALE[language];
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}
