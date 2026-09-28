import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Confetti, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstCoins, burstConfetti, burstRing, burstSparks, burstStars, burstText, celebrate, flash, shake } from "../utils/fx";

/* ============ 1. LEVEL UP CINEMATIC ============ */
function LevelUp() {
  const [lvl, setLvl] = useState(7);
  const [play, setPlay] = useState(false);
  const [stage, setStage] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const run = () => {
    if (play) return;
    setPlay(true); setStage(0);
    sfx.whoosh();
    setTimeout(() => { setStage(1); sfx.levelUp(); haptic([20, 30]); const r = box.current?.getBoundingClientRect(); if (r) burstRing(r.left + r.width / 2, r.top + r.height / 2, "#ffc53d", 200); }, 450);
    setTimeout(() => {
      setStage(2); setLvl((l) => l + 1); fanfare(); haptic([30, 40, 80]);
      const r = box.current?.getBoundingClientRect();
      if (r) { burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 70, 1.2); burstStars(r.left + r.width / 2, r.top + r.height / 2, 12); }
    }, 1100);
    setTimeout(() => { setPlay(false); setStage(0); }, 2600);
  };
  return (
    <Asset title="Level-Up Cinematic" id="cel.levelup" desc="Трёхактная сцена: заряд → вспышка с кольцом → конфетти и новый уровень. Звук и вибрация по актам.">
      <div ref={box} className="relative h-[240px] rounded-2xl overflow-hidden bg-[#080f26] border border-white/10 grid place-items-center">
        {stage >= 1 && <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,197,61,.3), transparent 60%)", animation: "fade-in .4s both" }} />}
        {stage >= 2 && <div className="absolute size-[380px] opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.25) 0 10deg, transparent 10deg 20deg)", animation: "ray 9s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 65%)" }} />}
        <div className="relative text-center">
          <div className="relative inline-block">
            {stage === 0 && <span className="inline-block size-20 rounded-3xl bg-gradient-to-b from-[#2a4185] to-[#16275a] border border-white/10 grid place-items-center num text-[30px] font-extrabold">{lvl}</span>}
            {stage === 1 && <span className="inline-block size-20 rounded-3xl bg-gradient-to-b from-[#ffdc7a] to-[#f0a811] grid place-items-center num text-[30px] font-extrabold text-[#3a2400]" style={{ animation: "box-shake .25s linear infinite", boxShadow: "0 0 50px rgba(255,197,61,.8)" }}>{lvl}</span>}
            {stage >= 2 && <span key={lvl} className="inline-block size-24 rounded-3xl bg-gradient-to-b from-[#ffdc7a] to-[#f0a811] grid place-items-center num text-[38px] font-extrabold text-[#3a2400] anim-pop" style={{ boxShadow: "0 0 60px rgba(255,197,61,.8), 0 8px 0 #b8780a" }}>{lvl}</span>}
          </div>
          <div className="mt-3 h-8">
            {stage === 0 && <span className="text-[13px] font-bold text-dim">нажми кнопку — будет магия</span>}
            {stage === 1 && <span className="text-[15px] font-extrabold text-gold anim-pulse">Зарядка…</span>}
            {stage >= 2 && <span key={lvl} className="text-[22px] font-extrabold tracking-tight anim-pop inline-block">LEVEL {lvl}!</span>}
          </div>
          {stage >= 2 && <div className="flex justify-center gap-2 mt-1">{["+100 💎", "Новый урок", "×2 XP"].map((t, i) => <span key={t} className="text-[10.5px] font-extrabold bg-white/10 rounded-lg px-2 py-1" style={{ animation: `pop .4s ${0.2 + i * 0.12}s both` }}>{t}</span>)}</div>}
        </div>
      </div>
      <Btn3D size="sm" variant="gold" full className="mt-3" loading={play} onClick={run} icon={<Icon name="bolt" size={15} />}>{play ? "Leveling…" : `Level up to ${lvl + 1}`}</Btn3D>
    </Asset>
  );
}

/* ============ 2. CHEST TIERS ============ */
function ChestTiers() {
  const tiers = [
    { n: "Wood", c1: "#a06a2c", c2: "#5c3a12", glow: "rgba(160,106,44,.4)", shake: 0 },
    { n: "Silver", c1: "#c9d5f5", c2: "#5b6a98", glow: "rgba(201,213,245,.5)", shake: 1 },
    { n: "Gold", c1: "#ffdc7a", c2: "#b8780a", glow: "rgba(255,197,61,.6)", shake: 2 },
    { n: "Mythic", c1: "#c9a6ff", c2: "#5a2fcc", glow: "rgba(141,92,255,.7)", shake: 3 },
  ];
  const [ti, setTi] = useState(2);
  const [open, setOpen] = useState(false);
  const [fire, setFire] = useState(0);
  const t = tiers[ti];
  const doOpen = () => {
    if (open) { setOpen(false); return; }
    setOpen(true); setFire(Date.now());
    if (ti >= 2) { celebrate(); fanfare(); } else { sfx.success(); }
    haptic([20, 40, 80]);
  };
  return (
    <Asset title="Chest Tiers" id="cel.chest" desc="4 тира сундуков: дерево, серебро, золото, мифик. Редкость влияет на свечение, тряску и салют.">
      <div className="relative h-[220px] rounded-2xl overflow-hidden grid place-items-center" style={{ background: `radial-gradient(circle at 50% 60%, ${t.glow}, transparent 70%), #080f26` }}>
        <Confetti fire={fire} count={40 + ti * 15} spread={180 + ti * 30} />
        <button onClick={doOpen} className="relative transition-transform hover:scale-105 active:scale-95" style={{ filter: `drop-shadow(0 0 ${open ? 40 : 18}px ${t.glow})` }}>
          <svg width="150" height="130" viewBox="0 0 120 110">
            <ellipse cx="60" cy="104" rx="46" ry="6" fill="rgba(0,0,0,.4)" />
            <rect x="14" y="48" width="92" height="52" rx="10" fill={t.c2} />
            <rect x="14" y="44" width="92" height="52" rx="10" fill={t.c1} />
            <rect x="14" y="56" width="92" height="7" fill="rgba(255,255,255,.35)" />
            <rect x="52" y="52" width="16" height="22" rx="4" fill="#ffe9a3" stroke={t.c2} strokeWidth="2" />
            <g style={{ transformOrigin: "20px 46px", transition: "transform .6s cubic-bezier(.3,1.5,.5,1)", transform: open ? "rotate(-32deg) translateY(-10px)" : "none" }}>
              <path d="M14 46 a22 22 0 0 1 22-22 h48 a22 22 0 0 1 22 22 z" fill={t.c1} stroke="rgba(255,255,255,.3)" strokeWidth="1.5" />
            </g>
            {open && <rect x="20" y="30" width="80" height="14" rx="7" fill="#fff" opacity=".9"><animate attributeName="opacity" values=".9;.4;.9" dur="1s" repeatCount="indefinite" /></rect>}
          </svg>
          {!open && <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-extrabold bg-black/50 rounded px-2 py-0.5 whitespace-nowrap">tap to open</span>}
        </button>
        {open && <div className="absolute bottom-3 flex gap-2">{[0, 1, 2].map((i) => <span key={i} className="raised px-2.5 py-1 text-[11px] font-extrabold num anim-pop" style={{ animationDelay: `${i * 130}ms` }}>{["+250", "+80 💎", "×2"][i]}</span>)}</div>}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {tiers.map((x, i) => (
          <button key={x.n} onClick={() => { setTi(i); setOpen(false); sfx.tick(); }} className={cn("h-10 rounded-xl text-[11px] font-extrabold border-2 transition-all", ti === i ? "scale-105" : "opacity-60 hover:opacity-100")} style={{ background: `linear-gradient(180deg, ${x.c1}, ${x.c2})`, borderColor: ti === i ? "#fff" : "transparent", color: i < 2 ? "#fff" : "#3a2400" }}>{x.n}</button>
        ))}
      </div>
    </Asset>
  );
}

/* ============ 3. COMBO METER ============ */
function ComboMeter() {
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [heat, setHeat] = useState(0);
  const [last, setLast] = useState<"hit" | "miss" | null>(null);
  const timer = useRef(0);
  const hit = (ok: boolean, e: React.MouseEvent) => {
    window.clearTimeout(timer.current);
    if (ok) {
      const n = combo + 1;
      setCombo(n); setBest((b) => Math.max(b, n)); setHeat(Math.min(100, heat + 14)); setLast("hit");
      const r = (e.target as HTMLElement).getBoundingClientRect();
      if (n % 5 === 0) { burstStars(r.left, r.top, 8); burstText(r.left + 40, r.top - 10, `COMBO ×${n}`, "#ff8a3d"); sfx.levelUp(); } else { burstSparks(r.left + 40, r.top, 8, "#ffc53d"); sfx.success(); }
      if (n >= 10) { flash("rgba(255,138,61,.12)"); }
      timer.current = window.setTimeout(() => { setCombo(0); setHeat(0); }, 3200);
    } else {
      setCombo(0); setHeat(0); setLast("miss"); sfx.error(); shake("soft");
    }
  };
  const mult = 1 + Math.floor(combo / 4);
  return (
    <Asset title="Combo Meter" id="cel.combo" desc="Серия попаданий растит множитель и жар; промах или пауза 3.2с — сброс. Вехи ×5 с салютом.">
      <div className="inset !rounded-2xl p-4 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 transition-all duration-500" style={{ height: `${heat}%`, background: "linear-gradient(180deg, rgba(255,77,106,.25), rgba(255,138,61,.12))" }} />
        <div className="relative">
          <div className="label-caps">Combo</div>
          <div key={combo} className={cn("num text-[64px] font-extrabold leading-none", combo >= 10 ? "text-bear" : combo >= 5 ? "text-gold" : "text-txt")} style={{ animation: last === "hit" ? "pop .3s both" : undefined, textShadow: combo >= 5 ? "0 0 30px rgba(255,138,61,.6)" : "0 4px 0 rgba(0,0,0,.35)" }}>×{combo}</div>
          <div className="mt-1 text-[12px] font-extrabold">Множитель XP: <span className="num text-gold">×{mult}</span> · Рекорд: <span className="num">{best}</span></div>
          <div className="flex gap-1.5 justify-center mt-3">{Array.from({ length: 10 }).map((_, i) => <span key={i} className={cn("w-5 h-2.5 rounded-full transition-all duration-300", i < combo ? (combo >= 10 ? "bg-bear" : combo >= 5 ? "bg-gold" : "bg-blue") : "bg-[#16275a]")} />)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Btn3D size="md" variant="bull" onClick={(e) => hit(true, e)} icon={<Icon name="check" size={16} stroke={3} />}>Hit</Btn3D>
        <Btn3D size="md" variant="bear" onClick={(e) => hit(false, e)} icon={<Icon name="x" size={16} stroke={3} />}>Miss</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 4. STREAK FLAMES ============ */
function StreakFlames() {
  const [days, setDays] = useState([true, true, true, true, true, false, false]);
  const [streak, setStreak] = useState(46);
  const [burst, setBurst] = useState(0);
  const names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const check = (e: React.MouseEvent) => {
    const i = days.findIndex((d) => !d);
    if (i < 0) return;
    const n = [...days]; n[i] = true; setDays(n); setStreak(streak + 1); setBurst(Date.now());
    const r = (e.target as HTMLElement).getBoundingClientRect();
    burstConfetti(r.left, r.top, 24, 0.6); sfx.success(); haptic([15, 25]);
  };
  const size = 44 + Math.min(40, streak / 2);
  return (
    <Asset title="Streak Flames" id="cel.streak" desc="Пламя растёт с серией: размер, свечение и жар зависят от дней подряд. Отметка дня — вспышка.">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 grid place-items-center" style={{ width: 110, height: 110 }}>
          <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "rgba(255,106,31,.45)", transform: `scale(${0.6 + streak / 90})` }} />
          <div key={burst} className="anim-flicker" style={{ animationDuration: `${Math.max(0.4, 1.2 - streak / 80)}s` }}>
            <Glyph name="flame" size={Math.min(96, size)} />
          </div>
          <span key={streak} className="absolute bottom-1 num text-[20px] font-extrabold text-white anim-pop" style={{ textShadow: "0 2px 0 rgba(0,0,0,.5)" }}>{streak}</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-1">
            {names.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className={cn("text-[9px] font-extrabold", days[i] ? "text-[#ff9a3d]" : "text-dim")}>{d}</span>
                <span className={cn("size-7 rounded-full grid place-items-center transition-all duration-300", days[i] ? "bg-gradient-to-b from-[#ffb347] to-[#ff6a1f] shadow-[0_3px_0_#b8420a]" : "bg-[#16275a]")} style={days[i] && i === days.lastIndexOf(true) ? { animation: "pop .4s both" } : undefined}>
                  {days[i] && <Icon name="check" size={14} stroke={3.4} className="text-white" />}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#ff6a1f] to-[#ffc53d] transition-all duration-500" style={{ width: `${(days.filter(Boolean).length / 7) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Btn3D size="sm" variant="gold" full disabled={!days.includes(false)} onClick={check} icon={<Glyph name="flame" size={16} />}>Отметить сегодня</Btn3D>
        <Btn3D size="sm" variant="neutral" onClick={() => { setDays([false, false, false, false, false, false, false]); setStreak(0); }}>Reset</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. TROPHY SHINE ============ */
function Trophy() {
  const [unlocked, setUnlocked] = useState(false);
  const [fire, setFire] = useState(0);
  const unlock = () => {
    if (unlocked) { setUnlocked(false); return; }
    setUnlocked(true); setFire(Date.now()); fanfare(); celebrate(); haptic([30, 40, 80]);
  };
  return (
    <Asset title="Trophy Unlock" id="cel.trophy" desc="Разблокировка кубка: силуэт → золото с бегущим бликом, лучами и салютом.">
      <div className="relative h-[210px] rounded-2xl overflow-hidden grid place-items-center" style={{ background: unlocked ? "radial-gradient(circle at 50% 60%, rgba(255,197,61,.25), #080f26 70%)" : "#080f26" }}>
        <Confetti fire={fire} count={60} spread={220} />
        {unlocked && <div className="absolute size-[320px] opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.2) 0 10deg, transparent 10deg 20deg)", animation: "ray 10s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 65%)" }} />}
        <div className="relative">
          <div className={cn("transition-all duration-700", unlocked ? "scale-110" : "scale-95 grayscale brightness-50")}><Glyph name="crown" size={96} /></div>
          {unlocked && <div className="absolute inset-0 overflow-hidden"><div className="absolute inset-y-[-20%] w-10 bg-white/40 blur-sm rotate-[20deg]" style={{ animation: "shine 2.2s ease-in-out infinite" }} /></div>}
        </div>
        <div className="absolute bottom-3"><Badge tone={unlocked ? "gold" : "neutral"}>{unlocked ? "★ Разблокировано" : "🔒 Пройди все юниты"}</Badge></div>
      </div>
      <Btn3D size="sm" variant={unlocked ? "neutral" : "gold"} full className="mt-3" onClick={unlock}>{unlocked ? "Lock again" : "Unlock trophy"}</Btn3D>
    </Asset>
  );
}

/* ============ 6. SHAKE SHOWCASE ============ */
function ShakeShow() {
  const [last, setLast] = useState("—");
  const demo = (kind: "soft" | "hard", color: string, label: string) => { shake(kind); flash(color); sfx.error(); haptic(kind === "hard" ? [60, 40, 80] : 20); setLast(label); };
  return (
    <Asset title="Shake & Flash" id="cel.shake" desc="Экранная тряска и цветные вспышки для ошибок, урона и варнингов. Последний триггер подсвечен.">
      <div className="grid grid-cols-2 gap-2.5">
        <Btn3D size="sm" variant="bear" onClick={() => demo("soft", "rgba(255,77,106,.25)", "Ошибка ответа")}>Soft error</Btn3D>
        <Btn3D size="sm" variant="bear" onClick={() => demo("hard", "rgba(255,77,106,.4)", "Ликвидация!")}>Hard crash</Btn3D>
        <Btn3D size="sm" variant="gold" onClick={() => demo("soft", "rgba(255,197,61,.22)", "Предупреждение")}>Warning</Btn3D>
        <Btn3D size="sm" variant="bull" onClick={() => { flash("rgba(31,219,139,.2)"); sfx.success(); setLast("Исцеление"); }}>Heal flash</Btn3D>
      </div>
      <div className="mt-3 inset !rounded-xl p-2.5 text-center text-[12px] font-bold text-mute">Последний эффект: <span key={last} className="text-txt anim-pop inline-block">{last}</span></div>
    </Asset>
  );
}

/* ============ 7. REWARD RAIN ============ */
function RewardRain() {
  const [items, setItems] = useState<{ id: number; x: number; g: "coin" | "gem" | "star"; d: number }[]>([]);
  const [caught, setCaught] = useState(0);
  const rain = () => {
    const batch = Array.from({ length: 14 }).map((_, i) => ({ id: Date.now() + i, x: 4 + Math.random() * 92, g: (["coin", "gem", "star"] as const)[(Math.random() * 3) | 0], d: 0.9 + Math.random() * 1.4 }));
    setItems(batch); sfx.whoosh();
    setTimeout(() => setItems([]), 2800);
  };
  const grab = (id: number, e: React.MouseEvent) => {
    setItems((it) => it.filter((x) => x.id !== id));
    setCaught((c) => c + 1); sfx.coin(); haptic(8);
    const r = (e.target as HTMLElement).getBoundingClientRect();
    burstText(r.left + r.width / 2, r.top, "+10", "#ffc53d");
  };
  return (
    <Asset title="Reward Rain" id="cel.rain" desc="Дождь наград: кликай по падающим монетам и кристаллам, пока не исчезли. Счётчик пойманных.">
      <div className="relative h-[210px] rounded-2xl overflow-hidden bg-[#080f26] border border-white/10">
        {items.map((it) => (
          <button key={it.id} onPointerDown={(e) => grab(it.id, e)} className="absolute top-[-40px]" style={{ left: `${it.x}%`, animation: `rain-fall ${it.d}s ease-in forwards` }}>
            <Glyph name={it.g} size={30} />
          </button>
        ))}
        {!items.length && <div className="absolute inset-0 grid place-items-center text-dim text-[12px] font-bold">нажми «Дождь» и лови награды</div>}
        <div className="absolute top-2.5 left-3"><Badge tone="gold">Caught <span className="num">{caught}</span></Badge></div>
      </div>
      <Btn3D size="sm" variant="gold" full className="mt-3" onClick={rain} icon={<Icon name="gift" size={15} />}>Start rain</Btn3D>
      <style>{`@keyframes rain-fall { to { transform: translateY(280px) rotate(240deg); } }`}</style>
    </Asset>
  );
}

/* ============ 8. VICTORY TIMELINE ============ */
function VictoryTimeline() {
  const [k, setK] = useState(0);
  const [run, setRun] = useState(false);
  const steps = [
    { t: "Сделка закрыта", i: "check", c: "#1fdb8b" },
    { t: "+$812.40", i: "coin", c: "#ffc53d" },
    { t: "+45 XP", i: "bolt", c: "#8d5cff" },
    { t: "Серия ×3", i: "flame", c: "#ff8a3d" },
    { t: "Топ лиги!", i: "trophy", c: "#2ed3f0" },
  ];
  const play = () => {
    if (run) return;
    setRun(true); setK(0); sfx.whoosh();
    steps.forEach((_s, i) => {
      void _s;
      setTimeout(() => {
        setK(i + 1); sfx.success(); haptic(12);
        if (i === steps.length - 1) { celebrate(); fanfare(); setRun(false); }
      }, 500 + i * 550);
    });
  };
  return (
    <Asset title="Victory Timeline" id="cel.victory" desc="Каскад победы: события появляются по таймлайну с линией прогресса и финальным салютом.">
      <div className="inset !rounded-2xl p-4 min-h-[210px]">
        <div className="h-1.5 rounded-full bg-[#16275a] overflow-hidden mb-4"><div className="h-full rounded-full bg-gradient-to-r from-bull to-gold transition-all duration-500" style={{ width: `${(k / steps.length) * 100}%` }} /></div>
        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <div key={s.t} className={cn("flex items-center gap-3 transition-all duration-500", i < k ? "opacity-100 translate-x-0" : "opacity-20 translate-x-4")}>
              <span className="size-9 rounded-xl grid place-items-center shrink-0" style={i < k ? { background: `${s.c}25`, color: s.c, animation: "pop .4s both" } : { background: "#16275a", color: "#5b6a98" }}>
                {s.i === "coin" || s.i === "bolt" || s.i === "flame" ? <Glyph name={s.i as "coin"} size={20} /> : <Icon name={s.i} size={18} />}
              </span>
              <span className="font-extrabold text-[14px]">{s.t}</span>
              {i < k && <Icon name="check" size={15} stroke={3} className="ml-auto text-bull anim-pop" />}
            </div>
          ))}
        </div>
      </div>
      <Btn3D size="sm" variant="bull" full className="mt-3" loading={run} onClick={play} icon={<Icon name="trophy" size={15} />}>{run ? "Celebrating…" : "Play victory"}</Btn3D>
    </Asset>
  );
}

export default function Celebrations() {
  useEffect(() => { void burstCoins; }, []);
  return (
    <Section id="celebrate" index="29" title="Celebrations" subtitle="8 сцен побед: level-up, сундуки, комбо, серия, кубок, тряска, дождь наград, таймлайн" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <LevelUp />
        <ChestTiers />
        <ComboMeter />
        <StreakFlames />
        <Trophy />
        <ShakeShow />
        <RewardRain />
        <VictoryTimeline />
      </div>
    </Section>
  );
}
