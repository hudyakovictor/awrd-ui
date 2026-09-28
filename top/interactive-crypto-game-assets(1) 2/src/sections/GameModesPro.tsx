/* ------------------------------------------------------------------
 * 21 · GAME MODES PRO — extra award-winning gameplay systems
 * Rhythm taps · Order-book puzzle · Liquidation survivor · Copy-trade sim
 * Sentiment tug-of-war · Candle painter · Pipeline builder · Raid boss
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor, Boxes, Gauge, Layers, Mic2, Paintbrush, Swords, Trophy, Play, Crown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import {
  BossHp, ComboMeter, fireSmall, fireWin, GameSection,
  PressTile, RewardBurst, StarBurst, TimerRing, type Reward,
} from "../fx/gamekit";
import { Reveal, VelocityMarquee } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = {
  onXp: (n: number) => void; onGems: (n: number) => void;
  toast: (t: string, s: string, tone?: string) => void;
};

type Mode = "hub" | "rhythm" | "ob-puzzle" | "liq-survivor" | "copytrade"
  | "tug" | "painter" | "pipeline" | "raid";

const cards: { id: Mode; t: string; s: string; c: string; icon: typeof Trophy; xp: number }[] = [
  { id: "rhythm", t: "Candle Rhythm", s: "Tap to the beat of the market", c: "#8ef23c", icon: Mic2, xp: 90 },
  { id: "ob-puzzle", t: "Order Book Puzzle", s: "Rebuild the book under pressure", c: "#5b8cff", icon: Layers, xp: 85 },
  { id: "liq-survivor", t: "Liquidation Survivor", s: "Steer margin away from death", c: "#ff5470", icon: Gauge, xp: 100 },
  { id: "copytrade", t: "Copy-Trade Sim", s: "Follow or fade the whale", c: "#14c8f5", icon: Anchor, xp: 80 },
  { id: "tug", t: "Sentiment War", s: "Tug of war bulls vs bears", c: "#ffc531", icon: Swords, xp: 75 },
  { id: "painter", t: "Candle Painter", s: "Draw OHLC to match target", c: "#F7931A", icon: Paintbrush, xp: 95 },
  { id: "pipeline", t: "Strategy Pipeline", s: "Connect blocks into a bot", c: "#a78bff", icon: Boxes, xp: 110 },
  { id: "raid", t: "Guild Raid Boss", s: "Co-op DPS with combos", c: "#ff8b3d", icon: Crown, xp: 140 },
];

/* ================= RHYTHM ================= */
function Rhythm({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const notes = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    t: 800 + i * 420 + (i % 5) * 40,
    lane: i % 4,
    id: i,
  })), []);
  const [start, setStart] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [combo, setCombo] = useState(0);
  const [alive, setAlive] = useState(true);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const hitIds = useRef(new Set<number>());

  useEffect(() => {
    if (start === null || !alive) return;
    let raf = 0;
    const loop = () => {
      const t = performance.now() - start;
      setNow(t);
      // auto-miss
      notes.forEach(n => {
        if (!hitIds.current.has(n.id) && t > n.t + 180) {
          hitIds.current.add(n.id);
          setMiss(m => m + 1);
          setCombo(0);
        }
      });
      if (t > notes[notes.length - 1].t + 800) {
        setDone(true); setAlive(false);
        const score = hits;
        onWin(60 + score * 3);
        if (score > 20) fireWin(); else fireSmall();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [start, alive, notes, hits, onWin]);

  const tap = (lane: number) => {
    if (!start || !alive) return;
    const t = performance.now() - start;
    const candidate = notes.find(n => n.lane === lane && !hitIds.current.has(n.id) && Math.abs(n.t - t) < 160);
    if (candidate) {
      hitIds.current.add(candidate.id);
      const perfect = Math.abs(candidate.t - t) < 60;
      setHits(h => h + 1);
      setCombo(c => c + 1);
      if (perfect) sfx.coin(); else sfx.tap();
    } else {
      setMiss(m => m + 1);
      setCombo(0);
      sfx.error();
    }
  };

  const visible = notes.filter(n => {
    const y = ((n.t - now) / 1000) * 220;
    return y > -40 && y < 320 && !hitIds.current.has(n.id);
  });

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      {!start ? (
        <div className="py-10 text-center">
          <Mic2 size={48} className="mx-auto text-[#8ef23c]" />
          <p className="display mt-3 text-xl font-extrabold text-white">Candle Rhythm</p>
          <p className="text-sm text-[#8ea6d8]">4 lanes · hit when note reaches the line</p>
          <button onClick={() => { setStart(performance.now()); sfx.whoosh(); }} className="btn3d btn3d-green mt-5 px-8 py-3.5 text-sm"><Play size={16} /> Start</button>
        </div>
      ) : done ? (
        <div className="py-8 text-center">
          <StarBurst stars={hits > 24 ? 3 : hits > 16 ? 2 : 1} />
          <p className="display mt-3 text-2xl font-extrabold text-white">{hits} hits · {miss} miss</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Hub</button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <ComboMeter combo={combo} />
            <span className="num-mono text-sm font-extrabold text-white">{hits}</span>
          </div>
          <div className="panel-inset relative h-[340px] overflow-hidden !rounded-[22px]">
            <div className="absolute inset-x-0 bottom-16 z-10 h-1 bg-[#8ef23c] shadow-[0_0_12px_#8ef23c]" />
            <div className="absolute inset-0 grid grid-cols-4">
              {[0, 1, 2, 3].map(l => (
                <div key={l} className="relative border-r border-white/5 last:border-0">
                  {visible.filter(n => n.lane === l).map(n => {
                    const y = 300 - ((n.t - now) / 1000) * 220;
                    return (
                      <motion.div key={n.id} className="absolute left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border-2 border-white"
                        style={{ top: y, background: ["#8ef23c", "#5b8cff", "#ffc531", "#ff5470"][l], boxShadow: "0 0 14px currentColor" }} />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-4 gap-1 p-2">
              {[0, 1, 2, 3].map(l => (
                <button key={l} onPointerDown={() => tap(l)} className="btn3d h-14 !rounded-2xl text-sm font-black"
                  style={{ background: `linear-gradient(180deg, ${["#a4ff5e", "#7aa5ff", "#ffd76a", "#ff8ba0"][l]}, ${["#4e9c14", "#3358d6", "#e79a06", "#c81d47"][l]})`, boxShadow: "0 4px 0 #030816", color: "#081130" }}>
                  {["A", "S", "D", "F"][l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ORDER BOOK PUZZLE ================= */
function ObPuzzle({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const target = [3, 1, 4, 2, 0, 5]; // correct order of tiles by size rank
  const labels = ["Bid 0.8", "Bid 1.2", "Bid 2.5", "Ask 0.7", "Ask 1.5", "Ask 3.0"];
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5));
  const [time, setTime] = useState(45);
  const [live, setLive] = useState(true);
  const [msg, setMsg] = useState("Собери стакан: bids снизу вверх, asks сверху вниз");

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTime(t => {
      if (t <= 1) { setLive(false); setMsg("Time up"); sfx.error(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [live]);

  const swap = (i: number, j: number) => {
    if (!live) return;
    setOrder(o => {
      const n = [...o];
      const t = n[i]; n[i] = n[j]; n[j] = t;
      return n;
    });
    sfx.tick();
  };

  const check = () => {
    const ok = order.every((v, i) => v === target[i]);
    if (ok) { setLive(false); setMsg("Perfect book!"); onWin(85); fireWin(); }
    else { setMsg("Not yet — bids ascending into mid, asks ascending away"); sfx.error(); }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <div className="mb-3 flex items-center justify-between">
        <TimerRing seconds={time} max={45} color="#5b8cff" />
        <p className="text-xs font-bold text-[#aebde6]">{msg}</p>
      </div>
      <div className="space-y-2">
        {order.map((id, i) => (
          <div key={id} className="flex items-center gap-2">
            <button disabled={i === 0 || !live} onClick={() => swap(i, i - 1)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl text-xs">↑</button>
            <div className={cn("flex flex-1 items-center justify-between rounded-xl border px-3 py-2.5", id < 3 ? "border-[#2ede8a]/30 bg-[#2ede8a]/10" : "border-[#ff5470]/30 bg-[#ff5470]/10")}>
              <span className="text-xs font-extrabold text-white">{labels[id]}</span>
              <span className="num-mono text-[11px] text-[#8ea6d8]">#{i + 1}</span>
            </div>
            <button disabled={i === order.length - 1 || !live} onClick={() => swap(i, i + 1)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl text-xs">↓</button>
          </div>
        ))}
      </div>
      <button disabled={!live} onClick={check} className="btn3d btn3d-blue mt-4 w-full py-3.5 text-xs">Check book</button>
      {!live && <button onClick={onBack} className="btn3d btn3d-green mt-2 w-full py-3 text-xs">Hub</button>}
    </div>
  );
}

/* ================= LIQUIDATION SURVIVOR ================= */
function LiqSurvivor({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const [price, setPrice] = useState(100);
  const [entry] = useState(100);
  const [lev, setLev] = useState(10);
  const [margin, setMargin] = useState(100);
  const [alive, setAlive] = useState(false);
  const [t, setT] = useState(0);
  const liq = entry * (1 - 1 / lev + 0.005);
  const pnl = ((price - entry) / entry) * lev * margin;
  const dist = ((price - liq) / entry) * 100;

  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      setPrice(p => {
        const np = p + (Math.random() - 0.52) * 1.8;
        if (np <= liq) {
          setAlive(false);
          sfx.error();
          return liq;
        }
        return np;
      });
      setT(x => {
        const n = x + 1;
        if (n >= 30) {
          setAlive(false);
          onWin(100);
          fireWin();
        }
        return n;
      });
    }, 400);
    return () => clearInterval(id);
  }, [alive, liq, onWin]);

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <div className="panel-3d p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#7d92c4]">Mark price</p>
            <p className={cn("num-mono text-3xl font-extrabold", price >= entry ? "text-[#2ede8a]" : "text-[#ff5470]")}>{price.toFixed(2)}</p>
          </div>
          <TimerRing seconds={Math.max(0, 30 - t)} max={30} color="#ff5470" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="panel-inset p-2"><p className="text-[9px] text-[#7d92c4]">Liq</p><p className="num-mono text-sm font-extrabold text-[#ff5470]">{liq.toFixed(2)}</p></div>
          <div className="panel-inset p-2"><p className="text-[9px] text-[#7d92c4]">PnL</p><p className={cn("num-mono text-sm font-extrabold", pnl >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{pnl.toFixed(1)}</p></div>
          <div className="panel-inset p-2"><p className="text-[9px] text-[#7d92c4]">Buffer</p><p className="num-mono text-sm font-extrabold text-white">{dist.toFixed(2)}%</p></div>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-[10px] font-extrabold text-[#7d92c4]">Leverage ×{lev}</p>
          <input type="range" min={2} max={50} value={lev} onChange={e => setLev(+e.target.value)} className="lever w-full" style={{ ["--fill" as string]: `${(lev / 50) * 100}%` }} disabled={alive} />
        </div>
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-extrabold text-[#7d92c4]">Add margin ${margin}</p>
          <input type="range" min={50} max={500} step={10} value={margin} onChange={e => setMargin(+e.target.value)} className="lever w-full" style={{ ["--fill" as string]: `${((margin - 50) / 450) * 100}%` }} disabled={alive} />
        </div>
        <div className="mt-4 flex gap-2">
          {!alive ? (
            <button onClick={() => { setPrice(100); setT(0); setAlive(true); sfx.whoosh(); }} className="btn3d btn3d-short flex-1 py-3.5 text-xs">Survive 30s</button>
          ) : (
            <button onClick={() => { setMargin(m => m + 50); sfx.coin(); }} className="btn3d btn3d-gold flex-1 py-3.5 text-xs">+50 margin</button>
          )}
          <button onClick={onBack} className="btn3d btn3d-ghost px-4 py-3.5 text-xs">Hub</button>
        </div>
        {/* danger meter */}
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/50">
          <motion.div className="h-full rounded-full" animate={{ width: `${Math.min(100, Math.max(0, 100 - dist * 8))}%`, backgroundColor: dist < 2 ? "#ff5470" : dist < 5 ? "#ffc531" : "#8ef23c" }} />
        </div>
      </div>
    </div>
  );
}

/* ================= COPY TRADE ================= */
function CopyTrade({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const whaleMoves = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    side: Math.random() > 0.45 ? "long" : "short" as "long" | "short",
    conf: 40 + Math.random() * 55,
    t: i,
  })), []);
  const [i, setI] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [done, setDone] = useState(false);
  const m = whaleMoves[i];

  const choose = (follow: boolean) => {
    const whaleWin = m.conf > 55 ? Math.random() > 0.35 : Math.random() > 0.55;
    const youWin = follow ? whaleWin : !whaleWin;
    const delta = (youWin ? 1 : -1) * (8 + Math.random() * 18);
    setPnl(p => p + delta);
    if (youWin) sfx.success(); else sfx.error();
    if (i + 1 >= whaleMoves.length) {
      setDone(true);
      const xp = Math.max(20, Math.round(60 + pnl + delta));
      onWin(xp);
      if (pnl + delta > 40) fireWin(); else fireSmall();
    } else setI(x => x + 1);
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      {done ? (
        <div className="py-8 text-center">
          <p className={cn("num-mono text-4xl font-extrabold", pnl >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(1)}%</p>
          <StarBurst stars={pnl > 40 ? 3 : pnl > 0 ? 2 : 1} />
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Hub</button>
        </div>
      ) : (
        <div className="panel-3d p-5">
          <div className="flex items-center justify-between">
            <Tag tone="blue">Signal {i + 1}/{whaleMoves.length}</Tag>
            <span className={cn("num-mono text-sm font-extrabold", pnl >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{pnl.toFixed(1)}%</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5b8cff]/20 text-2xl">🐋</div>
            <div>
              <p className="display text-lg font-extrabold text-white">Whale opens {m.side.toUpperCase()}</p>
              <p className="text-xs text-[#8ea6d8]">Confidence {m.conf.toFixed(0)}% · size undisclosed</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-[#5b8cff]" style={{ width: `${m.conf}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => choose(true)} className="btn3d btn3d-blue py-4 text-xs">Follow whale</button>
            <button onClick={() => choose(false)} className="btn3d btn3d-ghost py-4 text-xs">Fade whale</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SENTIMENT TUG ================= */
function Tug({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const [pos, setPos] = useState(0); // -100 bear .. 100 bull
  const [t, setT] = useState(20);
  const [live, setLive] = useState(false);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setPos(p => p + (Math.random() - 0.5) * 8 - 0.4); // slight bear drift
      setT(x => {
        if (x <= 1) {
          setLive(false);
          setPos(p => {
            if (p > 30) { onWin(75); fireWin(); }
            else fireSmall();
            return p;
          });
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [live, onWin]);

  const pull = (dir: number) => {
    if (!live) return;
    setPos(p => Math.max(-100, Math.min(100, p + dir * (6 + combo))));
    setCombo(c => c + 1);
    sfx.tap();
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <div className="panel-3d p-5">
        <div className="flex items-center justify-between">
          <Tag tone="gold">Bulls vs Bears</Tag>
          <TimerRing seconds={t} max={20} color="#ffc531" />
        </div>
        <div className="relative mt-8 h-8 overflow-hidden rounded-full border border-white/15 bg-gradient-to-r from-[#ff5470] via-[#ffc531] to-[#2ede8a]">
          <motion.div className="absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-4 border-white bg-[#081130]"
            animate={{ left: `calc(${(pos + 100) / 2}% - 20px)` }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ boxShadow: "0 0 20px #fff" }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-extrabold uppercase tracking-widest">
          <span className="text-[#ff5470]">Bears</span>
          <span className="text-white">{pos.toFixed(0)}</span>
          <span className="text-[#2ede8a]">Bulls</span>
        </div>
        <ComboMeter combo={combo} />
        {!live ? (
          <button onClick={() => { setLive(true); setPos(0); setT(20); setCombo(0); sfx.whoosh(); }} className="btn3d btn3d-gold mt-5 w-full py-3.5 text-xs">Start war</button>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onPointerDown={() => pull(-1)} className="btn3d btn3d-short py-6 text-sm">BEAR PULL</button>
            <button onPointerDown={() => pull(1)} className="btn3d btn3d-long py-6 text-sm">BULL PULL</button>
          </div>
        )}
        {!live && t === 0 && <button onClick={onBack} className="btn3d btn3d-green mt-2 w-full py-3 text-xs">Hub</button>}
      </div>
    </div>
  );
}

/* ================= CANDLE PAINTER ================= */
function Painter({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const target = { o: 40, h: 20, l: 80, c: 55 };
  const [c, setC] = useState({ o: 50, h: 30, l: 70, c: 50 });
  const score = useMemo(() => {
    const e = Math.abs(c.o - target.o) + Math.abs(c.h - target.h) + Math.abs(c.l - target.l) + Math.abs(c.c - target.c);
    return Math.max(0, Math.round(100 - e * 0.7));
  }, [c]);

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel-inset flex h-[220px] items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-[180px]">
            {/* target ghost */}
            <line x1="40" x2="40" y1={target.h} y2={target.l} stroke="#ffc531" strokeWidth="2" strokeDasharray="4 3" opacity=".6" />
            <rect x="32" y={Math.min(target.o, target.c)} width="16" height={Math.max(4, Math.abs(target.o - target.c))} fill="#ffc531" opacity=".35" rx="2" />
            {/* user */}
            <line x1="80" x2="80" y1={c.h} y2={c.l} stroke={c.c >= c.o ? "#2ede8a" : "#ff5470"} strokeWidth="3" />
            <rect x="72" y={Math.min(c.o, c.c)} width="16" height={Math.max(4, Math.abs(c.o - c.c))} fill={c.c >= c.o ? "#2ede8a" : "#ff5470"} rx="2" />
          </svg>
        </div>
        <div className="space-y-2">
          {(["o", "h", "l", "c"] as const).map(k => (
            <label key={k} className="block text-[10px] font-extrabold uppercase text-[#7d92c4]">
              {k.toUpperCase()} {c[k]}
              <input type="range" min={5} max={100} value={c[k]} onChange={e => setC(v => ({ ...v, [k]: +e.target.value }))} className="lever mt-1 w-full" style={{ ["--fill" as string]: `${c[k]}%` }} />
            </label>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="num-mono text-2xl font-extrabold text-white">{score}</span>
            <button onClick={() => { onWin(Math.round(score * 0.9)); if (score >= 80) fireWin(); else fireSmall(); onBack(); }} className="btn3d btn3d-green px-5 py-2.5 text-xs">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PIPELINE BUILDER ================= */
function Pipeline({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const blocks = ["Signal", "Filter", "Risk %", "Entry", "SL/TP", "Exit"];
  const correct = blocks;
  const [pipe, setPipe] = useState<string[]>([]);
  const [pool, setPool] = useState(() => [...blocks].sort(() => Math.random() - 0.5));

  const add = (b: string) => {
    setPipe(p => [...p, b]);
    setPool(p => p.filter(x => x !== b));
    sfx.tick();
  };
  const undo = () => {
    if (!pipe.length) return;
    const last = pipe[pipe.length - 1];
    setPipe(p => p.slice(0, -1));
    setPool(p => [...p, last]);
    sfx.soft();
  };
  const check = () => {
    const ok = pipe.length === correct.length && pipe.every((b, i) => b === correct[i]);
    if (ok) { onWin(110); fireWin(); }
    else sfx.error();
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <p className="mb-2 text-xs text-[#aebde6]">Собери пайплайн стратегии в правильном порядке</p>
      <div className="panel-inset mb-4 flex min-h-[64px] flex-wrap items-center gap-2 p-3">
        {pipe.length === 0 && <span className="text-[11px] text-[#54678f]">Drop blocks here…</span>}
        {pipe.map((b, i) => (
          <motion.span key={b} layout className="rounded-xl bg-[#8ef23c] px-3 py-1.5 text-[11px] font-extrabold text-[#0a2210]">
            {i + 1}. {b}
          </motion.span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map(b => (
          <button key={b} onClick={() => add(b)} className="btn3d btn3d-ghost px-3 py-2 text-[11px]">{b}</button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={undo} className="btn3d btn3d-ghost px-4 py-3 text-xs">Undo</button>
        <button onClick={check} className="btn3d btn3d-violet flex-1 py-3 text-xs">Run bot check</button>
      </div>
    </div>
  );
}

/* ================= RAID BOSS ================= */
function Raid({ onBack, onWin }: { onBack: () => void; onWin: (xp: number) => void }) {
  const [hp, setHp] = useState(500);
  const [combo, setCombo] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const allies = [
    { n: "You", c: "#8ef23c" }, { n: "CQ", c: "#ff5470" }, { n: "HM", c: "#ffc531" }, { n: "SF", c: "#5b8cff" },
  ];

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => {
      // allies auto DPS
      setHp(h => {
        const n = Math.max(0, h - (4 + Math.random() * 6));
        if (n <= 0) { setOver(true); onWin(140); fireWin(); }
        return n;
      });
      setEnergy(e => Math.min(100, e + 5));
    }, 800);
    return () => clearInterval(id);
  }, [over, onWin]);

  const skill = (type: "tap" | "ult") => {
    if (over) return;
    if (type === "ult" && energy < 100) { sfx.error(); return; }
    const dmg = type === "ult" ? 80 + combo * 5 : 12 + combo * 2;
    setHp(h => {
      const n = Math.max(0, h - dmg);
      if (n <= 0) { setOver(true); onWin(140); fireWin(); }
      return n;
    });
    setCombo(c => c + 1);
    if (type === "ult") setEnergy(0);
    setLog(l => [`${type === "ult" ? "ULT" : "TAP"} −${dmg}`, ...l].slice(0, 5));
    sfx.success();
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Hub</button>
      <div className="panel-3d relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,140,0,.25),transparent_50%)]" />
        <BossHp hp={hp} max={500} name="Guild Raid · Volatility Hydra" color="#ff8b3d" />
        <div className="my-4 flex justify-center gap-2">
          {allies.map(a => (
            <div key={a.n} className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-[10px] font-black" style={{ borderColor: a.c, color: a.c, background: `${a.c}22` }}>{a.n.slice(0, 2)}</div>
          ))}
        </div>
        <motion.div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-[#ff8b3d] text-4xl"
          animate={{ rotate: [0, 5, -5, 0], scale: over ? 0 : 1 }} style={{ boxShadow: "0 0 40px #ff8b3d88" }}>🐙</motion.div>
        <div className="mt-3 flex items-center justify-between">
          <ComboMeter combo={combo} />
          <div className="h-2 w-32 overflow-hidden rounded-full bg-black/50"><motion.div className="h-full bg-[#a78bff]" animate={{ width: `${energy}%` }} /></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => skill("tap")} className="btn3d btn3d-gold py-4 text-xs">Tap DPS</button>
          <button onClick={() => skill("ult")} className="btn3d btn3d-violet py-4 text-xs">ULT (100)</button>
        </div>
        <div className="mt-3 space-y-1">{log.map((l, i) => <p key={i} className="text-[10px] font-bold text-[#8ea6d8]">{l}</p>)}</div>
        {over && <button onClick={onBack} className="btn3d btn3d-green mt-3 w-full py-3 text-xs">Hub · Victory</button>}
      </div>
    </div>
  );
}

/* ================= MAIN ================= */
export default function GameModesPro({ onXp, onGems, toast }: Props) {
  const [mode, setMode] = useState<Mode>("hub");
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const win = (xp: number, gems = 0) => {
    onXp(xp); if (gems) onGems(gems);
    setRewards([{ type: "xp", amount: xp }, ...(gems ? [{ type: "gem" as const, amount: gems }] : [])]);
    setRewardOpen(true);
    toast(`+${xp} XP`, gems ? `+${gems} gems` : "Mode complete", "gold");
  };

  return (
    <GameSection id="modes-pro" index="21" kicker="Game Modes Pro" title="Ещё 8 тяжёлых режимов"
      desc="Ритм-игра по свечам, пазл стакана, выживание у ликвидации, copy-trade, перетягивание sentiment, рисование OHLC, сборка пайплайна и рейд-босс гильдии."
      right={<div className="flex gap-2"><Tag tone="red">arcade</Tag><Tag tone="gold">co-op raid</Tag></div>}>

      <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 py-3">
        <VelocityMarquee baseVelocity={-3}>
          {["RHYTHM", "·", "ORDER BOOK", "·", "LIQUIDATION", "·", "WHALE", "·", "SENTIMENT", "·", "PAINTER", "·", "PIPELINE", "·", "RAID", "·"].map((w, i) => (
            <span key={i} className={cn("display text-3xl font-extrabold", w === "·" ? "text-[#8ef23c]" : "text-white/80")}>{w}</span>
          ))}
        </VelocityMarquee>
      </div>

      {mode !== "hub" && (
        <button onClick={() => setMode("hub")} className="btn3d btn3d-ghost mb-4 px-4 py-2 text-[11px]">← All pro modes</button>
      )}

      <AnimatePresence mode="wait">
        {mode === "hub" ? (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <PressTile onPress={() => { setMode(m.id); sfx.pop(); }} color={m.c} className="min-h-[130px]">
                  <m.icon size={28} style={{ color: m.c }} />
                  <p className="display mt-3 text-sm font-extrabold text-white">{m.t}</p>
                  <p className="text-[11px] text-[#aebde6]">{m.s}</p>
                  <p className="mt-2 text-[10px] font-extrabold text-[#8ef23c]">+{m.xp} XP</p>
                </PressTile>
              </Reveal>
            ))}
          </motion.div>
        ) : (
          <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel-3d p-5">
            {mode === "rhythm" && <Rhythm onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "ob-puzzle" && <ObPuzzle onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "liq-survivor" && <LiqSurvivor onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "copytrade" && <CopyTrade onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "tug" && <Tug onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "painter" && <Painter onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "pipeline" && <Pipeline onBack={() => setMode("hub")} onWin={(x) => win(x)} />}
            {mode === "raid" && <Raid onBack={() => setMode("hub")} onWin={(x) => win(x, 30)} />}
          </motion.div>
        )}
      </AnimatePresence>

      <RewardBurst open={rewardOpen} rewards={rewards} onClose={() => setRewardOpen(false)} />
    </GameSection>
  );
}
