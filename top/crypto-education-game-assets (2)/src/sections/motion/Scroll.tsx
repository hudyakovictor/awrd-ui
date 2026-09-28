import { useLayoutEffect, useRef, useState } from "react";
import { Asset, Chip, Phone } from "../../components/ui";
import { BullIcon, CoinIcon, FlameIcon, GemIcon, Icon, TrophyIcon, XPIcon } from "../../components/icons";
import { sfx } from "../../lib/sound";
import { clamp, mapRange, Reveal, Tilt, useElementThrough, usePointerParallax, useStickyProgress, type RevealFrom } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-20 · PARALLAX SCENE — 6 depth layers: pointer + gyro + scroll
 * ===================================================================== */
function ParallaxScene() {
  const box = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const ptr = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const DEPTH = [0.04, 0.1, 0.2, 0.34, 0.55, 0.85, 0.3];
  const apply = () => {
    layers.current.forEach((el, i) => {
      if (!el) return;
      const d = DEPTH[i];
      el.style.transform = `translate3d(${(-ptr.current.x * d * 46).toFixed(2)}px, ${(-ptr.current.y * d * 26 + scroll.current * d * 160).toFixed(2)}px, 0)`;
    });
  };
  usePointerParallax(box, (x, y) => {
    ptr.current = { x, y };
    apply();
  });
  useElementThrough(box, (p) => {
    scroll.current = p - 0.5;
    apply();
  });
  const L = (i: number) => (el: HTMLDivElement | null) => {
    layers.current[i] = el;
  };
  return (
    <Asset title="Parallax Scene · To the Moon" code="M-20" tags="parallax layers depth pointer mouse gyroscope scroll scene hero illustration" span={12} bodyClass="p-0">
      <div ref={box} className="relative h-[440px] overflow-hidden" style={{ background: "linear-gradient(180deg,#050b1c 0%,#1b1f5c 50%,#3a2466 75%,#5a2a5c 100%)" }}>
        <div ref={L(0)} className="absolute -inset-16">
          {Array.from({ length: 70 }).map((_, i) => (
            <span key={i} className="absolute rounded-full bg-white" style={{ width: (i % 3) + 1, height: (i % 3) + 1, left: `${(i * 37.7) % 100}%`, top: `${(i * 21.3) % 60}%`, animation: `twinkle ${2 + (i % 4)}s ${(i % 7) * 0.3}s infinite` }} />
          ))}
        </div>
        <div ref={L(1)} className="absolute -inset-16">
          <div className="absolute right-[18%] top-[18%] flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-b from-[#fff1c4] to-gold font-display text-6xl font-black text-[#c2850a] shadow-[0_0_80px_rgba(255,194,61,.7),inset_-12px_-12px_0_rgba(0,0,0,.08)]">
            ₿
          </div>
        </div>
        <div ref={L(2)} className="absolute -inset-x-20 bottom-0 top-0">
          <svg viewBox="0 0 1200 440" preserveAspectRatio="none" className="absolute bottom-0 h-[70%] w-full">
            <path d="M0 440 L0 260 L120 200 L220 240 L340 150 L460 210 L560 120 L700 190 L820 110 L940 170 L1060 90 L1200 150 L1200 440Z" fill="#2a1f5c" />
          </svg>
        </div>
        <div ref={L(3)} className="absolute -inset-x-20 bottom-0 top-0">
          <svg viewBox="0 0 1200 440" preserveAspectRatio="none" className="absolute bottom-0 h-[55%] w-full">
            <path d="M0 440 L0 300 L100 270 L200 300 L300 230 L420 280 L520 200 L640 260 L760 190 L880 250 L1000 180 L1100 230 L1200 200 L1200 440Z" fill="#1c2a6a" />
            <path d="M0 300 L100 270 L200 300 L300 230 L420 280 L520 200 L640 260 L760 190 L880 250 L1000 180 L1100 230 L1200 200" stroke="#22d39a" strokeWidth="3" fill="none" opacity=".7" />
          </svg>
        </div>
        <div ref={L(4)} className="absolute -inset-x-24 bottom-[-20px] h-[46%]">
          <div className="flex h-full items-end justify-center gap-2">
            {Array.from({ length: 34 }).map((_, i) => {
              const h = 30 + ((i * 47) % 70);
              const up = (i * 7) % 3 !== 0;
              return (
                <div key={i} className="relative w-9 shrink-0 rounded-t-md" style={{ height: `${h}%`, background: up ? "linear-gradient(180deg,#22d39a,#0c6b4c)" : "linear-gradient(180deg,#ff4d6d,#7a1628)", boxShadow: `0 0 18px ${up ? "rgba(34,211,154,.3)" : "rgba(255,77,109,.3)"}` }}>
                  <span className="absolute -top-4 left-1/2 h-4 w-0.5 -translate-x-1/2" style={{ background: up ? "#22d39a" : "#ff4d6d" }} />
                  {Array.from({ length: Math.floor(h / 18) }).map((_, k) => (
                    <span key={k} className="absolute left-2 h-1.5 w-1.5 rounded-sm bg-white/50" style={{ top: 10 + k * 14, opacity: (i + k) % 3 ? 0.8 : 0.2 }} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <div ref={L(6)} className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan">Season 3</div>
          <div className="text-gradient-gold font-display text-5xl font-black drop-shadow-[0_6px_0_rgba(0,0,0,.35)] sm:text-7xl">TO THE MOON</div>
          <div className="mt-2 text-sm font-bold text-ink-200">Move your mouse · tilt your phone · scroll</div>
        </div>
        <div ref={L(5)} className="pointer-events-none absolute -inset-10">
          <div className="absolute left-[12%] top-[40%] h-24 w-24 anim-float">
            <div className="relative h-full w-full rotate-[-24deg]">
              <span className="absolute -bottom-6 left-1/2 h-10 w-5 -translate-x-1/2 rounded-full bg-gradient-to-b from-gold via-flame to-transparent anim-flicker" />
              <BullIcon size={96} />
            </div>
          </div>
          <CoinIcon size={46} className="absolute left-[30%] top-[18%] anim-float" />
          <GemIcon size={40} className="absolute right-[10%] top-[58%] anim-float" />
          <CoinIcon size={34} className="absolute right-[34%] top-[70%] anim-float" />
          <XPIcon size={38} className="absolute left-[46%] top-[76%] anim-float" />
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-21 · HOLOGRAPHIC COLLECTIBLE CARDS — tilt, foil, glare, depth, flip
 * ===================================================================== */
const CARDS = [
  { n: "The Whale", r: "Legendary", c: "#ffc23d", e: "🐋", s: [["Patience", 98], ["Capital", 99], ["Risk", 22]], sn: "#0007" },
  { n: "Diamond Hands", r: "Epic", c: "#2fd4ff", e: "💎", s: [["Patience", 95], ["Nerves", 90], ["Risk", 45]], sn: "#0142" },
  { n: "Degen Ape", r: "Rare", c: "#9170ff", e: "🦍", s: [["Courage", 99], ["Luck", 70], ["Risk", 97]], sn: "#0888" },
];
function HoloCard({ card }: { card: (typeof CARDS)[number] }) {
  const [flip, setFlip] = useState(false);
  return (
    <Tilt max={16} scale={1.05} className="mx-auto h-[380px] w-[260px] cursor-pointer rounded-[26px]">
      <div
        onClick={() => {
          setFlip((f) => !f);
          sfx("flip");
        }}
        className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flip ? "rotateY(180deg)" : "none" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[26px] p-[3px] [backface-visibility:hidden]" style={{ background: `linear-gradient(145deg, ${card.c}, #0a1330 45%, ${card.c})`, boxShadow: `0 10px 0 #050b1c, 0 30px 60px -20px ${card.c}88` }}>
          <div className="relative h-full w-full overflow-hidden rounded-[23px] bg-gradient-to-b from-ink-700 to-ink-900 [transform-style:preserve-3d]">
            <div className="flex items-center justify-between px-4 pt-4" style={{ transform: "translateZ(30px)" }}>
              <span className="font-display text-sm font-black text-white">{card.n}</span>
              <span className="rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase text-ink-950" style={{ background: card.c }}>
                {card.r}
              </span>
            </div>
            <div className="relative mx-4 mt-3 flex h-44 items-center justify-center overflow-hidden rounded-2xl" style={{ background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${card.c} 55%, transparent), #0a1330 75%)` }}>
              <div className="bg-grid absolute inset-0 opacity-50" />
              <span className="relative text-[96px] drop-shadow-[0_12px_14px_rgba(0,0,0,.5)]" style={{ transform: "translateZ(60px)" }}>
                {card.e}
              </span>
            </div>
            <div className="mx-4 mt-3 space-y-1.5" style={{ transform: "translateZ(20px)" }}>
              {card.s.map(([k, v]) => (
                <div key={k as string} className="flex items-center gap-2 text-[10px] font-black uppercase text-ink-300">
                  <span className="w-16">{k}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-950">
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: card.c }} />
                  </div>
                  <span className="w-6 text-right font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[9px] font-bold text-ink-500">
              <span>TRADELINGO · S3</span>
              <span>{card.sn}/1000</span>
            </div>
            <div className="holo pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100" />
            <div className="sparkle-tex pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover/tilt:opacity-80" />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[26px] border-[3px] p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ borderColor: card.c, background: `repeating-linear-gradient(45deg, #0d1a3d 0 12px, #122247 12px 24px)` }}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-black text-ink-950" style={{ background: card.c }}>
            TL
          </div>
          <div className="mt-4 font-display text-lg font-black text-white">Collectible #{card.sn}</div>
          <div className="mt-1 text-xs font-bold text-ink-300">Earned by completing Season 3 milestones. Tap to flip back.</div>
        </div>
      </div>
    </Tilt>
  );
}
function HoloCards() {
  return (
    <Asset title="Holographic Collectibles" code="M-21" tags="holographic cards tilt 3d foil glare collectible trading card flip parallax depth" span={12}>
      <div className="grid gap-8 py-4 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.n} from="flip" delay={i * 140}>
            <HoloCard card={c} />
          </Reveal>
        ))}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-500">Hover to tilt & reveal foil · tap to flip</div>
    </Asset>
  );
}

/* =====================================================================
 * M-22 · STICKY SCROLL STORY — scroll drives a 4-step phone narrative
 * ===================================================================== */
const STORY = [
  { t: "Learn", d: "Bite-sized lessons unlock one by one as you progress along the path.", c: "#3e8bff", i: "book" },
  { t: "Practice", d: "Quick quizzes lock knowledge in with instant, juicy feedback.", c: "#9170ff", i: "brain" },
  { t: "Trade", d: "Apply it with paper money on live-feeling charts.", c: "#22d39a", i: "chart" },
  { t: "Earn", d: "XP, gems and trophies reward consistency, not luck.", c: "#ffc23d", i: "trophy" },
];
function StickyStory() {
  const outer = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useStickyProgress(outer, 150, setP);
  const step = Math.min(3, Math.floor(p * 4 * 0.9999));
  const local = clamp(p * 4 - step, 0, 1);
  const prevStep = useRef(0);
  if (prevStep.current !== step) {
    prevStep.current = step;
    sfx("tick");
  }
  return (
    <Asset title="Sticky Scroll Story" code="M-22" tags="sticky scroll story scrollytelling progress steps phone narrative scroll driven" span={12} noClip minH={600}>
      <div ref={outer} className="relative" style={{ height: "280vh" }}>
        <div className="sticky top-[150px] grid items-center gap-8 md:grid-cols-[1fr_auto]" style={{ height: "calc(100vh - 200px)", minHeight: 560 }}>
          <div className="relative pl-10">
            <div className="absolute bottom-2 left-3 top-2 w-1.5 rounded-full bg-ink-950">
              <div className="w-full rounded-full bg-gradient-to-b from-azure via-violet to-gold" style={{ height: `${p * 100}%` }} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-ink-400">How Tradelingo works</div>
            <div className="mb-6 font-display text-3xl font-black text-white">Scroll to play the story</div>
            <div className="space-y-5">
              {STORY.map((s, i) => (
                <div key={s.t} className="relative transition-all duration-500" style={{ opacity: i === step ? 1 : 0.35, transform: i === step ? "translateX(8px)" : "none" }}>
                  <span className="absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black transition-all" style={{ background: i <= step ? s.c : "#1c3365", color: i <= step ? "#050b1c" : "#5c79b5", transform: i === step ? "scale(1.25)" : "none" }}>
                    {i + 1}
                  </span>
                  <div className="font-display text-xl font-black" style={{ color: i === step ? s.c : "#e3eaf8" }}>
                    {s.t}
                  </div>
                  <div className="max-w-md text-sm font-semibold text-ink-300">{s.d}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 font-mono text-xs font-bold text-ink-500">progress {(p * 100).toFixed(0)}%</div>
          </div>
          <Phone width={270} height={520} className="hidden md:block">
            {STORY.map((s, i) => (
              <div key={s.t} className="absolute inset-0 flex flex-col px-5 pt-14 transition-all duration-500" style={{ opacity: i === step ? 1 : 0, transform: i === step ? "none" : i < step ? "translateY(-30px) scale(.95)" : "translateY(30px) scale(.95)", filter: i === step ? "none" : "blur(6px)", background: `radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, ${s.c} 35%, transparent), #0a1330 70%)` }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-950" style={{ background: s.c }}>
                    <Icon name={s.i} size={18} stroke={2.6} />
                  </span>
                  <span className="font-display text-lg font-black text-white">{s.t}</span>
                </div>
                {i === 0 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    {[0, 1, 2, 3].map((k) => {
                      const on = local * 4 > k;
                      return (
                        <div key={k} className={cn("btn3d h-14 w-16 rounded-[50%] [--depth:6px] transition-all", on ? "v-gold" : "v-ghost")} style={{ transform: `translateX(${[0, 30, 0, -30][k]}px)` }}>
                          <Icon name={on ? "check" : "lock"} size={20} stroke={3} />
                        </div>
                      );
                    })}
                  </div>
                )}
                {i === 1 && (
                  <div className="mt-6 space-y-2.5">
                    <div className="text-sm font-bold text-white">A stop-loss protects…</div>
                    {["Your capital", "Your gains only", "Nothing"].map((o, k) => (
                      <div key={o} className={cn("rounded-2xl border-2 px-3 py-2.5 text-xs font-extrabold transition-all duration-300", k === 0 && local > 0.4 ? "border-bull bg-bull/15 text-bull shadow-[0_4px_0_#0c8f63]" : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_4px_0_#0b1838]")}>
                        {o}
                      </div>
                    ))}
                    {local > 0.6 && <div className="anim-pop rounded-2xl bg-bull p-3 text-center text-xs font-black text-ink-950">Correct! +10 XP</div>}
                  </div>
                )}
                {i === 2 && (
                  <div className="mt-6">
                    <div className="font-mono text-2xl font-bold text-bull">${(64000 + local * 1850).toFixed(0)}</div>
                    <svg viewBox="0 0 220 120" className="mt-2 w-full">
                      <path d="M0 100 L25 92 L45 96 L70 74 L95 80 L120 56 L145 62 L170 36 L195 42 L220 14" stroke="#22d39a" strokeWidth="3" fill="none" strokeDasharray="320" strokeDashoffset={320 * (1 - local)} strokeLinecap="round" />
                    </svg>
                    <div className="btn3d v-bull mt-4 h-12 w-full rounded-2xl text-sm">Buy BTC</div>
                  </div>
                )}
                {i === 3 && (
                  <div className="mt-8 flex flex-col items-center">
                    <div style={{ transform: `scale(${0.6 + local * 0.5}) rotate(${(1 - local) * -20}deg)` }}>
                      <TrophyIcon size={110} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-display text-2xl font-black text-gold">
                      <XPIcon size={26} /> +{Math.round(local * 250)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-black text-flame">
                      <FlameIcon size={22} /> 48 day streak
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Phone>
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-23 · HORIZONTAL JOURNEY — vertical scroll drives horizontal track
 * ===================================================================== */
const MODULES = [
  { t: "Crypto Basics", l: 8, c1: "#3e8bff", c2: "#1c55c2", i: "book", e: "🧱" },
  { t: "Wallets & Keys", l: 6, c1: "#9170ff", c2: "#5a3ccc", i: "lock", e: "🔐" },
  { t: "Reading Charts", l: 12, c1: "#22d39a", c2: "#0c8f63", i: "candle", e: "🕯️" },
  { t: "Indicators", l: 10, c1: "#2fd4ff", c2: "#1c6fe0", i: "chart", e: "📊" },
  { t: "Risk & Sizing", l: 9, c1: "#ff7a2f", c2: "#c24a0c", i: "shield", e: "🛡️" },
  { t: "DeFi & Yield", l: 11, c1: "#ff4d6d", c2: "#b31f3d", i: "layers", e: "🌾" },
  { t: "Psychology", l: 7, c1: "#ffc23d", c2: "#c2850a", i: "brain", e: "🧠" },
  { t: "Pro Strategies", l: 14, c1: "#9170ff", c2: "#ff4d6d", i: "trophy", e: "🏆" },
];
function HorizontalJourney() {
  const outer = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const icons = useRef<(HTMLSpanElement | null)[]>([]);
  const dist = useRef(0);
  const [h, setH] = useState(1800);
  useLayoutEffect(() => {
    const measure = () => {
      const t = track.current;
      const v = viewport.current;
      const sticky = outer.current?.firstElementChild as HTMLElement | null;
      if (!t || !v || !sticky) return;
      dist.current = Math.max(0, t.scrollWidth - v.clientWidth);
      setH(dist.current + sticky.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useStickyProgress(outer, 150, (p) => {
    const x = -p * dist.current;
    if (track.current) track.current.style.transform = `translate3d(${x}px,0,0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    const vw = viewport.current?.clientWidth ?? 800;
    icons.current.forEach((el, i) => {
      if (!el) return;
      const center = 24 + i * 316 + 150 + x;
      const rel = (center - vw / 2) / vw;
      el.style.transform = `translateX(${rel * -60}px) rotate(${rel * -20}deg) scale(${1 - Math.min(0.3, Math.abs(rel) * 0.3)})`;
    });
  });
  return (
    <Asset title="Horizontal Scroll Journey" code="M-23" tags="horizontal scroll sticky track scroll driven journey course modules parallax" span={12} noClip minH={500}>
      <div ref={outer} className="relative" style={{ height: h }}>
        <div className="sticky top-[150px]">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-ink-400">Your learning journey</div>
              <div className="font-display text-2xl font-black text-white">Keep scrolling down →</div>
            </div>
            <Chip tone="azure">{MODULES.length} modules</Chip>
          </div>
          <div ref={viewport} className="overflow-hidden rounded-3xl">
            <div ref={track} className="flex w-max gap-4 p-6 will-change-transform">
              {MODULES.map((m, i) => (
                <div key={m.t} className="relative h-[300px] w-[300px] shrink-0 overflow-hidden rounded-3xl p-6 shadow-[0_8px_0_#081231] ring-1 ring-white/10" style={{ background: `linear-gradient(150deg, ${m.c1}, ${m.c2})` }}>
                  <span className="font-display text-7xl font-black text-white/15">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    ref={(el) => {
                      icons.current[i] = el;
                    }}
                    className="absolute right-6 top-6 text-6xl drop-shadow-[0_8px_10px_rgba(0,0,0,.35)] will-change-transform"
                  >
                    {m.e}
                  </span>
                  <div className="absolute inset-x-6 bottom-6">
                    <div className="font-display text-xl font-black text-white">{m.t}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-white/80">
                      <Icon name={m.i} size={14} /> {m.l} lessons
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
                      <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, 100 - i * 16)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-950">
            <div ref={bar} className="h-full origin-left rounded-full bg-gradient-to-r from-azure via-violet to-gold" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-24 · SCROLL-SCRUBBED CHART — path draws & rocket rides with scroll
 * ===================================================================== */
function ScrollScrub() {
  const box = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const rocket = useRef<SVGGElement>(null);
  const [k, setK] = useState(0);
  useElementThrough(box, (p) => {
    const t = clamp(mapRange(p, 0.18, 0.72, 0, 1), 0, 1);
    const el = path.current;
    if (el) {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len * (1 - t)}`;
      const pt = el.getPointAtLength(len * t);
      const pt2 = el.getPointAtLength(Math.min(len, len * t + 1));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      if (rocket.current) rocket.current.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${ang})`);
    }
    setK((prev) => (Math.abs(prev - t) > 0.004 ? t : prev));
  });
  const stats = [
    { l: "Learners", v: 2.4, s: "M", c: "#3e8bff" },
    { l: "Lessons done", v: 18.5, s: "M", c: "#22d39a" },
    { l: "Paper volume", v: 1.2, s: "B", c: "#ffc23d", p: "$" },
  ];
  return (
    <Asset title="Scroll-Scrubbed Chart" code="M-24" tags="scroll scrub scrubbing path draw progress rocket counters scroll linked" span={6}>
      <div ref={box}>
        <svg viewBox="0 0 400 200" className="w-full overflow-visible">
          <defs>
            <linearGradient id="scrubG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3e8bff" />
              <stop offset=".6" stopColor="#22d39a" />
              <stop offset="1" stopColor="#ffc23d" />
            </linearGradient>
          </defs>
          {[50, 100, 150].map((y) => (
            <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#16295a" strokeDasharray="4 6" />
          ))}
          <path d="M10 180 C 60 170, 80 150, 110 150 S 160 120, 190 125 S 240 80, 270 88 S 330 30, 390 18" stroke="#1c3365" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path ref={path} d="M10 180 C 60 170, 80 150, 110 150 S 160 120, 190 125 S 240 80, 270 88 S 330 30, 390 18" stroke="url(#scrubG)" strokeWidth="6" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(34,211,154,.6))" }} />
          <g ref={rocket}>
            <text x="-12" y="8" fontSize="24" transform="rotate(45)">
              🚀
            </text>
          </g>
        </svg>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.l} className="panel-inset rounded-2xl p-3 text-center">
              <div className="font-display text-xl font-black" style={{ color: s.c }}>
                {s.p}
                {(s.v * k).toFixed(1)}
                {s.s}
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-ink-500">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-950">
          <div className="h-full rounded-full bg-gradient-to-r from-azure to-gold" style={{ width: `${k * 100}%` }} />
        </div>
        <div className="mt-2 text-[11px] font-bold text-ink-500">Scroll up & down — the chart is scrubbed by your scroll position</div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-25 · REVEAL GALLERY — 10 scroll-triggered entrance effects (replay)
 * ===================================================================== */
const EFFECTS: { f: RevealFrom; c: string; i: string }[] = [
  { f: "up", c: "#3e8bff", i: "arrowUp" },
  { f: "down", c: "#9170ff", i: "arrowDown" },
  { f: "left", c: "#22d39a", i: "chevronRight" },
  { f: "right", c: "#ff7a2f", i: "chevronLeft" },
  { f: "scale", c: "#2fd4ff", i: "plus" },
  { f: "blur", c: "#ff4d6d", i: "eye" },
  { f: "flip", c: "#ffc23d", i: "refresh" },
  { f: "zoom", c: "#9170ff", i: "search" },
  { f: "rotate", c: "#22d39a", i: "sparkle" },
  { f: "clip", c: "#3e8bff", i: "layers" },
];
function RevealGallery() {
  return (
    <Asset title="Scroll Reveal Gallery" code="M-25" tags="scroll reveal entrance animation fade slide scale blur flip zoom clip intersection observer" span={6}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {EFFECTS.map((e, i) => (
          <Reveal key={e.f} from={e.f} once={false} delay={(i % 5) * 70} threshold={0.3}>
            <div className="flex aspect-square flex-col items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(160deg, ${e.c}, color-mix(in srgb, ${e.c} 40%, #0a1330))`, boxShadow: `0 5px 0 color-mix(in srgb, ${e.c} 35%, black)` }}>
              <Icon name={e.i} size={24} stroke={2.6} />
              <span className="mt-1 text-[10px] font-black uppercase tracking-wider">{e.f}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-ink-950/40 p-3 text-xs font-semibold text-ink-300">
        Every card in this catalog uses these primitives: they <b className="text-cyan">replay</b> each time the tiles leave and re-enter the viewport.
      </div>
    </Asset>
  );
}

export { ParallaxScene, HoloCards, StickyStory, HorizontalJourney, ScrollScrub, RevealGallery };
