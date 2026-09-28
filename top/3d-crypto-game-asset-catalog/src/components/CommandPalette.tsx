import { useEffect, useMemo, useRef, useState } from "react";
import { CATALOG } from "../catalog";
import { Icon, type IconName } from "./Icon";
import { settings, COLOR_MODES } from "../lib/settings";
import { soundStore, tap, notify } from "../lib/fx";
import { wallet } from "../lib/wallet";
import { particles } from "../lib/particles";
import { cn } from "../utils/cn";

type Cmd = { id: string; title: string; sub: string; icon: IconName; tone: string; run: () => void; group: string };

function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.animate([{ boxShadow: "0 0 0 0 rgba(61,155,255,.9)" }, { boxShadow: "0 0 0 14px rgba(61,155,255,0)" }], { duration: 900, delay: 400 });
}

/** fuzzy: all query chars appear in order; score favours contiguous & early matches */
function score(q: string, s: string) {
  if (!q) return 1;
  const t = s.toLowerCase();
  const direct = t.indexOf(q);
  if (direct >= 0) return 100 - direct;
  let i = 0, sc = 0, prev = -2;
  for (const ch of q) {
    const j = t.indexOf(ch, i);
    if (j < 0) return 0;
    sc += j === prev + 1 ? 3 : 1;
    prev = j;
    i = j + 1;
  }
  return sc;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const cmds = useMemo<Cmd[]>(() => {
    const actions: Cmd[] = [
      { id: "a-proto", group: "Действия", title: "Открыть играбельный прототип", sub: "10 экранов в телефоне", icon: "play", tone: "text-bull", run: () => jump("prototype") },
      { id: "a-sound", group: "Действия", title: "Звук вкл/выкл", sub: "WebAudio эффекты", icon: "volume", tone: "text-sky", run: () => soundStore.set(!soundStore.get()) },
      { id: "a-motion", group: "Действия", title: "Меньше движения", sub: "Отключить анимации", icon: "eyeOff", tone: "text-violet", run: () => settings.set({ reduced: !settings.get().reduced }) },
      { id: "a-cb", group: "Действия", title: "Сменить цветовой режим", sub: "Дальтонизм · монохром", icon: "eye", tone: "text-gold", run: () => { const i = COLOR_MODES.findIndex((m) => m.v === settings.get().cb); const n = COLOR_MODES[(i + 1) % COLOR_MODES.length]; settings.set({ cb: n.v }); notify(`Режим: ${n.label}`, "info"); } },
      { id: "a-gems", group: "Действия", title: "Дать себе 500 кристаллов", sub: "Чит для демо", icon: "gem", tone: "text-sky", run: () => particles.flyFrom(null, "gems", "gem", 12, () => wallet.add({ gems: 500 })) },
      { id: "a-party", group: "Действия", title: "Конфетти!", sub: "Проверить движок частиц", icon: "sparkles", tone: "text-flame", run: () => particles.burst(window.innerWidth / 2, window.innerHeight / 2, { count: 90, speed: 800 }) },
    ];
    const assets: Cmd[] = CATALOG.flatMap((c) => c.assets.map((a) => ({ id: a.id, group: c.title, title: `${a.id} · ${a.title}`, sub: a.desc, icon: c.icon, tone: c.tone, run: () => jump(a.id) })));
    return [...actions, ...assets];
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cmds.map((c) => ({ c, s: Math.max(score(s, c.title), score(s, c.sub) * 0.6, score(s, c.group) * 0.5) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.c);
  }, [q, cmds]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); tap("whoosh"); }
      else if (e.key === "Escape") setOpen(false);
    };
    const openEv = () => setOpen(true);
    window.addEventListener("keydown", k);
    window.addEventListener("open-palette", openEv);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("open-palette", openEv); };
  }, []);
  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);
  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector(`[data-i="${idx}"]`)?.scrollIntoView({ block: "nearest" }); }, [idx]);

  if (!open) return null;
  const run = (c: Cmd) => { tap(); setOpen(false); setTimeout(c.run, 60); };
  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-sm animate-fade" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="panel w-full max-w-xl overflow-hidden animate-zoom-in" role="dialog" aria-label="Командная палитра">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <Icon name="search" size={20} className="text-ink-400" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ассет, категория или действие…"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); tap("tick", 0); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); tap("tick", 0); }
              if (e.key === "Enter" && list[idx]) run(list[idx]);
            }}
            className="flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-ink-500" />
          <kbd className="rounded-md border-b-2 border-ink-900 bg-ink-700 px-1.5 font-mono text-[10px]">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {!list.length && <div className="p-6 text-center text-sm text-ink-400">Ничего не найдено</div>}
          {list.map((c, i) => {
            const head = c.group !== lastGroup && !q ? c.group : null;
            lastGroup = c.group;
            return (
              <div key={c.id}>
                {head && <div className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[.18em] text-ink-500">{head}</div>}
                <button data-i={i} onMouseEnter={() => setIdx(i)} onClick={() => run(c)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", i === idx ? "bg-sky/15" : "hover:bg-white/5")}>
                  <span className={cn("flex size-8 items-center justify-center rounded-lg bg-ink-850", c.tone)}><Icon name={c.icon} size={16} stroke={2.4} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{c.title}</span><span className="block truncate text-[11px] text-ink-400">{c.sub}</span></span>
                  {i === idx && <Icon name="chevR" size={16} className="text-sky" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-white/5 px-4 py-2 text-[10px] font-bold text-ink-500">
          <span>↑↓ навигация</span><span>↵ открыть</span><span className="ml-auto">{list.length} результатов</span>
        </div>
      </div>
    </div>
  );
}
