import { useState } from "react";
import { Asset, Btn, Label, Section, Coin, useAnimatedNumber, FloatText } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

function HUD() {
  const [open, setOpen] = useState<string | null>(null);
  const [gems, setGems] = useState(1250);
  const [hearts, setHearts] = useState(4);
  const [pops, setPops] = useState<{ id: number; text: string; color?: string }[]>([]);
  const g = useAnimatedNumber(gems);
  const items = [
    { k: "streak", icon: "flame", val: "12", color: "#ff8a3d", cls: "anim-flicker" },
    { k: "gems", icon: "gem", val: Math.round(g).toLocaleString(), color: "#3da5ff", cls: "" },
    { k: "hearts", icon: "heart", val: String(hearts), color: "#ff4b6e", cls: hearts < 5 ? "anim-breathe" : "" },
  ];
  return (
    <Asset code="NAV-01" title="Top HUD" desc="Game currency bar. Tap a counter for its popover; counters tween when values change." tags={["popover", "tween"]}>
      <div className="well p-2 relative">
        <div className="flex items-center justify-between gap-1">
          <button onClick={() => setOpen(open === "course" ? null : "course")} className="p-1.5 rounded-xl hover:bg-white/5"><Coin sym="BTC" size={30} /></button>
          {items.map((it) => (
            <button key={it.k} onClick={() => setOpen(open === it.k ? null : it.k)} className={cn("relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors", open === it.k ? "bg-white/10" : "hover:bg-white/5")}>
              <span className={it.cls} style={{ color: it.color }}><Icon name={it.icon} size={22} fill={it.color} stroke={1.5} /></span>
              <span className="num font-extrabold text-sm" style={{ color: it.color }}>{it.val}</span>
              {it.k === "gems" && <FloatText items={pops} />}
            </button>
          ))}
        </div>
        {open && (
          <div className="absolute left-2 right-2 top-full mt-3 z-20 panel !rounded-2xl p-4 anim-rise">
            <span className="absolute -top-2 w-4 h-4 rotate-45 bg-[#15244a] border-l border-t border-white/10" style={{ left: { course: "8%", streak: "33%", gems: "58%", hearts: "85%" }[open] }} />
            {open === "streak" && <div className="flex items-center gap-3"><Icon name="flame" size={40} fill="#ff8a3d" className="text-flame anim-flicker" /><div><div className="font-black">12 day streak!</div><div className="text-xs text-mist">Finish a lesson today to keep it alive.</div></div></div>}
            {open === "gems" && <div className="flex items-center gap-3"><Icon name="gem" size={36} fill="#3da5ff" className="text-sky" /><div className="flex-1"><div className="font-black">{gems.toLocaleString()} gems</div><div className="text-xs text-mist">Spend on hearts & streak freezes</div></div><Btn size="xs" variant="sky" onClick={() => { setGems((x) => x + 50); setPops((p) => [...p, { id: Date.now(), text: "+50", color: "#3da5ff" }]); }}>+50</Btn></div>}
            {open === "hearts" && <div><div className="flex gap-1 mb-2">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="heart" size={24} fill={i < hearts ? "#ff4b6e" : "#172856"} stroke={1.5} className={i < hearts ? "text-bear" : "text-ink-600"} />)}</div><div className="flex items-center justify-between"><span className="text-xs text-mist">Next heart in <b className="num text-fog">04:12</b></span><Btn size="xs" variant="bear" disabled={hearts >= 5} onClick={() => setHearts((h) => Math.min(5, h + 1))}>Refill</Btn></div></div>}
            {open === "course" && <div className="text-sm"><div className="font-black mb-1">Crypto Foundations</div><div className="text-xs text-mist">Unit 3 · Candlestick Patterns</div></div>}
          </div>
        )}
      </div>
      <div className="mt-auto pt-24 text-[10px] text-mist text-center uppercase tracking-widest">tap any counter</div>
    </Asset>
  );
}

function TabBar() {
  const T = [["Learn", "home"], ["Trade", "candles"], ["League", "trophy"], ["Quests", "target"], ["Profile", "user"]];
  const [a, setA] = useState(0);
  return (
    <Asset code="NAV-02" title="Bottom Tab Bar" desc="Mobile primary nav. Raised active tile slides with spring, icon bounces, badges for unread." tags={["spring", "mobile"]}>
      <div className="well dotgrid flex-1 min-h-[160px] flex flex-col justify-end p-3">
        <div className="text-center text-mist text-sm mb-auto pt-6 anim-rise" key={a}>
          <Icon name={T[a][1]} size={32} className="mx-auto mb-2 text-sky" />
          <span className="font-bold text-fog">{T[a][0]}</span> screen
        </div>
        <div className="glass rounded-2xl p-1.5 grid grid-cols-5 relative shadow-[0_6px_0_#060c1f]">
          <div className="absolute top-1.5 bottom-1.5 rounded-xl tile !border-sky/40 transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${a * 20}% + 6px)`, width: "calc(20% - 12px)" }} />
          {T.map(([t, i], k) => (
            <button key={t} onClick={() => setA(k)} className="relative z-10 flex flex-col items-center gap-0.5 py-2">
              <span key={a === k ? `on-${a}` : "off"} className={cn("transition-colors", a === k ? "text-sky anim-bounce-in" : "text-mist")}><Icon name={i} size={22} stroke={a === k ? 2.5 : 2} /></span>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider", a === k ? "text-fog" : "text-mist/70")}>{t}</span>
              {k === 3 && a !== 3 && <span className="absolute top-1.5 right-[28%] w-2.5 h-2.5 rounded-full bg-flame border-2 border-ink-800 anim-pulse-ring" style={{ ["--ring" as string]: "rgba(255,138,61,.6)" }} />}
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

function Tabs() {
  const T = ["Overview", "Lessons", "Stats"];
  const [a, setA] = useState(0);
  return (
    <Asset code="NAV-03" title="Tabs" desc="Pill tabs with raised selection and cross-fading content panes." tags={["fade"]}>
      <div className="well p-1 flex gap-1 mb-4">
        {T.map((t, i) => (
          <button key={t} onClick={() => setA(i)} className={cn("flex-1 h-10 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all", a === i ? "bg-gradient-to-b from-[#ffa25e] to-[#ff7a2a] text-white shadow-[0_3px_0_#b84a10,inset_0_1px_0_rgba(255,255,255,.3)]" : "text-mist hover:text-fog")}>{t}</button>
        ))}
      </div>
      <div key={a} className="anim-rise flex-1">
        {a === 0 && <div className="space-y-2"><div className="font-extrabold">Technical Analysis I</div><p className="text-sm text-mist">Learn to read price action: candles, trends and key levels. 8 units · 42 lessons.</p><div className="flex gap-2 pt-1">{["Beginner", "4.9 ★", "12k learners"].map((b) => <span key={b} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-fog">{b}</span>)}</div></div>}
        {a === 1 && <div className="space-y-2">{["Candle anatomy", "Trend lines", "Volume basics"].map((l, i) => <div key={l} className="tile p-2.5 flex items-center gap-3"><span className="num text-xs text-mist w-5">0{i + 1}</span><span className="text-sm font-bold flex-1">{l}</span><Icon name={i === 0 ? "check" : i === 1 ? "play" : "lock"} size={16} className={i === 0 ? "text-bull" : i === 1 ? "text-sky" : "text-mist"} /></div>)}</div>}
        {a === 2 && <div className="grid grid-cols-3 gap-2">{[["87%", "Accuracy", "text-bull"], ["2.4h", "Time", "text-sky"], ["1,840", "XP", "text-gold"]].map(([v, l, c]) => <div key={l} className="tile p-3 text-center"><div className={cn("num font-black text-lg", c)}>{v}</div><div className="text-[10px] text-mist uppercase font-bold">{l}</div></div>)}</div>}
      </div>
    </Asset>
  );
}

function CrumbsPagination() {
  const [path, setPath] = useState(["Home", "Courses", "Technical Analysis", "Unit 3"]);
  const [p, setP] = useState(4);
  const total = 12;
  const pages: (number | "…")[] = p <= 3 ? [1, 2, 3, 4, "…", total] : p >= total - 2 ? [1, "…", total - 3, total - 2, total - 1, total] : [1, "…", p - 1, p, p + 1, "…", total];
  return (
    <Asset code="NAV-04" title="Breadcrumbs & Pagination" desc="Clickable breadcrumb trail that collapses back; smart ellipsis pagination." tags={["collapse", "smart"]}>
      <Label>Breadcrumbs</Label>
      <div className="well px-3 py-2.5 flex items-center flex-wrap gap-1 text-xs mb-2">
        {path.map((c, i) => (
          <span key={c} className="flex items-center gap-1 anim-rise">
            <button onClick={() => setPath(path.slice(0, i + 1))} className={cn("px-1.5 py-0.5 rounded-md font-bold transition-colors", i === path.length - 1 ? "text-fog bg-white/5" : "text-sky hover:bg-sky/10")}>{i === 0 ? <Icon name="home" size={13} /> : c}</button>
            {i < path.length - 1 && <Icon name="chevR" size={12} className="text-mist" />}
          </span>
        ))}
      </div>
      <button onClick={() => setPath(["Home", "Courses", "Technical Analysis", "Unit 3"])} className="text-[10px] text-mist hover:text-sky mb-5 self-start">↺ restore path</button>
      <Label>Pagination · page {p} of {total}</Label>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button disabled={p === 1} onClick={() => setP(p - 1)} className="btn3d v-ghost h-9 w-9 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevL" size={16} stroke={3} /></button>
        {pages.map((x, i) => x === "…" ? <span key={`e${i}`} className="text-mist px-1">…</span> : (
          <button key={x} onClick={() => setP(x)} className={cn("btn3d h-9 min-w-9 !px-2 !rounded-xl num text-xs", p === x ? "v-flame" : "v-ghost")} style={{ ["--lip" as string]: "3px" }}>{x}</button>
        ))}
        <button disabled={p === total} onClick={() => setP(p + 1)} className="btn3d v-ghost h-9 w-9 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevR" size={16} stroke={3} /></button>
      </div>
    </Asset>
  );
}

function Stepper() {
  const S = [["Account", "user"], ["Verify", "shield"], ["Quiz", "book"], ["Deposit", "wallet"], ["Trade", "candles"]];
  const [s, setS] = useState(2);
  return (
    <Asset code="NAV-05" title="5-Step Process" desc="Onboarding stepper. Connectors fill, current node pulses with tooltip, completed nodes stamp ✓." tags={["progress", "pulse"]} span={2}>
      <div className="relative px-2 pt-12 pb-2">
        <div className="absolute left-8 right-8 top-[72px] h-2 well !rounded-full" />
        <div className="absolute left-8 top-[72px] h-2 rounded-full bg-gradient-to-r from-[#3ce49e] to-[#ffa25e] transition-all duration-500" style={{ width: `calc((100% - 64px) * ${s / (S.length - 1)})` }} />
        <div className="relative flex justify-between">
          {S.map(([t, i], k) => {
            const st = k < s ? "done" : k === s ? "cur" : "todo";
            return (
              <button key={t} onClick={() => setS(k)} className="flex flex-col items-center gap-2 relative w-16">
                {st === "cur" && <span className="absolute -top-11 glass text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap anim-pop text-flame">Step {k + 1}: {t}<span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-ink-800 border-r border-b border-white/10" /></span>}
                <span className={cn("w-12 h-12 rounded-full grid place-items-center transition-all duration-300",
                  st === "done" && "bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_4px_0_#0b7a4a,inset_0_2px_0_rgba(255,255,255,.3)] text-white",
                  st === "cur" && "bg-gradient-to-b from-[#ffa25e] to-[#ff7a2a] shadow-[0_4px_0_#b84a10,inset_0_2px_0_rgba(255,255,255,.3)] text-white scale-110 anim-pulse-ring",
                  st === "todo" && "tile text-mist")} style={st === "cur" ? { ["--ring" as string]: "rgba(255,138,61,.55)" } : undefined}>
                  <Icon name={st === "done" ? "check" : i} size={20} stroke={st === "done" ? 3 : 2.2} className={st === "done" ? "anim-pop" : ""} />
                </span>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", st === "todo" ? "text-mist" : "text-fog")}>{t}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Btn variant="ghost" size="sm" icon="chevL" disabled={s === 0} onClick={() => setS(s - 1)}>Back</Btn>
        <div className="flex-1 grid place-items-center text-xs text-mist"><span><b className="num text-fog">{s + 1}</b> / {S.length} complete</span></div>
        <Btn variant={s === S.length - 1 ? "bull" : "flame"} size="sm" iconRight={s === S.length - 1 ? undefined : "chevR"} onClick={() => setS(Math.min(S.length - 1, s + 1))}>{s === S.length - 1 ? "Finish" : "Next"}</Btn>
      </div>
    </Asset>
  );
}

function CourseSelect() {
  const C = [["Crypto Foundations", "BTC", "68%"], ["Technical Analysis", "ETH", "24%"], ["DeFi & Yield", "SOL", "5%"], ["Risk Management", "TON", "0%"]];
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  return (
    <Asset code="NAV-06" title="Course Switcher" desc="Dropdown select with staggered options, progress per course and keyboard escape." tags={["dropdown", "stagger"]}>
      <div className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
        <button onClick={() => setOpen(!open)} className={cn("tile w-full p-3 flex items-center gap-3 text-left transition-all", open && "!border-sky/60")}>
          <Coin sym={C[sel][1]} size={36} />
          <div className="flex-1"><div className="text-[10px] text-mist uppercase font-bold tracking-wider">Current course</div><div className="font-extrabold">{C[sel][0]}</div></div>
          <Icon name="chevD" size={20} className={cn("text-mist transition-transform duration-300", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 panel !rounded-2xl p-2 space-y-1">
            {C.map(([n, c, p], i) => (
              <button key={n} onClick={() => { setSel(i); setOpen(false); }} className={cn("w-full flex items-center gap-3 p-2 rounded-xl transition-colors", sel === i ? "bg-sky/15" : "hover:bg-white/5")} style={{ animation: `rise .3s ${i * 0.05}s both` }}>
                <Coin sym={c} size={28} />
                <span className="flex-1 text-left text-sm font-bold">{n}</span>
                <span className="num text-[10px] text-mist">{p}</span>
                {sel === i && <Icon name="check" size={16} stroke={3} className="text-sky" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto pt-28 text-[10px] text-mist text-center uppercase tracking-widest">Esc to close</div>
    </Asset>
  );
}

export default function Navigation() {
  return (
    <Section id="navigation" index="03" title="Navigation" subtitle="Wayfinding for a mobile-first game: HUD, tabs, steps, drill-downs.">
      <HUD />
      <TabBar />
      <CourseSelect />
      <Stepper />
      <Tabs />
      <CrumbsPagination />
    </Section>
  );
}
