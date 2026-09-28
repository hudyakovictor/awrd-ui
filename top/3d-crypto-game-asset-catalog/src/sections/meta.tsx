import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Bar, Chip, Label, Segmented, Toggle } from "../components/ui";
import { CoinArt, GemArt, HeartArt, BoltArt, ChestArt, FlameArt, Mascot, type Mood } from "../components/art";
import { CrystalPile, HourglassArt, TicketArt, ShieldArt, KeyArt, LeagueBadge, RocketArt } from "../components/art2";
import { particles, center } from "../lib/particles";
import { useCountdown } from "../lib/gestures";
import { wallet, useWallet } from "../lib/wallet";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ M01 — Daily spin wheel ═══════════════ */
const PRIZES: { t: string; c: string; kind: "coins" | "gems" | "xp" | "hearts"; n: number; w: number }[] = [
  { t: "100", c: "#FFC940", kind: "coins", n: 100, w: 22 },
  { t: "20", c: "#3D9BFF", kind: "gems", n: 20, w: 14 },
  { t: "50 XP", c: "#9A6BFF", kind: "xp", n: 50, w: 18 },
  { t: "250", c: "#FF8A3D", kind: "coins", n: 250, w: 12 },
  { t: "♥ +1", c: "#FF4D6D", kind: "hearts", n: 1, w: 12 },
  { t: "80", c: "#2BE3C8", kind: "gems", n: 80, w: 5 },
  { t: "25 XP", c: "#5F35C9", kind: "xp", n: 25, w: 15 },
  { t: "1000", c: "#2BE38B", kind: "coins", n: 1000, w: 2 },
];
export function SpinWheel() {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<number | null>(null);
  const [spins, setSpins] = useState(2);
  const [flap, setFlap] = useState(0);
  const wheel = useRef<HTMLDivElement>(null);
  const seg = 360 / PRIZES.length;
  const spin = () => {
    if (spinning || spins <= 0) return;
    setSpins((s) => s - 1);
    setWin(null);
    setSpinning(true);
    sfx("whoosh");
    const total = PRIZES.reduce((a, p) => a + p.w, 0);
    let r = Math.random() * total, idx = 0;
    for (; idx < PRIZES.length; idx++) { r -= PRIZES[idx].w; if (r <= 0) break; }
    idx = Math.min(idx, PRIZES.length - 1);
    const start = rot;
    const base = start - (start % 360);
    const end = base + 360 * 6 + (360 - (idx * seg + seg / 2)) + (Math.random() - 0.5) * seg * 0.6;
    const dur = 4200;
    const t0 = performance.now();
    let lastSeg = Math.floor(start / seg);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      const cur = start + (end - start) * e;
      setRot(cur);
      const s = Math.floor(cur / seg);
      if (s !== lastSeg) { lastSeg = s; sfx("tick"); haptic(4); setFlap((f) => f + 1); }
      if (k < 1) requestAnimationFrame(step);
      else {
        setSpinning(false);
        setWin(idx);
        const p = PRIZES[idx];
        sfx("open");
        haptic([10, 30, 10, 30, 60]);
        particles.burstAt(wheel.current, { kind: "confetti", count: 50 });
        const target = p.kind === "coins" ? "coins" : p.kind === "gems" ? "gems" : p.kind === "xp" ? "xp" : "hearts";
        const kind = p.kind === "coins" ? "coin" : p.kind === "gems" ? "gem" : p.kind === "xp" ? "xp" : "heart";
        setTimeout(() => particles.flyFrom(wheel.current, target, kind, 10, () => wallet.add({ [p.kind]: p.n })), 500);
      }
    };
    requestAnimationFrame(step);
  };
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div ref={wheel} className="relative mx-auto size-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gold to-gold-d p-2 shadow-[0_8px_0_#8a5c00,0_20px_40px_rgba(0,0,0,.6)]">
          <div className="relative size-full overflow-hidden rounded-full" style={{ transform: `rotate(${rot}deg)` }}>
            <svg viewBox="0 0 200 200" className="size-full">
              {PRIZES.map((p, i) => {
                const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
                const x0 = 100 + 100 * Math.cos(a0), y0 = 100 + 100 * Math.sin(a0), x1 = 100 + 100 * Math.cos(a1), y1 = 100 + 100 * Math.sin(a1);
                const mid = i * seg + seg / 2;
                return (
                  <g key={i}>
                    <path d={`M100 100 L${x0} ${y0} A100 100 0 0 1 ${x1} ${y1} Z`} fill={p.c} stroke="#081229" strokeWidth="1.5" />
                    <path d={`M100 100 L${x0} ${y0} A100 100 0 0 1 ${x1} ${y1} Z`} fill="url(#wshade)" />
                    <text x="100" y="30" transform={`rotate(${mid} 100 100)`} textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="900" fontSize="12" fill="#081229">{p.t}</text>
                  </g>
                );
              })}
              <defs><radialGradient id="wshade"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" /></radialGradient></defs>
            </svg>
            {Array.from({ length: 16 }).map((_, i) => <span key={i} className="absolute size-2 rounded-full bg-white shadow-[0_0_6px_#fff]" style={{ left: `calc(50% + ${Math.cos((i / 16) * Math.PI * 2) * 47}% - 4px)`, top: `calc(50% + ${Math.sin((i / 16) * Math.PI * 2) * 47}% - 4px)`, opacity: spinning ? (i + flap) % 2 ? 1 : 0.3 : 0.9 }} />)}
          </div>
        </div>
        <button onClick={spin} disabled={spinning || spins <= 0} className="btn3d v-ink absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full text-[11px]" style={{ ["--h" as string]: "4px" }}>
          {spinning ? "…" : spins > 0 ? "SPIN" : <Icon name="lock" size={20} />}
        </button>
        <div key={flap} className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ animation: "wiggle .15s ease-out" }}>
          <svg width="30" height="36" viewBox="0 0 30 36"><path d="M15 34 3 8a12 12 0 1 1 24 0Z" fill="#FF4D6D" stroke="#fff" strokeWidth="3" /><circle cx="15" cy="11" r="4" fill="#fff" /></svg>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <div className="font-display text-lg font-black">Колесо удачи</div>
        <div className="text-[12px] text-ink-400">Честные шансы — открыты игроку, как требуют сторы</div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {PRIZES.map((p, i) => (
            <div key={i} className={cn("flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors", win === i ? "bg-gold/20 ring-2 ring-gold" : "bg-ink-850")}>
              <span className="size-2.5 rounded-full" style={{ background: p.c }} /><span className="flex-1">{p.t} {p.kind === "coins" ? "мон." : p.kind === "gems" ? "крист." : ""}</span><span className="font-mono text-ink-400">{p.w}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
          <span className="text-[12px] font-bold text-ink-300">Вращений: <b className="text-gold">{spins}</b></span>
          {spins <= 0 && <Btn s="xs" v="gold" onClick={() => { setSpins(1); notify("Реклама просмотрена · +1 вращение", "info"); }}>Ещё за рекламу</Btn>}
        </div>
        {win !== null && <div className="mt-2 font-display text-sm font-black text-gold animate-pop">Выигрыш: {PRIZES[win].t}!</div>}
      </div>
    </div>
  );
}

/* ═══════════════ M02 — Season pass ═══════════════ */
type Rw = { icon: "coin" | "gem" | "ticket" | "chest" | "badge" | "key" | "bolt"; n: string };
const PASS: { free: Rw; pro: Rw }[] = [
  { free: { icon: "coin", n: "100" }, pro: { icon: "gem", n: "50" } },
  { free: { icon: "bolt", n: "5" }, pro: { icon: "ticket", n: "x2" } },
  { free: { icon: "coin", n: "200" }, pro: { icon: "chest", n: "Эпик" } },
  { free: { icon: "gem", n: "10" }, pro: { icon: "key", n: "1" } },
  { free: { icon: "chest", n: "Редкий" }, pro: { icon: "gem", n: "120" } },
  { free: { icon: "coin", n: "300" }, pro: { icon: "badge", n: "Рамка" } },
  { free: { icon: "ticket", n: "x2" }, pro: { icon: "chest", n: "Леген." } },
  { free: { icon: "gem", n: "25" }, pro: { icon: "gem", n: "300" } },
];
function RwIcon({ r, size = 34 }: { r: Rw; size?: number }) {
  switch (r.icon) {
    case "coin": return <CoinArt size={size} />;
    case "gem": return <GemArt size={size} />;
    case "bolt": return <BoltArt size={size} />;
    case "ticket": return <TicketArt size={size} label={r.n} />;
    case "chest": return <ChestArt size={size + 6} tier={r.n.startsWith("Лег") ? "gold" : r.n === "Эпик" ? "violet" : "sky"} />;
    case "key": return <KeyArt size={size} />;
    case "badge": return <LeagueBadge size={size} tier="ruby" />;
  }
}
export function SeasonPass() {
  const [xp, setXp] = useState(3.4);
  const [pro, setPro] = useState(false);
  const [claimed, setClaimed] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const reached = Math.floor(xp);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: Math.max(0, reached * 92 - 120), behavior: "smooth" });
  }, [reached]);
  const claim = (key: string, el: HTMLElement, r: Rw) => {
    setClaimed((c) => [...c, key]);
    sfx("coin");
    haptic(12);
    particles.burstAt(el, { kind: "star", count: 12, speed: 260, colors: ["#FFC940", "#fff"] });
    if (r.icon === "coin") particles.flyFrom(el, "coins", "coin", 6, () => wallet.add({ coins: +r.n }));
    if (r.icon === "gem") particles.flyFrom(el, "gems", "gem", 6, () => wallet.add({ gems: +r.n }));
  };
  const Cell = ({ r, k, i, locked }: { r: Rw; k: string; i: number; locked: boolean }) => {
    const can = i < reached && !locked;
    const done = claimed.includes(k);
    return (
      <button disabled={!can || done} onClick={(e) => claim(k, e.currentTarget, r)}
        className={cn("relative flex h-[88px] w-[80px] flex-col items-center justify-center rounded-2xl border-2 transition-all",
          done ? "border-bull/50 bg-bull/10" : can ? "border-gold bg-gold/10 shadow-[0_4px_0_var(--color-gold-d)] hover:-translate-y-0.5 animate-pulse-ring" : "border-ink-700 bg-ink-850 shadow-[0_4px_0_#0a1430]")}
        style={{ ["--ring" as string]: "rgba(255,201,64,.45)" }}>
        <div className={cn(!can && !done && "opacity-50 grayscale-[.5]")}><RwIcon r={r} /></div>
        {r.icon !== "ticket" && <span className="mt-0.5 font-display text-[10px] font-black">{r.n}</span>}
        {locked && <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink-900 text-gold"><Icon name="lock" size={11} stroke={2.6} /></span>}
        {done && <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-950/50"><Icon name="check" size={28} stroke={3.4} className="text-bull animate-pop" /></span>}
      </button>
    );
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative"><RocketArt size={48} className="animate-float" /></div>
        <div className="flex-1">
          <div className="font-display text-sm font-black">Сезон 3 · «Бычий забег»</div>
          <div className="text-[11px] text-ink-400">Осталось 18 дней · уровень {reached}/{PASS.length}</div>
        </div>
        <Btn s="xs" v="violet" icon="bolt" onClick={() => { setXp((x) => Math.min(PASS.length, x + 0.6)); sfx("coin"); }}>+XP</Btn>
        {!pro && <Btn s="xs" v="gold" className="shine-sweep" icon="crown" onClick={() => { setPro(true); sfx("levelup"); haptic([10, 30, 10, 30, 60]); particles.burst(window.innerWidth / 2, window.innerHeight / 2, { count: 60 }); }}>Pro-пропуск</Btn>}
      </div>
      <div ref={scroller} className="no-scrollbar mt-4 overflow-x-auto pb-3">
        <div className="relative inline-grid grid-flow-col gap-3 pl-[76px]" style={{ gridTemplateRows: "auto auto auto" }}>
          <div className="absolute left-0 top-0 flex h-[88px] w-[68px] flex-col items-center justify-center rounded-2xl bg-ink-800 text-[10px] font-black uppercase text-ink-300">Free</div>
          <div className="absolute left-0 top-[132px] flex h-[88px] w-[68px] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-gold/30 to-gold/5 text-[10px] font-black uppercase text-gold ring-1 ring-gold/40"><Icon name="crown" size={18} />Pro</div>
          {PASS.map((p, i) => (
            <div key={i} className="contents">
              <Cell r={p.free} k={`f${i}`} i={i} locked={false} />
              <div className="relative flex h-8 w-[80px] items-center justify-center">
                <div className="absolute inset-x-[-6px] top-1/2 h-2 -translate-y-1/2 bg-ink-850" />
                <div className="absolute left-[-6px] top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-violet to-sky transition-all duration-500" style={{ width: `calc(${Math.max(0, Math.min(1, xp - i)) * 100}% + 12px)` }} />
                <span className={cn("relative flex size-8 items-center justify-center rounded-full font-display text-[11px] font-black", i < reached ? "bg-violet text-white shadow-[0_3px_0_var(--color-violet-d)]" : "bg-ink-800 text-ink-400")}>{i + 1}</span>
              </div>
              <Cell r={p.pro} k={`p${i}`} i={i} locked={!pro} />
            </div>
          ))}
        </div>
      </div>
      <Bar value={(xp / PASS.length) * 100} tone="violet" h={8} />
    </div>
  );
}

/* ═══════════════ M03 — Shop ═══════════════ */
const SHOP: Record<string, { id: string; t: string; d: string; price: number; icon: () => ReactNode; tag?: string }[]> = {
  boosts: [
    { id: "freeze", t: "Заморозка стрика", d: "Спасёт огонь при пропуске дня", price: 200, icon: () => <ShieldArt size={44} tone="#8CCBFF" /> },
    { id: "x2", t: "Двойной XP · 15 мин", d: "Удваивает опыт в уроках", price: 150, icon: () => <TicketArt size={44} label="x2" />, tag: "Хит" },
    { id: "refill", t: "Полные жизни", d: "Восстановить 5/5", price: 350, icon: () => <HeartArt size={44} /> },
    { id: "hint", t: "Пакет подсказок ×5", d: "Разбор ошибок от Макса", price: 120, icon: () => <KeyArt size={44} /> },
  ],
  gems: [
    { id: "g1", t: "Горсть", d: "120 кристаллов", price: 149, icon: () => <CrystalPile size={56} n={1} /> },
    { id: "g2", t: "Мешочек", d: "650 кристаллов", price: 699, icon: () => <CrystalPile size={56} n={2} />, tag: "+10%" },
    { id: "g3", t: "Сундук", d: "1 400 кристаллов", price: 1290, icon: () => <CrystalPile size={56} n={3} />, tag: "Выгодно" },
    { id: "g4", t: "Хранилище", d: "3 000 кристаллов", price: 2490, icon: () => <CrystalPile size={56} n={4} />, tag: "+40%" },
  ],
};
export function Shop() {
  const w = useWallet();
  const [tab, setTab] = useState<"boosts" | "gems">("boosts");
  const [busy, setBusy] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const cd = useCountdown(5 * 3600 * 1000 + 42 * 60000);
  const buy = (it: (typeof SHOP)["boosts"][number], el: HTMLElement) => {
    if (tab === "gems") {
      setBusy(it.id);
      setTimeout(() => {
        setBusy(null);
        const n = +it.d.replace(/\D/g, "");
        sfx("open");
        particles.flyFrom(el, "gems", "gem", 12, () => wallet.add({ gems: n }));
        notify(`Покупка (демо): +${n} кристаллов`, "success");
      }, 900);
      return;
    }
    if (w.owned.includes(it.id)) return;
    if (w.gems < it.price) {
      setShake(it.id); sfx("error"); haptic([40, 30, 40]);
      notify(`Не хватает ${it.price - w.gems} кристаллов`, "warn");
      setTimeout(() => setShake(null), 500);
      return;
    }
    setBusy(it.id);
    const hud = document.querySelector('[data-fly="gems"]');
    particles.fly(center(hud), center(el), { kind: "gem", count: 6, onArrive: () => {
      wallet.spend("gems", it.price);
      wallet.own(it.id);
      if (it.id === "refill") wallet.setHearts(5);
      setBusy(null);
      sfx("success"); haptic([10, 40, 10]);
      particles.burstAt(el, { kind: "star", count: 14, speed: 300, colors: ["#8FF5FF", "#fff"] });
    } });
  };
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet via-violet-d to-ink-850 p-4 shadow-[0_6px_0_#2d1470]">
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-xl" />
        <div className="flex items-center gap-3">
          <ChestArt size={80} tier="violet" className="animate-float" />
          <div className="flex-1">
            <Chip tone="gold">Ограничено</Chip>
            <div className="mt-1 font-display text-base font-black">Стартовый набор трейдера</div>
            <div className="text-[11px] text-white/70">500 крист. + заморозка ×3 + скин графика</div>
            <div className="mt-1 flex items-center gap-2"><span className="font-mono text-[11px] text-white/50 line-through">1 490 ₽</span><span className="font-display text-sm font-black text-gold">490 ₽</span><Chip tone="bear">−67%</Chip></div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1 font-mono text-sm font-bold">{[cd.h, cd.m, cd.s].map((v, i) => <span key={i} className="rounded-lg bg-ink-950/50 px-2 py-1 tabular-nums">{String(v).padStart(2, "0")}</span>)}</div>
          <Btn s="sm" v="gold" className="ml-auto shine-sweep" onClick={() => notify("Демо: покупка набора", "info")}>Забрать</Btn>
        </div>
      </div>
      <Segmented value={tab} onChange={setTab} options={[{ v: "boosts", label: "Бусты" }, { v: "gems", label: "Кристаллы" }]} />
      <div className="grid grid-cols-2 gap-3">
        {SHOP[tab].map((it) => {
          const own = tab === "boosts" && w.owned.includes(it.id);
          return (
            <div key={it.id} className={cn("panel-soft relative flex flex-col items-center p-3 text-center", shake === it.id && "animate-shake")}>
              {it.tag && <span className="absolute -right-1 -top-2 rotate-6 rounded-lg bg-bear px-2 py-0.5 font-display text-[9px] font-black text-white shadow-[0_2px_0_var(--color-bear-d)]">{it.tag}</span>}
              <div className="flex h-14 items-center">{it.icon()}</div>
              <div className="mt-1 font-display text-[11px] font-bold leading-tight">{it.t}</div>
              <div className="mb-2 text-[10px] leading-tight text-ink-400">{it.d}</div>
              <button onClick={(e) => buy(it, e.currentTarget)} disabled={own || busy === it.id}
                className={cn("btn3d mt-auto h-9 w-full text-[11px]", own ? "v-ink" : tab === "gems" ? "v-bull" : w.gems < it.price ? "v-ghost" : "v-sky")}>
                {busy === it.id ? <span className="inline-block size-4 animate-spin rounded-full border-[3px] border-current border-r-transparent" /> : own ? <><Icon name="check" size={14} stroke={3} />Куплено</> : tab === "gems" ? `${it.price} ₽` : <><GemArt size={16} />{it.price}</>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] text-ink-400">
        <span>Баланс: <b className="text-sky">{w.gems.toLocaleString("ru-RU")}</b> крист.</span>
        <button className="font-bold text-sky" onClick={() => { tap(); wallet.reset(); }}>Сбросить кошелёк</button>
      </div>
    </div>
  );
}

/* ═══════════════ M04 — Pro paywall ═══════════════ */
const PLANS = [
  { k: "m", t: "1 месяц", p: "499 ₽", per: "499 ₽/мес", save: "" },
  { k: "y", t: "12 месяцев", p: "2 990 ₽", per: "249 ₽/мес", save: "−50%" },
  { k: "f", t: "Семья · 6", p: "4 490 ₽", per: "62 ₽/чел", save: "Семья" },
];
const FEATS: [string, boolean, boolean][] = [
  ["Все уроки и модули", true, true], ["Безлимитные жизни", false, true], ["Разбор ошибок с ИИ-ментором", false, true],
  ["Продвинутый симулятор + плечо", false, true], ["Без рекламы", false, true], ["Офлайн-режим", false, true],
];
export function Paywall() {
  const w = useWallet();
  const [plan, setPlan] = useState("y");
  const [trial, setTrial] = useState(true);
  const [busy, setBusy] = useState(false);
  if (w.pro) return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center animate-zoom-in">
      <div className="relative"><div className="absolute inset-0 rounded-full bg-gold/30 blur-2xl" /><LeagueBadge tier="diamond" size={110} className="relative" /></div>
      <div className="mt-2 font-display text-xl font-black text-gold">Добро пожаловать в Pro</div>
      <div className="text-[12px] text-ink-400">Безлимитные жизни включены во всём каталоге</div>
      <Btn s="sm" v="ghost" className="mt-4" onClick={() => wallet.setPro(false)}>Отменить (демо)</Btn>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Mascot size={64} mood="hype" className="animate-bob" />
        <div>
          <div className="font-display text-lg font-black">TradeLingo <span className="bg-gradient-to-r from-gold to-flame bg-clip-text text-transparent">Pro</span></div>
          <div className="text-[12px] text-ink-400">Учись в 2× быстрее без ограничений</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PLANS.map((p) => (
          <button key={p.k} onClick={() => { tap("tick"); setPlan(p.k); }} className={cn("relative rounded-2xl border-2 p-3 pt-4 text-center transition-all", plan === p.k ? "border-gold bg-gold/10 shadow-[0_4px_0_var(--color-gold-d)] -translate-y-0.5" : "border-ink-600 bg-ink-850 shadow-[0_4px_0_#0a1430]")}>
            {p.save && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-bull px-1.5 font-display text-[9px] font-black text-ink-900">{p.save}</span>}
            <div className="text-[10px] font-extrabold uppercase text-ink-300">{p.t}</div>
            <div className="mt-1 font-display text-sm font-black">{p.p}</div>
            <div className="font-mono text-[10px] text-ink-400">{p.per}</div>
          </button>
        ))}
      </div>
      <div className="panel-soft overflow-hidden">
        <div className="grid grid-cols-[1fr_52px_52px] bg-ink-850/60 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-ink-400"><span>Возможности</span><span className="text-center">Free</span><span className="text-center text-gold">Pro</span></div>
        {FEATS.map(([t, f, p]) => (
          <div key={t} className="grid grid-cols-[1fr_52px_52px] items-center border-t border-white/5 px-3 py-2 text-[12px] font-semibold">
            <span>{t}</span>
            <span className="flex justify-center">{f ? <Icon name="check" size={16} stroke={3} className="text-ink-300" /> : <Icon name="minus" size={16} className="text-ink-600" />}</span>
            <span className="flex justify-center">{p && <Icon name="check" size={16} stroke={3} className="text-gold" />}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-ink-850 px-3 py-2.5">
        <span className="text-[13px] font-bold">7 дней бесплатно</span>
        <Toggle on={trial} onChange={setTrial} tone="gold" label="trial" />
      </div>
      {trial && (
        <div className="grid grid-cols-3 gap-2 animate-slide-up">
          {[["Сегодня", "Полный доступ", "bolt"], ["День 5", "Напомним", "bell"], ["День 7", "Списание", "wallet"]].map(([d, t, ic], i) => (
            <div key={d} className="text-center">
              <span className={cn("mx-auto flex size-9 items-center justify-center rounded-full", i === 0 ? "bg-gold text-ink-900" : "bg-ink-750 text-ink-300")}><Icon name={ic as IconName} size={16} stroke={2.6} /></span>
              <div className="mt-1 text-[10px] font-black uppercase text-ink-300">{d}</div>
              <div className="text-[10px] text-ink-500">{t}</div>
            </div>
          ))}
        </div>
      )}
      <Btn block s="lg" v="gold" className="shine-sweep" loading={busy} onClick={(e) => {
        const el = e.currentTarget;
        setBusy(true);
        setTimeout(() => { setBusy(false); wallet.setPro(true); sfx("levelup"); haptic([10, 30, 10, 30, 80]); particles.burstAt(el, { count: 70, speed: 700 }); }, 1000);
      }}>{trial ? "Начать бесплатно" : `Оформить за ${PLANS.find((p) => p.k === plan)!.p}`}</Btn>
      <div className="text-center text-[10px] leading-snug text-ink-500">Отмена в любой момент в настройках стора. Демо — реальных списаний нет.</div>
    </div>
  );
}

/* ═══════════════ M05 — Out of hearts ═══════════════ */
export function OutOfHearts() {
  const w = useWallet();
  const cd = useCountdown(3 * 3600 * 1000 + 59 * 60000);
  const box = useRef<HTMLDivElement>(null);
  const [practice, setPractice] = useState(0);
  const refill = (el: HTMLElement) => {
    if (!wallet.spend("gems", 350)) { sfx("error"); notify("Недостаточно кристаллов", "warn"); return; }
    sfx("open");
    const hs = box.current?.querySelectorAll("[data-heart]");
    hs?.forEach((h, i) => setTimeout(() => particles.fly(center(el), center(h), { kind: "heart", count: 2, onArrive: () => { sfx("coin"); wallet.setHearts(Math.max(wallet.get().hearts, i + 1)); } }), i * 120));
  };
  const empty = w.hearts === 0;
  return (
    <div ref={box} className="text-center">
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => <span key={i} data-heart className={cn(i < w.hearts && "animate-pop")}><HeartArt size={36} empty={i >= w.hearts} /></span>)}
      </div>
      {empty ? (
        <div className="animate-zoom-in">
          <HourglassArt size={96} className="mx-auto mt-3" />
          <div className="font-display text-lg font-black">Жизни закончились</div>
          <div className="text-[12px] text-ink-400">Следующая через <b className="font-mono text-white">{cd.text}</b></div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="font-display text-base font-black">{w.hearts}/5 жизней</div>
          <div className="text-[12px] text-ink-400">Ошибка в уроке — минус жизнь</div>
          <Btn s="sm" v="bear" className="mt-3" icon="heart" onClick={() => { sfx("error"); haptic([40, 30, 40]); wallet.add({ hearts: -1 }); }}>Ошибиться (−1)</Btn>
        </div>
      )}
      <div className="mt-5 space-y-2.5 text-left">
        <button onClick={(e) => refill(e.currentTarget)} disabled={w.hearts === 5} className="panel-soft flex w-full items-center gap-3 p-3 transition-transform hover:-translate-y-0.5 disabled:opacity-50">
          <HeartArt size={30} /><span className="flex-1 text-[13px] font-bold">Восстановить всё</span><span className="flex items-center gap-1 font-display text-xs font-black text-sky"><GemArt size={18} />350</span>
        </button>
        <button onClick={() => { tap(); const n = practice + 1; setPractice(n); if (n >= 3) { setPractice(0); wallet.add({ hearts: 1 }); sfx("success"); notify("Практика завершена · +1 жизнь", "success"); } }} disabled={w.hearts === 5} className="panel-soft flex w-full items-center gap-3 p-3 transition-transform hover:-translate-y-0.5 disabled:opacity-50">
          <FlameArt size={30} /><span className="flex-1"><span className="block text-[13px] font-bold">Практика = +1 жизнь</span><Bar value={(practice / 3) * 100} h={6} className="mt-1" /></span><span className="font-mono text-[11px] text-ink-400">{practice}/3</span>
        </button>
        <button onClick={() => { tap(); wallet.setPro(true); wallet.setHearts(5); }} className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-gold/25 to-flame/10 p-3 ring-1 ring-gold/40 transition-transform hover:-translate-y-0.5">
          <Icon name="crown" size={26} className="text-gold" /><span className="flex-1 text-[13px] font-bold">Безлимит с Pro</span><Icon name="chevR" size={16} className="text-gold" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ M06 — Daily goal picker ═══════════════ */
const GOALS: { k: string; t: string; min: number; xp: number; mood: Mood; say: string }[] = [
  { k: "c", t: "Лайт", min: 5, xp: 10, mood: "idle", say: "Отличное начало!" },
  { k: "r", t: "Стандарт", min: 10, xp: 20, mood: "happy", say: "Идеальный баланс" },
  { k: "s", t: "Серьёзно", min: 15, xp: 30, mood: "happy", say: "Уважаю подход!" },
  { k: "i", t: "Интенсив", min: 20, xp: 50, mood: "hype", say: "Ты будущий кит!" },
];
export function DailyGoal() {
  const [g, setG] = useState("r");
  const [saved, setSaved] = useState(false);
  const goal = GOALS.find((x) => x.k === g)!;
  const week = goal.xp * 7;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <div className="flex items-end gap-2">
          <Mascot size={80} mood={goal.mood} key={g} className="animate-zoom-in" />
          <div className="mb-6 rounded-2xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-[12px] font-bold">{goal.say}</div>
        </div>
        <div className="mt-2 space-y-2">
          {GOALS.map((x) => (
            <button key={x.k} onClick={() => { tap("tick"); setG(x.k); setSaved(false); }} data-state={g === x.k ? "selected" : undefined} className="tile3d flex w-full items-center gap-3 px-3 py-2.5 text-left">
              <span className="flex-1 text-sm font-bold">{x.t}</span>
              <span className="font-mono text-[11px] text-ink-300">{x.min} мин/день</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <Label>Прогноз на неделю · {week} XP</Label>
        <div className="well flex h-40 items-end gap-2 p-3">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => {
            const h = ((goal.xp * (1 + i * 0.02)) / 55) * 100;
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full flex-1">
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-sky-d to-sky transition-all duration-500" style={{ height: `${h}%`, transitionDelay: `${i * 40}ms` }}><div className="mx-1 mt-1 h-1 rounded-full bg-white/40" /></div>
                </div>
                <span className="text-[9px] font-bold text-ink-400">{d}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="panel-soft py-2"><div className="font-display text-lg font-black text-sky">{Math.round(365 * goal.min / 60)}ч</div><div className="text-[10px] text-ink-400">в год</div></div>
          <div className="panel-soft py-2"><div className="font-display text-lg font-black text-bull">{Math.max(1, Math.round(120 / goal.xp))} нед</div><div className="text-[10px] text-ink-400">до модуля «Риск»</div></div>
        </div>
        <Btn block className="mt-auto" icon={saved ? "check" : "target"} v={saved ? "ink" : "bull"} onClick={() => { setSaved(true); sfx("success"); haptic([10, 40, 10]); }}>{saved ? "Цель установлена" : "Установить цель"}</Btn>
      </div>
    </div>
  );
}
