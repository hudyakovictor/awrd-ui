import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icons";
import { sfx, soundState, useSoundEnabled } from "../lib/sound";
import { useGame } from "../lib/game";
import { cn } from "../utils/cn";
import { clamp } from "../lib/motion";

/* =====================================================================
 * COMMAND PALETTE — Cmd+K: fuzzy search across every asset, jump to it
 * ===================================================================== */
export type Entry = { code: string; title: string; section: string; tags: string };
export function collectEntries(): Entry[] {
  if (typeof document === "undefined") return [];
  const out: Entry[] = [];
  document.querySelectorAll<HTMLElement>("[data-asset]").forEach((el) => {
    const code = el.querySelector("span.font-mono")?.textContent ?? "";
    const title = el.querySelector("h3")?.textContent ?? "";
    const section = el.closest("[data-section]")?.id ?? "";
    if (code && title) out.push({ code, title, section, tags: `${code} ${title} ${section}`.toLowerCase() });
  });
  return out;
}
function fuzzy(q: string, t: string) {
  q = q.toLowerCase();
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += i === qi ? 3 : 1;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEntries(collectEntries());
        setQ("");
        setHi(0);
        setOpen((o) => !o);
        sfx("pop");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 60);
  }, [open ]);
  const results = useMemo(() => {
    if (!q.trim()) return entries.slice(0, 9);
    return entries
      .map((e) => ({ e, s: Math.max(fuzzy(q, e.title.toLowerCase()), fuzzy(q, e.code.toLowerCase()) - 1, fuzzy(q, e.section) - 2) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((x) => x.e);
  }, [q, entries]);
  const jump = (e: Entry) => {
    setOpen(false);
    const el = [...document.querySelectorAll("[data-asset]")].find((n) => n.querySelector("h3")?.textContent === e.title);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      sfx("whoosh");
      setTimeout(() => {
        (el as HTMLElement).animate(
          [{ boxShadow: "0 6px 0 #081231, 0 0 0 4px #2fd4ff" }, { boxShadow: "0 6px 0 #081231, 0 0 0 0px transparent" }],
          { duration: 1200, easing: "ease-out" },
        );
      }, 500);
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/70 p-4 pt-[12vh] backdrop-blur-sm" style={{ animation: "fade-in .2s both" }} onClick={() => setOpen(false)}>
      <div className="panel w-full max-w-xl overflow-hidden rounded-3xl" style={{ animation: "drop .35s cubic-bezier(.3,1.3,.5,1) both" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-white/10 px-4">
          <Icon name="search" size={18} className="text-ink-400" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setHi(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setHi((h) => Math.min(results.length - 1, h + 1));
              if (e.key === "ArrowUp") setHi((h) => Math.max(0, h - 1));
              if (e.key === "Enter" && results[hi]) jump(results[hi]);
            }}
            placeholder="Jump to any asset… (quiz, boss, carousel)"
            className="h-14 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-ink-500"
          />
          <kbd className="rounded-md bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">esc</kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.map((r, i) => (
            <button
              key={r.code}
              onClick={() => jump(r)}
              onMouseEnter={() => setHi(i)}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", i === hi ? "bg-azure/20" : "")}
            >
              <span className="rounded-md bg-ink-950/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">{r.code}</span>
              <span className="flex-1 truncate text-sm font-extrabold text-white">{r.title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">{r.section}</span>
              {i === hi && <Icon name="chevronRight" size={14} className="text-cyan" />}
            </button>
          ))}
          {!results.length && <div className="p-6 text-center text-sm font-bold text-ink-500">No matches — try “swipe” or “chart”.</div>}
        </div>
        <div className="flex gap-4 border-t border-white/5 px-4 py-2.5 text-[10px] font-bold text-ink-500">
          <span>↑↓ navigate</span>
          <span>↵ jump</span>
          <span className="ml-auto">{entries.length} assets indexed</span>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * SETTINGS DRAWER — sound mixer, haptics, motion, cursor trail
 * ===================================================================== */
export type Prefs = { sfxVol: number; haptics: boolean; trail: boolean; motion: boolean };
const DEFAULTS: Prefs = { sfxVol: 0.45, haptics: true, trail: true, motion: true };
export function loadPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("tl-prefs") || "{}") };
  } catch {
    return DEFAULTS;
  }
}
export function SettingsDrawer({ prefs, setPrefs }: { prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useSoundEnabled();
  const set = (k: keyof Prefs, v: number | boolean) => {
    const n = { ...prefs, [k]: v };
    setPrefs(n);
    try {
      localStorage.setItem("tl-prefs", JSON.stringify(n));
    } catch {
      /* noop */
    }
  };
  useEffect(() => {
    document.documentElement.style.setProperty("--sfx-vol", String(prefs.sfxVol));
    if (!prefs.motion) document.documentElement.classList.add("reduce-all-motion");
    else document.documentElement.classList.remove("reduce-all-motion");
  }, [prefs]);
  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          sfx("select");
        }}
        className="fixed bottom-24 left-4 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-ink-800/90 text-ink-200 shadow-[0_5px_0_#081231] ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-1 hover:text-white sm:bottom-5 sm:left-5"
        title="Settings"
      >
        <Icon name="gear" size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-ink-950/60 backdrop-blur-sm" style={{ animation: "fade-in .2s both" }} onClick={() => setOpen(false)}>
          <div
            className="panel absolute bottom-0 left-0 top-0 flex w-[320px] flex-col rounded-l-none rounded-r-[28px] p-5"
            style={{ animation: "slide-in-left .4s cubic-bezier(.2,.9,.3,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-black text-white">Settings</div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white">
                <Icon name="x" size={16} stroke={3} />
              </button>
            </div>
            <div className="mt-5 space-y-5 overflow-y-auto">
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Sound FX</div>
                <div className="flex items-center gap-3 rounded-2xl bg-ink-950/50 p-3">
                  <button onClick={() => setSound(!sound)} className={cn("btn3d h-10 w-10 rounded-xl [--depth:3px]", sound ? "v-azure" : "v-ghost")}>
                    <Icon name={sound ? "volume" : "x"} size={16} />
                  </button>
                  <input type="range" min={0} max={100} value={soundState.get() ? prefs.sfxVol * 100 : 0} disabled={!sound} onChange={(e) => set("sfxVol", +e.target.value / 100)} className="flex-1" style={{ accentColor: "#3e8bff" }} />
                  <span className="w-10 text-right font-mono text-xs font-bold text-ink-200">{Math.round(prefs.sfxVol * 100)}</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {(["pop", "success", "coin", "levelup"] as const).map((s) => (
                    <button key={s} onClick={() => sfx(s)} className="rounded-lg bg-ink-800 py-1.5 text-[10px] font-black uppercase text-ink-300 transition hover:bg-ink-700 hover:text-white active:translate-y-0.5">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {(
                [
                  ["haptics", "Haptics", "Vibration on taps & wins"],
                  ["trail", "Cursor trail", "Particle trail on desktop"],
                  ["motion", "Full motion", "Parallax, loops & ambient FX"],
                ] as [keyof Prefs, string, string][]
              ).map(([k, t, d]) => (
                <div key={k} className="flex items-center gap-3 rounded-2xl bg-ink-950/50 p-3">
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-white">{t}</div>
                    <div className="text-[11px] text-ink-400">{d}</div>
                  </div>
                  <button
                    onClick={() => {
                      set(k, !prefs[k]);
                      sfx("select");
                    }}
                    className={cn("relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300", prefs[k] ? "bg-bull" : "panel-inset")}
                  >
                    <span className="absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-white to-ink-200 shadow transition-all duration-300" style={{ left: prefs[k] ? 28 : 4 }} />
                  </button>
                </div>
              ))}
              <div className="rounded-2xl bg-ink-950/50 p-3 text-[11px] font-semibold text-ink-400">
                Shortcuts: <kbd className="rounded bg-ink-700 px-1 font-mono">⌘K</kbd> palette · <kbd className="rounded bg-ink-700 px-1 font-mono">/</kbd> search
              </div>
            </div>
            <div className="mt-auto pt-4 text-center text-[10px] font-bold text-ink-600">TRADELINGO UI KIT · v2.0</div>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================================================================
 * ACHIEVEMENT TOASTS — global unlock feed (top-center)
 * ===================================================================== */
type Ach = { id: number; t: string; d: string; icon: string; c: string };
let achId = 0;
const achSubs = new Set<(l: Ach[]) => void>();
let achList: Ach[] = [];
export function unlockAchievement(t: string, d: string, icon = "trophy", c = "#ffc23d") {
  const it = { id: ++achId, t, d, icon, c };
  achList = [it, ...achList].slice(0, 3);
  achSubs.forEach((f) => f(achList));
  sfx("unlock");
  setTimeout(() => {
    achList = achList.filter((x) => x.id !== it.id);
    achSubs.forEach((f) => f(achList));
  }, 4200);
}
export function AchievementToasts() {
  const [list, setList] = useState<Ach[]>([]);
  useEffect(() => {
    achSubs.add(setList);
    return () => {
      achSubs.delete(setList);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {list.map((a) => (
        <div key={a.id} className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-3 shadow-[0_8px_0_#081231,0_20px_40px_rgba(0,0,0,.5)] backdrop-blur-xl" style={{ animation: "drop .5s cubic-bezier(.3,1.4,.5,1) both" }}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: a.c, boxShadow: `0 3px 0 color-mix(in srgb, ${a.c} 50%, black)` }}>
            <Icon name={a.icon} size={22} stroke={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gold">Achievement unlocked</div>
            <div className="truncate font-display text-sm font-black text-white">{a.t}</div>
            <div className="truncate text-[11px] font-semibold text-ink-300">{a.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
 * ONBOARDING TOUR — 4-step spotlight for first-time visitors
 * ===================================================================== */
const TOUR = [
  { sel: '[data-hud="xp"]', t: "One shared economy", d: "Every game pays XP, coins and gems into this dock. Try winning any mini-game!" },
  { sel: '[data-asset]', t: "130 live assets", d: "Each card is playable — press ↻ to replay its animations. LIVE means it's animating now." },
  { sel: "#global-search", t: "Instant search", d: "Press / and type “boss”, “swipe” or “chart” to filter the whole catalog." },
  { sel: 'nav a[href="#motion"]', t: "Motion lab", d: "25 gesture & scroll patterns: carousels, parallax, pinch zoom and more." },
];
export function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    try {
      if (localStorage.getItem("tl-tour") === "done") return;
    } catch {
      /* noop */
    }
    const t = setTimeout(() => setStep(0), 1800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (step < 0 || step >= TOUR.length) return;
    const update = () => {
      const el = document.querySelector(TOUR[step].sel);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setRect(el.getBoundingClientRect()), 450);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step]);
  const done = () => {
    setStep(-1);
    try {
      localStorage.setItem("tl-tour", "done");
    } catch {
      /* noop */
    }
  };
  if (step < 0 || step >= TOUR.length || !rect) return null;
  const T = TOUR[step];
  const below = rect.bottom + 180 < window.innerHeight;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px]" onClick={done} />
      <div
        className="absolute rounded-2xl ring-4 ring-cyan transition-all duration-500"
        style={{ left: rect.left - 8, top: rect.top - 8 + window.scrollY - window.scrollY, width: rect.width + 16, height: rect.height + 16, boxShadow: "0 0 0 4000px rgba(5,11,28,.55), 0 0 40px rgba(47,212,255,.5)" }}
      />
      <div
        className="absolute w-[300px] rounded-2xl border border-white/10 bg-ink-800 p-4 shadow-2xl"
        style={{
          left: clamp(rect.left - 40, 12, window.innerWidth - 312),
          top: below ? rect.bottom + 20 : rect.top - 190,
          animation: "pop-in .35s cubic-bezier(.3,1.4,.5,1) both",
        }}
      >
        <div className="text-[10px] font-black uppercase tracking-widest text-cyan">
          Tour {step + 1}/{TOUR.length}
        </div>
        <div className="mt-1 font-display text-base font-black text-white">{T.t}</div>
        <div className="mt-1 text-xs font-semibold text-ink-300">{T.d}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={done} className="rounded-xl px-3 py-2 text-xs font-black text-ink-400 hover:text-white">
            Skip
          </button>
          <button
            onClick={() => {
              sfx("select");
              if (step + 1 >= TOUR.length) done();
              else setStep(step + 1);
            }}
            className="btn3d v-azure ml-auto h-9 rounded-xl px-4 text-xs [--depth:3px]"
          >
            {step + 1 >= TOUR.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * DAILY GIFT POPUP — appears once per session after 25s
 * ===================================================================== */
export function DailyGift() {
  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const g = useGame();
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 25000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm" style={{ animation: "fade-in .3s both" }}>
      <div className="panel relative w-full max-w-xs p-6 text-center" style={{ animation: "drop .5s cubic-bezier(.3,1.3,.5,1) both" }}>
        <button onClick={() => setShow(false)} className="absolute right-3 top-3 text-ink-400 hover:text-white">
          <Icon name="x" size={16} stroke={3} />
        </button>
        {!opened ? (
          <>
            <div className="anim-bounce-soft text-6xl">🎁</div>
            <div className="mt-3 font-display text-xl font-black text-white">A gift for you!</div>
            <div className="text-xs font-semibold text-ink-400">Thanks for exploring the catalog.</div>
            <button
              onClick={(e) => {
                setOpened(true);
                g.reward("gems", 25, e.currentTarget);
                setTimeout(() => g.reward("coins", 200, e.currentTarget), 400);
                unlockAchievement("Gifted", "Opened the visitor gift", "gift", "#ff7a2f");
              }}
              className="btn3d v-gold mt-4 h-12 w-full rounded-2xl text-sm"
            >
              Open gift
            </button>
          </>
        ) : (
          <>
            <div className="anim-pop text-6xl">💎</div>
            <div className="mt-3 font-display text-lg font-black text-white">+25 gems · +200 coins</div>
            <div className="text-xs font-semibold text-ink-400">Flying to your dock now…</div>
            <button onClick={() => setShow(false)} className="btn3d v-ghost mt-4 h-11 w-full rounded-2xl text-xs">
              Keep exploring
            </button>
          </>
        )}
      </div>
    </div>
  );
}
