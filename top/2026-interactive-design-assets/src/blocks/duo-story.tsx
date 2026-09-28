import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { Bubble, Mascot, SKINS, type Mood, type Skin } from "../duo/Mascot";
import { D, DuoButton, LessonProgress, TypeLine } from "../duo/ui";
import { centerIn, useTimers } from "./util";

/* ═════════════ 30 · STORY ═════════════ */
type Line = { who: "moo" | "bea"; text: string } | { q: string; opts: string[]; a: number };

const SCRIPT: Line[] = [
  { who: "moo", text: "Whoa! BTC just pumped 12% in one hour." },
  { who: "bea", text: "The whole chat is buying. Should we jump in?" },
  { who: "moo", text: "Hmm… let me check the evidence first." },
  { q: "What should Moo decide first?", opts: ["What the chat thinks", "Where his idea is wrong", "His lucky number"], a: 1 },
  { who: "moo", text: "If price drops below 62.9k, my idea is wrong." },
  { who: "bea", text: "So you set the stop before you buy. Smart!" },
  { q: "Complete the rule: “Stop first, ___ second.”", opts: ["size", "panic", "tweet"], a: 0 },
  { who: "moo", text: "Exactly. Stop first, size second. 🐂" },
];
const CAST: Record<"moo" | "bea", { name: string; skin: Skin }> = {
  moo: { name: "Moo", skin: "green" },
  bea: { name: "Bea", skin: "pink" },
};

export function MascotStory() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [stage, setStage] = useState<"title" | "play" | "end">("title");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [wrong, setWrong] = useState<{ step: number; opt: number; k: number } | null>(null);
  const [talking, setTalking] = useState(false);

  const cur = SCRIPT[step];
  const isQ = "q" in cur;
  const answered = isQ && answers[step] === cur.a;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: fx.reduced ? "auto" : "smooth" });
    if (stage === "play" && !isQ) {
      setTalking(true);
      fx.sfx("pop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stage]);

  const next = () => {
    if (isQ && !answered) return;
    if (step + 1 >= SCRIPT.length) {
      setStage("end");
      fx.sfx("win");
      fx.haptic([30, 40, 90]);
      const w = root.current?.offsetWidth ?? 286;
      later(() => pr.current?.burst(w / 2, 160, { count: 90, colors: [D.green, D.pink, D.yellow, D.blue], speed: 10 }), 150);
      return;
    }
    setStep((s) => s + 1);
  };

  const pick = (i: number, el: HTMLElement) => {
    if (!isQ || answered) return;
    if (i === cur.a) {
      setAnswers((a) => ({ ...a, [step]: i }));
      fx.sfx("win");
      fx.haptic([20, 30, 50]);
      if (root.current) {
        const c = centerIn(root.current, el);
        pr.current?.burst(c.x, c.y, { count: 40, colors: [D.green, "#fff", D.yellow], speed: 6 });
      }
    } else {
      setWrong({ step, opt: i, k: Date.now() });
      fx.sfx("lose");
      fx.haptic([50, 30, 50]);
    }
  };

  const restart = () => {
    setStage("title");
    setStep(0);
    setAnswers({});
    setWrong(null);
  };

  if (stage === "title") {
    return (
      <div className="relative flex h-full flex-col items-center px-5 pb-5 pt-8 text-center">
        <div className="text-sm font-black uppercase tracking-wide text-[#ce82ff]">Story · Episode 1</div>
        <h2 className="mt-2 text-3xl font-black">The Pump</h2>
        <div className="mt-8 flex items-end gap-2">
          <Mascot mood="wow" size={110} />
          <Mascot mood="happy" size={96} skin="pink" />
        </div>
        <p className="mt-6 max-w-[230px] text-base font-bold text-white/60">Help Moo decide what to do when the whole chat is screaming “buy”.</p>
        <div className="flex-1" />
        <DuoButton tone="purple" full onClick={() => { setStage("play"); fx.sfx("whoosh"); }}>
          Start story
        </DuoButton>
      </div>
    );
  }

  if (stage === "end") {
    return (
      <div ref={root} className="relative flex h-full flex-col items-center px-5 pb-5 pt-10 text-center">
        <div className="flex items-end gap-2">
          <Mascot mood="cheer" size={110} />
          <Mascot mood="cheer" size={96} skin="pink" />
        </div>
        <h2 className="mt-6 text-3xl font-black text-[#ffc800]">Story complete!</h2>
        <p className="mt-2 text-base font-bold text-white/60">You learned: define invalidation before sizing.</p>
        <div className="mt-5 rounded-2xl bg-[#ffc800]/15 px-5 py-2 text-xl font-black text-[#ffc800]">+12 XP</div>
        <div className="flex-1" />
        <DuoButton full onClick={restart}>
          Continue
        </DuoButton>
        <Particles ref={pr} />
      </div>
    );
  }

  return (
    <div ref={root} className="relative flex h-full flex-col pb-5 pt-2">
      <div className="flex items-center gap-3 px-4">
        <button onClick={restart} aria-label="Exit story" className="grid h-9 w-9 place-items-center rounded-xl text-white/50 hover:bg-white/10">
          <X size={24} strokeWidth={3} />
        </button>
        <LessonProgress value={(step + 1) / SCRIPT.length} color={D.purple} />
        <Heart size={22} fill={D.red} strokeWidth={0} />
      </div>

      <div ref={scroller} className="no-scrollbar mt-3 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        {SCRIPT.slice(0, step + 1).map((ln, i) => {
          const newest = i === step;
          if ("q" in ln) {
            const done = answers[i] === ln.a;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                <div className="mb-2 text-center text-base font-black">{ln.q}</div>
                <div className="space-y-2">
                  {ln.opts.map((o, k) => {
                    const isWrong = wrong && wrong.step === i && wrong.opt === k;
                    const isRight = done && k === ln.a;
                    return (
                      <motion.div key={k} animate={isWrong && !fx.reduced ? { x: [0, -8, 7, -4, 0] } : { x: 0 }} transition={{ duration: 0.35 }}>
                        <button
                          disabled={done}
                          onClick={(e) => pick(k, e.currentTarget)}
                          className={`duo-card w-full px-4 py-3 text-left text-base font-extrabold ${isRight ? "duo-ok" : isWrong ? "duo-bad" : done ? "opacity-40" : ""}`}
                        >
                          {o}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          }
          const who = CAST[ln.who];
          const right = ln.who === "bea";
          const mood: Mood = newest && talking ? "talk" : "idle";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-end gap-1 ${right ? "flex-row-reverse" : ""}`}
            >
              <div className="flex flex-col items-center">
                <Mascot mood={mood} size={52} skin={who.skin} />
                <span className="text-xs font-black" style={{ color: SKINS[who.skin].body }}>
                  {who.name}
                </span>
              </div>
              <Bubble tail={right ? "right" : "left"} className={`mb-5 max-w-[190px] text-sm ${right ? "mr-2" : "ml-2"}`}>
                {newest ? <TypeLine text={ln.text} onDone={() => setTalking(false)} /> : ln.text}
              </Bubble>
            </motion.div>
          );
        })}
      </div>

      <div className="px-4">
        <DuoButton tone={isQ && !answered ? "ghost" : "green"} full disabled={isQ && !answered} onClick={next}>
          {isQ && !answered ? "Choose an answer" : "Continue"}
        </DuoButton>
      </div>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 31 · MASCOT PLAYGROUND ═════════════ */
const MOODS: Mood[] = ["idle", "happy", "cheer", "talk", "think", "wow", "sad", "sleep"];

export function MascotPlayground() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [mood, setMood] = useState<Mood>("idle");
  const [skin, setSkin] = useState<Skin>("green");
  const [pets, setPets] = useState(0);

  const pet = () => {
    setPets((p) => p + 1);
    setMood("wow");
    fx.sfx("pop");
    fx.haptic(12);
    later(() => {
      setMood("happy");
      fx.sfx("win");
      if (root.current && body.current) {
        const c = centerIn(root.current, body.current);
        pr.current?.burst(c.x, c.y - 30, { count: 18, colors: [D.pink, "#ff4b8b", "#fff"], speed: 4, gravity: -0.05, shape: "circle", size: 8, life: 60 });
      }
    }, fx.ms(260));
    later(() => setMood("idle"), fx.ms(1700));
  };

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="text-center">
        <div className="text-2xl font-black">Meet Moo</div>
        <div className="text-sm font-bold text-white/55">Tap him · pick a mood · try a skin</div>
      </div>

      <div ref={body} className="relative mt-3 flex flex-1 items-center justify-center">
        <div className="absolute h-44 w-44 rounded-full opacity-25 blur-2xl" style={{ background: SKINS[skin].body }} />
        <Mascot mood={mood} size={170} skin={skin} onClick={pet} />
        <AnimatePresence>
          {pets > 0 && (
            <motion.div key={pets} className="absolute right-6 top-6 text-lg font-black text-[#ff86b3]" initial={{ opacity: 0, y: 10, scale: 0.6 }} animate={{ opacity: [0, 1, 0], y: -30, scale: 1 }} transition={{ duration: fx.t(1.2) || 0.01 }}>
              +1 ♥
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMood(m);
              fx.sfx("tick");
              fx.haptic(5);
            }}
            aria-pressed={mood === m}
            className={`duo-card h-11 text-sm font-black capitalize ${mood === m ? "duo-sel" : ""}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {(Object.keys(SKINS) as Skin[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setSkin(k);
              fx.sfx("pop");
              fx.haptic(6);
            }}
            aria-label={`${k} skin`}
            aria-pressed={skin === k}
            className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90"
            style={{ boxShadow: skin === k ? `0 0 0 3px #132250, 0 0 0 6px ${SKINS[k].body}` : "none" }}
          >
            <span className="h-9 w-9 rounded-full" style={{ background: SKINS[k].body, boxShadow: `inset 0 -4px 0 ${SKINS[k].shade}` }} />
          </button>
        ))}
      </div>
      <div className="mt-3 text-center text-xs font-bold text-white/45">Skins are cosmetic only · never affect your score</div>
      <Particles ref={pr} />
    </div>
  );
}
