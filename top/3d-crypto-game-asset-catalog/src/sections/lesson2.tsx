import { useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { Mascot, HeartArt } from "../components/art";
import { tap, sfx, haptic } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   L06–L07 — Пропуски в тексте и поиск ошибки в ордере.
   ═══════════════════════════════════════════════════════════════════ */

/* ── L06 · Заполни пропуски ── */
const CLOZE = [
  { pre: "Стоп-лосс ставят", opts: ["ниже входа в лонге", "выше входа в лонге", "после прибыли"], ok: 0 },
  { pre: "чтобы", opts: ["ограничить убыток", "увеличить плечо", "заплатить комиссию"], ok: 0 },
  { pre: "а риск на сделку обычно", opts: ["1–2% депозита", "50% депозита", "весь депозит"], ok: 0 },
];

export function Cloze() {
  const [ans, setAns] = useState<(number | null)[]>([null, null, null]);
  const [open, setOpen] = useState<number | null>(0);
  const [res, setRes] = useState<null | boolean>(null);
  const [hearts, setHearts] = useState(3);
  const ready = ans.every((a) => a !== null);
  const check = () => {
    const ok = ans.every((a, i) => a === CLOZE[i].ok);
    setRes(ok);
    if (ok) { sfx("success"); haptic([10, 40, 10]); }
    else { sfx("error"); haptic([40, 30, 40]); setHearts((h) => Math.max(0, h - 1)); }
  };
  const again = () => { setAns([null, null, null]); setOpen(0); setRes(null); tap(); };
  return (
    <div>
      <div className="flex items-center gap-2">
        <Mascot size={52} mood={res === null ? "think" : res ? "happy" : "sad"} />
        <div className="text-[12px] font-bold text-ink-300">Тапни пропуск и выбери вставку · {hearts > 0 ? `${hearts} жизни` : "без жизней"}</div>
        <div className="ml-auto flex gap-0.5">{[0, 1, 2].map((k) => <HeartArt key={k} size={20} empty={k >= hearts} />)}</div>
      </div>
      <div className="mt-4 rounded-3xl bg-ink-850 p-5 text-[16px] font-semibold leading-[2.6]">
        {CLOZE.map((c, i) => (
          <span key={i}>
            <span className="text-ink-200">{c.pre} </span>
            <button
              onClick={() => res === null && (tap("tick"), setOpen(open === i ? null : i))}
              className={cn(
                "mx-0.5 inline-flex min-w-28 items-center justify-center gap-1 rounded-xl border-b-4 px-2.5 py-1 align-middle text-[14px] font-bold transition-all",
                res !== null ? (ans[i] === c.ok ? "border-bull-d bg-bull/20 text-bull" : "border-bear-d bg-bear/20 text-bear") :
                ans[i] !== null ? "border-sky-d bg-sky/20 text-sky" : open === i ? "border-gold-d bg-gold/15 text-gold animate-pulse" : "border-ink-500 bg-ink-800 text-ink-400"
              )}
            >
              {ans[i] !== null ? c.opts[ans[i]!] : "•••"}
              {res !== null && <Icon name={ans[i] === c.ok ? "check" : "x"} size={14} stroke={3} />}
            </button>{" "}
          </span>
        ))}
        <span className="text-ink-200">.</span>
      </div>
      {open !== null && res === null && (
        <div key={open} className="mt-3 flex flex-wrap gap-2 animate-slide-up">
          {CLOZE[open].opts.map((o, j) => (
            <button key={o} onClick={() => { tap("tick"); setAns((a) => a.map((v, k) => (k === open ? j : v))); setOpen(open + 1 < CLOZE.length ? open + 1 : null); }}
              className={cn("tile3d px-3.5 py-2.5 text-[13px] font-bold")} data-state={ans[open] === j ? "selected" : undefined}>
              {o}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">
        {res === null ? (
          <Btn block s="md" disabled={!ready} onClick={check}>Проверить</Btn>
        ) : (
          <div className={cn("rounded-2xl p-4 animate-slide-up", res ? "bg-bull/15" : "bg-bear/15")}>
            <div className={cn("font-display text-sm font-black", res ? "text-bull" : "text-bear")}>
              {res ? "Идеально! +12 XP" : `Ошибки: ${ans.filter((a, i) => a !== CLOZE[i].ok).length} из 3 — попробуй ещё`}
            </div>
            {!res && <div className="mt-1 text-[12px] text-ink-200">Верно: «ниже входа в лонге», «ограничить убыток», «1–2% депозита».</div>}
            <Btn block s="sm" v={res ? "bull" : "bear"} className="mt-3" onClick={again}>Ещё раз</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── L07 · Найди 3 ошибки в ордере ── */
type Zone = { id: string; label: string; bad: string; good: string; hint: string };
const ZONES: Zone[] = [
  { id: "lev", label: "Плечо 50x", bad: "50x разгоняет ликвидацию до −2%", good: "Новичкам ≤ 3x", hint: "Посмотри на множитель" },
  { id: "sl", label: "Стоп: выкл", bad: "Без стопа убыток не ограничен", good: "Стоп −2% от входа", hint: "Что ограничивает убыток?" },
  { id: "size", label: "90% депозита", bad: "Одна сделка = почти весь счёт", good: "Риск 1–2% на сделку", hint: "Какая доля счёта в игре?" },
];

export function SpotMistake() {
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [detail, setDetail] = useState<Zone | null>(null);
  const all = found.length === ZONES.length;
  const poke = (id: string, bad: boolean) => {
    if (all) return;
    setTries((t) => t + 1);
    if (bad && !found.includes(id)) {
      const z = ZONES.find((x) => x.id === id)!;
      setFound((f) => [...f, id]);
      setDetail(z);
      sfx("success"); haptic(15);
      if (found.length + 1 === ZONES.length) { sfx("levelup"); haptic([10, 30, 10, 30, 60]); }
    } else if (!bad) {
      setMiss(id);
      sfx("error"); haptic(30);
      setTimeout(() => setMiss(null), 450);
    } else tap("tick");
  };
  const Cell = ({ id, bad, children, className }: { id: string; bad: boolean; children: React.ReactNode; className?: string }) => (
    <button
      onClick={() => poke(id, bad)}
      className={cn(
        "relative rounded-2xl border-2 p-3 text-left transition-all",
        found.includes(id) ? "border-bull bg-bull/10" : miss === id ? "border-bear bg-bear/15 animate-shake" : "border-ink-600 bg-ink-850 hover:border-ink-400",
        className
      )}
    >
      {children}
      {found.includes(id) && <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-bull text-ink-900 animate-pop"><Icon name="check" size={15} stroke={3.4} /></span>}
    </button>
  );
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Chip tone={all ? "bull" : "gold"}>Найдено {found.length}/{ZONES.length}</Chip>
        <span className="text-[11px] text-ink-400">Тапай по подозрительным строкам · промахов: {tries - found.length}</span>
        <Btn s="xs" v="ghost" className="ml-auto" onClick={() => { tap(); const z = ZONES.find((x) => !found.includes(x.id)); if (z) setDetail(z); }}>
          {detail && !found.includes(detail.id) ? detail.hint : "Подсказка"}
        </Btn>
      </div>
      <div className="rounded-3xl bg-ink-900/60 p-3 ring-1 ring-white/5">
        <div className="mb-2 flex items-center gap-2 px-1"><span className="rounded-lg bg-bull/20 px-2 py-0.5 font-display text-[10px] font-black text-bull">LONG BTC</span><span className="font-mono text-[11px] text-ink-400">ордер #4821</span></div>
        <div className="grid grid-cols-2 gap-2">
          <Cell id="lev" bad><div className="text-[10px] uppercase text-ink-500">Плечо</div><div className="font-mono text-lg font-bold text-gold">50x</div></Cell>
          <Cell id="size" bad><div className="text-[10px] uppercase text-ink-500">Размер</div><div className="font-mono text-lg font-bold">$9 000 <span className="text-[10px] text-ink-400">/ $10K</span></div></Cell>
          <Cell id="sl" bad><div className="text-[10px] uppercase text-ink-500">Стоп-лосс</div><div className="font-mono text-lg font-bold text-bear">выкл</div></Cell>
          <Cell id="tp" bad={false}><div className="text-[10px] uppercase text-ink-500">Тейк-профит</div><div className="font-mono text-lg font-bold text-bull">+8%</div></Cell>
          <Cell id="pair" bad={false} className="col-span-2"><div className="text-[10px] uppercase text-ink-500">Пара</div><div className="font-mono text-sm font-bold">BTC/USDT · лимит 67 400</div></Cell>
        </div>
      </div>
      {detail && (
        <div key={detail.id + String(found.includes(detail.id))} className={cn("mt-3 rounded-2xl p-3 text-[12px] animate-slide-up", found.includes(detail.id) ? "bg-bull/10 ring-1 ring-bull/40" : "bg-ink-850 ring-1 ring-white/5")}>
          <b>{detail.label}:</b> {found.includes(detail.id) ? <><span className="text-bear">{detail.bad}.</span> <span className="text-bull">{detail.good}.</span></> : detail.hint}
        </div>
      )}
      {all && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gold/10 p-3 ring-1 ring-gold/40 animate-zoom-in">
          <Mascot size={48} mood="hype" />
          <div className="flex-1 text-[12px] font-bold">Все ошибки найдены за {tries} тапов! +20 XP</div>
          <Btn s="xs" v="ghost" icon="refresh" onClick={() => { setFound([]); setTries(0); setDetail(null); }}>Заново</Btn>
        </div>
      )}
    </div>
  );
}
