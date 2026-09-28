import { useState } from "react";
import { Asset, Bar, Btn, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

const EASINGS = {
  snap: "cubic-bezier(.2,.9,.3,1.3)",
  smooth: "cubic-bezier(.4,0,.2,1)",
  spring: "cubic-bezier(.34,1.65,.64,1)",
  exit: "cubic-bezier(.4,0,1,1)",
};

function CurveWorkbench() {
  const [curve, setCurve] = useState<keyof typeof EASINGS>("spring");
  const [duration, setDuration] = useState(500);
  const [run, setRun] = useState(0);
  const [end, setEnd] = useState(false);
  const play = () => {
    setRun((value) => value + 1);
    setEnd(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setEnd(true)));
  };
  return (
    <Asset
      code="MTN-01"
      title="Easing Workbench"
      desc="Compare four semantic curves at 150–1200ms. Position, scale and opacity use the same selected token."
      tags={["easing", "duration"]}
      span={2}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(EASINGS) as (keyof typeof EASINGS)[]).map((value) => <button key={value} onClick={() => setCurve(value)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black uppercase border-2", curve === value ? "border-violet bg-violet/15 text-violet" : "border-ink-600 text-mist")}>{value}</button>)}
        <Btn variant="violet" size="sm" icon="play" className="ml-auto" onClick={play}>Run</Btn>
      </div>
      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-3">
          {[
            ["Position", "sky"],
            ["Scale", "bull"],
            ["Opacity", "gold"],
          ].map(([label, color], index) => (
            <div key={`${label}${run}`} className="flex items-center gap-3">
              <span className="text-[9px] uppercase font-black text-mist w-14">{label}</span>
              <div className="well h-14 flex-1 relative overflow-hidden">
                <div className={cn("absolute top-2 w-10 h-10 rounded-xl grid place-items-center", color === "sky" ? "bg-sky shadow-[0_3px_0_#1a56a8]" : color === "bull" ? "bg-bull text-ink-900 shadow-[0_3px_0_#0b7a4a]" : "bg-gold text-ink-900 shadow-[0_3px_0_#b07600]")} style={{ left: label === "Position" ? end ? "calc(100% - 48px)" : 8 : "calc(50% - 20px)", transform: label === "Scale" ? `scale(${end ? 1 : .35})` : undefined, opacity: label === "Opacity" ? end ? 1 : .12 : 1, transition: `all ${duration}ms ${EASINGS[curve]}`, transitionDelay: `${index * 60}ms` }}><Icon name={label === "Position" ? "arrowUp" : label === "Scale" ? "sparkle" : "eye"} size={18} /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="well p-4">
          <div className="text-[9px] uppercase font-black tracking-widest text-mist mb-3">Token output</div>
          <div className="num text-xs text-violet leading-relaxed break-all">--ease-{curve}:<br />{EASINGS[curve]};</div>
          <div className="hairline my-4" />
          <div className="flex justify-between text-[10px] mb-1"><span className="text-mist">Duration</span><b className="num">{duration}ms</b></div>
          <input type="range" min={150} max={1200} step={50} value={duration} onChange={(event) => setDuration(+event.target.value)} className="w-full accent-violet" />
          <div className="mt-4 text-[9px] text-mist leading-relaxed">Use <b className="text-fog">snap</b> for direct response, <b className="text-fog">spring</b> for rewards, and <b className="text-fog">exit</b> only when content leaves.</div>
        </div>
      </div>
    </Asset>
  );
}

function StaggerStudio() {
  const [order, setOrder] = useState<"forward" | "reverse" | "center">("forward");
  const [gap, setGap] = useState(70);
  const [run, setRun] = useState(1);
  const items = ["BTC", "ETH", "SOL", "BNB", "TON", "DOGE"];
  const delay = (index: number) => order === "forward" ? index * gap : order === "reverse" ? (items.length - 1 - index) * gap : Math.abs(index - 2.5) * gap;
  return (
    <Asset
      code="MTN-02"
      title="Stagger Choreography"
      desc="Forward, reverse and center-out entry order with adjustable delay. Useful sequencing without decorative noise."
      tags={["stagger", "sequence"]}
    >
      <div className="well dotgrid p-4 space-y-2 min-h-[250px] mb-4" key={run}>
        {items.map((symbol, index) => (
          <div key={symbol} className="tile !rounded-xl p-2.5 flex items-center gap-3 anim-card-deal" style={{ animationDelay: `${delay(index)}ms` }}>
            <span className="num w-7 h-7 rounded-lg bg-sky/15 text-sky grid place-items-center text-[9px] font-black">{index + 1}</span>
            <span className="text-xs font-black flex-1">{symbol} lesson pack</span>
            <span className="text-[8px] text-mist">{Math.round(delay(index))}ms</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">{(["forward", "reverse", "center"] as const).map((value) => <button key={value} onClick={() => { setOrder(value); setRun((run) => run + 1); }} className={cn("h-8 px-3 rounded-lg text-[9px] font-black border", order === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}<Btn variant="ghost" size="xs" icon="refresh" className="ml-auto" onClick={() => setRun((run) => run + 1)}>Replay</Btn></div>
      <div className="flex items-center gap-3"><span className="text-[9px] text-mist">Delay</span><input type="range" min={20} max={160} step={10} value={gap} onChange={(event) => setGap(+event.target.value)} className="flex-1 accent-sky" /><span className="num text-[9px] font-black">{gap}ms</span></div>
    </Asset>
  );
}

function SpringTuner() {
  const [stiffness, setStiffness] = useState(62);
  const [damping, setDamping] = useState(72);
  const [target, setTarget] = useState(false);
  const overshoot = Math.max(0, (100 - damping) / 100 * .28);
  const duration = Math.max(220, 1000 - stiffness * 8);
  const bezier = `cubic-bezier(.2,${1 + overshoot * 2},.4,1)`;
  return (
    <Asset
      code="MTN-03"
      title="Spring Tuner"
      desc="A designer-facing physics proxy turns stiffness and damping into understandable feel, with a live drag-target demo."
      tags={["spring", "physics"]}
    >
      <div className="well dotgrid h-44 relative mb-4 overflow-hidden">
        <div className="absolute left-6 right-6 top-1/2 h-1 rounded-full bg-ink-600" />
        <div className="absolute top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-b from-[#a886ff] to-[#7a4af0] shadow-[0_6px_0_#4f2bb0] grid place-items-center cursor-pointer" onClick={() => setTarget(!target)} style={{ left: target ? "calc(100% - 88px)" : 24, transition: `left ${duration}ms ${bezier}` }}><Icon name="bolt" size={28} fill="currentColor" /></div>
        <div className="absolute bottom-3 left-0 right-0 text-center text-[8px] text-mist">Tap the block · {duration}ms · overshoot {Math.round(overshoot * 100)}%</div>
      </div>
      <div className="space-y-3">
        <label className="grid grid-cols-[70px_1fr_35px] items-center gap-2 text-[9px] font-bold text-mist">Stiffness<input type="range" min={20} max={95} value={stiffness} onChange={(event) => setStiffness(+event.target.value)} className="accent-violet" /><span className="num text-fog">{stiffness}</span></label>
        <label className="grid grid-cols-[70px_1fr_35px] items-center gap-2 text-[9px] font-bold text-mist">Damping<input type="range" min={25} max={100} value={damping} onChange={(event) => setDamping(+event.target.value)} className="accent-violet" /><span className="num text-fog">{damping}</span></label>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">{[["Responsive", 78, 82], ["Playful", 62, 54], ["Calm", 42, 92]].map(([label, stiff, damp]) => <button key={label as string} onClick={() => { setStiffness(stiff as number); setDamping(damp as number); setTarget(!target); }} className="h-9 rounded-xl border-2 border-ink-600 text-[9px] font-black text-mist hover:border-violet hover:text-violet">{label as string}</button>)}</div>
    </Asset>
  );
}

type Celebration = "xp" | "streak" | "level" | "chest";

function CelebrationComposer() {
  const [kind, setKind] = useState<Celebration>("xp");
  const [intensity, setIntensity] = useState(2);
  const [burst, setBurst] = useState(1);
  const config = {
    xp: { title: "+25 XP", sub: "Lesson complete", icon: "bolt", color: "#ffc53d", variant: "gold" as const },
    streak: { title: "13 DAYS", sub: "Streak extended", icon: "flame", color: "#ff8a3d", variant: "flame" as const },
    level: { title: "LEVEL 9", sub: "Risk Planner unlocked", icon: "trophy", color: "#9b6bff", variant: "violet" as const },
    chest: { title: "RARE DROP", sub: "Diamond frame", icon: "gift", color: "#3da5ff", variant: "sky" as const },
  }[kind];
  const play = () => setBurst((value) => value + 1);
  return (
    <Asset
      code="MTN-04"
      title="Celebration Composer"
      desc="Reward magnitude controls particle count, scale and timing. Small wins stay quick; level-ups earn the full stage."
      tags={["celebration", "magnitude"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div className="well dotgrid min-h-72 relative grid place-items-center overflow-hidden">
          <Confetti burst={burst} count={intensity * 18} />
          <div key={`${kind}${burst}`} className="text-center anim-bounce-in">
            <div className="relative mx-auto" style={{ width: 72 + intensity * 12, height: 72 + intensity * 12 }}>
              {intensity >= 3 && <div className="absolute inset-[-40%] opacity-35" style={{ background: `repeating-conic-gradient(${config.color}88 0 8deg,transparent 8deg 24deg)`, animation: "raysSpin 14s linear infinite", maskImage: "radial-gradient(circle,#000 15%,transparent 65%)" }} />}
              <div className="absolute inset-0 rounded-[30%] grid place-items-center" style={{ color: kind === "xp" ? "#3a2500" : "#fff", background: `linear-gradient(180deg,${config.color}dd,${config.color}99)`, boxShadow: `0 ${4 + intensity}px 0 ${config.color}66,0 0 ${12 + intensity * 8}px ${config.color}55`, animation: intensity >= 3 ? "float 2s ease-in-out infinite" : undefined }}><Icon name={config.icon} size={32 + intensity * 4} fill={config.icon === "bolt" || config.icon === "flame" ? "currentColor" : "none"} stroke={2.4} /></div>
            </div>
            <div className="num text-3xl font-black mt-6" style={{ color: config.color }}>{config.title}</div>
            <div className="text-xs text-mist mt-1">{config.sub}</div>
          </div>
          <div className="absolute left-3 bottom-3 text-[8px] text-mist">Magnitude {intensity}/4 · {intensity * 18} particles</div>
        </div>
        <div className="flex flex-col">
          <div className="text-[9px] uppercase tracking-widest font-black text-mist mb-2">Reward type</div>
          <div className="grid grid-cols-2 gap-2 mb-5">{(["xp", "streak", "level", "chest"] as Celebration[]).map((value) => <button key={value} onClick={() => { setKind(value); play(); }} className={cn("h-12 rounded-xl border-2 text-[9px] font-black uppercase flex items-center justify-center gap-2", kind === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}><Icon name={{ xp: "bolt", streak: "flame", level: "trophy", chest: "gift" }[value]} size={15} />{value}</button>)}</div>
          <div className="text-[9px] uppercase tracking-widest font-black text-mist mb-2">Magnitude</div>
          <div className="grid grid-cols-4 gap-2 mb-5">{[1, 2, 3, 4].map((value) => <button key={value} onClick={() => { setIntensity(value); play(); }} className={cn("h-9 rounded-xl border-2 num text-[10px] font-black", intensity === value ? "border-gold bg-gold/15 text-gold" : "border-ink-600 text-mist")}>{value}</button>)}</div>
          <Btn variant={config.variant} icon="play" block className="mt-auto" onClick={play}>Replay celebration</Btn>
        </div>
      </div>
    </Asset>
  );
}

function StateChoreography() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const run = (result: "success" | "error") => {
    setState("loading");
    setTimeout(() => setState(result), 950);
  };
  return (
    <Asset
      code="MTN-05"
      title="State Choreography"
      desc="One control morphs from idle to loading to success or error without layout shift, duplicate labels or competing motion."
      tags={["morph", "feedback"]}
    >
      <div className="well dotgrid min-h-56 grid place-items-center mb-4">
        <button disabled={state === "loading"} onClick={() => run("success")} className={cn("relative h-16 transition-all duration-500 overflow-hidden font-black uppercase tracking-wider", state === "idle" ? "w-52 rounded-2xl bg-sky shadow-[0_6px_0_#1a56a8]" : state === "loading" ? "w-16 rounded-full bg-sky" : state === "success" ? "w-52 rounded-2xl bg-bull shadow-[0_6px_0_#0b7a4a] text-ink-900" : "w-52 rounded-2xl bg-bear shadow-[0_6px_0_#a01e3c]")}>
          <span key={state} className="absolute inset-0 grid place-items-center anim-pop">
            {state === "idle" && <span className="flex items-center gap-2"><Icon name="send" size={18} />Place demo order</span>}
            {state === "loading" && <span className="w-7 h-7 rounded-full border-4 border-white/35 border-t-white anim-spin" />}
            {state === "success" && <span className="flex items-center gap-2"><Icon name="check" size={20} stroke={3.5} />Order filled</span>}
            {state === "error" && <span className="flex items-center gap-2"><Icon name="x" size={20} stroke={3.5} />Try again</span>}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2"><Btn variant="sky" size="xs" onClick={() => setState("idle")}>Idle</Btn><Btn variant="bull" size="xs" onClick={() => run("success")}>Success</Btn><Btn variant="bear" size="xs" onClick={() => run("error")}>Error</Btn></div>
      <div className="mt-3 rounded-xl p-2.5 bg-white/[.025] text-[9px] text-mist">Container reserves final width; only shape, color and internal content transition. Screen-reader status remains separate.</div>
    </Asset>
  );
}

function LoadingNarrative() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(true);
  const stages = [
    { at: 0, label: "Connecting to practice market", icon: "refresh" },
    { at: 28, label: "Loading historical candles", icon: "candles" },
    { at: 58, label: "Preparing lesson scenario", icon: "book" },
    { at: 84, label: "Almost ready", icon: "sparkle" },
  ];
  useInterval(() => setProgress((value) => value >= 100 ? 0 : value + 2), running ? 80 : null);
  const current = [...stages].reverse().find((stage) => progress >= stage.at) ?? stages[0];
  return (
    <Asset
      code="MTN-06"
      title="Loading Narrative"
      desc="Progress communicates what the system is doing, uses determinate movement and keeps a visible cancel/pause route."
      tags={["loading", "progress"]}
    >
      <div className="well dotgrid min-h-56 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90"><circle cx="32" cy="32" r="27" fill="none" stroke="#172856" strokeWidth="6" /><circle cx="32" cy="32" r="27" fill="none" stroke="#3da5ff" strokeWidth="6" strokeLinecap="round" strokeDasharray={170} strokeDashoffset={170 * (1 - progress / 100)} className="transition-all" /></svg>
            <div className="absolute inset-0 grid place-items-center"><Icon key={current.icon} name={current.icon} size={23} className="text-sky anim-pop" /></div>
          </div>
          <div className="min-w-0"><div key={current.label} className="font-black anim-rise">{current.label}</div><div className="num text-xs text-mist mt-1">{progress}% complete</div></div>
        </div>
        <Bar value={progress} color="sky" h={14} />
        <div className="grid grid-cols-4 gap-1.5 mt-4">{stages.map((stage) => <div key={stage.label} className={cn("h-1.5 rounded-full transition-colors", progress >= stage.at ? "bg-sky" : "bg-ink-600")} />)}</div>
      </div>
      <div className="flex items-center justify-between mt-4"><span className="text-[9px] text-mist">Typical load: 1.8 seconds · offline fallback available</span><Btn variant="ghost" size="xs" icon={running ? "minus" : "play"} onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</Btn></div>
    </Asset>
  );
}

export default function MotionLab() {
  return (
    <Section
      id="motion"
      index="17"
      title="Motion Direction"
      subtitle="Motion is a functional language: curves, sequence, physics, reward magnitude, state morphing and honest waiting."
    >
      <CurveWorkbench />
      <StaggerStudio />
      <SpringTuner />
      <CelebrationComposer />
      <StateChoreography />
      <LoadingNarrative />
    </Section>
  );
}