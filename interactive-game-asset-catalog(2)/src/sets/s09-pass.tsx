import { HoldButton as XHold } from "../components/controls";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import { Roll, Slider, useGhost } from "../components/controls";
import { Coin, I, fmt } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys, sleep } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const Y = "#fde047";
const REW = [
  I.gem,
  I.cards,
  I.bolt,
  I.trophy,
  I.sparkle,
  I.heart,
  I.target,
  I.flame,
];
const REW_C = [
  "#2ee6c5",
  "#9b7bff",
  "#4cc3ff",
  "#ffc34d",
  "#ff6bd6",
  "#ff4d5e",
  "#3ddc84",
  "#ff8a3d",
];

/* ================================================================
   56 · PASS TRACK — трек пропуска с увеличением в центре
   ================================================================ */
const TIERS = 20;
const TW = 74;
const CUR = 7;

function TierCol({
  i,
  x,
  claimed,
  premium,
  onClaim,
}: {
  i: number;
  x: MotionValue<number>;
  claimed: boolean;
  premium: boolean;
  onClaim: (i: number, el: HTMLElement) => void;
}) {
  const center = useTransform(x, (v) => i * TW + v + TW / 2 - 150);
  const scale = useTransform(center, [-150, 0, 150], [0.78, 1.12, 0.78]);
  const y = useTransform(center, [-150, 0, 150], [8, -6, 8]);
  const op = useTransform(
    center,
    [-200, -120, 0, 120, 200],
    [0.3, 0.7, 1, 0.7, 0.3],
  );
  const reached = i < CUR;
  const Ic = REW[i % REW.length];
  const PIc = REW[(i + 3) % REW.length];
  const c = REW_C[i % REW_C.length];
  return (
    <motion.div
      className="absolute top-0 flex w-[74px] flex-col items-center"
      style={{ left: i * TW, scale, y, opacity: op }}
    >
      <motion.button
        whileTap={reached && !claimed ? { scale: 0.85 } : undefined}
        onClick={(e) => reached && !claimed && onClaim(i, e.currentTarget)}
        className="relative grid h-[60px] w-[60px] place-items-center rounded-2xl border-2"
        style={{
          borderColor: reached ? c : "#ffffff1a",
          background: reached ? `${c}1f` : "#0c1428",
          color: reached ? c : "#ffffff44",
        }}
      >
        <Ic size={24} />
        {reached && !claimed && (
          <span
            className="pulse-ring absolute inset-0 rounded-2xl border-2"
            style={{ borderColor: c }}
          />
        )}
        {claimed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING.reward}
            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-bull text-black"
          >
            <I.check size={11} stroke={4} />
          </motion.div>
        )}
      </motion.button>
      <div
        className={`my-2 grid h-7 w-7 place-items-center rounded-full font-display text-[11px] font-black ${reached ? "bg-[#fde047] text-black" : "bg-white/10 text-white/50"}`}
      >
        {i + 1}
      </div>
      <div
        className="relative grid h-[60px] w-[60px] place-items-center rounded-2xl border-2"
        style={{
          borderColor: premium ? Y : "#ffffff14",
          background: premium ? `${Y}1a` : "#0c142888",
          color: premium ? Y : "#ffffff33",
        }}
      >
        <PIc size={22} />
        {!premium && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40">
            <I.lock size={14} className="text-white/60" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PassTrack({ run, cue }: SceneProps) {
  const x = useMotionValue(-(CUR - 2) * TW);
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const base = useRef(0);
  const bag = useRef<HTMLDivElement>(null);
  const g = useGhost();
  const p = useParticles();
  const min = -(TIERS * TW - 300);
  const progW = useTransform(x, (v) => `${clamp(-v / -min) * 100}%`);
  const lastC = useRef(0);
  useMotionValueEvent(x, "change", (v) => {
    const c = Math.round((-v + 150) / TW);
    if (c !== lastC.current) {
      lastC.current = c;
      sfx.spinTick(c);
    }
  });

  const claim = (i: number, el: HTMLElement) => {
    setClaimed((s) => new Set(s).add(i));
    sfx.pop(i % 6);
    const from = centerIn(el, root);
    const to = centerIn(bag.current, root);
    p.burst({
      x: from.x,
      y: from.y,
      count: 12,
      shape: "star",
      colors: [REW_C[i % REW_C.length], "#fff"],
      speed: [80, 220],
      size: [2, 4],
    });
    p.burst({
      x: from.x,
      y: from.y,
      count: 6,
      shape: "dot",
      size: [3, 5],
      colors: [REW_C[i % REW_C.length]],
      speed: [100, 200],
      target: to,
      stagger: 0.03,
      onArrive: () => undefined,
    });
    window.setTimeout(() => {
      setCount((c) => c + 1);
      sfx.coin(i);
      if (bag.current)
        animate(
          bag.current,
          { scale: [1.3, 1] },
          { type: "spring", stiffness: 500, damping: 12 },
        );
    }, 550);
  };

  useScript(run, async (wait) => {
    x.set(-(CUR + 5) * TW);
    setClaimed(new Set());
    setCount(0);
    await wait(500);
    cue();
    // «возврат» к текущему уровню: пружина от конца трека
    await animate(x, -(CUR - 3) * TW, {
      type: "spring",
      stiffness: 90,
      damping: 16,
    });
    await wait(300);
    g.show(150, 250);
    g.press(true);
    await Promise.all([
      g.move(230, 250, 0.5),
      animate(x, -(CUR - 5) * TW, { duration: 0.5 }),
    ]);
    g.press(false);
    await wait(300);
    // клеймим 3 уровня
    for (const k of [4, 5, 6]) {
      const px = k * TW + x.get() + TW / 2;
      await g.move(px, 230, 0.35);
      g.press(true);
      await wait(90);
      g.press(false);
      const el = root?.querySelectorAll("[data-tier]")[k] as
        HTMLElement | undefined;
      if (el) claim(k, el);
      await wait(350);
    }
    g.hide();
    if (root) animate(root, shakeKeys(0.2, 6, 4, 0), { duration: 0.2 });
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={Y} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-black">
            Боевой пропуск · Сезон 3
          </div>
          <div className="text-[10px] text-white/45">
            уровень {CUR} из {TIERS} · 12 дней
          </div>
        </div>
        <div
          ref={bag}
          className="glass relative grid h-10 w-10 place-items-center rounded-xl text-[#fde047]"
        >
          <I.gem size={18} />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-bull text-[10px] font-black text-black"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-x-4 top-[92px]">
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-white/50">XP до уровня {CUR + 1}</span>
          <span className="font-mono text-[#fde047]">640 / 1000</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[#fde047]"
            initial={{ width: 0 }}
            animate={{ width: "64%" }}
            transition={{ duration: 1, ease: EASE.outExpo }}
            style={{ boxShadow: `0 0 10px ${Y}` }}
          />
        </div>
      </div>
      <div className="absolute left-3 top-[140px] text-[9px] font-bold uppercase tracking-[.2em] text-white/40">
        Бесплатно
      </div>
      <div className="absolute left-3 top-[310px] text-[9px] font-bold uppercase tracking-[.2em] text-[#fde047]">
        Премиум
      </div>
      <motion.div
        className="absolute inset-x-0 top-[160px] h-[200px] cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        onPanStart={() => {
          base.current = x.get();
          x.stop();
        }}
        onPan={(_, i) => {
          let v = base.current + i.offset.x;
          if (v > 0) v = Math.pow(v, 0.7);
          if (v < min) v = min - Math.pow(min - v, 0.7);
          x.set(v);
        }}
        onPanEnd={(_, i) => {
          const proj = x.get() + i.velocity.x * 0.3;
          const snap = Math.round(proj / TW) * TW;
          animate(x, Math.max(min, Math.min(0, snap)), {
            type: "spring",
            stiffness: 200,
            damping: 26,
            velocity: i.velocity.x,
          });
        }}
      >
        <motion.div className="absolute inset-y-0 left-0" style={{ x }}>
          <div
            className="absolute left-0 top-[75px] h-1.5 rounded-full bg-white/10"
            style={{ width: TIERS * TW }}
          />
          <div
            className="absolute left-0 top-[75px] h-1.5 rounded-full bg-[#fde047]"
            style={{ width: CUR * TW - TW / 2, boxShadow: `0 0 10px ${Y}` }}
          />
          {Array.from({ length: TIERS }).map((_, i) => (
            <div key={i} data-tier>
              <TierCol
                i={i}
                x={x}
                claimed={claimed.has(i)}
                premium={false}
                onClaim={claim}
              />
            </div>
          ))}
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-4 top-[378px] h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-white/50"
          style={{ width: progW }}
        />
      </div>
      <div className="glass absolute inset-x-4 top-[400px] flex items-center gap-3 rounded-2xl p-3">
        <img src={hood} className="h-12 w-12 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[#fde047]">
            Награда 20 уровня
          </div>
          <div className="text-sm font-bold">Плащ «Золотая тень»</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => animate(x, min, { duration: 1.2, ease: EASE.camera })}
          className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold"
        >
          к концу
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          animate(x, -(CUR - 3) * TW, { duration: 0.8, ease: EASE.camera })
        }
        className="absolute inset-x-8 bottom-6 rounded-2xl bg-[#fde047] py-3 font-display text-sm font-black text-black shadow-[0_8px_30px_-6px_#fde047]"
      >
        К ТЕКУЩЕМУ УРОВНЮ
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   57 · TIER JUMP — покупка уровней с ускоряющимся каскадом
   ================================================================ */
export function TierJump({ run, cue }: SceneProps) {
  const n = useMotionValue(0);
  const [buy, setBuy] = useState(0);
  const [unlocked, setUnlocked] = useState(7);
  const [busy, setBusy] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  useMotionValueEvent(n, "change", (v) => setBuy(Math.round(v * 10)));

  const purchase = async () => {
    if (busy || buy === 0) return;
    setBusy(true);
    sfx.whoosh(0.4);
    const start = unlocked;
    for (let k = 0; k < buy; k++) {
      // интервал сокращается: 260 → 60 мс — ускорение как в слот-машине
      await sleep(Math.max(60, 260 - k * 26));
      const idx = start + k;
      setUnlocked(idx + 1);
      sfx.combo(k);
      const c = centerIn(cells.current[idx] ?? null, root);
      p.burst({
        x: c.x,
        y: c.y,
        count: 10,
        colors: [Y, "#fff"],
        speed: [60, 180],
      });
    }
    await sleep(200);
    sfx.levelup();
    if (root) animate(root, shakeKeys(0.6, 12, 8, 1.2), { duration: 0.4 });
    p.burst({
      x: 150,
      y: 200,
      count: 60,
      shape: "star",
      colors: [Y, "#fff", "#ffc34d"],
      speed: [150, 450],
      size: [2, 6],
    });
    animate(n, 0, { duration: 0.6, ease: EASE.outExpo });
    setBusy(false);
  };

  useScript(run, async (wait) => {
    n.set(0);
    setUnlocked(7);
    setBusy(false);
    await wait(500);
    cue();
    g.show(24, 432);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.6 * 252, 432, 0.9),
      animate(n, 0.6, { duration: 0.9, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(400);
    await g.move(150, 540, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    g.hide();
    await purchase();
  });

  const cost = buy * 150;
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={Y} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Прыжок по уровням</div>
        <div className="font-display text-sm font-black text-[#fde047]">
          ур. <Roll value={unlocked} />
        </div>
      </div>
      <div className="absolute inset-x-4 top-[90px] grid grid-cols-5 gap-2">
        {Array.from({ length: 20 }).map((_, i) => {
          const done = i < unlocked;
          const preview = !done && i < unlocked + buy;
          const Ic = REW[i % REW.length];
          return (
            <motion.div
              key={i}
              ref={(el) => {
                cells.current[i] = el;
              }}
              className="relative grid aspect-square place-items-center rounded-xl border-2"
              initial={false}
              animate={
                done
                  ? { borderColor: Y, background: `${Y}26`, color: Y, scale: 1 }
                  : preview
                    ? {
                        borderColor: `${Y}88`,
                        background: `${Y}0d`,
                        color: `${Y}aa`,
                        scale: [1, 1.06, 1],
                      }
                    : {
                        borderColor: "#ffffff14",
                        background: "#0c1428",
                        color: "#ffffff33",
                        scale: 1,
                      }
              }
              transition={
                preview
                  ? {
                      scale: { duration: 0.8, repeat: Infinity },
                      default: { duration: 0.2 },
                    }
                  : { type: "spring", stiffness: 400, damping: 14 }
              }
            >
              <Ic size={18} />
              <span className="absolute bottom-0.5 right-1 font-mono text-[8px] font-bold opacity-70">
                {i + 1}
              </span>
              {done && i >= 7 && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-x-4 top-[372px] flex items-baseline justify-between">
        <div className="text-[11px] text-white/60">
          Купить уровней:{" "}
          <Roll
            value={buy}
            color={Y}
            className="font-display text-base font-black"
          />
        </div>
        <div className="flex items-center gap-1 font-display text-base font-black text-gold">
          <Coin size={16} />
          <Roll value={fmt(cost)} />
        </div>
      </div>
      <div className="absolute inset-x-6 top-[416px]">
        <Slider
          mv={n}
          steps={10}
          color={Y}
          format={(v) => `+${Math.round(v * 10)}`}
        />
      </div>
      <motion.button
        onClick={purchase}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-12 rounded-2xl py-3.5 font-display text-sm font-black"
        animate={{
          background: buy ? Y : "#ffffff14",
          color: buy ? "#000" : "#ffffff55",
          scale: busy ? 0.96 : 1,
        }}
      >
        {busy
          ? "РАЗБЛОКИРОВКА…"
          : buy
            ? `ОТКРЫТЬ ${buy} УР.`
            : "ВЫБЕРИ КОЛИЧЕСТВО"}
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   58 · PREMIUM SWIPE-UP — подними карточку, и золото зальёт трек
   ================================================================ */
export function PremiumSwipe({ run, cue }: SceneProps) {
  const y = useMotionValue(0);
  const [done, setDone] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const prog = useTransform(y, (v) => clamp(-v / 220));
  const clip = useTransform(prog, (v) => `inset(${(1 - v) * 100}% 0 0 0)`);
  const rays = useTransform(prog, [0, 1], [0, 1]);
  const cardScale = useTransform(prog, [0, 1], [1, 1.08]);
  const cardRot = useTransform(prog, [0, 1], [0, -6]);
  const arrowOp = useTransform(prog, [0, 0.3], [1, 0]);
  const pct = useTransform(prog, (v) => `${Math.round(v * 100)}%`);
  const lastQ = useRef(0);
  useMotionValueEvent(prog, "change", (v) => {
    const q = Math.floor(v * 8);
    if (q !== lastQ.current) {
      lastQ.current = q;
      sfx.tick();
    }
  });

  const complete = async () => {
    setDone(true);
    sfx.impact();
    sfx.levelup();
    await animate(y, -700, { duration: 0.45, ease: EASE.inQuart });
    if (root) animate(root, shakeKeys(0.8, 14, 10, 1.5), { duration: 0.45 });
    p.ring(150, 320, Y, 240, 0.8, 10);
    p.burst({
      x: 150,
      y: 320,
      count: 80,
      shape: "star",
      colors: [Y, "#fff", "#ffc34d"],
      speed: [200, 600],
      size: [2, 6],
    });
  };
  const release = () => {
    if (prog.get() > 0.75) complete();
    else animate(y, 0, { type: "spring", stiffness: 300, damping: 18 });
  };

  useScript(run, async (wait) => {
    setDone(false);
    y.set(0);
    await wait(700);
    cue();
    g.show(150, 470);
    g.press(true);
    await Promise.all([
      g.move(150, 470 - 110, 0.6),
      animate(y, -110, { duration: 0.6 }),
    ]);
    g.press(false);
    await animate(y, 0, { type: "spring", stiffness: 300, damping: 18 });
    await wait(400);
    g.press(true);
    await Promise.all([
      g.move(150, 470 - 200, 0.7),
      animate(y, -200, { duration: 0.7, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
    await complete();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={Y} />
      {/* превью премиум-трека: заливается золотом снизу вверх */}
      <div className="absolute inset-x-4 top-[80px] grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const Ic = REW[(i + 3) % REW.length];
          return (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0c1428]"
            >
              <div className="absolute inset-0 grid place-items-center text-white/20">
                <Ic size={20} />
              </div>
              <motion.div
                className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#fde047]/40 to-[#fde047]/10 text-[#fde047]"
                style={{ clipPath: done ? "inset(0 0 0 0)" : clip }}
              >
                <Ic size={20} />
              </motion.div>
              {done && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                />
              )}
              {!done && (
                <I.lock
                  size={10}
                  className="absolute right-1 top-1 text-white/40"
                />
              )}
            </div>
          );
        })}
      </div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[420px] h-[600px] w-[600px] -ml-[300px] -mt-[300px]"
        style={{
          opacity: done ? 1 : rays,
          background: `repeating-conic-gradient(${Y}33 0 6deg, transparent 6deg 20deg)`,
          WebkitMaskImage: "radial-gradient(closest-side,#000 20%,transparent)",
          maskImage: "radial-gradient(closest-side,#000 20%,transparent)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <AnimatePresence>
        {!done ? (
          <motion.div
            key="card"
            className="absolute left-1/2 top-[330px] -ml-[110px] h-[200px] w-[220px] cursor-grab touch-none active:cursor-grabbing"
            style={{ y, scale: cardScale, rotate: cardRot }}
            onPanStart={() => sfx.tap()}
            onPan={(_, i) =>
              y.set(
                Math.min(20, i.offset.y < 0 ? i.offset.y : i.offset.y * 0.2),
              )
            }
            onPanEnd={release}
            exit={{ opacity: 0 }}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-3xl p-[3px]"
              style={{
                background:
                  "linear-gradient(150deg,#fff6b0,#fde047 35%,#8a6a08 65%,#ffe98a)",
                boxShadow: `0 20px 60px -10px ${Y}`,
              }}
            >
              <div className="sheen relative flex h-full flex-col items-center justify-center rounded-[21px] bg-gradient-to-b from-[#2a2408] to-[#0e0c04]">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-[#fde047]"
                >
                  <I.trophy size={44} />
                </motion.div>
                <div className="mt-2 font-display text-lg font-black">
                  ПРЕМИУМ
                </div>
                <div className="text-[10px] text-white/55">
                  +20 наград · x1.5 XP
                </div>
                <div className="mt-2 flex items-center gap-1 font-display text-sm font-black text-gold">
                  <Coin size={14} /> 990
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ delay: 0.3, duration: 0.3, ease: EASE.snap }}
            className="absolute left-1/2 top-[400px] -ml-[110px] w-[220px] rounded-2xl border-4 border-[#fde047] py-2 text-center font-display text-xl font-black text-[#fde047]"
            style={{ textShadow: `0 0 20px ${Y}` }}
          >
            ПРЕМИУМ АКТИВЕН
          </motion.div>
        )}
      </AnimatePresence>
      {!done && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[540px] flex flex-col items-center text-[#fde047]"
          style={{ opacity: arrowOp }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <I.arrowUp size={20} stroke={3} />
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-[.25em]">
            Потяни вверх
          </span>
        </motion.div>
      )}
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Премиум-пропуск</div>
        <motion.span className="font-mono text-[11px] text-[#fde047]">
          {pct}
        </motion.span>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   84 · CLAIM ALL — удержание забирает все награды каскадом
   ================================================================ */
const CLAIM_VALS = [50, 120, 80, 200, 60, 150, 90, 300];

export function ClaimAll({ run, cue }: SceneProps) {
  const prog = useMotionValue(0);
  const [claimed, setClaimed] = useState(0);
  const [total, setTotal] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const bag = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  const g = useGhost();
  const p = useParticles();
  const glow = useTransform(prog, (v) => `0 0 ${v * 50}px ${Y}`);
  const complete = async () => {
    for (let i = 0; i < CLAIM_VALS.length; i++) {
      // ускоряющийся ритм: 180 → 50 мс
      await sleep(Math.max(50, 180 - i * 18));
      setClaimed(i + 1);
      setTotal((t) => t + CLAIM_VALS[i]);
      sfx.coin(i);
      const from = centerIn(cells.current[i] ?? null, root);
      const to = centerIn(bag.current, root);
      p.burst({
        x: from.x,
        y: from.y,
        count: 6,
        shape: "dot",
        colors: [REW_C[i % REW_C.length]],
        speed: [80, 160],
        target: to,
        size: [3, 5],
      });
      if (bag.current)
        animate(
          bag.current,
          { scale: [1.25, 1] },
          { type: "spring", stiffness: 500, damping: 12 },
        );
    }
    await sleep(300);
    sfx.levelup();
    if (root) animate(root, shakeKeys(0.5, 10, 7, 1), { duration: 0.35 });
    p.burst({
      x: 150,
      y: 90,
      count: 40,
      shape: "star",
      colors: [Y, "#fff"],
      speed: [120, 340],
      size: [2, 5],
    });
    animate(prog, 0, { duration: 0.6, ease: EASE.outExpo });
  };
  useScript(run, async (wait) => {
    prog.set(0);
    setClaimed(0);
    setTotal(0);
    await wait(600);
    cue();
    g.show(150, 470);
    g.press(true);
    sfx.suck();
    await animate(prog, 1, { duration: 1.2, ease: "linear" });
    g.press(false);
    g.hide();
    await complete();
  });
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={Y} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Награды сезона</div>
        <div
          ref={bag}
          className="glass flex h-9 items-center gap-1.5 rounded-full pl-1.5 pr-3"
        >
          <Coin size={20} />
          <span className="font-display text-xs font-bold">
            <Roll value={fmt(total)} />
          </span>
        </div>
      </div>
      <div className="absolute inset-x-4 top-[100px] grid grid-cols-4 gap-2">
        {CLAIM_VALS.map((v, i) => {
          const Ic = REW[i % REW.length];
          const c = REW_C[i % REW_C.length];
          const done = i < claimed;
          return (
            <motion.div
              key={i}
              ref={(el) => {
                cells.current[i] = el;
              }}
              className="relative flex aspect-[.8] flex-col items-center justify-center gap-1 rounded-2xl border-2"
              initial={false}
              animate={
                done
                  ? { scale: 0.85, opacity: 0.35, borderColor: "#ffffff1a" }
                  : { scale: 1, opacity: 1, borderColor: `${c}88` }
              }
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{ background: `${c}14`, color: c }}
            >
              <Ic size={22} />
              <span className="font-display text-[11px] font-black">{v}</span>
              {done && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING.reward}
                  className="absolute inset-0 grid place-items-center text-bull"
                >
                  <I.check size={26} stroke={3} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-x-0 top-[330px] text-center">
        <div className="font-display text-lg font-black">
          <Roll value={claimed} color={Y} /> / {CLAIM_VALS.length}
        </div>
        <div className="text-[10px] text-white/50">
          Удерживай, чтобы забрать всё разом
        </div>
      </div>
      <motion.div
        className="absolute left-1/2 top-[420px] -ml-[50px] rounded-full"
        style={{ boxShadow: glow }}
      >
        <XHold
          mv={prog}
          ms={1200}
          color={Y}
          size={100}
          onStart={() => sfx.suck()}
          onCancel={() => sfx.error()}
          onComplete={complete}
        >
          <I.gem size={28} className="text-[#fde047]" />
        </XHold>
      </motion.div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_PASS: Category = {
  id: "pass",
  n: "18",
  title: "Боевой пропуск",
  en: "Track · Tier jump · Premium swipe",
  color: Y,
  blurb:
    "Сезонная прогрессия как аттракцион: трек с увеличением у центра и инерцией, покупка уровней с ускоряющимся каскадом, премиум, который «поднимают» свайпом вверх, заливая трек золотом.",
  scenes: [
    {
      id: "passtrack",
      n: "56",
      title: "Трек пропуска",
      kind: "Magnify scroller",
      lead: "Горизонтальный трек из 20 уровней. Элементы увеличиваются и приподнимаются у центра, тускнеют по краям, трек листается с инерцией и снэпом к уровню. Доступные награды пульсируют, тап — звёзды, частицы летят в сумку, сумка подпрыгивает.",
      secrets: [
        "Эффект «лупы» — scale, y и opacity каждого уровня от расстояния до центра экрана. Центр трека всегда — главное место.",
        "Инерция: проекция x + v·0.3, снэп к ближайшему уровню, пружина получает velocity жеста.",
        "На старте трек пружиной «возвращается» из конца к текущему уровню — игрок видит масштаб сезона за секунду.",
        "Тик на каждом пересечённом уровне — трек звучит как зубчатое колесо.",
        "Доступная награда пульсирует кольцом pulse-ring — «меня можно забрать» без текста.",
      ],
      tracks: [
        { label: "Возврат к ур. 7", start: 500, dur: 900, color: Y },
        { label: "Драг трека", start: 1700, dur: 500, color: "#ffffff" },
        { label: "Клейм ×3", start: 2500, dur: 1500, color: "#2ee6c5" },
        { label: "Частицы → сумка", start: 2600, dur: 1700, color: Y },
      ],
      total: 4500,
      ease: { bez: EASE.outExpo, label: "≈ spring снэпа" },
      code: `const center = useTransform(x, v => i * TW + v + TW / 2 - 150);
const scale  = useTransform(center, [-150, 0, 150], [.78, 1.12, .78]);
const y      = useTransform(center, [-150, 0, 150], [8, -6, 8]);

onPanEnd={(_, i) => {
  const snap = Math.round((x.get() + i.velocity.x * .3) / TW) * TW;
  animate(x, clamp(snap, min, 0), { type: "spring", stiffness: 200, damping: 26, velocity: i.velocity.x });
}}`,
      C: PassTrack,
      interactive: "Листай трек, забирай награды",
    },
    {
      id: "tierjump",
      n: "57",
      title: "Прыжок по уровням",
      kind: "Accelerating cascade",
      lead: "Ступенчатый слайдер выбирает, сколько уровней купить, — будущие ячейки пульсируют предпросмотром, цена прокручивается. Покупка запускает каскад разблокировок с ускорением и повышающимся тоном, в финале — фанфары, тряска и звёзды.",
      secrets: [
        "Предпросмотр: ячейки, которые откроются, пульсируют полупрозрачным золотом ДО покупки. Игрок видит результат решения.",
        "Интервал каскада 260 → 60мс (−26мс на шаг): ускорение ритма как в слот-машине, звук combo повышается на каждом шаге.",
        "Каждая открытая ячейка — белая вспышка opacity 0.8 → 0 и искры. Одинаковый микро-праздник, многократно = большой праздник.",
        "Финальный аккорд — levelup + trauma 0.6 + звёзды. Кульминация после разгона.",
        "Слайдер «сдувается» к нулю после покупки — состояние готово к следующему решению.",
      ],
      tracks: [
        { label: "Слайдер +6", start: 500, dur: 900, color: Y },
        { label: "Предпросмотр", start: 800, dur: 1100, color: `${Y}` },
        {
          label: "Каскад ×6 (ускорение)",
          start: 1900,
          dur: 1100,
          color: "#ffc34d",
        },
        { label: "Фанфары", start: 3200, dur: 600, color: "#ffffff" },
      ],
      total: 4000,
      ease: { bez: [0.5, 0, 0.9, 0.6], label: "ease-in — ускорение каскада" },
      code: `for (let k = 0; k < buy; k++) {
  await sleep(Math.max(60, 260 - k * 26));   // ритм ускоряется
  setUnlocked(start + k + 1);
  sfx.combo(k);                               // тон повышается
  sparks(cell(start + k));
}
sfx.levelup(); shake(.6); stars();`,
      C: TierJump,
      interactive: "Выбери число уровней",
    },
    {
      id: "premium",
      n: "58",
      title: "Премиум свайпом вверх",
      kind: "Swipe-up reveal",
      lead: "Золотую карточку тянут вверх. Она растёт и наклоняется, за ней разгораются лучи, а превью премиум-трека заливается золотом снизу вверх ровно на процент подъёма. Не дотянул — карточка падает обратно. Дотянул — она улетает, трек вспыхивает каскадом, падает штамп.",
      secrets: [
        "Прогресс жеста = clip-path inset((1 − v)·100% 0 0 0) на золотом слое трека. Награда проявляется ровно пропорционально усилию.",
        "Жест вниз гасится ×0.2 — карточку можно тянуть только вверх, без явных ограничений.",
        "Тик каждые 12.5% подъёма — звуковая шкала усилия.",
        "Недотянул — пружина 300/18 роняет карточку. Дотянул — ease-in улёт вверх: «отпустили — и она ушла сама».",
        "Финальная вспышка трека каскадом 40мс по ячейкам — золото «растекается».",
      ],
      tracks: [
        { label: "Подъём 50%", start: 700, dur: 600, color: Y },
        { label: "Падение назад", start: 1300, dur: 500, color: "#ff4d5e" },
        { label: "Подъём 90%", start: 2200, dur: 700, color: Y },
        { label: "Улёт + вспышка", start: 2900, dur: 500, color: "#ffffff" },
        { label: "Каскад трека", start: 3400, dur: 700, color: Y },
      ],
      total: 4300,
      ease: { bez: EASE.inQuart, label: "inQuart — улёт" },
      code: `const prog = useTransform(y, v => clamp(-v / 220));
const clip = useTransform(prog, v => \`inset(\${(1 - v) * 100}% 0 0 0)\`);
<motion.div style={{ clipPath: clip }} className="bg-gold/40" />

onPan={(_, i) => y.set(i.offset.y < 0 ? i.offset.y : i.offset.y * .2)}
onPanEnd={() => prog.get() > .75
  ? animate(y, -700, { duration: .45, ease: EASE.inQuart })
  : animate(y, 0, { type: "spring", stiffness: 300, damping: 18 })}`,
      C: PremiumSwipe,
      interactive: "Тяни карточку вверх",
    },
    {
      id: "claimall",
      n: "84",
      title: "Забрать всё удержанием",
      kind: "Hold cascade",
      lead: "Восемь наград сезона ждут в сетке. Удержание заряжает кольцо и свечение, по завершении награды забираются каскадом с ускорением: каждая гаснет с галочкой, частицы летят в кошелёк, счётчик прокручивается, в конце — фанфары.",
      secrets: [
        "Удержание вместо кнопки: «забрать всё» — значимое действие, и оно требует намерения.",
        "Ритм каскада 180 → 50мс: ускорение превращает рутину в праздник.",
        "Забранная ячейка не исчезает, а гаснет до 35% с галочкой — прогресс виден, сетка не перестраивается.",
        "Частицы каждой награды летят своим цветом — кошелёк «собирает радугу».",
        "Кошелёк подпрыгивает на каждой награде пружиной 500/12 — счёт ощущается ударами.",
      ],
      tracks: [
        { label: "Удержание", start: 600, dur: 1200, color: Y },
        { label: "Каскад ×8", start: 1800, dur: 1000, color: "#ffc34d" },
        { label: "Фанфары", start: 3100, dur: 600, color: "#ffffff" },
      ],
      total: 3900,
      ease: { bez: [0.5, 0, 0.9, 0.6], label: "ease-in — ускорение каскада" },
      code: `for (let i = 0; i < N; i++) {
  await sleep(Math.max(50, 180 - i * 18));
  setClaimed(i + 1); sfx.coin(i);
  p.burst({ from: cell(i), target: wallet, colors: [REW_C[i]] });
  animate(wallet, { scale: [1.25, 1] }, { type: "spring", stiffness: 500, damping: 12 });
}`,
      C: ClaimAll,
      interactive: "Удерживай кнопку",
    },
  ],
};
