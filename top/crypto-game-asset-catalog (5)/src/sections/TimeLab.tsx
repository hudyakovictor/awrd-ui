import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstConfetti } from "../utils/fx";

/* ============ 1. ANALOG CLOCK ============ */
function AnalogClock() {
  const [now, setNow] = useState(new Date());
  const [smooth, setSmooth] = useState(true);
  const [tz, setTz] = useState(0);
  useEffect(() => {
    const h = setInterval(() => setNow(new Date()), smooth ? 100 : 1000);
    return () => clearInterval(h);
  }, [smooth]);
  const d = new Date(now.getTime() + tz * 3600000);
  const ms = d.getMilliseconds(), s = d.getSeconds() + (smooth ? ms / 1000 : 0);
  const m = d.getMinutes() + s / 60, hh = (d.getHours() % 12) + m / 60;
  const cities = [{ n: "UTC", o: -d.getTimezoneOffset() / 60 }, { n: "NYC", o: -4 }, { n: "LDN", o: 1 }, { n: "TKY", o: 9 }];
  return (
    <Asset title="Analog Clock" id="time.clock" desc="Живые часы: плавная секундная стрелка, часовые пояса, тикающий звук на каждую секунду.">
      <div className="flex flex-col items-center">
        <div className="relative size-[190px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1d3169] to-[#0f1b3f] border border-white/10 shadow-[0_8px_0_#081028,0_24px_40px_rgba(0,0,0,.5),inset_0_2px_0_rgba(255,255,255,.12)]" />
          {Array.from({ length: 60 }).map((_, i) => {
            const big = i % 5 === 0;
            return <span key={i} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: big ? 4 : 2, height: big ? 12 : 6, background: big ? "#eaf0ff" : "#3a4f8f", transform: `translate(-50%,-50%) rotate(${i * 6}deg) translateY(-80px)` }} />;
          })}
          {["12", "3", "6", "9"].map((n, i) => <span key={n} className="absolute num text-[13px] font-extrabold text-mute" style={{ left: ["50%", "88%", "50%", "12%"][i], top: ["6%", "44%", "82%", "44%"][i], transform: "translate(-50%,-50%)" }}>{n}</span>)}
          <div className="absolute left-1/2 top-1/2 h-[46px] w-[7px] -ml-[3.5px] origin-bottom rounded-full bg-[#eaf0ff]" style={{ transform: `translateY(-100%) rotate(${hh * 30}deg)`, transformOrigin: "50% 100%", transition: smooth ? "none" : "transform .3s" }} />
          <div className="absolute left-1/2 top-1/2 h-[66px] w-[5px] -ml-[2.5px] rounded-full bg-[#8fb3ff]" style={{ transform: `translateY(-100%) rotate(${m * 6}deg)`, transformOrigin: "50% 100%", transition: smooth ? "none" : "transform .3s" }} />
          <div className="absolute left-1/2 top-1/2 h-[76px] w-[2.5px] -ml-[1.25px] rounded-full bg-bear" style={{ transform: `translateY(-100%) rotate(${s * 6}deg)`, transformOrigin: "50% 100%", transition: smooth ? "none" : "transform .2s cubic-bezier(.3,1.6,.5,1)", filter: "drop-shadow(0 0 6px rgba(255,77,106,.8))" }} />
          <span className="absolute left-1/2 top-1/2 size-3.5 -ml-[7px] -mt-[7px] rounded-full bg-gradient-to-b from-[#ffdc7a] to-[#b8780a] shadow" />
        </div>
        <div className="num text-[26px] font-extrabold mt-3">{d.toTimeString().slice(0, 8)}</div>
        <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
          {cities.map((c) => <button key={c.n} onClick={() => { setTz(c.o - -new Date().getTimezoneOffset() / 60 + c.o - c.o); setTz(c.o); sfx.tick(); }} className="h-8 px-2.5 rounded-lg text-[11px] font-extrabold bg-white/5 text-mute hover:text-txt">{c.n}</button>)}
          <button onClick={() => setSmooth(!smooth)} className={cn("h-8 px-2.5 rounded-lg text-[11px] font-extrabold", smooth ? "bg-bull/15 text-bull" : "bg-white/5 text-mute")}>{smooth ? "Smooth" : "Tick"}</button>
        </div>
      </div>
    </Asset>
  );
}

/* ============ 2. COUNTDOWN HERO ============ */
function CountdownHero() {
  const [left, setLeft] = useState(2 * 3600 + 14 * 60 + 33);
  const [run, setRun] = useState(true);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) { burstConfetti(window.innerWidth / 2, 240, 80, 1.2); sfx.levelUp(); setRun(false); return; }
    const h = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(h);
  }, [run, left]);
  const u = (v: number, l: string) => (
    <div className="flex-1 text-center">
      <div className="rounded-2xl bg-gradient-to-b from-[#1d3169] to-[#0f1b3f] border border-white/10 py-3 shadow-[0_4px_0_#081028]">
        <div key={v} className="num text-[30px] font-extrabold anim-pop">{String(v).padStart(2, "0")}</div>
      </div>
      <div className="text-[9.5px] font-extrabold text-dim uppercase mt-1.5 tracking-wider">{l}</div>
    </div>
  );
  const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  return (
    <Asset title="Event Countdown" id="time.countdown" desc="Обратный отсчёт до листинга: цифры поп-анимируются, финал с салютом, пауза/ресет.">
      <div className="rounded-2xl p-4 bg-gradient-to-b from-[#2a1a05] to-[#0a1330] border border-gold/25">
        <div className="flex items-center justify-center gap-2 mb-3"><Glyph name="rocket" size={22} /><span className="font-extrabold text-[14px]">Листинг $ owlet через</span></div>
        {left > 0 ? (
          <div className="flex gap-2">{u(h, "часов")}<span className="text-[24px] font-extrabold text-dim pt-2">:</span>{u(m, "минут")}<span className="text-[24px] font-extrabold text-dim pt-2">:</span>{u(s, "секунд")}</div>
        ) : <div className="text-center py-4 anim-scale"><div className="text-[26px] font-extrabold text-gold">🚀 LIVE NOW!</div><div className="text-[12px] text-mute">торги открыты</div></div>}
      </div>
      <div className="flex gap-2 mt-3">
        <Btn3D size="xs" variant={run ? "neutral" : "bull"} full onClick={() => { if (left <= 0) setLeft(7260); setRun(!run); }}>{run ? "Pause" : left <= 0 ? "Restart 2h" : "Resume"}</Btn3D>
        <Btn3D size="xs" variant="gold" onClick={() => { setLeft(8); setRun(true); }}>8s demo</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 3. POMODORO FOCUS ============ */
function Pomodoro() {
  const MODES = [{ n: "Focus", m: 25, c: "#ff4d6a" }, { n: "Short", m: 5, c: "#1fdb8b" }, { n: "Long", m: 15, c: "#3d7bff" }];
  const [mi, setMi] = useState(0);
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(0);
  const total = MODES[mi].m * 60;
  useEffect(() => {
    if (!run) return;
    if (left <= 0) { setRun(false); setDone((d) => d + 1); sfx.levelUp(); burstConfetti(window.innerWidth / 2, 200, 40, 0.9); return; }
    const h = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(h);
  }, [run, left]);
  const pick = (i: number) => { setMi(i); setLeft(MODES[i].m * 60); setRun(false); sfx.tick(); };
  const C = 2 * Math.PI * 78;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <Asset title="Focus Timer" id="time.pomo" desc="Помодоро для учебных сессий: режимы, кольцо прогресса, счётчик завершённых, ускоренное демо.">
      <div className="flex flex-col items-center">
        <div className="flex gap-1.5 mb-3">
          {MODES.map((x, i) => <button key={x.n} onClick={() => pick(i)} className={cn("h-8 px-3 rounded-lg text-[11px] font-extrabold", mi === i ? "text-white" : "text-mute")} style={mi === i ? { background: x.c } : undefined}>{x.n} {x.m}m</button>)}
        </div>
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r="78" fill="none" stroke="#0a1330" strokeWidth="13" />
            <circle cx="90" cy="90" r="78" fill="none" stroke={MODES[mi].c} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${(1 - left / total) * C} ${C}`} style={{ transition: "stroke-dasharray 1s linear", filter: `drop-shadow(0 0 10px ${MODES[mi].c})` }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div><div className="num text-[38px] font-extrabold leading-none">{mm}:{ss}</div><div className="text-[10px] font-extrabold text-dim uppercase mt-1">{MODES[mi].n} · done {done}</div></div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 w-full">
          <Btn3D size="sm" variant={run ? "neutral" : "bull"} full onClick={() => { if (left <= 0) setLeft(total); setRun(!run); sfx.tap(); }} icon={<Icon name={run ? "minus" : "play"} size={14} />}>{run ? "Pause" : "Start"}</Btn3D>
          <Btn3D size="xs" variant="neutral" onClick={() => { setLeft(6); setRun(true); }}>6s</Btn3D>
          <Btn3D size="xs" variant="neutral" onClick={() => { setLeft(total); setRun(false); }}>Reset</Btn3D>
        </div>
        <div className="flex gap-1.5 mt-2.5">{Array.from({ length: 8 }).map((_, i) => <span key={i} className={cn("size-2.5 rounded-full", i < done ? "bg-bull" : "bg-[#16275a]")} />)}</div>
      </div>
    </Asset>
  );
}

/* ============ 4. DAY / NIGHT CYCLE ============ */
function DayNight() {
  const [t, setT] = useState(10);
  const [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) return; const h = setInterval(() => setT((x) => (x + 0.25) % 24), 120); return () => clearInterval(h); }, [auto]);
  const sunA = ((t - 6) / 12) * Math.PI;
  const sunX = 50 - Math.cos(sunA) * 42, sunY = 78 - Math.sin(sunA) * 62;
  const night = t < 5.5 || t > 19.5;
  const dusk = !night && (t < 7.5 || t > 17.5);
  const sky = night ? "linear-gradient(180deg,#02040c,#0a1430)" : dusk ? "linear-gradient(180deg,#2a1a4e,#b8482e 70%,#ff8a3d)" : "linear-gradient(180deg,#1c4e9e,#7ec8f0)";
  const label = `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 >= 0.5 ? "30" : "00"}`;
  return (
    <Asset title="Day / Night Cycle" id="time.daynight" desc="Солнце движется по дуге, небо меняет градиент: ночь, рассвет, день, закат. Автопролет суток.">
      <div className="relative h-[190px] rounded-2xl overflow-hidden border border-white/10 transition-all duration-500" style={{ background: sky }}>
        {night && Array.from({ length: 26 }).map((_, i) => <span key={i} className="absolute size-[2.5px] rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, animation: `twinkle 2s ${(i % 5) * 0.3}s infinite` }} />)}
        {!night && <span className="absolute rounded-full" style={{ left: `${sunX}%`, top: `${sunY}%`, width: 44, height: 44, marginLeft: -22, marginTop: -22, background: "radial-gradient(circle, #fff7d6, #ffc53d 60%, #ff8a3d)", boxShadow: "0 0 50px rgba(255,197,61,.8)", transition: auto ? "none" : "all .4s" }} />}
        {night && <span className="absolute rounded-full bg-[#eaf0ff]" style={{ left: "72%", top: "18%", width: 30, height: 30, boxShadow: "0 0 30px rgba(234,240,255,.6)" }}><span className="absolute left-[6px] top-[8px] size-2 rounded-full bg-[#b9c6e8]" /><span className="absolute left-[16px] top-[16px] size-1.5 rounded-full bg-[#b9c6e8]" /></span>}
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[52px]"><path d="M0,60 L0,38 L40,30 L80,40 L130,26 L180,38 L240,30 L300,42 L360,32 L400,40 L400,60 Z" fill={night ? "#050a18" : "#0c2a3a"} /></svg>
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 num text-[22px] font-extrabold bg-black/30 rounded-xl px-3 py-0.5 backdrop-blur-sm">{label}</div>
        <div className="absolute top-2.5 right-3"><Badge tone={night ? "neutral" : dusk ? "gold" : "cyan"} size="xs">{night ? "🌙 night" : dusk ? "🌅 dusk" : "☀️ day"}</Badge></div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <input type="range" min={0} max={23.5} step={0.5} value={t} onChange={(e) => setT(+e.target.value)} className="flex-1 accent-[#ffc53d]" />
        <Btn3D size="xs" variant={auto ? "gold" : "neutral"} onClick={() => setAuto(!auto)}>{auto ? "Stop" : "Auto day"}</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. STOPWATCH ============ */
function Stopwatch() {
  const [ms, setMs] = useState(0);
  const [run, setRun] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const baseRef = useRef(0);
  useEffect(() => {
    if (!run) return;
    startRef.current = performance.now();
    let raf = 0;
    const loop = () => { setMs(baseRef.current + performance.now() - startRef.current); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); baseRef.current = ms; };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const fmt = (v: number) => { const m = Math.floor(v / 60000), s = Math.floor((v % 60000) / 1000), c = Math.floor((v % 1000) / 10); return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`; };
  const toggle = () => { if (run) baseRef.current = ms; setRun(!run); sfx.tap(); };
  const lap = () => { if (!run) return; setLaps((l) => [ms, ...l].slice(0, 5)); sfx.pop(); };
  const best = laps.length ? Math.min(...laps.map((l, i) => (laps[i - 1] ?? 0) > 0 ? l - (laps[i + 1] ?? 0) : l)) : 0;
  void best;
  return (
    <Asset title="Stopwatch" id="time.stopwatch" desc="Секундомер с сотыми долями: старт/пауза, круги с дельтами, лучший круг подсвечен.">
      <div className="text-center">
        <div className="num text-[40px] font-extrabold tracking-tight">{fmt(ms)}</div>
        <div className="flex justify-center gap-2 mt-2">
          <Btn3D size="sm" variant={run ? "gold" : "bull"} onClick={toggle} icon={<Icon name={run ? "minus" : "play"} size={14} />}>{run ? "Pause" : "Start"}</Btn3D>
          <Btn3D size="sm" variant="neutral" disabled={!run} onClick={lap}>Lap</Btn3D>
          <Btn3D size="sm" variant="neutral" onClick={() => { setRun(false); setMs(0); baseRef.current = 0; setLaps([]); }}>Reset</Btn3D>
        </div>
        <div className="mt-3 space-y-1.5 max-h-[118px] overflow-hidden text-left">
          {laps.map((l, i) => {
            const prev = laps[i + 1] ?? 0;
            const delta = l - prev;
            const isBest = laps.length > 1 && delta === Math.min(...laps.map((x, k) => x - (laps[k + 1] ?? 0)));
            return <div key={`${l}-${i}`} className={cn("flex justify-between px-3 py-1.5 rounded-lg num text-[11.5px] font-bold anim-fade", isBest ? "bg-bull/10 text-bull" : "bg-white/[.03] text-mute")}><span>Lap {laps.length - i}</span><span>+{fmt(delta)}</span><span>{fmt(l)}</span></div>;
          })}
          {!laps.length && <div className="text-center text-dim text-[11.5px] py-4">круги появятся здесь</div>}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 6. HABIT CALENDAR HEAT ============ */
function HabitHeat() {
  const W = 16, H = 7;
  const [grid, setGrid] = useState(() => Array.from({ length: W * H }, () => (Math.random() < 0.62 ? 1 + ((Math.random() * 3) | 0) : 0)));
  const [sel, setSel] = useState<number | null>(null);
  const cols = ["#16275a", "#0d5c3a", "#12a86a", "#3fe9a1", "#c8ffe4"];
  const total = grid.filter((x) => x > 0).length;
  const best = (() => { let b = 0, c = 0; for (const v of grid) { c = v > 0 ? c + 1 : 0; b = Math.max(b, c); } return b; })();
  return (
    <Asset title="Habit Heatmap" id="time.habit" desc="Тепловая карта активности 16×7: клик циклит интенсивность, счётчики серии и total.">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="bull"><span className="num">{total}</span> дней</Badge>
        <Badge tone="gold">серия <span className="num">{best}</span></Badge>
        <div className="ml-auto flex gap-1">{cols.map((c, i) => <span key={i} className="size-3 rounded-[4px]" style={{ background: c }} />)}</div>
      </div>
      <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${W}, 1fr)` }}>
        {grid.map((v, i) => (
          <button key={i} onClick={() => { setGrid((g) => g.map((x, k) => (k === i ? (x + 1) % 5 : x))); setSel(i); sfx.tick(); }}
            className="aspect-square rounded-[5px] transition-all duration-200 hover:scale-125 hover:z-10 relative"
            style={{ background: cols[v], boxShadow: sel === i ? "0 0 0 2px #fff" : undefined }} />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        <span className="text-[11px] text-dim font-bold">{sel !== null ? `день ${sel + 1}: уровень ${grid[sel]}` : "клик по клетке меняет уровень"}</span>
        <button onClick={() => { setGrid(Array(W * H).fill(0)); sfx.tap(); }} className="text-[11px] font-extrabold text-bear">Clear</button>
      </div>
    </Asset>
  );
}

/* ============ 7. TIMELINE SCRUB ============ */
function TimelineScrub() {
  const events = [
    { t: "09:00", n: "Открытие Азии", d: "BTC +0.8% на открытии" }, { t: "12:30", n: "Пробой $67k", d: "Объём ×3 от среднего" },
    { t: "15:45", n: "Ложный пробой", d: "Фитиль до $68.2k, возврат" }, { t: "18:00", n: "Открытие США", d: "Волатильность растёт" }, { t: "21:20", n: "Закрытие дня", d: "+2.4% итог сессии" },
  ];
  const [k, setK] = useState(2);
  return (
    <Asset title="Day Timeline" id="time.timeline" desc="Лента торгового дня: скраббер выбирает событие, карточка показывает детали.">
      <div className="relative px-1 pt-1">
        <div className="absolute left-4 right-4 top-[13px] h-1 rounded-full bg-[#16275a]" />
        <div className="absolute left-4 top-[13px] h-1 rounded-full bg-gradient-to-r from-blue to-bull transition-all duration-500" style={{ width: `calc(${(k / (events.length - 1)) * 100}% - 0px)`, maxWidth: "calc(100% - 32px)" }} />
        <div className="relative flex justify-between">
          {events.map((e, i) => (
            <button key={e.t} onClick={() => { setK(i); sfx.tick(); }} className="flex flex-col items-center gap-1.5 group">
              <span className={cn("size-4 rounded-full border-[3px] transition-all duration-300", i < k ? "bg-bull border-bull" : i === k ? "bg-gold border-gold scale-125 shadow-[0_0_14px_rgba(255,197,61,.7)]" : "bg-[#0a1330] border-[#2f4890] group-hover:border-blue")} />
              <span className={cn("num text-[10px] font-extrabold", i === k ? "text-gold" : "text-dim")}>{e.t}</span>
            </button>
          ))}
        </div>
      </div>
      <div key={k} className="mt-4 raised !rounded-2xl p-4 anim-fade">
        <div className="flex items-center justify-between"><span className="num text-[12px] font-extrabold text-dim">{events[k].t}</span><Badge tone="blue" size="xs">событие {k + 1}/{events.length}</Badge></div>
        <div className="font-extrabold text-[16px] mt-1">{events[k].n}</div>
        <div className="text-[12px] text-mute mt-0.5">{events[k].d}</div>
      </div>
      <input type="range" min={0} max={events.length - 1} value={k} onChange={(e) => setK(+e.target.value)} className="w-full mt-3 accent-[#ffc53d]" />
    </Asset>
  );
}

/* ============ 8. WORLD CLOCKS ============ */
function WorldClocks() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const h = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(h); }, []);
  const zones = [
    { n: "Нью-Йорк", o: -4, open: [9, 16] }, { n: "Лондон", o: 1, open: [8, 16] }, { n: "Токио", o: 9, open: [9, 15] }, { n: "Сидней", o: 11, open: [10, 16] },
  ];
  const fmt = (o: number) => { const d = new Date(now.getTime() + (o * 3600 + now.getTimezoneOffset() * 60) * 1000); return { t: d.toTimeString().slice(0, 5), h: d.getHours() + d.getMinutes() / 60 }; };
  return (
    <Asset title="World Sessions" id="time.world" desc="Биржевые сессии мира: местное время, открыт/закрыт рынок, прогресс сессии.">
      <div className="space-y-2.5">
        {zones.map((z) => {
          const { t, h } = fmt(z.o);
          const isOpen = h >= z.open[0] && h < z.open[1];
          const p = isOpen ? ((h - z.open[0]) / (z.open[1] - z.open[0])) * 100 : h < z.open[0] ? 0 : 100;
          return (
            <div key={z.n} className="raised !rounded-2xl px-3.5 py-2.5 flex items-center gap-3">
              <span className={cn("size-2.5 rounded-full shrink-0", isOpen ? "bg-bull animate-pulse" : "bg-dim")} />
              <div className="w-24"><div className="text-[12.5px] font-extrabold">{z.n}</div><div className="text-[10px] text-dim font-bold num">{z.open[0]}:00–{z.open[1]}:00</div></div>
              <div className="flex-1 h-2 rounded-full bg-[#0a1330] overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-1000", isOpen ? "bg-gradient-to-r from-bull to-cyan" : "bg-[#22366f]")} style={{ width: `${p}%` }} /></div>
              <span className="num text-[15px] font-extrabold w-12 text-right">{t}</span>
              <span className={cn("text-[9.5px] font-extrabold uppercase w-12 text-right", isOpen ? "text-bull" : "text-dim")}>{isOpen ? "open" : "closed"}</span>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

export default function TimeLab() {
  return (
    <Section id="time" index="36" title="Time Lab" subtitle="8 временных механик: часы, отсчёт, помодоро, день/ночь, секундомер, привычки, таймлайн, сессии мира" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <AnalogClock />
        <CountdownHero />
        <Pomodoro />
        <DayNight />
        <Stopwatch />
        <HabitHeat />
        <TimelineScrub />
        <WorldClocks />
      </div>
    </Section>
  );
}
