import { useId, type CSSProperties } from "react";

/* ================= LINE ICONS ================= */
const P: Record<string, string> = {
  home: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 23H20M8 7h8M8 11h6",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4.5a3.5 3.5 0 0 0 3.8 3.5M16 6h3.5a3.5 3.5 0 0 1-3.8 3.5M12 13v4M8.5 20h7M9.5 17h5v3h-5z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
  chart: "M4 20V4M4 20h16M8 16l3.5-4 3 2.5L20 8",
  candle: "M7 3v4M7 15v6M5 7h4v8H5zM17 3v2M17 13v8M15 5h4v8h-4z",
  wallet: "M3.5 7.5A2.5 2.5 0 0 1 6 5h12v3M3.5 7.5V18A2 2 0 0 0 5.5 20h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-14a2 2 0 0 1-2-1.5ZM16.5 14.5h.01",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2 1.2L14.8 21h-4l-.3-2.4a7 7 0 0 1-2-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-2.4L4.6 9.9l2-3.4 1.9.7a7 7 0 0 1 2-1.2L10.8 3h4l.3 2.4a7 7 0 0 1 2 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 2.4Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2",
  check: "M5 12.5 10 17.5 19.5 7",
  x: "M6 6l12 12M18 6 6 18",
  chevronRight: "M9 5l7 7-7 7",
  chevronLeft: "M15 5l-7 7 7 7",
  chevronDown: "M5 9l7 7 7-7",
  arrowUp: "M12 19V5M5.5 11.5 12 5l6.5 6.5",
  arrowDown: "M12 5v14M5.5 12.5 12 19l6.5-6.5",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z",
  shield: "M12 3 19 6v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3ZM9 12l2 2 4-4",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01",
  gift: "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3.5-5-3.5-5-1.5S10 7 12 7ZM12 7c1.5-3.5 5-3.5 5-1.5S14 7 12 7Z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01",
  warning: "M12 4 21.5 20h-19L12 4ZM12 10v4.5M12 17.5h.01",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2",
  filter: "M4 5h16l-6 7.5V19l-4 1.5v-8L4 5Z",
  sort: "M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  trendUp: "M3 17l6-6 4 4 8-8M15 7h6v6",
  trendDown: "M3 7l6 6 4-4 8 8M15 17h6v-6",
  volume: "M4 9.5h4L13 5v14l-5-4.5H4v-5ZM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  share: "M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6.5h14V13",
  copy: "M8 8h11v12H8zM5 16V4h11",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6",
  play: "M7 4.5v15l12.5-7.5L7 4.5Z",
  medal: "M8 3h8l-2 6h-4L8 3ZM12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  layers: "M12 3 21 8l-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 15.2c1.8.7 3 2.4 3.5 4.8",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2.5-2.5L20 17M15.5 9.5h.01",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  swap: "M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7",
  pie: "M12 3v9h9A9 9 0 1 1 12 3ZM15 3.5A9 9 0 0 1 20.5 9H15V3.5Z",
  brain: "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V4H9ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V4h1Z",
};
export type IconName = keyof typeof P;
export const iconNames = Object.keys(P) as IconName[];

export function Icon({
  name,
  size = 20,
  stroke = 2.2,
  className,
  style,
}: {
  name: IconName | string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d={P[name] ?? P.info} />
    </svg>
  );
}

/* ================= VOLUMETRIC GAME ICONS ================= */
type GIProps = { size?: number; className?: string; dim?: boolean };

function useIds(n: number) {
  const id = useId().replace(/:/g, "");
  return Array.from({ length: n }, (_, i) => `${id}g${i}`);
}

export function FlameIcon({ size = 32, className, dim }: GIProps) {
  const [a, b] = useIds(2);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.55)" } : undefined}>
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd05a" /><stop offset=".55" stopColor="#ff7a2f" /><stop offset="1" stopColor="#e2380f" /></linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe0" /><stop offset="1" stopColor="#ffc23d" /></linearGradient>
      </defs>
      <path d="M16 2.5c1 4.5 7.5 7.4 7.5 15.2A7.5 7.5 0 0 1 16 29.5a7.5 7.5 0 0 1-7.5-7.8c0-3.4 1.8-5.7 3.3-7.2.3 2 1.1 3.3 2.2 3.8C13.2 12.6 14.6 6.8 16 2.5Z" fill={`url(#${a})`} />
      <path d="M16.2 15c.6 2.6 4 3.9 4 7.6a4.2 4.2 0 0 1-8.4 0c0-1.9 1-3 1.8-3.8.3 1 .8 1.5 1.3 1.7-.3-2.2.5-4 1.3-5.5Z" fill={`url(#${b})`} />
      <path d="M12 9.5c-1.4 1.8-2.3 3.8-2.1 6" stroke="#fff" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HeartIcon({ size = 32, className, dim }: GIProps) {
  const [a] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.5)" } : undefined}>
      <defs><linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8aa0" /><stop offset=".6" stopColor="#ff4d6d" /><stop offset="1" stopColor="#c8223f" /></linearGradient></defs>
      <path d="M16 28.5S3 21 3 11.8A6.8 6.8 0 0 1 16 8.4a6.8 6.8 0 0 1 13 3.4C29 21 16 28.5 16 28.5Z" fill="#8f1730" transform="translate(0 1.5)" />
      <path d="M16 28.5S3 21 3 11.8A6.8 6.8 0 0 1 16 8.4a6.8 6.8 0 0 1 13 3.4C29 21 16 28.5 16 28.5Z" fill={`url(#${a})`} />
      <ellipse cx="9.5" cy="11" rx="2.6" ry="1.7" fill="#fff" opacity=".6" transform="rotate(-35 9.5 11)" />
    </svg>
  );
}

export function GemIcon({ size = 32, className, dim }: GIProps) {
  const [a, b] = useIds(2);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.5)" } : undefined}>
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8ff0ff" /><stop offset="1" stopColor="#1c8cff" /></linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c6fe0" /><stop offset="1" stopColor="#0d3f9e" /></linearGradient>
      </defs>
      <path d="M8 5h16l5 7-13 16L3 12l5-7Z" fill={`url(#${b})`} />
      <path d="M8 5h16l5 7H3l5-7Z" fill={`url(#${a})`} />
      <path d="M3 12h26L16 28 3 12Z" fill={`url(#${a})`} opacity=".75" />
      <path d="M11 12l5 16 5-16M8 5l3 7 5-7 5 7 3-7" stroke="#fff" strokeOpacity=".5" strokeWidth=".9" fill="none" />
      <path d="M9.5 7.5l2 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function XPIcon({ size = 32, className, dim }: GIProps) {
  const [a] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.5)" } : undefined}>
      <defs><linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1a8" /><stop offset=".5" stopColor="#ffc23d" /><stop offset="1" stopColor="#ef9400" /></linearGradient></defs>
      <path d="M18 2 6 18h8l-2 12 13-17h-8.5L18 2Z" fill="#a86400" transform="translate(0 1.5)" />
      <path d="M18 2 6 18h8l-2 12 13-17h-8.5L18 2Z" fill={`url(#${a})`} />
      <path d="M15.5 6.5 10 14" stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon({ size = 32, className, dim }: GIProps) {
  const [a, b] = useIds(2);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.5)" } : undefined}>
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe28a" /><stop offset="1" stopColor="#f0a000" /></linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb400" /><stop offset="1" stopColor="#ffe28a" /></linearGradient>
      </defs>
      <circle cx="16" cy="17.5" r="13" fill="#a86400" />
      <circle cx="16" cy="16" r="13" fill={`url(#${a})`} />
      <circle cx="16" cy="16" r="9.8" fill={`url(#${b})`} />
      <path d="M13.5 10.5v11M16.5 10v1.5M16.5 20.5V22M12.5 11.5h5a2.3 2.3 0 0 1 0 4.5h-5M12.5 16h5.6a2.4 2.4 0 0 1 0 4.8h-5.6" stroke="#8a5200" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M8 11a9 9 0 0 1 5-4" stroke="#fff" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TrophyIcon({ size = 32, className, dim }: GIProps) {
  const [a] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={dim ? { filter: "grayscale(1) brightness(.5)" } : undefined}>
      <defs><linearGradient id={a} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1a8" /><stop offset=".5" stopColor="#ffc23d" /><stop offset="1" stopColor="#d68000" /></linearGradient></defs>
      <path d="M9 6H4.5a5 5 0 0 0 5.5 6M23 6h4.5a5 5 0 0 1-5.5 6" stroke="#e0a000" strokeWidth="2.2" fill="none" />
      <path d="M9 3.5h14V11a7 7 0 0 1-14 0V3.5Z" fill={`url(#${a})`} />
      <rect x="14" y="17" width="4" height="5" fill="#d68000" />
      <rect x="9.5" y="22" width="13" height="6" rx="1.5" fill="#5a3ccc" />
      <rect x="9.5" y="22" width="13" height="2" rx="1" fill="#9170ff" />
      <path d="M12 6v5" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChestIcon({ size = 32, className, open }: GIProps & { open?: boolean }) {
  const [a, b] = useIds(2);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9170ff" /><stop offset="1" stopColor="#4a2fb0" /></linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe28a" /><stop offset="1" stopColor="#e09000" /></linearGradient>
      </defs>
      {open && <ellipse cx="16" cy="14" rx="10" ry="5" fill="#ffc23d" opacity=".9" className="anim-glow" />}
      <rect x="4" y="14" width="24" height="14" rx="3" fill={`url(#${a})`} />
      <g style={{ transform: open ? "translate(0,-5px) rotate(-18deg)" : "none", transformOrigin: "4px 14px", transition: "transform .5s cubic-bezier(.2,1.5,.4,1)" }}>
        <path d="M4 14v-3a7 7 0 0 1 7-7h10a7 7 0 0 1 7 7v3H4Z" fill={`url(#${a})`} />
        <path d="M4 12h24v2.5H4z" fill={`url(#${b})`} />
      </g>
      <rect x="13" y="14" width="6" height="7" rx="1.5" fill={`url(#${b})`} />
      <rect x="4" y="19" width="24" height="2" fill={`url(#${b})`} opacity=".8" />
      <circle cx="16" cy="17.5" r="1.2" fill="#6b3f00" />
    </svg>
  );
}

export function ShieldIcon({ size = 32, className, tier = "gold" }: GIProps & { tier?: "bronze" | "silver" | "gold" | "diamond" | "elite" }) {
  const [a, b] = useIds(2);
  const c = {
    bronze: ["#ffb98a", "#c0642a", "#7a3a14"],
    silver: ["#ffffff", "#aebbd6", "#5f6f92"],
    gold: ["#fff1a8", "#ffc23d", "#b87400"],
    diamond: ["#b5f4ff", "#2fd4ff", "#1557c2"],
    elite: ["#e3d6ff", "#9170ff", "#3d2399"],
  }[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c[0]} /><stop offset=".55" stopColor={c[1]} /><stop offset="1" stopColor={c[2]} /></linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c[2]} /><stop offset="1" stopColor={c[1]} /></linearGradient>
      </defs>
      <path d="M16 2 28 6.5V15c0 7-5 12-12 15C9 27 4 22 4 15V6.5L16 2Z" fill={c[2]} transform="translate(0 1.2)" />
      <path d="M16 2 28 6.5V15c0 7-5 12-12 15C9 27 4 22 4 15V6.5L16 2Z" fill={`url(#${a})`} />
      <path d="M16 6.5 24 9.5V15c0 4.6-3.2 8-8 10.3C11.2 23 8 19.6 8 15V9.5l8-3Z" fill={`url(#${b})`} />
      <path d="M16 10.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5 1.6-3.3Z" fill={c[0]} />
      <path d="M7 8v6" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BullIcon({ size = 32, className }: GIProps) {
  const [a] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs><linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6bf0c0" /><stop offset="1" stopColor="#0c8f63" /></linearGradient></defs>
      <path d="M4 6c0 5 3 7 6 7M28 6c0 5-3 7-6 7" stroke="#e3eaf8" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M8 12h16l-1.5 9a6.5 6.5 0 0 1-13 0L8 12Z" fill={`url(#${a})`} />
      <ellipse cx="16" cy="22.5" rx="4.5" ry="3.2" fill="#0a6b4a" />
      <circle cx="14.4" cy="22.5" r=".9" fill="#03281b" /><circle cx="17.6" cy="22.5" r=".9" fill="#03281b" />
      <circle cx="12.5" cy="16" r="1.4" fill="#03281b" /><circle cx="19.5" cy="16" r="1.4" fill="#03281b" />
      <circle cx="12.9" cy="15.6" r=".45" fill="#fff" /><circle cx="19.9" cy="15.6" r=".45" fill="#fff" />
    </svg>
  );
}

export function BearIcon({ size = 32, className }: GIProps) {
  const [a] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs><linearGradient id={a} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8aa0" /><stop offset="1" stopColor="#b31f3d" /></linearGradient></defs>
      <circle cx="8" cy="8" r="4" fill="#b31f3d" /><circle cx="24" cy="8" r="4" fill="#b31f3d" />
      <circle cx="8" cy="8" r="2" fill="#ff8aa0" /><circle cx="24" cy="8" r="2" fill="#ff8aa0" />
      <circle cx="16" cy="17" r="11" fill={`url(#${a})`} />
      <ellipse cx="16" cy="21" rx="5" ry="3.8" fill="#ffd0da" />
      <ellipse cx="16" cy="19.6" rx="1.8" ry="1.2" fill="#5a0a1c" />
      <circle cx="11.5" cy="15" r="1.4" fill="#3a0512" /><circle cx="20.5" cy="15" r="1.4" fill="#3a0512" />
      <circle cx="11.9" cy="14.6" r=".45" fill="#fff" /><circle cx="20.9" cy="14.6" r=".45" fill="#fff" />
    </svg>
  );
}
