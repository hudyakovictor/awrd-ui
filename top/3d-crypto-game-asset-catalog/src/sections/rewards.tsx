import { useState, type MouseEvent } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Bar, Chip, Confetti, Label, useFloaters } from "../components/ui";
import { ChestArt, CoinArt, GemArt, BoltArt, FlameArt, TrophyArt } from "../components/art";
import { tap, sfx, haptic, useCountUp } from "../lib/fx";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { cn } from "../utils/cn";

/* R01 — Loot chest */
export function Chest() {
  const [taps, setTaps] = useState(0);
  const [open, setOpen] = useState(false);
  const [boom, setBoom] = useState(0);
  const [tier, setTier] = useState<"gold" | "violet" | "sky">("gold");
  const need = 3;
  const hit = () => {
    if (open) return;
    const n = taps + 1; setTaps(n);
    if (n >= need) { setOpen(true); setBoom(Date.now()); sfx("open"); haptic([20, 40, 60]); const el = document.activeElement; setTimeout(() => particles.flyFrom(el, tier === "gold" ? "coins" : "gems", tier === "gold" ? "coin" : "gem", 10, () => wallet.add(tier === "gold" ? { coins: 500 } : { gems: tier === "violet" ? 80 : 25 })), 450); }
    else { sfx("hit"); haptic(20); }
  };
  const loot = { gold: [["coin", "+500"], ["bolt", "x2 XP 15м"]], violet: [["gem", "+80"], ["bolt", "Буст 30м"]], sky: [["gem", "+25"], ["coin", "+150"]] }[tier];
  return (
    <div className="relative flex flex-col items-center">
      <Confetti fire={boom} count={36} />
      <div className="mb-2 flex gap-2">
        {(["sky", "violet", "gold"] as const).map((t) => (
          <button key={t} onClick={() => { tap("tick"); setTier(t); setOpen(false); setTaps(0); }} className={cn("rounded-lg px-2.5 py-1 font-display text-[10px] font-bold uppercase", tier === t ? "bg-white/15 text-white" : "text-ink-400")}>{{ sky: "Редкий", violet: "Эпик", gold: "Легенда" }[t]}</button>
        ))}
      </div>
      <button onClick={hit} className={cn("relative transition-transform active:scale-95", !open && taps > 0 && "animate-wiggle", !open && taps === 0 && "animate-float")} key={taps} aria-label="open chest">
        {open && <div className="absolute inset-0 -z-10 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0_10%,rgba(255,201,64,.35)_10%_15%,transparent_15%_35%,rgba(255,201,64,.35)_35%_40%,transparent_40%_60%,rgba(255,201,64,.35)_60%_65%,transparent_65%_85%,rgba(255,201,64,.35)_85%_90%,transparent_90%)] scale-150" />}
        <ChestArt size={150} open={open} tier={tier} />
      </button>
      {!open ? (
        <>
          <div className="mt-1 flex gap-1.5">{Array.from({ length: need }).map((_, i) => <span key={i} className={cn("h-2 w-8 rounded-full transition-colors", i < taps ? "bg-gold" : "bg-ink-700")} />)}</div>
          <div className="mt-2 text-[12px] font-bold text-ink-300">Тапни {need - taps} раз{need - taps === 1 ? "" : "а"}</div>
        </>
      ) : (
        <div className="mt-1 flex gap-3">
          {loot.map(([k, v], i) => (
            <div key={v} className="panel-soft flex flex-col items-center px-4 py-2 animate-pop" style={{ animationDelay: `${150 + i * 120}ms` }}>
              {k === "coin" ? <CoinArt size={32} /> : k === "gem" ? <GemArt size={32} /> : <BoltArt size={32} />}
              <span className="mt-1 font-display text-xs font-black">{v}</span>
            </div>
          ))}
        </div>
      )}
      {open && <Btn s="xs" v="ghost" className="mt-3" icon="refresh" onClick={() => { setOpen(false); setTaps(0); }}>Ещё сундук</Btn>}
    </div>
  );
}

/* R02 — Currency wallet with fly-to counters */
export function Currencies() {
  const [bal, setBal] = useState({ coin: 8540, gem: 1240, bolt: 18 });
  const { add, layer } = useFloaters();
  const c = useCountUp(bal.coin), g = useCountUp(bal.gem), b = useCountUp(bal.bolt);
  const items = [
    { k: "coin" as const, art: <CoinArt size={44} />, v: Math.round(c).toLocaleString("ru-RU"), amt: 150, tone: "text-gold", x: 16, label: "Монеты" },
    { k: "gem" as const, art: <GemArt size={44} />, v: Math.round(g).toLocaleString("ru-RU"), amt: 25, tone: "text-sky", x: 50, label: "Кристаллы" },
    { k: "bolt" as const, art: <BoltArt size={44} />, v: Math.round(b), amt: 5, tone: "text-violet", x: 82, label: "Энергия" },
  ];
  return (
    <div className="relative">
      {layer}
      <div className="grid grid-cols-3 gap-3">
        {items.map((i) => (
          <button key={i.k} onClick={(e) => { sfx("coin"); haptic(10); setBal((s) => ({ ...s, [i.k]: s[i.k] + i.amt })); add(`+${i.amt}`, i.x - 6, 10, i.tone); particles.flyFrom(e.currentTarget, i.k === "coin" ? "coins" : i.k === "gem" ? "gems" : "xp", i.k === "coin" ? "coin" : i.k === "gem" ? "gem" : "xp", 5, () => wallet.add(i.k === "coin" ? { coins: i.amt } : i.k === "gem" ? { gems: i.amt } : { xp: i.amt })); }}
            className="panel-soft group flex flex-col items-center gap-1 py-4 transition-transform hover:-translate-y-1 active:translate-y-0.5">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 group-active:scale-90">{i.art}</div>
            <div className={cn("font-display text-base font-black tabular-nums", i.tone)}>{i.v}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">{i.label}</div>
            <span className="mt-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-ink-300 group-hover:bg-white/10">+{i.amt}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet/25 to-sky/15 p-3 ring-1 ring-violet/30">
        <BoltArt size={32} className="animate-float" />
        <div className="flex-1"><div className="text-xs font-bold">Энергия {bal.bolt}/25</div><Bar value={(bal.bolt / 25) * 100} tone="violet" h={10} className="mt-1" /></div>
        <Btn s="xs" v="violet" disabled={bal.gem < 50} onClick={() => { sfx("success"); setBal((s) => ({ ...s, gem: s.gem - 50, bolt: 25 })); }}>
          <GemArt size={14} />50
        </Btn>
      </div>
    </div>
  );
}

/* R03 — Streak week */
export function Streak() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const [done, setDone] = useState([true, true, false, true, true, false, false]);
  const [freeze, setFreeze] = useState([false, false, true, false, false, false, false]);
  const [freezes, setFreezes] = useState(1);
  const today = 5;
  const count = 27 + done.filter(Boolean).length - 4;
  const lit = done[today];
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className={cn("absolute inset-0 rounded-full blur-2xl transition-opacity", lit ? "bg-flame/40 opacity-100" : "opacity-0")} />
          <FlameArt size={96} off={!lit} className={cn("relative", lit && "animate-flicker")} />
        </div>
        <div className={cn("font-display text-4xl font-black tabular-nums", lit ? "text-flame" : "text-ink-400")} key={count}><span className="inline-block animate-pop">{count}</span></div>
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">дней подряд</div>
      </div>
      <div>
        <div className="panel-soft grid grid-cols-7 gap-1.5 p-3">
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span className={cn("text-[10px] font-extrabold", i === today ? "text-white" : "text-ink-400")}>{d}</span>
              <button onClick={() => {
                if (i === today) { const v = !done[i]; setDone((s) => s.map((x, j) => (j === i ? v : x))); if (v) { sfx("levelup"); haptic([10, 30, 50]); } else tap(); }
              }}
                className={cn("flex size-9 items-center justify-center rounded-full transition-all",
                  done[i] ? "bg-gradient-to-b from-[#FFB547] to-flame text-white shadow-[0_3px_0_var(--color-flame-d)]" : freeze[i] ? "bg-gradient-to-b from-[#BDE3FF] to-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" : i === today ? "bg-ink-850 ring-2 ring-dashed ring-flame/60 text-flame animate-pulse" : i > today ? "bg-ink-850 text-ink-600" : "bg-ink-850 text-ink-500")}>
                <Icon name={done[i] ? "check" : freeze[i] ? "snow" : i === today ? "flame" : "minus"} size={16} stroke={3} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 text-[12px] text-ink-300">{lit ? "Огонь горит — до завтра!" : "Тапни сегодняшний день, чтобы зажечь"}</div>
          <Btn s="xs" v="sky" icon="snow" disabled={!freezes} onClick={() => { sfx("success"); setFreezes(0); setFreeze((f) => f.map((x, j) => (j === 6 ? true : x))); }}>Заморозка ×{freezes}</Btn>
        </div>
      </div>
    </div>
  );
}

/* R04 — Achievements */
const ACH: { t: string; d: string; p: number; icon: IconName; c: string }[] = [
  { t: "Первая сделка", d: "Открой позицию в симуляторе", p: 100, icon: "candle", c: "from-bull to-bull-d" },
  { t: "Железные руки", d: "Держи позицию 7 дней", p: 71, icon: "hand", c: "from-sky to-sky-d" },
  { t: "Снайпер", d: "10 прогнозов подряд", p: 40, icon: "target", c: "from-bear to-bear-d" },
  { t: "Кит", d: "Баланс демо $100K", p: 12, icon: "crown", c: "from-gold to-gold-d" },
];
export function Achievements() {
  const [prog, setProg] = useState(ACH.map((a) => a.p));
  const [fresh, setFresh] = useState<number | null>(null);
  const bump = (i: number) => {
    if (prog[i] >= 100) { tap(); return; }
    const n = Math.min(100, prog[i] + 30);
    setProg((p) => p.map((v, j) => (j === i ? n : v)));
    if (n >= 100) { setFresh(i); sfx("levelup"); haptic([10, 40, 10, 40]); setTimeout(() => setFresh(null), 1600); } else sfx("tick");
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACH.map((a, i) => {
        const done = prog[i] >= 100;
        return (
          <button key={a.t} onClick={() => bump(i)} className="panel-soft relative flex flex-col items-center p-3 text-center transition-transform hover:-translate-y-1">
            {fresh === i && <Confetti fire={1} count={18} />}
            <div className={cn("relative flex size-16 items-center justify-center overflow-hidden", done ? "" : "grayscale opacity-60")} style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
              <div className={cn("absolute inset-0 bg-gradient-to-b", a.c)} />
              <div className="absolute inset-[4px] bg-gradient-to-b from-white/25 to-transparent" style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }} />
              {done && <div className="shine-sweep absolute inset-0" />}
              <Icon name={done ? a.icon : "lock"} size={26} stroke={2.4} className={cn("relative text-white drop-shadow", fresh === i && "animate-pop")} />
            </div>
            <div className="mt-2 font-display text-[11px] font-bold leading-tight">{a.t}</div>
            <div className="mt-0.5 text-[10px] leading-tight text-ink-400">{a.d}</div>
            <Bar value={prog[i]} tone={done ? "gold" : "sky"} h={8} className="mt-2 w-full" />
            <div className="mt-1 font-mono text-[10px] text-ink-400">{done ? "получено" : `${prog[i]}% · тап`}</div>
          </button>
        );
      })}
    </div>
  );
}

/* R05 — Daily quests */
export function Quests() {
  const [q, setQ] = useState([
    { t: "Пройди 3 урока", p: 3, n: 3, r: 20, claimed: false, icon: "book" as IconName },
    { t: "Открой 2 демо-сделки", p: 1, n: 2, r: 15, claimed: false, icon: "candle" as IconName },
    { t: "10 ответов без ошибок", p: 6, n: 10, r: 30, claimed: false, icon: "target" as IconName },
  ]);
  const { add, layer } = useFloaters();
  return (
    <div className="relative space-y-3">
      {layer}
      <div className="flex items-center justify-between"><Label className="mb-0">Ежедневные · обновятся через 6ч 12м</Label><TrophyArt size={28} /></div>
      {q.map((x, i) => {
        const full = x.p >= x.n;
        return (
          <div key={x.t} className={cn("panel-soft flex items-center gap-3 p-3 transition-opacity", x.claimed && "opacity-50")}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-ink-700 text-gold shadow-[0_3px_0_#0e1b3a]"><Icon name={x.icon} size={20} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">{x.t}</div>
              <div className="mt-1.5 flex items-center gap-2"><Bar value={(x.p / x.n) * 100} tone={full ? "gold" : "bull"} h={10} className="flex-1" /><span className="font-mono text-[10px] text-ink-300">{x.p}/{x.n}</span></div>
            </div>
            {x.claimed ? <Icon name="check" size={22} stroke={3} className="text-bull" /> : full ? (
              <Btn s="xs" v="gold" className="shine-sweep" onClick={(e) => { sfx("coin"); haptic(15); add(`+${x.r}`, 80, 10 + i * 30); particles.flyFrom(e.currentTarget, "gems", "gem", 6, () => wallet.add({ gems: x.r })); setQ((s) => s.map((y, j) => (j === i ? { ...y, claimed: true } : y))); }}>
                <GemArt size={14} />{x.r}
              </Btn>
            ) : (
              <button onClick={() => { tap("tick"); setQ((s) => s.map((y, j) => (j === i ? { ...y, p: y.p + 1 } : y))); }} className="rounded-xl bg-ink-700 px-2.5 py-1.5 font-display text-[10px] font-bold text-ink-200 shadow-[0_2px_0_#0e1b3a] active:translate-y-0.5">+1</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* R06 — Skill cards: rarity, tilt, flip */
const CARDS = [
  { t: "Стоп-лосс", r: "Обычная", c: ["#4d69a8", "#1b305c"], icon: "shield" as IconName, pow: 3, d: "Ограничивает убыток. −50% урона от обвала." },
  { t: "Анализ объёма", r: "Редкая", c: ["#3D9BFF", "#1B5FC9"], icon: "chart" as IconName, pow: 5, d: "Видишь силу движения. +1 подсказка." },
  { t: "Холодная голова", r: "Эпик", c: ["#9A6BFF", "#5F35C9"], icon: "brain" as IconName, pow: 7, d: "Иммунитет к FOMO на 3 хода." },
  { t: "Глаз кита", r: "Легенда", c: ["#FFC940", "#C98A08"], icon: "eye" as IconName, pow: 9, d: "Показывает стакан крупных игроков." },
];
function SkillCard({ c }: { c: (typeof CARDS)[number] }) {
  const [flip, setFlip] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 18, y: (px - 0.5) * 18, gx: px * 100, gy: py * 100 });
  };
  const legend = c.r === "Легенда";
  return (
    <div className="[perspective:900px]" onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0, gx: 50, gy: 50 })}>
      <div onClick={() => { sfx("whoosh"); haptic(8); setFlip(!flip); }} className="relative aspect-[3/4.2] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flip ? 180 : 0)}deg)` }}>
        <div className="absolute inset-0 overflow-hidden rounded-2xl p-[3px] [backface-visibility:hidden]" style={{ background: `linear-gradient(160deg, ${c.c[0]}, ${c.c[1]})`, boxShadow: `0 6px 0 ${c.c[1]}, 0 16px 30px -10px rgba(0,0,0,.7)${legend ? ", 0 0 30px rgba(255,201,64,.35)" : ""}` }}>
          <div className="relative flex h-full flex-col rounded-[13px] bg-ink-850 p-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md px-1.5 font-display text-[8px] font-black uppercase" style={{ background: c.c[0], color: legend ? "#3a2400" : "#fff" }}>{c.r}</span>
              <span className="flex size-6 items-center justify-center rounded-full font-display text-[11px] font-black" style={{ background: c.c[1] }}>{c.pow}</span>
            </div>
            <div className="relative mt-2 flex flex-1 items-center justify-center overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at 50% 40%, ${c.c[0]}66, transparent 70%)` }}>
              <Icon name={c.icon} size={40} stroke={2} className="text-white drop-shadow-[0_4px_0_rgba(0,0,0,.4)]" />
            </div>
            <div className="mt-2 text-center font-display text-[10px] font-bold leading-tight">{c.t}</div>
            <div className="pointer-events-none absolute inset-0 rounded-[13px] mix-blend-overlay" style={{ background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,.45), transparent 50%)` }} />
            {legend && <div className="pointer-events-none absolute inset-0 rounded-[13px] opacity-40 mix-blend-color-dodge" style={{ background: `linear-gradient(${tilt.gx * 3}deg, #ff4d6d33, #ffc94055, #2be38b33, #3d9bff55, #9a6bff33)` }} />}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: `linear-gradient(160deg, ${c.c[1]}, #081229)`, boxShadow: `0 6px 0 ${c.c[1]}` }}>
          <Icon name={c.icon} size={22} className="text-white/80" />
          <div className="mt-2 text-[10px] font-semibold leading-snug text-white/90">{c.d}</div>
        </div>
      </div>
    </div>
  );
}
export function SkillCards() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{CARDS.map((c) => <SkillCard key={c.t} c={c} />)}</div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-ink-400">Наведи — голографический наклон · тапни — описание <Chip>Обычная</Chip><Chip tone="sky">Редкая</Chip><Chip tone="violet">Эпик</Chip><Chip tone="gold">Легенда</Chip></div>
    </div>
  );
}
