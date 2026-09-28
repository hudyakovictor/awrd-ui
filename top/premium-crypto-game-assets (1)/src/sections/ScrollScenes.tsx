import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Coin, Section, useAnimatedNumber } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp, lerp, map, seeded, useRafLoop, usePageProgress, useScrollProgress, useScrollVelocity, useStickyProgress, useVisible } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 *  SCROLL SCENES — the page itself becomes the controller.
 *  Sticky "scroll-jacked" scenes pin a stage while a tall track scrolls past;
 *  the pinned stage reads a 0..1 progress and choreographs everything from it.
 * =============================================================================*/

/* =============================================================================
 * 1. Horizontal scroll gallery — vertical scroll drives horizontal travel.
 * ============================================================================*/
const JOURNEY = [
  { n: "01", title: "Foundations", text: "Money, wallets, exchanges. What a market actually is.", icon: "wallet", color: "#3da5ff" },
  { n: "02", title: "Candles", text: "Read the fight between buyers and sellers in every bar.", icon: "candles", color: "#22d38a" },
  { n: "03", title: "Trends", text: "Higher highs, lower lows, and the lines that matter.", icon: "trendUp", color: "#ffc53d" },
  { n: "04", title: "Volume", text: "Conviction behind the move — or the lack of it.", icon: "chart", color: "#9b6bff" },
  { n: "05", title: "Risk", text: "Stops, sizing and the maths of staying in the game.", icon: "shield", color: "#ff8a3d" },
  { n: "06", title: "Psychology", text: "FOMO, revenge trades and the discipline to wait.", icon: "heart", color: "#ff4b6e" },
  { n: "07", title: "Mastery", text: "Build a repeatable process and track your edge.", icon: "crown", color: "#14F195" },
];
const H_STICKY = 440;

function HorizontalJourney() {
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(1200);
  const [stageW, setStageW] = useState(800);
  useEffect(() => {
    const measure = () => {
      if (!stage.current || !track.current) return;
      setStageW(stage.current.clientWidth);
      setDistance(Math.max(0, track.current.scrollWidth - stage.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);
  const p = useStickyProgress(outer, { offset: 80, stickyHeight: H_STICKY });
  const x = -p * distance;
  const activeIdx = Math.min(JOURNEY.length - 1, Math.floor(p * JOURNEY.length));

  return (
    <Asset code="SCR-01" title="Horizontal Journey" desc="Scroll down and the course path travels sideways: the stage pins while the page scrolls, each card's artwork parallaxes by its distance from centre." tags={["sticky", "scroll-jack", "horizontal"]} span={3}>
      <div ref={outer} style={{ height: distance + H_STICKY + 80 }} className="relative">
        <div ref={stage} className="sticky top-20 rounded-[24px] overflow-hidden panel" style={{ height: H_STICKY }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(80% 90% at ${20 + p * 60}% 10%, ${JOURNEY[activeIdx].color}33, transparent 60%)`, transition: "background .6s" }} />
          <div className="absolute top-5 left-6 right-6 flex items-center gap-4 z-10">
            <div className="text-[10px] uppercase tracking-[.2em] font-black text-mist">Your learning journey</div>
            <Bar value={p * 100} color="bull" h={6} className="flex-1" shine={false} />
            <span className="num text-xs font-black">{JOURNEY[activeIdx].n}/07</span>
          </div>
          <div ref={track} className="absolute top-16 bottom-6 left-0 flex gap-5 pl-6 pr-[30vw] will-change-transform" style={{ transform: `translate3d(${x}px,0,0)` }}>
            {JOURNEY.map((j, i) => {
              const cardCenter = 24 + i * (300 + 20) + 150 + x;
              const offset = (cardCenter - stageW / 2) / stageW;
              const focus = clamp(1 - Math.abs(offset) * 1.4, 0, 1);
              return (
                <div key={j.n} className="relative w-[300px] shrink-0 rounded-3xl overflow-hidden border" style={{ background: `linear-gradient(165deg, ${j.color}30, #0e1a3b 60%)`, borderColor: `${j.color}${focus > 0.6 ? "88" : "33"}`, transform: `scale(${0.92 + focus * 0.08})`, transition: "border-color .3s" }}>
                  <div className="absolute inset-0 grid place-items-center" style={{ transform: `translate3d(${offset * -60}px, 0, 0)`, color: j.color, opacity: 0.18 + focus * 0.3 }}>
                    <Icon name={j.icon} size={190} stroke={1} />
                  </div>
                  <div className="relative h-full p-5 flex flex-col">
                    <span className="num text-5xl font-black" style={{ color: j.color, opacity: 0.35 + focus * 0.65 }}>{j.n}</span>
                    <div className="mt-auto">
                      <div className="text-2xl font-black">{j.title}</div>
                      <p className="text-xs text-fog/75 mt-1">{j.text}</p>
                      <div className="flex items-center gap-2 mt-3"><Bar value={i < activeIdx ? 100 : i === activeIdx ? (p * JOURNEY.length - i) * 100 : 0} color="bull" h={6} className="flex-1" shine={false} /><span className="text-[9px] font-black text-mist">{i < activeIdx ? "DONE" : i === activeIdx ? "NOW" : "LOCKED"}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-black text-mist flex items-center gap-1.5">
            <Icon name="arrowDown" size={11} className="anim-float" /> keep scrolling
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 2. Scroll-drawn chart — the trade story draws itself as you scroll.
 * ============================================================================*/
const CHART_N = 64;
const CHART_POINTS = (() => {
  const rnd = seeded(42);
  const pts: number[] = [];
  for (let i = 0; i < CHART_N; i++) {
    const t = i / (CHART_N - 1);
    // accumulation → breakout → retest → trend
    const base = t < 0.3 ? 70 + Math.sin(t * 40) * 4 : t < 0.45 ? lerp(70, 42, (t - 0.3) / 0.15) : t < 0.6 ? lerp(42, 52, (t - 0.45) / 0.15) : lerp(52, 16, (t - 0.6) / 0.4);
    pts.push(base + (rnd() - 0.5) * 5);
  }
  return pts;
})();
const STAGES = [
  { at: 0.05, label: "Accumulation", text: "Price ranges quietly. Smart money builds positions.", color: "#8ea3cf" },
  { at: 0.33, label: "Breakout", text: "Volume surges and price closes above the range.", color: "#22d38a" },
  { at: 0.5, label: "Retest", text: "Old resistance is tested as new support. Entry zone.", color: "#ffc53d" },
  { at: 0.72, label: "Trend", text: "Higher highs. Trail the stop, let the winner run.", color: "#3da5ff" },
  { at: 0.95, label: "Take profit", text: "Target reached. Exit by plan, not by emotion.", color: "#9b6bff" },
];

function ScrollChart() {
  const outer = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(outer, { offset: 80, stickyHeight: 460 });
  const X = (i: number) => (i / (CHART_N - 1)) * 100;
  const d = CHART_POINTS.map((v, i) => `${i ? "L" : "M"}${X(i)},${v}`).join(" ");
  const headI = Math.min(CHART_N - 1, Math.floor(p * (CHART_N - 1)));
  const price = Math.round(map(CHART_POINTS[headI], 80, 10, 58000, 74000));
  const stage = [...STAGES].reverse().find((s) => p >= s.at) ?? STAGES[0];
  const pnl = headI > 32 ? ((price - 62000) / 62000) * 100 : 0;

  return (
    <Asset code="SCR-02" title="Scroll-Drawn Trade Story" desc="A sticky chart draws itself with your scroll. Annotations stamp in at each market phase, the price counter follows the pen and the backdrop shifts mood." tags={["sticky", "draw-on", "storytelling"]} span={3}>
      <div ref={outer} className="relative" style={{ height: 1800 }}>
        <div className="sticky top-20 h-[460px] rounded-[24px] overflow-hidden panel grid md:grid-cols-[260px_1fr]">
          <div className="p-6 flex flex-col border-b md:border-b-0 md:border-r border-white/[.06]" style={{ background: `linear-gradient(180deg, ${stage.color}22, transparent)`, transition: "background .5s" }}>
            <div className="flex items-center gap-2"><Coin sym="BTC" size={30} /><span className="text-[10px] uppercase tracking-widest font-black text-mist">BTC / USDT · 4H</span></div>
            <div className="num text-4xl font-black mt-5 tabular-nums">${price.toLocaleString()}</div>
            <div className={cn("num text-sm font-black", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl > 0 ? `+${pnl.toFixed(1)}% since entry` : "Waiting for entry"}</div>
            <div key={stage.label} className="mt-auto anim-rise">
              <div className="text-[10px] uppercase tracking-[.2em] font-black" style={{ color: stage.color }}>Phase</div>
              <div className="text-2xl font-black">{stage.label}</div>
              <p className="text-xs text-mist mt-1">{stage.text}</p>
            </div>
            <div className="flex gap-1 mt-4">{STAGES.map((s) => <span key={s.label} className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ background: p >= s.at ? s.color : "#172856" }} />)}</div>
          </div>
          <div className="relative">
            <svg viewBox="0 0 100 90" preserveAspectRatio="none" className="absolute inset-4 w-[calc(100%_-_2rem)] h-[calc(100%_-_2rem)]">
              {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(140,175,255,.07)" vectorEffect="non-scaling-stroke" />)}
              <rect x="0" y="62" width="30" height="16" fill="rgba(142,163,207,.08)" />
              <path d={`${d} L100,90 L0,90 Z`} fill="url(#scrollFill)" style={{ clipPath: `inset(0 ${100 - p * 100}% 0 0)` }} />
              <defs><linearGradient id="scrollFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#22d38a" stopOpacity=".3" /><stop offset="1" stopColor="#22d38a" stopOpacity="0" /></linearGradient></defs>
              <path d={d} fill="none" stroke="#22d38a" strokeWidth="2.5" pathLength={1} strokeDasharray={`${p} 1`} vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ strokeWidth: 3 }} />
              {p > 0.5 && <line x1={X(30)} x2="100" y1={CHART_POINTS[30]} y2={CHART_POINTS[30]} stroke="#ffc53d" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />}
            </svg>
            <div className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white shadow-[0_0_0_6px_rgba(34,211,138,.3),0_0_20px_#22d38a]" style={{ left: `calc(1rem + (100% - 2rem) * ${X(headI) / 100})`, top: `calc(1rem + (100% - 2rem) * ${CHART_POINTS[headI] / 90})` }} />
            {STAGES.map((s) => p >= s.at && (
              <div key={s.label} className="absolute anim-pop" style={{ left: `calc(1rem + (100% - 2rem) * ${Math.min(0.82, s.at)})`, top: `calc(1rem + (100% - 2rem) * ${CHART_POINTS[Math.floor(s.at * (CHART_N - 1))] / 90} - 44px)` }}>
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg whitespace-nowrap" style={{ background: s.color, color: "#07122d" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 3. Stacking cards — each new card slides over, previous ones recede.
 * ============================================================================*/
const STACK = [
  { title: "Set a goal", text: "10 minutes a day. That's all it takes to build the habit.", icon: "target", color: "#3da5ff" },
  { title: "Learn the pattern", text: "Short, visual lessons with immediate feedback.", icon: "candles", color: "#22d38a" },
  { title: "Practice safely", text: "Simulated funds. Real mechanics. Zero risk.", icon: "shield", color: "#ffc53d" },
  { title: "Compete fairly", text: "Skill-matched duels and weekly leagues.", icon: "bolt", color: "#9b6bff" },
  { title: "Keep the streak", text: "Discipline compounds faster than profits.", icon: "flame", color: "#ff8a3d" },
];

function StackingCards() {
  const outer = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(outer, { offset: 80, stickyHeight: 420 });
  const f = p * (STACK.length - 1); // continuous card index
  return (
    <Asset code="SCR-03" title="Stacking Cards" desc="Each scroll step slides a new card over the deck; earlier cards scale back, dim and tuck upward — the depth reads instantly without any clicks." tags={["sticky", "stack", "depth"]} span={2}>
      <div ref={outer} className="relative" style={{ height: 1500 }}>
        <div className="sticky top-20 h-[420px] rounded-[24px] panel overflow-hidden">
          <div className="absolute inset-0 dotgrid opacity-20" />
          {STACK.map((c, i) => {
            const rel = f - i; // <0 not yet arrived, 0..1 arriving, >0 buried
            const enter = clamp(1 + rel, 0, 1); // 0 → offscreen, 1 → in place
            const buried = Math.max(0, rel);
            const y = (1 - enter) * 420 - buried * 18;
            const scale = 1 - buried * 0.06;
            return (
              <div key={c.title} className="absolute left-6 right-6 top-10 h-72 rounded-3xl p-6 flex flex-col border will-change-transform" style={{
                transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                zIndex: i,
                background: `linear-gradient(160deg, ${c.color}40, #101d42 60%)`,
                borderColor: `${c.color}66`,
                filter: `brightness(${1 - Math.min(0.5, buried * 0.2)})`,
                boxShadow: "0 -10px 30px -12px rgba(0,0,0,.8)",
              }}>
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: `${c.color}33`, color: c.color }}><Icon name={c.icon} size={28} /></div>
                  <span className="num text-5xl font-black text-white/10">0{i + 1}</span>
                </div>
                <div className="mt-auto">
                  <div className="text-3xl font-black">{c.title}</div>
                  <p className="text-sm text-fog/75 mt-1">{c.text}</p>
                </div>
              </div>
            );
          })}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
            {STACK.map((c, i) => <span key={c.title} className="w-1.5 rounded-full transition-all duration-300" style={{ height: Math.round(f) === i ? 22 : 6, background: Math.round(f) === i ? c.color : "#2b4380" }} />)}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 4. Pinned phone — scroll through steps; the device screen follows.
 * ============================================================================*/
const PHONE_STEPS = [
  { title: "Pick today's lesson", text: "A single clear next action every day.", icon: "book", color: "#3da5ff" },
  { title: "Answer with confidence", text: "Instant feedback explains every answer.", icon: "check", color: "#22d38a" },
  { title: "Practice the trade", text: "Place a demo order with a stop and target.", icon: "candles", color: "#ffc53d" },
  { title: "Collect your streak", text: "XP, streak and league rank update live.", icon: "flame", color: "#ff8a3d" },
];

function PhoneScreen({ step }: { step: number }) {
  if (step === 0) return (
    <div className="p-3 pt-10 h-full flex flex-col gap-2">
      <div className="text-[9px] font-black text-mist">GOOD EVENING, ALEX</div>
      <div className="rounded-2xl p-3 bg-gradient-to-br from-[#2d8cf0] to-[#173c88]"><div className="text-[8px] font-black text-white/60">CONTINUE</div><div className="text-sm font-black">Candlestick Patterns</div><Bar value={68} color="gold" h={6} className="mt-3 !bg-black/20" /></div>
      <div className="grid grid-cols-2 gap-2">{["Daily quest", "Arena"].map((t, i) => <div key={t} className="game-surface rounded-xl p-2"><Icon name={i ? "bolt" : "target"} size={14} className={i ? "text-violet" : "text-bull"} /><div className="text-[9px] font-black mt-1">{t}</div></div>)}</div>
    </div>
  );
  if (step === 1) return (
    <div className="p-3 pt-10 h-full flex flex-col gap-2">
      <Bar value={60} color="bull" h={6} />
      <div className="text-[11px] font-black mt-1">Which candle signals a bullish reversal?</div>
      {["Hammer", "Shooting star", "Doji"].map((a, i) => <div key={a} className={cn("rounded-xl border-2 p-2 text-[10px] font-bold", i === 0 ? "border-bull bg-bull/15 text-bull" : "border-ink-600")}>{a}</div>)}
      <div className="mt-auto rounded-xl p-2 bg-[#0f3b33] text-bull text-[9px] font-black flex items-center gap-1"><Icon name="check" size={12} stroke={3} />Excellent! +10 XP</div>
    </div>
  );
  if (step === 2) return (
    <div className="p-3 pt-10 h-full flex flex-col gap-2">
      <div className="flex items-center gap-2"><Coin sym="BTC" size={22} /><span className="num text-sm font-black">$67,421</span></div>
      <svg viewBox="0 0 100 40" className="w-full h-16"><polyline points="0,32 12,28 22,30 34,20 46,24 58,14 70,18 82,8 100,10" fill="none" stroke="#22d38a" strokeWidth="2" /><line x1="0" x2="100" y1="34" y2="34" stroke="#ff4b6e" strokeDasharray="2 2" /><line x1="0" x2="100" y1="6" y2="6" stroke="#22d38a" strokeDasharray="2 2" /></svg>
      <div className="grid grid-cols-2 gap-1.5 text-[8px]"><div className="tile !rounded-lg p-1.5">Stop <b className="text-bear">66,100</b></div><div className="tile !rounded-lg p-1.5">Target <b className="text-bull">70,400</b></div></div>
      <div className="mt-auto h-8 rounded-xl bg-bull text-ink-900 text-[9px] font-black grid place-items-center">PLACE DEMO LONG</div>
    </div>
  );
  return (
    <div className="p-3 pt-10 h-full flex flex-col items-center justify-center gap-2 text-center">
      <Icon name="flame" size={56} fill="#ff8a3d" stroke={1.5} className="text-flame anim-flicker" />
      <div className="num text-3xl font-black text-flame">13</div>
      <div className="text-[10px] font-black uppercase">day streak</div>
      <div className="grid grid-cols-3 gap-1.5 w-full mt-2">{[["+45", "XP"], ["#3", "League"], ["92%", "Acc"]].map(([v, l]) => <div key={l} className="tile !rounded-lg p-1.5"><div className="num text-[10px] font-black text-gold">{v}</div><div className="text-[7px] text-mist">{l}</div></div>)}</div>
    </div>
  );
}

function PinnedPhone() {
  const outer = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(outer, { offset: 80, stickyHeight: 520 });
  const f = p * PHONE_STEPS.length;
  const step = Math.min(PHONE_STEPS.length - 1, Math.floor(f));
  return (
    <Asset code="SCR-04" title="Pinned Product Tour" desc="The phone pins while the narrative scrolls. Step copy highlights with a filling rail, and the device screen slides to the matching state." tags={["sticky", "product tour", "sync"]} span={3}>
      <div ref={outer} className="relative" style={{ height: 2000 }}>
        <div className="sticky top-20 h-[520px] rounded-[24px] panel overflow-hidden grid md:grid-cols-[1fr_300px] gap-6 p-6">
          <div className="flex flex-col justify-center gap-3">
            {PHONE_STEPS.map((s, i) => {
              const local = clamp(f - i, 0, 1);
              const on = i === step;
              return (
                <div key={s.title} className={cn("relative pl-5 py-2 transition-all duration-500", on ? "opacity-100 translate-x-1" : "opacity-40")}>
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-ink-600 overflow-hidden"><span className="absolute inset-x-0 top-0 rounded-full" style={{ height: `${local * 100}%`, background: s.color }} /></span>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${s.color}26`, color: s.color }}><Icon name={s.icon} size={20} /></span>
                    <div><div className="text-lg font-black">{s.title}</div><div className="text-xs text-mist">{s.text}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:grid place-items-center">
            <div className="phone !w-[212px]" style={{ transform: `rotate(${(p - 0.5) * -6}deg)`, transition: "transform .3s" }}>
              <div className="phone-screen">
                {PHONE_STEPS.map((_, i) => (
                  <div key={i} className="absolute inset-0 transition-all duration-500" style={{ opacity: i === step ? 1 : 0, transform: `translate3d(${(i - step) * 40}px,0,0) scale(${i === step ? 1 : 0.94})` }}>
                    <PhoneScreen step={i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 5. Parallax landscape — layered depth driven by element scroll progress.
 * ============================================================================*/
function ParallaxLandscape() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref);
  const t = p - 0.5;
  const climb = clamp(map(p, 0.25, 0.75, 0, 1), 0, 1);
  // mascot follows the near-ridge polyline
  const ridge = [[0, 78], [20, 62], [38, 66], [55, 44], [70, 50], [86, 26], [100, 34]];
  const seg = climb * (ridge.length - 1);
  const k = Math.min(ridge.length - 2, Math.floor(seg));
  const u = seg - k;
  const mx = lerp(ridge[k][0], ridge[k + 1][0], u);
  const my = lerp(ridge[k][1], ridge[k + 1][1], u);
  return (
    <Asset code="SCR-05" title="Parallax Landscape" desc="Six depth layers move at different speeds as the card scrolls through the viewport; the mascot climbs the ridge toward the summit flag." tags={["parallax", "depth", "scroll-linked"]} span={2}>
      <div ref={ref} className="relative h-[380px] rounded-[24px] overflow-hidden" style={{ background: `linear-gradient(180deg, hsl(${230 - p * 20} 60% ${10 + p * 8}%), hsl(${210 - p * 30} 60% ${22 + p * 10}%))` }}>
        <div className="absolute w-24 h-24 rounded-full" style={{ left: "70%", top: `${40 - p * 30}%`, background: "radial-gradient(circle,#ffe08a,#ff8a3d 60%,transparent 70%)", filter: "blur(1px)", opacity: 0.4 + p * 0.6 }} />
        {[0, 1, 2].map((i) => <div key={i} className="absolute h-6 rounded-full bg-white/10" style={{ width: 90 + i * 30, top: `${16 + i * 9}%`, left: `${(i * 30 + p * (40 + i * 20)) % 110 - 10}%` }} />)}
        {[
          { speed: 40, color: "#15285a", pts: "0,70 15,52 30,60 48,38 62,50 78,30 100,46 100,100 0,100" },
          { speed: 90, color: "#0f1f49", pts: "0,76 18,60 34,68 52,50 68,58 84,40 100,56 100,100 0,100" },
          { speed: 150, color: "#0a1638", pts: ridge.map(([x, y]) => `${x},${y}`).join(" ") + " 100,100 0,100" },
        ].map((layer, i) => (
          <svg key={i} viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full h-full" style={{ transform: `translate3d(0, ${t * layer.speed}px, 0)` }}>
            <polygon points={layer.pts} fill={layer.color} />
          </svg>
        ))}
        <div className="absolute inset-0" style={{ transform: `translate3d(0, ${t * 150}px, 0)` }}>
          <div className="absolute" style={{ left: "86%", top: "26%", transform: "translate(-50%,-100%)" }}>
            <div className="w-0.5 h-10 bg-fog" /><div className="absolute top-0 left-0.5 w-6 h-4 bg-bull" style={{ clipPath: "polygon(0 0,100% 50%,0 100%)", animation: "wiggle 1.4s ease-in-out infinite", transformOrigin: "left center" }} />
          </div>
          <div className="absolute" style={{ left: `${mx}%`, top: `${my}%`, transform: "translate(-50%,-92%)" }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#6dbbff] to-[#1f6fd0] shadow-[0_3px_0_rgba(0,0,0,.35)] grid place-items-center" style={{ transform: `rotate(${Math.sin(climb * 40) * 6}deg)` }}>
              <div className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white" /><span className="w-1.5 h-1.5 rounded-full bg-white" /></div>
            </div>
          </div>
        </div>
        <div className="absolute top-4 left-4 glass rounded-xl px-3 py-1.5 text-[10px] font-black">Summit <span className="num text-bull">{Math.round(climb * 100)}%</span></div>
        {climb >= 1 && <div className="absolute top-4 right-4 rounded-xl px-3 py-1.5 bg-gold text-ink-900 text-[10px] font-black anim-pop">Chapter complete!</div>}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 6. Velocity marquee — speed & skew react to how fast you scroll.
 * ============================================================================*/
function VelocityMarquee() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const velocity = useScrollVelocity(visible);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const xA = useRef(0);
  const xB = useRef(0);
  const dir = useRef(1);
  useRafLoop((_, dt) => {
    if (Math.abs(velocity) > 20) dir.current = velocity > 0 ? 1 : -1;
    const speed = 50 + Math.min(900, Math.abs(velocity) * 0.5);
    const wA = (rowA.current?.scrollWidth ?? 2000) / 2;
    const wB = (rowB.current?.scrollWidth ?? 2000) / 2;
    xA.current = (((xA.current - speed * dt * dir.current) % wA) + wA) % wA;
    xB.current = (((xB.current + speed * 0.7 * dt * dir.current) % wB) + wB) % wB;
    const skew = clamp(velocity / 90, -14, 14);
    if (rowA.current) rowA.current.style.transform = `translate3d(${-xA.current}px,0,0) skewX(${-skew}deg)`;
    if (rowB.current) rowB.current.style.transform = `translate3d(${-xB.current}px,0,0) skewX(${skew}deg)`;
  }, visible);
  const wordsA = ["LEARN", "PRACTICE", "COMPETE", "REFLECT", "EARN"];
  const wordsB = ["BTC", "ETH", "SOL", "TON", "BNB", "DOGE"];
  return (
    <Asset code="SCR-06" title="Velocity Marquee" desc="Scroll faster and the type speeds up and skews; scroll up and both lanes reverse. Transforms are written directly to the DOM each frame — no React re-render per frame." tags={["scroll velocity", "skew", "direct DOM"]} span={3}>
      <div ref={box} className="rounded-[24px] overflow-hidden panel py-6 space-y-3 select-none">
        <div className="overflow-hidden">
          <div ref={rowA} className="flex w-max will-change-transform">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex">
                {wordsA.map((w, i) => (
                  <span key={w} className="text-6xl sm:text-7xl font-black tracking-tight px-6 flex items-center gap-6" style={{ WebkitTextStroke: i % 2 ? "2px #3da5ff" : undefined, color: i % 2 ? "transparent" : "#eef3ff" }}>
                    {w}<Icon name="sparkle" size={34} className="text-gold" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div ref={rowB} className="flex w-max will-change-transform">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex">
                {wordsB.map((w) => (
                  <span key={w} className="flex items-center gap-3 px-5 py-2 mx-2 rounded-2xl game-surface">
                    <Coin sym={w} size={34} /><span className="text-2xl font-black">{w}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="text-center text-[10px] uppercase tracking-widest font-black text-mist">scroll velocity <span className="num text-sky">{Math.round(velocity)}</span> px/s</div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 7. Word-by-word reveal — a manifesto that lights up as you read.
 * ============================================================================*/
const MANIFESTO = "Markets reward patience, not prediction. Every trade starts with a plan, a stop and a size you can live with. Learn the patterns, respect the risk, and let discipline compound — one lesson, one day, one decision at a time.";
const HIGHLIGHT = new Set(["patience,", "plan,", "stop", "discipline", "compound", "decision"]);

function WordReveal() {
  const outer = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(outer, { offset: 80, stickyHeight: 360 });
  const words = MANIFESTO.split(" ");
  const lit = p * (words.length + 4);
  return (
    <Asset code="SCR-07" title="Word-by-Word Reveal" desc="A pinned manifesto whose words ignite in reading order with your scroll; key concepts glow in brand colour once lit." tags={["sticky", "text reveal", "reading"]} span={3}>
      <div ref={outer} className="relative" style={{ height: 1300 }}>
        <div className="sticky top-20 h-[360px] rounded-[24px] panel grid place-items-center p-8 overflow-hidden">
          <p className="text-2xl sm:text-4xl font-black leading-[1.18] tracking-tight max-w-4xl">
            {words.map((w, i) => {
              const a = clamp(lit - i, 0, 1);
              const key = HIGHLIGHT.has(w.toLowerCase());
              return (
                <span key={i} className="inline-block mr-[.28em] transition-colors duration-300" style={{ opacity: 0.12 + a * 0.88, color: key && a > 0.9 ? "#22d38a" : undefined, transform: `translateY(${(1 - a) * 6}px)`, textShadow: key && a > 0.9 ? "0 0 24px rgba(34,211,138,.45)" : undefined }}>{w}</span>
              );
            })}
          </p>
          <div className="absolute bottom-4 left-8 right-8"><Bar value={p * 100} color="bull" h={4} shine={false} /></div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 8. Counters on view — re-trigger every time the card enters the viewport.
 * ============================================================================*/
function CountersOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref, "0px");
  const stats = [
    { label: "Lessons completed", value: 48210, color: "#22d38a", pct: 82 },
    { label: "Demo trades placed", value: 126400, color: "#3da5ff", pct: 64 },
    { label: "Avg. accuracy", value: 87, suffix: "%", color: "#ffc53d", pct: 87 },
    { label: "Longest streak", value: 412, suffix: "d", color: "#ff8a3d", pct: 45 },
  ];
  return (
    <Asset code="SCR-08" title="Counters on View" desc="Numbers count up and bars fill in a stagger whenever the card enters the viewport — and gently rewind when it leaves, ready to replay." tags={["in-view", "count-up", "stagger"]}>
      <div ref={ref} className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => <CounterTile key={s.label} {...s} on={visible} delay={i * 120} />)}
      </div>
    </Asset>
  );
}

function CounterTile({ label, value, suffix = "", color, pct, on, delay }: { label: string; value: number; suffix?: string; color: string; pct: number; on: boolean; delay: number }) {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setTarget(on ? value : 0), on ? delay : 0);
    return () => window.clearTimeout(t);
  }, [on, value, delay]);
  const shown = useAnimatedNumber(target, 1300);
  return (
    <div className="game-surface rounded-2xl p-3">
      <div className="num text-2xl font-black" style={{ color }}>{Math.round(shown).toLocaleString()}{suffix}</div>
      <div className="text-[9px] uppercase tracking-wider font-black text-mist mb-2">{label}</div>
      <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden"><div className="h-full rounded-full" style={{ width: on ? `${pct}%` : "0%", background: color, transition: `width 1.2s cubic-bezier(.2,.9,.3,1) ${on ? delay : 0}ms` }} /></div>
    </div>
  );
}

/* =============================================================================
 * 9. Page orbit — global scroll progress with section waypoints.
 * ============================================================================*/
function PageOrbit() {
  const p = usePageProgress();
  const R = 52, C = 2 * Math.PI * R;
  const marks = [0.08, 0.2, 0.38, 0.55, 0.72, 0.9];
  return (
    <Asset code="SCR-09" title="Page Orbit" desc="Whole-page progress as an orbit: the comet rides your scroll position, waypoints light as you pass them, and the button returns you to the top." tags={["page progress", "waypoints"]}>
      <div className="grid place-items-center py-2">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#172856" strokeWidth="8" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="url(#orbitG)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
            <defs><linearGradient id="orbitG" x1="0" x2="1"><stop offset="0" stopColor="#3da5ff" /><stop offset="1" stopColor="#22d38a" /></linearGradient></defs>
            {marks.map((m) => <circle key={m} cx={60 + Math.cos(m * Math.PI * 2) * R} cy={60 + Math.sin(m * Math.PI * 2) * R} r="4" fill={p >= m ? "#ffc53d" : "#2b4380"} stroke="#0a1330" strokeWidth="2" />)}
            <circle cx={60 + Math.cos(p * Math.PI * 2) * R} cy={60 + Math.sin(p * Math.PI * 2) * R} r="7" fill="#fff" style={{ filter: "drop-shadow(0 0 6px #22d38a)" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div><div className="num text-3xl font-black">{Math.round(p * 100)}%</div><div className="text-[9px] uppercase tracking-widest font-black text-mist">explored</div></div>
          </div>
        </div>
      </div>
      <Btn variant="sky" size="sm" block icon="arrowUp" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</Btn>
    </Asset>
  );
}

export default function ScrollScenes() {
  return (
    <Section id="scroll-scenes" index="P4" title="Scroll Scenes" subtitle="The page is the controller: pinned stages, horizontal travel, drawn charts, stacking cards, parallax depth and velocity-reactive type.">
      <HorizontalJourney />
      <ScrollChart />
      <StackingCards />
      <CountersOnView />
      <PinnedPhone />
      <ParallaxLandscape />
      <PageOrbit />
      <VelocityMarquee />
      <WordReveal />
    </Section>
  );
}
