import { useEffect, useRef, useState, type ReactNode } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { flash, shake } from "../utils/fx";
import { useInView, usePointer, useRafLoop, useSpring } from "../hooks/motion";

/* =========================================================
   1. MAGNETIC BUTTONS (spring follow)
   ========================================================= */
function Magnetic({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const x = useSpring(t.x, 200, 14);
  const y = useSpring(t.y, 200, 14);
  return (
    <div ref={ref} className="p-5 -m-5 inline-block"
      onPointerMove={(e) => { const r = ref.current!.getBoundingClientRect(); setT({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength }); }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}>
      <div style={{ transform: `translate(${x}px, ${y}px)` }}>
        <div style={{ transform: `translate(${x * 0.35}px, ${y * 0.35}px)` }}>{children}</div>
      </div>
    </div>
  );
}
function MagneticDemo() {
  return (
    <Asset title="Magnetic Buttons" id="mfx.magnetic" desc="Кнопки притягиваются к курсору в радиусе поля, контент смещается сильнее (parallax), пружинный возврат.">
      <div className="h-[200px] flex flex-wrap items-center justify-center gap-6">
        <Magnetic><Btn3D size="lg" variant="bull" icon={<Icon name="play" size={18} />}>Start</Btn3D></Magnetic>
        <Magnetic strength={0.55}><Btn3D round size="xl" variant="violet" className="w-16"><Icon name="crown" size={26} /></Btn3D></Magnetic>
        <Magnetic strength={0.3}><Btn3D size="md" variant="gold">Claim</Btn3D></Magnetic>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. SPOTLIGHT GRID (cursor-following glow + border)
   ========================================================= */
function SpotlightGrid() {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const move = (e: React.PointerEvent) => {
    cards.current.forEach((c) => { if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty("--x", `${e.clientX - r.left}px`); c.style.setProperty("--y", `${e.clientY - r.top}px`); });
  };
  const ITEMS = [["target", "Точность 94%", "за неделю"], ["flame", "Серия 47", "дней подряд"], ["trophy", "Топ-3", "в лиге"], ["bolt", "12 480 XP", "всего"], ["shield", "0 ликвидаций", "с начала"], ["star", "37 уроков", "пройдено"]];
  return (
    <Asset title="Spotlight Grid" id="mfx.spotlight" desc="Прожектор следует за курсором по всей сетке; границы карточек подсвечиваются рядом с курсором." className="lg:col-span-2">
      <div onPointerMove={move} className="grid grid-cols-2 sm:grid-cols-3 gap-3 group/sp">
        {ITEMS.map(([ic, t, s], i) => (
          <div key={t} ref={(e) => { cards.current[i] = e; }} className="relative rounded-2xl p-[1.5px]"
            style={{ background: "radial-gradient(220px circle at var(--x,-100px) var(--y,-100px), rgba(106,157,255,.9), rgba(141,92,255,.3) 40%, rgba(130,160,255,.08) 70%)" }}>
            <div className="relative rounded-[15px] bg-[#101c42] p-4 h-full overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover/sp:opacity-100 transition-opacity" style={{ background: "radial-gradient(260px circle at var(--x) var(--y), rgba(61,123,255,.16), transparent 60%)" }} />
              <Icon name={ic} size={22} className="relative text-[#8fb3ff]" />
              <div className="relative font-extrabold text-[15px] mt-3">{t}</div>
              <div className="relative text-[11px] text-dim font-bold">{s}</div>
            </div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   3. HOLOGRAPHIC CARD
   ========================================================= */
function HoloCard() {
  const [ref, p] = usePointer<HTMLDivElement>();
  const rx = useSpring(-p.y * 16, 170, 15);
  const ry = useSpring(p.x * 20, 170, 15);
  const gx = 50 + p.x * 50, gy = 50 + p.y * 50;
  return (
    <Asset title="Holographic Card" id="mfx.holo" desc="Легендарная карта: радужная фольга и блик смещаются от угла наклона, как у настоящих коллекционных карт." tags={["PRO"]}>
      <div ref={ref} className="h-[300px] grid place-items-center" style={{ perspective: 900 }}>
        <div className="relative w-[200px] h-[280px] rounded-[22px] overflow-hidden" style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${p.hover ? 1.04 : 1})`, transition: "scale .3s", boxShadow: `${-ry}px ${rx + 20}px 40px rgba(0,0,0,.55), 0 0 ${p.hover ? 40 : 0}px rgba(141,92,255,.45)` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a1b9e] via-[#1c3068] to-[#0a1330]" />
          <div className="absolute inset-2 rounded-[16px] border border-white/20" />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center"><span className="text-[10px] font-extrabold uppercase tracking-widest text-gold">Legendary</span><span className="num text-[10px] font-extrabold text-white/70">#001</span></div>
          <div className="absolute inset-x-0 top-14 grid place-items-center"><div className="relative"><div className="absolute -inset-6 rounded-full bg-gold/30 blur-2xl" /><Glyph name="crown" size={96} /></div></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="font-extrabold text-[20px] text-white">Satoshi</div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-center">
              {[["ATK", 99], ["RISK", 12], ["LUCK", 88]].map(([k, v]) => <div key={k as string} className="rounded-lg bg-black/30 py-1"><div className="num text-[12px] font-extrabold">{v}</div><div className="text-[8px] font-extrabold text-white/60">{k}</div></div>)}
            </div>
          </div>
          <div className="absolute inset-0 mix-blend-color-dodge opacity-70 pointer-events-none" style={{ background: `linear-gradient(115deg, transparent 20%, rgba(255,0,170,.55) 36%, rgba(0,255,255,.5) 50%, rgba(255,255,0,.5) 64%, transparent 80%)`, backgroundSize: "250% 250%", backgroundPosition: `${gx}% ${gy}%` }} />
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.75), transparent 45%)` }} />
          <div className="absolute inset-0 pointer-events-none opacity-25" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.2) 0 1px, transparent 1px 6px)" }} />
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. SCRAMBLE / DECRYPT TEXT
   ========================================================= */
const CHARS = "ABCDEF0123456789$#@%&*<>/";
function useScramble(text: string, trigger: number, speed = 1) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let frame = 0, raf = 0;
    const total = text.length * 2.2 / speed + 12;
    const loop = () => {
      frame++;
      const reveal = Math.floor((frame / total) * text.length * 1.25);
      setOut(text.split("").map((c, i) => (i < reveal || c === " " ? c : CHARS[(Math.random() * CHARS.length) | 0])).join(""));
      if (reveal < text.length) raf = requestAnimationFrame(loop);
      else setOut(text);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, trigger, speed]);
  return out;
}
function ScrambleLine({ text, className }: { text: string; className?: string }) {
  const [t, setT] = useState(0);
  const [ref, v] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const out = useScramble(text, t + (v ? 1 : 0));
  return <div ref={ref} onMouseEnter={() => { setT((x) => x + 1); sfx.tick(); }} className={cn("num cursor-default", className)}>{out}</div>;
}
function Scramble() {
  const [n, setN] = useState(0);
  const hashes = ["0x8f3a…c21e", "0x1b7d…9a04", "0x44ce…f7b2", "0xa90f…33d1"];
  return (
    <Asset title="Decrypt Text" id="mfx.scramble" desc="Хеши транзакций расшифровываются символ за символом при появлении и наведении.">
      <div className="inset p-4 space-y-2.5 font-mono">
        <ScrambleLine text="WALLET UNLOCKED" className="text-[18px] font-extrabold text-bull" />
        <ScrambleLine text={`TX ${hashes[n % 4]}`} className="text-[13px] text-mute" key={n} />
        <ScrambleLine text="BLOCK #842,117 CONFIRMED" className="text-[13px] text-cyan" />
        <ScrambleLine text="GAS 12 GWEI · FEE $0.41" className="text-[13px] text-gold" />
      </div>
      <Btn3D size="xs" variant="neutral" className="mt-3" icon={<Icon name="refresh" size={12} />} onClick={() => setN(n + 1)}>New transaction</Btn3D>
    </Asset>
  );
}

/* =========================================================
   5. TYPEWRITER
   ========================================================= */
function Typewriter() {
  const PH = ["Купи на слухах, продай на фактах.", "Тренд — твой друг, пока не кончится.", "Никогда не рискуй тем, что нельзя потерять.", "Лучшая сделка — иногда никакая."];
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.3 });
  useEffect(() => {
    if (!inView) return;
    const full = PH[i];
    const h = setTimeout(() => {
      if (!del) { const n = full.slice(0, txt.length + 1); setTxt(n); if (n.length % 3 === 0) sfx.tick(); if (n === full) setTimeout(() => setDel(true), 1400); }
      else { const n = full.slice(0, txt.length - 1); setTxt(n); if (!n) { setDel(false); setI((i + 1) % PH.length); } }
    }, del ? 22 : 48 + Math.random() * 40);
    return () => clearTimeout(h);
  }, [txt, del, i, inView]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Asset title="Typewriter" id="mfx.typewriter" desc="Цитаты трейдеров печатаются и стираются, мигающая каретка, тихий тик клавиш.">
      <div ref={ref} className="inset p-5 min-h-[130px] flex items-center">
        <p className="text-[19px] font-extrabold leading-snug">
          <span className="text-dim">“</span>{txt}<span className="inline-block w-[3px] h-[1.1em] bg-bull align-middle ml-0.5" style={{ animation: "caret 1s step-end infinite" }} />
        </p>
      </div>
      <div className="flex gap-1.5 mt-3">{PH.map((_, k) => <span key={k} className={cn("h-1.5 flex-1 rounded-full transition-colors", k === i ? "bg-bull" : "bg-[#16275a]")} />)}</div>
    </Asset>
  );
}

/* =========================================================
   6. ODOMETER (rolling digits, live)
   ========================================================= */
export function Odometer({ value, decimals = 2, className }: { value: number; decimals?: number; className?: string }) {
  const s = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span className={cn("inline-flex num leading-none", className)}>
      {s.split("").map((ch, i) => /\d/.test(ch) ? (
        <span key={s.length - i} className="relative inline-block h-[1em] overflow-hidden" style={{ width: "0.62em" }}>
          <span className="absolute left-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(.3,1.35,.5,1)]" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
            {"0123456789".split("").map((d) => <span key={d} className="h-[1em] leading-[1em] text-center">{d}</span>)}
          </span>
        </span>
      ) : <span key={s.length - i + "s"} className="inline-block">{ch}</span>)}
    </span>
  );
}
function OdometerDemo() {
  const [v, setV] = useState(24817.42);
  const [dir, setDir] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });
  useEffect(() => {
    if (!inView) return;
    const h = setInterval(() => { const d = (Math.random() - 0.45) * 380; setDir(Math.sign(d)); setV((x) => Math.max(0, x + d)); }, 1600);
    return () => clearInterval(h);
  }, [inView]);
  return (
    <Asset title="Odometer" id="mfx.odometer" desc="Баланс портфеля: каждая цифра прокатывается барабаном с пружиной; цвет мигает по направлению.">
      <div ref={ref} className="inset p-5 text-center">
        <div className="label-caps">Portfolio value</div>
        <div className={cn("text-[38px] font-extrabold transition-colors duration-500", dir > 0 ? "text-bull" : dir < 0 ? "text-bear" : "")}>$<Odometer value={v} /></div>
        <div className={cn("num text-[12px] font-extrabold mt-1 flex items-center justify-center gap-1", dir >= 0 ? "text-bull" : "text-bear")}><Icon name={dir >= 0 ? "trendUp" : "trendDown"} size={14} />{dir >= 0 ? "+" : "−"}live</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Btn3D size="xs" variant="bear" onClick={() => { setDir(-1); setV((x) => Math.max(0, x - 5000)); sfx.error(); }}>−5k</Btn3D>
        <Btn3D size="xs" variant="neutral" onClick={() => { setDir(0); setV(0); }}>Zero</Btn3D>
        <Btn3D size="xs" variant="bull" onClick={() => { setDir(1); setV((x) => x + 12345.67); sfx.coin(); }}>+12k</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. CONIC NEON BORDER + GRADIENT TEXT
   ========================================================= */
function NeonBorder() {
  const [speed, setSpeed] = useState(4);
  return (
    <Asset title="Neon Conic Border" id="mfx.neon" desc="Вращающаяся коническая рамка + переливающийся градиентный текст. Hover ускоряет вращение.">
      <div className="grid place-items-center py-4">
        <div className="relative w-full max-w-[280px] rounded-3xl p-[2px] overflow-hidden" onMouseEnter={() => setSpeed(1.2)} onMouseLeave={() => setSpeed(4)}>
          <div className="absolute inset-[-100%]" style={{ background: "conic-gradient(from 0deg, transparent 0 60%, #1fdb8b 70%, #2ed3f0 80%, #8d5cff 90%, transparent)", animation: `spin-slow ${speed}s linear infinite` }} />
          <div className="relative rounded-[22px] bg-[#0c1737] p-6 text-center">
            <Badge tone="gold" size="xs">Season 4</Badge>
            <div className="text-[30px] font-extrabold mt-3 bg-gradient-to-r from-bull via-cyan via-50% to-violet bg-clip-text text-transparent" style={{ backgroundSize: "200% 100%", animation: "gradient-x 3s ease infinite" }}>BATTLE PASS</div>
            <div className="text-[12px] text-mute mt-1">50 уровней наград · 14 дней</div>
            <Btn3D size="sm" variant="violet" className="mt-4">Unlock</Btn3D>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   8. MORPHING BLOB
   ========================================================= */
function blobPath(t: number, amp: number, n = 9, r = 64, cx = 100, cy = 100) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r + Math.sin(t * 1.4 + i * 1.7) * amp + Math.cos(t * 0.9 + i * 2.3) * amp * 0.6;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}
function Blob() {
  const [d, setD] = useState(blobPath(0, 6));
  const [hover, setHover] = useState(false);
  const amp = useRef(6);
  const pulse = useRef(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  useRafLoop((_dt, t) => {
    const target = hover ? 16 : 6;
    amp.current += (target - amp.current) * 0.06;
    pulse.current *= 0.93;
    setD(blobPath(t / 1000, amp.current + pulse.current, 9, 64 + pulse.current * 0.8));
  }, inView);
  return (
    <Asset title="Morphing Blob" id="mfx.blob" desc="Органичная форма из сплайнов Catmull-Rom дышит; hover — возбуждение, клик — импульс.">
      <div ref={ref} className="h-[220px] grid place-items-center">
        <svg viewBox="0 0 200 200" className="w-[210px] h-[210px] cursor-pointer" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => { pulse.current = 22; sfx.pop(); haptic(10); }}>
          <defs>
            <linearGradient id="blob-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1fdb8b" /><stop offset=".5" stopColor="#2ed3f0" /><stop offset="1" stopColor="#8d5cff" /></linearGradient>
            <filter id="blob-glow"><feGaussianBlur stdDeviation="8" /></filter>
          </defs>
          <path d={d} fill="url(#blob-g)" opacity=".5" filter="url(#blob-glow)" />
          <path d={d} fill="url(#blob-g)" />
          <path d={d} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" transform="translate(-4 -4) scale(1.04)" style={{ transformOrigin: "100px 100px" }} />
          <text x="100" y="108" textAnchor="middle" fontSize="22" fontWeight="800" fill="#071022">HODL</text>
        </svg>
      </div>
    </Asset>
  );
}

/* =========================================================
   9. LIQUID WAVE PROGRESS
   ========================================================= */
function LiquidProgress() {
  const [v, setV] = useState(62);
  const wave = (y: number) => `M0,${y} Q25,${y - 7} 50,${y} T100,${y} T150,${y} T200,${y} T250,${y} T300,${y} T350,${y} T400,${y} V220 H0 Z`;
  const lvl = 200 - (v / 100) * 200;
  return (
    <Asset title="Liquid Progress" id="mfx.liquid" desc="Прогресс сундука заполняется жидкостью: две волны с разной фазой, уровень анимируется пружиной.">
      <div className="flex flex-col items-center">
        <div className="relative size-[170px] rounded-full border-4 border-[#26397a] overflow-hidden bg-[#0a1330] shadow-[inset_0_6px_14px_rgba(0,0,0,.5),0_6px_0_#0b1536]">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            <g style={{ transform: `translateY(${lvl}px)`, transition: "transform 1s cubic-bezier(.3,1.3,.5,1)" }}>
              <path d={wave(0)} fill="#8d5cff" opacity=".55" style={{ animation: "wave-x 3.2s linear infinite reverse" }} />
              <path d={wave(4)} fill="url(#lq-g)" style={{ animation: "wave-x 2.2s linear infinite" }} />
            </g>
            <defs><linearGradient id="lq-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2ed3f0" /><stop offset="1" stopColor="#3d7bff" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center"><span className="num text-[34px] font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,.4)]">{v}%</span></div>
          <div className="absolute left-6 top-6 w-8 h-14 rounded-full bg-white/15 rotate-[30deg] blur-[1px]" />
        </div>
        <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} className="w-full mt-4 accent-[#2ed3f0]" />
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          {[0, 50, 100].map((n) => <Btn3D key={n} size="xs" variant={n === 100 ? "cyan" : "neutral"} onClick={() => { setV(n); n === 100 ? sfx.levelUp() : sfx.tick(); }}>{n}%</Btn3D>)}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   10. GLITCH LIQUIDATION
   ========================================================= */
function Glitch() {
  const [on, setOn] = useState(false);
  const trigger = () => {
    setOn(true); shake("hard"); flash("rgba(255,77,106,.35)"); sfx.error(); haptic([60, 40, 80]);
    setTimeout(() => setOn(false), 1300);
  };
  return (
    <Asset title="Glitch · Liquidation" id="mfx.glitch" desc="Экстремальное событие: RGB-сдвиг, clip-срезы, сканлайн, тряска экрана и красная вспышка.">
      <div className={cn("relative h-[170px] rounded-2xl overflow-hidden grid place-items-center transition-colors", on ? "bg-[#2a0a16]" : "inset")}>
        {on && <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" style={{ animation: "scan 0.6s linear infinite" }} />}
        <div className="text-center">
          <span className={cn("text-[34px] font-extrabold tracking-tight", on ? "glitch text-bear" : "text-dim")} data-text="LIQUIDATED">LIQUIDATED</span>
          <div className={cn("num text-[13px] font-extrabold mt-1", on ? "text-bear" : "text-dim")}>{on ? "−100.00% · 100x LONG" : "позиция в безопасности"}</div>
        </div>
      </div>
      <Btn3D size="sm" variant="bear" full className="mt-3" onClick={trigger} icon={<Icon name="warning" size={15} />}>Simulate 100x liquidation</Btn3D>
    </Asset>
  );
}

/* =========================================================
   11. CURSOR TRAIL CANVAS
   ========================================================= */
function CursorTrail() {
  const cv = useRef<HTMLCanvasElement>(null);
  const pts = useRef<{ x: number; y: number; t: number }[]>([]);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  useRafLoop(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    const now = performance.now();
    pts.current = pts.current.filter((p) => now - p.t < 600);
    const arr = pts.current;
    for (let i = 1; i < arr.length; i++) {
      const k = 1 - (now - arr[i].t) / 600;
      ctx.strokeStyle = `hsla(${150 + i * 3}, 90%, 60%, ${k})`;
      ctx.lineWidth = 2 + k * 12;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(arr[i - 1].x, arr[i - 1].y); ctx.lineTo(arr[i].x, arr[i].y); ctx.stroke();
    }
    if (arr.length) {
      const l = arr[arr.length - 1];
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 26);
      g.addColorStop(0, "rgba(46,211,240,.6)"); g.addColorStop(1, "rgba(46,211,240,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, 26, 0, 7); ctx.fill();
    }
  }, inView);
  return (
    <Asset title="Cursor Trail" id="mfx.trail" desc="Проведите пальцем/курсором — неоновый след на canvas с затуханием и сменой оттенка.">
      <div ref={ref} className="relative h-[200px] inset !rounded-2xl overflow-hidden touch-none">
        <canvas ref={cv} className="absolute inset-0 w-full h-full"
          onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); pts.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); }} />
        <div className="absolute inset-0 grid place-items-center pointer-events-none text-dim text-[12px] font-bold">Рисуйте здесь</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   12. STARFIELD WARP (hold to boost)
   ========================================================= */
function Warp() {
  const cv = useRef<HTMLCanvasElement>(null);
  const stars = useRef(Array.from({ length: 220 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() })));
  const speed = useRef(0.2);
  const [boost, setBoost] = useState(false);
  const [spd, setSpd] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  useRafLoop((dt) => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; }
    const W = c.width, H = c.height;
    speed.current += ((boost ? 3.2 : 0.2) - speed.current) * 0.05;
    ctx.fillStyle = `rgba(5,10,24,${boost ? 0.25 : 0.5})`;
    ctx.fillRect(0, 0, W, H);
    for (const s of stars.current) {
      const pz = s.z;
      s.z -= speed.current * dt;
      if (s.z <= 0.01) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; continue; }
      const sx = W / 2 + (s.x / s.z) * W * 0.5, sy = H / 2 + (s.y / s.z) * H * 0.5;
      const px = W / 2 + (s.x / pz) * W * 0.5, py = H / 2 + (s.y / pz) * H * 0.5;
      const k = 1 - s.z;
      ctx.strokeStyle = `rgba(${150 + k * 100},${190 + k * 60},255,${k})`;
      ctx.lineWidth = k * 2.4 * dpr;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
    }
    setSpd(speed.current);
  }, inView);
  return (
    <Asset title="Warp Speed" id="mfx.warp" desc="Удерживайте — «полёт на луну»: звёзды растягиваются в линии, скорость разгоняется и плавно гаснет.">
      <div ref={ref} className="relative h-[200px] rounded-2xl overflow-hidden bg-[#050a18] select-none touch-none cursor-pointer"
        onPointerDown={() => { setBoost(true); sfx.whoosh(); haptic(20); }} onPointerUp={() => setBoost(false)} onPointerLeave={() => setBoost(false)}>
        <canvas ref={cv} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center" style={{ transform: `scale(${1 + spd * 0.08})` }}>
            <Glyph name="rocket" size={46} className={boost ? "anim-wiggle" : "anim-float"} />
            <div className="num text-[12px] font-extrabold mt-1 text-white/80">{(spd * 1000).toFixed(0)} km/s</div>
          </div>
        </div>
        <div className="absolute bottom-2 inset-x-0 text-center text-[10.5px] font-extrabold text-white/50">{boost ? "TO THE MOON 🚀" : "hold to boost"}</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   13. RIPPLE DOT GRID
   ========================================================= */
function RippleGrid() {
  const C = 14, R = 8;
  const [o, setO] = useState<{ x: number; y: number; id: number } | null>(null);
  return (
    <Asset title="Ripple Dot Grid" id="mfx.ripple" desc="Клик по точке запускает волну по сетке: задержка каждой точки = расстояние до эпицентра." className="lg:col-span-2">
      <div className="inset p-5 grid gap-y-4 justify-center" style={{ gridTemplateColumns: `repeat(${C}, minmax(0, 28px))` }}>
        {Array.from({ length: C * R }).map((_, i) => {
          const x = i % C, y = Math.floor(i / C);
          const d = o ? Math.hypot(x - o.x, y - o.y) : 0;
          return (
            <button key={o ? `${o.id}-${i}` : i} onClick={() => { setO({ x, y, id: Date.now() }); sfx.pop(); haptic(8); }} className="grid place-items-center h-4" aria-label="dot">
              <span className="size-2 rounded-full bg-[#2f4890] block" style={{ animation: o ? `dot-wave .7s ${d * 55}ms ease-out` : undefined }} />
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

export default function MotionFX() {
  return (
    <Section id="motionfx" index="13" title="Motion FX" subtitle="13 интерактивных эффектов: магнит, прожектор, голограмма, расшифровка, печать, одометр, неон, морфинг, жидкость, glitch, след, варп, волна" count={13}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SpotlightGrid />
        <HoloCard />
        <MagneticDemo />
        <Scramble />
        <Typewriter />
        <OdometerDemo />
        <NeonBorder />
        <Blob />
        <LiquidProgress />
        <Glitch />
        <CursorTrail />
        <Warp />
        <RippleGrid />
      </div>
    </Section>
  );
}
