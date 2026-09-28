import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Crown, Flame, Gift, Heart, Lock, RotateCcw, Star, Swords, Trophy, X, Zap } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Card, Meter, SectionShell, Tag } from "../components/ui";
import { cn } from "../utils/cn";

const nodes = [
  { id: 0, t: "Что такое свеча?", s: "done", x: 0 },
  { id: 1, t: "Long vs Short", s: "done", x: 46 },
  { id: 2, t: "Поддержка", s: "done", x: 0 },
  { id: 3, t: "Сундук наград", s: "chest", x: -46 },
  { id: 4, t: "Плечо ×10", s: "current", x: 0 },
  { id: 5, t: "Ликвидация", s: "todo", x: 46 },
  { id: 6, t: "Риск-менеджмент", s: "todo", x: 0 },
  { id: 7, t: "BOSS: Paper Trade", s: "boss", x: -46 },
];

const quizQ = [
  { q: "Зелёная свеча с длинной нижней тенью у поддержки — это…", a: ["Бычий молот · возможен разворот вверх", "Медвежье поглощение", "Доджи неопределённости", "Паттерн «крест смерти»"], correct: 0 },
  { q: "Плечо ×10: депозит упал на 9%. Что с позицией?", a: ["−90% · почти ликвидация", "−9% · всё спокойно", "+90% · прибыль", "Ничего · плечо не влияет"], correct: 0 },
  { q: "Где ставить стоп-лосс по правилам риск-менеджмента?", a: ["За ключевой уровень · риск 1–2%", "Случайно · на глаз", "Как можно дальше", "Стопы не нужны"], correct: 0 },
];

const cards = [
  { f: "HODL", b: "Держать актив долго, игнорируя волатильность. От опечатки 'hold'." },
  { f: "FOMO", b: "Страх упустить рост. Главная причина покупок на хаях." },
  { f: "ATH", b: "All-Time High — исторический максимум цены актива." },
  { f: "DYOR", b: "Do Your Own Research — проверяй всё сам." },
];

function Path() {
  const [active, setActive] = useState(4);
  const [claimed, setClaimed] = useState(false);
  return (
    <div className="relative mx-auto max-w-[300px] py-2">
      <svg className="absolute left-1/2 top-0 -z-0 h-full w-[120px] -translate-x-1/2 opacity-60" viewBox="0 0 120 560" preserveAspectRatio="none">
        <path d="M60,10 C110,70 10,120 60,180 C110,240 10,290 60,350 C110,410 10,460 60,530" fill="none" stroke="#244385" strokeWidth={10} strokeLinecap="round" strokeDasharray="2 14" style={{ animation: "dash-flow 1.2s linear infinite" }} />
        <path d="M60,10 C110,70 10,120 60,180" fill="none" stroke="#8ef23c" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-5">
        {nodes.map(n => (
          <div key={n.id} className="flex flex-col items-center" style={{ transform: `translateX(${n.x}px)` }}>
            <motion.button whileTap={{ scale: .85 }} onClick={() => setActive(n.id)}
              className={cn("relative flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 transition",
                n.s === "done" && "border-[#ffd76a]/40 bg-gradient-to-b from-[#ffd76a] to-[#e79a06] text-[#3a2200]",
                n.s === "current" && "anim-pulse-ring border-[#b6ff7d] bg-gradient-to-b from-[#a4ff5e] to-[#62c91d] text-[#0a2210]",
                n.s === "chest" && (claimed ? "border-white/20 bg-gradient-to-b from-[#3a4c7d] to-[#22345e] text-[#8ea6d8]" : "border-[#ffd76a] bg-gradient-to-b from-[#2a1f08] to-[#141021] text-[#ffc531]"),
                n.s === "todo" && "border-white/10 bg-gradient-to-b from-[#22345e] to-[#101f47] text-[#54678f]",
                n.s === "boss" && "border-[#ff5470] bg-gradient-to-b from-[#4a1020] to-[#1c0a14] text-[#ff8ba0]",
              )}
              style={{ boxShadow: n.s === "todo" ? "0 6px 0 #030816, inset 0 2px 0 rgba(255,255,255,.12)" : "0 6px 0 #030816, inset 0 2px 0 rgba(255,255,255,.45), 0 10px 24px rgba(0,0,0,.5)", animation: n.s === "chest" && !claimed ? "chest-glow 2s infinite" : undefined }}>
              {n.s === "done" && <Check size={26} strokeWidth={3.5} />}
              {n.s === "current" && <Star size={26} className="fill-[#0a2210]" />}
              {n.s === "chest" && <Gift size={26} />}
              {n.s === "todo" && <Lock size={22} />}
              {n.s === "boss" && <Swords size={26} />}
              {n.s === "current" && (
                <span className="absolute -top-8 whitespace-nowrap rounded-xl border border-[#8ef23c]/40 bg-[#0a2210] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#8ef23c]">Start here</span>
              )}
            </motion.button>
            <AnimatePresence>
              {active === n.id && (
                <motion.div initial={{ opacity: 0, y: 6, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: .9 }}
                  className="panel-3d anim-pop z-20 mt-2 !rounded-2xl px-4 py-3 text-center">
                  <p className="text-xs font-extrabold text-white">{n.t}</p>
                  <p className="mb-2 text-[10px] text-[#8ea6d8]">+20 XP · 3 мин</p>
                  {n.s === "chest" && !claimed ? (
                    <button onClick={() => { setClaimed(true); confetti({ particleCount: 90, spread: 75, origin: { y: .6 }, colors: ["#ffc531", "#8ef23c", "#5b8cff"] }); }}
                      className="btn3d btn3d-gold px-5 py-2 text-[11px]">Open</button>
                  ) : n.s === "todo" ? (
                    <span className="text-[10px] font-bold text-[#54678f]">Пройди предыдущий урок</span>
                  ) : (
                    <button className="btn3d btn3d-green px-5 py-2 text-[11px]">{n.s === "done" ? "Repeat" : "Start +20"}</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quiz({ onXp }: { onXp: (n: number) => void }) {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [hearts, setHearts] = useState(5);
  const [combo, setCombo] = useState(2);
  const [done, setDone] = useState(false);
  const q = quizQ[qi];
  const correct = pick === q.correct;

  const answer = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    if (i === q.correct) {
      setCombo(c => c + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: .7 }, colors: ["#8ef23c", "#fff"] });
    } else { setHearts(h => Math.max(0, h - 1)); setCombo(0); }
  };
  const next = () => {
    if (pick === q.correct) onXp(20 + combo * 5);
    if (qi + 1 >= quizQ.length) setDone(true);
    else { setQi(qi + 1); setPick(null); }
  };
  const reset = () => { setQi(0); setPick(null); setHearts(5); setCombo(2); setDone(false); };

  if (done) return (
    <div className="anim-pop py-6 text-center">
      <Trophy size={44} className="mx-auto text-[#ffc531]" />
      <p className="display mt-2 text-xl font-extrabold text-white">Урок пройден!</p>
      <p className="text-xs text-[#8ea6d8]">Точность · Combo ×{combo} · Hearts {hearts}/5</p>
      <button onClick={reset} className="btn3d btn3d-green mt-4 px-6 py-3 text-xs"><RotateCcw size={14} /> Retry lesson</button>
    </div>
  );
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={reset} className="text-[#7d92c4] hover:text-white"><X size={18} /></button>
        <Meter value={(qi / quizQ.length) * 100 + (pick !== null ? 100 / quizQ.length / 2 : 0)} tone="green" h={14} />
        <span className="flex items-center gap-1 text-sm font-extrabold text-[#ff5470]"><Heart size={15} className="fill-[#ff5470]" />{hearts}</span>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Tag tone="gold"><Flame size={11} /> Combo ×{combo}</Tag>
        <Tag tone="blue">Вопрос {qi + 1}/{quizQ.length}</Tag>
      </div>
      <p className="display mb-3 text-[15px] font-bold leading-snug text-white">{q.q}</p>
      <div className="space-y-2">
        {q.a.map((opt, i) => {
          const isC = pick !== null && i === q.correct;
          const isW = pick === i && i !== q.correct;
          return (
            <motion.button key={i} whileTap={pick === null ? { scale: .98 } : {}} onClick={() => answer(i)}
              className={cn("flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[13px] font-bold transition",
                isC ? "anim-pop border-[#8ef23c] bg-[#8ef23c]/12 text-[#a4ff5e]" :
                  isW ? "anim-shake border-[#ff5470] bg-[#ff5470]/12 text-[#ff8ba0]" :
                    pick !== null ? "border-white/8 bg-black/20 text-[#54678f]" : "border-white/12 bg-black/25 text-[#dbe6ff] hover:border-[#5b8cff]/50 hover:bg-[#5b8cff]/8")}
              style={{ boxShadow: "0 3px 0 #030816" }}>
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-extrabold",
                isC ? "border-[#8ef23c] bg-[#8ef23c] text-[#0a2210]" : isW ? "border-[#ff5470] bg-[#ff5470] text-white" : "border-white/15 bg-white/5 text-[#8ea6d8]")}>
                {isC ? <Check size={14} strokeWidth={3.5} /> : isW ? <X size={14} strokeWidth={3.5} /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {pick !== null && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("mt-3 rounded-2xl border p-3.5", correct ? "border-[#8ef23c]/40 bg-[#8ef23c]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
            <p className={cn("display text-sm font-extrabold", correct ? "text-[#8ef23c]" : "text-[#ff5470]")}>
              {correct ? `Верно! +${20 + combo * 5} XP` : "Мимо — запомни этот паттерн"}
            </p>
            <p className="mb-3 text-xs text-[#aebde6]">{correct ? "Молот у поддержки = покупатели перехватили инициативу." : "Правильный ответ подсвечен зелёным. Сердце −1."}</p>
            <button onClick={next} className={cn("btn3d w-full py-3.5 text-xs", correct ? "btn3d-green" : "btn3d-short")}>{qi + 1 >= quizQ.length ? "Finish" : "Continue"}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnPath({ onXp }: { onXp: (n: number) => void }) {
  const [flip, setFlip] = useState<number | null>(null);
  const [week] = useState([1, 1, 1, 0, 1, 1, 2]);
  return (
    <SectionShell id="learn" index="04" kicker="Learn Path" title="Путь уроков как в Duolingo" desc="Змейка прогресса, квиз с сердцами и комбо, флип-карточки терминов. Кликни на сундук — будет конфетти."
      right={<div className="flex gap-2"><Tag tone="green"><Zap size={11} /> +XP live</Tag><Tag tone="red"><Heart size={11} /> hearts</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr_300px]">
        <Card title="Module 2 · Price Action" sub="8 nodes · tap any" className="!bg-none"><Path /></Card>
        <Card title="Interactive Quiz" sub="3 вопроса · hearts + combo" action={<Tag tone="gold"><Crown size={11} /> Boss ready</Tag>}>
          <Quiz onXp={onXp} />
        </Card>
        <div className="flex flex-col gap-5">
          <Card title="Flashcards" sub="Tap to flip · 3D" action={<BookOpen size={15} className="text-[#8ea6d8]" />}>
            <div className="grid grid-cols-2 gap-2.5">
              {cards.map((c, i) => (
                <div key={i} className="perspective h-[104px] cursor-pointer" onClick={() => setFlip(flip === i ? null : i)}>
                  <motion.div animate={{ rotateY: flip === i ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="preserve-3d relative h-full w-full">
                    <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-2xl border border-[#5b8cff]/30 bg-gradient-to-b from-[#1b3773] to-[#0e1f4a]" style={{ boxShadow: "0 4px 0 #030816, inset 0 1px 0 rgba(255,255,255,.2)" }}>
                      <span className="display text-sm font-extrabold text-white">{c.f}</span>
                    </div>
                    <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-2xl border border-[#8ef23c]/40 bg-gradient-to-b from-[#1c3a12] to-[#0d1f08] p-2 text-center" style={{ transform: "rotateY(180deg)", boxShadow: "0 4px 0 #030816" }}>
                      <span className="text-[10px] font-semibold leading-tight text-[#c8f5a0]">{c.b}</span>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Streak · 12 дней" sub="Не пропусти сегодня" action={<Tag tone="red"><Flame size={11} /> freeze ×2</Tag>}>
            <div className="flex justify-between">
              {["П", "В", "С", "Ч", "П", "С", "В"].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border",
                    week[i] === 1 ? "border-[#ff8b3d]/50 bg-gradient-to-b from-[#ff9d4d] to-[#c25a12] text-white" :
                      week[i] === 2 ? "anim-pulse-ring border-[#8ef23c] bg-gradient-to-b from-[#a4ff5e] to-[#62c91d] text-[#0a2210]" :
                        "border-white/10 bg-black/30 text-[#54678f]")}
                    style={{ boxShadow: "0 3px 0 #030816" }}>
                    {week[i] === 0 ? <X size={15} /> : <Flame size={17} className={week[i] === 2 ? "" : "fill-white/20"} />}
                  </div>
                  <span className="text-[10px] font-bold text-[#7d92c4]">{d}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}
