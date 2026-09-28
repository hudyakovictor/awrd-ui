import { useState } from "react";
import { Asset, Btn, Confetti, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

type BrandMode = "dark" | "light" | "bull" | "mono";

function BrandMark({ mode, animated = false, compact = false }: { mode: BrandMode; animated?: boolean; compact?: boolean }) {
  const colors: Record<BrandMode, { box: string; line: string; word: string; accent: string }> = {
    dark: { box: "#22d38a", line: "#ffffff", word: "#eef3ff", accent: "#22d38a" },
    light: { box: "#0e1a3b", line: "#22d38a", word: "#0e1a3b", accent: "#0b9f63" },
    bull: { box: "#ffc53d", line: "#382500", word: "#ffffff", accent: "#ffc53d" },
    mono: { box: "#eef3ff", line: "#070e22", word: "#eef3ff", accent: "#eef3ff" },
  };
  const color = colors[mode];
  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative rounded-2xl grid place-items-center overflow-hidden", compact ? "w-12 h-12" : "w-16 h-16")} style={{ background: color.box, boxShadow: `0 5px 0 ${mode === "light" ? "#9aa8c5" : "rgba(0,0,0,.35)"}, inset 0 2px 0 rgba(255,255,255,.3)` }}>
        <svg viewBox="0 0 48 48" className={cn(compact ? "w-8 h-8" : "w-11 h-11", animated && "anim-score-pop")}>
          <path d="M8 34 18 17l8 9L40 8" fill="none" stroke={color.line} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={animated ? 70 : 0} style={animated ? { animation: "dash .8s .15s ease forwards" } : undefined} />
          <path d="M31 8h9v9" fill="none" stroke={color.line} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {animated && <span className="absolute inset-0 bg-white/20" style={{ animation: "glow .7s ease forwards" }} />}
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-2xl font-black tracking-[-.06em]" style={{ color: color.word }}>BULL<span style={{ color: color.accent }}>RUN</span></div>
          <div className="text-[8px] font-black tracking-[.26em] mt-1" style={{ color: color.word, opacity: .62 }}>ACADEMY</div>
        </div>
      )}
    </div>
  );
}

function LogoSystem() {
  const [mode, setMode] = useState<BrandMode>("dark");
  const [animated, setAnimated] = useState(false);
  const [safe, setSafe] = useState(true);
  const backgrounds: Record<BrandMode, string> = {
    dark: "linear-gradient(145deg,#101f45,#070e22)",
    light: "linear-gradient(145deg,#f5f8ff,#dbe5fb)",
    bull: "linear-gradient(145deg,#244a94,#0b1738)",
    mono: "#070e22",
  };
  const play = () => {
    setAnimated(false);
    requestAnimationFrame(() => setAnimated(true));
  };
  return (
    <Asset
      code="BRD-01"
      title="Logo Lockups"
      desc="Primary, reversed, campaign and monochrome marks with safe-area inspection and a draw-on motion signature."
      tags={["logo", "motion", "rules"]}
      span={2}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {(["dark", "light", "bull", "mono"] as BrandMode[]).map((value) => (
          <button key={value} onClick={() => setMode(value)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all", mode === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>
        ))}
        <button onClick={() => setSafe(!safe)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black uppercase border-2 ml-auto", safe ? "border-bull bg-bull/10 text-bull" : "border-ink-600 text-mist")}><Icon name={safe ? "check" : "x"} size={11} className="inline mr-1" />Safe area</button>
      </div>
      <div className="relative min-h-64 rounded-[24px] grid place-items-center overflow-hidden transition-colors" style={{ background: backgrounds[mode] }}>
        <div className={cn("relative p-8 transition-all", safe && "border border-dashed border-sky/55")}>
          {safe && <><span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-sky text-white num text-[7px] font-black px-1.5 rounded">1×</span><span className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 bg-sky text-white num text-[7px] font-black px-1.5 rounded">1×</span></>}
          <div key={`${mode}${animated}`} className="anim-pop"><BrandMark mode={mode} animated={animated} /></div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="text-[8px] uppercase tracking-widest font-black" style={{ color: mode === "light" ? "#0e1a3b" : "#eef3ff", opacity: .5 }}>Min digital size · 28px</div>
          <div className="flex gap-2"><BrandMark mode={mode} compact /><div className="w-8 h-8 grid place-items-center" style={{ color: mode === "light" ? "#0e1a3b" : "#eef3ff" }}><Icon name="logo" size={24} /></div></div>
        </div>
      </div>
      <Btn variant="sky" size="sm" icon="play" className="mt-4" onClick={play}>Replay logo motion</Btn>
    </Asset>
  );
}

type Mood = "focused" | "proud" | "curious" | "warning" | "celebrate" | "calm";

function BullMascot({ mood, eyeX, eyeY }: { mood: Mood; eyeX: number; eyeY: number }) {
  const mouth: Record<Mood, string> = {
    focused: "M55 103 Q70 98 85 103",
    proud: "M53 99 Q70 116 87 99",
    curious: "M58 103 Q70 108 82 102",
    warning: "M55 110 Q70 97 85 110",
    celebrate: "M52 98 Q70 121 88 98",
    calm: "M56 103 Q70 108 84 103",
  };
  const brows: Record<Mood, [string, string]> = {
    focused: ["M40 59 L59 55", "M81 55 L100 59"],
    proud: ["M40 56 Q50 50 59 55", "M81 55 Q90 50 100 56"],
    curious: ["M40 57 Q50 48 59 54", "M81 52 L100 58"],
    warning: ["M40 53 L59 59", "M81 59 L100 53"],
    celebrate: ["M40 57 Q50 48 59 56", "M81 56 Q90 48 100 57"],
    calm: ["M40 56 Q50 52 59 56", "M81 56 Q90 52 100 56"],
  };
  const accent = mood === "warning" ? "#ff8a3d" : mood === "celebrate" || mood === "proud" ? "#ffc53d" : "#3da5ff";
  return (
    <svg viewBox="0 0 140 150" className={cn("w-full h-full drop-shadow-[0_10px_0_rgba(0,0,0,.25)]", mood === "celebrate" && "anim-bounce-in", mood === "warning" && "anim-wiggle")}>
      <defs>
        <linearGradient id="bullSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#66bdff" /><stop offset=".55" stopColor="#2d8cf0" /><stop offset="1" stopColor="#1a56a8" /></linearGradient>
        <linearGradient id="bullHorn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1bf" /><stop offset="1" stopColor="#f5b01c" /></linearGradient>
      </defs>
      <path d="M38 44C17 36 10 17 20 5c4 15 14 25 31 29Z" fill="url(#bullHorn)" stroke="#b07600" strokeWidth="2.5" />
      <path d="M102 44c21-8 28-27 18-39-4 15-14 25-31 29Z" fill="url(#bullHorn)" stroke="#b07600" strokeWidth="2.5" />
      <ellipse cx="22" cy="69" rx="13" ry="9" fill="#266fd0" transform="rotate(-20 22 69)" />
      <ellipse cx="118" cy="69" rx="13" ry="9" fill="#266fd0" transform="rotate(20 118 69)" />
      <ellipse cx="70" cy="81" rx="49" ry="48" fill="#123f84" />
      <ellipse cx="70" cy="74" rx="49" ry="48" fill="url(#bullSkin)" />
      <path d="M37 45 Q70 22 103 45" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="8" strokeLinecap="round" />
      <g style={{ animation: "blink 4.5s infinite", transformOrigin: "center", transformBox: "fill-box" }}>
        <ellipse cx="51" cy="70" rx="12" ry="13" fill="#fff" />
        <ellipse cx="89" cy="70" rx="12" ry="13" fill="#fff" />
        <circle cx={51 + eyeX} cy={70 + eyeY} r="6" fill="#07122d" />
        <circle cx={89 + eyeX} cy={70 + eyeY} r="6" fill="#07122d" />
        <circle cx={53 + eyeX} cy={67 + eyeY} r="2" fill="#fff" />
        <circle cx={91 + eyeX} cy={67 + eyeY} r="2" fill="#fff" />
      </g>
      <path d={brows[mood][0]} fill="none" stroke="#07122d" strokeWidth="4" strokeLinecap="round" />
      <path d={brows[mood][1]} fill="none" stroke="#07122d" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="70" cy="104" rx="27" ry="19" fill="#a9d8ff" />
      <ellipse cx="60" cy="99" rx="3.5" ry="4" fill="#1a56a8" />
      <ellipse cx="80" cy="99" rx="3.5" ry="4" fill="#1a56a8" />
      <path d={mouth[mood]} fill="none" stroke="#1a56a8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M43 122 Q70 139 97 122 L92 148 H48Z" fill="#0e1a3b" />
      <path d="M57 124 L70 140 83 124" fill={accent} opacity=".9" />
      {mood === "celebrate" && <g>{[18, 35, 107, 122].map((x, index) => <path key={x} d={`M${x} ${22 + index * 4} l4 -8 4 8 -4 5z`} fill={["#ff4b6e", "#22d38a", "#ffc53d", "#9b6bff"][index]} style={{ animation: `float 1.2s ${index * .15}s infinite` }} />)}</g>}
      {mood === "warning" && <path d="M112 32 l10 18 h-20z" fill="#ff8a3d" stroke="#fff" strokeWidth="2" />}
    </svg>
  );
}

function MascotLibrary() {
  const [mood, setMood] = useState<Mood>("focused");
  const [eyes, setEyes] = useState({ x: 0, y: 0 });
  const moods: { id: Mood; label: string; use: string }[] = [
    { id: "focused", label: "Focused", use: "Lesson" },
    { id: "proud", label: "Proud", use: "Success" },
    { id: "curious", label: "Curious", use: "Hint" },
    { id: "warning", label: "Warning", use: "Risk" },
    { id: "celebrate", label: "Celebrate", use: "Reward" },
    { id: "calm", label: "Calm", use: "Empty" },
  ];
  return (
    <Asset
      code="BRD-02"
      title="Mascot Expression Set"
      desc="Pip the Bull has six adult, functional expressions. Move the pointer in the stage to direct his gaze."
      tags={["mascot", "6 moods", "tracking"]}
      span={2}
    >
      <div className="grid md:grid-cols-[280px_1fr] gap-5">
        <div onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setEyes({ x: Math.max(-5, Math.min(5, (event.clientX - rect.left - rect.width / 2) / 22)), y: Math.max(-4, Math.min(4, (event.clientY - rect.top - rect.height / 2) / 28)) }); }} onPointerLeave={() => setEyes({ x: 0, y: 0 })} className="well dotgrid rounded-[24px] p-4 h-80 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-8 rounded-full bg-sky/10 blur-2xl anim-glow" />
          <div key={mood} className="w-56 h-60 relative"><BullMascot mood={mood} eyeX={eyes.x} eyeY={eyes.y} /></div>
          <div className="absolute left-3 top-3 text-[8px] uppercase tracking-widest text-mist font-black">Pointer-aware rig</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {moods.map((item) => (
            <button key={item.id} onClick={() => setMood(item.id)} className={cn("game-surface rounded-2xl p-3 text-left transition-all", mood === item.id && "!border-sky/55 -translate-y-1")}>
              <div className="w-16 h-16 mx-auto"><BullMascot mood={item.id} eyeX={0} eyeY={0} /></div>
              <div className="text-xs font-black mt-1">{item.label}</div>
              <div className="text-[8px] text-mist">Use: {item.use}</div>
            </button>
          ))}
          <div className="col-span-2 sm:col-span-3 rounded-xl p-3 bg-gold/[.07] border border-gold/20 text-[10px] text-mist leading-relaxed"><b className="text-gold">Character rule:</b> Pip guides and reacts; he never mocks losses, celebrates risky behavior or blocks content with decorative animation.</div>
        </div>
      </div>
    </Asset>
  );
}

function RewardTokens() {
  const [spin, setSpin] = useState<number | null>(null);
  const [balance, setBalance] = useState(840);
  const [burst, setBurst] = useState(0);
  const tokens = [
    { label: "Gem", icon: "gem", color: "#3da5ff", value: 20 },
    { label: "XP", icon: "bolt", color: "#ffc53d", value: 15 },
    { label: "Heart", icon: "heart", color: "#ff4b6e", value: 1 },
    { label: "Freeze", icon: "shield", color: "#9b6bff", value: 1 },
    { label: "Ticket", icon: "star", color: "#22d38a", value: 1 },
  ];
  const collect = (index: number) => {
    setSpin(index);
    setBalance((value) => value + tokens[index].value);
    setBurst((value) => value + 1);
    setTimeout(() => setSpin(null), 1000);
  };
  return (
    <Asset
      code="BRD-03"
      title="Reward Token Forge"
      desc="Five economy tokens share material, edge and highlight rules while retaining instantly distinct silhouettes."
      tags={["3D tokens", "collect"]}
    >
      <div className="relative well dotgrid p-4 grid grid-cols-5 gap-2 mb-4">
        <Confetti burst={burst} count={18} />
        {tokens.map((token, index) => (
          <button key={token.label} onClick={() => collect(index)} className="text-center group">
            <div className={cn("relative aspect-square max-w-16 mx-auto rounded-full grid place-items-center transition-transform group-hover:-translate-y-1", spin === index && "anim-coin-flip")} style={{ color: "#fff", background: `radial-gradient(circle at 35% 28%, ${token.color}, ${token.color}bb 58%, ${token.color}77)`, boxShadow: `inset 0 3px 0 rgba(255,255,255,.35), inset 0 -5px 0 rgba(0,0,0,.25), 0 5px 0 rgba(0,0,0,.3), 0 0 20px ${token.color}33` }}>
              <Icon name={token.icon} size={26} fill={token.icon === "heart" || token.icon === "bolt" || token.icon === "star" ? "currentColor" : "none"} stroke={2} />
              <span className="absolute inset-1 rounded-full border border-white/20" />
            </div>
            <div className="text-[8px] font-black mt-2">{token.label}</div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between"><div><div className="text-[8px] uppercase tracking-widest font-black text-mist">Demo collected value</div><div key={balance} className="num text-xl font-black text-sky anim-pop">{balance.toLocaleString()}</div></div><span className="text-[9px] text-mist">Tap any token to inspect its collect motion</span></div>
    </Asset>
  );
}

function BadgeComposer() {
  const [shape, setShape] = useState<"hex" | "round" | "shield">("hex");
  const [tier, setTier] = useState<"gold" | "diamond" | "legend">("gold");
  const [icon, setIcon] = useState("candles");
  const colors = { gold: ["#ffe08a", "#f5b01c", "#8a5a00"], diamond: ["#b5f0ff", "#3da5ff", "#1a56a8"], legend: ["#d8c6ff", "#9b6bff", "#4f2bb0"] }[tier];
  const clip = shape === "hex" ? "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" : shape === "shield" ? "polygon(10% 5%,90% 5%,90% 60%,50% 100%,10% 60%)" : "circle(50%)";
  return (
    <Asset
      code="BRD-04"
      title="Achievement Composer"
      desc="Controlled badge grammar: three containers, three materials and a curated glyph set produce variety without visual drift."
      tags={["badges", "composer"]}
    >
      <div className="well dotgrid min-h-52 grid place-items-center mb-4">
        <div key={`${shape}${tier}${icon}`} className="w-32 h-32 p-2 anim-bounce-in" style={{ clipPath: clip, background: colors[2], filter: `drop-shadow(0 8px 12px ${colors[2]}66)` }}>
          <div className="w-full h-full grid place-items-center relative" style={{ clipPath: clip, background: `linear-gradient(145deg,${colors[0]},${colors[1]})` }}>
            <span className="absolute inset-[14%] border-2 border-white/25" style={{ clipPath: clip }} />
            <Icon name={icon} size={48} className="text-white drop-shadow" stroke={2.4} />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2"><span className="text-[9px] font-black uppercase text-mist w-12 pt-2">Shape</span>{(["hex", "round", "shield"] as const).map((value) => <button key={value} onClick={() => setShape(value)} className={cn("h-8 px-3 rounded-lg text-[9px] font-black border", shape === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}</div>
        <div className="flex gap-2"><span className="text-[9px] font-black uppercase text-mist w-12 pt-2">Tier</span>{(["gold", "diamond", "legend"] as const).map((value) => <button key={value} onClick={() => setTier(value)} className={cn("h-8 px-3 rounded-lg text-[9px] font-black border", tier === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}</div>
        <div className="flex gap-2"><span className="text-[9px] font-black uppercase text-mist w-12 pt-2">Glyph</span>{["candles", "shield", "target", "flame", "crown"].map((value) => <button key={value} onClick={() => setIcon(value)} className={cn("w-8 h-8 rounded-lg grid place-items-center border", icon === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}><Icon name={value} size={15} /></button>)}</div>
      </div>
    </Asset>
  );
}

function KeyArtComposer() {
  const [scene, setScene] = useState<"lesson" | "arena" | "reward">("lesson");
  const [depth, setDepth] = useState(50);
  const config = {
    lesson: { title: "Master the market", sub: "One decision at a time", icon: "book", color: "#3da5ff", mood: "curious" as Mood },
    arena: { title: "Read faster. Think sharper.", sub: "Ranked chart duels", icon: "bolt", color: "#9b6bff", mood: "focused" as Mood },
    reward: { title: "Discipline pays", sub: "Build a 30-day practice streak", icon: "trophy", color: "#ffc53d", mood: "celebrate" as Mood },
  }[scene];
  return (
    <Asset
      code="BRD-05"
      title="Campaign Key Art"
      desc="Reusable scene recipe combines mascot, environment, message and product motif at adjustable depth."
      tags={["campaign", "composition"]}
    >
      <div className="relative aspect-[16/9] rounded-[24px] overflow-hidden mb-4 bg-gradient-to-br from-[#123f84] via-[#111b49] to-[#070e22]" style={{ perspective: 700 }}>
        <div className="absolute inset-0 dotgrid opacity-25" style={{ transform: `translateZ(${-depth}px) scale(${1 + depth / 400})` }} />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 max-w-[55%]" style={{ transform: `translateZ(${depth / 5}px)` }}><div className="text-[8px] font-black uppercase tracking-[.2em] mb-1" style={{ color: config.color }}>BULLRUN ACADEMY</div><div className="font-black text-lg sm:text-2xl leading-tight">{config.title}</div><div className="text-[9px] sm:text-xs text-fog/60 mt-1">{config.sub}</div></div>
        <div className="absolute right-[5%] bottom-[-18%] w-[42%] h-[105%]" style={{ transform: `translateZ(${depth / 2}px)` }}><BullMascot mood={config.mood} eyeX={-2} eyeY={0} /></div>
        <div className="absolute right-[34%] top-[13%] w-11 h-11 rounded-2xl grid place-items-center anim-float" style={{ color: config.color, background: `${config.color}22`, border: `1px solid ${config.color}44`, transform: `translateZ(${depth}px)` }}><Icon name={config.icon} size={22} /></div>
        <svg viewBox="0 0 500 200" className="absolute inset-0 w-full h-full opacity-30"><path d="M0 170 C80 155 110 175 175 125 S290 145 350 80 S440 90 500 35" fill="none" stroke={config.color} strokeWidth="3" strokeDasharray="7 6" style={{ animation: "routeFlow 2s linear infinite" }} /></svg>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">{(["lesson", "arena", "reward"] as const).map((value) => <button key={value} onClick={() => setScene(value)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black uppercase border-2", scene === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}<span className="text-[9px] text-mist ml-auto">Depth <b className="num text-fog">{depth}</b></span></div>
      <input type="range" min={0} max={100} value={depth} onChange={(event) => setDepth(+event.target.value)} className="w-full accent-sky" />
    </Asset>
  );
}

export default function BrandAssets() {
  return (
    <Section
      id="brand"
      index="16"
      title="Brand & Illustration"
      subtitle="A recognizable product world: logo behavior, a mature guide character, reward materials and campaign composition."
    >
      <LogoSystem />
      <MascotLibrary />
      <RewardTokens />
      <BadgeComposer />
      <KeyArtComposer />
    </Section>
  );
}