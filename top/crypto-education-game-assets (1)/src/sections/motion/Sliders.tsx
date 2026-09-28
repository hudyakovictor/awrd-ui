import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Label } from "../../components/ui";
import { Icon } from "../../components/icons";
import { sfx } from "../../lib/sound";
import { clamp, ease, mapRange, mulberry32, tween } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-08 · DUAL RANGE + HISTOGRAM — price range filter with live bars
 * ===================================================================== */
function DualRange() {
  const MIN = 20000;
  const MAX = 80000;
  const STEP = 500;
  const [lo, setLo] = useState(45000);
  const [hi, setHi] = useState(68000);
  const [active, setActive] = useState<"lo" | "hi" | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const bars = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => {
        const x = i / 43;
        return 0.12 + Math.exp(-Math.pow((x - 0.58) / 0.2, 2)) * 0.8 * (0.65 + 0.35 * Math.pow(Math.sin(i * 1.7), 2)) + (i % 7 === 0 ? 0.08 : 0);
      }),
    [],
  );
  const valAt = (cx: number) => {
    const r = track.current!.getBoundingClientRect();
    const t = clamp((cx - r.left) / r.width, 0, 1);
    return Math.round((MIN + t * (MAX - MIN)) / STEP) * STEP;
  };
  const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
  const set = (which: "lo" | "hi", v: number) => {
    if (which === "lo") {
      const nv = Math.min(v, hi - 2000);
      if (nv !== lo) sfx("tick");
      setLo(nv);
    } else {
      const nv = Math.max(v, lo + 2000);
      if (nv !== hi) sfx("tick");
      setHi(nv);
    }
  };
  const inRange = bars.reduce((a, b, i) => {
    const v = MIN + (i / 43) * (MAX - MIN);
    return v >= lo && v <= hi ? a + b : a;
  }, 0);
  const presets = [
    { l: "Dip zone", r: [30000, 45000] },
    { l: "Current", r: [58000, 70000] },
    { l: "ATH hunt", r: [68000, 80000] },
  ];
  const animateTo = (a: number, b: number) => {
    const l0 = lo;
    const h0 = hi;
    tween(0, 1, 600, (t) => {
      setLo(Math.round((l0 + (a - l0) * t) / STEP) * STEP);
      setHi(Math.round((h0 + (b - h0) * t) / STEP) * STEP);
    }, ease.outBack);
    sfx("whoosh");
  };
  return (
    <Asset title="Dual Range · Histogram" code="M-08" tags="range slider dual thumb histogram filter price min max" span={7}>
      <div className="flex items-end justify-between">
        <div>
          <Label>Limit order price range</Label>
          <div className="font-mono text-2xl font-bold text-white">
            ${lo.toLocaleString()} <span className="text-ink-500">—</span> ${hi.toLocaleString()}
          </div>
        </div>
        <Chip tone="bull">{Math.round(inRange * 120)} orders</Chip>
      </div>
      <div className="mt-6 flex h-24 items-end gap-[3px]">
        {bars.map((b, i) => {
          const v = MIN + (i / 43) * (MAX - MIN);
          const on = v >= lo && v <= hi;
          return (
            <div
              key={i}
              className="flex-1 origin-bottom rounded-t-[3px] transition-all duration-300"
              style={{ height: `${b * 100}%`, background: on ? "linear-gradient(180deg,#5ff0bd,#22d39a)" : "#1c3365", transform: on ? "scaleY(1)" : "scaleY(.85)", boxShadow: on ? "0 0 10px rgba(34,211,154,.35)" : "none" }}
            />
          );
        })}
      </div>
      <div
        ref={track}
        className="relative mt-2 h-10 cursor-pointer touch-none"
        onPointerDown={(e) => {
          const v = valAt(e.clientX);
          const w = Math.abs(v - lo) < Math.abs(v - hi) ? "lo" : "hi";
          setActive(w);
          set(w, v);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => active && set(active, valAt(e.clientX))}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
      >
        <div className="panel-inset absolute inset-x-0 top-[14px] h-3 rounded-full" />
        <div className="absolute top-[14px] h-3 rounded-full bg-gradient-to-r from-bull to-cyan shadow-[0_0_12px_rgba(34,211,154,.6)]" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        {(["lo", "hi"] as const).map((w) => {
          const v = w === "lo" ? lo : hi;
          return (
            <div key={w} className="absolute top-[4px] -ml-4" style={{ left: `${pct(v)}%` }}>
              <div className={cn("h-8 w-8 rounded-xl bg-gradient-to-b from-white to-ink-200 shadow-[0_4px_0_#6f86b8,0_8px_14px_rgba(0,0,0,.5)] transition-transform", active === w && "scale-125")} />
              <div className={cn("pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-0.5 font-mono text-[11px] font-black text-ink-900 shadow-[0_3px_0_#8ea4d2] transition-all", active === w ? "scale-110 opacity-100" : "opacity-0")}>
                ${(v / 1000).toFixed(1)}k
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.l} onClick={() => animateTo(p.r[0], p.r[1])} className="rounded-xl bg-ink-800 px-3 py-1.5 text-[11px] font-black text-ink-200 shadow-[0_3px_0_#0b1838] transition hover:text-white active:translate-y-0.5">
            {p.l}
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-09 · ROTARY KNOB — circular drag with detents & color ramp
 * ===================================================================== */
function RiskKnob() {
  const STEPS = 19;
  const [v, setV] = useState(0.3);
  const [drag, setDrag] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const C = 110;
  const R = 82;
  const angle = -135 + v * 270;
  const risk = 0.25 + v * 4.75;
  const hue = 150 - v * 150;
  const col = `hsl(${hue} 85% 55%)`;
  const label = risk < 1 ? "Conservative" : risk < 2 ? "Balanced" : risk < 3.5 ? "Aggressive" : "Degen 🎲";
  const pt = (deg: number, r: number) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)];
  const arc = (from: number, to: number, r: number) => {
    const [x0, y0] = pt(from, r);
    const [x1, y1] = pt(to, r);
    return `M${x0},${y0} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  const setFromPointer = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 220;
    const y = ((e.clientY - r.top) / r.height) * 220;
    const a = (Math.atan2(x - C, -(y - C)) * 180) / Math.PI;
    if (Math.abs(a) > 150) return;
    const nv = Math.round(clamp((a + 135) / 270, 0, 1) * STEPS) / STEPS;
    if (nv !== v) {
      sfx("tick", 0.8 + nv * 0.6);
      setV(nv);
    }
  };
  return (
    <Asset title="Rotary Risk Knob" code="M-09" tags="knob dial rotary circular slider detents risk gauge" span={5}>
      <div className="flex flex-col items-center">
        <svg
          ref={svgRef}
          viewBox="0 0 220 220"
          className={cn("w-full max-w-[250px] touch-none select-none", drag ? "cursor-grabbing" : "cursor-grab")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") setV((x) => Math.min(1, Math.round(x * STEPS + 1) / STEPS));
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") setV((x) => Math.max(0, Math.round(x * STEPS - 1) / STEPS));
          }}
          onPointerDown={(e) => {
            setDrag(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e);
          }}
          onPointerMove={(e) => drag && setFromPointer(e)}
          onPointerUp={() => setDrag(false)}
        >
          <defs>
            <radialGradient id="knobFace" cx="40%" cy="30%">
              <stop offset="0" stopColor="#3a5896" />
              <stop offset="1" stopColor="#122247" />
            </radialGradient>
          </defs>
          {Array.from({ length: STEPS + 1 }).map((_, i) => {
            const a = -135 + (i / STEPS) * 270;
            const [x0, y0] = pt(a, 100);
            const [x1, y1] = pt(a, i % 5 === 0 ? 90 : 94);
            const lit = i / STEPS <= v + 0.001;
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={lit ? `hsl(${150 - (i / STEPS) * 150} 85% 55%)` : "#27427d"} strokeWidth={i % 5 === 0 ? 3.5 : 2.5} strokeLinecap="round" style={{ filter: lit ? `drop-shadow(0 0 3px hsl(${150 - (i / STEPS) * 150} 85% 55%))` : undefined }} />;
          })}
          <path d={arc(-135, 135, R)} stroke="#0a1330" strokeWidth="12" fill="none" strokeLinecap="round" />
          {v > 0 && <path d={arc(-135, angle, R)} stroke={col} strokeWidth="12" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />}
          <circle cx={C} cy={C + 5} r="60" fill="#081231" />
          <circle cx={C} cy={C} r="60" fill="url(#knobFace)" stroke="rgba(255,255,255,.1)" />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px`, transition: drag ? "none" : "transform .25s cubic-bezier(.3,1.4,.5,1)" }}>
            <circle cx={C} cy={C - 46} r="6" fill={col} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
          </g>
          <text x={C} y={C + 2} textAnchor="middle" fontSize="28" fontWeight="900" fill="#fff" fontFamily="Unbounded, sans-serif">
            {risk.toFixed(2)}%
          </text>
          <text x={C} y={C + 22} textAnchor="middle" fontSize="10" fontWeight="800" fill="#8ea4d2" letterSpacing="1.5">
            RISK / TRADE
          </text>
        </svg>
        <div key={label} className="anim-pop mt-1 rounded-xl px-3 py-1 font-display text-sm font-black" style={{ color: col, background: `color-mix(in srgb, ${col} 15%, transparent)` }}>
          {label}
        </div>
        <div className="mt-2 text-[11px] font-bold text-ink-500">Drag around the dial · arrow keys · {STEPS + 1} detents</div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-10 · BEFORE / AFTER COMPARE — raw chart vs pro indicators
 * ===================================================================== */
function CompareSlider() {
  const [pos, setPos] = useState(50);
  const [drag, setDrag] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const r = mulberry32(77);
    let p = 100;
    return Array.from({ length: 60 }, (_, i) => {
      const o = p;
      p = p + (r() - 0.47) * 3.2 + Math.sin(i / 8) * 0.6;
      return { o, c: p, h: Math.max(o, p) + r() * 1.4, l: Math.min(o, p) - r() * 1.4 };
    });
  }, []);
  useEffect(() => {
    let cancel = () => {};
    const t = setTimeout(() => {
      cancel = tween(50, 86, 700, setPos, ease.inOutCubic, () => {
        cancel = tween(86, 16, 900, setPos, ease.inOutCubic, () => {
          cancel = tween(16, 50, 700, setPos, ease.outBack);
        });
      });
    }, 400);
    return () => {
      clearTimeout(t);
      cancel();
    };
  }, []);
  const W = 480;
  const H = 220;
  const max = Math.max(...data.map((d) => d.h)) + 2;
  const min = Math.min(...data.map((d) => d.l)) - 2;
  const y = (v: number) => ((max - v) / (max - min)) * H;
  const cw = W / data.length;
  const ema = data.reduce<number[]>((acc, d, i) => [...acc, i ? acc[i - 1] + (d.c - acc[i - 1]) * 0.18 : d.c], []);
  const sd = data.map((_, i) => {
    const sl = data.slice(Math.max(0, i - 10), i + 1).map((d) => d.c);
    const m = sl.reduce((a, b) => a + b, 0) / sl.length;
    return Math.sqrt(sl.reduce((a, b) => a + (b - m) ** 2, 0) / sl.length);
  });
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${i * cw + cw / 2},${y(v)}`).join("");
  const upper = ema.map((e, i) => e + sd[i] * 2);
  const lower = ema.map((e, i) => e - sd[i] * 2);
  const band = `${line(upper)} ${lower.map((_, i) => `L${(lower.length - 1 - i) * cw + cw / 2},${y(lower[lower.length - 1 - i])}`).join("")} Z`;
  const move = (cx: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(clamp(((cx - r.left) / r.width) * 100, 0, 100));
  };
  return (
    <Asset title="Before / After Compare" code="M-10" tags="compare before after slider reveal chart indicators clip drag" span={7}>
      <div
        ref={box}
        className="relative cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl"
        onPointerDown={(e) => {
          setDrag(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => drag && move(e.clientX)}
        onPointerUp={() => setDrag(false)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full bg-ink-950">
          <path d={band} fill="#9170ff" opacity=".14" />
          <path d={line(upper)} stroke="#9170ff" strokeWidth="1.2" fill="none" opacity=".7" />
          <path d={line(lower)} stroke="#9170ff" strokeWidth="1.2" fill="none" opacity=".7" />
          {data.map((d, i) => {
            const col = d.c >= d.o ? "#22d39a" : "#ff4d6d";
            return (
              <g key={i}>
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.2" />
                <rect x={i * cw + 1.5} y={y(Math.max(d.o, d.c))} width={cw - 3} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="1" />
              </g>
            );
          })}
          <path d={line(ema)} stroke="#ffc23d" strokeWidth="2.2" fill="none" />
          {[14, 31, 47].map((i, k) => (
            <g key={i}>
              <circle cx={i * cw + cw / 2} cy={y(k === 1 ? data[i].h : data[i].l) + (k === 1 ? -12 : 12)} r="9" fill={k === 1 ? "#ff4d6d" : "#22d39a"} />
              <text x={i * cw + cw / 2} y={y(k === 1 ? data[i].h : data[i].l) + (k === 1 ? -8.5 : 15.5)} textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">
                {k === 1 ? "S" : "B"}
              </text>
            </g>
          ))}
        </svg>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" style={{ background: "#0d1a3d" }}>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#16295a" />
            ))}
            <path d={line(data.map((d) => d.c))} stroke="#8ea4d2" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <span className="absolute left-3 top-3 rounded-lg bg-ink-950/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-ink-200">Raw price</span>
        <span className="absolute right-3 top-3 rounded-lg bg-violet/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">Pro view</span>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,.8)]" style={{ left: `${pos}%` }}>
          <div className={cn("absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-900 shadow-[0_4px_0_#8ea4d2,0_8px_20px_rgba(0,0,0,.5)] transition-transform", drag && "scale-110")}>
            <Icon name="swap" size={18} stroke={2.8} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
        <Chip tone="gold">EMA 10</Chip>
        <Chip tone="violet">Bollinger 2σ</Chip>
        <Chip tone="bull">Buy / Sell signals</Chip>
        <span className="ml-auto text-ink-500">Drag the handle</span>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-11 · EMOJI CONFIDENCE SLIDER — morphing face, magnetic stops
 * ===================================================================== */
const STOPS = [
  { v: 0, l: "Panic" },
  { v: 25, l: "Unsure" },
  { v: 50, l: "Neutral" },
  { v: 75, l: "Confident" },
  { v: 100, l: "Diamond hands" },
];
function Face({ v }: { v: number }) {
  const c = mapRange(v, 0, 100, -7, 8);
  const hue = v * 1.35;
  const eyeY = v < 30 ? 17 : 16;
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <circle cx="20" cy="21" r="18" fill={`hsl(${hue} 80% 40%)`} />
      <circle cx="20" cy="20" r="18" fill={`hsl(${hue} 85% 58%)`} />
      <ellipse cx="14" cy="13" rx="4" ry="2" fill="#fff" opacity=".35" />
      {v > 85 ? (
        <>
          <path d="M9 15 l5 3 l5 -3 M21 15 l5 3 l5 -3" stroke="#0a1330" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <text x="20" y="11" textAnchor="middle" fontSize="7">💎</text>
        </>
      ) : (
        <>
          <circle cx="14" cy={eyeY} r="2.4" fill="#0a1330" />
          <circle cx="26" cy={eyeY} r="2.4" fill="#0a1330" />
        </>
      )}
      {v < 30 && <path d="M10 11 l6 2 M30 11 l-6 2" stroke="#0a1330" strokeWidth="1.8" strokeLinecap="round" />}
      <path d={`M12 ${26 - c * 0.2} Q20 ${26 + c} 28 ${26 - c * 0.2}`} stroke="#0a1330" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {v < 12 && <path d="M30 18 q2 4 0 6" stroke="#8cc0ff" strokeWidth="2" fill="none" />}
    </svg>
  );
}
function EmojiSlider() {
  const [v, setV] = useState(60);
  const [drag, setDrag] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const cancel = useRef<() => void>(() => {});
  const setFrom = (cx: number) => {
    const r = track.current!.getBoundingClientRect();
    setV(clamp(((cx - r.left) / r.width) * 100, 0, 100));
  };
  const snap = () => {
    const target = STOPS.reduce((a, s) => (Math.abs(s.v - v) < Math.abs(a - v) ? s.v : a), 0);
    cancel.current();
    cancel.current = tween(v, target, 450, setV, ease.outBack);
    sfx("pop", 0.8 + target / 200);
  };
  const nearest = STOPS.reduce((a, s) => (Math.abs(s.v - v) < Math.abs(a.v - v) ? s : a), STOPS[0]);
  return (
    <Asset title="Confidence Slider" code="M-11" tags="emoji slider mood confidence morph face snap magnetic stops" span={5}>
      <Label>How confident are you in this trade?</Label>
      <div className="mt-6 flex justify-center">
        <div className="h-24 w-24 transition-transform duration-200" style={{ transform: `scale(${drag ? 1.12 : 1}) rotate(${(v - 50) * 0.15}deg)` }}>
          <Face v={v} />
        </div>
      </div>
      <div key={nearest.l} className="anim-pop mt-2 text-center font-display text-lg font-black" style={{ color: `hsl(${v * 1.35} 85% 60%)` }}>
        {nearest.l}
      </div>
      <div
        ref={track}
        className="relative mt-6 h-12 cursor-pointer touch-none"
        onPointerDown={(e) => {
          cancel.current();
          setDrag(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          setFrom(e.clientX);
        }}
        onPointerMove={(e) => drag && setFrom(e.clientX)}
        onPointerUp={() => {
          setDrag(false);
          snap();
        }}
      >
        <div className="absolute inset-x-0 top-[18px] h-3 rounded-full" style={{ background: "linear-gradient(90deg,#ff4d6d,#ffc23d,#22d39a)" }} />
        {STOPS.map((s) => (
          <span key={s.v} className="absolute top-[14px] -ml-[5px] h-5 w-2.5 rounded-full bg-ink-900/60" style={{ left: `${s.v}%` }} />
        ))}
        <div className="absolute top-0 -ml-6 h-12 w-12 rounded-full bg-white p-1 shadow-[0_5px_0_#6f86b8,0_10px_20px_rgba(0,0,0,.5)]" style={{ left: `${v}%` }}>
          <Face v={v} />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-black uppercase tracking-wider text-ink-500">
        {STOPS.map((s) => (
          <span key={s.v}>{s.l.split(" ")[0]}</span>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-12 · WHEEL PICKER — iOS-style 3D scroll wheels with snap + ticks
 * ===================================================================== */
const ITEM = 40;
function WheelColumn({ items, value, onChange, width = 90 }: { items: string[]; value: number; onChange: (i: number) => void; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  const raf = useRef(0);
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const center = el.scrollTop;
    el.querySelectorAll<HTMLElement>("[data-i]").forEach((k, i) => {
      const d = (i * ITEM - center) / ITEM;
      k.style.transform = `rotateX(${clamp(-d * 21, -85, 85)}deg) translateZ(0)`;
      k.style.opacity = String(Math.max(0.12, 1 - Math.abs(d) * 0.3));
    });
    const idx = clamp(Math.round(center / ITEM), 0, items.length - 1);
    if (idx !== last.current) {
      last.current = idx;
      sfx("tick");
      onChange(idx);
    }
  };
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = value * ITEM;
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={ref}
      onScroll={() => {
        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(update);
      }}
      className="no-scrollbar relative h-[200px] snap-y snap-mandatory overflow-y-auto"
      style={{ width, perspective: 400, paddingBlock: 80 }}
    >
      {items.map((it, i) => (
        <div
          key={it}
          data-i={i}
          onClick={() => ref.current?.scrollTo({ top: i * ITEM, behavior: "smooth" })}
          className={cn("flex h-10 cursor-pointer snap-center items-center justify-center font-display text-lg font-black transition-colors", i === value ? "text-white" : "text-ink-400")}
        >
          {it}
        </div>
      ))}
    </div>
  );
}
function WheelPicker() {
  const LEV = ["1×", "2×", "3×", "5×", "10×", "20×", "25×", "50×", "75×", "100×"];
  const DUR = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];
  const SIDE = ["Long", "Short"];
  const [l, setL] = useState(4);
  const [d, setD] = useState(4);
  const [s, setS] = useState(0);
  return (
    <Asset title="Wheel Picker · iOS" code="M-12" tags="wheel picker ios scroll snap 3d rotate select column spinner" span={6}>
      <div className="relative mx-auto flex max-w-sm justify-center rounded-3xl bg-ink-950/60 px-2 ring-1 ring-white/5">
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-white/[.07] ring-1 ring-white/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 rounded-t-3xl bg-gradient-to-b from-[#0b1637] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 rounded-b-3xl bg-gradient-to-t from-[#0b1637] to-transparent" />
        <WheelColumn items={LEV} value={l} onChange={setL} />
        <WheelColumn items={DUR} value={d} onChange={setD} />
        <WheelColumn items={SIDE} value={s} onChange={setS} width={100} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span key={`${l}${d}${s}`} className={cn("anim-pop rounded-xl px-3 py-1.5 font-display text-sm font-black", s === 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
          {SIDE[s]} {LEV[l]} · {DUR[d]}
        </span>
        {l >= 7 && <Chip tone="bear" className="anim-pop">High risk</Chip>}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-500">Scroll / swipe each wheel · tap an item</div>
    </Asset>
  );
}

/* =====================================================================
 * M-13 · ODOMETER STEPPER — rolling digits, hold to accelerate
 * ===================================================================== */
function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.64em] overflow-hidden align-top">
      <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.3,1.35,.5,1)]" style={{ transform: `translateY(-${d * 10}%)` }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="block h-[1em] text-center leading-none">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}
function Odometer() {
  const [v, setV] = useState(1250);
  const hold = useRef<number | null>(null);
  const count = useRef(0);
  const step = (dir: number, size: number) => {
    setV((x) => clamp(x + dir * size, 0, 999999));
    sfx("tick", dir > 0 ? 1.2 : 0.9);
  };
  const startHold = (dir: number) => {
    step(dir, 10);
    count.current = 0;
    const tick = () => {
      count.current++;
      const n = count.current;
      step(dir, n > 28 ? 1000 : n > 12 ? 100 : 10);
      hold.current = window.setTimeout(tick, Math.max(35, 150 - n * 7));
    };
    hold.current = window.setTimeout(tick, 380);
  };
  const endHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };
  useEffect(() => endHold, []);
  const str = v.toLocaleString("en-US");
  const accel = count.current > 28 ? "×1000" : count.current > 12 ? "×100" : "×10";
  return (
    <Asset title="Odometer Stepper" code="M-13" tags="odometer stepper counter rolling digits hold accelerate amount input" span={6}>
      <Label>Deposit amount</Label>
      <div className="panel-inset flex items-center justify-center rounded-3xl py-6">
        <span className="font-display text-5xl font-black text-white">
          <span className="text-ink-400">$</span>
          {str.split("").map((ch, i) =>
            /\d/.test(ch) ? <Digit key={`${str.length - i}`} d={Number(ch)} /> : <span key={`c${str.length - i}`} className="text-ink-500">{ch}</span>,
          )}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onPointerDown={() => startHold(-1)}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          className="btn3d v-bear h-14 w-14 touch-none rounded-2xl [--depth:5px]"
        >
          <Icon name="minus" size={22} stroke={3.2} />
        </button>
        <div className="w-20 text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-ink-500">Hold step</div>
          <div className="font-mono text-sm font-bold text-cyan">{accel}</div>
        </div>
        <button
          onPointerDown={() => startHold(1)}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          className="btn3d v-bull h-14 w-14 touch-none rounded-2xl [--depth:5px]"
        >
          <Icon name="plus" size={22} stroke={3.2} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { l: "+100", f: (x: number) => x + 100 },
          { l: "+1k", f: (x: number) => x + 1000 },
          { l: "×2", f: (x: number) => x * 2 },
          { l: "Reset", f: () => 0 },
        ].map((b) => (
          <Btn key={b.l} variant="ghost" size="sm" onClick={() => setV((x) => clamp(b.f(x), 0, 999999))}>
            {b.l}
          </Btn>
        ))}
      </div>
    </Asset>
  );
}

export { DualRange, RiskKnob, CompareSlider, EmojiSlider, WheelPicker, Odometer };
