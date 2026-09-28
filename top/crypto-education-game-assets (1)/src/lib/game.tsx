import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CoinIcon, FlameIcon, GemIcon, HeartIcon, Icon, XPIcon } from "../components/icons";
import { cn } from "../utils/cn";
import { clamp, useAnimatedNumber, useScrollFrame } from "./motion";
import { sfx, useSoundEnabled } from "./sound";

/* ============================================================
 * FX LAYER — global particles: fly-to-HUD, bursts, floating text
 * ============================================================ */
export type Currency = "xp" | "gems" | "coins" | "hearts";
type Pt = { x: number; y: number };
type FlyItem = { id: number; type: "fly"; icon: Currency; from: Pt; to: Pt; delay: number; onLand?: () => void };
type BurstItem = { id: number; type: "burst"; at: Pt; colors: string[]; count: number; spread: number };
type TextItem = { id: number; type: "text"; at: Pt; text: string; color: string; big?: boolean };
type RingItem = { id: number; type: "ring"; at: Pt; color: string };
type FxItem = FlyItem | BurstItem | TextItem | RingItem;

let fxItems: FxItem[] = [];
let fxId = 0;
const fxSubs = new Set<(i: FxItem[]) => void>();
const emit = () => fxSubs.forEach((f) => f(fxItems));
const addFx = (item: FxItem) => {
  fxItems = [...fxItems, item].slice(-160);
  emit();
};
const removeFx = (id: number) => {
  fxItems = fxItems.filter((i) => i.id !== id);
  emit();
};

export type FxSource = Element | DOMRect | Pt | null | undefined;
function centerOf(src: FxSource): Pt | null {
  if (!src) return null;
  if (typeof Element !== "undefined" && src instanceof Element) {
    const r = src.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  if ("width" in (src as DOMRect)) {
    const r = src as DOMRect;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return src as Pt;
}

export const PALETTE = {
  xp: ["#ffc23d", "#fff1a8", "#ff9f1a"],
  gems: ["#2fd4ff", "#8ff0ff", "#3e8bff"],
  coins: ["#ffc23d", "#ffe28a", "#f0a000"],
  hearts: ["#ff4d6d", "#ff8aa0", "#ffd0da"],
  party: ["#22d39a", "#ffc23d", "#3e8bff", "#ff4d6d", "#9170ff", "#2fd4ff"],
};

export const fx = {
  fly(icon: Currency, from: FxSource, count = 6, onFirstLand?: () => void, onEachLand?: () => void) {
    const a = centerOf(from);
    const target = document.querySelector(`[data-hud="${icon}"]`);
    const b = centerOf(target) ?? { x: window.innerWidth - 80, y: window.innerHeight - 40 };
    if (!a) {
      onFirstLand?.();
      return;
    }
    let landed = false;
    for (let i = 0; i < count; i++) {
      addFx({
        id: ++fxId,
        type: "fly",
        icon,
        from: a,
        to: b,
        delay: i * 55,
        onLand: () => {
          if (!landed) {
            landed = true;
            onFirstLand?.();
          }
          onEachLand?.();
        },
      });
    }
  },
  burst(at: FxSource, opts: { colors?: string[]; count?: number; spread?: number } = {}) {
    const p = centerOf(at);
    if (!p) return;
    addFx({ id: ++fxId, type: "burst", at: p, colors: opts.colors ?? PALETTE.party, count: opts.count ?? 24, spread: opts.spread ?? 120 });
  },
  text(at: FxSource, text: string, color = "#ffc23d", big = false) {
    const p = centerOf(at);
    if (!p) return;
    addFx({ id: ++fxId, type: "text", at: p, text, color, big });
  },
  ring(at: FxSource, color = "#22d39a") {
    const p = centerOf(at);
    if (!p) return;
    addFx({ id: ++fxId, type: "ring", at: p, color });
  },
};

function CurrencyGlyph({ kind, size = 26 }: { kind: Currency; size?: number }) {
  if (kind === "gems") return <GemIcon size={size} />;
  if (kind === "coins") return <CoinIcon size={size} />;
  if (kind === "hearts") return <HeartIcon size={size} />;
  return <XPIcon size={size} />;
}

function FlyParticle({ item }: { item: FlyItem }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { from, to } = item;
    const sx = from.x + (Math.random() - 0.5) * 70;
    const sy = from.y + (Math.random() - 0.5) * 60;
    const cx = (sx + to.x) / 2 + (Math.random() - 0.5) * 220;
    const cy = Math.min(sy, to.y) - 80 - Math.random() * 140;
    const frames: Keyframe[] = [
      { transform: `translate(${from.x}px, ${from.y}px) scale(.2)`, opacity: 0, offset: 0 },
      { transform: `translate(${sx}px, ${sy}px) scale(1.2)`, opacity: 1, offset: 0.16 },
    ];
    const N = 10;
    for (let k = 1; k <= N; k++) {
      const t = Math.pow(k / N, 1.5);
      const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * to.x;
      const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * to.y;
      frames.push({ transform: `translate(${x}px, ${y}px) scale(${1.1 - t * 0.55})`, opacity: 1, offset: 0.16 + 0.84 * (k / N) });
    }
    const anim = el.animate(frames, { duration: 950 + Math.random() * 250, delay: item.delay, easing: "linear", fill: "both" });
    anim.onfinish = () => {
      item.onLand?.();
      removeFx(item.id);
    };
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 -ml-[13px] -mt-[13px] drop-shadow-[0_4px_8px_rgba(0,0,0,.5)]" style={{ opacity: 0 }}>
      <CurrencyGlyph kind={item.icon} />
    </div>
  );
}

function BurstParticles({ item }: { item: BurstItem }) {
  const parts = useMemo(
    () =>
      Array.from({ length: item.count }, (_, i) => {
        const a = (i / item.count) * Math.PI * 2 + Math.random() * 0.5;
        const d = item.spread * (0.5 + Math.random() * 0.7);
        return {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          r: Math.random() * 720 - 360,
          w: 5 + Math.random() * 6,
          h: 7 + Math.random() * 8,
          c: item.colors[i % item.colors.length],
          dur: 700 + Math.random() * 600,
          round: Math.random() > 0.6,
        };
      }),
    [item],
  );
  useEffect(() => {
    const t = setTimeout(() => removeFx(item.id), 1500);
    return () => clearTimeout(t);
  }, [item.id]);
  return (
    <div className="pointer-events-none fixed left-0 top-0" style={{ transform: `translate(${item.at.x}px, ${item.at.y}px)` }}>
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute block"
          style={
            {
              width: p.w,
              height: p.h,
              marginLeft: -p.w / 2,
              marginTop: -p.h / 2,
              background: p.c,
              borderRadius: p.round ? 999 : 2,
              animation: `burst-fly ${p.dur}ms cubic-bezier(.15,.75,.3,1) forwards`,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.r}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function FloatText({ item }: { item: TextItem }) {
  useEffect(() => {
    const t = setTimeout(() => removeFx(item.id), 1300);
    return () => clearTimeout(t);
  }, [item.id]);
  return (
    <div className="pointer-events-none fixed left-0 top-0" style={{ transform: `translate(${item.at.x}px, ${item.at.y}px)` }}>
      <span
        className={cn("absolute left-0 top-0 whitespace-nowrap font-display font-black", item.big ? "text-4xl" : "text-lg")}
        style={{ color: item.color, textShadow: "0 3px 0 rgba(0,0,0,.45), 0 0 18px currentColor", animation: "float-text 1.2s cubic-bezier(.2,.9,.3,1) forwards" }}
      >
        {item.text}
      </span>
    </div>
  );
}

function RingPulse({ item }: { item: RingItem }) {
  useEffect(() => {
    const t = setTimeout(() => removeFx(item.id), 800);
    return () => clearTimeout(t);
  }, [item.id]);
  return (
    <div className="pointer-events-none fixed left-0 top-0" style={{ transform: `translate(${item.at.x}px, ${item.at.y}px)` }}>
      <span className="absolute -ml-10 -mt-10 block h-20 w-20 rounded-full border-4" style={{ borderColor: item.color, animation: "ring-out .7s ease-out forwards" }} />
    </div>
  );
}

export function FxLayer() {
  const [items, setItems] = useState<FxItem[]>(fxItems);
  useEffect(() => {
    fxSubs.add(setItems);
    return () => {
      fxSubs.delete(setItems);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {items.map((it) =>
        it.type === "fly" ? (
          <FlyParticle key={it.id} item={it} />
        ) : it.type === "burst" ? (
          <BurstParticles key={it.id} item={it} />
        ) : it.type === "text" ? (
          <FloatText key={it.id} item={it} />
        ) : (
          <RingPulse key={it.id} item={it} />
        ),
      )}
    </div>
  );
}

/* ============================================================
 * GAME STATE — shared economy used by every mini-game
 * ============================================================ */
export function levelInfo(xp: number) {
  let lvl = 1;
  let need = 200;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    lvl++;
    need = 200 + (lvl - 1) * 50;
  }
  return { lvl, cur: rest, need };
}

type GameState = { xp: number; gems: number; coins: number; hearts: number; streak: number };
type Bumps = Record<Currency | "streak", number>;
export type GameAPI = GameState & {
  level: { lvl: number; cur: number; need: number };
  bumps: Bumps;
  reward: (kind: Currency, amount: number, from?: FxSource) => void;
  spend: (kind: "gems" | "coins", amount: number, from?: FxSource) => boolean;
  loseHeart: () => boolean;
  refillHearts: (from?: FxSource) => void;
  addStreak: () => void;
};

const GameCtx = createContext<GameAPI | null>(null);
export function useGame(): GameAPI {
  const g = useContext(GameCtx);
  if (!g) throw new Error("useGame outside GameProvider");
  return g;
}

const LABEL: Record<Currency, string> = { xp: "XP", gems: "💎", coins: "🪙", hearts: "❤" };
const COLOR: Record<Currency, string> = { xp: "#ffc23d", gems: "#2fd4ff", coins: "#ffd35a", hearts: "#ff4d6d" };

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<GameState>({ xp: 2340, gems: 1240, coins: 12450, hearts: 5, streak: 47 });
  const [bumps, setBumps] = useState<Bumps>({ xp: 0, gems: 0, coins: 0, hearts: 0, streak: 0 });
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const sRef = useRef(s);
  sRef.current = s;

  const bump = (k: keyof Bumps) => setBumps((b) => ({ ...b, [k]: b[k] + 1 }));

  const reward = useCallback((kind: Currency, amount: number, from?: FxSource) => {
    const apply = () => {
      setS((p) => ({ ...p, [kind]: kind === "hearts" ? clamp(p.hearts + amount, 0, 5) : p[kind] + amount }));
      bump(kind);
    };
    const snd = kind === "gems" ? "gem" : kind === "xp" ? "pop" : kind === "hearts" ? "unlock" : "coin";
    if (from) {
      const per = kind === "coins" ? 40 : kind === "xp" ? 8 : kind === "gems" ? 6 : 1;
      const n = clamp(Math.round(amount / per), 3, 12);
      fx.fly(kind, from, n, apply, () => {
        sfx(snd as "coin");
        bump(kind);
      });
      fx.text(from, `+${amount} ${LABEL[kind]}`, COLOR[kind]);
    } else {
      apply();
      sfx(snd as "coin");
    }
  }, []);

  const spend = useCallback((kind: "gems" | "coins", amount: number, from?: FxSource) => {
    if (sRef.current[kind] < amount) {
      sfx("error");
      const hud = document.querySelector(`[data-hud="${kind}"]`);
      hud?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      return false;
    }
    setS((p) => ({ ...p, [kind]: p[kind] - amount }));
    bump(kind);
    fx.text(from ?? document.querySelector(`[data-hud="${kind}"]`), `-${amount} ${LABEL[kind]}`, "#8ea4d2");
    sfx("tap");
    return true;
  }, []);

  const loseHeart = useCallback(() => {
    if (sRef.current.hearts <= 0) {
      sfx("error");
      return false;
    }
    setS((p) => ({ ...p, hearts: Math.max(0, p.hearts - 1) }));
    bump("hearts");
    const hud = document.querySelector('[data-hud="hearts"]');
    fx.text(hud, "-1 ❤", "#ff4d6d");
    fx.burst(hud, { colors: PALETTE.hearts, count: 12, spread: 46 });
    try {
      navigator.vibrate?.(60);
    } catch {
      /* noop */
    }
    return true;
  }, []);

  const refillHearts = useCallback((from?: FxSource) => {
    const missing = 5 - sRef.current.hearts;
    if (missing <= 0) return;
    if (from) reward("hearts", missing, from);
    else {
      setS((p) => ({ ...p, hearts: 5 }));
      bump("hearts");
      sfx("unlock");
    }
  }, [reward]);

  const addStreak = useCallback(() => {
    setS((p) => ({ ...p, streak: p.streak + 1 }));
    bump("streak");
    fx.burst(document.querySelector('[data-hud="streak"]'), { colors: ["#ff7a2f", "#ffc23d", "#ff4d6d"], count: 18, spread: 60 });
    sfx("combo");
  }, []);

  const level = levelInfo(s.xp);
  const prevLvl = useRef(level.lvl);
  useEffect(() => {
    if (level.lvl > prevLvl.current) {
      prevLvl.current = level.lvl;
      setLevelUp(level.lvl);
      sfx("levelup");
      fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, { count: 70, spread: 320 });
      const t = setTimeout(() => setLevelUp(null), 2800);
      return () => clearTimeout(t);
    }
    prevLvl.current = level.lvl;
  }, [level.lvl]);

  const api = useMemo<GameAPI>(
    () => ({ ...s, level, bumps, reward, spend, loseHeart, refillHearts, addStreak }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, bumps, reward, spend, loseHeart, refillHearts, addStreak],
  );

  return (
    <GameCtx.Provider value={api}>
      {children}
      {levelUp && <LevelUpOverlay lvl={levelUp} onClose={() => setLevelUp(null)} />}
    </GameCtx.Provider>
  );
}

/* ============================================================
 * LEVEL-UP OVERLAY
 * ============================================================ */
function LevelUpOverlay({ lvl, onClose }: { lvl: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/70 backdrop-blur-sm" style={{ animation: "fade-in .25s ease both" }} onClick={onClose}>
      <div className="relative flex flex-col items-center">
        <div className="rays left-1/2 top-1/2 h-[520px] w-[520px] rounded-full opacity-70" />
        <div className="relative anim-drop">
          <svg viewBox="0 0 100 110" className="h-44 w-44 drop-shadow-[0_10px_0_#3d2399]">
            <defs>
              <linearGradient id="lvup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e3d6ff" />
                <stop offset=".5" stopColor="#9170ff" />
                <stop offset="1" stopColor="#5a3ccc" />
              </linearGradient>
            </defs>
            <path d="M50 4 94 29v52L50 106 6 81V29L50 4Z" fill="url(#lvup)" />
            <path d="M50 16 83 35v40L50 94 17 75V35L50 16Z" fill="#2a1a78" opacity=".55" />
            <path d="M20 32 50 14" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-100">Level</span>
            <span className="font-display text-6xl font-black text-white">{lvl}</span>
          </div>
        </div>
        <div className="relative mt-4 flex">
          {"LEVEL UP!".split("").map((ch, i) => (
            <span key={i} className="text-gradient-gold font-display text-5xl font-black" style={{ animation: `letter-pop .5s ${0.3 + i * 0.05}s cubic-bezier(.3,1.6,.5,1) both`, display: "inline-block", minWidth: ch === " " ? 16 : undefined }}>
              {ch}
            </span>
          ))}
        </div>
        <div className="relative mt-2 text-sm font-bold text-ink-200" style={{ animation: "slide-up .5s .8s both" }}>
          New lessons & league rewards unlocked
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * PLAYER HUD DOCK — the target of every reward animation
 * ============================================================ */
function HudCounter({ value, className }: { value: number; className?: string }) {
  const v = useAnimatedNumber(value, 650);
  return <span className={cn("tabular-nums", className)}>{Math.round(v).toLocaleString()}</span>;
}

export function PlayerHUD() {
  const g = useGame();
  const [sound, setSound] = useSoundEnabled();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);
  useScrollFrame((i) => {
    const down = i.y > lastY.current + 4;
    const up = i.y < lastY.current - 4;
    if (down && i.y > 300) setCompact(true);
    if (up) setCompact(false);
    lastY.current = i.y;
    setHidden(i.y < 200);
  });
  const lv = g.level;
  const pct = (lv.cur / lv.need) * 100;
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]",
        hidden ? "pointer-events-none translate-y-[140%] opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      <div className="flex items-center gap-1 rounded-[22px] border border-white/10 bg-ink-800/90 p-1.5 shadow-[0_6px_0_#081231,0_20px_40px_rgba(0,0,0,.6)] backdrop-blur-xl">
        <div data-hud="xp" className="flex items-center gap-2 rounded-2xl bg-ink-900/70 py-1 pl-1 pr-3">
          <div key={`lv${g.bumps.xp}`} className="anim-bump relative flex h-9 w-9 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#0a1330" strokeWidth="4" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#ffc23d" strokeWidth="4" strokeLinecap="round" strokeDasharray={94.2} strokeDashoffset={94.2 * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .7s cubic-bezier(.3,1.2,.5,1)" }} />
            </svg>
            <span className="font-display text-[11px] font-black text-white">{lv.lvl}</span>
          </div>
          <div className={cn("overflow-hidden transition-all duration-500", compact ? "w-0 opacity-0" : "w-20 opacity-100 sm:w-28")}>
            <div className="text-[9px] font-black uppercase tracking-wider text-ink-400">Level {lv.lvl}</div>
            <div className="font-mono text-[11px] font-bold text-gold">
              <HudCounter value={lv.cur} />/{lv.need}
            </div>
          </div>
        </div>
        <HudPill hud="streak" bump={g.bumps.streak}>
          <FlameIcon size={22} className="anim-flicker" />
          <HudCounter value={g.streak} className="text-flame" />
        </HudPill>
        <HudPill hud="gems" bump={g.bumps.gems}>
          <GemIcon size={20} />
          <HudCounter value={g.gems} className="text-cyan" />
        </HudPill>
        <HudPill hud="coins" bump={g.bumps.coins} className="hidden sm:flex">
          <CoinIcon size={20} />
          <HudCounter value={g.coins} className="text-gold" />
        </HudPill>
        <HudPill hud="hearts" bump={g.bumps.hearts} onClick={() => g.refillHearts(document.querySelector('[data-hud="hearts"]'))} title="Tap to refill (demo)">
          <HeartIcon size={20} dim={g.hearts === 0} className={g.hearts > 0 ? "anim-heart" : ""} />
          <span className={g.hearts ? "text-bear" : "text-ink-500"}>{g.hearts}</span>
        </HudPill>
        <button
          onClick={() => setSound(!sound)}
          className={cn("flex h-10 w-10 items-center justify-center rounded-2xl transition active:scale-90", sound ? "bg-azure/15 text-azure" : "text-ink-500 hover:text-ink-200")}
          title={sound ? "Sound on" : "Sound off"}
        >
          <Icon name={sound ? "volume" : "x"} size={18} stroke={2.6} />
        </button>
      </div>
    </div>
  );
}

function HudPill({
  hud,
  bump,
  children,
  className,
  onClick,
  title,
}: {
  hud: string;
  bump: number;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      data-hud={hud}
      onClick={onClick}
      title={title}
      className={cn("flex h-10 items-center gap-1.5 rounded-2xl px-2.5 font-display text-[13px] font-black transition hover:bg-white/5", className)}
    >
      <span key={bump} className={cn("flex items-center gap-1.5", bump > 0 && "anim-bump")}>
        {children}
      </span>
    </button>
  );
}
