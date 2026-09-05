import { useState, useEffect } from "react";

const CHANNEL_NAME = "swara-concepts";

export default function CaregiverView() {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (e: MessageEvent<{ concepts: string[] }>) => {
      setConcepts(e.data.concepts ?? []);
      setLastUpdate(new Date());
    };
    return () => ch.close();
  }, []);

  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
            Swara — Caregiver Live View
          </p>
          <p className="text-gray-600 text-sm">
            Open the main communication screen in another tab to begin.
          </p>
        </div>

        {/* Live strip */}
        <div
          className="min-h-40 rounded-2xl border border-gray-700 bg-gray-900 p-8 flex items-center justify-center"
          aria-live="polite"
          aria-label="Current concepts being selected by patient"
        >
          {concepts.length === 0 ? (
            <p className="text-gray-500 text-lg italic text-center">
              Waiting for concepts…
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {concepts.map((c, i) => (
                <span
                  key={i}
                  className="bg-gray-800 border border-gray-600 text-gray-100 rounded-xl px-5 py-2.5 text-xl font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-5 text-center">
          {timeStr ? (
            <p className="text-gray-500 text-xs">
              Last updated at <span className="text-gray-400 font-mono">{timeStr}</span>
            </p>
          ) : (
            <p className="text-gray-600 text-xs">No updates received yet</p>
          )}
        </div>

        {/* Arrow indicator */}
        {concepts.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
            {concepts.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">{c}</span>
                {i < concepts.length - 1 && (
                  <span className="text-gray-700 text-sm">→</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
