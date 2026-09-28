import type { BlockMeta, Category } from "./registry";

export type Interaction = "Tap" | "Drag" | "Swipe" | "Hold" | "Tilt";
export type QuickFilter = "Most Interactive" | "VFX Heavy" | "Drag" | "Swipe" | "Hold" | "Sound" | "Haptics" | "Mobile" | "Experimental";

export const QUICK_FILTERS: QuickFilter[] = ["Most Interactive", "VFX Heavy", "Drag", "Swipe", "Hold", "Sound", "Haptics", "Mobile", "Experimental"];

/** Large self-contained scenes — shown with a "Scene" badge and preferred in Focus View */
export const FEATURED = new Set([
  "chart-sniper",
  "portfolio-scale",
  "pattern-trace",
  "leverage-tower",
  "whale-radar",
  "reveal-terminal",
  "risk-dial",
  "order-book",
  "boss-battle",
  "volatility-field",
  "arena-carousel",
  "draw-forecast",
]);

/** Extra high-interaction blocks counted as "Most Interactive" */
const INTERACTIVE_EXTRA = new Set(["candle-crush", "candle-catcher", "signal-slots", "card-pack", "commit-vault", "setup-dealer", "switchboard", "fever", "spin-wheel", "evidence-swipe", "hold-lock", "trade-sheet"]);

/** Full Loop showcase order (ids from the registry) */
export const SHOWCASE = [
  "reveal-terminal",
  "chart-sniper",
  "pattern-trace",
  "risk-dial",
  "whale-radar",
  "leverage-tower",
  "boss-battle",
  "rank-up",
  "reward-chest",
  "leaderboard",
];

const EXPERIMENTAL_CATS: Category[] = ["Mechanics", "Tactile", "VFX"];
const EXPERIMENTAL_IDS = new Set(["liquidation", "volatility-field", "breaking-news", "draw-forecast"]);

const cache = new Map<string, { interactions: Interaction[]; filters: Set<QuickFilter> }>();

function derive(b: BlockMeta) {
  const hit = cache.get(b.id);
  if (hit) return hit;
  const trig = b.trigger.toLowerCase();
  const all = `${trig} ${b.desc.toLowerCase()}`;
  const interactions: Interaction[] = [];
  if (/drag|slide|rotate|dial|knob|lever|steer|stroke|draw|trace|freehand|pull|handle|vertical/.test(trig) || /\bdrag/.test(all)) interactions.push("Drag");
  if (/swipe|flick|fling|scroll|tear/.test(all)) interactions.push("Swipe");
  if (/hold/.test(trig) || /press.{0,4}hold|hold to|hold the/.test(all)) interactions.push("Hold");
  if (/tilt|gyro|holo/.test(all)) interactions.push("Tilt");
  if (/tap|click|press|button|toggle|flip|spin|answer|continue|drop|pick|complete|option|trigger|space/.test(trig) || interactions.length === 0) interactions.unshift("Tap");

  const empty = (s: string) => !s || /^(—|-|none|silent)/i.test(s.trim());
  const filters = new Set<QuickFilter>();
  if (FEATURED.has(b.id) || INTERACTIVE_EXTRA.has(b.id)) filters.add("Most Interactive");
  if (b.category === "VFX" || b.category === "Arcade" || /particle|confetti|shockwave|shake|burst|explo|glitch|rain|spark|ember|flash/.test(`${all} ${b.tech.join(" ").toLowerCase()} ${b.sound.toLowerCase()}`)) filters.add("VFX Heavy");
  if (interactions.includes("Drag")) filters.add("Drag");
  if (interactions.includes("Swipe")) filters.add("Swipe");
  if (interactions.includes("Hold")) filters.add("Hold");
  if (!empty(b.sound)) filters.add("Sound");
  if (!empty(b.haptics)) filters.add("Haptics");
  if (interactions.some((i) => i !== "Tap")) filters.add("Mobile");
  if (EXPERIMENTAL_CATS.includes(b.category) || EXPERIMENTAL_IDS.has(b.id)) filters.add("Experimental");

  const r = { interactions, filters };
  cache.set(b.id, r);
  return r;
}

export const interactionsOf = (b: BlockMeta) => derive(b).interactions;
export const filtersOf = (b: BlockMeta) => derive(b).filters;
export const matchesFilters = (b: BlockMeta, active: QuickFilter[]) => active.every((f) => derive(b).filters.has(f));

export const INTERACTION_ICON: Record<Interaction, string> = {
  Tap: "👆",
  Drag: "✋",
  Swipe: "↔",
  Hold: "⏱",
  Tilt: "📐",
};

export const slug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
