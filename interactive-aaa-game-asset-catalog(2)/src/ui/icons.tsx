/* =====================================================================
   ВЕКТОРНАЯ БИБЛИОТЕКА «SIGNAL» — ноль эмодзи, только SVG-геометрия.
   Иконки: stroke=currentColor, единая сетка 24, скруглённые концы.
   ===================================================================== */
type I = { size?: number; className?: string; w?: number };
const S = ({ size = 24, className, w = 2, children }: I & { children: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IcCap = (p: I) => <S {...p}><path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5Z" /><path d="M6 10.6V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.4" /><path d="M21 9v6" /></S>;
export const IcSwords = (p: I) => <S {...p}><path d="M14.5 14.5 21 21m-2.5-3.5L21 15l-2-2" /><path d="M3 3h4l11 11-3 3L4 6V3Z" opacity=".95" /><path d="M21 3h-4L6 14l3 3L21 7V3Z" /><path d="M9.5 14.5 3 21m2.5-3.5L3 15l2-2" /></S>;
export const IcCards = (p: I) => <S {...p}><rect x="7" y="4" width="11" height="15" rx="2.4" /><path d="M4.5 7.5v9A3.5 3.5 0 0 0 8 20h6" opacity=".6" /></S>;
export const IcDots = (p: I) => <S {...p} w={2.6}><circle cx="6" cy="12" r=".6" /><circle cx="12" cy="12" r=".6" /><circle cx="18" cy="12" r=".6" /></S>;
export const IcBell = (p: I) => <S {...p}><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></S>;
export const IcGear = (p: I) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7.5 18l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 12.5H4a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 5.7 6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H11a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.6 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V11a2 2 0 1 1 0 4h-.2Z" /></S>;
export const IcCandles = (p: I) => <S {...p}><path d="M7 3v3m0 12v3M17 3v5m0 9v4" /><rect x="4.5" y="6" width="5" height="12" rx="1.2" /><rect x="14.5" y="8" width="5" height="9" rx="1.2" /></S>;
export const IcNews = (p: I) => <S {...p}><rect x="3" y="5" width="15" height="14" rx="2" /><path d="M18 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-4 0" /><path d="M6.5 9h8M6.5 12.5h8M6.5 16h5" /></S>;
export const IcList = (p: I) => <S {...p}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1.1" /><circle cx="4.5" cy="12" r="1.1" /><circle cx="4.5" cy="18" r="1.1" /></S>;
export const IcWhale = (p: I) => <S {...p}><path d="M3 13c2.5 0 3.5-2 3.5-2s1.6 5.5 7 5.5c4 0 6.5-2.6 7.5-5.5-2 .6-3.6.2-4.6-.8" /><path d="M12.8 8.2c.6-2 2.4-3.2 4.2-3.2" /><circle cx="8.2" cy="12.4" r=".7" fill="currentColor" /><path d="M3 17.5c1.6 1 3 1 4.5 0 1.5 1 3 1 4.5 0 1.5 1 3 1 4.5 0 1.5 1 3 1 4.5 0" opacity=".5" /></S>;
export const IcCalendar = (p: I) => <S {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M8 14h3v3H8z" fill="currentColor" stroke="none" opacity=".85" /></S>;
export const IcChat = (p: I) => <S {...p}><path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4 20.5l1.35-3.6C4.2 15.6 3.5 14 3.5 12.2 3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z" /></S>;
export const IcPlus = (p: I) => <S {...p} w={2.4}><path d="M12 6v12M6 12h12" /></S>;
export const IcLock = (p: I) => <S {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><circle cx="12" cy="15.4" r="1.3" fill="currentColor" stroke="none" /></S>;
export const IcTrend = (p: I) => <S {...p}><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" /><path d="M15.5 6.5h5v5" /></S>;
export const IcShield = (p: I) => <S {...p}><path d="M12 3.2 5 6v6c0 4.2 3 7.4 7 8.8 4-1.4 7-4.6 7-8.8V6l-7-2.8Z" /><path d="m9 12 2.2 2.2L15.3 10" /></S>;
export const IcStar = (p: I) => <S {...p}><path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8L12 3.6Z" /></S>;
export const IcClock = (p: I) => <S {...p}><circle cx="12" cy="12" r="8.6" /><path d="M12 7v5.2l3.2 2" /></S>;
export const IcSliders = (p: I) => <S {...p}><path d="M6 3.5v6M6 14.5v6M12 3.5v9M12 17.5v3M18 3.5v3M18 11.5v9" /><circle cx="6" cy="12" r="2.1" /><circle cx="12" cy="15" r="2.1" /><circle cx="18" cy="9" r="2.1" /></S>;
export const IcArrow = (p: I) => <S {...p}><path d="M5 12h13" /><path d="m13 6.5 5.5 5.5L13 17.5" /></S>;
export const IcCheck = (p: I) => <S {...p} w={2.6}><path d="m5 12.5 4.5 4.5L19 6.5" /></S>;
export const IcClose = (p: I) => <S {...p} w={2.4}><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" /></S>;
export const IcCrown = (p: I) => <S {...p}><path d="M4 17.5h16M4.5 7.5 8 11l4-5.5L16 11l3.5-3.5-1.3 8H5.8L4.5 7.5Z" /></S>;
export const IcBolt = (p: I) => <S {...p}><path d="M13.2 2.8 5 13.4h5.6L10 21.2l8.4-10.8h-5.8l.6-7.6Z" /></S>;
export const IcTarget = (p: I) => <S {...p}><circle cx="12" cy="12" r="8.4" /><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none" /></S>;
export const IcFlame = (p: I) => <S {...p}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.7.8-3 1.6-4 .3 1 .9 1.7 1.7 1.9C10 8.3 10.6 5.6 12 3Z" /></S>;
export const IcCoinMark = (p: I) => <S {...p}><circle cx="12" cy="12" r="8.6" /><path d="M14.4 9.2c-.6-.8-1.5-1.2-2.6-1.2-1.9 0-3 1.2-3 2.5s1.1 1.9 3 2.2c1.9.3 3 .9 3 2.2S13.7 17.5 12 17.5c-1.2 0-2.2-.5-2.8-1.4" /><path d="M12 6v12" /></S>;
export const IcGem = (p: I) => <S {...p}><path d="m12 3.5 6.5 4.3-2.2 10H7.7L5.5 7.8 12 3.5Z" /><path d="M5.5 7.8h13M12 3.5 9.2 17.8M12 3.5l2.8 14.3" opacity=".55" /></S>;
export const IcEye = (p: I) => <S {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3.1" /></S>;
export const IcBook = (p: I) => <S {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z" /></S>;
export const IcTrophy = (p: I) => <S {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 5.5H4.5V8A3.5 3.5 0 0 0 8 11.5M17 5.5h2.5V8a3.5 3.5 0 0 1-3.5 3.5" /><path d="M9.5 20h5M12 14v6" /></S>;
export const IcRefresh = (p: I) => <S {...p}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20.5 4v4.5H16" /></S>;
export const IcSwap = (p: I) => <S {...p}><path d="M4 8h12l-3-3m3 3-3 3" /><path d="M20 16H8l3-3m-3 3 3 3" /></S>;
export const IcCopy = (p: I) => <S {...p}><rect x="9" y="9" width="11" height="11" rx="2.4" /><path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" /></S>;
export const IcWarn = (p: I) => <S {...p}><path d="M12 4.5 2.8 20h18.4L12 4.5Z" /><path d="M12 10v4.4" /><circle cx="12" cy="17.4" r=".9" fill="currentColor" stroke="none" /></S>;
export const IcPlay = (p: I) => <S {...p}><path d="M7.5 5.5 18.5 12l-11 6.5v-13Z" /></S>;
export const IcGauge = (p: I) => <S {...p}><path d="M4 18a8.5 8.5 0 1 1 16 0" /><path d="m12 14 4.2-4.4" /><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" /></S>;
export const IcLayers = (p: I) => <S {...p}><path d="m12 3.5 8.5 4.6-8.5 4.6L3.5 8.1 12 3.5Z" /><path d="m4.4 12 7.6 4.1 7.6-4.1M4.4 16l7.6 4.1 7.6-4.1" opacity=".6" /></S>;
export const IcCode = (p: I) => <S {...p}><path d="m9 8-5 4 5 4M15 8l5 4-5 4M13.4 5l-2.8 14" /></S>;
export const IcBank = (p: I) => <S {...p}><path d="m3.5 9.5 8.5-5 8.5 5" /><path d="M5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8" /><path d="M3 20.5h18" /></S>;

/* =====================================================================
   ИЛЛЮСТРАЦИИ — «нарисованные» векторные объекты игры
   ===================================================================== */

export const ArtCoinStack = ({ size = 72 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffdf7e" /><stop offset="1" stopColor="#d79a1d" /></linearGradient>
      <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3c4" /><stop offset="1" stopColor="#e3ab29" /></linearGradient>
    </defs>
    <ellipse cx="50" cy="76" rx="30" ry="10" fill="#b8801a" />
    <rect x="20" y="62" width="60" height="14" rx="7" fill="url(#cg)" />
    <ellipse cx="50" cy="62" rx="30" ry="10" fill="url(#cg2)" stroke="#a8761b" strokeWidth="2" />
    <ellipse cx="50" cy="48" rx="26" ry="8.6" fill="url(#cg)" stroke="#a8761b" strokeWidth="2" />
    <ellipse cx="50" cy="35" rx="22" ry="7.4" fill="url(#cg2)" stroke="#a8761b" strokeWidth="2" />
    <path d="M50 29v13M54 32.2c-1-1.1-2.4-1.6-4-1.6-2.7 0-4.2 1.3-4.2 2.8s1.6 2 4.2 2.4c2.6.4 4.2 1 4.2 2.5S52.4 41 50.3 41c-1.7 0-3-.5-3.9-1.5" stroke="#8a5f12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ArtPack = ({ size = 72, hue = "#3ec9a7" }: { size?: number; hue?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs><linearGradient id={`pg${hue}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={hue} /><stop offset="1" stopColor="#1d3550" /></linearGradient></defs>
    <rect x="24" y="14" width="52" height="72" rx="8" fill={`url(#pg${hue})`} stroke="rgba(255,255,255,.35)" strokeWidth="2.5" />
    <path d="M24 30h52" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeDasharray="5 4" />
    <path d="m50 42 4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L50 65.7l-9.3 4.8 1.8-10.3-7.5-7.3 10.4-1.5L50 42Z" fill="rgba(255,255,255,.9)" />
    <rect x="30" y="18" width="12" height="6" rx="3" fill="rgba(255,255,255,.35)" />
  </svg>
);

export const ArtTrophy = ({ size = 72 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe089" /><stop offset="1" stopColor="#c98b17" /></linearGradient></defs>
    <path d="M30 18h40v20c0 11-9 20-20 20s-20-9-20-20V18Z" fill="url(#tg)" stroke="#8a5f12" strokeWidth="2.5" />
    <path d="M30 22H18v8c0 7 5 12 12 13M70 22h12v8c0 7-5 12-12 13" stroke="#c98b17" strokeWidth="5" strokeLinecap="round" />
    <rect x="43" y="57" width="14" height="14" rx="3" fill="#b8801a" />
    <rect x="30" y="70" width="40" height="10" rx="4" fill="url(#tg)" stroke="#8a5f12" strokeWidth="2.5" />
    <path d="m50 26 3.4 7 7.6 1.1-5.5 5.3 1.3 7.6L50 43.4l-6.8 3.6 1.3-7.6-5.5-5.3 7.6-1.1L50 26Z" fill="#fff6d6" opacity=".95" />
  </svg>
);

export const ArtChest = ({ size = 80, open = false }: { size?: number; open?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3b5a78" /><stop offset="1" stopColor="#1e3350" /></linearGradient>
      <linearGradient id="gold2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffdf7e" /><stop offset="1" stopColor="#c98b17" /></linearGradient>
    </defs>
    <g style={{ transform: open ? "rotate(-26deg)" : "none", transformOrigin: "22px 52px", transition: "transform .5s cubic-bezier(.34,1.56,.64,1)" }}>
      <path d="M18 52V38a32 32 0 0 1 64 0v14H18Z" fill="url(#wood)" stroke="#0f1c2e" strokeWidth="2.5" />
      <rect x="18" y="44" width="64" height="8" fill="url(#gold2)" stroke="#8a5f12" strokeWidth="1.6" />
    </g>
    <rect x="18" y="52" width="64" height="30" rx="5" fill="url(#wood)" stroke="#0f1c2e" strokeWidth="2.5" />
    <rect x="43" y="52" width="14" height="18" rx="3" fill="url(#gold2)" stroke="#8a5f12" strokeWidth="1.8" />
    <circle cx="50" cy="62" r="2.6" fill="#5a3d0a" />
  </svg>
);

export const ArtCandleChart = ({ w = 220, h = 90, progress = 1, color = "#3ec9a7" }: { w?: number; h?: number; progress?: number; color?: string }) => {
  const bars = [
    [30, 52, 0], [42, 60, 1], [36, 58, 0], [50, 70, 1], [44, 62, 0],
    [56, 76, 1], [48, 66, 0], [62, 82, 1], [58, 74, 0], [70, 88, 1],
  ] as const;
  const n = Math.max(1, Math.round(bars.length * progress));
  return (
    <svg width={w} height={h} viewBox="0 0 220 90" fill="none">
      {bars.slice(0, n).map((b, i) => {
        const up = b[2] === 1;
        const c = up ? color : "#e46a5f";
        const x = 10 + i * 21;
        const top = 90 - b[1];
        const bot = 90 - b[0];
        return (
          <g key={i}>
            <path d={`M${x + 5} ${top - 7}V${bot + 7}`} stroke={c} strokeWidth="1.6" opacity=".7" />
            <rect x={x} y={top} width="10" height={Math.max(4, bot - top)} rx="2" fill={c} opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
};

/* Процедурная «карта существа»: рамка по редкости + абстрактный портрет */
export const ArtCard = ({
  w = 74, seed = 1, rarity = "common", label,
}: { w?: number; seed?: number; rarity?: "common" | "rare" | "epic" | "legend"; label?: string }) => {
  const h = w * 1.4;
  const frame = { common: "#5b7799", rare: "#3ec9a7", epic: "#9d8cf5", legend: "#f2c14e" }[rarity];
  const bg = { common: "#22334d", rare: "#17403c", epic: "#2a2450", legend: "#3c2f14" }[rarity];
  const a = (seed * 37) % 60;
  return (
    <svg width={w} height={h} viewBox="0 0 74 104" fill="none">
      <rect x="1.5" y="1.5" width="71" height="101" rx="9" fill={bg} stroke={frame} strokeWidth="3" />
      <rect x="7" y="7" width="60" height="62" rx="6" fill="#0e1828" />
      <g opacity=".95">
        <circle cx="37" cy="40" r={16 + (seed % 4)} fill={frame} opacity=".22" />
        <path d={`M${20 + a * 0.1} 52 L37 ${24 + (seed % 8)} L${54 - a * 0.1} 52 Z`} fill={frame} opacity=".8" />
        <circle cx={31} cy={40} r="3" fill="#0e1828" />
        <circle cx={43} cy={40} r="3" fill="#0e1828" />
        <path d={`M28 ${58} q9 ${6 + (seed % 5)} 18 0`} stroke={frame} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
      <rect x="7" y="74" width="60" height="9" rx="4" fill="rgba(255,255,255,.08)" />
      <rect x="7" y="74" width={60 * (0.4 + (seed % 5) / 10)} height="9" rx="4" fill={frame} opacity=".8" />
      {label && <text x="37" y="94" textAnchor="middle" fontSize="8" fontWeight="800" fill="#cfe0f7" fontFamily="Manrope, sans-serif">{label}</text>}
    </svg>
  );
};

export const ArtWhaleBig = ({ size = 90 }: { size?: number }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 160 100" fill="none">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9d8cf5" /><stop offset="1" stopColor="#5b6fd6" /></linearGradient></defs>
    <path d="M12 58c14 0 22-14 22-14s10 32 42 32c26 0 44-16 50-34-12 4-22 2-28-5" fill="url(#wg)" stroke="#2a2450" strokeWidth="3" strokeLinejoin="round" />
    <path d="M96 32c4-12 15-19 26-19" stroke="#2a2450" strokeWidth="3" strokeLinecap="round" />
    <circle cx="44" cy="52" r="3.4" fill="#141c2e" />
    <path d="M18 76c9 6 18 6 27 0s18-6 27 0 18 6 27 0 18-6 27 0" stroke="#3ec9a7" strokeWidth="3" strokeLinecap="round" opacity=".5" />
  </svg>
);

/* ---------- Векторные силуэты «сущностей рынка» для бестиария ---------- */
export const ArtEntity = ({
  kind = "phantom", size = 64, tone = "#5b9cd6", dim = false,
}: { kind?: string; size?: number; tone?: string; dim?: boolean }) => {
  const o = dim ? 0.35 : 1;
  const body: Record<string, any> = {
    phantom: (
      <g>
        <path d="M18 62V34a14 14 0 0 1 28 0v28l-5-5-4.6 5-4.9-5-4.9 5-4.6-5-4 5Z" fill={tone} opacity={0.85 * o} />
        <circle cx="27.5" cy="35" r="3.4" fill="#0b1120" />
        <circle cx="38" cy="35" r="3.4" fill="#0b1120" />
        <path d="M28 46q4 4 8 0" stroke="#0b1120" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    ),
    wraith: (
      <g>
        <path d="M32 12c11 0 17 9 17 20 0 12-5 18-5 26l-6-5-6 5-6-5-6 5c0-8-5-14-5-26 0-11 6-20 17-20Z" fill={tone} opacity={0.85 * o} />
        <path d="M24 34q8-5 16 0" stroke="#0b1120" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="26.5" cy="40" r="2.6" fill="#0b1120" />
        <circle cx="38" cy="40" r="2.6" fill="#0b1120" />
      </g>
    ),
    titan: (
      <g>
        <rect x="18" y="26" width="28" height="30" rx="5" fill={tone} opacity={0.85 * o} />
        <rect x="24" y="14" width="16" height="14" rx="4" fill={tone} opacity={0.95 * o} />
        <rect x="11" y="30" width="7" height="20" rx="3.5" fill={tone} opacity={0.6 * o} />
        <rect x="46" y="30" width="7" height="20" rx="3.5" fill={tone} opacity={0.6 * o} />
        <path d="M26 20h4M34 20h4" stroke="#0b1120" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
    goblin: (
      <g>
        <path d="M32 16c10 0 16 8 16 17s-7 17-16 17-16-8-16-17 6-17 16-17Z" fill={tone} opacity={0.85 * o} />
        <path d="M16 30 6 22l12 2M48 30l10-8-12 2" fill={tone} opacity={0.7 * o} />
        <circle cx="26" cy="32" r="3" fill="#0b1120" />
        <circle cx="38" cy="32" r="3" fill="#0b1120" />
        <path d="M25 42q7 6 14 0" stroke="#0b1120" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
    ),
    mimic: (
      <g>
        <rect x="14" y="32" width="36" height="22" rx="5" fill={tone} opacity={0.85 * o} />
        <path d="M14 32V26a18 18 0 0 1 36 0v6H14Z" fill={tone} opacity={0.6 * o} />
        <path d="M18 34h28M22 38l4 5 4-5 4 5 4-5 4 5 4-5" stroke="#0b1120" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
        <circle cx="24" cy="25" r="3" fill="#0b1120" />
        <circle cx="40" cy="25" r="3" fill="#0b1120" />
      </g>
    ),
    siren: (
      <g>
        <circle cx="32" cy="26" r="11" fill={tone} opacity={0.85 * o} />
        <path d="M21 28c-4 12-2 22 0 30 8-5 14-5 22 0 2-8 4-18 0-30" fill={tone} opacity={0.55 * o} />
        <circle cx="28" cy="25" r="2.6" fill="#0b1120" />
        <circle cx="36" cy="25" r="2.6" fill="#0b1120" />
        <path d="M29 32q3 3 6 0" stroke="#0b1120" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id={`eg-${kind}`}><stop stopColor={tone} stopOpacity=".32" /><stop offset="1" stopColor={tone} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="32" cy="34" r="28" fill={`url(#eg-${kind})`} />
      {body[kind] ?? body.phantom}
    </svg>
  );
};

/* Спарклайн по массиву значений */
export const ArtSpark = ({ data, w = 110, h = 34, tone = "#3ec9a7" }: { data: number[]; w?: number; h?: number; tone?: string }) => {
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / (max - min || 1)) * (h - 8) ]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} fill="none">
      <path d={`${d} L${w - 2},${h} L2,${h} Z`} fill={tone} opacity=".14" />
      <path d={d} stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.7" fill={tone} />)}
    </svg>
  );
};
