import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { nav } from "../App";
import { ALL_SCENES, CATEGORIES } from "../data/catalog";
import { EASE, SPRING } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { I } from "./kit";

interface Item { id: string; title: string; sub: string; color: string; go: () => void; kind: string }

/**
 * COMMAND PALETTE — поиск по всем сценам.
 * Секреты: появление с blur+scale из верхней трети (там, где глаз),
 * индикатор выделения — один layoutId-элемент, который «перетекает»
 * между строками при навигации стрелками.
 */
export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const items: Item[] = useMemo(() => {
    const base: Item[] = [
      { id: "home", title: "Главная", sub: "Каталог сцен", color: "#2ee6c5", kind: "Страница", go: () => nav("/") },
      { id: "play", title: "Играть", sub: "Играбельный цикл с журналом моушена", color: "#ff4d5e", kind: "Страница", go: () => nav("/play") },
      { id: "codex", title: "Кодекс секретов", sub: "Законы, лаборатории, токены", color: "#ffc34d", kind: "Страница", go: () => nav("/codex") },
      ...CATEGORIES.map((c) => ({ id: `c-${c.id}`, title: c.title, sub: c.en, color: c.color, kind: "Категория", go: () => nav(`/c/${c.id}`) })),
      ...ALL_SCENES.map((s) => ({
        id: s.id,
        title: `${s.n} · ${s.title}`,
        sub: `${s.kind} — ${s.cat.title}`,
        color: s.cat.color,
        kind: "Сцена",
        go: () => {
          sessionStorage.setItem("scrollTo", s.id);
          if (window.location.hash === `#/c/${s.cat.id}`) document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
          else nav(`/c/${s.cat.id}`);
        },
      })),
    ];
    const t = q.trim().toLowerCase();
    if (!t) return base;
    return base.filter((i) => (i.title + " " + i.sub + " " + i.kind).toLowerCase().includes(t));
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      window.setTimeout(() => input.current?.focus(), 50);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  const run = (i: Item | undefined) => {
    if (!i) return;
    sfx.tap();
    onClose();
    i.go();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="pal" className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: -10, filter: "blur(6px)", transition: { duration: 0.15, ease: EASE.inQuart } }}
            transition={SPRING.panel}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c1428]/95 shadow-[0_40px_100px_-20px_#000]"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)); sfx.tick(); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); sfx.tick(); }
              if (e.key === "Enter") run(items[sel]);
              if (e.key === "Escape") onClose();
            }}
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
              <I.target size={18} className="text-teal" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти сцену, приём, категорию…" className="flex-1 bg-transparent text-base outline-none placeholder:text-white/30" />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50">ESC</kbd>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && <div className="p-8 text-center text-sm text-white/40">Ничего не найдено</div>}
              {items.map((it, i) => (
                <motion.button
                  key={it.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.015, duration: 0.25, ease: EASE.outExpo }}
                  onMouseMove={() => setSel(i)}
                  onClick={() => run(it)}
                  className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                >
                  {sel === i && <motion.span layoutId="palsel" transition={SPRING.layout} className="absolute inset-0 rounded-xl" style={{ background: `${it.color}1a`, boxShadow: `inset 0 0 0 1px ${it.color}44` }} />}
                  <span className="relative h-2 w-2 shrink-0 rounded-full" style={{ background: it.color, boxShadow: `0 0 8px ${it.color}` }} />
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{it.title}</span>
                    <span className="block truncate text-[11px] text-white/45">{it.sub}</span>
                  </span>
                  <span className="relative text-[10px] font-bold uppercase tracking-wider text-white/30">{it.kind}</span>
                  {sel === i && <motion.span layoutId="palarrow" className="relative text-white/60"><I.arrowR size={14} /></motion.span>}
                </motion.button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-white/5 px-5 py-2.5 text-[10px] text-white/35">
              <span><kbd className="font-mono">↑↓</kbd> навигация</span>
              <span><kbd className="font-mono">↵</kbd> открыть</span>
              <span className="ml-auto">{items.length} результатов</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
