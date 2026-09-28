import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Confetti, Label, Section, useAnimatedNumber } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

/* ---------- Candle glyph ---------- */
export function CandleGlyph({ kind, size = 56 }: { kind: "hammer" | "star" | "doji" | "bull" | "bear"; size?: number }) {
  const cfg = {
    hammer: { top: 18, body: [18, 28], bot: 58, c: "#22d38a" },
    star: { top: 4, body: [42, 52], bot: 56, c: "#ff4b6e" },
    doji: { top: 10, body: [31, 33], bot: 54, c: "#8ea3cf" },
    bull: { top: 8, body: [14, 46], bot: 54, c: "#22d38a" },
    bear: { top: 6, body: [12, 44], bot: 56, c: "#ff4b6e" },
  }[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 40 60">
      <line x1="20" x2="20" y1={cfg.top} y2={cfg.bot} stroke={cfg.c} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y={cfg.body[0]} width="16" height={Math.max(2, cfg.body[1] - cfg.body[0])} rx="3" fill={cfg.c} />
      <rect x="14" y={cfg.body[0] + 1.5} width="4" height={Math.max(0, cfg.body[1] - cfg.body[0] - 3)} rx="2" fill="rgba(255,255,255,.3)" />
    </svg>
  );
}

/* ---------- LRN-01 Skill path ---------- */
type NodeT = { t: string; kind: "lesson" | "chest" | "boss"; xp: number };
const NODES: NodeT[] = [
  { t: "What is a candle?", kind: "lesson", xp: 10 },
  { t: "Bullish vs Bearish", kind: "lesson", xp: 10 },
  { t: "Wicks tell stories", kind: "lesson", xp: 15 },
  { t: "Reward chest", kind: "chest", xp: 25 },
  { t: "Hammer & Star", kind: "lesson", xp: 15 },
  { t: "Engulfing patterns", kind: "lesson", xp: 20 },
  { t: "Unit boss: Chart Duel", kind: "boss", xp: 50 },
];
function SkillPath() {
  const [cur, setCur] = useState(2);
  const [pop, setPop] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const offs = [0, 44, 60, 30, -20, -50, -10];
  return (
    <Asset code="LRN-01" title="Skill Path" desc="Winding Duolingo-style unit map. Tap nodes for popovers; START completes and advances with rewards." tags={["map", "progression"]} className="xl:row-span-2">
      <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-gradient-to-b from-[#2d8cf0] to-[#1f6fd0] shadow-[0_5px_0_#1a56a8,inset_0_2px_0_rgba(255,255,255,.25)]">
        <div className="text-[10px] font-black uppercase tracking-[.2em] text-white/70">Unit 3 · Section 1</div>
        <div className="font-black text-lg leading-tight">Candlestick Patterns</div>
        <div className="flex items-center gap-2 mt-2"><Bar value={(cur / NODES.length) * 100} color="gold" h={10} className="flex-1 !bg-[#123f7a]" /><span className="num text-xs font-bold">{cur}/{NODES.length}</span></div>
        <Icon name="candles" size={70} className="absolute -right-3 -top-2 text-white/10" />
      </div>
      <div className="relative flex-1 flex flex-col items-center gap-5 py-2">
        <Confetti burst={burst} />
        {NODES.map((n, i) => {
          const st = i < cur ? "done" : i === cur ? "cur" : "locked";
          const style = st === "done" ? (n.kind === "chest" ? "v-gold" : "v-gold") : st === "cur" ? (n.kind === "boss" ? "v-violet" : "v-bull") : "v-ghost";
          const icon = n.kind === "chest" ? "gift" : n.kind === "boss" ? "crown" : st === "done" ? "check" : st === "cur" ? "star" : "lock";
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${offs[i]}px)` }}>
              {st === "cur" && pop !== i && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 anim-float z-10">
                  <div className="tile !rounded-xl px-3 py-1 text-[11px] font-black text-bull whitespace-nowrap">START<span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#15244b] border-r border-b border-white/10" /></div>
                </div>
              )}
              {st === "cur" && <span className="absolute inset-[-8px] rounded-full border-4 border-bull/30 anim-glow" />}
              <button onClick={() => setPop(pop === i ? null : i)} className={cn("btn3d !rounded-full !p-0", style, n.kind === "boss" ? "w-20 h-[72px]" : "w-16 h-[58px]")} style={{ ["--lip" as string]: "7px" }} aria-label={n.t}>
                <Icon name={icon} size={n.kind === "boss" ? 32 : 26} stroke={2.6} fill={icon === "star" || icon === "crown" ? "currentColor" : "none"} />
              </button>
              {pop === i && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 z-20 anim-pop">
                  <div className={cn("rounded-2xl p-3.5 relative", st === "locked" ? "tile" : st === "done" ? "bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#3a2500] shadow-[0_5px_0_#b07600]" : "bg-gradient-to-b from-[#3ce49e] to-[#1cc27c] shadow-[0_5px_0_#0b7a4a]")}>
                    <span className={cn("absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45", st === "locked" ? "bg-[#1c2d58]" : st === "done" ? "bg-[#ffd560]" : "bg-[#3ce49e]")} />
                    <div className="font-black">{n.t}</div>
                    <div className="text-xs opacity-80 mb-3">{st === "locked" ? "Complete previous lessons to unlock" : st === "done" ? "Completed · practice for +5 XP" : `Lesson ${i + 1} of ${NODES.length}`}</div>
                    {st === "cur" && <button onClick={() => { setCur(cur + 1); setPop(null); setBurst((b) => b + 1); }} className="btn3d v-ghost w-full h-10 text-xs !text-bull" style={{ ["--c" as string]: "#fff", ["--c2" as string]: "#fff", ["--d" as string]: "#cfe0ff", ["--lip" as string]: "4px" }}>Start +{n.xp} XP</button>}
                    {st === "done" && <button className="btn3d w-full h-10 text-xs" style={{ ["--c" as string]: "#fff", ["--c2" as string]: "#fff", ["--d" as string]: "#e6c46b", ["--t" as string]: "#b07600", ["--lip" as string]: "4px" }}>Practice</button>}
                    {st === "locked" && <div className="flex items-center gap-1.5 text-xs text-mist"><Icon name="lock" size={14} />Locked</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => { setCur(2); setPop(null); }} className="text-[11px] text-mist hover:text-sky mt-3 self-center">↺ reset path</button>
    </Asset>
  );
}

/* ---------- LRN-02 Quiz ---------- */
type Q = { q: string; opts: { t: string; glyph?: "hammer" | "star" | "doji" }[]; a: number; why: string };
const QUIZ: Q[] = [
  { q: "Which candle often signals a bullish reversal after a downtrend?", opts: [{ t: "Hammer", glyph: "hammer" }, { t: "Shooting star", glyph: "star" }, { t: "Doji", glyph: "doji" }], a: 0, why: "A long lower wick shows buyers rejected lower prices." },
  { q: "Price closes above resistance on high volume. This is a…", opts: [{ t: "Breakout" }, { t: "Fakeout" }, { t: "Capitulation" }, { t: "Range" }], a: 0, why: "Volume confirms real demand behind the move." },
  { q: "Buy 1 ETH at $2,000, sell at $2,300. Your return is…", opts: [{ t: "+15%" }, { t: "+30%" }, { t: "+2.3%" }, { t: "+13%" }], a: 0, why: "$300 gain ÷ $2,000 cost = 15%." },
];
function Quiz() {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [st, setSt] = useState<"idle" | "ok" | "bad">("idle");
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(0);
  const [combo, setCombo] = useState(0);
  const [burst, setBurst] = useState(0);
  const q = QUIZ[i % QUIZ.length];
  const check = () => {
    if (sel === null) return;
    if (sel === q.a) { setSt("ok"); setDone((d) => d + 1); setCombo((c) => c + 1); if (combo + 1 >= 2) setBurst((b) => b + 1); }
    else { setSt("bad"); setHearts((h) => Math.max(0, h - 1)); setCombo(0); navigator.vibrate?.([30, 40, 30]); }
  };
  const next = () => { setI(i + 1); setSel(null); setSt("idle"); if (done >= QUIZ.length) setDone(0); };
  return (
    <Asset code="LRN-02" title="Quiz Lesson" desc="Full question loop: select → check → feedback sheet. Hearts, combo streak, progress and visual answer cards." tags={["loop", "feedback", "combo"]} span={2}>
      <div className="well relative overflow-hidden flex flex-col min-h-[440px]">
        <Confetti burst={burst} />
        <div className="flex items-center gap-3 p-4">
          <button className="text-mist hover:text-fog" onClick={() => { setI(0); setDone(0); setHearts(5); setSel(null); setSt("idle"); setCombo(0); }}><Icon name="x" size={22} stroke={2.6} /></button>
          <Bar value={(done / QUIZ.length) * 100} color="bull" h={16} className="flex-1" />
          <span className={cn("flex items-center gap-1 font-black num", hearts === 0 ? "text-mist" : "text-bear")} key={hearts}><Icon name="heart" size={22} fill="currentColor" stroke={1.5} className={st === "bad" ? "anim-shake" : ""} />{hearts}</span>
        </div>
        {combo >= 2 && <div key={combo} className="mx-4 -mt-1 mb-1 text-xs font-black text-flame flex items-center gap-1 anim-pop"><Icon name="flame" size={14} fill="currentColor" /> {combo} IN A ROW!</div>}
        <div className="px-5 flex-1" key={i}>
          <div className="text-[11px] font-black uppercase tracking-widest text-violet mb-2 flex items-center gap-1.5 anim-rise"><Icon name="sparkle" size={14} />New concept</div>
          <h4 className="text-lg sm:text-xl font-extrabold mb-5 anim-rise">{q.q}</h4>
          <div className={cn("grid gap-3", q.opts[0].glyph ? "grid-cols-3" : "grid-cols-2")}>
            {q.opts.map((o, k) => {
              const picked = sel === k;
              const show = st !== "idle";
              const good = show && k === q.a;
              const bad = show && picked && k !== q.a;
              return (
                <button key={o.t} disabled={st !== "idle"} onClick={() => setSel(k)} style={{ animation: `rise .35s ${k * 0.06}s both` }}
                  className={cn("rounded-2xl border-2 p-3 flex items-center gap-2 transition-all font-bold text-sm",
                    o.glyph ? "flex-col justify-center py-4" : "justify-start",
                    good ? "border-bull bg-bull/15 text-bull shadow-[0_4px_0_#0b7a4a]" : bad ? "border-bear bg-bear/15 text-bear shadow-[0_4px_0_#a01e3c] anim-shake" : picked ? "border-sky bg-sky/15 text-sky shadow-[0_4px_0_#1a56a8] -translate-y-0.5" : "border-ink-600 bg-ink-800 shadow-[0_4px_0_#0a1430] hover:bg-ink-750 active:translate-y-1 active:shadow-none")}>
                  {o.glyph ? <CandleGlyph kind={o.glyph} size={52} /> : <span className={cn("num w-6 h-6 rounded-lg grid place-items-center text-[11px] border-2", picked || good ? "border-current" : "border-ink-600 text-mist")}>{k + 1}</span>}
                  <span>{o.t}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={cn("mt-5 p-4 transition-colors duration-300 border-t-2", st === "ok" ? "bg-[#0f3b33] border-bull/40" : st === "bad" ? "bg-[#3b1427] border-bear/40" : "border-white/5")}>
          {st !== "idle" && (
            <div className="flex items-center gap-3 mb-3 anim-rise">
              <span className={cn("w-11 h-11 rounded-full grid place-items-center bg-white anim-bounce-in", st === "ok" ? "text-bull" : "text-bear")}><Icon name={st === "ok" ? "check" : "x"} size={24} stroke={3.5} /></span>
              <div>
                <div className={cn("font-black text-lg", st === "ok" ? "text-bull" : "text-bear")}>{st === "ok" ? ["Excellent!", "Nailed it!", "Sharp trader!"][i % 3] : `Correct: ${q.opts[q.a].t}`}</div>
                <div className="text-xs text-fog/80">{q.why}</div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {st === "idle" && <Btn variant="ghost" size="md" className="hidden sm:inline-flex" onClick={next}>Skip</Btn>}
            {st === "idle" ? <Btn variant="bull" size="md" block disabled={sel === null || hearts === 0} onClick={check}>{hearts === 0 ? "Out of hearts" : "Check"}</Btn>
              : <Btn variant={st === "ok" ? "bull" : "bear"} size="md" block onClick={next}>Continue</Btn>}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- LRN-03 Lesson complete ---------- */
function LessonComplete() {
  const [k, setK] = useState(1);
  const [vals, setVals] = useState([0, 0, 0]);
  useEffect(() => { setVals([0, 0, 0]); const t = setTimeout(() => setVals([45, 92, 154]), 250); return () => clearTimeout(t); }, [k]);
  const xp = useAnimatedNumber(vals[0], 1100), acc = useAnimatedNumber(vals[1], 1300), tm = useAnimatedNumber(vals[2], 1500);
  return (
    <Asset code="LRN-03" title="Lesson Complete" desc="Reward screen: spinning rays, bouncing trophy, stat tiles counting up in sequence." tags={["reward", "count-up"]}>
      <div key={k} className="relative flex-1 grid place-items-center py-6 overflow-hidden rounded-2xl">
        <div className="absolute left-1/2 top-[42%] w-[340px] h-[340px] opacity-40" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.35) 0deg 10deg, transparent 10deg 30deg)", animation: "raysSpin 18s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 65%)", WebkitMaskImage: "radial-gradient(circle, #000 20%, transparent 65%)" }} />
        <Confetti burst={k} count={40} />
        <div className="relative text-center">
          <div className="w-24 h-24 mx-auto rounded-[28px] grid place-items-center bg-gradient-to-b from-[#ffd560] to-[#f5b01c] shadow-[0_7px_0_#b07600,inset_0_3px_0_rgba(255,255,255,.4),0_0_40px_rgba(255,197,61,.5)] anim-bounce-in">
            <Icon name="trophy" size={52} stroke={2.2} className="text-[#6b4500]" />
          </div>
          <div className="text-2xl font-black text-grad-gold mt-4 anim-rise" style={{ animationDelay: ".2s" }}>Lesson complete!</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["Total XP", `${Math.round(xp)}`, "#ffc53d", "bolt"], ["Accuracy", `${Math.round(acc)}%`, "#22d38a", "target"], ["Time", `${Math.floor(tm / 60)}:${String(Math.round(tm % 60)).padStart(2, "0")}`, "#3da5ff", "clock"]].map(([l, v, c, i], n) => (
          <div key={l} className="rounded-2xl p-[2px] anim-rise" style={{ background: c, animationDelay: `${0.3 + n * 0.12}s`, boxShadow: `0 4px 0 ${c}88` }}>
            <div className="text-[9px] font-black uppercase text-center text-ink-900 py-0.5 tracking-wider">{l}</div>
            <div className="bg-ink-850 rounded-[14px] py-2.5 flex items-center justify-center gap-1" style={{ color: c }}><Icon name={i} size={16} stroke={2.6} /><span className="num font-black">{v}</span></div>
          </div>
        ))}
      </div>
      <Btn variant="sky" block onClick={() => setK(k + 1)} icon="refresh">Replay animation</Btn>
    </Asset>
  );
}

/* ---------- LRN-04 Mascot ---------- */
const TIPS = [
  "Never risk more than 1–2% of your account on a single trade.",
  "The trend is your friend — until it bends.",
  "Set your stop-loss BEFORE you enter. Emotions come later.",
  "FOMO is a feeling, not a strategy.",
  "Volume confirms price. No volume, no conviction.",
];
function Mascot() {
  const ref = useRef<SVGSVGElement>(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<"happy" | "think" | "sad">("happy");
  const [tip, setTip] = useState(0);
  const [jump, setJump] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(4.5, d / 40);
        setEye({ x: (dx / d) * m, y: (dy / d) * m });
      });
    };
    window.addEventListener("pointermove", on);
    return () => { window.removeEventListener("pointermove", on); cancelAnimationFrame(raf); };
  }, []);
  const mouth = { happy: "M50 88 Q60 97 70 88", think: "M52 90 L68 88", sad: "M50 93 Q60 85 70 93" }[mood];
  return (
    <Asset code="LRN-04" title="Mascot · Pip the Bull" desc="Guide character: eyes track your cursor, blinks, 3 moods, tap for rotating trading tips." tags={["tracking", "moods"]}>
      <div className="flex items-start gap-3 mb-3">
        <button onClick={() => { setTip((tip + 1) % TIPS.length); setJump(jump + 1); }} className="shrink-0" aria-label="Next tip">
          <svg key={jump} ref={ref} width="120" height="120" viewBox="0 0 120 120" className="anim-bounce-in drop-shadow-[0_8px_0_rgba(0,0,0,.3)]">
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5cb3ff" /><stop offset="1" stopColor="#2d7ee0" /></linearGradient>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#f5b01c" /></linearGradient>
            </defs>
            <path d="M30 42 C14 34 10 18 18 8 C22 22 30 28 42 32 Z" fill="url(#hg)" stroke="#b07600" strokeWidth="2" />
            <path d="M90 42 C106 34 110 18 102 8 C98 22 90 28 78 32 Z" fill="url(#hg)" stroke="#b07600" strokeWidth="2" />
            <ellipse cx="18" cy="56" rx="10" ry="7" fill="#2d7ee0" transform="rotate(-20 18 56)" />
            <ellipse cx="102" cy="56" rx="10" ry="7" fill="#2d7ee0" transform="rotate(20 102 56)" />
            <ellipse cx="60" cy="68" rx="40" ry="38" fill="#1a56a8" />
            <ellipse cx="60" cy="63" rx="40" ry="38" fill="url(#mg)" />
            <ellipse cx="48" cy="36" rx="14" ry="6" fill="rgba(255,255,255,.25)" />
            <g style={{ animation: "blink 4s infinite", transformBox: "fill-box", transformOrigin: "center" }}>
              <circle cx="45" cy="56" r="10" fill="#fff" /><circle cx="75" cy="56" r="10" fill="#fff" />
              <circle cx={45 + eye.x} cy={56 + eye.y} r="5.5" fill="#0a1330" /><circle cx={75 + eye.x} cy={56 + eye.y} r="5.5" fill="#0a1330" />
              <circle cx={47 + eye.x} cy={54 + eye.y} r="1.8" fill="#fff" /><circle cx={77 + eye.x} cy={54 + eye.y} r="1.8" fill="#fff" />
            </g>
            <path d={mood === "think" ? "M36 42 L54 40" : mood === "sad" ? "M36 40 L54 45" : "M36 44 Q45 38 54 43"} stroke="#0a1330" strokeWidth="3.5" strokeLinecap="round" fill="none" style={{ transition: "d .3s" }} />
            <path d={mood === "think" ? "M66 37 L84 43" : mood === "sad" ? "M66 45 L84 40" : "M66 43 Q75 38 84 44"} stroke="#0a1330" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="60" cy="84" rx="22" ry="14" fill="#a9d8ff" />
            <ellipse cx="52" cy="81" rx="3" ry="3.5" fill="#1a56a8" /><ellipse cx="68" cy="81" rx="3" ry="3.5" fill="#1a56a8" />
            <path d={mouth} stroke="#1a56a8" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="60" cy="104" r="5" fill="url(#hg)" stroke="#b07600" strokeWidth="1.5" />
          </svg>
        </button>
        <div key={tip} className="tile !rounded-2xl p-3 relative mt-4 anim-pop flex-1">
          <span className="absolute -left-1.5 top-6 w-3 h-3 rotate-45 bg-[#1a2a55] border-l border-b border-white/10" />
          <div className="text-[10px] font-black uppercase text-gold tracking-widest mb-1">Pro tip #{tip + 1}</div>
          <p className="text-sm font-semibold leading-snug">{TIPS[tip]}</p>
        </div>
      </div>
      <Label>Mood</Label>
      <div className="grid grid-cols-3 gap-2 mt-auto">
        {([["happy", "Happy"], ["think", "Thinking"], ["sad", "Oops"]] as const).map(([m, t]) => (
          <button key={m} onClick={() => setMood(m)} className={cn("btn3d h-10 text-[11px]", mood === m ? "v-sky" : "v-ghost")} style={{ ["--lip" as string]: "4px" }}>{t}</button>
        ))}
      </div>
    </Asset>
  );
}

/* ---------- LRN-05 Flashcards ---------- */
const CARDS = [["HODL", "Holding an asset long-term regardless of volatility."], ["Stop-loss", "An order that closes your position at a preset loss level."], ["Liquidity", "How easily an asset can be bought or sold without moving price."], ["Market cap", "Price × circulating supply. Measures project size."]];
function Flashcards() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [out, setOut] = useState<"l" | "r" | null>(null);
  const [known, setKnown] = useState(0);
  const go = (d: "l" | "r") => { setOut(d); if (d === "r") setKnown((k) => k + 1); setTimeout(() => { setI((x) => (x + 1) % CARDS.length); setFlip(false); setOut(null); }, 320); };
  return (
    <Asset code="LRN-05" title="Flashcards" desc="3D flip on tap, swipe-out on answer, stacked deck depth and mastery counter." tags={["flip", "3D"]}>
      <div className="relative h-48 mb-4" style={{ perspective: 1000 }}>
        <div className="absolute inset-x-6 top-4 bottom-[-8px] tile opacity-40" />
        <div className="absolute inset-x-3 top-2 bottom-[-4px] tile opacity-70" />
        <button onClick={() => setFlip(!flip)} className="absolute inset-0 transition-all duration-300" style={{ transform: out ? `translateX(${out === "r" ? 120 : -120}%) rotate(${out === "r" ? 18 : -18}deg)` : "none", opacity: out ? 0 : 1 }}>
          <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flip ? "rotateY(180deg)" : "none" }}>
            <div className="absolute inset-0 tile !rounded-3xl grid place-items-center p-4" style={{ backfaceVisibility: "hidden" }}>
              <div className="text-center"><div className="text-[10px] text-mist font-bold uppercase tracking-widest mb-2">Term · {i + 1}/{CARDS.length}</div><div className="text-3xl font-black text-grad-sky">{CARDS[i][0]}</div><div className="text-[10px] text-mist mt-3">tap to flip</div></div>
            </div>
            <div className="absolute inset-0 rounded-3xl grid place-items-center p-5 bg-gradient-to-b from-[#a886ff] to-[#7a4af0] shadow-[0_5px_0_#4f2bb0]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <p className="text-center font-bold leading-snug">{CARDS[i][1]}</p>
            </div>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Btn variant="bear" size="sm" icon="x" onClick={() => go("l")}>Again</Btn>
        <Btn variant="bull" size="sm" icon="check" onClick={() => go("r")}>Got it</Btn>
      </div>
      <div className="text-center text-xs text-mist mt-2">Mastered <b className="num text-bull">{known}</b></div>
    </Asset>
  );
}

/* ---------- LRN-06 Match pairs ---------- */
const PAIRS = [["Bull", "Price rising"], ["Bear", "Price falling"], ["Whale", "Huge holder"], ["Gas", "Network fee"]];
function MatchPairs() {
  const [right] = useState(() => PAIRS.map((p, i) => ({ t: p[1], i })).sort(() => Math.random() - 0.5));
  const [l, setL] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const pick = (ri: number) => {
    if (l === null) return;
    if (ri === l) { setMatched([...matched, l]); setL(null); }
    else { setWrong(ri); setTimeout(() => { setWrong(null); setL(null); }, 450); }
  };
  const all = matched.length === PAIRS.length;
  const base = "h-11 rounded-xl border-2 text-sm font-bold transition-all";
  const idle = "border-ink-600 bg-ink-800 shadow-[0_4px_0_#0a1430] hover:bg-ink-750 active:translate-y-1 active:shadow-none";
  return (
    <Asset code="LRN-06" title="Match Pairs" desc="Tap a term, then its meaning. Correct pairs lock green, wrong ones shake red." tags={["game", "tap"]}>
      <div className="grid grid-cols-2 gap-2.5 relative">
        <Confetti burst={all ? 1 : 0} />
        <div className="space-y-2.5">
          {PAIRS.map((p, i) => (
            <button key={p[0]} disabled={matched.includes(i)} onClick={() => setL(i)} className={cn(base, "w-full", matched.includes(i) ? "border-bull/40 bg-bull/10 text-bull/60 scale-95" : l === i ? "border-sky bg-sky/15 text-sky shadow-[0_4px_0_#1a56a8]" : idle)}>{p[0]}</button>
          ))}
        </div>
        <div className="space-y-2.5">
          {right.map((r) => (
            <button key={r.t} disabled={matched.includes(r.i)} onClick={() => pick(r.i)} className={cn(base, "w-full", matched.includes(r.i) ? "border-bull/40 bg-bull/10 text-bull/60 scale-95" : wrong === r.i ? "border-bear bg-bear/15 text-bear anim-shake" : idle)}>{r.t}</button>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className={cn("text-sm font-black", all ? "text-bull anim-pop" : "text-mist")}>{all ? "Perfect match! +20 XP" : `${matched.length}/${PAIRS.length} matched`}</span>
        <button onClick={() => { setMatched([]); setL(null); }} className="text-[11px] text-mist hover:text-sky">↺ reset</button>
      </div>
    </Asset>
  );
}

/* ---------- LRN-07 Predict next candle ---------- */
function genCandles(n: number, start = 100) {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = start;
  for (let i = 0; i < n; i++) { const o = p; const c = o + (Math.random() - 0.5) * 8; const h = Math.max(o, c) + Math.random() * 3; const l = Math.min(o, c) - Math.random() * 3; out.push({ o, c, h, l }); p = c; }
  return out;
}
function Predict() {
  const [data, setData] = useState(() => genCandles(14));
  const [reveal, setReveal] = useState<null | { o: number; c: number; h: number; l: number; guess: "up" | "down" }>(null);
  const [score, setScore] = useState({ w: 0, t: 0 });
  const all = reveal ? [...data, reveal] : data;
  const hi = Math.max(...all.map((d) => d.h)) + 2, lo = Math.min(...all.map((d) => d.l)) - 2;
  const y = (v: number) => 8 + ((hi - v) / (hi - lo)) * 124;
  const guess = (g: "up" | "down") => {
    if (reveal) return;
    const last = data[data.length - 1].c;
    const c = last + (Math.random() - 0.5) * 10;
    const nc = { o: last, c, h: Math.max(last, c) + Math.random() * 3, l: Math.min(last, c) - Math.random() * 3, guess: g };
    setReveal(nc);
    setScore((s) => ({ w: s.w + ((c > last) === (g === "up") ? 1 : 0), t: s.t + 1 }));
  };
  const win = reveal ? (reveal.c > reveal.o) === (reveal.guess === "up") : null;
  const next = () => { setData(reveal ? [...data.slice(1), { o: reveal.o, c: reveal.c, h: reveal.h, l: reveal.l }] : data); setReveal(null); };
  return (
    <Asset code="LRN-07" title="Predict the Candle" desc="Mini-game drill: call the next candle, watch it grow in, build your hit-rate." tags={["mini-game", "live"]}>
      <div className="well relative overflow-hidden mb-3">
        <svg viewBox="0 0 300 140" className="w-full h-40">
          {[0, 1, 2, 3].map((g) => <line key={g} x1="0" x2="300" y1={20 + g * 33} y2={20 + g * 33} stroke="rgba(140,175,255,.07)" />)}
          {all.map((d, i) => {
            const x = 12 + i * 19.5; const up = d.c >= d.o; const col = up ? "#22d38a" : "#ff4b6e"; const isNew = reveal && i === all.length - 1;
            return (
              <g key={i} style={isNew ? { animation: "pop .5s cubic-bezier(.2,.9,.3,1.3) both", transformBox: "fill-box", transformOrigin: "bottom" } : undefined} opacity={isNew ? 1 : 0.9}>
                <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.5" />
                <rect x={x - 5} y={y(Math.max(d.o, d.c))} width="10" height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="2" fill={col} />
              </g>
            );
          })}
          {!reveal && <rect x={12 + data.length * 19.5 - 7} y="10" width="14" height="120" rx="4" fill="rgba(61,165,255,.1)" stroke="rgba(61,165,255,.4)" strokeDasharray="3 3"><animate attributeName="opacity" values=".4;1;.4" dur="1.4s" repeatCount="indefinite" /></rect>}
        </svg>
        {reveal && <div className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black anim-pop", win ? "bg-bull text-ink-900" : "bg-bear text-white")}>{win ? "Correct call! +10 XP" : "Missed it"}</div>}
      </div>
      {reveal ? <Btn variant={win ? "bull" : "sky"} block onClick={next} iconRight="chevR">Next round</Btn> : (
        <div className="grid grid-cols-2 gap-3"><Btn variant="bull" icon="arrowUp" onClick={() => guess("up")}>Up</Btn><Btn variant="bear" icon="arrowDown" onClick={() => guess("down")}>Down</Btn></div>
      )}
      <div className="flex justify-between text-xs text-mist mt-2"><span>Hit-rate</span><span className="num text-fog font-bold">{score.t ? Math.round((score.w / score.t) * 100) : 0}% · {score.w}/{score.t}</span></div>
    </Asset>
  );
}

export default function Learning() {
  return (
    <Section id="learning" index="04" title="Learning Loop" subtitle="The Duolingo-grade core: path, lessons, instant feedback, drills and a guide character.">
      <SkillPath />
      <Quiz />
      <LessonComplete />
      <Mascot />
      <Flashcards />
      <MatchPairs />
      <Predict />
    </Section>
  );
}
