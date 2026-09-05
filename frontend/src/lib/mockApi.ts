export type Candidate = { tone: string; text: string };
export type ExpandResponse = { candidates: Candidate[]; source: "llm" | "fallback" };

export async function mockExpand(concepts: string[]): Promise<ExpandResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const joined = concepts.join(", ").toLowerCase();
  return {
    candidates: [
      { tone: "Blunt",  text: `${concepts[0] || "I"} — ${joined}. It's worse today.` },
      { tone: "Polite", text: `Good morning. Could you help? ${joined.charAt(0).toUpperCase() + joined.slice(1)} has been bothering me.` },
      { tone: "Warm",   text: `Hey — just so you know, ${joined} has been rough since last night.` },
    ],
    source: "llm",
  };
}

export async function mockSpeak(text: string): Promise<{ played: true; text: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  }
  console.log("[MOCK SPEAK]", text);
  return { played: true, text };
}
