# API Reference

All API routes are Next.js App Router route handlers at `/app/api/`.

---

## POST /api/expand

Generates 3 tone-aware expression candidates from selected concepts.

### Request
```json
{
  "concepts": [
    {
      "id": "person-doctor",
      "label": "Doctor",
      "semanticType": "person",
      "category": "people"
    },
    {
      "id": "time-morning",
      "label": "Morning",
      "semanticType": "time",
      "category": "time-degree"
    }
  ],
  "language": "en"
}
```

### Response (success)
```json
{
  "expressions": [
    { "tone": "DIRECT",  "text": "Doctor. Morning." },
    { "tone": "POLITE",  "text": "Good morning, doctor." },
    { "tone": "WARM",    "text": "Morning, doctor." }
  ],
  "usedFallback": false
}
```

### Response (LLM failed, local fallback used)
```json
{
  "expressions": [
    { "tone": "DIRECT",  "text": "Doctor. Morning." },
    { "tone": "POLITE",  "text": "Doctor, Morning." },
    { "tone": "FORMAL",  "text": "Regarding: Doctor, Morning." }
  ],
  "usedFallback": true
}
```

### Error responses
- `400` — missing concepts, empty array, or exceeds 10 concepts

### Notes
- `usedFallback: true` means Groq timed out (>3s), threw an exception, returned malformed JSON, returned invalid tones, or was unconfigured.
- The frontend always receives a valid `expressions[]` array — never a 500 from LLM failure.
- Tone labels always come from the fixed pool: `DIRECT | POLITE | WARM | FORMAL | CASUAL | URGENT | REASSURING`

---

## POST /api/tts

Secure ElevenLabs TTS proxy. The API key never reaches the browser.

### Request
```json
{
  "text": "Good morning, doctor. The pain in my leg is worse today.",
  "language": "en"
}
```

### Response (ElevenLabs success)
```json
{
  "audioBase64": "<base64-encoded MP3>",
  "provider": "elevenlabs"
}
```

### Response (ElevenLabs failed or unconfigured)
```json
{
  "error": "ElevenLabs not configured",
  "fallbackText": "Good morning, doctor. The pain in my leg is worse today.",
  "provider": "browser-fallback"
}
```

### Notes
- On `provider: "browser-fallback"`, the frontend uses `window.speechSynthesis` and labels it clearly as "Browser TTS".
- Maximum text length: 1000 characters.
- ElevenLabs timeout: 8 seconds.

---

## POST /api/emergency

Emergency speech endpoint. **Does not call the LLM.**

### Request
No body required.

### Response (ElevenLabs available)
```json
{
  "audioBase64": "<base64-encoded MP3>",
  "provider": "elevenlabs",
  "phrase": "I NEED HELP RIGHT NOW"
}
```

### Response (ElevenLabs unavailable)
```json
{
  "error": "ElevenLabs not configured",
  "fallbackText": "I need help right now. Please come immediately.",
  "provider": "browser-fallback",
  "phrase": "I NEED HELP RIGHT NOW"
}
```

### Notes
- The emergency phrase is always `data/emergency.ts:EMERGENCY_CONFIG.ttsText`
- This endpoint does NOT accept custom text by design — the phrase is predefined.
- No confirmation is required for emergency speech.
