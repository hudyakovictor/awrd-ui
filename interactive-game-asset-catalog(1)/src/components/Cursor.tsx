import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * GAME CURSOR — точка + кольцо с инерцией.
 * Точка следует мгновенно (точность), кольцо — пружиной (характер).
 * Над интерактивным элементом кольцо раздувается, при нажатии сжимается.
 */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 500, damping: 34, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 500, damping: 34, mass: 0.6 });
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine);
    if (!fine) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHover(!!t?.closest("button, a, input, [role=button], .cursor-grab"));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 rounded-full bg-teal mix-blend-screen" style={{ x, y, translateX: "-50%", translateY: "-50%" }} />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full border border-teal/70"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hover ? 44 : 26, height: hover ? 44 : 26, scale: down ? 0.75 : 1, background: hover ? "#2ee6c514" : "#2ee6c500", borderColor: hover ? "#2ee6c5" : "#2ee6c588" }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </>
  );
}
