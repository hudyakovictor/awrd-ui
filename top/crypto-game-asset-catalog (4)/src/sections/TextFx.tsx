import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section, useBump } from "../ui/kit";
import { useInView, useTilt } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { cn } from "../utils/cn";

/* ═════════ TXT-01 · Typewriter code ═════════ */
const CODE = `// risk engine v2
const risk  = account * 0.01;
const dist  = (entry - stop) / entry;
const size  = risk / dist;

if (size > maxPosition) abort();
place(size, "limit"); // 🎯 R:R = 1:3`;
function TypewriterCode() {
  const [n, setN] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= CODE.length) { setPlaying(false); return v; }
        if (v % 3 === 0) sfx.play("tick");
        return v + 1;
      });
    }, 38);
    return () => clearInterval(id);
  }, [playing]);
  const done = n >= CODE.length;
  const replay = () => { setN(0); setPlaying(true); feel("whoosh"); };
  return (
    <AssetCard id="TXT-01" title="Typewriter Code Block" desc="Печатающийся код с мигающим курсором и тик-звуком: так урок «рассказывает» логику позиции строка за строкой." tags={["text", "typewriter", "code", "tts-ready"]}>
      <div className="rounded-2xl bg-ink-950 p-4 shadow-[inset_0_0_0_1px_#2ee59d22]">
        <div className="mb-3 flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-bear" /><span className="h-2.5 w-2.5 rounded-full bg-gold" /><span className="h-2.5 w-2.5 rounded-full bg-bull" /><span className="ml-2 font-mono text-[10px] text-ink-500">position.ts</span></div>
        <pre className="min-h-[150px] whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-ink-100">{CODE.slice(0, n)}<span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-bull" style={{ animation: "caret .8s step-end infinite" }} /></pre>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-ink-300">{n}/{CODE.length} chars{done && " · done"}</span>
        <Btn v="ghost" size="sm" onClick={replay}><Icon name="refresh" size={14} />{done ? "Replay" : "Restart"}</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ TXT-02 · Stagger headline ═════════ */

function StaggerHeadline() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5, once: false });
  const [k, bump] = useBump();
  const words = ["MASTER", "THE", "MARKET"];
  return (
    <AssetCard id="TXT-02" title="Stagger Headline" desc="Слова заезжают из-под маски со stagger-задержкой и лёгким поворотом; воспроизводится при каждом входе в вьюпорт." tags={["text", "stagger", "mask", "scroll-reveal"]}>
      <div ref={ref} onClick={() => bump()} className="cursor-pointer select-none py-6 text-center">
        <h3 key={k} className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {words.map((w, wi) => (
            <span key={wi} className="mx-[.22em] inline-block overflow-hidden align-bottom">
              {w.split("").map((c, ci) => (
                <span key={ci} className="inline-block" style={{ animation: `letterIn .6s cubic-bezier(.2,1.2,.4,1) both`, animationDelay: `${(wi * 6 + ci) * 45}ms` }}>{c}</span>
              ))}
            </span>
          ))}
        </h3>
        <div className="mx-auto mt-4 h-1 w-32 origin-left rounded-full bg-gradient-to-r from-bull to-sky" style={{ animation: `lineGrow .8s cubic-bezier(.2,.8,.2,1) .7s both` }} />
        <div className="mt-3 text-xs font-bold text-ink-400">tap to replay · replays on scroll in/out</div>
      </div>
    </AssetCard>
  );
}

/* ═════════ TXT-03 · Glitch text ═════════ */
function GlitchText() {
  const [glitch, setGlitch] = useState(false);
  const [manual, setManual] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => { setGlitch(true); window.setTimeout(() => setGlitch(false), 480); }, 2400);
    return () => clearInterval(id);
  }, []);
  const on = glitch || manual > 0;
  const fire = () => { setManual((m) => m + 1); setGlitch(true); feel("lock", 12); window.setTimeout(() => setGlitch(false), 500); };
  const T = "LIQUIDATION";
  return (
    <AssetCard id="TXT-03" title="Glitch Text" desc="RGB-расщепление и clip-глитч: два цветных слоя с анимированными срезами поверх основного текста. Авто-вспышки каждые 2.4 с + ручная кнопка." tags={["text", "glitch", "rgb-split"]}>
      <div className="relative grid h-32 select-none place-items-center">
        <span className="relative text-5xl font-extrabold tracking-tight text-white">
          {T}
          {on && <>
            <span aria-hidden className="absolute inset-0 text-bear" style={{ animation: "glitchA .4s steps(3) both" }}>{T}</span>
            <span aria-hidden className="absolute inset-0 text-bull" style={{ animation: "glitchB .4s steps(3) both" }}>{T}</span>
          </>}
        </span>
      </div>
      <div className="flex justify-center"><Btn v="bear" size="sm" onClick={fire}><Icon name="bolt" size={14} variant="solid" />Glitch now</Btn></div>
    </AssetCard>
  );
}

/* ═════════ TXT-04 · 3D extrude ═════════ */
function Extrude3D() {
  const t = useTilt();
  const W = "TRUST";
  const layers = Array.from({ length: 16 }, (_, i) => `0 ${i * 1.4}px 0 hsl(${215 - i * 3} 60% ${24 - i}%)`);
  const shade = `0 ${16 * 1.4 + 6}px 18px rgba(0,0,0,.55)`;
  return (
    <AssetCard id="TXT-04" title="3D Extruded Type" desc="16 слоёв text-shadow дают объёмную экструзию; наклон (мышь/гироскоп) крутит слово и сдвигает блик по буквам." tags={["text", "3d", "extrude", "tilt"]}>
      <div className="grid h-44 place-items-center" style={{ perspective: 700 }}>
        <div className="select-none text-6xl font-extrabold tracking-tight text-white sm:text-7xl" style={{
          transform: `rotateY(${t.x * 22}deg) rotateX(${-t.y * 16}deg) translate(${t.x * -8}px, ${t.y * -6}px)`,
          textShadow: `${layers.join(", ")}, ${shade}`,
          transition: "transform .12s",
        }}>
          {W}
          <span className="pointer-events-none absolute inset-0 bg-clip-text text-transparent" style={{ backgroundImage: `radial-gradient(circle at ${(t.x + 1) * 50}% ${(t.y + 1) * 40}%, #ffffffb0, transparent 45%)`, display: "none" }} />
        </div>
      </div>
      <div className="text-center text-[11px] font-bold text-ink-400">move the pointer / tilt the device</div>
    </AssetCard>
  );
}

/* ═════════ TXT-05 · Liquid wave fill ═════════ */
function LiquidText() {
  const [level, setLevel] = useState(55);
  return (
    <AssetCard id="TXT-05" title="Liquid Wave Text" desc="Слово залито анимированной волной (два слоя SVG, движущиеся с разной скоростью); уровень «жидкости» регулируется слайдером." tags={["text", "liquid", "wave", "clip-path"]}>
      <div className="relative grid h-36 place-items-center overflow-hidden">
        <svg viewBox="0 0 400 120" className="h-full w-full">
          <defs>
            <clipPath id="ltclip"><text x="200" y="82" textAnchor="middle" fontSize="64" fontWeight="800" fontFamily="Manrope, sans-serif">LIQUIDITY</text></clipPath>
            <linearGradient id="ltg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5ce1ff" /><stop offset="1" stopColor="#1e56c9" /></linearGradient>
          </defs>
          <text x="200" y="82" textAnchor="middle" fontSize="64" fontWeight="800" fontFamily="Manrope, sans-serif" fill="#16264f">LIQUIDITY</text>
          <g clipPath="url(#ltclip)">
            <rect x="0" y={120 - (level / 100) * 120} width="400" height="120" fill="url(#ltg)" />
            <g style={{ animation: "marquee 7s linear infinite" }}>
              <path d="M0 0 Q 25 -12 50 0 T 100 0 T 150 0 T 200 0 T 250 0 T 300 0 T 350 0 T 400 0 T 450 0 T 500 0 T 550 0 T 600 0 V 120 H 0 Z" fill="#3d8bff" opacity=".55" transform={`translate(0, ${114 - (level / 100) * 120})`} />
            </g>
            <g style={{ animation: "marquee 4.5s linear infinite reverse" }}>
              <path d="M0 0 Q 25 10 50 0 T 100 0 T 150 0 T 200 0 T 250 0 T 300 0 T 350 0 T 400 0 T 450 0 T 500 0 T 550 0 T 600 0 V 120 H 0 Z" fill="#5ce1ff" opacity=".6" transform={`translate(0, ${120 - (level / 100) * 120})`} />
            </g>
          </g>
        </svg>
      </div>
      <div className="flex items-center gap-3">
        <Icon name="chevD" size={16} stroke={3} className="text-sky" />
        <input type="range" min={0} max={100} value={level} onChange={(e) => setLevel(+e.target.value)} className="range-reset flex-1" aria-label="liquid level" />
        <span className="font-mono text-sm font-extrabold text-sky">{level}%</span>
      </div>
    </AssetCard>
  );
}

/* ═════════ TXT-06 · Magnetic letters ═════════ */
function MagneticLetters() {
  const word = "MAGNETIC";
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [off, setOff] = useState<{ x: number; y: number }[]>(word.split("").map(() => ({ x: 0, y: 0 })));
  const move = (e: React.PointerEvent) => {
    const next = word.split("").map((_, i) => {
      const el = refs.current[i];
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d < 90) { const f = (1 - d / 90) * 26; return { x: (dx / (d || 1)) * -f, y: (dy / (d || 1)) * -f }; }
      return { x: 0, y: 0 };
    });
    setOff(next);
  };
  const reset = () => setOff(word.split("").map(() => ({ x: 0, y: 0 })));
  return (
    <AssetCard id="TXT-06" title="Magnetic Letters" desc="Буквы отталкиваются от курсора (сила по расстоянию) и пружинят обратно; на телефоне работает с пальцем." tags={["text", "magnetic", "repulsion", "pointer"]}>
      <div onPointerMove={move} onPointerLeave={reset} className="grid h-36 touch-none select-none place-items-center">
        <div className="flex gap-1">
          {word.split("").map((c, i) => (
            <span key={i} ref={(el) => { refs.current[i] = el; }} className="inline-block text-5xl font-extrabold text-white sm:text-6xl"
              style={{ transform: `translate(${off[i].x}px, ${off[i].y}px) rotate(${off[i].x * 0.4}deg)`, transition: off[i].x || off[i].y ? "transform .1s" : "transform .7s cubic-bezier(.2,1.6,.4,1)" }}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="text-center text-[11px] font-bold text-ink-400">get close — letters repel</div>
    </AssetCard>
  );
}

/* ═════════ TXT-07 · Color wave sweep ═════════ */
function ColorWave() {
  const text = "Money sleeps. Discipline wakes it up.";
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setRun((r) => r + 1), 2800);
    return () => clearInterval(id);
  }, [playing]);
  const chars = text.split("");
  return (
    <AssetCard id="TXT-07" title="Color Wave Sweep" desc="Волна цвета пробегает по буквам каскадом задержек; авто-цикл с паузой-«дыханием» и ручным запуском." tags={["text", "wave", "sweep", "cascade"]}>
      <div className="grid min-h-[120px] select-none place-items-center px-2 text-center">
        <p key={run} className="text-2xl font-extrabold leading-snug sm:text-3xl">
          {chars.map((c, i) => (
            <span key={i} className="transition-colors duration-500" style={{ color: "inherit", transitionDelay: `${i * 28}ms`, animation: `caret 2.8s linear ${i * 28}ms infinite`, WebkitTextFillColor: undefined }}>
              <span className="wave-ch" style={{ animationDelay: `${i * 28}ms` }}>{c}</span>
            </span>
          ))}
        </p>
      </div>
      <style>{`.wave-ch{color:#2f4789;animation:waveSweep 2.8s linear infinite;}@keyframes waveSweep{0%,12%{color:#2f4789}22%,40%{color:#2ee59d;text-shadow:0 0 14px #2ee59d88}55%,100%{color:#2f4789}}`}</style>
      <div className="flex justify-center"><Btn v="ghost" size="sm" onClick={() => { setPlaying(!playing); if (playing) setRun((r) => r + 1); }}>{playing ? "Pause" : "Play"}</Btn></div>
    </AssetCard>
  );
}

/* ═════════ TXT-08 · Custom cursor trail ═════════ */
function CustomCursor() {
  const [on, setOn] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const [down, setDown] = useState(false);
  useEffect(() => {
    if (!on) return;
    document.body.style.cursor = "none";
    const mv = (e: PointerEvent) => { pos.current.x = e.clientX; pos.current.y = e.clientY; if (dot.current) dot.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`; };
    let raf = 0;
    const loop = () => {
      pos.current.rx += (pos.current.x - pos.current.rx) * 0.18;
      pos.current.ry += (pos.current.y - pos.current.ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${pos.current.rx - 18}px, ${pos.current.ry - 18}px) scale(${down ? 0.7 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const dn = () => setDown(true), up = () => setDown(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => { document.body.style.cursor = ""; cancelAnimationFrame(raf); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerdown", dn); window.removeEventListener("pointerup", up); };
  }, [on, down]);
  return (
    <AssetCard id="TXT-08" title="Custom Cursor + Trail" desc="Отключает системный курсор: точка следует мгновенно, кольцо — с лерпом; сжимается при нажатии. Включи и поводь мышью по каталогу." tags={["cursor", "pointer", "lerp", "ui"]}>
      <div className="grid h-40 place-items-center rounded-2xl bg-ink-950/60 text-center">
        <div>
          <div className="text-sm font-extrabold text-white">{on ? "Курсор заменён" : "Стандартный курсор"}</div>
          <div className="text-xs text-ink-400">dot — мгновенно · ring — lerp 0.18</div>
        </div>
      </div>
      <div className="mt-3 flex justify-center"><Btn v={on ? "bull" : "sky"} size="sm" onClick={() => { setOn(!on); feel("pop"); }}>{on ? "Disable" : "Enable custom cursor"}</Btn></div>
      {on && <>
        <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[99] h-2 w-2 rounded-full bg-sky shadow-[0_0_10px_#3d8bff]" />
        <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[98] h-9 w-9 rounded-full border-2 border-bull transition-transform duration-200" style={{ boxShadow: "0 0 16px #2ee59d55" }} />
      </>}
    </AssetCard>
  );
}

export default function TextFx() {
  return (
    <Section id="textfx" num="20" title="Text & Typo FX" subtitle="Печатная машинка, stagger, глитч, 3D-экструзия, жидкость, магнетизм, цветная волна, кастомный курсор">
      <TypewriterCode />
      <StaggerHeadline />
      <GlitchText />
      <Extrude3D />
      <LiquidText />
      <MagneticLetters />
      <ColorWave />
      <CustomCursor />
    </Section>
  );
}
