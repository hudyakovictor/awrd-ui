import { useState } from "react";
import { Asset, Btn, Chip, Label, Section, Segmented, Spinner, haptic } from "../components/ui";
import { CoinIcon, GemIcon, Icon } from "../components/icons";
import { cn } from "../utils/cn";

function Buttons() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [count, setCount] = useState(0);
  const run = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1100);
    setTimeout(() => setState("idle"), 2600);
  };
  return (
    <Asset title="Button Set" code="C-01" tags="button buttons cta primary secondary buy sell loading disabled" span={5}>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4">
        <div className="col-span-3 grid grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-wider text-ink-400">
          <span>Default</span>
          <span>Pressed</span>
          <span>Disabled</span>
        </div>
        <Btn variant="bull" block onClick={() => setCount((c) => c + 1)}>
          Continue
        </Btn>
        <Btn variant="bull" block data-pressed="true">
          Continue
        </Btn>
        <Btn variant="bull" block disabled>
          Continue
        </Btn>
        <Btn variant="azure" block>
          Learn
        </Btn>
        <Btn variant="azure" block data-pressed="true">
          <Spinner size={16} /> Wait
        </Btn>
        <Btn variant="azure" block disabled>
          Locked
        </Btn>
        <Btn variant="ghost" block>
          Skip
        </Btn>
        <Btn variant="ghost" block data-pressed="true">
          Skip
        </Btn>
        <Btn variant="ghost" block disabled>
          Skip
        </Btn>
      </div>

      <Label className="mt-6">Trade actions</Label>
      <div className="grid grid-cols-2 gap-3">
        <Btn variant="bull" size="lg" block>
          <Icon name="trendUp" size={20} stroke={3} /> Long
        </Btn>
        <Btn variant="bear" size="lg" block>
          <Icon name="trendDown" size={20} stroke={3} /> Short
        </Btn>
      </div>

      <Label className="mt-6">Stateful CTA · Icon · Reward</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Btn
          variant={state === "done" ? "bull" : "violet"}
          onClick={run}
          className="min-w-[150px] transition-all"
          loading={state === "loading"}
        >
          {state === "done" ? (
            <span className="anim-pop flex items-center gap-2">
              <Icon name="check" size={18} stroke={3.2} /> Done
            </span>
          ) : (
            "Submit order"
          )}
        </Btn>
        <Btn variant="gold" className="sheen">
          <GemIcon size={20} /> Claim 50
        </Btn>
        <Btn variant="ghost" size="icon" aria-label="Sound">
          <Icon name="volume" />
        </Btn>
        <Btn variant="flame" size="iconSm" aria-label="Share">
          <Icon name="share" size={18} />
        </Btn>
      </div>
      <div className="mt-3 text-[11px] text-ink-400">
        Continue pressed: <span className="font-mono font-bold text-bull">{count}</span> · every press: 5px lip travel + haptic
      </div>
    </Asset>
  );
}

function TextFields() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [shake, setShake] = useState(0);
  const [pwd, setPwd] = useState("hodl2024");
  const [show, setShow] = useState(false);
  const [q, setQ] = useState("Bitcoin");
  const valid = /^\S+@\S+\.\S+$/.test(email);
  const error = touched && !valid;
  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pwd)).length);
  return (
    <Asset title="Text Fields" code="C-02" tags="input text field form email password search validation" span={4}>
      <div className="space-y-4">
        <div key={shake} className={shake ? "anim-shake" : ""}>
          <Label>Email · validation</Label>
          <div
            className={cn(
              "panel-inset flex h-12 items-center gap-2 rounded-2xl px-3 transition-all focus-within:ring-2",
              error ? "ring-2 ring-bear" : valid ? "ring-2 ring-bull/70" : "focus-within:ring-azure",
            )}
          >
            <Icon name="user" size={18} className="text-ink-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="trader@tradelingo.app"
              className="h-full flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-ink-500"
            />
            {valid && <Icon name="check" size={18} stroke={3} className="anim-pop text-bull" />}
            {error && <Icon name="warning" size={18} className="anim-pop text-bear" />}
          </div>
          <div className={cn("mt-1.5 text-[11px] font-semibold", error ? "text-bear" : "text-ink-400")}>
            {error ? "Enter a valid email address" : "We'll never share your email."}
          </div>
        </div>
        <div>
          <Label>Password · strength</Label>
          <div className="panel-inset flex h-12 items-center gap-2 rounded-2xl px-3 focus-within:ring-2 focus-within:ring-azure">
            <Icon name="lock" size={18} className="text-ink-400" />
            <input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="h-full flex-1 bg-transparent font-mono text-sm text-white outline-none"
            />
            <button onClick={() => setShow((s) => !s)} className="text-ink-400 hover:text-white">
              <Icon name="eye" size={18} />
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i < strength ? ["bg-bear", "bg-flame", "bg-gold", "bg-bull"][strength - 1] : "bg-ink-700",
                )}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Search</Label>
          <div className="panel-inset flex h-12 items-center gap-2 rounded-2xl px-3 focus-within:ring-2 focus-within:ring-azure">
            <Icon name="search" size={18} className="text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets" className="h-full flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-ink-500" />
            {q && (
              <button onClick={() => setQ("")} className="anim-pop flex h-6 w-6 items-center justify-center rounded-full bg-ink-600 text-ink-200 hover:bg-ink-500">
                <Icon name="x" size={12} stroke={3} />
              </button>
            )}
          </div>
        </div>
        <Btn
          variant="azure"
          block
          size="sm"
          onClick={() => {
            setTouched(true);
            if (!valid) setShake((s) => s + 1);
          }}
        >
          Validate form
        </Btn>
      </div>
    </Asset>
  );
}

function Selection() {
  const [checks, setChecks] = useState([true, false, true]);
  const [radio, setRadio] = useState(1);
  const [sw, setSw] = useState([true, false]);
  const [topics, setTopics] = useState<string[]>(["DeFi", "Charts"]);
  const allTopics = ["DeFi", "Charts", "NFT", "Risk", "Macro", "On-chain"];
  return (
    <Asset title="Checkbox · Radio · Switch" code="C-03" tags="checkbox radio switch toggle chips selection" span={3}>
      <Label>Checkbox</Label>
      <div className="space-y-2">
        {["Stop-loss alerts", "Daily reminder", "Sound FX"].map((l, i) => (
          <button
            key={l}
            onClick={() => {
              haptic();
              setChecks((c) => c.map((v, j) => (j === i ? !v : v)));
            }}
            className="flex w-full items-center gap-3 text-left text-sm font-bold text-ink-100"
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
                checks[i] ? "bg-bull text-ink-950 shadow-[0_3px_0_#0c8f63]" : "panel-inset",
              )}
            >
              {checks[i] && <Icon name="check" size={16} stroke={3.5} className="anim-pop" />}
            </span>
            {l}
          </button>
        ))}
      </div>
      <Label className="mt-5">Risk profile</Label>
      <div className="space-y-2">
        {["Conservative", "Balanced", "Degen"].map((l, i) => (
          <button key={l} onClick={() => setRadio(i)} className="flex w-full items-center gap-3 text-left text-sm font-bold text-ink-100">
            <span className="panel-inset flex h-7 w-7 items-center justify-center rounded-full">
              <span
                className={cn(
                  "h-3.5 w-3.5 rounded-full bg-azure shadow-[0_0_10px_#3e8bff] transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]",
                  radio === i ? "scale-100" : "scale-0",
                )}
              />
            </span>
            {l}
          </button>
        ))}
      </div>
      <Label className="mt-5">Switch</Label>
      <div className="space-y-3">
        {["Paper trading", "Push notifications"].map((l, i) => (
          <div key={l} className="flex items-center justify-between text-sm font-bold">
            {l}
            <button
              onClick={() => {
                haptic();
                setSw((s) => s.map((v, j) => (j === i ? !v : v)));
              }}
              className={cn(
                "relative h-8 w-14 rounded-full transition-colors duration-300",
                sw[i] ? "bg-bull shadow-[inset_0_2px_4px_rgba(0,0,0,.25)]" : "panel-inset",
              )}
            >
              <span
                className="absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-white to-ink-200 shadow-[0_3px_0_#8ea4d2,0_4px_8px_rgba(0,0,0,.4)] transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]"
                style={{ left: sw[i] ? 28 : 4 }}
              />
            </button>
          </div>
        ))}
      </div>
      <Label className="mt-5">Topics · multi</Label>
      <div className="flex flex-wrap gap-1.5">
        {allTopics.map((t) => {
          const on = topics.includes(t);
          return (
            <button
              key={t}
              onClick={() => setTopics((s) => (on ? s.filter((x) => x !== t) : [...s, t]))}
              className={cn(
                "rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all active:translate-y-0.5",
                on ? "bg-azure text-white shadow-[0_3px_0_#1c55c2]" : "bg-ink-750 text-ink-300 shadow-[0_3px_0_#0b1838]",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

function LeverageSlider() {
  const [lev, setLev] = useState(10);
  const [vol, setVol] = useState(75);
  const entry = 64250;
  const liq = entry * (1 - 1 / lev + 0.005);
  const risk = lev <= 5 ? "Low" : lev <= 20 ? "Medium" : lev <= 50 ? "High" : "Extreme";
  const riskColor = { Low: "#22d39a", Medium: "#ffc23d", High: "#ff7a2f", Extreme: "#ff4d6d" }[risk];
  const pct = ((lev - 1) / 99) * 100;
  return (
    <Asset title="Leverage & Value Sliders" code="C-04" tags="slider range leverage risk volume" span={6}>
      <div className="flex items-start justify-between">
        <div>
          <Label>Leverage</Label>
          <div className="font-display text-4xl font-black tabular-nums" style={{ color: riskColor, textShadow: `0 0 24px ${riskColor}55` }}>
            {lev}×
          </div>
        </div>
        <div className="text-right">
          <Chip tone={risk === "Low" ? "bull" : risk === "Medium" ? "gold" : risk === "High" ? "flame" : "bear"}>
            <Icon name="warning" size={12} /> {risk} risk
          </Chip>
          <div className="mt-2 font-mono text-[11px] text-ink-400">
            Liq. price <span className="font-bold text-bear">${liq.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
      <div className="relative mt-4">
        <div className="panel-inset absolute inset-x-0 top-[12px] h-3 rounded-full" />
        <div
          className="absolute left-0 top-[12px] h-3 rounded-full transition-[background] duration-300"
          style={{ width: `calc(${pct}% + ${15 - pct * 0.3}px)`, background: `linear-gradient(90deg,#22d39a,${riskColor})`, boxShadow: `0 0 14px ${riskColor}88` }}
        />
        <div
          className="pointer-events-none absolute -top-9 -translate-x-1/2 rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-bold text-ink-900 shadow-[0_3px_0_#8ea4d2]"
          style={{ left: `calc(${pct}% + ${15 - pct * 0.3}px)` }}
        >
          {lev}×
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
        </div>
        <input type="range" min={1} max={100} value={lev} onChange={(e) => setLev(+e.target.value)} className="range relative" />
      </div>
      <div className="mt-1 flex justify-between px-1">
        {[1, 10, 25, 50, 75, 100].map((t) => (
          <button key={t} onClick={() => setLev(t)} className={cn("font-mono text-[10px] font-bold transition-colors", lev === t ? "text-white" : "text-ink-500 hover:text-ink-200")}>
            {t}×
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Icon name="volume" className="text-ink-300" />
        <div className="relative">
          <div className="panel-inset absolute inset-x-0 top-[12px] h-3 rounded-full" />
          <div className="absolute left-0 top-[12px] h-3 rounded-full bg-gradient-to-r from-azure to-cyan" style={{ width: `calc(${vol}% + ${15 - vol * 0.3}px)` }} />
          <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(+e.target.value)} className="range relative" />
        </div>
        <span className="w-10 text-right font-mono text-xs font-bold text-cyan-300">{vol}%</span>
      </div>
      <div className="mt-1 flex justify-between px-10">
        {Array.from({ length: 21 }).map((_, i) => (
          <span key={i} className={cn("w-px bg-ink-500", i % 5 === 0 ? "h-2.5" : "h-1.5")} />
        ))}
      </div>
    </Asset>
  );
}

function OrderInput() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"market" | "limit" | "stop">("market");
  const [amt, setAmt] = useState("250");
  const [pct, setPct] = useState<number | null>(null);
  const balance = 1000;
  const price = 64250;
  const qty = (parseFloat(amt) || 0) / price;
  const over = (parseFloat(amt) || 0) > balance;
  return (
    <Asset title="Order Entry Panel" code="C-05" tags="order buy sell amount input segmented stepper trade" span={6}>
      <Segmented
        value={side}
        onChange={setSide}
        options={[
          { value: "buy", label: <><Icon name="arrowUp" size={14} stroke={3} /> Buy</> },
          { value: "sell", label: <><Icon name="arrowDown" size={14} stroke={3} /> Sell</> },
        ]}
        tones={{
          buy: "bg-gradient-to-b from-[#4fe8b3] to-bull shadow-[0_3px_0_#0c8f63]",
          sell: "bg-gradient-to-b from-[#ff7d95] to-bear shadow-[0_3px_0_#b31f3d]",
        }}
      />
      <div className="mt-3 flex gap-2">
        {(["market", "limit", "stop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-lg px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider transition",
              type === t ? "bg-white/10 text-white" : "text-ink-400 hover:text-ink-200",
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-ink-400">
          <Icon name="wallet" size={14} /> ${balance.toFixed(2)}
        </span>
      </div>

      <div className={cn("panel-inset mt-3 flex items-center gap-2 rounded-2xl p-2 pl-4 transition-all", over && "ring-2 ring-bear")}>
        <span className="font-mono text-2xl font-bold text-ink-400">$</span>
        <input
          value={amt}
          inputMode="decimal"
          onChange={(e) => {
            setPct(null);
            setAmt(e.target.value.replace(/[^\d.]/g, ""));
          }}
          className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-bold text-white outline-none"
        />
        <div className="flex gap-1.5">
          <Btn variant="ghost" size="iconSm" onClick={() => setAmt(String(Math.max(0, (parseFloat(amt) || 0) - 10)))}>
            <Icon name="minus" size={16} stroke={3} />
          </Btn>
          <Btn variant="ghost" size="iconSm" onClick={() => setAmt(String((parseFloat(amt) || 0) + 10))}>
            <Icon name="plus" size={16} stroke={3} />
          </Btn>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
        <span className={over ? "text-bear" : "text-ink-400"}>{over ? "Insufficient balance" : `≈ ${qty.toFixed(6)} BTC`}</span>
        <span className="font-mono text-ink-400">@ ${price.toLocaleString()}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((p) => (
          <button
            key={p}
            onClick={() => {
              haptic();
              setPct(p);
              setAmt(String((balance * p) / 100));
            }}
            className={cn(
              "h-9 rounded-xl text-xs font-extrabold transition-all active:translate-y-0.5",
              pct === p ? "bg-azure text-white shadow-[0_3px_0_#1c55c2]" : "bg-ink-750 text-ink-300 shadow-[0_3px_0_#0b1838] hover:text-white",
            )}
          >
            {p === 100 ? "MAX" : `${p}%`}
          </button>
        ))}
      </div>
      <Btn variant={side === "buy" ? "bull" : "bear"} size="lg" block className="mt-5" disabled={over || !parseFloat(amt)}>
        <CoinIcon size={22} /> {side === "buy" ? "Buy" : "Sell"} BTC · {type}
      </Btn>
    </Asset>
  );
}

export default function Controls() {
  return (
    <Section id="controls" index="02" kicker="Input & actions" title="Controls">
      <Buttons />
      <TextFields />
      <Selection />
      <LeverageSlider />
      <OrderInput />
    </Section>
  );
}
