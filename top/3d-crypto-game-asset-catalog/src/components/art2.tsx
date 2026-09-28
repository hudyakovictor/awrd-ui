import { useId } from "react";

type P = { size?: number; className?: string };

/* ————————————————— League badges ————————————————— */
export type Tier = "bronze" | "silver" | "gold" | "sapphire" | "ruby" | "diamond";
export const TIERS: { k: Tier; name: string; c: [string, string, string] }[] = [
  { k: "bronze", name: "Бронза", c: ["#F6C08F", "#B8662E", "#6E3812"] },
  { k: "silver", name: "Серебро", c: ["#F2F6FC", "#9AA8C2", "#56627D"] },
  { k: "gold", name: "Золото", c: ["#FFE89A", "#E6A20A", "#8A5C00"] },
  { k: "sapphire", name: "Сапфир", c: ["#A6D8FF", "#2A74E0", "#0F3A85"] },
  { k: "ruby", name: "Рубин", c: ["#FFB0C0", "#E0294F", "#7E0F28"] },
  { k: "diamond", name: "Бриллиант", c: ["#E8FDFF", "#6FD6F0", "#2A7FA0"] },
];

export function LeagueBadge({ tier = "gold", size = 72, className, locked }: P & { tier?: Tier; locked?: boolean }) {
  const id = useId();
  const idx = TIERS.findIndex((t) => t.k === tier);
  const [a, b, d] = locked ? ["#3a5186", "#243d73", "#122246"] : TIERS[idx].c;
  const wings = idx >= 3;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={id + "m"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <linearGradient id={id + "i"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b} /><stop offset="1" stopColor={d} /></linearGradient>
        <radialGradient id={id + "g"} cx=".5" cy=".4" r=".6"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor={a} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="50" cy="94" rx="26" ry="4" fill="#000" opacity=".35" />
      {wings && (
        <g fill={`url(#${id}m)`} opacity=".95">
          <path d="M22 40C10 38 4 30 3 22c7 4 12 5 18 5-5-3-8-7-9-12 6 5 12 8 18 9Z" />
          <path d="M78 40c12-2 18-10 19-18-7 4-12 5-18 5 5-3 8-7 9-12-6 5-12 8-18 9Z" />
        </g>
      )}
      <path d="M50 8 82 20v26c0 22-14 36-32 44C32 82 18 68 18 46V20L50 8Z" fill={d} transform="translate(0 3)" />
      <path d="M50 8 82 20v26c0 22-14 36-32 44C32 82 18 68 18 46V20L50 8Z" fill={`url(#${id}m)`} />
      <path d="M50 16 75 25.5v20.5c0 17-10.5 28-25 34.5C35.5 74 25 63 25 46V25.5L50 16Z" fill={`url(#${id}i)`} />
      <path d="M50 16 75 25.5v5L50 21 25 30.5v-5L50 16Z" fill="#fff" opacity=".25" />
      {!locked && <circle cx="50" cy="44" r="18" fill={`url(#${id}g)`} opacity=".5" />}
      {/* central gem / emblem */}
      <g transform="translate(50 46)">
        {locked ? (
          <g fill="none" stroke="#7d93c6" strokeWidth="4" strokeLinecap="round"><rect x="-10" y="-4" width="20" height="16" rx="3" /><path d="M-6 -4v-5a6 6 0 0 1 12 0v5" /></g>
        ) : (
          <>
            <path d="M-12 -6 -6 -14h12l6 8-12 18Z" fill="#fff" opacity=".92" />
            <path d="M-12 -6h24M-6 -14l6 8 6-8M0 -6v18" stroke={b} strokeWidth="1.6" fill="none" />
          </>
        )}
      </g>
      {/* stars by tier */}
      {!locked && Array.from({ length: Math.min(3, idx) }).map((_, i, arr) => {
        const x = 50 + (i - (arr.length - 1) / 2) * 12;
        return <path key={i} transform={`translate(${x} 72) scale(.34)`} d="m0-14 4 8.5 9.5 1.2-7 6.5 1.8 9.3L0 7l-8.3 4.5 1.8-9.3-7-6.5 9.5-1.2Z" fill="#fff" />;
      })}
      <path d="M26 24c7-3 14-5 22-6" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ————————————————— Rival: Медведь Бора ————————————————— */
export type BearMood = "smug" | "angry" | "defeated";
export function BearRival({ size = 140, mood = "smug", className }: P & { mood?: BearMood }) {
  const id = useId();
  const mouth = { smug: "M50 90q10 4 20-3", angry: "M48 92q12-8 24 0", defeated: "M50 94q10-6 20 0" }[mood];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <defs>
        <linearGradient id={id + "f"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7A8E" /><stop offset="1" stopColor="#B81E3F" /></linearGradient>
        <linearGradient id={id + "m"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD2DA" /><stop offset="1" stopColor="#F29AAB" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="113" rx="30" ry="5" fill="#000" opacity=".35" />
      <circle cx="28" cy="32" r="13" fill="#8E1330" /><circle cx="92" cy="32" r="13" fill="#8E1330" />
      <circle cx="28" cy="32" r="12" fill={`url(#${id}f)`} /><circle cx="92" cy="32" r="12" fill={`url(#${id}f)`} />
      <circle cx="28" cy="32" r="6" fill="#FFB3C1" /><circle cx="92" cy="32" r="6" fill="#FFB3C1" />
      <path d="M60 24c26 0 40 16 40 38 0 22-16 38-40 38S20 84 20 62c0-22 14-38 40-38Z" fill="#8E1330" transform="translate(0 4)" />
      <path d="M60 24c26 0 40 16 40 38 0 22-16 38-40 38S20 84 20 62c0-22 14-38 40-38Z" fill={`url(#${id}f)`} />
      <path d="M34 38c7-6 15-9 24-9" stroke="#fff" strokeOpacity=".35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* sunglasses for smug, eyes otherwise */}
      {mood === "smug" ? (
        <g>
          <path d="M30 56h60" stroke="#081229" strokeWidth="3" />
          <path d="M31 55h24l-2 10c-1 4-4 6-8 6h-5c-4 0-7-2-8-6Z" fill="#081229" />
          <path d="M65 55h24l-1 10c-1 4-4 6-8 6h-5c-4 0-7-2-8-6Z" fill="#081229" />
          <path d="M36 58l6 0M70 58l6 0" stroke="#3D9BFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d={mood === "angry" ? "M34 50l16 5M86 50l-16 5" : "M34 54l16-3M86 54l-16-3"} stroke="#4A0716" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="44" cy="63" rx="6" ry={mood === "defeated" ? 2 : 7} fill="#fff" /><ellipse cx="76" cy="63" rx="6" ry={mood === "defeated" ? 2 : 7} fill="#fff" />
          {mood !== "defeated" && <><circle cx="45" cy="64" r="3.5" fill="#081229" /><circle cx="75" cy="64" r="3.5" fill="#081229" /></>}
        </g>
      )}
      <ellipse cx="60" cy="84" rx="18" ry="13" fill={`url(#${id}m)`} />
      <path d="M54 78h12l-6 6Z" fill="#4A0716" />
      <path d={mouth} stroke="#4A0716" strokeWidth="3" strokeLinecap="round" fill="none" />
      {mood === "angry" && <path d="M96 20l4-6M102 26l6-2M90 16l0-6" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />}
      {mood === "defeated" && <path d="M40 74q-3 6 0 9" stroke="#8CCBFF" strokeWidth="3" strokeLinecap="round" fill="none" />}
      {/* down arrow chain */}
      <g transform="translate(60 106)"><rect x="-14" y="-6" width="28" height="10" rx="5" fill="#081229" /><path d="M-6 -3l6 5 6-5" stroke="#FF4D6D" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>
    </svg>
  );
}

/* ————————————————— App logo mark ————————————————— */
export function LogoMark({ size = 96, className, bare }: P & { bare?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={id + "b"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4FA8FF" /><stop offset="1" stopColor="#1B4FB0" /></linearGradient>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient>
        <linearGradient id={id + "c"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DF7BE" /><stop offset="1" stopColor="#12A25E" /></linearGradient>
      </defs>
      {!bare && (
        <>
          <rect x="6" y="10" width="88" height="86" rx="26" fill="#0E2A66" />
          <rect x="6" y="6" width="88" height="86" rx="26" fill={`url(#${id}b)`} />
          <path d="M20 22c8-8 20-10 30-10" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
      <path d="M22 40C12 34 10 22 14 14c4 8 10 12 18 14ZM78 40c10-6 12-18 8-26-4 8-10 12-18 14Z" fill={`url(#${id}g)`} />
      <rect x="30" y="44" width="10" height="26" rx="3" fill="#FF4D6D" /><path d="M35 38v6M35 70v6" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
      <rect x="45" y="36" width="10" height="30" rx="3" fill={`url(#${id}c)`} /><path d="M50 28v8M50 66v6" stroke="#2BE38B" strokeWidth="3" strokeLinecap="round" />
      <rect x="60" y="30" width="10" height="24" rx="3" fill={`url(#${id}c)`} /><path d="M65 22v8M65 54v8" stroke="#2BE38B" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 80 42 68l12 6 22-20" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M70 52h8v8" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ————————————————— Economy objects ————————————————— */
export function RocketArt({ size = 80, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E6ECF5" /><stop offset="1" stopColor="#8FA3D6" /></linearGradient></defs>
      <path d="M30 58c-6 4-10 12-10 18 6 0 14-4 18-10Z" fill="#FF8A3D" />
      <path d="M32 58c-3 3-5 8-5 12 4 0 9-2 11-6Z" fill="#FFE58A" />
      <path d="M60 8C44 10 32 22 26 40l14 14c18-6 30-18 32-34Z" fill={`url(#${id})`} />
      <path d="M26 40 14 42l-6 10 14-2ZM40 54l-2 12 10-6 2-14Z" fill="#FF4D6D" />
      <circle cx="52" cy="28" r="7" fill="#1B4FB0" stroke="#fff" strokeWidth="3" />
      <path d="M58 12c4 1 8 4 10 8" stroke="#FF4D6D" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function PiggyArt({ size = 80, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFB3C6" /><stop offset="1" stopColor="#E85A82" /></linearGradient></defs>
      <ellipse cx="40" cy="74" rx="24" ry="3.5" fill="#000" opacity=".3" />
      <rect x="22" y="60" width="8" height="12" rx="3" fill="#C23E66" /><rect x="48" y="60" width="8" height="12" rx="3" fill="#C23E66" />
      <path d="M26 26l-4-10 12 6Z" fill="#E85A82" />
      <ellipse cx="40" cy="44" rx="28" ry="22" fill={`url(#${id})`} />
      <ellipse cx="66" cy="44" rx="7" ry="8" fill="#FF9AB5" stroke="#C23E66" strokeWidth="2" />
      <circle cx="64" cy="42" r="1.5" fill="#7E1A3A" /><circle cx="68" cy="42" r="1.5" fill="#7E1A3A" />
      <circle cx="54" cy="36" r="2.5" fill="#3A0A1A" />
      <rect x="32" y="22" width="16" height="4" rx="2" fill="#7E1A3A" />
      <circle cx="40" cy="12" r="8" fill="#FFC940" stroke="#C98A08" strokeWidth="2" className="animate-bob" />
      <path d="M20 34c4-6 10-8 16-9" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function KeyArt({ size = 60, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient></defs>
      <circle cx="20" cy="22" r="13" fill={`url(#${id})`} stroke="#8A5C00" strokeWidth="2" />
      <circle cx="20" cy="22" r="5" fill="#0c1834" />
      <path d="M29 31 50 52M42 44l5-5M47 49l4-4" stroke="#E09200" strokeWidth="6" strokeLinecap="round" />
      <path d="M12 16c2-3 5-5 8-5" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TicketArt({ size = 60, className, label = "x2" }: P & { label?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C9A8FF" /><stop offset="1" stopColor="#6A38E0" /></linearGradient></defs>
      <g transform="rotate(-12 30 30)">
        <path d="M8 18h44v8a4 4 0 0 0 0 8v8H8v-8a4 4 0 0 0 0-8Z" fill="#4A1FB0" transform="translate(0 3)" />
        <path d="M8 18h44v8a4 4 0 0 0 0 8v8H8v-8a4 4 0 0 0 0-8Z" fill={`url(#${id})`} />
        <path d="M38 20v20" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="2 3" />
        <text x="23" y="35" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="900" fontSize="12" fill="#fff">{label}</text>
      </g>
    </svg>
  );
}

export function HourglassArt({ size = 80, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E09200" /></linearGradient>
        <clipPath id={id + "c"}><path d="M24 14h32c0 14-12 18-12 26s12 12 12 26H24c0-14 12-18 12-26S24 28 24 14Z" /></clipPath>
      </defs>
      <rect x="18" y="8" width="44" height="8" rx="4" fill={`url(#${id})`} />
      <rect x="18" y="64" width="44" height="8" rx="4" fill={`url(#${id})`} />
      <path d="M24 16h32c0 14-12 18-12 24s12 10 12 24H24c0-14 12-18 12-24S24 30 24 16Z" fill="#8CCBFF" opacity=".25" stroke="#B0D8FF" strokeWidth="2" />
      <g clipPath={`url(#${id}c)`}>
        <path d="M28 22h24c-2 6-8 10-12 12-4-2-10-6-12-12Z" fill="#FFC940" />
        <path d="M26 64c2-8 8-12 14-12s12 4 14 12Z" fill="#FFC940" />
        <rect x="39" y="36" width="2" height="18" fill="#FFC940"><animate attributeName="opacity" values="1;.4;1" dur="1s" repeatCount="indefinite" /></rect>
      </g>
      <path d="M28 20c2 4 4 6 6 8" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ShieldArt({ size = 60, className, tone = "#3D9BFF" }: P & { tone?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".3" stopColor={tone} /><stop offset="1" stopColor={tone} stopOpacity=".7" /></linearGradient></defs>
      <path d="M30 6 50 13v15c0 13-9 21-20 26-11-5-20-13-20-26V13Z" fill="#0c1834" transform="translate(0 3)" />
      <path d="M30 6 50 13v15c0 13-9 21-20 26-11-5-20-13-20-26V13Z" fill={`url(#${id})`} />
      <path d="M21 30l6 6 12-12" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CalendarArt({ size = 60, className, day = 28 }: P & { day?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className}>
      <rect x="8" y="13" width="44" height="42" rx="9" fill="#0c1834" />
      <rect x="8" y="10" width="44" height="42" rx="9" fill="#E6ECF5" />
      <path d="M8 19a9 9 0 0 1 9-9h26a9 9 0 0 1 9 9v5H8Z" fill="#FF8A3D" />
      <rect x="18" y="5" width="5" height="11" rx="2.5" fill="#30508f" /><rect x="37" y="5" width="5" height="11" rx="2.5" fill="#30508f" />
      <text x="30" y="46" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="900" fontSize="17" fill="#11203f">{day}</text>
    </svg>
  );
}

export function CrystalPile({ size = 90, className, n = 3 }: P & { n?: 1 | 2 | 3 | 4 }) {
  const id = useId();
  const gems = [[45, 36, 1.3], [26, 50, 0.9], [64, 50, 1], [45, 58, 0.8]].slice(0, n);
  return (
    <svg width={size} height={size} viewBox="0 0 90 80" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FF5FF" /><stop offset="1" stopColor="#2A7BFF" /></linearGradient></defs>
      <ellipse cx="45" cy="72" rx={16 + n * 6} ry="5" fill="#000" opacity=".3" />
      {gems.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-12 -8h24l8 10-20 22-20-22Z" fill="#1747A6" transform="translate(0 3)" />
          <path d="M-12 -8h24l8 10-20 22-20-22Z" fill={`url(#${id})`} />
          <path d="M-20 2h40M-12 -8l4 10 8-10 8 10 4-10M-8 2l8 22 8-22" stroke="#E6FDFF" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
        </g>
      ))}
      {n >= 3 && <path d="m74 14 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff" className="animate-glint" style={{ transformOrigin: "74px 21px" }} />}
    </svg>
  );
}

/* ————————————————— Scenes ————————————————— */
export function SkylineScene({ className }: { className?: string }) {
  const id = useId();
  const bldg = [[0, 60], [18, 40], [34, 72], [52, 30], [66, 54], [84, 22], [100, 64], [118, 36], [136, 50], [152, 26], [170, 58], [188, 44], [206, 68], [224, 34], [240, 56], [258, 40], [276, 62], [294, 30]];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMax slice" className={className}>
      <defs>
        <linearGradient id={id + "s"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1C44" /><stop offset="1" stopColor="#1B3A7A" /></linearGradient>
        <linearGradient id={id + "l"} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2BE38B" stopOpacity="0" /><stop offset=".3" stopColor="#2BE38B" /><stop offset="1" stopColor="#8CFFD0" /></linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id}s)`} />
      {Array.from({ length: 28 }).map((_, i) => <circle key={i} cx={(i * 53) % 320} cy={(i * 29) % 90} r={i % 4 === 0 ? 1.4 : 0.8} fill="#fff" opacity={0.3 + (i % 5) * 0.12} />)}
      <circle cx="262" cy="40" r="16" fill="#FFE58A" opacity=".9" /><circle cx="256" cy="36" r="16" fill="#0B1C44" opacity=".25" />
      <path d="M0 140 40 120 70 128 110 96 150 104 190 70 230 82 270 44 320 30" stroke={`url(#${id}l)`} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="420" style={{ ["--len" as string]: 420, animation: "drawIn 2s cubic-bezier(.22,1,.36,1) .3s both" }} />
      <circle cx="320" cy="30" r="5" fill="#8CFFD0"><animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" /></circle>
      {bldg.map(([x, h], i) => (
        <g key={i}>
          <rect x={x} y={180 - h} width="18" height={h} fill={i % 2 ? "#0A1838" : "#0D1F48"} />
          {Array.from({ length: Math.floor(h / 10) }).map((_, j) => (j + i) % 3 !== 0 && <rect key={j} x={x + 4 + ((j % 2) * 6)} y={180 - h + 5 + j * 9} width="3" height="3" fill="#FFC940" opacity={0.25 + ((i + j) % 4) * 0.15} />)}
        </g>
      ))}
    </svg>
  );
}

/** Small emoji-free reaction icons for social */
export function ReactionArt({ kind, size = 28 }: { kind: "fire" | "rocket" | "clap" | "diamond"; size?: number }) {
  const map = {
    fire: <path d="M14 26c-5 0-8-3-8-7.5 0-3.8 2.6-6 4.5-8.5.4 2.3 1.6 3.4 2.8 4C13.4 10 15 7 17.3 5c.3 3.3 4.7 6 4.7 12 0 5-3.4 9-8 9Z" fill="#FF8A3D" />,
    rocket: <g><path d="M20 4c-6 1-11 6-13 13l5 5c7-2 12-7 13-13Z" fill="#DFE7FA" /><circle cx="17" cy="11" r="2.5" fill="#1B5FC9" /><path d="M8 18c-3 2-4 5-4 7 2 0 5-1 7-4Z" fill="#FF8A3D" /></g>,
    clap: <g fill="#FFC940"><path d="M8 14l6-8a2 2 0 0 1 3 2l-3 5 6-6a2 2 0 0 1 3 3l-7 8a6 6 0 0 1-9 0 4 4 0 0 1 1-4Z" /><path d="M20 3l1-2M24 6l2-1M17 2V0" stroke="#FFC940" strokeWidth="1.6" strokeLinecap="round" /></g>,
    diamond: <g><path d="M8 7h12l4 5-10 12L4 12Z" fill="#6FD6F0" /><path d="M4 12h20M8 7l6 5 6-5M14 12v12" stroke="#E8FDFF" strokeWidth="1" fill="none" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 28 28">{map[kind]}</svg>;
}

export function LockIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <rect x="9" y="20" width="26" height="20" rx="6" fill="#0c1834" transform="translate(0 2)" />
      <rect x="9" y="20" width="26" height="20" rx="6" fill="#DFE7FA" />
      <path d="M14 20v-5a8 8 0 0 1 16 0v5" stroke="#DFE7FA" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="29" r="3" fill="#30508F" /><rect x="20.8" y="30" width="2.4" height="5" rx="1.2" fill="#30508F" />
    </svg>
  );
}
