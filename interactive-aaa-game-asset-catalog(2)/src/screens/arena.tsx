import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, Tag } from "../ui/kit";
import { S, feel, useImpact, useTimeline, useCount, Particles, rnd, useInterval } from "../lib/motion";
import {
  IcCandles, IcNews, IcList, IcWhale, IcCalendar, IcChat, IcPlus, IcTrend, IcShield, IcStar,
  IcLock, IcClock, IcSliders, IcArrow, IcCheck, IcClose, IcBolt, IcTarget, ArtCandleChart, IcCoinMark, IcTrophy, IcFlame, IcSwap, IcBank,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 01 · ARENA ROUND — полный игровой раунд
   Сценарий: вброс новости → выбор фактора → ответ → вердикт → выплата
   ===================================================================== */
const NEWS = [
  { t: "БИРЖА ЗАМОРОЗИЛА ВЫВОДЫ", tag: "ПАНИКА", tone: "#e46a5f", Icon: IcSwap },
  { t: "КИТ ПЕРЕВЁЛ 800 BTC", tag: "КИТ", tone: "#9d8cf5", Icon: IcWhale },
  { t: "РЕГУЛЯТОР: НОВЫЕ ПРАВИЛА", tag: "ФУНДАМЕНТ", tone: "#f2c14e", Icon: IcBank },
  { t: "ФЕД: ВСЁ ПОД КОНТРОЛЕМ", tag: "ШУМ", tone: "#3ec9a7", Icon: IcNews },
];

const FACTORS = [
  { id: "trend", label: "ТРЕНД", tone: "#5b9cd6", Icon: IcTrend },
  { id: "vol", label: "ОБЪЁМ", tone: "#f2c14e", Icon: IcStar },
  { id: "risk", label: "РИСК", tone: "#e46a5f", Icon: IcShield },
  { id: "wait", label: "ЖДАТЬ", tone: "#6f83a6", Icon: IcLock, locked: true },
];
const ANSWERS = [
  { id: "a", label: "Войти сразу", tone: "teal" as const, Icon: IcArrow, ok: false },
  { id: "b", label: "Ждать ретест и объём", tone: "sky" as const, Icon: IcClock, ok: true },
  { id: "c", label: "Старшие таймфреймы", tone: "ghost" as const, Icon: IcSliders, ok: false },
  { id: "d", label: "Увеличить позицию", tone: "coral" as const, Icon: IcTrend, ok: false },
];

export function ArenaRound({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(1);
  const [factor, setFactor] = useState("vol");
  const [picked, setPicked] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<null | "ok" | "bad">(null);
  const [time, setTime] = useState(1);
  const [xp, setXp] = useState(680);
  const imp = useImpact();
  const burst = useRef<any>(null);

  // Таймер раунда — питает и кольцо, и давление на игрока
  useEffect(() => {
    if (!live || picked) return;
    setTime(1);
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.max(0, 1 - (t - t0) / 14000);
      setTime(p);
      if (p > 0) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live, picked]);

  const answer = (a: (typeof ANSWERS)[number]) => {
    if (picked) return;
    setPicked(a.id);
    const ok = a.ok;
    setVerdict(ok ? "ok" : "bad");
    feel(ok ? "reward" : "deny", ok ? [10, 30, 10] : [30, 40, 30]);
    imp.fire(ok ? 9 : 16, 0.42);
    if (ok) {
      burst.current?.(160, 300, { n: 44, power: 11, colors: ["#3ec9a7", "#f2c14e", "#eaf2ff"], square: true });
      setTimeout(() => setXp((v) => v + 120), 500);
    }
    setTimeout(() => { setPicked(null); setVerdict(null); }, 3000);
  };

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="flex h-full flex-col">
        <TopHUD xp={xp} compact />
        <Particles api={burst} />

        {/* строка ситуации */}
        <motion.div
          key={String(picked)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center justify-center gap-2 px-4 text-center"
        >
          <span className="text-mist"><IcChat size={14} /></span>
          <span className="text-[11px] font-bold text-mist">Пробой без объёма. Объём молчит.</span>
        </motion.div>

        {/* окно терминала */}
        <div className="mt-2 px-3">
          <Panel className="overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 pt-2.5">
              {["#e46a5f", "#f2c14e", "#3ec9a7"].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c, opacity: .6 }} />)}
            </div>
            <div className="mt-1.5 flex items-center gap-1 px-2">
              {[IcCandles, IcNews, IcList, IcWhale, IcCalendar, IcChat].map((Ic, i) => (
                <button key={i} onClick={() => { feel("tap"); setTab(i); }} className="relative flex-1 rounded-t-lg px-1 py-2">
                  {tab === i && <motion.span layoutId="term-tab" transition={S.pop} className="absolute inset-0 rounded-t-lg border-x border-t border-teal/40 bg-teal/12" />}
                  <motion.span animate={{ color: tab === i ? "#3ec9a7" : "#61759a", scale: tab === i ? 1.08 : 1 }} className="relative mx-auto block w-fit"><Ic size={17} /></motion.span>
                </button>
              ))}
              <button className="grid h-7 w-7 place-items-center rounded-full border border-white/12 text-mist"><IcPlus size={13} /></button>
            </div>

            <div className="panel-sunk m-2 rounded-xl p-2">
              <AnimatePresence mode="wait">
                {tab === 1 ? (
                  <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                    {NEWS.map((n, i) => (
                      <motion.div
                        key={n.t}
                        initial={{ x: 26, opacity: 0, filter: "blur(6px)" }}
                        animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.1 + i * 0.08, ...S.soft }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center gap-2 rounded-xl border px-2 py-1.5 ${i === 2 ? "border-teal/60 bg-teal/8" : "border-white/8 bg-white/[0.03]"}`}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: n.tone + "26", color: n.tone }}><n.Icon size={15} /></span>
                        <span className="flex-1 text-[10px] font-extrabold uppercase leading-tight">{n.t}<span className="ml-1 font-bold text-mist/70">14:32</span></span>
                        <Tag tone={n.tone}>{n.tag}</Tag>
                        {i === 2 && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-teal" />}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : tab === 2 ? (
                  <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <OrderBook />
                  </motion.div>
                ) : (
                  <motion.div key="chart" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid h-[104px] place-items-center">
                    <ArtCandleChart w={250} h={100} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-1.5 px-2 pb-2">
              {["15М", "1Ч", "1Д"].map((tf, i) => (
                <div key={tf} className="panel-sunk flex flex-1 items-center gap-1 rounded-lg px-1.5 py-1">
                  <span className="mono text-[9px] font-bold text-mist">{tf}</span>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    <ArtCandleChart w={52} h={20} color={i === 2 ? "#3ec9a7" : "#5b9cd6"} />
                  </motion.span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* факторы */}
        <div className="mt-2.5 grid grid-cols-4 gap-2 px-3">
          {FACTORS.map((f, i) => {
            const on = factor === f.id;
            return (
              <motion.button
                key={f.id}
                onClick={() => { if (f.locked) return feel("deny", 24); feel("tap"); setFactor(f.id); }}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: f.locked ? 0.45 : 1 }}
                transition={{ delay: 0.25 + i * 0.06, ...S.pop }}
                whileTap={{ scale: 0.92, y: 2 }}
                className="relative aspect-[0.92] overflow-hidden rounded-2xl"
                style={{
                  background: `linear-gradient(170deg, ${f.tone}44, ${f.tone}12)`,
                  boxShadow: on ? `0 0 0 2px ${f.tone}, 0 10px 22px -10px ${f.tone}` : "inset 0 1px 0 rgba(255,255,255,.14), 0 6px 14px -8px #000",
                }}
              >
                {on && <motion.span layoutId="factor-glow" transition={S.pop} className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 22px ${f.tone}66` }} />}
                <span className="relative grid h-full place-items-center gap-1" style={{ color: f.locked ? "#8fa4c7" : "#fff" }}>
                  <motion.span animate={on ? { scale: [1, 1.18, 1], rotate: [0, -6, 0] } : {}} transition={{ duration: 0.5 }}><f.Icon size={22} /></motion.span>
                  <span className="text-[9px] font-extrabold tracking-wide">{f.label}</span>
                </span>
                {on && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop}
                    className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[#3c2a04]"><IcStar size={10} /></motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* таймер раунда */}
        <div className="mt-2.5 flex items-center gap-2 px-3">
          <span className="text-mist"><IcClock size={13} /></span>
          <Bar v={time} tone={time < 0.3 ? "#e46a5f" : "#3ec9a7"} h={5} />
          <span className="mono text-[10px] font-bold text-mist tabular-nums">{Math.ceil(time * 14)}с</span>
        </div>

        {/* ответы */}
        <div className="mt-2 grid grid-cols-2 gap-2 px-3">
          {ANSWERS.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ y: 22, opacity: 0 }}
              animate={{
                y: 0,
                opacity: picked && picked !== a.id ? 0.28 : 1,
                scale: picked === a.id ? 1.03 : 1,
              }}
              transition={{ delay: 0.35 + i * 0.07, ...S.pop }}
            >
              <BigButton tone={a.tone} icon={<a.Icon size={15} />} onClick={() => answer(a)} className="!py-2.5 !text-[11px] !normal-case">
                {a.label}
              </BigButton>
            </motion.div>
          ))}
        </div>

        {/* вердикт */}
        <AnimatePresence>
          {verdict && (
            <motion.div
              className="absolute inset-0 z-40 grid place-items-center px-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div className="absolute inset-0 backdrop-blur-[3px]"
                style={{ background: verdict === "ok" ? "rgba(6,35,28,.72)" : "rgba(44,9,6,.72)" }} />
              <motion.div
                initial={{ scale: 0.6, y: 40, rotate: verdict === "ok" ? -4 : 4 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.8, y: -30, opacity: 0 }}
                transition={S.pop}
                className="panel relative w-full rounded-3xl p-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.08 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                  style={{ background: verdict === "ok" ? "#3ec9a733" : "#e46a5f33", color: verdict === "ok" ? "#3ec9a7" : "#e46a5f" }}
                >
                  {verdict === "ok" ? <IcCheck size={34} /> : <IcClose size={34} />}
                  <motion.span className="absolute inset-0 rounded-full border-2 ring-out" style={{ borderColor: verdict === "ok" ? "#3ec9a7" : "#e46a5f" }} />
                </motion.div>
                <div className="title-xl mt-3 text-[22px] uppercase">{verdict === "ok" ? "Верно" : "Мимо"}</div>
                <p className="mt-1.5 text-[11px] font-bold leading-snug text-mist">
                  {verdict === "ok" ? "Объём не подтвердил пробой — ждать ретест было правильным решением." : "Вход без объёма = ловушка. Сначала подтверждение."}
                </p>
                {verdict === "ok" && (
                  <motion.div
                    initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, ...S.pop }}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-gold"
                  >
                    <IcStar size={14} /><span className="mono text-[12px] font-extrabold">+120 XP</span>
                    <span className="h-3 w-px bg-gold/40" /><IcCoinMark size={14} /><span className="mono text-[12px] font-extrabold">+40</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-[18px] flex-1" />
        <div className="h-[68px] shrink-0" />
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 02 · MATCH INTRO — кинематографичная сшибка перед боем
   ===================================================================== */
export function MatchIntro({ live = true }: { live?: boolean }) {
  const [tl] = useTimeline(4, [900, 800, 700, 1500], live);
  /* вне кадра таймлайн стоит — показываем финальную позу, а не пустой экран */
  const step = live ? tl : 3;
  const imp = useImpact();
  useEffect(() => { if (step === 2) { imp.fire(14, 0.4); feel("confirm"); } }, [step]);

  const Fighter = ({ side, name, rank, tone }: any) => (
    <motion.div
      initial={{ x: side * 260, rotate: side * 14, opacity: 0 }}
      animate={step >= 1 ? { x: 0, rotate: 0, opacity: 1 } : {}}
      transition={{ ...S.pop, damping: 15 }}
      className="relative flex flex-col items-center gap-2"
    >
      <div className="relative h-24 w-24">
        <motion.span className="absolute inset-0 rounded-3xl" style={{ background: tone + "22", boxShadow: `0 0 0 2px ${tone}66` }} animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 6, repeat: Infinity }} />
        <svg viewBox="0 0 100 100" className="relative h-full w-full p-3">
          <path d="M50 10 15 24v26c0 18 14 32 35 40 21-8 35-22 35-40V24L50 10Z" fill={tone + "33"} stroke={tone} strokeWidth="3" strokeLinejoin="round" />
          <path d="M34 54l12 12 22-24" stroke={tone} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
        </svg>
        <motion.span className="absolute -inset-3 -z-10 rounded-full blur-2xl" style={{ background: tone + "44" }} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }} />
      </div>
      <div className="text-[13px] font-extrabold uppercase">{name}</div>
      <div className="mono text-[9px] font-bold" style={{ color: tone }}>{rank}</div>
    </motion.div>
  );

  return (
    <Phone>
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
        <div className="aurora opacity-70" />
        <div className="mesh absolute inset-0 opacity-60" />
        {/* скоростные линии */}
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-[2px] rounded-full bg-white/35"
            style={{ top: `${8 + i * 6.4}%`, width: rnd(30, 120) }}
            animate={{ x: [-240, 360], opacity: [0, 0.8, 0] }}
            transition={{ duration: rnd(0.5, 1.1), repeat: Infinity, delay: rnd(0, 1.4), ease: "linear" }}
          />
        ))}

        <motion.div style={{ x: imp.x, y: imp.y }} className="relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="text-[9px] font-extrabold uppercase tracking-[0.4em] text-teal">Арена · Сезон 1</div>
            <div className="title-xl mt-1 text-[17px] uppercase text-white/90">Ранговый бой</div>
          </motion.div>

          <div className="flex items-center justify-around px-3">
            <Fighter side={-1} name="ТЫ" rank="ЗОЛОТО III" tone="#3ec9a7" />
            <div className="relative grid place-items-center">
              <AnimatePresence>
                {step >= 2 && (
                  <motion.div
                    initial={{ scale: 3.4, opacity: 0, filter: "blur(12px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ ...S.pop, damping: 12 }}
                    className="title-xl text-[40px] italic text-gold"
                    style={{ textShadow: "0 0 24px rgba(242,193,78,.7)" }}
                  >
                    VS
                  </motion.div>
                )}
              </AnimatePresence>
              {step >= 2 && <motion.span initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.7 }} className="absolute h-16 w-16 rounded-full border-2 border-gold" />}
            </div>
            <Fighter side={1} name="TRADER_K" rank="ЗОЛОТО II" tone="#9d8cf5" />
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={step >= 3 ? { y: 0, opacity: 1 } : {}}
            transition={S.soft}
            className="mt-10 px-6"
          >
            <Panel className="flex items-center justify-between px-4 py-3">
              {[{ l: "РАУНДЫ", v: "7" }, { l: "СТАВКА", v: "150" }, { l: "ЛИГА", v: "GOLD" }].map((x) => (
                <div key={x.l} className="text-center">
                  <div className="mono text-[13px] font-extrabold text-white">{x.v}</div>
                  <div className="text-[8px] font-bold tracking-widest text-mist">{x.l}</div>
                </div>
              ))}
            </Panel>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="mt-4">
              <BigButton tone="gold" icon={<IcBolt size={16} />}>НАЧАТЬ БОЙ</BigButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 03 · MATCH RESULT — экран итогов с выплатой
   ===================================================================== */
export function MatchResult({ live = true }: { live?: boolean }) {
  const [phase, setPhase] = useState(0);
  const burst = useRef<any>(null);
  const coins = useCount(phase >= 2 ? 1240 + 380 : 1240, 1.1);
  const xpv = phase >= 1 ? 0.92 : 0.18;

  useEffect(() => {
    if (!live) return;
    setPhase(0);
    const t = [
      setTimeout(() => { setPhase(1); feel("sweep"); }, 700),
      setTimeout(() => { setPhase(2); feel("reward"); burst.current?.(160, 210, { n: 50, power: 12, square: true, colors: ["#f2c14e", "#3ec9a7", "#eaf2ff", "#9d8cf5"] }); }, 1700),
      setTimeout(() => setPhase(3), 2600),
    ];
    return () => t.forEach(clearTimeout);
  }, [live]);

  const stats = [
    { l: "Верных решений", v: "6 / 7", Icon: IcTarget, tone: "#3ec9a7" },
    { l: "Лучшая серия", v: "×4", Icon: IcFlame, tone: "#e46a5f" },
    { l: "Средний отклик", v: "3.2 c", Icon: IcClock, tone: "#5b9cd6" },
  ];

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-50" />
        <Particles api={burst} />
        <TopHUD coins={Math.round(coins)} compact />

        <div className="relative z-10 mt-4 text-center">
          <motion.div
            initial={{ scale: 2.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ ...S.pop, damping: 13 }}
            className="mx-auto w-fit rounded-2xl border-2 border-gold px-5 py-1.5"
            style={{ boxShadow: "0 0 30px -4px rgba(242,193,78,.7)" }}
          >
            <span className="title-xl text-[26px] uppercase text-gold">Победа</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-mist">
            Арена · раунд 7 из 7
          </motion.div>
        </div>

        {/* трофей */}
        <motion.div
          initial={{ scale: 0.4, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ ...S.pop, delay: 0.15 }}
          className="relative z-10 mt-3 grid place-items-center"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
            <ArtTrophyWrap />
          </motion.div>
        </motion.div>

        {/* XP */}
        <div className="relative z-10 mt-4 px-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold">
            <span className="text-mist">УРОВЕНЬ 11</span>
            <motion.span
              key={String(phase >= 1)}
              initial={{ scale: 1.6, color: "#f2c14e" }} animate={{ scale: 1, color: "#8fa4c7" }}
              className="mono"
            >+{phase >= 1 ? 740 : 0} XP</motion.span>
          </div>
          <Bar v={xpv} tone="#3ec9a7" h={12} label={`${Math.round(xpv * 1000)} / 1000`} />
        </div>

        {/* награды */}
        <div className="relative z-10 mt-4 flex justify-center gap-3 px-4">
          {[{ Icon: IcCoinMark, v: "+380", tone: "#f2c14e" }, { Icon: IcStar, v: "+740", tone: "#3ec9a7" }, { Icon: IcTrophy, v: "+18", tone: "#9d8cf5" }].map((r, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, y: 30 }}
              animate={phase >= 2 ? { scale: 1, y: 0 } : {}}
              transition={{ ...S.pop, delay: 0.1 + i * 0.12 }}
              className="panel flex w-[86px] flex-col items-center gap-1 rounded-2xl py-3"
              style={{ boxShadow: `inset 0 0 0 1px ${r.tone}44, 0 10px 24px -14px ${r.tone}` }}
            >
              <span style={{ color: r.tone }}><r.Icon size={22} /></span>
              <span className="mono text-[12px] font-extrabold">{r.v}</span>
            </motion.div>
          ))}
        </div>

        {/* статистика */}
        <div className="relative z-10 mt-4 space-y-1.5 px-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ x: -24, opacity: 0 }}
              animate={phase >= 3 ? { x: 0, opacity: 1 } : {}}
              transition={{ ...S.soft, delay: i * 0.08 }}
              className="panel-sunk flex items-center gap-2 rounded-xl px-3 py-2"
            >
              <span style={{ color: s.tone }}><s.Icon size={15} /></span>
              <span className="flex-1 text-[11px] font-bold text-mist">{s.l}</span>
              <span className="mono text-[12px] font-extrabold">{s.v}</span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-auto mb-5 space-y-2 px-4">
          <BigButton tone="teal" icon={<IcArrow size={16} />}>ЕЩЁ БОЙ</BigButton>
          <BigButton tone="ghost">В ГЛАВНОЕ МЕНЮ</BigButton>
        </div>
      </div>
    </Phone>
  );
}

function ArtTrophyWrap() {
  return (
    <div className="relative">
      <motion.span
        className="absolute -inset-6 -z-10 rounded-full bg-gold/25 blur-2xl"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div className="absolute -inset-10 -z-10" animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        style={{ background: "conic-gradient(from 0deg, rgba(242,193,78,.28), transparent 30%, rgba(242,193,78,.28) 60%, transparent 90%)", borderRadius: "50%" }} />
      <svg width="104" height="104" viewBox="0 0 100 100" fill="none">
        <defs><linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe089" /><stop offset="1" stopColor="#c98b17" /></linearGradient></defs>
        <path d="M30 18h40v20c0 11-9 20-20 20s-20-9-20-20V18Z" fill="url(#tg2)" stroke="#8a5f12" strokeWidth="2.5" />
        <path d="M30 22H18v8c0 7 5 12 12 13M70 22h12v8c0 7-5 12-12 13" stroke="#c98b17" strokeWidth="5" strokeLinecap="round" />
        <rect x="43" y="57" width="14" height="14" rx="3" fill="#b8801a" />
        <rect x="28" y="70" width="44" height="11" rx="4" fill="url(#tg2)" stroke="#8a5f12" strokeWidth="2.5" />
        <path d="m50 26 3.4 7 7.6 1.1-5.5 5.3 1.3 7.6L50 43.4l-6.8 3.6 1.3-7.6-5.5-5.3 7.6-1.1L50 26Z" fill="#fff6d6" />
      </svg>
    </div>
  );
}


/* =====================================================================
   СТАКАН (order book) — живой слой ликвидности внутри терминала.
   Показывает приём: данные меняются каждые 900 мс, но интерфейс
   анимирует только ширину объёма и подсветку изменившейся строки.
   ===================================================================== */
function OrderBook() {
  const [rows, setRows] = useState(() => mkRows());
  useInterval(() => setRows(mkRows()), 900);
  const asks = rows.slice(0, 3);
  const bids = rows.slice(3);
  return (
    <div className="space-y-[3px]">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="mono text-[11px] font-extrabold">BTC/USDT</span>
        <span className="mono rounded-full bg-white/8 px-2 py-[2px] text-[8.5px] font-bold text-mist">СПРЕД 0.02%</span>
      </div>
      {asks.map((r) => <BookRow key={r.p} r={r} side="ask" />)}
      <motion.div
        initial={{ scaleX: 0.9, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={S.pop}
        className="relative flex items-center gap-1.5 overflow-hidden rounded-md bg-purple/35 px-1.5 py-[3px]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(157,140,245,.6)" }}
      >
        <span className="text-purple"><IcWhaleSmall /></span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">Китовая стена</span>
        <motion.span className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/25"
          animate={{ x: ["0%", "400%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} />
      </motion.div>
      {bids.map((r) => <BookRow key={r.p} r={r} side="bid" />)}
    </div>
  );
}
function mkRows() {
  const base = 67840;
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    p: base - i * (i < 3 ? 8 : 15),
    v: 0.28 + Math.random() * 0.7,
  }));
}
function BookRow({ r, side }: { r: { p: number; v: number }; side: "ask" | "bid" }) {
  const c = side === "ask" ? "#e46a5f" : "#3ec9a7";
  return (
    <div className="relative flex h-[19px] items-center overflow-hidden rounded-[5px] bg-white/[0.03]">
      <motion.div className="absolute inset-y-0 left-0" style={{ background: c + "33" }}
        animate={{ width: `${r.v * 46}%` }} transition={S.soft} />
      <motion.div className="absolute inset-y-0 right-0" style={{ background: c + "22" }}
        animate={{ width: `${r.v * 40}%` }} transition={{ ...S.soft, delay: 0.05 }} />
      <motion.span
        key={r.v.toFixed(2)}
        initial={{ color: c, scale: 1.08 }} animate={{ color: "#e9eefb", scale: 1 }} transition={{ duration: 0.5 }}
        className="mono relative mx-auto text-[10px] font-extrabold tabular-nums"
      >
        {r.p.toLocaleString("ru-RU")}
      </motion.span>
    </div>
  );
}
function IcWhaleSmall() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13c2.5 0 3.5-2 3.5-2s1.6 5.5 7 5.5c4 0 6.5-2.6 7.5-5.5-2 .6-3.6.2-4.6-.8" />
      <path d="M12.8 8.2c.6-2 2.4-3.2 4.2-3.2" />
    </svg>
  );
}
