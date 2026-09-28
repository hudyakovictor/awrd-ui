import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Confetti, Label } from "../../components/ui";
import { CoinIcon, GemIcon, Icon, XPIcon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, useInterval } from "../../lib/motion";
import { ComboMeter, Countdown, GlowRing, TickNumber, combatText, scorePop } from "../../lib/fx2";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-25 · SUPPORT / RESISTANCE DRAWER — draw 2 zones, get scored
 * ===================================================================== */
function genLevels(seed: number) {
  const r = mulberry32(seed);
  const sup = 88 + r() * 8;
  const res = 108 + r() * 8;
  const pts: number[] = [];
  let p = 100;
  for (let i = 0; i < 80; i++) {
    p += (r() - 0.5) * 3;
    if (p < sup) p = sup + r() * 1.5;
    if (p > res) p = res - r() * 1.5;
    if (i > 55) p += 0.35;
    pts.push(p);
  }
  return { pts, sup, res };
}
function LevelDrawer() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const { pts, sup, res } = useMemo(() => genLevels(round * 131 + 7), [round]);
  const [lines, setLines] = useState<{ s: number; r: number }>({ s: 84, r: 116 });
  const [drag, setDrag] = useState<"s" | "r" | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [fire, setFire] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const W = 420;
  const H = 220;
  const min = 78;
  const max = 122;
  const y = (v: number) => ((max - v) / (max - min)) * H;
  const path = pts.map((v, i) => `${i ? "L" : "M"}${(i / 79) * W},${y(v)}`).join("");
  const toVal = (cy: number) => {
    const rc = svgRef.current!.getBoundingClientRect();
    return max - ((cy - rc.top) / rc.height) * (max - min);
  };
  const grade = () => {
    const ds = Math.abs(lines.s - sup);
    const dr = Math.abs(lines.r - res);
    const sc = Math.max(0, Math.round(100 - (ds + dr) * 14));
    setScore(sc);
    if (sc >= 70) {
      setFire((f) => f + 1);
      sfx("success");
      g.reward("xp", Math.round(sc / 5), footRef.current);
    } else sfx("error");
  };
  const reset = () => {
    setRound((r) => r + 1);
    setScore(null);
    setLines({ s: 84, r: 116 });
  };
  const handle = (k: "s" | "r", v: number, col: string, label: string) => (
    <g
      className="cursor-ns-resize"
      onPointerDown={(e) => {
        if (score !== null) return;
        setDrag(k);
        svgRef.current?.setPointerCapture(e.pointerId);
        sfx("select");
      }}
    >
      <rect x="0" y={y(v) - 14} width={W} height="28" fill="transparent" />
      <line x1="0" x2={W} y1={y(v)} y2={y(v)} stroke={col} strokeWidth="2.5" strokeDasharray={score !== null ? "none" : "7 5"} />
      <rect x={W - 66} y={y(v) - 12} width="62" height="24" rx="8" fill={col} />
      <text x={W - 35} y={y(v) + 4.5} textAnchor="middle" fontSize="11" fontWeight="900" fill={k === "s" ? "#03281b" : "#fff"}>
        {label}
      </text>
    </g>
  );
  return (
    <Asset title="Support / Resistance Drawer" code="G-25" tags="support resistance draw lines chart levels score zones" span={6} badge="Skill">
      <Confetti fire={fire} />
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Drag the zones onto the true S/R</div>
        <Chip tone="violet">Round {round}</Chip>
      </div>
      <div className="panel-inset overflow-hidden rounded-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full touch-none select-none"
          onPointerMove={(e) => {
            if (!drag || score !== null) return;
            const v = clamp(toVal(e.clientY), min + 1, max - 1);
            setLines((l) => (drag === "s" ? { ...l, s: v } : { ...l, r: v }));
            sfx("tick");
          }}
          onPointerUp={() => setDrag(null)}
        >
          <path d={path} stroke="#5ea0ff" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
          {score !== null && (
            <>
              <rect x="0" y={y(res + 1.2)} width={W} height={y(res - 1.2) - y(res + 1.2)} fill="#ff4d6d" opacity=".22" className="anim-pop" />
              <rect x="0" y={y(sup + 1.2)} width={W} height={y(sup - 1.2) - y(sup + 1.2)} fill="#22d39a" opacity=".22" className="anim-pop" />
              <line x1="0" x2={W} y1={y(res)} y2={y(res)} stroke="#ff4d6d" strokeWidth="2" />
              <line x1="0" x2={W} y1={y(sup)} y2={y(sup)} stroke="#22d39a" strokeWidth="2" />
            </>
          )}
          {handle("s", lines.s, "#22d39a", "SUP")}
          {handle("r", lines.r, "#ff4d6d", "RES")}
        </svg>
      </div>
      <div ref={footRef} className="mt-3 flex items-center gap-3">
        {score === null ? (
          <>
            <span className="text-[11px] font-bold text-ink-400">Price bounced between hidden levels</span>
            <Btn variant="bull" size="sm" className="ml-auto" onClick={grade} sound={false}>
              Grade me
            </Btn>
          </>
        ) : (
          <>
            <GlowRing pct={score / 100} size={64} stroke={8} colors={score >= 70 ? ["#22d39a", "#2fd4ff"] : ["#ff4d6d", "#ff7a2f"]}>
              <span className="font-display text-sm font-black text-white">{score}</span>
            </GlowRing>
            <div className="text-xs font-bold text-ink-300">
              {score >= 85 ? "Chart artist! You nailed both zones." : score >= 70 ? "Solid read — zones accepted." : "Off the mark. Watch where price turns, not spikes."}
            </div>
            <Btn variant="azure" size="sm" className="ml-auto" onClick={reset}>
              Next
            </Btn>
          </>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-26 · ORDER FLOW LADDER — tap the imbalance side, streak scoring
 * ===================================================================== */
type Row = { b: number; a: number };
function genLadder(seed: number): { rows: Row[]; answer: "bid" | "ask"; str: number } {
  const r = mulberry32(seed);
  const side = r() > 0.5 ? "bid" : "ask";
  const str = 1.6 + r() * 2.2;
  const rows = Array.from({ length: 9 }, () => {
    const base = 20 + r() * 80;
    const imb = r() < 0.55;
    return side === "bid"
      ? { b: imb ? base * str : base, a: base }
      : { b: base, a: imb ? base * str : base };
  });
  return { rows, answer: side, str };
}
function OrderFlow() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [pts, setPts] = useState(0);
  const [flash, setFlash] = useState<"bid" | "ask" | null>(null);
  const [lock, setLock] = useState(false);
  const [time, setTime] = useState(8);
  const cardRef = useRef<HTMLDivElement>(null);
  const L = useMemo(() => genLadder(round * 77 + 13), [round]);
  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), lock ? null : 100);
  useEffect(() => {
    if (time <= 0 && !lock) pick(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  const pick = (side: "bid" | "ask" | null) => {
    if (lock) return;
    setLock(true);
    const ok = side === L.answer;
    setFlash(L.answer);
    if (ok) {
      const p = 10 + streak * 4 + Math.round(time);
      setPts((x) => x + p);
      setStreak((s) => s + 1);
      sfx(streak + 1 >= 3 ? "combo" : "success");
      scorePop(cardRef.current, `+${p}`, "#22d39a");
      g.reward("xp", p, cardRef.current);
    } else {
      setStreak(0);
      sfx("error");
    }
    setTimeout(() => {
      setRound((r) => r + 1);
      setFlash(null);
      setLock(false);
      setTime(8);
    }, 1100);
  };
  const maxV = Math.max(...L.rows.map((r) => Math.max(r.b, r.a)));
  return (
    <Asset title="Order Flow Ladder" code="G-26" tags="order flow footprint bid ask imbalance ladder dom tape reading" span={6}>
      <div className="mb-3 flex items-center gap-3">
        <div>
          <div className="font-display text-sm font-black text-white">Which side is stacked?</div>
          <div className="text-[11px] font-bold text-ink-400">Tap BID or ASK before time runs out</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ComboMeter combo={streak} />
          <Chip tone="gold">
            <TickNumber value={pts} />
          </Chip>
        </div>
      </div>
      <div ref={cardRef} className="panel-inset relative overflow-hidden rounded-2xl p-3">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-ink-950">
          <div className={cn("h-full rounded-full transition-all", time < 3 ? "bg-bear" : "bg-cyan")} style={{ width: `${(time / 8) * 100}%` }} />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink-500">
          <span className="text-right">Bid ×</span>
          <span>Price</span>
          <span>× Ask</span>
        </div>
        <div className="mt-1 space-y-1">
          {L.rows.map((r, i) => (
            <div key={`${round}-${i}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" style={{ animation: `slide-in-right .3s ${i * 30}ms both` }}>
              <div className="flex h-6 items-center justify-end overflow-hidden rounded-lg bg-ink-950">
                <div
                  className={cn("flex h-full items-center justify-end rounded-lg pr-2 font-mono text-[10px] font-bold text-white transition-all duration-500", flash === "bid" && r.b === Math.max(...L.rows.map((x) => x.b)) ? "bg-bull shadow-[0_0_12px_#22d39a]" : "bg-bull/60")}
                  style={{ width: `${(r.b / maxV) * 100}%` }}
                >
                  {Math.round(r.b)}
                </div>
              </div>
              <span className="font-mono text-[10px] text-ink-400">{(64250 - i * 2.5).toFixed(1)}</span>
              <div className="flex h-6 items-center overflow-hidden rounded-lg bg-ink-950">
                <div
                  className={cn("flex h-full items-center rounded-lg pl-2 font-mono text-[10px] font-bold text-white transition-all duration-500", flash === "ask" && r.a === Math.max(...L.rows.map((x) => x.a)) ? "bg-bear shadow-[0_0_12px_#ff4d6d]" : "bg-bear/60")}
                  style={{ width: `${(r.a / maxV) * 100}%` }}
                >
                  {Math.round(r.a)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {flash && (
          <div className={cn("anim-pop absolute inset-x-6 top-1/3 rounded-2xl p-3 text-center font-display text-lg font-black", flash === "bid" ? "bg-bull text-ink-950" : "bg-bear text-white")}>
            {L.answer === "bid" ? "BIDS STACKED →" : "← ASKS STACKED"}
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Btn variant="bull" disabled={lock} onClick={() => pick("bid")} sound={false}>
          Bid heavy
        </Btn>
        <Btn variant="bear" disabled={lock} onClick={() => pick("ask")} sound={false}>
          Ask heavy
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-27 · LEVERAGE LADDER — climb steps, cash out or risk it
 * ===================================================================== */
const LADDER = [
  { m: 1.2, bust: 0.02 },
  { m: 1.5, bust: 0.08 },
  { m: 2, bust: 0.14 },
  { m: 3, bust: 0.22 },
  { m: 5, bust: 0.32 },
  { m: 8, bust: 0.42 },
  { m: 15, bust: 0.52 },
];
function LevLadder() {
  const g = useGame();
  const [stake, setStake] = useState(50);
  const [step, setStep] = useState(-1);
  const [live, setLive] = useState(false);
  const [bust, setBust] = useState(false);
  const [cashed, setCashed] = useState<number | null>(null);
  const [anim, setAnim] = useState(0);
  const val = step >= 0 ? Math.round(stake * LADDER[step].m) : 0;
  const start = (el: HTMLElement) => {
    if (!g.spend("coins", stake, el)) return;
    setStep(-1);
    setLive(true);
    setBust(false);
    setCashed(null);
    setTimeout(() => climb(), 350);
  };
  const climb = () => {
    const ns = step + 1 >= LADDER.length ? step : step + 1;
    setAnim(ns);
    sfx("charge", 1 + ns * 0.15);
    setTimeout(() => {
      const busts = Math.random() < LADDER[ns].bust;
      if (busts) {
        setBust(true);
        setLive(false);
        sfx("lose");
      } else {
        setStep(ns);
        sfx("pop", 1 + ns * 0.12);
        if (ns === LADDER.length - 1) {
          const win = Math.round(stake * LADDER[ns].m);
          setCashed(win);
          setLive(false);
          g.reward("coins", win, document.querySelector('[data-ladder-top]'));
          sfx("levelup");
        }
      }
    }, 650);
  };
  const cash = (el: HTMLElement) => {
    if (!live || step < 0) return;
    setCashed(val);
    setLive(false);
    g.reward("coins", val, el);
    sfx("success");
  };
  return (
    <Asset title="Leverage Ladder" code="G-27" tags="leverage ladder climb cash out risk bust multiplier gamble" span={4}>
      <div className="mb-3 flex items-center gap-2">
        <Label className="mb-0">Stake</Label>
        {[25, 50, 100].map((s) => (
          <button key={s} disabled={live} onClick={() => setStake(s)} className={cn("flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black transition", stake === s ? "bg-gold text-ink-950 shadow-[0_3px_0_#c2850a]" : "bg-ink-800 text-ink-300")}>
            <CoinIcon size={13} /> {s}
          </button>
        ))}
        <span data-ladder-top className="ml-auto font-mono text-sm font-bold text-gold">
          {live || cashed ? `$${val}` : "—"}
        </span>
      </div>
      <div className="flex flex-col-reverse gap-1.5">
        {LADDER.map((L, i) => {
          const cur = i === step;
          const past = i < step;
          const active = live && i === anim && i > step;
          return (
            <div
              key={i}
              className={cn(
                "relative flex h-11 items-center justify-between overflow-hidden rounded-xl px-3 transition-all duration-400",
                cur ? "bg-gradient-to-r from-bull to-cyan text-ink-950 shadow-[0_0_18px_rgba(34,211,154,.5)]" : past ? "bg-bull/15 text-bull" : bust && i === step + 1 ? "bg-bear text-white anim-shake" : "bg-ink-850 text-ink-400",
                active && "anim-pulse-ring",
              )}
            >
              {active && <div className="absolute inset-0 bg-white/30" style={{ animation: "shimmer 1s linear infinite", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)", backgroundSize: "200% 100%" }} />}
              <span className="font-display text-sm font-black">
                ×{L.m} <span className="text-[10px] opacity-70">${Math.round(stake * L.m)}</span>
              </span>
              <span className="text-[10px] font-bold opacity-80">bust {Math.round(L.bust * 100)}%</span>
              {cur && <Icon name="check" size={16} stroke={3} />}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {!live && cashed === null && !bust && (
          <Btn variant="gold" block className="col-span-2" onClick={(e) => start(e.currentTarget)} sound={false}>
            Start climb · {stake}
          </Btn>
        )}
        {live && (
          <>
            <Btn variant="bull" onClick={(e) => cash(e.currentTarget)}>
              Cash ${val}
            </Btn>
            <Btn variant="flame" onClick={climb}>
              Climb ×{LADDER[Math.min(step + 1, 6)].m}
            </Btn>
          </>
        )}
        {(bust || cashed !== null) && (
          <div className="anim-pop col-span-2 flex items-center justify-between rounded-2xl p-3" style={{ background: bust ? "rgba(255,77,109,.15)" : "rgba(34,211,154,.15)" }}>
            <span className={cn("font-display text-sm font-black", bust ? "text-bear" : "text-bull")}>{bust ? "BUSTED — stake lost" : `Cashed out +$${cashed}`}</span>
            <Btn variant="ghost" size="sm" onClick={() => { setStep(-1); setBust(false); setCashed(null); }}>
              Again
            </Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-28 · WHALE HUNT — spot the whale order in the tape
 * ===================================================================== */
type Trade = { p: number; s: number; side: 1 | -1; whale: boolean };
function genTape(seed: number): Trade[] {
  const r = mulberry32(seed);
  const wi = 6 + Math.floor(r() * 10);
  let p = 64250;
  return Array.from({ length: 18 }, (_, i) => {
    p += (r() - 0.5) * 14;
    const whale = i === wi;
    return { p, s: whale ? 25 + r() * 40 : 0.01 + r() * r() * 2, side: r() > 0.45 ? 1 : -1, whale };
  });
}
function WhaleHunt() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const tape = useMemo(() => genTape(round * 911 + 5), [round]);
  const [found, setFound] = useState<number | null>(null);
  const [miss, setMiss] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const scRef = useRef<HTMLDivElement>(null);
  const tap = (i: number, t: Trade, el: HTMLElement) => {
    if (found !== null) return;
    if (t.whale) {
      setFound(i);
      const pts = [50, 30, 15][Math.min(miss.length, 2)];
      setScore((s) => s + pts);
      sfx("success");
      fx.ring(el, "#9170ff");
      g.reward("xp", pts, el);
    } else {
      setMiss((m) => [...m, i]);
      sfx("error");
    }
  };
  const maxS = Math.max(...tape.map((t) => t.s));
  return (
    <Asset title="Whale Hunt · Tape Reading" code="G-28" tags="whale hunt tape time sales big order spot anomaly" span={4}>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Find the whale print 🐋</div>
        <Chip tone="violet">
          <TickNumber value={score} />
        </Chip>
      </div>
      <div ref={scRef} className="panel-inset max-h-[330px] overflow-y-auto rounded-2xl p-2">
        {tape.map((t, i) => {
          const isF = found === i;
          const isM = miss.includes(i);
          return (
            <button
              key={`${round}-${i}`}
              onClick={(e) => tap(i, t, e.currentTarget)}
              disabled={found !== null}
              className={cn(
                "relative mb-1 flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-1.5 font-mono text-xs transition-all",
                isF ? "bg-violet text-white shadow-[0_0_16px_#9170ff]" : isM ? "bg-bear/20 text-bear line-through" : "bg-ink-850 text-ink-100 hover:bg-ink-750",
              )}
              style={{ animation: `slide-in-right .25s ${i * 25}ms both` }}
            >
              <span className={cn("font-black", t.side > 0 ? "text-bull" : "text-bear")}>{t.side > 0 ? "▲" : "▼"}</span>
              <span className="flex-1 text-left">${t.p.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
              <span className={cn("font-bold", isF ? "text-white" : "text-ink-200")}>{t.s.toFixed(t.s > 3 ? 1 : 3)}</span>
              <span className="absolute bottom-0 left-0 h-[2px] bg-violet/50" style={{ width: `${(t.s / maxS) * 100}%` }} />
              {isF && <span className="anim-pop text-base">🐋</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-bold text-ink-400">{miss.length} misses · whale = 25× normal size</span>
        {found !== null && (
          <Btn variant="azure" size="sm" className="ml-auto" onClick={() => { setRound((r) => r + 1); setFound(null); setMiss([]); }}>
            Next tape
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-29 · ARBITRAGE RUNNER — buy low, transfer, sell high before decay
 * ===================================================================== */
const EXS = [
  { n: "Binance", c: "#f3ba2f" },
  { n: "Coinbase", c: "#3e8bff" },
  { n: "Kraken", c: "#9170ff" },
];
function ArbRunner() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [prices, setPrices] = useState([64250, 64250, 64250]);
  const [hold, setHold] = useState<{ ex: number; p: number } | null>(null);
  const [profit, setProfit] = useState(0);
  const [time, setTime] = useState(45);
  const [claimed, setClaimed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useInterval(
    () => {
      setPrices((ps) => ps.map((p, i) => p * (1 + (Math.random() - 0.5) * 0.004 + Math.sin(Date.now() / 3000 + i * 2) * 0.0008)));
    },
    phase === "play" ? 400 : null,
  );
  useInterval(() => setTime((t) => Math.max(0, t - 1)), phase === "play" ? 1000 : null);
  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      sfx(profit > 0 ? "levelup" : "lose");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  const lo = prices.indexOf(Math.min(...prices));
  const hi = prices.indexOf(Math.max(...prices));
  const spread = ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices)) * 100;
  const buy = (i: number) => {
    if (hold) return;
    setHold({ ex: i, p: prices[i] });
    sfx("coin");
    combatText(boxRef.current?.getBoundingClientRect().left ?? 0, boxRef.current?.getBoundingClientRect().top ?? 0, "BOUGHT", "#ffc23d", 16);
  };
  const sell = (i: number) => {
    if (!hold || hold.ex === i) return;
    const p = ((prices[i] - hold.p) / hold.p) * 10000;
    setProfit((x) => x + p);
    setHold(null);
    sfx(p > 0 ? "success" : "error");
    const el = boxRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      combatText(r.left + r.width / 2, r.top + 40, `${p >= 0 ? "+" : ""}$${p.toFixed(0)}`, p >= 0 ? "#22d39a" : "#ff4d6d", 22);
    }
  };
  const start = () => {
    setPhase("play");
    setPrices([64250, 64380, 64120]);
    setHold(null);
    setProfit(0);
    setTime(45);
    setClaimed(false);
    sfx("go");
  };
  const QTY = 10000;
  return (
    <Asset title="Arbitrage Runner" code="G-29" tags="arbitrage spread exchanges buy low sell high transfer latency runner" span={4}>
      <div ref={boxRef} className="relative">
        <div className="mb-3 flex items-center gap-2">
          <Chip tone={spread > 0.15 ? "bull" : "ink"}>Spread {spread.toFixed(3)}%</Chip>
          <Chip tone="azure">⏱ {time}s</Chip>
          <span className={cn("ml-auto font-mono text-sm font-bold", profit >= 0 ? "text-bull" : "text-bear")}>
            {profit >= 0 ? "+" : ""}${profit.toFixed(0)}
          </span>
        </div>
        {phase === "ready" ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-5xl">⚡</div>
            <div className="mt-2 font-display text-lg font-black text-white">Arb Runner</div>
            <div className="mt-1 max-w-[240px] text-xs font-semibold text-ink-400">Buy on the cheapest exchange, sell on the priciest. $10k size, 45 seconds.</div>
            <Btn variant="gold" className="mt-4" onClick={start} sound={false}>
              Start run
            </Btn>
          </div>
        ) : phase === "over" ? (
          <div className="anim-pop flex flex-col items-center py-8 text-center">
            <div className={cn("font-display text-3xl font-black", profit > 0 ? "text-bull" : "text-bear")}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(0)}
            </div>
            <div className="text-xs font-bold text-ink-400">{profit > 50 ? "Market maker material!" : profit > 0 ? "Profitable run." : "The spread ate you. Faster next time!"}</div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={start}>
                Again
              </Btn>
              {profit > 0 && (
                <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("coins", Math.min(300, Math.round(profit)), e.currentTarget); }}>
                  {claimed ? "Claimed" : `Claim $${Math.min(300, Math.round(profit))}`}
                </Btn>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {EXS.map((e, i) => {
              const isLo = i === lo;
              const isHi = i === hi;
              return (
                <div key={e.n} className={cn("panel-raised flex items-center gap-3 rounded-2xl p-3 transition-all", hold?.ex === i && "ring-2 ring-gold")}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-black text-white" style={{ background: e.c }}>
                    {e.n[0]}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                      {e.n}
                      {isLo && <span className="anim-pop rounded bg-bull px-1 text-[9px] font-black text-ink-950">LOW</span>}
                      {isHi && <span className="anim-pop rounded bg-gold px-1 text-[9px] font-black text-ink-950">HIGH</span>}
                    </div>
                    <div className="font-mono text-xs text-ink-300">${prices[i].toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                  </div>
                  {!hold ? (
                    <Btn variant={isLo ? "bull" : "ghost"} size="sm" onClick={() => buy(i)}>
                      Buy
                    </Btn>
                  ) : hold.ex === i ? (
                    <span className="rounded-lg bg-gold/20 px-2 py-1 text-[10px] font-black text-gold">HOLDING</span>
                  ) : (
                    <Btn variant={isHi ? "gold" : "ghost"} size="sm" onClick={() => sell(i)}>
                      Sell
                    </Btn>
                  )}
                </div>
              );
            })}
            <div className="text-center text-[11px] font-bold text-ink-500">
              {hold ? `Holding 1 BTC @ $${hold.p.toFixed(0)} — sell where it's highest` : "Pick the cheapest exchange to buy"} · size ${QTY.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-30 · CANDLESTICK BUILDER — compose OHLC, see the candle morph
 * ===================================================================== */
function CandleBuilder() {
  const g = useGame();
  const [o, setO] = useState(50);
  const [h, setH] = useState(80);
  const [l, setL] = useState(20);
  const [c, setC] = useState(65);
  const [target, setTarget] = useState<"hammer" | "doji" | "bull">("hammer");
  const [claimed, setClaimed] = useState(false);
  const body = Math.abs(c - o);
  const range = Math.max(1, h - l);
  const lower = Math.min(o, c) - l;
  const score =
    target === "hammer"
      ? clamp(100 - Math.abs(lower - body * 2.5) * 4 - Math.abs(h - Math.max(o, c)) * 3, 0, 100)
      : target === "doji"
        ? clamp(100 - body * 6 - Math.abs(h - Math.max(o, c) - (Math.min(o, c) - l)) * 2, 0, 100)
        : clamp(100 - Math.abs(body - range * 0.7) * 3 - (c < o ? 60 : 0), 0, 100);
  const done = score > 82;
  const up = c >= o;
  const col = up ? "#22d39a" : "#ff4d6d";
  const Y = (v: number) => 10 + ((100 - v) / 100) * 180;
  const row = (label: string, v: number, set: (n: number) => void, color: string) => (
    <div className="flex items-center gap-2">
      <span className="w-6 font-mono text-xs font-black" style={{ color }}>
        {label}
      </span>
      <input type="range" min={0} max={100} value={v} onChange={(e) => { set(+e.target.value); setClaimed(false); sfx("tick"); }} className="flex-1" style={{ accentColor: color }} />
      <span className="w-8 text-right font-mono text-xs font-bold text-white">{v}</span>
    </div>
  );
  return (
    <Asset title="Candlestick Builder" code="G-30" tags="candlestick builder ohlc compose hammer doji sliders learn" span={4}>
      <div className="flex gap-2">
        {(["hammer", "doji", "bull"] as const).map((t) => (
          <button key={t} onClick={() => { setTarget(t); setClaimed(false); sfx("select"); }} className={cn("rounded-xl px-3 py-1.5 text-[11px] font-black uppercase transition", target === t ? "bg-azure text-white shadow-[0_3px_0_#1c55c2]" : "text-ink-400 hover:text-white")}>
            {t === "bull" ? "Big bull" : t}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[110px_1fr] items-center gap-4">
        <div className="panel-inset flex h-[210px] items-center justify-center rounded-2xl">
          <svg viewBox="0 0 60 200" className="h-full">
            <line x1="30" x2="30" y1={Y(h)} y2={Y(l)} stroke={col} strokeWidth="3" style={{ transition: "all .2s" }} />
            <rect x="16" y={Y(Math.max(o, c))} width="28" height={Math.max(3, Math.abs(Y(o) - Y(c)))} rx="4" fill={col} style={{ transition: "all .2s", filter: `drop-shadow(0 0 10px ${col})` }} />
            <line x1="8" x2="52" y1={Y(o)} y2={Y(o)} stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity=".6" />
          </svg>
        </div>
        <div className="space-y-2.5">
          {row("O", o, setO, "#8ea4d2")}
          {row("H", h, setH, "#22d39a")}
          {row("L", l, setL, "#ff4d6d")}
          {row("C", c, setC, "#ffc23d")}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="panel-inset h-3 flex-1 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-bear via-gold to-bull transition-all" style={{ width: `${score}%` }} />
        </div>
        <span className="font-mono text-xs font-bold text-white">{Math.round(score)}%</span>
      </div>
      <div className="mt-3 text-center text-[11px] font-bold text-ink-400">
        {target === "hammer" ? "Goal: tiny body on top + long lower wick" : target === "doji" ? "Goal: open ≈ close, long wicks both sides" : "Goal: big green body, small wicks"}
      </div>
      {done && (
        <Btn
          variant="gold"
          block
          size="sm"
          className="anim-pop mt-3"
          disabled={claimed}
          onClick={(e) => {
            setClaimed(true);
            g.reward("xp", 20, e.currentTarget);
            fx.burst(e.currentTarget, { colors: ["#ffc23d", "#22d39a", "#fff"], count: 24, spread: 90 });
          }}
        >
          <XPIcon size={16} /> {claimed ? "Claimed" : "Perfect candle! +20 XP"}
        </Btn>
      )}
    </Asset>
  );
}

export default function Strategy() {
  return (
    <>
      <LevelDrawer />
      <OrderFlow />
      <LevLadder />
      <WhaleHunt />
      <ArbRunner />
      <CandleBuilder />
    </>
  );
}

/* Re-export small shared bits */
export { Countdown };
export function useGemReward() {
  const g = useGame();
  return (amt: number, el: HTMLElement | null) => g.reward("gems", amt, el);
}
export function GemClaim({ amt = 10 }: { amt?: number }) {
  const g = useGame();
  return (
    <Btn variant="violet" size="sm" onClick={(e) => g.reward("gems", amt, e.currentTarget)}>
      <GemIcon size={14} /> +{amt}
    </Btn>
  );
}
