import { useRef, useState } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump } from "../ui/kit";
import { Mascot, type Mood } from "../ui/Mascot";
import { clamp, useDrag, useRaf, useSpring } from "../ui/hooks";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ SLD-01 · Dual range with histogram ═════════ */

const HIST = Array.from({ length: 36 }, (_, i) => Math.round(18 + 70 * Math.exp(-((i - 16) ** 2) / 60) + 25 * Math.exp(-((i - 27) ** 2) / 14) + ((i * 37) % 11)));
function DualRange() {
  const [lo, setLo] = useState(28);
  const [hi, setHi] = useState(72);
  const [act, setAct] = useState<"lo" | "hi" | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const toV = (x: number) => { const r = track.current!.getBoundingClientRect(); return clamp(Math.round(((x - r.left) / r.width) * 100), 0, 100); };
  const mk = (which: "lo" | "hi") => ({
    onStart: () => { setAct(which); feel("tap", 5); },
    onMove: (d: { x: number }) => {
      const v = toV(d.x);
      if (which === "lo") setLo((o) => { const n = Math.min(v, hi - 4); if (n !== o) sfx.play("tick"); return n; });
      else setHi((o) => { const n = Math.max(v, lo + 4); if (n !== o) sfx.play("tick"); return n; });
    },
    onEnd: () => setAct(null),
  });
  const dLo = useDrag(mk("lo"));
  const dHi = useDrag(mk("hi"));
  const price = (v: number) => Math.round(58000 + v * 120);
  const inRange = HIST.filter((_, i) => (i / (HIST.length - 1)) * 100 >= lo && (i / (HIST.length - 1)) * 100 <= hi).reduce((a, b) => a + b, 0);
  const all = HIST.reduce((a, b) => a + b, 0);
  return (
    <AssetCard id="SLD-01" title="Dual Range · Histogram" desc="Диапазон цены для лимит-ордеров: гистограмма объёма подсвечивается внутри диапазона, два бегунка с лупой-значением." tags={["slider", "range", "dual", "histogram"]}>
      <div className="flex h-24 items-end gap-[3px] px-3">
        {HIST.map((h, i) => {
          const p = (i / (HIST.length - 1)) * 100;
          const on = p >= lo && p <= hi;
          return <div key={i} className="flex-1 rounded-t-[3px] transition-all duration-200" style={{ height: `${h}%`, background: on ? "linear-gradient(180deg,#5ce1ff,#3d8bff)" : "#22376f", opacity: on ? 1 : 0.5, transform: `scaleY(${on ? 1 : 0.85})`, transformOrigin: "bottom" }} />;
        })}
      </div>
      <div ref={track} className="relative mx-3 mt-2 h-10">
        <div className="well absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky to-[#5ce1ff] shadow-[0_0_12px_#3d8bff88]" style={{ left: `${lo}%`, right: `${100 - hi}%` }} />
        {(["lo", "hi"] as const).map((w) => {
          const v = w === "lo" ? lo : hi;
          return (
            <div key={w} onPointerDown={w === "lo" ? dLo : dHi} className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none" style={{ left: `${v}%` }}>
              <div className={cn("absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-extrabold text-ink-900 shadow-[0_3px_0_#c3cdea] transition-all duration-200", act === w ? "scale-110 opacity-100" : "scale-90 opacity-80")}>
                ${price(v).toLocaleString()}
              </div>
              <div className={cn("h-7 w-7 rounded-full border-4 border-white bg-sky transition-transform", act === w ? "scale-125 shadow-[0_0_0_8px_#3d8bff33,0_4px_0_#1e56c9]" : "shadow-[0_4px_0_#1e56c9]")} />
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Min</div><div className="font-mono text-xs font-extrabold text-white">${price(lo).toLocaleString()}</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Volume</div><div className="font-mono text-xs font-extrabold text-sky">{Math.round((inRange / all) * 100)}%</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Max</div><div className="font-mono text-xs font-extrabold text-white">${price(hi).toLocaleString()}</div></div>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-02 · Before / After compare ═════════ */
const CMP = Array.from({ length: 26 }, (_, i) => { const b = 50 + Math.sin(i / 3) * 18 + i * 0.8; return { o: b + Math.sin(i * 1.7) * 6, c: b + Math.cos(i * 1.3) * 6 }; });
function Compare() {
  const [x, setX] = useState(50);
  const [drag, setDrag] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const onDown = useDrag({
    onStart: (cx) => { setDrag(true); const r = box.current!.getBoundingClientRect(); setX(clamp(((cx - r.left) / r.width) * 100, 0, 100)); },
    onMove: (d) => { const r = box.current!.getBoundingClientRect(); setX(clamp(((d.x - r.left) / r.width) * 100, 0, 100)); sfx.play("tick"); },
    onEnd: () => setDrag(false),
  });
  const y = (v: number) => 110 - v;
  const chart = (ind: boolean) => (
    <svg viewBox="0 0 260 120" className="h-full w-full" preserveAspectRatio="none">
      {CMP.map((c, i) => {
        const g = c.c >= c.o; const col = g ? "#2ee59d" : "#ff4d6a"; const cx = 8 + i * 9.6;
        return <g key={i}><line x1={cx} x2={cx} y1={y(Math.max(c.o, c.c) + 4)} y2={y(Math.min(c.o, c.c) - 4)} stroke={col} strokeWidth="1" /><rect x={cx - 3} width="6" y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(c.o - c.c))} rx="1" fill={col} opacity={ind ? 0.55 : 1} /></g>;
      })}
      {ind && <>
        <path d={CMP.map((c, i) => `${i ? "L" : "M"}${8 + i * 9.6} ${y((c.o + c.c) / 2 - 2)}`).join(" ")} fill="none" stroke="#ffc53d" strokeWidth="2.5" />
        <path d={CMP.map((_, i) => { const s = CMP.slice(Math.max(0, i - 5), i + 1); const m = s.reduce((a, b) => a + (b.o + b.c) / 2, 0) / s.length; return `${i ? "L" : "M"}${8 + i * 9.6} ${y(m - 6)}`; }).join(" ")} fill="none" stroke="#a174ff" strokeWidth="2.5" />
        {[6, 14, 21].map((i) => <g key={i}><circle cx={8 + i * 9.6} cy={y(CMP[i].c) + 16} r="7" fill="#2ee59d" /><text x={8 + i * 9.6} y={y(CMP[i].c) + 19.5} fontSize="8" fontWeight="800" textAnchor="middle" fill="#0a1330">B</text></g>)}
      </>}
    </svg>
  );
  return (
    <AssetCard id="SLD-02" title="Before / After Compare" desc="Слайдер сравнения: «сырой» график против графика с EMA и сигналами. Показывает, как индикаторы помогают видеть тренд." tags={["compare", "before-after", "slider", "chart"]}>
      <div ref={box} onPointerDown={onDown} className="well relative h-48 cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl">
        <div className="absolute inset-0 p-2">{chart(false)}</div>
        <div className="absolute inset-0 bg-ink-900/40 p-2" style={{ clipPath: `inset(0 0 0 ${x}%)` }}>{chart(true)}</div>
        <span className="absolute left-2 top-2 rounded-md bg-ink-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink-300">Raw</span>
        <span className="absolute right-2 top-2 rounded-md bg-gold/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gold">EMA + Signals</span>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_#fff]" style={{ left: `${x}%` }}>
          <div className={cn("absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_4px_0_#8fa0cf] transition-transform", drag && "scale-110")}>
            <Icon name="swap" size={18} stroke={2.6} className="text-ink-900" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-ink-300">
        <span className="flex items-center gap-1.5"><span className="h-1 w-4 rounded bg-gold" />EMA 9</span>
        <span className="flex items-center gap-1.5"><span className="h-1 w-4 rounded bg-violet" />SMA 20</span>
        <span className="flex items-center gap-1.5"><span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-bull text-[7px] font-extrabold text-ink-900">B</span>Buy signal</span>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-03 · Slide to confirm ═════════ */
function SlideConfirm() {
  const game = useGame();
  const track = useRef<HTMLDivElement>(null);
  const [x, api] = useSpring(0, 260, 24);
  const [done, setDone] = useState(false);
  const [b, bump] = useBump();
  const max = () => (track.current ? track.current.clientWidth - 60 : 200);
  const onDown = useDrag({
    onStart: () => { if (done) return false; api.set(0); },
    onMove: (d) => { const v = clamp(d.dx, 0, max()); api.set(v); if (v / max() > 0.5) haptic(2); },
    onEnd: (d) => {
      if (api.get() > max() * 0.85) {
        api.set(max()); setDone(true); bump(); feel("success", [20, 30, 60]);
        game.reward({ xp: 20, x: d.x, y: d.y });
      } else api.release();
    },
  });
  const p = x / (max() || 1);
  return (
    <AssetCard id="SLD-03" title="Slide to Confirm" desc="Свайп-подтверждение сделки: текст с бегущим бликом тает, дорожка заливается, при 85% — фиксация и награда." tags={["slide", "confirm", "gesture", "cta"]}>
      <div className="mb-4 rounded-2xl bg-ink-900/60 p-3 text-xs">
        <div className="flex justify-between"><span className="text-ink-400">Market Buy</span><span className="font-mono font-bold text-white">0.0156 BTC</span></div>
        <div className="flex justify-between"><span className="text-ink-400">Total</span><span className="font-mono font-bold text-white">$1,000.00</span></div>
      </div>
      <div ref={track} className="well relative h-16 overflow-hidden rounded-full p-1.5">
        <div className="absolute inset-y-1.5 left-1.5 rounded-full bg-gradient-to-r from-bull-edge to-bull" style={{ width: x + 52, opacity: 0.25 + p * 0.75 }} />
        <div className="absolute inset-0 grid place-items-center text-sm font-extrabold uppercase tracking-[.2em]" style={{ opacity: done ? 0 : 1 - p * 1.4 }}>
          <span className="bg-[linear-gradient(90deg,#5a70ad_0%,#fff_50%,#5a70ad_100%)] bg-[length:200%_100%] bg-clip-text text-transparent" style={{ animation: "gradientShift 2.4s linear infinite" }}>Slide to buy ›››</span>
        </div>
        {done && <div className="anim-pop absolute inset-0 grid place-items-center text-sm font-extrabold uppercase tracking-widest text-ink-900">Order filled ✓</div>}
        <div onPointerDown={onDown} className={cn("relative z-10 grid h-[52px] w-[52px] cursor-grab touch-none place-items-center rounded-full bg-gradient-to-b from-white to-ink-200 shadow-[0_4px_0_#8fa0cf,0_6px_14px_#0006]", done && "cursor-default")} style={{ transform: `translateX(${x}px) rotate(${p * 360}deg)` }}>
          <Icon name={done ? "check" : "chevR"} size={24} stroke={3.4} className={done ? "text-bull-edge" : "text-ink-800"} />
          <Burst trigger={b} />
        </div>
      </div>
      <div className="mt-3 text-center">{done ? <Btn v="ghost" size="sm" onClick={() => { setDone(false); api.release(); }}><Icon name="refresh" size={14} />Reset</Btn> : <span className="text-[11px] font-bold text-ink-400">Защита от случайных нажатий</span>}</div>
    </AssetCard>
  );
}

/* ═════════ SLD-04 · Hold to confirm ═════════ */
function HoldConfirm() {
  const game = useGame();
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [b, bump] = useBump();
  const lastStep = useRef(0);
  const where = useRef({ x: 0, y: 0 });
  const pRef = useRef(0);
  useRaf((dt) => {
    let n = pRef.current;
    if (holding) n = Math.min(1, n + dt / 1500);
    else n = Math.max(0, n - dt / 400);
    const step = Math.floor(n * 10);
    if (holding && step > lastStep.current) { haptic(4 + step); sfx.play("tick"); }
    lastStep.current = step;
    if (n >= 1 && pRef.current < 1 && !done) {
      setDone(true); setHolding(false); bump(); feel("success", [30, 40, 80]);
      game.reward({ xp: 25, gems: 50, x: where.current.x, y: where.current.y });
    }
    pRef.current = n;
    setP(n);
  }, (holding || pRef.current > 0) && !done);
  const R = 58, C = 2 * Math.PI * R;
  return (
    <AssetCard id="SLD-04" title="Hold to Confirm" desc="Удерживай для закрытия всех позиций: кольцо заполняется, вибрация нарастает, отпустишь раньше — кольцо откатывается." tags={["hold", "long-press", "confirm", "haptic"]}>
      <div className="flex flex-col items-center py-2">
        <div className="relative grid h-36 w-36 place-items-center">
          <svg width="144" height="144" className="absolute -rotate-90">
            <circle cx="72" cy="72" r={R} stroke="#081130" strokeWidth="10" fill="none" />
            <circle cx="72" cy="72" r={R} stroke={done ? "#2ee59d" : "#ff4d6a"} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} style={{ filter: `drop-shadow(0 0 8px ${done ? "#2ee59d" : "#ff4d6a"})` }} />
          </svg>
          <button
            onPointerDown={(e) => { if (done) return; where.current = { x: e.clientX, y: e.clientY }; setHolding(true); feel("tap", 10); }}
            onPointerUp={() => setHolding(false)} onPointerLeave={() => setHolding(false)} onContextMenu={(e) => e.preventDefault()}
            className={cn("relative grid h-24 w-24 touch-none select-none place-items-center rounded-full transition-transform", done ? "bg-gradient-to-b from-bull to-bull-edge shadow-[0_5px_0_#0b7a4d]" : "bg-gradient-to-b from-bear to-bear-edge shadow-[0_5px_0_#8c1530]")}
            style={{ transform: `scale(${1 - p * 0.08}) translateY(${holding ? 3 : 0}px)`, animation: holding ? "shake .25s linear infinite" : undefined }}>
            {done ? <Icon name="check" size={40} stroke={3.4} className="anim-pop text-ink-900" /> : <div className="text-center"><Icon name="x" size={26} stroke={3.2} className="mx-auto text-white" /><div className="mt-0.5 font-mono text-[10px] font-extrabold text-white">{Math.round(p * 100)}%</div></div>}
            <Burst trigger={b} count={16} spread={90} />
          </button>
        </div>
        <div className="mt-3 text-sm font-extrabold text-white">{done ? "Все позиции закрыты" : holding ? "Держи…" : "Hold to close all"}</div>
        {done && <div className="mt-3"><Btn v="ghost" size="sm" onClick={() => { setDone(false); pRef.current = 0; setP(0); }}><Icon name="refresh" size={14} />Reset</Btn></div>}
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-05 · Rotary knob ═════════ */
function Knob() {
  const [v, setV] = useState(35);
  const ref = useRef<HTMLDivElement>(null);
  const onDown = useDrag({
    onStart: () => feel("tap", 5),
    onMove: (d) => {
      const r = ref.current!.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let a = (Math.atan2(d.y - cy, d.x - cx) * 180) / Math.PI + 90;
      if (a > 180) a -= 360;
      const nv = clamp(Math.round(((a + 135) / 270) * 20) * 5, 0, 100);
      setV((o) => { if (o !== nv) { sfx.play("tick"); haptic(3); } return nv; });
    },
  });
  const ang = -135 + (v / 100) * 270;
  const col = v < 30 ? "#2ee59d" : v < 60 ? "#ffc53d" : v < 80 ? "#ff8a3d" : "#ff4d6a";
  const arc = (from: number, to: number, r: number) => {
    const p = (a: number) => [100 + r * Math.sin((a * Math.PI) / 180), 100 - r * Math.cos((a * Math.PI) / 180)];
    const [x1, y1] = p(from), [x2, y2] = p(to);
    return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <AssetCard id="SLD-05" title="Rotary Risk Knob" desc="Поворотная ручка риск-аппетита: тянешь по кругу, щелчки на каждом шаге 5%, дуга меняет цвет по уровню риска." tags={["knob", "dial", "rotary", "risk"]}>
      <div className="flex items-center gap-4">
        <div ref={ref} onPointerDown={onDown} className="relative h-48 w-48 shrink-0 cursor-grab touch-none select-none">
          <svg viewBox="0 0 200 200" className="absolute inset-0">
            <path d={arc(-135, 135, 88)} stroke="#081130" strokeWidth="12" fill="none" strokeLinecap="round" />
            {v > 0 && <path d={arc(-135, ang, 88)} stroke={col} strokeWidth="12" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />}
            {Array.from({ length: 21 }).map((_, i) => {
              const a = ((-135 + i * 13.5) * Math.PI) / 180;
              const on = i * 5 <= v;
              return <line key={i} x1={100 + Math.sin(a) * 72} y1={100 - Math.cos(a) * 72} x2={100 + Math.sin(a) * (i % 5 ? 67 : 62)} y2={100 - Math.cos(a) * (i % 5 ? 67 : 62)} stroke={on ? col : "#2f4789"} strokeWidth={i % 5 ? 2 : 3} strokeLinecap="round" />;
            })}
          </svg>
          <div className="absolute inset-[46px] rounded-full bg-gradient-to-b from-ink-500 to-ink-700 shadow-[0_6px_0_#0b1638,0_12px_20px_#0008,inset_0_2px_0_#ffffff33]" style={{ transform: `rotate(${ang}deg)` }}>
            <span className="absolute left-1/2 top-2 h-5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: col, boxShadow: `0 0 8px ${col}` }} />
            {Array.from({ length: 24 }).map((_, i) => <span key={i} className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/5" style={{ transform: `rotate(${i * 15}deg)` }} />)}
          </div>
        </div>
        <div>
          <Label>Risk per trade</Label>
          <div className="font-mono text-4xl font-extrabold" style={{ color: col, textShadow: `0 0 18px ${col}66` }}>{(v / 20).toFixed(2)}%</div>
          <div className="mt-1 text-xs font-bold text-ink-300">{v < 30 ? "Консервативно — ты выживешь в любой рынок." : v < 60 ? "Умеренно — стандарт профи." : v < 80 ? "Агрессивно — нужна дисциплина." : "Опасно — одна серия убытков и всё."}</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-06 · iOS wheel picker ═════════ */
function Wheel({ items, value, onChange, width = 110 }: { items: string[]; value: number; onChange: (i: number) => void; width?: number }) {
  const [v, api] = useSpring(value, 180, 26);
  const base = useRef(0);
  const last = useRef(value);
  const ITEM = 38;
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => {
      const nv = clamp(base.current - d.dy / ITEM, -0.4, items.length - 0.6);
      api.set(nv);
      const r = Math.round(nv);
      if (r !== last.current) { last.current = r; sfx.play("tick"); haptic(2); }
    },
    onEnd: (d) => {
      const t = clamp(Math.round(api.get() - d.vy * 0.25), 0, items.length - 1);
      onChange(t); last.current = t; api.release();
    },
  });
  return (
    <div onPointerDown={onDown} onWheel={(e) => { const t = clamp(value + Math.sign(e.deltaY), 0, items.length - 1); if (t !== value) { onChange(t); sfx.play("tick"); } }}
      className="relative h-48 cursor-grab touch-none select-none overflow-hidden" style={{ width, perspective: 400 }}>
      {items.map((it, i) => {
        const d = i - v;
        if (Math.abs(d) > 3) return null;
        return (
          <div key={it} onClick={() => onChange(i)} className="absolute inset-x-0 top-1/2 flex h-[38px] items-center justify-center font-mono text-lg font-extrabold" style={{
            transform: `translateY(-50%) rotateX(${-d * 24}deg) translateZ(70px)`, transformOrigin: "center center -70px",
            opacity: 1 - Math.abs(d) * 0.28, color: Math.abs(d) < 0.5 ? "#fff" : "#8fa0cf",
          }}>{it}</div>
        );
      })}
    </div>
  );
}
function WheelPicker() {
  const amounts = ["$10", "$25", "$50", "$100", "$250", "$500", "$1000"];
  const freq = ["Daily", "Weekly", "2 Weeks", "Monthly"];
  const coins = ["BTC", "ETH", "SOL", "TON"];
  const [a, setA] = useState(3);
  const [f, setF] = useState(1);
  const [c, setC] = useState(0);
  const perYear = parseInt(amounts[a].slice(1)) * [365, 52, 26, 12][f];
  return (
    <AssetCard id="SLD-06" title="Wheel Picker · DCA Plan" desc="3D-барабаны как в iOS: драг с инерцией, колесо мыши, щелчки. Настройка плана регулярных покупок (DCA)." tags={["picker", "wheel", "ios", "3d"]}>
      <div className="well relative flex justify-center gap-1 overflow-hidden rounded-2xl px-2">
        <div className="pointer-events-none absolute inset-x-2 top-1/2 h-[38px] -translate-y-1/2 rounded-xl bg-white/[.06] ring-1 ring-sky/40" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,#081130_0%,transparent_35%,transparent_65%,#081130_100%)]" />
        <Wheel items={amounts} value={a} onChange={setA} width={96} />
        <Wheel items={coins} value={c} onChange={setC} width={78} />
        <Wheel items={freq} value={f} onChange={setF} width={110} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-900/60 p-3">
        <div><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Per year</div><div className="font-mono text-lg font-extrabold text-white">${perYear.toLocaleString()} → {coins[c]}</div></div>
        <Btn v="bull" size="sm">Start DCA</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-07 · Allocation faders (sum = 100%) ═════════ */
const FADERS = [{ s: "BTC", c: "#f7931a" }, { s: "ETH", c: "#8c8cff" }, { s: "SOL", c: "#14f195" }, { s: "USDT", c: "#26a17b" }];
function Fader({ i, v, color, label, onSet }: { i: number; v: number; color: string; label: string; onSet: (i: number, v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (y: number) => { const r = ref.current!.getBoundingClientRect(); onSet(i, clamp(Math.round((1 - (y - r.top) / r.height) * 100), 0, 100)); };
  const onDown = useDrag({ onStart: (_x, y) => set(y), onMove: (d) => set(d.y) });
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs font-extrabold" style={{ color }}>{v}%</span>
      <div ref={ref} onPointerDown={onDown} className="well relative h-40 w-10 cursor-ns-resize touch-none rounded-2xl">
        <div className="absolute inset-x-1 bottom-1 rounded-xl transition-[height] duration-150" style={{ height: `calc(${v}% - 8px)`, minHeight: 0, background: `linear-gradient(180deg, ${color}, ${color}88)`, boxShadow: `0 0 14px ${color}66` }}>
          <span className="absolute inset-x-1 top-1 h-2 rounded-full bg-white/40" />
        </div>
        <div className="absolute left-1/2 h-4 w-12 -translate-x-1/2 translate-y-1/2 rounded-md bg-gradient-to-b from-white to-ink-200 shadow-[0_3px_0_#8fa0cf]" style={{ bottom: `${v}%` }}>
          <span className="absolute inset-x-2 top-1/2 h-px bg-ink-400" />
        </div>
      </div>
      <span className="text-[11px] font-extrabold text-ink-200">{label}</span>
    </div>
  );
}
function Allocation() {
  const [vals, setVals] = useState([40, 30, 20, 10]);
  const onSet = (i: number, nv: number) => {
    setVals((old) => {
      const rest = old.reduce((a, b, k) => (k === i ? a : a + b), 0);
      const remain = 100 - nv;
      const next = old.map((x, k) => (k === i ? nv : rest === 0 ? Math.round(remain / (old.length - 1)) : Math.round((x / rest) * remain)));
      const diff = 100 - next.reduce((a, b) => a + b, 0);
      const fix = next.findIndex((_, k) => k !== i);
      next[fix] += diff;
      if (next[i] !== old[i]) sfx.play("tick");
      return next;
    });
  };
  const risk = Math.round(vals[0] * 0.6 + vals[1] * 0.8 + vals[2] * 1.0 + vals[3] * 0.05);
  return (
    <AssetCard id="SLD-07" title="Allocation Faders" desc="Микшер портфеля: вертикальные фейдеры всегда в сумме 100%, остальные перераспределяются пропорционально." tags={["fader", "vertical", "portfolio", "mixer"]}>
      <div className="flex justify-around">
        {FADERS.map((f, i) => <Fader key={f.s} i={i} v={vals[i]} color={f.c} label={f.s} onSet={onSet} />)}
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full">
        {FADERS.map((f, i) => <div key={f.s} className="h-full transition-[width] duration-200" style={{ width: `${vals[i]}%`, background: f.c }} />)}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-bold">
        <span className="text-ink-300">Risk score</span>
        <span className="font-mono font-extrabold" style={{ color: risk < 40 ? "#2ee59d" : risk < 70 ? "#ffc53d" : "#ff4d6a" }}>{risk}/100</span>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-08 · Sentiment slider with mascot ═════════ */
function Sentiment() {
  const [v, setV] = useState(60);
  const track = useRef<HTMLDivElement>(null);
  const setX = (x: number) => { const r = track.current!.getBoundingClientRect(); const nv = clamp(Math.round(((x - r.left) / r.width) * 100), 0, 100); setV((o) => { if (Math.floor(o / 20) !== Math.floor(nv / 20)) feel("pop", 6); return nv; }); };
  const onDown = useDrag({ onStart: (x) => setX(x), onMove: (d) => setX(d.x) });
  const EMO = ["😱", "😟", "😐", "🙂", "🤑"];
  const moods: Mood[] = ["sad", "think", "idle", "happy", "cool"];
  const labels = ["Капитуляция", "Сомнение", "Нейтрально", "Оптимизм", "Эйфория"];
  const k = Math.min(4, Math.floor(v / 20));
  const hue = 350 + (v / 100) * 150;
  return (
    <AssetCard id="SLD-08" title="Sentiment Slider · Reactive" desc="Опрос настроения: маскот, фон и эмодзи реагируют на положение бегунка в реальном времени. Эмодзи рядом с бегунком увеличиваются." tags={["slider", "emoji", "survey", "reactive"]}>
      <div className="relative overflow-hidden rounded-2xl p-4 transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 0%, hsl(${hue % 360} 80% 55% / .3), transparent 70%)` }}>
        <div className="flex items-center justify-center gap-4">
          <Mascot key={k} mood={moods[k]} size={90} className="anim-pop" />
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Как ты видишь рынок?</div>
            <div key={labels[k]} className="anim-fade-up text-xl font-extrabold text-white">{labels[k]}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-between px-1">
          {EMO.map((e, i) => {
            const d = Math.abs(i * 25 - v) / 25;
            return <button key={i} onClick={() => setV(i * 25)} className="text-2xl transition-transform" style={{ transform: `scale(${1 + Math.max(0, 1 - d) * 0.6}) translateY(${-Math.max(0, 1 - d) * 8}px)`, filter: d < 0.6 ? "none" : "grayscale(.8) opacity(.5)" }}>{e}</button>;
          })}
        </div>
        <div ref={track} onPointerDown={onDown} className="relative mt-3 h-8 cursor-pointer touch-none">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(90deg,#ff4d6a,#ff8a3d,#ffc53d,#8be36a,#2ee59d)" }} />
          <div className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_4px_0_#8fa0cf]" style={{ left: `${v}%`, background: `hsl(${hue % 360} 80% 55%)` }} />
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-09 · Numeric keypad ═════════ */
function Keypad() {
  const game = useGame();
  const [amt, setAmt] = useState("250");
  const [shake, setShake] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);
  const clearT = useRef<number | undefined>(undefined);
  const MAX = 10000;
  const press = (k: string) => {
    setPressed(k); window.setTimeout(() => setPressed(null), 120);
    let n = amt;
    if (k === "⌫") n = amt.length > 1 ? amt.slice(0, -1) : "0";
    else if (k === ".") n = amt.includes(".") ? amt : amt + ".";
    else n = amt === "0" ? k : amt + k;
    if (n.includes(".") && n.split(".")[1].length > 2) { setShake((s) => s + 1); feel("error", 30); return; }
    if (parseFloat(n) > MAX) { setShake((s) => s + 1); feel("error", [20, 20, 20]); return; }
    sfx.play("tap"); haptic(6);
    setAmt(n);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
  return (
    <AssetCard id="SLD-09" title="Numeric Keypad" desc="Мобильная клавиатура суммы: 3D-клавиши, ограничения (макс. $10k, 2 знака), тряска при ошибке, долгое ⌫ — очистка." tags={["keypad", "input", "amount", "mobile"]}>
      <div key={shake} className={cn("text-center", shake && "anim-shake")}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Amount</div>
        <div className="font-mono text-4xl font-extrabold tabular-nums text-white">${amt}</div>
        <div className="font-mono text-xs font-bold text-ink-400">≈ {(parseFloat(amt || "0") / 64250).toFixed(6)} BTC</div>
      </div>
      <div className="my-3 flex justify-center gap-2">
        {["100", "500", "1000"].map((q) => <button key={q} onClick={() => { setAmt(q); feel("tap"); }} className="rounded-full bg-ink-800 px-3 py-1 font-mono text-xs font-extrabold text-ink-200 shadow-[0_3px_0_#081130] active:translate-y-0.5">${q}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)}
            onPointerDown={() => { if (k === "⌫") clearT.current = window.setTimeout(() => { setAmt("0"); feel("whoosh", 20); }, 600); }}
            onPointerUp={() => clearTimeout(clearT.current)} onPointerLeave={() => clearTimeout(clearT.current)}
            className={cn("h-12 rounded-2xl font-mono text-xl font-extrabold text-white transition-all duration-75", pressed === k ? "pressed translate-y-1" : "raised")}>
            {k === "⌫" ? <Icon name="chevL" size={20} stroke={3} className="mx-auto" /> : k}
          </button>
        ))}
      </div>
      <Btn v="bull" block className="mt-3" onClick={(e) => game.reward({ xp: 10, x: e.clientX, y: e.clientY })}>Buy ${amt}</Btn>
    </AssetCard>
  );
}

export default function Sliders() {
  return (
    <Section id="sliders" num="09" title="Sliders & Inputs" subtitle="Диапазоны, сравнение, свайп/удержание-подтверждение, ручки, барабаны, фейдеры, клавиатура">
      <DualRange />
      <Compare />
      <SlideConfirm />
      <HoldConfirm />
      <Knob />
      <WheelPicker />
      <Allocation />
      <Sentiment />
      <Keypad />
    </Section>
  );
}
