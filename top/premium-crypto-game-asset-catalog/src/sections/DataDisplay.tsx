import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Tag, Tip, blip, Num } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ============ Hero lesson card (3D tilt) ============ */
function TiltCard() {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setT({ x: ((e.clientX - r.left) / r.width - 0.5) * 16, y: -((e.clientY - r.top) / r.height - 0.5) * 16 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ perspective: 900 }}
      className="h-full"
    >
      <motion.div
        animate={{ rotateY: t.x, rotateX: t.y }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="relative h-full overflow-hidden rounded-2xl sf-raised hairline-strong p-4"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }} />
        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-center gap-2">
            <Tag tone="accent">chapter 03</Tag>
            <Tag tone="gold">★ 4.9</Tag>
          </div>
          <h3 className="mt-2.5 text-[19px] font-black leading-tight text-white">Reading Liquidity<br />Like a Market Maker</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-400">12 drills · 3 simulations · live orderflow replay from the 2024 halving.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#2be08a", "#38e1ff", "#9b6bff"].map((c) => <span key={c} className="h-6 w-6 rounded-full border-2 border-[#0d1528]" style={{ background: `linear-gradient(160deg,${c},#0d1528)` }} />)}
            </div>
            <span className="font-mono text-[8.5px] text-ink-500">8.2k learners</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Btn variant="accent" size="sm" icon="play">Resume</Btn>
            <Btn variant="ghost" size="sm" icon="book">Syllabus</Btn>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============ List items ============ */
function ListItems() {
  const [sel, setSel] = useState(0);
  const rows: { i: IconName; t: string; s: string; tag?: string; tone?: "bull" | "gold" | "bear" }[] = [
    { i: "candle", t: "Engulfing patterns", s: "Lesson · 6 min", tag: "New", tone: "bull" },
    { i: "shield", t: "Stop placement", s: "Drill · 12 questions", tag: "Pro", tone: "gold" },
    { i: "bolt", t: "Flash-crash sim", s: "Simulation · hard", tag: "Boss", tone: "bear" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {rows.map((r, i) => (
        <motion.button
          key={r.t}
          whileHover={{ x: 3 }}
          onClick={() => { setSel(i); blip("tap"); }}
          className={cn("flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all", sel === i ? "sf-raised hairline-strong" : "sf-base hairline")}
          style={sel === i ? { boxShadow: "inset 0 0 0 1px var(--accent-glow), 0 8px 18px -10px #000" } : undefined}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl sf-inset" style={{ color: sel === i ? "var(--accent)" : "#7d8db4" }}><Icon name={r.i} size={16} /></span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11.5px] font-bold text-white">{r.t}</div>
            <div className="font-mono text-[8.5px] text-ink-500">{r.s}</div>
          </div>
          {r.tag && <Tag tone={r.tone}>{r.tag}</Tag>}
          <Icon name="chevronRight" size={14} className="text-ink-500" />
        </motion.button>
      ))}
    </div>
  );
}

/* ============ Badges ============ */
function Badges() {
  return (
    <div className="flex h-full flex-wrap content-center gap-1.5">
      <Tag tone="bull">verified</Tag><Tag tone="bear">−12.4%</Tag><Tag tone="gold">pro</Tag>
      <Tag tone="aqua">beta</Tag><Tag tone="violet">nft</Tag><Tag>draft</Tag>
      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-bear px-1 font-mono text-[9px] font-black text-white">9</span>
      <span className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 font-mono text-[9px] font-black" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>99+</span>
      <span className="flex items-center gap-1 rounded-full sf-inset px-2 py-0.5 font-mono text-[9px] font-bold text-bull"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bull" />live</span>
      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-black text-[#2a1a02]" style={{ background: "linear-gradient(90deg,#ffe0a0,#e39312)" }}><Icon name="crown" size={9} />legend</span>
      <span className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-black text-white" style={{ background: "linear-gradient(90deg,#9b6bff,#38e1ff)" }}>×1.5 BOOST</span>
    </div>
  );
}

/* ============ Avatars ============ */
function Avatars() {
  const cols = ["#2be08a", "#38e1ff", "#9b6bff", "#ffc24b", "#ff4d6a"];
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="flex items-center gap-2.5">
        {cols.slice(0, 4).map((c, i) => (
          <Tip key={c} label={["Kira_V", "0xNomad", "Delta", "Satoshi"][i]}>
            <span className="relative block">
              <span className="grid h-11 w-11 place-items-center rounded-full font-mono text-[12px] font-black text-[#07101f]" style={{ background: `linear-gradient(160deg,${c}, color-mix(in srgb,${c} 45%,#000))`, boxShadow: `0 3px 0 color-mix(in srgb,${c} 35%,#000), inset 0 2px 0 rgba(255,255,255,.4)` }}>
                {["K", "N", "D", "S"][i]}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a1022]" style={{ background: i % 2 ? "#5f6f96" : "#2be08a" }} />
            </span>
          </Tip>
        ))}
        <div className="flex -space-x-3">
          {cols.map((c) => <span key={c} className="h-9 w-9 rounded-full border-2 border-[#0a1022]" style={{ background: `linear-gradient(160deg,${c},#0d1528)` }} />)}
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#0a1022] bg-[#16233f] font-mono text-[9px] font-black text-ink-300">+24</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {[{ r: "#ffc24b", l: "GOLD" }, { r: "#9b6bff", l: "DIAMOND" }].map((f) => (
          <div key={f.l} className="relative">
            <span className="spin-slow absolute -inset-1 rounded-full" style={{ background: `conic-gradient(from 0deg, ${f.r}, transparent 60%, ${f.r})`, maskImage: "radial-gradient(circle, transparent 60%, #000 62%)", WebkitMaskImage: "radial-gradient(circle, transparent 60%, #000 62%)" }} />
            <span className="relative grid h-12 w-12 place-items-center rounded-full sf-raised text-ink-200"><Icon name="user" size={20} /></span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-mono text-[6.5px] font-black tracking-wider" style={{ background: f.r, color: "#1a1002" }}>{f.l}</span>
          </div>
        ))}
        <span className="font-mono text-[9px] leading-relaxed text-ink-500">frame / animated<br />conic ring 8s</span>
      </div>
    </div>
  );
}

/* ============ Table ============ */
const TBL = [
  { id: "#8241", pair: "BTC/USDT", side: "LONG", size: 2400, pnl: 482.1, st: "Filled" },
  { id: "#8239", pair: "ETH/USDT", side: "SHORT", size: 1200, pnl: -96.4, st: "Filled" },
  { id: "#8236", pair: "SOL/USDT", side: "LONG", size: 640, pnl: 212.8, st: "Open" },
  { id: "#8230", pair: "ARB/USDT", side: "SHORT", size: 320, pnl: -41.2, st: "Cancelled" },
];

function Table() {
  const [key, setKey] = useState<"pnl" | "size">("pnl");
  const [dir, setDir] = useState(1);
  const rows = [...TBL].sort((a, b) => (a[key] - b[key]) * dir);
  return (
    <div className="overflow-hidden rounded-xl sf-inset">
      <div className="grid grid-cols-[52px_1fr_58px_62px_68px] gap-1 bg-[rgba(90,130,220,.07)] px-2 py-1.5 font-mono text-[8px] uppercase tracking-wider text-ink-500">
        <span>ID</span><span>Pair</span>
        <button onClick={() => { setKey("size"); setDir((d) => -d); blip("tap"); }} className={cn("flex items-center gap-0.5 text-right hover:text-white", key === "size" && "text-[var(--accent)]")}>Size<Icon name="sort" size={8} /></button>
        <button onClick={() => { setKey("pnl"); setDir((d) => -d); blip("tap"); }} className={cn("flex items-center gap-0.5 hover:text-white", key === "pnl" && "text-[var(--accent)]")}>PnL<Icon name="sort" size={8} /></button>
        <span className="text-right">Status</span>
      </div>
      {rows.map((r) => (
        <motion.div layout key={r.id} transition={{ type: "spring", stiffness: 400, damping: 32 }} className="grid grid-cols-[52px_1fr_58px_62px_68px] items-center gap-1 border-t border-[rgba(125,155,220,.08)] px-2 py-2 font-mono text-[9.5px] transition-colors hover:bg-[rgba(90,130,220,.07)]">
          <span className="text-ink-500">{r.id}</span>
          <span className="flex items-center gap-1 font-bold text-white">
            {r.pair}<span className={cn("text-[7px] font-black", r.side === "LONG" ? "text-bull" : "text-bear")}>{r.side}</span>
          </span>
          <span className="tnum text-ink-300">${r.size}</span>
          <span className={cn("tnum font-bold", r.pnl >= 0 ? "text-bull" : "text-bear")}>{r.pnl >= 0 ? "+" : ""}{r.pnl}</span>
          <span className="text-right">
            <span className={cn("rounded px-1 py-0.5 text-[7.5px] font-black uppercase", r.st === "Filled" ? "bg-[rgba(43,224,138,.14)] text-bull" : r.st === "Open" ? "bg-[rgba(56,225,255,.14)] text-aqua" : "bg-[rgba(125,155,220,.12)] text-ink-400")}>{r.st}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Stat tiles ============ */
function Stats() {
  const s: { i: IconName; v: number; dp?: number; pre?: string; suf?: string; l: string; c: string }[] = [
    { i: "bolt", v: 12480, l: "Total XP", c: "var(--accent)" },
    { i: "target", v: 87.4, dp: 1, suf: "%", l: "Accuracy", c: "#38e1ff" },
    { i: "clock", v: 46, suf: "h", l: "Screen time", c: "#9b6bff" },
    { i: "trophy", v: 23, l: "Badges", c: "#ffc24b" },
  ];
  return (
    <div className="grid h-full grid-cols-2 gap-2">
      {s.map((x) => (
        <motion.div key={x.l} whileHover={{ y: -3 }} className="rounded-xl sf-base hairline p-2.5">
          <Icon name={x.i} size={15} style={{ color: x.c }} />
          <div className="tnum mt-1 font-mono text-[16px] font-black text-white"><Num value={x.v} dp={x.dp ?? 0} prefix={x.pre ?? ""} suffix={x.suf ?? ""} /></div>
          <div className="font-mono text-[7.5px] uppercase tracking-wider text-ink-500">{x.l}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Timeline ============ */
function Timeline() {
  const ev: { i: IconName; t: string; s: string; c: string }[] = [
    { i: "check", t: "Completed 'Order Books'", s: "2m ago · +80 XP", c: "#2be08a" },
    { i: "trophy", t: "Promoted to Gold League", s: "1h ago", c: "#ffc24b" },
    { i: "trendDown", t: "Liquidated demo position", s: "4h ago · −1 ♥", c: "#ff4d6a" },
    { i: "gem", t: "Purchased Streak Freeze", s: "yesterday · −200", c: "#38e1ff" },
  ];
  return (
    <div className="relative flex h-full flex-col justify-center gap-3 pl-1">
      <span className="absolute bottom-3 left-[14px] top-3 w-px bg-[rgba(125,155,220,.18)]" />
      {ev.map((e, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative flex items-start gap-2.5">
          <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full sf-raised" style={{ color: e.c, boxShadow: `0 0 0 3px #0a1022, inset 0 0 0 1px ${e.c}55` }}><Icon name={e.i} size={13} strokeWidth={2.4} /></span>
          <div className="min-w-0 pt-0.5">
            <div className="truncate text-[11px] font-bold text-ink-200">{e.t}</div>
            <div className="font-mono text-[8px] text-ink-500">{e.s}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Accordion ============ */
function Accordion() {
  const [o, setO] = useState(0);
  const qs = [
    ["What is slippage?", "The gap between expected and executed price, widened by thin liquidity and fast markets."],
    ["How is XP calculated?", "Base XP per drill × combo multiplier × streak bonus, capped at 3× per session."],
    ["Is capital real?", "No. Every simulation runs on a mirrored orderbook with virtual capital."],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {qs.map(([q, a], i) => (
        <div key={q} className="overflow-hidden rounded-xl sf-base hairline">
          <button onClick={() => { setO(o === i ? -1 : i); blip("tap"); }} className="flex w-full items-center gap-2 p-2.5 text-left">
            <span className="flex-1 text-[11px] font-bold text-ink-200">{q}</span>
            <motion.span animate={{ rotate: o === i ? 180 : 0 }}><Icon name="chevronDown" size={14} className="text-ink-500" /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {o === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>
                <p className="px-2.5 pb-2.5 text-[10px] leading-relaxed text-ink-400">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ============ Snap carousel ============ */
function Carousel() {
  const cards = [
    { t: "Candle Anatomy", c: "#2be08a", i: "candle" as IconName },
    { t: "Risk Ladder", c: "#ffc24b", i: "shield" as IconName },
    { t: "Orderflow", c: "#38e1ff", i: "layers" as IconName },
    { t: "Psychology", c: "#9b6bff", i: "brain" as IconName },
  ];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="mask-fade-r flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2">
        {cards.map((c) => (
          <motion.div key={c.t} whileHover={{ y: -4 }} className="relative h-[124px] w-[132px] shrink-0 snap-center overflow-hidden rounded-2xl p-3" style={{ background: `linear-gradient(165deg, color-mix(in srgb,${c.c} 26%,#101a34), #0a1022)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.14), 0 10px 22px -10px ${c.c}66` }}>
            <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" style={{ background: `${c.c}55` }} />
            <Icon name={c.i} size={24} style={{ color: c.c }} />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-[12px] font-black leading-tight text-white">{c.t}</div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-black/40"><span className="block h-full rounded-full" style={{ width: "62%", background: c.c }} /></div>
            </div>
          </motion.div>
        ))}
      </div>
      <span className="font-mono text-[9px] text-ink-500">carousel / snap-x · edge fade mask</span>
    </div>
  );
}

/* ============ Tooltips + coachmark ============ */
function Tooltips() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex gap-3">
        <Tip label="Risk-adjusted return"><span className="rounded-lg sf-base hairline px-2.5 py-1.5 font-mono text-[10px] text-ink-300">Sharpe ratio</span></Tip>
        <Tip label="Locked until Lv.12"><span className="grid h-9 w-9 place-items-center rounded-lg sf-base hairline text-ink-500"><Icon name="lock" size={15} /></span></Tip>
      </div>
      <div className="relative w-full rounded-2xl p-3" style={{ background: "linear-gradient(160deg, color-mix(in srgb,var(--accent) 22%,#101a34), #0a1022)", boxShadow: "inset 0 0 0 1px var(--accent-glow)" }}>
        <span className="absolute -top-1.5 left-8 h-3 w-3 rotate-45" style={{ background: "color-mix(in srgb,var(--accent) 22%,#101a34)" }} />
        <div className="flex items-start gap-2">
          <Icon name="sparkles" size={15} style={{ color: "var(--accent)" }} />
          <div>
            <div className="text-[11px] font-black text-white">Tip: scale out in thirds</div>
            <div className="mt-0.5 font-mono text-[8.5px] text-ink-400">Coach-mark · step 2 of 4</div>
          </div>
          <div className="ml-auto flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i === 1 ? "var(--accent)" : "rgba(125,155,220,.3)" }} />)}</div>
        </div>
      </div>
    </div>
  );
}

export default function DataDisplay() {
  return (
    <Section id="data" index="06" title="Data Display" kicker="Cards · Tables · Identity · Story" count="10 assets">
      <Grid>
        <Cell title="Hero Lesson Card" spec="3D tilt · parallax" span="col-span-2"><TiltCard /></Cell>
        <Cell title="List Items" spec="3 densities" span="col-span-2"><ListItems /></Cell>
        <Cell title="Stat Tiles" spec="count-up" span="col-span-2"><Stats /></Cell>
        <Cell title="Order Table" spec="sortable · layout" span="col-span-2 lg:col-span-3"><Table /></Cell>
        <Cell title="Avatars & Frames" spec="status · conic ring" span="col-span-2 lg:col-span-3"><Avatars /></Cell>
        <Cell title="Badges & Pills" spec="11 variants" span="col-span-2"><Badges /></Cell>
        <Cell title="Activity Timeline" spec="stagger reveal" span="col-span-2"><Timeline /></Cell>
        <Cell title="Accordion / FAQ" spec="height spring" span="col-span-2"><Accordion /></Cell>
        <Cell title="Snap Carousel" spec="4 cards · mask" span="col-span-2 lg:col-span-3"><Carousel /></Cell>
        <Cell title="Tooltips & Coachmarks" spec="hover + onboarding" span="col-span-2 lg:col-span-3"><Tooltips /></Cell>
      </Grid>
    </Section>
  );
}
