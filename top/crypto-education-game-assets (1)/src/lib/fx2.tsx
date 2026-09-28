import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { clamp, lerp, useAssetVisible, useRaf } from "./motion";
import { sfx } from "./sound";

/* ============================================================
 * FX2 — advanced juice: canvas particles, shockwaves, trails,
 * floating combat text pool, coin rain, starfield, glitch.
 * ============================================================ */

/* ---------- Floating combat text pool ---------- */
type FCT = { id: number; x: number; y: number; text: string; color: string; size: number };
let fctId = 0;
const fctSubs = new Set<(l: FCT[]) => void>();
let fctList: FCT[] = [];
export function combatText(x: number, y: number, text: string, color = "#fff", size = 18) {
  const it = { id: ++fctId, x, y, text, color, size };
  fctList = [...fctList.slice(-24), it];
  fctSubs.forEach((f) => f(fctList));
  setTimeout(() => {
    fctList = fctList.filter((i) => i.id !== it.id);
    fctSubs.forEach((f) => f(fctList));
  }, 1100);
}
export function CombatTextLayer() {
  const [list, setList] = useState<FCT[]>([]);
  useEffect(() => {
    fctSubs.add(setList);
    return () => {
      fctSubs.delete(setList);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {list.map((t) => (
        <span
          key={t.id}
          className="absolute font-display font-black"
          style={{
            left: t.x,
            top: t.y,
            color: t.color,
            fontSize: t.size,
            textShadow: "0 3px 0 rgba(0,0,0,.5), 0 0 16px currentColor",
            animation: "float-text 1.05s cubic-bezier(.2,.9,.3,1) forwards",
          }}
        >
          {t.text}
        </span>
      ))}
    </div>
  );
}

/* ---------- Cursor trail (desktop) ---------- */
export function CursorTrail({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; life: number; c: string; s: number };
    const parts: P[] = [];
    const colors = ["#22d39a", "#2fd4ff", "#ffc23d", "#9170ff", "#ff4d6d"];
    let ci = 0;
    let lx = -99;
    let ly = -99;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) {
        const n = Math.min(3, Math.floor(dist / 12));
        for (let i = 0; i < n; i++) {
          parts.push({
            x: lx + (dx * i) / n,
            y: ly + (dy * i) / n,
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60 - 20,
            life: 1,
            c: colors[ci++ % colors.length],
            s: 3 + Math.random() * 5,
          });
        }
        if (parts.length > 160) parts.splice(0, parts.length - 160);
      }
      lx = e.clientX;
      ly = e.clientY;
    };
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt * 1.8;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}

/* ---------- Coin rain overlay ---------- */
export function useCoinRain() {
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(40);
  const rain = (n = 40) => {
    setCount(n);
    setActive((a) => a + 1);
    sfx("open");
  };
  return { active, count, rain };
}
export function CoinRain({ fire, count = 40 }: { fire: number; count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        l: Math.random() * 100,
        d: Math.random() * 0.9,
        dur: 1.6 + Math.random() * 1.4,
        s: 18 + Math.random() * 26,
        k: ["₿", "Ξ", "◎", "💎", "🪙"][i % 5],
        spin: 2 + Math.random() * 4,
      })),
    [fire, count],
  );
  if (!fire) return null;
  return (
    <div key={fire} className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute -top-10 flex items-center justify-center rounded-full"
          style={{
            left: `${p.l}%`,
            width: p.s,
            height: p.s,
            fontSize: p.s * 0.55,
            background: p.k === "💎" ? "linear-gradient(180deg,#8ff0ff,#1c8cff)" : "linear-gradient(180deg,#ffe28a,#f0a000)",
            boxShadow: "0 3px 0 rgba(0,0,0,.3)",
            animation: `coin-fall ${p.dur}s ${p.d}s cubic-bezier(.3,.4,.6,1) forwards`,
          }}
        >
          {p.k}
        </span>
      ))}
      <style>{`@keyframes coin-fall{0%{transform:translateY(-40px) rotate(0)}100%{transform:translateY(110vh) rotate(720deg)}}`}</style>
    </div>
  );
}

/* ---------- Shockwave ring (imperative, positioned) ---------- */
export function Shockwave({ x, y, color = "#22d39a", onDone }: { x: number; y: number; color?: string; onDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 700);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pointer-events-none fixed z-[80] block rounded-full border-4"
          style={{
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderColor: color,
            animation: `ring-out .65s ${i * 0.09}s ease-out forwards`,
          }}
        />
      ))}
    </>
  );
}

/* ---------- Screen flash + shake helpers ---------- */
export function screenFlash(color = "255,255,255", opacity = 0.5, ms = 350) {
  const d = document.createElement("div");
  d.style.cssText = `position:fixed;inset:0;z-index:88;pointer-events:none;background:rgba(${color},${opacity});transition:opacity ${ms}ms;opacity:${opacity}`;
  document.body.appendChild(d);
  requestAnimationFrame(() => {
    d.style.opacity = "0";
    setTimeout(() => d.remove(), ms + 30);
  });
}
export function shakeElement(el: HTMLElement | null, strength = 8) {
  if (!el) return;
  el.animate(
    [
      { transform: "translate(0,0)" },
      { transform: `translate(${-strength}px,${strength / 2}px)` },
      { transform: `translate(${strength}px,${-strength / 2}px)` },
      { transform: `translate(${-strength / 2}px,${strength / 3}px)` },
      { transform: "translate(0,0)" },
    ],
    { duration: 380, easing: "ease-out" },
  );
}

/* ---------- Starfield canvas (hero / backgrounds) ---------- */
export function Starfield({ density = 90, speed = 1, className }: { density?: number; speed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useAssetVisible();
  useEffect(() => {
    if (!visible) return;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let stars = Array.from({ length: density }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2, s: Math.random() * 1.8 + 0.4 }));
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      ctx.clearRect(0, 0, W, H);
      stars.forEach((st) => {
        st.y += dt * 0.02 * st.z * speed;
        if (st.y > 1) {
          st.y = 0;
          st.x = Math.random();
        }
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 900 + st.x * 20));
        ctx.globalAlpha = tw * st.z;
        ctx.fillStyle = "#bccbea";
        ctx.fillRect(st.x * W, st.y * H, st.s, st.s);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, density, speed]);
  return <canvas ref={ref} className={cn("absolute inset-0 h-full w-full", className)} />;
}

/* ---------- Animated gradient orb ---------- */
export function Orb({ color, size = 200, blur = 60, className, style }: { color: string; size?: number; blur?: number; className?: string; style?: React.CSSProperties }) {
  return <div className={cn("pointer-events-none absolute rounded-full", className)} style={{ width: size, height: size, background: color, filter: `blur(${blur}px)`, opacity: 0.5, ...style }} />;
}

/* ---------- Countdown overlay 3-2-1-GO ---------- */
export function Countdown({ onDone, size = "md" }: { onDone: () => void; size?: "md" | "lg" }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    sfx("countdown");
    const seq = [2, 1, 0];
    seq.forEach((v, i) =>
      setTimeout(() => {
        setN(v);
        sfx(v === 0 ? "go" : "countdown");
        if (v === 0) setTimeout(onDone, 550);
      }, (i + 1) * 700),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/60 backdrop-blur-[2px]">
      <span
        key={n}
        className={cn("font-display font-black text-white drop-shadow-[0_8px_0_#1c55c2]", size === "lg" ? "text-9xl" : "text-7xl")}
        style={{ animation: "count-in .7s ease forwards" }}
      >
        {n === 0 ? "GO!" : n}
      </span>
    </div>
  );
}

/* ---------- Combo meter (fills, decays, pops tiers) ---------- */
export function ComboMeter({ combo, max = 12 }: { combo: number; max?: number }) {
  const tier = combo >= 9 ? 3 : combo >= 5 ? 2 : combo >= 2 ? 1 : 0;
  const label = ["", "Combo", "Super", "INSANE"][tier];
  const col = ["", "#22d39a", "#ffc23d", "#ff7a2f"][tier];
  if (!combo) return null;
  return (
    <div key={combo} className="anim-pop flex items-center gap-2 rounded-2xl bg-ink-950/70 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur">
      <span className="font-display text-lg font-black" style={{ color: col }}>
        ×{combo}
      </span>
      {tier > 0 && (
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: col }}>
          {label}
        </span>
      )}
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${clamp((combo / max) * 100, 4, 100)}%`, background: col }} />
      </div>
    </div>
  );
}

/* ---------- Score pop (+N that rises from a ref element) ---------- */
export function scorePop(el: Element | null, text: string, color = "#22d39a") {
  if (!el) return;
  const r = el.getBoundingClientRect();
  combatText(r.left + r.width / 2, r.top - 6, text, color, 20);
}

/* ---------- Ticker number (slot-machine digits) ---------- */
export function TickNumber({ value, className }: { value: number; className?: string }) {
  const str = Math.round(value).toLocaleString("en-US");
  return (
    <span className={cn("inline-flex overflow-hidden font-mono font-bold tabular-nums", className)}>
      {str.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${str.length}-${i}`} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ transform: `translateY(-${Number(ch) * 10}%)` }}>
              {Array.from({ length: 10 }).map((_, d) => (
                <span key={d} className="block h-[1em] text-center leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${str.length}-${i}`}>{ch}</span>
        ),
      )}
    </span>
  );
}

/* ---------- Animated SVG ring with gradient + glow ---------- */
export function GlowRing({
  pct,
  size = 120,
  stroke = 10,
  colors = ["#22d39a", "#2fd4ff"],
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  colors?: [string, string];
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = useMemo(() => `gr${Math.random().toString(36).slice(2, 7)}`, []);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a1330" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamp(pct, 0, 1))}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.3,1.2,.5,1)", filter: `drop-shadow(0 0 6px ${colors[0]})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/* ---------- Marquee row (CSS-driven, pause on hover) ---------- */
export function Marquee({ children, speed = 30, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  return (
    <div className={cn("group/mq overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]", className)}>
      <div className="flex w-max gap-3" style={{ animation: `ticker ${speed}s linear infinite` }}>
        <div className="flex gap-3 group-hover/mq:[animation-play-state:paused]" style={{ animation: "none" }}>
          {children}
        </div>
        <div className="flex gap-3" aria-hidden>
          {children}
        </div>
      </div>
      <style>{`.group\\/mq:hover > div{animation-play-state:paused}`}</style>
    </div>
  );
}

/* ---------- Springy number that lerps toward target each frame ---------- */
export function useSpringNumber(target: number, speed = 8) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useRaf((dt) => {
    const nv = lerp(cur.current, target, Math.min(1, dt * speed));
    if (Math.abs(nv - cur.current) > 0.0001 || nv !== cur.current) {
      cur.current = nv;
      setV(nv);
    }
  });
  return v;
}

/* ---------- Glitch text ---------- */
export function Glitch({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{text}</span>
      <span aria-hidden className="absolute inset-0 text-bear opacity-70" style={{ animation: "glitch .8s steps(2) infinite", clipPath: "inset(0 0 55% 0)" }}>
        {text}
      </span>
      <span aria-hidden className="absolute inset-0 text-cyan opacity-70" style={{ animation: "glitch .9s steps(2) infinite reverse", clipPath: "inset(55% 0 0 0)" }}>
        {text}
      </span>
    </span>
  );
}
