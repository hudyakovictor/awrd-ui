import { clamp as xClamp } from "../motion/tokens";
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
import enemy from "../assets/enemy.jpg";
import type { Category } from "../data/catalog";
import {
  Carousel,
  Roll,
  Slider,
  SwipeConfirm,
  useGhost,
} from "../components/controls";
import { Coin, I, fmt } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const OR = "#ff9a3d";

/* ================================================================
   53 · BRACKET SWIPE — сетка турнира листается по раундам
   ================================================================ */
const ROUNDS = [
  {
    n: "1/8",
    m: [
      ["Ты", "CandleMage", 3, 1],
      ["TradeFox", "BearSlayer", 2, 3],
      ["RiskLess", "DeltaN", 3, 0],
      ["WhaleHunt", "StopHunt", 1, 3],
    ],
  },
  {
    n: "1/4",
    m: [
      ["Ты", "BearSlayer", 3, 2],
      ["RiskLess", "StopHunt", 2, 3],
    ],
  },
  { n: "1/2", m: [["Ты", "StopHunt", 3, 1]] },
  { n: "Финал", m: [["Ты", "FOMO", 0, 0]] },
] as const;
const PW = 300;

function Match({
  a,
  b,
  sa,
  sb,
  reveal,
  delay,
}: {
  a: string;
  b: string;
  sa: number;
  sb: number;
  reveal: boolean;
  delay: number;
}) {
  const final = a === "Ты" && b === "FOMO";
  const winA = sa > sb;
  const rows = [
    { n: a, s: sa, w: winA, me: a === "Ты" },
    { n: b, s: sb, w: !winA, me: b === "Ты" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, ...SPRING.panel }}
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0c1428]/90"
    >
      {rows.map((r, k) => (
        <motion.div
          key={k}
          className={`flex items-center gap-2 px-2.5 py-1.5 ${k === 0 ? "border-b border-white/5" : ""}`}
          initial={false}
          animate={
            reveal && !final
              ? {
                  opacity: r.w ? 1 : 0.4,
                  background: r.w
                    ? r.me
                      ? `${OR}26`
                      : "#ffffff08"
                    : "#00000000",
                }
              : { opacity: 1 }
          }
          transition={{ delay: delay + 0.4 }}
        >
          <div className="h-5 w-5 overflow-hidden rounded-full border border-white/20">
            {r.me ? (
              <img src={hood} className="h-full w-full object-cover" />
            ) : r.n === "FOMO" ? (
              <img src={enemy} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: `hsl(${r.n.length * 37} 50% 40%)` }}
              />
            )}
          </div>
          <span
            className={`flex-1 text-[11px] font-bold ${r.me ? "text-[#ff9a3d]" : ""}`}
          >
            {r.n}
          </span>
          {final ? (
            <span className="font-mono text-[10px] text-white/40">—</span>
          ) : (
            <span className="font-display text-sm font-black">
              {reveal ? <Roll value={r.s} /> : "·"}
            </span>
          )}
          {reveal && r.w && !final && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.5, ...SPRING.reward }}
              className="text-bull"
            >
              <I.check size={12} stroke={3} />
            </motion.span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

function RoundPage({
  x,
  i,
  active,
}: {
  x: MotionValue<number>;
  i: number;
  active: boolean;
}) {
  const r = ROUNDS[i];
  const off = useTransform(x, (v) => v + i * PW);
  const scale = useTransform(off, [-PW, 0, PW], [0.85, 1, 0.85]);
  const op = useTransform(off, [-PW, 0, PW], [0.2, 1, 0.2]);
  const rotY = useTransform(off, [-PW, 0, PW], [25, 0, -25]);
  const gap = [8, 26, 60, 60][i];
  return (
    <motion.div
      className="absolute inset-y-0 left-0 px-5"
      style={{ x: off, width: PW, scale, opacity: op, rotateY: rotY }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="font-display text-2xl font-black"
          style={{ color: i === 3 ? "#ffc34d" : OR }}
        >
          {r.n}
        </div>
        <div className="text-[10px] text-white/45">
          {r.m.length * 2} участника
        </div>
      </div>
      <div
        className="flex flex-col"
        style={{ gap, paddingTop: i >= 2 ? 60 : 0 }}
      >
        {r.m.map((m, k) => (
          <Match
            key={`${i}-${k}-${active}`}
            a={m[0]}
            b={m[1]}
            sa={m[2]}
            sb={m[3]}
            reveal={active}
            delay={k * 0.08}
          />
        ))}
      </div>
      {i === 3 && (
        <motion.div
          initial={false}
          animate={
            active
              ? { scale: 1, opacity: 1, y: 0 }
              : { scale: 0.6, opacity: 0, y: 20 }
          }
          transition={{ delay: 0.3, ...SPRING.reward }}
          className="mt-6 flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: [0, -6, 6, 0], y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold drop-shadow-[0_0_16px_#ffc34d]"
          >
            <I.trophy size={56} />
          </motion.div>
          <div className="mt-2 text-[11px] font-bold text-white/70">
            Финал через 2ч 14м
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function BracketSwipe({ run, cue }: SceneProps) {
  const x = useMotionValue(0);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const base = useRef(0);
  const g = useGhost();
  const p = useParticles();
  const progW = useTransform(
    x,
    (v) => `${Math.min(100, (-v / (PW * 3)) * 100)}%`,
  );

  const go = (n: number) => {
    const t = Math.max(0, Math.min(3, n));
    if (t !== idxRef.current) {
      sfx.swipe(t > idxRef.current ? 1 : -1);
      if (t > idxRef.current) {
        window.setTimeout(() => sfx.success(), 450);
        window.setTimeout(
          () =>
            p.burst({
              x: 150,
              y: 150,
              count: 20,
              colors: [OR, "#fff"],
              speed: [80, 220],
            }),
          450,
        );
      }
      if (t === 3) window.setTimeout(() => sfx.chime(), 300);
    }
    idxRef.current = t;
    setIdx(t);
    animate(x, -t * PW, SPRING.panel);
  };

  useScript(run, async (wait) => {
    x.set(0);
    idxRef.current = 0;
    setIdx(0);
    await wait(900);
    cue();
    g.show(240, 380);
    for (const n of [1, 2, 3]) {
      g.press(true);
      await Promise.all([
        g.move(70, 380, 0.4),
        animate(x, -idxRef.current * PW - 110, { duration: 0.4 }),
      ]);
      g.press(false);
      go(n);
      await wait(1300);
      await g.move(240, 380, 0.2);
    }
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={OR} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-bold">Турнир «Импульс»</div>
          <div className="text-[10px] text-white/45">свайпай по раундам</div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-[10px] font-bold text-gold">
          <Coin size={14} /> 25 000
        </div>
      </div>
      <div className="absolute inset-x-4 top-[88px] flex gap-1">
        {ROUNDS.map((r, i) => (
          <motion.button
            key={r.n}
            onClick={() => go(i)}
            className="flex-1 rounded-lg py-1.5 text-[10px] font-bold"
            animate={{
              background: i === idx ? OR : i < idx ? `${OR}33` : "#ffffff0d",
              color: i === idx ? "#1a0a00" : i < idx ? OR : "#ffffff66",
            }}
          >
            {r.n}
          </motion.button>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[124px] h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ width: progW, background: OR, boxShadow: `0 0 10px ${OR}` }}
        />
      </div>
      <motion.div
        className="absolute inset-x-0 bottom-20 top-[146px] cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ perspective: 900 }}
        onPanStart={() => {
          base.current = x.get();
        }}
        onPan={(_, i) => {
          let v = base.current + i.offset.x;
          if (v > 0) v = Math.pow(v, 0.7);
          if (v < -PW * 3) v = -PW * 3 - Math.pow(-PW * 3 - v, 0.7);
          x.set(v);
        }}
        onPanEnd={(_, i) => {
          const proj = i.offset.x + i.velocity.x * 0.2;
          go(idxRef.current + (proj < -PW / 3 ? 1 : proj > PW / 3 ? -1 : 0));
        }}
      >
        {ROUNDS.map((_, i) => (
          <RoundPage key={i} x={x} i={i} active={i === idx} />
        ))}
      </motion.div>
      <div className="glass absolute inset-x-4 bottom-5 flex items-center gap-3 rounded-2xl p-2.5">
        <img src={hood} className="h-10 w-10 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-[11px] font-bold">Твой путь</div>
          <div className="flex gap-1">
            {ROUNDS.map((r, i) => (
              <motion.div
                key={r.n}
                className="h-1.5 flex-1 rounded-full"
                animate={{
                  background:
                    i <= idx ? (i === 3 ? "#ffc34d" : "#3ddc84") : "#ffffff1a",
                }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>
        <Roll
          value={`${[3, 3, 3, 0][idx]}:${[1, 2, 1, 0][idx]}`}
          color={OR}
          className="font-display text-sm font-black"
        />
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   54 · PRIZE TIER — слайдер ставки растит призовой фонд
   ================================================================ */
const TIERS = [
  { n: "Бронза", fee: 50, pool: 2500, c: "#d08a4a", mult: 1 },
  { n: "Серебро", fee: 150, pool: 9000, c: "#cfd8ea", mult: 1.5 },
  { n: "Золото", fee: 400, pool: 30000, c: "#ffc34d", mult: 2 },
  { n: "Алмаз", fee: 1000, pool: 100000, c: "#4cc3ff", mult: 3 },
];

export function PrizeTier({ run, cue }: SceneProps) {
  const t = useMotionValue(0);
  const conf = useMotionValue(0);
  const [tier, setTier] = useState(0);
  const [joined, setJoined] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const tierRef = useRef(0);
  const T = TIERS[tier];
  const trophyScale = useTransform(t, [0, 1], [0.8, 1.35]);

  useMotionValueEvent(t, "change", (v) => {
    const k = Math.round(v * 3);
    if (k !== tierRef.current) {
      const upward = k > tierRef.current;
      tierRef.current = k;
      setTier(k);
      if (upward) {
        sfx.coin(k * 2);
        p.burst({
          x: 150,
          y: 180,
          count: 12 + k * 10,
          shape: "coin",
          size: [4, 6],
          speed: [120, 300],
          angle: -Math.PI / 2,
          spread: 1.6,
          gravity: 500,
          drag: 0.8,
          life: [0.8, 1.2],
        });
      }
    }
  });

  const join = () => {
    setJoined(true);
    sfx.levelup();
    if (root) animate(root, shakeKeys(0.5, 10, 7, 1), { duration: 0.35 });
    p.ring(150, 180, T.c, 180, 0.7, 8);
    p.burst({
      x: 150,
      y: 180,
      count: 60,
      shape: "confetti",
      colors: [T.c, "#fff", OR],
      speed: [200, 480],
      gravity: 500,
      drag: 1.2,
      life: [1.2, 2],
      size: [3, 5],
      spread: 2.4,
    });
  };

  useScript(run, async (wait) => {
    t.set(0);
    conf.set(0);
    setJoined(false);
    await wait(500);
    cue();
    g.show(24, 408);
    g.press(true);
    for (const k of [1, 2, 3]) {
      await Promise.all([
        g.move(24 + (k / 3) * 252, 408, 0.5),
        animate(t, k / 3, { duration: 0.5, ease: EASE.outExpo }),
      ]);
      await wait(500);
    }
    await Promise.all([
      g.move(24 + (2 / 3) * 252, 408, 0.4),
      animate(t, 2 / 3, { duration: 0.4 }),
    ]);
    g.press(false);
    await wait(400);
    g.show(50, 492);
    g.press(true);
    await Promise.all([
      g.move(250, 492, 0.7),
      animate(conf, 1, { duration: 0.7, ease: EASE.camera }),
    ]);
    g.press(false);
    join();
    g.hide();
  });

  const cols = [0.35, 0.6, 1, 0.7, 0.45];
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={T.c} />
      <div className="absolute inset-x-4 top-11 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/45">
          Лига турнира
        </div>
        <div className="relative mx-auto mt-1 h-7 w-40 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={tier}
              initial={{ y: 28, rotateX: -90 }}
              animate={{ y: 0, rotateX: 0 }}
              exit={{ y: -28, rotateX: 90 }}
              transition={SPRING.reward}
              className="absolute inset-0 font-display text-xl font-black"
              style={{ color: T.c, textShadow: `0 0 18px ${T.c}` }}
            >
              {T.n}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        className="absolute left-1/2 top-[110px] -ml-[40px]"
        style={{ scale: trophyScale }}
      >
        <motion.div
          animate={{
            color: T.c,
            filter: `drop-shadow(0 0 ${10 + tier * 8}px ${T.c})`,
          }}
          transition={{ duration: 0.4 }}
        >
          <I.trophy size={80} />
        </motion.div>
      </motion.div>
      {/* призовой фонд: столбики монет */}
      <div className="absolute inset-x-8 top-[220px] flex h-[100px] items-end justify-center gap-3">
        {cols.map((c, i) => (
          <motion.div
            key={i}
            className="w-9 rounded-t-lg"
            animate={{
              height: 12 + c * (20 + tier * 22),
              background: `linear-gradient(180deg, ${T.c}, ${T.c}33)`,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 16,
              delay: i * 0.04,
            }}
            style={{ boxShadow: `0 0 16px -4px ${T.c}` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-4 top-[330px] grid grid-cols-3 gap-2">
        {[
          { l: "Взнос", v: fmt(T.fee) },
          { l: "Фонд", v: fmt(T.pool) },
          { l: "Множитель", v: `x${T.mult}` },
        ].map((m, i) => (
          <div key={m.l} className="glass rounded-xl py-2 text-center">
            <div className="text-[9px] text-white/45">{m.l}</div>
            <div
              className="font-display text-sm font-black"
              style={{ color: i === 1 ? T.c : "#fff" }}
            >
              <Roll value={m.v} />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[394px]">
        <Slider
          mv={t}
          steps={3}
          color={T.c}
          format={(v) => TIERS[Math.round(v * 3)].n}
          gradient="linear-gradient(90deg,#d08a4a,#cfd8ea,#ffc34d,#4cc3ff)"
          marks={TIERS.map((x2) => x2.n)}
        />
      </div>
      <div className="absolute inset-x-0 top-[470px] flex justify-center">
        <SwipeConfirm
          mv={conf}
          label={`Участвовать за ${fmt(T.fee)}`}
          color={T.c}
          onDone={join}
          doneLabel="Ты в турнире"
        />
      </div>
      <AnimatePresence>
        {joined && (
          <motion.div
            key="j"
            initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE.snap }}
            className="absolute left-1/2 top-[160px] -ml-[80px] w-[160px] rounded-xl border-4 py-1 text-center font-display text-lg font-black"
            style={{
              borderColor: T.c,
              color: T.c,
              textShadow: `0 0 16px ${T.c}`,
            }}
          >
            ЗАЯВКА ПРИНЯТА
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/40">
        Выше лига — сильнее соперники и больше фонд
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   55 · PODIUM CAROUSEL — лидеры сезона под прожектором
   ================================================================ */
const LEADERS = [
  { n: "SignalRider", s: 2840, r: 1, img: hood, hue: 0, c: "#ffc34d", wr: 71 },
  { n: "TradeFox", s: 2710, r: 2, img: hood, hue: 190, c: "#cfd8ea", wr: 66 },
  { n: "RiskLess", s: 2420, r: 3, img: hood, hue: 90, c: "#d08a4a", wr: 63 },
  { n: "FOMO", s: 2390, r: 4, img: enemy, hue: 0, c: "#ff4d5e", wr: 59 },
  {
    n: "CandleMage",
    s: 2290,
    r: 5,
    img: enemy,
    hue: 220,
    c: "#9b7bff",
    wr: 58,
  },
];

export function PodiumCarousel({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [challenge, setChallenge] = useState<number | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const L = LEADERS[idx];

  const onIdx = (n: number) => {
    setIdx(n);
    if (LEADERS[n].r <= 3)
      window.setTimeout(
        () =>
          p.burst({
            x: 150,
            y: 90,
            count: 26,
            shape: "confetti",
            colors: [LEADERS[n].c, "#fff"],
            speed: [80, 220],
            angle: Math.PI / 2,
            spread: 1.4,
            gravity: 300,
            life: [1, 1.6],
            size: [2, 4],
          }),
        200,
      );
  };
  const duel = (i: number) => {
    setChallenge(i);
    sfx.vs();
    if (root) animate(root, shakeKeys(0.8, 12, 10, 2), { duration: 0.4 });
    window.setTimeout(() => setChallenge(null), 1500);
  };

  useScript(run, async (wait) => {
    setIdx(0);
    setChallenge(null);
    await wait(600);
    cue();
    g.show(220, 250);
    for (const n of [1, 2, 3]) {
      g.press(true);
      await g.move(90, 250, 0.35);
      g.press(false);
      onIdx(n);
      await wait(700);
      await g.move(220, 250, 0.2);
    }
    await g.move(150, 540, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    duel(3);
    await wait(1700);
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={L.c} />
      {/* прожектор */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[260px] -ml-[130px]"
        animate={{
          background: `linear-gradient(180deg, ${L.c}44, transparent 85%)`,
        }}
        style={{ clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }}
        transition={{ duration: 0.4 }}
      />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Лидеры сезона</div>
        <div className="text-[10px] text-white/45">свайп</div>
      </div>
      <div className="absolute inset-x-0 top-[96px]">
        <Carousel
          count={LEADERS.length}
          index={idx}
          onIndex={onIdx}
          step={140}
          mode="cover"
          height={250}
          onTapActive={duel}
          render={(i, a) => {
            const l = LEADERS[i];
            return (
              <div className="flex flex-col items-center">
                <div
                  className="relative h-[150px] w-[130px] overflow-hidden rounded-2xl border-2"
                  style={{
                    borderColor: l.c,
                    boxShadow: a ? `0 0 30px ${l.c}88` : "none",
                  }}
                >
                  <img
                    src={l.img}
                    className="h-full w-full object-cover"
                    style={{ filter: `hue-rotate(${l.hue}deg)` }}
                    draggable={false}
                  />
                  <div
                    className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full font-display text-sm font-black text-black"
                    style={{ background: l.c }}
                  >
                    {l.r}
                  </div>
                </div>
                <motion.div
                  className="mt-2 w-[130px] rounded-t-xl py-1.5 text-center font-display text-lg font-black"
                  animate={{ height: a ? 70 - l.r * 8 : 30 }}
                  style={{
                    background: `linear-gradient(180deg, ${l.c}55, ${l.c}0d)`,
                    borderTop: `3px solid ${l.c}`,
                    color: l.c,
                  }}
                  transition={SPRING.panel}
                >
                  #{l.r}
                </motion.div>
              </div>
            );
          }}
        />
      </div>
      <div className="absolute inset-x-5 top-[364px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center font-display text-xl font-black">
              {L.n}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { l: "Рейтинг", v: L.s },
                { l: "Винрейт", v: `${L.wr}%` },
                { l: "Место", v: `#${L.r}` },
              ].map((m, k) => (
                <motion.div
                  key={m.l}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: k * 0.05, ...SPRING.reward }}
                  className="glass rounded-xl py-2 text-center"
                >
                  <div className="text-[9px] text-white/45">{m.l}</div>
                  <div
                    className="font-display text-sm font-black"
                    style={{ color: L.c }}
                  >
                    <Roll value={m.v} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.button
        onClick={() => duel(idx)}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 flex items-center justify-center gap-2 rounded-2xl py-3 font-display text-sm font-black text-[#1a0a00]"
        animate={{ background: L.c }}
      >
        <I.swords size={16} /> ВЫЗВАТЬ НА ДУЭЛЬ
      </motion.button>
      <AnimatePresence>
        {challenge !== null && (
          <motion.div
            key="vs"
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#0f6e61] to-[#061a22]"
              style={{ clipPath: "polygon(0 0,100% 0,100% 42%,0 58%)" }}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <img
                src={hood}
                className="mask-soft absolute left-2 top-10 h-44 w-44 object-cover"
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-tl from-[#6e0f1e] to-[#1a060b]"
              style={{ clipPath: "polygon(0 58%,100% 42%,100% 100%,0 100%)" }}
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <img
                src={LEADERS[challenge].img}
                className="mask-soft absolute bottom-16 right-2 h-44 w-44 object-cover"
                style={{ filter: `hue-rotate(${LEADERS[challenge].hue}deg)` }}
              />
            </motion.div>
            <motion.div
              initial={{ scale: 4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ delay: 0.3, duration: 0.28, ease: EASE.snap }}
              className="absolute left-1/2 top-[312px] -ml-[50px] -mt-[36px] w-[100px] text-center font-display text-6xl font-black italic text-gold"
              style={{
                WebkitTextStroke: "2px #3a2200",
                textShadow: "0 0 30px #ffc34d",
              }}
            >
              VS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   87 · ENTRY TICKET — оторви корешок билета по перфорации
   ================================================================ */
export function EntryTicket({ run, cue }: SceneProps) {
  const x = useMotionValue(0);
  const yy = useMotionValue(0);
  const [torn, setTorn] = useState(false);
  const [pv, setPv] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const base = useRef(0);
  const g = useGhost();
  const p = useParticles();
  const prog = useTransform(x, (v) => xClamp(v / 160));
  const rot = useTransform(x, (v) => v * 0.09);
  const lastDot = useRef(0);
  useMotionValueEvent(prog, "change", (v) => {
    setPv(v);
    const d = Math.floor(v * 12);
    if (d !== lastDot.current) {
      lastDot.current = d;
      if (d > 0) sfx.tick();
    }
  });
  const finish = () => {
    setTorn(true);
    sfx.success();
    sfx.whoosh(0.4);
    animate(yy, 520, { duration: 0.7, ease: EASE.inQuart });
    animate(x, x.get() + 140, { duration: 0.7, ease: "easeOut" });
    if (root) animate(root, shakeKeys(0.4, 8, 6, 0.8), { duration: 0.3 });
    p.burst({
      x: 200,
      y: 260,
      count: 50,
      shape: "confetti",
      colors: [OR, "#fff", "#ffc34d"],
      speed: [150, 380],
      gravity: 500,
      life: [1.2, 2],
      size: [3, 5],
      spread: 2.4,
    });
  };
  const release = () => {
    if (torn) return;
    if (prog.get() > 0.75) finish();
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 18 });
  };
  useScript(run, async (wait) => {
    setTorn(false);
    x.set(0);
    yy.set(0);
    await wait(600);
    cue();
    g.show(235, 260);
    g.press(true);
    await Promise.all([
      g.move(235 + 60, 262, 0.5),
      animate(x, 60, { duration: 0.5 }),
    ]);
    g.press(false);
    await animate(x, 0, { type: "spring", stiffness: 400, damping: 18 });
    await wait(400);
    g.press(true);
    await Promise.all([
      g.move(235 + 140, 266, 0.6),
      animate(x, 140, { duration: 0.6, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
    finish();
  });
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={OR} />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Билет на финал
      </div>
      {/* тело билета */}
      <div
        className="absolute left-[16px] top-[160px] h-[200px] w-[176px] rounded-l-2xl border border-r-0 border-white/15 p-4"
        style={{ background: `linear-gradient(160deg, ${OR}33, #0c1428 65%)` }}
      >
        <div
          className="text-[9px] font-bold uppercase tracking-[.3em]"
          style={{ color: OR }}
        >
          Финал · Импульс
        </div>
        <div className="mt-1 font-display text-lg font-black leading-tight">
          Ты vs FOMO
        </div>
        <div className="mt-3 space-y-1 text-[10px] text-white/60">
          <div className="flex justify-between">
            <span>Арена</span>
            <span className="font-bold text-white">Бычьи холмы</span>
          </div>
          <div className="flex justify-between">
            <span>Старт</span>
            <span className="font-bold text-white">20:00</span>
          </div>
          <div className="flex justify-between">
            <span>Фонд</span>
            <span className="font-bold text-gold">25 000</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <img src={hood} className="h-7 w-7 rounded-full object-cover" />
          <img src={enemy} className="h-7 w-7 rounded-full object-cover" />
        </div>
      </div>
      {/* перфорация */}
      <div className="absolute left-[190px] top-[160px] flex h-[200px] w-2 flex-col justify-between py-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="mx-auto h-2 w-2 rounded-full"
            animate={{
              background: pv * 12 > i ? OR : "#ffffff22",
              scale: pv * 12 > i ? 1.3 : 1,
            }}
            transition={{ duration: 0.15 }}
            style={{ boxShadow: pv * 12 > i ? `0 0 8px ${OR}` : "none" }}
          />
        ))}
      </div>
      {/* корешок */}
      <motion.div
        className="absolute left-[196px] top-[160px] h-[200px] w-[88px] cursor-grab touch-none rounded-r-2xl border border-l-0 border-white/15 bg-[#141d36] p-2 active:cursor-grabbing"
        style={{ x, y: yy, rotate: rot, transformOrigin: "0% 50%" }}
        onPanStart={() => {
          base.current = x.get();
          sfx.tap();
        }}
        onPan={(_, i) => !torn && x.set(Math.max(0, base.current + i.offset.x))}
        onPanEnd={release}
      >
        <div className="text-center text-[8px] font-bold uppercase tracking-[.2em] text-white/50">
          Вход
        </div>
        <div className="mx-auto mt-2 grid w-[60px] grid-cols-5 gap-[2px]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[1px]"
              style={{ background: (i * 7) % 3 ? "#fff" : "transparent" }}
            />
          ))}
        </div>
        <div
          className="mt-3 text-center font-display text-sm font-black"
          style={{ color: OR }}
        >
          A-12
        </div>
        <div className="mt-1 text-center text-[8px] text-white/40">место</div>
      </motion.div>
      <AnimatePresence>
        {torn && (
          <motion.div
            key="t"
            initial={{ scale: 2.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ delay: 0.3, duration: 0.3, ease: EASE.snap }}
            className="absolute left-[30px] top-[395px] rounded-xl border-4 px-3 py-1 font-display text-lg font-black"
            style={{ borderColor: OR, color: OR, textShadow: `0 0 16px ${OR}` }}
          >
            БИЛЕТ АКТИВИРОВАН
          </motion.div>
        )}
      </AnimatePresence>
      {!torn && (
        <div className="absolute inset-x-6 bottom-8 text-center text-[10px] text-white/40">
          Тяни корешок вправо по перфорации
        </div>
      )}
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_TOURNEY: Category = {
  id: "tourney",
  n: "17",
  title: "Турниры",
  en: "Bracket · Prize tier · Podium",
  color: OR,
  blurb:
    "Соревнование, которое листается: сетка турнира по раундам с 3D-перелистыванием, лиги на слайдере с растущим фондом и карусель лидеров под прожектором с вызовом на дуэль.",
  scenes: [
    {
      id: "bracket",
      n: "53",
      title: "Сетка турнира",
      kind: "Round pager",
      lead: "Раунды 1/8 → финал листаются свайпом с 3D-поворотом страниц. На активной странице счета матчей прокручиваются, проигравшие гаснут, победители подсвечиваются галочкой. Прогресс-шкала следует за пальцем, внизу — твой путь к финалу.",
      secrets: [
        "Страница — rotateY ±25° и scale 0.85 от смещения: раунды выглядят как барабан, по которому едет сетка.",
        "Результаты раскрываются только на активной странице (key с флагом active): при каждом возвращении матч «доигрывается» заново.",
        "Прогресс турнира считается от сырого x, а не от индекса — шкала тянется вместе с пальцем.",
        "Проигравшая строка уходит в opacity 0.4 с задержкой 400мс после появления — сначала счёт, потом вердикт.",
        "Финал — кубок с бесконечной «гордой» анимацией rotate ±6° и y: цель турнира живёт.",
      ],
      tracks: [
        { label: "→ 1/4", start: 900, dur: 400, color: OR },
        { label: "Счета + вердикты", start: 1300, dur: 900, color: "#3ddc84" },
        { label: "→ 1/2", start: 2600, dur: 400, color: OR },
        { label: "→ Финал", start: 4300, dur: 400, color: "#ffc34d" },
        { label: "Кубок", start: 4700, dur: 800, color: "#ffc34d" },
      ],
      total: 5800,
      ease: { bez: EASE.outExpo, label: "≈ spring страниц" },
      code: `const off   = useTransform(x, v => v + i * PW);
const rotY  = useTransform(off, [-PW, 0, PW], [25, 0, -25]);
const scale = useTransform(off, [-PW, 0, PW], [.85, 1, .85]);
<motion.div style={{ x: off, rotateY: rotY, scale }}>
  {matches.map(m => <Match key={\`\${i}-\${active}\`} reveal={active} />)}
</motion.div>`,
      C: BracketSwipe,
      interactive: "Свайпай по раундам",
    },
    {
      id: "prizetier",
      n: "54",
      title: "Лига и призовой фонд",
      kind: "Tier slider",
      lead: "Ступенчатый слайдер выбирает лигу. Кубок растёт и меняет металл, столбики фонда поднимаются волной, монеты выпрыгивают вверх, название лиги переворачивается слотом. Участие подтверждается свайпом — конфетти, тряска и штамп «Заявка принята».",
      secrets: [
        "Ступенчатый слайдер: во время драга плавный, на отпускании снэп к ступени пружиной — и свобода, и точность.",
        "Монеты выпрыгивают только при повышении лиги, количество растёт со ступенью — жадность подогревается, откат не наказывается.",
        "Столбики фонда — каскад 40мс пружиной 200/16: волна роста слева направо.",
        "Кубок масштабируется от сырого значения слайдера (0.8 → 1.35), а цвет и свечение — от ступени: плавность и дискретность вместе.",
        "Название лиги — rotateX-слот. Металл меняется как табличка на двери.",
      ],
      tracks: [
        { label: "Бронза → Серебро", start: 500, dur: 500, color: "#cfd8ea" },
        { label: "→ Золото", start: 1500, dur: 500, color: "#ffc34d" },
        { label: "→ Алмаз", start: 2500, dur: 500, color: "#4cc3ff" },
        { label: "Откат к Золоту", start: 3500, dur: 400, color: "#ffc34d" },
        { label: "Свайп-участие", start: 4300, dur: 700, color: "#ffc34d" },
        { label: "Конфетти + штамп", start: 5000, dur: 700, color: OR },
      ],
      total: 5900,
      ease: { bez: EASE.outExpo, label: "outExpo — шаг лиги" },
      code: `useMotionValueEvent(t, "change", v => {
  const k = Math.round(v * 3);
  if (k > tierRef.current) coinFountain(12 + k * 10);   // только вверх
  tierRef.current = k; setTier(k);
});
const trophyScale = useTransform(t, [0, 1], [.8, 1.35]);   // плавно
<motion.div animate={{ color: T.c }} />                      // дискретно`,
      C: PrizeTier,
      interactive: "Двигай лигу, свайпни участие",
    },
    {
      id: "podium",
      n: "55",
      title: "Лидеры под прожектором",
      kind: "Cover carousel",
      lead: "Coverflow лидеров сезона: центральный встаёт на постамент, высота которого зависит от места, прожектор окрашивается в его металл, для топ-3 сверху падает конфетти. Тап — вызов на дуэль: диагональные панели и VS-штамп.",
      secrets: [
        "Высота постамента анимируется только у активной карточки: 70 − место×8. Иерархия видна в самой геометрии.",
        "Прожектор — трапеция clip-path с градиентом цвета лидера. Свет «переключается» вместе с героем.",
        "Конфетти только для топ-3 и с задержкой 200мс — после снэпа, чтобы праздник не мешал жесту.",
        "Дуэль переиспользует язык VS-экрана каталога: две clip-path панели навстречу + штамп. Консистентность ощущается как мир.",
        "Статистика перерисовывается каскадом 50мс с reward-пружиной — у каждого лидера своя «презентация».",
      ],
      tracks: [
        { label: "Свайп ×3", start: 600, dur: 2400, color: "#cfd8ea" },
        { label: "Конфетти топ-3", start: 1150, dur: 1400, color: "#ffc34d" },
        { label: "Тап «дуэль»", start: 3400, dur: 100, color: "#ff4d5e" },
        { label: "Панели + VS", start: 3500, dur: 600, color: "#ff4d5e" },
      ],
      total: 5300,
      ease: { bez: EASE.snap, label: "snap — VS" },
      code: `<motion.div animate={{ height: active ? 70 - l.r * 8 : 30 }}
  style={{ borderTop: \`3px solid \${l.c}\` }} />

<motion.div style={{ clipPath: "polygon(40% 0,60% 0,100% 100%,0 100%)" }}
  animate={{ background: \`linear-gradient(180deg, \${L.c}44, transparent 85%)\` }} />`,
      C: PodiumCarousel,
      interactive: "Листай лидеров, тапни дуэль",
    },
    {
      id: "ticket",
      n: "87",
      title: "Отрыв билета",
      kind: "Tear-off drag",
      lead: "Билет на финал с перфорацией. Корешок тянут вправо: он поворачивается от линии отрыва, точки перфорации загораются по одной с тиком. Недотянул — корешок возвращается. Дотянул — он отрывается, падает с вращением, сыплется конфетти и падает штамп «Билет активирован».",
      secrets: [
        "transformOrigin 0% 50% + rotate = x·0.09: корешок вращается вокруг перфорации, как настоящая бумага.",
        "Точки перфорации — индикатор прогресса: 12 шагов, каждая загорается и звучит. Усилие видно и слышно.",
        "Порог 75% — отрыв требует уверенного жеста, случайное касание не активирует билет.",
        "Падение — две независимые анимации: y с ease-in (гравитация) и x с easeOut (инерция броска).",
        "Физическая метафора (отрыв билета) делает цифровое действие ритуалом.",
      ],
      tracks: [
        { label: "Пробный рывок", start: 600, dur: 500, color: OR },
        { label: "Возврат", start: 1100, dur: 400, color: "#ff4d5e" },
        { label: "Полный отрыв", start: 1900, dur: 600, color: OR },
        {
          label: "Падение + конфетти",
          start: 2500,
          dur: 700,
          color: "#ffc34d",
        },
        { label: "Штамп", start: 2800, dur: 300, color: OR },
      ],
      total: 3500,
      ease: { bez: EASE.inQuart, label: "inQuart — падение корешка" },
      code: `const rot = useTransform(x, v => v * .09);
<motion.div style={{ x, y: fall, rotate: rot, transformOrigin: "0% 50%" }}
  onPan={(_, i) => x.set(Math.max(0, base + i.offset.x))}
  onPanEnd={() => prog.get() > .75 ? tearOff() : springBack()} />
{dots.map(i => <span style={{ background: prog * 12 > i ? OR : "#fff2" }} />)}`,
      C: EntryTicket,
      interactive: "Тяни корешок вправо",
    },
  ],
};
