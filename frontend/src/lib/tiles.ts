export type TileCategory =
  | "people"
  | "body"
  | "time"
  | "function"
  | "social"
  | "emotion";

export type Tile = {
  id: string;
  label: string;
  icon: string;
  category: TileCategory;
};

export const TILES: Tile[] = [
  // People
  { id: "doctor", label: "Doctor", icon: "🩺", category: "people" },
  { id: "nurse", label: "Nurse", icon: "👩‍⚕️", category: "people" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧", category: "people" },
  { id: "i-me", label: "I / Me", icon: "🙋", category: "people" },
  { id: "you", label: "You", icon: "👉", category: "people" },

  // Body / Needs
  { id: "head", label: "Head", icon: "🧠", category: "body" },
  { id: "chest", label: "Chest", icon: "💗", category: "body" },
  { id: "stomach", label: "Stomach", icon: "🫁", category: "body" },
  { id: "leg", label: "Leg", icon: "🦵", category: "body" },
  { id: "arm", label: "Arm", icon: "💪", category: "body" },
  { id: "hurt", label: "Hurt", icon: "😣", category: "body" },
  { id: "tired", label: "Tired", icon: "😴", category: "body" },
  { id: "hungry", label: "Hungry", icon: "🍽️", category: "body" },
  { id: "thirsty", label: "Thirsty", icon: "💧", category: "body" },
  { id: "bathroom", label: "Bathroom", icon: "🚻", category: "body" },
  { id: "medicine", label: "Medicine", icon: "💊", category: "body" },

  // Time / Degree
  { id: "morning", label: "Morning", icon: "🌅", category: "time" },
  { id: "now", label: "Now", icon: "⚡", category: "time" },
  { id: "later", label: "Later", icon: "⏳", category: "time" },
  { id: "always", label: "Always", icon: "🔁", category: "time" },
  { id: "worse", label: "Worse", icon: "📉", category: "time" },
  { id: "better", label: "Better", icon: "📈", category: "time" },
  { id: "a-lot", label: "A lot", icon: "🔺", category: "time" },

  // Function
  { id: "want", label: "Want", icon: "✋", category: "function" },
  { id: "need", label: "Need", icon: "❗", category: "function" },
  { id: "help", label: "Help", icon: "🆘", category: "function" },
  { id: "stop", label: "Stop", icon: "🛑", category: "function" },
  { id: "yes", label: "Yes", icon: "✅", category: "function" },
  { id: "no", label: "No", icon: "❌", category: "function" },
  { id: "more", label: "More", icon: "➕", category: "function" },

  // Social / Adult register
  { id: "enough", label: "Enough", icon: "🙅", category: "social" },
  { id: "leave-it", label: "Leave it", icon: "🤫", category: "social" },
  { id: "funny", label: "That's funny", icon: "😄", category: "social" },
  { id: "tell-story", label: "Tell me a story", icon: "📖", category: "social" },
  { id: "miss-you", label: "I miss you", icon: "💭", category: "social" },
  { id: "love-you", label: "I love you", icon: "❤️", category: "social" },
  { id: "thank-you", label: "Thank you", icon: "🙏", category: "social" },

  // Emotion
  { id: "angry", label: "Angry", icon: "😠", category: "emotion" },
  { id: "scared", label: "Scared", icon: "😨", category: "emotion" },
  { id: "sad", label: "Sad", icon: "😔", category: "emotion" },
  { id: "ok", label: "I'm OK", icon: "👌", category: "emotion" },
  { id: "frustrated", label: "Frustrated", icon: "😤", category: "emotion" },
  { id: "grateful", label: "Grateful", icon: "🫶", category: "emotion" },
];

export const CATEGORY_META: Record<
  TileCategory,
  { label: string; color: string; bg: string }
> = {
  people:   { label: "People",      color: "text-blue-300",   bg: "bg-blue-950/60 hover:bg-blue-900/70 border-blue-800/50" },
  body:     { label: "Body / Needs", color: "text-amber-300",  bg: "bg-amber-950/60 hover:bg-amber-900/70 border-amber-800/50" },
  time:     { label: "Time / Degree", color: "text-violet-300", bg: "bg-violet-950/60 hover:bg-violet-900/70 border-violet-800/50" },
  function: { label: "Function",    color: "text-slate-300",   bg: "bg-slate-800/60 hover:bg-slate-700/70 border-slate-600/50" },
  social:   { label: "Social",      color: "text-emerald-300", bg: "bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-800/50" },
  emotion:  { label: "Emotion",     color: "text-rose-300",    bg: "bg-rose-950/60 hover:bg-rose-900/70 border-rose-800/50" },
};
