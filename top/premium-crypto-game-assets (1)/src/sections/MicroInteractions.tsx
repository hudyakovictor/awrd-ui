import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Asset, Btn, Coin, Confetti, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp, damp, seeded, useRafLoop, useSpring, useSpring2D, useVisible } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 *  MICRO-INTERACTIONS — the tactile layer. Small, physical, immediate.
 *  Springs for anything that follows the hand, keyframes for one-shot
 *  feedback, direct DOM writes for per-frame chains.
 * =============================================================================*/

/* =============================================================================
 * 1. Magnetic buttons — attracted to the cursor with a spring; label lags.
 * ============================================================================*/
function Magnetic({ children, strength = 0.4, className }: { children: (inner: { x: number; y: number }) => ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const s = useSpring2D(t.x, t.y, 220, 14);
  return (
    <div
      ref={ref}
      className={cn("p-5 -m-5", className)}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setT({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
    >
      <div style={{ transform: `translate3d(${s.x}px, ${s.y}px, 0)` }}>{children({ x: s.x * 0.4, y: s.y * 0.4 })}</div>
    </div>
  );
}

function MagneticButtons() {
  return (
    <Asset code="MIC-01" title="Magnetic Buttons" desc="Buttons lean toward the cursor on a spring and snap back with overshoot. The label moves 40% further than the shell, creating depth inside the button." tags={["spring", "magnetic", "parallax"]}>
      <div className="well dotgrid rounded-2xl min-h-56 grid place-items-center gap-8 py-8">
        <Magnetic>
          {(inner) => (
            <button className="btn3d v-bull h-14 px-8 text-sm" style={{ ["--lip" as string]: "6px" }}>
              <span style={{ transform: `translate3d(${inner.x}px, ${inner.y}px, 0)`, display: "inline-flex", gap: 8, alignItems: "center" }}><Icon name="play" size={16} fill="currentColor" />Start lesson</span>
            </button>
          )}
        </Magnetic>
        <div className="flex gap-6">
          {[["bell", "v-sky"], ["heart", "v-bear"], ["star", "v-gold"]].map(([icon, v]) => (
            <Magnetic key={icon} strength={0.55}>
              {(inner) => (
                <button className={cn("btn3d w-14 h-14 !p-0 !rounded-full", v)} aria-label={icon}>
                  <span style={{ transform: `translate3d(${inner.x}px, ${inner.y}px, 0)`, display: "grid" }}><Icon name={icon} size={22} /></span>
                </button>
              )}
            </Magnetic>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 2. Press lab — ripple origin, jelly squash, hold-to-charge.
 * ============================================================================*/
function PressLab() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [jelly, setJelly] = useState(0);
  const [charge, setCharge] = useState(0);
  const [fired, setFired] = useState(0);
  const holding = useRef(false);
  useRafLoop((_, dt) => {
    setCharge((c) => (holding.current ? Math.min(1, c + dt / 1.1) : Math.max(0, c - dt * 3)));
  }, true);
  useEffect(() => {
    if (charge >= 1 && holding.current) {
      holding.current = false;
      setFired((f) => f + 1);
      navigator.vibrate?.([20, 30, 60]);
    }
  }, [charge]);

  return (
    <Asset code="MIC-02" title="Press Lab" desc="Three press personalities: a ripple that originates exactly where you tap, a jelly squash-and-stretch, and a hold-to-charge button that fires at 100%." tags={["ripple", "jelly", "hold"]}>
      <div className="space-y-4">
        <button
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const size = Math.hypot(r.width, r.height) * 2;
            const id = Date.now() + Math.random();
            setRipples((rs) => [...rs.slice(-4), { id, x: e.clientX - r.left, y: e.clientY - r.top, size }]);
            window.setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 700);
          }}
          className="relative w-full h-14 rounded-2xl overflow-hidden bg-gradient-to-b from-[#5cb3ff] to-[#2d8cf0] text-white font-black uppercase tracking-wider text-xs shadow-[0_5px_0_#1a56a8] active:translate-y-[5px] active:shadow-none transition-[transform,box-shadow] duration-75"
        >
          {ripples.map((r) => <span key={r.id} className="absolute rounded-full bg-white pointer-events-none" style={{ left: r.x, top: r.y, width: r.size, height: r.size, animation: "rippleOut .7s ease-out forwards" }} />)}
          <span className="relative">Ripple from touch point</span>
        </button>
        <button key={jelly} onClick={() => setJelly((j) => j + 1)} className={cn("btn3d v-violet w-full h-14 text-xs", jelly > 0 && "anim-jelly")}>Jelly squash</button>
        <div className="relative">
          <Confetti burst={fired} count={30} />
          <button
            onPointerDown={() => { holding.current = true; }}
            onPointerUp={() => { holding.current = false; }}
            onPointerLeave={() => { holding.current = false; }}
            className="relative w-full h-16 rounded-2xl overflow-hidden bg-ink-800 border-2 border-gold/40 font-black uppercase tracking-wider text-xs select-none touch-none"
            style={{ transform: `scale(${1 - charge * 0.04}) translate3d(${charge > 0.7 ? (Math.random() - 0.5) * charge * 3 : 0}px,0,0)` }}
          >
            <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#f5b01c] to-[#ffd560]" style={{ width: `${charge * 100}%` }} />
            <span className={cn("relative flex items-center justify-center gap-2", charge > 0.5 ? "text-[#3a2500]" : "text-gold")}>
              <Icon name="bolt" size={16} fill="currentColor" />{charge > 0 ? `Charging ${Math.round(charge * 100)}%` : "Hold to charge"}
            </span>
          </button>
        </div>
        <div className="text-[10px] text-mist text-center">Charged shots: <b className="num text-gold">{fired}</b></div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 3. Coin physics — click or drag to spawn coins that bounce and settle.
 * ============================================================================*/
const PW = 520, PH = 230;
type PhysCoin = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; sym: number; rest: number };
const COIN_COLORS = [["#F7931A", "₿"], ["#7B8CFF", "Ξ"], ["#14F195", "◎"], ["#ffc53d", "$"]] as const;

function CoinPhysics() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(wrap);
  const coins = useRef<PhysCoin[]>([]);
  const down = useRef(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = PW * dpr;
    c.height = PH * dpr;
    c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const spawn = (x: number, y: number, n = 1) => {
    for (let i = 0; i < n; i++) {
      coins.current.push({ x, y, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 260 - 60, r: 9 + Math.random() * 6, rot: 0, vr: (Math.random() - 0.5) * 10, sym: Math.floor(Math.random() * 4), rest: 0 });
    }
    if (coins.current.length > 220) coins.current.splice(0, coins.current.length - 220);
    setCount(coins.current.length);
  };
  const toLocal = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * PW, y: ((e.clientY - r.top) / r.height) * PH };
  };

  useRafLoop((_, dt) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const list = coins.current;
    for (const c of list) {
      c.vy += 1400 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
      if (c.y + c.r > PH - 6) { c.y = PH - 6 - c.r; c.vy *= -0.5; c.vx *= 0.82; c.vr *= 0.7; if (Math.abs(c.vy) < 40) c.vy = 0; }
      if (c.x - c.r < 0) { c.x = c.r; c.vx *= -0.6; }
      if (c.x + c.r > PW) { c.x = PW - c.r; c.vx *= -0.6; }
    }
    // cheap pairwise separation so coins pile instead of overlapping
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < min * min) {
          const d = Math.sqrt(d2);
          const push = (min - d) / 2;
          const nx = dx / d, ny = dy / d;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) { a.vx += rel * nx * 0.4; a.vy += rel * ny * 0.4; b.vx -= rel * nx * 0.4; b.vy -= rel * ny * 0.4; }
        }
      }
    }
    const bg = ctx.createLinearGradient(0, 0, 0, PH);
    bg.addColorStop(0, "#0a1636");
    bg.addColorStop(1, "#060d22");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, PW, PH);
    ctx.fillStyle = "#101d42";
    ctx.fillRect(0, PH - 6, PW, 6);
    for (const c of list) {
      const [col, g] = COIN_COLORS[c.sym];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath(); ctx.arc(1, 2, c.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.beginPath(); ctx.arc(-c.r * 0.3, -c.r * 0.3, c.r * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.font = `900 ${c.r}px Rubik, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g, 0, 1);
      ctx.restore();
    }
  }, visible);

  return (
    <Asset code="MIC-03" title="Coin Physics" desc="Click or drag to pour coins: gravity, wall bounces, floor friction and pairwise collision so they pile up realistically. Capped at 220 bodies for steady frame rate." tags={["canvas", "physics", "collision"]} span={2}>
      <div ref={wrap} className="relative rounded-[22px] overflow-hidden select-none">
        <canvas
          ref={canvas}
          className="block w-full touch-none cursor-copy"
          style={{ aspectRatio: `${PW}/${PH}` }}
          onPointerDown={(e) => { down.current = true; e.currentTarget.setPointerCapture(e.pointerId); const p = toLocal(e); spawn(p.x, p.y, 6); }}
          onPointerMove={(e) => { if (down.current) { const p = toLocal(e); spawn(p.x, p.y, 1); } }}
          onPointerUp={() => { down.current = false; }}
        />
        <div className="absolute top-3 left-3 glass rounded-xl px-2.5 py-1 num text-xs font-black pointer-events-none">{count} coins</div>
      </div>
      <div className="flex gap-2 mt-3">
        <Btn variant="gold" size="sm" icon="sparkle" onClick={() => { for (let i = 0; i < 8; i++) spawn(40 + Math.random() * (PW - 80), -20, 5); }}>Make it rain</Btn>
        <Btn variant="ghost" size="sm" icon="refresh" onClick={() => { coins.current = []; setCount(0); }}>Clear</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 4. Morphing icons — hamburger, play/pause path morph, like burst, bell.
 * ============================================================================*/
const PLAY_L = "M7 4 L13 7.5 L13 16.5 L7 20 Z";
const PLAY_R = "M13 7.5 L20 12 L20 12 L13 16.5 Z";
const PAUSE_L = "M6 4 L10 4 L10 20 L6 20 Z";
const PAUSE_R = "M14 4 L18 4 L18 20 L14 20 Z";

function MorphIcons() {
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeKey, setLikeKey] = useState(0);
  const [likes, setLikes] = useState(128);
  const [bell, setBell] = useState(0);
  const [saved, setSaved] = useState(false);
  const dStyle = (d: string): CSSProperties => ({ ["d" as string]: `path('${d}')`, transition: "d .35s cubic-bezier(.4,0,.2,1)" } as CSSProperties);
  return (
    <Asset code="MIC-04" title="Morphing Icons" desc="State changes morph instead of swap: bars fold into an X, play halves reshape into pause, likes burst with ring + sparks, the bell rings, bookmarks fill." tags={["morph", "burst", "state"]}>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setMenu(!menu)} className="game-surface rounded-2xl aspect-square grid place-items-center" aria-label="Toggle menu">
          <span className="relative w-7 h-5 block">
            <span className="absolute left-0 right-0 h-[3px] rounded-full bg-fog transition-all duration-300" style={{ top: menu ? 8 : 0, transform: menu ? "rotate(45deg)" : "none" }} />
            <span className="absolute left-0 right-0 top-2 h-[3px] rounded-full bg-fog transition-all duration-300" style={{ opacity: menu ? 0 : 1, transform: menu ? "scaleX(0)" : "none" }} />
            <span className="absolute left-0 right-0 h-[3px] rounded-full bg-fog transition-all duration-300" style={{ top: menu ? 8 : 16, transform: menu ? "rotate(-45deg)" : "none" }} />
          </span>
        </button>
        <button onClick={() => setPlaying(!playing)} className="game-surface rounded-2xl aspect-square grid place-items-center text-sky" aria-label={playing ? "Pause" : "Play"}>
          <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
            <path style={dStyle(playing ? PAUSE_L : PLAY_L)} d={playing ? PAUSE_L : PLAY_L} />
            <path style={dStyle(playing ? PAUSE_R : PLAY_R)} d={playing ? PAUSE_R : PLAY_R} />
          </svg>
        </button>
        <button onClick={() => { setLiked(!liked); setLikes((l) => l + (liked ? -1 : 1)); if (!liked) setLikeKey((k) => k + 1); }} className="game-surface rounded-2xl aspect-square grid place-items-center relative" aria-label="Like">
          <span className="relative grid place-items-center">
            {liked && <span key={`r${likeKey}`} className="absolute w-10 h-10 rounded-full border-bear border-solid" style={{ animation: "ringBurst .5s ease-out forwards" }} />}
            {liked && Array.from({ length: 8 }).map((_, i) => <span key={`s${likeKey}${i}`} className="absolute w-1.5 h-1.5 rounded-full" style={{ background: i % 2 ? "#ffc53d" : "#ff4b6e", ["--a" as string]: `${i * 45}deg`, animation: "sparkFly .55s ease-out forwards" }} />)}
            <span key={`h${likeKey}`} style={{ animation: liked ? "heartPop .45s cubic-bezier(.2,.9,.3,1.3)" : undefined, color: liked ? "#ff4b6e" : "#8ea3cf" }}><Icon name="heart" size={30} fill={liked ? "currentColor" : "none"} /></span>
          </span>
          <span className="absolute bottom-2 num text-[9px] font-black text-mist">{likes}</span>
        </button>
        <button onClick={() => setBell((b) => b + 1)} className="game-surface rounded-2xl aspect-square grid place-items-center relative" aria-label="Notifications">
          <span key={bell} className={cn("text-gold", bell > 0 && "anim-wiggle")} style={{ transformOrigin: "50% 10%" }}><Icon name="bell" size={30} /></span>
          {bell > 0 && <span key={`b${bell}`} className="absolute top-3 right-4 min-w-5 h-5 px-1 rounded-full bg-bear text-[10px] font-black grid place-items-center anim-pop">{bell}</span>}
        </button>
        <button onClick={() => setSaved(!saved)} className="game-surface rounded-2xl aspect-square grid place-items-center" aria-label="Bookmark">
          <svg viewBox="0 0 24 24" width="30" height="30">
            <defs><clipPath id="bmClip"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></clipPath></defs>
            <rect x="0" width="24" height="24" fill="#22d38a" clipPath="url(#bmClip)" style={{ transform: `translateY(${saved ? 0 : 24}px)`, transition: "transform .4s cubic-bezier(.2,.9,.3,1.2)" }} />
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="none" stroke={saved ? "#22d38a" : "#8ea3cf"} strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
        <ToggleMorph />
      </div>
    </Asset>
  );
}

function ToggleMorph() {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn(!on)} className="game-surface rounded-2xl aspect-square grid place-items-center" aria-label="Theme toggle">
      <span className="relative w-9 h-9 grid place-items-center">
        <span className="absolute inset-0 rounded-full transition-all duration-500" style={{ background: on ? "#ffc53d" : "#c9d6f5", transform: on ? "scale(.7)" : "scale(.85)", boxShadow: on ? "0 0 18px #ffc53d" : "none" }} />
        <span className="absolute w-7 h-7 rounded-full bg-[#15244a] transition-all duration-500" style={{ transform: on ? "translate(18px,-18px) scale(.3)" : "translate(7px,-5px)" }} />
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className="absolute w-1 h-2 rounded-full bg-gold transition-all duration-500" style={{ transform: `rotate(${i * 45}deg) translateY(${on ? -17 : -8}px) scale(${on ? 1 : 0})` }} />)}
      </span>
    </button>
  );
}

/* =============================================================================
 * 5. Zoom & pan chart — wheel zoom around the cursor, drag to pan, minimap.
 * ============================================================================*/
const ZN = 220;
const ZDATA = (() => {
  const rnd = seeded(9);
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 100;
  for (let i = 0; i < ZN; i++) {
    const o = p;
    const c = o + (rnd() - 0.48) * 4 + Math.sin(i / 18) * 0.8;
    out.push({ o, c, h: Math.max(o, c) + rnd() * 1.6, l: Math.min(o, c) - rnd() * 1.6 });
    p = c;
  }
  return out;
})();

function ZoomPanChart() {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ a: ZN - 60, b: ZN - 1 });
  const [armed, setArmed] = useState(false);
  const drag = useRef<{ x: number; a: number; b: number } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const armedRef = useRef(armed);
  armedRef.current = armed;

  const zoomAt = (fx: number, factor: number) => {
    const { a, b } = viewRef.current;
    const range = b - a;
    const center = a + fx * range;
    const next = clamp(range * factor, 12, ZN - 1);
    let na = center - fx * next;
    na = clamp(na, 0, ZN - 1 - next);
    setView({ a: na, b: na + next });
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Only hijack the wheel when the chart is armed (clicked) or on pinch/Ctrl+wheel.
      if (!armedRef.current && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(clamp((e.clientX - r.left) / r.width, 0, 1), Math.pow(1.0018, e.deltaY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const a0 = Math.max(0, Math.floor(view.a));
  const b0 = Math.min(ZN - 1, Math.ceil(view.b));
  const vis = ZDATA.slice(a0, b0 + 1);
  const hi = Math.max(...vis.map((d) => d.h));
  const lo = Math.min(...vis.map((d) => d.l));
  const range = view.b - view.a;
  const X = (i: number) => ((i - view.a) / range) * 100;
  const Y = (v: number) => 4 + ((hi - v) / (hi - lo || 1)) * 88;
  const bw = Math.max(0.15, (100 / range) * 0.62);
  const mini = ZDATA.map((d, i) => `${(i / (ZN - 1)) * 100},${30 - ((d.c - 80) / 50) * 28}`).join(" ");

  return (
    <Asset code="MIC-05" title="Zoom & Pan Chart" desc="Click the chart to arm it, then scroll to zoom around the cursor (Ctrl/⌘ or pinch works anytime). Drag to pan, double-click to reset, drag the minimap window to jump." tags={["zoom", "pan", "minimap"]} span={2}>
      <div
        ref={box}
        tabIndex={0}
        onFocus={() => setArmed(true)}
        onBlur={() => setArmed(false)}
        onDoubleClick={() => setView({ a: ZN - 60, b: ZN - 1 })}
        onPointerDown={(e) => { drag.current = { x: e.clientX, a: view.a, b: view.b }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const r = e.currentTarget.getBoundingClientRect();
          const shift = (-(e.clientX - d.x) / r.width) * (d.b - d.a);
          const na = clamp(d.a + shift, 0, ZN - 1 - (d.b - d.a));
          setView({ a: na, b: na + (d.b - d.a) });
        }}
        onPointerUp={() => { drag.current = null; }}
        className={cn("relative h-60 rounded-[22px] well overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing outline-none transition-shadow", armed && "ring-2 ring-sky/50")}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(140,175,255,.07)" vectorEffect="non-scaling-stroke" />)}
          {vis.map((d, k) => {
            const i = a0 + k;
            const up = d.c >= d.o;
            const col = up ? "#22d38a" : "#ff4b6e";
            return (
              <g key={i}>
                <line x1={X(i)} x2={X(i)} y1={Y(d.h)} y2={Y(d.l)} stroke={col} vectorEffect="non-scaling-stroke" />
                <rect x={X(i) - bw / 2} y={Y(Math.max(d.o, d.c))} width={bw} height={Math.max(0.4, Math.abs(Y(d.o) - Y(d.c)))} fill={col} />
              </g>
            );
          })}
        </svg>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="glass rounded-lg px-2 py-1 num text-[10px] font-black">{Math.round(range)} candles</span>
          <span className={cn("glass rounded-lg px-2 py-1 text-[10px] font-black", armed ? "text-sky" : "text-mist")}>{armed ? "Scroll to zoom" : "Click to arm zoom"}</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => zoomAt(0.5, 0.7)} className="w-8 h-8 rounded-lg glass grid place-items-center" aria-label="Zoom in"><Icon name="plus" size={14} stroke={3} /></button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => zoomAt(0.5, 1.4)} className="w-8 h-8 rounded-lg glass grid place-items-center" aria-label="Zoom out"><Icon name="minus" size={14} stroke={3} /></button>
        </div>
      </div>
      <MiniMap mini={mini} view={view} onMove={(a) => setView((v) => ({ a, b: a + (v.b - v.a) }))} />
    </Asset>
  );
}

function MiniMap({ mini, view, onMove }: { mini: string; view: { a: number; b: number }; onMove: (a: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const grab = useRef<number | null>(null);
  const toA = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const w = view.b - view.a;
    return clamp(((clientX - r.left) / r.width) * (ZN - 1) - (grab.current ?? w / 2), 0, ZN - 1 - w);
  };
  return (
    <div
      ref={ref}
      className="relative h-10 mt-2 rounded-xl well overflow-hidden touch-none cursor-pointer"
      onPointerDown={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const at = ((e.clientX - r.left) / r.width) * (ZN - 1);
        grab.current = at >= view.a && at <= view.b ? at - view.a : (view.b - view.a) / 2;
        onMove(toA(e.clientX));
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => { if (grab.current !== null) onMove(toA(e.clientX)); }}
      onPointerUp={() => { grab.current = null; }}
    >
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="absolute inset-0 w-full h-full"><polyline points={mini} fill="none" stroke="#3da5ff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity=".6" /></svg>
      <div className="absolute inset-y-0 rounded-md border-2 border-sky bg-sky/15" style={{ left: `${(view.a / (ZN - 1)) * 100}%`, width: `${((view.b - view.a) / (ZN - 1)) * 100}%` }} />
    </div>
  );
}

/* =============================================================================
 * 6. Drag to classify — drop pattern chips into the right bucket.
 * ============================================================================*/
const CHIPS = [
  { id: 1, name: "Hammer", kind: "bull" }, { id: 2, name: "Shooting star", kind: "bear" },
  { id: 3, name: "Bullish engulfing", kind: "bull" }, { id: 4, name: "Evening star", kind: "bear" },
  { id: 5, name: "Morning star", kind: "bull" }, { id: 6, name: "Dark cloud cover", kind: "bear" },
] as const;

function DragClassify() {
  const [placed, setPlaced] = useState<Record<number, "bull" | "bear">>({});
  const [drag, setDrag] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [hover, setHover] = useState<"bull" | "bear" | null>(null);
  const [burstN, setBurstN] = useState(0);
  const start = useRef({ x: 0, y: 0 });
  const bull = useRef<HTMLDivElement>(null);
  const bear = useRef<HTMLDivElement>(null);
  const hit = (x: number, y: number): "bull" | "bear" | null => {
    for (const [k, ref] of [["bull", bull], ["bear", bear]] as const) {
      const r = ref.current?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return k;
    }
    return null;
  };
  const remaining = CHIPS.filter((c) => !placed[c.id]);
  const done = remaining.length === 0;

  return (
    <Asset code="MIC-06" title="Drag to Classify" desc="Drag each pattern into Bullish or Bearish. Buckets light up on hover; correct drops are absorbed, wrong ones spring back and shake." tags={["drag & drop", "hit-test", "spring back"]}>
      <div className="relative">
        <Confetti burst={burstN} count={30} />
        <div className="flex flex-wrap gap-2 min-h-[92px] mb-4">
          {remaining.map((c) => {
            const d = drag?.id === c.id ? drag : null;
            return (
              <div
                key={c.id}
                onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; setDrag({ id: c.id, dx: 0, dy: 0 }); e.currentTarget.setPointerCapture(e.pointerId); }}
                onPointerMove={(e) => { if (!d) return; setDrag({ id: c.id, dx: e.clientX - start.current.x, dy: e.clientY - start.current.y }); setHover(hit(e.clientX, e.clientY)); }}
                onPointerUp={(e) => {
                  const target = hit(e.clientX, e.clientY);
                  setDrag(null);
                  setHover(null);
                  if (!target) return;
                  if (target === c.kind) {
                    setPlaced((p) => ({ ...p, [c.id]: target }));
                    navigator.vibrate?.(10);
                    if (remaining.length === 1) setBurstN((b) => b + 1);
                  } else {
                    setWrong(c.id);
                    navigator.vibrate?.([30, 30, 30]);
                    window.setTimeout(() => setWrong(null), 450);
                  }
                }}
                className={cn("h-10 px-3 rounded-xl border-2 border-ink-500 bg-ink-750 flex items-center gap-2 text-[11px] font-bold cursor-grab active:cursor-grabbing touch-none select-none", wrong === c.id && "anim-shake !border-bear")}
                style={{
                  transform: d ? `translate3d(${d.dx}px, ${d.dy}px, 0) rotate(${d.dx * 0.03}deg) scale(1.06)` : "none",
                  transition: d ? "none" : "transform .45s cubic-bezier(.3,1.6,.5,1)",
                  zIndex: d ? 30 : 1,
                  position: "relative",
                  boxShadow: d ? "0 16px 30px -12px rgba(0,0,0,.8)" : "0 3px 0 #0a1430",
                }}
              >
                <Icon name="candles" size={14} className="text-mist" />{c.name}
              </div>
            );
          })}
          {done && <div className="w-full text-center text-sm font-black text-bull anim-pop py-6">All sorted! +30 XP</div>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["bull", "bear"] as const).map((k) => {
            const items = CHIPS.filter((c) => placed[c.id] === k);
            const color = k === "bull" ? "#22d38a" : "#ff4b6e";
            return (
              <div key={k} ref={k === "bull" ? bull : bear} className="rounded-2xl border-2 border-dashed p-3 min-h-32 transition-all duration-200" style={{ borderColor: hover === k ? color : `${color}44`, background: hover === k ? `${color}1f` : `${color}08`, transform: hover === k ? "scale(1.03)" : "none" }}>
                <div className="flex items-center gap-2 mb-2" style={{ color }}><Icon name={k === "bull" ? "trendUp" : "trendDown"} size={16} /><span className="text-xs font-black uppercase">{k === "bull" ? "Bullish" : "Bearish"}</span><span className="ml-auto num text-[10px]">{items.length}/3</span></div>
                <div className="space-y-1">{items.map((c) => <div key={c.id} className="text-[10px] font-bold px-2 py-1 rounded-lg anim-pop" style={{ background: `${color}26`, color }}>{c.name}</div>)}</div>
              </div>
            );
          })}
        </div>
        {Object.keys(placed).length > 0 && <button onClick={() => setPlaced({})} className="text-[10px] text-mist hover:text-fog mt-2">↺ reset</button>}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 7. Rubber band — pull the token; it springs home with tension.
 * ============================================================================*/
function RubberBand() {
  const box = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [launches, setLaunches] = useState(0);
  const s = useSpring2D(target.x, target.y, dragging ? 900 : 140, dragging ? 45 : 7);
  const dist = Math.hypot(s.x, s.y);
  const tension = clamp(dist / 140, 0, 1);
  const [size, setSize] = useState({ w: 300, h: 240 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cx = size.w / 2, cy = size.h / 2;
  // Band sags perpendicular to its direction; less sag as tension rises.
  const sag = (1 - tension) * Math.min(30, dist * 0.25);
  const qx = cx + s.x / 2 + (dist ? (-s.y / dist) * sag : 0);
  const qy = cy + s.y / 2 + (dist ? (s.x / dist) * sag : 0) + sag * 0.6;
  return (
    <Asset code="MIC-07" title="Rubber Band" desc="Grab the coin and pull. Resistance grows with distance, the band sags and colours with tension; let go and a low-damping spring snaps it home with overshoot." tags={["spring", "elastic", "tension"]}>
      <div
        ref={box}
        className="relative h-60 rounded-[22px] well dotgrid overflow-hidden touch-none select-none"
        onPointerMove={(e) => {
          if (!dragging) return;
          const r = box.current!.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy) || 1;
          const eased = Math.pow(d, 0.82); // resistance
          setTarget({ x: (dx / d) * eased, y: (dy / d) * eased });
        }}
        onPointerUp={() => { if (dragging) { setDragging(false); if (tension > 0.7) { setLaunches((l) => l + 1); navigator.vibrate?.(25); } setTarget({ x: 0, y: 0 }); } }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${size.w} ${size.h}`}>
          <path d={`M${cx},${cy} Q${qx},${qy} ${cx + s.x},${cy + s.y}`} fill="none" stroke={`hsl(${140 - tension * 140} 80% 60%)`} strokeWidth={6 - tension * 3.5} strokeLinecap="round" opacity={dist > 4 ? 1 : 0} />
        </svg>
        <div className="absolute left-1/2 top-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full bg-fog" />
        <div
          onPointerDown={(e) => { setDragging(true); box.current?.setPointerCapture(e.pointerId); }}
          className="absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing"
          style={{ transform: `translate3d(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px), 0) scale(${1 + tension * 0.15}) rotate(${s.x * 0.3}deg)` }}
        >
          <Coin sym="BTC" size={56} />
        </div>
        <div className="absolute bottom-3 inset-x-3 flex justify-between text-[10px] font-black">
          <span className="text-mist">Tension <span className="num" style={{ color: `hsl(${140 - tension * 140} 80% 60%)` }}>{Math.round(tension * 100)}%</span></span>
          <span className="text-mist">Snaps <span className="num text-gold">{launches}</span></span>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 8. Odometer — rolling digit columns for balance changes.
 * ============================================================================*/
function Digit({ d }: { d: string }) {
  const n = Number(d);
  if (Number.isNaN(n)) return <span className="inline-block w-[.35em] text-center">{d}</span>;
  return (
    <span className="inline-block h-[1em] overflow-hidden align-bottom leading-none" style={{ width: ".62em" }}>
      <span className="flex flex-col transition-transform duration-700" style={{ transform: `translateY(${-n * 10}%)`, transitionTimingFunction: "cubic-bezier(.2,.9,.3,1.15)" }}>
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className="h-[1em] leading-none text-center">{i}</span>)}
      </span>
    </span>
  );
}

function Odometer() {
  const [value, setValue] = useState(12846.32);
  const [delta, setDelta] = useState<{ v: number; key: number } | null>(null);
  const apply = (v: number) => { setValue((x) => Math.max(0, +(x + v).toFixed(2))); setDelta({ v, key: Date.now() }); };
  const text = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chars = text.split("");
  return (
    <Asset code="MIC-08" title="Odometer Balance" desc="Each digit is a rolling column with its own overshoot, so only the digits that change move. The delta chip floats up in profit or loss colour." tags={["odometer", "digits", "delta"]}>
      <div className="well rounded-2xl p-5 text-center relative overflow-hidden">
        <div className="text-[9px] uppercase tracking-widest font-black text-mist mb-2">Demo balance</div>
        <div className="num font-black text-4xl sm:text-5xl text-fog tabular-nums">
          <span className="text-mist">$</span>
          {chars.map((c, i) => <Digit key={chars.length - i} d={c} />)}
        </div>
        {delta && <div key={delta.key} className={cn("absolute right-4 top-4 num text-xs font-black px-2 py-1 rounded-lg", delta.v >= 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")} style={{ animation: "riseOut 1.2s ease-out forwards" }}>{delta.v >= 0 ? "+" : "−"}${Math.abs(delta.v).toLocaleString()}</div>}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[[-512.4, "bear"], [-9.99, "ghost"], [37.25, "ghost"], [1280, "bull"]].map(([v, variant]) => (
          <Btn key={v as number} variant={variant as "bear" | "ghost" | "bull"} size="xs" onClick={() => apply(v as number)}>{(v as number) > 0 ? "+" : ""}{v as number}</Btn>
        ))}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 9. Cursor comet — a chain of dots, each damping toward the previous one.
 * ============================================================================*/
function CursorComet() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const pts = useRef(Array.from({ length: 14 }, () => ({ x: 150, y: 110 })));
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const t = useRef(0);
  useRafLoop((_, dt) => {
    t.current += dt;
    const el = box.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    // idle demo: lissajous orbit when the cursor is away
    const target = pointer.current ?? { x: w / 2 + Math.sin(t.current * 1.3) * w * 0.32, y: h / 2 + Math.sin(t.current * 2.1) * h * 0.28 };
    pts.current.forEach((p, i) => {
      const lead = i === 0 ? target : pts.current[i - 1];
      p.x = damp(p.x, lead.x, 26 - i * 1.2, dt);
      p.y = damp(p.y, lead.y, 26 - i * 1.2, dt);
      const node = dots.current[i];
      if (node) node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%,-50%) scale(${1 - i / 18})`;
    });
  }, visible);
  return (
    <Asset code="MIC-09" title="Cursor Comet" desc="Fourteen dots chase each other with decreasing stiffness, forming a liquid trail. Transforms are written straight to the DOM per frame; when idle it orbits on its own." tags={["follow", "chain", "direct DOM"]}>
      <div
        ref={box}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }}
        onPointerLeave={() => { pointer.current = null; }}
        className="relative h-56 rounded-[22px] overflow-hidden bg-ink-950 cursor-none"
      >
        <div className="absolute inset-0 dotgrid opacity-30" />
        {pts.current.map((_, i) => (
          <span
            key={i}
            ref={(n) => { dots.current[i] = n; }}
            className="absolute left-0 top-0 rounded-full pointer-events-none"
            style={{ width: 22, height: 22, background: `hsl(${150 + i * 12} 85% ${62 - i * 2}%)`, opacity: 1 - i / 16, boxShadow: i === 0 ? "0 0 24px #22d38a" : "none", mixBlendMode: "screen" }}
          />
        ))}
        <div className="absolute bottom-3 inset-x-0 text-center text-[9px] uppercase tracking-widest font-black text-mist">move inside</div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 10. Slide to confirm — drag the knob to the end to place an order.
 * ============================================================================*/
function SlideToConfirm() {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [max, setMax] = useState(240);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [burstN, setBurstN] = useState(0);
  const start = useRef(0);
  const KNOB = 52;
  useEffect(() => {
    const m = () => setMax(Math.max(0, (track.current?.clientWidth ?? 300) - KNOB - 8));
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);
  const p = max ? x / max : 0;
  const spring = useSpring(dragging || done ? x : 0, 260, 20);
  const shown = dragging ? x : done ? max : spring;
  return (
    <Asset code="MIC-10" title="Slide to Confirm" desc="An intentional, hard-to-trigger-by-accident confirm. The label fades and the track fills as you slide; release early and the knob springs back." tags={["slide", "confirm", "safety"]}>
      <div className="relative">
        <Confetti burst={burstN} count={26} />
        <div ref={track} className={cn("relative h-[68px] rounded-full p-2 overflow-hidden transition-colors duration-300", done ? "bg-bull" : "well")}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-bull/25" style={{ width: shown + KNOB + 8 }} />
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {done ? (
              <span className="font-black text-ink-900 flex items-center gap-2 anim-pop"><Icon name="check" size={18} stroke={3.5} />Order placed</span>
            ) : (
              <span className="text-sm font-black uppercase tracking-wider" style={{ opacity: 1 - p * 1.4, background: "linear-gradient(90deg,#8ea3cf 0%,#eef3ff 50%,#8ea3cf 100%)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "shimmer 2.2s linear infinite" }}>Slide to buy 0.01 BTC</span>
            )}
          </div>
          <div
            onPointerDown={(e) => { if (done) return; setDragging(true); start.current = e.clientX - x; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (dragging) setX(clamp(e.clientX - start.current, 0, max)); }}
            onPointerUp={() => {
              if (!dragging) return;
              setDragging(false);
              if (x >= max * 0.92) { setX(max); setDone(true); setBurstN((b) => b + 1); navigator.vibrate?.([20, 40, 20]); }
              else setX(0);
            }}
            className={cn("relative h-[52px] w-[52px] rounded-full grid place-items-center touch-none select-none", done ? "bg-white text-bull" : "bg-gradient-to-b from-[#3ce49e] to-[#16b56f] text-white cursor-grab active:cursor-grabbing shadow-[0_4px_0_#0b7a4a,inset_0_2px_0_rgba(255,255,255,.3)]")}
            style={{ transform: `translate3d(${shown}px,0,0)` }}
          >
            <Icon name={done ? "check" : "chevR"} size={22} stroke={3} className={done ? "" : "anim-nudge"} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 text-[10px] text-mist">
        <span>Demo order · simulated funds</span>
        {done && <button onClick={() => { setDone(false); setX(0); }} className="text-sky font-black">Reset</button>}
      </div>
    </Asset>
  );
}

export default function MicroInteractions() {
  return (
    <Section id="micro" index="P5" title="Micro-interactions" subtitle="The tactile layer: magnetic springs, ripples, physics, morphing icons, zoomable charts, drag-and-drop, elastic bands and rolling digits.">
      <CoinPhysics />
      <MagneticButtons />
      <PressLab />
      <MorphIcons />
      <ZoomPanChart />
      <DragClassify />
      <RubberBand />
      <Odometer />
      <CursorComet />
      <SlideToConfirm />
    </Section>
  );
}
