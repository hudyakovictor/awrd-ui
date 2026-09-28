import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { Mascot } from "../components/art";
import { useInView } from "../lib/motion";
import { tap, sfx, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   I06–I07 — Подводная просадка и отчёт недели.
   ═══════════════════════════════════════════════════════════════════ */

/* ── I06 · Underwater: насколько глубока просадка ── */
const DD = [0, -0.4, -1.1, -0.7, -1.8, -2.6, -1.9, -3.4, -2.2, -4.2, -3.1, -2.4, -1.5, -1.9, -0.8, -1.2, -0.3, 0, -0.5, 0];

export function Underwater() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { ref: inRef, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [hov, setHov] = useState<number | null>(null);
  const maxDD = Math.min(...DD);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();
    const reduced = document.documentElement.dataset.rm === "1";
    const draw = (now: number) => {
      const box = cv.parentElement!;
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = r.width * dpr; cv.height = 150 * dpr;
      cv.style.height = "150px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = r.width, H = 150;
      const k = reduced ? 1 : Math.min(1, (now - t0) / 1200);
      const e = 1 - Math.pow(1 - k, 3);
      const upto = Math.max(2, Math.floor(DD.length * e));
      ctx.clearRect(0, 0, W, H);
      const X = (i: number) => 8 + (i / (DD.length - 1)) * (W - 16);
      const Y = (v: number) => 10 + ((-v / 5) * (H - 40));
      /* зоны */
      ctx.fillStyle = "rgba(43,227,139,.07)";
      ctx.fillRect(0, Y(-1), W, Y(0) - Y(-1) + 10);
      ctx.fillStyle = "rgba(255,201,64,.07)";
      ctx.fillRect(0, Y(-3), W, Y(-1) - Y(-3));
      ctx.fillStyle = "rgba(255,77,109,.08)";
      ctx.fillRect(0, Y(-5), W, Y(-3) - Y(-3));
      const pts = DD.slice(0, upto);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(61,155,255,.05)");
      grad.addColorStop(1, "rgba(255,77,109,.5)");
      ctx.beginPath();
      pts.forEach((v, i) => { const x = X(i), y = Y(v); if (i === 0) ctx.moveTo(x, Y(0)); ctx.lineTo(x, y); });
      ctx.lineTo(X(upto - 1), Y(0));
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      pts.forEach((v, i) => { const x = X(i), y = Y(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.strokeStyle = "#3D9BFF";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      /* худшая точка */
      const wi = DD.indexOf(maxDD);
      if (upto > wi) {
        ctx.fillStyle = "#FF4D6D";
        ctx.beginPath(); ctx.arc(X(wi), Y(maxDD), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px JetBrains Mono, monospace";
        ctx.fillText(`${maxDD.toFixed(1)}%`, X(wi) - 32, Y(maxDD) + 18);
      }
      if (hov !== null && upto >= DD.length) {
        ctx.strokeStyle = "rgba(255,255,255,.4)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(X(hov), 0); ctx.lineTo(X(hov), H); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (k < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onMove = (ev: MouseEvent) => {
      const r = (ref.current!.parentElement as HTMLElement).getBoundingClientRect();
      const i = Math.round(((ev.clientX - r.left - 8) / (r.width - 16)) * (DD.length - 1));
      setHov(Math.max(0, Math.min(DD.length - 1, i)));
    };
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", () => setHov(null));
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("mousemove", onMove); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Chip tone="bear">макс. просадка {maxDD.toFixed(1)}%</Chip>
        <Chip tone="bull">восстановлено ✓</Chip>
        {hov !== null && <span className="ml-auto font-mono text-[11px] text-ink-300">день {hov + 1} · {DD[hov].toFixed(1)}%</span>}
      </div>
      <div ref={inRef as never} className="well overflow-hidden p-1">
        <canvas ref={ref} className="block w-full cursor-crosshair" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-850 py-1.5"><div className="font-mono text-[13px] font-bold text-sky">9 дней</div><div className="text-[9px] text-ink-500">под водой</div></div>
        <div className="rounded-xl bg-ink-850 py-1.5"><div className="font-mono text-[13px] font-bold text-bull">100%</div><div className="text-[9px] text-ink-500">восстановление</div></div>
        <div className="rounded-xl bg-ink-850 py-1.5"><div className="font-mono text-[13px] font-bold text-gold">−2%</div><div className="text-[9px] text-ink-500">лимит риска</div></div>
      </div>
    </div>
  );
}

/* ── I07 · Отчёт недели: карточка с оценкой ── */
const GRADES = [
  { g: "S", c: "#FFC940", d: "Легендарная неделя!" },
  { g: "A", c: "#2BE38B", d: "Отличная дисциплина" },
  { g: "B", c: "#3D9BFF", d: "Хорошо, есть куда расти" },
  { g: "C", c: "#FF8A3D", d: "Бывало и лучше" },
];

export function WeekReport() {
  const [week, setWeek] = useState(2);
  const gi = [2, 1, 0][week];
  const g = GRADES[gi];
  const stats = [
    ["+ $486", "PnL", "text-bull"], ["71%", "винрейт", "text-sky"], ["18", "сделок", "text-ink-100"], ["0", "без стопа", "text-bull"],
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-ink-700 to-ink-850 p-5 ring-1 ring-white/10">
      <div className="absolute -right-12 -top-12 size-48 rounded-full opacity-25 blur-3xl" style={{ background: g.c }} />
      <div className="relative flex items-center gap-2">
        <Btn s="xs" v="ink" icon="chevL" className="px-2" aria-label="Назад" disabled={week === 0} onClick={() => { tap("tick"); setWeek(week - 1); }} />
        <span className="flex-1 text-center font-display text-xs font-black">Неделя {40 + week} · октябрь</span>
        <Btn s="xs" v="ink" icon="chevR" className="px-2" aria-label="Вперёд" disabled={week === 2} onClick={() => { tap("tick"); setWeek(week + 1); }} />
      </div>
      <div key={week} className="relative mt-3 flex items-center gap-4 animate-slide-up">
        <div className="flex size-20 items-center justify-center rounded-3xl font-display text-4xl font-black text-ink-900 animate-pop" style={{ background: g.c, boxShadow: "0 5px 0 rgba(0,0,0,.4)" }}>
          {g.g}
        </div>
        <div>
          <div className="font-display text-base font-black" style={{ color: g.c }}>{g.d}</div>
          <div className="text-[12px] text-ink-300">Оценка по PnL, дисциплине и журналу</div>
        </div>
        <Mascot size={56} mood={gi <= 1 ? "hype" : "happy"} className="ml-auto hidden sm:block" />
      </div>
      <div key={"s" + week} className="relative mt-4 grid grid-cols-4 gap-2">
        {stats.map(([v, t, c], i) => (
          <div key={t} className="rounded-2xl bg-ink-900/60 p-2 text-center animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className={cn("font-mono text-[15px] font-bold", c as string)}>{v}</div>
            <div className="text-[9px] text-ink-500">{t}</div>
          </div>
        ))}
      </div>
      <div className="relative mt-3 rounded-2xl bg-ink-900/60 p-3 text-[12px] leading-relaxed">
        <b>Лучшее:</b> лонг BTC +$210 по пробою 68K. <b>Худшее:</b> ночной скальп −$61 без стопа.
        <span className="mt-1 block text-ink-400">Цель на следующую неделю: <button className="font-bold text-sky" onClick={() => { sfx("success"); notify("Цель установлена: 0 сделок без стопа", "success"); }}>0 сделок без стопа →</button></span>
      </div>
      <div className="relative mt-3 flex gap-2">
        <Btn s="xs" v="sky" icon="share" className="flex-1" onClick={() => { sfx("coin"); notify("Карточка недели скопирована", "info"); }}>Поделиться</Btn>
        <Btn s="xs" v="ghost" icon="chevR" onClick={() => tap()}>Все недели</Btn>
      </div>
      <div className="sr-only"><Icon name="check" size={1} /></div>
    </div>
  );
}
