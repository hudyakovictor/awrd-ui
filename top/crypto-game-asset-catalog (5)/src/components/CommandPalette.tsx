import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

export type PaletteItem = { id: string; l: string; i: string };

/** Global ⌘K / Ctrl+K palette: fuzzy search sections, arrow keys, Enter to jump */
export function CommandPalette({ items, open, setOpen }: { items: PaletteItem[]; open: boolean; setOpen: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!open); sfx.whoosh(); }
      if (e.key === "Escape" && open) setOpen(false);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, setOpen]);

  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inp.current?.focus(), 30); } }, [open]);

  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.map((it) => ({ it, score: 0, hit: [] as number[] }));
    return items
      .map((it) => {
        const name = it.l.toLowerCase();
        let j = 0, score = 0;
        const hit: number[] = [];
        for (let i = 0; i < name.length && j < s.length; i++) if (name[i] === s[j]) { hit.push(i); score += i === 0 || name[i - 1] === " " ? 3 : 1; j++; }
        return j === s.length ? { it, score, hit } : null;
      })
      .filter((x): x is { it: PaletteItem; score: number; hit: number[] } => !!x)
      .sort((a, b) => b.score - a.score);
  }, [q, items]);

  const jump = (id: string) => {
    setOpen(false);
    sfx.pop();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  useEffect(() => { (list.current?.children[sel] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" }); }, [sel]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[170] flex items-start justify-center pt-[12vh] px-4 anim-fade" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-md" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg panel !rounded-3xl overflow-hidden anim-scale" role="dialog" aria-label="Command palette">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5">
          <Icon name="search" size={18} className="text-blue" />
          <input ref={inp} value={q} placeholder="Перейти к разделу…"
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(res.length - 1, s + 1)); sfx.tick(); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); sfx.tick(); }
              if (e.key === "Enter" && res[sel]) jump(res[sel].it.id);
            }}
            className="flex-1 bg-transparent outline-none text-[15px] font-semibold placeholder:text-dim" />
          <kbd className="num text-[10px] text-dim border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div ref={list} className="max-h-[50vh] overflow-y-auto p-2">
          {res.map(({ it, hit }, i) => (
            <button key={it.id} onMouseEnter={() => setSel(i)} onClick={() => jump(it.id)}
              className={cn("w-full flex items-center gap-3 px-3 h-12 rounded-xl text-left transition-colors", i === sel ? "bg-blue/15 shadow-[inset_0_0_0_2px_rgba(61,123,255,.45)]" : "hover:bg-white/5")}
              style={{ animation: `fade-in .25s ${Math.min(i, 10) * 20}ms both` }}>
              <span className={cn("size-8 rounded-lg grid place-items-center transition-colors", i === sel ? "bg-blue text-white" : "bg-ink-850 text-dim")}><Icon name={it.i} size={15} /></span>
              <span className="flex-1 text-[13.5px] font-bold">
                {it.l.split("").map((ch, k) => <span key={k} className={hit.includes(k) ? "text-gold" : undefined}>{ch}</span>)}
              </span>
              {i === sel && <Icon name="chevR" size={15} className="text-blue anim-pop" />}
            </button>
          ))}
          {!res.length && <div className="text-center text-dim text-[13px] py-10">Ничего не найдено</div>}
        </div>
        <div className="flex items-center gap-4 px-4 h-10 border-t border-white/5 text-[10.5px] font-bold text-dim">
          <span><kbd className="num">↑↓</kbd> навигация</span><span><kbd className="num">↵</kbd> перейти</span><span className="ml-auto num">{res.length} разделов</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
