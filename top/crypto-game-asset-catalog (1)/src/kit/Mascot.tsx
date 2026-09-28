import { useEffect, useId, useRef, useState } from "react";

export type Mood = "idle" | "happy" | "sad" | "think" | "hype";

/** TORO — the bull mentor. Eyes track the pointer, 5 moods, idle blink + breathing. */
export function Mascot({ mood = "idle", size = 140, onClick }: { mood?: Mood; size?: number; onClick?: () => void }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(1, d / 300);
      setLook({ x: (dx / d) * 3.2 * m, y: (dy / d) * 3.2 * m });
    };
    window.addEventListener("pointermove", h);
    return () => window.removeEventListener("pointermove", h);
  }, []);

  const px = mood === "think" ? 2.5 : look.x;
  const py = mood === "think" ? -3 : mood === "sad" ? 2 : look.y;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      onClick={onClick}
      className="cursor-pointer select-none"
      style={{ animation: mood === "hype" ? "float 0.8s ease-in-out infinite" : "float 3.4s ease-in-out infinite", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${id}body`} x1="60" y1="16" x2="60" y2="108">
          <stop stopColor="#5E9BFF" />
          <stop offset="1" stopColor="#2152C4" />
        </linearGradient>
        <linearGradient id={`${id}horn`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFF0B5" />
          <stop offset="1" stopColor="#E59A0F" />
        </linearGradient>
        <linearGradient id={`${id}snout`} x1="60" y1="70" x2="60" y2="104">
          <stop stopColor="#C9DCFF" />
          <stop offset="1" stopColor="#8FB0F0" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="60" cy="114" rx="30" ry="4" fill="#000" opacity=".35" />
      {/* horns */}
      <path d="M26 40C14 36 8 24 10 12c6 10 14 14 24 16z" fill={`url(#${id}horn)`} />
      <path d="M94 40c12-4 18-16 16-28-6 10-14 14-24 16z" fill={`url(#${id}horn)`} />
      {/* ears */}
      <ellipse cx="18" cy="52" rx="10" ry="6" fill="#2152C4" transform="rotate(-20 18 52)" />
      <ellipse cx="102" cy="52" rx="10" ry="6" fill="#2152C4" transform="rotate(20 102 52)" />
      {/* head */}
      <path d="M60 108c-24 0-38-14-38-40 0-26 14-44 38-44s38 18 38 44c0 26-14 40-38 40z" fill="#16398F" transform="translate(0 3)" />
      <path d="M60 108c-24 0-38-14-38-40 0-26 14-44 38-44s38 18 38 44c0 26-14 40-38 40z" fill={`url(#${id}body)`} />
      <path d="M36 38c6-8 14-11 22-11" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" />
      {/* tuft - candle */}
      <rect x="57" y="14" width="6" height="14" rx="2" fill="#22D39A" />
      <rect x="59.3" y="10" width="1.4" height="22" fill="#22D39A" />

      {/* brows */}
      <g stroke="#0D1F5C" strokeWidth="4" strokeLinecap="round" style={{ transition: "all .3s" }}>
        {mood === "sad" && (<><path d="M36 48l12-4" /><path d="M84 48l-12-4" /></>)}
        {mood === "think" && (<><path d="M36 46l12 0" /><path d="M72 42l12-4" /></>)}
        {mood === "idle" && (<><path d="M36 46l12-2" /><path d="M84 46l-12-2" /></>)}
        {mood === "happy" && (<><path d="M36 44l12-3" /><path d="M84 44l-12-3" /></>)}
      </g>

      {/* eyes */}
      {mood === "happy" ? (
        <g stroke="#0D1F5C" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M36 60q6-8 12 0" />
          <path d="M72 60q6-8 12 0" />
        </g>
      ) : mood === "hype" ? (
        <g>
          <path d="M28 52h64v6c0 8-6 12-14 12s-12-4-14-10h-8c-2 6-6 10-14 10s-14-4-14-12z" fill="#0A1224" />
          <path d="M34 56l10 8M74 56l10 8" stroke="#2BD9FF" strokeWidth="3" strokeLinecap="round" opacity=".8" />
          <rect x="28" y="51" width="64" height="4" rx="2" fill="#FFC53D" />
        </g>
      ) : (
        <g style={{ transformOrigin: "60px 60px", animation: "blink 4.5s infinite" }}>
          <ellipse cx="42" cy="60" rx="8" ry="9" fill="#fff" />
          <ellipse cx="78" cy="60" rx="8" ry="9" fill="#fff" />
          <circle cx={42 + px} cy={61 + py} r="4.6" fill="#0A1224" />
          <circle cx={78 + px} cy={61 + py} r="4.6" fill="#0A1224" />
          <circle cx={43.5 + px} cy={59 + py} r="1.5" fill="#fff" />
          <circle cx={79.5 + px} cy={59 + py} r="1.5" fill="#fff" />
        </g>
      )}

      {/* snout */}
      <ellipse cx="60" cy="88" rx="24" ry="16" fill={`url(#${id}snout)`} />
      <ellipse cx="51" cy="86" rx="3.2" ry="4.2" fill="#2152C4" />
      <ellipse cx="69" cy="86" rx="3.2" ry="4.2" fill="#2152C4" />
      {/* mouth */}
      <path
        d={mood === "sad" ? "M52 99q8-5 16 0" : mood === "think" ? "M53 97h12" : mood === "happy" || mood === "hype" ? "M50 95q10 9 20 0" : "M53 96q7 4 14 0"}
        stroke="#16398F"
        strokeWidth="3"
        strokeLinecap="round"
        fill={mood === "happy" || mood === "hype" ? "#16398F" : "none"}
        style={{ transition: "d .3s" }}
      />
      {/* nose ring */}
      <path d="M56 100a4 4 0 008 0" stroke="#FFC53D" strokeWidth="2.5" fill="none" />
      {mood === "sad" && <path d="M34 70q-3 6 0 9 3-3 0-9z" fill="#8FF3FF" style={{ animation: "float 1.2s ease-in-out infinite" }} />}
      {mood === "think" && (
        <g fill="#8A9BC4">
          <circle cx="100" cy="30" r="3" />
          <circle cx="108" cy="20" r="4.5" />
          <circle cx="114" cy="6" r="6" />
        </g>
      )}
    </svg>
  );
}
