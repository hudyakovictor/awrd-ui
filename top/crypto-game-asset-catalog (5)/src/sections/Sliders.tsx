import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { Slider3D } from "./Controls";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstConfetti, shake } from "../utils/fx";
import { clamp, rubber, useDrag, useInView } from "../hooks/motion";
import type { G } from "./Carousels";

const fmt = (n: number) => n.toLocaleString("en-US");

/* =========================================================
   1. DUAL RANGE + HISTOGRAM (price filter)
   ========================================================= */
function DualRange() {
  const MIN = 0, MAX = 100000, STEP = 1000, GAP = 3000;
  const [a, setA] = useState(22000);
  const [b, setB] = useState(71000);
  const [drag, setDrag] = useState<null | "a" | "b">(null);
  const track = useRef<HTMLDivElement>(null);
  const bars = useMemo(() => Array.from({ length: 34 }, (_, i) => { const x = i / 33; return 0.18 + 0.72 * Math.exp(-Math.pow((x - 0.58) / 0.19, 2)) + 0.25 * Math.exp(-Math.pow((x - 0.2) / 0.08, 2)) + Math.random() * 0.1; }), []);
  const toVal = (cx: number) => { const r = track.current!.getBoundingClientRect(); return Math.round((clamp((cx - r.left) / r.width) * (MAX - MIN)) / STEP) * STEP; };
  const apply = (which: "a" | "b", v: number) => {
    if (which === "a") { const n = clamp(v, MIN, b - GAP); if (n !== a) { setA(n); sfx.tick(); } }
    else { const n = clamp(v, a + GAP, MAX); if (n !== b) { setB(n); sfx.tick(); } }
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    const v = toVal(e.clientX);
    const which = Math.abs(v - a) < Math.abs(v - b) ? "a" : "b";
    setDrag(which); apply(which, v);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pa = (a / MAX) * 100, pb = (b / MAX) * 100;
  const count = Math.round(bars.reduce((s, h, i) => { const x = (i / 33) * MAX; return x >= a && x <= b ? s + h * 60 : s; }, 0));
  return (
    <Asset title="Dual Range + Histogram" id="sld.range" desc="Фильтр цены входа: два бегунка, распределение сделок подсвечивается внутри диапазона, пресеты и счётчик результатов." className="lg:col-span-2">
      <div className="flex items-end justify-between mb-2">
        <div className="text-[12px] font-bold text-mute">Найдено сделок: <span key={count} className="num text-txt font-extrabold anim-pop inline-block">{count}</span></div>
        <div className="flex gap-1.5">
          {[["Все", 0, 100000], ["Дёшево", 0, 30000], ["Середина", 30000, 70000], ["Дорого", 70000, 100000]].map(([l, x, y]) => (
            <button key={l as string} onClick={() => { setA(x as number); setB(y as number); sfx.pop(); }} className={cn("h-8 px-2.5 rounded-lg text-[11px] font-extrabold transition", a === x && b === y ? "bg-blue text-white shadow-[0_3px_0_#2250c2]" : "text-mute hover:bg-white/5")}>{l as string}</button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-[3px] h-24 px-3">
        {bars.map((h, i) => {
          const x = (i / 33) * MAX;
          const inR = x >= a && x <= b;
          return <div key={i} className="flex-1 rounded-t-md transition-all duration-300" style={{ height: `${h * 100}%`, background: inR ? "linear-gradient(180deg,#6a9dff,#3d7bff)" : "#1a2c5e", transform: inR && drag ? "scaleY(1.06)" : "none", transformOrigin: "bottom" }} />;
        })}
      </div>
      <div ref={track} onPointerDown={down} onPointerMove={(e) => drag && apply(drag, toVal(e.clientX))} onPointerUp={() => setDrag(null)}
        className="relative h-4 mx-3 mt-1 inset !rounded-full cursor-pointer touch-none select-none">
        <div className="absolute inset-y-[3px] rounded-full bg-gradient-to-r from-blue to-violet" style={{ left: `${pa}%`, right: `${100 - pb}%` }} />
        {(["a", "b"] as const).map((w) => {
          const p = w === "a" ? pa : pb;
          return (
            <div key={w} className="absolute top-1/2 size-8 -ml-4 rounded-full bg-gradient-to-b from-white to-[#c5d2f5] shadow-[0_4px_0_#7d8fc4,0_8px_16px_rgba(0,0,0,.5)] transition-transform" style={{ left: `${p}%`, transform: `translateY(-50%) scale(${drag === w ? 1.15 : 1})` }}>
              <span className={cn("absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-2 py-1 rounded-lg bg-[#24397a] text-[10.5px] font-extrabold num whitespace-nowrap shadow-[0_3px_0_#0b1536] transition-all", drag === w ? "opacity-100 scale-100" : "opacity-0 scale-75")}>${fmt(w === "a" ? a : b)}</span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[["От", a], ["До", b]].map(([l, v]) => (
          <div key={l as string} className="inset px-3 py-2"><div className="label-caps !mb-0.5">{l as string}</div><div className="num font-extrabold text-[16px]">${fmt(v as number)}</div></div>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   2. STEPPED RISK SLIDER
   ========================================================= */
const RISK: { l: string; d: string; g: G; c: string }[] = [
  { l: "Черепаха", d: "Только спот, без плеча. Сон спокойный.", g: "shield", c: "#1fdb8b" },
  { l: "Осторожный", d: "Плечо до 2x, стоп 2% от депозита.", g: "heart", c: "#2ed3f0" },
  { l: "Баланс", d: "Плечо до 5x, стоп 3%. Золотая середина.", g: "star", c: "#3d7bff" },
  { l: "Смелый", d: "Плечо до 10x. Нужна дисциплина.", g: "bolt", c: "#ffc53d" },
  { l: "Дегенерат", d: "Плечо 50x+. Ты точно уверен?", g: "flame", c: "#ff4d6a" },
];
function SteppedRisk() {
  const [v, setV] = useState(2);
  const [drag, setDrag] = useState(false);
  const [fx, setFx] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const set = (cx: number) => {
    const r = track.current!.getBoundingClientRect();
    const n = Math.round(clamp((cx - r.left) / r.width) * 4);
    if (n !== v) { setV(n); setFx((x) => x + 1); sfx.tick(); haptic(n === 4 ? [20, 20, 20] : 8); if (n === 4) shake("soft"); }
  };
  const r = RISK[v];
  return (
    <Asset title="Stepped Risk Slider" id="sld.stepped" desc="5 фиксированных уровней: снап, хаптик на каждом шаге, цвет и описание меняются, на «Дегенерат» — тряска.">
      <div className="flex items-center gap-3 mb-6">
        <span key={fx} className="size-14 rounded-2xl grid place-items-center anim-pop" style={{ background: `${r.c}22`, boxShadow: `inset 0 0 0 2px ${r.c}66` }}><Glyph name={r.g} size={34} /></span>
        <div key={"d" + v} className="anim-fade"><div className="font-extrabold text-[16px]" style={{ color: r.c }}>{r.l}</div><div className="text-[12px] text-mute leading-snug">{r.d}</div></div>
      </div>
      <div ref={track} className="relative h-5 mx-3 inset !rounded-full cursor-pointer touch-none select-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); set(e.clientX); }}
        onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => setDrag(false)}>
        <div className="absolute inset-y-[3px] left-[3px] rounded-full transition-all duration-300" style={{ width: `calc(${v * 25}% - 3px)`, background: `linear-gradient(90deg, #1fdb8b, ${r.c})` }} />
        {RISK.map((x, k) => (
          <span key={x.l} className="absolute top-1/2 -translate-y-1/2 -ml-[7px] size-3.5 rounded-full border-2 transition-all duration-300" style={{ left: `${k * 25}%`, background: k <= v ? x.c : "#0a1330", borderColor: k <= v ? "#fff" : "#26397a" }} />
        ))}
        <div className="absolute top-1/2 -ml-5 size-10 rounded-full grid place-items-center shadow-[0_4px_0_rgba(0,0,0,.35),0_10px_18px_rgba(0,0,0,.45)] transition-[left] duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]"
          style={{ left: `${v * 25}%`, transform: `translateY(-50%) scale(${drag ? 1.12 : 1})`, background: `linear-gradient(180deg, #fff, ${r.c})` }}>
          <Glyph name={r.g} size={20} />
        </div>
      </div>
      <div className="flex justify-between mt-4 px-0.5">
        {RISK.map((x, k) => <button key={x.l} onClick={() => { setV(k); setFx((f) => f + 1); sfx.tick(); }} className={cn("text-[9.5px] font-extrabold uppercase tracking-wide w-14 text-center transition", k === v ? "" : "text-dim")} style={{ color: k === v ? x.c : undefined }}>{x.l}</button>)}
      </div>
    </Asset>
  );
}

/* =========================================================
   3. ALLOCATION (vertical sliders summing to 100%)
   ========================================================= */
const ASSETS = [{ s: "BTC", c: "#f7931a" }, { s: "ETH", c: "#8c8cff" }, { s: "SOL", c: "#14f195" }, { s: "USDT", c: "#2ed3f0" }];
function Allocation() {
  const [w, setW] = useState([45, 25, 15, 15]);
  const [act, setAct] = useState<number | null>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  const setOne = (k: number, raw: number) => {
    const nv = Math.round(clamp(raw, 0, 100));
    setW((cur) => {
      if (cur[k] === nv) return cur;
      const rest = cur.reduce((s, x, i) => (i === k ? s : s + x), 0);
      const remain = 100 - nv;
      const next = cur.map((x, i) => (i === k ? nv : rest > 0 ? (x / rest) * remain : remain / 3));
      const r = next.map((x) => Math.round(x));
      const diff = 100 - r.reduce((s, x) => s + x, 0);
      const j = r.findIndex((x, i) => i !== k && x + diff >= 0);
      if (j >= 0) r[j] += diff;
      return r;
    });
  };
  const fromPointer = (k: number, cy: number) => { const el = cols.current[k]; if (!el) return; const r = el.getBoundingClientRect(); setOne(k, (1 - (cy - r.top) / r.height) * 100); };
  const risk = Math.round(w[0] * 0.6 + w[1] * 0.75 + w[2] * 1 + w[3] * 0.05);
  return (
    <Asset title="Allocation Sliders" id="sld.alloc" desc="Вертикальные слайдеры портфеля: сумма всегда 100%, остальные активы перераспределяются пропорционально в реальном времени.">
      <div className="flex justify-between gap-3 h-[200px] px-1">
        {ASSETS.map((x, k) => (
          <div key={x.s} className="flex-1 flex flex-col items-center gap-2">
            <span className={cn("num text-[13px] font-extrabold transition-transform", act === k && "scale-125")} style={{ color: x.c }}>{w[k]}%</span>
            <div ref={(e) => { cols.current[k] = e; }} className="relative flex-1 w-11 inset !rounded-2xl cursor-ns-resize touch-none select-none"
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setAct(k); fromPointer(k, e.clientY); sfx.tap(); }}
              onPointerMove={(e) => act === k && fromPointer(k, e.clientY)} onPointerUp={() => setAct(null)}>
              <div className="absolute inset-x-[4px] bottom-[4px] rounded-xl transition-[height] duration-200" style={{ height: `calc(${w[k]}% - 8px)`, minHeight: 6, background: `linear-gradient(180deg, ${x.c}, ${x.c}88)`, boxShadow: `0 0 16px ${x.c}55` }}>
                <div className="absolute inset-x-1.5 top-1 h-1.5 rounded-full bg-white/40" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-9 h-3 rounded-full bg-white shadow-[0_3px_0_#7d8fc4] transition-[bottom] duration-200" style={{ bottom: `calc(${w[k]}% - 8px)` }} />
            </div>
            <span className="text-[11px] font-extrabold">{x.s}</span>
          </div>
        ))}
      </div>
      <div className="flex h-3 rounded-full overflow-hidden mt-4">
        {ASSETS.map((x, k) => <div key={x.s} className="transition-all duration-300" style={{ width: `${w[k]}%`, background: x.c }} />)}
      </div>
      <div className="flex items-center justify-between mt-3 text-[12px] font-bold">
        <span className="text-mute">Риск-скор портфеля</span>
        <Badge tone={risk < 40 ? "bull" : risk < 65 ? "gold" : "bear"}>{risk}/100</Badge>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. ROTARY KNOB (leverage)
   ========================================================= */
function Knob() {
  const [v, setV] = useState(10);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setFrom = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    let ang = (Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    if (ang > 180) ang -= 360;
    ang = clamp(ang, -135, 135);
    const nv = Math.round(1 + ((ang + 135) / 270) * 99);
    if (nv !== v) { setV(nv); if (nv % 5 === 0) { sfx.tick(); haptic(4); } }
  };
  const ang = -135 + ((v - 1) / 99) * 270;
  const C = 2 * Math.PI * 78;
  const col = v <= 5 ? "#1fdb8b" : v <= 20 ? "#ffc53d" : v <= 50 ? "#ff8a3d" : "#ff4d6a";
  return (
    <Asset title="Rotary Knob" id="sld.knob" desc="Крутите ручку плеча по кругу. 270° дуга, насечки, цвет риска, щелчок каждые 5x. Колесо мыши тоже работает.">
      <div className="flex flex-col items-center">
        <div ref={ref} className="relative size-[200px] touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); setFrom(e.clientX, e.clientY); }}
          onPointerMove={(e) => drag && setFrom(e.clientX, e.clientY)} onPointerUp={() => setDrag(false)}
          onWheel={(e) => { const nv = clamp(v + (e.deltaY < 0 ? 1 : -1), 1, 100); if (nv !== v) { setV(nv); sfx.tick(); } }}>
          <svg viewBox="0 0 200 200" className="absolute inset-0">
            {Array.from({ length: 28 }).map((_, i) => {
              const a = ((-135 + (i / 27) * 270 - 90) * Math.PI) / 180;
              const on = i / 27 <= (v - 1) / 99;
              return <line key={i} x1={100 + Math.cos(a) * 94} y1={100 + Math.sin(a) * 94} x2={100 + Math.cos(a) * (i % 3 === 0 ? 86 : 89)} y2={100 + Math.sin(a) * (i % 3 === 0 ? 86 : 89)} stroke={on ? col : "#26397a"} strokeWidth={i % 3 === 0 ? 3 : 2} strokeLinecap="round" />;
            })}
            <circle cx="100" cy="100" r="78" fill="none" stroke="#0a1330" strokeWidth="8" strokeDasharray={`${C * 0.75} ${C}`} transform="rotate(135 100 100)" strokeLinecap="round" />
            <circle cx="100" cy="100" r="78" fill="none" stroke={col} strokeWidth="8" strokeDasharray={`${C * 0.75 * ((v - 1) / 99)} ${C}`} transform="rotate(135 100 100)" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${col})`, transition: drag ? "none" : "stroke-dasharray .3s" }} />
          </svg>
          <div className="absolute inset-[34px] rounded-full bg-gradient-to-b from-[#2a4185] to-[#111e47] shadow-[0_8px_0_#081028,0_16px_30px_rgba(0,0,0,.6),inset_0_2px_0_rgba(255,255,255,.2)] transition-transform" style={{ transform: `rotate(${ang}deg) scale(${drag ? 0.97 : 1})` }}>
            <span className="absolute left-1/2 top-3 -translate-x-1/2 w-1.5 h-6 rounded-full" style={{ background: col, boxShadow: `0 0 10px ${col}` }} />
            <div className="absolute inset-4 rounded-full" style={{ background: "repeating-conic-gradient(rgba(255,255,255,.04) 0 6deg, transparent 6deg 12deg)" }} />
          </div>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center mt-1"><span className="num text-[30px] font-extrabold leading-none block" style={{ color: col }}>{v}x</span><span className="label-caps !mb-0">leverage</span></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 w-full mt-3">
          {[1, 5, 20, 100].map((n) => <button key={n} onClick={() => { setV(n); sfx.pop(); }} className="opt h-9 text-[12px] font-extrabold num" data-state={v === n ? "selected" : undefined}>{n}x</button>)}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   5. RADIAL (full circle) TP slider
   ========================================================= */
function Radial() {
  const [v, setV] = useState(35);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setFrom = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    let ang = (Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    if (ang < 0) ang += 360;
    const nv = Math.round((ang / 360) * 100);
    if (Math.abs(nv - v) > 60) return;
    if (nv !== v) { setV(nv); if (nv % 10 === 0) sfx.tick(); }
  };
  const R = 80, C = 2 * Math.PI * R;
  const a = ((v / 100) * 360 - 90) * (Math.PI / 180);
  const entry = 67420;
  return (
    <Asset title="Radial Slider" id="sld.radial" desc="Полный круг: цель Take-Profit в %. Ручка движется по окружности, центр показывает целевую цену и прибыль.">
      <div className="flex flex-col items-center">
        <div ref={ref} className="relative size-[200px] touch-none select-none"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); }}
          onPointerMove={(e) => drag && setFrom(e.clientX, e.clientY)} onPointerUp={() => setDrag(false)}>
          <svg viewBox="0 0 200 200" className="absolute inset-0">
            <defs><linearGradient id="rad-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1fdb8b" /><stop offset="1" stopColor="#2ed3f0" /></linearGradient></defs>
            <circle cx="100" cy="100" r={R} fill="none" stroke="#0a1330" strokeWidth="18" />
            <circle cx="100" cy="100" r={R} fill="none" stroke="url(#rad-g)" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(v / 100) * C} ${C}`} transform="rotate(-90 100 100)" />
            {[0, 25, 50, 75].map((m) => { const aa = ((m / 100) * 360 - 90) * (Math.PI / 180); return <text key={m} x={100 + Math.cos(aa) * 56} y={104 + Math.sin(aa) * 56} textAnchor="middle" fontSize="9" fontWeight="800" fill="#5b6a98">{m}%</text>; })}
          </svg>
          <div className="absolute size-9 -ml-[18px] -mt-[18px] rounded-full bg-white shadow-[0_4px_0_#7d8fc4,0_8px_16px_rgba(0,0,0,.5)] grid place-items-center cursor-grab active:cursor-grabbing" style={{ left: 100 + Math.cos(a) * R, top: 100 + Math.sin(a) * R, transform: `scale(${drag ? 1.15 : 1})` }}
            onPointerDown={(e) => { e.stopPropagation(); ref.current?.setPointerCapture(e.pointerId); setDrag(true); }}>
            <span className="size-3 rounded-full bg-bull" />
          </div>
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
            <div><div className="label-caps !mb-0">Take-profit</div><div className="num text-[28px] font-extrabold text-bull leading-none">+{v}%</div><div className="num text-[11px] text-mute font-bold mt-1">${fmt(Math.round(entry * (1 + v / 100)))}</div></div>
          </div>
        </div>
        <div className="inset w-full p-3 mt-3 flex justify-between text-[12px] font-bold"><span className="text-mute">Прибыль на $1 000</span><span className="num text-bull">+${fmt(v * 10)}</span></div>
      </div>
    </Asset>
  );
}

/* =========================================================
   6. BEFORE / AFTER COMPARE
   ========================================================= */
function CompareSlider() {
  const [x, setX] = useState(50);
  const [drag, setDrag] = useState(false);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const [viewRef, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const candles = useMemo(() => { let p = 50; return Array.from({ length: 36 }, () => { const o = p; const c = o + (Math.random() - 0.46) * 8; p = c; return { o, c, h: Math.max(o, c) + Math.random() * 4, l: Math.min(o, c) - Math.random() * 4 }; }); }, []);
  useEffect(() => {
    if (!inView || touched.current) return;
    let raf = 0; const t0 = performance.now();
    const loop = (t: number) => { const k = (t - t0) / 1800; if (k >= 1 || touched.current) { setX(50); return; } setX(50 + Math.sin(k * Math.PI * 2) * 30); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  const mx = Math.max(...candles.map((c) => c.h)), mn = Math.min(...candles.map((c) => c.l));
  const y = (v: number) => 8 + ((mx - v) / (mx - mn)) * 144;
  const cw = 320 / candles.length;
  const ma = (n: number) => candles.map((_, i) => { const s = candles.slice(Math.max(0, i - n + 1), i + 1); return s.reduce((a, c) => a + c.c, 0) / s.length; });
  const ma7 = ma(7), ma21 = ma(21);
  const line = (arr: number[], off = 0) => arr.map((v, i) => `${i * cw + cw / 2},${y(v + off)}`).join(" ");
  const set = (cx: number) => { const r = box.current!.getBoundingClientRect(); setX(clamp(((cx - r.left) / r.width) * 100, 0, 100)); };
  const Chart = ({ ind }: { ind: boolean }) => (
    <svg viewBox="0 0 320 160" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      {candles.map((c, i) => { const col = c.c >= c.o ? "#1fdb8b" : "#ff4d6a"; return (<g key={i} opacity={ind ? 0.5 : 1}><line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} /><rect x={i * cw + 1.5} y={y(Math.max(c.o, c.c))} width={cw - 3} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx="1" /></g>); })}
      {ind && <>
        <polygon points={`${line(ma21, 6)} ${[...ma21].reverse().map((v, i) => `${(ma21.length - 1 - i) * cw + cw / 2},${y(v - 6)}`).join(" ")}`} fill="rgba(141,92,255,.13)" />
        <polyline points={line(ma21, 6)} fill="none" stroke="#8d5cff" strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={line(ma21, -6)} fill="none" stroke="#8d5cff" strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={line(ma7)} fill="none" stroke="#ffc53d" strokeWidth="2" />
        <polyline points={line(ma21)} fill="none" stroke="#2ed3f0" strokeWidth="2" />
      </>}
    </svg>
  );
  return (
    <Asset title="Before / After Compare" id="sld.compare" desc="Сравнение: сырой график vs график с MA и Bollinger. Тяните разделитель; при появлении — демо-проводка." className="lg:col-span-2">
      <div ref={viewRef}>
        <div ref={box} className="relative h-[220px] inset !rounded-2xl overflow-hidden touch-none select-none cursor-ew-resize"
          onPointerDown={(e) => { touched.current = true; e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); set(e.clientX); }}
          onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => setDrag(false)}>
          <Chart ind={false} />
          <div className="absolute inset-0 bg-[#0c1840]" style={{ clipPath: `inset(0 0 0 ${x}%)` }}><Chart ind /></div>
          <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider bg-black/40 rounded-md px-2 py-1">Raw</span>
          <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-violet/40 rounded-md px-2 py-1">Indicators</span>
          <div className="absolute inset-y-0 w-[3px] -ml-[1.5px] bg-white shadow-[0_0_14px_rgba(255,255,255,.6)]" style={{ left: `${x}%` }}>
            <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-11 rounded-full bg-white text-ink-900 grid place-items-center shadow-[0_4px_0_#7d8fc4,0_10px_20px_rgba(0,0,0,.5)] transition-transform", drag && "scale-110")}>
              <span className="flex"><Icon name="chevL" size={14} stroke={3} /><Icon name="chevR" size={14} stroke={3} /></span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-[11px] font-bold text-mute">
          <span className="flex items-center gap-1.5"><i className="w-4 h-[3px] rounded bg-gold" />MA(7)</span>
          <span className="flex items-center gap-1.5"><i className="w-4 h-[3px] rounded bg-cyan" />MA(21)</span>
          <span className="flex items-center gap-1.5"><i className="w-4 h-[3px] rounded bg-violet" />Bollinger</span>
          <span className="ml-auto num">{Math.round(x)}%</span>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. SLIDE TO CONFIRM
   ========================================================= */
function SlideConfirm({ label, tone }: { label: string; tone: "bull" | "bear" }) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const max = () => (track.current?.clientWidth ?? 300) - 60;
  const ref = useDrag<HTMLDivElement>({
    onStart: () => { if (!done) setDrag(true); },
    onMove: (d) => { if (done) return; const nx = clamp(d.dx, 0, max()); if (Math.floor(nx / 40) !== Math.floor(x / 40)) sfx.tick(); setX(nx); },
    onEnd: (d) => {
      setDrag(false);
      if (done) return;
      if (clamp(d.dx, 0, max()) > max() * 0.86) {
        setX(max()); setDone(true); sfx.success(); haptic([20, 30, 60]);
        const r = track.current?.getBoundingClientRect();
        if (r) burstConfetti(r.right - 30, r.top + r.height / 2, 30, 0.7);
        setTimeout(() => { setDone(false); setX(0); }, 2200);
      } else { setX(0); if (d.dx > 20) sfx.error(); }
    },
  }, "x");
  const c = tone === "bull" ? { a: "#5af5b4", b: "#1fdb8b", lip: "#0d9a5c", fg: "#03261a", glow: "rgba(31,219,139,.4)" } : { a: "#ff7c93", b: "#ff4d6a", lip: "#c0253f", fg: "#fff", glow: "rgba(255,77,106,.4)" };
  const k = x / Math.max(1, max());
  return (
    <div ref={track} className="relative h-[64px] rounded-full inset !rounded-full overflow-hidden select-none">
      <div className="absolute inset-y-[5px] left-[5px] rounded-full" style={{ width: x + 54, background: `linear-gradient(90deg, ${c.b}33, ${c.b}aa)`, transition: drag ? "none" : "width .45s cubic-bezier(.3,1.4,.5,1)" }} />
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span className="text-[13px] font-extrabold uppercase tracking-[.2em] shine px-6" style={{ opacity: done ? 0 : 1 - k * 1.2, color: "#8e9cc8" }}>{label} →</span>
        {done && <span className="absolute text-[13px] font-extrabold uppercase tracking-[.2em] anim-pop" style={{ color: c.b }}>Confirmed ✓</span>}
      </div>
      <div ref={ref} className="absolute top-[5px] left-[5px] size-[54px] rounded-full grid place-items-center cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(${x}px) scale(${drag ? 1.06 : 1})`, transition: drag ? "none" : "transform .45s cubic-bezier(.3,1.4,.5,1)", background: `linear-gradient(180deg, ${c.a}, ${c.b})`, boxShadow: `0 4px 0 ${c.lip}, 0 0 ${10 + k * 30}px ${c.glow}`, color: c.fg }}>
        <Icon name={done ? "check" : tone === "bull" ? "arrowUp" : "arrowDown"} size={24} stroke={3} className={done ? "anim-pop" : ""} />
      </div>
    </div>
  );
}
function SlideToConfirm() {
  return (
    <Asset title="Slide to Confirm" id="sld.confirm" desc="Защита от случайной сделки свайпом: шиммер-текст гаснет по ходу, заливка следует за пальцем, резинка при недотяге, конфетти при подтверждении.">
      <div className="space-y-4 pt-2">
        <SlideConfirm label="Slide to Buy" tone="bull" />
        <SlideConfirm label="Slide to Sell" tone="bear" />
        <div className="text-[11px] text-dim font-semibold text-center">Дотяните до конца — иначе бегунок пружинит обратно</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   8. EMOJI CONFIDENCE RATING
   ========================================================= */
function EmojiRating() {
  const [v, setV] = useState(60);
  const hue = v * 1.25;
  const mouth = 62 + (v - 50) * 0.42;
  const brow = (50 - v) * 0.14;
  const label = v < 20 ? "Паника" : v < 40 ? "Сомневаюсь" : v < 60 ? "Нейтрально" : v < 80 ? "Уверен" : "Всё в стейк!";
  return (
    <Asset title="Emoji Confidence" id="sld.emoji" desc="«Насколько ты уверен в прогнозе?» — лицо морфится по значению: рот, брови, глаза, цвет.">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 100" className="size-32 transition-all" style={{ filter: `drop-shadow(0 6px 0 hsl(${hue} 60% 25%))` }}>
          <circle cx="50" cy="50" r="44" fill={`hsl(${hue} 80% 55%)`} />
          <ellipse cx="38" cy="30" rx="16" ry="9" fill="rgba(255,255,255,.3)" />
          <ellipse cx="36" cy="44" rx="4.5" ry={4 + v / 40} fill="#1a1a2e" />
          <ellipse cx="64" cy="44" rx="4.5" ry={4 + v / 40} fill="#1a1a2e" />
          <line x1="28" y1={33 - brow} x2="42" y2={33 + brow} stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
          <line x1="58" y1={33 + brow} x2="72" y2={33 - brow} stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
          <path d={`M32 64 Q50 ${mouth} 68 64`} fill="none" stroke="#1a1a2e" strokeWidth="4" strokeLinecap="round" />
          {v > 85 && <text x="80" y="22" fontSize="14">✨</text>}
        </svg>
        <div key={label} className="font-extrabold text-[16px] mt-2 anim-pop" style={{ color: `hsl(${hue} 80% 60%)` }}>{label}</div>
        <div className="w-full mt-1"><Slider3D value={v} onChange={setV} format={(n) => `${n}%`} color={`linear-gradient(90deg,#ff4d6a,hsl(${hue} 80% 55%))`} /></div>
      </div>
    </Asset>
  );
}

/* =========================================================
   9. ELASTIC RUBBER-BAND SLIDER
   ========================================================= */
function ElasticSlider() {
  const [v, setV] = useState(40);
  const [over, setOver] = useState(0);
  const [drag, setDrag] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const set = (cx: number) => {
    const r = track.current!.getBoundingClientRect();
    const raw = cx - r.left;
    if (raw < 0) { setV(0); setOver(rubber(raw, r.width * 0.25)); }
    else if (raw > r.width) { setV(100); setOver(rubber(raw - r.width, r.width * 0.25)); }
    else { const n = Math.round((raw / r.width) * 100); if (n !== v && n % 10 === 0) sfx.tick(); setV(n); setOver(0); }
  };
  const w = track.current?.clientWidth ?? 300;
  return (
    <Asset title="Elastic Slider" id="sld.elastic" desc="Потяните за край — трек растягивается с сопротивлением (rubber-band как в iOS) и пружинит назад.">
      <div className="py-8 px-2">
        <div className="flex items-center gap-3">
          <Icon name="mute" size={18} className={cn("text-dim transition-transform", over < 0 && "scale-125 text-bear")} style={{ transform: `translateX(${Math.min(0, over) * 0.5}px)` }} />
          <div ref={track} className="relative flex-1 h-4 touch-none select-none cursor-pointer"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); set(e.clientX); }}
            onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => { setDrag(false); setOver(0); }}>
            <div className="absolute inset-0 inset !rounded-full" style={{ transform: `translateX(${over < 0 ? over * 0.5 : over * 0.5}px) scaleX(${1 + Math.abs(over) / w}) scaleY(${1 - Math.abs(over) / w * 0.6})`, transformOrigin: over < 0 ? "right" : "left", transition: drag ? "none" : "transform .6s cubic-bezier(.3,1.8,.4,1)" }}>
              <div className="absolute inset-y-[3px] left-[3px] rounded-full bg-gradient-to-r from-violet to-blue" style={{ width: `calc(${v}% - 3px)` }} />
            </div>
            <div className="absolute top-1/2 -ml-4 size-8 rounded-full bg-gradient-to-b from-white to-[#c5d2f5] shadow-[0_4px_0_#7d8fc4]" style={{ left: `${v}%`, transform: `translate(${over}px, -50%) scale(${drag ? 1.15 : 1})`, transition: drag ? "none" : "transform .6s cubic-bezier(.3,1.8,.4,1)" }} />
          </div>
          <Icon name="volume" size={18} className={cn("text-dim transition-transform", over > 0 && "scale-125 text-bull")} style={{ transform: `translateX(${Math.max(0, over) * 0.5}px)` }} />
        </div>
        <div className="text-center mt-5"><span className="num text-[26px] font-extrabold">{v}</span><span className="text-mute font-bold">%</span></div>
      </div>
    </Asset>
  );
}

/* =========================================================
   10. WHEEL PICKERS (iOS drum)
   ========================================================= */
export function WheelPicker({ items, value, onChange, width = 96 }: { items: string[]; value: number; onChange: (i: number) => void; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const H = 36;
  const last = useRef(value);
  const paint = () => {
    const el = ref.current;
    if (!el) return;
    const pos = el.scrollTop / H;
    itemRefs.current.forEach((it, k) => {
      if (!it) return;
      const d = k - pos;
      const a = Math.min(Math.abs(d), 3);
      it.style.transform = `rotateX(${clamp(-d * 24, -75, 75)}deg) scale(${1 - a * 0.06})`;
      it.style.opacity = String(Math.max(0.1, 1 - a * 0.3));
      it.style.color = a < 0.5 ? "#eaf0ff" : "#8e9cc8";
    });
    const i = clamp(Math.round(pos), 0, items.length - 1);
    if (i !== last.current) { last.current = i; onChange(i); sfx.tick(); haptic(4); }
  };
  useEffect(() => { const el = ref.current; if (el) { el.scrollTop = value * H; paint(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative" style={{ width }}>
      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-9 rounded-xl bg-white/[.06] border border-white/10 pointer-events-none" />
      <div ref={ref} onScroll={paint} className="h-[180px] overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [mask-image:linear-gradient(transparent,#000_30%,#000_70%,transparent)]" style={{ perspective: 380 }}>
        <div style={{ height: 72 }} />
        {items.map((it, k) => (
          <div key={it} ref={(e) => { itemRefs.current[k] = e; }} onClick={() => ref.current?.scrollTo({ top: k * H, behavior: "smooth" })}
            className="h-9 snap-center grid place-items-center text-[15px] font-extrabold num cursor-pointer will-change-transform">{it}</div>
        ))}
        <div style={{ height: 72 }} />
      </div>
    </div>
  );
}
function Pickers() {
  const TF = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];
  const LEV = ["1x", "2x", "3x", "5x", "10x", "20x", "50x", "100x"];
  const TYPE = ["Market", "Limit", "Stop", "OCO", "Trailing"];
  const [tf, setTf] = useState(4);
  const [lev, setLev] = useState(3);
  const [ty, setTy] = useState(1);
  return (
    <Asset title="Wheel Pickers" id="sld.wheel" desc="Барабаны iOS: 3D-вращение rotateX, snap, щелчок и хаптик на каждом значении. Скролл, свайп или клик.">
      <div className="inset !rounded-3xl p-3 flex justify-center gap-1">
        <WheelPicker items={TF} value={tf} onChange={setTf} width={80} />
        <WheelPicker items={LEV} value={lev} onChange={setLev} width={80} />
        <WheelPicker items={TYPE} value={ty} onChange={setTy} width={104} />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-[12.5px] font-bold">Ордер: <span className="text-blue">{TYPE[ty]}</span> · <span className="text-gold num">{LEV[lev]}</span> · <span className="text-cyan num">{TF[tf]}</span></div>
        <Btn3D size="xs" variant="bull" onClick={() => sfx.success()}>Set</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   11. HOLD-TO-ACCELERATE STEPPER
   ========================================================= */
function HoldStepper() {
  const [v, setV] = useState(250);
  const [dir, setDir] = useState<1 | -1>(1);
  const [speed, setSpeed] = useState(0);
  const timer = useRef<number | null>(null);
  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setSpeed(0); };
  const start = (d: 1 | -1) => {
    stop();
    let delay = 380, n = 0;
    setDir(d);
    const tick = () => {
      n++;
      const step = n > 24 ? 100 : n > 12 ? 10 : 1;
      setV((x) => clamp(x + d * step, 0, 99999));
      setSpeed(n > 24 ? 3 : n > 12 ? 2 : n > 4 ? 1 : 0);
      sfx.tick(); haptic(3);
      delay = Math.max(35, delay * 0.84);
      timer.current = window.setTimeout(tick, delay);
    };
    tick();
  };
  useEffect(() => stop, []);
  const digits = String(v).padStart(5, "0").split("");
  return (
    <Asset title="Accelerating Stepper" id="sld.stepper" desc="Удерживайте +/−: скорость растёт (×1 → ×10 → ×100), цифры прокатываются вверх/вниз.">
      <div className="flex items-center justify-between gap-3">
        <Btn3D round size="lg" variant="neutral" className="w-14" sound="none" onPointerDown={() => start(-1)} onPointerUp={stop} onPointerLeave={stop}><Icon name="minus" size={22} stroke={3} /></Btn3D>
        <div className="flex-1 inset !rounded-2xl h-20 flex items-center justify-center gap-0.5 overflow-hidden">
          <span className="text-[26px] font-extrabold text-dim mr-1">$</span>
          {digits.map((d, i) => (
            <span key={i} className="relative w-[22px] h-10 overflow-hidden">
              <span key={d + "-" + i} className="absolute inset-0 grid place-items-center num text-[32px] font-extrabold" style={{ animation: `${dir === 1 ? "roll-in-up" : "roll-in-down"} .22s cubic-bezier(.3,1.4,.5,1)`, color: i < digits.findIndex((x) => x !== "0") ? "#26397a" : undefined }}>{d}</span>
            </span>
          ))}
        </div>
        <Btn3D round size="lg" variant="blue" className="w-14" sound="none" onPointerDown={() => start(1)} onPointerUp={stop} onPointerLeave={stop}><Icon name="plus" size={22} stroke={3} /></Btn3D>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {["×1", "×10", "×100"].map((l, i) => <span key={l} className={cn("px-2.5 h-7 rounded-lg grid place-items-center text-[11px] font-extrabold num transition-all", speed > i ? "bg-gold text-ink-900 scale-110 shadow-[0_3px_0_#c38709]" : "bg-white/5 text-dim")}>{l}</span>)}
      </div>
    </Asset>
  );
}

/* =========================================================
   12. REPLAY SCRUBBER
   ========================================================= */
function ReplayScrubber() {
  const data = useMemo(() => { let p = 100; return Array.from({ length: 60 }, (_, i) => { const o = p; const c = o * (1 + (Math.random() - 0.45 + (i > 30 ? 0.08 : -0.03)) * 0.04); p = c; return { o, c, h: Math.max(o, c) * 1.008, l: Math.min(o, c) * 0.992 }; }); }, []);
  const [idx, setIdx] = useState(12);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const h = setInterval(() => setIdx((i) => { if (i >= 59) { setPlay(false); sfx.success(); return 59; } return i + 1; }), 130);
    return () => clearInterval(h);
  }, [play]);
  const vis = data.slice(0, idx + 1);
  const mx = Math.max(...data.map((d) => d.h)), mn = Math.min(...data.map((d) => d.l));
  const cw = 360 / 60;
  const y = (v: number) => 6 + ((mx - v) / (mx - mn)) * 128;
  const entry = data[10].c;
  const pnl = ((data[idx].c - entry) / entry) * 100;
  return (
    <Asset title="Replay Scrubber" id="sld.replay" desc="Перемотка истории рынка: скраббер раскрывает свечи, PnL гипотетического лонга пересчитывается на лету. Play — автопроигрыш." className="lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Btn3D round size="sm" variant={play ? "bear" : "bull"} className="w-10" onClick={() => { if (idx >= 59) setIdx(11); setPlay(!play); }}><Icon name={play ? "minus" : "play"} size={16} stroke={3} /></Btn3D>
          <div><div className="font-extrabold text-[13px]">BTC · Replay</div><div className="num text-[11px] text-dim">Свеча {idx + 1}/60</div></div>
        </div>
        <div className="text-right"><div className="label-caps !mb-0">Long PnL</div><div className={cn("num text-[20px] font-extrabold", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%</div></div>
      </div>
      <div className="inset p-2">
        <svg viewBox="0 0 360 140" className="w-full h-[150px]" preserveAspectRatio="none">
          <line x1="0" x2="360" y1={y(entry)} y2={y(entry)} stroke="#ffc53d" strokeDasharray="4 4" strokeWidth="1" />
          <rect x={10 * cw} y="0" width={Math.max(0, (idx - 10) * cw + cw)} height="140" fill={pnl >= 0 ? "rgba(31,219,139,.06)" : "rgba(255,77,106,.07)"} />
          {vis.map((d, i) => { const col = d.c >= d.o ? "#1fdb8b" : "#ff4d6a"; return (<g key={i}><line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} /><rect x={i * cw + 1} y={y(Math.max(d.o, d.c))} width={cw - 2} height={Math.max(1.2, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="0.8" /></g>); })}
          <line x1={idx * cw + cw / 2} x2={idx * cw + cw / 2} y1="0" y2="140" stroke="rgba(255,255,255,.5)" strokeDasharray="2 3" />
          <circle cx={10 * cw + cw / 2} cy={y(entry)} r="4" fill="#ffc53d" />
        </svg>
      </div>
      <Slider3D value={idx} onChange={(n) => { setPlay(false); setIdx(Math.max(10, n)); }} min={0} max={59} marks={[10, 30, 59]} format={(n) => (n === 10 ? "Entry" : `#${n + 1}`)} color="linear-gradient(90deg,#ffc53d,#3d7bff)" />
    </Asset>
  );
}

export default function Sliders() {
  return (
    <Section id="sliders" index="10" title="Sliders & Dials" subtitle="12 типов ввода значений: диапазоны, ступени, вертикальные, ручки, круговые, сравнение, swipe-to-confirm, барабаны, скрабберы" count={12}>
      <div className="grid lg:grid-cols-3 gap-6">
        <DualRange />
        <SteppedRisk />
        <Knob />
        <Radial />
        <Allocation />
        <CompareSlider />
        <SlideToConfirm />
        <Pickers />
        <EmojiRating />
        <ElasticSlider />
        <HoldStepper />
        <ReplayScrubber />
      </div>
    </Section>
  );
}
