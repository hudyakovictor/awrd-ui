import { useEffect, useState } from "react";
import { Asset, Badge, Bar, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstSparks, celebrate, flash, shake } from "../utils/fx";

/* =========================================================
   1. LIVE 1V1 PVP SPEED DUEL
   ========================================================= */
function PvPDuel() {
  const [playerHp, setPlayerHp] = useState(100);
  const [rivalHp, setRivalHp] = useState(100);
  const [duelActive, setDuelActive] = useState(false);
  const [duelResult, setDuelResult] = useState<"win" | "loss" | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);

  const questions = [
    { q: "RSI ниже 30 сигнализирует о…", ans: ["Перепроданности", "Перекупленности"], correct: 0 },
    { q: "При бычьем поглощении тело зелёной свечи…", ans: ["Больше красной", "Меньше красной"], correct: 0 },
    { q: "Стоп-лосс на шорт ставится…", ans: ["Выше входа", "Ниже входа"], correct: 0 },
  ];

  const answer = (idx: number) => {
    if (!duelActive) return;
    const currentQ = questions[questionIdx];
    const isCorrect = idx === currentQ.correct;

    if (isCorrect) {
      sfx.success();
      haptic(15);
      const nextRivalHp = Math.max(0, rivalHp - 35);
      setRivalHp(nextRivalHp);
      if (nextRivalHp === 0) {
        setDuelActive(false);
        setDuelResult("win");
        celebrate();
        fanfare();
      }
    } else {
      sfx.error();
      shake("soft");
      flash();
      haptic([30, 40]);
      const nextPlayerHp = Math.max(0, playerHp - 40);
      setPlayerHp(nextPlayerHp);
      if (nextPlayerHp === 0) {
        setDuelActive(false);
        setDuelResult("loss");
      }
    }

    setQuestionIdx((prev) => (prev + 1) % questions.length);
  };

  const startDuel = () => {
    setPlayerHp(100);
    setRivalHp(100);
    setDuelResult(null);
    setDuelActive(true);
    setQuestionIdx(0);
    sfx.whoosh();
  };

  return (
    <Asset title="1v1 Real-Time Trading Duel" id="pvp.duel" desc="Дуэль на скорость: вы против соперника WhaleTrader99, правильный ответ наносит удар по HP соперника." className="lg:col-span-2" tags={["PVP"]}>
      <div className="rounded-3xl p-5 bg-gradient-to-b from-[#151f47] to-[#070d1f] border border-white/10">
        {/* Duel Health Bars */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between items-center text-[11px] font-extrabold mb-1">
              <span className="text-bull">You (BullTrader)</span>
              <span className="num">{playerHp} HP</span>
            </div>
            <Bar value={playerHp} tone="bull" h={12} />
          </div>
          <div>
            <div className="flex justify-between items-center text-[11px] font-extrabold mb-1">
              <span className="text-bear">WhaleTrader99</span>
              <span className="num">{rivalHp} HP</span>
            </div>
            <Bar value={rivalHp} tone="bear" h={12} />
          </div>
        </div>

        {/* Question Area */}
        <div className="inset !rounded-2xl p-4 min-h-[140px] flex flex-col items-center justify-center text-center">
          {duelActive ? (
            <>
              <Badge tone="cyan" size="xs" className="mb-2">Раунд #{questionIdx + 1}</Badge>
              <h4 className="font-extrabold text-[15px] mb-4">{questions[questionIdx].q}</h4>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {questions[questionIdx].ans.map((a, i) => (
                  <Btn3D key={a} size="sm" variant="neutral" onClick={() => answer(i)}>
                    {a}
                  </Btn3D>
                ))}
              </div>
            </>
          ) : duelResult ? (
            <div className="anim-scale">
              <Glyph name={duelResult === "win" ? "crown" : "shield"} size={54} />
              <h4 className="font-extrabold text-[20px] mt-2" style={{ color: duelResult === "win" ? "#ffc53d" : "#ff4d6a" }}>
                {duelResult === "win" ? "VICTORY! +150 PvP Points" : "DEFEAT! Try again"}
              </h4>
              <Btn3D size="sm" variant="bull" className="mt-3" onClick={startDuel}>
                Rematch
              </Btn3D>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-mute mb-3">Соперник готов к схватке. Отвечайте быстрее соперника!</p>
              <Btn3D size="md" variant="bull" onClick={startDuel}>
                Start 1v1 Match
              </Btn3D>
            </div>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. 16-PLAYER TOURNAMENT BRACKET
   ========================================================= */
function TournamentBracket() {
  const [currentRound, setCurrentRound] = useState<"Quarter" | "Semi" | "Finals">("Quarter");
  const [winner, setWinner] = useState<string | null>(null);

  const simulateNext = () => {
    sfx.whoosh();
    haptic(10);
    if (currentRound === "Quarter") {
      setCurrentRound("Semi");
    } else if (currentRound === "Semi") {
      setCurrentRound("Finals");
    } else {
      setWinner("You (Tradelingo Champion)");
      celebrate();
      fanfare();
    }
  };

  const reset = () => {
    setCurrentRound("Quarter");
    setWinner(null);
    sfx.tap();
  };

  return (
    <Asset title="Tournament Bracket" id="pvp.bracket" desc="Турнирная сетка на 16 игроков: четвертьфиналы, полуфиналы и гранд-финал с анимацией продвижения по раундам." className="lg:col-span-1" tags={["BRACKET"]}>
      <div className="inset !rounded-2xl p-3 space-y-2">
        <div className="flex justify-between items-center text-[10.5px] font-extrabold text-mute mb-2">
          <span>Раунд: {currentRound}</span>
          <Badge tone="gold" size="xs">Приз: 10,000 💎</Badge>
        </div>

        {/* Bracket visual nodes */}
        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex justify-between p-1.5 rounded-lg bg-blue/15 border border-blue/30 text-bull">
            <span>You</span>
            <span className="num">W</span>
          </div>
          <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-dim">
            <span>CryptoWhale_88</span>
            <span className="num">L</span>
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex justify-between p-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold">
            <span>SatoshiN</span>
            <span className="num">W</span>
          </div>
          <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-dim">
            <span>ArbitrageBot</span>
            <span className="num">L</span>
          </div>
        </div>

        {winner && (
          <div className="text-center font-extrabold text-[12px] text-gold anim-pop mt-2">
            🏆 {winner}
          </div>
        )}

        <div className="mt-3">
          {winner ? (
            <Btn3D size="xs" variant="neutral" full onClick={reset}>
              Restart Tournament
            </Btn3D>
          ) : (
            <Btn3D size="xs" variant="gold" full onClick={simulateNext}>
              Simulate {currentRound === "Finals" ? "Grand Finals" : "Next Round"}
            </Btn3D>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. SPEED PATTERN RECOGNITION FLASHCARDS
   ========================================================= */
function SpeedPatternCards() {
  const [timer, setTimer] = useState(5);
  const [score, setScore] = useState(0);
  const [patternIdx, setPatternIdx] = useState(0);

  const patterns = [
    { name: "Bull Flag", answer: "bull" },
    { name: "Double Top", answer: "bear" },
    { name: "Head & Shoulders", answer: "bear" },
    { name: "Inverted Hammer", answer: "bull" },
    { name: "Ascending Triangle", answer: "bull" },
    { name: "Falling Wedge", answer: "bull" },
    { name: "Rising Wedge", answer: "bear" },
    { name: "Triple Top Breakdown", answer: "bear" },
  ];

  const current = patterns[patternIdx];

  const guess = (side: "bull" | "bear") => {
    if (side === current.answer) {
      setScore((s) => s + 10);
      sfx.success();
      haptic(10);
      burstSparks(innerWidth / 2, innerHeight / 2, 8, "#1fdb8b");
    } else {
      sfx.error();
      haptic([20, 20]);
    }
    setPatternIdx((prev) => (prev + 1) % patterns.length);
    setTimer(5);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setPatternIdx((p) => (p + 1) % patterns.length);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [patterns.length]);

  return (
    <Asset title="Speed Pattern Flashcards" id="pvp.flashcards" desc="5-секундный таймер на распознавание рыночного паттерна: бычий или медвежий сетап." className="lg:col-span-1" tags={["TRAINER"]}>
      <div className="inset !rounded-2xl p-4 flex flex-col items-center text-center">
        <div className="flex justify-between items-center w-full mb-3 text-[11px] font-bold text-mute">
          <span>Счёт: <span className="num text-gold">{score}</span></span>
          <span className="num text-bear">{timer}s left</span>
        </div>

        <div className="size-20 rounded-2xl bg-gradient-to-br from-[#3d7bff] to-[#8d5cff] grid place-items-center mb-3 anim-pop text-white">
          <Icon name="candles" size={42} stroke={2.2} />
        </div>

        <h4 className="font-extrabold text-[16px] mb-4">{current.name}</h4>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Btn3D size="xs" variant="bull" onClick={() => guess("bull")}>Bullish</Btn3D>
          <Btn3D size="xs" variant="bear" onClick={() => guess("bear")}>Bearish</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

export default function PvPArena() {
  return (
    <Section id="pvparena" index="17" title="PvP Trading Battle Arena" subtitle="3 соревновательных режима: дуэль 1v1 в реальном времени, турнирная сетка на 16 игроков, скоростные карточки распознавания паттернов" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        <PvPDuel />
        <TournamentBracket />
        <SpeedPatternCards />
      </div>
    </Section>
  );
}
