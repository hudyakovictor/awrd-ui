import { useEffect, useRef } from "react";
import { Candle } from "./chart";

interface Props {
  data: Candle[];
  zone?: { from: number; to: number; id: number } | null; // candle index range to highlight
  resolveFlash?: { id: number; ok: boolean } | null;      // flash on resolution
  height?: number;
  className?: string;
}

interface Smooth { x: number; o: number; c: number; h: number; l: number }

/**
 * Buttery candle renderer: every value (price + x slot) lerps toward its target
 * each frame, so appending candles looks like a smooth conveyor chart.
 */
export default function ChartCanvas({ data, zone, resolveFlash, height = 216, className = "" }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const smRef = useRef<Map<number, Smooth>>(new Map());
  const flashT = useRef(0);
  const props = useRef({ data, zone, resolveFlash });
  props.current = { data, zone, resolveFlash };
  const zoneIdRef = useRef(0);
  const zoneT = useRef(0);

  useEffect(() => {
    if (zone && zone.id !== zoneIdRef.current) { zoneIdRef.current = zone.id; zoneT.current = 0; }
  }, [zone]);
  useEffect(() => {
    if (resolveFlash) flashT.current = 1;
  }, [resolveFlash]);

  useEffect(() => {
    const box = boxRef.current!, cv = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    let W = 0, H = 0, raf = 0, dpr = 1;

    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = box.clientWidth; H = box.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    const SLOTS = 22;
    const sm = smRef.current;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const { data: cs, zone: zn, resolveFlash: rf } = props.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const len = cs.length;
      if (!len) return;
      const start = Math.max(0, len - SLOTS);
      const slotW = W / SLOTS;
      const padT = 26, padB = 30;

      let lo = Infinity, hi = -Infinity;
      for (let i = start; i < len; i++) { lo = Math.min(lo, cs[i].l); hi = Math.max(hi, cs[i].h); }
      if (lo === hi) { lo -= 2; hi += 2; }
      const span = hi - lo; lo -= span * 0.14; hi += span * 0.14;
      const Y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

      /* ── grid ── */
      ctx.strokeStyle = "rgba(63,112,195,.16)";
      ctx.lineWidth = 1;
      const rows = 4;
      for (let r = 1; r <= rows; r++) {
        const y = padT + (r / (rows + 1)) * (H - padT - padB);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        const price = hi - (r / (rows + 1)) * (hi - lo);
        ctx.fillStyle = "rgba(127,166,217,.55)";
        ctx.font = "700 8.5px Oswald, sans-serif";
        ctx.fillText((price * 210).toFixed(2), 6, y - 3);
      }

      /* ── lerp smoothing map ── */
      sm.forEach((_v, k) => { if (k < start || k >= len) sm.delete(k); });
      const K = 0.22;
      for (let i = start; i < len; i++) {
        const tx = (i - start + 0.5) * slotW;
        const t = cs[i];
        let s = sm.get(i);
        if (!s) {
          const prev = sm.get(i - 1);
          s = { x: prev ? prev.x + slotW : tx, o: t.o, c: t.o, h: t.h, l: t.l };
          if (i === len - 1) { s.o = t.o; s.c = t.o; s.h = Y(t.o); s.l = Y(t.o); }
          sm.set(i, s);
        }
        s.x += (tx - s.x) * K;
        s.o += (t.o - s.o) * K;
        s.c += (t.c - s.c) * K;
        s.h += (t.h - s.h) * K;
        s.l += (t.l - s.l) * K;
      }

      /* ── signal zone ── */
      if (zn) {
        zoneT.current = Math.min(1, zoneT.current + 0.045);
        const zt = zoneT.current;
        const breath = 0.4 + 0.22 * (0.5 + 0.5 * Math.sin(performance.now() / 210));
        const from = sm.get(zn.from), to = sm.get(zn.to);
        if (from && to) {
          const x0 = from.x - slotW * 0.52, x1 = to.x + slotW * 0.52;
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, `rgba(255,209,74,${0.10 * zt})`);
          g.addColorStop(1, `rgba(255,209,74,${0.02 * zt})`);
          ctx.fillStyle = g;
          roundRect(ctx, x0, padT - 12, x1 - x0, H - padT - padB + 18, 12);
          ctx.fill();
          ctx.strokeStyle = `rgba(255,209,74,${breath * zt})`;
          ctx.setLineDash([7, 7]);
          ctx.lineWidth = 1.6;
          roundRect(ctx, x0, padT - 12, x1 - x0, H - padT - padB + 18, 12);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* resolution flash across whole panel */
      if (flashT.current > 0) {
        flashT.current = Math.max(0, flashT.current - 0.028);
        const okCol = rf?.ok ? "31,240,200" : "255,92,110";
        ctx.fillStyle = `rgba(${okCol},${flashT.current * 0.16})`;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── MA ribbon through closes ── */
      ctx.beginPath();
      let first = true;
      for (let i = start; i < len; i++) {
        const s = sm.get(i)!;
        const y = Y(s.c);
        if (first) { ctx.moveTo(s.x, y); first = false; } else ctx.lineTo(s.x, y);
      }
      ctx.strokeStyle = "rgba(182,255,240,.75)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(31,240,200,.8)";
      ctx.shadowBlur = 7;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* ── candles ── */
      for (let i = start; i < len; i++) {
        const s = sm.get(i)!;
        const up = s.c >= s.o;
        const grad = ctx.createLinearGradient(0, Y(s.h), 0, Y(s.l));
        if (up) { grad.addColorStop(0, "#45f7c3"); grad.addColorStop(1, "#0bb894"); }
        else { grad.addColorStop(0, "#ff7e8c"); grad.addColorStop(1, "#e5304c"); }
        const isLast = i === len - 1;
        ctx.strokeStyle = up ? "rgba(120,255,222,.95)" : "rgba(255,160,170,.95)";
        ctx.lineWidth = isLast ? 2 : 1.4;
        ctx.shadowColor = up ? "rgba(31,240,200,.9)" : "rgba(255,92,110,.9)";
        ctx.shadowBlur = isLast ? 13 : 5;
        ctx.beginPath(); ctx.moveTo(s.x, Y(s.h)); ctx.lineTo(s.x, Y(s.l)); ctx.stroke();

        const bw = slotW * 0.6;
        const yO = Y(s.o), yC = Y(s.c);
        const top = Math.min(yO, yC), hgt = Math.max(2.5, Math.abs(yC - yO));
        ctx.fillStyle = grad;
        roundRect(ctx, s.x - bw / 2, top, bw, hgt, 2.5);
        ctx.fill();
        ctx.shadowBlur = 0;
        /* gloss stripe */
        ctx.fillStyle = "rgba(255,255,255,.28)";
        ctx.fillRect(s.x - bw / 2 + 1, top + 1, 2.4, Math.max(1, hgt - 2));
      }

      /* ── last price tag ── */
      const last = sm.get(len - 1);
      if (last) {
        const py = Y(last.c);
        const up = last.c >= last.o;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = up ? "rgba(31,240,200,.5)" : "rgba(255,92,110,.5)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = up ? "#12c49b" : "#e5304c";
        roundRect(ctx, W - 46, py - 9, 40, 18, 6);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "700 9.5px Oswald, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((last.c * 210).toFixed(2), W - 26, py + 3.5);
        ctx.textAlign = "left";
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <div ref={boxRef} className={className} style={{ height }}><canvas ref={cvRef} className="block" /></div>;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}
