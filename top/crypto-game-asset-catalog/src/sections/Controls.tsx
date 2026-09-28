import { useEffect, useRef, useState } from "react";
import { Bell, Check, ChevronRight, Heart, Loader2, Minus, Plus, Settings, Share2, AlertTriangle, CircleDollarSign, Bitcoin } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Label, Toggle, toneHex, type Tone } from "../kit/ui";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function Buttons() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const run = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => { setState("done"); sfx.correct(); }, 1300);
    setTimeout(() => setState("idle"), 2800);
  };
  return (
    <Asset code="B-001" title="Tactile Button System" desc="Толстые 3D-кнопки с физическим нажатием, бликом и состояниями." hint="Нажми и удерживай" specs={["depth 5px", "press 90ms", "7 tones"]}>
      <div className="space-y-3">
        <Btn tone="bull" block size="lg">Continue</Btn>
        <div className="grid grid-cols-2 gap-3">
          <Btn tone="bull"><span className="text-base leading-none">▲</span> Long</Btn>
          <Btn tone="bear"><span className="text-base leading-none">▼</span> Short</Btn>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Btn tone="sky" size="sm">Primary</Btn>
          <Btn tone="gold" size="sm" className="!text-[#3b2600]">Premium</Btn>
          <Btn tone="violet" size="sm">Legend</Btn>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <GhostBtn>Skip</GhostBtn>
          <Btn disabled>Locked</Btn>
        </div>
        <Btn tone={state === "done" ? "bull" : "sky"} block onClick={run} silent>
          {state === "loading" ? <><Loader2 size={16} className="anim-spin" /> Placing order…</> : state === "done" ? <><Check size={16} className="anim-pop" /> Order filled</> : <>Place order <ChevronRight size={16} /></>}
        </Btn>
      </div>
    </Asset>
  );
}

function HoldToConfirm() {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef<number>(0);
  const start = useRef(0);
  const HOLD = 1200;
  const tick = () => {
    const v = Math.min(1, (performance.now() - start.current) / HOLD);
    setP(v);
    if (Math.floor(v * 10) !== Math.floor((v - 0.016) * 10)) sfx.tick();
    if (v >= 1) {
      setDone(true);
      sfx.levelUp();
      setTimeout(() => { setDone(false); setP(0); }, 2200);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const down = () => { if (done) return; start.current = performance.now(); raf.current = requestAnimationFrame(tick); };
  const up = () => { cancelAnimationFrame(raf.current); if (!done) setP(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const R = 58, C = 2 * Math.PI * R;
  return (
    <Asset code="B-002" title="Hold-to-Trade" desc="Защита от случайной сделки: удержание 1.2 c с кольцом прогресса и хаптикой." hint="Удерживай кнопку" specs={["1200ms", "ring", "haptic"]}>
      <div className="flex flex-col items-center py-2">
        <div className="relative grid h-40 w-40 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={R} stroke="#0b1530" strokeWidth="10" fill="none" />
            <circle cx="64" cy="64" r={R} stroke={done ? "#22d39a" : "#ffc53d"} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} style={{ filter: `drop-shadow(0 0 6px ${done ? "#22d39a" : "#ffc53d"})` }} />
          </svg>
          {done && [...Array(12)].map((_, i) => (
            <span key={i} className="absolute h-2 w-2 rounded-full" style={{ background: i % 2 ? "#22d39a" : "#ffc53d", ["--dx" as string]: `${Math.cos((i / 12) * 6.28) * 90}px`, ["--dy" as string]: `${Math.sin((i / 12) * 6.28) * 90}px`, ["--rot" as string]: "180deg", animation: "confetti-fall .8s ease-out forwards" }} />
          ))}
          <button
            onPointerDown={down}
            onPointerUp={up}
            onPointerLeave={up}
            onContextMenu={(e) => e.preventDefault()}
            className="btn3d h-28 w-28 !rounded-full text-[11px]"
            data-pressed={p > 0 && !done}
            style={{ ["--c" as string]: done ? "var(--color-bull)" : "var(--color-bull)", ["--cd" as string]: "var(--color-bull-d)", ["--depth" as string]: "6px", transform: p > 0 && !done ? `translateY(6px) scale(${1 - p * 0.06})` : undefined }}
          >
            {done ? <Check size={36} className="anim-pop" /> : <span className="leading-tight">HOLD<br />TO BUY</span>}
          </button>
        </div>
        <div className="num mt-3 text-sm font-bold">{done ? <span className="text-bull">0.015 BTC bought ✓</span> : <span className="text-mist">{Math.round(p * 100)}% · 0.015 BTC</span>}</div>
      </div>
    </Asset>
  );
}

function IconButtons() {
  const [n, setN] = useState(3);
  const [liked, setLiked] = useState(false);
  const [spin, setSpin] = useState(0);
  const items: { i: React.ReactNode; tone: Tone; on: () => void; badge?: number; label: string }[] = [
    { i: <Bell size={22} className={n ? "anim-wiggle" : ""} key={n} />, tone: "sky", on: () => setN((v) => (v >= 99 ? 0 : v + 1)), badge: n, label: "Alerts" },
    { i: <Heart size={22} fill={liked ? "currentColor" : "none"} className={liked ? "anim-pop" : ""} />, tone: "bear", on: () => setLiked((l) => !l), label: "Watch" },
    { i: <Settings size={22} style={{ transform: `rotate(${spin}deg)`, transition: "transform .6s cubic-bezier(.3,1.6,.5,1)" }} />, tone: "violet", on: () => setSpin((s) => s + 120), label: "Settings" },
    { i: <Share2 size={22} />, tone: "cyan", on: () => {}, label: "Share" },
  ];
  return (
    <Asset code="B-003" title="Icon Buttons & Badges" desc="Круглые и квадратные тактильные иконки со счётчиками и микро-анимацией." hint="Жми на колокол" specs={["48/56", "badge pop", "a11y label"]}>
      <div className="grid grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col items-center gap-2">
            <button aria-label={it.label} onClick={() => { sfx.tap(); it.on(); }} className="btn3d relative h-14 w-14 !overflow-visible !rounded-2xl !p-0" style={{ ["--c" as string]: toneHex[it.tone], ["--cd" as string]: `color-mix(in oklab, ${toneHex[it.tone]} 60%, black)` }}>
              {it.i}
              {!!it.badge && (
                <span key={it.badge} className="num anim-pop absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full border-2 border-ink-700 bg-bear px-1 text-[10px] font-extrabold">
                  {it.badge}
                </span>
              )}
            </button>
            <span className="text-[10px] font-bold text-mist">{it.label}</span>
          </div>
        ))}
      </div>
      <Label><span className="mt-5 block">Pill / FAB</span></Label>
      <div className="flex items-center gap-3">
        <button onClick={() => sfx.tap()} className="btn-ghost3d h-11 !rounded-full px-4 text-[11px]"><Plus size={14} /> Add to watchlist</button>
        <button onClick={() => sfx.tap()} className="btn3d ml-auto h-14 w-14 !rounded-full" style={{ ["--c" as string]: "var(--color-gold)", ["--cd" as string]: "var(--color-gold-d)" }}>
          <Plus size={26} strokeWidth={3} className="text-[#3b2600]" />
        </button>
      </div>
    </Asset>
  );
}

function AmountInput() {
  const bal = 2450;
  const [v, setV] = useState("250");
  const [cur, setCur] = useState<"USD" | "BTC">("USD");
  const [focus, setFocus] = useState(false);
  const [shake, setShake] = useState(0);
  const num = parseFloat(v) || 0;
  const usd = cur === "USD" ? num : num * 64218;
  const err = v !== "" && (usd < 10 ? "Минимум $10" : usd > bal ? "Недостаточно средств" : null);
  const ok = v !== "" && !err;
  const color = err ? "#ff4f6d" : focus ? "#3b82ff" : ok ? "#22d39a" : "#273f75";
  useEffect(() => { if (err) { setShake((s) => s + 1); sfx.error(); } }, [err]);
  return (
    <Asset code="B-004" title="Amount Field" desc="Поле суммы: фокус, успех, ошибка, быстрые доли и смена валюты." hint="Попробуй 5000" specs={["focus ring", "validate", "quick %"]}>
      <Label>Order size</Label>
      <div key={err ? shake : "s"} className={cn("relative rounded-2xl transition-all", err && "anim-shake")} style={{ boxShadow: `0 0 0 2px ${color}, 0 0 ${focus || err ? 18 : 0}px ${color}66` }}>
        <div className="panel-inset flex items-center gap-2 !rounded-2xl px-4">
          {cur === "USD" ? <CircleDollarSign size={20} className="text-bull" /> : <Bitcoin size={20} className="text-gold" />}
          <input
            inputMode="decimal"
            value={v}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => setV(e.target.value.replace(/[^0-9.]/g, ""))}
            className="num h-14 w-full bg-transparent text-2xl font-extrabold outline-none"
            placeholder="0.00"
          />
          <button onClick={() => { setCur((c) => (c === "USD" ? "BTC" : "USD")); setV(""); sfx.toggle(true); }} className="rounded-xl bg-ink-700 px-3 py-1.5 text-[11px] font-extrabold shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none">
            {cur} ⇅
          </button>
        </div>
      </div>
      <div className="mt-2 flex h-5 items-center justify-between text-[11px] font-bold">
        {err ? <span className="flex items-center gap-1 text-bear"><AlertTriangle size={12} /> {err}</span> : ok ? <span className="flex items-center gap-1 text-bull"><Check size={12} /> ≈ ${usd.toFixed(2)}</span> : <span className="text-mist">Введите сумму</span>}
        <span className="num text-mist">Bal ${bal.toLocaleString()}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((p) => (
          <button key={p} onClick={() => { sfx.tick(); const u = (bal * p) / 100; setV(cur === "USD" ? u.toFixed(0) : (u / 64218).toFixed(5)); }} className="num h-10 rounded-xl bg-ink-800 text-xs font-extrabold text-mist shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_3px_0_#08112a] transition hover:text-white active:translate-y-[3px] active:shadow-none">
            {p === 100 ? "MAX" : `${p}%`}
          </button>
        ))}
      </div>
    </Asset>
  );
}

function Leverage() {
  const [lev, setLev] = useState(10);
  const risk = lev <= 5 ? { t: "Low", c: "#22d39a" } : lev <= 20 ? { t: "Medium", c: "#ffc53d" } : lev <= 50 ? { t: "High", c: "#ff8a3d" } : { t: "Extreme", c: "#ff4f6d" };
  const entry = 64218;
  const liq = entry * (1 - 1 / lev + 0.004);
  const pct = ((lev - 1) / 99) * 100;
  return (
    <Asset code="B-005" title="Leverage Slider" desc="Слайдер плеча с цветом риска, рисками и расчётом ликвидации в реальном времени." hint="Тяни ползунок" specs={["1–100x", "risk tint", "live calc"]}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="num text-4xl font-extrabold transition-colors" style={{ color: risk.c, textShadow: `0 0 20px ${risk.c}66` }}>{lev}x</div>
          <div className="text-[11px] font-bold text-mist">Leverage</div>
        </div>
        <span key={risk.t} className={cn("anim-pop rounded-xl px-3 py-1.5 text-[11px] font-extrabold uppercase", lev > 50 && "anim-shake")} style={{ color: risk.c, background: `${risk.c}1c`, boxShadow: `inset 0 0 0 1.5px ${risk.c}66` }}>
          {lev > 50 && "⚠ "}{risk.t} risk
        </span>
      </div>
      <div className="relative">
        <div className="panel-inset absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 !rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22d39a,#ffc53d 30%,#ff8a3d 60%,#ff4f6d)", backgroundSize: `${100 / Math.max(pct, 1) * 100}% 100%` }} />
        </div>
        <input type="range" min={1} max={100} value={lev} onChange={(e) => { setLev(+e.target.value); sfx.tick(); }} className="range-3d" aria-label="Leverage" />
      </div>
      <div className="mt-1 flex justify-between">
        {[1, 10, 25, 50, 75, 100].map((m) => (
          <button key={m} onClick={() => { setLev(m); sfx.tap(); }} className={cn("num text-[10px] font-bold transition", lev === m ? "text-white" : "text-mist hover:text-white")}>{m}x</button>
        ))}
      </div>
      <div className="panel-inset mt-4 grid grid-cols-2 divide-x divide-white/5 p-3">
        <div className="px-2">
          <div className="text-[10px] font-bold uppercase text-mist">Entry</div>
          <div className="num text-sm font-bold">${entry.toLocaleString()}</div>
        </div>
        <div className="px-3">
          <div className="text-[10px] font-bold uppercase text-mist">Liquidation</div>
          <div className="num text-sm font-bold" style={{ color: risk.c }}>${liq.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>
    </Asset>
  );
}

function Selection() {
  const [checks, setChecks] = useState([true, false, true]);
  const [radio, setRadio] = useState(1);
  const [tg, setTg] = useState({ sound: true, haptic: true, push: false });
  const [seg, setSeg] = useState(0);
  const segs = ["Market", "Limit", "Stop"];
  return (
    <Asset code="B-006" title="Selection Controls" desc="Чекбоксы с отрисовкой галочки, радио, свитчи и сегмент-контрол со скользящей плашкой." hint="Переключай всё" specs={["spring", "draw check", "slide"]}>
      <div className="panel-inset relative mb-5 grid grid-cols-3 p-1.5 !rounded-2xl">
        <span className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-b from-sky to-sky-d shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_3px_0_#15398f] transition-all duration-300 [transition-timing-function:cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${(seg * 100) / 3}% + 6px)`, width: "calc(33.33% - 12px)" }} />
        {segs.map((s, i) => (
          <button key={s} onClick={() => { setSeg(i); sfx.tick(); }} className={cn("relative z-10 h-10 text-xs font-extrabold transition-colors", seg === i ? "text-white" : "text-mist")}>{s}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          {["Stop-loss", "Take-profit", "Trailing"].map((l, i) => (
            <button key={l} onClick={() => { const c = [...checks]; c[i] = !c[i]; setChecks(c); sfx.toggle(c[i]); }} className="flex items-center gap-2.5 text-[13px] font-bold">
              <span className={cn("grid h-7 w-7 place-items-center rounded-lg transition-all", checks[i] ? "bg-bull shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_3px_0_#10916a]" : "bg-ink-900 shadow-[inset_0_2px_4px_rgba(0,0,0,.5)]")}>
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M5 12l5 5 9-10" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset={checks[i] ? 0 : 24} style={{ transition: "stroke-dashoffset .3s ease" }} />
                </svg>
              </span>
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {["Beginner", "Trader", "Whale"].map((l, i) => (
            <button key={l} onClick={() => { setRadio(i); sfx.tick(); }} className="flex items-center gap-2.5 text-[13px] font-bold">
              <span className={cn("grid h-7 w-7 place-items-center rounded-full transition-all", radio === i ? "bg-violet shadow-[0_3px_0_#5a33c7]" : "bg-ink-900 shadow-[inset_0_2px_4px_rgba(0,0,0,.5)]")}>
                <span className={cn("h-3 w-3 rounded-full bg-white transition-transform duration-300 [transition-timing-function:cubic-bezier(.3,1.8,.5,1)]", radio === i ? "scale-100" : "scale-0")} />
              </span>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2.5 border-t border-white/5 pt-4">
        {([["sound", "Sound FX", "bull"], ["haptic", "Haptics", "sky"], ["push", "Price alerts", "gold"]] as const).map(([k, l, t]) => (
          <div key={k} className="flex items-center justify-between text-[13px] font-bold">
            {l}
            <Toggle on={tg[k]} tone={t} onChange={(v) => setTg({ ...tg, [k]: v })} />
          </div>
        ))}
      </div>
    </Asset>
  );
}

function StepperChips() {
  const [q, setQ] = useState(3);
  const iv = useRef<number>(0);
  const hold = (d: number) => {
    const step = () => setQ((v) => { const n = Math.max(0, Math.min(99, v + d)); if (n !== v) sfx.tick(); return n; });
    step();
    iv.current = window.setTimeout(function rep() { step(); iv.current = window.setTimeout(rep, 70); }, 380);
  };
  const stop = () => clearTimeout(iv.current);
  const coins = [["BTC", "#f7931a"], ["ETH", "#8b9dff"], ["SOL", "#22d39a"], ["TON", "#2bd9ff"], ["DOGE", "#ffc53d"], ["XRP", "#e8eeff"]];
  const [sel, setSel] = useState<string[]>(["BTC", "SOL"]);
  return (
    <Asset code="B-007" title="Stepper & Filter Chips" desc="Степпер с авто-повтором при удержании и мультивыбор монет." hint="Удерживай +" specs={["repeat 70ms", "multi-select"]}>
      <Label>Lots</Label>
      <div className="panel-inset flex items-center justify-between p-2 !rounded-2xl">
        {[-1, 1].map((d) => (
          <button key={d} onPointerDown={() => hold(d)} onPointerUp={stop} onPointerLeave={stop} className={cn("btn3d h-12 w-12 !rounded-xl !p-0", d > 0 && "order-3")} style={{ ["--c" as string]: d > 0 ? "var(--color-bull)" : "var(--color-bear)", ["--cd" as string]: d > 0 ? "var(--color-bull-d)" : "var(--color-bear-d)", ["--depth" as string]: "4px" }}>
            {d > 0 ? <Plus size={20} strokeWidth={3} /> : <Minus size={20} strokeWidth={3} />}
          </button>
        ))}
        <div className="order-2 text-center">
          <div key={q} className="num anim-pop text-3xl font-extrabold">{q}</div>
          <div className="text-[10px] font-bold uppercase text-mist">× 0.001 BTC</div>
        </div>
      </div>
      <Label><span className="mt-5 block">Markets · {sel.length} selected</span></Label>
      <div className="flex flex-wrap gap-2">
        {coins.map(([c, col]) => {
          const on = sel.includes(c);
          return (
            <button key={c} onClick={() => { setSel(on ? sel.filter((x) => x !== c) : [...sel, c]); sfx.toggle(!on); }} className={cn("flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-extrabold transition-all active:scale-95", on ? "text-white" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")} style={on ? { background: `${col}26`, boxShadow: `inset 0 0 0 2px ${col}, 0 3px 0 ${col}55` } : undefined}>
              <span className="h-2.5 w-2.5 rounded-full transition-transform" style={{ background: col, transform: on ? "scale(1.2)" : "scale(.8)" }} />
              {c}
              {on && <Check size={12} className="anim-pop" />}
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

export default function Controls() {
  return (
    <Section id="controls" index="02" title="Controls" subtitle="Кнопки, поля, слайдеры, переключатели — всё тактильное">
      <Buttons />
      <HoldToConfirm />
      <IconButtons />
      <AmountInput />
      <Leverage />
      <Selection />
      <StepperChips />
    </Section>
  );
}
