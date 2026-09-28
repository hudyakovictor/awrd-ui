import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Section } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { useRaf } from "../ui/hooks";
import { note, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ LMS-01 · Talking lesson (typewriter + TTS) ═════════ */
const LINES = [
  "Привет! Я Пип, твой тренер по трейдингу.",
  "Сегодня научимся ставить стоп-лосс — это страховка каждой сделки.",
  "Стоп всегда ставим ДО входа, а не после. Иначе это уже не правило.",
  "Готов попробовать? Переходи к тренажёру «Drag SL/TP».",
];
function TalkingLesson() {
  const [playing, setPlaying] = useState(false);
  const [li, setLi] = useState(-1);
  const [chars, setChars] = useState(0);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1);
  rateRef.current = rate;
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => {
    if (!playing) return;
    if (li < 0) setLi(0);
  }, [playing, li]);
  useEffect(() => {
    if (!playing || li < 0) return;
    const line = LINES[li];
    setChars(0);
    const id = window.setInterval(() => {
      setChars((c) => {
        if (c >= line.length) return c;
        if (c % 4 === 0) sfx.play("tick");
        return c + 1;
      });
    }, 34 / rateRef.current);
    /* TTS for the line */
    if (supported) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(line);
      u.lang = "ru-RU";
      u.rate = rateRef.current;
      u.onend = () => window.setTimeout(() => { if (li < LINES.length - 1) setLi((v) => v + 1); else setPlaying(false); }, 350);
      window.speechSynthesis.speak(u);
    } else {
      window.setTimeout(() => { if (li < LINES.length - 1) setLi((v) => v + 1); else setPlaying(false); }, (line.length * 34) / rateRef.current + 900);
    }
    return () => clearInterval(id);
  }, [playing, li]);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  return (
    <AssetCard id="LMS-01" title="Talking Lesson · TTS" desc="Голосовой урок: текст печатается, речь Web Speech API синхронно озвучивает фразу, скорость регулируется. Фолбэк без TTS — таймер." tags={["tts", "speech", "typewriter", "lesson"]}>
      <div className="relative flex items-start gap-3">
        <div className={cn("relative shrink-0", playing && li >= 0 && "anim-flame")}><Mascot mood={playing ? "think" : "idle"} size={84} /></div>
        <div className="relative min-h-[110px] flex-1 rounded-2xl rounded-tl-md border-2 border-ink-600 bg-ink-800/70 p-3">
          {li < 0 ? (
            <div className="grid h-[84px] place-items-center text-center text-xs font-bold text-ink-400">Нажми Play — Пип расскажет про стоп-лосс</div>
          ) : (
            <div className="text-[15px] font-bold leading-relaxed text-white">{LINES[li].slice(0, chars)}<span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-bull" style={{ animation: "caret .7s step-end infinite" }} /></div>
          )}
          {playing && li >= 0 && (
            <div className="mt-3 flex items-center gap-1.5">
              {[0, 1, 2, 3].map((k) => <span key={k} className="h-3 w-1 origin-bottom rounded bg-bull" style={{ animation: `eqBar .7s ease-in-out ${k * 0.12}s infinite` }} />)}
              <span className="font-mono text-[10px] font-bold text-ink-400">{li + 1}/{LINES.length}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Btn v={playing ? "bear" : "bull"} size="sm" onClick={() => { if (playing) { setPlaying(false); if (supported) window.speechSynthesis.cancel(); } else { setLi(-1); setPlaying(true); sfx.play("pop"); } }}>{playing ? "Stop" : "Play"}</Btn>
          {supported ? <Btn v="ghost" size="sm" onClick={() => { if (li >= 0 && li < LINES.length - 1) setLi((v) => v + 1); else if (li < 0) { setLi(0); setPlaying(true); } }}>Skip</Btn> : <span className="rounded-lg bg-ink-800 px-2 py-1 text-[10px] font-bold text-ink-400">TTS off in browser</span>}
        </div>
        <div className="flex items-center gap-2"><span className="text-[10px] font-extrabold uppercase text-ink-400">rate</span>
          <input type="range" min={70} max={140} value={rate * 100} onChange={(e) => setRate(+e.target.value / 100)} className="range-reset w-20" aria-label="rate" />
          <span className="font-mono text-[10px] font-bold text-white">{rate.toFixed(1)}×</span>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ LMS-02 · Synth jingle player ═════════ */

const MELODY: [number, number][] = [[0, 440], [0.5, 523.25], [1, 659.25], [1.5, 783.99], [2, 659.25], [2.5, 523.25], [3, 880], [3.5, 783.99], [4, 659.25], [4.5, 523.25], [5, 587.33], [5.5, 659.25], [6, 523.25]];
const BEAT = 300;
function JinglePlayer() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const total = 6.8;
  const timers = useRef<number[]>([]);
  useRaf((dt) => { if (playing) { tRef.current = Math.min(total, tRef.current + dt / 1000); setT(tRef.current); if (tRef.current >= total) { setPlaying(false); tRef.current = 0; setT(0); } } }, true);
  const start = () => {
    timers.current.forEach(clearTimeout);
    tRef.current = 0; setT(0); setPlaying(true);
    MELODY.forEach(([b, f]) => timers.current.push(window.setTimeout(() => { note(f, 0.28, "triangle", 0.13); note(f * 2, 0.18, "sine", 0.04); }, b * BEAT)));
    for (let b = 0; b < MELODY.length; b += 2) timers.current.push(window.setTimeout(() => sfx.play("tick"), b * BEAT));
    sfx.play("whoosh");
  };
  const bars = 24;
  const on = playing;
  return (
    <AssetCard id="LMS-02" title="Lesson Jingle Player" desc="Мелодия урока синтезируется из массива нот: таймлайн с бегущим хедом, эквалайзер на время воспроизведения, пауза и стоп." tags={["audio", "jingle", "timeline", "player"]}>
      <div className="relative overflow-hidden rounded-2xl bg-ink-950/70 p-4">
        <div className="mb-3 flex h-16 items-end justify-center gap-1">
          {Array.from({ length: bars }).map((_, i) => (
            <span key={i} className="w-2 origin-bottom rounded-t bg-gradient-to-t from-sky to-bull" style={{ height: `${20 + ((i * 37) % 60)}%`, animation: on ? `eqBar .5s ease-in-out ${(i % 5) * 0.08}s infinite` : "none", opacity: on ? 1 : 0.35 }} />
          ))}
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-ink-800">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky to-bull" style={{ width: `${(t / total) * 100}%` }} />
          <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#fff]" style={{ left: `${(t / total) * 100}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-ink-300">{(t / BEAT * 1000 / 1000).toFixed(1)} / {total.toFixed(1)}s · 12 notes</span>
          <div className="flex gap-2">
            {playing ? <Btn v="bear" size="sm" onClick={() => { setPlaying(false); timers.current.forEach(clearTimeout); tRef.current = 0; setT(0); timers.current.forEach((id, k) => (MELODY[k] && MELODY[k][0] * BEAT > tRef.current * 1000) && clearTimeout(id)); }}>Stop</Btn> : <Btn v="bull" size="sm" onClick={start}><Icon name="play" size={14} variant="solid" />Play jingle</Btn>}
          </div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ LMS-03 · Karaoke note trainer ═════════ */
const NOTES = [{ n: "Do", f: 523.25, h: 34 }, { n: "Mi", f: 587.33, h: 46 }, { n: "Sol", f: 659.25, h: 58 }, { n: "La", f: 698.46, h: 70 }, { n: "Do′", f: 783.99, h: 84 }];
function NoteTrainer() {
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hits, setHits] = useState(0);
  const activeRef = useRef(-1);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      activeRef.current = (activeRef.current + 1) % NOTES.length;
      setActive(activeRef.current);
      note(NOTES[activeRef.current].f, 0.42 / speed, "sine", 0.14);
    }, 900 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);
  const tap = (i: number) => {
    if (i === active) { setHits((h) => h + 1); sfx.play("pop"); note(NOTES[i].f, 0.3, "triangle", 0.15); }
    else { note(NOTES[i].f * 0.98, 0.2, "sawtooth", 0.05); sfx.play("lock"); }
  };
  return (
    <AssetCard id="LMS-03" title="Karaoke Note Trainer" desc="Ноты звучат по очереди, активная колонка «подсвечивается сверху». Тапни по звучащей — попадание; мимо — диссонанс. Учит уху." tags={["audio", "karaoke", "trainer", "pitch"]}>
      <div className="flex h-40 items-end justify-center gap-3">
        {NOTES.map((n, i) => {
          const on = i === active;
          return (
            <button key={n.n} onClick={() => tap(i)} className="group relative flex h-full w-12 flex-col items-center justify-end sm:w-14">
              {on && <span className="absolute top-0 grid h-6 w-6 place-items-center rounded-full bg-gold shadow-[0_0_16px_#ffc53d]" style={{ animation: "heartbeat 1s ease-in-out infinite" }}><span className="text-xs font-extrabold text-ink-900">♪</span></span>}
              <div className={cn("w-full origin-bottom rounded-t-xl transition-all duration-150", on ? "bg-gradient-to-t from-sky to-bull" : "bg-ink-700 group-hover:bg-ink-600")} style={{ height: n.h, animation: on ? "eqBar .45s ease-in-out" : "none", boxShadow: on ? "0 0 24px #3d8bff88" : "none" }} />
              <span className={cn("mt-2 text-xs font-extrabold", on ? "text-bull" : "text-ink-400")}>{n.n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2"><Btn v={playing ? "bear" : "bull"} size="sm" onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</Btn>
          <div className="flex items-center gap-2 rounded-lg bg-ink-800 px-2"><span className="text-[10px] font-bold uppercase text-ink-400">bpm</span>
            <input type="range" min={50} max={200} value={speed * 100} onChange={(e) => setSpeed(+e.target.value / 100)} className="range-reset w-16" aria-label="tempo" />
            <span className="font-mono text-[10px] font-bold text-white">{Math.round(speed * 100)}</span>
          </div>
        </div>
        <span className="font-mono text-sm font-extrabold text-gold">hits {hits}</span>
      </div>
    </AssetCard>
  );
}

/* ═════════ LMS-04 · Synced captions ═════════ */
const CAPS = [
  { t: 0, s: "Давай разберём график по шагам." },
  { t: 3, s: "Смотри: цена трижды отбилась от этого уровня." },
  { t: 6.5, s: "Каждый раз — длинная нижняя тень. Покупатели защищают." },
  { t: 10, s: "Значит, это сильная поддержка, а не случайность." },
  { t: 13.5, s: "Стоп ставим под уровень, цель — в два раза дальше." },
  { t: 17, s: "Такой план можно назвать дисциплиной. Респект." },
];
const CAP_END = 20;
function CaptionSync() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const tRef = useRef(0);
  useRaf((dt) => { if (playing) { tRef.current = (tRef.current + dt / 1000) % CAP_END; setT(tRef.current); } }, true);
  const ci = CAPS.reduce((acc, c, i) => (t >= c.t ? i : acc), 0);
  const cap = CAPS[ci];
  const words = cap.s.split(" ");
  const local = t - cap.t;
  const wprog = clamp01(local / (CAPS[ci + 1] ? CAPS[ci + 1].t - cap.t : CAP_END - cap.t));
  const litWords = Math.floor(wprog * words.length);
  return (
    <AssetCard id="LMS-04" title="Synced Captions · Video Lesson" desc="Псевдо-видео (Ken Burns на графике) с субтитрами: слова подсвечиваются по таймлайну, главы отмечены точками на прогрессе, скраббер перематывает." tags={["video", "captions", "sync", "scrubber"]}>
      <div className="relative h-44 overflow-hidden rounded-2xl bg-ink-950">
        <div className="absolute inset-0" style={{ animation: playing ? "kenburns 24s ease-in-out infinite alternate" : "none" }}>
          <svg viewBox="0 0 300 160" className="h-full w-full">
            <path d="M0 120 L40 110 L70 116 L110 80 L150 92 L190 60 L230 74 L270 40 L300 48" fill="none" stroke="#5ce1ff" strokeWidth="3" />
            <line x1="0" x2="300" y1="120" y2="120" stroke="#2ee59d" strokeWidth="2" strokeDasharray="6 5" />
            <path d={tri2(230, 74)} fill="#2ee59d" opacity="0" />
            {[70, 190].map((x) => <circle key={x} cx={x} cy={120} r="4" fill="#2ee59d" />)}
          </svg>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 to-transparent p-3 pt-8">
          <p key={ci} className="anim-fade-up mb-2 text-center text-[13px] font-bold text-white">
            {words.map((w, i) => <span key={i} className={cn("mx-[2px] inline-block transition-all duration-150", i < litWords ? "text-gold" : "text-white/85")} style={i < litWords ? { textShadow: "0 0 10px #ffc53d88" } : undefined}>{w}</span>)}
          </p>
          <div className="relative h-1.5 cursor-pointer rounded-full bg-white/15" onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); tRef.current = ((e.clientX - r.left) / r.width) * CAP_END; setT(tRef.current); }}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-bull" style={{ width: `${(t / CAP_END) * 100}%` }} />
            {CAPS.map((c) => <span key={c.t} className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-white/60" style={{ left: `${(c.t / CAP_END) * 100}%` }} />)}
            <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(t / CAP_END) * 100}%` }} />
          </div>
        </div>
        <button onClick={() => setPlaying(!playing)} className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-ink-900/70 text-white">{playing ? <span className="flex gap-0.5"><span className="h-3 w-1 rounded bg-white" /><span className="h-3 w-1 rounded bg-white" /></span> : <Icon name="play" size={14} variant="solid" />}</button>
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">chapter {ci + 1}/{CAPS.length} · tap the progress to seek</div>
    </AssetCard>
  );
}
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function tri2(_x: number, _y: number) { return "M0 0"; }

export default function LearnMedia() {
  const g = useGame();
  void g;
  return (
    <Section id="learns" num="24" title="Lessons & Media" subtitle="Голосовой урок с TTS, джингл на таймлайне, тренажёр нот, синхронные субтитры">
      <TalkingLesson />
      <JinglePlayer />
      <NoteTrainer />
      <CaptionSync />
    </Section>
  );
}
