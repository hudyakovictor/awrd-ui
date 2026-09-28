import { useEffect, useRef, useState } from "react";
import { Asset, Btn, Confetti, Label, Section, Coin, FloatText } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

function ButtonSystem() {
  const [loading, setLoading] = useState<string | null>(null);
  const run = (k: string) => { setLoading(k); setTimeout(() => setLoading(null), 1400); };
  const V: [any, string, string][] = [
    ["bull", "Continue", "check"], ["sky", "Start", "play"], ["gold", "Claim", "gift"], ["bear", "Sell", "trendDown"],
    ["violet", "Go Pro", "crown"], ["flame", "Streak", "flame"], ["ghost", "Skip", ""], ["outline", "Later", ""],
  ];
  return (
    <Asset code="CTL-01" title="Button System" desc="8 variants × 4 states with a real 5px physical lip. Tap any default to trigger loading. Keyboard focus ring included." tags={["press", "loading", "a11y"]} span={2}>
      <div className="grid grid-cols-[70px_repeat(4,1fr)] gap-x-3 gap-y-2 items-center overflow-x-auto">
        <span />
        {["Default", "Pressed", "Loading", "Disabled"].map((s) => <Label key={s} className="mb-0 text-center">{s}</Label>)}
        {V.map(([v, t, i]) => (
          <div key={v} className="contents">
            <span className="text-[10px] font-bold uppercase text-mist">{v}</span>
            <Btn variant={v} size="sm" icon={i || undefined} loading={loading === v} onClick={() => run(v)} block>{t}</Btn>
            <Btn variant={v} size="sm" icon={i || undefined} data-pressed="true" block>{t}</Btn>
            <Btn variant={v} size="sm" loading block>{t}</Btn>
            <Btn variant={v} size="sm" disabled block>{t}</Btn>
          </div>
        ))}
      </div>
      <div className="hairline my-4" />
      <Label>Sizes</Label>
      <div className="flex flex-wrap items-end gap-3">
        <Btn variant="bull" size="xs">XS</Btn>
        <Btn variant="bull" size="sm">Small</Btn>
        <Btn variant="bull" size="md">Medium</Btn>
        <Btn variant="bull" size="lg">Large</Btn>
        <Btn variant="bull" size="xl" iconRight="chevR">Continue</Btn>
      </div>
    </Asset>
  );
}

function TradeActions() {
  const [side, setSide] = useState<"buy" | "sell" | null>(null);
  const [hold, setHold] = useState(0);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const raf = useRef(0);
  const start = useRef(0);
  const begin = () => {
    if (done) return;
    start.current = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start.current) / 1200);
      setHold(p);
      if (p >= 1) { setDone(true); setBurst((b) => b + 1); navigator.vibrate?.(40); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const end = () => { cancelAnimationFrame(raf.current); if (!done) setHold(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <Asset code="CTL-02" title="Trade Actions" desc="Long/Short split + hold-to-confirm (1.2s) to prevent accidental orders — with haptic & celebration." tags={["hold", "haptic"]}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button onClick={() => setSide("buy")} className={cn("btn3d v-bull h-20 flex-col !gap-0.5 transition-all", side === "sell" && "opacity-50 saturate-50")} style={{ ["--lip" as string]: "6px" }}>
          <Icon name="trendUp" size={22} stroke={2.8} /><span className="text-sm">Long</span><span className="num text-[10px] opacity-80 normal-case">67,421.5</span>
        </button>
        <button onClick={() => setSide("sell")} className={cn("btn3d v-bear h-20 flex-col !gap-0.5 transition-all", side === "buy" && "opacity-50 saturate-50")} style={{ ["--lip" as string]: "6px" }}>
          <Icon name="trendDown" size={22} stroke={2.8} /><span className="text-sm">Short</span><span className="num text-[10px] opacity-80 normal-case">67,419.8</span>
        </button>
      </div>
      <div className="relative">
        <Confetti burst={burst} />
        <button
          onPointerDown={begin} onPointerUp={end} onPointerLeave={end}
          onKeyDown={(e) => { if (e.key === " " && !e.repeat) begin(); }} onKeyUp={end}
          className={cn("btn3d w-full h-14 text-sm select-none", done ? "v-bull" : "v-ghost")}
          style={{ ["--lip" as string]: "6px" }}
        >
          <span className="absolute inset-y-0 left-0 -z-10 transition-[width] duration-75" style={{ width: `${hold * 100}%`, background: "linear-gradient(180deg,#3ce49e,#16b56f)" }} />
          {done ? <><Icon name="check" size={18} stroke={3} className="anim-pop" /> Order placed</> : hold > 0 ? `Hold… ${Math.round(hold * 100)}%` : "Hold to confirm"}
        </button>
      </div>
      <button onClick={() => { setDone(false); setHold(0); setSide(null); }} className="text-[11px] text-mist hover:text-sky mt-3 self-center flex items-center gap-1"><Icon name="refresh" size={12} /> reset</button>
    </Asset>
  );
}

function IconButtons() {
  const [n, setN] = useState(3);
  const [fav, setFav] = useState(false);
  const [mark, setMark] = useState(true);
  const [open, setOpen] = useState(false);
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  return (
    <Asset code="CTL-03" title="Icon Buttons & FAB" desc="Round 3D icon buttons, animated counters, toggles and a speed-dial FAB." tags={["toggle", "badge", "dial"]}>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative">
          <button onClick={() => setN((x) => x + 1)} className="btn3d v-ghost w-12 h-12 !rounded-full !p-0"><Icon name="bell" size={20} /></button>
          {n > 0 && <span key={n} className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-bear text-[10px] font-black grid place-items-center border-2 border-ink-800 anim-pop">{n > 9 ? "9+" : n}</span>}
        </div>
        <div className="relative">
          <button onClick={() => { setFav(!fav); if (!fav) setPops((p) => [...p, { id: Date.now(), text: "+1" }]); }} className={cn("btn3d w-12 h-12 !rounded-full !p-0", fav ? "v-gold" : "v-ghost")}>
            <Icon name="star" size={20} fill={fav ? "currentColor" : "none"} className={fav ? "anim-pop" : ""} />
          </button>
          <FloatText items={pops} />
        </div>
        <button onClick={() => setMark(!mark)} className={cn("btn3d w-12 h-12 !rounded-full !p-0", mark ? "v-sky" : "v-ghost")}><Icon name="bookmark" size={20} fill={mark ? "currentColor" : "none"} /></button>
        <button className="btn3d v-violet w-12 h-12 !rounded-2xl !p-0"><Icon name="volume" size={20} /></button>
        <button onClick={() => setN(0)} className="text-[11px] text-mist hover:text-fog underline decoration-dotted">clear</button>
      </div>
      <div className="well dotgrid flex-1 min-h-[150px] relative overflow-hidden">
        <div className="absolute right-4 bottom-4 flex flex-col-reverse items-end gap-3">
          <button onClick={() => setOpen(!open)} className="btn3d v-bull w-14 h-14 !rounded-full !p-0" style={{ ["--lip" as string]: "6px" }} aria-label="Quick actions">
            <Icon name="plus" size={26} stroke={3} className={cn("transition-transform duration-300", open && "rotate-45")} />
          </button>
          {[["Alert", "bell", "sky"], ["Trade", "swap", "gold"], ["Note", "book", "violet"]].map(([t, i, v], k) => (
            <div key={t} className="flex items-center gap-2 transition-all duration-300" style={{ opacity: open ? 1 : 0, transform: open ? "translateY(0) scale(1)" : `translateY(${20 + k * 10}px) scale(.6)`, transitionDelay: open ? `${k * 50}ms` : "0ms", pointerEvents: open ? "auto" : "none" }}>
              <span className="glass text-[11px] font-bold px-2 py-1 rounded-lg">{t}</span>
              <button className={`btn3d v-${v} w-11 h-11 !rounded-full !p-0`}><Icon name={i} size={18} /></button>
            </div>
          ))}
        </div>
        <span className="absolute left-4 top-4 text-[10px] text-mist uppercase tracking-widest">tap FAB ↘</span>
      </div>
    </Asset>
  );
}

function TextFields() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [q, setQ] = useState("");
  const valid = /^\S+@\S+\.\S+$/.test(email);
  const state = !email ? "idle" : valid ? "ok" : "err";
  const strength = Math.min(4, (pw.length >= 8 ? 1 : 0) + (/[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^\w]/.test(pw) ? 1 : 0));
  const sc = ["#2b4380", "#ff4b6e", "#ff8a3d", "#ffc53d", "#22d38a"][strength];
  return (
    <Asset code="CTL-04" title="Text Fields" desc="Live validation, password strength meter, clearable search. Focus glow & error shake." tags={["validate", "states"]}>
      <Label>Email</Label>
      <div className={cn("well flex items-center gap-2 px-3 h-12 transition-all border-2", state === "err" ? "!border-bear/70 anim-shake" : state === "ok" ? "!border-bull/60" : "border-transparent focus-within:!border-sky/70 focus-within:shadow-[0_0_0_4px_rgba(61,165,255,.15)]")} key={state === "err" ? "e" : "n"}>
        <Icon name="send" size={16} className="text-mist" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trader@bullrun.gg" className="bg-transparent outline-none flex-1 text-sm placeholder:text-mist/50" />
        {state === "ok" && <Icon name="check" size={18} stroke={3} className="text-bull anim-pop" />}
        {state === "err" && <Icon name="alert" size={18} className="text-bear anim-pop" />}
      </div>
      <p className={cn("text-[11px] mt-1.5 mb-4 transition-colors", state === "err" ? "text-bear" : state === "ok" ? "text-bull" : "text-mist")}>
        {state === "err" ? "Enter a valid email address" : state === "ok" ? "Looks good!" : "We'll never share your email."}
      </p>
      <Label>Password</Label>
      <div className="well flex items-center gap-2 px-3 h-12 border-2 border-transparent focus-within:!border-sky/70 transition-all">
        <Icon name="lock" size={16} className="text-mist" />
        <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 8 characters" className="bg-transparent outline-none flex-1 text-sm placeholder:text-mist/50" />
        <button onClick={() => setShow(!show)} className="text-mist hover:text-fog"><Icon name={show ? "eyeOff" : "eye"} size={18} /></button>
      </div>
      <div className="flex gap-1 mt-2 mb-1">{[1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ background: i <= strength ? sc : "#172856" }} />)}</div>
      <p className="text-[11px] mb-4" style={{ color: pw ? sc : "#8ea3cf" }}>{pw ? ["Too weak", "Weak", "Fair", "Good", "Strong 💪"][strength] : "Use A-Z, 0-9 and a symbol"}</p>
      <div className="well flex items-center gap-2 px-3 h-11 !rounded-full border-2 border-transparent focus-within:!border-sky/70">
        <Icon name="search" size={16} className="text-mist" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, coins…" className="bg-transparent outline-none flex-1 text-sm placeholder:text-mist/50" />
        {q && <button onClick={() => setQ("")} className="w-6 h-6 rounded-full bg-white/10 grid place-items-center anim-pop"><Icon name="x" size={12} stroke={3} /></button>}
      </div>
    </Asset>
  );
}

function AmountInput() {
  const bal = 2500;
  const [amt, setAmt] = useState(500);
  const price = 67421.5;
  const set = (v: number) => setAmt(Math.max(0, Math.min(bal, Math.round(v * 100) / 100)));
  const pct = (amt / bal) * 100;
  return (
    <Asset code="CTL-05" title="Order Amount" desc="Stepper, quick-% chips, over-balance guard and live base-asset conversion." tags={["stepper", "calc"]}>
      <div className="flex justify-between text-[11px] text-mist mb-2"><span>Amount (USDT)</span><span>Balance <b className="num text-fog">{bal.toLocaleString()}</b></span></div>
      <div className="well flex items-center gap-2 p-2 mb-3">
        <button onClick={() => set(amt - 50)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="minus" size={18} stroke={3} /></button>
        <input value={amt} onChange={(e) => set(+e.target.value.replace(/[^\d.]/g, "") || 0)} className="num bg-transparent outline-none flex-1 text-center text-2xl font-extrabold min-w-0" inputMode="decimal" />
        <button onClick={() => set(amt + 50)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="plus" size={18} stroke={3} /></button>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[25, 50, 75, 100].map((p) => {
          const on = Math.abs(pct - p) < 0.5;
          return (
            <button key={p} onClick={() => set((bal * p) / 100)} className={cn("h-9 rounded-xl text-xs font-extrabold transition-all border-2", on ? "bg-sky/20 border-sky text-sky shadow-[0_3px_0_#1a56a8]" : "border-ink-600 text-mist hover:text-fog shadow-[0_3px_0_#0a1430] active:translate-y-[3px] active:shadow-none")}>
              {p === 100 ? "MAX" : `${p}%`}
            </button>
          );
        })}
      </div>
      <div className="tile p-3 flex items-center gap-3">
        <Coin sym="BTC" size={34} />
        <div className="flex-1">
          <div className="text-[10px] text-mist uppercase font-bold tracking-wider">You receive</div>
          <div className="num font-extrabold">{(amt / price).toFixed(6)} BTC</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-mist">Fee 0.1%</div>
          <div className="num text-xs text-fog">${(amt * 0.001).toFixed(2)}</div>
        </div>
      </div>
      <Btn variant="bull" block className="mt-4" disabled={amt <= 0}>Buy BTC</Btn>
    </Asset>
  );
}

function PinInput() {
  const [v, setV] = useState<string[]>(Array(6).fill(""));
  const [st, setSt] = useState<"idle" | "ok" | "err">("idle");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const check = (arr: string[]) => {
    if (arr.every(Boolean)) {
      const ok = arr.join("") === "424242";
      setSt(ok ? "ok" : "err");
      if (!ok) setTimeout(() => { setV(Array(6).fill("")); setSt("idle"); refs.current[0]?.focus(); }, 700);
    }
  };
  const onChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "");
    if (d.length > 1) { const arr = d.slice(0, 6).split("").concat(Array(6).fill("")).slice(0, 6); setV(arr); check(arr); refs.current[Math.min(5, d.length)]?.focus(); return; }
    const arr = [...v]; arr[i] = d; setV(arr); setSt("idle");
    if (d && i < 5) refs.current[i + 1]?.focus();
    check(arr);
  };
  return (
    <Asset code="CTL-06" title="2FA Code" desc="Auto-advance, paste support, backspace navigation. Try 424242 ✓ or anything else ✗." tags={["otp", "paste"]}>
      <div className={cn("flex gap-2 justify-center my-4", st === "err" && "anim-shake")}>
        {v.map((c, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={c}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
            inputMode="numeric"
            maxLength={6}
            className={cn("num w-11 h-14 text-center text-2xl font-extrabold rounded-xl outline-none transition-all border-2",
              st === "ok" ? "bg-bull/15 border-bull text-bull" : st === "err" ? "bg-bear/15 border-bear text-bear" : c ? "bg-ink-700 border-sky/60 shadow-[0_4px_0_#1a56a8]" : "well border-transparent focus:border-sky/70")}
            style={st === "ok" ? { animation: `pop .4s ${i * 0.06}s both` } : undefined}
          />
        ))}
      </div>
      <p className={cn("text-center text-sm font-bold h-5", st === "ok" ? "text-bull" : st === "err" ? "text-bear" : "text-mist")}>
        {st === "ok" ? "Verified — wallet unlocked" : st === "err" ? "Wrong code, try again" : "Enter the 6-digit code"}
      </p>
      <div className="mt-auto pt-4 flex justify-between items-center text-[11px] text-mist">
        <span className="flex items-center gap-1"><Icon name="shield" size={14} className="text-bull" /> Secured</span>
        <button onClick={() => { setV(Array(6).fill("")); setSt("idle"); refs.current[0]?.focus(); }} className="text-sky font-bold hover:underline">Resend code</button>
      </div>
    </Asset>
  );
}

function Check({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 group">
      <span className={cn("w-7 h-7 rounded-lg grid place-items-center transition-all", on ? "bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_3px_0_#0b7a4a,inset_0_2px_0_rgba(255,255,255,.3)]" : "well group-hover:border-sky/40")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" strokeDasharray="24" strokeDashoffset={on ? 0 : 24} style={{ transition: "stroke-dashoffset .3s ease" }} /></svg>
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
function Toggle({ on, onClick, color = "bull" }: { on: boolean; onClick: () => void; color?: "bull" | "sky" | "violet" }) {
  const g = { bull: "from-[#3ce49e] to-[#16b56f]", sky: "from-[#6dbbff] to-[#2d8cf0]", violet: "from-[#b394ff] to-[#7a4af0]" }[color];
  return (
    <button onClick={onClick} role="switch" aria-checked={on} className={cn("relative w-14 h-8 rounded-full transition-all", on ? `bg-gradient-to-b ${g} shadow-[inset_0_2px_4px_rgba(0,0,0,.2)]` : "well")}>
      <span className="absolute top-1 w-6 h-6 rounded-full bg-gradient-to-b from-white to-[#c9d6f5] shadow-[0_3px_0_rgba(0,0,0,.25),inset_0_-2px_0_rgba(0,0,0,.1)] transition-all duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]" style={{ left: on ? 28 : 4 }} />
    </button>
  );
}

function Selection() {
  const [c, setC] = useState([true, false, true]);
  const [r, setR] = useState(1);
  const [s, setS] = useState([true, false, true]);
  return (
    <Asset code="CTL-07" title="Selection Controls" desc="Checkbox with drawn check, radio with spring dot, switches with elastic knob." tags={["spring", "a11y"]}>
      <Label>Checkbox</Label>
      <div className="space-y-2.5 mb-5">
        {["I understand trading risks", "Remember this device", "Send weekly market recap"].map((l, i) => (
          <Check key={l} label={l} on={c[i]} onClick={() => setC(c.map((x, k) => (k === i ? !x : x)))} />
        ))}
      </div>
      <Label>Radio · Risk profile</Label>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {["Safe", "Balanced", "Degen"].map((l, i) => (
          <button key={l} onClick={() => setR(i)} className={cn("p-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all", r === i ? "border-sky bg-sky/10 shadow-[0_3px_0_#1a56a8]" : "border-ink-600 shadow-[0_3px_0_#0a1430] hover:border-ink-500")}>
            <span className={cn("w-5 h-5 rounded-full grid place-items-center", r === i ? "bg-sky" : "well")}>
              <span className={cn("w-2 h-2 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(.3,1.8,.5,1)]", r === i ? "scale-100" : "scale-0")} />
            </span>
            <span className="text-xs font-bold">{l}</span>
          </button>
        ))}
      </div>
      <Label>Switch</Label>
      <div className="space-y-3">
        {[["Price alerts", "bull"], ["Sound effects", "sky"], ["Pro charts", "violet"]].map(([l, col], i) => (
          <div key={l} className="flex items-center justify-between">
            <span className="text-sm font-semibold">{l}</span>
            <Toggle on={s[i]} color={col as any} onClick={() => setS(s.map((x, k) => (k === i ? !x : x)))} />
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Leverage() {
  const [lev, setLev] = useState(10);
  const pct = ((lev - 1) / 99) * 100;
  const risk = lev <= 5 ? ["Low risk", "#22d38a"] : lev <= 20 ? ["Moderate", "#ffc53d"] : lev <= 50 ? ["High risk", "#ff8a3d"] : ["Extreme", "#ff4b6e"];
  const liq = 67421.5 * (1 - 1 / lev);
  return (
    <Asset code="CTL-08" title="Leverage Slider" desc="Custom 3D track, risk-coded fill, value bubble, magnetic ticks & live liquidation price." tags={["drag", "risk"]}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="num text-4xl font-black transition-colors" style={{ color: risk[1] }}>{lev}×</div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: risk[1] }}>{risk[0]}</div>
        </div>
        {lev > 50 && <Icon name="alert" size={28} className="text-bear anim-wiggle" key={lev} />}
      </div>
      <div className="relative h-10 mb-2">
        <div className="well absolute inset-x-0 top-3 h-4 !rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22d38a,#ffc53d 35%,#ff8a3d 60%,#ff4b6e)", backgroundSize: `${10000 / Math.max(pct, 1)}% 100%` }} />
        </div>
        <div className="absolute top-0 -translate-x-1/2 pointer-events-none transition-[left] duration-75" style={{ left: `calc(14px + (100% - 28px) * ${pct / 100})` }}>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 num text-[11px] font-black px-2 py-1 rounded-lg text-ink-900 whitespace-nowrap" style={{ background: risk[1] }}>{lev}×<span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: risk[1] }} /></div>
          <div className="w-7 h-7 mt-1.5 rounded-full bg-gradient-to-b from-white to-[#b9c8ea] border-4 shadow-[0_3px_0_rgba(0,0,0,.35)]" style={{ borderColor: risk[1] }} />
        </div>
        <input type="range" min={1} max={100} value={lev} onChange={(e) => { let v = +e.target.value; for (const m of [1, 5, 10, 25, 50, 75, 100]) if (Math.abs(v - m) <= 1) v = m; setLev(v); }} className="range-reset absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" aria-label="Leverage" />
      </div>
      <div className="flex justify-between mb-5">
        {[1, 25, 50, 75, 100].map((m) => <button key={m} onClick={() => setLev(m)} className={cn("num text-[10px] font-bold px-1.5 py-0.5 rounded", lev === m ? "bg-white/10 text-fog" : "text-mist")}>{m}×</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="tile p-2.5"><div className="text-[10px] text-mist uppercase font-bold">Liq. price</div><div className="num font-extrabold text-bear">${liq.toFixed(0)}</div></div>
        <div className="tile p-2.5"><div className="text-[10px] text-mist uppercase font-bold">Max position</div><div className="num font-extrabold">${(500 * lev).toLocaleString()}</div></div>
      </div>
    </Asset>
  );
}

function Segmented() {
  const TF = ["1m", "15m", "1H", "4H", "1D", "1W"];
  const [tf, setTf] = useState(2);
  const [chips, setChips] = useState<string[]>(["Layer 1"]);
  const [mode, setMode] = useState(0);
  const toggle = (c: string) => setChips((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));
  return (
    <Asset code="CTL-09" title="Segments & Chips" desc="Sliding-pill segmented control, 2-way mode switch and multi-select filter chips." tags={["slide", "multi"]}>
      <Label>Timeframe</Label>
      <div className="well p-1 relative grid mb-5" style={{ gridTemplateColumns: `repeat(${TF.length},1fr)` }}>
        <div className="absolute top-1 bottom-1 rounded-[10px] bg-gradient-to-b from-[#5cb3ff] to-[#2d8cf0] shadow-[0_3px_0_#1a56a8,inset_0_1px_0_rgba(255,255,255,.3)] transition-all duration-300 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ left: `calc(${(tf / TF.length) * 100}% + 4px)`, width: `calc(${100 / TF.length}% - 8px)` }} />
        {TF.map((t, i) => <button key={t} onClick={() => setTf(i)} className={cn("relative z-10 h-9 num text-xs font-extrabold transition-colors", tf === i ? "text-white" : "text-mist hover:text-fog")}>{t}</button>)}
      </div>
      <Label>Mode</Label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[["Spot", "wallet"], ["Futures", "bolt"]].map(([t, i], k) => (
          <button key={t} onClick={() => setMode(k)} className={cn("btn3d h-11 text-xs", mode === k ? (k ? "v-violet" : "v-sky") : "v-ghost")} style={{ ["--lip" as string]: "4px" }}><Icon name={i} size={16} />{t}</button>
        ))}
      </div>
      <Label>Categories · {chips.length} selected</Label>
      <div className="flex flex-wrap gap-2">
        {["Layer 1", "DeFi", "Meme", "AI", "Gaming", "RWA", "Stable"].map((c) => {
          const on = chips.includes(c);
          return (
            <button key={c} onClick={() => toggle(c)} className={cn("h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border-2", on ? "bg-bull/15 border-bull text-bull shadow-[0_3px_0_#0b7a4a]" : "border-ink-600 text-fog/80 shadow-[0_3px_0_#0a1430] hover:border-ink-500 active:translate-y-[3px] active:shadow-none")}>
              {on && <Icon name="check" size={12} stroke={3.5} className="anim-pop" />}{c}
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

export default function Controls() {
  return (
    <Section id="controls" index="02" title="Controls" subtitle="Every input a trader touches — physically pressable, validated, and forgiving.">
      <ButtonSystem />
      <TradeActions />
      <TextFields />
      <AmountInput />
      <Leverage />
      <Selection />
      <PinInput />
      <Segmented />
      <IconButtons />
    </Section>
  );
}
