import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ALL } from "../data/catalog";
import { S, E, feel, useInView } from "../lib/motion";
import { IcArrow, IcLayers, IcEye, IcClock } from "../ui/icons";

/* =====================================================================
   КАРТА ПУТИ ИГРОКА
   Экраны — не набор картинок, а граф переходов. Здесь видно,
   какой экран куда ведёт, где главный цикл, а где ответвления.
   Для каждого ребра указан рекомендуемый переход и его длительность.
   ===================================================================== */
type N = { id: string; x: number; y: number; lane: string };
type Edge = { a: string; b: string; tr: string; ms: number; loop?: boolean };

const LANES: { id: string; t: string; y: number; tone: string }[] = [
  { id: "entry", t: "Вход", y: 8, tone: "#8fa4c7" },
  { id: "core", t: "Главный цикл", y: 30, tone: "#3ec9a7" },
  { id: "reward", t: "Награда", y: 52, tone: "#f2c14e" },
  { id: "meta", t: "Мета и возврат", y: 74, tone: "#9d8cf5" },
  { id: "learn", t: "Обучение", y: 94, tone: "#e46a5f" },
];

const NODES: N[] = [
  { id: "onb", x: 6, y: 8, lane: "entry" },
  { id: "hub", x: 20, y: 30, lane: "core" },
  { id: "search", x: 34, y: 30, lane: "core" },
  { id: "intro", x: 48, y: 30, lane: "core" },
  { id: "round", x: 62, y: 30, lane: "core" },
  { id: "result", x: 76, y: 30, lane: "core" },
  { id: "levelup", x: 90, y: 30, lane: "core" },
  { id: "pack", x: 90, y: 52, lane: "reward" },
  { id: "daily", x: 20, y: 52, lane: "reward" },
  { id: "bp", x: 62, y: 52, lane: "reward" },
  { id: "shop", x: 76, y: 52, lane: "reward" },
  { id: "collection", x: 90, y: 74, lane: "meta" },
  { id: "profile", x: 34, y: 74, lane: "meta" },
  { id: "duel", x: 48, y: 74, lane: "meta" },
  { id: "resume", x: 6, y: 52, lane: "reward" },
  { id: "coach", x: 62, y: 74, lane: "meta" },
  { id: "journal", x: 62, y: 94, lane: "learn" },
  { id: "path", x: 34, y: 94, lane: "learn" },
  { id: "lesson", x: 48, y: 94, lane: "learn" },
  { id: "bestiary", x: 76, y: 74, lane: "meta" },
  { id: "league", x: 20, y: 74, lane: "meta" },
];

const EDGES: Edge[] = [
  { a: "onb", b: "hub", tr: "curtain", ms: 1100 },
  { a: "hub", b: "search", tr: "shared hero", ms: 450 },
  { a: "search", b: "intro", tr: "iris", ms: 700 },
  { a: "intro", b: "round", tr: "cut + impact", ms: 120 },
  { a: "round", b: "result", tr: "stamp", ms: 520 },
  { a: "result", b: "levelup", tr: "flash", ms: 500 },
  { a: "levelup", b: "pack", tr: "push", ms: 380 },
  { a: "result", b: "hub", tr: "push back", ms: 380, loop: true },
  { a: "hub", b: "daily", tr: "sheet", ms: 420 },
  { a: "result", b: "bp", tr: "push", ms: 380 },
  { a: "bp", b: "shop", tr: "tab morph", ms: 300 },
  { a: "pack", b: "collection", tr: "shared card", ms: 450 },
  { a: "hub", b: "profile", tr: "shared avatar", ms: 450 },
  { a: "profile", b: "duel", tr: "overlay", ms: 380 },
  { a: "duel", b: "intro", tr: "VS clash", ms: 600 },
  { a: "resume", b: "round", tr: "sync + iris", ms: 1700 },
  { a: "result", b: "coach", tr: "push", ms: 380 },
  { a: "coach", b: "journal", tr: "push", ms: 380 },
  { a: "journal", b: "lesson", tr: "push", ms: 380 },
  { a: "path", b: "lesson", tr: "shared node", ms: 450 },
  { a: "lesson", b: "round", tr: "iris", ms: 700 },
  { a: "collection", b: "bestiary", tr: "tab morph", ms: 300 },
  { a: "profile", b: "league", tr: "push", ms: 380 },
];

export function Journey({ openAsset }: { openAsset: (cat: string, id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>("round");
  const focus = hover ?? pinned;
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  const byId = useMemo(() => Object.fromEntries(ALL.map((a) => [a.id, a])), []);
  const nodes = NODES.filter((n) => byId[n.id]);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = EDGES.filter((e) => pos[e.a] && pos[e.b]);

  const related = (id: string | null) => {
    if (!id) return new Set<string>();
    const s = new Set<string>([id]);
    edges.forEach((e) => { if (e.a === id) s.add(e.b); if (e.b === id) s.add(e.a); });
    return s;
  };
  const rel = related(focus);
  const cur = focus ? byId[focus] : null;
  const ins = edges.filter((e) => e.b === focus);
  const outs = edges.filter((e) => e.a === focus);

  /* путь по кривой: горизонтальные рёбра — прямые, межполосные — S-кривая */
  const pathOf = (e: Edge) => {
    const A = pos[e.a], B = pos[e.b];
    if (e.loop) return `M${A.x},${A.y - 2.5} C${A.x - 10},${A.y - 16} ${B.x + 10},${B.y - 16} ${B.x},${B.y - 2.5}`;
    if (A.y === B.y) return `M${A.x},${A.y} L${B.x},${B.y}`;
    const my = (A.y + B.y) / 2;
    return `M${A.x},${A.y} C${A.x},${my} ${B.x},${my} ${B.x},${B.y}`;
  };

  return (
    <div className="relative min-h-screen pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]" style={{ background: "radial-gradient(55% 45% at 50% 0%, #9d8cf522, transparent)" }} />
      <div className="mesh absolute inset-x-0 top-0 h-[50vh] opacity-60" />

      <div className="relative mx-auto max-w-6xl px-5 pt-24">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.45em] text-purple">Флоу</div>
        <h1 className="title-xl mt-3 text-[12vw] uppercase leading-[0.88] sm:text-7xl">Путь игрока</h1>
        <p className="mt-4 max-w-2xl text-[14px] font-bold leading-relaxed text-mist">
          Все экраны каталога как единый граф. По рёбрам видно, какой переход использовать между конкретными экранами
          и сколько он длится. Главный цикл — верхняя полоса: его игрок проходит десятки раз в день, поэтому там
          самые короткие переходы.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto mt-10 grid max-w-6xl gap-6 px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* граф */}
        <div className="relative overflow-x-auto rounded-3xl border border-white/8 bg-[#0d1424]/80 no-bar">
          <div className="relative min-w-[760px]" style={{ aspectRatio: "16 / 10" }}>
            {/* полосы */}
            {LANES.map((l) => (
              <div key={l.id} className="absolute inset-x-0 flex items-center" style={{ top: `${l.y}%`, transform: "translateY(-50%)" }}>
                <div className="h-[46px] w-full border-y border-dashed" style={{ borderColor: l.tone + "1a", background: l.tone + "07" }} />
                <span className="absolute left-3 top-0 -translate-y-full pb-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.3em]" style={{ color: l.tone + "aa" }}>{l.t}</span>
              </div>
            ))}

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {edges.map((e, i) => {
                const on = focus ? (e.a === focus || e.b === focus) : false;
                const tone = byId[e.b].cat.color;
                return (
                  <g key={`${e.a}-${e.b}`}>
                    <motion.path d={pathOf(e)} fill="none" vectorEffect="non-scaling-stroke"
                      stroke={on ? tone : "rgba(143,164,199,.22)"} strokeWidth={on ? 2.2 : 1.2} strokeDasharray={e.loop ? "5 5" : undefined}
                      initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.9, delay: 0.2 + i * 0.03, ease: E.out }} />
                    {/* импульс сигнала по ребру */}
                    {inView && (
                      <motion.circle r="0.55" fill={on ? tone : "#8fa4c7"} opacity={on ? 1 : 0.5}
                        style={{ offsetPath: `path("${pathOf(e)}")` } as any}
                        initial={{ offsetDistance: "0%" } as any} animate={{ offsetDistance: "100%" } as any}
                        transition={{ duration: 1.4 + (e.ms / 1000) * 0.6, repeat: Infinity, ease: "linear", delay: (i % 7) * 0.35 }} />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* узлы */}
            {nodes.map((n, i) => {
              const a = byId[n.id];
              const on = rel.has(n.id);
              const main = n.id === focus;
              return (
                <motion.button key={n.id}
                  onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}
                  onClick={() => { feel("confirm"); setPinned(n.id); }}
                  onDoubleClick={() => openAsset(a.cat.id, a.id)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: main ? 1.12 : 1, opacity: focus && !on ? 0.35 : 1 } : {}}
                  transition={{ ...S.pop, delay: inView && !focus ? 0.3 + i * 0.03 : 0 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                  <span className="relative grid h-9 w-9 place-items-center rounded-xl"
                    style={{
                      background: main ? a.cat.color : `linear-gradient(180deg, ${a.cat.color}33, #16213a)`,
                      color: main ? "#08121a" : a.cat.color,
                      boxShadow: main ? `0 0 0 3px #0d1424, 0 0 0 5px ${a.cat.color}, 0 10px 26px -8px ${a.cat.color}` : `inset 0 0 0 1.5px ${a.cat.color}88`,
                    }}>
                    <IcLayers size={15} />
                    {main && <span className="absolute -inset-1.5 rounded-2xl border-2 ring-out" style={{ borderColor: a.cat.color }} />}
                  </span>
                  <span className="mt-1 whitespace-nowrap rounded-md bg-[#0d1424]/90 px-1.5 py-[1px] text-[9px] font-extrabold" style={{ color: on ? "#fff" : "#8fa4c7" }}>{a.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* панель выбранного узла */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {cur && (
              <motion.div key={cur.id} initial={{ opacity: 0, x: 20, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: E.out }} className="space-y-3 rounded-3xl border border-white/8 bg-[#111a2b]/85 p-5">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: cur.cat.color }}>{cur.cat.name}</div>
                <div className="title-xl text-2xl uppercase">{cur.title}</div>
                <p className="text-[12px] font-bold leading-relaxed text-mist">{cur.sub}</p>

                <FlowList title="входит из" list={ins.map((e) => ({ id: e.a, e }))} byId={byId} onPick={setPinned} />
                <FlowList title="ведёт в" list={outs.map((e) => ({ id: e.b, e }))} byId={byId} onPick={setPinned} />

                <button onClick={() => openAsset(cur.cat.id, cur.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]"
                  style={{ background: cur.cat.color, color: "#08121a" }}>
                  <IcEye size={14} /> открыть экран
                </button>
                <div className="text-center text-[9.5px] font-bold text-mist">клик — выбрать · двойной клик — открыть</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* сводка длительностей переходов */}
      <div className="relative mx-auto mt-10 max-w-6xl px-5">
        <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em]">бюджет переходов главного цикла</div>
          <p className="mt-1 text-[12px] font-bold text-mist">Сумма переходов от хаба до итогов — время, которое игрок тратит на «клей» между экранами за один бой.</p>
          <CycleBudget edges={edges.filter((e) => ["hub-search", "search-intro", "intro-round", "round-result"].includes(`${e.a}-${e.b}`))} byId={byId} />
        </div>
      </div>
    </div>
  );
}

function FlowList({ title, list, byId, onPick }: { title: string; list: { id: string; e: Edge }[]; byId: Record<string, any>; onPick: (id: string) => void }) {
  if (!list.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.25em] text-mist">{title}</div>
      <div className="space-y-1.5">
        {list.map(({ id, e }) => (
          <button key={id} onClick={() => { feel("tap"); onPick(id); }}
            className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-left hover:border-white/20">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: byId[id].cat.color }} />
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-extrabold">{byId[id].title}</span>
            <span className="mono shrink-0 text-[9.5px] font-bold text-mist">{e.tr}</span>
            <span className="mono shrink-0 rounded-md bg-black/40 px-1.5 py-0.5 text-[9.5px] font-bold" style={{ color: e.ms > 800 ? "#f2c14e" : "#3ec9a7" }}>{e.ms}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CycleBudget({ edges, byId }: { edges: Edge[]; byId: Record<string, any> }) {
  const total = edges.reduce((s, e) => s + e.ms, 0);
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className="mt-4">
      <div className="flex h-10 overflow-hidden rounded-xl bg-[#0b1220]">
        {edges.map((e, i) => (
          <motion.div key={`${e.a}-${e.b}`} className="relative flex items-center justify-center border-r border-[#0b1220]"
            initial={{ width: 0 }} animate={inView ? { width: `${(e.ms / total) * 100}%` } : {}} transition={{ ...S.soft, delay: i * 0.1 }}
            style={{ background: byId[e.b].cat.color + "99" }}>
            <span className="mono truncate px-1 text-[9px] font-extrabold text-[#08121a]">{e.tr}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {edges.map((e) => (
            <span key={`${e.a}-${e.b}`} className="flex items-center gap-1.5 text-[10.5px] font-bold text-mist">
              <span className="h-2 w-2 rounded-full" style={{ background: byId[e.b].cat.color }} />
              {byId[e.a].title} <IcArrow size={10} /> {byId[e.b].title} · <span className="mono text-white">{e.ms} мс</span>
            </span>
          ))}
        </div>
        <span className="mono flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-extrabold" style={{ color: total > 2500 ? "#f2c14e" : "#3ec9a7" }}>
          <IcClock size={13} /> {total} мс на бой
        </span>
      </div>
    </div>
  );
}
