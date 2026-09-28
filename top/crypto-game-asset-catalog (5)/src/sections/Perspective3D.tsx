import { useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { clamp } from "../hooks/motion";

function useTilt(max = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false });
  return {
    ref,
    t,
    onMove: (e: React.PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      setT({ rx: (0.5 - py) * 2 * max, ry: (px - 0.5) * 2 * max, gx: px * 100, gy: py * 100, hover: true });
    },
    onLeave: () => setT({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false }),
  };
}

/* ============ 1. TILT TRADING CARD ============ */
function TiltCard() {
  const { ref, t, onMove, onLeave } = useTilt(16);
  const [shine, setShine] = useState(true);
  return (
    <Asset title="Tilt Trading Card" id="p3d.tilt" desc="Карта следует за курсором в 3D, блик ездит по поверхности, тень смещается против наклона.">
      <div className="grid place-items-center py-2" style={{ perspective: 900 }}>
        <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}
          className="relative w-[220px] h-[300px] rounded-[24px] transition-transform duration-150 will-change-transform"
          style={{ transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.hover ? 1.03 : 1})`, transformStyle: "preserve-3d", background: "linear-gradient(165deg,#2a4185,#0f1b3f)", boxShadow: `${-t.ry * 1.4}px ${20 + t.rx}px 40px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.2)` }}>
          <div className="absolute inset-0 rounded-[24px] overflow-hidden">
            <div className="absolute -right-12 -top-12 size-44 rounded-full bg-violet/40 blur-2xl" />
            <div className="absolute -left-10 -bottom-14 size-44 rounded-full bg-bull/30 blur-2xl" />
          </div>
          <div className="absolute top-4 inset-x-4 flex justify-between items-center" style={{ transform: "translateZ(40px)" }}>
            <Badge tone="gold" size="xs">Legendary</Badge><span className="num text-[10px] text-dim font-extrabold">#042</span>
          </div>
          <div className="absolute inset-x-0 top-16 grid place-items-center" style={{ transform: "translateZ(70px)" }}><Glyph name="crown" size={96} /></div>
          <div className="absolute bottom-4 inset-x-4" style={{ transform: "translateZ(45px)" }}>
            <div className="font-extrabold text-[19px]">Whale King</div>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {[["ATK", "92"], ["DEF", "77"], ["LCK", "88"]].map(([k, v]) => <div key={k} className="rounded-lg bg-black/30 py-1 text-center"><div className="num text-[12px] font-extrabold">{v}</div><div className="text-[8px] font-extrabold text-white/50">{k}</div></div>)}
            </div>
          </div>
          {shine && <div className="absolute inset-0 rounded-[24px] pointer-events-none" style={{ background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,.3), transparent 50%)`, transform: "translateZ(90px)" }} />}
          <div className="absolute inset-0 rounded-[24px] pointer-events-none border border-white/15" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Btn3D size="xs" variant={shine ? "cyan" : "neutral"} onClick={() => setShine(!shine)}>Glare {shine ? "on" : "off"}</Btn3D>
        <span className="num text-[10.5px] text-dim font-bold">rx {t.rx.toFixed(1)}° · ry {t.ry.toFixed(1)}°</span>
      </div>
    </Asset>
  );
}

/* ============ 2. FLIP BOOK ============ */
function FlipBook() {
  const pages = [
    { t: "Что такое свеча?", d: "Тело + фитили: open, high, low, close за период.", g: "flame" as const },
    { t: "Бычье поглощение", d: "Зелёное тело накрывает красное — разворот вверх.", g: "rocket" as const },
    { t: "Доджи", d: "Нерешительность: open ≈ close, длинные тени.", g: "star" as const },
    { t: "Молот", d: "Длинный нижний фитиль после падения — бычий знак.", g: "gem" as const },
  ];
  const [p, setP] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => { const k = clamp(n, 0, pages.length - 1); if (k !== p) { setDir(k > p ? 1 : -1); setP(k); sfx.whoosh(); } };
  return (
    <Asset title="Flip Book" id="p3d.flip" desc="Учебник с перелистыванием: страница вращается вокруг корешка с тенью изгиба.">
      <div className="relative h-[260px] rounded-2xl bg-[#0c1737] border border-white/10 overflow-hidden" style={{ perspective: 1200 }}>
        <div className="absolute left-1/2 inset-y-0 w-[3px] -ml-[1.5px] bg-black/50 z-10" />
        <div className="absolute inset-y-4 left-4 right-[52%] rounded-xl bg-[#13224e] p-4 border border-white/5">
          <div className="label-caps">Глава {p + 1}</div>
          <div className="font-extrabold text-[15px] leading-snug">{pages[Math.max(0, p - 0)]?.t}</div>
        </div>
        <div key={p} className="absolute inset-y-4 right-4 left-[52%] rounded-xl p-4 overflow-hidden origin-left"
          style={{ background: "linear-gradient(100deg,#1d3169,#16275a)", boxShadow: "-14px 0 24px rgba(0,0,0,.4)", animation: dir > 0 ? "flip-in .55s cubic-bezier(.3,1.2,.4,1) both" : "flip-in-r .55s cubic-bezier(.3,1.2,.4,1) both" }}>
          <Glyph name={pages[p].g} size={40} />
          <div className="font-extrabold text-[16px] mt-3 leading-tight">{pages[p].t}</div>
          <div className="text-[12px] text-mute mt-1.5 leading-snug">{pages[p].d}</div>
          <div className="absolute bottom-3 right-4 num text-[11px] text-dim font-bold">{p + 1} / {pages.length}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Btn3D size="xs" variant="neutral" disabled={p === 0} onClick={() => go(p - 1)}><Icon name="chevL" size={14} stroke={3} /></Btn3D>
        <div className="flex gap-1.5">{pages.map((_, i) => <button key={i} onClick={() => go(i)} className={cn("h-2 rounded-full transition-all", i === p ? "w-6 bg-blue" : "w-2 bg-[#22366f]")} />)}</div>
        <Btn3D size="xs" variant="neutral" disabled={p === pages.length - 1} onClick={() => go(p + 1)}><Icon name="chevR" size={14} stroke={3} /></Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 3. CUBE SHOWCASE ============ */
function CubeShow() {
  const [f, setF] = useState(0);
  const faces = [
    { t: "Spot", g: "coin" as const, c: "#1fdb8b", d: "Покупка актива напрямую" },
    { t: "Futures", g: "bolt" as const, c: "#ffc53d", d: "Контракты с плечом" },
    { t: "Options", g: "shield" as const, c: "#8d5cff", d: "Право, не обязанность" },
    { t: "Earn", g: "gem" as const, c: "#2ed3f0", d: "Стейкинг и доход" },
  ];
  return (
    <Asset title="Market Cube" id="p3d.cube" desc="Куб рынков: грани переключаются кнопками и свайпом, вращение с пружиной.">
      <div className="h-[220px] grid place-items-center select-none" style={{ perspective: 800 }}
        onPointerDown={(e) => { const sx = e.clientX; const up = (ev: PointerEvent) => { const dx = ev.clientX - sx; if (dx < -40) setF((x) => x + 1); if (dx > 40) setF((x) => x - 1); removeEventListener("pointerup", up); }; addEventListener("pointerup", up); }}>
        <div className="relative size-[160px]" style={{ transformStyle: "preserve-3d", transform: `translateZ(-80px) rotateY(${-f * 90}deg)`, transition: "transform .8s cubic-bezier(.3,1.25,.4,1)" }}>
          {faces.map((x, k) => (
            <div key={x.t} className="absolute inset-0 rounded-3xl p-4 flex flex-col border border-white/15"
              style={{ transform: `rotateY(${k * 90}deg) translateZ(80px)`, background: `linear-gradient(160deg, ${x.c}, #0f1b3f 88%)`, backfaceVisibility: "hidden" }}>
              <Glyph name={x.g} size={38} />
              <div className="font-extrabold text-[19px] mt-auto">{x.t}</div>
              <div className="text-[10.5px] font-semibold text-white/75">{x.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Btn3D size="xs" variant="neutral" onClick={() => { setF(f - 1); sfx.whoosh(); }}>←</Btn3D>
        {faces.map((x, k) => <button key={x.t} onClick={() => { setF(k); sfx.tick(); }} className={cn("h-2 rounded-full transition-all", ((f % 4) + 4) % 4 === k ? "w-6" : "w-2 bg-[#22366f]")} style={((f % 4) + 4) % 4 === k ? { background: x.c } : undefined} />)}
        <Btn3D size="xs" variant="neutral" onClick={() => { setF(f + 1); sfx.whoosh(); }}>→</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 4. COVERFLOW DRUM ============ */
function Drum() {
  const N = 10;
  const [rot, setRot] = useState(0);
  const step = 360 / N;
  const R = 170;
  return (
    <Asset title="Prize Drum" id="p3d.drum" desc="Барабан призов в 3D: вращение колесом мыши, drag и кнопками. Передняя ячейка подсвечена.">
      <div className="h-[230px] grid place-items-center overflow-hidden rounded-2xl bg-[#080f26] border border-white/5 select-none"
        onWheel={(e) => setRot((r) => r + (e.deltaY > 0 ? step : -step))}
        onPointerDown={(e) => { const sy = e.clientY; let last = sy; const mv = (ev: PointerEvent) => { setRot((r) => r + (ev.clientY - last) * 0.6); last = ev.clientY; }; const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); setRot((r) => Math.round(r / step) * step); sfx.tick(); }; addEventListener("pointermove", mv); addEventListener("pointerup", up); }}>
        <div className="relative" style={{ transformStyle: "preserve-3d", transform: `rotateX(${-rot}deg)`, transition: "transform .12s linear", transformOrigin: "50% 50% -170px" }}>
          {Array.from({ length: N }).map((_, i) => {
            const front = Math.abs((((Math.round(rot / step) % N) + N) % N) - i) % N;
            const isFront = front === 0;
            return (
              <div key={i} className="absolute left-1/2 top-1/2 -ml-[70px] -mt-[26px] w-[140px] h-[52px] rounded-xl grid place-items-center font-extrabold text-[13px] border"
                style={{ transform: `rotateX(${i * step}deg) translateZ(${R}px)`, backfaceVisibility: "hidden", background: isFront ? "linear-gradient(180deg,#ffdc7a,#f0a811)" : "#16275a", color: isFront ? "#3a2400" : "#8e9cc8", borderColor: isFront ? "#ffe9a3" : "rgba(255,255,255,.06)", boxShadow: isFront ? "0 0 30px rgba(255,197,61,.5)" : "none" }}>
                {isFront ? `★ ${[50, 100, 25, 200, 75, 150, 30, 300, 60, 120][i]} XP` : `${[50, 100, 25, 200, 75, 150, 30, 300, 60, 120][i]} XP`}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        <Btn3D size="xs" variant="neutral" onClick={() => setRot((r) => r - step)}>Up</Btn3D>
        <Btn3D size="xs" variant="gold" onClick={() => { setRot((r) => r + step * (8 + ((Math.random() * 6) | 0))); sfx.whoosh(); setTimeout(() => sfx.success(), 900); }}>Spin</Btn3D>
        <Btn3D size="xs" variant="neutral" onClick={() => setRot((r) => r + step)}>Down</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. FAN DECK ============ */
function FanDeck() {
  const [spread, setSpread] = useState(1);
  const [sel, setSel] = useState<number | null>(null);
  const cards = [
    { t: "BTC Long", c: "#f7931a" }, { t: "ETH Long", c: "#8c8cff" }, { t: "SOL Short", c: "#14f195" }, { t: "DOGE Long", c: "#c2a633" }, { t: "AVAX Short", c: "#ff4d6a" },
  ];
  return (
    <Asset title="Fan Deck" id="p3d.fan" desc="Веер позиций: раскрытие ползунком, hover поднимает карту, клик выбирает и показывает детали.">
      <div className="relative h-[210px]" style={{ perspective: 700 }}>
        {cards.map((c, i) => {
          const mid = (cards.length - 1) / 2;
          const off = i - mid;
          const on = sel === i;
          return (
            <button key={c.t} onClick={() => { setSel(on ? null : i); sfx.pop(); }}
              className="absolute left-1/2 bottom-2 w-[130px] h-[170px] -ml-[65px] rounded-2xl p-3 text-left origin-bottom transition-all duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]"
              style={{ transform: `rotate(${off * 14 * spread}deg) translateY(${Math.abs(off) * -6 * spread + (on ? -26 : 0)}px) ${on ? "scale(1.08)" : ""}`, zIndex: on ? 20 : 10 - Math.abs(off), background: `linear-gradient(165deg, ${c.c}, #0f1b3f 85%)`, boxShadow: on ? `0 0 30px ${c.c}` : "0 8px 0 #081028" }}>
              <div className="font-extrabold text-[13px]">{c.t}</div>
              <div className="num text-[11px] text-white/70 font-bold mt-1">{on ? "+$812.40" : i % 2 ? "+2.4%" : "−1.1%"}</div>
              {on && <div className="absolute bottom-2 inset-x-2 h-8 rounded-lg bg-black/30 grid place-items-center text-[10px] font-extrabold anim-fade">CLOSE POSITION</div>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-[11px] font-bold text-dim">Fan</span>
        <input type="range" min={0} max={130} value={spread * 100} onChange={(e) => setSpread(+e.target.value / 100)} className="flex-1 accent-[#8d5cff]" />
      </div>
    </Asset>
  );
}

/* ============ 6. LAYER STACK PARALLAX ============ */
function LayerStack() {
  const { ref, t, onMove, onLeave } = useTilt(10);
  return (
    <Asset title="Layer Stack" id="p3d.layers" desc="Слои интерфейса на разной глубине translateZ: двигайте курсор — карта расслаивается.">
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="h-[240px] grid place-items-center" style={{ perspective: 900 }}>
        <div className="relative w-[230px] h-[190px]" style={{ transformStyle: "preserve-3d", transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`, transition: "transform .15s" }}>
          {[0, 1, 2, 3].map((l) => (
            <div key={l} className="absolute inset-0 rounded-2xl border" style={{ transform: `translateZ(${l * 26}px)`, background: `rgba(${20 + l * 12},${30 + l * 10},${70 + l * 8},.92)`, borderColor: "rgba(255,255,255,.1)", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
              {l === 3 && <div className="p-4"><div className="flex items-center gap-2"><Glyph name="rocket" size={26} /><span className="font-extrabold text-[15px]">Portfolio</span></div><div className="num text-[24px] font-extrabold text-bull mt-2">$24,817</div><div className="flex gap-1 mt-3">{[40, 70, 45, 90, 60, 100].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue to-cyan" style={{ height: 8 + h * 0.3 }} />)}</div></div>}
              {l < 3 && <div className="p-4 space-y-2 opacity-40">{[80, 60, 70].map((w, i) => <div key={i} className="h-2.5 rounded bg-[#2a4185]" style={{ width: `${w}%` }} />)}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center text-[11px] text-dim font-bold">4 слоя · depth 26px · курсор = rotate</div>
    </Asset>
  );
}

/* ============ 7. DOOR REVEAL ============ */
function DoorReveal() {
  const [open, setOpen] = useState(false);
  return (
    <Asset title="Vault Doors" id="p3d.doors" desc="Сейф наград: две створки открываются в 3D с бликом и показывают джекпот.">
      <div className="relative h-[220px] rounded-2xl overflow-hidden bg-[#050a18] border border-white/10" style={{ perspective: 900 }}>
        <div className="absolute inset-0 grid place-items-center" style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,197,61,.25), transparent 65%)" }}>
          <div className="text-center" style={{ opacity: open ? 1 : 0, transform: open ? "scale(1)" : "scale(.7)", transition: "all .6s .25s" }}>
            <div className="anim-float"><Glyph name="chest" size={72} /></div>
            <div className="font-extrabold text-[22px] text-gold mt-1">+5,000 💎</div>
          </div>
        </div>
        {(["left", "right"] as const).map((side) => (
          <div key={side} className="absolute inset-y-0 w-1/2 transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ [side]: 0, transformOrigin: side === "left" ? "left center" : "right center", transform: open ? `rotateY(${side === "left" ? -105 : 105}deg)` : "none", background: "repeating-linear-gradient(90deg,#1c3068 0 14px,#16275a 14px 28px)", boxShadow: side === "left" ? "8px 0 20px rgba(0,0,0,.5)" : "-8px 0 20px rgba(0,0,0,.5)" }}>
            <div className="absolute top-1/2 -translate-y-1/2 size-10 rounded-full bg-gradient-to-b from-[#ffdc7a] to-[#b8780a] shadow-[0_3px_0_#6e4500]" style={{ [side === "left" ? "right" : "left"]: 10 }} />
          </div>
        ))}
      </div>
      <Btn3D size="sm" variant={open ? "neutral" : "gold"} full className="mt-3" onClick={() => { setOpen(!open); open ? sfx.tap() : sfx.levelUp(); }}>{open ? "Close vault" : "Open vault"}</Btn3D>
    </Asset>
  );
}

/* ============ 8. FLOATING ISLANDS ============ */
function Islands() {
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const isl = [
    { g: "gem" as const, x: 12, y: 30, s: 1, ph: 0, c: "#3d7bff" },
    { g: "rocket" as const, x: 60, y: 12, s: 1.25, ph: 2, c: "#8d5cff" },
    { g: "crown" as const, x: 38, y: 58, s: 0.9, ph: 4, c: "#ffc53d" },
  ];
  return (
    <Asset title="Floating Islands" id="p3d.float" desc="Парящие острова наград с разной фазой и скоростью. Пауза замораживает время.">
      <div className="relative h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0c1a46] to-[#070d1f] border border-white/10"
        onPointerMove={() => !paused && setT((v) => v + 0.02 * speed)}>
        {Array.from({ length: 24 }).map((_, i) => <span key={i} className="absolute size-[3px] rounded-full bg-white/40" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animation: `twinkle 2s ${(i % 5) * 0.3}s infinite` }} />)}
        {isl.map((x, i) => (
          <button key={i} onClick={(e) => { sfx.coin(); const r = e.currentTarget.getBoundingClientRect(); import("../utils/fx").then((m) => m.burstCoins(r.left + r.width / 2, r.top, 8)); }}
            className="absolute transition-transform hover:scale-110" style={{ left: `${x.x}%`, top: `${x.y}%`, transform: `translateY(${Math.sin(t + x.ph) * 10}px) scale(${x.s})` }}>
            <span className="block rounded-2xl p-3" style={{ background: "linear-gradient(180deg,#1d3169,#0f1b3f)", boxShadow: `0 10px 0 #081028, 0 0 30px ${x.c}55`, border: `1px solid ${x.c}66` }}>
              <Glyph name={x.g} size={40} />
            </span>
            <span className="block mx-auto mt-2 h-1.5 w-16 rounded-full bg-black/50 blur-[2px]" style={{ transform: `scaleX(${1 - Math.sin(t + x.ph) * 0.08})` }} />
          </button>
        ))}
        <div className="absolute bottom-2 left-3 text-[10px] font-bold text-dim">t = {t.toFixed(1)}s · двигайте курсор</div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <input type="range" min={10} max={300} value={speed * 100} onChange={(e) => setSpeed(+e.target.value / 100)} className="flex-1 accent-[#8d5cff]" />
        <Btn3D size="xs" variant={paused ? "bull" : "neutral"} onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Btn3D>
      </div>
    </Asset>
  );
}

export default function Perspective3D() {
  return (
    <Section id="p3d" index="25" title="3D & Perspective" subtitle="8 объёмных сцен: tilt-карта, книга, куб, барабан, веер, слои, сейф, острова" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <TiltCard />
        <FlipBook />
        <CubeShow />
        <Drum />
        <FanDeck />
        <LayerStack />
        <DoorReveal />
        <Islands />
      </div>
    </Section>
  );
}
