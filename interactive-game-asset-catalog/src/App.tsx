import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CATEGORIES } from "./data/catalog";
import { EASE } from "./motion/tokens";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Codex from "./pages/Codex";
import { Header } from "./pages/Header";

export type Route = { name: "home" } | { name: "cat"; id: string } | { name: "codex" };

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [a, b] = h.split("/");
  if (a === "c" && b && CATEGORIES.some((c) => c.id === b)) return { name: "cat", id: b };
  if (a === "codex") return { name: "codex" };
  return { name: "home" };
}
const key = (r: Route) => (r.name === "cat" ? `cat-${r.id}` : r.name);
const colorOf = (r: Route) => (r.name === "cat" ? CATEGORIES.find((c) => c.id === r.id)!.color : r.name === "codex" ? "#ffc34d" : "#2ee6c5");

export function nav(to: string) {
  window.location.hash = to;
}

/**
 * CURTAIN — игровой переход между страницами.
 * 7 шторок закрываются каскадом снизу, страница меняется под ними,
 * шторки уходят вверх. Цвет = цвет пункта назначения.
 */
function Curtain({ color, k }: { color: string; k: number }) {
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
          <motion.div className="absolute inset-x-0 top-1/2 h-px" style={{ background: color, boxShadow: `0 0 20px ${color}` }} />
        </motion.div>
      ))}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(parse);
  const [curtain, setCurtain] = useState<{ k: number; color: string } | null>(null);

  useEffect(() => {
    const on = () => {
      const r = parse();
      setCurtain({ k: Date.now(), color: colorOf(r) });
      // меняем страницу, когда шторки полностью закрыты
      window.setTimeout(() => {
        setRoute(r);
        window.scrollTo({ top: 0 });
      }, 420);
      window.setTimeout(() => setCurtain(null), 1200);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink">
      <Header route={route} />
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
        </motion.main>
      </AnimatePresence>
      {curtain && <Curtain k={curtain.k} color={curtain.color} />}
    </div>
  );
}
