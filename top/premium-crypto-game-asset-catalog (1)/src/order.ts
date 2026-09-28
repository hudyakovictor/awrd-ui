import type { IconName } from "./components/icons";

export type NavItem = { id: string; n: string; i: IconName; c: number; group: "System" | "Game" | "Market" | "Surface" };

export const NAV: NavItem[] = [
  { id: "foundations", n: "Foundations", i: "layers", c: 10, group: "System" },
  { id: "characters", n: "Mascot & Art", i: "sparkles", c: 3, group: "System" },
  { id: "controls", n: "Controls", i: "settings", c: 14, group: "System" },
  { id: "navigation", n: "Navigation", i: "globe", c: 9, group: "System" },
  { id: "fxlab", n: "FX Lab", i: "bolt", c: 10, group: "System" },
  { id: "polish", n: "Polish Lab", i: "sparkles", c: 15, group: "System" },
  { id: "lesson", n: "Lesson Engine", i: "brain", c: 7, group: "Game" },
  { id: "lessonplus", n: "Lesson Plus", i: "book", c: 8, group: "Game" },
  { id: "map", n: "World Map", i: "target", c: 4, group: "Game" },
  { id: "trophy", n: "Trophy Room", i: "medal", c: 5, group: "Game" },
  { id: "game", n: "Game Layer", i: "trophy", c: 12, group: "Game" },
  { id: "rewards", n: "Rewards", i: "chest", c: 6, group: "Game" },
  { id: "social", n: "Social & PvP", i: "user", c: 5, group: "Game" },
  { id: "guilds", n: "Guilds & Raids", i: "shield", c: 7, group: "Game" },
  { id: "codex", n: "Boss Codex", i: "flame", c: 6, group: "Game" },
  { id: "events", n: "Live Events", i: "calendar", c: 7, group: "Game" },
  { id: "daily", n: "Daily Ops", i: "clock", c: 7, group: "Game" },
  { id: "minigames", n: "Mini-Games", i: "play", c: 2, group: "Game" },
  { id: "rich", n: "Surfaces", i: "layers", c: 9, group: "Game" },
  { id: "trading", n: "Trading", i: "candle", c: 11, group: "Market" },
  { id: "economy", n: "DeFi Economy", i: "wallet", c: 6, group: "Market" },
  { id: "shop", n: "Shop", i: "gem", c: 5, group: "Market" },
  { id: "onboarding", n: "Onboarding", i: "rocket", c: 6, group: "Surface" },
  { id: "data", n: "Data Display", i: "grid", c: 10, group: "Surface" },
  { id: "feedback", n: "Feedback", i: "bell", c: 9, group: "Surface" },
  { id: "screens", n: "Screens", i: "home", c: 3, group: "Surface" },
];

export const ORDER = NAV.map((n) => n.id);
