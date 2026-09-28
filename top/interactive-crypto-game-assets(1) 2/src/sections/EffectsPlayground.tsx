/* ------------------------------------------------------------------
 * 22 · EFFECTS PLAYGROUND — every effect type, fully interactive
 * ------------------------------------------------------------------ */
import {
  AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform,
  type PanInfo,
} from "framer-motion";
import {
  ChevronLeft, ChevronRight, Flame, Gem, Layers, MousePointer2, Move,
  Sparkles, Waves, Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, Tag } from "../components/ui";
import {
  Magnetic, Odometer, ParticleField, Reveal, RippleButton,
  ScrambleText, ShineBorder, SplitText, Spotlight, Stagger, Tilt,
  Typewriter, VelocityMarquee, useBurst, useFloaters,
} from "../fx/effects";
import { GameSection, SnapRail } from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const slides = Array.from({ length: 12 }, (_, i) => ({
  t: ["BTC Pulse", "ETH Wave", "SOL Beam", "Risk Lab", "Whale Radar", "Duel Cup", "Boss Fight", "Daily Chest", "League", "Merge", "Rhythm", "Raid"][i],
  c: ["#F7931A", "#627EEA", "#14F195", "#5b8cff", "#0098EA", "#ff5470", "#ff8b3d", "#ffc531", "#9ff5ff", "#14c8f5", "#8ef23c", "#a78bff"][i],
}));

function FadeCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x + 1) % slides.length), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-[180px] overflow-hidden rounded-[22px] border border-white/15">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55 }} className="absolute inset-0 flex flex-col justify-end p-5"
          style={{ background: `linear-gradient(135deg, ${slides[i].c}55, #050c22 70%)` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: slides[i].c }}>Fade · auto</p>
          <p className="display text-2xl font-extrabold text-white">{slides[i].t}</p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 right-3 flex gap-1">
        {slides.slice(0, 6).map((_, k) => (
          <button key={k} onClick={() => setI(k)} className={cn("h-1.5 rounded-full", k === i % 6 ? "w-5 bg-white" : "w-1.5 bg-white/30")} />
        ))}
      </div>
    </div>
  );
}

function CubeCarousel() {
  const [i, setI] = useState(0);
  const n = 6;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[160px] w-full" style={{ perspective: 900 }}>
        {slides.slice(0, n).map((s, k) => {
          let off = k - i;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          return (
            <motion.div key={s.t} className="absolute left-1/2 top-1/2 flex h-[120px] w-[140px] -ml-[70px] -mt-[60px] items-center justify-center rounded-2xl border border-white/20 text-sm font-extrabold text-white"
              animate={{ rotateY: off * -55, z: -Math.abs(off) * 80, x: off * 90, opacity: Math.abs(off) > 2 ? 0 : 1, scale: off === 0 ? 1 : 0.85 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              style={{ background: `linear-gradient(160deg, ${s.c}, #081130)`, boxShadow: "0 6px 0 #030816", zIndex: 10 - Math.abs(off) }}
              onClick={() => { setI(k); sfx.swipe(); }}>
              {s.t}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setI(x => (x - 1 + n) % n)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl"><ChevronLeft size={16} /></button>
        <button onClick={() => setI(x => (x + 1) % n)} className="btn3d btn3d-green h-9 w-9 !rounded-xl"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function VerticalSnap() {
  const items = slides.slice(0, 8);
  return (
    <div className="no-scrollbar h-[220px] snap-y snap-mandatory overflow-y-auto rounded-[20px] border border-white/10">
      {items.map(s => (
        <div key={s.t} className="flex h-[220px] snap-center flex-col justify-center p-5" style={{ background: `linear-gradient(180deg, ${s.c}33, #081130)` }}>
          <p className="display text-xl font-extrabold text-white">{s.t}</p>
          <p className="text-xs text-[#aebde6]">Vertical snap · scroll inside</p>
        </div>
      ))}
    </div>
  );
}

function DragFreeCarousel() {
  const x = useMotionValue(0);
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 p-2">
      <motion.div className="flex cursor-grab gap-3 active:cursor-grabbing" style={{ x }} drag="x" dragConstraints={{ left: -900, right: 0 }} onDragEnd={() => sfx.swipe()}>
        {slides.map(s => (
          <div key={s.t} className="h-[120px] w-[160px] shrink-0 rounded-2xl border border-white/15 p-3" style={{ background: `linear-gradient(160deg, ${s.c}44, #0b1a42)`, boxShadow: "0 4px 0 #030816" }}>
            <p className="display text-sm font-extrabold text-white">{s.t}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function MultiThumb() {
  const [a, setA] = useState(0.2);
  const [b, setB] = useState(0.5);
  const [c, setC] = useState(0.8);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<"a" | "b" | "c" | null>(null);
  const move = (clientX: number) => {
    const r = track.current?.getBoundingClientRect(); if (!r || !drag.current) return;
    const v = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    if (drag.current === "a") setA(Math.min(v, b - 0.05));
    if (drag.current === "b") setB(Math.min(c - 0.05, Math.max(a + 0.05, v)));
    if (drag.current === "c") setC(Math.max(v, b + 0.05));
  };
  return (
    <div>
      <div ref={track} className="relative h-10 touch-none"
        onPointerMove={e => move(e.clientX)}
        onPointerUp={() => { drag.current = null; }}
        onPointerDown={e => {
          const r = track.current!.getBoundingClientRect();
          const v = (e.clientX - r.left) / r.width;
          const dA = Math.abs(v - a), dB = Math.abs(v - b), dC = Math.abs(v - c);
          drag.current = dA < dB && dA < dC ? "a" : dB < dC ? "b" : "c";
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          move(e.clientX);
        }}>
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#050b21]" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.7)" }} />
        <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#8ef23c] via-[#5b8cff] to-[#a78bff]" style={{ left: `${a * 100}%`, width: `${(c - a) * 100}%` }} />
        {([[a, "#8ef23c"], [b, "#5b8cff"], [c, "#a78bff"]] as const).map(([v, col], i) => (
          <div key={i} className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${v * 100}%`, background: col, boxShadow: `0 4px 0 #030816, 0 0 12px ${col}` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-extrabold text-[#8ea6d8]">
        <span>TP {Math.round(a * 100)}</span><span>Entry {Math.round(b * 100)}</span><span>SL {Math.round(c * 100)}</span>
      </div>
    </div>
  );
}

function VerticalParallaxSlider() {
  const [v, setV] = useState(0.4);
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[160px] w-12 touch-none rounded-full bg-[#050b21]" style={{ boxShadow: "inset 0 3px 8px rgba(0,0,0,.8)" }}
        onPointerDown={e => {
          const r = e.currentTarget.getBoundingClientRect();
          const move = (clientY: number) => setV(Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height)));
          move(e.clientY);
          const up = () => { window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", up); };
          const pm = (ev: PointerEvent) => move(ev.clientY);
          window.addEventListener("pointermove", pm); window.addEventListener("pointerup", up);
        }}>
        <motion.div className="absolute inset-x-1 bottom-1 rounded-full bg-gradient-to-t from-[#ffc531] to-[#ff8b3d]" animate={{ height: `${v * 100}%` }} />
        <motion.div className="absolute left-1/2 h-4 w-10 -translate-x-1/2 rounded-md bg-white" animate={{ bottom: `calc(${v * 100}% - 8px)` }} style={{ boxShadow: "0 3px 0 #030816" }} />
      </div>
      <div>
        <p className="num-mono text-3xl font-extrabold text-[#ffc531]">{Math.round(v * 100)}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7d92c4]">Conviction</p>
      </div>
    </div>
  );
}

function ScrollStoryMini() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const o = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  return (
    <div ref={ref} className="relative h-[280px] overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-[#0e2152] to-[#050c22]">
      <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-40"><ParticleField count={40} color="91,140,255" link={false} /></motion.div>
      <motion.div style={{ y: y1, rotate: rot, opacity: o }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="display text-3xl font-extrabold text-white">Scroll-linked</p>
        <p className="text-sm text-[#9fb2dd]">Слои едут с разной скоростью</p>
      </motion.div>
    </div>
  );
}

function HorizontalScrollMini() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);
  return (
    <div ref={ref} className="h-[180vh]">
      <div className="sticky top-24 overflow-hidden rounded-[24px] border border-white/10 bg-[#081130] py-6">
        <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-[#8ea6d8]">Horizontal from vertical scroll</p>
        <motion.div style={{ x }} className="flex gap-4 px-4">
          {slides.map(s => (
            <div key={s.t} className="h-[160px] w-[220px] shrink-0 rounded-[22px] border border-white/15 p-4" style={{ background: `linear-gradient(160deg, ${s.c}55, #0b1a42)`, boxShadow: "0 6px 0 #030816" }}>
              <p className="display text-lg font-extrabold text-white">{s.t}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function StackSwipeMini() {
  const [items, setItems] = useState(["Long BTC", "Short ETH", "Hedge SOL", "DCA TON", "Close ALL"]);
  const swipe = () => {
    sfx.swipe();
    setItems(it => it.slice(1).length ? it.slice(1) : ["Long BTC", "Short ETH", "Hedge SOL"]);
  };
  return (
    <div className="relative h-[200px]">
      {items.slice(0, 3).map((t, i) => (
        <motion.div key={t + i} className="absolute inset-x-0 top-0 h-[160px] rounded-[22px] border border-white/15 bg-gradient-to-b from-[#1b3773] to-[#0e1f4a] p-4"
          style={{ zIndex: 10 - i }}
          animate={{ y: i * 10, scale: 1 - i * 0.04 }}
          drag={i === 0 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info: PanInfo) => { if (Math.abs(info.offset.x) > 100) swipe(); }}
          whileDrag={{ rotate: 6 }}>
          <p className="display text-lg font-extrabold text-white">{t}</p>
          <p className="text-xs text-[#8ea6d8]">Drag card · {items.length} left</p>
        </motion.div>
      ))}
    </div>
  );
}

function GesturePad() {
  const [log, setLog] = useState<string[]>([]);
  const push = (t: string) => { setLog(l => [t, ...l].slice(0, 6)); sfx.tap(); };
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 }); const sy = useSpring(y, { stiffness: 200, damping: 20 });
  return (
    <div>
      <motion.div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-white/20 bg-black/30"
        onPointerDown={() => push("pointerdown")}
        onDoubleClick={() => push("double-click")}
        onWheel={e => push(`wheel ${e.deltaY > 0 ? "down" : "up"}`)}
        drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.4}
        onDragEnd={(_, info) => push(`fling vx=${Math.round(info.velocity.x)}`)}
        onPointerMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left); y.set(e.clientY - r.top);
        }}>
        <motion.div className="pointer-events-none absolute h-16 w-16 rounded-full bg-[#8ef23c]/30 blur-md" style={{ left: sx, top: sy, x: "-50%", y: "-50%" }} />
        <p className="display text-sm font-extrabold text-white">Gesture pad</p>
      </motion.div>
      <div className="mt-2 space-y-0.5">{log.map((l, i) => <p key={i} className="num-mono text-[10px] text-[#8ea6d8]">{l}</p>)}</div>
    </div>
  );
}

function ParticlesDemo() {
  const { fire, node } = useBurst();
  const { spawn, node: fnode } = useFloaters();
  return (
    <div className="relative flex h-[160px] items-center justify-center rounded-[22px] border border-white/10 bg-black/25"
      onClick={e => {
        const r = e.currentTarget.getBoundingClientRect();
        fire(e.clientX - r.left, e.clientY - r.top, "#8ef23c");
        spawn(e.clientX - r.left, e.clientY - r.top, "+XP", "#ffc531");
        sfx.coin();
      }}>
      {node}{fnode}
      <p className="display text-sm font-extrabold text-white">Tap for burst + floater</p>
    </div>
  );
}

function MagneticGridClean() {
  const tones = ["btn3d-green", "btn3d-blue", "btn3d-short", "btn3d-gold", "btn3d-violet", "btn3d-ghost"] as const;
  const labels = ["Trade", "Learn", "Duel", "Shop", "Raid", "Boss"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {labels.map((t, i) => (
        <Magnetic key={t} strength={0.45}>
          <RippleButton sound="pop" className={cn("btn3d w-full py-4 text-[11px]", tones[i])}>{t}</RippleButton>
        </Magnetic>
      ))}
    </div>
  );
}

function TextWallFixed() {
  return (
    <div className="space-y-3">
      <div className="panel-inset p-3"><SplitText text="SPLIT ON VIEW" className="display text-xl font-extrabold text-white" /></div>
      <div className="panel-inset p-3"><ScrambleText text="$97,432.10 BTC" className="text-lg font-extrabold text-[#8ef23c]" /></div>
      <div className="panel-inset p-3">
        <span className="display text-lg font-extrabold text-white">Mode: <Typewriter words={["Long", "Short", "Hedge", "DCA", "Exit"]} className="text-[#ffc531]" /></span>
      </div>
      <div className="panel-inset p-3"><Odometer value={1248020.55} prefix="$" decimals={2} className="text-2xl font-extrabold text-white" /></div>
    </div>
  );
}

export default function EffectsPlayground() {
  return (
    <GameSection id="effects" index="22" kicker="Effects Playground" title="Все эффекты в одном месте"
      desc="Карусели (fade, cube, vertical snap, free-drag), мульти-слайдеры, parallax-скролл, свайп-стек, gesture pad, particles, magnetic, text FX."
      right={<div className="flex gap-2"><Tag tone="green">live lab</Tag><Tag tone="violet">60fps</Tag></div>}>

      <div className="mb-5 rounded-[24px] border border-white/10 bg-black/20 py-4">
        <VelocityMarquee baseVelocity={-2}>
          {["PARALLAX", "◆", "SWIPE", "◆", "CAROUSEL", "◆", "SLIDER", "◆", "SPRING", "◆", "BURST", "◆"].map((w, i) => (
            <span key={i} className={cn("display text-4xl font-extrabold", w === "◆" ? "text-[#8ef23c]" : "text-white/70")}>{w}</span>
          ))}
        </VelocityMarquee>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Fade Carousel" sub="Auto crossfade"><FadeCarousel /></Card>
        <Card title="Cube / Coverflow" sub="rotateY stack"><CubeCarousel /></Card>
        <Card title="Vertical Snap" sub="Scroll inside"><VerticalSnap /></Card>
        <Card title="Free Drag Rail" sub="Physics constraints" className="lg:col-span-2"><DragFreeCarousel /></Card>
        <Card title="SnapRail kit" sub="Shared gamekit">
          <SnapRail>
            {slides.slice(0, 6).map(s => (
              <div key={s.t} className="w-[70%] shrink-0 snap-center rounded-2xl border border-white/10 p-4 sm:w-[40%]" style={{ background: `${s.c}22` }}>
                <p className="display text-sm font-extrabold text-white">{s.t}</p>
              </div>
            ))}
          </SnapRail>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Triple Thumb Slider" sub="TP · Entry · SL"><MultiThumb /></Card>
        <Card title="Vertical Conviction" sub="Linked"><VerticalParallaxSlider /></Card>
        <Card title="Gesture Pad" sub="drag · wheel · double-tap"><GesturePad /></Card>
        <Card title="Swipe Stack Mini" sub="Fling cards"><StackSwipeMini /></Card>
        <Card title="Burst + Floaters" sub="Tap canvas"><ParticlesDemo /></Card>
        <Card title="Magnetic CTAs" sub="Hover pull + ripple"><MagneticGridClean /></Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Tilt · Spotlight · Shine" sub="Pointer-linked">
          <div className="grid grid-cols-3 gap-3">
            <Tilt className="rounded-2xl"><div className="flex h-28 items-end rounded-2xl border border-white/15 bg-gradient-to-br from-[#2a4b8f] to-[#0e1f4a] p-3"><span className="text-xs font-extrabold text-white">Tilt</span></div></Tilt>
            <Spotlight className="rounded-2xl border border-white/10 bg-[#0e1f4a]"><div className="flex h-28 items-end p-3"><span className="text-xs font-extrabold text-white">Spot</span></div></Spotlight>
            <ShineBorder><div className="flex h-[108px] items-end rounded-2xl bg-[#0b1a42] p-3"><span className="text-xs font-extrabold text-white">Shine</span></div></ShineBorder>
          </div>
        </Card>
        <Card title="Text FX Wall" sub="Split · scramble · type · odometer"><TextWallFixed /></Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Scroll Parallax Mini" sub="Multi-layer"><ScrollStoryMini /></Card>
        <Card title="Stagger Reveal" sub="whileInView cascade">
          <Stagger className="space-y-2" gap={0.08}>
            {["Foundations", "Trading Lab", "Gameplay Hub", "Raid Boss", "Effects Lab"].map(t => (
              <div key={t} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-extrabold text-white">{t}</div>
            ))}
          </Stagger>
        </Card>
      </div>

      <div className="mt-5">
        <Card title="Horizontal Scroll Section" sub="Pin + translateX · scroll the page">
          <HorizontalScrollMini />
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: MousePointer2, t: "Cursor glow", d: "Desktop magnet cursor" },
          { i: Waves, t: "Velocity skew", d: "Marquee reacts to scroll" },
          { i: Move, t: "Spring physics", d: "Damping · stiffness tuned" },
          { i: Sparkles, t: "Particles", d: "Canvas + mouse repel" },
          { i: Layers, t: "Depth layers", d: "Parallax 0.1–1.0" },
          { i: Zap, t: "Haptics + SFX", d: "WebAudio synth" },
          { i: Flame, t: "Combo juice", d: "Scale pop + glow" },
          { i: Gem, t: "Reward FX", d: "Confetti + claim" },
        ].map(f => (
          <Reveal key={f.t} variant="up">
            <div className="panel-3d p-4">
              <f.i size={22} className="text-[#8ef23c]" />
              <p className="display mt-2 text-sm font-extrabold text-white">{f.t}</p>
              <p className="text-[11px] text-[#8ea6d8]">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </GameSection>
  );
}
