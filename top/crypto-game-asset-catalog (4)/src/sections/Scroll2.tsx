import { useEffect, useRef, useState } from "react";
import { Btn, Icon, Label, Section } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, lerp, mapRange, useElementScroll, useInView } from "../ui/hooks";
import { feel } from "../game/sfx";
import { cn } from "../utils/cn";

function Tag({ id, children }: { id: string; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="rounded-md bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky shadow-[inset_0_0_0_1px_rgba(61,139,255,.3)]">{id}</span>
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">{children}</span>
    </div>
  );
}

/* ═════════ SCR-09 · Stacking cards ═════════ */

const STACK = [
  { t: "1 · Учись", d: "5 минут в день. Свечи, тренды, риск — маленькими порциями.", c: ["#2ee59d", "#0b7a4d"], i: "book" },
  { t: "2 · Тренируйся", d: "Симулятор без риска: $10,000 демо и реальные котировки.", c: ["#3d8bff", "#1a3aa0"], i: "candle" },
  { t: "3 · Соревнуйся", d: "Лиги, стрики и турниры с друзьями каждую неделю.", c: ["#ffc53d", "#a86d00"], i: "trophy" },
  { t: "4 · Торгуй", d: "Переноси навыки на реальный рынок с холодной головой.", c: ["#a174ff", "#4a24a8"], i: "rocket" },
];
function StackingCards() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  return (
    <div>
      <Tag id="SCR-09">Stacking cards · sticky + scale</Tag>
      <div ref={ref} className="relative" style={{ height: "260vh" }}>
        <div className="sticky top-24 h-[70vh] min-h-[420px]">
          {STACK.map((s, i) => {
            const local = clamp(p * STACK.length - i, 0, 1);
            const next = clamp(p * STACK.length - i - 1, 0, 1);
            return (
              <div key={s.t} className="absolute inset-x-0 mx-auto max-w-2xl overflow-hidden rounded-[32px] p-8" style={{
                top: i * 18, height: "calc(100% - 60px)", transform: `translateY(${(1 - local) * 120}vh) scale(${1 - next * 0.08})`, opacity: local, filter: `brightness(${1 - next * 0.35})`,
                background: `linear-gradient(160deg, ${s.c[0]}, ${s.c[1]})`, boxShadow: "0 8px 0 rgba(0,0,0,.35), 0 30px 60px -20px #000", zIndex: i,
              }}>
                <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
                <Icon name={s.i} size={120} variant="duo" className="absolute -bottom-6 right-4 text-white/20" />
                <div className="text-[11px] font-extrabold uppercase tracking-[.3em] text-white/70">Step</div>
                <div className="mt-2 text-4xl font-extrabold text-white text-3d sm:text-5xl">{s.t}</div>
                <div className="mt-4 max-w-md text-base font-bold text-white/85">{s.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-10 · Word-by-word highlight ═════════ */
const TEXT = "Трейдинг — это не про предсказание будущего. Это про управление риском, когда ты ошибаешься, и про дисциплину, когда ты прав. Маленький риск, большая серия, холодная голова.";
function WordReveal() {
  const [ref, p] = useElementScroll<HTMLDivElement>("center");
  const words = TEXT.split(" ");
  const t = mapRange(p, 0.15, 0.85, 0, 1);
  return (
    <div ref={ref}>
      <Tag id="SCR-10">Word-by-word highlight</Tag>
      <div className="panel rounded-[32px] p-8 sm:p-12">
        <p className="text-2xl font-extrabold leading-snug sm:text-4xl">
          {words.map((w, i) => {
            const k = clamp(t * words.length - i, 0, 1);
            const key = ["риском", "дисциплину", "холодная"].some((x) => w.includes(x));
            return <span key={i} className="mr-[.28em] inline-block transition-colors duration-200" style={{ color: k > 0.5 ? (key ? "#2ee59d" : "#fff") : "#2f4789", transform: `translateY(${(1 - k) * 6}px)`, textShadow: k > 0.5 && key ? "0 0 18px #2ee59d66" : "none" }}>{w}</span>;
          })}
        </p>
        <div className="mt-6 flex items-center gap-3"><Mascot mood="cool" size={44} /><span className="text-xs font-bold text-ink-400">— Pip, глава 1</span></div>
      </div>
    </div>
  );
}

/* ═════════ SCR-11 · Zoom-out phone reveal ═════════ */
function ZoomOut() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  const s = mapRange(p, 0, 0.7, 2.6, 1);
  const rot = mapRange(p, 0, 0.7, -6, 0);
  const screens = [["home", "#2ee59d"], ["chart", "#3d8bff"], ["trophy", "#ffc53d"], ["user", "#a174ff"]];
  return (
    <div>
      <Tag id="SCR-11">Zoom-out reveal · scale by scroll</Tag>
      <div ref={ref} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-24 flex h-[70vh] min-h-[460px] items-center justify-center overflow-hidden rounded-[32px] bg-ink-950">
          <div className="absolute inset-0 grid-dots opacity-40" />
          <div className="relative flex gap-6" style={{ transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: "center" }}>
            {screens.map(([i, c], k) => (
              <div key={i} className="relative h-[300px] w-[150px] overflow-hidden rounded-[28px] bg-ink-900 shadow-[0_6px_0_#050b1f,0_30px_60px_-20px_#000]" style={{ transform: `translateY(${k === 1 ? 0 : (1 - clamp(mapRange(p, 0.3, 0.7, 0, 1), 0, 1)) * (k % 2 ? 40 : -40) + (k === 0 || k === 3 ? 20 : 0)}px)`, opacity: k === 1 ? 1 : clamp(mapRange(p, 0.25, 0.6, 0, 1), 0, 1) }}>
                <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-ink-700" />
                <div className="absolute left-1/2 top-16 -translate-x-1/2"><span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: `${c}22`, boxShadow: `inset 0 0 0 2px ${c}` }}><Icon name={i} size={28} variant="duo" style={{ color: c }} /></span></div>
                {[0, 1, 2].map((r) => <div key={r} className="absolute inset-x-3 h-8 rounded-xl bg-ink-800" style={{ top: 150 + r * 42 }} />)}
                <div className="absolute inset-x-0 bottom-0 flex h-12 justify-around border-t border-white/5 bg-ink-850 px-2 pt-2">{screens.map(([ii, cc]) => <Icon key={ii} name={ii} size={16} style={{ color: ii === i ? cc : "#5a70ad" }} />)}</div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center" style={{ opacity: clamp(mapRange(p, 0.6, 0.85, 0, 1), 0, 1) }}><div className="text-2xl font-extrabold text-white">Четыре экрана. Одна привычка.</div><div className="text-xs text-ink-400">Учись · Торгуй · Соревнуйся · Расти</div></div>
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-12 · 3D rotate card by scroll ═════════ */
function RotateCard() {
  const [ref, p] = useElementScroll<HTMLDivElement>("through");
  const rot = mapRange(p, 0.1, 0.9, 0, 360);
  const back = ((rot % 360) + 360) % 360 > 90 && ((rot % 360) + 360) % 360 < 270;
  return (
    <div ref={ref}>
      <Tag id="SCR-12">3D rotate by scroll · front / back</Tag>
      <div className="panel flex flex-col items-center gap-6 rounded-[32px] p-8 sm:flex-row sm:justify-around">
        <div style={{ perspective: 1000 }}>
          <div className="relative h-56 w-80 preserve-3d" style={{ transform: `rotateY(${rot}deg)` }}>
            <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#1d4fbf] to-ink-900 p-5 backface-hidden" style={{ boxShadow: "0 8px 0 #050b1f, 0 30px 50px -15px #000" }}>
              <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.3em] text-white/70">Pipwise · Trader Card</span><Icon name="candle" size={22} className="text-bull" /></div>
              <div className="font-mono text-2xl font-extrabold tracking-widest text-white">•••• •••• •••• 4242</div>
              <div className="flex items-end justify-between"><div><div className="text-[9px] uppercase text-white/60">Holder</div><div className="text-sm font-extrabold text-white">PIP THE BULL</div></div><div className="text-right"><div className="text-[9px] uppercase text-white/60">Level</div><div className="font-mono text-lg font-extrabold text-gold">12</div></div></div>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-ink-700 to-ink-900 p-5 backface-hidden" style={{ transform: "rotateY(180deg)", boxShadow: "0 8px 0 #050b1f" }}>
              <div className="-mx-5 mt-4 h-10 bg-black/60" />
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white/90 px-3 py-2"><span className="font-mono text-xs text-ink-900">CVV</span><span className="font-mono text-sm font-extrabold text-ink-900">•••</span></div>
              <div className="mt-4 text-[10px] font-bold text-ink-400">Win rate 62% · 341 trades · Diamond league</div>
              <Mascot mood="cool" size={60} className="absolute bottom-3 right-4" />
            </div>
          </div>
        </div>
        <div className="max-w-xs"><div className="text-xl font-extrabold text-white">Карта трейдера</div><div className="text-sm text-ink-300">Скролл вращает карту на 360°. Сейчас видна <span className="font-extrabold text-sky">{back ? "обратная" : "лицевая"}</span> сторона ({Math.round(rot)}°).</div></div>
      </div>
    </div>
  );
}

/* ═════════ SCR-13 · Contained snap sections + dot nav ═════════ */
const SNAP = [{ t: "Market", c: "#2ee59d", i: "chart" }, { t: "Learn", c: "#3d8bff", i: "book" }, { t: "Compete", c: "#ffc53d", i: "trophy" }, { t: "Earn", c: "#a174ff", i: "gem" }];
function SnapSections() {
  const ref = useRef<HTMLDivElement>(null);
  const [a, setA] = useState(0);
  const onScroll = () => { const el = ref.current; if (!el) return; const i = Math.round(el.scrollTop / el.clientHeight); if (i !== a) { setA(i); feel("tick", 3); } };
  const go = (i: number) => ref.current?.scrollTo({ top: i * (ref.current?.clientHeight ?? 0), behavior: "smooth" });
  return (
    <div>
      <Tag id="SCR-13">Contained snap sections · dot nav · wheel</Tag>
      <div className="relative">
        <div ref={ref} onScroll={onScroll} className="no-scrollbar snap-y-strict h-[420px] overflow-y-auto rounded-[32px]">
          {SNAP.map((s, i) => (
            <div key={s.t} className="relative flex h-[420px] snap-start items-center justify-center overflow-hidden" style={{ background: `radial-gradient(circle at 50% 50%, ${s.c}33, #0d1839 70%)` }}>
              <div className={cn("text-center transition-all duration-700", a === i ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
                <span className="mx-auto grid h-24 w-24 place-items-center rounded-[30px]" style={{ background: `linear-gradient(160deg, ${s.c}, ${s.c}66)`, boxShadow: `0 6px 0 rgba(0,0,0,.35), 0 0 60px ${s.c}55` }}><Icon name={s.i} size={48} variant="duo" className="text-white" /></span>
                <div className="mt-6 text-5xl font-extrabold text-white text-3d">{s.t}</div>
                <div className="mt-2 font-mono text-xs text-ink-300">section {i + 1} / {SNAP.length}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-3">
          {SNAP.map((s, i) => <button key={s.t} onClick={() => go(i)} className="group relative flex items-center justify-end gap-2"><span className={cn("text-[10px] font-extrabold uppercase opacity-0 transition-opacity group-hover:opacity-100", a === i && "opacity-100")} style={{ color: s.c }}>{s.t}</span><span className="block rounded-full transition-all" style={{ width: a === i ? 12 : 8, height: a === i ? 12 : 8, background: a === i ? s.c : "#2f4789", boxShadow: a === i ? `0 0 12px ${s.c}` : undefined }} /></button>)}
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-14 · Mascot walks the path ═════════ */
const WALK = "M40 40 C 200 40, 200 140, 360 140 S 520 240, 680 240 S 840 340, 960 340";
function MascotPath() {
  const [ref, p] = useElementScroll<HTMLDivElement>("through");
  const path = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1200);
  useEffect(() => { if (path.current) setLen(path.current.getTotalLength()); }, []);
  const t = clamp(mapRange(p, 0.15, 0.85, 0, 1), 0, 1);
  const pt = path.current ? path.current.getPointAtLength(len * t) : { x: 40, y: 40 };
  const ahead = path.current ? path.current.getPointAtLength(Math.min(len, len * t + 6)) : pt;
  const flip = ahead.x < pt.x;
  const nodes = [0.12, 0.35, 0.6, 0.85];
  return (
    <div ref={ref}>
      <Tag id="SCR-14">Mascot walks the path · getPointAtLength</Tag>
      <div className="panel overflow-hidden rounded-[32px] p-4">
        <svg viewBox="0 0 1000 380" className="w-full">
          <path d={WALK} fill="none" stroke="#22376f" strokeWidth="18" strokeLinecap="round" />
          <path ref={path} d={WALK} fill="none" stroke="#2ee59d" strokeWidth="18" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} style={{ filter: "drop-shadow(0 0 10px #2ee59d66)" }} />
          {nodes.map((n, i) => { const q = path.current ? path.current.getPointAtLength(len * n) : { x: 0, y: 0 }; const done = t >= n; return <g key={i}><circle cx={q.x} cy={q.y} r="22" fill={done ? "#ffc53d" : "#16264f"} stroke="#0a1330" strokeWidth="4" style={{ transition: "fill .3s" }} /><text x={q.x} y={q.y + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill={done ? "#0a1330" : "#5a70ad"}>{done ? "★" : i + 1}</text></g>; })}
          <g transform={`translate(${pt.x}, ${pt.y - 60}) scale(${flip ? -1 : 1}, 1)`}>
            <foreignObject x="-45" y="-45" width="90" height="100"><div style={{ animation: "bob 1s ease-in-out infinite", transformOrigin: "50% 100%" }}><Mascot mood={t >= 0.85 ? "happy" : "idle"} size={90} /></div></foreignObject>
          </g>
        </svg>
        <div className="mt-2 flex items-center justify-between px-2"><Label className="mb-0">Unit progress</Label><span className="font-mono text-xs font-extrabold text-bull">{Math.round(t * 100)}%</span></div>
      </div>
    </div>
  );
}

/* ═════════ SCR-15 · Canvas frame sequence ═════════ */
function CanvasSequence() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const t = p;
    /* sky */
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, `hsl(${225 + t * 40} 70% ${8 + t * 6}%)`); grd.addColorStop(1, "#0d1839");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    /* stars */
    for (let i = 0; i < 80; i++) { const x = (i * 97) % W, y = ((i * 53) % H) - t * 200 * ((i % 3) + 1); g.globalAlpha = 0.3 + ((i * 7) % 10) / 14; g.fillStyle = "#fff"; g.fillRect(x, ((y % H) + H) % H, (i % 3) + 1, (i % 3) + 1); }
    g.globalAlpha = 1;
    /* candles growing */
    const n = Math.floor(6 + t * 34);
    const cw = W / 44;
    let price = H * 0.7;
    for (let i = 0; i < n; i++) {
      const up = Math.sin(i * 1.3) + Math.cos(i * 0.4) > -0.3;
      const h = 8 + ((i * 37) % 30);
      const o = price, cl = up ? o - h : o + h * 0.6;
      g.fillStyle = up ? "#2ee59d" : "#ff4d6a";
      g.fillRect(i * cw + cw * 0.15 + 20, Math.min(o, cl), cw * 0.7, Math.abs(o - cl) + 2);
      g.fillRect(i * cw + cw * 0.5 + 19, Math.min(o, cl) - 6, 2, Math.abs(o - cl) + 12);
      price = cl;
    }
    /* rocket */
    const rx = W * 0.15 + t * W * 0.7, ry = H * 0.8 - t * H * 0.7;
    g.save(); g.translate(rx, ry); g.rotate(-Math.PI / 4 + Math.sin(t * 10) * 0.05);
    for (let k = 0; k < 6; k++) { g.globalAlpha = 0.35 - k * 0.05; g.fillStyle = k % 2 ? "#ffc53d" : "#ff8a3d"; g.beginPath(); g.ellipse(-18 - k * 10, 0, 10 - k, 6 - k * 0.5, 0, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = "#e6ebf8"; g.beginPath(); g.moveTo(24, 0); g.lineTo(-10, -12); g.lineTo(-10, 12); g.closePath(); g.fill();
    g.fillStyle = "#3d8bff"; g.beginPath(); g.arc(6, 0, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ff4d6a"; g.beginPath(); g.moveTo(-10, -12); g.lineTo(-20, -18); g.lineTo(-12, -2); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-10, 12); g.lineTo(-20, 18); g.lineTo(-12, 2); g.closePath(); g.fill();
    g.restore();
    /* moon */
    g.fillStyle = "#ffd76a"; g.globalAlpha = clamp(mapRange(t, 0.6, 1, 0.2, 1), 0, 1); g.beginPath(); g.arc(W * 0.88, H * 0.14, 28 + t * 10, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  }, [p]);
  return (
    <div>
      <Tag id="SCR-15">Canvas frame sequence · procedural</Tag>
      <div ref={ref} className="relative" style={{ height: "220vh" }}>
        <div className="sticky top-24 h-[65vh] min-h-[400px] overflow-hidden rounded-[32px]">
          <canvas ref={cv} className="h-full w-full" />
          <div className="absolute left-6 top-6"><div className="text-[10px] font-extrabold uppercase tracking-[.3em] text-gold">Frame {Math.round(p * 120)} / 120</div><div className="text-3xl font-extrabold text-white text-3d">Портфель растёт,<br />пока ты учишься</div></div>
          <div className="absolute bottom-6 left-6 right-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-bull to-gold" style={{ width: `${p * 100}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-16 · Vertical timeline nodes ═════════ */
const ROAD = [
  { t: "Week 1", d: "Основы: кошельки, биржи, первые свечи", i: "wallet", c: "#2ee59d" }, { t: "Week 2", d: "Паттерны и уровни на реальных графиках", i: "candle", c: "#3d8bff" },
  { t: "Week 3", d: "Риск-менеджмент и размер позиции", i: "shield", c: "#ffc53d" }, { t: "Week 4", d: "Психология: журнал, FOMO, дисциплина", i: "heart", c: "#ff4d6a" }, { t: "Week 5", d: "Первые сделки в симуляторе и лига", i: "trophy", c: "#a174ff" },
];
function RoadTimeline() {
  const [ref, p] = useElementScroll<HTMLDivElement>("center");
  const t = clamp(mapRange(p, 0.1, 0.9, 0, 1), 0, 1);
  return (
    <div ref={ref}>
      <Tag id="SCR-16">Vertical timeline · progress line + nodes</Tag>
      <div className="panel rounded-[32px] p-6 sm:p-10">
        <div className="relative pl-14">
          <div className="absolute left-5 top-2 bottom-2 w-1.5 rounded-full bg-ink-800" />
          <div className="absolute left-5 top-2 w-1.5 rounded-full bg-gradient-to-b from-bull via-gold to-violet" style={{ height: `calc((100% - 16px) * ${t})`, boxShadow: "0 0 12px #2ee59d66" }} />
          {ROAD.map((r, i) => {
            const on = t >= (i + 0.5) / ROAD.length;
            return (
              <div key={r.t} className="relative mb-8 last:mb-0">
                <span className={cn("absolute -left-14 top-0 grid h-11 w-11 place-items-center rounded-full border-4 border-ink-900 transition-all duration-500", on ? "scale-110" : "bg-ink-700")} style={on ? { background: r.c, boxShadow: `0 0 20px ${r.c}88` } : undefined}><Icon name={on ? "check" : r.i} size={18} stroke={on ? 3.4 : 2.2} className={on ? "text-ink-900" : "text-ink-400"} /></span>
                <div className={cn("raised rounded-2xl p-4 transition-all duration-500", on ? "translate-x-0 opacity-100" : "translate-x-6 opacity-40")}>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: r.c }}>{r.t}</div>
                  <div className="text-base font-extrabold text-white">{r.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-17 · Collapsing header ═════════ */
function CollapsingHeader() {
  const [st, setSt] = useState(0);
  const k = clamp(st / 120, 0, 1);
  const H = lerp(170, 64, k);
  return (
    <div>
      <Tag id="SCR-17">Collapsing header · inner scroll</Tag>
      <div className="panel mx-auto max-w-md overflow-hidden rounded-[32px] p-0">
        <div className="relative overflow-hidden" style={{ height: H, background: `linear-gradient(160deg, #1d4fbf, #0a1330)` }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" style={{ transform: `scale(${1 + k})` }} />
          <div className="absolute left-5 flex items-center gap-3" style={{ top: lerp(24, 12, k) }}>
            <div className="grid place-items-center rounded-2xl bg-gradient-to-b from-[#ffb547] to-[#f7931a] font-extrabold text-white shadow-[0_3px_0_#b36200]" style={{ width: lerp(64, 40, k), height: lerp(64, 40, k), fontSize: lerp(28, 18, k) }}>₿</div>
            <div><div className="font-extrabold text-white" style={{ fontSize: lerp(24, 16, k) }}>Bitcoin</div><div className="font-mono font-bold text-bull" style={{ fontSize: lerp(14, 11, k), opacity: 1 }}>$64,250 · +2.4%</div></div>
          </div>
          <div className="absolute left-5 right-5 flex gap-2" style={{ top: 118, opacity: 1 - k * 2, transform: `translateY(${k * 20}px)` }}><Btn v="bull" size="sm">Buy</Btn><Btn v="bear" size="sm">Sell</Btn><Btn v="ghost" size="sm"><Icon name="bell" size={14} /></Btn></div>
          <div className="absolute right-5 top-4 flex gap-2" style={{ opacity: k, transform: `translateX(${(1 - k) * 20}px)` }}><span className="grid h-8 w-8 place-items-center rounded-lg bg-bull text-ink-900"><Icon name="plus" size={14} stroke={3} /></span><span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 text-white"><Icon name="bell" size={14} /></span></div>
        </div>
        <div onScroll={(e) => setSt(e.currentTarget.scrollTop)} className="no-scrollbar h-72 overflow-y-auto p-4">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="mb-2 flex items-center gap-3 rounded-2xl bg-ink-800/70 p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900/60"><Icon name={["news", "chart", "book", "trophy"][i % 4]} size={16} className="text-sky" /></span><div className="flex-1"><div className="h-2.5 w-2/3 rounded-full bg-ink-600" /><div className="mt-1.5 h-2 w-1/3 rounded-full bg-ink-700" /></div><span className="font-mono text-[10px] text-ink-500">{i + 1}h</span></div>)}
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-18 · SVG morph bull ↔ bear ═════════ */
const BULL_PTS = [[50, 10], [70, 22], [92, 18], [86, 42], [96, 70], [72, 92], [50, 98], [28, 92], [4, 70], [14, 42], [8, 18], [30, 22]];
const BEAR_PTS = [[50, 20], [66, 10], [80, 26], [90, 50], [84, 78], [66, 94], [50, 90], [34, 94], [16, 78], [10, 50], [20, 26], [34, 10]];
function Morph() {
  const [ref, p] = useElementScroll<HTMLDivElement>("center");
  const k = clamp(mapRange(p, 0.2, 0.8, 0, 1), 0, 1);
  const pts = BULL_PTS.map((b, i) => [lerp(b[0], BEAR_PTS[i][0], k), lerp(b[1], BEAR_PTS[i][1], k)]);
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ") + "Z";
  const col = `hsl(${lerp(160, 350, k)} 85% 58%)`;
  return (
    <div ref={ref}>
      <Tag id="SCR-18">SVG shape morph · scroll-linked</Tag>
      <div className="panel flex flex-col items-center gap-6 rounded-[32px] p-8 sm:flex-row sm:justify-around">
        <svg viewBox="0 0 100 100" className="h-52 w-52 overflow-visible">
          <path d={d} fill={col} opacity=".25" style={{ filter: `blur(6px)` }} />
          <path d={d} fill="none" stroke={col} strokeWidth="3" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
          <path d={k < 0.5 ? "M30 45 C25 38 25 30 30 24 C32 30 36 34 40 36 M70 45 C75 38 75 30 70 24 C68 30 64 34 60 36" : "M30 30 C28 22 34 16 40 20 M70 30 C72 22 66 16 60 20"} fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="52" r="3.5" fill="#fff" /><circle cx="58" cy="52" r="3.5" fill="#fff" />
          <path d={k < 0.5 ? "M42 68 Q50 76 58 68" : "M42 72 Q50 64 58 72"} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="max-w-xs text-center sm:text-left">
          <div className="text-[10px] font-extrabold uppercase tracking-[.3em]" style={{ color: col }}>{k < 0.5 ? "Bull market" : "Bear market"}</div>
          <div className="mt-1 text-3xl font-extrabold text-white">Рынок меняет форму</div>
          <div className="mt-2 text-sm text-ink-300">Скролл плавно морфит фигуру быка в медведя: 12 контрольных точек интерполируются, цвет едет по спектру от зелёного к красному.</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800"><div className="h-full" style={{ width: `${k * 100}%`, background: col }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ═════════ Reveal stagger grid (uses useInView) ═════════ */
function StaggerGrid() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const items = ["candle", "shield", "trophy", "gem", "flame", "rocket", "target", "heart"];
  return (
    <div>
      <Tag id="SCR-19">Stagger grid · replays on re-enter</Tag>
      <div ref={ref} className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {items.map((i, k) => <div key={i} className="raised grid aspect-square place-items-center rounded-2xl transition-all duration-500" style={{ transform: inView ? "none" : `translateY(30px) rotate(${k % 2 ? 12 : -12}deg) scale(.6)`, opacity: inView ? 1 : 0, transitionDelay: `${k * 60}ms` }}><Icon name={i} size={28} variant="duo" className="text-sky" /></div>)}
      </div>
    </div>
  );
}

export default function Scroll2() {
  return (
    <Section id="scroll2" num="16" title="Scroll-Reactive II" subtitle="Стек карточек, подсветка слов, zoom-out, 3D-вращение, snap-секции, маскот по пути, canvas-кадры, вертикальный таймлайн, коллапс-хедер, SVG-морф" layout="free">
      <div className="space-y-16">
        <StackingCards />
        <WordReveal />
        <ZoomOut />
        <RotateCard />
        <SnapSections />
        <MascotPath />
        <CanvasSequence />
        <RoadTimeline />
        <CollapsingHeader />
        <Morph />
        <StaggerGrid />
      </div>
    </Section>
  );
}
