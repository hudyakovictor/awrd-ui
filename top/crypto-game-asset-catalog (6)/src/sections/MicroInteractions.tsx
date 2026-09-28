import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstAtEl, burstConfetti, burstSparks, burstStars } from "../utils/fx";
import { clamp } from "../hooks/motion";

/* =========================================================
   1. MORPHING ICONS (line transforms + path morph)
   ========================================================= */
function MorphIcon({ kind, on }: { kind: "menu" | "play" | "plus" | "arrow"; on: boolean }) {
  const T = "transition-all duration-400 ease-[cubic-bezier(.3,1.4,.5,1)]";
  const style = (t: string) => ({ transformOrigin: "12px 12px", transform: t, transformBox: "view-box" as const });
  if (kind === "menu") return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <line x1="4" x2="20" y1="6" y2="6" className={T} style={style(on ? "translateY(6px) rotate(45deg)" : "none")} />
      <line x1="4" x2="20" y1="12" y2="12" className={T} style={{ ...style(on ? "scaleX(0)" : "none"), opacity: on ? 0 : 1 }} />
      <line x1="4" x2="20" y1="18" y2="18" className={T} style={style(on ? "translateY(-6px) rotate(-45deg)" : "none")} />
    </svg>
  );
  if (kind === "play") return (
    <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
      <path className={T} d={on ? "M6 5h4v14H6z M14 5h4v14h-4z" : "M7 4l6 4v8l-6 4z M13 8l6 4-6 4z"} />
    </svg>
  );
  if (kind === "plus") return (
    <svg viewBox="0 0 24 24" className={cn("size-7", T)} style={{ transform: on ? "rotate(180deg)" : "none" }} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
      <line x1="5" x2="19" y1="12" y2="12" />
      <line x1="12" x2="12" y1="5" y2="19" className={T} style={style(on ? "scaleY(0)" : "none")} />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path className={T} d={on ? "M5 12.5l4.5 4.5L19 7.5" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}
function MorphIcons() {
  const [s, setS] = useState({ menu: false, play: false, plus: false, arrow: false });
  const K = ["menu", "play", "plus", "arrow"] as const;
  const L = { menu: "Menu ↔ Close", play: "Play ↔ Pause", plus: "Add ↔ Remove", arrow: "Next ↔ Done" };
  return (
    <Asset title="Morphing Icons" id="mic.morph" desc="Иконки плавно превращаются друг в друга: линии поворачиваются, пути морфятся, пружинная кривая.">
      <div className="grid grid-cols-4 gap-3">
        {K.map((k) => (
          <button key={k} onClick={() => { setS({ ...s, [k]: !s[k] }); sfx.toggle(); haptic(6); }} className="flex flex-col items-center gap-2">
            <span className={cn("size-14 rounded-2xl grid place-items-center transition-colors duration-300 shadow-[0_4px_0_#0b1536]", s[k] ? "bg-blue text-white" : "bg-[#1c3068] text-mute")}><MorphIcon kind={k} on={s[k]} /></span>
            <span className="text-[9.5px] font-extrabold text-dim text-center leading-tight">{L[k]}</span>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   2. BELL RING + BADGE BOUNCE
   ========================================================= */
function BellRing() {
  const [n, setN] = useState(3);
  const [ring, setRing] = useState(0);
  const [open, setOpen] = useState(false);
  const notify = () => { setN((x) => x + 1); setRing((r) => r + 1); sfx.pop(); haptic([10, 30, 10]); };
  const MSG = ["BTC пробил $67k", "Серия под угрозой!", "Новый урок открыт", "Ты поднялся в лиге", "Сундук готов"];
  return (
    <Asset title="Bell & Badge" id="mic.bell" desc="Колокольчик раскачивается при новом уведомлении, бейдж подпрыгивает, выпадающий список со стаггером.">
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="relative">
          <button onClick={() => { setOpen(!open); if (!open) setN(0); sfx.tap(); }} className="size-16 rounded-2xl bg-[#1c3068] grid place-items-center shadow-[0_5px_0_#0b1536] active:translate-y-1 active:shadow-none transition">
            <span key={ring} className="origin-top" style={{ animation: ring ? "wiggle .7s ease" : undefined }}><Icon name="bell" size={28} /></span>
          </button>
          {n > 0 && <span key={n} className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-bear text-[11px] font-extrabold grid place-items-center border-[3px] border-ink-800 num anim-pop">{n}</span>}
          {open && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 raised p-1.5 z-20 anim-scale origin-top">
              {MSG.slice(0, 4).map((m, i) => (
                <div key={m} className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 text-[12px] font-bold" style={{ animation: `fade-in .35s ${i * 60}ms both` }}>
                  <span className="size-2 rounded-full bg-blue" />{m}
                </div>
              ))}
            </div>
          )}
        </div>
        <Btn3D size="sm" variant="blue" onClick={notify} icon={<Icon name="plus" size={14} stroke={3} />}>Notify</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. STAR RATING
   ========================================================= */
function StarRating() {
  const [val, setVal] = useState(3);
  const [hover, setHover] = useState<number | null>(null);
  const [pop, setPop] = useState(0);
  const shown = hover ?? val;
  const labels = ["Ужасно", "Слабо", "Нормально", "Хорошо", "Шедевр!"];
  return (
    <Asset title="Star Rating" id="mic.stars" desc="Оцените урок: превью при наведении, звёзды заполняются волной, на 5★ — звёздный салют.">
      <div className="flex flex-col items-center py-2">
        <div className="flex gap-1.5" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onMouseEnter={() => setHover(i)} onClick={(e) => { setVal(i); setPop((p) => p + 1); sfx.pop(); haptic(8); if (i === 5) { const r = e.currentTarget.getBoundingClientRect(); burstStars(r.left + r.width / 2, r.top + r.height / 2, 12); sfx.levelUp(); } }}
              className="transition-transform duration-200 hover:scale-125" style={{ transform: i <= shown ? "scale(1.05)" : "scale(.9)" }}>
              <span key={i <= val ? pop : -1} className="block" style={{ animation: i <= val && pop ? `pop .45s ${i * 60}ms both` : undefined, filter: i <= shown ? "none" : "grayscale(1) brightness(.4)", transition: "filter .2s" }}>
                <Glyph name="star" size={40} />
              </span>
            </button>
          ))}
        </div>
        <div key={shown} className="font-extrabold text-[15px] mt-3 anim-fade" style={{ color: ["#ff4d6a", "#ff8a3d", "#ffc53d", "#8be05a", "#1fdb8b"][shown - 1] }}>{labels[shown - 1]}</div>
        <div className="text-[11px] text-dim font-bold mt-0.5">{hover ? "превью" : `ваша оценка: ${val}/5`}</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. EMOJI REACTIONS PICKER (hover-magnify dock)
   ========================================================= */
const REACT = ["🚀", "💎", "🔥", "😱", "🐻", "🐂"];
function Reactions() {
  const [open, setOpen] = useState(false);
  const [mx, setMx] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({ "🚀": 42, "💎": 18, "🔥": 31 });
  const dock = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const choose = (r: string, el: HTMLElement) => {
    setPicked(r); setOpen(false); setMx(null);
    setCounts((c) => ({ ...c, [r]: (c[r] ?? 0) + 1 }));
    burstAtEl(el, "sparks", 14); sfx.pop(); haptic(12);
  };
  return (
    <Asset title="Reactions Picker" id="mic.reactions" desc="Долгий тап/hover на кнопке открывает док реакций; эмодзи увеличиваются по близости к курсору (magnify как в macOS Dock).">
      <div className="raised !rounded-2xl p-3">
        <div className="text-[12.5px] font-semibold leading-snug">Bulli: «BTC закрыл неделю выше $67k. Что думаешь?»</div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(counts).map(([r, c]) => <span key={r} className={cn("h-7 px-2 rounded-full text-[12px] flex items-center gap-1 border", picked === r ? "bg-blue/20 border-blue/60" : "bg-white/5 border-white/10")}><span>{r}</span><span className="num font-extrabold text-[11px]">{c}</span></span>)}
        </div>
        <div className="relative mt-3">
          {open && (
            <div ref={dock} className="absolute bottom-full mb-2 left-0 flex items-end gap-1 px-2 py-1.5 rounded-full bg-[#1d3169] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.5)] anim-scale origin-bottom-left z-20"
              onPointerMove={(e) => setMx(e.clientX)} onPointerLeave={() => setMx(null)}>
              {REACT.map((r, i) => {
                let s = 1;
                const el = dock.current?.children[i] as HTMLElement | undefined;
                if (mx !== null && el) { const rr = el.getBoundingClientRect(); const d = Math.abs(mx - (rr.left + rr.width / 2)); s = 1 + clamp(1 - d / 90) * 0.9; }
                return (
                  <button key={r} onClick={(e) => choose(r, e.currentTarget)} className="text-[26px] leading-none origin-bottom transition-transform duration-100" style={{ transform: `scale(${s}) translateY(${(1 - s) * 6}px)`, animation: `pop .35s ${i * 40}ms both` }}>{r}</button>
                );
              })}
            </div>
          )}
          <button onPointerDown={() => { timer.current = window.setTimeout(() => { setOpen(true); sfx.pop(); haptic(10); }, 300); }} onPointerUp={() => clearTimeout(timer.current)} onMouseEnter={() => { timer.current = window.setTimeout(() => setOpen(true), 400); }}
            onClick={() => { if (!open) { setOpen(true); sfx.pop(); } }}
            className={cn("h-9 px-3 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 transition", picked ? "bg-blue/20 text-[#8fb3ff]" : "bg-white/5 text-mute hover:text-txt")}>
            {picked ? <span key={picked} className="text-[16px] anim-pop">{picked}</span> : <Icon name="heart" size={15} />}{picked ? "Отреагировал" : "React"}
          </button>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   5. ANIMATED CHECKLIST
   ========================================================= */
function Checklist() {
  const [items, setItems] = useState([
    { t: "Пройти урок дня", d: true }, { t: "Сделать 3 прогноза", d: false }, { t: "Поставить стоп-лосс в демо", d: false }, { t: "Прочитать новость рынка", d: false },
  ]);
  const done = items.filter((i) => i.d).length;
  const toggle = (k: number, el: HTMLElement) => {
    const n = items.map((x, i) => (i === k ? { ...x, d: !x.d } : x));
    setItems(n);
    if (!items[k].d) { sfx.success(); haptic(10); burstAtEl(el, "sparks", 10); if (n.every((x) => x.d)) { const r = el.getBoundingClientRect(); burstConfetti(r.left, r.top, 50, 1); sfx.levelUp(); } }
    else sfx.tap();
  };
  return (
    <Asset title="Animated Checklist" id="mic.checklist" desc="Галочка рисуется штрихом, текст перечёркивается линией, прогресс-кольцо заполняется; все 4 — конфетти.">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative size-12">
          <svg viewBox="0 0 48 48" className="-rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="#16275a" strokeWidth="5" /><circle cx="24" cy="24" r="20" fill="none" stroke="#1fdb8b" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(done / items.length) * 125.6} 125.6`} style={{ transition: "stroke-dasharray .5s cubic-bezier(.3,1.3,.5,1)" }} /></svg>
          <span className="absolute inset-0 grid place-items-center num text-[12px] font-extrabold">{done}/{items.length}</span>
        </div>
        <div><div className="font-extrabold text-[14px]">Daily quests</div><div className="text-[11px] text-dim font-bold">{done === items.length ? "Все выполнены! 🎉" : `осталось ${items.length - done}`}</div></div>
      </div>
      <div className="space-y-2">
        {items.map((it, k) => (
          <button key={it.t} onClick={(e) => toggle(k, e.currentTarget)} className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors", it.d ? "bg-bull/10" : "bg-white/[.03] hover:bg-white/5")}>
            <span className={cn("size-7 shrink-0 rounded-lg border-2 grid place-items-center transition-all duration-300", it.d ? "bg-bull border-bull scale-100" : "border-[#2f4890] scale-95")}>
              <svg viewBox="0 0 24 24" className="size-5"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#03261a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={it.d ? 0 : 1} style={{ transition: "stroke-dashoffset .35s ease .08s" }} /></svg>
            </span>
            <span className="relative text-[12.5px] font-bold">
              <span className={cn("transition-colors duration-300", it.d && "text-dim")}>{it.t}</span>
              <span className="absolute left-0 top-1/2 h-[2px] bg-dim rounded origin-left transition-transform duration-300" style={{ width: "100%", transform: `scaleX(${it.d ? 1 : 0})` }} />
            </span>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   6. EXPANDING SEARCH
   ========================================================= */
function ExpandSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inp = useRef<HTMLInputElement>(null);
  const ALL = ["Bitcoin", "Bollinger Bands", "Bull flag", "Bear market", "Breakout", "Ethereum", "Engulfing", "Stop-loss", "Solana", "Support level"];
  const res = q ? ALL.filter((a) => a.toLowerCase().includes(q.toLowerCase())) : ALL.slice(0, 4);
  useEffect(() => { if (open) setTimeout(() => inp.current?.focus(), 250); }, [open]);
  return (
    <Asset title="Expanding Search" id="mic.search" desc="Иконка раскрывается в поле с пружиной, подсказки появляются стаггером, совпадения подсвечиваются.">
      <div className="h-[230px]">
        <div className="flex justify-end">
          <div className={cn("h-12 rounded-full flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)] shadow-[0_4px_0_#0b1536]", open ? "w-full bg-[#0a1330] border-2 border-blue" : "w-12 bg-[#1c3068] border-2 border-transparent")}>
            <button onClick={() => { setOpen(!open); setQ(""); sfx.whoosh(); }} className="size-11 shrink-0 grid place-items-center text-mute"><Icon name={open ? "x" : "search"} size={19} className="transition-transform duration-300" style={{ transform: open ? "rotate(90deg)" : "none" }} /></button>
            <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Термин, монета, паттерн…" className="flex-1 bg-transparent outline-none text-[13.5px] font-semibold pr-4 placeholder:text-dim" tabIndex={open ? 0 : -1} />
          </div>
        </div>
        {open && (
          <div className="mt-3 space-y-1.5">
            {res.slice(0, 4).map((r, i) => {
              const idx = q ? r.toLowerCase().indexOf(q.toLowerCase()) : -1;
              return (
                <div key={r} className="raised !rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-[12.5px] font-bold" style={{ animation: `fade-in .3s ${i * 55}ms both` }}>
                  <Icon name={/coin|Bitcoin|Ethereum|Solana/.test(r) ? "bitcoin" : "book"} size={14} className="text-blue" />
                  {idx >= 0 ? <span>{r.slice(0, idx)}<mark className="bg-gold/30 text-gold rounded px-0.5">{r.slice(idx, idx + q.length)}</mark>{r.slice(idx + q.length)}</span> : r}
                </div>
              );
            })}
            {!res.length && <div className="text-center text-dim text-[12px] py-4 anim-fade">Ничего не найдено</div>}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =========================================================
   7. COPY TO CLIPBOARD
   ========================================================= */
function CopyAddress() {
  const [copied, setCopied] = useState(false);
  const addr = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
  return (
    <Asset title="Copy Feedback" id="mic.copy" desc="Копирование адреса: иконка морфится в галочку, всплывает лейбл, поле подсвечивается волной.">
      <div className="py-4">
        <div className="label-caps">Deposit address · ERC-20</div>
        <div className={cn("relative inset !rounded-2xl p-3 flex items-center gap-3 overflow-hidden transition-colors", copied && "!border-bull/50")}>
          {copied && <span className="absolute inset-0 bg-bull/15 origin-left" style={{ animation: "progress-fill .5s ease-out both" }} />}
          <span className="relative num text-[12px] font-bold truncate flex-1">{addr.slice(0, 12)}…{addr.slice(-10)}</span>
          <div className="relative">
            {copied && <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-bull text-ink-900 text-[10.5px] font-extrabold whitespace-nowrap anim-pop">Copied!</span>}
            <button onClick={(e) => { navigator.clipboard?.writeText(addr).catch(() => {}); setCopied(true); sfx.success(); haptic(10); burstAtEl(e.currentTarget, "sparks", 10); setTimeout(() => setCopied(false), 1600); }}
              className={cn("size-10 rounded-xl grid place-items-center transition-all duration-300", copied ? "bg-bull text-ink-900 scale-110" : "bg-[#1c3068] text-mute hover:text-txt")}>
              <Icon name={copied ? "check" : "copy"} size={18} stroke={copied ? 3 : 2} className={copied ? "anim-pop" : ""} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-dim"><Icon name="shield" size={13} className="text-bull" />Отправляйте только ERC-20 токены</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   8. PROGRESS BUTTON (export report)
   ========================================================= */
function ProgressButton() {
  const [p, setP] = useState(0);
  const [st, setSt] = useState<"idle" | "run" | "done">("idle");
  const start = () => {
    if (st !== "idle") return;
    setSt("run"); sfx.tap();
    let v = 0;
    const h = setInterval(() => {
      v = Math.min(100, v + Math.random() * 11);
      setP(v);
      if (Math.floor(v / 25) !== Math.floor((v - 11) / 25)) sfx.tick();
      if (v >= 100) { clearInterval(h); setSt("done"); sfx.success(); setTimeout(() => { setSt("idle"); setP(0); }, 1800); }
    }, 140);
  };
  return (
    <Asset title="Progress Button" id="mic.progress" desc="Кнопка сама становится прогресс-баром: заливка слева направо, проценты, иконка меняется на галочку.">
      <div className="py-8 flex flex-col items-center gap-4">
        <button onClick={start} className="relative w-full max-w-[280px] h-14 rounded-2xl overflow-hidden font-extrabold text-[13px] uppercase tracking-wider shadow-[0_5px_0_#0b1536] active:translate-y-1 active:shadow-none transition" style={{ background: st === "done" ? "#1fdb8b" : "#1c3068" }}>
          <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue to-cyan" style={{ width: `${st === "done" ? 100 : p}%`, transition: "width .15s linear", opacity: st === "done" ? 0 : 1 }}><span className="absolute inset-0 stripes" /></span>
          <span className={cn("relative flex items-center justify-center gap-2", st === "done" && "text-ink-900")}>
            {st === "idle" && <><Icon name="arrowDown" size={16} stroke={3} />Export trade report</>}
            {st === "run" && <span className="num">{Math.floor(p)}%</span>}
            {st === "done" && <><Icon name="check" size={18} stroke={3.4} className="anim-pop" />Saved to files</>}
          </span>
        </button>
        <div className="text-[11px] text-dim font-bold">PDF · 142 сделки · 3 месяца</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   9. BULL / BEAR MODE TOGGLE
   ========================================================= */
function BullBearToggle() {
  const [bull, setBull] = useState(true);
  return (
    <Asset title="Bull / Bear Toggle" id="mic.mode" desc="Тематический свитч: ручка перекатывается с поворотом, фон меняет градиент, график внутри переворачивается.">
      <div className="flex flex-col items-center gap-4 py-3">
        <button onClick={(e) => { setBull(!bull); sfx.toggle(); haptic(10); const r = e.currentTarget.getBoundingClientRect(); burstSparks(r.left + (bull ? 30 : r.width - 30), r.top + r.height / 2, 14, bull ? "#ff4d6a" : "#1fdb8b"); }}
          className="relative w-[180px] h-[72px] rounded-full overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,.5),0_5px_0_#0b1536] transition-[background] duration-500"
          style={{ background: bull ? "linear-gradient(90deg,#0a5c3a,#1fdb8b)" : "linear-gradient(90deg,#ff4d6a,#6e1226)" }}>
          <svg viewBox="0 0 180 72" className="absolute inset-0 opacity-40">
            <polyline points={bull ? "10,58 40,48 60,52 90,30 120,36 150,14 170,10" : "10,14 40,24 60,20 90,42 120,36 150,58 170,62"} fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" style={{ transition: "all .5s" }} />
          </svg>
          <span className={cn("absolute top-1/2 -translate-y-1/2 text-[12px] font-extrabold tracking-wider text-white/90 transition-all duration-500", bull ? "left-5" : "right-5")}>{bull ? "BULL" : "BEAR"}</span>
          <span className="absolute top-[6px] size-[60px] rounded-full bg-gradient-to-b from-white to-[#c9d5f5] shadow-[0_4px_0_rgba(0,0,0,.3),0_8px_16px_rgba(0,0,0,.35)] grid place-items-center transition-all duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] text-[30px]"
            style={{ left: bull ? 114 : 6, transform: `rotate(${bull ? 0 : -360}deg)` }}>{bull ? "🐂" : "🐻"}</span>
        </button>
        <div key={String(bull)} className="text-center anim-fade">
          <div className={cn("font-extrabold text-[15px]", bull ? "text-bull" : "text-bear")}>{bull ? "Бычий режим" : "Медвежий режим"}</div>
          <div className="text-[11.5px] text-mute">{bull ? "Уроки о покупках на откатах" : "Уроки о шортах и защите капитала"}</div>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   10. NOTIFICATION STACK (iOS-style)
   ========================================================= */
function NotifStack() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([
    { id: 1, i: "trendUp", t: "BTC +5% за час", s: "Цена $67,420", c: "#1fdb8b" },
    { id: 2, i: "flame", t: "Серия 47 дней", s: "Зайди, чтобы не потерять", c: "#ff8a3d" },
    { id: 3, i: "trophy", t: "Лига: ты 3-й", s: "До повышения 180 XP", c: "#ffc53d" },
    { id: 4, i: "gift", t: "Сундук готов", s: "Бесплатная награда ждёт", c: "#8d5cff" },
  ]);
  return (
    <Asset title="Notification Stack" id="mic.notif" desc="Стопка уведомлений: тап разворачивает веер в список, крестик — удаление со схлопыванием.">
      <div className="relative" style={{ height: open ? list.length * 70 + 40 : 150, transition: "height .45s cubic-bezier(.3,1.2,.5,1)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] font-extrabold text-mute">Уведомления · <span className="num">{list.length}</span></span>
          {open && <button onClick={() => { setOpen(false); sfx.tap(); }} className="text-[11px] font-extrabold text-blue anim-fade">Свернуть</button>}
        </div>
        {list.map((n, i) => {
          const y = open ? i * 70 : Math.min(i, 2) * 10;
          const sc = open ? 1 : 1 - Math.min(i, 2) * 0.05;
          return (
            <div key={n.id} onClick={() => { if (!open) { setOpen(true); sfx.whoosh(); } }}
              className="absolute inset-x-0 top-7 h-[62px] raised !rounded-2xl px-3 flex items-center gap-3 cursor-pointer"
              style={{ transform: `translateY(${y}px) scale(${sc})`, zIndex: 10 - i, opacity: !open && i > 2 ? 0 : 1, transition: `transform .45s cubic-bezier(.3,1.2,.5,1) ${open ? i * 40 : 0}ms, opacity .3s`, filter: !open && i ? `brightness(${1 - i * 0.12})` : "none" }}>
              <span className="size-9 rounded-xl grid place-items-center" style={{ background: `${n.c}22`, color: n.c }}><Icon name={n.i} size={18} /></span>
              <div className="flex-1 min-w-0"><div className="text-[12.5px] font-extrabold truncate">{n.t}</div><div className="text-[10.5px] text-dim truncate">{n.s}</div></div>
              {open && <button onClick={(e) => { e.stopPropagation(); setList((l) => l.filter((x) => x.id !== n.id)); sfx.whoosh(); }} className="size-7 rounded-lg grid place-items-center text-dim hover:bg-white/5 anim-pop"><Icon name="x" size={13} stroke={3} /></button>}
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* =========================================================
   11. ANIMATED TAB-BAR ICONS
   ========================================================= */
function AnimatedTabBar() {
  const TABS = [
    { k: "home", i: "home", a: "squash .45s cubic-bezier(.3,1.5,.5,1)" },
    { k: "chart", i: "chart", a: "pop .45s cubic-bezier(.3,1.5,.5,1)" },
    { k: "trophy", i: "trophy", a: "wiggle .6s ease" },
    { k: "gift", i: "gift", a: "box-shake .4s ease 2" },
    { k: "user", i: "user", a: "floaty .6s ease" },
  ];
  const [a, setA] = useState(0);
  const [k, setK] = useState(0);
  return (
    <Asset title="Animated Tab Icons" id="mic.tabbar" desc="Каждая иконка таб-бара имеет свою анимацию выбора: squash, pop, wiggle, shake, float. Капля-индикатор перетекает.">
      <div className="h-[150px] flex items-end">
        <div className="relative w-full h-[70px] rounded-3xl bg-[#13224e] shadow-[0_5px_0_#081028] grid grid-cols-5">
          <span className="absolute -top-4 size-14 rounded-full bg-gradient-to-b from-[#6a9dff] to-[#3d7bff] shadow-[0_5px_0_#2250c2,0_0_24px_rgba(61,123,255,.5)] transition-[left] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${a * 20 + 10}% - 28px)` }} />
          {TABS.map((t, i) => (
            <button key={t.k} onClick={() => { setA(i); setK(k + 1); sfx.pop(); haptic(6); }} className="relative z-10 grid place-items-center">
              <span key={a === i ? k : "x"} className={cn("transition-all duration-500", a === i ? "-translate-y-4 text-white" : "text-dim")} style={{ animation: a === i ? t.a : undefined }}>
                <Icon name={t.i} size={24} stroke={a === i ? 2.6 : 2} />
              </span>
              <span className={cn("absolute bottom-2 size-1 rounded-full bg-blue transition-all", a === i ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   12. ONBOARDING COACH-MARK TOUR
   ========================================================= */
function CoachTour() {
  const host = useRef<HTMLDivElement>(null);
  const targets = useRef<(HTMLDivElement | null)[]>([]);
  const [step, setStep] = useState(-1);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const STEPS = [
    { t: "Это твой баланс", d: "Демо-деньги для практики без риска." },
    { t: "Серия дней", d: "Заходи каждый день — пламя растёт." },
    { t: "Главная кнопка", d: "Начни урок одним тапом." },
    { t: "Лига недели", d: "Обгоняй соперников и получай награды." },
  ];
  useEffect(() => {
    if (step < 0) return;
    const h = host.current?.getBoundingClientRect(), t = targets.current[step]?.getBoundingClientRect();
    if (h && t) setBox({ x: t.left - h.left - 6, y: t.top - h.top - 6, w: t.width + 12, h: t.height + 12 });
  }, [step]);
  const next = () => { if (step >= STEPS.length - 1) { setStep(-1); sfx.success(); } else { setStep(step + 1); sfx.whoosh(); } };
  const tipBelow = box.y < 120;
  return (
    <Asset title="Coach-mark Tour" id="mic.tour" desc="Онбординг-тур: прожектор перетекает между элементами интерфейса, подсказка следует за ним, затемнение вокруг." className="lg:col-span-2">
      <div ref={host} className="relative h-[260px] inset !rounded-3xl p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div ref={(e) => { targets.current[0] = e; }} className="raised !rounded-xl px-3 py-2"><div className="label-caps !mb-0">Balance</div><div className="num font-extrabold">$10,000</div></div>
          <div ref={(e) => { targets.current[1] = e; }} className="raised !rounded-xl px-3 py-2 flex items-center gap-1.5 font-extrabold text-[#ff9a3d]"><Glyph name="flame" size={20} />47</div>
        </div>
        <div className="grid place-items-center mt-8">
          <div ref={(e) => { targets.current[2] = e; }}><Btn3D size="lg" variant="bull" icon={<Icon name="play" size={18} />}>Start lesson</Btn3D></div>
        </div>
        <div ref={(e) => { targets.current[3] = e; }} className="absolute bottom-4 right-4 raised !rounded-xl px-3 py-2 flex items-center gap-2"><Glyph name="gem" size={20} /><span className="font-extrabold text-[12px]">Sapphire · #3</span></div>
        {step >= 0 && (
          <>
            <div className="absolute rounded-2xl pointer-events-none z-20 transition-all duration-500 ease-[cubic-bezier(.3,1.2,.5,1)] ring-2 ring-gold/80" style={{ left: box.x, top: box.y, width: box.w, height: box.h, boxShadow: "0 0 0 9999px rgba(5,10,24,.78), 0 0 30px rgba(255,197,61,.5)" }} />
            <div key={step} className="absolute z-30 w-[220px] raised p-3 anim-pop transition-all duration-500" style={{ left: clamp(box.x + box.w / 2 - 110, 8, 9999), top: tipBelow ? box.y + box.h + 10 : box.y - 108 }}>
              <div className="flex items-center justify-between mb-1"><span className="font-extrabold text-[13px]">{STEPS[step].t}</span><Badge tone="gold" size="xs">{step + 1}/{STEPS.length}</Badge></div>
              <div className="text-[11.5px] text-mute leading-snug mb-2.5">{STEPS[step].d}</div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(-1)} className="text-[11px] font-bold text-dim">Skip</button>
                <Btn3D size="xs" variant="gold" onClick={next}>{step === STEPS.length - 1 ? "Done" : "Next"}</Btn3D>
              </div>
            </div>
          </>
        )}
      </div>
      {step < 0 && <Btn3D size="sm" variant="gold" className="mt-3" icon={<Icon name="sparkles" size={14} />} onClick={() => { setStep(0); sfx.pop(); }}>Start tour</Btn3D>}
    </Asset>
  );
}

export default function MicroInteractions() {
  return (
    <Section id="micro" index="16" title="Micro-interactions" subtitle="12 микро-взаимодействий: морфинг иконок, колокольчик, рейтинг, реакции, чек-лист, поиск, копирование, прогресс-кнопка, режимы, уведомления, таб-бар, онбординг-тур" count={12}>
      <div className="grid lg:grid-cols-3 gap-6">
        <MorphIcons />
        <BellRing />
        <StarRating />
        <CoachTour />
        <Reactions />
        <Checklist />
        <ExpandSearch />
        <CopyAddress />
        <ProgressButton />
        <BullBearToggle />
        <NotifStack />
        <AnimatedTabBar />
      </div>
    </Section>
  );
}
