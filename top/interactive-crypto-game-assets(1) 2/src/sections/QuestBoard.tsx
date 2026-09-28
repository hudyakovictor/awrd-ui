/* ------------------------------------------------------------------
 * 30 · QUEST BOARD — branching story quests with choices & combat checks
 * ------------------------------------------------------------------ */
import { ChevronRight, Map } from "lucide-react";
import { useState } from "react";
import { Card, Tag } from "../components/ui";
import { fireSmall, fireWin, GameSection, StarBurst } from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

type Node = {
  id: string; title: string; body: string; emoji: string;
  choices?: { label: string; next: string; check?: "risk" | "skill" | "luck"; dc?: number; reward?: number }[];
  end?: "win" | "lose" | "neutral";
};

const NODES: Record<string, Node> = {
  start: {
    id: "start", title: "Сигнал в 3:00", emoji: "📡",
    body: "Ночью приходит алерт: кит накопил 4 200 BTC. Рынок спит. Что делаешь?",
    choices: [
      { label: "Изучить on-chain глубже", next: "research", reward: 10 },
      { label: "Сразу long ×10", next: "yolo", check: "luck", dc: 55 },
      { label: "Игнор — спать", next: "sleep" },
    ],
  },
  research: {
    id: "research", title: "On-chain разведка", emoji: "🔍",
    body: "Кошелёк связан с холодным хранилищем фонда. Исторически они копят 2–3 недели перед импульсом.",
    choices: [
      { label: "Открыть long с риском 1%", next: "smart_long", check: "risk", dc: 40, reward: 25 },
      { label: "Поставить лимиты лесенкой", next: "ladder", reward: 20 },
      { label: "Написать в клан", next: "clan" },
    ],
  },
  yolo: {
    id: "yolo", title: "YOLO вход", emoji: "🎰",
    body: "Цена сразу идёт против. Фандинг положительный. Сердце колотится.",
    choices: [
      { label: "Усреднить", next: "avg", check: "luck", dc: 70 },
      { label: "Стоп по плану (если был…)", next: "stop_late", reward: 5 },
      { label: "Держать «отскочит»", next: "baghold" },
    ],
  },
  sleep: {
    id: "sleep", title: "Утро", emoji: "☀️",
    body: "Просыпаешься: +6.2% пока ты спал. FOMO кусает, но депозит цел.",
    choices: [
      { label: "Записать урок в журнал", next: "journal", reward: 30 },
      { label: "Гнаться за ценой", next: "chase", check: "skill", dc: 60 },
    ],
  },
  smart_long: {
    id: "smart_long", title: "План сработал", emoji: "📈",
    body: "R:R 1:3. Стоп за ночным минимумом. Через 14 часов TP1 закрыт.",
    choices: [{ label: "Забрать прибыль частично", next: "win_partial", reward: 40 }, { label: "Перевести в BE и ждать", next: "win_runner", reward: 50 }],
  },
  ladder: {
    id: "ladder", title: "Лесенка лимитов", emoji: "🪜",
    body: "3 лимита ниже рынка. Два исполнились. Третий стал якорем.",
    choices: [{ label: "Вести по правилам", next: "win_partial", reward: 35 }],
  },
  clan: {
    id: "clan", title: "Клан онлайн", emoji: "👥",
    body: "CryptoQueen кидает разбор. Вместе строите план на 4H.",
    choices: [{ label: "Совместный вход", next: "smart_long", reward: 15 }],
  },
  avg: {
    id: "avg", title: "Усреднение", emoji: "😵",
    body: "Маржа тает. Ликвидация близко.",
    choices: [{ label: "Признать ошибку, закрыть", next: "lose_small" }, { label: "Ещё раз усреднить", next: "liq" }],
  },
  stop_late: {
    id: "stop_late", title: "Поздний стоп", emoji: "🛑",
    body: "Минус 2.1%. Больно, но живо. Журнал ждёт запись.",
    end: "neutral",
  },
  baghold: {
    id: "baghold", title: "Сумка", emoji: "👜",
    body: "Ликвидация. Урок за $весь_депозит_в_этой_сделке.",
    end: "lose",
  },
  journal: {
    id: "journal", title: "Журнал", emoji: "📓",
    body: "Ты записал: «Алерт ≠ сигнал. Сон = edge.» +дисциплина.",
    end: "win",
  },
  chase: {
    id: "chase", title: "Погоня", emoji: "🏃",
    body: "Вход на хае. Откат съедает 1.4%.",
    end: "lose",
  },
  win_partial: {
    id: "win_partial", title: "TP1", emoji: "✅",
    body: "Часть закрыта. Риск нулевой. Голова холодная.",
    end: "win",
  },
  win_runner: {
    id: "win_runner", title: "Runner", emoji: "🚀",
    body: "Тренд продлился. BE спас от шума. Финал +4.8R.",
    end: "win",
  },
  lose_small: {
    id: "lose_small", title: "Контролируемый минус", emoji: "📉",
    body: "−1%. Депозит жив. Эмоции под контролем.",
    end: "neutral",
  },
  liq: {
    id: "liq", title: "Ликвидация", emoji: "💀",
    body: "Маржин-колл. Кампания провалена, но XP за честность остаётся.",
    end: "lose",
  },
};

export default function QuestBoard({ onXp, onGems, toast }: Props) {
  const [id, setId] = useState("start");
  const [log, setLog] = useState<string[]>(["start"]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<"win" | "lose" | "neutral" | null>(null);
  const node = NODES[id];

  const choose = (c: NonNullable<Node["choices"]>[number]) => {
    let pass = true;
    if (c.check) {
      const roll = Math.random() * 100;
      pass = roll >= (c.dc ?? 50);
      toast(pass ? `Check ${c.check.toUpperCase()} OK` : `Check ${c.check.toUpperCase()} fail`, `roll ${roll.toFixed(0)} vs ${c.dc}`, pass ? "green" : "short");
      if (pass) sfx.success(); else sfx.error();
    } else sfx.pop();
    if (c.reward && pass) setScore(s => s + c.reward!);
    const nextId = pass ? c.next : c.check === "luck" ? "avg" : c.next;
    const next = NODES[nextId];
    setLog(l => [...l, nextId]);
    setId(nextId);
    if (next.end) {
      setDone(next.end);
      const xp = next.end === "win" ? 80 + score : next.end === "neutral" ? 40 : 20;
      onXp(xp);
      if (next.end === "win") { onGems(15); fireWin(); } else fireSmall();
      toast(next.end === "win" ? "Quest complete" : "Quest ended", `+${xp} XP`, next.end === "win" ? "gold" : "blue");
    }
  };

  const reset = () => { setId("start"); setLog(["start"]); setScore(0); setDone(null); sfx.whoosh(); };

  return (
    <GameSection id="quest" index="30" kicker="Story Quest" title="Ночной кит — интерактивная история"
      desc="Ветвящийся квест с проверками risk/skill/luck. Твои решения = разные концовки и XP."
      right={<Tag tone="violet"><Map size={11} /> RPG</Tag>}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="panel-3d relative overflow-hidden p-6">
          <div className="absolute -right-10 -top-10 text-9xl opacity-10">{node.emoji}</div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8ea6d8]">Chapter · {log.length}</p>
          <h3 className="display mt-1 text-2xl font-extrabold text-white">{node.emoji} {node.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#c9d8ff]">{node.body}</p>
          {!done && node.choices && (
            <div className="mt-6 space-y-2">
              {node.choices.map(c => (
                <button key={c.label} onClick={() => choose(c)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/12 bg-black/25 px-4 py-3.5 text-left text-sm font-bold text-white transition hover:border-[#8ef23c]/40 hover:bg-[#8ef23c]/8">
                  <span>{c.label}{c.check ? <span className="ml-2 text-[10px] text-[#ffc531]">[{c.check} {c.dc}+]</span> : null}</span>
                  <ChevronRight size={16} className="text-[#8ea6d8]" />
                </button>
              ))}
            </div>
          )}
          {done && (
            <div className="mt-6 text-center">
              <StarBurst stars={done === "win" ? 3 : done === "neutral" ? 2 : 1} />
              <p className={cn("display mt-3 text-2xl font-extrabold", done === "win" ? "text-[#8ef23c]" : done === "lose" ? "text-[#ff5470]" : "text-[#ffc531]")}>
                {done === "win" ? "GOOD ENDING" : done === "lose" ? "BAD ENDING" : "NEUTRAL END"}
              </p>
              <p className="text-xs text-[#8ea6d8]">Story score {score}</p>
              <button onClick={reset} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Replay story</button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Card title="Path log" sub="Твои шаги">
            <div className="space-y-1.5">
              {log.map((lid, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="num-mono text-[#54678f]">{i + 1}</span>
                  <span className="font-bold text-white">{NODES[lid]?.title}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Tips" sub="Как читать проверки">
            <ul className="space-y-2 text-[11px] text-[#aebde6]">
              <li><b className="text-[#8ef23c]">risk</b> — награждает дисциплину</li>
              <li><b className="text-[#ffc531]">luck</b> — yolo, высокий DC</li>
              <li><b className="text-[#5b8cff]">skill</b> — среднее, учит edge</li>
            </ul>
          </Card>
        </div>
      </div>
    </GameSection>
  );
}
