/* ------------------------------------------------------------------
 * 10 · PARALLAX WORLD — scroll-reactive storytelling
 * sticky multi-layer scene · horizontal scroll · word reveal ·
 * mouse parallax · zoom-on-scroll · velocity marquee · scroll counters
 * ------------------------------------------------------------------ */
import { motion, useMotionTemplate, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { BarChart3, Brain, Coins, Crown, Flame, Rocket, ShieldCheck, Swords, Target, TrendingUp, Trophy, Wallet, Zap } from "lucide-react";
import { useRef } from "react";
import { Tag } from "../components/ui";
import { ParticleField, Reveal, SplitText, useMouseParallax, VelocityMarquee } from "../fx/effects";
import { cn } from "../utils/cn";

/* ---------- 1. STICKY PARALLAX STORY ---------- */
const chapters = [
  { k: "Chapter 01", t: "Учись как в игре", s: "Короткие уроки по 3 минуты. Сердца, комбо, стрики — мозг кайфует от прогресса.", c: "#8ef23c" },
  { k: "Chapter 02", t: "Торгуй без риска", s: "Paper-trading на живых котировках. Ошибайся бесплатно — учись дорого.", c: "#5b8cff" },
  { k: "Chapter 03", t: "Побеждай в лигах", s: "Дуэли 1v1, недельные лиги, сезонные награды. Докажи, что ты лучший трейдер.", c: "#ffc531" },
];

function Mountains({ color, d, opacity = 1 }: { color: string; d: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute bottom-0 h-full w-full" style={{ opacity }}>
      <path d={d} fill={color} />
    </svg>
  );
}

function Chapter({ i, p }: { i: number; p: MotionValue<number> }) {
  const start = i / 3, end = (i + 1) / 3;
  const opacity = useTransform(p, [start, start + 0.06, end - 0.06, end], [0, 1, 1, 0]);
  const y = useTransform(p, [start, start + 0.08, end - 0.08, end], [60, 0, 0, -60]);
  const blur = useTransform(p, [start, start + 0.06, end - 0.06, end], [10, 0, 0, 10]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const c = chapters[i];
  return (
    <motion.div style={{ opacity, y, filter }} className="absolute inset-x-0 top-[16%] mx-auto max-w-2xl px-6 text-center">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: c.c }}>{c.k}</p>
      <h3 className="display mt-2 text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl" style={{ textShadow: `0 0 40px ${c.c}55` }}>{c.t}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-[#c9d8ff] sm:text-base">{c.s}</p>
    </motion.div>
  );
}

function StickyStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const starsY = useTransform(p, [0, 1], [0, -80]);
  const far = useTransform(p, [0, 1], [0, -120]);
  const mid = useTransform(p, [0, 1], [0, -240]);
  const near = useTransform(p, [0, 1], [0, -420]);
  const sunY = useTransform(p, [0, 1], [120, -180]);
  const sunScale = useTransform(p, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const hue = useTransform(p, [0, 0.33, 0.66, 1], ["#8ef23c", "#5b8cff", "#ffc531", "#ffc531"]);
  const glow = useMotionTemplate`radial-gradient(circle, ${hue} 0%, transparent 65%)`;
  const mascotY = useTransform(p, [0, 1], [180, -60]);
  const mascotR = useTransform(p, [0, 0.5, 1], [-8, 6, 0]);
  const mascotS = useTransform(p, [0, 0.5, 1], [0.8, 1, 1.1]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);
  const coin1 = useTransform(p, [0, 1], [0, -600]);
  const coin2 = useTransform(p, [0, 1], [100, -500]);
  const coin3 = useTransform(p, [0, 1], [200, -700]);
  const rot = useTransform(p, [0, 1], [0, 720]);
  return (
    <div ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030817] via-[#0a1a48] to-[#122a66]" />
        <motion.div style={{ y: starsY }} className="absolute inset-0">
          <ParticleField count={60} color="200,220,255" link={false} />
        </motion.div>
        <motion.div style={{ y: sunY, scale: sunScale, background: glow }} className="absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-2xl" />
        <motion.div style={{ y: far }} className="absolute inset-x-0 bottom-[-40px] h-[55%]">
          <Mountains color="#0f2458" opacity={0.9} d="M0,300 L0,160 L80,120 L160,150 L240,80 L320,130 L400,60 L480,110 L560,40 L640,100 L720,70 L800,120 L880,50 L960,100 L1040,30 L1120,90 L1200,60 L1200,300 Z" />
        </motion.div>
        <motion.div style={{ y: mid }} className="absolute inset-x-0 bottom-[-120px] h-[50%]">
          <Mountains color="#0b1b45" d="M0,300 L0,200 L100,170 L180,210 L260,130 L360,180 L440,110 L540,170 L620,90 L720,160 L800,120 L900,190 L980,100 L1080,150 L1200,110 L1200,300 Z" />
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute bottom-0 h-full w-full">
            <polyline points="0,200 100,170 180,210 260,130 360,180 440,110 540,170 620,90 720,160 800,120 900,190 980,100 1080,150 1200,110" fill="none" stroke="#8ef23c" strokeWidth="3" opacity=".7" />
          </svg>
        </motion.div>
        <motion.div style={{ y: mascotY, rotate: mascotR, scale: mascotS }} className="absolute bottom-[8%] left-1/2 w-[220px] -translate-x-1/2 sm:w-[280px]">
          <img src="/images/bull-mascot.png" alt="" className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.7)]" />
        </motion.div>
        <motion.div style={{ y: near }} className="absolute inset-x-0 bottom-[-260px] h-[45%]">
          <Mountains color="#060f2c" d="M0,300 L0,230 L120,200 L220,240 L340,180 L460,230 L580,170 L700,220 L820,160 L940,230 L1060,190 L1200,220 L1200,300 Z" />
        </motion.div>
        {[{ y: coin1, l: "12%", g: "₿", c: "#F7931A", s: 60 }, { y: coin2, l: "82%", g: "Ξ", c: "#627EEA", s: 48 }, { y: coin3, l: "68%", g: "◎", c: "#14F195", s: 40 }].map((c, i) => (
          <motion.div key={i} style={{ y: c.y, rotate: rot, left: c.l, width: c.s, height: c.s, fontSize: c.s * 0.5, color: c.c, background: `${c.c}22`, border: `2px solid ${c.c}88`, boxShadow: `0 0 30px ${c.c}66` }}
            className="absolute top-[70%] flex items-center justify-center rounded-full font-black">{c.g}</motion.div>
        ))}
        {chapters.map((_, i) => <Chapter key={i} i={i} p={p} />)}
        <div className="absolute bottom-6 left-1/2 w-[min(420px,80%)] -translate-x-1/2">
          <div className="mb-2 flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            {chapters.map(c => <span key={c.k}>{c.k}</span>)}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#8ef23c] via-[#5b8cff] to-[#ffc531]" style={{ width: bar }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. HORIZONTAL SCROLL (vertical-driven) ---------- */
const hItems = [
  { t: "Candles 101", i: BarChart3, c: "#8ef23c", d: "Читай свечи как книгу" },
  { t: "Trend Hunter", i: TrendingUp, c: "#2ede8a", d: "Лови тренды раньше всех" },
  { t: "Risk Shield", i: ShieldCheck, c: "#5b8cff", d: "Стопы спасают депозиты" },
  { t: "Whale Radar", i: Wallet, c: "#14c8f5", d: "Следи за китами on-chain" },
  { t: "DeFi Farmer", i: Coins, c: "#ffc531", d: "Доходность без магии" },
  { t: "Mind Master", i: Brain, c: "#a78bff", d: "Психология побеждает" },
  { t: "Duel Arena", i: Swords, c: "#ff5470", d: "1v1 прогнозы в реальном времени" },
  { t: "Legend", i: Crown, c: "#ffd76a", d: "Финальный босс сезона" },
];
function HCard({ it, i, p }: { it: typeof hItems[number]; i: number; p: MotionValue<number> }) {
  const center = i / (hItems.length - 1);
  const rotateY = useTransform(p, [center - 0.3, center, center + 0.3], [25, 0, -25]);
  const scale = useTransform(p, [center - 0.25, center, center + 0.25], [0.88, 1, 0.88]);
  const Icon = it.i;
  return (
    <motion.div style={{ rotateY, scale, transformPerspective: 1000 }} className="panel-3d relative flex h-[340px] w-[260px] shrink-0 flex-col overflow-hidden !rounded-[28px] p-5 sm:w-[300px]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl" style={{ background: it.c, opacity: 0.3 }} />
      <span className="num-mono text-[64px] font-extrabold leading-none text-white/10">{String(i + 1).padStart(2, "0")}</span>
      <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="mt-2 flex h-20 w-20 items-center justify-center rounded-[22px]" style={{ background: `linear-gradient(180deg, ${it.c}, ${it.c}88)`, boxShadow: `0 6px 0 ${it.c}55, inset 0 2px 0 rgba(255,255,255,.5)` }}>
        <Icon size={38} className="text-[#081130]" strokeWidth={2.4} />
      </motion.div>
      <p className="display mt-auto text-2xl font-extrabold text-white">{it.t}</p>
      <p className="text-sm text-[#9fb2dd]">{it.d}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] font-extrabold" style={{ color: it.c }}><Zap size={13} /> Module {i + 1} · +{(i + 1) * 40} XP</div>
    </motion.div>
  );
}
function HorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26 });
  const x = useTransform(p, [0, 1], ["2%", "-72%"]);
  const counter = useTransform(p, v => `${Math.min(hItems.length, Math.floor(v * hItems.length) + 1)} / ${hItems.length}`);
  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-[1280px] items-end justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#8ef23c]">Horizontal scroll · driven by vertical</p>
            <h3 className="display text-3xl font-extrabold text-white sm:text-5xl">Карта сезона</h3>
          </div>
          <motion.span className="num-mono text-2xl font-extrabold text-white/70">{counter}</motion.span>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-4 sm:pl-8">
          {hItems.map((it, i) => <HCard key={it.t} it={it} i={i} p={p} />)}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- 3. WORD-BY-WORD SCROLL REVEAL ---------- */
const manifesto = "90% новичков теряют деньги в первый месяц. Не потому что рынок жесток — а потому что их никто не учил. TRADELINGO превращает страх в навык: урок за уроком, свеча за свечой, пока ты не начнёшь думать как профи.";
function Word({ w, range, p }: { w: string; range: [number, number]; p: MotionValue<number> }) {
  const o = useTransform(p, range, [0.12, 1]);
  const y = useTransform(p, range, [8, 0]);
  const hl = /90%|TRADELINGO|профи/.test(w);
  return <motion.span style={{ opacity: o, y }} className={cn("mr-[0.25em] inline-block", hl && "text-[#8ef23c]")}>{w}</motion.span>;
}
function WordReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = manifesto.split(" ");
  return (
    <div ref={ref} className="mx-auto max-w-4xl px-6 py-24">
      <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#7d92c4]">Manifesto · scroll to read</p>
      <p className="display text-2xl font-extrabold leading-snug text-white sm:text-4xl">
        {words.map((w, i) => <Word key={i} w={w} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />)}
      </p>
    </div>
  );
}

/* ---------- 4. MOUSE PARALLAX SCENE ---------- */
function MouseScene() {
  const { x, y, bind } = useMouseParallax(60);
  const x2 = useTransform(x, v => v * -0.6);
  const y2 = useTransform(y, v => v * -0.6);
  const x3 = useTransform(x, v => v * 1.6);
  const y3 = useTransform(y, v => v * 1.6);
  const rx = useTransform(y, v => v * -0.3);
  const ry = useTransform(x, v => v * 0.3);
  return (
    <div {...bind} className="panel-3d relative h-[360px] overflow-hidden !rounded-[32px]" data-cursor>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e3f8a,#050c22_70%)]" />
      <motion.div style={{ x: x2, y: y2 }} className="absolute inset-0">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="absolute h-1 w-1 rounded-full bg-white/60" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }} />
        ))}
      </motion.div>
      <motion.div style={{ x, y, rotateX: rx, rotateY: ry, transformPerspective: 800 }} className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 -m-10 rounded-full bg-[#8ef23c]/20 blur-3xl" />
          <img src="/images/bull-mascot.png" alt="" className="relative w-[210px] drop-shadow-[0_30px_40px_rgba(0,0,0,.7)]" />
        </div>
      </motion.div>
      <motion.div style={{ x: x3, y: y3 }} className="pointer-events-none absolute inset-0">
        {[
          { l: "10%", t: "18%", i: Trophy, c: "#ffc531" }, { l: "80%", t: "20%", i: Flame, c: "#ff8b3d" },
          { l: "14%", t: "72%", i: Target, c: "#ff5470" }, { l: "78%", t: "70%", i: Rocket, c: "#8ef23c" },
        ].map((o, i) => (
          <motion.div key={i} animate={{ y: [0, -12, 0] }} transition={{ duration: 3 + i, repeat: Infinity }} className="absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15" style={{ left: o.l, top: o.t, background: `${o.c}25`, boxShadow: `0 0 24px ${o.c}55, 0 4px 0 #030816` }}>
            <o.i size={26} style={{ color: o.c }} />
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute bottom-4 left-5">
        <p className="display text-lg font-extrabold text-white">Mouse Parallax · 4 слоя</p>
        <p className="text-xs text-[#8ea6d8]">Двигай курсором — глубина реагирует</p>
      </div>
    </div>
  );
}

/* ---------- 5. ZOOM ON SCROLL ---------- */
function ZoomReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [80, 32]);
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 0]);
  const o = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 1]);
  return (
    <div ref={ref}>
      <motion.div style={{ scale, borderRadius: radius, rotate: rot, opacity: o }} className="relative h-[360px] overflow-hidden border border-white/15 bg-gradient-to-br from-[#1b4d12] via-[#0a1a42] to-[#3f1fa0]">
        <ParticleField count={40} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#8ef23c]">Zoom on scroll</p>
          <p className="display mt-2 text-4xl font-extrabold text-white sm:text-5xl">1.2M трейдеров</p>
          <p className="text-sm text-[#c9d8ff]">уже учатся в TRADELINGO</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- 6. SCROLL-LINKED STATS ---------- */
function ScrollStat({ to, label, suffix, p, color }: { to: number; label: string; suffix: string; p: MotionValue<number>; color: string }) {
  const v = useTransform(p, [0, 1], [0, to]);
  const txt = useTransform(v, n => `${Math.round(n).toLocaleString()}${suffix}`);
  const w = useTransform(p, [0, 1], ["0%", "100%"]);
  return (
    <div className="panel-3d p-5">
      <motion.p className="num-mono text-3xl font-extrabold" style={{ color }}>{txt}</motion.p>
      <p className="text-xs font-bold uppercase tracking-widest text-[#8ea6d8]">{label}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full rounded-full" style={{ width: w, background: color }} /></div>
    </div>
  );
}
function ScrollStats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.6"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScrollStat p={p} to={1240000} label="Active traders" suffix="" color="#8ef23c" />
      <ScrollStat p={p} to={48} label="Countries" suffix="" color="#5b8cff" />
      <ScrollStat p={p} to={92} label="Retention D7" suffix="%" color="#ffc531" />
      <ScrollStat p={p} to={4800} label="Lessons done / h" suffix="" color="#ff5470" />
    </div>
  );
}

/* ================= SECTION ================= */
export default function ParallaxWorld() {
  return (
    <section id="parallax" className="relative scroll-mt-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="panel-3d flex h-14 w-14 shrink-0 items-center justify-center !rounded-2xl">
              <span className="display text-lg font-extrabold text-[#8ef23c] text-glow-green">10</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea6d8]">Parallax World</p>
              <h2 className="display text-2xl font-extrabold text-white sm:text-[32px]"><SplitText text="Реакция на скролл" /></h2>
              <p className="mt-1 max-w-xl text-sm text-[#9fb2dd]">Sticky-сцена с 6 слоями глубины, горизонтальный скролл от вертикального, пословное проявление, зум, счётчики и маркиза, реагирующая на скорость.</p>
            </div>
          </div>
          <div className="flex gap-2"><Tag tone="green">scroll-linked</Tag><Tag tone="blue">sticky</Tag></div>
        </div>
      </div>

      <div className="border-y border-white/10 bg-[#060d24]/70 py-5">
        <VelocityMarquee baseVelocity={-2.5}>
          {["BULL", "◆", "BEAR", "◆", "HODL", "◆", "LONG", "◆", "SHORT", "◆", "TO THE MOON", "◆"].map((w, i) => (
            <span key={i} className={cn("display text-4xl font-extrabold sm:text-6xl", w === "◆" ? "text-[#8ef23c]" : i % 4 === 0 ? "text-white" : "text-transparent")} style={w !== "◆" && i % 4 !== 0 ? { WebkitTextStroke: "1.5px rgba(157,185,255,.6)" } : undefined}>{w}</span>
          ))}
        </VelocityMarquee>
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#54678f]">скролль быстрее — лента ускоряется и наклоняется</p>
      </div>

      <StickyStory />
      <WordReveal />

      <div className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal variant="left"><MouseScene /></Reveal>
        <Reveal variant="right"><ZoomReveal /></Reveal>
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"><ScrollStats /></div>

      <HorizontalScroll />
    </section>
  );
}
