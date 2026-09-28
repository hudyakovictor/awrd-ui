import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton, HudPill } from "./Device";
import { ART, type ArtKey, GemArt, CoinArt } from "./art";
import { sfx, Confetti, Pop } from "./Juice";

/* ================================================================== */
/*  DEFI ECONOMY SIM — staking · swap · yield · nfts                    */
/*  Paper-money playground teaching real DeFi mechanics safely.         */
/* ================================================================== */

/* ---------------- staking pools ---------------- */
type Pool = { id: string; pair: string; a: ArtKey; b: ArtKey; apy: number; tvl: number; mine: number; c: string; lock: string };
const POOLS: Pool[] = [
  { id: "btc", pair: "BTC / Stable", a: "coin", b: "shield", apy: 8.4, tvl: 48200000, mine: 2400, c: "#ffc24b", lock: "flexible" },
  { id: "eth", pair: "ETH / Stable", a: "gem", b: "shield", apy: 12.7, tvl: 31800000, mine: 0, c: "#9b6bff", lock: "7 days" },
  { id: "sol", pair: "SOL / Stable", a: "bolt", b: "shield", apy: 18.2, tvl: 12400000, mine: 640, c: "#38e1ff", lock: "30 days" },
  { id: "degen", pair: "MEME / Stable", a: "rocket", b: "shield", apy: 64.5, tvl: 2100000, mine: 0, c: "#ff4d6a", lock: "90 days" },
];

function Staking() {
  const [pools, setPools] = useState(POOLS);
  const [bal, setBal] = useState(5000);
  const [conf, setConf] = useState(0);
  const [harvest, setHarvest] = useState(0);
  const pending = useMemo(() => pools.reduce((s, p) => s + (p.mine * p.apy) / 365 / 100 / 24 / 60, 0), [pools]);
  useEffect(() => {
    const id = setInterval(() => setHarvest((h) => h + pending * 2), 2000);
    return () => clearInterval(id);
  }, [pending]);
  const stake = (id: string, amt: number) => {
    if (bal < amt) {
      sfx("wrong");
      return;
    }
    setBal((b) => b - amt);
    setPools((ps) => ps.map((p) => (p.id === id ? { ...p, mine: p.mine + amt } : p)));
    sfx("coin");
  };
  const unstake = (id: string) => {
    const p = pools.find((x) => x.id === id);
    if (!p || p.mine <= 0) return;
    setBal((b) => b + p.mine);
    setPools((ps) => ps.map((x) => (x.id === id ? { ...x, mine: 0 } : x)));
    sfx("select");
  };
  const claim = () => {
    if (harvest < 0.01) return;
    setBal((b) => b + harvest);
    setHarvest(0);
    setConf((c) => c + 1);
    sfx("chest");
  };
  return (
    <div className="relative space-y-2.5">
      <Confetti fire={conf} count={60} />
      <div className="flex items-center gap-2">
        <HudPill><CoinArt size={18} /><Pop value={bal.toFixed(0)} className="text-gold" /></HudPill>
        <div className="ml-auto flex items-center gap-2 rounded-xl border-2 border-bull/50 bg-bull/10 px-3 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-bull">pending</span>
          <Pop value={harvest.toFixed(3)} className="tnum font-mono text-[13px] font-black text-bull" />
          <button type="button" onClick={claim} className="rounded-lg bg-bull px-2 py-1 font-mono text-[9px] font-black uppercase text-[#02150b]">harvest</button>
        </div>
      </div>
      {pools.map((p) => {
        const A = ART[p.a];
        const B = ART[p.b];
        return (
          <motion.div key={p.id} layout className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-3" style={{ boxShadow: "0 3px 0 #070d1c" }}>
            <div className="flex items-center gap-2.5">
              <div className="relative h-11 w-[60px] shrink-0">
                <span className="absolute left-0 top-0"><A size={40} /></span>
                <span className="absolute left-6 top-0"><B size={40} /></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold text-white">{p.pair}</div>
                <div className="font-mono text-[8.5px] uppercase tracking-wider text-ink-500">TVL ${(p.tvl / 1e6).toFixed(1)}M · {p.lock}</div>
              </div>
              <div className="text-right">
                <div className="tnum font-mono text-[16px] font-black" style={{ color: p.c }}>{p.apy}%</div>
                <div className="font-mono text-[7.5px] uppercase tracking-widest text-ink-500">apy</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0a1122]">
                <motion.div animate={{ width: `${Math.min(100, (p.mine / 5000) * 100)}%` }} className="h-full rounded-full" style={{ background: p.c }} />
              </div>
              <span className="tnum font-mono text-[10px] font-black text-ink-300">${p.mine.toLocaleString()}</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[100, 500, 1000].map((a) => (
                <button key={a} type="button" onClick={() => stake(p.id, a)} disabled={bal < a} className="rounded-lg border-2 border-[#22355e] bg-[#101a33] py-1.5 font-mono text-[10px] font-black text-ink-200 disabled:opacity-40" style={{ boxShadow: "0 2px 0 #0a1328" }}>+{a}</button>
              ))}
              <button type="button" onClick={() => unstake(p.id)} disabled={p.mine <= 0} className="rounded-lg border-2 border-bear/50 bg-bear/10 py-1.5 font-mono text-[10px] font-black text-bear disabled:opacity-40">exit</button>
            </div>
          </motion.div>
        );
      })}
      <div className="rounded-xl bg-[#3a0f1c]/40 p-2.5 font-mono text-[9px] leading-relaxed text-[#ffb3c0]">
        ⚠ High APY = high risk. The 64% pool can rug — that's the lesson. Paper money only.
      </div>
    </div>
  );
}

/* ---------------- swap simulator ---------------- */
const TOKENS: { s: string; n: string; art: ArtKey; p: number; c: string }[] = [
  { s: "USDT", n: "Tether", art: "shield", p: 1, c: "#2be08a" },
  { s: "BTC", n: "Bitcoin", art: "coin", p: 68412, c: "#ffc24b" },
  { s: "ETH", n: "Ethereum", art: "gem", p: 3521, c: "#9b6bff" },
  { s: "SOL", n: "Solana", art: "bolt", p: 178.4, c: "#38e1ff" },
];

function Swap() {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [amt, setAmt] = useState("1000");
  const [slip, setSlip] = useState(0.5);
  const [hist, setHist] = useState<{ t: string; v: string }[]>([]);
  const [flip, setFlip] = useState(false);
  const f = TOKENS[from];
  const t = TOKENS[to];
  const out = (parseFloat(amt || "0") * f.p) / t.p;
  const fee = parseFloat(amt || "0") * 0.003;
  const minOut = out * (1 - slip / 100);
  const doSwap = () => {
    if (!parseFloat(amt)) {
      sfx("wrong");
      return;
    }
    setHist((h) => [{ t: `${amt} ${f.s} → ${out.toFixed(6)} ${t.s}`, v: new Date().toLocaleTimeString("en-GB") }, ...h].slice(0, 4));
    sfx("coin");
  };
  const TokenBtn = ({ idx, set, other }: { idx: number; set: (i: number) => void; other: number }) => (
    <div className="flex gap-1">
      {TOKENS.map((tk, i) => (
        <button key={tk.s} type="button" onClick={() => { if (i !== other) { set(i); sfx("select"); } }} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-black", idx === i ? "" : "opacity-40")} style={idx === i ? { background: `${tk.c}22`, color: tk.c, boxShadow: `inset 0 0 0 1px ${tk.c}66` } : { background: "#0d1528", color: "#7d8db4" }}>
          {tk.s}
        </button>
      ))}
    </div>
  );
  return (
    <div className="space-y-3 rounded-3xl border-2 border-[#1c2c52] bg-[#0d1528] p-4">
      <div className="rounded-2xl bg-[#070d1c] p-3" style={{ boxShadow: "inset 0 3px 8px rgba(0,0,0,.6)" }}>
        <div className="mb-1 flex justify-between font-mono text-[8.5px] uppercase tracking-widest text-ink-500"><span>you pay</span><span>bal 12,480</span></div>
        <div className="flex items-center gap-2">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className="tnum w-full bg-transparent font-mono text-[26px] font-black text-white outline-none" />
          <span className="font-mono text-[12px] font-black" style={{ color: f.c }}>{f.s}</span>
        </div>
        <div className="mt-2"><TokenBtn idx={from} set={setFrom} other={to} /></div>
      </div>
      <div className="relative flex justify-center">
        <span className="absolute inset-x-8 top-1/2 h-[2px] -translate-y-1/2 bg-[#1c2c52]" />
        <motion.button type="button" whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => { setFrom(to); setTo(from); setFlip(!flip); sfx("swipe"); }} className="relative grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#22355e] bg-[#101a33] text-ink-200" style={{ boxShadow: "0 4px 0 #0a1328" }}>
          <Icon name="swap" size={18} strokeWidth={2.4} />
        </motion.button>
      </div>
      <div className="rounded-2xl bg-[#070d1c] p-3" style={{ boxShadow: "inset 0 3px 8px rgba(0,0,0,.6)" }}>
        <div className="mb-1 font-mono text-[8.5px] uppercase tracking-widest text-ink-500">you receive (est.)</div>
        <div className="flex items-center gap-2">
          <Pop value={out.toFixed(6)} className="tnum w-full font-mono text-[26px] font-black" color={t.c} />
          <span className="font-mono text-[12px] font-black" style={{ color: t.c }}>{t.s}</span>
        </div>
        <div className="mt-2"><TokenBtn idx={to} set={setTo} other={from} /></div>
      </div>
      <div className="space-y-1.5 rounded-2xl bg-black/20 p-3 font-mono text-[10px]">
        <div className="flex justify-between"><span className="text-ink-500">rate</span><span className="tnum text-ink-200">1 {f.s} = {(f.p / t.p).toFixed(6)} {t.s}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">fee (0.3%)</span><span className="tnum text-ink-200">{fee.toFixed(2)} {f.s}</span></div>
        <div className="flex items-center justify-between">
          <span className="text-ink-500">slippage</span>
          <span className="flex gap-1">
            {[0.1, 0.5, 1].map((s) => (
              <button key={s} type="button" onClick={() => setSlip(s)} className={cn("rounded px-1.5 py-0.5 font-black", slip === s ? "bg-white/10 text-white" : "text-ink-500")}>{s}%</button>
            ))}
          </span>
        </div>
        <div className="flex justify-between"><span className="text-ink-500">min. received</span><span className="tnum text-bull">{minOut.toFixed(6)} {t.s}</span></div>
      </div>
      <GameButton onClick={doSwap}>Swap{flip ? " " : " "}{f.s} → {t.s}</GameButton>
      {hist.length > 0 && (
        <div className="space-y-1">
          {hist.map((h, i) => (
            <motion.div key={h.v + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1 - i * 0.2, x: 0 }} className="flex justify-between rounded-lg bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px]">
              <span className="text-ink-200">{h.t}</span><span className="text-ink-500">{h.v}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- yield calculator ---------------- */
function YieldCalc() {
  const [principal, setPrincipal] = useState(10000);
  const [apy, setApy] = useState(12);
  const [years, setYears] = useState(3);
  const [compound, setCompound] = useState<"daily" | "weekly" | "monthly">("daily");
  const freq = compound === "daily" ? 365 : compound === "weekly" ? 52 : 12;
  const curve = useMemo(() => {
    const pts: number[] = [];
    for (let m = 0; m <= years * 12; m++) {
      const t = m / 12;
      pts.push(principal * Math.pow(1 + apy / 100 / freq, freq * t));
    }
    return pts;
  }, [principal, apy, years, freq]);
  const end = curve[curve.length - 1];
  const gain = end - principal;
  const max = Math.max(...curve);
  const min = Math.min(...curve);
  const d = curve.map((v, i) => `${(i / (curve.length - 1)) * 280},${120 - ((v - min) / (max - min || 1)) * 104 - 8}`).join(" ");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl border-2 border-bull/40 bg-bull/5 p-2.5">
          <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">future value</div>
          <Pop value={end.toLocaleString("en-US", { maximumFractionDigits: 0 })} prefix="$" className="tnum font-mono text-[19px] font-black text-bull" />
        </div>
        <div className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5">
          <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">interest earned</div>
          <Pop value={gain.toLocaleString("en-US", { maximumFractionDigits: 0 })} prefix="+$" className="tnum font-mono text-[19px] font-black text-white" />
        </div>
      </div>
      <svg viewBox="0 0 280 120" className="h-[130px] w-full rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c]">
        <defs>
          <linearGradient id="yc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2be08a" stopOpacity=".4" />
            <stop offset="1" stopColor="#2be08a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,120 ${d} 280,120`} fill="url(#yc)" />
        <motion.polyline points={d} fill="none" stroke="#2be08a" strokeWidth="2.5" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
        <circle cx="280" cy={120 - ((end - min) / (max - min || 1)) * 104 - 8} r="4" fill="#2be08a">
          <animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
      {[
        { l: "Principal", v: principal, set: setPrincipal, min: 100, max: 100000, f: (v: number) => `$${v.toLocaleString()}` },
        { l: "APY", v: apy, set: setApy, min: 1, max: 80, f: (v: number) => `${v}%` },
        { l: "Years", v: years, set: setYears, min: 1, max: 10, f: (v: number) => `${v}y` },
      ].map((s) => (
        <div key={s.l}>
          <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider"><span className="text-ink-400">{s.l}</span><span className="tnum font-bold text-white">{s.f(s.v)}</span></div>
          <input type="range" min={s.min} max={s.max} value={s.v} onChange={(e) => s.set(+e.target.value)} className="w-full" />
        </div>
      ))}
      <div className="flex gap-1 rounded-xl bg-[#070d1c] p-1">
        {(["daily", "weekly", "monthly"] as const).map((c) => (
          <button key={c} type="button" onClick={() => { setCompound(c); sfx("select"); }} className={cn("flex-1 rounded-lg py-1.5 font-mono text-[9px] font-black uppercase tracking-wider", compound === c ? "text-[#02150b]" : "text-ink-500")} style={compound === c ? { background: "#2be08a" } : undefined}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- nft gallery ---------------- */
const NFTS: { a: ArtKey; n: string; c: string; floor: number; chg: number }[] = [
  { a: "whale", n: "Genesis Whale #001", c: "#9b6bff", floor: 4.2, chg: 12.4 },
  { a: "crown", n: "Bull Crown", c: "#ffc24b", floor: 2.8, chg: -3.1 },
  { a: "rocket", n: "Moon Ticket", c: "#38e1ff", floor: 1.4, chg: 8.8 },
  { a: "shield", n: "Aegis Prime", c: "#2be08a", floor: 0.9, chg: 2.2 },
  { a: "potion", n: "Alpha Flask", c: "#ff4d6a", floor: 0.6, chg: -8.4 },
  { a: "key", n: "Vault Key", c: "#ffc24b", floor: 3.1, chg: 5.5 },
];

function NftGallery() {
  const [owned, setOwned] = useState<string[]>(["Aegis Prime"]);
  const [bal, setBal] = useState(5.0);
  const buy = (n: string, floor: number) => {
    if (owned.includes(n)) return;
    if (bal < floor) {
      sfx("wrong");
      return;
    }
    setBal((b) => b - floor);
    setOwned((o) => [...o, n]);
    sfx("unlock");
  };
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <HudPill><GemArt size={18} /><Pop value={bal.toFixed(2)} className="text-aqua" /></HudPill>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink-500">{owned.length}/{NFTS.length} collected</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {NFTS.map((n) => {
          const A = ART[n.a];
          const has = owned.includes(n.n);
          return (
            <motion.button key={n.n} type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.94 }} onClick={() => buy(n.n, n.floor)} className="relative overflow-hidden rounded-2xl border-2 p-2 text-center" style={{ borderColor: has ? n.c : "#1c2c52", background: `linear-gradient(170deg, ${n.c}22, #0d1528 70%)`, boxShadow: has ? `0 0 20px -8px ${n.c}, 0 3px 0 #070d1c` : "0 3px 0 #070d1c" }}>
              <A size={56} className="mx-auto" />
              <div className="mt-1 truncate text-[10.5px] font-extrabold text-white">{n.n}</div>
              <div className="tnum font-mono text-[10px] font-black" style={{ color: n.c }}>◈ {n.floor}</div>
              <div className={cn("tnum font-mono text-[9px] font-black", n.chg >= 0 ? "text-bull" : "text-bear")}>{n.chg >= 0 ? "+" : ""}{n.chg}%</div>
              {has && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-bull text-[#02150b]"><Icon name="check" size={11} strokeWidth={4} /></span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- tx history ---------------- */
const TXS = [
  { k: "swap", t: "Swap 1,000 USDT → BTC", v: "-$1,000", c: "#38e1ff", i: "swap" as const },
  { k: "stake", t: "Stake 500 into ETH pool", v: "+12.7% APY", c: "#9b6bff", i: "coin" as const },
  { k: "claim", t: "Harvest yield", v: "+$4.21", c: "#2be08a", i: "check" as const },
  { k: "nft", t: "Bought Aegis Prime", v: "-0.9 ETH", c: "#ffc24b", i: "gem" as const },
  { k: "warn", t: "High slippage warning", v: "1.2%", c: "#ff4d6a", i: "alert" as const },
];

function TxHistory() {
  const [filter, setFilter] = useState<string | null>(null);
  const rows = filter ? TXS.filter((t) => t.k === filter) : TXS;
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[null, "swap", "stake", "claim", "nft"].map((f) => (
          <button key={String(f)} type="button" onClick={() => setFilter(f)} className={cn("rounded-lg px-2 py-1 font-mono text-[8.5px] font-black uppercase", filter === f ? "bg-white/10 text-white" : "text-ink-500")}>{f ?? "all"}</button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {rows.map((t) => (
          <motion.div key={t.t} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2.5 rounded-xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${t.c}1e`, color: t.c }}><Icon name={t.i} size={16} strokeWidth={2.4} /></span>
            <span className="flex-1 truncate text-[11.5px] font-bold text-ink-200">{t.t}</span>
            <span className="tnum font-mono text-[10.5px] font-black" style={{ color: t.c }}>{t.v}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- risk meter ---------------- */
function RiskMeter() {
  const [alloc, setAlloc] = useState({ stable: 40, blue: 35, degen: 25 });
  const score = Math.round(alloc.stable * 0.1 + alloc.blue * 0.5 + alloc.degen * 1.4);
  const label = score < 30 ? ["Conservative", "#2be08a"] : score < 60 ? ["Balanced", "#ffc24b"] : score < 90 ? ["Aggressive", "#ff8a3d"] : ["Degen", "#ff4d6a"];
  const set = (k: keyof typeof alloc, v: number) => {
    const rest = 100 - v;
    const others = (Object.keys(alloc) as (keyof typeof alloc)[]).filter((x) => x !== k);
    const o0 = alloc[others[0]];
    const o1 = alloc[others[1]];
    const sum = o0 + o1 || 1;
    setAlloc({ ...alloc, [k]: v, [others[0]]: Math.round((o0 / sum) * rest), [others[1]]: rest - Math.round((o0 / sum) * rest) });
  };
  return (
    <div className="space-y-3">
      <div className="text-center">
        <motion.div key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="tnum font-mono text-[44px] font-black leading-none" style={{ color: label[1] }}>{score}</motion.div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: label[1] }}>{label[0]} portfolio</div>
      </div>
      <svg viewBox="0 0 200 110" className="mx-auto w-full max-w-[230px]">
        <defs>
          <linearGradient id="rk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2be08a" /><stop offset="0.5" stopColor="#ffc24b" /><stop offset="1" stopColor="#ff4d6a" />
          </linearGradient>
        </defs>
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="rgba(120,160,240,.12)" strokeWidth="14" strokeLinecap="round" />
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="url(#rk)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(score / 140) * 258} 400`} style={{ transition: "stroke-dasharray .5s" }} />
      </svg>
      {([["stable", "Stables", "#2be08a"], ["blue", "Blue chips", "#38e1ff"], ["degen", "Degen plays", "#ff4d6a"]] as const).map(([k, l, c]) => (
        <div key={k}>
          <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider"><span style={{ color: c }}>{l}</span><span className="tnum font-bold text-white">{alloc[k]}%</span></div>
          <input type="range" min={0} max={100} value={alloc[k]} onChange={(e) => set(k, +e.target.value)} className="w-full" />
        </div>
      ))}
    </div>
  );
}

export default function Economy() {
  return (
    <Section id="economy" index="" title="DeFi Economy Sim" kicker="Paper-money playground · real mechanics" count="6 systems">
      <Grid>
        <Cell title="Staking Pools" spec="live yield accrual" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Staking />
        </Cell>
        <Cell title="Swap Simulator" spec="fees · slippage" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Swap />
        </Cell>
        <Cell title="Compound Calculator" spec="curve + freq" span="col-span-2 md:col-span-2 lg:col-span-2">
          <YieldCalc />
        </Cell>
        <Cell title="NFT Collection" spec="buy · floor" span="col-span-2 md:col-span-2 lg:col-span-2">
          <NftGallery />
        </Cell>
        <Cell title="Risk Profiler" spec="auto-rebalance" span="col-span-2 md:col-span-2 lg:col-span-2">
          <RiskMeter />
        </Cell>
        <Cell title="Transaction History" spec="filterable" span="col-span-2 md:col-span-2 lg:col-span-2">
          <TxHistory />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">learn by doing</Tag>
        <Tag tone="gold">real formulas</Tag>
        <Tag tone="bear">risk-first copy</Tag>
        <Tag>paper money only</Tag>
      </div>
    </Section>
  );
}
