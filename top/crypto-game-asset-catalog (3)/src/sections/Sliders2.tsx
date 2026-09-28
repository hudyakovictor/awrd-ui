import { useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section, useBump } from "../ui/kit";
import { clamp, mapRange, useDrag, useSpring } from "../ui/hooks";
import { CandleChart } from "../ui/Chart";
import { genCandles } from "../game/market";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ SLD-10 · Arc slider ═════════ */

function ArcSlider() {
  const [v, setV] = useState(35);
  const ref = useRef<HTMLDivElement>(null);
  const onDown = useDrag({
    onStart: () => feel("tap", 4),
    onMove: (d) => {
      const r = ref.current!.getBoundingClientRect();
      let a = (Math.atan2(d.y - (r.top + r.height * 0.62), d.x - (r.left + r.width / 2)) * 180) / Math.PI + 90;
      if (a > 180) a -= 360;
      const nv = clamp(Math.round(((a + 135) / 270) * 100), 0, 100);
      setV((o) => { if (Math.floor(o / 5) !== Math.floor(nv / 5)) sfx.play("tick"); return nv; });
    },
  });
  const a = -135 + (v / 100) * 270;
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const R = 80, cx = 100, cy = 110;
  const px = cx + Math.cos(rad(a)) * R, py = cy + Math.sin(rad(a)) * R;
  const arc = (from: number, to: number) => { const [x1, y1] = [cx + Math.cos(rad(from)) * R, cy + Math.sin(rad(from)) * R]; const [x2, y2] = [cx + Math.cos(rad(to)) * R, cy + Math.sin(rad(to)) * R]; return `M${x1} ${y1} A${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
  const monthly = Math.round(10 + (v / 100) * 990);
  return (
    <AssetCard id="SLD-10" title="Arc Slider · Monthly Plan" desc="Дуговой слайдер 270°: бегунок движется по окружности за пальцем, дуга заливается градиентом, значение в центре растёт с щелчками каждые 5%." tags={["slider", "arc", "circular", "dial"]}>
      <div ref={ref} onPointerDown={onDown} className="relative mx-auto h-44 w-52 cursor-grab touch-none select-none">
        <svg viewBox="0 0 200 170" className="h-full w-full overflow-visible">
          <defs><linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stopColor="#3d8bff" /><stop offset="1" stopColor="#2ee59d" /></linearGradient></defs>
          <path d={arc(-135, 135)} stroke="#081130" strokeWidth="14" fill="none" strokeLinecap="round" />
          {v > 0 && <path d={arc(-135, a)} stroke="url(#arcg)" strokeWidth="14" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #3d8bff88)" }} />}
          {[0, 25, 50, 75, 100].map((t) => { const ta = -135 + (t / 100) * 270; return <text key={t} x={cx + Math.cos(rad(ta)) * (R + 22)} y={cy + Math.sin(rad(ta)) * (R + 22)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="800" fill={t <= v ? "#5ce1ff" : "#5a70ad"}>${10 + (t / 100) * 990}</text>; })}
          <circle cx={px} cy={py} r="14" fill="#fff" stroke="#3d8bff" strokeWidth="4" style={{ filter: "drop-shadow(0 4px 0 #8fa0cf)" }} />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[62px] text-center"><div className="font-mono text-3xl font-extrabold text-white">${monthly}</div><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">per month</div></div>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-2xl bg-ink-900/60 p-3"><div><div className="text-[10px] font-extrabold uppercase text-ink-400">In 5 years (8% APY)</div><div className="font-mono text-lg font-extrabold text-bull">${Math.round(monthly * 12 * 5 * 1.22).toLocaleString()}</div></div><Btn v="bull" size="sm">Start plan</Btn></div>
    </AssetCard>
  );
}

/* ═════════ SLD-11 · Stepped snap slider ═════════ */
const TFS = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
function SteppedSlider() {
  const [idx, setIdx] = useState(3);
  const [pos, api] = useSpring(idx, 260, 24);
  const track = useRef<HTMLDivElement>(null);
  const last = useRef(idx);
  const toP = (x: number) => { const r = track.current!.getBoundingClientRect(); return clamp(((x - r.left) / r.width) * (TFS.length - 1), 0, TFS.length - 1); };
  const onDown = useDrag({
    onStart: (x) => { api.set(toP(x)); },
    onMove: (d) => { const p = toP(d.x); api.set(p); const r = Math.round(p); if (r !== last.current) { last.current = r; sfx.play("tick"); haptic(3); } },
    onEnd: () => { const t = Math.round(api.get()); setIdx(t); api.release(); },
  });
  const pct = (pos / (TFS.length - 1)) * 100;
  return (
    <AssetCard id="SLD-11" title="Stepped Snap Slider" desc="Дискретный слайдер таймфреймов: тянешь свободно, бегунок магнитится к ближайшей засечке с пружиной, подписи растут рядом с бегунком." tags={["slider", "stepped", "snap", "magnetic"]}>
      <div className="mb-8 text-center"><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Timeframe</div><div key={idx} className="anim-pop font-mono text-4xl font-extrabold text-sky">{TFS[idx]}</div></div>
      <div ref={track} onPointerDown={onDown} className="relative mx-3 h-12 cursor-pointer touch-none">
        <div className="well absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" />
        <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-edge to-sky" style={{ width: `${pct}%` }} />
        {TFS.map((t, i) => {
          const d = Math.abs(i - pos);
          return (
            <div key={t} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(i / (TFS.length - 1)) * 100}%` }}>
              <span className={cn("block h-2 w-2 rounded-full", i <= pos ? "bg-white" : "bg-ink-500")} />
              <span className="absolute left-1/2 top-5 -translate-x-1/2 font-mono font-extrabold transition-colors" style={{ fontSize: 10 + Math.max(0, 1 - d) * 4, color: d < 0.5 ? "#fff" : "#5a70ad" }}>{t}</span>
            </div>
          );
        })}
        <div className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-sky shadow-[0_4px_0_#1e56c9,0_0_16px_#3d8bff88]" style={{ left: `${pct}%` }} />
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-12 · 2D joystick pad ═════════ */
function Joystick() {
  const [t, setT] = useState({ x: 0, y: 0 });
  const [sx, ax] = useSpring(0, 200, 16);
  const [sy, ay] = useSpring(0, 200, 16);
  const pad = useRef<HTMLDivElement>(null);
  const onDown = useDrag({
    onStart: (x, y) => { const r = pad.current!.getBoundingClientRect(); const nx = clamp(((x - r.left) / r.width) * 2 - 1, -1, 1), ny = clamp(((y - r.top) / r.height) * 2 - 1, -1, 1); ax.set(nx); ay.set(ny); setT({ x: nx, y: ny }); feel("tap", 4); },
    onMove: (d) => { const r = pad.current!.getBoundingClientRect(); const nx = clamp(((d.x - r.left) / r.width) * 2 - 1, -1, 1), ny = clamp(((d.y - r.top) / r.height) * 2 - 1, -1, 1); ax.set(nx); ay.set(ny); setT({ x: nx, y: ny }); },
    onEnd: () => { setT({ x: 0, y: 0 }); ax.release(); ay.release(); sfx.play("pop"); },
  });
  const risk = Math.round(((sx + 1) / 2) * 100), reward = Math.round(((1 - sy) / 2) * 100);
  const zone = risk > 60 && reward < 40 ? ["Gambler", "#ff4d6a"] : risk < 40 && reward > 60 ? ["Sniper", "#2ee59d"] : risk > 60 && reward > 60 ? ["Aggressive", "#ffc53d"] : risk < 40 && reward < 40 ? ["Conservative", "#3d8bff"] : ["Balanced", "#a174ff"];
  return (
    <AssetCard id="SLD-12" title="2D Joystick Pad · Risk / Reward" desc="Двумерный контрол: тяни ручку по площадке, ось X — риск, Y — ожидаемая прибыль. Отпустил — ручка пружинит в центр. Зона профиля меняет цвет." tags={["slider", "2d", "joystick", "spring"]}>
      <div className="flex items-center gap-4">
        <div ref={pad} onPointerDown={onDown} className="relative h-44 w-44 shrink-0 cursor-crosshair touch-none select-none overflow-hidden rounded-3xl bg-ink-950/70 shadow-[inset_0_4px_12px_#000a]">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #3d8bff22 0%, transparent 50%, #ff4d6a22 100%)" }} />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" /><div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <span className="absolute left-2 top-2 text-[8px] font-extrabold uppercase text-sky">Low risk · High reward</span><span className="absolute bottom-2 right-2 text-[8px] font-extrabold uppercase text-bear">High risk · Low reward</span>
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_5px_0_#8fa0cf,0_0_20px_#fff5]" style={{ transform: `translate(calc(-50% + ${sx * 66}px), calc(-50% + ${sy * 66}px))`, background: zone[1] }} />
        </div>
        <div className="flex-1">
          <Label>Profile</Label>
          <div key={zone[0]} className="anim-pop text-2xl font-extrabold" style={{ color: zone[1] }}>{zone[0]}</div>
          <div className="mt-3 space-y-2 text-xs font-bold">
            <div><div className="flex justify-between text-ink-300"><span>Risk</span><span className="font-mono text-white">{risk}%</span></div><div className="well mt-1 h-2 rounded-full"><div className="h-full rounded-full bg-bear" style={{ width: `${risk}%` }} /></div></div>
            <div><div className="flex justify-between text-ink-300"><span>Reward</span><span className="font-mono text-white">{reward}%</span></div><div className="well mt-1 h-2 rounded-full"><div className="h-full rounded-full bg-bull" style={{ width: `${reward}%` }} /></div></div>
          </div>
          <div className="mt-2 font-mono text-[10px] text-ink-500">raw {t.x.toFixed(2)}, {t.y.toFixed(2)}</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-13 · Chart scrubber ═════════ */
const SCRUB = genCandles(31, 120, 100, 1.1, 0.03);
function Scrubber() {
  const [n, setN] = useState(60);
  const track = useRef<HTMLDivElement>(null);
  const set = (x: number) => { const r = track.current!.getBoundingClientRect(); const nn = clamp(Math.round(20 + ((x - r.left) / r.width) * 100), 20, 120); setN((o) => { if (o !== nn) { if (nn % 5 === 0) sfx.play("tick"); } return nn; }); };
  const onDown = useDrag({ onStart: (x) => set(x), onMove: (d) => set(d.x) });
  const view = SCRUB.slice(Math.max(0, n - 50), n);
  const last = SCRUB[n - 1];
  const chg = ((last.c - SCRUB[0].c) / SCRUB[0].c) * 100;
  const mn = Math.min(...SCRUB.map((c) => c.l)), mx = Math.max(...SCRUB.map((c) => c.h));
  return (
    <AssetCard id="SLD-13" title="Chart Scrubber · Time Travel" desc="Скраббер как в видеоплеере: тяни плейхед по миниатюре всей истории — основной график перематывается бар за баром, цена и изменение обновляются." tags={["slider", "scrubber", "timeline", "chart"]}>
      <div className="mb-2 flex items-baseline justify-between"><span className="font-mono text-xl font-extrabold text-white">{last.c.toFixed(2)}</span><span className={cn("font-mono text-xs font-extrabold", chg >= 0 ? "text-bull" : "text-bear")}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}% · bar {n}</span></div>
      <CandleChart data={view} h={140} className="well w-full rounded-2xl" />
      <div ref={track} onPointerDown={onDown} className="relative mt-3 h-14 cursor-ew-resize touch-none overflow-hidden rounded-xl bg-ink-950/70">
        <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="h-full w-full"><path d={SCRUB.map((c, i) => `${i ? "L" : "M"}${i} ${38 - ((c.c - mn) / (mx - mn)) * 34}`).join(" ")} fill="none" stroke="#5a70ad" strokeWidth="1" /><path d={SCRUB.slice(0, n).map((c, i) => `${i ? "L" : "M"}${i} ${38 - ((c.c - mn) / (mx - mn)) * 34}`).join(" ")} fill="none" stroke="#5ce1ff" strokeWidth="1.5" /></svg>
        <div className="absolute inset-y-0 bg-sky/10" style={{ left: `${(Math.max(0, n - 50) / 120) * 100}%`, width: `${(Math.min(50, n) / 120) * 100}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_#fff]" style={{ left: `${(n / 120) * 100}%` }}><span className="absolute -left-2 top-1/2 h-5 w-4 -translate-y-1/2 rounded-md bg-white" /></div>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] font-bold text-ink-400"><span>Day 1</span><span>Day 60</span><span>Day 120</span></div>
    </AssetCard>
  );
}

/* ═════════ SLD-14 · Thermometer ═════════ */
function Thermometer() {
  const [v, setV] = useState(64);
  const tube = useRef<HTMLDivElement>(null);
  const set = (y: number) => { const r = tube.current!.getBoundingClientRect(); const nv = clamp(Math.round((1 - (y - r.top) / r.height) * 100), 0, 100); setV((o) => { if (Math.floor(o / 10) !== Math.floor(nv / 10)) feel("tick", 3); return nv; }); };
  const onDown = useDrag({ onStart: (_x, y) => set(y), onMove: (d) => set(d.y) });
  const col = v < 25 ? "#3d8bff" : v < 50 ? "#2ee59d" : v < 75 ? "#ffc53d" : "#ff4d6a";
  const label = v < 25 ? "Ice cold" : v < 50 ? "Cool" : v < 75 ? "Heating up" : "Overheated";
  return (
    <AssetCard id="SLD-14" title="Thermometer Slider · Market Heat" desc="Вертикальный термометр: тяни столбик, жидкость с волной поднимается, колба светится цветом температуры рынка, деления подсвечиваются." tags={["slider", "vertical", "thermometer", "liquid"]}>
      <div className="flex items-center justify-center gap-8">
        <div className="relative flex flex-col items-center">
          <div ref={tube} onPointerDown={onDown} className="relative h-44 w-10 cursor-ns-resize touch-none overflow-hidden rounded-t-full bg-ink-950/80 shadow-[inset_0_0_0_3px_#22376f]">
            <div className="absolute inset-x-1.5 bottom-0 rounded-t-full transition-[height] duration-200" style={{ height: `${v}%`, background: `linear-gradient(180deg, ${col}, ${col}aa)`, boxShadow: `0 0 20px ${col}` }}>
              <svg className="absolute -top-2 left-0 h-3 w-[200%]" viewBox="0 0 200 12" preserveAspectRatio="none" style={{ animation: "wave 2.2s linear infinite" }}><path d="M0 6 Q12 0 25 6 T50 6 T75 6 T100 6 T125 6 T150 6 T175 6 T200 6 V12 H0Z" fill={col} /></svg>
            </div>
            {[25, 50, 75].map((m) => <span key={m} className="absolute left-0 h-px w-3" style={{ bottom: `${m}%`, background: v >= m ? "#fff" : "#5a70ad" }} />)}
          </div>
          <div className="-mt-1 grid h-16 w-16 place-items-center rounded-full shadow-[inset_0_0_0_3px_#22376f]" style={{ background: `radial-gradient(circle at 35% 35%, ${col}, ${col}66)`, boxShadow: `0 0 30px ${col}88, inset 0 0 0 3px #22376f` }}><span className="font-mono text-base font-extrabold text-ink-900">{v}°</span></div>
        </div>
        <div>
          <Label>Market heat</Label>
          <div key={label} className="anim-pop text-2xl font-extrabold" style={{ color: col }}>{label}</div>
          <div className="mt-2 max-w-[160px] text-xs font-bold text-ink-300">{v < 50 ? "Спокойный рынок — время накапливать по плану." : v < 75 ? "Волатильность растёт — уменьши размер позиций." : "Эйфория. Фиксируй прибыль, не открывай новые лонги."}</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-15 · Logarithmic slider ═════════ */
function LogSlider() {
  const [t, setT] = useState(0.55);
  const track = useRef<HTMLDivElement>(null);
  const set = (x: number) => { const r = track.current!.getBoundingClientRect(); setT(clamp((x - r.left) / r.width, 0, 1)); sfx.play("tick"); };
  const onDown = useDrag({ onStart: (x) => set(x), onMove: (d) => set(d.x) });
  const val = Math.pow(10, 6 + t * 6);
  const fmt = (v: number) => (v >= 1e12 ? `$${(v / 1e12).toFixed(2)}T` : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`);
  const tier = val < 1e8 ? ["Micro cap", "#ff4d6a", "Высокий риск, ×100 или ноль"] : val < 1e9 ? ["Small cap", "#ff8a3d", "Волатильно, но ликвидно"] : val < 1e10 ? ["Mid cap", "#ffc53d", "Баланс роста и риска"] : val < 1e11 ? ["Large cap", "#2ee59d", "Топ-20, институционалы"] : ["Mega cap", "#3d8bff", "BTC / ETH — «голубые фишки»"];
  return (
    <AssetCard id="SLD-15" title="Logarithmic Slider · Market Cap" desc="Логарифмическая шкала от $1M до $1T: каждая декада — равный отрезок. Категория капитализации и уровень риска меняются по зонам." tags={["slider", "logarithmic", "scale", "market-cap"]}>
      <div className="text-center"><div className="font-mono text-4xl font-extrabold text-white">{fmt(val)}</div><div key={tier[0]} className="anim-pop text-sm font-extrabold" style={{ color: tier[1] }}>{tier[0]}</div></div>
      <div ref={track} onPointerDown={onDown} className="relative mt-4 h-12 cursor-pointer touch-none">
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(90deg,#ff4d6a,#ff8a3d 33%,#ffc53d 50%,#2ee59d 75%,#3d8bff)" }} />
        {[6, 7, 8, 9, 10, 11, 12].map((e) => <div key={e} className="absolute top-1/2 flex -translate-x-1/2 flex-col items-center" style={{ left: `${((e - 6) / 6) * 100}%` }}><span className="mt-3 h-2 w-px bg-white/40" /><span className="mt-0.5 font-mono text-[9px] font-bold text-ink-400">10<sup>{e}</sup></span></div>)}
        <div className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_4px_0_#8fa0cf]" style={{ left: `${t * 100}%`, background: tier[1] }} />
      </div>
      <div className="mt-4 rounded-xl bg-ink-900/60 p-3 text-xs font-bold text-ink-200">{tier[2]}</div>
    </AssetCard>
  );
}

/* ═════════ SLD-16 · Time-range brush ═════════ */
const BRUSH = genCandles(64, 90, 100, 1.4, 0.06);
function Brush() {
  const [win, setWin] = useState({ a: 30, b: 60 });
  const box = useRef<HTMLDivElement>(null);
  const base = useRef(win);
  const toI = (x: number) => { const r = box.current!.getBoundingClientRect(); return clamp(Math.round(((x - r.left) / r.width) * 90), 0, 90); };
  const mk = (which: "a" | "b" | "mid") => ({
    onStart: () => { base.current = win; feel("tap", 3); },
    onMove: (d: { x: number; dx: number }) => {
      const r = box.current!.getBoundingClientRect();
      const di = Math.round((d.dx / r.width) * 90);
      if (which === "a") setWin((w) => ({ ...w, a: clamp(toI(d.x), 0, w.b - 5) }));
      else if (which === "b") setWin((w) => ({ ...w, b: clamp(toI(d.x), w.a + 5, 90) }));
      else { const len = base.current.b - base.current.a; const a = clamp(base.current.a + di, 0, 90 - len); setWin({ a, b: a + len }); }
    },
  });
  const dA = useDrag(mk("a")), dB = useDrag(mk("b")), dM = useDrag(mk("mid"));
  const mn = Math.min(...BRUSH.map((c) => c.l)), mx = Math.max(...BRUSH.map((c) => c.h));
  const sel = BRUSH.slice(win.a, win.b);
  const ret = ((sel[sel.length - 1].c - sel[0].o) / sel[0].o) * 100;
  const hi = Math.max(...sel.map((c) => c.h)), lo = Math.min(...sel.map((c) => c.l));
  return (
    <AssetCard id="SLD-16" title="Time-Range Brush" desc="Кисть выделения диапазона на мини-графике: тяни края, чтобы менять ширину, или середину, чтобы двигать окно. Статистика по окну пересчитывается." tags={["slider", "brush", "range", "chart"]}>
      <CandleChart data={sel} h={120} className="well w-full rounded-2xl" />
      <div ref={box} className="relative mt-3 h-16 overflow-hidden rounded-xl bg-ink-950/70">
        <svg viewBox="0 0 90 40" preserveAspectRatio="none" className="h-full w-full"><path d={BRUSH.map((c, i) => `${i ? "L" : "M"}${i} ${38 - ((c.c - mn) / (mx - mn)) * 34}`).join(" ") + " L90 40 L0 40Z"} fill="#3d8bff33" /><path d={BRUSH.map((c, i) => `${i ? "L" : "M"}${i} ${38 - ((c.c - mn) / (mx - mn)) * 34}`).join(" ")} fill="none" stroke="#5ce1ff" strokeWidth="1" /></svg>
        <div className="absolute inset-y-0 left-0 bg-ink-950/70" style={{ width: `${(win.a / 90) * 100}%` }} /><div className="absolute inset-y-0 right-0 bg-ink-950/70" style={{ width: `${((90 - win.b) / 90) * 100}%` }} />
        <div onPointerDown={dM} className="absolute inset-y-0 cursor-grab touch-none border-y-2 border-sky bg-sky/10" style={{ left: `${(win.a / 90) * 100}%`, width: `${((win.b - win.a) / 90) * 100}%` }} />
        {[{ v: win.a, fn: dA }, { v: win.b, fn: dB }].map((h, k) => <div key={k} onPointerDown={h.fn} className="absolute inset-y-0 w-4 -translate-x-1/2 cursor-ew-resize touch-none" style={{ left: `${(h.v / 90) * 100}%` }}><div className="mx-auto h-full w-1.5 rounded-full bg-sky shadow-[0_0_8px_#3d8bff]" /><div className="absolute left-1/2 top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-1/2 rounded bg-white" /></div>)}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["Bars", `${win.b - win.a}`, "#fff"], ["Return", `${ret >= 0 ? "+" : ""}${ret.toFixed(1)}%`, ret >= 0 ? "#2ee59d" : "#ff4d6a"], ["Range", `${lo.toFixed(0)}–${hi.toFixed(0)}`, "#ffc53d"]].map(([l, v, c]) => <div key={l} className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">{l}</div><div className="font-mono text-xs font-extrabold" style={{ color: c }}>{v}</div></div>)}
      </div>
    </AssetCard>
  );
}

/* ═════════ SLD-17 · Star rating drag ═════════ */
function StarRating() {
  const game = useGame();
  const [v, setV] = useState(0);
  const [locked, setLocked] = useState(false);
  const [b, bump] = useBump();
  const row = useRef<HTMLDivElement>(null);
  const set = (x: number) => { const r = row.current!.getBoundingClientRect(); const nv = clamp(Math.round(((x - r.left) / r.width) * 10) / 2, 0, 5); setV((o) => { if (o !== nv) sfx.play("tick"); return nv; }); };
  const onDown = useDrag({ onStart: (x) => { if (locked) return false; set(x); }, onMove: (d) => set(d.x) });
  const labels = ["", "Плохо", "Так себе", "Норм", "Хорошо", "Огонь!"];
  return (
    <AssetCard id="SLD-17" title="Star Rating · Drag" desc="Оценка урока перетаскиванием с точностью до половины звезды: звёзды заливаются по горизонтали, подпись меняется, отправка даёт награду." tags={["slider", "rating", "stars", "feedback"]}>
      <div className="text-center"><div className="text-sm font-extrabold text-white">Как тебе урок «Position Sizing»?</div><div key={Math.ceil(v)} className="anim-pop mt-1 h-6 text-xs font-extrabold text-gold">{labels[Math.ceil(v)]}</div></div>
      <div ref={row} onPointerDown={onDown} className="relative mx-auto mt-2 flex w-max cursor-pointer touch-none gap-2 py-2">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = clamp(v - i, 0, 1);
          return (
            <div key={i} className="relative h-12 w-12 transition-transform" style={{ transform: `scale(${fill > 0 ? 1.1 : 1})` }}>
              <Icon name="star" size={48} variant="line" className="absolute inset-0 text-ink-600" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}><Icon name="star" size={48} variant="solid" className="text-gold drop-shadow-[0_0_10px_#ffc53d]" /></div>
            </div>
          );
        })}
        <Icon key={b} name="star" size={1} className="absolute" />
      </div>
      <div className="mt-2 text-center font-mono text-lg font-extrabold text-white">{v.toFixed(1)} / 5</div>
      <Btn v="gold" size="sm" block className="mt-3" disabled={v === 0 || locked} onClick={(e) => { setLocked(true); bump(); game.reward({ xp: 5, gems: 10, x: e.clientX, y: e.clientY }); feel("success"); }}>{locked ? "Спасибо! +5 XP +10 💎" : "Submit rating"}</Btn>
      {locked && <button onClick={() => { setLocked(false); setV(0); }} className="mt-2 w-full text-center text-[10px] font-extrabold uppercase text-ink-500">reset</button>}
    </AssetCard>
  );
}

/* ═════════ SLD-18 · Rubber band slider ═════════ */
function RubberSlider() {
  const [v, setV] = useState(50);
  const [over, setOver] = useState(0);
  const [ov, ovApi] = useSpring(0, 300, 18);
  const track = useRef<HTMLDivElement>(null);
  const onDown = useDrag({
    onStart: () => { ovApi.set(0); },
    onMove: (d) => {
      const r = track.current!.getBoundingClientRect();
      const raw = ((d.x - r.left) / r.width) * 100;
      setV(clamp(Math.round(raw), 0, 100));
      const o = raw < 0 ? raw : raw > 100 ? raw - 100 : 0;
      setOver(o); ovApi.set(Math.sign(o) * Math.sqrt(Math.abs(o)) * 6);
      if (Math.abs(o) > 5) haptic(2);
    },
    onEnd: () => { setOver(0); ovApi.release(); if (Math.abs(ov) > 4) feel("pop", 10); },
  });
  const stretch = 1 + Math.abs(ov) / 300;
  return (
    <AssetCard id="SLD-18" title="Rubber Band Slider" desc="Слайдер с «резинкой»: тяни за пределы дорожки — вся дорожка растягивается и бегунок вылезает за край, отпустил — пружинит обратно." tags={["slider", "rubber-band", "overscroll", "spring"]}>
      <div className="mb-6 text-center"><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Take profit at</div><div className="font-mono text-4xl font-extrabold text-bull">+{v}%</div></div>
      <div className="px-6">
        <div ref={track} onPointerDown={onDown} className="relative h-10 cursor-pointer touch-none" style={{ transform: `scaleX(${stretch}) translateX(${ov * 0.4}px)`, transformOrigin: ov > 0 ? "left" : "right", transition: over === 0 ? "transform .05s" : "none" }}>
          <div className="well absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" />
          <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-bull-edge to-bull" style={{ width: `${v}%` }} />
          <div className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-bull shadow-[0_4px_0_#12a46a]" style={{ left: `calc(${v}% + ${ov}px)` }} />
        </div>
      </div>
      <div className="mt-4 text-center text-[11px] font-bold text-ink-400">{Math.abs(over) > 5 ? `overscroll ${over.toFixed(0)}` : "Потяни за край дорожки"}</div>
    </AssetCard>
  );
}

/* ═════════ SLD-19 · Multi-thumb allocation ═════════ */
const SEGS = [{ t: "BTC", c: "#f7931a" }, { t: "ETH", c: "#8c8cff" }, { t: "Stable", c: "#26a17b" }];
function MultiThumb() {
  const [a, setA] = useState(45);
  const [b, setB] = useState(75);
  const track = useRef<HTMLDivElement>(null);
  const toV = (x: number) => { const r = track.current!.getBoundingClientRect(); return clamp(Math.round(((x - r.left) / r.width) * 100), 0, 100); };
  const dA = useDrag({ onMove: (d) => setA(clamp(toV(d.x), 5, b - 5)) });
  const dB = useDrag({ onMove: (d) => setB(clamp(toV(d.x), a + 5, 95)) });
  const parts = [a, b - a, 100 - b];
  const risk = Math.round(parts[0] * 0.7 + parts[1] * 0.9 + parts[2] * 0.05);
  return (
    <AssetCard id="SLD-19" title="Multi-Thumb Allocation" desc="Два бегунка на одной дорожке делят её на три сегмента портфеля; бегунки не могут пересечься (мин. 5%), сегменты подписаны и анимируются." tags={["slider", "multi-thumb", "allocation", "portfolio"]}>
      <div ref={track} className="relative mt-6 h-12">
        <div className="absolute inset-x-0 top-1/2 flex h-5 -translate-y-1/2 overflow-hidden rounded-full">
          {parts.map((p, i) => <div key={i} className="relative h-full transition-[width] duration-100" style={{ width: `${p}%`, background: SEGS[i].c }}><span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold text-ink-900">{p >= 12 ? `${SEGS[i].t} ${p}%` : ""}</span></div>)}
        </div>
        {[{ v: a, fn: dA }, { v: b, fn: dB }].map((h, k) => <div key={k} onPointerDown={h.fn} className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none rounded-full border-4 border-white bg-ink-700 shadow-[0_4px_0_#0b1638,0_0_0_4px_#0a1330] transition-transform hover:scale-110" style={{ left: `${h.v}%` }}><Icon name="swap" size={14} stroke={3} className="mx-auto mt-1.5 text-white" /></div>)}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {SEGS.map((s, i) => <div key={s.t} className="raised rounded-xl p-2"><div className="flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase text-ink-400"><span className="h-2 w-2 rounded-full" style={{ background: s.c }} />{s.t}</div><div className="font-mono text-base font-extrabold text-white">${(parts[i] * 100).toLocaleString()}</div></div>)}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-bold"><span className="text-ink-300">Portfolio risk</span><span className="font-mono font-extrabold" style={{ color: risk < 40 ? "#2ee59d" : risk < 65 ? "#ffc53d" : "#ff4d6a" }}>{risk}/100 · {mapRange(risk, 0, 100, 2, 14).toFixed(0)}% max drawdown est.</span></div>
    </AssetCard>
  );
}

export default function Sliders2() {
  return (
    <Section id="sliders2" num="15" title="Sliders II" subtitle="Дуга, дискретный снап, 2D-джойстик, скраббер графика, термометр, логарифм, кисть диапазона, звёзды, резинка, мульти-бегунок">
      <ArcSlider />
      <SteppedSlider />
      <Joystick />
      <Scrubber />
      <Thermometer />
      <LogSlider />
      <Brush />
      <StarRating />
      <RubberSlider />
      <MultiThumb />
    </Section>
  );
}
