import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { GameCtx, LEVEL_XP, SKILLS, useGame, type Complete, type Reward, type SkillId } from "./ctx";
import { feel, haptic, sfx } from "./sfx";
import { Btn, Confetti, Icon, useCountUp } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { cn } from "../utils/cn";

type Fly = { id: number; kind: "xp" | "gems"; x: number; y: number; tx: number; ty: number; delay: number; jx: number; jy: number };
type Pop = { id: number; x: number; y: number; text: string; color: string };
type Spark = { id: number; x: number; y: number };

let uid = 1;

function targetOf(kind: "xp" | "gems") {
  const el = document.getElementById(kind === "xp" ? "hud-xp" : "hud-gems");
  if (!el) return { x: window.innerWidth - 60, y: 30 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(180);
  const [gems, setGems] = useState(1240);
  const [hearts, setHearts] = useState(5);
  const [streak] = useState(27);
  const [combo, setCombo] = useState(0);
  const [skills, setSkills] = useState<Record<SkillId, number>>({ candles: 22, patterns: 36, risk: 12, psychology: 6, defi: 0 });
  const [daily, setDaily] = useState({ done: 0, goal: 5 });
  const dailyRef = useRef(daily);
  const comboRef = useRef(0);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [banner, setBanner] = useState<{ id: number; t: string; c: string } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [conf, setConf] = useState(0);
  const touchedRef = useRef(new Set<string>());
  const [touched, setTouched] = useState(0);
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      setLevelUp(level);
      setConf((c) => c + 1);
      setGems((g) => g + 100);
      sfx.play("levelup");
      haptic([20, 40, 20, 40, 60]);
    }
    prevLevel.current = level;
  }, [level]);

  /* global click sparks */
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const id = uid++;
      setSparks((s) => [...s.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => setSparks((s) => s.filter((q) => q.id !== id)), 600);
    };
    window.addEventListener("pointerdown", on, { passive: true });
    return () => window.removeEventListener("pointerdown", on);
  }, []);

  const showBanner = useCallback((t: string, c: string) => setBanner({ id: uid++, t, c }), []);
  useEffect(() => {
    if (!banner) return;
    const id = window.setTimeout(() => setBanner(null), 1700);
    return () => clearTimeout(id);
  }, [banner]);

  const spawn = useCallback((kind: "xp" | "gems", amount: number, x: number, y: number) => {
    const t = targetOf(kind);
    const n = Math.min(10, Math.max(3, Math.round(amount / (kind === "xp" ? 5 : 25))));
    const list: Fly[] = Array.from({ length: n }, (_, i) => ({
      id: uid++, kind, x, y, tx: t.x, ty: t.y, delay: i * 45,
      jx: (Math.random() - 0.5) * 70, jy: (Math.random() - 0.5) * 50 - 20,
    }));
    setFlies((f) => [...f, ...list]);
    const maxDelay = (n - 1) * 45 + 820;
    window.setTimeout(() => {
      setFlies((f) => f.filter((q) => !list.includes(q)));
      if (kind === "xp") setXp((v) => v + amount);
      else setGems((v) => v + amount);
      sfx.play("coin");
    }, maxDelay);
  }, []);

  const reward = useCallback((r: Reward) => {
    const x = r.x ?? window.innerWidth / 2;
    const y = r.y ?? window.innerHeight / 2;
    if (r.xp) { if (r.silent) setXp((v) => v + (r.xp ?? 0)); else spawn("xp", r.xp, x, y); }
    if (r.gems) { if (r.silent) setGems((v) => v + (r.gems ?? 0)); else spawn("gems", r.gems, x, y); }
    if (!r.silent) {
      const id = uid++;
      const text = [r.xp ? `+${r.xp} XP` : "", r.gems ? `+${r.gems} 💎` : ""].filter(Boolean).join("  ");
      setPops((p) => [...p, { id, x, y, text, color: r.xp ? "#ffc53d" : "#a174ff" }]);
      window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 1000);
    }
  }, [spawn]);

  const closeLevel = useCallback(() => setLevelUp(null), []);
  const gemsRef = useRef(gems);
  gemsRef.current = gems;
  const spend = useCallback((g: number) => {
    if (gemsRef.current < g) { feel("error", [30, 30, 30]); return false; }
    gemsRef.current -= g;
    setGems((v) => v - g);
    feel("coin", 12);
    return true;
  }, []);

  const touch = useCallback((id: string, x: number, y: number) => {
    if (touchedRef.current.has(id)) return;
    touchedRef.current.add(id);
    setTouched(touchedRef.current.size);
    reward({ xp: 5, x, y });
  }, [reward]);

  const addCombo = useCallback((ok: boolean) => {
    const n = ok ? comboRef.current + 1 : 0;
    comboRef.current = n;
    setCombo(n);
    if (ok && (n === 3 || n === 5 || (n >= 8 && n % 4 === 0))) { sfx.play("combo"); haptic([10, 20, 10]); showBanner(`COMBO ×${n}`, "#ff8a3d"); }
  }, [showBanner]);

  const complete = useCallback((c: Complete) => {
    const ok = c.ok ?? true;
    addCombo(ok);
    if (!ok) return;
    setSkills((s) => ({ ...s, [c.skill]: Math.min(100, s[c.skill] + 8) }));
    reward({ xp: c.xp ?? 15, gems: c.gems, x: c.x, y: c.y });
    const nd = { ...dailyRef.current, done: dailyRef.current.done + 1 };
    dailyRef.current = nd;
    setDaily(nd);
    if (nd.done === nd.goal) {
      window.setTimeout(() => { setConf((v) => v + 1); sfx.play("levelup"); haptic([20, 40, 20, 40, 80]); setGems((g) => g + 100); showBanner("DAILY GOAL · +100 💎", "#2ee59d"); }, 1000);
    }
  }, [addCombo, reward, showBanner]);

  const api = useMemo(() => ({
    xp, level, levelXp: xp % LEVEL_XP, levelMax: LEVEL_XP, gems, streak, hearts, combo, touched, skills, daily,
    reward, complete, spend, touch, addCombo,
    loseHeart: () => { setHearts((h) => Math.max(0, h - 1)); haptic([40, 30, 40]); },
    refillHearts: () => setHearts(5),
    celebrate: () => setConf((c) => c + 1),
  }), [xp, level, gems, streak, hearts, combo, touched, skills, daily, reward, complete, spend, touch, addCombo]);

  return (
    <GameCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[80]">
        {sparks.map((s) => (
          <span key={s.id} className="absolute" style={{ left: s.x, top: s.y }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2 + s.id;
              return <span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#5ce1ff]" style={{ ["--dx" as string]: `${Math.cos(a) * 26}px`, ["--dy" as string]: `${Math.sin(a) * 26}px`, animation: "burst .5s ease-out forwards", boxShadow: "0 0 6px #5ce1ff" } as CSSProperties} />;
            })}
          </span>
        ))}
        {flies.map((f) => <Flyer key={f.id} f={f} />)}
        {pops.map((p) => (
          <span key={p.id} className="absolute whitespace-nowrap font-mono text-base font-extrabold" style={{ left: p.x, top: p.y, color: p.color, textShadow: `0 0 14px ${p.color}, 0 2px 0 #0008`, animation: "floatAway 1s ease-out forwards" }}>{p.text}</span>
        ))}
      </div>
      <div className="pointer-events-none fixed inset-0 z-[85]"><Confetti trigger={conf} count={90} /></div>
      {banner && (
        <div key={banner.id} className="pointer-events-none fixed left-1/2 top-24 z-[95]" style={{ animation: "comboIn 1.7s ease both" }}>
          <div className="rounded-2xl px-5 py-2.5 font-mono text-lg font-extrabold uppercase tracking-widest text-ink-900" style={{ background: banner.c, boxShadow: `0 5px 0 rgba(0,0,0,.35), 0 0 40px ${banner.c}88` }}>{banner.t}</div>
        </div>
      )}
      {levelUp !== null && <LevelUpOverlay level={levelUp} onClose={closeLevel} />}
    </GameCtx.Provider>
  );
}

function Flyer({ f }: { f: Fly }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const a = requestAnimationFrame(() => setPhase(1));
    const b = window.setTimeout(() => setPhase(2), 220 + f.delay);
    return () => { cancelAnimationFrame(a); clearTimeout(b); };
  }, [f.delay]);
  const dx = phase === 0 ? 0 : phase === 1 ? f.jx : f.tx - f.x;
  const dy = phase === 0 ? 0 : phase === 1 ? f.jy : f.ty - f.y;
  const isXp = f.kind === "xp";
  return (
    <span className="absolute" style={{ left: f.x - 11, top: f.y - 11, transform: `translateX(${dx}px)`, transition: phase === 2 ? "transform .6s cubic-bezier(.55,0,.8,.6)" : "transform .22s ease-out" }}>
      <span className="block" style={{ transform: `translateY(${dy}px) scale(${phase === 2 ? 0.55 : 1})`, transition: phase === 2 ? "transform .6s cubic-bezier(.2,.6,.3,1)" : "transform .22s ease-out" }}>
        <span className={cn("grid h-[22px] w-[22px] place-items-center rounded-full", isXp ? "bg-gradient-to-b from-gold to-gold-edge shadow-[0_0_14px_#ffc53d]" : "bg-gradient-to-b from-violet to-violet-edge shadow-[0_0_14px_#a174ff]")}>
          <Icon name={isXp ? "bolt" : "gem"} size={13} variant="solid" className="text-white" />
        </span>
      </span>
    </span>
  );
}

function LevelUpOverlay({ level, onClose }: { level: number; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/70 p-6 backdrop-blur-md" style={{ animation: "fadeIn .25s both" }} onClick={onClose}>
      <div className="relative text-center" style={{ animation: "scaleIn .5s cubic-bezier(.3,1.6,.5,1) both" }}>
        <div className="absolute left-1/2 top-16 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" style={{ background: "repeating-conic-gradient(#ffc53d44 0 10deg, transparent 10deg 30deg)", animation: "rays 9s linear infinite", maskImage: "radial-gradient(circle, #000 25%, transparent 65%)" }} />
        <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-[40px] bg-gradient-to-b from-gold to-gold-edge shadow-[0_8px_0_#8a5c00,0_0_60px_#ffc53d88,inset_0_3px_0_#fff8]">
          <span className="font-mono text-6xl font-extrabold text-ink-900">{level}</span>
        </div>
        <div className="relative mt-6 text-4xl font-extrabold tracking-tight text-gold text-glow-gold">LEVEL UP!</div>
        <div className="relative mt-2 text-sm font-bold text-ink-200">Новый ранг открыт · +100 💎 бонус</div>
        <div className="relative mt-4 flex justify-center"><Mascot mood="happy" size={90} className="anim-float" /></div>
        <div className="relative mt-4"><Btn v="gold" size="lg" onClick={onClose}>Awesome</Btn></div>
      </div>
    </div>
  );
}

/* ───────── HUD shown in header ───────── */
export function GameHud() {
  const g = useGame();
  const xpV = useCountUp(g.levelXp, 600);
  const gemsV = useCountUp(g.gems, 700);
  const sound = useSyncExternalStore(sfx.subscribe, () => sfx.enabled, () => true);
  const [bumpX, setBumpX] = useState(0);
  const [bumpG, setBumpG] = useState(0);
  const [bumpD, setBumpD] = useState(0);
  const prevX = useRef(g.xp);
  const prevG = useRef(g.gems);
  const prevD = useRef(g.daily.done);
  useEffect(() => { if (g.xp !== prevX.current) { setBumpX((b) => b + 1); prevX.current = g.xp; } }, [g.xp]);
  useEffect(() => { if (g.gems !== prevG.current) { setBumpG((b) => b + 1); prevG.current = g.gems; } }, [g.gems]);
  useEffect(() => { if (g.daily.done !== prevD.current) { setBumpD((b) => b + 1); prevD.current = g.daily.done; } }, [g.daily.done]);
  const pct = (g.levelXp / g.levelMax) * 100;
  const dpct = Math.min(1, g.daily.done / g.daily.goal);
  const R = 17, C = 2 * Math.PI * R;
  const dailyDone = g.daily.done >= g.daily.goal;
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div id="hud-xp" key={`x${bumpX}`} className={cn("raised flex h-11 items-center gap-2 rounded-2xl pl-1 pr-3", bumpX && "anim-pop")} title="Level & XP">
        <div className="relative grid h-9 w-9 place-items-center">
          <svg width="40" height="40" className="absolute -rotate-90"><circle cx="20" cy="20" r={R} stroke="#081130" strokeWidth="4" fill="none" /><circle cx="20" cy="20" r={R} stroke="#ffc53d" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .6s" }} /></svg>
          <span className="font-mono text-xs font-extrabold text-gold">{g.level}</span>
        </div>
        <span className="hidden font-mono text-xs font-extrabold tabular-nums text-ink-200 sm:block">{Math.round(xpV)}<span className="text-ink-500">/{g.levelMax}</span></span>
      </div>
      <div id="hud-daily" key={`d${bumpD}`} className={cn("raised hidden h-11 items-center gap-1.5 rounded-2xl pl-1 pr-3 md:flex", bumpD && "anim-pop")} title="Daily goal">
        <div className="relative grid h-9 w-9 place-items-center">
          <svg width="40" height="40" className="absolute -rotate-90"><circle cx="20" cy="20" r={R} stroke="#081130" strokeWidth="4" fill="none" /><circle cx="20" cy="20" r={R} stroke="#2ee59d" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - dpct)} style={{ transition: "stroke-dashoffset .6s" }} /></svg>
          <Icon name={dailyDone ? "check" : "target"} size={15} stroke={3} className={dailyDone ? "text-bull" : "text-ink-300"} />
        </div>
        <span className="font-mono text-xs font-extrabold text-ink-200">{g.daily.done}<span className="text-ink-500">/{g.daily.goal}</span></span>
      </div>
      <div id="hud-gems" key={`g${bumpG}`} className={cn("raised flex h-11 items-center gap-1.5 rounded-2xl px-3", bumpG && "anim-pop")}>
        <Icon name="gem" size={18} variant="solid" className="text-violet drop-shadow-[0_0_6px_#a174ff]" />
        <span className="font-mono text-sm font-extrabold tabular-nums text-violet">{Math.round(gemsV).toLocaleString()}</span>
      </div>
      <div className="raised hidden h-11 items-center gap-1 rounded-2xl px-3 lg:flex">
        <Icon name="flame" size={20} variant="solid" className="anim-flame text-flame" />
        <span className="font-mono text-sm font-extrabold text-flame">{g.streak}</span>
      </div>
      <div className="raised hidden h-11 items-center gap-1 rounded-2xl px-3 xl:flex">
        <Icon name="heart" size={18} variant="solid" className={cn("text-bear", g.hearts <= 2 && "anim-heartbeat")} />
        <span className="font-mono text-sm font-extrabold text-bear">{g.hearts}</span>
      </div>
      <button onClick={() => sfx.setEnabled(!sound)} className="raised relative grid h-11 w-11 place-items-center rounded-2xl transition-transform active:translate-y-0.5" aria-label="Toggle sound">
        <Icon name="volume" size={18} className={sound ? "text-sky" : "text-ink-500"} />
        {!sound && <span className="absolute h-[2px] w-6 rotate-45 rounded bg-bear" />}
      </button>
    </div>
  );
}

/* ───────── Skill radar (sidebar) ───────── */

export function SkillRadar({ size = 210 }: { size?: number }) {
  const g = useGame();
  const v0 = useCountUp(g.skills.candles, 900), v1 = useCountUp(g.skills.patterns, 900), v2 = useCountUp(g.skills.risk, 900), v3 = useCountUp(g.skills.psychology, 900), v4 = useCountUp(g.skills.defi, 900);
  const vals = [v0, v1, v2, v3, v4];
  const cx = size / 2, cy = size / 2 + 4, R = size * 0.34;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i / 5) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const; };
  const poly = (f: (i: number) => number) => SKILLS.map((_, i) => pt(i, f(i)).join(",")).join(" ");
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / 5);
  return (
    <div className="panel mt-3 p-3">
      <div className="mb-1 flex items-center justify-between px-1"><span className="text-xs font-extrabold text-white">Skill radar</span><span className="font-mono text-[10px] font-bold text-sky">avg {avg}</span></div>
      <svg width="100%" viewBox={`0 0 ${size} ${size}`}>
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={poly(() => R * k)} fill="none" stroke="#22376f" strokeWidth="1" />)}
        {SKILLS.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#22376f" />; })}
        <polygon points={poly((i) => R * Math.max(0.06, vals[i] / 100))} fill="#3d8bff44" stroke="#5ce1ff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 8px #5ce1ff66)" }} />
        {SKILLS.map((s, i) => {
          const [x, y] = pt(i, R * Math.max(0.06, vals[i] / 100));
          const [lx, ly] = pt(i, R + 18);
          return <g key={s.id}><circle cx={x} cy={y} r="4" fill={s.c} /><text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="800" fill={s.c}>{s.t}</text></g>;
        })}
      </svg>
    </div>
  );
}
