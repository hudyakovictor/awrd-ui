import { useState } from "react";
import { Asset, Bar, Btn, Confetti, FloatText, Label, Section, useAnimatedNumber } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

export function Avatar({ name, size = 40, ring, status, hue = 210 }: { name: string; size?: number; ring?: "gold" | "violet" | "sky" | "bull" | "none"; status?: "on" | "away" | "off"; hue?: number }) {
  const rc = { gold: "#ffc53d", violet: "#9b6bff", sky: "#3da5ff", bull: "#22d38a", none: "transparent" }[ring ?? "none"];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full p-[3px]" style={{ background: ring && ring !== "none" ? `conic-gradient(${rc}, ${rc}55, ${rc})` : "transparent" }}>
        <div className="w-full h-full rounded-full grid place-items-center font-black text-white border-2 border-ink-850" style={{ background: `linear-gradient(160deg, hsl(${hue} 85% 62%), hsl(${hue + 30} 70% 40%))`, fontSize: size * 0.36, textShadow: "0 1px 0 rgba(0,0,0,.25)" }}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      </div>
      {status && <span className={cn("absolute bottom-0 right-0 rounded-full border-[3px] border-ink-800", status === "on" ? "bg-bull" : status === "away" ? "bg-gold" : "bg-ink-500")} style={{ width: size * 0.3, height: size * 0.3 }} />}
    </div>
  );
}

const TIER = {
  bronze: ["#f0b27a", "#b0662c", "#6e3a12"],
  silver: ["#eef3ff", "#a9b8d6", "#5b6b8c"],
  gold: ["#ffe08a", "#f5b01c", "#8a5a00"],
  diamond: ["#b5f0ff", "#3da5ff", "#1a56a8"],
  legend: ["#d8c6ff", "#9b6bff", "#4f2bb0"],
  locked: ["#2b4380", "#1f3468", "#122049"],
} as const;
export function Medal({ tier, icon, size = 64, level }: { tier: keyof typeof TIER; icon: string; size?: number; level?: number }) {
  const [a, b, c] = TIER[tier];
  const id = `md-${tier}`;
  return (
    <div className="relative" style={{ width: size, height: size * 1.1 }}>
      <svg viewBox="0 0 100 110" className="absolute inset-0 w-full h-full">
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
        <polygon points="50,8 92,31 92,79 50,102 8,79 8,31" fill={c} transform="translate(0,5)" />
        <polygon points="50,4 92,27 92,75 50,98 8,75 8,27" fill={`url(#${id})`} stroke={c} strokeWidth="3" />
        <polygon points="50,16 81,33 81,69 50,86 19,69 19,33" fill="rgba(0,0,0,.15)" />
        <path d="M22 30 L50 14 L78 30" stroke="rgba(255,255,255,.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center" style={{ paddingBottom: size * 0.08, color: tier === "locked" ? "#4b5f8f" : "#fff" }}>
        <Icon name={tier === "locked" ? "lock" : icon} size={size * 0.38} stroke={2.5} />
      </div>
      {level !== undefined && tier !== "locked" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 num text-[9px] font-black px-1.5 rounded-md bg-ink-900 border border-white/15">LV{level}</span>}
    </div>
  );
}

/* GMF-01 */
function XPLevel() {
  const [xp, setXp] = useState(340);
  const [lvl, setLvl] = useState(7);
  const [up, setUp] = useState(0);
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  const need = 400 + lvl * 50;
  const add = (n: number) => {
    setPops((p) => [...p.slice(-4), { id: Date.now() + Math.random(), text: `+${n} XP` }]);
    const nx = xp + n;
    if (nx >= need) { setXp(nx - need); setLvl(lvl + 1); setUp((u) => u + 1); } else setXp(nx);
  };
  const shown = useAnimatedNumber(xp, 500);
  return (
    <Asset code="GMF-01" title="XP & Level" desc="Level badge, XP rail with floating gains and a full level-up celebration overlay." tags={["level-up", "overlay"]}>
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative"><Medal tier="gold" icon="bolt" size={68} /><span className="absolute inset-0 grid place-items-center num text-xl font-black text-[#5a3a00] pb-1">{lvl}</span></div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-mist">Level {lvl} · Chart Reader</div>
            <div className="flex items-baseline gap-1 relative"><span className="num text-2xl font-black text-gold">{Math.round(shown)}</span><span className="num text-sm text-mist">/ {need} XP</span><FloatText items={pops} /></div>
          </div>
        </div>
        <Bar value={(shown / need) * 100} color="gold" h={18} />
        <div className="flex justify-between text-[10px] text-mist mt-1.5 mb-4"><span>LV {lvl}</span><span>{need - xp} XP to LV {lvl + 1}</span></div>
        <div className="grid grid-cols-3 gap-2 mt-auto">
          {[10, 50, 150].map((n) => <Btn key={n} variant="gold" size="sm" onClick={() => add(n)}>+{n}</Btn>)}
        </div>
        {up > 0 && (
          <div key={up} className="absolute -inset-2 rounded-2xl bg-ink-900/85 backdrop-blur-sm grid place-items-center z-20 anim-rise" onClick={() => setUp(0)}>
            <Confetti burst={up} count={44} />
            <div className="text-center">
              <div className="anim-bounce-in inline-block relative"><Medal tier="gold" icon="bolt" size={100} /><span className="absolute inset-0 grid place-items-center num text-3xl font-black text-[#5a3a00] pb-2">{lvl}</span></div>
              <div className="text-3xl font-black text-grad-gold mt-2">LEVEL UP!</div>
              <div className="text-sm text-fog mb-4">Unlocked: <b>Advanced Patterns</b></div>
              <Btn variant="gold" size="sm" onClick={() => setUp(0)}>Awesome</Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* GMF-02 */
function Streak() {
  const D = ["M", "T", "W", "T", "F", "S", "S"];
  const [done, setDone] = useState([true, true, true, true, false, false, false]);
  const [count, setCount] = useState(12);
  const [freeze, setFreeze] = useState(true);
  const [burst, setBurst] = useState(0);
  const today = done.indexOf(false);
  return (
    <Asset code="GMF-02" title="Daily Streak" desc="Flame scales with streak, weekly tracker stamps days, streak-freeze consumable." tags={["flame", "habit"]}>
      <div className="relative flex items-center gap-4 mb-5">
        <Confetti burst={burst} />
        <div className="relative w-20 h-24 grid place-items-center">
          <div className="absolute inset-0 rounded-full bg-flame/25 blur-2xl anim-glow" />
          <svg viewBox="0 0 64 80" className="relative anim-flicker" style={{ width: 56 + Math.min(20, count), height: 70 + Math.min(20, count) }}>
            <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd560" /><stop offset=".5" stopColor="#ff8a3d" /><stop offset="1" stopColor="#ff4b6e" /></linearGradient></defs>
            <path d="M32 78c16 0 28-11 28-27 0-15-11-22-15-38-7 7-10 14-10 22-4-4-7-8-7-15C16 28 4 40 4 51c0 16 12 27 28 27z" fill="url(#fl)" />
            <path d="M32 76c8 0 14-6 14-14 0-8-6-12-8-20-4 4-6 8-6 12-2-2-3-4-3-7-6 5-11 10-11 15 0 8 6 14 14 14z" fill="#ffe7a0" />
          </svg>
        </div>
        <div>
          <div key={count} className="num text-5xl font-black text-flame anim-pop">{count}</div>
          <div className="text-sm font-extrabold uppercase tracking-wider">day streak</div>
        </div>
      </div>
      <div className="well p-3 grid grid-cols-7 gap-1.5 mb-4">
        {D.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={cn("text-[10px] font-black", i === today ? "text-flame" : "text-mist")}>{d}</span>
            <span className={cn("w-8 h-8 rounded-full grid place-items-center transition-all", done[i] ? "bg-gradient-to-b from-[#ffa25e] to-[#ff6f1f] shadow-[0_3px_0_#b84a10] text-white" : i === today ? "border-2 border-dashed border-flame/70 anim-breathe" : "bg-ink-700")}>
              {done[i] && <Icon name="check" size={14} stroke={3.5} className="anim-pop" />}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-auto">
        <button onClick={() => setFreeze(!freeze)} className={cn("tile !rounded-xl px-3 h-12 flex items-center gap-2 text-xs font-bold transition-all", freeze ? "!border-sky/60 text-sky" : "text-mist opacity-60")}>🧊 Freeze {freeze ? "ON" : "OFF"}</button>
        <Btn variant="flame" block disabled={today === -1} onClick={() => { const n = [...done]; n[today] = true; setDone(n); setCount(count + 1); setBurst((b) => b + 1); }}>{today === -1 ? "Week done!" : "Extend streak"}</Btn>
      </div>
    </Asset>
  );
}

/* GMF-03 */
function Quests() {
  const [q, setQ] = useState([{ t: "Earn 50 XP", icon: "bolt", c: 30, m: 50, col: "gold" as const }, { t: "Finish 3 lessons", icon: "book", c: 2, m: 3, col: "sky" as const }, { t: "Place 1 demo trade", icon: "candles", c: 0, m: 1, col: "bull" as const }]);
  const [claimed, setClaimed] = useState<number[]>([]);
  const [pops, setPops] = useState<{ id: number; text: string; color?: string }[]>([]);
  const inc = (i: number) => setQ(q.map((x, k) => (k === i ? { ...x, c: Math.min(x.m, x.c + Math.ceil(x.m / 3)) } : x)));
  return (
    <Asset code="GMF-03" title="Daily Quests" desc="Progress rails per quest; completion morphs the action into a Claim chest with gem burst." tags={["quests", "claim"]}>
      <div className="flex items-center justify-between mb-3"><span className="text-xs text-mist flex items-center gap-1"><Icon name="clock" size={14} /> Resets in <b className="num text-fog">7h 21m</b></span><span className="relative text-xs font-black text-sky flex items-center gap-1"><Icon name="gem" size={14} fill="currentColor" />+{claimed.length * 20}<FloatText items={pops} /></span></div>
      <div className="space-y-2.5">
        {q.map((x, i) => {
          const full = x.c >= x.m; const cl = claimed.includes(i);
          return (
            <div key={x.t} className={cn("tile p-3 flex items-center gap-3 transition-all", cl && "opacity-60")}>
              <div className={cn("w-10 h-10 rounded-xl grid place-items-center shrink-0", { gold: "bg-gold/15 text-gold", sky: "bg-sky/15 text-sky", bull: "bg-bull/15 text-bull" }[x.col])}><Icon name={x.icon} size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold mb-1.5 truncate">{x.t}</div>
                <div className="relative"><Bar value={(x.c / x.m) * 100} color={x.col} h={14} /><span className="absolute inset-0 grid place-items-center num text-[9px] font-black text-white drop-shadow">{x.c}/{x.m}</span></div>
              </div>
              {cl ? <Icon name="check" size={22} stroke={3} className="text-bull anim-pop" /> : full ? (
                <button onClick={() => { setClaimed([...claimed, i]); setPops((p) => [...p, { id: Date.now(), text: "+20", color: "#3da5ff" }]); }} className="btn3d v-gold w-11 h-11 !p-0 !rounded-xl anim-wiggle" style={{ ["--lip" as string]: "4px" }}><Icon name="gift" size={20} /></button>
              ) : (
                <button onClick={() => inc(i)} className="btn3d v-ghost w-11 h-11 !p-0 !rounded-xl" style={{ ["--lip" as string]: "4px" }}><Icon name="plus" size={18} stroke={3} /></button>
              )}
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* GMF-04 */
function Achievements() {
  const init = [
    { n: "First Trade", tier: "bronze", icon: "candles", d: "Place your first demo trade", lv: 1 },
    { n: "Chart Reader", tier: "silver", icon: "chart", d: "Identify 25 patterns", lv: 2 },
    { n: "Diamond Hands", tier: "diamond", icon: "gem", d: "Hold a position 30 days", lv: 3 },
    { n: "Risk Master", tier: "gold", icon: "shield", d: "10 trades with stop-loss", lv: 3 },
    { n: "Whale Watcher", tier: "locked", real: "legend", icon: "eye", d: "Spot 5 whale moves", lv: 1 },
    { n: "Streak Lord", tier: "locked", real: "gold", icon: "flame", d: "Keep a 100-day streak", lv: 1 },
    { n: "Sharpshooter", tier: "locked", real: "diamond", icon: "target", d: "90% quiz accuracy", lv: 1 },
    { n: "Legend", tier: "locked", real: "legend", icon: "crown", d: "Reach Legend league", lv: 1 },
  ] as { n: string; tier: keyof typeof TIER; real?: keyof typeof TIER; icon: string; d: string; lv: number }[];
  const [items, setItems] = useState(init);
  const [sel, setSel] = useState(0);
  const [burst, setBurst] = useState(0);
  const click = (i: number) => {
    setSel(i);
    if (items[i].tier === "locked") { setItems(items.map((x, k) => (k === i ? { ...x, tier: x.real! } : x))); setBurst((b) => b + 1); }
  };
  const s = items[sel];
  return (
    <Asset code="GMF-04" title="Achievements" desc="Hex medals in 5 tiers + locked. Tap locked medals to simulate unlocking with a burst." tags={["tiers", "unlock"]} span={2}>
      <div className="grid sm:grid-cols-[1fr_220px] gap-5">
        <div className="grid grid-cols-4 gap-3">
          {items.map((m, i) => (
            <button key={m.n} onClick={() => click(i)} className={cn("flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all", sel === i ? "bg-white/5 scale-105" : "hover:bg-white/5")}>
              <div key={m.tier} className={cn(m.tier !== "locked" && "anim-bounce-in", m.tier !== "locked" && sel === i && "anim-float")}><Medal tier={m.tier} icon={m.icon} size={58} level={m.lv} /></div>
              <span className={cn("text-[10px] font-bold text-center leading-tight", m.tier === "locked" ? "text-mist" : "text-fog")}>{m.n}</span>
            </button>
          ))}
        </div>
        <div className="tile p-4 flex flex-col items-center text-center relative">
          <Confetti burst={burst} />
          <div key={sel + s.tier} className="anim-pop sheen rounded-xl"><Medal tier={s.tier} icon={s.icon} size={96} level={s.lv} /></div>
          <div className="font-black text-lg mt-3">{s.n}</div>
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: TIER[s.tier][1] }}>{s.tier}</div>
          <p className="text-xs text-mist mb-3">{s.d}</p>
          <div className="w-full"><Bar value={s.tier === "locked" ? 20 : 100} color={s.tier === "locked" ? "sky" : "bull"} h={10} /></div>
        </div>
      </div>
    </Asset>
  );
}

/* GMF-05 */
function League() {
  const [rows, setRows] = useState([
    { n: "CryptoKat", xp: 1840, h: 330 }, { n: "SatoshiJr", xp: 1720, h: 20 }, { n: "MoonMia", xp: 1655, h: 280 },
    { n: "You", xp: 1390, h: 210, me: true }, { n: "DegenDan", xp: 1310, h: 150 }, { n: "HODLer", xp: 980, h: 50 }, { n: "PaperHands", xp: 640, h: 0 },
  ] as { n: string; xp: number; h: number; me?: boolean }[]);
  const sorted = [...rows].sort((a, b) => b.xp - a.xp);
  const RH = 52;
  return (
    <Asset code="GMF-05" title="League Leaderboard" desc="Weekly league with promotion/demotion zones. Earn XP and watch rows re-order with smooth FLIP motion." tags={["reorder", "zones"]} className="xl:row-span-2">
      <div className="rounded-2xl p-4 mb-4 text-center relative overflow-hidden bg-gradient-to-b from-[#a886ff] to-[#7a4af0] shadow-[0_5px_0_#4f2bb0,inset_0_2px_0_rgba(255,255,255,.3)]">
        <Medal tier="legend" icon="crown" size={54} />
        <div className="font-black text-lg -mt-1">Amethyst League</div>
        <div className="text-xs text-white/80">Top 3 advance · ends in <span className="num">2d 14h</span></div>
      </div>
      <div className="relative" style={{ height: sorted.length * RH }}>
        {rows.map((r) => {
          const i = sorted.indexOf(r);
          const zone = i < 3 ? "up" : i >= sorted.length - 2 ? "down" : "mid";
          return (
            <div key={r.n} className={cn("absolute inset-x-0 flex items-center gap-3 px-3 rounded-xl transition-all duration-700 ease-[cubic-bezier(.3,1.2,.5,1)]", r.me ? "tile !border-sky/60 z-10" : "")} style={{ top: i * RH, height: RH - 6 }}>
              <span className={cn("num w-6 text-center font-black", i === 0 ? "text-gold" : i === 1 ? "text-fog" : i === 2 ? "text-[#f0b27a]" : "text-mist")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
              <Avatar name={r.n} size={34} hue={r.h} ring={r.me ? "sky" : i === 0 ? "gold" : "none"} />
              <span className={cn("flex-1 font-bold text-sm", r.me && "text-sky")}>{r.n}</span>
              <span className="num text-xs font-bold text-fog">{r.xp.toLocaleString()} XP</span>
              <span className={cn("w-1.5 h-6 rounded-full", zone === "up" ? "bg-bull" : zone === "down" ? "bg-bear" : "bg-transparent")} />
            </div>
          );
        })}
        <div className="absolute inset-x-0 border-t-2 border-dashed border-bull/40" style={{ top: 3 * RH - 4 }}><span className="absolute right-2 -top-2.5 text-[9px] font-black text-bull bg-ink-800 px-1">PROMOTION ZONE ▲</span></div>
        <div className="absolute inset-x-0 border-t-2 border-dashed border-bear/40" style={{ top: (sorted.length - 2) * RH - 4 }}><span className="absolute right-2 -top-2.5 text-[9px] font-black text-bear bg-ink-800 px-1">DEMOTION ZONE ▼</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Btn variant="sky" size="sm" icon="bolt" onClick={() => setRows(rows.map((r) => (r.me ? { ...r, xp: r.xp + 180 } : r)))}>+180 XP</Btn>
        <Btn variant="ghost" size="sm" icon="refresh" onClick={() => setRows(rows.map((r) => (r.me ? { ...r, xp: 1390 } : r)))}>Reset</Btn>
      </div>
    </Asset>
  );
}

/* GMF-06 */
function Chest() {
  const [taps, setTaps] = useState(0);
  const [shake, setShake] = useState(0);
  const open = taps >= 3;
  const tap = () => { if (open) return; setTaps(taps + 1); setShake(shake + 1); };
  return (
    <Asset code="GMF-06" title="Reward Chest" desc="Tap 3× to crack it open: shake build-up, light rays, lid pop and staggered loot reveal." tags={["loot", "tap×3"]}>
      <div className="relative flex-1 grid place-items-center min-h-[200px] overflow-hidden rounded-2xl">
        {open && <div className="absolute left-1/2 top-1/2 w-[400px] h-[400px]" style={{ background: "repeating-conic-gradient(rgba(255,197,61,.28) 0 8deg, transparent 8deg 24deg)", animation: "raysSpin 10s linear infinite", maskImage: "radial-gradient(circle,#000 15%,transparent 60%)", WebkitMaskImage: "radial-gradient(circle,#000 15%,transparent 60%)" }} />}
        <Confetti burst={open ? 1 : 0} count={50} />
        <button onClick={tap} key={shake} className={cn("relative", !open && taps > 0 && "", !open && "hover:scale-105 transition-transform")} style={{ animation: !open && taps > 0 ? `chestShake ${0.3 + taps * 0.1}s ease` : !open ? "float 2.6s ease-in-out infinite" : undefined }} aria-label="Open chest">
          <svg width="130" height="120" viewBox="0 0 130 120">
            <ellipse cx="65" cy="112" rx="46" ry="6" fill="rgba(0,0,0,.35)" />
            <rect x="15" y="52" width="100" height="56" rx="10" fill="#7a4af0" />
            <rect x="15" y="52" width="100" height="50" rx="10" fill="#9b6bff" />
            <rect x="15" y="64" width="100" height="8" fill="#ffc53d" />
            <rect x="57" y="52" width="16" height="56" fill="#ffc53d" />
            <g style={{ transformOrigin: "65px 52px", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)", transform: open ? "translateY(-26px) rotate(-18deg)" : "none" }}>
              <path d="M15 52 Q15 18 65 18 Q115 18 115 52 Z" fill="#a886ff" />
              <path d="M15 52 Q15 22 65 22 Q115 22 115 52" fill="none" stroke="#c9b3ff" strokeWidth="4" />
              <rect x="57" y="18" width="16" height="34" fill="#ffd560" />
              <rect x="54" y="44" width="22" height="16" rx="4" fill="#ffd560" stroke="#b07600" strokeWidth="2" />
            </g>
            {open && <circle cx="65" cy="54" r="16" fill="#fff5c7" opacity=".9"><animate attributeName="r" from="4" to="30" dur=".6s" fill="freeze" /><animate attributeName="opacity" from="1" to="0" dur=".8s" fill="freeze" /></circle>}
          </svg>
        </button>
        {!open && <div className="absolute bottom-2 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all", i < taps ? "bg-gold scale-125" : "bg-ink-600")} />)}</div>}
      </div>
      {open ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[["gem", "+120", "#3da5ff"], ["bolt", "2× XP", "#ffc53d"], ["shield", "Freeze", "#9b6bff"]].map(([i, t, c], k) => (
            <div key={t} className="tile p-2.5 text-center" style={{ animation: `bounceIn .5s ${0.3 + k * 0.15}s both` }}><Icon name={i} size={22} fill={c} stroke={1.5} className="mx-auto" /><div className="num text-xs font-black mt-1" style={{ color: c }}>{t}</div></div>
          ))}
          <button onClick={() => setTaps(0)} className="col-span-3 text-[11px] text-mist hover:text-sky mt-1">↺ reset chest</button>
        </div>
      ) : <Label className="text-center mt-2 mb-0">Tap {3 - taps} more time{3 - taps === 1 ? "" : "s"}</Label>}
    </Asset>
  );
}

/* GMF-07 */
function Heatmap() {
  const [data] = useState(() => Array.from({ length: 12 * 7 }, (_, i) => (Math.random() < 0.18 ? 0 : Math.floor(Math.random() * 4) + (i > 60 ? 1 : 0))));
  const [h, setH] = useState<number | null>(null);
  const col = ["#0f1b3a", "#10432f", "#137a4f", "#1cb574", "#3ce49e"];
  return (
    <Asset code="GMF-07" title="Activity Heatmap" desc="12-week learning heatmap; hover for per-day XP, cascade-in animation." tags={["hover", "habit"]}>
      <div className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-1 mb-3">
        {data.map((v, i) => (
          <div key={i} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={cn("aspect-square rounded-[4px] transition-transform cursor-pointer", h === i && "scale-125 ring-2 ring-white/60")} style={{ background: col[Math.min(4, v)], animation: `pop .3s ${(i % 12) * 0.02 + Math.floor(i / 7) * 0.03}s both`, boxShadow: v ? "inset 0 1px 0 rgba(255,255,255,.15)" : "none" }} />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-mist">
        <span className="h-4">{h !== null ? <b className="text-fog">{data[h] * 25} XP · {84 - h} days ago</b> : "Hover a day"}</span>
        <span className="flex items-center gap-1">Less {col.map((c) => <span key={c} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />)} More</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[["Active days", data.filter(Boolean).length], ["Best week", "1,240"], ["Total XP", "18.4k"]].map(([l, v]) => <div key={l} className="tile !rounded-xl p-2 text-center"><div className="num font-black text-sm text-bull">{v}</div><div className="text-[9px] text-mist uppercase font-bold">{l}</div></div>)}
      </div>
    </Asset>
  );
}

export default function Gamification() {
  return (
    <Section id="gamification" index="06" title="Gamification" subtitle="Motivation systems that keep adults coming back — without feeling childish.">
      <XPLevel />
      <Streak />
      <League />
      <Quests />
      <Chest />
      <Achievements />
      <Heatmap />
    </Section>
  );
}
