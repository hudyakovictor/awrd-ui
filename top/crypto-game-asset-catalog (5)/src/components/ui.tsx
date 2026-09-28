import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { haptic, sfx, type SfxName } from "../utils/sfx";
import { Icon } from "./Icons";

/* ============ 3D BUTTON ============ */
export type Variant = "blue" | "bull" | "bear" | "gold" | "violet" | "neutral" | "ghost" | "cyan";
const VAR: Record<Variant, Record<string, string>> = {
  blue: { "--top": "#6a9dff", "--base": "#3d7bff", "--lip": "#2250c2", "--fg": "#fff", "--glow": "rgba(61,123,255,.55)" },
  bull: { "--top": "#5af5b4", "--base": "#1fdb8b", "--lip": "#0d9a5c", "--fg": "#03261a", "--glow": "rgba(31,219,139,.5)" },
  bear: { "--top": "#ff7c93", "--base": "#ff4d6a", "--lip": "#c0253f", "--fg": "#fff", "--glow": "rgba(255,77,106,.5)" },
  gold: { "--top": "#ffdc7a", "--base": "#ffc53d", "--lip": "#c38709", "--fg": "#2d1c00", "--glow": "rgba(255,197,61,.5)" },
  violet: { "--top": "#ab86ff", "--base": "#8d5cff", "--lip": "#5a2fcc", "--fg": "#fff", "--glow": "rgba(141,92,255,.5)" },
  cyan: { "--top": "#7ee8fa", "--base": "#2ed3f0", "--lip": "#1595b0", "--fg": "#032530", "--glow": "rgba(46,211,240,.5)" },
  neutral: { "--top": "#243870", "--base": "#1b2c5e", "--lip": "#0b1536", "--fg": "#dfe7ff", "--glow": "rgba(0,0,0,.6)" },
  ghost: { "--top": "transparent", "--base": "transparent", "--lip": "#1a2a5c", "--fg": "#9db4ff" },
};
const SIZES = {
  xs: "h-8 px-3 text-[10.5px] rounded-[11px] [--depth:3px]",
  sm: "h-10 px-4 text-[11.5px] rounded-[13px] [--depth:4px]",
  md: "h-12 px-5 text-[13px]",
  lg: "h-14 px-7 text-[14px] rounded-[18px] [--depth:6px]",
  xl: "h-16 px-8 text-[16px] rounded-[20px] [--depth:7px]",
};

type BtnProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: Variant; size?: keyof typeof SIZES; loading?: boolean; icon?: ReactNode; iconRight?: ReactNode;
  full?: boolean; pressed?: boolean; sound?: SfxName; children?: ReactNode; round?: boolean;
};
export function Btn3D({ variant = "blue", size = "md", loading, disabled, icon, iconRight, full, pressed, sound = "tap", children, className, onClick, onPointerDown, round, style, ...rest }: BtnProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  return (
    <button
      {...rest}
      disabled={disabled}
      data-pressed={pressed ? "true" : undefined}
      aria-busy={loading}
      className={cn("btn3d", variant === "ghost" && "ghost", SIZES[size], full && "w-full", round && "!px-0 aspect-square !rounded-full", loading && "pointer-events-none", className)}
      style={{ ...(VAR[variant] as CSSProperties), ...style }}
      onPointerDown={(e) => {
        if (!disabled && !loading) {
          const r = e.currentTarget.getBoundingClientRect();
          const id = Date.now() + Math.random();
          setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
          setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 650);
        }
        onPointerDown?.(e);
      }}
      onClick={(e) => { sfx[sound](); haptic(8); onClick?.(e); }}
    >
      {ripples.map((r) => <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />)}
      {loading ? <Spinner size={16} /> : icon}
      {children !== undefined && <span className={cn(loading && "opacity-80")}>{children}</span>}
      {iconRight}
    </button>
  );
}

export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn("animate-spin", className)}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ============ LAYOUT ============ */
export function Section({ id, index, title, subtitle, children, count }: { id: string; index: string; title: string; subtitle: string; children: ReactNode; count?: number }) {
  return (
    <section id={id} className="scroll-mt-24 mb-20 relative">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2 mb-7">
        <div className="raised size-12 grid place-items-center num text-sm font-extrabold text-blue">{index}</div>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-[30px] font-extrabold tracking-tight leading-none">{title}</h2>
          <p className="text-mute text-sm mt-1.5">{subtitle}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-ink-500/80 to-transparent mb-3 hidden sm:block" />
        {count !== undefined && <span className="label-caps mb-2">{count} ассетов</span>}
      </div>
      {children}
    </section>
  );
}

export function Asset({ title, id, desc, children, className, tags = [], replay = true, bodyClass }: { title: string; id: string; desc?: string; children: ReactNode; className?: string; tags?: string[]; replay?: boolean; bodyClass?: string }) {
  const [k, setK] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.06, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={boxRef} className={cn("panel p-5 flex flex-col min-w-0 transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(.2,.9,.3,1.1)]", !seen && "opacity-0 translate-y-10 scale-[.97]", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-extrabold tracking-tight">{title}</h3>
            {tags.map((t) => <Badge key={t} tone={t === "NEW" ? "bull" : t === "PRO" ? "violet" : t === "HOT" ? "bear" : "blue"} size="xs">{t}</Badge>)}
          </div>
          {desc && <p className="text-[12px] text-mute mt-1 leading-relaxed">{desc}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <code className="text-[10px] num text-dim hidden md:block">{id}</code>
          {replay && (
            <button onClick={() => { setK((v) => v + 1); sfx.whoosh(); }} className="size-7 grid place-items-center inset !rounded-lg text-mute hover:text-txt transition" title="Перезапустить анимации" aria-label="Replay">
              <Icon name="refresh" size={13} />
            </button>
          )}
        </div>
      </div>
      <div key={k} className={cn("flex-1 anim-fade", bodyClass)}>{children}</div>
    </div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("label-caps mb-2.5", className)}>{children}</div>;
}

/* ============ BADGE / AVATAR ============ */
const TONE: Record<string, string> = {
  blue: "bg-blue/15 text-[#8fb3ff] border-blue/35",
  bull: "bg-bull/15 text-bull border-bull/35",
  bear: "bg-bear/15 text-[#ff8da0] border-bear/35",
  gold: "bg-gold/15 text-gold border-gold/35",
  violet: "bg-violet/15 text-[#b89bff] border-violet/35",
  cyan: "bg-cyan/15 text-cyan border-cyan/35",
  neutral: "bg-white/5 text-mute border-white/10",
};
export function Badge({ children, tone = "blue", size = "sm", className, dot }: { children: ReactNode; tone?: string; size?: "xs" | "sm"; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 border font-extrabold uppercase tracking-wider rounded-full", size === "xs" ? "text-[9px] px-1.5 py-[1px]" : "text-[10.5px] px-2.5 py-1", TONE[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

const GRADS = ["from-[#3d7bff] to-[#8d5cff]", "from-[#1fdb8b] to-[#2ed3f0]", "from-[#ff4d6a] to-[#ffc53d]", "from-[#8d5cff] to-[#ff4d9a]", "from-[#ffc53d] to-[#ff7a2e]", "from-[#2ed3f0] to-[#3d7bff]"];
export function Avatar({ name, size = 40, status, ring, className }: { name: string; size?: number; status?: "online" | "trading" | "away" | "off"; ring?: string; className?: string }) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADS.length;
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const st = { online: "bg-bull", trading: "bg-gold", away: "bg-bear", off: "bg-dim" };
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <div className={cn("size-full rounded-full grid place-items-center font-extrabold text-white bg-gradient-to-br shadow-[inset_0_2px_0_rgba(255,255,255,.3),0_3px_0_rgba(0,0,0,.35)]", GRADS[idx], ring)} style={{ fontSize: size * 0.36 }}>
        {initials}
      </div>
      {status && <span className={cn("absolute bottom-0 right-0 rounded-full border-[2.5px] border-ink-800", st[status], status === "trading" && "animate-pulse")} style={{ width: size * 0.3, height: size * 0.3 }} />}
    </div>
  );
}

/* ============ PROGRESS ============ */
const BAR: Record<string, string> = {
  bull: "from-[#5af5b4] to-[#12c47a]", blue: "from-[#6a9dff] to-[#2f67ea]", gold: "from-[#ffdc7a] to-[#f0a811]",
  bear: "from-[#ff7c93] to-[#e3304f]", violet: "from-[#ab86ff] to-[#6f3cf0]", cyan: "from-[#7ee8fa] to-[#18b4d4]",
};
export function Bar({ value, tone = "bull", h = 14, striped, className, children }: { value: number; tone?: string; h?: number; striped?: boolean; className?: string; children?: ReactNode }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("inset !rounded-full p-[3px] relative", className)} style={{ height: h + 6 }}>
      <div className={cn("h-full rounded-full bg-gradient-to-b relative overflow-hidden transition-[width] duration-700 ease-[cubic-bezier(.2,.9,.3,1.1)]", BAR[tone])} style={{ width: `${v}%`, minWidth: v > 0 ? h : 0 }}>
        <div className="absolute left-[6px] right-[6px] top-[3px] h-[28%] rounded-full bg-white/40" />
        {striped && <div className="absolute inset-0 stripes" />}
      </div>
      {children && <div className="absolute inset-0 grid place-items-center text-[10.5px] font-extrabold num">{children}</div>}
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 10, tone = "#1fdb8b", tone2, children, track = "#0a1330" }: { value: number; size?: number; stroke?: number; tone?: string; tone2?: string; children?: ReactNode; track?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = useMemo(() => "rg" + Math.random().toString(36).slice(2, 8), []);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={tone} /><stop offset="1" stopColor={tone2 || tone} /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={stroke} strokeDasharray={`${(c * Math.min(value, 100)) / 100} ${c}`} strokeLinecap="round" transform={`translate(0 2)`} style={{ transition: "stroke-dasharray .8s cubic-bezier(.2,.9,.3,1)" }} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeDasharray={`${(c * Math.min(value, 100)) / 100} ${c}`} strokeLinecap="round" style={{ transition: "stroke-dasharray .8s cubic-bezier(.2,.9,.3,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ============ ANIMATED NUMBER ============ */
export function useCountUp(value: number, duration = 700) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (value - a) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, duration]);
  return v;
}
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", className }: { value: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const v = useCountUp(value);
  return <span className={cn("num", className)}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

/* ============ CONFETTI ============ */
const CC = ["#1fdb8b", "#3d7bff", "#ffc53d", "#ff4d6a", "#8d5cff", "#2ed3f0"];
export function Confetti({ fire, count = 42, spread = 160 }: { fire: number; count?: number; spread?: number }) {
  const parts = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const a = Math.random() * Math.PI * 2;
    const d = spread * (0.45 + Math.random() * 0.8);
    return { i, dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8 + 70, rot: Math.random() * 900 - 450, dur: 0.9 + Math.random() * 0.7, w: 5 + Math.random() * 5, round: Math.random() > 0.7 };
  }), [fire, count, spread]);
  if (!fire) return null;
  return (
    <div key={fire} className="pointer-events-none absolute inset-0 z-50 overflow-visible">
      {parts.map((p) => (
        <span key={p.i} className="absolute left-1/2 top-1/2" style={{ width: p.w, height: p.round ? p.w : p.w * 1.6, borderRadius: p.round ? 99 : 2, background: CC[p.i % CC.length], "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, animation: `confetti ${p.dur}s cubic-bezier(.15,.75,.35,1) forwards` } as CSSProperties} />
      ))}
    </div>
  );
}

/* ============ TOASTS ============ */
export type ToastType = "success" | "info" | "warning" | "error" | "xp";
export type ToastT = { id: number; type: ToastType; title: string; msg?: string; dur?: number };
const TC: Record<ToastType, { icon: string; c: string; bar: string }> = {
  success: { icon: "check", c: "text-bull bg-bull/15 border-bull/40", bar: "bg-bull" },
  info: { icon: "info", c: "text-[#8fb3ff] bg-blue/15 border-blue/40", bar: "bg-blue" },
  warning: { icon: "warning", c: "text-gold bg-gold/15 border-gold/40", bar: "bg-gold" },
  error: { icon: "x", c: "text-bear bg-bear/15 border-bear/40", bar: "bg-bear" },
  xp: { icon: "bolt", c: "text-violet bg-violet/15 border-violet/40", bar: "bg-violet" },
};
export function ToastView({ t, onClose, className }: { t: ToastT; onClose: () => void; className?: string }) {
  const [paused, setPaused] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const remaining = useRef(t.dur ?? 4000);
  const startAt = useRef(0);
  useEffect(() => {
    if (paused) return;
    startAt.current = Date.now();
    const h = setTimeout(() => closeRef.current(), remaining.current);
    return () => { clearTimeout(h); remaining.current -= Date.now() - startAt.current; };
  }, [paused]);
  const s = TC[t.type];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className={cn("raised anim-toast relative overflow-hidden flex items-start gap-3 p-3 pr-2 !rounded-2xl", className)} role="status">
      <div className={cn("size-8 shrink-0 rounded-xl grid place-items-center border", s.c)}><Icon name={s.icon} size={16} stroke={2.6} /></div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[13px] font-extrabold">{t.title}</div>
        {t.msg && <div className="text-[12px] text-mute leading-snug mt-0.5">{t.msg}</div>}
      </div>
      <button onClick={onClose} className="size-7 grid place-items-center rounded-lg text-dim hover:text-txt hover:bg-white/5" aria-label="Закрыть"><Icon name="x" size={14} /></button>
      <div className={cn("absolute bottom-0 left-0 h-[3px] origin-left", s.bar)} style={{ width: "100%", animation: `grow-x ${t.dur ?? 4000}ms linear reverse forwards`, animationPlayState: paused ? "paused" : "running" }} />
    </div>
  );
}

const ToastCtx = createContext<(t: Omit<ToastT, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastT[]>([]);
  const push = useCallback((t: Omit<ToastT, "id">) => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p.slice(-3), { ...t, id }]);
    if (t.type === "error") sfx.error(); else if (t.type === "xp") sfx.coin(); else sfx.pop();
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]">
        {items.map((t) => <ToastView key={t.id} t={t} onClose={() => setItems((p) => p.filter((x) => x.id !== t.id))} />)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ============ SELECTION ============ */
export function Toggle({ on, onChange, tone = "bull", size = "md", disabled }: { on: boolean; onChange: (v: boolean) => void; tone?: "bull" | "blue" | "violet" | "gold"; size?: "sm" | "md"; disabled?: boolean }) {
  const bg = { bull: "bg-gradient-to-b from-[#3fe9a1] to-[#12b870]", blue: "bg-gradient-to-b from-[#6a9dff] to-[#2f67ea]", violet: "bg-gradient-to-b from-[#ab86ff] to-[#6f3cf0]", gold: "bg-gradient-to-b from-[#ffdc7a] to-[#f0a811]" }[tone];
  const w = size === "sm" ? 44 : 58, h = size === "sm" ? 26 : 32, k = h - 8;
  return (
    <button role="switch" aria-checked={on} disabled={disabled} onClick={() => { onChange(!on); sfx.toggle(); haptic(6); }}
      className={cn("relative rounded-full transition-colors duration-300 shadow-[inset_0_3px_7px_rgba(0,0,0,.5)] disabled:opacity-40", on ? bg : "bg-[#0a1330]")}
      style={{ width: w, height: h }}>
      <span className={cn("absolute top-[4px] left-[4px] rounded-full bg-gradient-to-b from-white to-[#c9d5f5] shadow-[0_3px_0_rgba(0,0,0,.3),0_4px_10px_rgba(0,0,0,.35)] transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] grid place-items-center")}
        style={{ width: k, height: k, transform: `translateX(${on ? w - k - 8 : 0}px)` }}>
        <span className={cn("size-1.5 rounded-full transition-colors", on ? "bg-bull" : "bg-dim")} />
      </span>
    </button>
  );
}

export function Check({ checked, onChange, label, radio, tone = "blue", disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; radio?: boolean; tone?: "blue" | "bull"; disabled?: boolean }) {
  const on = tone === "bull" ? "bg-gradient-to-b from-[#3fe9a1] to-[#12b870] border-[#0d9a5c] text-[#03261a]" : "bg-gradient-to-b from-[#6a9dff] to-[#2f67ea] border-[#2250c2] text-white";
  return (
    <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none group", disabled && "opacity-40 pointer-events-none")}>
      <button type="button" role={radio ? "radio" : "checkbox"} aria-checked={checked} onClick={() => { onChange(radio ? true : !checked); sfx.toggle(); haptic(6); }}
        className={cn("relative size-7 grid place-items-center border-2 border-b-[4px] transition-all active:translate-y-[2px] active:border-b-2", radio ? "rounded-full" : "rounded-[9px]", checked ? on : "bg-[#0c1737] border-[#26397a] group-hover:border-[#3d57a8]")}>
        {checked && (radio ? <span className="size-2.5 rounded-full bg-white anim-pop shadow" /> : <Icon name="check" size={16} stroke={3.4} className="anim-pop" />)}
      </button>
      {label && <span className="text-[13px] font-semibold">{label}</span>}
    </label>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className, size = "md" }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string; size?: "sm" | "md" }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className={cn("inset !rounded-2xl p-1 relative grid", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      <div className="absolute top-1 bottom-[7px] left-1 rounded-xl bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_3px_0_#0b1536,inset_0_1px_0_rgba(255,255,255,.15)] transition-transform duration-300 ease-[cubic-bezier(.3,1.3,.5,1)]"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }} />
      {options.map((o) => (
        <button key={o.value} onClick={() => { onChange(o.value); sfx.tick(); }} className={cn("relative z-10 font-extrabold transition-colors mb-[3px] rounded-xl", size === "sm" ? "h-8 text-[11px]" : "h-10 text-[12.5px]", o.value === value ? "text-white" : "text-mute hover:text-txt")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tooltip({ text, children, side = "top", open }: { text: ReactNode; children: ReactNode; side?: "top" | "bottom" | "left" | "right"; open?: boolean }) {
  const pos = { top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5", bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5", left: "right-full top-1/2 -translate-y-1/2 mr-2.5", right: "left-full top-1/2 -translate-y-1/2 ml-2.5" }[side];
  const arrow = { top: "top-full left-1/2 -translate-x-1/2 -mt-[5px]", bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-[5px]", left: "left-full top-1/2 -translate-y-1/2 -ml-[5px]", right: "right-full top-1/2 -translate-y-1/2 -mr-[5px]" }[side];
  return (
    <span className="relative inline-flex group/tt">
      {children}
      <span className={cn("absolute z-40 whitespace-nowrap pointer-events-none px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold bg-[#24397a] border border-white/10 shadow-[0_4px_0_#0b1536,0_10px_20px_rgba(0,0,0,.4)] transition-all duration-200", pos, open ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover/tt:opacity-100 group-hover/tt:scale-100 group-focus-within/tt:opacity-100 group-focus-within/tt:scale-100")}>
        {text}
        <span className={cn("absolute size-2.5 rotate-45 bg-[#24397a] border-white/10", arrow)} />
      </span>
    </span>
  );
}

/* floating "+10 XP" style particles */
export function FloatText({ items }: { items: { id: number; text: string; color?: string; x?: number | string }[] }) {
  return (
    <>
      {items.map((f) => (
        <span key={f.id} className="absolute pointer-events-none font-extrabold num text-sm z-40" style={{ left: f.x ?? "50%", top: 0, color: f.color || "#ffc53d", animation: "rise 1s ease-out forwards", textShadow: "0 2px 0 rgba(0,0,0,.4)" }}>
          {f.text}
        </span>
      ))}
    </>
  );
}
export function useFloat() {
  const [items, setItems] = useState<{ id: number; text: string; color?: string; x?: number | string }[]>([]);
  const add = useCallback((text: string, color?: string, x?: number | string) => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, text, color, x }]);
    setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 1000);
  }, []);
  return [items, add] as const;
}
