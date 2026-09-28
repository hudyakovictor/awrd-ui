import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, BigButton } from "../ui/kit";
import { S, E, feel, useCount, useTimeline, Particles, useImpact } from "../lib/motion";
import {
  CardFace, Rarity, RARITY, SynergyLink, ChanceBars, QuestNode, PowerGauge, ProgressPath, StatusChip,
} from "../ui/art";
import {
  IcArrow, IcCheck, IcStar, IcCoinMark, IcCrown, IcFlame,
  IcGem, IcBolt, IcTarget, IcRefresh, IcBook, IcEye,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 34 · DECK BUILDER — колода: синергия, слоты, перетаскивание
   ===================================================================== */
const DECK = [
  { id: "d1", n: "ТРЕНД", r: "rare" as Rarity, lvl: 7, kind: 0, cost: 3 },
  { id: "d2", n: "ОБЪЁМ", r: "epic" as Rarity, lvl: 6, kind: 1, cost: 4 },
  { id: "d3", n: "РИСК", r: "common" as Rarity, lvl: 5, kind: 3, cost: 2 },
  { id: "d4", n: "ПСИХО", r: "legend" as Rarity, lvl: 4, kind: 2, cost: 5 },
];
const BENCH = [
  { id: "b1", n: "ГЭП", r: "common" as Rarity, lvl: 3, kind: 2, cost: 2 },
  { id: "b2", n: "ШОРТ", r: "rare" as Rarity, lvl: 5, kind: 0, cost: 3 },
  { id: "b3", n: "РЕТЕСТ", r: "epic" as Rarity, lvl: 6, kind: 1, cost: 4 },
];
const SYNERGY = [
  { a: "d1", b: "d2", t: "Объём подтверждает тренд", tone: "#3ec9a7", on: true },
  { a: "d2", b: "d4", t: "Психо усиливает объём", tone: "#9d8cf5", on: true },
  { a: "d3", b: "d1", t: "Риск ограничивает тренд", tone: "#f2c14e", on: false },
];

export function DeckBuilder({ live = true }: { live?: boolean }) {
  const [deck, setDeck] = useState(DECK);
  const [bench, setBench] = useState(BENCH);
  const [sel, setSel] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const power = useCount(deck.reduce((s, c) => s + c.cost * 120, 0), 1);

  const swap = (id: string, from: "deck" | "bench") => {
    const src = from === "deck" ? deck : bench;
    const dst = from === "deck" ? bench : deck;
    const card = src.find((c) => c.id === id);
    if (!card || dst.length >= 4) return feel("deny", 20);
    const other = dst.find((c) => c.id !== id);
    if (from === "deck" && deck.length <= 2) return feel("deny", 22);
    setDeck(from === "deck" ? deck.filter((c) => c.id !== id).concat(other ? [other] : []) : [...deck, card]);
    setBench(from === "bench" ? bench.filter((c) => c.id !== id).concat(other ? [other] : []) : [...bench, card]);
    feel("confirm", [8, 18]);
    setFlash(card.id);
    imp.fire(6, 0.26);
    burst.current?.(160, 300, { n: 14, power: 6, colors: [RARITY[card.r].c, "#eaf2ff"] });
    setTimeout(() => setFlash(null), 500);
  };

  useEffect(() => {
    if (!live) return;
    const pool = [...deck, ...bench];
    const iv = setInterval(() => {
      const c = pool[Math.floor(Math.random() * pool.length)];
      swap(c.id, deck.some((x) => x.id === c.id) ? "deck" : "bench");
    }, 2400);
    return () => clearInterval(iv);
  }, [live, deck, bench]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <div className="aurora opacity-40" />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 flex items-start justify-between px-4 pt-2">
          <div>
            <div className="title-xl text-[18px] uppercase">Моя колода</div>
            <div className="text-[9.5px] font-bold text-mist">Тапни карту, чтобы переставить</div>
          </div>
          <div className="flex flex-col items-end">
            <StatusChip t={`${deck.length} / 4`} tone="#3ec9a7" />
            <div className="mt-1 flex items-center gap-1 text-gold">
              <IcBolt size={12} /><span className="mono text-[12px] font-extrabold">{Math.round(power)}</span>
            </div>
          </div>
        </div>

        {/* сила колоды */}
        <div className="relative z-10 mt-2 px-3">
          <PowerGauge v={power} max={2600} tone="#f2c14e" />
        </div>

        {/* синергия */}
        <div className="relative z-10 mt-2 space-y-1 px-3">
          {SYNERGY.map((sy) => {
            const active = deck.some((c) => c.id === sy.a) && deck.some((c) => c.id === sy.b);
            return (
              <motion.div key={sy.t} layout initial={{ opacity: 0, x: -18 }} animate={{ opacity: active ? 1 : 0.42, x: 0 }}
                transition={{ ...S.soft, delay: 0.1 }}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
                style={{ background: active ? sy.tone + "12" : "rgba(255,255,255,.025)", boxShadow: `inset 0 0 0 1px ${active ? sy.tone + "33" : "transparent"}` }}>
                <SynergyLink on={active} tone={sy.tone} w={34} />
                <span className="flex-1 text-[10px] font-extrabold" style={{ color: active ? "#eaf2ff" : "#5f7496" }}>{sy.t}</span>
                <span className="mono text-[9px] font-extrabold" style={{ color: active ? sy.tone : "#5f7496" }}>{active ? "+18%" : "—"}</span>
              </motion.div>
            );
          })}
        </div>

        {/* слоты колоды */}
        <LayoutGroup>
          <div className="relative z-10 mt-3 px-3">
            <div className="mb-1.5 px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-teal">в бою</div>
            <div className="flex items-end justify-between gap-1">
              <AnimatePresence>
                {deck.map((c, i) => (
                  <motion.button key={c.id} layout
                    initial={{ scale: 0.5, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: sel === c.id ? -8 : 0, opacity: 1 }}
                    exit={{ scale: 0.5, y: -30, opacity: 0 }}
                    transition={{ ...S.pop, delay: i * 0.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      setSel(c.id);
                      feel("tap");
                      if (sel && sel !== c.id) { swap(c.id, "bench"); setSel(null); }
                    }}
                    className="relative">
                    <CardFace rarity={c.r} name={c.n} level={c.lvl} kind={c.kind} size={72} />
                    <span className="mono absolute -top-1 -left-1 grid h-4 w-4 place-items-center rounded-full text-[8px] font-extrabold"
                      style={{ background: "#f2c14e", color: "#3c2a04" }}>{c.cost}</span>
                    <AnimatePresence>
                      {flash === c.id && (
                        <motion.span className="absolute inset-0 rounded-xl"
                          initial={{ boxShadow: `0 0 0 0 ${RARITY[c.r].c}` }} animate={{ boxShadow: `0 0 0 12px ${RARITY[c.r].c}00` }}
                          transition={{ duration: 0.6 }} />
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* скамейка */}
          <div className="relative z-10 mt-4 px-3">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">запас</span>
              <span className="mono text-[9px] font-bold text-mist">{bench.length} карты</span>
            </div>
            <div className="flex items-end justify-center gap-1.5">
              <AnimatePresence>
                {bench.map((c, i) => (
                  <motion.button key={c.id} layout
                    initial={{ scale: 0.5, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: sel === c.id ? -8 : 0, opacity: 1 }}
                    exit={{ scale: 0.5, y: -30, opacity: 0 }}
                    transition={{ ...S.pop, delay: i * 0.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      setSel(c.id);
                      feel("tap");
                      if (sel && sel !== c.id) { swap(c.id, "deck"); setSel(null); }
                    }}>
                    <CardFace rarity={c.r} name={c.n} level={c.lvl} kind={c.kind} size={56} />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>

        <div className="relative z-10 mt-auto mb-24 flex gap-2 px-3">
          <div className="flex-1"><BigButton tone="ghost" className="!py-2.5 !text-[11px]" icon={<IcRefresh size={13} />}>АВТО</BigButton></div>
          <div className="flex-1"><BigButton tone="teal" className="!py-2.5 !text-[11px]" icon={<IcCheck size={13} />}>ГОТОВО</BigButton></div>
        </div>
        <BottomNav active="collection" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 35 · CARD UPGRADE — прокачка: шанс, материалы, риск понижения
   ===================================================================== */
export function CardUpgrade({ live = true }: { live?: boolean }) {
  const [lvl, setLvl] = useState(5);
  const [chance, setChance] = useState(0.72);
  const [state, setState] = useState<"idle" | "roll" | "win" | "fail">("idle");
  const [sparks, setSparks] = useState(12);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const power = useCount(320 + lvl * 46, 0.9);

  const roll = () => {
    if (state === "roll") return;
    if (sparks < 3) return feel("deny", 26);
    setState("roll"); setSparks((s) => s - 3); feel("sweep", 14);
    setTimeout(() => {
      const ok = Math.random() < chance;
      if (ok) {
        setState("win"); setLvl((l) => l + 1); setChance((c) => Math.max(0.12, c - 0.11));
        feel("reward", [12, 28, 12]); imp.fire(12, 0.42);
        burst.current?.(160, 250, { n: 40, power: 11, square: true, colors: ["#9d8cf5", "#f2c14e", "#eaf2ff"] });
      } else {
        setState("fail"); setChance((c) => Math.min(0.96, c + 0.09));
        feel("deny", 34); imp.fire(18, 0.5);
      }
      setTimeout(() => setState("idle"), 1500);
    }, 1100);
  };

  useEffect(() => {
    if (!live) return;
    const iv = setInterval(roll, 2900);
    return () => clearInterval(iv);
  }, [live, chance, sparks]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(70% 42% at 50% 30%, ${state === "win" ? "#9d8cf544" : state === "fail" ? "#e46a5f33" : "#5b9cd61e"}, transparent 72%)` }} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-purple">Кузница карт</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Повышение уровня</div>
        </div>

        {/* карта */}
        <div className="relative z-10 mt-3 grid place-items-center">
          <motion.div
            animate={{
              scale: state === "roll" ? [1, 1.06, 0.96, 1.02, 1] : state === "win" ? [1, 1.16, 1] : state === "fail" ? [1, 0.9, 1.02, 1] : 1,
              rotate: state === "fail" ? [0, -7, 6, 0] : 0,
            }}
            transition={{ duration: state === "roll" ? 1.1 : 0.7, ease: E.out }}>
            <CardFace rarity={lvl >= 8 ? "legend" : lvl >= 6 ? "epic" : "rare"} name="ОБЪЁМ" level={lvl} kind={1} size={116} />
          </motion.div>
          {state === "roll" && (
            <motion.div className="absolute inset-0 grid place-items-center rounded-full"
              style={{ background: "conic-gradient(from 0deg, rgba(157,140,245,.35), transparent 40%)" }}
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          )}
        </div>

        {/* шанс */}
        <div className="relative z-10 mt-4 px-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-mist">шанс успеха</span>
            <motion.span key={chance} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={S.pop}
              className="mono text-[15px] font-extrabold" style={{ color: chance > 0.7 ? "#3ec9a7" : chance > 0.4 ? "#f2c14e" : "#e46a5f" }}>
              {Math.round(chance * 100)}%
            </motion.span>
          </div>
          <div className="mt-2"><ChanceBars v={chance} tone={chance > 0.7 ? "#3ec9a7" : chance > 0.4 ? "#f2c14e" : "#e46a5f"} /></div>
          <div className="mt-2"><ProgressPath v={lvl} max={12} tone="#9d8cf5" ticks={4} h={9} /></div>
        </div>

        {/* материалы */}
        <div className="relative z-10 mt-3 flex gap-2 px-3">
          {[
            { I: IcGem, t: "Осколки", v: sparks, tone: "#9d8cf5" },
            { I: IcCoinMark, t: "Монеты", v: 2400, tone: "#f2c14e" },
            { I: IcBolt, t: "Мощь", v: Math.round(power), tone: "#3ec9a7" },
          ].map((m) => (
            <div key={m.t} className="flex-1 rounded-xl bg-white/[0.035] py-2 text-center">
              <div className="mx-auto w-fit" style={{ color: m.tone }}><m.I size={16} /></div>
              <div className="mono mt-1 text-[11px] font-extrabold">{m.v}</div>
              <div className="text-[7.5px] font-bold uppercase tracking-widest text-mist">{m.t}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {state !== "idle" && (
            <motion.div key={state} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
              transition={S.pop} className="relative z-10 mt-3 px-5 text-center">
              <div className="font-display text-[15px] font-extrabold uppercase"
                style={{ color: state === "win" ? "#3ec9a7" : state === "fail" ? "#e46a5f" : "#9d8cf5" }}>
                {state === "roll" ? "Ковка…" : state === "win" ? `Уровень ${lvl}!` : "Провал · шанс вырос"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone={state === "fail" ? "coral" : "purple"} onClick={roll} icon={<IcBolt size={15} />}>
            {sparks < 3 ? "НЕ ХВАТАЕТ ОСКОЛКОВ" : "КОВАТЬ · 3 ОСКОЛКА"}
          </BigButton>
        </div>
        <BottomNav active="collection" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 36 · QUEST LOG — цепочка квестов с ветвлением и наградами
   ===================================================================== */
const QUESTS = [
  { t: "Разведка", d: "Проведи 3 боя на Арене", state: "done", Icon: IcTarget },
  { t: "Первый анализ", d: "Разбери проигранный бой", state: "done", Icon: IcBook },
  { t: "Карта ловушки", d: "Изучи сущность в Бестиарии", state: "active", Icon: IcEye },
  { t: "Дисциплина", d: "Удержи серию из 5 побед", state: "locked", Icon: IcFlame },
  { t: "Мастер крафта", d: "Прокачай карту до 8 уровня", state: "locked", Icon: IcStar },
  { t: "Турнир", d: "Выйди из группы в финале", state: "locked", Icon: IcCrown },
] as const;

export function QuestLog({ live = true }: { live?: boolean }) {
  const [i] = useTimeline(QUESTS.length, 2200, live);
  const burst = useRef<any>(null);
  const xp = useCount(1240 + i * 60, 0.8);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-35" />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="title-xl text-[18px] uppercase">Журнал задач</div>
              <div className="text-[9.5px] font-bold text-mist">Кампания · Глава 2 «Пробой»</div>
            </div>
            <StatusChip t={`${i} / ${QUESTS.length}`} tone="#3ec9a7" pulse />
          </div>
          <div className="mt-2.5"><ProgressPath v={i} max={QUESTS.length} tone="#3ec9a7" ticks={6} h={9} /></div>
        </div>

        {/* ветвление */}
        <div className="relative z-10 mt-3 space-y-1.5 px-3">
          <LayoutGroup>
            {QUESTS.map((q, k) => {
              const state = k < i ? "done" : k === i ? "active" : "locked";
              return (
                <motion.div key={q.t} layout initial={{ x: -26, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: k * 0.06, ...S.soft }}>
                  <QuestNode t={q.t} d={q.d} state={state} tone="#3ec9a7" Icon={q.Icon} />
                  {k < QUESTS.length - 1 && (
                    <div className="ml-[26px] h-3 w-[2px]" style={{ background: k < i ? "#3ec9a766" : "rgba(255,255,255,.08)" }} />
                  )}
                </motion.div>
              );
            })}
          </LayoutGroup>
        </div>

        {/* награда за ветку */}
        <motion.div layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...S.soft }}
          className="relative z-10 mt-3 px-3">
          <Panel className="flex items-center gap-2.5 p-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/16 text-gold"><IcCrown size={17} /></span>
            <div className="flex-1">
              <div className="text-[11px] font-extrabold">Награда главы</div>
              <div className="text-[9.5px] font-bold text-mist">Карта «Ретест» + 2 000 опыта</div>
            </div>
            <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              className="mono rounded-full bg-gold/15 px-2 py-1 text-[10px] font-extrabold text-gold">
              {Math.round(xp)} XP
            </motion.span>
          </Panel>
        </motion.div>

        <div className="relative z-10 mt-auto mb-24 px-3">
          <BigButton tone="teal" icon={<IcArrow size={15} />}>ПРОДОЛЖИТЬ КАМПАНИЮ</BigButton>
        </div>
        <BottomNav active="academy" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 37 · ITEM DRAW — лутбокс с подтверждением шансов
   ===================================================================== */
const DROPS = [
  { t: "Мифический камень", r: "mythic" as Rarity, p: 0.04 },
  { t: "Легендарная карта", r: "legend" as Rarity, p: 0.11 },
  { t: "Эпический осколок", r: "epic" as Rarity, p: 0.25 },
  { t: "Редкий модуль", r: "rare" as Rarity, p: 0.3 },
  { t: "Обычный набор", r: "common" as Rarity, p: 0.3 },
];

export function ItemDraw({ live = true }: { live?: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [got, setGot] = useState<typeof DROPS[number] | null>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const pity = useCount(68, 1);

  const roll = () => {
    if (phase !== 0) return;
    setPhase(1); feel("sweep", 16);
    setTimeout(() => {
      const r = Math.random();
      let acc = 0;
      const hit = DROPS.find((d) => (acc += d.p) >= r) ?? DROPS[DROPS.length - 1];
      setGot(hit); setPhase(2);
      const heavy = hit.r === "mythic" || hit.r === "legend";
      feel(heavy ? "reward" : "confirm", heavy ? [12, 32, 12] : 9);
      imp.fire(heavy ? 16 : 7, 0.42);
      burst.current?.(160, 240, { n: heavy ? 52 : 20, power: heavy ? 13 : 8, square: true, colors: [RARITY[hit.r].c, "#eaf2ff"] });
      setTimeout(() => setPhase(3), 700);
    }, 1000);
  };

  useEffect(() => {
    if (!live) return;
    const iv = setInterval(() => { if (phase === 0) roll(); else { setPhase(0); setGot(null); } }, 2200);
    return () => clearInterval(iv);
  }, [live, phase]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-gold">Сундук сезона</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Открытие</div>
        </div>

        <div className="relative z-10 mt-4 grid place-items-center">
          <motion.div
            animate={phase === 1
              ? { scale: [1, 0.86, 1.12, 1], rotate: [0, -8, 8, -3, 0] }
              : { y: [0, -6, 0] }}
            transition={phase === 1 ? { duration: 1, ease: E.io } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative">
            <motion.span className="absolute -inset-6 -z-10 rounded-full"
              style={{ background: got ? RARITY[got.r].c + "33" : "#f2c14e22", filter: "blur(18px)" }}
              animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
            <svg width="128" height="112" viewBox="0 0 120 100" fill="none">
              <defs>
                <linearGradient id="ch-lid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffe089" /><stop offset="1" stopColor="#c98b17" />
                </linearGradient>
              </defs>
              <rect x="16" y="44" width="88" height="42" rx="8" fill="#25395a" stroke="#0f1c2e" strokeWidth="3" />
              <motion.g animate={{ rotate: phase >= 2 ? -32 : -8 }} transition={S.pop} style={{ transformOrigin: "18px 46px" }}>
                <path d="M16 46V34a44 44 0 0 1 88 0v12H16Z" fill="#2e4568" stroke="#0f1c2e" strokeWidth="3" />
                <rect x="16" y="38" width="88" height="8" fill="url(#ch-lid)" />
              </motion.g>
              <rect x="52" y="44" width="16" height="22" rx="4" fill="url(#ch-lid)" stroke="#8a5f12" strokeWidth="2" />
              <circle cx="60" cy="55" r="3" fill="#5a3d0a" />
            </svg>
          </motion.div>
        </div>

        {/* результат */}
        <AnimatePresence mode="wait">
          {phase >= 2 && got ? (
            <motion.div key={got.t} initial={{ scale: 0.6, opacity: 0, y: 22 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ ...S.pop, delay: phase === 3 ? 0.2 : 0 }}
              className="relative z-10 mt-3 flex flex-col items-center">
              <CardFace rarity={got.r} name={got.t.slice(0, 8).toUpperCase()} kind={2} size={92} />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-2 text-center">
                <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: RARITY[got.r].c }}>{RARITY[got.r].t}</div>
                <div className="text-[13px] font-extrabold">{got.t}</div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="chance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative z-10 mt-4 space-y-1 px-5">
              <div className="mb-1 text-center text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">шансы</div>
              {DROPS.map((d) => (
                <div key={d.t} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: RARITY[d.r].c }} />
                  <span className="flex-1 truncate text-[9.5px] font-bold text-mist">{d.t}</span>
                  <span className="mono text-[9.5px] font-extrabold" style={{ color: RARITY[d.r].c }}>{(d.p * 100).toFixed(0)}%</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* pity */}
        <div className="relative z-10 mt-3 px-5">
          <div className="flex items-center justify-between text-[9px] font-extrabold">
            <span className="text-mist">до гаранта</span>
            <span className="mono text-gold">{Math.round(pity)} / 100</span>
          </div>
          <div className="mt-1"><ProgressPath v={pity} max={100} tone="#f2c14e" ticks={5} h={8} /></div>
        </div>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone="gold" onClick={roll} icon={<IcStar size={15} />}>
            {phase === 3 ? "ЕЩЁ РАЗ" : "ОТКРЫТЬ · 300 ◉"}
          </BigButton>
        </div>
        <BottomNav active="collection" />
      </motion.div>
    </Phone>
  );
}
