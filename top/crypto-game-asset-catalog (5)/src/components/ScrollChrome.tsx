import { useEffect, useRef, useState } from "react";
import { Glyph } from "./Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstSparks } from "../utils/fx";
import { clamp, readScrollVelocity, useRafLoop, useScrollBus } from "../hooks/motion";

/* Top page-progress bar whose glow intensifies with scroll velocity */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const p = useRef(0);
  useScrollBus(() => {
    const h = document.documentElement.scrollHeight - innerHeight;
    p.current = h > 0 ? clamp(window.scrollY / h) : 0;
  });
  useRafLoop(() => {
    const v = Math.min(1, Math.abs(readScrollVelocity()) * 0.6);
    if (bar.current) bar.current.style.transform = `scaleX(${p.current})`;
    if (glow.current) {
      glow.current.style.left = `calc(${p.current * 100}% - 40px)`;
      glow.current.style.opacity = String(0.35 + v * 0.65);
      glow.current.style.width = `${80 + v * 120}px`;
    }
  });
  return (
    <div className="fixed top-0 inset-x-0 h-[3px] z-[120] pointer-events-none" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-bull via-cyan to-violet" style={{ transform: "scaleX(0)" }} />
      <div ref={glow} className="absolute -top-[3px] h-[9px] rounded-full bg-cyan blur-md" />
    </div>
  );
}

/* Floating back-to-top with progress ring + rocket launch */
export function BackToTop() {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  const [launch, setLaunch] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useScrollBus(() => {
    const h = document.documentElement.scrollHeight - innerHeight;
    setP(h > 0 ? clamp(window.scrollY / h) : 0);
    setShow(window.scrollY > 700);
  });
  const R = 25;
  const C = 2 * Math.PI * R;
  return (
    <button ref={btn} aria-label="Наверх"
      onClick={() => {
        setLaunch(true);
        sfx.whoosh(); haptic([10, 30, 10]);
        const r = btn.current?.getBoundingClientRect();
        if (r) burstSparks(r.left + r.width / 2, r.top + r.height, 26, "#ffb020");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setLaunch(false), 1100);
      }}
      className={cn("fixed bottom-5 right-5 z-[110] size-[60px] rounded-full grid place-items-center bg-[#13224e] border border-white/10 shadow-[0_5px_0_#081028,0_16px_30px_rgba(0,0,0,.5)] transition-all duration-500 ease-[cubic-bezier(.3,1.5,.5,1)] hover:-translate-y-1 active:translate-y-1",
        show ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none")}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="none" stroke="#0a1330" strokeWidth="4" />
        <circle cx="30" cy="30" r={R} fill="none" stroke="url(#btt)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} />
        <defs><linearGradient id="btt" x1="0" x2="1"><stop offset="0" stopColor="#1fdb8b" /><stop offset="1" stopColor="#8d5cff" /></linearGradient></defs>
      </svg>
      <span className="relative transition-all duration-700 ease-in" style={{ transform: launch ? "translateY(-70px) scale(.8)" : "none", opacity: launch ? 0 : 1 }}>
        <Glyph name="rocket" size={28} />
      </span>
      {launch && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-8 rounded-full bg-gradient-to-b from-[#ffb020] to-transparent blur-[2px] anim-fade" />}
    </button>
  );
}

/* Soft spotlight trailing the cursor over the background (desktop only) */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const mv = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    addEventListener("pointermove", mv);
    const loop = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 350}px, ${y - 350}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} aria-hidden className="fixed top-0 left-0 size-[700px] rounded-full pointer-events-none z-0 hidden md:block" style={{ background: "radial-gradient(circle, rgba(61,123,255,.13), rgba(141,92,255,.05) 40%, transparent 65%)" }} />;
}
