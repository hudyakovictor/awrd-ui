import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Tag, blip } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ============ Tabs ============ */
function Tabs() {
  const items = ["Overview", "Chart", "Orders", "Wallet"];
  const [i, setI] = useState(0);
  const [ls, setLs] = useState(0);
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-5 border-b border-[rgba(125,155,220,.14)]">
        {items.map((t, k) => (
          <button key={t} onClick={() => { setI(k); blip("tap"); }} className="relative pb-2.5 text-[12px] font-bold transition-colors" style={{ color: i === k ? "#fff" : "#7d8db4" }}>
            {t}
            {i === k && <motion.span layoutId="tab-ul" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />}
          </button>
        ))}
      </div>
      <div className="relative flex gap-1.5 rounded-xl sf-inset p-1.5">
        {["Long", "Short"].map((t, k) => (
          <button key={t} onClick={() => { setLs(k); blip("tap"); }} className="relative flex-1 py-2 text-[11px] font-extrabold" style={{ color: ls === k ? (k ? "#1c0309" : "#02150b") : "#7d8db4" }}>
            {ls === k && <motion.span layoutId="ls-pill" className="absolute inset-0 -z-0 rounded-lg" style={{ background: k ? "linear-gradient(180deg,#ff8fa2,#ff4d6a)" : "linear-gradient(180deg,#5cf0ab,#2be08a)", boxShadow: `0 3px 0 ${k ? "#8e0f2c" : "#0f7048"}` }} />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Breadcrumbs ============ */
function Breadcrumbs() {
  const path = ["Academy", "Chapter 3", "Candlesticks", "Doji"];
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="flex flex-wrap items-center gap-1">
        {path.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            <button className={cn("rounded-lg px-2 py-1 text-[11px] font-bold transition-colors", i === path.length - 1 ? "text-white" : "text-ink-400 hover:text-[var(--accent)]")} style={i === path.length - 1 ? { background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" } : undefined}>
              {p}
            </button>
            {i < path.length - 1 && <Icon name="chevronRight" size={12} className="text-ink-500" />}
          </span>
        ))}
      </div>
      <div className="font-mono text-[9px] text-ink-500">breadcrumb / truncate-mid · 4 levels</div>
    </div>
  );
}

/* ============ Pagination ============ */
function Pagination() {
  const [p, setP] = useState(3);
  const pages = [1, 2, 3, 4, 5];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-1.5">
        <Btn variant="neutral" size="xs" depth="sm" onClick={() => setP((v) => Math.max(1, v - 1))} className="!px-2"><Icon name="chevronLeft" size={13} strokeWidth={3} /></Btn>
        {pages.map((n) => (
          <button
            key={n}
            onClick={() => { setP(n); blip("tap"); }}
            data-depth="sm"
            className="btn3d h-9 w-9 rounded-xl text-[11px]"
            style={{
              background: p === n ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))" : "linear-gradient(180deg,#2c4372,#152444)",
              color: p === n ? "var(--accent-ink)" : "#a3b1d2",
              ["--edge" as any]: p === n ? "var(--accent-edge)" : "#0b1226",
            }}
          >
            <span className="relative z-[4]">{n}</span>
          </button>
        ))}
        <span className="px-1 font-mono text-[11px] text-ink-500">…</span>
        <Btn variant="neutral" size="xs" depth="sm" onClick={() => setP((v) => Math.min(5, v + 1))} className="!px-2"><Icon name="chevronRight" size={13} strokeWidth={3} /></Btn>
      </div>
      <span className="font-mono text-[9px] text-ink-500">page {p} of 24 · 480 lessons</span>
    </div>
  );
}

/* ============ Bottom nav ============ */
const NAV: { i: IconName; l: string }[] = [
  { i: "home", l: "Learn" },
  { i: "chart", l: "Markets" },
  { i: "target", l: "Quests" },
  { i: "trophy", l: "League" },
  { i: "user", l: "Profile" },
];

function BottomNav() {
  const [a, setA] = useState(0);
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="relative rounded-[22px] sf-raised hairline-strong p-2">
        <div className="relative flex items-end justify-between">
          {NAV.map((n, i) => (
            <button key={n.l} onClick={() => { setA(i); blip("tap"); }} className="relative flex flex-1 flex-col items-center gap-1 py-1.5">
              {a === i && (
                <motion.span layoutId="nav-bubble" transition={{ type: "spring", stiffness: 480, damping: 32 }} className="absolute inset-x-1 inset-y-0 -z-0 rounded-2xl" style={{ background: "color-mix(in srgb,var(--accent) 16%,transparent)", boxShadow: "inset 0 0 0 1px var(--accent-glow)" }} />
              )}
              <motion.span animate={{ y: a === i ? -3 : 0, scale: a === i ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="relative" style={{ color: a === i ? "var(--accent)" : "#5f6f96" }}>
                <Icon name={n.i} size={20} strokeWidth={a === i ? 2.3 : 1.8} />
                {i === 2 && <span className="absolute -right-1.5 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-bear font-mono text-[7px] font-black text-white">3</span>}
              </motion.span>
              <span className="relative font-mono text-[7.5px] font-bold uppercase tracking-wider" style={{ color: a === i ? "var(--accent)" : "#5f6f96" }}>{n.l}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center font-mono text-[9px] text-ink-500">tab-bar / 5 slots · layout bubble</div>
    </div>
  );
}

/* ============ Lesson path (Duolingo-style) ============ */
type NodeState = "done" | "active" | "locked" | "bonus";
const PATH: { s: NodeState; t: string; i: IconName }[] = [
  { s: "done", t: "What is a candle", i: "candle" },
  { s: "done", t: "Trend structure", i: "trendUp" },
  { s: "done", t: "Support zones", i: "layers" },
  { s: "bonus", t: "Treasure drop", i: "chest" },
  { s: "active", t: "Risk & position size", i: "shield" },
  { s: "locked", t: "Order books", i: "book" },
  { s: "locked", t: "Liquidity traps", i: "target" },
  { s: "locked", t: "Boss: Live market", i: "crown" },
];

function LessonPath() {
  const [open, setOpen] = useState<number | null>(4);
  return (
    <div className="relative -mx-1 max-h-[430px] overflow-y-auto px-1 pb-2">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity=".7" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center gap-1.5">
        {PATH.map((n, i) => {
          const off = [0, 46, 72, 46, 0, -46, -72, -46][i % 8];
          const done = n.s === "done";
          const active = n.s === "active";
          const bonus = n.s === "bonus";
          return (
            <div key={i} className="relative flex w-full justify-center" style={{ transform: `translateX(${off}px)` }}>
              {i > 0 && <span className="absolute -top-[14px] left-1/2 h-4 w-[3px] -translate-x-1/2 rounded-full" style={{ background: done || active ? "var(--accent)" : "rgba(120,160,240,.16)", opacity: 0.5 }} />}
              <div className="relative">
                {active && <span className="pulse-ring absolute -inset-1 rounded-full" style={{ boxShadow: "0 0 0 4px var(--accent)" }} />}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93, y: 4 }}
                  onClick={() => { setOpen(open === i ? null : i); blip(n.s === "locked" ? "err" : "ok"); }}
                  className="relative grid h-[60px] w-[60px] place-items-center rounded-full"
                  style={{
                    background: done
                      ? "linear-gradient(180deg,#5cf0ab,#18b06a)"
                      : active
                        ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))"
                        : bonus
                          ? "linear-gradient(180deg,#ffe0a0,#e39312)"
                          : "linear-gradient(180deg,#22304f,#131c33)",
                    boxShadow: `0 6px 0 ${done ? "#0f7048" : active ? "var(--accent-edge)" : bonus ? "#9a6209" : "#0a1020"}, 0 12px 20px -8px rgba(0,0,0,.9), inset 0 2px 0 rgba(255,255,255,.35)`,
                    color: n.s === "locked" ? "#4a5c85" : "#06140d",
                  }}
                >
                  <Icon name={n.s === "locked" ? "lock" : n.i} size={26} strokeWidth={2.2} />
                  {done && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#0b1224] text-bull shadow-[0_0_0_2px_#0b1224]"><Icon name="check" size={11} strokeWidth={4} /></span>}
                </motion.button>
                {active && (
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 font-mono text-[8px] font-black uppercase tracking-widest" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    start
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    className="absolute left-1/2 top-[68px] z-20 w-[190px] -translate-x-1/2 rounded-2xl sf-raised hairline-strong p-3 text-center"
                    style={{ transform: `translateX(calc(-50% - ${off}px))` }}
                  >
                    <div className="text-[12px] font-extrabold text-white">{n.t}</div>
                    <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-ink-500">
                      {n.s === "locked" ? "complete previous node" : n.s === "done" ? "mastered · 3/3 crowns" : "+40 XP · 5 min"}
                    </div>
                    <Btn variant={n.s === "locked" ? "neutral" : "accent"} size="sm" full className="mt-2.5" disabled={n.s === "locked"}>
                      {n.s === "locked" ? "Locked" : n.s === "done" ? "Practice" : "Start"}
                    </Btn>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Stepper flow ============ */
function ProcessSteps() {
  const [s, setS] = useState(2);
  const steps = ["Fund", "Analyse", "Order", "Manage", "Close"];
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-4 right-4 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[rgba(120,160,240,.14)]" />
        <motion.div className="absolute left-4 top-1/2 h-[3px] -translate-y-1/2 rounded-full" animate={{ width: `${(s / (steps.length - 1)) * 88}%` }} style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
        {steps.map((t, i) => (
          <button key={t} onClick={() => { setS(i); blip("tap"); }} className="relative flex flex-col items-center gap-1.5">
            <motion.span
              animate={{ scale: i === s ? 1.18 : 1 }}
              className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-black"
              style={{
                background: i <= s ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))" : "linear-gradient(180deg,#22304f,#131c33)",
                color: i <= s ? "var(--accent-ink)" : "#5f6f96",
                boxShadow: `0 3px 0 ${i <= s ? "var(--accent-edge)" : "#0a1020"}, inset 0 1px 0 rgba(255,255,255,.3)`,
              }}
            >
              {i < s ? <Icon name="check" size={13} strokeWidth={4} /> : i + 1}
            </motion.span>
            <span className="font-mono text-[7.5px] uppercase tracking-wider" style={{ color: i === s ? "var(--accent)" : "#5f6f96" }}>{t}</span>
          </button>
        ))}
      </div>
      <div className="rounded-xl sf-inset hairline px-3 py-2 text-center font-mono text-[9px] text-ink-400">
        step {s + 1}/5 · <span style={{ color: "var(--accent)" }}>{steps[s]}</span>
      </div>
    </div>
  );
}

/* ============ App header shell ============ */
function HeaderShell() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="flex items-center gap-2 rounded-2xl sf-raised hairline-strong px-3 py-2.5">
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-xl sf-base hairline text-ink-300"><Icon name="menu" size={17} /></button>
        <div className="flex items-center gap-1.5 rounded-full sf-inset px-2.5 py-1">
          <Icon name="flame" size={14} className="flame text-gold" />
          <span className="tnum font-mono text-[11px] font-black text-gold">42</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full sf-inset px-2.5 py-1">
          <Icon name="gem" size={14} className="text-aqua" />
          <span className="tnum font-mono text-[11px] font-black text-aqua">1,280</span>
        </div>
        <div className="flex items-center gap-1 rounded-full sf-inset px-2.5 py-1">
          {[1, 2, 3, 4, 5].map((h) => <Icon key={h} name="heart" size={12} className={h <= 4 ? "text-bear" : "text-navy-500"} strokeWidth={h <= 4 ? 2.6 : 1.6} style={h <= 4 ? { fill: "#ff4d6a" } : undefined} />)}
        </div>
        <div className="ml-auto h-9 w-9 shrink-0 rounded-xl" style={{ background: "linear-gradient(140deg,var(--accent),#9b6bff)", boxShadow: "0 3px 0 var(--accent-edge)" }} />
      </div>
      <div className="font-mono text-[9px] text-ink-500">app-bar / streak · gems · hearts · avatar</div>
    </div>
  );
}

/* ============ Radial FAB menu ============ */
function RadialMenu() {
  const [o, setO] = useState(false);
  const items: IconName[] = ["candle", "swap", "brain", "wallet"];
  return (
    <div className="relative grid h-full min-h-[150px] place-items-center">
      {items.map((n, i) => {
        const ang = (-160 + i * 40) * (Math.PI / 180);
        return (
          <motion.button
            key={n}
            animate={o ? { x: Math.cos(ang) * 64, y: Math.sin(ang) * 64, opacity: 1, scale: 1 } : { x: 0, y: 0, opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 380, damping: 22, delay: o ? i * 0.04 : 0 }}
            className="absolute grid h-11 w-11 place-items-center rounded-full sf-raised hairline-strong text-ink-200"
            onClick={() => blip("tap")}
          >
            <Icon name={n} size={17} />
          </motion.button>
        );
      })}
      <motion.button
        onClick={() => { setO(!o); blip("tap"); }}
        animate={{ rotate: o ? 135 : 0 }}
        data-depth="md"
        className="btn3d relative z-10 h-14 w-14 rounded-full"
        style={{ background: "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))", color: "var(--accent-ink)", ["--edge" as any]: "var(--accent-edge)" }}
      >
        <Icon name="plus" size={24} strokeWidth={3} className="relative z-[4]" />
      </motion.button>
      <span className="absolute bottom-0 font-mono text-[9px] text-ink-500">radial-menu / 4 spokes · 64r</span>
    </div>
  );
}

/* ============ Chapter rail ============ */
function ChapterRail() {
  const ch = [
    { n: "Basics", p: 100, c: 3 },
    { n: "Charting", p: 100, c: 3 },
    { n: "Risk", p: 62, c: 2 },
    { n: "Psychology", p: 0, c: 0 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {ch.map((c) => (
        <div key={c.n} className="group flex items-center gap-2.5 rounded-xl sf-base hairline p-2 transition-all hover:translate-x-1">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: c.p === 100 ? "linear-gradient(180deg,#ffe0a0,#e39312)" : c.p > 0 ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))" : "linear-gradient(180deg,#22304f,#131c33)", color: c.p > 0 ? "#12100a" : "#4a5c85", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}>
            <Icon name={c.p === 100 ? "crown" : c.p > 0 ? "bolt" : "lock"} size={15} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[10px] font-bold text-ink-200"><span className="truncate">{c.n}</span><span className="tnum font-mono text-ink-500">{c.p}%</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full sf-inset">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.p}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full" style={{ background: c.p === 100 ? "#ffc24b" : "var(--accent)" }} />
            </div>
          </div>
          <div className="flex gap-0.5">{[0, 1, 2].map((k) => <Icon key={k} name="crown" size={9} className={k < c.c ? "text-gold" : "text-navy-500"} />)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Navigation() {
  return (
    <Section id="navigation" index="03" title="Navigation" kicker="Wayfinding · Progression map" count="9 assets">
      <Grid>
        <Cell title="Skill Path" spec="8 nodes · 4 states" span="col-span-2 row-span-2 lg:col-span-2"><LessonPath /></Cell>
        <Cell title="Tabs + Long/Short" spec="layoutId underline" span="col-span-2"><Tabs /></Cell>
        <Cell title="App Header Shell" spec="streak · gems · hearts" span="col-span-2"><HeaderShell /></Cell>
        <Cell title="Bottom Tab Bar" spec="5 slots · badge" span="col-span-2"><BottomNav /></Cell>
        <Cell title="Chapter Rail" spec="crowns · progress" span="col-span-2"><ChapterRail /></Cell>
        <Cell title="Breadcrumbs" spec="4 levels" span="col-span-2"><Breadcrumbs /></Cell>
        <Cell title="Pagination" spec="3D keys" span="col-span-2"><Pagination /></Cell>
        <Cell title="Process Stepper" spec="5 steps" span="col-span-2"><ProcessSteps /></Cell>
        <Cell title="Radial FAB Menu" spec="spring stagger" span="col-span-2"><RadialMenu /></Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">scroll-spy ready</Tag>
        <Tag>reduced-motion safe</Tag>
        <Tag>44px min hit target</Tag>
        <Tag>keyboard focus rings</Tag>
      </div>
    </Section>
  );
}
