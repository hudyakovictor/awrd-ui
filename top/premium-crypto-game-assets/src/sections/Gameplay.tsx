import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Coin, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { Avatar } from "./Gamification";
import { clamp, lerp, usePointer, useRafLoop, useScrollProgress, useReduceMotion, useSpringNumber } from "../components/motion";

// Tiny helper used by JSX className
function cn(...parts: any[]) {
  return parts.filter(Boolean).join(" ");
}

/* =============================================================================
 *  GAMEPLAY
 *  Thirteen crafted interactions form a real gameplay layer:
 *   1. Skill Path camera (scroll-tied parallax with walking mascot)
 *   2. Drag carousel (real pointer math, snap, edge friction)
 *   3. 3D pointer tilt card (3 parallax layers + sheen)
 *   4. Swipe match duel deck (drag momentum, reveal)
 *   5. Scroll reveal stack (six cards tied to one progress)
 *   6. Live reflex arena (real 2s reaction drill)
 *   7. Animated leaderboard (FLIP reorder)
 *   8. Quest wheel (draggable rotation with snap)
 *   9. Parallax cover flow (3D depth)
 *  10. Live event ticker (two synced marquees)
 *  11. Memory dots mini-game
 *  12. Reaction trainer mini-game
 *  13. Gesture hint sheet
 * =============================================================================*/

/* ----------------------------------------------------------------------------
 * 1. Skill Path Camera · scroll-tied
 * ------------------------------------------------------------------------- */
type PathNode = { id: number; kind: "lesson" | "chest" | "boss"; x: number; y: number; status: "done" | "active" | "locked"; title: string; xp: number };

function SkillPathCamera() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState<PathNode | null>(null);
  const [burst, setBurst] = useState(0);

  const NODES: PathNode[] = [
    { id: 1, kind: "lesson", x: 10, y: 80, status: "done", title: "Money basics", xp: 10 },
    { id: 2, kind: "lesson", x: 18, y: 64, status: "done", title: "Crypto wallet 101", xp: 12 },
    { id: 3, kind: "chest", x: 32, y: 50, status: "done", title: "First chest", xp: 25 },
    { id: 4, kind: "lesson", x: 44, y: 40, status: "active", title: "Read a candlestick", xp: 15 },
    { id: 5, kind: "lesson", x: 56, y: 32, status: "locked", title: "Spot the pattern", xp: 20 },
    { id: 6, kind: "boss", x: 70, y: 28, status: "locked", title: "Chart duel", xp: 80 },
    { id: 7, kind: "lesson", x: 84, y: 18, status: "locked", title: "Risk plans", xp: 18 },
    { id: 8, kind: "chest", x: 92, y: 10, status: "locked", title: "Final reward", xp: 50 },
  ];

  const progress = useScrollProgress(sceneRef);
  const pathIndex = clamp(progress * (NODES.length - 1), 0, NODES.length - 1);
  const low = Math.floor(pathIndex);
  const high = clamp(low + 1, 0, NODES.length - 1);
  const segment = pathIndex - low;
  const targetX = lerp(NODES[low].x, NODES[high].x, segment);
  const targetY = lerp(NODES[low].y, NODES[high].y, segment);
  const mascotX = useSpringNumber(targetX, { stiffness: 150, damping: 24 });
  const mascotY = useSpringNumber(targetY, { stiffness: 150, damping: 24 });

  return (
    <Asset
      code="PLY-01"
      title="Skill Path Camera"
      desc="Scroll the page; the camera pans along the unit path, the mascot walks with procedural step, and nodes light up as the camera passes them."
      tags={["scroll-tied", "parallax", "mascot"]}
      span={3}
    >
      <div ref={sceneRef} className="relative h-[520px] rounded-[24px] overflow-hidden panel">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg,#041121 0%,#0a1f4a 35%,#142b6c 70%,#1c377d 100%)",
          transform: `translate3d(0, ${(progress || 0) * 90 - 60}px, 0)`,
        }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ transform: `translate3d(0, ${(progress || 0) * 60 - 40}px, 0)` }}>
          {Array.from({ length: 28 }).map((_, index) => {
            const seed = (index * 59 + 13) % 100;
            const top = (seed * 7) % 60;
            return <circle key={index} cx={(index * 17 + 4) % 100} cy={top} r={(seed % 10) / 9 + 0.4} fill="#eef3ff" opacity="0.55" />;
          })}
        </svg>
        <svg className="absolute inset-x-0 bottom-0 w-full h-3/4" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ transform: `translate3d(0, ${(progress || 0) * 30}px, 0)` }}>
          <polygon points="0,100 18,82 36,90 52,76 70,86 100,80 100,100" fill="#0c1f48" />
          <polygon points="0,100 22,94 42,84 60,92 78,86 100,90 100,100" fill="#04081c" />
        </svg>
        <div className="absolute inset-x-0 top-6 bottom-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2" style={{ width: "320%", transform: `translate3d(${50 - mascotX * 1.55}%, -50%, 0)`, willChange: "transform" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[440px] absolute inset-x-0 top-1/2 -translate-y-1/2">
              <path d="M2,80 C8,68 14,58 18,54 S30,38 38,30 S60,22 70,18 S88,8 98,4" fill="none" stroke="#3da5ff" strokeWidth="0.8" strokeDasharray="1 2" />
            </svg>
            {NODES.map((node) => (
              <button
                key={node.id}
                onClick={() => setReveal(node)}
                className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center transition-all",
                  node.status === "done" && "w-10 h-10 bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#3a2500] shadow-[0_5px_0_#b07600]",
                  node.status === "active" && "w-14 h-14 bg-gradient-to-b from-[#3ce49e] to-[#16b56f] text-white shadow-[0_7px_0_#0b7a4a] anim-pulse-ring",
                  node.status === "locked" && "w-10 h-10 bg-gradient-to-b from-[#263a6a] to-[#1c2b52] text-mist shadow-[0_5px_0_#0b1430]",
                  node.kind === "boss" && node.status !== "active" && "!w-12 !h-12 !rounded-2xl",
                  node.kind === "chest" && !["done", "active"].includes(node.status) && "!w-12 !h-12 !rounded-2xl",
                )}
                style={{ left: `${node.x}%`, top: `${node.y}%`, ["--ring" as string]: "rgba(34,211,138,.4)" }}
              >
                <Icon name={node.kind === "chest" ? "gift" : node.kind === "boss" ? "crown" : node.status === "done" ? "check" : node.status === "active" ? "star" : "lock"} size={node.status === "active" ? 22 : 18} stroke={2.6} fill={(node.status === "done" || node.status === "active") && node.kind !== "boss" && node.kind !== "chest" ? "currentColor" : "none"} className={node.status === "active" ? "anim-wiggle" : "opacity-70"} />
              </button>
            ))}
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${mascotX}%`, top: `${mascotY}%`, willChange: "left, top" }}>
              <div className="relative">
                <div className="absolute -inset-3 bg-bull/30 rounded-full blur-md anim-glow" style={{ left: -8, top: -8, right: -8, bottom: -8 }} />
                <svg viewBox="0 0 80 80" width="60" height="60" style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,.35))" }}>
                  <ellipse cx="40" cy="46" rx="22" ry="22" fill="#1a56a8" />
                  <ellipse cx="40" cy="42" rx="22" ry="22" fill="url(#pip)" />
                  <defs><linearGradient id="pip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6dbbff" /><stop offset="1" stopColor="#2d8cf0" /></linearGradient></defs>
                  <path d="M20 14 Q12 12 14 4 18 12 26 18" fill="#ffc53d" stroke="#b07600" strokeWidth="1" />
                  <path d="M60 14 Q68 12 66 4 62 12 54 18" fill="#ffc53d" stroke="#b07600" strokeWidth="1" />
                  <ellipse cx="32" cy="40" rx="3" ry="3.4" fill="#fff" />
                  <ellipse cx="48" cy="40" rx="3" ry="3.4" fill="#fff" />
                  <circle cx={32 + (progress || 0) * 1.4} cy="40" r="1.6" fill="#07122d" />
                  <circle cx={48 + (progress || 0) * 1.4} cy="40" r="1.6" fill="#07122d" />
                  <path d="M34 50 Q40 54 46 50" fill="none" stroke="#1a56a8" strokeWidth="2" strokeLinecap="round" />
                  <g style={{ transformOrigin: "32px 60px" }}><rect x="28" y="58" width="6" height="14" rx="3" fill="#1a56a8" style={{ transform: `rotate(${Math.sin((progress || 0) * 30) * 18}deg)` }} /></g>
                  <g style={{ transformOrigin: "48px 60px" }}><rect x="46" y="58" width="6" height="14" rx="3" fill="#1a56a8" style={{ transform: `rotate(${-Math.sin((progress || 0) * 30) * 18}deg)` }} /></g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
          <div className="glass rounded-2xl px-3 py-1.5 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-bull anim-live" /><span className="text-[9px] uppercase tracking-widest font-black text-bull">Live chapter</span></div>
          <div className="glass rounded-2xl px-3 py-1.5 flex items-center gap-2 flex-1"><span className="text-[9px] uppercase tracking-widest font-black text-fog/70">Position</span><span className="num text-xs font-black">{Math.round((progress || 0) * 100)}%</span><div className="flex-1"><Bar value={(progress || 0) * 100} color="bull" h={6} /></div></div>
          <div className="glass rounded-2xl px-3 py-1.5 flex items-center gap-2"><Icon name="bolt" size={14} fill="#ffc53d" className="text-gold" /><span className="num text-xs font-black text-gold">{Math.round((progress || 0) * 230)} XP</span></div>
        </div>
        {reveal && (
          <div className="absolute bottom-4 left-4 right-4 panel !rounded-2xl p-3 flex items-center gap-3 anim-bounce-in">
            <Confetti burst={burst} count={28} />
            <div className="w-10 h-10 rounded-xl bg-sky/15 text-sky grid place-items-center"><Icon name={reveal.kind === "boss" ? "crown" : reveal.kind === "chest" ? "gift" : "book"} size={20} /></div>
            <div className="flex-1"><div className="text-[8px] uppercase tracking-widest font-black text-mist">{reveal.kind}</div><div className="font-black">{reveal.title}</div></div>
            <div className="text-right"><div className="num text-xs font-black text-bull">+{reveal.xp} XP</div></div>
            <Btn variant="bull" size="xs" onClick={() => { setReveal(null); if (reveal.kind === "lesson" || reveal.kind === "boss") { setBurst((x) => x + 1); } }}>{reveal.status === "locked" ? "Locked" : "Start"}</Btn>
          </div>
        )}
        <div className="absolute bottom-3 right-3 text-[8px] uppercase tracking-widest font-black text-mist">Scroll to walk the path</div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 2. Gesture Carousel · real drag math
 * ------------------------------------------------------------------------- */
type CarouselItem = { id: string; title: string; sub: string; icon: string; color: string; variant: "bull" | "sky" | "gold" | "violet" | "flame" };

function GestureCarousel() {
  const items: CarouselItem[] = [
    { id: "risk", title: "Risk first", sub: "Auto stop & take-profit", icon: "shield", color: "#22d38a", variant: "bull" },
    { id: "trend", title: "Trend follow", sub: "Ride winners, cut losers", icon: "trendUp", color: "#3da5ff", variant: "sky" },
    { id: "rev", title: "Mean reversion", sub: "Return to fair value", icon: "refresh", color: "#ffc53d", variant: "gold" },
    { id: "btm", title: "Bottom hunting", sub: "Find capitulation wicks", icon: "target", color: "#9b6bff", variant: "violet" },
    { id: "brk", title: "Breakout", sub: "Volume-confirmed range exit", icon: "bolt", color: "#ff8a3d", variant: "flame" },
    { id: "hed", title: "Hedge", sub: "Reduce exposure", icon: "layers", color: "#ff4b6e", variant: "bull" },
  ];
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, lastX: 0, lastT: 0 });
  const [idx, setIdx] = useState(2);
  const [offset, setOffset] = useState(0);
  const reduce = useReduceMotion();
  const ITEM_W = 220;
  const GAP = 16;

  useEffect(() => {
    setOffset(-((ITEM_W + GAP) * idx));
  }, [idx]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { down: true, startX: e.clientX, lastX: e.clientX, lastT: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    setOffset(-((ITEM_W + GAP) * idx) + dx);
    drag.current.lastX = e.clientX;
    drag.current.lastT = performance.now();
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const dx = e.clientX - drag.current.startX;
    const dt = Math.max(40, performance.now() - drag.current.lastT);
    const velocity = (dx / dt) * 240;
    const flick = velocity > 1 ? 1 : velocity < -1 ? -1 : 0;
    const target = idx + Math.round(flick + dx / (ITEM_W + GAP));
    setIdx(clamp(target, 0, items.length - 1));
  };
  const moveBy = (d: number) => setIdx((x) => clamp(x + d, 0, items.length - 1));

  return (
    <Asset
      code="PLY-02"
      title="Gesture Carousel"
      desc="Pointer-driven horizontal carousel with edge friction, flick detection and snap-by-item."
      tags={["drag", "snap", "swipe"]}
    >
      <div className="relative overflow-hidden rounded-[24px] panel p-3 mb-3">
        <div className="absolute inset-0 dotgrid opacity-30" />
        <div
          ref={trackRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="flex gap-4 select-none cursor-grab active:cursor-grabbing"
          style={{ width: `${items.length * (ITEM_W + GAP) + 200}px`, transform: `translate3d(${offset}px, 0, 0)`, willChange: "transform" }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") moveBy(1);
            if (e.key === "ArrowLeft") moveBy(-1);
          }}
        >
          {items.map((item, i) => {
            const dist = Math.abs(i - idx);
            const scale = 1 - Math.min(0.18, dist * 0.1);
            const op = 1 - Math.min(0.75, dist * 0.22);
            const rotateY = (i - idx) * 6;
            const isActive = i === idx;
            return (
              <div
                key={item.id}
                onClick={() => setIdx(i)}
                className="relative shrink-0 transition-all"
                style={{
                  width: ITEM_W,
                  height: 220,
                  transform: `perspective(900px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: op,
                }}
              >
                <div
                  className="h-full w-full game-surface rounded-3xl p-4 flex flex-col relative overflow-hidden"
                  style={{
                    boxShadow: isActive ? `inset 0 0 0 2px ${item.color}aa, 0 24px 60px -22px ${item.color}55` : "inset 0 1px 0 rgba(255,255,255,.08), 0 14px 30px -18px rgba(0,0,0,.7)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl grid place-items-center" style={{ color: item.color, background: `${item.color}1f`, border: `1px solid ${item.color}55` }}>
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-mist">#{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-auto">
                    <div className="text-lg font-black">{item.title}</div>
                    <p className="text-xs text-mist mt-1">{item.sub}</p>
                    <Btn variant={item.variant} size="xs" className="mt-3">Select</Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => moveBy(-1)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevL" size={16} stroke={3} /></button>
        <div className="flex gap-1.5 flex-1 justify-center">
          {items.map((item, i) => <button key={item.id} onClick={() => setIdx(i)} className={cn("h-2 rounded-full transition-all", i === idx ? "w-8 bg-fog" : "w-2 bg-ink-600")} aria-label={`item ${i + 1}`} />)}
        </div>
        <button onClick={() => moveBy(1)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevR" size={16} stroke={3} /></button>
      </div>
      <div className="text-[9px] text-mist mt-2 flex items-center gap-2"><span className="anim-nudge">▶</span> drag horizontally · ← → keys · {reduce ? "reduced motion" : "spring on"}</div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 3. 3D Pointer Tilt Card
 * ------------------------------------------------------------------------- */
function TiltShowcase() {
  const { ref, point } = usePointer();
  const [hover, setHover] = useState(false);
  return (
    <Asset
      code="PLY-03"
      title="3D Pointer Tilt"
      desc="Multiple layers parallax independently; sheen tracks the cursor; depth reveals on hover."
      tags={["3D", "tilt", "parallax", "sheen"]}
      span={2}
    >
      <div
        ref={ref as React.MutableRefObject<HTMLDivElement>}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="relative panel overflow-hidden p-6"
        style={{ background: "linear-gradient(125deg,#0a1432,#142348 50%,#0e1a3b)", minHeight: 360 }}
      >
        <div className="text-[10px] uppercase tracking-[.2em] font-black text-violet mb-3">Pointer-aware card</div>
        <div className="relative h-72 grid place-items-center" style={{ transform: `perspective(800px) rotateX(${(0.5 - point.y) * 12}deg) rotateY(${(point.x - 0.5) * 14}deg)`, transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 dotgrid rounded-2xl opacity-50" style={{ transform: `translate3d(${(point.x - 0.5) * -14}px, ${(point.y - 0.5) * -10}px, -50px)` }} />
          <div className="absolute left-3 right-3 top-3 rounded-xl bg-ink-900/85 p-3" style={{ transform: `translate3d(${(0.5 - point.x) * 22}px, ${(0.5 - point.y) * 14}px, -20px)`, willChange: "transform" }}>
            <div className="flex items-center gap-2"><Coin sym="BTC" size={28} /><span className="text-[9px] uppercase tracking-widest text-mist font-black">5m chart</span></div>
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <polyline points={Array.from({ length: 28 }).map((_, i) => `${(i / 27) * 200},${30 + Math.sin(i / 2 + point.x * 3) * 12}`).join(" ")} fill="none" stroke="#22d38a" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative z-10" style={{ transform: `translate3d(${(0.5 - point.x) * 36}px, ${(0.5 - point.y) * 22}px, 30px)` }}>
            <Coin sym="ETH" size={92} />
          </div>
          <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity" style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(circle at ${point.x * 100}% ${point.y * 100}%, rgba(255,255,255,.18), rgba(255,255,255,0) 50%)`,
          }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Tilt X", value: ((point.x - 0.5) * 14).toFixed(1) },
            { label: "Tilt Y", value: ((0.5 - point.y) * 12).toFixed(1) },
            { label: "Depth", value: "30px" },
          ].map((s) => (
            <div key={s.label} className="tile !rounded-xl p-2 text-center">
              <div className="num font-black text-sky">{s.value}{s.label === "Depth" ? "" : "°"}</div>
              <div className="text-[8px] uppercase tracking-wider font-black text-mist">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 4. Swipe Match Cards · Tinder-style duels
 * ------------------------------------------------------------------------- */
function SwipeMatch() {
  const cards = [
    { id: 1, opponent: "Mia", avatarHue: 332, rating: 1480, mode: "Pattern sprint", topic: "Hammer & star", accent: "#3da5ff", bigPick: "Long" },
    { id: 2, opponent: "Max", avatarHue: 70, rating: 1220, mode: "Speed", topic: "BTC in 24h", accent: "#22d38a", bigPick: "Wait" },
    { id: 3, opponent: "Dana", avatarHue: 90, rating: 1320, mode: "Patterns", topic: "Volume divergence", accent: "#ffc53d", bigPick: "Short" },
  ];
  const [stack, setStack] = useState([...cards].reverse());
  const [decision, setDecision] = useState<string | null>(null);

  const next = (dir: "Yes" | "No") => {
    setStack([...stack.slice(0, -1)]);
    setDecision(dir);
    setTimeout(() => setDecision(null), 350);
  };

  return (
    <Asset code="PLY-04" title="Swipe Match Cards" desc="Drag a card left/right to agree or disagree with another player's read. Buttons and keyboard shortcut mirror the gesture." tags={["tinder", "swipe", "duel"]}>
      <div className="relative h-[520px] rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-x-0 top-3 flex justify-center gap-2 z-10">
          <button onClick={() => next("No")} className="btn3d v-bear w-12 h-12 !p-0 !rounded-full" style={{ ["--lip" as string]: "4px" }} aria-label="Disagree"><Icon name="x" size={19} stroke={3} /></button>
          <button onClick={() => next("Yes")} className="btn3d v-bull w-12 h-12 !p-0 !rounded-full" style={{ ["--lip" as string]: "4px" }} aria-label="Agree"><Icon name="check" size={19} stroke={3} /></button>
        </div>
        {stack.map((card, i) => (
          <SwipeCard
            key={card.id}
            card={{ ...card, idx: i }}
            total={stack.length}
            onDecide={next}
            top={i === stack.length - 1}
          />
        ))}
        <div className={cn("absolute bottom-4 left-3 right-3 text-center text-[9px] font-black uppercase tracking-widest text-mist", decision && "anim-rise text-fog")}>{decision ?? `Drag the top card · ${stack.length} plays left`}</div>
      </div>
    </Asset>
  );
}

function SwipeCard({ card, total, onDecide, top }: { card: any; index?: number; total: number; onDecide: (d: "Yes" | "No") => void; top: boolean }) {
  const drag = useRef({ down: false, startX: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const render = useRef(0);
  const [, force] = useState(0);

  useRafLoop(() => {
    target.current = lerp(target.current, 0, 0.18);
    if (Math.abs(target.current) > 280) {
      onDecide(target.current > 0 ? "Yes" : "No");
      target.current = 0;
    }
    render.current++;
    if (render.current % 2 === 0) force((x) => x + 1);
  });

  useEffect(() => { /* keep state in sync with prop change */ }, [top]);
  const isTopRef = useRef(top);
  isTopRef.current = top;
  const onDown = (e: React.PointerEvent) => {
    if (!isTopRef.current) return;
    drag.current = { down: true, startX: e.clientX };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    target.current = e.clientX - drag.current.startX;
    force((x) => x + 1);
  };
  const onUp = () => {
    drag.current.down = false;
  };

  return (
    <div
      ref={wrap}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={cn("absolute inset-x-4 top-20 bottom-12 cursor-grab", top ? "active:cursor-grabbing" : "")}
    >
      <div
        className={cn("h-full w-full rounded-[26px] border-2 border-ink-600 bg-ink-900 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_24px_50px_-22px_rgba(0,0,0,.85)] relative", !top && "opacity-95")}
        style={{
          transform: `translate3d(${target.current}px, 0, 0) rotate(${target.current * 0.04}deg)`,
          zIndex: 10 - (total - (card.idx ?? 0)),
        }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${card.accent}22 0%, transparent 50%)` }} />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="num text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded-md text-white" style={{ background: card.accent }}>DUEL · {card.mode}</span>
          <span className="num text-[9px] text-mist">{(card.idx ?? 0) + 1}/{total}</span>
        </div>
        <div className="absolute top-16 left-0 right-0 text-center">
          <Avatar name={card.opponent} size={80} ring="bull" hue={card.avatarHue} />
          <div className="font-black text-2xl mt-2">vs {card.opponent}</div>
          <div className="num text-[10px] text-mist">{card.rating} rating</div>
          <div className="text-xs text-mist mt-1">{card.topic}</div>
        </div>
        <div className="absolute inset-x-4 bottom-16">
          <div className="rounded-2xl p-3 game-surface">
            <div className="text-[9px] uppercase tracking-widest font-black text-mist">Their pick</div>
            <div className="text-2xl font-black" style={{ color: card.accent }}>{card.bigPick}</div>
          </div>
        </div>
        {Math.abs(target.current) > 60 && (
          <div className={cn("absolute top-12 text-white text-xs font-black px-3 py-1.5 rounded-lg anim-rise", target.current > 0 ? "right-12 bg-bull rotate-12" : "left-12 bg-bear -rotate-12")}>{target.current > 0 ? "AGREE" : "DISAGREE"}</div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * 5. Scroll reveal stack
 * ------------------------------------------------------------------------- */
function ScrollRevealShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reveal = useScrollProgress(ref);
  const cards = [
    { icon: "candles", title: "Live practice", detail: "Simulated market with realistic timing.", color: "bull" },
    { icon: "shield", title: "Risk discipline", detail: "Every trade has a stop and a plan.", color: "sky" },
    { icon: "trophy", title: "Skill leagues", detail: "Promotion zones, not pay-to-win.", color: "gold" },
    { icon: "users", title: "Learn together", detail: "Clubs, async challenges, shared wins.", color: "violet" },
    { icon: "chart", title: "Real concepts", detail: "Liquidity, microstructure, DeFi risk.", color: "flame" },
    { icon: "book", title: "Earn your brain", detail: "Retrieval-based lessons stick.", color: "bear" },
  ];
  const colorClass = (c: string) => ({ bull: "text-bull", sky: "text-sky", gold: "text-gold", violet: "text-violet", flame: "text-flame", bear: "text-bear" }[c] ?? "text-fog");
  const bgClass = (c: string) => ({ bull: "bg-bull/15", sky: "bg-sky/15", gold: "bg-gold/15", violet: "bg-violet/15", flame: "bg-flame/15", bear: "bg-bear/15" }[c] ?? "bg-white/5");
  return (
    <Asset code="PLY-05" title="Scroll Reveal Stack" desc="Six cards animate as you scroll. Staggered fade, lateral slide and tilt all read from one progress value." tags={["scroll-tied", "stagger", "reveal"]} span={2}>
      <div ref={ref} className="relative h-[440px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#0c1944] via-[#0a1430] to-[#04081c]">
        <svg className="absolute inset-0 w-full h-full opacity-30">
          {Array.from({ length: 7 }).map((_, i) => <line key={i} x1="0" x2="100%" y1={`${(i / 6) * 100}%`} y2={`${(i / 6) * 100}%`} stroke="rgba(140,175,255,.05)" />)}
        </svg>
        <div className="relative h-full p-6 grid grid-cols-3 gap-4">
          {cards.map((c, i) => {
            const thresholds = [0.05, 0.18, 0.32, 0.46, 0.6, 0.72];
            const localProgress = clamp(((reveal || 0) - thresholds[i] * 0.7) / 0.6, 0, 1);
            const x = (1 - localProgress) * -60 + (i % 3 === 0 ? -20 : i % 3 === 2 ? 20 : 0);
            const y = (1 - localProgress) * 40;
            const rot = (1 - localProgress) * 12 * (i % 2 ? -1 : 1);
            return (
              <div key={c.title} className="game-surface rounded-2xl p-4 flex flex-col" style={{ transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`, opacity: localProgress }}>
                <span className={cn("w-10 h-10 rounded-xl grid place-items-center", bgClass(c.color), colorClass(c.color))}>
                  <Icon name={c.icon} size={20} />
                </span>
                <div className="text-sm font-black mt-3">{c.title}</div>
                <p className="text-[10px] text-mist leading-relaxed">{c.detail}</p>
                <div className="mt-auto pt-2"><div className="h-1 rounded-full bg-ink-700 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-sky to-bull" style={{ width: `${localProgress * 100}%` }} /></div></div>
              </div>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 6. Live reflex arena
 * ------------------------------------------------------------------------- */
type Prompt = { q: string; correct: "LONG" | "SHORT" | "WAIT" };
const PROMPTS: Prompt[] = [
  { q: "Breakout above $70k on volume", correct: "LONG" },
  { q: "RSI 88, candles losing momentum", correct: "WAIT" },
  { q: "Long upper wick + low volume", correct: "SHORT" },
  { q: "Hammer at support, volume rising", correct: "LONG" },
  { q: "Price hugging upper band sideways", correct: "SHORT" },
];

function LiveArena() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState(2.2);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [streak, setStreak] = useState(0);
  const [burst, setBurst] = useState(0);

  useInterval(() => {
    if (!running) return;
    setTimer((t) => {
      const next = t - 0.05;
      if (next <= 0) {
        setFeedback("bad");
        setCombo(0);
        setStreak(0);
        return 2.2;
      }
      return next;
    });
  }, 50);
  useInterval(() => {
    if (!running) return;
    setIndex((i) => (i + 1) % PROMPTS.length);
    setTimer(2.2);
  }, 2200);

  const answer = (choice: "LONG" | "SHORT" | "WAIT") => {
    if (!running) return;
    const p = PROMPTS[index];
    if (p.correct === choice) {
      setScore((s) => s + (choice === "WAIT" ? 75 : 120));
      setCombo((c) => c + 1);
      setStreak((s) => s + 1);
      setFeedback("ok");
      setBurst((b) => b + 1);
    } else {
      setFeedback("bad");
      setCombo(0);
      setStreak(0);
    }
    setIndex((i) => (i + 1) % PROMPTS.length);
    setTimer(2.2);
  };

  const accuracy = score > 0 ? Math.min(100, Math.round((score / (score + combo * 14)) * 100)) : 0;

  return (
    <Asset code="PLY-06" title="Live Arena" desc="A 2.2-second decision drill with rating, combo and streak. Win streaks glow; mistakes cost the streak." tags={["reflex", "game", "live"]} span={2}>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <div className="game-surface rounded-2xl p-5 relative overflow-hidden min-h-[280px]">
          <Confetti burst={burst} count={20} />
          <div className="flex items-center gap-2 mb-3">
            <span className="num text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded-md bg-bear text-white">LIVE</span>
            <span className="text-[9px] uppercase tracking-widest font-black text-mist">round {(index + 1).toString().padStart(2, "0")}</span>
            {streak >= 3 && <span className="text-[9px] uppercase font-black text-flame flex items-center gap-1"><Icon name="flame" size={13} fill="currentColor" />Hot streak ×{streak}</span>}
          </div>
          <div key={index} className="anim-rise min-h-24">
            <div className="text-lg font-black leading-snug">{PROMPTS[index].q}</div>
          </div>
          <div className="mt-4">
            <div className="h-2 well overflow-hidden"><div className="h-full transition-all" style={{
              width: `${(timer / 2.2) * 100}%`,
              background: timer > 1.2 ? "linear-gradient(90deg,#22d38a,#3da5ff)" : timer > 0.5 ? "#ffc53d" : "#ff4b6e",
            }} /></div>
            <div className="flex justify-between text-[9px] text-mist mt-1"><span className="num">{timer.toFixed(1)}s remaining</span><span className="num">{Math.round((timer / 2.2) * 100)}%</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Btn variant="bull" size="lg" onClick={() => answer("LONG")}><Icon name="trendUp" size={15} />Long</Btn>
            <Btn variant="ghost" size="lg" onClick={() => answer("WAIT")}><Icon name="clock" size={15} />Wait</Btn>
            <Btn variant="bear" size="lg" onClick={() => answer("SHORT")}><Icon name="trendDown" size={15} />Short</Btn>
          </div>
          {feedback && <div key={`${feedback}${index}`} className={cn("absolute bottom-4 right-4 text-[9px] font-black px-2.5 py-1 rounded-lg anim-pop", feedback === "ok" ? "bg-bull text-ink-900" : "bg-bear text-white")}>{feedback === "ok" ? `+${combo >= 2 ? 240 : 120} rating` : "streak reset"}</div>}
        </div>
        <div className="flex flex-col gap-3">
          <div className="game-surface rounded-2xl p-4">
            <div className="text-[9px] uppercase font-black tracking-widest text-mist mb-2">Your run</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="tile !rounded-xl p-2 text-center"><div className="num text-xl font-black text-bull">{score}</div><div className="text-[7px] text-mist uppercase font-bold">rating</div></div>
              <div className="tile !rounded-xl p-2 text-center"><div className="num text-xl font-black text-gold">{combo}</div><div className="text-[7px] text-mist uppercase font-bold">combo</div></div>
              <div className="tile !rounded-xl p-2 text-center"><div className="num text-xl font-black text-sky">{accuracy}%</div><div className="text-[7px] text-mist uppercase font-bold">clean</div></div>
            </div>
          </div>
          <div className="game-surface rounded-2xl p-4 flex-1">
            <div className="text-[9px] uppercase font-black tracking-widest text-mist mb-2">Top of arena</div>
            {[
              { name: "Mia", rating: 1480, hue: 332 },
              { name: "Alex", rating: 1310, hue: 205 },
              { name: "Max", rating: 1180, hue: 70 },
            ].map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-1.5">
                <span className="num w-5 text-[10px] font-black" style={{ color: i === 0 ? "#ffc53d" : "#8ea3cf" }}>{i + 1}</span>
                <Avatar name={p.name} size={26} hue={p.hue} ring={i === 0 ? "gold" : "none"} />
                <span className="text-[10px] font-black flex-1">{p.name}</span>
                <span className="num text-[10px] font-black">{p.rating}</span>
              </div>
            ))}
          </div>
          <Btn variant={running ? "ghost" : "bull"} block icon={running ? "minus" : "play"} onClick={() => setRunning(!running)}>{running ? "Pause duel" : "Start duel"}</Btn>
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 7. Animated League · reorder
 * ------------------------------------------------------------------------- */
type LeagueRow = { name: string; hue: number; rating: number; isYou?: boolean };
function LeagueRoute() {
  const [rows, setRows] = useState<LeagueRow[]>([
    { name: "Mia", hue: 332, rating: 1480 },
    { name: "Alex", hue: 205, rating: 1310, isYou: true },
    { name: "Max", hue: 70, rating: 1180 },
    { name: "Dana", hue: 90, rating: 1080 },
  ]);
  const add = () =>
    setRows((r) => r.map((x) => (x.isYou ? { ...x, rating: x.rating + Math.floor(Math.random() * 120 + 50) } : x)).sort((a, b) => b.rating - a.rating));
  return (
    <Asset code="PLY-07" title="Animated Leaderboard" desc="Win a match and rows reorder with a smooth FLIP-style tween. Promotion and demotion zones are visible." tags={["FLIP", "reorder"]} span={2}>
      <div className="relative h-72 rounded-[24px] panel overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="22" x2="22" y1="6" y2="94" stroke="rgba(140,175,255,.07)" strokeDasharray="3 3" />
          <line x1="50" x2="50" y1="6" y2="94" stroke="rgba(140,175,255,.05)" strokeDasharray="3 3" />
          <line x1="78" x2="78" y1="6" y2="94" stroke="rgba(140,175,255,.07)" strokeDasharray="3 3" />
        </svg>
        {rows.map((row, i) => {
          const targetY = 12 + (i / rows.length) * 76;
          return (
            <div key={row.name} className="absolute left-2 right-2 transition-all duration-700" style={{ top: `${targetY}%`, transform: "translateY(-50%)", transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}>
              <div className={cn("game-surface rounded-2xl p-2.5 flex items-center gap-3", row.isYou && "!border-sky/55 shadow-[0_4px_0_#1a56a8] -translate-y-0.5")}>
                <span className={cn("num w-6 h-6 rounded-lg grid place-items-center text-[10px] font-black", i === 0 ? "bg-gold text-ink-900 shadow-[0_2px_0_#b07600]" : i === 1 ? "bg-[#dde2ed] text-ink-900" : i === 2 ? "bg-[#f0b27a] text-ink-900" : "bg-white/10 text-mist")}>{i + 1}</span>
                <Avatar name={row.name} size={32} hue={row.hue} ring={row.isYou ? "sky" : i === 0 ? "gold" : "none"} />
                <div className="flex-1 min-w-0"><div className="text-xs font-black truncate">{row.name}{row.isYou && <span className="ml-1 text-[8px] text-sky">YOU</span>}</div><div className="text-[8px] text-mist">Rating</div></div>
                <span className="num text-sm font-black text-bull">{row.rating}</span>
                {row.isYou && <span className="w-2 h-2 rounded-full bg-bull anim-live" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3"><div className="text-[9px] text-mist">Promotion above · demotion below</div><Btn size="xs" variant="sky" icon="bolt" onClick={add}>Win a match</Btn></div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 8. Quest Wheel · rotate to pick today's plan
 * ------------------------------------------------------------------------- */
function QuestsWheel() {
  const items = [
    { id: 1, title: "Risk 1%", icon: "shield", color: "#22d38a", xp: 100 },
    { id: 2, title: "Five patterns", icon: "candles", color: "#3da5ff", xp: 150 },
    { id: 3, title: "Quick fire 30", icon: "bolt", color: "#9b6bff", xp: 200 },
    { id: 4, title: "One journal", icon: "book", color: "#ffc53d", xp: 80 },
    { id: 5, title: "Demo trade", icon: "wallet", color: "#ff8a3d", xp: 120 },
  ];
  const [angle, setAngle] = useState(0);
  const drag = useRef({ down: false, x: 0, last: 0, lastT: 0 });
  const onDown = (e: React.PointerEvent) => {
    drag.current = { down: true, x: e.clientX, last: angle, lastT: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.x;
    setAngle((drag.current.last + dx * 0.6) % 360);
    drag.current.lastT = performance.now();
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const dx = e.clientX - drag.current.x;
    const snap = Math.round(dx / 40);
    setAngle((a) => (Math.round(a / 60) + snap) * 60);
  };
  const spin = Math.round((angle % 360 + 360) / (360 / items.length)) % items.length;
  const focus = items[spin];

  return (
    <Asset code="PLY-08" title="Quest Wheel" desc="Spin the wheel to select today's plan. Snap every 12° and a focus highlight guide the choice." tags={["drag", "rotate"]}>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full aspect-square max-w-[300px] mx-auto cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 rounded-full border-2 border-sky/30" />
        <div className="absolute inset-2 rounded-full border border-dashed border-sky/15 anim-spin" style={{ animationDuration: "26s" }} />
        <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${angle}deg)`, transitionDuration: drag.current.down ? "0ms" : "300ms" }}>
          {items.map((it, i) => {
            const a = (i / items.length) * 360 - 90;
            const x = Math.cos((a * Math.PI) / 180);
            const y = Math.sin((a * Math.PI) / 180);
            const isFocus = i === spin;
            return (
              <span
                key={it.id}
                className="absolute top-1/2 left-1/2 -mt-7 -ml-7 w-14 h-14 rounded-full grid place-items-center transition-all"
                style={{
                  transform: `translate(${x * 90}px, ${y * 90}px) rotate(${-angle}deg)`,
                  background: `radial-gradient(circle at 35% 28%, ${it.color}, ${it.color}aa 58%, ${it.color}66)`,
                  boxShadow: isFocus ? `0 0 18px ${it.color}, 0 4px 0 rgba(0,0,0,.35)` : "0 4px 0 rgba(0,0,0,.35)",
                  border: "2px solid rgba(255,255,255,.18)",
                }}
              >
                <Icon name={it.icon} size={20} fill="white" stroke={2} className="text-white" />
              </span>
            );
          })}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-b from-[#1c2b58] to-[#14244a] shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_6px_0_#0a1430] grid place-items-center text-center px-3 text-white">
          <div className="text-[9px] uppercase tracking-widest text-mist font-black">Today</div>
          <div className="text-sm font-black leading-tight" key={focus.title}>{focus.title}</div>
          <div className="num text-[9px] text-bull font-black">+{focus.xp} XP</div>
        </div>
        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-fog" />
      </div>
      <div className="text-[9px] text-mist text-center mt-2">Drag to rotate · snaps every 12°</div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 9. Parallax Cover Flow
 * ------------------------------------------------------------------------- */
function ParallaxGallery() {
  const items = [
    { id: "rt", title: "Real Trading", color: "#22d38a", icon: "candles", desc: "Real conditions, fake money" },
    { id: "rx", title: "Risk Manager", color: "#3da5ff", icon: "shield", desc: "Plan · Stop · Size" },
    { id: "ps", title: "Pattern School", color: "#9b6bff", icon: "target", desc: "20 patterns, 2 weeks" },
    { id: "dl", title: "Decision Lab", color: "#ffc53d", icon: "bolt", desc: "30-second drills" },
    { id: "cf", title: "Crypto Culture", color: "#ff8a3d", icon: "sparkle", desc: "Cycles, news, context" },
  ];
  const [center, setCenter] = useState(2);
  const drag = useRef({ down: false, x: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { down: true, x: e.clientX };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const midX = r.left + r.width / 2;
    if (Math.abs(midX - e.clientX) > 60) {
      drag.current.down = false;
      setCenter((c) => clamp(c + (e.clientX < midX ? 1 : -1), 0, items.length - 1));
    }
  };
  const onUp = () => { drag.current.down = false; };

  return (
    <Asset code="PLY-09" title="Parallax Cover Flow" desc="3D depth carousel for browsing courses. Cards lift and tilt as they pass center; focus ring follows." tags={["3D", "parallax", "cover flow"]}>
      <div ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="relative h-72 rounded-[24px] panel overflow-hidden select-none touch-pan-y cursor-grab" style={{ perspective: 900 }}>
        <div className="absolute inset-0 grid place-items-center">
          {items.map((it, i) => {
            const offset = i - center;
            const x = offset * 110;
            const z = -Math.abs(offset) * 110;
            const rot = offset * -16;
            const op = 1 - Math.min(0.7, Math.abs(offset) * 0.3);
            return (
              <div
                key={it.id}
                className="absolute w-44 h-56 rounded-3xl p-4 flex flex-col"
                style={{
                  transform: `translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg)`,
                  background: `linear-gradient(180deg, ${it.color}cc, ${it.color}66)`,
                  boxShadow: `0 ${10 + (3 - Math.abs(offset)) * 5}px 0 rgba(0,0,0,.35), inset 0 2px 0 rgba(255,255,255,.3)`,
                  opacity: op,
                  zIndex: 100 - Math.abs(offset),
                  cursor: Math.abs(offset) === 0 ? "auto" : "pointer",
                }}
                onClick={() => setCenter(i)}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/25 grid place-items-center backdrop-blur"><Icon name={it.icon} size={22} fill="white" stroke={2} className="text-white" /></div>
                <div className="mt-auto"><div className="text-white text-lg font-black leading-tight">{it.title}</div><p className="text-[10px] text-white/70 mt-1 leading-snug">{it.desc}</p></div>
                {offset === 0 && <span className="absolute -top-2 left-3 text-[8px] uppercase font-black px-2 py-0.5 rounded-md bg-fog text-ink-900">Now in focus</span>}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => <button key={i} onClick={() => setCenter(i)} className={cn("h-2 rounded-full transition-all", i === center ? "w-8 bg-fog" : "w-2 bg-ink-600")} aria-label={`page ${i + 1}`} />)}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 10. Live event ticker
 * ------------------------------------------------------------------------- */
function EventTicker() {
  const events = [
    { time: "now", kind: "Win", text: "Mia just hit a 3x combo in Pattern Sprint", color: "#22d38a" },
    { time: "2m", kind: "Alert", text: "BTC/USDT volatility 38% above 30-day average", color: "#ffc53d" },
    { time: "5m", kind: "Launch", text: "New course: Decision Drills II · 9 new patterns", color: "#9b6bff" },
    { time: "10m", kind: "Friend", text: "Max accepted your pattern sprint challenge", color: "#3da5ff" },
    { time: "12m", kind: "Streak", text: "Kira kept her 21-day learning streak alive", color: "#ff8a3d" },
    { time: "20m", kind: "Promo", text: "Double XP weekend starts 7h from now", color: "#ff4b6e" },
  ];
  return (
    <Asset code="PLY-10" title="Live Event Ticker" desc="Two synced marquees feed community events in real time. Hover to pause; click an entry to spotlight it." tags={["marquee", "live"]}>
      <div className="space-y-2">
        <div className="well overflow-hidden rounded-2xl">
          <div className="flex w-max hover:[animation-play-state:paused]" style={{ animation: "marquee 28s linear infinite" }}>
            {[...events, ...events].map((e, i) => (
              <button key={i} className="flex items-center gap-2 px-4 py-3 border-r border-white/[.06] shrink-0 hover:bg-white/[.04]">
                <span className="text-[9px] num uppercase font-black text-mist">{e.time}</span>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: e.color }}>{e.kind}</span>
                <span className="text-xs font-bold whitespace-nowrap">{e.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="well overflow-hidden rounded-2xl">
          <div className="flex w-max hover:[animation-play-state:paused] flex-row-reverse" style={{ animation: "marquee 36s linear infinite reverse" }}>
            {[...events.slice().reverse(), ...events.slice().reverse()].map((e, i) => (
              <span key={`r${i}`} className="flex items-center gap-2 px-4 py-3 border-r border-white/[.06] shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                <span className="text-xs whitespace-nowrap">{e.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 11. Memory Dots
 * ------------------------------------------------------------------------- */
function MemoryDots() {
  const COLORS = ["#22d38a", "#3da5ff", "#ffc53d", "#ff4b6e"];
  const seq = useRef<number[]>([]);
  const [grid] = useState(() => Array.from({ length: 16 }, (_, i) => ({ id: i, color: COLORS[i % 4] })));
  const [flash, setFlash] = useState(-1);
  const [input, setInput] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [won, setWon] = useState(0);
  const [message, setMessage] = useState<string>("Watch the pattern");
  const [fail, setFail] = useState(false);

  const newRound = (lvl: number) => {
    seq.current = Array.from({ length: lvl + 2 }, () => Math.floor(Math.random() * 16));
    setMessage(`Level ${lvl} · ${seq.current.length} taps`);
    setInput([]);
    setFail(false);
    let i = 0;
    const interval = setInterval(() => {
      setFlash(seq.current[i]);
      setTimeout(() => setFlash(-1), 280);
      i++;
      if (i >= seq.current.length) clearInterval(interval);
    }, 480);
  };

  const tap = (id: number) => {
    if (flash !== -1) return;
    setInput((inp) => {
      const next = [...inp, id];
      const target = seq.current[next.length - 1];
      if (id !== target) {
        setFail(true);
        setMessage("Missed. Back to level 1.");
        setTimeout(() => newRound(1), 1100);
        return [];
      }
      if (next.length === seq.current.length) {
        setWon((w) => w + 1);
        setMessage("Nice memory. Level up!");
        setTimeout(() => {
          setLevel((l) => l + 1);
          newRound(level + 1);
        }, 1000);
      }
      return next;
    });
  };

  useEffect(() => { newRound(1); /* eslint-disable-next-line */ }, []);

  return (
    <Asset code="PLY-11" title="Memory Dots" desc="A four-color memory tap game used as a daily warm-up. Five lives, two-mistake budget." tags={["game", "memory"]}>
      <div className="game-surface rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-mist font-black">Daily warm-up</div>
            <div className="text-lg font-black">{message}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="tile !rounded-xl px-3 py-2"><div className="num font-black text-bull">{won}</div><div className="text-[7px] text-mist uppercase font-black">wins</div></div>
            <div className="tile !rounded-xl px-3 py-2"><div className="num font-black text-gold">{level}</div><div className="text-[7px] text-mist uppercase font-black">level</div></div>
            <div className="tile !rounded-xl px-3 py-2"><div className="num font-black text-sky">{input.length}/{seq.current.length}</div><div className="text-[7px] text-mist uppercase font-black">taps</div></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {grid.map((cell) => (
            <button
              key={cell.id}
              onClick={() => tap(cell.id)}
              style={{ background: cell.color, boxShadow: `0 6px 0 rgba(0,0,0,.35), inset 0 2px 0 rgba(255,255,255,.2)${flash === cell.id ? `, 0 0 22px ${cell.color}` : ""}` }}
              className={cn("aspect-square rounded-2xl transition-all active:translate-y-1 active:shadow-none", fail && "opacity-70")}
              aria-label={`Dot ${cell.id}`}
            />
          ))}
        </div>
        <div className="text-[9px] text-mist mt-3">Watch the pattern, then tap the same dots in order.</div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 12. Reaction Trainer
 * ------------------------------------------------------------------------- */
function ClickTrainer() {
  const [target, setTarget] = useState(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const start = useRef(0);
  useInterval(() => {
    if (!running) return;
    if (Date.now() - start.current > 1500 && clicks.length > 0) {
      setClicks((c) => [...c, 0]);
      setTarget(target + 1);
      start.current = Date.now();
    }
  }, 50);
  const begin = () => {
    setClicks([]);
    setTarget(1);
    start.current = Date.now();
    setRunning(true);
  };
  const hit = () => {
    if (!running) return;
    const reaction = Date.now() - start.current;
    setClicks((c) => [...c, reaction]);
    setTarget((t) => t + 1);
    start.current = Date.now();
  };
  const avg = clicks.length ? Math.round(clicks.reduce((a, b) => a + b, 0) / clicks.length) : 0;
  return (
    <Asset code="PLY-12" title="Reaction Trainer" desc="Resist the urge — only tap when green. Tracks reaction time over a round and flags false starts." tags={["react", "game"]}>
      <div className="game-surface rounded-2xl p-5 grid place-items-center min-h-[260px] relative">
        {target === 0 ? (
          <div className="text-center"><Icon name="bolt" size={40} className="mx-auto text-sky mb-2" /><div className="font-black mb-3">Test your reflexes</div><Btn variant="bull" icon="play" onClick={begin}>Start test</Btn></div>
        ) : (
          <button onClick={hit} className="w-44 h-44 rounded-full bg-bear text-white shadow-[0_10px_0_#a01e3c,inset_0_3px_0_rgba(255,255,255,.2)] grid place-items-center text-center active:translate-y-1 active:shadow-[0_4px_0_#a01e3c]">
            <div>
              <div className="text-[9px] uppercase tracking-widest opacity-80">When it turns green</div>
              <div className="font-black text-2xl">Tap</div>
              <div className="num text-[10px] opacity-70">Round {target}</div>
            </div>
          </button>
        )}
        {avg > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[9px] text-mist"><span>Avg <b className="num text-fog">{avg}ms</b></span><span>{clicks.length} hits</span></div>
        )}
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 13. Gesture Hint Sheet
 * ------------------------------------------------------------------------- */
function HintSheet() {
  const hints = [
    { name: "Swipe ← / →", where: "Map · Story · Duel", color: "sky", desc: "Move between entities" },
    { name: "Long press", where: "Asset · Profile", color: "violet", desc: "Reveal context actions" },
    { name: "Pull down", where: "Lists · Arena feed", color: "bull", desc: "Refresh content" },
    { name: "Hold 1.2s", where: "Order · Confirm", color: "gold", desc: "Confirm destructive actions" },
    { name: "Drag canvas", where: "Skill path · Cover flow", color: "flame", desc: "Pan over detail" },
    { name: "Two-finger swipe", where: "Chart · Match", color: "bear", desc: "Quick mode swap" },
  ];
  const colorMap = { sky: "bg-sky/15 text-sky", violet: "bg-violet/15 text-violet", bull: "bg-bull/15 text-bull", gold: "bg-gold/15 text-gold", flame: "bg-flame/15 text-flame", bear: "bg-bear/15 text-bear" };
  return (
    <Asset code="PLY-13" title="Gesture Hint Sheet" desc="Every primary gesture is documented with where it lives and which color cues guide it." tags={["docs", "a11y", "guidance"]}>
      <div className="grid grid-cols-2 gap-2">
        {hints.map((h, i) => (
          <div key={h.name} className="game-surface rounded-2xl p-3 flex items-start gap-3">
            <span className={cn("w-9 h-9 rounded-xl grid place-items-center", colorMap[h.color as keyof typeof colorMap])}>
              <Icon name="zap" size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black">{h.name}</div>
              <div className="text-[9px] text-mist">Use in: {h.where}</div>
              <div className="text-[10px] text-fog mt-1">{h.desc}</div>
            </div>
            <span className="num text-[9px] font-black text-mist">{String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * Section wrapper
 * ------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------
 * 14. Parallax hero scene · cursor-aware depth
 * ------------------------------------------------------------------------- */
function ParallaxHero() {
  const { ref, point } = usePointer();
  return (
    <Asset code="PLY-14" title="Parallax Hero Scene" desc="A single hero with five independently parallaxing layers. Move the pointer; depth and lighting follow." tags={["parallax", "hero", "mouse"]} span={3}>
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} className="relative rounded-[24px] overflow-hidden panel" style={{ height: 360 }}>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle at ${50 + point.x * 30}% ${50 + point.y * 30}%, #1a2f6a 0%, #07112c 70%)`,
          transform: `translate3d(${(point.x - 0.5) * -10}px, ${(point.y - 0.5) * -8}px, 0)`,
        }} />
        <svg className="absolute inset-0 w-full h-full opacity-30" style={{ transform: `translate3d(${(point.x - 0.5) * -20}px, ${(point.y - 0.5) * -16}px, 0)` }}>
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="rgba(140,175,255,.08)" strokeWidth="1" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full" style={{ transform: `translate3d(${(point.x - 0.5) * -30}px, ${(point.y - 0.5) * -20}px, 0)` }} viewBox="0 0 200 80" preserveAspectRatio="none">
          <polygon points="0,80 30,55 60,68 100,42 130,55 165,30 200,38 200,80" fill="#0f1d4a" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-3/4" style={{ transform: `translate3d(${(point.x - 0.5) * -42}px, ${(point.y - 0.5) * -28}px, 0)`, willChange: "transform" }}>
          <div className="absolute bottom-6 left-6 right-6 h-20 rounded-3xl bg-gradient-to-t from-[#102061] to-transparent" />
          <div className="absolute bottom-6 right-6">
            <svg width="180" height="140" viewBox="0 0 200 160">
              <ellipse cx="100" cy="155" rx="90" ry="6" fill="rgba(0,0,0,.45)" />
              <circle cx="100" cy="80" r="60" fill="#1a2f6a" />
              <circle cx="100" cy="76" r="60" fill="url(#heroG)" />
              <defs><linearGradient id="heroG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5cb3ff" /><stop offset="1" stopColor="#1a56a8" /></linearGradient></defs>
              <path d="M40 60C24 52 18 28 30 14c4 16 14 28 32 32Z" fill="#ffd560" stroke="#b07600" strokeWidth="1" />
              <path d="M160 60C176 52 182 28 170 14c-4 16-14 28-32 32Z" fill="#ffd560" stroke="#b07600" strokeWidth="1" />
              <ellipse cx="84" cy="80" rx="6" ry="6" fill="#fff" />
              <ellipse cx="116" cy="80" rx="6" ry="6" fill="#fff" />
              <circle cx="84" cy="80" r="3" fill="#07122d" />
              <circle cx="116" cy="80" r="3" fill="#07122d" />
            </svg>
          </div>
          <div className="absolute bottom-6 left-1/4"><Coin sym="BTC" size={64} /></div>
          <div className="absolute bottom-6 left-1/2"><Coin sym="ETH" size={52} /></div>
        </div>
        <div className="absolute inset-0 grid place-items-start content-end p-6" style={{ transform: `translate3d(${(0.5 - point.x) * 18}px, 0, 0)` }}>
          <div className="text-[10px] uppercase tracking-[.2em] font-black text-violet">Five layers · cursor-aware</div>
          <h3 className="text-3xl font-black mt-2">A market we can read.</h3>
          <p className="text-sm text-mist max-w-sm">Move the cursor. Each depth layer (sky, sun, hills, mascot, coins) reads the cursor independently and translates within a different radius.</p>
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 15. Paged vertical carousel · snap-by-page scroll
 * ------------------------------------------------------------------------- */
function PagedVertical() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pages = ["Intro", "Setup", "Execute", "Review", "Earn"];
  const total = pages.length;
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setPage(clamp(idx, 0, total - 1));
  };
  return (
    <Asset code="PLY-15" title="Paged Vertical Snap" desc="Vertical carousel that snaps to a full-page section. A floating dot rail stays in sync." tags={["vertical", "snap", "scroll"]}>
      <div className="relative game-surface rounded-[24px] overflow-hidden" style={{ height: 360 }}>
        <div ref={trackRef} onScroll={onScroll} className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory" style={{ scrollBehavior: "smooth" }}>
          {pages.map((p, i) => (
            <section key={p} className="h-full w-full snap-start flex items-center justify-center relative" style={{ background: `linear-gradient(180deg, ${["#3da5ff20","#22d38a20","#ffc53d20","#9b6bff20","#ff8a3d20"][i]}, transparent)` }}>
              <div className="text-center">
                <div className="num text-[8px] uppercase tracking-[.2em] font-black text-mist">page {i + 1} / {total}</div>
                <div className="text-3xl font-black mt-2">{p}</div>
                <div className="text-xs text-mist mt-2 max-w-[180px] mx-auto">{["Set goals","Pick assets","Place a demo trade","Reflect","Claim streak"][i]}</div>
              </div>
            </section>
          ))}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {pages.map((p, i) => <button key={p} onClick={() => { const el = trackRef.current; if (el) el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" }); }} className={cn("w-2 h-2 rounded-full transition-all", i === page ? "bg-fog w-3 h-3" : "bg-ink-600")} aria-label={p} />)}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 16. Slider bank · curated intensity pickers
 * ------------------------------------------------------------------------- */
function SliderBank() {
  const [risk, setRisk] = useState(1.5);
  const [size, setSize] = useState(25);
  const [time, setTime] = useState(15);
  const [precision, setPrecision] = useState(0.4);
  const [range, setRange] = useState<[number, number]>([55, 95]);
  return (
    <Asset code="PLY-16" title="Slider Bank" desc="A family of sliders that share numeric tokens: percent, ratio, time, decimal and range. Each has a custom tick profile." tags={["slider", "percent", "range"]}>
      <div className="space-y-4">
        {[
          { label: "Risk per trade", value: risk, set: setRisk, min: .1, max: 5, step: .1, suffix: "%", gradient: "bull", axis: ["0%", "1%", "2%", "3%", "4%", "5%"] },
          { label: "Position size", value: size, set: setSize, min: 5, max: 100, step: 5, suffix: "%", gradient: "sky", axis: ["5%", "25%", "50%", "75%", "100%"] },
          { label: "Practice time", value: time, set: setTime, min: 5, max: 60, step: 5, suffix: "m", gradient: "gold", axis: ["5m", "15m", "30m", "60m"] },
          { label: "Tolerance", value: precision, set: setPrecision, min: .1, max: 1, step: .05, suffix: "R", gradient: "flame", axis: ["0.1R", "0.5R", "1R"] },
        ].map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-widest font-black text-mist">{s.label}</div>
              <div className="num text-xs font-black text-fog">{typeof s.value === "number" ? (s.step >= 1 ? Math.round(s.value) : s.value.toFixed(2)) : s.value}{s.suffix}</div>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={(e) => s.set(+e.target.value)} className="w-full" style={{ accentColor: { bull: "#22d38a", sky: "#3da5ff", gold: "#ffc53d", flame: "#ff8a3d" }[s.gradient as "bull" | "sky" | "gold" | "flame"] }} />
            <div className="flex justify-between num text-[9px] text-mist mt-1"><span>{s.axis[0]}</span><span>{s.axis[s.axis.length - 1]}</span></div>
          </div>
        ))}
        <div>
          <div className="flex items-center justify-between mb-1"><div className="text-[10px] uppercase tracking-widest font-black text-mist">RSI range</div><div className="num text-xs font-black text-fog">{range[0]} – {range[1]}</div></div>
          <div className="relative h-8">
            <div className="absolute inset-y-3 left-0 right-0 rounded-full bg-ink-700" />
            <div className="absolute inset-y-3 rounded-full bg-violet" style={{ left: `${(range[0] / 100) * 100}%`, right: `${100 - (range[1] / 100) * 100}%` }} />
            <input type="range" min={0} max={100} value={range[0]} onChange={(e) => setRange([Math.min(+e.target.value, range[1] - 2), range[1]])} className="absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent" aria-label="RSI low" />
            <input type="range" min={0} max={100} value={range[1]} onChange={(e) => setRange([range[0], Math.max(+e.target.value, range[0] + 2)])} className="absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent" aria-label="RSI high" />
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 17. Scroll-reactive story strip
 * ------------------------------------------------------------------------- */
function StoryStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reveal = useScrollProgress(ref);
  const steps = [
    { icon: "shield", title: "Risk first", body: "Before the trade, the stop is a number — never a feeling." },
    { icon: "candles", title: "Read the setup", body: "Three candles, one volume bar. That's your plan." },
    { icon: "wallet", title: "Place size", body: "Same size every time — small enough to think." },
    { icon: "book", title: "Reflect", body: "Tomorrow's trader is built by tonight's notes." },
    { icon: "trophy", title: "Earn the streak", body: "Discipline is the only edge that compounds." },
  ];
  return (
    <Asset code="PLY-17" title="Scroll-Reactive Story" desc="A horizontal scroll strip that animates each step into place as the section enters view. Steps past the fold fade." tags={["scroll", "story", "horizontal"]} span={2}>
      <div ref={ref} className="relative h-[440px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#0a1430] via-[#0e1a3b] to-[#04081c]">
        <div className="absolute inset-x-6 top-6 flex justify-between text-[9px] text-mist uppercase tracking-widest font-black"><span>Scroll</span><span>Beat {Math.round(reveal * 100)}%</span></div>
        <div className="absolute left-6 bottom-6 top-16 grid grid-rows-5 gap-3 w-72">
          {steps.map((step, i) => {
            const threshold = i * 0.18;
            const lp = clamp(((reveal || 0) - threshold) / 0.4, 0, 1);
            const x = (1 - lp) * -80;
            const op = lp;
            return (
              <div key={step.title} className="game-surface rounded-2xl p-3 flex items-start gap-3" style={{ transform: `translate3d(${x}px, 0, 0)`, opacity: op }}>
                <span className="w-9 h-9 rounded-xl bg-violet/15 text-violet grid place-items-center shrink-0"><Icon name={step.icon} size={18} /></span>
                <div>
                  <div className="font-black">{step.title}</div>
                  <p className="text-[10px] text-mist leading-snug">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute right-6 top-16 bottom-6 w-72 rounded-2xl overflow-hidden border border-sky/25 panel">
          <div className="absolute inset-0 p-4 flex flex-col">
            <div className="text-[9px] uppercase tracking-widest font-black text-violet mb-3">Today's ritual</div>
            <ol className="space-y-2 text-xs text-fog flex-1">
              {steps.map((step, i) => (
                <li key={step.title} className="flex items-start gap-2">
                  <span className="num text-[9px] mt-0.5">{i + 1}.</span>
                  <span>{step.title} — <span className="text-mist">{step.body}</span></span>
                </li>
              ))}
            </ol>
            <Btn variant="bull" block icon="play" size="sm">Begin ritual</Btn>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 18. Vertical ticker · friend activity feed
 * ------------------------------------------------------------------------- */
function FriendFeed() {
  const [items, setItems] = useState<{ id: number; who: string; action: string; tone: "bull" | "sky" | "gold" | "violet"; when: string }[]>([
    { id: 1, who: "Mia", action: "completed the daily pattern quiz", tone: "bull", when: "now" },
    { id: 2, who: "Max", action: "opened a 3× long on ETH", tone: "sky", when: "1m" },
    { id: 3, who: "Dana", action: "claimed her day-12 reward", tone: "gold", when: "3m" },
    { id: 4, who: "Alex", action: "kept their streak alive for 21 days", tone: "violet", when: "5m" },
  ]);
  return (
    <Asset code="PLY-18" title="Friend Activity Feed" desc="A card list whose newest entry slides in from the bottom; older entries fade down." tags={["feed", "social", "list"]}>
      <div className="relative h-80 rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-x-3 top-3 text-[9px] uppercase tracking-widest font-black text-violet">Today</div>
        <div className="absolute inset-x-3 top-10 bottom-3 space-y-2 overflow-hidden">
          {items.slice().reverse().map((it) => (
            <div key={it.id} className={cn("game-surface rounded-2xl p-3 flex items-center gap-3 anim-rise", { bull: "!border-bull/30", sky: "!border-sky/30", gold: "!border-gold/30", violet: "!border-violet/30" }[it.tone])}>
              <span className={cn("w-9 h-9 rounded-xl grid place-items-center", { bull: "bg-bull/15 text-bull", sky: "bg-sky/15 text-sky", gold: "bg-gold/15 text-gold", violet: "bg-violet/15 text-violet" }[it.tone])}><Icon name="zap" size={17} /></span>
              <div className="min-w-0"><div className="text-xs font-black">{it.who} {it.action}</div><div className="text-[9px] text-mist">{it.when}</div></div>
              <span className="text-[8px] text-mist ml-auto">→ Cheer</span>
            </div>
          ))}
        </div>
        <button onClick={() => setItems((arr) => [{ id: Date.now(), who: ["Mira","Zed","Lana","Kai"][Math.floor(Math.random()*4)], action: "started a new lesson", tone: (["bull","sky","gold","violet"] as const)[Math.floor(Math.random()*4)], when: "now" }, ...arr])} className="absolute bottom-3 left-3 right-3 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-mist hover:text-fog transition-colors">Add fake event</button>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 19. Habit dial · weekly chart
 * ------------------------------------------------------------------------- */
function HabitDial() {
  const [day, setDay] = useState(2);
  const labels = ["Sun", "Sat", "Fri", "Thu", "Wed", "Tue", "Mon"];
  return (
    <Asset code="PLY-19" title="Habit Dial" desc="A radial weekly tracker. Settle on a day and the dial animates to highlight it." tags={["radial", "habit", "picker"]}>
      <div className="relative h-72 rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="-110 -110 220 220" className="w-full h-full">
            {labels.map((label, i) => {
              const a = (-90 + i * 360 / labels.length) * Math.PI / 180;
              const r1 = 60, r2 = 90;
              const x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1;
              const x2 = Math.cos(a) * r2, y2 = Math.sin(a) * r2;
              const isOn = i === day;
              return <g key={label}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isOn ? "#22d38a" : "#2b4380"} strokeWidth="3" strokeLinecap="round" /><circle cx={x2} cy={y2} r="16" fill={isOn ? "#22d38a" : "#1a56a8"} /></g>;
            })}
            <circle cx="0" cy="0" r="32" fill="#0a1430" stroke="#1f3468" strokeWidth="2" />
          </svg>
          <div className="absolute text-center">
            <div className="text-[9px] uppercase tracking-widest text-mist font-black">Picked</div>
            <div className="font-black text-xl">{labels[day]}</div>
            <div className="num text-[9px] text-bull font-black">+20 XP</div>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-7 gap-1">
          {labels.map((label, i) => <button key={label} onClick={() => setDay(i)} className={cn("h-7 rounded-lg text-[9px] font-black", i === day ? "bg-bull text-ink-900 shadow-[0_2px_0_#0b7a4a]" : "bg-white/5 text-mist")}>{label[0]}</button>)}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 20. Tooltip spotter · cursor tooltip shader
 * ------------------------------------------------------------------------- */
function CursorSpot() {
  const cells = [
    { id: 0, name: "Wick reveal" }, { id: 1, name: "Volume skew" }, { id: 2, name: "RSI divergence" }, { id: 3, name: "Liquidity pocket" },
    { id: 4, name: "Doji cluster" }, { id: 5, name: "Hammer reversal" }, { id: 6, name: "Marubozu break" }, { id: 7, name: "Tweezer top" },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const { point } = usePointer();
  return (
    <Asset code="PLY-20" title="Cursor Spot Tooltip" desc="A cluster of mini-icons reveals contextual explanations when the cursor passes over them." tags={["tooltip", "cursor", "hover"]}>
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} className="relative h-44 rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-x-3 top-3 text-[9px] uppercase tracking-widest font-black text-violet">Hover a dot</div>
        <div className="absolute inset-x-3 bottom-3 top-10 grid grid-cols-4 gap-3">
          {cells.map((c, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            const x = col / 3, y = row / 1;
            const d = Math.hypot(point.x - x, point.y - y);
            const lit = d < 0.18;
            return (
              <div key={c.id} className="relative grid place-items-center">
                <span className={cn("absolute h-12 w-12 rounded-full transition-all", lit ? "bg-violet/40 scale-150" : "bg-violet/0")} />
                <span className="w-10 h-10 rounded-full bg-violet/15 text-violet grid place-items-center relative transition-transform" style={{ transform: lit ? "scale(1.15)" : "scale(1)" }}>
                  <Icon name="target" size={18} />
                </span>
                {lit && (
                  <span key={`${c.id}-${point.x.toFixed(2)}`} className="absolute bottom-full mb-2 glass !rounded-xl px-3 py-1.5 text-[10px] font-black whitespace-nowrap anim-rise z-10">{c.name}<br /><span className="text-mist">+5 XP · 12 s</span></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 21. Live duel overlay · lightbox
 * ------------------------------------------------------------------------- */
function DuelOverlay() {
  const [open, setOpen] = useState(false);
  return (
    <Asset code="PLY-21" title="Duel Lightbox" desc="Tap a teammate to view their live match. A full-screen overlay simulates stream-up with parallax heat." tags={["overlay", "lightbox", "live"]}>
      <div className="game-surface rounded-2xl p-4 relative min-h-[200px]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Mia", hue: 332, mode: "Pattern drill", viewers: 248 },
            { name: "Max", hue: 70, mode: "Speed round", viewers: 184 },
            { name: "Dana", hue: 90, mode: "Risk plan", viewers: 96 },
          ].map((p) => (
            <button key={p.name} onClick={() => setOpen(true)} className="rounded-2xl p-3 text-left game-surface hover:!border-sky/40 transition-colors">
              <Avatar name={p.name} size={48} ring="gold" hue={p.hue} />
              <div className="font-black mt-2 text-sm">{p.name}</div>
              <div className="text-[9px] text-mist">{p.mode}</div>
              <div className="text-[9px] text-sky flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-bear anim-live" /><span className="num">{p.viewers}</span> live</div>
            </button>
          ))}
        </div>
        {open && (
          <div className="absolute inset-2 rounded-2xl bg-ink-900/95 backdrop-blur-md grid place-items-center text-center anim-bounce-in z-20">
            <Confetti burst={1} count={12} />
            <Avatar name="Mia" size={84} hue={332} ring="gold" />
            <div className="font-black mt-3">Watching Mia play</div>
            <p className="text-[10px] text-mist mt-1 max-w-[200px]">Live duel · 12 s ago · chart duel mode</p>
            <Btn variant="ghost" size="sm" icon="x" className="mt-3" onClick={() => setOpen(false)}>Close</Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ----------------------------------------------------------------------------
 * 22. Plan roulette · card cycler
 * ------------------------------------------------------------------------- */
function PlanRoulette() {
  const choices = [
    { title: "Spot the breakout", detail: "20 quick candles", color: "#22d38a", xp: 80 },
    { title: "Risk review", detail: "Re-evaluate plan", color: "#3da5ff", xp: 40 },
    { title: "Speed round", detail: "60-second quiz", color: "#ffc53d", xp: 60 },
  ];
  const [focus, setFocus] = useState(1);
  const size = 120;
  const a = (i: number) => (i / choices.length) * Math.PI * 2 - Math.PI / 2;
  return (
    <Asset code="PLY-22" title="Plan Roulette" desc="Cycle through three focus areas with previous/next; active card lifts and tilts." tags={["cycle", "navigation"]}>
      <div className="relative h-72 rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="-100 -100 200 200" className="w-48 h-48">
            <circle r={size / 2} fill="none" stroke="rgba(140,175,255,.07)" strokeDasharray="3 4" />
            <path d={`M0,-${size/2} A${size/2},${size/2} 0 0,1 ${Math.sin(a(0) + Math.PI/2)*size/2},${-Math.cos(a(0) + Math.PI/2)*size/2}`} fill="none" stroke="rgba(140,175,255,.05)" strokeDasharray="3 4" />
          </svg>
          {choices.map((c, i) => {
            const angle = a(i);
            const x = Math.cos(angle) * (size / 2);
            const y = Math.sin(angle) * (size / 2);
            const isFocus = i === focus;
            return <button key={c.title} onClick={() => setFocus(i)} style={{ transform: `translate(${x}px, ${y}px)${isFocus ? " scale(1.18)" : ""}`, background: `radial-gradient(circle at 35% 28%, ${c.color}, ${c.color}99 58%, ${c.color}66)`, boxShadow: isFocus ? `0 12px 0 rgba(0,0,0,.35), 0 0 22px ${c.color}` : "0 6px 0 rgba(0,0,0,.35)" }} className={cn("absolute w-20 h-20 rounded-2xl text-left p-3 text-white border-2 border-white/15", isFocus ? "-translate-x-1/2 -translate-y-1/2" : "-translate-x-1/2 -translate-y-1/2 opacity-90")}>{isFocus && <div><div className="text-[8px] uppercase tracking-widest font-black opacity-70">{c.xp} XP</div><div className="font-black">{c.title}</div><div className="text-[9px] opacity-80">{c.detail}</div></div>}</button>;
          })}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center"><Btn variant="ghost" size="xs" icon="chevL" onClick={() => setFocus((i) => (i - 1 + choices.length) % choices.length)}>Prev</Btn><span className="num text-[10px] font-black text-mist">{focus + 1} / {choices.length}</span><Btn variant="ghost" size="xs" iconRight="chevR" onClick={() => setFocus((i) => (i + 1) % choices.length)}>Next</Btn></div>
      </div>
    </Asset>
  );
}

export default function Gameplay() {
  return (
    <Section
      id="gameplay"
      index="01"
      title="Gameplay"
      subtitle="Scroll-tied camera, gesture-driven carousels, cover flow, parallax stacks, reflex arenas and a deep library of microplays."
    >
      <SkillPathCamera />
      <ParallaxHero />
      <GestureCarousel />
      <TiltShowcase />
      <SwipeMatch />
      <ScrollRevealShowcase />
      <StoryStrip />
      <LiveArena />
      <LeagueRoute />
      <QuestsWheel />
      <ParallaxGallery />
      <EventTicker />
      <FriendFeed />
      <HabitDial />
      <PagedVertical />
      <SliderBank />
      <CursorSpot />
      <DuelOverlay />
      <PlanRoulette />
      <MemoryDots />
      <ClickTrainer />
      <HintSheet />
    </Section>
  );
}
