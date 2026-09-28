import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import {
  Carousel,
  Roll,
  Slider,
  SwipeConfirm,
  useGhost,
} from "../components/controls";
import { Coin, I, fmt } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ------------------------------------------------------------------
   Векторные «иконки товаров» — рисуются кодом, у каждой свой слой
   глубины, который двигается от смещения карусели (parallax внутри).
   ------------------------------------------------------------------ */
function ItemArt({
  kind,
  color,
  px,
}: {
  kind: string;
  color: string;
  px: MotionValue<number>;
}) {
  const back = useTransform(px, (v) => v * -14);
  const front = useTransform(px, (v) => v * 10);
  const rot = useTransform(px, (v) => v * 8);
  return (
    <div className="relative h-[110px] w-[110px]">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          x: back,
          background: `radial-gradient(closest-side, ${color}55, transparent)`,
        }}
      />
      <motion.div
        className="absolute inset-0 grid place-items-center"
        style={{ x: front, rotate: rot }}
      >
        {kind === "chest" && (
          <svg width="84" height="70" viewBox="0 0 84 70">
            <rect
              x="6"
              y="28"
              width="72"
              height="38"
              rx="5"
              fill="#6a3a18"
              stroke={color}
              strokeWidth="3"
            />
            <path
              d="M6 30 V20 C6 8 20 4 42 4 C64 4 78 8 78 20 V30 Z"
              fill="#8a4a22"
              stroke={color}
              strokeWidth="3"
            />
            <rect x="36" y="24" width="12" height="16" rx="2" fill={color} />
          </svg>
        )}
        {kind === "cloak" && (
          <img
            src={hood}
            className="mask-soft h-[100px] w-[100px] object-cover"
            draggable={false}
          />
        )}
        {kind === "boost" && (
          <svg width="60" height="84" viewBox="0 0 60 84">
            <rect
              x="12"
              y="6"
              width="36"
              height="72"
              rx="10"
              fill="#1a2440"
              stroke={color}
              strokeWidth="3"
            />
            <rect
              x="16"
              y="30"
              width="28"
              height="44"
              rx="6"
              fill={color}
              opacity="0.85"
            />
            <path d="M30 36 L22 54 H30 L27 68 L38 48 H30 Z" fill="#fff" />
          </svg>
        )}
        {kind === "card" && (
          <svg width="66" height="88" viewBox="0 0 66 88">
            <rect
              x="4"
              y="4"
              width="58"
              height="80"
              rx="8"
              fill="#141d36"
              stroke={color}
              strokeWidth="3"
            />
            <circle
              cx="33"
              cy="36"
              r="16"
              fill="none"
              stroke={color}
              strokeWidth="3"
            />
            <path
              d="M24 38 l6 6 12-14"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect
              x="12"
              y="64"
              width="42"
              height="10"
              rx="3"
              fill="#fff"
              opacity="0.9"
            />
          </svg>
        )}
        {kind === "frame" && (
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle
              cx="42"
              cy="42"
              r="34"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray="10 5"
            />
            <circle cx="42" cy="42" r="24" fill="#141d36" />
            {[0, 90, 180, 270].map((a) => (
              <path
                key={a}
                d="M42 2 l5 10 h-10 z"
                fill={color}
                transform={`rotate(${a} 42 42)`}
              />
            ))}
          </svg>
        )}
        {kind === "gems" && (
          <svg width="90" height="80" viewBox="0 0 90 80">
            {[
              [20, 44, 0.8],
              [64, 46, 0.75],
              [42, 32, 1.1],
            ].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <path
                  d="M-16 -10 H16 L24 0 L0 26 L-24 0 Z"
                  fill={color}
                  opacity="0.9"
                />
                <path
                  d="M-24 0 H24 M-8 -10 L0 26 L8 -10"
                  stroke="#fff"
                  strokeOpacity="0.5"
                  fill="none"
                />
              </g>
            ))}
          </svg>
        )}
      </motion.div>
    </div>
  );
}

const ITEMS = [
  {
    k: "chest",
    n: "Сундук арены",
    r: "Эпический",
    c: "#9b7bff",
    price: 480,
    sale: 0.3,
  },
  {
    k: "cloak",
    n: "Плащ Тени",
    r: "Легендарный",
    c: "#ffc34d",
    price: 1200,
    sale: 0,
  },
  {
    k: "boost",
    n: "Бустер XP x2",
    r: "Редкий",
    c: "#4cc3ff",
    price: 150,
    sale: 0,
  },
  {
    k: "card",
    n: "Карта «Ретест»",
    r: "Эпический",
    c: "#3ddc84",
    price: 320,
    sale: 0.2,
  },
  {
    k: "frame",
    n: "Рамка «Шторм»",
    r: "Редкий",
    c: "#ff6bd6",
    price: 260,
    sale: 0,
  },
  {
    k: "gems",
    n: "Горсть кристаллов",
    r: "Обычный",
    c: "#2ee6c5",
    price: 90,
    sale: 0,
  },
];

function ShopSlide({
  i,
  active,
  x,
}: {
  i: number;
  active: boolean;
  x: MotionValue<number>;
}) {
  const it = ITEMS[i];
  const px = useTransform(x, (v) => clamp((v + i * 160) / 160, -1.5, 1.5));
  return (
    <div
      className="relative h-[200px] w-[150px] overflow-hidden rounded-3xl border"
      style={{
        borderColor: `${it.c}66`,
        background: `linear-gradient(170deg, ${it.c}22, #0c1428 60%)`,
        boxShadow: active ? `0 20px 40px -12px ${it.c}` : "none",
      }}
    >
      {it.sale > 0 && (
        <div className="absolute -right-8 top-4 z-10 w-28 rotate-45 bg-bear py-0.5 text-center text-[9px] font-black">
          −{it.sale * 100}%
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <ItemArt kind={it.k} color={it.c} px={px} />
      </div>
      <div className="absolute inset-x-0 bottom-3 text-center">
        <div
          className="text-[8px] font-bold uppercase tracking-[.2em]"
          style={{ color: it.c }}
        >
          {it.r}
        </div>
        <div className="text-[12px] font-bold">{it.n}</div>
      </div>
      {active && <div className="sheen absolute inset-0" />}
    </div>
  );
}

/* ================================================================
   41 · SHOP CAROUSEL — витрина с параллаксом и полётом в корзину
   ================================================================ */
export function ShopCarousel({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(1);
  const [cart, setCart] = useState(0);
  const [flying, setFlying] = useState<number | null>(null);
  const [timer, setTimer] = useState(3599);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const x = useMotionValue(-160);
  const cartRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const g = useGhost();
  const p = useParticles();
  const it = ITEMS[idx];
  const final = Math.round(it.price * (1 - it.sale));

  useEffect(() => {
    const iv = window.setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 3599)),
      1000,
    );
    return () => clearInterval(iv);
  }, []);

  const buy = async () => {
    if (flying !== null) return;
    setFlying(idx);
    sfx.whoosh(0.35);
    await new Promise((r) => requestAnimationFrame(r));
    const el = flyRef.current;
    const to = centerIn(cartRef.current, root);
    if (el) {
      await animate(
        el,
        {
          x: [0, (to.x - 150) * 0.4, to.x - 150],
          y: [0, -120, to.y - 190],
          scale: [1, 0.8, 0.15],
          rotate: [0, -20, 20],
        },
        { duration: 0.7, ease: EASE.camera },
      );
    }
    setFlying(null);
    setCart((c) => c + 1);
    sfx.coin(2);
    if (cartRef.current)
      animate(
        cartRef.current,
        { scale: [1.4, 1], rotate: [-12, 0] },
        { type: "spring", stiffness: 500, damping: 12 },
      );
    p.burst({
      x: to.x,
      y: to.y,
      count: 18,
      colors: [ITEMS[idx].c, "#fff"],
      speed: [80, 220],
    });
  };

  useScript(run, async (wait) => {
    setIdx(1);
    setCart(0);
    await wait(500);
    cue();
    g.show(220, 190);
    for (const n of [2, 3]) {
      g.press(true);
      await g.move(80, 190, 0.35);
      g.press(false);
      setIdx(n);
      await wait(700);
      await g.move(220, 190, 0.2);
    }
    await g.move(150, 544, 0.45);
    g.press(true);
    await wait(100);
    g.press(false);
    await buy();
    await wait(400);
    await g.move(80, 190, 0.35);
    g.press(true);
    await g.move(230, 190, 0.35);
    g.press(false);
    setIdx(2);
    await wait(600);
    g.hide();
  });

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={it.c} />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(70% 40% at 50% 30%, ${it.c}2a, transparent 70%)`,
        }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-base font-black">Маркет</div>
          <div className="flex items-center gap-1 text-[10px] text-bear">
            <I.clock size={11} /> распродажа{" "}
            <span className="font-mono font-bold">
              <Roll value={`${mm}:${ss}`} />
            </span>
          </div>
        </div>
        <div
          ref={cartRef}
          className="glass relative grid h-10 w-10 place-items-center rounded-xl"
        >
          <I.gem size={18} className="text-gold" />
          <AnimatePresence>
            {cart > 0 && (
              <motion.span
                key={cart}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING.reward}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-bear text-[10px] font-black"
              >
                {cart}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[96px]">
        <Carousel
          count={ITEMS.length}
          index={idx}
          onIndex={setIdx}
          step={160}
          mode="flat"
          height={210}
          xOut={x}
          onTapActive={buy}
          render={(i, a) => <ShopSlide i={i} active={a} x={x} />}
        />
      </div>
      <div className="absolute inset-x-5 top-[324px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE.outExpo }}
          >
            <div className="flex items-baseline justify-between">
              <div className="font-display text-lg font-black">{it.n}</div>
              <div className="flex items-center gap-1.5">
                {it.sale > 0 && (
                  <span className="font-mono text-xs text-white/40 line-through">
                    {it.price}
                  </span>
                )}
                <Coin size={16} />
                <span className="font-display text-lg font-black text-gold">
                  <Roll value={final} />
                </span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {["Эффект", "Длительность", "Редкость"].map((l, k) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + k * 0.05 }}
                  className="glass rounded-lg p-1.5 text-center"
                >
                  <div className="text-[8px] text-white/40">{l}</div>
                  <div
                    className="text-[10px] font-bold"
                    style={{ color: k === 2 ? it.c : "#fff" }}
                  >
                    {k === 0
                      ? it.k === "boost"
                        ? "XP x2"
                        : "Косметика"
                      : k === 1
                        ? it.k === "boost"
                          ? "24 ч"
                          : "Навсегда"
                        : it.r}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 top-[452px] flex justify-center gap-1.5">
        {ITEMS.map((x2, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === idx ? 20 : 6,
              background: i === idx ? x2.c : "#ffffff33",
            }}
            transition={SPRING.panel}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
      <motion.button
        onClick={buy}
        whileTap={{ scale: 0.95 }}
        className="sheen absolute inset-x-6 bottom-12 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black text-[#1a1000]"
        animate={{ background: `linear-gradient(180deg, #ffe08a, ${it.c})` }}
      >
        КУПИТЬ ЗА <Coin size={16} /> {final}
      </motion.button>
      {flying !== null && (
        <div
          ref={flyRef}
          className="pointer-events-none absolute left-1/2 top-[110px] z-40 -ml-[75px]"
        >
          <ShopSlide i={flying} active x={x} />
        </div>
      )}
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   42 · SWIPE TO BUY — проведи, и деньги физически уходят
   ================================================================ */
export function SwipeToBuy({ run, cue }: SceneProps) {
  const prog = useMotionValue(0);
  const [wallet, setWallet] = useState(2400);
  const [bought, setBought] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const g = useGhost();
  const p = useParticles();
  const lift = useTransform(prog, [0, 1], [0, -18]);
  const glow = useTransform(
    prog,
    (v) =>
      `0 ${20 + v * 20}px ${40 + v * 40}px -12px rgba(255,195,77,${0.3 + v * 0.6})`,
  );
  const tiltX = useTransform(prog, [0, 1], [0, 12]);
  const priceLeft = useTransform(prog, (v) => fmt(1200 * (1 - v * 0.999)));

  const done = async () => {
    sfx.success();
    const from = centerIn(walletRef.current, root);
    const to = centerIn(cardRef.current, root);
    let k = 0;
    p.burst({
      x: from.x,
      y: from.y,
      count: 14,
      shape: "coin",
      size: [5, 7],
      speed: [120, 260],
      angle: Math.PI / 2,
      spread: 2,
      gravity: 200,
      drag: 1.5,
      target: to,
      stagger: 0.03,
      onArrive: () => {
        sfx.coin(k++);
        setWallet((w) => Math.max(1200, w - 86));
      },
    });
    await new Promise((r) => setTimeout(r, 1100));
    setWallet(1200);
    setBought(true);
    // карточка ныряет в инвентарь со сжатием
    const bag = centerIn(bagRef.current, root);
    if (cardRef.current) {
      await animate(
        cardRef.current,
        { scaleY: 0.85, scaleX: 1.1 },
        { duration: 0.1 },
      );
      await animate(
        cardRef.current,
        {
          x: bag.x - to.x,
          y: bag.y - to.y,
          scale: 0.1,
          rotate: 30,
          opacity: 0.4,
        },
        { duration: 0.5, ease: EASE.inQuart },
      );
    }
    sfx.snap();
    if (bagRef.current)
      animate(
        bagRef.current,
        { scale: [1.4, 1], y: [6, 0] },
        { type: "spring", stiffness: 500, damping: 12 },
      );
    p.ring(bag.x, bag.y, "#ffc34d", 70, 0.5, 5);
    if (root) animate(root, shakeKeys(0.35, 8, 5, 0.5), { duration: 0.3 });
  };

  const reset = async () => {
    setBought(false);
    setWallet(2400);
    prog.set(0);
    if (cardRef.current)
      await animate(
        cardRef.current,
        { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, scaleX: 1, scaleY: 1 },
        { duration: 0 },
      );
  };

  useScript(run, async (wait) => {
    await reset();
    await wait(600);
    cue();
    // сначала — неполный свайп (отскок)
    g.show(46, 470);
    g.press(true);
    await Promise.all([
      g.move(46 + 0.55 * 200, 470, 0.5),
      animate(prog, 0.55, { duration: 0.5 }),
    ]);
    g.press(false);
    await animate(prog, 0, { type: "spring", stiffness: 400, damping: 22 });
    await wait(400);
    g.press(true);
    await Promise.all([
      g.move(46 + 200, 470, 0.7),
      animate(prog, 1, { duration: 0.7, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
    await done();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Покупка</div>
        <div
          ref={walletRef}
          className="glass flex h-9 items-center gap-1.5 rounded-full pl-1.5 pr-3"
        >
          <Coin size={20} />
          <span className="font-display text-xs font-bold">
            <Roll value={fmt(wallet)} />
          </span>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-[100px] -ml-[100px]"
        style={{ perspective: 800 }}
      >
        <motion.div
          ref={cardRef}
          className="relative h-[260px] w-[200px] rounded-3xl p-[3px]"
          style={{
            y: lift,
            rotateX: tiltX,
            boxShadow: glow,
            background:
              "linear-gradient(150deg,#fff1b8,#ffc34d 30%,#8a4f0b 60%,#ffd67a)",
          }}
        >
          <div className="relative h-full overflow-hidden rounded-[21px] bg-gradient-to-b from-[#2a2140] to-[#0e0b1c]">
            <img
              src={hood}
              className="mask-bottom h-[170px] w-full object-cover"
            />
            <div className="sheen absolute inset-0" />
            <div className="absolute inset-x-0 bottom-4 text-center">
              <div className="text-[9px] font-bold tracking-[.3em] text-gold">
                ЛЕГЕНДАРНЫЙ
              </div>
              <div className="font-display text-lg font-black">Плащ Тени</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-gold">
                <Coin size={14} />
                <motion.span className="font-mono">{priceLeft}</motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {bought && (
          <motion.div
            key="st"
            initial={{ scale: 2.6, opacity: 0, rotate: -14 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE.snap }}
            className="absolute left-1/2 top-[200px] -ml-[80px] w-[160px] rounded-xl border-4 border-bull py-1 text-center font-display text-xl font-black text-bull"
            style={{ textShadow: "0 0 18px #3ddc84" }}
          >
            КУПЛЕНО
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-0 top-[440px] flex justify-center">
        <SwipeConfirm
          mv={prog}
          label="Проведи, чтобы купить"
          color="#ffc34d"
          onDone={done}
          doneLabel="Оплачено"
        />
      </div>
      <div className="absolute inset-x-4 bottom-6 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={reset}
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60"
        >
          Сбросить
        </motion.button>
        <div
          ref={bagRef}
          className="glass flex items-center gap-2 rounded-xl px-3 py-2"
        >
          <I.cards size={16} className="text-gold" />
          <span className="text-[10px] font-bold">
            Инвентарь {bought ? 1 : 0}
          </span>
        </div>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   43 · GEM EXCHANGE — поток частиц пропорционален сумме
   ================================================================ */
const RATE = 25;

function Crystal({
  size,
  color,
  delay,
}: {
  size: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      initial={false}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, delay }}
    >
      <path d="M8 12 H32 L40 22 L20 48 L0 22 Z" fill={color} />
      <path
        d="M0 22 H40 M14 12 L20 48 L26 12"
        stroke="#fff"
        strokeOpacity="0.5"
        fill="none"
      />
      <path
        d="M8 12 L14 22 L20 12 L26 22 L32 12"
        stroke="#fff"
        strokeOpacity="0.7"
        fill="none"
      />
    </motion.svg>
  );
}

export function GemExchange({ run, cue }: SceneProps) {
  const amt = useMotionValue(0.2);
  const [coins, setCoins] = useState(3000);
  const [gems, setGems] = useState(12);
  const [preview, setPreview] = useState(24);
  const [pulse, setPulse] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const crystalScale = useTransform(amt, [0, 1], [0.6, 1.35]);
  const streamRef = useRef(0);
  const MAX = 3000;

  useMotionValueEvent(amt, "change", (v) => {
    const c = Math.round((v * MAX) / 50) * 50;
    setPreview(Math.floor(c / RATE));
  });

  // Поток-предпросмотр: частота и плотность ∝ сумме
  useEffect(() => {
    const iv = window.setInterval(() => {
      const v = amt.get();
      streamRef.current += v;
      if (streamRef.current < 0.25) return;
      streamRef.current = 0;
      p.burst({
        x: 70,
        y: 200,
        count: 1 + Math.round(v * 3),
        shape: "dot",
        colors: ["#ffc34d"],
        speed: [20, 60],
        target: { x: 230, y: 200 },
        size: [1.5, 3],
      });
    }, 60);
    return () => clearInterval(iv);
  }, [amt, p]);

  const convert = () => {
    const c = Math.round((amt.get() * MAX) / 50) * 50;
    if (c <= 0 || c > coins) {
      sfx.error();
      if (root) animate(root, shakeKeys(0.4, 10, 7, 0.5), { duration: 0.3 });
      return;
    }
    const gain = Math.floor(c / RATE);
    sfx.whoosh(0.6);
    let k = 0;
    p.burst({
      x: 70,
      y: 200,
      count: 24,
      shape: "coin",
      size: [5, 7],
      speed: [80, 200],
      angle: -Math.PI / 2,
      spread: 1.6,
      drag: 1.2,
      target: { x: 230, y: 200 },
      stagger: 0.025,
      onArrive: () => {
        k++;
        sfx.coin(k);
        if (k === 24) {
          setGems((x) => x + gain);
          setPulse((x) => x + 1);
          sfx.chime();
          p.ring(230, 200, "#2ee6c5", 100, 0.6, 6);
          p.burst({
            x: 230,
            y: 200,
            count: 40,
            shape: "star",
            colors: ["#2ee6c5", "#fff", "#9b7bff"],
            speed: [120, 360],
            size: [2, 5],
          });
        }
      },
    });
    setCoins((x) => x - c);
    animate(amt, 0, { duration: 0.8, ease: EASE.outExpo });
  };

  useScript(run, async (wait) => {
    setCoins(3000);
    setGems(12);
    amt.set(0.1);
    await wait(500);
    cue();
    g.show(24 + 0.1 * 252, 404);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.8 * 252, 404, 0.9),
      animate(amt, 0.8, { duration: 0.9, ease: EASE.camera }),
    ]);
    await wait(400);
    await Promise.all([
      g.move(24 + 0.5 * 252, 404, 0.4),
      animate(amt, 0.5, { duration: 0.4 }),
    ]);
    g.press(false);
    await wait(300);
    await g.move(150, 520, 0.4);
    g.press(true);
    await wait(100);
    g.press(false);
    convert();
    await wait(400);
    g.hide();
  });

  const cost = preview * RATE;
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#2ee6c5" />
      <div className="absolute inset-x-4 top-11 flex justify-between">
        <div className="glass flex h-9 items-center gap-1.5 rounded-full pl-1.5 pr-3">
          <Coin size={20} />
          <span className="font-display text-xs font-bold">
            <Roll value={fmt(coins)} />
          </span>
        </div>
        <motion.div
          key={pulse}
          initial={{ scale: pulse ? 1.3 : 1 }}
          animate={{ scale: 1 }}
          transition={SPRING.reward}
          className="glass flex h-9 items-center gap-1.5 rounded-full pl-2 pr-3"
        >
          <svg width="16" height="18" viewBox="0 0 40 48">
            <path d="M8 12 H32 L40 22 L20 48 L0 22 Z" fill="#2ee6c5" />
          </svg>
          <span className="font-display text-xs font-bold">
            <Roll value={gems} />
          </span>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 top-[96px] text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/45">
        Обмен · 25 монет = 1 кристалл
      </div>
      {/* source */}
      <div className="absolute left-[30px] top-[150px] grid h-[100px] w-[80px] place-items-center">
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Coin size={56} />
        </motion.div>
      </div>
      {/* arrow pipe */}
      <svg
        viewBox="0 0 120 20"
        className="absolute left-[100px] top-[190px] h-5 w-[100px]"
      >
        <path
          d="M0 10 H110 M100 3 L110 10 L100 17"
          fill="none"
          stroke="#ffffff33"
          strokeWidth="2"
          strokeDasharray="4 5"
          className="flow-dash"
        />
      </svg>
      {/* target crystals */}
      <motion.div
        className="absolute left-[190px] top-[140px] flex h-[120px] w-[90px] items-end justify-center"
        style={{ scale: crystalScale }}
      >
        <Crystal size={28} color="#2ee6c5" delay={0} />
        <div className="-mx-2 mb-3">
          <Crystal size={40} color="#4cc3ff" delay={0.3} />
        </div>
        <Crystal size={26} color="#9b7bff" delay={0.6} />
      </motion.div>
      <div className="absolute inset-x-4 top-[280px] grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="glass rounded-xl py-2 text-center">
          <div className="text-[9px] text-white/45">Отдаёшь</div>
          <div className="font-display text-lg font-black text-gold">
            <Roll value={fmt(cost)} />
          </div>
        </div>
        <I.arrowR size={18} className="text-white/40" />
        <div className="glass rounded-xl py-2 text-center">
          <div className="text-[9px] text-white/45">Получаешь</div>
          <div className="font-display text-lg font-black text-teal">
            <Roll value={preview} />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-4 top-[350px] flex justify-center gap-1.5">
        {[0.25, 0.5, 0.75, 1].map((q) => (
          <motion.button
            key={q}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              animate(amt, q, { type: "spring", stiffness: 300, damping: 24 })
            }
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70"
          >
            {q === 1 ? "MAX" : `${q * 100}%`}
          </motion.button>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[390px]">
        <Slider
          mv={amt}
          color="#ffc34d"
          format={(v) => `${fmt(Math.round((v * MAX) / 50) * 50)}`}
        />
      </div>
      <motion.button
        onClick={convert}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-6 bottom-12 rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-black text-[#032a24] shadow-[0_6px_0_#0a7563]"
      >
        ОБМЕНЯТЬ
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_SHOP: Category = {
  id: "shop",
  n: "13",
  title: "Магазин",
  en: "Carousel · Swipe-to-buy · Exchange",
  color: "#ffc34d",
  blurb:
    "Экономика, которую чувствуешь руками: витрина-карусель с параллаксом и полётом в корзину, покупка свайпом с физическим уходом монет, обменник с потоком частиц.",
  scenes: [
    {
      id: "shopcar",
      n: "41",
      title: "Витрина-карусель",
      kind: "Parallax carousel",
      lead: "Товары листаются свайпом, внутри каждой карточки своя глубина: свечение, предмет и поворот двигаются от смещения карусели с разной скоростью. Фон окрашивается в цвет товара, таймер распродажи тикает прокруткой цифр, покупка отправляет карточку в корзину по дуге.",
      secrets: [
        "Параллакс внутри карточки берёт сырой x карусели: px = (x + i·160)/160. Слои: фон ×−14, предмет ×10, поворот ×8 — три глубины в одной карточке.",
        "Полёт в корзину — keyframes [0, 40%, 100%] по x и [0, −120, цель] по y: дуга, а не прямая. Масштаб 1 → 0.15 и поворот ±20° — предмет «кувыркается».",
        "Корзина принимает удар: scale 1.4 → 1 и rotate −12 → 0 с пружиной 500/12, бейдж появляется reward-пружиной.",
        "Таймер — Roll: каждая цифра прокручивается независимо, секунды живут, минуты стоят.",
        "Детали товара сменяются AnimatePresence mode=wait c каскадом плиток 50мс — контент всегда догоняет выбор.",
      ],
      tracks: [
        { label: "Свайп → 3", start: 500, dur: 350, color: "#4cc3ff" },
        { label: "Свайп → 4", start: 1550, dur: 350, color: "#3ddc84" },
        { label: "Тап купить", start: 2800, dur: 100, color: "#ffc34d" },
        { label: "Полёт в корзину", start: 2900, dur: 700, color: "#ffc34d" },
        { label: "Бамп корзины", start: 3600, dur: 400, color: "#ff4d5e" },
      ],
      total: 5000,
      ease: { bez: EASE.camera, label: "camera — дуга в корзину" },
      code: `const px = useTransform(x, v => clamp((v + i * 160) / 160, -1.5, 1.5));
const back  = useTransform(px, v => v * -14);
const front = useTransform(px, v => v * 10);

await animate(el, {
  x: [0, (to.x - 150) * .4, to.x - 150],
  y: [0, -120, to.y - 190],
  scale: [1, .8, .15], rotate: [0, -20, 20],
}, { duration: .7, ease: EASE.camera });`,
      C: ShopCarousel,
      interactive: "Листай и покупай",
    },
    {
      id: "swipebuy",
      n: "42",
      title: "Покупка свайпом",
      kind: "Slide to confirm",
      lead: "Ползунок «проведи, чтобы купить». С каждым пикселем карточка поднимается, наклоняется и светится ярче, цена «стекает». Неполный свайп отскакивает. Полный — монеты вылетают из кошелька и летят в карточку, баланс тает, карточка сплющивается и ныряет в инвентарь.",
      secrets: [
        "Прогресс свайпа — не только ползунок: подъём, наклон rotateX, сила свечения и «стекающая» цена — всё useTransform от одного значения. Игрок чувствует вес решения.",
        "Неполный свайп отскакивает пружиной 400/22 — защита от случайной покупки, которая сама является анимацией.",
        "Монеты-магниты идут ИЗ кошелька В товар — деньги физически уходят, баланс уменьшается на каждой долетевшей монете.",
        "Перед нырком в инвентарь — squash (scaleY 0.85, scaleX 1.1) на 100мс: предмет «приседает» перед прыжком.",
        "Штамп «КУПЛЕНО» с наклоном −8°: чек, а не всплывашка.",
      ],
      tracks: [
        { label: "Неполный свайп", start: 600, dur: 500, color: "#ffc34d" },
        { label: "Отскок", start: 1100, dur: 400, color: "#ff4d5e" },
        { label: "Полный свайп", start: 1900, dur: 700, color: "#ffc34d" },
        { label: "Монеты → карта", start: 2600, dur: 1100, color: "#ffc34d" },
        { label: "Squash + нырок", start: 3700, dur: 600, color: "#9b7bff" },
      ],
      total: 4600,
      ease: { bez: EASE.inQuart, label: "inQuart — нырок в инвентарь" },
      code: `const lift  = useTransform(prog, [0, 1], [0, -18]);
const tiltX = useTransform(prog, [0, 1], [0, 12]);
const glow  = useTransform(prog, v => \`0 20px \${40 + v * 40}px -12px rgba(255,195,77,\${.3 + v * .6})\`);

<SwipeConfirm mv={prog} onDone={async () => {
  coinsFromWalletTo(card, () => setWallet(w => w - 86));
  await animate(card, { scaleY: .85, scaleX: 1.1 }, { duration: .1 });
  await animate(card, { x: bag.x, y: bag.y, scale: .1 }, { ease: EASE.inQuart });
}} />`,
      C: SwipeToBuy,
      interactive: "Проведи ползунок",
    },
    {
      id: "exchange",
      n: "43",
      title: "Обменник кристаллов",
      kind: "Flow slider",
      lead: "Слайдер суммы управляет непрерывным потоком частиц от монеты к кристаллам: чем больше сумма, тем гуще поток и крупнее кристаллы. Быстрые кнопки 25–100% двигают слайдер пружиной. Обмен запускает залп монет-магнитов, недостаток средств трясёт экран.",
      secrets: [
        "Поток-предпросмотр — интервал 60мс с аккумулятором: частота выпуска ∝ значению слайдера. Сумма видна до нажатия кнопки.",
        "Кристаллы масштабируются от слайдера (0.6 → 1.35) — будущая награда растёт под пальцем.",
        "Быстрые кнопки анимируют тот же MotionValue пружиной — слайдер едет сам, игрок видит связь.",
        "Кристаллы начисляются только когда долетела ПОСЛЕДНЯЯ монета — пик награды совпадает с концом анимации.",
        "После обмена слайдер «сдувается» к нулю за 0.8с outExpo — транзакция визуально закрыта.",
      ],
      tracks: [
        { label: "Слайдер → 80%", start: 500, dur: 900, color: "#ffc34d" },
        { label: "Поток густеет", start: 500, dur: 1300, color: "#ffc34d" },
        { label: "Коррекция 50%", start: 1800, dur: 400, color: "#ffc34d" },
        { label: "Залп монет", start: 3000, dur: 900, color: "#ffc34d" },
        {
          label: "Кристаллы + звёзды",
          start: 3900,
          dur: 600,
          color: "#2ee6c5",
        },
      ],
      total: 4700,
      ease: { bez: EASE.outExpo, label: "outExpo — сброс слайдера" },
      code: `useEffect(() => {
  const iv = setInterval(() => {
    acc += amt.get();                 // частота ∝ сумме
    if (acc < .25) return; acc = 0;
    p.burst({ count: 1 + Math.round(amt.get() * 3), target: gems });
  }, 60);
  return () => clearInterval(iv);
}, []);
const crystalScale = useTransform(amt, [0, 1], [.6, 1.35]);`,
      C: GemExchange,
      interactive: "Двигай сумму, жми обмен",
    },
  ],
};
