/**
 * Emergency configuration for SWARA.
 *
 * The emergency path is completely separate from the AI pipeline:
 *   EMERGENCY TILE → PREDEFINED_PHRASE → TTS → IMMEDIATE AUDIO
 *
 * No LLM. No concept selection. No confirmation. No delay.
 */

export const EMERGENCY_PHRASE = "I need help right now. Please come immediately.";

export const EMERGENCY_DISPLAY_TEXT = "I NEED HELP RIGHT NOW";

/** Shorter version for TTS to be direct and clear */
export const EMERGENCY_TTS_TEXT = "I need help right now. Please come immediately.";

export const EMERGENCY_CONFIG = {
  phrase: EMERGENCY_PHRASE,
  displayText: EMERGENCY_DISPLAY_TEXT,
  ttsText: EMERGENCY_TTS_TEXT,
  /**
   * Emergency bypasses ALL normal flow:
   * - concept selection  ✗
   * - LLM expansion      ✗
   * - candidate display  ✗
   * - confirmation       ✗ (deliberate exception to the confirmation rule)
   */
  bypassesConfirmation: true as const,
  bypassesLLM: true as const,
} as const;
