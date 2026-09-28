import { useEffect, useRef } from "react";
import { useScrollVelocity } from "./motion";

/* Ambient floating particles + pointer glow.
   Renders behind content, reacts to pointer and scroll velocity. */

type P = { x: number; y: number; r: number; vy: number; vx: number; hue: number; a: number; tw: number; ph: number };

const HUES = [152, 46, 218, 265, 195, 345]; // bull, gold, sky, violet, cyan, bear

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ x: -9999, y: -9999 });
  const velRef = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0;
    let parts: P[] = [];
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * DPR;
      cv.height = h * DPR;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.min(90, Math.floor((w * h) / 22000));
      parts = [...Array(n)].map(() => spawn(true));
    };
    const spawn = (anywhere = false): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20 + Math.random() * 40,
      r: 0.8 + Math.random() * 2.4,
      vy: 0.12 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      a: 0.15 + Math.random() * 0.5,
      tw: 0.6 + Math.random() * 2.2,
      ph: Math.random() * Math.PI * 2,
    });

    const onMove = (e: PointerEvent) => { ptr.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { ptr.current = { x: -9999, y: -9999 }; };
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      velRef.current += (Math.abs(y - lastY) - velRef.current) * 0.12;
      lastY = y;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const loop = () => {
      t += 0.016;
      velRef.current *= 0.94;
      ctx.clearRect(0, 0, w, h);

      // faint connecting lines near pointer
      const px = ptr.current.x, py = ptr.current.y;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const boost = 1 + Math.min(3, velRef.current * 0.25);
        p.y -= p.vy * boost;
        p.x += p.vx + Math.sin(t * 0.7 + p.ph) * 0.12;

        // repel from pointer
        const dx = p.x - px, dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          const d = Math.max(18, Math.sqrt(d2));
          const f = ((120 - d) / 120) * 1.6;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        if (p.y < -30 || p.x < -30 || p.x > w + 30) {
          parts[i] = spawn();
          continue;
        }

        const tw = 0.55 + 0.45 * Math.sin(t * p.tw + p.ph);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${(p.a * tw).toFixed(3)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, .8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // occasional shooting streak when scrolling fast
      if (velRef.current > 14 && Math.random() < 0.3) {
        const sx = Math.random() * w;
        const grad = ctx.createLinearGradient(sx, 0, sx - 60, 120);
        grad.addColorStop(0, "rgba(140,190,255,.5)");
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, -10);
        ctx.lineTo(sx - 60, 110);
        ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[1]" aria-hidden />;
}

export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const vel = useScrollVelocity();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = window.innerWidth / 2, y = 300, tx = x, ty = y, raf = 0;
    const on = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("pointermove", on, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.transform = `translate(${x - 260}px, ${y - 260}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[520px] w-[520px] rounded-full transition-opacity duration-500"
      style={{
        background: "radial-gradient(circle, rgba(80,130,255,.10), rgba(139,92,255,.05) 45%, transparent 70%)",
        opacity: Math.abs(vel) > 40 ? 0.4 : 1,
      }}
      aria-hidden
    />
  );
}

/* Floating rune candles that drift up from the bottom of a container.
   Pure CSS/DOM, cheap, used as section dividers. */
export function RisingCandles({ count = 8, height = 120 }: { count?: number; height?: number }) {
  const items = [...Array(count)];
  return (
    <div className="pointer-events-none relative flex justify-around overflow-hidden" style={{ height }} aria-hidden>
      {items.map((_, i) => {
        const up = i % 3 !== 1;
        const col = up ? "#22d39a" : "#ff4f6d";
        const left = (i / count) * 100 + (i % 2) * 3;
        const dur = 5 + (i % 5) * 1.3;
        const delay = (i * 0.9) % 5;
        const s = 0.6 + ((i * 37) % 40) / 50;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] block"
            style={{ left: `${left}%`, animation: `rise-candle ${dur}s ${delay}s ease-in infinite`, opacity: 0 }}
          >
            <span className="relative block" style={{ width: 10 * s, height: 30 * s }}>
              <span className="absolute -top-2 -bottom-2 left-1/2 block w-[2px] -translate-x-1/2 rounded" style={{ background: col }} />
              <span className="relative block h-full w-full rounded-[3px]" style={{ background: col, boxShadow: `0 0 ${10 * s}px ${col}88` }} />
            </span>
          </span>
        );
      })}
      <style>{`@keyframes rise-candle{0%{transform:translateY(0) scale(.7);opacity:0}12%{opacity:.8}85%{opacity:.5}100%{transform:translateY(-${height + 60}px) scale(1.1);opacity:0}}`}</style>
    </div>
  );
}
