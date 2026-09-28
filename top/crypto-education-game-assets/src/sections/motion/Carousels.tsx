import { useEffect, useRef, useState } from "react";
import { Asset, Btn, Chip, Phone } from "../../components/ui";
import { FlameIcon, Icon, TrophyIcon } from "../../components/icons";
import { fx } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, ease, lerp, tween, useDrag, useInterval, useRaf, useScrollFrame } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-01 · SNAP CAROUSEL — scroll-snap + 3D falloff + mouse drag momentum
 * ===================================================================== */
const COURSES = [
  { t: "Candlesticks 101", l: 12, xp: 450, c1: "#3e8bff", c2: "#9170ff", i: "candle", tag: "Beginner" },
  { t: "Risk Management", l: 9, xp: 380, c1: "#22d39a", c2: "#0e9e70", i: "shield", tag: "Essential" },
  { t: "DeFi Deep Dive", l: 14, xp: 620, c1: "#9170ff", c2: "#ff4d6d", i: "layers", tag: "Advanced" },
  { t: "On-chain Analysis", l: 10, xp: 520, c1: "#2fd4ff", c2: "#3e8bff", i: "search", tag: "Pro" },
  { t: "Trading Psychology", l: 8, xp: 300, c1: "#ff7a2f", c2: "#ffc23d", i: "brain", tag: "Mindset" },
  { t: "Options Basics", l: 11, xp: 480, c1: "#ff4d6d", c2: "#9170ff", i: "swap", tag: "Advanced" },
  { t: "Macro & Crypto", l: 7, xp: 260, c1: "#ffc23d", c2: "#22d39a", i: "pie", tag: "Context" },
];

function SnapCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lastActive = useRef(0);
  const raf = useRef(0);
  const drag = useRef({ down: false, x: 0, sl: 0, moved: false, v: 0, lx: 0, lt: 0 });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const c = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    Array.from(el.children).forEach((ch, i) => {
      const n = ch as HTMLElement;
      const d = (n.offsetLeft + n.offsetWidth / 2 - c) / n.offsetWidth;
      const ad = Math.min(1.6, Math.abs(d));
      const inner = n.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.transform = `perspective(900px) rotateY(${clamp(-d * 24, -32, 32)}deg) scale(${1 - ad * 0.13})`;
        inner.style.opacity = String(1 - ad * 0.42);
      }
      if (Math.abs(d) < bd) {
        bd = Math.abs(d);
        best = i;
      }
    });
    if (best !== lastActive.current) {
      lastActive.current = best;
      setActive(best);
      sfx("tick");
    }
  };
  useEffect(() => {
    update();
    const el = ref.current;
    if (el) {
      const first = el.children[1] as HTMLElement | undefined;
      if (first) el.scrollLeft = first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = (i: number) => {
    const el = ref.current;
    const ch = el?.children[clamp(i, 0, COURSES.length - 1)] as HTMLElement | undefined;
    if (!el || !ch) return;
    el.scrollTo({ left: ch.offsetLeft - (el.clientWidth - ch.offsetWidth) / 2, behavior: "smooth" });
  };
  const nearest = () => {
    const el = ref.current;
    if (!el) return 0;
    const c = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    Array.from(el.children).forEach((ch, i) => {
      const n = ch as HTMLElement;
      const d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - c);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  return (
    <Asset title="Snap Carousel · 3D Falloff" code="M-01" tags="carousel snap scroll horizontal cards 3d perspective drag momentum dots arrows" span={8}>
      <div className="relative">
        <div
          ref={ref}
          onScroll={() => {
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(update);
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || !ref.current) return;
            drag.current = { down: true, x: e.clientX, sl: ref.current.scrollLeft, moved: false, v: 0, lx: e.clientX, lt: performance.now() };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            const el = ref.current;
            if (!d.down || !el) return;
            const dx = e.clientX - d.x;
            if (!d.moved && Math.abs(dx) > 5) {
              d.moved = true;
              el.style.scrollSnapType = "none";
              el.setPointerCapture(e.pointerId);
            }
            if (d.moved) {
              el.scrollLeft = d.sl - dx;
              const now = performance.now();
              d.v = (e.clientX - d.lx) / Math.max(1, now - d.lt);
              d.lx = e.clientX;
              d.lt = now;
            }
          }}
          onPointerUp={() => {
            const d = drag.current;
            const el = ref.current;
            if (!d.down || !el) return;
            d.down = false;
            if (!d.moved) return;
            const idx = clamp(nearest() - Math.round(d.v * 2.2), 0, COURSES.length - 1);
            go(idx);
            setTimeout(() => el && (el.style.scrollSnapType = ""), 500);
          }}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto py-6"
          style={{ paddingInline: "calc(50% - 120px)", cursor: "grab" }}
        >
          {COURSES.map((c, i) => (
            <div key={c.t} className="w-[240px] shrink-0 snap-center">
              <div className="will-change-transform" style={{ transition: "transform .08s linear" }}>
                <button onClick={() => go(i)} className={cn("block w-full overflow-hidden rounded-3xl text-left shadow-[0_8px_0_#081231,0_20px_40px_rgba(0,0,0,.45)] ring-1 ring-white/10 transition", active === i && "ring-2 ring-white/40")}>
                  <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}>
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-30">
                      <path d="M0 80 L30 60 L55 70 L85 35 L110 50 L140 20 L170 30 L200 10" stroke="#fff" strokeWidth="3" fill="none" />
                    </svg>
                    <span className="absolute left-3 top-3 rounded-lg bg-black/25 px-2 py-0.5 text-[10px] font-black uppercase text-white backdrop-blur">{c.tag}</span>
                    <Icon name={c.i} size={72} className="absolute -bottom-3 -right-2 text-white/80" stroke={2.4} />
                  </div>
                  <div className="bg-gradient-to-b from-ink-700 to-ink-800 p-4">
                    <div className="font-display text-sm font-black text-white">{c.t}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-ink-300">
                      <span>{c.l} lessons</span>
                      <span className="text-gold">+{c.xp} XP</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-950">
                      <div className="h-full rounded-full" style={{ width: `${(i * 23) % 90 + 5}%`, background: c.c1 }} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => go(active - 1)} className="btn3d v-ghost absolute left-1 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full [--depth:4px]">
          <Icon name="chevronLeft" size={18} stroke={3} />
        </button>
        <button onClick={() => go(active + 1)} className="btn3d v-ghost absolute right-1 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full [--depth:4px]">
          <Icon name="chevronRight" size={18} stroke={3} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {COURSES.map((c, i) => (
          <button key={c.t} onClick={() => go(i)} className="h-2.5 rounded-full transition-all duration-300" style={{ width: active === i ? 28 : 10, background: active === i ? c.c1 : "#27427d" }} />
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-02 · STORIES VIEWER — progress, tap zones, hold to pause, 3D cube swipe
 * ===================================================================== */
type Slide =
  | { type: "stat"; title: string; value: number; prefix?: string; suffix?: string; sub: string; color: string }
  | { type: "chart"; title: string; up: boolean }
  | { type: "quote"; text: string; by: string }
  | { type: "poll"; q: string; a: [string, string]; p: [number, number] };
const STORIES: { id: string; name: string; c: string; icon: string; slides: Slide[] }[] = [
  {
    id: "btc",
    name: "Bitcoin",
    c: "#f7931a",
    icon: "₿",
    slides: [
      { type: "stat", title: "BTC today", value: 64250, prefix: "$", sub: "+4.2% in 24h", color: "#22d39a" },
      { type: "chart", title: "Weekly trend", up: true },
      { type: "quote", text: "Halving in 212 days. Supply shock incoming?", by: "Market Desk" },
    ],
  },
  {
    id: "eth",
    name: "Ethereum",
    c: "#627eea",
    icon: "Ξ",
    slides: [
      { type: "stat", title: "Gas fees", value: 12, suffix: " gwei", sub: "Lowest in 6 months", color: "#2fd4ff" },
      { type: "poll", q: "ETH above $5k this year?", a: ["Yes 🚀", "No 🐻"], p: [68, 32] },
    ],
  },
  {
    id: "mkt",
    name: "Market",
    c: "#22d39a",
    icon: "📈",
    slides: [
      { type: "quote", text: "Fed holds rates steady. Risk assets rally into the close.", by: "Reuters" },
      { type: "chart", title: "Total market cap", up: false },
    ],
  },
  {
    id: "aca",
    name: "Academy",
    c: "#9170ff",
    icon: "🎓",
    slides: [
      { type: "stat", title: "Your streak", value: 47, suffix: " days", sub: "Top 3% of learners", color: "#ff7a2f" },
      { type: "quote", text: "Tip: never move your stop-loss further away.", by: "Toro" },
    ],
  },
];

function StatValue({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => tween(0, value, 1200, setV, ease.outQuart), [value]);
  return (
    <span>
      {prefix}
      {Math.round(v).toLocaleString()}
      {suffix}
    </span>
  );
}

function Poll({ s }: { s: Extract<Slide, { type: "poll" }> }) {
  const [voted, setVoted] = useState<number | null>(null);
  return (
    <div className="w-full space-y-2" onPointerDown={(e) => e.stopPropagation()}>
      <div className="mb-3 text-center font-display text-lg font-black text-white">{s.q}</div>
      {s.a.map((a, i) => (
        <button
          key={a}
          onClick={() => {
            setVoted(i);
            sfx("pop");
          }}
          className="relative block h-12 w-full overflow-hidden rounded-2xl bg-white/15 text-left backdrop-blur"
        >
          <span className="absolute inset-y-0 left-0 rounded-2xl bg-white/35 transition-all duration-700 ease-out" style={{ width: voted === null ? 0 : `${s.p[i]}%` }} />
          <span className="relative flex h-full items-center justify-between px-4 text-sm font-black text-white">
            {a}
            {voted !== null && <span>{s.p[i]}%</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function StoryFace({ story, si, p, active }: { story: (typeof STORIES)[number]; si: number; p: number; active: boolean }) {
  const s = story.slides[Math.min(si, story.slides.length - 1)];
  return (
    <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]" style={{ background: `radial-gradient(120% 80% at 20% 0%, ${story.c}, #0a1330 70%)` }}>
      <div className="absolute inset-x-3 top-11 flex gap-1">
        {story.slides.map((_, i) => (
          <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-white" style={{ width: `${i < si ? 100 : i === si && active ? p * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 top-[58px] flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white ring-2 ring-white/60" style={{ background: story.c }}>
          {story.icon}
        </span>
        <span className="text-xs font-black text-white">{story.name}</span>
        <span className="text-[10px] font-bold text-white/60">2h</span>
      </div>
      <div key={`${story.id}-${si}`} className="absolute inset-x-5 bottom-20 top-28 flex flex-col items-center justify-center text-center">
        {s.type === "stat" && (
          <div className="anim-pop">
            <div className="text-xs font-black uppercase tracking-widest text-white/70">{s.title}</div>
            <div className="mt-2 font-display text-4xl font-black text-white">
              <StatValue value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <div className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-black" style={{ background: `${s.color}33`, color: s.color }}>
              {s.sub}
            </div>
          </div>
        )}
        {s.type === "chart" && (
          <div className="w-full">
            <div className="mb-3 text-xs font-black uppercase tracking-widest text-white/70">{s.title}</div>
            <svg viewBox="0 0 200 110" className="w-full">
              <path
                d={s.up ? "M0 95 L25 80 L45 86 L70 60 L95 66 L120 40 L145 48 L170 22 L200 12" : "M0 20 L25 30 L45 26 L70 50 L95 44 L120 70 L145 64 L170 88 L200 98"}
                stroke={s.up ? "#22d39a" : "#ff4d6d"}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="400"
                strokeDashoffset="400"
                style={{ animation: "dash 1.6s .2s ease-out forwards" }}
              />
            </svg>
            <div className={cn("mt-2 font-display text-2xl font-black", s.up ? "text-bull" : "text-bear")}>{s.up ? "+12.4%" : "−6.8%"}</div>
          </div>
        )}
        {s.type === "quote" && (
          <div className="anim-slide-up">
            <div className="font-display text-5xl text-white/30">“</div>
            <div className="font-display text-lg font-bold leading-snug text-white">{s.text}</div>
            <div className="mt-3 text-xs font-black text-white/60">— {s.by}</div>
          </div>
        )}
        {s.type === "poll" && <Poll s={s} />}
      </div>
      <div className="absolute inset-x-3 bottom-6 flex items-center gap-2">
        <div className="flex-1 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold text-white/60">Send message…</div>
        <span className="text-xl">❤️</span>
      </div>
    </div>
  );
}

function StoriesViewer() {
  const [open, setOpen] = useState(true);
  const [gi, setGi] = useState(0);
  const [si, setSi] = useState(0);
  const [p, setP] = useState(0);
  const [paused, setPaused] = useState(false);
  const [angle, setAngle] = useState(0);
  const [anim, setAnim] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const pRef = useRef(0);
  const dragging = useRef(false);
  const hold = useRef(0);
  const wasPaused = useRef(false);
  const W = 280;
  const DUR = 4200;
  const story = STORIES[gi];

  const cubeTo = (dir: 1 | -1, silent = false) => {
    const target = gi + dir;
    if (target < 0 || target >= STORIES.length) {
      if (dir === 1) setOpen(false);
      return;
    }
    setAnim(true);
    setAngle(-90 * dir);
    if (!silent) sfx("whoosh");
    setTimeout(() => {
      setAnim(false);
      setGi(target);
      setSi(0);
      pRef.current = 0;
      setP(0);
      setAngle(0);
    }, 460);
  };
  const next = (auto = false) => {
    setSeen((s) => (s.includes(story.id) ? s : [...s, story.id]));
    if (si < story.slides.length - 1) {
      setSi(si + 1);
      pRef.current = 0;
      if (!auto) sfx("tap");
    } else cubeTo(1, auto);
  };
  const prev = () => {
    if (si > 0) {
      setSi(si - 1);
      pRef.current = 0;
      sfx("tap");
    } else cubeTo(-1);
  };
  useRaf((dt) => {
    if (!open || paused || anim || dragging.current) return;
    pRef.current += (dt * 1000) / DUR;
    if (pRef.current >= 1) {
      pRef.current = 0;
      next(true);
    }
    setP(pRef.current);
  }, open);

  const bind = useDrag((s) => {
    if (anim) return;
    if (s.first) {
      wasPaused.current = false;
      hold.current = window.setTimeout(() => {
        setPaused(true);
        wasPaused.current = true;
      }, 200);
      return;
    }
    if (!s.last) {
      if (s.moved) {
        clearTimeout(hold.current);
        dragging.current = true;
        const minA = gi === STORIES.length - 1 ? -12 : -90;
        const maxA = gi === 0 ? 12 : 90;
        setAngle(clamp((s.dx / W) * 90, minA, maxA));
      }
      return;
    }
    clearTimeout(hold.current);
    dragging.current = false;
    setPaused(false);
    if (s.moved) {
      if (s.dy > 110 && Math.abs(s.dx) < 60) {
        setAngle(0);
        setOpen(false);
        return;
      }
      if ((s.dx < -W * 0.25 || s.vx < -0.6) && gi < STORIES.length - 1) return cubeTo(1);
      if ((s.dx > W * 0.25 || s.vx > 0.6) && gi > 0) return cubeTo(-1);
      setAnim(true);
      setAngle(0);
      setTimeout(() => setAnim(false), 460);
      return;
    }
    if (wasPaused.current) return;
    const r = s.target.getBoundingClientRect();
    if (s.x - r.left < r.width / 3) prev();
    else next();
  });

  return (
    <Asset title="Stories Viewer" code="M-02" tags="stories instagram carousel progress tap hold pause swipe cube 3d mobile" span={4}>
      <Phone width={300} height={560}>
        {open ? (
          <div className="absolute inset-0 select-none" style={{ perspective: 1000, touchAction: "none" }} {...bind}>
            <div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{ transform: `translateZ(-${W / 2}px) rotateY(${angle}deg)`, transition: anim ? "transform .45s cubic-bezier(.4,.1,.2,1)" : "none" }}
            >
              {gi > 0 && (
                <div className="absolute inset-0" style={{ transform: `rotateY(-90deg) translateZ(${W / 2}px)` }}>
                  <StoryFace story={STORIES[gi - 1]} si={0} p={0} active={false} />
                </div>
              )}
              <div className="absolute inset-0" style={{ transform: `translateZ(${W / 2}px)` }}>
                <StoryFace story={story} si={si} p={p} active />
              </div>
              {gi < STORIES.length - 1 && (
                <div className="absolute inset-0" style={{ transform: `rotateY(90deg) translateZ(${W / 2}px)` }}>
                  <StoryFace story={STORIES[gi + 1]} si={0} p={0} active={false} />
                </div>
              )}
            </div>
            {paused && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 text-4xl text-white/80">❚❚</div>}
          </div>
        ) : (
          <div className="absolute inset-0 bg-ink-900 px-4 pt-14">
            <div className="font-display text-lg font-black text-white">Stories</div>
            <div className="mt-4 flex gap-3">
              {STORIES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setGi(i);
                    setSi(0);
                    pRef.current = 0;
                    setOpen(true);
                    sfx("pop");
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className={cn("rounded-full p-[3px]", seen.includes(s.id) ? "bg-ink-600" : "aurora-ring")}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink-900 text-lg font-black text-white" style={{ background: s.c }}>
                      {s.icon}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-ink-300">{s.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          </div>
        )}
      </Phone>
      <div className="mt-3 text-center text-[11px] font-bold text-ink-500">Tap sides · hold to pause · swipe for cube · swipe ↓ to close</div>
    </Asset>
  );
}

/* =====================================================================
 * M-03 · 3D COVERFLOW — drag with velocity, keyboard, autoplay, reflection
 * ===================================================================== */
const FLOW = [
  { s: "BTC", n: "Bitcoin", c: "#f7931a", p: "$64,250", ch: 4.2 },
  { s: "ETH", n: "Ethereum", c: "#627eea", p: "$3,420", ch: 2.1 },
  { s: "SOL", n: "Solana", c: "#14f195", p: "$148.20", ch: 9.4 },
  { s: "BNB", n: "BNB", c: "#f3ba2f", p: "$592.40", ch: -0.8 },
  { s: "XRP", n: "XRP", c: "#9ca3af", p: "$0.52", ch: -2.3 },
  { s: "ADA", n: "Cardano", c: "#3468d1", p: "$0.45", ch: 1.2 },
  { s: "DOGE", n: "Dogecoin", c: "#c2a633", p: "$0.158", ch: 12.8 },
];

function Coverflow() {
  const N = FLOW.length;
  const [pos, setPos] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [auto, setAuto] = useState(false);
  const start = useRef(0);
  const lastIdx = useRef(3);
  const setP = (v: number) => {
    setPos(v);
    const idx = Math.round(v);
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      sfx("tick");
    }
  };
  const bind = useDrag((s) => {
    if (s.first) {
      start.current = pos;
      setDragging(true);
      return;
    }
    if (!s.last) {
      if (s.moved) setP(clamp(start.current - s.dx / 120, -0.45, N - 0.55));
      return;
    }
    setDragging(false);
    if (s.moved) setP(clamp(Math.round(start.current - s.dx / 120 - s.vx * 2.4), 0, N - 1));
  });
  useInterval(() => setP((Math.round(pos) + 1) % N), auto ? 2200 : null);
  const active = Math.round(pos);
  return (
    <Asset title="3D Coverflow" code="M-03" tags="coverflow carousel 3d perspective drag swipe reflection autoplay keyboard" span={7}>
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setP(clamp(active + 1, 0, N - 1));
          if (e.key === "ArrowLeft") setP(clamp(active - 1, 0, N - 1));
        }}
        className="relative h-[310px] select-none overflow-hidden rounded-2xl outline-none"
        style={{ perspective: 1100, touchAction: "pan-y" }}
        {...bind}
      >
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950/60 to-transparent" />
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {FLOW.map((c, i) => {
            const rel = i - pos;
            const a = Math.abs(rel);
            return (
              <button
                key={c.s}
                onClick={() => setP(i)}
                className="absolute left-1/2 top-[38%] -ml-[85px] -mt-[105px] h-[210px] w-[170px] rounded-3xl text-left"
                style={{
                  transform: `translateX(${rel * 105}px) translateZ(${-a * 150}px) rotateY(${clamp(-rel * 48, -62, 62)}deg)`,
                  zIndex: 100 - Math.round(a * 10),
                  opacity: a > 3.4 ? 0 : 1 - a * 0.12,
                  transition: dragging ? "none" : "transform .6s cubic-bezier(.2,.9,.3,1), opacity .6s",
                  WebkitBoxReflect: "below 8px linear-gradient(transparent 62%, rgba(255,255,255,.22))",
                }}
              >
                <div className="relative h-full overflow-hidden rounded-3xl p-4 ring-1 ring-white/15" style={{ background: `linear-gradient(160deg, ${c.c}, color-mix(in srgb, ${c.c} 30%, #0a1330))` }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 font-display text-sm font-black text-white backdrop-blur">{c.s}</div>
                  <div className="mt-4 font-display text-base font-black text-white">{c.n}</div>
                  <div className="font-mono text-lg font-bold text-white">{c.p}</div>
                  <div className={cn("mt-1 inline-block rounded-md px-1.5 text-[11px] font-black", c.ch >= 0 ? "bg-bull/30 text-white" : "bg-bear/40 text-white")}>
                    {c.ch >= 0 ? "▲" : "▼"} {Math.abs(c.ch)}%
                  </div>
                  <svg viewBox="0 0 100 30" className="absolute inset-x-0 bottom-0 h-12 w-full opacity-60">
                    <path d={c.ch >= 0 ? "M0 26 L20 20 L35 22 L55 12 L75 14 L100 4" : "M0 6 L20 10 L35 8 L55 18 L75 16 L100 26"} stroke="#fff" strokeWidth="2" fill="none" />
                  </svg>
                  {i === active && <span className="sheen absolute inset-0 rounded-3xl" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn variant="ghost" size="iconSm" onClick={() => setP(clamp(active - 1, 0, N - 1))}>
          <Icon name="chevronLeft" size={16} stroke={3} />
        </Btn>
        <div className="flex flex-1 justify-center gap-1.5">
          {FLOW.map((c, i) => (
            <span key={c.s} className="h-1.5 rounded-full transition-all" style={{ width: i === active ? 22 : 8, background: i === active ? c.c : "#27427d" }} />
          ))}
        </div>
        <Btn variant="ghost" size="iconSm" onClick={() => setP(clamp(active + 1, 0, N - 1))}>
          <Icon name="chevronRight" size={16} stroke={3} />
        </Btn>
        <Btn variant={auto ? "azure" : "ghost"} size="sm" onClick={() => setAuto((a) => !a)}>
          {auto ? "❚❚ Auto" : "▶ Auto"}
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-04 · CARD STACK CYCLE — swipe the top card to the back of the deck
 * ===================================================================== */
const TIPS = [
  { t: "Cut losers early", d: "Small losses are tuition. Big losses are disasters.", c1: "#ff4d6d", c2: "#9170ff", e: "✂️" },
  { t: "Let winners run", d: "Trail your stop instead of taking profit too soon.", c1: "#22d39a", c2: "#2fd4ff", e: "🏃" },
  { t: "Size by risk", d: "Risk 1–2% per trade, not a random amount.", c1: "#3e8bff", c2: "#9170ff", e: "⚖️" },
  { t: "Journal everything", d: "Your past trades are your best teacher.", c1: "#ffc23d", c2: "#ff7a2f", e: "📓" },
  { t: "Avoid revenge trades", d: "After a loss, step away. The market will be there.", c1: "#9170ff", c2: "#ff4d6d", e: "🧘" },
];

function CardStack() {
  const [order, setOrder] = useState(TIPS.map((_, i) => i));
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<{ id: number; dir: number } | null>(null);
  const cycle = (dir: number) => {
    const top = order[0];
    setLeaving({ id: top, dir });
    sfx("swipe");
    setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setLeaving(null);
      setX(0);
    }, 280);
  };
  const bind = useDrag(
    (s) => {
      if (leaving) return;
      if (s.first) return setDragging(true);
      if (!s.last) return setX(s.dx);
      setDragging(false);
      if (Math.abs(s.dx) > 90 || Math.abs(s.vx) > 0.6) cycle(s.dx > 0 ? 1 : -1);
      else setX(0);
    },
    { capture: "immediate" },
  );
  return (
    <Asset title="Card Stack Cycle" code="M-04" tags="card stack deck cycle swipe carousel infinite tips" span={5}>
      <div className="relative mx-auto h-[300px] max-w-[300px] select-none">
        {order
          .map((id, d) => ({ id, d }))
          .reverse()
          .map(({ id, d }) => {
            const t = TIPS[id];
            const isTop = d === 0;
            const isLeaving = leaving?.id === id;
            const transform = isLeaving
              ? `translate(${leaving!.dir * 380}px, -20px) rotate(${leaving!.dir * 24}deg)`
              : isTop
                ? `translate(${x}px, 0) rotate(${x * 0.06}deg)`
                : `translateY(${-d * 16}px) scale(${1 - d * 0.06})`;
            return (
              <div
                key={id}
                {...(isTop ? bind : {})}
                className={cn("absolute inset-x-0 bottom-4 h-[240px] rounded-3xl p-5 shadow-[0_8px_0_#081231,0_18px_36px_rgba(0,0,0,.45)] ring-1 ring-white/15", isTop && "cursor-grab active:cursor-grabbing")}
                style={{
                  background: `linear-gradient(150deg, ${t.c1}, ${t.c2})`,
                  transform,
                  zIndex: isLeaving ? 50 : 20 - d,
                  opacity: d > 3 ? 0 : 1,
                  transition: dragging && isTop ? "none" : isLeaving ? "transform .28s ease-in" : "transform .5s cubic-bezier(.3,1.35,.5,1), opacity .3s",
                  touchAction: "none",
                }}
              >
                <div className="text-4xl">{t.e}</div>
                <div className="mt-4 font-display text-xl font-black text-white">{t.t}</div>
                <div className="mt-2 text-sm font-semibold text-white/85">{t.d}</div>
                <div className="absolute bottom-4 left-5 text-[10px] font-black uppercase tracking-widest text-white/60">Tip {id + 1}/{TIPS.length}</div>
              </div>
            );
          })}
      </div>
      <div className="flex justify-center gap-3">
        <Btn variant="ghost" size="sm" onClick={() => cycle(-1)}>
          <Icon name="chevronLeft" size={14} stroke={3} /> Swipe
        </Btn>
        <Btn variant="azure" size="sm" onClick={() => cycle(1)}>
          Next <Icon name="chevronRight" size={14} stroke={3} />
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-05 · AUTOPLAY HERO — progress tabs, Ken Burns, staggered text, swipe
 * ===================================================================== */
const HERO = [
  { t: "Learn to trade in 5 min a day", d: "Bite-sized lessons that actually stick.", c1: "#3e8bff", c2: "#9170ff", i: "chart", cta: "Start learning" },
  { t: "Compete in weekly leagues", d: "Climb from Bronze to Elite and win gems.", c1: "#ffc23d", c2: "#ff7a2f", i: "trophy", cta: "View league" },
  { t: "Practice with $100k paper money", d: "Real prices. Zero risk. Full confidence.", c1: "#22d39a", c2: "#2fd4ff", i: "wallet", cta: "Open simulator" },
  { t: "Master risk before you risk it", d: "Stop-losses, sizing and psychology.", c1: "#ff4d6d", c2: "#9170ff", i: "shield", cta: "Risk course" },
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const [hover, setHover] = useState(false);
  const pRef = useRef(0);
  const DUR = 5200;
  const go = (n: number, silent = false) => {
    setI(((n % HERO.length) + HERO.length) % HERO.length);
    pRef.current = 0;
    setP(0);
    if (!silent) sfx("swipe");
  };
  useRaf((dt) => {
    if (hover) return;
    pRef.current += (dt * 1000) / DUR;
    if (pRef.current >= 1) go(i + 1, true);
    else setP(pRef.current);
  });
  const bind = useDrag((s) => {
    if (s.last && s.moved) {
      if (s.dx < -50) go(i + 1);
      else if (s.dx > 50) go(i - 1);
    }
  });
  return (
    <Asset title="Autoplay Hero Carousel" code="M-05" tags="hero carousel autoplay progress ken burns slideshow swipe banner" span={8}>
      <div className="relative h-[300px] select-none overflow-hidden rounded-3xl" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} style={{ touchAction: "pan-y" }} {...bind}>
        {HERO.map((h, k) => (
          <div key={h.t} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: k === i ? 1 : 0, zIndex: k === i ? 2 : 1 }}>
            <div key={k === i ? `on${i}` : "off"} className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${h.c1}, ${h.c2})`, animation: k === i ? `ken-burns ${DUR}ms linear forwards` : undefined }}>
              <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-25">
                <circle cx="330" cy="40" r="90" fill="#fff" opacity=".25" />
                <circle cx="60" cy="210" r="120" fill="#000" opacity=".2" />
                <path d="M0 170 L60 140 L110 150 L170 100 L220 115 L280 60 L330 75 L400 30" stroke="#fff" strokeWidth="4" fill="none" />
              </svg>
              <Icon name={h.i} size={170} stroke={1.6} className="absolute -right-6 bottom-[-20px] text-white/35" />
            </div>
            {k === i && (
              <div className="relative z-10 flex h-full flex-col justify-center p-7 sm:p-10">
                <span className="anim-slide-up inline-block w-fit rounded-lg bg-black/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                  {k + 1} / {HERO.length}
                </span>
                <h3 className="mt-3 max-w-md font-display text-2xl font-black leading-tight text-white sm:text-3xl" style={{ animation: "slide-up .6s .1s both" }}>
                  {h.t}
                </h3>
                <p className="mt-2 max-w-sm text-sm font-bold text-white/85" style={{ animation: "slide-up .6s .22s both" }}>
                  {h.d}
                </p>
                <div className="mt-5" style={{ animation: "slide-up .6s .34s both" }}>
                  <Btn variant="light" size="sm">
                    {h.cta} <Icon name="chevronRight" size={14} stroke={3} />
                  </Btn>
                </div>
              </div>
            )}
          </div>
        ))}
        {hover && <span className="absolute right-4 top-4 z-20 rounded-lg bg-black/30 px-2 py-1 text-[10px] font-black text-white backdrop-blur">❚❚ Paused</span>}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {HERO.map((h, k) => (
          <button key={h.t} onClick={() => go(k)} className="group text-left">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
              <div className="h-full rounded-full" style={{ width: `${k < i ? 100 : k === i ? p * 100 : 0}%`, background: h.c1 }} />
            </div>
            <div className={cn("mt-1.5 truncate text-[11px] font-bold transition", k === i ? "text-white" : "text-ink-500 group-hover:text-ink-300")}>{h.t}</div>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-06 · ONBOARDING PAGER — swipe pages with multi-layer parallax
 * ===================================================================== */
const PAGES = [
  { t: "Learn by playing", d: "Bite-sized lessons that feel like a game.", c1: "#3e8bff", c2: "#9170ff", icon: "book", e: ["🎮", "⭐", "📚"] },
  { t: "Trade risk-free", d: "Practice with $100k of paper money.", c1: "#22d39a", c2: "#0e7fa8", icon: "chart", e: ["📈", "💰", "🪙"] },
  { t: "Compete & climb", d: "Weekly leagues with real rewards.", c1: "#ffc23d", c2: "#ff7a2f", icon: "trophy", e: ["🏆", "🥇", "💎"] },
  { t: "Build the habit", d: "Streaks keep you consistent every day.", c1: "#ff4d6d", c2: "#9170ff", icon: "bolt", e: ["🔥", "⚡", "📅"] },
];

function Onboarding() {
  const W = 280;
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  const btnRef = useRef<HTMLDivElement>(null);
  const last = PAGES.length - 1;
  const bind = useDrag((s) => {
    if (s.first) {
      start.current = pos;
      setDragging(true);
      return;
    }
    if (!s.last) {
      let v = start.current - s.dx / W;
      if (v < 0) v = v * 0.3;
      if (v > last) v = last + (v - last) * 0.3;
      setPos(v);
      return;
    }
    setDragging(false);
    const t = clamp(Math.round(start.current - s.dx / W - s.vx * 0.6), 0, last);
    if (t !== Math.round(start.current)) sfx("swipe");
    setPos(t);
  });
  const bgIndex = clamp(pos, 0, last);
  return (
    <Asset title="Onboarding Pager" code="M-06" tags="onboarding pager swipe pages parallax layers dots intro walkthrough mobile" span={4}>
      <Phone width={300} height={560}>
        <div className="absolute inset-0 select-none overflow-hidden" style={{ touchAction: "pan-y" }} {...bind}>
          {PAGES.map((pg, i) => (
            <div key={`bg${i}`} className="absolute inset-0" style={{ background: `linear-gradient(170deg, ${pg.c1}, ${pg.c2})`, opacity: clamp(1 - Math.abs(i - bgIndex), 0, 1) }} />
          ))}
          {PAGES.map((pg, i) => {
            const rel = i - pos;
            return (
              <div key={pg.t} className="absolute inset-0" style={{ transform: `translateX(${rel * W}px)`, transition: dragging ? "none" : "transform .55s cubic-bezier(.2,.9,.25,1.05)" }}>
                <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2">
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-[2px]" style={{ transform: `translateX(${rel * W * -0.35}px) scale(${1 - Math.min(1, Math.abs(rel)) * 0.3})`, transition: dragging ? "none" : "transform .55s cubic-bezier(.2,.9,.25,1.05)" }} />
                  <div className="absolute inset-6 flex items-center justify-center rounded-[40px] bg-white/90 shadow-[0_12px_0_rgba(0,0,0,.15)]" style={{ transform: `translateX(${rel * W * 0.25}px) rotate(${rel * -18}deg)`, transition: dragging ? "none" : "transform .55s cubic-bezier(.2,.9,.25,1.05)" }}>
                    <Icon name={pg.icon} size={84} stroke={2.4} style={{ color: pg.c1 }} />
                  </div>
                  {pg.e.map((em, k) => (
                    <span
                      key={k}
                      className="absolute text-3xl"
                      style={{
                        left: ["-6%", "78%", "70%"][k],
                        top: ["8%", "0%", "78%"][k],
                        transform: `translateX(${rel * W * (0.7 + k * 0.35)}px)`,
                        transition: dragging ? "none" : "transform .55s cubic-bezier(.2,.9,.25,1.05)",
                        animation: `float ${2.6 + k * 0.5}s ${k * 0.3}s ease-in-out infinite`,
                      }}
                    >
                      {em}
                    </span>
                  ))}
                </div>
                <div className="absolute inset-x-6 top-[350px] text-center" style={{ transform: `translateX(${rel * W * 0.4}px)`, opacity: 1 - Math.min(1, Math.abs(rel)) * 0.9, transition: dragging ? "none" : "all .55s cubic-bezier(.2,.9,.25,1.05)" }}>
                  <div className="font-display text-2xl font-black text-white">{pg.t}</div>
                  <div className="mt-2 text-sm font-bold text-white/85">{pg.d}</div>
                </div>
              </div>
            );
          })}
          <div className="absolute inset-x-6 bottom-16 flex items-center justify-center gap-2">
            {PAGES.map((_, i) => {
              const k = Math.max(0, 1 - Math.abs(i - pos));
              return <span key={i} className="h-2 rounded-full bg-white" style={{ width: 8 + 20 * k, opacity: 0.4 + 0.6 * k }} />;
            })}
          </div>
          <div ref={btnRef} className="absolute inset-x-5 bottom-5 flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
            {Math.round(pos) < last ? (
              <>
                <button onClick={() => setPos(last)} className="px-3 py-2 text-xs font-black uppercase text-white/80">
                  Skip
                </button>
                <button onClick={() => { setPos(clamp(Math.round(pos) + 1, 0, last)); sfx("swipe"); }} className="btn3d v-light ml-auto h-10 rounded-xl px-5 text-xs [--depth:4px]">
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  fx.burst(btnRef.current, { count: 40, spread: 160 });
                  sfx("levelup");
                  setTimeout(() => setPos(0), 1200);
                }}
                className="btn3d v-light h-11 w-full rounded-xl text-xs [--depth:4px]"
              >
                Get started 🚀
              </button>
            )}
          </div>
        </div>
      </Phone>
    </Asset>
  );
}

/* =====================================================================
 * M-07 · SCROLL-VELOCITY MARQUEE — speed, direction & skew react to scroll
 * ===================================================================== */
const TAPE_A = ["BTC ▲ 4.2%", "ETH ▲ 2.1%", "SOL ▲ 9.4%", "BNB ▼ 0.8%", "XRP ▼ 2.3%", "ADA ▲ 1.2%", "DOGE ▲ 12.8%", "AVAX ▲ 3.3%"];
const TAPE_B = ["HODL", "DCA", "FOMO", "ATH", "REKT", "WAGMI", "DYOR", "GM", "LFG", "NGMI"];

function VelocityMarquee() {
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, v: 0, tv: 0, dir: 1, drag: 0 });
  const [speed, setSpeed] = useState(0);
  useScrollFrame((i) => {
    st.current.tv = i.v;
  });
  useRaf((dt) => {
    const s = st.current;
    s.v = lerp(s.v, s.tv, 0.08);
    if (Math.abs(s.v) > 0.5) s.dir = s.v > 0 ? 1 : -1;
    const spd = 60 + Math.abs(s.v) * 28;
    s.x += dt * spd * s.dir + s.drag;
    s.drag *= 0.9;
    const skew = clamp(-s.v * 0.6, -14, 14);
    [rowA.current, rowB.current].forEach((row, k) => {
      if (!row) return;
      const w = row.scrollWidth / 2;
      const off = (((k ? -s.x : s.x) % w) + w) % w;
      row.style.transform = `translate3d(${-off}px,0,0) skewX(${skew}deg)`;
    });
    setSpeed((prev) => (Math.abs(prev - spd) > 4 ? spd : prev));
  });
  const bind = useDrag((s) => {
    if (!s.first && !s.last) st.current.drag = -s.vx * 16;
  });
  return (
    <Asset title="Scroll-Velocity Marquee" code="M-07" tags="marquee ticker scroll velocity reactive skew infinite loop drag" span={12} bodyClass="px-0">
      <div className="space-y-3 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]" style={{ touchAction: "pan-y" }} {...bind}>
        <div ref={rowA} className="flex w-max gap-3 will-change-transform">
          {[...TAPE_A, ...TAPE_A].map((t, i) => (
            <span key={i} className={cn("shrink-0 rounded-2xl px-5 py-3 font-display text-lg font-black", t.includes("▲") ? "bg-bull/15 text-bull ring-1 ring-bull/30" : "bg-bear/15 text-bear ring-1 ring-bear/30")}>
              {t}
            </span>
          ))}
        </div>
        <div ref={rowB} className="flex w-max gap-3 will-change-transform">
          {[...TAPE_B, ...TAPE_B].map((t, i) => (
            <span key={i} className="shrink-0 font-display text-5xl font-black tracking-tight text-transparent" style={{ WebkitTextStroke: "1.5px rgba(188,203,234,.45)" }}>
              {t} <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 px-5">
        <Chip tone="azure">Scroll the page to accelerate</Chip>
        <Chip tone="violet">Drag to fling</Chip>
        <span className="ml-auto flex items-center gap-2 font-mono text-xs font-bold text-ink-300">
          <FlameIcon size={16} /> {Math.round(speed)} px/s
        </span>
        <TrophyIcon size={18} className="hidden sm:block" />
      </div>
    </Asset>
  );
}

export { SnapCarousel, StoriesViewer, Coverflow, CardStack, HeroCarousel, Onboarding, VelocityMarquee };
