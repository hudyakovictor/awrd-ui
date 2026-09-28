import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";
import { Device, StatusBar, GameHUD, GameButton } from "./Device";
import { Mascot } from "./Mascot";
import { ChestArt, CoinArt, GemArt, CrownArt, WhaleArt, CandleArt, TrophyArt, StarArt } from "./art";
import { sfx, Confetti } from "./Juice";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */
type NodeKind = "lesson" | "chest" | "boss" | "practice" | "story";
type NodeState = "done" | "active" | "locked";
type MapNode = { k: NodeKind; s: NodeState; t: string };
type Unit = { title: string; sub: string; c: string; e: string; deco: "hills" | "city" | "cave" | "ocean"; nodes: MapNode[] };

const INITIAL: Unit[] = [
  {
    title: "Genesis Block",
    sub: "Money, ledgers & why crypto exists",
    c: "#2be08a",
    e: "#0f7048",
    deco: "hills",
    nodes: [
      { k: "lesson", s: "done", t: "What is money?" },
      { k: "story", s: "done", t: "Satoshi's white paper" },
      { k: "lesson", s: "done", t: "Blocks & hashes" },
      { k: "chest", s: "done", t: "Genesis chest" },
      { k: "boss", s: "done", t: "Checkpoint: Ledger" },
    ],
  },
  {
    title: "Candle Language",
    sub: "Read price like a native",
    c: "#38e1ff",
    e: "#0b6f8d",
    deco: "city",
    nodes: [
      { k: "lesson", s: "done", t: "Anatomy of a candle" },
      { k: "lesson", s: "done", t: "Wicks & rejection" },
      { k: "practice", s: "active", t: "Engulfing patterns" },
      { k: "lesson", s: "locked", t: "Doji & indecision" },
      { k: "chest", s: "locked", t: "Chartist chest" },
      { k: "boss", s: "locked", t: "Checkpoint: Patterns" },
    ],
  },
  {
    title: "Bear Caves",
    sub: "Surviving drawdowns & fear",
    c: "#ff4d6a",
    e: "#8e0f2c",
    deco: "cave",
    nodes: [
      { k: "lesson", s: "locked", t: "What is a drawdown" },
      { k: "story", s: "locked", t: "The 2022 winter" },
      { k: "lesson", s: "locked", t: "Stop-loss placement" },
      { k: "chest", s: "locked", t: "Survivor chest" },
      { k: "boss", s: "locked", t: "Boss: Capitulation" },
    ],
  },
  {
    title: "Whale Ocean",
    sub: "Liquidity, order books & big players",
    c: "#9b6bff",
    e: "#4a1f9c",
    deco: "ocean",
    nodes: [
      { k: "lesson", s: "locked", t: "Order book depth" },
      { k: "lesson", s: "locked", t: "Spotting whales" },
      { k: "practice", s: "locked", t: "Liquidity sweeps" },
      { k: "boss", s: "locked", t: "Final: Market Maker" },
    ],
  },
];

const OFF = [0, 52, 78, 52, 0, -52, -78, -52];
const KIND_ICON: Record<NodeKind, IconName> = { lesson: "star", chest: "chest", boss: "crown", practice: "target", story: "book" };

/* ================================================================== */
/*  SCENERY                                                            */
/* ================================================================== */
function Scenery({ deco, c }: { deco: Unit["deco"]; c: string }) {
  if (deco === "hills")
    return (
      <svg viewBox="0 0 320 70" className="w-full" preserveAspectRatio="none" style={{ height: 70 }}>
        <path d="M0 70 C40 30 80 30 120 55 C160 20 210 20 250 50 C280 35 300 35 320 45 V70 Z" fill={c} opacity=".12" />
        <path d="M0 70 C60 45 100 50 160 62 C220 42 270 48 320 60 V70 Z" fill={c} opacity=".2" />
        {[40, 90, 230, 280].map((x) => (
          <g key={x}>
            <rect x={x} y={40} width={3} height={18} fill="#0f7048" />
            <circle cx={x + 1.5} cy={38} r={9} fill={c} opacity=".45" />
          </g>
        ))}
      </svg>
    );
  if (deco === "city")
    return (
      <svg viewBox="0 0 320 80" className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        {[
          [10, 40, 1],
          [34, 22, 0],
          [58, 50, 1],
          [82, 12, 1],
          [106, 34, 0],
          [200, 28, 1],
          [224, 8, 1],
          [248, 44, 0],
          [272, 20, 1],
          [296, 36, 1],
        ].map(([x, y, up], i) => (
          <g key={i}>
            <rect x={Number(x) + 8} y={Number(y) - 8} width={2} height={88 - Number(y)} fill={up ? "#2be08a" : "#ff4d6a"} opacity=".35" />
            <rect x={x} y={y} width={18} height={80 - Number(y)} rx={3} fill={up ? "#2be08a" : "#ff4d6a"} opacity=".22" />
            {Array.from({ length: Math.floor((80 - Number(y)) / 10) }, (_, k) => (
              <rect key={k} x={Number(x) + 4} y={Number(y) + 4 + k * 10} width={3} height={4} fill="#fff" opacity={Math.random() > 0.5 ? 0.35 : 0.08} />
            ))}
          </g>
        ))}
      </svg>
    );
  if (deco === "cave")
    return (
      <svg viewBox="0 0 320 70" className="w-full" preserveAspectRatio="none" style={{ height: 70 }}>
        <path d="M0 0 H320 V12 L300 38 L284 14 L262 46 L240 12 L220 30 L196 10 L170 40 L150 10 L128 34 L104 8 L80 44 L60 12 L38 30 L18 10 L0 26 Z" fill={c} opacity=".16" />
        {[70, 160, 250].map((x) => (
          <motion.circle key={x} cx={x} cy={56} r={3} fill={c} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: x / 100 }} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 320 70" className="w-full" preserveAspectRatio="none" style={{ height: 70 }}>
      <motion.path
        d="M0 40 Q40 28 80 40 T160 40 T240 40 T320 40 V70 H0 Z"
        fill={c}
        opacity=".18"
        animate={{ d: ["M0 40 Q40 28 80 40 T160 40 T240 40 T320 40 V70 H0 Z", "M0 40 Q40 52 80 40 T160 40 T240 40 T320 40 V70 H0 Z", "M0 40 Q40 28 80 40 T160 40 T240 40 T320 40 V70 H0 Z"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M0 52 Q50 44 100 52 T200 52 T320 52 V70 H0 Z" fill={c} opacity=".26" />
    </svg>
  );
}

/* ================================================================== */
/*  NODE                                                               */
/* ================================================================== */
function MapNodeBtn({ n, unit, onTap, open }: { n: MapNode; unit: Unit; onTap: () => void; open: boolean }) {
  const done = n.s === "done";
  const active = n.s === "active";
  const locked = n.s === "locked";
  const big = n.k === "boss";
  const size = big ? 84 : 70;

  if (n.k === "chest") {
    return (
      <motion.button type="button" onClick={onTap} whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.9 }} className={cn("relative", locked && "grayscale-[.7] opacity-70")}>
        <ChestArt size={78} open={done} />
      </motion.button>
    );
  }

  return (
    <div className="relative" style={{ width: size + 16, height: size + 16 }}>
      {active && (
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#1a2745" strokeWidth="7" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={unit.c}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={289}
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 289 * 0.5 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            transform="rotate(-90 50 50)"
          />
        </svg>
      )}
      {active && <span className="pulse-ring absolute inset-2 rounded-full" style={{ boxShadow: `0 0 0 4px ${unit.c}` }} />}
      <motion.button
        type="button"
        onClick={onTap}
        whileHover={{ scale: 1.06 }}
        whileTap={{ y: 6, boxShadow: `0 0 0 ${locked ? "#0a1020" : unit.e}` }}
        className="absolute left-2 top-2 grid place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: locked
            ? "linear-gradient(180deg,#27365a,#172240)"
            : big
              ? "linear-gradient(180deg,#ffe08a,#ffc24b 45%,#d4860f)"
              : `linear-gradient(180deg, color-mix(in srgb, ${unit.c} 75%, #fff), ${unit.c} 48%, color-mix(in srgb, ${unit.c} 80%, #000))`,
          boxShadow: `0 7px 0 ${locked ? "#0d1530" : big ? "#8f5608" : unit.e}, 0 16px 22px -10px ${locked ? "#000" : unit.c}, inset 0 3px 0 rgba(255,255,255,${locked ? 0.08 : 0.4})`,
          color: locked ? "#4a5c85" : big ? "#4a2a02" : "#051510",
        }}
        aria-label={n.t}
      >
        {!locked && <span className="pointer-events-none absolute left-[18%] top-[12%] h-[22%] w-[38%] rounded-full bg-white/35 blur-[1px]" />}
        {big && !locked ? <CrownArt size={48} /> : <Icon name={locked ? "lock" : done ? "check" : KIND_ICON[n.k]} size={big ? 36 : 30} strokeWidth={done ? 3.6 : 2.4} />}
        {done && !big && (
          <span className="absolute -bottom-1 -right-1 flex gap-[1px]">
            {[0, 1, 2].map((k) => (
              <StarArt key={k} size={13} />
            ))}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {active && !open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { duration: 1.4, repeat: Infinity } }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 bg-[#0b1428] px-3 py-1.5 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase"
            style={{ borderColor: unit.c, color: unit.c, boxShadow: "0 3px 0 #050a16" }}
          >
            Start
            <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 bg-[#0b1428]" style={{ borderColor: unit.c }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  MAP SCREEN                                                         */
/* ================================================================== */
function MapScreen({ units, setUnits }: { units: Unit[]; setUnits: (u: Unit[]) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [activeVis, setActiveVis] = useState<"in" | "above" | "below">("in");
  const [gems, setGems] = useState(1280);
  const [conf, setConf] = useState(0);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const idx = unitRefs.current.indexOf(e.target as HTMLDivElement);
            if (idx >= 0) setCur(idx);
          }
        });
      },
      { root, rootMargin: "-90px 0px -75% 0px" },
    );
    unitRefs.current.forEach((el) => el && io.observe(el));
    const io2 = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActiveVis("in");
        else setActiveVis(e.boundingClientRect.top < (e.rootBounds?.top ?? 0) ? "above" : "below");
      },
      { root },
    );
    if (activeRef.current) io2.observe(activeRef.current);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, [units]);

  useEffect(() => {
    const t = setTimeout(() => activeRef.current?.scrollIntoView({ block: "center" }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (ui: number, ni: number) => {
    const n = units[ui].nodes[ni];
    const key = `${ui}-${ni}`;
    if (n.k === "chest" && n.s !== "locked" && n.s !== "done") return;
    if (n.k === "chest" && n.s === "locked") {
      sfx("wrong");
      setOpen(open === key ? null : key);
      return;
    }
    if (n.k === "chest" && n.s === "done") {
      sfx("select");
      setOpen(open === key ? null : key);
      return;
    }
    sfx(n.s === "locked" ? "wrong" : "pop");
    setOpen(open === key ? null : key);
  };

  const complete = (ui: number, ni: number) => {
    const next = units.map((u) => ({ ...u, nodes: u.nodes.map((n) => ({ ...n })) }));
    next[ui].nodes[ni].s = "done";
    // advance: walk forward; chests auto-open, first playable node becomes active
    let found = false;
    for (let a = ui; a < next.length && !found; a++) {
      for (let b = a === ui ? ni + 1 : 0; b < next[a].nodes.length; b++) {
        const nd = next[a].nodes[b];
        if (nd.s !== "locked") continue;
        if (nd.k === "chest") {
          nd.s = "done";
          sfx("chest");
          continue;
        }
        nd.s = "active";
        found = true;
        break;
      }
    }
    setUnits(next);
    setOpen(null);
    setGems((g) => g + 40);
    setConf((c) => c + 1);
    sfx("levelup");
  };

  const unit = units[cur];

  return (
    <div className="relative flex h-full flex-col">
      <Confetti fire={conf} />
      <StatusBar />
      <GameHUD gems={gems} />
      {/* sticky unit header */}
      <div className="relative z-40 px-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${unit.c}, color-mix(in srgb, ${unit.c} 55%, #000))`, boxShadow: `0 5px 0 ${unit.e}` }}
          >
            <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
            <div className="min-w-0 flex-1 text-[#051018]">
              <div className="font-mono text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Section 1 · Unit {cur + 1}</div>
              <div className="truncate font-[family-name:var(--font-display)] text-[17px] font-bold">{unit.title}</div>
            </div>
            <button type="button" onClick={() => sfx("select")} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-black/15 bg-black/10 text-[#051018]" style={{ boxShadow: "0 3px 0 rgba(0,0,0,.25)" }}>
              <Icon name="book" size={20} strokeWidth={2.4} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div ref={scroller} className="no-scrollbar relative flex-1 overflow-y-auto pb-28">
        {units.map((u, ui) => (
          <div key={u.title} ref={(el) => { unitRefs.current[ui] = el; }} className="relative pb-4">
            {ui > 0 && (
              <div className="mx-6 my-5 flex items-center gap-3">
                <span className="h-[2px] flex-1 bg-[#1c2c52]" />
                <span className="font-[family-name:var(--font-display)] text-[13px] font-bold text-ink-400">{u.title}</span>
                <span className="h-[2px] flex-1 bg-[#1c2c52]" />
              </div>
            )}
            <div className="relative flex flex-col items-center gap-4 py-2">
              {u.nodes.map((n, ni) => {
                const off = OFF[(ni + ui * 3) % OFF.length];
                const key = `${ui}-${ni}`;
                const isActive = n.s === "active";
                return (
                  <div key={key} ref={isActive ? activeRef : undefined} className="relative flex w-full justify-center" style={{ transform: `translateX(${off}px)` }}>
                    <MapNodeBtn n={n} unit={u} open={open === key} onTap={() => tap(ui, ni)} />
                    {isActive && (
                      <div className="pointer-events-none absolute top-0" style={{ left: off > 0 ? "calc(50% - 150px)" : "calc(50% + 50px)" }}>
                        <Mascot mood="wave" size={96} track={false} />
                      </div>
                    )}
                    <AnimatePresence>
                      {open === key && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.92 }}
                          transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          className="absolute top-[96px] z-50 w-[264px] rounded-2xl p-4"
                          style={{
                            left: `calc(50% - 132px - ${off}px)`,
                            background: n.s === "locked" ? "#16223f" : u.c,
                            boxShadow: `0 5px 0 ${n.s === "locked" ? "#0a1328" : u.e}, 0 20px 40px -12px #000`,
                          }}
                        >
                          <div className={cn("font-[family-name:var(--font-display)] text-[17px] font-bold", n.s === "locked" ? "text-ink-300" : "text-[#051018]")}>{n.t}</div>
                          <div className={cn("mb-3 text-[12px] font-semibold", n.s === "locked" ? "text-ink-500" : "text-[#051018]/70")}>
                            {n.s === "locked" ? "Complete all levels above to unlock this!" : n.s === "done" ? "Mastered · replay to keep it fresh" : `Lesson ${ni + 1} of ${u.nodes.length}`}
                          </div>
                          {n.s === "locked" ? (
                            <GameButton tone="ghost" size="md" disabled>
                              <Icon name="lock" size={16} /> Locked
                            </GameButton>
                          ) : n.s === "done" ? (
                            <button type="button" onClick={() => sfx("pop")} className="h-11 w-full rounded-2xl bg-white font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wider" style={{ color: u.e, boxShadow: "0 4px 0 rgba(0,0,0,.25)" }}>
                              Practise +5 XP
                            </button>
                          ) : (
                            <button type="button" onClick={() => complete(ui, ni)} className="h-11 w-full rounded-2xl bg-white font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wider" style={{ color: u.e, boxShadow: "0 4px 0 rgba(0,0,0,.25)" }}>
                              Start +15 XP
                            </button>
                          )}
                          <span className="absolute -top-2 h-4 w-4 rotate-45" style={{ left: `calc(50% - 8px + ${off}px)`, background: n.s === "locked" ? "#16223f" : u.c }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {/* floating collectibles */}
              <div className="bob pointer-events-none absolute left-4 top-16">
                {ui % 2 ? <GemArt size={26} /> : <CoinArt size={26} />}
              </div>
              <div className="bob pointer-events-none absolute right-5 top-40" style={{ animationDelay: "1s" }}>
                {u.deco === "ocean" ? <WhaleArt size={40} /> : u.deco === "city" ? <CandleArt size={30} /> : u.deco === "cave" ? <CandleArt size={30} bear /> : <TrophyArt size={28} />}
              </div>
            </div>
            <Scenery deco={u.deco} c={u.c} />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeVis !== "in" && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="absolute bottom-24 right-4 z-50 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#22355e] bg-[#101a33] text-ink-200"
            style={{ boxShadow: "0 4px 0 #0a1328" }}
          >
            <Icon name={activeVis === "above" ? "arrowUp" : "arrowDown"} size={20} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* tab bar */}
      <div className="absolute inset-x-0 bottom-0 z-50 flex items-center justify-around border-t-2 border-[#16223f] bg-[#08101f] px-3 pb-6 pt-2">
        {(["home", "target", "trophy", "chest", "user"] as IconName[]).map((ic, k) => (
          <button key={ic} type="button" onClick={() => sfx("select")} className={cn("grid h-11 w-11 place-items-center rounded-xl border-2", k === 0 ? "border-[var(--accent)]" : "border-transparent")} style={k === 0 ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" } : { color: "#4a5c85" }}>
            <Icon name={ic} size={22} strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorldMap() {
  const [units, setUnits] = useState<Unit[]>(INITIAL);
  const done = units.flatMap((u) => u.nodes).filter((n) => n.s === "done").length;
  const total = units.flatMap((u) => u.nodes).length;
  return (
    <Section id="map" index="" title="World Map" kicker="Progression path · biomes · sticky units" count="4 units · 20 nodes">
      <Grid>
        <Cell title="Skill Path · Live Device" spec="tap nodes · scroll" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
            <Device>
              <MapScreen units={units} setUnits={setUnits} />
            </Device>
            <div className="space-y-3">
              <div className="rounded-2xl sf-inset hairline p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">course progress</span>
                  <span className="tnum font-mono text-[13px] font-black" style={{ color: "var(--accent)" }}>
                    {done}/{total}
                  </span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#0a1122]" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.7)" }}>
                  <motion.div animate={{ width: `${(done / total) * 100}%` }} className="relative h-full rounded-full" style={{ background: "var(--accent)" }}>
                    <span className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/40" />
                  </motion.div>
                </div>
                <button type="button" onClick={() => { setUnits(INITIAL); sfx("whoosh"); }} className="mt-3 font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-white">
                  ↻ reset map
                </button>
              </div>
              {units.map((u) => {
                const d = u.nodes.filter((n) => n.s === "done").length;
                return (
                  <div key={u.title} className="flex items-center gap-3 rounded-2xl border-2 p-3" style={{ borderColor: `${u.c}44`, background: `linear-gradient(100deg, ${u.c}14, #0b1224 70%)`, boxShadow: "0 3px 0 #070d1c" }}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: u.c, boxShadow: `0 3px 0 ${u.e}`, color: "#051018" }}>
                      <Icon name={u.deco === "hills" ? "globe" : u.deco === "city" ? "candle" : u.deco === "cave" ? "trendDown" : "layers"} size={20} strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-extrabold text-white">{u.title}</div>
                      <div className="truncate text-[10.5px] text-ink-400">{u.sub}</div>
                    </div>
                    <span className="tnum font-mono text-[11px] font-black" style={{ color: u.c }}>
                      {d}/{u.nodes.length}
                    </span>
                  </div>
                );
              })}
              <div className="grid grid-cols-5 gap-2">
                {(["lesson", "story", "practice", "chest", "boss"] as NodeKind[]).map((k) => (
                  <div key={k} className="flex flex-col items-center gap-1 rounded-xl sf-base hairline py-2">
                    <Icon name={KIND_ICON[k]} size={18} style={{ color: "var(--accent)" }} />
                    <span className="font-mono text-[7.5px] uppercase tracking-wider text-ink-500">{k}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Tag tone="accent">IntersectionObserver header</Tag>
                <Tag>jump-to-active FAB</Tag>
                <Tag tone="gold">auto-open chests</Tag>
                <Tag tone="violet">4 biomes</Tag>
              </div>
            </div>
          </div>
        </Cell>
        <Cell title="Node States" spec="3D · 5 kinds" span="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { n: { k: "lesson", s: "done", t: "" } as MapNode, l: "Mastered" },
              { n: { k: "practice", s: "active", t: "" } as MapNode, l: "Active + ring" },
              { n: { k: "lesson", s: "locked", t: "" } as MapNode, l: "Locked" },
              { n: { k: "boss", s: "done", t: "" } as MapNode, l: "Boss / checkpoint" },
              { n: { k: "chest", s: "locked", t: "" } as MapNode, l: "Chest sealed" },
              { n: { k: "chest", s: "done", t: "" } as MapNode, l: "Chest opened" },
            ].map((x, k) => (
              <div key={k} className="flex flex-col items-center gap-2 pt-6">
                <MapNodeBtn n={x.n} unit={INITIAL[1]} open onTap={() => sfx("pop")} />
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">{x.l}</span>
              </div>
            ))}
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
