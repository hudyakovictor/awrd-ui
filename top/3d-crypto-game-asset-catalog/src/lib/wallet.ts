import { useSyncExternalStore } from "react";

/* Single source of truth for the game economy — shared by catalog, shop, wheel and the playable prototype. */
export type Wallet = { coins: number; gems: number; xp: number; hearts: number; streak: number; pro: boolean; owned: string[] };
const DEF: Wallet = { coins: 8540, gems: 1240, xp: 1520, hearts: 4, streak: 27, pro: false, owned: [] };
let w: Wallet = { ...DEF };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const wallet = {
  get: () => w,
  sub(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  add(p: Partial<Record<"coins" | "gems" | "xp" | "hearts" | "streak", number>>) {
    w = {
      ...w,
      coins: Math.max(0, w.coins + (p.coins ?? 0)),
      gems: Math.max(0, w.gems + (p.gems ?? 0)),
      xp: Math.max(0, w.xp + (p.xp ?? 0)),
      hearts: Math.max(0, Math.min(5, w.hearts + (p.hearts ?? 0))),
      streak: Math.max(0, w.streak + (p.streak ?? 0)),
    };
    emit();
  },
  /** returns false if not affordable */
  spend(kind: "coins" | "gems", n: number) {
    if (w[kind] < n) return false;
    w = { ...w, [kind]: w[kind] - n };
    emit();
    return true;
  },
  own(id: string) { if (!w.owned.includes(id)) { w = { ...w, owned: [...w.owned, id] }; emit(); } },
  setPro(v: boolean) { w = { ...w, pro: v }; emit(); },
  setHearts(n: number) { w = { ...w, hearts: Math.max(0, Math.min(5, n)) }; emit(); },
  reset() { w = { ...DEF }; emit(); },
};
export const useWallet = () => useSyncExternalStore(wallet.sub, wallet.get);
