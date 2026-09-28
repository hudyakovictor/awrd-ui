import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Asset, Btn, Coin, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import {
  clamp,
  easeOutCubic,
  map,
  useDampedPointer,
  useRafLoop,
  useScrollProgress,
  useScrollVelocity,
  useSpringNumber,
  wrap,
} from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 * GAMEPLAY LAB
 * Integrated, production-like interaction patterns rather than static samples.
 * =============================================================================*/

const SCENES = [
  {
    id: "arena",
    name: "Chart Arena",
    image: "/images/gameplay-arena.jpg",
    accent: "#22d38a",
    title: "Read the move before the crowd.",
    detail: "Fast market decisions become a competitive skill drill.",
  },
  {
    id: "map",
    name: "Learning World",
    image: "/images/learning-map.jpg",
    accent: "#3da5ff",
    title: "Every island is a market skill.",
    detail: "Lessons connect into a world, not a disposable checklist.",
  },
  {
    id: "bull",
    name: "Pip's Floor",
    image: "/images/bullrun-hero.jpg",
    accent: "#ffc53d",
    title: "A coach who reacts to your process.",
    detail: "Pip celebrates discipline, not reckless profit screenshots.",
  },
];

function CinematicScrollChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  const [scene, setScene] = useState(0);
  const current = SCENES[scene];
  const chapter = Math.min(2, Math.floor(progress * 3));
  const local = progress * 3 - chapter;
  const textProgress = easeOutCubic(clamp(local * 1.45, 0, 1));
  const imageScale = 1.12 - progress * 0.09;

  return (
    <Asset
      code="LAB-01"
      title="Cinematic Scroll Chapter"
      desc="A full cinematic plane reacts to section scroll: image depth, vignette, chapter copy and route telemetry all share one progress signal."
      tags={["scroll-driven", "cinematic", "image"]}
      span={3}
    >
      <div ref={ref} className="relative h-[640px] overflow-hidden rounded-[28px] bg-ink-950">
        <div
          className="absolute -inset-12 bg-cover bg-center transition-[background-image] duration-700"
          style={{
            backgroundImage: `url(${current.image})`,
            transform: `translate3d(0, ${map(progress, 0, 1, -18, 18)}px, 0) scale(${imageScale})`,
            filter: `saturate(${1.05 + progress * 0.25}) contrast(1.08)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,19,.94),rgba(3,7,19,.52)_52%,rgba(3,7,19,.18)),linear-gradient(0deg,#050b1c,transparent_55%)]" />
        <div className="absolute inset-0 dotgrid opacity-20" style={{ transform: `translateY(${progress * 35}px)` }} />

        <div className="absolute left-5 right-5 top-5 flex items-center gap-3 z-10">
          <div className="glass rounded-xl p-1 flex gap-1">
            {SCENES.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setScene(index)}
                className={cn(
                  "h-9 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  scene === index ? "bg-white/15 text-white" : "text-mist hover:text-fog",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="ml-auto glass rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bull anim-live" />
            <span className="num text-[9px] font-black">SCROLL {Math.round(progress * 100)}%</span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-end p-6 sm:p-10">
          <div
            key={`${scene}-${chapter}`}
            className="max-w-xl relative z-10"
            style={{
              opacity: textProgress,
              transform: `translate3d(${(1 - textProgress) * -45}px, ${(1 - textProgress) * 25}px, 0)`,
            }}
          >
            <div className="text-[10px] uppercase tracking-[.22em] font-black mb-3" style={{ color: current.accent }}>
              Chapter 0{chapter + 1} · {current.name}
            </div>
            <h3 className="text-3xl sm:text-5xl font-black leading-[.98] tracking-tight">{current.title}</h3>
            <p className="text-sm sm:text-base text-fog/70 mt-4 max-w-md leading-relaxed">{current.detail}</p>
            <div className="flex items-center gap-3 mt-6">
              <Btn variant={scene === 0 ? "bull" : scene === 1 ? "sky" : "gold"} size="sm" icon="play">Enter chapter</Btn>
              <span className="text-[9px] text-mist">Scroll changes camera and chapter beat</span>
            </div>
          </div>
        </div>

        <div className="absolute right-5 top-20 bottom-20 flex flex-col items-center justify-center gap-2">
          {[0, 1, 2].map((item) => (
            <button
              key={item}
              className={cn(
                "w-2 rounded-full transition-all duration-300",
                chapter === item ? "h-10 bg-white" : "h-4 bg-white/25",
              )}
              aria-label={`Chapter ${item + 1}`}
            />
          ))}
        </div>
        <div className="absolute bottom-5 right-5 num text-[10px] text-fog/50">01 / 03</div>
      </div>
    </Asset>
  );
}

/* ---------- Full-screen vertical story reels ---------- */

const REELS = [
  { icon: "candles", title: "Wicks tell a story", body: "This one rejected $67k in twelve seconds.", color: "#3da5ff", stat: "12 sec" },
  { icon: "shield", title: "Stop before entry", body: "Your stop defines the trade. Your hope does not.", color: "#22d38a", stat: "1.2 R" },
  { icon: "bolt", title: "Fast is trained", body: "Pattern recognition is recall, not prediction.", color: "#ffc53d", stat: "420 ms" },
  { icon: "book", title: "Review the miss", body: "A clean mistake is worth more than a lucky win.", color: "#9b6bff", stat: "+18 XP" },
  { icon: "trophy", title: "Discipline compounds", body: "Twenty-one practice days. Zero real-money pressure.", color: "#ff8a3d", stat: "21 days" },
];

function StoryReels() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const dragStart = useRef<number | null>(null);
  const spring = useSpringNumber(-index * 100, { stiffness: 260, damping: 28 });

  useInterval(() => {
    if (paused) return;
    setElapsed((value) => {
      if (value >= 100) {
        setIndex((current) => (current + 1) % REELS.length);
        return 0;
      }
      return value + 2;
    });
  }, 80);

  const move = (direction: number) => {
    setIndex((current) => wrap(current + direction, 0, REELS.length));
    setElapsed(0);
  };

  return (
    <Asset code="LAB-02" title="Story Reels" desc="Vertical, auto-advancing story carousel with pause-on-hold, swipe navigation, progress rails and reduced-motion compatible springs." tags={["stories", "vertical swipe", "autoplay"]}>
      <div
        className="relative h-[520px] rounded-[28px] overflow-hidden bg-ink-950 touch-pan-x select-none"
        onPointerDown={(event) => { dragStart.current = event.clientY; setPaused(true); }}
        onPointerUp={(event) => {
          if (dragStart.current !== null) {
            const delta = event.clientY - dragStart.current;
            if (Math.abs(delta) > 48) move(delta < 0 ? 1 : -1);
          }
          dragStart.current = null;
          setPaused(false);
        }}
        onPointerCancel={() => { dragStart.current = null; setPaused(false); }}
      >
        <div className="absolute top-3 left-3 right-3 z-20 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${REELS.length},1fr)` }}>
          {REELS.map((_, itemIndex) => (
            <div key={itemIndex} className="h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: itemIndex < index ? "100%" : itemIndex === index ? `${elapsed}%` : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="h-full" style={{ transform: `translate3d(0, ${spring}%, 0)`, willChange: "transform" }}>
          {REELS.map((reel, itemIndex) => (
            <article key={reel.title} className="relative h-full p-5 flex flex-col justify-end overflow-hidden">
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 28%, ${reel.color}4d, transparent 42%), linear-gradient(160deg,#102044,#060d20 65%)` }} />
              <div className="absolute inset-0 dotgrid opacity-20" />
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-52 h-52 rounded-full grid place-items-center" style={{ background: `${reel.color}18`, boxShadow: `0 0 80px ${reel.color}2b` }}>
                <span className="absolute anim-float" style={{ color: reel.color }}><Icon name={reel.icon} size={88} stroke={1.5} /></span>
              </div>
              <div className="relative z-10">
                <div className="num text-[10px] font-black uppercase tracking-[.22em] mb-3" style={{ color: reel.color }}>Signal {String(itemIndex + 1).padStart(2, "0")}</div>
                <h4 className="text-3xl font-black leading-none">{reel.title}</h4>
                <p className="text-sm text-fog/70 mt-3 leading-relaxed">{reel.body}</p>
                <div className="flex items-center justify-between mt-5">
                  <span className="num text-xl font-black" style={{ color: reel.color }}>{reel.stat}</span>
                  <span className="text-[9px] text-mist">Swipe up · Hold to pause</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <button onClick={() => move(-1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevU" size={15} /></button>
          <button onClick={() => move(1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevD" size={15} /></button>
        </div>
        {paused && <div className="absolute inset-0 z-10 bg-black/12 grid place-items-center"><span className="w-14 h-14 glass rounded-full grid place-items-center"><Icon name="minus" size={22} /></span></div>}
      </div>
    </Asset>
  );
}

/* ---------- Seamless infinite loop carousel ---------- */

const LOOP_ITEMS = [
  { symbol: "BTC", title: "Bitcoin", change: 2.41 },
  { symbol: "ETH", title: "Ethereum", change: -1.12 },
  { symbol: "SOL", title: "Solana", change: 6.82 },
  { symbol: "TON", title: "Toncoin", change: -3.4 },
  { symbol: "BNB", title: "BNB", change: 0.54 },
];

function InfiniteLoopCarousel() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const virtual = useSpringNumber(index, { stiffness: 210, damping: 25 });
  const pointer = useRef<{ x: number; index: number } | null>(null);

  useInterval(() => {
    if (auto) setIndex((value) => value + 1);
  }, 2400);

  const select = (next: number) => setIndex(next);
  return (
    <Asset code="LAB-03" title="Infinite Loop Carousel" desc="A seamless, bi-directional asset loop with auto-play, pause, pointer drag and wrap-safe index math." tags={["infinite", "loop", "autoplay"]} span={2}>
      <div
        className="relative h-64 rounded-[24px] panel overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onPointerEnter={() => setAuto(false)}
        onPointerLeave={() => { setAuto(true); pointer.current = null; }}
        onPointerDown={(event) => { pointer.current = { x: event.clientX, index }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => {
          if (!pointer.current) return;
          const delta = event.clientX - pointer.current.x;
          if (Math.abs(delta) > 75) {
            select(pointer.current.index + (delta < 0 ? 1 : -1));
            pointer.current = { x: event.clientX, index: index + (delta < 0 ? 1 : -1) };
          }
        }}
        onPointerUp={() => { pointer.current = null; }}
      >
        <div className="absolute inset-0 dotgrid opacity-25" />
        <div className="absolute inset-0 grid place-items-center" style={{ perspective: 850 }}>
          {Array.from({ length: 7 }, (_, offsetIndex) => {
            const offset = offsetIndex - 3;
            const itemIndex = wrap(Math.round(virtual) + offset, 0, LOOP_ITEMS.length);
            const item = LOOP_ITEMS[itemIndex];
            const distance = Math.abs(offset + (virtual - Math.round(virtual)));
            const x = offset * 175 - (virtual - Math.round(virtual)) * 175;
            return (
              <button
                key={`${item.symbol}-${offsetIndex}-${Math.floor(index / LOOP_ITEMS.length)}`}
                onClick={() => select(Math.round(virtual) + offset)}
                className="absolute w-40 h-44 rounded-3xl game-surface p-4 text-left transition-opacity"
                style={{
                  transform: `translate3d(${x}px, ${distance * 7}px, ${-distance * 95}px) rotateY(${offset * -10}deg)`,
                  opacity: 1 - Math.min(0.82, distance * 0.24),
                  zIndex: 20 - Math.round(distance),
                }}
              >
                <Coin sym={item.symbol} size={44} />
                <div className="font-black mt-4">{item.title}</div>
                <div className="text-[9px] text-mist">{item.symbol}/USDT</div>
                <div className={cn("num text-lg font-black mt-2", item.change >= 0 ? "text-bull" : "text-bear")}>{item.change >= 0 ? "+" : ""}{item.change}%</div>
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <button onClick={() => setIndex((value) => value - 1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevL" size={15} /></button>
          <div className="flex items-center gap-2"><span className={cn("w-2 h-2 rounded-full", auto ? "bg-bull anim-live" : "bg-gold")} /><span className="text-[8px] uppercase tracking-widest font-black text-mist">{auto ? "Auto loop" : "Paused by hover"}</span></div>
          <button onClick={() => setIndex((value) => value + 1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevR" size={15} /></button>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Stacked deck carousel ---------- */

const DECK = [
  { id: 1, title: "Hammer", cue: "Long lower wick", color: "#22d38a", icon: "arrowUp" },
  { id: 2, title: "Shooting star", cue: "Long upper wick", color: "#ff4b6e", icon: "arrowDown" },
  { id: 3, title: "Doji", cue: "Open ≈ close", color: "#ffc53d", icon: "minus" },
  { id: 4, title: "Engulfing", cue: "Body covers prior", color: "#9b6bff", icon: "layers" },
  { id: 5, title: "Marubozu", cue: "No meaningful wick", color: "#3da5ff", icon: "candles" },
];

function StackedDeckCarousel() {
  const [cards, setCards] = useState(DECK);
  const [learned, setLearned] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const pointer = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const dismiss = (side: "left" | "right") => {
    if (!cards.length) return;
    setDirection(side);
    if (side === "right") setLearned((value) => value + 1);
    setTimeout(() => {
      setCards((items) => [...items.slice(1), items[0]]);
      setDirection(null);
      setDragX(0);
    }, 260);
  };

  return (
    <Asset code="LAB-04" title="Stacked Deck" desc="A depth-stacked flash-card carousel with drag dismissal, Again / Learned semantics and a persistent mastery count." tags={["stack", "cards", "swipe"]}>
      <div className="relative h-[420px] rounded-[24px] panel overflow-hidden">
        <div className="absolute top-4 left-4 right-4 flex justify-between text-[9px] font-black uppercase tracking-widest text-mist"><span>Pattern review</span><span className="num text-bull">{learned} learned</span></div>
        <div className="absolute inset-x-5 top-16 bottom-16">
          {cards.slice(0, 4).reverse().map((card, reverseIndex) => {
            const depth = 3 - reverseIndex;
            const top = depth === 0;
            const translate = depth * 10;
            const scale = 1 - depth * 0.045;
            const topTransform = direction ? `translateX(${direction === "right" ? 130 : -130}%) rotate(${direction === "right" ? 18 : -18}deg)` : `translateX(${dragX}px) rotate(${dragX * 0.045}deg)`;
            return (
              <div
                key={card.id}
                className="absolute inset-0 rounded-[26px] overflow-hidden select-none"
                style={{
                  transform: top ? topTransform : `translateY(${translate}px) scale(${scale})`,
                  transition: top && pointer.current !== null ? "none" : "transform .28s cubic-bezier(.2,.9,.3,1.1), opacity .28s",
                  zIndex: 20 - depth,
                  background: `linear-gradient(145deg,${card.color}df,${card.color}66 70%,#0a1430)`,
                  boxShadow: "0 12px 0 rgba(0,0,0,.28), inset 0 2px 0 rgba(255,255,255,.25)",
                  opacity: 1 - depth * 0.14,
                }}
                onPointerDown={top ? (event) => { pointer.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); } : undefined}
                onPointerMove={top ? (event) => { if (pointer.current !== null) setDragX(event.clientX - pointer.current); } : undefined}
                onPointerUp={top ? () => { if (Math.abs(dragX) > 75) dismiss(dragX > 0 ? "right" : "left"); else setDragX(0); pointer.current = null; } : undefined}
              >
                <div className="absolute inset-0 dotgrid opacity-20" />
                <div className="relative h-full p-6 flex flex-col">
                  <div className="flex justify-between"><span className="text-[9px] uppercase tracking-widest font-black text-white/65">Pattern {card.id}/5</span><Icon name={card.icon} size={23} /></div>
                  <div className="flex-1 grid place-items-center text-center"><div><Icon name="candles" size={70} className="mx-auto text-white/80" /><div className="text-3xl font-black mt-4">{card.title}</div><div className="text-sm text-white/70 mt-1">{card.cue}</div></div></div>
                  <div className="flex justify-between text-[8px] uppercase tracking-widest font-black text-white/50"><span>← Again</span><span>Learned →</span></div>
                </div>
                {top && Math.abs(dragX) > 35 && <span className={cn("absolute top-5 text-xs font-black px-3 py-1 rounded-lg border-2", dragX > 0 ? "left-5 border-bull text-bull rotate-[-10deg]" : "right-5 border-bear text-bear rotate-[10deg]")}>{dragX > 0 ? "LEARNED" : "AGAIN"}</span>}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-3 inset-x-3 grid grid-cols-2 gap-2"><Btn variant="bear" size="sm" icon="x" onClick={() => dismiss("left")}>Again</Btn><Btn variant="bull" size="sm" icon="check" onClick={() => dismiss("right")}>Learned</Btn></div>
      </div>
    </Asset>
  );
}

/* ---------- Thumbnail gallery carousel ---------- */

function ThumbnailGallery() {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = SCENES[index];
  const spring = useSpringNumber(index, { stiffness: 260, damping: 30 });

  return (
    <Asset code="LAB-05" title="Thumbnail Gallery" desc="Large visual stage, thumbnail rail, keyboard paging and tap-to-zoom. Stage crossfades while caption content slides independently." tags={["gallery", "thumbnails", "zoom"]} span={2}>
      <div
        className="relative h-[470px] rounded-[26px] panel overflow-hidden"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") setIndex((value) => wrap(value + 1, 0, SCENES.length));
          if (event.key === "ArrowLeft") setIndex((value) => wrap(value - 1, 0, SCENES.length));
          if (event.key === "Escape") setZoomed(false);
        }}
      >
        <button onClick={() => setZoomed(!zoomed)} className="absolute inset-0 w-full h-full text-left overflow-hidden">
          {SCENES.map((scene, itemIndex) => (
            <div key={scene.id} className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${scene.image})`, opacity: index === itemIndex ? 1 : 0, transform: index === itemIndex && zoomed ? "scale(1.12)" : "scale(1.03)" }} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
          <span className="absolute right-4 top-4 w-10 h-10 glass rounded-xl grid place-items-center"><Icon name={zoomed ? "minus" : "search"} size={18} /></span>
        </button>
        <div className="absolute left-5 bottom-28 right-5 pointer-events-none" style={{ transform: `translateX(${(spring - index) * 25}px)` }}>
          <div className="text-[9px] uppercase tracking-[.2em] font-black" style={{ color: current.accent }}>Environment 0{index + 1}</div>
          <div className="text-2xl font-black mt-1">{current.name}</div>
          <p className="text-xs text-fog/70 mt-1">{current.detail}</p>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex gap-2">
          {SCENES.map((scene, itemIndex) => (
            <button key={scene.id} onClick={() => { setIndex(itemIndex); setZoomed(false); }} className={cn("relative flex-1 h-20 rounded-xl overflow-hidden border-2 transition-all", index === itemIndex ? "border-white -translate-y-1" : "border-transparent opacity-60 hover:opacity-100")}>
              <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.image})` }} />
              <span className="absolute inset-0 bg-black/25" />
              <span className="absolute left-2 bottom-2 text-[8px] font-black uppercase text-white">{scene.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Before / after comparison slider ---------- */

function BeforeAfterSlider() {
  const [position, setPosition] = useState(52);
  const dragging = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const update = (clientX: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    setPosition(clamp(((clientX - bounds.left) / bounds.width) * 100, 5, 95));
  };

  return (
    <Asset code="LAB-06" title="Before / After Slider" desc="Drag or use arrow keys to compare a raw chart with the annotated learning view. Accessible range semantics are preserved." tags={["comparison", "drag slider", "keyboard"]}>
      <div ref={ref} className="relative h-72 rounded-[24px] overflow-hidden panel select-none">
        <div className="absolute inset-0 p-4">
          <div className="text-[8px] uppercase tracking-widest font-black text-mist mb-2">Raw chart</div>
          <ChartIllustration annotated={false} />
        </div>
        <div className="absolute inset-0 p-4 overflow-hidden bg-ink-850" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <div className="text-[8px] uppercase tracking-widest font-black text-bull mb-2">Learning view</div>
          <ChartIllustration annotated />
        </div>
        <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_18px_rgba(255,255,255,.6)]" style={{ left: `${position}%` }}>
          <button
            role="slider"
            aria-label="Chart comparison"
            aria-valuemin={5}
            aria-valuemax={95}
            aria-valuenow={Math.round(position)}
            onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => { if (dragging.current) update(event.clientX); }}
            onPointerUp={() => { dragging.current = false; }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") setPosition((value) => clamp(value - 2, 5, 95));
              if (event.key === "ArrowRight") setPosition((value) => clamp(value + 2, 5, 95));
            }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-ink-900 grid place-items-center shadow-lg cursor-ew-resize"
          >
            <Icon name="swap" size={20} />
          </button>
        </div>
        <span className="absolute left-4 bottom-3 text-[9px] font-black text-bull">ANNOTATED</span>
        <span className="absolute right-4 bottom-3 text-[9px] font-black text-mist">RAW</span>
      </div>
    </Asset>
  );
}

function ChartIllustration({ annotated }: { annotated: boolean }) {
  const values = [52, 48, 55, 38, 32, 35, 24, 18, 27, 39, 34, 52, 48, 63, 57, 72, 68, 82];
  return (
    <svg viewBox="0 0 360 190" className="w-full h-52">
      {[35, 75, 115, 155].map((y) => <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="rgba(140,175,255,.08)" />)}
      <polyline points={values.map((value, index) => `${index * 21},${170 - value * 1.65}`).join(" ")} fill="none" stroke={annotated ? "#22d38a" : "#8ea3cf"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {annotated && <>
        <rect x="125" y="112" width="55" height="42" rx="8" fill="rgba(34,211,138,.08)" stroke="#22d38a" strokeDasharray="5 4" />
        <text x="152" y="106" fill="#22d38a" textAnchor="middle" fontSize="9" fontWeight="800">SUPPORT</text>
        <line x1="0" x2="360" y1="74" y2="74" stroke="#ffc53d" strokeDasharray="6 5" />
        <text x="326" y="68" fill="#ffc53d" fontSize="9" fontWeight="800">BREAKOUT</text>
        <circle cx="315" cy="50" r="8" fill="rgba(155,107,255,.22)" stroke="#9b6bff" />
      </>}
    </svg>
  );
}

/* ---------- Market replay timeline scrubber ---------- */

function TimelineScrubber() {
  const [frame, setFrame] = useState(38);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bookmark, setBookmark] = useState<number[]>([18, 62]);
  const total = 100;

  useInterval(() => {
    if (!playing) return;
    setFrame((value) => value >= total ? 0 : value + speed);
  }, 90);

  const values = useMemo(() => Array.from({ length: total }, (_, index) => 45 + Math.sin(index * 0.18) * 16 + Math.sin(index * 0.61) * 7 + index * 0.18), []);
  const visible = values.slice(0, Math.max(2, frame));

  return (
    <Asset code="LAB-07" title="Timeline Scrubber" desc="Play, pause, scrub, change speed and bookmark exact market moments. The chart reveals only historical data up to the selected frame." tags={["timeline", "scrub", "playback"]} span={2}>
      <div className="game-surface rounded-[24px] p-4">
        <div className="flex items-center gap-3 mb-4">
          <Coin sym="BTC" size={38} />
          <div className="flex-1"><div className="text-[9px] uppercase tracking-widest font-black text-mist">BTC replay · Jan 11</div><div className="num text-lg font-black">$67,{String(300 + frame * 3).padStart(3, "0")}.00</div></div>
          <span className="text-[8px] font-black px-2 py-1 rounded-lg bg-gold/10 text-gold border border-gold/25">HISTORICAL</span>
        </div>
        <svg viewBox="0 0 600 190" className="w-full h-52 well rounded-xl">
          {[35, 75, 115, 155].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
          <polyline points={visible.map((value, index) => `${(index / (total - 1)) * 600},${175 - value * 1.8}`).join(" ")} fill="none" stroke="#3da5ff" strokeWidth="3" strokeLinejoin="round" />
          {bookmark.filter((value) => value <= frame).map((value) => <g key={value}><line x1={(value / total) * 600} x2={(value / total) * 600} y1="0" y2="190" stroke="#ffc53d" strokeDasharray="4 4" /><circle cx={(value / total) * 600} cy="14" r="5" fill="#ffc53d" /></g>)}
          <line x1={(frame / total) * 600} x2={(frame / total) * 600} y1="0" y2="190" stroke="#eef3ff" strokeWidth="2" />
        </svg>
        <div className="relative mt-3">
          <input type="range" min={1} max={total} value={frame} onChange={(event) => { setFrame(+event.target.value); setPlaying(false); }} className="w-full accent-sky" aria-label="Market replay frame" />
          {bookmark.map((value) => <span key={value} className="absolute top-0 w-1.5 h-1.5 rounded-full bg-gold pointer-events-none" style={{ left: `${value}%` }} />)}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={() => setPlaying(!playing)} className="btn3d v-sky w-11 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name={playing ? "minus" : "play"} size={17} fill={playing ? "none" : "currentColor"} /></button>
          <button onClick={() => setFrame(Math.max(1, frame - 1))} className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center"><Icon name="chevL" size={15} /></button>
          <button onClick={() => setFrame(Math.min(total, frame + 1))} className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center"><Icon name="chevR" size={15} /></button>
          <div className="well p-1 flex gap-1">{[1, 2, 4].map((value) => <button key={value} onClick={() => setSpeed(value)} className={cn("num h-7 px-2 rounded-lg text-[9px] font-black", speed === value ? "bg-gold text-ink-900" : "text-mist")}>{value}×</button>)}</div>
          <button onClick={() => setBookmark((items) => items.includes(frame) ? items.filter((item) => item !== frame) : [...items, frame])} className="ml-auto h-9 px-3 rounded-xl bg-gold/10 text-gold border border-gold/25 text-[9px] font-black flex items-center gap-1"><Icon name="bookmark" size={13} />Bookmark</button>
          <span className="num text-[9px] text-mist">{frame}s / {total}s</span>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Pinch / wheel zoom chart ---------- */

function PinchZoomChart() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const previousDistance = useRef<number | null>(null);
  const previousSingle = useRef<number | null>(null);
  const values = useMemo(() => Array.from({ length: 80 }, (_, index) => 50 + Math.sin(index * 0.24) * 18 + Math.sin(index * 0.72) * 7 + index * 0.28), []);

  const pointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    previousSingle.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const active = [...pointers.current.values()];
    if (active.length >= 2) {
      const distance = Math.hypot(active[0].x - active[1].x, active[0].y - active[1].y);
      if (previousDistance.current !== null) setZoom((value) => clamp(value * (distance / previousDistance.current!), 1, 4));
      previousDistance.current = distance;
    } else if (previousSingle.current !== null) {
      setPan((value) => clamp(value + (event.clientX - previousSingle.current!) / 3, -120, 120));
      previousSingle.current = event.clientX;
    }
  };
  const release = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    previousDistance.current = null;
    previousSingle.current = null;
  };
  const wheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom((value) => clamp(value - event.deltaY * 0.002, 1, 4));
  };

  return (
    <Asset code="LAB-08" title="Pinch & Zoom Chart" desc="Trackpad wheel, one-finger pan and two-finger pinch share one chart transform with hard zoom boundaries and reset." tags={["pinch", "zoom", "multi-touch"]} span={2}>
      <div className="game-surface rounded-[24px] p-4">
        <div className="flex items-center gap-3 mb-3"><Coin sym="ETH" size={36} /><div className="flex-1"><div className="text-[9px] uppercase font-black tracking-widest text-mist">ETH / USDT</div><div className="num font-black text-lg">$3,512.40</div></div><span className="num text-xs font-black text-sky">{zoom.toFixed(2)}×</span><Btn variant="ghost" size="xs" icon="refresh" onClick={() => { setZoom(1); setPan(0); }}>Reset</Btn></div>
        <div className="well rounded-xl overflow-hidden touch-none">
          <svg viewBox="0 0 600 260" className="w-full h-72 cursor-grab active:cursor-grabbing" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onWheel={wheel}>
            {[45, 95, 145, 195].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
            <g transform={`translate(${pan} 0) scale(${zoom} 1)`} style={{ transformOrigin: "300px 130px" }}>
              <polyline points={values.map((value, index) => `${(index / 79) * 600},${235 - value * 2.2}`).join(" ")} fill="none" stroke="#9b6bff" strokeWidth={3 / zoom} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {values.filter((_, index) => index % 8 === 0).map((value, index) => <circle key={index} cx={(index * 8 / 79) * 600} cy={235 - value * 2.2} r={4 / zoom} fill="#eef3ff" />)}
            </g>
          </svg>
        </div>
        <div className="flex justify-between text-[9px] text-mist mt-2"><span>Wheel / pinch to zoom · drag to pan</span><span className="num">pan {Math.round(pan)}px</span></div>
      </div>
    </Asset>
  );
}

/* ---------- Magnetic particle field ---------- */

function MagneticField() {
  const { ref, point } = useDampedPointer({ stiffness: 130, damping: 22 });
  const [mode, setMode] = useState<"attract" | "repel">("attract");
  const particles = useMemo(() => Array.from({ length: 48 }, (_, index) => ({
    x: ((index * 47) % 101) / 100,
    y: ((index * 73 + 11) % 101) / 100,
    size: 3 + (index % 5),
    color: ["#22d38a", "#3da5ff", "#ffc53d", "#9b6bff"][index % 4],
  })), []);
  return (
    <Asset code="LAB-09" title="Magnetic Particle Field" desc="Forty-eight particles react to a spring-smoothed cursor. Toggle attraction and repulsion to inspect force feedback." tags={["particles", "magnetic", "pointer"]}>
      <div ref={ref as React.MutableRefObject<HTMLDivElement>} className="relative h-80 rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-0 dotgrid opacity-25" />
        {particles.map((particle, index) => {
          const dx = point.x - particle.x;
          const dy = point.y - particle.y;
          const distance = Math.max(0.08, Math.hypot(dx, dy));
          const strength = Math.min(0.12, 0.012 / distance) * (mode === "attract" ? 1 : -1);
          return <span key={index} className="absolute rounded-full pointer-events-none" style={{ width: particle.size, height: particle.size, left: `${(particle.x + dx * strength) * 100}%`, top: `${(particle.y + dy * strength) * 100}%`, background: particle.color, boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`, transform: `scale(${1 + (1 - Math.min(1, distance)) * .8})`, transition: "left .1s linear, top .1s linear" }} />;
        })}
        <div className="absolute w-20 h-20 rounded-full border border-sky/35 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, background: "radial-gradient(circle,rgba(61,165,255,.15),transparent 70%)" }} />
        <div className="absolute left-3 top-3 flex gap-2">{(["attract", "repel"] as const).map((value) => <button key={value} onClick={() => setMode(value)} className={cn("h-8 px-3 rounded-xl text-[9px] font-black uppercase border", mode === value ? "border-sky bg-sky/15 text-sky" : "border-white/10 text-mist")}>{value}</button>)}</div>
        <div className="absolute bottom-3 left-3 text-[9px] text-mist">Move pointer inside field · spring smoothing 130/22</div>
      </div>
    </Asset>
  );
}

/* ---------- Scroll velocity typography ---------- */

function VelocityTypography() {
  const velocity = useScrollVelocity();
  const intensity = clamp(Math.abs(velocity) / 22, 0, 1);
  return (
    <Asset code="LAB-10" title="Scroll Velocity Type" desc="The statement leans, widens and changes color based on actual page scroll velocity, then damps naturally back to rest." tags={["scroll velocity", "typography", "damping"]}>
      <div className="h-72 rounded-[24px] panel overflow-hidden grid place-items-center px-5 relative">
        <div className="absolute inset-0 dotgrid opacity-25" style={{ transform: `translateY(${velocity * 1.5}px)` }} />
        <div className="text-center relative">
          <div className="text-[9px] uppercase tracking-[.22em] font-black text-mist mb-4">Scroll the page quickly</div>
          <div className="text-3xl sm:text-5xl font-black leading-none transition-colors" style={{ transform: `skewX(${clamp(velocity, -12, 12)}deg) scaleX(${1 + intensity * .12})`, letterSpacing: `${intensity * .035}em`, color: velocity > 1 ? "#22d38a" : velocity < -1 ? "#ff4b6e" : "#eef3ff", textShadow: `0 0 ${intensity * 30}px ${velocity > 0 ? "#22d38a66" : "#ff4b6e66"}` }}>MOTION HAS MEANING</div>
          <div className="num text-[10px] text-mist mt-5">velocity {velocity.toFixed(2)} · intensity {Math.round(intensity * 100)}%</div>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Physics timing mini-game ---------- */

function TimingDropGame() {
  const [running, setRunning] = useState(false);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [burst, setBurst] = useState(0);
  const speed = 32 + round * 6;

  useRafLoop((_, delta) => {
    if (!running) return;
    setPosition((value) => {
      let next = value + direction * speed * delta;
      if (next >= 100) { next = 100; setDirection(-1); }
      if (next <= 0) { next = 0; setDirection(1); }
      return next;
    });
  }, running);

  const drop = () => {
    if (!running) {
      setScore(null);
      setRunning(true);
      return;
    }
    setRunning(false);
    const distance = Math.abs(position - 50);
    const result = Math.round(Math.max(0, 100 - distance * 4));
    setScore(result);
    if (result > 85) { setBurst((value) => value + 1); setRound((value) => value + 1); }
  };

  return (
    <Asset code="LAB-11" title="Timing Drop" desc="A real RAF-driven timing game: stop the moving market marker inside the liquidity pocket. Speed increases after high-accuracy hits." tags={["mini-game", "physics", "timing"]}>
      <div className="relative h-72 rounded-[24px] panel overflow-hidden p-5">
        <Confetti burst={burst} count={24} />
        <div className="flex justify-between"><span className="text-[9px] uppercase tracking-widest font-black text-mist">Liquidity timing</span><span className="num text-[9px] font-black text-gold">ROUND {round}</span></div>
        <div className="relative h-20 mt-14 well rounded-2xl overflow-hidden">
          <div className="absolute top-0 bottom-0 left-[43%] w-[14%] bg-bull/18 border-x border-bull/45" />
          <div className="absolute top-0 bottom-0 left-[48%] w-[4%] bg-bull/35" />
          <div className="absolute top-2 bottom-2 w-4 rounded-lg bg-gradient-to-b from-gold to-flame shadow-[0_0_18px_#ffc53d] -translate-x-1/2" style={{ left: `${position}%` }} />
          <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 num text-[7px] text-mist"><span>SELL WALL</span><span>LIQUIDITY</span><span>BREAKOUT</span></div>
        </div>
        {score !== null && <div key={`${score}-${round}`} className={cn("text-center mt-3 anim-score-pop", score > 85 ? "text-bull" : score > 55 ? "text-gold" : "text-bear")}><span className="num text-2xl font-black">{score}%</span><span className="text-[9px] font-black uppercase ml-2">{score > 85 ? "Perfect fill" : score > 55 ? "Partial fill" : "Missed pocket"}</span></div>}
        <button onClick={drop} className={cn("absolute bottom-4 left-5 right-5 h-12 rounded-2xl font-black uppercase text-xs transition-all", running ? "bg-gold text-ink-900 shadow-[0_5px_0_#b07600] active:translate-y-1 active:shadow-none" : "bg-bull text-ink-900 shadow-[0_5px_0_#0b7a4a]")}>{running ? "Drop order" : score === null ? "Start marker" : "Play again"}</button>
      </div>
    </Asset>
  );
}

export default function GameplayLab() {
  return (
    <Section id="gameplay-lab" index="02" title="Gameplay Lab" subtitle="Every major carousel and gesture family tested inside a coherent market-learning world: vertical reels, loops, decks, galleries, comparison, pinch, particles and timing play.">
      <CinematicScrollChapter />
      <StoryReels />
      <InfiniteLoopCarousel />
      <StackedDeckCarousel />
      <ThumbnailGallery />
      <BeforeAfterSlider />
      <TimelineScrubber />
      <PinchZoomChart />
      <MagneticField />
      <VelocityTypography />
      <TimingDropGame />
    </Section>
  );
}