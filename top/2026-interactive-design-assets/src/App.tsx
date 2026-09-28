import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Filter, Focus, Gamepad2, LayoutGrid, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BLOCKS, CATEGORIES, type Category } from "./blocks/registry";
import { FEATURED, QUICK_FILTERS, filtersOf, matchesFilters, slug, type QuickFilter } from "./blocks/tags";
import { BlockCard, CAT_COLORS } from "./components/BlockCard";
import { FlowPlayer } from "./components/FlowPlayer";
import { FocusView } from "./components/FocusView";
import { Hero } from "./components/Hero";
import { SidebarContent } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { VfxConsoleDock, VfxConsoleRail } from "./components/VfxConsole";
import { Mascot } from "./duo/Mascot";
import { DuoButton } from "./duo/ui";
import { FxProvider, useFx } from "./fx/fx";
import { Magnetic } from "./fx/Motion";
import { Stage } from "./fx/Stage";

export default function App() {
  return (
    <FxProvider>
      <Shell />
    </FxProvider>
  );
}

const FILTER_COLOR: Record<QuickFilter, string> = {
  "Most Interactive": "#f97316",
  "VFX Heavy": "#fbbf24",
  Drag: "#3b82f6",
  Swipe: "#60a5fa",
  Hold: "#8b5cf6",
  Sound: "#22c55e",
  Haptics: "#a78bfa",
  Mobile: "#4ade80",
  Experimental: "#ef4444",
};

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 1200);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="duo-btn duo-orange fixed bottom-24 right-4 z-40 !h-12 !w-12 !rounded-2xl !px-0 xl:bottom-12 xl:right-8"
        >
          <ArrowUp size={20} strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Shell() {
  const fx = useFx();
  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<QuickFilter[]>([]);
  const [view, setView] = useState<"grid" | "focus">("grid");
  const [focusId, setFocusId] = useState<string>(BLOCKS[0].id);
  const [drawer, setDrawer] = useState(false);
  const [flow, setFlow] = useState(false);
  const spyLock = useRef(0);

  const byQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCKS.filter((b) => !q || `${b.title} ${b.desc} ${b.category} ${b.tech.join(" ")}`.toLowerCase().includes(q));
  }, [query]);
  const list = useMemo(() => byQuery.filter((b) => matchesFilters(b, filters)), [byQuery, filters]);
  const groups = useMemo(() => CATEGORIES.map((c) => ({ c, items: list.filter((b) => b.category === c) })).filter((g) => g.items.length), [list]);
  const filterCount = useCallback((f: QuickFilter) => byQuery.filter((b) => matchesFilters(b, filters.includes(f) ? filters : [...filters, f])).length, [byQuery, filters]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: fx.reduced ? "auto" : "smooth", block: "start" });
  };

  /** Category click → smooth scroll to its group (keeps all blocks visible) */
  const jumpToCat = useCallback(
    (c: Category | "All") => {
      setActiveCat(c);
      spyLock.current = Date.now() + 1000;
      const target = c === "All" ? "catalog" : `cat-${slug(c)}`;
      const needsClear = c !== "All" && !list.some((b) => b.category === c);
      if (needsClear) {
        setQuery("");
        setFilters([]);
      }
      if (view === "focus") setView("grid");
      if (needsClear || view === "focus") requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(target)));
      else scrollToId(target);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list, view, fx.reduced]
  );

  /* scroll-spy: highlight the category group currently under the toolbar */
  useEffect(() => {
    if (view !== "grid") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cat]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < spyLock.current) return;
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveCat(vis[0].target.getAttribute("data-cat") as Category);
      },
      { rootMargin: "-200px 0px -55% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [groups, view]);

  const openFocus = (id: string) => {
    setFocusId(id);
    setView("focus");
    requestAnimationFrame(() => scrollToId("catalog"));
  };
  const toggleFilter = (f: QuickFilter) => {
    setFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
    fx.sfx("tick");
    fx.haptic(4);
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Search blocks"]')?.focus();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const sidebarProps = { cat: activeCat, setCat: jumpToCat, query, setQuery };
  const pills: (Category | "All")[] = ["All", ...CATEGORIES];
  const focusList = list.length ? list : BLOCKS;

  return (
    <div id="top" className="relative min-h-screen">
      <Stage />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[288px] border-r border-white/10 lg:block" style={{ background: "linear-gradient(175deg, rgba(17,25,46,.94), rgba(6,10,21,.97))", backdropFilter: "blur(12px)", boxShadow: "8px 0 30px rgba(1,2,8,.65)" }}>
        <SidebarContent {...sidebarProps} />
      </aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-[#03050c]/75 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-[300px] rounded-r-[28px] border-r border-white/10 lg:hidden" style={{ background: "linear-gradient(175deg, #131c33, #080d1c)" }} initial={{ x: "-104%" }} animate={{ x: 0 }} exit={{ x: "-104%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }}>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute right-3 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl text-white/60 hover:bg-white/10">
                <X size={20} strokeWidth={3} />
              </button>
              <SidebarContent {...sidebarProps} onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 lg:pl-[288px]">
        <TopBar query={query} setQuery={setQuery} onMenu={() => setDrawer(true)} onPlay={() => setFlow(true)} shown={list.length} total={BLOCKS.length} />

        <div className="mx-auto max-w-[1720px] gap-6 px-4 pb-28 pt-5 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            <Hero total={BLOCKS.length} scenes={FEATURED.size} onPlay={() => setFlow(true)} onFocus={() => openFocus(focusList[0].id)} />

            {/* lab toolbar */}
            <div className="sticky top-[68px] z-20 -mx-1 mt-5 px-1 pt-1 md:pt-2">
              <div className="rounded-2xl border border-white/10 p-2" style={{ background: "rgba(6,10,21,.9)", backdropFilter: "blur(14px)", boxShadow: "0 10px 30px rgba(1,2,8,.6)" }}>
                <div className="flex items-center gap-2">
                  <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto" role="tablist" aria-label="Jump to category">
                    {pills.map((c) => {
                      const count = c === "All" ? list.length : list.filter((b) => b.category === c).length;
                      const active = activeCat === c;
                      const col = c === "All" ? "#3b82f6" : CAT_COLORS[c];
                      return (
                        <button
                          key={c}
                          role="tab"
                          aria-selected={active}
                          onClick={() => { jumpToCat(c); fx.sfx("tick"); fx.haptic(4); }}
                          className="relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] font-black uppercase tracking-wide transition-colors"
                          style={{ color: active ? "#fff" : count ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.25)" }}
                        >
                          {active && (
                            <motion.span
                              layoutId="rail-active"
                              className="absolute inset-0 rounded-xl"
                              style={{ background: `linear-gradient(180deg, ${col}44, ${col}14)`, boxShadow: `inset 0 0 0 1.5px ${col}, 0 0 18px ${col}55` }}
                              transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative h-2 w-2 rounded-full" style={{ background: col, boxShadow: active ? `0 0 8px ${col}` : undefined, opacity: active ? 1 : 0.6 }} />
                          <span className="relative">{c}</span>
                          <span className="relative font-mono text-[11px] opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="inset-well flex shrink-0 gap-1 rounded-xl p-1" role="radiogroup" aria-label="View mode">
                    {([
                      ["grid", LayoutGrid, "Grid"],
                      ["focus", Focus, "Focus"],
                    ] as const).map(([v, I, l]) => (
                      <button
                        key={v}
                        role="radio"
                        aria-checked={view === v}
                        onClick={() => { if (v === "focus") openFocus(focusList.some((b) => b.id === focusId) ? focusId : focusList[0].id); else setView("grid"); fx.sfx("click"); }}
                        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-black uppercase tracking-wide transition-all"
                        style={view === v ? { background: "linear-gradient(180deg,#fb923c,#f97316)", color: "#fff", boxShadow: "0 3px 0 #c2410c" } : { color: "rgba(255,255,255,.5)" }}
                      >
                        <I size={14} strokeWidth={3} />
                        <span className="hidden sm:inline">{l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto border-t border-white/5 pt-2" aria-label="Quick filters">
                  <span className="flex shrink-0 items-center gap-1 pl-1 pr-1 text-[11px] font-black uppercase tracking-wider text-white/40">
                    <Filter size={12} strokeWidth={3} /> Filters
                  </span>
                  {QUICK_FILTERS.map((f) => {
                    const on = filters.includes(f);
                    const n = filterCount(f);
                    const col = FILTER_COLOR[f];
                    return (
                      <button
                        key={f}
                        aria-pressed={on}
                        disabled={!on && n === 0}
                        onClick={() => toggleFilter(f)}
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-black transition-all disabled:opacity-30"
                        style={on ? { borderColor: col, color: "#fff", background: `${col}30`, boxShadow: `0 0 12px ${col}44` } : { borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.62)", background: "rgba(255,255,255,.03)" }}
                      >
                        {on && <span className="h-1.5 w-1.5 rounded-full" style={{ background: col }} />}
                        {f}
                        <span className="font-mono text-[11px] opacity-60">{n}</span>
                      </button>
                    );
                  })}
                  {(filters.length > 0 || query) && (
                    <button onClick={() => { setFilters([]); setQuery(""); fx.sfx("close"); }} className="ml-1 flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-black text-[#fb923c] hover:text-white">
                      <X size={13} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div id="catalog" className="scroll-mt-[200px]" />

            {list.length === 0 ? (
              <div className="panel-glow mt-8 flex flex-col items-center rounded-[28px] px-6 py-16 text-center">
                <Mascot mood="sad" size={120} />
                <p className="font-display mt-4 text-2xl font-black">No blocks match</p>
                <p className="mt-2 max-w-[42ch] text-[15px] font-bold text-white/55">Remove a filter or clear the search to see all {BLOCKS.length} blocks again.</p>
                <DuoButton tone="blue" className="mt-6" onClick={() => { setQuery(""); setFilters([]); fx.sfx("click"); }}>
                  Clear filters
                </DuoButton>
              </div>
            ) : view === "focus" ? (
              <FocusView list={focusList} id={focusList.some((b) => b.id === focusId) ? focusId : focusList[0].id} setId={setFocusId} onExit={() => setView("grid")} />
            ) : (
              <div className="mt-2">
                {groups.map((g) => {
                  const col = CAT_COLORS[g.c];
                  return (
                    <section key={g.c} id={`cat-${slug(g.c)}`} data-cat={g.c} className="scroll-mt-[200px] pt-8">
                      <motion.div initial={fx.reduced ? false : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ type: "spring", stiffness: 200, damping: 24 }} className="mb-5 flex items-center gap-3">
                        <span className="font-display rounded-xl px-3 py-1.5 text-[13px] font-black uppercase tracking-wider" style={{ color: col, background: `${col}1c`, boxShadow: `inset 0 0 0 1.5px ${col}66, 0 0 18px ${col}22` }}>
                          {g.c}
                        </span>
                        <span className="font-mono text-[13px] font-bold text-white/40">{g.items.length} blocks</span>
                        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${col}66, transparent)` }} />
                      </motion.div>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,370px),1fr))] gap-6">
                        {g.items.map((b, i) => (
                          <BlockCard key={b.id} b={b} i={i} onFocus={() => openFocus(b.id)} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            <footer className="panel-glow mt-14 flex flex-col items-start justify-between gap-6 rounded-[26px] p-7 md:flex-row md:items-center">
              <div>
                <div className="font-display flex items-center gap-2 text-xl font-black">
                  signal<span className="glow-ember">fx</span> <span className="chip">interactive lab</span>
                </div>
                <p className="mt-2 max-w-[60ch] text-[14.5px] font-bold leading-relaxed text-white/50">
                  {BLOCKS.length} standalone interactive blocks for later selection and composition. Every block keeps its own trigger, timing, haptics, sound and reduced-motion fallback.
                </p>
              </div>
              <Magnetic>
                <button onClick={() => { fx.sfx("fanfare"); setFlow(true); }} className="duo-btn duo-orange animate-glow-pulse">
                  <Gamepad2 size={19} strokeWidth={2.6} /> Play Full Loop
                </button>
              </Magnetic>
            </footer>
            {/* filter usage hint for large tag sets */}
            <span className="sr-only">{BLOCKS.filter((b) => filtersOf(b).size > 0).length} blocks tagged</span>
          </main>

          <aside className="hidden xl:block" aria-label="VFX Console">
            <div className="sticky top-[84px] max-h-[calc(100vh-110px)] overflow-y-auto pb-6 no-scrollbar">
              <VfxConsoleRail />
            </div>
          </aside>
        </div>
      </div>

      <VfxConsoleDock />
      <BackToTop />
      <FlowPlayer open={flow} onClose={() => setFlow(false)} />
    </div>
  );
}
