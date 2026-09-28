import { useRef, useState, type MouseEvent } from "react";
import { AssetCard, Btn, Icon, Label, ProgressBar, Section } from "../ui/kit";
import { cn } from "../utils/cn";

/* ───────── TAB BAR ───────── */
const TABS = [
  { i: "home", t: "Learn", c: "#2ee59d" }, { i: "chart", t: "Trade", c: "#3d8bff" }, { i: "trophy", t: "League", c: "#ffc53d" },
  { i: "target", t: "Quests", c: "#ff8a3d" }, { i: "user", t: "Profile", c: "#a174ff" },
];
function TabBar() {
  const [a, setA] = useState(0);
  const [dot, setDot] = useState([false, true, false, true, false]);
  return (
    <AssetCard id="NAV-01" title="Bottom Tab Bar" desc="Мобильная навигация: активный таб поднимается 3D-плиткой, индикатор скользит, бейджи-точки гаснут при визите." tags={["tabbar", "navigation", "mobile"]} stageClass="flex flex-col justify-end min-h-[180px]">
      <div className="mb-auto text-center text-sm font-bold text-ink-300">Screen: <span className="font-extrabold" style={{ color: TABS[a].c }}>{TABS[a].t}</span></div>
      <div className="panel relative flex rounded-[26px] p-2">
        <div className="absolute bottom-2 top-2 rounded-[18px] transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]"
          style={{ left: `calc(${a * 20}% + 8px)`, width: "calc(20% - 16px)", background: `${TABS[a].c}22`, boxShadow: `inset 0 0 0 2px ${TABS[a].c}88, 0 0 20px ${TABS[a].c}33` }} />
        {TABS.map((t, i) => (
          <button key={t.t} onClick={() => { setA(i); setDot(dot.map((d, j) => (j === i ? false : d))); }} className="relative z-10 flex flex-1 flex-col items-center gap-0.5 py-2">
            <span className={cn("relative transition-transform duration-300", a === i && "-translate-y-0.5 scale-110")}>
              <Icon name={t.i} size={24} variant={a === i ? "duo" : "line"} style={{ color: a === i ? t.c : "#5a70ad" }} />
              {dot[i] && <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-bear ring-2 ring-ink-700" />}
            </span>
            <span className={cn("text-[10px] font-extrabold uppercase tracking-wider transition-colors")} style={{ color: a === i ? t.c : "#5a70ad" }}>{t.t}</span>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

/* ───────── TOP HUD ───────── */
function TopHud() {
  const [open, setOpen] = useState<null | "hearts" | "asset">(null);
  const [asset, setAsset] = useState("BTC");
  return (
    <AssetCard id="NAV-02" title="Top HUD Bar" desc="Верхняя панель с курсом, стриком, гемами и жизнями. Поповеры по тапу с анимацией." tags={["hud", "header", "popover"]} stageClass="min-h-[260px]">
      <div className="relative flex items-center justify-between rounded-2xl bg-ink-800/80 px-3 py-2.5">
        <button onClick={() => setOpen(open === "asset" ? null : "asset")} className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-white/5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-b from-[#ffb547] to-[#f7931a] text-xs font-extrabold text-white shadow-[0_2px_0_#b36200]">{asset[0]}</span>
          <Icon name="chevD" size={14} className={cn("text-ink-400 transition-transform", open === "asset" && "rotate-180")} />
        </button>
        <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-flame"><Icon name="flame" size={20} variant="solid" className="anim-flame" />27</span>
        <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-violet"><Icon name="gem" size={18} variant="solid" />1,240</span>
        <button onClick={() => setOpen(open === "hearts" ? null : "hearts")} className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={20} variant="solid" className="anim-heartbeat" />3</button>
        {open === "hearts" && (
          <div className="glass absolute right-0 top-14 z-20 w-64 rounded-2xl p-4" style={{ animation: "scaleIn .25s cubic-bezier(.3,1.4,.5,1) both", transformOrigin: "top right" }}>
            <div className="mb-2 flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="heart" size={26} variant={i < 3 ? "solid" : "line"} className={i < 3 ? "text-bear" : "text-ink-500"} />)}</div>
            <div className="text-sm font-extrabold text-white">Next heart in 3:42</div>
            <div className="mb-3 text-xs text-ink-300">Ошибки стоят жизней — как и в реальном трейдинге.</div>
            <div className="space-y-2">
              <Btn v="violet" size="sm" block><Icon name="gem" size={14} />Refill · 350</Btn>
              <Btn v="ghost" size="sm" block onClick={() => setOpen(null)}>Practice to earn</Btn>
            </div>
          </div>
        )}
        {open === "asset" && (
          <div className="glass absolute left-0 top-14 z-20 w-52 rounded-2xl p-2" style={{ animation: "scaleIn .25s cubic-bezier(.3,1.4,.5,1) both", transformOrigin: "top left" }}>
            {["BTC", "ETH", "SOL", "TON"].map((a) => (
              <button key={a} onClick={() => { setAsset(a); setOpen(null); }} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-extrabold", asset === a ? "bg-sky/20 text-white" : "text-ink-200 hover:bg-white/5")}>
                {a} course {asset === a && <Icon name="check" size={16} stroke={3} className="text-sky" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <Label className="mt-5">Lesson header</Label>
      <div className="flex items-center gap-3">
        <Icon name="x" size={22} className="text-ink-400" />
        <ProgressBar value={62} h={16} className="flex-1" />
        <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={20} variant="solid" />3</span>
      </div>
    </AssetCard>
  );
}

/* ───────── STEPPER ───────── */
const STEPS = [
  { i: "user", t: "Profile", d: "Как тебя зовут?" }, { i: "target", t: "Goal", d: "Цель: 10 мин / день" }, { i: "shield", t: "Risk", d: "Твой риск-профиль" },
  { i: "wallet", t: "Demo $", d: "$10,000 демо-баланс" }, { i: "rocket", t: "Launch", d: "Первый урок!" },
];
function Stepper() {
  const [s, setS] = useState(2);
  return (
    <AssetCard id="NAV-03" title="Onboarding Stepper" desc="5-шаговый процесс: пройденные шаги светятся, текущий пульсирует с тултипом. Клик по пройденному — назад." tags={["stepper", "process", "onboarding"]}>
      <div className="relative mt-10 flex items-center justify-between px-1">
        <div className="well absolute left-6 right-6 top-1/2 h-2 -translate-y-1/2 rounded-full" />
        <div className="absolute left-6 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky to-bull transition-all duration-500" style={{ width: `calc(${(s / (STEPS.length - 1)) * 100}% - ${(s / (STEPS.length - 1)) * 48}px)`, boxShadow: "0 0 12px #2ee59d88" }} />
        {STEPS.map((st, i) => (
          <button key={st.t} onClick={() => i <= s && setS(i)} className="relative z-10">
            {i === s && (
              <div className="absolute -top-11 left-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-ink-900 shadow-[0_3px_0_#c3cdea]" style={{ animation: "bob 1.6s ease-in-out infinite" }}>
                {st.d}<span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
              </div>
            )}
            {i === s && <span className="absolute inset-0 rounded-full border-2 border-bull" style={{ animation: "pulseRing 1.6s infinite" }} />}
            <span className={cn("grid h-11 w-11 place-items-center rounded-full transition-all duration-300",
              i < s ? "bg-bull shadow-[0_4px_0_#12a46a]" : i === s ? "scale-110 bg-gradient-to-b from-sky to-sky-edge shadow-[0_4px_0_#123a8f,0_0_18px_#3d8bff]" : "raised")}>
              <Icon name={i < s ? "check" : st.i} size={18} stroke={i < s ? 3.4 : 2.2} className={i < s ? "text-ink-900" : i === s ? "text-white" : "text-ink-400"} />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-between px-1">{STEPS.map((st, i) => <span key={st.t} className={cn("w-11 text-center text-[10px] font-extrabold", i <= s ? "text-ink-100" : "text-ink-500")}>{st.t}</span>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Btn v="ghost" size="sm" disabled={s === 0} onClick={() => setS(s - 1)}><Icon name="chevL" size={14} stroke={3} />Back</Btn>
        <Btn v={s === STEPS.length - 1 ? "bull" : "sky"} size="sm" onClick={() => setS(s === STEPS.length - 1 ? 0 : s + 1)}>{s === STEPS.length - 1 ? "Start!" : "Next"}<Icon name="chevR" size={14} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── CAROUSEL ───────── */
const COURSES = [
  { t: "Crypto Basics", s: "12 уроков · Beginner", i: "coin", g: ["#2ee59d", "#0b7a4d"], p: 100 },
  { t: "Technical Analysis", s: "24 урока · Intermediate", i: "candle", g: ["#3d8bff", "#1a3aa0"], p: 45 },
  { t: "Risk Management", s: "16 уроков · Core", i: "shield", g: ["#ffc53d", "#a86d00"], p: 10 },
  { t: "DeFi & On-chain", s: "20 уроков · PRO", i: "gem", g: ["#a174ff", "#4a24a8"], p: 0 },
];
function Carousel() {
  const [i, setI] = useState(1);
  const drag = useRef<number | null>(null);
  const go = (d: number) => setI((x) => Math.max(0, Math.min(COURSES.length - 1, x + d)));
  return (
    <AssetCard id="NAV-04" title="Course Carousel" desc="Карусель курсов с перспективой, свайпом мышью/пальцем и точками-пагинацией." tags={["carousel", "pagination", "swipe"]} stageClass="overflow-hidden">
      <div className="relative h-48 select-none" style={{ perspective: 900 }}
        onPointerDown={(e) => (drag.current = e.clientX)} onPointerUp={(e) => { if (drag.current !== null) { const dx = e.clientX - drag.current; if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1); } drag.current = null; }}>
        {COURSES.map((c, k) => {
          const off = k - i;
          return (
            <div key={c.t} onClick={() => setI(k)} className="absolute left-1/2 top-2 h-44 w-44 cursor-pointer rounded-3xl p-4 transition-all duration-500 ease-[cubic-bezier(.3,1.2,.5,1)]"
              style={{
                transform: `translateX(calc(-50% + ${off * 150}px)) scale(${off === 0 ? 1 : 0.8}) rotateY(${off * -18}deg)`, opacity: Math.abs(off) > 1 ? 0 : off === 0 ? 1 : 0.55, zIndex: 10 - Math.abs(off),
                background: `linear-gradient(160deg, ${c.g[0]}, ${c.g[1]})`, boxShadow: `0 6px 0 ${c.g[1]}, 0 20px 30px -10px #000c, inset 0 1px 0 #fff5`,
              }}>
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15" />
              <Icon name={c.i} size={36} variant="duo" className="text-white" />
              <div className="mt-6 text-base font-extrabold leading-tight text-white text-3d">{c.t}</div>
              <div className="text-[11px] font-bold text-white/80">{c.s}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-white" style={{ width: `${c.p}%` }} /></div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Btn v="dark" size="icon" onClick={() => go(-1)} disabled={i === 0}><Icon name="chevL" size={18} stroke={3} /></Btn>
        <div className="flex gap-2">
          {COURSES.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("h-2.5 rounded-full transition-all duration-300", k === i ? "w-7 bg-sky shadow-[0_0_10px_#3d8bff]" : "w-2.5 bg-ink-600 hover:bg-ink-500")} />)}
        </div>
        <Btn v="dark" size="icon" onClick={() => go(1)} disabled={i === COURSES.length - 1}><Icon name="chevR" size={18} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── CHIPS & BADGES ───────── */
function Chips() {
  const all = ["Bitcoin", "Altcoins", "DeFi", "NFT", "Futures", "Macro", "On-chain"];
  const [sel, setSel] = useState(["Bitcoin", "DeFi"]);
  return (
    <AssetCard id="DAT-01" title="Chips, Badges & Pills" desc="Мультивыбор фильтров, статусные бейджи, промо-метки с шайном." tags={["chips", "badges", "tags", "filter"]}>
      <Label>Filter chips · {sel.length} selected</Label>
      <div className="flex flex-wrap gap-2">
        {all.map((c) => {
          const on = sel.includes(c);
          return (
            <button key={c} onClick={() => setSel(on ? sel.filter((x) => x !== c) : [...sel, c])}
              className={cn("flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-all duration-150 active:translate-y-0.5",
                on ? "border-sky bg-sky/20 text-white shadow-[0_3px_0_#1e56c9]" : "border-ink-600 bg-ink-800 text-ink-300 shadow-[0_3px_0_#0b1638] hover:border-ink-500")}>
              {on && <Icon name="check" size={12} stroke={3.4} className="anim-pop text-sky" />}{c}
            </button>
          );
        })}
      </div>
      <Label className="mt-5">Status badges</Label>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-bull px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink-900 shadow-[0_2px_0_#12a46a]">New</span>
        <span className="relative overflow-hidden rounded-lg bg-gradient-to-r from-violet to-sky px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-[0_2px_0_#4a24a8]">PRO<span className="absolute inset-y-0 w-4 -skew-x-12 bg-white/50" style={{ animation: "shine 2s ease-in-out infinite", left: "-30%" }} /></span>
        <span className="rounded-lg bg-flame px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-[0_2px_0_#d9531a]">🔥 Hot</span>
        <span className="rounded-lg bg-gold px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink-900 shadow-[0_2px_0_#cc8a00]">−20%</span>
        <span className="rounded-lg bg-ink-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink-300">Draft</span>
      </div>
      <Label className="mt-5">Market pills</Label>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 rounded-full bg-bull/15 px-2.5 py-1 font-mono text-xs font-extrabold text-bull ring-1 ring-bull/40"><Icon name="trendUp" size={14} stroke={2.8} />+4.21%</span>
        <span className="flex items-center gap-1 rounded-full bg-bear/15 px-2.5 py-1 font-mono text-xs font-extrabold text-bear ring-1 ring-bear/40"><Icon name="trendDown" size={14} stroke={2.8} />−1.87%</span>
        <span className="flex items-center gap-1.5 rounded-full bg-ink-800 px-2.5 py-1 text-xs font-extrabold text-ink-200"><span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-bull" style={{ animation: "pulseRing 1.4s infinite" }} /><span className="relative h-2 w-2 rounded-full bg-bull" /></span>Market open</span>
      </div>
    </AssetCard>
  );
}

/* ───────── AVATARS ───────── */
const PEOPLE = [
  { n: "Alex", c: ["#2ee59d", "#0b7a4d"], s: "online", lvl: 24 }, { n: "Mira", c: ["#a174ff", "#4a24a8"], s: "trading", lvl: 41 },
  { n: "Kai", c: ["#ffc53d", "#a86d00"], s: "away", lvl: 8 }, { n: "Zoe", c: ["#ff4d6a", "#9c1735"], s: "offline", lvl: 15 }, { n: "Leo", c: ["#3d8bff", "#1a3aa0"], s: "online", lvl: 33 },
];
function Avatars() {
  const [exp, setExp] = useState(false);
  const [sel, setSel] = useState(1);
  const stat: Record<string, string> = { online: "#2ee59d", trading: "#3d8bff", away: "#ffc53d", offline: "#5a70ad" };
  return (
    <AssetCard id="DAT-02" title="Avatars & Presence" desc="Аватары с кольцом уровня, статусом присутствия, раскрывающаяся группа и профиль-превью." tags={["avatar", "presence", "social"]}>
      <div className="flex items-end justify-between">
        {PEOPLE.map((p, i) => (
          <button key={p.n} onClick={() => setSel(i)} className="flex flex-col items-center gap-1.5">
            <div className={cn("relative rounded-full p-[3px] transition-transform", sel === i && "scale-110")} style={{ background: sel === i ? `conic-gradient(${p.c[0]} ${p.lvl * 2}%, #22376f 0)` : "transparent" }}>
              <div className="grid h-12 w-12 place-items-center rounded-full text-base font-extrabold text-white ring-[3px] ring-ink-900" style={{ background: `linear-gradient(160deg, ${p.c[0]}, ${p.c[1]})` }}>{p.n[0]}</div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-[3px] ring-ink-900" style={{ background: stat[p.s], boxShadow: p.s !== "offline" ? `0 0 8px ${stat[p.s]}` : undefined }} />
            </div>
            <span className="text-[10px] font-bold text-ink-300">{p.n}</span>
          </button>
        ))}
      </div>
      <div key={sel} className="raised anim-fade-up mt-4 flex items-center gap-3 rounded-2xl p-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-extrabold text-white" style={{ background: `linear-gradient(160deg, ${PEOPLE[sel].c[0]}, ${PEOPLE[sel].c[1]})` }}>{PEOPLE[sel].n[0]}</div>
        <div className="flex-1"><div className="text-sm font-extrabold text-white">{PEOPLE[sel].n}</div><div className="text-xs capitalize" style={{ color: stat[PEOPLE[sel].s] }}>● {PEOPLE[sel].s}</div></div>
        <span className="rounded-lg bg-gold/15 px-2 py-1 font-mono text-xs font-extrabold text-gold">LVL {PEOPLE[sel].lvl}</span>
      </div>
      <Label className="mt-4">Group · hover/tap to expand</Label>
      <button onClick={() => setExp(!exp)} onMouseEnter={() => setExp(true)} onMouseLeave={() => setExp(false)} className="flex items-center">
        {PEOPLE.map((p, i) => (
          <span key={p.n} className="grid h-10 w-10 place-items-center rounded-full text-sm font-extrabold text-white ring-[3px] ring-ink-900 transition-all duration-300" style={{ background: `linear-gradient(160deg, ${p.c[0]}, ${p.c[1]})`, marginLeft: i ? (exp ? 6 : -14) : 0, zIndex: 10 - i }}>{p.n[0]}</span>
        ))}
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-600 font-mono text-xs font-extrabold text-ink-200 ring-[3px] ring-ink-900 transition-all duration-300" style={{ marginLeft: exp ? 6 : -14 }}>+8</span>
      </button>
    </AssetCard>
  );
}

/* ───────── TILT CARD ───────── */
function TiltCard() {
  const [t, setT] = useState({ x: 0, y: 0, h: false });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setT({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2, h: true });
  };
  return (
    <AssetCard id="DAT-03" title="Course Cards · 3D Tilt" desc="Карточки курса с параллакс-наклоном, бликом за курсором, прогрессом и PRO-замком." tags={["card", "tilt", "parallax"]}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
        <div style={{ perspective: 800 }} onMouseMove={onMove} onMouseLeave={() => setT({ x: 0, y: 0, h: false })}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky to-sky-edge p-4 transition-transform duration-200 ease-out"
            style={{ transform: `rotateY(${t.x * 10}deg) rotateX(${-t.y * 10}deg) translateZ(0)`, boxShadow: "0 6px 0 #123a8f, 0 24px 40px -12px #000c, inset 0 1px 0 #fff6" }}>
            <div className="pointer-events-none absolute inset-0 transition-opacity" style={{ opacity: t.h ? 1 : 0, background: `radial-gradient(220px circle at ${(t.x + 1) * 50}% ${(t.y + 1) * 50}%, #ffffff40, transparent 60%)` }} />
            <div className="flex items-start justify-between" style={{ transform: `translateX(${t.x * 6}px) translateY(${t.y * 6}px)` }}>
              <Icon name="candle" size={40} variant="duo" className="text-white" />
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Unit 3</span>
            </div>
            <div className="mt-6 text-lg font-extrabold text-white text-3d">Chart Patterns</div>
            <div className="text-xs font-bold text-white/80">8 из 14 уроков</div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/25"><div className="h-full w-[57%] rounded-full bg-white" /></div>
            <Btn v="gold" size="sm" block className="mt-4">Continue</Btn>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-ink-700 p-4 shadow-[0_6px_0_#0b1638]">
          <div className="absolute inset-0 grid place-items-center bg-ink-900/60 backdrop-blur-[2px]">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-violet to-violet-edge shadow-[0_4px_0_#4a24a8]"><Icon name="lock" size={22} className="text-white" /></div>
              <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-violet">PRO</div>
            </div>
          </div>
          <Icon name="gem" size={36} variant="duo" className="text-violet" />
          <div className="mt-6 text-base font-extrabold text-white">DeFi Yield</div>
          <div className="text-xs text-ink-400">20 уроков</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ───────── LIST / ACCORDION ───────── */
function ListItems() {
  const [open, setOpen] = useState<number | null>(0);
  const [sw, setSw] = useState([true, false]);
  const items = [
    { i: "book", c: "text-sky", t: "Что такое спред?", s: "Glossary · 2 min", body: "Спред — разница между лучшей ценой покупки и продажи. Чем он уже, тем выше ликвидность." },
    { i: "shield", c: "text-bull", t: "Правило 1%", s: "Risk · 3 min", body: "Никогда не рискуй больше 1% депозита в одной сделке. Так серия убытков не уничтожит счёт." },
    { i: "news", c: "text-gold", t: "Halving explained", s: "News · 4 min", body: "Каждые ~4 года награда майнерам BTC уменьшается вдвое, сокращая новое предложение." },
  ];
  return (
    <AssetCard id="DAT-04" title="List Items & Accordion" desc="Строки со вторичным текстом, раскрытие с плавной высотой, строки-настройки со свитчами." tags={["list", "accordion", "settings"]}>
      <div className="space-y-2">
        {items.map((it, k) => (
          <div key={it.t} className={cn("overflow-hidden rounded-2xl transition-colors", open === k ? "raised" : "bg-ink-800/60")}>
            <button onClick={() => setOpen(open === k ? null : k)} className="flex w-full items-center gap-3 p-3 text-left">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/60"><Icon name={it.i} size={20} variant="duo" className={it.c} /></span>
              <div className="flex-1"><div className="text-sm font-extrabold text-white">{it.t}</div><div className="text-[11px] text-ink-400">{it.s}</div></div>
              <Icon name="chevD" size={18} className={cn("text-ink-400 transition-transform duration-300", open === k && "rotate-180")} />
            </button>
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open === k ? "1fr" : "0fr" }}>
              <div className="overflow-hidden"><p className="px-3 pb-3 pl-16 text-xs leading-relaxed text-ink-200">{it.body}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 divide-y divide-white/5 rounded-2xl bg-ink-800/60">
        {["Push-уведомления", "Тактильный отклик"].map((l, k) => (
          <button key={l} onClick={() => setSw(sw.map((x, j) => (j === k ? !x : x)))} className="flex w-full items-center justify-between p-3">
            <span className="text-sm font-bold text-ink-100">{l}</span>
            <span className={cn("relative h-7 w-12 rounded-full transition-colors", sw[k] ? "bg-bull" : "well")}>
              <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_0_#8fa0cf] transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]", sw[k] ? "left-6" : "left-1")} />
            </span>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

/* ───────── TABLE ───────── */
const TBL = [
  { a: "BTC", p: 64250, c: 2.41, v: 28.4 }, { a: "ETH", p: 3412, c: -1.12, v: 14.1 }, { a: "SOL", p: 148.2, c: 6.8, v: 3.9 }, { a: "TON", p: 6.84, c: 0.42, v: 0.6 }, { a: "ADA", p: 0.45, c: -3.2, v: 0.4 },
];
function Table() {
  const [sort, setSort] = useState<{ k: "a" | "p" | "c" | "v"; d: 1 | -1 }>({ k: "c", d: -1 });
  const rows = [...TBL].sort((x, y) => (x[sort.k] > y[sort.k] ? 1 : -1) * sort.d);
  const H = ({ k, t, right }: { k: typeof sort.k; t: string; right?: boolean }) => (
    <button onClick={() => setSort({ k, d: sort.k === k ? (sort.d === 1 ? -1 : 1) : -1 })} className={cn("flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest transition-colors", right && "justify-end", sort.k === k ? "text-sky" : "text-ink-400 hover:text-ink-200")}>
      {t}<Icon name={sort.k === k ? (sort.d === 1 ? "chevU" : "chevD") : "sort"} size={12} stroke={3} />
    </button>
  );
  return (
    <AssetCard id="DAT-05" title="Sortable Market Table" desc="Компактная таблица: сортировка по любому столбцу с анимированной перестановкой." tags={["table", "sort", "data"]}>
      <div className="raised mb-1 grid grid-cols-4 gap-2 rounded-xl px-3 py-2.5">
        <H k="a" t="Asset" /><H k="p" t="Price" right /><H k="c" t="24h" right /><H k="v" t="Vol $B" right />
      </div>
      <div className="relative" style={{ height: rows.length * 40 }}>
        {TBL.map((r) => {
          const idx = rows.indexOf(r);
          return (
            <div key={r.a} className="absolute inset-x-0 grid h-10 grid-cols-4 items-center gap-2 rounded-lg px-3 transition-all duration-500 ease-[cubic-bezier(.3,1.2,.5,1)] hover:bg-white/[.03]" style={{ top: idx * 40 }}>
              <span className="text-sm font-extrabold text-white">{r.a}</span>
              <span className="text-right font-mono text-xs font-bold text-ink-200">{r.p < 1 ? r.p.toFixed(3) : r.p.toLocaleString()}</span>
              <span className={cn("text-right font-mono text-xs font-extrabold", r.c >= 0 ? "text-bull" : "text-bear")}>{r.c >= 0 ? "+" : ""}{r.c}%</span>
              <span className="text-right font-mono text-xs font-bold text-ink-300">{r.v}</span>
            </div>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ───────── TOOLTIPS ───────── */
function Term({ t, def }: { t: string; def: string }) {
  const [o, setO] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)} onClick={() => setO(!o)}>
      <span className="cursor-help border-b-2 border-dotted border-sky font-extrabold text-sky">{t}</span>
      {o && (
        <span className="glass absolute bottom-full left-1/2 z-30 mb-2 block w-52 -translate-x-1/2 rounded-xl p-3 text-left text-xs font-semibold normal-case leading-snug text-ink-100" style={{ animation: "scaleIn .2s cubic-bezier(.3,1.4,.5,1) both", transformOrigin: "bottom center" }}>
          <span className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-sky"><Icon name="book" size={12} />Glossary</span>
          {def}
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink-700" />
        </span>
      )}
    </span>
  );
}
function Tooltips() {
  const [pos, setPos] = useState<"top" | "right" | "bottom" | "left">("top");
  const place = { top: "bottom-full mb-3 left-1/2 -translate-x-1/2", bottom: "top-full mt-3 left-1/2 -translate-x-1/2", left: "right-full mr-3 top-1/2 -translate-y-1/2", right: "left-full ml-3 top-1/2 -translate-y-1/2" }[pos];
  return (
    <AssetCard id="DAT-06" title="Tooltips & Glossary" desc="Встроенный глоссарий: термины в тексте раскрывают определения. 4 позиции тултипа." tags={["tooltip", "glossary", "popover"]}>
      <p className="text-sm leading-relaxed text-ink-200">
        Перед входом поставь <Term t="стоп-лосс" def="Ордер, автоматически закрывающий позицию при достижении заданного убытка." />, оцени <Term t="волатильность" def="Мера того, насколько сильно и быстро меняется цена актива." /> и не забывай про <Term t="ликвидацию" def="Принудительное закрытие позиции с плечом, когда маржи недостаточно." />.
      </p>
      <div className="relative mt-10 mb-8 grid place-items-center">
        <div className="relative">
          <Btn v="ghost" size="sm"><Icon name="info" size={14} />More info</Btn>
          <span key={pos} className={cn("absolute z-10 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-ink-900 shadow-[0_3px_0_#c3cdea] anim-pop", place)}>Tooltip · {pos}</span>
        </div>
      </div>
      <div className="well flex rounded-xl p-1">
        {(["top", "right", "bottom", "left"] as const).map((p) => (
          <button key={p} onClick={() => setPos(p)} className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-extrabold uppercase", pos === p ? "raised text-white" : "text-ink-400")}>{p}</button>
        ))}
      </div>
    </AssetCard>
  );
}

export default function NavData() {
  return (
    <>
      <Section id="navigation" num="05" title="Navigation" subtitle="Перемещение по приложению — быстро, понятно, с тактильным откликом">
        <TabBar />
        <TopHud />
        <Stepper />
        <Carousel />
      </Section>
      <div className="h-16" />
      <Section id="data" num="06" title="Data Display" subtitle="Карточки, списки, бейджи, аватары, таблицы и подсказки">
        <Chips />
        <Avatars />
        <TiltCard />
        <ListItems />
        <Table />
        <Tooltips />
      </Section>
    </>
  );
}
