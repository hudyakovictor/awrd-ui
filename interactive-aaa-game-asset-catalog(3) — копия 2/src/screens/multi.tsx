import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, BigButton, PillTabs, Tag } from "../ui/kit";
import { S, E, feel, useCount, useTimeline, Particles, useImpact, useInterval } from "../lib/motion";
import {
  RoomSlot, MilestoneRail, StatusChip, Spark, PowerGauge, SceneBackdrop, Dial, CardFace,
} from "../ui/art";
import {
  IcArrow, IcCheck, IcClose, IcCoinMark, IcFlame,
  IcGem, IcBolt, IcTrophy, IcCards, IcRefresh, IcWarn,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 38 · PARTY LOBBY — комната на четверых, готовность и старт
   ===================================================================== */
const PARTY = [
  { id: 1, name: "NOVA_K", seed: 2, tone: "#f2c14e", role: "лидер", ready: true },
  { id: 2, name: "ТЫ", seed: 4, tone: "#3ec9a7", role: "офицер", ready: true, you: true },
  { id: 3, name: "ЛИКВИД", seed: 6, tone: "#9d8cf5", role: "боец", ready: false },
  { id: 4, name: "СВЕЧКА", seed: 8, tone: "#5b9cd6", role: "боец", ready: false },
];

export function PartyLobby({ live = true }: { live?: boolean }) {
  const [ready, setReady] = useState([true, true, false, false]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const readyCount = ready.filter(Boolean).length;

  useInterval(() => {
    if (!live) return;
    setReady((r) => {
      const next = [...r];
      const i = next.findIndex((v) => !v);
      if (i >= 0) { next[i] = true; feel("confirm", 8); }
      else return [true, true, false, false];
      return next;
    });
  }, live ? 1500 : null);

  useEffect(() => {
    if (readyCount === 4 && countdown === null) {
      setCountdown(3);
      feel("sweep", 14);
    }
    if (readyCount < 4 && countdown !== null && countdown > 0) setCountdown(null);
  }, [readyCount]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown((c) => {
        const n = (c ?? 1) - 1;
        if (n === 0) {
          feel("reward", [14, 34, 14]); imp.fire(16, 0.5);
          burst.current?.(160, 300, { n: 40, power: 12, square: true, colors: ["#3ec9a7", "#f2c14e", "#eaf2ff"] });
        } else feel("tap", 10);
        return n;
      });
    }, 900);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#5b9cd6" alt="#3ec9a7" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 flex items-start justify-between px-4 pt-2">
          <div>
            <div className="title-xl text-[18px] uppercase">Комната</div>
            <div className="text-[9.5px] font-bold text-mist">Марафон · 4 игрока · ранговый</div>
          </div>
          <StatusChip t={readyCount === 4 ? "все готовы" : `${readyCount} / 4`} tone={readyCount === 4 ? "#3ec9a7" : "#f2c14e"} pulse={readyCount === 4} />
        </div>

        {/* код комнаты */}
        <div className="relative z-10 mt-2 px-3">
          <Panel className="flex items-center gap-2.5 p-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-mist"><IcCards size={16} /></span>
            <div className="flex-1">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">код комнаты</div>
              <div className="mono text-[15px] font-extrabold tracking-[0.28em]">A7K-2QX</div>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => feel("confirm")}
              className="rounded-xl border border-white/12 px-2.5 py-2 text-[9px] font-extrabold uppercase tracking-wider text-mist hover:text-white">
              копировать
            </motion.button>
          </Panel>
        </div>

        {/* состав */}
        <div className="relative z-10 mt-3 space-y-1.5 px-3">
          <LayoutGroup>
            {PARTY.map((p, i) => (
              <motion.div key={p.id} layout initial={{ x: -26, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.07, ...S.soft }}>
                <RoomSlot name={p.name} ready={ready[i]} you={(p as any).you} seed={p.seed} tone={p.tone} />
              </motion.div>
            ))}
          </LayoutGroup>
          <motion.div layout initial={{ x: -26, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, ...S.soft }}>
            <RoomSlot name="" ready={false} seed={0} empty />
          </motion.div>
        </div>

        {/* сила отряда */}
        <div className="relative z-10 mt-3 px-3">
          <Panel className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">сила отряда</span>
              <span className="mono text-[11px] font-extrabold text-gold">7 420</span>
            </div>
            <div className="mt-1.5"><PowerGauge v={7420} max={10000} tone="#f2c14e" w={222} /></div>
            <div className="mt-1.5 flex items-center gap-2">
              <Tag tone="#3ec9a7">баланс танк/дд</Tag>
              <Tag tone="#5b9cd6">общий бонус +12%</Tag>
            </div>
          </Panel>
        </div>

        {/* обратный отсчёт */}
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div className="absolute inset-0 z-30 grid place-items-center bg-black/60 backdrop-blur-[3px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div key={countdown}
                initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                transition={{ ...S.pop, damping: 13 }}
                className="title-xl text-[64px] text-teal" style={{ textShadow: "0 0 34px rgba(62,201,167,.6)" }}>
                {countdown}
              </motion.div>
            </motion.div>
          )}
          {countdown === 0 && (
            <motion.div className="absolute inset-0 z-30 grid place-items-center bg-teal/18"
              initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <motion.div initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={S.pop}
                className="title-xl text-[30px] uppercase text-teal">в бой</motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-auto mb-24 flex gap-2 px-3">
          <div className="flex-1"><BigButton tone="ghost" className="!py-2.5 !text-[11px]" icon={<IcRefresh size={13} />}>ПРИГЛАСИТЬ</BigButton></div>
          <div className="flex-1">
            <BigButton tone={ready[1] ? "teal" : "sky"} className="!py-2.5 !text-[11px]" icon={<IcCheck size={13} />}
              onClick={() => setReady((r) => r.map((v, i) => (i === 1 ? !v : v)))}>
              {ready[1] ? "ГОТОВ" : "НЕ ГОТОВ"}
            </BigButton>
          </div>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 39 · BATTLE HISTORY — история боёв с фильтрами и разбором
   ===================================================================== */
type Battle = { id: number; foe: string; win: boolean; pts: number; dmg: number; sig: number; dur: string; ts: string; tone: string; trend: number[] };
const BATTLES: Battle[] = [
  { id: 1, foe: "BEAR_WHALE", win: true, pts: 2450, dmg: 2450, sig: 130, dur: "3:42", ts: "12 мин назад", tone: "#3ec9a7", trend: [3, 5, 4, 6, 8, 7, 10] },
  { id: 2, foe: "FUD_GENERATOR", win: false, pts: 1120, dmg: 1120, sig: 62, dur: "2:08", ts: "48 мин назад", tone: "#e46a5f", trend: [8, 7, 6, 5, 4, 3, 2] },
  { id: 3, foe: "PUMP&DUMP BOT", win: true, pts: 1980, dmg: 1980, sig: 110, dur: "5:16", ts: "2 ч назад", tone: "#3ec9a7", trend: [2, 4, 3, 6, 5, 8, 9] },
  { id: 4, foe: "TRADER_K", win: true, pts: 2210, dmg: 2210, sig: 142, dur: "4:30", ts: "вчера", tone: "#3ec9a7", trend: [4, 5, 6, 5, 7, 8, 9] },
  { id: 5, foe: "СВЕЧКА", win: false, pts: 940, dmg: 940, sig: 48, dur: "1:52", ts: "вчера", tone: "#e46a5f", trend: [7, 6, 6, 5, 3, 4, 2] },
  { id: 6, foe: "HONEY_MIMIC", win: true, pts: 1760, dmg: 1760, sig: 96, dur: "3:12", ts: "2 дня назад", tone: "#3ec9a7", trend: [3, 4, 5, 4, 6, 7, 8] },
];

export function BattleHistory({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<number | null>(1);
  const [i] = useTimeline(BATTLES.length, 2000, live);
  useEffect(() => { if (live) setOpen(BATTLES[i].id); }, [i, live]);

  const list = tab === 0 ? BATTLES : tab === 1 ? BATTLES.filter((b) => b.win) : BATTLES.filter((b) => !b.win);
  const wins = BATTLES.filter((b) => b.win).length;
  const total = useCount(BATTLES.reduce((s, b) => s + b.pts, 0), 1.1);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#5b9cd6" alt="#3ec9a7" animate={live} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2">
          <div className="title-xl text-[19px] uppercase">История боёв</div>
          <div className="text-[9.5px] font-bold text-mist">Последние 6 боёв · тапни для разбора</div>
        </div>

        {/* сводка */}
        <div className="relative z-10 mt-3 flex items-center gap-2 px-3">
          <Panel className="flex flex-1 items-center gap-2.5 p-2.5">
            <Dial v={(wins / BATTLES.length) * 100} tone="#3ec9a7" size={58} thick={7} label={`${Math.round((wins / BATTLES.length) * 100)}%`} sub="побед" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-mist">очков</span>
                <span className="mono text-[11px] font-extrabold">{Math.round(total).toLocaleString("ru-RU")}</span>
              </div>
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-mist">сигналов</span>
                <span className="mono text-[11px] font-extrabold text-teal">{BATTLES.reduce((s, b) => s + b.sig, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-mist">среднее</span>
                <span className="mono text-[11px] font-extrabold text-gold">3:38</span>
              </div>
            </div>
          </Panel>
        </div>

        <PillTabs tabs={["ВСЕ", "ПОБЕДЫ", "ПОРАЖЕНИЯ"]} i={tab} set={setTab} tone="#5b9cd6" />

        <div className="no-bar relative z-10 flex-1 space-y-1.5 overflow-y-auto px-3 pb-24">
          <LayoutGroup>
            {list.map((b, k) => {
              const isOpen = open === b.id;
              return (
                <motion.div key={b.id} layout
                  initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: Math.min(k * 0.05, 0.25), ...S.soft }}
                  onClick={() => { feel("tap"); setOpen(isOpen ? null : b.id); }}
                  className="cursor-pointer overflow-hidden rounded-2xl"
                  style={{
                    background: isOpen ? `linear-gradient(170deg, ${b.tone}1c, #16213a)` : "#1a2338",
                    boxShadow: `inset 0 0 0 1px ${isOpen ? b.tone + "66" : "rgba(255,255,255,.05)"}`,
                  }}>
                  <motion.div layout className="flex items-center gap-2.5 p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                      style={{ background: b.tone + "22", color: b.tone }}>
                      {b.win ? <IcTrophy size={17} /> : <IcWarn size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[11.5px] font-extrabold">{b.foe}</span>
                        <StatusChip t={b.win ? "победа" : "поражение"} tone={b.tone} />
                      </div>
                      <div className="mt-0.5 text-[9px] font-bold text-mist">{b.ts} · {b.dur}</div>
                    </div>
                    <Spark data={b.trend} tone={b.tone} w={54} h={22} />
                    <span className="mono w-11 shrink-0 text-right text-[11px] font-extrabold tabular-nums">{b.pts}</span>
                  </motion.div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div layout initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ ...S.soft, damping: 28 }} className="overflow-hidden">
                        <div className="space-y-2 px-2.5 pb-2.5">
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { l: "урон", v: b.dmg, t: b.tone },
                              { l: "сигналы", v: b.sig, t: "#f2c14e" },
                              { l: "риск", v: b.win ? 12 : 28, t: "#9d8cf5" },
                            ].map((m) => (
                              <div key={m.l} className="rounded-xl bg-white/[0.05] py-1.5 text-center">
                                <div className="mono text-[11px] font-extrabold" style={{ color: m.t }}>{m.v}</div>
                                <div className="text-[7.5px] font-bold uppercase tracking-widest text-mist">{m.l}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-start gap-2 rounded-xl px-2 py-1.5"
                            style={{ background: b.win ? "#3ec9a714" : "#e46a5f14" }}>
                            <span className="mt-0.5" style={{ color: b.win ? "#3ec9a7" : "#e46a5f" }}>
                              {b.win ? <IcCheck size={12} /> : <IcClose size={12} />}
                            </span>
                            <span className="text-[9.5px] font-bold leading-snug text-mist">
                              {b.win ? "Объём подтвердил вход, цель достигнута с первого импульса." : "Вход без подтверждения объёма, стоп сработал на шуме."}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </LayoutGroup>
        </div>
        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 40 · STREAK — серия побед и вехи наград
   ===================================================================== */
const MILES = [
  { t: "Разогрев", v: "3" },
  { t: "Серия", v: "5" },
  { t: "Доминирование", v: "8" },
  { t: "Легенда", v: "12" },
  { t: "Миф", v: "20" },
];

export function StreakScreen({ live = true }: { live?: boolean }) {
  const [done, setDone] = useState(2);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const streak = useCount(done === 0 ? 0 : [0, 3, 5, 8, 12, 20][done], 1);
  const mult = [1, 1.15, 1.35, 1.6, 2, 2.6][done];

  const next = () => {
    setDone((d) => {
      const n = d >= MILES.length ? 0 : d + 1;
      if (n > d) {
        feel("reward", [10, 26, 10]); imp.fire(11, 0.38);
        burst.current?.(160, 210, { n: 30, power: 10, square: true, colors: ["#f2c14e", "#3ec9a7", "#eaf2ff"] });
      }
      return n;
    });
  };

  useInterval(() => { if (live) next(); }, live ? 2200 : null);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#f2c14e" alt="#e46a5f" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-gold">Серия побед</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Не останавливайся</div>
        </div>

        {/* главное число */}
        <div className="relative z-10 mt-4 grid place-items-center">
          <motion.div className="relative grid place-items-center"
            animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
            <svg width="180" height="180" viewBox="0 0 100 100" className="absolute">
              <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
              <motion.circle cx="50" cy="50" r="43" fill="none" stroke="#f2c14e" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={270} initial={{ strokeDashoffset: 270 }}
                animate={{ strokeDashoffset: 270 * (1 - done / MILES.length) }} transition={{ ...S.soft, damping: 24 }}
                style={{ filter: "drop-shadow(0 0 10px rgba(242,193,78,.5))", transform: "rotate(-90deg)", transformOrigin: "50px 50px" }} />
            </svg>
            <motion.div key={done} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={S.pop}
              className="relative grid place-items-center">
              <span className="title-xl text-[52px] leading-none text-gold">{Math.round(streak)}</span>
              <span className="mono text-[9px] font-extrabold uppercase tracking-[0.32em] text-mist">побед подряд</span>
            </motion.div>
          </motion.div>

          <motion.div className="mt-2 flex items-center gap-2"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatusChip t={`множитель ×${mult.toFixed(2)}`} tone="#f2c14e" pulse />
            <StatusChip t={`ещё ${MILES[Math.min(done, MILES.length - 1)].v} до вехи`} tone="#3ec9a7" />
          </motion.div>
        </div>

        {/* вехи */}
        <div className="relative z-10 mt-5 px-3">
          <MilestoneRail steps={MILES} done={Math.max(0, done - 1)} tone="#f2c14e" />
        </div>

        {/* награды за веху */}
        <div className="relative z-10 mt-5 space-y-1.5 px-3">
          <div className="px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">награды серии</div>
          {[
            { l: "Монеты за серию", v: `+${200 * Math.max(1, done)}`, I: IcCoinMark, tone: "#f2c14e", got: done > 0 },
            { l: "Множитель опыта", v: `×${mult.toFixed(2)}`, I: IcBolt, tone: "#3ec9a7", got: done > 1 },
            { l: "Ключ от сундука", v: done >= 4 ? "готов" : "заблокировано", I: IcGem, tone: "#9d8cf5", got: done >= 4 },
          ].map((r, k) => (
            <motion.div key={r.l} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: k * 0.07, ...S.soft }}
              className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2"
              style={{ background: r.got ? r.tone + "12" : "rgba(255,255,255,.025)", boxShadow: `inset 0 0 0 1px ${r.got ? r.tone + "33" : "transparent"}` }}>
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: r.tone + "22", color: r.got ? r.tone : "#5f7496" }}>
                <r.I size={15} />
              </span>
              <span className="flex-1 text-[11px] font-extrabold" style={{ color: r.got ? "#eaf2ff" : "#5f7496" }}>{r.l}</span>
              <span className="mono text-[11px] font-extrabold" style={{ color: r.got ? r.tone : "#5f7496" }}>{r.v}</span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-auto mb-24 px-3">
          <BigButton tone="gold" onClick={next} icon={<IcFlame size={15} />}>ПРОДОЛЖИТЬ СЕРИЮ</BigButton>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 41 · SKILL SELECT — выбор приза: три карты с раскрытием
   ===================================================================== */
const PICKS = [
  { t: "Импульс", d: "+18% к силе сигнала", r: "epic" as const, kind: 2 },
  { t: "Опора", d: "Стоп ближе на 12%", r: "rare" as const, kind: 0 },
  { t: "Прозрение", d: "Открывает один факт", r: "legend" as const, kind: 1 },
];

export function SkillSelect({ live = true }: { live?: boolean }) {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [picked, setPicked] = useState<number | null>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i); feel("reward", [10, 26, 10]); imp.fire(10, 0.36);
    burst.current?.(40 + i * 80, 260, { n: 28, power: 10, square: true, colors: ["#9d8cf5", "#eaf2ff"] });
  };

  useEffect(() => {
    if (!live) return;
    const t1 = setTimeout(() => setFlipped([true, false, false]), 700);
    const t2 = setTimeout(() => setFlipped([true, true, false]), 1200);
    const t3 = setTimeout(() => { setFlipped([true, true, true]); }, 1700);
    const t4 = setTimeout(() => pick(2), 2600);
    const t5 = setTimeout(() => { setFlipped([false, false, false]); setPicked(null); }, 5200);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [live]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#9d8cf5" alt="#3ec9a7" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-purple">Награда за уровень</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Выбери навык</div>
          <div className="mt-1 text-[10px] font-bold text-mist">Изменить выбор нельзя</div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 px-3">
          {PICKS.map((p, i) => {
            const isPicked = picked === i;
            const dim = picked !== null && !isPicked;
            return (
              <motion.button key={p.t} onClick={() => pick(i)}
                initial={{ y: 40, opacity: 0, rotate: (i - 1) * 8 }}
                animate={{
                  y: isPicked ? -14 : 0,
                  opacity: dim ? 0.32 : 1,
                  rotate: isPicked ? 0 : (i - 1) * 6,
                  scale: isPicked ? 1.08 : 1,
                }}
                transition={{ ...S.pop, delay: i * 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative grid place-items-center gap-1.5"
                style={{ perspective: 700 }}>
                <motion.div
                  animate={{ rotateY: flipped[i] ? 180 : 0 }}
                  transition={{ duration: 0.62, ease: E.io }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative">
                  <div style={{ backfaceVisibility: "hidden" }}>
                    <svg width="86" height="122" viewBox="0 0 100 140">
                      <rect x="3" y="3" width="94" height="134" rx="12" fill="#22334d" stroke="#5b7799" strokeWidth="2.6" />
                      <rect x="11" y="11" width="78" height="78" rx="8" fill="#16233c" />
                      <path d="M50 32 26 46v22c0 14 11 24 24 30 13-6 24-16 24-30V46L50 32Z" fill="rgba(255,255,255,.08)" stroke="#5b7799" strokeWidth="2.4" strokeLinejoin="round" />
                      <rect x="14" y="100" width="72" height="12" rx="5" fill="rgba(255,255,255,.07)" />
                    </svg>
                  </div>
                  <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}>
                    <CardFace rarity={p.r} name={p.t.toUpperCase()} kind={p.kind} size={86} />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isPicked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={S.pop} className="absolute -top-2 right-1 grid h-6 w-6 place-items-center rounded-full bg-teal text-void">
                      <IcCheck size={14} />
                    </motion.span>
                  )}
                </AnimatePresence>

                <div className="text-center">
                  <div className="text-[10px] font-extrabold uppercase">{p.t}</div>
                  <div className="mt-0.5 text-[8.5px] font-bold leading-snug text-mist">{p.d}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone={picked !== null ? "teal" : "ghost"} icon={<IcArrow size={15} />}>
            {picked !== null ? "ПРИНЯТЬ" : "ВЫБЕРИ КАРТУ"}
          </BigButton>
        </div>
        <BottomNav active="academy" />
      </motion.div>
    </Phone>
  );
}
