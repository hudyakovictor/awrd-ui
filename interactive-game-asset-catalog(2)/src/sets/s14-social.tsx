import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import hood from "../assets/hood.jpg";
import enemy from "../assets/enemy.jpg";
import arena from "../assets/arena.jpg";
import type { Category } from "../data/catalog";
import { Roll, Slider, useGhost } from "../components/controls";
import { Candles, genCandles, I } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const V = "#818cf8";
type Ico = (p: {
  size?: number;
  className?: string;
  stroke?: number;
}) => ReactNode;
const REACT: { n: string; icon: Ico; c: string }[] = [
  { n: "Огонь", icon: I.flame, c: "#ff8a3d" },
  { n: "Сердце", icon: I.heart, c: "#ff4d5e" },
  { n: "Мозг", icon: I.brain, c: "#9b7bff" },
  { n: "Цель", icon: I.target, c: "#3ddc84" },
  { n: "Молния", icon: I.bolt, c: "#ffc34d" },
  { n: "Кубок", icon: I.trophy, c: "#4cc3ff" },
];

/* ================================================================
   75 · REACTION FAN — долгое нажатие → веер, скольжение → лупа
   ================================================================ */
function FanItem({
  i,
  fx,
  open,
  active,
}: {
  i: number;
  fx: MotionValue<number>;
  open: boolean;
  active: boolean;
}) {
  const r = REACT[i];
  const cx = 24 + i * 42;
  const scale = useTransform(fx, (x) =>
    x < 0 ? 1 : 1 + Math.max(0, 1 - Math.abs(x - cx) / 60) * 0.8,
  );
  const y = useTransform(scale, (s) => -(s - 1) * 26);
  return (
    <motion.div
      className="absolute bottom-2 grid h-9 w-9 -ml-[18px] place-items-center rounded-full"
      style={{ left: cx, scale, y, background: `${r.c}26`, color: r.c }}
      initial={false}
      animate={
        open
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.3 }
      }
      transition={{
        delay: open ? i * 0.035 : (5 - i) * 0.02,
        ...SPRING.reward,
      }}
    >
      <r.icon size={20} />
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-7 whitespace-nowrap rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white"
          >
            {r.n}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ReactionFan({ run, cue }: SceneProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [counts, setCounts] = useState([12, 48, 7, 3, 21, 5]);
  const [mine, setMine] = useState<number | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const fx = useMotionValue(-1);
  const fanRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const holdT = useRef<number | null>(null);
  const g = useGhost();
  const p = useParticles();
  useMotionValueEvent(fx, "change", (x) => {
    if (x < 0) return setHover(null);
    const i = Math.max(0, Math.min(5, Math.round((x - 24) / 42)));
    setHover((h) => {
      if (h !== i) sfx.tick();
      return i;
    });
  });
  const release = (i: number | null) => {
    setOpen(false);
    fx.set(-1);
    if (i === null) return;
    setMine(i);
    setCounts((c) => c.map((v, k) => (k === i ? v + 1 : v)));
    sfx.pop(i * 2);
    const fan = fanRef.current?.getBoundingClientRect();
    const rr = root?.getBoundingClientRect();
    const from =
      fan && rr
        ? { x: fan.left - rr.left + 24 + i * 42, y: fan.top - rr.top + 20 }
        : { x: 150, y: 300 };
    const to = centerIn(counterRefs.current[i] ?? null, root);
    p.burst({
      x: from.x,
      y: from.y,
      count: 16,
      colors: [REACT[i].c, "#fff"],
      speed: [80, 240],
    });
    p.burst({
      x: from.x,
      y: from.y,
      count: 6,
      shape: "dot",
      colors: [REACT[i].c],
      speed: [80, 160],
      target: to,
      stagger: 0.04,
      size: [3, 5],
    });
  };
  const toX = (e: React.PointerEvent) => {
    const r = fanRef.current?.getBoundingClientRect();
    if (!r) return;
    fx.set(((e.clientX - r.left) / r.width) * 252);
  };

  useScript(run, async (wait) => {
    setOpen(false);
    setMine(null);
    setCounts([12, 48, 7, 3, 21, 5]);
    fx.set(-1);
    await wait(700);
    cue();
    g.show(80, 420);
    g.press(true);
    await wait(450);
    setOpen(true);
    sfx.whoosh(0.2);
    await wait(300);
    const fanTop = 386;
    await g.move(40, fanTop, 0.3);
    for (const x of [24, 66, 108, 150, 192, 150, 108]) {
      await Promise.all([
        g.move(16 + x, fanTop, 0.18),
        animate(fx, x, { duration: 0.18 }),
      ]);
      await wait(120);
    }
    g.press(false);
    release(2);
    await wait(500);
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={V} />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Сообщество
      </div>
      <div className="glass absolute inset-x-4 top-[80px] rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <img src={enemy} className="h-9 w-9 rounded-full object-cover" />
          <div>
            <div className="text-[12px] font-bold">CryptoMadness</div>
            <div className="text-[9px] text-white/45">2 ч назад</div>
          </div>
        </div>
        <div className="mt-2 text-[12px] text-white/80">
          Отработал сетап на 15м. Ждал ретест — и дождался.
        </div>
        <div className="mt-2 overflow-hidden rounded-xl bg-black/30 p-2">
          <Candles
            data={genCandles(20, 44, 0.14)}
            w={238}
            h={90}
            grow={false}
            highlight={17}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REACT.map((r, i) => (
            <motion.div
              key={r.n}
              ref={(el) => {
                counterRefs.current[i] = el;
              }}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              animate={{
                background: mine === i ? `${r.c}40` : `${r.c}14`,
                scale: mine === i ? [1.3, 1] : 1,
              }}
              style={{ color: r.c }}
            >
              <r.icon size={11} /> <Roll value={counts[i]} />
            </motion.div>
          ))}
        </div>
      </div>
      <div
        ref={fanRef}
        className="absolute left-4 top-[360px] h-[52px] w-[252px] touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          holdT.current = window.setTimeout(() => {
            setOpen(true);
            sfx.whoosh(0.2);
            toX(e);
          }, 350);
        }}
        onPointerMove={(e) => open && toX(e)}
        onPointerUp={() => {
          if (holdT.current) clearTimeout(holdT.current);
          if (open) release(hover);
          else {
            release(1);
          }
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10 bg-[#0c1428]/95"
          initial={false}
          animate={{ scaleX: open ? 1 : 0.3, opacity: open ? 1 : 0 }}
          style={{ originX: 0.1 }}
          transition={SPRING.panel}
        />
        {REACT.map((_, i) => (
          <FanItem
            key={i}
            i={i}
            fx={fx}
            open={open}
            active={open && hover === i}
          />
        ))}
      </div>
      <div className="absolute left-4 top-[420px] flex items-center gap-2 text-[11px] font-bold text-white/60">
        <motion.div
          animate={{ scale: open ? 0.85 : 1 }}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15"
          style={{ color: mine !== null ? REACT[mine].c : "#ffffffaa" }}
        >
          {mine !== null ? (
            (() => {
              const Ic = REACT[mine].icon;
              return <Ic size={16} />;
            })()
          ) : (
            <I.heart size={16} />
          )}
        </motion.div>
        Тап — сердце · удержание — веер реакций
      </div>
      <div className="absolute inset-x-4 bottom-6 text-center text-[10px] text-white/40">
        Удерживай и веди пальцем по вееру — реакция под пальцем увеличивается
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   76 · EMOTE WHEEL — радиальное меню: тяни из центра к сектору
   ================================================================ */
const EMOTES = [
  { n: "GG", c: "#3ddc84" },
  { n: "Жду ретест", c: "#4cc3ff" },
  { n: "Ловушка!", c: "#ff4d5e" },
  { n: "Хорош", c: "#ffc34d" },
  { n: "Спокойно", c: "#9b7bff" },
  { n: "Ещё раз", c: "#2ee6c5" },
  { n: "Туман...", c: "#cfd8ea" },
  { n: "В луну", c: "#ff8a3d" },
];
const WR = 100;

export function EmoteWheel({ run, cue }: SceneProps) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [shown, setShown] = useState<{ id: number; i: number } | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const g = useGhost();
  const p = useParticles();
  const center = useRef({ x: 0, y: 0 });
  const lineLen = useTransform([px, py], ([x, y]: number[]) =>
    Math.min(WR, Math.hypot(x, y)),
  );
  const lineRot = useTransform(
    [px, py],
    ([x, y]: number[]) => (Math.atan2(y, x) * 180) / Math.PI,
  );
  const update = (x: number, y: number) => {
    px.set(x);
    py.set(y);
    const d = Math.hypot(x, y);
    if (d < 28) return setSel(null);
    const a = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const i = Math.floor((a + Math.PI / 8) / (Math.PI / 4)) % 8;
    setSel((s) => {
      if (s !== i) sfx.tick();
      return i;
    });
  };
  const fire = (i: number | null) => {
    setOpen(false);
    px.set(0);
    py.set(0);
    if (i === null) return;
    setShown({ id: Date.now(), i });
    sfx.pop(i);
    sfx.success();
    p.burst({
      x: 150,
      y: 150,
      count: 40,
      colors: [EMOTES[i].c, "#fff"],
      speed: [120, 360],
    });
    window.setTimeout(() => setShown(null), 1600);
  };

  useScript(run, async (wait) => {
    setOpen(false);
    setShown(null);
    await wait(700);
    cue();
    g.show(150, 430);
    g.press(true);
    setOpen(true);
    sfx.whoosh(0.2);
    await wait(400);
    for (const i of [1, 2, 3]) {
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      const tx = Math.cos(a) * 80,
        ty = Math.sin(a) * 80;
      const sx = px.get(),
        sy = py.get();
      for (let s = 1; s <= 8; s++) {
        const nx = sx + ((tx - sx) * s) / 8,
          ny = sy + ((ty - sy) * s) / 8;
        update(nx, ny);
        g.x.set(150 + nx);
        g.y.set(430 + ny);
        await wait(28);
      }
      await wait(260);
    }
    g.press(false);
    fire(3);
    await wait(1800);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={arena}
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/80 to-[#060a16]" />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Эмоуты в бою
      </div>
      {/* аватары соперников */}
      <div className="absolute left-1/2 top-[90px] -ml-[40px] h-20 w-20 overflow-hidden rounded-full border-2 border-teal">
        <img src={hood} className="h-full w-full object-cover" />
      </div>
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.id}
            className="absolute left-1/2 top-[178px] -ml-[80px] w-[160px] rounded-2xl border-2 px-3 py-2 text-center font-display text-base font-black"
            style={{
              borderColor: EMOTES[shown.i].c,
              color: EMOTES[shown.i].c,
              background: "#0c1428ee",
            }}
            initial={{ scale: 0, y: 20, rotate: -10 }}
            animate={{ scale: [0, 1.25, 1], y: 0, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: EASE.overshoot }}
          >
            {EMOTES[shown.i].n}
            <div
              className="absolute -bottom-2 left-1/2 h-3 w-3 -ml-1.5 rotate-45 border-b-2 border-r-2 bg-[#0c1428]"
              style={{ borderColor: EMOTES[shown.i].c }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* колесо */}
      <div className="absolute left-1/2 top-[430px] h-0 w-0">
        <AnimatePresence>
          {open && (
            <motion.div
              key="w"
              className="absolute -left-[120px] -top-[120px] h-[240px] w-[240px]"
              initial={{ scale: 0.2, opacity: 0, rotate: -60 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
              transition={SPRING.panel}
            >
              <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0c1428]/90 backdrop-blur" />
              {EMOTES.map((e, i) => {
                const a = (i * Math.PI) / 4 - Math.PI / 2;
                const on = sel === i;
                return (
                  <motion.div
                    key={e.n}
                    className="absolute grid h-[54px] w-[54px] -ml-[27px] -mt-[27px] place-items-center rounded-full text-center text-[9px] font-black leading-tight"
                    style={{
                      left: 120 + Math.cos(a) * 88,
                      top: 120 + Math.sin(a) * 88,
                      color: e.c,
                    }}
                    animate={{
                      scale: on ? 1.3 : 1,
                      background: on ? `${e.c}33` : "#ffffff08",
                      boxShadow: on ? `0 0 20px ${e.c}` : "0 0 0 #0000",
                    }}
                    transition={SPRING.tap}
                  >
                    {e.n}
                  </motion.div>
                );
              })}
              <motion.div
                className="absolute left-1/2 top-1/2 h-1 origin-left rounded-full"
                style={{
                  width: lineLen,
                  rotate: lineRot,
                  background: sel !== null ? EMOTES[sel].c : "#ffffff55",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="absolute -left-8 -top-8 grid h-16 w-16 cursor-grab touch-none place-items-center rounded-full border-2 border-white/20 bg-gradient-to-b from-[#1d2b4f] to-[#0c1428] text-white/80"
          animate={{ scale: open ? 0.8 : 1 }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            center.current = { x: e.clientX, y: e.clientY };
            setOpen(true);
            sfx.whoosh(0.2);
          }}
          onPointerMove={(e) =>
            open &&
            update(e.clientX - center.current.x, e.clientY - center.current.y)
          }
          onPointerUp={() => fire(sel)}
        >
          <I.sparkle size={24} />
        </motion.div>
      </div>
      {!open && (
        <div className="absolute inset-x-6 bottom-8 text-center text-[10px] text-white/40">
          Зажми кнопку и тяни к нужной фразе
        </div>
      )}
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   77 · VERTICAL FEED — снэп по экранам + двойной тап «лайк»
   ================================================================ */
const POSTS = [
  {
    u: "SignalRider",
    t: "Ретест отработал по учебнику",
    seed: 4,
    c: "#3ddc84",
    img: hood,
  },
  {
    u: "FOMO",
    t: "Кто купил на хаях? Признавайтесь",
    seed: 23,
    c: "#ff4d5e",
    img: enemy,
  },
  {
    u: "RiskLess",
    t: "Стоп спас депозит. Снова.",
    seed: 31,
    c: "#4cc3ff",
    img: hood,
  },
];
const PH = 624;

export function VerticalFeed({ run, cue }: SceneProps) {
  const y = useMotionValue(0);
  const [idx, setIdx] = useState(0);
  const [likes, setLikes] = useState([false, false, false]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const base = useRef(0);
  const lastTap = useRef(0);
  const idxRef = useRef(0);
  const g = useGhost();
  const p = useParticles();
  const go = (n: number, v = 0) => {
    const t = clamp(n, 0, POSTS.length - 1);
    if (t !== idxRef.current) sfx.swipe(t > idxRef.current ? 1 : -1);
    idxRef.current = t;
    setIdx(t);
    animate(y, -t * PH, {
      type: "spring",
      stiffness: 260,
      damping: 30,
      velocity: v,
    });
  };
  const like = (x: number, yy: number) => {
    setLikes((l) => l.map((v, k) => (k === idxRef.current ? true : v)));
    setHearts((h) => [...h, { id: Date.now(), x, y: yy }]);
    sfx.pop(6);
    p.burst({
      x,
      y: yy,
      count: 24,
      colors: ["#ff4d5e", "#ff9aa6", "#fff"],
      speed: [100, 300],
    });
  };

  useScript(run, async (wait) => {
    y.set(0);
    idxRef.current = 0;
    setIdx(0);
    setLikes([false, false, false]);
    await wait(700);
    cue();
    g.show(140, 300);
    for (let k = 0; k < 2; k++) {
      g.press(true);
      await wait(60);
      g.press(false);
      await wait(90);
    }
    like(140, 300);
    await wait(900);
    await g.move(150, 450, 0.3);
    g.press(true);
    await Promise.all([
      g.move(150, 200, 0.35),
      animate(y, -250, { duration: 0.35 }),
    ]);
    g.press(false);
    go(1, -1200);
    await wait(1100);
    await g.move(150, 450, 0.3);
    g.press(true);
    await Promise.all([
      g.move(150, 180, 0.3),
      animate(y, -PH - 260, { duration: 0.3 }),
    ]);
    g.press(false);
    go(2, -1500);
    await wait(900);
    await g.move(160, 280, 0.3);
    for (let k = 0; k < 2; k++) {
      g.press(true);
      await wait(60);
      g.press(false);
      await wait(90);
    }
    like(160, 280);
    await wait(700);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <motion.div
        className="absolute inset-x-0 top-0 touch-none"
        style={{ y, height: PH * POSTS.length }}
        onPanStart={() => {
          base.current = y.get();
          y.stop();
        }}
        onPan={(_, i) => {
          let v = base.current + i.offset.y;
          const min = -(POSTS.length - 1) * PH;
          if (v > 0) v = Math.pow(v, 0.7);
          if (v < min) v = min - Math.pow(min - v, 0.7);
          y.set(v);
        }}
        onPanEnd={(_, i) => {
          const proj = i.offset.y + i.velocity.y * 0.2;
          go(
            idxRef.current + (proj < -PH / 4 ? 1 : proj > PH / 4 ? -1 : 0),
            i.velocity.y,
          );
        }}
        onTap={(e, info) => {
          const now = performance.now();
          if (now - lastTap.current < 300) {
            const r = (e.target as HTMLElement)
              .closest("[data-feed]")
              ?.getBoundingClientRect();
            like(
              r ? info.point.x - r.left : 150,
              r ? info.point.y - r.top - idxRef.current * 0 : 300,
            );
          }
          lastTap.current = now;
        }}
      >
        {POSTS.map((po, i) => (
          <div
            key={i}
            data-feed
            className="relative overflow-hidden"
            style={{ height: PH }}
          >
            <img
              src={po.img}
              className="absolute inset-0 h-full w-full object-cover opacity-50"
              style={{ filter: `hue-rotate(${i * 60}deg)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
            <div className="glass absolute inset-x-6 top-[150px] rounded-2xl p-3">
              <Candles
                data={genCandles(22, po.seed, 0.12)}
                w={228}
                h={120}
                grow={i === idx}
                step={0.02}
              />
            </div>
            <div className="absolute bottom-16 left-4 right-16">
              <div className="flex items-center gap-2">
                <img
                  src={po.img}
                  className="h-8 w-8 rounded-full border-2 object-cover"
                  style={{ borderColor: po.c }}
                />
                <span className="text-[12px] font-bold">{po.u}</span>
              </div>
              <div className="mt-2 text-[13px] font-bold">{po.t}</div>
            </div>
            <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4">
              <motion.div
                animate={likes[i] ? { scale: [1, 1.4, 1] } : {}}
                className={likes[i] ? "text-bear" : "text-white"}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={likes[i] ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6-8 11-8 11z" />
                </svg>
              </motion.div>
              <I.news size={24} className="text-white" />
              <I.arrowR size={24} className="text-white" />
            </div>
          </div>
        ))}
      </motion.div>
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            className="pointer-events-none absolute z-30 -ml-12 -mt-12 text-bear"
            style={{ left: h.x, top: h.y }}
            initial={{ scale: 0, rotate: -20, opacity: 1 }}
            animate={{
              scale: [0, 1.4, 1.1],
              rotate: [-20, 10, 0],
              y: [0, -10, -80],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.9,
              times: [0, 0.3, 1],
              ease: EASE.outExpo,
            }}
            onAnimationComplete={() =>
              setHearts((a) => a.filter((q) => q.id !== h.id))
            }
          >
            <svg
              width="96"
              height="96"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ filter: "drop-shadow(0 0 16px #ff4d5e)" }}
            >
              <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6-8 11-8 11z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
        {POSTS.map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            animate={{
              height: i === idx ? 20 : 6,
              background: i === idx ? "#fff" : "#ffffff55",
            }}
            transition={SPRING.panel}
          />
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   78 · CROWD POLL — голосуй слайдером, толпа перетекает
   ================================================================ */
export function CrowdPoll({ run, cue }: SceneProps) {
  const vote = useMotionValue(0.5);
  const [done, setDone] = useState(false);
  const [side, setSide] = useState<0 | 1 | null>(null);
  const g = useGhost();
  const p = useParticles();
  const lean = useTransform(vote, [0, 1], [-1, 1]);
  const bgL = useTransform(
    vote,
    (v) => `rgba(61,220,132,${0.05 + (1 - v) * 0.3})`,
  );
  const bgR = useTransform(vote, (v) => `rgba(255,77,94,${0.05 + v * 0.3})`);
  const RES = { long: 38, short: 62 };
  const submit = () => {
    const v = vote.get();
    if (Math.abs(v - 0.5) < 0.12) {
      sfx.error();
      animate(vote, 0.5, { type: "spring", stiffness: 400, damping: 12 });
      return;
    }
    const s: 0 | 1 = v < 0.5 ? 0 : 1;
    setSide(s);
    setDone(true);
    sfx.success();
    animate(vote, s ? 1 : 0, SPRING.panel);
    p.burst({
      x: s ? 230 : 70,
      y: 200,
      count: 40,
      colors: [s ? "#ff4d5e" : "#3ddc84", "#fff"],
      speed: [100, 300],
    });
  };

  useScript(run, async (wait) => {
    vote.set(0.5);
    setDone(false);
    setSide(null);
    await wait(700);
    cue();
    g.show(150, 430);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.2 * 252, 430, 0.6),
      animate(vote, 0.2, { duration: 0.6, ease: EASE.camera }),
    ]);
    await Promise.all([
      g.move(24 + 0.85 * 252, 430, 0.8),
      animate(vote, 0.85, { duration: 0.8, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(300);
    await g.move(150, 520, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    submit();
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={V} />
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: bgL }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: bgR }}
      />
      <div className="absolute inset-x-4 top-11 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/50">
          Опрос сообщества
        </div>
        <div className="mt-1 text-[14px] font-bold">BTC через неделю?</div>
      </div>
      {/* толпа: 24 аватара, наклоняются к выбору */}
      <div className="absolute inset-x-6 top-[110px] grid grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <CrowdDot key={i} i={i} lean={lean} done={done} />
        ))}
      </div>
      <div className="absolute inset-x-6 top-[290px] flex justify-between font-display text-lg font-black">
        <motion.span
          style={{ scale: useTransform(vote, [0, 0.5], [1.3, 1]) }}
          className="text-bull"
        >
          ЛОНГ
        </motion.span>
        <motion.span
          style={{ scale: useTransform(vote, [0.5, 1], [1, 1.3]) }}
          className="text-bear"
        >
          ШОРТ
        </motion.span>
      </div>
      <AnimatePresence>
        {done && (
          <motion.div
            key="res"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-6 top-[330px] space-y-2"
          >
            {[
              { n: "Лонг", v: RES.long, c: "#3ddc84", me: side === 0 },
              { n: "Шорт", v: RES.short, c: "#ff4d5e", me: side === 1 },
            ].map((r, k) => (
              <div
                key={r.n}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                <motion.div
                  className="absolute inset-y-0 left-0"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.v}%` }}
                  transition={{
                    delay: 0.2 + k * 0.15,
                    duration: 0.9,
                    ease: EASE.outExpo,
                  }}
                  style={{ background: `${r.c}33` }}
                />
                <div className="relative flex justify-between text-[12px] font-bold">
                  <span>
                    {r.n}{" "}
                    {r.me && (
                      <span className="ml-1 rounded bg-white/15 px-1 text-[9px]">
                        ты
                      </span>
                    )}
                  </span>
                  <Roll value={`${r.v}%`} color={r.c} />
                </div>
              </div>
            ))}
            <div className="text-center text-[10px] text-white/45">
              Толпа чаще ошибается на экстремумах — думай сам
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-6 top-[416px]">
        <Slider
          mv={vote}
          gradient="linear-gradient(90deg,#3ddc84,#818cf8,#ff4d5e)"
          color={V}
          format={(v) =>
            Math.abs(v - 0.5) < 0.12
              ? "не решил"
              : v < 0.5
                ? `лонг ${Math.round((0.5 - v) * 200)}%`
                : `шорт ${Math.round((v - 0.5) * 200)}%`
          }
        />
      </div>
      <motion.button
        onClick={submit}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-12 rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: done ? "#ffffff14" : V,
          color: done ? "#ffffff66" : "#0c1428",
        }}
      >
        {done ? "ГОЛОС ПРИНЯТ" : "ПРОГОЛОСОВАТЬ"}
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

function CrowdDot({
  i,
  lean,
  done,
}: {
  i: number;
  lean: MotionValue<number>;
  done: boolean;
}) {
  const bias = ((i * 37) % 10) / 10 - 0.5;
  const x = useTransform(lean, (l) => l * (8 + bias * 10));
  const rot = useTransform(lean, (l) => l * 14);
  const isShort = i % 8 < 5;
  return (
    <motion.div
      className="aspect-square overflow-hidden rounded-full border-2"
      style={{ x, rotate: rot }}
      animate={
        done
          ? { borderColor: isShort ? "#ff4d5e" : "#3ddc84", scale: [1, 1.2, 1] }
          : { borderColor: "#ffffff22" }
      }
      transition={{ delay: done ? i * 0.02 : 0, duration: 0.35 }}
    >
      <img
        src={i % 3 ? hood : enemy}
        className="h-full w-full object-cover"
        style={{ filter: `hue-rotate(${i * 25}deg)` }}
      />
    </motion.div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_SOCIAL: Category = {
  id: "social",
  n: "23",
  title: "Сообщество",
  en: "Reaction fan · Emote wheel · Feed · Poll",
  color: V,
  blurb:
    "Социальные жесты игрового качества: веер реакций с лупой под пальцем, радиальное колесо эмоутов, вертикальная лента со снэпом и двойным тапом, опрос, где толпа наклоняется за слайдером.",
  scenes: [
    {
      id: "reactions",
      n: "75",
      title: "Веер реакций",
      kind: "Long-press fan",
      lead: "Короткий тап — сердце. Долгое нажатие раскрывает веер из шести реакций каскадом. Ведёшь пальцем — реакция под ним увеличивается и поднимается, как в доке macOS, появляется подпись. Отпускаешь — реакция вспыхивает и частицы летят к счётчику.",
      secrets: [
        "Лупа — scale = 1 + max(0, 1 − |x − центр|/60)·0.8 для каждой иконки от одного MotionValue пальца. Соседи тоже слегка растут — эффект дока.",
        "Подъём иконки пропорционален её масштабу: y = −(s − 1)·26. Увеличенная не перекрывает соседей.",
        "Долгое нажатие — таймер 350мс; короче — обычный лайк. Один жест, два уровня глубины.",
        "Раскрытие каскадом 35мс слева направо, закрытие — в обратном порядке 20мс. Выход зеркален и быстрее.",
        "Тик на смене реакции под пальцем — выбор ощущается зубцами.",
      ],
      tracks: [
        { label: "Удержание 450мс", start: 700, dur: 450, color: V },
        { label: "Веер каскадом", start: 1150, dur: 400, color: "#ff8a3d" },
        { label: "Скольжение-лупа", start: 1750, dur: 2100, color: "#ffffff" },
        { label: "Выбор + частицы", start: 3900, dur: 700, color: "#9b7bff" },
      ],
      total: 4800,
      ease: { bez: EASE.overshoot, label: "overshoot — веер" },
      code: `const scale = useTransform(fx, x => 1 + Math.max(0, 1 - Math.abs(x - cx) / 60) * .8);
const y     = useTransform(scale, s => -(s - 1) * 26);
onPointerDown={() => hold = setTimeout(openFan, 350)}
onPointerMove={e => open && fx.set(localX(e))}
onPointerUp={() => open ? react(hover) : like()}`,
      C: ReactionFan,
      interactive: "Удерживай и веди по вееру",
    },
    {
      id: "emotewheel",
      n: "76",
      title: "Колесо эмоутов",
      kind: "Radial menu",
      lead: "Зажимаешь кнопку — колесо из восьми фраз раскрывается с поворотом. Тянешь в сторону — луч из центра следует за пальцем, сектор по направлению увеличивается и светится. Отпускаешь — фраза всплывает облачком над аватаром с перелётом.",
      secrets: [
        "Выбор — по УГЛУ, а не по попаданию: atan2 → сектор 45°. Достаточно направления — работает вслепую, как в Hearthstone и Clash Royale.",
        "Мёртвая зона 28px в центре: отпустил не сдвинув — ничего не отправлено.",
        "Луч — div с width = min(R, расстояние) и rotate = угол, оба useTransform от пальца.",
        "Колесо раскрывается с rotate −60° → 0: меню «разворачивается», а не просто масштабируется.",
        "Облачко эмоута — scale [0, 1.25, 1] с хвостиком: речь персонажа, а не уведомление.",
      ],
      tracks: [
        { label: "Раскрытие", start: 700, dur: 400, color: V },
        { label: "Сектор 2", start: 1100, dur: 500, color: "#4cc3ff" },
        { label: "Сектор 3", start: 1600, dur: 500, color: "#ff4d5e" },
        { label: "Сектор 4", start: 2100, dur: 500, color: "#ffc34d" },
        { label: "Облачко", start: 2600, dur: 1600, color: "#ffc34d" },
      ],
      total: 4400,
      ease: { bez: EASE.overshoot, label: "overshoot — облачко" },
      code: `const update = (x, y) => {
  if (Math.hypot(x, y) < 28) return setSel(null);          // мёртвая зона
  const a = (Math.atan2(y, x) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
  setSel(Math.floor((a + Math.PI / 8) / (Math.PI / 4)) % 8);
};
const lineLen = useTransform([px, py], ([x, y]) => Math.min(R, Math.hypot(x, y)));`,
      C: EmoteWheel,
      interactive: "Зажми и тяни к фразе",
    },
    {
      id: "vfeed",
      n: "77",
      title: "Вертикальная лента",
      kind: "Snap pager",
      lead: "Посты листаются вертикальным свайпом со снэпом на экран и сохранением скорости жеста. Двойной тап в любом месте — большое сердце вырастает в точке касания, взлетает и тает, иконка лайка подпрыгивает, частицы разлетаются.",
      secrets: [
        "Снэп по четверти экрана с проекцией скорости — короткий резкий свайп листает, медленный — возвращает.",
        "Пружина снэпа получает velocity жеста: лента продолжает движение пальца, а не начинает заново.",
        "Двойной тап — два onTap за 300мс; сердце рождается ровно в точке второго касания.",
        "Сердце: scale [0, 1.4, 1.1] + rotate [−20, 10, 0] + всплытие и затухание. Эмоция в форме жеста.",
        "Индикатор страниц справа — вытянутая точка текущего поста, как у Reels.",
      ],
      tracks: [
        { label: "Двойной тап", start: 700, dur: 300, color: "#ff4d5e" },
        { label: "Сердце", start: 1000, dur: 900, color: "#ff4d5e" },
        { label: "Свайп → 2", start: 2200, dur: 600, color: V },
        { label: "Свайп → 3", start: 3600, dur: 500, color: V },
        { label: "Лайк 3", start: 4800, dur: 900, color: "#ff4d5e" },
      ],
      total: 5900,
      ease: { bez: EASE.outExpo, label: "outExpo — сердце" },
      code: `onTap={(e, info) => {
  if (performance.now() - lastTap < 300) like(info.point);   // двойной тап
  lastTap = performance.now();
}}
onPanEnd={(_, i) => {
  const proj = i.offset.y + i.velocity.y * .2;
  go(idx + (proj < -PH / 4 ? 1 : proj > PH / 4 ? -1 : 0), i.velocity.y);
}}`,
      C: VerticalFeed,
      interactive: "Свайп вверх, двойной тап",
    },
    {
      id: "poll",
      n: "78",
      title: "Опрос толпы",
      kind: "Lean slider",
      lead: "Слайдер голосования между «лонг» и «шорт». Толпа из 24 аватаров наклоняется в сторону слайдера, каждый со своей силой, половины экрана подсвечиваются. Центр — «не решил», отправка там отскакивает. После голоса — результаты полосами и подсказка про психологию толпы.",
      secrets: [
        "Каждый аватар имеет свой bias наклона: x = lean·(8 + bias·10). Толпа качается неравномерно — живая, а не синхронная.",
        "Мёртвая зона ±12% вокруг центра: голос «ни туда ни сюда» отскакивает пружиной — нужно решить.",
        "Подписи сторон растут до ×1.3 по мере наклона — выбор подсвечивается типографикой.",
        "После голоса толпа окрашивается каскадом 20мс — «как проголосовали остальные».",
        "Подсказка «толпа ошибается на экстремумах» связывает соц-механику с обучением.",
      ],
      tracks: [
        { label: "→ Лонг", start: 700, dur: 600, color: "#3ddc84" },
        { label: "→ Шорт", start: 1300, dur: 800, color: "#ff4d5e" },
        { label: "Голос", start: 2800, dur: 100, color: "#ffffff" },
        { label: "Толпа окрашивается", start: 2900, dur: 700, color: V },
        { label: "Результаты", start: 3100, dur: 1000, color: "#ff4d5e" },
      ],
      total: 4300,
      ease: { bez: EASE.camera, label: "camera — голос" },
      code: `const bias = ((i * 37) % 10) / 10 - .5;
const x   = useTransform(lean, l => l * (8 + bias * 10));
const rot = useTransform(lean, l => l * 14);
if (Math.abs(vote - .5) < .12) animate(vote, .5, { type: "spring", stiffness: 400, damping: 12 });`,
      C: CrowdPoll,
      interactive: "Тяни голос, отправь",
    },
  ],
};
