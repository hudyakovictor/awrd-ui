import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, animate } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, PillTabs, Tag } from "../ui/kit";
import { S, feel, useImpact, Particles, useTimeline, useCount, stg, useInterval } from "../lib/motion";
import {
  IcLock, IcCheck, IcClose, IcArrow, IcStar, IcShield, IcFlame, IcTarget, IcBolt, IcEye, IcClock,
  IcTrend, IcWarn, IcCrown, IcTrophy, IcGem, IcBook, IcRefresh, ArtEntity, ArtSpark, ArtCandleChart,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 19 · BESTIARY — полевой справочник рыночных сущностей
   ===================================================================== */
type Ent = { id: string; n: string; kind: string; arch: string; threat: number; enc: number; wr: number; tone: string; locked?: boolean; weak: string; hist: number[] };
const ENTS: Ent[] = [
  { id: "fbp", n: "Фальшивый пробой", kind: "phantom", arch: "Фантом", threat: 35, enc: 12, wr: 75, tone: "#5b9cd6", weak: "Подтверждение объёмом", hist: [2, 3, 2, 4, 5, 4, 6, 7] },
  { id: "fomo", n: "Призрак FOMO", kind: "wraith", arch: "Фантом", threat: 50, enc: 8, wr: 62, tone: "#9d8cf5", weak: "План входа заранее", hist: [1, 2, 4, 3, 5, 4, 5, 6] },
  { id: "lev", n: "Гоблин плеча", kind: "goblin", arch: "Соблазн", threat: 45, enc: 6, wr: 50, tone: "#3ec9a7", weak: "Лимит риска 1%", hist: [3, 2, 3, 2, 4, 3, 4, 4] },
  { id: "head", n: "Титан заголовков", kind: "titan", arch: "Системный", threat: 70, enc: 3, wr: 33, tone: "#f2c14e", weak: "Проверка источника", hist: [1, 1, 2, 1, 3, 2, 2, 3] },
  { id: "honey", n: "Мимик-ловушка", kind: "mimic", arch: "Маскировка", threat: 55, enc: 0, wr: 0, tone: "#e46a5f", locked: true, weak: "Аудит ликвидности", hist: [0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "siren", n: "Сирена нарратива", kind: "siren", arch: "Психология", threat: 65, enc: 0, wr: 0, tone: "#9d8cf5", locked: true, weak: "Данные вместо истории", hist: [0, 0, 0, 0, 0, 0, 0, 0] },
];

export function Bestiary({ live = true }: { live?: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  const [f, setF] = useState(0);
  const [auto] = useTimeline(2, [4000, 3000], live);
  useEffect(() => { if (live) setSel(auto === 1 ? "fbp" : null); }, [auto, live]);
  const list = f === 0 ? ENTS : f === 1 ? ENTS.filter((e) => !e.locked) : ENTS.filter((e) => e.locked);
  const cur = ENTS.find((e) => e.id === sel);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <TopHUD compact />
        <div className="flex items-baseline justify-between px-4 pt-2">
          <div className="title-xl text-[19px] uppercase">Бестиарий</div>
          <span className="mono text-[11px] font-extrabold text-teal">4 / 6</span>
        </div>
        <div className="px-4 text-[9.5px] font-bold text-mist">Полевой справочник рыночных опасностей</div>
        <PillTabs tabs={["ВСЕ", "ИЗУЧЕНО", "ЗАКРЫТО"]} i={f} set={setF} />

        <LayoutGroup>
          <motion.div layout className="no-bar grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-3 pb-24">
            {list.map((e, i) => (
              <motion.button
                key={e.id}
                layout
                layoutId={`ent-${e.id}`}
                onClick={() => { feel(e.locked ? "deny" : "confirm"); setSel(e.locked ? null : e.id); }}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...S.pop, delay: stg(i, 0.055) }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden rounded-2xl p-2 text-left"
                style={{
                  background: e.locked ? "linear-gradient(180deg,#1a2338,#151d30)" : `linear-gradient(180deg, ${e.tone}1f, #16203a)`,
                  boxShadow: e.locked ? "inset 0 0 0 1px rgba(255,255,255,.05)" : `inset 0 0 0 1px ${e.tone}55`,
                }}
              >
                <div className="text-[9.5px] font-extrabold leading-tight">{e.n}</div>
                <div className="relative mt-1 grid h-[62px] place-items-center rounded-xl bg-black/35">
                  <motion.div animate={e.locked ? {} : { y: [0, -4, 0] }} transition={{ duration: 3.6 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}>
                    <ArtEntity kind={e.kind} tone={e.tone} size={54} dim={e.locked} />
                  </motion.div>
                  {e.locked && <span className="absolute grid h-7 w-7 place-items-center rounded-full bg-black/70 text-mist"><IcLock size={14} /></span>}
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-[8.5px] font-extrabold text-mist">УГРОЗА</span>
                  <span className="mono text-[10px] font-extrabold" style={{ color: e.locked ? "#6f83a6" : e.tone }}>{e.threat}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/45">
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #3ec9a7, ${e.threat > 60 ? "#e46a5f" : "#f2c14e"})` }}
                    initial={{ width: 0 }} animate={{ width: `${e.threat}%` }} transition={{ ...S.soft, delay: stg(i, 0.06) + 0.2 }} />
                </div>
                {!e.locked && (
                  <div className="mt-1.5 flex justify-between text-[8.5px] font-bold text-mist">
                    <span><b className="mono text-white">{e.enc}</b> встреч</span>
                    <span><b className="mono text-teal">{e.wr}%</b> побед</span>
                  </div>
                )}
                {e.locked && <div className="mt-1.5 text-[8.5px] font-bold text-mist">Ранг 6+</div>}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence>
            {cur && (
              <>
                <motion.div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)} />
                <motion.div
                  className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl border-t p-4 pb-6"
                  style={{ background: "#18223b", borderColor: cur.tone + "66" }}
                  initial={{ y: 420 }} animate={{ y: 0 }} exit={{ y: 420 }} transition={{ ...S.soft, damping: 27 }}
                >
                  <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
                  <div className="flex items-start gap-3">
                    <motion.div layoutId={`ent-${cur.id}`} className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
                      style={{ background: cur.tone + "1f", boxShadow: `inset 0 0 0 1px ${cur.tone}66` }}>
                      <ArtEntity kind={cur.kind} tone={cur.tone} size={52} />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-extrabold leading-tight">{cur.n}</div>
                      <div className="mt-1 flex gap-1.5"><Tag tone={cur.tone}>{cur.arch}</Tag><Tag tone="#e46a5f">УГРОЗА {cur.threat}</Tag></div>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] font-bold leading-snug text-mist">
                    Возникает у сопротивления: имитирует пробой всплеском объёма и резко разворачивается, забирая стопы.
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-teal/10 p-2.5" style={{ boxShadow: "inset 0 0 0 1px rgba(62,201,167,.35)" }}>
                    <span className="text-teal"><IcShield size={16} /></span>
                    <span className="text-[11px] font-extrabold">Слабость: <span className="text-teal">{cur.weak}</span></span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div>
                      <div className="text-[8.5px] font-extrabold uppercase tracking-wider text-mist">История встреч</div>
                      <ArtSpark data={cur.hist} tone={cur.tone} w={130} h={36} />
                    </div>
                    <div className="flex-1"><BigButton tone="teal" icon={<IcBolt size={15} />} className="!py-3">ВЫЗВАТЬ</BigButton></div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </LayoutGroup>

        <BottomNav active="collection" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 20 · SKILL TREE — ветвление навыков с тратой очков
   ===================================================================== */
type Node = { id: number; x: number; y: number; p: number[]; t: string; Icon: any; cost: number };
const TREE: Node[] = [
  { id: 0, x: 50, y: 90, p: [], t: "База", Icon: IcStar, cost: 0 },
  { id: 1, x: 24, y: 71, p: [0], t: "Тренд", Icon: IcTrend, cost: 1 },
  { id: 2, x: 76, y: 71, p: [0], t: "Риск", Icon: IcShield, cost: 1 },
  { id: 3, x: 14, y: 50, p: [1], t: "MTF", Icon: IcEye, cost: 2 },
  { id: 4, x: 40, y: 48, p: [1, 2], t: "Объём", Icon: IcBolt, cost: 2 },
  { id: 5, x: 84, y: 48, p: [2], t: "Стоп", Icon: IcTarget, cost: 2 },
  { id: 6, x: 26, y: 26, p: [3, 4], t: "Сетап", Icon: IcCrown, cost: 3 },
  { id: 7, x: 68, y: 26, p: [4, 5], t: "Сайзинг", Icon: IcGem, cost: 3 },
];

export function SkillTree({ live = true }: { live?: boolean }) {
  const [own, setOwn] = useState<number[]>([0, 1]);
  const [pts, setPts] = useState(6);
  const burst = useRef<any>(null);
  const shown = useCount(pts, 0.5);

  const can = (n: Node) => !own.includes(n.id) && n.p.some((p) => own.includes(p)) && pts >= n.cost;
  const buy = (n: Node) => {
    if (own.includes(n.id)) return feel("tap");
    if (!can(n)) return feel("deny", 20);
    setOwn((o) => [...o, n.id]); setPts((p) => p - n.cost); feel("reward", [10, 22, 10]);
    burst.current?.((n.x / 100) * 320, (n.y / 100) * 420 + 100, { n: 24, power: 8, colors: ["#3ec9a7", "#f2c14e"] });
  };
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const next = TREE.find((n) => can(n));
      if (next) buy(next); else { setOwn([0, 1]); setPts(6); }
    }, 2200);
    return () => clearInterval(t);
  }, [live, own, pts]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />
        <div className="flex items-center justify-between px-4 pt-2">
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-teal">Ветка «Техника»</div>
            <div className="title-xl text-[18px] uppercase">Дерево навыков</div>
          </div>
          <motion.div animate={{ scale: pts > 0 ? [1, 1.06, 1] : 1 }} transition={{ duration: 1.8, repeat: Infinity }}
            className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-gold" style={{ boxShadow: "inset 0 0 0 1px rgba(242,193,78,.45)" }}>
            <IcStar size={14} /><span className="mono text-[13px] font-extrabold">{Math.round(shown)}</span>
          </motion.div>
        </div>

        <div className="relative flex-1">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {TREE.flatMap((n) => n.p.map((p) => {
              const a = TREE[p], on = own.includes(n.id) && own.includes(p);
              return (
                <motion.line key={`${p}-${n.id}`} x1={a.x} y1={a.y} x2={n.x} y2={n.y}
                  stroke={on ? "#3ec9a7" : "rgba(255,255,255,.1)"} strokeWidth={on ? 2.6 : 1.8} vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.1 + n.id * 0.05 }} />
              );
            }))}
          </svg>
          {TREE.map((n, i) => {
            const has = own.includes(n.id), open = can(n);
            return (
              <motion.button key={n.id} onClick={() => buy(n)} style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: open ? 1.06 : 1, opacity: 1 }}
                transition={{ ...S.pop, delay: stg(i, 0.05) }} whileTap={{ scale: 0.88 }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl chip-3d"
                  style={{
                    background: has ? "linear-gradient(180deg,#54dcb6,#2a9b81)" : open ? "linear-gradient(180deg,#f7d271,#d29a20)" : "linear-gradient(180deg,#26324c,#1b2540)",
                    color: has ? "#06231c" : open ? "#3c2a04" : "#5f7496",
                  }}>
                  {has ? <IcCheck size={20} /> : open ? <n.Icon size={20} /> : <IcLock size={17} />}
                  {open && <motion.span className="absolute -inset-1 rounded-2xl border-2 border-gold ring-out" />}
                </span>
                <span className="rounded-full bg-black/55 px-1.5 py-[1px] text-[8.5px] font-extrabold"
                  style={{ color: has ? "#3ec9a7" : open ? "#f2c14e" : "#6f83a6" }}>
                  {n.t}{n.cost > 0 && !has ? ` · ${n.cost}` : ""}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mb-24 px-3">
          <Panel className="flex items-center gap-3 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/16 text-teal"><IcBook size={17} /></span>
            <div className="flex-1">
              <div className="text-[11.5px] font-extrabold">Открыто {own.length} из {TREE.length}</div>
              <div className="mt-1"><Bar v={own.length} max={TREE.length} tone="#3ec9a7" h={7} /></div>
            </div>
            <button onClick={() => { setOwn([0, 1]); setPts(6); feel("deny"); }} className="text-mist"><IcRefresh size={16} /></button>
          </Panel>
        </div>
        <BottomNav active="academy" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 21 · ERROR JOURNAL — журнал ошибок с разворотом строки
   ===================================================================== */
const ERRORS = [
  { id: "vol", t: "Игнор объёма", n: 9, trend: [4, 5, 4, 3, 3, 2, 2, 1], tone: "#e46a5f", fix: "Перед входом проверь: объём растёт на пробое или падает?" },
  { id: "size", t: "Перебор позиции", n: 6, trend: [1, 2, 3, 3, 4, 3, 2, 2], tone: "#f2c14e", fix: "Считай размер от стопа, а не от желания. Лимит риска 1%." },
  { id: "mtf", t: "Один таймфрейм", n: 4, trend: [3, 3, 2, 2, 2, 1, 1, 1], tone: "#9d8cf5", fix: "Смотри старший ТФ до входа: он задаёт направление." },
  { id: "rev", t: "Месть рынку", n: 2, trend: [2, 1, 1, 1, 0, 0, 1, 0], tone: "#5b9cd6", fix: "После двух убытков подряд — стоп-день. Это правило, не совет." },
];
export function ErrorJournal({ live = true }: { live?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [auto] = useTimeline(ERRORS.length, 2600, live);
  useEffect(() => { if (live) setOpen(ERRORS[auto].id); }, [auto, live]);
  const fixed = useCount(72);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <TopHUD compact />
        <div className="px-4 pt-2">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-coral">Работа над ошибками</div>
          <div className="title-xl text-[19px] uppercase">Журнал ошибок</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 px-3">
          {[
            { l: "ИСПРАВЛЕНО", v: `${Math.round(fixed)}%`, tone: "#3ec9a7", Icon: IcCheck },
            { l: "СЕРИЯ", v: "5 дн", tone: "#f2c14e", Icon: IcFlame },
            { l: "ОТКРЫТО", v: "4", tone: "#e46a5f", Icon: IcWarn },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.pop, delay: stg(i, 0.06) }}
              className="panel rounded-2xl px-2 py-2.5 text-center">
              <span className="grid place-items-center" style={{ color: s.tone }}><s.Icon size={16} /></span>
              <div className="mono mt-1 text-[13px] font-extrabold">{s.v}</div>
              <div className="text-[7.5px] font-extrabold tracking-widest text-mist">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <div className="no-bar mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-24">
          {ERRORS.map((e, i) => {
            const on = open === e.id;
            return (
              <motion.button
                key={e.id}
                layout
                onClick={() => { feel("tap"); setOpen(on ? null : e.id); }}
                initial={{ x: -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...S.soft, delay: stg(i, 0.06) }}
                className="block w-full overflow-hidden rounded-2xl p-3 text-left"
                style={{ background: on ? `linear-gradient(180deg, ${e.tone}1f, #18223b)` : "#1b2540", boxShadow: `inset 0 0 0 1px ${on ? e.tone + "66" : "rgba(255,255,255,.06)"}` }}
              >
                <motion.div layout className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: e.tone + "22", color: e.tone }}><IcWarn size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-extrabold">{e.t}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                      <motion.div className="h-full rounded-full" style={{ background: e.tone }} initial={{ width: 0 }} animate={{ width: `${e.n * 10}%` }} transition={S.soft} />
                    </div>
                  </div>
                  <span className="mono shrink-0 text-[12px] font-extrabold" style={{ color: e.tone }}>×{e.n}</span>
                  <motion.span animate={{ rotate: on ? 90 : 0 }} transition={S.pop} className="shrink-0 text-mist"><IcArrow size={14} /></motion.span>
                </motion.div>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div layout initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ ...S.soft, damping: 28 }} className="overflow-hidden">
                      <div className="flex items-end gap-3 pt-3">
                        <div>
                          <div className="text-[8px] font-extrabold uppercase tracking-wider text-mist">Динамика 8 недель</div>
                          <ArtSpark data={e.trend} tone={e.tone} w={116} h={32} />
                        </div>
                        <div className="flex-1 rounded-xl bg-black/30 p-2 text-[10px] font-bold leading-snug text-white/85">{e.fix}</div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-teal/15 px-2 py-1 text-[9px] font-extrabold text-teal"><IcTarget size={11} /> Тренажёр</span>
                        <span className="flex items-center gap-1 rounded-full bg-white/8 px-2 py-1 text-[9px] font-extrabold text-mist"><IcClock size={11} /> 6 мин</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <BottomNav active="academy" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 22 · DAILY PUZZLE — перетащи уровень входа в верную зону
   ===================================================================== */
export function DailyPuzzle({ live = true }: { live?: boolean }) {
  const y = useMotionValue(0);
  const [res, setRes] = useState<null | "ok" | "bad">(null);
  const imp = useImpact();
  const burst = useRef<any>(null);
  const TARGET = 24;

  const judge = () => {
    const d = Math.abs(y.get() - TARGET);
    const ok = d < 18;
    setRes(ok ? "ok" : "bad");
    feel(ok ? "reward" : "deny", ok ? [10, 26, 10] : 30);
    imp.fire(ok ? 8 : 14, 0.35);
    if (ok) burst.current?.(160, 250, { n: 36, power: 10 });
    setTimeout(() => { setRes(null); animate(y, 0, S.pop); }, 1900);
  };
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      animate(y, TARGET + (Math.random() > 0.35 ? 4 : 46), { ...S.soft, onComplete: judge } as any);
    }, 4200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />
        <div className="px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">Задача дня · 14/30</div>
          <div className="title-xl mt-0.5 text-[18px] uppercase">Где ставить вход?</div>
          <div className="mt-1 text-[10.5px] font-bold text-mist">Перетащи линию в зону ретеста</div>
        </div>

        <div className="mt-3 px-3">
          <Panel className="relative overflow-hidden p-3">
            <div className="relative h-[190px]">
              <div className="absolute inset-0 grid place-items-center opacity-90"><ArtCandleChart w={270} h={170} /></div>
              {/* верная зона */}
              <motion.div className="absolute inset-x-0 h-12 rounded-lg border border-dashed"
                style={{ top: 92, borderColor: "#3ec9a766", background: "#3ec9a712" }}
                animate={{ opacity: res ? 1 : [0.35, 0.7, 0.35] }} transition={{ duration: 2.4, repeat: res ? 0 : Infinity }} />
              {/* перетаскиваемая линия */}
              <motion.div
                drag="y" dragConstraints={{ top: -70, bottom: 70 }} dragElastic={0.12} style={{ y }}
                onDragStart={() => feel("tap", 6)} onDragEnd={judge}
                whileDrag={{ scale: 1.03 }}
                className="absolute inset-x-0 top-[86px] z-10 flex cursor-grab touch-none items-center active:cursor-grabbing"
              >
                <div className="h-[3px] flex-1 rounded-full" style={{ background: res === "ok" ? "#3ec9a7" : res === "bad" ? "#e46a5f" : "#f2c14e" }} />
                <span className="mono ml-1 rounded-lg px-2 py-1 text-[10px] font-extrabold"
                  style={{ background: res === "ok" ? "#3ec9a7" : res === "bad" ? "#e46a5f" : "#f2c14e", color: "#0b1120" }}>ВХОД</span>
              </motion.div>
            </div>
          </Panel>
        </div>

        <AnimatePresence>
          {res && (
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -12, opacity: 0 }} transition={S.pop}
              className="mx-4 mt-3 flex items-center gap-2.5 rounded-2xl p-3"
              style={{ background: res === "ok" ? "#3ec9a71f" : "#e46a5f1f", boxShadow: `inset 0 0 0 1px ${res === "ok" ? "#3ec9a7" : "#e46a5f"}66` }}>
              <span style={{ color: res === "ok" ? "#3ec9a7" : "#e46a5f" }}>{res === "ok" ? <IcCheck size={20} /> : <IcClose size={20} />}</span>
              <div className="flex-1 text-[11px] font-bold leading-snug">
                {res === "ok" ? <><b>Верно.</b> Вход на ретесте пробитого уровня, стоп под зоной.</> : <><b>Мимо.</b> Это вход «в пустоту»: до зоны ретеста ещё далеко.</>}
              </div>
              {res === "ok" && <span className="mono shrink-0 rounded-full bg-gold/20 px-2 py-1 text-[10px] font-extrabold text-gold">+150 XP</span>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto mb-24 space-y-2 px-4">
          <div className="flex items-center gap-2">
            <Bar v={14} max={30} tone="#f2c14e" h={8} />
            <span className="mono text-[10px] font-extrabold text-mist">14/30</span>
          </div>
          <BigButton tone="ghost" icon={<IcEye size={15} />}>ПОДСКАЗКА · 50</BigButton>
        </div>
        <BottomNav active="academy" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 23 · TOURNAMENT — живая сетка турнира и путь игрока
   ===================================================================== */
export function Tournament({ live = true }: { live?: boolean }) {
  const [round, setRound] = useState(1);
  const pool = useCount(48200 + round * 1500);
  const burst = useRef<any>(null);
  useInterval(() => {
    if (!live) return;
    setRound((r) => (r >= 3 ? 1 : r + 1));
    feel("confirm");
    burst.current?.(160, 230, { n: 20, power: 8, colors: ["#f2c14e"] });
  }, live ? 3000 : null);

  const R1 = ["ТЫ", "K_WOLF", "LIQ", "NOVA", "SVECHA", "DELTA", "HODL", "BEAR"];
  const col = (n: number) => Array.from({ length: n });

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-40" />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">Турнир · LIVE</div>
              <div className="title-xl text-[18px] uppercase">Bull Run Blitz</div>
            </div>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
              className="flex items-center gap-1.5 rounded-full bg-coral/18 px-2.5 py-1.5 text-coral" style={{ boxShadow: "inset 0 0 0 1px rgba(228,106,95,.5)" }}>
              <IcClock size={13} /><span className="mono text-[11px] font-extrabold">29:45</span>
            </motion.div>
          </div>
          <Panel className="mt-2 flex items-center gap-3 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/16 text-gold"><IcTrophy size={20} /></span>
            <div className="flex-1">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-mist">Призовой фонд</div>
              <div className="mono text-[15px] font-extrabold text-gold">{Math.round(pool).toLocaleString("ru-RU")}</div>
            </div>
            <div className="text-right">
              <div className="mono text-[13px] font-extrabold">45</div>
              <div className="text-[8px] font-extrabold tracking-widest text-mist">ТВОЁ МЕСТО</div>
            </div>
          </Panel>
        </div>

        {/* сетка */}
        <div className="relative z-10 mt-3 flex flex-1 gap-1.5 px-3">
          {[0, 1, 2, 3].map((c) => (
            <div key={c} className="flex flex-1 flex-col justify-around">
              {col(8 / 2 ** c).map((_, r) => {
                const mine = r === 0;
                const played = c < round;
                const nowPlaying = c === round - 1;
                return (
                  <motion.div key={r}
                    initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ ...S.soft, delay: stg(c * 2 + r, 0.035) }}
                    className="relative my-[3px] rounded-lg px-1.5 py-1.5"
                    style={{
                      background: mine && played ? "linear-gradient(90deg,#1e4038,#1b2740)" : played ? "#1b2540" : "#151d30",
                      boxShadow: mine ? "inset 0 0 0 1.5px #3ec9a7" : "inset 0 0 0 1px rgba(255,255,255,.06)",
                      opacity: played ? 1 : 0.5,
                    }}>
                    <div className="mono truncate text-[8.5px] font-extrabold" style={{ color: mine ? "#3ec9a7" : "#cfe0f7" }}>
                      {c === 0 ? R1[r] : mine ? "ТЫ" : "—"}
                    </div>
                    {mine && nowPlaying && <motion.span className="absolute -inset-[2px] rounded-lg border border-teal ring-out" />}
                    {mine && played && c > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop}
                        className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-teal text-[#06231c]"><IcCheck size={9} /></motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[0, 1, 2].map((c) => (
              <motion.line key={c} x1={(c + 1) * 25 - 3} y1="50" x2={(c + 1) * 25 + 3} y2="50"
                stroke="#3ec9a7" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }} animate={{ pathLength: c < round ? 1 : 0 }} transition={{ duration: 0.5 }} />
            ))}
          </svg>
        </div>

        <div className="relative z-10 mb-24 px-4">
          <div className="mb-2 flex justify-between text-[9px] font-extrabold uppercase tracking-wider text-mist">
            <span>раунд {round} из 3</span><span>до топ-10: 12 очков</span>
          </div>
          <BigButton tone="gold" icon={<IcBolt size={16} />}>ИГРАТЬ РАУНД</BigButton>
        </div>
        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}
