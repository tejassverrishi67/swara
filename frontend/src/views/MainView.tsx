import { useState, useEffect, useRef, useCallback } from "react";
import { TILES, CATEGORY_META, type TileCategory } from "../lib/tiles";
import { expand, speak, type Candidate } from "../lib/api";

const CHANNEL_NAME = "swara-concepts";
const EMERGENCY_TEXT = "Help me! I need assistance right now.";

type SuggestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; candidates: Candidate[] }
  | { status: "spoken"; candidates: Candidate[]; chosenIndex: number | "literal" };

export default function MainView() {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [suggest, setSuggest] = useState<SuggestState>({ status: "idle" });
  const [emergencySpoken, setEmergencySpoken] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const emergencyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  const broadcast = useCallback((next: string[]) => {
    channelRef.current?.postMessage({ concepts: next });
  }, []);

  const addConcept = useCallback((label: string) => {
    setConcepts((prev) => {
      const next = [...prev, label];
      broadcast(next);
      return next;
    });
    setSuggest({ status: "idle" });
  }, [broadcast]);

  const undo = useCallback(() => {
    setConcepts((prev) => {
      const next = prev.slice(0, -1);
      broadcast(next);
      return next;
    });
    setSuggest({ status: "idle" });
  }, [broadcast]);

  const clear = useCallback(() => {
    setConcepts([]);
    broadcast([]);
    setSuggest({ status: "idle" });
  }, [broadcast]);

  const requestSuggest = useCallback(async () => {
    if (concepts.length < 1) return;
    setSuggest({ status: "loading" });
    try {
      const res = await expand(concepts);
      setSuggest({ status: "loaded", candidates: res.candidates });
    } catch {
      setSuggest({ status: "idle" });
    }
  }, [concepts]);

  const speakCandidate = useCallback(async (text: string, index: number) => {
    if (suggest.status !== "loaded") return;
    const candidates = suggest.candidates;
    setSuggest({ status: "spoken", candidates, chosenIndex: index });
    await speak(text);
  }, [suggest]);

  const speakLiteral = useCallback(async () => {
    if (suggest.status !== "loaded" && suggest.status !== "idle") return;
    const text = concepts.join(", ");
    if (!text) return;
    const candidates =
      suggest.status === "loaded"
        ? suggest.candidates
        : [];
    setSuggest({ status: "spoken", candidates, chosenIndex: "literal" });
    await speak(text);
  }, [concepts, suggest]);

  const handleEmergency = useCallback(async () => {
    setEmergencySpoken(true);
    await speak(EMERGENCY_TEXT);
    if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    emergencyTimerRef.current = setTimeout(() => setEmergencySpoken(false), 3000);
  }, []);

  const categories = Array.from(new Set(TILES.map((t) => t.category))) as TileCategory[];
  const canSuggest = concepts.length >= 1;
  const showTray = suggest.status !== "idle";

  return (
    <div className="relative h-full flex flex-col bg-gray-950 text-gray-100 overflow-hidden select-none">

      {/* Emergency tile — fixed top-right */}
      <button
        onClick={handleEmergency}
        aria-label="Emergency: speak help phrase immediately"
        className={[
          "fixed top-4 right-4 z-50 w-28 h-28 rounded-2xl border-2 font-bold text-white",
          "flex flex-col items-center justify-center gap-1 transition-all duration-150",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400",
          emergencySpoken
            ? "bg-orange-500 border-orange-300 scale-95 shadow-[0_0_24px_4px_rgba(249,115,22,0.6)]"
            : "bg-red-700 border-red-500 hover:bg-red-600 active:scale-95 shadow-lg",
        ].join(" ")}
      >
        <span className="text-3xl" aria-hidden>🆘</span>
        <span className="text-xs leading-tight text-center">
          {emergencySpoken ? "SPEAKING…" : "EMERGENCY"}
        </span>
      </button>

      {/* Concept strip */}
      <div className="flex-none border-b border-gray-800 bg-gray-900 px-4 py-3 pr-36">
        <div className="flex items-center gap-2 min-h-12">
          {concepts.length === 0 ? (
            <span className="text-gray-500 text-sm italic">
              Tap tiles below to begin…
            </span>
          ) : (
            <div className="flex flex-wrap gap-2 flex-1">
              {concepts.map((c, i) => (
                <span
                  key={i}
                  className="bg-gray-700 text-gray-100 rounded-lg px-3 py-1 text-sm font-medium border border-gray-600"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 ml-auto shrink-0">
            <button
              onClick={undo}
              disabled={concepts.length === 0}
              aria-label="Undo last tile"
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              ↩ Undo
            </button>
            <button
              onClick={clear}
              disabled={concepts.length === 0}
              aria-label="Clear all tiles"
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* Tile board */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const tiles = TILES.filter((t) => t.category === cat);
            return (
              <section key={cat} aria-label={meta.label}>
                <h2 className={`text-xs font-semibold tracking-widest uppercase mb-2 ${meta.color}`}>
                  {meta.label}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => addConcept(tile.label)}
                      aria-label={`Add ${tile.label}`}
                      className={[
                        "flex flex-col items-center justify-center gap-1.5",
                        "w-24 h-20 rounded-xl border text-center transition-all duration-100",
                        "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        meta.bg,
                      ].join(" ")}
                    >
                      <span className="text-2xl leading-none" aria-hidden>{tile.icon}</span>
                      <span className="text-xs font-medium text-gray-200 leading-tight px-1">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Candidate tray — right panel */}
        <div className="flex-none w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <button
              onClick={requestSuggest}
              disabled={!canSuggest || suggest.status === "loading"}
              aria-label="Request AI sentence suggestions"
              className={[
                "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                canSuggest && suggest.status !== "loading"
                  ? "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed",
              ].join(" ")}
            >
              {suggest.status === "loading" ? "Thinking…" : "✦ Suggest"}
            </button>
            {(suggest.status === "loaded" || suggest.status === "spoken") && (
              <button
                onClick={speakLiteral}
                aria-label="Speak concepts literally without AI"
                className={[
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                  suggest.status === "spoken" && (suggest as { chosenIndex: number | "literal" }).chosenIndex === "literal"
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-200 active:scale-95",
                ].join(" ")}
              >
                {suggest.status === "spoken" && (suggest as { chosenIndex: number | "literal" }).chosenIndex === "literal"
                  ? "▶ Speaking…"
                  : "▶ Speak Literally"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {suggest.status === "idle" && (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm text-center leading-relaxed">
                  Select tiles and tap<br />
                  <strong className="text-gray-400">✦ Suggest</strong> to get sentence options.
                </p>
              </div>
            )}

            {suggest.status === "loading" && (
              <div className="space-y-3" aria-live="polite" aria-label="Loading suggestions">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-gray-800 border border-gray-700 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}

            {(suggest.status === "loaded" || suggest.status === "spoken") &&
              suggest.candidates.map((c, i) => {
                const isChosen =
                  suggest.status === "spoken" &&
                  (suggest as { chosenIndex: number | "literal" }).chosenIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => speakCandidate(c.text, i)}
                    disabled={suggest.status === "spoken"}
                    aria-label={`${c.tone} tone: ${c.text}`}
                    aria-pressed={isChosen}
                    className={[
                      "w-full text-left rounded-xl border p-3 transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                      isChosen
                        ? "bg-blue-700 border-blue-500 shadow-[0_0_16px_2px_rgba(59,130,246,0.35)]"
                        : suggest.status === "spoken"
                          ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-500 active:scale-[0.98]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={[
                        "text-xs font-bold tracking-widest uppercase",
                        isChosen ? "text-blue-200" : "text-gray-400",
                      ].join(" ")}>
                        {c.tone}
                      </span>
                      {isChosen && (
                        <span className="text-blue-200 text-xs font-medium animate-pulse">▶ Speaking</span>
                      )}
                    </div>
                    <p className={[
                      "text-sm leading-snug",
                      isChosen ? "text-white" : "text-gray-200",
                    ].join(" ")}>
                      {c.text}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
