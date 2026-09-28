import { hexMix as xHex } from "../components/controls";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Category } from "../data/catalog";
import {
  Carousel,
  Knob,
  Roll,
  Slider,
  VSlider,
  useGhost,
} from "../components/controls";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const B = "#60a5fa";

/* ================================================================
   67 · TUNE KNOB — поймай частоту: шум превращается в сигнал
   ================================================================ */
const TARGET = 0.68;

export function TuneKnob({ run, cue }: SceneProps) {
  const f = useMotionValue(0.2);
  const [phase, setPhase] = useState(0);
  const [locked, setLocked] = useState(false);
  const [clarity, setClarity] = useState(0);
  const g = useGhost();
  const p = useParticles();
  const lockT = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const freq = useTransform(f, (v) => `${(88 + v * 20).toFixed(1)} МГц`);

  useMotionValueEvent(f, "change", (v) => {
    const d = Math.abs(v - TARGET);
    const c = clamp(1 - d / 0.25);
    setClarity(c);
    if (d < 0.03 && !lockedRef.current) {
      if (!lockT.current)
        lockT.current = window.setTimeout(() => {
          lockedRef.current = true;
          setLocked(true);
          sfx.success();
          p.ring(150, 170, B, 140, 0.7, 8);
          p.burst({
            x: 150,
            y: 170,
            count: 40,
            colors: [B, "#fff"],
            speed: [120, 340],
          });
        }, 500);
    } else if (d >= 0.03) {
      if (lockT.current) clearTimeout(lockT.current);
      lockT.current = null;
      if (lockedRef.current) {
        lockedRef.current = false;
        setLocked(false);
      }
    }
  });

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setPhase((x) => x + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // волна: смесь чистой синусоиды и шума в пропорции «ясности»
  const wave = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 260;
      const sig = Math.sin(i * 0.45 + phase * 0.12) * 26;
      const noise = (Math.random() - 0.5) * 60;
      const y = 50 + sig * clarity + noise * (1 - clarity);
      pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [phase, clarity]);

  useScript(run, async (wait) => {
    f.set(0.2);
    lockedRef.current = false;
    setLocked(false);
    await wait(600);
    cue();
    const knobAt = (v: number) => {
      const a = ((-135 + v * 270) * Math.PI) / 180;
      return { x: 150 + Math.sin(a) * 50, y: 400 - Math.cos(a) * 50 };
    };
    const k0 = knobAt(0.2);
    g.show(k0.x, k0.y);
    g.press(true);
    for (const [v, d] of [
      [0.85, 1],
      [0.6, 0.6],
      [0.7, 0.4],
      [TARGET, 0.3],
    ] as const) {
      const steps = 12;
      const from = f.get();
      for (let s = 1; s <= steps; s++) {
        const vv = from + ((v - from) * s) / steps;
        const k = knobAt(vv);
        g.x.set(k.x);
        g.y.set(k.y);
        f.set(vv);
        await wait((d * 1000) / steps);
      }
      sfx.spinTick(Math.round(v * 30));
      await wait(250);
    }
    g.press(false);
    g.hide();
  });

  const col = locked ? "#3ddc84" : B;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={col} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Настройка сигнала</div>
        <motion.span className="font-mono text-[11px]" style={{ color: col }}>
          {freq}
        </motion.span>
      </div>
      <div className="glass absolute inset-x-4 top-[80px] h-[170px] overflow-hidden rounded-2xl">
        {/* статический шум */}
        <div
          className="absolute inset-0 grid grid-cols-[repeat(26,1fr)] gap-px p-1"
          style={{ opacity: (1 - clarity) * 0.5 }}
        >
          {Array.from({ length: 26 * 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: Math.random() > 0.5 ? "#ffffff22" : "transparent",
              }}
            />
          ))}
        </div>
        <svg
          viewBox="0 0 260 100"
          className="absolute inset-x-0 top-[35px] h-[100px] w-full"
          preserveAspectRatio="none"
        >
          <path
            d={wave}
            fill="none"
            stroke={col}
            strokeWidth="2.2"
            style={{ filter: `drop-shadow(0 0 ${4 + clarity * 8}px ${col})` }}
          />
        </svg>
        <div className="absolute bottom-2 left-3 text-[9px] font-bold text-white/50">
          ясность <Roll value={`${Math.round(clarity * 100)}%`} color={col} />
        </div>
      </div>
      {/* шкала частот */}
      <div className="absolute inset-x-6 top-[262px] h-6">
        <div className="absolute inset-x-0 top-3 h-px bg-white/15" />
        {Array.from({ length: 21 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1 w-px bg-white/30"
            style={{ left: `${i * 5}%`, height: i % 5 ? 6 : 12 }}
          />
        ))}
        <div
          className="absolute top-0 h-6 w-1 -ml-0.5 rounded bg-[#3ddc84]/40"
          style={{ left: `${TARGET * 100}%` }}
        />
        <motion.div
          className="absolute top-0 h-6 w-0.5 -ml-px rounded"
          style={{
            left: useTransform(f, (v) => `${v * 100}%`),
            background: col,
            boxShadow: `0 0 8px ${col}`,
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-[330px] flex justify-center">
        <Knob mv={f} size={140} color={col} steps={60} />
      </div>
      <AnimatePresence>
        {locked && (
          <motion.div
            key="card"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={SPRING.reward}
            className="glass absolute inset-x-4 bottom-5 rounded-2xl border-bull/50 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bull blink" />
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-bull">
                Сигнал пойман
              </span>
            </div>
            <div className="mt-1 text-sm font-bold">
              BTC · ретест уровня 64 000 с объёмом
            </div>
            <Candles
              data={genCandles(16, 13, 0.12)}
              w={250}
              h={46}
              grow={false}
              highlight={15}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!locked && (
        <div className="absolute inset-x-0 bottom-8 text-center text-[10px] text-white/40">
          Крути ручку. Задержись на частоте — сигнал зафиксируется.
        </div>
      )}
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   68 · RADAR RANGE — радиус слайдером раскрывает цели
   ================================================================ */
const BLIPS = Array.from({ length: 14 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const r = 0.18 + ((i * 0.37) % 0.8);
  return {
    i,
    a,
    r,
    x: Math.cos(a) * r,
    y: Math.sin(a) * r,
    t: ["Кит", "Памп", "Слив", "Объём", "Новость"][i % 5],
    c: ["#4cc3ff", "#3ddc84", "#ff4d5e", "#ffc34d", "#9b7bff"][i % 5],
  };
});
const RR = 115;

export function RadarRange({ run, cue }: SceneProps) {
  const range = useMotionValue(0.3);
  const [r, setR] = useState(0.3);
  const [sel, setSel] = useState<number | null>(null);
  const g = useGhost();
  const p = useParticles();
  const seen = useRef(new Set<number>());
  const ring = useTransform(range, (v) => v * RR * 2);
  useMotionValueEvent(range, "change", (v) => {
    setR(v);
    BLIPS.forEach((b) => {
      if (b.r <= v && !seen.current.has(b.i)) {
        seen.current.add(b.i);
        sfx.island();
        p.burst({
          x: 150 + b.x * RR,
          y: 220 + b.y * RR,
          count: 8,
          colors: [b.c, "#fff"],
          speed: [40, 120],
        });
      }
      if (b.r > v) seen.current.delete(b.i);
    });
  });
  const inside = BLIPS.filter((b) => b.r <= r);

  useScript(run, async (wait) => {
    range.set(0.3);
    seen.current.clear();
    setSel(null);
    await wait(600);
    cue();
    g.show(24 + 0.3 * 252, 420);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.95 * 252, 420, 1.4),
      animate(range, 0.95, { duration: 1.4, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(300);
    const b = BLIPS[3];
    await g.move(150 + b.x * RR, 220 + b.y * RR, 0.5);
    g.press(true);
    await wait(90);
    g.press(false);
    setSel(3);
    sfx.pop(4);
    await wait(1200);
    setSel(null);
    await g.move(24 + 0.95 * 252, 420, 0.4);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.5 * 252, 420, 0.7),
      animate(range, 0.5, { duration: 0.7, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={B} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Радар рынка</div>
        <div className="text-[10px] text-white/55">
          целей <Roll value={inside.length} color={B} />
        </div>
      </div>
      <div className="absolute left-1/2 top-[220px] h-[240px] w-[240px] -ml-[120px] -mt-[120px]">
        {[1, 0.66, 0.33].map((s) => (
          <div
            key={s}
            className="absolute rounded-full border border-[#60a5fa]/20"
            style={{ inset: `${(1 - s) * 50}%` }}
          />
        ))}
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#60a5fa]/15" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-[#60a5fa]/15" />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${B}00 0deg, ${B}55 40deg, ${B}00 42deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full border-2"
          style={{
            width: ring,
            height: ring,
            x: "-50%",
            y: "-50%",
            borderColor: B,
            boxShadow: `0 0 20px ${B}55, inset 0 0 30px ${B}22`,
          }}
        />
        {BLIPS.map((b) => {
          const on = b.r <= r;
          return (
            <motion.button
              key={b.i}
              onClick={() => on && (setSel(b.i), sfx.pop(2))}
              className="absolute h-4 w-4 -ml-2 -mt-2 rounded-full"
              style={{
                left: 120 + b.x * RR,
                top: 120 + b.y * RR,
                background: b.c,
              }}
              initial={false}
              animate={
                on
                  ? {
                      scale: [0, 1.6, 1],
                      opacity: 1,
                      boxShadow: `0 0 12px ${b.c}`,
                    }
                  : { scale: 0.4, opacity: 0.15 }
              }
              transition={{ duration: 0.4, ease: EASE.overshoot }}
            >
              {on && (
                <span
                  className="pulse-ring absolute inset-0 rounded-full border"
                  style={{ borderColor: b.c }}
                />
              )}
            </motion.button>
          );
        })}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
      </div>
      <AnimatePresence>
        {sel !== null && (
          <motion.div
            key={sel}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={SPRING.reward}
            className="glass absolute inset-x-8 top-[90px] z-20 rounded-2xl p-3"
            style={{ borderColor: `${BLIPS[sel].c}88` }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[.2em]"
              style={{ color: BLIPS[sel].c }}
            >
              {BLIPS[sel].t}
            </div>
            <div className="text-[12px] font-bold">
              Дистанция {(BLIPS[sel].r * 100).toFixed(0)} · сила {60 + sel * 3}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-6 top-[400px]">
        <Slider
          mv={range}
          label="Радиус сканирования"
          color={B}
          format={(v) => `${Math.round(v * 100)} км`}
        />
      </div>
      <div className="absolute inset-x-4 bottom-5 flex flex-wrap justify-center gap-1.5">
        {["Кит", "Памп", "Слив", "Объём", "Новость"].map((t, i) => (
          <span
            key={t}
            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: `${BLIPS[i].c}1a`, color: BLIPS[i].c }}
          >
            {t} {inside.filter((b) => b.t === t).length}
          </span>
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   69 · SIGNAL STACK — стопка карточек сигналов
   ================================================================ */
const SIGNALS = [
  { pair: "BTC", t: "Ретест 64k", s: 0.86, c: "#3ddc84", dir: 1 },
  { pair: "ETH", t: "Дивергенция RSI", s: 0.64, c: "#4cc3ff", dir: 1 },
  { pair: "SOL", t: "Ложный пробой", s: 0.72, c: "#ff4d5e", dir: -1 },
  { pair: "TON", t: "Сжатие диапазона", s: 0.51, c: "#ffc34d", dir: 1 },
  { pair: "BNB", t: "Слив кита", s: 0.78, c: "#9b7bff", dir: -1 },
];

export function SignalStack({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState<Set<number>>(new Set());
  const g = useGhost();
  const p = useParticles();
  const S = SIGNALS[idx];
  const star = (i: number) => {
    setFav((f) => {
      const n = new Set(f);
      if (n.has(i)) n.delete(i);
      else {
        n.add(i);
        sfx.chime();
        p.burst({
          x: 222,
          y: 150,
          count: 24,
          shape: "star",
          colors: ["#ffc34d", "#fff"],
          speed: [80, 240],
          size: [2, 5],
        });
      }
      return n;
    });
  };
  useScript(run, async (wait) => {
    setIdx(0);
    setFav(new Set());
    await wait(600);
    cue();
    g.show(80, 240);
    for (const n of [1, 2, 3]) {
      g.press(true);
      await g.move(220, 240, 0.3);
      g.press(false);
      setIdx(n);
      await wait(700);
      await g.move(80, 240, 0.2);
    }
    await g.move(222, 150, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    star(3);
    await wait(700);
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={S.c} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Лента сигналов</div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gold">
          <I.sparkle size={12} /> <Roll value={fav.size} />
        </div>
      </div>
      <div className="absolute inset-x-0 top-[100px]">
        <Carousel
          count={SIGNALS.length}
          index={idx}
          onIndex={setIdx}
          step={210}
          mode="stack"
          height={240}
          render={(i, a) => {
            const s = SIGNALS[i];
            return (
              <div
                className="relative h-[220px] w-[220px] rounded-3xl border p-4"
                style={{
                  borderColor: `${s.c}66`,
                  background: `linear-gradient(170deg, ${s.c}26, #0c1428 60%)`,
                  boxShadow: a
                    ? `0 20px 40px -12px ${s.c}`
                    : "0 10px 30px -10px #000",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-black">
                    {s.pair}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      star(i);
                    }}
                    className={fav.has(i) ? "text-gold" : "text-white/30"}
                  >
                    <motion.span
                      className="inline-block"
                      animate={
                        fav.has(i)
                          ? { scale: [1, 1.5, 1], rotate: [0, 20, 0] }
                          : {}
                      }
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={fav.has(i) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" />
                      </svg>
                    </motion.span>
                  </button>
                </div>
                <div
                  className="mt-1 text-[12px] font-bold"
                  style={{ color: s.c }}
                >
                  {s.t}
                </div>
                <Candles
                  data={genCandles(14, 20 + i * 7, s.dir * 0.15)}
                  w={188}
                  h={80}
                  grow={a}
                  step={0.03}
                />
                <div className="mt-2 text-[9px] font-bold text-white/50">
                  Сила сигнала
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, k) => (
                    <motion.div
                      key={k}
                      className="h-2.5 flex-1 rounded-sm"
                      initial={false}
                      animate={{
                        background: a && k < s.s * 10 ? s.c : "#ffffff14",
                        scaleY: a && k < s.s * 10 ? [0.3, 1] : 1,
                      }}
                      transition={{
                        delay: a ? 0.2 + k * 0.04 : 0,
                        duration: 0.25,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>
      <div className="absolute inset-x-5 top-[372px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass flex items-center gap-3 rounded-2xl p-3"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: `${S.c}22`, color: S.c }}
            >
              <span
                style={{ transform: S.dir < 0 ? "rotate(180deg)" : "none" }}
              >
                <I.arrowUp size={18} stroke={3} />
              </span>
            </div>
            <div className="flex-1 text-[11px] text-white/70">
              {S.dir > 0
                ? "Потенциальный лонг — дождись подтверждения"
                : "Осторожно: вероятен разворот вниз"}
            </div>
            <Roll
              value={`${Math.round(S.s * 100)}%`}
              color={S.c}
              className="font-display text-sm font-black"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 bottom-8 flex justify-center gap-1.5">
        {SIGNALS.map((s, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === idx ? 20 : 6,
              background: i === idx ? s.c : "#ffffff33",
            }}
            className="h-1.5 rounded-full"
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
   70 · NOISE FILTER — вертикальные фейдеры отсекают шум
   ================================================================ */
const FEED = [
  { t: "Кит перевёл 12 000 BTC", src: 2, q: 0.9 },
  { t: "«BTC по миллиону!» — блогер", src: 0, q: 0.1 },
  { t: "ФРС: протокол заседания", src: 1, q: 0.8 },
  { t: "Мемкоин +900% за час", src: 0, q: 0.05 },
  { t: "Приток на биржи растёт", src: 2, q: 0.85 },
  { t: "Слухи о запрете крипты", src: 1, q: 0.3 },
  { t: "Твиттер: «все продают»", src: 0, q: 0.15 },
];
const SRC = [
  { n: "Соцсети", c: "#ff6bd6" },
  { n: "Новости", c: "#ffc34d" },
  { n: "Ончейн", c: "#60a5fa" },
];

export function NoiseFilter({ run, cue }: SceneProps) {
  const f0 = useMotionValue(0.9);
  const f1 = useMotionValue(0.9);
  const f2 = useMotionValue(0.9);
  const fs = [f0, f1, f2];
  const [lv, setLv] = useState([0.9, 0.9, 0.9]);
  const g = useGhost();
  useMotionValueEvent(f0, "change", (v) => setLv((l) => [v, l[1], l[2]]));
  useMotionValueEvent(f1, "change", (v) => setLv((l) => [l[0], v, l[2]]));
  useMotionValueEvent(f2, "change", (v) => setLv((l) => [l[0], l[1], v]));
  const visible = FEED.map((it) => ({ ...it, w: lv[it.src] }));
  const sig = visible.reduce((s, it) => s + it.q * it.w, 0);
  const noise = visible.reduce((s, it) => s + (1 - it.q) * it.w, 0);
  const snr = sig / Math.max(0.1, sig + noise);

  useScript(run, async (wait) => {
    fs.forEach((m) => m.set(0.9));
    await wait(600);
    cue();
    const move = async (k: number, to: number) => {
      const x = 60 + k * 90;
      g.show(x, 520 - fs[k].get() * 130);
      g.press(true);
      await Promise.all([
        g.move(x, 520 - to * 130, 0.7),
        animate(fs[k], to, { duration: 0.7, ease: EASE.camera }),
      ]);
      g.press(false);
      sfx.snap();
      await wait(400);
    };
    await move(0, 0.05);
    await move(1, 0.5);
    await move(2, 1);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={B} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Фильтр шума</div>
        <div className="text-[10px] font-bold">
          сигнал/шум{" "}
          <Roll
            value={`${Math.round(snr * 100)}%`}
            color={snr > 0.7 ? "#3ddc84" : snr > 0.5 ? "#ffc34d" : "#ff4d5e"}
          />
        </div>
      </div>
      <div className="absolute inset-x-4 top-[76px] h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${snr * 100}%`,
            background:
              snr > 0.7 ? "#3ddc84" : snr > 0.5 ? "#ffc34d" : "#ff4d5e",
          }}
          transition={SPRING.panel}
        />
      </div>
      <div className="absolute inset-x-4 top-[96px] space-y-1.5">
        {visible.map((it, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5"
            animate={{
              opacity: 0.15 + it.w * 0.85,
              filter: `blur(${(1 - it.w) * 3}px)`,
              x: (1 - it.w) * 24,
              borderColor: `${SRC[it.src].c}${it.w > 0.5 ? "66" : "22"}`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: SRC[it.src].c }}
            />
            <span className="flex-1 text-[11px] font-bold">{it.t}</span>
            <span
              className="rounded px-1 text-[8px] font-black"
              style={{
                background: it.q > 0.5 ? "#3ddc8433" : "#ff4d5e33",
                color: it.q > 0.5 ? "#3ddc84" : "#ff4d5e",
              }}
            >
              {it.q > 0.5 ? "СИГНАЛ" : "ШУМ"}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-8 bottom-6 flex justify-around">
        {SRC.map((s, k) => (
          <VSlider key={s.n} mv={fs[k]} color={s.c} height={130} label={s.n} />
        ))}
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   85 · HEATMAP SCRUB — тепловая карта рынка по времени суток
   ================================================================ */
const ASSETS = [
  "BTC",
  "ETH",
  "SOL",
  "TON",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "DOT",
  "LINK",
  "ATOM",
];
const heatAt = (i: number, t: number) =>
  clamp(
    Math.sin(i * 1.7 + t * 6.2) * 0.6 + Math.sin(i * 0.9 - t * 3.1) * 0.4,
    -1,
    1,
  );

export function HeatmapScrub({ run, cue }: SceneProps) {
  const t = useMotionValue(0);
  const [tv, setTv] = useState(0);
  const g = useGhost();
  const leader = useRef(-1);
  useMotionValueEvent(t, "change", (v) => {
    setTv(v);
    const vals = ASSETS.map((_, i) => heatAt(i, v));
    const top = vals.indexOf(Math.max(...vals));
    if (top !== leader.current) {
      leader.current = top;
      sfx.tick();
    }
  });
  const vals = ASSETS.map((_, i) => heatAt(i, tv));
  const top = vals.indexOf(Math.max(...vals));
  const up = vals.filter((v) => v > 0).length;
  const hh = String(Math.floor(tv * 23.99)).padStart(2, "0");
  useScript(run, async (wait) => {
    t.set(0);
    await wait(600);
    cue();
    g.show(24, 470);
    g.press(true);
    await Promise.all([
      g.move(24 + 252, 470, 2.6),
      animate(t, 1, { duration: 2.6, ease: "linear" }),
    ]);
    await Promise.all([
      g.move(24 + 0.4 * 252, 470, 0.8),
      animate(t, 0.4, { duration: 0.8, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={B} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Тепловая карта</div>
        <div className="font-mono text-sm font-bold" style={{ color: B }}>
          <Roll value={`${hh}:00`} />
        </div>
      </div>
      <div className="absolute inset-x-4 top-[84px] grid grid-cols-3 gap-2">
        {ASSETS.map((a, i) => {
          const v = vals[i];
          const col =
            v >= 0
              ? xHex("#12301f", "#3ddc84", v)
              : xHex("#30121a", "#ff4d5e", -v);
          return (
            <motion.div
              key={a}
              className="relative flex aspect-[1.25] flex-col items-center justify-center rounded-xl"
              animate={{ background: col, scale: 0.9 + Math.abs(v) * 0.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <span className="text-[11px] font-black">{a}</span>
              <span className="font-mono text-[10px] font-bold text-white/80">
                {v >= 0 ? "+" : ""}
                {(v * 8).toFixed(1)}%
              </span>
              {i === top && (
                <motion.div
                  layoutId="heattop"
                  className="absolute -inset-1 rounded-xl border-2 border-white"
                  transition={SPRING.layout}
                  style={{ boxShadow: "0 0 16px #fff" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-x-4 top-[370px] grid grid-cols-2 gap-2">
        <div className="glass rounded-xl py-2 text-center">
          <div className="text-[9px] text-white/45">Растут</div>
          <div className="font-display text-base font-black text-bull">
            <Roll value={up} />
          </div>
        </div>
        <div className="glass rounded-xl py-2 text-center">
          <div className="text-[9px] text-white/45">Лидер часа</div>
          <div
            className="font-display text-base font-black"
            style={{ color: B }}
          >
            <Roll value={ASSETS[top]} />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-6 top-[456px]">
        <Slider
          mv={t}
          color={B}
          format={(v) => `${String(Math.floor(v * 23.99)).padStart(2, "0")}:00`}
          marks={["00", "06", "12", "18", "24"]}
        />
      </div>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/40">
        Рамка лидера перелетает между ячейками при смене часа
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_RADAR: Category = {
  id: "radar",
  n: "21",
  title: "Радар сигналов",
  en: "Tune knob · Range · Stack · Filter",
  color: B,
  blurb:
    "Поиск сигнала как ремесло: ручка настройки превращает шум в синусоиду, слайдер радиуса раскрывает цели радара, стопка сигналов листается, фейдеры источников отсекают шум ленты.",
  scenes: [
    {
      id: "tune",
      n: "67",
      title: "Ручка настройки",
      kind: "Rotary knob",
      lead: "Поворотная ручка меняет частоту: волна плавно переходит от хаотичного шума к чистой синусоиде, статика экрана гаснет, указатель ползёт по шкале. Удержишь частоту полсекунды — сигнал фиксируется, выезжает карточка с сетапом.",
      secrets: [
        "Волна = sig·ясность + шум·(1 − ясность). Одна формула даёт непрерывный переход от хаоса к порядку.",
        "Фиксация требует удержания 500мс в окне ±3% — «поймать» частоту, а не проскочить. Уход с частоты сразу сбрасывает замок.",
        "Ручка тикает на каждом из 60 делений — точная настройка ощущается зубцами.",
        "Статика — сетка случайных пикселей, прозрачность которой падает с ясностью. Шум виден, а не только слышен.",
        "Демо сначала перелетает цель, возвращается и доводит — показывает, как искать.",
      ],
      tracks: [
        { label: "Перелёт 0.85", start: 600, dur: 1000, color: B },
        { label: "Назад 0.6", start: 1850, dur: 600, color: B },
        { label: "Доводка", start: 2700, dur: 700, color: B },
        { label: "Замок 500мс", start: 3400, dur: 500, color: "#3ddc84" },
        { label: "Карточка", start: 3900, dur: 500, color: "#3ddc84" },
      ],
      total: 4600,
      ease: { bez: EASE.overshoot, label: "overshoot — карточка сигнала" },
      code: `const y = 50 + sig * clarity + noise * (1 - clarity);   // хаос → порядок
useMotionValueEvent(f, "change", v => {
  if (Math.abs(v - TARGET) < .03) lockTimer ??= setTimeout(lock, 500);
  else { clearTimeout(lockTimer); lockTimer = null; unlock(); }
});`,
      C: TuneKnob,
      interactive: "Крути ручку",
    },
    {
      id: "range",
      n: "68",
      title: "Радиус радара",
      kind: "Reveal slider",
      lead: "Слайдер растягивает кольцо сканирования. Цели внутри радиуса вспыхивают с пингом и частицами, снаружи — тускнеют. Луч радара крутится постоянно, тап по цели открывает карточку. Счётчики по типам пересчитываются вживую.",
      secrets: [
        "Цели разложены по золотому углу (137.5°) — равномерно и естественно, без ручной расстановки.",
        "Появление — pop scale [0, 1.6, 1] + пинг + частицы; исчезновение — тихое затухание. Находка громкая, потеря тихая.",
        "Кольцо — width/height от слайдера, с внутренним и внешним свечением: граница видна как физический объект.",
        "Цель, уже найденная, не пингует повторно, пока не выйдет из радиуса (Set seen).",
        "Луч радара — conic-gradient, бесконечное linear-вращение за 2.4с.",
      ],
      tracks: [
        { label: "Радиус → 95%", start: 600, dur: 1400, color: B },
        { label: "Пинги целей", start: 700, dur: 1300, color: "#3ddc84" },
        { label: "Тап по цели", start: 2800, dur: 1300, color: "#ffc34d" },
        { label: "Радиус → 50%", start: 4500, dur: 700, color: B },
      ],
      total: 5400,
      ease: { bez: EASE.camera, label: "camera — радиус" },
      code: `const a = i * 137.5 * Math.PI / 180;          // золотой угол
const ring = useTransform(range, v => v * R * 2);
useMotionValueEvent(range, "change", v => BLIPS.forEach(b => {
  if (b.r <= v && !seen.has(b)) { seen.add(b); ping(b); }
  if (b.r > v) seen.delete(b);
}));`,
      C: RadarRange,
      interactive: "Тяни радиус, тапай цели",
    },
    {
      id: "sigstack",
      n: "69",
      title: "Стопка сигналов",
      kind: "Stack carousel",
      lead: "Сигналы лежат стопкой: верхняя карточка уезжает влево, следующая поднимается. У активной карточки свечи вырастают, шкала силы заполняется по делениям, фон окрашивается в цвет сигнала. Звёздочка добавляет в избранное со всплеском.",
      secrets: [
        "Режим stack той же карусели: уходящие карточки едут на полный шаг, ожидающие — сдвинуты на 18px и приподняты. Одна математика, другой характер.",
        "Свечи и шкала запускаются только у активной карточки (grow={active}) — внимание там, где палец.",
        "Шкала силы — 10 делений с каскадом 40мс и scaleY [0.3, 1]: сила «набирается».",
        "stopPropagation на звёздочке: тап по кнопке не листает карусель — микро-деталь, без которой интерфейс раздражает.",
        "Подсказка под стопкой меняет направление стрелки и текст по знаку сигнала.",
      ],
      tracks: [
        { label: "Свайп ×3", start: 600, dur: 2400, color: B },
        { label: "Шкала силы", start: 900, dur: 2300, color: "#3ddc84" },
        { label: "В избранное", start: 3500, dur: 700, color: "#ffc34d" },
      ],
      total: 4500,
      ease: { bez: EASE.outExpo, label: "outExpo — шкала" },
      code: `const tx = useTransform(off, v => v < 0 ? v * step : v * 18);   // stack
const ty = useTransform(off, v => v > 0 ? v * -10 : 0);
{bars.map((_, k) => <motion.div
  animate={{ background: active && k < s * 10 ? color : "#fff1", scaleY: [.3, 1] }}
  transition={{ delay: .2 + k * .04 }} />)}`,
      C: SignalStack,
      interactive: "Листай стопку, отмечай",
    },
    {
      id: "noisefilter",
      n: "70",
      title: "Фейдеры источников",
      kind: "Mixer faders",
      lead: "Три вертикальных фейдера — соцсети, новости, ончейн — управляют лентой как микшер. Приглушённые источники уходят в размытие, прозрачность и сдвиг вправо, метр «сигнал/шум» пересчитывается и меняет цвет.",
      secrets: [
        "Каждая строка анимирует opacity, blur и x от уровня своего источника — лента «микшируется», а не фильтруется.",
        "Метрика SNR = Σ(качество·вес)/Σ(вес): игрок видит, что отключение соцсетей почти не теряет сигнала.",
        "Цвет метра: красный <50%, жёлтый <70%, зелёный. Цель ясна без инструкции.",
        "Фейдер — вертикальный контрол с тиками каждые 1/12: звук пульта.",
        "Метки «СИГНАЛ/ШУМ» на строках — обучение: игрок связывает источник с качеством.",
      ],
      tracks: [
        { label: "Соцсети ↓", start: 600, dur: 700, color: "#ff6bd6" },
        { label: "Новости ½", start: 1700, dur: 700, color: "#ffc34d" },
        { label: "Ончейн ↑", start: 2800, dur: 700, color: B },
        { label: "SNR растёт", start: 600, dur: 2900, color: "#3ddc84" },
      ],
      total: 3800,
      ease: { bez: EASE.camera, label: "camera — фейдер" },
      code: `<motion.div animate={{
  opacity: .15 + w * .85,
  filter: \`blur(\${(1 - w) * 3}px)\`,
  x: (1 - w) * 24,
}} transition={{ type: "spring", stiffness: 200, damping: 24 }} />
const snr = sig / (sig + noise);`,
      C: NoiseFilter,
      interactive: "Двигай фейдеры",
    },
    {
      id: "heatmap",
      n: "85",
      title: "Тепловая карта по времени",
      kind: "Time scrub heatmap",
      lead: "Двенадцать активов в сетке окрашиваются от красного к зелёному, слайдер прокручивает сутки. Ячейки перекрашиваются и слегка масштабируются по силе движения, белая рамка лидера часа перелетает между ячейками, сводка пересчитывается.",
      secrets: [
        "Рамка лидера — один элемент с layoutId: при смене лидера она перелетает, а не мигает. Глаз следит за «короной».",
        "Цвет — hexMix от тёмного к насыщенному по модулю изменения: сила движения читается насыщенностью.",
        "Масштаб 0.9 + |v|·0.1 — сильные движения «выпирают» из сетки.",
        "Тик звука на смене лидера — слышно, когда рынок «переключается».",
        "Данные — сумма двух синусоид разных частот: реалистично хаотично, но детерминированно для повтора.",
      ],
      tracks: [
        { label: "Сутки 00 → 24", start: 600, dur: 2600, color: B },
        { label: "Рамка лидера", start: 600, dur: 3400, color: "#ffffff" },
        { label: "Возврат к 09:00", start: 3200, dur: 800, color: B },
      ],
      total: 4200,
      ease: { bez: EASE.camera, label: "camera — возврат" },
      code: `const col = v >= 0 ? hexMix(DARK_G, BULL, v) : hexMix(DARK_R, BEAR, -v);
<motion.div animate={{ background: col, scale: .9 + Math.abs(v) * .1 }} />
{i === top && <motion.div layoutId="heattop" className="border-2 border-white" />}`,
      C: HeatmapScrub,
      interactive: "Тяни время суток",
    },
  ],
};
