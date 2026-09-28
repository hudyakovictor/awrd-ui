import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATALOG, TOTAL, TOTAL_STATES, type Asset, type Category } from "./catalog";
import { Icon } from "./components/Icon";
import { Btn, Chip } from "./components/ui";
import { Mascot, CoinArt, GemArt, FlameArt, HeartArt, BoltArt } from "./components/art";
import { LogoMark, LeagueBadge } from "./components/art2";
import { CommandPalette } from "./components/CommandPalette";
import { Prototype } from "./prototype/Prototype";
import { Reveal, Marquee, Horizontal, Count, Tilt, Magnetic } from "./components/Reveal";
import { HeroFX, ScrollCue } from "./components/HeroFX";
import { ParticleLayer, particles } from "./lib/particles";
import { useWallet } from "./lib/wallet";
import { useSettings, settings } from "./lib/settings";
import { soundStore, useSound, useToasts, toastStore, tap, useCountUp, useInterval } from "./lib/fx";
import { cn } from "./utils/cn";

/* ——— Render children only once scrolled near the viewport (keeps live widgets from ticking off-screen) ——— */
function Lazy({ children, minH = 220 }: { children: ReactNode; minH?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight: on ? undefined : minH }}>
      {on ? children : (
        <div className="space-y-3" aria-hidden>
          <div className="shine-sweep h-24 rounded-2xl bg-ink-800" />
          <div className="shine-sweep h-4 w-2/3 rounded bg-ink-800" />
          <div className="shine-sweep h-4 w-1/2 rounded bg-ink-800" />
        </div>
      )}
    </div>
  );
}

function AssetCard({ a, cat, onFocus }: { a: Asset; cat: Category; onFocus: () => void }) {
  const [k, setK] = useState(0);
  return (
    <article id={a.id} className={cn("panel group flex h-full min-w-0 scroll-mt-32 flex-col p-4 sm:p-6")}>
      <header className="mb-5 flex items-start gap-3">
        <span className="flex h-9 min-w-12 items-center justify-center rounded-xl px-2 font-display text-[11px] font-black text-ink-900" style={{ background: cat.hex, boxShadow: `0 3px 0 rgba(0,0,0,.4), inset 0 2px 0 rgba(255,255,255,.35)` }}>{a.id}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold leading-tight sm:text-base">{a.title}</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-300">{a.desc}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={() => { tap("whoosh"); onFocus(); }} title="Открыть в фокусе" aria-label="Фокус" className="flex size-8 items-center justify-center rounded-xl bg-ink-800 text-ink-400 shadow-[0_3px_0_#0a1430] transition hover:text-white active:translate-y-0.5 active:shadow-none"><Icon name="eye" size={15} /></button>
          <button onClick={() => { tap("whoosh"); setK(k + 1); }} title="Сбросить демо" aria-label="Сбросить" className="flex size-8 items-center justify-center rounded-xl bg-ink-800 text-ink-400 shadow-[0_3px_0_#0a1430] transition hover:text-white active:translate-y-0.5 active:shadow-none"><Icon name="refresh" size={15} /></button>
        </div>
      </header>
      <div className="flex-1" key={k}><Lazy><a.C /></Lazy></div>
      <footer className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
        <span className="mr-1 text-[9px] font-black uppercase tracking-[.18em] text-ink-500">Состояния</span>
        {a.states.map((s) => <span key={s} className="rounded-md bg-ink-900/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">{s}</span>)}
        <span className="ml-auto flex items-center gap-2 text-ink-500" title="звук · вибро · клавиатура"><Icon name="volume" size={13} /><Icon name="hand" size={13} /><Icon name="eye" size={13} /></span>
      </footer>
    </article>
  );
}

function FocusView({ a, cat, onClose }: { a: Asset; cat: Category; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md animate-fade" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="panel max-h-[92vh] w-full max-w-4xl overflow-y-auto p-6 animate-zoom-in" role="dialog" aria-label={a.title}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 items-center rounded-xl px-2.5 font-display text-[11px] font-black text-ink-900" style={{ background: cat.hex }}>{a.id}</span>
          <div className="flex-1"><div className="font-display text-lg font-black">{a.title}</div><div className="text-[12px] text-ink-400">{cat.title} · {a.states.length} состояний</div></div>
          <Btn s="sm" v="ink" icon="x" onClick={onClose}>Esc</Btn>
        </div>
        <a.C />
      </div>
    </div>
  );
}

function GlobalToasts() {
  const list = useToasts();
  const tone = { success: "text-bull", info: "text-sky", warn: "text-gold", error: "text-bear" } as const;
  const icon = { success: "check", info: "info", warn: "alert", error: "x" } as const;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[75] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} onClick={() => toastStore.remove(t.id)} className="pointer-events-auto flex cursor-pointer items-center gap-3 rounded-2xl bg-ink-750 py-2.5 pl-3 pr-4 shadow-[0_5px_0_#050b1c,0_20px_40px_rgba(0,0,0,.5)] ring-1 ring-white/10 animate-slide-up">
          <span className={cn("flex size-7 items-center justify-center rounded-lg bg-current/15", tone[t.kind])}><Icon name={icon[t.kind]} size={15} stroke={3} /></span>
          <span className="text-[13px] font-bold">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ——— Header wallet: every reward in the catalog flies here ——— */
function Counter({ v, fly, children, cls }: { v: number; fly: string; children: ReactNode; cls: string }) {
  const n = useCountUp(v, 600);
  const [bump, setBump] = useState(0);
  const prev = useRef(v);
  useEffect(() => { if (v !== prev.current) { setBump(Date.now()); prev.current = v; } }, [v]);
  return (
    <div data-fly={fly} className="flex items-center gap-1 rounded-xl px-1.5 py-1">
      <span key={bump} className={bump ? "animate-pop" : ""}>{children}</span>
      <span className={cn("font-display text-xs font-black tabular-nums", cls)}>{Math.round(n) >= 10000 ? (Math.round(n) / 1000).toFixed(1) + "K" : Math.round(n).toLocaleString("ru-RU")}</span>
    </div>
  );
}
function HeaderWallet() {
  const w = useWallet();
  return (
    <div className="hidden items-center gap-0.5 rounded-2xl bg-ink-850/80 px-1.5 py-0.5 ring-1 ring-white/5 md:flex">
      <Counter v={w.streak} fly="streak" cls="text-flame"><FlameArt size={20} /></Counter>
      <Counter v={w.gems} fly="gems" cls="text-sky"><GemArt size={20} /></Counter>
      <Counter v={w.coins} fly="coins" cls="text-gold"><CoinArt size={20} /></Counter>
      <Counter v={w.xp} fly="xp" cls="text-violet"><BoltArt size={20} /></Counter>
      <Counter v={w.pro ? 5 : w.hearts} fly="hearts" cls="text-bear"><HeartArt size={20} empty={!w.pro && w.hearts === 0} /></Counter>
    </div>
  );
}

function Ticker() {
  const [rows, setRows] = useState(() => [["BTC", 67412], ["ETH", 3521], ["SOL", 172.4], ["TON", 6.82], ["XRP", 0.61], ["DOGE", 0.16], ["ADA", 0.45], ["AVAX", 36.2], ["LINK", 17.9], ["DOT", 7.1]].map(([s, p]) => ({ s: s as string, p: p as number, o: p as number })));
  useInterval(() => setRows((r) => r.map((x) => ({ ...x, p: x.p * (1 + (Math.random() - 0.495) * 0.003) }))), 1500);
  const items = [...rows, ...rows];
  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-ink-950/60 py-1.5" aria-hidden>
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pl-8">
        {items.map((x, i) => {
          const ch = ((x.p - x.o) / x.o) * 100;
          return (
            <span key={i} className="flex items-center gap-2 font-mono text-[11px]">
              <b className="text-ink-200">{x.s}</b>
              <span className="tabular-nums text-ink-300">{x.p > 100 ? x.p.toFixed(1) : x.p.toFixed(3)}</span>
              <span className={ch >= 0 ? "text-bull" : "text-bear"}>{ch >= 0 ? "▲" : "▼"}{Math.abs(ch).toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => { const h = document.documentElement; setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-bull via-sky to-violet" style={{ transform: `scaleX(${p})` }} />;
}

/* ——— Горизонтальное путешествие: скролл страницы → движение трека ——— */
const JOURNEY = [
  { n: "01", hex: "#3D9BFF", icon: "book" as const, t: "Учись по 5 минут", d: "18 типов заданий: квизы, свайпы, прогнозы, сборка фраз. Скучно не будет.", to: "L01" },
  { n: "02", hex: "#2BE38B", icon: "candle" as const, t: "Торгуй без риска", d: "Демо-симулятор: живой график, плечо, стакан, стопы и журнал сделок.", to: "T01" },
  { n: "03", hex: "#FF4D6D", icon: "sword" as const, t: "Побеждай боссов", d: "FOMO-Дух, Бумажные Руки, Кит Ликвидации. Верный ответ — это удар.", to: "K03" },
  { n: "04", hex: "#FFC940", icon: "gift" as const, t: "Забирай награды", d: "Сундуки, стрики, лиги, сезонный пропуск. Мета, которая держит годами.", to: "R01" },
];

function Journey() {
  return (
    <Horizontal height={240}>
      <div className="flex h-full flex-col justify-center pr-4">
        <div className="text-[11px] font-black uppercase tracking-[.25em] text-ink-400">Как устроена игра</div>
        <div className="mt-2 font-display text-3xl font-black leading-tight sm:text-4xl">Листайте вниз —<br />поедем <span className="text-sky">вбок</span></div>
        <div className="mt-3 max-w-sm text-sm text-ink-300">Полный цикл игрока за 4 остановки. Клик по карточке ведёт к ассету в каталоге.</div>
        <div className="mt-4 flex items-center gap-2 text-[12px] font-bold text-ink-400"><Icon name="chevR" size={16} className="animate-pulse" />скролл превратился в горизонтальный</div>
      </div>
      {JOURNEY.map((j) => (
        <Tilt key={j.n} max={7}>
          <button
            onClick={() => { tap(); document.getElementById(j.to)?.scrollIntoView({ behavior: "smooth" }); }}
            className="panel group flex h-full min-h-[380px] w-full flex-col p-6 text-left transition-shadow hover:ring-2"
            style={{ ["--tw-ring-color" as string]: j.hex }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-black opacity-20">{j.n}</span>
              <span className="flex size-14 items-center justify-center rounded-2xl text-ink-900 transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ background: j.hex, boxShadow: "0 5px 0 rgba(0,0,0,.4)" }}>
                <Icon name={j.icon} size={28} stroke={2.4} />
              </span>
            </div>
            <div className="mt-6 font-display text-xl font-black">{j.t}</div>
            <div className="mt-2 flex-1 text-sm leading-relaxed text-ink-300">{j.d}</div>
            <div className="mt-4 flex items-center gap-2 font-display text-xs font-black uppercase" style={{ color: j.hex }}>
              Открыть {j.to}<Icon name="chevR" size={14} stroke={3} className="transition-transform group-hover:translate-x-1.5" />
            </div>
          </button>
        </Tilt>
      ))}
    </Horizontal>
  );
}

/* ——— Бегущая строка категорий ——— */
function CategoryMarquee() {
  return (
    <div className="border-y border-white/5 bg-ink-950/50 py-4">
      <Marquee speed={46} gap={10}>
        {CATALOG.map((c) => (
          <a key={c.key} href={`#cat-${c.key}`} onClick={() => tap("tick")}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-ink-850 py-2 pl-2 pr-4 ring-1 ring-white/5 transition hover:ring-white/20">
            <span className="flex size-8 items-center justify-center rounded-xl text-ink-900" style={{ background: c.hex }}>
              <Icon name={c.icon} size={16} stroke={2.6} />
            </span>
            <span className="text-[13px] font-bold">{c.title}</span>
            <span className="font-mono text-[10px] text-ink-500">{c.assets.length}</span>
          </a>
        ))}
      </Marquee>
    </div>
  );
}

export default function App() {
  const sound = useSound();
  const s = useSettings();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(CATALOG[0].key);
  const [focus, setFocus] = useState<{ a: Asset; c: Category } | null>(null);
  const [showTop, setShowTop] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const logo = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return CATALOG;
    return CATALOG.map((c) => ({ ...c, assets: c.assets.filter((a) => `${a.id} ${a.title} ${a.desc} ${a.states.join(" ")} ${c.title}`.toLowerCase().includes(t)) })).filter((c) => c.assets.length);
  }, [q]);
  const found = filtered.reduce((a, c) => a + c.assets.length, 0);

  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("cat-", ""))), { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("[data-cat]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); search.current?.focus(); }
    };
    const sc = () => setShowTop(window.scrollY > 1200);
    window.addEventListener("keydown", k);
    window.addEventListener("scroll", sc, { passive: true });
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("scroll", sc); };
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip">
      <a href="#catalog" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-sky focus:px-4 focus:py-2 focus:font-bold">К каталогу</a>
      <ParticleLayer />
      <CommandPalette />

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <button ref={logo} onClick={() => { tap("coin"); particles.burstAt(logo.current, { kind: "star", count: 14, speed: 300, colors: ["#FFC940", "#2BE38B", "#3D9BFF"] }); }} className="flex items-center gap-2.5" aria-label="TradeLingo">
            <LogoMark size={40} />
            <div className="hidden text-left lg:block">
              <div className="font-display text-sm font-black leading-none">TradeLingo</div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-ink-400">Award UI Kit · v2</div>
            </div>
          </button>
          <div className="well mx-auto flex h-11 w-full max-w-md items-center gap-2 px-3 ring-2 ring-transparent focus-within:ring-sky">
            <Icon name="search" size={18} className="text-ink-400" />
            <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: сундук, свайп, L01…" aria-label="Поиск по каталогу" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink-500" />
            {q ? <button onClick={() => setQ("")} className="text-ink-400 hover:text-white" aria-label="Очистить"><Icon name="x" size={16} /></button>
              : <button onClick={() => window.dispatchEvent(new Event("open-palette"))} className="hidden items-center gap-1 sm:flex" aria-label="Командная палитра"><kbd className="rounded-md border-b-2 border-ink-900 bg-ink-700 px-1.5 font-mono text-[10px]">Ctrl</kbd><kbd className="rounded-md border-b-2 border-ink-900 bg-ink-700 px-1.5 font-mono text-[10px]">K</kbd></button>}
          </div>
          <HeaderWallet />
          <button onClick={() => { tap(); settings.set({ reduced: !s.reduced }); }} className={cn("btn3d hidden h-11 w-11 px-0 sm:inline-flex", s.reduced ? "v-violet" : "v-ink")} aria-label="Меньше движения" title="Меньше движения"><Icon name={s.reduced ? "eyeOff" : "sparkles"} size={18} stroke={2.4} /></button>
          <button onClick={() => { soundStore.set(!sound); if (!sound) setTimeout(() => tap("success"), 0); }} className={cn("btn3d h-11 w-11 px-0", sound ? "v-sky" : "v-ink")} aria-label="Звук" title="Звук">
            <Icon name={sound ? "volume" : "volumeX"} size={18} stroke={2.4} />
          </button>
        </div>
        <Ticker />
        <ScrollProgress />
      </div>

      {/* Hero */}
      <HeroFX>
      <section className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pt-16">
        <div>
          <Reveal variant="fade-up"><div className="flex flex-wrap gap-2"><Chip tone="gold"><Icon name="trophy" size={11} />Единый каталог</Chip><Chip tone="sky">React · Tailwind v4</Chip><Chip tone="bull">Играбельный прототип</Chip><Chip tone="violet">WCAG · дальтонизм</Chip><Chip tone="flame">Карусели · параллакс</Chip></div></Reveal>
          <Reveal variant="blur" delay={90}>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            Трейдинг учится<br />как <span className="bg-gradient-to-r from-bull via-sky to-violet bg-clip-text text-transparent">игра</span>.
          </h1>
          </Reveal>
          <Reveal variant="fade-up" delay={180}>
          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-ink-300">
            Полная дизайн-система мобильной игры о крипто-трейдинге. Объёмные панели, тёмно-синяя база и взрослый тон. Каждый ассет — живая группа элементов: жесты, частицы, карусели, параллакс, звук, вибро и доступность. Экономика общая для всего каталога.
          </p>
          </Reveal>
          <Reveal variant="fade-up" delay={260}>
          <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[[TOTAL, "ассетов", "text-sky"], [CATALOG.length, "категорий", "text-violet"], [TOTAL_STATES, "состояний", "text-bull"], [11, "экранов", "text-gold"]].map(([v, t, c]) => (
              <div key={t as string} className="panel-soft px-3 py-3 transition-transform hover:-translate-y-1">
                <div className={cn("font-display text-2xl font-black", c as string)}><Count to={v as number} /></div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">{t}</div>
              </div>
            ))}
          </div>
          </Reveal>
          <Reveal variant="fade-up" delay={340}>
          <div className="mt-7 flex flex-wrap gap-4">
            <Magnetic><Btn s="lg" icon="play" onClick={() => document.getElementById("prototype")?.scrollIntoView({ behavior: "smooth" })}>Играть в прототип</Btn></Magnetic>
            <Magnetic strength={0.25}><Btn s="lg" v="ink" icon="search" onClick={() => window.dispatchEvent(new Event("open-palette"))}>Найти ассет</Btn></Magnetic>
          </div>
          </Reveal>
        </div>
        <div className="relative flex min-h-[380px] items-center justify-center">
          <div className="absolute size-[420px] rounded-full bg-sky/20 blur-[100px]" />
          <div className="relative">
            <LogoMark size={220} className="max-sm:scale-75 animate-float drop-shadow-[0_30px_40px_rgba(0,0,0,.55)]" />
            <div className="absolute -left-20 top-4 animate-bob"><Mascot size={110} mood="hype" /></div>
            <LeagueBadge tier="diamond" size={80} className="absolute -right-16 top-0 animate-float [animation-delay:.6s]" />
            <CoinArt size={52} className="absolute -bottom-2 -left-10 animate-float [animation-delay:1.2s]" />
            <GemArt size={46} className="absolute -right-10 bottom-8 animate-float [animation-delay:.3s]" />
            <FlameArt size={44} className="absolute -top-10 left-1/2 animate-flicker" />
          </div>
        </div>
      </section>
      <div className="flex justify-center pb-4">
        <ScrollCue onClick={() => document.getElementById("prototype")?.scrollIntoView({ behavior: "smooth" })} />
      </div>
      </HeroFX>

      <CategoryMarquee />

      {/* Journey — горизонтальный скролл */}
      <Journey />

      {/* Prototype */}
      <section id="prototype" className="mx-auto max-w-[1440px] scroll-mt-28 px-4 py-12 sm:px-6">
        <div className="panel relative overflow-hidden p-3 sm:p-10">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative"><Prototype /></div>
        </div>
      </section>

      <div id="catalog" className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="min-w-0 lg:sticky lg:top-32 lg:h-[calc(100vh-9rem)] lg:overflow-y-auto no-scrollbar">
          <nav aria-label="Категории" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {filtered.map((c) => (
              <a key={c.key} href={`#cat-${c.key}`} onClick={() => tap("tick")}
                className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2 transition-all", active === c.key ? "bg-ink-750 shadow-[0_4px_0_#0a1430] ring-1 ring-white/10" : "hover:bg-white/5")}>
                <span className={cn("flex size-8 items-center justify-center rounded-lg bg-ink-850", c.tone)}><Icon name={c.icon} size={16} stroke={2.4} /></span>
                <span className={cn("flex-1 text-[13px] font-bold", active === c.key ? "text-white" : "text-ink-300")}>{c.title}</span>
                <span className="font-mono text-[10px] text-ink-500">{c.assets.length}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 space-y-16">
          {q && <div className="text-sm font-semibold text-ink-300">Найдено: <b className="text-white">{found}</b> по запросу «{q}»</div>}
          {!filtered.length && (
            <div className="panel flex flex-col items-center p-10 text-center">
              <Mascot size={110} mood="sad" />
              <div className="font-display text-lg font-black">Ничего не нашлось</div>
              <div className="mt-1 text-sm text-ink-400">Попробуй «босс», «свайп» или «плечо»</div>
              <Btn s="sm" v="sky" className="mt-4" onClick={() => setQ("")}>Сбросить</Btn>
            </div>
          )}
          {filtered.map((c) => (
            <section key={c.key} id={`cat-${c.key}`} data-cat className="scroll-mt-32">
              <Reveal variant="slide-right">
              <div className="mb-6 flex items-end gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl text-ink-900" style={{ background: c.hex, boxShadow: `0 5px 0 rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.4)` }}><Icon name={c.icon} size={26} stroke={2.4} /></span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.2em] text-ink-400">{c.code}01–{c.code}{String(c.assets.length).padStart(2, "0")}</div>
                  <h2 className="font-display text-2xl font-black sm:text-3xl">{c.title}</h2>
                  <p className="text-sm text-ink-300">{c.sub}</p>
                </div>
              </div>
              </Reveal>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
                {c.assets.map((a, i) => (
                  <Reveal key={a.id} variant="fade-up" delay={(i % 2) * 90} className={cn(a.wide && "xl:col-span-2")}>
                    <AssetCard a={a} cat={c} onFocus={() => setFocus({ a, c })} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

          <footer className="panel grid gap-6 p-6 sm:grid-cols-3">
            {[
              { i: "sparkles" as const, t: "Один словарь", d: "Пружины для масштаба, ease-out для цвета, «подошва» 5px для нажатий, единые паттерны вибро и звука." },
              { i: "brain" as const, t: "Взрослый тон", d: "Реальная терминология и когнитивные искажения как враги. Цвет рынка всегда продублирован стрелкой или знаком." },
              { i: "bolt" as const, t: "Собери экран", d: "Прототип выше собран только из ассетов этого каталога — HUD, путь, упражнения, награды, лига." },
            ].map((x) => (
              <div key={x.t}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-sky shadow-[0_3px_0_#0a1430]"><Icon name={x.i} size={20} /></span>
                <div className="mt-3 font-display text-sm font-bold">{x.t}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink-300">{x.d}</div>
              </div>
            ))}
          </footer>
        </main>
      </div>

      {showTop && (
        <button onClick={() => { tap("whoosh"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn3d v-sky fixed bottom-6 right-6 z-50 size-12 rounded-2xl px-0 animate-zoom-in" aria-label="Наверх">
          <Icon name="chevU" size={22} stroke={3} />
        </button>
      )}
      {focus && <FocusView a={focus.a} cat={focus.c} onClose={() => setFocus(null)} />}
      <GlobalToasts />
    </div>
  );
}
