import { animate, AnimatePresence, motion, motionValue, useAnimate, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, sleep } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   24 · SWIPE DECIDE — колода сценариев, лонг/шорт свайпом
   ================================================================ */
const DECK = [
  { pair: "BTC/USDT", tf: "15M", q: "Пробой без объёма", seed: 4, drift: 0.2, ans: 1 },
  { pair: "ETH/USDT", tf: "1H", q: "Двойное дно на поддержке", seed: 12, drift: 0.15, ans: 1 },
  { pair: "SOL/USDT", tf: "4H", q: "Медвежье поглощение у хая", seed: 27, drift: -0.2, ans: -1 },
  { pair: "TON/USDT", tf: "15M", q: "Новостной памп +18%", seed: 33, drift: 0.3, ans: -1 },
  { pair: "BNB/USDT", tf: "1D", q: "Ретест пробитого уровня", seed: 45, drift: 0.12, ans: 1 },
];

function DeckCard({ d, depth, x, top, onFly }: { d: (typeof DECK)[number]; depth: number; x: MotionValue<number>; top: boolean; onFly: (dir: number) => void }) {
  const rotate = useTransform(x, [-220, 220], [-20, 20]);
  const longOp = useTransform(x, [20, 110], [0, 1]);
  const shortOp = useTransform(x, [-110, -20], [1, 0]);
  const glow = useTransform(x, [-150, 0, 150], ["0 0 40px -4px #ff4d5e", "0 20px 40px -20px #000", "0 0 40px -4px #3ddc84"]);
  const data = useMemo(() => genCandles(18, d.seed, d.drift), [d.seed, d.drift]);
  return (
    <motion.div
      className="absolute inset-x-5 top-[70px] h-[330px] cursor-grab rounded-3xl border border-white/10 bg-gradient-to-b from-[#16223f] to-[#0c1428] p-4 active:cursor-grabbing"
      style={top ? { x, rotate, boxShadow: glow, zIndex: 10 } : { zIndex: 10 - depth }}
      initial={false}
      animate={top ? { scale: 1, y: 0, opacity: 1 } : { scale: 1 - depth * 0.06, y: depth * 16, opacity: depth > 2 ? 0 : 1 - depth * 0.2 }}
      transition={SPRING.panel}
      drag={top ? "x" : false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const proj = info.offset.x + info.velocity.x * 0.25;
        if (Math.abs(proj) > 110) onFly(Math.sign(proj));
        else animate(x, 0, { type: "spring", stiffness: 500, damping: 28 });
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-base font-bold">{d.pair}</div>
          <div className="text-[10px] font-bold text-white/40">{d.tf} · сценарий</div>
        </div>
        <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white/60">t0</div>
      </div>
      <div className="mt-3 flex justify-center">
        <Candles data={data} w={230} h={140} grow={false} highlight={17} />
      </div>
      <div className="mt-3 text-sm font-bold">{d.q}</div>
      <div className="mt-1 text-[11px] text-white/50">Свайп вправо — лонг, влево — шорт</div>
      {top && (
        <>
          <motion.div style={{ opacity: longOp }} className="absolute left-5 top-6 -rotate-12 rounded-lg border-4 border-bull px-2 py-0.5 font-display text-xl font-black text-bull">
            ЛОНГ
          </motion.div>
          <motion.div style={{ opacity: shortOp }} className="absolute right-5 top-6 rotate-12 rounded-lg border-4 border-bear px-2 py-0.5 font-display text-xl font-black text-bear">
            ШОРТ
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export function SwipeDecide({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [res, setRes] = useState<{ ok: boolean; dir: number }[]>([]);
  const x = useMotionValue(0);
  const bg = useTransform(x, [-160, 0, 160], ["#ff4d5e22", "#00000000", "#3ddc8422"]);
  const busy = useRef(false);
  const idxRef = useRef(0);

  const fly = async (dir: number) => {
    if (busy.current || idxRef.current >= DECK.length) return;
    busy.current = true;
    const d = DECK[idxRef.current];
    sfx.swipe(dir);
    await animate(x, dir * 420, { duration: 0.32, ease: EASE.inQuart });
    const ok = d.ans === dir;
    ok ? sfx.success() : sfx.error();
    setRes((r) => [...r, { ok, dir }]);
    idxRef.current += 1;
    setIdx(idxRef.current);
    x.set(0);
    busy.current = false;
  };

  const demoSwipe = async (dir: number) => {
    // «призрачный палец»: медленное вытягивание → бросок
    await animate(x, dir * 60, { duration: 0.35, ease: EASE.outExpo });
    await animate(x, dir * 130, { duration: 0.25 });
    await fly(dir);
  };

  useScript(run, async (wait) => {
    idxRef.current = 0;
    setIdx(0);
    setRes([]);
    x.set(0);
    busy.current = false;
    await wait(700);
    cue();
    await demoSwipe(1);
    await wait(500);
    await demoSwipe(1);
    await wait(500);
    // колебание — нерешительность, возврат
    await animate(x, 70, { duration: 0.4 });
    await animate(x, -40, { duration: 0.4 });
    await animate(x, 0, { type: "spring", stiffness: 500, damping: 18 });
    await wait(200);
    await demoSwipe(-1);
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff8a3d" />
      <motion.div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-x-5 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Быстрые решения</div>
        <div className="font-mono text-[11px] text-white/50">{Math.min(idx + 1, DECK.length)}/{DECK.length}</div>
      </div>
      {DECK.map((d, i) => {
        const depth = i - idx;
        if (depth < 0 || depth > 3) return null;
        return <DeckCard key={i} d={d} depth={depth} x={x} top={depth === 0} onFly={fly} />;
      })}
      {idx >= DECK.length && (
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.reward} className="absolute inset-x-5 top-[160px] text-center">
          <div className="font-display text-2xl font-black">Колода пройдена</div>
          <div className="mt-1 text-sm text-white/55">{res.filter((r) => r.ok).length} из {res.length} верно</div>
        </motion.div>
      )}
      {/* buttons */}
      <div className="absolute inset-x-0 top-[430px] flex justify-center gap-6">
        {[
          { d: -1, c: "#ff4d5e", icon: I.arrowUp, rot: 180 },
          { d: 1, c: "#3ddc84", icon: I.arrowUp, rot: 0 },
        ].map((b) => (
          <motion.button key={b.d} whileTap={{ scale: 0.85 }} onClick={() => fly(b.d)} className="grid h-14 w-14 place-items-center rounded-full border-2" style={{ borderColor: b.c, color: b.c, background: `${b.c}14`, boxShadow: `0 0 20px -4px ${b.c}` }}>
            <span style={{ transform: `rotate(${b.rot}deg)` }}>
              <b.icon size={22} stroke={2.5} />
            </span>
          </motion.button>
        ))}
      </div>
      {/* results */}
      <div className="absolute inset-x-5 bottom-8 flex justify-center gap-1.5">
        {DECK.map((_, i) => {
          const r = res[i];
          return (
            <motion.div key={i} className="grid h-8 w-8 place-items-center rounded-lg border" initial={false} animate={r ? { scale: [0.5, 1.2, 1], borderColor: r.ok ? "#3ddc84" : "#ff4d5e", background: r.ok ? "#3ddc8422" : "#ff4d5e22" } : { scale: 1, borderColor: "#ffffff1a", background: "#ffffff05" }} transition={{ duration: 0.35, ease: EASE.overshoot }}>
              {r && (r.ok ? <I.check size={14} className="text-bull" stroke={3} /> : <I.x size={14} className="text-bear" stroke={3} />)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   25 · DRAG TO SLOT — сборка сетапа: магнит, защёлка, отказ
   ================================================================ */
const SLOTS = [
  { t: "Контекст", c: "#4cc3ff" },
  { t: "Сигнал", c: "#ffc34d" },
  { t: "Риск", c: "#3ddc84" },
];
const DCARDS = [
  { t: "Тренд", icon: I.trend, slot: 0, c: "#4cc3ff" },
  { t: "Объём", icon: I.bars, slot: 1, c: "#ffc34d" },
  { t: "Стоп", icon: I.shield, slot: 2, c: "#3ddc84" },
];

export function DragToSlot({ run, cue }: SceneProps) {
  const [scope] = useAnimate();
  const p = useParticles();
  const mvs = useRef(DCARDS.map(() => ({ x: motionValue(0), y: motionValue(0), s: motionValue(1), r: motionValue(0) })));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [placed, setPlaced] = useState<boolean[]>([false, false, false]);
  const [reject, setReject] = useState<number | null>(null);
  const placedRef = useRef(placed);
  placedRef.current = placed;

  const nearest = (i: number) => {
    const c = centerIn(cardRefs.current[i], scope.current);
    let best = -1, bd = 1e9;
    slotRefs.current.forEach((s, k) => {
      const sc = centerIn(s, scope.current);
      const d = Math.hypot(sc.x - c.x, sc.y - c.y);
      if (d < bd) { bd = d; best = k; }
    });
    return bd < 70 ? best : null;
  };

  const snapTo = async (i: number, k: number) => {
    const m = mvs.current[i];
    const c = centerIn(cardRefs.current[i], scope.current);
    const sc = centerIn(slotRefs.current[k], scope.current);
    animate(m.s, 0.92, SPRING.tap);
    animate(m.r, 0, SPRING.tap);
    await Promise.all([
      animate(m.x, m.x.get() + sc.x - c.x, { type: "spring", stiffness: 600, damping: 30 }),
      animate(m.y, m.y.get() + sc.y - c.y, { type: "spring", stiffness: 600, damping: 30 }),
    ]);
  };

  const drop = async (i: number) => {
    const k = nearest(i);
    setHover(null);
    const m = mvs.current[i];
    if (k !== null && DCARDS[i].slot === k && !placedRef.current[k]) {
      await snapTo(i, k);
      sfx.snap();
      const sc = centerIn(slotRefs.current[k], scope.current);
      p.ring(sc.x, sc.y, SLOTS[k].c, 80, 0.5, 6);
      p.burst({ x: sc.x, y: sc.y, count: 24, colors: [SLOTS[k].c, "#fff"], speed: [100, 300] });
      const np = placedRef.current.map((v, j) => (j === k ? true : v));
      placedRef.current = np;
      setPlaced(np);
      if (np.every(Boolean)) {
        await sleep(200);
        sfx.success();
        p.burst({ x: 150, y: 120, count: 60, shape: "confetti", colors: ["#4cc3ff", "#ffc34d", "#3ddc84"], speed: [200, 450], gravity: 500, life: [1.2, 2], size: [3, 5], spread: 2.4 });
      }
    } else {
      if (k !== null) {
        // ОТКАЗ: слот «мотает головой», карта отлетает домой
        setReject(k);
        sfx.error();
        window.setTimeout(() => setReject(null), 450);
      }
      animate(m.s, 1, SPRING.panel);
      animate(m.r, 0, SPRING.panel);
      await Promise.all([animate(m.x, 0, { type: "spring", stiffness: 300, damping: 18 }), animate(m.y, 0, { type: "spring", stiffness: 300, damping: 18 })]);
    }
  };

  const demoMove = async (i: number, k: number) => {
    const m = mvs.current[i];
    sfx.tap();
    animate(m.s, 1.12, SPRING.tap);
    animate(m.r, -6, SPRING.tap);
    const c = centerIn(cardRefs.current[i], scope.current);
    const sc = centerIn(slotRefs.current[k], scope.current);
    const tx = m.x.get() + sc.x - c.x, ty = m.y.get() + sc.y - c.y;
    // дуга: сначала вверх, потом к цели — живая траектория пальца
    await Promise.all([
      animate(m.x, [m.x.get(), tx * 0.5, tx + 6], { duration: 0.7, ease: EASE.camera }),
      animate(m.y, [m.y.get(), ty * 0.5 - 40, ty + 4], { duration: 0.7, ease: EASE.camera }),
    ]);
    setHover(nearest(i));
    await sleep(150);
    await drop(i);
  };

  useScript(run, async (wait) => {
    mvs.current.forEach((m) => { m.x.set(0); m.y.set(0); m.s.set(1); m.r.set(0); });
    placedRef.current = [false, false, false];
    setPlaced([false, false, false]);
    await wait(700);
    cue();
    await demoMove(0, 0);
    await wait(300);
    await demoMove(1, 2); // ошибка
    await wait(300);
    await demoMove(1, 1);
    await wait(300);
    await demoMove(2, 2);
  });

  const done = placed.every(Boolean);
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff8a3d" />
      <div className="absolute inset-x-5 top-11">
        <div className="font-display text-sm font-bold">Собери сетап</div>
        <div className="text-[10px] text-white/45">Перетащи карты в слоты</div>
      </div>
      <div className="glass absolute inset-x-4 top-[90px] rounded-3xl p-4">
        <div className="relative flex justify-between">
          <svg className="pointer-events-none absolute inset-x-8 top-[38px] h-2 w-[calc(100%-64px)]" preserveAspectRatio="none" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" stroke="#ffffff1a" strokeWidth="2" strokeDasharray="3 3" />
            <motion.line x1="0" y1="1" x2="100" y2="1" stroke="#ff8a3d" strokeWidth="2" initial={false} animate={{ pathLength: done ? 1 : 0 }} transition={{ duration: 0.6 }} />
          </svg>
          {SLOTS.map((s, k) => (
            <div key={k} className="flex flex-col items-center gap-1.5">
              <motion.div
                ref={(el) => { slotRefs.current[k] = el; }}
                className="relative grid h-[84px] w-[64px] place-items-center rounded-xl border-2 border-dashed"
                animate={
                  reject === k
                    ? { x: [0, -8, 8, -5, 5, 0], borderColor: "#ff4d5e" }
                    : { x: 0, scale: hover === k ? 1.1 : 1, borderColor: placed[k] ? s.c : hover === k ? s.c : "#ffffff26", background: hover === k ? `${s.c}1c` : "#00000000" }
                }
                transition={reject === k ? { duration: 0.4 } : SPRING.tap}
              >
                {!placed[k] && <span className="text-[9px] font-bold text-white/30">пусто</span>}
                {hover === k && <span className="pulse-ring absolute inset-0 rounded-xl border-2" style={{ borderColor: s.c }} />}
              </motion.div>
              <span className="text-[10px] font-bold" style={{ color: s.c }}>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: EASE.snap }} className="absolute inset-x-6 top-[260px] rounded-2xl border border-[#ff8a3d]/50 bg-[#ff8a3d]/15 p-3 text-center">
            <div className="font-display text-lg font-black text-[#ff8a3d]">Сетап собран</div>
            <div className="text-[11px] text-white/60">Контекст + сигнал + риск = решение</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* hand */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center gap-5">
        {DCARDS.map((c, i) => {
          const m = mvs.current[i];
          return (
            <motion.div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              drag={!placed[c.slot]}
              dragMomentum={false}
              onDragStart={() => { sfx.tap(); animate(m.s, 1.12, SPRING.tap); animate(m.r, -6, SPRING.tap); }}
              onDrag={() => setHover(nearest(i))}
              onDragEnd={() => drop(i)}
              style={{ x: m.x, y: m.y, scale: m.s, rotate: m.r, zIndex: 20, background: `linear-gradient(160deg, ${c.c}, #1a2440 60%)` }}
              className="relative h-[80px] w-[60px] cursor-grab touch-none rounded-xl p-[2px] shadow-[0_12px_24px_-8px_#000] active:cursor-grabbing"
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 rounded-[10px] bg-[#0c1428]">
                <span style={{ color: c.c }}><c.icon size={20} /></span>
                <span className="text-[9px] font-bold">{c.t}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   26 · PULL TO REFRESH — свечи растут от натяжения
   ================================================================ */
const FEED0 = [
  { t: "Крупный кошелёк перевёл $18M на биржу", k: "Ончейн", c: "#4cc3ff" },
  { t: "Аналитики: вероятность роста BTC до 72k", k: "Аналитика", c: "#9b7bff" },
  { t: "Соцсети: растёт интерес к альткоинам", k: "Соцсети", c: "#ff6bd6" },
  { t: "ФРС оставила ставку без изменений", k: "Новости", c: "#ffc34d" },
];
const FEED_NEW = [
  { t: "Ликвидации шортов: $240M за час", k: "Ончейн", c: "#ff4d5e", fresh: true },
  { t: "Объём на споте вырос на 38%", k: "Метрики", c: "#3ddc84", fresh: true },
];

export function PullRefresh({ run, cue }: SceneProps) {
  const pull = useMotionValue(0);
  const listY = useTransform(pull, (v) => (v <= 0 ? 0 : 150 * (1 - Math.exp(-v / 170))));
  const prog = useTransform(listY, (v) => Math.min(1, v / 92));
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState<{ t: string; k: string; c: string; fresh?: boolean }[]>(FEED0);
  const [ready, setReady] = useState(false);
  const candleH = [0, 1, 2, 3, 4].map((i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(prog, (v) => Math.max(0.08, Math.min(1, v * 5 - i)) * [16, 24, 12, 30, 20][i]),
  );
  const ringDash = useTransform(prog, (v) => `${v * 126} 126`);
  const wasReady = useRef(false);
  useMotionValueEvent(prog, "change", (v) => {
    const r = v >= 1;
    if (r !== wasReady.current) {
      wasReady.current = r;
      setReady(r);
      if (r) sfx.snap();
    }
  });

  const release = async () => {
    if (prog.get() >= 1 && !refreshing) {
      setRefreshing(true);
      sfx.whoosh(0.3);
      // удерживаем индикатор на «полке»
      await animate(pull, 110, { type: "spring", stiffness: 400, damping: 30 });
      await sleep(1300);
      setFeed([...FEED_NEW, ...FEED0.map((f) => ({ ...f, fresh: false }))]);
      sfx.success();
      setRefreshing(false);
      await animate(pull, 0, { type: "spring", stiffness: 300, damping: 26 });
    } else animate(pull, 0, { type: "spring", stiffness: 400, damping: 30 });
  };

  useScript(run, async (wait) => {
    setFeed(FEED0);
    pull.set(0);
    setRefreshing(false);
    await wait(700);
    cue();
    // неуверенное натяжение, отпускание, затем полное
    await animate(pull, 90, { duration: 0.6, ease: EASE.outExpo });
    await animate(pull, 0, { type: "spring", stiffness: 400, damping: 30 });
    await wait(300);
    await animate(pull, 320, { duration: 0.9, ease: [0.3, 0, 0.3, 1] });
    await wait(150);
    await release();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff8a3d" />
      <div className="absolute inset-x-4 top-11 z-10 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Мультиисточники</div>
        <I.news size={16} className="text-white/50" />
      </div>
      {/* indicator */}
      <div className="absolute inset-x-0 top-[80px] flex flex-col items-center">
        <div className="relative grid h-12 w-12 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff14" strokeWidth="3" />
            <motion.circle cx="24" cy="24" r="20" fill="none" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" style={{ strokeDasharray: ringDash }} />
          </svg>
          <div className="flex h-8 items-end gap-[3px]">
            {candleH.map((h, i) => (
              <motion.div
                key={i}
                className="w-[4px] rounded-sm"
                style={{ height: refreshing ? undefined : h, background: i % 2 ? "#ff4d5e" : "#3ddc84", boxShadow: `0 0 6px ${i % 2 ? "#ff4d5e" : "#3ddc84"}` }}
                animate={refreshing ? { height: [8, 26, 12, 30, 8] } : {}}
                transition={refreshing ? { duration: 0.7, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" } : undefined}
              />
            ))}
          </div>
        </div>
        <div className="mt-1.5 text-[10px] font-bold text-white/50">{refreshing ? "Синхронизация…" : ready ? "Отпусти" : "Потяни вниз"}</div>
      </div>
      {/* list */}
      <motion.div
        className="absolute inset-x-3 bottom-0 top-[76px] touch-none space-y-2 rounded-t-3xl bg-[#0a1122] p-3 shadow-[0_-20px_40px_-10px_#000]"
        style={{ y: listY }}
        onPan={(_, info) => !refreshing && pull.set(Math.max(0, info.offset.y))}
        onPanEnd={() => release()}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/20" />
        <AnimatePresence initial={false}>
          {feed.map((f, i) => (
            <motion.div
              key={f.t}
              layout
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: f.fresh ? i * 0.08 : 0, ...SPRING.panel }}
              className="relative flex gap-3 overflow-hidden rounded-2xl bg-[#f3f6ff] p-3 text-[#0c1428]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${f.c}33`, color: f.c }}>
                <I.news size={16} />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: f.c }}>{f.k}</div>
                <div className="text-[11.5px] font-bold leading-snug">{f.t}</div>
              </div>
              {f.fresh && <motion.div className="absolute inset-0 bg-[#ff8a3d]" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ delay: i * 0.08 + 0.1, duration: 0.8 }} />}
              {f.fresh && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff8a3d]" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ================================================================
   27 · COACHMARK SPOTLIGHT — прожектор обучения, морфящая маска
   ================================================================ */
const STEPS = [
  { x: 14, y: 44, w: 272, h: 40, r: 20, t: "Твой прогресс и монеты. Растут за качество решений.", below: true },
  { x: 14, y: 100, w: 272, h: 170, r: 18, t: "Реальный исторический график. Будущее скрыто до решения.", below: true },
  { x: 14, y: 286, w: 272, h: 96, r: 18, t: "Карты навыков. Выбери, что важно в этой ситуации.", below: true },
  { x: 40, y: 530, w: 220, h: 52, r: 26, t: "Когда готов — принимай решение.", below: false },
];

export function Coachmark({ run, cue }: SceneProps) {
  const [step, setStep] = useState(0);
  const [on, setOn] = useState(false);
  const [tapK, setTapK] = useState(0);
  useScript(run, async (wait) => {
    setOn(false);
    setStep(0);
    await wait(600);
    cue();
    setOn(true);
    sfx.whoosh(0.3);
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      if (i) sfx.pop(i * 3);
      await wait(900);
      setTapK((k) => k + 1);
      await wait(900);
    }
    await wait(300);
    setOn(false);
  });
  const s = STEPS[step];
  const tipY = s.below ? s.y + s.h + 14 : s.y - 92;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg />
      {/* mock UI */}
      <div className="glass absolute inset-x-[14px] top-[44px] flex h-10 items-center gap-2 rounded-full px-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-bull/20 text-[10px] font-black text-bull">12</div>
        <div className="h-2 flex-1 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-bull" /></div>
        <div className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">1 240</div>
      </div>
      <div className="glass absolute inset-x-[14px] top-[100px] h-[170px] rounded-2xl p-3">
        <div className="text-[10px] font-bold text-white/40">BTC/USDT · 15M</div>
        <Candles data={genCandles(20, 8)} w={246} h={130} grow={false} highlight={19} />
      </div>
      <div className="absolute inset-x-[14px] top-[286px] grid h-[96px] grid-cols-4 gap-2">
        {[I.trend, I.bars, I.shield, I.clock].map((Ic, i) => (
          <div key={i} className="glass grid place-items-center rounded-xl text-teal"><Ic size={22} /></div>
        ))}
      </div>
      <div className="absolute inset-x-[14px] top-[396px] space-y-2">
        <div className="glass h-12 rounded-xl" />
        <div className="glass h-12 rounded-xl" />
      </div>
      <div className="absolute left-[40px] right-[40px] top-[530px] grid h-[52px] place-items-center rounded-full bg-teal font-display text-sm font-bold text-[#022]">РЕШЕНИЕ</div>
      {/* overlay with morphing hole */}
      <motion.svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 624" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.4 }}>
        <defs>
          <mask id="cm-hole">
            <rect width="300" height="624" fill="#fff" />
            <motion.rect fill="#000" initial={false} animate={{ x: s.x - 4, y: s.y - 4, width: s.w + 8, height: s.h + 8, rx: s.r + 4 }} transition={{ type: "spring", stiffness: 180, damping: 22 }} />
          </mask>
        </defs>
        <rect width="300" height="624" fill="#03060ecc" mask="url(#cm-hole)" />
      </motion.svg>
      {on && (
        <>
          <motion.div
            className="pointer-events-none absolute border-2 border-teal"
            initial={false}
            animate={{ left: s.x - 4, top: s.y - 4, width: s.w + 8, height: s.h + 8, borderRadius: s.r + 4 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ boxShadow: "0 0 24px #2ee6c5, inset 0 0 18px #2ee6c555" }}
          />
          <motion.div className="pointer-events-none absolute inset-x-5" initial={false} animate={{ top: tipY }} transition={{ type: "spring", stiffness: 200, damping: 24 }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: s.below ? -10 : 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: EASE.outExpo }} className="relative rounded-2xl bg-[#f3f6ff] p-3 text-[#0c1428] shadow-[0_20px_40px_-10px_#000]">
                <div className={`absolute left-1/2 h-3 w-3 -ml-1.5 rotate-45 bg-[#f3f6ff] ${s.below ? "-top-1.5" : "-bottom-1.5"}`} />
                <div className="flex items-start gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal text-[11px] font-black">{step + 1}</span>
                  <div className="text-[12px] font-bold leading-snug">{s.t}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                      <motion.div key={i} className="h-1.5 rounded-full" animate={{ width: i === step ? 16 : 6, background: i === step ? "#16b89c" : "#0c142833" }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#16b89c]">Далее →</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          {/* finger */}
          <motion.div className="pointer-events-none absolute h-8 w-8" initial={false} animate={{ left: s.x + s.w * 0.7, top: s.y + s.h * 0.55 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
            <motion.div key={tapK} className="absolute inset-0 rounded-full border-2 border-white" initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.6 }} />
            <motion.div key={`f${tapK}`} className="absolute inset-1.5 rounded-full bg-white/90 shadow-[0_0_16px_#fff]" initial={{ scale: 1 }} animate={{ scale: [1, 0.7, 1] }} transition={{ duration: 0.3 }} />
          </motion.div>
        </>
      )}
    </div>
  );
}
