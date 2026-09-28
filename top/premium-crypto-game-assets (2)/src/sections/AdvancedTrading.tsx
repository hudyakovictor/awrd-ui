import { useMemo, useState } from "react";
import { Asset, Btn, Coin, Label, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

function RiskRewardPlanner() {
  const [entry, setEntry] = useState(67400);
  const [stop, setStop] = useState(66200);
  const [target, setTarget] = useState(70400);
  const [account, setAccount] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const riskDistance = Math.max(1, entry - stop);
  const rewardDistance = Math.max(0, target - entry);
  const ratio = rewardDistance / riskDistance;
  const dollarsAtRisk = account * riskPct / 100;
  const size = dollarsAtRisk / riskDistance;
  const potential = dollarsAtRisk * ratio;
  const quality = ratio >= 3 ? ["Excellent", "text-bull", "bull" as const] : ratio >= 2 ? ["Healthy", "text-gold", "gold" as const] : ratio >= 1 ? ["Weak", "text-flame", "flame" as const] : ["Invalid", "text-bear", "bear" as const];
  const min = Math.min(stop, entry, target) - 400;
  const max = Math.max(stop, entry, target) + 400;
  const y = (value: number) => 10 + ((max - value) / (max - min)) * 180;
  return (
    <Asset
      code="PRO-01"
      title="Risk / Reward Planner"
      desc="Entry, stop and target become a visual position plan with live R multiple, safe size and account-risk guardrails."
      tags={["calculator", "risk"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[10px] font-bold uppercase text-mist">Account size
              <div className="well h-11 px-3 mt-1 flex items-center"><span className="text-mist mr-1">$</span><input value={account} onChange={(event) => setAccount(+event.target.value.replace(/\D/g, "") || 0)} className="num bg-transparent outline-none min-w-0 w-full font-bold" /></div>
            </label>
            <label className="text-[10px] font-bold uppercase text-mist">Risk per trade
              <div className="well h-11 px-3 mt-1 flex items-center"><input type="number" min={0.1} max={5} step={0.1} value={riskPct} onChange={(event) => setRiskPct(Math.min(5, Math.max(.1, +event.target.value)))} className="num bg-transparent outline-none min-w-0 w-full font-bold" /><span className="text-mist">%</span></div>
            </label>
          </div>
          {[
            ["Entry", entry, setEntry, "sky"],
            ["Stop loss", stop, setStop, "bear"],
            ["Take profit", target, setTarget, "bull"],
          ].map(([label, value, setValue, color]) => (
            <label key={label as string} className="game-surface rounded-xl p-3 flex items-center gap-3">
              <span className={cn("w-2 h-8 rounded-full", color === "sky" ? "bg-sky" : color === "bear" ? "bg-bear" : "bg-bull")} />
              <span className="text-xs font-bold flex-1">{label as string}</span>
              <span className="text-mist">$</span>
              <input value={value as number} onChange={(event) => (setValue as (value: number) => void)(+event.target.value.replace(/\D/g, "") || 0)} className="num w-24 text-right bg-transparent outline-none font-black" />
            </label>
          ))}
          {riskPct > 2 && <div className="rounded-xl p-3 bg-bear/10 border border-bear/30 text-bear flex items-start gap-2 anim-shake"><Icon name="alert" size={17} /><span className="text-[10px] font-bold">Risk above 2% can compound losses quickly. Training target: 0.5–1.5%.</span></div>}
        </div>
        <div className="well dotgrid p-4 relative min-h-[270px]">
          <svg viewBox="0 0 420 210" className="w-full h-52">
            <rect x="28" y={y(target)} width="330" height={Math.max(2, y(entry) - y(target))} fill="rgba(34,211,138,.1)" />
            <rect x="28" y={y(entry)} width="330" height={Math.max(2, y(stop) - y(entry))} fill="rgba(255,75,110,.1)" />
            {[
              [target, "#22d38a", "TARGET"],
              [entry, "#3da5ff", "ENTRY"],
              [stop, "#ff4b6e", "STOP"],
            ].map(([value, color, label]) => (
              <g key={label as string}>
                <line x1="28" x2="358" y1={y(value as number)} y2={y(value as number)} stroke={color as string} strokeWidth="2" strokeDasharray="6 4" />
                <rect x="355" y={y(value as number) - 10} width="62" height="20" rx="6" fill={color as string} />
                <text x="386" y={y(value as number) + 3.5} fill={label === "TARGET" ? "#062418" : "#fff"} textAnchor="middle" fontSize="8" fontWeight="800">{label as string}</text>
              </g>
            ))}
            <path d={`M55 ${y(entry)} C100 ${y(entry) - 20}, 130 ${y(target) + 18}, 190 ${y(target) + 5} S290 ${y(target) + 2}, 330 ${y(target)}`} fill="none" stroke="#8ea3cf" strokeWidth="2" opacity=".55" />
          </svg>
          <div className="grid grid-cols-3 gap-2">
            <div className="tile !rounded-xl p-2 text-center"><div className={cn("num font-black text-lg", quality[1])}>{ratio.toFixed(2)}R</div><div className="text-[8px] text-mist uppercase font-bold">{quality[0]}</div></div>
            <div className="tile !rounded-xl p-2 text-center"><div className="num font-black text-lg text-sky">{size.toFixed(4)}</div><div className="text-[8px] text-mist uppercase font-bold">BTC size</div></div>
            <div className="tile !rounded-xl p-2 text-center"><div className="num font-black text-lg text-bull">${potential.toFixed(0)}</div><div className="text-[8px] text-mist uppercase font-bold">Potential</div></div>
          </div>
        </div>
      </div>
    </Asset>
  );
}

function DepthChart() {
  const [mid, setMid] = useState(67421);
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<{ x: number; side: "bid" | "ask"; price: number; size: number } | null>(null);
  useInterval(() => setMid((value) => value + (Math.random() - .48) * 8), 900);
  const points = useMemo(() => {
    const bids: { price: number; size: number }[] = [];
    const asks: { price: number; size: number }[] = [];
    let b = 0;
    let a = 0;
    for (let index = 0; index < 28; index++) {
      b += 2 + Math.random() * 8;
      a += 2 + Math.random() * 8;
      bids.push({ price: mid - (28 - index) * 8 * zoom, size: b });
      asks.push({ price: mid + index * 8 * zoom, size: a });
    }
    return { bids, asks };
  }, [Math.round(mid / 25), zoom]);
  const bidMax = Math.max(...points.bids.map((point) => point.size));
  const askMax = Math.max(...points.asks.map((point) => point.size));
  const bidPath = points.bids.map((point, index) => `${(index / 27) * 49},${92 - (point.size / bidMax) * 76}`).join(" ");
  const askPath = points.asks.map((point, index) => `${51 + (index / 27) * 49},${16 + (point.size / askMax) * 76}`).join(" ");
  return (
    <Asset
      code="PRO-02"
      title="Market Depth"
      desc="Interactive cumulative bid/ask depth with spread focus, zoom and hover inspection. Data gently resamples like a live venue."
      tags={["depth", "hover", "zoom"]}
    >
      <div className="flex items-center justify-between mb-3">
        <div><div className="text-[9px] uppercase tracking-wider font-black text-mist">BTC/USDT depth</div><div className="num text-xl font-black">${mid.toFixed(1)}</div></div>
        <div className="well p-1 flex gap-1">{[.5, 1, 2].map((value) => <button key={value} onClick={() => setZoom(value)} className={cn("num text-[9px] font-black px-2 py-1 rounded-lg", zoom === value ? "bg-sky text-white" : "text-mist")}>{value}×</button>)}</div>
      </div>
      <div className="well p-2 relative overflow-hidden mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-52" preserveAspectRatio="none" onMouseLeave={() => setHover(null)} onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const side = x < 50 ? "bid" : "ask";
          const index = Math.max(0, Math.min(27, Math.round(side === "bid" ? (x / 49) * 27 : ((x - 51) / 49) * 27)));
          const point = side === "bid" ? points.bids[index] : points.asks[index];
          setHover({ x, side, price: point.price, size: point.size });
        }}>
          <defs>
            <linearGradient id="depthB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d38a" stopOpacity=".45" /><stop offset="1" stopColor="#22d38a" stopOpacity=".03" /></linearGradient>
            <linearGradient id="depthA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff4b6e" stopOpacity=".04" /><stop offset="1" stopColor="#ff4b6e" stopOpacity=".48" /></linearGradient>
          </defs>
          {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(140,175,255,.07)" strokeWidth=".4" />)}
          <polygon points={`0,100 ${bidPath} 49,100`} fill="url(#depthB)" />
          <polyline points={bidPath} fill="none" stroke="#22d38a" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <polygon points={`51,100 ${askPath} 100,100`} fill="url(#depthA)" />
          <polyline points={askPath} fill="none" stroke="#ff4b6e" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <rect x="49" width="2" height="100" fill="#0a1330" />
          {hover && <line x1={hover.x} x2={hover.x} y1="0" y2="100" stroke="#eef3ff" strokeWidth=".5" strokeDasharray="2 2" />}
        </svg>
        {hover && <div className="absolute top-3 left-1/2 -translate-x-1/2 glass rounded-lg px-2 py-1 text-[9px] font-bold flex gap-2 anim-pop"><span className={hover.side === "bid" ? "text-bull" : "text-bear"}>${hover.price.toFixed(0)}</span><span className="num text-fog">{hover.size.toFixed(1)} BTC</span></div>}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center"><div className="tile !rounded-xl p-2"><div className="num text-sm font-black text-bull">$67,413</div><div className="text-[8px] text-mist">Best bid</div></div><div className="tile !rounded-xl p-2"><div className="num text-sm font-black text-gold">$16</div><div className="text-[8px] text-mist">Spread</div></div><div className="tile !rounded-xl p-2"><div className="num text-sm font-black text-bear">$67,429</div><div className="text-[8px] text-mist">Best ask</div></div></div>
    </Asset>
  );
}

type Rule = { id: number; left: string; op: string; right: string };

function StrategyBuilder() {
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, left: "Price", op: "crosses above", right: "EMA 20" },
    { id: 2, left: "Volume", op: "is greater than", right: "Avg 20" },
  ]);
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [tested, setTested] = useState(false);
  const add = () => setRules((items) => [...items, { id: Date.now(), left: "RSI 14", op: "is below", right: "30" }]);
  const update = (id: number, key: keyof Rule, value: string) => setRules((items) => items.map((rule) => rule.id === id ? { ...rule, [key]: value } : rule));
  return (
    <Asset
      code="PRO-03"
      title="No-code Strategy Builder"
      desc="Compose entry conditions as readable blocks, choose the action and run an educational backtest summary."
      tags={["builder", "backtest"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3"><span className="w-8 h-8 rounded-xl bg-sky/15 text-sky grid place-items-center"><Icon name="layers" size={17} /></span><div><div className="text-sm font-black">When all are true</div><div className="text-[9px] text-mist">Every condition must confirm the setup</div></div></div>
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={rule.id} className="game-surface rounded-xl p-2.5 flex flex-wrap sm:flex-nowrap items-center gap-2 anim-rise">
                <span className="num w-6 h-6 rounded-lg bg-sky/15 text-sky grid place-items-center text-[9px] font-black">{index + 1}</span>
                <select value={rule.left} onChange={(event) => update(rule.id, "left", event.target.value)} className="well h-9 px-2 text-xs font-bold outline-none flex-1 min-w-24"><option>Price</option><option>Volume</option><option>RSI 14</option><option>MACD</option></select>
                <select value={rule.op} onChange={(event) => update(rule.id, "op", event.target.value)} className="well h-9 px-2 text-[10px] outline-none flex-1 min-w-32"><option>crosses above</option><option>crosses below</option><option>is greater than</option><option>is below</option></select>
                <select value={rule.right} onChange={(event) => update(rule.id, "right", event.target.value)} className="well h-9 px-2 text-xs font-bold outline-none flex-1 min-w-24"><option>EMA 20</option><option>Avg 20</option><option>30</option><option>70</option></select>
                <button disabled={rules.length === 1} onClick={() => setRules((items) => items.filter((item) => item.id !== rule.id))} className="w-8 h-8 rounded-lg text-mist hover:bg-bear/10 hover:text-bear grid place-items-center disabled:opacity-25"><Icon name="x" size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={add} className="mt-2 h-10 px-3 rounded-xl border-2 border-dashed border-ink-500 text-mist hover:text-sky hover:border-sky/50 text-[10px] font-black uppercase flex items-center gap-2"><Icon name="plus" size={14} />Add condition</button>
          <div className="flex items-center gap-2 mt-4"><span className="text-[10px] font-black uppercase text-mist">Then open</span>{(["LONG", "SHORT"] as const).map((value) => <button key={value} onClick={() => setSide(value)} className={cn("h-9 px-4 rounded-xl text-[10px] font-black border-2 transition-all", side === value ? value === "LONG" ? "border-bull bg-bull/15 text-bull shadow-[0_3px_0_#0b7a4a]" : "border-bear bg-bear/15 text-bear shadow-[0_3px_0_#a01e3c]" : "border-ink-600 text-mist")}>{value}</button>)}</div>
        </div>
        <div className="well p-4 flex flex-col">
          <div className="text-[9px] uppercase tracking-[.2em] font-black text-mist mb-3">Backtest · BTC 1H · 90 days</div>
          {tested ? (
            <div className="anim-rise flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-2 mb-3">{[["Win rate", "61.8%", "text-bull"], ["Profit factor", "1.82", "text-sky"], ["Max drawdown", "−8.4%", "text-bear"], ["Signals", "34", "text-gold"]].map(([label, value, color]) => <div key={label} className="tile !rounded-xl p-2.5"><div className={cn("num font-black text-lg", color)}>{value}</div><div className="text-[8px] uppercase text-mist font-bold">{label}</div></div>)}</div>
              <div className="rounded-xl p-3 bg-gold/10 border border-gold/25 text-[10px] text-fog leading-relaxed mb-3"><b className="text-gold">Learning note:</b> A positive backtest does not guarantee future results. Test across multiple regimes and account for fees.</div>
              <Btn variant="ghost" size="sm" icon="refresh" className="mt-auto" onClick={() => setTested(false)}>Reset result</Btn>
            </div>
          ) : (
            <div className="flex-1 grid place-items-center text-center py-8"><div><Icon name="chart" size={48} className="mx-auto text-ink-500 mb-3" /><div className="font-black">Ready to test</div><div className="text-xs text-mist mt-1 mb-4">{rules.length} conditions · {side} action</div><Btn variant="sky" size="sm" icon="play" onClick={() => setTested(true)}>Run backtest</Btn></div></div>
          )}
        </div>
      </div>
    </Asset>
  );
}

type JournalEntry = { id: number; asset: string; side: "Long" | "Short"; pnl: number; setup: string; mood: string; note: string };

function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: 1, asset: "BTC", side: "Long", pnl: 142, setup: "Breakout retest", mood: "Calm", note: "Waited for volume confirmation." },
    { id: 2, asset: "ETH", side: "Short", pnl: -48, setup: "Range rejection", mood: "FOMO", note: "Entered early. No close below range." },
    { id: 3, asset: "SOL", side: "Long", pnl: 86, setup: "Hammer support", mood: "Focused", note: "Clean 2.4R execution." },
  ]);
  const [filter, setFilter] = useState<"All" | "Wins" | "Losses">("All");
  const [open, setOpen] = useState<number | null>(1);
  const [form, setForm] = useState(false);
  const [note, setNote] = useState("");
  const visible = entries.filter((entry) => filter === "All" ? true : filter === "Wins" ? entry.pnl >= 0 : entry.pnl < 0);
  const add = () => {
    setEntries((items) => [{ id: Date.now(), asset: "BTC", side: "Long", pnl: 0, setup: "Manual review", mood: "Focused", note: note || "New reflection" }, ...items]);
    setNote("");
    setForm(false);
  };
  return (
    <Asset
      code="PRO-04"
      title="Trade Journal"
      desc="Reflection-first journal with setup, emotion and outcome. Filter performance and expand rows without losing context."
      tags={["journal", "reflection"]}
    >
      <div className="flex items-center gap-2 mb-3">
        {(["All", "Wins", "Losses"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={cn("h-8 px-3 rounded-full text-[9px] font-black border-2", filter === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}
        <button onClick={() => setForm(!form)} className="ml-auto w-8 h-8 rounded-xl bg-sky text-white grid place-items-center shadow-[0_3px_0_#1a56a8] active:translate-y-1 active:shadow-none"><Icon name={form ? "x" : "plus"} size={15} stroke={3} /></button>
      </div>
      {form && <div className="tile p-3 mb-3 anim-rise"><Label>New reflection</Label><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What happened, and what will you repeat or change?" className="well w-full min-h-20 p-3 text-xs outline-none resize-none placeholder:text-mist/40" /><Btn variant="bull" size="sm" block className="mt-2" onClick={add}>Save entry</Btn></div>}
      <div className="space-y-2">
        {visible.map((entry) => (
          <div key={entry.id} className={cn("game-surface rounded-xl overflow-hidden transition-all", open === entry.id && "!border-sky/35")}>
            <button onClick={() => setOpen(open === entry.id ? null : entry.id)} className="w-full p-3 flex items-center gap-2.5 text-left">
              <Coin sym={entry.asset} size={30} />
              <div className="flex-1 min-w-0"><div className="text-xs font-black">{entry.asset} · {entry.side}</div><div className="text-[8px] text-mist truncate">{entry.setup}</div></div>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-fog">{entry.mood}</span>
              <span className={cn("num text-xs font-black", entry.pnl >= 0 ? "text-bull" : "text-bear")}>{entry.pnl >= 0 ? "+" : "−"}${Math.abs(entry.pnl)}</span>
              <Icon name="chevD" size={15} className={cn("text-mist transition-transform", open === entry.id && "rotate-180")} />
            </button>
            <div className="grid transition-all duration-300" style={{ gridTemplateRows: open === entry.id ? "1fr" : "0fr" }}><div className="overflow-hidden"><div className="px-3 pb-3 text-[10px] text-fog/75 leading-relaxed border-t border-white/[.06] pt-2"><b className="text-sky">Review:</b> {entry.note}</div></div></div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function PnlCalendar() {
  const [month, setMonth] = useState(0);
  const [selected, setSelected] = useState<number | null>(12);
  const values = useMemo(() => Array.from({ length: 35 }, (_, index) => index > 29 ? 0 : Math.round((Math.sin(index * 1.9 + month) + (Math.random() - .48) * 1.5) * 90)), [month]);
  const total = values.reduce((sum, value) => sum + value, 0);
  const wins = values.filter((value) => value > 0).length;
  const months = ["April", "May", "June", "July"];
  return (
    <Asset
      code="PRO-05"
      title="PnL Calendar"
      desc="Calendar reveals consistency better than one total. Tap a day for its result and browse simulated months."
      tags={["calendar", "performance"]}
    >
      <div className="flex items-center justify-between mb-3"><button onClick={() => setMonth((month + months.length - 1) % months.length)} className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center"><Icon name="chevL" size={15} /></button><div className="text-center"><div className="font-black">{months[month]} 2026</div><div className={cn("num text-[10px] font-black", total >= 0 ? "text-bull" : "text-bear")}>{total >= 0 ? "+" : "−"}${Math.abs(total)} · {wins} green days</div></div><button onClick={() => setMonth((month + 1) % months.length)} className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center"><Icon name="chevR" size={15} /></button></div>
      <div className="grid grid-cols-7 gap-1.5 mb-2">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <div key={`${day}${index}`} className="text-center text-[8px] font-black text-mist">{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1.5">
        {values.map((value, index) => {
          const active = selected === index;
          const zero = index > 29;
          const intensity = Math.min(.38, Math.abs(value) / 280 + .08);
          return <button key={index} disabled={zero} onClick={() => setSelected(index)} className={cn("aspect-square rounded-lg relative flex flex-col items-center justify-center transition-all border", zero ? "opacity-0" : value >= 0 ? "text-bull border-bull/15" : "text-bear border-bear/15", active && "ring-2 ring-white scale-110 z-10")} style={!zero ? { background: value >= 0 ? `rgba(34,211,138,${intensity})` : `rgba(255,75,110,${intensity})` } : undefined}><span className="num text-[8px] font-black">{index + 1}</span>{active && <span className="absolute bottom-full mb-2 glass rounded-lg px-2 py-1 text-[9px] font-black whitespace-nowrap anim-pop">{value >= 0 ? "+" : "−"}${Math.abs(value)}</span>}</button>;
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">{[["Profit factor", "1.74", "text-sky"], ["Avg win", "+$84", "text-bull"], ["Avg loss", "−$42", "text-bear"]].map(([label, value, color]) => <div key={label} className="tile !rounded-xl p-2 text-center"><div className={cn("num text-sm font-black", color)}>{value}</div><div className="text-[7px] uppercase text-mist font-bold">{label}</div></div>)}</div>
    </Asset>
  );
}

function MarketReplay() {
  const [time, setTime] = useState(28);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  useInterval(() => setTime((value) => value >= 100 ? 0 : value + speed), playing ? 120 : null);
  const candles = useMemo(() => {
    let price = 50;
    return Array.from({ length: 45 }, (_, index) => {
      const open = price;
      const close = Math.max(8, Math.min(90, open + Math.sin(index / 3) * 5 + (Math.random() - .48) * 13));
      price = close;
      return { open, close, high: Math.min(95, Math.max(open, close) + 3), low: Math.max(5, Math.min(open, close) - 3) };
    });
  }, []);
  const count = Math.max(3, Math.floor((time / 100) * candles.length));
  return (
    <Asset
      code="PRO-06"
      title="Market Replay"
      desc="Scrub through historical candles, change playback speed and pause at decision points for deliberate practice."
      tags={["timeline", "playback"]}
      span={2}
    >
      <div className="well p-3 relative overflow-hidden mb-4">
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Coin sym="BTC" size={28} /><div><div className="text-[9px] font-black">BTC/USDT · 15m</div><div className="text-[8px] text-mist">Historical replay · Jan 11</div></div></div><span className="text-[8px] font-black text-gold px-2 py-1 rounded-lg bg-gold/10 border border-gold/20">REPLAY</span></div>
        <svg viewBox="0 0 720 220" className="w-full h-56" preserveAspectRatio="none">
          {[40, 85, 130, 175].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
          {candles.slice(0, count).map((candle, index) => {
            const x = 12 + index * 15.5;
            const y = (value: number) => 205 - value * 2;
            const up = candle.close >= candle.open;
            const color = up ? "#22d38a" : "#ff4b6e";
            return <g key={index} style={index === count - 1 ? { animation: "pop .22s both", transformOrigin: `${x}px ${y(candle.low)}px` } : undefined}><line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="1.5" /><rect x={x - 4.5} y={y(Math.max(candle.open, candle.close))} width="9" height={Math.max(2, Math.abs(y(candle.open) - y(candle.close)))} rx="1.5" fill={color} /></g>;
          })}
          <rect x={count * 15.5 + 8} y="0" width={720 - count * 15.5} height="220" fill="#070e22" opacity=".78" />
          <line x1={count * 15.5 + 8} x2={count * 15.5 + 8} y1="0" y2="220" stroke="#ffc53d" strokeWidth="2" strokeDasharray="5 4" />
        </svg>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setPlaying(!playing)} className="btn3d v-sky w-12 h-11 !p-0 !rounded-xl" style={{ ["--lip" as string]: "4px" }}><Icon name={playing ? "minus" : "play"} size={18} fill={playing ? "none" : "currentColor"} /></button>
        <input type="range" min={0} max={100} value={time} onChange={(event) => setTime(+event.target.value)} className="flex-1 accent-sky" />
        <span className="num text-[10px] text-mist w-9">{Math.floor(time / 4)}m</span>
        <div className="well p-1 flex gap-1">{[1, 2, 4].map((value) => <button key={value} onClick={() => setSpeed(value)} className={cn("num text-[9px] font-black px-2 py-1 rounded-lg", speed === value ? "bg-gold text-ink-900" : "text-mist")}>{value}×</button>)}</div>
      </div>
      <div className="flex flex-wrap gap-2">{[[18, "Breakout"], [47, "Retest"], [76, "Exit"]].map(([value, label]) => <button key={label} onClick={() => { setTime(value as number); setPlaying(false); }} className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-white/5 text-mist hover:text-gold border border-white/[.07]"><span className="text-gold">◆</span> {label}</button>)}</div>
    </Asset>
  );
}

export default function AdvancedTrading() {
  return (
    <Section
      id="pro-trading"
      index="12"
      title="Advanced Practice"
      subtitle="Professional trading concepts converted into understandable, safe and inspectable practice tools."
    >
      <RiskRewardPlanner />
      <DepthChart />
      <StrategyBuilder />
      <TradeJournal />
      <PnlCalendar />
      <MarketReplay />
    </Section>
  );
}