import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Target } from "lucide-react";
import { onGame, sfxRaw, type GameEvtType } from "./sfx";
import { FlameIcon, GemIcon, HeartIcon, StarIcon } from "./GameIcons";
import { cn } from "../utils/cn";

/* ============================================================================
   GLOBAL GAME LAYER
   Every sfx.correct / sfx.wrong / sfx.coin / sfx.levelUp anywhere on the page
   is routed here → XP, combo, hearts, gems, level, daily goal, FX at the pointer.
   ========================================================================== */

type GameState = { xp: number; hearts: number; gems: number; combo: number; best: number; correct: number; wrong: number; streak: number };
const DEFAULT: GameState = { xp: 0, hearts: 5, gems: 250, combo: 0, best: 0, correct: 0, wrong: 0, streak: 6 };
const KEY = "cq-game-v1";
const DAILY_GOAL = 150;

type Float = { id: number; x: number; y: number; text: string; color: string; big?: boolean };
type Fly = { id: number; x: number; y: number; tx: number; ty: number; color: string };
type Burst = { id: number; x: number; y: number; colors: string[] };
type Toast = { id: number; kind: "combo" | "level" | "hearts" | "info"; title: string; sub?: string };

type Ctx = {
  s: GameState;
  level: number;
  levelPct: number;
  daily: number;
  celebrate: (title: string, sub?: string) => void;
  burstAt: (x: number, y: number) => void;
  floatAt: (x: number, y: number, text: string, color?: string) => void;
  refill: () => void;
  reset: () => void;
};
const GameCtx = createContext<Ctx | null>(null);

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame must be used inside <GameProvider>");
  return c;
}

let uid = 1;
const nid = () => uid++;

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });
  const [floats, setFloats] = useState<Float[]>([]);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [flash, setFlash] = useState<{ id: number; color: string } | null>(null);
  const pt = useRef({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 400, y: 300 });
  const sRef = useRef(s);
  sRef.current = s;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
  }, [s]);

  useEffect(() => {
    const h = (e: PointerEvent) => { pt.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointerdown", h, true);
    return () => window.removeEventListener("pointerdown", h, true);
  }, []);

  const floatAt = useCallback((x: number, y: number, text: string, color = "#ffc53d", big = false) => {
    const id = nid();
    setFloats((f) => [...f.slice(-10), { id, x, y, text, color, big }]);
    setTimeout(() => setFloats((f) => f.filter((z) => z.id !== id)), 1000);
  }, []);

  const flyTo = useCallback((x: number, y: number, target: string, color: string, n = 3) => {
    const el = document.getElementById(target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const tx = r.left + r.width / 2 - x, ty = r.top + r.height / 2 - y;
    const items: Fly[] = [...Array(n)].map((_, i) => ({ id: nid(), x: x + (i - 1) * 10, y: y + (i % 2) * 8, tx, ty, color }));
    setFlies((f) => [...f.slice(-18), ...items]);
    setTimeout(() => setFlies((f) => f.filter((z) => !items.some((it) => it.id === z.id))), 900);
  }, []);

  const burstAt = useCallback((x: number, y: number) => {
    const id = nid();
    setBursts((b) => [...b.slice(-4), { id, x, y, colors: ["#22d39a", "#ffc53d", "#3b82ff", "#8b5cff", "#ff4f6d", "#2bd9ff"] }]);
    setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 1300);
  }, []);

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    const id = nid();
    setToast({ ...t, id });
    setTimeout(() => setToast((c) => (c?.id === id ? null : c)), 1900);
  }, []);

  const celebrate = useCallback((title: string, sub?: string) => {
    showToast({ kind: "info", title, sub });
    burstAt(pt.current.x, pt.current.y);
    sfxRaw.sparkle();
  }, [burstAt, showToast]);

  /* level-up detection */
  const level = Math.floor(s.xp / 100) + 1;
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      showToast({ kind: "level", title: `Level ${level}!`, sub: "Новый ранг открыт" });
      burstAt(window.innerWidth / 2, window.innerHeight * 0.3);
      sfxRaw.sparkle();
    }
    prevLevel.current = level;
  }, [level, showToast, burstAt]);

  /* route the event bus */
  useEffect(() => {
    return onGame((t: GameEvtType) => {
      const { x, y } = pt.current;
      const cur = sRef.current;
      if (t === "correct") {
        const combo = cur.combo + 1;
        const gain = 10 + Math.min(cur.combo, 5) * 2;
        setS((p) => ({ ...p, xp: p.xp + gain, combo: p.combo + 1, best: Math.max(p.best, p.combo + 1), correct: p.correct + 1 }));
        floatAt(x, y - 10, `+${gain} XP`, "#ffc53d");
        flyTo(x, y, "hud-xp", "#ffc53d");
        if ([3, 5, 10, 15, 20, 30, 50].includes(combo)) {
          showToast({ kind: "combo", title: `🔥 ${combo} in a row!`, sub: `Бонус +${Math.min(combo, 5) * 2} XP за ответ` });
          sfxRaw.sparkle();
        }
      } else if (t === "wrong") {
        setS((p) => ({ ...p, combo: 0, hearts: Math.max(0, p.hearts - 1), wrong: p.wrong + 1 }));
        floatAt(x, y - 10, "−1 ❤", "#ff4f6d");
        setFlash({ id: nid(), color: "rgba(255,79,109,.55)" });
        if (cur.hearts - 1 === 0) showToast({ kind: "hearts", title: "Жизни закончились", sub: "Нажми ❤ в панели, чтобы восстановить" });
      } else if (t === "coin") {
        setS((p) => ({ ...p, gems: p.gems + 5 }));
        floatAt(x, y - 10, "+5 💎", "#2bd9ff");
        flyTo(x, y, "hud-gems", "#2bd9ff", 2);
      } else if (t === "big") {
        setS((p) => ({ ...p, xp: p.xp + 25 }));
        floatAt(x, y - 16, "+25 XP", "#ffc53d", true);
        flyTo(x, y, "hud-xp", "#ffc53d", 5);
        burstAt(x, y);
        setFlash({ id: nid(), color: "rgba(255,197,61,.35)" });
      }
    });
  }, [floatAt, flyTo, burstAt, showToast]);

  const refill = useCallback(() => {
    setS((p) => (p.gems >= 50 && p.hearts < 5 ? { ...p, hearts: 5, gems: p.gems - 50 } : p));
    sfxRaw.pop();
  }, []);
  const reset = useCallback(() => { setS(DEFAULT); sfxRaw.thud(); }, []);

  const value = useMemo<Ctx>(() => ({
    s, level, levelPct: s.xp % 100, daily: Math.min(100, (s.xp / DAILY_GOAL) * 100),
    celebrate, burstAt, floatAt: (x, y, t, c) => floatAt(x, y, t, c), refill, reset,
  }), [s, level, celebrate, burstAt, floatAt, refill, reset]);

  return (
    <GameCtx.Provider value={value}>
      {children}
      {/* FX layer */}
      <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" aria-hidden>
        {floats.map((f) => (
          <span key={f.id} className={cn("num absolute whitespace-nowrap font-black", f.big ? "text-2xl" : "text-lg")} style={{ left: f.x, top: f.y, color: f.color, textShadow: `0 0 14px ${f.color}, 0 2px 0 rgba(0,0,0,.6)`, animation: "float-up 1s cubic-bezier(.2,.9,.3,1) forwards" }}>
            {f.text}
          </span>
        ))}
        {flies.map((f, i) => (
          <span key={f.id} className="absolute h-3 w-3 rounded-full" style={{ left: f.x, top: f.y, background: f.color, boxShadow: `0 0 12px ${f.color}`, ["--tx" as string]: `${f.tx}px`, ["--ty" as string]: `${f.ty}px`, animation: `fly-to .75s ${i % 5 * 40}ms cubic-bezier(.55,-0.35,.75,.9) forwards` } as CSSProperties} />
        ))}
        {bursts.map((b) => <BurstFx key={b.id} x={b.x} y={b.y} colors={b.colors} />)}
        {flash && <div key={flash.id} className="absolute inset-0" style={{ boxShadow: `inset 0 0 140px 30px ${flash.color}`, animation: "vignette .6s ease-out forwards" }} />}
        {toast && (
          <div key={toast.id} className="absolute left-1/2 top-24" style={{ animation: "toast-in .5s cubic-bezier(.2,1.4,.4,1) both" }}>
            <div className={cn("flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-[0_8px_0_#060b18,0_20px_40px_rgba(0,0,0,.5)] backdrop-blur-xl",
              toast.kind === "combo" ? "border-ember/60 bg-[#3a1d10]/95" : toast.kind === "level" ? "border-gold/60 bg-[#2e2208]/95" : toast.kind === "hearts" ? "border-bear/60 bg-[#3d1426]/95" : "border-sky/50 bg-ink-800/95")}>
              {toast.kind === "combo" ? <FlameIcon size={34} className="anim-flame" /> : toast.kind === "level" ? <StarIcon size={34} className="anim-pop" /> : toast.kind === "hearts" ? <HeartIcon size={32} empty /> : <Target size={28} className="text-sky" />}
              <div>
                <div className="font-display text-base font-extrabold text-white">{toast.title}</div>
                {toast.sub && <div className="text-[11px] text-snow/70">{toast.sub}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </GameCtx.Provider>
  );
}

function BurstFx({ x, y, colors }: { x: number; y: number; colors: string[] }) {
  const parts = useMemo(() => [...Array(26)].map((_, i) => {
    const a = (i / 26) * Math.PI * 2 + Math.random() * 0.4;
    const d = 60 + Math.random() * 110;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d + 40, rot: Math.random() * 540, w: 5 + Math.random() * 6, h: 4 + Math.random() * 9, t: 0.8 + Math.random() * 0.6, round: i % 3 === 0 };
  }), []);
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {parts.map((p, i) => (
        <span key={i} className="absolute block" style={{ width: p.w, height: p.h, borderRadius: p.round ? 99 : 2, background: colors[i % colors.length], ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--rot" as string]: `${p.rot}deg`, animation: `confetti-fall ${p.t}s cubic-bezier(.2,.8,.4,1) forwards` } as CSSProperties} />
      ))}
    </div>
  );
}

/* ============================================================================
   PERSISTENT HUD DOCK — always visible, reacts to every answer on the page
   ========================================================================== */
export function HudDock() {
  const { s, level, levelPct, daily, refill, reset } = useGame();
  const [open, setOpen] = useState(true);
  const [shake, setShake] = useState(0);
  const prevWrong = useRef(s.wrong);
  useEffect(() => { if (s.wrong > prevWrong.current) setShake((k) => k + 1); prevWrong.current = s.wrong; }, [s.wrong]);
  const R = 17, C = 2 * Math.PI * R;
  const acc = s.correct + s.wrong ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : 100;

  return (
    <div className="fixed inset-x-0 bottom-3 z-[80] flex justify-center px-3 sm:bottom-5">
      <div key={shake} className={cn("pointer-events-auto flex items-center gap-1 rounded-[26px] border border-white/10 bg-ink-800/92 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_6px_0_#060b18,0_24px_50px_-10px_rgba(0,0,0,.8)] backdrop-blur-xl", shake && "anim-shake")}>
        {/* level ring */}
        <div className="relative grid h-12 w-12 shrink-0 place-items-center" title={`Level ${level}`}>
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
            <circle cx="20" cy="20" r={R} stroke="#0b1530" strokeWidth="4" fill="none" />
            <circle cx="20" cy="20" r={R} stroke="#ffc53d" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - levelPct / 100)} style={{ transition: "stroke-dashoffset .6s cubic-bezier(.3,1.4,.5,1)", filter: "drop-shadow(0 0 4px #ffc53d)" }} />
          </svg>
          <span key={level} className="num anim-pop text-sm font-black text-gold">{level}</span>
        </div>

        <div id="hud-xp" className="flex flex-col px-2">
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-mist">XP</span>
          <span key={s.xp} className="num anim-pop text-sm font-extrabold text-white">{s.xp}</span>
        </div>

        {open && (
          <>
            <div className="hidden w-24 flex-col px-2 sm:flex">
              <span className="flex justify-between text-[8px] font-extrabold uppercase tracking-widest text-mist"><span>Daily</span><span className="num text-bull">{Math.round(daily)}%</span></span>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_1px_2px_rgba(0,0,0,.6)]">
                <div className="h-full rounded-full bg-gradient-to-r from-bull-d to-bull transition-all duration-700" style={{ width: `${daily}%`, boxShadow: "0 0 8px #22d39a" }} />
              </div>
            </div>
            <div className={cn("flex items-center gap-1 rounded-2xl px-2 py-1.5 transition-colors", s.combo >= 3 ? "bg-ember/20" : "")} title="Combo">
              <FlameIcon size={24} className={s.combo >= 3 ? "anim-flame" : "opacity-40 grayscale"} />
              <span key={s.combo} className={cn("num anim-pop text-sm font-extrabold", s.combo >= 3 ? "text-ember" : "text-mist")}>×{s.combo}</span>
            </div>
            <button onClick={refill} className="flex items-center gap-1 rounded-2xl px-2 py-1.5 transition hover:bg-white/5" title={s.hearts < 5 ? "Refill for 50 gems" : "Hearts full"}>
              <HeartIcon size={24} empty={s.hearts === 0} />
              <span key={s.hearts} className="num anim-pop text-sm font-extrabold text-bear">{s.hearts}</span>
            </button>
            <div id="hud-gems" className="flex items-center gap-1 rounded-2xl px-2 py-1.5">
              <GemIcon size={22} />
              <span key={s.gems} className="num anim-pop text-sm font-extrabold text-cyan">{s.gems}</span>
            </div>
            <div className="hidden flex-col px-2 md:flex">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-mist">Accuracy</span>
              <span className="num text-sm font-extrabold text-snow">{acc}%</span>
            </div>
            <button onClick={reset} title="Reset progress" className="hidden h-9 w-9 place-items-center rounded-xl text-mist transition hover:bg-white/5 hover:text-white md:grid"><RotateCcw size={14} /></button>
          </>
        )}
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse HUD" : "Expand HUD"} className="grid h-9 w-9 place-items-center rounded-xl text-mist transition hover:bg-white/5 hover:text-white">
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
    </div>
  );
}
