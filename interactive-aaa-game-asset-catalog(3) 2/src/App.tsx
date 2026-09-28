import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import { CATEGORIES } from "./data/catalog";
import { Home } from "./site/Home";
import { CategoryPage } from "./site/Category";
import { Lab } from "./site/Lab";
import { FlowsPage } from "./site/Flows";
import { Palette, PaletteHint } from "./site/Palette";
import { S, E, feel, useFps, usePlaying, setPlaying, initAudioUnlock, initReducedMotion } from "./lib/motion";
import { IcSwords, IcCrown, IcCards, IcTarget, IcCap, IcBolt, IcGauge, IcShield, IcPlay, IcLayers, IcBook } from "./ui/icons";

const CAT_ICON: Record<string, any> = {
  core: IcSwords, progress: IcCrown, economy: IcCards, meta: IcTarget,
  mastery: IcBook, social: IcShield, livecat: IcBolt, learn: IcCap, system: IcLayers,
};

/* ---------- BOOT: загрузочный экран как в самой игре ---------- */
function PlayToggle() {
  const on = usePlaying();
  return (
    <button
      onClick={() => { feel("tap"); setPlaying(!on); }}
      title={on ? "Пауза всех сцен" : "Запустить сцены"}
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em]"
      style={{ borderColor: on ? "rgba(62,201,167,.45)" : "rgba(255,255,255,.14)", color: on ? "#3ec9a7" : "#8fa4c7", background: on ? "rgba(62,201,167,.1)" : "transparent" }}
    >
      {on ? <span className="block h-2.5 w-2.5 rounded-[2px] bg-current" /> : <IcPlay size={11} />}
      <span className="hidden sm:inline">{on ? "пауза" : "играть"}</span>
    </button>
  );
}

function FpsPill() {
  const fps = useFps();
  return (
    <div className="mono hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] sm:flex">
      <IcGauge size={12} />
      <span style={{ color: fps > 50 ? "#3ec9a7" : fps > 35 ? "#f2c14e" : "#e46a5f" }}>{fps} fps</span>
    </div>
  );
}

function Boot({ done }: { done: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + 8 + Math.random() * 14);
      setP(v);
      if (v >= 100) { clearInterval(id); setTimeout(done, 420); }
    }, 110);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div className="fixed inset-0 z-[120] grid place-items-center bg-[#090e1a]"
      exit={{ clipPath: "circle(0% at 50% 50%)", opacity: 0 }} transition={{ duration: 0.75, ease: E.io }}>
      <div className="aurora opacity-60" />
      <div className="relative flex flex-col items-center gap-6">
        <motion.svg width="84" height="84" viewBox="0 0 100 100" fill="none" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3ec9a7" /><stop offset="1" stopColor="#f2c14e" /></linearGradient></defs>
          <path d="M50 6 88 28v44L50 94 12 72V28L50 6Z" stroke="url(#bg1)" strokeWidth="5" strokeLinejoin="round" />
          <path d="M32 58l12-16 10 10 14-20" stroke="#3ec9a7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.svg>
        <div className="title-xl text-[30px] uppercase tracking-[0.2em] text-grad">СИГНАЛ</div>
        <div className="h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-gradient-to-r from-teal to-gold" animate={{ width: `${p}%` }} transition={S.soft} />
        </div>
        <div className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-mist">motion core · {Math.round(p)}%</div>
      </div>
    </motion.div>
  );
}

/* ---------- Шторка перехода между страницами каталога ---------- */
function Curtain({ on }: { on: boolean }) {
  return (
    <AnimatePresence>
      {on && (
        <motion.svg className="pointer-events-none fixed inset-0 z-[110] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path fill="#3ec9a7"
            initial={{ d: "M0,100 Q50,100 100,100 L100,101 L0,101 Z" }}
            animate={{ d: ["M0,100 Q50,58 100,100 L100,101 L0,101 Z", "M0,-1 Q50,-1 100,-1 L100,101 L0,101 Z"] }}
            exit={{ d: ["M0,-1 Q50,-38 100,-1 L100,-2 L0,-2 Z", "M0,-2 Q50,-2 100,-2 L100,-2 L0,-2 Z"] }}
            transition={{ duration: 0.55, ease: E.io }} />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

/* ---------- Кастомный курсор ---------- */
function Cursor() {
  const [pt, setPt] = useState({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);
  useEffect(() => {
    const m = (e: PointerEvent) => {
      setPt({ x: e.clientX, y: e.clientY });
      setHot(!!(e.target as HTMLElement).closest("button,a,[data-hot]"));
    };
    addEventListener("pointermove", m);
    return () => removeEventListener("pointermove", m);
  }, []);
  return (
    <motion.div className="pointer-events-none fixed z-[100] hidden h-7 w-7 rounded-full border-2 lg:block"
      animate={{ x: pt.x - 14, y: pt.y - 14, scale: hot ? 1.7 : 1, borderColor: hot ? "#f2c14e" : "#3ec9a7", opacity: hot ? 1 : 0.7 }}
      transition={{ type: "spring", stiffness: 520, damping: 28, mass: 0.4 }} />
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [path, setPath] = useState(() => location.hash.replace("#/", ""));
  const [routeRaw, assetRaw] = path.split("/");
  const route = routeRaw || "home";
  const [curtain, setCurtain] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 150, damping: 28 });

  const [pal, setPal] = useState(false);

  const navigate = (id: string, asset?: string) => {
    let target = id;
    if (id === "next") {
      const i = CATEGORIES.findIndex((c) => c.id === route);
      target = CATEGORIES[(i + 1) % CATEGORIES.length].id;
    }
    const next = target === "home" ? "" : asset ? `${target}/${asset}` : target;
    if (next === path) return;
    setCurtain(true);
    feel("sweep", 14);
    setTimeout(() => {
      setPath(next);
      location.hash = next ? `/${next}` : "";
      scrollTo({ top: 0 });
      setCurtain(false);
    }, 560);
  };

  /* Горячие клавиши: Cmd/Ctrl+K — палитра, 1–9 — категории, L/F/H — разделы */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const typing = /input|textarea/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); feel("sweep", 8); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= CATEGORIES.length) navigate(CATEGORIES[n - 1].id);
      if (e.key.toLowerCase() === "l") navigate("lab");
      if (e.key.toLowerCase() === "f") navigate("flows");
      if (e.key.toLowerCase() === "h") navigate("home");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [path]);

  useEffect(() => {
    initAudioUnlock();
    if (initReducedMotion()) console.info("[motion] reduced-motion profile applied");
  }, []);

  useEffect(() => {
    const h = () => setPath(location.hash.replace("#/", ""));
    addEventListener("hashchange", h);
    return () => removeEventListener("hashchange", h);
  }, []);

  const cat = CATEGORIES.find((c) => c.id === route);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatePresence>{!booted && <Boot done={() => setBooted(true)} />}</AnimatePresence>
      <Cursor />
      <Curtain on={curtain} />
      <Palette open={pal} setOpen={setPal} go={(r, a) => navigate(r, a)} />

      {/* хедер */}
      <header className="fixed inset-x-0 top-0 z-[80]">
        <motion.div style={{ scaleX: bar, originX: 0 }} className="h-[2px] bg-gradient-to-r from-teal via-gold to-purple" />
        <div className="flex items-center justify-between gap-4 bg-[#090e1a]/70 px-5 py-3 backdrop-blur-xl">
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
              <path d="M50 6 88 28v44L50 94 12 72V28L50 6Z" stroke="#3ec9a7" strokeWidth="6" strokeLinejoin="round" />
              <path d="M32 58l12-16 10 10 14-20" stroke="#f2c14e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mono text-[11px] font-extrabold uppercase tracking-[0.3em]">сигнал · motion</span>
          </button>

          <nav className="hidden items-center gap-0.5 xl:flex">
            <button onClick={() => navigate("lab")} onPointerEnter={() => feel("tap", 4)}
              className="relative flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[9.5px] font-extrabold uppercase tracking-[0.1em]">
              {route === "lab" && <motion.span layoutId="navpill" transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: "#f2c14e22", boxShadow: "inset 0 0 0 1px #f2c14e66" }} />}
              <span className="relative" style={{ color: route === "lab" ? "#f2c14e" : "#8fa4c7" }}><IcGauge size={14} /></span>
              <span className="relative" style={{ color: route === "lab" ? "#fff" : "#8fa4c7" }}>Лаборатория</span>
            </button>
            <button onClick={() => navigate("flows")} onPointerEnter={() => feel("tap", 4)}
              className="relative flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[9.5px] font-extrabold uppercase tracking-[0.1em]">
              {route === "flows" && <motion.span layoutId="navpill" transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: "#5b9cd622", boxShadow: "inset 0 0 0 1px #5b9cd666" }} />}
              <span className="relative" style={{ color: route === "flows" ? "#5b9cd6" : "#8fa4c7" }}><IcLayers size={14} /></span>
              <span className="relative" style={{ color: route === "flows" ? "#fff" : "#8fa4c7" }}>Потоки</span>
            </button>
            <span className="mx-1 h-4 w-px bg-white/10" />
            {CATEGORIES.map((c) => {
              const Icon = CAT_ICON[c.id];
              const on = route === c.id;
              return (
                <button key={c.id} onClick={() => navigate(c.id)} onPointerEnter={() => feel("tap", 4)}
                  className="relative flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[9.5px] font-extrabold uppercase tracking-[0.1em]">
                  {on && <motion.span layoutId="navpill" transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: c.color + "22", boxShadow: `inset 0 0 0 1px ${c.color}66` }} />}
                  <span className="relative" style={{ color: on ? c.color : "#8fa4c7" }}><Icon size={14} /></span>
                  <span className="relative" style={{ color: on ? "#fff" : "#8fa4c7" }}>{c.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2"><PaletteHint onClick={() => { feel("tap"); setPal(true); }} /><PlayToggle /><FpsPill /></div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={route}
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: E.out }}>
            {route === "lab" ? <Lab />
              : route === "flows" ? <FlowsPage />
              : cat ? <CategoryPage cat={cat} openId={assetRaw} back={() => navigate("home")} next={() => navigate("next")}
                  onOpenChange={(id) => {
                    const h = id ? `/${cat.id}/${id}` : `/${cat.id}`;
                    history.replaceState(null, "", `#${h}`);
                    setPath(h.slice(1));
                  }} />
              : <Home go={navigate} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* мобильный док категорий */}
      <div className="fixed inset-x-0 bottom-0 z-[80] flex justify-center pb-3 xl:hidden">
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-[#141d33]/95 p-1.5 backdrop-blur-xl">
          <motion.button onClick={() => navigate("lab")} animate={{ y: route === "lab" ? -4 : 0 }} whileTap={{ scale: 0.86 }} transition={S.pop}
            className="relative grid h-10 w-10 place-items-center rounded-xl">
            {route === "lab" && <motion.span layoutId="dock" transition={S.pop} className="absolute inset-0 rounded-xl bg-gold/20" />}
            <span className="relative" style={{ color: route === "lab" ? "#f2c14e" : "#6f83a6" }}><IcGauge size={18} /></span>
          </motion.button>
          <motion.button onClick={() => navigate("flows")} animate={{ y: route === "flows" ? -4 : 0 }} whileTap={{ scale: 0.86 }} transition={S.pop}
            className="relative grid h-10 w-10 place-items-center rounded-xl">
            {route === "flows" && <motion.span layoutId="dock" transition={S.pop} className="absolute inset-0 rounded-xl bg-sky/20" />}
            <span className="relative" style={{ color: route === "flows" ? "#5b9cd6" : "#6f83a6" }}><IcLayers size={18} /></span>
          </motion.button>
          {CATEGORIES.map((c) => {
            const Icon = CAT_ICON[c.id];
            const on = route === c.id;
            return (
              <motion.button key={c.id} onClick={() => navigate(c.id)} animate={{ y: on ? -4 : 0 }} whileTap={{ scale: 0.86 }} transition={S.pop}
                className="relative grid h-10 w-10 place-items-center rounded-xl">
                {on && <motion.span layoutId="dock" transition={S.pop} className="absolute inset-0 rounded-xl" style={{ background: c.color + "26" }} />}
                <span className="relative" style={{ color: on ? c.color : "#6f83a6" }}><Icon size={18} /></span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
