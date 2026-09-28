import { useEffect, useRef, useState } from "react";
import { Asset, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { clamp } from "../hooks/motion";

/* ============ 1. CURSOR STYLES ============ */
const CURSORS = [
  { id: "dot", n: "Dot + ring", d: "Точка следует мгновенно, кольцо с отставанием" },
  { id: "glow", n: "Glow orb", d: "Светящийся шар с размытием" },
  { id: "cross", n: "Crosshair", d: "Прицел для торговых графиков" },
  { id: "coin", n: "Coin follower", d: "Монета догоняет с пружиной" },
  { id: "trail", n: "Ghost trail", d: "Шлейф из затухающих копий" },
  { id: "magnet", n: "Magnetic", d: "Притягивается к кнопкам" },
];
function CursorStyles() {
  const [style, setStyle] = useState("dot");
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [ring, setRing] = useState({ x: 50, y: 50 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [down, setDown] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => { setRing((r) => ({ x: r.x + (pos.x - r.x) * 0.16, y: r.y + (pos.y - r.y) * 0.16 })); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pos]);
  const move = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x, y });
    if (style === "trail") {
      const id = Date.now() + Math.random();
      setTrail((t) => [...t.slice(-14), { x, y, id }]);
      setTimeout(() => setTrail((t) => t.filter((p) => p.id !== id)), 600);
    }
  };
  return (
    <Asset title="Cursor Styles" id="cur.styles" desc="6 кастомных курсоров в песочнице: двигайте мышь, зажимайте для эффекта нажатия." className="lg:col-span-2">
      <div className="flex flex-wrap gap-2 mb-3">
        {CURSORS.map((c) => <Btn3D key={c.id} size="xs" variant={style === c.id ? "cyan" : "neutral"} onClick={() => { setStyle(c.id); sfx.tick(); }}>{c.n}</Btn3D>)}
      </div>
      <div ref={box} onPointerMove={move} onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
        className="relative h-[220px] rounded-2xl overflow-hidden bg-[#060c20] border border-white/10 cursor-none select-none touch-none">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(140,170,255,.35) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold text-dim">{CURSORS.find((c) => c.id === style)?.d}</div>
        {style === "trail" && trail.map((p, i) => <span key={p.id} className="absolute size-3 rounded-full bg-cyan pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: (i / 14) * 0.7, transform: `scale(${0.3 + (i / 14) * 0.7}) translate(-50%,-50%)` }} />)}
        {style === "dot" && <>
          <span className="absolute size-2.5 rounded-full bg-white pointer-events-none z-10" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%,-50%) scale(${down ? 0.6 : 1})`, boxShadow: "0 0 10px rgba(255,255,255,.8)" }} />
          <span className="absolute size-9 rounded-full border-2 border-cyan pointer-events-none" style={{ left: `${ring.x}%`, top: `${ring.y}%`, transform: `translate(-50%,-50%) scale(${down ? 0.7 : 1})`, transition: "scale .2s" }} />
        </>}
        {style === "glow" && <span className="absolute size-16 rounded-full pointer-events-none" style={{ left: `${ring.x}%`, top: `${ring.y}%`, transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(46,211,240,.8), rgba(46,211,240,.15) 60%, transparent 70%)", filter: "blur(2px)" }} />}
        {style === "cross" && <>
          <span className="absolute inset-y-0 w-px bg-cyan/40 pointer-events-none" style={{ left: `${pos.x}%` }} />
          <span className="absolute inset-x-0 h-px bg-cyan/40 pointer-events-none" style={{ top: `${pos.y}%` }} />
          <span className="absolute size-8 rounded-full border-2 border-cyan pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%,-50%) scale(${down ? 1.4 : 1})` }} />
          <span className="absolute size-1.5 rounded-full bg-bear pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }} />
        </>}
        {style === "coin" && <span className="absolute pointer-events-none" style={{ left: `${ring.x}%`, top: `${ring.y}%`, transform: `translate(-50%,-50%) scale(${down ? 0.8 : 1}) rotate(${pos.x * 4}deg)` }}><Glyph name="coin" size={40} /></span>}
        {style === "magnet" && <>
          {(["Buy", "Sell"] as const).map((t, i) => {
            const bx = 30 + i * 40, by = 60;
            const d = Math.hypot(pos.x - bx, pos.y - by);
            const pull = d < 25 ? (1 - d / 25) * 14 : 0;
            const ang = Math.atan2(pos.y - by, pos.x - bx);
            return <span key={t} className="absolute px-5 h-11 rounded-2xl grid place-items-center font-extrabold text-[12px] uppercase pointer-events-none" style={{ left: `${bx}%`, top: `${by}%`, transform: `translate(calc(-50% + ${Math.cos(ang) * pull}px), calc(-50% + ${Math.sin(ang) * pull}px))`, background: i === 0 ? "linear-gradient(180deg,#5af5b4,#1fdb8b)" : "linear-gradient(180deg,#ff7c93,#ff4d6a)", color: i === 0 ? "#03261a" : "#fff", boxShadow: "0 4px 0 rgba(0,0,0,.35)" }}>{t}</span>;
          })}
          <span className="absolute size-3 rounded-full bg-white pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }} />
        </>}
        {style !== "magnet" && style !== "trail" && down && <span className="absolute size-14 rounded-full border-2 border-white/60 pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", animation: "pulse-ring .5s ease-out" }} />}
      </div>
    </Asset>
  );
}

/* ============ 2. CLICK RIPPLES ============ */
function ClickRipples() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number; c: string }[]>([]);
  const [color, setColor] = useState("#1fdb8b");
  const [n, setN] = useState(0);
  const colors = ["#1fdb8b", "#3d7bff", "#ffc53d", "#ff4d6a", "#8d5cff"];
  return (
    <Asset title="Click Ripples" id="cur.ripples" desc="Клик создаёт расходящиеся кольца в точке касания. Цвет волны на выбор.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#080f26] border border-white/10 cursor-pointer"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const id = Date.now() + Math.random();
          setRipples((p) => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id, c: color }]);
          setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 900);
          setN((x) => x + 1); sfx.tick();
        }}>
        <div className="absolute inset-0 grid place-items-center text-dim text-[12px] font-bold pointer-events-none">кликай в любом месте · {n}</div>
        {ripples.map((p) => (
          <span key={p.id}>
            <span className="absolute rounded-full border-[3px] pointer-events-none" style={{ left: p.x, top: p.y, borderColor: p.c, animation: "ripple-ring .85s cubic-bezier(.2,.7,.3,1) forwards" }} />
            <span className="absolute rounded-full pointer-events-none" style={{ left: p.x, top: p.y, width: 10, height: 10, marginLeft: -5, marginTop: -5, background: p.c, animation: "pop .3s both" }} />
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-3 justify-center">
        {colors.map((c) => <button key={c} onClick={() => { setColor(c); sfx.tick(); }} className={cn("size-8 rounded-full border-[3px] transition-transform", color === c ? "border-white scale-110" : "border-transparent")} style={{ background: c }} />)}
      </div>
      <style>{`@keyframes ripple-ring { 0% { width: 10px; height: 10px; margin: -5px; opacity: 1; } 100% { width: 190px; height: 190px; margin: -95px; opacity: 0; } }`}</style>
    </Asset>
  );
}

/* ============ 3. FOLLOWER PETS ============ */
function FollowerPets() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const pets = useRef(Array.from({ length: 5 }, () => ({ x: 50, y: 50 })));
  const [, setTick] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      let tx = pos.x, ty = pos.y;
      pets.current.forEach((p, i) => {
        const f = 0.14 - i * 0.018;
        p.x += (tx - p.x) * f; p.y += (ty - p.y) * f;
        tx = p.x; ty = p.y;
      });
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pos]);
  const glyphs = ["coin", "gem", "star", "bolt", "heart"] as const;
  return (
    <Asset title="Follower Pets" id="cur.pets" desc="Цепочка из 5 питомцев догоняет курсор змейкой: каждый следует за предыдущим со своим лагом.">
      <div ref={box} className="relative h-[200px] rounded-2xl overflow-hidden bg-[#080f26] border border-white/10 cursor-none"
        onPointerMove={(e) => { const r = box.current?.getBoundingClientRect(); if (!r) return; setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={`${pos.x},${pos.y} ${pets.current.map((p) => `${p.x},${p.y}`).join(" ")}`} fill="none" stroke="rgba(141,92,255,.35)" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        </svg>
        {pets.current.map((p, i) => (
          <span key={i} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%,-50%) scale(${1 - i * 0.13})`, opacity: 1 - i * 0.12, zIndex: 10 - i }}>
            <Glyph name={glyphs[i]} size={30} />
          </span>
        ))}
        <span className="absolute size-2.5 rounded-full bg-white pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", boxShadow: "0 0 12px #fff" }} />
      </div>
    </Asset>
  );
}

/* ============ 4. HOVER SPOTLIGHT TEXT ============ */
function SpotText() {
  const [p, setP] = useState({ x: 50, y: 50 });
  const text = "HIDDEN ALPHA";
  return (
    <Asset title="Spotlight Text" id="cur.spottext" desc="Текст виден только в круге фонарика за курсором. Размер пятна пульсирует.">
      <div className="relative h-[160px] rounded-2xl overflow-hidden bg-[#04070f] border border-white/10 cursor-none"
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }); }}>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-extrabold text-[30px] tracking-tight text-[#16275a] select-none">{text}</span>
        </div>
        <div className="absolute inset-0 grid place-items-center" style={{ maskImage: `radial-gradient(circle 74px at ${p.x}px ${p.y}px, #000 60%, transparent 100%)`, WebkitMaskImage: `radial-gradient(circle 74px at ${p.x}px ${p.y}px, #000 60%, transparent 100%)` }}>
          <span className="font-extrabold text-[30px] tracking-tight text-gold select-none" style={{ textShadow: "0 0 24px rgba(255,197,61,.7)" }}>{text}</span>
        </div>
        <span className="absolute size-[148px] rounded-full border border-gold/40 pointer-events-none" style={{ left: p.x - 74, top: p.y - 74, animation: "pulse-soft 2s ease-in-out infinite" }} />
      </div>
    </Asset>
  );
}

/* ============ 5. MAGNETIC GRID ============ */
function MagnetGrid() {
  const C = 10, R = 6;
  const [p, setP] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  return (
    <Asset title="Magnetic Dots" id="cur.magnetgrid" desc="Сетка точек тянется к курсору и пружинит обратно. Сила зависит от расстояния.">
      <div ref={box} className="inset !rounded-2xl p-5 cursor-none"
        onPointerMove={(e) => { const r = box.current?.getBoundingClientRect(); if (!r) return; setP({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); }}
        onPointerLeave={() => setP(null)}>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${C}, 1fr)` }}>
          {Array.from({ length: C * R }).map((_, i) => {
            const x = (i % C) / (C - 1), y = Math.floor(i / C) / (R - 1);
            let dx = 0, dy = 0, s = 1;
            if (p) {
              const ddx = p.x - x, ddy = (p.y - y) * 0.6;
              const d = Math.hypot(ddx, ddy);
              const f = clamp(1 - d / 0.35) * 12;
              dx = (ddx / (d || 1)) * f; dy = (ddy / (d || 1)) * f;
              s = 1 + clamp(1 - d / 0.3) * 1.2;
            }
            return <span key={i} className="size-2.5 rounded-full bg-[#3d5aa8] block transition-transform duration-150" style={{ transform: `translate(${dx}px,${dy}px) scale(${s})`, background: s > 1.3 ? "#2ed3f0" : undefined, boxShadow: s > 1.3 ? "0 0 8px #2ed3f0" : undefined }} />;
          })}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 6. CLICK COMBO POP ============ */
function ClickCombo() {
  const [pops, setPops] = useState<{ x: number; y: number; id: number; n: number }[]>([]);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const timer = useRef(0);
  return (
    <Asset title="Click Combo" id="cur.combo" desc="Быстрые клики подряд растят комбо: цифры вылетают из точки клика, рекорд сохраняется.">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#080f26] border border-white/10 cursor-pointer select-none"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const n = combo + 1;
          setCombo(n); setBest((b) => Math.max(b, n));
          const id = Date.now() + Math.random();
          setPops((p) => [...p.slice(-12), { x: e.clientX - r.left, y: e.clientY - r.top, id, n }]);
          setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
          sfx.pop();
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCombo(0), 1100);
        }}>
        <div className="absolute top-3 inset-x-0 flex justify-center gap-3 pointer-events-none">
          <span className="text-[12px] font-extrabold">COMBO <span key={combo} className="num text-[20px] text-gold anim-pop inline-block">×{combo}</span></span>
          <span className="text-[12px] font-bold text-dim">best <span className="num">{best}</span></span>
        </div>
        {pops.map((p) => (
          <span key={p.id} className="absolute num font-extrabold pointer-events-none" style={{ left: p.x, top: p.y, fontSize: 14 + Math.min(26, p.n * 2), color: p.n >= 10 ? "#ff4d6a" : p.n >= 5 ? "#ffc53d" : "#eaf0ff", animation: "rise 0.9s ease-out forwards", textShadow: "0 2px 0 rgba(0,0,0,.5)" }}>+{p.n}</span>
        ))}
        {!pops.length && !combo && <div className="absolute inset-0 grid place-items-center text-dim text-[12px] font-bold">кликай быстро!</div>}
      </div>
    </Asset>
  );
}

/* ============ 7. ANGLE LASER ============ */
function AngleLaser() {
  const [a, setA] = useState(0);
  const [targets, setTargets] = useState(() => Array.from({ length: 5 }, () => ({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 55, hit: false })));
  const [score, setScore] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const fire = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const ox = r.width / 2, oy = r.height - 20;
    const ang = Math.atan2(y - oy, x - ox);
    setA(ang);
    sfx.whoosh();
    setTargets((ts) => ts.map((t) => {
      if (t.hit) return t;
      const tx = (t.x / 100) * r.width, ty = (t.y / 100) * r.height;
      const tang = Math.atan2(ty - oy, tx - ox);
      let d = Math.abs(tang - ang);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (d < 0.09) { setScore((s) => s + 100); sfx.success(); return { ...t, hit: true }; }
      return t;
    }));
  };
  const reset = () => { setTargets(Array.from({ length: 5 }, () => ({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 55, hit: false }))); setScore(0); };
  return (
    <Asset title="Laser Aim" id="cur.laser" desc="Клик — выстрел лазером из турели в точку. Попадание по мишени +100. Угол считается от турели.">
      <div ref={box} className="relative h-[200px] rounded-2xl overflow-hidden bg-[#04070f] border border-white/10 cursor-crosshair" onPointerDown={fire}>
        {targets.map((t, i) => !t.hit && (
          <span key={i} className="absolute size-7 rounded-full border-[3px] border-bear grid place-items-center" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%,-50%)", boxShadow: "0 0 14px rgba(255,77,106,.6)", animation: "pulse-soft 1.6s ease-in-out infinite" }}>
            <span className="size-1.5 rounded-full bg-bear" />
          </span>
        ))}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="50%" y1="100%" x2={`${50 + Math.cos(a) * 80}%`} y2={`${100 + Math.sin(a) * 140}%`} stroke="#ff4d6a" strokeWidth="3" style={{ filter: "drop-shadow(0 0 8px #ff4d6a)", opacity: a === 0 ? 0 : 1 }} />
        </svg>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 size-10 rounded-full bg-gradient-to-b from-[#2a4185] to-[#16275a] border border-white/15 grid place-items-center" style={{ transform: `translateX(-50%) rotate(${a}rad)` }}>
          <div className="w-1.5 h-7 bg-bear rounded-full -mt-4" style={{ boxShadow: "0 0 10px #ff4d6a" }} />
        </div>
        <div className="absolute top-2.5 left-3 text-[12px] font-extrabold">SCORE <span className="num text-gold">{score}</span></div>
        {targets.every((t) => t.hit) && <div className="absolute inset-0 grid place-items-center bg-ink-950/60 anim-fade"><div className="text-center anim-scale"><div className="font-extrabold text-[20px] text-bull">Все мишени сбиты!</div><Btn3D size="xs" variant="bull" className="mt-2" onClick={(e) => { e.stopPropagation(); reset(); }}>Again</Btn3D></div></div>}
      </div>
    </Asset>
  );
}

/* ============ 8. HOVER TILT GRID ============ */
function HoverTiltGrid() {
  const [hov, setHov] = useState<number | null>(null);
  return (
    <Asset title="Hover Tilt Grid" id="cur.tiltgrid" desc="Сетка плиток: наведённая наклоняется к курсору, соседи приподнимаются волной.">
      <div className="grid grid-cols-4 gap-2.5" style={{ perspective: 600 }} onMouseLeave={() => setHov(null)}>
        {Array.from({ length: 12 }).map((_, i) => {
          const d = hov === null ? 99 : Math.abs(hov - i);
          return (
            <div key={i} onMouseEnter={() => setHov(i)}
              className="aspect-square rounded-2xl grid place-items-center transition-all duration-300 border"
              style={{
                background: hov === i ? "linear-gradient(160deg,#2a4185,#16275a)" : "#101c42",
                borderColor: hov === i ? "rgba(106,157,255,.6)" : "rgba(255,255,255,.05)",
                transform: hov === i ? "translateZ(40px) scale(1.06)" : d === 1 ? "translateZ(16px)" : "none",
                boxShadow: hov === i ? "0 16px 30px rgba(0,0,0,.5), 0 0 20px rgba(61,123,255,.3)" : "none",
              }}>
              <Icon name={["coin", "gem", "star", "bolt", "flame", "crown", "shield", "heart", "rocket", "chart", "gift", "trophy"][i]} size={22} className={hov === i ? "text-[#8fb3ff]" : "text-dim"} />
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

export default function CursorLab() {
  return (
    <Section id="cursor" index="30" title="Cursor & Pointer Lab" subtitle="8 песочниц курсора: стили, кольца клика, питомцы, фонарик, магнитные точки, комбо, лазер, tilt-сетка" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <CursorStyles />
        <ClickRipples />
        <FollowerPets />
        <SpotText />
        <MagnetGrid />
        <ClickCombo />
        <AngleLaser />
        <HoverTiltGrid />
      </div>
    </Section>
  );
}
