/* ------------------------------------------------------------------
 * 12 · MINI GAMES — arcade layer of the education loop
 * Predict-the-candle · Fortune Wheel · Scratch Card · Memory Match ·
 * Slot Machine · Catch-the-Dip reaction game
 * ------------------------------------------------------------------ */
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { Clock, Gem, Gift, RotateCcw, Sparkles, Target, TrendingDown, TrendingUp, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Card, Meter, SectionShell, Tag } from "../components/ui";
import { useFloaters } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void };

/* ---------------- 1. PREDICT THE CANDLE ---------------- */
type C = { o: number; c: number; h: number; l: number };
function genHist(n: number): C[] {
  const out: C[] = []; let p = 50;
  for (let i = 0; i < n; i++) { const o = p; const c = o + (Math.random() - 0.5) * 8; out.push({ o, c, h: Math.max(o, c) + Math.random() * 3, l: Math.min(o, c) - Math.random() * 3 }); p = c; }
  return out;
}
function PredictCandle({ onXp }: { onXp: (n: number) => void }) {
  const [hist, setHist] = useState(() => genHist(14));
  const [pick, setPick] = useState<"up" | "down" | null>(null);
  const [reveal, setReveal] = useState<C | null>(null);
  const [time, setTime] = useState(5);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [combo, setCombo] = useState(0);
  const { spawn, node } = useFloaters();
  useEffect(() => {
    if (pick || reveal) return;
    if (time <= 0) { choose(Math.random() > 0.5 ? "up" : "down"); return; }
    const t = setTimeout(() => { setTime(x => x - 1); sfx.tick(); }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, pick, reveal]);
  const choose = (d: "up" | "down") => {
    if (pick) return;
    setPick(d);
    const last = hist[hist.length - 1];
    const o = last.c, c = o + (Math.random() - 0.48) * 10;
    const nc = { o, c, h: Math.max(o, c) + Math.random() * 3, l: Math.min(o, c) - Math.random() * 3 };
    setTimeout(() => {
      setReveal(nc);
      const ok = (c > o && d === "up") || (c < o && d === "down");
      if (ok) { const pts = 10 + combo * 5; setScore(s => s + pts); setCombo(x => x + 1); onXp(pts); sfx.success(); spawn(140, 60, `+${pts} XP`); }
      else { setCombo(0); sfx.error(); spawn(140, 60, "MISS", "#ff5470"); }
    }, 700);
  };
  const next = () => {
    setHist(h => [...h.slice(1), reveal!]);
    setReveal(null); setPick(null); setTime(5); setRound(r => r + 1);
  };
  const all = reveal ? [...hist, reveal] : hist;
  const min = Math.min(...all.map(c => c.l)), max = Math.max(...all.map(c => c.h));
  const y = (v: number) => 8 + (1 - (v - min) / (max - min)) * 124;
  const bw = 300 / 16;
  const ok = reveal && ((reveal.c > reveal.o && pick === "up") || (reveal.c < reveal.o && pick === "down"));
  return (
    <div className="relative">
      {node}
      <div className="mb-2 flex items-center gap-2">
        <Tag tone="blue">Round {round}</Tag>
        <Tag tone="gold"><Trophy size={11} /> {score}</Tag>
        {combo > 1 && <motion.span key={combo} initial={{ scale: 1.6 }} animate={{ scale: 1 }}><Tag tone="red">🔥 ×{combo}</Tag></motion.span>}
        <div className="ml-auto flex items-center gap-1.5">
          <Clock size={14} className={time <= 2 ? "text-[#ff5470]" : "text-[#8ea6d8]"} />
          <motion.span key={time} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className={cn("num-mono text-sm font-extrabold", time <= 2 ? "text-[#ff5470]" : "text-white")}>{pick ? "—" : `${time}s`}</motion.span>
        </div>
      </div>
      <div className="panel-inset relative overflow-hidden p-2">
        <svg viewBox="0 0 300 140" className="w-full">
          {hist.map((c, i) => {
            const up = c.c >= c.o, col = up ? "#2ede8a" : "#ff5470", x = i * bw + bw * 0.2, w = bw * 0.6;
            return <g key={i}><line x1={x + w / 2} x2={x + w / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.5" /><rect x={x} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="2" fill={col} /></g>;
          })}
          <rect x={14 * bw + 2} y="4" width={bw * 1.6} height="132" rx="6" fill="rgba(142,242,60,.07)" stroke="rgba(142,242,60,.4)" strokeDasharray="4 3" />
          {!reveal && <text x={14 * bw + bw * 0.8 + 2} y="76" textAnchor="middle" fill="#8ef23c" fontSize="22" fontWeight="900">?</text>}
          {reveal && (() => {
            const up = reveal.c >= reveal.o, col = up ? "#2ede8a" : "#ff5470", x = 14 * bw + bw * 0.4, w = bw * 0.8;
            return (
              <motion.g initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} style={{ originY: `${y(reveal.o)}px` }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
                <line x1={x + w / 2} x2={x + w / 2} y1={y(reveal.h)} y2={y(reveal.l)} stroke={col} strokeWidth="2" />
                <rect x={x} y={y(Math.max(reveal.o, reveal.c))} width={w} height={Math.max(3, Math.abs(y(reveal.o) - y(reveal.c)))} rx="2" fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
              </motion.g>
            );
          })()}
        </svg>
        {!pick && <motion.div className="absolute bottom-0 left-0 h-1 bg-[#8ef23c]" initial={{ width: "100%" }} animate={{ width: `${(time / 5) * 100}%` }} transition={{ duration: 1, ease: "linear" }} />}
      </div>
      <AnimatePresence mode="wait">
        {!reveal ? (
          <motion.div key="btns" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="mt-3 grid grid-cols-2 gap-3">
            <button disabled={!!pick} onClick={() => choose("up")} className={cn("btn3d py-4 text-sm", pick === "up" ? "btn3d-long anim-pulse-ring" : "btn3d-long")}><TrendingUp size={18} strokeWidth={3} /> Higher</button>
            <button disabled={!!pick} onClick={() => choose("down")} className="btn3d btn3d-short py-4 text-sm"><TrendingDown size={18} strokeWidth={3} /> Lower</button>
          </motion.div>
        ) : (
          <motion.div key="res" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn("mt-3 flex items-center gap-3 rounded-2xl border p-3", ok ? "border-[#2ede8a]/40 bg-[#2ede8a]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
            <p className={cn("display flex-1 text-sm font-extrabold", ok ? "text-[#2ede8a]" : "text-[#ff5470]")}>{ok ? "Прогноз верный!" : "Рынок решил иначе"}</p>
            <button onClick={next} className={cn("btn3d px-5 py-2.5 text-[11px]", ok ? "btn3d-green" : "btn3d-ghost")}>Next candle</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- 2. FORTUNE WHEEL ---------------- */
const segs = [
  { l: "50 XP", c: "#8ef23c", t: "xp", v: 50 }, { l: "10 💎", c: "#5b8cff", t: "gem", v: 10 },
  { l: "100 XP", c: "#2ede8a", t: "xp", v: 100 }, { l: "Freeze", c: "#14c8f5", t: "item", v: 0 },
  { l: "25 💎", c: "#a78bff", t: "gem", v: 25 }, { l: "20 XP", c: "#ffc531", t: "xp", v: 20 },
  { l: "JACKPOT", c: "#ff5470", t: "gem", v: 200 }, { l: "Heart", c: "#ff8b3d", t: "item", v: 0 },
];
function FortuneWheel({ onXp, onGems }: Props) {
  const rot = useMotionValue(0);
  const [spinning, setSpinning] = useState(false);
  const [res, setRes] = useState<typeof segs[number] | null>(null);
  const [spins, setSpins] = useState(3);
  const seg = 360 / segs.length;
  const lastTick = useRef(0);
  useEffect(() => rot.on("change", v => {
    const k = Math.floor(v / seg);
    if (k !== lastTick.current) { lastTick.current = k; sfx.spin(); }
  }), [rot, seg]);
  const spin = () => {
    if (spinning || spins <= 0) return;
    setSpinning(true); setRes(null); setSpins(s => s - 1);
    const idx = Math.floor(Math.random() * segs.length);
    const target = rot.get() - (rot.get() % 360) + 360 * 6 + (360 - idx * seg - seg / 2);
    animate(rot, target, { duration: 4.2, ease: [0.12, 0.8, 0.2, 1] }).then(() => {
      const s = segs[idx];
      setRes(s); setSpinning(false);
      if (s.t === "xp") onXp(s.v);
      if (s.t === "gem") onGems(s.v);
      sfx.levelUp();
      confetti({ particleCount: s.l === "JACKPOT" ? 200 : 80, spread: 90, origin: { y: 0.6 }, colors: [s.c, "#fff", "#ffc531"] });
    });
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[250px] w-[250px]">
        <div className="absolute -inset-2 rounded-full" style={{ background: "conic-gradient(from 0deg,#ffc531,#ff8b3d,#ffc531,#ff8b3d,#ffc531)", boxShadow: "0 8px 0 #8a5c00, 0 20px 40px rgba(0,0,0,.6)" }} />
        {Array.from({ length: 16 }, (_, i) => (
          <motion.span key={i} className="absolute h-2.5 w-2.5 rounded-full bg-white" style={{ left: 125 + Math.cos((i / 16) * Math.PI * 2) * 128 - 5, top: 125 + Math.sin((i / 16) * Math.PI * 2) * 128 - 5 }}
            animate={{ opacity: spinning ? [0.3, 1, 0.3] : 1 }} transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }} />
        ))}
        <motion.svg viewBox="0 0 200 200" className="relative h-full w-full" style={{ rotate: rot }}>
          {segs.map((s, i) => {
            const a0 = (i * seg - 90) * (Math.PI / 180), a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
            const x0 = 100 + Math.cos(a0) * 98, y0 = 100 + Math.sin(a0) * 98, x1 = 100 + Math.cos(a1) * 98, y1 = 100 + Math.sin(a1) * 98;
            const mid = (i + 0.5) * seg - 90;
            return (
              <g key={i}>
                <path d={`M100,100 L${x0},${y0} A98,98 0 0,1 ${x1},${y1} Z`} fill={s.c} stroke="#081130" strokeWidth="1.5" />
                <path d={`M100,100 L${x0},${y0} A98,98 0 0,1 ${x1},${y1} Z`} fill="url(#wheelShade)" />
                <text x="100" y="100" transform={`rotate(${mid + 90} 100 100) translate(0 -64)`} textAnchor="middle" fill="#081130" fontSize="11" fontWeight="900">{s.l}</text>
              </g>
            );
          })}
          <defs><radialGradient id="wheelShade"><stop offset=".3" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#000" stopOpacity=".15" /></radialGradient></defs>
        </motion.svg>
        <button onClick={spin} disabled={spinning || spins <= 0} className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/80 bg-gradient-to-b from-[#1b3773] to-[#081130] text-[11px] font-black text-white" style={{ boxShadow: "0 5px 0 #030816, 0 0 20px rgba(0,0,0,.6)" }}>
          {spinning ? "···" : "SPIN"}
        </button>
        <div className="absolute left-1/2 top-[-14px] h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-white" style={{ filter: "drop-shadow(0 3px 0 #030816)" }} />
      </div>
      <div className="mt-4 flex w-full items-center gap-2">
        <button onClick={spin} disabled={spinning || spins <= 0} className="btn3d btn3d-gold flex-1 py-3 text-xs"><Sparkles size={15} /> {spins > 0 ? `Spin (${spins} left)` : "No spins"}</button>
        <button onClick={() => { setSpins(3); sfx.coin(); }} className="btn3d btn3d-ghost px-3 py-3 text-xs"><RotateCcw size={14} /></button>
      </div>
      <AnimatePresence>
        {res && <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="display mt-3 text-lg font-extrabold" style={{ color: res.c }}>🎉 {res.l}!</motion.p>}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- 3. SCRATCH CARD ---------------- */
function ScratchCard({ onGems }: { onGems: (n: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [prize, setPrize] = useState(75);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2; g.scale(2, 2);
    const grd = g.createLinearGradient(0, 0, r.width, r.height);
    grd.addColorStop(0, "#c0c8d8"); grd.addColorStop(0.5, "#8ea6d8"); grd.addColorStop(1, "#c0c8d8");
    g.fillStyle = grd; g.fillRect(0, 0, r.width, r.height);
    g.fillStyle = "rgba(8,17,48,.5)"; g.font = "800 14px Sora";
    for (let i = 0; i < 30; i++) g.fillText("₿", Math.random() * r.width, Math.random() * r.height);
    g.fillStyle = "#081130"; g.font = "800 15px Sora"; g.textAlign = "center";
    g.fillText("СОТРИ ПАЛЬЦЕМ", r.width / 2, r.height / 2 + 5);
    setPct(0); setDone(false);
  }, [key]);
  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!(e.buttons & 1) || done) return;
    const c = ref.current!; const g = c.getContext("2d")!; const r = c.getBoundingClientRect();
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(e.clientX - r.left, e.clientY - r.top, 20, 0, Math.PI * 2); g.fill();
    if (Math.random() > 0.7) sfx.scratch();
    if (Math.random() > 0.85) {
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let clear = 0; for (let i = 3; i < d.length; i += 64) if (d[i] === 0) clear++;
      const p = clear / (d.length / 64);
      setPct(p);
      if (p > 0.55 && !done) { setDone(true); onGems(prize); sfx.coin(); confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); }
    }
  };
  return (
    <div>
      <div className="relative h-[170px] overflow-hidden rounded-[22px] border-2 border-[#ffc531]/50" style={{ boxShadow: "0 6px 0 #8a5c00" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle,#4d3a08,#1a1204)]">
          <motion.div animate={done ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}} transition={{ duration: 0.6 }}><Gem size={46} className="text-[#5b8cff]" style={{ filter: "drop-shadow(0 0 20px #5b8cff)" }} /></motion.div>
          <p className="display text-3xl font-extrabold text-[#ffd76a]">+{prize} gems</p>
        </div>
        <motion.canvas key={key} ref={ref} animate={{ opacity: done ? 0 : 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 h-full w-full cursor-crosshair touch-none" onPointerMove={scratch} onPointerDown={scratch} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1"><Meter value={Math.min(100, (pct / 0.55) * 100)} tone="gold" h={10} /></div>
        <button onClick={() => { setPrize([25, 50, 75, 150][Math.floor(Math.random() * 4)]); setKey(k => k + 1); sfx.pop(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /> New</button>
      </div>
    </div>
  );
}

/* ---------------- 4. MEMORY MATCH ---------------- */
const pairs = [["HODL", "Держать"], ["FOMO", "Страх упустить"], ["ATH", "Макс цена"], ["DCA", "Усреднение"], ["TP", "Тейк-профит"], ["SL", "Стоп-лосс"]];
type MC = { id: number; txt: string; pair: number; term: boolean };
function shuffle<T>(a: T[]) { return [...a].sort(() => Math.random() - 0.5); }
function Memory({ onXp }: { onXp: (n: number) => void }) {
  const build = () => shuffle(pairs.flatMap((p, i) => [{ id: i * 2, txt: p[0], pair: i, term: true }, { id: i * 2 + 1, txt: p[1], pair: i, term: false }]));
  const [cards, setCards] = useState<MC[]>(build);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const flip = (c: MC) => {
    if (open.length === 2 || open.includes(c.id) || matched.includes(c.pair)) return;
    sfx.soft();
    const n = [...open, c.id];
    setOpen(n);
    if (n.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = n.map(id => cards.find(x => x.id === id)!);
      if (a.pair === b.pair) {
        setTimeout(() => { setMatched(m => [...m, a.pair]); setOpen([]); sfx.success(); onXp(15); if (matched.length + 1 === pairs.length) confetti({ particleCount: 120, spread: 90 }); }, 400);
      } else {
        setTimeout(() => { setWrong(n); sfx.error(); }, 400);
        setTimeout(() => { setOpen([]); setWrong([]); }, 1000);
      }
    }
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Tag tone="blue">Moves {moves}</Tag>
        <Tag tone="green">{matched.length}/{pairs.length}</Tag>
        <button onClick={() => { setCards(build()); setOpen([]); setMatched([]); setMoves(0); sfx.whoosh(); }} className="ml-auto text-[11px] font-extrabold text-[#8ea6d8] hover:text-white"><RotateCcw size={13} className="mr-1 inline" />Shuffle</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(c => {
          const isOpen = open.includes(c.id) || matched.includes(c.pair);
          const isM = matched.includes(c.pair);
          return (
            <motion.button key={c.id} onClick={() => flip(c)} className="relative h-[70px]" style={{ perspective: 600 }} animate={wrong.includes(c.id) ? { x: [0, -6, 6, -4, 4, 0] } : {}} whileTap={{ scale: 0.92 }}>
              <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-[#244385] to-[#122657] text-xl font-black text-[#5b8cff]/60" style={{ backfaceVisibility: "hidden", boxShadow: "0 4px 0 #030816, inset 0 1px 0 rgba(255,255,255,.2)" }}>?</div>
                <div className={cn("absolute inset-0 flex items-center justify-center rounded-xl border-2 p-1 text-center text-[10px] font-extrabold leading-tight", isM ? "border-[#8ef23c] bg-[#8ef23c]/20 text-[#a4ff5e]" : c.term ? "border-[#ffc531]/60 bg-[#ffc531]/15 text-[#ffd76a]" : "border-[#5b8cff]/60 bg-[#5b8cff]/15 text-[#9db9ff]")} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 4px 0 #030816" }}>
                  {c.txt}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 5. SLOT MACHINE ---------------- */
const symbols = ["₿", "Ξ", "◎", "Ð", "🚀", "💎", "🐂"];
function Reel({ target, spinning, delay }: { target: number; spinning: boolean; delay: number }) {
  const H = 64;
  const y = useMotionValue(0);
  useEffect(() => {
    if (!spinning) return;
    const loops = 3 + delay * 2;
    const final = -((loops * symbols.length + target) * H);
    y.set(0);
    animate(y, final, { duration: 1.4 + delay * 0.4, ease: [0.2, 0.7, 0.2, 1.02] }).then(() => sfx.drop());
  }, [spinning, target, delay, y]);
  const strip = Array.from({ length: 12 }, () => symbols).flat();
  return (
    <div className="panel-inset relative h-[64px] w-[64px] overflow-hidden !rounded-2xl">
      <motion.div style={{ y }} className="absolute inset-x-0 top-0">
        {strip.map((s, i) => <div key={i} className="flex h-[64px] items-center justify-center text-3xl font-black text-white">{s}</div>)}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
    </div>
  );
}
function Slots({ onGems }: { onGems: (n: number) => void }) {
  const [t, setT] = useState([0, 1, 2]);
  const [spin, setSpin] = useState(false);
  const [win, setWin] = useState<string | null>(null);
  const [pulled, setPulled] = useState(false);
  const go = () => {
    if (spin) return;
    setWin(null); setPulled(true); sfx.whoosh();
    setTimeout(() => setPulled(false), 300);
    const lucky = Math.random() > 0.65;
    const a = Math.floor(Math.random() * symbols.length);
    const nt = lucky ? [a, a, Math.random() > 0.5 ? a : (a + 1) % symbols.length] : [a, (a + 2) % symbols.length, (a + 4) % symbols.length];
    setT(nt); setSpin(true);
    setTimeout(() => {
      setSpin(false);
      if (nt[0] === nt[1] && nt[1] === nt[2]) { setWin("JACKPOT ×3"); onGems(100); sfx.levelUp(); confetti({ particleCount: 160, spread: 100 }); }
      else if (nt[0] === nt[1] || nt[1] === nt[2]) { setWin("Pair ×2"); onGems(20); sfx.coin(); }
      else setWin("Try again");
    }, 2400);
  };
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="rounded-[26px] border-2 border-[#ffc531]/50 bg-gradient-to-b from-[#4a1020] to-[#1c0a14] p-4" style={{ boxShadow: "0 6px 0 #3a0810, 0 20px 40px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.15)" }}>
        <p className="display mb-2 text-center text-xs font-extrabold tracking-[0.3em] text-[#ffd76a]">CRYPTO SLOTS</p>
        <div className="flex gap-2">
          {t.map((x, i) => <Reel key={i} target={x} spinning={spin} delay={i} />)}
        </div>
        <div className="mt-3 h-6 text-center">
          <AnimatePresence mode="wait">
            {win && <motion.p key={win} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("display text-sm font-extrabold", win.startsWith("Try") ? "text-[#8ea6d8]" : "text-[#ffc531] text-glow-gold")}>{win}</motion.p>}
          </AnimatePresence>
        </div>
      </div>
      <button onClick={go} className="flex flex-col items-center">
        <motion.div animate={{ rotate: pulled ? 40 : 0 }} style={{ originY: 1 }} transition={{ type: "spring", stiffness: 300, damping: 12 }} className="flex flex-col items-center">
          <span className="h-9 w-9 rounded-full border-2 border-white/60" style={{ background: "radial-gradient(circle at 35% 30%,#fff,#ff5470 60%)", boxShadow: "0 0 16px #ff5470" }} />
          <span className="h-16 w-2 rounded-full bg-gradient-to-b from-[#c0c8d8] to-[#5b6d9e]" />
        </motion.div>
        <span className="h-4 w-8 rounded-md bg-[#30406b]" />
        <span className="mt-1 text-[9px] font-extrabold uppercase text-[#8ea6d8]">Pull</span>
      </button>
    </div>
  );
}

/* ---------------- 6. CATCH THE DIP ---------------- */
function CatchDip({ onXp }: { onXp: (n: number) => void }) {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(15);
  const [target, setTarget] = useState({ x: 50, y: 50, id: 0, bad: false });
  const [best, setBest] = useState(0);
  const { spawn, node } = useFloaters();
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); setBest(b => Math.max(b, score)); onXp(score); sfx.levelUp(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTarget({ x: 10 + Math.random() * 80, y: 15 + Math.random() * 70, id: Date.now(), bad: Math.random() > 0.72 }), 850);
    return () => clearInterval(id);
  }, [running]);
  const hit = (e: React.MouseEvent) => {
    const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    if (target.bad) { setScore(s => Math.max(0, s - 10)); sfx.error(); spawn(px, py, "−10 RUG!", "#ff5470"); }
    else { setScore(s => s + 5); sfx.coin(); spawn(px, py, "+5"); }
    setTarget(t => ({ ...t, x: -100, id: Date.now() }));
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Tag tone="gold"><Target size={11} /> {score}</Tag>
        <Tag tone="blue"><Clock size={11} /> {left}s</Tag>
        <Tag tone="violet">Best {best}</Tag>
      </div>
      <div className="panel-inset relative h-[200px] overflow-hidden">
        {node}
        {running ? (
          <AnimatePresence>
            <motion.button key={target.id} onClick={hit} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 text-2xl font-black"
              style={{ left: `${target.x}%`, top: `${target.y}%`, borderColor: target.bad ? "#ff5470" : "#8ef23c", background: target.bad ? "#ff547033" : "#8ef23c33", boxShadow: `0 0 20px ${target.bad ? "#ff5470" : "#8ef23c"}, 0 4px 0 #030816` }}>
              {target.bad ? "☠" : "₿"}
            </motion.button>
          </AnimatePresence>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="display text-base font-extrabold text-white">Catch the Dip</p>
            <p className="mb-3 max-w-[220px] text-[11px] text-[#8ea6d8]">Лови ₿ на просадках, избегай ☠ rug-pull. 15 секунд.</p>
            <button onClick={() => { setScore(0); setLeft(15); setRunning(true); sfx.tap(); }} className="btn3d btn3d-green px-6 py-3 text-xs"><Zap size={14} /> Start</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= SECTION ================= */
export default function MiniGames({ onXp, onGems }: Props) {
  return (
    <SectionShell id="games" index="12" kicker="Mini Games" title="Аркадный слой обучения" desc="Прогноз свечи на время, колесо фортуны, скретч-карта, мемори терминов, слоты и реакционная игра. Все награды реально начисляются в шапку."
      right={<div className="flex gap-2"><Tag tone="gold"><Gift size={11} /> rewards</Tag><Tag tone="blue"><Gem size={11} /> gems</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Predict the Candle" sub="5 секунд на решение · комбо ×" className="lg:col-span-2" action={<Tag tone="red">timed</Tag>}><PredictCandle onXp={onXp} /></Card>
        <Card title="Fortune Wheel" sub="3 спина в день"><FortuneWheel onXp={onXp} onGems={onGems} /></Card>
        <Card title="Scratch Card" sub="Сотри покрытие пальцем"><ScratchCard onGems={onGems} /></Card>
        <Card title="Memory · Crypto Terms" sub="Найди пары термин ↔ значение"><Memory onXp={onXp} /></Card>
        <Card title="Crypto Slots" sub="Дёрни рычаг"><Slots onGems={onGems} /></Card>
      </div>
      <div className="mt-5"><Card title="Catch the Dip · Reaction" sub="Тапай быстро, избегай скама"><CatchDip onXp={onXp} /></Card></div>
    </SectionShell>
  );
}
