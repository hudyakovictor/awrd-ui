import type { Category } from "./catalog";
import { SET_HERO } from "../sets/s01-hero";
import { SET_CHART } from "../sets/s02-chart";
import { SET_RISK } from "../sets/s03-risk";
import { SET_SHOP } from "../sets/s04-shop";
import { SET_CUSTOM } from "../sets/s05-custom";
import { SET_WORLD } from "../sets/s06-world";
import { SET_MOOD } from "../sets/s07-mood";
import { SET_TOURNEY } from "../sets/s08-tourney";
import { SET_PASS } from "../sets/s09-pass";
import { SET_QUESTS } from "../sets/s10-quests";
import { SET_INV } from "../sets/s11-inventory";
import { SET_RADAR } from "../sets/s12-radar";
import { SET_ACADEMY } from "../sets/s13-academy";
import { SET_SOCIAL } from "../sets/s14-social";
import { SET_SETTINGS } from "../sets/s15-settings";

/**
 * 15 ИНТЕРАКТИВНЫХ НАБОРОВ.
 * В отличие от категорий 01–09 (кинематографичные сцены с автодемо),
 * здесь каждая сцена управляется жестом: свайп, слайдер, карусель,
 * ручка, удержание, перетаскивание. Демо показывает жест «призрачным
 * пальцем», но все контролы работают и от реального касания.
 */
export const INTERACTIVE_SETS: Category[] = [
  SET_HERO,
  SET_CHART,
  SET_RISK,
  SET_SHOP,
  SET_CUSTOM,
  SET_WORLD,
  SET_MOOD,
  SET_TOURNEY,
  SET_PASS,
  SET_QUESTS,
  SET_INV,
  SET_RADAR,
  SET_ACADEMY,
  SET_SOCIAL,
  SET_SETTINGS,
];

export const INTERACTIVE_IDS = new Set(INTERACTIVE_SETS.map((c) => c.id));

/** Какие типы жестов встречаются в наборе — для бейджей на главной. */
export function gestureKinds(c: Category) {
  const text = c.scenes.map((s) => `${s.kind} ${s.interactive ?? ""}`).join(" ").toLowerCase();
  const kinds: string[] = [];
  if (/свайп|swipe|pager|deck|листай/.test(text)) kinds.push("Свайп");
  if (/слайдер|slider|двигай|тяни/.test(text)) kinds.push("Слайдер");
  if (/карусел|carousel|coverflow/.test(text)) kinds.push("Карусель");
  if (/удерж|hold/.test(text)) kinds.push("Удержание");
  if (/крути|knob|rotary|ручк/.test(text)) kinds.push("Ручка");
  if (/перетаск|drag|тащи/.test(text)) kinds.push("Драг");
  return kinds.slice(0, 4);
}
