import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AssetCard, Btn, Icon, Label, Phone, Section, useCountUp, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp } from "../ui/hooks";
import { feel } from "../game/sfx";
import { cn } from "../utils/cn";

/* ═════════ TRN-01 · Shared element (grid → detail) ═════════ */
const COINS = [
  { s: "BTC", n: "Bitcoin", p: "64,250", c: "#f7931a", ch: 2.4 }, { s: "ETH", n: "Ethereum", p: "3,412", c: "#8c8cff", ch: -1.1 },
  { s: "SOL", n: "Solana", p: "148.2", c: "#14f195", ch: 6.8 }, { s: "TON", n: "Toncoin", p: "6.84", c: "#0098ea", ch: 0.4 },
];
function SharedElement() {
  const [open, setOpen] = useState<number | null>(null);
  const c = open !== null ? COINS[open] : null;
  return (
    <AssetCard id="TRN-01" title="Shared Element Transition" desc="Тап по монете в сетке — её плитка «разворачивается» в полноэкранную деталь (общий элемент растёт, цвет и позиция интерполируются). Назад — сворачивается." tags={["transition", "shared-element", "hero", "detail"]} stageClass="p-2">
      <Phone h={480}>
        <div className="absolute inset-0 p-4 pt-10">
          <div className="text-lg font-extrabold text-white">Markets</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {COINS.map((coin, i) => (
              <button key={coin.s} onClick={() => { setOpen(i); feel("pop"); }} className="flex flex-col items-start gap-2 rounded-2xl p-3 text-left transition-transform active:scale-95" style={{ background: `linear-gradient(160deg, ${coin.c}, ${coin.c}66)`, boxShadow: "0 4px 0 rgba(0,0,0,.35)", opacity: open === i ? 0 : 1 }}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xs font-extrabold text-white">{coin.s[0]}</span>
                <div><div className="text-sm font-extrabold text-white">{coin.s}</div><div className="font-mono text-[11px] font-bold text-white/80">${coin.p}</div></div>
              </button>
            ))}
          </div>
        </div>
        {c && (
          <div className="absolute inset-0 z-10 flex flex-col p-4 pt-10" style={{ animation: "sharedGrow .45s cubic-bezier(.3,1.1,.4,1) both", background: `linear-gradient(180deg, ${c.c}, #0a1330 55%)` }}>
            <button onClick={() => { setOpen(null); feel("tap"); }} className="mb-3 flex items-center gap-1 text-xs font-extrabold text-white/90"><Icon name="chevL" size={16} stroke={3} />Markets</button>
            <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-white/25 text-xl font-extrabold text-white">{c.s[0]}</span><div><div className="text-2xl font-extrabold text-white">{c.n}</div><div className="font-mono text-sm font-bold text-white/80">{c.s}/USDT</div></div></div>
            <div className="mt-4 font-mono text-4xl font-extrabold text-white text-3d">${c.p}</div>
            <div className={cn("font-mono text-sm font-extrabold", c.ch >= 0 ? "text-white" : "text-white/70")}>{c.ch >= 0 ? "▲" : "▼"} {Math.abs(c.ch)}%</div>
            <svg viewBox="0 0 260 80" className="mt-4 w-full" style={{ animation: "fadeUp .5s ease .2s both" }}><path d="M0 60 L40 50 L70 55 L110 30 L150 40 L190 18 L230 26 L260 10" fill="none" stroke="#fff" strokeWidth="2.5" opacity=".9" /></svg>
            <div className="mt-auto grid grid-cols-2 gap-2" style={{ animation: "fadeUp .5s ease .3s both" }}><Btn v="bull" size="sm">Buy</Btn><Btn v="ghost" size="sm">Watch</Btn></div>
          </div>
        )}
      </Phone>
    </AssetCard>
  );
}

/* ═════════ TRN-02 · Morphing FAB ═════════ */
const FAB_ACTIONS = [{ i: "trendUp", t: "Buy", c: "#2ee59d" }, { i: "trendDown", t: "Sell", c: "#ff4d6a" }, { i: "bell", t: "Alert", c: "#3d8bff" }, { i: "swap", t: "Swap", c: "#a174ff" }];
function MorphFab() {
  const [open, setOpen] = useState(false);
  return (
    <AssetCard id="TRN-02" title="Morphing FAB Menu" desc="Плавающая кнопка раскрывается в веер действий: иконка морфит + / ×, подписи выезжают по очереди, фон затемняется. Классический speed-dial." tags={["transition", "fab", "morph", "menu"]}>
      <div className="relative grid h-64 place-items-end overflow-hidden rounded-2xl bg-ink-950/60 p-4">
        <div className="absolute inset-0 bg-ink-950 transition-opacity duration-300" style={{ opacity: open ? 0.5 : 0, pointerEvents: open ? "auto" : "none" }} onClick={() => setOpen(false)} />
        <div className="absolute bottom-4 right-4 flex flex-col-reverse items-end gap-3">
          {FAB_ACTIONS.map((a, i) => (
            <div key={a.t} className="flex items-center gap-2" style={{ transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(.3)", opacity: open ? 1 : 0, transition: `all .3s cubic-bezier(.3,1.5,.5,1) ${open ? i * 55 : (FAB_ACTIONS.length - i) * 30}ms`, pointerEvents: open ? "auto" : "none" }}>
              <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-ink-900 shadow-[0_2px_0_#c3cdea]">{a.t}</span>
              <button onClick={() => { feel("pop"); setOpen(false); }} className="grid h-11 w-11 place-items-center rounded-full shadow-[0_4px_0_rgba(0,0,0,.35)]" style={{ background: a.c }}><Icon name={a.i} size={20} stroke={2.6} className="text-ink-900" /></button>
            </div>
          ))}
          <button onClick={() => { setOpen(!open); feel("tap", 8); }} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-gold to-gold-edge shadow-[0_5px_0_#8a5c00] transition-transform" style={{ transform: open ? "rotate(135deg)" : "rotate(0)" }}>
            <Icon name="plus" size={30} stroke={3} className="text-ink-900" />
          </button>
        </div>
        {!open && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center text-xs font-bold text-ink-500">Тапни + внизу справа</div></div>}
      </div>
    </AssetCard>
  );
}

/* ═════════ TRN-03 · Navigation stack (push / pop) ═════════ */
const SCREENS = [
  { t: "Portfolio", i: "wallet", c: "#2ee59d" }, { t: "Bitcoin", i: "coin", c: "#f7931a" }, { t: "Buy order", i: "trendUp", c: "#3d8bff" }, { t: "Confirm", i: "check", c: "#a174ff" },
];
function NavStack() {
  const [depth, setDepth] = useState(0);
  const push = () => { if (depth < SCREENS.length - 1) { setDepth(depth + 1); feel("whoosh", 6); } };
  const pop = () => { if (depth > 0) { setDepth(depth - 1); feel("tap", 6); } };
  return (
    <AssetCard id="TRN-03" title="Navigation Stack" desc="Стек экранов как в мобильной навигации: push вдвигает новый экран справа, старый уезжает влево с затемнением; pop — обратно. Хлебные крошки сверху." tags={["transition", "navigation", "push-pop", "stack"]} stageClass="p-2">
      <Phone h={440}>
        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-ink-900/90 px-4 pb-3 pt-10 backdrop-blur">
          {depth > 0 && <button onClick={pop} className="text-sky"><Icon name="chevL" size={20} stroke={3} /></button>}
          <div className="flex items-center gap-1 text-[11px] font-bold text-ink-400">{SCREENS.slice(0, depth + 1).map((s, i) => <span key={s.t} className={cn(i === depth && "text-white")}>{i > 0 && <span className="mx-1 text-ink-600">›</span>}{s.t}</span>)}</div>
        </div>
        <div className="absolute inset-0 pt-[70px]">
          {SCREENS.map((s, i) => {
            const rel = i - depth;
            if (rel > 0) return null;
            return (
              <div key={s.t} className="absolute inset-0 flex flex-col p-4" style={{ transform: `translateX(${rel * -30}%)`, filter: `brightness(${1 + rel * 0.4})`, transition: "transform .4s cubic-bezier(.3,1,.4,1), filter .4s", zIndex: 10 + rel, background: `linear-gradient(180deg, ${s.c}22, #0a1330 40%)` }}>
                <span className="grid h-16 w-16 place-items-center rounded-3xl" style={{ background: `${s.c}22`, boxShadow: `inset 0 0 0 2px ${s.c}` }}><Icon name={s.i} size={32} variant="duo" style={{ color: s.c }} /></span>
                <div className="mt-3 text-2xl font-extrabold text-white">{s.t}</div>
                <div className="mt-1 text-xs text-ink-300">Экран {i + 1} из {SCREENS.length}</div>
                <div className="mt-4 space-y-2">{[0, 1, 2].map((r) => <div key={r} className="h-10 rounded-xl bg-ink-800/70" />)}</div>
                {i < SCREENS.length - 1 && <Btn v="bull" size="sm" block className="mt-auto" onClick={push}>{SCREENS[i + 1].t} <Icon name="chevR" size={14} stroke={3} /></Btn>}
                {i === SCREENS.length - 1 && <div className="mt-auto text-center"><Mascot mood="happy" size={56} className="mx-auto" /><Btn v="bull" size="sm" block className="mt-2" onClick={() => setDepth(0)}>Done</Btn></div>}
              </div>
            );
          })}
        </div>
      </Phone>
    </AssetCard>
  );
}

/* ═════════ TRN-04 · Live dashboard numbers ═════════ */
function LiveDashboard() {
  const [vals, setVals] = useState({ pnl: 2840, win: 62, vol: 128, trades: 341 });
  useInterval(() => setVals((v) => ({ pnl: v.pnl + Math.round((Math.random() - 0.4) * 200), win: clamp(v.win + Math.round((Math.random() - 0.5) * 3), 40, 85), vol: v.vol + Math.round((Math.random() - 0.3) * 12), trades: v.trades + (Math.random() > 0.5 ? 1 : 0) })), 1800);
  const pnl = useCountUp(vals.pnl, 900), win = useCountUp(vals.win, 900), vol = useCountUp(vals.vol, 900), tr = useCountUp(vals.trades, 700);
  const cards = [
    { l: "Net P&L", v: `$${Math.round(pnl).toLocaleString()}`, c: vals.pnl >= 0 ? "#2ee59d" : "#ff4d6a", i: "trendUp", up: vals.pnl >= 0 },
    { l: "Win rate", v: `${Math.round(win)}%`, c: "#3d8bff", i: "target", up: true },
    { l: "Volume", v: `$${Math.round(vol)}k`, c: "#ffc53d", i: "chart", up: true },
    { l: "Trades", v: `${Math.round(tr)}`, c: "#a174ff", i: "candle", up: true },
  ];
  return (
    <AssetCard id="TRN-04" title="Live Dashboard Numbers" desc="Метрики обновляются каждые 1.8с с плавным count-up переходом между значениями, вспышкой карточки и мини-спарклайном. Живая приборная панель." tags={["transition", "numbers", "dashboard", "count-up"]}>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.l} className="raised relative overflow-hidden rounded-2xl p-3">
            <div className="absolute right-2 top-2 opacity-20"><Icon name={c.i} size={28} variant="duo" style={{ color: c.c }} /></div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">{c.l}</div>
            <div className="font-mono text-2xl font-extrabold tabular-nums" style={{ color: c.c }}>{c.v}</div>
            <svg viewBox="0 0 80 20" className="mt-1 h-4 w-full"><path d={`M0 ${c.up ? 16 : 6} ${Array.from({ length: 8 }).map((_, i) => `L${i * 11} ${10 + Math.sin(i + vals.trades) * 6}`).join(" ")}`} fill="none" stroke={c.c} strokeWidth="1.5" opacity=".6" /></svg>
          </div>
        ))}
      </div>
    </AssetCard>
  );
}

/* ═════════ TRN-05 · Skeleton → content ═════════ */
function SkeletonLoad() {
  const [loaded, setLoaded] = useState(false);
  const rows = [{ s: "BTC", n: "Bitcoin", p: "64,250", c: "#f7931a" }, { s: "ETH", n: "Ethereum", p: "3,412", c: "#8c8cff" }, { s: "SOL", n: "Solana", p: "148.2", c: "#14f195" }, { s: "TON", n: "Toncoin", p: "6.84", c: "#0098ea" }];
  useEffect(() => { if (!loaded) { const t = setTimeout(() => setLoaded(true), 1600); return () => clearTimeout(t); } }, [loaded]);
  return (
    <AssetCard id="TRN-05" title="Skeleton → Content" desc="Плейсхолдеры с шиммером плавно замещаются реальными строками с каскадом и лёгким подъёмом. Стандарт восприятия скорости загрузки." tags={["transition", "skeleton", "shimmer", "loading"]}>
      <div className="space-y-2">
        {rows.map((r, i) => loaded ? (
          <div key={r.s} className="flex items-center gap-3 rounded-2xl bg-ink-800/70 p-3" style={{ animation: `riseIn .5s cubic-bezier(.3,1.4,.5,1) ${i * 90}ms both` }}>
            <span className="grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: r.c }}>{r.s[0]}</span>
            <div className="flex-1"><div className="text-sm font-extrabold text-white">{r.n}</div><div className="text-[11px] text-ink-400">{r.s}/USDT</div></div>
            <div className="font-mono text-sm font-extrabold text-white">${r.p}</div>
          </div>
        ) : (
          <div key={r.s} className="flex items-center gap-3 rounded-2xl bg-ink-800/40 p-3">
            <span className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-2/3 rounded-full" /><div className="skeleton h-2.5 w-1/3 rounded-full" /></div>
            <div className="skeleton h-4 w-14 rounded-full" />
          </div>
        ))}
      </div>
      <Btn v="ghost" size="sm" block className="mt-3" onClick={() => setLoaded(false)}><Icon name="refresh" size={14} />Reload</Btn>
    </AssetCard>
  );
}

/* ═════════ TRN-06 · Animated tab content ═════════ */
const TABS = [
  { t: "Overview", i: "grid", c: "#3d8bff" }, { t: "Chart", i: "chart", c: "#2ee59d" }, { t: "News", i: "news", c: "#ffc53d" },
];
function AnimatedTabs() {
  const [tab, setTab] = useState(0);
  const [prev, setPrev] = useState(0);
  const dir = tab >= prev ? 1 : -1;
  const go = (i: number) => { setPrev(tab); setTab(i); feel("tap"); };
  return (
    <AssetCard id="TRN-06" title="Animated Tab Content" desc="Контент вкладок сменяется направленным слайдом + кроссфейдом (учитывает, влево или вправо переключил), индикатор-таблетка плавно скользит под активным табом." tags={["transition", "tabs", "crossfade", "directional"]}>
      <div className="relative flex rounded-2xl bg-ink-950/60 p-1.5">
        <div className="absolute bottom-1.5 top-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${(tab / TABS.length) * 100}% + 6px)`, width: `calc(${100 / TABS.length}% - 12px)`, background: `${TABS[tab].c}22`, boxShadow: `inset 0 0 0 2px ${TABS[tab].c}` }} />
        {TABS.map((t, i) => <button key={t.t} onClick={() => go(i)} className="relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors" style={{ color: tab === i ? "#fff" : "#5a70ad" }}><Icon name={t.i} size={14} style={{ color: tab === i ? t.c : "#5a70ad" }} />{t.t}</button>)}
      </div>
      <div className="relative mt-3 h-44 overflow-hidden rounded-2xl bg-ink-950/40">
        <div key={tab} className="absolute inset-0 p-4" style={{ animation: `${dir > 0 ? "slideFromRight" : "slideFromLeft"} .35s cubic-bezier(.3,1,.4,1) both` }}>
          {tab === 0 && <div><div className="text-sm font-extrabold text-white">Bitcoin overview</div><div className="mt-2 grid grid-cols-2 gap-2">{[["Cap", "$1.26T"], ["24h", "$28B"], ["Supply", "19.6M"], ["ATH", "$69k"]].map(([a, b]) => <div key={a} className="raised rounded-xl p-2"><div className="text-[9px] uppercase text-ink-400">{a}</div><div className="font-mono text-sm font-extrabold text-white">{b}</div></div>)}</div></div>}
          {tab === 1 && <div><div className="mb-2 text-sm font-extrabold text-white">Price chart</div><svg viewBox="0 0 240 100" className="w-full"><path d="M0 80 L30 70 L60 74 L90 40 L120 52 L150 24 L180 36 L210 14 L240 22" fill="none" stroke="#2ee59d" strokeWidth="2.5" /><path d="M0 80 L30 70 L60 74 L90 40 L120 52 L150 24 L180 36 L210 14 L240 22 L240 100 L0 100Z" fill="#2ee59d" opacity=".1" /></svg></div>}
          {tab === 2 && <div className="space-y-2">{["ETF inflows hit record", "Hashrate all-time high", "Halving in 42 days"].map((n, i) => <div key={n} className="flex items-center gap-2 rounded-xl bg-ink-800/70 p-2.5" style={{ animation: `fadeUp .4s ease ${i * 80}ms both` }}><Icon name="news" size={16} className="text-gold" /><span className="text-xs font-bold text-ink-100">{n}</span></div>)}</div>}
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ TRN-07 · Expanding search ═════════ */
const ALL = ["Bitcoin BTC", "Ethereum ETH", "Solana SOL", "Toncoin TON", "Cardano ADA", "Chainlink LINK", "Polkadot DOT", "Avalanche AVAX"];
function ExpandSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const found = q ? ALL.filter((a) => a.toLowerCase().includes(q.toLowerCase())) : ALL;
  return (
    <AssetCard id="TRN-07" title="Expanding Search Bar" desc="Круглая кнопка-лупа раскрывается в полноширинное поле с фокусом и живым списком результатов (каскад появления). Крестик схлопывает обратно." tags={["transition", "search", "expand", "morph"]}>
      <div className="relative flex h-12 items-center justify-end">
        <div className="well flex h-12 items-center gap-2 overflow-hidden rounded-full px-3 transition-all duration-400 ease-[cubic-bezier(.3,1.2,.4,1)]" style={{ width: open ? "100%" : "48px" }}>
          <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); feel("tap"); }} className="shrink-0"><Icon name="search" size={20} className={open ? "text-sky" : "text-ink-300"} /></button>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coins…" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-ink-500" style={{ opacity: open ? 1 : 0 }} />
          {open && <button onClick={() => { setOpen(false); setQ(""); feel("tap"); }} className="shrink-0"><Icon name="x" size={18} className="text-ink-400" /></button>}
        </div>
      </div>
      <div className="mt-3 grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}>
        <div className="overflow-hidden">
          <div className="max-h-52 space-y-1.5 overflow-y-auto">
            {found.map((a, i) => <button key={a} onClick={() => { setQ(a); feel("pop"); }} className="flex w-full items-center gap-3 rounded-xl bg-ink-800/60 p-2.5 text-left transition-colors hover:bg-ink-800" style={{ animation: open ? `fadeUp .3s ease ${i * 40}ms both` : "none" }}><span className="grid h-8 w-8 place-items-center rounded-full bg-sky/15 text-[10px] font-extrabold text-sky">{a.split(" ")[1]}</span><span className="text-sm font-bold text-white">{a.split(" ")[0]}</span></button>)}
            {found.length === 0 && <div className="py-6 text-center text-xs font-bold text-ink-500">Ничего не найдено</div>}
          </div>
        </div>
      </div>
      {!open && <Label className="mt-2 mb-0 text-center">Тапни лупу — поле раскроется</Label>}
    </AssetCard>
  );
}

/* ═════════ TRN-08 · Circular reveal (theme wipe) ═════════ */
function CircularReveal() {
  const [dark, setDark] = useState(true);
  const [wipe, setWipe] = useState<{ x: number; y: number; to: boolean } | null>(null);
  const toggle = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const box = (e.currentTarget.closest("[data-reveal]") as HTMLElement)?.getBoundingClientRect();
    if (!box) return;
    setWipe({ x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, to: !dark });
    feel("whoosh", 8);
    window.setTimeout(() => { setDark(!dark); setWipe(null); }, 620);
  };
  const light = wipe ? wipe.to === false : !dark;
  return (
    <AssetCard id="TRN-08" title="Circular Theme Reveal" desc="Смена темы кругом из точки нажатия: новый фон «расходится» clip-path окружностью поверх старого. Material-style тематический wipe." tags={["transition", "theme", "clip-path", "reveal"]} stageClass="p-2">
      <div data-reveal className="relative h-64 overflow-hidden rounded-2xl">
        <div className={cn("absolute inset-0 p-5", dark ? "bg-ink-900" : "bg-[#eef2fb]")}>
          <ThemeContent light={!dark} onToggle={toggle} />
        </div>
        {wipe && (
          <div className="absolute inset-0 p-5" style={{ ["--cx" as string]: `${wipe.x}px`, ["--cy" as string]: `${wipe.y}px`, animation: "circleReveal .6s ease-out forwards" } as CSSProperties}>
            <div className={cn("absolute inset-0", wipe.to ? "bg-ink-900" : "bg-[#eef2fb]")} />
            <div className="relative"><ThemeContent light={!wipe.to} onToggle={() => {}} /></div>
          </div>
        )}
      </div>
      <span className="sr-only">{light ? "light" : "dark"}</span>
    </AssetCard>
  );
}
function ThemeContent({ light, onToggle }: { light: boolean; onToggle: (e: React.MouseEvent) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className={cn("text-lg font-extrabold", light ? "text-ink-900" : "text-white")}>Portfolio</div>
        <button onClick={onToggle} className={cn("grid h-10 w-10 place-items-center rounded-full transition-colors", light ? "bg-ink-900 text-gold" : "bg-white text-ink-900")}><Icon name={light ? "flame" : "sparkles"} size={18} variant="solid" /></button>
      </div>
      <div className={cn("mt-3 font-mono text-3xl font-extrabold", light ? "text-ink-900" : "text-white")}>$12,480</div>
      <div className="text-xs font-extrabold text-bull">+8.4% today</div>
      <div className="mt-4 space-y-2">
        {[["BTC", "45%"], ["ETH", "25%"], ["SOL", "15%"]].map(([s, p], i) => (
          <div key={s} className={cn("flex items-center justify-between rounded-xl p-2.5", light ? "bg-white shadow-sm" : "bg-ink-800")}>
            <span className={cn("text-sm font-extrabold", light ? "text-ink-900" : "text-white")}>{s}</span>
            <div className="flex items-center gap-2"><div className={cn("h-2 w-20 overflow-hidden rounded-full", light ? "bg-ink-200" : "bg-ink-950")}><div className="h-full rounded-full" style={{ width: p, background: ["#f7931a", "#8c8cff", "#14f195"][i] }} /></div><span className={cn("font-mono text-xs font-bold", light ? "text-ink-500" : "text-ink-300")}>{p}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Transitions() {
  return (
    <Section id="transitions" num="20" title="Transitions" subtitle="Разделяемый элемент, морфинг FAB, стек навигации, живые числа, скелетоны, вкладки, раскрытие поиска, круговая смена темы">
      <SharedElement />
      <MorphFab />
      <NavStack />
      <LiveDashboard />
      <SkeletonLoad />
      <AnimatedTabs />
      <ExpandSearch />
      <CircularReveal />
    </Section>
  );
}
