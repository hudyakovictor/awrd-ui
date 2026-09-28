import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Coin, Confetti, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { useRafLoop, useSpring, useVisible } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 *  GAME FEEL & TRANSITIONS — how screens connect and how hits land.
 *  Shared-element FLIP, five screen transitions, loot reveal choreography,
 *  combo hit-stop, swipeable notifications, gooey tabs and a zoomable world map.
 * =============================================================================*/

/* =============================================================================
 * 1. Shared-element transition — the card becomes the detail page (FLIP).
 * ============================================================================*/
const COURSES = [
  { title: "Candlestick Mastery", sub: "12 lessons · 48 min", icon: "candles", color: "#22d38a", progress: 64 },
  { title: "Risk & Sizing", sub: "9 lessons · 36 min", icon: "shield", color: "#3da5ff", progress: 30 },
  { title: "Market Psychology", sub: "8 lessons · 30 min", icon: "heart", color: "#ff4b6e", progress: 12 },
  { title: "DeFi Deep Dive", sub: "11 lessons · 52 min", icon: "layers", color: "#9b6bff", progress: 0 },
];

function SharedElement() {
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<{ i: number; x: number; y: number; w: number; h: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const openCard = (i: number) => {
    const c = box.current!.getBoundingClientRect();
    const r = cards.current[i]!.getBoundingClientRect();
    setOpen({ i, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height });
    setExpanded(false);
    // First frame: overlay sits exactly on the card. Next frame: animate to full size.
    requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
  };
  const close = () => {
    setExpanded(false);
    window.setTimeout(() => setOpen(null), 460);
  };
  const c = open ? COURSES[open.i] : null;

  return (
    <Asset code="GFL-01" title="Shared-Element Transition" desc="Tap a course: the card itself grows into the detail screen (FLIP — measure first, then invert and play). Close reverses into the exact origin card." tags={["FLIP", "shared element", "continuity"]} span={2}>
      <div ref={box} className="relative h-[360px] rounded-[22px] panel overflow-hidden p-3">
        <div className="grid grid-cols-2 gap-3 h-full">
          {COURSES.map((co, i) => (
            <button
              key={co.title}
              ref={(n) => { cards.current[i] = n; }}
              onClick={() => openCard(i)}
              className="relative rounded-2xl p-4 text-left overflow-hidden transition-transform active:scale-[.97]"
              style={{ background: `linear-gradient(150deg, ${co.color}44, #0f1b3a 65%)`, border: `1px solid ${co.color}55`, opacity: open?.i === i ? 0 : 1 }}
            >
              <Icon name={co.icon} size={70} stroke={1.2} className="absolute -right-3 -bottom-3 opacity-15" />
              <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${co.color}33`, color: co.color }}><Icon name={co.icon} size={20} /></div>
              <div className="font-black mt-3 leading-tight">{co.title}</div>
              <div className="text-[10px] text-mist">{co.sub}</div>
            </button>
          ))}
        </div>
        {open && c && (
          <div
            className="absolute rounded-2xl overflow-hidden z-20"
            style={{
              left: expanded ? 0 : open.x, top: expanded ? 0 : open.y,
              width: expanded ? "100%" : open.w, height: expanded ? "100%" : open.h,
              borderRadius: expanded ? 22 : 16,
              background: `linear-gradient(160deg, ${c.color}55, #0b1532 60%)`,
              border: `1px solid ${c.color}66`,
              transition: "all .45s cubic-bezier(.2,.9,.25,1)",
            }}
          >
            <Icon name={c.icon} size={expanded ? 220 : 70} stroke={1.2} className="absolute -right-6 -bottom-6 opacity-15 transition-all duration-500" />
            <div className="relative h-full p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="rounded-2xl grid place-items-center transition-all duration-500" style={{ width: expanded ? 56 : 40, height: expanded ? 56 : 40, background: `${c.color}33`, color: c.color }}><Icon name={c.icon} size={expanded ? 28 : 20} /></div>
                <button onClick={close} className={cn("w-9 h-9 rounded-xl bg-white/10 grid place-items-center transition-opacity duration-300", expanded ? "opacity-100 delay-200" : "opacity-0")} aria-label="Close"><Icon name="x" size={16} /></button>
              </div>
              <div className="font-black mt-3 transition-all duration-500" style={{ fontSize: expanded ? 26 : 16 }}>{c.title}</div>
              <div className="text-xs text-mist">{c.sub}</div>
              <div className={cn("mt-4 space-y-2 transition-all duration-500", expanded ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-4")}>
                <div className="flex items-center gap-2"><Bar value={c.progress} color="bull" h={8} className="flex-1" /><span className="num text-[10px] font-black">{c.progress}%</span></div>
                {["Anatomy of a candle", "Wicks & rejection", "Engulfing patterns"].map((l, k) => (
                  <div key={l} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20" style={{ transitionDelay: `${200 + k * 60}ms` }}>
                    <span className="num text-[10px] text-mist w-5">0{k + 1}</span><span className="text-xs font-bold flex-1">{l}</span>
                    <Icon name={k === 0 ? "check" : k === 1 ? "play" : "lock"} size={14} className={k === 0 ? "text-bull" : k === 1 ? "text-sky" : "text-mist"} />
                  </div>
                ))}
              </div>
              <div className={cn("mt-auto transition-all duration-500", expanded ? "opacity-100 delay-300" : "opacity-0")}><Btn variant="bull" block icon="play">Continue course</Btn></div>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 2. Screen transitions — five navigation styles on the same two screens.
 * ============================================================================*/
type TransitionKind = "slide" | "zoom" | "flip" | "iris" | "dissolve";

function MiniScreen({ which }: { which: 0 | 1 }) {
  if (which === 0) return (
    <div className="absolute inset-0 p-3 pt-9 bg-ink-900">
      <div className="text-[9px] font-black text-mist">UNIT 3</div>
      <div className="text-sm font-black mb-2">Candlestick Patterns</div>
      {["Hammer", "Engulfing", "Doji", "Morning star"].map((l, i) => (
        <div key={l} className="flex items-center gap-2 p-2 mb-1.5 rounded-xl game-surface">
          <span className={cn("w-6 h-6 rounded-lg grid place-items-center", i === 0 ? "bg-bull/20 text-bull" : "bg-white/5 text-mist")}><Icon name={i === 0 ? "check" : "play"} size={12} /></span>
          <span className="text-[10px] font-bold">{l}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="absolute inset-0 p-3 pt-9" style={{ background: "linear-gradient(170deg,#0f473b,#0a1330 60%)" }}>
      <div className="text-[9px] font-black text-bull">LESSON 2</div>
      <div className="text-sm font-black">Bullish Engulfing</div>
      <svg viewBox="0 0 80 60" className="w-full h-24 my-2">
        <line x1="28" x2="28" y1="12" y2="48" stroke="#ff4b6e" strokeWidth="2" /><rect x="22" y="20" width="12" height="18" rx="2" fill="#ff4b6e" />
        <line x1="50" x2="50" y1="6" y2="54" stroke="#22d38a" strokeWidth="2" /><rect x="42" y="12" width="16" height="32" rx="2" fill="#22d38a" />
      </svg>
      <p className="text-[9px] text-fog/75">A large green body fully swallows the previous red one — buyers took control.</p>
      <div className="absolute bottom-3 inset-x-3 h-8 rounded-xl bg-bull text-ink-900 text-[9px] font-black grid place-items-center">CONTINUE</div>
    </div>
  );
}

function ScreenTransitions() {
  const [kind, setKind] = useState<TransitionKind>("slide");
  const [screen, setScreen] = useState<0 | 1>(0);
  const style = (which: 0 | 1): React.CSSProperties => {
    const on = which === screen;
    const forward = screen === 1;
    const base = { transition: "all .55s cubic-bezier(.2,.9,.25,1)" } as React.CSSProperties;
    switch (kind) {
      case "slide": return { ...base, transform: `translate3d(${on ? 0 : which === 1 ? 100 : -30}%,0,0)`, filter: on ? "none" : "brightness(.6)", zIndex: which };
      case "zoom": return { ...base, transform: `scale(${on ? 1 : which === 1 ? 1.15 : 0.88})`, opacity: on ? 1 : 0, zIndex: on ? 2 : 1 };
      case "flip": return { ...base, transform: `rotateY(${on ? 0 : which === 1 ? 180 : -180}deg)`, backfaceVisibility: "hidden", zIndex: on ? 2 : 1 };
      case "iris": return { ...base, clipPath: on ? "circle(150% at 50% 85%)" : "circle(0% at 50% 85%)", zIndex: on ? 2 : 1, transition: on ? "clip-path .65s cubic-bezier(.2,.9,.25,1)" : "clip-path .65s cubic-bezier(.2,.9,.25,1) .05s" };
      case "dissolve": return { ...base, opacity: on ? 1 : 0, filter: on ? "blur(0)" : `blur(${forward ? 8 : 6}px)`, zIndex: on ? 2 : 1 };
    }
  };
  return (
    <Asset code="GFL-02" title="Screen Transitions" desc="The same two screens with five navigation styles: slide with parallax, zoom-through, 3D flip, iris wipe from the CTA, and blur dissolve. Pick one, then tap Continue / Back." tags={["navigation", "5 styles", "3D"]}>
      <div className="flex gap-4 items-center">
        <div className="phone !w-[170px] shrink-0">
          <div className="phone-screen" style={{ perspective: 800 }}>
            <div className="absolute inset-0" style={style(0)}><MiniScreen which={0} /></div>
            <div className="absolute inset-0" style={style(1)}><MiniScreen which={1} /></div>
            <button onClick={() => setScreen(screen ? 0 : 1)} className="absolute bottom-3 inset-x-3 h-8 rounded-xl z-10 opacity-0" aria-label="Navigate" />
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {(["slide", "zoom", "flip", "iris", "dissolve"] as TransitionKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={cn("w-full h-9 rounded-xl text-[10px] font-black uppercase border-2 transition-all", kind === k ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist hover:text-fog")}>{k}</button>
          ))}
          <Btn variant={screen ? "ghost" : "bull"} size="sm" block icon={screen ? "chevL" : "chevR"} onClick={() => setScreen(screen ? 0 : 1)}>{screen ? "Back" : "Continue"}</Btn>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 3. Loot reveal — charge, burst, rarity beam, card flip. Odds are disclosed.
 * ============================================================================*/
const RARITY = [
  { name: "Common", color: "#6dbbff", chance: 0.6, item: "Chart skin: Ocean", icon: "chart" },
  { name: "Rare", color: "#b394ff", chance: 0.28, item: "Avatar frame: Nebula", icon: "user" },
  { name: "Epic", color: "#ffc53d", chance: 0.1, item: "Title: Risk Master", icon: "crown" },
  { name: "Legendary", color: "#ff8a3d", chance: 0.02, item: "Golden bull mascot", icon: "trophy" },
];

function LootReveal() {
  const [phase, setPhase] = useState<"idle" | "charge" | "burst" | "reveal">("idle");
  const [rarity, setRarity] = useState(0);
  const [pulls, setPulls] = useState(0);
  const [pity, setPity] = useState(0);
  const [burstN, setBurstN] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const open = () => {
    if (phase === "charge" || phase === "burst") return;
    let roll = Math.random();
    let r = 0;
    for (let i = 0; i < RARITY.length; i++) { if (roll < RARITY[i].chance) { r = i; break; } roll -= RARITY[i].chance; }
    if (pity >= 9 && r < 2) r = 2; // transparent guarantee: Epic+ within 10 opens
    setRarity(r);
    setPulls((p) => p + 1);
    setPity(r >= 2 ? 0 : pity + 1);
    setPhase("charge");
    timers.current.push(window.setTimeout(() => { setPhase("burst"); navigator.vibrate?.(r >= 2 ? [30, 40, 80] : 20); }, 1200));
    timers.current.push(window.setTimeout(() => { setPhase("reveal"); if (r >= 1) setBurstN((b) => b + 1); }, 1650));
  };
  const R = RARITY[rarity];

  return (
    <Asset code="GFL-03" title="Loot Reveal" desc="A four-beat reveal: the box charges and shakes harder, bursts with a flash, a rarity-coloured beam spins, then the item card drops in. Odds and the 10-open guarantee are always visible." tags={["reveal", "rarity", "ethical odds"]}>
      <div className="relative h-72 rounded-[22px] overflow-hidden bg-ink-950 grid place-items-center">
        <Confetti burst={burstN} count={rarity >= 2 ? 50 : 26} />
        {(phase === "burst" || phase === "reveal") && (
          <div className="absolute left-1/2 top-1/2 w-[520px] h-[520px] -ml-[260px] -mt-[260px]" style={{ background: `repeating-conic-gradient(${R.color}55 0 9deg, transparent 9deg 24deg)`, animation: "spin 9s linear infinite", maskImage: "radial-gradient(circle,#000 10%,transparent 60%)", WebkitMaskImage: "radial-gradient(circle,#000 10%,transparent 60%)" }} />
        )}
        {phase === "burst" && <div className="absolute inset-0 bg-white" style={{ animation: "glow .45s ease-out forwards", opacity: 0 }} />}
        {phase !== "reveal" ? (
          <button onClick={open} className="relative" style={{ animation: phase === "charge" ? "chestShake .18s linear infinite" : phase === "idle" ? "float 2.6s ease-in-out infinite" : undefined }} aria-label="Open loot box">
            <div className="w-28 h-28 rounded-[28px] grid place-items-center relative" style={{ background: "linear-gradient(180deg,#a886ff,#6b3fd9)", boxShadow: `0 8px 0 #3b1f8c, inset 0 3px 0 rgba(255,255,255,.35), 0 0 ${phase === "charge" ? 50 : 20}px ${phase === "charge" ? R.color : "#9b6bff"}`, transition: "box-shadow .8s" }}>
              <div className="absolute inset-x-0 top-1/2 h-4 -mt-2 bg-gold" />
              <div className="absolute inset-y-0 left-1/2 w-4 -ml-2 bg-gold" />
              <Icon name="gift" size={40} className="relative text-white" />
            </div>
          </button>
        ) : (
          <div className="relative text-center" style={{ animation: "bounceIn .6s cubic-bezier(.2,.9,.3,1.2) both" }}>
            <div className="w-40 rounded-3xl p-4 mx-auto" style={{ background: `linear-gradient(170deg, ${R.color}66, #0f1b3a 70%)`, border: `2px solid ${R.color}`, boxShadow: `0 0 40px ${R.color}66, 0 8px 0 #040916` }}>
              <div className="text-[9px] uppercase tracking-[.2em] font-black" style={{ color: R.color }}>{R.name}</div>
              <div className="w-16 h-16 rounded-2xl mx-auto my-3 grid place-items-center" style={{ background: `${R.color}33`, color: R.color }}><Icon name={R.icon} size={32} /></div>
              <div className="text-sm font-black leading-tight">{R.item}</div>
            </div>
            <Btn variant="violet" size="sm" className="mt-4" icon="refresh" onClick={open}>Open another</Btn>
          </div>
        )}
        {phase === "idle" && <div className="absolute bottom-4 text-[10px] uppercase tracking-widest font-black text-mist">Tap the box</div>}
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-3">
        {RARITY.map((r, i) => (
          <div key={r.name} className={cn("rounded-lg p-1.5 text-center border transition-all", phase === "reveal" && i === rarity ? "scale-105" : "")} style={{ borderColor: `${r.color}55`, background: `${r.color}14` }}>
            <div className="text-[8px] font-black" style={{ color: r.color }}>{r.name}</div>
            <div className="num text-[10px] font-black">{Math.round(r.chance * 100)}%</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[9px] text-mist">
        <span>Opens <b className="num text-fog">{pulls}</b></span>
        <Bar value={(pity / 10) * 100} color="gold" h={5} className="flex-1" shine={false} />
        <span>Epic guaranteed in <b className="num text-gold">{10 - pity}</b></span>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 4. Combo meter — hit-stop, tiered shake, decaying multiplier.
 * ============================================================================*/
const TIERS = [{ at: 0, name: "", color: "#8ea3cf", mult: 1 }, { at: 5, name: "NICE", color: "#22d38a", mult: 2 }, { at: 12, name: "GREAT", color: "#3da5ff", mult: 3 }, { at: 20, name: "INSANE", color: "#ffc53d", mult: 5 }, { at: 32, name: "GODLIKE", color: "#ff8a3d", mult: 8 }];

function ComboMeter() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const [combo, setCombo] = useState(0);
  const [meter, setMeter] = useState(0);
  const [score, setScore] = useState(0);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; v: number; c: string }[]>([]);
  const [broken, setBroken] = useState<number | null>(null);
  const shake = useRef(0);
  const frozen = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const tier = [...TIERS].reverse().find((t) => combo >= t.at) ?? TIERS[0];

  useRafLoop((_, dt) => {
    // hit-stop: freeze decay for a few frames after each hit
    if (frozen.current > 0) { frozen.current -= dt; return; }
    if (combo > 0) {
      setMeter((m) => {
        const next = m - dt / 1.6;
        if (next <= 0) { setBroken(combo); setCombo(0); return 0; }
        return next;
      });
    }
    shake.current = Math.max(0, shake.current - dt * 6);
    if (stage.current) stage.current.style.transform = shake.current > 0 ? `translate3d(${(Math.random() - 0.5) * 14 * shake.current}px, ${(Math.random() - 0.5) * 10 * shake.current}px, 0)` : "none";
  }, visible);

  const hit = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const next = combo + 1;
    const t = [...TIERS].reverse().find((x) => next >= x.at) ?? TIERS[0];
    const v = 10 * t.mult;
    setCombo(next);
    setMeter(1);
    setScore((s) => s + v);
    setBroken(null);
    frozen.current = 0.05 + t.mult * 0.008;
    shake.current = Math.min(1, 0.25 + t.mult * 0.1);
    setPops((p) => [...p.slice(-8), { id: Date.now() + Math.random(), x: e.clientX - r.left, y: e.clientY - r.top, v, c: t.color }]);
    navigator.vibrate?.(t.mult >= 3 ? 14 : 6);
  };

  return (
    <Asset code="GFL-04" title="Combo Meter" desc="Tap fast. Each hit adds a hit-stop freeze, screen shake that scales with the tier, and floating damage numbers. Stop for 1.6s and the combo breaks." tags={["hit-stop", "shake", "tiers"]}>
      <div ref={box}>
        <div ref={stage} className="relative h-56 rounded-[22px] overflow-hidden select-none touch-none cursor-pointer" style={{ background: `radial-gradient(circle at 50% 60%, ${tier.color}33, #070e22 70%)` }} onPointerDown={hit}>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div key={combo} className="num text-6xl font-black" style={{ color: tier.color, animation: combo ? "scorePop .25s cubic-bezier(.2,.9,.3,1.4)" : undefined, textShadow: `0 0 30px ${tier.color}88` }}>{combo || "TAP"}</div>
              {tier.name && <div key={tier.name} className="text-lg font-black tracking-[.2em] anim-pop" style={{ color: tier.color }}>{tier.name} ×{tier.mult}</div>}
              {broken !== null && combo === 0 && <div className="text-sm font-black text-bear anim-rise">Combo broken at {broken}</div>}
            </div>
          </div>
          {pops.map((p) => <span key={p.id} className="absolute num font-black text-lg pointer-events-none" style={{ left: p.x, top: p.y, color: p.c, animation: "riseOut .8s ease-out forwards" }}>+{p.v}</span>)}
          <div className="absolute bottom-3 inset-x-3 h-2.5 rounded-full bg-black/40 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${meter * 100}%`, background: tier.color, boxShadow: `0 0 12px ${tier.color}` }} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-[10px] text-mist">Score <b className="num text-fog">{score.toLocaleString()}</b></span>
        <div className="flex gap-1">{TIERS.slice(1).map((t) => <span key={t.name} className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: combo >= t.at ? t.color : "#172856", color: combo >= t.at ? "#07122d" : "#4b5f8f" }}>{t.at}+</span>)}</div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 5. Swipeable notifications — stacked, expandable, swipe to dismiss.
 * ============================================================================*/
type Note = { id: number; title: string; text: string; icon: string; color: string };
const NOTE_POOL: Omit<Note, "id">[] = [
  { title: "Streak saved", text: "You kept a 13-day streak alive.", icon: "flame", color: "#ff8a3d" },
  { title: "Price alert", text: "BTC crossed $68,000.", icon: "bell", color: "#3da5ff" },
  { title: "League update", text: "You moved up to #3 in Amethyst.", icon: "trophy", color: "#ffc53d" },
  { title: "Challenge", text: "Mia challenged you to Pattern Sprint.", icon: "bolt", color: "#9b6bff" },
  { title: "Lesson ready", text: "Unit 4 · Volume is unlocked.", icon: "book", color: "#22d38a" },
];

function SwipeNotifications() {
  const [notes, setNotes] = useState<Note[]>(NOTE_POOL.slice(0, 4).map((n, i) => ({ ...n, id: i + 1 })));
  const [expanded, setExpanded] = useState(false);
  const [drag, setDrag] = useState<{ id: number; dx: number } | null>(null);
  const [leaving, setLeaving] = useState<{ id: number; dir: number } | null>(null);
  const start = useRef(0);
  const moved = useRef(false);

  const dismiss = (id: number, dir: number) => {
    setLeaving({ id, dir });
    window.setTimeout(() => { setNotes((n) => n.filter((x) => x.id !== id)); setLeaving(null); }, 260);
  };
  const add = () => setNotes((n) => [{ ...NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)], id: Date.now() }, ...n].slice(0, 6));
  const H = 64;

  return (
    <Asset code="GFL-05" title="Notification Stack" desc="iOS-style grouped notifications: collapsed as a depth stack, tap to fan out into a list, swipe any card sideways past 90px to dismiss; the rest reflow smoothly." tags={["stack", "swipe dismiss", "expand"]}>
      <div className="relative rounded-[22px] panel p-3 overflow-hidden" style={{ height: 330 }}>
        {notes.length === 0 && <div className="absolute inset-0 grid place-items-center text-xs text-mist">All caught up ✨</div>}
        {notes.map((n, i) => {
          const d = drag?.id === n.id ? drag.dx : 0;
          const leave = leaving?.id === n.id ? leaving.dir : 0;
          const y = expanded ? i * (H + 8) : Math.min(i, 2) * 10;
          const scale = expanded ? 1 : 1 - Math.min(i, 2) * 0.05;
          const hidden = !expanded && i > 2;
          return (
            <div
              key={n.id}
              onPointerDown={(e) => { start.current = e.clientX; moved.current = false; setDrag({ id: n.id, dx: 0 }); e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => { if (drag?.id !== n.id) return; const dx = e.clientX - start.current; if (Math.abs(dx) > 6) moved.current = true; setDrag({ id: n.id, dx }); }}
              onPointerUp={() => {
                const dx = drag?.dx ?? 0;
                setDrag(null);
                if (Math.abs(dx) > 90) dismiss(n.id, Math.sign(dx));
                else if (!moved.current) setExpanded((x) => !x);
              }}
              className="absolute left-3 right-3 rounded-2xl p-3 flex items-center gap-3 glass cursor-grab active:cursor-grabbing touch-pan-y select-none"
              style={{
                top: 12, height: H, zIndex: 50 - i,
                transform: `translate3d(${leave ? leave * 400 : d}px, ${y}px, 0) scale(${scale})`,
                opacity: hidden ? 0 : 1 - Math.min(1, Math.abs(d) / 220),
                transition: drag?.id === n.id ? "none" : "transform .4s cubic-bezier(.2,.9,.3,1.1), opacity .3s",
                pointerEvents: hidden ? "none" : "auto",
              }}
            >
              <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${n.color}26`, color: n.color }}><Icon name={n.icon} size={19} /></span>
              <div className="min-w-0 flex-1"><div className="text-xs font-black">{n.title}</div><div className="text-[10px] text-mist truncate">{n.text}</div></div>
              <span className="text-[9px] text-mist">now</span>
              {!expanded && i === 0 && notes.length > 1 && <span className="absolute -top-2 -right-1 min-w-5 h-5 px-1 rounded-full bg-bear text-[9px] font-black grid place-items-center">{notes.length}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        <Btn variant="sky" size="xs" icon="plus" onClick={add}>New alert</Btn>
        <Btn variant="ghost" size="xs" onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</Btn>
        <Btn variant="ghost" size="xs" onClick={() => setNotes([])}>Clear all</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 6. Gooey tab bar — liquid blob indicator via SVG goo filter.
 * ============================================================================*/
const GOO_TABS = [
  { icon: "home", label: "Home", color: "#3da5ff" },
  { icon: "book", label: "Learn", color: "#22d38a" },
  { icon: "bolt", label: "Arena", color: "#9b6bff" },
  { icon: "trophy", label: "League", color: "#ffc53d" },
  { icon: "user", label: "Me", color: "#ff8a3d" },
];

function GooeyTabs() {
  const [active, setActive] = useState(0);
  const lead = useSpring(active, 320, 24);
  const trail = useSpring(active, 90, 16);
  const W = 64;
  return (
    <Asset code="GFL-06" title="Gooey Tab Bar" desc="Two circles chase the selected tab at different spring stiffness; an SVG goo filter fuses them into one liquid blob that stretches and snaps between tabs." tags={["goo filter", "springs", "tab bar"]}>
      <svg width="0" height="0" className="absolute">
        <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" /><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" /></filter>
      </svg>
      <div className="well dotgrid rounded-[22px] h-56 flex flex-col justify-end items-center p-4">
        <div key={active} className="mb-auto mt-6 text-center anim-rise">
          <span style={{ color: GOO_TABS[active].color }}><Icon name={GOO_TABS[active].icon} size={40} className="mx-auto" /></span>
          <div className="font-black mt-2">{GOO_TABS[active].label}</div>
        </div>
        <div className="relative rounded-full bg-ink-800 border border-white/10 shadow-[0_6px_0_#060c1f]" style={{ width: W * GOO_TABS.length + 16, height: 64 }}>
          <div className="absolute inset-0" style={{ filter: "url(#goo)" }}>
            <span className="absolute top-2 w-12 h-12 rounded-full" style={{ left: 8 + lead * W + (W - 48) / 2, background: GOO_TABS[active].color, transition: "background .3s" }} />
            <span className="absolute top-3 w-10 h-10 rounded-full" style={{ left: 8 + trail * W + (W - 40) / 2, background: GOO_TABS[active].color, transition: "background .3s" }} />
          </div>
          <div className="absolute inset-0 flex px-2">
            {GOO_TABS.map((t, i) => (
              <button key={t.label} onClick={() => setActive(i)} className="relative h-full grid place-items-center" style={{ width: W }} aria-label={t.label}>
                <span style={{ color: i === active ? "#07122d" : "#8ea3cf", transform: i === active ? "translateY(-1px) scale(1.08)" : "none", transition: "all .3s" }}><Icon name={t.icon} size={21} stroke={2.4} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 7. World map zoom — spring camera flies into regions.
 * ============================================================================*/
const REGIONS = [
  { id: "basics", name: "Basics Bay", x: 18, y: 64, r: 13, color: "#3da5ff", icon: "book", done: 8, total: 8 },
  { id: "candles", name: "Candle Cliffs", x: 40, y: 38, r: 14, color: "#22d38a", icon: "candles", done: 5, total: 9 },
  { id: "risk", name: "Risk Ridge", x: 66, y: 60, r: 12, color: "#ffc53d", icon: "shield", done: 0, total: 7 },
  { id: "defi", name: "DeFi Delta", x: 82, y: 28, r: 11, color: "#9b6bff", icon: "layers", done: 0, total: 11 },
];

function WorldMapZoom() {
  const [focus, setFocus] = useState<number | null>(null);
  const tx = focus === null ? 50 : REGIONS[focus].x;
  const ty = focus === null ? 50 : REGIONS[focus].y;
  const tz = focus === null ? 1 : 2.6;
  const x = useSpring(tx, 90, 18);
  const y = useSpring(ty, 90, 18);
  const z = useSpring(tz, 90, 18);
  const R = focus === null ? null : REGIONS[focus];
  return (
    <Asset code="GFL-07" title="World Map Zoom" desc="Tap a region and a spring-driven camera flies in (position and zoom on separate springs for a natural arc). Nodes reveal at close range; Overview flies back out." tags={["camera", "zoom", "spring"]} span={2}>
      <div className="relative h-80 rounded-[22px] overflow-hidden" style={{ background: "radial-gradient(circle at 50% 50%, #0f2c5c, #061126 75%)" }}>
        <div className="absolute inset-0" style={{ transform: `translate3d(${(50 - x) * z}%, ${(50 - y) * z}%, 0) scale(${z})`, transformOrigin: "50% 50%" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M18,64 C28,52 30,44 40,38 S58,56 66,60 S76,34 82,28" fill="none" stroke="#2b4380" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          </svg>
          {REGIONS.map((r, i) => (
            <button key={r.id} onClick={() => setFocus(focus === i ? null : i)} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%] grid place-items-center" style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.r * 2}%`, aspectRatio: "1", background: `radial-gradient(circle at 35% 30%, ${r.color}88, ${r.color}33 60%, transparent 72%)`, animation: "floatSlow 6s ease-in-out infinite", animationDelay: `${i * 0.7}s` }} aria-label={r.name}>
              <span style={{ color: r.color, transform: `scale(${1 / Math.max(1, z * 0.7)})` }}><Icon name={r.icon} size={22} /></span>
              {Array.from({ length: 5 }).map((_, k) => {
                const a = (k / 5) * Math.PI * 2;
                return <span key={k} className="absolute w-[14%] aspect-square rounded-full border border-white/30 transition-opacity duration-500" style={{ left: `${50 + Math.cos(a) * 34}%`, top: `${50 + Math.sin(a) * 34}%`, transform: "translate(-50%,-50%)", background: k < Math.round((r.done / r.total) * 5) ? r.color : "#172856", opacity: z > 1.8 ? 1 : 0 }} />;
              })}
            </button>
          ))}
        </div>
        <div className="absolute top-3 left-3 glass rounded-xl px-3 py-1.5 text-[10px] font-black">{R ? R.name : "Bullrun World"} · <span className="num text-sky">{z.toFixed(1)}×</span></div>
        {R && (
          <div key={R.id} className="absolute bottom-3 left-3 right-3 panel !rounded-2xl p-3 flex items-center gap-3 anim-rise">
            <span className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${R.color}26`, color: R.color }}><Icon name={R.icon} size={20} /></span>
            <div className="flex-1"><div className="text-sm font-black">{R.name}</div><Bar value={(R.done / R.total) * 100} color="bull" h={6} className="mt-1" shine={false} /></div>
            <span className="num text-[10px] font-black text-mist">{R.done}/{R.total}</span>
            <Btn variant="ghost" size="xs" icon="search" onClick={() => setFocus(null)}>Overview</Btn>
          </div>
        )}
        {!R && <div className="absolute bottom-3 inset-x-0 text-center text-[9px] uppercase tracking-widest font-black text-mist">tap a region</div>}
      </div>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {REGIONS.map((r, i) => <button key={r.id} onClick={() => setFocus(i)} className={cn("h-8 px-3 rounded-full text-[10px] font-black border-2 flex items-center gap-1.5 transition-all", focus === i ? "text-ink-900 border-transparent" : "border-ink-600 text-mist")} style={focus === i ? { background: r.color } : undefined}><Coin sym={["BTC", "ETH", "SOL", "TON"][i]} size={16} />{r.name}</button>)}
      </div>
    </Asset>
  );
}

export default function GameFeel() {
  return (
    <Section id="game-feel" index="P6" title="Game Feel & Transitions" subtitle="How screens connect and how actions land: shared elements, screen transitions, loot choreography, hit-stop combos and a flying world camera.">
      <SharedElement />
      <ScreenTransitions />
      <LootReveal />
      <ComboMeter />
      <SwipeNotifications />
      <GooeyTabs />
      <WorldMapZoom />
    </Section>
  );
}
