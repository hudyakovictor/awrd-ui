import { motion } from "motion/react";
import { S, E } from "../lib/motion";

/* =====================================================================
   АРТ-СИСТЕМА «СИГНАЛ» v2
   Всё процедурное: гербы рангов, аватары, фоны сцен, текстуры, рамки.
   Ни одного растрового файла, ни одного эмодзи.
   ===================================================================== */

/* ---------- палитра рангов ---------- */
export const RANKS = [
  { id: "wood", t: "ДЕРЕВО", a: "#8a6a4a", b: "#5c4630" },
  { id: "bronze", t: "БРОНЗА", a: "#c98b4b", b: "#8a5a28" },
  { id: "silver", t: "СЕРЕБРО", a: "#c7d3e4", b: "#7e8da0" },
  { id: "gold", t: "ЗОЛОТО", a: "#ffd964", b: "#c08a1c" },
  { id: "plat", t: "ПЛАТИНА", a: "#7fe3d6", b: "#2a8d85" },
  { id: "dia", t: "АЛМАЗ", a: "#a9c6ff", b: "#4b6ede" },
  { id: "master", t: "МАСТЕР", a: "#d3a6ff", b: "#7b43c9" },
] as const;
export type RankId = (typeof RANKS)[number]["id"];

/* ---------- Герб ранга: щит + огранка + звёзды ---------- */
export function RankCrest({
  rank = "gold", size = 96, stars = 3, glow = true, label,
}: { rank?: RankId; size?: number; stars?: number; glow?: boolean; label?: string }) {
  const r = RANKS.find((x) => x.id === rank) ?? RANKS[3];
  const uid = `crest-${rank}-${size}`;
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" fill="none">
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={r.a} />
          <stop offset="0.55" stopColor={r.b} />
          <stop offset="1" stopColor={r.a} stopOpacity=".75" />
        </linearGradient>
        <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-b`}><feGaussianBlur stdDeviation="3.5" /></filter>
      </defs>

      {glow && <path d="M50 4 92 20v38c0 23-17 38-42 48C25 96 8 81 8 58V20L50 4Z" fill={r.a} opacity=".35" filter={`url(#${uid}-b)`} />}

      <path d="M50 4 92 20v38c0 23-17 38-42 48C25 96 8 81 8 58V20L50 4Z" fill={`url(#${uid}-g)`} stroke="#0b1220" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M50 12 85 25v33c0 19-14 32-35 40C29 90 15 77 15 58V25L50 12Z" fill="#0b1220" opacity=".42" />
      <path d="M50 12 85 25v33c0 19-14 32-35 40" fill={`url(#${uid}-s)`} />

      {/* фасет-грани */}
      <path d="M50 12v94M15 40h70M22 62h56" stroke="#0b1220" strokeWidth="1.2" opacity=".22" />

      {/* центральный знак — стилизованная свеча */}
      <g transform="translate(50 50)">
        <rect x="-4.5" y="-16" width="9" height="32" rx="3" fill={r.a} stroke="#0b1220" strokeWidth="2" />
        <path d="M0-24v8M0 16v8" stroke={r.a} strokeWidth="3" strokeLinecap="round" />
        <path d="M-12 6 0-8l12 14" stroke="#0b1220" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
      </g>

      {/* звёзды ранга */}
      {Array.from({ length: 3 }).map((_, i) => (
        <g key={i} transform={`translate(${34 + i * 16} 94) scale(${i < stars ? 1 : 0.82})`}>
          <path d="m0-6 1.8 3.7L6-1.6 3-.2l.7 4L0 1.9l-3.7 1.9.7-4-3-1.4 4.2-.7L0-6Z"
            fill={i < stars ? "#fff6d6" : "#0b1220"} stroke="#0b1220" strokeWidth="1.6" strokeLinejoin="round" opacity={i < stars ? 1 : 0.5} />
        </g>
      ))}

      {label && (
        <text x="50" y="110" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={r.a} fontFamily="Manrope, sans-serif" letterSpacing="1">
          {label}
        </text>
      )}
    </svg>
  );
}

/* ---------- Процедурный аватар: геометрический «трейдер» ---------- */
export function Avatar({
  seed = 1, size = 56, tone = "#3ec9a7", ring = true,
}: { seed?: number; size?: number; tone?: string; ring?: boolean }) {
  const visor = seed % 3;
  const uid = `av-${seed}-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone} stopOpacity=".38" />
          <stop offset="1" stopColor="#0b1220" />
        </linearGradient>
        <clipPath id={`${uid}-c`}><circle cx="32" cy="32" r="29" /></clipPath>
      </defs>
      <circle cx="32" cy="32" r="29" fill={`url(#${uid}-bg)`} />
      <g clipPath={`url(#${uid}-c)`}>
        {/* фоновые лучи */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-4 + i * 14} y="-10" width="6" height="90" fill={tone} opacity=".07" transform={`rotate(${18 + seed * 3} 32 32)`} />
        ))}
        {/* плечи */}
        <path d="M6 64c0-13 12-20 26-20s26 7 26 20H6Z" fill={tone} opacity=".3" />
        <path d="M6 64c0-13 12-20 26-20s26 7 26 20" stroke={tone} strokeWidth="2.4" fill="none" />
        {/* голова */}
        <rect x="19" y="14" width="26" height="28" rx="10" fill="#0e1828" stroke={tone} strokeWidth="2.6" />
        {/* визор */}
        {visor === 0 && <rect x="22.5" y="23" width="19" height="7.5" rx="3.6" fill={tone} />}
        {visor === 1 && (<>
          <rect x="22.5" y="23" width="8" height="7" rx="3" fill={tone} />
          <rect x="33.5" y="23" width="8" height="7" rx="3" fill={tone} />
          <path d="M30.5 26.5h3" stroke={tone} strokeWidth="1.6" />
        </>)}
        {visor === 2 && (<>
          <path d="M22 27h20" stroke={tone} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="27" cy="27" r="2.6" fill="#0e1828" />
          <circle cx="37" cy="27" r="2.6" fill="#0e1828" />
        </>)}
        {/* антенна / наушник */}
        <path d="M45 22v8M47 24v4" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M19 26h-3v6h3" stroke={tone} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
      {ring && <circle cx="32" cy="32" r="29" stroke={tone} strokeWidth="2.6" fill="none" />}
      {ring && <circle cx="32" cy="32" r="31.4" stroke={tone} strokeWidth="1" opacity=".3" fill="none" />}
    </svg>
  );
}

/* ---------- Фон сцены: слои параллакса «биржевого города» ---------- */
export function SceneBackdrop({ tone = "#3ec9a7", alt = "#9d8cf5", animate = true }: { tone?: string; alt?: string; animate?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(90% 60% at 50% 0%, ${tone}1f, transparent 70%)` }} />
      {/* дальние «свечные» башни */}
      <svg viewBox="0 0 320 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[52%] w-full opacity-[0.18]">
        {Array.from({ length: 14 }).map((_, i) => {
          const h = 40 + ((i * 53) % 110);
          return <rect key={i} x={i * 24} y={200 - h} width="15" height={h} rx="3" fill={i % 3 === 0 ? alt : tone} />;
        })}
      </svg>
      {/* ближние башни */}
      <svg viewBox="0 0 320 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full opacity-[0.28]">
        {Array.from({ length: 9 }).map((_, i) => {
          const h = 50 + ((i * 71) % 90);
          return <rect key={i} x={i * 38 + 6} y={200 - h} width="26" height={h} rx="4" fill="#0b1220" stroke={tone} strokeWidth="1.5" opacity=".9" />;
        })}
      </svg>
      {/* парящие частицы данных */}
      {animate && Array.from({ length: 10 }).map((_, i) => (
        <motion.span key={i} className="absolute h-1 w-1 rounded-full" style={{ background: i % 2 ? alt : tone, left: `${(i * 37) % 95}%`, top: `${(i * 23) % 80}%` }}
          animate={{ y: [0, -26, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

/* ---------- Ленточный заголовок (ribbon) ---------- */
export function Ribbon({ children, tone = "#f2c14e", w = 210 }: { children: React.ReactNode; tone?: string; w?: number }) {
  return (
    <div className="relative" style={{ width: w }}>
      <svg viewBox="0 0 210 40" width={w} height={40} className="absolute inset-0">
        <path d="M14 4h182l-10 16 10 16H14L4 20 14 4Z" fill={tone} opacity=".18" />
        <path d="M14 4h182l-10 16 10 16H14L4 20 14 4Z" stroke={tone} strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>
      <div className="relative grid h-10 place-items-center text-[11px] font-extrabold uppercase tracking-[0.25em]" style={{ color: tone }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Радар характеристик ---------- */
export function StatRadar({
  values, labels, size = 150, tone = "#3ec9a7",
}: { values: number[]; labels: string[]; size?: number; tone?: string }) {
  const n = values.length;
  const cx = 50, cy = 50, R = 38;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = values.map((v, i) => pt(i, (v / 100) * R).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {[0.35, 0.65, 1].map((k) => (
        <polygon key={k} points={Array.from({ length: n }).map((_, i) => pt(i, R * k).join(",")).join(" ")}
          fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="0.8" />
      ))}
      {Array.from({ length: n }).map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.08)" strokeWidth="0.8" />;
      })}
      <motion.polygon points={poly} fill={tone} fillOpacity=".22" stroke={tone} strokeWidth="2" strokeLinejoin="round"
        initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...S.pop, delay: 0.1 }}
        style={{ transformOrigin: "50px 50px" }} />
      {values.map((v, i) => {
        const [x, y] = pt(i, (v / 100) * R);
        return <motion.circle key={i} cx={x} cy={y} r="2.4" fill={tone}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.25 + i * 0.05 }} />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + 9);
        return <text key={l} x={x} y={y + 2} textAnchor="middle" fontSize="5.4" fontWeight="800" fill="#8fa4c7" fontFamily="Manrope, sans-serif">{l}</text>;
      })}
    </svg>
  );
}

/* ---------- Кольцевой индикатор с подписью ---------- */
export function Dial({
  v, max = 100, size = 112, tone = "#3ec9a7", label, sub, thick = 9,
}: { v: number; max?: number; size?: number; tone?: string; label?: string; sub?: string; thick?: number }) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const p = Math.max(0, Math.min(1, v / max));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={thick} />
        <motion.circle cx="50" cy="50" r={R} fill="none" stroke={tone} strokeWidth={thick} strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - p) }}
          transition={{ ...S.soft, damping: 24 }} style={{ filter: `drop-shadow(0 0 6px ${tone}88)` }} />
      </svg>
      <div className="relative text-center">
        {label && <div className="mono text-[17px] font-extrabold leading-none" style={{ color: tone }}>{label}</div>}
        {sub && <div className="mt-0.5 text-[8px] font-extrabold uppercase tracking-widest text-mist">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Медаль достижения ---------- */
export function Medal({ tone = "#f2c14e", size = 54, locked = false }: { tone?: string; size?: number; locked?: boolean }) {
  const c = locked ? "#46587a" : tone;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22 6 16 26h32L42 6H22Z" fill={c} opacity=".28" />
      <path d="M22 6 16 26M42 6l6 20" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="40" r="17" fill={c} opacity=".2" />
      <circle cx="32" cy="40" r="17" stroke={c} strokeWidth="3" fill="none" />
      <circle cx="32" cy="40" r="11" stroke={c} strokeWidth="1.6" fill="none" opacity=".55" />
      <path d="m32 32 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L32 32Z" fill={c} />
    </svg>
  );
}

/* ---------- Полоса «объёма» под графиком ---------- */
export function VolumeStrip({ data, tone = "#3ec9a7", alt = "#e46a5f", w = 250, h = 34 }: { data: number[]; tone?: string; alt?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const bw = w / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {data.map((v, i) => (
        <motion.rect key={i} x={i * bw + 1} width={bw - 2} rx="1.6"
          fill={i % 3 === 2 ? alt : tone} opacity={0.35 + (v / max) * 0.6}
          initial={{ height: 0, y: h }} animate={{ height: (v / max) * h, y: h - (v / max) * h }}
          transition={{ ...S.pop, delay: i * 0.03 }} />
      ))}
    </svg>
  );
}

/* ---------- Свечной график с уровнями и подсветкой ---------- */
export function CandleScene({
  w = 260, h = 130, seed = 3, level, marker, tone = "#3ec9a7", bear = "#e46a5f", grid = true,
}: { w?: number; h?: number; seed?: number; level?: number; marker?: number; tone?: string; bear?: string; grid?: boolean }) {
  const n = 14;
  const rows: { o: number; c: number; hi: number; lo: number }[] = [];
  let p = 40 + (seed % 5) * 3;
  for (let i = 0; i < n; i++) {
    const dir = Math.sin(i * 1.3 + seed) + (i > n * 0.6 ? 0.55 : -0.1);
    const c = Math.max(12, Math.min(88, p + dir * 9));
    rows.push({ o: p, c, hi: Math.max(p, c) + 4 + ((i * 7) % 5), lo: Math.min(p, c) - 3 - ((i * 5) % 4) });
    p = c;
  }
  const bw = w / n;
  const Y = (v: number) => h - (v / 100) * h;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {grid && [0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
      ))}
      {level !== undefined && (
        <>
          <motion.line x1="0" y1={Y(level)} x2={w} y2={Y(level)} stroke={bear} strokeWidth="1.6" strokeDasharray="6 5"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8, ease: E.out }} />
          <motion.circle cx={w - 6} cy={Y(level)} r="3" fill={bear}
            initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </>
      )}
      {rows.map((r, i) => {
        const up = r.c >= r.o;
        const col = up ? tone : bear;
        const x = i * bw + bw / 2;
        return (
          <motion.g key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...S.pop, delay: i * 0.045 }}>
            <line x1={x} y1={Y(r.hi)} x2={x} y2={Y(r.lo)} stroke={col} strokeWidth="1.6" opacity=".8" />
            <rect x={x - bw * 0.3} y={Y(Math.max(r.o, r.c))} width={bw * 0.6} height={Math.max(3, Math.abs(r.c - r.o) * (h / 100))} rx="2" fill={col} />
          </motion.g>
        );
      })}
      {marker !== undefined && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...S.pop, delay: 0.7 }}>
          <circle cx={marker * bw + bw / 2} cy={Y(rows[Math.min(n - 1, marker)].c)} r="9" fill="none" stroke="#f2c14e" strokeWidth="2" />
          <motion.circle cx={marker * bw + bw / 2} cy={Y(rows[Math.min(n - 1, marker)].c)} r="9" fill="none" stroke="#f2c14e" strokeWidth="1.6"
            animate={{ r: [9, 17], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        </motion.g>
      )}
    </svg>
  );
}

/* ---------- Декоративная угловая рамка ---------- */
export function CornerFrame({ tone = "#3ec9a7", inset = 0 }: { tone?: string; inset?: number }) {
  const c = `absolute h-4 w-4 border-${""}`;
  return (
    <div className="pointer-events-none absolute inset-0" style={{ padding: inset }}>
      {[
        "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
        "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
        "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
        "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
      ].map((p) => <span key={p} className={`${c} ${p}`} style={{ borderColor: tone, position: "absolute" }} />)}
    </div>
  );
}

/* ---------- Полоса «бегущей строки» котировок ---------- */
export function Ticker({ items, tone = "#3ec9a7" }: { items: { t: string; v: string; up: boolean }[]; tone?: string }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#0b1220] py-1.5">
      <motion.div className="flex w-max gap-4 px-2" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        {row.map((q, i) => (
          <span key={i} className="mono flex shrink-0 items-center gap-1.5 text-[9.5px] font-bold">
            <span className="text-mist">{q.t}</span>
            <span style={{ color: q.up ? tone : "#e46a5f" }}>{q.up ? "▲" : "▼"} {q.v}</span>
          </span>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0b1220] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0b1220] to-transparent" />
    </div>
  );
}

/* ---------- Отрисовка «печати» (штамп) ---------- */
export function Stamp({ text, tone = "#e46a5f", size = 108 }: { text: string; tone?: string; size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      initial={{ scale: 2.4, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 1, rotate: -12 }}
      transition={{ ...S.pop, damping: 12 }}>
      <circle cx="60" cy="60" r="52" stroke={tone} strokeWidth="5" opacity=".85" />
      <circle cx="60" cy="60" r="43" stroke={tone} strokeWidth="2" opacity=".5" strokeDasharray="4 4" />
      <text x="60" y="67" textAnchor="middle" fontSize="19" fontWeight="900" fill={tone} fontFamily="Manrope, sans-serif" letterSpacing="1.5">{text}</text>
    </motion.svg>
  );
}

/* ---------- Маленький «спарк» для строк ---------- */
export function Spark({ data, tone = "#3ec9a7", w = 62, h = 22 }: { data: number[]; tone?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const rng = max - min || 1;
  const d = data.map((v, i) => `${i ? "L" : "M"}${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <motion.path d={d} fill="none" stroke={tone} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: E.out }} />
    </svg>
  );
}

/* ---------- Иконка «экран телефона» для карт потоков ---------- */
export function MiniScreen({ tone = "#3ec9a7", kind = 0, w = 44 }: { tone?: string; kind?: number; w?: number }) {
  const h = w * 1.9;
  return (
    <svg width={w} height={h} viewBox="0 0 44 84" fill="none">
      <rect x="1.5" y="1.5" width="41" height="81" rx="8" fill="#0e1828" stroke={tone} strokeWidth="2" />
      <rect x="16" y="5" width="12" height="3" rx="1.5" fill={tone} opacity=".5" />
      {kind === 0 && (<>
        <rect x="6" y="14" width="32" height="20" rx="3" fill={tone} opacity=".22" />
        <rect x="6" y="38" width="15" height="12" rx="3" fill={tone} opacity=".3" />
        <rect x="23" y="38" width="15" height="12" rx="3" fill={tone} opacity=".14" />
        <rect x="6" y="54" width="32" height="8" rx="4" fill={tone} opacity=".4" />
      </>)}
      {kind === 1 && (<>
        <circle cx="22" cy="28" r="11" fill={tone} opacity=".25" />
        <rect x="9" y="46" width="26" height="5" rx="2.5" fill={tone} opacity=".3" />
        <rect x="13" y="55" width="18" height="4" rx="2" fill={tone} opacity=".2" />
        <rect x="6" y="66" width="32" height="9" rx="4.5" fill={tone} opacity=".45" />
      </>)}
      {kind === 2 && (<>
        {[0, 1, 2, 3].map((i) => <rect key={i} x="6" y={14 + i * 12} width="32" height="9" rx="3" fill={tone} opacity={0.3 - i * 0.05} />)}
        <rect x="6" y="66" width="32" height="9" rx="4.5" fill={tone} opacity=".45" />
      </>)}
      {kind === 3 && (<>
        <path d="M8 40 14 30l6 6 6-12 6 8 4-6" stroke={tone} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6" y="50" width="14" height="14" rx="3" fill={tone} opacity=".25" />
        <rect x="24" y="50" width="14" height="14" rx="3" fill={tone} opacity=".18" />
      </>)}
      <rect x="15" y="77" width="14" height="2" rx="1" fill={tone} opacity=".4" />
    </svg>
  );
}
