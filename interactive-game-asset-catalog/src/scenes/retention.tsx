import { animate, AnimatePresence, motion, useAnimate, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import { Coin, CountUp, I, fmt } from "../components/kit";
import { EnergyPips, RarityFrame, Ring, RARITY } from "../components/ui";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys } from "../motion/tokens";
import { getSound, sfx } from "../motion/audio";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   24 · STREAK CALENDAR — серия дней и комбо-множитель
   ================================================================ */
export function StreakCalendar({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [done, setDone] = useState<number[]>([]);
  const [combo, setCombo] = useState(1);
  const [coins, setCoins] = useState(0);
  const today = 17;
  const claim = (i: number) => {
    if (done.includes(i) || i > today) return;
    cue();
    const seq = done.length === 0 ? [i - 2, i - 1, i].filter((x) => x >= 0 && x <= today && !done.includes(x)) : [i];
    setDone((d) => [...d, ...seq]);
    const m = Math.min(5, 1 + seq.length);
    setCombo(m);
    setCoins((c) => c + 40 * m);
    if (getSound()) sfx.coin(done.length);
  };
  useScript(run, async (wait) => {
    setDone([]); setCombo(1); setCoins(0);
    await wait(1400);
    claim(today - 2);
    await wait(420);
    claim(today - 1);
    await wait(420);
    claim(today);
    if (getSound()) sfx.level();
    const c = centerIn(scope.current, scope.current);
    anim(scope.current, shakeKeys(0.6, 10, 8, 1.4), { duration: 0.4 });
    p.burst({ x: c.x + 120, y: c.y + 190, count: 44, shape: "confetti", colors: ["#ffc34d", "#2ee6c5", "#9b7bff", "#ff4d5e"], speed: [200, 520], gravity: 420, drag: 1.4, life: [1.2, 2], size: [3, 5] });
  });
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div className="absolute inset-x-3 top-11 flex items-center justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">Серия</div>
          <div className="font-display text-xl font-black text-gold">
            <CountUp to={done.length} duration={0.5} run={done.length} /> дней
          </div>
        </div>
        <div className="glass flex h-9 items-center gap-1.5 rounded-full px-2.5">
          <Coin size={18} />
          <span className="font-display text-xs font-bold tabular-nums">{fmt(coins)}</span>
        </div>
      </div>
      <div className="absolute inset-x-3 top-[104px] grid grid-cols-7 gap-1.5">
        {Array.from({ length: 28 }).map((_, i) => {
          const isDone = done.includes(i);
          const future = i > today;
          const isToday = i === today;
          return (
            <motion.button
              key={i}
              onClick={() => claim(i)}
              initial={{ opacity: 0, rotateY: -90, scale: 0.6 }}
              animate={{
                opacity: future ? 0.25 : 1,
                rotateY: 0,
                scale: isDone ? 1 : isToday ? 1.06 : 1,
              }}
              transition={{ delay: i * 0.012, type: "spring", stiffness: 320, damping: 20 }}
              whileTap={{ scale: 0.88 }}
              className="relative grid aspect-square place-items-center rounded-lg border text-[9px] font-bold"
              style={{
                borderColor: isDone ? "#ffc34d" : isToday ? "#2ee6c5" : "#ffffff14",
                background: isDone ? "linear-gradient(160deg,#ffd76a,#d98a15)" : "linear-gradient(160deg,#16223f,#101a30)",
                boxShadow: isDone ? "0 0 14px -3px #ffc34d" : isToday ? "0 0 14px -3px #2ee6c5" : "none",
                color: isDone ? "#3a2200" : "#ffffff70",
              }}
            >
              {isDone ? <I.check size={13} stroke={3} /> : i + 1}
              {isToday && !isDone && <span className="pulse-ring absolute inset-0 rounded-lg border border-teal" />}
            </motion.button>
          );
        })}
      </div>
      {/* комбо */}
      <motion.div layout transition={SPRING.panel} className="glass absolute inset-x-3 top-[336px] rounded-2xl p-3" style={{ borderColor: `#ffc34d${combo > 1 ? "77" : "22"}` }}>
        <div className="flex items-center gap-3">
          <motion.div
            key={combo}
            initial={{ scale: 2.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3, ease: EASE.snap }}
            className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-b from-[#ffd76a] to-[#d98a15] font-display text-lg font-black text-[#3a2200]"
            style={{ boxShadow: "0 0 24px #ffc34d88" }}
          >
            ×{combo}
          </motion.div>
          <div className="flex-1">
            <div className="text-xs font-bold">Комбо-множитель</div>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} className="h-1.5 flex-1 rounded-full" animate={{ background: i < combo ? "#ffc34d" : "#ffffff1a" }} transition={{ delay: i * 0.05 }} />
              ))}
            </div>
            <div className="mt-1 text-[10px] text-white/50">Три дня подряд = ×3 к награде</div>
          </div>
        </div>
      </motion.div>
      <div className="absolute inset-x-3 bottom-6 flex items-center gap-3 rounded-2xl border border-gold/25 bg-gold/10 p-3">
        <img src={hood} className="mask-soft h-11 w-11 rounded-full object-cover" />
        <div className="text-[11px] leading-tight text-white/70">Серия работает на привычку. Пропуск дня сбрасывает множитель — и это честно.</div>
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   25 · QUEST BOARD — выполнение с притягиванием награды
   ================================================================ */
const QUESTS = [
  { id: 1, t: "Пройди 3 сценария", d: "Арена · любой таймфрейм", goal: 3, r: 60, c: "#2ee6c5", icon: I.swords },
  { id: 2, t: "Держи риск до 50%", d: "Калькулятор риска", goal: 1, r: 45, c: "#ffc34d", icon: I.shield },
  { id: 3, t: "Разбери 2 ошибки", d: "Академия · разбор", goal: 2, r: 80, c: "#9b7bff", icon: I.brain },
];

export function QuestBoard({ run, cue }: SceneProps) {
  const [scope] = useAnimate();
  const p = useParticles();
  const [st, setSt] = useState(QUESTS.map(() => ({ n: 0, done: false, claimed: false })));
  const [coins, setCoins] = useState(0);
  const flyTarget = useRef<HTMLDivElement>(null);
  const claim = (i: number) => {
    if (!st[i].done || st[i].claimed) return;
    cue();
    setSt((s) => s.map((x, k) => (k === i ? { ...x, claimed: true } : x)));
    setCoins((c) => c + QUESTS[i].r);
    if (getSound()) sfx.coin(0);
  };
  useScript(run, async (wait) => {
    setSt(QUESTS.map(() => ({ n: 0, done: false, claimed: false })));
    setCoins(0);
    await wait(1500);
    // квест 1 заполняется
    for (let k = 1; k <= 3; k++) {
      await wait(320);
      setSt((s) => s.map((x, i) => (i === 0 ? { ...x, n: k } : x)));
      if (getSound()) sfx.tick();
    }
    await wait(300);
    setSt((s) => s.map((x, i) => (i === 0 ? { ...x, done: true } : x)));
    if (getSound()) sfx.success();
    await wait(900);
    cue();
    claim(0);
    const c = centerIn(scope.current, scope.current);
    p.burst({ x: c.x + 120, y: c.y + 150, count: 14, shape: "coin", size: [5, 7], speed: [180, 340], angle: -Math.PI / 2, spread: 2.4, gravity: 260, drag: 1.6, stagger: 0.04, target: { x: c.x + 240, y: c.y - 60 } });
    await wait(700);
    setSt((s) => s.map((x, i) => (i === 2 ? { ...x, n: 2, done: true } : x)));
    if (getSound()) sfx.unlock();
  });
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#2ee6c5" />
      <div className="absolute inset-x-3 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Миссии дня</div>
        <div ref={flyTarget} className="glass flex h-9 items-center gap-1.5 rounded-full px-2.5">
          <Coin size={18} />
          <motion.span key={coins} initial={{ scale: 1.5, color: "#ffc34d" }} animate={{ scale: 1, color: "#ffffff" }} transition={SPRING.reward} className="font-display text-xs font-bold tabular-nums">{fmt(coins)}</motion.span>
        </div>
      </div>
      <div className="absolute inset-x-3 top-[104px] space-y-2">
        {QUESTS.map((q, i) => {
          const s = st[i];
          const pct = s.n / q.goal;
          return (
            <motion.div
              key={q.id}
              layout
              transition={SPRING.layout}
              animate={s.claimed ? { scale: 0.97, opacity: 0.45 } : { scale: 1, opacity: 1 }}
              className="glass relative overflow-hidden rounded-2xl p-3"
              style={{ borderColor: s.done && !s.claimed ? `${q.c}88` : undefined, boxShadow: s.done && !s.claimed ? `0 0 24px -6px ${q.c}` : "none" }}
            >
              <div className="flex items-center gap-3">
                <motion.div layout="position" className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${q.c}22`, color: q.c }}>
                  <q.icon size={19} />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">{q.t}</div>
                  <div className="text-[10px] text-white/45">{q.d}</div>
                </div>
                {s.done && !s.claimed ? (
                  <motion.button
                    onClick={() => claim(i)}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={SPRING.reward}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-black text-black"
                    style={{ background: q.c, boxShadow: `0 4px 14px -4px ${q.c}` }}
                  >
                    <I.gem size={12} stroke={2.5} /> {q.r}
                  </motion.button>
                ) : (
                  <span className="font-mono text-[10px] tabular-nums" style={{ color: s.done ? q.c : "#ffffff44" }}>{s.n}/{q.goal}</span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div className="h-full rounded-full" style={{ background: q.c, boxShadow: `0 0 8px ${q.c}` }} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 20 }} />
              </div>
              {s.claimed && (
                <motion.div initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0" style={{ background: q.c }} />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="glass absolute inset-x-3 bottom-6 flex items-center gap-3 rounded-2xl p-3">
        <Ring value={st.filter((s) => s.claimed).length / 3} size={44} color="#2ee6c5">
          {st.filter((s) => s.claimed).length}/3
        </Ring>
        <div className="text-[11px] text-white/65">Выполни все три — откроется недельный кейс. Награда всегда видна заранее.</div>
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   26 · ACHIEVEMENT WALL — редкость и луч разблокировки
   ================================================================ */
const BADGES = [
  { t: "Первый шаг", r: "common", icon: I.play },
  { t: "10 решений", r: "common", icon: I.check },
  { t: "Хладнокровие", r: "rare", icon: I.heart },
  { t: "Глаз на объём", r: "rare", icon: I.bars },
  { t: "Без стопа", r: "epic", icon: I.shield },
  { t: "Ловец фомо", r: "epic", icon: I.flame },
  { t: "Тень рынка", r: "legend", icon: I.eye },
  { t: "Мастер риска", r: "mythic", icon: I.gem },
] as const;
const NEW_ID = 6;

export function AchievementWall({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [unlocked, setUnlocked] = useState<number[]>([0, 1, 2, 3]);
  const [focus, setFocus] = useState<number | null>(null);
  useScript(run, async (wait) => {
    setUnlocked([0, 1, 2, 3]);
    setFocus(null);
    await wait(1200);
    cue();
    setFocus(NEW_ID);
    setUnlocked((u) => [...u, NEW_ID]);
    if (getSound()) sfx.level();
    const el = (scope.current?.querySelector(`[data-b="${NEW_ID}"]`) as HTMLElement | null);
    const c = centerIn(el, scope.current);
    anim(scope.current, shakeKeys(0.55, 10, 8, 1.2), { duration: 0.4 });
    p.ring(c.x, c.y, RARITY[3].c, 130, 0.7, 8);
    p.burst({ x: c.x, y: c.y, count: 40, shape: "star", colors: [RARITY[3].c, "#fff"], speed: [160, 460], size: [2, 5], drag: 3 });
    await wait(1700);
    setFocus(null);
  });
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={RARITY[3].c} />
      <div className="absolute inset-x-0 top-11 text-center">
        <div className="text-[9px] uppercase tracking-[.3em] text-white/40">Коллекция достижений</div>
        <div className="font-display text-xl font-black">
          <CountUp to={unlocked.length} duration={0.5} run={unlocked.length} />
          <span className="text-white/35">/{BADGES.length}</span>
        </div>
      </div>
      <div className="absolute inset-x-4 top-[104px] grid grid-cols-4 gap-2">
        {BADGES.map((b, i) => {
          const has = unlocked.includes(i);
          const r = RARITY.find((x) => x.id === b.r)!;
          const isFocus = focus === i;
          return (
            <motion.div
              key={b.t}
              data-b={i}
              initial={false}
              animate={{
                scale: isFocus ? 1.18 : 1,
                filter: has ? "none" : "grayscale(1) brightness(.55)",
                zIndex: isFocus ? 20 : 1,
                y: isFocus ? -6 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ perspective: 500 }}
              className="relative"
            >
              <RarityFrame id={b.r} active={has} className="rounded-2xl">
                <motion.div
                  className="grid aspect-square place-items-center rounded-[14px] bg-[#0c1428]"
                  animate={isFocus ? { rotateY: [0, 360] } : { rotateY: 0 }}
                  transition={{ duration: 0.8, ease: EASE.outExpo }}
                >
                  <span style={{ color: r.c }}>
                    <b.icon size={20} />
                  </span>
                </motion.div>
              </RarityFrame>
              {isFocus && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-8 left-1/2 -ml-14 w-28 text-center text-[8px] font-bold leading-tight" style={{ color: r.c }}>
                  {b.t}
                </motion.div>
              )}
              {!has && (
                <div className="absolute inset-0 grid place-items-center">
                  <I.lock size={14} className="text-white/45" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {focus !== null && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={SPRING.panel} className="absolute inset-x-3 bottom-6">
            <RarityFrame id="legend" className="rounded-2xl">
              <div className="rounded-[14px] bg-gradient-to-b from-[#241a06] to-[#0c0a04] p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${RARITY[3].c}22`, color: RARITY[3].c }}>
                    <I.eye size={24} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-[.25em]" style={{ color: RARITY[3].c }}>ЛЕГЕНДАРНОЕ ОТКРЫТО</div>
                    <div className="font-display text-base font-black">Тень Рынка</div>
                    <div className="text-[10px] text-white/55">Видишь ложный пробой до того, как он случился</div>
                  </div>
                </div>
              </div>
            </RarityFrame>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   27 · ENERGY LOOP — капли энергии и таймер восстановления
   ================================================================ */
export function EnergyLoop({ run, cue }: SceneProps) {
  const [scope] = useAnimate();
  const p = useParticles();
  const [energy, setEnergy] = useState(5);
  const [cd, setCd] = useState(0);
  const prog = useMotionValue(1);
  useScript(run, async (wait) => {
    setEnergy(5);
    setCd(0);
    prog.set(1);
    await wait(900);
    cue();
    // трата энергии: 3 сценария
    for (let i = 0; i < 3; i++) {
      setEnergy((e) => Math.max(0, e - 1));
      if (getSound()) sfx.tap();
      const el = ((scope.current?.querySelectorAll("[data-pip]") as NodeListOf<HTMLElement>) || [])[energy - i - 1];
      const c = centerIn(el, scope.current);
      p.burst({ x: c.x, y: c.y, count: 8, shape: "dot", colors: ["#2ee6c5", "#fff"], speed: [60, 180], life: [0.3, 0.6] });
      await wait(520);
    }
    // восстановление: капля падает в пустую ячейку
    for (let i = 0; i < 3; i++) {
      await wait(700);
      setCd((c) => c + 1);
      const el = ((scope.current?.querySelectorAll("[data-pip]") as NodeListOf<HTMLElement>) || [])[energy + i];
      const c = centerIn(el, scope.current);
      p.burst({ x: c.x, y: c.y - 60, count: 3, shape: "dot", colors: ["#2ee6c5"], speed: [10, 40], size: [2, 3], target: c, onArrive: () => { setEnergy((e) => Math.min(5, e + 1)); if (getSound()) sfx.coin(0); } });
      prog.set(0);
      animate(prog, 1, { duration: 0.7, ease: "linear" });
    }
  });
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#2ee6c5" />
      <div className="absolute inset-x-0 top-11 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Энергия</div>
      <div className="absolute left-1/2 top-[92px] -ml-[70px]">
        <motion.div animate={{ scale: energy === 0 ? [1, 0.97, 1] : 1 }} transition={{ duration: 0.8, repeat: energy === 0 ? Infinity : 0 }}>
          <Ring value={Math.max(0.04, energy / 5)} size={140} w={9} color={energy === 0 ? "#ff4d5e" : "#2ee6c5"}>
            <div className="text-center">
              <div className="font-display text-3xl font-black">{energy}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40">/ 5</div>
            </div>
          </Ring>
        </motion.div>
      </div>
      <div className="absolute inset-x-6 top-[252px]">
        <div className="mb-2 flex items-center justify-between text-[10px] text-white/45">
          <span>Один сценарий = 1 капля</span>
          <span className="font-mono">+1 каждые 4 мин</span>
        </div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div data-pip key={i} className="relative">
              <EnergyPips total={1} filled={i < energy ? 1 : 0} color="#2ee6c5" />
              {i === energy && (
                <motion.div className="absolute -top-8 left-1/2 h-2 w-2 -ml-1 rounded-full bg-teal" animate={{ y: [0, 28], opacity: [1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn" }} style={{ boxShadow: "0 0 10px 3px #2ee6c5" }} />
              )}
            </div>
          ))}
        </div>
      </div>
      <motion.div layout transition={SPRING.panel} className="glass absolute inset-x-3 top-[336px] rounded-2xl p-3" style={{ borderColor: energy === 0 ? "#ff4d5e66" : undefined }}>
        <div className="flex items-center gap-3">
          <motion.div animate={energy === 0 ? { rotate: [0, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: energy === 0 ? "#ff4d5e22" : "#2ee6c522", color: energy === 0 ? "#ff4d5e" : "#2ee6c5" }}>
            <I.bolt size={20} />
          </motion.div>
          <AnimatePresence mode="popLayout">
            <motion.div key={energy === 0 ? "out" : "ok"} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={SPRING.panel} className="flex-1">
              <div className="text-xs font-bold">{energy === 0 ? "Энергия кончилась" : "Готов к сценарию"}</div>
              <div className="text-[10px] text-white/55">{energy === 0 ? "Энергия растёт даже офлайн — прогресс не останавливается." : "Один сценарий — одно осознанное решение."}</div>
            </motion.div>
          </AnimatePresence>
          <span className="font-mono text-xs font-bold" style={{ color: energy === 0 ? "#ff4d5e" : "#2ee6c5" }}>{energy === 0 ? `${3 - (cd % 4)}м` : "OK"}</span>
        </div>
      </motion.div>
      <div className="absolute inset-x-3 bottom-6 grid grid-cols-2 gap-2">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { if (energy > 0) { setEnergy((e) => e - 1); if (getSound()) sfx.tap(); } }} className="rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3 font-display text-xs font-black text-[#032a24]">ИГРАТЬ</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEnergy(5); setCd(0); if (getSound()) sfx.unlock(); }} className="rounded-2xl border border-white/15 py-3 font-display text-xs font-bold">ПОПОЛНИТЬ</motion.button>
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}
