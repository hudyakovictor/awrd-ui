import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton } from "../ui/kit";
import { S, E, feel, useImpact, Particles, useCount } from "../lib/motion";
import { IcStar, IcCoinMark, IcGem, IcCards, IcCheck, IcLock, IcFlame, IcArrow, IcCrown, ArtCard, ArtPack } from "../ui/icons";

/* =====================================================================
   АССЕТ 07 · PACK OPENING — кинематик открытия пака карт
   Фазы: idle → charge(сжатие) → rip(вспышка+импакт) → веер → флип редкости
   ===================================================================== */
const PACK = [
  { r: "rare" as const, name: "ОБЪЁМ", seed: 3 },
  { r: "common" as const, name: "ТРЕНД", seed: 7 },
  { r: "legend" as const, name: "КИТ", seed: 11 },
  { r: "epic" as const, name: "ФЛЭТ", seed: 5 },
  { r: "common" as const, name: "ШУМ", seed: 9 },
];
const RCOLOR = { common: "#5b7799", rare: "#3ec9a7", epic: "#9d8cf5", legend: "#f2c14e" };
const RNAME = { common: "ОБЫЧНАЯ", rare: "РЕДКАЯ", epic: "ЭПИК", legend: "ЛЕГЕНДА" };

export function PackOpening({ live = true }: { live?: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [focus, setFocus] = useState<number | null>(null);
  const imp = useImpact();
  const burst = useRef<any>(null);
  const timers = useRef<any[]>([]);

  const reset = () => { setPhase(0); setFlipped([]); setFocus(null); };

  const open = () => {
    if (phase !== 0) return;
    setPhase(1); feel("sweep", 20);
    timers.current.push(setTimeout(() => {
      setPhase(2);
      imp.fire(20, 0.5); feel("reward", [14, 30, 14]);
      burst.current?.(160, 300, { n: 70, power: 15, square: true, colors: ["#f2c14e", "#3ec9a7", "#9d8cf5", "#eaf2ff"] });
    }, 900));
    timers.current.push(setTimeout(() => setPhase(3), 1500));
  };

  useEffect(() => {
    if (!live) return;
    const cycle = setInterval(() => { reset(); setTimeout(open, 600); }, 9000);
    const t = setTimeout(open, 900);
    return () => { clearInterval(cycle); clearTimeout(t); timers.current.forEach(clearTimeout); };
  }, [live]);

  const flip = (i: number) => {
    if (flipped.includes(i)) { setFocus(i); feel("tap"); return; }
    setFlipped((f) => [...f, i]);
    const rare = PACK[i].r === "legend" || PACK[i].r === "epic";
    feel(rare ? "reward" : "confirm", rare ? [10, 20, 10] : 8);
    if (rare) {
      imp.fire(10, 0.3);
      burst.current?.(40 + i * 56, 330, { n: 28, power: 9, colors: [RCOLOR[PACK[i].r], "#eaf2ff"] });
    }
  };

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <div className="aurora opacity-50" />
        <Particles api={burst} />
        <TopHUD compact />

        {/* лучи из центра */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[46%] -z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 0.5, scale: 1, rotate: 360 }} exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.6, ease: E.out }, rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
              style={{ background: "conic-gradient(from 0deg, rgba(242,193,78,.35) 0 6deg, transparent 6deg 24deg)", borderRadius: "50%", maskImage: "radial-gradient(circle, #000 20%, transparent 70%)" }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-1 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-purple">Открытие пака</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">{phase < 2 ? "Пак сезона 1" : "5 новых карт"}</div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {phase < 2 ? (
              <motion.button
                key="pack"
                onClick={open}
                exit={{ scale: 0, opacity: 0, filter: "blur(10px)" }}
                animate={phase === 1 ? { scale: [1, 0.82, 1.14], rotate: [0, -6, 6, -3, 0], y: [0, 8, -10] } : { y: [0, -10, 0] }}
                transition={phase === 1 ? { duration: 0.9, ease: E.io } : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <motion.span className="absolute -inset-8 -z-10 rounded-full bg-purple/30 blur-3xl"
                  animate={{ opacity: phase === 1 ? [0.4, 1] : [0.35, 0.7, 0.35], scale: phase === 1 ? [1, 1.6] : 1 }}
                  transition={{ duration: phase === 1 ? 0.9 : 3, repeat: phase === 1 ? 0 : Infinity }} />
                <ArtPack size={150} hue="#9d8cf5" />
                <motion.span
                  className="absolute inset-0 rounded-3xl"
                  animate={{ boxShadow: ["0 0 0px rgba(157,140,245,0)", "0 0 40px rgba(157,140,245,.8)", "0 0 0px rgba(157,140,245,0)"] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </motion.button>
            ) : (
              <motion.div key="cards" className="relative h-[150px] w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {PACK.map((c, i) => {
                  const mid = (PACK.length - 1) / 2;
                  const d = i - mid;
                  const isFlipped = flipped.includes(i);
                  return (
                    <motion.button
                      key={c.name}
                      onClick={() => flip(i)}
                      initial={{ y: 120, rotate: 0, x: 0, opacity: 0, scale: 0.5 }}
                      animate={{ y: Math.abs(d) * 9, x: d * 47, rotate: d * 9, opacity: 1, scale: isFlipped ? 1.05 : 1 }}
                      transition={{ ...S.pop, delay: 0.08 * i }}
                      whileHover={{ y: Math.abs(d) * 9 - 12 }}
                      style={{ zIndex: isFlipped ? 20 : 10 - Math.abs(d), perspective: 800, left: "50%", top: 8, marginLeft: -37 }}
                      className="absolute"
                    >
                      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: E.io }} style={{ transformStyle: "preserve-3d" }} className="relative h-[104px] w-[74px]">
                        {/* рубашка */}
                        <div className="absolute inset-0 rounded-[9px] border-[3px] border-[#3a4e73] bg-[#16233c]" style={{ backfaceVisibility: "hidden" }}>
                          <div className="grid h-full place-items-center text-[#3a4e73]"><IcCards size={26} /></div>
                        </div>
                        {/* лицо */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                          <ArtCard w={74} seed={c.seed} rarity={c.r} label={c.name} />
                          {(c.r === "legend" || c.r === "epic") && (
                            <motion.span className="absolute -inset-2 -z-10 rounded-xl blur-lg" style={{ background: RCOLOR[c.r] + "88" }}
                              animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                          )}
                        </div>
                      </motion.div>
                      {isFlipped && (
                        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
                          className="mt-1 text-center text-[8px] font-extrabold tracking-wider" style={{ color: RCOLOR[c.r] }}>
                          {RNAME[c.r]}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 mb-6 px-4">
          <AnimatePresence mode="wait">
            {phase < 2 ? (
              <motion.div key="b1" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
                <BigButton tone="gold" onClick={open}>ОТКРЫТЬ</BigButton>
                <div className="mt-2 text-center text-[9px] font-bold text-mist">Осталось паков: 3</div>
              </motion.div>
            ) : (
              <motion.div key="b2" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
                <div className="flex justify-center gap-1.5">
                  {PACK.map((c, i) => (
                    <motion.span key={i} animate={{ background: flipped.includes(i) ? RCOLOR[c.r] : "#2a354e", scale: flipped.includes(i) ? 1.25 : 1 }}
                      transition={S.pop} className="h-1.5 w-6 rounded-full" />
                  ))}
                </div>
                <BigButton tone="teal" onClick={() => setFlipped(PACK.map((_, i) => i))} icon={<IcArrow size={15} />}>
                  {flipped.length === PACK.length ? "ЗАБРАТЬ ВСЁ" : "ОТКРЫТЬ ВСЕ"}
                </BigButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* фокус-вид карты */}
        <AnimatePresence>
          {focus !== null && (
            <motion.div className="absolute inset-0 z-40 grid place-items-center bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFocus(null)}>
              <motion.div layoutId={`focus-${focus}`} initial={{ scale: 0.5, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={S.pop}>
                <ArtCard w={190} seed={PACK[focus].seed} rarity={PACK[focus].r} label={PACK[focus].name} />
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="mt-4 text-center">
                <div className="title-xl text-[18px] uppercase" style={{ color: RCOLOR[PACK[focus].r] }}>{RNAME[PACK[focus].r]}</div>
                <div className="mt-1 text-[10px] font-bold text-mist">Нажми, чтобы закрыть</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 08 · DAILY REWARDS — календарь серии с кинематикой забора
   ===================================================================== */
export function DailyRewards({ live = true }: { live?: boolean }) {
  const [day, setDay] = useState(3);
  const [taking, setTaking] = useState<number | null>(null);
  const burst = useRef<any>(null);
  const coins = useCount(1240 + day * 60);

  const days = [
    { d: 1, Icon: IcCoinMark, v: "60", tone: "#f2c14e" },
    { d: 2, Icon: IcStar, v: "120", tone: "#3ec9a7" },
    { d: 3, Icon: IcGem, v: "15", tone: "#9d8cf5" },
    { d: 4, Icon: IcCards, v: "ПАК", tone: "#5b9cd6" },
    { d: 5, Icon: IcCoinMark, v: "240", tone: "#f2c14e" },
    { d: 6, Icon: IcStar, v: "400", tone: "#3ec9a7" },
    { d: 7, Icon: IcCrown, v: "БОНУС", tone: "#e46a5f" },
  ];

  const take = (i: number) => {
    if (i !== day) return feel("deny", 18);
    setTaking(i); feel("reward", [10, 26, 10]);
    burst.current?.(40 + (i % 4) * 72, 250 + Math.floor(i / 4) * 110, { n: 34, power: 10 });
    setTimeout(() => { setDay((d) => (d >= 6 ? 0 : d + 1)); setTaking(null); }, 900);
  };

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => take(day), 3400);
    return () => clearInterval(t);
  }, [live, day]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD coins={Math.round(coins)} compact />

        <div className="mt-3 px-4 text-center">
          <motion.div animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 6, repeat: Infinity }} className="mx-auto w-fit">
            <ArtChestGlow day={day} />
          </motion.div>
          <div className="title-xl mt-2 text-[20px] uppercase">Ежедневная серия</div>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-coral/15 px-2.5 py-1 text-coral">
            <IcFlame size={13} /><span className="mono text-[11px] font-extrabold">{day} дней подряд</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 px-3">
          {days.map((x, i) => {
            const done = i < day;
            const active = i === day;
            const isTaking = taking === i;
            return (
              <motion.button
                key={x.d}
                onClick={() => take(i)}
                initial={{ y: 24, opacity: 0, scale: 0.7 }}
                animate={{
                  y: active ? -4 : 0, opacity: 1,
                  scale: isTaking ? [1, 1.3, 0.9, 1] : 1,
                  rotate: isTaking ? [0, -8, 8, 0] : 0,
                }}
                transition={isTaking ? { duration: 0.7 } : { ...S.pop, delay: i * 0.05 }}
                className={`relative aspect-square rounded-2xl p-1.5 ${i === 6 ? "col-span-1" : ""}`}
                style={{
                  background: done ? "linear-gradient(180deg,#22334d,#1a2740)" : active ? `linear-gradient(180deg,${x.tone}55,${x.tone}18)` : "linear-gradient(180deg,#1b2540,#161f36)",
                  boxShadow: active ? `0 0 0 2px ${x.tone}, 0 12px 24px -12px ${x.tone}` : "inset 0 0 0 1px rgba(255,255,255,.06)",
                  opacity: done ? 0.55 : 1,
                }}
              >
                <div className="text-[8px] font-extrabold text-mist">ДЕНЬ {x.d}</div>
                <div className="mt-0.5 grid place-items-center" style={{ color: done ? "#6f83a6" : x.tone }}>
                  <x.Icon size={22} />
                </div>
                <div className="mono text-[9px] font-extrabold">{x.v}</div>
                {done && (
                  <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={S.pop}
                    className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-teal text-[#06231c]"><IcCheck size={10} /></motion.span>
                )}
                {active && <motion.span className="absolute inset-0 rounded-2xl border-2 ring-out" style={{ borderColor: x.tone }} />}
                {!done && !active && <span className="absolute right-1 top-1 text-mist/50"><IcLock size={11} /></span>}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 px-4">
          <Panel className="p-3">
            <div className="flex items-center justify-between text-[10px] font-extrabold">
              <span className="text-mist">ДО СУНДУКА НЕДЕЛИ</span>
              <span className="mono text-gold">{7 - day} дн.</span>
            </div>
            <div className="mt-2"><Bar v={day} max={7} tone="#f2c14e" h={10} /></div>
          </Panel>
        </div>

        <div className="mt-auto mb-24 px-4">
          <BigButton tone="teal" onClick={() => take(day)} icon={<IcStar size={15} />}>ЗАБРАТЬ НАГРАДУ</BigButton>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

function ArtChestGlow({ day }: { day: number }) {
  return (
    <div className="relative">
      <motion.span className="absolute -inset-5 -z-10 rounded-full bg-gold/25 blur-2xl" animate={{ scale: [0.9, 1.2, 0.9] }} transition={{ duration: 3.4, repeat: Infinity }} />
      <svg width="110" height="86" viewBox="0 0 120 92" fill="none">
        <defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe089" /><stop offset="1" stopColor="#c98b17" /></linearGradient></defs>
        <rect x="18" y="40" width="84" height="40" rx="7" fill="#25395a" stroke="#0f1c2e" strokeWidth="3" />
        <motion.g animate={{ rotate: day >= 6 ? -24 : -6 }} transition={S.pop} style={{ transformOrigin: "20px 42px" }}>
          <path d="M18 42V32a42 42 0 0 1 84 0v10H18Z" fill="#2e4568" stroke="#0f1c2e" strokeWidth="3" />
          <rect x="18" y="34" width="84" height="8" fill="url(#chg)" />
        </motion.g>
        <rect x="52" y="40" width="16" height="22" rx="4" fill="url(#chg)" stroke="#8a5f12" strokeWidth="2" />
        <circle cx="60" cy="52" r="3" fill="#5a3d0a" />
      </svg>
    </div>
  );
}

/* =====================================================================
   АССЕТ 09 · LEVEL UP — экран повышения уровня с переливом XP
   ===================================================================== */
export function LevelUpScreen({ live = true }: { live?: boolean }) {
  const [lvl, setLvl] = useState(11);
  const [xp, setXp] = useState(0.34);
  const [flash, setFlash] = useState(false);
  const imp = useImpact();
  const burst = useRef<any>(null);

  const run = () => {
    setXp(1); feel("sweep");
    setTimeout(() => {
      setLvl((l) => l + 1); setXp(0.22); setFlash(true);
      imp.fire(16, 0.5); feel("reward", [12, 30, 12]);
      burst.current?.(160, 250, { n: 60, power: 13, square: true, colors: ["#f2c14e", "#3ec9a7", "#9d8cf5", "#eaf2ff"] });
      setTimeout(() => setFlash(false), 1600);
    }, 700);
  };

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(run, 900);
    const c = setInterval(() => { setXp(0.34); setTimeout(run, 400); }, 6000);
    return () => { clearTimeout(t); clearInterval(c); };
  }, [live]);

  const unlocks = [
    { t: "Режим «Марафон»", Icon: IcFlame, tone: "#e46a5f" },
    { t: "Слот колоды +1", Icon: IcCards, tone: "#3ec9a7" },
    { t: "Аватар «Аналитик»", Icon: IcCrown, tone: "#9d8cf5" },
  ];

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col items-center justify-center">
        <div className="aurora opacity-70" />
        <Particles api={burst} />
        <AnimatePresence>
          {flash && <motion.div className="absolute inset-0 z-20 bg-white" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
        </AnimatePresence>

        {/* лучи */}
        {flash && Array.from({ length: 16 }).map((_, i) => (
          <motion.span key={i} className="absolute h-28 w-[3px] origin-bottom rounded-full bg-gradient-to-t from-transparent to-gold"
            style={{ rotate: `${i * 22.5}deg`, bottom: "50%" }}
            initial={{ scaleY: 0, opacity: 1 }} animate={{ scaleY: [0, 1.8, 0], opacity: [1, 1, 0] }} transition={{ duration: 1, delay: i * 0.02 }} />
        ))}

        <div className="relative z-10 text-center">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[10px] font-extrabold uppercase tracking-[0.45em] text-gold">Новый уровень</motion.div>
          <div className="relative mx-auto mt-4 grid h-36 w-36 place-items-center">
            <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ background: "conic-gradient(from 0deg, rgba(62,201,167,.5), transparent 40%, rgba(242,193,78,.5) 70%, transparent)", borderRadius: "50%", filter: "blur(6px)" }} />
            <motion.div
              key={lvl}
              initial={{ scale: 0.3, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...S.pop, damping: 12 }}
              className="relative grid h-28 w-28 place-items-center"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <defs><linearGradient id="lvg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#54dcb6" /><stop offset="1" stopColor="#f2c14e" /></linearGradient></defs>
                <path d="M50 4 89 26v48L50 96 11 74V26L50 4Z" fill="url(#lvg)" stroke="#0f1c2e" strokeWidth="3" strokeLinejoin="round" />
                <path d="M50 12 82 30v40L50 88 18 70V30L50 12Z" fill="rgba(9,20,32,.55)" />
              </svg>
              <span className="mono relative text-[40px] font-extrabold" style={{ textShadow: "0 3px 0 rgba(0,0,0,.4)" }}>{lvl}</span>
            </motion.div>
          </div>
          <motion.div key={`t${lvl}`} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={S.pop} className="title-xl mt-3 text-[26px] uppercase">
            Уровень {lvl}
          </motion.div>
        </div>

        <div className="relative z-10 mt-5 w-full px-6">
          <Bar v={xp} tone="#3ec9a7" h={12} label={`${Math.round(xp * 1000)} / 1000 XP`} />
        </div>

        <div className="relative z-10 mt-6 w-full space-y-2 px-6">
          <div className="text-center text-[9px] font-extrabold uppercase tracking-[0.3em] text-mist">Открыто</div>
          {unlocks.map((u, i) => (
            <motion.div key={u.t} initial={{ x: -30, opacity: 0 }} animate={flash ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }} transition={{ ...S.pop, delay: 0.2 + i * 0.1 }}
              className="panel flex items-center gap-3 rounded-2xl px-3 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: u.tone + "22", color: u.tone }}><u.Icon size={17} /></span>
              <span className="flex-1 text-[12px] font-extrabold">{u.t}</span>
              <span className="text-teal"><IcCheck size={15} /></span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-6 w-full px-6"><BigButton tone="gold" onClick={run}>ПРОДОЛЖИТЬ</BigButton></div>
      </motion.div>
    </Phone>
  );
}
