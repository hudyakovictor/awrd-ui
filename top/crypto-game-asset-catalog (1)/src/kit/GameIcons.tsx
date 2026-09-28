import { useId, type SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  ...props,
});

export function FlameIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="4" x2="32" y2="60">
          <stop stopColor="#FFD66B" />
          <stop offset=".5" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#E0442A" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="32" y1="26" x2="32" y2="58">
          <stop stopColor="#FFF6D0" />
          <stop offset="1" stopColor="#FFC53D" />
        </linearGradient>
      </defs>
      <path d="M32 60c-12 0-20-8-20-19 0-9 6-14 9-21 1 5 4 8 7 9-1-9 4-19 12-25-1 8 4 13 8 18 4 5 4 10 4 14 0 14-8 24-20 24z" fill="#9C2A1A" transform="translate(0 2)" />
      <path d="M32 60c-12 0-20-8-20-19 0-9 6-14 9-21 1 5 4 8 7 9-1-9 4-19 12-25-1 8 4 13 8 18 4 5 4 10 4 14 0 14-8 24-20 24z" fill={`url(#${id}a)`} />
      <path d="M32 58c-6 0-10-4-10-10 0-5 4-8 6-12 1 3 3 5 5 5-1-4 2-9 5-11 0 5 4 8 4 13 0 9-4 15-10 15z" fill={`url(#${id}b)`} />
      <path d="M20 34c2-4 4-7 5-11" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function GemIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="10" y1="10" x2="54" y2="56">
          <stop stopColor="#8FF3FF" />
          <stop offset=".5" stopColor="#2BD9FF" />
          <stop offset="1" stopColor="#2152C4" />
        </linearGradient>
      </defs>
      <path d="M18 10h28l12 14-26 34L6 24z" fill="#10407F" transform="translate(0 3)" />
      <path d="M18 10h28l12 14-26 34L6 24z" fill={`url(#${id}a)`} />
      <path d="M6 24h52L32 58z" fill="#000" fillOpacity=".14" />
      <path d="M18 10l6 14h16l6-14" fill="#fff" fillOpacity=".25" />
      <path d="M24 24l8 34 8-34" fill="#fff" fillOpacity=".12" />
      <path d="M14 20l4-6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ size = 40, empty, ...p }: P & { empty?: boolean }) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="8" x2="32" y2="58">
          <stop stopColor={empty ? "#3A5494" : "#FF8FA3"} />
          <stop offset="1" stopColor={empty ? "#1D3160" : "#E0304F"} />
        </linearGradient>
      </defs>
      <path d="M32 56S6 41 6 23C6 14 13 8 20 8c5 0 9 3 12 7 3-4 7-7 12-7 7 0 14 6 14 15 0 18-26 33-26 33z" fill={empty ? "#111D3A" : "#8F1A30"} transform="translate(0 3)" />
      <path d="M32 56S6 41 6 23C6 14 13 8 20 8c5 0 9 3 12 7 3-4 7-7 12-7 7 0 14 6 14 15 0 18-26 33-26 33z" fill={`url(#${id}a)`} />
      <ellipse cx="18" cy="20" rx="5" ry="3.5" fill="#fff" fillOpacity={empty ? 0.1 : 0.55} transform="rotate(-30 18 20)" />
    </svg>
  );
}

export function BoltIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="4" x2="32" y2="60">
          <stop stopColor="#FFF0A8" />
          <stop offset="1" stopColor="#FFB020" />
        </linearGradient>
      </defs>
      <path d="M36 4L12 36h16l-4 24 26-34H34z" fill="#B0690A" transform="translate(0 3)" />
      <path d="M36 4L12 36h16l-4 24 26-34H34z" fill={`url(#${id}a)`} />
      <path d="M33 10L19 31" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="10" y1="6" x2="54" y2="58">
          <stop stopColor="#FFE9A0" />
          <stop offset=".55" stopColor="#FFC53D" />
          <stop offset="1" stopColor="#D98A0B" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="35" r="25" fill="#9A5E06" />
      <circle cx="32" cy="31" r="25" fill={`url(#${id}a)`} />
      <circle cx="32" cy="31" r="18" fill="none" stroke="#B87708" strokeWidth="3" />
      {/* candlestick emblem */}
      <rect x="23" y="24" width="6" height="14" rx="1.5" fill="#B87708" />
      <rect x="25.3" y="19" width="1.4" height="24" fill="#B87708" />
      <rect x="35" y="20" width="6" height="12" rx="1.5" fill="#B87708" />
      <rect x="37.3" y="16" width="1.4" height="22" fill="#B87708" />
      <path d="M14 22c3-6 8-10 14-11" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ChestIcon({ size = 40, open, ...p }: P & { open?: boolean }) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="10" x2="32" y2="58">
          <stop stopColor="#9B7BFF" />
          <stop offset="1" stopColor="#5A33C7" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="32" y1="0" x2="32" y2="30">
          <stop stopColor="#FFF4C2" />
          <stop offset="1" stopColor="#FFC53D" stopOpacity="0" />
        </linearGradient>
      </defs>
      {open && <path d="M14 30L4 0h56L50 30z" fill={`url(#${id}g)`} opacity=".8" />}
      <rect x="8" y="30" width="48" height="26" rx="5" fill="#3A1F8F" transform="translate(0 3)" />
      <rect x="8" y="30" width="48" height="26" rx="5" fill={`url(#${id}a)`} />
      <g style={{ transformOrigin: "32px 30px", transform: open ? "rotate(-18deg) translate(-2px,-8px)" : "none", transition: "transform .35s cubic-bezier(.3,1.6,.5,1)" }}>
        <path d="M8 30c0-10 8-18 24-18s24 8 24 18z" fill={`url(#${id}a)`} />
        <path d="M8 30c0-10 8-18 24-18s24 8 24 18z" fill="#fff" fillOpacity=".12" />
        <rect x="8" y="27" width="48" height="5" fill="#FFC53D" />
      </g>
      <rect x="27" y="28" width="10" height="12" rx="2" fill="#FFC53D" stroke="#C98A12" strokeWidth="2" />
      <rect x="8" y="44" width="48" height="4" fill="#FFC53D" opacity=".85" />
    </svg>
  );
}

export function TrophyIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="6" x2="32" y2="44">
          <stop stopColor="#FFF0B5" />
          <stop offset="1" stopColor="#E59A0F" />
        </linearGradient>
      </defs>
      <path d="M16 12H6c0 10 4 16 12 17M48 12h10c0 10-4 16-12 17" stroke="#C98A12" strokeWidth="4" strokeLinecap="round" />
      <path d="M16 6h32v14c0 10-7 18-16 18S16 30 16 20z" fill={`url(#${id}a)`} />
      <rect x="28" y="36" width="8" height="10" fill="#C98A12" />
      <rect x="18" y="46" width="28" height="12" rx="3" fill="#5A33C7" />
      <rect x="18" y="46" width="28" height="4" rx="2" fill="#8B5CFF" />
      <path d="M22 12v8" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ size = 40, ...p }: P) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="4" x2="32" y2="60">
          <stop stopColor="#6FF2C4" />
          <stop offset="1" stopColor="#10916A" />
        </linearGradient>
      </defs>
      <path d="M32 4l22 8v16c0 16-10 26-22 32C20 54 10 44 10 28V12z" fill="#0A5C43" transform="translate(0 3)" />
      <path d="M32 4l22 8v16c0 16-10 26-22 32C20 54 10 44 10 28V12z" fill={`url(#${id}a)`} />
      <path d="M22 32l7 7 13-14" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ size = 40, dim, ...p }: P & { dim?: boolean }) {
  const id = useId();
  return (
    <svg {...base(size, p)}>
      <defs>
        <linearGradient id={`${id}a`} x1="32" y1="4" x2="32" y2="58">
          <stop stopColor={dim ? "#3A5494" : "#FFF0A8"} />
          <stop offset="1" stopColor={dim ? "#1D3160" : "#FFB020"} />
        </linearGradient>
      </defs>
      <path d="M32 5l8 17 18 2-13 13 3 18-16-9-16 9 3-18L6 24l18-2z" fill={dim ? "#0D1730" : "#B0690A"} transform="translate(0 3)" />
      <path d="M32 5l8 17 18 2-13 13 3 18-16-9-16 9 3-18L6 24l18-2z" fill={`url(#${id}a)`} strokeLinejoin="round" />
      <path d="M26 22l4-8" stroke="#fff" strokeOpacity={dim ? 0.1 : 0.8} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function TargetIcon({ size = 40, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <circle cx="32" cy="35" r="24" fill="#8F1A30" />
      <circle cx="32" cy="32" r="24" fill="#FF4F6D" />
      <circle cx="32" cy="32" r="17" fill="#fff" />
      <circle cx="32" cy="32" r="10" fill="#FF4F6D" />
      <circle cx="32" cy="32" r="4" fill="#fff" />
      <path d="M32 32L54 10" stroke="#FFC53D" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 6l6 2 2 6" stroke="#FFC53D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ size = 40, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M20 28v-8a12 12 0 0124 0v8" stroke="#4A6199" strokeWidth="6" />
      <rect x="12" y="28" width="40" height="30" rx="8" fill="#1D3160" transform="translate(0 3)" />
      <rect x="12" y="28" width="40" height="30" rx="8" fill="#3A5494" />
      <circle cx="32" cy="41" r="4" fill="#111D3A" />
      <rect x="30.5" y="42" width="3" height="8" rx="1.5" fill="#111D3A" />
    </svg>
  );
}

export function CandleUpIcon({ size = 40, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="30.5" y="4" width="3" height="56" rx="1.5" fill="#10916A" />
      <rect x="20" y="16" width="24" height="34" rx="5" fill="#10916A" transform="translate(0 3)" />
      <rect x="20" y="16" width="24" height="34" rx="5" fill="#22D39A" />
      <rect x="24" y="20" width="4" height="20" rx="2" fill="#fff" fillOpacity=".5" />
    </svg>
  );
}

export function CandleDownIcon({ size = 40, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="30.5" y="4" width="3" height="56" rx="1.5" fill="#C02A47" />
      <rect x="20" y="14" width="24" height="34" rx="5" fill="#C02A47" transform="translate(0 3)" />
      <rect x="20" y="14" width="24" height="34" rx="5" fill="#FF4F6D" />
      <rect x="24" y="18" width="4" height="20" rx="2" fill="#fff" fillOpacity=".5" />
    </svg>
  );
}

export const gameIcons = [
  { name: "Streak", C: FlameIcon },
  { name: "Gems", C: GemIcon },
  { name: "Lives", C: HeartIcon },
  { name: "Energy", C: BoltIcon },
  { name: "Coins", C: CoinIcon },
  { name: "Chest", C: ChestIcon },
  { name: "Trophy", C: TrophyIcon },
  { name: "Shield", C: ShieldIcon },
  { name: "XP Star", C: StarIcon },
  { name: "Target", C: TargetIcon },
  { name: "Bull", C: CandleUpIcon },
  { name: "Bear", C: CandleDownIcon },
  { name: "Locked", C: LockIcon },
];
