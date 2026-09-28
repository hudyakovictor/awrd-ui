import { useEffect, useRef, useState } from "react";

/* Spring physics primitives — no deps, rAF based. */

/** Spring toward target. stiffness ~ 60-300, damping ~ 8-30. */
export function useSpring(target: number, stiffness = 170, damping = 22) {
  const [v, setV] = useState(target);
  const cur = useRef({ x: target, v: 0 });
  const t = useRef(target);
  t.current = target;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cur.current;
      const F = (t.current - c.x) * stiffness - c.v * damping;
      c.v += F * dt;
      c.x += c.v * dt;
      setV(c.x);
      if (Math.abs(t.current - c.x) > 0.001 || Math.abs(c.v) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        c.x = t.current; c.v = 0;
        setV(t.current);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping]);
  return v;
}

/** Trail of N values following the target with increasing lag. */
export function useTrail(target: number, n = 4, stiffness = 140, damping = 20) {
  const [vals, setVals] = useState<number[]>(() => Array(n).fill(target));
  const cur = useRef({ x: Array(n).fill(target), v: Array(n).fill(0) });
  const t = useRef(target);
  t.current = target;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cur.current;
      for (let i = 0; i < n; i++) {
        const lead = i === 0 ? t.current : c.x[i - 1];
        const k = stiffness / (1 + i * 0.55);
        const F = (lead - c.x[i]) * k - c.v[i] * damping;
        c.v[i] += F * dt;
        c.x[i] += c.v[i] * dt;
      }
      setVals([...c.x]);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [n, stiffness, damping]);
  return vals;
}

export function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "", className, style }: { value: number; decimals?: number; prefix?: string; suffix?: string; className?: string; style?: React.CSSProperties }) {
  const v = useSpring(value, 150, 20);
  return (
    <span className={className} style={style}>
      {prefix}{v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

/** Rolling digit: old value slides up, new slides in. */
export function RollingNumber({ value, className }: { value: number | string; className?: string }) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(0);
  useEffect(() => {
    if (value === prev) return;
    const d = Number(value) >= Number(prev) ? 1 : -1;
    setDir(d);
    const t = setTimeout(() => setPrev(value), 60);
    return () => clearTimeout(t);
  }, [value, prev]);
  return (
    <span className={`relative inline-block overflow-hidden align-baseline ${className ?? ""}`}>
      <span key={String(prev) + dir} className="num inline-block" style={{ animation: dir >= 0 ? "roll-up .3s cubic-bezier(.3,1.3,.5,1)" : "roll-down .3s cubic-bezier(.3,1.3,.5,1)" }}>
        {value}
      </span>
      <style>{`@keyframes roll-up{from{transform:translateY(60%);opacity:0}to{transform:none;opacity:1}}@keyframes roll-down{from{transform:translateY(-60%);opacity:0}to{transform:none;opacity:1}}`}</style>
    </span>
  );
}

/** Spring-animated bar (width follows value with overshoot). */
export function SpringBar({ value, color = "#22d39a", h = 12, glow = true }: { value: number; color?: string; h?: number; glow?: boolean }) {
  const v = useSpring(value, 120, 16);
  return (
    <div className="panel-inset relative w-full overflow-hidden rounded-full" style={{ height: h }}>
      <div
        className="relative h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(120, v))}%`,
          background: `linear-gradient(180deg, ${color}, ${color}bb)`,
          boxShadow: glow ? `0 0 14px ${color}88` : undefined,
        }}
      >
        <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/40" />
      </div>
    </div>
  );
}
