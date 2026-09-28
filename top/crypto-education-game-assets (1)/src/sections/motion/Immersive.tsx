import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Label } from "../../components/ui";
import { BullIcon, CoinIcon, FlameIcon, Icon } from "../../components/icons";
import { sfx } from "../../lib/sound";
import { clamp, Magnetic, mulberry32, Tilt, useInterval, useRaf } from "../../lib/motion";
import { GlowRing, Marquee, TickNumber } from "../../lib/fx2";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-34 · LIVE EQUITY CURVE — animated area, drawdown shading, playback
 * ===================================================================== */
function EquityCurve() {
  const N = 120;
  const data = useMemo(() => {
    const r = mulberry32(555);
    let v = 10000;
    const out = [v];
    for (let i = 1; i < N; i++) {
      v = v * (1 + (r() - 0.46) * 0.02 + Math.sin(i / 18) * 0.003);
      out.push(v);
    }
    return out;
  }, []);
  const [n, setN] = useState(30);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  useRaf((dt) => {
    setN((x) => (x >= N ? 0 : x + dt * 22 * speed));
  }, playing);
  const W = 560;
  const H = 220;
  const vis = data.slice(0, Math.max(2, Math.floor(n)));
  const min = Math.min(...data) * 0.995;
  const max = Math.max(...data) * 1.005;
  const y = (v: number) => 12 + ((max - v) / (max - min)) * (H - 24);
  const x = (i: number) => (i / (N - 1)) * W;
  const line = vis.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("");
  // running peak + drawdown area
  let peak = data[0];
  const dd: { i: number; v: number; p: number }[] = [];
  vis.forEach((v, i) => {
    peak = Math.max(peak, v);
    if ((peak - v) / peak > 0.008) dd.push({ i, v, p: peak });
  });
  const cur = vis[vis.length - 1];
  const ret = ((cur - data[0]) / data[0]) * 100;
  const hi = hover !== null ? vis[clamp(hover, 0, vis.length - 1)] : cur;
  return (
    <Asset title="Live Equity Curve" code="M-34" tags="equity curve drawdown playback animated area portfolio performance" span={7}>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Paper portfolio</div>
          <div className={cn("font-mono text-2xl font-bold", ret >= 0 ? "text-bull" : "text-bear")}>
            $<TickNumber value={cur} />
          </div>
        </div>
        <Chip tone={ret >= 0 ? "bull" : "bear"}>
          {ret >= 0 ? "▲" : "▼"} {Math.abs(ret).toFixed(2)}%
        </Chip>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="ghost" size="iconSm" onClick={() => setPlaying((p) => !p)}>
            <Icon name={playing ? "x" : "play"} size={14} stroke={3} />
          </Btn>
          {[0.5, 1, 3].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={cn("rounded-lg px-2 py-1 font-mono text-[11px] font-bold", speed === s ? "bg-azure text-white" : "text-ink-400 hover:text-white")}>
              {s}×
            </button>
          ))}
          <Btn variant="ghost" size="sm" onClick={() => setN(0)}>
            Replay
          </Btn>
        </div>
      </div>
      <div
        className="panel-inset relative mt-3 overflow-hidden rounded-2xl"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.floor(((e.clientX - r.left) / r.width) * (N - 1)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          <defs>
            <linearGradient id="eqArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ret >= 0 ? "#22d39a" : "#ff4d6d"} stopOpacity=".4" />
              <stop offset="1" stopColor={ret >= 0 ? "#22d39a" : "#ff4d6d"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#16295a" strokeDasharray="3 5" />
          ))}
          {dd.map((d, k) => (
            <rect key={k} x={x(d.i)} y={y(d.p)} width={W / N + 1} height={y(d.v) - y(d.p)} fill="#ff4d6d" opacity=".28" />
          ))}
          <line x1="0" x2={W} y1={y(data[0])} y2={y(data[0])} stroke="#8ea4d2" strokeDasharray="5 4" strokeOpacity=".5" />
          <path d={`${line}L${x(vis.length - 1)},${H}L0,${H}Z`} fill="url(#eqArea)" />
          <path d={line} fill="none" stroke={ret >= 0 ? "#22d39a" : "#ff4d6d"} strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx={x(vis.length - 1)} cy={y(cur)} r="5" fill="#fff" className="anim-glow" />
          {hover !== null && hover < vis.length && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#8ea4d2" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(vis[hover])} r="4" fill="#2fd4ff" />
            </g>
          )}
        </svg>
        {hover !== null && hover < vis.length && (
          <div className="pointer-events-none absolute rounded-xl bg-ink-950/90 px-2.5 py-1.5 font-mono text-[11px] font-bold text-white ring-1 ring-white/10" style={{ left: clamp((hover / (N - 1)) * 100, 4, 82) + "%", top: 8 }}>
            ${Math.round(hi).toLocaleString()}
            <span className={hi >= data[0] ? "text-bull" : "text-bear"}>
              {" "}
              {(((hi - data[0]) / data[0]) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <input type="range" min={2} max={N} value={Math.floor(n)} onChange={(e) => { setN(+e.target.value); setPlaying(false); }} className="mt-3 w-full" style={{ accentColor: "#22d39a" }} />
      <div className="mt-1 flex justify-between text-[10px] font-bold text-ink-500">
        <span>Day 1</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-bear/60" /> drawdown &gt; 0.8%
        </span>
        <span>Day {N}</span>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-35 · SPOTLIGHT CARDS — cursor-tracked glow border
 * ===================================================================== */
const SPOTS = [
  { t: "Notes", d: "Your trading journal entries sync everywhere.", i: "book", c: "#3e8bff" },
  { t: "Alerts", d: "Price, volume and whale triggers in real time.", i: "bell", c: "#ffc23d" },
  { t: "Backtests", d: "Replay any strategy on 5 years of candles.", i: "refresh", c: "#22d39a" },
  { t: "Community", d: "Share ideas, copy top learners' paper trades.", i: "users", c: "#9170ff" },
];
function SpotCard({ s }: { s: (typeof SPOTS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty("--sx", `${e.clientX - r.left}px`);
        ref.current?.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      className="group/sc relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850 p-4 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/sc:opacity-100" style={{ background: `radial-gradient(220px circle at var(--sx, 50%) var(--sy, 50%), ${s.c}44, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/sc:opacity-100" style={{ border: "1px solid transparent", background: `radial-gradient(180px circle at var(--sx, 50%) var(--sy, 50%), ${s.c}, transparent 70%) border-box`, mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", WebkitMaskComposite: "xor" }} />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.c}26`, color: s.c }}>
        <Icon name={s.i} size={20} />
      </span>
      <div className="relative mt-3 font-display text-sm font-black text-white">{s.t}</div>
      <div className="relative mt-1 text-xs font-semibold text-ink-400">{s.d}</div>
    </div>
  );
}
function Spotlight() {
  return (
    <Asset title="Spotlight Cards" code="M-35" tags="spotlight cursor glow border hover cards grid" span={5}>
      <div className="grid grid-cols-2 gap-3">
        {SPOTS.map((s) => (
          <SpotCard key={s.t} s={s} />
        ))}
      </div>
      <div className="mt-3 text-[11px] font-bold text-ink-500">Move the cursor across cards — the glow follows</div>
    </Asset>
  );
}

/* =====================================================================
 * M-36 · MAGNETIC PLAYGROUND — buttons chase the cursor
 * ===================================================================== */
function MagneticPlay() {
  const [power, setPower] = useState(0.4);
  const [count, setCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  return (
    <Asset title="Magnetic Buttons" code="M-36" tags="magnetic buttons cursor chase hover playground physics" span={5}>
      <div className="mb-3 flex items-center gap-3">
        <Label className="mb-0">Pull</Label>
        <input type="range" min={0} max={80} value={power * 100} onChange={(e) => setPower(+e.target.value / 100)} className="flex-1" style={{ accentColor: "#9170ff" }} />
        <span className="font-mono text-xs font-bold text-violet">{Math.round(power * 100)}%</span>
      </div>
      <div ref={boxRef} className="relative flex h-[220px] items-center justify-center gap-6 overflow-hidden rounded-2xl bg-ink-950/50">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <Magnetic strength={power}>
          <button onClick={() => { setCount((c) => c + 1); sfx("pop"); }} className="btn3d v-bull h-16 w-16 rounded-full text-xl [--depth:6px]">
            👍
          </button>
        </Magnetic>
        <Magnetic strength={power * 1.4}>
          <button onClick={() => { setCount((c) => c + 5); sfx("coin"); }} className="btn3d v-gold h-20 px-6 rounded-2xl text-sm [--depth:6px]">
            <CoinIcon size={22} /> +5
          </button>
        </Magnetic>
        <Magnetic strength={power * 0.7}>
          <button onClick={() => { setCount(0); sfx("tap"); }} className="btn3d v-ghost h-16 w-16 rounded-full [--depth:6px]">
            <Icon name="refresh" size={20} />
          </button>
        </Magnetic>
        <div className="absolute bottom-3 font-mono text-xs font-bold text-ink-300">
          clicks: <span className="text-gold">{count}</span>
        </div>
      </div>
      <div className="mt-2 text-[11px] font-bold text-ink-500">Gold button is extra magnetic · try to catch it at 80%</div>
    </Asset>
  );
}

/* =====================================================================
 * M-37 · PAGE TRANSITIONS — tabbed screens slide with direction
 * ===================================================================== */
const SCREENS = [
  { id: "home", i: "home", t: "Home", c: "#3e8bff", body: "Your daily path, streak and next lesson." },
  { id: "trade", i: "chart", t: "Trade", c: "#22d39a", body: "Live-feeling charts with paper money." },
  { id: "league", i: "trophy", t: "League", c: "#ffc23d", body: "Diamond league · you are #3 this week." },
  { id: "me", i: "user", t: "Profile", c: "#9170ff", body: "Level 12 · 47-day streak · 12 badges." },
];
function PageTransitions() {
  const [tab, setTab] = useState(0);
  const [dir, setDir] = useState(1);
  const [anim, setAnim] = useState(0);
  const go = (i: number) => {
    if (i === tab) return;
    setDir(i > tab ? 1 : -1);
    setTab(i);
    setAnim((a) => a + 1);
    sfx("swipe");
  };
  const S = SCREENS[tab];
  return (
    <Asset title="Page Transitions" code="M-37" tags="page transition slide tab navigation direction mobile screen" span={7}>
      <div className="mx-auto max-w-sm overflow-hidden rounded-3xl bg-ink-950/60 ring-1 ring-white/10">
        <div className="relative h-[240px] overflow-hidden">
          <div key={`${tab}-${anim}`} className="absolute inset-0 p-5" style={{ animation: dir > 0 ? "slide-in-right .45s cubic-bezier(.2,.9,.3,1) both" : "slide-in-left .45s cubic-bezier(.2,.9,.3,1) both" }}>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: S.c }}>
                <Icon name={S.i} size={24} />
              </span>
              <div className="font-display text-xl font-black text-white">{S.t}</div>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-300">{S.body}</p>
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((k) => (
                <div key={k} className="h-16 flex-1 rounded-2xl" style={{ background: `${S.c}${k === 0 ? "44" : "22"}`, animation: `slide-up .5s ${0.1 + k * 0.08}s both` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex border-t border-white/5 p-2">
          {SCREENS.map((s, i) => (
            <button key={s.id} onClick={() => go(i)} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-all", i === tab ? "text-white" : "text-ink-500 hover:text-ink-300")} style={i === tab ? { background: `${s.c}26` } : undefined}>
              <Icon name={s.i} size={20} stroke={i === tab ? 2.8 : 2.2} style={i === tab ? { color: s.c } : undefined} />
              <span className="text-[10px] font-black uppercase">{s.t}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-500">Swipe direction follows tab order</div>
    </Asset>
  );
}

/* =====================================================================
 * M-38 · SKELETON MORPH — shimmer resolves into real content
 * ===================================================================== */
function SkeletonMorph() {
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("ready"), 2200);
    return () => clearTimeout(t);
  }, [state, key]);
  const rows = [
    { c: "#f7931a", s: "BTC", p: "$64,250", ch: "+4.2%" },
    { c: "#627eea", s: "ETH", p: "$3,420", ch: "+2.1%" },
    { c: "#14f195", s: "SOL", p: "$148.20", ch: "+9.4%" },
  ];
  return (
    <Asset title="Skeleton Morph" code="M-38" tags="skeleton loading shimmer morph resolve content placeholder" span={5}>
      <div className="mb-3 flex items-center justify-between">
        <Chip tone={state === "loading" ? "azure" : "bull"}>{state === "loading" ? "Loading…" : "Live"}</Chip>
        <Btn variant="ghost" size="sm" onClick={() => { setState("loading"); setKey((k) => k + 1); }}>
          Replay
        </Btn>
      </div>
      <div key={key} className="space-y-2.5">
        {rows.map((r, i) =>
          state === "loading" ? (
            <div key={r.s} className="flex items-center gap-3 rounded-2xl bg-ink-850/60 p-3">
              <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-2/3 rounded-full" />
                <div className="skeleton h-2.5 w-1/3 rounded-full" />
              </div>
              <div className="skeleton h-7 w-16 rounded-lg" />
            </div>
          ) : (
            <div key={r.s} className="anim-slide-up flex items-center gap-3 rounded-2xl bg-ink-850 p-3 ring-1 ring-white/5" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-[10px] font-black text-white" style={{ background: r.c }}>
                {r.s.slice(0, 3)}
              </span>
              <div className="flex-1">
                <div className="text-sm font-extrabold text-white">{r.s}/USDT</div>
                <div className="font-mono text-[11px] text-ink-400">{r.p}</div>
              </div>
              <span className="rounded-lg bg-bull/15 px-2 py-1 font-mono text-xs font-bold text-bull">{r.ch}</span>
            </div>
          ),
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-39 · LIVE TAPE — infinite trade feed with flash + filters
 * ===================================================================== */
type Fill = { id: number; side: 1 | -1; p: number; s: number; t: number };
function LiveTape() {
  const [fills, setFills] = useState<Fill[]>([]);
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "whale">("all");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const id = useRef(0);
  const price = useRef(64250);
  useInterval(
    () => {
      price.current *= 1 + (Math.random() - 0.5) * 0.0009;
      const whale = Math.random() < 0.06;
      const f: Fill = {
        id: ++id.current,
        side: Math.random() > 0.48 ? 1 : -1,
        p: price.current,
        s: whale ? 8 + Math.random() * 30 : 0.001 + Math.random() * Math.random() * 1.5,
        t: Date.now(),
      };
      setFills((l) => [f, ...l].slice(0, 30));
    },
    paused ? null : 420 / speed,
  );
  const shown = fills.filter((f) => (filter === "all" ? true : filter === "whale" ? f.s > 5 : filter === "buy" ? f.side > 0 : f.side < 0));
  return (
    <Asset title="Live Trade Tape" code="M-39" tags="tape time sales live feed trades flash filter speed" span={7}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["all", "buy", "sell", "whale"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-black uppercase transition", filter === f ? "bg-azure text-white" : "text-ink-400 hover:text-white")}>
            {f === "whale" ? "🐋 Whale" : f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {[1, 2, 4].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={cn("rounded px-1.5 font-mono text-[11px] font-bold", speed === s ? "bg-white/15 text-white" : "text-ink-500")}>
              {s}×
            </button>
          ))}
          <Btn variant="ghost" size="sm" onClick={() => setPaused((p) => !p)}>
            {paused ? "▶" : "❚❚"}
          </Btn>
        </div>
      </div>
      <div className="panel-inset h-[290px] overflow-hidden rounded-2xl p-2">
        {shown.map((f, i) => (
          <div
            key={f.id}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-[5px] font-mono text-xs", i === 0 && "anim-slide-down", f.s > 5 && "bg-violet/15 ring-1 ring-violet/40")}
            style={{ opacity: 1 - i * 0.035 }}
          >
            <span className={cn("font-black", f.side > 0 ? "text-bull" : "text-bear")}>{f.side > 0 ? "BUY" : "SELL"}</span>
            <span className="flex-1 text-ink-200">${f.p.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            <span className={cn("font-bold", f.s > 5 ? "text-violet" : "text-ink-300")}>
              {f.s > 5 ? `🐋 ${f.s.toFixed(1)}` : f.s.toFixed(3)}
            </span>
            <span className="text-[10px] text-ink-500">{new Date(f.t).toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        ))}
        {!shown.length && <div className="flex h-full items-center justify-center text-xs font-bold text-ink-500">Waiting for {filter} prints…</div>}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-40 · STAT DASHBOARD — animated counters + mini bars + range
 * ===================================================================== */
function StatDash() {
  const [range, setRange] = useState<"7D" | "30D" | "1Y">("30D");
  const mult = { "7D": 0.22, "30D": 1, "1Y": 9.4 }[range];
  const stats = [
    { l: "Volume traded", v: 284000 * mult, f: (x: number) => `$${(x / 1000).toFixed(0)}k`, c: "#3e8bff", bars: [40, 65, 45, 80, 60, 95, 70] },
    { l: "Lessons done", v: 34 * mult, f: (x: number) => `${Math.round(x)}`, c: "#22d39a", bars: [30, 50, 70, 55, 85, 75, 100] },
    { l: "Win rate", v: 58, f: (x: number) => `${x.toFixed(0)}%`, c: "#ffc23d", bars: [50, 55, 48, 62, 58, 64, 60] },
    { l: "Best streak", v: 47, f: (x: number) => `${Math.round(x)}d`, c: "#ff7a2f", bars: [20, 35, 30, 50, 45, 70, 90] },
  ];
  return (
    <Asset title="Stat Dashboard" code="M-40" tags="stats dashboard counters animated bars range kpi metrics" span={5}>
      <div className="mb-4 flex gap-2">
        {(["7D", "30D", "1Y"] as const).map((r) => (
          <button key={r} onClick={() => { setRange(r); sfx("select"); }} className={cn("rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition", range === r ? "bg-azure text-white shadow-[0_3px_0_#1c55c2]" : "text-ink-400 hover:text-white")}>
            {r}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-ink-500">
          <FlameIcon size={14} /> live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl bg-ink-850 p-3 ring-1 ring-white/5">
            <div className="text-[10px] font-black uppercase tracking-wider text-ink-500">{s.l}</div>
            <div className="mt-1 font-display text-xl font-black" style={{ color: s.c }}>
              {s.f(s.v)}
            </div>
            <div className="mt-2 flex h-8 items-end gap-1">
              {s.bars.map((b, k) => (
                <div
                  key={`${range}-${k}`}
                  className="flex-1 origin-bottom rounded-sm"
                  style={{ height: `${(b / 100) * (range === "7D" ? 70 : range === "1Y" ? 100 : 88)}%`, background: `${s.c}${k === s.bars.length - 1 ? "" : "88"}`, animation: `bar-grow .5s ${k * 0.05}s both cubic-bezier(.3,1.3,.5,1)` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-950/50 p-3">
        <BullIcon size={34} className="anim-float" />
        <div className="text-xs font-bold text-ink-300">
          You're in the <b className="text-gold">top 8%</b> of learners this {range === "7D" ? "week" : range === "30D" ? "month" : "year"}.
        </div>
        <GlowRing pct={0.92} size={56} stroke={7} colors={["#ffc23d", "#ff7a2f"]}>
          <span className="font-display text-[11px] font-black text-white">92</span>
        </GlowRing>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-41 · HEADLINE TICKER MARQUEE — pause, speed, direction
 * ===================================================================== */
function Headlines() {
  const items = ["BTC reclaims $65k", "ETH ETF record inflows", "SOL breaks resistance", "Fed holds rates", "Whale buys 2,000 BTC", "Fear & Greed: 74 Greed"];
  return (
    <Asset title="Headline Marquee" code="M-41" tags="marquee headlines ticker infinite loop pause hover news" span={12} bodyClass="px-0 py-4">
      <Marquee speed={26}>
        {items.map((t, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 rounded-2xl bg-ink-850 px-4 py-2.5 text-sm font-extrabold text-white ring-1 ring-white/5">
            <span className={cn("h-2 w-2 rounded-full", i % 3 === 0 ? "bg-bull" : i % 3 === 1 ? "bg-gold" : "bg-azure")} />
            {t}
          </span>
        ))}
      </Marquee>
      <div className="mt-2 px-5 text-[11px] font-bold text-ink-500">Hover to pause · seamless loop · duplicated track</div>
    </Asset>
  );
}

/* =====================================================================
 * M-42 · TILT SHOWCASE — compare tilt intensities
 * ===================================================================== */
function TiltShow() {
  const [max, setMax] = useState(14);
  return (
    <Asset title="Tilt Lab" code="M-42" tags="tilt 3d perspective glare intensity playground card" span={6}>
      <div className="mb-4 flex items-center gap-3">
        <Label className="mb-0">Tilt max</Label>
        <input type="range" min={0} max={30} value={max} onChange={(e) => setMax(+e.target.value)} className="flex-1" style={{ accentColor: "#2fd4ff" }} />
        <span className="font-mono text-xs font-bold text-cyan">{max}°</span>
      </div>
      <div className="flex justify-center py-2">
        <Tilt max={max} scale={1.04} className="w-[240px] rounded-3xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-azure to-azure-dark p-5 shadow-[0_8px_0_#123a8a]">
            <CoinIcon size={56} />
            <div className="mt-3 font-display text-xl font-black text-white">Golden BTC</div>
            <div className="text-xs font-bold text-white/80">Hovers, tilts & glares under your cursor</div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-black text-white">HOLO</span>
              <span className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-black text-white">S3</span>
            </div>
          </div>
        </Tilt>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-43 · SCROLL PROGRESS CHAPTERS — reading progress with sections
 * ===================================================================== */
const CHAPTERS = [
  { t: "What moves price?", b: "Supply, demand and the order book in plain words." },
  { t: "Reading momentum", b: "RSI, MACD and volume tell you who's winning." },
  { t: "Managing risk", b: "Size small, stop always, survive everything." },
  { t: "Your first plan", b: "Entry, stop, target — written before you click." },
];
function Chapters() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setP(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight));
  };
  const active = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
  return (
    <Asset title="Reading Progress" code="M-43" tags="reading progress scroll chapters article lesson progress bar" span={6}>
      <div className="mb-3 flex gap-1.5">
        {CHAPTERS.map((c, i) => (
          <div key={c.t} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-bull to-cyan transition-all duration-200"
              style={{ width: `${clamp((p * CHAPTERS.length - i) * 100, 0, 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div ref={ref} onScroll={onScroll} className="h-[260px] overflow-y-auto rounded-2xl bg-ink-950/40 p-4">
        {CHAPTERS.map((c, i) => (
          <div key={c.t} className={cn("mb-5 rounded-2xl p-4 transition-all", i === active ? "bg-ink-800 ring-1 ring-cyan/40" : "opacity-60")}>
            <div className="flex items-center gap-2">
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs font-black", i < active ? "bg-bull text-ink-950" : i === active ? "bg-cyan text-ink-950" : "bg-ink-700 text-ink-400")}>
                {i < active ? "✓" : i + 1}
              </span>
              <span className="font-display text-sm font-black text-white">{c.t}</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-300">{c.b} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-ink-500">
        <span>
          Chapter {active + 1}/{CHAPTERS.length}
        </span>
        <span>{Math.round(p * 100)}% read</span>
      </div>
    </Asset>
  );
}

export function useImmersiveDemo() {
  const [n, setN] = useState(0);
  useInterval(() => setN((x) => x + 1), 1000);
  return n;
}

export { EquityCurve, Spotlight, MagneticPlay, PageTransitions, SkeletonMorph, LiveTape, StatDash, Headlines, TiltShow, Chapters };
