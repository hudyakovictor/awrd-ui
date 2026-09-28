import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Asset, Btn, Chip, Confetti, Label } from "../../components/ui";
import { FlameIcon, GemIcon, HeartIcon, Icon, XPIcon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx, speak } from "../../lib/sound";
import { clamp, mulberry32, shuffleSeeded, useDrag, useFlip, useInterval } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-01 · QUIZ 2.0 — power-ups, timer, combo, global hearts & XP
 * ===================================================================== */
const QUIZ = [
  {
    tag: "Candlesticks",
    q: "A long lower wick after a downtrend usually signals…",
    opts: ["Strong selling pressure", "Buyers rejecting lower prices", "Low trading volume", "A guaranteed reversal"],
    a: 1,
    why: "Price dipped but buyers pushed it back up — a hammer-style rejection.",
    hint: "Think about who won the fight by the close.",
  },
  {
    tag: "Risk",
    q: "With a 1:3 risk-reward, what win-rate breaks even?",
    opts: ["50%", "33%", "25%", "10%"],
    a: 2,
    why: "Win 3R × 25% = 0.75R; lose 1R × 75% = 0.75R → breakeven.",
    hint: "Each win pays three times what each loss costs.",
  },
  {
    tag: "Orders",
    q: "What is 'slippage' on a market order?",
    opts: ["A miner fee", "Gap between expected and fill price", "A delayed withdrawal", "A liquidation"],
    a: 1,
    why: "Market orders take the best available price, which can move before the fill.",
    hint: "It happens between clicking and filling.",
  },
  {
    tag: "DeFi",
    q: "Impermanent loss mostly affects…",
    opts: ["Liquidity providers", "Hardware wallets", "Stablecoin holders", "Miners"],
    a: 0,
    why: "LPs underperform simply holding when pool asset prices diverge.",
    hint: "Who deposits two tokens into a pool?",
  },
  {
    tag: "Psychology",
    q: "Buying only because everyone else is buying is called…",
    opts: ["DCA", "HODL", "FOMO", "Hedging"],
    a: 2,
    why: "Fear Of Missing Out drives late, emotional entries near tops.",
    hint: "Fear Of Missing…",
  },
];

function QuizPro() {
  const g = useGame();
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [removed, setRemoved] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [fire, setFire] = useState(0);
  const [timed, setTimed] = useState(false);
  const [time, setTime] = useState(15);
  const [done, setDone] = useState<boolean[]>([]);
  const checkRef = useRef<HTMLDivElement>(null);
  const Q = QUIZ[qi % QUIZ.length];

  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), timed && status === "idle" ? 100 : null);
  useEffect(() => {
    if (timed && status === "idle" && time <= 0) {
      setStatus("wrong");
      setCombo(0);
      g.loseHeart();
      sfx("error");
      setDone((d) => [...d, false]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  const check = () => {
    if (sel === null || status !== "idle") return;
    if (sel === Q.a) {
      const n = 10 + combo * 2;
      setStatus("right");
      setCombo((c) => c + 1);
      setFire((f) => f + 1);
      sfx("success");
      if (combo + 1 >= 3) setTimeout(() => sfx("combo"), 200);
      g.reward("xp", n, checkRef.current);
      setDone((d) => [...d, true]);
    } else {
      setStatus("wrong");
      setCombo(0);
      g.loseHeart();
      sfx("error");
      setDone((d) => [...d, false]);
    }
  };
  const next = () => {
    setQi((i) => i + 1);
    setSel(null);
    setStatus("idle");
    setRemoved([]);
    setHint(false);
    setTime(15);
    if (done.length >= QUIZ.length) setDone([]);
  };
  const fifty = (e: React.MouseEvent) => {
    if (removed.length || status !== "idle") return;
    if (!g.spend("gems", 20, e.currentTarget)) return;
    const wrong = Q.opts.map((_, i) => i).filter((i) => i !== Q.a);
    setRemoved(shuffleSeeded(wrong, qi + 7).slice(0, 2));
    if (sel !== null && sel !== Q.a) setSel(null);
    sfx("whoosh");
  };
  const onKey = (e: KeyboardEvent) => {
    const n = parseInt(e.key);
    if (status === "idle" && n >= 1 && n <= 4 && !removed.includes(n - 1)) setSel(n - 1);
    if (e.key === "Enter") status === "idle" ? check() : next();
  };

  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <Asset title="Quiz 2.0 · Power-ups" code="G-01" tags="quiz question answer lesson multiple choice power-up timer combo hearts" span={7} bodyClass="p-0 flex flex-col" badge="Core">
      <div tabIndex={0} onKeyDown={onKey} className="flex flex-1 flex-col outline-none">
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="flex flex-1 gap-1.5">
            {QUIZ.map((_, i) => (
              <div key={i} className="panel-inset h-3.5 flex-1 overflow-hidden rounded-full">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", done[i] === true ? "w-full bg-bull" : done[i] === false ? "w-full bg-bear" : i === done.length ? "w-1/3 bg-bull/40 anim-glow" : "w-0")}
                />
              </div>
            ))}
          </div>
          {combo >= 2 && (
            <span key={combo} className="anim-pop flex items-center gap-1 rounded-lg bg-flame/20 px-2 py-0.5 font-display text-xs font-black text-flame ring-1 ring-flame/40">
              <FlameIcon size={16} /> ×{combo}
            </span>
          )}
          <div key={`h${g.bumps.hearts}`} className="anim-bump items-center gap-1 font-display text-sm font-black text-bear">
            <HeartIcon size={22} dim={!g.hearts} /> {g.hearts}
          </div>
        </div>

        <div className="relative flex-1 px-5 pb-5 pt-4">
          <Confetti fire={fire} />
          <div className="flex items-center gap-2">
            <Chip tone="violet">
              <Icon name="sparkle" size={12} /> {Q.tag}
            </Chip>
            {timed && (
              <div className="relative ml-auto h-9 w-9">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r={r} fill="none" stroke="#0a1330" strokeWidth="4" />
                  <circle cx="18" cy="18" r={r} fill="none" stroke={time < 5 ? "#ff4d6d" : "#2fd4ff"} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - time / 15)} />
                </svg>
                <span className={cn("absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold", time < 5 ? "text-bear anim-glow" : "text-white")}>{Math.ceil(time)}</span>
              </div>
            )}
          </div>
          <h4 key={qi} className="anim-slide-up mt-3 font-display text-lg font-bold leading-snug text-white sm:text-xl">
            {Q.q}
          </h4>
          {hint && (
            <div className="anim-pop mt-3 flex items-center gap-2 rounded-2xl border-2 border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-gold">
              <Icon name="brain" size={16} /> {Q.hint}
            </div>
          )}
          <div key={`o${qi}`} className={cn("mt-4 grid gap-3 sm:grid-cols-2", status === "wrong" && "anim-shake")}>
            {Q.opts.map((o, i) => {
              const gone = removed.includes(i);
              const isSel = sel === i;
              const showRight = status !== "idle" && i === Q.a;
              const showWrong = status === "wrong" && isSel;
              return (
                <button
                  key={o}
                  disabled={status !== "idle" || gone}
                  onClick={() => {
                    sfx("select");
                    setSel(i);
                  }}
                  className={cn(
                    "anim-slide-up flex items-center gap-3 rounded-2xl border-2 p-3 text-left text-sm font-bold transition-all duration-200 active:translate-y-1",
                    gone && "pointer-events-none scale-90 opacity-0 blur-sm",
                    showRight
                      ? "border-bull bg-bull/15 text-bull shadow-[0_4px_0_#0c8f63]"
                      : showWrong
                        ? "border-bear bg-bear/15 text-bear shadow-[0_4px_0_#b31f3d]"
                        : isSel
                          ? "border-azure bg-azure/15 text-white shadow-[0_4px_0_#1c55c2]"
                          : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_4px_0_#0b1838] hover:bg-ink-750",
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 font-mono text-xs",
                      showRight ? "border-bull" : showWrong ? "border-bear" : isSel ? "border-azure text-azure" : "border-ink-600 text-ink-400",
                    )}
                  >
                    {showRight ? <Icon name="check" size={14} stroke={3.5} /> : showWrong ? <Icon name="x" size={14} stroke={3.5} /> : i + 1}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={fifty} disabled={!!removed.length || status !== "idle"} className="btn3d v-violet h-9 rounded-xl px-3 text-[11px] [--depth:3px]">
              50/50 · <GemIcon size={14} /> 20
            </button>
            <button
              onClick={() => {
                setHint(true);
                sfx("pop");
              }}
              disabled={hint || status !== "idle"}
              className="btn3d v-gold h-9 rounded-xl px-3 text-[11px] [--depth:3px]"
            >
              <Icon name="brain" size={14} /> Hint
            </button>
            <button
              onClick={() => {
                setTimed((t) => !t);
                setTime(15);
                sfx("select");
              }}
              className={cn("btn3d h-9 rounded-xl px-3 text-[11px] [--depth:3px]", timed ? "v-azure" : "v-ghost")}
            >
              <Icon name="clock" size={14} /> Timer {timed ? "on" : "off"}
            </button>
            <span className="ml-auto hidden text-[10px] font-bold text-ink-500 sm:inline">Keys 1–4 · Enter</span>
          </div>
        </div>

        <div
          ref={checkRef}
          className={cn(
            "border-t-2 px-5 py-4 transition-colors duration-300",
            status === "right" ? "border-bull/30 bg-bull/10" : status === "wrong" ? "border-bear/30 bg-bear/10" : "border-white/5",
          )}
        >
          {status === "idle" ? (
            <div className="flex items-center gap-3">
              <Btn variant="ghost" size="sm" onClick={next}>
                Skip
              </Btn>
              <Btn variant="bull" className="ml-auto min-w-[150px]" disabled={sel === null} onClick={check} sound={false}>
                Check
              </Btn>
            </div>
          ) : (
            <div className="anim-slide-up flex flex-wrap items-center gap-3">
              <div className={cn("anim-pop flex h-12 w-12 items-center justify-center rounded-full", status === "right" ? "bg-bull text-ink-950" : "bg-bear text-white")}>
                <Icon name={status === "right" ? "check" : "x"} size={26} stroke={3.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("font-display text-base font-black", status === "right" ? "text-bull" : "text-bear")}>
                  {status === "right" ? (combo >= 3 ? `On fire! ${combo} in a row` : "Nice read!") : time <= 0 && timed ? "Time's up!" : "Not quite"}
                </div>
                <div className="text-xs font-semibold text-ink-200">{Q.why}</div>
              </div>
              <Btn variant={status === "right" ? "bull" : "bear"} onClick={next}>
                {status === "right" ? "Continue" : "Got it"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-02 · WORD BANK — Duolingo tile builder with FLIP flight + TTS
 * ===================================================================== */
const SENTENCES = [
  {
    prompt: "Build the golden rule",
    src: "«Режь убытки быстро — дай прибыли расти»",
    answer: ["Cut", "your", "losses", "and", "let", "profits", "run"],
    extra: ["panic", "buy", "never"],
  },
  {
    prompt: "Define DCA",
    src: "Dollar-Cost Averaging",
    answer: ["Invest", "a", "fixed", "amount", "on", "a", "schedule"],
    extra: ["random", "all-in", "timing"],
  },
  {
    prompt: "Complete the maxim",
    src: "«Не храни все яйца в одной корзине»",
    answer: ["Diversify", "to", "reduce", "risk"],
    extra: ["leverage", "ignore", "maximize", "fear"],
  },
];

function WordBank() {
  const g = useGame();
  const [si, setSi] = useState(0);
  const S = SENTENCES[si % SENTENCES.length];
  const tiles = useMemo(() => shuffleSeeded([...S.answer, ...S.extra].map((w, i) => ({ id: i, w })), si * 13 + 5), [S, si]);
  const [picked, setPicked] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [fire, setFire] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  useFlip(boxRef, [picked, si]);

  const toggle = (id: number) => {
    if (status !== "idle") return;
    sfx("select", picked.includes(id) ? 0.8 : 1 + picked.length * 0.04);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const words = picked.map((id) => tiles.find((t) => t.id === id)!.w);
  const check = () => {
    if (words.join(" ") === S.answer.join(" ")) {
      setStatus("right");
      setFire((f) => f + 1);
      sfx("success");
      g.reward("xp", 15, footRef.current);
    } else {
      setStatus("wrong");
      sfx("error");
    }
  };
  const next = () => {
    setSi((s) => s + 1);
    setPicked([]);
    setStatus("idle");
  };
  const tileCls =
    "rounded-xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-sm font-extrabold text-white shadow-[0_4px_0_#0b1838] transition-[transform,background] hover:-translate-y-0.5 hover:bg-ink-750 active:translate-y-1 active:shadow-none";
  return (
    <Asset title="Word Bank Builder" code="G-02" tags="word bank sentence builder tiles duolingo translate drag flip speak" span={5} bodyClass="p-0 flex flex-col">
      <div ref={boxRef} className="relative flex-1 p-5">
        <Confetti fire={fire} />
        <Label>{S.prompt}</Label>
        <div className="flex items-start gap-3">
          <button
            onClick={() => speak(S.answer.join(" "))}
            className="btn3d v-azure h-11 w-11 shrink-0 rounded-xl [--depth:4px]"
            title="Listen"
          >
            <Icon name="volume" size={20} />
          </button>
          <div className="relative rounded-2xl border-2 border-ink-600 bg-ink-850 px-3 py-2 text-sm font-bold text-ink-100">
            <span className="absolute -left-[7px] top-4 h-3 w-3 rotate-45 border-b-2 border-l-2 border-ink-600 bg-ink-850" />
            {S.src}
          </div>
        </div>
        <div
          className={cn(
            "relative mt-5 flex min-h-[112px] flex-wrap content-start gap-2 py-1",
            status === "wrong" && "anim-shake",
          )}
          style={{ backgroundImage: "linear-gradient(transparent 53px, rgba(142,164,210,.18) 53px, rgba(142,164,210,.18) 55px, transparent 55px)", backgroundSize: "100% 56px" }}
        >
          {picked.map((id) => {
            const t = tiles.find((x) => x.id === id)!;
            return (
              <button key={id} data-flip={id} onClick={() => toggle(id)} className={cn(tileCls, status === "right" && "border-bull text-bull", status === "wrong" && "border-bear/70")}>
                {t.w}
              </button>
            );
          })}
          {!picked.length && <span className="absolute left-0 top-4 text-xs font-bold text-ink-500">Tap the words below…</span>}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {tiles.map((t) =>
            picked.includes(t.id) ? (
              <span key={t.id} className="rounded-xl border-2 border-transparent bg-ink-950/70 px-3 py-2 text-sm font-extrabold text-transparent shadow-[inset_0_3px_6px_rgba(0,0,0,.5)]">
                {t.w}
              </span>
            ) : (
              <button key={t.id} data-flip={t.id} onClick={() => toggle(t.id)} className={tileCls}>
                {t.w}
              </button>
            ),
          )}
        </div>
      </div>
      <div
        ref={footRef}
        className={cn(
          "border-t-2 px-5 py-4 transition-colors",
          status === "right" ? "border-bull/30 bg-bull/10" : status === "wrong" ? "border-bear/30 bg-bear/10" : "border-white/5",
        )}
      >
        {status === "idle" ? (
          <div className="flex items-center gap-3">
            <Btn variant="ghost" size="sm" onClick={() => setPicked([])} disabled={!picked.length}>
              Clear
            </Btn>
            <Btn variant="bull" className="ml-auto min-w-[130px]" disabled={!picked.length} onClick={check} sound={false}>
              Check
            </Btn>
          </div>
        ) : (
          <div className="anim-slide-up flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className={cn("font-display text-sm font-black", status === "right" ? "text-bull" : "text-bear")}>
                {status === "right" ? "Perfect sentence! +15 XP" : "Correct answer:"}
              </div>
              {status === "wrong" && <div className="text-xs font-bold text-ink-200">{S.answer.join(" ")}</div>}
            </div>
            <Btn variant={status === "right" ? "bull" : "bear"} size="sm" onClick={status === "right" ? next : () => { setPicked([]); setStatus("idle"); }}>
              {status === "right" ? "Next" : "Retry"}
            </Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-03 · ORDER THE STEPS — pointer drag-to-reorder with live reflow
 * ===================================================================== */
const STEPS = [
  { t: "Analyze the chart", i: "chart" },
  { t: "Define your entry", i: "target" },
  { t: "Set a stop-loss", i: "shield" },
  { t: "Size the position", i: "pie" },
  { t: "Place the order", i: "swap" },
  { t: "Journal the result", i: "book" },
];
const ROW = 58;

function OrderSteps() {
  const g = useGame();
  const [order, setOrder] = useState<number[]>([2, 0, 4, 1, 5, 3]);
  const [drag, setDrag] = useState<{ id: number; y: number } | null>(null);
  const [checked, setChecked] = useState(false);
  const [fire, setFire] = useState(0);
  const start = useRef({ y: 0, top: 0 });
  const btnRef = useRef<HTMLDivElement>(null);
  const correct = order.every((id, i) => id === i);

  const onDown = (e: React.PointerEvent, id: number) => {
    if (checked && correct) return;
    setChecked(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const idx = order.indexOf(id);
    start.current = { y: e.clientY, top: idx * ROW };
    setDrag({ id, y: idx * ROW });
    sfx("select");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const y = clamp(start.current.top + e.clientY - start.current.y, -12, (STEPS.length - 1) * ROW + 12);
    const to = clamp(Math.round(y / ROW), 0, STEPS.length - 1);
    setDrag({ id: drag.id, y });
    const from = order.indexOf(drag.id);
    if (from !== to) {
      const n = [...order];
      n.splice(from, 1);
      n.splice(to, 0, drag.id);
      setOrder(n);
      sfx("tick");
    }
  };
  const onUp = () => {
    if (drag) sfx("tap");
    setDrag(null);
  };
  const check = () => {
    setChecked(true);
    if (correct) {
      setFire((f) => f + 1);
      sfx("success");
      g.reward("xp", 20, btnRef.current);
    } else sfx("error");
  };
  return (
    <Asset title="Order the Steps" code="G-03" tags="drag reorder sort sequence steps trade plan lesson" span={4}>
      <Confetti fire={fire} />
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Put a safe trade in order</div>
        <Chip tone="azure">Drag ↕</Chip>
      </div>
      <div className="relative select-none" style={{ height: STEPS.length * ROW }}>
        {STEPS.map((s, id) => {
          const idx = order.indexOf(id);
          const isDrag = drag?.id === id;
          const y = isDrag ? drag.y : idx * ROW;
          const ok = checked && idx === id;
          const bad = checked && idx !== id;
          return (
            <div
              key={id}
              onPointerDown={(e) => onDown(e, id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className={cn(
                "absolute inset-x-0 flex h-[50px] cursor-grab items-center gap-3 rounded-2xl border-2 px-3 active:cursor-grabbing",
                isDrag ? "z-20 border-azure bg-ink-700 shadow-[0_12px_28px_rgba(0,0,0,.55),0_4px_0_#1c55c2]" : "z-10 bg-ink-800 shadow-[0_4px_0_#0b1838]",
                ok ? "border-bull bg-bull/10" : bad ? "border-bear/70" : !isDrag && "border-ink-600",
                bad && "anim-shake",
              )}
              style={{
                transform: `translateY(${y}px) scale(${isDrag ? 1.04 : 1}) rotate(${isDrag ? -1.2 : 0}deg)`,
                transition: isDrag ? "box-shadow .2s" : "transform .32s cubic-bezier(.3,1.35,.5,1), border-color .2s, background .2s",
                touchAction: "none",
              }}
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-black", ok ? "bg-bull text-ink-950" : "bg-ink-950/60 text-ink-300")}>
                {ok ? <Icon name="check" size={14} stroke={3.5} /> : idx + 1}
              </span>
              <Icon name={s.i} size={18} className="text-ink-300" />
              <span className="flex-1 text-sm font-extrabold text-white">{s.t}</span>
              <span className="grid grid-cols-2 gap-[3px] opacity-50">
                {Array.from({ length: 6 }).map((_, k) => (
                  <span key={k} className="h-1 w-1 rounded-full bg-ink-200" />
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <div ref={btnRef} className="mt-4 flex items-center gap-3">
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            setOrder(shuffleSeeded([0, 1, 2, 3, 4, 5], Date.now() % 1000));
            setChecked(false);
          }}
        >
          Shuffle
        </Btn>
        <Btn variant={checked && correct ? "bull" : "azure"} size="sm" className="ml-auto" onClick={check} sound={false}>
          {checked && correct ? "Perfect order!" : "Check order"}
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-04 · SPEED ROUND — 30s true/false, swipe or tap, combo multiplier
 * ===================================================================== */
const TF = [
  { s: "Bitcoin's max supply is 21 million coins.", t: true },
  { s: "A stop-loss guarantees you never lose money.", t: false },
  { s: "Higher leverage increases liquidation risk.", t: true },
  { s: "Stablecoins aim to track a fiat currency.", t: true },
  { s: "A green candle means the close was below the open.", t: false },
  { s: "Diversification can reduce portfolio risk.", t: true },
  { s: "Market orders always fill at your exact price.", t: false },
  { s: "RSI above 70 is often called overbought.", t: true },
  { s: "'HODL' means selling at every small dip.", t: false },
  { s: "Gas fees pay for Ethereum transaction processing.", t: true },
  { s: "A bear market is a prolonged price decline.", t: true },
  { s: "Sharing your seed phrase with support is safe.", t: false },
  { s: "Volume measures how much of an asset traded.", t: true },
  { s: "Shorting profits when the price goes up.", t: false },
];

function SpeedRound() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [time, setTime] = useState(30);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ ok: 0, total: 0 });
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [dx, setDx] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("tl-speed-best") || 0));
  const [claimed, setClaimed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mult = Math.min(4, 1 + Math.floor(combo / 3));
  const onFire = mult >= 3;
  const S = TF[i % TF.length];

  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), phase === "play" ? 100 : null);
  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      sfx("levelup");
      if (score > best) {
        setBest(score);
        localStorage.setItem("tl-speed-best", String(score));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, phase]);

  const answer = (v: boolean) => {
    if (phase !== "play") return;
    const ok = v === S.t;
    setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) {
      const pts = 10 * mult;
      setScore((s) => s + pts);
      setCombo((c) => c + 1);
      fx.text(cardRef.current, `+${pts}`, onFire ? "#ff7a2f" : "#22d39a");
      sfx(combo + 1 >= 3 && (combo + 1) % 3 === 0 ? "combo" : "select", 1 + Math.min(combo, 10) * 0.05);
    } else {
      setCombo(0);
      setTime((t) => Math.max(0, t - 3));
      fx.text(cardRef.current, "-3s", "#ff4d6d");
      sfx("error");
    }
    setFlash(ok ? "ok" : "bad");
    setTimeout(() => setFlash(null), 250);
    setDx(0);
    setI((x) => x + 1);
  };
  const drag = useDrag((s) => {
    if (phase !== "play") return;
    if (!s.last) setDx(s.dx);
    else if (Math.abs(s.dx) > 80 || Math.abs(s.vx) > 0.6) answer(s.dx > 0);
    else setDx(0);
  });
  const start = () => {
    setPhase("play");
    setTime(30);
    setScore(0);
    setCombo(0);
    setStats({ ok: 0, total: 0 });
    setI(Math.floor(Math.random() * TF.length));
    setClaimed(false);
    sfx("go");
  };
  const reward = Math.max(5, Math.floor(score / 10));
  return (
    <Asset title="Speed Round · 30s" code="G-04" tags="speed round true false timer combo multiplier swipe fire mode" span={4}>
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") answer(true);
          if (e.key === "ArrowLeft") answer(false);
        }}
        className="relative outline-none"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#0a1330" strokeWidth="6" />
              <circle cx="24" cy="24" r="20" fill="none" stroke={time < 8 ? "#ff4d6d" : "#2fd4ff"} strokeWidth="6" strokeLinecap="round" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - time / 30)} />
            </svg>
            <span className={cn("absolute inset-0 flex items-center justify-center font-mono text-sm font-bold", time < 8 && phase === "play" ? "anim-glow text-bear" : "text-white")}>
              {Math.ceil(time)}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Score</div>
            <div key={score} className="anim-bump font-display text-2xl font-black text-white">
              {score}
            </div>
          </div>
          <div className={cn("rounded-xl px-2.5 py-1.5 text-center font-display font-black transition-all", onFire ? "bg-flame text-white shadow-[0_3px_0_#c24a0c]" : "bg-ink-800 text-ink-300")}>
            <div className="text-[9px] uppercase tracking-wider opacity-80">Mult</div>
            <div key={mult} className="anim-pop text-lg leading-none">×{mult}</div>
          </div>
        </div>

        <div className={cn("relative h-48 rounded-3xl p-[3px] transition-all", onFire && phase === "play" ? "fire-ring" : "bg-transparent")}>
          <div
            ref={cardRef}
            className={cn(
              "relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[22px] p-5 text-center transition-colors",
              flash === "ok" ? "bg-bull/25" : flash === "bad" ? "bg-bear/25" : "bg-ink-850",
            )}
          >
            {phase === "ready" && (
              <div className="anim-pop">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-azure/20 text-azure">
                  <Icon name="bolt" size={30} />
                </div>
                <div className="font-display text-lg font-black text-white">True or False?</div>
                <div className="text-xs font-semibold text-ink-400">Tap, swipe, or use ← →. Best: {best}</div>
              </div>
            )}
            {phase === "play" && (
              <div
                key={i}
                {...drag}
                className="anim-slide-right absolute inset-0 flex cursor-grab items-center justify-center p-6 active:cursor-grabbing"
                style={{ transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`, transition: dx === 0 ? "transform .3s cubic-bezier(.3,1.4,.5,1)" : "none", touchAction: "pan-y" }}
              >
                <span className="absolute left-4 top-4 rounded-lg border-2 border-bear px-2 text-xs font-black text-bear" style={{ opacity: clamp(-dx / 80, 0, 1), transform: "rotate(-12deg)" }}>
                  FALSE
                </span>
                <span className="absolute right-4 top-4 rounded-lg border-2 border-bull px-2 text-xs font-black text-bull" style={{ opacity: clamp(dx / 80, 0, 1), transform: "rotate(12deg)" }}>
                  TRUE
                </span>
                <div className="font-display text-base font-bold leading-snug text-white">{S.s}</div>
              </div>
            )}
            {phase === "over" && (
              <div className="anim-pop">
                <div className="font-display text-3xl font-black text-white">{score}</div>
                <div className="text-xs font-bold text-ink-300">
                  {stats.ok}/{stats.total} correct · {stats.total ? Math.round((stats.ok / stats.total) * 100) : 0}% accuracy
                </div>
                {score >= best && score > 0 && <Chip tone="gold" className="mt-2">★ New best</Chip>}
              </div>
            )}
            {onFire && phase === "play" && (
              <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 text-[10px] font-black uppercase tracking-widest text-flame">
                <FlameIcon size={14} /> On fire
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {phase === "play" ? (
            <>
              <Btn variant="bear" onClick={() => answer(false)} sound={false}>
                <Icon name="x" size={18} stroke={3} /> False
              </Btn>
              <Btn variant="bull" onClick={() => answer(true)} sound={false}>
                <Icon name="check" size={18} stroke={3} /> True
              </Btn>
            </>
          ) : phase === "over" ? (
            <>
              <Btn variant="ghost" onClick={start}>
                Again
              </Btn>
              <Btn
                variant="gold"
                disabled={claimed}
                onClick={(e) => {
                  setClaimed(true);
                  g.reward("xp", reward, e.currentTarget);
                }}
              >
                <XPIcon size={18} /> {claimed ? "Claimed" : `+${reward}`}
              </Btn>
            </>
          ) : (
            <Btn variant="azure" className="col-span-2" onClick={start} sound={false}>
              <Icon name="play" size={16} /> Start round
            </Btn>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-05 · ESTIMATE THE RSI — slider guess + animated reveal + stars
 * ===================================================================== */
function rsiSeries(closes: number[], period = 14) {
  const out: number[] = [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    const gg = Math.max(0, ch);
    const ll = Math.max(0, -ch);
    if (i <= period) {
      gain += gg;
      loss += ll;
      if (i === period) {
        gain /= period;
        loss /= period;
        out.push(100 - 100 / (1 + gain / (loss || 1e-9)));
      }
    } else {
      gain = (gain * (period - 1) + gg) / period;
      loss = (loss * (period - 1) + ll) / period;
      out.push(100 - 100 / (1 + gain / (loss || 1e-9)));
    }
  }
  return out;
}

function EstimateRSI() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const [guess, setGuess] = useState(50);
  const [revealed, setRevealed] = useState(false);
  const footRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const r = mulberry32(round * 911 + 3);
    const drift = [0.55, -0.5, 0.1, 0.8, -0.8, -0.15][round % 6];
    let p = 100;
    const closes = [p];
    for (let i = 0; i < 60; i++) {
      p = p + (r() - 0.5 + drift * 0.45) * 2.2;
      closes.push(p);
    }
    const rsi = rsiSeries(closes);
    return { closes: closes.slice(-40), rsi: rsi.slice(-40), value: Math.round(rsi[rsi.length - 1]) };
  }, [round]);
  const diff = Math.abs(guess - data.value);
  const stars = diff < 5 ? 3 : diff < 12 ? 2 : diff < 20 ? 1 : 0;
  const W = 360;
  const H = 120;
  const min = Math.min(...data.closes);
  const max = Math.max(...data.closes);
  const pricePath = data.closes.map((v, i) => `${i ? "L" : "M"}${(i / 39) * W},${8 + ((max - v) / (max - min || 1)) * (H - 16)}`).join("");
  const rsiPath = data.rsi.map((v, i) => `${i ? "L" : "M"}${(i / 39) * W},${4 + ((100 - v) / 100) * 72}`).join("");
  const submit = () => {
    setRevealed(true);
    if (stars) {
      sfx("success");
      g.reward("xp", stars * 6, footRef.current);
    } else sfx("error");
  };
  const zone = guess < 30 ? "Oversold" : guess > 70 ? "Overbought" : "Neutral";
  return (
    <Asset title="Estimate the RSI" code="G-05" tags="estimate slider guess rsi indicator reveal stars accuracy" span={4}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Guess the RSI (14)</div>
        <Chip tone="violet">Round {round}</Chip>
      </div>
      <div className="panel-inset overflow-hidden rounded-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          <defs>
            <linearGradient id="rsiArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3e8bff" stopOpacity=".35" />
              <stop offset="1" stopColor="#3e8bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pricePath}L${W},${H}L0,${H}Z`} fill="url(#rsiArea)" />
          <path d={pricePath} fill="none" stroke="#5ea0ff" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
        <div className="relative border-t border-white/5">
          <svg viewBox={`0 0 ${W} 80`} className={cn("block w-full transition-all duration-700", !revealed && "blur-md")}>
            <rect x="0" y={4 + 0.3 * 72} width={W} height={0.4 * 72} fill="#3e8bff" opacity=".08" />
            <line x1="0" x2={W} y1={4 + 0.3 * 72} y2={4 + 0.3 * 72} stroke="#ff4d6d" strokeDasharray="4 4" strokeOpacity=".6" />
            <line x1="0" x2={W} y1={4 + 0.7 * 72} y2={4 + 0.7 * 72} stroke="#22d39a" strokeDasharray="4 4" strokeOpacity=".6" />
            <path d={rsiPath} fill="none" stroke="#ffc23d" strokeWidth="2.2" strokeDasharray="900" strokeDashoffset={revealed ? 0 : 900} style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
          </svg>
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-widest text-ink-300">
              <Icon name="lock" size={14} className="mr-1" /> RSI hidden
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-5">
        <div className="absolute inset-x-0 top-[12px] flex h-3 overflow-hidden rounded-full">
          <div className="w-[30%] bg-bull/60" />
          <div className="w-[40%] bg-ink-600" />
          <div className="w-[30%] bg-bear/60" />
        </div>
        {revealed && (
          <div className="anim-pop absolute -top-8 -translate-x-1/2 rounded-lg bg-gold px-2 py-0.5 font-mono text-[11px] font-black text-ink-950 shadow-[0_3px_0_#c2850a]" style={{ left: `${data.value}%` }}>
            {data.value}
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gold" />
          </div>
        )}
        <input type="range" min={0} max={100} value={guess} disabled={revealed} onChange={(e) => { setGuess(+e.target.value); sfx("tick"); }} className="range relative" />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-display text-2xl font-black text-white">{guess}</span>
        <Chip tone={zone === "Oversold" ? "bull" : zone === "Overbought" ? "bear" : "azure"}>{zone}</Chip>
      </div>
      <div ref={footRef} className="mt-4 flex items-center gap-3">
        {revealed ? (
          <>
            <div className="flex gap-1">
              {[0, 1, 2].map((s) => (
                <svg key={s} width="26" height="26" viewBox="0 0 24 24" className="anim-pop" style={{ animationDelay: `${s * 150}ms` }}>
                  <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" fill={s < stars ? "#ffc23d" : "#1c3365"} stroke={s < stars ? "#c2850a" : "#27427d"} strokeWidth="1.5" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-bold text-ink-300">off by {diff}</span>
            <Btn variant="azure" size="sm" className="ml-auto" onClick={() => { setRound((r) => r + 1); setRevealed(false); setGuess(50); }}>
              Next
            </Btn>
          </>
        ) : (
          <Btn variant="bull" size="sm" block onClick={submit} sound={false}>
            Lock in guess
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-06 · PATTERN HUNTER — tap the hidden candle pattern on a real chart
 * ===================================================================== */
type Cd = { o: number; h: number; l: number; c: number };
type PKey = "hammer" | "doji" | "star" | "engulf";
const PATTERNS: Record<PKey, { name: string; desc: string; tone: string }> = {
  hammer: { name: "Hammer", desc: "Small body on top, long lower wick — buyers rejected lower prices after a decline.", tone: "#22d39a" },
  doji: { name: "Doji", desc: "Open ≈ close. Pure indecision — the fight ended in a draw.", tone: "#ffc23d" },
  star: { name: "Shooting Star", desc: "Small body at the bottom, long upper wick — sellers slammed a rally.", tone: "#ff4d6d" },
  engulf: { name: "Bullish Engulfing", desc: "A big green body swallows the prior red body — buyers take control.", tone: "#3e8bff" },
};
const ORDER: PKey[] = ["hammer", "doji", "star", "engulf"];

function isPattern(cs: Cd[], i: number, p: PKey) {
  const c = cs[i];
  const body = Math.abs(c.c - c.o);
  const range = c.h - c.l || 1e-6;
  const upper = c.h - Math.max(c.o, c.c);
  const lower = Math.min(c.o, c.c) - c.l;
  if (p === "hammer") return lower >= body * 2 && upper <= body * 0.7 && body / range < 0.35;
  if (p === "star") return upper >= body * 2 && lower <= body * 0.7 && body / range < 0.35;
  if (p === "doji") return body / range < 0.1;
  const pr = cs[i - 1];
  if (!pr) return false;
  return pr.c < pr.o && c.c > c.o && c.o <= pr.c && c.c >= pr.o && body > Math.abs(pr.c - pr.o);
}

function genPatternChart(p: PKey, seed: number) {
  const r = mulberry32(seed);
  const n = 18;
  const target = 8 + Math.floor(r() * 7);
  const dir = p === "star" ? 1 : p === "doji" ? (r() > 0.5 ? 1 : -1) : -1;
  const cs: Cd[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    if (i === target) {
      const b = price;
      if (p === "hammer") {
        const o = b - 0.15;
        const c = o + 0.55;
        cs.push({ o, c, h: c + 0.12, l: o - 2.9 });
        price = c;
        continue;
      }
      if (p === "star") {
        const o = b + 0.15;
        const c = o - 0.55;
        cs.push({ o, c, h: o + 2.9, l: c - 0.12 });
        price = c;
        continue;
      }
      if (p === "doji") {
        cs.push({ o: b, c: b + 0.04, h: b + 1.5, l: b - 1.4 });
        price = b + 0.04;
        continue;
      }
      const po = cs[i - 2].c;
      const pc = po - 0.7;
      cs[i - 1] = { o: po, c: pc, h: po + 0.2, l: pc - 0.2 };
      const o = pc - 0.25;
      const c = po + 0.6;
      cs.push({ o, c, h: c + 0.2, l: o - 0.2 });
      price = c;
      continue;
    }
    const trend = i < target ? dir : -dir * 0.7;
    const up = r() < 0.5 + trend * 0.3;
    const body = 0.8 + r() * 1.5;
    const o = price;
    const c = up ? o + body : o - body;
    cs.push({ o, c, h: Math.max(o, c) + r() * 0.45, l: Math.min(o, c) - r() * 0.45 });
    price = c;
  }
  const answers = cs.map((_, i) => i).filter((i) => isPattern(cs, i, p));
  return { cs, target, answers };
}

function MiniPattern({ p }: { p: PKey }) {
  const G = "#22d39a";
  const R = "#ff4d6d";
  return (
    <svg viewBox="0 0 40 40" className="h-12 w-12">
      {p === "hammer" && (
        <>
          <line x1="20" x2="20" y1="6" y2="36" stroke={G} strokeWidth="2" />
          <rect x="14" y="6" width="12" height="8" rx="2" fill={G} />
        </>
      )}
      {p === "star" && (
        <>
          <line x1="20" x2="20" y1="4" y2="34" stroke={R} strokeWidth="2" />
          <rect x="14" y="26" width="12" height="8" rx="2" fill={R} />
        </>
      )}
      {p === "doji" && (
        <>
          <line x1="20" x2="20" y1="6" y2="34" stroke="#ffc23d" strokeWidth="2" />
          <rect x="12" y="19" width="16" height="2.5" rx="1" fill="#ffc23d" />
        </>
      )}
      {p === "engulf" && (
        <>
          <line x1="12" x2="12" y1="12" y2="26" stroke={R} strokeWidth="2" />
          <rect x="8" y="14" width="8" height="9" rx="1.5" fill={R} />
          <line x1="27" x2="27" y1="6" y2="34" stroke={G} strokeWidth="2" />
          <rect x="21" y="8" width="12" height="24" rx="2" fill={G} />
        </>
      )}
    </svg>
  );
}

function PatternHunter() {
  const g = useGame();
  const [round, setRound] = useState(0);
  const p = ORDER[round % ORDER.length];
  const { cs, target, answers } = useMemo(() => genPatternChart(p, round * 97 + 11), [p, round]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [found, setFound] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const W = 360;
  const H = 200;
  const max = Math.max(...cs.map((c) => c.h));
  const min = Math.min(...cs.map((c) => c.l));
  const cw = W / cs.length;
  const y = (v: number) => 12 + ((max - v) / (max - min)) * (H - 24);
  const tap = (i: number, el: Element) => {
    if (found !== null) return;
    if (answers.includes(i)) {
      setFound(i);
      sfx("success");
      fx.ring(el, PATTERNS[p].tone);
      g.reward("xp", wrong.length ? 8 : 15, el);
    } else {
      setWrong((w) => [...w, i]);
      setShake((s) => s + 1);
      sfx("error");
    }
  };
  const next = () => {
    setRound((r) => r + 1);
    setWrong([]);
    setFound(null);
  };
  return (
    <Asset title="Pattern Hunter" code="G-06" tags="pattern candle hunt tap chart hammer doji engulfing shooting star find" span={8}>
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="panel-raised flex flex-col rounded-2xl p-4">
          <Label>Find this pattern</Label>
          <div key={p} className="anim-pop flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950/60">
              <MiniPattern p={p} />
            </div>
            <div className="font-display text-lg font-black" style={{ color: PATTERNS[p].tone }}>
              {PATTERNS[p].name}
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-ink-300">{PATTERNS[p].desc}</p>
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-ink-400">
              <span>Misses</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((k) => (
                  <span key={k} className={cn("h-2.5 w-2.5 rounded-full", k < wrong.length ? "bg-bear" : "bg-ink-700")} />
                ))}
              </span>
            </div>
            {wrong.length >= 2 && found === null && <div className="anim-pop mt-2 text-[11px] font-bold text-gold">Hint: look near the glowing zone ✨</div>}
          </div>
        </div>
        <div>
          <div key={shake} className={cn("panel-inset relative overflow-hidden rounded-2xl", shake && "anim-shake")}>
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full select-none">
              {[0.25, 0.5, 0.75].map((gg) => (
                <line key={gg} x1="0" x2={W} y1={H * gg} y2={H * gg} stroke="#16295a" />
              ))}
              {wrong.length >= 2 && found === null && (
                <rect x={(target - 2) * cw} y="0" width={cw * 5} height={H} fill="#ffc23d" opacity=".1" className="anim-glow" />
              )}
              {cs.map((c, i) => {
                const up = c.c >= c.o;
                const col = up ? "#22d39a" : "#ff4d6d";
                const isFound = found === i || (found !== null && p === "engulf" && i === found - 1);
                return (
                  <g key={`${round}-${i}`} style={{ transformOrigin: `${i * cw + cw / 2}px ${H}px`, animation: `bar-grow .45s ${i * 25}ms both cubic-bezier(.3,1.2,.5,1)` }} opacity={found !== null && !isFound ? 0.35 : 1}>
                    <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.8" />
                    <rect x={i * cw + 4} y={y(Math.max(c.o, c.c))} width={cw - 8} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="2" fill={col} />
                    {wrong.includes(i) && (
                      <g className="anim-pop" style={{ transformOrigin: `${i * cw + cw / 2}px ${y(c.h) - 12}px` }}>
                        <circle cx={i * cw + cw / 2} cy={y(c.h) - 12} r="8" fill="#ff4d6d" />
                        <path d={`M${i * cw + cw / 2 - 3},${y(c.h) - 15} l6,6 m0,-6 l-6,6`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </g>
                    )}
                    {found === i && (
                      <rect x={i * cw - (p === "engulf" ? cw : 0) + 1} y={y(c.h) - 8} width={cw * (p === "engulf" ? 2 : 1) - 2} height={y(Math.min(c.l, cs[i - 1]?.l ?? c.l)) - y(c.h) + 16} rx="8" fill="none" stroke={PATTERNS[p].tone} strokeWidth="2.5" strokeDasharray="6 4" className="anim-glow" />
                    )}
                    <rect x={i * cw} y="0" width={cw} height={H} fill="transparent" className="cursor-pointer" onClick={(e) => tap(i, e.currentTarget)} />
                  </g>
                );
              })}
            </svg>
            {found !== null && (
              <div className="anim-slide-up absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-ink-950/85 p-3 ring-1 ring-white/10 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bull text-ink-950">
                  <Icon name="check" size={18} stroke={3.5} />
                </span>
                <div className="flex-1 text-xs font-bold text-white">
                  {PATTERNS[p].name} spotted{wrong.length ? ` after ${wrong.length} miss${wrong.length > 1 ? "es" : ""}` : " on the first try!"}
                </div>
                <Btn variant="bull" size="sm" onClick={next}>
                  Next
                </Btn>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-ink-500">
            <span>Tap directly on the candle</span>
            <span>
              Pattern {(round % ORDER.length) + 1}/{ORDER.length}
            </span>
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function LessonGames() {
  return (
    <>
      <QuizPro />
      <WordBank />
      <OrderSteps />
      <SpeedRound />
      <EstimateRSI />
      <PatternHunter />
    </>
  );
}
