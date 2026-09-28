import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Confetti } from "../../components/ui";
import { CoinIcon, GemIcon, HeartIcon, Icon, XPIcon } from "../../components/icons";
import { fx, useGame, type Currency } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { ease, tween, useInterval } from "../../lib/motion";
import { cn } from "../../utils/cn";

function Glyph({ kind, size = 28 }: { kind: Currency | "chest"; size?: number }) {
  if (kind === "gems") return <GemIcon size={size} />;
  if (kind === "coins") return <CoinIcon size={size} />;
  if (kind === "hearts") return <HeartIcon size={size} />;
  if (kind === "chest") return <span style={{ fontSize: size * 0.9 }}>🎁</span>;
  return <XPIcon size={size} />;
}

/* =====================================================================
 * G-17 · DAILY SPIN WHEEL — eased physics, tick + flapper per segment
 * ===================================================================== */
const SEGS: { l: string; sub: string; kind: Currency; amt: number; c: string; w: number }[] = [
  { l: "50", sub: "XP", kind: "xp", amt: 50, c: "#3e8bff", w: 18 },
  { l: "10", sub: "GEMS", kind: "gems", amt: 10, c: "#9170ff", w: 16 },
  { l: "100", sub: "COINS", kind: "coins", amt: 100, c: "#16b884", w: 18 },
  { l: "25", sub: "GEMS", kind: "gems", amt: 25, c: "#ff7a2f", w: 10 },
  { l: "250", sub: "COINS", kind: "coins", amt: 250, c: "#3e8bff", w: 12 },
  { l: "100", sub: "XP", kind: "xp", amt: 100, c: "#9170ff", w: 14 },
  { l: "❤", sub: "REFILL", kind: "hearts", amt: 5, c: "#ff4d6d", w: 8 },
  { l: "100", sub: "JACKPOT", kind: "gems", amt: 100, c: "#e0a000", w: 4 },
];

function SpinWheel() {
  const g = useGame();
  const wheelRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<SVGGElement>(null);
  const angle = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [fire, setFire] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const C = 150;
  const R = 128;
  const pt = (deg: number, r: number) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];

  const spin = (el: HTMLElement) => {
    if (spinning) return;
    if (freeUsed && !g.spend("gems", 50, el)) return;
    setFreeUsed(true);
    setResult(null);
    setClaimed(false);
    const total = SEGS.reduce((a, s) => a + s.w, 0);
    let r = Math.random() * total;
    let t = 0;
    for (let i = 0; i < SEGS.length; i++) {
      r -= SEGS[i].w;
      if (r <= 0) {
        t = i;
        break;
      }
    }
    const cur = angle.current;
    const jitter = (Math.random() - 0.5) * 30;
    const targetMod = (((-t * 45 - jitter) % 360) + 360) % 360;
    const curMod = ((cur % 360) + 360) % 360;
    let delta = targetMod - curMod;
    if (delta < 0) delta += 360;
    const end = cur + 360 * 6 + delta;
    setSpinning(true);
    sfx("whoosh");
    let lastSeg = Math.floor((cur + 22.5) / 45);
    tween(
      cur,
      end,
      5200,
      (a) => {
        angle.current = a;
        if (wheelRef.current) wheelRef.current.style.transform = `rotate(${a}deg)`;
        const seg = Math.floor((a + 22.5) / 45);
        if (seg !== lastSeg) {
          lastSeg = seg;
          sfx("tick");
          pointerRef.current?.animate([{ transform: "rotate(-26deg)" }, { transform: "rotate(0deg)" }], { duration: 170, easing: "cubic-bezier(.3,1.6,.5,1)" });
        }
      },
      ease.outQuart,
      () => {
        setSpinning(false);
        setResult(t);
        setFire((f) => f + 1);
        sfx(SEGS[t].sub === "JACKPOT" ? "levelup" : "success");
        fx.burst(boxRef.current, { count: 30, spread: 150 });
      },
    );
  };
  const claim = (el: HTMLElement) => {
    if (result === null || claimed) return;
    const s = SEGS[result];
    setClaimed(true);
    if (s.kind === "hearts") g.refillHearts(el);
    else g.reward(s.kind, s.amt, el);
  };
  return (
    <Asset title="Daily Spin Wheel" code="G-17" tags="spin wheel daily reward fortune lucky jackpot physics" span={5} badge="Daily">
      <Confetti fire={fire} count={36} />
      <div ref={boxRef} className="relative mx-auto w-full max-w-[320px]">
        <svg viewBox="0 0 300 300" className="w-full drop-shadow-[0_14px_24px_rgba(0,0,0,.5)]">
          <defs>
            <radialGradient id="whHub">
              <stop offset="0" stopColor="#fff1a8" />
              <stop offset="1" stopColor="#e09000" />
            </radialGradient>
            <linearGradient id="whRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a5896" />
              <stop offset="1" stopColor="#122247" />
            </linearGradient>
          </defs>
          <circle cx={C} cy={C + 6} r="146" fill="#081231" />
          <circle cx={C} cy={C} r="146" fill="url(#whRim)" />
          {Array.from({ length: 16 }).map((_, i) => {
            const [x, y] = pt(i * 22.5, 138);
            return <circle key={i} cx={x} cy={y} r="4.5" fill="#ffe28a" style={{ animation: `bulb ${spinning ? 0.25 : 1.1}s ${i % 2 ? (spinning ? 0.12 : 0.55) : 0}s infinite` }} />;
          })}
          <g ref={wheelRef} style={{ transformOrigin: `${C}px ${C}px` }}>
            {SEGS.map((s, i) => {
              const a0 = i * 45 - 22.5 - 90;
              const a1 = a0 + 45;
              const [x0, y0] = pt(a0, R);
              const [x1, y1] = pt(a1, R);
              return (
                <g key={i}>
                  <path d={`M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill={s.c} stroke="#0a1330" strokeWidth="2" />
                  <path d={`M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill="url(#whShade)" opacity=".0" />
                  <g transform={`rotate(${i * 45} ${C} ${C})`}>
                    <text x={C} y={C - R + 34} textAnchor="middle" fontSize={s.l.length > 3 ? 16 : 20} fontWeight="900" fill="#fff" fontFamily="Unbounded, sans-serif" style={{ paintOrder: "stroke" }} stroke="rgba(0,0,0,.25)" strokeWidth="3">
                      {s.l}
                    </text>
                    <text x={C} y={C - R + 50} textAnchor="middle" fontSize="8.5" fontWeight="900" fill="rgba(255,255,255,.85)" letterSpacing="1">
                      {s.sub}
                    </text>
                  </g>
                  {result === i && !spinning && <path d={`M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill="#fff" className="anim-glow" opacity=".35" />}
                </g>
              );
            })}
          </g>
          <circle cx={C} cy={C} r="30" fill="#081231" />
          <circle cx={C} cy={C - 2} r="28" fill="url(#whHub)" />
          <text x={C} y={C + 3} textAnchor="middle" fontSize="11" fontWeight="900" fill="#6b3f00" fontFamily="Unbounded, sans-serif">
            SPIN
          </text>
          <g ref={pointerRef} style={{ transformOrigin: `${C}px 10px` }}>
            <path d={`M${C - 14},4 L${C + 14},4 L${C},36 Z`} fill="#081231" transform="translate(0 3)" />
            <path d={`M${C - 14},4 L${C + 14},4 L${C},36 Z`} fill="#fff" />
            <circle cx={C} cy="10" r="4" fill="#ff4d6d" />
          </g>
        </svg>
        <button onClick={(e) => spin(e.currentTarget)} disabled={spinning} className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full" aria-label="Spin" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        {result !== null && !spinning ? (
          <div className="anim-pop flex flex-1 items-center gap-3 rounded-2xl bg-ink-950/50 p-3 ring-1 ring-white/10">
            <Glyph kind={SEGS[result].kind} size={34} />
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-ink-400">You won</div>
              <div className="font-display text-base font-black text-white">
                {SEGS[result].kind === "hearts" ? "Full hearts" : `${SEGS[result].amt} ${SEGS[result].sub}`}
              </div>
            </div>
            <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => claim(e.currentTarget)}>
              {claimed ? "Claimed" : "Claim"}
            </Btn>
          </div>
        ) : (
          <Btn variant={freeUsed ? "violet" : "gold"} block onClick={(e) => spin(e.currentTarget)} disabled={spinning} sound={false} className="sheen">
            {spinning ? "Spinning…" : freeUsed ? <>Spin again · <GemIcon size={16} /> 50</> : "Free daily spin"}
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-18 · LOOT CHEST — tap to charge, burst open, deal & flip cards
 * ===================================================================== */
const TIERS = {
  common: { n: "Common", c: "#3e8bff", r: [{ kind: "coins", amt: 60 }, { kind: "xp", amt: 20 }, { kind: "gems", amt: 5 }] },
  rare: { n: "Rare", c: "#9170ff", r: [{ kind: "coins", amt: 150 }, { kind: "xp", amt: 50 }, { kind: "gems", amt: 15 }] },
  epic: { n: "Epic", c: "#ff7a2f", r: [{ kind: "coins", amt: 400 }, { kind: "gems", amt: 40 }, { kind: "xp", amt: 120 }] },
  legendary: { n: "Legendary", c: "#ffc23d", r: [{ kind: "coins", amt: 1000 }, { kind: "gems", amt: 100 }, { kind: "xp", amt: 300 }] },
} as const;
type TierKey = keyof typeof TIERS;

function ChestArt({ color, open, glow }: { color: string; open: boolean; glow: number }) {
  const gid = `ch-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox="0 0 120 110" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: color }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${color} 45%, black)` }} />
        </linearGradient>
        <linearGradient id="chGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1a8" />
          <stop offset="1" stopColor="#d68000" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="104" rx="46" ry="6" fill="#000" opacity=".35" />
      {glow > 0 && <ellipse cx="60" cy="52" rx={30 + glow * 20} ry={10 + glow * 8} fill={color} opacity={0.3 + glow * 0.4} style={{ filter: "blur(8px)" }} />}
      <rect x="14" y="50" width="92" height="50" rx="8" fill={`url(#${gid})`} />
      <rect x="14" y="66" width="92" height="7" fill="url(#chGold)" />
      <g style={{ transformOrigin: "14px 50px", transform: open ? "rotate(-32deg) translate(-4px,-10px)" : "none", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)" }}>
        <path d="M14 50 V38 a24 24 0 0 1 24 -24 h44 a24 24 0 0 1 24 24 V50 Z" fill={`url(#${gid})`} />
        <rect x="14" y="44" width="92" height="7" fill="url(#chGold)" />
        <path d="M26 24 h14" stroke="#fff" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" />
      </g>
      <rect x="50" y="52" width="20" height="22" rx="4" fill="url(#chGold)" />
      <circle cx="60" cy="62" r="3" fill="#6b3f00" />
      {glow > 0.3 && !open && (
        <path d="M30 60 l8 10 M84 58 l-6 12 M60 50 v-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={glow} />
      )}
    </svg>
  );
}

function LootChest() {
  const g = useGame();
  const [tier, setTier] = useState<TierKey>("epic");
  const [taps, setTaps] = useState(0);
  const [stage, setStage] = useState<"idle" | "burst" | "cards">("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const [dealt, setDealt] = useState(false);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [collected, setCollected] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const T = TIERS[tier];
  const NEED = 3;

  const tap = () => {
    if (stage !== "idle") return;
    const n = taps + 1;
    setTaps(n);
    setShakeKey((k) => k + 1);
    sfx("charge", 1 + n * 0.25);
    if (n >= NEED) {
      setTimeout(() => {
        setStage("burst");
        sfx("open");
        setTimeout(() => {
          setStage("cards");
          requestAnimationFrame(() => requestAnimationFrame(() => setDealt(true)));
        }, 650);
      }, 250);
    }
  };
  const flip = (i: number) => {
    if (!dealt || flipped[i]) return;
    setFlipped((f) => f.map((v, j) => (j === i ? true : v)));
    sfx("flip");
    setTimeout(() => {
      sfx("pop", 1 + i * 0.15);
      fx.burst(cardRefs.current[i], { colors: [T.c, "#fff", "#ffc23d"], count: 18, spread: 70 });
    }, 250);
  };
  const collect = () => {
    setCollected(true);
    T.r.forEach((rw, i) => setTimeout(() => g.reward(rw.kind as Currency, rw.amt, cardRefs.current[i]), i * 220));
  };
  const reset = (t: TierKey = tier) => {
    setTier(t);
    setTaps(0);
    setStage("idle");
    setDealt(false);
    setFlipped([false, false, false]);
    setCollected(false);
  };
  const pos = [
    "translate(-118px,-8px) rotate(-10deg)",
    "translate(0,-28px) rotate(0deg)",
    "translate(118px,-8px) rotate(10deg)",
  ];
  return (
    <Asset title="Loot Chest Opening" code="G-18" tags="chest loot box open reward cards flip rarity legendary epic" span={7} badge="Juicy">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TIERS) as TierKey[]).map((k) => (
          <button
            key={k}
            onClick={() => { reset(k); sfx("select"); }}
            className={cn("rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition active:translate-y-0.5", tier === k ? "text-ink-950" : "bg-ink-800 text-ink-300 shadow-[0_3px_0_#0b1838]")}
            style={tier === k ? { background: TIERS[k].c, boxShadow: `0 3px 0 color-mix(in srgb, ${TIERS[k].c} 50%, black)` } : undefined}
          >
            {TIERS[k].n}
          </button>
        ))}
      </div>
      <div className="relative mt-4 h-[330px] overflow-hidden rounded-3xl" style={{ background: `radial-gradient(circle at 50% 60%, color-mix(in srgb, ${T.c} 35%, #0a1330), #0a1330 70%)` }}>
        {stage !== "idle" && <div className="rays left-1/2 top-[62%] h-[640px] w-[640px]" style={{ background: `repeating-conic-gradient(from 0deg, color-mix(in srgb, ${T.c} 40%, transparent) 0deg 10deg, transparent 10deg 24deg)` }} />}
        {stage === "burst" && <div className="absolute inset-0 z-30 bg-white" style={{ animation: "white-flash .6s ease-out forwards" }} />}
        <button onClick={tap} disabled={stage !== "idle"} className="absolute bottom-6 left-1/2 h-36 w-40 -translate-x-1/2">
          <div key={shakeKey} className={cn("h-full w-full", shakeKey > 0 && stage === "idle" ? "anim-chest-shake" : stage === "idle" ? "anim-bounce-soft" : "")}>
            <ChestArt color={T.c} open={stage !== "idle"} glow={Math.min(1, taps / NEED)} />
          </div>
        </button>
        {stage === "idle" && (
          <div className="pointer-events-none absolute inset-x-0 top-6 text-center">
            <div className="font-display text-xl font-black text-white">{T.n} Chest</div>
            <div className="text-xs font-bold text-ink-300">Tap {NEED - taps}× to open</div>
            <div className="mx-auto mt-2 flex w-24 gap-1">
              {Array.from({ length: NEED }).map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: i < taps ? T.c : "#1c3365" }} />
              ))}
            </div>
          </div>
        )}
        {stage === "cards" &&
          T.r.map((rw, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => flip(i)}
              className="absolute left-1/2 top-[38%] z-20 -ml-[46px] -mt-[64px] h-32 w-[92px] cursor-pointer [perspective:700px]"
              style={{ transform: dealt ? pos[i] : "translate(0,110px) scale(.2)", opacity: dealt ? 1 : 0, transition: `transform .6s ${i * 0.12}s cubic-bezier(.3,1.4,.5,1), opacity .3s ${i * 0.12}s` }}
            >
              <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped[i] ? "rotateY(180deg)" : "none" }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-white/20 [backface-visibility:hidden]" style={{ background: `linear-gradient(160deg, ${T.c}, color-mix(in srgb, ${T.c} 40%, #0a1330))`, boxShadow: `0 6px 0 color-mix(in srgb, ${T.c} 35%, black), 0 0 24px color-mix(in srgb, ${T.c} 60%, transparent)` }}>
                  <span className="font-display text-3xl font-black text-white/90">?</span>
                  <span className="sheen absolute inset-0 rounded-2xl" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-ink-600 to-ink-800 [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ boxShadow: `0 0 0 2px ${T.c}, 0 0 28px ${T.c}` }}>
                  <Glyph kind={rw.kind as Currency} size={38} />
                  <div className="mt-1 font-display text-lg font-black text-white">{rw.amt}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.c }}>
                    {rw.kind}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] font-bold text-ink-400">{stage === "cards" ? (flipped.every(Boolean) ? "All revealed!" : "Tap cards to reveal") : "Rarity changes rewards & light color"}</span>
        {stage === "cards" && flipped.every(Boolean) ? (
          collected ? (
            <Btn variant="ghost" size="sm" className="ml-auto" onClick={() => reset()}>
              Open another
            </Btn>
          ) : (
            <Btn variant="gold" size="sm" className="ml-auto" onClick={collect}>
              Collect all
            </Btn>
          )
        ) : (
          <Chip tone="violet" className="ml-auto">
            {T.n}
          </Chip>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-19 · SCRATCH CARD — canvas foil, reveal at 50%
 * ===================================================================== */
const PRIZES: { kind: Currency; amt: number; label: string }[] = [
  { kind: "coins", amt: 250, label: "250 Coins" },
  { kind: "gems", amt: 15, label: "15 Gems" },
  { kind: "xp", amt: 75, label: "75 XP" },
];

function ScratchCard() {
  const g = useGame();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [card, setCard] = useState(0);
  const prize = useMemo(() => PRIZES[(card * 7 + 1) % PRIZES.length], [card]);
  const [pct, setPct] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [fire, setFire] = useState(0);
  const st = useRef({ down: false, lx: 0, ly: 0, moves: 0 });

  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const gr = ctx.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#d7deee");
    gr.addColorStop(0.45, "#8ea4d2");
    gr.addColorStop(0.55, "#bccbea");
    gr.addColorStop(1, "#7f95c6");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.font = "900 14px Unbounded, sans-serif";
    for (let y = 16; y < h; y += 28) for (let x = (y / 28) % 2 ? 0 : 20; x < w; x += 40) ctx.fillText("₿", x, y);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    ctx.fillStyle = "#27427d";
    ctx.font = "900 20px Unbounded, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH HERE", w / 2, h / 2 + 7);
    setPct(0);
    setRevealed(false);
    setClaimed(false);
  }, [card]);

  const measure = () => {
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    const p = clear / total;
    setPct(p);
    if (p > 0.5 && !revealed) {
      setRevealed(true);
      setFire((f) => f + 1);
      sfx("success");
    }
  };
  const scratch = (e: React.PointerEvent) => {
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx || revealed) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(st.current.lx, st.current.ly);
    ctx.lineTo(x, y);
    ctx.stroke();
    st.current.lx = x;
    st.current.ly = y;
    if (++st.current.moves % 6 === 0) {
      measure();
      sfx("flip");
    }
  };
  return (
    <Asset title="Scratch Card" code="G-19" tags="scratch card canvas reveal prize lottery reward" span={4}>
      <Confetti fire={fire} />
      <div className="relative h-44 overflow-hidden rounded-2xl ring-2 ring-gold/40" style={{ background: "linear-gradient(135deg,#1c3365,#0d1a3d)" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={revealed ? "anim-pop" : ""}>
            <Glyph kind={prize.kind} size={56} />
          </div>
          <div className="mt-1 font-display text-xl font-black text-white">{prize.label}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gold">You win!</div>
        </div>
        <canvas
          ref={cvRef}
          className="absolute inset-0 h-full w-full cursor-crosshair transition-opacity duration-700"
          style={{ opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto", touchAction: "none" }}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            st.current = { down: true, lx: e.clientX - r.left, ly: e.clientY - r.top, moves: st.current.moves };
            e.currentTarget.setPointerCapture(e.pointerId);
            scratch(e);
          }}
          onPointerMove={(e) => st.current.down && scratch(e)}
          onPointerUp={() => {
            st.current.down = false;
            measure();
          }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="panel-inset h-2.5 flex-1 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-flame transition-all" style={{ width: `${Math.min(100, (pct / 0.5) * 100)}%` }} />
        </div>
        <span className="font-mono text-[10px] font-bold text-ink-400">{Math.min(100, Math.round((pct / 0.5) * 100))}%</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Btn variant="ghost" size="sm" onClick={() => setCard((c) => c + 1)}>
          New card
        </Btn>
        <Btn
          variant="gold"
          size="sm"
          className="flex-1"
          disabled={!revealed || claimed}
          onClick={(e) => {
            setClaimed(true);
            g.reward(prize.kind, prize.amt, e.currentTarget);
          }}
        >
          {claimed ? "Claimed" : revealed ? "Claim prize" : "Scratch 50%"}
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-20 · DAILY LOGIN CALENDAR — 7-day reward track
 * ===================================================================== */
const DAYS: { kind: Currency | "chest"; amt: number }[] = [
  { kind: "coins", amt: 50 },
  { kind: "gems", amt: 5 },
  { kind: "coins", amt: 100 },
  { kind: "xp", amt: 50 },
  { kind: "gems", amt: 15 },
  { kind: "coins", amt: 250 },
  { kind: "chest", amt: 1 },
];

function DailyLogin() {
  const g = useGame();
  const [claimed, setClaimed] = useState(3);
  const [today, setToday] = useState(3);
  const [secs, setSecs] = useState(86399 - 3600 * 5);
  const [fire, setFire] = useState(0);
  useInterval(() => setSecs((s) => (s > 0 ? s - 1 : 86399)), 1000);
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const claim = (i: number, el: HTMLElement) => {
    if (i !== today || claimed > i) return;
    const d = DAYS[i];
    setClaimed(i + 1);
    if (d.kind === "chest") {
      setFire((f) => f + 1);
      sfx("open");
      g.reward("gems", 50, el);
      setTimeout(() => g.reward("coins", 500, el), 300);
    } else g.reward(d.kind, d.amt, el);
  };
  return (
    <Asset title="Daily Login Rewards" code="G-20" tags="daily login calendar streak rewards 7 day chest claim" span={8}>
      <Confetti fire={fire} count={40} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <div className="font-display text-lg font-black text-white">Weekly login bonus</div>
          <div className="text-xs font-semibold text-ink-400">Come back every day — day 7 is a mega chest.</div>
        </div>
        <Chip tone="azure" className="ml-auto font-mono">
          <Icon name="clock" size={12} /> {hh}:{mm}:{ss}
        </Chip>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {DAYS.map((d, i) => {
          const done = i < claimed;
          const isToday = i === today && !done;
          const big = d.kind === "chest";
          return (
            <button
              key={i}
              onClick={(e) => claim(i, e.currentTarget)}
              disabled={!isToday}
              className={cn(
                "group relative flex flex-col items-center rounded-2xl border-2 p-3 transition-all duration-300 [perspective:600px]",
                big && "col-span-2 sm:col-span-1",
                done ? "border-bull/40 bg-bull/10" : isToday ? "anim-bounce-soft border-gold bg-gold/10 shadow-[0_0_24px_rgba(255,194,61,.35)]" : "border-ink-600 bg-ink-850",
              )}
            >
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isToday ? "text-gold" : "text-ink-400")}>Day {i + 1}</span>
              <div className={cn("my-2 flex h-12 items-center justify-center transition-transform duration-500", done && "[transform:rotateY(360deg)]")}>
                {done ? (
                  <span className="anim-pop flex h-11 w-11 items-center justify-center rounded-full bg-bull text-ink-950 shadow-[0_3px_0_#0c8f63]">
                    <Icon name="check" size={22} stroke={3.5} />
                  </span>
                ) : (
                  <span className={cn(!isToday && "opacity-60 grayscale-[.4]")}>
                    <Glyph kind={d.kind} size={big ? 44 : 34} />
                  </span>
                )}
              </div>
              <span className="font-display text-xs font-black text-white">{big ? "Mega" : `×${d.amt}`}</span>
              {isToday && <span className="absolute -top-2.5 rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-black text-ink-950 shadow-[0_2px_0_#c2850a]">CLAIM</span>}
              {i > today && !done && (
                <span className="absolute right-1.5 top-1.5 text-ink-500">
                  <Icon name="lock" size={11} stroke={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="panel-inset h-3 flex-1 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-bull to-gold transition-all duration-700" style={{ width: `${(claimed / 7) * 100}%` }} />
        </div>
        <span className="font-mono text-xs font-bold text-ink-300">{claimed}/7</span>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            if (claimed >= 7) {
              setClaimed(0);
              setToday(0);
            } else if (claimed > today) setToday((t) => Math.min(6, t + 1));
          }}
        >
          {claimed >= 7 ? "New week" : "Next day (demo)"}
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-21 · SEASON PASS — drag-to-scroll track w/ momentum, free + premium
 * ===================================================================== */
const PASS = Array.from({ length: 20 }, (_, i) => {
  const t = i + 1;
  const free: { kind: Currency; amt: number } = t % 5 === 0 ? { kind: "gems", amt: 20 } : t % 2 ? { kind: "coins", amt: 50 * t } : { kind: "xp", amt: 25 + t * 5 };
  const skins = ["🚀", "🦄", "🐋", "🔥", "💎", "👑", "🌕", "⚡"];
  const prem = t % 3 === 0 ? { skin: skins[(t / 3) % skins.length] } : { kind: "gems" as Currency, amt: 10 + t * 3 };
  return { t, free, prem };
});

function SeasonPass() {
  const g = useGame();
  const sc = useRef<HTMLDivElement>(null);
  const [premium, setPremium] = useState(false);
  const [claimed, setClaimed] = useState<string[]>(["f1", "f2", "f3"]);
  const seasonXP = 1030;
  const reached = Math.floor(seasonXP / 100);
  const frac = (seasonXP % 100) / 100;
  const COL = 108;
  const st = useRef({ down: false, x: 0, sl: 0, v: 0, lx: 0, lt: 0, moved: false, raf: 0 });

  useEffect(() => {
    const t = setTimeout(() => {
      const el = sc.current;
      if (el) el.scrollTo({ left: reached * COL - el.clientWidth / 2 + COL / 2, behavior: "smooth" });
    }, 500);
    return () => clearTimeout(t);
  }, [reached]);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !sc.current) return;
    cancelAnimationFrame(st.current.raf);
    st.current = { ...st.current, down: true, x: e.clientX, sl: sc.current.scrollLeft, v: 0, lx: e.clientX, lt: performance.now(), moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    const el = sc.current;
    if (!s.down || !el) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 5) {
      s.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (s.moved) {
      el.scrollLeft = s.sl - dx;
      const now = performance.now();
      s.v = (e.clientX - s.lx) / Math.max(1, now - s.lt);
      s.lx = e.clientX;
      s.lt = now;
    }
  };
  const onUp = () => {
    const s = st.current;
    const el = sc.current;
    if (!s.down || !el) return;
    s.down = false;
    if (!s.moved) return;
    let vel = -s.v * 16;
    const step = () => {
      el.scrollLeft += vel;
      vel *= 0.94;
      if (Math.abs(vel) > 0.4) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };
  const claim = (key: string, reward: { kind: Currency; amt: number } | { skin: string }, el: HTMLElement) => {
    if (claimed.includes(key)) return;
    setClaimed((c) => [...c, key]);
    if ("skin" in reward) {
      fx.burst(el, { colors: ["#9170ff", "#ffc23d", "#2fd4ff"], count: 24, spread: 80 });
      fx.text(el, `${reward.skin} unlocked`, "#c2b0ff");
      sfx("unlock");
    } else g.reward(reward.kind, reward.amt, el);
  };
  return (
    <Asset title="Season Pass · Bull Run" code="G-21" tags="season pass battle pass tiers track horizontal scroll drag momentum premium free rewards" span={12} badge="Monetization">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-flame to-bear text-2xl shadow-[0_4px_0_#9a1f2e]">🐂</div>
          <div>
            <div className="font-display text-lg font-black text-white">Season 3 · Bull Run</div>
            <div className="text-xs font-semibold text-ink-400">
              Tier {reached} · {seasonXP} season XP · ends in 12d
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="ghost" size="iconSm" onClick={() => sc.current?.scrollBy({ left: -COL * 3, behavior: "smooth" })}>
            <Icon name="chevronLeft" size={16} stroke={3} />
          </Btn>
          <Btn variant="ghost" size="iconSm" onClick={() => sc.current?.scrollBy({ left: COL * 3, behavior: "smooth" })}>
            <Icon name="chevronRight" size={16} stroke={3} />
          </Btn>
          <Btn
            variant={premium ? "bull" : "violet"}
            size="sm"
            className={premium ? "" : "sheen"}
            onClick={(e) => {
              if (premium) return;
              setPremium(true);
              sfx("levelup");
              fx.burst(e.currentTarget, { colors: ["#9170ff", "#ffc23d", "#fff"], count: 40, spread: 140 });
            }}
          >
            {premium ? <><Icon name="check" size={14} stroke={3} /> Premium active</> : <>👑 Unlock Premium</>}
          </Btn>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#152a55] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#142850] to-transparent" />
        <div
          ref={sc}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClickCapture={(e) => {
            if (st.current.moved) {
              e.stopPropagation();
              e.preventDefault();
              st.current.moved = false;
            }
          }}
          className="no-scrollbar cursor-grab overflow-x-auto pb-2 active:cursor-grabbing"
        >
          <div className="relative flex w-max select-none gap-3 px-2" style={{ paddingTop: 4 }}>
            <div className="absolute left-2 right-2 top-[138px] h-3 rounded-full bg-ink-950 shadow-[inset_0_2px_4px_rgba(0,0,0,.6)]" />
            <div className="absolute left-2 top-[138px] h-3 rounded-full bg-gradient-to-r from-bull via-cyan to-azure shadow-[0_0_12px_#22d39a]" style={{ width: (reached - 1 + frac) * COL + 48 }} />
            {PASS.map((p) => {
              const got = p.t <= reached;
              const fk = `f${p.t}`;
              const pk = `p${p.t}`;
              const fDone = claimed.includes(fk);
              const pDone = claimed.includes(pk);
              return (
                <div key={p.t} className="relative flex w-24 shrink-0 flex-col items-center gap-3">
                  <button
                    disabled={!got || fDone}
                    onClick={(e) => claim(fk, p.free, e.currentTarget)}
                    className={cn(
                      "relative flex h-28 w-24 flex-col items-center justify-center rounded-2xl border-2 transition",
                      fDone ? "border-bull/30 bg-bull/10" : got ? "border-gold bg-gold/10 shadow-[0_0_18px_rgba(255,194,61,.3)] hover:-translate-y-1" : "border-ink-600 bg-ink-850",
                    )}
                  >
                    <span className="absolute left-2 top-1.5 text-[9px] font-black uppercase text-ink-400">Free</span>
                    <span className={cn(!got && "opacity-50 grayscale")}>
                      <Glyph kind={p.free.kind} size={32} />
                    </span>
                    <span className="mt-1 font-display text-xs font-black text-white">{p.free.amt}</span>
                    {fDone && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-950/50">
                        <Icon name="check" size={24} stroke={3.5} className="text-bull" />
                      </span>
                    )}
                    {got && !fDone && <span className="absolute -top-2 rounded-md bg-gold px-1.5 text-[9px] font-black text-ink-950">CLAIM</span>}
                  </button>
                  <div className={cn("z-[1] flex h-8 w-8 items-center justify-center rounded-full font-display text-xs font-black ring-4 ring-[#13244a]", got ? "bg-bull text-ink-950" : "bg-ink-700 text-ink-400")}>{p.t}</div>
                  <button
                    disabled={!got || pDone || !premium}
                    onClick={(e) => claim(pk, p.prem as { kind: Currency; amt: number } | { skin: string }, e.currentTarget)}
                    className={cn(
                      "relative flex h-28 w-24 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 transition",
                      pDone ? "border-violet/30 bg-violet/10" : premium && got ? "border-violet bg-violet/15 shadow-[0_0_18px_rgba(145,112,255,.4)] hover:-translate-y-1" : "border-ink-600 bg-gradient-to-b from-ink-800 to-ink-850",
                    )}
                  >
                    <span className="absolute left-2 top-1.5 text-[9px] font-black uppercase text-violet">👑 Pro</span>
                    {"skin" in p.prem ? <span className={cn("text-3xl", !premium && "opacity-50")}>{p.prem.skin}</span> : <span className={cn(!premium && "opacity-50")}><Glyph kind={p.prem.kind} size={32} /></span>}
                    <span className="mt-1 font-display text-xs font-black text-white">{"skin" in p.prem ? "Skin" : p.prem.amt}</span>
                    {!premium && (
                      <span className="absolute bottom-1.5 right-1.5 text-ink-400">
                        <Icon name="lock" size={12} stroke={3} />
                      </span>
                    )}
                    {pDone && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink-950/50">
                        <Icon name="check" size={24} stroke={3.5} className="text-violet" />
                      </span>
                    )}
                    {"skin" in p.prem && premium && <span className="sheen absolute inset-0" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] font-bold text-ink-500">Drag with mouse (momentum) · swipe on touch · arrows to jump</div>
    </Asset>
  );
}

export default function Rewards() {
  return (
    <>
      <SpinWheel />
      <LootChest />
      <ScratchCard />
      <DailyLogin />
      <SeasonPass />
    </>
  );
}
