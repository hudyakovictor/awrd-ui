import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

/* ============ 1. SPINNER WALL ============ */
function SpinnerWall() {
  const [speed, setSpeed] = useState(1);
  const cell = "inset !rounded-2xl h-[110px] grid place-items-center relative overflow-hidden";
  return (
    <Asset title="Spinner Wall" id="ldr.spin" desc="12 спиннеров в едином стиле: скорость общая, hover ускоряет конкретный." className="lg:col-span-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3" style={{ ["--sp" as string]: `${1 / speed}s` }}>
        <div className={cell}><div className="size-10 rounded-full border-4 border-[#1c3068] border-t-bull" style={{ animation: "spin-slow var(--sp) linear infinite" }} /><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">RING</span></div>
        <div className={cell}><div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-3 rounded-full bg-cyan" style={{ animation: `dot-bounce var(--sp) ${i * 0.13}s infinite` }} />)}</div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">DOTS</span></div>
        <div className={cell}><div className="flex items-end gap-1 h-9">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-2 rounded-full bg-gradient-to-t from-blue to-cyan" style={{ height: "100%", transformOrigin: "bottom", animation: `floaty var(--sp) ${i * 0.1}s ease-in-out infinite` }} />)}</div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">BARS</span></div>
        <div className={cell}><div className="relative size-11"><span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-gold" style={{ animation: "spin-slow var(--sp) linear infinite" }} /><span className="absolute inset-[7px] rounded-full border-[3px] border-transparent border-b-violet" style={{ animation: "spin-slow calc(var(--sp)*.7) linear infinite reverse" }} /></div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">ORBIT</span></div>
        <div className={cell} style={{ perspective: 200 }}><div style={{ animation: "coinflip calc(var(--sp)*1.2) ease-in-out infinite" }}><Glyph name="coin" size={44} /></div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">COIN</span></div>
        <div className={cell}><div className="size-10 rounded-xl bg-gradient-to-br from-blue to-violet" style={{ animation: "spin-slow var(--sp) cubic-bezier(.6,.1,.4,.9) infinite" }} /><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">SQUARE</span></div>
        <div className={cell}><div className="flex gap-0"><span className="size-4 rounded-full bg-bull" style={{ animation: `pulse-ring var(--sp) ease-out infinite` }} /><span className="size-4 rounded-full bg-bull/60 -ml-4" style={{ animation: `pulse-ring var(--sp) .5s ease-out infinite` }} /></div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">PULSE</span></div>
        <div className={cell}><svg viewBox="0 0 40 40" className="size-11"><circle cx="20" cy="20" r="16" fill="none" stroke="#16275a" strokeWidth="5" /><circle cx="20" cy="20" r="16" fill="none" stroke="#1fdb8b" strokeWidth="5" strokeLinecap="round" strokeDasharray="30 70" style={{ animation: "spin-slow var(--sp) linear infinite", transformOrigin: "20px 20px" }} /></svg><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">ARC</span></div>
        <div className={cell}><div className="grid grid-cols-2 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className="size-4 rounded-[5px] bg-violet" style={{ animation: `twinkle var(--sp) ${i * 0.15}s infinite` }} />)}</div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">GRID</span></div>
        <div className={cell}><div className="h-2 w-20 rounded-full bg-[#16275a] overflow-hidden"><div className="h-full w-1/2 rounded-full bg-gradient-to-r from-bull to-cyan" style={{ animation: "wave-x var(--sp) linear infinite alternate" }} /></div><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">SLIDE</span></div>
        <div className={cell}><Icon name="candles" size={34} className="text-bull" style={{ animation: "flicker var(--sp) ease-in-out infinite" }} /><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">FLICK</span></div>
        <div className={cell}><div className="size-10 rounded-full border-4 border-dashed border-cyan" style={{ animation: "spin-slow calc(var(--sp)*1.4) linear infinite" }} /><span className="absolute bottom-1.5 text-[9px] font-extrabold text-dim">DASH</span></div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-[11px] font-bold text-dim">Speed</span>
        <input type="range" min={25} max={250} value={speed * 100} onChange={(e) => setSpeed(+e.target.value / 100)} className="flex-1 accent-[#1fdb8b]" />
        <span className="num text-[11px] font-extrabold">{speed.toFixed(2)}x</span>
      </div>
    </Asset>
  );
}

/* ============ 2. SKELETON THEATER ============ */
function Skeletons() {
  const [mode, setMode] = useState<"shimmer" | "pulse" | "wave">("shimmer");
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!loading) { const h = setTimeout(() => setLoading(true), 4000); return () => clearTimeout(h); } }, [loading]);
  const rows = [0, 1, 2];
  return (
    <Asset title="Skeleton Theater" id="ldr.skel" desc="Три режима скелетонов: shimmer-блик, пульс, волна по строкам. Переключение в контент.">
      <div className="flex gap-2 mb-3">
        {(["shimmer", "pulse", "wave"] as const).map((m) => <Btn3D key={m} size="xs" variant={mode === m ? "blue" : "neutral"} onClick={() => { setMode(m); setLoading(true); }}>{m}</Btn3D>)}
        <Btn3D size="xs" variant={loading ? "bull" : "neutral"} className="ml-auto" onClick={() => { setLoading(!loading); sfx.tap(); }}>{loading ? "Show content" : "Show skeleton"}</Btn3D>
      </div>
      <div className="inset !rounded-2xl p-3 space-y-3 min-h-[210px]">
        {loading ? rows.map((r) => (
          <div key={r} className="flex items-center gap-3" style={mode === "wave" ? { animation: `fade-in .6s ${r * 0.18}s both` } : undefined}>
            <div className={cn("size-11 !rounded-xl shrink-0", mode === "shimmer" && "skeleton", mode === "pulse" && "bg-[#16275a] rounded-xl", mode === "pulse" && "anim-glow")} style={mode === "wave" ? { background: "#16275a", borderRadius: 12, animation: `pulse-soft 1.4s ${r * 0.2}s ease-in-out infinite` } : undefined} />
            <div className="flex-1 space-y-2">
              <div className={cn("h-3 rounded-md", mode === "shimmer" && "skeleton", mode !== "shimmer" && "bg-[#16275a]")} style={{ width: `${72 - r * 9}%`, animation: mode !== "shimmer" ? `pulse-soft 1.4s ${r * 0.2}s ease-in-out infinite` : undefined }} />
              <div className={cn("h-2.5 rounded-md w-2/5", mode === "shimmer" && "skeleton", mode !== "shimmer" && "bg-[#16275a]")} style={{ animation: mode !== "shimmer" ? `pulse-soft 1.4s ${r * 0.2 + 0.1}s ease-in-out infinite` : undefined }} />
            </div>
            <div className={cn("h-7 w-14 rounded-lg", mode === "shimmer" && "skeleton", mode !== "shimmer" && "bg-[#16275a]")} />
          </div>
        )) : (
          [["BTC", "+2.4%", true], ["ETH", "−1.1%", false], ["SOL", "+6.8%", true]].map(([s, c, u], i) => (
            <div key={s as string} className="flex items-center gap-3 anim-fade" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="size-11 rounded-xl bg-[#1c3068] grid place-items-center font-extrabold">{(s as string)[0]}</div>
              <div className="flex-1"><div className="text-[13px] font-extrabold">{s}</div><div className="text-[11px] text-dim">Spot · demo</div></div>
              <span className={cn("num text-[12px] font-extrabold", u ? "text-bull" : "text-bear")}>{c}</span>
            </div>
          ))
        )}
      </div>
    </Asset>
  );
}

/* ============ 3. PROGRESS BARS SHOWCASE ============ */
function ProgressShow() {
  const [p, setP] = useState(34);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (p >= 100) { setRun(false); sfx.success(); return; }
    const h = setTimeout(() => setP((v) => Math.min(100, v + Math.random() * 7)), 130);
    return () => clearTimeout(h);
  }, [run, p]);
  const bar = (inner: React.ReactNode, label: string, right: React.ReactNode) => (
    <div><div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-mute">{label}</span><span className="num">{right}</span></div>{inner}</div>
  );
  return (
    <Asset title="Progress Bars" id="ldr.bars" desc="6 стилей линеек: глянец, полоски, сегменты, градиент-свечение, ступени, двухцветный сплит.">
      <div className="space-y-4">
        {bar(<div className="inset !rounded-full p-[3px] h-5"><div className="h-full rounded-full bg-gradient-to-b from-[#5af5b4] to-[#12c47a] relative transition-all duration-200" style={{ width: `${p}%` }}><div className="absolute inset-x-2 top-[3px] h-[26%] rounded-full bg-white/40" /></div></div>, "Gloss", `${Math.round(p)}%`)}
        {bar(<div className="inset !rounded-full p-[3px] h-5"><div className="h-full rounded-full bg-gradient-to-b from-[#6a9dff] to-[#2f67ea] relative overflow-hidden transition-all duration-200" style={{ width: `${p}%` }}><div className="absolute inset-0 stripes opacity-70" /></div></div>, "Striped", `${Math.round(p)}%`)}
        {bar(<div className="flex gap-1">{Array.from({ length: 12 }).map((_, i) => <div key={i} className={cn("h-4 flex-1 rounded-md transition-all duration-200", i < Math.floor(p / 8.4) ? "bg-gradient-to-b from-[#ffdc7a] to-[#f0a811] shadow-[0_2px_0_#b8780a]" : "bg-[#16275a]")} />)}</div>, "Segments", `${Math.floor(p / 8.4)}/12`)}
        {bar(<div className="h-3 rounded-full bg-[#16275a]"><div className="h-full rounded-full transition-all duration-200" style={{ width: `${p}%`, background: "linear-gradient(90deg,#1fdb8b,#2ed3f0,#8d5cff)", boxShadow: "0 0 16px rgba(46,211,240,.6)" }} /></div>, "Neon glow", `${Math.round(p)}%`)}
        {bar(<div className="h-5 rounded-full bg-[#16275a] relative overflow-hidden"><div className="absolute inset-y-0 left-0 bg-gold transition-all duration-200" style={{ width: `${Math.floor(p / 25) * 25}%` }} /><div className="absolute inset-0 flex">{[25, 50, 75].map((x) => <span key={x} className="absolute inset-y-0 w-[2px] bg-ink-900" style={{ left: `${x}%` }} />)}</div></div>, "Stepped 25%", `${Math.floor(p / 25) * 25}%`)}
        {bar(<div className="flex h-4 rounded-full overflow-hidden"><div className="bg-bull transition-all duration-200" style={{ width: `${p}%` }} /><div className="bg-bear flex-1" /></div>, "Split bull/bear", `${Math.round(p)}/${100 - Math.round(p)}`)}
      </div>
      <div className="flex gap-2 mt-4">
        <Btn3D size="sm" variant="neutral" onClick={() => setP(0)}>Reset</Btn3D>
        <Btn3D size="sm" variant="blue" full loading={run} onClick={() => { if (p >= 100) setP(0); setRun(true); }}>Simulate download</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 4. RINGS ============ */
function Rings() {
  const [v, setV] = useState(64);
  const ring = (size: number, val: number, c1: string, c2: string, w: number, extra?: React.ReactNode) => {
    const r = (size - w) / 2, C = 2 * Math.PI * r;
    return (
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a1330" strokeWidth={w} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#rg${c1.slice(1)}${size})`} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${(C * val) / 100} ${C}`} style={{ transition: "stroke-dasharray .6s cubic-bezier(.3,1.2,.4,1)" }} />
          <defs><linearGradient id={`rg${c1.slice(1)}${size}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">{extra ?? <span className="num text-[20px] font-extrabold">{Math.round(val)}%</span>}</div>
      </div>
    );
  };
  return (
    <Asset title="Progress Rings" id="ldr.rings" desc="Кольца разных размеров и градиентов + тикающий таймер-кольцо 10с.">
      <div className="flex items-end justify-center gap-5">
        {ring(120, v, "#1fdb8b", "#2ed3f0", 12)}
        {ring(96, 100 - v, "#8d5cff", "#ff4d9a", 10, <Icon name="bolt" size={26} className="text-[#b89bff]" />)}
        {ring(76, (v * 1.4) % 100, "#ffc53d", "#ff8a3d", 9, <span className="num text-[13px] font-extrabold">{Math.round((v * 1.4) % 100)}</span>)}
      </div>
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} className="w-full mt-4 accent-[#1fdb8b]" />
      <CountdownRing />
    </Asset>
  );
}
function CountdownRing() {
  const [t, setT] = useState(10);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (t <= 0) { setRun(false); sfx.levelUp(); return; }
    const h = setTimeout(() => { setT((x) => x - 1); sfx.tick(); }, 1000);
    return () => clearTimeout(h);
  }, [run, t]);
  const C = 2 * Math.PI * 20;
  return (
    <div className="flex items-center gap-3 mt-4 inset !rounded-2xl p-3">
      <div className="relative size-12">
        <svg viewBox="0 0 48 48" className="-rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="#16275a" strokeWidth="5" /><circle cx="24" cy="24" r="20" fill="none" stroke={t <= 3 ? "#ff4d6a" : "#3d7bff"} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(t / 10) * C} ${C}`} style={{ transition: "stroke-dasharray 1s linear" }} /></svg>
        <span className="absolute inset-0 grid place-items-center num text-[14px] font-extrabold">{t}</span>
      </div>
      <div className="flex-1 text-[11.5px] font-bold text-mute">До закрытия свечи</div>
      <Btn3D size="xs" variant={run ? "neutral" : "blue"} onClick={() => { if (t <= 0) setT(10); setRun(!run); }}>{run ? "Pause" : "Start"}</Btn3D>
    </div>
  );
}

/* ============ 5. TYPING / SENDING ============ */
function TypingStates() {
  const [st, setSt] = useState(0);
  const states = ["Печатает…", "Отправка…", "Доставлено ✓", "Прочитано ✓✓"];
  useEffect(() => { const h = setInterval(() => setSt((s) => (s + 1) % 4), 1800); return () => clearInterval(h); }, []);
  return (
    <Asset title="Typing & Sending" id="ldr.typing" desc="Состояния чата поддержки: прыгающие точки, спиннер отправки, галочки доставки.">
      <div className="inset !rounded-2xl p-4 space-y-3 min-h-[190px]">
        <div className="flex justify-start"><div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#1c3068] px-4 py-2.5 text-[12.5px] font-semibold">Привет! Как поставить стоп-лосс?</div></div>
        <div className="flex justify-end">
          {st === 0 && <div className="rounded-2xl rounded-br-md bg-blue/20 border border-blue/40 px-4 py-3 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-[#8fb3ff]" style={{ animation: `dot-bounce 1s ${i * 0.15}s infinite` }} />)}</div>}
          {st === 1 && <div className="rounded-2xl rounded-br-md bg-blue/20 border border-blue/40 px-4 py-2.5 text-[12px] font-bold text-[#8fb3ff] flex items-center gap-2"><span className="size-4 rounded-full border-2 border-blue/30 border-t-[#8fb3ff] animate-spin" />Отправка…</div>}
          {st >= 2 && <div className="rounded-2xl rounded-br-md bg-blue/20 border border-blue/40 px-4 py-2.5 text-[12.5px] font-semibold anim-fade">Открой тикет ордера → включи TP/SL <span className={cn("ml-1 font-extrabold", st === 3 ? "text-cyan" : "text-dim")}>{st === 3 ? "✓✓" : "✓"}</span></div>}
        </div>
        <div className="flex gap-1.5 pt-1">{states.map((s, i) => <span key={s} className={cn("flex-1 h-1 rounded-full transition-colors", i <= st ? "bg-blue" : "bg-[#16275a]")} />)}</div>
        <div className="text-[10.5px] font-bold text-dim text-center">{states[st]}</div>
      </div>
    </Asset>
  );
}

/* ============ 6. LAUNCH SCREEN ============ */
function LaunchScreen() {
  const [k, setK] = useState(0);
  const [tips] = useState(["Совет: стоп-лосс спасает депозит", "Совет: рискуй не больше 1%", "Совет: тренд — твой друг"]);
  const [ti] = useState(() => (Math.random() * tips.length) | 0);
  return (
    <Asset title="Launch Screen" id="ldr.launch" desc="Сплэш запуска: лого поп, полоса загрузки, сменяющийся совет. Перезапуск по кнопке.">
      <div key={k} className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0c1a46] to-[#070d1f] border border-white/10 h-[210px] grid place-items-center">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(140,170,255,.4) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative text-center px-6">
          <div className="size-16 mx-auto rounded-2xl bg-gradient-to-b from-[#5af5b4] to-[#12c47a] grid place-items-center shadow-[0_5px_0_#0d9a5c] anim-pop"><Icon name="trendUp" size={32} stroke={3} className="text-[#03261a]" /></div>
          <div className="font-extrabold text-[20px] mt-3 anim-fade" style={{ animationDelay: ".15s" }}>Tradelingo<span className="text-bull">.</span></div>
          <div className="w-48 h-2.5 rounded-full bg-[#16275a] mx-auto mt-4 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-bull to-cyan origin-left" style={{ animation: "progress-fill 1.8s cubic-bezier(.3,.8,.3,1) .3s both" }} /></div>
          <div className="text-[11px] text-mute font-semibold mt-2.5 anim-fade" style={{ animationDelay: ".5s" }}>{tips[ti]}</div>
        </div>
      </div>
      <Btn3D size="xs" variant="neutral" full className="mt-3" icon={<Icon name="refresh" size={12} />} onClick={() => { setK(k + 1); sfx.whoosh(); }}>Relaunch</Btn3D>
    </Asset>
  );
}

/* ============ 7. STEPS LOADER ============ */
function StepsLoader() {
  const steps = ["Подключение", "Котировки", "Портфель", "Готово"];
  const [s, setS] = useState(0);
  const [run, setRun] = useState(false);
  const timer = useRef(0);
  const start = () => {
    if (run) return;
    setRun(true); setS(0); sfx.tap();
    let i = 0;
    const tick = () => { i++; setS(i); sfx.tick(); if (i < steps.length) timer.current = window.setTimeout(tick, 700 + Math.random() * 500); else { setRun(false); sfx.success(); } };
    timer.current = window.setTimeout(tick, 600);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Asset title="Steps Loader" id="ldr.steps" desc="Пошаговая загрузка со статусами: спиннер → галочка, коннекторы заполняются.">
      <div className="inset !rounded-2xl p-4">
        {steps.map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("size-8 rounded-full grid place-items-center border-2 transition-all duration-300", i < s ? "bg-bull border-bull text-ink-900" : i === s && run ? "border-blue" : "border-[#26397a] text-dim")}>
                {i < s ? <Icon name="check" size={16} stroke={3.2} className="anim-pop" /> : i === s && run ? <span className="size-4 rounded-full border-2 border-blue/30 border-t-blue animate-spin" /> : <span className="num text-[12px] font-extrabold">{i + 1}</span>}
              </span>
              {i < steps.length - 1 && <span className="w-[3px] h-5 rounded-full bg-[#16275a] relative overflow-hidden"><span className={cn("absolute inset-0 bg-bull transition-transform duration-500 origin-top", i < s ? "scale-y-100" : "scale-y-0")} /></span>}
            </div>
            <span className={cn("text-[13px] font-bold pb-1", i < s ? "text-txt" : i === s && run ? "text-[#8fb3ff]" : "text-dim")}>{t}{i === s && run && <span className="ml-2 text-[11px]">…</span>}{i < s && <Badge tone="bull" size="xs" className="ml-2">done</Badge>}</span>
          </div>
        ))}
      </div>
      <Btn3D size="sm" variant="blue" full className="mt-3" loading={run} onClick={start}>{run ? "Loading…" : s >= steps.length ? "Load again" : "Start loading"}</Btn3D>
    </Asset>
  );
}

export default function Loaders() {
  return (
    <Section id="loaders" index="24" title="Loaders & Skeletons" subtitle="7 групп состояний загрузки: 12 спиннеров, 3 режима скелетонов, 6 баров, кольца, чат-статусы, сплэш, шаги" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SpinnerWall />
        <Skeletons />
        <ProgressShow />
        <Rings />
        <TypingStates />
        <LaunchScreen />
        <StepsLoader />
      </div>
    </Section>
  );
}
