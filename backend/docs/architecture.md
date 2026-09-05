# SWARA Architecture

## System Overview

SWARA is an AI-powered AAC (Augmentative and Alternative Communication) system. The architecture is built around a single design principle:

> **AI SUGGESTS. USER DECIDES.**

Every AI-generated expression must be explicitly approved by the user before any speech occurs. The Emergency tile is the only deliberate exception.

---

## Communication Pipeline

```
USER SELECTS CONCEPTS (Tiles)
         ↓
   CONCEPT STRIP
   (concepts visible, caregiver notified via BroadcastChannel)
         ↓
         ├──── EXPRESS (AI path) ──────────────────────────────┐
         │       ↓                                             │
         │  /api/expand                                        │
         │       ↓                                             │
         │  buildStructuredIntent()                            │
         │  (concepts + constraints for LLM)                   │
         │       ↓                                             │
         │  TRY GROQ (3-second timeout)                        │
         │       ↓ success          ↓ failure/timeout          │
         │  parseAndValidate()   generateFallbackExpressions()  │
         │       ↓ invalid tone      ↓                         │
         │  generateFallback()   → 3 expressions                │
         │       ↓                                             │
         │  DISPLAY 3 CANDIDATES (no auto-speech)              │
         │       ↓                                             │
         │  USER SELECTS ONE                                   │
         │       ↓                                             │
         │  USER PRESSES SPEAK                                 │
         │       ↓                                             │
         └──────────────────────────────────────────────────► │
                                                               │
         ├──── SPEAK LITERALLY (no LLM) ───────────────────── │
         │       ↓                                             │
         │  buildLiteralPhrase()                               │
         │  "Doctor. Morning. Leg. Hurt."                      │
         │       ↓                                             │
         └──────────────────────────────────────────────────► │
                                                               ↓
                                                         /api/tts
                                                               ↓
                                                     ElevenLabs (8s timeout)
                                                               ↓ success   ↓ failure
                                                          audio data    {fallbackText}
                                                               ↓             ↓
                                                         PLAY AUDIO   window.speechSynthesis
                                                         (HTML Audio) (labeled "Browser TTS")


EMERGENCY TILE (always separate)
         ↓
   EMERGENCY_CONFIG.ttsText (predefined, fixed)
         ↓
   /api/emergency (no LLM, no concept selection)
         ↓
   IMMEDIATE AUDIO (no confirmation)
```

---

## AI Safety Architecture

### Problem
LLMs can introduce unsupported facts into generated text (hallucination). In an AAC context, this is especially harmful — the user cannot easily correct words put in their mouth.

### Mitigation Layers

1. **Structured Intent** (`lib/intent/intent-builder.ts`)
   - Converts selected concepts into a typed `StructuredIntent` object
   - Includes explicit negative constraints (what the LLM must NOT add)

2. **Constrained Prompting** (`lib/ai/prompt-builder.ts`)
   - System prompt lists exactly what facts are and are not present
   - States the allowed tone pool explicitly

3. **Response Validation** (`lib/ai/response-parser.ts`)
   - Validates JSON schema, tone labels, text presence
   - Rejects any response with tones not in the fixed pool
   - Rejects malformed responses

4. **Local Fallback** (`lib/ai/fallback.ts`)
   - Completely local, no network required
   - Template-based, guaranteed no unsupported facts
   - Used on any LLM failure, timeout, or validation failure

5. **Fixed Tone Pool** (`data/tones.ts`)
   - 7 allowed tone labels, application-controlled
   - LLM cannot invent new tone names

6. **User Approval Boundary** (UI enforcement)
   - Selecting an expression does NOT trigger speech
   - An explicit SPEAK action is required

7. **Literal Fallback** (`lib/intent/literal-builder.ts`)
   - Zero LLM involvement
   - Joins concept labels with periods — exactly what was selected

8. **Emergency Isolation**
   - Predefined phrase from `data/emergency.ts`
   - Routes through `/api/emergency`, not `/api/expand`
   - No LLM call on the emergency path

---

## Caregiver Synchronization

Uses the **BroadcastChannel API** — no server required.

```
USER PAGE (localhost:3000)
  useConceptSelection hook
    → selectedConcepts changes
    → BroadcastChannel('swara-caregiver-sync').postMessage()

CAREGIVER PAGE (localhost:3000/caregiver)
  useCaregiverSync hook
    → BroadcastChannel('swara-caregiver-sync').onmessage
    → setState()
    → component re-renders
```

**Message types:**
- `CONCEPTS_UPDATE` — fires on every concept selection change (before speech)
- `EXPRESSION_SELECTED` — fires when user picks a candidate
- `SPEAKING` — fires just before audio plays
- `CLEARED` — fires when concept strip is cleared

**Limitation:** Works only within the same browser and device. Production would use WebSocket + server state.

---

## TTS Architecture

```
Frontend
  useTTS.speak(text)
    → POST /api/tts (text, language)

Backend (/api/tts)
  → Validate input
  → Check environment variables
  → Call ElevenLabs (8s timeout)
    ↓ success: return { audioBase64, provider: 'elevenlabs' }
    ↓ failure: return { error, fallbackText, provider: 'browser-fallback' }

Frontend (on success)
  → new Audio('data:audio/mpeg;base64,...').play()

Frontend (on failure)
  → window.speechSynthesis.speak(utterance)
  → UI labels this as "Browser TTS" not "ElevenLabs"
```

The ElevenLabs API key is **never exposed** to the browser. The Next.js API route acts as a secure proxy.

---

## Data Architecture

The tile board is entirely data-driven:

```
data/concepts.ts  →  CONCEPTS[]  →  ConceptBoard  →  ConceptTile (reusable)
```

No tile is hardcoded as a separate component. Adding a new tile means adding one object to `CONCEPTS[]`.

---

## File Structure Rationale

| Directory | Purpose |
|---|---|
| `/app/api` | Server-side endpoints — keeps API keys server-side |
| `/lib/ai` | LLM abstraction layer — swap provider by changing `groq-client.ts` only |
| `/lib/intent` | Intent building and literal phrase generation |
| `/lib/tts` | ElevenLabs client |
| `/data` | Application-controlled data: concepts, tones, emergency, languages |
| `/types` | TypeScript interfaces — shared across UI and API |
| `/hooks` | React state management — connects UI to API/services |
| `/components` | UI components — organized by feature domain |
