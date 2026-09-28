import { useState } from "react";
import { Asset, Btn3D, CountUp, Label, Section, Segmented, Tooltip, useFloat, FloatText } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* ---------- HUD ---------- */
function Hud() {
  const [streak, setStreak] = useState(47);
  const [gems, setGems] = useState(1280);
  const [hearts, setHearts] = useState(4);
  const [open, setOpen] = useState<string | null>(null);
  const [fl, add] = useFloat();
  const items = [
    { k: "streak", g: "flame" as const, v: streak, c: "text-[#ff8a3d]", on: () => { setStreak(streak + 1); add("+1🔥", "#ff8a3d", "8%"); } },
    { k: "gems", g: "gem" as const, v: gems, c: "text-cyan", on: () => { setGems(gems + 50); add("+50", "#2ed3f0", "38%"); } },
    { k: "hearts", g: "heart" as const, v: hearts, c: "text-bear", on: () => { setHearts(hearts >= 5 ? 1 : hearts + 1); } },
  ];
  const pop: Record<string, { t: string; d: string }> = {
    streak: { t: `${streak} дней подряд!`, d: "Не прерывайте серию — завтра +2× XP" },
    gems: { t: "Кристаллы", d: "Тратьте на заморозку серии и сундуки" },
    hearts: { t: hearts >= 5 ? "Энергия полна" : `Восстановление: ${(5 - hearts) * 4}:00`, d: "Ошибка в уроке = −1 сердце" },
  };
  return (
    <Asset title="Top HUD · Resources" id="nav.hud" desc="Тап по ресурсу — начисление с анимацией + поповер с подсказкой." className="lg:col-span-2">
      <div className="raised !rounded-2xl p-2 flex items-center gap-1 relative">
        <FloatText items={fl} />
        <button className="size-11 rounded-xl grid place-items-center hover:bg-white/5"><span className="size-8 rounded-full bg-gradient-to-b from-[#ffb547] to-[#f7931a] grid place-items-center shadow-[0_3px_0_#b8650a] text-white"><Icon name="bitcoin" size={17} stroke={2.6} /></span></button>
        {items.map((it) => (
          <div key={it.k} className="relative flex-1">
            <button onClick={() => { it.on(); setOpen(open === it.k ? null : it.k); sfx.coin(); haptic(8); }} className={cn("w-full h-11 rounded-xl flex items-center justify-center gap-1.5 font-extrabold transition hover:bg-white/5 active:scale-95", open === it.k && "bg-white/5")}>
              <span key={it.v} className="anim-pop"><Glyph name={it.g} size={24} /></span>
              <CountUp value={it.v} className={cn("text-[15px]", it.c)} />
            </button>
            {open === it.k && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 raised p-3 z-30 anim-scale text-center">
                <i className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 bg-[#1d3169] border-l border-t border-white/10" />
                <div className="text-[13px] font-extrabold">{pop[it.k].t}</div>
                <div className="text-[11px] text-mute mt-1">{pop[it.k].d}</div>
                {it.k === "hearts" && <div className="flex justify-center gap-1 mt-2">{[0, 1, 2, 3, 4].map((i) => <Glyph key={i} name="heart" size={18} dim={i >= hearts} />)}</div>}
              </div>
            )}
          </div>
        ))}
        <button className="relative size-11 rounded-xl grid place-items-center hover:bg-white/5">
          <Glyph name="crown" size={24} />
        </button>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div className="inset p-3 flex items-center gap-3">
          <button className="size-10 grid place-items-center text-dim hover:text-txt"><Icon name="x" size={22} stroke={2.6} /></button>
          <div className="flex-1"><div className="h-4 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full w-[62%] rounded-full bg-gradient-to-b from-[#5af5b4] to-[#12c47a] relative"><i className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/40" /></div></div></div>
          <span className="flex items-center gap-1 font-extrabold text-bear"><Glyph name="heart" size={20} />{hearts}</span>
        </div>
        <div className="inset p-3 flex items-center justify-between">
          <button className="size-10 grid place-items-center rounded-xl hover:bg-white/5"><Icon name="chevL" size={22} stroke={2.6} /></button>
          <div className="text-center"><div className="text-[14px] font-extrabold">Technical Analysis</div><div className="label-caps !mb-0">Section 2 · Unit 4</div></div>
          <button className="size-10 grid place-items-center rounded-xl hover:bg-white/5"><Icon name="moreH" size={22} /></button>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Bottom tab bar ---------- */
function TabBar() {
  const tabs = [
    { k: "learn", i: "home", l: "Learn" }, { k: "practice", i: "dumbbell", l: "Practice" }, { k: "trade", i: "candles", l: "Trade" },
    { k: "league", i: "trophy", l: "League", badge: 1 }, { k: "profile", i: "user", l: "Profile" },
  ];
  const [act, setAct] = useState("learn");
  const [seen, setSeen] = useState(false);
  const idx = tabs.findIndex((t) => t.k === act);
  return (
    <Asset title="Bottom Tab Bar" id="nav.tabbar" desc="Скользящий 3D-индикатор, bounce иконки, центральная кнопка «Trade».">
      <div className="h-40 inset !rounded-3xl relative overflow-hidden flex flex-col justify-end">
        <div className="absolute inset-0 grid place-items-center text-dim text-[12px] font-bold">
          <span key={act} className="anim-fade capitalize flex items-center gap-2"><Icon name={tabs[idx].i} size={16} />{tabs[idx].l} screen</span>
        </div>
        <div className="relative m-2 raised !rounded-2xl h-[66px] grid grid-cols-5">
          <div className="absolute top-1.5 bottom-1.5 rounded-xl bg-blue/15 border-2 border-blue/50 transition-all duration-400 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ width: "calc(20% - 8px)", left: `calc(${idx * 20}% + 4px)` }} />
          {tabs.map((t) => (
            <button key={t.k} onClick={() => { setAct(t.k); sfx.tap(); haptic(6); if (t.badge) setSeen(true); }} className={cn("relative z-10 flex flex-col items-center justify-center gap-0.5 transition-colors", act === t.k ? "text-blue" : "text-dim hover:text-mute")}>
              {t.k === "trade" ? (
                <span className={cn("size-10 -mt-1 rounded-xl grid place-items-center transition-all", act === t.k ? "bg-gradient-to-b from-[#5af5b4] to-[#12c47a] text-ink-900 shadow-[0_3px_0_#0d9a5c]" : "bg-[#1f336e] text-mute shadow-[0_3px_0_#0b1536]")}><Icon name="candles" size={20} stroke={2.4} /></span>
              ) : (
                <span key={act === t.k ? "a" : "b"} className={act === t.k ? "anim-pop" : ""}><Icon name={t.i} size={22} stroke={act === t.k ? 2.6 : 2} /></span>
              )}
              {t.k !== "trade" && <span className="text-[9.5px] font-extrabold uppercase tracking-wider">{t.l}</span>}
              {t.badge && !seen && <span className="absolute top-2 right-[26%] size-2.5 rounded-full bg-bear border-2 border-ink-700 animate-pulse" />}
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Tabs / segmented / breadcrumbs ---------- */
function TabsCrumbs() {
  const [tab, setTab] = useState("overview");
  const [tf, setTf] = useState("1H");
  const [line, setLine] = useState(0);
  const lines = ["Lessons", "Quizzes", "Glossary", "Notes"];
  const crumbs = ["Academy", "Technical Analysis", "Candlesticks", "Doji"];
  const [crumb, setCrumb] = useState(3);
  return (
    <Asset title="Tabs · Segmented · Breadcrumbs" id="nav.tabs" desc="Три паттерна вкладок с анимированными индикаторами.">
      <Label>Segmented pill</Label>
      <Segmented value={tab} onChange={setTab} options={[{ value: "overview", label: "Overview" }, { value: "chart", label: "Chart" }, { value: "orders", label: "Orders" }]} />
      <Label className="mt-5">Timeframe chips</Label>
      <div className="flex gap-1.5">
        {["1m", "5m", "15m", "1H", "4H", "1D"].map((t) => (
          <button key={t} onClick={() => { setTf(t); sfx.tick(); }} className={cn("flex-1 h-9 rounded-xl text-[11.5px] font-extrabold num transition-all", tf === t ? "bg-blue text-white shadow-[0_3px_0_#2250c2] -translate-y-0.5" : "text-mute hover:bg-white/5")}>{t}</button>
        ))}
      </div>
      <Label className="mt-5">Underline tabs</Label>
      <div className="relative flex border-b-2 border-[#1c3068]">
        {lines.map((l, i) => <button key={l} onClick={() => { setLine(i); sfx.tick(); }} className={cn("flex-1 pb-2.5 text-[12.5px] font-extrabold transition-colors", line === i ? "text-txt" : "text-dim hover:text-mute")}>{l}</button>)}
        <span className="absolute -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-blue to-violet transition-all duration-300 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ width: `${100 / lines.length}%`, left: `${(line * 100) / lines.length}%` }} />
      </div>
      <Label className="mt-5">Breadcrumbs</Label>
      <nav className="inset px-3 py-2.5 flex items-center gap-1 flex-wrap text-[12px] font-bold">
        {crumbs.slice(0, crumb + 1).map((c, i) => (
          <span key={c} className="flex items-center gap-1 anim-fade">
            {i > 0 && <Icon name="chevR" size={13} className="text-dim" />}
            <button onClick={() => { setCrumb(i); sfx.tick(); }} className={cn("px-1.5 py-0.5 rounded-md transition", i === crumb ? "text-txt bg-white/5" : "text-blue hover:underline")}>{i === 0 ? <Icon name="home" size={14} /> : c}</button>
          </span>
        ))}
        {crumb < 3 && <button onClick={() => setCrumb(3)} className="ml-auto text-[10px] text-dim hover:text-txt">reset</button>}
      </nav>
    </Asset>
  );
}

/* ---------- Pagination ---------- */
function Pagination() {
  const total = 12;
  const [p, setP] = useState(3);
  const pages = p <= 3 ? [1, 2, 3, 4, "…", total] : p >= total - 2 ? [1, "…", total - 3, total - 2, total - 1, total] : [1, "…", p - 1, p, p + 1, "…", total];
  const go = (n: number) => { setP(Math.max(1, Math.min(total, n))); sfx.tick(); };
  return (
    <Asset title="Pagination & Dots" id="nav.pagination" desc="Умное сжатие страниц, точки-карусель со свайпом.">
      <div className="flex items-center gap-1.5 justify-center flex-wrap">
        <Btn3D size="xs" variant="neutral" disabled={p === 1} onClick={() => go(p - 1)} sound="none"><Icon name="chevL" size={14} stroke={3} /></Btn3D>
        {pages.map((n, i) => n === "…" ? <span key={`e${i}`} className="w-6 text-center text-dim font-bold">…</span> : (
          <Btn3D key={n} size="xs" variant={n === p ? "blue" : "neutral"} onClick={() => go(n as number)} className="!w-9 !px-0 num" sound="none">{n}</Btn3D>
        ))}
        <Btn3D size="xs" variant="neutral" disabled={p === total} onClick={() => go(p + 1)} sound="none"><Icon name="chevR" size={14} stroke={3} /></Btn3D>
      </div>
      <Carousel />
    </Asset>
  );
}
function Carousel() {
  const slides = [
    { g: "rocket" as const, t: "Учись торговать", d: "5 минут в день — и вы понимаете рынок" },
    { g: "shield" as const, t: "Без реального риска", d: "Демо-баланс $10 000 для практики" },
    { g: "crown" as const, t: "Соревнуйся в лигах", d: "Обгони 30 трейдеров и поднимись выше" },
  ];
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const end = () => { if (dx < -50 && i < 2) setI(i + 1); else if (dx > 50 && i > 0) setI(i - 1); if (Math.abs(dx) > 50) sfx.whoosh(); setDx(0); setStart(null); };
  return (
    <div className="mt-6">
      <div className="inset overflow-hidden !rounded-2xl touch-pan-y select-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => setStart(e.clientX)} onPointerMove={(e) => start !== null && setDx(e.clientX - start)} onPointerUp={end} onPointerLeave={() => start !== null && end()}>
        <div className="flex" style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: start !== null ? "none" : "transform .45s cubic-bezier(.3,1.2,.5,1)" }}>
          {slides.map((s) => (
            <div key={s.t} className="w-full shrink-0 p-5 text-center">
              <div className="anim-float inline-block"><Glyph name={s.g} size={52} /></div>
              <div className="font-extrabold mt-2">{s.t}</div>
              <div className="text-[12px] text-mute mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("h-2.5 rounded-full transition-all duration-300", k === i ? "w-7 bg-blue shadow-[0_2px_0_#2250c2]" : "w-2.5 bg-[#22366f] hover:bg-[#2f4890]")} />)}
      </div>
    </div>
  );
}

/* ---------- Process stepper ---------- */
function Process() {
  const steps = [
    { t: "Account", i: "user" }, { t: "Verify", i: "shield" }, { t: "Deposit", i: "wallet" }, { t: "First trade", i: "candles" }, { t: "Certified", i: "trophy" },
  ];
  const [s, setS] = useState(1);
  const go = (n: number) => { setS(Math.max(0, Math.min(5, n))); n > s ? sfx.success() : sfx.tap(); };
  return (
    <Asset title="5-Step Process" id="nav.stepper" desc="Онбординг трейдера. Анимированные коннекторы, тултип текущего шага." className="lg:col-span-2">
      <div className="relative px-2 pt-12 pb-2">
        <div className="absolute left-[10%] right-[10%] top-[74px] h-2 inset !rounded-full" />
        <div className="absolute left-[10%] top-[74px] h-2 rounded-full bg-gradient-to-r from-bull to-cyan transition-all duration-700 ease-[cubic-bezier(.3,1.1,.5,1)] shadow-[0_0_12px_rgba(31,219,139,.5)]" style={{ width: `${(Math.min(s, 4) / 4) * 80}%` }} />
        <div className="relative grid grid-cols-5">
          {steps.map((st, i) => {
            const done = i < s, cur = i === s;
            return (
              <button key={st.t} onClick={() => go(i)} className="flex flex-col items-center gap-2 group">
                <div className="relative">
                  {cur && <span className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-blue text-[10.5px] font-extrabold shadow-[0_3px_0_#2250c2]" style={{ animation: "bob 1.6s ease-in-out infinite" }}>Шаг {i + 1}: {st.t}<i className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 size-2 rotate-45 bg-blue" /></span>}
                  {cur && <span className="absolute inset-0 rounded-full bg-blue/60" style={{ animation: "pulse-ring 1.6s infinite" }} />}
                  <div className={cn("relative size-12 rounded-full grid place-items-center transition-all duration-300 group-hover:-translate-y-0.5",
                    done ? "bg-gradient-to-b from-[#5af5b4] to-[#12c47a] text-ink-900 shadow-[0_4px_0_#0d9a5c]" : cur ? "bg-gradient-to-b from-[#6a9dff] to-[#3d7bff] text-white shadow-[0_4px_0_#2250c2] scale-110" : "bg-[#16275a] text-dim shadow-[0_4px_0_#0b1536]")}>
                    {done ? <Icon name="check" size={22} stroke={3.2} className="anim-pop" /> : <Icon name={st.i} size={20} stroke={2.4} />}
                  </div>
                </div>
                <span className={cn("text-[11px] font-extrabold text-center", done ? "text-bull" : cur ? "text-txt" : "text-dim")}>{st.t}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between items-center mt-5">
        <Btn3D size="sm" variant="neutral" onClick={() => go(s - 1)} disabled={s === 0} icon={<Icon name="chevL" size={15} stroke={3} />}>Back</Btn3D>
        <span className="num text-[12px] text-mute font-bold">{Math.min(s, 5)}/5 · {Math.round((Math.min(s, 5) / 5) * 100)}%</span>
        {s < 5 ? <Btn3D size="sm" variant="bull" onClick={() => go(s + 1)} iconRight={<Icon name="chevR" size={15} stroke={3} />}>Next</Btn3D> : <Tooltip text="Все шаги пройдены!" open><Btn3D size="sm" variant="gold" onClick={() => go(0)}>Restart</Btn3D></Tooltip>}
      </div>
    </Asset>
  );
}

export default function Navigation() {
  return (
    <Section id="navigation" index="03" title="Navigation" subtitle="HUD ресурсов, таб-бар, вкладки, крошки, пагинация и процессы" count={6}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Hud />
        <TabBar />
        <TabsCrumbs />
        <Pagination />
        <Process />
      </div>
    </Section>
  );
}
