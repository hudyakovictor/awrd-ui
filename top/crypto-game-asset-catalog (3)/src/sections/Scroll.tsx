import { useEffect, useRef, useState } from "react";
import { Btn, Icon, Label, Section, useCountUp } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, mapRange, useElementScroll, useInView, useRaf, useScrollVelocity, useWindowMouse } from "../ui/hooks";
import { cn } from "../utils/cn";

function Tag({ id, children }: { id: string; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="rounded-md bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky shadow-[inset_0_0_0_1px_rgba(61,139,255,.3)]">{id}</span>
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">{children}</span>
    </div>
  );
}

/* ═════════ SCR-01 · Multi-layer parallax scene ═════════ */

function ParallaxScene() {
  const [ref, p] = useElementScroll<HTMLDivElement>("through");
  const m = useWindowMouse();
  const L = (speed: number, mouse = 0) => ({ transform: `translate3d(${m.x * mouse}px, ${(p - 0.5) * -speed}px, 0)` });
  const candles = (n: number, seed: number, hMax: number, col: string, w: number) =>
    Array.from({ length: n }, (_, i) => { const h = 20 + Math.abs(Math.sin(i * 0.9 + seed)) * hMax; return <rect key={i} x={i * (w + 8)} y={260 - h} width={w} height={h + 10} rx={w / 3} fill={col} />; });
  return (
    <div ref={ref}>
      <Tag id="SCR-01">Multi-layer parallax · scroll + mouse</Tag>
      <div className="panel relative h-[480px] overflow-hidden rounded-[32px] p-0">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, hsl(${225 + p * 30} 70% ${10 + p * 8}%) 0%, #111f47 70%)` }} />
        <div className="absolute inset-0" style={L(60, 6)}>
          {Array.from({ length: 50 }).map((_, i) => <span key={i} className="absolute rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`, width: (i % 3) + 1, height: (i % 3) + 1, animation: `twinkle ${2 + (i % 5)}s ease-in-out ${i * 0.07}s infinite` }} />)}
        </div>
        <div className="absolute right-[12%] top-[10%]" style={L(160, 14)}>
          <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-[#ffd27a] to-[#f7931a] text-5xl font-extrabold text-white shadow-[0_0_80px_#f7931a88]" style={{ transform: `rotate(${p * 90}deg)` }}>₿</div>
        </div>
        <svg className="absolute bottom-0 left-[-5%] w-[110%]" viewBox="0 0 1000 270" preserveAspectRatio="none" style={{ ...L(120, 20), height: 300 }}>{candles(40, 1, 150, "#1a2e66", 18)}</svg>
        <svg className="absolute bottom-0 left-[-5%] w-[110%]" viewBox="0 0 1000 270" preserveAspectRatio="none" style={{ ...L(220, 34), height: 240 }}>{candles(30, 3, 120, "#223a7d", 26)}</svg>
        <div className="absolute left-1/2 top-[36%] z-10 text-center" style={{ transform: `translate(-50%, ${(p - 0.5) * -80}px) scale(${1 + (p - 0.5) * 0.2})` }}>
          <div className="text-[11px] font-extrabold uppercase tracking-[.3em] text-bull">Scroll · Move mouse</div>
          <div className="mt-2 text-4xl font-extrabold tracking-tight text-white text-3d sm:text-6xl">To the moon,<br />responsibly.</div>
        </div>
        <div className="absolute left-[14%] top-[52%] z-20" style={{ transform: `translate3d(${m.x * 50}px, ${(p - 0.5) * -420 + m.y * 20}px, 0) rotate(${-20 + m.x * 10}deg)` }}>
          <div className="relative anim-float">
            <Mascot mood="cool" size={110} />
            <div className="absolute -bottom-8 left-1/2 h-12 w-8 -translate-x-1/2 rounded-full bg-gradient-to-b from-gold via-flame to-transparent blur-[2px] anim-flame" />
          </div>
        </div>
        <svg className="absolute bottom-0 left-[-5%] z-30 w-[110%]" viewBox="0 0 1000 270" preserveAspectRatio="none" style={{ ...L(360, 60), height: 170 }}>{candles(22, 5, 90, "#2c4a9a", 36)}</svg>
        <div className="absolute bottom-4 right-4 z-40 rounded-xl bg-ink-900/70 px-3 py-1.5 font-mono text-[11px] font-bold text-ink-300">scroll p = {p.toFixed(2)}</div>
      </div>
    </div>
  );
}

/* ═════════ SCR-02 · Sticky scroll story ═════════ */
const STORY = [
  { t: "1. Найди тренд", d: "Цена делает более высокие максимумы и минимумы — рынок растёт.", c: "#5ce1ff", i: "trendUp" },
  { t: "2. Отметь поддержку", d: "Линия через минимумы показывает, где покупатели защищают цену.", c: "#ffc53d", i: "target" },
  { t: "3. Поставь стоп-лосс", d: "Чуть ниже поддержки. Если уровень сломан — идея неверна.", c: "#ff4d6a", i: "shield" },
  { t: "4. Зафиксируй прибыль", d: "Цель в 2–3 раза дальше стопа. Риск/прибыль 1:3.", c: "#2ee59d", i: "trophy" },
];
const SP = "M10 200 L40 180 L60 190 L90 150 L115 165 L145 120 L170 135 L200 95 L225 110 L255 70 L270 40";
function ScrollStory() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(600);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, []);
  const step = clamp(Math.floor(p * 4), 0, 3);
  const seg = (i: number) => clamp(p * 4 - i, 0, 1);
  const draw = seg(0);
  const endPt = pathRef.current ? pathRef.current.getPointAtLength(len * (0.85 + seg(3) * 0.15)) : { x: 270, y: 40 };
  return (
    <div ref={ref} className="relative" style={{ height: "340vh" }}>
      <div className="sticky top-20 flex h-[calc(100vh-6rem)] items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2">
          <div>
            <Tag id="SCR-02">Sticky scroll story · pinned</Tag>
            <h3 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Сделка за 4 шага.<br /><span className="text-ink-400">Просто листай.</span></h3>
            <div className="mt-6 space-y-3">
              {STORY.map((s, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <div key={s.t} className={cn("flex gap-3 rounded-2xl p-3 transition-all duration-500", on ? "raised translate-x-2" : "opacity-50")}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-500" style={{ background: on || done ? s.c : "#16264f", boxShadow: on ? `0 0 20px ${s.c}88` : undefined }}>
                      <Icon name={done ? "check" : s.i} size={20} stroke={done ? 3.2 : 2.4} className={on || done ? "text-ink-900" : "text-ink-400"} />
                    </span>
                    <div>
                      <div className="text-base font-extrabold text-white">{s.t}</div>
                      <div className={cn("grid transition-all duration-500", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}><div className="overflow-hidden text-sm text-ink-300">{s.d}</div></div>
                      {on && <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-900"><div className="h-full rounded-full" style={{ width: `${seg(i) * 100}%`, background: s.c }} /></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative mx-auto w-[300px]">
            <div className="absolute -inset-10 rounded-full blur-3xl transition-colors duration-700" style={{ background: `${STORY[step].c}22` }} />
            <div className="relative rounded-[44px] bg-gradient-to-b from-ink-600 to-ink-800 p-2.5 shadow-[0_8px_0_#050b1f,0_30px_60px_-20px_#000]">
              <div className="relative h-[520px] overflow-hidden rounded-[36px] bg-ink-900 p-4 pt-10">
                <div className="flex items-center justify-between"><span className="text-sm font-extrabold text-white">BTC / USDT</span><span className="font-mono text-xs font-bold text-bull">+{(draw * 12.4 + seg(3) * 6).toFixed(1)}%</span></div>
                <svg viewBox="0 0 280 240" className="mt-4 w-full overflow-visible">
                  <rect x="0" y={mapRange(seg(2), 0, 1, 240, 205)} width="280" height="40" fill="#ff4d6a" opacity={seg(2) * 0.18} />
                  <line x1="0" x2="280" y1="212" y2="212" stroke="#ff4d6a" strokeWidth="2" strokeDasharray="6 4" opacity={seg(2)} />
                  {seg(2) > 0.3 && <text x="276" y="226" textAnchor="end" fontSize="10" fontWeight="800" fill="#ff4d6a" opacity={seg(2)}>STOP 61,200</text>}
                  <rect x="0" y="0" width="280" height={seg(3) * 42} fill="#2ee59d" opacity=".15" />
                  <line x1="0" x2="280" y1="30" y2="30" stroke="#2ee59d" strokeWidth="2" strokeDasharray="6 4" opacity={seg(3)} />
                  {seg(3) > 0.3 && <text x="276" y="22" textAnchor="end" fontSize="10" fontWeight="800" fill="#2ee59d">TAKE PROFIT 68,900</text>}
                  <line x1="10" y1="203" x2={10 + seg(1) * 270} y2={203 - seg(1) * 160} stroke="#ffc53d" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #ffc53d)" }} />
                  <path ref={pathRef} d={SP} fill="none" stroke="#5ce1ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} style={{ filter: "drop-shadow(0 0 6px #5ce1ff)" }} />
                  {draw > 0.98 && <circle cx={endPt.x} cy={endPt.y} r="6" fill="#fff" style={{ filter: "drop-shadow(0 0 8px #fff)" }} />}
                </svg>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Entry", "63,400", seg(1) > 0.5], ["Stop", "61,200", seg(2) > 0.5], ["Target", "68,900", seg(3) > 0.5]].map(([l, v, on]) => (
                    <div key={l as string} className={cn("rounded-xl p-2 transition-all duration-500", on ? "raised" : "bg-ink-800/50 opacity-40")}>
                      <div className="text-[9px] font-extrabold uppercase text-ink-400">{l}</div><div className="font-mono text-xs font-extrabold text-white">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  <Mascot mood={step === 3 ? "happy" : step === 2 ? "think" : "idle"} size={52} />
                  <div key={step} className="anim-fade-up flex-1 rounded-2xl rounded-bl-md bg-white p-2.5 text-xs font-bold text-ink-900">{["Смотри, как растут минимумы!", "Проведём линию поддержки…", "Стоп — наша страховка.", "Профит 1:3. Красота!"][step]}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-gradient-to-r from-sky via-gold to-bull" style={{ width: `${p * 100}%` }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-03 · Horizontal scroll driven by vertical ═════════ */
const HUNITS = [
  { t: "Crypto 101", i: "coin", c: "#2ee59d" }, { t: "Wallets", i: "wallet", c: "#3d8bff" }, { t: "Candles", i: "candle", c: "#ffc53d" }, { t: "Trends", i: "trendUp", c: "#5ce1ff" },
  { t: "Risk", i: "shield", c: "#ff4d6a" }, { t: "Indicators", i: "chart", c: "#ff8a3d" }, { t: "Futures", i: "rocket", c: "#a174ff" }, { t: "Mastery", i: "crown", c: "#ffd76a" },
];
function HorizontalScroll() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  const track = useRef<HTMLDivElement>(null);
  const vp = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [vw, setVw] = useState(800);
  useEffect(() => {
    const calc = () => { if (track.current && vp.current) { setDist(Math.max(0, track.current.scrollWidth - vp.current.clientWidth)); setVw(vp.current.clientWidth); } };
    calc();
    const ro = new ResizeObserver(calc);
    if (vp.current) ro.observe(vp.current);
    return () => ro.disconnect();
  }, []);
  const x = -p * dist;
  const CW = 300;
  const active = clamp(Math.round(p * (HUNITS.length - 1)), 0, HUNITS.length - 1);
  return (
    <div ref={ref} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-20 flex h-[calc(100vh-6rem)] flex-col justify-center overflow-hidden">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Tag id="SCR-03">Horizontal scroll · vertical wheel</Tag>
            <h3 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Путь обучения</h3>
          </div>
          <div className="font-mono text-4xl font-extrabold text-ink-600"><span className="text-white">{String(active + 1).padStart(2, "0")}</span> / {String(HUNITS.length).padStart(2, "0")}</div>
        </div>
        <div ref={vp} className="relative">
          <div ref={track} className="flex gap-6 will-change-transform" style={{ transform: `translate3d(${x}px,0,0)` }}>
            {HUNITS.map((u, i) => {
              const center = i * (CW + 24) + CW / 2 + x - vw / 2;
              const n = clamp(center / vw, -1, 1);
              return (
                <div key={u.t} className="relative h-[380px] shrink-0 overflow-hidden rounded-[32px]" style={{ width: CW, background: `linear-gradient(160deg, ${u.c}, ${u.c}55 60%, #111f47)`, boxShadow: `0 8px 0 #050b1f, 0 30px 50px -20px #000`, transform: `rotate(${n * -3}deg) scale(${1 - Math.abs(n) * 0.08})` }}>
                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" style={{ transform: `translateX(${n * -80}px)` }} />
                  <div className="absolute left-6 top-6 font-mono text-[80px] font-extrabold leading-none text-white/15" style={{ transform: `translateX(${n * 60}px)` }}>{String(i + 1).padStart(2, "0")}</div>
                  <div className="absolute right-6 top-24" style={{ transform: `translateX(${n * -120}px) rotate(${n * 30}deg)` }}><Icon name={u.i} size={110} variant="duo" className="text-white drop-shadow-[0_10px_0_rgba(0,0,0,.2)]" /></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Unit {i + 1}</div>
                    <div className="text-3xl font-extrabold text-white text-3d">{u.t}</div>
                    <div className="mt-3 flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, k) => <span key={k} className="h-2 flex-1 rounded-full" style={{ background: k < Math.max(0, 5 - i) ? "#fff" : "rgba(0,0,0,.25)" }} />)}
                    </div>
                  </div>
                  {i > 3 && <div className="absolute inset-0 grid place-items-center bg-ink-950/50 backdrop-blur-[2px]"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-800 shadow-[0_4px_0_#050b1f]"><Icon name="lock" size={24} className="text-ink-300" /></div></div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-gradient-to-r from-bull to-sky" style={{ width: `${p * 100}%` }} /></div>
      </div>
    </div>
  );
}

/* ═════════ SCR-04 · Scroll-velocity marquee ═════════ */
function VelocityMarquee() {
  const v = useScrollVelocity();
  const vRef = useRef(0);
  vRef.current = v;
  const off1 = useRef(0), off2 = useRef(0), dir = useRef(1);
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null);
  useRaf((dt) => {
    if (vRef.current > 0.3) dir.current = 1; else if (vRef.current < -0.3) dir.current = -1;
    const sp = (1 + Math.abs(vRef.current) * 0.9) * dir.current * (dt / 16);
    off1.current = (off1.current - sp) % 1000;
    off2.current = (off2.current + sp) % 1000;
    if (r1.current) r1.current.style.transform = `translateX(${off1.current - 1000}px) skewX(${clamp(-vRef.current * 1.4, -20, 20)}deg)`;
    if (r2.current) r2.current.style.transform = `translateX(${off2.current - 1000}px) skewX(${clamp(vRef.current * 1.4, -20, 20)}deg)`;
  });
  const row = (words: string[], outline: boolean) => (
    <div className="flex shrink-0">
      {Array.from({ length: 4 }).map((_, k) => (
        <div key={k} className="flex w-[1000px] shrink-0 items-center justify-around">
          {words.map((w, i) => <span key={i} className={cn("whitespace-nowrap text-5xl font-extrabold tracking-tight sm:text-7xl", outline ? "text-stroke" : i % 2 ? "text-bull" : "text-white")}>{w}<span className="mx-4 text-gold">✦</span></span>)}
        </div>
      ))}
    </div>
  );
  return (
    <div>
      <Tag id="SCR-04">Scroll-velocity marquee · skew + direction</Tag>
      <div className="panel overflow-hidden rounded-[32px] py-8">
        <div ref={r1} className="flex will-change-transform">{row(["HODL", "DYOR", "BUY THE DIP"], false)}</div>
        <div ref={r2} className="mt-4 flex will-change-transform">{row(["STAY SAFU", "RISK 1%", "NO FOMO"], true)}</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="font-mono text-xs font-bold text-ink-400">velocity</span>
          <div className="well h-2 w-48 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-sky to-bear" style={{ width: `${clamp(Math.abs(v) * 4, 0, 100)}%` }} /></div>
          <span className="w-12 font-mono text-xs font-extrabold text-white">{v.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

/* ═════════ SCR-05 · Scroll-drawn history chart ═════════ */
const HIST = "M0 250 L40 240 L80 210 L110 225 L150 120 L180 60 L210 140 L240 190 L270 205 L300 170 L330 150 L360 90 L400 110 L430 50 L470 30 L500 15";
const MILES = [
  { f: 0.12, t: "2020 Halving", c: "#a174ff" }, { f: 0.36, t: "ATH $69k", c: "#2ee59d" }, { f: 0.5, t: "Crash −77%", c: "#ff4d6a" },
  { f: 0.72, t: "ETF Approved", c: "#ffc53d" }, { f: 0.94, t: "New ATH", c: "#5ce1ff" },
];
function ScrollChart() {
  const [ref, p] = useElementScroll<HTMLDivElement>("through");
  const path = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1000);
  useEffect(() => { if (path.current) setLen(path.current.getTotalLength()); }, []);
  const t = clamp(mapRange(p, 0.18, 0.72, 0, 1), 0, 1);
  const pt = path.current ? path.current.getPointAtLength(len * t) : { x: 0, y: 250 };
  const price = Math.round(mapRange(pt.y, 250, 15, 8000, 98000));
  return (
    <div ref={ref}>
      <Tag id="SCR-05">Scroll-drawn chart · milestones</Tag>
      <div className="panel rounded-[32px] p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><div className="text-2xl font-extrabold text-white">История Bitcoin</div><div className="text-sm text-ink-400">Листай — график рисуется, события появляются</div></div>
          <div className="text-right"><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Price</div><div className="font-mono text-3xl font-extrabold tabular-nums text-white">${price.toLocaleString()}</div></div>
        </div>
        <svg viewBox="-10 0 520 270" className="w-full overflow-visible">
          <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5ce1ff" stopOpacity=".3" /><stop offset="1" stopColor="#5ce1ff" stopOpacity="0" /></linearGradient><clipPath id="hc"><rect x="-10" y="0" width={pt.x + 10} height="270" /></clipPath></defs>
          {[60, 120, 180, 240].map((g) => <line key={g} x1="0" x2="500" y1={g} y2={g} stroke="#ffffff0a" />)}
          <path d={HIST + " L500 270 L0 270 Z"} fill="url(#hg)" clipPath="url(#hc)" />
          <path ref={path} d={HIST} fill="none" stroke="#5ce1ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} style={{ filter: "drop-shadow(0 0 8px #5ce1ff)" }} />
          {MILES.map((m) => {
            const on = t >= m.f;
            const mp = path.current ? path.current.getPointAtLength(len * m.f) : { x: 0, y: 0 };
            return (
              <g key={m.t} style={{ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)`, transition: "all .5s cubic-bezier(.3,1.5,.5,1)" }}>
                <line x1={mp.x} x2={mp.x} y1={mp.y} y2={mp.y - 34} stroke={m.c} strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx={mp.x} cy={mp.y} r="5" fill={m.c} />
                <rect x={mp.x - 44} y={mp.y - 56} width="88" height="22" rx="8" fill={m.c} />
                <text x={mp.x} y={mp.y - 41} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0a1330">{m.t}</text>
              </g>
            );
          })}
          <circle cx={pt.x} cy={pt.y} r="7" fill="#fff" stroke="#5ce1ff" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

/* ═════════ SCR-06 · Reveal variants ═════════ */
const RV = [
  { c: "rv-up", t: "Fade Up", i: "up" }, { c: "rv-scale", t: "Pop Scale", i: "plus" }, { c: "rv-flip", t: "Flip X", i: "swap" }, { c: "rv-blur", t: "Blur In", i: "eye" },
  { c: "rv-left", t: "Slide Tilt", i: "chevR" }, { c: "rv-clip", t: "Wipe", i: "grid" }, { c: "rv-rot", t: "Spin In", i: "refresh" }, { c: "rv-drop", t: "Drop", i: "down" },
];
function RevealTile({ r, i }: { r: (typeof RV)[number]; i: number }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.4 });
  return (
    <div ref={ref} className={cn("raised flex h-32 flex-col items-center justify-center gap-2 rounded-3xl", r.c, inView && "rv-in")} style={{ transitionDelay: `${(i % 4) * 90}ms` }}>
      <Icon name={r.i} size={28} stroke={2.6} className="text-sky" />
      <span className="text-sm font-extrabold text-white">{r.t}</span>
      <code className="font-mono text-[10px] text-ink-400">.{r.c}</code>
    </div>
  );
}
function Reveals() {
  return (
    <div>
      <Tag id="SCR-06">Scroll reveal variants · replays on re-enter</Tag>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{RV.map((r, i) => <RevealTile key={r.c} r={r} i={i} />)}</div>
    </div>
  );
}

/* ═════════ SCR-07 · Counters on reveal ═════════ */
function Stat({ v, suf, l, c, pre = "" }: { v: number; suf: string; l: string; c: string; pre?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const n = useCountUp(inView ? v : 0, 1800);
  return (
    <div ref={ref} className="panel relative overflow-hidden p-6 text-center">
      <div className="absolute inset-x-0 bottom-0 h-1 origin-left transition-transform duration-[1800ms]" style={{ background: c, transform: `scaleX(${inView ? 1 : 0})` }} />
      <div className="font-mono text-4xl font-extrabold tabular-nums sm:text-5xl" style={{ color: c, textShadow: `0 0 24px ${c}55` }}>{pre}{v % 1 ? n.toFixed(1) : Math.round(n).toLocaleString()}{suf}</div>
      <div className="mt-2 text-sm font-bold text-ink-300">{l}</div>
    </div>
  );
}
function Counters() {
  return (
    <div>
      <Tag id="SCR-07">Count-up on reveal</Tag>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat v={2.4} suf="M" l="учеников" c="#2ee59d" />
        <Stat v={18} suf="M" l="уроков пройдено" c="#3d8bff" />
        <Stat v={97} suf="%" l="держат стрик 7+ дней" c="#ffc53d" />
        <Stat v={4.9} suf="★" l="рейтинг в сторах" c="#a174ff" />
      </div>
    </div>
  );
}

/* ═════════ SCR-08 · Portal zoom ═════════ */
function Portal() {
  const [ref, p] = useElementScroll<HTMLDivElement>("pinned");
  const r = mapRange(p, 0.1, 0.75, 6, 150);
  const txt = mapRange(p, 0, 0.5, 1, 3.2);
  return (
    <div ref={ref} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-[32px]">
        <div className="absolute inset-0 grid place-items-center bg-ink-950">
          <div className="text-center" style={{ transform: `scale(${txt})`, opacity: 1 - clamp((p - 0.35) * 3, 0, 1) }}>
            <Tag id="SCR-08">Portal zoom · clip-path</Tag>
            <div className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">Enter the<br /><span className="text-bull">arena</span></div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `circle(${r}% at 50% 50%)`, background: "radial-gradient(circle at 50% 40%, #1d4fbf, #0a1330 70%)" }}>
          <div className="text-center" style={{ transform: `scale(${mapRange(p, 0.3, 0.9, 0.7, 1)})` }}>
            <Mascot mood="wow" size={130} className="mx-auto anim-float" />
            <div className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Trading League</div>
            <div className="mt-2 text-ink-200">Соревнуйся с 30 трейдерами каждую неделю</div>
            <div className="mt-6 flex justify-center gap-3" style={{ opacity: clamp((p - 0.6) * 4, 0, 1) }}>
              <Btn v="gold" size="lg"><Icon name="trophy" size={18} variant="solid" />Join league</Btn>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ opacity: 1 - clamp(p * 5, 0, 1) }}>
          <div className="flex flex-col items-center gap-1 text-ink-400"><Label className="mb-0">scroll</Label><Icon name="chevD" size={20} stroke={3} style={{ animation: "scrollHint 1.2s ease-in infinite" }} /></div>
        </div>
      </div>
    </div>
  );
}

export default function ScrollSection() {
  return (
    <Section id="scroll" num="11" title="Scroll-Reactive" subtitle="Параллакс, pinned-истории, горизонтальный скролл, скорость, рисование, reveal, портал" layout="free">
      <div className="space-y-16">
        <ParallaxScene />
        <ScrollStory />
        <VelocityMarquee />
        <HorizontalScroll />
        <ScrollChart />
        <Portal />
        <Reveals />
        <Counters />
      </div>
    </Section>
  );
}
