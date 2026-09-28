import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, PillTabs, Tag } from "../ui/kit";
import { S, feel, useCount, Particles, useTimeline } from "../lib/motion";
import {
  IcSwords, IcFlame, IcTarget, IcArrow, IcStar, IcTrophy, IcCoinMark, IcCrown, IcClock, IcLock, ArtCard,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 10 · HOME HUB — главный экран: режимы, миссия, сезон
   ===================================================================== */
const MODES = [
  { id: "arena", t: "АРЕНА", d: "Ранговые бои 7 раундов", tone: "#3ec9a7", Icon: IcSwords, tag: "LIVE" },
  { id: "marathon", t: "МАРАФОН", d: "Серия до первой ошибки", tone: "#e46a5f", Icon: IcFlame, tag: "×2 XP" },
  { id: "drill", t: "ТРЕНАЖЁР", d: "Отработка одного паттерна", tone: "#5b9cd6", Icon: IcTarget, tag: null },
];

export function HomeHub({ live = true }: { live?: boolean }) {
  const [i, setI] = useTimeline(MODES.length, 3200, live);
  const coins = useCount(1240);
  const m = MODES[i];

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-55" />
        <TopHUD coins={Math.round(coins)} />

        {/* карусель режимов */}
        <div className="relative mt-3 h-[236px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={m.id}
              initial={{ x: 120, opacity: 0, rotateY: 18, scale: 0.92 }}
              animate={{ x: 0, opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ x: -120, opacity: 0, rotateY: -18, scale: 0.92 }}
              transition={{ ...S.soft, damping: 24 }}
              className="absolute inset-x-3 top-0"
              style={{ perspective: 900 }}
            >
              <div className="relative overflow-hidden rounded-3xl p-4" style={{ background: `linear-gradient(160deg, ${m.tone}3a, #16213a 70%)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.14), 0 20px 40px -20px ${m.tone}` }}>
                <motion.div className="absolute -right-6 -top-8 h-36 w-36 rounded-full blur-2xl" style={{ background: m.tone + "44" }}
                  animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} />
                <div className="relative flex items-start justify-between">
                  <div>
                    {m.tag && <Tag tone={m.tone}>{m.tag}</Tag>}
                    <div className="title-xl mt-1.5 text-[26px] uppercase">{m.t}</div>
                    <div className="mt-1 max-w-[150px] text-[11px] font-bold leading-tight text-white/65">{m.d}</div>
                  </div>
                  <motion.div animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }} transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ color: m.tone }}>
                    <m.Icon size={58} />
                  </motion.div>
                </div>

                <div className="relative mt-3 flex items-center gap-2">
                  {[{ l: "ЛИГА", v: "GOLD III" }, { l: "СЕРИЯ", v: "×4" }, { l: "ОНЛАЙН", v: "2 148" }].map((s) => (
                    <div key={s.l} className="panel-sunk flex-1 rounded-xl px-2 py-1.5 text-center">
                      <div className="mono text-[11px] font-extrabold">{s.v}</div>
                      <div className="text-[7.5px] font-bold tracking-widest text-mist">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="relative mt-3"><BigButton tone="teal" icon={<IcArrow size={16} />}>ИГРАТЬ</BigButton></div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 -bottom-1 flex justify-center gap-1.5">
            {MODES.map((x, k) => (
              <motion.button key={x.id} onClick={() => { feel("tap"); setI(k); }} animate={{ width: k === i ? 22 : 7, background: k === i ? x.tone : "#2a354e" }} transition={S.pop} className="h-[6px] rounded-full" />
            ))}
          </div>
        </div>

        {/* миссия дня */}
        <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.15 }} className="mt-5 px-3">
          <Panel className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-gold">Миссия дня</span>
              <span className="mono flex items-center gap-1 text-[10px] font-bold text-mist"><IcClock size={12} />06:41</span>
            </div>
            <div className="mt-1.5 text-[13px] font-extrabold">Выиграй 3 боя на Арене</div>
            <div className="mt-2 flex items-center gap-2">
              <Bar v={2} max={3} tone="#f2c14e" h={9} />
              <span className="mono text-[10px] font-extrabold text-mist">2/3</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-gold"><IcCoinMark size={12} /><span className="mono text-[10px] font-extrabold">+250</span></span>
              <span className="flex items-center gap-1 rounded-full bg-teal/15 px-2 py-1 text-teal"><IcStar size={12} /><span className="mono text-[10px] font-extrabold">+400</span></span>
            </div>
          </Panel>
        </motion.div>

        {/* сезон */}
        <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.25 }} className="mt-3 px-3">
          <Panel className="flex items-center gap-3 p-3">
            <motion.span animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 6, repeat: Infinity }} className="text-gold"><IcCrown size={30} /></motion.span>
            <div className="flex-1">
              <div className="text-[11px] font-extrabold uppercase">Сигнал-пасс · ур. 12</div>
              <div className="mt-1.5"><Bar v={0.4} tone="#9d8cf5" h={7} /></div>
            </div>
            <span className="text-mist"><IcArrow size={16} /></span>
          </Panel>
        </motion.div>

        <div className="min-h-[14px] flex-1" />
        <div className="h-[70px] shrink-0" />
        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 11 · COLLECTION — сетка карт с морфом в детальный вид
   ===================================================================== */
const CARDS = [
  { id: 1, n: "ОБЪЁМ", r: "rare" as const, s: 3, have: true },
  { id: 2, n: "ТРЕНД", r: "common" as const, s: 7, have: true },
  { id: 3, n: "КИТ", r: "legend" as const, s: 11, have: true },
  { id: 4, n: "ФЛЭТ", r: "epic" as const, s: 5, have: true },
  { id: 5, n: "ГЭП", r: "common" as const, s: 9, have: false },
  { id: 6, n: "ШОРТ", r: "rare" as const, s: 2, have: true },
  { id: 7, n: "ПАНИКА", r: "epic" as const, s: 8, have: false },
  { id: 8, n: "РЕТЕСТ", r: "common" as const, s: 4, have: true },
  { id: 9, n: "ФОМО", r: "legend" as const, s: 6, have: false },
];
const RC = { common: "#5b7799", rare: "#3ec9a7", epic: "#9d8cf5", legend: "#f2c14e" };

export function CollectionGrid({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const burst = useRef<any>(null);
  const [auto] = useTimeline(2, [4200, 2600], live);
  useEffect(() => { if (live) setSel(auto === 1 ? 3 : null); }, [auto, live]);

  const list = tab === 0 ? CARDS : tab === 1 ? CARDS.filter((c) => c.have) : CARDS.filter((c) => !c.have);
  const card = CARDS.find((c) => c.id === sel);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />
        <div className="flex items-baseline justify-between px-4 pt-2">
          <div className="title-xl text-[19px] uppercase">Коллекция</div>
          <span className="mono text-[11px] font-extrabold text-teal">6 / 9</span>
        </div>
        <PillTabs tabs={["ВСЕ", "ЕСТЬ", "НЕТ"]} i={tab} set={setTab} />

        <LayoutGroup>
          <motion.div layout className="no-bar grid flex-1 grid-cols-3 gap-2.5 overflow-y-auto px-3 pb-24 pt-1">
            {list.map((c, i) => (
              <motion.button
                key={c.id}
                layout
                layoutId={`card-${c.id}`}
                onClick={() => { feel(c.have ? "confirm" : "deny"); setSel(c.id); }}
                initial={{ opacity: 0, y: 26, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...S.pop, delay: (i % 9) * 0.045 }}
                whileTap={{ scale: 0.93 }}
                className="relative grid place-items-center"
              >
                <motion.div animate={c.have ? {} : { filter: "grayscale(1) brightness(.55)" }}>
                  <ArtCard w={84} seed={c.s} rarity={c.r} label={c.n} />
                </motion.div>
                {!c.have && <span className="absolute grid h-8 w-8 place-items-center rounded-full bg-black/70 text-mist"><IcLock size={15} /></span>}
                {c.r === "legend" && c.have && (
                  <motion.span className="pointer-events-none absolute inset-0 rounded-xl" animate={{ boxShadow: ["0 0 0px #f2c14e00", "0 0 18px #f2c14e88", "0 0 0px #f2c14e00"] }} transition={{ duration: 2.4, repeat: Infinity }} />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* детальный вид через общий layoutId */}
          <AnimatePresence>
            {card && (
              <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0a1120]/88 px-5 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}>
                <motion.div layoutId={`card-${card.id}`} transition={{ ...S.soft, damping: 24 }} className="relative">
                  <ArtCard w={170} seed={card.s} rarity={card.r} label={card.n} />
                  <motion.span className="absolute -inset-4 -z-10 rounded-2xl blur-xl" style={{ background: RC[card.r] + "66" }}
                    animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }} />
                </motion.div>
                <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12, ...S.soft }} className="mt-4 w-full">
                  <Panel className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="title-xl text-[17px] uppercase">{card.n}</div>
                      <Tag tone={RC[card.r]}>{card.r.toUpperCase()}</Tag>
                    </div>
                    <p className="mt-1.5 text-[11px] font-bold leading-snug text-mist">
                      Паттерн подтверждается объёмом. Даёт +12% к точности сигнала в раунде.
                    </p>
                    <div className="mt-2.5 space-y-1.5">
                      {[{ l: "Сила", v: 0.78 }, { l: "Частота", v: 0.42 }].map((s) => (
                        <div key={s.l} className="flex items-center gap-2">
                          <span className="w-14 text-[9.5px] font-extrabold text-mist">{s.l}</span>
                          <Bar v={s.v} tone={RC[card.r]} h={7} />
                        </div>
                      ))}
                    </div>
                  </Panel>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>

        <BottomNav active="collection" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 12 · LEADERBOARD — таблица лиги с живым перемещением строк
   ===================================================================== */
type Row = { id: number; n: string; p: number; you?: boolean; tone: string };
export function Leaderboard({ live = true }: { live?: boolean }) {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, n: "NOVA_K", p: 4820, tone: "#f2c14e" },
    { id: 2, n: "ЛИКВИД", p: 4610, tone: "#9d8cf5" },
    { id: 3, n: "ТЫ", p: 4480, you: true, tone: "#3ec9a7" },
    { id: 4, n: "TRADER_K", p: 4310, tone: "#5b9cd6" },
    { id: 5, n: "СВЕЧКА", p: 4102, tone: "#e46a5f" },
    { id: 6, n: "ОБЪЁМ_777", p: 3980, tone: "#5b7799" },
  ]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setRows((rs) => {
        const next = rs.map((r) => ({ ...r, p: r.p + (r.you ? Math.round(Math.random() * 120) : Math.round(Math.random() * 90)) }));
        return next.sort((a, b) => b.p - a.p);
      });
      feel("tap", 6);
    }, 2200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-40" />
        <TopHUD compact />
        <div className="px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-gold">Лига Золото</div>
          <div className="title-xl mt-0.5 text-[20px] uppercase">Таблица сезона</div>
          <div className="mono mt-1 text-[10px] font-bold text-mist">до конца 2д 14ч · топ-3 идут выше</div>
        </div>

        {/* подиум */}
        <div className="mt-3 flex items-end justify-center gap-2 px-4">
          {[1, 0, 2].map((k) => {
            const r = rows[k];
            const h = k === 0 ? 74 : k === 1 ? 56 : 46;
            return (
              <motion.div key={r.id} layout transition={S.soft} className="flex flex-1 flex-col items-center">
                <motion.div layout className="mb-1 grid h-10 w-10 place-items-center rounded-full" style={{ background: r.tone + "26", color: r.tone }}>
                  {k === 0 ? <IcCrown size={20} /> : <IcStar size={17} />}
                </motion.div>
                <div className="text-[9.5px] font-extrabold">{r.n}</div>
                <motion.div layout className="mt-1 w-full rounded-t-xl" style={{ height: h, background: `linear-gradient(180deg, ${r.tone}66, ${r.tone}18)`, boxShadow: `inset 0 1px 0 ${r.tone}88` }}>
                  <div className="mono pt-1 text-center text-[11px] font-extrabold">{r.p}</div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* список */}
        <div className="no-bar mt-3 flex-1 space-y-1.5 overflow-y-auto px-3 pb-24">
          {rows.map((r, i) => (
            <motion.div
              key={r.id}
              layout
              transition={{ ...S.soft, damping: 24 }}
              className="relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              style={{
                background: r.you ? "linear-gradient(90deg,#1e3b37,#1b2740)" : "#1b2540",
                boxShadow: r.you ? "inset 0 0 0 1.5px #3ec9a7" : "inset 0 0 0 1px rgba(255,255,255,.06)",
              }}
            >
              <motion.span layout className="mono w-5 text-center text-[12px] font-extrabold" style={{ color: i < 3 ? "#f2c14e" : "#6f83a6" }}>{i + 1}</motion.span>
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: r.tone + "22", color: r.tone }}><IcTrophy size={15} /></span>
              <span className="flex-1 text-[12px] font-extrabold">{r.n}</span>
              <motion.span key={r.p} initial={{ scale: 1.35, color: "#3ec9a7" }} animate={{ scale: 1, color: "#e9eefb" }} transition={S.pop} className="mono text-[12px] font-extrabold tabular-nums">
                {r.p.toLocaleString("ru-RU")}
              </motion.span>
              {r.you && <motion.span className="absolute -left-[1px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-teal" layout />}
            </motion.div>
          ))}
        </div>

        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}
