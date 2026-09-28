import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, ALL } from "../data/catalog";
import { FLOWS } from "./Flows";
import { S, feel, commitTune } from "../lib/motion";
import { IcTarget, IcArrow, IcGauge, IcBolt, IcLayers, IcShield, IcCards, IcCrown, IcStar } from "../ui/icons";

/* =====================================================================
   КОМАНДНАЯ ПАЛИТРА — Cmd/Ctrl + K.
   Каталог на 30+ экранов невозможно листать: нужен мгновенный доступ
   к экрану, категории, сценарию и профилю физики.
   ===================================================================== */
type Cmd = { id: string; t: string; sub: string; group: string; tone: string; run: () => void; Icon: any };

export function Palette({
  go, open, setOpen,
}: { go: (route: string, asset?: string) => void; open: boolean; setOpen: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const cmds: Cmd[] = useMemo(() => {
    const tools: Cmd[] = [
      { id: "t-lab", t: "Лаборатория", sub: "Стенд пружин, A/B, кривые, бюджет FPS", group: "Инструмент", tone: "#f2c14e", Icon: IcGauge, run: () => go("lab") },
      { id: "t-flows", t: "Карта потоков", sub: `${FLOWS.length} сценария: от первого запуска до финала сезона`, group: "Инструмент", tone: "#5b9cd6", Icon: IcLayers, run: () => go("flows") },
      { id: "t-home", t: "Главная", sub: "Индекс, верстак, свод правил", group: "Инструмент", tone: "#3ec9a7", Icon: IcArrow, run: () => go("home") },
    ];
    const profiles: Cmd[] = [
      { id: "p-aaa", t: "Профиль: AAA", sub: "Базовая физика каталога", group: "Профиль", tone: "#3ec9a7", Icon: IcBolt, run: () => commitTune({ speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1 }) },
      { id: "p-snap", t: "Профиль: Snappy", sub: "Быстро, минимум отскока — для меты", group: "Профиль", tone: "#5b9cd6", Icon: IcBolt, run: () => commitTune({ speed: 1.35, bounce: 0.7, weight: 0.85, stagger: 0.6, impact: 0.5, particles: 0.6 }) },
      { id: "p-juicy", t: "Профиль: Juicy", sub: "Максимум сока — для боя и наград", group: "Профиль", tone: "#f2c14e", Icon: IcBolt, run: () => commitTune({ speed: 0.95, bounce: 1.45, weight: 1.15, stagger: 1.3, impact: 1.6, particles: 1.6 }) },
      { id: "p-cine", t: "Профиль: Cinematic", sub: "Медленно и тяжело — для интро", group: "Профиль", tone: "#9d8cf5", Icon: IcBolt, run: () => commitTune({ speed: 0.7, bounce: 1.1, weight: 1.5, stagger: 1.6, impact: 1.2, particles: 1.2 }) },
      { id: "p-a11y", t: "Профиль: Reduced motion", sub: "Импакт и частицы выключены", group: "Профиль", tone: "#8fa4c7", Icon: IcShield, run: () => commitTune({ speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2, impact: 0, particles: 0.15 }) },
    ];
    const flows: Cmd[] = FLOWS.map((f) => ({
      id: `f-${f.id}`, t: `Поток: ${f.t}`, sub: f.goal, group: "Сценарий", tone: f.tone, Icon: f.Icon,
      run: () => go("flows"),
    }));
    const CAT_ICON: Record<string, any> = {
      craft: IcCrown, squad: IcStar, economy: IcCards, core: IcTarget, progress: IcCrown,
      meta: IcTarget, mastery: IcTarget, social: IcShield, livecat: IcBolt, learn: IcLayers, system: IcLayers,
    };
    const cats: Cmd[] = CATEGORIES.map((c) => ({
      id: `c-${c.id}`, t: c.name, sub: `${c.assets.length} экранов · ${c.tagline}`, group: "Категория", tone: c.color,
      Icon: CAT_ICON[c.id] ?? IcCards, run: () => go(c.id),
    }));
    const screens: Cmd[] = ALL.map((a) => ({
      id: `s-${a.id}`, t: a.title, sub: `${a.cat.name} · ${a.sub}`, group: "Экран", tone: a.cat.color,
      Icon: IcTarget, run: () => go(a.cat.id, a.id),
    }));
    return [...tools, ...profiles, ...flows, ...cats, ...screens];
  }, [go]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cmds.slice(0, 10);
    const scored = cmds
      .map((c) => {
        const hay = `${c.t} ${c.sub} ${c.group}`.toLowerCase();
        const idx = hay.indexOf(s);
        return { c, score: idx < 0 ? 999 : c.t.toLowerCase().startsWith(s) ? 0 : idx };
      })
      .filter((x) => x.score < 999)
      .sort((a, b) => a.score - b.score);
    return scored.slice(0, 12).map((x) => x.c);
  }, [q, cmds]);

  useEffect(() => { setI(0); }, [q, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 60); else setQ(""); }, [open]);
  useEffect(() => {
    const el = listRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [i]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); feel("tap"); }
      if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => (v + 1) % Math.max(1, list.length)); feel("tap", 3); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => (v - 1 + list.length) % Math.max(1, list.length)); feel("tap", 3); }
      if (e.key === "Enter") { const c = list[i]; if (c) { feel("confirm"); c.run(); setOpen(false); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, list, i, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[130] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-[#060a14]/88 backdrop-blur-lg" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: -30, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -20, scale: 0.97, opacity: 0 }}
            transition={{ ...S.soft, damping: 24 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#111a2b]"
            style={{ boxShadow: "0 40px 90px -30px #000" }}
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              <span className="text-teal"><IcTarget size={17} /></span>
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="экран, категория, сценарий, профиль физики…"
                className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-mist/60" />
              <kbd className="mono rounded-md border border-white/12 px-1.5 py-0.5 text-[9px] font-bold text-mist">ESC</kbd>
            </div>

            <div ref={listRef} className="no-bar max-h-[54vh] overflow-y-auto p-2">
              {list.length === 0 && (
                <div className="px-3 py-10 text-center text-[12px] font-bold text-mist">
                  Ничего не найдено. Попробуй «пак», «дуэль», «juicy» или «сезон».
                </div>
              )}
              {list.map((c, k) => (
                <button key={c.id} onMouseEnter={() => setI(k)} onClick={() => { feel("confirm"); c.run(); setOpen(false); }}
                  className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left">
                  {i === k && <motion.span layoutId="palrow" transition={S.snap} className="absolute inset-0 rounded-2xl bg-white/[0.07]"
                    style={{ boxShadow: `inset 0 0 0 1px ${c.tone}66` }} />}
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: c.tone + "1e", color: c.tone }}>
                    <c.Icon size={16} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold">{c.t}</span>
                    <span className="block truncate text-[10.5px] font-bold text-mist">{c.sub}</span>
                  </span>
                  <span className="mono relative shrink-0 rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wider"
                    style={{ background: c.tone + "1a", color: c.tone }}>{c.group}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5">
              <div className="flex gap-3 text-[9.5px] font-bold text-mist">
                <span><kbd className="mono rounded border border-white/12 px-1">↑↓</kbd> навигация</span>
                <span><kbd className="mono rounded border border-white/12 px-1">↵</kbd> открыть</span>
              </div>
              <span className="mono text-[9.5px] font-bold text-mist">{ALL.length} экранов · {CATEGORIES.length} категорий · {FLOWS.length} сценариев</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PaletteHint({ onClick }: { onClick: () => void }) {
  const mac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
  return (
    <motion.button onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} transition={S.snap}
      className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-mist hover:text-white md:flex">
      <IcTarget size={13} /> поиск
      <kbd className="mono rounded border border-white/12 px-1.5 py-0.5 text-[9px]">{mac ? "⌘" : "Ctrl"}K</kbd>
    </motion.button>
  );
}
