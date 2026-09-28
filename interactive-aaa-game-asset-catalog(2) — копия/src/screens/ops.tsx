import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, BigButton, PillTabs, Tag } from "../ui/kit";
import { S, E, feel, useCount, useTimeline, Particles, useImpact, useInterval } from "../lib/motion";
import { StatusChip, Spark, Avatar, Dial, ProgressPath, SceneBackdrop, StatRadar } from "../ui/art";
import {
  IcArrow, IcCheck, IcClose, IcClock, IcFlame, IcSwords, IcTrophy,
  IcBolt, IcTarget, IcWarn, IcGauge,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 42 · LIVE OPS CALENDAR — расписание ивентов недели
   ===================================================================== */
type Ev = {
  id: number; t: string; s: string; tone: string; Icon: any;
  state: "live" | "soon" | "done"; when: string; reward: string; hours: number;
};
const EVENTS: Ev[] = [
  { id: 1, t: "Нашествие китов", s: "Кооперативный босс", tone: "#e46a5f", Icon: IcSwords, state: "live", when: "сейчас", reward: "+2 500 ◉", hours: 3 },
  { id: 2, t: "Дуэльный вечер", s: "Ранговые бои ×2 XP", tone: "#9d8cf5", Icon: IcBolt, state: "soon", when: "через 2 ч", reward: "×2 XP", hours: 6 },
  { id: 3, t: "Головоломки дня", s: "Серия из трёх", tone: "#f2c14e", Icon: IcTarget, state: "soon", when: "завтра", reward: "3 пака", hours: 12 },
  { id: 4, t: "Турнир клуба", s: "Сетка на 8", tone: "#5b9cd6", Icon: IcTrophy, state: "soon", when: "суббота", reward: "герб", hours: 20 },
  { id: 5, t: "Недельный забег", s: "Закрыт вчера", tone: "#3ec9a7", Icon: IcFlame, state: "done", when: "вчера", reward: "выдано", hours: 0 },
];

export function EventCalendar({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState<number>(1);
  const [now, setNow] = useState(0);
  const burst = useRef<any>(null);
  const imp = useImpact();

  useInterval(() => {
    if (!live) return;
    setNow((n) => (n + 1) % 3);
    const e = EVENTS[(now + 1) % EVENTS.length];
    setSel(e.id);
    if (e.state === "live") { feel("reward", [10, 24, 10]); imp.fire(9, 0.3); burst.current?.(160, 120, { n: 22, power: 8 }); }
    else feel("tap", 6);
  }, live ? 2600 : null);

  const list = tab === 0 ? EVENTS : tab === 1 ? EVENTS.filter((e) => e.state !== "done") : EVENTS.filter((e) => e.state === "done");
  const cur = EVENTS.find((e) => e.id === sel)!;
  const week = useCount(68, 1.2);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#e46a5f" alt="#f2c14e" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="title-xl text-[18px] uppercase">Календарь событий</div>
              <div className="text-[9.5px] font-bold text-mist">Неделя 12 · сезон 1</div>
            </div>
            <StatusChip t="3 активных" tone="#e46a5f" pulse />
          </div>
        </div>

        {/* полоса недели */}
        <div className="relative z-10 mt-2.5 px-3">
          <Panel className="p-2.5">
            <div className="flex items-end justify-between gap-1">
              {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map((d, i) => {
                const past = i < 3;
                const active = i === 3;
                const has = i === 1 || i === 3 || i === 5;
                return (
                  <div key={d} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div
                      animate={{ height: past ? 12 : active ? 22 : 16, background: past ? "#3ec9a7" : active ? "#e46a5f" : "#2b3559" }}
                      transition={S.soft}
                      className="w-full rounded-lg"
                      style={{ boxShadow: active ? "0 0 14px -2px #e46a5f" : "none" }} />
                    {has && <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: past ? "#3ec9a7" : "#f2c14e" }}
                      animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }} />}
                    <span className="text-[8px] font-extrabold" style={{ color: active ? "#e46a5f" : past ? "#3ec9a7" : "#5f7496" }}>{d}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2"><ProgressPath v={week} max={100} tone="#e46a5f" ticks={4} h={7} /></div>
          </Panel>
        </div>

        <PillTabs tabs={["ВСЕ", "ПРЕДСТОЯТ", "ЗАВЕРШЕНЫ"]} i={tab} set={setTab} tone="#e46a5f" />

        <LayoutGroup>
          <div className="no-bar relative z-10 flex-1 space-y-1.5 overflow-y-auto px-3 pb-24">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((e, k) => {
                const isSel = sel === e.id;
                return (
                  <motion.button key={e.id} layout
                    onClick={() => { feel("tap"); setSel(e.id); }}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: e.state === "done" ? 0.52 : 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: Math.min(k * 0.05, 0.2), ...S.soft }}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-left"
                    style={{
                      background: isSel ? `linear-gradient(100deg, ${e.tone}1c, #16213a)` : "#1a2338",
                      boxShadow: `inset 0 0 0 1px ${isSel ? e.tone + "77" : "rgba(255,255,255,.05)"}`,
                    }}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ background: e.tone + "22", color: e.state === "done" ? "#5f7496" : e.tone }}>
                      <e.Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[11.5px] font-extrabold">{e.t}</span>
                        {e.state === "live" && <StatusChip t="live" tone={e.tone} pulse />}
                      </div>
                      <div className="mt-0.5 text-[9px] font-bold text-mist">{e.s} · {e.when}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="mono text-[10px] font-extrabold" style={{ color: e.state === "done" ? "#5f7496" : "#f2c14e" }}>{e.reward}</div>
                      {e.hours > 0 && <div className="mono text-[8.5px] font-bold text-mist">{e.hours} ч</div>}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        {/* детали выбранного */}
        <div className="absolute inset-x-3 bottom-[76px] z-20">
          <AnimatePresence mode="wait">
            <motion.div key={cur.id} initial={{ y: 18, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.28, ease: E.out }}>
              <Panel className="flex items-center gap-2.5 p-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-extrabold">{cur.t}</div>
                  <div className="text-[9px] font-bold text-mist">Награда: {cur.reward} · ещё {cur.hours || 0} ч</div>
                </div>
                <BigButton tone={cur.state === "live" ? "coral" : cur.state === "done" ? "ghost" : "sky"}
                  className="!w-auto !px-4 !py-2.5 !text-[11px]" icon={<IcArrow size={13} />}>
                  {cur.state === "live" ? "УЧАСТВОВАТЬ" : cur.state === "done" ? "ОТКРЫТО" : "НАПОМНИТЬ"}
                </BigButton>
              </Panel>
            </motion.div>
          </AnimatePresence>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 43 · OPPONENT SCOUT — разведка соперника перед боем
   ===================================================================== */
type Tell = { t: string; d: string; tone: string; Icon: any };
const TELLS: Tell[] = [
  { t: "Входит без объёма", d: "62% сделок открыты на слабом сигнале", tone: "#e46a5f", Icon: IcWarn },
  { t: "Держит позицию", d: "Средняя длительность 4 ч 12 мин", tone: "#3ec9a7", Icon: IcClock },
  { t: "Уязвим к новостям", d: "Три поражения из четырёх после публикаций", tone: "#f2c14e", Icon: IcBolt },
  { t: "Рискует крупно", d: "Средний размер позиции 3.4%", tone: "#9d8cf5", Icon: IcGauge },
];

export function OpponentScout({ live = true }: { live?: boolean }) {
  const [i] = useTimeline(TELLS.length, 2200, live);
  const [tab, setTab] = useState(0);
  const burst = useRef<any>(null);
  const exp = useCount(74, 1.2);
  const [shaken, setShaken] = useState(false);
  const imp = useImpact();

  useEffect(() => {
    if (!live) return;
    setShaken(true); imp.fire(5, 0.24);
    const t = setTimeout(() => setShaken(false), 420);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#5b9cd6" alt="#9d8cf5" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        {/* шапка соперника */}
        <div className="relative z-10 mt-2 px-4">
          <motion.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={S.soft}
            className="flex items-center gap-3">
            <motion.div animate={shaken ? { rotate: [0, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
              <Avatar seed={9} size={58} tone="#9d8cf5" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="mono text-[9.5px] font-bold text-mist">соперник · MMR 4 310</div>
              <div className="title-xl text-[18px] uppercase leading-tight">CRYPTO_K</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Tag tone="#9d8cf5">ЗОЛОТО II</Tag>
                <StatusChip t="онлайн" tone="#3ec9a7" pulse />
              </div>
            </div>
            <div>
              <Dial v={exp} tone="#5b9cd6" size={66} thick={7} label={`${Math.round(exp)}`} sub="опыт" />
            </div>
          </motion.div>
        </div>

        <PillTabs tabs={["ПОЧЕРК", "ИСТОРИЯ", "СИЛЬНЫЕ"]} i={tab} set={setTab} tone="#5b9cd6" />

        <div className="no-bar relative z-10 flex-1 overflow-y-auto px-3 pb-24">
          <AnimatePresence mode="wait">
            {tab === 0 && (
              <motion.div key="a" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.28, ease: E.out }} className="space-y-1.5">
                {TELLS.map((t, k) => (
                  <motion.div key={t.t} initial={{ x: -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: k * 0.07, ...S.soft }}
                    className="relative flex items-start gap-2.5 rounded-2xl px-2.5 py-2.5"
                    style={{
                      background: i === k ? `linear-gradient(100deg, ${t.tone}18, #16213a)` : "#1a2338",
                      boxShadow: `inset 0 0 0 1px ${i === k ? t.tone + "66" : "rgba(255,255,255,.05)"}`,
                    }}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: t.tone + "22", color: t.tone }}>
                      <t.Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] font-extrabold">{t.t}</div>
                      <div className="mt-0.5 text-[9.5px] font-bold leading-snug text-mist">{t.d}</div>
                    </div>
                    {i === k && (
                      <motion.span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.tone }}
                        animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                  </motion.div>
                ))}

                <Panel className="mt-3 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.26em] text-mist">профиль риска</span>
                    <StatusChip t="агрессивный" tone="#e46a5f" />
                  </div>
                  <div className="mt-2"><StatRadar values={[78, 42, 55, 88, 34]} labels={["АГР", "СТАБ", "ОБЪЁМ", "ТЕМП", "ЗАЩ"]} size={166} tone="#5b9cd6" /></div>
                </Panel>
              </motion.div>
            )}

            {tab === 1 && (
              <motion.div key="b" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.28, ease: E.out }} className="space-y-1.5">
                {[
                  { f: "BEAR_WHALE", r: "победа", pts: 2380, tone: "#3ec9a7", tr: [3, 5, 4, 7, 6, 9, 10] },
                  { f: "FUD_GEN", r: "поражение", pts: 940, tone: "#e46a5f", tr: [8, 7, 5, 4, 3, 3, 2] },
                  { f: "PUMP_BOT", r: "победа", pts: 2010, tone: "#3ec9a7", tr: [2, 4, 5, 5, 7, 8, 9] },
                ].map((b, k) => (
                  <motion.div key={b.f} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: k * 0.07, ...S.soft }}
                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2"
                    style={{ background: "#1a2338", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" }}>
                    <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: b.tone + "22", color: b.tone }}>
                      {b.r === "победа" ? <IcTrophy size={15} /> : <IcClose size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-extrabold">против {b.f}</div>
                      <div className="text-[9px] font-bold" style={{ color: b.tone }}>{b.r}</div>
                    </div>
                    <Spark data={b.tr} tone={b.tone} w={52} h={20} />
                    <span className="mono w-11 shrink-0 text-right text-[11px] font-extrabold">{b.pts}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {tab === 2 && (
              <motion.div key="c" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.28, ease: E.out }} className="space-y-3">
                <Panel className="p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-mist">план на бой</div>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { t: "Ждать его первого входа", ok: true },
                      { t: "Работать только на объёме", ok: true },
                      { t: "Не вступать в новостное окно", ok: true },
                      { t: "Гнать за ценой", ok: false },
                    ].map((p) => (
                      <motion.div key={p.t} initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, ...S.soft }}
                        className="flex items-start gap-2 rounded-xl px-2.5 py-2"
                        style={{ background: p.ok ? "#3ec9a712" : "#e46a5f12" }}>
                        <span className="mt-0.5" style={{ color: p.ok ? "#3ec9a7" : "#e46a5f" }}>
                          {p.ok ? <IcCheck size={13} /> : <IcClose size={13} />}
                        </span>
                        <span className="text-[10.5px] font-bold text-white/85">{p.t}</span>
                      </motion.div>
                    ))}
                  </div>
                </Panel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: "батлов", v: 248, t: "#5b9cd6" },
                    { l: "винрейт", v: "67%", t: "#3ec9a7" },
                    { l: "серия", v: "×4", t: "#f2c14e" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl bg-white/[0.035] py-2 text-center">
                      <div className="mono text-[13px] font-extrabold" style={{ color: m.t }}>{m.v}</div>
                      <div className="text-[7.5px] font-bold uppercase tracking-widest text-mist">{m.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-3 bottom-[76px] z-20">
          <BigButton tone="sky" icon={<IcSwords size={15} />}>ВЫЗВАТЬ НА БОЙ</BigButton>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}
