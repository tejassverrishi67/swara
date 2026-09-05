# Swara

**Every other AAC tool gives you words. Swara gives you a sentence — in your tone, and you always get the final say before it's spoken.**

Swara is an AI-assisted communication tool for people who've lost reliable speech — after a stroke, a laryngectomy, or with conditions like ALS — but who still know exactly what they want to say.

Instead of building a sentence one slow tap at a time, you tap a few concepts. Swara offers you three different ways to say it. You pick one — or skip the AI entirely and say your exact words, no additions. Nothing is ever spoken until you choose it.

A hackathon build, moving fast and built with intent — see [Build status](#build-status) for exactly what's running today.

---

## The idea, in one flow

\`\`\`
Tap a few tiles          →   Get 3 ways to say it        →   You choose            →   It speaks
[Doctor][Morning]             "Doctor, my leg pain             "Good morning              (in the
[Leg][Hurt]                    is worse today."                 doctor..."                 tone
                               "Good morning doctor,                                        you
                                the pain in my leg is                                        picked)
                                much worse today."
                               "Morning doctor, my leg's
                                been giving me trouble
                                since last night."
\`\`\`

If none of the three feel right, there's always a **Speak Literally** button — it says exactly what you tapped, nothing more. The AI suggests. You decide. It never gets the final say.

A second screen — meant for a caregiver, nurse, or family member — shows the concepts forming in real time, before the sentence is even finished.

And one tile bypasses everything: a fixed **Emergency** button that speaks instantly, with no AI step in between, for the moments that can't wait two seconds.

---

## Architecture

Swara is built as two independent services, engineered in parallel for speed and resilience — the kind of split a production team makes deliberately, not by accident.

### \`/backend\` — the intelligence layer

A Next.js API doing the real work:

- Takes selected concepts and asks an LLM (Groq) to generate three sentences, each in a distinct tone
- Backed by an automatic local fallback — if the AI is slow or unavailable, a clean, correct sentence is generated instantly with zero dependency on the network
- Converts confirmed text into natural, expressive speech through ElevenLabs
- Backed by a second fallback to the browser's native voice engine, so speech output is never a single point of failure

Fully functional and independently verified.

### \`/frontend\` — the experience layer

A Vite + React app, built and validated against a fully mocked API contract — a standard pattern for building the interface and the intelligence in parallel without either side blocking the other:

- A tile board grouped into six categories (People, Body/Needs, Time/Degree, Function, Social, Emotion)
- A live concept strip with undo/clear
- The Emergency tile
- A live Caregiver View, synced instantly between browser tabs via the native \`BroadcastChannel\` API — no server round-trip required for that feature at all

Fully functional against its mock data layer, and built so that connecting it to the real backend is a scoped, well-defined swap rather than a rewrite.

### Bringing them together

Each service has been engineered and validated on its own — the backend proven against real AI and voice APIs, the frontend proven against a realistic mock contract shaped exactly like the real one. Final integration is the next milestone: aligning the two contracts and pointing the frontend at the live backend.

---

## Build status

**Live and verified:**
- AI-driven sentence expansion, three tones, with automatic fallback
- Real text-to-speech via ElevenLabs, with automatic fallback to native browser speech
- The complete tile-to-sentence interaction flow, end to end, on the frontend
- Real-time Caregiver View, synced across tabs

**On the roadmap:**
- Full backend integration (see above)
- Response caching for instant repeat playback and offline resilience
- Voice banking and cloning, so the spoken voice can be the user's own
- A dedicated icon set for the tile board

**By design, not in this build:**
- No accounts or login — this is a fast, frictionless communication tool, not a platform
- No database — session-based by design for this stage
- Single-device Caregiver View — built for the exact use case of a patient and a caregiver in the same room

---

## Running it locally

The two services run independently.

### Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env.local
# add your GROQ_API_KEY and ELEVENLABS_API_KEY to .env.local
npm run dev
\`\`\`

### Frontend

\`\`\`bash
cd frontend
pnpm install
pnpm dev
\`\`\`

The frontend runs immediately with no API keys required, powered by its built-in mock layer.

---

## Why this exists

People with aphasia, post-stroke speech loss, or ALS often know precisely what they want to say. What existing tools give them is either painfully slow — tap letter by letter — or painfully generic, a stranger's robotic voice standing in for their own. Swara is a focused answer to a specific problem: turning a handful of taps into a real sentence, in a tone the person chooses, while making sure they always hold the final say over what leaves their mouth.

---


