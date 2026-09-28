import { useId } from "react";

type P = { size?: number; className?: string };

export function CoinArt({ size = 40, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={id + "a"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#F5A800" /></linearGradient>
        <linearGradient id={id + "b"} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD24D" /><stop offset="1" stopColor="#E08E00" /></linearGradient>
      </defs>
      <ellipse cx="24" cy="27" rx="19" ry="19" fill="#A86400" />
      <circle cx="24" cy="23" r="19" fill={`url(#${id}a)`} />
      <circle cx="24" cy="23" r="14" fill={`url(#${id}b)`} stroke="#FFF1B8" strokeOpacity=".6" strokeWidth="1.5" />
      <path d="M20 16h6a3.5 3.5 0 0 1 0 7h-6m0 0h7a3.5 3.5 0 0 1 0 7h-7V16Zm2-3v3m0 14v3m3-20v3m0 14v3" stroke="#8A4F00" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M11 17a14 14 0 0 1 9-8" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function GemArt({ size = 40, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FF5FF" /><stop offset="1" stopColor="#2A7BFF" /></linearGradient>
      </defs>
      <path d="M12 9h24l8 11-20 22L4 20l8-11Z" fill="#1747A6" transform="translate(0 3)" />
      <path d="M12 9h24l8 11-20 22L4 20l8-11Z" fill={`url(#${id})`} />
      <path d="M4 20h40M12 9l6 11 6-11 6 11 6-11M18 20l6 22 6-22" stroke="#E6FDFF" strokeOpacity=".55" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M14 12l-4 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function FlameArt({ size = 40, className, off }: P & { off?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={id + "o"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={off ? "#5b71a4" : "#FFB547"} /><stop offset="1" stopColor={off ? "#2a3f73" : "#FF5A1F"} /></linearGradient>
        <linearGradient id={id + "i"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={off ? "#8aa0d4" : "#FFF3A3"} /><stop offset="1" stopColor={off ? "#4d69a8" : "#FFB020"} /></linearGradient>
      </defs>
      <path d="M24 45c-9 0-15-6-15-14 0-7 5-11 8-16 1 4 3 6 5 7 0-6 3-12 8-17 1 8 10 13 10 25 0 9-7 15-16 15Z" fill={`url(#${id}o)`} />
      <path d="M24 44c-5 0-8-3-8-7.5 0-4 3-6 5-9 .5 2 2 3.5 3.5 4 0-3 1.5-6 4-8 .5 4 4 6.5 4 12 0 5-3.5 8.5-8.5 8.5Z" fill={`url(#${id}i)`} />
      <path d="M14 26c1-3 3-5 4-7" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HeartArt({ size = 40, className, empty }: P & { empty?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={empty ? "#30508f" : "#FF8FA3"} /><stop offset="1" stopColor={empty ? "#1b305c" : "#E81E4B"} /></linearGradient></defs>
      <path d="M24 43S5 32 5 18A10 10 0 0 1 24 13a10 10 0 0 1 19 5c0 14-19 25-19 25Z" fill={empty ? "#0e1b3a" : "#9E0F32"} transform="translate(0 2.5)" />
      <path d="M24 43S5 32 5 18A10 10 0 0 1 24 13a10 10 0 0 1 19 5c0 14-19 25-19 25Z" fill={`url(#${id})`} />
      <ellipse cx="14" cy="17" rx="4" ry="2.6" fill="#fff" opacity={empty ? 0.15 : 0.6} transform="rotate(-35 14 17)" />
    </svg>
  );
}

export function BoltArt({ size = 40, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D8B8FF" /><stop offset="1" stopColor="#7A3DFF" /></linearGradient></defs>
      <path d="M27 4 9 27h12l-3 17 21-25H26l1-15Z" fill="#4A1FB0" transform="translate(0 3)" />
      <path d="M27 4 9 27h12l-3 17 21-25H26l1-15Z" fill={`url(#${id})`} />
      <path d="M24 9 14 23" stroke="#fff" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChestArt({ size = 120, open, className, tier = "gold" }: P & { open?: boolean; tier?: "gold" | "violet" | "sky" }) {
  const id = useId();
  const c = { gold: ["#FFD66B", "#D18A00"], violet: ["#C4A3FF", "#6A38E0"], sky: ["#8CCBFF", "#1F66D6"] }[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs>
        <linearGradient id={id + "w"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2D4C8F" /><stop offset="1" stopColor="#15285A" /></linearGradient>
        <linearGradient id={id + "m"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient>
        <radialGradient id={id + "g"} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF6C9" stopOpacity=".95" /><stop offset="1" stopColor="#FFC940" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="60" cy="108" rx="42" ry="7" fill="#000" opacity=".35" />
      {open && <circle cx="60" cy="52" r="46" fill={`url(#${id}g)`} />}
      <rect x="16" y="56" width="88" height="48" rx="10" fill={`url(#${id}w)`} />
      <rect x="16" y="56" width="88" height="10" fill="#0c1834" opacity=".4" />
      <rect x="16" y="56" width="10" height="48" rx="4" fill={`url(#${id}m)`} />
      <rect x="94" y="56" width="10" height="48" rx="4" fill={`url(#${id}m)`} />
      <rect x="50" y="62" width="20" height="22" rx="5" fill={`url(#${id}m)`} />
      <circle cx="60" cy="71" r="3" fill="#3a2400" />
      <rect x="58.5" y="72" width="3" height="7" rx="1.5" fill="#3a2400" />
      <g style={{ transformOrigin: "60px 56px", transform: open ? "rotate(-28deg) translate(-10px,-18px)" : "none", transition: "transform .5s cubic-bezier(.34,1.56,.64,1)" }}>
        <path d="M16 56V44c0-14 12-24 44-24s44 10 44 24v12H16Z" fill={`url(#${id}w)`} />
        <path d="M26 56V42c0-10 6-17 8-19h-6c-7 4-12 11-12 21v12h10ZM94 56V42c0-10-6-17-8-19h6c7 4 12 11 12 21v12H94Z" fill={`url(#${id}m)`} />
        <rect x="16" y="50" width="88" height="8" rx="3" fill={`url(#${id}m)`} />
        <path d="M30 34c6-6 16-9 30-9" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export function TrophyArt({ size = 60, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient></defs>
      <path d="M18 10h28v12c0 9-6 16-14 16s-14-7-14-16V10Z" fill={`url(#${id})`} />
      <path d="M18 14H9c0 8 4 12 10 13M46 14h9c0 8-4 12-10 13" stroke="#E09200" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="28" y="37" width="8" height="9" fill="#C27A00" />
      <rect x="18" y="46" width="28" height="10" rx="3" fill="#2D4C8F" />
      <rect x="18" y="46" width="28" height="3" rx="1.5" fill="#4d69a8" />
      <path d="m32 15 2.2 4.4 4.8.7-3.5 3.4.8 4.8L32 26l-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L32 15Z" fill="#FFF6C9" />
      <path d="M22 14v7" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ———— Mascot: Бык Макс ———— */
export type Mood = "idle" | "happy" | "sad" | "think" | "hype";
export function Mascot({ size = 140, mood = "idle", className }: P & { mood?: Mood }) {
  const id = useId();
  const mouth = {
    idle: "M52 88q8 5 16 0",
    happy: "M48 85q12 14 24 0Z",
    sad: "M51 91q9-7 18 0",
    think: "M53 89h13",
    hype: "M46 83q14 20 28 0Z",
  }[mood];
  const brows = {
    idle: ["M38 50l12 2", "M82 50l-12 2"],
    happy: ["M38 48q6-4 12 0", "M70 48q6-4 12 0"],
    sad: ["M38 49l12-4", "M82 49l-12-4"],
    think: ["M38 47l12 3", "M70 45l12 2"],
    hype: ["M37 46l13 5", "M83 46l-13 5"],
  }[mood];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs>
        <linearGradient id={id + "h"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5FB2FF" /><stop offset="1" stopColor="#1D5FD0" /></linearGradient>
        <linearGradient id={id + "n"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE0FF" /><stop offset="1" stopColor="#7DB6F5" /></linearGradient>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="113" rx="30" ry="5" fill="#000" opacity=".35" />
      <path d="M26 42C14 38 8 26 10 14c6 8 14 12 24 14ZM94 42c12-4 18-16 16-28-6 8-14 12-24 14Z" fill={`url(#${id}g)`} />
      <path d="M12 18c3 5 8 8 14 10" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 44c-8-2-13 2-13 7 6 3 12 3 17 1ZM98 44c8-2 13 2 13 7-6 3-12 3-17 1Z" fill="#1D5FD0" />
      <path d="M60 22c24 0 38 14 38 36 0 14-5 26-12 34H34c-7-8-12-20-12-34 0-22 14-36 38-36Z" fill="#123E94" transform="translate(0 4)" />
      <path d="M60 22c24 0 38 14 38 36 0 14-5 26-12 34H34c-7-8-12-20-12-34 0-22 14-36 38-36Z" fill={`url(#${id}h)`} />
      <path d="M34 34c6-6 14-9 24-9" stroke="#fff" strokeOpacity=".35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M52 22l8 10 8-10" fill="#FFC940" />
      <g className="animate-blink" style={{ transformOrigin: "60px 60px" }}>
        <ellipse cx="45" cy="61" rx="8" ry={mood === "happy" ? 5 : 9} fill="#fff" />
        <ellipse cx="75" cy="61" rx="8" ry={mood === "happy" ? 5 : 9} fill="#fff" />
        <circle cx={mood === "think" ? 48 : 46} cy={mood === "think" ? 57 : 62} r="4.5" fill="#081229" />
        <circle cx={mood === "think" ? 78 : 76} cy={mood === "think" ? 57 : 62} r="4.5" fill="#081229" />
        <circle cx={mood === "think" ? 49.5 : 47.5} cy={mood === "think" ? 55.5 : 60.5} r="1.5" fill="#fff" />
        <circle cx={mood === "think" ? 79.5 : 77.5} cy={mood === "think" ? 55.5 : 60.5} r="1.5" fill="#fff" />
      </g>
      <path d={brows[0]} stroke="#0B2A6B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d={brows[1]} stroke="#0B2A6B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <rect x="36" y="72" width="48" height="26" rx="13" fill={`url(#${id}n)`} />
      <ellipse cx="50" cy="80" rx="3" ry="2.2" fill="#2A5DB0" />
      <ellipse cx="70" cy="80" rx="3" ry="2.2" fill="#2A5DB0" />
      <path d={mouth} stroke="#0B2A6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill={mood === "happy" || mood === "hype" ? "#0B2A6B" : "none"} />
      <circle cx="60" cy="98" r="5" fill="none" stroke={`url(#${id}g)`} strokeWidth="3" />
      {mood === "sad" && <path d="M36 70q-2 6 1 8" stroke="#8CCBFF" strokeWidth="3" strokeLinecap="round" fill="none" />}
      {mood === "hype" && <g fill="#FFC940"><path d="m100 70 2 4 4 1-4 2-2 4-2-4-4-2 4-1 2-4Z" /><path d="m16 72 1.5 3 3 1-3 1.5-1.5 3-1.5-3-3-1.5 3-1 1.5-3Z" /></g>}
    </svg>
  );
}

/* ———— Enemies: cognitive biases ———— */
export function FomoGhost({ size = 120, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9A8FF" /><stop offset="1" stopColor="#6A38E0" /></linearGradient></defs>
      <ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity=".3" />
      <path d="M24 60c0-24 16-40 36-40s36 16 36 40v38l-9-7-9 8-9-8-9 8-9-8-9 8-9-7V60Z" fill={`url(#${id})`} />
      <path d="M34 42c5-8 13-12 22-13" stroke="#fff" strokeOpacity=".5" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <ellipse cx="46" cy="58" rx="9" ry="11" fill="#1A0B45" /><ellipse cx="76" cy="58" rx="9" ry="11" fill="#1A0B45" />
      <circle cx="50" cy="54" r="3.5" fill="#2BE38B" /><circle cx="80" cy="54" r="3.5" fill="#2BE38B" />
      <ellipse cx="61" cy="80" rx="7" ry="9" fill="#1A0B45" />
      <path d="M92 22l6-8 6 8M98 14v18" stroke="#2BE38B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PaperHands({ size = 120, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#B8C7EA" /></linearGradient></defs>
      <ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity=".3" />
      <path d="M30 18h46l16 16v70H30V18Z" fill={`url(#${id})`} />
      <path d="M76 18v16h16" fill="#8FA3D6" />
      <path d="M38 34h26M38 42h18" stroke="#8FA3D6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="62" r="7" fill="#081229" /><circle cx="74" cy="62" r="7" fill="#081229" />
      <circle cx="50" cy="60" r="2" fill="#fff" /><circle cx="76" cy="60" r="2" fill="#fff" />
      <path d="M50 84q4-4 8 0t8 0 8 0" stroke="#081229" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M86 70c8-2 14 4 14 10M22 70c-6 0-10 6-8 12" stroke="#B8C7EA" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M96 54l4-4M100 60h5M18 56l-4-4" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function WhaleBoss({ size = 160, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 160 140" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3C6FD1" /><stop offset="1" stopColor="#10275E" /></linearGradient>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient>
      </defs>
      <ellipse cx="80" cy="132" rx="56" ry="6" fill="#000" opacity=".35" />
      <path d="M14 76c0-28 26-48 62-48 34 0 58 18 58 44 0 8-2 14-4 18l16-10c6-4 12 2 8 8l-14 18c-4 6-10 6-14 2-12 12-30 18-52 18-36 0-60-18-60-50Z" fill={`url(#${id})`} />
      <path d="M22 88c10 16 30 26 56 26 18 0 32-4 42-12-12 4-26 6-42 6-24 0-44-8-56-20Z" fill="#B8D4FF" opacity=".85" />
      <path d="M30 56c10-12 26-18 44-18" stroke="#fff" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M50 30l8-18 12 12 10-16 10 16 12-12 6 18Z" fill={`url(#${id}g)`} />
      <circle cx="70" cy="22" r="3" fill="#FF4D6D" /><circle cx="90" cy="20" r="3" fill="#2BE38B" />
      <path d="M44 66l18 6M96 66l-18 6" stroke="#081229" strokeWidth="4" strokeLinecap="round" />
      <circle cx="54" cy="76" r="6" fill="#FF4D6D" /><circle cx="86" cy="76" r="6" fill="#FF4D6D" />
      <circle cx="55.5" cy="74.5" r="2" fill="#fff" /><circle cx="87.5" cy="74.5" r="2" fill="#fff" />
      <path d="M58 96q12 6 24 0" stroke="#081229" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* Small avatar faces */
export function AvatarArt({ seed = 0, size = 44 }: { seed?: number; size?: number }) {
  const bgs = [["#3D9BFF", "#1B5FC9"], ["#9A6BFF", "#5F35C9"], ["#FF8A3D", "#C9521A"], ["#2BE38B", "#12A25E"], ["#FF4D6D", "#BF2345"], ["#FFC940", "#C98A08"]];
  const [a, b] = bgs[seed % bgs.length];
  const id = useId();
  const hair = ["M12 18c2-8 8-11 12-11s10 3 12 11c-4-3-8-4-12-4s-8 1-12 4Z", "M11 20c0-9 6-13 13-13s13 4 13 13l-4-4-5 2-4-3-4 3-5-2-4 4Z", "M13 16c3-6 7-8 11-8 5 0 9 3 11 9-8-2-14-5-22-1Z"][seed % 3];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${id})`} />
      <path d="M8 44c3-8 9-11 16-11s13 3 16 11a24 24 0 0 1-32 0Z" fill="#0c1834" opacity=".55" />
      <circle cx="24" cy="21" r="10" fill="#FFD9C0" />
      <path d={hair} fill="#1a1030" />
      <circle cx="20.5" cy="22" r="1.4" fill="#1a1030" /><circle cx="27.5" cy="22" r="1.4" fill="#1a1030" />
      <path d="M21 26q3 2 6 0" stroke="#1a1030" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
