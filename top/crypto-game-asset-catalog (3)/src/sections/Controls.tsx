import { useRef, useState } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump, useKit } from "../ui/kit";
import { cn } from "../utils/cn";

function Buttons() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const run = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1300);
    setTimeout(() => setState("idle"), 2800);
  };
  return (
    <AssetCard id="CTL-01" title="Tactile Buttons" desc="Объёмные кнопки с физическим ходом, бликом и шайном на hover. 8 вариантов × 3 размера × 4 состояния." tags={["button", "cta", "3d"]}>
      <div className="mb-4 flex justify-end gap-1">
        {(["sm", "md", "lg"] as const).map((s) => (
          <button key={s} onClick={() => setSize(s)} className={cn("rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold uppercase", size === s ? "bg-sky text-white" : "bg-ink-800 text-ink-400")}>{s}</button>
        ))}
      </div>
      <div className="space-y-4">
        <Btn v="bull" size={size} block>Continue</Btn>
        <div className="grid grid-cols-2 gap-3">
          <Btn v="bull" size={size}><Icon name="trendUp" size={18} stroke={2.8} />Buy</Btn>
          <Btn v="bear" size={size}><Icon name="trendDown" size={18} stroke={2.8} />Sell</Btn>
          <Btn v="gold" size={size}><Icon name="gift" size={18} stroke={2.6} />Claim</Btn>
          <Btn v="violet" size={size}><Icon name="gem" size={18} stroke={2.4} />Go Pro</Btn>
          <Btn v="ghost" size={size}>Skip</Btn>
          <Btn v="sky" size={size} disabled>Locked</Btn>
        </div>
        <Btn v={state === "done" ? "bull" : "sky"} size={size} block onClick={run} className={state === "loading" ? "is-pressed" : ""}>
          {state === "idle" && <>Check answer</>}
          {state === "loading" && <><span className="h-4 w-4 rounded-full border-[3px] border-white/30 border-t-white anim-spin" />Checking…</>}
          {state === "done" && <span className="anim-pop flex items-center gap-2"><Icon name="check" size={18} stroke={3.2} />Correct!</span>}
        </Btn>
      </div>
    </AssetCard>
  );
}

function IconButtons() {
  const [n, setN] = useState(3);
  const [liked, setLiked] = useState(false);
  const [b, bump] = useBump();
  const [muted, setMuted] = useState(false);
  const [w, wig] = useBump();
  return (
    <AssetCard id="CTL-02" title="Icon Buttons & Counters" desc="Квадратные 3D-иконки с бейджами, лайк с всплеском частиц, колокольчик с тряской." tags={["icon-button", "badge", "fab"]}>
      <div className="flex flex-wrap items-center justify-around gap-4 py-2">
        <div className="relative">
          <Btn v="ghost" size="iconLg" onClick={() => { setN((x) => x + 1); wig(); }}>
            <Icon key={w} name="bell" size={24} className={w ? "anim-wiggle" : ""} />
          </Btn>
          {n > 0 && <span key={n} className="anim-pop absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-bear px-1.5 font-mono text-[11px] font-extrabold text-white shadow-[0_2px_0_#c21f43,0_0_0_3px_#0a1330]">{n > 99 ? "99+" : n}</span>}
        </div>
        <div className="relative">
          <Btn v={liked ? "bear" : "ghost"} size="iconLg" onClick={() => { setLiked(!liked); if (!liked) bump(); }}>
            <Icon key={String(liked)} name="heart" size={24} variant={liked ? "solid" : "line"} className={liked ? "anim-pop" : ""} />
          </Btn>
          <Burst trigger={liked ? b : 0} colors={["#ff4d6a", "#ff8aa0", "#ffc53d"]} spread={46} count={10} />
        </div>
        <Btn v={muted ? "dark" : "sky"} size="iconLg" onClick={() => setMuted(!muted)} aria-label="sound">
          <Icon name="volume" size={24} className={muted ? "opacity-40" : ""} />
          {muted && <span className="absolute h-[3px] w-8 rotate-45 rounded bg-bear" />}
        </Btn>
        <Btn v="gold" size="iconLg" className="rounded-full!"><Icon name="plus" size={26} stroke={3} /></Btn>
      </div>
      <Label className="mt-4">Compact · 44px</Label>
      <div className="flex gap-2">
        {["chevL", "search", "filter", "gear", "dots"].map((i) => <Btn key={i} v="dark" size="icon"><Icon name={i} size={18} /></Btn>)}
        <Btn v="bull" size="icon"><Icon name="chevR" size={18} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

function Selection() {
  const [checks, setChecks] = useState([true, false, true]);
  const [radio, setRadio] = useState(1);
  const [sw, setSw] = useState([true, false]);
  const [seg, setSeg] = useState(1);
  const segs = ["1H", "4H", "1D", "1W", "1M"];
  return (
    <AssetCard id="CTL-03" title="Selection Controls" desc="Чекбокс, радио, свитч и сегмент с физическим скользящим индикатором." tags={["checkbox", "radio", "switch", "segmented"]}>
      <Label>Segmented · timeframe</Label>
      <div className="well relative mb-5 flex rounded-2xl p-1.5">
        <div className="raised absolute bottom-1.5 top-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${(seg / segs.length) * 100}% + 6px)`, width: `calc(${100 / segs.length}% - 12px)` }} />
        {segs.map((s, i) => (
          <button key={s} onClick={() => setSeg(i)} className={cn("relative z-10 flex-1 py-2 font-mono text-xs font-extrabold transition-colors", seg === i ? "text-white" : "text-ink-400 hover:text-ink-200")}>{s}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label>Checkbox</Label>
          {["Stop-loss", "Take-profit", "Trailing"].map((l, i) => (
            <button key={l} onClick={() => setChecks(checks.map((c, j) => (j === i ? !c : c)))} className="flex items-center gap-3">
              <span className={cn("grid h-7 w-7 place-items-center rounded-lg transition-all duration-150", checks[i] ? "bg-bull shadow-[0_3px_0_#12a46a,inset_0_1px_0_#fff8]" : "well")}>
                {checks[i] && <Icon name="check" size={16} stroke={3.4} className="anim-pop text-ink-900" />}
              </span>
              <span className="text-sm font-bold text-ink-200">{l}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Label>Radio</Label>
          {["Market", "Limit", "Stop"].map((l, i) => (
            <button key={l} onClick={() => setRadio(i)} className="flex items-center gap-3">
              <span className="well grid h-7 w-7 place-items-center rounded-full">
                <span className={cn("rounded-full bg-sky shadow-[0_2px_0_#1e56c9,0_0_10px_#3d8bff] transition-all duration-200", radio === i ? "h-4 w-4" : "h-0 w-0")} />
              </span>
              <span className="text-sm font-bold text-ink-200">{l}</span>
            </button>
          ))}
        </div>
      </div>
      <Label className="mt-5">Switch</Label>
      <div className="flex flex-col gap-3">
        {["Price alerts", "Sound FX"].map((l, i) => (
          <button key={l} onClick={() => setSw(sw.map((s, j) => (j === i ? !s : s)))} className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink-200">{l}</span>
            <span className={cn("relative h-8 w-14 rounded-full transition-colors duration-200", sw[i] ? "bg-bull/90 shadow-[inset_0_2px_6px_#0005]" : "well")}>
              <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-white to-ink-200 shadow-[0_3px_0_#8fa0cf,0_4px_8px_#0006] transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]", sw[i] ? "left-7" : "left-1")} />
            </span>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

function LeverageSlider() {
  const [lev, setLev] = useState(10);
  const pct = ((lev - 1) / 99) * 100;
  const risk = lev <= 5 ? { t: "Low risk", c: "#2ee59d", e: "#12a46a" } : lev <= 25 ? { t: "Medium", c: "#ffc53d", e: "#cc8a00" } : lev <= 60 ? { t: "High", c: "#ff8a3d", e: "#d9531a" } : { t: "Liquidation zone", c: "#ff4d6a", e: "#c21f43" };
  const liq = (64000 * (1 - 1 / lev)).toFixed(0);
  return (
    <AssetCard id="CTL-04" title="Leverage Slider" desc="Слайдер плеча: цвет, подсказка и вибрация реагируют на риск. Обучает через ощущение." tags={["slider", "range", "risk"]}>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Leverage</div>
          <div className="font-mono text-4xl font-extrabold tabular-nums" style={{ color: risk.c, textShadow: `0 0 20px ${risk.c}66` }}>{lev}×</div>
        </div>
        <span key={risk.t} className="anim-pop rounded-full px-3 py-1 text-[11px] font-extrabold uppercase" style={{ background: `${risk.c}22`, color: risk.c, boxShadow: `inset 0 0 0 1px ${risk.c}55` }}>{risk.t}</span>
      </div>
      <div className={cn("relative h-10", lev > 60 && "anim-shake")} key={lev > 60 ? "hot" : "ok"}>
        <div className="well absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full" />
        <div className="absolute left-0 top-1/2 h-4 -translate-y-1/2 rounded-full transition-colors" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2ee59d,#ffc53d 35%,#ff8a3d 60%,#ff4d6a)", backgroundSize: `${10000 / Math.max(pct, 1)}% 100%` }} />
        <div className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 font-mono text-[11px] font-extrabold text-ink-900" style={{ background: risk.c, boxShadow: `0 3px 0 ${risk.e}` }}>
            {lev}×<span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45" style={{ background: risk.c }} />
          </div>
          <div className="h-8 w-8 rounded-full border-4 border-white bg-gradient-to-b from-white to-ink-200" style={{ boxShadow: `0 4px 0 #8fa0cf, 0 0 0 6px ${risk.c}33, 0 0 20px ${risk.c}` }} />
        </div>
        <input type="range" min={1} max={100} value={lev} onChange={(e) => setLev(+e.target.value)} className="range-reset absolute inset-0 h-10 cursor-grab" aria-label="Leverage" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] font-bold text-ink-400">
        {[1, 25, 50, 75, 100].map((t) => <button key={t} onClick={() => setLev(t)} className="hover:text-white">{t}×</button>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="raised rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-ink-400">Liq. price</div><div className="font-mono text-sm font-extrabold text-bear">${Number(liq).toLocaleString()}</div></div>
        <div className="raised rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-ink-400">Move to liq.</div><div className="font-mono text-sm font-extrabold text-white">−{(100 / lev).toFixed(1)}%</div></div>
      </div>
    </AssetCard>
  );
}

function Inputs() {
  const [amt, setAmt] = useState("250");
  const [focus, setFocus] = useState(false);
  const [err, setErr] = useState(0);
  const [q, setQ] = useState("");
  const [ok, setOk] = useState(false);
  const bal = 1000;
  const n = parseFloat(amt || "0");
  const invalid = n > bal;
  const assets = ["Bitcoin · BTC", "Ethereum · ETH", "Solana · SOL", "BNB · BNB", "Toncoin · TON", "Cardano · ADA"];
  const found = q ? assets.filter((a) => a.toLowerCase().includes(q.toLowerCase())) : [];
  const step = (d: number) => { const v = Math.max(0, n + d); setAmt(String(v)); if (v > bal) setErr((x) => x + 1); };
  return (
    <AssetCard id="CTL-05" title="Text Fields" desc="Поле суммы со степпером и валидацией (тряска при ошибке), поиск с автоподсказками." tags={["input", "field", "validation", "search"]}>
      <Label>Amount · balance ${bal}</Label>
      <div key={err} className={cn(err && invalid ? "anim-shake" : "")}>
        <div className={cn("well flex h-14 items-center gap-2 rounded-2xl px-2 transition-shadow", focus && !invalid && "shadow-[inset_0_3px_8px_#0008,0_0_0_2px_#3d8bff,0_0_20px_#3d8bff55]", invalid && "shadow-[inset_0_3px_8px_#0008,0_0_0_2px_#ff4d6a,0_0_20px_#ff4d6a44]")}>
          <Btn v="dark" size="icon" className="h-10! w-10!" onClick={() => step(-50)}><Icon name="minus" size={16} stroke={3} /></Btn>
          <span className="font-mono text-lg font-bold text-ink-400">$</span>
          <input value={amt} onFocus={() => setFocus(true)} onBlur={() => { setFocus(false); if (invalid) setErr((x) => x + 1); }} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))}
            className="w-full min-w-0 bg-transparent font-mono text-xl font-extrabold text-white outline-none" inputMode="decimal" />
          <Btn v="dark" size="icon" className="h-10! w-10!" onClick={() => step(50)}><Icon name="plus" size={16} stroke={3} /></Btn>
        </div>
      </div>
      <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-bold", invalid ? "text-bear" : "text-ink-400")}>
        <Icon name={invalid ? "warn" : "info"} size={14} />{invalid ? `Недостаточно средств: максимум $${bal}` : "Мин. сумма сделки $10"}
      </div>
      <Label className="mt-5">Search asset</Label>
      <div className="relative">
        <div className="raised flex h-12 items-center gap-2 rounded-2xl px-3">
          <Icon name="search" size={18} className="text-ink-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setOk(false); }} placeholder="BTC, ETH, SOL…" className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-ink-500" />
          {ok && <Icon name="check" size={18} stroke={3} className="anim-pop text-bull" />}
          {q && !ok && <button onClick={() => setQ("")}><Icon name="x" size={16} className="text-ink-400" /></button>}
        </div>
        {found.length > 0 && !ok && (
          <div className="glass anim-fade-up absolute inset-x-0 top-14 z-20 overflow-hidden rounded-2xl p-1.5">
            {found.map((a) => (
              <button key={a} onClick={() => { setQ(a); setOk(true); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold text-ink-200 hover:bg-white/5">
                {a}<Icon name="chevR" size={14} className="text-ink-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </AssetCard>
  );
}

function OrderTicket() {
  const { notify } = useKit();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [pct, setPct] = useState(50);
  const [sent, setSent] = useState(0);
  const tRef = useRef<number>(0);
  const bal = 1200;
  const usd = (bal * pct) / 100;
  const place = () => {
    setSent((x) => x + 1);
    clearTimeout(tRef.current);
    notify(`${side === "buy" ? "Покупка" : "Продажа"} ${(usd / 64250).toFixed(5)} BTC исполнена`);
  };
  return (
    <AssetCard id="CTL-06" title="Order Ticket" desc="Собранный тикет ордера: сторона, доля баланса, превью и исполнение." tags={["order", "trade", "form"]}>
      <div className="well relative mb-4 grid grid-cols-2 rounded-2xl p-1.5">
        <div className={cn("absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]", side === "buy" ? "left-1.5 bg-bull shadow-[0_3px_0_#12a46a]" : "left-[calc(50%)] bg-bear shadow-[0_3px_0_#c21f43]")} />
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} onClick={() => setSide(s)} className={cn("relative z-10 py-2.5 text-sm font-extrabold uppercase tracking-wider transition-colors", side === s ? (s === "buy" ? "text-ink-900" : "text-white") : "text-ink-400")}>{s}</button>
        ))}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold text-ink-400">BTC / USDT</span>
        <span className="font-mono text-xs font-bold text-ink-200">@ 64,250.00</span>
      </div>
      <div className="my-3 text-center font-mono text-3xl font-extrabold text-white">${usd.toFixed(2)}</div>
      <div className="grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((p) => (
          <button key={p} onClick={() => setPct(p)} className={cn("rounded-xl py-2 font-mono text-xs font-extrabold transition-all", pct === p ? "raised -translate-y-0.5 text-white ring-2 ring-sky" : "bg-ink-800 text-ink-400 hover:text-ink-200")}>{p === 100 ? "MAX" : `${p}%`}</button>
        ))}
      </div>
      <div className="my-4 space-y-1.5 rounded-xl bg-ink-900/60 p-3 text-xs">
        <div className="flex justify-between"><span className="text-ink-400">You get</span><span className="font-mono font-bold text-white">{(usd / 64250).toFixed(5)} BTC</span></div>
        <div className="flex justify-between"><span className="text-ink-400">Fee (0.1%)</span><span className="font-mono font-bold text-ink-200">${(usd * 0.001).toFixed(2)}</span></div>
      </div>
      <div className="relative">
        <Btn v={side === "buy" ? "bull" : "bear"} size="lg" block onClick={place}>{side === "buy" ? "Buy BTC" : "Sell BTC"}</Btn>
        <Burst trigger={sent} colors={side === "buy" ? ["#2ee59d", "#ffc53d", "#fff"] : ["#ff4d6a", "#ffc53d", "#fff"]} />
      </div>
    </AssetCard>
  );
}

export default function Controls() {
  return (
    <Section id="controls" num="02" title="Controls" subtitle="Тактильные элементы управления с физикой нажатия">
      <Buttons />
      <IconButtons />
      <Selection />
      <LeverageSlider />
      <Inputs />
      <OrderTicket />
    </Section>
  );
}
