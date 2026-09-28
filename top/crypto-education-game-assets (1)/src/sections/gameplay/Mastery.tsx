import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip } from "../../components/ui";
import { BearIcon, BullIcon, CoinIcon, Icon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, shuffleSeeded, useInterval } from "../../lib/motion";
import { TickNumber, combatText } from "../../lib/fx2";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-38 · HIGHER / LOWER STREAK — chain price guesses, 45s
 * ===================================================================== */
function HigherLower() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [price, setPrice] = useState(64250);
  const [prev, setPrev] = useState(64250);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("tl-hl-best") || 0));
  const [time, setTime] = useState(45);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [tick, setTick] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const hist = useRef<number[]>([64250]);
  useInterval(
    () => {
      setTick((t) => t + 1);
      setPrice((p) => {
        const n = p * (1 + (Math.random() - 0.5) * 0.0016);
        hist.current = [...hist.current.slice(-40), n];
        return n;
      });
    },
    phase === "play" ? 700 : null,
  );
  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), phase === "play" ? 100 : null);
  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      sfx("levelup");
      if (streak > best) {
        setBest(streak);
        localStorage.setItem("tl-hl-best", String(streak));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  const guess = (dir: 1 | -1) => {
    if (phase !== "play") return;
    const moved = price - prev;
    const ok = Math.abs(moved) < 0.5 ? true : dir === 1 ? moved > 0 : moved < 0;
    setFlash(dir === 1 ? "up" : "down");
    setTimeout(() => setFlash(null), 300);
    if (ok) {
      const n = streak + 1;
      setStreak(n);
      sfx(n >= 5 ? "combo" : "success", 1 + Math.min(n, 12) * 0.04);
      if (boxRef.current) {
        const r = boxRef.current.getBoundingClientRect();
        combatText(r.left + r.width / 2, r.top + 60, `×${n}`, n >= 5 ? "#ff7a2f" : "#22d39a", 18 + Math.min(n, 10));
      }
    } else {
      setStreak(0);
      sfx("error");
      setTime((t) => Math.max(0, t - 2));
    }
    setPrev(price);
  };
  const start = () => {
    setPhase("play");
    setStreak(0);
    setTime(45);
    setClaimed(false);
    hist.current = [64250];
    setPrice(64250);
    setPrev(64250);
    sfx("go");
  };
  const min = Math.min(...hist.current);
  const max = Math.max(...hist.current);
  const W = 300;
  const H = 90;
  const path = hist.current.map((v, i) => `${i ? "L" : "M"}${(i / 39) * W},${6 + ((max - v) / (max - min || 1)) * (H - 12)}`).join("");
  const up = price >= prev;
  const reward = Math.max(5, streak * 3 + Math.floor((45 - time) / 3));
  return (
    <Asset title="Higher / Lower Streak" code="G-38" tags="higher lower streak price guess live chain best" span={4}>
      <div ref={boxRef} className="relative">
        <div className="mb-2 flex items-center gap-2">
          <Chip tone="flame">🔥 ×{streak}</Chip>
          <Chip tone="azure">{Math.ceil(time)}s</Chip>
          <span className="ml-auto font-mono text-[11px] font-bold text-ink-400">Best ×{best}</span>
        </div>
        <div className={cn("panel-inset relative overflow-hidden rounded-2xl p-4 text-center transition-colors", flash === "up" ? "bg-bull/15" : flash === "down" ? "bg-bear/15" : "")}>
          <div className="text-[10px] font-black uppercase tracking-widest text-ink-400">BTC / USDT · live</div>
          <div key={tick} className={cn("font-mono text-3xl font-bold transition-colors", up ? "text-bull" : "text-bear")}>
            ${price.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
            <path d={path} fill="none" stroke={up ? "#22d39a" : "#ff4d6d"} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx={W} cy={6 + ((max - price) / (max - min || 1)) * (H - 12)} r="4" fill="#fff" className="anim-glow" />
          </svg>
          {phase !== "play" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/60 backdrop-blur-[1px]">
              {phase === "ready" ? (
                <>
                  <div className="font-display text-lg font-black text-white">Next tick: higher or lower?</div>
                  <Btn variant="bull" size="sm" className="mt-3" onClick={start} sound={false}>
                    Start 45s
                  </Btn>
                </>
              ) : (
                <>
                  <div className="font-display text-3xl font-black text-white">×{streak}</div>
                  {streak >= best && streak > 0 && <Chip tone="gold" className="anim-pop mt-1">★ New best</Chip>}
                  <div className="mt-3 flex gap-2">
                    <Btn variant="ghost" size="sm" onClick={start}>
                      Retry
                    </Btn>
                    <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", reward, e.currentTarget); }}>
                      {claimed ? "Claimed" : `+${reward}`}
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Btn variant="bull" disabled={phase !== "play"} onClick={() => guess(1)} sound={false}>
            <Icon name="trendUp" size={18} stroke={3} /> Higher
          </Btn>
          <Btn variant="bear" disabled={phase !== "play"} onClick={() => guess(-1)} sound={false}>
            <Icon name="trendDown" size={18} stroke={3} /> Lower
          </Btn>
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-39 · FUNDING FLIP — 3D coin flip, bet the funding sign
 * ===================================================================== */
function FundingFlip() {
  const g = useGame();
  const [bet, setBet] = useState<"pos" | "neg">("pos");
  const [stake, setStake] = useState(25);
  const [flip, setFlip] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<"pos" | "neg" | null>(null);
  const [stats, setStats] = useState({ w: 0, l: 0 });
  const fundRef = useRef<HTMLDivElement>(null);
  const rate = 0.012 + Math.sin(Date.now() / 9000) * 0.02;
  const toss = (el: HTMLElement) => {
    if (spinning) return;
    if (!g.spend("coins", stake, el)) return;
    setSpinning(true);
    setResult(null);
    sfx("whoosh");
    const win = Math.random() < 0.48;
    const res = win ? bet : bet === "pos" ? "neg" : "pos";
    const turns = 5 + Math.floor(Math.random() * 3);
    setFlip((f) => f + turns * 360 + (res === "neg" ? 180 : 0) - (f % 360));
    setTimeout(() => {
      setSpinning(false);
      setResult(res);
      if (win) {
        setStats((s) => ({ ...s, w: s.w + 1 }));
        sfx("success");
        setTimeout(() => g.reward("coins", stake * 2, fundRef.current), 200);
      } else {
        setStats((s) => ({ ...s, l: s.l + 1 }));
        sfx("lose");
      }
    }, 1900);
  };
  return (
    <Asset title="Funding Flip" code="G-39" tags="funding flip coin 3d bet longs shorts perpetual" span={4}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-bold text-ink-400">
          Funding rate <span className={cn("font-mono font-bold", rate >= 0 ? "text-bull" : "text-bear")}>{rate >= 0 ? "+" : ""}{(rate * 100).toFixed(3)}%</span>
        </div>
        <div className="flex gap-1.5">
          <Chip tone="bull">W {stats.w}</Chip>
          <Chip tone="bear">L {stats.l}</Chip>
        </div>
      </div>
      <div ref={fundRef} className="flex flex-col items-center py-4" style={{ perspective: 700 }}>
        <div className="relative h-32 w-32 [transform-style:preserve-3d]" style={{ transform: `rotateY(${flip}deg)`, transition: spinning ? "transform 1.9s cubic-bezier(.2,.7,.25,1)" : "none" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full [backface-visibility:hidden]" style={{ background: "radial-gradient(circle at 35% 30%, #6bf0c0, #0c8f63)", boxShadow: "0 6px 0 #08452f, 0 0 30px rgba(34,211,154,.4)" }}>
            <BullIcon size={52} />
            <span className="text-[10px] font-black text-ink-950">LONGS PAY</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: "radial-gradient(circle at 35% 30%, #ff8aa0, #b31f3d)", boxShadow: "0 6px 0 #5f1020, 0 0 30px rgba(255,77,109,.4)" }}>
            <BearIcon size={52} />
            <span className="text-[10px] font-black text-white">SHORTS PAY</span>
          </div>
        </div>
        <div className={cn("mt-4 h-6 font-display text-sm font-black", result === "pos" ? "text-bull" : result === "neg" ? "text-bear" : "text-ink-500")}>
          {spinning ? "Flipping…" : result ? (result === bet ? `Won +${stake * 2}!` : `Lost −${stake}`) : "Pick a side"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={spinning} onClick={() => setBet("pos")} className={cn("rounded-2xl border-2 py-2.5 text-xs font-black uppercase transition", bet === "pos" ? "border-bull bg-bull/15 text-bull" : "border-ink-600 text-ink-400")}>
          ▲ Positive
        </button>
        <button disabled={spinning} onClick={() => setBet("neg")} className={cn("rounded-2xl border-2 py-2.5 text-xs font-black uppercase transition", bet === "neg" ? "border-bear bg-bear/15 text-bear" : "border-ink-600 text-ink-400")}>
          ▼ Negative
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {[10, 25, 50].map((s) => (
          <button key={s} disabled={spinning} onClick={() => setStake(s)} className={cn("flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black", stake === s ? "bg-gold text-ink-950" : "bg-ink-800 text-ink-300")}>
            <CoinIcon size={13} /> {s}
          </button>
        ))}
        <Btn variant="gold" size="sm" className="ml-auto" disabled={spinning} onClick={(e) => toss(e.currentTarget)} sound={false}>
          Flip!
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-40 · BASKET SORT — drag coins into Bull / Bear baskets, 40s
 * ===================================================================== */
const SORT_COINS = [
  { s: "BTC", ch: 4.2, c: "#f7931a" },
  { s: "ETH", ch: -1.8, c: "#627eea" },
  { s: "SOL", ch: 9.6, c: "#14f195" },
  { s: "BNB", ch: -0.4, c: "#f3ba2f" },
  { s: "XRP", ch: 2.3, c: "#9ca3af" },
  { s: "ADA", ch: -5.1, c: "#3468d1" },
  { s: "DOGE", ch: 12.8, c: "#c2a633" },
  { s: "AVAX", ch: -3.3, c: "#e84142" },
];
function BasketSort() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [queue, setQueue] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(40);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [over, setOver] = useState<"bull" | "bear" | null>(null);
  const [flash, setFlash] = useState<"bull" | "bear" | null>(null);
  const [claimed, setClaimed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const cur = queue[0] !== undefined ? SORT_COINS[queue[0]] : null;
  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), phase === "play" ? 100 : null);
  useEffect(() => {
    if (phase === "play" && (time <= 0 || !queue.length)) {
      setPhase("over");
      sfx(queue.length ? "lose" : "levelup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, queue.length]);
  const start = () => {
    setQueue(shuffleSeeded(SORT_COINS.map((_, i) => i), Date.now() % 997));
    setScore(0);
    setTime(40);
    setClaimed(false);
    setPhase("play");
    sfx("go");
  };
  const drop = (side: "bull" | "bear") => {
    if (!cur) return;
    const ok = (side === "bull") === cur.ch >= 0;
    setFlash(side);
    setTimeout(() => setFlash(null), 350);
    if (ok) {
      setScore((s) => s + 15);
      sfx("success");
      const el = boxRef.current?.querySelector(`[data-basket="${side}"]`);
      if (el) {
        const r = (el as HTMLElement).getBoundingClientRect();
        combatText(r.left + r.width / 2, r.top, "+15", side === "bull" ? "#22d39a" : "#ff4d6d", 18);
      }
    } else {
      sfx("error");
      setTime((t) => Math.max(0, t - 3));
    }
    setQueue((q) => q.slice(1));
    setDrag(null);
    setOver(null);
  };
  const basket = (side: "bull" | "bear") => {
    const bull = side === "bull";
    const hot = over === side || flash === side;
    return (
      <div
        data-basket={side}
        onPointerUp={() => drag && drop(side)}
        className={cn("flex flex-1 flex-col items-center rounded-3xl border-[3px] border-dashed py-4 transition-all duration-200", hot ? (bull ? "scale-105 border-bull bg-bull/15 shadow-[0_0_24px_rgba(34,211,154,.4)]" : "scale-105 border-bear bg-bear/15 shadow-[0_0_24px_rgba(255,77,109,.4)]") : "border-ink-600 bg-ink-950/40")}
      >
        {bull ? <BullIcon size={44} /> : <BearIcon size={44} />}
        <div className={cn("mt-1 font-display text-sm font-black", bull ? "text-bull" : "text-bear")}>{bull ? "BULL ▲" : "BEAR ▼"}</div>
        <div className="text-[10px] font-bold text-ink-500">{bull ? "green 24h" : "red 24h"}</div>
      </div>
    );
  };
  return (
    <Asset title="Basket Sort · Bull vs Bear" code="G-40" tags="sort drag baskets bull bear categorize coins timed" span={4}>
      <div ref={boxRef} className="relative select-none">
        <div className="mb-3 flex items-center gap-2">
          <Chip tone="gold">
            <TickNumber value={score} />
          </Chip>
          <Chip tone="azure">{Math.ceil(time)}s</Chip>
          <span className="ml-auto font-mono text-[11px] font-bold text-ink-400">{queue.length} left</span>
        </div>
        {phase === "play" && cur && (
          <>
            <div className="flex justify-center">
              <div
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  setDrag({ x: e.clientX, y: e.clientY });
                }}
                onPointerMove={(e) => {
                  if (!drag) return;
                  setDrag({ x: e.clientX, y: e.clientY });
                  const els = boxRef.current?.querySelectorAll("[data-basket]");
                  let hov: "bull" | "bear" | null = null;
                  els?.forEach((el) => {
                    const r = (el as HTMLElement).getBoundingClientRect();
                    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) hov = (el as HTMLElement).dataset.basket as "bull" | "bear";
                  });
                  if (hov !== over) {
                    setOver(hov);
                    if (hov) sfx("tick");
                  }
                }}
                onPointerUp={() => {
                  if (over) drop(over);
                  else {
                    setDrag(null);
                    setOver(null);
                  }
                }}
                className="flex cursor-grab touch-none items-center gap-3 rounded-3xl bg-gradient-to-b from-ink-600 to-ink-700 px-5 py-3 shadow-[0_5px_0_#0b1838] ring-1 ring-white/10 active:cursor-grabbing"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[11px] font-black text-white" style={{ background: cur.c }}>
                  {cur.s.slice(0, 3)}
                </span>
                <div>
                  <div className="font-display text-base font-black text-white">{cur.s}</div>
                  <div className={cn("font-mono text-sm font-bold", cur.ch >= 0 ? "text-bull" : "text-bear")}>
                    {cur.ch >= 0 ? "+" : ""}
                    {cur.ch}% 24h
                  </div>
                </div>
                <Icon name="swap" size={16} className="text-ink-400" />
              </div>
            </div>
            <div className="mt-3 text-center text-[11px] font-bold text-ink-500">Drag into the right basket — or tap a basket</div>
          </>
        )}
        {phase !== "play" && (
          <div className="flex flex-col items-center py-6 text-center">
            {phase === "ready" ? (
              <>
                <div className="text-4xl">🧺</div>
                <div className="mt-2 font-display text-lg font-black text-white">Sort 8 coins in 40s</div>
                <Btn variant="azure" size="sm" className="mt-3" onClick={start} sound={false}>
                  Start
                </Btn>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-black text-white">{score}</div>
                <div className="text-xs font-bold text-ink-400">{score >= 105 ? "Perfect sort!" : score >= 60 ? "Sharp eyes." : "Watch the % color."}</div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={start}>
                    Retry
                  </Btn>
                  <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", Math.max(5, Math.floor(score / 5)), e.currentTarget); }}>
                    {claimed ? "Claimed" : `+${Math.max(5, Math.floor(score / 5))}`}
                  </Btn>
                </div>
              </>
            )}
          </div>
        )}
        <div className="mt-3 flex gap-3">
          <div className="flex-1" onClick={() => phase === "play" && cur && drop("bull")}>
            {basket("bull")}
          </div>
          <div className="flex-1" onClick={() => phase === "play" && cur && drop("bear")}>
            {basket("bear")}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-41 · VOLATILITY ZONE — stop the needle in the green, 3 rounds
 * ===================================================================== */
function VolZone() {
  const g = useGame();
  const [round, setRound] = useState(0);
  const [angle, setAngle] = useState(0);
  const [dir] = useState(1);
  const [speed, setSpeed] = useState(1.6);
  const [stopped, setStopped] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [live, setLive] = useState(false);
  const needleRef = useRef(0);
  const zone = useMemo(() => ({ c: [-30, 25, -8][round % 3], w: [26, 20, 14][round % 3] }), [round]);
  useEffect(() => {
    if (!live || stopped !== null) return;
    let raf = 0;
    let last = performance.now();
    let a = needleRef.current;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      a += dt * 160 * speed * dir;
      if (a > 78) a = -78;
      needleRef.current = a;
      setAngle(a);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live, stopped, speed, dir]);
  const stop = (el: HTMLElement) => {
    if (!live || stopped !== null) return;
    const d = Math.abs(angle - zone.c);
    const sc = d <= zone.w / 2 ? 100 : d <= zone.w ? 60 : d <= zone.w * 2 ? 25 : 0;
    setStopped(angle);
    setScores((s) => [...s, sc]);
    if (sc >= 60) {
      sfx("success");
      fx.burst(el, { colors: ["#22d39a", "#fff"], count: 20, spread: 80 });
    } else sfx("error");
    setTimeout(() => {
      if (round >= 2) {
        setLive(false);
      } else {
        setRound((r) => r + 1);
        setSpeed((s) => s + 0.7);
        setStopped(null);
      }
    }, 1100);
  };
  const start = () => {
    setRound(0);
    setScores([]);
    setStopped(null);
    setSpeed(1.6);
    setClaimed(false);
    setLive(true);
    sfx("go");
  };
  const done = !live && scores.length === 3;
  const total = scores.reduce((a, b) => a + b, 0);
  const C = 110;
  const R = 84;
  const pt = (deg: number, r: number) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)];
  const arc = (f: number, t: number, r: number) => {
    const [x0, y0] = pt(f, r);
    const [x1, y1] = pt(t, r);
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
  };
  return (
    <Asset title="Volatility Zone · Timing" code="G-41" tags="timing needle zone stop precision volatility gauge rounds" span={4}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Stop the needle in the green</div>
        <Chip tone="violet">
          Round {Math.min(round + 1, 3)}/3
        </Chip>
      </div>
      <div className="flex justify-center">
        <svg viewBox="0 0 220 150" className="w-full max-w-[300px]">
          <path d={arc(-78, 78, R)} stroke="#0a1330" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d={arc(-78, 78, R)} stroke="#27427d" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d={arc(zone.c - zone.w / 2, zone.c + zone.w / 2, R)} stroke="#22d39a" strokeWidth="10" fill="none" style={{ filter: "drop-shadow(0 0 8px #22d39a)" }} />
          <path d={arc(zone.c - zone.w, zone.c - zone.w / 2, R)} stroke="#ffc23d" strokeWidth="10" fill="none" opacity=".7" />
          <path d={arc(zone.c + zone.w / 2, zone.c + zone.w, R)} stroke="#ffc23d" strokeWidth="10" fill="none" opacity=".7" />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px` }}>
            <line x1={C} y1={C} x2={C} y2={C - R + 4} stroke={stopped !== null ? (scores[scores.length - 1] >= 60 ? "#22d39a" : "#ff4d6d") : "#fff"} strokeWidth="5" strokeLinecap="round" />
          </g>
          <circle cx={C} cy={C} r="12" fill="#e3eaf8" />
          <circle cx={C} cy={C} r="5" fill="#0d1a3d" />
        </svg>
      </div>
      <div className="mt-1 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("rounded-lg px-2.5 py-1 font-mono text-xs font-bold", scores[i] === undefined ? "bg-ink-800 text-ink-500" : scores[i] >= 60 ? "bg-bull/20 text-bull" : scores[i] > 0 ? "bg-gold/20 text-gold" : "bg-bear/20 text-bear")}>
            {scores[i] === undefined ? "–" : scores[i]}
          </span>
        ))}
      </div>
      <div className="mt-3">
        {!live && !done ? (
          <Btn variant="azure" block onClick={start} sound={false}>
            Start · 3 rounds
          </Btn>
        ) : done ? (
          <div className="anim-pop flex items-center gap-3 rounded-2xl bg-ink-950/50 p-3">
            <span className="font-display text-xl font-black text-white">{total}/300</span>
            <span className="text-[11px] font-bold text-ink-400">{total >= 220 ? "Sniper timing!" : total >= 120 ? "Decent feel." : "Watch the rhythm."}</span>
            <Btn variant="gold" size="sm" className="ml-auto" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", Math.max(5, Math.floor(total / 10)), e.currentTarget); }}>
              {claimed ? "Claimed" : `+${Math.max(5, Math.floor(total / 10))}`}
            </Btn>
          </div>
        ) : (
          <Btn variant={stopped !== null ? "ghost" : "bull"} block size="lg" disabled={stopped !== null} onClick={(e) => stop(e.currentTarget)}>
            {stopped !== null ? `${scores[scores.length - 1]} pts!` : "STOP!"}
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-42 · GRID TRADER — place 3 buy lines, market sweeps & fills
 * ===================================================================== */
function GridTrader() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const [lines, setLines] = useState([96, 92, 88]);
  const [drag, setDrag] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [n, setN] = useState(0);
  const [fills, setFills] = useState<boolean[]>([false, false, false]);
  const [claimed, setClaimed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const path = useMemo(() => {
    const r = mulberry32(round * 41 + 9);
    let p = 100;
    const out = [p];
    for (let i = 1; i < 90; i++) {
      p += (r() - 0.52) * 1.6 + Math.sin(i / 12) * 0.35;
      if (i > 60) p += 0.22;
      out.push(p);
    }
    return out;
  }, [round]);
  const W = 400;
  const H = 200;
  const min = 82;
  const max = 104;
  const y = (v: number) => ((max - v) / (max - min)) * H;
  const full = path.map((v, i) => `${i ? "L" : "M"}${(i / 89) * W},${y(v)}`).join("");
  const shown = path.slice(0, Math.max(2, n)).map((v, i) => `${i ? "L" : "M"}${(i / 89) * W},${y(v)}`).join("");
  useEffect(() => {
    if (!running) return;
    if (n >= path.length) {
      setRunning(false);
      const f = lines.map((L) => path.some((p) => p <= L));
      setFills(f);
      const profit = f.filter(Boolean).length * 40;
      if (profit > 0) {
        sfx("success");
        fx.text(svgRef.current, `+$${profit}`, "#22d39a", true);
      } else sfx("lose");
      return;
    }
    const t = setTimeout(() => {
      setN((x) => x + 1);
      const v = path[n];
      setFills((f) => f.map((done, i) => done || v <= lines[i]));
      if (n % 3 === 0) sfx("tick", 1 + (100 - v) / 40);
    }, 40);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, n]);
  const toVal = (cy: number) => {
    const rc = svgRef.current!.getBoundingClientRect();
    return max - ((cy - rc.top) / rc.height) * (max - min);
  };
  const start = () => {
    setN(0);
    setFills([false, false, false]);
    setClaimed(false);
    setRunning(true);
    sfx("go");
  };
  const profit = fills.filter(Boolean).length * 40;
  const over = !running && n >= path.length;
  return (
    <Asset title="Grid Trader · DCA Bot" code="G-42" tags="grid trading dca bot buy lines ladder fills simulation" span={8}>
      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <div>
          <div className="panel-inset overflow-hidden rounded-2xl">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="block w-full touch-none select-none"
              onPointerMove={(e) => {
                if (drag === null || running) return;
                const v = clamp(toVal(e.clientY), min + 1, 99);
                setLines((l) => l.map((x, i) => (i === drag ? Math.round(v * 2) / 2 : x)));
              }}
              onPointerUp={() => setDrag(null)}
            >
              <line x1="0" x2={W} y1={y(100)} y2={y(100)} stroke="#8ea4d2" strokeDasharray="5 4" strokeOpacity=".6" />
              <text x="6" y={y(100) - 6} fontSize="10" fontWeight="900" fill="#8ea4d2">
                START 100
              </text>
              <path d={full} stroke="#27427d" strokeWidth="1.5" fill="none" strokeDasharray="3 5" opacity=".7" />
              {running || n > 0 ? <path d={shown} stroke="#2fd4ff" strokeWidth="2.6" fill="none" strokeLinejoin="round" /> : null}
              {n > 0 && <circle cx={((n - 1) / 89) * W} cy={y(path[n - 1])} r="5" fill="#fff" className={running ? "anim-glow" : ""} />}
              {lines.map((L, i) => (
                <g key={i} className={running ? "" : "cursor-ns-resize"} onPointerDown={(e) => { if (!running) { setDrag(i); svgRef.current?.setPointerCapture(e.pointerId); sfx("select"); } }}>
                  <rect x="0" y={y(L) - 12} width={W} height="24" fill="transparent" />
                  <line x1="0" x2={W} y1={y(L)} y2={y(L)} stroke={fills[i] ? "#22d39a" : "#ffc23d"} strokeWidth="2" strokeDasharray={fills[i] ? "none" : "7 5"} />
                  <rect x="6" y={y(L) - 11} width="64" height="22" rx="7" fill={fills[i] ? "#22d39a" : "#ffc23d"} />
                  <text x="38" y={y(L) + 4} textAnchor="middle" fontSize="10.5" fontWeight="900" fill={fills[i] ? "#03281b" : "#3a2500"}>
                    {fills[i] ? `✓ BUY ${L}` : `BUY ${L}`}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-2 text-[11px] font-bold text-ink-500">Drag the 3 yellow buy lines below 100, then run the market</div>
        </div>
        <div className="flex flex-col rounded-2xl bg-ink-950/40 p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-ink-500">Grid PnL</div>
          <div className={cn("font-mono text-3xl font-bold", profit > 0 ? "text-bull" : "text-ink-300")}>+${profit}</div>
          <div className="mt-2 space-y-1.5">
            {fills.map((f, i) => (
              <div key={i} className={cn("flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] font-bold", f ? "bg-bull/15 text-bull" : "bg-ink-800 text-ink-500")}>
                <span className={cn("h-2 w-2 rounded-full", f ? "bg-bull" : "bg-ink-600")} />
                Line {i + 1} @ {lines[i]} {f ? "· filled" : "· waiting"}
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4">
            {!running && !over ? (
              <Btn variant="bull" block size="sm" onClick={start} sound={false}>
                Run market
              </Btn>
            ) : over ? (
              <div className="space-y-2">
                <Btn variant="gold" block size="sm" disabled={claimed || profit === 0} onClick={(e) => { setClaimed(true); g.reward("coins", profit, e.currentTarget); }}>
                  {claimed ? "Claimed" : profit ? `Claim $${profit}` : "No fills"}
                </Btn>
                <Btn
                  variant="ghost" block size="sm"
                  onClick={() => {
                    setRound((r) => r + 1);
                    setN(0);
                    setFills([false, false, false]);
                    setClaimed(false);
                  }}
                >
                  New market
                </Btn>
              </div>
            ) : (
              <div className="text-center text-[11px] font-bold text-cyan anim-glow">Running… {Math.round((n / path.length) * 100)}%</div>
            )}
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function Mastery() {
  return (
    <>
      <HigherLower />
      <FundingFlip />
      <BasketSort />
      <VolZone />
      <GridTrader />
    </>
  );
}
