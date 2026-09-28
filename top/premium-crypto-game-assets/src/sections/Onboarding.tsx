import { useState } from "react";
import { Asset, Bar, Btn, Coin, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

const GOALS = [
  { id: "basics", title: "Understand crypto", detail: "Start with money, wallets and market basics", icon: "book", color: "sky" },
  { id: "charts", title: "Read charts", detail: "Candles, trends, volume and indicators", icon: "candles", color: "bull" },
  { id: "risk", title: "Trade with discipline", detail: "Sizing, stops and decision psychology", icon: "shield", color: "gold" },
  { id: "defi", title: "Explore DeFi", detail: "Pools, yield, protocols and smart-contract risk", icon: "layers", color: "violet" },
];

function GoalSelector() {
  const [selected, setSelected] = useState<string[]>(["charts"]);
  const [minutes, setMinutes] = useState(10);
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id]);
  return (
    <Asset
      code="ONB-01"
      title="Goal Personalization"
      desc="Pick up to two learning outcomes and a realistic daily commitment. The choice directly explains its curriculum effect."
      tags={["personalize", "multi-select"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div>
          <div className="flex items-center justify-between mb-3"><div><div className="text-xl font-black">What do you want to master?</div><div className="text-xs text-mist">Choose up to two. You can change this later.</div></div><span className="num text-xs font-black text-sky">{selected.length}/2</span></div>
          <div className="grid sm:grid-cols-2 gap-3">
            {GOALS.map((goal) => {
              const active = selected.includes(goal.id);
              const style = { sky: "border-sky bg-sky/10 text-sky shadow-[0_4px_0_#1a56a8]", bull: "border-bull bg-bull/10 text-bull shadow-[0_4px_0_#0b7a4a]", gold: "border-gold bg-gold/10 text-gold shadow-[0_4px_0_#b07600]", violet: "border-violet bg-violet/10 text-violet shadow-[0_4px_0_#4f2bb0]" }[goal.color];
              return (
                <button key={goal.id} onClick={() => toggle(goal.id)} className={cn("p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all", active ? style : "border-ink-600 bg-ink-800 shadow-[0_4px_0_#0a1430] hover:border-ink-500 active:translate-y-1 active:shadow-none")}>
                  <span className={cn("w-11 h-11 rounded-xl grid place-items-center shrink-0", active ? "bg-white/10" : "bg-ink-700 text-mist")}><Icon name={active ? "check" : goal.icon} size={21} stroke={active ? 3 : 2} /></span>
                  <span><span className={cn("block text-sm font-black", !active && "text-fog")}>{goal.title}</span><span className="block text-[10px] text-mist leading-relaxed mt-1">{goal.detail}</span></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="well p-4 flex flex-col">
          <div className="text-[9px] font-black uppercase tracking-[.2em] text-mist mb-4">Daily commitment</div>
          <div className="text-center my-4"><div className="num text-5xl font-black text-gold">{minutes}</div><div className="text-xs text-mist">minutes per day</div></div>
          <input type="range" min={5} max={30} step={5} value={minutes} onChange={(event) => setMinutes(+event.target.value)} className="accent-gold w-full" />
          <div className="flex justify-between num text-[8px] text-mist mt-1"><span>5</span><span>15</span><span>30</span></div>
          <div className="tile !rounded-xl p-3 mt-4 text-[10px] text-fog leading-relaxed">
            <Icon name="sparkle" size={15} className="text-gold mb-1" />
            At {minutes} min/day, your first personalized path takes about <b className="text-gold">{Math.ceil(420 / minutes)} days</b>.
          </div>
          <Btn variant="bull" className="mt-auto" block disabled={!selected.length}>Build my path</Btn>
        </div>
      </div>
    </Asset>
  );
}

const PLACEMENT = [
  { q: "What does market capitalization measure?", choices: ["Daily volume", "Price × supply", "Project revenue", "Wallet count"], a: 1 },
  { q: "A long lower wick after a downtrend suggests…", choices: ["Buyer rejection", "No liquidity", "High fees", "Guaranteed reversal"], a: 0 },
  { q: "Risking $100 on a $10,000 account equals…", choices: ["0.1%", "1%", "10%", "100%"], a: 1 },
];

function PlacementTest() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = PLACEMENT[index];
  const next = () => {
    if (choice === null) return;
    const nextScore = score + (choice === q.a ? 1 : 0);
    setScore(nextScore);
    if (index === PLACEMENT.length - 1) setDone(true);
    else {
      setIndex((value) => value + 1);
      setChoice(null);
    }
  };
  const reset = () => {
    setIndex(0);
    setChoice(null);
    setScore(0);
    setDone(false);
  };
  return (
    <Asset
      code="ONB-02"
      title="Placement Test"
      desc="Three-question adaptive entry assessment with skip option and an explicit recommendation, never a punitive grade."
      tags={["adaptive", "assessment"]}
    >
      {!done ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4"><Bar value={((index + 1) / PLACEMENT.length) * 100} color="violet" h={10} className="flex-1" /><span className="num text-[10px] text-mist">{index + 1}/{PLACEMENT.length}</span></div>
          <div key={index} className="anim-rise">
            <div className="text-[9px] font-black uppercase tracking-widest text-violet mb-2">Quick check · no pressure</div>
            <div className="text-lg font-black leading-tight mb-4">{q.q}</div>
            <div className="space-y-2">
              {q.choices.map((item, itemIndex) => (
                <button key={item} onClick={() => setChoice(itemIndex)} className={cn("w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all", choice === itemIndex ? "border-violet bg-violet/15 text-violet shadow-[0_4px_0_#4f2bb0]" : "border-ink-600 bg-ink-800 shadow-[0_4px_0_#0a1430] active:translate-y-1 active:shadow-none")}>
                  <span className={cn("num w-7 h-7 rounded-lg border-2 grid place-items-center text-[10px] font-black", choice === itemIndex ? "border-violet" : "border-ink-500 text-mist")}>{String.fromCharCode(65 + itemIndex)}</span>
                  <span className="text-xs font-bold">{item}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto pt-5"><Btn variant="ghost" size="sm" onClick={() => { if (index === PLACEMENT.length - 1) setDone(true); else { setIndex((value) => value + 1); setChoice(null); } }}>Skip</Btn><Btn variant="violet" size="sm" disabled={choice === null} onClick={next}>Continue</Btn></div>
        </div>
      ) : (
        <div className="flex-1 grid place-items-center text-center anim-bounce-in">
          <div>
            <div className="w-24 h-24 rounded-[30px] bg-gradient-to-b from-[#a886ff] to-[#7a4af0] shadow-[0_6px_0_#4f2bb0] grid place-items-center mx-auto mb-5"><Icon name="chart" size={46} /></div>
            <div className="text-[9px] font-black uppercase tracking-widest text-violet">Recommended start</div>
            <div className="text-2xl font-black mt-1">{score >= 2 ? "Chart Reader · Unit 2" : "Crypto Foundations · Unit 1"}</div>
            <p className="text-xs text-mist mt-2 mb-5 max-w-xs">You can still open earlier lessons or move ahead at any time. This only sets your default path.</p>
            <div className="flex justify-center gap-3"><Btn variant="ghost" size="sm" icon="refresh" onClick={reset}>Retake</Btn><Btn variant="bull" size="sm">Use this path</Btn></div>
          </div>
        </div>
      )}
    </Asset>
  );
}

function RiskConsent() {
  const [checks, setChecks] = useState([false, false, false]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const items = [
    { title: "Practice is simulated", detail: "Prices and scenarios are educational. Results are not a promise of real-market performance." },
    { title: "Losses are possible", detail: "Crypto assets can be highly volatile. Never use funds you cannot afford to lose." },
    { title: "This is not advice", detail: "BULLRUN teaches concepts and process. It does not recommend specific assets or trades." },
  ];
  return (
    <Asset
      code="ONB-03"
      title="Risk Understanding"
      desc="Plain-language consent replaces a dark-pattern legal wall. Each principle expands and must be acknowledged individually."
      tags={["consent", "plain language"]}
    >
      {complete ? (
        <div className="flex-1 grid place-items-center text-center anim-bounce-in"><div><div className="w-20 h-20 rounded-full bg-bull text-ink-900 grid place-items-center mx-auto shadow-[0_5px_0_#0b7a4a]"><Icon name="shield" size={38} /></div><div className="font-black text-xl mt-4">You're ready to practice</div><div className="text-xs text-mist mt-1 mb-4">Risk principles saved to your profile.</div><Btn variant="ghost" size="sm" onClick={() => setComplete(false)}>Review again</Btn></div></div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold grid place-items-center"><Icon name="shield" size={25} /></div><div><div className="font-black text-lg">Before you begin</div><div className="text-[10px] text-mist">Three things every trader must understand</div></div></div>
          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div key={item.title} className={cn("rounded-xl border-2 overflow-hidden transition-all", checks[index] ? "border-bull/35 bg-bull/[.06]" : "border-ink-600 bg-ink-800")}>
                <div className="flex items-center gap-3 p-3">
                  <button onClick={() => setChecks(checks.map((value, itemIndex) => itemIndex === index ? !value : value))} className={cn("w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-all", checks[index] ? "bg-bull text-white shadow-[0_3px_0_#0b7a4a]" : "well")}>{checks[index] && <Icon name="check" size={15} stroke={3.5} />}</button>
                  <span className="text-xs font-black flex-1">{item.title}</span>
                  <button onClick={() => setExpanded(expanded === index ? null : index)} className="w-7 h-7 rounded-lg grid place-items-center text-mist hover:bg-white/5"><Icon name="chevD" size={15} className={cn("transition-transform", expanded === index && "rotate-180")} /></button>
                </div>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: expanded === index ? "1fr" : "0fr" }}><div className="overflow-hidden"><p className="px-3 pb-3 pl-13 text-[10px] text-mist leading-relaxed" style={{ paddingLeft: 52 }}>{item.detail}</p></div></div>
              </div>
            ))}
          </div>
          <Btn variant="bull" block className="mt-4" disabled={!checks.every(Boolean)} onClick={() => setComplete(true)}>I understand</Btn>
        </>
      )}
    </Asset>
  );
}

type WalletId = "demo" | "metamask" | "ledger" | "walletconnect";

function WalletConnect() {
  const [wallet, setWallet] = useState<WalletId>("demo");
  const [state, setState] = useState<"idle" | "connecting" | "done">("idle");
  const connect = () => {
    setState("connecting");
    setTimeout(() => setState("done"), 1200);
  };
  const options: { id: WalletId; title: string; detail: string; icon: string; safe?: boolean }[] = [
    { id: "demo", title: "Demo wallet", detail: "$10,000 practice balance · zero risk", icon: "sparkle", safe: true },
    { id: "metamask", title: "MetaMask", detail: "Read-only address connection", icon: "wallet" },
    { id: "ledger", title: "Ledger", detail: "Hardware-wallet verification", icon: "shield" },
    { id: "walletconnect", title: "WalletConnect", detail: "Scan using your mobile wallet", icon: "grid" },
  ];
  return (
    <Asset
      code="ONB-04"
      title="Wallet Choice"
      desc="Demo-first wallet connection that clearly separates learning funds from real assets and explains permissions."
      tags={["wallet", "safe default"]}
    >
      {state === "done" ? (
        <div className="flex-1 grid place-items-center text-center anim-bounce-in"><div><div className="relative inline-block"><div className="w-24 h-24 rounded-[30px] bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_6px_0_#0b7a4a] grid place-items-center"><Icon name="wallet" size={44} /></div><span className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-white text-bull grid place-items-center shadow-lg"><Icon name="check" size={19} stroke={3.5} /></span></div><div className="text-xl font-black mt-5">Wallet ready</div><div className="text-xs text-mist mt-1 mb-4">{wallet === "demo" ? "Demo balance added. No real funds connected." : "Read-only connection active. BULLRUN cannot move funds."}</div><Btn variant="ghost" size="sm" onClick={() => setState("idle")}>Disconnect demo</Btn></div></div>
      ) : (
        <>
          <div className="text-lg font-black mb-1">Choose how to practice</div>
          <p className="text-xs text-mist mb-4">No wallet is required. Start safely with demo funds or connect read-only.</p>
          <div className="space-y-2">
            {options.map((option) => (
              <button key={option.id} onClick={() => setWallet(option.id)} className={cn("w-full rounded-xl p-3 border-2 flex items-center gap-3 text-left transition-all", wallet === option.id ? option.safe ? "border-bull bg-bull/10 shadow-[0_4px_0_#0b7a4a]" : "border-sky bg-sky/10 shadow-[0_4px_0_#1a56a8]" : "border-ink-600 bg-ink-800")}>
                <span className={cn("w-10 h-10 rounded-xl grid place-items-center", option.safe ? "bg-bull/15 text-bull" : "bg-sky/15 text-sky")}><Icon name={option.icon} size={20} /></span>
                <span className="flex-1"><span className="flex items-center gap-2 text-sm font-black">{option.title}{option.safe && <span className="text-[7px] uppercase px-1.5 py-0.5 rounded-md bg-bull text-ink-900">Recommended</span>}</span><span className="block text-[9px] text-mist">{option.detail}</span></span>
                <span className={cn("w-5 h-5 rounded-full border-2 grid place-items-center", wallet === option.id ? option.safe ? "border-bull bg-bull" : "border-sky bg-sky" : "border-ink-500")}>{wallet === option.id && <span className="w-2 h-2 rounded-full bg-white" />}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl p-2.5 mt-3 bg-sky/[.07] border border-sky/20 flex items-start gap-2 text-[9px] text-mist leading-relaxed"><Icon name="lock" size={14} className="text-sky shrink-0" /><span>We never request seed phrases or transfer permission. Connected wallets are for portfolio learning context only.</span></div>
          <Btn variant={wallet === "demo" ? "bull" : "sky"} block className="mt-4" loading={state === "connecting"} onClick={connect}>{wallet === "demo" ? "Start with demo funds" : "Connect read-only"}</Btn>
        </>
      )}
    </Asset>
  );
}

function NotificationPrompt() {
  const [selected, setSelected] = useState<string[]>(["streak", "lesson"]);
  const [time, setTime] = useState("19:00");
  const [saved, setSaved] = useState(false);
  const options = [
    { id: "streak", title: "Streak reminder", detail: "Only if today's goal is unfinished", icon: "flame" },
    { id: "lesson", title: "Learning plan", detail: "One reminder at your preferred time", icon: "book" },
    { id: "price", title: "Price alerts", detail: "Only alerts you create manually", icon: "bell" },
    { id: "social", title: "Friend activity", detail: "Challenges and direct club replies", icon: "users" },
  ];
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return (
    <Asset
      code="ONB-05"
      title="Notification Permission"
      desc="Ask only after showing concrete controls. Users choose categories and time before the native permission request."
      tags={["permission", "ethical"]}
    >
      {saved ? (
        <div className="flex-1 grid place-items-center text-center anim-bounce-in"><div><div className="w-20 h-20 rounded-full bg-sky text-white grid place-items-center mx-auto shadow-[0_5px_0_#1a56a8]"><Icon name="bell" size={36} /></div><div className="font-black text-xl mt-4">Reminders set</div><div className="text-xs text-mist mt-1 mb-4">{selected.length} categories · daily window {time}</div><Btn variant="ghost" size="sm" onClick={() => setSaved(false)}>Edit preferences</Btn></div></div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-sky/15 text-sky grid place-items-center"><Icon name="bell" size={24} /></div><div><div className="font-black text-lg">Stay on your plan</div><div className="text-[10px] text-mist">Choose exactly what can interrupt you</div></div></div>
          <div className="space-y-2">
            {options.map((option) => {
              const on = selected.includes(option.id);
              return <button key={option.id} onClick={() => toggle(option.id)} className="w-full game-surface rounded-xl p-3 flex items-center gap-3 text-left"><span className={cn("w-9 h-9 rounded-xl grid place-items-center transition-all", on ? "bg-sky/15 text-sky" : "bg-ink-700 text-mist")}><Icon name={option.icon} size={18} /></span><span className="flex-1"><span className="block text-xs font-black">{option.title}</span><span className="block text-[9px] text-mist">{option.detail}</span></span><span className={cn("relative w-12 h-7 rounded-full transition-all", on ? "bg-sky" : "bg-ink-600")}><span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow" style={{ left: on ? 24 : 4 }} /></span></button>;
            })}
          </div>
          <label className="game-surface rounded-xl p-3 flex items-center gap-3 mt-3"><Icon name="clock" size={18} className="text-gold" /><span className="text-xs font-black flex-1">Preferred time</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="well h-9 px-2 num text-xs outline-none" /></label>
          <div className="grid grid-cols-2 gap-3 mt-4"><Btn variant="ghost" onClick={() => setSelected([])}>Not now</Btn><Btn variant="sky" icon="bell" disabled={!selected.length} onClick={() => setSaved(true)}>Enable selected</Btn></div>
        </>
      )}
    </Asset>
  );
}

function CoachMarks() {
  const [step, setStep] = useState(0);
  const marks = [
    { title: "This is your demo balance", detail: "Practice funds, never real money.", pos: "top-16 left-4", target: "top-3 left-3 w-32 h-14" },
    { title: "Continue your learning path", detail: "One clear next lesson every day.", pos: "top-48 left-8", target: "top-24 left-3 right-3 h-28" },
    { title: "Arena builds decision speed", detail: "Compete on skill, not on spending.", pos: "bottom-20 right-4", target: "bottom-4 right-4 w-20 h-16" },
  ];
  const mark = marks[step];
  return (
    <Asset
      code="ONB-06"
      title="Contextual Coach Marks"
      desc="Three-step spotlight tour with progress, skip and focus-safe next action. The background remains legible, not disabled."
      tags={["tour", "spotlight"]}
    >
      <div className="relative well overflow-hidden min-h-[350px] p-3">
        <div className="flex items-center gap-2"><Coin sym="BTC" size={30} /><div><div className="text-[8px] text-mist">Demo balance</div><div className="num text-sm font-black">$10,000.00</div></div></div>
        <div className="mt-4 rounded-2xl p-4 bg-gradient-to-br from-[#2d8cf0] to-[#1a56a8] h-28"><div className="text-[8px] uppercase tracking-widest font-black text-white/60">Continue learning</div><div className="font-black mt-1">Candlestick Patterns</div><Bar value={68} color="gold" h={8} className="mt-6 !bg-black/20" /></div>
        <div className="grid grid-cols-2 gap-2 mt-3"><div className="tile !rounded-xl p-3"><Icon name="target" size={20} className="text-bull mb-1" /><div className="text-[10px] font-black">Daily mission</div></div><div className="tile !rounded-xl p-3"><Icon name="bolt" size={20} className="text-violet mb-1" /><div className="text-[10px] font-black">Arena duel</div></div></div>
        <div className="absolute inset-0 bg-ink-950/68 z-10" style={{ maskImage: `linear-gradient(#000,#000)`, WebkitMaskImage: `linear-gradient(#000,#000)` }} />
        <div className={cn("absolute z-20 rounded-2xl ring-4 ring-sky shadow-[0_0_0_999px_rgba(4,9,22,.62),0_0_24px_rgba(61,165,255,.55)] pointer-events-none transition-all duration-500", mark.target)} />
        <div key={step} className={cn("absolute z-30 panel !rounded-2xl p-3 w-56 anim-pop", mark.pos)}>
          <div className="text-[8px] uppercase tracking-wider text-sky font-black mb-1">{step + 1} of {marks.length}</div>
          <div className="text-sm font-black">{mark.title}</div>
          <div className="text-[9px] text-mist mt-1 mb-3">{mark.detail}</div>
          <div className="flex items-center gap-2"><button onClick={() => setStep(0)} className="text-[9px] font-bold text-mist">Skip</button><button onClick={() => setStep((value) => (value + 1) % marks.length)} className="ml-auto h-8 px-3 rounded-lg bg-sky text-white text-[9px] font-black shadow-[0_2px_0_#1a56a8]">{step === marks.length - 1 ? "Finish" : "Next"}</button></div>
        </div>
      </div>
    </Asset>
  );
}

export default function Onboarding() {
  return (
    <Section
      id="onboarding"
      index="13"
      title="Onboarding"
      subtitle="Trust before activation: personalize, assess, explain risk, then ask for wallet and notification permissions."
    >
      <GoalSelector />
      <PlacementTest />
      <RiskConsent />
      <WalletConnect />
      <NotificationPrompt />
      <CoachMarks />
    </Section>
  );
}