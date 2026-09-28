import { useRef, useState, type ReactNode } from "react";
import { Asset, Bar, Btn3D, Confetti, CountUp, FloatText, Label, Ring, Section, Avatar, Badge, useFloat, useToast } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* hexagon with lip */
export function Hex({ children, from, to, lip, size = 72, className, dim }: { children: ReactNode; from: string; to: string; lip: string; size?: number; className?: string; dim?: boolean }) {
  const clip = "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size * 1.08 }}>
      <div className="absolute inset-0 translate-y-[5px]" style={{ clipPath: clip, background: dim ? "#0b1536" : lip }} />
      <div className="absolute inset-0 grid place-items-center overflow-hidden" style={{ clipPath: clip, background: dim ? "linear-gradient(180deg,#1f3163,#172656)" : `linear-gradient(180deg, ${from}, ${to})` }}>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        {!dim && <div className="shine absolute inset-0" />}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

/* ---------- XP & Level ---------- */
function XpLevel() {
  const [lvl, setLvl] = useState(7);
  const [xp, setXp] = useState(60);
  const [fire, setFire] = useState(0);
  const [lvUp, setLvUp] = useState(false);
  const [fl, add] = useFloat();
  const gain = (n: number) => {
    add(`+${n} XP`, "#ffc53d");
    sfx.coin();
    const nx = xp + n;
    if (nx >= 100) { setXp(100); setTimeout(() => { setLvl((l) => l + 1); setXp(nx - 100); setLvUp(true); setFire(Date.now()); sfx.levelUp(); haptic([30, 40, 60]); }, 650); }
    else setXp(nx);
  };
  return (
    <Asset title="XP & Level Up" id="gam.xp" desc="Начисление XP с «всплывающими» цифрами. Переполнение → Level Up с конфетти.">
      <div className="relative">
        <Confetti fire={fire} count={60} />
        <div className="flex items-center gap-4">
          <Hex from="#ab86ff" to="#6f3cf0" lip="#4a22b0" size={70}><span key={lvl} className="text-[26px] font-extrabold num anim-pop drop-shadow">{lvl}</span></Hex>
          <div className="flex-1 relative">
            <FloatText items={fl} />
            <div className="flex justify-between items-baseline mb-1.5"><span className="font-extrabold text-[14px]">Level {lvl} · Analyst</span><span className="num text-[11px] text-mute">{Math.round(xp)}/100</span></div>
            <Bar value={xp} tone="gold" h={16} />
            <div className="text-[11px] text-dim mt-1.5">До Level {lvl + 1}: <span className="text-gold font-bold num">{100 - Math.round(xp)} XP</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Btn3D size="sm" variant="neutral" onClick={() => gain(10)} sound="none">+10</Btn3D>
          <Btn3D size="sm" variant="gold" onClick={() => gain(25)} sound="none">+25</Btn3D>
          <Btn3D size="sm" variant="violet" onClick={() => gain(60)} sound="none">+60</Btn3D>
        </div>
        {lvUp && (
          <div className="absolute inset-[-8px] rounded-2xl bg-ink-900/90 backdrop-blur-sm grid place-items-center z-40 anim-fade">
            <div className="text-center anim-scale">
              <div className="relative inline-block">
                <div className="absolute inset-[-30px] rounded-full opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, rgba(141,92,255,.5) 0 10deg, transparent 10deg 20deg)", animation: "ray 8s linear infinite", maskImage: "radial-gradient(circle, #000 30%, transparent 70%)" }} />
                <Hex from="#ffdc7a" to="#f0a811" lip="#b8780a" size={84}><span className="text-[32px] font-extrabold num text-[#3a2400]">{lvl}</span></Hex>
              </div>
              <div className="text-[22px] font-extrabold mt-3 tracking-tight">LEVEL UP!</div>
              <div className="text-[12px] text-mute mb-3">Открыт урок «Фибоначчи» · +100 💎</div>
              <Btn3D size="sm" variant="bull" onClick={() => setLvUp(false)}>Continue</Btn3D>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ---------- Streak ---------- */
function Streak() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const [done, setDone] = useState([true, true, true, true, false, false, false]);
  const [streak, setStreak] = useState(46);
  const [freeze, setFreeze] = useState(2);
  const [ignite, setIgnite] = useState(false);
  const today = done.findIndex((d) => !d);
  const complete = () => {
    if (today < 0) return;
    const n = [...done]; n[today] = true; setDone(n); setStreak(streak + 1); setIgnite(true); sfx.success(); haptic([20, 30, 50]);
    setTimeout(() => setIgnite(false), 900);
  };
  return (
    <Asset title="Streak Tracker" id="gam.streak" desc="Разжигание пламени, неделя серии, заморозки.">
      <div className="flex items-center gap-4 mb-5">
        <div className={cn("relative", ignite && "anim-pop")}>
          <div className="absolute inset-0 blur-xl bg-[#ff7a2e]/50 rounded-full" />
          <div className="relative anim-flicker"><Glyph name="flame" size={64} /></div>
        </div>
        <div>
          <CountUp value={streak} className="text-[40px] font-extrabold leading-none text-[#ff9a3d]" />
          <div className="text-[13px] font-extrabold text-mute">дней подряд</div>
        </div>
      </div>
      <div className="inset p-3 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-1.5">
            <span className={cn("text-[10px] font-extrabold", i === today ? "text-[#ff9a3d]" : "text-dim")}>{d}</span>
            <div className={cn("size-9 rounded-full grid place-items-center transition-all duration-300", done[i] ? "bg-gradient-to-b from-[#ffb347] to-[#ff6a1f] shadow-[0_3px_0_#b8420a]" : i === today ? "border-2 border-dashed border-[#ff9a3d]/70" : "bg-[#16275a]")}>
              {done[i] && <Icon name="check" size={16} stroke={3.4} className="text-white anim-pop" />}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Btn3D size="sm" variant="gold" full onClick={complete} disabled={today < 0} icon={<Glyph name="flame" size={18} />} sound="none">{today < 0 ? "Неделя закрыта" : "Урок дня"}</Btn3D>
        <Btn3D size="sm" variant="cyan" onClick={() => setFreeze(Math.max(0, freeze - 1))} disabled={!freeze} className="shrink-0">❄ {freeze}</Btn3D>
      </div>
    </Asset>
  );
}

/* ---------- Daily goal ---------- */
function DailyGoal() {
  const [goal, setGoal] = useState(30);
  const [xp, setXp] = useState(18);
  const pct = Math.min(100, (xp / goal) * 100);
  const [fire, setFire] = useState(0);
  const add = () => { const n = xp + 6; setXp(n); sfx.coin(); if (n >= goal && xp < goal) { setFire(Date.now()); sfx.levelUp(); } };
  return (
    <Asset title="Daily Goal Ring" id="gam.goal" desc="Выберите цель; кольцо заполняется с пружиной.">
      <div className="relative flex flex-col items-center">
        <Confetti fire={fire} />
        <Ring value={pct} size={140} stroke={14} tone={pct >= 100 ? "#1fdb8b" : "#ffc53d"} tone2={pct >= 100 ? "#2ed3f0" : "#ff8a3d"}>
          <div className="text-center">
            {pct >= 100 ? <span className="anim-pop inline-block"><Glyph name="star" size={40} /></span> : <><CountUp value={xp} className="text-[28px] font-extrabold" /><div className="text-[10px] text-dim font-extrabold num">/ {goal} XP</div></>}
          </div>
        </Ring>
        <div className="grid grid-cols-4 gap-1.5 w-full mt-5">
          {[10, 20, 30, 50].map((g) => (
            <button key={g} onClick={() => { setGoal(g); sfx.tick(); }} className="opt h-11 flex flex-col items-center justify-center" data-state={goal === g ? "selected" : undefined}>
              <span className="num text-[13px] font-extrabold">{g}</span>
              <span className="text-[8.5px] font-extrabold uppercase opacity-70">{({ 10: "Casual", 20: "Regular", 30: "Serious", 50: "Insane" } as Record<number, string>)[g]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full mt-4">
          <Btn3D size="sm" full variant="blue" onClick={add} sound="none">+6 XP</Btn3D>
          <Btn3D size="sm" variant="neutral" onClick={() => setXp(0)}><Icon name="refresh" size={15} /></Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Achievements ---------- */
const ACH = [
  { n: "Diamond Hands", d: "Держать позицию 30 дней", g: "gem" as const, c: ["#7fe3ff", "#2e7bff", "#1a4fc0"], p: 100 },
  { n: "Bull Run", d: "10 прибыльных сделок подряд", g: "rocket" as const, c: ["#5af5b4", "#12c47a", "#0a8a52"], p: 100 },
  { n: "Risk Manager", d: "Ставить стоп-лосс 50 раз", g: "shield" as const, c: ["#ffdc7a", "#f0a811", "#b8780a"], p: 72 },
  { n: "Chart Wizard", d: "Пройти все уроки TA", g: "star" as const, c: ["#ab86ff", "#6f3cf0", "#4a22b0"], p: 40 },
  { n: "Whale", d: "Портфель $100k (демо)", g: "crown" as const, c: ["#ff9ab0", "#e3304f", "#9e1a31"], p: 12 },
  { n: "On Fire", d: "Серия 100 дней", g: "flame" as const, c: ["#ffc07a", "#ff6a1f", "#b8420a"], p: 47 },
];
function TiltBadge({ a, onClick }: { a: (typeof ACH)[0]; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const unlocked = a.p >= 100;
  return (
    <button ref={ref} onClick={onClick}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setT({ x: ((e.clientY - r.top) / r.height - 0.5) * -24, y: ((e.clientX - r.left) / r.width - 0.5) * 24 }); }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      className="flex flex-col items-center text-center group" style={{ perspective: 500 }}>
      <div className="transition-transform duration-150" style={{ transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)` }}>
        <Hex from={a.c[0]} to={a.c[1]} lip={a.c[2]} size={76} dim={!unlocked}>
          {unlocked ? <Glyph name={a.g} size={36} /> : <div className="relative"><Glyph name={a.g} size={34} dim /><Icon name="lock" size={16} stroke={2.6} className="absolute -bottom-1 -right-2 text-mute" /></div>}
        </Hex>
      </div>
      <div className={cn("text-[12px] font-extrabold mt-2", unlocked ? "text-txt" : "text-mute")}>{a.n}</div>
      {unlocked ? <Badge tone="bull" size="xs" className="mt-1">Получено</Badge> : (
        <div className="w-20 mt-1.5"><div className="h-1.5 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue to-violet transition-all duration-700" style={{ width: `${a.p}%` }} /></div><div className="num text-[9.5px] text-dim mt-0.5">{a.p}%</div></div>
      )}
    </button>
  );
}
function Achievements() {
  const [list, setList] = useState(ACH);
  const [sel, setSel] = useState<number | null>(null);
  const [fire, setFire] = useState(0);
  const toast = useToast();
  const progress = (i: number) => {
    setSel(i);
    const a = list[i];
    if (a.p >= 100) { sfx.pop(); return; }
    const np = Math.min(100, a.p + 30);
    setList(list.map((x, k) => (k === i ? { ...x, p: np } : x)));
    if (np >= 100) { setFire(Date.now()); sfx.levelUp(); toast({ type: "xp", title: `Достижение: ${a.n}`, msg: "+250 XP · +50 💎" }); } else sfx.tap();
  };
  const s = sel !== null ? list[sel] : null;
  return (
    <Asset title="Achievement Badges" id="gam.achieve" desc="3D-наклон за курсором, блеск у полученных. Клик по закрытому — +30% прогресса." className="lg:col-span-2">
      <div className="relative">
        <Confetti fire={fire} count={70} spread={220} />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {list.map((a, i) => <TiltBadge key={a.n} a={a} onClick={() => progress(i)} />)}
        </div>
        <div className="inset p-3 mt-5 min-h-[58px] flex items-center gap-3">
          {s ? (
            <div key={sel + "-" + s.p} className="flex items-center gap-3 anim-fade w-full">
              <Glyph name={s.g} size={32} dim={s.p < 100} />
              <div className="flex-1"><div className="font-extrabold text-[13px]">{s.n}</div><div className="text-[11.5px] text-mute">{s.d}</div></div>
              <span className={cn("num font-extrabold", s.p >= 100 ? "text-bull" : "text-mute")}>{s.p}%</span>
            </div>
          ) : <span className="text-[12px] text-dim">Выберите значок, чтобы увидеть условие…</span>}
        </div>
      </div>
    </Asset>
  );
}

/* ---------- League ---------- */
const PLAYERS = ["Satoshi N", "Vitalik B", "You", "Cathie W", "Mike S", "Anna K", "Leo T", "Dana R"];
function League() {
  const [xp, setXp] = useState<Record<string, number>>(() => Object.fromEntries(PLAYERS.map((p, i) => [p, 980 - i * 90])));
  const [moved, setMoved] = useState<Record<string, number>>({});
  const sorted = [...PLAYERS].sort((a, b) => xp[b] - xp[a]);
  const sim = () => {
    const prev = Object.fromEntries(sorted.map((p, i) => [p, i]));
    const nx = { ...xp };
    PLAYERS.forEach((p) => { nx[p] += Math.floor(Math.random() * (p === "You" ? 260 : 200)); });
    const ns = [...PLAYERS].sort((a, b) => nx[b] - nx[a]);
    setMoved(Object.fromEntries(ns.map((p, i) => [p, prev[p] - i])));
    setXp(nx); sfx.whoosh();
  };
  const ROW = 52;
  return (
    <Asset title="League Leaderboard" id="gam.league" desc="Зоны повышения/понижения. «Simulate» — плавная перестановка (FLIP).">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Glyph name="gem" size={26} /><div><div className="font-extrabold text-[14px]">Sapphire League</div><div className="text-[10.5px] text-dim font-bold">осталось 2д 14ч</div></div></div>
        <Btn3D size="xs" variant="blue" onClick={sim} sound="none" icon={<Icon name="play" size={12} />}>Simulate</Btn3D>
      </div>
      <div className="relative inset p-1.5" style={{ height: PLAYERS.length * ROW + 12 }}>
        {sorted.map((p, i) => {
          const zone = i < 3 ? "up" : i >= PLAYERS.length - 2 ? "down" : "";
          const d = moved[p] || 0;
          return (
            <div key={p} className={cn("absolute left-1.5 right-1.5 h-[46px] rounded-xl flex items-center gap-2.5 px-2.5 transition-all duration-700 ease-[cubic-bezier(.3,1.2,.5,1)]", p === "You" ? "bg-blue/20 border-2 border-blue/60" : "hover:bg-white/5")} style={{ top: 6 + i * ROW }}>
              <span className={cn("w-5 text-center num text-[13px] font-extrabold", zone === "up" ? "text-bull" : zone === "down" ? "text-bear" : "text-mute")}>{i + 1}</span>
              <Avatar name={p} size={30} />
              <span className="flex-1 text-[13px] font-bold truncate">{p}</span>
              {d !== 0 && <span key={xp[p]} className={cn("text-[10px] font-extrabold num anim-pop flex items-center", d > 0 ? "text-bull" : "text-bear")}><Icon name={d > 0 ? "chevU" : "chevD"} size={12} stroke={3} />{Math.abs(d)}</span>}
              <CountUp value={xp[p]} className="text-[12px] font-bold text-mute" suffix=" XP" />
            </div>
          );
        })}
        <div className="absolute left-3 right-3 border-t-2 border-dashed border-bull/40" style={{ top: 6 + 3 * ROW - 3 }}><span className="absolute right-0 -top-2.5 text-[8.5px] font-extrabold bg-ink-850 px-1 text-bull">PROMOTION</span></div>
        <div className="absolute left-3 right-3 border-t-2 border-dashed border-bear/40" style={{ top: 6 + (PLAYERS.length - 2) * ROW - 3 }}><span className="absolute right-0 -top-2.5 text-[8.5px] font-extrabold bg-ink-850 px-1 text-bear">DEMOTION</span></div>
      </div>
    </Asset>
  );
}

/* ---------- Chest ---------- */
function Chest() {
  const [st, setSt] = useState<"closed" | "shake" | "open">("closed");
  const [taps, setTaps] = useState(0);
  const [fire, setFire] = useState(0);
  const [reward] = useState(() => [{ g: "gem" as const, n: 120, l: "Gems" }, { g: "bolt" as const, n: 2, l: "XP Boost ×2" }, { g: "coin" as const, n: 500, l: "Coins" }]);
  const tap = () => {
    if (st === "open") return;
    const n = taps + 1; setTaps(n); setSt("shake"); sfx.tap(); haptic(15);
    setTimeout(() => setSt("closed"), 420);
    if (n >= 3) setTimeout(() => { setSt("open"); setFire(Date.now()); sfx.levelUp(); haptic([30, 30, 80]); }, 430);
  };
  return (
    <Asset title="Reward Chest" id="gam.chest" desc="Тапните 3 раза: тряска → открытие → лучи → награды.">
      <div className="relative h-48 grid place-items-center">
        <Confetti fire={fire} count={50} />
        {st === "open" && <div className="absolute size-52 rounded-full opacity-70" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.35) 0 12deg, transparent 12deg 24deg)", animation: "ray 10s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 70%)" }} />}
        <button onClick={tap} className={cn("relative", st === "shake" && "anim-wiggle", st === "closed" && "anim-float")}>
          <svg width="120" height="110" viewBox="0 0 120 110">
            <ellipse cx="60" cy="104" rx="46" ry="6" fill="rgba(0,0,0,.35)" />
            <rect x="14" y="48" width="92" height="52" rx="10" fill="#8a3f0a" />
            <rect x="14" y="44" width="92" height="52" rx="10" fill="url(#cb)" />
            <rect x="14" y="56" width="92" height="7" fill="#ffd27a" />
            <rect x="52" y="52" width="16" height="22" rx="4" fill="#ffe9a3" stroke="#b8650a" strokeWidth="2" />
            <g style={{ transformOrigin: "20px 46px", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)", transform: st === "open" ? "rotate(-32deg) translateY(-8px)" : "none" }}>
              <path d="M14 46 a22 22 0 0 1 22-22 h48 a22 22 0 0 1 22 22 z" fill="url(#cl)" />
              <rect x="14" y="40" width="92" height="7" fill="#ffd27a" />
            </g>
            <defs>
              <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffa94d" /><stop offset="1" stopColor="#c2570c" /></linearGradient>
              <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffc078" /><stop offset="1" stopColor="#e07a1f" /></linearGradient>
            </defs>
          </svg>
          {st !== "open" && <span className="absolute -top-2 -right-2 size-6 rounded-full bg-bear text-[11px] font-extrabold grid place-items-center border-2 border-ink-800 num">{3 - taps}</span>}
        </button>
        {st === "open" && (
          <div className="absolute bottom-0 inset-x-0 flex justify-center gap-2">
            {reward.map((r, i) => (
              <div key={r.l} className="raised px-2.5 py-1.5 flex items-center gap-1.5 anim-pop" style={{ animationDelay: `${i * 120}ms` }}><Glyph name={r.g} size={20} /><span className="num text-[12px] font-extrabold">{r.g === "bolt" ? "×2" : `+${r.n}`}</span></div>
            ))}
          </div>
        )}
      </div>
      <Btn3D size="sm" full variant={st === "open" ? "bull" : "gold"} onClick={() => { if (st === "open") { setSt("closed"); setTaps(0); } else tap(); }} className="mt-3">{st === "open" ? "Claim rewards" : "Open chest"}</Btn3D>
    </Asset>
  );
}

/* ---------- Combo ---------- */
function Combo() {
  const [c, setC] = useState(0);
  const [miss, setMiss] = useState(0);
  const mult = Math.min(5, 1 + Math.floor(c / 3));
  const heat = Math.min(100, ((c % 3) / 3) * 100 + (mult === 5 ? 100 : 0));
  return (
    <Asset title="Combo Multiplier" id="gam.combo" desc="Серия верных ответов разогревает множитель до ×5. Ошибка — сброс.">
      <div className={cn("inset p-4 flex items-center gap-4", miss && "anim-shake")} key={miss}>
        <div className="relative">
          {mult >= 3 && <div className="absolute inset-0 rounded-full blur-lg bg-[#ff6a1f]/60 animate-pulse" />}
          <div key={mult} className={cn("relative size-20 rounded-full grid place-items-center text-[28px] font-extrabold num anim-pop", mult >= 5 ? "bg-gradient-to-b from-[#ab86ff] to-[#6f3cf0] shadow-[0_5px_0_#4a22b0]" : mult >= 3 ? "bg-gradient-to-b from-[#ffb347] to-[#ff6a1f] shadow-[0_5px_0_#b8420a]" : "bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_5px_0_#0b1536]")}>×{mult}</div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[12px] font-extrabold mb-1.5"><span>Combo <span className="num text-gold">{c}</span></span><span className="text-dim">{mult >= 5 ? "MAX!" : `до ×${mult + 1}: ${3 - (c % 3)}`}</span></div>
          <Bar value={heat} tone={mult >= 5 ? "violet" : mult >= 3 ? "gold" : "blue"} h={12} striped={mult >= 3} />
          <div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map((m) => <span key={m} className={cn("flex-1 h-1.5 rounded-full transition-colors", m <= mult ? "bg-gold" : "bg-[#16275a]")} />)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Btn3D size="sm" variant="bull" onClick={() => { setC(c + 1); (c + 1) % 3 === 0 ? sfx.levelUp() : sfx.success(); }} icon={<Icon name="check" size={15} stroke={3} />} sound="none">Correct</Btn3D>
        <Btn3D size="sm" variant="bear" onClick={() => { setC(0); setMiss(miss + 1); sfx.error(); haptic([40, 30, 40]); }} icon={<Icon name="x" size={15} stroke={3} />} sound="none">Miss</Btn3D>
      </div>
    </Asset>
  );
}

export default function Gamification() {
  return (
    <Section id="gamification" index="04" title="Gamification" subtitle="Мотивационный слой: XP, серии, цели, ачивки, лиги, сундуки, комбо" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <XpLevel />
        <Achievements />
        <Streak />
        <DailyGoal />
        <Combo />
        <League />
        <Chest />
        <div className="panel p-5 flex flex-col justify-center gap-3">
          <Label>Currency pills</Label>
          {([["coin", "12,450", "Coins", "text-gold"], ["gem", "1,280", "Gems", "text-cyan"], ["bolt", "×2 · 14:59", "XP Boost", "text-violet"]] as const).map(([g, v, l, c]) => (
            <div key={l} className="raised !rounded-full pl-1.5 pr-4 h-12 flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform">
              <span className="size-9 rounded-full bg-ink-850 grid place-items-center shadow-inner"><Glyph name={g} size={24} /></span>
              <span className={cn("num font-extrabold", c)}>{v}</span><span className="ml-auto text-[11px] text-dim font-bold">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
