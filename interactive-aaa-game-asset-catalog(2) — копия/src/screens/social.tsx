import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, PillTabs, Tag } from "../ui/kit";
import { S, E, feel, useCount, useTimeline, Particles, useImpact, useInterval } from "../lib/motion";
import {
  RankCrest, Avatar, SceneBackdrop, StatRadar, Dial, Medal, Ribbon, Spark, CandleScene, Ticker,
} from "../ui/art";
import {
  IcArrow, IcCheck, IcClose, IcStar, IcCoinMark, IcFlame, IcSwords,
  IcClock, IcTrophy, IcCards, IcWarn, IcPlay, IcCap,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 23 · PLAYER PROFILE — витрина статуса игрока
   ===================================================================== */
const ACHIEVEMENTS = [
  { t: "Первая кровь", tone: "#3ec9a7", got: true },
  { t: "Серия ×10", tone: "#f2c14e", got: true },
  { t: "Без ошибок", tone: "#9d8cf5", got: true },
  { t: "Охотник", tone: "#5b9cd6", got: false },
  { t: "Легенда", tone: "#e46a5f", got: false },
];

export function PlayerProfile({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(0);
  const xp = useCount(6700, 1.3);
  const winrate = useCount(67, 1.1);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#3ec9a7" alt="#9d8cf5" animate={live} />
        <TopHUD compact />

        {/* шапка профиля */}
        <div className="relative z-10 mt-2 px-4">
          <motion.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={S.soft}
            className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.5, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...S.pop, delay: 0.08 }}>
              <Avatar seed={4} size={62} tone="#3ec9a7" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="mono text-[9.5px] font-bold text-mist">@trader_pro</div>
              <div className="title-xl text-[19px] uppercase leading-tight">Охотник за трендом</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Tag tone="#f2c14e">золото III</Tag>
                <span className="flex items-center gap-1 rounded-full bg-coral/15 px-2 py-[2px] text-[9px] font-extrabold text-coral">
                  <IcFlame size={10} />12 дней
                </span>
              </div>
            </div>
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...S.pop, delay: 0.18 }}>
              <RankCrest rank="gold" size={58} stars={3} />
            </motion.div>
          </motion.div>

          <div className="mt-3 flex items-center gap-2">
            <Bar v={xp} max={10000} tone="#3ec9a7" h={10} label={`${Math.round(xp).toLocaleString("ru-RU")} / 10 000 XP`} />
          </div>
        </div>

        <PillTabs tabs={["ОБЗОР", "НАВЫКИ", "НАГРАДЫ"]} i={tab} set={setTab} />

        <div className="no-bar relative z-10 flex-1 overflow-y-auto px-3 pb-24">
          <AnimatePresence mode="wait">
            {tab === 0 && (
              <motion.div key="a" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: E.out }} className="space-y-3">
                <Panel className="flex items-center gap-3 p-3">
                  <Dial v={winrate} tone="#3ec9a7" size={96} label={`${Math.round(winrate)}%`} sub="винрейт" />
                  <div className="flex-1 space-y-1.5">
                    {[
                      { l: "Боёв", v: "248", Icon: IcSwords, tone: "#5b9cd6" },
                      { l: "Побед", v: "166", Icon: IcTrophy, tone: "#3ec9a7" },
                      { l: "Лучшая серия", v: "×14", Icon: IcFlame, tone: "#e46a5f" },
                    ].map((r, i) => (
                      <motion.div key={r.l} initial={{ x: 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.06, ...S.soft }}
                        className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-1.5">
                        <span style={{ color: r.tone }}><r.Icon size={13} /></span>
                        <span className="flex-1 text-[10px] font-bold text-mist">{r.l}</span>
                        <span className="mono text-[11.5px] font-extrabold">{r.v}</span>
                      </motion.div>
                    ))}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-mist">форма за 10 боёв</span>
                    <Spark data={[3, 5, 4, 7, 6, 8, 7, 9, 8, 10]} tone="#3ec9a7" w={72} h={24} />
                  </div>
                  <div className="mt-2 flex gap-1">
                    {["W", "W", "L", "W", "W", "W", "L", "W", "W", "W"].map((r, i) => (
                      <motion.span key={i} initial={{ scale: 0, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ ...S.pop, delay: i * 0.04 }}
                        className="grid h-6 flex-1 place-items-center rounded-md text-[9px] font-extrabold"
                        style={{ background: r === "W" ? "#3ec9a728" : "#e46a5f28", color: r === "W" ? "#3ec9a7" : "#e46a5f" }}>{r}</motion.span>
                    ))}
                  </div>
                </Panel>

                <Ticker tone="#3ec9a7" items={[
                  { t: "BTC", v: "67 840", up: true }, { t: "ETH", v: "3 412", up: false },
                  { t: "SOL", v: "182.4", up: true }, { t: "BNB", v: "612", up: true },
                ]} />
              </motion.div>
            )}

            {tab === 1 && (
              <motion.div key="b" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: E.out }} className="space-y-3">
                <Panel className="grid place-items-center p-3">
                  <StatRadar values={[85, 72, 50, 90, 60]} labels={["ТЕХ", "РИСК", "ФУНД", "ПСИХО", "СЕЙФ"]} size={176} tone="#3ec9a7" />
                </Panel>
                {[
                  { l: "Технический анализ", v: 85, tone: "#3ec9a7" },
                  { l: "Риск-менеджмент", v: 72, tone: "#5b9cd6" },
                  { l: "Фундамент", v: 50, tone: "#f2c14e" },
                  { l: "Психология", v: 90, tone: "#9d8cf5" },
                ].map((r, i) => (
                  <motion.div key={r.l} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06, ...S.soft }}
                    className="flex items-center gap-2.5 rounded-xl bg-white/[0.035] px-3 py-2">
                    <span className="w-28 shrink-0 text-[10.5px] font-bold">{r.l}</span>
                    <Bar v={r.v} tone={r.tone} h={7} />
                    <span className="mono w-7 shrink-0 text-right text-[10.5px] font-extrabold" style={{ color: r.tone }}>{r.v}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {tab === 2 && (
              <motion.div key="c" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: E.out }} className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.map((a, i) => (
                  <motion.div key={a.t} initial={{ scale: 0.6, opacity: 0, y: 18 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ ...S.pop, delay: i * 0.06 }}
                    className="grid place-items-center gap-1 rounded-2xl p-2"
                    style={{ background: a.got ? a.tone + "14" : "rgba(255,255,255,.02)", boxShadow: `inset 0 0 0 1px ${a.got ? a.tone + "55" : "rgba(255,255,255,.05)"}` }}>
                    <motion.div animate={a.got ? { y: [0, -3, 0] } : {}} transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.3 }}>
                      <Medal tone={a.tone} size={46} locked={!a.got} />
                    </motion.div>
                    <span className="text-center text-[8.5px] font-extrabold leading-tight" style={{ color: a.got ? "#e9eefb" : "#5f7496" }}>{a.t}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 24 · DUEL — вызов 1×1 с синхронным раскрытием ответов
   ===================================================================== */
export function DuelScreen({ live = true }: { live?: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const imp = useImpact();
  const burst = useRef<any>(null);

  useEffect(() => {
    if (!live) return;
    let t: any[] = [];
    const cycle = () => {
      setPhase(0);
      t.push(setTimeout(() => { setPhase(1); feel("tap"); }, 900));
      t.push(setTimeout(() => { setPhase(2); feel("sweep"); }, 2000));
      t.push(setTimeout(() => {
        setPhase(3); feel("reward", [10, 26, 10]); imp.fire(12, 0.4);
        burst.current?.(80, 250, { n: 30, power: 10, colors: ["#3ec9a7", "#eaf2ff"] });
      }, 2900));
    };
    cycle();
    const iv = setInterval(cycle, 5200);
    return () => { clearInterval(iv); t.forEach(clearTimeout); };
  }, [live]);

  const Side = ({ name, seed, tone, you, answer, ok }: any) => (
    <div className="flex-1">
      <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={S.soft}
        className="flex flex-col items-center gap-1.5">
        <motion.div animate={phase >= 3 && ok ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.5 }}>
          <Avatar seed={seed} size={52} tone={tone} />
        </motion.div>
        <span className="text-[10.5px] font-extrabold uppercase" style={{ color: you ? tone : "#cfe0f7" }}>{name}</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((k) => (
            <motion.span key={k} className="h-1.5 w-4 rounded-full"
              animate={{ background: k < (ok ? 2 : 1) ? tone : "rgba(255,255,255,.12)" }} transition={S.pop} />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="relative mt-2.5 grid h-[74px] place-items-center overflow-hidden rounded-2xl px-2 text-center"
        animate={{
          background: phase >= 3 ? (ok ? "linear-gradient(180deg,#1e4038,#16213a)" : "linear-gradient(180deg,#41211d,#16213a)") : "#16213a",
          boxShadow: `inset 0 0 0 1.5px ${phase >= 3 ? (ok ? "#3ec9a7" : "#e46a5f") : "rgba(255,255,255,.07)"}`,
        }}
        transition={S.soft}
      >
        <AnimatePresence mode="wait">
          {phase < 2 ? (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-1 text-mist">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}>
                <IcClock size={18} />
              </motion.span>
              <span className="text-[9px] font-bold">{phase === 1 && you ? "ты выбрал" : "думает…"}</span>
            </motion.div>
          ) : (
            <motion.div key="ans" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}
              transition={{ ...S.pop, delay: you ? 0 : 0.12 }} className="flex flex-col items-center gap-1">
              <span className="text-[10.5px] font-extrabold leading-tight">{answer}</span>
              {phase >= 3 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop} style={{ color: ok ? "#3ec9a7" : "#e46a5f" }}>
                  {ok ? <IcCheck size={16} /> : <IcClose size={16} />}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#9d8cf5" alt="#3ec9a7" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 mt-1 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-purple">Дуэль · раунд 3 из 5</div>
          <div className="title-xl mt-0.5 text-[17px] uppercase">Кто прочитает график</div>
        </div>

        <div className="relative z-10 mt-2 px-3">
          <Panel className="grid place-items-center p-2">
            <CandleScene w={262} h={104} seed={7} level={68} marker={phase >= 2 ? 11 : undefined} />
          </Panel>
        </div>

        <div className="relative z-10 mt-3 flex gap-3 px-3">
          <Side name="ТЫ" seed={4} tone="#3ec9a7" you answer="Ждать объём" ok />
          <div className="grid w-8 shrink-0 place-items-center pt-14">
            <motion.span animate={{ scale: phase >= 2 ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.5 }}
              className="mono text-[13px] font-extrabold italic text-gold">VS</motion.span>
          </div>
          <Side name="CRYPTO_K" seed={9} tone="#9d8cf5" answer="Войти сразу" />
        </div>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ ...S.pop, delay: 0.2 }} className="relative z-10 mt-3 grid place-items-center px-4">
              <Ribbon tone="#3ec9a7" w={190}>раунд за тобой</Ribbon>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold text-mist">
                <IcStar size={12} className="text-teal" /> +120 XP
                <span className="h-3 w-px bg-white/15" />
                <IcCoinMark size={12} className="text-gold" /> +60
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone={phase >= 3 ? "teal" : "ghost"} icon={<IcArrow size={15} />}>
            {phase >= 3 ? "СЛЕДУЮЩИЙ РАУНД" : "ЖДЁМ СОПЕРНИКА…"}
          </BigButton>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 25 · DAILY PUZZLE — головоломка: собери сетап из карточек
   ===================================================================== */
const SLOTS = [
  { id: "ctx", t: "КОНТЕКСТ", tone: "#5b9cd6" },
  { id: "trg", t: "ТРИГГЕР", tone: "#f2c14e" },
  { id: "risk", t: "РИСК", tone: "#e46a5f" },
];
const CHIPS = [
  { id: "c1", t: "Восходящий тренд 1Д", fit: "ctx" },
  { id: "c2", t: "Ретест уровня + объём", fit: "trg" },
  { id: "c3", t: "Стоп за структурой", fit: "risk" },
  { id: "c4", t: "Новость без подтверждения", fit: null },
];

export function DailyPuzzle({ live = true }: { live?: boolean }) {
  const [placed, setPlaced] = useState<Record<string, string | null>>({ ctx: null, trg: null, risk: null });
  const [wrong, setWrong] = useState<string | null>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const done = Object.values(placed).every(Boolean);

  const put = (chip: typeof CHIPS[number], slot: string) => {
    if (chip.fit !== slot) {
      setWrong(chip.id); feel("deny", 26); imp.fire(10, 0.32);
      setTimeout(() => setWrong(null), 500);
      return;
    }
    setPlaced((p) => ({ ...p, [slot]: chip.id }));
    feel("confirm", [8, 18]);
    burst.current?.(160, 190, { n: 16, power: 7, colors: ["#3ec9a7", "#eaf2ff"] });
  };

  useEffect(() => {
    if (!live) return;
    const iv = setInterval(() => {
      setPlaced((p) => {
        const next = CHIPS.find((c) => c.fit && !p[c.fit]);
        if (!next) { setTimeout(() => setPlaced({ ctx: null, trg: null, risk: null }), 900); return p; }
        feel("confirm", [8, 18]);
        burst.current?.(160, 190, { n: 16, power: 7, colors: ["#3ec9a7", "#eaf2ff"] });
        return { ...p, [next.fit!]: next.id };
      });
    }, 1500);
    return () => clearInterval(iv);
  }, [live]);

  useEffect(() => { if (done) { feel("reward", [12, 30, 12]); imp.fire(12, 0.4); burst.current?.(160, 300, { n: 40, power: 11, square: true }); } }, [done]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#f2c14e" alt="#3ec9a7" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-gold">Головоломка дня</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Собери сетап</div>
          <div className="mono mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-mist">
            <IcClock size={12} /> сброс через 06:41
          </div>
        </div>

        <div className="relative z-10 mt-3 px-3">
          <Panel className="grid place-items-center p-2">
            <CandleScene w={256} h={92} seed={11} level={72} tone="#3ec9a7" />
          </Panel>
        </div>

        <LayoutGroup>
          <div className="relative z-10 mt-3 space-y-2 px-3">
            {SLOTS.map((s, i) => {
              const chip = CHIPS.find((c) => c.id === placed[s.id]);
              return (
                <motion.div key={s.id} initial={{ x: -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07, ...S.soft }}
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                  style={{
                    background: chip ? `linear-gradient(90deg, ${s.tone}1f, #16213a)` : "rgba(255,255,255,.025)",
                    boxShadow: `inset 0 0 0 1.5px ${chip ? s.tone + "77" : "rgba(255,255,255,.07)"}`,
                    borderStyle: chip ? "solid" : "dashed",
                  }}>
                  <span className="w-[74px] shrink-0 text-[9px] font-extrabold tracking-wider" style={{ color: s.tone }}>{s.t}</span>
                  <div className="min-h-[24px] flex-1">
                    <AnimatePresence mode="wait">
                      {chip ? (
                        <motion.div key={chip.id} layoutId={`chip-${chip.id}`} transition={{ ...S.soft, damping: 24 }}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: s.tone + "22" }}>
                          <span style={{ color: s.tone }}><IcCheck size={12} /></span>
                          <span className="text-[10px] font-extrabold">{chip.t}</span>
                        </motion.div>
                      ) : (
                        <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-[9.5px] font-bold text-mist/60">перетащи карточку</motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="relative z-10 mt-3 flex flex-wrap gap-2 px-3">
            {CHIPS.filter((c) => !Object.values(placed).includes(c.id)).map((c) => (
              <motion.button
                key={c.id}
                layoutId={`chip-${c.id}`}
                onClick={() => { const slot = SLOTS.find((s) => !placed[s.id]); if (slot) put(c, slot.id); }}
                animate={wrong === c.id ? { x: [0, -7, 7, -5, 0] } : {}}
                transition={wrong === c.id ? { duration: 0.4 } : { ...S.soft, damping: 24 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-xl px-2.5 py-2 text-[10px] font-extrabold"
                style={{
                  background: wrong === c.id ? "#e46a5f2a" : "rgba(255,255,255,.05)",
                  boxShadow: `inset 0 0 0 1px ${wrong === c.id ? "#e46a5f" : "rgba(255,255,255,.1)"}`,
                }}>
                {c.t}
              </motion.button>
            ))}
          </div>
        </LayoutGroup>

        <AnimatePresence>
          {done && (
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={S.pop}
              className="relative z-10 mt-3 grid place-items-center">
              <Ribbon tone="#3ec9a7" w={200}>сетап собран · +250 XP</Ribbon>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone={done ? "gold" : "ghost"} icon={<IcStar size={15} />}>{done ? "ЗАБРАТЬ НАГРАДУ" : "ПОДСКАЗКА · 50"}</BigButton>
        </div>
        <BottomNav active="academy" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 26 · CLAN — гильдия: вклад, цель недели, состав
   ===================================================================== */
const MEMBERS = [
  { n: "NOVA_K", seed: 2, pts: 4820, role: "лидер", tone: "#f2c14e" },
  { n: "ТЫ", seed: 4, pts: 4480, role: "офицер", tone: "#3ec9a7", you: true },
  { n: "ЛИКВИД", seed: 6, pts: 4102, role: "боец", tone: "#9d8cf5" },
  { n: "СВЕЧКА", seed: 8, pts: 3890, role: "боец", tone: "#5b9cd6" },
  { n: "ОБЪЁМ_777", seed: 11, pts: 3402, role: "новичок", tone: "#8fa4c7" },
];

export function ClanScreen({ live = true }: { live?: boolean }) {
  const [goal, setGoal] = useState(62);
  const burst = useRef<any>(null);
  useInterval(() => { if (!live) return; setGoal((g) => (g >= 96 ? 62 : g + 6)); feel("tap", 5); }, live ? 1800 : null);
  const total = useCount(MEMBERS.reduce((s, m) => s + m.pts, 0));

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#5b9cd6" alt="#f2c14e" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 mt-2 flex items-center gap-3 px-4">
          <motion.div initial={{ scale: 0.4, rotate: -14 }} animate={{ scale: 1, rotate: 0 }} transition={S.pop}>
            <ClanEmblem />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="title-xl text-[18px] uppercase leading-tight">Клан «Ликвидность»</div>
            <div className="mono mt-0.5 text-[9.5px] font-bold text-mist">5 / 20 участников · ранг 14</div>
            <div className="mt-1.5 flex gap-1.5">
              <Tag tone="#5b9cd6">открытый</Tag>
              <Tag tone="#f2c14e">топ 8%</Tag>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-3 px-3">
          <Panel className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-mist">цель недели</span>
              <span className="mono text-[11px] font-extrabold text-teal">{goal}%</span>
            </div>
            <div className="mt-1.5 text-[12px] font-extrabold">Выиграть 300 боёв составом</div>
            <div className="mt-2"><Bar v={goal} tone="#3ec9a7" h={11} label={`${Math.round(goal * 3)} / 300`} /></div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-gold">
                <IcCoinMark size={11} /><span className="mono text-[9.5px] font-extrabold">+2 500</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-purple/15 px-2 py-1 text-purple">
                <IcCards size={11} /><span className="mono text-[9.5px] font-extrabold">×3 пак</span>
              </span>
              <span className="mono ml-auto text-[9.5px] font-bold text-mist">осталось 2д</span>
            </div>
          </Panel>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between px-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-mist">вклад состава</span>
          <span className="mono text-[10.5px] font-extrabold text-teal">{Math.round(total).toLocaleString("ru-RU")}</span>
        </div>

        <div className="no-bar relative z-10 mt-2 flex-1 space-y-1.5 overflow-y-auto px-3 pb-24">
          {MEMBERS.map((m, i) => (
            <motion.div key={m.n} layout initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06, ...S.soft }}
              className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-2.5 py-2"
              style={{
                background: m.you ? "linear-gradient(90deg,#1e3b37,#1a2338)" : "#1a2338",
                boxShadow: `inset 0 0 0 1px ${m.you ? "#3ec9a7" : "rgba(255,255,255,.06)"}`,
              }}>
              <motion.div className="absolute inset-y-0 left-0 opacity-[0.07]" style={{ background: m.tone }}
                initial={{ width: 0 }} animate={{ width: `${(m.pts / 5000) * 100}%` }} transition={{ ...S.soft, delay: 0.2 + i * 0.05 }} />
              <span className="mono relative w-4 text-[10px] font-extrabold text-mist">{i + 1}</span>
              <div className="relative"><Avatar seed={m.seed} size={30} tone={m.tone} ring={false} /></div>
              <div className="relative min-w-0 flex-1">
                <div className="truncate text-[11px] font-extrabold">{m.n}</div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider" style={{ color: m.tone }}>{m.role}</div>
              </div>
              <Spark data={[3, 5, 4, 6, 5, 7, 8]} tone={m.tone} w={44} h={18} />
              <span className="mono relative w-11 shrink-0 text-right text-[11px] font-extrabold tabular-nums">{m.pts}</span>
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-[76px] z-20">
          <BigButton tone="sky" icon={<IcSwords size={15} />}>КЛАНОВЫЙ БОЙ</BigButton>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

function ClanEmblem() {
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="clg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fb0e8" /><stop offset="1" stopColor="#2a5a94" />
        </linearGradient>
      </defs>
      <path d="M32 3 57 13v22c0 14-11 23-25 27C18 58 7 49 7 35V13L32 3Z" fill="url(#clg)" stroke="#0b1220" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 10 50 17v18c0 11-8 18-18 21" fill="#ffffff" opacity=".12" />
      <path d="M18 38c5-3 8-9 8-16M46 38c-5-3-8-9-8-16" stroke="#0b1220" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".5" />
      <circle cx="32" cy="30" r="8" fill="#0b1220" opacity=".4" />
      <path d="M26 33l5-8 4 5 4-7" stroke="#eaf2ff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* =====================================================================
   АССЕТ 27 · REPLAY — разбор боя по шагам с таймлайном
   ===================================================================== */
const STEPS = [
  { t: "Вход по тренду", ok: true, note: "Направление совпало со старшим ТФ", tone: "#3ec9a7" },
  { t: "Игнор объёма", ok: false, note: "Объём падал — сигнал был слабым", tone: "#e46a5f" },
  { t: "Стоп за структурой", ok: true, note: "Риск ограничен 1.2%", tone: "#3ec9a7" },
  { t: "Ранняя фиксация", ok: false, note: "Вышел до цели, недобрал 60%", tone: "#f2c14e" },
];

export function ReplayScreen({ live = true }: { live?: boolean }) {
  const [i, setI] = useTimeline(STEPS.length, 2200, live);
  const step = STEPS[i];
  const score = useCount(62 + i * 6);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#5b9cd6" alt="#9d8cf5" animate={live} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-sky">Разбор боя</div>
              <div className="title-xl mt-0.5 text-[17px] uppercase">Шаг {i + 1} из {STEPS.length}</div>
            </div>
            <Dial v={score} tone="#3ec9a7" size={64} thick={8} label={`${Math.round(score)}`} sub="оценка" />
          </div>
        </div>

        <div className="relative z-10 mt-2 px-3">
          <Panel className="relative grid place-items-center p-2">
            <CandleScene w={256} h={108} seed={5} level={64} marker={3 + i * 3} />
            <div className="mt-1 w-full px-1">
              <VolumeRow active={i} />
            </div>
          </Panel>
        </div>

        {/* таймлайн шагов */}
        <div className="relative z-10 mt-3 px-3">
          <div className="relative flex items-center justify-between">
            <div className="absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 rounded bg-white/8" />
            <motion.div className="absolute left-3 top-1/2 h-[2px] -translate-y-1/2 rounded bg-teal"
              animate={{ width: `${(i / (STEPS.length - 1)) * 82}%` }} transition={S.soft} />
            {STEPS.map((s, k) => (
              <motion.button key={s.t} onClick={() => { feel("tap"); setI(k); }}
                animate={{ scale: k === i ? 1.18 : 1 }} transition={S.pop}
                className="relative z-10 grid h-8 w-8 place-items-center rounded-full border-2"
                style={{
                  background: k <= i ? s.tone : "#16213a",
                  borderColor: k === i ? "#eaf2ff" : "#0b1220",
                  color: k <= i ? "#0b1220" : "#5f7496",
                }}>
                {s.ok ? <IcCheck size={14} /> : <IcWarn size={14} />}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-3 px-3">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ y: 18, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -14, opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.3, ease: E.out }}
              className="rounded-2xl p-3"
              style={{ background: `linear-gradient(170deg, ${step.tone}1c, #16213a)`, boxShadow: `inset 0 0 0 1px ${step.tone}55` }}>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: step.tone + "26", color: step.tone }}>
                  {step.ok ? <IcCheck size={16} /> : <IcWarn size={16} />}
                </span>
                <div className="flex-1">
                  <div className="text-[12.5px] font-extrabold">{step.t}</div>
                  <div className="text-[10px] font-bold text-mist">{step.note}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mt-auto mb-24 flex gap-2 px-3">
          <div className="flex-1"><BigButton tone="ghost" className="!py-2.5 !text-[11px]" icon={<IcPlay size={13} />}>ПОВТОР</BigButton></div>
          <div className="flex-1"><BigButton tone="teal" className="!py-2.5 !text-[11px]" icon={<IcCap size={13} />}>В АКАДЕМИЮ</BigButton></div>
        </div>
        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}

function VolumeRow({ active }: { active: number }) {
  const data = [4, 6, 5, 8, 7, 5, 4, 3, 6, 9, 7, 5, 4, 3];
  const max = Math.max(...data);
  return (
    <div className="flex h-6 items-end gap-[3px]">
      {data.map((v, i) => {
        const hot = Math.abs(i - (3 + active * 3)) < 1;
        return (
          <motion.span key={i} className="flex-1 rounded-sm"
            style={{ background: hot ? "#f2c14e" : "#31507a" }}
            initial={{ height: 2 }} animate={{ height: 3 + (v / max) * 20 }} transition={{ ...S.pop, delay: i * 0.02 }} />
        );
      })}
    </div>
  );
}
