import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFx } from "./fx";

/* Deterministic pseudo-random so SSR/first paint matches */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TICKER = [
  "BTC +4.2%", "ETH +2.8%", "SOL −1.3%", "REVEAL +18", "STREAK ×7",
  "XP +240", "TON +6.1%", "DOGE −0.4%", "COMBO ×12", "ARB +3.3%",
  "INVALIDATION SET", "NO REVENGE TRADE", "PROCESS > OUTCOME",
];

function Stars({ reduced }: { reduced: boolean }) {
  const stars = useMemo(() => {
    const rnd = mulberry(42);
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      s: rnd() * 1.8 + 0.6,
      d: rnd() * 4,
      o: 0.25 + rnd() * 0.6,
      c: rnd() > 0.85 ? "#fb923c" : rnd() > 0.7 ? "#93c5fd" : "#ffffff",
    }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            background: s.c,
            opacity: s.o,
            boxShadow: `0 0 ${s.s * 3}px ${s.c}`,
            animation: reduced ? undefined : `blink ${2 + s.d}s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function RisingEmbers({ reduced }: { reduced: boolean }) {
  const embers = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      d: rnd() * 7,
      s: 3 + rnd() * 5,
      c: rnd() > 0.5 ? "#f97316" : "#fbbf24",
    }));
  }, []);
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-[-20px] rounded-full"
          style={{
            left: `${e.x}%`,
            width: e.s,
            height: e.s,
            background: e.c,
            boxShadow: `0 0 ${e.s * 2.5}px ${e.c}`,
            animation: `rise ${6 + e.d}s linear ${e.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(-600);
  const y = useRef(-600);
  const tx = useRef(-600);
  const ty = useRef(-600);
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx.current = e.clientX;
      ty.current = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const loop = () => {
      x.current += (tx.current - x.current) * 0.08;
      y.current += (ty.current - y.current) * 0.08;
      if (ref.current) ref.current.style.transform = `translate3d(${x.current - 260}px, ${y.current - 260}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden md:block" aria-hidden>
      <div
        ref={ref}
        className="absolute h-[520px] w-[520px] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,.09), rgba(59,130,246,.05) 45%, transparent 70%)" }}
      />
    </div>
  );
}

/** Full-page cinematic stage: aurora blobs, grid, stars, embers, vignette, ticker, scroll beam */
export function Stage() {
  const { reduced, intensity } = useFx();
  const { scrollYProgress } = useScroll();
  const beam = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <>
      {/* fixed backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 520px at 12% -6%, rgba(249,115,22,.12), transparent 60%), radial-gradient(900px 480px at 88% 4%, rgba(59,130,246,.12), transparent 60%), radial-gradient(1200px 800px at 50% 110%, rgba(139,92,246,.08), transparent 60%), linear-gradient(180deg, #080d1c 0%, #0a0f1e 45%, #05070f 100%)",
          }}
        />
        {!reduced && (
          <motion.div style={{ y: blobY }} className="absolute inset-0">
            <div className="animate-aurora absolute -top-32 left-[8%] h-[420px] w-[560px] rounded-full opacity-20 blur-3xl" style={{ background: "conic-gradient(from 90deg, #f97316, #8b5cf6, #3b82f6, #f97316)" }} />
            <div className="animate-aurora absolute right-[4%] top-[30%] h-[380px] w-[420px] rounded-full opacity-[.13] blur-3xl" style={{ background: "conic-gradient(from 200deg, #3b82f6, #22c55e, #3b82f6)", animationDelay: "-6s" }} />
          </motion.div>
        )}
        <div className="bg-grid absolute inset-0 opacity-80" />
        <Stars reduced={reduced} />
        <RisingEmbers reduced={reduced || intensity === "low"} />
        <div className="bg-noise absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <CursorAura />

      {/* scroll progress beam */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left"
        style={{
          scaleX: beam,
          background: "linear-gradient(90deg, #f97316, #fbbf24, #22c55e, #3b82f6)",
          boxShadow: "0 0 12px rgba(249,115,22,.7)",
          opacity: mounted ? 1 : 0,
        }}
        aria-hidden
      />

      {/* bottom ticker */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] hidden overflow-hidden border-t border-white/10 bg-[#05080f]/85 py-1.5 backdrop-blur-md lg:block" aria-hidden>
        <div className="animate-marquee-slow flex w-max items-center gap-8 whitespace-nowrap pr-8">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-[13px] font-black tracking-wide text-white/55">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: t.includes("+") ? "#22c55e" : t.includes("−") ? "#ef4444" : "#fbbf24",
                  boxShadow: "0 0 6px currentColor",
                  animation: reduced ? undefined : "ticker-glow 2s ease-in-out infinite",
                }}
              />
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
