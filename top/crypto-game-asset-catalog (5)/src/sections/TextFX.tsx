import { useEffect, useMemo, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

/* ============ 1. KINETIC WAVE ============ */
function KineticWave() {
  const [text, setText] = useState("TO THE MOON");
  const [amp, setAmp] = useState(10);
  const [speed, setSpeed] = useState(50);
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; let last = performance.now();
    const loop = (now: number) => { setT((v) => v + ((now - last) / 1000) * (speed / 40)); last = now; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return (
    <Asset title="Kinetic Wave" id="txt.wave" desc="Каждая буква плывёт по синусу со сдвигом фазы. Живой текст, амплитуда и скорость.">
      <div className="inset !rounded-2xl h-[150px] grid place-items-center overflow-hidden px-4">
        <div className="font-extrabold text-[30px] sm:text-[38px] tracking-tight whitespace-nowrap" aria-label={text}>
          {text.split("").map((ch, i) => {
            const y = Math.sin(t * 2.4 + i * 0.55) * amp;
            const r = Math.cos(t * 2 + i * 0.4) * 6;
            const hue = 150 + Math.sin(t * 1.4 + i * 0.3) * 60;
            return <span key={i} className="inline-block will-change-transform" style={{ transform: `translateY(${y}px) rotate(${r}deg)`, color: `hsl(${hue} 90% 62%)`, textShadow: `0 4px 0 rgba(0,0,0,.35), 0 0 24px hsl(${hue} 90% 55% / .5)` }}>{ch === " " ? "\u00A0" : ch}</span>;
          })}
        </div>
      </div>
      <input value={text} onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 18))} maxLength={18}
        className="mt-3 w-full h-11 px-4 rounded-xl bg-[#0a1330] border-2 border-[#22366f] focus:border-blue outline-none font-bold text-[13px]" placeholder="Свой текст…" />
      <div className="grid grid-cols-2 gap-3 mt-2">
        <label className="text-[11px] font-bold text-dim">Amplitude {amp}<input type="range" min={2} max={22} value={amp} onChange={(e) => setAmp(+e.target.value)} className="w-full accent-[#1fdb8b]" /></label>
        <label className="text-[11px] font-bold text-dim">Speed {speed}<input type="range" min={10} max={120} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-[#3d7bff]" /></label>
      </div>
    </Asset>
  );
}

/* ============ 2. GLITCH ============ */
function Glitch() {
  const [on, setOn] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [text] = useState("LIQUIDATED");
  const [jolt, setJolt] = useState(0);
  useEffect(() => {
    if (!on) return;
    const h = setInterval(() => { if (Math.random() < intensity / 130) { setJolt((j) => j + 1); sfx.tick(); } }, 500);
    return () => clearInterval(h);
  }, [on, intensity]);
  return (
    <Asset title="Glitch Display" id="txt.glitch" desc="RGB-разводка, клип-срезы и рывки. Интенсивность регулирует частоту глитч-импульсов.">
      <div className="inset !rounded-2xl h-[150px] grid place-items-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-[.06]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)" }} />
        <span key={jolt} className={cn("glitch font-extrabold text-[34px] sm:text-[44px] tracking-tight", on && "glitch-on")} data-text={text}
          style={{ ["--gx" as string]: `${(intensity / 100) * 8}px`, animation: on ? undefined : "none" }}>{text}</span>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Btn3D size="xs" variant={on ? "bear" : "neutral"} onClick={() => { setOn(!on); sfx.toggle(); }}>{on ? "Glitch ON" : "Glitch OFF"}</Btn3D>
        <input type="range" min={10} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="flex-1 accent-[#ff4d6a]" />
        <Btn3D size="xs" variant="neutral" onClick={() => { setJolt((j) => j + 1); sfx.error(); }}>Jolt</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 3. NEON FLICKER ============ */
function Neon() {
  const signs = [
    { t: "BULL MARKET", c: "#1fdb8b" },
    { t: "OPEN 24/7", c: "#ff4d9a" },
    { t: "HODL", c: "#2ed3f0" },
  ];
  const [i, setI] = useState(0);
  const [flick, setFlick] = useState(0);
  useEffect(() => {
    const h = setInterval(() => { if (Math.random() < 0.35) { setFlick((f) => f + 1); } }, 900);
    return () => clearInterval(h);
  }, []);
  const s = signs[i];
  return (
    <Asset title="Neon Sign" id="txt.neon" desc="Неоновая вывеска с мерцанием трубки, гудением-пульсом и сменой надписей.">
      <div className="rounded-2xl h-[150px] grid place-items-center bg-[#04070f] border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 60%, ${s.c}22, transparent 65%)` }} />
        <div key={i + "-" + flick} className="neon-flick text-center font-extrabold text-[32px] sm:text-[40px] tracking-[.08em]"
          style={{ color: "#fff", textShadow: `0 0 6px #fff, 0 0 14px ${s.c}, 0 0 34px ${s.c}, 0 0 70px ${s.c}` }}>{s.t}</div>
        <div className="absolute bottom-2 text-[10px] font-bold text-dim">неон · {s.c}</div>
      </div>
      <div className="flex gap-2 mt-3">
        {signs.map((x, k) => (
          <Btn3D key={x.t} size="xs" variant={k === i ? "gold" : "neutral"} full onClick={() => { setI(k); sfx.pop(); }}>{x.t}</Btn3D>
        ))}
      </div>
    </Asset>
  );
}

/* ============ 4. TYPEWRITER TERMINAL ============ */
const LINES = [
  "$ connect exchange --live",
  "✓ BTC/USDT 67,420.12 (+2.41%)",
  "$ open long --size 0.15 --lev 5x",
  "✓ position #8841 filled @ 67,418",
  "$ set stoploss --at 64,200",
  "✓ risk capped: -3.1% max",
  "⚡ TP hit +8.0% · +$812.40",
];
function Terminal() {
  const [chars, setChars] = useState(0);
  const [play, setPlay] = useState(true);
  const full = LINES.join("\n");
  useEffect(() => {
    if (!play) return;
    if (chars >= full.length) { const h = setTimeout(() => setChars(0), 2600); return () => clearTimeout(h); }
    const h = setTimeout(() => { setChars((c) => c + (Math.random() > 0.85 ? 3 : 1)); if (chars % 5 === 0) sfx.tick(); }, 26);
    return () => clearTimeout(h);
  }, [chars, play, full]);
  const shown = full.slice(0, chars);
  return (
    <Asset title="Terminal Typewriter" id="txt.term" desc="Торговый терминал печатает живую сессию: подключение, ордер, стоп, тейк. Пауза и рестарт.">
      <div className="rounded-2xl bg-[#04070f] border border-white/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 h-9 border-b border-white/5">
          <span className="size-2.5 rounded-full bg-bear" /><span className="size-2.5 rounded-full bg-gold" /><span className="size-2.5 rounded-full bg-bull" />
          <span className="ml-2 text-[10.5px] font-bold text-dim num">bulli@exchange ~ zsh</span>
        </div>
        <pre className="p-4 h-[190px] text-[12px] leading-[1.7] font-mono whitespace-pre-wrap overflow-hidden">
          {shown}<span className="inline-block w-2 h-4 bg-bull align-middle ml-0.5" style={{ animation: "caret 1s step-end infinite" }} />
        </pre>
      </div>
      <div className="flex gap-2 mt-3">
        <Btn3D size="xs" variant={play ? "neutral" : "bull"} full onClick={() => setPlay(!play)}>{play ? "Pause" : "Resume"}</Btn3D>
        <Btn3D size="xs" variant="neutral" onClick={() => { setChars(0); setPlay(true); }}>Restart</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. SCRAMBLE DECODE ============ */
const CHARS = "█▓▒░ABCDEF0123456789$#%";
function Scramble() {
  const words = ["DIAMOND HANDS", "STOP-LOSS FIRST", "BUY THE DIP", "RISK 1% ONLY"];
  const [wi, setWi] = useState(0);
  const [out, setOut] = useState(words[0]);
  const [lock, setLock] = useState(false);
  const decode = (target: string) => {
    setLock(true);
    let frame = 0;
    const total = 34;
    const h = setInterval(() => {
      frame++;
      const reveal = Math.floor((frame / total) * target.length * 1.2);
      setOut(target.split("").map((c, i) => (i < reveal || c === " " ? c : CHARS[(Math.random() * CHARS.length) | 0])).join(""));
      if (frame % 4 === 0) sfx.tick();
      if (frame >= total) { clearInterval(h); setOut(target); setLock(false); sfx.success(); }
    }, 34);
  };
  useEffect(() => { decode(words[0]); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Asset title="Scramble Decode" id="txt.scramble" desc="Шифр раскрывается слева направо с кластерным шумом. Клик по слову — перекодировать.">
      <div className="inset !rounded-2xl h-[120px] grid place-items-center px-4">
        <div className="font-mono font-extrabold text-[24px] sm:text-[30px] text-gold tracking-wide text-center" style={{ textShadow: "0 0 24px rgba(255,197,61,.4)" }}>{out}</div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {words.map((w, k) => (
          <Btn3D key={w} size="xs" variant={k === wi ? "gold" : "neutral"} disabled={lock} onClick={() => { setWi(k); decode(w); }}>{w}</Btn3D>
        ))}
      </div>
    </Asset>
  );
}

/* ============ 6. GRADIENT SWEEP TEXT ============ */
function GradientSweep() {
  const [speed, setSpeed] = useState(3);
  const themes = [
    "linear-gradient(90deg,#1fdb8b,#2ed3f0,#3d7bff,#8d5cff,#ff4d6a,#ffc53d,#1fdb8b)",
    "linear-gradient(90deg,#ffc53d,#ff8a3d,#ff4d6a,#8d5cff,#ffc53d)",
    "linear-gradient(90deg,#2ed3f0,#3d7bff,#8d5cff,#2ed3f0)",
  ];
  const [ti, setTi] = useState(0);
  return (
    <Asset title="Gradient Sweep" id="txt.gradient" desc="Бегущий градиент по буквам: скорость и палитра. Чистый CSS background-clip.">
      <div className="inset !rounded-2xl h-[150px] grid place-items-center overflow-hidden">
        <div className="font-extrabold text-[40px] sm:text-[52px] tracking-tight bg-clip-text text-transparent"
          style={{ backgroundImage: themes[ti], backgroundSize: "300% 100%", animation: `gradient-x ${speed}s linear infinite` }}>PROFIT</div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex gap-1.5">
          {themes.map((_, k) => <button key={k} onClick={() => { setTi(k); sfx.tick(); }} className={cn("size-7 rounded-lg border-2", ti === k ? "border-white scale-110" : "border-transparent")} style={{ background: themes[k] }} />)}
        </div>
        <input type="range" min={1} max={8} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="flex-1 accent-[#8d5cff]" />
        <span className="num text-[11px] font-extrabold w-8">{speed}s</span>
      </div>
    </Asset>
  );
}

/* ============ 7. SPLIT CHAR STAGGER ============ */
function CharStagger() {
  const [k, setK] = useState(0);
  const [mode, setMode] = useState<"rise" | "flip" | "blur">("rise");
  const text = "LEVEL UP";
  const anim = (i: number): React.CSSProperties => {
    const d = `${i * 55}ms`;
    if (mode === "rise") return { animation: `roll-in-up .6s cubic-bezier(.3,1.4,.5,1) ${d} both` };
    if (mode === "flip") return { animation: `coinflip .7s cubic-bezier(.3,1.3,.5,1) ${d} both` };
    return { animation: `fade-in .5s ease ${d} both`, filter: "blur(0)" };
  };
  return (
    <Asset title="Char Stagger" id="txt.stagger" desc="Появление по буквам тремя способами: подъём, флип, растворение. Replay перезапускает каскад.">
      <div className="inset !rounded-2xl h-[150px] grid place-items-center overflow-hidden">
        <div key={k + mode} className="font-extrabold text-[46px] tracking-tight flex" style={{ perspective: 400 }}>
          {text.split("").map((ch, i) => <span key={i} className="inline-block" style={{ ...anim(i), color: i < 5 ? "#ffc53d" : "#1fdb8b", textShadow: "0 5px 0 rgba(0,0,0,.35)" }}>{ch === " " ? "\u00A0" : ch}</span>)}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {(["rise", "flip", "blur"] as const).map((m) => <Btn3D key={m} size="xs" variant={mode === m ? "blue" : "neutral"} onClick={() => { setMode(m); setK(k + 1); }}>{m}</Btn3D>)}
        <Btn3D size="xs" variant="gold" className="ml-auto" icon={<Icon name="refresh" size={12} />} onClick={() => { setK(k + 1); sfx.whoosh(); }}>Replay</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 8. COUNT-UP FINALE ============ */
function Finale() {
  const [v, setV] = useState(0);
  const target = 1000000;
  const [run, setRun] = useState(false);
  const s = v.toLocaleString("en-US").padStart(9, " ");
  useEffect(() => {
    if (!run) return;
    let raf = 0; const t0 = performance.now(); const dur = 2200;
    const loop = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      setV(Math.round(target * e));
      if (k < 1) raf = requestAnimationFrame(loop);
      else { setRun(false); sfx.levelUp(); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return (
    <Asset title="Jackpot Counter" id="txt.jackpot" desc="Счётчик до миллиона с easeOutQuart: цифры барабанят, золото пульсирует.">
      <div className="rounded-2xl h-[150px] grid place-items-center bg-gradient-to-b from-[#2a1a05] to-[#0a1330] border border-gold/30 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20" style={{ background: "repeating-conic-gradient(from 0deg at 50% 120%, rgba(255,197,61,.4) 0 8deg, transparent 8deg 16deg)" }} />
        <div className="relative font-mono font-extrabold text-[34px] sm:text-[40px] text-gold num tracking-wider" style={{ textShadow: "0 0 30px rgba(255,197,61,.6), 0 4px 0 rgba(0,0,0,.4)" }}>
          ${s}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Btn3D size="sm" variant="gold" full loading={run} onClick={() => { setV(0); setRun(true); sfx.whoosh(); }}>{run ? "Counting…" : "Spin to $1,000,000"}</Btn3D>
        <Badge tone="gold"><span className="num">{Math.round((v / target) * 100)}%</span></Badge>
      </div>
    </Asset>
  );
}

/* ============ 9. MARQUEE TYPO ============ */
function Marquee() {
  const words = useMemo(() => ["HODL", "DYOR", "BULLISH", "MOON", "ALPHA", "WAGMI", "DEGEN", "REKT"], []);
  const [speed, setSpeed] = useState(18);
  const [outline, setOutline] = useState(false);
  const row = [...words, ...words];
  return (
    <Asset title="Typo Marquee" id="txt.marquee" desc="Бегущая строка сленга: скорость, заливка/контур, пауза при наведении." className="lg:col-span-2">
      <div className="inset !rounded-2xl py-5 overflow-hidden group relative" style={{ maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
        <div className="flex gap-8 w-max whitespace-nowrap" style={{ animation: `marquee-x ${speed}s linear infinite` }}>
          {row.map((w, i) => (
            <span key={i} className="font-extrabold text-[34px] tracking-tight flex items-center gap-8"
              style={outline ? { color: "transparent", WebkitTextStroke: "1.5px #3d5aa8" } : { background: "linear-gradient(180deg,#eaf0ff,#8e9cc8)", WebkitBackgroundClip: "text", color: "transparent" }}>
              {w}<span className="size-2.5 rounded-full bg-bull inline-block" />
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-[11px] font-bold text-dim">Speed</span>
        <input type="range" min={6} max={40} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="flex-1 accent-[#1fdb8b]" />
        <Btn3D size="xs" variant={outline ? "blue" : "neutral"} onClick={() => setOutline(!outline)}>Outline</Btn3D>
      </div>
    </Asset>
  );
}

export default function TextFX() {
  return (
    <Section id="textfx" index="23" title="Text FX Lab" subtitle="9 текстовых эффектов: кинетика, глитч, неон, терминал, scramble, градиенты, стаггер, джекпот, бегущая строка" count={9}>
      <div className="grid lg:grid-cols-3 gap-6">
        <KineticWave />
        <Glitch />
        <Neon />
        <Terminal />
        <Scramble />
        <GradientSweep />
        <CharStagger />
        <Finale />
        <Marquee />
      </div>
    </Section>
  );
}
