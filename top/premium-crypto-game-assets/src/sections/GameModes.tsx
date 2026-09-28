import { useMemo, useState } from "react";
import { Asset, Bar, Btn, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { Avatar } from "./Gamification";
import { useSpringNumber } from "../components/motion";
import { cn } from "../utils/cn";

/* ---------- Pattern boss battle ---------- */

const BOSS_ROUNDS = [
  { prompt: "Breakout has no volume confirmation", choices: ["Enter now", "Wait", "Max leverage"], answer: 1, why: "Without volume, price can return inside the range." },
  { prompt: "Long setup risks 4.5% of account", choices: ["Reduce size", "Move stop closer", "Ignore it"], answer: 0, why: "Position size changes risk without invalidating the stop." },
  { prompt: "RSI is high inside a strong trend", choices: ["Short immediately", "Use context", "Close everything"], answer: 1, why: "Overbought can persist; context decides whether momentum is exhausted." },
  { prompt: "Price retests support with a hammer", choices: ["Plan entry", "Panic sell", "Remove stop"], answer: 0, why: "Structure and rejection support a planned, risk-defined entry." },
];

function PatternBoss() {
  const [round, setRound] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [choice, setChoice] = useState<number | null>(null);
  const [attacking, setAttacking] = useState<"player" | "boss" | null>(null);
  const [burst, setBurst] = useState(0);
  const bossSpring = useSpringNumber(bossHp, { stiffness: 180, damping: 22 });
  const playerSpring = useSpringNumber(playerHp, { stiffness: 180, damping: 22 });
  const current = BOSS_ROUNDS[round % BOSS_ROUNDS.length];
  const won = bossHp <= 0;
  const lost = playerHp <= 0;

  const answer = (index: number) => {
    if (choice !== null || won || lost) return;
    setChoice(index);
    const correct = index === current.answer;
    setAttacking(correct ? "player" : "boss");
    if (correct) {
      setBossHp((value) => Math.max(0, value - 27));
      setBurst((value) => value + 1);
    } else setPlayerHp((value) => Math.max(0, value - 24));
    setTimeout(() => {
      setChoice(null);
      setAttacking(null);
      setRound((value) => value + 1);
    }, 1050);
  };
  const reset = () => { setRound(0); setBossHp(100); setPlayerHp(100); setChoice(null); setAttacking(null); };

  return (
    <Asset code="MODE-01" title="Pattern Boss Battle" desc="Correct market decisions damage the boss; impulsive choices damage the player. Health, attack motion and explanation form one feedback loop." tags={["boss", "battle", "feedback"]} span={3}>
      <div className="relative min-h-[520px] rounded-[28px] overflow-hidden bg-[linear-gradient(180deg,rgba(7,14,34,.18),#070e22),url('/images/gameplay-arena.jpg')] bg-cover bg-center">
        <Confetti burst={burst} count={22} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/65" />
        <div className="relative p-5 h-full flex flex-col">
          <div className="grid grid-cols-2 gap-8">
            <div><div className="flex justify-between text-[8px] uppercase tracking-widest font-black mb-1"><span className="text-sky">You · Risk Knight</span><span className="num">{Math.round(playerSpring)} HP</span></div><Bar value={playerSpring} color="sky" h={14} /></div>
            <div><div className="flex justify-between text-[8px] uppercase tracking-widest font-black mb-1"><span className="text-bear">FOMO Beast</span><span className="num">{Math.round(bossSpring)} HP</span></div><Bar value={bossSpring} color="bear" h={14} /></div>
          </div>
          <div className="flex-1 flex items-center justify-between px-[8%]">
            <div className={cn("relative transition-transform duration-300", attacking === "player" && "translate-x-20 scale-110")}><div className="w-24 h-24 rounded-[30px] bg-gradient-to-b from-[#5cb3ff] to-[#2d8cf0] shadow-[0_8px_0_#1a56a8] grid place-items-center"><Icon name="shield" size={50} /></div>{attacking === "player" && <span className="absolute left-full top-1/2 w-24 h-1 bg-gradient-to-r from-sky to-transparent shadow-[0_0_16px_#3da5ff]" />}</div>
            <div className={cn("relative transition-transform duration-300", attacking === "boss" ? "-translate-x-20 scale-110" : attacking === "player" ? "anim-shake" : "anim-float")}><div className="w-32 h-32 rounded-[42%_58%_52%_48%/44%_42%_58%_56%] bg-gradient-to-br from-bear to-violet shadow-[0_10px_0_#5a153a,0_0_45px_rgba(255,75,110,.35)] grid place-items-center"><Icon name="flame" size={62} fill="currentColor" /></div>{attacking === "boss" && <span className="absolute right-full top-1/2 w-24 h-1 bg-gradient-to-l from-bear to-transparent shadow-[0_0_16px_#ff4b6e]" />}</div>
          </div>
          {won || lost ? <div className="glass rounded-2xl p-5 text-center anim-bounce-in"><div className={cn("text-3xl font-black", won ? "text-bull" : "text-bear")}>{won ? "BOSS DEFEATED" : "RUN ENDED"}</div><div className="text-sm text-mist mt-1 mb-4">{won ? "+250 XP · Risk discipline mastered" : "Review the explanations and try again."}</div><Btn variant={won ? "bull" : "bear"} onClick={reset} icon="refresh">Play again</Btn></div> : <div className="glass rounded-2xl p-4"><div className="text-[8px] uppercase tracking-widest font-black text-gold">Boss move · Round {round + 1}</div><div className="font-black text-lg mt-1">{current.prompt}</div><div className="grid sm:grid-cols-3 gap-2 mt-3">{current.choices.map((item, index) => { const selected = choice === index; const correct = choice !== null && index === current.answer; return <button key={item} onClick={() => answer(index)} className={cn("min-h-11 rounded-xl border-2 px-3 text-[10px] font-black transition-all", choice === null && "border-ink-600 bg-ink-800 shadow-[0_3px_0_#0a1430]", correct && "border-bull bg-bull/15 text-bull", selected && !correct && "border-bear bg-bear/15 text-bear anim-shake", choice !== null && !selected && !correct && "opacity-40")}>{correct && <Icon name="check" size={13} className="inline mr-1" />}{item}</button>; })}</div>{choice !== null && <div className="text-[9px] text-fog/75 mt-3 anim-rise"><b className={choice === current.answer ? "text-bull" : "text-bear"}>{choice === current.answer ? "Critical hit:" : "Boss hit:"}</b> {current.why}</div>}</div>}
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Branching run ---------- */

type RouteNode = { id: string; title: string; icon: string; color: string; reward: number; risk: number };
const ROUTES: RouteNode[][] = [
  [{ id: "start", title: "Market Open", icon: "play", color: "#3da5ff", reward: 0, risk: 0 }],
  [{ id: "safe", title: "Risk Drill", icon: "shield", color: "#22d38a", reward: 30, risk: 1 }, { id: "fast", title: "Speed Quiz", icon: "bolt", color: "#ffc53d", reward: 50, risk: 3 }],
  [{ id: "chart", title: "Chart Room", icon: "candles", color: "#9b6bff", reward: 60, risk: 2 }, { id: "news", title: "News Desk", icon: "book", color: "#ff8a3d", reward: 45, risk: 2 }],
  [{ id: "boss", title: "FOMO Boss", icon: "crown", color: "#ff4b6e", reward: 120, risk: 4 }],
  [{ id: "vault", title: "Reward Vault", icon: "gift", color: "#ffc53d", reward: 80, risk: 0 }],
];

function BranchingRun() {
  const [path, setPath] = useState(["start"]);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const layer = path.length;
  const finished = layer >= ROUTES.length;
  const choose = (node: RouteNode) => { if (finished) return; setPath((items) => [...items, node.id]); setXp((value) => value + node.reward); setHearts((value) => Math.max(1, value - Math.max(0, node.risk - 2))); };
  const reset = () => { setPath(["start"]); setXp(0); setHearts(5); };
  return (
    <Asset code="MODE-02" title="Branching Daily Run" desc="Choose safe or fast routes through a five-stage learning run. XP and hearts persist across branches; every run produces a different path." tags={["roguelite", "branching", "map"]} span={2}>
      <div className="relative min-h-[500px] rounded-[26px] overflow-hidden bg-[linear-gradient(180deg,rgba(7,14,34,.35),#070e22),url('/images/learning-map.jpg')] bg-cover bg-center p-4">
        <div className="absolute inset-0 dotgrid opacity-20" />
        <div className="relative flex items-center gap-3 mb-4"><span className="glass rounded-xl px-3 py-2 num text-[10px] font-black text-gold">{xp} XP</span><span className="glass rounded-xl px-3 py-2 flex gap-1">{Array.from({ length: 5 }).map((_, index) => <Icon key={index} name="heart" size={13} fill={index < hearts ? "#ff4b6e" : "#172856"} className={index < hearts ? "text-bear" : "text-ink-600"} />)}</span><span className="ml-auto glass rounded-xl px-3 py-2 num text-[9px]">STAGE {Math.min(layer, 5)}/5</span></div>
        <div className="relative space-y-5 py-2">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 4 C32 18 67 25 50 40 S35 60 50 72 S65 85 50 96" fill="none" stroke="rgba(61,165,255,.4)" strokeWidth="1" strokeDasharray="3 3" /></svg>
          {ROUTES.map((row, rowIndex) => <div key={rowIndex} className="relative flex justify-center gap-12 min-h-16">{row.map((node) => { const selected = path.includes(node.id); const available = rowIndex === layer; const passed = rowIndex < layer; return <button key={node.id} disabled={!available} onClick={() => choose(node)} className={cn("relative w-28 min-h-16 rounded-2xl p-2 border-2 transition-all", selected ? "border-bull bg-bull/15 text-bull shadow-[0_5px_0_#0b7a4a]" : available ? "border-sky bg-sky/15 text-sky shadow-[0_5px_0_#1a56a8] anim-breathe" : passed ? "border-ink-700 bg-ink-800/70 text-mist opacity-40" : "border-ink-700 bg-ink-900/60 text-mist/40")}><Icon name={selected ? "check" : available ? node.icon : "lock"} size={18} className="mx-auto" /><div className="text-[9px] font-black mt-1">{node.title}</div><div className="num text-[7px] opacity-70">+{node.reward} XP · R{node.risk}</div></button>; })}</div>)}
        </div>
        {finished && <div className="absolute inset-x-4 bottom-4 glass rounded-2xl p-3 flex items-center gap-3 anim-bounce-in"><Icon name="trophy" size={30} className="text-gold" /><div className="flex-1"><div className="font-black">Run complete</div><div className="text-[9px] text-mist">{xp} XP · {hearts} hearts left · {path.join(" → ")}</div></div><Btn variant="gold" size="xs" icon="refresh" onClick={reset}>Again</Btn></div>}
      </div>
    </Asset>
  );
}

/* ---------- Tournament bracket ---------- */

type BracketPlayer = { name: string; score: number; hue: number };

function TournamentBracket() {
  const initial: BracketPlayer[] = [{ name: "Mia", score: 92, hue: 332 }, { name: "Alex", score: 88, hue: 205 }, { name: "Max", score: 81, hue: 70 }, { name: "Dana", score: 84, hue: 90 }, { name: "Kira", score: 90, hue: 270 }, { name: "Leo", score: 78, hue: 138 }, { name: "Zed", score: 86, hue: 25 }, { name: "Ivy", score: 83, hue: 150 }];
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState(initial);
  const [champion, setChampion] = useState<BracketPlayer | null>(null);
  const advance = () => {
    if (players.length === 1) { setChampion(players[0]); return; }
    const next: BracketPlayer[] = [];
    for (let index = 0; index < players.length; index += 2) next.push(players[index].score >= players[index + 1].score ? players[index] : players[index + 1]);
    setPlayers(next); setRound((value) => value + 1); if (next.length === 1) setChampion(next[0]);
  };
  const reset = () => { setPlayers(initial); setRound(0); setChampion(null); };
  return (
    <Asset code="MODE-03" title="Tournament Bracket" desc="Eight-player skill bracket advances winners with a layout transition. Scores, avatars and round status stay readable on mobile." tags={["tournament", "bracket", "reorder"]}>
      <div className="panel !rounded-[24px] p-4 min-h-[430px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4"><div><div className="text-[9px] uppercase tracking-widest font-black text-violet">Weekend cup</div><div className="font-black">{champion ? "Champion crowned" : ["Quarterfinal", "Semifinal", "Final"][round]}</div></div><span className="num text-[9px] text-mist">{players.length} PLAYERS</span></div>
        {champion ? <div className="h-72 grid place-items-center text-center anim-bounce-in"><div><div className="relative inline-block"><Avatar name={champion.name} size={100} hue={champion.hue} ring="gold" /><Icon name="crown" size={38} fill="#ffc53d" className="absolute -top-7 left-1/2 -translate-x-1/2 text-gold anim-float" /></div><div className="text-3xl font-black text-grad-gold mt-5">{champion.name}</div><div className="num text-sm text-gold">{champion.score} tournament score</div><Btn variant="ghost" size="sm" icon="refresh" className="mt-5" onClick={reset}>Reset cup</Btn></div></div> : <div className="grid grid-cols-1 gap-2">{players.map((player, index) => <div key={player.name} className={cn("game-surface rounded-xl p-2.5 flex items-center gap-3 transition-all duration-500", index % 2 === 0 && "mt-1")} style={{ animation: `rise .35s ${(index % 4) * .05}s both` }}><span className="num text-[9px] text-mist w-4">{index + 1}</span><Avatar name={player.name} size={32} hue={player.hue} ring={player.name === "Alex" ? "sky" : "none"} /><span className="text-xs font-black flex-1">{player.name}</span><span className="num text-xs font-black text-sky">{player.score}</span>{index % 2 === 0 && <span className="text-[7px] uppercase text-mist">VS</span>}</div>)}</div>}
        {!champion && <Btn variant="violet" block size="sm" icon="play" className="mt-4" onClick={advance}>Resolve {round === 2 ? "final" : "round"}</Btn>}
      </div>
    </Asset>
  );
}

/* ---------- Cooperative raid ---------- */

function CooperativeRaid() {
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(5);
  const [combo, setCombo] = useState(0);
  const [burst, setBurst] = useState(0);
  const healthSpring = useSpringNumber(health, { stiffness: 160, damping: 22 });
  useInterval(() => setEnergy((value) => Math.min(5, value + 1)), 1800);
  const attack = () => {
    if (!energy || health <= 0) return;
    const damage = 4 + combo;
    setHealth((value) => Math.max(0, value - damage)); setEnergy((value) => value - 1); setCombo((value) => Math.min(8, value + 1)); setBurst((value) => value + 1);
  };
  const reset = () => { setHealth(100); setEnergy(5); setCombo(0); };
  return (
    <Asset code="MODE-04" title="Co-op Raid" desc="A club fights the Leverage Kraken together. Attacks consume regenerating energy; combo increases only with disciplined timing." tags={["co-op", "raid", "energy"]} span={2}>
      <div className="relative h-[420px] rounded-[26px] overflow-hidden bg-gradient-to-b from-[#12123f] to-[#05091c] p-5">
        <Confetti burst={burst} count={12} />
        <div className="absolute inset-0 dotgrid opacity-20" />
        <div className="relative flex justify-between items-center"><div><div className="text-[9px] uppercase tracking-widest font-black text-bear">Club raid · Live</div><div className="font-black text-lg">Leverage Kraken</div></div><div className="flex -space-x-2"><Avatar name="Mia" size={32} hue={332} /><Avatar name="Max" size={32} hue={70} /><Avatar name="You" size={32} hue={205} ring="sky" /><span className="w-8 h-8 rounded-full bg-ink-600 border-2 border-ink-850 grid place-items-center text-[8px] font-black">+5</span></div></div>
        <div className="relative mt-4"><Bar value={healthSpring} color="bear" h={18} /><div className="flex justify-between num text-[9px] mt-1"><span className="text-bear">{Math.round(healthSpring)}% BOSS</span><span className="text-mist">52k / 100k club dmg</span></div></div>
        <div className={cn("relative w-40 h-40 mx-auto mt-5 rounded-[45%_55%_52%_48%/40%_45%_55%_60%] bg-gradient-to-br from-violet to-bear shadow-[0_10px_0_#48143d,0_0_55px_rgba(155,107,255,.35)] grid place-items-center", health <= 0 ? "anim-shake opacity-40" : "anim-liquid")}><Icon name={health <= 0 ? "x" : "zap"} size={66} fill="currentColor" /><span className="absolute -left-8 bottom-6 w-16 h-6 rounded-full bg-violet/70 rotate-[-35deg]" /><span className="absolute -right-8 bottom-6 w-16 h-6 rounded-full bg-violet/70 rotate-[35deg]" /></div>
        <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3"><div className="flex gap-1 flex-1">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={cn("h-3 flex-1 rounded-full transition-colors", index < energy ? "bg-sky shadow-[0_0_8px_#3da5ff]" : "bg-ink-600")} />)}</div>{health > 0 ? <Btn variant="violet" size="sm" icon="bolt" disabled={!energy} onClick={attack}>Attack ×{combo + 1}</Btn> : <Btn variant="gold" size="sm" icon="gift" onClick={reset}>Claim loot</Btn>}</div>
      </div>
    </Asset>
  );
}

/* ---------- Reward draft ---------- */

function RewardDraft() {
  const rewards = [
    { title: "Double XP", body: "30 minutes", icon: "bolt", color: "#ffc53d" },
    { title: "Streak Shield", body: "Protect one day", icon: "shield", color: "#3da5ff" },
    { title: "Whale Radar", body: "One arena hint", icon: "target", color: "#9b6bff" },
  ];
  const [picked, setPicked] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const pick = (index: number) => { if (picked !== null) return; setPicked(index); setBurst((value) => value + 1); };
  return (
    <Asset code="MODE-05" title="Reward Draft" desc="Choose one of three revealed rewards. Hover previews depth; selection locks the other cards and triggers a restrained celebration." tags={["reward", "draft", "card reveal"]}>
      <div className="relative min-h-[390px] rounded-[26px] panel p-4 overflow-hidden">
        <Confetti burst={burst} count={30} />
        <div className="text-center mb-5"><div className="text-[9px] uppercase tracking-widest font-black text-gold">Run reward</div><div className="font-black text-xl">Choose one power-up</div><div className="text-[9px] text-mist">The other two return to the pool</div></div>
        <div className="grid grid-cols-3 gap-3" style={{ perspective: 800 }}>{rewards.map((reward, index) => { const chosen = picked === index; const disabled = picked !== null && !chosen; return <button key={reward.title} onPointerEnter={() => setHovered(index)} onPointerLeave={() => setHovered(null)} onClick={() => pick(index)} className={cn("relative h-56 rounded-3xl p-3 flex flex-col transition-all duration-500 overflow-hidden", disabled && "opacity-25 grayscale")} style={{ background: `linear-gradient(145deg,${reward.color}e6,${reward.color}66)`, boxShadow: chosen ? `0 0 0 3px #fff,0 14px 0 rgba(0,0,0,.3),0 0 45px ${reward.color}66` : "0 8px 0 rgba(0,0,0,.32)", transform: chosen ? "translateY(-12px) scale(1.04) rotateY(0)" : hovered === index ? "translateY(-7px) rotateY(-5deg)" : "none" }}><span className="absolute inset-0 dotgrid opacity-15" /><div className="relative w-12 h-12 rounded-2xl bg-white/15 grid place-items-center mx-auto"><Icon name={chosen ? "check" : reward.icon} size={24} /></div><div className="relative mt-auto"><div className="font-black">{reward.title}</div><div className="text-[9px] text-white/70">{reward.body}</div></div>{chosen && <span className="absolute top-2 right-2 text-[7px] uppercase font-black bg-white text-ink-900 rounded px-1.5 py-0.5">Drafted</span>}</button>; })}</div>
        {picked !== null && <button onClick={() => setPicked(null)} className="block mx-auto mt-5 text-[9px] font-black text-mist hover:text-fog">Reset draft</button>}
      </div>
    </Asset>
  );
}

/* ---------- Time attack mode ---------- */

function TimeAttack() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState(0);
  const [question, setQuestion] = useState(0);
  const prompts = useMemo(() => [
    { text: "Hammer after a downtrend", answer: "LONG" }, { text: "Volume dies at resistance", answer: "WAIT" }, { text: "Lower high + breakdown", answer: "SHORT" }, { text: "Stop would risk 5%", answer: "WAIT" }, { text: "Retest holds on volume", answer: "LONG" },
  ], []);
  useInterval(() => { if (running) setTime((value) => { if (value <= 1) { setRunning(false); return 0; } return value - 1; }); }, 1000);
  const choose = (answer: string) => { if (!running) return; const correct = prompts[question % prompts.length].answer === answer; if (correct) { setScore((value) => value + 100 + chain * 20); setChain((value) => value + 1); } else setChain(0); setQuestion((value) => value + 1); };
  const start = () => { setRunning(true); setTime(30); setScore(0); setChain(0); setQuestion(0); };
  return (
    <Asset code="MODE-06" title="30-Second Time Attack" desc="Rapid decisions, visible chain multiplier and a hard stop at thirty seconds. No animation blocks the next question." tags={["time attack", "speed", "chain"]}>
      <div className="rounded-[26px] game-surface p-5 min-h-[360px] flex flex-col relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-ink-700"><div className="h-full bg-gradient-to-r from-bull via-gold to-bear transition-[width] duration-1000 linear" style={{ width: `${(time / 30) * 100}%` }} /></div>
        <div className="flex items-center justify-between"><div><div className="text-[9px] uppercase tracking-widest font-black text-flame">Time attack</div><div className="num text-3xl font-black">00:{String(time).padStart(2, "0")}</div></div><div className="text-right"><div className="num text-2xl font-black text-gold">{score}</div><div className="text-[8px] text-mist">CHAIN ×{chain}</div></div></div>
        <div className="flex-1 grid place-items-center text-center" key={question}><div><div className="text-[9px] uppercase tracking-widest font-black text-mist">Decision {question + 1}</div><div className="text-2xl font-black mt-2 max-w-xs">{prompts[question % prompts.length].text}</div></div></div>
        {running ? <div className="grid grid-cols-3 gap-2"><Btn variant="bull" size="sm" onClick={() => choose("LONG")}>Long</Btn><Btn variant="ghost" size="sm" onClick={() => choose("WAIT")}>Wait</Btn><Btn variant="bear" size="sm" onClick={() => choose("SHORT")}>Short</Btn></div> : <div className="text-center"><div className="text-sm text-mist mb-3">{time === 0 ? `Final score ${score} · best chain ${chain}` : "Five decisions repeat with changing tempo."}</div><Btn variant="flame" icon="play" onClick={start}>{time === 0 ? "Play again" : "Start 30s run"}</Btn></div>}
      </div>
    </Asset>
  );
}

export default function GameModes() {
  return (
    <Section id="game-modes" index="05" title="Game Modes" subtitle="Longer gameplay loops assembled from the interaction system: bosses, branching runs, tournaments, club raids, reward drafts and time attacks.">
      <PatternBoss />
      <BranchingRun />
      <TournamentBracket />
      <CooperativeRaid />
      <RewardDraft />
      <TimeAttack />
    </Section>
  );
}