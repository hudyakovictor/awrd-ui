import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Mic, Phone, PhoneOff, Search, BookOpen, TrendingUp, TrendingDown, ChevronRight, GraduationCap } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { CandleChart, fromCloses } from "../kit/chart";
import { useGame } from "../kit/game";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ AC-01 COACH CHAT ============ */
type CM = { id: number; me: boolean; t: string; chart?: number[] };
const brain: [RegExp, string][] = [
  [/стоп|stop/i, "Стоп ставится ДО входа, под ближайший минимум. Риск — не больше 1–2% депозита. Хочешь, покажу на графике?"],
  [/плеч|leverage|ликвид/i, "Плечо 10x ликвидирует при −10% против тебя. Начни с 2–3x, пока винрейт не станет стабильным."],
  [/купить|buy|long|вход/i, "Хороший вход = тренд + уровень + подтверждение свечой. Никогда не входи только потому что «растёт»."],
  [/продать|sell|short/i, "Шорт сильнее работает под сопротивлением после слабой попытки роста. Стоп — над максимумом."],
  [/страх|потеря|убыток|loss/i, "Убытки — часть системы. Вопрос один: риск был запланированным? Если да — ты всё сделал правильно."],
  [/привет|здравствуй|hello|hi/i, "Привет! Я Торо 🐂 Спроси про стопы, плечо, входы — или нажми быстрый вопрос ниже."],
];
function CoachChat() {
  const [msgs, setMsgs] = useState<CM[]>([{ id: 1, me: false, t: "Привет! Я Торо, твой наставник. Спроси что-нибудь про трейдинг 👇" }]);
  const [txt, setTxt] = useState("");
  const [typing, setTyping] = useState(false);
  const [partial, setPartial] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const id = useRef(10);
  useEffect(() => { box.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, [msgs.length, typing, partial]);
  const answer = (q: string): string => {
    for (const [re, a] of brain) if (re.test(q)) return a;
    return "Интересный вопрос! Разберём на практике: открой Chart Replay и найди там такую ситуацию. А пока — рискуй не больше 1% 😉";
  };
  const send = (preset?: string) => {
    const v = (preset ?? txt).trim();
    if (!v || typing) return;
    setMsgs((m) => [...m, { id: id.current++, me: true, t: v }]);
    setTxt("");
    sfxRaw.pop();
    setTyping(true);
    setPartial("");
    const full = answer(v);
    setTimeout(() => {
      let i = 0;
      const t = setInterval(() => {
        i += 2;
        setPartial(full.slice(0, i));
        if (i % 8 === 0) sfx.tick();
        if (i >= full.length) {
          clearInterval(t);
          setMsgs((m) => [...m, { id: id.current++, me: false, t: full, chart: /график|стоп/i.test(full) ? [100, 102, 101, 103, 102, 104, 103, 105] : undefined }]);
          setTyping(false);
          setPartial("");
          sfxRaw.swipe();
        }
      }, 28);
    }, 600);
  };
  return (
    <Asset code="AC-01" title="AI Coach Chat" desc="Наставник Торо: понимает темы вопросов, печатает ответ по буквам и прикладывает мини-графики." hint="Спроси про стопы" specs={["intent match", "typewriter", "chart attach"]} className="xl:row-span-2">
      <div ref={box} className="h-72 space-y-2.5 overflow-y-auto rounded-2xl bg-ink-900/60 p-3">
        {msgs.map((m) => (
          <div key={m.id} className={cn("anim-slide-right flex items-end gap-2", m.me && "flex-row-reverse")}>
            {!m.me && <Mascot size={34} mood="happy" />}
            <div className={cn("max-w-[80%] rounded-2xl px-3 py-2.5", m.me ? "rounded-br-md bg-sky text-white" : "rounded-bl-md bg-ink-700")}>
              <div className="text-[13px] font-semibold leading-snug">{m.t}</div>
              {m.chart && (
                <div className="mt-2 overflow-hidden rounded-xl bg-ink-900 p-1.5">
                  <CandleChart data={fromCloses(m.chart, 0.6, 99)} W={220} H={90} animate={false} />
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <Mascot size={34} mood="think" />
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-ink-700 px-3 py-2.5 text-[13px] font-semibold">
              {partial}<span className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 animate-pulse bg-sky" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {["Где ставить стоп?", "Что такое плечо?", "Когда покупать?", "Боюсь убытков"].map((q) => (
          <button key={q} onClick={() => send(q)} className="whitespace-nowrap rounded-full bg-ink-700 px-3 py-1.5 text-[11px] font-bold shadow-[0_2px_0_#08112a] hover:bg-ink-600">{q}</button>
        ))}
      </div>
      <div className="panel-inset mt-2 flex items-center gap-2 p-1.5 pl-3 !rounded-2xl">
        <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={120} placeholder="Спроси Торо…" className="h-10 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-mist/60" />
        <button onClick={() => sfx.tap()} className="grid h-10 w-10 place-items-center rounded-xl text-mist hover:text-white"><Mic size={16} /></button>
        <button onClick={() => send()} className="btn3d !h-10 !w-10 !rounded-xl !p-0" style={{ ["--c" as string]: "var(--color-bull)", ["--cd" as string]: "var(--color-bull-d)", ["--depth" as string]: "3px" }}><Send size={15} /></button>
      </div>
    </Asset>
  );
}

/* ============ AC-02 SKILL TREE ============ */
type Skill = { id: string; n: string; x: number; y: number; cost: number; req: string[]; c: string };
const skills: Skill[] = [
  { id: "candle", n: "Candles", x: 50, y: 88, cost: 0, req: [], c: "#22d39a" },
  { id: "trend", n: "Trends", x: 22, y: 66, cost: 50, req: ["candle"], c: "#3b82ff" },
  { id: "sr", n: "S&R", x: 78, y: 66, cost: 50, req: ["candle"], c: "#ffc53d" },
  { id: "risk", n: "Risk", x: 50, y: 48, cost: 120, req: ["trend", "sr"], c: "#ff8a3d" },
  { id: "lev", n: "Leverage", x: 20, y: 28, cost: 200, req: ["risk"], c: "#8b5cff" },
  { id: "psy", n: "Psychology", x: 80, y: 28, cost: 200, req: ["risk"], c: "#2bd9ff" },
  { id: "master", n: "Master", x: 50, y: 8, cost: 400, req: ["lev", "psy"], c: "#ff4f6d" },
];
function SkillTree() {
  const { s } = useGame();
  const [owned, setOwned] = useState<string[]>(["candle"]);
  const [bank, setBank] = useState(320);
  const [sel, setSel] = useState<Skill | null>(null);
  const can = (k: Skill) => !owned.includes(k.id) && k.req.every((r) => owned.includes(r)) && bank >= k.cost;
  const buy = (k: Skill) => {
    if (!can(k)) { sfx.error(); return; }
    setBank((b) => b - k.cost);
    setOwned((o) => [...o, k.id]);
    sfx.levelUp();
  };
  return (
    <Asset code="AC-02" title="Skill Tree" desc="Дерево навыков трейдера: открывай узлы за XP, связи загораются, мастер открывается последним." hint="Открывай навыки" specs={["7 nodes", "prereqs", "XP spend"]}>
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
        <span className="text-mist">Skill points <span className="num text-gold">{bank}</span></span>
        <span className="text-mist">global XP <span className="num text-sky">{s.xp}</span></span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-2xl bg-ink-900/60">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {skills.flatMap((k) => k.req.map((r) => {
            const a = skills.find((x) => x.id === r)!;
            const on = owned.includes(k.id) && owned.includes(r);
            return <line key={`${r}-${k.id}`} x1={a.x} y1={100 - a.y} x2={k.x} y2={100 - k.y} stroke={on ? k.c : "#273f75"} strokeWidth="1.2" style={{ filter: on ? `drop-shadow(0 0 2px ${k.c})` : undefined }} />;
          }))}
        </svg>
        {skills.map((k) => {
          const has = owned.includes(k.id);
          const avail = can(k);
          return (
            <button
              key={k.id}
              onClick={() => { setSel(k); has ? sfx.soft() : avail ? buy(k) : sfx.error(); }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${k.x}%`, top: `${100 - k.y}%` }}
            >
              <span className={cn("anim-pop grid h-14 w-14 place-items-center rounded-2xl border-2 text-[10px] font-black uppercase transition-transform hover:scale-110", has ? "" : avail ? "border-dashed" : "opacity-50 grayscale")} style={{ background: has ? `linear-gradient(160deg, ${k.c}, ${k.c}88)` : "#16264a", borderColor: k.c, boxShadow: has ? `0 4px 0 #08112a, 0 0 18px ${k.c}66` : avail ? `0 0 14px ${k.c}55` : "0 4px 0 #08112a", color: has ? "#0a1224" : k.c }}>
                {has ? "✓" : k.cost || "★"}
              </span>
              <span className="mt-1 block whitespace-nowrap text-center text-[9px] font-extrabold" style={{ color: has ? k.c : "#8a9bc4" }}>{k.n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex min-h-[44px] items-center justify-between rounded-xl bg-ink-800 px-3 py-2 text-[11px]">
        {sel ? <><span><b>{sel.n}</b> · {sel.req.length ? `needs ${sel.req.join(", ")}` : "starter"} · <span className="num text-gold">{sel.cost} SP</span></span>{!owned.includes(sel.id) && can(sel) && <span className="text-bull">tap node to unlock</span>}</> : <span className="text-mist">Тапни узел, чтобы открыть</span>}
        <button onClick={() => { setBank((b) => b + 100); sfx.coin(); }} className="ml-2 font-bold text-sky">+100</button>
      </div>
    </Asset>
  );
}

/* ============ AC-03 JOURNAL ============ */
type J = { id: number; pair: string; side: "long" | "short"; pnl: number; mood: string; note: string };
function Journal() {
  const [rows, setRows] = useState<J[]>([
    { id: 1, pair: "BTC", side: "long", pnl: 42, mood: "😎", note: "Пробой 64k по плану" },
    { id: 2, pair: "SOL", side: "short", pnl: -18, mood: "😤", note: "Вошёл без стопа, урок" },
    { id: 3, pair: "ETH", side: "long", pnl: 27, mood: "🙂", note: "Отскок от поддержки" },
  ]);
  const [f, setF] = useState<"all" | "long" | "short" | "win" | "loss">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pair: "BTC", side: "long" as "long" | "short", pnl: 0, mood: "🙂", note: "" });
  const list = rows.filter((r) => f === "all" || (f === "long" && r.side === "long") || (f === "short" && r.side === "short") || (f === "win" && r.pnl > 0) || (f === "loss" && r.pnl <= 0));
  const tot = rows.reduce((a, r) => a + r.pnl, 0);
  const wr = rows.length ? Math.round((rows.filter((r) => r.pnl > 0).length / rows.length) * 100) : 0;
  const add = () => {
    if (!form.note.trim()) { sfx.error(); return; }
    setRows((x) => [{ id: Date.now(), ...form }, ...x]);
    setForm({ pair: "BTC", side: "long", pnl: 0, mood: "🙂", note: "" });
    setOpen(false);
    sfx.correct();
  };
  return (
    <Asset code="AC-03" title="Trading Journal" desc="Дневник сделок: фильтры, винрейт, добавление записи с настроением. Дисциплина в цифрах." hint="Добавь сделку" specs={["filters", "winrate", "mood log"]}>
      <div className="mb-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Total</div><div className={cn("num text-sm font-extrabold", tot >= 0 ? "text-bull" : "text-bear")}>{tot >= 0 ? "+" : ""}{tot}</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Winrate</div><div className="num text-sm font-extrabold">{wr}%</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Trades</div><div className="num text-sm font-extrabold">{rows.length}</div></div>
      </div>
      <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
        {(["all", "long", "short", "win", "loss"] as const).map((x) => <button key={x} onClick={() => { setF(x); sfx.tick(); }} className={cn("h-8 shrink-0 rounded-lg px-3 text-[10px] font-extrabold uppercase", f === x ? "bg-sky" : "bg-ink-800 text-mist")}>{x}</button>)}
      </div>
      <div className="max-h-44 space-y-1.5 overflow-y-auto">
        {list.map((r) => (
          <div key={r.id} className="anim-slide-right flex items-center gap-2.5 rounded-xl bg-ink-800 p-2">
            <span className="text-xl">{r.mood}</span>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5 text-[12px] font-extrabold">{r.pair} {r.side === "long" ? <TrendingUp size={12} className="text-bull" /> : <TrendingDown size={12} className="text-bear" />}<span className={cn("num ml-auto", r.pnl >= 0 ? "text-bull" : "text-bear")}>{r.pnl >= 0 ? "+" : ""}{r.pnl}</span></div><div className="truncate text-[11px] text-mist">{r.note}</div></div>
          </div>
        ))}
        {!list.length && <div className="py-4 text-center text-[11px] text-mist">Нет записей</div>}
      </div>
      {open ? (
        <div className="anim-pop mt-2 space-y-2 rounded-2xl bg-ink-800 p-3">
          <div className="grid grid-cols-3 gap-2">
            <select value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })} className="h-9 rounded-lg bg-ink-900 px-2 text-[12px] font-bold">{["BTC", "ETH", "SOL", "TON"].map((p) => <option key={p}>{p}</option>)}</select>
            <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value as "long" | "short" })} className="h-9 rounded-lg bg-ink-900 px-2 text-[12px] font-bold"><option value="long">Long</option><option value="short">Short</option></select>
            <input type="number" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: +e.target.value })} className="num h-9 rounded-lg bg-ink-900 px-2 text-[12px] font-bold" placeholder="PnL" />
          </div>
          <div className="flex gap-1">{["😎", "🙂", "😐", "😤", "😭"].map((m) => <button key={m} onClick={() => setForm({ ...form, mood: m })} className={cn("grid h-9 w-9 place-items-center rounded-lg text-lg", form.mood === m ? "bg-sky/20 ring-2 ring-sky" : "bg-ink-900")}>{m}</button>)}</div>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={60} placeholder="Что сработало?" className="h-10 w-full rounded-lg bg-ink-900 px-3 text-[12px] font-semibold outline-none" />
          <div className="grid grid-cols-2 gap-2"><GhostBtn className="!h-10" onClick={() => setOpen(false)}>Cancel</GhostBtn><Btn tone="bull" className="!h-10 !text-[11px]" onClick={add}>Save</Btn></div>
        </div>
      ) : (
        <Btn tone="sky" block size="sm" className="mt-2" onClick={() => setOpen(true)}>+ Log trade</Btn>
      )}
    </Asset>
  );
}

/* ============ AC-04 MISTAKE REVIEW ============ */
const mistakes = [
  { q: "Где ставить стоп?", mine: "После входа", right: "До входа", why: "Решение под риском принимают эмоции, а не план." },
  { q: "Молот — это…", mine: "Медвежий сигнал", right: "Бычий разворот", why: "Длинная нижняя тень = покупатели выкупили падение." },
  { q: "Плечо 10x ликвидирует при…", mine: "−50%", right: "−10%", why: "Ликвидация ≈ 100% / плечо." },
];
function MistakeReview() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [fixed, setFixed] = useState<number[]>([]);
  const m = mistakes[i];
  const grade = (remembered: boolean) => {
    if (remembered) { setFixed((f) => [...f, i]); sfx.correct(); } else sfx.wrong();
    setShow(false);
    setI((x) => (x + 1) % mistakes.length);
  };
  return (
    <Asset code="AC-04" title="Mistake Review" desc="Разбор твоих ошибок из прошлых уроков: вопрос, твой ответ, правильный — и проверка «запомнил?»." hint="Разбери ошибки" specs={["3 reviews", "self-grade", "loop"]}>
      <div className="mb-2 flex items-center justify-between"><Chip tone="bear">Needs review · {mistakes.length - fixed.length}</Chip><span className="num text-[11px] text-mist">{i + 1}/{mistakes.length}</span></div>
      <div key={i} className="anim-slide-right rounded-2xl bg-ink-800 p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">Ты ошибся здесь</div>
        <div className="font-display mt-1 text-base font-extrabold">{m.q}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-bear/15 p-2.5"><div className="text-[9px] font-extrabold uppercase text-bear">Твой ответ</div><div className="text-[13px] font-bold line-through">{m.mine}</div></div>
          <div className={cn("rounded-xl p-2.5", show ? "anim-pop bg-bull/15" : "bg-ink-900")}><div className="text-[9px] font-extrabold uppercase text-bull">Правильно</div><div className="text-[13px] font-bold">{show ? m.right : "???"}</div></div>
        </div>
        {show && <div className="anim-fade mt-2 rounded-xl bg-ink-900 p-2.5 text-[12px] text-snow/80">{m.why}</div>}
      </div>
      {!show ? (
        <Btn tone="sky" block size="sm" className="mt-3" onClick={() => { setShow(true); sfxRaw.pop(); }}>Reveal answer</Btn>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Btn tone="bear" size="sm" onClick={() => grade(false)} silent>Still fuzzy</Btn>
          <Btn tone="bull" size="sm" onClick={() => grade(true)} silent>Got it ✓</Btn>
        </div>
      )}
      <div className="mt-2"><Bar value={(fixed.length / mistakes.length) * 100} tone="bull" h={8} glow={false} /></div>
    </Asset>
  );
}

/* ============ AC-05 GLOSSARY ============ */
const terms = [
  ["Спред", "Разница bid/ask.", "sky"], ["Ликвидность", "Лёгкость сделки без сдвига цены.", "bull"],
  ["Волатильность", "Сила колебаний цены.", "gold"], ["Маржа", "Залог под позицию.", "violet"],
  ["Фандинг", "Плата между лонгами и шортами.", "cyan"], ["Проскальзывание", "Разница ожидаемой и реальной цены.", "bear"],
  ["Доминация", "Доля BTC в рынке.", "ember"], ["Стейкинг", "Доход за блокировку монет.", "bull"],
];
function Glossary() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = terms.filter(([t]) => t.toLowerCase().includes(q.toLowerCase()));
  const colors: Record<string, string> = { sky: "#3b82ff", bull: "#22d39a", gold: "#ffc53d", violet: "#8b5cff", cyan: "#2bd9ff", bear: "#ff4f6d", ember: "#ff8a3d" };
  return (
    <Asset code="AC-05" title="Glossary Explorer" desc="Словарь трейдера с живым поиском и раскрывающимися карточками. Пустое состояние тоже красиво." hint="Найди термин" specs={["live search", "8 terms", "expand"]}>
      <div className="panel-inset mb-3 flex items-center gap-2 px-3 !rounded-xl">
        <Search size={15} className="text-mist" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти термин…" className="h-10 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-mist/60" />
        {q && <button onClick={() => setQ("")} className="text-mist">✕</button>}
      </div>
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
        {list.map(([t, d, c]) => {
          const isOpen = open === t;
          return (
            <button key={t} onClick={() => { setOpen(isOpen ? null : t); sfx.tick(); }} className={cn("rounded-2xl border-2 p-3 text-left transition-all", isOpen ? "col-span-2" : "")} style={{ borderColor: isOpen ? colors[c] : "transparent", background: isOpen ? `${colors[c]}14` : "#1a2c55" }}>
              <div className="flex items-center justify-between"><span className="text-[13px] font-extrabold" style={{ color: colors[c] }}>{t}</span><ChevronRight size={14} className={cn("text-mist transition-transform", isOpen && "rotate-90")} /></div>
              {isOpen && <p className="anim-fade mt-1.5 text-[12px] leading-snug text-snow/85">{d}</p>}
            </button>
          );
        })}
        {!list.length && <div className="col-span-2 py-6 text-center"><BookOpen size={28} className="mx-auto text-mist" /><div className="mt-2 text-[12px] text-mist">Ничего не найдено — попробуй «стоп»</div></div>}
      </div>
    </Asset>
  );
}

/* ============ AC-06 MENTOR CALL ============ */
function MentorCall() {
  const [call, setCall] = useState(false);
  const [t, setT] = useState(0);
  const [muted, setMuted] = useState(false);
  const [bars, setBars] = useState<number[]>([...Array(24)].map(() => 0.2));
  useEffect(() => {
    if (!call) return;
    const tm = setInterval(() => setT((v) => v + 1), 1000);
    const wv = setInterval(() => setBars((b) => b.map(() => (muted ? 0.12 : 0.15 + Math.random() * 0.85))), 140);
    return () => { clearInterval(tm); clearInterval(wv); };
  }, [call, muted]);
  const mm = String(Math.floor(t / 60)).padStart(2, "0"), ss = String(t % 60).padStart(2, "0");
  return (
    <Asset code="AC-06" title="Mentor Call" desc="Созвон с наставником: таймер, живая волна голоса, мут, завершение с итогом сессии." hint="Позвони ментору" specs={["timer", "waveform", "mute"]}>
      <div className="relative grid h-64 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_30%,#1d3a7a,#0a1224_75%)]">
        {!call && t === 0 ? (
          <div className="anim-fade text-center">
            <Mascot size={110} mood="happy" />
            <div className="font-display mt-1 text-base font-extrabold">Торо на связи</div>
            <div className="text-[11px] text-mist">15 минут разбора твоих сделок</div>
          </div>
        ) : !call ? (
          <div className="anim-pop text-center">
            <GraduationCap size={40} className="mx-auto text-gold" />
            <div className="font-display mt-2 text-lg font-extrabold">Session: {mm}:{ss}</div>
            <div className="text-[11px] text-mist">Разобрано 3 сделки · +40 XP начислено</div>
          </div>
        ) : (
          <div className="w-full px-6 text-center">
            <div className="relative mx-auto w-fit">
              <Mascot size={110} mood="think" />
              {!muted && <span className="absolute inset-0 rounded-full border-2 border-bull" style={{ animation: "pulse-ring 1.6s infinite" }} />}
            </div>
            <div className="num mt-1 text-lg font-extrabold">{mm}:{ss}</div>
            <div className="mt-2 flex h-10 items-center justify-center gap-1">
              {bars.map((b, i) => <span key={i} className="w-1 rounded-full transition-all duration-140" style={{ height: `${b * 100}%`, background: muted ? "#3a5494" : "#22d39a" }} />)}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        {call ? (
          <>
            <button onClick={() => { setMuted(!muted); sfx.toggle(!muted); }} className={cn("grid h-12 w-12 place-items-center rounded-full", muted ? "bg-bear" : "bg-ink-700")}>{muted ? <PhoneOff size={18} /> : <Mic size={18} />}</button>
            <button onClick={() => { setCall(false); sfx.levelUp(); }} className="btn3d h-12 w-12 !rounded-full !p-0" style={{ ["--c" as string]: "var(--color-bear)", ["--cd" as string]: "var(--color-bear-d)" }}><PhoneOff size={18} /></button>
          </>
        ) : (
          <Btn tone="bull" onClick={() => { setCall(true); setT(0); sfxRaw.pop(); }}><Phone size={16} /> {t ? "Call again" : "Start call"}</Btn>
        )}
      </div>
    </Asset>
  );
}

export default function Coach() {
  const tips = useMemo(() => ["Разбирай каждую убыточную сделку в журнале", "Повторяй ошибки через 1-3-7 дней", "Открывай навыки по порядку дерева"], []);
  return (
    <Section id="coach" index="AC" title="AI Coach & Mastery" subtitle="Наставник, дерево навыков, журнал, разбор ошибок, словарь, созвоны">
      <CoachChat />
      <SkillTree />
      <Journal />
      <MistakeReview />
      <Glossary />
      <MentorCall />
      <div className="hidden">{tips.join()}</div>
    </Section>
  );
}
