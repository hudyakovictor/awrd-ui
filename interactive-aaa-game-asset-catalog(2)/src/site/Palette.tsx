import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, ALL } from "../data/catalog";
import { S, feel, commitTune } from "../lib/motion";
import { IcTarget, IcArrow, IcGauge, IcBolt, IcLayers, IcShield, IcPlay } from "../ui/icons";

/* =====================================================================
   КОМАНДНАЯ ПАЛИТРА — Cmd/Ctrl+K.
   Каталог на 30 экранов невозможно листать глазами: нужен быстрый доступ
   к экрану, категории, инструменту или профилю физики.
   ===================================================================== */
type Cmd = { id: string; t: string; sub: string; group: string; tone: string; run: () => void; Icon: any; hay: string };

const PROFILES = [
  { id: "aaa", t: "AAA", sub: "Базовая физика каталога", tone: "#3ec9a7", Icon: IcBolt, v: { speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1 } },
  { id: "snap", t: "Snappy", sub: "Быстро, без отскока", tone: "#5b9cd6", Icon: IcBolt, v: { speed: 1.35, bounce: 0.7, weight: 0.85, stagger: 0.6, impact: 0.5, particles: 0.6 } },
  { id: "juicy", t: "Juicy", sub: "Максимум сока", tone: "#f2c14e", Icon: IcBolt, v: { speed: 0.95, bounce: 1.45, weight: 1.15, stagger: 1.3, impact: 1.6, particles: 1.6 } },
  { id: "cine", t: "Cinematic", sub: "Медленно и тяжело", tone: "#9d8cf5", Icon: IcBolt, v: { speed: 0.7, bounce: 1.1, weight: 1.5, stagger: 1.6, impact: 1.2, particles: 1.2 } },
  { id: "a11y", t: "Reduced motion", sub: "Режим доступности", tone: "#8fa4c7", Icon: IcShield, v: { speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2, impact: 0, particles: 0.15 } },
];

/** Нечёткий поиск: все символы запроса по порядку. Прямое вхождение — выше. */
function score(hay: string, q: string) {
  if (!q) return 1;
  const h = hay.toLowerCase();
  const direct = h.indexOf(q);
  if (direct >= 0) return 100 - direct;
  let k = 0;
  for (const ch of h) if (ch === q[k]) k++;
  return k === q.length ? 10 : 0;
}

export function Palette({ open, setOpen, go, openAsset, theater }: {
  open: boolean; setOpen: (v: boolean) => void; go: (route: string) => void; openAsset: (cat: string, id: string) => void; theater: () => void;
}) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const cmds: Cmd[] = useMemo(() => {
    const tools: Cmd[] = [
      { id: "theater", t: "Театр", sub: "Полноэкранный шоурил всех экранов", group: "Инструмент", tone: "#3ec9a7", Icon: IcPlay, run: theater, hay: "театр шоурил showreel презентация" },
      { id: "lab", t: "Лаборатория", sub: "Стенд, A/B, кривые, анатомия, звук", group: "Инструмент", tone: "#f2c14e", Icon: IcGauge, run: () => go("lab"), hay: "лаборатория lab тюнер пружины" },
      { id: "journey", t: "Путь игрока", sub: "Граф переходов между всеми экранами", group: "Инструмент", tone: "#9d8cf5", Icon: IcLayers, run: () => go("journey"), hay: "путь флоу граф journey переходы карта" },
      { id: "home", t: "Главная", sub: "Индекс, верстак, правила", group: "Инструмент", tone: "#3ec9a7", Icon: IcArrow, run: () => go("home"), hay: "главная home" },
    ];
    const profiles: Cmd[] = PROFILES.map((p) => ({
      id: `p-${p.id}`, t: `Профиль: ${p.t}`, sub: p.sub, group: "Профиль", tone: p.tone, Icon: p.Icon,
      run: () => commitTune(p.v), hay: `профиль physics ${p.t} ${p.sub}`,
    }));
    const cats: Cmd[] = CATEGORIES.map((c) => ({
      id: `c-${c.id}`, t: c.name, sub: `${c.assets.length} экранов · ${c.tagline}`, group: "Категория", tone: c.color,
      Icon: IcTarget, run: () => go(c.id), hay: `${c.name} ${c.tagline}`,
    }));
    const screens: Cmd[] = ALL.map((a) => ({
      id: `s-${a.id}`, t: a.title, sub: `${a.cat.name} · ${a.sub}`, group: "Экран", tone: a.cat.color,
      Icon: IcLayers, run: () => openAsset(a.cat.id, a.id), hay: `${a.title} ${a.sub} ${a.tags.join(" ")} ${a.cat.name}`,
    }));
    return [...tools, ...profiles, ...cats, ...screens];
  }, [go, openAsset, theater]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cmds.slice(0, 10);
    return cmds.map((c) => ({ c, sc: score(`${c.t} ${c.hay}`, s) })).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 12).map((x) => x.c);
  }, [q, cmds]);

  useEffect(() => { setI(0); }, [q, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 60); else setQ(""); }, [open]);
  useEffect(() => { listRef.current?.querySelector(`[data-row="${i}"]`)?.scrollIntoView({ block: "nearest" }); }, [i]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); feel("tap"); }
      if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => (v + 1) % Math.max(1, list.length)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => (v - 1 + list.length) % Math.max(1, list.length)); }
      if (e.key === "Enter") { const c = list[i]; if (c) { feel("confirm"); setOpen(false); c.run(); } }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [open, list, i]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[13vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-[#060a14]/85 backdrop-blur-lg" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: -28, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -16, scale: 0.97, opacity: 0 }}
            transition={{ ...S.soft, damping: 24 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#111a2b]"
            style={{ boxShadow: "0 40px 90px -30px #000, 0 0 0 1px rgba(62,201,167,.12)" }}>
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              <span className="text-teal"><IcTarget size={17} /></span>
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="экран, тег, категория, профиль…"
                className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-mist/60" />
              <kbd className="mono rounded-md border border-white/12 px-1.5 py-0.5 text-[9px] font-bold text-mist">ESC</kbd>
            </div>
            <div ref={listRef} className="no-bar max-h-[52vh] overflow-y-auto p-2">
              {list.length === 0 && <div className="px-3 py-10 text-center text-[12px] font-bold text-mist">Ничего не найдено</div>}
              {list.map((c, k) => (
                <button key={c.id} data-row={k} onMouseEnter={() => setI(k)} onClick={() => { feel("confirm"); setOpen(false); c.run(); }}
                  className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left">
                  {i === k && <motion.span layoutId="palrow" transition={S.snap} className="absolute inset-0 rounded-2xl bg-white/[0.07]" style={{ boxShadow: `inset 0 0 0 1px ${c.tone}66` }} />}
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: c.tone + "1e", color: c.tone }}><c.Icon size={16} /></span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold">{c.t}</span>
                    <span className="block truncate text-[10.5px] font-bold text-mist">{c.sub}</span>
                  </span>
                  <span className="mono relative shrink-0 rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wider" style={{ background: c.tone + "1a", color: c.tone }}>{c.group}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5">
              <div className="flex gap-3 text-[9.5px] font-bold text-mist">
                <span><kbd className="mono rounded border border-white/12 px-1">↑↓</kbd> выбор</span>
                <span><kbd className="mono rounded border border-white/12 px-1">↵</kbd> открыть</span>
              </div>
              <span className="mono text-[9.5px] font-bold text-mist">{ALL.length} экранов · {CATEGORIES.length} категорий</span>
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
