import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav } from "../App";
import { Code, EaseCurve, I, Phone, Timeline } from "../components/kit";
import { CATEGORIES, type Category, type Scene } from "../data/catalog";
import { EASE, SPRING } from "../motion/tokens";

function SceneBlock({ s, cat, idx }: { s: Scene; cat: Category; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "300px 0px 300px 0px" });
  const visible = useInView(ref, { amount: 0.35 });
  const [run, setRun] = useState(0);
  const [cueRun, setCueRun] = useState(0);
  const [loop, setLoop] = useState(true);
  const [tab, setTab] = useState<"secrets" | "code">("secrets");

  // старт при появлении
  useEffect(() => {
    if (visible) setRun((r) => r + 1);
  }, [visible]);
  // автоповтор
  useEffect(() => {
    if (!visible || !loop) return;
    const t = window.setTimeout(() => setRun((r) => r + 1), s.total + 2600);
    return () => clearTimeout(t);
  }, [run, visible, loop, s.total]);

  const C = s.C;
  const reverse = idx % 2 === 1;
  return (
    <section id={s.id} ref={ref} className="scroll-mt-24 border-t border-white/5 py-16 lg:py-24">
      <div className={`grid items-start gap-10 lg:grid-cols-[340px_1fr] lg:gap-16 ${reverse ? "lg:grid-cols-[1fr_340px]" : ""}`}>
        <div className={`flex flex-col items-center lg:sticky lg:top-24 ${reverse ? "lg:order-2" : ""}`}>
          <motion.div
            initial={{ opacity: 0, y: 60, rotateY: reverse ? -18 : 18 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            style={{ perspective: 1200 }}
            onPointerDown={() => setLoop(false)}
          >
            <Phone tint={cat.color}>
              {near ? <C run={run} cue={() => setCueRun((c) => c + 1)} /> : <div className="absolute inset-0 bg-deep" />}
            </Phone>
          </motion.div>
          <div className="mt-6 flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9, rotate: -90 }}
              onClick={() => setRun((r) => r + 1)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-black"
              style={{ background: cat.color, boxShadow: `0 8px 24px -8px ${cat.color}` }}
            >
              <I.replay size={14} stroke={2.5} /> Повторить
            </motion.button>
            <button onClick={() => setLoop((l) => !l)} className={`rounded-full border px-4 py-2 text-xs font-bold ${loop ? "border-white/20 text-white/80" : "border-white/10 text-white/35"}`}>
              Автоповтор: {loop ? "вкл" : "выкл"}
            </button>
          </div>
          {s.interactive && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full blink" style={{ background: cat.color }} /> Интерактивно: {s.interactive}
            </div>
          )}
        </div>

        <div className={reverse ? "lg:order-1" : ""}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE.outExpo }}>
            <div className="flex items-center gap-3">
              <span className="font-display text-6xl font-black leading-none" style={{ color: "transparent", WebkitTextStroke: `1.5px ${cat.color}` }}>{s.n}</span>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${cat.color}1a`, color: cat.color }}>{s.kind}</span>
            </div>
            <h3 className="mt-4 font-display text-3xl font-black sm:text-4xl">{s.title}</h3>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">{s.lead}</p>
          </motion.div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Timeline tracks={s.tracks} total={s.total} run={cueRun} />
            <EaseCurve bez={s.ease.bez} label={s.ease.label} color={cat.color} />
          </div>

          <div className="mt-8">
            <div className="relative inline-flex rounded-full border border-white/10 bg-white/[.03] p-1">
              {(["secrets", "code"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className="relative px-5 py-2 text-xs font-bold">
                  {tab === t && <motion.span layoutId={`tab-${s.id}`} transition={SPRING.layout} className="absolute inset-0 rounded-full" style={{ background: cat.color }} />}
                  <span className={`relative flex items-center gap-1.5 ${tab === t ? "text-black" : "text-white/60"}`}>
                    {t === "secrets" ? <><I.sparkle size={13} /> Секреты</> : <><I.code size={13} /> Код</>}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5">
              {tab === "secrets" ? (
                <ol className="space-y-3">
                  {s.secrets.map((x, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, ...SPRING.panel }}
                      className="group flex gap-4 rounded-2xl border border-white/5 bg-white/[.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[.04]"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold" style={{ background: `${cat.color}1a`, color: cat.color }}>{i + 1}</span>
                      <span className="text-sm leading-relaxed text-white/75">{x}</span>
                    </motion.li>
                  ))}
                </ol>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Code code={s.code} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JumpRail({ cat }: { cat: Category }) {
  const [active, setActive] = useState(cat.scenes[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.01, 0.2, 0.6] },
    );
    cat.scenes.forEach((sc) => {
      const el = document.getElementById(sc.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [cat]);
  return (
    <nav className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
      {cat.scenes.map((sc) => {
        const on = active === sc.id;
        return (
          <button key={sc.id} onClick={() => document.getElementById(sc.id)?.scrollIntoView({ behavior: "smooth" })} className="group flex items-center gap-2">
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[.2em] transition-all duration-300" style={{ color: on ? cat.color : "transparent", opacity: on ? 1 : 0 }}>
              {sc.title}
            </span>
            <span className="relative grid h-6 w-6 place-items-center">
              <motion.span className="absolute inset-0 rounded-full border" animate={{ borderColor: on ? cat.color : "#ffffff22", scale: on ? 1 : 0.72 }} transition={SPRING.panel} />
              <span className="relative font-mono text-[9px] font-bold" style={{ color: on ? cat.color : "#ffffff55" }}>{sc.n}</span>
              {on && <span className="pulse-ring absolute inset-0 rounded-full border" style={{ borderColor: cat.color }} />}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function CategoryPage({ id }: { id: string }) {
  const ci = CATEGORIES.findIndex((c) => c.id === id);
  const cat = CATEGORIES[ci];
  const prev = CATEGORIES[(ci - 1 + CATEGORIES.length) % CATEGORIES.length];
  const next = CATEGORIES[(ci + 1) % CATEGORIES.length];
  const { scrollYProgress } = useScroll();
  const prog = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const target = sessionStorage.getItem("scrollTo");
    if (target) {
      sessionStorage.removeItem("scrollTo");
      window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }), 700);
    }
  }, [id]);

  return (
    <div className="relative">
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left" style={{ scaleX: prog, background: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]" style={{ background: `radial-gradient(60% 60% at 30% 0%, ${cat.color}22, transparent 70%)` }} />
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-50 [mask-image:linear-gradient(#000,transparent)]" />

      <header className="relative mx-auto max-w-7xl px-5 pb-10 pt-28">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => nav("/")} className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white">
          <I.arrowL size={14} /> Каталог
        </motion.button>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.1, ...SPRING.reward }}
            className="font-display text-[110px] font-black leading-[.8] sm:text-[160px]"
            style={{ color: "transparent", WebkitTextStroke: `2px ${cat.color}`, filter: `drop-shadow(0 0 30px ${cat.color}55)` }}
          >
            {cat.n}
          </motion.div>
          <div className="pb-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xs font-bold uppercase tracking-[.3em]" style={{ color: cat.color }}>{cat.en}</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.25, duration: 0.8, ease: EASE.outExpo }} className="mt-2 font-display text-5xl font-black sm:text-7xl">
              {cat.title}
            </motion.h1>
          </div>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE.outExpo }} className="mt-6 max-w-2xl text-lg text-white/60">
          {cat.blurb}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/35">
          <span>Сцены играют в цикле и запускаются только когда попадают в кадр.</span>
          <span className="hidden items-center gap-1.5 sm:flex"><span className="h-1 w-1 rounded-full bg-teal" /> Включи звук в шапке — у каждого события свой синтезированный тембр.</span>
        </motion.div>
        <div className="mt-8 flex flex-wrap gap-2">
          {cat.scenes.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.06, ...SPRING.reward }}
              whileHover={{ y: -3 }}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
            >
              <span className="font-mono" style={{ color: cat.color }}>{s.n}</span> {s.title}
            </motion.button>
          ))}
        </div>
      </header>

      <JumpRail cat={cat} />
      <div className="relative mx-auto max-w-7xl px-5">
        {cat.scenes.map((s, i) => (
          <SceneBlock key={s.id} s={s} cat={cat} idx={i} />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:grid-cols-2">
        {[prev, next].map((c, i) => (
          <motion.button
            key={c.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => nav(`/c/${c.id}`)}
            className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-panel/60 p-8 ${i ? "text-right" : "text-left"}`}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(80% 100% at ${i ? "100%" : "0%"} 50%, ${c.color}22, transparent)` }} />
            <div className="relative text-xs font-bold uppercase tracking-[.25em] text-white/40">{i ? "Следующая" : "Предыдущая"}</div>
            <div className="relative mt-2 font-display text-3xl font-black" style={{ color: c.color }}>{c.title}</div>
            <div className="relative mt-1 text-sm text-white/45">{c.en}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
