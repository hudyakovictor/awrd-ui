/* ------------------------------------------------------------------
 * 35 · MENTORSHIP & CERTS — mentor chat sim, exams, certificates
 * ------------------------------------------------------------------ */
import { Award, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Tag } from "../components/ui";
import { GameSection, QuizEngine, type QuizQ, StarBurst } from "../fx/gamekit";
import { pickQuiz } from "../game/engines";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

const mentorLines = [
  { q: "Как не FOMO-шить?", a: "Правило: никаких входов без заранее записанного сетапа. Если идея родилась от зелёных свечей — это уже эмоция." },
  { q: "Стоит ли держать через ночь?", a: "Только если сетап свинговый и стоп учитывает гэп. Иначе — flat overnight." },
  { q: "Плечо ×20 нормально?", a: "Для обучения — нет. Сначала винрейт и R:R на ×1–×3. Плечо умножает и ошибку." },
  { q: "Как вести журнал?", a: "Скрин, причина входа, эмоция 1–5, результат, урок. 5 полей — хватит." },
];

export default function Mentorship({ onXp, toast }: Props) {
  const [tab, setTab] = useState<"mentor" | "exam" | "certs">("mentor");
  const [chat, setChat] = useState<{ role: "me" | "m"; t: string }[]>([
    { role: "m", t: "Привет. Я твой ментор-бык. Спроси про FOMO, плечо или журнал." },
  ]);
  const [exam, setExam] = useState(false);
  const [examDone, setExamDone] = useState<null | { score: number }>(null);
  const [certs, setCerts] = useState<string[]>([]);
  const qs = useState(() => pickQuiz("all", 6).map(q => ({ q: q.q, a: q.a, correct: q.correct, explain: q.explain } as QuizQ)))[0];

  const ask = (line: typeof mentorLines[number]) => {
    setChat(c => [...c, { role: "me", t: line.q }, { role: "m", t: line.a }]);
    sfx.soft(); onXp(5);
  };

  return (
    <GameSection id="mentor" index="35" kicker="Mentorship" title="Ментор и сертификаты"
      desc="Чат с ментором, экзамен на 6 вопросов, выдаваемые сертификаты с конфетти."
      right={<Tag tone="blue"><MessageCircle size={11} /> Coach</Tag>}>
      <div className="mb-4 flex gap-2">
        {(["mentor", "exam", "certs"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); sfx.tick(); }} className={cn("rounded-xl px-4 py-2 text-xs font-extrabold capitalize", tab === t ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{t}</button>
        ))}
      </div>
      {tab === "mentor" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="panel-3d flex h-[380px] flex-col p-4">
            <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto">
              {chat.map((m, i) => (
                <div key={i} className={cn("max-w-[90%] rounded-2xl px-3 py-2 text-xs", m.role === "me" ? "ml-auto bg-[#5b8cff]/20 text-[#9db9ff]" : "bg-white/5 text-[#dbe6ff]")}>{m.t}</div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Quick asks</p>
            {mentorLines.map(l => (
              <button key={l.q} onClick={() => ask(l)} className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-left text-[11px] font-bold text-white hover:border-[#8ef23c]/40">{l.q}</button>
            ))}
          </div>
        </div>
      )}
      {tab === "exam" && (
        <div className="panel-3d p-5">
          {!exam && !examDone && (
            <div className="py-8 text-center">
              <ShieldCheck size={48} className="mx-auto text-[#5b8cff]" />
              <p className="display mt-3 text-xl font-extrabold text-white">Certification Exam</p>
              <p className="text-sm text-[#8ea6d8]">6 вопросов · 3★ = сертификат</p>
              <button onClick={() => setExam(true)} className="btn3d btn3d-blue mt-4 px-8 py-3 text-xs">Start exam</button>
            </div>
          )}
          {exam && !examDone && (
            <QuizEngine questions={qs} title="Exam" timePerQ={25} onDone={(r) => {
              setExam(false); setExamDone({ score: r.score });
              onXp(r.score);
              if (r.score >= 50) {
                setCerts(c => [...c, `Certified Trader · ${new Date().toLocaleDateString()}`]);
                confetti({ particleCount: 120, spread: 90 }); sfx.levelUp();
                toast("Certified!", "New certificate unlocked", "gold");
              }
            }} />
          )}
          {examDone && (
            <div className="py-8 text-center">
              <StarBurst stars={examDone.score >= 50 ? 3 : examDone.score >= 30 ? 2 : 1} />
              <p className="display mt-3 text-2xl font-extrabold text-white">{examDone.score} pts</p>
              <button onClick={() => { setExamDone(null); setExam(false); }} className="btn3d btn3d-green mt-4 px-6 py-3 text-xs">Done</button>
            </div>
          )}
        </div>
      )}
      {tab === "certs" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {certs.length === 0 && <p className="col-span-2 py-10 text-center text-sm text-[#7d92c4]">Сдай exam на 3★</p>}
          {certs.map(c => (
            <div key={c} className="panel-3d relative overflow-hidden p-5">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#ffc531]/20 blur-2xl" />
              <Award size={36} className="text-[#ffc531]" />
              <p className="display mt-2 text-lg font-extrabold text-white">{c}</p>
              <p className="text-[11px] text-[#8ea6d8]">TRADELINGO Academy · verified</p>
            </div>
          ))}
        </div>
      )}
    </GameSection>
  );
}
