import type { SVGProps } from "react";

export type IconName = keyof typeof PATHS;

const PATHS = {
  candle: (
    <>
      <path d="M7 3v4M7 17v4M17 3v2M17 19v2" />
      <rect x="4.5" y="7" width="5" height="10" rx="1.4" />
      <rect x="14.5" y="5" width="5" height="14" rx="1.4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15l3.5-4.5 3 3L20 6" />
      <path d="M20 10V6h-4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <circle cx="16.5" cy="13.5" r="1.4" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l3.5 5.5L12 21 2.5 8.5 6 3Z" />
      <path d="M2.5 8.5h19M9 3l-1.5 5.5L12 21l4.5-12.5L15 3" />
    </>
  ),
  coin: (
    <>
      <ellipse cx="12" cy="7" rx="8" ry="3.4" />
      <path d="M4 7v6c0 1.9 3.6 3.4 8 3.4s8-1.5 8-3.4V7" />
      <path d="M4 13v4c0 1.9 3.6 3.4 8 3.4s8-1.5 8-3.4v-4" />
    </>
  ),
  flame: (
    <>
      <path d="M12 2.5s5.2 4 5.2 9.1A5.2 5.2 0 0 1 12 21a5.2 5.2 0 0 1-5.2-9.4c.5 1 1.3 1.7 2.2 1.9-.6-3.8 1.6-7.3 3-11Z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.3 4.6 13a4.7 4.7 0 0 1 6.6-6.7l.8.8.8-.8A4.7 4.7 0 1 1 19.4 13Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.7 4.5 6v6c0 4.6 3.2 8.2 7.5 9.4 4.3-1.2 7.5-4.8 7.5-9.4V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v3M8.5 20.5h7L15 17H9Z" />
    </>
  ),
  bolt: (
    <>
      <path d="M13.5 2.5 4.5 13.8h6l-.9 7.7 9.9-11.6h-6.6Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
      <path d="M12 14v2.5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  chevronUp: <path d="m5 15 7-7 7 7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  arrowUp: <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
  arrowDown: <path d="M12 5v14m0 0 6-6m-6 6-6-6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.6M4 13a8 8 0 0 0 14.3 4.6" />
      <path d="M20 5v6h-6M4 19v-6h6" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.8 19.5h18.4Z" />
      <path d="M12 9.5v4.2M12 16.8v.5" />
    </>
  ),
  star: <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8Z" />,
  crown: (
    <>
      <path d="M3 8.5 6.5 13 12 5l5.5 8L21 8.5l-2 10.5H5Z" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 4c4 1.5 6 4.5 6 9 0 0-2.5 1.5-4.5 2.5L9 9.5C10 7.5 11.5 5 14 4Z" />
      <path d="M9.5 15.5 6 19M8.5 9.5 4 11l2.5 2.5M14.5 15.5 13 20l-2.5-2.5" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5.5a3 3 0 0 0-5.7-1.3A3 3 0 0 0 4 9.6a3.4 3.4 0 0 0 .6 5.2A3 3 0 0 0 9 19.4a3 3 0 0 0 3-1.2Z" />
      <path d="M12 5.5a3 3 0 0 1 5.7-1.3A3 3 0 0 1 20 9.6a3.4 3.4 0 0 1-.6 5.2A3 3 0 0 1 15 19.4a3 3 0 0 1-3-1.2Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.3 2" />
    </>
  ),
  filter: <path d="M3.5 5.5h17l-6.5 7.6v5.6l-4 2.3v-7.9Z" />,
  sort: <path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </>
  ),
  trendUp: (
    <>
      <path d="M3 16.5 9 10l4 4 8-8.5" />
      <path d="M15 5.5h6v6" />
    </>
  ),
  trendDown: (
    <>
      <path d="M3 7.5 9 14l4-4 8 8.5" />
      <path d="M15 18.5h6v-6" />
    </>
  ),
  bitcoin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 7.5h4.2a2.2 2.2 0 0 1 0 4.4H9.5Zm0 4.4h4.8a2.3 2.3 0 0 1 0 4.6H9.5Z" />
      <path d="M9.5 7.5v9M11.4 5.6v1.9M11.4 16.5v1.9M14 5.6v1.9M14 16.5v1.9" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 4.8-9 4.8-9-4.8Z" />
      <path d="m3 12.4 9 4.8 9-4.8M3 16.8l9 4.8 9-4.8" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7Z" />
      <path d="m18.5 14.5.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9ZM5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8L2.5 16.5l1.8-.7Z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
      <path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
    </>
  ),
  chest: (
    <>
      <path d="M3.5 10.5A5.5 5.5 0 0 1 9 5h6a5.5 5.5 0 0 1 5.5 5.5V19h-17Z" />
      <path d="M3.5 12.5h17M10 12.5v-2a2 2 0 1 1 4 0v2M10 12.5v3h4v-3" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 10 6 3h12l-2.5 7M12 13l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2L9.1 15l2-.3Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <path d="m11.5 11.5 8 8M17 17l2-2M14.5 14.5l2-2" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
} as const;

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
