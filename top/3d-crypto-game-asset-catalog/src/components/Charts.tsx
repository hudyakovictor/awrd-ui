import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../lib/motion";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   CHARTS — переиспользуемые canvas/SVG графики для журнала и турниров.
   EquityCurve · Donut · Bars · Heatmap · Sparkline
   Все уважают reduced-motion (рисуются сразу, без анимации).
   ═══════════════════════════════════════════════════════════════════ */

function reduced() {
  try {
    return document.documentElement.dataset.rm === "1" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/* ── Кривая доходности: canvas, градиент, кроссхейр, анимация отрисовки ── */
export function EquityCurve({ data, height = 190, up = "#2BE38B", down = "#FF4D6D", onHover }: {
  data: number[]; height?: number; up?: string; dn?: string; down?: string; onHover?: (i: number | null, v: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const { ref: inRef, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [hov, setHov] = useState<number | null>(null);
  const prog = useRef(0);
  const anim = useRef({ from: 0, t0: 0, on: false });

  const min = Math.min(...data);
  const max = Math.max(...data);
  const first = data[0];
  const last = data[data.length - 1];
  const good = last >= first;

  /* связка refs */
  const setRefs = (el: HTMLDivElement | null) => {
    (wrap as { current: HTMLDivElement | null }).current = el;
    (inRef as { current: Element | null }).current = el;
  };

  useEffect(() => {
    if (!inView) return;
    anim.current = { from: 0, t0: performance.now(), on: !reduced() };
    prog.current = reduced() ? 1 : 0;
  }, [inView, data]);

  useEffect(() => {
    const cv = ref.current;
    const box = wrap.current;
    if (!cv || !box || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let W = 0, H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = box.getBoundingClientRect();
      W = r.width; H = height;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.height = `${height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const pad = { l: 8, r: 8, t: 12, b: 22 };
    const X = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const Y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
    const col = good ? up : down;

    const draw = (now: number) => {
      const a = anim.current;
      if (a.on) {
        const k = Math.min(1, (now - a.t0) / 1400);
        const e = 1 - Math.pow(1 - k, 3);
        prog.current = e;
        if (k >= 1) a.on = false;
      }
      const p = prog.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      /* сетка */
      ctx.strokeStyle = "rgba(125,147,198,.12)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(125,147,198,.75)";
      ctx.font = "9px JetBrains Mono, monospace";
      for (let g = 0; g <= 3; g++) {
        const v = min + ((max - min) * g) / 3;
        const y = Y(v);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillText(v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0), pad.l + 2, y - 3);
      }
      const upto = Math.max(2, Math.floor(data.length * p));
      const pts = data.slice(0, upto);
      /* заливка */
      const grad = ctx.createLinearGradient(0, pad.t, 0, H);
      grad.addColorStop(0, col + "55");
      grad.addColorStop(1, col + "00");
      ctx.beginPath();
      pts.forEach((v, i) => { const x = X(i), y = Y(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.lineTo(X(upto - 1), H - pad.b);
      ctx.lineTo(X(0), H - pad.b);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      /* линия */
      ctx.beginPath();
      pts.forEach((v, i) => { const x = X(i), y = Y(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      /* пульс конца */
      if (p >= 1) {
        const lx = X(data.length - 1), ly = Y(last);
        const pr = 3.5 + Math.sin(now / 400) * 1.5;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(lx, ly, pr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col + "44";
        ctx.beginPath(); ctx.arc(lx, ly, pr * 2.4, 0, Math.PI * 2); ctx.fill();
      }
      /* кроссхейр */
      if (hov !== null && p >= 1) {
        const hx = X(hov), hy = Y(data[hov]);
        ctx.strokeStyle = "rgba(255,255,255,.35)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, H - pad.b); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, data, height, hov, up, down, good, min, max]);

  return (
    <div ref={setRefs} className="relative">
      <canvas
        ref={ref}
        className="block w-full cursor-crosshair"
        onMouseMove={(e) => {
          const r = wrap.current!.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left - 8) / (r.width - 16)) * (data.length - 1));
          const c = Math.max(0, Math.min(data.length - 1, i));
          setHov(c);
          onHover?.(c, data[c]);
        }}
        onMouseLeave={() => { setHov(null); onHover?.(null, last); }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const r = wrap.current!.getBoundingClientRect();
          const i = Math.round(((t.clientX - r.left - 8) / (r.width - 16)) * (data.length - 1));
          setHov(Math.max(0, Math.min(data.length - 1, i)));
        }}
        onTouchEnd={() => setHov(null)}
      />
    </div>
  );
}

/* ── Кольцевая диаграмма: SVG, анимация сегментов ── */
export function Donut({ parts, size = 150, thick = 16, center }: {
  parts: { v: number; c: string; label: string }[]; size?: number; thick?: number; center?: React.ReactNode;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const R = 42, C = 2 * Math.PI * R;
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  let acc = 0;
  const [hov, setHov] = useState<number | null>(null);
  return (
    <div ref={ref} className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#081229" strokeWidth={thick} />
        {parts.map((p, i) => {
          const len = (p.v / total) * C;
          const el = (
            <circle
              key={p.label}
              cx="50" cy="50" r={R} fill="none" stroke={p.c} strokeWidth={hov === i ? thick + 3 : thick}
              strokeDasharray={`${inView ? Math.max(0, len - 1.4) : 0} ${C}`}
              strokeDashoffset={-acc}
              strokeLinecap="round"
              style={{ transition: `stroke-dasharray 1s cubic-bezier(.22,1,.36,1) ${i * 120}ms, stroke-width .2s`, cursor: "pointer", opacity: hov === null || hov === i ? 1 : 0.45 }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {hov !== null ? (
          <>
            <span className="font-display text-xl font-black" style={{ color: parts[hov].c }}>{Math.round((parts[hov].v / total) * 100)}%</span>
            <span className="max-w-[90px] text-[9px] font-bold uppercase leading-tight text-ink-300">{parts[hov].label}</span>
          </>
        ) : center}
      </div>
    </div>
  );
}

/* ── Столбцы: каскадная анимация высоты ── */
export function Bars({ values, height = 120, color = "#3D9BFF", highlightLast = true, onPick }: {
  values: { v: number; label: string; c?: string }[]; height?: number; color?: string; highlightLast?: boolean; onPick?: (i: number) => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(...values.map((x) => x.v)) || 1;
  return (
    <div ref={ref} className="flex items-end gap-1.5" style={{ height }}>
      {values.map((x, i) => {
        const hot = highlightLast && i === values.length - 1;
        const active = sel === i;
        return (
          <button
            key={x.label}
            onClick={() => { setSel(i); onPick?.(i); }}
            className="group relative flex flex-1 flex-col items-center justify-end self-stretch"
            aria-label={`${x.label}: ${x.v}`}
          >
            <span className={cn("pointer-events-none absolute -top-7 whitespace-nowrap rounded-lg bg-ink-950 px-2 py-0.5 font-mono text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100", active && "opacity-100")}>
              {x.label} · {x.v}
            </span>
            <span
              className="w-full rounded-t-lg transition-all duration-700 [transition-timing-function:cubic-bezier(.34,1.3,.64,1)]"
              style={{
                height: inView ? `${Math.max(4, (x.v / max) * 100)}%` : "4%",
                transitionDelay: `${i * 45}ms`,
                background: x.c ?? (hot ? `linear-gradient(180deg, ${color}, ${color}88)` : "#243d73"),
                boxShadow: hot ? `0 0 14px ${color}66` : undefined,
                outline: active ? `2px solid ${color}` : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ── Тепловая карта-календарь PnL ── */
export function PnlHeatmap({ days, onPick }: { days: { d: number; pnl: number | null; n: number }[]; onPick?: (d: number) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((x) => Math.abs(x.pnl ?? 0)));
  const bg = (pnl: number | null) => {
    if (pnl === null) return "#101f44";
    const k = Math.abs(pnl) / max;
    return pnl >= 0 ? `rgba(43,227,139,${0.12 + k * 0.75})` : `rgba(255,77,109,${0.12 + k * 0.75})`;
  };
  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-ink-500">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((x, i) => (
          <button
            key={i}
            disabled={x.pnl === null}
            onClick={() => { setSel(x.d); onPick?.(x.d); }}
            className={cn("flex aspect-square flex-col items-center justify-center rounded-lg transition-transform hover:scale-105", sel === x.d && "ring-2 ring-white scale-105", x.pnl === null && "opacity-40")}
            style={{ background: bg(x.pnl) }}
            aria-label={`${x.d} число: ${x.pnl === null ? "нет сделок" : (x.pnl >= 0 ? "+" : "") + x.pnl}`}
          >
            <span className="text-[10px] font-bold text-white/80">{x.d}</span>
            {x.pnl !== null && (
              <span className="font-mono text-[9px] font-black text-white">
                {x.pnl >= 0 ? "+" : ""}{x.pnl >= 1000 || x.pnl <= -1000 ? `${(x.pnl / 1000).toFixed(1)}K` : x.pnl}
              </span>
            )}
            {x.n > 1 && <span className="font-mono text-[8px] text-white/60">{x.n} сд.</span>}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-ink-400">
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-bear" />убыток</span>
        <span className="flex items-center gap-1">прибыль<span className="size-2.5 rounded-sm bg-bull" /></span>
      </div>
    </div>
  );
}

/* ── Спарклайн с заливкой ── */
export function Spark({ data, w = 96, h = 30, stroke = 2 }: { data: number[]; w?: number; h?: number; stroke?: number }) {
  const { ref, inView } = useInView<SVGSVGElement>({ threshold: 0.5 });
  const pts = useMemo(() => {
    const min = Math.min(...data), max = Math.max(...data);
    return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  }, [data, w, h]);
  const up = data[data.length - 1] >= data[0];
  const c = up ? "#2BE38B" : "#FF4D6D";
  const len = w * 1.6;
  return (
    <svg ref={ref} width={w} height={h} className="overflow-visible">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={c} opacity=".14" style={{ transition: "opacity .8s", opacity: inView ? 0.14 : 0 }} />
      <polyline
        points={pts} fill="none" stroke={c} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={inView ? 0 : len}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}
