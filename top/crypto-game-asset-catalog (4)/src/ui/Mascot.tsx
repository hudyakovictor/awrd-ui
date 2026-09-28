import { cn } from "../utils/cn";

export type Mood = "idle" | "happy" | "sad" | "think" | "wow" | "cool";

export function Mascot({ mood = "idle", size = 120, className }: { mood?: Mood; size?: number; className?: string }) {
  const eye = {
    idle: <><rect x="40" y="56" width="12" height="14" rx="6" /><rect x="68" y="56" width="12" height="14" rx="6" /></>,
    happy: <><path d="M39 64q7-9 14 0" strokeWidth="5" stroke="currentColor" fill="none" strokeLinecap="round" /><path d="M67 64q7-9 14 0" strokeWidth="5" stroke="currentColor" fill="none" strokeLinecap="round" /></>,
    sad: <><rect x="40" y="60" width="12" height="9" rx="4.5" /><rect x="68" y="60" width="12" height="9" rx="4.5" /><path d="M38 55l14 4M82 55l-14 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" /></>,
    think: <><rect x="40" y="58" width="12" height="10" rx="5" /><rect x="68" y="54" width="12" height="14" rx="6" /><path d="M66 50l15-3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" /></>,
    wow: <><circle cx="46" cy="62" r="8" /><circle cx="74" cy="62" r="8" /></>,
    cool: <><path d="M34 56h52v6q-3 9-12 9t-11-8h-6q-2 8-11 8t-12-9z" /></>,
  }[mood];
  const mouth = {
    idle: <path d="M53 82q7 4 14 0" stroke="#8fe9ff" strokeWidth="4" fill="none" strokeLinecap="round" />,
    happy: <path d="M50 79q10 12 20 0z" fill="#8fe9ff" />,
    sad: <path d="M52 85q8-6 16 0" stroke="#8fe9ff" strokeWidth="4" fill="none" strokeLinecap="round" />,
    think: <path d="M54 83h12" stroke="#8fe9ff" strokeWidth="4" strokeLinecap="round" />,
    wow: <ellipse cx="60" cy="83" rx="5" ry="6" fill="#8fe9ff" />,
    cool: <path d="M52 81q9 6 17-2" stroke="#8fe9ff" strokeWidth="4" fill="none" strokeLinecap="round" />,
  }[mood];
  const glow = mood === "sad" ? "#ff8aa0" : mood === "happy" || mood === "cool" ? "#2ee59d" : "#5ce1ff";
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={cn("overflow-visible", className)} aria-label={`Pip mascot ${mood}`}>
      <defs>
        <linearGradient id="mhead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6bd8" /><stop offset="1" stopColor="#2346a8" /></linearGradient>
        <linearGradient id="mhorn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#e09a10" /></linearGradient>
        <linearGradient id="mvisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#081130" /><stop offset="1" stopColor="#0f1d4a" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="114" rx="30" ry="4" fill="#000" opacity=".35" />
      {/* horns */}
      <path d="M26 42C12 38 8 22 14 12c4 10 12 16 22 18z" fill="url(#mhorn)" stroke="#a86d00" strokeWidth="2" />
      <path d="M94 42c14-4 18-20 12-30-4 10-12 16-22 18z" fill="url(#mhorn)" stroke="#a86d00" strokeWidth="2" />
      {/* ears */}
      <ellipse cx="18" cy="60" rx="9" ry="7" fill="#2346a8" />
      <ellipse cx="102" cy="60" rx="9" ry="7" fill="#2346a8" />
      {/* head base / edge */}
      <rect x="20" y="30" width="80" height="80" rx="30" fill="#162f78" />
      <rect x="20" y="26" width="80" height="78" rx="30" fill="url(#mhead)" />
      <path d="M34 34q26-10 52 0" stroke="#ffffff" strokeOpacity=".35" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* visor */}
      <rect x="29" y="44" width="62" height="50" rx="20" fill="url(#mvisor)" stroke="#0a1433" strokeWidth="2" />
      <g fill={glow} color={glow} style={{ filter: `drop-shadow(0 0 5px ${glow})`, transformOrigin: "60px 62px", animation: mood === "idle" || mood === "think" ? "blink 4s infinite" : undefined }}>
        {eye}
      </g>
      <g style={{ filter: "drop-shadow(0 0 4px #5ce1ff)" }}>{mouth}</g>
      {/* nose ring */}
      <path d="M52 98a8 6 0 0 0 16 0" stroke="url(#mhorn)" strokeWidth="4" fill="none" />
      {/* chart antenna */}
      <path d="M60 26V14" stroke="#2346a8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="11" r="5" fill={glow} style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
    </svg>
  );
}
