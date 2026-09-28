import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import { cn } from "../utils/cn";

/* ================================================================== */
/*  TORO — the Tradelingo mascot                                       */
/*  A sculpted armoured bull with a glass visor. Eye-tracking,         */
/*  blinking, 8 moods, wardrobe, and a bear-rival variant (URSA).      */
/* ================================================================== */

export type Mood = "idle" | "happy" | "sad" | "think" | "shock" | "celebrate" | "sleep" | "wave";
export const MOODS: Mood[] = ["idle", "happy", "wave", "think", "shock", "sad", "celebrate", "sleep"];

export const SKINS = {
  royal: ["#6f9bff", "#2c4fc4", "#1a3180"],
  emerald: ["#5cf0ab", "#15a066", "#0b5e3b"],
  ember: ["#ff9471", "#d2401f", "#7f1f0b"],
  violet: ["#c3a2ff", "#6a3be0", "#3a1690"],
  graphite: ["#a4b1cc", "#4d5a78", "#27304a"],
  gold: ["#ffe08a", "#d99a1c", "#8a5a08"],
} as const;
export type SkinKey = keyof typeof SKINS;

export type Hat = "none" | "cap" | "crown" | "headset" | "beanie";
export type Outfit = { hat?: Hat; shades?: boolean; chain?: boolean };

const BODY: Record<Mood, TargetAndTransition> = {
  idle: { y: [0, -3, 0], rotate: 0, scaleY: 1, transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  wave: { y: [0, -3, 0], rotate: 0, scaleY: 1, transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
  happy: { y: [0, -9, 0], rotate: 0, scaleY: [1, 0.97, 1], transition: { duration: 0.55, repeat: Infinity, ease: "easeOut" } },
  celebrate: { y: [0, -24, 0], rotate: [0, -4, 4, 0], scaleY: [1, 1.05, 0.93, 1], transition: { duration: 0.7, repeat: Infinity } },
  sad: { y: [3, 5, 3], rotate: 0, scaleY: 0.98, transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
  shock: { y: [0, -14, 0], rotate: [0, -3, 3, 0], scaleY: 1, transition: { duration: 0.4 } },
  think: { y: 0, rotate: [0, -4, -4, 0], scaleY: 1, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  sleep: { y: [0, 2, 0], rotate: 3, scaleY: [1, 0.98, 1], transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
};

export function Mascot({
  mood = "idle",
  size = 180,
  species = "bull",
  skin = "royal",
  outfit = {},
  track = true,
  className,
  onClick,
}: {
  mood?: Mood;
  size?: number;
  species?: "bull" | "bear";
  skin?: SkinKey;
  outfit?: Outfit;
  track?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const uid = useRef("m" + Math.random().toString(36).slice(2, 8)).current;
  const [c1, c2, c3] = species === "bear" && skin === "royal" ? (["#ff9a86", "#c2362a", "#6e1410"] as const) : SKINS[skin];
  const hat = outfit.hat ?? "none";

  useEffect(() => {
    if (!track) return;
    let raf = 0;
    const mv = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.42);
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(1, d / 260);
        setLook({ x: (dx / d) * 5.5 * m, y: (dy / d) * 4 * m });
      });
    };
    window.addEventListener("pointermove", mv);
    return () => {
      window.removeEventListener("pointermove", mv);
      cancelAnimationFrame(raf);
    };
  }, [track]);

  useEffect(() => {
    let t = 0;
    let t2 = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        t2 = window.setTimeout(() => setBlink(false), 130);
        loop();
      }, 2000 + Math.random() * 3000);
    };
    loop();
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const lx = mood === "think" ? 4 : mood === "sad" ? 0 : look.x;
  const ly = mood === "think" ? -4 : mood === "sad" ? 3 : look.y;
  const eyeCol = "var(--accent)";
  const happyEyes = mood === "happy" || mood === "celebrate" || mood === "wave";

  /* ---------- eyes ---------- */
  const eyes = () => {
    if (outfit.shades && mood !== "shock") return null;
    if (mood === "sleep" || blink) {
      return [80, 120].map((x) => <path key={x} d={`M${x - 8} 86 Q${x} ${mood === "sleep" ? 90 : 87} ${x + 8} 86`} stroke={eyeCol} strokeWidth="4" strokeLinecap="round" fill="none" />);
    }
    if (happyEyes) {
      return [80, 120].map((x) => <path key={x} d={`M${x - 9} 89 Q${x} 75 ${x + 9} 89`} stroke={eyeCol} strokeWidth="5" strokeLinecap="round" fill="none" filter={`url(#${uid}g)`} />);
    }
    if (mood === "shock") {
      return [80, 120].map((x) => (
        <g key={x}>
          <circle cx={x} cy="84" r="11" fill={eyeCol} filter={`url(#${uid}g)`} />
          <circle cx={x + lx * 0.4} cy={84 + ly * 0.4} r="4.5" fill="#06101f" />
          <circle cx={x - 3.5} cy="80" r="2" fill="#fff" />
        </g>
      ));
    }
    return [80, 120].map((x) => (
      <g key={x}>
        <rect x={x - 7 + lx} y={(mood === "sad" ? 80 : 75) + ly} width="14" height={mood === "sad" ? 14 : 19} rx="7" fill={eyeCol} filter={`url(#${uid}g)`} />
        <circle cx={x - 2 + lx * 1.2} cy={(mood === "sad" ? 84 : 80) + ly * 1.1} r="2.4" fill="#fff" opacity=".9" />
      </g>
    ));
  };

  /* ---------- mouth ---------- */
  const mouth = () => {
    switch (mood) {
      case "happy":
      case "wave":
        return <path d="M89 129 Q100 141 111 129 Z" fill="#101a3a" stroke="#101a3a" strokeWidth="2" strokeLinejoin="round" />;
      case "celebrate":
        return (
          <g>
            <path d="M86 127 Q100 148 114 127 Z" fill="#150a22" />
            <ellipse cx="100" cy="138" rx="7" ry="4" fill="#ff7a96" />
          </g>
        );
      case "sad":
        return <path d="M91 136 Q100 128 109 136" stroke="#101a3a" strokeWidth="3.2" strokeLinecap="round" fill="none" />;
      case "shock":
        return <ellipse cx="100" cy="133" rx="5.5" ry="7" fill="#150a22" />;
      case "think":
        return <path d="M93 133 Q100 130 108 131" stroke="#101a3a" strokeWidth="3" strokeLinecap="round" fill="none" />;
      case "sleep":
        return <ellipse cx="100" cy="132" rx="3" ry="2.4" fill="#101a3a" />;
      default:
        return <path d="M92 131 Q100 135.5 108 131" stroke="#101a3a" strokeWidth="3" strokeLinecap="round" fill="none" />;
    }
  };

  const armL: TargetAndTransition =
    mood === "celebrate"
      ? { rotate: [150, 170, 150], transition: { duration: 0.35, repeat: Infinity } }
      : mood === "sad"
        ? { rotate: 8 }
        : mood === "think"
          ? { rotate: 0 }
          : { rotate: [0, 4, 0], transition: { duration: 2.6, repeat: Infinity } };
  const armR: TargetAndTransition =
    mood === "celebrate"
      ? { rotate: [-150, -170, -150], transition: { duration: 0.35, repeat: Infinity } }
      : mood === "wave" || mood === "happy"
        ? { rotate: [-140, -110, -140], transition: { duration: 0.5, repeat: Infinity } }
        : mood === "think"
          ? { rotate: -125 }
          : mood === "sad"
            ? { rotate: -8 }
            : { rotate: [0, -4, 0], transition: { duration: 2.6, repeat: Infinity } };

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 200 210"
      width={size}
      height={size * 1.05}
      className={cn("overflow-visible", onClick && "cursor-pointer", className)}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      aria-label="Toro the mascot"
      role="img"
    >
      <defs>
        <radialGradient id={`${uid}s`} cx="0.35" cy="0.25" r="0.9">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.55" stopColor={c2} />
          <stop offset="1" stopColor={c3} />
        </radialGradient>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset="0.5" stopColor="#ffcf5a" />
          <stop offset="1" stopColor="#b8741a" />
        </linearGradient>
        <linearGradient id={`${uid}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2a52" />
          <stop offset="1" stopColor="#050a18" />
        </linearGradient>
        <filter id={`${uid}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ground shadow */}
      <motion.ellipse
        cx="100"
        cy="200"
        rx="52"
        ry="8"
        fill="#000"
        opacity=".38"
        animate={mood === "celebrate" ? { rx: [52, 38, 52], opacity: [0.38, 0.18, 0.38] } : { rx: 52 }}
        transition={{ duration: 0.7, repeat: mood === "celebrate" ? Infinity : 0 }}
      />

      <motion.g animate={BODY[mood]} style={{ originX: 0.5, originY: 1 }}>
        {/* legs */}
        <rect x="72" y="168" width="20" height="28" rx="10" fill={c3} />
        <rect x="108" y="168" width="20" height="28" rx="10" fill={c3} />
        <rect x="70" y="188" width="24" height="10" rx="5" fill="#0d1428" />
        <rect x="106" y="188" width="24" height="10" rx="5" fill="#0d1428" />

        {/* arms */}
        <motion.g animate={armL} style={{ originX: 0.7, originY: 0.12 }}>
          <ellipse cx="50" cy="152" rx="12" ry="22" fill={c2} />
          <circle cx="50" cy="172" r="9" fill={c3} />
        </motion.g>
        <motion.g animate={armR} style={{ originX: 0.3, originY: 0.12 }}>
          <ellipse cx="150" cy="152" rx="12" ry="22" fill={c2} />
          <circle cx="150" cy="172" r="9" fill={c3} />
        </motion.g>

        {/* body */}
        <ellipse cx="100" cy="152" rx="50" ry="40" fill={`url(#${uid}s)`} />
        <ellipse cx="100" cy="160" rx="31" ry="25" fill="#fff" opacity=".16" />
        <g transform="translate(100 160)">
          <rect x="-1.4" y="-15" width="2.8" height="30" rx="1.4" fill="var(--accent)" opacity=".85" />
          <rect x="-6" y="-9" width="12" height="17" rx="3" fill="var(--accent)" filter={`url(#${uid}g)`} />
        </g>
        {outfit.chain && (
          <g>
            <path d="M66 128 Q100 158 134 128" stroke={`url(#${uid}h)`} strokeWidth="4.5" fill="none" strokeDasharray="5 2.5" strokeLinecap="round" />
            <circle cx="100" cy="146" r="11" fill={`url(#${uid}h)`} stroke="#8f5608" strokeWidth="1.5" />
            <text x="100" y="150.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#6b3f05">
              ₿
            </text>
          </g>
        )}

        {/* head */}
        <g>
          {species === "bull" ? (
            <>
              <path d="M52 64 C 30 60 20 40 27 22 C 36 38 47 44 63 48 Z" fill="#8f5608" transform="translate(0 2)" />
              <path d="M52 64 C 30 60 20 40 27 22 C 36 38 47 44 63 48 Z" fill={`url(#${uid}h)`} />
              <path d="M148 64 C 170 60 180 40 173 22 C 164 38 153 44 137 48 Z" fill="#8f5608" transform="translate(0 2)" />
              <path d="M148 64 C 170 60 180 40 173 22 C 164 38 153 44 137 48 Z" fill={`url(#${uid}h)`} />
              <path d="M30 30 C 32 40 40 46 50 50" stroke="#fff" strokeWidth="2" fill="none" opacity=".55" strokeLinecap="round" />
              <ellipse cx="40" cy="84" rx="15" ry="9" fill={c2} transform="rotate(-24 40 84)" />
              <ellipse cx="160" cy="84" rx="15" ry="9" fill={c2} transform="rotate(24 160 84)" />
              <ellipse cx="40" cy="84" rx="8" ry="4.5" fill={c3} transform="rotate(-24 40 84)" />
              <ellipse cx="160" cy="84" rx="8" ry="4.5" fill={c3} transform="rotate(24 160 84)" />
            </>
          ) : (
            <>
              <circle cx="56" cy="46" r="18" fill={c2} />
              <circle cx="144" cy="46" r="18" fill={c2} />
              <circle cx="56" cy="46" r="9" fill={c3} />
              <circle cx="144" cy="46" r="9" fill={c3} />
            </>
          )}
          <ellipse cx="100" cy="90" rx="61" ry="53" fill={`url(#${uid}s)`} />
          <ellipse cx="86" cy="56" rx="30" ry="11" fill="#fff" opacity=".2" />

          {/* visor */}
          <rect x="52" y="63" width="96" height="42" rx="21" fill={`url(#${uid}v)`} />
          <rect x="52" y="63" width="96" height="42" rx="21" fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1.5" />
          <path d="M62 72 Q80 66 98 68" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".25" />
          {eyes()}
          {mood === "sad" && !outfit.shades && (
            <>
              <path d="M70 72 L88 77" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity=".7" />
              <path d="M130 72 L112 77" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity=".7" />
            </>
          )}
          {outfit.shades && (
            <g>
              <rect x="56" y="70" width="40" height="26" rx="9" fill="#020409" />
              <rect x="104" y="70" width="40" height="26" rx="9" fill="#020409" />
              <rect x="94" y="77" width="12" height="4" rx="2" fill="#020409" />
              <path d="M62 76 L74 76 L66 90 Z" fill="#fff" opacity=".22" />
              <path d="M110 76 L122 76 L114 90 Z" fill="#fff" opacity=".22" />
              <rect x="56" y="70" width="40" height="26" rx="9" fill="none" stroke="#ffc24b" strokeWidth="1.5" />
              <rect x="104" y="70" width="40" height="26" rx="9" fill="none" stroke="#ffc24b" strokeWidth="1.5" />
            </g>
          )}

          {/* cheeks */}
          {(happyEyes || mood === "idle") && (
            <>
              <ellipse cx="60" cy="116" rx="9" ry="5" fill="#ff7a96" opacity={happyEyes ? 0.55 : 0.25} />
              <ellipse cx="140" cy="116" rx="9" ry="5" fill="#ff7a96" opacity={happyEyes ? 0.55 : 0.25} />
            </>
          )}

          {/* snout */}
          <ellipse cx="100" cy="124" rx="31" ry="18" fill={c1} />
          <ellipse cx="100" cy="124" rx="31" ry="18" fill="#fff" opacity=".3" />
          <ellipse cx="96" cy="114" rx="16" ry="4" fill="#fff" opacity=".35" />
          <ellipse cx="89" cy="120" rx="3.4" ry="4.4" fill="#101a3a" opacity=".75" />
          <ellipse cx="111" cy="120" rx="3.4" ry="4.4" fill="#101a3a" opacity=".75" />
          {mouth()}

          {/* hats */}
          {hat === "cap" && (
            <g>
              <path d="M54 58 C 58 26 142 26 146 58 Z" fill="var(--accent)" />
              <path d="M54 58 C 58 26 142 26 146 58 Z" fill="#000" opacity=".15" />
              <path d="M96 56 C 124 50 160 52 176 62 C 150 64 122 63 96 62 Z" fill="var(--accent-edge)" />
              <circle cx="100" cy="30" r="4" fill="var(--accent-edge)" />
              <path d="M70 44 C 80 34 96 32 110 33" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".4" strokeLinecap="round" />
            </g>
          )}
          {hat === "beanie" && (
            <g>
              <path d="M52 60 C 52 22 148 22 148 60 Z" fill="#ff4d6a" />
              <rect x="48" y="52" width="104" height="14" rx="7" fill="#d11d40" />
              {[60, 72, 84, 96, 108, 120, 132].map((x) => (
                <rect key={x} x={x} y="54" width="3" height="10" rx="1.5" fill="#a01131" />
              ))}
              <circle cx="100" cy="24" r="9" fill="#fff" />
            </g>
          )}
          {hat === "crown" && (
            <g transform="translate(70 12)">
              <path d="M2 14 L12 26 L30 2 L48 26 L58 14 L54 40 H6 Z" fill="#8f5608" transform="translate(0 2)" />
              <path d="M2 14 L12 26 L30 2 L48 26 L58 14 L54 40 H6 Z" fill={`url(#${uid}h)`} />
              <circle cx="30" cy="33" r="3.5" fill="#ff4d6a" />
              <circle cx="17" cy="33" r="2.5" fill="#38e1ff" />
              <circle cx="43" cy="33" r="2.5" fill="#38e1ff" />
            </g>
          )}
          {hat === "headset" && (
            <g>
              <path d="M44 86 C 40 30 160 30 156 86" stroke="#1a2440" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M44 86 C 40 30 160 30 156 86" stroke="#3a4a72" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="30" y="74" width="20" height="30" rx="9" fill="#1a2440" />
              <rect x="150" y="74" width="20" height="30" rx="9" fill="#1a2440" />
              <rect x="34" y="80" width="4" height="18" rx="2" fill="var(--accent)" />
              <path d="M40 104 C 44 124 60 132 76 130" stroke="#1a2440" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="78" cy="130" r="5" fill="var(--accent)" filter={`url(#${uid}g)`} />
            </g>
          )}
        </g>
      </motion.g>

      {/* mood FX */}
      <AnimatePresence>
        {mood === "think" && (
          <motion.g key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[
              [160, 44, 5],
              [172, 28, 7],
              [186, 8, 10],
            ].map(([x, y, r], i) => (
              <motion.circle key={i} cx={x} cy={y} r={r} fill="#dbe5ff" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </motion.g>
        )}
        {mood === "celebrate" && (
          <motion.g key="cel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[
              [20, 40, "#ffc24b"],
              [182, 50, "#38e1ff"],
              [30, 140, "#ff4d6a"],
              [176, 132, "#9b6bff"],
              [100, 0, "#2be08a"],
            ].map(([x, y, c], i) => (
              <motion.path
                key={i}
                d={`M${x} ${Number(y) - 8} L${Number(x) + 2.4} ${Number(y) - 2.4} L${Number(x) + 8} ${y} L${Number(x) + 2.4} ${Number(y) + 2.4} L${x} ${Number(y) + 8} L${Number(x) - 2.4} ${Number(y) + 2.4} L${Number(x) - 8} ${y} L${Number(x) - 2.4} ${Number(y) - 2.4} Z`}
                fill={String(c)}
                animate={{ scale: [0, 1.3, 0], rotate: [0, 90] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                style={{ originX: 0.5, originY: 0.5 }}
              />
            ))}
          </motion.g>
        )}
        {mood === "sleep" && (
          <motion.g key="zz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.text
                key={i}
                x={150 + i * 12}
                y={50 - i * 14}
                fontSize={14 + i * 5}
                fontWeight="900"
                fill="#a3b1d2"
                fontFamily="JetBrains Mono, monospace"
                animate={{ opacity: [0, 1, 0], y: [0, -10] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
              >
                Z
              </motion.text>
            ))}
          </motion.g>
        )}
        {mood === "sad" && (
          <motion.ellipse
            key="tear"
            cx="126"
            cy="104"
            rx="3.5"
            ry="5"
            fill="#7fd8ff"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], cy: [102, 128] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        {mood === "shock" && (
          <motion.g key="shock" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <path d="M170 30 L178 16 M180 40 L194 34 M160 22 L162 6" stroke="#ffc24b" strokeWidth="4" strokeLinecap="round" />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}

/* ================================================================== */
/*  SPEECH BUBBLE — typewriter                                         */
/* ================================================================== */
export function Bubble({
  text,
  className,
  side = "left",
  speed = 18,
  tone = "default",
}: {
  text: string;
  className?: string;
  side?: "left" | "bottom";
  speed?: number;
  tone?: "default" | "accent";
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.85, x: side === "left" ? -8 : 0, y: side === "bottom" ? 8 : 0 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn("relative rounded-2xl border-2 px-3.5 py-2.5 text-[13px] font-bold leading-snug", className)}
      style={{
        background: tone === "accent" ? "color-mix(in srgb, var(--accent) 14%, #111c36)" : "#111c36",
        borderColor: tone === "accent" ? "var(--accent)" : "#26396a",
        color: "#e6eeff",
        boxShadow: "0 4px 0 #0a1328",
      }}
    >
      <span>{text.slice(0, n)}</span>
      <span className="invisible">{text.slice(n)}</span>
      {side === "left" ? (
        <span
          className="absolute -left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2"
          style={{ background: tone === "accent" ? "color-mix(in srgb, var(--accent) 14%, #111c36)" : "#111c36", borderColor: tone === "accent" ? "var(--accent)" : "#26396a" }}
        />
      ) : (
        <span
          className="absolute -bottom-[9px] left-8 h-4 w-4 rotate-45 border-b-2 border-r-2"
          style={{ background: tone === "accent" ? "color-mix(in srgb, var(--accent) 14%, #111c36)" : "#111c36", borderColor: tone === "accent" ? "var(--accent)" : "#26396a" }}
        />
      )}
    </motion.div>
  );
}
