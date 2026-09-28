import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Hand, Sparkles as SparkIco } from "lucide-react";
import { Btn } from "./lib/ui";
import { Blobs, Candles, Dust, Sparkles } from "./lib/fx";
import { GALLERY, Game, Phone, StaticScreen } from "./game/Game";
import Academy from "./game/Academy";
import { PaletteGrid, Playground, Principles, Section, Typography } from "./showcase/Sections";
import { cn } from "./utils/cn";

const NAV = [
  ["hero", "Обзор"], ["screens", "Экраны"], ["academy", "Академия"],
  ["interact", "Интерактив"], ["palette", "Палитра"], ["type", "Шрифты"], ["rules", "Правила"],
] as const;

/** keeps the 340px device inside narrow viewports */
function useFitScale(w = 340, pad = 44) {
  const [s, setS] = useState(1);
  useEffect(() => {
    const f = () => setS(Math.min(1, (window.innerWidth - pad) / w));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, [w, pad]);
  return s;
}

export default function App() {
  const [active, setActive] = useState("hero");
  const fit = useFitScale();

  useEffect(() => {
    const ob = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) ob.observe(el); });
    return () => ob.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0" style={{ background: "radial-gradient(1200px 800px at 50% -5%, #14295c 0%, #08122c 48%, #04081a 100%)" }} />
      <div className="fixed inset-0 opacity-40"><Candles n={40} op={0.12} /></div>
      <div className="fixed inset-0"><Blobs /></div>
      <div className="fixed inset-0 grid-bg opacity-30" />
      <div className="fixed inset-0"><Dust n={14} /></div>

      <header className="sticky top-0 z-50 border-b border-line/25 backdrop-blur-xl" style={{ background: "rgba(6,13,32,.75)" }}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[12px] text-[#04303f]"
              style={{ background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 0 #056a80, 0 4px 14px -3px rgba(24,226,198,.6)" }}>
              <SparkIco size={18} strokeWidth={2.8} />
            </span>
            <div className="leading-none">
              <div className="hd hd-thin text-[15px] uppercase">Signal Arena</div>
              <div className="font-num text-[9px] font-medium uppercase tracking-[.2em] text-teal/70">crypto-edu game ui</div>
            </div>
          </div>
          <nav className="no-sb ml-auto hidden items-center gap-1 overflow-x-auto md:flex">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`}
                className={cn("rounded-full px-3 py-1.5 font-display text-[11.5px] font-extrabold uppercase italic tracking-wide transition-colors",
                  active === id ? "text-[#04303f]" : "text-sky/55 hover:text-sky")}
                style={active === id ? { background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.55), inset 0 -3px 0 #056a80" } : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <span className="ml-auto rounded-full bg-gold/15 px-2.5 py-1 font-num text-[10px] font-semibold uppercase tracking-wider text-gold md:ml-0"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,209,74,.3)" }}>v2.0</span>
        </div>
      </header>

      <main className="relative">
        {/* ═══ HERO ═══ */}
        <section id="hero" className="relative mx-auto max-w-[1280px] px-5 pb-8 pt-10 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="relative max-w-xl">
              <Sparkles n={5} />
              <span className="inline-flex items-center gap-2 rounded-full bg-teal/12 px-3 py-1.5 font-num text-[10.5px] font-semibold uppercase tracking-[.2em] text-teal"
                style={{ boxShadow: "inset 0 0 0 1px rgba(31,240,200,.3)" }}>
                crypto education · casual battle · 2026
              </span>
              <h1 className="hd mt-4 text-[46px] leading-[.88] sm:text-[64px] md:text-[76px]">
                SIGNAL<br />
                <span className="grad-teal" style={{ WebkitTextStrokeColor: "#06364a" }}>ARENA</span>
              </h1>
              <p className="mt-5 font-body text-[15px] font-bold leading-relaxed text-sky/70 md:text-[16px]">
                Мобильная игра-школа трейдинга: живой график свечей, и лишь верное чтение
                паттерна бьёт монстра психологии рынка. Полный UI-кит: 12 экранов, живая
                боевая система, академия свечных фигур и библиотека сочных компонентов.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#screens"><Btn color="teal" size="lg">Смотреть экраны <ArrowDown size={16} /></Btn></a>
                <a href="#interact"><Btn color="navy" size="lg">Интерактив</Btn></a>
              </div>
              <div className="mt-7 flex flex-wrap gap-6">
                {[["12", "экранов"], ["60fps", "живой график"], ["7", "паттернов"], ["30+", "VFX-приёмов"]].map(([n, l]) => (
                  <div key={l}>
                    <div className="hd grad-gold text-[30px] leading-none" style={{ WebkitTextStrokeColor: "#5a3405" }}>{n}</div>
                    <div className="font-display text-[10.5px] font-bold uppercase tracking-wide text-sky/45">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto">
              <div className="absolute inset-[-14%] rounded-full bg-teal/12 blur-[70px]" />
              <motion.div initial={{ opacity: 0, y: 40, rotateY: -12 }} animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }} className="relative">
                <Game scale={fit} />
              </motion.div>
              <div className="mt-6 flex items-center justify-center gap-2 font-display text-[11.5px] font-extrabold uppercase italic tracking-wide text-teal">
                <Hand size={14} /> Живой прототип — можно сыграть бой
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SCREENS ═══ */}
        <Section id="screens" n="01" title="Экраны" sub="Полный пользовательский путь: загрузка, меню, карта с уроками, трейдинг-бой, сундук победы, академия, магазин. Все телефоны рендерят те же компоненты, что и живой прототип.">
          <div className="no-sb -mx-5 flex gap-6 overflow-x-auto px-5 pb-4 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible">
            {GALLERY.map((g, i) => (
              <motion.div key={g.id} initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ delay: (i % 4) * 0.07, type: "spring", stiffness: 120, damping: 20 }}
                className="shrink-0">
                <div className="pointer-events-none select-none">
                  <Phone scale={0.72} label={g.label}>
                    <StaticScreen id={g.id} />
                  </Phone>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══ ACADEMY ═══ */}
        <Section id="academy" n="02" title="Академия паттернов" sub="Образовательное ядро: каждая победа открывает разбор реальной свечной фигуры. Переверните карточку, чтобы прочитать урок.">
          <div className="mx-auto max-w-[420px]">
            <div className="phone" style={{ width: "100%", height: "auto", borderRadius: 34 }}>
              <div className="relative flex h-[620px] flex-col overflow-hidden rounded-[34px]" style={{ background: "linear-gradient(180deg,#0d1d44,#0a1735 50%,#071230)" }}>
                <div className="grid-bg absolute inset-0 opacity-40" />
                <div className="relative z-10 mt-8 flex min-h-0 flex-1 flex-col">
                  <Academy unlocked={new Set(["hammer", "bullEng", "shoot"])} />
                </div>
              </div>
            </div>
            <p className="mt-5 text-center font-body text-[12.5px] font-bold text-sky/50">
              В бою аналитика подсказывает сразу, но серия верных — только если читать график самому.
            </p>
          </div>
        </Section>

        {/* ═══ INTERACT ═══ */}
        <Section id="interact" n="03" title="Интерактив и сок" sub="Физика наружу: 3D-наклон, магнитные кнопки, взрывы частиц. Кликните всё — это и есть система микровзаимодействий проекта.">
          <Playground />
        </Section>

        {/* ═══ PALETTE ═══ */}
        <Section id="palette" n="04" title="Палитра" sub="Тёмно-синяя база + бирюзовый сигнал. Нажмите, чтобы скопировать HEX.">
          <PaletteGrid />
          <div className="pnl noise mt-4 overflow-hidden p-0">
            <div className="flex h-16">
              {["#04081A", "#0A1735", "#16305F", "#2F5CB0", "#63B3FF", "#1FF0C8", "#11C3E8", "#4CEB96", "#FFD14A", "#FF9B1F", "#FF4D8D", "#9A6BFF", "#FF5C6E"].map((c) => (
                <div key={c} className="flex-1 transition-[flex] duration-300 hover:flex-[2.2]" style={{ background: c }} />
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ TYPE ═══ */}
        <Section id="type" n="05" title="Типографика" sub="Три гарнитуры с кириллицей, у каждой строгая роль.">
          <Typography />
        </Section>

        {/* ═══ RULES ═══ */}
        <Section id="rules" n="06" title="Правила стиля" sub="Шесть принципов, по которым собран интерфейс.">
          <Principles />
        </Section>

        <footer className="relative mx-auto max-w-[1280px] px-5 pb-16">
          <div className="pnl noise relative overflow-hidden p-8 text-center">
            <div className="absolute inset-0 opacity-30"><Candles n={24} op={0.3} /></div>
            <div className="relative">
              <div className="hd text-[28px] uppercase leading-none md:text-[36px]">Обучение, замаскированное под игру</div>
              <p className="mx-auto mt-3 max-w-lg font-body text-[13px] font-bold leading-relaxed text-sky/55">
                Каждый экран готов к передаче в разработку: токены, роли шрифтов, компоненты и
                живой боевой прототип — единая система на React + canvas-графике 60 fps.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a href="#hero"><Btn color="teal" size="lg">Ещё бой</Btn></a>
                <a href="#academy"><Btn color="gold" size="lg">В академию</Btn></a>
              </div>
              <div className="mt-7 font-num text-[10px] font-medium uppercase tracking-[.25em] text-sky/35">
                Signal Arena · crypto-edu ui kit · для hudyakovictor
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
