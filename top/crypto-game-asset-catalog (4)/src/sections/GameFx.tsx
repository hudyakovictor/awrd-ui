import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { AssetCard, Btn, Burst, Confetti, Icon, Label, ProgressBar, Section, useBump, useCountUp } from "../ui/kit";
import { useRaf } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

function useCanvas(cb: (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) => void, active = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = performance.now(), w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { const r = cv.getBoundingClientRect(); w = r.width; h = h; cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); w = r.width; h = r.height; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const loop = (t: number) => { const dt = Math.min(50, t - last); last = t; ctx.clearRect(0, 0, w, h); cbRef.current(ctx, w, h, dt); raf = requestAnimationFrame(loop); };
    if (active) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active]);
  return ref;
}

/* ═════════ FX-01 · XP rain ═════════ */
type Drop = { x: number; y: number; vy: number; kind: number; sway: number; ph: number };
function XPRain() {
  const game = useGame();
  const drops = useRef<Drop[]>([]);
  const [earned, setEarned] = useState(0);
  const [running, setRunning] = useState(false);
  const [got, setGot] = useState(false);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    if (drops.current.length < 60 && running) for (let i = 0; i < 3; i++) drops.current.push({ x: 10 + Math.random() * (w - 20), y: -14 - Math.random() * 40, vy: 1.2 + Math.random() * 1.6, kind: Math.random() > 0.75 ? 1 : 0, sway: 10 + Math.random() * 24, ph: Math.random() * 6 });
    for (const d of drops.current) {
      d.y += d.vy * k;
      const sx = d.x + Math.sin(d.y * 0.03 + d.ph) * d.sway * 0.2;
      if (d.kind === 1) {
        ctx.save(); ctx.translate(sx, d.y);
        ctx.fillStyle = "#a174ff";
        ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, -3); ctx.lineTo(7, 3); ctx.lineTo(0, 9); ctx.lineTo(-7, 3); ctx.lineTo(-7, -3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#d9c2ff"; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, -3); ctx.lineTo(0, 0); ctx.lineTo(-7, -3); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else {
        ctx.save(); ctx.translate(sx, d.y);
        const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10);
        g.addColorStop(0, "#ffe9a8"); g.addColorStop(1, "#e09a10");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
        ctx.fillStyle = "#7a4a00"; ctx.font = "800 11px JetBrains Mono"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("+5", 0, 0.5);
        ctx.restore();
      }
    }
    drops.current = drops.current.filter((d) => d.y < h + 16);
  }, running);
  const start = (e: React.MouseEvent) => {
    setRunning(true); setGot(false);
    const r = cv.current!.getBoundingClientRect();
    const fx = e.clientX - r.left, fy = e.clientY - r.top;
    let collected = 0;
    const id = window.setInterval(() => {
      collected++;
      if (Math.random() > 0.75) game.reward({ gems: 2, x: fx, y: fy, silent: true });
      if (collected >= 18) {
        clearInterval(id);
        setRunning(false);
        const xp = 40;
        game.reward({ xp, x: fx, y: fy });
        setEarned((v) => v + xp);
        setGot(true);
        sfx.play("levelup");
      }
    }, 160);
  };
  const ev = useCountUp(earned, 800);
  return (
    <AssetCard id="FX-01" title="XP Rain" desc="«Урок завершён» — награда собирается дождём: XP-монеты и гемы падают с покачиванием, итог летит в HUD одной суммой." tags={["celebration", "rain", "reward", "canvas"]}>
      <canvas ref={cv} className="h-56 w-full rounded-2xl bg-ink-950/70" />
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-sm font-extrabold text-gold">total +{Math.round(ev)} XP</span>
        <Btn v="gold" size="sm" onClick={start} disabled={running}><Icon name="trophy" size={14} variant="solid" />{got ? "Collect again" : "Finish lesson"}</Btn>
      </div>
      {got && <div className="anim-pop mt-2 text-center text-xs font-extrabold text-bull">+40 XP добавлено в счёт · 50% на «Risk»</div>}
    </AssetCard>
  );
}

/* ═════════ FX-02 · Coin vault ═════════ */

function CoinVault() {
  const game = useGame();
  const [stage, setStage] = useState<"locked" | "align" | "open" | "drained">("locked");
  const [rot, setRot] = useState(0);
  const [need, setNeed] = useState(0);
  const [coins, setCoins] = useState<{ id: number; dx: number; dy: number; d: number }[]>([]);
  const [taken, setTaken] = useState(0);
  const vault = useRef<HTMLDivElement>(null);
  const start = () => { setStage("align"); setRot(0); setNeed(Math.floor(Math.random() * 360)); feel("tap"); };
  const turn = () => {
    const n = (rot + 120) % 360;
    setRot(n);
    sfx.play("spin");
    haptic(10);
    if (n === need) {
      window.setTimeout(() => {
        setStage("open");
        const r = vault.current?.getBoundingClientRect();
        const target = document.getElementById("hud-gems")?.getBoundingClientRect();
        const ox = r ? r.left + r.width / 2 : 150, oy = r ? r.top + r.height / 2 : 300;
        const tx = target ? target.left + target.width / 2 : ox, ty = target ? target.top : 30;
        const list = Array.from({ length: 12 }, (_, i) => ({ id: Date.now() + i, dx: (tx - ox) * (0.5 + Math.random() * 0.5), dy: (ty - oy) * (0.5 + Math.random() * 0.5), d: i * 60 }));
        setCoins(list);
        feel("open", [20, 40, 60]);
        window.setTimeout(() => {
          setStage("drained");
          setTaken(150);
          game.reward({ gems: 150, x: tx, y: ty });
        }, 1300 + 11 * 60);
      }, 350);
    }
  };
  return (
    <AssetCard id="FX-02" title="Coin Vault" desc="Три поворота диска в нужное положение (случайный код), дверь сдвигается, 12 монет летят дугой в HUD-счётчик гемов." tags={["celebration", "vault", "unlock", "arc"]}>
      <div className="relative mx-auto h-56 w-64">
        <div ref={vault} className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-b from-ink-600 to-ink-800 shadow-[0_8px_0_#050b1f,inset_0_2px_0_#ffffff22]">
          <div className="absolute inset-4 rounded-2xl bg-ink-950/70 shadow-[inset_0_4px_12px_#000a]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-gold to-gold-edge shadow-[0_5px_0_#8a5c00] transition-transform", stage === "align" && "anim-heartbeat", (stage === "open" || stage === "drained") && "scale-50 opacity-0")}><Icon name="lock" size={30} className="text-ink-900" /></span>
            <span className={cn("mt-3 font-mono text-xs font-extrabold text-ink-300 transition-opacity", (stage === "open" || stage === "drained") && "opacity-0")}>VAULT-01</span>
          </div>
          {/* door */}
          <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-b from-ink-500 to-ink-700 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)]", stage === "open" || stage === "drained" ? "translate-x-full" : "translate-x-0")} style={{ boxShadow: "inset -10px 0 20px #0006" }}>
            <div className="relative grid h-28 w-28 place-items-center">
              <div className="absolute inset-0 rounded-full" style={{ transform: `rotate(${rot}deg)`, transition: "transform .45s cubic-bezier(.3,1.3,.5,1)", background: "conic-gradient(#22376f, #2f4789, #22376f, #2f4789, #22376f)" }} />
              <div className="absolute inset-3 rounded-full bg-ink-900/60" />
              <span className="absolute left-1/2 top-1 h-5 w-1.5 -translate-x-1/2 rounded bg-gold" />
              <span className={cn("grid h-10 w-10 place-items-center rounded-full bg-ink-800 text-center font-mono text-[10px] font-extrabold text-ink-300", stage === "align" && "cursor-pointer")} onClick={stage === "align" ? turn : undefined}>
                {stage === "align" ? "TURN" : `${Math.round(rot / 30)}/3`}
              </span>
            </div>
          </div>
          {/* flying coins */}
          {coins.map((c) => (
            <span key={c.id} className="absolute left-1/2 top-1/2 z-10 grid h-9 w-9 place-items-center rounded-full" style={{
              background: "radial-gradient(circle at 35% 30%, #ffe9a8, #e09a10)", boxShadow: "0 0 14px #ffc53d88",
              animation: `coinArc .95s cubic-bezier(.4,0,.7,.4) ${c.d}ms forwards`,
              ["--cx" as string]: `${c.dx}px`, ["--cy" as string]: `${c.dy}px`,
            }}>
              <span className="font-mono text-xs font-extrabold text-[#7a4a00]">$</span>
            </span>
          ))}
        </div>
        {stage === "drained" && <div className="anim-pop absolute inset-x-0 -bottom-1 text-center"><span className="rounded-lg bg-bull/15 px-2 py-1 text-xs font-extrabold text-bull">Vault empty · +150 💎</span></div>}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {stage === "locked" && <Btn v="gold" size="sm" onClick={start}><Icon name="lock" size={14} />Unlock vault</Btn>}
        {stage === "align" && <span className="self-center text-xs font-bold text-ink-300">Диск: {Math.round(rot / 30)}/3 поворотов · цель скрыта</span>}
        {stage === "drained" && <Btn v="ghost" size="sm" onClick={() => { setStage("locked"); setCoins([]); }}>Reset</Btn>}
      </div>
    </AssetCard>
  );
}

/* ═════════ FX-03 · Slot machine ═════════ */
const REEL = ["gem", "coin", "candle", "flame", "shield"] as const;
const REEL_COLORS: Record<string, string> = { gem: "#a174ff", coin: "#ffc53d", candle: "#5ce1ff", flame: "#ff8a3d", shield: "#2ee59d" };
function SlotMachine() {
  const game = useGame();
  const [pos, setPos] = useState([0, 0, 0]);
  const [dur, setDur] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<null | string>(null);
  const [b, bump] = useBump();
  const [total, setTotal] = useState(0);
  const CELL = 52;
  const spin = (e: React.MouseEvent) => {
    if (spinning) return;
    if (!game.spend(25)) return;
    setWin(null);
    setSpinning(true);
    feel("whoosh");
    const stops = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
    const turns = [5, 7, 9];
    setDur([900, 1350, 1800]);
    const next = pos.map((p, i) => p + turns[i] * 5 + ((5 - ((p + turns[i] * 5) % 5)) % 5) + stops[i] - ((p + turns[i] * 5) % 5));
    setPos(next);
    window.setTimeout(() => {
      setSpinning(false);
      const [a, c, d] = stops;
      if (a === c && c === d) {
        setWin("JACKPOT ×5!");
        bump();
        sfx.play("levelup");
        game.reward({ gems: 125, x: e.clientX, y: e.clientY });
        setTotal((t) => t + 125);
      } else if (a === c || c === d || a === d) {
        setWin("Pair ×2");
        feel("combo");
        game.reward({ gems: 50, x: e.clientX, y: e.clientY });
        setTotal((t) => t + 50);
      }
    }, 2100);
  };
  return (
    <AssetCard id="FX-03" title="Slot Machine" desc="Три реела с инерционным замедлением и разными временем остановки; пары и джекпот платят гемы, спин стоит 25 💎." tags={["minigame", "slots", "reward", "gambling-safe"]}>
      <Confetti trigger={b} count={40} />
      <div className="relative mx-auto flex w-max gap-2 rounded-3xl bg-gradient-to-b from-ink-600 to-ink-800 p-4 shadow-[0_8px_0_#050b1f]">
        {pos.map((p, i) => (
          <div key={i} className="relative h-[156px] w-14 overflow-hidden rounded-2xl bg-ink-950 shadow-[inset_0_6px_16px_#000a]">
            <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${-p * CELL}px)`, transition: `transform ${dur[i]}ms cubic-bezier(.15,.9,.35,1)` }}>
              {Array.from({ length: pos[i] + 8 }).map((_, k) => (
                <div key={k} className="grid h-[52px] w-14 place-items-center">
                  <Icon name={REEL[k % 5]} size={30} variant="duo" style={{ color: REEL_COLORS[REEL[k % 5]] }} />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#050b1f_0%,transparent_30%,transparent_70%,#050b1f_100%)]" />
          </div>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[140px] w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-transparent transition-all" style={win ? { borderColor: "#ffc53d", boxShadow: "0 0 24px #ffc53d88" } : undefined} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("h-5 text-sm font-extrabold", win && "anim-pop text-gold")}>{win ?? ""}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-violet">bank +{total}💎</span>
          <Btn v="gold" size="sm" onClick={spin} disabled={spinning}>{spinning ? "Spinning…" : "Spin · 25💎"}</Btn>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ FX-04 · Charge & fire ═════════ */
function ChargeFire() {
  const game = useGame();
  const [charge, setCharge] = useState(0);
  const [firing, setFiring] = useState(false);
  const [hit, setHit] = useState<null | boolean>(null);
  const [shots, setShots] = useState(0);
  const [b, bump] = useBump();
  const chRef = useRef(0);
  const charging = useRef(false);
  const [chargingState, setChargingState] = useState(false);
  useRaf((dt) => {
    if (charging.current) {
      chRef.current = Math.min(100, chRef.current + dt * 0.075);
      setCharge((o) => (Math.round(o) === Math.round(chRef.current) ? o : chRef.current));
    } else if (!firing) chRef.current = Math.max(0, chRef.current - dt * 0.09);
  });
  const begin = () => { charging.current = true; setChargingState(true); };
  const release = (e: React.MouseEvent) => {
    if (!charging.current) return;
    charging.current = false; setChargingState(false);
    const c = chRef.current;
    if (c < 12) { chRef.current = 0; return; }
    setFiring(true); setHit(null);
    setShots((s) => s + 1);
    const willHit = c >= 55;
    window.setTimeout(() => {
      setHit(willHit);
      if (willHit) { bump(); feel("success", [15, 25, 40]); game.reward({ gems: Math.round(c / 8), x: e.clientX, y: e.clientY }); }
      else { feel("lock", 15); }
      window.setTimeout(() => { setFiring(false); chRef.current = 0; }, 500);
    }, 240);
  };
  return (
    <AssetCard id="FX-04" title="Charge & Fire" desc="Удерживай — заряд растёт с нарастающим свечением и вибрацией, отпусти — луч пересечёт дистанцию до цели. Попадание только при заряде ≥ 55%." tags={["charge", "beam", "timing", "reward"]}>
      <div className="relative flex h-40 items-center justify-between gap-4">
        {/* energy cell */}
        <div
          onPointerDown={begin} onPointerUp={release} onPointerLeave={release}
          className="relative grid h-28 w-28 shrink-0 cursor-pointer touch-none select-none place-items-center rounded-full transition-transform"
          style={{ transform: chargingState ? `scale(${1 + charge * 0.002})` : "none", background: `radial-gradient(circle at 35% 30%, #7ee8ff, #1e56c9 70%)`, boxShadow: `0 0 ${10 + charge * 0.5}px ${charge > 80 ? "#7ee8ff" : "#3d8bff"}${charge > 70 ? "aa" : "66"}, 0 8px 0 #050b1f` }}>
          <span className={cn("grid h-16 w-16 place-items-center rounded-full bg-ink-950/70", charge > 85 && "anim-heartbeat")}><Icon name="bolt" size={30} variant="solid" className="text-sky" /></span>
          <span className="absolute -bottom-2 rounded-md bg-ink-900 px-1.5 font-mono text-[10px] font-extrabold text-white">{Math.round(charge)}%</span>
        </div>
        {/* track */}
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-900">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky to-white transition-[width] duration-100" style={{ width: `${charge}%` }} />
          {firing && <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white via-sky to-transparent" style={{ animation: "beamOut .45s ease-out both", boxShadow: "0 0 18px #5ce1ff" }} />}
          {firing && hit === true && <div className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center" style={{ animation: "popIn .3s ease both" }}><Icon name="sparkles" size={34} className="text-gold" /></div>}
        </div>
        {/* target */}
        <div className={cn("relative grid h-20 w-20 shrink-0 place-items-center", hit === true && "anim-jelly")}>
          <span className={cn("grid h-16 w-16 place-items-center rounded-full transition-all", hit === true ? "scale-0 opacity-0" : hit === false ? "opacity-40" : "")} style={{ background: "radial-gradient(circle at 35% 30%, #ffe9a8, #e09a10)", boxShadow: "0 5px 0 #8a5c00" }}>
            <Icon name="gem" size={26} variant="solid" className="text-[#7a4a00]" />
          </span>
          {hit === true && <Burst trigger={b} colors={["#a174ff", "#ffc53d"]} />}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-400">{hit === true ? "Буллет!" : hit === false ? "Слишком слабый выстрел — надо ≥55%" : "Hold to charge, release to fire"}</span>
        <span className="font-mono text-xs font-extrabold text-ink-300">shots: {shots}</span>
      </div>
    </AssetCard>
  );
}

/* ═════════ FX-05 · Combo meter ═════════ */
function ComboMeter() {
  const [combo, setCombo] = useState(0);
  const [meter, setMeter] = useState(0);
  const [best, setBest] = useState(0);
  const [banner, setBanner] = useState<null | number>(null);
  const [shk, setShk] = useState(0);
  const meterRef = useRef(0);
  const bestRef = useRef(0);
  const comboRef = useRef(0);
  const decaying = useRef(false);
  useRaf((dt) => {
    if (decaying.current) {
      meterRef.current = Math.max(0, meterRef.current - dt * 0.028);
      if (meterRef.current === 0 && comboRef.current > 0) { comboRef.current = 0; setCombo(0); }
      setMeter((o) => (Math.round(o) === Math.round(meterRef.current) ? o : Math.round(meterRef.current)));
    }
  });
  const bump1 = (ok: boolean) => {
    if (ok) {
      const n = comboRef.current + 1;
      comboRef.current = n; setCombo(n);
      meterRef.current = Math.min(100, meterRef.current + 22); setMeter(Math.round(meterRef.current));
      decaying.current = true;
      sfx.play("pop");
      haptic(8 + Math.min(20, n * 2));
      if (n > bestRef.current) { bestRef.current = n; setBest(n); }
      if (n === 5 || n === 10 || n === 15 || n % 20 === 0) {
        setBanner(n); sfx.play("combo");
        window.setTimeout(() => setBanner(null), 1500);
      }
      if (meterRef.current >= 100) {
        meterRef.current = 0; decaying.current = false; setMeter(0);
        sfx.play("levelup");
        setBanner(99);
        window.setTimeout(() => setBanner(null), 1500);
      }
    } else {
      if (comboRef.current > 0) { setShk((s) => s + 1); feel("error", [30, 20, 30]); }
      comboRef.current = 0; setCombo(0);
      meterRef.current = 0; setMeter(0); decaying.current = false;
    }
  };
  const mult = 1 + Math.floor(combo / 5);
  return (
    <AssetCard id="FX-05" title="Combo Meter" desc="Хиты наращивают комбо и заполняют шкалу, которая сама остывает; вехи 5/10/15 дают баннер, полный заряд — мега-вспышка и множитель награды." tags={["combo", "meter", "streak", "decay"]}>
      <div className="relative">
        {banner !== null && (
          <div key={banner + "-" + Date.now() % 1000} className="pointer-events-none absolute -top-2 left-1/2 z-20" style={{ animation: "comboIn 1.5s ease both" }}>
            <span className={cn("rounded-2xl px-4 py-1.5 font-mono text-lg font-extrabold text-ink-900", banner === 99 ? "bg-gold" : "bg-flame")} style={{ boxShadow: `0 5px 0 rgba(0,0,0,.35), 0 0 30px ${banner === 99 ? "#ffc53d" : "#ff8a3d"}88` }}>{banner === 99 ? "METER OVERLOAD!" : `COMBO ×${banner}`}</span>
          </div>
        )}
        <div key={shk} className={cn("flex items-end justify-around pb-2", shk && combo === 0 && "anim-shake")}>
          {["#2ee59d", "#3d8bff", "#ffc53d", "#ff4d6a"].map((c, i) => <div key={i} className={cn("grid h-16 w-16 place-items-center rounded-2xl", meter >= 100 ? "ring-4 ring-gold" : "")} style={{ background: `radial-gradient(circle, ${c}33, #111f47)`, boxShadow: `inset 0 0 0 2px ${c}` }}><Icon name={["bolt", "candle", "gem", "flame"][i]} size={28} variant="duo" style={{ color: c }} className={combo >= 10 ? "anim-flame" : ""} /></div>)}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] font-extrabold uppercase text-ink-400"><span>meter</span><span>×{mult} reward</span></div>
        <ProgressBar value={meter} color={meter > 75 ? "gold" : "sky"} h={14} className="mt-1" striped={meter > 75} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-4 font-mono text-sm font-extrabold"><span className="text-flame">combo {combo}</span><span className="text-ink-400">best {best}</span></div>
        <div className="flex gap-2"><Btn v="bear" size="sm" onClick={() => bump1(false)}>Miss</Btn><Btn v="bull" size="sm" onClick={() => bump1(true)}>Hit</Btn></div>
      </div>
    </AssetCard>
  );
}

/* ═════════ FX-06 · Target rush ═════════ */
type Tgt = { id: number; x: number; y: number; born: number };
function TargetRush() {
  const game = useGame();
  const [state, setState] = useState<"ready" | "run" | "done">("ready");
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [tgts, setTgts] = useState<Tgt[]>([]);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; v: number }[]>([]);
  const nextId = useRef(1);
  const timeRef = useRef(20);
  useEffect(() => {
    if (state !== "run") return;
    const tick = window.setInterval(() => {
      timeRef.current -= 1;
      setTime(timeRef.current);
      if (timeRef.current <= 0) { setState("done"); setTgts([]); sfx.play("levelup"); game.reward({ xp: Math.max(5, score / 2), silent: false }); }
    }, 1000);
    const spawn = window.setInterval(() => {
      const id = nextId.current++;
      setTgts((t) => [...t.slice(-4), { id, x: 8 + Math.random() * 78, y: 12 + Math.random() * 66, born: Date.now() }]);
    }, 620);
    return () => { clearInterval(tick); clearInterval(spawn); };
  }, [state]);
  const start = () => { timeRef.current = 20; setTime(20); setScore(0); setHits(0); setShots(0); setTgts([]); nextId.current = 1; setState("run"); feel("whoosh"); };
  const hitTgt = (t: Tgt, e: React.PointerEvent) => {
    setShots((s) => s + 1);
    setTgts((arr) => arr.filter((q) => q.id !== t.id));
    const age = Date.now() - t.born;
    const v = age < 500 ? 30 : age < 1000 ? 20 : 10;
    setScore((s) => s + v);
    setHits((h) => h + 1);
    const id = nextId.current++;
    setPops((p) => [...p, { id, x: e.clientX, y: e.clientY, v }]);
    window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
    sfx.play("pop");
    haptic(10);
  };
  const acc = shots ? Math.round((hits / shots) * 100) : 0;
  return (
    <AssetCard id="FX-06" title="Target Rush · 20s" desc="Арена скорострельности: цели появляются и живут 1.4 с, молодые дают больше очков. Счёт, точность и XP по итогам." tags={["minigame", "aim", "time-attack", "rush"]}>
      <div className="relative h-56 overflow-hidden rounded-2xl bg-ink-950/70 grid-dots">
        {state === "ready" && <div className="grid h-full place-items-center"><div className="text-center"><div className="mb-3 text-lg font-extrabold text-white">Готов?</div><Btn v="bull" size="lg" onClick={start}><Icon name="target" size={18} />Start 20s</Btn></div></div>}
        {state === "run" && (
          <>
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-ink-900/80 px-2.5 py-1.5">
              <Icon name="clock" size={14} className={time <= 5 ? "text-bear anim-heartbeat" : "text-sky"} />
              <span className={cn("font-mono text-sm font-extrabold", time <= 5 ? "text-bear" : "text-white")}>{time}</span>
            </div>
            <div className="absolute right-3 top-3 rounded-xl bg-ink-900/80 px-2.5 py-1.5 font-mono text-sm font-extrabold text-gold">{score}</div>
            {tgts.map((t) => {
              const age = (Date.now() - t.born) / 1400;
              return (
                <button key={t.id} onPointerDown={(e) => hitTgt(t, e)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${t.x}%`, top: `${t.y}%`, animation: "popIn .2s ease both" }}>
                  <span className="block rounded-full" style={{ width: 44, height: 44, background: `conic-gradient(${age < 0.35 ? "#2ee59d" : age < 0.7 ? "#ffc53d" : "#ff4d6a"} 0 ${(1 - age) * 100}%, transparent 0)` , animation: "rays 2s linear infinite" }} />
                  <span className="absolute inset-0 grid place-items-center"><span className={cn("grid h-10 w-10 place-items-center rounded-full", age < 0.35 ? "bg-bull" : age < 0.7 ? "bg-gold" : "bg-bear")}><Icon name="target" size={18} className="text-ink-900" /></span></span>
                </button>
              );
            })}
            {pops.map((p) => <span key={p.id} className="pointer-events-none fixed z-50 font-mono text-lg font-extrabold text-gold" style={{ left: p.x, top: p.y, animation: "floatAway .7s ease-out forwards", textShadow: "0 0 12px #ffc53d" }}>+{p.v}</span>)}
          </>
        )}
        {state === "done" && (
          <div className="grid h-full place-items-center">
            <div className="anim-pop text-center">
              <div className="font-mono text-4xl font-extrabold text-gold">{score}</div>
              <div className="mb-3 text-xs font-bold text-ink-300">{hits} целей · точность {acc}% · +{Math.max(5, Math.round(score / 2))} XP</div>
              <Btn v="bull" size="sm" onClick={start}>Again</Btn>
            </div>
          </div>
        )}
      </div>
    </AssetCard>
  );
}

export default function GameFx() {
  const g = useGame();
  void g;
  return (
    <Section id="gamefx" num="22" title="Celebrations & Reward FX" subtitle="Дождь XP, сейф с монетами, слоты, заряд-выстрел, комбо-метр, рейш по целям">
      <XPRain />
      <CoinVault />
      <SlotMachine />
      <ChargeFire />
      <ComboMeter />
      <TargetRush />
    </Section>
  );
}
