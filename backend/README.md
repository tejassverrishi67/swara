# SWARA — AI-Powered AAC Communication System

> **AI SUGGESTS. USER DECIDES.**

SWARA is an AI-powered Augmentative and Alternative Communication (AAC) system for people who cannot reliably communicate through speech. It is designed to be fast, reliable, safe, and accessible — and to keep the user in full control of every word spoken on their behalf.

---

## Problem

People with conditions such as ALS, cerebral palsy, locked-in syndrome, or post-stroke aphasia often cannot speak or type effectively. Existing AAC systems are either:
- Too slow (requiring many taps to form a message)
- Too rigid (only pre-programmed phrases)
- Not intelligent enough to generate natural, context-aware sentences
- Or AI-powered in ways that introduce words the user never intended to say

SWARA addresses all four problems.

---

## Solution

SWARA gives users a **concept tile board** to select what they want to communicate. AI then suggests natural expressions — but the user always chooses and approves before any speech occurs.

**Core workflow:**

```
CONCEPT SELECTION
      ↓
INTENT UNDERSTANDING
      ↓
TONE-AWARE AI EXPANSION
      ↓
USER CHOICE
      ↓
TTS → COMMUNICATION
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 SWARA Frontend                  │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Concept  │  │ Express  │  │    Speak     │  │
│  │  Board   │→ │  Button  │→ │   Literally  │  │
│  └──────────┘  └────┬─────┘  └──────────────┘  │
│                     │                           │
│  ┌──────────────────▼──────────────────────┐    │
│  │           /api/expand                   │    │
│  │  Groq LLM (3s timeout) → Fallback       │    │
│  └──────────────────┬──────────────────────┘    │
│                     │ 3 expressions             │
│  ┌──────────────────▼──────────────────────┐    │
│  │        User Selects + Approves          │    │
│  └──────────────────┬──────────────────────┘    │
│                     │                           │
│  ┌──────────────────▼──────────────────────┐    │
│  │              /api/tts                   │    │
│  │  ElevenLabs → Browser TTS fallback      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │  EMERGENCY TILE (always separate path)     │ │
│  │  Fixed phrase → /api/emergency → TTS       │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

BroadcastChannel ──→ Caregiver View (localhost:3000/caregiver)
```

See [docs/architecture.md](./docs/architecture.md) for the complete pipeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| LLM | Groq (`llama-3.1-8b-instant`) via backend abstraction |
| TTS | ElevenLabs API (browser `speechSynthesis` fallback) |
| Real-time | BroadcastChannel API (no server required) |
| Icons | Lucide React |
| State | React `useReducer` + custom hooks |

---

## Repository Structure

```
/app
  page.tsx              ← Main AAC board (user interface)
  /caregiver/page.tsx   ← Caregiver live view
  /api
    /expand/route.ts    ← LLM expansion + fallback
    /tts/route.ts       ← ElevenLabs TTS proxy
    /emergency/route.ts ← Emergency phrase TTS

/components
  /aac                  ← ConceptTile, ConceptBoard, ConceptStrip, CategoryTabs
  /expressions          ← ExpressionCard, ExpressionPanel
  /emergency            ← EmergencyTile
  /caregiver            ← CaregiverBoard
  /ui                   ← ToneBadge, LoadingSpinner, ErrorBanner

/lib
  /ai                   ← groq-client, prompt-builder, response-parser, fallback
  /intent               ← intent-builder, literal-builder
  /tts                  ← elevenlabs client

/data
  concepts.ts           ← 67 concept tiles (data-driven)
  tones.ts              ← Fixed tone pool (application-controlled)
  emergency.ts          ← Emergency phrase config
  languages.ts          ← Supported languages

/types                  ← TypeScript interfaces
/hooks                  ← useConceptSelection, useExpressions, useTTS, useCaregiverSync
/docs                   ← architecture.md, api.md, development.md
```

---

## Setup

```bash
# 1. Clone
git clone <repo-url>
cd swara

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Fill in GROQ_API_KEY and ELEVENLABS_API_KEY

# 4. Run
npm run dev
# → http://localhost:3000
# → http://localhost:3000/caregiver (second tab)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Recommended | Groq API key — get at console.groq.com. Works without it (local fallback). |
| `ELEVENLABS_API_KEY` | Optional | ElevenLabs API key. Falls back to browser TTS if absent. |
| `ELEVENLABS_VOICE_ID` | Optional | ElevenLabs voice ID. Default: Rachel (`21m00Tcm4TlvDq8ikWAM`). |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/expand` | POST | LLM expansion → 3 tone-aware expressions |
| `/api/tts` | POST | ElevenLabs TTS proxy |
| `/api/emergency` | POST | Emergency phrase TTS (no LLM) |

See [docs/api.md](./docs/api.md) for full request/response schemas.

---

## AI Safety Approach

SWARA treats AI hallucination as a first-class concern for AAC.

**The problem:** LLMs can introduce words, events, or diagnoses that the user never selected. In an AAC context, users cannot easily correct words put in their mouth.

**Mitigation layers:**
1. **Structured intent** — concepts converted to typed representation with explicit constraints
2. **Constrained prompting** — system prompt lists what facts are NOT present
3. **Fixed tone pool** — 7 application-defined labels; LLM cannot invent new ones
4. **Response validation** — invalid tones, bad schema, or wrong count trigger fallback
5. **3-second timeout** — LLM never hangs the demo
6. **Local fallback** — template-based generator, zero network required, zero hallucination
7. **User approval boundary** — selecting an expression does NOT trigger speech
8. **Literal path** — concept labels joined with periods, bypasses LLM entirely

---

## Literal Fallback

The **SPEAK LITERALLY** button bypasses the AI entirely:

```
CONCEPTS → literal-builder.ts → "Doctor. Morning. Leg. Hurt." → TTS
```

No LLM call. No rewriting. Exactly what the user selected.

---

## Emergency Path

The Emergency tile is architecturally isolated from the AI pipeline:

```
EMERGENCY TILE → data/emergency.ts → /api/emergency → TTS → IMMEDIATE AUDIO
```

- No concept selection
- No LLM call
- No expression candidates
- No confirmation step (deliberate exception to the confirmation rule)

---

## Caregiver Synchronization

Uses the browser **BroadcastChannel API** — no server, no WebSocket:

- User selects concepts → concepts broadcast to caregiver view
- Caregiver sees **intent forming** before any sentence is generated
- Updates in ~100ms across same-browser tabs

---

## Implementation Status

| Feature | Status | Notes |
|---|---|---|
| Tile Board (67 tiles, 6 categories) | ✅ Implemented | Data-driven, not hardcoded |
| Concept Selection | ✅ Implemented | Real state, real toggle |
| Concept Strip | ✅ Implemented | Real-time display with removal |
| Structured Intent | ✅ Implemented | Semantic types + constraints |
| Local Fallback Generator | ✅ Implemented | No network required |
| Groq LLM Expansion | ✅ Implemented | 3-second timeout, validates tones |
| Fixed Tone Pool | ✅ Implemented | Application-controlled, 7 tones |
| Expression Selection | ✅ Implemented | No auto-speech on selection |
| Confirmation Before Speech | ✅ Implemented | Explicit SPEAK required |
| Speak Literally | ✅ Implemented | Zero LLM path |
| ElevenLabs TTS | ✅ Implemented | Secure backend proxy |
| Browser TTS Fallback | ✅ Implemented | Clearly labeled, not disguised |
| Emergency Tile | ✅ Implemented | Isolated pipeline, no confirmation |
| Caregiver Live View | ✅ Implemented | BroadcastChannel, real-time |
| Multi-language Support | ✅ Implemented | English, Hindi, Tamil |
| Message Banking | ⬜ Planned | MediaRecorder + IndexedDB |
| Offline Audio Cache | ⬜ Planned | IndexedDB TTS cache |
| Webcam Head-Pointer | ⬜ Future | Post-hackathon milestone |

---

## Known Limitations

- **Caregiver sync** is same-browser only — production needs WebSocket
- **Hallucination is reduced, not eliminated** — user approval remains essential
- **ElevenLabs multilingual** requires correct voice ID per language
- **BroadcastChannel** not supported in Safari on some iOS versions
- **Browser TTS** quality varies significantly by OS/browser

---

## Future Roadmap

1. **Message Banking** — MediaRecorder + IndexedDB (record personal phrases)
2. **Offline Audio Cache** — IndexedDB TTS cache for rehearsed phrases
3. **WebSocket Caregiver Sync** — cross-device real-time support
4. **Webcam Head-Pointer** — accessibility input for motor-impaired users
5. **Phrase History** — recall recent messages
6. **Custom Categories** — user-defined concept sets
7. **Switch Access** — single-switch scanning for AAC users

---

## Demo Journey

```
1. Open http://localhost:3000
2. Select: Doctor + Morning + Leg + Hurt
3. Concept strip updates immediately
4. Open http://localhost:3000/caregiver in another tab
5. Caregiver view shows the 4 concepts in real time
6. Press EXPRESS
7. Three expressions appear with tone badges (DIRECT, POLITE, WARM, etc.)
8. No audio plays automatically
9. Select the POLITE expression
10. Press SPEAK → audio plays
11. Press SPEAK LITERALLY → "Doctor. Morning. Leg. Hurt." plays (no LLM)
12. Press EMERGENCY → immediate speech, no confirmation
```

---

## Demo Instructions (Full)

See [docs/development.md](./docs/development.md) for:
- Setup with and without API keys
- Demo audio pre-warming procedure
- Caregiver view testing
- Adding new concept tiles

---

*Built for hackathon evaluation — genuine 30–40% vertical slice implementation.*
*Every feature listed as Implemented is functionally connected end-to-end.*
