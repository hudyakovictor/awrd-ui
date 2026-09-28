import { useState } from "react";
import { Btn, Label, Toggle, Segmented, type Variant } from "../components/ui";
import { Icon } from "../components/Icon";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* C01 — 3D Buttons */
export function Buttons() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const run = () => {
    setState("loading");
    setTimeout(() => { setState("done"); sfx("success"); haptic([10, 40, 10]); }, 1100);
    setTimeout(() => setState("idle"), 2600);
  };
  const variants: [Variant, string][] = [["bull", "Купить"], ["bear", "Продать"], ["sky", "Далее"], ["gold", "Забрать"], ["violet", "Буст"], ["flame", "Стрик"], ["ink", "Позже"], ["ghost", "Пропустить"]];
  return (
    <div className="space-y-5">
      <div>
        <Label>Варианты · семантика</Label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
          {variants.map(([v, t]) => <Btn key={v} v={v} s="sm">{t}</Btn>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Default</Label><Btn block>Проверить</Btn></div>
        <div><Label>Pressed</Label><Btn block data-pressed="true">Проверить</Btn></div>
        <div><Label>Disabled</Label><Btn block disabled>Проверить</Btn></div>
      </div>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <Label>Асинхронное действие · тапни</Label>
          <Btn block s="lg" v={state === "done" ? "bull" : "sky"} loading={state === "loading"} icon={state === "done" ? "check" : "bolt"} onClick={run}>
            {state === "idle" ? "Открыть сделку" : state === "loading" ? "Исполняем…" : "Исполнено"}
          </Btn>
        </div>
        <div>
          <Label>Иконки · размеры</Label>
          <div className="flex items-end gap-3">
            <Btn s="xs" v="ink" icon="plus" aria-label="plus" className="w-8 px-0" />
            <Btn s="sm" v="ink" icon="heart" aria-label="like" className="w-10 px-0" />
            <Btn s="md" v="gold" icon="gift" aria-label="gift" className="w-12 px-0" />
            <Btn s="lg" v="bull" icon="play" aria-label="play" className="w-14 px-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* C02 — Text fields */
export function Fields() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("hodl2024");
  const [show, setShow] = useState(false);
  const [amt, setAmt] = useState("250");
  const [focus, setFocus] = useState<string | null>(null);
  const bal = 1000;
  const emailOk = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email);
  const emailErr = email.length > 3 && !emailOk;
  const strength = Math.min(4, [/.{8,}/, /\d/, /[A-Z]/, /[^\w]/].filter((r) => r.test(pw)).length);
  const amtN = parseFloat(amt) || 0;
  const over = amtN > bal;
  const box = (key: string, err?: boolean, ok?: boolean) =>
    cn("well flex h-12 items-center gap-2 px-3.5 ring-2 transition-all duration-200",
      err ? "ring-bear/80 animate-shake" : ok ? "ring-bull/70" : focus === key ? "ring-sky shadow-[0_0_0_5px_rgba(61,155,255,.15)]" : "ring-transparent");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Email · валидация</Label>
        <div className={box("e", emailErr, emailOk)} key={emailErr ? "err" : "ok"}>
          <Icon name="user" size={18} className="text-ink-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus("e")} onBlur={() => setFocus(null)} placeholder="trader@mail.com"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink-500" />
          {emailOk && <Icon name="check" size={18} stroke={3} className="text-bull animate-pop" />}
          {emailErr && <Icon name="alert" size={18} className="text-bear" />}
        </div>
        <div className={cn("mt-1.5 text-[11px] font-semibold", emailErr ? "text-bear" : "text-ink-400")}>{emailErr ? "Проверь формат адреса" : "Мы не рассылаем спам"}</div>
      </div>
      <div>
        <Label>Пароль · сила</Label>
        <div className={box("p")}>
          <Icon name="lock" size={18} className="text-ink-400" />
          <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} onFocus={() => setFocus("p")} onBlur={() => setFocus(null)}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold outline-none" />
          <button onClick={() => { tap("tick"); setShow(!show); }} className="text-ink-300 hover:text-white" aria-label="toggle"><Icon name={show ? "eyeOff" : "eye"} size={18} /></button>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-colors duration-300", i < strength ? ["bg-bear", "bg-flame", "bg-gold", "bg-bull"][strength - 1] : "bg-ink-700")} />
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Label>Сумма сделки · быстрые проценты</Label>
        <div className={box("a", over)} key={over ? "o" : "n"}>
          <span className="font-display text-lg text-ink-400">$</span>
          <input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} onFocus={() => setFocus("a")} onBlur={() => setFocus(null)}
            className="min-w-0 flex-1 bg-transparent font-mono text-xl font-bold outline-none tabular-nums" />
          <span className="rounded-lg bg-ink-700 px-2 py-1 font-display text-[10px] font-bold">USDT</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {[10, 25, 50, 100].map((p) => (
            <button key={p} onClick={() => { tap("tick"); setAmt(String((bal * p) / 100)); }}
              className={cn("tile3d h-9 flex-1 font-display text-[11px] font-bold", amtN === (bal * p) / 100 && "text-sky")} data-state={amtN === (bal * p) / 100 ? "selected" : undefined}>
              {p === 100 ? "MAX" : `${p}%`}
            </button>
          ))}
        </div>
        <div className={cn("mt-2 text-[11px] font-semibold", over ? "text-bear" : "text-ink-400")}>{over ? `Недостаточно средств · доступно $${bal}` : `Доступно: $${bal.toFixed(2)}`}</div>
      </div>
    </div>
  );
}

/* C03 — Selection */
export function Selection() {
  const [checks, setChecks] = useState([true, false, false]);
  const [radio, setRadio] = useState("mid");
  const [sw, setSw] = useState({ push: true, sound: false, pro: true });
  const [side, setSide] = useState<"long" | "short">("long");
  const labels = ["Понимаю риски плеча", "Запомнить устройство", "Получать сигналы"];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label>Чекбоксы</Label>
        <div className="space-y-2.5">
          {labels.map((l, i) => (
            <button key={l} onClick={() => { tap("tick"); setChecks((c) => c.map((v, j) => (j === i ? !v : v))); }} className="flex w-full items-center gap-3 text-left group">
              <span className={cn("flex size-7 items-center justify-center rounded-[9px] border-2 transition-all duration-200",
                checks[i] ? "border-bull bg-bull text-ink-900 shadow-[0_3px_0_var(--color-bull-d)]" : "border-ink-500 bg-ink-850 shadow-[0_3px_0_#0e1b3a] group-hover:border-ink-400")}>
                {checks[i] && <Icon name="check" size={16} stroke={3.5} className="animate-pop" />}
              </span>
              <span className="text-sm font-semibold">{l}</span>
            </button>
          ))}
        </div>
        <Label className="mt-5">Радио · профиль риска</Label>
        <div className="space-y-2">
          {[["low", "Консерватор", "до 2x"], ["mid", "Баланс", "до 10x"], ["high", "Дегенерат", "до 100x"]].map(([v, t, s]) => (
            <button key={v} onClick={() => { tap("tick"); setRadio(v); }} data-state={radio === v ? "selected" : undefined} className="tile3d flex w-full items-center gap-3 px-3 py-2.5 text-left">
              <span className={cn("flex size-5 items-center justify-center rounded-full border-2", radio === v ? "border-sky" : "border-ink-500")}>
                <span className={cn("size-2.5 rounded-full bg-sky transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]", radio === v ? "scale-100" : "scale-0")} />
              </span>
              <span className="flex-1 text-sm font-bold">{t}</span>
              <span className="font-mono text-[11px] text-ink-300">{s}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Свитчи</Label>
        <div className="panel-soft divide-y divide-white/5">
          {([["push", "Push-уведомления", "bull"], ["sound", "Звуки в уроках", "sky"], ["pro", "Pro-режим графика", "gold"]] as const).map(([k, t, tone]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold">{t}</span>
              <Toggle on={sw[k]} tone={tone} label={t} onChange={(v) => setSw((s) => ({ ...s, [k]: v }))} />
            </div>
          ))}
        </div>
        <Label className="mt-5">Направление · segmented</Label>
        <Segmented value={side} onChange={setSide} options={[
          { v: "long", label: <span className="inline-flex items-center gap-1"><Icon name="trendUp" size={14} stroke={2.6} />Long</span>, tone: "bg-bull shadow-[0_3px_0_var(--color-bull-d)]" },
          { v: "short", label: <span className="inline-flex items-center gap-1"><Icon name="trendDown" size={14} stroke={2.6} />Short</span>, tone: "bg-bear shadow-[0_3px_0_var(--color-bear-d)]" },
        ]} />
        <div className="mt-3 text-[11px] text-ink-400">Ставка на {side === "long" ? "рост ↑" : "падение ↓"} цены</div>
      </div>
    </div>
  );
}

/* C04 — Leverage slider + stepper */
export function Sliders() {
  const [lev, setLev] = useState(10);
  const [qty, setQty] = useState(3);
  const [vol, setVol] = useState(60);
  const marks = [1, 5, 10, 25, 50, 100];
  const pos = (v: number) => (Math.log(v) / Math.log(100)) * 100;
  const risk = lev <= 5 ? { t: "Низкий", c: "text-bull", bg: "#2BE38B" } : lev <= 25 ? { t: "Средний", c: "text-gold", bg: "#FFC940" } : { t: "Экстрим", c: "text-bear", bg: "#FF4D6D" };
  const p = pos(lev);
  const liq = (100 / lev).toFixed(1);
  return (
    <div className="space-y-5">
      <div className="panel-soft p-4">
        <div className="flex items-end justify-between">
          <div>
            <Label className="mb-1">Кредитное плечо</Label>
            <div className="font-display text-4xl font-black tabular-nums" style={{ color: risk.bg, textShadow: `0 4px 0 rgba(0,0,0,.35)` }}>{lev}x</div>
          </div>
          <div className="text-right">
            <div className={cn("font-display text-xs font-bold uppercase", risk.c)}>Риск: {risk.t}</div>
            <div className="font-mono text-[11px] text-ink-300">Ликвидация при −{liq}%</div>
          </div>
        </div>
        <div className="relative mt-3">
          <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
          <div className="absolute left-0 top-[11px] h-3 rounded-full transition-[background] duration-300" style={{ width: `${p}%`, background: `linear-gradient(90deg,#2BE38B,${risk.bg})` }} />
          <input type="range" className="rng relative" min={0} max={100} step={0.5} value={p} aria-label="leverage"
            onChange={(e) => {
              const v = Math.max(1, Math.round(Math.pow(100, +e.target.value / 100)));
              if (v !== lev) { sfx("tick"); if (marks.includes(v)) haptic(12); }
              setLev(v);
            }} />
        </div>
        <div className="relative mt-1 h-5">
          {marks.map((m) => (
            <button key={m} onClick={() => { tap("tick"); setLev(m); }} className={cn("absolute -translate-x-1/2 font-mono text-[10px] font-bold", lev === m ? "text-white" : "text-ink-400")} style={{ left: `${pos(m)}%` }}>{m}x</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Степпер · лот</Label>
          <div className="flex items-center gap-2">
            <Btn s="md" v="ink" icon="minus" className="w-12 px-0" aria-label="minus" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} />
            <div className="well flex h-12 flex-1 items-center justify-center font-mono text-xl font-bold tabular-nums" key={qty}><span className="animate-pop">{qty}</span></div>
            <Btn s="md" v="ink" icon="plus" className="w-12 px-0" aria-label="plus" disabled={qty >= 10} onClick={() => { if (qty >= 9) notify("Максимум 10 лотов", "warn"); setQty((q) => q + 1); }} />
          </div>
        </div>
        <div>
          <Label>Громкость · {vol}%</Label>
          <div className="relative">
            <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
            <div className="absolute left-0 top-[11px] h-3 rounded-full bg-sky" style={{ width: `${vol}%` }} />
            <input type="range" className="rng relative" min={0} max={100} value={vol} onChange={(e) => setVol(+e.target.value)} aria-label="volume" />
          </div>
        </div>
      </div>
    </div>
  );
}
