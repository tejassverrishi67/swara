# Swara — Master Frontend Build Prompt

**How to use this:** Paste this entire document as your first message to a coding assistant (Claude Code, Cursor, etc.). It defines the complete frontend for the Round 2 demo. This must work **standalone with mock data** right now — the real backend (built separately, see the matching backend master prompt) will be wired in later by swapping mock functions for real API calls. Do not let the assistant add features beyond what's listed here.

---

## PROJECT CONTEXT

You are building the frontend for **Swara**, an AAC (Augmentative and Alternative Communication) web app for adults who have lost reliable speech (stroke, aphasia, laryngectomy, ALS) but retain full cognition. The user taps a few concept tiles, sees three AI-suggested sentences in different tones, picks one (or asks to speak the raw concepts literally), and hears it spoken aloud. A second view shows a caregiver the concepts being selected in real time. One fixed emergency tile bypasses everything and speaks instantly.

This is a **hackathon demo frontend** — built to be rehearsed and reliable on stage, not to handle every edge case. Every design decision below prioritizes "always looks good in front of judges" over "handles arbitrary input."

**Critical constraint: build this to run completely standalone, with fake data, right now.** The backend does not exist yet / is being built in parallel. Every place the frontend would call a real API must instead call a mock function that returns realistic fake data in the exact shape the real backend will eventually return. This lets the frontend be fully built, tested, and rehearsed before integration — and integration later should mean changing only the inside of a few functions, not restructuring the app.

---

## STACK

- **Framework:** Next.js 14+ App Router, TypeScript, Tailwind CSS
- **State:** React `useState`/`useReducer` only — no Redux, no Zustand, no external state library
- **No backend calls yet.** Everything data-related goes through mock functions (defined below) that you will later swap for real `fetch` calls
- **No database, no login, no persistence across page reloads.** All state lives in memory for the session only

---

## SCREENS TO BUILD

### Screen 1: Main Communication Screen (the patient-facing view)

This is the primary screen and the one shown on stage most of the time.

**Layout, top to bottom:**
1. **Concept strip** — a horizontal bar showing currently selected tiles in order (e.g., `Doctor → Morning → Leg → Hurt`), with an Undo button (removes the last tile) and a Clear button (removes all).
2. **Tile board** — a grid of ~30–40 tappable tiles, grouped into categories with subtle color coding: People, Body/Needs, Time/Degree, Function, Social, Emotion. Tapping a tile adds it to the concept strip.
3. **Candidate tray** — appears once at least 2 concepts are selected and the user requests suggestions (a "Suggest" button, or auto-trigger after a short pause — pick whichever feels smoother, but make the trigger obvious). Shows 3 sentence cards, each labeled with its tone (e.g., "Blunt", "Polite", "Warm") and its full sentence text.
4. **Speak Literally button** — always visible alongside the candidate tray once concepts are selected. Speaks the raw concept list with no AI involved.
5. **Emergency tile** — fixed position (e.g., top-right corner), visually distinct (larger, red/orange, high contrast), visible on screen at all times regardless of what else is happening. Tapping it immediately "speaks" a fixed phrase, bypassing everything else on screen.

**Interaction rules (non-negotiable):**
- **Nothing plays automatically.** Audio only plays as the direct result of a user tap — tapping a candidate card, tapping Speak Literally, or tapping the Emergency tile. No `useEffect` should trigger audio playback on its own.
- Selecting a candidate or hitting Speak Literally should visually indicate "now speaking" (e.g., a brief highlight or icon change) so it's clear to an observer that something happened.
- The Emergency tile works independently of everything else — it must remain tappable and functional even if the candidate tray, concept strip, or anything else on screen is in a broken or loading state.

### Screen 2: Caregiver Live View

A second screen/route (e.g., `/caregiver`) intended to be opened in a second browser tab or window during the demo, sitting on a second monitor facing the audience.

**What it shows:**
- The current concept strip from Screen 1, updating live as tiles are tapped — before the sentence is even finalized or spoken.
- Nothing else needs to be shown here for this round — no candidate sentences, no controls. Just the forming intent, live.

**How to build the "live" part without a real backend:** Since there's no server yet, use a same-browser mechanism to sync state between two tabs — the BroadcastChannel API (built into modern browsers, no library needed) is the simplest approach: Screen 1 posts the current concept strip to a channel whenever it changes, Screen 2 listens and re-renders. Do not build real user accounts, WebSockets, or a database for this — it only needs to work between two tabs on the same laptop during a live demo.

---

## MOCK DATA LAYER (build this first, replace later)

Create a single file, e.g., `lib/mockApi.ts`, containing functions that stand in for the real backend. These must return data in the **exact shape** the real backend will return, so swapping them out later is a one-line change per function, not a rewrite.

```typescript
// lib/mockApi.ts

export type Candidate = { tone: string; text: string };
export type ExpandResponse = { candidates: Candidate[]; source: "llm" | "fallback" };

// Mimics POST /api/expand
export async function mockExpand(concepts: string[]): Promise<ExpandResponse> {
  // Simulate network delay so loading states can be built and tested properly
  await new Promise((resolve) => setTimeout(resolve, 800));

  const joined = concepts.join(", ").toLowerCase();
  return {
    candidates: [
      { tone: "Blunt", text: `${concepts[0] || "I"}, ${joined} — worse today.` },
      { tone: "Polite", text: `Good morning, could you help — ${joined} is bothering me more today.` },
      { tone: "Warm", text: `Hey, just so you know — ${joined} has been rough since last night.` },
    ],
    source: "llm",
  };
}

// Mimics POST /api/speak — returns a fake "spoken" confirmation instead of real audio for now
export async function mockSpeak(text: string): Promise<{ played: true; text: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log("[MOCK SPEAK]", text); // Replace with real audio playback once backend exists
  return { played: true, text };
}
```

**Required behavior:**
- Every place in the UI that would eventually call `/api/expand` or `/api/speak` must call `mockExpand` / `mockSpeak` instead, with the same function signature the real integration will use later.
- Include the artificial delay in the mocks (shown above) so loading states, spinners, and the "nothing plays until you tap" rule can be properly built and tested now, rather than looking instant in a way the real API won't match.
- Structure these mock calls behind a single thin wrapper (e.g., a `lib/api.ts` file that currently just re-exports the mock functions) so that integration later means editing one file, not searching through every component.

---

## TILE DATA

Store the tile vocabulary as a plain data file, e.g., `lib/tiles.ts`, not hardcoded inside components:

```typescript
export type Tile = { id: string; label: string; icon: string; category: string };

export const TILES: Tile[] = [
  { id: "doctor", label: "Doctor", icon: "🩺", category: "people" },
  { id: "morning", label: "Morning", icon: "🌅", category: "time" },
  { id: "leg", label: "Leg", icon: "🦵", category: "body" },
  { id: "hurt", label: "Hurt", icon: "😣", category: "body" },
  // ... continue to ~30-40 tiles across: people, body/needs, time/degree, function, social, emotion
  // Include an "adult register" row: enough, leave it, that's funny, I'm angry, I miss you, I love you, tell me a story
];
```

Build the tile grid by mapping over this array, grouped by `category` — do not hardcode individual tile components.

---

## REQUIRED UI STATES TO HANDLE

Even without a real backend, build and visually test these states now using the mocks:

1. **Empty state** — no tiles selected yet. Candidate tray and Speak Literally are hidden or disabled.
2. **Loading state** — after requesting suggestions, before the mock resolves. Show a clear loading indicator (skeleton cards or a spinner) — this is exactly what the real AI call's latency will look like.
3. **Loaded state** — 3 candidate cards shown, none selected yet, nothing has played.
4. **Selected/spoken state** — one candidate (or Speak Literally) has been chosen, visibly indicated.
5. **Emergency state** — Emergency tile tapped, visibly and immediately indicated as "spoken," independent of whatever state the rest of the screen was in.

---

## VISUAL / DESIGN NOTES

- Design for an adult user, not a child — avoid cartoonish icons or juvenile styling. Clean, high-contrast, readable at a glance from a few feet away (this will be demoed on a laptop screen or projected).
- Tiles should be large enough to tap confidently — this is not a dense, information-packed UI.
- The Emergency tile must be unmistakably different from every other tile — larger, a distinct warm/red color, fixed position, never scrolled out of view.
- Keep the whole app on a single screen with no scrolling required for the core flow, if possible — scrolling during a live demo is a small but real risk.

---

## WHAT NOT TO BUILD

Do not implement any of the following — explicitly out of scope for this round:
- Real API calls of any kind (that's the integration step, later)
- Login, user accounts, or saved profiles
- Persistence across page reloads (a refresh resetting the state is fine for now)
- Mobile-responsive layout — build for a laptop/demo-monitor screen only
- Webcam-based access, head-pointing, or blink selection
- Voice cloning / message banking UI
- Multiple languages in the UI itself (the tiles and interface can be English; spoken output language is a backend concern for later)
- Any settings, configuration, or admin screens

If asked to add something from this list, respond that it is out of scope for the Round 2 demo and continue with what's defined above.

---

## BUILD ORDER

1. Set up the Next.js project, Tailwind, and the `lib/tiles.ts` data file.
2. Build the tile board and concept strip (tapping tiles updates the strip; undo/clear work). No AI or speech involved yet — get this interaction feeling right first.
3. Build the Emergency tile — the simplest interactive piece, and a good way to confirm the "instant, independent action" pattern before it's needed elsewhere.
4. Build `lib/mockApi.ts` and wire the candidate tray to `mockExpand`, including the loading state.
5. Build the candidate cards, selection behavior, and the "nothing plays until tapped" confirmation rule.
6. Build Speak Literally, using `mockSpeak` directly on the joined concept strip.
7. Build the Caregiver Live View screen and the BroadcastChannel sync between the two tabs.
8. Polish visual states, run through the full demo script standalone, and confirm every UI state listed above looks correct.

---

## INTEGRATION NOTE (for later — do not act on this yet)

When the real backend from the matching backend master prompt is ready, integration should consist of: replacing the contents of `mockExpand` and `mockSpeak` (or the thin wrapper around them) with real `fetch` calls to `/api/expand` and `/api/speak`, matching the same request/response shapes already used in the mocks. If the mock shapes match the real backend's contract exactly, no other frontend code should need to change.

---

## OUTPUT EXPECTED FROM YOU (the coding assistant)

A working, standalone Next.js frontend — tile board, concept strip, candidate tray with mock AI suggestions, Speak Literally, Emergency tile, and the two-tab Caregiver Live View — fully functional and demoable using only the mock data layer, with no real backend required to run or present it. Explain any assumption you make about exact tile wording or layout before finalizing, rather than guessing silently on details that affect the pitch.