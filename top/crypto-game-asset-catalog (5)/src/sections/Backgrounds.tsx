import { useEffect, useRef, useState } from "react";
import { Asset, Btn3D, Section } from "../components/ui";
import { Glyph } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

/* ============ 1. AURORA ============ */
function Aurora() {
  const [speed, setSpeed] = useState(12);
  const [hue, setHue] = useState(0);
  return (
    <Asset title="Aurora Blobs" id="bg.aurora" desc="Плавающие градиентные пятна с blur и screen-blend. Скорость дрейфа и сдвиг оттенка.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#050a18] border border-white/10" style={{ filter: `hue-rotate(${hue}deg)` }}>
        <div className="absolute inset-0" style={{ animation: `aurora-drift ${speed}s ease-in-out infinite alternate" `.replace('"', "") }}>
          <div className="absolute w-[220px] h-[220px] rounded-full blur-3xl opacity-60" style={{ background: "#1fdb8b", left: "8%", top: "10%", animation: `floaty ${speed * 0.7}s ease-in-out infinite` }} />
          <div className="absolute w-[260px] h-[260px] rounded-full blur-3xl opacity-50" style={{ background: "#3d7bff", right: "4%", top: "30%", animation: `floaty ${speed}s ease-in-out .5s infinite` }} />
          <div className="absolute w-[200px] h-[200px] rounded-full blur-3xl opacity-50" style={{ background: "#8d5cff", left: "35%", bottom: "-10%", animation: `floaty ${speed * 0.85}s ease-in-out 1s infinite` }} />
        </div>
        <div className="absolute inset-0 grid place-items-center"><span className="font-extrabold text-[22px] drop-shadow-lg">Bull Season</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Drift {speed}s<input type="range" min={4} max={24} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-[#1fdb8b]" /></label>
        <label className="text-[11px] font-bold text-dim">Hue {hue}°<input type="range" min={0} max={180} value={hue} onChange={(e) => setHue(+e.target.value)} className="w-full accent-[#8d5cff]" /></label>
      </div>
    </Asset>
  );
}

/* ============ 2. GRID FLOOR ============ */
function GridFloor() {
  const [speed, setSpeed] = useState(3);
  const [tilt, setTilt] = useState(58);
  return (
    <Asset title="Retro Grid Floor" id="bg.grid" desc="Synthwave-пол: перспективная сетка едет на зрителя, солнце с полосами, скорость и наклон.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#070312] border border-white/10">
        <div className="absolute inset-x-0 top-0 h-[46%]" style={{ background: "linear-gradient(180deg,#12082e,#3a1b6e 70%,#ff4d9a 100%)" }} />
        <div className="absolute left-1/2 top-[8%] -translate-x-1/2 size-20 rounded-full" style={{ background: "linear-gradient(180deg,#ffdc7a,#ff4d9a)", boxShadow: "0 0 40px rgba(255,77,150,.6)" }}>
          <div className="absolute inset-x-0 bottom-2 space-y-1">{[2, 3, 4].map((h, i) => <div key={i} className="bg-[#12082e]" style={{ height: h, marginTop: 2 }} />)}</div>
        </div>
        <div className="absolute inset-x-[-40%] bottom-[-10%] top-[46%] overflow-hidden" style={{ transform: `perspective(300px) rotateX(${tilt}deg)`, transformOrigin: "50% 0" }}>
          <div className="absolute inset-[-60%_0_0_0]" style={{ backgroundImage: "linear-gradient(rgba(46,211,240,.5) 2px, transparent 2px), linear-gradient(90deg, rgba(46,211,240,.5) 2px, transparent 2px)", backgroundSize: "36px 36px", animation: `grid-scroll ${speed}s linear infinite` }} />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-extrabold tracking-[.3em] text-cyan">SYNTH TRADING</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Speed {speed}s<input type="range" min={1} max={8} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-[#2ed3f0]" /></label>
        <label className="text-[11px] font-bold text-dim">Tilt {tilt}°<input type="range" min={30} max={75} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="w-full accent-[#ff4d9a]" /></label>
      </div>
      <style>{`@keyframes grid-scroll { to { transform: translateY(36px); } }`}</style>
    </Asset>
  );
}

/* ============ 3. WAVES ============ */
function Waves() {
  const [speed, setSpeed] = useState(6);
  const [layers, setLayers] = useState(3);
  const wave = (y: number) => `M-100,${y} Q-50,${y - 12} 0,${y} T100,${y} T200,${y} T300,${y} T400,${y} T500,${y} V120 H-100 Z`;
  return (
    <Asset title="Ocean Waves" id="bg.waves" desc="Слоистые SVG-волны с разной скоростью и прозрачностью. Глубина регулируется числом слоёв.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a1a3f] to-[#06101f] border border-white/10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2"><Glyph name="rocket" size={40} /></div>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[120px]">
          {Array.from({ length: layers }).map((_, i) => (
            <path key={i} d={wave(40 + i * 18)} fill={["rgba(46,211,240,.35)", "rgba(61,123,255,.4)", "rgba(29,49,133,.9)", "rgba(20,35,80,.95)"][i % 4]}
              style={{ animation: `wave-x ${speed + i * 2.5}s linear infinite${i % 2 ? " reverse" : ""}` }} />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Speed {speed}s<input type="range" min={2} max={14} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-[#2ed3f0]" /></label>
        <label className="text-[11px] font-bold text-dim">Layers {layers}<input type="range" min={1} max={4} value={layers} onChange={(e) => setLayers(+e.target.value)} className="w-full accent-[#3d7bff]" /></label>
      </div>
    </Asset>
  );
}

/* ============ 4. SPOTLIGHT FOLLOW ============ */
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState(160);
  return (
    <Asset title="Spotlight Cards" id="bg.spot" desc="Прожектор следует за курсором по сетке, границы светятся рядом с ним. Размер пятна регулируется.">
      <div ref={ref} className="grid grid-cols-2 gap-2.5"
        onPointerMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}>
        {["BTC +2.4%", "ETH −1.1%", "SOL +6.8%", "DOGE +11%"].map((t) => (
          <div key={t} className="relative rounded-2xl p-[1.5px] overflow-hidden">
            <div className="absolute inset-0" style={{ background: `radial-gradient(${size}px circle at ${p.x}% ${p.y}%, rgba(106,157,255,.9), rgba(130,160,255,.08) 70%)` }} />
            <div className="relative rounded-[15px] bg-[#101c42] p-4 h-[86px]">
              <div className="absolute inset-0" style={{ background: `radial-gradient(${size * 1.3}px circle at ${p.x}% ${p.y}%, rgba(61,123,255,.18), transparent 60%)` }} />
              <div className="relative font-extrabold text-[14px]">{t}</div>
              <div className="relative text-[10.5px] text-dim font-bold">24h change</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-[11px] font-bold text-dim">Spot size</span>
        <input type="range" min={80} max={320} value={size} onChange={(e) => setSize(+e.target.value)} className="flex-1 accent-[#6a9dff]" />
      </div>
    </Asset>
  );
}

/* ============ 5. NOISE GRAIN ============ */
function Noise() {
  const [op, setOp] = useState(8);
  const [anim, setAnim] = useState(true);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 160; c.height = 120;
    let raf = 0;
    const paint = () => {
      const img = ctx.createImageData(160, 120);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      ctx.putImageData(img, 0, 0);
      if (anim) raf = requestAnimationFrame(() => setTimeout(paint, 90));
    };
    paint();
    return () => cancelAnimationFrame(raf);
  }, [anim]);
  return (
    <Asset title="Film Grain" id="bg.noise" desc="Живое зерно плёнки на canvas поверх карточки: плотность и анимация. Винтажный налёт для премиум-экранов.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1d3169] to-[#0f1b3f]">
        <div className="absolute inset-0 grid place-items-center"><div className="text-center"><Glyph name="gem" size={52} /><div className="font-extrabold text-[18px] mt-2">Premium Pass</div></div></div>
        <canvas ref={cv} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: op / 100, imageRendering: "pixelated" }} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-[11px] font-bold text-dim">Grain</span>
        <input type="range" min={0} max={30} value={op} onChange={(e) => setOp(+e.target.value)} className="flex-1 accent-[#8e9cc8]" />
        <Btn3D size="xs" variant={anim ? "cyan" : "neutral"} onClick={() => { setAnim(!anim); sfx.toggle(); }}>{anim ? "Live" : "Static"}</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 6. BEAMS ============ */
function Beams() {
  const [n, setN] = useState(5);
  const [speed, setSpeed] = useState(9);
  return (
    <Asset title="Light Beams" id="bg.beams" desc="Вращающиеся лучи прожектора из центра низа. Число лучей и скорость вращения.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#050a18] border border-white/10 grid place-items-center">
        <div className="absolute left-1/2 bottom-[-40px] size-[380px] -ml-[190px]" style={{ background: `repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,197,61,.16) 0 ${180 / n / 4}deg, transparent ${180 / n / 4}deg ${180 / n / 2}deg)`, animation: `ray ${speed}s linear infinite`, maskImage: "radial-gradient(circle, #000 10%, transparent 68%)" }} />
        <div className="absolute left-1/2 bottom-[-40px] size-[380px] -ml-[190px] opacity-60" style={{ background: `repeating-conic-gradient(from 0deg at 50% 50%, rgba(61,123,255,.14) 0 ${180 / n / 4}deg, transparent ${180 / n / 4}deg ${180 / n / 2}deg)`, animation: `ray ${speed * 1.6}s linear infinite reverse`, maskImage: "radial-gradient(circle, #000 10%, transparent 68%)" }} />
        <div className="relative text-center">
          <Glyph name="star" size={52} />
          <div className="font-extrabold text-[20px] mt-1">Jackpot Night</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Beams {n}<input type="range" min={3} max={12} value={n} onChange={(e) => setN(+e.target.value)} className="w-full accent-[#ffc53d]" /></label>
        <label className="text-[11px] font-bold text-dim">Speed {speed}s<input type="range" min={4} max={20} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-[#3d7bff]" /></label>
      </div>
    </Asset>
  );
}

/* ============ 7. DOT MATRIX ============ */
function DotMatrix() {
  const C = 18, R = 8;
  const [t, setT] = useState(0);
  const [mode, setMode] = useState<"wave" | "pulse" | "rain">("wave");
  useEffect(() => { let raf = 0; const loop = () => { setT((v) => v + 0.06); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf); }, []);
  const k = (x: number, y: number) => {
    if (mode === "wave") return (Math.sin(x * 0.5 + t) + Math.cos(y * 0.6 + t * 1.3) + 2) / 4;
    if (mode === "pulse") { const d = Math.hypot(x - C / 2, y - R / 2); return (Math.sin(d * 0.8 - t * 2.4) + 1) / 2; }
    return (Math.sin(y * 0.9 - t * 3 + Math.sin(x * 1.7) * 0.8) + 1) / 2;
  };
  return (
    <Asset title="Dot Matrix" id="bg.dots" desc="Матрица точек с тремя режимами анимации: волна, пульс из центра, дождь.">
      <div className="inset !rounded-2xl p-4 grid place-items-center">
        <div className="grid gap-[7px]" style={{ gridTemplateColumns: `repeat(${C}, 10px)` }}>
          {Array.from({ length: C * R }).map((_, i) => {
            const x = i % C, y = Math.floor(i / C);
            const v = k(x, y);
            return <span key={i} className="size-[10px] rounded-full" style={{ background: `hsl(${160 + v * 120} 90% ${28 + v * 38}%)`, transform: `scale(${0.45 + v * 0.75})`, boxShadow: v > 0.75 ? "0 0 8px rgba(46,211,240,.8)" : "none" }} />;
          })}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {(["wave", "pulse", "rain"] as const).map((m) => <Btn3D key={m} size="xs" variant={mode === m ? "cyan" : "neutral"} full onClick={() => { setMode(m); sfx.tick(); }}>{m}</Btn3D>)}
      </div>
    </Asset>
  );
}

/* ============ 8. SCANLINES + VIGNETTE ============ */
function Crt() {
  const [scan, setScan] = useState(true);
  const [vig, setVig] = useState(55);
  const [curve, setCurve] = useState(18);
  return (
    <Asset title="CRT Screen" id="bg.crt" desc="Ретро-экран терминала: сканлайны, виньетка, скругление. Живой тикер внутри.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#03130c] border-2 border-[#1c3068]" style={{ borderRadius: curve }}>
        <div className="absolute inset-0 p-4 font-mono text-[12px] leading-[1.9]" style={{ color: "#5af5b4", textShadow: "0 0 8px rgba(31,219,139,.8)" }}>
          <div>BTC/USDT <span className="float-right">67,420 ▲</span></div>
          <div>ETH/USDT <span className="float-right">3,512 ▼</span></div>
          <div>SOL/USDT <span className="float-right">172.4 ▲▲</span></div>
          <div className="opacity-60">_awaiting signal…<span style={{ animation: "caret 1s step-end infinite" }}>▊</span></div>
        </div>
        {scan && <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 4px)" }} />}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vig / 100}) 100%)` }} />
        <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-white/[.06] to-transparent pointer-events-none" style={{ animation: "scan 4s linear infinite" }} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Btn3D size="xs" variant={scan ? "bull" : "neutral"} onClick={() => setScan(!scan)}>Scanlines</Btn3D>
        <label className="text-[11px] font-bold text-dim flex-1">Vignette<input type="range" min={0} max={90} value={vig} onChange={(e) => setVig(+e.target.value)} className="w-full accent-[#1fdb8b]" /></label>
        <label className="text-[11px] font-bold text-dim flex-1">Curve<input type="range" min={4} max={40} value={curve} onChange={(e) => setCurve(+e.target.value)} className="w-full accent-[#1fdb8b]" /></label>
      </div>
    </Asset>
  );
}

export default function Backgrounds() {
  return (
    <Section id="backgrounds" index="28" title="Background FX" subtitle="8 живых фонов: аврора, ретро-сетка, волны, прожектор, зерно, лучи, матрица точек, CRT" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Aurora />
        <GridFloor />
        <Waves />
        <Spotlight />
        <Noise />
        <Beams />
        <DotMatrix />
        <Crt />
      </div>
      <span className="hidden">{cn("x")}</span>
    </Section>
  );
}
