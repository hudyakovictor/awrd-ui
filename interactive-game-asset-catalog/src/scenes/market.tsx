import { animate, AnimatePresence, motion, useAnimate, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DepthLadder, genSeries, makeBook, PriceChart, type Bar } from "../components/chart";
import { RollingNumber, Segmented } from "../components/ui";
import { I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys } from "../motion/tokens";
import { getSound, sfx } from "../motion/audio";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   20 · TIMEFRAME DRILL — бурение в старшие таймфреймы
   ================================================================ */
const TFS = [
  { id: "15M", label: "15M", seed: 12, drift: 0.1, c: "#2ee6c5", bias: "Бычий", note: "Локальный импульс вверх" },
  { id: "1H", label: "1H", seed: 44, drift: -0.05, c: "#ffc34d", bias: "Боковик", note: "Диапазон 58 000 – 61 500" },
  { id: "4H", label: "4H", seed: 71, drift: 0.18, c: "#4cc3ff", bias: "Бычий", note: "Структура повышенных минимумов" },
] as const;
const DATA: Record<string, Bar[]> = Object.fromEntries(TFS.map((t) => [t.id, genSeries(t.id === "4H" ? 20 : 26, t.seed, t.drift)]));

export function TimeframeDrill({ run, cue }: SceneProps) {
  const [big, setBig] = useState(2);
  useScript(run, async (wait) => {
    setBig(2);
    await wait(1200);
    cue();
    setBig(0);
    if (getSound()) sfx.whoosh(1);
    await wait(1500);
    setBig(2);
    await wait(1500);
    setBig(1);
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={TFS[big].c} />
      <div className="absolute inset-x-3 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Старшие таймфреймы</div>
        <div className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: `${TFS[big].c}22`, color: TFS[big].c }}>{TFS[big].bias}</div>
      </div>
      <div className="absolute inset-x-3 top-[74px] grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "auto" }}>
        {TFS.map((t, i) => {
          const isBig = big === i;
          return (
            <motion.button
              key={t.id}
              layout
              onClick={() => { setBig(i); if (getSound()) sfx.tap(); }}
              transition={SPRING.layout}
              className="glass overflow-hidden rounded-2xl p-2 text-left"
              style={{ gridColumn: isBig ? "span 3" : "span 1", borderColor: isBig ? `${t.c}55` : undefined }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-[11px] font-bold" style={{ color: isBig ? t.c : "#ffffff88" }}>{t.id}</span>
                <span className="font-mono text-[9px] text-white/40">
                  {DATA[t.id][DATA[t.id].length - 1].c.toFixed(0)}
                </span>
              </div>
              <PriceChart data={DATA[t.id]} w={isBig ? 252 : 78} h={isBig ? 150 : 52} volume={isBig} crosshair={isBig} glow={isBig} tf={t.id} />
              <AnimatePresence>
                {isBig && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE.outExpo }} className="overflow-hidden">
                    <div className="mt-2 rounded-xl bg-black/25 p-2">
                      <div className="text-[10px] font-bold" style={{ color: t.c }}>{t.bias}</div>
                      <div className="text-[10px] text-white/55">{t.note}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="glass absolute inset-x-3 bottom-6 flex items-center gap-3 rounded-2xl p-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal/15 text-teal"><I.layers size={18} /></div>
        <div className="flex-1 text-[11px] leading-tight text-white/70">Тапни по таймфрейму — панель разворачивается, остальные сжимаются. Приоритет всегда у старшего.</div>
      </div>
    </div>
  );
}

/* ================================================================
   21 · WHALE PULL — вынос ликвидности китом
   ================================================================ */
export function WhalePull({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [book, setBook] = useState(() => makeBook(61250, 8, 3));
  const [price, setPrice] = useState(61250);
  const [phase, setPhase] = useState<"idle" | "wall" | "pull" | "gone">("idle");
  const [spread, setSpread] = useState(0.5);
  useScript(run, async (wait) => {
    setBook(makeBook(61250, 8, 3));
    setPrice(61250);
    setSpread(0.5);
    setPhase("idle");
    await wait(900);
    // 1. Кит наливает стену на бидах
    setPhase("wall");
    setBook((b) => ({ ...b, bids: b.bids.map((x, i) => ({ ...x, q: i < 3 ? 3200 + i * 400 : x.q })) }));
    if (getSound()) sfx.charge(0.6);
    await wait(1400);
    cue();
    // 2. Стену выдёргивают — ликвидность уходит
    setPhase("pull");
    if (getSound()) sfx.error();
    await wait(320);
    // 3. Обвал: цена прыгает вниз, спред расширяется
    setPhase("gone");
    setSpread(4.5);
    setBook((b) => ({ ...b, bids: b.bids.map((x, i) => ({ ...x, q: i < 3 ? 40 + i * 20 : x.q * 0.35 })) }));
    setPrice(61190);
    anim(scope.current, shakeKeys(0.85, 14, 12, 2), { duration: 0.5 });
    const bx = 150, by = 200;
    p.ring(bx, by, "#ff4d5e", 180, 0.6, 10);
    p.ring(bx, by, "#ffffff", 120, 0.4, 16);
    p.burst({ x: bx, y: by, count: 50, colors: ["#ff4d5e", "#fff", "#ff9a4d"], speed: [200, 620], drag: 3 });
    if (getSound()) sfx.impact();
  });
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={phase === "gone" ? "#ff4d5e" : "#3ddc84"} />
      <div className="absolute inset-x-3 top-11 flex items-baseline justify-between">
        <div className="font-display text-sm font-bold">BTC/USDT</div>
        <motion.div key={price} initial={{ scale: 1.4, color: "#ff4d5e" }} animate={{ scale: 1, color: "#ffffff" }} transition={SPRING.reward} className="font-mono text-sm font-bold tabular-nums">
          {price.toFixed(1)}
        </motion.div>
      </div>
      <div className="absolute inset-x-3 top-[70px] overflow-hidden rounded-2xl border border-white/5 bg-black/25 p-2">
        <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-widest text-white/35">
          <span>Стакан заявок</span>
          <motion.span animate={phase === "wall" ? { color: "#3ddc84" } : { color: "#ffffff55" }}>спред {spread.toFixed(1)}</motion.span>
        </div>
        <DepthLadder book={book} w={252} rowH={15} />
      </div>
      {/* стена-визуализатор */}
      <AnimatePresence>
        {phase === "wall" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.3 }} transition={SPRING.panel} className="absolute inset-x-8 top-[300px] rounded-xl border border-bull/50 bg-bull/15 px-3 py-2 text-center">
            <div className="text-[10px] font-bold text-bull">СТЕНА ПОКУПКИ · 3 200</div>
            <motion.div className="mt-1 h-1 rounded-full bg-bull" initial={{ scaleX: 0 }} animate={{ scaleX: [0, 1] }} transition={{ duration: 0.9, ease: EASE.outExpo }} style={{ transformOrigin: "0% 50%" }} />
            <div className="mt-1 text-[9px] text-white/50">Кажется, цену держат…</div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "gone" && (
          <motion.div initial={{ scale: 2.2, opacity: 0, rotate: -5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.3, ease: EASE.snap }} className="absolute inset-x-8 top-[300px] rounded-xl border border-bear/60 bg-[#3a0a14]/80 px-3 py-2 text-center">
            <div className="font-display text-sm font-black text-bear" style={{ textShadow: "0 0 14px #ff4d5e" }}>ЛИКВИДНОСТЬ ВЫНЕСЛИ</div>
            <div className="mt-1 text-[10px] text-white/60">Стена была приманкой. Цена пошла сквозь неё.</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-3 bottom-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Цена · 15M</div>
        <PriceChart data={genSeries(22, 91, -0.12)} w={252} h={90} volume={false} crosshair={false} glow />
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   22 · RISK SIZER — размер позиции и вердикт в реальном времени
   ================================================================ */
const VERDICTS = [
  { max: 25, t: "Скальп", c: "#3ddc84", d: "Малый лот, широкий стоп. Скучно, но выживешь." },
  { max: 50, t: "Стандарт", c: "#2ee6c5", d: "Риск 1% на сделку. Профессиональная база." },
  { max: 72, t: "Агрессивно", c: "#ffc34d", d: "Серия убытков выбьет 20% депозита." },
  { max: 101, t: "Опасно", c: "#ff4d5e", d: "Одна ошибка = -35%. Так сливают счета." },
];

export function RiskSizer({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const [v, setV] = useState(30);
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const lastZone = useRef(1);
  const zone = VERDICTS.find((z) => v < z.max)!;
  const equity = 1250;
  const riskUsd = (equity * v) / 100;
  const liq = v > 72 ? "1.2%" : v > 50 ? "4.8%" : "11.4%";

  const dragRef = useRef(false);
  const set = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const raw = Math.round(((clientX - r.left) / r.width) * 100);
    // ДЕТЕНТЫ: притяжение к 25/50/75 — пружинная фиксация
    const snapped = [0, 25, 50, 75].some((d) => Math.abs(raw - d) < 3) ? [0, 25, 50, 75].find((d) => Math.abs(raw - d) < 3)! : raw;
    const nv = Math.max(2, Math.min(100, snapped));
    setV(nv);
  };
  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragRef.current) set(e.clientX); };
    const up = () => { setDragging(false); dragRef.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zi = VERDICTS.indexOf(zone);
  useScript(run, async (wait) => {
    cue();
    for (const t of [30, 55, 85, 50]) {
      await wait(1300);
      setV(t);
      if (getSound()) sfx.tick(t >= 72);
      if (t >= 72 && scope.current) anim(scope.current, shakeKeys(0.5, 10, 7, 1.2), { duration: 0.35 });
    }
  });
  // реакция на смену зоны
  useEffect(() => {
    if (zi !== lastZone.current) {
      lastZone.current = zi;
      if (zi >= 3) {
        if (getSound()) sfx.error();
        buzzWarn();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zi]);

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" animate={{ background: `radial-gradient(100% 60% at 50% 0%, ${zone.c}22, transparent 70%)` }} transition={{ duration: 0.5 }} />
      <SceneBg tint={zone.c} />
      <div className="absolute inset-x-0 top-11 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Калькулятор риска</div>

      <div className="glass absolute inset-x-3 top-[74px] rounded-2xl p-3" style={{ borderColor: `${zone.c}55` }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">Размер позиции</div>
            <div className="font-display text-3xl font-black" style={{ color: zone.c }}>
              <RollingNumber value={v} />%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-white/40">Риск</div>
            <div className="font-mono text-lg font-bold"><RollingNumber value={riskUsd} /> $</div>
          </div>
        </div>
        {/* ТРЕК */}
        <div ref={track} className="relative mt-4 h-11 cursor-grab touch-none select-none active:cursor-grabbing" onPointerDown={(e) => { setDragging(true); dragRef.current = true; set(e.clientX); }}>
          <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `linear-gradient(90deg,#3ddc84,#2ee6c5,#ffc34d,#ff4d5e)` }} animate={{ width: `${v}%` }} transition={SPRING.layout} />
          </div>
          {[0, 25, 50, 75].map((d) => (
            <div key={d} className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-white/25" style={{ left: `${d}%` }} />
          ))}
          <motion.div className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 bg-[#0c1428]" style={{ left: `${v}%`, borderColor: zone.c, boxShadow: `0 0 18px ${zone.c}` }} animate={{ scale: dragging ? 1.25 : 1 }} transition={SPRING.tap}>
            <motion.div className="absolute inset-2 rounded-md" style={{ background: zone.c }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.6, repeat: Infinity }} />
          </motion.div>
        </div>
        <div className="flex justify-between font-mono text-[8px] text-white/30"><span>2%</span><span>25</span><span>50</span><span>75</span><span>100%</span></div>
      </div>

      {/* вердикт */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={zone.t}
          initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -24, opacity: 0, filter: "blur(6px)", position: "absolute" }}
          transition={SPRING.panel}
          className="absolute inset-x-3 top-[262px] rounded-2xl border p-4"
          style={{ borderColor: `${zone.c}66`, background: `${zone.c}14` }}
        >
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: zi >= 3 ? [0, -8, 8, 0] : 0, scale: zi >= 3 ? [1, 1.15, 1] : 1 }} transition={{ duration: 0.5 }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: zone.c, color: zone.c }}>
              {zi >= 3 ? <I.warn size={20} /> : zi === 2 ? <I.bolt size={20} /> : <I.shield size={20} />}
            </motion.div>
            <div>
              <div className="font-display text-xl font-black" style={{ color: zone.c }}>{zone.t}</div>
              <div className="text-[11px] text-white/60">{zone.d}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-3 top-[364px] grid grid-cols-3 gap-2">
        {[["Депозит", `$${equity}`], ["Ликвидация", liq], ["Серия убытков", `${Math.round(v * 1.8)}%`]].map(([a, b]) => (
          <div key={a} className="glass rounded-xl p-2 text-center">
            <div className="text-[8px] uppercase tracking-widest text-white/35">{a}</div>
            <div className="font-mono text-xs font-bold">{b}</div>
          </div>
        ))}
      </div>
      <motion.div
        animate={zi >= 3 ? { boxShadow: ["inset 0 0 40px #ff4d5e22", "inset 0 0 90px #ff4d5e66", "inset 0 0 40px #ff4d5e22"] } : { boxShadow: "inset 0 0 0 #0000" }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="pointer-events-none absolute inset-0"
      />
    </div>
  );
}
function buzzWarn() {
  if (getSound() && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([50, 40, 50]);
}

/* ================================================================
   23 · REPLAY SCRUBBER — прокрутка истории сделки
   ================================================================ */
const RD = genSeries(38, 133, 0.08);
const MARKS = [
  { i: 10, t: "Вход", c: "#3ddc84", note: "Ретест подтверждён объёмом" },
  { i: 20, t: "Новость", c: "#ffc34d", note: "Плохой MACRO-принт. Шум." },
  { i: 30, t: "Выход", c: "#4cc3ff", note: "Цель достигнута, R:R 1:2.4" },
];

export function ReplayScrubber({ run, cue }: SceneProps) {
  const [speed, setSpeed] = useState<"1x" | "2x" | "4x">("2x");
  const [playing, setPlaying] = useState(false);
  const prog = useMotionValue(0);
  const [p, setP] = useState(0);
  const [hit, setHit] = useState<number[]>([]);
  const [scope, anim] = useAnimate();
  const mult = speed === "1x" ? 1 : speed === "2x" ? 2 : 4;

  useEffect(() => {
    const un = prog.on("change", (v) => {
      setP(v);
      MARKS.forEach((m, i) => {
        if (v * 100 >= m.i && !hit.includes(i)) {
          setHit((h) => [...h, i]);
          if (getSound()) sfx.success();
        }
      });
    });
    return un;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  useScript(run, async (wait) => {
    prog.set(0);
    setHit([]);
    cue();
    await wait(700);
    setPlaying(true);
    await animate(prog, 1, { duration: 7 / mult, ease: "linear" });
    setPlaying(false);
    anim(scope.current, shakeKeys(0.4, 8, 6, 1), { duration: 0.3 });
  });

  const W = 252;
  const x = (p / 100) * W;
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#4cc3ff" />
      <div className="absolute inset-x-3 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Разбор сделки</div>
        <Segmented items={[{ id: "1x", label: "1x" }, { id: "2x", label: "2x" }, { id: "4x", label: "4x" }]} value={speed} onChange={(s) => { setSpeed(s); if (getSound()) sfx.tap(); }} color="#4cc3ff" />
      </div>
      <div className="glass absolute inset-x-3 top-[104px] rounded-2xl p-3">
        <PriceChart data={RD} w={W} h={150} visible={Math.max(3, Math.round((p / 100) * 38))} crosshair={false} volume glow tf="15M" />
        {/* маркеры */}
        {MARKS.map((m, i) => {
          const passed = hit.includes(i);
          return (
            <AnimatePresence key={m.i}>
              {passed && (
                <motion.div initial={{ scale: 0, y: -8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={SPRING.reward} className="absolute flex flex-col items-center" style={{ left: (m.i / 38) * W + 4, top: 12 }}>
                  <div className="rounded px-1.5 py-0.5 text-[8px] font-black text-black" style={{ background: m.c }}>{m.t}</div>
                  <div className="h-3 w-px" style={{ background: m.c }} />
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
      {/* скраббер */}
      <div
        className="absolute inset-x-3 top-[292px] cursor-grab touch-none py-3 active:cursor-grabbing"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          prog.set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
          if (getSound()) sfx.tick();
        }}
      >
        <div className="relative h-2 rounded-full bg-white/10">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1b7fa8] to-sky" style={{ width: `${p}%` }} />
          {MARKS.map((m, i) => (
            <motion.div key={m.i} className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2" style={{ left: `${(m.i / 38) * 100}%`, borderColor: m.c, background: hit.includes(i) ? m.c : "#0c1428" }} animate={hit.includes(i) ? { scale: [1.6, 1] } : {}} />
          ))}
          <motion.div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky bg-[#0c1428] shadow-[0_0_16px_#4cc3ff]" style={{ left: x }} />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-white/35">
          <span>09:15</span>
          <span className="text-sky">{Math.round(p)}%</span>
          <span>15:45</span>
        </div>
      </div>
      {/* карточки событий */}
      <div className="absolute inset-x-3 top-[372px] space-y-2">
        <AnimatePresence mode="popLayout">
          {hit.length > 0 && (
            <motion.div key={hit.length} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING.panel} className="glass flex items-center gap-3 rounded-xl p-2.5">
              <div className="h-8 w-1 rounded-full" style={{ background: MARKS[hit.length - 1].c }} />
              <div>
                <div className="text-[11px] font-bold" style={{ color: MARKS[hit.length - 1].c }}>{MARKS[hit.length - 1].t}</div>
                <div className="text-[10px] text-white/55">{MARKS[hit.length - 1].note}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        onClick={() => { prog.set(0); setHit([]); setPlaying(true); animate(prog, 1, { duration: 7 / mult, ease: "linear" }); }}
        whileTap={{ scale: 0.94 }}
        className="absolute inset-x-6 bottom-4 flex items-center justify-center gap-2 rounded-2xl bg-sky py-3 font-display text-xs font-black text-[#04202e]"
      >
        {playing ? <I.replay size={14} /> : <I.play size={14} />} {playing ? "ИГРАЕТ" : "ПЕРЕСМОТРЕТЬ"}
      </motion.button>
    </div>
  );
}
