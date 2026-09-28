import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { Device, StatusBar, GameButton } from "./Device";
import { Mascot, Bubble, type Mood } from "./Mascot";
import { ART, type ArtKey, HeartArt, BoltArt, TrophyArt } from "./art";
import { sfx, Confetti, Shake, Pop } from "./Juice";
import { Tile } from "./LessonPlayer";

/* ================================================================== */
/*  LESSON PLAYER PLUS — 8 advanced exercise types                      */
/*  trendline draw · orderbook snipe · memory flip · typing ·           */
/*  sorting · speed tap · pattern build · range guess                   */
/* ================================================================== */

type ReadyFn = (ready: boolean, correct: boolean) => void;
type Phase = "answering" | "correct" | "wrong";

type LPEx =
  | { kind: "trendline"; title: string; say: string; pts: number[]; answer: [number, number]; explain: string }
  | { kind: "orderbook"; title: string; say: string; rows: { p: number; s: number; side: "b" | "a" }[]; answer: number; explain: string }
  | { kind: "memory"; title: string; say: string; deck: ArtKey[]; explain: string }
  | { kind: "typing"; title: string; say: string; word: string; hint: string; explain: string }
  | { kind: "sorting"; title: string; say: string; items: { t: string; v: number }[]; explain: string }
  | { kind: "speedtap"; title: string; say: string; target: number; time: number; explain: string }
  | { kind: "pattern"; title: string; say: string; options: { t: string; c: string[] }[]; answer: number; explain: string }
  | { kind: "range"; title: string; say: string; min: number; max: number; answer: [number, number]; explain: string };

const LP_LESSON: LPEx[] = [
  {
    kind: "trendline",
    title: "Draw the uptrend support line",
    say: "Connect at least two swing lows.",
    pts: [62, 58, 64, 60, 55, 61, 57, 52, 59, 55, 50, 57, 53, 60, 56, 62],
    answer: [4, 10],
    explain: "The lows at bars 5 and 11 define the rising support trend.",
  },
  {
    kind: "orderbook",
    title: "Tap the spoof wall",
    say: "One giant fake order is bluffing. Find it.",
    rows: [
      { p: 512.4, s: 0.42, side: "a" },
      { p: 511.8, s: 1.12, side: "a" },
      { p: 511.2, s: 0.85, side: "a" },
      { p: 510.6, s: 48.5, side: "a" },
      { p: 509.9, s: 0.66, side: "b" },
      { p: 509.3, s: 1.9, side: "b" },
      { p: 508.7, s: 0.54, side: "b" },
      { p: 508.1, s: 2.3, side: "b" },
    ],
    answer: 3,
    explain: "48.5 BTC on the ask — 20× the average size. Classic spoof wall.",
  },
  {
    kind: "memory",
    title: "Match the pattern pairs",
    say: "Flip cards — find all 4 pairs.",
    deck: ["candle", "shield", "rocket", "gem"],
    explain: "Repetition builds pattern memory. Nice recall!",
  },
  {
    kind: "typing",
    title: "Type the term",
    say: "Stop ___ — the automatic exit.",
    word: "LOSS",
    hint: "4 letters · opposite of profit",
    explain: "Stop-LOSS: your automatic exit when wrong.",
  },
  {
    kind: "sorting",
    title: "Sort by risk: low → high",
    say: "Tap in order from safest to riskiest.",
    items: [
      { t: "Spot BTC", v: 1 },
      { t: "Staking ETH", v: 2 },
      { t: "Margin ×3", v: 3 },
      { t: "Futures ×20", v: 4 },
    ],
    explain: "Spot < staking < margin < high-leverage futures.",
  },
  {
    kind: "speedtap",
    title: "Tap every GREEN candle",
    say: "10 seconds — ignore the red!",
    target: 12,
    time: 10,
    explain: "Speed + selectivity = scalper reflexes.",
  },
  {
    kind: "pattern",
    title: "Which is a Head & Shoulders?",
    say: "One chart shows distribution. Pick it.",
    options: [
      { t: "A", c: ["#2be08a", "#2be08a", "#2be08a"] },
      { t: "B", c: ["#2be08a", "#ffc24b", "#ff4d6a"] },
      { t: "C", c: ["#ff4d6a", "#ff4d6a", "#ff4d6a"] },
    ],
    answer: 1,
    explain: "B: left shoulder, higher head, right shoulder — then breakdown.",
  },
  {
    kind: "range",
    title: "Mark the consolidation range",
    say: "Drag both handles to box the chop.",
    min: 0,
    max: 100,
    answer: [34, 68],
    explain: "Price chopped between 34–68 before the breakout.",
  },
];

const LP_META: Record<LPEx["kind"], { l: string; c: string }> = {
  trendline: { l: "Trendline draw", c: "#2be08a" },
  orderbook: { l: "Orderbook snipe", c: "#ff4d6a" },
  memory: { l: "Memory flip", c: "#9b6bff" },
  typing: { l: "Typing", c: "#38e1ff" },
  sorting: { l: "Risk sort", c: "#ffc24b" },
  speedtap: { l: "Speed tap", c: "#ffb347" },
  pattern: { l: "Pattern pick", c: "#9b6bff" },
  range: { l: "Range box", c: "#38e1ff" },
};

/* ================================================================== */
/*  01 TRENDLINE — tap two swing points                                 */
/* ================================================================== */
function TrendlineEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "trendline" }>; phase: Phase; onReady: ReadyFn }) {
  const [picks, setPicks] = useState<number[]>([]);
  const W = 300;
  const H = 220;
  const max = Math.max(...ex.pts);
  const min = Math.min(...ex.pts);
  const X = (i: number) => 14 + (i / (ex.pts.length - 1)) * (W - 28);
  const Y = (v: number) => H - 14 - ((v - min) / (max - min)) * (H - 28);
  const ok = picks.length === 2 && [...picks].sort().join() === [...ex.answer].sort().join();
  const tap = (i: number) => {
    if (phase !== "answering") return;
    const n = picks.includes(i) ? picks.filter((p) => p !== i) : [...picks, i].slice(-2);
    setPicks(n);
    sfx("select");
    onReady(n.length === 2, [...n].sort().join() === [...ex.answer].sort().join());
  };
  const show = picks.length === 2 ? picks : [...picks, ...ex.answer].slice(0, 0);
  void show;
  const line = picks.length === 2 ? picks : phase !== "answering" ? [...ex.answer] : null;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c]">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(120,160,240,.08)" strokeDasharray="4 4" />
        ))}
        <polyline points={ex.pts.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="#a3b1d2" strokeWidth="2.5" strokeLinejoin="round" />
        {ex.pts.map((v, i) => {
          const sel = picks.includes(i);
          const isAns = phase !== "answering" && (ex.answer as number[]).includes(i);
          return (
            <g key={i} onClick={() => tap(i)} style={{ cursor: phase === "answering" ? "pointer" : "default" }}>
              <circle cx={X(i)} cy={Y(v)} r="13" fill="transparent" />
              <motion.circle cx={X(i)} cy={Y(v)} r={sel || isAns ? 9 : 5.5} fill={isAns ? "#2be08a" : sel ? "var(--accent)" : "#22355e"} stroke={isAns ? "#2be08a" : sel ? "var(--accent)" : "#3d4d73"} strokeWidth="2" animate={sel ? { scale: [1, 1.3, 1] } : {}} />
              <text x={X(i)} y={H - 2} textAnchor="middle" fontSize="7" fill="#3d4d73" fontFamily="JetBrains Mono, monospace">{i + 1}</text>
            </g>
          );
        })}
        {line && (
          <motion.line x1={X(line[0])} y1={Y(ex.pts[line[0]])} x2={X(line[1])} y2={Y(ex.pts[line[1]])} stroke={phase === "answering" ? "var(--accent)" : ok ? "#2be08a" : "#ff4d6a"} strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
        )}
      </svg>
      <div className="mt-2 text-center font-mono text-[9px] uppercase tracking-widest text-ink-500">
        {picks.length === 0 ? "tap the first swing low" : picks.length === 1 ? "tap the second swing low" : ok || phase === "answering" ? "line drawn — check it!" : "line drawn"}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  02 ORDERBOOK SNIPE                                                  */
/* ================================================================== */
function OrderbookEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "orderbook" }>; phase: Phase; onReady: ReadyFn }) {
  const [pick, setPick] = useState<number | null>(null);
  const maxS = Math.max(...ex.rows.map((r) => r.s));
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c]">
      <div className="grid grid-cols-3 gap-1 bg-[#0d1528] px-3 py-2 font-mono text-[8px] uppercase tracking-widest text-ink-500">
        <span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span>
      </div>
      {ex.rows.map((r, i) => {
        const sel = pick === i;
        const revealed = phase !== "answering";
        const isAns = ex.answer === i;
        return (
          <button
            key={i}
            type="button"
            disabled={phase !== "answering"}
            onClick={() => {
              setPick(i);
              sfx("select");
              onReady(true, i === ex.answer);
            }}
            className="relative grid w-full grid-cols-3 gap-1 px-3 py-[9px] text-left font-mono text-[11px] transition-colors hover:bg-white/5"
            style={{ background: revealed && isAns ? "rgba(43,224,138,.12)" : sel && !revealed ? "color-mix(in srgb, var(--accent) 12%, transparent)" : revealed && sel ? "rgba(255,77,106,.12)" : undefined }}
          >
            <motion.span animate={{ width: `${(r.s / maxS) * 100}%` }} className="absolute inset-y-0 right-0" style={{ background: r.side === "a" ? "rgba(255,77,106,.14)" : "rgba(43,224,138,.14)" }} />
            <span className={cn("relative tnum font-bold", r.side === "a" ? "text-bear" : "text-bull")}>{r.p.toFixed(1)}</span>
            <span className={cn("relative tnum text-right font-black", r.s > 10 ? "text-gold" : "text-ink-200")}>{r.s.toFixed(2)}</span>
            <span className="relative tnum text-right text-ink-400">{(r.p * r.s).toFixed(0)}</span>
            {revealed && isAns && <Icon name="check" size={13} strokeWidth={4} className="absolute left-1 top-1/2 -translate-y-1/2 text-bull" />}
          </button>
        );
      })}
      <div className="bg-[#0d1528] px-3 py-2 text-center font-mono text-[8.5px] uppercase tracking-widest text-ink-500">spread 0.7 · depth 12.4 BTC</div>
    </div>
  );
}

/* ================================================================== */
/*  03 MEMORY                                                           */
/* ================================================================== */
function MemoryEx({ ex, onReady }: { ex: Extract<LPEx, { kind: "memory" }>; onReady: ReadyFn }) {
  const deck = useMemo(() => {
    const d = [...ex.deck, ...ex.deck].map((a, i) => ({ a, k: i }));
    // deterministic shuffle
    let s = 13;
    for (let i = d.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }, [ex]);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const flip = (i: number) => {
    if (open.includes(i) || done.includes(i) || open.length >= 2) return;
    const n = [...open, i];
    setOpen(n);
    sfx("select");
    if (n.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = n;
      if (deck[a].a === deck[b].a) {
        sfx("correct", false);
        setTimeout(() => {
          const nd = [...done, a, b];
          setDone(nd);
          setOpen([]);
          if (nd.length === deck.length) onReady(true, moves + 1 <= 8);
        }, 420);
      } else {
        sfx("wrong", false);
        setTimeout(() => setOpen([]), 650);
      }
    }
  };
  return (
    <div>
      <div className="mb-2 flex justify-between font-mono text-[9px] uppercase tracking-widest text-ink-500">
        <span>moves: {moves}</span>
        <span>{done.length / 2}/{deck.length / 2} pairs</span>
      </div>
      <div className="grid grid-cols-4 gap-2" style={{ perspective: 700 }}>
        {deck.map((card, i) => {
          const up = open.includes(i) || done.includes(i);
          const A = ART[card.a];
          return (
            <motion.button
              key={card.k}
              type="button"
              onClick={() => flip(i)}
              className="relative aspect-[3/4]"
              style={{ transformStyle: "preserve-3d" }}
              whileTap={{ scale: 0.94 }}
            >
              <motion.div className="absolute inset-0" animate={{ rotateY: up ? 180 : 0 }} transition={{ duration: 0.4 }} style={{ transformStyle: "preserve-3d" }}>
                <div className="backface-hidden absolute inset-0 grid place-items-center rounded-xl border-2 border-[#2a3f73]" style={{ background: "repeating-linear-gradient(45deg,#16223f 0 8px,#101a33 8px 16px)", boxShadow: "0 3px 0 #0a1328" }}>
                  <span className="font-[family-name:var(--font-display)] text-[18px] font-bold text-[#3d4d73]">?</span>
                </div>
                <div className="backface-hidden absolute inset-0 grid place-items-center rounded-xl border-2" style={{ transform: "rotateY(180deg)", borderColor: done.includes(i) ? "#2be08a" : "#26396a", background: done.includes(i) ? "rgba(43,224,138,.12)" : "#111c36", boxShadow: "0 3px 0 #0a1328" }}>
                  <A size={38} className={done.includes(i) ? "" : ""} />
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  04 TYPING                                                           */
/* ================================================================== */
function TypingEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "typing" }>; phase: Phase; onReady: ReadyFn }) {
  const [val, setVal] = useState("");
  const ok = val.toUpperCase() === ex.word;
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 pt-2" onClick={() => input.current?.focus()}>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500">{ex.hint}</div>
      <div className="flex gap-2">
        {ex.word.split("").map((ch, i) => {
          const typed = val[i]?.toUpperCase();
          const good = typed === ch;
          const filled = !!typed;
          return (
            <motion.span
              key={i}
              animate={filled ? { y: [0, -6, 0] } : {}}
              className="grid h-[58px] w-[46px] place-items-center rounded-2xl border-2 font-mono text-[26px] font-black"
              style={{
                borderColor: phase !== "answering" ? (ok ? "#2be08a" : "#ff4d6a") : filled ? (good ? "var(--accent)" : "#ff4d6a") : "#22355e",
                background: "#0b1428",
                color: filled ? (good || phase === "answering" ? "#fff" : "#ff4d6a") : "#3d4d73",
                boxShadow: "0 4px 0 #0a1328, inset 0 3px 6px rgba(0,0,0,.5)",
              }}
            >
              {typed ?? ""}
              {!filled && i === val.length && phase === "answering" && (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute h-7 w-[3px] rounded-full" style={{ background: "var(--accent)" }} />
              )}
            </motion.span>
          );
        })}
      </div>
      <input
        ref={input}
        value={val}
        disabled={phase !== "answering"}
        onChange={(e) => {
          const v = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, ex.word.length);
          setVal(v);
          sfx("tick", false);
          onReady(v.length === ex.word.length, v.toUpperCase() === ex.word);
        }}
        className="h-0 w-0 opacity-0"
        aria-label="Type the answer"
      />
      <div className="grid w-full grid-cols-7 gap-1">
        {"ABCDEFGHILMNOPRSTU".split("").map((k) => (
          <button
            key={k}
            type="button"
            disabled={phase !== "answering"}
            onClick={() => {
              if (val.length >= ex.word.length) return;
              const v = (val + k).slice(0, ex.word.length);
              setVal(v);
              sfx("tick", false);
              onReady(v.length === ex.word.length, v.toUpperCase() === ex.word);
            }}
            className="rounded-lg border-2 border-[#22355e] bg-[#101a33] py-2 font-mono text-[12px] font-black text-ink-200 active:translate-y-[2px]"
            style={{ boxShadow: "0 3px 0 #0a1328" }}
          >
            {k}
          </button>
        ))}
        <button type="button" disabled={phase !== "answering"} onClick={() => setVal((v) => v.slice(0, -1))} className="col-span-2 rounded-lg border-2 border-[#22355e] bg-[#101a33] py-2 font-mono text-[12px] font-black text-bear" style={{ boxShadow: "0 3px 0 #0a1328" }}>⌫</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  05 SORTING                                                          */
/* ================================================================== */
function SortingEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "sorting" }>; phase: Phase; onReady: ReadyFn }) {
  const [order, setOrder] = useState<number[]>([]);
  const correct = [...ex.items].sort((a, b) => a.v - b.v).map((x) => ex.items.indexOf(x));
  const tap = (i: number) => {
    if (phase !== "answering" || order.includes(i)) return;
    const n = [...order, i];
    setOrder(n);
    sfx("select");
    if (n.length === ex.items.length) onReady(true, n.join() === correct.join());
    else onReady(false, false);
  };
  const undo = () => {
    setOrder((o) => o.slice(0, -1));
    sfx("pop", false);
  };
  return (
    <div className="space-y-3">
      <div className="flex min-h-[52px] items-center gap-1.5 rounded-2xl border-2 border-dashed border-[#26396a] p-2">
        {order.length === 0 && <span className="w-full text-center font-mono text-[9px] uppercase tracking-widest text-ink-500">tap cards in order</span>}
        {order.map((i, k) => {
          const right = correct[k] === i;
          return (
            <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 rounded-lg px-2 py-1.5 font-mono text-[10px] font-black" style={{ background: phase === "answering" ? "#14203e" : right ? "rgba(43,224,138,.16)" : "rgba(255,77,106,.16)", color: phase === "answering" ? "#fff" : right ? "#2be08a" : "#ff4d6a" }}>
              <span className="opacity-60">{k + 1}.</span> {ex.items[i].t}
            </motion.span>
          );
        })}
        {order.length > 0 && phase === "answering" && (
          <button type="button" onClick={undo} className="ml-auto font-mono text-[9px] uppercase text-ink-400 hover:text-white">undo</button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ex.items.map((it, i) => {
          const used = order.includes(i);
          const rank = order.indexOf(i);
          return (
            <Tile key={it.t} state={used ? "faded" : "idle"} disabled={used || phase !== "answering"} onClick={() => tap(i)} className="relative h-[64px] px-2 text-[13px]">
              {rank >= 0 && <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-md font-mono text-[9px]" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>{rank + 1}</span>}
              {it.t}
            </Tile>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  06 SPEED TAP                                                        */
/* ================================================================== */
function SpeedtapEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "speedtap" }>; phase: Phase; onReady: ReadyFn }) {
  const [cells, setCells] = useState<{ up: boolean; id: number }[]>(() => Array.from({ length: 12 }, (_, i) => ({ up: false, id: i })));
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [left, setLeft] = useState(ex.time);
  const [run, setRun] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    if (!run || phase !== "answering") return;
    if (left <= 0) {
      if (!done.current) {
        done.current = true;
        onReady(true, hits >= ex.target);
      }
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [run, left, phase, hits, ex.target, onReady]);
  useEffect(() => {
    if (!run || left <= 0 || phase !== "answering") return;
    const id = setInterval(() => {
      setCells((cs) => {
        const n = cs.map((c) => ({ ...c, up: false }));
        const k = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < k; i++) {
          const idx = Math.floor(Math.random() * n.length);
          n[idx] = { ...n[idx], up: Math.random() > 0.35 };
        }
        return n;
      });
    }, 620);
    return () => clearInterval(id);
  }, [run, left, phase]);
  const tap = (i: number) => {
    if (!run || left <= 0 || phase !== "answering") return;
    if (cells[i].up) {
      setHits((h) => h + 1);
      sfx("coin", false);
      setCells((cs) => cs.map((c, k) => (k === i ? { ...c, up: false } : c)));
    } else {
      setMiss((m) => m + 1);
      sfx("wrong", false);
    }
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#0a1122]">
          <motion.div animate={{ width: `${(left / ex.time) * 100}%` }} className="h-full rounded-full" style={{ background: left < 4 ? "#ff4d6a" : "var(--accent)" }} />
        </div>
        <span className="tnum font-mono text-[13px] font-black text-white">{left}s</span>
        <span className="font-mono text-[11px] font-black text-bull">{hits}/{ex.target}</span>
        <span className="font-mono text-[10px] text-bear">✗{miss}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => tap(i)}
            animate={c.up ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            className="grid aspect-square place-items-center rounded-2xl border-2"
            style={{
              borderColor: c.up ? "#2be08a" : "#1c2c52",
              background: c.up ? "linear-gradient(180deg,#1d5c3f,#0e2e20)" : "#0d1528",
              boxShadow: c.up ? "0 0 18px -4px #2be08a, 0 3px 0 #0a1328" : "0 3px 0 #070d1c",
            }}
          >
            {c.up && <span className="h-8 w-4 rounded" style={{ background: "linear-gradient(180deg,#5cf0ab,#2be08a)", boxShadow: "0 0 12px #2be08a" }} />}
          </motion.button>
        ))}
      </div>
      {!run && (
        <div className="mt-3">
          <GameButton onClick={() => { setRun(true); sfx("go"); }}>Start timer</GameButton>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  07 PATTERN PICK                                                     */
/* ================================================================== */
function PatternEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "pattern" }>; phase: Phase; onReady: ReadyFn }) {
  const [sel, setSel] = useState<number | null>(null);
  const humps = (cols: string[], seed: number) => {
    const hs = [34 + ((seed * 13) % 20), 58 + ((seed * 7) % 18), 34 + ((seed * 11) % 20)];
    return hs.map((h, i) => ({ h, c: cols[i % cols.length] }));
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {ex.options.map((o, i) => {
        const st = phase !== "answering" ? (i === ex.answer ? "correct" : i === sel ? "wrong" : "faded") : sel === i ? "selected" : "idle";
        return (
          <Tile key={o.t} state={st} disabled={phase !== "answering"} onClick={() => { setSel(i); sfx("select"); onReady(true, i === ex.answer); }} className="flex flex-col items-center gap-1 px-1 py-3">
            <svg viewBox="0 0 80 60" className="h-[74px] w-full">
              <line x1={4} x2={76} y1={50} y2={50} stroke="rgba(160,190,255,.3)" strokeDasharray="3 3" />
              {humps(o.c, i + 2).map((b, k) => (
                <g key={k}>
                  <rect x={8 + k * 23} y={50 - b.h} width={17} height={b.h} rx={3} fill={b.c} opacity={phase !== "answering" && i !== ex.answer && i === sel ? 0.4 : 1} />
                  <rect x={10 + k * 23} y={52 - b.h} width={4} height={b.h - 4} rx={2} fill="#fff" opacity=".3" />
                </g>
              ))}
            </svg>
            <span className="font-mono text-[13px] font-black">{o.t}</span>
          </Tile>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  08 RANGE BOX — dual handle slider                                   */
/* ================================================================== */
function RangeEx({ ex, phase, onReady }: { ex: Extract<LPEx, { kind: "range" }>; phase: Phase; onReady: ReadyFn }) {
  const [lo, setLo] = useState(20);
  const [hi, setHi] = useState(82);
  const [drag, setDrag] = useState<"lo" | "hi" | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const ok = Math.abs(lo - ex.answer[0]) <= 8 && Math.abs(hi - ex.answer[1]) <= 8;
  const toVal = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => {
      const v = toVal(e.clientX);
      if (drag === "lo") setLo(Math.min(v, hi - 4));
      else setHi(Math.max(v, lo + 4));
    };
    const up = () => {
      setDrag(null);
      const good = Math.abs((drag === "lo" ? lo : lo) - ex.answer[0]) <= 8 && Math.abs((drag === "hi" ? hi : hi) - ex.answer[1]) <= 8;
      void good;
      onReady(true, Math.abs(lo - ex.answer[0]) <= 8 && Math.abs(hi - ex.answer[1]) <= 8);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, lo, hi]);
  // fake price path for backdrop
  const path = useMemo(() => {
    const pts: number[] = [];
    let v = 50;
    for (let i = 0; i < 60; i++) {
      v += (Math.random() - 0.5) * 10;
      v = Math.max(18, Math.min(86, v));
      if (i > 14 && i < 44) v = 40 + Math.sin(i / 3) * 10 + (Math.random() - 0.5) * 4;
      pts.push(v);
    }
    return pts;
  }, []);
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-2">
        <svg viewBox="0 0 300 150" className="h-[150px] w-full">
          <polyline points={path.map((v, i) => `${(i / 59) * 300},${150 - v * 1.4}`).join(" ")} fill="none" stroke="#a3b1d2" strokeWidth="2" />
          {phase !== "answering" && (
            <rect x={40} y={150 - ex.answer[1] * 1.4} width={220} height={(ex.answer[1] - ex.answer[0]) * 1.4} fill="rgba(43,224,138,.12)" stroke="#2be08a" strokeDasharray="5 4" />
          )}
        </svg>
        <div ref={track} className="absolute inset-x-2 top-2 h-[150px] touch-none select-none">
          <div className="absolute inset-x-0 rounded-lg border-2" style={{ top: `${100 - hi}%`, bottom: `${lo}%`, borderColor: phase === "answering" ? "var(--accent)" : ok ? "#2be08a" : "#ff4d6a", background: "color-mix(in srgb, var(--accent) 10%, transparent)" }} />
          {(["hi", "lo"] as const).map((h) => (
            <div
              key={h}
              onPointerDown={(e) => {
                if (phase !== "answering") return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag(h);
                sfx("select", false);
              }}
              className="absolute inset-x-0 flex cursor-ns-resize justify-center"
              style={{ top: h === "hi" ? `calc(${100 - hi}% - 11px)` : undefined, bottom: h === "lo" ? `calc(${lo}% - 11px)` : undefined }}
            >
              <span className="grid h-[22px] w-[64px] place-items-center rounded-full font-mono text-[9px] font-black" style={{ background: "var(--accent)", color: "var(--accent-ink)", boxShadow: "0 3px 0 var(--accent-edge)" }}>
                {h === "hi" ? hi : lo}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center font-mono text-[9px] uppercase tracking-widest text-ink-500">
        drag handles · box the chop · tolerance ±8
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PLAYER SHELL                                                        */
/* ================================================================== */
type Screen = "intro" | "play" | "result" | "fail";

export default function LessonPlus() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [ready, setReady] = useState(false);
  const correctRef = useRef(false);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [right, setRight] = useState(0);
  const [shake, setShake] = useState(0);
  const [conf, setConf] = useState(0);
  const [log, setLog] = useState<string[]>(["boot · lesson+ engine"]);

  const ex = LP_LESSON[i];
  const pushLog = (s: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-GB")} · ${s}`, ...l].slice(0, 6));
  const onReady: ReadyFn = (r, c) => {
    setReady(r);
    correctRef.current = c;
  };

  const start = (at = 0) => {
    setScreen("play");
    setI(at);
    setPhase("answering");
    setReady(false);
    setHearts(5);
    setXp(0);
    setRight(0);
    sfx("whoosh");
    pushLog(`start @ ${at + 1} (${LP_LESSON[at].kind})`);
  };

  const check = () => {
    if (!ready || phase !== "answering") return;
    if (correctRef.current) {
      setPhase("correct");
      setRight((r) => r + 1);
      setXp((x) => x + 15);
      sfx("correct");
      pushLog("✓ correct +15xp");
    } else {
      setPhase("wrong");
      setHearts((h) => h - 1);
      setShake((n) => n + 1);
      sfx("wrong");
      pushLog("✗ wrong");
    }
  };

  const next = () => {
    if (hearts <= 0) {
      setScreen("fail");
      sfx("lose");
      return;
    }
    if (i >= LP_LESSON.length - 1) {
      setScreen("result");
      setConf((c) => c + 1);
      sfx("levelup");
      return;
    }
    setI(i + 1);
    setPhase("answering");
    setReady(false);
    sfx("whoosh", false);
  };

  const progress = screen === "result" ? 1 : (i + (phase !== "answering" ? 1 : 0)) / LP_LESSON.length;
  const mood: Mood = screen === "result" ? "celebrate" : screen === "fail" ? "sad" : screen === "intro" ? "wave" : phase === "correct" ? "happy" : phase === "wrong" ? "sad" : "idle";

  return (
    <Section id="lessonplus" index="" title="Lesson Engine Plus" kicker="8 advanced drills · pro skills" count="8 exercise types">
      <Grid>
        <Cell title="Advanced Drills · Playable" spec="trendline → range box" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
            <div className="order-1 lg:order-2">
              <Device>
                <Shake trigger={shake} className="relative flex h-full flex-col">
                  <Confetti fire={conf} />
                  <StatusBar />
                  <AnimatePresence mode="wait">
                    {screen === "intro" && (
                      <motion.div key="intro" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="relative flex flex-1 flex-col items-center px-6 pb-10">
                        <Tag tone="violet">unit 7 · pro skills</Tag>
                        <h3 className="mt-3 text-center font-[family-name:var(--font-display)] text-[28px] font-bold leading-tight text-white">Chart<br />Mastery</h3>
                        <Mascot mood={mood} size={170} />
                        <Bubble text="8 pro drills. Draw, snipe, sort and survive the clock!" side="bottom" className="relative -mt-2 max-w-[260px]" />
                        <div className="relative mt-auto grid w-full grid-cols-3 gap-2">
                          {[
                            { a: <BoltArt size={24} />, v: "+120", l: "XP" },
                            { a: <HeartArt size={24} />, v: "5", l: "Lives" },
                            { a: <TrophyArt size={24} />, v: "~6m", l: "Time" },
                          ].map((s) => (
                            <div key={s.l} className="flex flex-col items-center rounded-2xl border-2 border-[#22355e] bg-[#101a33] py-2" style={{ boxShadow: "0 3px 0 #0a1328" }}>
                              {s.a}
                              <span className="font-mono text-[13px] font-black text-white">{s.v}</span>
                              <span className="font-mono text-[8px] uppercase tracking-widest text-ink-500">{s.l}</span>
                            </div>
                          ))}
                        </div>
                        <GameButton className="relative mt-4" tone="violet" onClick={() => start(0)}>Start drills</GameButton>
                      </motion.div>
                    )}
                    {screen === "play" && (
                      <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-1 flex-col">
                        <div className="flex items-center gap-3 px-4 pb-2">
                          <button type="button" onClick={() => setScreen("intro")} className="text-ink-500 hover:text-white" aria-label="Quit">
                            <Icon name="x" size={24} strokeWidth={2.6} />
                          </button>
                          <div className="relative h-[18px] flex-1 overflow-hidden rounded-full bg-[#16223f]" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.6)" }}>
                            <motion.div animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} className="relative h-full rounded-full" style={{ background: "#9b6bff" }}>
                              <span className="absolute inset-x-2 top-[3px] h-[5px] rounded-full bg-white/40" />
                            </motion.div>
                          </div>
                          <div className="flex items-center gap-1">
                            <HeartArt size={24} />
                            <Pop value={hearts} className="font-mono text-[15px] font-black text-bear" />
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div key={i} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="flex flex-1 flex-col px-4">
                            <div className="mb-1">
                              <span className="rounded-md px-1.5 py-0.5 font-mono text-[8.5px] font-black uppercase tracking-widest" style={{ color: LP_META[ex.kind].c, background: `${LP_META[ex.kind].c}1f` }}>
                                {LP_META[ex.kind].l}
                              </span>
                            </div>
                            <h4 className="font-[family-name:var(--font-display)] text-[21px] font-bold leading-tight text-white">{ex.title}</h4>
                            <div className="my-3 flex items-center gap-2">
                              <Mascot mood={mood} size={70} />
                              <Bubble text={ex.say} className="flex-1 text-[12px]" />
                            </div>
                            <div className="flex-1">
                              {ex.kind === "trendline" && <TrendlineEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "orderbook" && <OrderbookEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "memory" && <MemoryEx ex={ex} onReady={onReady} />}
                              {ex.kind === "typing" && <TypingEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "sorting" && <SortingEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "speedtap" && <SpeedtapEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "pattern" && <PatternEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "range" && <RangeEx ex={ex} phase={phase} onReady={onReady} />}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                        <div className="relative border-t-2 border-[#16223f] px-4 pb-8 pt-4">
                          <GameButton disabled={!ready} tone="violet" onClick={check}>Check</GameButton>
                          <AnimatePresence>
                            {phase !== "answering" && (
                              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl px-4 pb-8 pt-4" style={{ background: phase === "correct" ? "linear-gradient(180deg,#0f3326,#0a2219)" : "linear-gradient(180deg,#3a0f1c,#260912)" }}>
                                <div className="mb-3 flex items-start gap-3">
                                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: phase === "correct" ? "#2be08a" : "#ff4d6a", color: "#0a1226" }}>
                                    <Icon name={phase === "correct" ? "check" : "x"} size={24} strokeWidth={3.6} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className={cn("font-[family-name:var(--font-display)] text-[20px] font-bold", phase === "correct" ? "text-bull" : "text-bear")}>{phase === "correct" ? "Excellent!" : "Not quite"}</div>
                                    <p className={cn("text-[12px] font-semibold leading-snug", phase === "correct" ? "text-[#9ff0c8]" : "text-[#ffb3c0]")}>{ex.explain}</p>
                                  </div>
                                </div>
                                <GameButton tone={phase === "correct" ? "bull" : "bear"} onClick={next}>{hearts <= 0 ? "See results" : "Continue"}</GameButton>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                    {screen === "result" && (
                      <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-1 flex-col items-center px-6 pb-10">
                        <Mascot mood="celebrate" size={160} />
                        <h3 className="font-[family-name:var(--font-display)] text-[28px] font-bold text-gold">Pro drills done!</h3>
                        <div className="mt-1 font-mono text-[12px] text-ink-400">{right}/{LP_LESSON.length} correct · {xp} XP</div>
                        <GameButton className="relative mt-auto" tone="gold" onClick={() => setScreen("intro")}>Claim XP</GameButton>
                      </motion.div>
                    )}
                    {screen === "fail" && (
                      <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex flex-1 flex-col items-center px-6 pb-10 text-center">
                        <HeartArt size={110} broken />
                        <h3 className="mt-4 font-[family-name:var(--font-display)] text-[26px] font-bold text-white">Out of hearts</h3>
                        <div className="mt-auto w-full"><GameButton tone="ghost" onClick={() => setScreen("intro")}>Back</GameButton></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Shake>
              </Device>
            </div>
            <div className="order-2 space-y-3 lg:order-1">
              <div className="rounded-2xl sf-inset hairline p-3">
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">jump to drill</div>
                <div className="grid gap-1.5">
                  {LP_LESSON.map((e, k) => {
                    const active = screen === "play" && k === i;
                    return (
                      <button key={k} type="button" onClick={() => start(k)} className={cn("flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2 text-left", active ? "border-violet" : "border-[#1c2c52]")} style={{ background: active ? "rgba(155,107,255,.1)" : "#0d1528", boxShadow: "0 3px 0 #070d1c" }}>
                        <span className="font-mono text-[10px] font-black" style={{ color: LP_META[e.kind].c }}>{String(k + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[8px] font-black uppercase tracking-widest" style={{ color: LP_META[e.kind].c }}>{LP_META[e.kind].l}</div>
                          <div className="truncate text-[11.5px] font-bold text-ink-200">{e.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl sf-inset hairline p-3 font-mono text-[9.5px] leading-relaxed">
                <div className="mb-1 text-[8px] uppercase tracking-[0.2em] text-ink-500">telemetry · {screen}/{phase}</div>
                {log.map((l, k) => (
                  <div key={l + k} className={k === 0 ? "text-ink-200" : "text-ink-500"}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </Cell>
        <Cell title="Skill Coverage" spec="Bloom taxonomy" span="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="space-y-2">
            {[
              { n: "Draw & annotate", d: "Motor precision on real charts", c: "#2be08a" },
              { n: "Anomaly hunt", d: "Spot manipulation in the book", c: "#ff4d6a" },
              { n: "Recall", d: "Working memory under pressure", c: "#9b6bff" },
              { n: "Fluency", d: "Vocabulary to fingertips", c: "#38e1ff" },
              { n: "Judgement", d: "Risk ordering + calibration", c: "#ffc24b" },
              { n: "Reflex", d: "Selective attention at speed", c: "#ffb347" },
            ].map((s, k) => (
              <motion.div key={s.n} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.05 }} className="flex items-center gap-3 rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5" style={{ boxShadow: "0 3px 0 #070d1c" }}>
                <span className="h-9 w-1.5 rounded-full" style={{ background: s.c, boxShadow: `0 0 10px ${s.c}` }} />
                <div><div className="text-[13px] font-extrabold text-white">{s.n}</div><div className="text-[10.5px] text-ink-400">{s.d}</div></div>
              </motion.div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Tag tone="violet">canvas tap targets</Tag>
              <Tag tone="accent">3D flip cards</Tag>
              <Tag tone="gold">dual-handle slider</Tag>
            </div>
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
