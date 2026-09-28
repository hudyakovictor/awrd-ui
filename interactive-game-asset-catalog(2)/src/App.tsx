import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CATEGORIES } from "./data/catalog";
import { EASE } from "./motion/tokens";
import { sfx } from "./motion/sfx";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Codex from "./pages/Codex";
import Play from "./pages/Play";
import { Header } from "./pages/Header";
import { Palette } from "./components/Palette";
import { Cursor } from "./components/Cursor";

export type Route = { name: "home" } | { name: "cat"; id: string } | { name: "codex" } | { name: "play" };

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [a, b] = h.split("/");
  if (a === "c" && b && CATEGORIES.some((c) => c.id === b)) return { name: "cat", id: b };
  if (a === "codex") return { name: "codex" };
  if (a === "play") return { name: "play" };
  return { name: "home" };
}
const key = (r: Route) => (r.name === "cat" ? `cat-${r.id}` : r.name);
const colorOf = (r: Route) =>
  r.name === "cat" ? CATEGORIES.find((c) => c.id === r.id)!.color : r.name === "codex" ? "#ffc34d" : r.name === "play" ? "#ff4d5e" : "#2ee6c5";
const labelOf = (r: Route) =>
  r.name === "cat" ? CATEGORIES.find((c) => c.id === r.id)!.title : r.name === "codex" ? "Кодекс" : r.name === "play" ? "Арена" : "Каталог";

export function nav(to: string) {
  window.location.hash = to;
}

/**
 * CURTAIN — игровой переход между страницами.
 * 7 шторок закрываются из центра к краям, по шву проходит название
 * пункта назначения, страница меняется под закрытыми шторками.
 */
function Curtain({ color, k, label }: { color: string; k: number; label: string }) {
  const N = 7;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex">
      {Array.from({ length: N }).map((_, i) => (
        <motion.div
          key={`${k}-${i}`}
          className="relative h-full flex-1"
          style={{ background: `linear-gradient(180deg, #0a1122, ${color}40 50%, #0a1122)`, borderRight: `1px solid ${color}33` }}
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: [0, 1, 1, 0], originY: [1, 1, 0, 0] }}
          transition={{ duration: 1.05, times: [0, 0.38, 0.55, 1], delay: Math.abs(i - (N - 1) / 2) * 0.035, ease: EASE.camera }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: color, boxShadow: `0 0 20px ${color}` }} />
        </motion.div>
      ))}
      <motion.div
        key={`l${k}`}
        className="absolute inset-x-0 top-1/2 -mt-8 text-center font-display text-5xl font-black"
        style={{ color, textShadow: `0 0 30px ${color}` }}
        initial={{ opacity: 0, letterSpacing: "0.6em", scale: 0.9 }}
        animate={{ opacity: [0, 1, 1, 0], letterSpacing: ["0.6em", "0.08em", "0.08em", "0em"], scale: [0.9, 1, 1, 1.05] }}
        transition={{ duration: 1.05, times: [0.15, 0.4, 0.55, 0.75] }}
      >
        {label}
      </motion.div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(parse);
  const [curtain, setCurtain] = useState<{ k: number; color: string; label: string } | null>(null);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const on = () => {
      const r = parse();
      setCurtain({ k: Date.now(), color: colorOf(r), label: labelOf(r) });
      sfx.whoosh(0.5);
      window.setTimeout(() => {
        setRoute(r);
        window.scrollTo({ top: 0 });
      }, 420);
      window.setTimeout(() => setCurtain(null), 1200);
    };
    window.addEventListener("hashchange", on);
    const kb = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", kb);
    return () => {
      window.removeEventListener("hashchange", on);
      window.removeEventListener("keydown", kb);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink">
      <Header route={route} onPalette={() => setPalette(true)} />
      <AnimatePresence mode="wait">
        <motion.main
          key={key(route)}
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.01 } }}
          transition={{ duration: 0.7, ease: EASE.outExpo }}
        >
          {route.name === "home" && <Home />}
          {route.name === "cat" && <CategoryPage id={route.id} />}
          {route.name === "codex" && <Codex />}
          {route.name === "play" && <Play />}
        </motion.main>
      </AnimatePresence>
      {curtain && <Curtain k={curtain.k} color={curtain.color} label={curtain.label} />}
      <Palette open={palette} onClose={() => setPalette(false)} />
      <Cursor />
    </div>
  );
}
