import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { S, E, TUNE, feel, sampleSpring, copyText, useTuneVersion, type Spring } from "../lib/motion";
import { IcPlay, IcCheck, IcCopy, IcRefresh, IcBolt, IcWarn } from "../ui/icons";

/* =====================================================================
   ЛАБОРАТОРИЯ+ — три инструмента, которых нет в обычных UI-китах:
   1) Анатомия кадра — покадровый разбор пружины (onion skin)
   2) Звук и хаптика — синтезатор фидбека с осциллографом
   3) Генератор каскада — волны stagger на сетке + код
   ===================================================================== */

/* ---------- общий блок кода с копированием ---------- */
function Code({ code, tone = "#3ec9a7" }: { code: string; tone?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="relative">
      <pre className="mono max-h-64 overflow-auto rounded-2xl border border-white/10 bg-[#080d18] p-4 text-[11px] leading-relaxed" style={{ color: tone }}>{code}</pre>
      <button onClick={async () => { setOk(await copyText(code)); feel("tap"); setTimeout(() => setOk(false), 1400); }}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#111a2b] px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
        {ok ? <IcCheck size={11} /> : <IcCopy size={11} />}{ok ? "ок" : "copy"}
      </button>
    </div>
  );
}

function Slider({ label, v, set, min, max, step = 1, unit = "", tone = "#3ec9a7" }: { label: string; v: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string; tone?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-wider">{label}</span>
        <span className="mono text-[10px] font-bold" style={{ color: tone }}>{v}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10" style={{ accentColor: tone }} />
    </div>
  );
}

/* =====================================================================
   1. АНАТОМИЯ КАДРА
   Пружина считается численно, каждый 6-й кадр рисуется «призраком».
   Видно то, что глаз не успевает: разгон, перелёт, число колебаний.
   ===================================================================== */
export function Anatomy() {
  useTuneVersion();
  const [st, setSt] = useState(S.pop.stiffness);
  const [dm, setDm] = useState(S.pop.damping);
  const [ms, setMs] = useState(S.pop.mass);
  const [frame, setFrame] = useState(0);
  const [play, setPlay] = useState(true);
  const spring: Spring = { type: "spring", stiffness: st, damping: dm, mass: ms };
  const { pts, overshoot, settleMs } = useMemo(() => sampleSpring(spring, 180, 1 / 60), [st, dm, ms]);
  const vel = useMemo(() => pts.map((p, i) => (i ? (p - pts[i - 1]) * 60 : 0)), [pts]);
  const maxV = Math.max(...vel.map(Math.abs), 0.001);
  const settleFrame = Math.min(pts.length - 1, Math.round(settleMs / (1000 / 60)));
  const bounces = useMemo(() => { let n = 0; for (let i = 1; i < pts.length; i++) if ((pts[i - 1] - 1) * (pts[i] - 1) < 0) n++; return n; }, [pts]);

  useEffect(() => {
    if (!play) return;
    let raf = 0, t0 = performance.now();
    const loop = (t: number) => {
      const f = Math.floor(((t - t0) / (1000 / 60)) % (settleFrame + 40));
      setFrame(Math.min(f, pts.length - 1));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [play, settleFrame, pts.length]);

  const W = 560, H = 120, X0 = 30, X1 = W - 40;
  const px = (p: number) => X0 + p * (X1 - X0);
  const ghosts = pts.filter((_, i) => i % 6 === 0 && i <= settleFrame);

  const presets: { t: string; s: [number, number, number] }[] = [
    { t: "snap", s: [760, 34, 0.55] }, { t: "pop", s: [430, 17, 0.7] }, { t: "soft", s: [210, 26, 1] },
    { t: "желе", s: [300, 6, 1] }, { t: "вязко", s: [180, 60, 1] },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">onion skin · каждый 6-й кадр</span>
          <button onClick={() => setPlay((p) => !p)} className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#06231c]">
            {play ? <span className="block h-2.5 w-2.5 rounded-[2px] bg-[#06231c]" /> : <IcPlay size={12} />}{play ? "стоп" : "играть"}
          </button>
        </div>

        {/* трек с призраками */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-[#0b1220]">
          <line x1={px(0)} y1="18" x2={px(0)} y2={H - 18} stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
          <line x1={px(1)} y1="10" x2={px(1)} y2={H - 10} stroke="#3ec9a7" strokeWidth="1.5" />
          <text x={px(1) + 5} y="20" fontSize="9" fill="#3ec9a7" fontWeight="800" fontFamily="Manrope">цель</text>
          {overshoot > 0.005 && (
            <>
              <rect x={px(1)} y="30" width={px(1 + overshoot) - px(1)} height={H - 60} fill="#f2c14e" opacity=".12" />
              <text x={px(1 + overshoot) + 4} y={H - 22} fontSize="9" fill="#f2c14e" fontWeight="800" fontFamily="Manrope">перелёт {(overshoot * 100).toFixed(0)}%</text>
            </>
          )}
          {ghosts.map((p, i) => (
            <rect key={i} x={px(p) - 11} y={H / 2 - 11} width="22" height="22" rx="6" fill="none" stroke="#5b9cd6" strokeWidth="1.4" opacity={0.12 + (i / ghosts.length) * 0.4} />
          ))}
          <rect x={px(pts[frame]) - 13} y={H / 2 - 13} width="26" height="26" rx="7" fill="#3ec9a7" style={{ filter: "drop-shadow(0 0 8px #3ec9a7)" }} />
        </svg>

        {/* кривая позиции + скорость + скраббер */}
        <svg viewBox={`0 0 ${W} 150`} className="w-full rounded-2xl bg-[#0b1220]">
          <line x1="0" y1="45" x2={W} y2="45" stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
          <line x1="0" y1="112" x2={W} y2="112" stroke="rgba(255,255,255,.06)" />
          <path d={pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W},${120 - p * 75}`).join(" ")} fill="none" stroke="#3ec9a7" strokeWidth="2" />
          <path d={vel.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W},${112 - (v / maxV) * 30}`).join(" ")} fill="none" stroke="#9d8cf5" strokeWidth="1.5" opacity=".8" />
          <line x1={(settleFrame / (pts.length - 1)) * W} y1="0" x2={(settleFrame / (pts.length - 1)) * W} y2="150" stroke="#f2c14e" strokeDasharray="4 3" />
          <text x={(settleFrame / (pts.length - 1)) * W + 4} y="12" fontSize="9" fill="#f2c14e" fontWeight="800" fontFamily="Manrope">settle {settleMs} мс</text>
          <line x1={(frame / (pts.length - 1)) * W} y1="0" x2={(frame / (pts.length - 1)) * W} y2="150" stroke="#fff" strokeWidth="1.5" />
          <text x="6" y="142" fontSize="9" fill="#9d8cf5" fontWeight="800" fontFamily="Manrope">скорость</text>
          <text x="6" y="36" fontSize="9" fill="#3ec9a7" fontWeight="800" fontFamily="Manrope">позиция</text>
        </svg>
        <input type="range" min={0} max={pts.length - 1} value={frame} onChange={(e) => { setPlay(false); setFrame(+e.target.value); }}
          className="h-1.5 w-full appearance-none rounded-full bg-white/10" style={{ accentColor: "#ffffff" }} />

        <div className="grid grid-cols-4 gap-2">
          {[
            { l: "кадр", v: `${frame}`, t: "#fff" },
            { l: "перелёт", v: `${(overshoot * 100).toFixed(0)}%`, t: overshoot > 0.35 ? "#e46a5f" : "#f2c14e" },
            { l: "колебаний", v: `${bounces}`, t: bounces > 3 ? "#e46a5f" : "#3ec9a7" },
            { l: "settle", v: `${settleMs}`, t: settleMs > 900 ? "#e46a5f" : "#5b9cd6" },
          ].map((m) => (
            <div key={m.l} className="rounded-xl border border-white/8 bg-white/[0.03] py-2 text-center">
              <div className="mono text-[15px] font-extrabold" style={{ color: m.t }}>{m.v}</div>
              <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-mist">{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button key={p.t} onClick={() => { feel("tap"); setSt(p.s[0]); setDm(p.s[1]); setMs(p.s[2]); setPlay(true); }}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-mist hover:text-white">{p.t}</button>
            ))}
          </div>
          <Slider label="stiffness" v={st} set={setSt} min={60} max={1000} step={10} />
          <Slider label="damping" v={dm} set={setDm} min={2} max={80} tone="#f2c14e" />
          <Slider label="mass" v={ms} set={setMs} min={0.2} max={3} step={0.05} tone="#9d8cf5" />
        </div>
        <div className="space-y-2 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5 text-[12px] font-bold leading-relaxed text-mist">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white">как читать</div>
          <p><b className="text-white">Призраки густо у старта</b> — объект набирает скорость. Если они равномерны, это linear и физики нет.</p>
          <p><b className="text-white">Больше 3 колебаний</b> — «желе». Для UI это баг: игрок видит дрожь, а не отклик.</p>
          <p><b className="text-white">Пик скорости</b> должен приходиться на первые 20% времени. Поздний пик = ощущение тормоза.</p>
          {bounces > 3 && <p className="flex items-center gap-1.5 text-coral"><IcWarn size={13} /> Текущая пружина дрожит — подними damping.</p>}
        </div>
        <Code code={`{ type: "spring", stiffness: ${st}, damping: ${dm}, mass: ${ms} }\n// перелёт ${(overshoot * 100).toFixed(0)}% · колебаний ${bounces} · settle ${settleMs} мс`} />
      </div>
    </div>
  );
}

/* =====================================================================
   2. ЗВУК И ХАПТИКА
   Синтез с визуализацией: каждое событие игры получает тембр,
   видимую форму волны и вибро-паттерн на таймлайне.
   ===================================================================== */
type Voice = { f0: number; f1: number; dur: number; type: OscillatorType; gain: number; delay: number };
type Preset = { id: string; t: string; d: string; tone: string; voices: Voice[]; vib: number[] };
const SOUNDS: Preset[] = [
  { id: "tap", t: "Тап", d: "Короткий треугольник вниз — «щелчок»", tone: "#3ec9a7", voices: [{ f0: 520, f1: 340, dur: 0.05, type: "triangle", gain: 0.05, delay: 0 }], vib: [8] },
  { id: "confirm", t: "Подтверждение", d: "Два тона вверх — «да»", tone: "#5b9cd6", voices: [{ f0: 520, f1: 660, dur: 0.07, type: "triangle", gain: 0.05, delay: 0 }, { f0: 780, f1: 990, dur: 0.1, type: "sine", gain: 0.045, delay: 0.06 }], vib: [8, 20, 8] },
  { id: "deny", t: "Ошибка", d: "Пила вниз, низкая частота — «нет»", tone: "#e46a5f", voices: [{ f0: 200, f1: 120, dur: 0.16, type: "sawtooth", gain: 0.04, delay: 0 }], vib: [30, 40, 30] },
  { id: "reward", t: "Награда", d: "Мажорная лесенка из 4 нот", tone: "#f2c14e", voices: [0, 0.07, 0.14, 0.23].map((d, i) => ({ f0: 520 + i * 180, f1: 900 + i * 220, dur: 0.14, type: "triangle" as OscillatorType, gain: 0.045, delay: d })), vib: [10, 30, 10, 30, 22] },
  { id: "coin", t: "Монета", d: "Два квадратных блика", tone: "#f2c14e", voices: [{ f0: 1180, f1: 1560, dur: 0.05, type: "square", gain: 0.025, delay: 0 }, { f0: 1560, f1: 1960, dur: 0.07, type: "square", gain: 0.02, delay: 0.045 }], vib: [6, 30, 6] },
  { id: "impact", t: "Импакт", d: "Низкий удар с быстрым спадом", tone: "#9d8cf5", voices: [{ f0: 140, f1: 45, dur: 0.22, type: "sine", gain: 0.09, delay: 0 }, { f0: 900, f1: 200, dur: 0.05, type: "square", gain: 0.015, delay: 0 }], vib: [45] },
];

export function SoundHaptics() {
  const [sel, setSel] = useState(SOUNDS[3]);
  const [vib, setVib] = useState<number[]>(SOUNDS[3].vib);
  const [pitch, setPitch] = useState(1);
  const [vol, setVol] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [vibT, setVibT] = useState<number | null>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<{ ac: AudioContext; an: AnalyserNode } | null>(null);

  const ensure = () => {
    if (!ctxRef.current) {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      an.connect(ac.destination);
      ctxRef.current = { ac, an };
    }
    return ctxRef.current;
  };

  const playSound = (p: Preset) => {
    if (!TUNE.sound) return;
    const { ac, an } = ensure();
    const t = ac.currentTime;
    p.voices.forEach((v) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = v.type;
      o.frequency.setValueAtTime(v.f0 * pitch, t + v.delay);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, v.f1 * pitch), t + v.delay + v.dur);
      g.gain.setValueAtTime(0.0001, t + v.delay);
      g.gain.exponentialRampToValueAtTime(v.gain * vol, t + v.delay + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + v.delay + v.dur);
      o.connect(g).connect(an);
      o.start(t + v.delay); o.stop(t + v.delay + v.dur + 0.03);
    });
    setPlaying(true);
    setTimeout(() => setPlaying(false), 700);
  };

  const playVib = () => {
    navigator.vibrate?.(vib);
    const total = vib.reduce((a, b) => a + b, 0);
    const t0 = performance.now();
    const loop = (t: number) => { const e = t - t0; setVibT(e); if (e < total + 100) requestAnimationFrame(loop); else setVibT(null); };
    requestAnimationFrame(loop);
  };

  /* осциллограф: постоянный rAF только пока идёт звук */
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const g = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    const buf = new Uint8Array(1024);
    const draw = () => {
      g.clearRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
      const an = ctxRef.current?.an;
      g.lineWidth = 2; g.strokeStyle = sel.tone; g.shadowBlur = 12; g.shadowColor = sel.tone;
      g.beginPath();
      if (an && playing) {
        an.getByteTimeDomainData(buf);
        for (let i = 0; i < buf.length; i++) { const x = (i / buf.length) * w, y = (buf[i] / 255) * h; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      } else {
        const tt = performance.now() / 700;
        for (let x = 0; x <= w; x += 4) g.lineTo(x, h / 2 + Math.sin(x / 18 + tt) * 2.5);
      }
      g.stroke(); g.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, sel]);

  const total = vib.reduce((a, b) => a + b, 0) || 1;
  const code = `// ${sel.t}: ${sel.d}
feel("${sel.id}");
// ручная сборка:
${sel.voices.map((v) => `tone(${Math.round(v.f0 * pitch)}, ${Math.round(v.f1 * pitch)}, ${v.dur}, "${v.type}", ${(v.gain * vol).toFixed(3)}, ${v.delay})`).join("\n")}
navigator.vibrate([${vib.join(", ")}]);   // вибро: пауза/импульс чередуются`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SOUNDS.map((p) => (
            <motion.button key={p.id} whileTap={{ scale: 0.95, y: 2 }} transition={S.snap}
              onClick={() => { setSel(p); setVib(p.vib); playSound(p); }}
              className="relative overflow-hidden rounded-2xl p-3 text-left"
              style={{ background: sel.id === p.id ? p.tone + "22" : "rgba(255,255,255,.03)", boxShadow: `inset 0 0 0 1px ${sel.id === p.id ? p.tone + "99" : "rgba(255,255,255,.07)"}` }}>
              <div className="text-[12px] font-extrabold" style={{ color: sel.id === p.id ? p.tone : "#e9eefb" }}>{p.t}</div>
              <div className="mt-0.5 text-[9.5px] font-bold leading-snug text-mist">{p.d}</div>
              {sel.id === p.id && playing && (
                <motion.span className="absolute inset-0 rounded-2xl" initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ background: p.tone }} />
              )}
            </motion.button>
          ))}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-mist">осциллограф</span>
            <span className="mono text-[10px] font-bold" style={{ color: sel.tone }}>{sel.voices.length} голос(а) · {Math.round(Math.max(...sel.voices.map((v) => (v.delay + v.dur) * 1000)))} мс</span>
          </div>
          <canvas ref={cv} className="h-28 w-full rounded-2xl bg-[#0b1220]" />
        </div>

        {/* голоса на таймлайне */}
        <div className="space-y-1.5">
          {sel.voices.map((v, i) => {
            const end = Math.max(...sel.voices.map((x) => x.delay + x.dur));
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="mono w-16 shrink-0 text-[9.5px] font-bold text-mist">{v.type}</span>
                <div className="relative h-5 flex-1 rounded-md bg-[#0b1220]">
                  <motion.div className="absolute inset-y-0 rounded-md" style={{ left: `${(v.delay / end) * 100}%`, width: `${(v.dur / end) * 100}%`, background: sel.tone + "88" }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...S.soft, delay: i * 0.05 }} />
                </div>
                <span className="mono w-24 shrink-0 text-right text-[9.5px] font-bold text-mist">{Math.round(v.f0 * pitch)}→{Math.round(v.f1 * pitch)} Гц</span>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label="высота" v={pitch} set={setPitch} min={0.5} max={2} step={0.05} unit="×" tone={sel.tone} />
          <Slider label="громкость" v={vol} set={setVol} min={0.2} max={2} step={0.05} unit="×" tone={sel.tone} />
        </div>
        <button onClick={() => playSound(sel)} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]"
          style={{ background: sel.tone, color: "#08121a" }}><IcPlay size={13} /> проиграть «{sel.t}»</button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">вибро-паттерн</span>
            <span className="mono text-[10px] font-bold text-mist">{total} мс</span>
          </div>
          {/* таймлайн вибрации: чётные — импульс, нечётные — пауза */}
          <div className="relative flex h-12 overflow-hidden rounded-xl bg-[#0b1220]">
            {vib.map((d, i) => (
              <div key={i} className="relative h-full border-r border-[#0b1220]" style={{ width: `${(d / total) * 100}%`, background: i % 2 === 0 ? sel.tone + "aa" : "transparent" }}>
                <span className="mono absolute bottom-0.5 left-1 text-[8px] font-bold" style={{ color: i % 2 === 0 ? "#08121a" : "#6f83a6" }}>{d}</span>
              </div>
            ))}
            {vibT !== null && <div className="absolute inset-y-0 w-[2px] bg-white" style={{ left: `${Math.min(100, (vibT / total) * 100)}%` }} />}
          </div>
          <div className="space-y-2">
            {vib.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[9.5px] font-extrabold" style={{ color: i % 2 === 0 ? sel.tone : "#8fa4c7" }}>{i % 2 === 0 ? "импульс" : "пауза"}</span>
                <input type="range" min={4} max={120} value={d} onChange={(e) => setVib((v) => v.map((x, k) => (k === i ? +e.target.value : x)))}
                  className="h-1.5 flex-1 appearance-none rounded-full bg-white/10" style={{ accentColor: i % 2 === 0 ? sel.tone : "#8fa4c7" }} />
                <span className="mono w-10 text-right text-[9.5px] font-bold text-mist">{d}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setVib((v) => (v.length < 9 ? [...v, 20, 12] : v))} className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-[10px] font-extrabold uppercase tracking-wider text-mist hover:text-white">+ импульс</button>
            <button onClick={() => setVib((v) => (v.length > 1 ? v.slice(0, -2).length ? v.slice(0, -2) : [v[0]] : v))} className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-[10px] font-extrabold uppercase tracking-wider text-mist hover:text-white">− импульс</button>
            <button onClick={playVib} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-extrabold uppercase tracking-wider" style={{ background: sel.tone, color: "#08121a" }}><IcBolt size={12} /> тест</button>
          </div>
          <p className="text-[10.5px] font-bold leading-snug text-mist">Vibration API работает на Android. На iOS и десктопе — только визуальный таймлайн.</p>
        </div>
        <Code code={code} tone={sel.tone} />
      </div>
    </div>
  );
}

/* =====================================================================
   3. ГЕНЕРАТОР КАСКАДА
   Задержка = функция позиции в сетке. Шесть паттернов, одна формула.
   ===================================================================== */
const PATTERNS: { id: string; t: string; d: string; f: (r: number, c: number, R: number, C: number) => number; code: string }[] = [
  { id: "row", t: "Построчно", d: "Чтение слева направо, сверху вниз", f: (r, c, _R, C) => r * C + c, code: "i" },
  { id: "diag", t: "Диагональ", d: "Волна из угла — самая «игровая»", f: (r, c) => r + c, code: "row + col" },
  { id: "center", t: "Из центра", d: "Взрыв — для наград и открытий", f: (r, c, R, C) => Math.hypot(r - (R - 1) / 2, c - (C - 1) / 2), code: "Math.hypot(row - cy, col - cx)" },
  { id: "tap", t: "От касания", d: "Волна из точки пальца", f: () => 0, code: "Math.hypot(row - tapRow, col - tapCol)" },
  { id: "cols", t: "Колонками", d: "Для таблиц и лидербордов", f: (r, c) => c * 0.6 + r * 0.12, code: "col * .6 + row * .12" },
  { id: "rand", t: "Случайно", d: "Органично, но теряет порядок", f: (r, c) => ((r * 7 + c * 13) % 11) / 1.6, code: "hash(row, col)" },
];

export function StaggerLab() {
  const [pat, setPat] = useState(PATTERNS[1]);
  const [step, setStep] = useState(45);
  const [run, setRun] = useState(0);
  const [tap, setTap] = useState<[number, number]>([2, 3]);
  const R = 6, C = 8;

  useEffect(() => { const t = setInterval(() => setRun((r) => r + 1), 2600); return () => clearInterval(t); }, []);

  const delayOf = (r: number, c: number) => (pat.id === "tap" ? Math.hypot(r - tap[0], c - tap[1]) : pat.f(r, c, R, C));
  const maxD = Math.max(...Array.from({ length: R * C }, (_, i) => delayOf(Math.floor(i / C), i % C)));
  const totalMs = Math.round(maxD * step + 420);

  const code = `// паттерн «${pat.t}»: задержка — функция позиции
const delay = (row, col) => (${pat.code}) * ${(step / 1000).toFixed(3)};

items.map((it, i) => {
  const row = Math.floor(i / COLS), col = i % COLS;
  return <motion.div key={it.id}
    initial={{ opacity: 0, scale: .6, y: 14 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ ...SPRING.pop, delay: delay(row, col) }} />;
});
// итоговая длительность волны ≈ ${totalMs} мс`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-4 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map((p) => (
            <button key={p.id} onClick={() => { feel("tap"); setPat(p); setRun((r) => r + 1); }} className="relative rounded-xl px-3 py-1.5 text-left">
              {pat.id === p.id && <motion.span layoutId="stgpat" transition={S.pop} className="absolute inset-0 rounded-xl bg-teal/20" style={{ boxShadow: "inset 0 0 0 1px #3ec9a799" }} />}
              <span className="relative block text-[10.5px] font-extrabold" style={{ color: pat.id === p.id ? "#3ec9a7" : "#cfe0f7" }}>{p.t}</span>
            </button>
          ))}
        </div>
        <div className="text-[11.5px] font-bold text-mist">{pat.d}{pat.id === "tap" && " — кликни по любой ячейке."}</div>

        <div className="grid gap-2 rounded-2xl bg-[#0b1220] p-4" style={{ gridTemplateColumns: `repeat(${C}, minmax(0, 1fr))` }}>
          {Array.from({ length: R * C }).map((_, i) => {
            const r = Math.floor(i / C), c = i % C;
            const d = delayOf(r, c);
            const k = d / (maxD || 1);
            return (
              <motion.button key={`${run}-${pat.id}-${i}`}
                onClick={() => { if (pat.id === "tap") { setTap([r, c]); setRun((x) => x + 1); feel("tap"); } }}
                initial={{ opacity: 0, scale: 0.4, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ ...S.pop, delay: (d * step) / 1000 }}
                className="aspect-square rounded-lg"
                style={{ background: `hsl(${165 - k * 120} 60% ${52 - k * 8}%)`, boxShadow: pat.id === "tap" && r === tap[0] && c === tap[1] ? "0 0 0 2px #fff" : "none" }} />
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Slider label="шаг каскада" v={step} set={setStep} min={10} max={120} unit=" мс" />
          <button onClick={() => { feel("confirm"); setRun((r) => r + 1); }} className="flex items-center justify-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-[#06231c]"><IcRefresh size={12} /> повтор</button>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
          <span className="text-[10.5px] font-extrabold text-mist">длительность всей волны</span>
          <span className="mono text-[13px] font-extrabold" style={{ color: totalMs > 1200 ? "#e46a5f" : totalMs > 800 ? "#f2c14e" : "#3ec9a7" }}>{totalMs} мс</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5 text-[12px] font-bold leading-relaxed text-mist">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white">правила каскада</div>
          <p><b className="text-white">Потолок — 800 мс на всю волну.</b> Длиннее — пользователь начинает ждать, а не смотреть.</p>
          <p><b className="text-white">Шаг зависит от количества.</b> 5 элементов — 70 мс, 50 элементов — 12 мс. Держи итог, а не шаг.</p>
          <p><b className="text-white">Диагональ читается лучше построчного.</b> Волна движется в двух осях сразу — глаз ловит направление.</p>
          <p><b className="text-white">Из центра — только для событий.</b> Для обычной загрузки списка это слишком громко.</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: E.out }}>
            <Code code={code} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
