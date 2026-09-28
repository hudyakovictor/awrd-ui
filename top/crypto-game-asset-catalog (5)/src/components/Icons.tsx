import { useId, type CSSProperties, type ReactNode } from "react";

const P = (d: string) => <path d={d} />;

export const ICONS: Record<string, ReactNode> = {
  home: P("M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"),
  book: <>{P("M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z")}{P("M4 19.5A2 2 0 0 0 6 21h13")}{P("M9 7h6")}</>,
  trophy: <>{P("M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z")}{P("M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3")}</>,
  user: <><circle cx="12" cy="8" r="4" />{P("M4 21a8 8 0 0 1 16 0")}</>,
  users: <><circle cx="9" cy="8" r="3.5" />{P("M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6")}</>,
  bell: P("M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"),
  settings: <><circle cx="12" cy="12" r="3" />{P("M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z")}</>,
  search: <><circle cx="11" cy="11" r="7" />{P("m20 20-3.5-3.5")}</>,
  chart: P("M3 3v18h18M7 15l4-4 3 3 6-6"),
  candles: <>{P("M7 3v4M7 17v4M17 3v2M17 15v6")}<rect x="5" y="7" width="4" height="10" rx="1" /><rect x="15" y="5" width="4" height="10" rx="1" /></>,
  wallet: <>{P("M3 7a2 2 0 0 1 2-2h13v4")}{P("M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z")}{P("M16 14h.01")}</>,
  shield: <>{P("M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z")}{P("m9 12 2 2 4-4")}</>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" />{P("M8 11V7a4 4 0 0 1 8 0v4")}</>,
  check: P("M5 12.5l4.5 4.5L19 7.5"),
  x: P("M6 6l12 12M18 6 6 18"),
  chevR: P("m9 6 6 6-6 6"),
  chevL: P("m15 6-6 6 6 6"),
  chevD: P("m6 9 6 6 6-6"),
  chevU: P("m6 15 6-6 6 6"),
  arrowUp: P("M12 19V5M5 12l7-7 7 7"),
  arrowDown: P("M12 5v14M19 12l-7 7-7-7"),
  trendUp: P("M3 17l6-6 4 4 8-8M15 7h6v6"),
  trendDown: P("M3 7l6 6 4-4 8 8M15 17h6v-6"),
  info: <><circle cx="12" cy="12" r="9" />{P("M12 11v5M12 8h.01")}</>,
  warning: P("M12 3 2 20h20zM12 10v4M12 17h.01"),
  plus: P("M12 5v14M5 12h14"),
  minus: P("M5 12h14"),
  volume: P("M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"),
  mute: P("M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"),
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" />{P("M5 15V5a2 2 0 0 1 2-2h8")}</>,
  sparkles: P("M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"),
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  clock: <><circle cx="12" cy="12" r="9" />{P("M12 7v5l3 2")}</>,
  gift: P("M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7S10 3 7.5 3.5 7 7 12 7zM12 7s2-4 4.5-3.5S17 7 12 7z"),
  filter: P("M3 5h18l-7 8v6l-4 2v-8z"),
  sort: P("M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"),
  layers: P("M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5"),
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  menu: P("M4 6h16M4 12h16M4 18h16"),
  play: P("M7 4v16l13-8z"),
  refresh: P("M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"),
  eye: <>{P("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z")}<circle cx="12" cy="12" r="3" /></>,
  eyeOff: P("M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.5 4.6-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2"),
  dumbbell: P("M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"),
  folder: P("M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"),
  bitcoin: P("M9 4v16M13 4v2M13 18v2M7 6h7a3 3 0 0 1 0 6H7M7 12h8a3 3 0 0 1 0 6H7"),
  swap: P("M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"),
  flame: P("M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 11 10.5 11C10.5 7 12 2 12 2z"),
  heart: P("M12 20s-8-4.5-8-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.5 12 20 12 20z"),
  bolt: P("M13 2 4 14h7l-1 8 9-12h-7z"),
  gem: P("M6 3h12l4 6-10 12L2 9zM2 9h20M12 21 8 9l4-6 4 6z"),
  star: P("M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z"),
  crown: P("M3 19h18M4 8l4 4 4-7 4 7 4-4-1.5 9h-13z"),
  coin: <><circle cx="12" cy="12" r="9" />{P("M12 6.5v11M14.5 9h-3.5a1.75 1.75 0 0 0 0 3.5h2a1.75 1.75 0 0 1 0 3.5H9.5")}</>,
  logout: P("M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"),
  send: P("M22 2 11 13M22 2l-7 20-4-9-9-4z"),
  moreH: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  link: P("M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"),
  brain: P("M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"),
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, stroke = 2, className, style }: { name: string; size?: number; stroke?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/* ---------- Filled volumetric game glyphs ---------- */
type GlyphName = "flame" | "gem" | "heart" | "bolt" | "coin" | "star" | "crown" | "shield" | "chest" | "rocket";
export function Glyph({ name, size = 28, className, dim }: { name: GlyphName; size?: number; className?: string; dim?: boolean }) {
  const id = useId().replace(/:/g, "");
  const g = (a: string, b: string) => (
    <defs>
      <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
    </defs>
  );
  const fill = `url(#g${id})`;
  const hl = "rgba(255,255,255,.55)";
  const body: Record<GlyphName, ReactNode> = {
    flame: <>{g("#FFD24A", "#FF5A1F")}<path d="M16 2.5s8 6.5 8 15a8 8 0 0 1-16 0c0-3.4 1.8-5.8 1.8-5.8s1 3.3 3.2 3.3C13 10 16 2.5 16 2.5z" fill={fill} /><path d="M16 17c2.6 2 3.5 4 3.5 5.6a3.5 3.5 0 0 1-7 0c0-2 1.6-3.6 3.5-5.6z" fill="#FFE9A3" /></>,
    gem: <>{g("#7FE3FF", "#2E7BFF")}<path d="M9 5h14l6 7-13 16L3 12z" fill={fill} /><path d="M3 12h26L16 28z" fill="rgba(0,20,80,.25)" /><path d="M9 5l3 7 4-7 4 7 3-7" fill="none" stroke={hl} strokeWidth="1.3" /></>,
    heart: <>{g("#FF7A93", "#E0203F")}<path d="M16 27S4 20.5 4 11.8A6.3 6.3 0 0 1 16 8.6a6.3 6.3 0 0 1 12 3.2C28 20.5 16 27 16 27z" fill={fill} /><ellipse cx="10.5" cy="11" rx="2.6" ry="1.7" fill={hl} transform="rotate(-30 10.5 11)" /></>,
    bolt: <>{g("#FFE36A", "#FF9F1A")}<path d="M18 2 6 18h9l-2 12 13-17h-9z" fill={fill} /><path d="M17 5 9 16" stroke={hl} strokeWidth="1.4" strokeLinecap="round" /></>,
    coin: <>{g("#FFE27A", "#E39A0B")}<circle cx="16" cy="16" r="13" fill="#B87406" /><circle cx="16" cy="15" r="12" fill={fill} /><circle cx="16" cy="15" r="8.5" fill="none" stroke="rgba(140,80,0,.45)" strokeWidth="1.5" /><path d="M13 10.5h4.2a2.2 2.2 0 0 1 0 4.5H13h4.8a2.3 2.3 0 0 1 0 4.6H13zM14.5 9v12" fill="none" stroke="#8A5200" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 11a9 9 0 0 1 5-4" stroke={hl} strokeWidth="1.6" strokeLinecap="round" fill="none" /></>,
    star: <>{g("#FFE27A", "#FFA41B")}<path d="M16 3l3.9 8 8.8 1.3-6.4 6.2 1.5 8.8L16 23.1l-7.8 4.2 1.5-8.8-6.4-6.2L12.1 11z" fill={fill} /><path d="M16 7l2 4.5" stroke={hl} strokeWidth="1.5" strokeLinecap="round" /></>,
    crown: <>{g("#D5B8FF", "#7B45FF")}<path d="M4 11l6 5 6-10 6 10 6-5-2.5 14h-19z" fill={fill} /><rect x="6" y="25" width="20" height="3" rx="1.5" fill="#5A2CD6" /><circle cx="16" cy="6" r="2" fill="#FFE27A" /><circle cx="4" cy="11" r="1.8" fill="#FFE27A" /><circle cx="28" cy="11" r="1.8" fill="#FFE27A" /></>,
    shield: <>{g("#6CF2B8", "#0FA968")}<path d="M16 3l11 4v8c0 7-5 11.5-11 13-6-1.5-11-6-11-13V7z" fill={fill} /><path d="M11 15.5l3.5 3.5 6.5-7" fill="none" stroke="#063B25" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></>,
    chest: <>{g("#FFB35C", "#B8560E")}<rect x="4" y="13" width="24" height="14" rx="3" fill={fill} /><path d="M4 13a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6z" fill="#E07A1F" /><rect x="4" y="12" width="24" height="3" fill="#FFD27A" /><rect x="13.5" y="12" width="5" height="8" rx="1.5" fill="#FFE9A3" /></>,
    rocket: <>{g("#B0C4FF", "#5A73E8")}<path d="M16 3c5 3 7 9 6 15h-12c-1-6 1-12 6-15z" fill={fill} /><circle cx="16" cy="11" r="2.6" fill="#0F1B3F" stroke="#E6ECFF" strokeWidth="1.2" /><path d="M10 18l-4 5 5-1zM22 18l4 5-5-1z" fill="#FF5A7A" /><path d="M13 20h6l-3 8z" fill="#FFB020" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ filter: dim ? "grayscale(1) brightness(.55)" : "drop-shadow(0 2px 0 rgba(0,0,0,.35))" }} aria-hidden>
      {body[name]}
    </svg>
  );
}
