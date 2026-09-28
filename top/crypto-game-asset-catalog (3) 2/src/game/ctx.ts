import { createContext, useContext } from "react";

export type SkillId = "candles" | "patterns" | "risk" | "psychology" | "defi";
export const SKILLS: { id: SkillId; t: string; c: string; i: string; pb: "bull" | "sky" | "gold" | "bear" | "violet" }[] = [
  { id: "candles", t: "Candles", c: "#2ee59d", i: "candle", pb: "bull" },
  { id: "patterns", t: "Patterns", c: "#3d8bff", i: "trendUp", pb: "sky" },
  { id: "risk", t: "Risk", c: "#ffc53d", i: "shield", pb: "gold" },
  { id: "psychology", t: "Psychology", c: "#ff4d6a", i: "heart", pb: "bear" },
  { id: "defi", t: "DeFi", c: "#a174ff", i: "gem", pb: "violet" },
];
export const skillOf = (id: SkillId) => SKILLS.find((s) => s.id === id)!;

export type Reward = { xp?: number; gems?: number; x?: number; y?: number; silent?: boolean };
export type Complete = { skill: SkillId; xp?: number; gems?: number; x?: number; y?: number; ok?: boolean };
export type GameApi = {
  xp: number;
  level: number;
  levelXp: number;
  levelMax: number;
  gems: number;
  streak: number;
  hearts: number;
  combo: number;
  touched: number;
  skills: Record<SkillId, number>;
  daily: { done: number; goal: number };
  reward: (r: Reward) => void;
  complete: (c: Complete) => void;
  spend: (gems: number) => boolean;
  loseHeart: () => void;
  refillHearts: () => void;
  addCombo: (ok: boolean) => void;
  touch: (id: string, x: number, y: number) => void;
  celebrate: () => void;
};

const noop = () => {};
export const GameCtx = createContext<GameApi>({
  xp: 0, level: 1, levelXp: 0, levelMax: 250, gems: 0, streak: 0, hearts: 5, combo: 0, touched: 0,
  skills: { candles: 0, patterns: 0, risk: 0, psychology: 0, defi: 0 }, daily: { done: 0, goal: 5 },
  reward: noop, complete: noop, spend: () => false, loseHeart: noop, refillHearts: noop, addCombo: noop, touch: noop, celebrate: noop,
});
export const useGame = () => useContext(GameCtx);
export const LEVEL_XP = 250;
