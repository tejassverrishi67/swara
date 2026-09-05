/**
 * Supported languages in SWARA.
 * The LLM and TTS are instructed to respond in the selected language.
 */

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
};

export const LANGUAGE_LOCALE: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
