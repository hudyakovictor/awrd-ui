import { useEffect, useRef } from "react";
import { CoinArt, GemArt, FlameArt, BoltArt } from "./art";
import { useMouse, useReducedMotion } from "../lib/motion";

/* ═══════════════════════════════════════════════════════════════════
   HERO FX — живой фон главной:
   canvas со свечным графиком + дрейфующие частицы,
   параллакс-монеты за курсором, пятно света, cue скролла.
   ═══════════════════════════════════════════════════════════════════ */

function useCandles(canvas: React.RefObject<HTMLCanvasElement | null>) {
  const rm = useReducedMotion();
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || rm) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    /* свечи */
    const N = 46;
    let data = Array.from({ length: N }, (_, i) => 0.5 + Math.sin(i * 0.4) * 0.12 + (Math.random() - 0.5) * 0.08);
    let t = 0;
    /* частицы */
    const P = Array.from({ length: 26 }, () => ({
      x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2.2,
      vx: 0.0002 + Math.random() * 0.0006, vy: -(0.0001 + Math.random() * 0.0004),
      c: ["#2BE38B", "#3D9BFF", "#FFC940", "#9A6BFF"][Math.floor(Math.random() * 4)],
      a: 0.15 + Math.random() * 0.35,
    }));
    const step = () => {
      t += 1 / 60;
      if (Math.floor(t * 2) !== Math.floor((t - 1 / 60) * 2)) {
        data = [...data.slice(1), Math.max(0.15, Math.min(0.85, data[data.length - 1] + (Math.random() - 0.47) * 0.09))];
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      /* сетка */
      ctx.strokeStyle = "rgba(125,147,198,.09)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      /* свечи */
      const cw = w / N;
      const baseY = h * 0.62;
      const amp = h * 0.4;
      data.forEach((v, i) => {
        const prev = data[Math.max(0, i - 1)];
        const up = v >= prev;
        const y1 = baseY - v * amp;
        const y0 = baseY - prev * amp;
        const x = i * cw + cw / 2;
        const col = up ? "43,227,139" : "255,77,109";
        ctx.strokeStyle = `rgba(${col},.55)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, Math.min(y0, y1) - 6); ctx.lineTo(x, Math.max(y0, y1) + 6); ctx.stroke();
        ctx.fillStyle = `rgba(${col},.5)`;
        const bh = Math.max(3, Math.abs(y1 - y0));
        const bx = x - cw * 0.28;
        const by = Math.min(y0, y1);
        ctx.beginPath();
        ctx.roundRect(bx, by, cw * 0.56, bh, 2);
        ctx.fill();
      });
      /* линия */
      ctx.strokeStyle = "rgba(61,155,255,.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * cw + cw / 2;
        const y = baseY - v * amp;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      /* пульс последней точки */
      const lx = (N - 1) * cw + cw / 2;
      const ly = baseY - data[N - 1] * amp;
      const pr = 4 + Math.sin(t * 4) * 2;
      ctx.fillStyle = "#8CFFD0";
      ctx.beginPath(); ctx.arc(lx, ly, pr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(140,255,208,.25)";
      ctx.beginPath(); ctx.arc(lx, ly, pr * 2.6, 0, Math.PI * 2); ctx.fill();
      /* частицы */
      for (const p of P) {
        p.x += p.vx; p.y += p.vy;
        if (p.x > 1.02) { p.x = -0.02; p.y = Math.random(); }
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.globalAlpha = p.a * (0.7 + 0.3 * Math.sin(t * 2 + p.x * 20));
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [canvas, rm]);
}

export function HeroFX({ children }: { children?: React.ReactNode }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const { ref, x, y, onMove, onLeave } = useMouse<HTMLDivElement>();
  useCandles(cv);

  useEffect(() => {
    if (spot.current) {
      spot.current.style.background = `radial-gradient(420px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(61,155,255,.14), transparent 65%)`;
    }
  }, [x, y]);

  const coin = (dx: number, dy: number, el: React.ReactNode, cls: string, delay: string) => (
    <div className={`pointer-events-none absolute ${cls}`} style={{ transform: `translate(${x * dx}px, ${y * dy}px)`, transition: "transform .4s cubic-bezier(.22,1,.36,1)" }}>
      <div className="animate-float" style={{ animationDelay: delay }}>{el}</div>
    </div>
  );

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative overflow-hidden">
      <canvas ref={cv} className="pointer-events-none absolute inset-0 h-full w-full opacity-80" aria-hidden />
      <div ref={spot} className="pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900/40 via-transparent to-ink-900" aria-hidden />
      {coin(46, 30, <CoinArt size={54} />, "left-[6%] top-[18%] hidden lg:block", "0s")}
      {coin(-34, 44, <GemArt size={48} />, "right-[8%] top-[14%] hidden lg:block", ".7s")}
      {coin(60, -26, <FlameArt size={50} />, "left-[10%] bottom-[16%] hidden lg:block", "1.3s")}
      {coin(-52, -34, <BoltArt size={44} />, "right-[12%] bottom-[22%] hidden lg:block", ".4s")}
      {coin(24, 18, <CoinArt size={30} />, "left-[42%] top-[10%] hidden md:block", "1.8s")}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ——— Подсказка «листай вниз» ——— */
export function ScrollCue({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-label="Листайте вниз"
      className="group flex flex-col items-center gap-2 rounded-2xl px-6 py-3 text-ink-400 transition-colors hover:text-white">
      <span className="text-[10px] font-black uppercase tracking-[.25em]">Листайте</span>
      <span className="flex h-12 w-7 items-start justify-center rounded-full border-2 border-current p-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-current" />
      </span>
    </button>
  );
}
