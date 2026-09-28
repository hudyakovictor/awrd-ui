import { useEffect, useRef, useState } from "react";
import { Asset, Btn, Chip, Label } from "../../components/ui";
import { Icon, XPIcon } from "../../components/icons";
import { useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { usePointerParallax } from "../../lib/motion";
import { cn } from "../../utils/cn";

const TALK_CSS = `@keyframes talk{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}@keyframes squash{0%{transform:translateY(0) scale(1,1)}25%{transform:translateY(0) scale(1.15,.85)}55%{transform:translateY(-26px) scale(.92,1.1)}80%{transform:translateY(0) scale(1.08,.92)}100%{transform:translateY(0) scale(1,1)}}`;

/* =====================================================================
 * G-22 · MASCOT COACH — eyes track the cursor, tap to react
 * ===================================================================== */
type Mood = "happy" | "think" | "wow" | "sad";
const TIPS = [
  "Never risk more than you can afford to lose. Size your positions!",
  "A stop-loss is a seatbelt, not a sign of weakness.",
  "Trend is your friend — until it bends.",
  "Volume confirms moves. Price without volume is a whisper.",
  "Your streak is compounding like interest. Don't break the chain! 🔥",
];

function Toro({ mood, look, blush }: { mood: Mood; look: { x: number; y: number }; blush: number }) {
  const px = look.x * 4.5;
  const py = look.y * 3.5;
  return (
    <svg viewBox="0 0 120 124" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="toBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a5896" />
          <stop offset="1" stopColor="#1c3365" />
        </linearGradient>
        <linearGradient id="toFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1330" />
          <stop offset="1" stopColor="#050b1c" />
        </linearGradient>
        <linearGradient id="toHorn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="1" stopColor="#ffc23d" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="118" rx="30" ry="5" fill="#000" opacity=".35" />
      <path d="M22 38c-8-6-10-18-6-26 4 8 10 12 20 14M98 38c8-6 10-18 6-26-4 8-10 12-20 14" fill="url(#toHorn)" />
      <rect x="18" y="26" width="84" height="74" rx="30" fill="#0f1f45" transform="translate(0 5)" />
      <rect x="18" y="26" width="84" height="74" rx="30" fill="url(#toBody)" />
      <rect x="26" y="36" width="68" height="46" rx="20" fill="url(#toFace)" />
      <path d="M30 34h24" stroke="#fff" strokeOpacity=".25" strokeWidth="4" strokeLinecap="round" />
      {mood === "wow" ? (
        <>
          <circle cx={46 + px * 0.5} cy={56 + py * 0.5} r="8" fill="#2fd4ff" />
          <circle cx={74 + px * 0.5} cy={56 + py * 0.5} r="8" fill="#2fd4ff" />
          <circle cx={48 + px} cy={53 + py} r="2.4" fill="#fff" />
          <circle cx={76 + px} cy={53 + py} r="2.4" fill="#fff" />
          <ellipse cx="60" cy="72" rx="4.5" ry="5" fill="#2fd4ff" />
        </>
      ) : mood === "think" ? (
        <>
          <rect x="38" y="54" width="16" height="4" rx="2" fill="#2fd4ff" />
          <circle cx={74 + px * 0.6} cy={56 + py * 0.6} r="6.5" fill="#2fd4ff" />
          <path d="M52 72h16" stroke="#2fd4ff" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : mood === "sad" ? (
        <>
          <path d="M38 54q8 5 14 0M68 54q6 5 14 0" stroke="#2fd4ff" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50 74q10 -8 20 0" stroke="#ff4d6d" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M40 60 q-2 6 0 8" stroke="#2fd4ff" strokeWidth="2.5" fill="none" className="anim-glow" />
        </>
      ) : (
        <>
          <g style={{ transformOrigin: "60px 56px", animation: "blink 4.2s steps(1) infinite" }}>
            <circle cx={46 + px * 0.6} cy={56 + py * 0.6} r="6.5" fill="#2fd4ff" />
            <circle cx={74 + px * 0.6} cy={56 + py * 0.6} r="6.5" fill="#2fd4ff" />
            <circle cx={47.5 + px} cy={54 + py} r="2" fill="#fff" />
            <circle cx={75.5 + px} cy={54 + py} r="2" fill="#fff" />
          </g>
          <path d="M50 70q10 9 20 0" stroke="#22d39a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      <circle cx="34" cy="70" r="4.5" fill="#ff4d6d" opacity={0.25 + blush * 0.5} />
      <circle cx="86" cy="70" r="4.5" fill="#ff4d6d" opacity={0.25 + blush * 0.5} />
      <rect x="48" y="88" width="24" height="6" rx="3" fill="#22d39a" className="anim-glow" />
    </svg>
  );
}

export function MascotCoach() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<Mood>("happy");
  const [jump, setJump] = useState(0);
  const [hover, setHover] = useState(false);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let raf = 0;
    let pending: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const el = btnRef.current;
      if (!el || !pending) return;
      const r = el.getBoundingClientRect();
      const dx = pending.clientX - (r.left + r.width / 2);
      const dy = pending.clientY - (r.top + r.height * 0.45);
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(1, d / 180);
      setLook({ x: (dx / d) * m, y: (dy / d) * m });
    };
    const onMove = (e: PointerEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    setTyped("");
    let k = 0;
    const t = setInterval(() => {
      k++;
      setTyped(TIPS[i].slice(0, k));
      if (i > 0 && k % 3 === 0) sfx("tick", 1.4);
      if (k >= TIPS[i].length) clearInterval(t);
    }, 24);
    return () => clearInterval(t);
  }, [i]);
  const moods: Mood[] = ["happy", "wow", "think", "sad"];
  return (
    <Asset title="Mascot Coach · Toro" code="G-22" tags="mascot character coach tip speech bubble eyes follow cursor assistant" span={4}>
      <style>{TALK_CSS}</style>
      <div className="relative mb-2 min-h-[84px] rounded-2xl border-2 border-ink-600 bg-ink-800 p-3 shadow-[0_4px_0_#0b1838]">
        <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink-600 bg-ink-800" />
        <div className="text-sm font-bold leading-relaxed text-ink-100">
          {typed}
          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-cyan" style={{ animation: "blink 1s steps(1) infinite" }} />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          ref={btnRef}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onClick={() => {
            setJump((j) => j + 1);
            setMood((m) => moods[(moods.indexOf(m) + 1) % moods.length]);
            sfx("pop", 1.2);
          }}
          className="h-36 w-36"
          title="Tap me!"
        >
          <div key={jump} style={{ animation: jump ? "squash .6s cubic-bezier(.3,1.3,.5,1)" : undefined, transformOrigin: "50% 100%" }} className="h-full w-full">
            <div className="anim-float h-full w-full">
              <Toro mood={mood} look={look} blush={hover ? 1 : 0} />
            </div>
          </div>
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Label className="mb-0 mr-1">Mood</Label>
        {moods.map((m) => (
          <button key={m} onClick={() => { setMood(m); sfx("select"); }} className={cn("rounded-lg px-2 py-1 text-[11px] font-bold capitalize transition", mood === m ? "bg-cyan/20 text-cyan" : "text-ink-400 hover:text-white")}>
            {m}
          </button>
        ))}
        <Btn variant="azure" size="iconSm" className="ml-auto" onClick={() => setI((x) => (x + 1) % TIPS.length)} aria-label="Next tip">
          <Icon name="chevronRight" size={16} stroke={3} />
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-23 · STORY MODE — visual-novel dialogue with branching choices
 * ===================================================================== */
type Node = {
  who: "toro" | "ursa";
  text: string;
  next?: number;
  end?: boolean;
  choices?: { t: string; next: number; good: boolean }[];
};
const SCRIPT: Node[] = [
  { who: "toro", text: "Hey rookie! Bitcoin just pumped 12% in an hour. My feed is on fire! 🚀", next: 1 },
  { who: "ursa", text: "Careful… vertical pumps attract late buyers right before a pullback.", next: 2 },
  {
    who: "toro",
    text: "Your friends are posting gains everywhere. What's your move?",
    choices: [
      { t: "Buy now before it goes higher! 🚀", next: 3, good: false },
      { t: "Wait for a pullback & make a plan 🧠", next: 4, good: true },
      { t: "Short it — it must crash 🐻", next: 5, good: false },
    ],
  },
  { who: "ursa", text: "That's FOMO talking. Buying a spike without a plan is how accounts get rekt.", next: 6 },
  { who: "toro", text: "Smart! Patience plus a clear entry and stop-loss beats chasing candles.", next: 6 },
  { who: "ursa", text: "Fighting a strong trend with no signal? Brave… and very expensive.", next: 6 },
  { who: "ursa", text: "Lesson unlocked: FOMO — Fear Of Missing Out. Spot it, name it, beat it.", end: true },
];
const CAST = {
  toro: { name: "Toro", color: "#22d39a", side: "left" as const },
  ursa: { name: "Ursa", color: "#ff7a9a", side: "right" as const },
};

function Bust({ who, talking, active }: { who: "toro" | "ursa"; talking: boolean; active: boolean }) {
  const mouth = (
    <ellipse
      cx="60"
      cy="92"
      rx="9"
      ry="6"
      fill="#1a0409"
      style={{ transformOrigin: "60px 92px", animation: talking && active ? "talk .22s ease-in-out infinite" : undefined, transform: talking && active ? undefined : "scaleY(.25)" }}
    />
  );
  if (who === "toro")
    return (
      <svg viewBox="0 0 120 140" className="h-full w-full">
        <defs>
          <linearGradient id="bT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6bf0c0" />
            <stop offset="1" stopColor="#0c8f63" />
          </linearGradient>
        </defs>
        <path d="M18 34c-6-12-2-24 6-30 0 12 8 20 22 22M102 34c6-12 2-24-6-30 0 12-8 20-22 22" fill="#fff1c4" stroke="#d6a93a" strokeWidth="2" />
        <path d="M10 140 q0 -34 50 -34 q50 0 50 34Z" fill="#1c55c2" />
        <path d="M44 106 l16 14 l16 -14" fill="#fff" />
        <ellipse cx="60" cy="62" rx="44" ry="46" fill="url(#bT)" />
        <ellipse cx="60" cy="88" rx="24" ry="17" fill="#0a6b4a" />
        {mouth}
        <circle cx="52" cy="80" r="2.4" fill="#03281b" />
        <circle cx="68" cy="80" r="2.4" fill="#03281b" />
        <circle cx="44" cy="56" r="7" fill="#fff" />
        <circle cx="76" cy="56" r="7" fill="#fff" />
        <circle cx="45" cy="57" r="4" fill="#03281b" />
        <circle cx="77" cy="57" r="4" fill="#03281b" />
        <path d="M36 44 l14 3 M84 44 l-14 3" stroke="#03281b" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="30" cy="72" r="5" fill="#ff4d6d" opacity=".35" />
        <circle cx="90" cy="72" r="5" fill="#ff4d6d" opacity=".35" />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 140" className="h-full w-full">
      <defs>
        <linearGradient id="bU" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9ab0" />
          <stop offset="1" stopColor="#b31f3d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="26" r="15" fill="#b31f3d" />
      <circle cx="96" cy="26" r="15" fill="#b31f3d" />
      <circle cx="24" cy="26" r="7" fill="#ffd0da" />
      <circle cx="96" cy="26" r="7" fill="#ffd0da" />
      <path d="M10 140 q0 -34 50 -34 q50 0 50 34Z" fill="#5a3ccc" />
      <path d="M50 106 h20 l-10 22Z" fill="#ffc23d" />
      <circle cx="60" cy="64" r="46" fill="url(#bU)" />
      <ellipse cx="60" cy="86" rx="22" ry="17" fill="#ffd0da" />
      <ellipse cx="60" cy="78" rx="7" ry="5" fill="#5a0a1c" />
      {mouth}
      <circle cx="44" cy="58" r="11" fill="none" stroke="#050b1c" strokeWidth="3.5" />
      <circle cx="76" cy="58" r="11" fill="none" stroke="#050b1c" strokeWidth="3.5" />
      <path d="M55 58 h10" stroke="#050b1c" strokeWidth="3.5" />
      <circle cx="44" cy="59" r="4" fill="#3a0512" />
      <circle cx="76" cy="59" r="4" fill="#3a0512" />
      <circle cx="46" cy="56" r="1.4" fill="#fff" />
      <circle cx="78" cy="56" r="1.4" fill="#fff" />
    </svg>
  );
}

function StoryMode() {
  const g = useGame();
  const sceneRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const [node, setNode] = useState(0);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(true);
  const [score, setScore] = useState<boolean | null>(null);
  const [claimed, setClaimed] = useState(false);
  const N = SCRIPT[node];
  usePointerParallax(sceneRef, (x, y) => {
    if (farRef.current) farRef.current.style.transform = `translate3d(${x * -10}px, ${y * -6}px, 0)`;
    if (midRef.current) midRef.current.style.transform = `translate3d(${x * -24}px, ${y * -10}px, 0)`;
  });
  useEffect(() => {
    setTyped("");
    setTyping(true);
    let k = 0;
    const t = setInterval(() => {
      k++;
      setTyped(N.text.slice(0, k));
      if (node > 0 && k % 2 === 0) sfx("tick", N.who === "toro" ? 1.1 : 0.8);
      if (k >= N.text.length) {
        clearInterval(t);
        setTyping(false);
      }
    }, 26);
    return () => clearInterval(t);
  }, [node, N.text, N.who]);
  const advance = () => {
    if (typing) {
      setTyped(N.text);
      setTyping(false);
      return;
    }
    if (N.choices || N.end) return;
    if (N.next !== undefined) {
      setNode(N.next);
      sfx("tap");
    }
  };
  const choose = (c: { next: number; good: boolean }) => {
    setScore(c.good);
    sfx(c.good ? "success" : "error");
    setNode(c.next);
  };
  const restart = () => {
    setNode(0);
    setScore(null);
    setClaimed(false);
  };
  return (
    <Asset title="Story Mode · Dialogue" code="G-23" tags="story dialogue visual novel characters choices branching narrative lesson" span={8} badge="Narrative">
      <style>{TALK_CSS}</style>
      <div ref={sceneRef} className="relative h-[380px] overflow-hidden rounded-3xl" style={{ background: "linear-gradient(180deg,#1b2a66 0%,#2a1f5c 55%,#0a1330 100%)" }}>
        <div ref={farRef} className="absolute -inset-8">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 45}%`, animation: `twinkle ${2 + (i % 3)}s ${i * 0.2}s infinite` }} />
          ))}
          <div className="absolute right-[12%] top-[10%] h-16 w-16 rounded-full bg-gradient-to-b from-[#fff1c4] to-gold shadow-[0_0_60px_#ffc23d]" />
        </div>
        <div ref={midRef} className="absolute -inset-x-10 bottom-24 h-40">
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="h-full w-full">
            {Array.from({ length: 22 }).map((_, i) => {
              const h = 40 + ((i * 53) % 100);
              return <rect key={i} x={i * 28} y={160 - h} width="22" height={h} fill={i % 3 === 0 ? "#22d39a" : i % 3 === 1 ? "#1c3365" : "#ff4d6d"} opacity={i % 3 === 1 ? 0.9 : 0.35} rx="2" />;
            })}
          </svg>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
        {(["toro", "ursa"] as const).map((w) => {
          const active = N.who === w;
          return (
            <div
              key={w}
              className={cn("absolute bottom-24 h-44 w-40 transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]", CAST[w].side === "left" ? "left-2 sm:left-8" : "right-2 sm:right-8")}
              style={{ transform: `translateY(${active ? 0 : 14}px) scale(${active ? 1 : 0.86})`, filter: active ? "none" : "brightness(.5) saturate(.6)" }}
            >
              <div className={active && typing ? "anim-bounce-soft h-full w-full" : "h-full w-full"}>
                <Bust who={w} talking={typing} active={active} />
              </div>
            </div>
          );
        })}
        <div onClick={advance} className="absolute inset-x-3 bottom-3 cursor-pointer rounded-2xl border-2 border-white/10 bg-ink-900/90 p-4 pt-5 shadow-[0_6px_0_#050b1c] backdrop-blur">
          <span className={cn("absolute -top-3.5 rounded-lg px-3 py-1 font-display text-xs font-black text-ink-950 shadow-[0_3px_0_rgba(0,0,0,.35)]", CAST[N.who].side === "left" ? "left-4" : "right-4")} style={{ background: CAST[N.who].color }}>
            {CAST[N.who].name}
          </span>
          <div className="min-h-[44px] text-sm font-bold leading-relaxed text-white">{typed}</div>
          {!typing && !N.choices && !N.end && <span className="absolute bottom-2 right-3 text-cyan" style={{ animation: "bounce-soft 1s infinite" }}>▼</span>}
        </div>
        {!typing && N.choices && (
          <div className="absolute inset-x-6 top-6 space-y-2">
            {N.choices.map((c, i) => (
              <button
                key={c.t}
                onClick={() => choose(c)}
                className="anim-slide-down block w-full rounded-2xl border-2 border-azure/60 bg-ink-800/95 px-4 py-2.5 text-left text-sm font-extrabold text-white shadow-[0_4px_0_#1c55c2] backdrop-blur transition hover:-translate-y-0.5 hover:bg-ink-700 active:translate-y-1"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {c.t}
              </button>
            ))}
          </div>
        )}
        {!typing && N.end && (
          <div className="anim-pop absolute inset-x-6 top-6 flex items-center gap-3 rounded-2xl bg-ink-900/95 p-4 ring-1 ring-white/10 backdrop-blur">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl", score ? "bg-bull/20" : "bg-gold/20")}>{score ? "🧠" : "📚"}</div>
            <div className="flex-1">
              <div className="font-display text-sm font-black text-white">Chapter complete: FOMO</div>
              <div className="text-[11px] font-semibold text-ink-300">{score ? "You chose discipline — bonus XP!" : "Learn from it — replay to find the best path."}</div>
            </div>
            {score && !claimed ? (
              <Btn variant="gold" size="sm" onClick={(e) => { setClaimed(true); g.reward("xp", 30, e.currentTarget); }}>
                <XPIcon size={14} /> +30
              </Btn>
            ) : (
              <Btn variant="ghost" size="sm" onClick={restart}>
                Replay
              </Btn>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-ink-500">
        <Chip tone="violet">Ch. 1</Chip> Tap the dialogue box to advance · choices branch the story
        <span className="ml-auto flex gap-1">
          {SCRIPT.map((_, i) => (
            <span key={i} className={cn("h-1.5 w-4 rounded-full", i <= node ? "bg-cyan" : "bg-ink-700")} />
          ))}
        </span>
      </div>
    </Asset>
  );
}

export default StoryMode;
