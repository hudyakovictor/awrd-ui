import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import type { Asset, Category } from "../data/catalog";
import { S, E, feel, useInView, useTuneVersion, usePlaying } from "../lib/motion";
import { IcArrow, IcEye, IcBolt, IcCopy, IcCheck, IcBook } from "../ui/icons";
import { specForCategory, download } from "../lib/spec";
import { copyText } from "../lib/motion";
import { Inspector } from "./Inspector";
import { SiteButton } from "./Home";

export function CategoryPage({ cat, back, next, openId, onOpenChange }: {
  cat: Category; back: () => void; next: () => void; openId?: string; onOpenChange?: (id: string | null) => void;
}) {
  const open = cat.assets.find((a) => a.id === openId) ?? null;
  const setOpen = (a: Asset | null) => onOpenChange?.(a ? a.id : null);
  const idx = open ? cat.assets.findIndex((a) => a.id === open.id) : -1;
  const step = (d: number) => setOpen(cat.assets[(idx + d + cat.assets.length) % cat.assets.length]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") { feel("tap"); step(1); }
      if (e.key === "ArrowLeft") { feel("tap"); step(-1); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, idx]);

  const [tag, setTag] = useState("все");
  const tags = ["все", ...Array.from(new Set(cat.assets.flatMap((a) => a.tags)))];
  const list = tag === "все" ? cat.assets : cat.assets.filter((a) => a.tags.includes(tag));

  return (
    <div className="relative min-h-screen pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]" style={{ background: `radial-gradient(55% 46% at 50% 0%, ${cat.color}22, transparent)` }} />
      <div className="mesh absolute inset-x-0 top-0 h-[60vh] opacity-60" />

      <div className="relative mx-auto max-w-6xl px-5 pt-24">
        <motion.button onClick={() => { feel("tap"); back(); }} whileHover={{ x: -6 }} whileTap={{ scale: 0.96 }}
          className="mb-10 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-mist">
          <span className="rotate-180"><IcArrow size={14} /></span> каталог
        </motion.button>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-extrabold uppercase tracking-[0.45em]" style={{ color: cat.color }}>{cat.tagline}</motion.div>
            <motion.h1 initial={{ y: 34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.05 }}
              className="title-xl mt-3 text-[13vw] uppercase leading-[0.88] sm:text-7xl">{cat.name}</motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.14 }}
              className="mt-4 max-w-xl text-[14px] font-bold leading-relaxed text-mist">{cat.desc}</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, ...S.pop }} className="flex items-end gap-5">
            <SpecButtons cat={cat} />
            <div className="text-right">
              <div className="mono text-5xl font-extrabold" style={{ color: cat.color }}>{String(cat.assets.length).padStart(2, "0")}</div>
              <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-mist">живых экранов</div>
            </div>
          </motion.div>
        </div>

        <LayoutGroup id="tags">
          <div className="no-bar mt-10 flex gap-2 overflow-x-auto pb-1">
            {tags.map((t) => (
              <button key={t} onClick={() => { feel("tap"); setTag(t); }} className="relative shrink-0 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                {tag === t && <motion.span layoutId="tagpill" transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: cat.color }} />}
                {tag !== t && <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]" />}
                <span className={`relative ${tag === t ? "text-[#06231c]" : "text-mist"}`}>{t}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      <LayoutGroup id="grid">
        <motion.div layout className="relative mx-auto mt-12 grid max-w-6xl justify-items-center gap-x-6 gap-y-14 px-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((a, i) => <ScreenCard key={a.id} a={a} i={i} tone={cat.color} onOpen={() => { feel("confirm"); setOpen(a); }} />)}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <div className="mx-auto mt-24 max-w-6xl px-5">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/8 bg-white/[0.025] p-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-mist">дальше</div>
            <div className="title-xl mt-2 text-3xl uppercase">Следующий набор экранов</div>
          </div>
          <div className="flex gap-3">
            <SiteButton ghost onClick={back}>все категории</SiteButton>
            <SiteButton onClick={next} icon={<IcArrow size={16} />}>дальше</SiteButton>
          </div>
        </div>
      </div>

      <Inspector asset={open} tone={cat.color} onClose={() => setOpen(null)}
        onPrev={() => step(-1)} onNext={() => step(1)}
        pos={idx >= 0 ? `${idx + 1} / ${cat.assets.length}` : ""} />
    </div>
  );
}

function SpecButtons({ cat }: { cat: Category }) {
  const [ok, setOk] = useState(false);
  const md = () => specForCategory(cat);
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => { feel("confirm"); download(`signal-motion-${cat.id}.md`, md()); }}
        className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
        <IcBook size={13} /> скачать спеку
      </button>
      <button onClick={async () => { setOk(await copyText(md())); feel("tap"); setTimeout(() => setOk(false), 1600); }}
        className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
        {ok ? <IcCheck size={13} /> : <IcCopy size={13} />} {ok ? "скопировано" : "копировать md"}
      </button>
    </div>
  );
}

function ScreenCard({ a, i, tone, onOpen }: { a: Asset; i: number; tone: string; onOpen: () => void }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  const v = useTuneVersion();
  const playing = usePlaying();
  const [hot, setHot] = useState(false);
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 60, scale: 0.92, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : {}}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ delay: (i % 3) * 0.09, duration: 0.75, ease: E.out }}
      onHoverStart={() => setHot(true)}
      onHoverEnd={() => setHot(false)}
      className="relative flex w-full flex-col items-center"
    >
      <motion.div
        animate={{ y: hot ? -14 : 0, rotateX: hot ? 4 : 0, rotateY: hot ? -4 : 0, scale: hot ? 1.02 : 1 }}
        transition={S.soft}
        style={{ perspective: 1200 }}
        className="relative"
      >
        <motion.div className="absolute -inset-8 -z-10 rounded-full blur-3xl" style={{ background: tone + "2e" }}
          animate={{ opacity: hot ? 0.95 : 0.4, scale: hot ? 1.12 : 1 }} transition={{ duration: 0.5 }} />
        <motion.div className="pointer-events-none absolute -inset-3 -z-10 rounded-[46px]"
          animate={{ opacity: hot ? 1 : 0 }} transition={{ duration: 0.35 }}
          style={{ boxShadow: `0 0 0 1px ${tone}55, 0 0 42px -10px ${tone}` }} />
        <a.Comp key={v} live={inView && playing} />

        <motion.button
          onClick={onOpen}
          initial={false}
          animate={{ opacity: hot ? 1 : 0, y: hot ? 0 : 12 }}
          transition={S.pop}
          className="absolute inset-x-6 bottom-6 z-50 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]"
          style={{ background: tone, color: "#06231c", boxShadow: `0 16px 30px -12px ${tone}` }}
        >
          <IcEye size={15} /> разобрать
        </motion.button>
      </motion.div>

      <div className="mt-5 w-full max-w-[320px]">
        <div className="flex items-baseline justify-between gap-3">
          <button onClick={onOpen} className="title-xl text-left text-[19px] uppercase hover:text-white">{a.title}</button>
          <span className="mono shrink-0 text-[10px] font-bold" style={{ color: tone }}>{String(i + 1).padStart(2, "0")}</span>
        </div>
        <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-mist">{a.sub}</div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {a.tags.map((t) => (
            <span key={t} className="mono rounded-full border border-white/10 bg-white/[0.03] px-2 py-[3px] text-[9px] font-bold uppercase tracking-wider text-mist">{t}</span>
          ))}
          <button onClick={onOpen} className="ml-auto flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: tone }}>
            <IcBolt size={12} /> секреты
          </button>
        </div>
      </div>
    </motion.div>
  );
}
