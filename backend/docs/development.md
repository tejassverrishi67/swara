# Development Guide

## Prerequisites

- Node.js 18+
- npm 9+
- A Groq API key (https://console.groq.com) — free tier available
- An ElevenLabs API key (https://elevenlabs.io) — optional, browser TTS fallback works without it

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd swara

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in:
#   GROQ_API_KEY=your_groq_api_key
#   ELEVENLABS_API_KEY=your_elevenlabs_api_key
#   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# 4. Start development server
npm run dev
```

Open http://localhost:3000

---

## Running Without API Keys

SWARA works without any API keys configured:

- **Without GROQ_API_KEY**: AI expansion uses the local fallback generator. Expressions are template-based but contain no hallucinated facts. The UI shows "Local fallback" badge.
- **Without ELEVENLABS_API_KEY**: TTS uses browser `window.speechSynthesis`. The UI clearly labels this as "Browser TTS (fallback)".
- **Emergency tile**: Always works — falls back to browser TTS if ElevenLabs unavailable.

---

## Demo Preparation (Pre-warming Audio)

Before a live demo, pre-generate and cache the expected demo audio so it plays reliably without internet:

1. Start the server with valid API keys
2. Run the full demo journey once:
   - Select: Doctor + Morning + Leg + Hurt
   - Press Express → select POLITE expression → press SPEAK
   - Press SPEAK LITERALLY
   - Press EMERGENCY
3. All played audio is cached automatically in the browser IndexedDB
4. On subsequent plays, the cached audio is used

**Offline-capable after pre-warming:**
- Cached TTS audio
- Emergency phrase (browser TTS fallback always works)

**Always network-dependent:**
- New LLM generation (new concept combinations)
- New ElevenLabs TTS generation (uncached phrases)

---

## Caregiver View Testing

Open two browser windows or tabs:
1. http://localhost:3000 — main user interface
2. http://localhost:3000/caregiver — caregiver live view

Select concepts in the main window — they should appear in the caregiver view within ~100ms.

**Note:** BroadcastChannel requires same origin + same browser. Cross-device sync requires a WebSocket server (planned for future).

---

## Development Commands

```bash
npm run dev    # Development server with hot reload
npm run build  # Production build + TypeScript check
npm run lint   # ESLint
npm run start  # Start production server (after build)
```

---

## Adding New Concept Tiles

Add an entry to `data/concepts.ts`:

```typescript
{
  id: 'body-knee',
  label: 'Knee',
  category: 'body-needs',
  icon: '🦵',
  semanticType: 'body-part',
  languageVariants: { hi: 'घुटना', ta: 'மூட்டு' },
}
```

The tile board renders automatically — no component changes needed.

---

## Swapping the LLM Provider

Only `lib/ai/groq-client.ts` needs to change. The function signature stays the same:

```typescript
export async function generateExpressionsViaGroq(
  intent: StructuredIntent,
  language: SupportedLanguage
): Promise<Expression[] | null>
```

Replace with `generateExpressionsViaOpenAI` (or any provider) in `app/api/expand/route.ts`.
The prompt builder, response parser, fallback, and UI are all unchanged.
