import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Coin, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp, damp, mod, useRafLoop, useVisible, wrapCentered } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 *  CAROUSELS & SLIDERS — ten distinct carousel mechanics, no duplicates:
 *  stories · infinite loop · 3D ring · fanned deck · native snap · synced
 *  thumbnails · timeline scrubber · before/after · kinetic panels · drum picker
 * =============================================================================*/

/* =============================================================================
 * 1. Stories — tap left/right, hold to pause, auto-advance with progress bars.
 * ============================================================================*/
const STORIES = [
  { title: "Candles 101", body: "Each candle is a fight between buyers and sellers. The body shows who won.", icon: "candles", from: "#1f6fd0", to: "#0b2a66", accent: "#6dbbff" },
  { title: "Wicks tell stories", body: "A long lower wick means price was rejected from below — buyers stepped in.", icon: "target", from: "#0b7a4a", to: "#06301f", accent: "#3ce49e" },
  { title: "Volume confirms", body: "A breakout on rising volume has conviction. On falling volume it's suspect.", icon: "chart", from: "#6b3fd9", to: "#24115c", accent: "#b394ff" },
  { title: "Risk first", body: "Decide your stop before you enter. Emotion arrives the moment money moves.", icon: "shield", from: "#b84a10", to: "#4a1c05", accent: "#ffae6e" },
  { title: "Daily quiz", body: "Three questions, sixty seconds. Keep your streak and earn 25 XP.", icon: "trophy", from: "#b07600", to: "#3d2800", accent: "#ffd865" },
];
const STORY_MS = 4500;

function StoriesCarousel() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const downAt = useRef(0);

  const go = (d: number) => { setIdx((i) => mod(i + d, STORIES.length)); setProgress(0); };

  useRafLoop((_, dt) => {
    if (paused) return;
    setProgress((p) => {
      const next = p + (dt * 1000) / STORY_MS;
      if (next >= 1) { setIdx((i) => (i + 1) % STORIES.length); return 0; }
      return next;
    });
  }, visible);

  const s = STORIES[idx];
  return (
    <Asset code="CAR-01" title="Story Carousel" desc="Instagram-grade stories: auto-advance with segmented progress, tap left/right thirds to navigate, press-and-hold to pause. Ken-Burns background per slide." tags={["stories", "hold to pause", "autoplay"]}>
      <div
        ref={box}
        className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-[28px] overflow-hidden select-none touch-none cursor-pointer shadow-[0_8px_0_#040916,0_30px_50px_-20px_rgba(0,0,0,.9)]"
        onPointerDown={() => { downAt.current = performance.now(); setPaused(true); }}
        onPointerUp={(e) => {
          const held = performance.now() - downAt.current;
          setPaused(false);
          if (held < 220) {
            const r = e.currentTarget.getBoundingClientRect();
            go(e.clientX - r.left < r.width / 3 ? -1 : 1);
          }
        }}
        onPointerLeave={() => setPaused(false)}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); } }}
      >
        <div key={`bg${idx}`} className="absolute inset-0" style={{ background: `radial-gradient(120% 70% at 30% 20%, ${s.from}, ${s.to})`, animation: "kenburns 5s ease-out forwards" }}>
          <div className="absolute inset-0 dotgrid opacity-30" />
          <Icon name={s.icon} size={260} stroke={1} className="absolute -right-16 top-16 opacity-10 text-white" />
        </div>
        <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
          {STORIES.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${i < idx ? 100 : i === idx ? progress * 100 : 0}%` }} />
            </div>
          ))}
        </div>
        <div className="absolute top-7 inset-x-3 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full grid place-items-center bg-bull shadow-[0_2px_0_#0b7a4a]"><Icon name="logo" size={16} stroke={3} className="text-white" /></div>
          <div className="text-[11px] font-black">BULLRUN · Lesson bites</div>
          {paused && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded bg-black/40 flex items-center gap-1"><Icon name="pause" size={10} />PAUSED</span>}
        </div>
        <div key={`c${idx}`} className="absolute inset-x-5 bottom-8 z-10">
          <div className="w-14 h-14 rounded-2xl grid place-items-center mb-4 anim-pop" style={{ background: `${s.accent}33`, color: s.accent, border: `1px solid ${s.accent}66` }}><Icon name={s.icon} size={28} /></div>
          <div className="text-[10px] uppercase tracking-[.2em] font-black anim-rise" style={{ color: s.accent, animationDelay: ".05s" }}>Bite {idx + 1} of {STORIES.length}</div>
          <div className="text-2xl font-black leading-tight mt-1 anim-rise" style={{ animationDelay: ".1s" }}>{s.title}</div>
          <p className="text-sm text-white/80 mt-2 leading-snug anim-rise" style={{ animationDelay: ".18s" }}>{s.body}</p>
          <div className="mt-4 h-10 rounded-xl bg-white text-ink-900 text-xs font-black grid place-items-center anim-rise" style={{ animationDelay: ".26s" }}>Swipe up · learn more</div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 2. Infinite loop carousel — wraps forever, drag with inertia, autoplay.
 * ============================================================================*/
const LOOP_ITEMS = [
  { sym: "BTC", title: "Bitcoin basics", lessons: 12, color: "#F7931A" },
  { sym: "ETH", title: "Smart contracts", lessons: 9, color: "#7B8CFF" },
  { sym: "SOL", title: "High-speed chains", lessons: 7, color: "#14F195" },
  { sym: "TON", title: "Messenger economy", lessons: 6, color: "#0098EA" },
  { sym: "BNB", title: "Exchange tokens", lessons: 5, color: "#F3BA2F" },
  { sym: "ADA", title: "Research-first L1", lessons: 6, color: "#3C8DFF" },
  { sym: "DOGE", title: "Meme economics", lessons: 4, color: "#C2A633" },
];
const LOOP_W = 170;
const AUTOPLAY_MS = 3200;

function InfiniteLoop() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const n = LOOP_ITEMS.length;
  const pos = useRef(0);
  const target = useRef(0);
  const [, force] = useState(0);
  const [hover, setHover] = useState(false);
  const [timer, setTimer] = useState(0);
  const drag = useRef<{ x: number; start: number; lastX: number; lastT: number; v: number } | null>(null);

  useRafLoop((_, dt) => {
    if (!drag.current) {
      pos.current = damp(pos.current, target.current, 9, dt);
      if (!hover) {
        setTimer((t) => {
          const next = t + (dt * 1000) / AUTOPLAY_MS;
          if (next >= 1) { target.current += 1; return 0; }
          return next;
        });
      }
    }
    force((x) => (x + 1) % 1000);
  }, visible);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: pos.current, lastX: e.clientX, lastT: performance.now(), v: 0 };
    setTimer(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    d.v = ((e.clientX - d.lastX) / LOOP_W) / Math.max(1, now - d.lastT) * 1000;
    d.lastX = e.clientX;
    d.lastT = now;
    pos.current = d.start - (e.clientX - d.x) / LOOP_W;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    target.current = Math.round(pos.current - d.v * 0.25);
    drag.current = null;
  };

  const active = mod(Math.round(pos.current), n);
  return (
    <Asset code="CAR-02" title="Infinite Loop" desc="Wraps forever in both directions via modular positioning. Drag with flick inertia, autoplay with a countdown ring that pauses on hover." tags={["infinite", "inertia", "autoplay"]} span={2}>
      <div
        ref={box}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-64 rounded-[22px] overflow-hidden panel touch-pan-y select-none cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 dotgrid opacity-25" />
        {LOOP_ITEMS.map((it, i) => {
          const offset = wrapCentered(i - pos.current, n);
          if (Math.abs(offset) > 3) return null;
          const abs = Math.abs(offset);
          return (
            <div
              key={it.sym}
              className="absolute top-1/2 left-1/2 w-40 h-48 -ml-20 -mt-24 rounded-3xl p-4 flex flex-col"
              style={{
                transform: `translate3d(${offset * LOOP_W}px, ${abs * 10}px, 0) scale(${1 - Math.min(0.28, abs * 0.13)}) rotate(${offset * 3}deg)`,
                opacity: 1 - Math.min(0.8, abs * 0.3),
                zIndex: 100 - Math.round(abs * 10),
                background: `linear-gradient(160deg, ${it.color}40, #111e42 60%)`,
                border: `1px solid ${it.color}55`,
                boxShadow: abs < 0.5 ? `0 22px 40px -18px ${it.color}88, 0 6px 0 #060c1f` : "0 6px 0 #060c1f",
              }}
            >
              <Coin sym={it.sym} size={44} />
              <div className="mt-auto">
                <div className="text-sm font-black leading-tight">{it.title}</div>
                <div className="text-[10px] text-mist">{it.lessons} lessons</div>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-3 right-3 w-9 h-9">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#3da5ff" strokeWidth="3" strokeDasharray={94} strokeDashoffset={94 * (1 - timer)} strokeLinecap="round" />
          </svg>
          <Icon name={hover ? "pause" : "play"} size={11} className="absolute inset-0 m-auto text-fog" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mt-3">
        <button onClick={() => { target.current -= 1; setTimer(0); }} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }} aria-label="Previous"><Icon name="chevL" size={16} stroke={3} /></button>
        <div className="flex gap-1.5">{LOOP_ITEMS.map((it, i) => <span key={it.sym} className={cn("h-2 rounded-full transition-all duration-300", i === active ? "w-6 bg-sky" : "w-2 bg-ink-600")} />)}</div>
        <button onClick={() => { target.current += 1; setTimer(0); }} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }} aria-label="Next"><Icon name="chevR" size={16} stroke={3} /></button>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 3. 3D ring carousel — faces on a cylinder, drag to spin with inertia.
 * ============================================================================*/
const RING = [
  { title: "Patterns", icon: "candles", color: "#22d38a" },
  { title: "Risk", icon: "shield", color: "#3da5ff" },
  { title: "Arena", icon: "bolt", color: "#9b6bff" },
  { title: "Leagues", icon: "trophy", color: "#ffc53d" },
  { title: "DeFi", icon: "layers", color: "#ff8a3d" },
  { title: "Journal", icon: "book", color: "#ff4b6e" },
  { title: "Wallets", icon: "wallet", color: "#14F195" },
  { title: "Clubs", icon: "users", color: "#6dbbff" },
];

function RingCarousel() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const n = RING.length;
  const step = 360 / n;
  const FACE = 120;
  const radius = Math.round(FACE / 2 / Math.tan(Math.PI / n)) + 16;
  const angle = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(0);
  const drag = useRef<{ x: number; start: number; lastX: number; lastT: number } | null>(null);
  const [, force] = useState(0);

  useRafLoop((_, dt) => {
    if (!drag.current) {
      if (Math.abs(vel.current) > 8) {
        angle.current += vel.current * dt;
        vel.current *= Math.pow(0.04, dt);
      } else {
        if (target.current === null) target.current = Math.round(angle.current / step) * step;
        angle.current = damp(angle.current, target.current, 10, dt);
      }
    }
    force((x) => (x + 1) % 1000);
  }, visible);

  const active = mod(Math.round(-angle.current / step), n);
  const goTo = (i: number) => {
    const t = -i * step;
    const delta = ((t - angle.current) % 360 + 540) % 360 - 180;
    vel.current = 0;
    target.current = angle.current + delta;
  };

  return (
    <Asset code="CAR-03" title="3D Ring Carousel" desc="Eight faces on a true 3D cylinder. Drag to spin; release keeps the momentum, then settles on the nearest face. Faces light by how directly they face you." tags={["3D", "cylinder", "momentum"]}>
      <div
        ref={box}
        className="relative h-64 rounded-[22px] panel overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
        style={{ perspective: 900 }}
        onPointerDown={(e) => { drag.current = { x: e.clientX, start: angle.current, lastX: e.clientX, lastT: performance.now() }; vel.current = 0; target.current = null; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          vel.current = ((e.clientX - d.lastX) * 0.45) / Math.max(1, now - d.lastT) * 1000;
          d.lastX = e.clientX;
          d.lastT = now;
          angle.current = d.start + (e.clientX - d.x) * 0.45;
        }}
        onPointerUp={() => { drag.current = null; target.current = null; }}
        onPointerCancel={() => { drag.current = null; target.current = null; }}
      >
        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d", transform: `translateZ(${-radius}px) rotateY(${angle.current}deg)` }}>
          {RING.map((f, i) => {
            const facing = Math.cos(((i * step + angle.current) * Math.PI) / 180);
            return (
              <button
                key={f.title}
                onClick={() => goTo(i)}
                className="absolute rounded-2xl grid place-items-center text-center border"
                style={{
                  width: FACE, height: 150, left: -FACE / 2, top: -75,
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  background: `linear-gradient(180deg, ${f.color}55, #0e1a3b)`,
                  borderColor: `${f.color}88`,
                  filter: `brightness(${0.35 + Math.max(0, facing) * 0.75})`,
                  boxShadow: facing > 0.95 ? `0 0 30px ${f.color}66` : "none",
                }}
              >
                <div>
                  <span className="block" style={{ color: f.color }}><Icon name={f.icon} size={34} className="mx-auto" /></span>
                  <div className="text-sm font-black mt-2">{f.title}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-3 inset-x-0 text-center">
          <span key={active} className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg anim-pop" style={{ background: `${RING[active].color}33`, color: RING[active].color }}>{RING[active].title}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {RING.map((f, i) => <button key={f.title} onClick={() => goTo(i)} className={cn("w-7 h-7 rounded-lg grid place-items-center transition-all", i === active ? "scale-110" : "opacity-50 hover:opacity-100")} style={{ background: `${f.color}33`, color: f.color }} aria-label={f.title}><Icon name={f.icon} size={14} /></button>)}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 4. Fanned deck — stacked cards fan out on hover; swipe top card to the back.
 * ============================================================================*/
const DECK = [
  { title: "Bull flag", tag: "Continuation", color: "#22d38a", icon: "trendUp" },
  { title: "Double top", tag: "Reversal", color: "#ff4b6e", icon: "trendDown" },
  { title: "Cup & handle", tag: "Continuation", color: "#3da5ff", icon: "chart" },
  { title: "Head & shoulders", tag: "Reversal", color: "#9b6bff", icon: "crown" },
  { title: "Ascending triangle", tag: "Breakout", color: "#ffc53d", icon: "target" },
];

function FannedDeck() {
  const [order, setOrder] = useState(DECK.map((_, i) => i));
  const [fan, setFan] = useState(false);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const start = useRef<number | null>(null);

  const sendBack = (dir: 1 | -1) => {
    if (leaving) return;
    setLeaving(dir);
    window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setLeaving(0);
      setDx(0);
    }, 260);
  };
  const bringFront = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

  return (
    <Asset code="CAR-04" title="Fanned Deck" desc="A physical card stack: hover to fan it into an arc, swipe the top card and it tucks under the deck. Buttons cycle both directions." tags={["deck", "fan", "swipe"]}>
      <div className="relative h-64 rounded-[22px] panel overflow-hidden" onPointerEnter={() => setFan(true)} onPointerLeave={() => setFan(false)}>
        {order.map((cardIdx, depth) => ({ cardIdx, depth })).reverse().map(({ cardIdx, depth }) => {
          const c = DECK[cardIdx];
          const isTop = depth === 0;
          const fanAngle = fan ? (depth - (order.length - 1) / 2) * -9 : depth * 2;
          const fanX = fan ? (depth - (order.length - 1) / 2) * -26 : 0;
          const base = `translate3d(${fanX}px, ${fan ? Math.abs(depth - 2) * 6 : depth * 7}px, 0) rotate(${fanAngle}deg) scale(${1 - depth * (fan ? 0.02 : 0.04)})`;
          const transform = isTop
            ? leaving
              ? `translate3d(${leaving * 320}px, -20px, 0) rotate(${leaving * 24}deg)`
              : `translate3d(${dx}px, 0, 0) rotate(${dx * 0.07}deg)`
            : base;
          return (
            <div
              key={cardIdx}
              onPointerDown={isTop ? (e) => { start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); } : undefined}
              onPointerMove={isTop ? (e) => { if (start.current !== null) setDx(e.clientX - start.current); } : undefined}
              onPointerUp={isTop ? () => { if (Math.abs(dx) > 90) sendBack(dx > 0 ? 1 : -1); else setDx(0); start.current = null; } : undefined}
              className={cn("absolute left-1/2 top-1/2 w-40 h-52 -ml-20 -mt-[104px] rounded-3xl p-4 flex flex-col border-2 select-none touch-none", isTop ? "cursor-grab active:cursor-grabbing" : "")}
              style={{
                transform,
                transformOrigin: "50% 120%",
                transition: isTop && start.current !== null ? "none" : "transform .45s cubic-bezier(.2,.9,.3,1.2)",
                background: `linear-gradient(170deg, ${c.color}30, #0f1b3a 55%)`,
                borderColor: `${c.color}66`,
                boxShadow: "0 16px 30px -16px rgba(0,0,0,.9), 0 4px 0 #060c1f",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded" style={{ background: `${c.color}33`, color: c.color }}>{c.tag}</span>
                <span className="num text-[9px] text-mist">#{cardIdx + 1}</span>
              </div>
              <div className="flex-1 grid place-items-center" style={{ color: c.color }}><Icon name={c.icon} size={52} stroke={2} /></div>
              <div className="text-sm font-black leading-tight">{c.title}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3">
        <Btn variant="ghost" size="xs" icon="chevL" onClick={bringFront}>Back</Btn>
        <span className="text-[9px] text-mist">hover to fan · swipe top card</span>
        <Btn variant="ghost" size="xs" iconRight="chevR" onClick={() => sendBack(1)}>Next</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 5. Native snap — real scroll-snap, cards scale by distance to center.
 * ============================================================================*/
const SNAP_CARDS = [
  { title: "Morning brief", sub: "3 headlines · 2 min", icon: "sparkle", color: "#3da5ff" },
  { title: "Pattern drill", sub: "10 charts · 4 min", icon: "candles", color: "#22d38a" },
  { title: "Risk quiz", sub: "5 questions · 2 min", icon: "shield", color: "#ffc53d" },
  { title: "Arena duel", sub: "Best of 5 · live", icon: "bolt", color: "#9b6bff" },
  { title: "Journal", sub: "Reflect · 3 min", icon: "book", color: "#ff8a3d" },
  { title: "League check", sub: "You're #4", icon: "trophy", color: "#ff4b6e" },
];

function NativeSnap() {
  const track = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<number[]>(SNAP_CARDS.map((_, i) => (i === 0 ? 1 : 0)));
  const [prog, setProg] = useState(0);
  const raf = useRef(0);

  const measure = () => {
    raf.current = 0;
    const el = track.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const kids = Array.from(el.children) as HTMLElement[];
    setFocus(kids.map((k) => clamp(1 - Math.abs(k.offsetLeft + k.clientWidth / 2 - center) / (k.clientWidth * 1.1), 0, 1)));
    setProg(el.scrollWidth > el.clientWidth ? el.scrollLeft / (el.scrollWidth - el.clientWidth) : 0);
  };
  useEffect(() => { measure(); }, []);
  const by = (d: number) => {
    const el = track.current;
    const card = el?.children[0] as HTMLElement | undefined;
    if (el && card) el.scrollBy({ left: d * (card.clientWidth + 12), behavior: "smooth" });
  };

  return (
    <Asset code="CAR-05" title="Native Snap Rail" desc="Uses the browser's own scroll-snap (trackpad, touch and wheel feel native), while each card scales, lifts and brightens by its distance to the centre." tags={["scroll-snap", "scroll-linked", "native"]} span={2}>
      <div className="relative">
        <div
          ref={track}
          onScroll={() => { if (!raf.current) raf.current = requestAnimationFrame(measure); }}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-6 px-[20%]"
          style={{ scrollbarWidth: "none" }}
        >
          {SNAP_CARDS.map((c, i) => {
            const f = focus[i] ?? 0;
            return (
              <div key={c.title} className="snap-center shrink-0 w-[60%] sm:w-[42%] h-44 rounded-3xl p-4 flex flex-col border" style={{
                transform: `scale(${0.86 + f * 0.14}) translateY(${(1 - f) * 10}px)`,
                opacity: 0.45 + f * 0.55,
                background: `linear-gradient(150deg, ${c.color}${Math.round(20 + f * 40).toString(16)}, #0f1b3a 70%)`,
                borderColor: `${c.color}${f > 0.8 ? "99" : "33"}`,
                boxShadow: f > 0.8 ? `0 20px 40px -20px ${c.color}` : "none",
              }}>
                <div className="w-11 h-11 rounded-2xl grid place-items-center" style={{ background: `${c.color}26`, color: c.color }}><Icon name={c.icon} size={22} /></div>
                <div className="mt-auto">
                  <div className="font-black">{c.title}</div>
                  <div className="text-[10px] text-mist">{c.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#132246] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#132246] to-transparent" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => by(-1)} className="btn3d v-ghost w-9 h-9 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }} aria-label="Scroll left"><Icon name="chevL" size={15} stroke={3} /></button>
        <Bar value={prog * 100} color="sky" h={6} className="flex-1" shine={false} />
        <button onClick={() => by(1)} className="btn3d v-ghost w-9 h-9 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }} aria-label="Scroll right"><Icon name="chevR" size={15} stroke={3} /></button>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 6. Synced thumbnail gallery — directional slides, auto-centering strip.
 * ============================================================================*/
const CHAPTERS = [
  { title: "Money & markets", xp: 120, lessons: 8, color: "#3da5ff", icon: "wallet", curve: [60, 58, 52, 55, 48, 44, 40, 35] },
  { title: "Reading candles", xp: 180, lessons: 10, color: "#22d38a", icon: "candles", curve: [70, 62, 66, 50, 54, 40, 36, 24] },
  { title: "Trends & levels", xp: 160, lessons: 9, color: "#ffc53d", icon: "trendUp", curve: [55, 50, 58, 44, 46, 38, 30, 28] },
  { title: "Volume", xp: 140, lessons: 7, color: "#9b6bff", icon: "chart", curve: [40, 48, 42, 52, 46, 58, 50, 62] },
  { title: "Risk management", xp: 220, lessons: 12, color: "#ff8a3d", icon: "shield", curve: [60, 55, 57, 52, 50, 49, 45, 42] },
  { title: "Psychology", xp: 150, lessons: 8, color: "#ff4b6e", icon: "heart", curve: [50, 65, 40, 60, 45, 55, 48, 50] },
  { title: "DeFi primer", xp: 200, lessons: 11, color: "#14F195", icon: "layers", curve: [70, 60, 55, 45, 50, 35, 30, 20] },
];

function ThumbGallery() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const strip = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const go = (i: number) => {
    const next = mod(i, CHAPTERS.length);
    setDir(next > idx || (idx === CHAPTERS.length - 1 && next === 0) ? 1 : -1);
    setIdx(next);
  };
  useEffect(() => {
    const el = strip.current;
    const thumb = el?.children[idx] as HTMLElement | undefined;
    if (el && thumb) el.scrollTo({ left: thumb.offsetLeft - el.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }, [idx]);
  const c = CHAPTERS[idx];
  const pts = c.curve.map((v, i) => `${(i / (c.curve.length - 1)) * 200},${v}`).join(" ");
  return (
    <Asset code="CAR-06" title="Synced Thumbnail Gallery" desc="Main stage slides in the direction of travel; the thumbnail strip auto-centres the active chapter. Swipe the stage, click thumbs, or use ← →." tags={["gallery", "directional", "synced"]}>
      <div
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(idx + 1); if (e.key === "ArrowLeft") go(idx - 1); }}
        onPointerDown={(e) => { swipe.current = e.clientX; }}
        onPointerUp={(e) => { if (swipe.current !== null && Math.abs(e.clientX - swipe.current) > 50) go(idx + (e.clientX < swipe.current ? 1 : -1)); swipe.current = null; }}
        className="relative h-52 rounded-[22px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky/60 select-none touch-pan-y"
      >
        <div key={idx} className="absolute inset-0 p-5 flex flex-col" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${c.color}55, #0b1532 65%)`, animation: `${dir > 0 ? "slideFromRight" : "slideFromLeft"} .45s cubic-bezier(.2,.9,.3,1) both` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: `${c.color}33`, color: c.color }}><Icon name={c.icon} size={24} /></div>
            <div><div className="text-[9px] uppercase tracking-widest font-black text-mist">Chapter {idx + 1}</div><div className="font-black text-lg leading-tight">{c.title}</div></div>
          </div>
          <svg viewBox="0 0 200 80" className="w-full h-16 mt-auto" preserveAspectRatio="none">
            <polyline points={pts} fill="none" stroke={c.color} strokeWidth="3" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: "dash .9s .15s ease forwards" }} />
          </svg>
          <div className="flex gap-3 text-[10px] text-mist"><span><b className="num text-fog">{c.lessons}</b> lessons</span><span><b className="num text-gold">+{c.xp}</b> XP</span></div>
        </div>
      </div>
      <div ref={strip} className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: "none" }}>
        {CHAPTERS.map((ch, i) => (
          <button key={ch.title} onClick={() => go(i)} className={cn("shrink-0 w-14 h-14 rounded-xl grid place-items-center transition-all duration-300 border-2", i === idx ? "scale-100" : "scale-90 opacity-50 hover:opacity-90 border-transparent")} style={{ background: `${ch.color}22`, color: ch.color, borderColor: i === idx ? ch.color : "transparent" }} aria-label={ch.title}>
            <Icon name={ch.icon} size={20} />
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 7. Timeline scrubber — drag through crypto history; year parallax.
 * ============================================================================*/
const HISTORY = [
  { year: 2009, title: "Genesis block", text: "Bitcoin's first block is mined — a new kind of money begins.", icon: "btc", color: "#F7931A" },
  { year: 2010, title: "Pizza day", text: "10,000 BTC buys two pizzas — the first known real-world purchase.", icon: "heart", color: "#ff8a3d" },
  { year: 2013, title: "First mania", text: "Price crosses $1,000, then falls 80%. Volatility becomes legend.", icon: "trendUp", color: "#22d38a" },
  { year: 2015, title: "Ethereum", text: "Programmable smart contracts launch; tokens become possible.", icon: "layers", color: "#7B8CFF" },
  { year: 2017, title: "ICO boom", text: "Thousands of tokens launch; most later go to zero. Lesson: diligence.", icon: "rocket", color: "#ff4b6e" },
  { year: 2020, title: "DeFi summer", text: "Lending, swaps and yield move on-chain. Risk moves with it.", icon: "percent", color: "#14F195" },
  { year: 2022, title: "Deleveraging", text: "Over-leveraged players collapse. Risk management matters most.", icon: "shield", color: "#3da5ff" },
  { year: 2024, title: "Spot ETFs", text: "Traditional finance gains regulated exposure to Bitcoin.", icon: "trophy", color: "#ffc53d" },
];

function TimelineScrubber() {
  const track = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [dragging, setDragging] = useState(false);
  const first = HISTORY[0].year, last = HISTORY[HISTORY.length - 1].year;
  const year = first + t * (last - first);
  const nearest = HISTORY.reduce((best, e, i) => (Math.abs(e.year - year) < Math.abs(HISTORY[best].year - year) ? i : best), 0);
  const ev = HISTORY[nearest];
  const toT = (x: number) => { const r = track.current!.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0, 1); };
  const snap = () => setT((HISTORY[nearest].year - first) / (last - first));

  return (
    <Asset code="CAR-07" title="Timeline Scrubber" desc="Scrub through crypto history. The giant year counter moves in parallax against the handle; releasing snaps to the nearest milestone and the card cross-fades." tags={["scrubber", "parallax", "snap"]} span={2}>
      <div className="relative h-56 rounded-[22px] overflow-hidden panel">
        <div className="absolute inset-0 flex items-center pointer-events-none" style={{ transform: `translate3d(${-t * 40}%, 0, 0)`, transition: dragging ? "none" : "transform .5s cubic-bezier(.2,.9,.3,1)" }}>
          <span className="num font-black text-[180px] leading-none text-white/[.04] whitespace-nowrap pl-6">{Math.round(year)} · {Math.round(year) + 1}</span>
        </div>
        <div key={nearest} className="absolute left-5 right-5 top-5 flex items-start gap-4 anim-rise">
          <div className="w-14 h-14 rounded-2xl grid place-items-center shrink-0" style={{ background: `${ev.color}26`, color: ev.color, border: `1px solid ${ev.color}55` }}><Icon name={ev.icon} size={28} /></div>
          <div>
            <div className="num text-3xl font-black" style={{ color: ev.color }}>{ev.year}</div>
            <div className="font-black">{ev.title}</div>
            <p className="text-xs text-mist mt-1 max-w-md">{ev.text}</p>
          </div>
        </div>
        <div
          ref={track}
          className="absolute left-6 right-6 bottom-8 h-10 touch-none select-none cursor-pointer"
          onPointerDown={(e) => { setDragging(true); setT(toT(e.clientX)); e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (dragging) setT(toT(e.clientX)); }}
          onPointerUp={() => { setDragging(false); snap(); }}
          onPointerCancel={() => { setDragging(false); snap(); }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-ink-600" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-[#F7931A] to-[#ffc53d]" style={{ width: `${t * 100}%`, transition: dragging ? "none" : "width .4s" }} />
          {HISTORY.map((e, i) => {
            const pos = (e.year - first) / (last - first);
            return (
              <button key={e.year} onClick={(ev2) => { ev2.stopPropagation(); setT(pos); }} onPointerDown={(ev2) => ev2.stopPropagation()} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos * 100}%` }}>
                <span className={cn("block rounded-full transition-all", i === nearest ? "w-3.5 h-3.5" : "w-2 h-2")} style={{ background: pos <= t + 0.001 ? e.color : "#2b4380" }} />
                <span className={cn("absolute top-4 left-1/2 -translate-x-1/2 num text-[8px] font-black", i === nearest ? "text-fog" : "text-mist/60")}>{String(e.year).slice(2)}</span>
              </button>
            );
          })}
          <div className="absolute top-1/2 w-6 h-6 -ml-3 -translate-y-1/2 rounded-full bg-white border-4 border-gold shadow-[0_3px_0_rgba(0,0,0,.35)]" style={{ left: `${t * 100}%`, transition: dragging ? "none" : "left .4s cubic-bezier(.2,.9,.3,1.2)", transform: `translateY(-50%) scale(${dragging ? 1.2 : 1})` }} />
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 8. Before / After — draggable reveal with an auto demo sweep.
 * ============================================================================*/
function BeforeAfter() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const [x, setX] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const demo = useRef(0);

  useRafLoop((_, dt) => {
    demo.current += dt;
    const t = demo.current;
    // 0.5 → 0.18 → 0.82 → 0.5 over 2.4s, then stop.
    const v = t < 0.8 ? 0.5 - 0.32 * Math.sin((t / 0.8) * (Math.PI / 2)) : t < 1.8 ? 0.18 + 0.64 * ((1 - Math.cos(((t - 0.8) / 1) * Math.PI)) / 2) : 0.82 - 0.32 * Math.sin(Math.min(1, (t - 1.8) / 0.6) * (Math.PI / 2));
    setX(v);
    if (t > 2.4) setDemoed(true);
  }, visible && !demoed && !dragging);

  const setFrom = (clientX: number) => { const r = box.current!.getBoundingClientRect(); setX(clamp((clientX - r.left) / r.width, 0.02, 0.98)); };
  const chaos = "0,70 10,40 18,80 26,30 34,75 42,20 50,85 58,35 66,70 74,25 82,80 90,45 100,60";
  const calm = "0,70 10,66 20,62 30,60 40,54 50,52 60,46 70,44 80,38 90,34 100,30";

  return (
    <Asset code="CAR-08" title="Before / After" desc="Drag the divider to compare trading without a plan vs with one. Auto-sweeps once when it scrolls into view to teach the gesture; arrow keys supported." tags={["compare", "divider", "demo sweep"]}>
      <div
        ref={box}
        tabIndex={0}
        onKeyDown={(e) => { setDemoed(true); if (e.key === "ArrowLeft") setX((v) => clamp(v - 0.05, 0.02, 0.98)); if (e.key === "ArrowRight") setX((v) => clamp(v + 0.05, 0.02, 0.98)); }}
        onPointerDown={(e) => { setDemoed(true); setDragging(true); setFrom(e.clientX); e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (dragging) setFrom(e.clientX); }}
        onPointerUp={() => setDragging(false)}
        className="relative h-56 rounded-[22px] overflow-hidden select-none touch-pan-y cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-sky/60"
      >
        <div className="absolute inset-0 bg-[#1a0f24] p-4">
          <div className="text-[9px] uppercase tracking-widest font-black text-bear">Without a plan</div>
          <div className="num text-xl font-black text-bear">−38.2%</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-4 bottom-4 w-[calc(100%_-_2rem)] h-28"><polyline points={chaos} fill="none" stroke="#ff4b6e" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
        </div>
        <div className="absolute inset-0 bg-[#0c2a2a] p-4" style={{ clipPath: `inset(0 0 0 ${x * 100}%)` }}>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest font-black text-bull">With a plan</div>
            <div className="num text-xl font-black text-bull">+14.6%</div>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-4 bottom-4 w-[calc(100%_-_2rem)] h-28">
            <line x1="0" x2="100" y1="80" y2="80" stroke="#ff4b6e" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1="26" y2="26" stroke="#22d38a" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <polyline points={calm} fill="none" stroke="#22d38a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left: `${x * 100}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-ink-900 grid place-items-center shadow-[0_4px_0_rgba(0,0,0,.35)]" style={{ transform: `translate(-50%,-50%) scale(${dragging ? 1.12 : 1})` }}>
            <Icon name="swap" size={16} stroke={2.6} className="rotate-90" />
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 9. Kinetic panels — accordion slider with flex-grow physics.
 * ============================================================================*/
const PANELS = [
  { title: "Learn", text: "Bite-sized lessons with instant feedback.", icon: "book", color: "#3da5ff" },
  { title: "Practice", text: "Simulated markets, real mechanics, zero risk.", icon: "candles", color: "#22d38a" },
  { title: "Compete", text: "Skill-matched duels and weekly leagues.", icon: "bolt", color: "#9b6bff" },
  { title: "Reflect", text: "Journal every trade and see your patterns.", icon: "target", color: "#ffc53d" },
  { title: "Earn", text: "Streaks, medals and season rewards.", icon: "trophy", color: "#ff8a3d" },
];

function KineticPanels() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || !visible) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % PANELS.length), 3600);
    return () => window.clearInterval(id);
  }, [touched, visible]);
  return (
    <Asset code="CAR-09" title="Kinetic Panels" desc="Accordion slider: the active panel expands with flex-grow physics while others compress to vertical labels. Auto-cycles until you hover or tap." tags={["accordion", "flex", "autoplay"]} span={2}>
      <div ref={box} className="flex gap-2 h-60" onPointerEnter={() => setTouched(true)}>
        {PANELS.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.title}
              onClick={() => { setTouched(true); setActive(i); }}
              onPointerEnter={() => setActive(i)}
              className="relative rounded-3xl overflow-hidden text-left min-w-0"
              style={{
                flexGrow: on ? 5 : 1,
                flexBasis: 0,
                transition: "flex-grow .6s cubic-bezier(.2,.9,.3,1)",
                background: `linear-gradient(170deg, ${p.color}${on ? "55" : "22"}, #0e1a3b 70%)`,
                border: `1px solid ${p.color}${on ? "88" : "33"}`,
              }}
            >
              <Icon name={p.icon} size={120} stroke={1} className="absolute -right-6 -bottom-6 opacity-10" />
              <div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs font-black uppercase tracking-[.25em] transition-opacity duration-300", on ? "opacity-0" : "opacity-80")} style={{ color: p.color }}>{p.title}</div>
              <div className={cn("absolute inset-0 p-5 flex flex-col transition-all duration-500", on ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-4 pointer-events-none")}>
                <div className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: `${p.color}33`, color: p.color }}><Icon name={p.icon} size={24} /></div>
                <div className="mt-auto">
                  <div className="num text-[10px] font-black text-mist">0{i + 1}</div>
                  <div className="text-2xl font-black">{p.title}</div>
                  <p className="text-xs text-fog/75 mt-1 max-w-[220px]">{p.text}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 10. Drum picker — iOS-style 3D wheels on native scroll-snap.
 * ============================================================================*/
const DRUM_ITEM = 36;

function Drum({ items, value, onChange, label }: { items: string[]; value: number; onChange: (i: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(value * DRUM_ITEM);
  const settle = useRef<number | null>(null);
  useEffect(() => { ref.current?.scrollTo({ top: value * DRUM_ITEM }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex-1">
      <div className="text-[9px] uppercase tracking-widest font-black text-mist text-center mb-2">{label}</div>
      <div className="relative h-[180px] rounded-2xl well overflow-hidden" style={{ perspective: 500 }}>
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-9 rounded-xl bg-sky/15 border border-sky/40 pointer-events-none" />
        <div
          ref={ref}
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            setScroll(top);
            if (settle.current) window.clearTimeout(settle.current);
            settle.current = window.setTimeout(() => { onChange(clamp(Math.round(top / DRUM_ITEM), 0, items.length - 1)); navigator.vibrate?.(5); }, 90);
          }}
          className="h-full overflow-y-auto snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", paddingTop: 72, paddingBottom: 72 }}
        >
          {items.map((it, i) => {
            const off = (i * DRUM_ITEM - scroll) / DRUM_ITEM;
            return (
              <button
                key={it}
                onClick={() => ref.current?.scrollTo({ top: i * DRUM_ITEM, behavior: "smooth" })}
                className="snap-center w-full grid place-items-center num font-black"
                style={{ height: DRUM_ITEM, transform: `rotateX(${clamp(-off * 24, -80, 80)}deg)`, opacity: clamp(1 - Math.abs(off) * 0.32, 0.1, 1), color: Math.abs(off) < 0.5 ? "#eef3ff" : "#8ea3cf", fontSize: Math.abs(off) < 0.5 ? 16 : 13 }}
              >{it}</button>
            );
          })}
        </div>
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a1330] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a1330] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

function DrumPicker() {
  const TF = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];
  const LEV = ["1×", "2×", "3×", "5×", "10×", "20×", "50×"];
  const ASSET = ["BTC", "ETH", "SOL", "TON", "BNB"];
  const [tf, setTf] = useState(4);
  const [lev, setLev] = useState(1);
  const [asset, setAsset] = useState(0);
  const risky = lev >= 4;
  return (
    <Asset code="CAR-10" title="Drum Picker" desc="iOS-style wheels built on native scroll-snap: each row tilts in 3D by its distance from the centre line and fires a light haptic on settle." tags={["wheel picker", "3D", "haptic"]}>
      <div className="flex gap-2">
        <Drum label="Asset" items={ASSET} value={asset} onChange={setAsset} />
        <Drum label="Timeframe" items={TF} value={tf} onChange={setTf} />
        <Drum label="Leverage" items={LEV} value={lev} onChange={setLev} />
      </div>
      <div className={cn("mt-3 rounded-xl p-3 flex items-center gap-3 transition-colors", risky ? "bg-bear/10 border border-bear/30" : "bg-sky/[.07] border border-sky/20")}>
        <Coin sym={ASSET[asset]} size={30} />
        <div className="flex-1 text-xs"><b>{ASSET[asset]}</b> · {TF[tf]} chart · <b className={risky ? "text-bear" : "text-sky"}>{LEV[lev]}</b></div>
        {risky && <Icon name="alert" size={16} className="text-bear anim-wiggle" />}
      </div>
    </Asset>
  );
}

export default function Carousels() {
  return (
    <Section id="carousels" index="P3" title="Carousels & Sliders" subtitle="Ten distinct carousel mechanics — each with its own physics, gesture model and purpose in the product.">
      <StoriesCarousel />
      <InfiniteLoop />
      <RingCarousel />
      <NativeSnap />
      <FannedDeck />
      <TimelineScrubber />
      <ThumbGallery />
      <KineticPanels />
      <BeforeAfter />
      <DrumPicker />
    </Section>
  );
}
