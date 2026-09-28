import { useId, type SVGProps } from "react";

/**
 * CANDLEQUEST — the mark.
 * A "Q" whose tail is a candlestick, with a single bull candle inside the ring.
 * All geometry is hand-written path data: scales to any size, works in one colour.
 * viewBox 64×64, clear space = 12 units on all sides.
 */
export function LogoMark({ size = 64, variant = "solid", className, ...p }: { size?: number; variant?: "solid" | "bevel" | "mono" | "outline" } & SVGProps<SVGSVGElement>) {
  const uid = useId().replace(/:/g, "");
  const mono = variant === "mono" || variant === "outline";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="CandleQuest" className={className} {...p}>
      <defs>
        <linearGradient id={`${uid}ring`} x1="10" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8FC0FF" />
          <stop offset="0.45" stopColor="#3B82FF" />
          <stop offset="1" stopColor="#2152C4" />
        </linearGradient>
        <linearGradient id={`${uid}tail`} x1="42" y1="42" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE3A0" />
          <stop offset="1" stopColor="#E08E0B" />
        </linearGradient>
        <linearGradient id={`${uid}candle`} x1="32" y1="18" x2="32" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6FF2C4" />
          <stop offset="1" stopColor="#10916A" />
        </linearGradient>
        <linearGradient id={`${uid}shine`} x1="12" y1="8" x2="30" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Q ring — donut built from two arcs, even-odd */}
      <path
        d="M32 5.5a26.5 26.5 0 1 0 .001 0zM32 15.2a16.8 16.8 0 1 1-.001 0z"
        fillRule="evenodd"
        fill={mono ? "currentColor" : `url(#${uid}ring)`}
        stroke={mono ? "currentColor" : `url(#${uid}ring)`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {!mono && variant === "bevel" && (
        <>
          <path d="M12.4 42.2a22 22 0 0 1 3.2-34.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M50.2 26.6a21 21 0 0 1-3.6 25.8" stroke="#000" strokeOpacity="0.32" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* bull candle inside the ring */}
      <path d="M31.2 18.5h1.6v27h-1.6z" fill={mono ? "currentColor" : `url(#${uid}candle)`} opacity={variant === "outline" ? 0.6 : 1} />
      <path
        d="M26 24.4c0-1 .8-1.8 1.8-1.8h8.4c1 0 1.8.8 1.8 1.8v12.6c0 1-.8 1.8-1.8 1.8h-8.4a1.8 1.8 0 0 1-1.8-1.8z"
        fill={mono ? "currentColor" : `url(#${uid}candle)`}
        stroke={mono ? "currentColor" : `url(#${uid}candle)`}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {!mono && <path d="M28.4 26.2h2.2v8h-2.2z" fill="#fff" fillOpacity="0.35" />}

      {/* Q tail = candlestick (wick + body) crossing the ring at 45° */}
      <path d="M44.9 41.1 59.7 55.9 56.1 59.5 41.3 44.7z" fill={mono ? "currentColor" : `url(#${uid}tail)`} />
      <path
        d="M45.9 42.2c0-.8.7-1.5 1.5-1.5h8.4c.8 0 1.5.7 1.5 1.5v8.4c0 .8-.7 1.5-1.5 1.5h-8.4a1.5 1.5 0 0 1-1.5-1.5z"
        transform="rotate(45 50.85 47.15)"
        fill={mono ? "currentColor" : `url(#${uid}tail)`}
        stroke={mono ? "currentColor" : `url(#${uid}tail)`}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {variant === "bevel" && !mono && <path d="M15 16a20 20 0 0 1 22-7.6" stroke={`url(#${uid}shine)`} strokeWidth="3" strokeLinecap="round" fill="none" />}
    </svg>
  );
}

/** Badge / app-icon version: the mark on a raised tile. */
export function LogoBadge({ size = 72, radius = 0.24 }: { size?: number; radius?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" role="img" aria-label="CandleQuest app icon">
      <defs>
        <linearGradient id={`${uid}tile`} x1="48" y1="0" x2="48" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E57A8" />
          <stop offset="1" stopColor="#0C1B3A" />
        </linearGradient>
        <linearGradient id={`${uid}edge`} x1="48" y1="88" x2="48" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A1224" />
          <stop offset="1" stopColor="#050912" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx={96 * radius} fill={`url(#${uid}edge)`} />
      <rect x="4" y="0" width="88" height="88" rx={96 * radius} fill={`url(#${uid}tile)`} />
      <rect x="4" y="0" width="88" height="88" rx={96 * radius} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M8 20c0-7.7 6.3-14 14-14h52c7.7 0 14 6.3 14 14" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="translate(16 12) scale(1.0)">
        <LogoMark size={64} variant="bevel" />
      </g>
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark. */
export function Lockup({ scale = 1, tone = "light" }: { scale?: number; tone?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-3" style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}>
      <LogoMark size={44 * scale} variant="bevel" />
      <div style={{ lineHeight: 1 }}>
        <div className="font-display text-[26px] font-black tracking-[-0.02em]" style={{ color: tone === "light" ? "#fff" : "#0a1224" }}>
          CANDLE<span style={{ color: "#ffc53d" }}>QUEST</span>
        </div>
        <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.32em]" style={{ color: tone === "light" ? "#8a9bc4" : "#4a5c86" }}>
          trade · learn · win
        </div>
      </div>
    </div>
  );
}
