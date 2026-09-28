import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Badge, Btn3D, CountUp, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { Mascot, MASCOT_IMG } from "./Mascot";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { clamp, easeOutCubic, mapRange, readScrollVelocity, Reveal, SplitReveal, useElementProgress, useInView, usePointer, useRafLoop, useSpring, type RevealFrom } from "../hooks/motion";

/* =========================================================
   1. MULTI-LAYER PARALLAX SCENE (scroll + mouse, spring-smoothed)
   ========================================================= */
function Skyline({ seed, h, color, count }: { seed: number; h: number; color: string; count: number }) {
  const bars = useMemo(() => Array.from({ length: count }, (_, i) => { const r = Math.abs(Math.sin(seed * 99 + i * 12.9898) * 43758.5453) % 1; return { hh: 0.3 + r * 0.7, up: r > 0.45 }; }), [seed, count]);
  const w = 1000 / count;
  return (
    <svg viewBox={`0 0 1000 ${h}`} preserveAspectRatio="none" className="w-full h-full">
      {bars.map((b, i) => (
        <g key={i}>
          <line x1={i * w + w / 2} x2={i * w + w / 2} y1={h - b.hh * h - 10} y2={h} stroke={color} strokeWidth="2" />
          <rect x={i * w + w * 0.18} y={h - b.hh * h} width={w * 0.64} height={b.hh * h} fill={color} rx="3" />
        </g>
      ))}
    </svg>
  );
}
function ParallaxScene() {
  const [ref, p] = useElementProgress<HTMLDivElement>("through");
  const [pref, ptr] = usePointer<HTMLDivElement>();
  const mx = useSpring(ptr.x, 120, 16);
  const my = useSpring(ptr.y, 120, 16);
  const s = (p - 0.5) * 2;
  const L = (speed: number, depth: number) => ({ transform: `translate3d(${mx * depth}px, ${s * speed + my * depth * 0.6}px, 0)` });
  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ x: (i * 73) % 100, y: (i * 41) % 60, r: (i % 3) + 1, d: (i % 7) * 0.3 })), []);
  return (
    <div ref={ref} className="lg:col-span-3">
      <div ref={pref} className="relative h-[460px] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_8px_0_#081028,0_30px_60px_rgba(0,0,0,.5)]" style={{ background: "linear-gradient(180deg, #050a18 0%, #0c1a46 55%, #1a2f78 100%)" }}>
        <div className="absolute inset-0" style={L(-40, -6)}>
          {stars.map((st, i) => <span key={i} className="absolute rounded-full bg-white" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.r, height: st.r, animation: `twinkle 2.6s ${st.d}s ease-in-out infinite` }} />)}
        </div>
        <div className="absolute left-1/2 top-[12%] -ml-16" style={L(-110, -14)}>
          <div className="relative size-32">
            <div className="absolute -inset-10 rounded-full bg-[#f7931a]/30 blur-3xl" />
            <div className="relative size-32 rounded-full bg-gradient-to-b from-[#ffc46b] to-[#e07a0a] grid place-items-center shadow-[inset_0_-10px_20px_rgba(0,0,0,.3),inset_0_6px_0_rgba(255,255,255,.35)]" style={{ transform: `rotate(${p * 90}deg)` }}>
              <Icon name="bitcoin" size={64} stroke={2.4} className="text-white/90" />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-[-6%] bottom-[26%] h-[34%] opacity-40" style={L(40, 8)}><Skyline seed={1} h={200} color="#27408a" count={34} /></div>
        <div className="absolute inset-x-[-8%] bottom-[12%] h-[34%] opacity-70" style={L(90, 18)}><Skyline seed={2} h={200} color="#1c3068" count={24} /></div>
        <div className="absolute inset-x-[-10%] bottom-[-4%] h-[34%]" style={L(150, 32)}><Skyline seed={3} h={200} color="#101d44" count={16} /></div>
        {[{ x: 14, y: 30, g: "coin" as const, sp: -60, d: 22 }, { x: 80, y: 22, g: "gem" as const, sp: -90, d: 30 }, { x: 70, y: 58, g: "star" as const, sp: -140, d: 44 }, { x: 22, y: 62, g: "bolt" as const, sp: -120, d: 38 }].map((c, i) => (
          <div key={i} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, ...L(c.sp, c.d) }}>
            <div className="anim-float" style={{ animationDelay: `${i * 0.4}s` }}><Glyph name={c.g} size={34 + i * 4} /></div>
          </div>
        ))}
        <div className="absolute left-1/2 bottom-[6%] -translate-x-1/2" style={L(170, 40)}>
          <img src={MASCOT_IMG.cheer} alt="" className="h-[180px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.6)]" draggable={false} />
        </div>
        <div className="absolute inset-x-0 top-[40%] text-center pointer-events-none" style={{ transform: `translate3d(${mx * -10}px, ${s * -60}px, 0) scale(${1 + (1 - Math.abs(s)) * 0.06})`, opacity: 1 - Math.abs(s) * 0.8 }}>
          <div className="text-[34px] sm:text-[56px] font-extrabold tracking-tight leading-none drop-shadow-[0_6px_20px_rgba(0,0,0,.6)]">To the <span className="bg-gradient-to-r from-gold to-[#ff8a3d] bg-clip-text text-transparent">moon</span></div>
          <div className="text-[13px] font-bold text-mute mt-2">8 слоёв · скролл + мышь · spring-сглаживание</div>
        </div>
        <div className="absolute top-4 left-4 flex gap-2"><Badge tone="cyan">Parallax</Badge><Badge tone="neutral"><span className="num">scroll {Math.round(p * 100)}%</span></Badge></div>
      </div>
    </div>
  );
}

/* =========================================================
   2. STICKY STORYTELLING (pinned scene)
   ========================================================= */
const STEPS = [
  { t: "Выбери урок", d: "5 минут в день. Путь из юнитов и узлов, как в игре.", g: "rocket" as const, c: "#3d7bff" },
  { t: "Ответь на вопросы", d: "Свечи, уровни, риск — через квизы и мини-графики.", g: "star" as const, c: "#8d5cff" },
  { t: "Практикуй на демо", d: "Открой сделку на $10 000 виртуальных денег.", g: "bolt" as const, c: "#ffc53d" },
  { t: "Поднимайся в лиге", d: "XP за каждый урок. Обгоняй соперников недели.", g: "crown" as const, c: "#1fdb8b" },
];
function StickyStory() {
  const [ref, p] = useElementProgress<HTMLDivElement>("pin");
  const step = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
  const local = p * STEPS.length - step;
  const last = useRef(step);
  useEffect(() => { if (step !== last.current) { last.current = step; sfx.tick(); } }, [step]);
  const st = STEPS[step];
  return (
    <div ref={ref} className="lg:col-span-3 relative" style={{ height: "280vh" }}>
      <div className="sticky top-20 h-[calc(100vh-6rem)] min-h-[520px] panel p-6 sm:p-8 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div><div className="label-caps !mb-1">scroll-pinned story</div><h3 className="text-[22px] font-extrabold">Как работает Tradelingo</h3></div>
          <Badge tone="blue"><span className="num">{step + 1}/{STEPS.length}</span></Badge>
        </div>
        <div className="flex-1 grid md:grid-cols-[1fr_300px] gap-8 items-center min-h-0">
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-1 rounded-full bg-[#16275a]" />
            <div className="absolute left-3 top-2 w-1 rounded-full bg-gradient-to-b from-blue to-bull transition-[height] duration-150" style={{ height: `calc(${p * 100}% - 16px)` }} />
            {STEPS.map((x, i) => (
              <div key={x.t} className={cn("relative py-4 transition-all duration-500", i === step ? "opacity-100 translate-x-0" : "opacity-35 -translate-x-1")}>
                <span className="absolute -left-[26px] top-5 size-4 rounded-full border-[3px] transition-all duration-300" style={{ background: i <= step ? x.c : "#0a1330", borderColor: i <= step ? "#fff" : "#26397a", boxShadow: i === step ? `0 0 16px ${x.c}` : "none" }} />
                <div className="text-[18px] sm:text-[22px] font-extrabold">{x.t}</div>
                <div className={cn("text-[13px] text-mute leading-snug transition-all duration-500 overflow-hidden", i === step ? "max-h-20 mt-1" : "max-h-0")}>{x.d}</div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative w-[240px] h-[440px] rounded-[38px] border-[8px] border-[#101d44] bg-ink-900 overflow-hidden shadow-[0_12px_0_#081028,0_30px_60px_rgba(0,0,0,.5)]" style={{ transform: `rotate(${(local - 0.5) * 4}deg) translateY(${(0.5 - local) * 12}px)` }}>
              <div key={step} className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center anim-scale" style={{ background: `radial-gradient(circle at 50% 30%, ${st.c}40, transparent 70%)` }}>
                <div className="relative"><div className="absolute -inset-6 rounded-full blur-2xl" style={{ background: st.c, opacity: 0.35 }} /><Glyph name={st.g} size={84} /></div>
                <div className="font-extrabold text-[18px] mt-4">{st.t}</div>
                <div className="text-[11.5px] text-mute mt-1.5 leading-snug">{st.d}</div>
                <div className="w-full mt-5 h-2.5 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${local * 100}%`, background: st.c }} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-dim font-bold flex items-center gap-1.5 mt-3"><Icon name="arrowDown" size={13} className="anim-float" />Продолжайте скроллить — сцена закреплена, шаги меняются от прогресса</div>
      </div>
    </div>
  );
}

/* =========================================================
   3. HORIZONTAL SCROLL DRIVEN BY VERTICAL
   ========================================================= */
const JOURNEY = [
  { lv: 1, t: "Новичок", d: "Что такое биткоин", g: "coin" as const, c: "#8fb3ff" },
  { lv: 5, t: "Ученик", d: "Читаю свечи", g: "flame" as const, c: "#ff8a3d" },
  { lv: 10, t: "Аналитик", d: "Уровни и тренды", g: "star" as const, c: "#ffc53d" },
  { lv: 20, t: "Трейдер", d: "Риск-менеджмент", g: "shield" as const, c: "#1fdb8b" },
  { lv: 35, t: "Стратег", d: "Системы и журналы", g: "gem" as const, c: "#2ed3f0" },
  { lv: 50, t: "Легенда", d: "Топ-1% лиги", g: "crown" as const, c: "#8d5cff" },
];
function HorizontalScroll() {
  const [ref, p] = useElementProgress<HTMLDivElement>("pin");
  const track = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const m = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - (view.current?.clientWidth ?? 0)));
    m();
    addEventListener("resize", m);
    return () => removeEventListener("resize", m);
  }, []);
  return (
    <div ref={ref} className="lg:col-span-3 relative" style={{ height: "240vh" }}>
      <div className="sticky top-20 h-[calc(100vh-6rem)] min-h-[440px] panel p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div><div className="label-caps !mb-1">vertical → horizontal</div><h3 className="text-[22px] font-extrabold">Путь трейдера: 50 уровней</h3></div>
          <div className="w-40 h-2 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue to-violet" style={{ width: `${p * 100}%` }} /></div>
        </div>
        <div ref={view} className="flex-1 flex items-center overflow-hidden">
          <div ref={track} className="flex gap-5 will-change-transform" style={{ transform: `translate3d(${-p * dist}px,0,0)` }}>
            {JOURNEY.map((j, i) => {
              const local = clamp(p * (JOURNEY.length - 1) - i + 1, 0, 2);
              const act = local > 0.6 && local < 1.4;
              return (
                <div key={j.t} className="shrink-0 w-[260px] h-[300px] rounded-[28px] p-5 relative overflow-hidden flex flex-col"
                  style={{ background: `linear-gradient(165deg, ${j.c}55, #0f1b3f 70%)`, border: `1px solid ${j.c}55`, boxShadow: act ? `0 0 40px ${j.c}55, 0 8px 0 #081028` : "0 8px 0 #081028", transform: `scale(${act ? 1 : 0.92})`, transition: "transform .4s, box-shadow .4s" }}>
                  <div className="absolute -right-10 -top-10 size-40 rounded-full" style={{ background: j.c, opacity: 0.15 }} />
                  <span className="num text-[60px] font-extrabold leading-none opacity-20 absolute right-4 bottom-2">{j.lv}</span>
                  <div style={{ transform: `translateX(${(local - 1) * -30}px)` }}><Glyph name={j.g} size={56} /></div>
                  <div className="mt-auto relative">
                    <div className="label-caps !mb-1" style={{ color: j.c }}>Level {j.lv}</div>
                    <div className="text-[24px] font-extrabold">{j.t}</div>
                    <div className="text-[12.5px] text-mute">{j.d}</div>
                  </div>
                </div>
              );
            })}
            <div className="shrink-0 w-[260px] h-[300px] grid place-items-center"><Mascot mood="cheer" size={150} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   4. SCROLL-DRAWN CHART
   ========================================================= */
function ScrollDrawChart() {
  const [ref, p] = useElementProgress<HTMLDivElement>("through");
  const path = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1000);
  const [pt, setPt] = useState({ x: 0, y: 0 });
  const pts = useMemo(() => { let v = 70; return Array.from({ length: 40 }, (_, i) => { v += (Math.random() - 0.42) * 9; v = clamp(v, 10, 110); return [i * (400 / 39), v] as [number, number]; }); }, []);
  const d = useMemo(() => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" "), [pts]);
  const k = clamp(mapRange(p, 0.2, 0.7, 0, 1));
  useEffect(() => { if (path.current) setLen(path.current.getTotalLength()); }, [d]);
  useEffect(() => { if (path.current) { const q = path.current.getPointAtLength(len * k); setPt({ x: q.x, y: q.y }); } }, [k, len]);
  const price = Math.round(40000 + (120 - pt.y) * 300);
  return (
    <div ref={ref} className="lg:col-span-2">
      <Asset title="Scroll-Drawn Chart" id="scr.draw" desc="Линия цены рисуется ровно по прогрессу скролла; маркер и цена следуют за концом линии, заливка раскрывается.">
        <div className="inset !rounded-2xl p-3 relative">
          <div className="flex justify-between items-baseline mb-1"><span className="font-extrabold text-[13px]">BTC · 2024</span><span className="num text-[20px] font-extrabold text-bull">${price.toLocaleString()}</span></div>
          <svg viewBox="0 0 400 130" className="w-full h-[200px] overflow-visible">
            <defs>
              <linearGradient id="sd-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1fdb8b" stopOpacity=".35" /><stop offset="1" stopColor="#1fdb8b" stopOpacity="0" /></linearGradient>
              <clipPath id="sd-c"><rect x="0" y="0" width={pt.x} height="130" /></clipPath>
            </defs>
            {[30, 60, 90].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(140,170,255,.07)" />)}
            <path d={`${d} L400,130 L0,130 Z`} fill="url(#sd-f)" clipPath="url(#sd-c)" />
            <path ref={path} d={d} fill="none" stroke="#1fdb8b" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} style={{ filter: "drop-shadow(0 0 6px rgba(31,219,139,.7))" }} />
            {k > 0.01 && <>
              <line x1={pt.x} x2={pt.x} y1={pt.y} y2="130" stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
              <circle cx={pt.x} cy={pt.y} r="9" fill="#1fdb8b" opacity=".25"><animate attributeName="r" values="6;12;6" dur="1.4s" repeatCount="indefinite" /></circle>
              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#fff" stroke="#1fdb8b" strokeWidth="2.5" />
            </>}
          </svg>
          <div className="h-1.5 rounded-full bg-[#16275a] mt-2 overflow-hidden"><div className="h-full bg-bull rounded-full" style={{ width: `${k * 100}%` }} /></div>
        </div>
      </Asset>
    </div>
  );
}

/* =========================================================
   5. WORD-BY-WORD SCROLL HIGHLIGHT
   ========================================================= */
function WordHighlight() {
  const [ref, p] = useElementProgress<HTMLDivElement>("through");
  const text = "Рынок не награждает тех, кто прав. Он награждает тех, кто управляет риском, ждёт свой сетап и не торгует на эмоциях.";
  const words = text.split(" ");
  const k = clamp(mapRange(p, 0.15, 0.65, 0, 1));
  return (
    <div ref={ref}>
      <Asset title="Scroll Text Highlight" id="scr.words" desc="Каждое слово «загорается» по мере скролла.">
        <p className="text-[21px] sm:text-[24px] font-extrabold leading-snug tracking-tight">
          {words.map((w, i) => {
            const t = clamp(k * words.length - i);
            const key = w.includes("риском") || w.includes("эмоциях");
            return <span key={i} className="transition-colors duration-150" style={{ opacity: 0.14 + t * 0.86, color: key && t > 0.9 ? "#1fdb8b" : undefined }}>{w} </span>;
          })}
        </p>
        <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-dim"><Mascot mood="idle" size={36} bg={false} />— Bulli, 47 дней серии</div>
      </Asset>
    </div>
  );
}

/* =========================================================
   6. CLIP-PATH CIRCLE REVEAL
   ========================================================= */
function ClipReveal() {
  const [ref, p] = useElementProgress<HTMLDivElement>("through");
  const k = easeOutCubic(clamp(mapRange(p, 0.15, 0.6, 0, 1)));
  return (
    <div ref={ref} className="lg:col-span-2">
      <div className="relative h-[340px] rounded-[32px] overflow-hidden border border-white/10 bg-ink-850">
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><div className="label-caps">Scroll to reveal</div><Icon name="arrowDown" size={22} className="mx-auto text-dim anim-float" /></div>
        </div>
        <div className="absolute inset-0" style={{ clipPath: `circle(${6 + k * 80}% at 50% 55%)`, background: "radial-gradient(circle at 50% 40%, #ffc53d55, #3a1b9e 55%, #0a1330)" }}>
          <div className="absolute inset-0" style={{ background: "repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,197,61,.14) 0 10deg, transparent 10deg 20deg)", transform: `rotate(${p * 120}deg) scale(1.6)` }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `scale(${1.4 - k * 0.4})` }}>
            <img src={MASCOT_IMG.cheer} alt="" className="h-[170px] object-contain drop-shadow-2xl" draggable={false} />
            <div className="text-[30px] font-extrabold mt-2" style={{ opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>LEVEL 10 REACHED</div>
            <div className="text-[13px] font-bold text-white/70" style={{ opacity: clamp(k * 2 - 1) }}>Открыт юнит «Уровни и тренды»</div>
          </div>
        </div>
        <div className="absolute top-4 left-4"><Badge tone="gold">clip-path · {Math.round(k * 100)}%</Badge></div>
      </div>
    </div>
  );
}

/* =========================================================
   7. VELOCITY SKEW CARDS
   ========================================================= */
function VelocitySkew() {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const cur = useRef(0);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  const [v, setV] = useState(0);
  useRafLoop(() => {
    const target = clamp(readScrollVelocity() * 9, -14, 14);
    cur.current += (target - cur.current) * 0.15;
    cards.current.forEach((c, i) => { if (c) c.style.transform = `skewY(${cur.current * (i % 2 ? -1 : 1)}deg) translateY(${cur.current * (i - 1.5) * 2}px)`; });
    setV(cur.current);
  }, inView);
  return (
    <div ref={wrapRef}>
      <Asset title="Velocity Skew" id="scr.skew" desc="Карточки деформируются от скорости скролла и плавно выпрямляются — ощущение инерции.">
        <div className="grid grid-cols-2 gap-3">
          {[["BTC", "+2.4%", "#f7931a"], ["ETH", "−1.1%", "#8c8cff"], ["SOL", "+6.8%", "#14f195"], ["DOGE", "+11%", "#c2a633"]].map(([s, c, col], i) => (
            <div key={s} ref={(e) => { cards.current[i] = e; }} className="raised p-3 will-change-transform">
              <span className="size-8 rounded-full grid place-items-center text-[11px] font-extrabold" style={{ background: col, color: "#0b1330" }}>{s[0]}</span>
              <div className="font-extrabold mt-2">{s}</div>
              <div className={cn("num text-[12px] font-extrabold", c.startsWith("+") ? "text-bull" : "text-bear")}>{c}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-dim">velocity <div className="flex-1 h-1.5 rounded-full bg-[#16275a] relative overflow-hidden"><div className="absolute top-0 bottom-0 left-1/2 bg-cyan rounded-full" style={{ width: `${Math.abs(v) * 3.5}%`, transform: v < 0 ? "translateX(-100%)" : "none" }} /></div></div>
      </Asset>
    </div>
  );
}

/* =========================================================
   8. REVEAL GALLERY (all entrance variants)
   ========================================================= */
function RevealGallery() {
  const [k, setK] = useState(0);
  const V: RevealFrom[] = ["up", "down", "left", "right", "scale", "blur", "flip", "rotate", "up"];
  const G: ("coin" | "gem" | "star" | "bolt" | "crown" | "rocket" | "shield" | "flame" | "heart")[] = ["coin", "gem", "star", "bolt", "crown", "rocket", "shield", "flame", "heart"];
  return (
    <Asset title="Scroll Reveal Variants" id="scr.reveal" desc="8 типов появления при входе во вьюпорт (IntersectionObserver) со стаггером. Replay — перезапуск." className="lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[20px] font-extrabold"><SplitReveal key={k} text="Появление по скроллу" by="char" stagger={28} /></div>
        <Btn3D size="xs" variant="neutral" icon={<Icon name="refresh" size={12} />} onClick={() => { setK(k + 1); sfx.whoosh(); }}>Replay</Btn3D>
      </div>
      <div key={k} className="grid grid-cols-3 gap-3">
        {V.map((v, i) => (
          <Reveal key={i} from={v} delay={i * 80}>
            <div className="raised p-3 h-[92px] flex flex-col items-center justify-center gap-1">
              <Glyph name={G[i]} size={30} />
              <span className="num text-[10px] font-extrabold text-mute uppercase">{v}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   9. TILT PARALLAX CARD + GYRO
   ========================================================= */
function TiltCard() {
  const [ref, ptr] = usePointer<HTMLDivElement>();
  const [gyro, setGyro] = useState<{ x: number; y: number } | null>(null);
  const tx = gyro ? gyro.x : ptr.x;
  const ty = gyro ? gyro.y : ptr.y;
  const rx = useSpring(-ty * 14, 150, 15);
  const ry = useSpring(tx * 18, 150, 15);
  const enableGyro = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = (window as any).DeviceOrientationEvent;
    try { if (DOE?.requestPermission) { const r = await DOE.requestPermission(); if (r !== "granted") return; } } catch { return; }
    addEventListener("deviceorientation", (e: DeviceOrientationEvent) => setGyro({ x: clamp((e.gamma ?? 0) / 30, -1, 1), y: clamp(((e.beta ?? 45) - 45) / 30, -1, 1) }));
    sfx.success();
  };
  return (
    <Asset title="Depth Tilt Card" id="scr.tilt" desc="Слои на разной глубине (translateZ) + наклон за курсором со spring. На телефоне — гироскоп.">
      <div ref={ref} className="h-[260px] grid place-items-center" style={{ perspective: 800 }}>
        <div className="relative w-[210px] h-[230px] rounded-[26px]" style={{ transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-[#2a4185] to-[#0f1b3f] border border-white/10 shadow-[0_30px_50px_rgba(0,0,0,.55)]" />
          <div className="absolute inset-3 rounded-[20px] bg-[radial-gradient(circle_at_30%_20%,rgba(141,92,255,.35),transparent_60%)]" style={{ transform: "translateZ(20px)" }} />
          <div className="absolute left-1/2 top-6 -translate-x-1/2" style={{ transform: "translateZ(70px) translateX(-50%)" }}><Glyph name="crown" size={70} /></div>
          <div className="absolute inset-x-4 bottom-5" style={{ transform: "translateZ(45px)" }}>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet">Season Pass</div>
            <div className="font-extrabold text-[20px]">Whale Tier</div>
            <div className="flex gap-1 mt-2">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 flex-1 rounded-full bg-gold" />)}</div>
          </div>
          <div className="absolute inset-0 rounded-[26px] pointer-events-none" style={{ background: `radial-gradient(circle at ${50 + tx * 40}% ${50 + ty * 40}%, rgba(255,255,255,.22), transparent 55%)`, transform: "translateZ(80px)" }} />
        </div>
      </div>
      <Btn3D size="xs" variant={gyro ? "bull" : "neutral"} full onClick={enableGyro} icon={<Icon name="target" size={12} />}>{gyro ? "Gyroscope active" : "Enable gyroscope (mobile)"}</Btn3D>
    </Asset>
  );
}

/* =========================================================
   10. COUNT-ON-VIEW STATS
   ========================================================= */
function CountOnView() {
  const [ref, v] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const S = [
    { v: 2400000, l: "учеников", s: "+", g: "heart" as const },
    { v: 98, l: "% ретеншн D1", s: "%", g: "flame" as const },
    { v: 240, l: "уроков", s: "", g: "star" as const },
    { v: 47, l: "стран", s: "", g: "gem" as const },
  ];
  return (
    <div ref={ref}>
      <Asset title="Count-on-View" id="scr.count" desc="Цифры считаются только при появлении в зоне видимости.">
        <div className="grid grid-cols-2 gap-3">
          {S.map((s, i) => (
            <div key={s.l} className="inset p-3" style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: `all .6s ${i * 100}ms` }}>
              <Glyph name={s.g} size={22} />
              <CountUp value={v ? s.v : 0} className="block text-[22px] font-extrabold mt-1" suffix={s.s} />
              <div className="text-[10.5px] text-dim font-bold uppercase">{s.l}</div>
            </div>
          ))}
        </div>
      </Asset>
    </div>
  );
}

export default function ScrollFX() {
  return (
    <Section id="scroll" index="12" title="Scroll & Parallax" subtitle="Реакция на скролл: параллакс-слои, закреплённые сцены, горизонтальный скролл, отрисовка по прогрессу, clip-reveal, velocity-skew, появления" count={10}>
      <div className="grid lg:grid-cols-3 gap-6">
        <ParallaxScene />
        <ScrollDrawChart />
        <WordHighlight />
        <StickyStory />
        <ClipReveal />
        <VelocitySkew />
        <HorizontalScroll />
        <RevealGallery />
        <TiltCard />
        <CountOnView />
      </div>
    </Section>
  );
}
