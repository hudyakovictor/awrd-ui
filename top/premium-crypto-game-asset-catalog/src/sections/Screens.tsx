import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag, blip } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

function Phone({ children, label }: { children: ReactNode; label: string }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ perspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setT({ x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: -((e.clientY - r.top) / r.height - 0.5) * 12 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
    >
      <motion.div
        animate={{ rotateY: t.x, rotateX: t.y }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        className="relative h-[520px] w-[262px] shrink-0 rounded-[38px] p-[9px]"
        style={{
          background: "linear-gradient(160deg,#2b3c63,#0a1022 60%)",
          boxShadow: "0 3px 0 rgba(255,255,255,.1) inset, 0 34px 60px -24px rgba(0,0,0,1), 0 0 0 1px rgba(140,175,255,.16)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[30px]" style={{ background: "radial-gradient(120% 80% at 50% 0%, #142244 0%, #070b18 60%)" }}>
          <div className="absolute left-1/2 top-2 z-30 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-[#04060e]" />
          {children}
        </div>
      </motion.div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">{label}</span>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pb-1 pt-2.5 font-mono text-[8px] font-bold text-ink-300">
      <span>9:41</span>
      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-bull" />5G ▮▮▮</span>
    </div>
  );
}

function MiniNav({ a = 0 }: { a?: number }) {
  const items: IconName[] = ["home", "chart", "target", "trophy", "user"];
  return (
    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-2xl sf-raised hairline-strong px-2 py-2">
      {items.map((n, i) => (
        <span key={n} className="relative grid flex-1 place-items-center py-0.5" style={{ color: i === a ? "var(--accent)" : "#4a5c85" }}>
          {i === a && <span className="absolute inset-x-1 inset-y-0 rounded-xl" style={{ background: "color-mix(in srgb,var(--accent) 15%,transparent)" }} />}
          <Icon name={n} size={17} strokeWidth={i === a ? 2.3 : 1.8} className="relative" />
        </span>
      ))}
    </div>
  );
}

function LearnScreen() {
  const nodes: ("done" | "active" | "locked" | "bonus")[] = ["done", "done", "bonus", "active", "locked", "locked"];
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-1.5 px-3 pb-2">
        <span className="flex items-center gap-1 rounded-full sf-inset px-2 py-1"><Icon name="flame" size={11} className="flame text-gold" /><span className="tnum font-mono text-[9px] font-black text-gold">42</span></span>
        <span className="flex items-center gap-1 rounded-full sf-inset px-2 py-1"><Icon name="gem" size={11} className="text-aqua" /><span className="tnum font-mono text-[9px] font-black text-aqua">1280</span></span>
        <span className="flex items-center gap-0.5 rounded-full sf-inset px-2 py-1">{[1, 2, 3, 4, 5].map((h) => <Icon key={h} name="heart" size={9} className={h <= 4 ? "text-bear" : "text-navy-500"} style={h <= 4 ? { fill: "#ff4d6a" } : undefined} />)}</span>
        <span className="ml-auto h-6 w-6 rounded-lg" style={{ background: "linear-gradient(140deg,var(--accent),#9b6bff)" }} />
      </div>
      <div className="mx-3 mb-2 rounded-2xl p-2.5" style={{ background: "linear-gradient(120deg, color-mix(in srgb,var(--accent) 24%,#101a34), #0a1022)", boxShadow: "inset 0 0 0 1px var(--accent-glow)" }}>
        <div className="font-mono text-[7px] uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>chapter 3 · risk</div>
        <div className="text-[12px] font-black text-white">Position Sizing</div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/40"><span className="block h-full rounded-full" style={{ width: "62%", background: "var(--accent)" }} /></div>
      </div>
      <div className="flex-1 overflow-hidden px-3">
        <div className="flex flex-col items-center gap-2">
          {nodes.map((s, i) => {
            const off = [0, 34, 52, 34, 0, -34][i];
            return (
              <div key={i} className="relative" style={{ transform: `translateX(${off}px)` }}>
                {s === "active" && <span className="pulse-ring absolute -inset-1 rounded-full" style={{ boxShadow: "0 0 0 3px var(--accent)" }} />}
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="relative grid h-[46px] w-[46px] place-items-center rounded-full"
                  style={{
                    background: s === "done" ? "linear-gradient(180deg,#5cf0ab,#18b06a)" : s === "active" ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))" : s === "bonus" ? "linear-gradient(180deg,#ffe0a0,#e39312)" : "linear-gradient(180deg,#22304f,#131c33)",
                    boxShadow: `0 5px 0 ${s === "done" ? "#0f7048" : s === "active" ? "var(--accent-edge)" : s === "bonus" ? "#9a6209" : "#0a1020"}, inset 0 2px 0 rgba(255,255,255,.35)`,
                    color: s === "locked" ? "#4a5c85" : "#06140d",
                  }}
                >
                  <Icon name={s === "done" ? "check" : s === "locked" ? "lock" : s === "bonus" ? "chest" : "bolt"} size={20} strokeWidth={2.6} />
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniNav a={0} />
    </div>
  );
}

function TradeScreen() {
  const bars = [38, 52, 44, 61, 55, 72, 64, 80, 74, 88, 82, 94];
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-2 px-3 pb-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "linear-gradient(180deg,#ffc24b,#a86e10)" }}><Icon name="bitcoin" size={14} className="text-[#2a1a02]" /></span>
        <div><div className="text-[11px] font-black text-white">BTC/USDT</div><div className="font-mono text-[7px] text-ink-500">Perp · ×20 max</div></div>
        <div className="ml-auto text-right"><div className="tnum font-mono text-[12px] font-black text-bull">68,412.55</div><div className="tnum font-mono text-[8px] font-bold text-bull">▲ 2.14%</div></div>
      </div>
      <div className="mx-3 h-[120px] rounded-2xl sf-inset p-2">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full">
          <defs><linearGradient id="phg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".45" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
          <polygon points={`0,60 ${bars.map((b, i) => `${(i / (bars.length - 1)) * 100},${60 - (b / 100) * 55}`).join(" ")} 100,60`} fill="url(#phg)" />
          <motion.polyline initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} points={bars.map((b, i) => `${(i / (bars.length - 1)) * 100},${60 - (b / 100) * 55}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mx-3 mt-2 flex gap-1">
        {["1m", "15m", "1H", "4H", "1D"].map((t, i) => (
          <span key={t} className={cn("flex-1 rounded-md py-1 text-center font-mono text-[7px] font-black", i === 2 ? "" : "text-ink-500")} style={i === 2 ? { background: "var(--accent)", color: "var(--accent-ink)" } : { background: "rgba(90,130,220,.08)" }}>{t}</span>
        ))}
      </div>
      <div className="mx-3 mt-2 space-y-[3px] font-mono text-[7.5px]">
        {[[68442, 0.42, "b"], [68436, 0.88, "b"], [68398, 1.24, "a"], [68390, 0.64, "a"]].map(([p, s, k], i) => (
          <div key={i} className="relative flex justify-between rounded-sm px-1 py-[2px]">
            <span className="absolute inset-y-0 right-0 rounded-sm" style={{ width: `${(s as number) * 55}%`, background: k === "b" ? "rgba(255,77,106,.16)" : "rgba(43,224,138,.16)" }} />
            <span className={cn("relative tnum", k === "b" ? "text-bear" : "text-bull")}>{(p as number).toLocaleString()}</span>
            <span className="relative tnum text-ink-400">{s as number}</span>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-auto mb-16 flex gap-2">
        <span data-depth="sm" className="btn3d h-10 flex-1 rounded-xl text-[10px]" style={{ background: "linear-gradient(180deg,#5cf0ab,#2be08a)", color: "#02150b", ["--edge" as any]: "#0f7048" }}><span className="relative z-[4]">LONG</span></span>
        <span data-depth="sm" className="btn3d h-10 flex-1 rounded-xl text-[10px]" style={{ background: "linear-gradient(180deg,#ff8fa2,#ff4d6a)", color: "#1c0309", ["--edge" as any]: "#8e0f2c" }}><span className="relative z-[4]">SHORT</span></span>
      </div>
      <MiniNav a={1} />
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex flex-col items-center px-3 pb-2 pt-1">
        <div className="relative">
          <span className="spin-slow absolute -inset-1.5 rounded-full" style={{ background: "conic-gradient(from 0deg, var(--accent), transparent 60%, var(--accent))", maskImage: "radial-gradient(circle, transparent 62%, #000 64%)", WebkitMaskImage: "radial-gradient(circle, transparent 62%, #000 64%)" }} />
          <span className="relative grid h-16 w-16 place-items-center rounded-full sf-raised" style={{ color: "var(--accent)" }}><Icon name="user" size={28} /></span>
        </div>
        <div className="mt-1.5 text-[13px] font-black text-white">0xNomad</div>
        <div className="font-mono text-[7.5px] uppercase tracking-[0.2em] text-ink-500">gold league · lvl 7</div>
      </div>
      <div className="mx-3 grid grid-cols-3 gap-1.5">
        {[["12.4k", "XP"], ["87%", "ACC"], ["42", "STREAK"]].map(([v, l]) => (
          <div key={l} className="rounded-xl sf-inset px-1 py-2 text-center"><div className="tnum font-mono text-[12px] font-black text-white">{v}</div><div className="font-mono text-[6.5px] uppercase tracking-wider text-ink-500">{l}</div></div>
        ))}
      </div>
      <div className="mx-3 mt-2.5">
        <div className="mb-1 font-mono text-[7px] uppercase tracking-[0.2em] text-ink-500">badges</div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["trophy", "medal", "crown", "shield", "flame", "brain", "rocket", "lock"] as IconName[]).map((n, i) => (
            <motion.span key={n} whileHover={{ scale: 1.12, y: -2 }} className="grid aspect-square place-items-center rounded-xl" style={{ background: i < 6 ? "linear-gradient(170deg,#ffe0a0,#c4851a)" : "linear-gradient(180deg,#1a2845,#0d1528)", color: i < 6 ? "#3a2405" : "#3d4d73", boxShadow: i < 6 ? "0 3px 0 #8a5a0c" : "inset 0 2px 5px rgba(0,0,0,.8)" }}>
              <Icon name={n} size={17} strokeWidth={2} />
            </motion.span>
          ))}
        </div>
      </div>
      <div className="mx-3 mt-2.5 rounded-2xl p-2.5" style={{ background: "linear-gradient(120deg,#2b1d4a,#0a1022)", boxShadow: "inset 0 0 0 1px rgba(155,107,255,.35)" }}>
        <div className="flex items-center gap-2">
          <Icon name="crown" size={18} className="text-violet" />
          <div className="flex-1"><div className="text-[10px] font-black text-white">Go Pro</div><div className="font-mono text-[7px] text-ink-400">Unlimited hearts · live rooms</div></div>
          <span className="rounded-lg px-2 py-1 font-mono text-[8px] font-black" style={{ background: "linear-gradient(180deg,#c4a6ff,#9b6bff)", color: "#0d0620" }}>$9</span>
        </div>
      </div>
      <MiniNav a={4} />
    </div>
  );
}

export default function Screens() {
  const [i, setI] = useState(0);
  const screens = [<LearnScreen key="l" />, <TradeScreen key="t" />, <ProfileScreen key="p" />];
  const labels = ["Learn · skill path", "Trade · live desk", "Profile · identity"];
  return (
    <Section id="screens" index="08" title="Composed Screens" kicker="The kit assembled · production reference" count="3 flows">
      <Grid>
        <Cell title="Device Gallery" spec="tilt · 3 flows" span="col-span-2 md:col-span-4 lg:col-span-6">
          <div className="flex flex-wrap items-start justify-center gap-6 py-2">
            {screens.map((s, k) => (
              <div key={k} className="hidden lg:block"><Phone label={labels[k]}>{s}</Phone></div>
            ))}
            <div className="lg:hidden">
              <Phone label={labels[i]}>{screens[i]}</Phone>
              <div className="mt-3 flex justify-center gap-1.5">
                {labels.map((l, k) => (
                  <button key={l} onClick={() => { setI(k); blip("tap"); }} className="h-2 w-2 rounded-full transition-transform hover:scale-150" style={{ background: i === k ? "var(--accent)" : "#22304f" }} />
                ))}
              </div>
            </div>
          </div>
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">every pixel from the token set</Tag>
        <Tag>zero raster assets</Tag>
        <Tag>60fps spring physics</Tag>
        <Tag tone="gold">ship-ready density</Tag>
      </div>
    </Section>
  );
}
