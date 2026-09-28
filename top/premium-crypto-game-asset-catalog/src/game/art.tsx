import { useId, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

/* ================================================================== */
/*  GLOSSY GAME ITEM ART — hand-built SVG, layered, lit from top-left  */
/* ================================================================== */

export type ArtProps = { size?: number; className?: string };

const useUid = (p: string) => p + useId().replace(/[^a-zA-Z0-9]/g, "");

function Shadow({ w = 20, y = 60 }: { w?: number; y?: number }) {
  return <ellipse cx="32" cy={y} rx={w} ry="3" fill="#000" opacity=".38" />;
}

function Lin({ id, stops, x2 = 0, y2 = 1 }: { id: string; stops: [number, string][]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}

function Svg({ size, className, children }: { size: number; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true" overflow="visible">
      {children}
    </svg>
  );
}

const GOLD: [number, string][] = [
  [0, "#fff4c2"],
  [0.42, "#ffcf5a"],
  [1, "#d4860f"],
];

/* ---------------- COIN ---------------- */
export function CoinArt({ size = 64, className }: ArtProps) {
  const u = useUid("c");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={`${u}f`} stops={GOLD} />
        <Lin id={`${u}i`} stops={[[0, "#e39a1f"], [1, "#ffe08a"]]} />
      </defs>
      <Shadow w={18} />
      <circle cx="32" cy="33" r="25" fill="#8f5608" />
      <circle cx="32" cy="30" r="25" fill={`url(#${u}f)`} />
      <circle cx="32" cy="30" r="18.5" fill={`url(#${u}i)`} />
      <circle cx="32" cy="30" r="18.5" fill="none" stroke="#b36d0c" strokeWidth="1.5" opacity=".6" />
      <path d="M32 16.5v6.5M32 37v6.5" stroke="#7a4706" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="26.5" y="23" width="11" height="14" rx="2.5" fill="#7a4706" />
      <rect x="28.4" y="25" width="3" height="10" rx="1.5" fill="#ffe7a3" opacity=".75" />
      <path d="M13 24a20 20 0 0 1 16-15" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".75" />
      <circle cx="46" cy="15" r="1.8" fill="#fff" />
    </Svg>
  );
}

/* ---------------- GEM ---------------- */
export function GemArt({ size = 64, className }: ArtProps) {
  return (
    <Svg size={size} className={className}>
      <Shadow w={16} />
      <polygon points="16,11 48,11 59,25 32,58 5,25" fill="#07506c" transform="translate(0 2.5)" />
      <polygon points="16,11 48,11 40,25 24,25" fill="#c4f8ff" />
      <polygon points="16,11 24,25 5,25" fill="#62e7ff" />
      <polygon points="48,11 59,25 40,25" fill="#1fb7dc" />
      <polygon points="5,25 24,25 32,58" fill="#27c3e6" />
      <polygon points="24,25 40,25 32,58" fill="#84f0ff" />
      <polygon points="40,25 59,25 32,58" fill="#0f86ad" />
      <polyline
        points="16,11 48,11 59,25 32,58 5,25 16,11"
        fill="none"
        stroke="#e8fdff"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity=".55"
      />
      <path d="M19 14.5 L27 14.5 L22.5 21 Z" fill="#fff" opacity=".9" />
      <path className="twinkle" d="M52 6 L53.2 10 L57 11 L53.2 12 L52 16 L50.8 12 L47 11 L50.8 10 Z" fill="#fff" />
    </Svg>
  );
}

/* ---------------- HEART ---------------- */
const HP =
  "M32 55 C 12 42 5 31 5 21.5 C 5 12.5 11.5 6.5 19.5 6.5 C 25 6.5 29.5 9.5 32 14 C 34.5 9.5 39 6.5 44.5 6.5 C 52.5 6.5 59 12.5 59 21.5 C 59 31 52 42 32 55 Z";

export function HeartArt({ size = 64, className, broken = false }: ArtProps & { broken?: boolean }) {
  const u = useUid("h");
  const body = (
    <>
      <path d={HP} fill="#8e0f2c" transform="translate(0 3)" />
      <path d={HP} fill={`url(#${u})`} />
      <ellipse cx="20" cy="17" rx="7" ry="4.5" fill="#fff" opacity=".6" transform="rotate(-32 20 17)" />
      <circle cx="13.5" cy="24.5" r="1.8" fill="#fff" opacity=".75" />
    </>
  );
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={[[0, "#ffa3b1"], [0.45, "#ff4d6a"], [1, "#d11d40"]]} />
        <clipPath id={`${u}l`}>
          <path d="M0 0 H33 L28 16 L35 26 L27 38 L33 64 H0 Z" />
        </clipPath>
        <clipPath id={`${u}r`}>
          <path d="M33 0 H64 V64 H33 L27 38 L35 26 L28 16 Z" />
        </clipPath>
      </defs>
      <Shadow w={18} />
      {broken ? (
        <>
          <g clipPath={`url(#${u}l)`} transform="translate(-3 2) rotate(-8 32 32)">
            {body}
          </g>
          <g clipPath={`url(#${u}r)`} transform="translate(3 2) rotate(8 32 32)">
            {body}
          </g>
        </>
      ) : (
        body
      )}
    </Svg>
  );
}

/* ---------------- FLAME ---------------- */
export function FlameArt({ size = 64, className, cold = false }: ArtProps & { cold?: boolean }) {
  const u = useUid("f");
  const outer = cold ? [[0, "#c7f6ff"], [0.5, "#5fd4ff"], [1, "#1e7fd6"]] : [[0, "#ffd36b"], [0.5, "#ff8a3d"], [1, "#e8324f"]];
  const inner = cold ? [[0, "#ffffff"], [1, "#9fe8ff"]] : [[0, "#fff8c9"], [1, "#ffc13d"]];
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={`${u}o`} stops={outer as [number, string][]} />
        <Lin id={`${u}i`} stops={inner as [number, string][]} />
      </defs>
      <Shadow w={15} />
      <g className="flame" style={{ transformOrigin: "32px 56px" }}>
        <path
          d="M32 3 C 36 13 51 21 51 38 C 51 50 42.5 58.5 32 58.5 C 21.5 58.5 13 50 13 38 C 13 30 17 24.5 21.5 20.5 C 21.5 27 24.5 31 28 32 C 25.5 21.5 27.5 11.5 32 3 Z"
          fill={`url(#${u}o)`}
        />
        <path
          d="M32 25 C 35.5 31.5 42.5 36 42.5 44 C 42.5 51 37.5 55.5 32 55.5 C 26.5 55.5 21.5 51 21.5 45 C 21.5 40 24.5 37 27 35 C 27.8 38 29.6 40.2 31.2 40.5 C 30 35 30 30 32 25 Z"
          fill={`url(#${u}i)`}
        />
        <ellipse cx="32" cy="48" rx="4.5" ry="5.5" fill="#fff" opacity=".85" />
        <path d="M22 26 C 19 30 17.5 34 18 39" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".55" />
      </g>
    </Svg>
  );
}

/* ---------------- CHEST ---------------- */
export function ChestArt({ size = 64, className, open = false }: ArtProps & { open?: boolean }) {
  const u = useUid("ch");
  const lid = (
    <>
      <path d="M7 31 V22 C7 14 15 9 32 9 C49 9 57 14 57 22 V31 Z" fill="#3a220c" transform="translate(0 1.5)" />
      <path d="M7 31 V22 C7 14 15 9 32 9 C49 9 57 14 57 22 V31 Z" fill={`url(#${u}l)`} />
      <path d="M13 12.2 V31 H19 V10.3 Z" fill={`url(#${u}g)`} />
      <path d="M45 10.3 V31 H51 V12.2 Z" fill={`url(#${u}g)`} />
      <path d="M11 20 C 14 14 22 12 30 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".35" />
    </>
  );
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={`${u}w`} stops={[[0, "#8a5a2b"], [1, "#4d2e12"]]} />
        <Lin id={`${u}l`} stops={[[0, "#b07a40"], [1, "#6b4219"]]} />
        <Lin id={`${u}g`} stops={GOLD} />
        <radialGradient id={`${u}r`}>
          <stop offset="0" stopColor="#fff6c8" stopOpacity="1" />
          <stop offset="1" stopColor="#ffc24b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Shadow w={25} />
      {open && (
        <g>
          <ellipse cx="32" cy="26" rx="30" ry="24" fill={`url(#${u}r)`} />
          <path d="M26 30 L14 -6 L24 -6 Z" fill="#fff3b0" opacity=".45" />
          <path d="M32 30 L28 -10 L36 -10 Z" fill="#fff3b0" opacity=".6" />
          <path d="M38 30 L40 -6 L50 -6 Z" fill="#fff3b0" opacity=".45" />
        </g>
      )}
      <rect x="7" y="31" width="50" height="26" rx="4" fill="#2e1a08" transform="translate(0 2.5)" />
      <rect x="7" y="31" width="50" height="26" rx="4" fill={`url(#${u}w)`} />
      <rect x="7" y="41" width="50" height="3" fill="#000" opacity=".22" />
      <rect x="13" y="31" width="6" height="26" fill={`url(#${u}g)`} />
      <rect x="45" y="31" width="6" height="26" fill={`url(#${u}g)`} />
      {open ? (
        <>
          <rect x="9" y="27" width="46" height="6" rx="2" fill="#140a03" />
          <circle cx="23" cy="28" r="4" fill={`url(#${u}g)`} />
          <circle cx="32" cy="26" r="4.5" fill={`url(#${u}g)`} />
          <circle cx="41" cy="28" r="4" fill={`url(#${u}g)`} />
          <polygon points="28,24 32,18 36,24 32,28" fill="#62e7ff" />
          <g transform="translate(-2 -17) rotate(-14 8 31)">{lid}</g>
        </>
      ) : (
        <>
          {lid}
          <rect x="26.5" y="25" width="11" height="13" rx="2.5" fill={`url(#${u}g)`} stroke="#8f5608" strokeWidth="1" />
          <circle cx="32" cy="30.3" r="1.9" fill="#5a3505" />
          <rect x="31.2" y="31" width="1.6" height="4" rx=".8" fill="#5a3505" />
        </>
      )}
    </Svg>
  );
}

/* ---------------- TROPHY ---------------- */
export function TrophyArt({ size = 64, className }: ArtProps) {
  const u = useUid("t");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={GOLD} />
      </defs>
      <Shadow w={17} />
      <path d="M17 12 H10 C10 22 13 26 19 27" stroke="#c7801a" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d="M47 12 H54 C54 22 51 26 45 27" stroke="#c7801a" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d="M17 8 H47 V21 C47 31.5 40.5 38 32 38 C23.5 38 17 31.5 17 21 Z" fill="#9a6209" transform="translate(0 2)" />
      <path d="M17 8 H47 V21 C47 31.5 40.5 38 32 38 C23.5 38 17 31.5 17 21 Z" fill={`url(#${u})`} />
      <rect x="28.5" y="37" width="7" height="8" fill="#b8741a" />
      <path d="M20 52 L23 45 H41 L44 52 Z" fill="#1e3159" />
      <rect x="22" y="44" width="20" height="3" rx="1" fill={`url(#${u})`} />
      <rect x="16" y="52" width="32" height="6" rx="2" fill="#16233f" />
      <rect x="16" y="52" width="32" height="1.5" rx=".75" fill="#3a5288" />
      <path d="M32 15 L34.1 19.4 L38.9 20 L35.4 23.3 L36.3 28 L32 25.7 L27.7 28 L28.6 23.3 L25.1 20 L29.9 19.4 Z" fill="#fff7cf" />
      <path d="M21 11 V21 C21 26 23 30 26 32" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".6" />
    </Svg>
  );
}

/* ---------------- CROWN ---------------- */
export function CrownArt({ size = 64, className }: ArtProps) {
  const u = useUid("cr");
  const P = "M6 20 L18 33 L32 10 L46 33 L58 20 L52 50 H12 Z";
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={GOLD} />
      </defs>
      <Shadow w={20} />
      <path d={P} fill="#8f5608" transform="translate(0 3)" />
      <path d={P} fill={`url(#${u})`} />
      <rect x="12" y="42" width="40" height="8" fill="#c7801a" />
      <rect x="12" y="42" width="40" height="1.6" fill="#ffe7a3" opacity=".8" />
      <circle cx="32" cy="46" r="3.3" fill="#ff4d6a" stroke="#fff" strokeOpacity=".5" />
      <circle cx="21.5" cy="46" r="2.4" fill="#38e1ff" />
      <circle cx="42.5" cy="46" r="2.4" fill="#38e1ff" />
      <circle cx="6" cy="20" r="3.6" fill="#ffe7a3" />
      <circle cx="32" cy="10" r="3.8" fill="#ffe7a3" />
      <circle cx="58" cy="20" r="3.6" fill="#ffe7a3" />
      <path d="M15 38 L20 27" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".6" />
    </Svg>
  );
}

/* ---------------- SHIELD ---------------- */
export function ShieldArt({ size = 64, className }: ArtProps) {
  const u = useUid("s");
  const O = "M32 5 L55 13 V30 C55 44 45 54 32 59 C19 54 9 44 9 30 V13 Z";
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={`${u}o`} stops={[[0, "#a9c1ff"], [0.5, "#5b7fe0"], [1, "#233f94"]]} />
        <Lin id={`${u}i`} stops={[[0, "#1b2d57"], [1, "#0a1226"]]} />
      </defs>
      <Shadow w={17} />
      <path d={O} fill="#15285e" transform="translate(0 3)" />
      <path d={O} fill={`url(#${u}o)`} />
      <path d="M32 11 L49 17 V30 C49 41 41.5 49 32 53 C22.5 49 15 41 15 30 V17 Z" fill={`url(#${u}i)`} />
      <path d="m22.5 31 6.5 6.5 12.5-13" stroke="#2be08a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="m22.5 31 6.5 6.5 12.5-13" stroke="#b6ffd9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".7" />
      <path d="M14 15 L30 9.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".6" />
    </Svg>
  );
}

/* ---------------- BOLT ---------------- */
export function BoltArt({ size = 64, className }: ArtProps) {
  const u = useUid("b");
  const P = "M37 3 L11 36 H29 L24 61 L53 25 H35 Z";
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={[[0, "#fff6b0"], [0.5, "#ffd23f"], [1, "#f08c00"]]} />
      </defs>
      <Shadow w={13} y={61} />
      <path d={P} fill="#9a5a00" transform="translate(1.5 2.5)" />
      <path d={P} fill={`url(#${u})`} stroke="#b36b00" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M34 8 L17 31" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".7" />
    </Svg>
  );
}

/* ---------------- KEY ---------------- */
export function KeyArt({ size = 64, className }: ArtProps) {
  const u = useUid("k");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={GOLD} />
      </defs>
      <Shadow w={16} />
      <g transform="rotate(-35 32 32)">
        <circle cx="17" cy="33.5" r="11" fill="none" stroke="#8f5608" strokeWidth="7" />
        <circle cx="17" cy="32" r="11" fill="none" stroke={`url(#${u})`} strokeWidth="7" />
        <rect x="27" y="30" width="31" height="6.5" rx="2" fill="#8f5608" />
        <rect x="27" y="28.5" width="31" height="6.5" rx="2" fill={`url(#${u})`} />
        <rect x="47" y="34" width="5" height="9" rx="1.2" fill={`url(#${u})`} />
        <rect x="39" y="34" width="4.5" height="6" rx="1.2" fill={`url(#${u})`} />
        <path d="M10 27 A8 8 0 0 1 18 23" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      </g>
    </Svg>
  );
}

/* ---------------- POTION (XP BOOST) ---------------- */
export function PotionArt({ size = 64, className, color = "#9b6bff" }: ArtProps & { color?: string }) {
  const u = useUid("p");
  return (
    <Svg size={size} className={className}>
      <defs>
        <clipPath id={`${u}c`}>
          <circle cx="32" cy="40" r="18" />
        </clipPath>
        <Lin id={`${u}l`} stops={[[0, "#e1d2ff"], [0.35, color], [1, "#3a1690"]]} />
      </defs>
      <Shadow w={16} />
      <rect x="24.5" y="3" width="15" height="7" rx="2.5" fill="#8a5a2b" />
      <rect x="24.5" y="3" width="15" height="2" rx="1" fill="#c79560" />
      <rect x="26.5" y="9" width="11" height="13" rx="2" fill="rgba(200,220,255,.22)" stroke="#cfe0ff" strokeOpacity=".55" />
      <circle cx="32" cy="40" r="19" fill="rgba(160,190,255,.14)" stroke="#cfe0ff" strokeOpacity=".6" strokeWidth="1.5" />
      <g clipPath={`url(#${u}c)`}>
        <path className="slosh" d="M8 34 Q 20 29 32 34 T 56 34 V64 H8 Z" fill={`url(#${u}l)`} />
        <circle className="bubble-rise" cx="26" cy="52" r="2.2" fill="#fff" opacity=".7" />
        <circle className="bubble-rise" style={{ animationDelay: ".7s" }} cx="36" cy="54" r="1.6" fill="#fff" opacity=".7" />
        <circle className="bubble-rise" style={{ animationDelay: "1.3s" }} cx="31" cy="55" r="1.2" fill="#fff" opacity=".7" />
      </g>
      <path d="M19 33 A14 14 0 0 1 27 25" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".75" />
      <text x="32" y="47" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="JetBrains Mono, monospace">
        XP
      </text>
    </Svg>
  );
}

/* ---------------- TICKET ---------------- */
export function TicketArt({ size = 64, className }: ArtProps) {
  const u = useUid("tk");
  const P = "M7 19 H57 V27.5 A4.5 4.5 0 0 0 57 36.5 V45 H7 V36.5 A4.5 4.5 0 0 0 7 27.5 Z";
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={[[0, "#d3bcff"], [0.5, "#9b6bff"], [1, "#5628b5"]]} />
      </defs>
      <Shadow w={20} />
      <g transform="rotate(-12 32 32)">
        <path d={P} fill="#3a1690" transform="translate(0 2.5)" />
        <path d={P} fill={`url(#${u})`} />
        <path d="M22 21 V43" stroke="#fff" strokeWidth="1.6" strokeDasharray="2.5 2.5" opacity=".6" />
        <path d="M39 25.5 L41 30 L45.8 30.4 L42.1 33.5 L43.3 38.2 L39 35.6 L34.7 38.2 L35.9 33.5 L32.2 30.4 L37 30 Z" fill="#ffe27a" />
        <path d="M10 22 H30" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
      </g>
    </Svg>
  );
}

/* ---------------- MEDAL ---------------- */
export function MedalArt({ size = 64, className }: ArtProps) {
  const u = useUid("m");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={GOLD} />
      </defs>
      <Shadow w={15} />
      <polygon points="17,3 28,3 37,27 26,27" fill="#ff4d6a" />
      <polygon points="17,3 21,3 30,27 26,27" fill="#ff8fa2" />
      <polygon points="47,3 36,3 27,27 38,27" fill="#2c6fd8" />
      <circle cx="32" cy="42" r="17" fill="#8f5608" />
      <circle cx="32" cy="40" r="17" fill={`url(#${u})`} />
      <circle cx="32" cy="40" r="11.5" fill="#e39a1f" />
      <path d="M32 32 L34.3 36.8 L39.6 37.4 L35.7 41 L36.7 46.2 L32 43.6 L27.3 46.2 L28.3 41 L24.4 37.4 L29.7 36.8 Z" fill="#fff4c2" />
      <path d="M19 36 A13 13 0 0 1 27 25.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".7" />
    </Svg>
  );
}

/* ---------------- ROCKET ---------------- */
export function RocketArt({ size = 64, className }: ArtProps) {
  const u = useUid("r");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={`${u}b`} stops={[[0, "#ffffff"], [0.6, "#cfd9ee"], [1, "#8193b8"]]} x2={1} y2={0} />
        <Lin id={`${u}f`} stops={[[0, "#fff3a0"], [0.5, "#ffb020"], [1, "#ff4d3a"]]} />
      </defs>
      <Shadow w={14} />
      <g transform="rotate(38 32 32)">
        <path className="flicker" d="M25.5 45 Q32 66 38.5 45 Z" fill={`url(#${u}f)`} style={{ transformOrigin: "32px 45px" }} />
        <path d="M22 34 L12.5 47 L22.5 45 Z" fill="#d61f42" />
        <path d="M42 34 L51.5 47 L41.5 45 Z" fill="#a01131" />
        <path d="M32 3 C42.5 11 45 26 42.5 45 H21.5 C19 26 21.5 11 32 3 Z" fill={`url(#${u}b)`} />
        <path d="M32 3 C36 6 38.5 10 40 14 H24 C25.5 10 28 6 32 3 Z" fill="#ff4d6a" />
        <circle cx="32" cy="24" r="6.5" fill="#2c4a8a" />
        <circle cx="32" cy="24" r="4.5" fill="#38e1ff" />
        <circle cx="30.5" cy="22.5" r="1.5" fill="#fff" />
        <rect x="27" y="40" width="10" height="5" rx="1" fill="#6d7ea3" />
        <path d="M25 16 C24 22 24 30 24.5 38" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".8" fill="none" />
      </g>
    </Svg>
  );
}

/* ---------------- STREAK FREEZE (ICE) ---------------- */
export function FreezeArt({ size = 64, className }: ArtProps) {
  return (
    <Svg size={size} className={className}>
      <Shadow w={20} />
      <polygon points="32,6 57,18.5 32,31 7,18.5" fill="#e3fcff" />
      <polygon points="7,18.5 32,31 32,59 7,46.5" fill="#7fe3f7" />
      <polygon points="57,18.5 32,31 32,59 57,46.5" fill="#34b5dc" />
      <path d="M19.5 33 V48 M13 36.5 L26 44.5 M13 44.5 L26 36.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".9" />
      <path d="M44.5 33 V48 M38 36.5 L51 44.5 M38 44.5 L51 36.5" stroke="#dff8ff" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      <polyline points="7,18.5 32,6 57,18.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M22 14 L32 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path className="twinkle" d="M54 4 L55 8 L59 9 L55 10 L54 14 L53 10 L49 9 L53 8 Z" fill="#fff" />
    </Svg>
  );
}

/* ---------------- STAR ---------------- */
export function StarArt({ size = 64, className }: ArtProps) {
  const u = useUid("st");
  const P = "M32 5 L39.6 22.3 L58.4 24 L44.2 36.6 L48.3 55 L32 45.4 L15.7 55 L19.8 36.6 L5.6 24 L24.4 22.3 Z";
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={GOLD} />
      </defs>
      <Shadow w={16} />
      <path d={P} fill="#8f5608" transform="translate(0 3)" />
      <path d={P} fill={`url(#${u})`} stroke="#ffe7a3" strokeWidth="1" strokeLinejoin="round" />
      <path d="M32 14 L36 24 L32 38 L28 24 Z" fill="#fff" opacity=".35" />
      <path d="M17 26 L25 25" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
    </Svg>
  );
}

/* ---------------- LOCK ---------------- */
export function LockArt({ size = 64, className }: ArtProps) {
  const u = useUid("l");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={[[0, "#c9d6f2"], [0.5, "#7d8db4"], [1, "#3d4d73"]]} />
      </defs>
      <Shadow w={17} />
      <path d="M20 29 V20 a12 12 0 0 1 24 0 V29" stroke="#3d4d73" strokeWidth="6.5" fill="none" />
      <path d="M20 28 V20 a12 12 0 0 1 24 0 V28" stroke={`url(#${u})`} strokeWidth="5" fill="none" />
      <rect x="13" y="29" width="38" height="29" rx="7" fill="#2a3858" />
      <rect x="13" y="27" width="38" height="29" rx="7" fill={`url(#${u})`} />
      <circle cx="32" cy="39" r="4" fill="#1a2440" />
      <rect x="30.3" y="40" width="3.4" height="8" rx="1.7" fill="#1a2440" />
      <path d="M17 32 H30" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </Svg>
  );
}

/* ---------------- CANDLE ---------------- */
export function CandleArt({ size = 64, className, bear = false }: ArtProps & { bear?: boolean }) {
  const u = useUid("cd");
  const st: [number, string][] = bear
    ? [[0, "#ffa3b1"], [0.5, "#ff4d6a"], [1, "#b8163a"]]
    : [[0, "#a8ffd4"], [0.5, "#2be08a"], [1, "#0f8f55"]];
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={st} x2={1} y2={0} />
      </defs>
      <Shadow w={12} />
      <rect x="30" y="3" width="4" height="58" rx="2" fill={bear ? "#8e0f2c" : "#0f7048"} />
      <rect x="20" y="16" width="24" height="34" rx="5" fill={bear ? "#6b0a20" : "#0a4f32"} transform="translate(0 2.5)" />
      <rect x="20" y="16" width="24" height="34" rx="5" fill={`url(#${u})`} />
      <rect x="23.5" y="19.5" width="4" height="27" rx="2" fill="#fff" opacity=".55" />
      {bear ? (
        <path d="M32 26 V40 M26.5 35 L32 40.5 L37.5 35" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".9" />
      ) : (
        <path d="M32 40 V26 M26.5 31 L32 25.5 L37.5 31" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".9" />
      )}
    </Svg>
  );
}

/* ---------------- WHALE (market mover) ---------------- */
export function WhaleArt({ size = 64, className }: ArtProps) {
  const u = useUid("w");
  return (
    <Svg size={size} className={className}>
      <defs>
        <Lin id={u} stops={[[0, "#8fd8ff"], [0.5, "#3a8fe0"], [1, "#1c3f8f"]]} />
      </defs>
      <Shadow w={22} />
      <path d="M6 36 C6 22 20 16 34 18 C46 20 54 28 55 36 C58 34 61 30 62 26 C62 34 60 40 55 42 C52 50 42 54 30 54 C16 54 6 48 6 36 Z" fill="#12306e" transform="translate(0 2)" />
      <path d="M6 36 C6 22 20 16 34 18 C46 20 54 28 55 36 C58 34 61 30 62 26 C62 34 60 40 55 42 C52 50 42 54 30 54 C16 54 6 48 6 36 Z" fill={`url(#${u})`} />
      <path d="M8 40 C14 48 30 50 44 46" stroke="#d9f4ff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".55" />
      <circle cx="18" cy="33" r="2.6" fill="#0a1226" />
      <circle cx="17.2" cy="32.2" r=".9" fill="#fff" />
      <path className="spout" d="M26 17 C24 10 20 8 17 9 M26 17 C27 10 31 7 35 8" stroke="#bfefff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M14 25 C18 21 24 20 28 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".6" />
    </Svg>
  );
}

/* ================================================================== */
/*  REGISTRY                                                           */
/* ================================================================== */
export const ART = {
  coin: CoinArt,
  gem: GemArt,
  heart: HeartArt,
  flame: FlameArt,
  chest: ChestArt,
  trophy: TrophyArt,
  crown: CrownArt,
  shield: ShieldArt,
  bolt: BoltArt,
  key: KeyArt,
  potion: PotionArt,
  ticket: TicketArt,
  medal: MedalArt,
  rocket: RocketArt,
  freeze: FreezeArt,
  star: StarArt,
  lock: LockArt,
  candle: CandleArt,
  whale: WhaleArt,
} satisfies Record<string, ComponentType<ArtProps>>;

export type ArtKey = keyof typeof ART;
export const ART_KEYS = Object.keys(ART) as ArtKey[];

/* ================================================================== */
/*  RARITY                                                             */
/* ================================================================== */
export type Rarity = "common" | "rare" | "epic" | "legendary";
export const RARITY: Record<Rarity, { c: string; e: string; label: string }> = {
  common: { c: "#8a9ac2", e: "#3d4d73", label: "Common" },
  rare: { c: "#38e1ff", e: "#0b6f8d", label: "Rare" },
  epic: { c: "#b48aff", e: "#4a1f9c", label: "Epic" },
  legendary: { c: "#ffc24b", e: "#9a6209", label: "Legendary" },
};

export function ItemTile({
  art,
  rarity = "common",
  label,
  count,
  size = 56,
  onClick,
  className,
  children,
  dim,
}: {
  art: ArtKey;
  rarity?: Rarity;
  label?: string;
  count?: string | number;
  size?: number;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  dim?: boolean;
}) {
  const r = RARITY[rarity];
  const A = ART[art];
  const shiny = rarity === "epic" || rarity === "legendary";
  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className={cn("group relative flex cursor-pointer select-none flex-col items-stretch rounded-[18px] p-[2px]", dim && "opacity-50 grayscale", className)}
      style={{
        background: `linear-gradient(160deg, ${r.c}, ${r.e})`,
        boxShadow: `0 5px 0 ${r.e}, 0 16px 26px -14px ${r.c}`,
      }}
    >
      <div
        className={cn("relative flex flex-col items-center overflow-hidden rounded-[16px] px-2 pb-2 pt-3", shiny && "shine")}
        style={{ background: `radial-gradient(circle at 50% 30%, ${r.c}44, #0b1224 72%)` }}
      >
        {rarity === "legendary" && (
          <span
            className="spin-slow pointer-events-none absolute left-1/2 top-[38%] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-40"
            style={{ background: `repeating-conic-gradient(${r.c}55 0deg 10deg, transparent 10deg 30deg)`, maskImage: "radial-gradient(circle,#000 10%,transparent 60%)", WebkitMaskImage: "radial-gradient(circle,#000 10%,transparent 60%)" }}
          />
        )}
        <A size={size} className="relative drop-shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
        {label && <span className="relative mt-1.5 text-center text-[11px] font-extrabold leading-tight text-white">{label}</span>}
        <span className="relative mt-0.5 font-mono text-[7.5px] font-black uppercase tracking-[0.18em]" style={{ color: r.c }}>
          {r.label}
        </span>
        {count !== undefined && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 font-mono text-[9px] font-black text-white">{count}</span>
        )}
        {children}
      </div>
    </motion.div>
  );
}
