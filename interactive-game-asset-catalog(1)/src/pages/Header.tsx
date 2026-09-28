import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav, type Route } from "../App";
import { I } from "../components/kit";
import { CATEGORIES } from "../data/catalog";
import { EASE, SPRING } from "../motion/tokens";
import { sfx, sound, useMuted } from "../motion/sfx";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <motion.svg width="30" height="30" viewBox="0 0 32 32" whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
        <path d="M16 2 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z" fill="#0f1730" stroke="#ffc34d" strokeWidth="2" />
        <path d="M8 21 L13 15 L16 18 L24 9" fill="none" stroke="#3ddc84" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 11 L13 16" stroke="#ff4d5e" strokeWidth="2.4" strokeLinecap="round" />
      </motion.svg>
      <div className="leading-none">
        <div className="font-display text-[13px] font-black tracking-wide">SIGNAL ARENA</div>
        <div className="text-[9px] font-bold uppercase tracking-[.3em] text-teal">Motion Codex</div>
      </div>
    </div>
  );
}

/** Эквалайзер-индикатор звука: 4 полосы прыгают, когда звук включён */
function SoundBars({ on }: { on: boolean }) {
  return (
    <div className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-sm bg-current"
          animate={on ? { height: [4, 14, 6, 11, 4] } : { height: 3 }}
          transition={on ? { duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export function Header({ route, onPalette }: { route: Route; onPalette: () => void }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const muted = useMuted();
  const closeT = useRef<number | null>(null);
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 200 && !menu);
    setSolid(v > 30);
  });
  useEffect(() => {
    setMenu(false);
    setMobile(false);
  }, [route]);
  const active = route.name === "cat" ? route.id : route.name;
  const activeCat = CATEGORIES.find((c) => c.id === active);
  const openMenu = () => {
    if (closeT.current) clearTimeout(closeT.current);
    setMenu(true);
  };
  const closeMenu = () => {
    closeT.current = window.setTimeout(() => setMenu(false), 160);
  };

  return (
    <motion.header
      animate={{ y: hidden ? -90 : 0 }}
      transition={SPRING.panel}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid || menu ? "border-b border-white/5 bg-ink/80 backdrop-blur-xl" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5">
        <button onClick={() => nav("/")}><Logo /></button>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
            <button onClick={() => setMenu((m) => !m)} className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${activeCat ? "text-white" : "text-white/60 hover:text-white"}`}>
              {activeCat && <motion.span layoutId="navpill" transition={SPRING.layout} className="absolute inset-0 rounded-full" style={{ background: `${activeCat.color}22`, boxShadow: `inset 0 0 0 1px ${activeCat.color}66` }} />}
              <span className="relative flex items-center gap-1.5">
                {activeCat && <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeCat.color, boxShadow: `0 0 8px ${activeCat.color}` }} />}
                {activeCat ? activeCat.title : "Категории"}
                <motion.span animate={{ rotate: menu ? 90 : 0 }} transition={SPRING.tap}><I.arrowR size={12} /></motion.span>
              </span>
            </button>
          </div>
          {[
            { id: "play", t: "Играть", c: "#ff4d5e" },
            { id: "codex", t: "Кодекс", c: "#ffc34d" },
          ].map((x) => (
            <button key={x.id} onClick={() => nav(`/${x.id}`)} className={`relative rounded-full px-3.5 py-1.5 text-xs font-bold ${active === x.id ? "text-white" : "text-white/60 hover:text-white"}`}>
              {active === x.id && <motion.span layoutId="navpill" transition={SPRING.layout} className="absolute inset-0 rounded-full" style={{ background: `${x.c}22`, boxShadow: `inset 0 0 0 1px ${x.c}66` }} />}
              <span className="relative flex items-center gap-1.5">
                {x.id === "play" && <span className="h-1.5 w-1.5 rounded-full bg-bear blink" />}
                {x.t}
              </span>
            </button>
          ))}
        </nav>
        <button onClick={onPalette} className="ml-auto hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/50 hover:border-white/25 hover:text-white md:ml-2 md:flex">
          <I.target size={13} /> Поиск <kbd className="rounded bg-white/10 px-1.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => sound.toggle()} title="Звук и вибрация" className={`grid h-8 w-10 place-items-center rounded-full border ${muted ? "border-white/10 text-white/40" : "border-teal/60 bg-teal/10 text-teal"} ml-auto md:ml-0`}>
          <SoundBars on={!muted} />
        </motion.button>
        <button onClick={() => setMobile((m) => !m)} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 md:hidden">
          <div className="relative h-3 w-4">
            <motion.span className="absolute left-0 h-0.5 w-4 rounded bg-white" animate={mobile ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }} />
            <motion.span className="absolute left-0 top-[5px] h-0.5 w-4 rounded bg-white" animate={{ opacity: mobile ? 0 : 1, scaleX: mobile ? 0 : 1 }} />
            <motion.span className="absolute left-0 h-0.5 w-4 rounded bg-white" animate={mobile ? { top: 5, rotate: -45 } : { top: 10, rotate: 0 }} />
          </div>
        </button>
      </div>

      {/* MEGA MENU */}
      <AnimatePresence>
        {menu && (
          <motion.div
            key="mega"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
            initial={{ opacity: 0, y: -12, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, y: -8, clipPath: "inset(0 0 100% 0)", transition: { duration: 0.18, ease: EASE.inQuart } }}
            transition={{ duration: 0.45, ease: EASE.outExpo }}
            className="absolute inset-x-0 top-16 hidden border-b border-white/5 bg-ink/95 backdrop-blur-xl md:block"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-5 py-5">
              {CATEGORIES.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.03, ...SPRING.panel }}
                  onMouseEnter={() => sfx.tick()}
                  onClick={() => nav(`/c/${c.id}`)}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 text-left hover:bg-white/[.04]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-sm font-black transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: `${c.color}1c`, color: c.color, boxShadow: `inset 0 0 0 1px ${c.color}44` }}>
                    {c.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-bold">{c.title}</span>
                    <span className="block truncate text-[11px] text-white/45">{c.en}</span>
                  </span>
                  <span className="ml-auto text-[10px] font-bold text-white/30">{c.scenes.length}</span>
                  <span className="absolute inset-y-2 left-0 w-0.5 origin-center scale-y-0 rounded-full transition-transform duration-300 group-hover:scale-y-100" style={{ background: c.color }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE SHEET */}
      <AnimatePresence>
        {mobile && (
          <motion.div key="mob" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={SPRING.panel} className="absolute inset-x-0 top-16 max-h-[80vh] overflow-y-auto border-b border-white/5 bg-ink/95 p-4 backdrop-blur-xl md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {[{ id: "/play", t: "Играть", c: "#ff4d5e" }, { id: "/codex", t: "Кодекс", c: "#ffc34d" }].map((x) => (
                <button key={x.id} onClick={() => nav(x.id)} className="rounded-xl py-3 text-sm font-bold" style={{ background: `${x.c}1c`, color: x.c }}>{x.t}</button>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {CATEGORIES.map((c, i) => (
                <motion.button key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} onClick={() => nav(`/c/${c.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-white/5">
                  <span className="font-mono text-xs" style={{ color: c.color }}>{c.n}</span>
                  <span className="text-sm font-bold">{c.title}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
