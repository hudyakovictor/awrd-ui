import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump, useInterval } from "../ui/kit";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ MIC-01 · Magnetic buttons ═════════ */

function Magnet({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const [o, setO] = useState({ x: 0, y: 0, a: false });
  return (
    <div className="grid place-items-center p-4"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, a: true }); }}
      onPointerLeave={() => setO({ x: 0, y: 0, a: false })}>
      <div style={{ transform: `translate(${o.x}px, ${o.y}px)`, transition: o.a ? "transform .12s ease-out" : "transform .6s cubic-bezier(.3,1.8,.5,1)" }}>
        <div style={{ transform: `translate(${o.x * 0.35}px, ${o.y * 0.35}px)`, transition: o.a ? "transform .12s" : "transform .7s cubic-bezier(.3,1.8,.5,1)" }}>{children}</div>
      </div>
    </div>
  );
}
function Magnetic() {
  return (
    <AssetCard id="MIC-01" title="Magnetic Buttons" desc="Кнопки притягиваются к курсору с двумя слоями смещения (кнопка и контент) и пружинят обратно при уходе." tags={["magnetic", "hover", "cursor", "spring"]}>
      <div className="grid grid-cols-2 gap-2">
        <Magnet><Btn v="bull" size="lg">Start</Btn></Magnet>
        <Magnet><Btn v="violet" size="lg"><Icon name="gem" size={18} />Pro</Btn></Magnet>
        <Magnet strength={0.6}><Btn v="gold" size="iconLg" className="rounded-full!"><Icon name="play" size={22} variant="solid" /></Btn></Magnet>
        <Magnet strength={0.6}><Btn v="ghost" size="iconLg" className="rounded-full!"><Icon name="heart" size={22} /></Btn></Magnet>
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-02 · Ripple & jelly ═════════ */
function RippleBtn({ children, color, className }: { children: ReactNode; color: string; className?: string }) {
  const [rs, setRs] = useState<{ id: number; x: number; y: number; s: number }[]>([]);
  const add = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRs((x) => [...x, { id, x: e.clientX - r.left, y: e.clientY - r.top, s: Math.max(r.width, r.height) * 2.4 }]);
    window.setTimeout(() => setRs((x) => x.filter((q) => q.id !== id)), 650);
    feel("tap", 6);
  };
  return (
    <button onClick={add} className={cn("relative overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_5px_0_rgba(0,0,0,.35)] transition-transform active:translate-y-1 active:scale-[.97]", className)} style={{ background: color }}>
      {rs.map((r) => <span key={r.id} className="pointer-events-none absolute rounded-full bg-white" style={{ left: r.x, top: r.y, width: r.s, height: r.s, animation: "ripple .65s ease-out forwards" }} />)}
      <span className="relative">{children}</span>
    </button>
  );
}
function RippleJelly() {
  const [j, bump] = useBump();
  const [sq, setSq] = useState(false);
  return (
    <AssetCard id="MIC-02" title="Ripple · Jelly · Squish" desc="Три типа отклика на нажатие: волна из точки касания, желейная деформация и сжатие при удержании." tags={["ripple", "jelly", "press", "feedback"]}>
      <div className="grid grid-cols-2 gap-3">
        <RippleBtn color="linear-gradient(180deg,#3d8bff,#1e56c9)">Ripple</RippleBtn>
        <RippleBtn color="linear-gradient(180deg,#ff4d6a,#c21f43)">Ripple</RippleBtn>
      </div>
      <div className="mt-5 flex items-center justify-around">
        <button key={j} onClick={() => { bump(); feel("pop", 10); }} className={cn("grid h-20 w-20 place-items-center rounded-[26px] bg-gradient-to-b from-bull to-bull-edge shadow-[0_6px_0_#0b7a4d]", j && "anim-jelly")}>
          <Icon name="star" size={34} variant="solid" className="text-white" />
        </button>
        <button onPointerDown={() => { setSq(true); feel("tap", 10); }} onPointerUp={() => { setSq(false); sfx.play("pop"); }} onPointerLeave={() => setSq(false)}
          className="grid h-20 w-20 touch-none place-items-center rounded-full bg-gradient-to-b from-gold to-gold-edge shadow-[0_6px_0_#8a5c00] transition-transform duration-200 ease-[cubic-bezier(.3,1.8,.5,1)]"
          style={{ transform: sq ? "scale(.82, .72) translateY(6px)" : "scale(1)" }}>
          <Icon name="coin" size={34} className="text-ink-900" />
        </button>
      </div>
      <div className="mt-3 flex justify-around text-[10px] font-extrabold uppercase tracking-widest text-ink-400"><span>Jelly</span><span>Hold-squish</span></div>
    </AssetCard>
  );
}

/* ═════════ MIC-03 · Spotlight border grid ═════════ */
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const items = [["bolt", "Fast", "#ffc53d"], ["shield", "Safe", "#2ee59d"], ["chart", "Smart", "#3d8bff"], ["gem", "Pro", "#a174ff"], ["trophy", "Win", "#ff8a3d"], ["heart", "Fun", "#ff4d6a"]];
  return (
    <AssetCard id="MIC-03" title="Spotlight Border Grid" desc="Общий прожектор для сетки: подсветка рамки и фона каждой плитки следует за курсором даже между плитками." tags={["spotlight", "glow", "hover", "cursor"]}>
      <div ref={ref} className="grid grid-cols-3 gap-2"
        onPointerMove={(e) => { ref.current?.querySelectorAll<HTMLElement>("[data-spot]").forEach((el) => { const r = el.getBoundingClientRect(); el.style.setProperty("--x", `${e.clientX - r.left}px`); el.style.setProperty("--y", `${e.clientY - r.top}px`); }); }}>
        {items.map(([i, t, c]) => (
          <div key={t} data-spot className="group relative rounded-2xl p-[1.5px]" style={{ background: `radial-gradient(160px circle at var(--x,-100px) var(--y,-100px), ${c}, transparent 60%), #16264f` }}>
            <div className="relative flex h-24 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[15px] bg-ink-800">
              <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(120px circle at var(--x,-100px) var(--y,-100px), ${c}33, transparent 70%)` }} />
              <Icon name={i} size={26} variant="duo" style={{ color: c }} className="relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
              <span className="relative text-xs font-extrabold text-white">{t}</span>
            </div>
          </div>
        ))}
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-04 · Odometer ═════════ */
function Digit({ d }: { d: string }) {
  if (!/\d/.test(d)) return <span className="inline-block">{d}</span>;
  const n = +d;
  return (
    <span className="relative inline-block h-[1em] w-[.62em] overflow-hidden align-top leading-none">
      <span className="absolute left-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ transform: `translateY(${-n}em)` }}>
        {Array.from({ length: 10 }, (_, k) => <span key={k} className="h-[1em] leading-none">{k}</span>)}
      </span>
    </span>
  );
}
function Odometer() {
  const [p, setP] = useState(64250.42);
  const [dir, setDir] = useState(1);
  useInterval(() => { const d = (Math.random() - 0.45) * 180; setDir(d >= 0 ? 1 : -1); setP((x) => x + d); }, 1600);
  const s = p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <AssetCard id="MIC-04" title="Rolling Odometer" desc="Цифры цены прокручиваются барабанами индивидуально, с перелётом. Цвет и стрелка реагируют на направление." tags={["odometer", "number", "ticker", "animation"]}>
      <div className="text-center">
        <Label>BTC · live</Label>
        <div className={cn("font-mono text-5xl font-extrabold tabular-nums transition-colors duration-500", dir > 0 ? "text-bull text-glow-bull" : "text-bear")} style={{ lineHeight: 1 }}>
          $<span>{s.split("").map((c, i) => <Digit key={`${i}-${s.length}`} d={c} />)}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 font-mono text-sm font-extrabold">
          <Icon key={dir} name={dir > 0 ? "up" : "down"} size={16} stroke={3} className={cn("anim-pop", dir > 0 ? "text-bull" : "text-bear")} />
          <span className={dir > 0 ? "text-bull" : "text-bear"}>{dir > 0 ? "Buyers in control" : "Sellers pushing"}</span>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-05 · Text scramble ═════════ */
const PHRASES = ["BUY THE DIP", "STAY HUMBLE", "STACK SATS", "RISK FIRST", "TRUST CHARTS"];
const CH = "!<>-_\\/[]{}—=+*^?#$%&0123456789";
function Scramble() {
  const [txt, setTxt] = useState(PHRASES[0]);
  const [k, setK] = useState(0);
  const raf = useRef(0);
  const run = (to: string) => {
    cancelAnimationFrame(raf.current);
    const from = txt;
    const len = Math.max(from.length, to.length);
    const q = Array.from({ length: len }, (_, i) => ({ f: from[i] ?? "", t: to[i] ?? "", s: Math.floor(Math.random() * 20), e: 20 + Math.floor(Math.random() * 25) }));
    let frame = 0;
    const tick = () => {
      let out = "", done = 0;
      q.forEach((c) => {
        if (frame >= c.e) { done++; out += c.t; }
        else if (frame >= c.s) out += CH[Math.floor(Math.random() * CH.length)];
        else out += c.f;
      });
      setTxt(out);
      if (frame % 4 === 0) sfx.play("tick");
      if (done < q.length) { frame++; raf.current = requestAnimationFrame(tick); }
    };
    tick();
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useInterval(() => { const n = (k + 1) % PHRASES.length; setK(n); run(PHRASES[n]); }, 3200);
  return (
    <AssetCard id="MIC-05" title="Text Scramble Decode" desc="Заголовки «расшифровываются» посимвольно — эффект терминала для новостей, сигналов и секретных наград." tags={["text", "scramble", "decode", "typography"]}>
      <div className="grid h-28 place-items-center rounded-2xl bg-ink-950/70 shadow-[inset_0_0_0_1px_#2ee59d33]">
        <div className="font-mono text-2xl font-extrabold tracking-wider text-bull text-glow-bull sm:text-3xl">{txt}</div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PHRASES.map((p, i) => <button key={p} onClick={() => { setK(i); run(p); }} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-bold", k === i ? "bg-bull text-ink-900" : "bg-ink-800 text-ink-400")}>{p}</button>)}
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-06 · Bull/Bear morph toggle ═════════ */
function MorphToggle() {
  const [bull, setBull] = useState(true);
  const [b, bump] = useBump();
  return (
    <AssetCard id="MIC-06" title="Bull ⇄ Bear Morph Toggle" desc="Переключатель режима рынка: морфинг формы, рогов и цвета, частицы и смена всей палитры карточки." tags={["toggle", "morph", "theme", "switch"]}>
      <div className="relative overflow-hidden rounded-2xl p-5 transition-colors duration-700" style={{ background: bull ? "radial-gradient(circle at 30% 30%, #2ee59d33, transparent 70%)" : "radial-gradient(circle at 70% 30%, #ff4d6a33, transparent 70%)" }}>
        <button onClick={() => { setBull(!bull); bump(); feel(bull ? "lock" : "unlock", 15); }} className="relative mx-auto block h-20 w-44 rounded-full transition-colors duration-500" style={{ background: bull ? "#0f3b33" : "#3d1628", boxShadow: `inset 0 4px 10px #0008, 0 0 0 3px ${bull ? "#2ee59d55" : "#ff4d6a55"}` }}>
          <span className="absolute top-2 grid h-16 w-16 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(.3,1.5,.5,1)]" style={{ left: bull ? 8 : 104, background: bull ? "linear-gradient(180deg,#2ee59d,#12a46a)" : "linear-gradient(180deg,#ff4d6a,#c21f43)", boxShadow: `0 4px 0 ${bull ? "#0b7a4d" : "#8c1530"}, 0 0 24px ${bull ? "#2ee59d88" : "#ff4d6a88"}`, transform: `rotate(${bull ? 0 : 180}deg)` }}>
            <svg viewBox="0 0 40 40" width="38" height="38"><path d="M8 16 C4 12 4 6 8 3 C9 8 12 10 15 11 M32 16 C36 12 36 6 32 3 C31 8 28 10 25 11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="20" cy="22" r="10" fill="#fff" opacity=".9" /><circle cx="16" cy="21" r="1.8" fill="#0a1330" /><circle cx="24" cy="21" r="1.8" fill="#0a1330" /></svg>
            <Burst trigger={b} colors={bull ? ["#2ee59d", "#fff"] : ["#ff4d6a", "#fff"]} count={12} spread={60} />
          </span>
          <span className={cn("absolute top-1/2 -translate-y-1/2 text-xs font-extrabold uppercase tracking-widest transition-all duration-500", bull ? "right-6 text-bull" : "left-6 text-bear")}>{bull ? "Bull" : "Bear"}</span>
        </button>
        <div key={String(bull)} className="anim-fade-up mt-4 text-center">
          <div className={cn("text-lg font-extrabold", bull ? "text-bull" : "text-bear")}>{bull ? "Бычий режим" : "Медвежий режим"}</div>
          <div className="text-xs text-ink-300">{bull ? "Ищем покупки на откатах к поддержке." : "Ищем продажи на отскоках к сопротивлению."}</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-07 · Liquid fill button ═════════ */
function LiquidFill() {
  const game = useGame();
  const [lvl, setLvl] = useState(35);
  const [b, bump] = useBump();
  const full = lvl >= 100;
  return (
    <AssetCard id="MIC-07" title="Liquid Fill Piggy" desc="Копилка с «жидкостью»: две волны с разной скоростью, уровень поднимается по тапу, на 100% — взрыв и награда." tags={["liquid", "wave", "progress", "savings"]}>
      <div className="flex items-center gap-5">
        <button onClick={(e) => { if (full) { setLvl(0); return; } const n = Math.min(100, lvl + 15); setLvl(n); feel(n >= 100 ? "success" : "coin", 10); if (n >= 100) { bump(); game.reward({ gems: 100, x: e.clientX, y: e.clientY }); } }}
          className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_6px_16px_#000a,0_0_0_6px_#16264f,0_6px_0_6px_#0b1638] active:scale-95 transition-transform">
          <div className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ height: `${lvl}%` }}>
            <svg className="absolute -top-3 left-0 h-4 w-[200%]" viewBox="0 0 400 16" preserveAspectRatio="none" style={{ animation: "wave 3s linear infinite" }}><path d="M0 8 Q25 0 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 T350 8 T400 8 V16 H0Z" fill="#6a3fd6" opacity=".7" /></svg>
            <svg className="absolute -top-2.5 left-0 h-4 w-[200%]" viewBox="0 0 400 16" preserveAspectRatio="none" style={{ animation: "wave 1.8s linear infinite reverse" }}><path d="M0 8 Q25 16 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 T350 8 T400 8 V16 H0Z" fill="#a174ff" /></svg>
            <div className="h-full w-full bg-gradient-to-b from-violet to-violet-edge" />
            {Array.from({ length: 6 }).map((_, i) => <span key={i} className="absolute h-2 w-2 rounded-full bg-white/40" style={{ left: `${15 + i * 13}%`, bottom: 0, animation: `floatAway ${2 + i * 0.4}s ease-in ${i * 0.5}s infinite` }} />)}
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center"><Icon name="gem" size={26} variant="solid" className="mx-auto text-white drop-shadow" /><div className="font-mono text-xl font-extrabold text-white text-3d">{lvl}%</div></div>
          </div>
          <span className="absolute left-6 top-5 h-8 w-4 rotate-[30deg] rounded-full bg-white/20" />
          <Burst trigger={b} colors={["#a174ff", "#fff", "#5ce1ff"]} count={18} spread={100} />
        </button>
        <div>
          <Label>Gem piggy bank</Label>
          <div className="text-sm font-bold text-ink-200">{full ? "Полная! Тапни, чтобы начать заново." : "Тапай, чтобы наполнить. На 100% — +100 💎."}</div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-08 · Animated icons ═════════ */
function AnimIcons() {
  const [menu, setMenu] = useState(false);
  const [play, setPlay] = useState(false);
  const [chk, setChk] = useState(0);
  const [bell, setBell] = useState(0);
  const [heart, setHeart] = useState(false);
  const [hb, hbump] = useBump();
  const [refresh, setRefresh] = useState(0);
  return (
    <AssetCard id="MIC-08" title="Animated Icon Set" desc="Морфинг-иконки: меню↔крестик, play↔pause, рисующаяся галочка, звенящий колокол, сердце с частицами, вращающийся refresh." tags={["icons", "morph", "svg", "animation"]}>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => { setMenu(!menu); feel("tap"); }} className="raised grid h-20 place-items-center rounded-2xl">
          <svg width="30" height="30" viewBox="0 0 30 30">{[8, 15, 22].map((y, i) => <line key={i} x1="5" x2="25" y1={y} y2={y} stroke="#e6ebf8" strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: "15px 15px", transition: "all .35s cubic-bezier(.3,1.5,.5,1)", transform: menu ? (i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "scaleX(0)") : "none", opacity: menu && i === 1 ? 0 : 1 }} />)}</svg>
        </button>
        <button onClick={() => { setPlay(!play); feel("tap"); }} className="raised grid h-20 place-items-center rounded-2xl">
          <svg width="30" height="30" viewBox="0 0 30 30"><path d={play ? "M8 6 L13 6 L13 24 L8 24 Z M17 6 L22 6 L22 24 L17 24 Z" : "M8 5 L16 10 L16 20 L8 25 Z M16 10 L24 15 L24 15 L16 20 Z"} fill="#2ee59d" style={{ transition: "d .3s ease" }} /></svg>
        </button>
        <button onClick={() => { setChk((c) => c + 1); feel("success", 8); }} className="raised grid h-20 place-items-center rounded-2xl">
          <svg key={chk} width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="none" stroke="#2ee59d" strokeWidth="3" pathLength={100} strokeDasharray="100" style={{ animation: "drawStroke .5s ease both" }} /><path d="M10 17 L15 22 L24 12" fill="none" stroke="#2ee59d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" style={{ animation: "drawStroke .35s ease .4s both" }} /></svg>
        </button>
        <button onClick={() => { setBell((b) => b + 1); feel("pop"); }} className="raised grid h-20 place-items-center rounded-2xl">
          <Icon key={bell} name="bell" size={30} variant="duo" className={cn("text-gold", bell && "anim-wiggle")} style={{ transformOrigin: "50% 10%" }} />
        </button>
        <button onClick={() => { setHeart(!heart); if (!heart) hbump(); feel("pop", 10); }} className="raised relative grid h-20 place-items-center rounded-2xl">
          <Icon key={String(heart)} name="heart" size={30} variant={heart ? "solid" : "line"} className={cn(heart ? "anim-pop text-bear" : "text-ink-300")} />
          <Burst trigger={heart ? hb : 0} colors={["#ff4d6a", "#ff8aa0"]} count={10} spread={40} />
        </button>
        <button onClick={() => { setRefresh((r) => r + 1); feel("whoosh"); }} className="raised grid h-20 place-items-center rounded-2xl">
          <Icon name="refresh" size={30} className="text-sky transition-transform duration-700 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ transform: `rotate(${refresh * 360}deg)` }} />
        </button>
      </div>
    </AssetCard>
  );
}

/* ═════════ MIC-09 · Holographic tilt badge ═════════ */
function Holo() {
  const [t, setT] = useState({ x: 0.5, y: 0.5, on: false });
  return (
    <AssetCard id="MIC-09" title="Holographic Rank Card" desc="Карта ранга с голографической плёнкой: наклон, радужный блик и искры смещаются по положению курсора/пальца." tags={["holographic", "tilt", "card", "premium"]}>
      <div className="grid place-items-center py-2" style={{ perspective: 900 }}>
        <div onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setT({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, on: true }); }} onPointerLeave={() => setT({ x: 0.5, y: 0.5, on: false })}
          className="relative h-72 w-52 touch-none overflow-hidden rounded-3xl" style={{
            transform: `rotateY(${(t.x - 0.5) * 28}deg) rotateX(${-(t.y - 0.5) * 28}deg)`, transition: t.on ? "transform .08s" : "transform .6s cubic-bezier(.3,1.5,.5,1)",
            background: "linear-gradient(160deg,#1d4fbf,#0a1330 70%)", boxShadow: "0 8px 0 #050b1f, 0 30px 50px -15px #000",
          }}>
          <div className="absolute inset-0 mix-blend-color-dodge" style={{ opacity: t.on ? 0.75 : 0.35, background: `linear-gradient(${110 + t.x * 60}deg, transparent 20%, #ff4d6a55 30%, #ffc53d55 40%, #2ee59d55 50%, #3d8bff55 60%, #a174ff55 70%, transparent 80%)`, backgroundSize: "200% 200%", backgroundPosition: `${t.x * 100}% ${t.y * 100}%`, transition: "opacity .3s" }} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at ${t.x * 100}% ${t.y * 100}%, #ffffff55, transparent 40%)` }} />
          {Array.from({ length: 14 }).map((_, i) => <span key={i} className="absolute text-[10px] text-white" style={{ left: `${(i * 41) % 90 + 5}%`, top: `${(i * 67) % 90 + 5}%`, opacity: t.on ? 0.9 : 0.3, transform: `translate(${(t.x - 0.5) * (i % 3 + 1) * 10}px, ${(t.y - 0.5) * (i % 3 + 1) * 10}px)`, animation: `twinkle ${1.5 + (i % 3)}s ease-in-out ${i * 0.1}s infinite` }}>✦</span>)}
          <div className="relative flex h-full flex-col items-center justify-between p-5" style={{ transform: `translateZ(40px) translate(${(t.x - 0.5) * -12}px, ${(t.y - 0.5) * -12}px)` }}>
            <div className="text-[10px] font-extrabold uppercase tracking-[.3em] text-white/70">Season 7</div>
            <div className="grid h-24 w-24 place-items-center" style={{ clipPath: "polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)", background: "linear-gradient(160deg,#7ee8ff,#3d8bff 60%,#1a3aa0)" }}>
              <Icon name="gem" size={44} variant="solid" className="text-white drop-shadow-[0_3px_0_rgba(0,0,0,.3)]" />
            </div>
            <div className="text-center"><div className="text-2xl font-extrabold text-white text-3d">Diamond</div><div className="font-mono text-xs font-bold text-[#7ee8ff]">Top 1% · 12,480 XP</div></div>
          </div>
        </div>
      </div>
    </AssetCard>
  );
}

export default function Micro() {
  return (
    <Section id="micro" num="12" title="Micro-interactions" subtitle="Магнит, ripple, прожектор, одометр, расшифровка, морфинг, жидкость, анимированные иконки, голограмма">
      <Magnetic />
      <RippleJelly />
      <Spotlight />
      <Odometer />
      <Scramble />
      <MorphToggle />
      <LiquidFill />
      <AnimIcons />
      <Holo />
    </Section>
  );
}
