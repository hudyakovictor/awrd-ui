import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Asset, Btn, Coin, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

function SwipeActions() {
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [watch, setWatch] = useState(["BTC"]);
  const start = useRef<{ x: number; symbol: string; base: number } | null>(null);
  const assets = [
    { symbol: "BTC", name: "Bitcoin", price: "$67,421", change: "+2.41%" },
    { symbol: "ETH", name: "Ethereum", price: "$3,512", change: "−1.12%" },
    { symbol: "SOL", name: "Solana", price: "$172.35", change: "+6.82%" },
    { symbol: "TON", name: "Toncoin", price: "$7.12", change: "−3.40%" },
  ];
  const begin = (symbol: string, x: number) => {
    start.current = { x, symbol, base: offsets[symbol] ?? 0 };
  };
  const move = (x: number) => {
    if (!start.current) return;
    const delta = x - start.current.x;
    setOffsets((value) => ({ ...value, [start.current!.symbol]: Math.max(-88, Math.min(88, start.current!.base + delta)) }));
  };
  const end = () => {
    if (!start.current) return;
    const symbol = start.current.symbol;
    const value = offsets[symbol] ?? 0;
    setOffsets((items) => ({ ...items, [symbol]: Math.abs(value) > 42 ? Math.sign(value) * 76 : 0 }));
    start.current = null;
  };
  return (
    <Asset
      code="MOB-01"
      title="Swipe Row Actions"
      desc="Pointer-driven swipe rows reveal contextual favorite or hide actions. Threshold snaps prevent accidental activation."
      tags={["swipe", "pointer"]}
    >
      <div className="space-y-2 touch-pan-y select-none">
        {assets.map((asset) => {
          const offset = offsets[asset.symbol] ?? 0;
          const starred = watch.includes(asset.symbol);
          return (
            <div key={asset.symbol} className="relative h-16 rounded-2xl overflow-hidden bg-ink-900">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gold to-[#f5b01c] text-[#3a2500] flex items-center justify-center gap-1 text-[9px] font-black"><Icon name="star" size={17} fill="currentColor" />FAVORITE</div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bear to-[#e8325a] text-white flex items-center justify-center gap-1 text-[9px] font-black">HIDE<Icon name="eyeOff" size={17} /></div>
              <div
                onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); begin(asset.symbol, event.clientX); }}
                onPointerMove={(event) => move(event.clientX)}
                onPointerUp={() => {
                  const value = offsets[asset.symbol] ?? 0;
                  if (value > 55 && !starred) setWatch((items) => [...items, asset.symbol]);
                  end();
                }}
                onPointerCancel={end}
                className="absolute inset-0 game-surface !rounded-2xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                style={{ transform: `translateX(${offset}px)`, transition: start.current?.symbol === asset.symbol ? "none" : "transform .3s cubic-bezier(.2,.9,.3,1.1)" }}
              >
                <Coin sym={asset.symbol} size={34} />
                <div className="flex-1"><div className="text-xs font-black flex items-center gap-1.5">{asset.symbol}{starred && <Icon name="star" size={11} fill="currentColor" className="text-gold" />}</div><div className="text-[8px] text-mist">{asset.name}</div></div>
                <div className="text-right"><div className="num text-xs font-black">{asset.price}</div><div className={cn("num text-[9px] font-black", asset.change.startsWith("+") ? "text-bull" : "text-bear")}>{asset.change}</div></div>
                <Icon name="more" size={16} className="text-mist" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-mist"><Icon name="chevL" size={13} className="anim-nudge" />Swipe right to favorite · left to hide<Icon name="chevR" size={13} /></div>
    </Asset>
  );
}

function PullRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(0);
  const start = useRef(0);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setPull(0);
      setUpdated((value) => value + 1);
    }, 1100);
  };
  return (
    <Asset
      code="MOB-02"
      title="Pull to Refresh"
      desc="Elastic pull distance, release threshold, spinner transition and content update feedback in a bounded mobile viewport."
      tags={["pull", "elastic"]}
    >
      <div
        className="well overflow-hidden h-[340px] relative touch-pan-x select-none"
        onPointerDown={(event) => { start.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => { if (!start.current || refreshing) return; const distance = Math.max(0, event.clientY - start.current); setPull(Math.min(90, distance * .55)); }}
        onPointerUp={() => { start.current = 0; if (pull >= 58) refresh(); else setPull(0); }}
        onPointerCancel={() => { start.current = 0; setPull(0); }}
      >
        <div className="absolute left-0 right-0 top-0 h-20 grid place-items-center">
          <div className="flex items-center gap-2 text-[9px] font-black text-sky" style={{ opacity: Math.min(1, pull / 35), transform: `translateY(${Math.max(-20, pull - 60)}px)` }}>
            <span className={cn("w-7 h-7 rounded-full border-[3px] border-sky/25 border-t-sky grid place-items-center", refreshing && "anim-spin")} style={{ transform: refreshing ? undefined : `rotate(${pull * 4}deg)` }} />
            {refreshing ? "UPDATING MARKET" : pull >= 58 ? "RELEASE TO UPDATE" : "PULL TO UPDATE"}
          </div>
        </div>
        <div className="absolute inset-0 p-3 bg-ink-850 transition-transform duration-300" style={{ transform: `translateY(${refreshing ? 58 : pull}px)`, transition: start.current ? "none" : "transform .35s cubic-bezier(.2,.9,.3,1.1)" }}>
          <div className="flex items-center justify-between mb-3"><div><div className="font-black text-sm">Market movers</div><div className="text-[8px] text-mist">Updated {updated ? "just now" : "2 min ago"}</div></div><span className="w-2 h-2 rounded-full bg-bull anim-live" /></div>
          <div className="space-y-2">
            {[
              ["SOL", 6.82 + updated * .12],
              ["DOGE", 4.21 - updated * .08],
              ["BTC", 2.41 + updated * .04],
              ["ETH", -1.12 + updated * .03],
            ].map(([symbol, change]) => <div key={symbol as string} className="tile !rounded-xl p-2.5 flex items-center gap-3"><Coin sym={symbol as string} size={30} /><span className="text-xs font-black flex-1">{symbol as string}</span><div className="w-20 h-6"><svg viewBox="0 0 80 24" className="w-full h-full"><path d="M0 18 C10 20 14 4 26 11 S43 17 52 7 S69 10 80 3" fill="none" stroke={(change as number) >= 0 ? "#22d38a" : "#ff4b6e"} strokeWidth="2" /></svg></div><span className={cn("num text-[10px] font-black w-12 text-right", (change as number) >= 0 ? "text-bull" : "text-bear")}>{(change as number) >= 0 ? "+" : ""}{(change as number).toFixed(2)}%</span></div>)}
          </div>
        </div>
      </div>
      <Btn variant="ghost" size="sm" block icon="refresh" className="mt-3" loading={refreshing} onClick={refresh}>Trigger with button</Btn>
    </Asset>
  );
}

function LongPressMenu() {
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const raf = useRef(0);
  const started = useRef(0);
  const begin = () => {
    if (open) return;
    started.current = performance.now();
    const tick = (time: number) => {
      const value = Math.min(1, (time - started.current) / 650);
      setProgress(value);
      if (value >= 1) {
        setOpen(true);
        navigator.vibrate?.(30);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    cancelAnimationFrame(raf.current);
    if (!open) setProgress(0);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const actions = [
    { label: "Alert", icon: "bell", x: -92, y: 0, color: "sky" },
    { label: "Trade", icon: "swap", x: -65, y: -70, color: "bull" },
    { label: "Chart", icon: "chart", x: 0, y: -94, color: "violet" },
    { label: "Share", icon: "send", x: 65, y: -70, color: "gold" },
    { label: "Hide", icon: "eyeOff", x: 92, y: 0, color: "bear" },
  ];
  return (
    <Asset
      code="MOB-03"
      title="Long-press Radial Menu"
      desc="650ms hold reveals five thumb-reachable actions with haptic cue. Releasing early safely cancels."
      tags={["long press", "haptic"]}
    >
      <div className="well dotgrid min-h-[330px] relative grid place-items-center overflow-hidden">
        {open && <button onClick={() => setOpen(false)} className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px] z-10" aria-label="Close menu" />}
        <div className="relative z-20">
          {open && actions.map((item, index) => (
            <button
              key={item.label}
              onClick={() => { setAction(item.label); setOpen(false); setProgress(0); }}
              className={cn("absolute left-1/2 top-1/2 w-14 h-14 -ml-7 -mt-7 rounded-2xl grid place-items-center shadow-lg border", {
                sky: "bg-sky text-white border-sky",
                bull: "bg-bull text-ink-900 border-bull",
                violet: "bg-violet text-white border-violet",
                gold: "bg-gold text-ink-900 border-gold",
                bear: "bg-bear text-white border-bear",
              }[item.color])}
              style={{ transform: `translate(${item.x}px, ${item.y}px)`, animation: `bounceIn .35s ${index * .04}s both` }}
            >
              <Icon name={item.icon} size={21} /><span className="absolute top-full mt-1 text-[8px] font-black text-fog">{item.label}</span>
            </button>
          ))}
          <button
            onPointerDown={begin}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onContextMenu={(event) => event.preventDefault()}
            className="relative w-28 h-28 rounded-full game-surface grid place-items-center select-none active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90"><circle cx="56" cy="56" r="51" fill="none" stroke="#1f3468" strokeWidth="4" /><circle cx="56" cy="56" r="51" fill="none" stroke="#3da5ff" strokeWidth="4" strokeLinecap="round" strokeDasharray={320} strokeDashoffset={320 * (1 - progress)} /></svg>
            <div className="text-center"><Coin sym="BTC" size={45} /><div className="text-[8px] text-mist mt-2">Hold for actions</div></div>
          </button>
        </div>
        {action && <div key={action} className="absolute bottom-4 rounded-xl px-3 py-2 bg-bull/15 text-bull text-[10px] font-black anim-pop"><Icon name="check" size={13} className="inline mr-1" />{action} selected</div>}
      </div>
    </Asset>
  );
}

function NumericKeypad() {
  const [value, setValue] = useState("0");
  const [mode, setMode] = useState<"amount" | "price">("amount");
  const input = (key: string) => {
    if (key === "back") return setValue((current) => current.length <= 1 ? "0" : current.slice(0, -1));
    if (key === "." && value.includes(".")) return;
    if (value.replace(".", "").length >= 8) return;
    setValue((current) => current === "0" && key !== "." ? key : current + key);
  };
  const amount = Number(value) || 0;
  return (
    <Asset
      code="MOB-04"
      title="Trading Keypad"
      desc="Large thumb targets, decimal guard, maximum length and an immediate order-equivalent preview."
      tags={["keypad", "thumb"]}
    >
      <div className="well p-3 mb-3">
        <div className="flex items-center justify-between mb-2"><div className="well p-1 flex gap-1">{(["amount", "price"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase", mode === item ? "bg-sky text-white" : "text-mist")}>{item}</button>)}</div><span className="text-[9px] text-mist">Balance <b className="num text-fog">2,500 USDT</b></span></div>
        <div className="text-center py-4"><div className="flex items-baseline justify-center gap-2"><span className="num text-4xl font-black">{value}</span><span className="text-sm font-black text-mist">{mode === "amount" ? "USDT" : "USD"}</span></div><div className="num text-[10px] text-sky mt-1">≈ {mode === "amount" ? (amount / 67421).toFixed(6) + " BTC" : "trigger price"}</div></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) => <button key={key} onClick={() => input(key)} className="h-12 rounded-2xl bg-gradient-to-b from-[#263a6a] to-[#1c2b52] shadow-[0_4px_0_#0b1430,inset_0_1px_0_rgba(255,255,255,.12)] text-lg font-black active:translate-y-1 active:shadow-none transition-all">{key === "back" ? <Icon name="chevL" size={19} className="mx-auto" /> : key}</button>)}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">{[25, 50, 75, 100].map((percent) => <button key={percent} onClick={() => setValue(String(2500 * percent / 100))} className="h-8 rounded-xl border-2 border-ink-600 text-[9px] font-black text-mist active:translate-y-0.5">{percent === 100 ? "MAX" : `${percent}%`}</button>)}</div>
      <Btn variant="bull" block disabled={amount <= 0}>Continue</Btn>
    </Asset>
  );
}

function ContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const open = (event: MouseEvent) => {
    event.preventDefault();
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setMenu({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };
  return (
    <Asset
      code="MOB-05"
      title="Context Menu"
      desc="Right-click or tap the explicit menu button. Position clamps inside its surface; dangerous actions are separated."
      tags={["context", "desktop"]}
    >
      <div ref={box} onContextMenu={open} onClick={() => menu && setMenu(null)} className="well dotgrid min-h-[300px] relative overflow-hidden p-4">
        <div className="game-surface rounded-2xl p-4 flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <Coin sym="ETH" size={42} />
          <div className="flex-1"><div className="font-black">Ethereum</div><div className="text-[10px] text-mist">ETH/USDT · $3,512.40</div></div>
          <button onClick={(event) => { const rect = box.current?.getBoundingClientRect(); if (rect) setMenu({ x: event.clientX - rect.left - 130, y: event.clientY - rect.top + 10 }); }} className="w-9 h-9 rounded-xl bg-white/5 text-mist grid place-items-center"><Icon name="more" size={18} /></button>
        </div>
        <div className="text-center text-[10px] text-mist mt-16">Right-click anywhere in this surface</div>
        {selected && <div key={selected} className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl p-2 bg-bull/15 text-bull text-[9px] font-black anim-pop">{selected} selected</div>}
        {menu && (
          <div className="absolute z-20 panel !rounded-2xl p-1.5 w-48 anim-pop" style={{ left: Math.max(8, Math.min(menu.x, (box.current?.clientWidth ?? 220) - 200)), top: Math.max(8, Math.min(menu.y, (box.current?.clientHeight ?? 300) - 225)) }} onClick={(event) => event.stopPropagation()}>
            {[
              ["Open chart", "chart"],
              ["Create alert", "bell"],
              ["Add to watchlist", "star"],
              ["Copy symbol", "copy"],
            ].map(([label, icon]) => <button key={label} onClick={() => { setSelected(label); setMenu(null); }} className="w-full p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-left hover:bg-white/5"><Icon name={icon} size={15} className="text-mist" />{label}</button>)}
            <div className="hairline my-1" />
            <button onClick={() => { setSelected("Hidden"); setMenu(null); }} className="w-full p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-bear text-left hover:bg-bear/10"><Icon name="eyeOff" size={15} />Hide asset</button>
          </div>
        )}
      </div>
    </Asset>
  );
}

function ShareSheet() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const share = (label: string) => {
    if (label === "Copy link") {
      navigator.clipboard?.writeText("https://bullrun.game/lesson/candles").catch(() => {});
      setCopied(true);
    }
    setTimeout(() => setOpen(false), 550);
  };
  return (
    <Asset
      code="MOB-06"
      title="Native-style Share Sheet"
      desc="Bottom sheet with preview, recipients, actions, note and visible close affordances. Fully stateful without OS APIs."
      tags={["sheet", "share"]}
    >
      <div className="well min-h-[340px] relative overflow-hidden p-4">
        <div className="holo-card rounded-2xl p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-bull/15 text-bull grid place-items-center"><Icon name="candles" size={23} /></div><div className="flex-1"><div className="text-[9px] uppercase font-black tracking-widest text-violet">Lesson result</div><div className="font-black">Candlestick Patterns · 92%</div><div className="text-[9px] text-mist">bullrun.game/lesson/candles</div></div></div></div>
        {copied && <div className="mt-3 rounded-xl bg-bull/10 text-bull p-2 text-[10px] font-black flex items-center gap-2 anim-pop"><Icon name="check" size={14} />Link copied</div>}
        <Btn variant="sky" block icon="send" className="mt-5" onClick={() => setOpen(true)}>Share lesson</Btn>
        <div className={cn("absolute inset-0 bg-ink-950/60 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setOpen(false)} />
        <div className="absolute inset-x-0 bottom-0 panel !rounded-b-none !rounded-t-[26px] p-4 pt-2 transition-transform duration-500 ease-[cubic-bezier(.2,1.2,.4,1)]" style={{ transform: open ? "translateY(0)" : "translateY(110%)" }}>
          <div className="w-10 h-1.5 rounded-full bg-ink-500 mx-auto mb-3" />
          <div className="flex items-center justify-between mb-3"><div className="font-black text-sm">Share result</div><button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/5 text-mist grid place-items-center"><Icon name="x" size={14} /></button></div>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {["Mia", "Max", "Dana", "Club"].map((name, index) => <button key={name} onClick={() => share(name)} className="flex flex-col items-center gap-1.5 shrink-0"><div className={cn("w-12 h-12 rounded-full grid place-items-center font-black text-xs border-2 border-ink-850", index === 3 ? "bg-violet" : "bg-gradient-to-br from-sky to-violet")}>{name.slice(0, 2).toUpperCase()}</div><span className="text-[8px] font-bold text-mist">{name}</span></button>)}
          </div>
          <div className="hairline mb-3" />
          <div className="grid grid-cols-4 gap-2 mb-3">{[["Copy link", "copy", "sky"], ["Club", "users", "violet"], ["Message", "send", "bull"], ["More", "more", "ghost"]].map(([label, icon, color]) => <button key={label} onClick={() => share(label)} className="flex flex-col items-center gap-1"><span className={cn("w-10 h-10 rounded-xl grid place-items-center", color === "sky" ? "bg-sky/15 text-sky" : color === "violet" ? "bg-violet/15 text-violet" : color === "bull" ? "bg-bull/15 text-bull" : "bg-white/5 text-mist")}><Icon name={icon} size={18} /></span><span className="text-[7px] font-bold text-mist">{label}</span></button>)}</div>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note…" className="well w-full h-9 px-3 text-[10px] outline-none placeholder:text-mist/40" />
        </div>
      </div>
    </Asset>
  );
}

function HapticLab() {
  const [last, setLast] = useState("None");
  const [pulse, setPulse] = useState(0);
  const patterns = [
    { label: "Selection", pattern: [12], icon: "check", color: "sky" },
    { label: "Success", pattern: [18, 45, 28], icon: "trophy", color: "bull" },
    { label: "Warning", pattern: [35, 35, 35], icon: "alert", color: "gold" },
    { label: "Error", pattern: [45, 30, 45, 30, 45], icon: "x", color: "bear" },
  ];
  const play = (label: string, pattern: number[]) => {
    navigator.vibrate?.(pattern);
    setLast(label);
    setPulse((value) => value + 1);
  };
  return (
    <Asset
      code="MOB-07"
      title="Haptic Language"
      desc="Four semantic vibration signatures mapped to visual feedback. Safely degrades where Vibration API is unavailable."
      tags={["haptics", "semantics"]}
    >
      <div className="relative well dotgrid p-5 grid place-items-center min-h-40 mb-4 overflow-hidden">
        <div key={pulse} className="relative w-20 h-20 rounded-full bg-sky/15 grid place-items-center">
          {pulse > 0 && [0, 1, 2].map((index) => <span key={index} className="absolute inset-0 rounded-full border-2 border-sky" style={{ animation: `radar 1.2s ${index * .18}s ease-out forwards` }} />)}
          <Icon name="bolt" size={34} className="text-sky" fill="currentColor" />
        </div>
        <div className="absolute bottom-3 text-[9px] font-black text-mist">Last signal: <span className="text-fog">{last}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {patterns.map((item) => <button key={item.label} onClick={() => play(item.label, item.pattern)} className={cn("btn3d h-12 text-[9px]", `v-${item.color}`)} style={{ ["--lip" as string]: "4px" }}><Icon name={item.icon} size={16} />{item.label}</button>)}
      </div>
    </Asset>
  );
}

export default function MobilePatterns() {
  return (
    <Section
      id="mobile-patterns"
      index="14"
      title="Mobile Interaction"
      subtitle="Touch-native behaviors with clear thresholds, cancellation, haptic cues and desktop fallbacks."
    >
      <SwipeActions />
      <PullRefresh />
      <LongPressMenu />
      <NumericKeypad />
      <ContextMenu />
      <ShareSheet />
      <HapticLab />
    </Section>
  );
}