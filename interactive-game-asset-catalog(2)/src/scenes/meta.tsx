import { animate, AnimatePresence, motion, useAnimate, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import enemy from "../assets/enemy.jpg";
import { Coin, CountUp, I } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys, sleep } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   20 · PACK OPENING — разрыв пака, веер, раскрытие по редкости
   ================================================================ */
const RAR = [
  { n: "Обычная", c: "#cfd8ea" },
  { n: "Редкая", c: "#4cc3ff" },
  { n: "Эпическая", c: "#9b7bff" },
  { n: "Легендарная", c: "#ffc34d" },
];
const PACK = [
  { r: 0, t: "Свеча", icon: I.bars },
  { r: 1, t: "Ретест", icon: I.target },
  { r: 0, t: "Уровень", icon: I.layers },
  { r: 2, t: "Хладнокровие", icon: I.heart },
  { r: 3, t: "Тень рынка", icon: I.eye },
];
const ORDER = [0, 2, 1, 3, 4];

export function PackOpening({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const pack = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [st, setSt] = useState<"sealed" | "shake" | "torn" | "fan">("sealed");
  const [flipped, setFlipped] = useState([false, false, false, false, false]);
  const [focus, setFocus] = useState<number | null>(null);
  const tear = useMotionValue(0);
  const tearW = useTransform(tear, (v) => `${v * 100}%`);
  const flippedRef = useRef(flipped);
  flippedRef.current = flipped;

  const flip = async (i: number) => {
    if (flippedRef.current[i] || st !== "fan") return;
    const r = PACK[i].r;
    const el = cards.current[i];
    if (!el) return;
    if (r >= 2) {
      // ПРЕДВКУШЕНИЕ: редкие карты «дрожат» и светятся ДО раскрытия
      setFocus(i);
      sfx.suck();
      await anim(el, { scale: [1, 1.18, 1.14], rotate: [0, -4, 4, -3, 3, 0] }, { duration: r === 3 ? 0.9 : 0.55, ease: "easeInOut" });
    }
    flippedRef.current = flippedRef.current.map((v, k) => (k === i ? true : v));
    setFlipped(flippedRef.current);
    const c = centerIn(el, scope.current);
    p.burst({ x: c.x, y: c.y, count: 10 + r * 22, colors: [RAR[r].c, "#fff"], speed: [120, 380 + r * 120], shape: r === 3 ? "star" : "spark", size: r === 3 ? [3, 6] : [1.5, 3] });
    if (r === 3) {
      anim(scope.current, shakeKeys(0.85, 14, 11, 2), { duration: 0.45 });
      p.ring(c.x, c.y, "#fff", 200, 0.6, 12);
      p.ring(c.x, c.y, RAR[3].c, 160, 1, 5);
      sfx.levelup();
    } else if (r === 2) {
      p.ring(c.x, c.y, RAR[2].c, 120, 0.7, 6);
      sfx.success();
    } else sfx.pop(r * 4);
    await sleep(r >= 2 ? 900 : 200);
    setFocus(null);
  };

  useScript(run, async (wait) => {
    setSt("sealed");
    setFlipped([false, false, false, false, false]);
    flippedRef.current = [false, false, false, false, false];
    setFocus(null);
    tear.set(0);
    await wait(500);
    cue();
    setSt("shake");
    for (let i = 1; i <= 3; i++) {
      sfx.tap();
      await anim(pack.current!, { rotate: [0, -3 * i, 3 * i, 0], scale: [1, 1 + 0.03 * i, 1] }, { duration: 0.24 });
      await wait(90);
    }
    // TEAR: искры бегут по линии разрыва
    sfx.whoosh(0.3);
    const stop = tear.on("change", (v) => {
      if (Math.random() > 0.5) return;
      const b = pack.current!.getBoundingClientRect();
      const r = scope.current.getBoundingClientRect();
      p.burst({ x: b.left - r.left + b.width * v, y: b.top - r.top + 42, count: 3, speed: [60, 200], colors: ["#fff", "#ff6bd6"], life: [0.3, 0.6] });
    });
    await animate(tear, 1, { duration: 0.35, ease: EASE.camera });
    stop();
    setSt("torn");
    await wait(380);
    setSt("fan");
    sfx.whoosh(0.45);
    await wait(950);
    for (const i of ORDER) {
      await flip(i);
      await wait(180);
    }
  });

  const fanPos = (i: number) => ({ x: (i - 2) * 50, y: Math.abs(i - 2) * 14 + (i - 2) * (i - 2) * 3, rotate: (i - 2) * 9 });

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff6bd6" />
      <motion.div
        className="absolute left-1/2 top-[300px] h-[520px] w-[520px] -ml-[260px] -mt-[260px]"
        style={{ background: "repeating-conic-gradient(from 0deg, #ff6bd622 0deg 6deg, transparent 6deg 20deg)", WebkitMaskImage: "radial-gradient(closest-side,#000 15%,transparent)", maskImage: "radial-gradient(closest-side,#000 15%,transparent)" }}
        animate={{ rotate: 360, opacity: st === "fan" ? 1 : 0.3 }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.5 } }}
      />
      {/* PACK */}
      <motion.div
        ref={pack}
        className="absolute left-1/2 top-[150px] h-[250px] w-[170px] -ml-[85px]"
        initial={false}
        animate={st === "fan" ? { y: 480, rotate: 12, opacity: 0 } : st === "sealed" ? { y: [0, -8, 0], rotate: 0, opacity: 1 } : { y: 0, opacity: 1 }}
        transition={st === "fan" ? { duration: 0.6, ease: EASE.inQuart } : st === "sealed" ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        {/* top flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[42px] overflow-hidden rounded-t-2xl"
          style={{ background: "linear-gradient(135deg,#ff9be6,#b02d8e 60%,#ff6bd6)", transformOrigin: "100% 100%" }}
          initial={false}
          animate={st === "torn" || st === "fan" ? { x: 110, y: -170, rotate: 55, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={st === "torn" ? { duration: 0.6, ease: EASE.outExpo, opacity: { delay: 0.3, duration: 0.3 } } : { duration: 0 }}
        >
          <div className="sheen absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 border-b-2 border-dashed border-white/40" />
        </motion.div>
        {/* body */}
        <div className="absolute inset-x-0 bottom-0 top-[42px] overflow-hidden rounded-b-2xl" style={{ background: "linear-gradient(160deg,#ff6bd6,#6a1452 55%,#2a0822)", boxShadow: "0 30px 60px -20px #ff6bd6aa, inset 0 0 0 2px #ffffff22" }}>
          <div className="sheen absolute inset-0" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 32 32" className="mx-auto">
                <path d="M16 2 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z" fill="#2a0822" stroke="#ffc34d" strokeWidth="2" />
                <path d="M8 21 L13 15 L16 18 L24 9" fill="none" stroke="#3ddc84" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-2 font-display text-sm font-black tracking-wider">НАБОР НАВЫКОВ</div>
              <div className="text-[10px] font-bold text-white/60">5 карт · 1 гарантия эпик+</div>
            </div>
          </div>
        </div>
        {/* tear line */}
        <motion.div className="absolute left-0 top-[40px] h-[4px] rounded-full bg-white" style={{ width: tearW, boxShadow: "0 0 12px 3px #ff6bd6, 0 0 24px #fff" }} />
      </motion.div>
      {/* CARDS */}
      {PACK.map((cd, i) => {
        const fp = fanPos(i);
        const isF = focus === i;
        const dim = focus !== null && !isF;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-[210px] -ml-[44px]"
            style={{ zIndex: isF ? 20 : i, perspective: 700 }}
            initial={false}
            animate={st === "fan" ? { x: fp.x, y: isF ? fp.y - 40 : fp.y, rotate: isF ? 0 : fp.rotate, opacity: dim ? 0.35 : 1, scale: 1 } : { x: 0, y: 40, rotate: 0, opacity: 0, scale: 0.7 }}
            transition={st === "fan" ? { delay: focus !== null ? 0 : i * 0.06, type: "spring", stiffness: 220, damping: 18 } : { duration: 0 }}
          >
            <motion.div
              ref={(el) => {
                cards.current[i] = el;
              }}
              onClick={() => flip(i)}
              className="relative h-[124px] w-[88px] cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              initial={false}
              animate={{ rotateY: flipped[i] ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
            >
              {/* front */}
              <div className="absolute inset-0 overflow-hidden rounded-xl p-[3px]" style={{ backfaceVisibility: "hidden", background: `linear-gradient(150deg, ${RAR[cd.r].c}, #1a2440 55%, ${RAR[cd.r].c}aa)`, boxShadow: `0 0 ${10 + cd.r * 10}px ${RAR[cd.r].c}88` }}>
                <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[9px] bg-gradient-to-b from-[#1d2b4f] to-[#0c1428] p-1.5">
                  {cd.r === 3 ? (
                    <img src={hood} className="mask-bottom h-[64px] w-full rounded-md object-cover" />
                  ) : (
                    <div className="mt-2 grid h-12 w-12 place-items-center rounded-full border-2" style={{ borderColor: RAR[cd.r].c, color: RAR[cd.r].c }}>
                      <cd.icon size={22} />
                    </div>
                  )}
                  <div className="mt-auto text-center">
                    <div className="text-[7px] font-bold tracking-[.2em]" style={{ color: RAR[cd.r].c }}>{RAR[cd.r].n.toUpperCase()}</div>
                    <div className="font-display text-[9px] font-bold leading-tight">{cd.t}</div>
                  </div>
                  {cd.r >= 2 && <div className="sheen absolute inset-0" />}
                </div>
              </div>
              {/* back */}
              <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-xl border-2 border-[#ff6bd6]/60" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "repeating-linear-gradient(45deg,#3a0f30 0 6px,#2a0822 6px 12px)" }}>
                <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold/70 text-gold">
                  <I.sparkle size={18} />
                </div>
                {isF && !flipped[i] && (
                  <motion.div className="absolute inset-0" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 0.3, repeat: Infinity }} style={{ background: `radial-gradient(circle, ${RAR[cd.r].c}aa, transparent 70%)` }} />
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {flipped.every(Boolean) && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING.panel} className="absolute inset-x-5 bottom-8 text-center">
            <div className="font-display text-lg font-black">Коллекция +5</div>
            <div className="mt-1 flex justify-center gap-1.5">
              {RAR.map((r, i) => (
                <span key={i} className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: `${r.c}22`, color: r.c }}>
                  {PACK.filter((x) => x.r === i).length} {r.n.toLowerCase()}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   21 · SPIN WHEEL — замах, физика торможения, язычок-трещотка
   ================================================================ */
const SEG = [
  { t: "100", c: "#2ee6c5", coin: true },
  { t: "x2 XP", c: "#9b7bff" },
  { t: "250", c: "#4cc3ff", coin: true },
  { t: "КАРТА", c: "#ff6bd6" },
  { t: "50", c: "#3ddc84", coin: true },
  { t: "СУНДУК", c: "#ffc34d" },
  { t: "500", c: "#ff4d5e", coin: true },
  { t: "ЭНЕРГИЯ", c: "#4cc3ff" },
];
const SA = 360 / SEG.length;
const WR = 118;
function arc(i: number) {
  const a0 = ((i * SA - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * SA - 90) * Math.PI) / 180;
  return `M0 0 L${Math.cos(a0) * WR} ${Math.sin(a0) * WR} A${WR} ${WR} 0 0 1 ${Math.cos(a1) * WR} ${Math.sin(a1) * WR} Z`;
}

export function SpinWheel({ run, cue }: SceneProps) {
  const rot = useMotionValue(0);
  const p = useParticles();
  const [scope, anim] = useAnimate();
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<number | null>(null);
  const lastSeg = useRef(0);
  // ЯЗЫЧОК: отклоняется, пока колышек под ним, и отпружинивает
  const flapper = useTransform(rot, (r) => {
    const f = (((r % SA) + SA) % SA) / SA;
    return f > 0.78 ? -((f - 0.78) / 0.22) * 30 : f < 0.12 ? -30 * (1 - f / 0.12) : 0;
  });
  useMotionValueEvent(rot, "change", (r) => {
    const s = Math.floor(r / SA);
    if (s !== lastSeg.current) {
      lastSeg.current = s;
      sfx.spinTick(s);
    }
  });

  const spin = async (target?: number) => {
    if (spinning) return;
    setSpinning(true);
    setWin(null);
    cue();
    const i = target ?? Math.floor(Math.random() * SEG.length);
    const cur = rot.get();
    // замах назад
    await animate(rot, cur - 18, { duration: 0.35, ease: EASE.outExpo });
    sfx.whoosh(0.5);
    const base = Math.ceil((cur + 360 * 6) / 360) * 360;
    const jitter = (Math.random() - 0.5) * SA * 0.6;
    const final = base + (360 - (i * SA + SA / 2)) + jitter;
    await animate(rot, final, { duration: 4.4, ease: [0.12, 0.8, 0.18, 1] });
    setWin(i);
    setSpinning(false);
    sfx.success();
    anim(scope.current, shakeKeys(0.5, 10, 6, 1), { duration: 0.3 });
    p.burst({ x: 150, y: 170, count: 60, shape: "confetti", colors: ["#2ee6c5", "#ffc34d", "#ff6bd6", "#9b7bff"], speed: [200, 480], gravity: 520, drag: 1.2, life: [1.4, 2.2], size: [3, 5], angle: -Math.PI / 2, spread: 2.4 });
    p.ring(150, 280, SEG[i].c, 150, 0.8, 6);
  };

  useScript(run, async (wait) => {
    setWin(null);
    await wait(700);
    await spin(5);
  });

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div className="absolute inset-x-0 top-12 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Ежедневное колесо</div>
        <div className="font-display text-lg font-black">Крути и забирай</div>
      </div>
      <div className="absolute left-1/2 top-[150px] h-[260px] w-[260px] -ml-[130px]">
        {/* rim bulbs */}
        <div className="absolute inset-0 rounded-full border-[10px] border-[#3a2a0a]" style={{ boxShadow: "0 0 0 3px #ffc34d, 0 0 40px #ffc34d55, inset 0 0 0 3px #ffc34d" }} />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute h-2.5 w-2.5 rounded-full"
              style={{ left: 130 + Math.cos(a) * 125 - 5, top: 130 + Math.sin(a) * 125 - 5 }}
              animate={{ background: ["#fff6cc", "#6a4a10", "#fff6cc"], boxShadow: ["0 0 10px #ffc34d", "0 0 0 #0000", "0 0 10px #ffc34d"] }}
              transition={{ duration: spinning ? 0.25 : 1.2, repeat: Infinity, delay: (i % 2) * (spinning ? 0.125 : 0.6) }}
            />
          );
        })}
        <motion.svg viewBox="-120 -120 240 240" className="absolute inset-[10px] h-[240px] w-[240px]" style={{ rotate: rot }}>
          {SEG.map((s, i) => (
            <g key={i}>
              <path d={arc(i)} fill={i % 2 ? "#141d36" : "#0e1528"} stroke="#ffc34d55" strokeWidth="1.5" />
              <path d={arc(i)} fill={s.c} opacity={win === i ? 0.45 : 0.12}>
                {win === i && <animate attributeName="opacity" values=".2;.6;.2" dur=".6s" repeatCount="indefinite" />}
              </path>
              <g transform={`rotate(${i * SA + SA / 2}) translate(0 -80)`}>
                {s.coin && <circle r="7" cy="-14" fill="#ffc34d" stroke="#8a4f0b" />}
                <text textAnchor="middle" y="6" fill={s.c} fontFamily="Unbounded" fontWeight="900" fontSize={s.t.length > 4 ? 10 : 14}>
                  {s.t}
                </text>
              </g>
            </g>
          ))}
          {SEG.map((_, i) => {
            const a = ((i * SA - 90) * Math.PI) / 180;
            return <circle key={i} cx={Math.cos(a) * 112} cy={Math.sin(a) * 112} r="3.5" fill="#fff6cc" />;
          })}
        </motion.svg>
        {/* hub */}
        <motion.button
          onClick={() => spin()}
          whileTap={{ scale: 0.9 }}
          animate={win !== null ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={SPRING.reward}
          className="absolute left-1/2 top-1/2 grid h-16 w-16 -ml-8 -mt-8 place-items-center rounded-full bg-gradient-to-b from-[#ffd76a] to-[#c8801a] font-display text-[11px] font-black text-[#3a2200] shadow-[0_0_0_4px_#3a2a0a,0_0_24px_#ffc34d]"
        >
          {spinning ? <span className="blink">...</span> : "КРУТИ"}
        </motion.button>
        {/* flapper */}
        <motion.div className="absolute left-1/2 -top-3 -ml-3 h-9 w-6" style={{ rotate: flapper, transformOrigin: "50% 20%" }}>
          <svg viewBox="0 0 24 36" className="h-full w-full drop-shadow-[0_0_6px_#ff4d5e]">
            <path d="M12 34 L2 6 A10 10 0 0 1 22 6 Z" fill="#ff4d5e" stroke="#fff" strokeWidth="2" />
            <circle cx="12" cy="8" r="3" fill="#fff" />
          </svg>
        </motion.div>
      </div>
      <AnimatePresence>
        {win !== null && (
          <motion.div
            initial={{ y: 80, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={SPRING.reward}
            className="glass absolute inset-x-6 bottom-10 flex items-center gap-3 rounded-2xl p-3"
            style={{ borderColor: `${SEG[win].c}66`, boxShadow: `0 0 30px -6px ${SEG[win].c}` }}
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${SEG[win].c}22`, color: SEG[win].c }}>
              {SEG[win].coin ? <Coin size={28} /> : <I.gem size={24} />}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-white/50">ВЫИГРЫШ</div>
              <div className="font-display text-xl font-black" style={{ color: SEG[win].c }}>
                {SEG[win].coin ? <CountUp to={+SEG[win].t} duration={0.9} /> : SEG[win].t}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} className="rounded-xl bg-teal px-3 py-2 text-[11px] font-bold text-[#022]">
              ЗАБРАТЬ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   22 · STREAK FIRE — серия дней, огонь разгорается
   ================================================================ */
function Flame({ size = 60, lit = true }: { size?: number; lit?: boolean }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" className="overflow-visible">
      <defs>
        <radialGradient id="fo" cx="50%" cy="75%" r="70%">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".45" stopColor="#ff9a3d" />
          <stop offset="1" stopColor="#ff3d3d" />
        </radialGradient>
      </defs>
      <motion.path
        d="M20 48 C8 48 2 40 4 30 C6 22 12 18 12 10 C18 14 20 20 20 24 C22 18 26 12 26 4 C34 12 38 22 36 32 C35 42 30 48 20 48 Z"
        fill={lit ? "url(#fo)" : "#ffffff15"}
        style={{ transformOrigin: "50% 100%", filter: lit ? "drop-shadow(0 0 8px #ff7a3d)" : "none" }}
        animate={lit ? { scaleY: [1, 1.08, 0.95, 1.05, 1], skewX: [0, 3, -2, 2, 0] } : {}}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
      {lit && (
        <motion.path
          d="M20 46 C14 46 11 42 12 37 C13 33 16 31 17 26 C20 30 21 33 21 35 C23 32 24 30 25 27 C28 32 29 37 27 41 C26 44 24 46 20 46 Z"
          fill="#fff6cc"
          style={{ transformOrigin: "50% 100%" }}
          animate={{ scaleY: [1, 0.9, 1.1, 1], skewX: [0, -3, 2, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}

export function StreakFire({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [filled, setFilled] = useState(0);
  const [today, setToday] = useState(false);
  const [count, setCount] = useState(6);
  const big = useRef<HTMLDivElement>(null);
  const embers = useRef<number | null>(null);

  useScript(run, async (wait) => {
    setFilled(0);
    setToday(false);
    setCount(6);
    if (embers.current) clearInterval(embers.current);
    await wait(400);
    cue();
    for (let i = 1; i <= 6; i++) {
      setFilled(i);
      sfx.pop(i * 2);
      await wait(110);
    }
    await wait(400);
    // TODAY: уголёк → вспышка → пламя
    sfx.suck();
    await wait(500);
    setToday(true);
    setFilled(7);
    setCount(7);
    sfx.impact();
    const c = centerIn(big.current, scope.current);
    anim(scope.current, shakeKeys(0.6, 10, 7, 1.2), { duration: 0.35 });
    p.ring(c.x, c.y, "#ff9a3d", 150, 0.7, 8);
    p.burst({ x: c.x, y: c.y, count: 50, colors: ["#ff9a3d", "#ffc34d", "#fff"], speed: [150, 450] });
    embers.current = window.setInterval(() => {
      p.burst({ x: c.x + (Math.random() - 0.5) * 40, y: c.y + 20, count: 2, shape: "dot", colors: ["#ff9a3d", "#ffc34d"], speed: [30, 80], gravity: -220, drag: 0.8, life: [0.8, 1.6], size: [1.5, 3], angle: -Math.PI / 2, spread: 0.8 });
    }, 90);
    await wait(4000);
    if (embers.current) clearInterval(embers.current);
  });

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff9a3d" />
      <motion.div className="absolute inset-0" initial={false} animate={{ background: today ? "radial-gradient(60% 40% at 50% 36%, #ff7a3d33, transparent)" : "radial-gradient(60% 40% at 50% 36%, #ff7a3d00, transparent)" }} transition={{ duration: 0.8 }} />
      <div className="absolute inset-x-0 top-12 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Серия обучения</div>
      <div ref={big} className="absolute left-1/2 top-[90px] -ml-[50px] grid h-[130px] w-[100px] place-items-end justify-center">
        <motion.div initial={false} animate={today ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.25, opacity: 0.6, y: 30 }} transition={today ? { type: "spring", stiffness: 200, damping: 10 } : { duration: 0.3 }} style={{ transformOrigin: "50% 100%" }}>
          <Flame size={96} lit={today} />
        </motion.div>
        {!today && (
          <motion.div className="absolute bottom-3 left-1/2 h-4 w-4 -ml-2 rounded-full bg-[#ff7a3d]" animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ boxShadow: "0 0 16px #ff7a3d" }} />
        )}
      </div>
      <div className="absolute inset-x-0 top-[232px] flex items-center justify-center gap-2">
        <div className="relative h-14 w-14 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div key={count} initial={{ y: 60, rotateX: -90 }} animate={{ y: 0, rotateX: 0 }} exit={{ y: -60, rotateX: 90 }} transition={SPRING.reward} className="absolute inset-0 text-center font-display text-5xl font-black" style={{ color: today ? "#ffc34d" : "#fff", textShadow: today ? "0 0 20px #ff9a3d" : "none" }}>
              {count}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-left">
          <div className="font-display text-base font-bold">дней</div>
          <div className="text-[10px] text-white/50">подряд</div>
        </div>
      </div>
      <AnimatePresence>
        {today && (
          <motion.div initial={{ scale: 2.4, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: -4, opacity: 1 }} transition={{ delay: 0.25, duration: 0.3, ease: EASE.snap }} className="absolute right-8 top-[236px] rounded-lg bg-gradient-to-b from-[#ffd76a] to-[#e8a121] px-2 py-1 font-display text-xs font-black text-[#3a2200] shadow-[0_0_20px_#ffc34d]">
            x1.5 XP
          </motion.div>
        )}
      </AnimatePresence>
      {/* week row */}
      <div className="absolute inset-x-4 top-[320px]">
        <div className="relative flex justify-between">
          <div className="absolute left-4 right-4 top-[17px] h-1 rounded-full bg-white/10" />
          <motion.div className="absolute left-4 top-[17px] h-1 rounded-full bg-gradient-to-r from-[#ff3d3d] to-[#ffc34d]" initial={false} animate={{ width: `calc(${(Math.max(0, filled - 1) / 6) * 100}% - ${(Math.max(0, filled - 1) / 6) * 32}px)` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} style={{ boxShadow: "0 0 10px #ff7a3d" }} />
          {days.map((d, i) => {
            const on = i < filled;
            const isToday = i === 6;
            return (
              <div key={i} className="relative flex flex-col items-center gap-1">
                <motion.div
                  className="grid h-9 w-9 place-items-center rounded-full border-2"
                  initial={false}
                  animate={on ? { scale: [0.6, 1.25, 1], borderColor: "#ff9a3d", background: isToday ? "#ff7a3d" : "#3a1a0a" } : { scale: 1, borderColor: "#ffffff22", background: "#0c1428" }}
                  transition={{ duration: 0.4, ease: EASE.overshoot }}
                  style={{ boxShadow: on ? "0 0 14px #ff7a3d88" : "none" }}
                >
                  {on ? <I.flame size={16} className={isToday ? "text-white" : "text-[#ff9a3d]"} /> : <span className="text-[10px] font-bold text-white/30">{i + 1}</span>}
                </motion.div>
                <span className={`text-[9px] font-bold ${isToday ? "text-[#ff9a3d]" : "text-white/40"}`}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* weekly chest */}
      <div className="glass absolute inset-x-4 top-[410px] flex items-center gap-3 rounded-2xl p-3">
        <motion.div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold" animate={today ? { rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.15, 1] } : {}} transition={{ delay: 0.6, duration: 0.6 }}>
          <I.gem size={20} />
        </motion.div>
        <div className="flex-1">
          <div className="text-xs font-bold">Недельный сундук</div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#e8a121] to-gold" initial={false} animate={{ width: `${(filled / 7) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 22 }} />
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-gold">{filled}/7</span>
      </div>
      <motion.div initial={false} animate={today ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 0.8, ...SPRING.panel }} className="absolute inset-x-6 bottom-8 text-center text-[11px] text-white/55">
        Не прерывай серию: завтра — сундук недели
      </motion.div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   23 · MATCHMAKING → VS — радар, слот имён, диагональный слэм
   ================================================================ */
const NAMES = ["TradeFox", "RiskLess", "WhaleHunt", "CandleMage", "BearSlayer", "DeltaNeutral", "StopHunter", "FOMO"];

export function Matchmaking({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [ph, setPh] = useState<"search" | "found" | "vs" | "count">("search");
  const [name, setName] = useState(0);
  const [sec, setSec] = useState(0);
  const [cnt, setCnt] = useState(3);
  const [blips, setBlips] = useState<{ id: number; x: number; y: number }[]>([]);

  useScript(run, async (wait) => {
    setPh("search");
    setSec(0);
    setCnt(3);
    setBlips([]);
    cue();
    // слот-машина имён: интервалы растут — «торможение барабана»
    const iv = [60, 60, 60, 70, 70, 80, 90, 100, 120, 140, 170, 210, 260, 320, 400];
    let t = 0;
    for (let i = 0; i < iv.length; i++) {
      await wait(iv[i]);
      t += iv[i];
      setName(i % NAMES.length);
      sfx.tick();
      if (i % 3 === 0) {
        const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 70;
        setBlips((b) => [...b.slice(-5), { id: Date.now() + i, x: Math.cos(a) * r, y: Math.sin(a) * r }]);
      }
      setSec(Math.floor(t / 1000));
    }
    setName(7);
    setPh("found");
    sfx.success();
    await wait(700);
    setPh("vs");
    await wait(380);
    sfx.vs();
    anim(scope.current, shakeKeys(1, 14, 12, 2.5), { duration: 0.45 });
    p.ring(150, 312, "#fff", 220, 0.6, 12);
    p.burst({ x: 150, y: 312, count: 70, colors: ["#2ee6c5", "#ff4d5e", "#fff", "#ffc34d"], speed: [250, 750], drag: 3.5 });
    await wait(1100);
    setPh("count");
    for (const n of [3, 2, 1, 0]) {
      setCnt(n);
      n ? sfx.tick() : sfx.hit(true);
      await wait(600);
    }
  });

  const vs = ph === "vs" || ph === "count";
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden bg-[#050811]">
      {/* SEARCH */}
      <motion.div className="absolute inset-0" animate={{ opacity: vs ? 0 : 1, scale: vs ? 1.3 : 1 }} transition={{ duration: 0.4, ease: EASE.inQuart }}>
        <SceneBg tint="#2ee6c5" />
        <div className="absolute left-1/2 top-[190px] h-[240px] w-[240px] -ml-[120px] -mt-[60px]">
          {[1, 0.7, 0.4].map((s, i) => (
            <div key={i} className="absolute rounded-full border border-teal/25" style={{ inset: `${(1 - s) * 50}%` }} />
          ))}
          <div className="absolute left-1/2 top-0 h-full w-px bg-teal/15" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-teal/15" />
          <motion.div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #2ee6c500 0deg, #2ee6c566 50deg, #2ee6c500 52deg)" }} animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
          <AnimatePresence>
            {blips.map((b) => (
              <motion.div key={b.id} className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-bear" style={{ x: b.x - 5, y: b.y - 5, boxShadow: "0 0 10px #ff4d5e" }} initial={{ scale: 0, opacity: 1 }} animate={{ scale: [0, 1.6, 1], opacity: [1, 1, 0.3] }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} />
            ))}
          </AnimatePresence>
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -ml-8 -mt-8 overflow-hidden rounded-full border-2 border-teal shadow-[0_0_20px_#2ee6c5]">
            <img src={hood} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="absolute inset-x-0 top-[400px] text-center">
          <div className="font-display text-base font-bold">{ph === "found" ? "Соперник найден" : "Поиск соперника"}</div>
          <div className="font-mono text-[11px] text-white/45">0:0{sec} · рейтинг 1980 ± 120</div>
        </div>
        <motion.div className="glass absolute inset-x-8 top-[460px] flex h-14 items-center gap-3 overflow-hidden rounded-2xl px-3" animate={ph === "found" ? { borderColor: "#ff4d5e", boxShadow: "0 0 30px #ff4d5e88", scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.4 }}>
          <div className="h-9 w-9 overflow-hidden rounded-full border border-bear/60">
            <img src={enemy} className="h-full w-full object-cover" style={{ filter: ph === "found" ? "none" : "blur(4px) grayscale(1)" }} />
          </div>
          <div className="relative h-6 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div key={name + ph} initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: -24 }} transition={{ duration: 0.06 }} className={`absolute inset-0 font-display text-sm font-bold ${ph === "found" ? "text-bear" : "text-white/70"}`}>
                {NAMES[name]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      {/* VS */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 42%, 0 58%)" }}
        initial={false}
        animate={vs ? { x: 0 } : { x: -340 }}
        transition={vs ? { type: "spring", stiffness: 300, damping: 26 } : { duration: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f6e61] via-[#0a3a3a] to-[#061a22]" />
        <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(-20deg, transparent 0 14px, #2ee6c533 14px 16px)" }} />
        <motion.img src={hood} className="mask-soft absolute -left-4 top-6 h-60 w-60 object-cover" initial={false} animate={vs ? { x: 0, scale: 1 } : { x: -60, scale: 1.2 }} transition={{ delay: 0.1, duration: 0.8, ease: EASE.outExpo }} />
        <div className="absolute right-5 top-[110px] text-right">
          <div className="text-[10px] font-bold tracking-[.3em] text-teal">УР. 12</div>
          <div className="font-display text-2xl font-black">Ты</div>
          <div className="font-mono text-xs text-white/60">1980</div>
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 58%, 100% 42%, 100% 100%, 0 100%)" }}
        initial={false}
        animate={vs ? { x: 0 } : { x: 340 }}
        transition={vs ? { type: "spring", stiffness: 300, damping: 26 } : { duration: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-[#6e0f1e] via-[#3a0a14] to-[#1a060b]" />
        <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(-20deg, transparent 0 14px, #ff4d5e33 14px 16px)" }} />
        <motion.img src={enemy} className="mask-soft absolute -right-4 bottom-10 h-60 w-60 object-cover" initial={false} animate={vs ? { x: 0, scale: 1 } : { x: 60, scale: 1.2 }} transition={{ delay: 0.1, duration: 0.8, ease: EASE.outExpo }} />
        <div className="absolute bottom-[130px] left-5">
          <div className="text-[10px] font-bold tracking-[.3em] text-bear">УР. 13</div>
          <div className="font-display text-2xl font-black">FOMO</div>
          <div className="font-mono text-xs text-white/60">2040</div>
        </div>
      </motion.div>
      {/* lightning divider */}
      <svg viewBox="0 0 300 624" className="pointer-events-none absolute inset-0 h-full w-full">
        <motion.path d="M-10 368 L60 350 L90 360 L150 318 L190 330 L240 290 L310 256" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" initial={false} animate={{ pathLength: vs ? 1 : 0, opacity: vs ? 1 : 0 }} transition={{ delay: vs ? 0.3 : 0, duration: 0.18 }} style={{ filter: "drop-shadow(0 0 6px #fff) drop-shadow(0 0 14px #ffc34d)" }} />
      </svg>
      <AnimatePresence>
        {vs && (
          <motion.div key="vs" initial={{ scale: 4, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ delay: 0.38, duration: 0.28, ease: EASE.snap }} className="absolute left-1/2 top-[312px] -ml-[50px] -mt-[36px] w-[100px] text-center font-display text-6xl font-black italic" style={{ color: "#ffc34d", WebkitTextStroke: "2px #3a2200", textShadow: "0 0 30px #ffc34d, 0 6px 0 #3a2200" }}>
            VS
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {ph === "count" && (
          <motion.div key={cnt} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.3, ease: EASE.snap }} className="absolute inset-0 grid place-items-center bg-black/40">
            <div className="font-display text-7xl font-black" style={{ color: cnt ? "#fff" : "#2ee6c5", textShadow: `0 0 40px ${cnt ? "#fff" : "#2ee6c5"}` }}>
              {cnt || "БОЙ!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}
