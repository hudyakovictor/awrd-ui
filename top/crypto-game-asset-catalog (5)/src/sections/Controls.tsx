import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Check, Confetti, Label, Section, Toggle, Tooltip, useToast, type Variant } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* ---------- Button matrix ---------- */
function ButtonMatrix() {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const run = (k: string) => { setLoading(k); setTimeout(() => { setLoading(null); setDone(k); sfx.success(); setTimeout(() => setDone(null), 1200); }, 1400); };
  const rows: { v: Variant; label: string; icon: string }[] = [
    { v: "blue", label: "Continue", icon: "chevR" }, { v: "bull", label: "Buy", icon: "trendUp" }, { v: "bear", label: "Sell", icon: "trendDown" },
    { v: "gold", label: "Claim", icon: "gift" }, { v: "violet", label: "Go Pro", icon: "crown" }, { v: "neutral", label: "Skip", icon: "chevR" }, { v: "ghost", label: "Later", icon: "clock" },
  ];
  return (
    <Asset title="Button System · 3D Tactile" id="ctl.button" desc="7 вариантов × 4 состояния. Настоящее нажатие: губа уходит, ripple, звук, вибро. Клик по Loading запускает цикл → успех." className="lg:col-span-2" tags={["CORE"]}>
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div className="grid grid-cols-[70px_repeat(4,minmax(128px,1fr))] gap-x-3 gap-y-4 items-center min-w-[620px]">
          <div />
          {["Default", "Pressed", "Loading", "Disabled"].map((h) => <div key={h} className="label-caps text-center">{h}</div>)}
          {rows.map((r) => (
            <div key={r.v} className="contents">
              <div className="num text-[10.5px] text-dim font-bold">{r.v}</div>
              <Btn3D variant={r.v} size="sm" iconRight={<Icon name={r.icon} size={15} stroke={2.6} />}>{r.label}</Btn3D>
              <Btn3D variant={r.v} size="sm" pressed>{r.label}</Btn3D>
              <Btn3D variant={r.v} size="sm" loading={loading === r.v} onClick={() => run(r.v)} icon={done === r.v ? <Icon name="check" size={16} stroke={3} className="anim-pop" /> : undefined}>
                {loading === r.v ? "Processing" : done === r.v ? "Done" : "Tap me"}
              </Btn3D>
              <Btn3D variant={r.v} size="sm" disabled>{r.label}</Btn3D>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-white/5">
        <Label>Sizes</Label>
        <div className="flex flex-wrap items-end gap-3">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <Btn3D key={s} size={s} variant="blue">{s.toUpperCase()}</Btn3D>)}
          <Btn3D size="lg" variant="bull" full className="sm:!w-auto sm:flex-1" icon={<Icon name="play" size={18} />}>Start lesson</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Hold to confirm ---------- */
function HoldButton({ variant, label, icon, onDone }: { variant: Variant; label: string; icon: string; onDone: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const holding = useRef(false);
  const start = useRef(0);
  const DUR = 1100;
  const tick = (t: number) => {
    if (!holding.current) return;
    const v = Math.min(1, (t - start.current) / DUR);
    setP(v);
    if (Math.floor(v * 10) !== Math.floor((v - 0.016) * 10)) sfx.tick();
    if (v >= 1) { holding.current = false; haptic([20, 40, 30]); onDone(); setTimeout(() => setP(0), 500); return; }
    raf.current = requestAnimationFrame(tick);
  };
  const down = () => { holding.current = true; start.current = performance.now(); raf.current = requestAnimationFrame(tick); haptic(10); };
  const up = () => { if (!holding.current) return; holding.current = false; cancelAnimationFrame(raf.current); setP(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <Btn3D variant={variant} size="xl" full sound="none" onPointerDown={down} onPointerUp={up} onPointerLeave={up} pressed={p > 0 && p < 1} className="relative select-none touch-none">
      <span className="absolute inset-0 origin-left bg-white/30 -z-10" style={{ transform: `scaleX(${p})`, transition: p === 0 ? "transform .3s" : "none" }} />
      <span className="flex items-center gap-2"><Icon name={icon} size={20} stroke={2.8} />{p >= 1 ? "Confirmed!" : p > 0 ? `Hold… ${Math.round(p * 100)}%` : label}</span>
    </Btn3D>
  );
}
function HoldConfirm() {
  const toast = useToast();
  const [fire, setFire] = useState(0);
  return (
    <Asset title="Hold-to-Confirm Trade" id="ctl.hold" desc="Защита от случайных сделок: удерживайте 1.1 с. Отпустили раньше — откат." tags={["NEW"]}>
      <div className="relative space-y-5 pt-1">
        <Confetti fire={fire} />
        <HoldButton variant="bull" label="Hold to Long" icon="arrowUp" onDone={() => { setFire(Date.now()); sfx.success(); toast({ type: "success", title: "LONG BTC открыт", msg: "0.015 BTC @ 67 420 · x5" }); }} />
        <HoldButton variant="bear" label="Hold to Short" icon="arrowDown" onDone={() => { sfx.success(); toast({ type: "error", title: "SHORT ETH открыт", msg: "0.4 ETH @ 3 512 · x3" }); }} />
        <p className="text-[11px] text-dim text-center">Работает с мышью, тачем и стилусом</p>
      </div>
    </Asset>
  );
}

/* ---------- Icon buttons ---------- */
function IconButtons() {
  const [n, setN] = useState(3);
  const [fav, setFav] = useState(false);
  const [mute, setMute] = useState(false);
  return (
    <Asset title="Icon Buttons & FAB" id="ctl.iconbtn" desc="Круглые 3D-кнопки с бейджами-счётчиками и состояниями.">
      <div className="grid grid-cols-4 gap-4 place-items-center mb-6">
        <div className="relative">
          <Btn3D round variant="neutral" onClick={() => setN(0)} className="w-12"><Icon name="bell" size={20} /></Btn3D>
          {n > 0 && <span key={n} className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-bear text-[10px] font-extrabold grid place-items-center border-2 border-ink-800 anim-pop num">{n}</span>}
        </div>
        <Btn3D round variant={fav ? "bear" : "neutral"} onClick={() => setFav(!fav)} className="w-12" sound="pop"><Icon name="heart" size={20} className={fav ? "anim-pop fill-current" : ""} /></Btn3D>
        <Btn3D round variant="neutral" onClick={() => setMute(!mute)} className="w-12"><Icon name={mute ? "mute" : "volume"} size={20} /></Btn3D>
        <Btn3D round variant="neutral" className="w-12"><Icon name="settings" size={20} className="transition-transform duration-500 hover:rotate-90" /></Btn3D>
      </div>
      <div className="flex items-center justify-between inset p-3">
        <Btn3D size="sm" variant="neutral" onClick={() => setN((v) => v + 1)} icon={<Icon name="plus" size={14} stroke={3} />}>Notify</Btn3D>
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-blue/50" style={{ animation: "pulse-ring 1.8s infinite" }} />
          <Btn3D round size="lg" variant="blue" className="w-16 relative" sound="pop"><Icon name="plus" size={26} stroke={3} /></Btn3D>
        </div>
        <Btn3D round size="sm" variant="gold" className="w-10"><Icon name="gift" size={17} /></Btn3D>
      </div>
    </Asset>
  );
}

/* ---------- Text fields ---------- */
function Field({ label, value, onChange, state = "default", helper, icon, right, placeholder, type = "text", maxLength }: { label: string; value: string; onChange: (v: string) => void; state?: "default" | "error" | "success"; helper?: string; icon?: string; right?: React.ReactNode; placeholder?: string; type?: string; maxLength?: number }) {
  const [focus, setFocus] = useState(false);
  const ring = state === "error" ? "border-bear shadow-[0_0_0_4px_rgba(255,77,106,.15)]" : state === "success" ? "border-bull shadow-[0_0_0_4px_rgba(31,219,139,.12)]" : focus ? "border-blue shadow-[0_0_0_4px_rgba(61,123,255,.18)]" : "border-[#22366f] hover:border-[#2f4890]";
  return (
    <div>
      <div className={cn("relative flex items-center gap-2 h-14 px-4 rounded-2xl bg-[#0a1330] border-2 transition-all shadow-[inset_0_3px_8px_rgba(0,0,0,.45)]", ring, state === "error" && "anim-shake")} key={state === "error" ? value.length : "k"}>
        {icon && <Icon name={icon} size={18} className={cn("transition-colors shrink-0", focus ? "text-blue" : "text-dim")} />}
        <div className="relative flex-1 h-full">
          <label className={cn("absolute left-0 transition-all pointer-events-none font-bold", focus || value ? "top-2 text-[10px] tracking-wider uppercase" : "top-1/2 -translate-y-1/2 text-[13.5px]", state === "error" ? "text-bear" : focus ? "text-blue" : "text-dim")}>{label}</label>
          <input type={type} value={value} maxLength={maxLength} placeholder={focus ? placeholder : ""} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-x-0 bottom-2 bg-transparent outline-none text-[14px] font-semibold placeholder:text-dim/70 num" />
        </div>
        {state === "error" && <Icon name="warning" size={18} className="text-bear anim-pop" />}
        {state === "success" && <span className="size-6 rounded-full bg-bull grid place-items-center anim-pop"><Icon name="check" size={14} stroke={3.4} className="text-ink-900" /></span>}
        {right}
      </div>
      {helper && <div className={cn("text-[11px] mt-1.5 ml-1 font-semibold flex justify-between", state === "error" ? "text-bear" : state === "success" ? "text-bull" : "text-dim")}><span>{helper}</span>{maxLength && <span className="num">{value.length}/{maxLength}</span>}</div>}
    </div>
  );
}
function TextFields() {
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976");
  const [pw, setPw] = useState("hodl");
  const [show, setShow] = useState(false);
  const [q, setQ] = useState("");
  const addrOk = /^0x[a-fA-F0-9]{40}$/.test(addr);
  const pwScore = Math.min(4, [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length);
  const emailState = email === "" ? "default" : /^\S+@\S+\.\S+$/.test(email) ? "success" : "error";
  return (
    <Asset title="Text Fields" id="ctl.input" desc="Плавающий лейбл, живая валидация (email, адрес кошелька 0x…), сила пароля, поиск с очисткой." className="lg:row-span-2">
      <div className="space-y-4">
        <Field label="Email" icon="send" value={email} onChange={setEmail} placeholder="satoshi@btc.org" state={emailState} helper={emailState === "error" ? "Неверный формат email" : emailState === "success" ? "Отлично!" : "Мы никогда не передадим ваш email"} />
        <Field label="Wallet address" icon="wallet" value={addr} onChange={setAddr} maxLength={42} state={addr ? (addrOk ? "success" : "error") : "default"} helper={addrOk ? "Валидный ERC-20 адрес" : "Нужно 0x + 40 hex-символов"} />
        <div>
          <Field label="Password" icon="lock" type={show ? "text" : "password"} value={pw} onChange={setPw}
            right={<button onClick={() => setShow(!show)} className="text-dim hover:text-txt"><Icon name={show ? "eyeOff" : "eye"} size={18} /></button>} />
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", i < pwScore ? ["bg-bear", "bg-gold", "bg-cyan", "bg-bull"][pwScore - 1] : "bg-[#16275a]")} />)}
          </div>
          <div className="text-[11px] mt-1.5 text-dim font-semibold">Надёжность: <span className="text-txt">{["Слабый", "Слабый", "Средний", "Хороший", "Крепость"][pwScore]}</span></div>
        </div>
        <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-[#0a1330] border-2 border-[#22366f] focus-within:border-blue transition shadow-[inset_0_3px_8px_rgba(0,0,0,.45)]">
          <Icon name="search" size={17} className="text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск уроков, монет…" className="flex-1 bg-transparent outline-none text-[13.5px] font-semibold placeholder:text-dim" />
          {q && <button onClick={() => setQ("")} className="size-6 rounded-full bg-white/10 grid place-items-center anim-pop"><Icon name="x" size={12} stroke={3} /></button>}
          <kbd className="num text-[10px] text-dim border border-white/10 rounded px-1.5 py-0.5 hidden sm:block">⌘K</kbd>
        </div>
        {q && (
          <div className="raised p-1.5 anim-scale">
            {["Candlestick patterns", "Stop-loss strategy", "Bitcoin halving"].filter((s) => s.toLowerCase().includes(q.toLowerCase()) || q.length < 2).map((s) => (
              <button key={s} className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold hover:bg-white/5 flex items-center gap-2"><Icon name="book" size={15} className="text-blue" />{s}</button>
            ))}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ---------- Amount input ---------- */
function AmountInput() {
  const BAL = 2450;
  const [amt, setAmt] = useState("500");
  const [pct, setPct] = useState<number | null>(null);
  const n = parseFloat(amt) || 0;
  const over = n > BAL;
  const step = (d: number) => { setAmt(String(Math.max(0, n + d))); setPct(null); sfx.tick(); };
  return (
    <Asset title="Amount Input" id="ctl.amount" desc="Степпер, быстрые проценты, конвертация, защита от превышения баланса.">
      <div className="flex justify-between text-[11px] font-bold text-dim mb-2"><span>Сумма ордера</span><span>Баланс: <span className="text-txt num">{BAL.toLocaleString()} USDT</span></span></div>
      <div className={cn("inset p-2 flex items-center gap-2 !rounded-2xl transition", over && "!border-bear/60 anim-shake")} key={over ? "o" : "k"}>
        <Btn3D round size="sm" variant="neutral" className="w-10" onClick={() => step(-50)} sound="none"><Icon name="minus" size={16} stroke={3} /></Btn3D>
        <div className="flex-1 text-center">
          <input value={amt} inputMode="decimal" onChange={(e) => { setAmt(e.target.value.replace(/[^\d.]/g, "")); setPct(null); }} className={cn("w-full bg-transparent text-center outline-none text-[26px] font-extrabold num", over ? "text-bear" : "text-txt")} />
          <div className="num text-[11px] text-dim -mt-1">≈ {(n / 67420).toFixed(6)} BTC</div>
        </div>
        <Btn3D round size="sm" variant="neutral" className="w-10" onClick={() => step(50)} sound="none"><Icon name="plus" size={16} stroke={3} /></Btn3D>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[25, 50, 75, 100].map((p) => (
          <Btn3D key={p} size="xs" variant={pct === p ? "blue" : "neutral"} onClick={() => { setPct(p); setAmt(String((BAL * p) / 100)); }}>{p === 100 ? "MAX" : `${p}%`}</Btn3D>
        ))}
      </div>
      <div className={cn("text-[11px] font-bold mt-3 flex items-center gap-1.5 transition", over ? "text-bear" : "text-dim")}>
        <Icon name={over ? "warning" : "info"} size={13} />{over ? "Недостаточно средств" : `Комиссия ≈ ${(n * 0.001).toFixed(2)} USDT`}
      </div>
    </Asset>
  );
}

/* ---------- Slider ---------- */
export function Slider3D({ value, onChange, min = 0, max = 100, marks, color, format = (v) => String(v) }: { value: number; onChange: (v: number) => void; min?: number; max?: number; marks?: number[]; color?: string; format?: (v: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const set = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    let v = Math.round(min + ((x - r.left) / r.width) * (max - min));
    v = Math.max(min, Math.min(max, v));
    if (marks) { const near = marks.find((m) => Math.abs(m - v) <= (max - min) * 0.02); if (near !== undefined) v = near; }
    if (v !== value) { onChange(v); sfx.tick(); }
  };
  return (
    <div className="pt-9 pb-1 select-none touch-none">
      <div ref={ref} className="relative h-4 inset !rounded-full cursor-pointer"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag(true); set(e.clientX); }}
        onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => setDrag(false)}>
        <div className="absolute inset-y-[3px] left-[3px] rounded-full" style={{ width: `calc(${pct}% - 3px)`, background: color || "linear-gradient(90deg,#3d7bff,#6a9dff)", transition: drag ? "none" : "width .2s" }} />
        {marks?.map((m) => <span key={m} className={cn("absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full -ml-[3px]", m <= value ? "bg-white/70" : "bg-white/15")} style={{ left: `${((m - min) / (max - min)) * 100}%` }} />)}
        <div className="absolute top-1/2 -translate-y-1/2 -ml-4 size-8 rounded-full bg-gradient-to-b from-white to-[#c5d2f5] shadow-[0_4px_0_#7d8fc4,0_8px_16px_rgba(0,0,0,.5)] grid place-items-center transition-transform" style={{ left: `${pct}%`, transform: `translateY(-50%) scale(${drag ? 1.12 : 1})`, transition: drag ? "transform .1s" : "left .2s, transform .1s" }}>
          <span className="w-2.5 h-3 flex justify-between"><i className="w-[2px] bg-[#8a9bcf] rounded" /><i className="w-[2px] bg-[#8a9bcf] rounded" /></span>
          <span className={cn("absolute bottom-full mb-3 px-2 py-1 rounded-lg bg-[#24397a] text-[11px] font-extrabold num whitespace-nowrap shadow-[0_3px_0_#0b1536] transition-all", drag ? "scale-110" : "")}>{format(value)}<i className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 size-2 rotate-45 bg-[#24397a]" /></span>
        </div>
      </div>
      {marks && <div className="relative h-5 mt-2">{marks.map((m) => <span key={m} className="absolute -translate-x-1/2 num text-[10px] text-dim font-bold" style={{ left: `${((m - min) / (max - min)) * 100}%` }}>{format(m)}</span>)}</div>}
    </div>
  );
}
function Leverage() {
  const [lev, setLev] = useState(10);
  const [vol, setVol] = useState(60);
  const risk = lev <= 5 ? { t: "Низкий риск", c: "#1fdb8b", tone: "bull" } : lev <= 20 ? { t: "Умеренный", c: "#ffc53d", tone: "gold" } : lev <= 50 ? { t: "Высокий риск", c: "#ff8a3d", tone: "gold" } : { t: "Экстремальный!", c: "#ff4d6a", tone: "bear" };
  return (
    <Asset title="Leverage & Sliders" id="ctl.slider" desc="Перетаскивайте. Цвет и предупреждение реагируют на уровень риска; магнит к меткам.">
      <div className="flex items-center justify-between">
        <Label className="!mb-0">Кредитное плечо</Label>
        <Badge tone={risk.tone} dot={lev > 50}>{risk.t}</Badge>
      </div>
      <Slider3D value={lev} onChange={setLev} min={1} max={100} marks={[1, 25, 50, 75, 100]} format={(v) => `${v}x`} color={`linear-gradient(90deg,#1fdb8b,${risk.c})`} />
      <div className="inset p-3 mt-3 grid grid-cols-2 gap-2 text-center">
        <div><div className="label-caps !mb-1">Ликвидация</div><div className="num font-extrabold text-bear">{(67420 * (1 - 1 / lev)).toLocaleString("en", { maximumFractionDigits: 0 })}</div></div>
        <div><div className="label-caps !mb-1">Позиция</div><div className="num font-extrabold">{(100 * lev).toLocaleString()} $</div></div>
      </div>
      <Label className="mt-5">Громкость SFX</Label>
      <div className="flex items-center gap-3"><Icon name="mute" size={16} className="text-dim" /><div className="flex-1 -mt-8"><Slider3D value={vol} onChange={setVol} format={(v) => `${v}%`} /></div><Icon name="volume" size={16} className="text-dim" /></div>
    </Asset>
  );
}

/* ---------- Selection ---------- */
function Selection() {
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(false);
  const [radio, setRadio] = useState("mid");
  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(true);
  const [topics, setTopics] = useState<string[]>(["Bitcoin", "TA"]);
  const all = ["Bitcoin", "Ethereum", "DeFi", "TA", "NFT", "Risk", "Macro", "Psychology"];
  return (
    <Asset title="Selection Controls" id="ctl.select" desc="Чекбоксы, радио, 3D-тумблеры и мульти-выбор тем для онбординга.">
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label className="!mb-1">Checkbox</Label>
          <Check checked={c1} onChange={setC1} label="Push-уведомления" />
          <Check checked={c2} onChange={setC2} tone="bull" label="Ежедневный челлендж" />
          <Check checked={false} onChange={() => {}} disabled label="Недоступно" />
        </div>
        <div className="space-y-3">
          <Label className="!mb-1">Radio · Риск-профиль</Label>
          {[["low", "Консервативный"], ["mid", "Сбалансированный"], ["high", "Агрессивный"]].map(([v, l]) => <Check key={v} radio checked={radio === v} onChange={() => setRadio(v)} label={l} />)}
        </div>
      </div>
      <div className="inset p-3 mt-5 space-y-3">
        {[["Звуки", t1, setT1, "bull"], ["Тёмная тема графиков", t2, setT2, "blue"], ["Pro-сигналы", t3, setT3, "violet"]].map(([l, v, s, tone]) => (
          <div key={l as string} className="flex items-center justify-between text-[13px] font-semibold">
            <span>{l as string}</span>
            <Toggle on={v as boolean} onChange={s as (v: boolean) => void} tone={tone as "bull"} />
          </div>
        ))}
      </div>
      <Label className="mt-5">Интересы · мульти-выбор</Label>
      <div className="flex flex-wrap gap-2">
        {all.map((t) => {
          const on = topics.includes(t);
          return (
            <button key={t} onClick={() => { setTopics(on ? topics.filter((x) => x !== t) : [...topics, t]); sfx.toggle(); }}
              className={cn("opt !rounded-full px-3.5 h-9 text-[12px] font-extrabold flex items-center gap-1.5")} data-state={on ? "selected" : undefined}>
              {on && <Icon name="check" size={13} stroke={3.2} className="anim-pop" />}{t}
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

/* ---------- PIN ---------- */
function PinInput() {
  const [v, setV] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const onKey = (i: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const arr = v.padEnd(6, " ").split("");
    arr[i] = ch || " ";
    const nv = arr.join("").trimEnd();
    setV(nv); sfx.tick();
    if (ch && i < 5) refs.current[i + 1]?.focus();
    if (nv.replace(/ /g, "").length === 6) {
      if (nv === "123456") { setState("ok"); sfx.success(); } else { setState("err"); sfx.error(); haptic([30, 50, 30]); setTimeout(() => { setState("idle"); setV(""); refs.current[0]?.focus(); }, 900); }
    } else setState("idle");
  };
  return (
    <Asset title="2FA Code Input" id="ctl.otp" desc="Автопереход между ячейками. Верный код: 123456.">
      <div className={cn("flex justify-center gap-2", state === "err" && "anim-shake")}>
        {Array.from({ length: 6 }).map((_, i) => {
          const ch = (v[i] || "").trim();
          return (
            <input key={i} ref={(el) => { refs.current[i] = el; }} value={ch} inputMode="numeric" maxLength={1}
              onChange={(e) => onKey(i, e.target.value.slice(-1))}
              onKeyDown={(e) => { if (e.key === "Backspace" && !ch && i > 0) refs.current[i - 1]?.focus(); }}
              className={cn("w-11 h-14 text-center text-[22px] font-extrabold num rounded-xl bg-[#0a1330] border-2 border-b-[5px] outline-none transition-all focus:-translate-y-0.5",
                state === "ok" ? "border-bull text-bull" : state === "err" ? "border-bear text-bear" : ch ? "border-blue" : "border-[#22366f] focus:border-blue")} />
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-[12px] font-bold h-6">
        {state === "ok" ? <span className="text-bull flex items-center gap-1.5 anim-pop"><Glyph name="shield" size={20} />Кошелёк защищён</span> : state === "err" ? <span className="text-bear">Неверный код</span> : <Tooltip text="Код из Google Authenticator"><span className="text-dim flex items-center gap-1"><Icon name="info" size={13} />Введите 6 цифр</span></Tooltip>}
      </div>
    </Asset>
  );
}

export default function Controls() {
  return (
    <Section id="controls" index="02" title="Controls" subtitle="Тактильные кнопки, поля, слайдеры и выбор — всё реально нажимается" count={9}>
      <div className="grid lg:grid-cols-3 gap-6">
        <ButtonMatrix />
        <HoldConfirm />
        <TextFields />
        <AmountInput />
        <Leverage />
        <IconButtons />
        <Selection />
        <PinInput />
      </div>
    </Section>
  );
}
