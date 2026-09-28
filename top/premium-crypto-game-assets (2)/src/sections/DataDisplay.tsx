import { useState, type ReactNode } from "react";
import { Asset, Bar, Btn, Coin, Label, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { Avatar, Medal } from "./Gamification";
import { cn } from "../utils/cn";

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const [t, setT] = useState({ x: 0, y: 0, gx: 50, gy: 50, on: false });
  return (
    <div
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; setT({ x: (0.5 - py) * 12, y: (px - 0.5) * 14, gx: px * 100, gy: py * 100, on: true }); }}
      onMouseLeave={() => setT({ x: 0, y: 0, gx: 50, gy: 50, on: false })}
      className={cn("relative transition-transform duration-200 ease-out", className)}
      style={{ transform: `perspective(700px) rotateX(${t.x}deg) rotateY(${t.y}deg)`, transformStyle: "preserve-3d" }}
    >
      {children}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none transition-opacity" style={{ opacity: t.on ? 1 : 0, background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,.14), transparent 50%)` }} />
    </div>
  );
}

function CourseCards() {
  const C = [
    { t: "Candlestick Mastery", s: "Read price like a pro", p: 62, g: "from-[#2d8cf0] to-[#1a4fa0]", icon: "candles", tag: "In progress", lv: "Beginner" },
    { t: "DeFi Deep Dive", s: "Yield, pools & risks", p: 0, g: "from-[#8252f5] to-[#4a2aa0]", icon: "layers", tag: "PRO", lv: "Advanced" },
  ];
  return (
    <Asset code="DAT-01" title="Course Cards" desc="Hover for 3D tilt with moving glare. Progress, level tags, lock state for premium." tags={["tilt", "glare"]}>
      <div className="grid grid-cols-2 gap-3">
        {C.map((c) => (
          <TiltCard key={c.t} className="tile !rounded-[18px] overflow-hidden">
            <div className={cn("h-24 bg-gradient-to-br relative overflow-hidden", c.g)}>
              <Icon name={c.icon} size={70} className="absolute -right-2 -bottom-3 text-white/20" stroke={1.5} />
              <span className={cn("absolute left-2 top-2 text-[9px] font-black px-1.5 py-0.5 rounded-md", c.tag === "PRO" ? "bg-gold text-ink-900" : "bg-white/20 text-white")}>{c.tag}</span>
              {c.p === 0 && <Icon name="lock" size={18} className="absolute right-2 top-2 text-white/80" />}
            </div>
            <div className="p-3">
              <div className="font-extrabold text-sm leading-tight">{c.t}</div>
              <div className="text-[10px] text-mist mb-2">{c.s}</div>
              <div className="flex justify-between text-[10px] mb-1"><span className="text-mist">{c.lv}</span><span className="num font-bold">{c.p}%</span></div>
              <Bar value={c.p} color={c.p ? "bull" : "violet"} h={8} shine={false} />
              <Btn variant={c.p ? "bull" : "gold"} size="xs" block className="mt-3">{c.p ? "Continue" : "Unlock"}</Btn>
            </div>
          </TiltCard>
        ))}
      </div>
    </Asset>
  );
}

function Glossary() {
  const G = [
    ["candles", "Candlestick", "Shows open, high, low and close for a time period. Green = closed higher, red = lower.", "Core"],
    ["percent", "APY", "Annual percentage yield — your yearly return including compounding.", "DeFi"],
    ["shield", "Stop-loss", "Auto-closes your trade at a set price to cap losses.", "Risk"],
    ["users", "Market maker", "A participant who provides liquidity by quoting buy and sell prices.", "Market"],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Asset code="DAT-02" title="List Items · Glossary" desc="Rich list rows with leading icon, meta tag and smooth height accordion." tags={["accordion"]}>
      <div className="space-y-2">
        {G.map(([i, t, d, tag], k) => (
          <div key={t} className={cn("tile !rounded-xl overflow-hidden transition-all", open === k && "!border-sky/40")}>
            <button onClick={() => setOpen(open === k ? null : k)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[.03]">
              <span className="w-9 h-9 rounded-xl bg-sky/15 text-sky grid place-items-center shrink-0"><Icon name={i} size={18} /></span>
              <span className="flex-1 min-w-0"><span className="block text-sm font-extrabold">{t}</span><span className="block text-[10px] text-mist">{tag} term</span></span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-fog/70">{tag}</span>
              <Icon name="chevD" size={18} className={cn("text-mist transition-transform duration-300", open === k && "rotate-180 text-sky")} />
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open === k ? "1fr" : "0fr" }}>
              <div className="overflow-hidden"><p className="px-3 pb-3 pl-15 text-xs text-fog/80 leading-relaxed" style={{ paddingLeft: 60 }}>{d}</p></div>
            </div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function BadgesAvatars() {
  const [n, setN] = useState(7);
  return (
    <Asset code="DAT-03" title="Badges & Avatars" desc="Status badges, live pulse, counters, rank-framed avatars with presence and stacked groups." tags={["status", "group"]}>
      <Label>Badges</Label>
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-sky text-white shadow-[0_2px_0_#1a56a8]">NEW</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-flame text-white shadow-[0_2px_0_#b84a10] flex items-center gap-1"><Icon name="flame" size={11} fill="currentColor" />HOT</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#3a2500] shadow-[0_2px_0_#b07600] sheen">PRO</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-bull/15 text-bull border border-bull/30">+12.4%</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-bear/15 text-bear border border-bear/30">−3.1%</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-bear text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white anim-glow" />LIVE</span>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/5 text-mist border border-white/10">Beginner</span>
        <button onClick={() => setN(n + 1)} className="text-[10px] font-black px-2 py-1 rounded-lg bg-violet/20 text-violet border border-violet/30 flex items-center gap-1">Inbox <span key={n} className="num bg-violet text-white rounded-md px-1 anim-pop">{n}</span></button>
      </div>
      <Label>Avatars · rank frames & presence</Label>
      <div className="flex items-end gap-3 mb-5">
        <Avatar name="Kat" size={52} ring="gold" status="on" hue={330} />
        <Avatar name="Max" size={46} ring="violet" status="away" hue={260} />
        <Avatar name="Leo" size={40} ring="sky" status="on" hue={190} />
        <Avatar name="Ivy" size={34} ring="bull" status="off" hue={140} />
        <Avatar name="Zed" size={28} hue={30} />
      </div>
      <Label>Group</Label>
      <div className="flex items-center">
        {["Ann", "Bob", "Cy", "Di"].map((x, i) => <div key={x} className="-ml-3 first:ml-0 hover:-translate-y-1 transition-transform" style={{ zIndex: 10 - i }}><Avatar name={x} size={38} hue={i * 70 + 20} /></div>)}
        <div className="-ml-3 w-[38px] h-[38px] rounded-full bg-ink-600 border-2 border-ink-850 grid place-items-center num text-[11px] font-black text-fog">+24</div>
        <span className="ml-3 text-xs text-mist">friends learning now</span>
      </div>
    </Asset>
  );
}

function Tooltips() {
  const [pop, setPop] = useState(false);
  const Tip = ({ pos, label, children }: { pos: "top" | "bottom" | "left" | "right"; label: string; children: ReactNode }) => {
    const p = { top: "bottom-full mb-2 left-1/2 -translate-x-1/2", bottom: "top-full mt-2 left-1/2 -translate-x-1/2", left: "right-full mr-2 top-1/2 -translate-y-1/2", right: "left-full ml-2 top-1/2 -translate-y-1/2" }[pos];
    return (
      <div className="relative group">
        {children}
        <span className={cn("absolute z-20 whitespace-nowrap text-[11px] font-bold px-2.5 py-1.5 rounded-lg glass opacity-0 scale-90 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100", p)}>{label}</span>
      </div>
    );
  };
  return (
    <Asset code="DAT-04" title="Tooltips & Popover" desc="4-direction hover/focus tooltips with scale-in + a click popover explaining a term inline." tags={["hover", "focus"]}>
      <div className="well dotgrid grid place-items-center py-10 mb-4">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 place-items-center">
          <span /><Tip pos="top" label="Top · price alert"><button className="btn3d v-ghost w-11 h-11 !p-0 !rounded-xl"><Icon name="bell" size={18} /></button></Tip><span />
          <Tip pos="left" label="Left · search"><button className="btn3d v-ghost w-11 h-11 !p-0 !rounded-xl"><Icon name="search" size={18} /></button></Tip>
          <span className="text-[10px] text-mist">hover</span>
          <Tip pos="right" label="Right · settings"><button className="btn3d v-ghost w-11 h-11 !p-0 !rounded-xl"><Icon name="settings" size={18} /></button></Tip>
          <span /><Tip pos="bottom" label="Bottom · wallet"><button className="btn3d v-ghost w-11 h-11 !p-0 !rounded-xl"><Icon name="wallet" size={18} /></button></Tip><span />
        </div>
      </div>
      <p className="text-sm text-fog leading-relaxed relative">
        Stake ETH to earn{" "}
        <span className="relative inline-block">
          <button onClick={() => setPop(!pop)} className="font-black text-sky underline decoration-dotted underline-offset-4">4.2% APY</button>
          {pop && (
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 panel !rounded-2xl p-3 z-30 anim-pop block text-left">
              <span className="flex items-center gap-2 mb-1"><Icon name="info" size={16} className="text-sky" /><b className="text-sm">What's APY?</b></span>
              <span className="text-xs text-mist block">Yearly return including compounding. 1 ETH at 4.2% ≈ 1.042 ETH after a year.</span>
              <button onClick={() => setPop(false)} className="text-[11px] font-black text-sky mt-2">Got it</button>
              <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0f1b3a] border-r border-b border-white/10" />
            </span>
          )}
        </span>{" "}with no lock-up.
      </p>
    </Asset>
  );
}

function SortTable() {
  const D = [
    { s: "BTC", p: 67421.5, c: 2.41, m: 1328 }, { s: "ETH", p: 3512.4, c: -1.12, m: 422 }, { s: "SOL", p: 172.35, c: 6.82, m: 79 },
    { s: "BNB", p: 598.2, c: 0.54, m: 88 }, { s: "TON", p: 7.12, c: -3.4, m: 24 }, { s: "DOGE", p: 0.1621, c: 11.2, m: 23 },
  ];
  const [k, setK] = useState<"s" | "p" | "c" | "m">("m");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [f, setF] = useState<"all" | "up" | "down">("all");
  const rows = D.filter((r) => (f === "all" ? true : f === "up" ? r.c >= 0 : r.c < 0)).sort((a, b) => (a[k] > b[k] ? 1 : -1) * dir);
  const H = ({ id, children, right }: { id: typeof k; children: ReactNode; right?: boolean }) => (
    <button onClick={() => { if (k === id) setDir(dir === 1 ? -1 : 1); else { setK(id); setDir(-1); } }} className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors", right && "justify-end", k === id ? "text-sky" : "text-mist hover:text-fog")}>
      {children}<Icon name={k === id ? (dir === 1 ? "chevU" : "chevD") : "sort"} size={12} stroke={3} />
    </button>
  );
  return (
    <Asset code="DAT-05" title="Sortable Table" desc="Compact data table: tap headers to sort asc/desc, quick filters, zebra & hover rows." tags={["sort", "filter"]} span={2}>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="filter" size={16} className="text-mist" />
        {(["all", "up", "down"] as const).map((x) => <button key={x} onClick={() => setF(x)} className={cn("text-[11px] font-bold px-3 py-1 rounded-full border-2 transition-all", f === x ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{x === "all" ? "All" : x === "up" ? "Gainers" : "Losers"}</button>)}
        <span className="ml-auto text-[10px] text-mist">{rows.length} assets</span>
      </div>
      <div className="well overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-2 px-4 py-2.5 bg-ink-750/60 border-b border-white/5">
          <H id="s">Asset</H><H id="p" right>Price</H><H id="c" right>24h</H><H id="m" right>Mkt cap</H>
        </div>
        {rows.map((r, i) => (
          <div key={r.s} className={cn("grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-2 px-4 py-2.5 items-center hover:bg-sky/[.06] transition-colors", i % 2 && "bg-white/[.015]")} style={{ animation: `rise .3s ${i * 0.04}s both` }}>
            <span className="flex items-center gap-2.5"><Coin sym={r.s} size={26} /><span className="text-sm font-extrabold">{r.s}</span></span>
            <span className="num text-xs text-right">${r.p >= 1 ? r.p.toLocaleString() : r.p}</span>
            <span className={cn("num text-xs font-bold text-right", r.c >= 0 ? "text-bull" : "text-bear")}>{r.c >= 0 ? "+" : ""}{r.c}%</span>
            <span className="num text-xs text-right text-fog">${r.m}B</span>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-center text-sm text-mist">No assets match</div>}
      </div>
    </Asset>
  );
}

function Profile() {
  const [follow, setFollow] = useState(false);
  const [fans, setFans] = useState(1284);
  return (
    <Asset code="DAT-06" title="Player Profile" desc="Identity card: level ring, league medal, stat tiles, follow toggle with counter." tags={["social", "toggle"]}>
      <div className="relative -mx-5 -mt-1 h-20 mb-10 bg-gradient-to-r from-[#1a56a8] via-[#4f2bb0] to-[#1a56a8] rounded-2xl overflow-visible">
        <div className="absolute inset-0 dotgrid opacity-40 rounded-2xl" />
        <div className="absolute left-5 -bottom-8"><Avatar name="Alex" size={72} ring="gold" status="on" hue={200} /></div>
        <div className="absolute right-4 -bottom-6"><Medal tier="diamond" icon="gem" size={44} /></div>
      </div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div><div className="font-black text-lg">Alex Volkov</div><div className="text-xs text-mist">@alexv · Joined 2024 · 🇷🇺</div></div>
        <Btn variant={follow ? "ghost" : "sky"} size="sm" icon={follow ? "check" : "plus"} onClick={() => { setFollow(!follow); setFans(fans + (follow ? -1 : 1)); }}>{follow ? "Following" : "Follow"}</Btn>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[["flame", "124", "Day streak", "#ff8a3d"], ["bolt", "48.2k", "Total XP", "#ffc53d"], ["trophy", "Diamond", "League", "#3da5ff"], ["users", fans.toLocaleString(), "Followers", "#9b6bff"]].map(([i, v, l, c]) => (
          <div key={l} className="tile !rounded-xl p-2.5 flex items-center gap-2.5">
            <Icon name={i} size={22} fill={c} stroke={1.5} className="shrink-0" />
            <div className="min-w-0"><div key={v} className="num font-black text-sm truncate anim-rise">{v}</div><div className="text-[9px] text-mist uppercase font-bold">{l}</div></div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

export default function DataDisplay() {
  return (
    <Section id="data" index="07" title="Data Display" subtitle="Cards, lists, tables and identity — dense information that stays readable on a phone.">
      <CourseCards />
      <Glossary />
      <Profile />
      <SortTable />
      <BadgesAvatars />
      <Tooltips />
    </Section>
  );
}
