import { useSyncExternalStore } from "react";

/**
 * Session event store for the VFX Console.
 * Lives outside React context on purpose: blocks fire hundreds of events
 * per second (particles), so listeners are notified at most once per frame.
 */

export type StatKey =
  | "effects"
  | "flash"
  | "particles"
  | "shake"
  | "haptic"
  | "sound"
  | "success"
  | "error"
  | "combo"
  | "lock"
  | "reveal";

export const STAT_KEYS: StatKey[] = ["effects", "flash", "particles", "shake", "haptic", "sound", "success", "error", "combo", "lock", "reveal"];

export interface LogEntry {
  id: number;
  key: StatKey;
  label: string;
  t: number;
}

export interface StatsSnapshot {
  counts: Record<StatKey, number>;
  /** performance.now() of the last increment per key — used for highlight pulses */
  hits: Record<StatKey, number>;
  log: LogEntry[];
  startedAt: number;
}

const zero = (): Record<StatKey, number> => STAT_KEYS.reduce((a, k) => ((a[k] = 0), a), {} as Record<StatKey, number>);

let counts = zero();
let hits = zero();
let log: LogEntry[] = [];
let startedAt = Date.now();
let uid = 0;
let snapshot: StatsSnapshot = { counts: { ...counts }, hits: { ...hits }, log: [], startedAt };
let scheduled = false;
const listeners = new Set<() => void>();

function emit() {
  scheduled = false;
  snapshot = { counts: { ...counts }, hits: { ...hits }, log: log.slice(), startedAt };
  listeners.forEach((l) => l());
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  if (typeof requestAnimationFrame === "undefined") emit();
  else requestAnimationFrame(emit);
}

/** Count an event. `label` (optional) adds a line to the console event feed. */
export function track(key: StatKey, n = 1, label?: string) {
  if (n <= 0) return;
  counts[key] += n;
  hits[key] = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (label) {
    log.push({ id: ++uid, key, label, t: Date.now() });
    if (log.length > 40) log = log.slice(-40);
  }
  schedule();
}

export function resetStats() {
  counts = zero();
  hits = zero();
  log = [];
  startedAt = Date.now();
  schedule();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStats(): StatsSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
