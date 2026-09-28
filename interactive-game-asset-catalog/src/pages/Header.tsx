import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { getSound, setSound } from "../motion/audio";
import { nav, type Route } from "../App";
import { CATEGORIES } from "../data/catalog";
import { SPRING } from "../motion/tokens";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32">
        <path d="M16 2 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z" fill="#0f1730" stroke="#ffc34d" strokeWidth="2" />
        <path d="M8 21 L13 15 L16 18 L24 9" fill="none" stroke="#3ddc84" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 11 L13 16" stroke="#ff4d5e" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-[13px] font-black tracking-wide">SIGNAL ARENA</div>
        <div className="text-[9px] font-bold uppercase tracking-[.3em] text-teal">Motion Codex</div>
      </div>
    </div>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(getSound());
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => { const n = !on; setOn(n); setSound(n); }}
      className="flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-bold uppercase tracking-widest"
      style={{ borderColor: on ? "#2ee6c566" : "#ffffff22", color: on ? "#2ee6c5" : "#ffffff55", background: on ? "#2ee6c514" : "transparent" }}
      title="Синтезированный звук интерфейса (WebAudio, 0 КБ ассетов)"
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-current"
            animate={on ? { height: ["30%", "100%", "45%", "85%", "30%"] } : { height: "30%" }}
            transition={on ? { duration: 1 + i * 0.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          />
        ))}
      </span>
      {on ? "звук вкл" : "звук выкл"}
    </motion.button>
  );
}

export function Header({ route }: { route: Route }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 200);
    setSolid(v > 30);
  });
  const active = route.name === "cat" ? route.id : route.name;
  return (
    <motion.header
      animate={{ y: hidden ? -90 : 0 }}
      transition={SPRING.panel}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-white/5 bg-ink/75 backdrop-blur-xl" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <button onClick={() => nav("/")}><Logo /></button>
        <nav className="no-scrollbar ml-auto flex items-center gap-1 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => nav(`/c/${c.id}`)} className="relative hidden rounded-full px-3 py-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white lg:block">
              {active === c.id && <motion.span layoutId="navpill" transition={SPRING.layout} className="absolute inset-0 rounded-full" style={{ background: `${c.color}22`, boxShadow: `inset 0 0 0 1px ${c.color}66` }} />}
              <span className="relative flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                {c.title}
              </span>
            </button>
          ))}
          <SoundToggle />
          <button onClick={() => nav("/codex")} className={`relative ml-2 shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold ${active === "codex" ? "border-gold bg-gold text-black" : "border-gold/50 text-gold hover:bg-gold/10"}`}>
            Кодекс секретов
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
