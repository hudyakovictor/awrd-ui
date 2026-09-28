import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { CATEGORIES, ALL, PRINCIPLES } from "../data/catalog";
import { S, E, feel, useInView, useTimeline, usePointer, px, useTilt, useCount, usePlaying, useTuneVersion } from "../lib/motion";
import { IcArrow, IcBolt, IcTarget, IcSwords, IcCards, IcCap, IcCrown, IcTrend, IcGauge, IcCode, IcCheck, IcLayers, IcBook, IcStar, IcClose } from "../ui/icons";
import { Tuner } from "./Tuner";
import { FlowsPreview, FLOWS } from "./Flows";
import { HomeHub } from "../screens/meta";
import { ArenaRound } from "../screens/arena";
import { PackOpening } from "../screens/rewards";

const CAT_ICON: Record<string, any> = {
  core: IcSwords, progress: IcCrown, economy: IcCards, meta: IcTarget,
  mastery: IcBook, social: IcCards, livecat: IcBolt, craft: IcCrown,
  squad: IcStar, learn: IcCap, system: IcLayers,
};

export function Home({ go }: { go: (id: string) => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const p = usePointer(70);
  const playing = usePlaying();
  const tv = useTuneVersion();
  const [showcase] = useTimeline(3, 7000, playing);
  const Show = [HomeHub, ArenaRound, PackOpening][showcase];
  const count = useCount(ALL.length, 1.4);

  return (
    <div className="relative">
      {/* ======================= HERO ======================= */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden px-5 pt-24">
        <motion.div className="absolute inset-0" style={{ x: px(p.x, 16), y: px(p.y, 16) }}>
          <div className="aurora" />
        </motion.div>
        <div className="mesh absolute inset-0" />
        <div className="grid-floor absolute inset-0" />

        <motion.div style={{ y, opacity: fade }} className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_auto]">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={S.soft}
              className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.3em] text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" /> motion asset catalog · v2
            </motion.div>

            <h1 className="title-xl mt-6 text-[17vw] uppercase leading-[0.84] sm:text-[8.5rem]">
              <Line text="СИГНАЛ" className="text-grad" />
              <Line text="МОУШЕН" delay={0.12} className="text-white/92" />
            </h1>

            <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ...S.soft }}
              className="mt-6 max-w-lg text-[15px] font-bold leading-relaxed text-mist">
              Каталог <b className="text-white">экранных ассетов</b> мобильной игры: {ALL.length} полностью анимированных экранов
              на векторе и пружинной физике. Ни гифов, ни картинок — настраиваемое ядро, чеклисты внедрения
              и Markdown-спека, которую отдают в разработку.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, ...S.pop }} className="mt-8 flex flex-wrap gap-3">
              <SiteButton onClick={() => document.getElementById("cats")?.scrollIntoView({ behavior: "smooth" })} icon={<IcArrow size={16} />}>
                открыть каталог
              </SiteButton>
              <SiteButton ghost onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })} icon={<IcBolt size={16} />}>
                10 правил моушена
              </SiteButton>
            </motion.div>

            <div className="mt-12 flex gap-10">
              {[{ v: Math.round(count), l: "экранов" }, { v: CATEGORIES.length, l: "категорий" }, { v: FLOWS.length, l: "сценариев" }, { v: 0, l: "картинок" }].map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
                  <div className="mono text-2xl font-extrabold text-white">{s.v}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-mist">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* живой телефон */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateY: -18, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateY: -8, rotateX: 4 }}
            transition={{ delay: 0.2, ...S.soft, damping: 24 }}
            style={{ perspective: 1400, x: px(p.x, -18), y: px(p.y, -14) }}
            className="relative mx-auto hidden lg:block"
          >
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <Show key={tv} live={playing} />
            </motion.div>
            <motion.div className="absolute -inset-12 -z-10 rounded-full bg-teal/18 blur-3xl" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 5, repeat: Infinity }} />
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 9, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-[0.45em] text-mist">
          прокрути
        </motion.div>
      </section>

      {/* ======================= КАТЕГОРИИ ======================= */}
      <section id="cats" className="relative mx-auto max-w-6xl px-5 py-24">
        <Head kicker="Каталог" title="Категории экранов" sub={`${CATEGORIES.length} наборов, покрывающих весь путь игрока: от онбординга до финала сезона.`} />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => <CatCard key={c.id} c={c} i={i} onClick={() => go(c.id)} />)}
        </div>
      </section>

      {/* ======================= ПОТОКИ ======================= */}
      <section className="relative mx-auto max-w-6xl px-5 py-20">
        <Head kicker="Сценарии" title="Экраны собираются в путь"
          sub={`${FLOWS.length} потока игрока: что за чем идёт, каким переходом склеено и сколько занимает в сессии.`} />
        <div className="mt-12"><FlowsPreview go={go} /></div>
      </section>

      {/* ======================= ВИТРИНА ======================= */}
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Head kicker="Витрина" title="Всё живое" sub="Каждый экран в каталоге играет собственный сценарий и реагирует на касания." />
        </div>
        <Strip />
      </section>

      {/* ======================= ВЕРСТАК ======================= */}
      <section className="relative mx-auto max-w-6xl px-5 py-24">
        <Head kicker="Верстак" title="Каталог, который настраивается"
          sub={`Двигай ползунки — физика пересчитывается во всех ${ALL.length} экранах сразу. Дальше забираешь готовый конфиг и вставляешь в проект.`} />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            {[
              { Icon: IcGauge, t: "1 · Настрой физику", d: "Пресеты Snappy / Juicy / Cinematic / Reduced или ручные ползунки темпа, упругости, массы, каскада, импакта и частиц." },
              { Icon: IcLayers, t: "2 · Проверь на сценах", d: "Любой экран каталога перезапускается с новыми параметрами. Видно сразу, где сцена рассыпалась." },
              { Icon: IcCode, t: "3 · Забери конфиг", d: "Тюнер генерирует готовый config.ts с пружинами, шагом каскада и множителями. Копируешь одной кнопкой." },
              { Icon: IcCheck, t: "4 · Пройди чеклист", d: "У каждого экрана свой список проверок, типовых ловушек и стоимости по кадрам." },
              { Icon: IcBook, t: "5 · Отдай спеку в разработку", d: "Кнопка в категории и в лаборатории собирает Markdown-хендофф: физика, партитуры, чеклисты, код." },
            ].map((x, i) => (
              <RevealRow key={x.t} i={i}>
                <div className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal/14 text-teal"><x.Icon size={20} /></span>
                  <div>
                    <div className="text-[14px] font-extrabold uppercase">{x.t}</div>
                    <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-mist">{x.d}</p>
                  </div>
                </div>
              </RevealRow>
            ))}
            <div className="pt-2"><SiteButton onClick={() => go("lab")} icon={<IcGauge size={16} />}>открыть лабораторию</SiteButton></div>
          </div>
          <Tuner />
        </div>
      </section>

      {/* ======================= ИНДЕКС ======================= */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8">
        <Head kicker="Индекс" title="Найти экран под задачу" sub={`Все ${ALL.length} экранов одним списком: поиск по названию, тегу или категории. Быстрее — через ⌘K.`} />
        <AssetIndex go={go} />
      </section>

      {/* ======================= ПРАВИЛА ======================= */}
      <section id="rules" className="relative mx-auto max-w-6xl px-5 py-24">
        <Head kicker="Передаю 99%" title={`${PRINCIPLES.length} правил моушена`} sub="Свод, по которому собран весь каталог. Без них экраны выглядят как сайт, а не как игра." />
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((r, i) => <Rule key={r.n} r={r} i={i} />)}
        </div>
      </section>

      <footer className="border-t border-white/8 px-5 py-10 text-center">
        <div className="mono text-[10px] font-bold uppercase tracking-[0.3em] text-mist">
          СИГНАЛ · motion asset catalog · react + motion · svg only · no gif / no video
        </div>
      </footer>
    </div>
  );
}

/* ---------- части главной ---------- */
function Line({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      {text.split("").map((ch, i) => (
        <motion.span key={i} className="inline-block will-change-transform"
          initial={{ y: "100%", opacity: 0, rotateX: -70 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ delay: delay + i * 0.045, ...S.pop, damping: 16 }}
          style={{ transformOrigin: "bottom" }}>{ch}</motion.span>
      ))}
    </span>
  );
}

export function SiteButton({ children, onClick, ghost, icon }: any) {
  return (
    <motion.button
      onClick={() => { feel("confirm"); onClick?.(); }}
      whileHover={{ y: -2, scale: 1.02 }} whileTap={{ y: 2, scale: 0.98 }} transition={S.snap}
      className="relative overflow-hidden rounded-2xl px-6 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.15em]"
      style={ghost
        ? { background: "linear-gradient(180deg,#242f49,#1a2338)", color: "#cfe0f7", boxShadow: "0 4px 0 #121a2c, inset 0 1px 0 rgba(255,255,255,.12)" }
        : { background: "linear-gradient(180deg,#54dcb6,#2a9b81)", color: "#06231c", boxShadow: "0 5px 0 #186050, 0 18px 30px -14px #3ec9a7" }}
    >
      <span className="relative z-10 flex items-center gap-2">{icon}{children}</span>
      {!ghost && <span className="sheen absolute inset-0" />}
    </motion.button>
  );
}

function Head({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={S.soft}>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.45em] text-teal">{kicker}</div>
        <h2 className="title-xl mt-3 text-5xl uppercase sm:text-6xl">{title}</h2>
        {sub && <p className="mt-4 max-w-xl text-[14px] font-bold leading-relaxed text-mist">{sub}</p>}
      </motion.div>
    </div>
  );
}

function CatCard({ c, i, onClick }: any) {
  const t = useTilt(9);
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const Icon = CAT_ICON[c.id] ?? IcTrend;
  return (
    <div ref={ref} style={{ perspective: 1100 }}>
      <motion.button
        onClick={() => { feel("confirm"); onClick(); }}
        ref={t.ref as any}
        onPointerMove={t.onMove}
        onPointerLeave={t.onLeave}
        initial={{ opacity: 0, y: 46, filter: "blur(10px)" }}
        animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ delay: (i % 3) * 0.08, duration: 0.7, ease: E.out }}
        style={{ rotateX: t.rx, rotateY: t.ry }}
        className="group relative block w-full overflow-hidden rounded-3xl border border-white/8 bg-[#121a2c] p-6 text-left"
      >
        <motion.div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl" style={{ background: c.color + "33" }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.span whileHover={{ rotate: -8, scale: 1.12 }} transition={S.pop}
          className="relative grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: c.color + "1e", color: c.color, boxShadow: `inset 0 0 0 1px ${c.color}55` }}>
          <Icon size={26} />
        </motion.span>
        <h3 className="title-xl relative mt-5 text-[26px] uppercase">{c.name}</h3>
        <div className="relative mt-1 text-[10px] font-extrabold uppercase tracking-[0.25em]" style={{ color: c.color }}>{c.tagline}</div>
        <p className="relative mt-3 text-[13px] font-bold leading-relaxed text-mist">{c.desc}</p>
        <div className="relative mt-6 flex items-center justify-between">
          <span className="mono text-[10px] font-bold uppercase tracking-[0.25em] text-mist">{c.assets.length} экранов</span>
          <motion.span className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: c.color + "55", color: c.color }}
            whileHover={{ x: 5 }}><IcArrow size={16} /></motion.span>
        </div>
      </motion.button>
    </div>
  );
}

function Strip() {
  const { ref, inView } = useInView<HTMLDivElement>(0.05);
  const [i, setI] = useState(0);
  const pick = ["round", "pack", "profile", "finale", "bestiary", "duel", "vault", "event", "shop", "lesson"];
  const items = pick.map((id) => ALL.find((a) => a.id === id)!).filter(Boolean);
  const playing = usePlaying();
  return (
    <div ref={ref} className="no-bar mt-10 flex gap-6 overflow-x-auto px-5 pb-6">
      {items.map((a, k) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 50, scale: 0.94 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: k * 0.07, duration: 0.7, ease: E.out }}
          onHoverStart={() => setI(k)}
          className="relative shrink-0"
          style={{ zIndex: i === k ? 10 : 1 }}
        >
          <motion.div animate={{ y: i === k ? -14 : 0, scale: i === k ? 1.04 : 1 }} transition={S.soft}>
            <a.Comp live={playing && inView && Math.abs(i - k) < 3} />
          </motion.div>
          <div className="mt-3 text-center">
            <div className="text-[12px] font-extrabold uppercase">{a.title}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: a.cat.color }}>{a.cat.name}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const TAG_SET = (() => {
  const m = new Map<string, number>();
  ALL.forEach((a) => a.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22);
})();

function AssetIndex({ go }: { go: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const list = ALL.filter((a) => {
    const hay = `${a.title} ${a.sub} ${a.tags.join(" ")} ${a.cat.name}`.toLowerCase();
    const okQ = hay.includes(q.toLowerCase().trim());
    const okT = !tag || a.tags.includes(tag);
    return okQ && okT;
  });
  return (
    <div className="mt-8">
      <TagCloud tag={tag} setTag={setTag} />
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-mist"><IcTarget size={16} /></span>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="стакан, layoutId, лут, переход, каскад…"
          className="w-full bg-transparent text-[13px] font-bold text-white outline-none placeholder:text-mist/60"
        />
        <span className="mono shrink-0 text-[11px] font-bold text-mist">{list.length}/{ALL.length}</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/8">
        <AnimatePresence initial={false}>
          {list.map((a, i) => (
            <motion.button
              key={a.id}
              layout
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              transition={{ ...S.soft, delay: Math.min(i * 0.02, 0.2) }}
              onClick={() => { feel("confirm"); go(a.cat.id); }}
              whileHover={{ x: 5 }}
              className="flex w-full items-center gap-3 border-b border-white/6 bg-white/[0.015] px-4 py-3 text-left last:border-0 hover:bg-white/[0.05]"
            >
              <span className="mono w-7 shrink-0 text-[11px] font-extrabold" style={{ color: a.cat.color }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="w-44 shrink-0 text-[13px] font-extrabold uppercase">{a.title}</span>
              <span className="hidden flex-1 truncate text-[11.5px] font-bold text-mist sm:block">{a.sub}</span>
              <span className="hidden gap-1.5 md:flex">
                {a.tags.slice(0, 3).map((t) => (
                  <span key={t} className="mono rounded-full border border-white/10 px-2 py-[2px] text-[9px] font-bold text-mist">{t}</span>
                ))}
              </span>
              <span className="mono ml-auto shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider"
                style={{ background: a.cat.color + "1e", color: a.cat.color }}>{a.cat.name}</span>
              <span className="shrink-0 text-mist"><IcArrow size={15} /></span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TagCloud({ tag, setTag }: { tag: string | null; setTag: (v: string | null) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className="mb-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-mist">фильтр по тегу</div>
        {tag && (
          <button onClick={() => setTag(null)}
            className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-teal">
            сбросить <IcClose size={11} />
          </button>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {TAG_SET.map(([t, n], i) => {
          const on = tag === t;
          return (
            <motion.button key={t}
              initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: Math.min(i * 0.025, 0.4), ...S.snap }}
              whileTap={{ scale: 0.93 }}
              onClick={() => { feel("tap"); setTag(on ? null : t); }}
              className="relative rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wider"
              style={{
                background: on ? "#3ec9a7" : "rgba(255,255,255,.035)",
                color: on ? "#06231c" : "#8fa4c7",
                boxShadow: on ? "0 8px 18px -10px #3ec9a7" : "inset 0 0 0 1px rgba(255,255,255,.07)",
              }}>
              {t}
              <span className="mono ml-1.5 text-[8.5px] font-bold" style={{ opacity: on ? 0.75 : 0.55 }}>{n}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function RevealRow({ children, i = 0 }: any) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.07, duration: 0.6, ease: E.out }}>{children}</motion.div>
  );
}

function Rule({ r, i }: any) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: i % 2 ? 30 : -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: (i % 2) * 0.05, duration: 0.6, ease: E.out }}
      whileHover={{ x: 6 }}
      onHoverStart={() => feel("tap", 5)}
      className="group flex gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition-colors hover:border-teal/40"
    >
      <span className="mono text-xl font-extrabold text-white/15 transition-colors group-hover:text-teal">{r.n}</span>
      <div>
        <div className="text-[14px] font-extrabold uppercase">{r.t}</div>
        <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-mist">{r.d}</p>
      </div>
    </motion.div>
  );
}
