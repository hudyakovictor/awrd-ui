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
import { Roll, Slider, hexMix, useGhost } from "../components/controls";
import { genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ================================================================
   38 · LEVERAGE HEAT — чем выше плечо, тем горячее и нервнее экран
   ================================================================ */
const LEV = [1, 2, 3, 5, 10, 20, 50, 100];
const WARN = [
  { at: 10, t: "Волатильность съест стоп", c: "#ffc34d" },
  { at: 20, t: "Ликвидация в 5% хода", c: "#ff8a3d" },
  { at: 50, t: "Один фитиль — и всё", c: "#ff4d5e" },
  { at: 100, t: "Это казино, а не трейдинг", c: "#ff2d4a" },
];
const CRACK = [
  "M150 0 L140 60 L160 110 L130 170",
  "M300 90 L240 120 L220 180 L170 200",
  "M0 210 L60 190 L90 240 L140 250",
  "M160 110 L200 130",
];

export function LeverageHeat({ run, cue }: SceneProps) {
  const t = useMotionValue(0);
  const [lev, setLev] = useState(1);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const jx = useMotionValue(0);
  const jy = useMotionValue(0);
  const g = useGhost();
  const p = useParticles();
  const levRef = useRef(1);
  const heat = useTransform(t, (v) => hexMix("#0a1122", "#3a0610", v));
  const glow = useTransform(
    t,
    (v) => `inset 0 0 ${v * 140}px ${v * 30}px rgba(255,45,74,${v * 0.7})`,
  );
  const liqY = useTransform(t, (v) => 60 + (1 - Math.pow(v, 0.6)) * 110);
  const zoneH = useTransform(liqY, (y) => y - 58);

  useMotionValueEvent(t, "change", (v) => {
    const l = LEV[Math.round(v * (LEV.length - 1))];
    if (l !== levRef.current) {
      const upward = l > levRef.current;
      levRef.current = l;
      setLev(l);
      if (upward) {
        const w = WARN.find((x) => x.at === l);
        if (w) {
          l >= 50 ? sfx.heartbeat(l / 50) : sfx.error();
          if (root)
            animate(root, shakeKeys(Math.min(1, l / 100 + 0.3), 10, 8, 1.2), {
              duration: 0.35,
            });
          p.burst({
            x: 150,
            y: 200,
            count: 10 + l / 3,
            colors: [w.c, "#fff"],
            speed: [80, 260],
          });
        }
      }
    }
  });

  // Постоянный тремор: амплитуда растёт с плечом (только после 10x)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const a =
        levRef.current >= 10
          ? Math.min(4, (levRef.current / 100) * 4 + 0.5)
          : 0;
      jx.set((Math.random() - 0.5) * a);
      jy.set((Math.random() - 0.5) * a);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [jx, jy]);

  useScript(run, async (wait) => {
    t.set(0);
    await wait(500);
    cue();
    g.show(22, 486);
    g.press(true);
    for (let k = 1; k < LEV.length; k++) {
      const v = k / (LEV.length - 1);
      await Promise.all([
        g.move(22 + v * 256, 486, 0.35),
        animate(t, v, { duration: 0.35, ease: EASE.outExpo }),
      ]);
      await wait(k >= 5 ? 450 : 200);
    }
    await wait(500);
    await Promise.all([
      g.move(22 + (3 / 7) * 256, 486, 0.6),
      animate(t, 3 / 7, { duration: 0.6, ease: EASE.camera }),
    ]);
    g.press(false);
    sfx.success();
    g.hide();
  });

  const warns = WARN.filter((w) => lev >= w.at);
  const liqPct = (100 / lev).toFixed(lev >= 20 ? 1 : 0);
  return (
    <motion.div
      ref={setRoot}
      className="absolute inset-0 overflow-hidden"
      style={{ background: heat }}
    >
      <SceneBg tint={lev >= 20 ? "#ff4d5e" : "#2ee6c5"} />
      <motion.div
        className="absolute inset-0"
        style={{ background: heat, opacity: 0.7 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ boxShadow: glow }}
      />
      <motion.div className="absolute inset-0" style={{ x: jx, y: jy }}>
        <div className="absolute inset-x-4 top-11 flex items-center justify-between">
          <div className="font-display text-sm font-bold">Кредитное плечо</div>
          <div className="text-[10px] text-white/50">депозит 1 000 USDT</div>
        </div>
        <div className="absolute inset-x-0 top-[74px] text-center">
          <motion.div
            key={lev}
            initial={{ scale: 1.6, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="font-display text-6xl font-black"
            style={{
              color: lev >= 50 ? "#ff4d5e" : lev >= 10 ? "#ffc34d" : "#2ee6c5",
              textShadow: `0 0 30px ${lev >= 50 ? "#ff4d5e" : lev >= 10 ? "#ffc34d" : "#2ee6c5"}`,
            }}
          >
            x{lev}
          </motion.div>
          <div className="text-[11px] text-white/55">
            позиция{" "}
            <Roll value={(lev * 1000).toLocaleString("ru")} color="#fff" /> USDT
          </div>
        </div>
        {/* mini chart with liquidation line */}
        <div className="glass absolute inset-x-3 top-[170px] h-[190px] overflow-hidden rounded-2xl">
          <svg viewBox="0 0 270 190" className="absolute inset-0 h-full w-full">
            {genCandles(22, 12, 0.02).map((d, i) => {
              const y0 = 60,
                s = 3;
              const col = d.c >= d.o ? "#3ddc84" : "#ff4d5e";
              return (
                <g key={i} opacity="0.8">
                  <line
                    x1={10 + i * 11.5}
                    x2={10 + i * 11.5}
                    y1={y0 + (50 - d.h) * s}
                    y2={y0 + (50 - d.l) * s}
                    stroke={col}
                  />
                  <rect
                    x={6 + i * 11.5}
                    y={y0 + (50 - Math.max(d.o, d.c)) * s}
                    width="8"
                    height={Math.max(2, Math.abs(d.o - d.c) * s)}
                    fill={col}
                    rx="1"
                  />
                </g>
              );
            })}
            <line
              x1="0"
              x2="270"
              y1="58"
              y2="58"
              stroke="#ffffff"
              strokeDasharray="4 3"
              strokeOpacity="0.6"
            />
            <text x="6" y="52" fontSize="9" fontWeight="700" fill="#ffffffaa">
              вход
            </text>
            <motion.rect
              x="0"
              y="58"
              width="270"
              style={{ height: zoneH }}
              fill="url(#liqz)"
            />
            <defs>
              <linearGradient id="liqz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff4d5e" stopOpacity="0" />
                <stop offset="1" stopColor="#ff4d5e" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <motion.g style={{ y: liqY }}>
              <line
                x1="0"
                x2="270"
                y1="0"
                y2="0"
                stroke="#ff4d5e"
                strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 6px #ff4d5e)" }}
              />
              <rect
                x="190"
                y="-9"
                width="76"
                height="18"
                rx="4"
                fill="#ff4d5e"
              />
              <text
                x="228"
                y="4"
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#fff"
              >
                ЛИКВ −{liqPct}%
              </text>
            </motion.g>
          </svg>
          {lev >= 100 && (
            <svg
              viewBox="0 0 300 260"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              {CRACK.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: i * 0.05,
                    ease: EASE.snap,
                  }}
                  style={{ filter: "drop-shadow(0 0 3px #fff)" }}
                />
              ))}
            </svg>
          )}
        </div>
        {/* warnings */}
        <div className="absolute inset-x-4 top-[370px] h-[80px] space-y-1">
          <AnimatePresence initial={false}>
            {warns.slice(-3).map((w) => (
              <motion.div
                key={w.at}
                layout
                initial={{ scale: 1.8, opacity: 0, rotate: -4 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ x: 80, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE.snap }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] font-bold"
                style={{
                  background: `${w.c}26`,
                  color: w.c,
                  border: `1px solid ${w.c}66`,
                }}
              >
                <I.warn size={12} /> x{w.at}: {w.t}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      <div className="absolute inset-x-[22px] top-[470px] z-30">
        <Slider
          mv={t}
          steps={LEV.length - 1}
          color={lev >= 50 ? "#ff4d5e" : lev >= 10 ? "#ffc34d" : "#2ee6c5"}
          gradient="linear-gradient(90deg,#2ee6c5,#ffc34d 55%,#ff4d5e)"
          format={(v) => `x${LEV[Math.round(v * (LEV.length - 1))]}`}
        />
        <div className="mt-1 flex justify-between text-[9px] font-bold text-white/35">
          {LEV.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-6 z-30 grid grid-cols-2 gap-2">
        <div className="glass rounded-xl p-2 text-center">
          <div className="text-[9px] text-white/45">До ликвидации</div>
          <div
            className="font-display text-base font-black"
            style={{ color: lev >= 20 ? "#ff4d5e" : "#fff" }}
          >
            <Roll value={`${liqPct}%`} />
          </div>
        </div>
        <div className="glass rounded-xl p-2 text-center">
          <div className="text-[9px] text-white/45">Шанс выжить неделю</div>
          <div
            className="font-display text-base font-black"
            style={{ color: lev >= 20 ? "#ff4d5e" : "#3ddc84" }}
          >
            <Roll
              value={`${Math.max(2, Math.round(100 - Math.log2(lev) * 14))}%`}
            />
          </div>
        </div>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </motion.div>
  );
}

/* ================================================================
   39 · STOP & TAKE DRAG — перетаскиваемые линии на графике
   ================================================================ */
const CH_TOP = 96,
  CH_H = 300,
  ENTRY = 250;
const PRICE_AT = (y: number) => 64000 + (ENTRY - y) * 12;

function DragLine({
  mv,
  color,
  label,
  min,
  max,
  onRelease,
  onGrab,
}: {
  mv: ReturnType<typeof useMotionValue<number>>;
  color: string;
  label: string;
  min: number;
  max: number;
  onRelease: () => void;
  onGrab: () => void;
}) {
  const base = useRef(0);
  const [drag, setDrag] = useState(false);
  const price = useTransform(mv, (y) => PRICE_AT(y).toLocaleString("ru"));
  return (
    <motion.div
      className="absolute inset-x-0 z-20 -mt-4 h-8 cursor-ns-resize touch-none"
      style={{ y: mv }}
      onPanStart={() => {
        base.current = mv.get();
        setDrag(true);
        onGrab();
      }}
      onPan={(_, i) =>
        mv.set(Math.max(min, Math.min(max, base.current + i.offset.y)))
      }
      onPanEnd={() => {
        setDrag(false);
        onRelease();
      }}
    >
      <motion.div
        className="absolute inset-x-0 top-1/2 h-0.5"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        animate={{ scaleY: drag ? 2.5 : 1 }}
      />
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[9px] font-black text-black"
        style={{ background: color }}
        animate={{ scale: drag ? 1.15 : 1 }}
      >
        {label}
      </motion.div>
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold"
        style={{ borderColor: color, color, background: "#0c1428" }}
      >
        <motion.span>{price}</motion.span>
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-5 w-10 -ml-5 -mt-2.5 items-center justify-center gap-0.5 rounded-full"
        style={{ background: color }}
        animate={{ scale: drag ? 1.2 : 1 }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-0.5 rounded bg-black/50" />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function StopTakeDrag({ run, cue }: SceneProps) {
  const stop = useMotionValue(ENTRY + 40);
  const take = useMotionValue(ENTRY - 70);
  const [state, setState] = useState<{
    risk: number;
    rr: number;
    tight: boolean;
    wide: boolean;
  }>({ risk: 1.5, rr: 1.75, tight: false, wide: false });
  const [pinned, setPinned] = useState(0);
  const [wobble, setWobble] = useState(0);
  const g = useGhost();
  const p = useParticles();
  const data = useMemo(() => genCandles(26, 91, 0.05), []);
  const stopZone = useTransform(stop, (y) => y - ENTRY);
  const takeZone = useTransform(take, (y) => ENTRY - y);
  const takeTop = useTransform(take, (y) => y);

  const recalc = () => {
    const riskPts = stop.get() - ENTRY;
    const rewPts = ENTRY - take.get();
    const risk = (riskPts * 12) / 640;
    setState({
      risk,
      rr: rewPts / Math.max(1, riskPts),
      tight: riskPts < 14,
      wide: risk > 2.5,
    });
  };
  useMotionValueEvent(stop, "change", recalc);
  useMotionValueEvent(take, "change", recalc);

  const release = () => {
    recalc();
    const riskPts = stop.get() - ENTRY;
    if (riskPts < 14) {
      sfx.error();
      setWobble((w) => w + 1);
    } else {
      sfx.snap();
      setPinned((x) => x + 1);
      p.burst({
        x: 150,
        y: CH_TOP + stop.get(),
        count: 14,
        colors: ["#ff4d5e", "#fff"],
        speed: [60, 180],
      });
    }
  };

  useScript(run, async (wait) => {
    stop.set(ENTRY + 40);
    take.set(ENTRY - 70);
    await wait(500);
    cue();
    // стоп слишком близко
    g.show(150, CH_TOP + stop.get());
    g.press(true);
    await Promise.all([
      g.move(150, CH_TOP + ENTRY + 8, 0.6),
      animate(stop, ENTRY + 8, { duration: 0.6, ease: EASE.camera }),
    ]);
    g.press(false);
    release();
    await wait(900);
    // исправляем
    g.press(true);
    await Promise.all([
      g.move(150, CH_TOP + ENTRY + 36, 0.5),
      animate(stop, ENTRY + 36, { duration: 0.5, ease: EASE.camera }),
    ]);
    g.press(false);
    release();
    await wait(500);
    // тейк выше — RR > 3
    await g.move(150, CH_TOP + take.get(), 0.4);
    g.press(true);
    await Promise.all([
      g.move(150, CH_TOP + ENTRY - 120, 0.6),
      animate(take, ENTRY - 120, { duration: 0.6, ease: EASE.camera }),
    ]);
    g.press(false);
    sfx.success();
    g.hide();
  });

  const good = !state.tight && !state.wide && state.rr >= 2;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={good ? "#3ddc84" : "#ff4d5e"} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Стоп и тейк</div>
        <div className="text-[10px] text-white/50">перетаскивай линии</div>
      </div>
      <div
        className="glass absolute inset-x-2 overflow-hidden rounded-2xl"
        style={{ top: CH_TOP, height: CH_H + 40 }}
      >
        <svg viewBox="0 0 280 340" className="absolute inset-0 h-full w-full">
          {data.map((d, i) => {
            const y = (v: number) => ENTRY + (50 - v) * 4 - 20;
            const col = d.c >= d.o ? "#3ddc84" : "#ff4d5e";
            return (
              <g key={i} opacity="0.7">
                <line
                  x1={8 + i * 10.4}
                  x2={8 + i * 10.4}
                  y1={y(d.h)}
                  y2={y(d.l)}
                  stroke={col}
                />
                <rect
                  x={4.5 + i * 10.4}
                  y={y(Math.max(d.o, d.c))}
                  width="7"
                  height={Math.max(2, Math.abs(d.o - d.c) * 4)}
                  fill={col}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
        <motion.div
          className="absolute inset-x-0 bg-gradient-to-b from-bear/40 to-bear/5"
          style={{ top: ENTRY, height: stopZone }}
        />
        <motion.div
          className="absolute inset-x-0 bg-gradient-to-t from-bull/40 to-bull/5"
          style={{ top: takeTop, height: takeZone }}
        />
        <div
          className="absolute inset-x-0 h-px bg-white/70"
          style={{ top: ENTRY }}
        >
          <span className="absolute left-2 -top-2.5 rounded bg-white px-1 text-[8px] font-black text-black">
            ВХОД
          </span>
        </div>
        <motion.div
          key={wobble}
          className="absolute inset-0"
          animate={wobble ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <DragLine
            mv={stop}
            color="#ff4d5e"
            label="СТОП"
            min={ENTRY + 4}
            max={CH_H + 20}
            onRelease={release}
            onGrab={() => sfx.tap()}
          />
        </motion.div>
        <DragLine
          mv={take}
          color="#3ddc84"
          label="ТЕЙК"
          min={20}
          max={ENTRY - 10}
          onRelease={() => {
            recalc();
            sfx.snap();
          }}
          onGrab={() => sfx.tap()}
        />
        <AnimatePresence>
          {state.tight && (
            <motion.div
              key="tight"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE.snap }}
              className="absolute right-3 z-30 rounded-lg bg-bear px-2 py-1 text-[9px] font-black"
              style={{ top: ENTRY + 30 }}
            >
              Шум выбьет стоп
            </motion.div>
          )}
        </AnimatePresence>
        {pinned > 0 && (
          <motion.div
            key={pinned}
            className="pointer-events-none absolute left-1/2 z-30 -ml-3 h-6 w-6 rounded-full border-2 border-bear"
            style={{ top: 0, y: stop }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </div>
      <div className="absolute inset-x-3 bottom-5 grid grid-cols-3 gap-2">
        {[
          {
            l: "Риск депозита",
            v: `${state.risk.toFixed(1)}%`,
            c: state.wide ? "#ffc34d" : state.tight ? "#ff4d5e" : "#fff",
          },
          {
            l: "Риск / прибыль",
            v: `1:${state.rr.toFixed(1)}`,
            c: state.rr >= 2 ? "#3ddc84" : "#ffc34d",
          },
          {
            l: "Вердикт",
            v: good
              ? "ОК"
              : state.tight
                ? "Тесно"
                : state.wide
                  ? "Много"
                  : "Слабо",
            c: good ? "#3ddc84" : "#ff4d5e",
          },
        ].map((m) => (
          <motion.div
            key={m.l}
            className="glass rounded-xl py-2 text-center"
            animate={{ borderColor: `${m.c}55` }}
          >
            <div className="text-[8.5px] text-white/45">{m.l}</div>
            <div
              className="font-display text-sm font-black"
              style={{ color: m.c }}
            >
              <Roll value={m.v} />
            </div>
          </motion.div>
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   40 · RR BALANCE — весы: риск против прибыли
   ================================================================ */
function CoinStack({ n, color }: { n: number; color: string }) {
  return (
    <div className="flex flex-col-reverse items-center">
      <AnimatePresence initial={false}>
        {Array.from({ length: n }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -60, opacity: 0, scaleX: 0.6 }}
            animate={{ y: 0, opacity: 1, scaleX: 1 }}
            exit={{ y: -30, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="-mt-1.5 h-3 w-12 rounded-[50%] border"
            style={{
              background: `linear-gradient(180deg, ${color}, ${color}88)`,
              borderColor: `${color}`,
              boxShadow: `0 2px 0 ${color}55`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function RRBalance({ run, cue }: SceneProps) {
  const risk = useMotionValue(0.3);
  const rew = useMotionValue(0.3);
  const [nums, setNums] = useState({ r: 3, w: 3 });
  const tilt = useMotionValue(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const golden = useRef(false);
  const leftY = useTransform(tilt, (a) => Math.sin((a * Math.PI) / 180) * -90);
  const rightY = useTransform(tilt, (a) => Math.sin((a * Math.PI) / 180) * 90);

  const update = () => {
    const r = Math.max(1, Math.round(risk.get() * 10));
    const w = Math.max(1, Math.round(rew.get() * 10));
    setNums((o) => (o.r === r && o.w === w ? o : { r, w }));
    // перевешивает прибыль → правая чаша вниз (положительный угол)
    const target = Math.max(-18, Math.min(18, (w - r) * 3));
    animate(tilt, target, { type: "spring", stiffness: 120, damping: 9 });
    const ratio = w / r;
    if (ratio >= 2 && !golden.current) {
      golden.current = true;
      sfx.chime();
      p.burst({
        x: 230,
        y: 250,
        count: 36,
        shape: "star",
        colors: ["#ffc34d", "#fff"],
        speed: [120, 320],
        size: [2, 5],
      });
    }
    if (ratio < 2) golden.current = false;
  };
  useMotionValueEvent(risk, "change", update);
  useMotionValueEvent(rew, "change", update);

  useScript(run, async (wait) => {
    risk.set(0.3);
    rew.set(0.3);
    golden.current = false;
    await wait(500);
    cue();
    const drag = async (mv: typeof risk, y: number, to: number, d = 0.7) => {
      g.show(24 + mv.get() * 252, y);
      g.press(true);
      await Promise.all([
        g.move(24 + to * 252, y, d),
        animate(mv, to, { duration: d, ease: EASE.camera }),
      ]);
      g.press(false);
      await wait(500);
    };
    await drag(risk, 468, 0.6);
    if (root) animate(root, shakeKeys(0.3, 8, 5, 0.5), { duration: 0.3 });
    sfx.error();
    await drag(rew, 528, 0.9);
    await drag(risk, 468, 0.3);
    g.hide();
  });

  const ratio = nums.w / nums.r;
  const col = ratio >= 2 ? "#ffc34d" : ratio >= 1 ? "#3ddc84" : "#ff4d5e";
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={col} />
      <div className="absolute inset-x-0 top-11 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/45">
          Риск против прибыли
        </div>
        <div
          className="font-display text-4xl font-black"
          style={{ color: col, textShadow: `0 0 24px ${col}` }}
        >
          1:
          <Roll value={ratio.toFixed(1)} />
        </div>
      </div>
      {/* scale */}
      <div className="absolute left-1/2 top-[150px] -ml-[130px] h-[280px] w-[260px]">
        <div className="absolute bottom-0 left-1/2 h-4 w-28 -ml-14 rounded-t-xl bg-gradient-to-b from-[#3a4a78] to-[#1a2440]" />
        <div className="absolute bottom-4 left-1/2 top-[40px] w-2 -ml-1 rounded bg-gradient-to-b from-[#6a7ab8] to-[#2a3658]" />
        <motion.div
          className="absolute left-1/2 top-[34px] -ml-2.5 h-5 w-5 rounded-full border-2 border-white/40 bg-[#1a2440]"
          animate={{
            boxShadow: ratio >= 2 ? "0 0 20px #ffc34d" : "0 0 0 #0000",
          }}
        />
        <motion.div
          className="absolute left-[10px] right-[10px] top-[42px] h-1.5 rounded-full bg-gradient-to-r from-bear via-white/60 to-bull"
          style={{ rotate: tilt }}
        />
        {/* pans */}
        {[
          { side: "left", y: leftY, c: "#ff4d5e", n: nums.r, l: "РИСК" },
          { side: "right", y: rightY, c: "#3ddc84", n: nums.w, l: "ПРИБЫЛЬ" },
        ].map((pn) => (
          <motion.div
            key={pn.side}
            className={`absolute top-[46px] flex w-[90px] flex-col items-center ${pn.side === "left" ? "left-0" : "right-0"}`}
            style={{ y: pn.y }}
          >
            <svg
              width="90"
              height="60"
              viewBox="0 0 90 60"
              className="overflow-visible"
            >
              <line x1="45" y1="0" x2="10" y2="56" stroke="#ffffff44" />
              <line x1="45" y1="0" x2="80" y2="56" stroke="#ffffff44" />
            </svg>
            <div className="-mt-12 flex h-[90px] items-end">
              <CoinStack n={pn.n} color={pn.c} />
            </div>
            <div
              className="h-2.5 w-24 rounded-[50%] border"
              style={{
                borderColor: pn.c,
                background: `${pn.c}33`,
                boxShadow: `0 0 12px ${pn.c}55`,
              }}
            />
            <div
              className="mt-1 text-[9px] font-black tracking-[.2em]"
              style={{ color: pn.c }}
            >
              {pn.l}
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {ratio >= 2 && (
          <motion.div
            key="g"
            initial={{ scale: 2.2, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: EASE.snap }}
            className="absolute right-5 top-[130px] rounded-lg bg-gold px-2 py-1 font-display text-[11px] font-black text-[#3a2200] shadow-[0_0_20px_#ffc34d]"
          >
            ЗОЛОТОЕ ПРАВИЛО
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-6 top-[448px] space-y-3">
        <Slider
          mv={risk}
          label="Риск, $"
          color="#ff4d5e"
          format={(v) => `${Math.max(1, Math.round(v * 10)) * 10}`}
          onCommit={() => sfx.snap()}
        />
        <Slider
          mv={rew}
          label="Цель, $"
          color="#3ddc84"
          format={(v) => `${Math.max(1, Math.round(v * 10)) * 10}`}
          onCommit={() => sfx.snap()}
        />
      </div>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/45">
        При 1:2 можно ошибаться в 60% сделок и оставаться в плюсе
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* keep clamp referenced for tree-shaking-safe helpers */
export const _riskClamp = clamp;

/* ================================================================
   89 · POSITION SIZER — риск% и стоп% → размер позиции
   ================================================================ */
export function PositionSizer({ run, cue }: SceneProps) {
  const riskMv = useMotionValue(0.11);
  const stopMv = useMotionValue(0.2);
  const [r, setR] = useState(0.11);
  const [s, setS] = useState(0.2);
  const g = useGhost();
  useMotionValueEvent(riskMv, "change", setR);
  useMotionValueEvent(stopMv, "change", setS);
  const dep = 1000;
  const risk = 0.5 + r * 4.5;
  const stop = 0.5 + s * 7.5;
  const loss = (dep * risk) / 100;
  const size = loss / (stop / 100);
  const blocks = Math.min(20, Math.round(size / 250));
  const danger = risk > 2;
  useScript(run, async (wait) => {
    riskMv.set(0.11);
    stopMv.set(0.2);
    await wait(600);
    cue();
    const drag = async (mv: typeof riskMv, y: number, to: number) => {
      g.show(24 + mv.get() * 252, y);
      g.press(true);
      await Promise.all([
        g.move(24 + to * 252, y, 0.7),
        animate(mv, to, { duration: 0.7, ease: EASE.camera }),
      ]);
      g.press(false);
      await wait(500);
    };
    await drag(stopMv, 488, 0.05);
    await drag(riskMv, 440, 0.7);
    await drag(riskMv, 440, 0.11);
    await drag(stopMv, 488, 0.35);
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={danger ? "#ff4d5e" : "#2ee6c5"} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Размер позиции</div>
        <div className="text-[10px] text-white/50">депозит 1 000</div>
      </div>
      <div className="absolute inset-x-0 top-[84px] text-center">
        <div
          className="font-display text-4xl font-black"
          style={{ color: danger ? "#ff4d5e" : "#2ee6c5" }}
        >
          <Roll value={Math.round(size).toLocaleString("ru")} />
        </div>
        <div className="text-[10px] text-white/50">USDT в позиции</div>
      </div>
      <div className="absolute inset-x-6 top-[160px] grid grid-cols-10 gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded"
            animate={{
              background:
                i < blocks ? (i >= 8 ? "#ff4d5e" : "#2ee6c5") : "#ffffff10",
              scale: i < blocks ? 1 : 0.8,
            }}
            transition={{ ...SPRING.tap, delay: i * 0.015 }}
            style={{
              boxShadow:
                i < blocks
                  ? `0 0 8px ${i >= 8 ? "#ff4d5e" : "#2ee6c5"}88`
                  : "none",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-6 top-[220px] text-center text-[9px] text-white/40">
        1 блок = 250 USDT · красные блоки — позиция больше 2 депозитов
      </div>
      <div className="glass absolute inset-x-4 top-[252px] flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-mono text-[11px]">
        <span className="text-white/60">риск</span>
        <span className="font-bold text-white">{loss.toFixed(0)}$</span>
        <span className="text-white/40">÷</span>
        <span className="text-white/60">стоп</span>
        <span className="font-bold text-white">{stop.toFixed(1)}%</span>
        <span className="text-white/40">=</span>
        <span
          className="font-bold"
          style={{ color: danger ? "#ff4d5e" : "#2ee6c5" }}
        >
          {Math.round(size)}$
        </span>
      </div>
      <div className="absolute inset-x-4 top-[304px] h-[90px]">
        <AnimatePresence>
          {danger && (
            <motion.div
              key="d"
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, x: 60 }}
              transition={SPRING.reward}
              className="flex items-center gap-2 rounded-xl border border-bear/50 bg-bear/15 p-2.5 text-[11px] font-bold text-bear"
            >
              <I.warn size={16} /> Риск {risk.toFixed(1)}% — серия из 5 ошибок
              съест {Math.round((1 - Math.pow(1 - risk / 100, 5)) * 100)}%
              депозита
            </motion.div>
          )}
          {!danger && s < 0.1 && (
            <motion.div
              key="t"
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING.reward}
              className="flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/10 p-2.5 text-[11px] font-bold text-gold"
            >
              <I.warn size={16} /> Узкий стоп раздувает позицию — шум выбьет
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-6 top-[420px] space-y-3">
        <Slider
          mv={riskMv}
          label="Риск на сделку"
          color={danger ? "#ff4d5e" : "#2ee6c5"}
          format={(v) => `${(0.5 + v * 4.5).toFixed(1)}%`}
        />
        <Slider
          mv={stopMv}
          label="Дистанция стопа"
          color="#ffc34d"
          format={(v) => `${(0.5 + v * 7.5).toFixed(1)}%`}
        />
      </div>
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_RISK: Category = {
  id: "risk",
  n: "12",
  title: "Риск-менеджмент",
  en: "Leverage heat · Stop drag · RR balance",
  color: "#ff4d5e",
  blurb:
    "Риск, который чувствуешь кожей: экран нагревается и дрожит от плеча, линии стопа тянутся пальцем, весы наглядно взвешивают риск и прибыль.",
  scenes: [
    {
      id: "leverage",
      n: "38",
      title: "Жар кредитного плеча",
      kind: "Escalating slider",
      lead: "Слайдер с 8 ступенями плеча. С каждой ступенью фон нагревается, линия ликвидации подползает к цене, красная зона растёт, после 10x экран начинает постоянно дрожать, на пороговых значениях врезаются предупреждения, на 100x стекло трескается.",
      secrets: [
        "Эскалация — непрерывная функция от слайдера: цвет фона hexMix(тёмный → бордовый), внутреннее свечение, амплитуда тремора. Никаких «уровней опасности» — плавный градиент тревоги.",
        "Тремор — rAF-цикл со случайным смещением, амплитуда = плечо/100 × 4. Он не заканчивается, пока плечо высокое — дискомфорт как аргумент.",
        "Линия ликвидации по формуле 60 + (1 − v^0.6) × 110: на больших плечах она «прыгает» к цене всё сильнее — нелинейность подчёркивает опасность.",
        "Пороги 10/20/50/100x срабатывают только на ПОВЫШЕНИИ — уменьшение плеча не пугает, а успокаивает.",
        "Сердцебиение вместо ошибки на 50x+ — звук тела, а не интерфейса.",
      ],
      tracks: [
        { label: "1x → 10x", start: 500, dur: 1600, color: "#2ee6c5" },
        { label: "Тремор включён", start: 1700, dur: 3500, color: "#ffc34d" },
        { label: "20x / 50x", start: 2300, dur: 1600, color: "#ff8a3d" },
        { label: "100x: трещины", start: 4100, dur: 500, color: "#ff4d5e" },
        { label: "Возврат к 5x", start: 5100, dur: 600, color: "#3ddc84" },
      ],
      total: 6000,
      ease: { bez: EASE.outExpo, label: "outExpo — шаг плеча" },
      code: `const heat = useTransform(t, v => hexMix("#0a1122", "#3a0610", v));
const glow = useTransform(t, v => \`inset 0 0 \${v * 140}px \${v * 30}px rgba(255,45,74,\${v * .7})\`);
const liqY = useTransform(t, v => 60 + (1 - Math.pow(v, .6)) * 110);

// постоянный тремор, растущий с плечом
const loop = () => {
  const a = lev >= 10 ? Math.min(4, lev / 100 * 4 + .5) : 0;
  jx.set((Math.random() - .5) * a); jy.set((Math.random() - .5) * a);
  raf = requestAnimationFrame(loop);
};`,
      C: LeverageHeat,
      interactive: "Тяни плечо",
    },
    {
      id: "stopdrag",
      n: "39",
      title: "Перетаскивание стопа и тейка",
      kind: "Draggable lines",
      lead: "Линии стопа и тейка тянутся пальцем прямо на графике. Зоны риска и прибыли заливаются градиентом, ценники едут за линиями, метрики пересчитываются вживую. Слишком тесный стоп при отпускании «мотает головой» и получает предупреждение, правильный — фиксируется кольцом.",
      secrets: [
        "Линия — motion.div с onPan и clamp границ; высота зоны — useTransform от позиции линии. Геометрия зон не хранится в стейте вообще.",
        "При захвате линия утолщается (scaleY 2.5), ручка и бейдж увеличиваются — прямой отклик «я держу».",
        "Валидация на отпускании: тесный стоп → shake-слой по ключу + штамп «Шум выбьет стоп»; нормальный → кольцо-«пин» и искры.",
        "Метрики — Roll: каждая цифра прокручивается независимо, числа живут, а не мигают.",
        "Вердикт синтезирует три условия (тесно / много / RR) в одно слово и цвет — сложная логика, простой фидбэк.",
      ],
      tracks: [
        {
          label: "Стоп слишком близко",
          start: 500,
          dur: 600,
          color: "#ff4d5e",
        },
        { label: "Отказ + штамп", start: 1100, dur: 400, color: "#ff4d5e" },
        { label: "Стоп исправлен", start: 2000, dur: 500, color: "#3ddc84" },
        { label: "Пин-кольцо", start: 2500, dur: 600, color: "#ff4d5e" },
        { label: "Тейк выше, RR 3.3", start: 3400, dur: 600, color: "#3ddc84" },
      ],
      total: 4300,
      ease: { bez: EASE.camera, label: "camera — демо-драг" },
      code: `<motion.div style={{ y: stop }}
  onPanStart={() => base = stop.get()}
  onPan={(_, i) => stop.set(clamp(base + i.offset.y, ENTRY + 4, MAX))}
  onPanEnd={release} />

const zoneH = useTransform(stop, y => y - ENTRY);
<motion.div style={{ top: ENTRY, height: zoneH }} className="bg-gradient-to-b from-bear/40" />`,
      C: StopTakeDrag,
      interactive: "Тяни линии стопа и тейка",
    },
    {
      id: "rrbalance",
      n: "40",
      title: "Весы риска и прибыли",
      kind: "Physics balance",
      lead: "Два слайдера кладут монеты на чаши весов. Коромысло наклоняется недодемпфированной пружиной, чаши качаются, монеты падают стопкой. При соотношении 1:2 и выше весы подсвечиваются золотом и падает штамп «Золотое правило».",
      secrets: [
        "Одна величина — tilt; позиции чаш — sin(tilt) × ±90 через useTransform. Физика «рычага» бесплатно.",
        "Пружина 120/9 — сильно недодемпфированная: весы качаются несколько раз, как настоящие.",
        "Монеты падают сверху с пружиной 500/22 и лёгким scaleX — стопка «оседает».",
        "Золотое правило срабатывает один раз на пересечении порога (флаг golden) — награда не спамится при дрожании слайдера.",
        "Цвет соотношения: красный <1, зелёный ≥1, золото ≥2. Три состояния — три эмоции.",
      ],
      tracks: [
        { label: "Риск вверх", start: 500, dur: 700, color: "#ff4d5e" },
        { label: "Весы влево", start: 700, dur: 900, color: "#ff4d5e" },
        { label: "Цель вверх", start: 1700, dur: 700, color: "#3ddc84" },
        { label: "Риск вниз", start: 2900, dur: 700, color: "#ff4d5e" },
        { label: "Золото 1:3", start: 3400, dur: 600, color: "#ffc34d" },
      ],
      total: 4200,
      ease: { bez: [0.34, 1.56, 0.64, 1], label: "≈ пружина 120/9" },
      code: `const leftY  = useTransform(tilt, a => Math.sin(a * Math.PI / 180) * -90);
const rightY = useTransform(tilt, a => Math.sin(a * Math.PI / 180) *  90);

const update = () => {
  const target = clamp((w - r) * 3, -18, 18);
  animate(tilt, target, { type: "spring", stiffness: 120, damping: 9 });
  if (w / r >= 2 && !golden) { golden = true; sfx.chime(); stars(); }
};`,
      C: RRBalance,
      interactive: "Двигай риск и цель",
    },
    {
      id: "possizer",
      n: "89",
      title: "Калькулятор позиции",
      kind: "Formula sliders",
      lead: "Два слайдера — риск на сделку и дистанция стопа — считают размер позиции по формуле, которая видна целиком. Позиция показана блоками по 250 USDT: сверх двух депозитов блоки краснеют. Опасный риск вызывает предупреждение с расчётом серии из пяти ошибок.",
      secrets: [
        "Формула «риск ÷ стоп = позиция» выведена строкой с живыми числами — анимация объясняет математику, а не украшает её.",
        "Блоки загораются каскадом 15мс пружиной tap: размер позиции ощущается количеством, а не только числом.",
        "Цвет блоков меняется на пороге двух депозитов — граница кредитного плеча становится видимой.",
        "Предупреждение считает реальную просадку серии 1 − (1 − r)^5: страх подкреплён цифрой.",
        "Узкий стоп с малым риском тоже предупреждает: позиция раздувается «незаметно» — важный неочевидный урок.",
      ],
      tracks: [
        { label: "Стоп → 0.9%", start: 600, dur: 700, color: "#ffc34d" },
        { label: "Позиция раздулась", start: 900, dur: 600, color: "#ff4d5e" },
        { label: "Риск → 3.7%", start: 1800, dur: 700, color: "#ff4d5e" },
        { label: "Риск назад", start: 3000, dur: 700, color: "#2ee6c5" },
        { label: "Стоп → 3.1%", start: 4200, dur: 700, color: "#ffc34d" },
      ],
      total: 5200,
      ease: { bez: EASE.camera, label: "camera — слайдеры" },
      code: `const loss = dep * risk / 100;
const size = loss / (stop / 100);
const blocks = Math.min(20, Math.round(size / 250));
{cells.map(i => <motion.div animate={{
  background: i < blocks ? (i >= 8 ? BEAR : TEAL) : "#fff1" }}
  transition={{ ...SPRING.tap, delay: i * .015 }} />)}`,
      C: PositionSizer,
      interactive: "Двигай риск и стоп",
    },
  ],
};
