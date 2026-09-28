import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton } from "../game/Device";
import { ART, type ArtKey, GemArt, CoinArt, TrophyArt } from "../game/art";
import { sfx, Pop } from "../game/Juice";

/* ================================================================== */
/*  POLISH — micro-interaction laboratory                               */
/*  magnetic · tilt · cursor trail · scroll progress · marquee ·        */
/*  counters · shimmer · press physics · stagger · elastic              */
/* ================================================================== */

/* ---------------- magnetic button ---------------- */
function MagneticDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14 });
  const sy = useSpring(y, { stiffness: 220, damping: 14 });
  const [clicks, setClicks] = useState(0);
  return (
    <div ref={ref} className="grid min-h-[190px] place-items-center overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[radial-gradient(circle_at_50%_40%,#16234a,#070d1c_75%)]" onMouseMove={(e) => {
      const r = ref.current!.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
      y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
    }} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ x: sx, y: sy }} className="relative">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => { setClicks((c) => c + 1); sfx("pop"); }}
          className="relative h-[72px] w-[190px] overflow-hidden rounded-2xl font-[family-name:var(--font-display)] text-[15px] font-bold uppercase tracking-wider"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #fff), var(--accent))", color: "var(--accent-ink)", boxShadow: "0 6px 0 var(--accent-edge), 0 20px 30px -12px var(--accent-glow)" }}
        >
          <span className="pointer-events-none absolute inset-x-4 top-1.5 h-[30%] rounded-full bg-white/30" />
          <span className="relative">Magnetic · {clicks}</span>
        </motion.button>
        <span className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-40 blur-2xl" style={{ background: "var(--accent-glow)" }} />
      </motion.div>
      <span className="absolute bottom-2 font-mono text-[8px] uppercase tracking-widest text-ink-500">spring 220·14 · pull 0.28</span>
    </div>
  );
}

/* ---------------- 3d tilt gallery ---------------- */
function TiltDemo() {
  const cards: { a: ArtKey; t: string; c: string }[] = [
    { a: "gem", t: "Prism", c: "#38e1ff" },
    { a: "trophy", t: "Champion", c: "#ffc24b" },
    { a: "coin", t: "Mint", c: "#2be08a" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2" style={{ perspective: 900 }}>
      {cards.map((cd) => {
        const A = ART[cd.a];
        return <TiltCard key={cd.t} title={cd.t} color={cd.c} art={<A size={52} />} />;
      })}
    </div>
  );
}

function TiltCard({ title, color, art }: { title: string; color: string; art: React.ReactNode }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        setT({ x: (px - 0.5) * 22, y: -(py - 0.5) * 22 });
        setGlare({ x: px * 100, y: py * 100 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      animate={{ rotateY: t.x, rotateX: t.y }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      whileHover={{ scale: 1.04 }}
      className="relative overflow-hidden rounded-2xl border-2 p-3 text-center"
      style={{ borderColor: `${color}55`, background: `linear-gradient(165deg, ${color}1f, #0d1528 70%)`, transformStyle: "preserve-3d", boxShadow: "0 10px 24px -12px #000" }}
    >
      <span className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,.22), transparent 55%)` }} />
      <span className="relative block" style={{ transform: "translateZ(30px)" }}>{art}</span>
      <span className="relative mt-1 block text-[11px] font-extrabold text-white" style={{ transform: "translateZ(20px)" }}>{title}</span>
      <span className="relative font-mono text-[8px] uppercase tracking-widest" style={{ color, transform: "translateZ(14px)" as unknown as string }}>tilt · glare</span>
    </motion.div>
  );
}

/* ---------------- cursor trail ---------------- */
function TrailDemo() {
  const wrap = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<{ id: number; x: number; y: number; c: string }[]>([]);
  const colors = ["#2be08a", "#38e1ff", "#9b6bff", "#ffc24b", "#ff4d6a"];
  const id = useRef(0);
  return (
    <div
      ref={wrap}
      onMouseMove={(e) => {
        const r = wrap.current!.getBoundingClientRect();
        const d = { id: id.current++, x: e.clientX - r.left, y: e.clientY - r.top, c: colors[Math.floor(Math.random() * colors.length)] };
        setDots((p) => [...p.slice(-26), d]);
        setTimeout(() => setDots((p) => p.filter((x) => x.id !== d.id)), 700);
      }}
      className="relative h-[190px] cursor-crosshair overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c]"
    >
      <span className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">move your cursor</span>
      {dots.map((d) => (
        <motion.span key={d.id} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 0, opacity: 0, y: -18 }} transition={{ duration: 0.7 }} className="absolute h-3 w-3 rounded-full" style={{ left: d.x - 6, top: d.y - 6, background: d.c, boxShadow: `0 0 12px ${d.c}` }} />
      ))}
    </div>
  );
}

/* ---------------- scroll progress bar ---------------- */
function ScrollDemo() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  return (
    <div className="space-y-3">
      <div className="relative h-3 overflow-hidden rounded-full bg-[#0a1122]">
        <motion.div style={{ scaleX }} className="h-full w-full origin-left rounded-full" />
        <style>{`.origin-left{background:linear-gradient(90deg,var(--accent),#38e1ff,#9b6bff)}`}</style>
      </div>
      <motion.div style={{ y }} className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-16 rounded-xl border-2 border-[#1c2c52] bg-[#0d1528]"
            animate={{ y: [0, -6 - i * 2, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">page scroll → spring bar + parallax</div>
    </div>
  );
}

/* ---------------- animated counters ---------------- */
function CounterDemo() {
  const [v, setV] = useState(12840);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * 320)), 130);
    return () => clearInterval(id);
  }, [run]);
  return (
    <div className="space-y-3 text-center">
      <div className="rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] py-4">
        <Pop value={v.toLocaleString("en-US")} className="tnum font-mono text-[32px] font-black text-white" />
        <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-ink-500">portfolio value · live tick</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GameButton size="md" tone={run ? "ghost" : "bull"} onClick={() => { setRun(!run); sfx("select"); }}>{run ? "Pause" : "Stream"}</GameButton>
        <GameButton size="md" tone="ghost" onClick={() => { setV(12840); sfx("pop"); }}>Reset</GameButton>
      </div>
    </div>
  );
}

/* ---------------- shimmer buttons ---------------- */
function ShimmerDemo() {
  return (
    <div className="space-y-2.5">
      {(
        [
          ["Claim reward", "gold"],
          ["Continue", "accent"],
          ["Unlock pro", "violet"],
        ] as const
      ).map(([t, tone]) => (
        <div key={t} className="shine relative">
          <GameButton tone={tone} onClick={() => sfx("coin")}>{t}</GameButton>
        </div>
      ))}
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">shine sweep 3.4s · infinite</div>
    </div>
  );
}

/* ---------------- stagger list ---------------- */
function StaggerDemo() {
  const [key, setKey] = useState(0);
  const items = ["Connect wallet", "Verify identity", "Fund demo $10k", "Place first trade", "Set stop-loss", "Review PnL"];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">onboarding checklist</span>
        <button type="button" onClick={() => { setKey((k) => k + 1); sfx("whoosh"); }} className="font-mono text-[9px] uppercase tracking-widest text-ink-400 hover:text-white">↻ replay</button>
      </div>
      <div key={key} className="space-y-1.5">
        {items.map((t, i) => (
          <motion.div key={t} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.09, type: "spring", stiffness: 300, damping: 22 }} className="flex items-center gap-2.5 rounded-xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.09, type: "spring", stiffness: 400, damping: 12 }} className="grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] font-black" style={{ background: i < 3 ? "#2be08a" : "#1a2745", color: i < 3 ? "#02150b" : "#5f6f96" }}>
              {i < 3 ? <Icon name="check" size={12} strokeWidth={4} /> : i + 1}
            </motion.span>
            <span className={cn("text-[12px] font-bold", i < 3 ? "text-ink-500 line-through" : "text-ink-200")}>{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- elastic tabs ---------------- */
function ElasticTabs() {
  const tabs = ["Overview", "Trades", "Rewards"];
  const [a, setA] = useState(0);
  return (
    <div className="space-y-3">
      <div className="relative flex gap-1 rounded-2xl bg-[#070d1c] p-1.5" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.6)" }}>
        {tabs.map((t, i) => (
          <button key={t} type="button" onClick={() => { setA(i); sfx("select"); }} className={cn("relative z-10 flex-1 py-2.5 font-mono text-[10px] font-black uppercase tracking-widest transition-colors", a === i ? "text-[#02150b]" : "text-ink-500")}>
            {a === i && (
              <motion.span layoutId="elastic-pill" transition={{ type: "spring", stiffness: 380, damping: 26 }} className="absolute inset-0 -z-10 rounded-xl" style={{ background: "var(--accent)", boxShadow: "0 3px 0 var(--accent-edge)" }} />
            )}
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={a} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.2 }} className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-4 text-center">
          <div className="font-[family-name:var(--font-display)] text-[18px] font-bold text-white">{["$24,802 portfolio", "148 trades · 68% win", "12 rewards ready"][a]}</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-500">elastic pill · layoutId spring</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- press physics lab ---------------- */
function PressLab() {
  const depths = [2, 4, 6, 9];
  const [d, setD] = useState(6);
  return (
    <div className="space-y-3 text-center">
      <motion.button
        type="button"
        whileTap={{ y: d, boxShadow: "0 0px 0 #0f7048" }}
        onClick={() => sfx("pop")}
        className="h-[64px] w-full rounded-2xl font-[family-name:var(--font-display)] text-[16px] font-bold uppercase tracking-wider text-[#02150b]"
        style={{ background: "linear-gradient(180deg,#5cf0ab,#2be08a 50%,#18b06a)", boxShadow: `0 ${d}px 0 #0f7048, 0 ${d + 8}px ${d + 10}px -10px rgba(43,224,138,.5)` }}
      >
        Press me · {d}px
      </motion.button>
      <div className="flex gap-1.5">
        {depths.map((x) => (
          <button key={x} type="button" onClick={() => setD(x)} className={cn("flex-1 rounded-xl border-2 py-2 font-mono text-[11px] font-black", d === x ? "border-bull text-bull" : "border-[#22355e] text-ink-500")}>{x}px</button>
        ))}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">depth = shadow + travel distance</div>
    </div>
  );
}

/* ---------------- marquee ---------------- */
function MarqueeDemo() {
  const row = ["BTC +2.1%", "ETH +1.0%", "SOL −0.8%", "GOLD +0.4%", "SPX +0.9%", "DOGE +6.2%"];
  return (
    <div className="space-y-2.5">
      {[0, 1].map((r) => (
        <div key={r} className="mask-fade-r overflow-hidden rounded-xl bg-[#070d1c] py-2.5" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.6)" }}>
          <div className={cn("flex w-max gap-6 px-3", r === 0 ? "ticker-track" : "ticker-track")} style={r === 1 ? { animationDirection: "reverse", animationDuration: "18s" } : undefined}>
            {[...row, ...row, ...row].map((t, i) => (
              <span key={i} className={cn("tnum whitespace-nowrap font-mono text-[11px] font-black", t.includes("−") ? "text-bear" : "text-bull")}>{t}</span>
            ))}
          </div>
        </div>
      ))}
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">dual-lane · 26s / 18s reverse</div>
    </div>
  );
}

/* ---------------- number ticker ---------------- */
function TickerNum() {
  const [n, setN] = useState(68412.55);
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + (Math.random() - 0.48) * 42), 900);
    return () => clearInterval(id);
  }, []);
  const str = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-4 text-center" style={{ boxShadow: "inset 0 3px 8px rgba(0,0,0,.6)" }}>
      <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-ink-500">btc/usdt · rolling digits</div>
      <div className="mt-1 flex justify-center gap-[2px] overflow-hidden">
        {str.split("").map((ch, i) => (
          <span key={i} className="relative inline-block h-[34px] w-[16px] overflow-hidden rounded-md bg-[#0d1528] font-mono text-[20px] font-black text-white">
            <AnimatePresence mode="popLayout">
              <motion.span key={ch} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 grid place-items-center">
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- heartbeat ---------------- */
function HeartbeatDemo() {
  const [bpm, setBpm] = useState(72);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <motion.span animate={{ scale: [1, 1.25, 1, 1.18, 1] }} transition={{ duration: 60 / bpm, repeat: Infinity }} className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "linear-gradient(180deg,#ff8fa2,#d61f42)", boxShadow: "0 4px 0 #8e0f2c" }}>
          <Icon name="heart" size={30} strokeWidth={2.2} className="text-[#1c0309]" />
        </motion.span>
        <div>
          <Pop value={bpm} className="tnum font-mono text-[34px] font-black leading-none text-bear" />
          <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-ink-500">bpm · market pulse</div>
        </div>
      </div>
      <input type="range" min={40} max={160} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full" />
    </div>
  );
}

/* ---------------- coin flip ---------------- */
function CoinFlip() {
  const [side, setSide] = useState<"H" | "T">("H");
  const [spinning, setSpinning] = useState(false);
  const [rot, setRot] = useState(0);
  const flip = () => {
    if (spinning) return;
    setSpinning(true);
    sfx("coin");
    const win = Math.random() > 0.5 ? "H" : "T";
    const turns = 5 + Math.floor(Math.random() * 3);
    const target = rot + turns * 360 + (win === "H" ? 0 : 180);
    setRot(target);
    setTimeout(() => {
      setSide(win);
      setSpinning(false);
      sfx(win === "H" ? "correct" : "pop");
    }, 1400);
  };
  return (
    <div className="flex flex-col items-center gap-3 py-2" style={{ perspective: 700 }}>
      <motion.div animate={{ rotateY: rot }} transition={{ duration: 1.4, ease: [0.15, 0.8, 0.2, 1] }} className="relative h-[110px] w-[110px]" style={{ transformStyle: "preserve-3d" }}>
        <div className="backface-hidden absolute inset-0 grid place-items-center rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff4c2, #ffcf5a 45%, #b8741a)", boxShadow: "0 6px 0 #7a4b08, inset 0 2px 0 rgba(255,255,255,.6)" }}>
          <span className="font-[family-name:var(--font-display)] text-[44px] font-bold text-[#5a3505]">₿</span>
        </div>
        <div className="backface-hidden absolute inset-0 grid place-items-center rounded-full" style={{ transform: "rotateY(180deg)", background: "radial-gradient(circle at 35% 30%, #c4f8ff, #38e1ff 45%, #0b6f8d)", boxShadow: "0 6px 0 #084a5e, inset 0 2px 0 rgba(255,255,255,.6)" }}>
          <TrophyArt size={52} />
        </div>
      </motion.div>
      <div className="font-mono text-[11px] font-black uppercase tracking-widest text-ink-300">landed: <span style={{ color: "var(--accent)" }}>{side === "H" ? "bitcoin" : "trophy"}</span></div>
      <div className="w-full max-w-[220px]">
        <GameButton size="md" tone="gold" onClick={flip}>{spinning ? "Spinning…" : "Flip coin"}</GameButton>
      </div>
    </div>
  );
}

/* ---------------- progress steps morph ---------------- */
function StepsMorph() {
  const [s, setS] = useState(1);
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <motion.button
              type="button"
              onClick={() => { setS(i); sfx("select"); }}
              animate={{ scale: s === i ? 1.15 : 1 }}
              className="grid h-10 w-10 place-items-center rounded-full font-mono text-[13px] font-black"
              style={{
                background: i <= s ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #fff), var(--accent))" : "#1a2745",
                color: i <= s ? "var(--accent-ink)" : "#5f6f96",
                boxShadow: `0 3px 0 ${i <= s ? "var(--accent-edge)" : "#0a1122"}`,
              }}
            >
              {i < s ? <Icon name="check" size={15} strokeWidth={4} /> : i + 1}
            </motion.button>
            {i < 3 && (
              <div className="relative mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-[#0a1122]">
                <motion.div animate={{ width: i < s ? "100%" : "0%" }} className="h-full rounded-full" style={{ background: "var(--accent)" }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-[#0d1528] p-2.5 text-center font-mono text-[10px] text-ink-400">
        step {s + 1}/4 · <button type="button" onClick={() => setS((v) => (v + 1) % 4)} className="font-black uppercase" style={{ color: "var(--accent)" }}>advance →</button>
      </div>
    </div>
  );
}

/* ---------------- art chips ---------------- */
function ArtChips() {
  const arts: ArtKey[] = ["gem", "coin", "flame", "trophy", "crown", "rocket"];
  const [sel, setSel] = useState(0);
  return (
    <div className="flex flex-wrap gap-2">
      {arts.map((a, i) => {
        const A = ART[a];
        return (
          <motion.button
            key={a}
            type="button"
            whileHover={{ y: -3, rotate: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setSel(i); sfx("pop"); }}
            className="flex items-center gap-1.5 rounded-2xl border-2 px-2.5 py-2"
            style={{ borderColor: sel === i ? "var(--accent)" : "#22355e", background: sel === i ? "color-mix(in srgb, var(--accent) 12%, #101a33)" : "#101a33", boxShadow: "0 3px 0 #0a1328" }}
          >
            <A size={26} />
            <span className="font-mono text-[9px] font-black uppercase" style={{ color: sel === i ? "var(--accent)" : "#7d8db4" }}>{a}</span>
          </motion.button>
        );
      })}
      <div className="flex w-full items-center gap-2 rounded-xl bg-[#0d1528] p-2">
        <GemArt size={20} /><CoinArt size={20} />
        <span className="font-mono text-[9px] text-ink-500">registry-driven chips · {arts[sel]} selected</span>
      </div>
    </div>
  );
}

export default function Polish() {
  return (
    <Section id="polish" index="" title="Polish Lab" kicker="Micro-interactions · the 99-point details" count="15 systems">
      <Grid>
        <Cell title="Magnetic Button" spec="spring 220·14" span="col-span-2 md:col-span-2 lg:col-span-2">
          <MagneticDemo />
        </Cell>
        <Cell title="3D Tilt + Glare" spec="translateZ layers" span="col-span-2 md:col-span-2 lg:col-span-2">
          <TiltDemo />
        </Cell>
        <Cell title="Cursor Trail" spec="26 particles" span="col-span-2 md:col-span-2 lg:col-span-2">
          <TrailDemo />
        </Cell>
        <Cell title="Scroll Progress" spec="spring + parallax" span="col-span-2 md:col-span-2 lg:col-span-2">
          <ScrollDemo />
        </Cell>
        <Cell title="Live Counters" spec="tick 130ms" span="col-span-2 md:col-span-2 lg:col-span-2">
          <CounterDemo />
        </Cell>
        <Cell title="Shimmer CTAs" spec="sweep 3.4s" span="col-span-2 md:col-span-2 lg:col-span-2">
          <ShimmerDemo />
        </Cell>
        <Cell title="Staggered Checklist" spec="90ms cascade" span="col-span-2 md:col-span-2 lg:col-span-2">
          <StaggerDemo />
        </Cell>
        <Cell title="Elastic Tabs" spec="layoutId" span="col-span-2 md:col-span-2 lg:col-span-2">
          <ElasticTabs />
        </Cell>
        <Cell title="Press Physics" spec="2–9px depth" span="col-span-2 md:col-span-2 lg:col-span-2">
          <PressLab />
        </Cell>
        <Cell title="Dual Marquee" spec="26s + 18sR" span="col-span-2 md:col-span-2 lg:col-span-2">
          <MarqueeDemo />
        </Cell>
        <Cell title="Rolling Digits" spec="spring digits" span="col-span-2 md:col-span-2 lg:col-span-2">
          <TickerNum />
        </Cell>
        <Cell title="Heartbeat" spec="40–160 bpm" span="col-span-2 md:col-span-2 lg:col-span-2">
          <HeartbeatDemo />
        </Cell>
        <Cell title="Coin Flip 3D" spec="1.4s ease" span="col-span-2 md:col-span-2 lg:col-span-2">
          <CoinFlip />
        </Cell>
        <Cell title="Steps Morph" spec="fill + pop" span="col-span-2 md:col-span-2 lg:col-span-2">
          <StepsMorph />
        </Cell>
        <Cell title="Art Chips" spec="registry" span="col-span-2 md:col-span-4 lg:col-span-4">
          <ArtChips />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">springs everywhere</Tag>
        <Tag tone="gold">glare + tilt</Tag>
        <Tag tone="violet">layoutId pills</Tag>
        <Tag>rolling numbers</Tag>
      </div>
    </Section>
  );
}
