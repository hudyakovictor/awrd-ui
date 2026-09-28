import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useVelocity,
  useSpring,
} from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { Category } from "../data/catalog";
import {
  Segmented,
  Slider,
  Toggle,
  Roll,
  useGhost,
} from "../components/controls";
import { genCandles, I, type Candle } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ------------------------------------------------------------------
   Общая геометрия графика. Скейлы — чистые функции, чтобы любой слой
   (свечи, MA, уровни, объём) строился в одной системе координат.
   ------------------------------------------------------------------ */
interface Geo {
  x: (i: number) => number;
  y: (v: number) => number;
  cw: number;
}
function geo(data: Candle[], w: number, h: number, pad = 8): Geo {
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const cw = w / data.length;
  return {
    x: (i) => i * cw + cw / 2,
    y: (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2),
    cw,
  };
}
const up = (c: Candle) => c.c >= c.o;

/* ================================================================
   35 · REPLAY SCRUBBER — слайдер времени, события, скорость = наклон
   ================================================================ */
const R_DATA = genCandles(40, 61, 0.1);
const EVENTS = [
  { i: 9, t: "ФРС: ставка без изменений", c: "#ffc34d", icon: I.news },
  { i: 21, t: "Кит перевёл $40M на биржу", c: "#4cc3ff", icon: I.eye },
  { i: 32, t: "Ликвидации шортов $180M", c: "#ff4d5e", icon: I.flame },
];

export function ReplayScrubber({ run, cue }: SceneProps) {
  const t = useMotionValue(0.25);
  const [vis, setVis] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [lastEv, setLastEv] = useState<number | null>(null);
  const g = useGhost();
  const p = useParticles();
  const W = 262,
    H = 170;
  const G = useMemo(() => geo(R_DATA, W, H), []);
  const vel = useVelocity(t);
  const sv = useSpring(vel, { stiffness: 300, damping: 30 });
  // скорость скраба = наклон и размытие графика: «перемотка ощущается»
  const skew = useTransform(sv, (v) => Math.max(-14, Math.min(14, v * -6)));
  const blur = useTransform(
    sv,
    (v) => `blur(${Math.min(3, Math.abs(v) * 1.2)}px)`,
  );
  const playCtl = useRef<ReturnType<typeof animate> | null>(null);
  const passed = useRef(new Set<number>());

  useMotionValueEvent(t, "change", (v) => {
    const n = Math.max(
      1,
      Math.min(R_DATA.length, Math.round(v * R_DATA.length)),
    );
    setVis((old) => {
      if (n !== old) {
        EVENTS.forEach((e, k) => {
          if (n > e.i && !passed.current.has(k)) {
            passed.current.add(k);
            setLastEv(k);
            sfx.pop(k * 4);
            p.burst({
              x: 18 + G.x(e.i),
              y: 110,
              count: 18,
              colors: [e.c, "#fff"],
              speed: [80, 220],
            });
          }
          if (n <= e.i && passed.current.has(k)) passed.current.delete(k);
        });
      }
      return n;
    });
  });

  const togglePlay = () => {
    if (playing) {
      playCtl.current?.stop();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    sfx.tap();
    if (t.get() > 0.98) t.set(0.05);
    playCtl.current = animate(t, 1, {
      duration: (1 - t.get()) * 5,
      ease: "linear",
      onComplete: () => setPlaying(false),
    });
  };

  useScript(run, async (wait) => {
    playCtl.current?.stop();
    setPlaying(false);
    passed.current.clear();
    setLastEv(null);
    t.set(0.1);
    await wait(500);
    cue();
    g.show(18 + 0.1 * 262, 474);
    g.press(true);
    await Promise.all([
      g.move(18 + 0.55 * 262, 474, 0.9),
      animate(t, 0.55, { duration: 0.9, ease: EASE.camera }),
    ]);
    await wait(250);
    // резкий рывок назад — видно наклон от скорости
    await Promise.all([
      g.move(18 + 0.2 * 262, 474, 0.25),
      animate(t, 0.2, { duration: 0.25 }),
    ]);
    await wait(200);
    await Promise.all([
      g.move(18 + 0.9 * 262, 474, 0.4),
      animate(t, 0.9, { duration: 0.4, ease: EASE.outExpo }),
    ]);
    g.press(false);
    await wait(300);
    g.hide();
  });

  const last = R_DATA[vis - 1];
  const priceY = G.y(last.c);
  const change = ((last.c - R_DATA[0].o) / R_DATA[0].o) * 100;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#4cc3ff" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-bold">
            Реплей · BTC/USDT
          </div>
          <div className="text-[10px] text-white/45">
            Свеча {vis} из {R_DATA.length}
          </div>
        </div>
        <div
          className={`font-mono text-sm font-bold ${change >= 0 ? "text-bull" : "text-bear"}`}
        >
          <Roll value={`${change >= 0 ? "+" : ""}${change.toFixed(1)}%`} />
        </div>
      </div>
      {/* event card */}
      <div className="absolute inset-x-4 top-[84px] h-12">
        <AnimatePresence mode="popLayout">
          {lastEv !== null && (
            <motion.div
              key={lastEv}
              initial={{ x: 120, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -120, opacity: 0, scale: 0.9 }}
              transition={SPRING.panel}
              className="glass flex h-12 items-center gap-2.5 rounded-xl px-3"
              style={{ borderColor: `${EVENTS[lastEv].c}55` }}
            >
              <span style={{ color: EVENTS[lastEv].c }}>
                {(() => {
                  const Ic = EVENTS[lastEv].icon;
                  return <Ic size={16} />;
                })()}
              </span>
              <span className="text-[11px] font-bold">{EVENTS[lastEv].t}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* chart */}
      <div className="glass absolute inset-x-2 top-[146px] h-[200px] overflow-hidden rounded-2xl">
        <motion.svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute left-4 top-4 h-[170px] w-[262px] overflow-visible"
          style={{ skewX: skew, filter: blur }}
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="#ffffff0d"
            />
          ))}
          {R_DATA.map((d, i) => {
            if (i >= vis) return null;
            const col = up(d) ? "#3ddc84" : "#ff4d5e";
            const top = G.y(Math.max(d.o, d.c));
            const bh = Math.max(2, Math.abs(G.y(d.o) - G.y(d.c)));
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              >
                <line
                  x1={G.x(i)}
                  x2={G.x(i)}
                  y1={G.y(d.h)}
                  y2={G.y(d.l)}
                  stroke={col}
                  strokeWidth="1.2"
                />
                <rect
                  x={G.x(i) - G.cw * 0.32}
                  y={top}
                  width={G.cw * 0.64}
                  height={bh}
                  rx="1"
                  fill={col}
                />
              </motion.g>
            );
          })}
          {EVENTS.map((e, k) => {
            const on = vis > e.i;
            return (
              <motion.g
                key={k}
                initial={false}
                animate={on ? { opacity: 1, y: 0 } : { opacity: 0.25, y: -8 }}
                transition={SPRING.reward}
              >
                <line
                  x1={G.x(e.i)}
                  x2={G.x(e.i)}
                  y1="0"
                  y2={H}
                  stroke={e.c}
                  strokeDasharray="2 4"
                  strokeOpacity={on ? 0.6 : 0.2}
                />
                <circle
                  cx={G.x(e.i)}
                  cy="6"
                  r="5"
                  fill={on ? e.c : "#0c1428"}
                  stroke={e.c}
                  strokeWidth="1.5"
                />
              </motion.g>
            );
          })}
          <motion.g
            animate={{ y: priceY }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          >
            <line
              x1={G.x(vis - 1)}
              x2={W}
              y1="0"
              y2="0"
              stroke="#ffffff55"
              strokeDasharray="3 3"
            />
          </motion.g>
        </motion.svg>
        <motion.div
          className="absolute right-1 rounded bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-black"
          animate={{ top: 16 + priceY - 8 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        >
          {(last.c * 1000).toFixed(0)}
        </motion.div>
      </div>
      {/* controls */}
      <div className="absolute inset-x-4 top-[362px] flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={togglePlay}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky text-[#04121a] shadow-[0_0_16px_#4cc3ff]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={playing ? "p" : "s"}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              {playing ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="5" y="4" width="5" height="16" rx="1" />
                  <rect x="14" y="4" width="5" height="16" rx="1" />
                </svg>
              ) : (
                <I.play size={14} />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <div className="flex-1 text-[10px] text-white/50">
          Тяни ползунок — перемотка. Резкий рывок наклоняет график.
        </div>
      </div>
      <div className="absolute inset-x-[18px] top-[460px]">
        <Slider
          mv={t}
          color="#4cc3ff"
          format={(v) => `${Math.max(1, Math.round(v * 40))} / 40`}
          onStart={() => {
            playCtl.current?.stop();
            setPlaying(false);
          }}
        />
        <div className="relative mt-1 h-3">
          {EVENTS.map((e, k) => (
            <div
              key={k}
              className="absolute top-0 h-2 w-2 -ml-1 rounded-full"
              style={{
                left: `${((e.i + 1) / 40) * 100}%`,
                background: e.c,
                boxShadow: `0 0 6px ${e.c}`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-6 grid grid-cols-3 gap-2">
        {EVENTS.map((e, k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.94 }}
            onClick={() =>
              animate(t, (e.i + 1.5) / 40, { duration: 0.6, ease: EASE.camera })
            }
            className="rounded-xl border px-1 py-1.5 text-[9px] font-bold"
            animate={{
              borderColor: vis > e.i ? e.c : "#ffffff1a",
              background: vis > e.i ? `${e.c}1a` : "#ffffff05",
            }}
          >
            к событию {k + 1}
          </motion.button>
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   36 · TIMEFRAME MORPH — свечи физически сливаются в старший ТФ
   ================================================================ */
const T_DATA = genCandles(48, 73, 0.06);
const TF = [
  { n: "5м", f: 1 },
  { n: "15м", f: 3 },
  { n: "1ч", f: 6 },
  { n: "4ч", f: 12 },
];

function aggregate(data: Candle[], f: number) {
  const out: Candle[] = [];
  for (let i = 0; i < data.length; i += f) {
    const g = data.slice(i, i + f);
    out.push({
      o: g[0].o,
      c: g[g.length - 1].c,
      h: Math.max(...g.map((x) => x.h)),
      l: Math.min(...g.map((x) => x.l)),
    });
  }
  return out;
}

export function TimeframeMorph({ run, cue }: SceneProps) {
  const [tf, setTf] = useState(0);
  const g = useGhost();
  const W = 262,
    H = 190;
  const f = TF[tf].f;
  const agg = useMemo(() => aggregate(T_DATA, f), [f]);
  const G = useMemo(() => geo(T_DATA, W, H), []);
  const aw = W / agg.length;
  const vols = useMemo(
    () =>
      T_DATA.map(
        (_, i) =>
          0.25 + Math.abs(Math.sin(i * 1.3) * 0.6) + (i % 7 === 0 ? 0.3 : 0),
      ),
    [],
  );

  const change = (k: number) => {
    if (k === tf) return;
    setTf(k);
    sfx.whoosh(0.3);
  };

  useScript(run, async (wait) => {
    setTf(0);
    await wait(600);
    cue();
    const seg = [48, 112, 176, 240];
    g.show(seg[0], 108);
    for (const k of [1, 2, 3, 0]) {
      await g.move(seg[k], 108, 0.4);
      g.press(true);
      await wait(100);
      g.press(false);
      change(k);
      await wait(1100);
    }
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#4cc3ff" />
      <div className="absolute inset-x-4 top-11">
        <div className="font-display text-sm font-bold">Таймфрейм</div>
        <div className="text-[10px] text-white/45">
          <Roll value={T_DATA.length} /> свечей 5м →{" "}
          <Roll value={agg.length} color="#4cc3ff" /> свечей {TF[tf].n}
        </div>
      </div>
      <div className="absolute inset-x-4 top-[92px]">
        <Segmented
          options={TF.map((x) => x.n)}
          value={tf}
          onChange={change}
          color="#4cc3ff"
        />
      </div>
      <div className="glass absolute inset-x-2 top-[146px] h-[290px] overflow-hidden rounded-2xl">
        <svg
          viewBox={`0 0 ${W} ${H + 70}`}
          className="absolute left-4 top-4 h-[260px] w-[262px] overflow-visible"
        >
          {/* каждая базовая свеча анимируется в геометрию своей агрегированной группы */}
          {T_DATA.map((_, i) => {
            const gi = Math.floor(i / f);
            const a = agg[gi];
            const col = up(a) ? "#3ddc84" : "#ff4d5e";
            const cx = gi * aw + aw / 2;
            const top = G.y(Math.max(a.o, a.c));
            const bh = Math.max(2, Math.abs(G.y(a.o) - G.y(a.c)));
            const bw = Math.min(aw * 0.7, 18);
            const delay = gi * 0.02 + (i % f) * 0.008;
            return (
              <g key={i}>
                <motion.line
                  initial={false}
                  animate={{
                    x1: cx,
                    x2: cx,
                    y1: G.y(a.h),
                    y2: G.y(a.l),
                    stroke: col,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    delay,
                  }}
                  strokeWidth={f > 3 ? 1.8 : 1.2}
                />
                <motion.rect
                  initial={false}
                  animate={{
                    x: cx - bw / 2,
                    y: top,
                    width: bw,
                    height: bh,
                    fill: col,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    delay,
                  }}
                  rx="1.5"
                />
              </g>
            );
          })}
          {/* объём: столбики тоже сливаются, высота = сумма группы */}
          {T_DATA.map((_, i) => {
            const gi = Math.floor(i / f);
            const sum =
              vols.slice(gi * f, gi * f + f).reduce((s, v) => s + v, 0) / f;
            const bw = Math.min(aw * 0.7, 18);
            const hh = sum * 50;
            return (
              <motion.rect
                key={`v${i}`}
                initial={false}
                animate={{
                  x: gi * aw + aw / 2 - bw / 2,
                  y: H + 60 - hh,
                  width: bw,
                  height: hh,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 24,
                  delay: gi * 0.02,
                }}
                fill="#4cc3ff"
                fillOpacity="0.35"
                rx="1"
              />
            );
          })}
          <line x1="0" x2={W} y1={H + 60} y2={H + 60} stroke="#ffffff1a" />
        </svg>
      </div>
      <div className="absolute inset-x-4 top-[450px] grid grid-cols-2 gap-2">
        {[
          { l: "Шум", v: [92, 64, 38, 18][tf], c: "#ff4d5e" },
          { l: "Ясность тренда", v: [22, 48, 71, 88][tf], c: "#3ddc84" },
        ].map((m) => (
          <div key={m.l} className="glass rounded-xl p-2.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-white/50">{m.l}</span>
              <Roll value={m.v} color={m.c} />
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${m.v}%` }}
                transition={SPRING.panel}
                style={{ background: m.c }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-6 text-center text-[10px] text-white/40">
        Старший таймфрейм убирает шум: свечи сливаются, а не перерисовываются
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   37 · INDICATOR LAYERS — тумблеры проявляют слои анализа
   ================================================================ */
const L_DATA = genCandles(30, 88, 0.12);
const LAYERS = [
  { k: "ma", n: "Скользящая MA-7", c: "#ffc34d" },
  { k: "lv", n: "Уровни S/R", c: "#4cc3ff" },
  { k: "vol", n: "Объём", c: "#9b7bff" },
  { k: "sig", n: "Сигналы входа", c: "#3ddc84" },
];

export function IndicatorLayers({ run, cue }: SceneProps) {
  const [on, setOn] = useState<Record<string, boolean>>({
    ma: false,
    lv: false,
    vol: false,
    sig: false,
  });
  const [master, setMaster] = useState(false);
  const g = useGhost();
  const p = useParticles();
  const W = 262,
    H = 150;
  const G = useMemo(() => geo(L_DATA, W, H), []);
  const ma = useMemo(() => {
    const pts: string[] = [];
    L_DATA.forEach((_, i) => {
      if (i < 6) return;
      const avg = L_DATA.slice(i - 6, i + 1).reduce((s, d) => s + d.c, 0) / 7;
      pts.push(
        `${pts.length ? "L" : "M"}${G.x(i).toFixed(1)},${G.y(avg).toFixed(1)}`,
      );
    });
    return pts.join(" ");
  }, [G]);
  const lows = Math.min(...L_DATA.map((d) => d.l));
  const highs = Math.max(...L_DATA.map((d) => d.h));
  const levels = [
    lows + (highs - lows) * 0.22,
    lows + (highs - lows) * 0.62,
    lows + (highs - lows) * 0.9,
  ];
  const signals = [8, 17, 25];
  const count = Object.values(on).filter(Boolean).length;

  const set = (k: string, v: boolean) => {
    setOn((o) => ({ ...o, [k]: v }));
    if (v) {
      const idx = LAYERS.findIndex((l) => l.k === k);
      p.burst({
        x: 260,
        y: 356 + idx * 42,
        count: 10,
        colors: [LAYERS[idx].c, "#fff"],
        speed: [60, 160],
      });
    }
  };
  const setAll = (v: boolean) => {
    setMaster(v);
    LAYERS.forEach((l, i) =>
      window.setTimeout(() => {
        set(l.k, v);
        sfx.snap();
      }, i * 110),
    );
  };

  useScript(run, async (wait) => {
    setOn({ ma: false, lv: false, vol: false, sig: false });
    setMaster(false);
    await wait(600);
    cue();
    g.show(262, 356);
    for (let i = 0; i < 4; i++) {
      await g.move(262, 356 + i * 42, 0.35);
      g.press(true);
      await wait(90);
      g.press(false);
      set(LAYERS[i].k, true);
      sfx.snap();
      await wait(650);
    }
    await g.move(262, 540, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    setAll(false);
    await wait(900);
    setAll(true);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Слои анализа</div>
        <div className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">
          <Roll value={count} color="#ffc34d" />
          /4
        </div>
      </div>
      <div className="glass absolute inset-x-2 top-[80px] h-[250px] overflow-hidden rounded-2xl">
        <svg
          viewBox={`0 0 ${W} ${H + 70}`}
          className="absolute left-4 top-4 h-[220px] w-[262px] overflow-visible"
        >
          {/* volume */}
          {L_DATA.map((d, i) => (
            <motion.rect
              key={`v${i}`}
              x={G.x(i) - G.cw * 0.3}
              width={G.cw * 0.6}
              fill={up(d) ? "#3ddc84" : "#ff4d5e"}
              fillOpacity="0.4"
              initial={false}
              animate={
                on.vol
                  ? {
                      y: H + 64 - (12 + ((i * 37) % 40)),
                      height: 12 + ((i * 37) % 40),
                    }
                  : { y: H + 64, height: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: on.vol ? i * 0.015 : (L_DATA.length - i) * 0.008,
              }}
            />
          ))}
          {/* levels */}
          {levels.map((lv, i) => (
            <motion.g
              key={`l${i}`}
              initial={false}
              animate={{ opacity: on.lv ? 1 : 0 }}
            >
              <motion.line
                x1="0"
                x2={W}
                y1={G.y(lv)}
                y2={G.y(lv)}
                stroke="#4cc3ff"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                initial={false}
                animate={{ pathLength: on.lv ? 1 : 0 }}
                transition={{
                  duration: 0.6,
                  delay: on.lv ? i * 0.12 : 0,
                  ease: EASE.outExpo,
                }}
              />
              <motion.rect
                x={W - 30}
                y={G.y(lv) - 7}
                width="30"
                height="14"
                rx="3"
                fill="#4cc3ff"
                initial={false}
                animate={{ scale: on.lv ? 1 : 0 }}
                transition={{
                  delay: on.lv ? 0.4 + i * 0.12 : 0,
                  ...SPRING.reward,
                }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              <text
                x={W - 15}
                y={G.y(lv) + 3}
                textAnchor="middle"
                fontSize="8"
                fontWeight="800"
                fill="#04121a"
              >
                {i === 0 ? "S" : i === 1 ? "S/R" : "R"}
              </text>
            </motion.g>
          ))}
          {/* candles */}
          {L_DATA.map((d, i) => {
            const col = up(d) ? "#3ddc84" : "#ff4d5e";
            const top = G.y(Math.max(d.o, d.c));
            const bh = Math.max(2, Math.abs(G.y(d.o) - G.y(d.c)));
            return (
              <g key={i} opacity={on.ma || on.lv ? 0.75 : 1}>
                <line
                  x1={G.x(i)}
                  x2={G.x(i)}
                  y1={G.y(d.h)}
                  y2={G.y(d.l)}
                  stroke={col}
                  strokeWidth="1.2"
                />
                <rect
                  x={G.x(i) - G.cw * 0.32}
                  y={top}
                  width={G.cw * 0.64}
                  height={bh}
                  rx="1"
                  fill={col}
                />
              </g>
            );
          })}
          {/* MA */}
          <motion.path
            d={ma}
            fill="none"
            stroke="#ffc34d"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: on.ma ? 1 : 0, opacity: on.ma ? 1 : 0 }}
            transition={{
              pathLength: { duration: 0.9, ease: EASE.camera },
              opacity: { duration: 0.2 },
            }}
            style={{ filter: "drop-shadow(0 0 4px #ffc34d)" }}
          />
          {/* signals */}
          {signals.map((si, k) => (
            <motion.g
              key={`s${k}`}
              initial={false}
              animate={
                on.sig
                  ? { scale: 1, opacity: 1, y: 0 }
                  : { scale: 0, opacity: 0, y: 10 }
              }
              transition={{ delay: on.sig ? k * 0.12 : 0, ...SPRING.reward }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <path
                d={`M${G.x(si)} ${G.y(L_DATA[si].l) + 6} l-6 10 h12 z`}
                fill="#3ddc84"
                style={{ filter: "drop-shadow(0 0 6px #3ddc84)" }}
              />
              <circle
                cx={G.x(si)}
                cy={G.y(L_DATA[si].l) + 24}
                r="7"
                fill="none"
                stroke="#3ddc84"
                strokeWidth="1.5"
              >
                {on.sig && (
                  <animate
                    attributeName="r"
                    values="5;11;5"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </motion.g>
          ))}
        </svg>
      </div>
      <div className="absolute inset-x-4 top-[340px] space-y-1.5">
        {LAYERS.map((l) => (
          <motion.div
            key={l.k}
            className="glass flex h-9 items-center gap-3 rounded-xl px-3"
            animate={{ borderColor: on[l.k] ? `${l.c}66` : "#ffffff14" }}
          >
            <motion.span
              className="h-2.5 w-2.5 rounded-full"
              animate={{
                background: on[l.k] ? l.c : "#ffffff22",
                boxShadow: on[l.k] ? `0 0 10px ${l.c}` : "0 0 0 #0000",
              }}
            />
            <span className="flex-1 text-[11px] font-bold">{l.n}</span>
            <Toggle
              on={on[l.k]}
              onChange={(v) => set(l.k, v)}
              color={l.c}
              size={0.8}
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[528px] flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
        <span className="text-[11px] font-bold text-white/70">
          Все слои · каскадом
        </span>
        <Toggle on={master} onChange={setAll} color="#ffc34d" size={0.8} />
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   91 · CANDLE ANATOMY — слайдер «разбирает» свечу на части
   ================================================================ */
export function CandleAnatomy({ run, cue }: SceneProps) {
  const ex = useMotionValue(0);
  const [bull, setBull] = useState(true);
  const g = useGhost();
  const gapUp = useTransform(ex, (v) => -v * 44);
  const gapDn = useTransform(ex, (v) => v * 44);
  const labOp = useTransform(ex, [0.25, 0.7], [0, 1]);
  const labX = useTransform(ex, [0, 1], [-20, 0]);
  const col = bull ? "#3ddc84" : "#ff4d5e";
  const topLab = bull ? "Close" : "Open";
  const botLab = bull ? "Open" : "Close";
  useScript(run, async (wait) => {
    ex.set(0);
    setBull(true);
    await wait(600);
    cue();
    g.show(24, 470);
    g.press(true);
    await Promise.all([
      g.move(24 + 252, 470, 1),
      animate(ex, 1, { duration: 1, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(500);
    await g.move(250, 538, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    setBull(false);
    sfx.snap();
    await wait(900);
    await g.move(24 + 252, 470, 0.4);
    g.press(true);
    await Promise.all([
      g.move(24, 470, 0.8),
      animate(ex, 0, { duration: 0.8, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });
  const rows: {
    lab: string;
    y: typeof gapUp | null;
    top: number;
    desc: string;
  }[] = [
    { lab: "High", y: gapUp, top: 90, desc: "максимум за период" },
    {
      lab: topLab,
      y: null,
      top: 150,
      desc: bull
        ? "цена закрытия выше открытия"
        : "цена открытия выше закрытия",
    },
    {
      lab: botLab,
      y: null,
      top: 250,
      desc: bull ? "откуда пошли покупатели" : "куда дожали продавцы",
    },
    { lab: "Low", y: gapDn, top: 330, desc: "минимум за период" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={col} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Анатомия свечи</div>
        <motion.span
          key={String(bull)}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="rounded-full px-2 py-0.5 text-[10px] font-black"
          style={{ background: `${col}26`, color: col }}
        >
          {bull ? "БЫЧЬЯ" : "МЕДВЕЖЬЯ"}
        </motion.span>
      </div>
      <div className="absolute left-[70px] top-0 h-full w-12">
        {/* верхняя тень */}
        <motion.div
          className="absolute left-1/2 top-[90px] h-[60px] w-1 -ml-0.5 rounded"
          style={{ y: gapUp, background: col }}
        />
        {/* тело */}
        <motion.div
          className="absolute left-0 top-[150px] h-[100px] w-12 rounded-md"
          animate={{ background: col, boxShadow: `0 0 24px ${col}88` }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          key={String(bull)}
          className="absolute left-1/2 top-[150px] -ml-1.5 h-[100px] w-3"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: bull ? "50% 100%" : "50% 0%" }}
          transition={{ duration: 0.5, ease: EASE.outExpo }}
        >
          <svg viewBox="0 0 12 100" className="h-full w-full">
            <path
              d={
                bull
                  ? "M6 96 V8 M1 14 L6 4 L11 14"
                  : "M6 4 V92 M1 86 L6 96 L11 86"
              }
              fill="none"
              stroke="#0c1428"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        {/* нижняя тень */}
        <motion.div
          className="absolute left-1/2 top-[250px] h-[80px] w-1 -ml-0.5 rounded"
          style={{ y: gapDn, background: col }}
        />
      </div>
      {rows.map((r) => (
        <motion.div
          key={r.lab + r.top}
          className="absolute left-[130px] right-4 flex items-center gap-2"
          style={{ top: r.top - 10, y: r.y ?? 0, opacity: labOp, x: labX }}
        >
          <div className="h-px w-6 bg-white/40" />
          <div>
            <div
              className="font-mono text-[11px] font-black"
              style={{
                color: r.lab === "High" || r.lab === "Low" ? "#ffffff" : col,
              }}
            >
              {r.lab}
            </div>
            <div className="text-[9px] text-white/50">{r.desc}</div>
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-x-6 top-[450px]">
        <Slider mv={ex} label="Разобрать свечу" color={col} />
      </div>
      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/70">
          Медвежья свеча
        </span>
        <Toggle on={!bull} onChange={(v) => setBull(!v)} color="#ff4d5e" />
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_CHART: Category = {
  id: "chart",
  n: "11",
  title: "Реплей графика",
  en: "Scrubber · Timeframe morph · Layers",
  color: "#4cc3ff",
  blurb:
    "График как игровой объект: перемотка слайдером с физикой скорости, свечи, которые сливаются при смене таймфрейма, и слои анализа на тумблерах.",
  scenes: [
    {
      id: "replay",
      n: "35",
      title: "Скраббер реплея",
      kind: "Time slider",
      lead: "Слайдер перематывает историю рынка: свечи вырастают под ползунком, ценник едет за последней ценой, события вспыхивают при пересечении и выезжают карточками. Скорость перемотки наклоняет и размывает график.",
      secrets: [
        "useVelocity(t) → useSpring → skewX и blur. Резкий рывок ползунка физически «кренит» график — перемотка ощущается телом.",
        "События срабатывают по пересечению в обе стороны: вперёд — вспышка и карточка, назад — событие снова «гаснет».",
        "Ценник и пунктир цены — пружина 500/34 по Y: ценник догоняет свечу, а не прыгает.",
        "Автоплей — тот же MotionValue с linear-анимацией. Касание слайдера останавливает её (onStart) — палец всегда главнее автомата.",
        "Кнопки «к событию» анимируют t кривой camera: навигация по истории тоже кинематографична.",
      ],
      tracks: [
        { label: "Скраб вперёд", start: 500, dur: 900, color: "#4cc3ff" },
        { label: "Событие 1-2", start: 800, dur: 700, color: "#ffc34d" },
        {
          label: "Рывок назад (skew)",
          start: 1650,
          dur: 250,
          color: "#ff4d5e",
        },
        { label: "Бросок вперёд", start: 2100, dur: 400, color: "#3ddc84" },
        { label: "Событие 3", start: 2350, dur: 500, color: "#ff4d5e" },
      ],
      total: 3200,
      ease: { bez: EASE.camera, label: "camera — прыжок к событию" },
      code: `const vel  = useVelocity(t);
const sv   = useSpring(vel, { stiffness: 300, damping: 30 });
const skew = useTransform(sv, v => clamp(v * -6, -14, 14));
const blur = useTransform(sv, v => \`blur(\${Math.min(3, Math.abs(v) * 1.2)}px)\`);
<motion.svg style={{ skewX: skew, filter: blur }} />

useMotionValueEvent(t, "change", v => {
  const n = Math.round(v * 40);
  EVENTS.forEach(e => { if (n > e.i && !passed.has(e)) fire(e); });
});`,
      C: ReplayScrubber,
      interactive: "Тяни ползунок, жми play",
    },
    {
      id: "tfmorph",
      n: "36",
      title: "Слияние таймфреймов",
      kind: "Data morph",
      lead: "Переключатель таймфрейма не перерисовывает график — каждая из 48 свечей анимируется в геометрию своей группы и физически сливается с соседями. Объём складывается так же, метрики шума и ясности пересчитываются.",
      secrets: [
        "48 SVG-элементов остаются в DOM всегда. Меняются только их целевые x/y/width/height — сливание получается само, без ручной интерполяции.",
        "Задержка = индекс группы × 20мс + позиция внутри группы × 8мс: свечи слипаются волной слева направо.",
        "Цвет тоже анимируется: свеча, бывшая красной, становится зелёной, если агрегат группы бычий.",
        "Числа «48 → 4 свечи» — Roll: каждая цифра прокручивается отдельно.",
        "Метрики «шум / ясность» — прямой смысл анимации: игрок видит, ЗАЧЕМ нужен старший таймфрейм.",
      ],
      tracks: [
        { label: "5м → 15м", start: 1000, dur: 700, color: "#4cc3ff" },
        { label: "15м → 1ч", start: 2600, dur: 700, color: "#9b7bff" },
        { label: "1ч → 4ч", start: 4200, dur: 700, color: "#ffc34d" },
        { label: "4ч → 5м (распад)", start: 5800, dur: 1100, color: "#3ddc84" },
      ],
      total: 7200,
      ease: { bez: EASE.outExpo, label: "≈ spring 260/26" },
      code: `{BASE.map((_, i) => {
  const gi = Math.floor(i / f);            // группа свечи
  const a = agg[gi];                       // OHLC группы
  return <motion.rect initial={false}
    animate={{ x: gi * aw + aw / 2 - bw / 2, y: y(max(a.o, a.c)),
               height: bodyH(a), fill: a.c >= a.o ? BULL : BEAR }}
    transition={{ type: "spring", stiffness: 260, damping: 26,
                  delay: gi * .02 + (i % f) * .008 }} />;
})}`,
      C: TimeframeMorph,
      interactive: "Переключай таймфрейм",
    },
    {
      id: "layers",
      n: "37",
      title: "Слои индикаторов",
      kind: "Toggle layers",
      lead: "Четыре тумблера проявляют слои анализа: MA рисуется линией, уровни прочерчиваются пунктиром с бейджами, объём вырастает столбиками, сигналы входа всплывают стрелками с пульсом. Мастер-тумблер включает всё каскадом.",
      secrets: [
        "Каждый слой — свой характер входа: линия (pathLength), уровни (pathLength + бейдж-пружина), объём (рост снизу), сигналы (pop). Разнообразие без хаоса.",
        "Выключение объёма идёт в обратном порядке (справа налево) — выход зеркален входу.",
        "Когда включены MA или уровни, свечи приглушаются до 75% — фокус переходит на аналитический слой.",
        "Тумблер делает squash (scaleX 1 → 1.35 → 1) при переключении — физический «щелчок».",
        "Мастер-тумблер каскадит с шагом 110мс, каждый — со своим щелчком. Ритм = ощущение механизма.",
      ],
      tracks: [
        { label: "MA draw", start: 1000, dur: 900, color: "#ffc34d" },
        { label: "Уровни", start: 1650, dur: 900, color: "#4cc3ff" },
        { label: "Объём", start: 2300, dur: 700, color: "#9b7bff" },
        { label: "Сигналы", start: 2950, dur: 600, color: "#3ddc84" },
        { label: "Мастер off/on", start: 4200, dur: 1800, color: "#ffffff" },
      ],
      total: 6200,
      ease: { bez: EASE.camera, label: "camera — рисование MA" },
      code: `<motion.path d={ma} initial={false}
  animate={{ pathLength: on.ma ? 1 : 0 }}
  transition={{ duration: .9, ease: EASE.camera }} />

<motion.rect animate={on.vol
  ? { y: base - h, height: h }
  : { y: base, height: 0 }}
  transition={{ delay: on.vol ? i * .015 : (N - i) * .008 }} />  // выход зеркален`,
      C: IndicatorLayers,
      interactive: "Щёлкай тумблеры",
    },
    {
      id: "anatomy",
      n: "91",
      title: "Анатомия свечи",
      kind: "Exploded view",
      lead: "Слайдер «разбирает» свечу: верхняя и нижняя тени отъезжают от тела, выезжают подписи High / Open / Close / Low с пояснениями. Тумблер переключает бычью и медвежью свечу — тело перекрашивается, стрелка направления перерисовывается, Open и Close меняются местами.",
      secrets: [
        "Exploded view — приём технических иллюстраций: части объекта разъезжаются по одной оси, связь между ними остаётся видна.",
        "Подписи появляются только после 25% разбора и выезжают слева — сначала форма, потом названия.",
        "Стрелка направления рисуется scaleY от нужного конца (низ для бычьей, верх для медвежьей) — направление цены в самой анимации.",
        "При смене типа Open и Close меняются местами — главная путаница новичков разобрана визуально.",
        "Цвет всей сцены (фон, свечение, бейдж) следует за типом свечи — контекст меняется целиком.",
      ],
      tracks: [
        { label: "Разбор", start: 600, dur: 1000, color: "#3ddc84" },
        { label: "Подписи", start: 850, dur: 450, color: "#ffffff" },
        { label: "→ Медвежья", start: 2600, dur: 500, color: "#ff4d5e" },
        { label: "Сборка", start: 3900, dur: 800, color: "#ff4d5e" },
      ],
      total: 4900,
      ease: { bez: EASE.camera, label: "camera — разбор" },
      code: `const gapUp = useTransform(ex, v => -v * 44);
const gapDn = useTransform(ex, v =>  v * 44);
const labOp = useTransform(ex, [.25, .7], [0, 1]);
<motion.div style={{ y: gapUp }} />   {/* верхняя тень */}
<motion.div style={{ y: gapDn }} />   {/* нижняя тень */}`,
      C: CandleAnatomy,
      interactive: "Тяни слайдер, переключай тип",
    },
  ],
};
