import { useEffect, useRef, useState, type ReactNode } from "react";
import { Asset, Avatar, Badge, Btn3D, CountUp, Ring, Section, Toggle } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx, isSfxEnabled, setSfxEnabled } from "../utils/sfx";
import { isMusicOn, setMusicEnabled, setMusicVolume } from "../utils/music";
import { burstAtEl, burstCoins, burstConfetti, celebrate } from "../utils/fx";
import { MASCOT_IMG } from "./Mascot";

/* ================= PHONE FRAME ================= */
export function Phone({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-full max-w-[300px] aspect-[9/18.4] rounded-[42px] border-[9px] border-[#101d44] bg-ink-900 shadow-[0_14px_0_#081028,0_36px_70px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.08)] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#101d44] rounded-b-2xl z-30" />
        {children}
      </div>
      {label && <div className="mt-3 label-caps">{label}</div>}
    </div>
  );
}

/* ================= HOME ================= */
function HomeScreen() {
  const [streak, setStreak] = useState(47);
  const [gems, setGems] = useState(1280);
  const ref = useRef<HTMLButtonElement>(null);
  const units: { t: string; s: string; g: "gem" | "rocket" | "shield"; col: string; lip: string; p: number }[] = [
    { t: "Основы рынка", s: "5/8 уроков", g: "gem", col: "from-[#3d7bff] to-[#27408a]", lip: "#1a2a5c", p: 62 },
    { t: "Свечной анализ", s: "В процессе", g: "rocket", col: "from-[#1fdb8b] to-[#0d9a5c]", lip: "#086b41", p: 30 },
    { t: "Риск-менеджмент", s: "Закрыто", g: "shield", col: "from-[#243870] to-[#1b2c5e]", lip: "#0b1536", p: 0 },
  ];
  return (
    <Phone label="Home">
      <div className="absolute inset-0 flex flex-col pt-8 px-3.5 pb-3 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <button className="size-9 rounded-xl grid place-items-center bg-ink-850" ref={ref}>
            <span className="size-6 rounded-full bg-gradient-to-b from-[#ffb547] to-[#f7931a] grid place-items-center text-white shadow-[0_2px_0_#b8650a]"><Icon name="bitcoin" size={13} stroke={2.8} /></span>
          </button>
          <button onClick={() => { setStreak(streak + 1); burstAtEl(ref.current?.closest("div") ?? null, "ring", "#ff9a3d"); sfx.coin(); }} className="relative h-9 px-2.5 rounded-xl bg-ink-850 flex items-center gap-1 font-extrabold text-[12px] num text-[#ff9a3d]">
            <span key={streak} className="anim-pop"><Glyph name="flame" size={16} /></span>{streak}
          </button>
          <button onClick={() => { setGems(gems + 10); sfx.coin(); }} className="relative h-9 px-2.5 rounded-xl bg-ink-850 flex items-center gap-1 font-extrabold text-[12px] num text-cyan">
            <span key={gems} className="anim-pop"><Glyph name="gem" size={16} /></span>{gems}
          </button>
          <span className="ml-auto h-9 px-2.5 rounded-xl bg-ink-850 flex items-center gap-1 font-extrabold text-[12px] num text-bear"><Glyph name="heart" size={16} />5</span>
        </div>

        <button onClick={() => { const r = ref.current?.getBoundingClientRect(); if (r) burstConfetti(r.left + r.width / 2, r.top, 18, 0.5); sfx.success(); }}
          className="mt-4 w-full rounded-2xl bg-gradient-to-b from-[#1fdb8b] to-[#12c47a] p-3 text-left shadow-[0_5px_0_#0d9a5c,inset_0_2px_0_rgba(255,255,255,.3)] active:translate-y-[5px] active:shadow-[0_0_0_#0d9a5c] transition-all hover:brightness-105 relative overflow-hidden">
          <div className="shine absolute inset-0" />
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#03261a]/70">Continue</div>
          <div className="text-[16px] font-extrabold text-[#03261a]">Свечной анализ</div>
          <div className="mt-2 h-2.5 rounded-full bg-[#03261a]/20 overflow-hidden"><div className="h-full w-[30%] rounded-full bg-white/90 relative"><i className="absolute inset-x-1 top-[2px] h-[3px] rounded-full bg-white" /></div></div>
        </button>

        <div className="label-caps mt-4 mb-2">Units</div>
        <div className="flex-1 space-y-2.5 overflow-y-auto [scrollbar-width:none]">
          {units.map((u, i) => (
            <button key={u.t} onClick={() => u.s !== "Закрыто" && sfx.tap()}
              className={cn("w-full rounded-2xl bg-gradient-to-br p-3 text-left shadow-[0_4px_0_var(--lip),inset_0_2px_0_rgba(255,255,255,.18)] active:translate-y-[4px] active:shadow-[0_0_0_var(--lip)] transition-all anim-fade relative overflow-hidden", u.col)}
              style={{ ["--lip" as string]: u.lip, animationDelay: `${i * 80}ms` }}>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-15"><Icon name="candles" size={64} stroke={1.4} className="text-white" /></div>
              <div className="flex items-center gap-2.5">
                <span className="size-10 rounded-xl bg-black/25 grid place-items-center shadow-inner">{u.s === "Закрыто" ? <Icon name="lock" size={18} className="text-white/60" /> : <Glyph name={u.g} size={26} />}</span>
                <span className="flex-1">
                  <span className="block text-[13px] font-extrabold text-white drop-shadow">{u.t}</span>
                  <span className="block text-[10px] font-bold text-white/70">{u.s}</span>
                </span>
                <Icon name="chevR" size={16} className="text-white/70" />
              </div>
              {u.p > 0 && <div className="mt-2 h-1.5 rounded-full bg-black/25"><div className="h-full rounded-full bg-white/90" style={{ width: `${u.p}%` }} /></div>}
            </button>
          ))}
          <div className="rounded-2xl border-2 border-gold/40 bg-gold/10 p-3 flex items-center gap-2.5">
            <Glyph name="crown" size={26} />
            <div className="flex-1"><div className="text-[12px] font-extrabold text-gold">Tradelingo Pro</div><div className="text-[10px] font-bold text-mute">Безлимитные сердца и Pro-сигналы</div></div>
            <span className="text-[10px] font-extrabold bg-gold text-ink-900 rounded-lg px-2 py-1">GO</span>
          </div>
        </div>

        <div className="mt-2.5 h-[62px] rounded-2xl bg-[#13224e] shadow-[0_4px_0_#081028] grid grid-cols-5 p-1.5 relative overflow-hidden">
          <div className="absolute top-1 bottom-1 left-1 w-[calc(20%-8px)] rounded-xl bg-blue/20 border-2 border-blue/50 transition-all duration-300" />
          {[["home", "text-blue"], ["dumbbell", "text-dim"], ["candles", "text-dim"], ["trophy", "text-dim"], ["user", "text-dim"]].map(([ic, c], i) => (
            <span key={ic} className={cn("grid place-items-center", c)}><Icon name={ic} size={20} stroke={i === 0 ? 2.6 : 2} /></span>
          ))}
        </div>
      </div>
    </Phone>
  );
}

/* ================= ONBOARDING ================= */
function OnboardScreen() {
  const [i, setI] = useState(0);
  const S = [
    { img: "idle" as const, t: "Рынок — не казино", d: "Учись читать свечи, уровни и риск — по 5 минут в день." },
    { img: "idle" as const, t: "Демо-баланс $10 000", d: "Практикуй реальные ордеры, не рискуя ни долларом." },
    { img: "cheer" as const, t: "Лиги и серии", d: "Обгоняй 30 трейдеров в неделю и забирай награды." },
  ];
  const s = S[i];
  return (
    <Phone label="Onboarding">
      <div className="absolute inset-0 flex flex-col p-4">
        <div className="flex justify-end"><button className="size-8 grid place-items-center rounded-lg text-dim hover:text-txt"><Icon name="x" size={16} /></button></div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div key={i} className="w-36 h-36 anim-scale"><img src={MASCOT_IMG[s.img]} alt="" className="w-full h-full object-contain anim-float" draggable={false} /></div>
          <h4 key={"t" + i} className="text-[19px] font-extrabold mt-3 anim-fade">{s.t}</h4>
          <p key={"d" + i} className="text-[12px] text-mute mt-2 anim-fade leading-relaxed max-w-[210px]">{s.d}</p>
        </div>
        <div className="flex justify-center gap-1.5 mb-4">
          {S.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("h-2 rounded-full transition-all duration-300", k === i ? "w-6 bg-bull shadow-[0_2px_0_#0d9a5c]" : "w-2 bg-[#22366f]")} />)}
        </div>
        {i < S.length - 1
          ? <Btn3D full variant="blue" size="md" onClick={() => { setI(i + 1); sfx.whoosh(); }}>Next</Btn3D>
          : <Btn3D full variant="bull" size="md" icon={<Icon name="bolt" size={16} />} onClick={() => { celebrate(); }}>Start learning</Btn3D>}
      </div>
    </Phone>
  );
}

/* ================= PAYWALL ================= */
function PaywallScreen() {
  const [plan, setPlan] = useState<"m" | "y">("y");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const buy = () => {
    if (state !== "idle") return;
    setState("busy"); sfx.whoosh();
    setTimeout(() => { setState("done"); celebrate(); sfx.success(); haptic([30, 40, 60]); }, 1400);
  };
  const feats = [["heart", "Безлимитные сердца"], ["eye", "Скрыть рекламу навсегда"], ["candles", "Pro-сигналы и уроки"], ["gem", "x2 XP на все уроки"]];
  return (
    <Phone label="Pro Paywall">
      <div className="absolute inset-0 flex flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-gold font-extrabold text-[14px]"><Glyph name="crown" size={20} />Tradelingo Pro</span>
          <button className="size-8 grid place-items-center rounded-lg text-dim"><Icon name="x" size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] pt-3 pb-3">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#8d5cff] to-[#5a2fcc] p-3.5 text-white shadow-[0_4px_0_#3a1b9e,inset_0_2px_0_rgba(255,255,255,.25)]">
            <img src={MASCOT_IMG.cheer} alt="" className="absolute -right-2 -bottom-1 w-20 h-20 object-contain anim-float" draggable={false} />
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Скидка 50% только сегодня</div>
            <div className="text-[17px] font-extrabold">Торгуй как профи</div>
          </div>
          <div className="space-y-2.5 mt-3.5">
            {feats.map(([ic, t]) => (
              <div key={t} className="flex items-center gap-2.5 text-[12px] font-bold">
                <span className="size-7 rounded-lg bg-bull/15 text-bull grid place-items-center border border-bull/30"><Icon name={ic} size={14} stroke={2.6} /></span>{t}
              </div>
            ))}
          </div>
          <div className="inset !rounded-2xl p-1.5 grid grid-cols-2 mt-4 relative">
            <div className={cn("absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_3px_0_#0b1536,inset_0_1px_0_rgba(255,255,255,.15)] transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]", plan === "m" ? "translate-x-[calc(100%+8px)]" : "")} />
            {(
              [["y", "Год", "$59.99", "$119.99", "BEST VALUE"], ["m", "Месяц", "$9.99", "$14.99", ""]] as const
            ).map(([k, l, p, old, b]) => (
              <button key={k} onClick={() => { setPlan(k); sfx.tick(); }} className={cn("relative z-10 h-[72px] rounded-xl p-2 text-left", plan === k ? "text-white" : "text-mute")}>
                <div className="text-[10px] font-extrabold uppercase">{l}</div>
                <div className="num text-[15px] font-extrabold">{p}</div>
                <div className="flex items-center justify-between">
                  <span className="num text-[9px] line-through opacity-60">{old}</span>
                  {b && <span className="text-[8px] font-extrabold bg-gold text-ink-900 rounded px-1">{b}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          {state === "done" ? (
            <div className="rounded-2xl bg-bull/15 border-2 border-bull p-3 text-center anim-pop">
              <div className="flex justify-center mb-1"><Glyph name="crown" size={30} /></div>
              <div className="text-[13px] font-extrabold text-bull">Pro активирован</div>
            </div>
          ) : (
            <Btn3D full variant="violet" loading={state === "busy"} onClick={buy}>{state === "busy" ? "Processing…" : `Start ${plan === "y" ? "14-day" : "3-day"} trial`}</Btn3D>
          )}
          <button className="mt-2 w-full text-center text-[10.5px] font-bold text-dim">Restore purchases</button>
        </div>
      </div>
    </Phone>
  );
}

/* ================= PROFILE (live settings!) ================= */
function ProfileScreen() {
  const [sfxOn, setSfxOn] = useState(isSfxEnabled());
  const [musOn, setMusOn] = useState(isMusicOn());
  const [musVol, setMusVol] = useState(50);
  const [notif, setNotif] = useState(true);
  const [hapt, setHapt] = useState(true);
  const toastRef = useRef<HTMLDivElement>(null);
  return (
    <Phone label="Profile · живые настройки">
      <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-center gap-3">
          <div className="relative"><Avatar name="You Me" size={52} status="online" /><span className="absolute -bottom-1 left-1/2 -translate-x-1/2"><Glyph name="crown" size={16} /></span></div>
          <div className="flex-1">
            <div className="font-extrabold text-[15px]">SatoshiN</div>
            <div className="text-[10.5px] text-dim font-bold">в игре с 2025 · Level 12</div>
          </div>
          <Ring value={64} size={54} stroke={7} tone="#ffc53d" tone2="#ff9a3d"><span className="num text-[12px] font-extrabold text-gold">12</span></Ring>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {([["47", "streak", "text-[#ff9a3d]"], ["142", "trade", "text-blue"], ["68%", "win", "text-bull"], ["37", "lesson", "text-violet"]] as const).map(([v, l, c]) => (
            <div key={l} className="inset !rounded-xl p-2 text-center"><div className={cn("num text-[15px] font-extrabold", c)}>{v}</div><div className="text-[8.5px] font-extrabold uppercase text-dim">{l}</div></div>
          ))}
        </div>

        <div className="label-caps mt-4 mb-2">Значки</div>
        <div className="flex gap-2">
          {(["gem", "rocket", "shield", "star", "flame"] as const).map((g, i) => (
            <span key={g} className="size-11 rounded-xl bg-ink-850 grid place-items-center shadow-[inset_0_2px_5px_rgba(0,0,0,.4)] anim-pop" style={{ animationDelay: `${i * 70}ms` }}><Glyph name={g} size={26} dim={i > 2} /></span>
          ))}
        </div>

        <div className="label-caps mt-4 mb-2">Настройки (управляют этим каталогом)</div>
        <div className="inset !rounded-2xl divide-y divide-white/5">
          {[
            { l: "Звуковые эффекты", v: sfxOn, set: (v: boolean) => { setSfxOn(v); setSfxEnabled(v); if (v) sfx.pop(); }, tone: "blue" as const },
            { l: "Фоновая музыка", v: musOn, set: (v: boolean) => { setMusOn(v); setMusicEnabled(v); }, tone: "violet" as const },
            { l: "Push-уведомления", v: notif, set: setNotif, tone: "gold" as const },
            { l: "Вибрация", v: hapt, set: (v: boolean) => { setHapt(v); if (v) haptic(10); }, tone: "bull" as const },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[12px] font-bold">{r.l}{r.v && r.l === "Фоновая музыка" && <Badge tone="violet" size="xs" className="ml-2">playing</Badge>}</span>
              <Toggle size="sm" on={r.v} onChange={r.set} tone={r.tone} />
            </div>
          ))}
        </div>
        {musOn && (
          <div className="flex items-center gap-2.5 mt-2.5 px-1 anim-fade">
            <Icon name="volume" size={13} className="text-dim" />
            <input type="range" min={0} max={100} value={musVol} onChange={(e) => { const v = +e.target.value; setMusVol(v); setMusicVolume(v / 100); }} className="flex-1 accent-[#8d5cff]" />
            <span className="num text-[10px] font-bold text-mute w-7">{musVol}%</span>
          </div>
        )}
        <div ref={toastRef} className="mt-auto pt-4 flex gap-2">
          <Btn3D size="sm" variant="neutral" full onClick={() => { const r = toastRef.current?.getBoundingClientRect(); if (r) { burstCoins(r.left + r.width / 2, r.top, 10); } sfx.coin(); }}>Test FX</Btn3D>
          <Btn3D size="sm" variant="bear" icon={<Icon name="logout" size={14} />}>Exit</Btn3D>
        </div>
      </div>
    </Phone>
  );
}

/* ================= LEADERBOARD ================= */
function LeagueScreen() {
  const players = [
    { n: "Satoshi N", xp: 2450, you: false }, { n: "Cathie W", xp: 2310, you: false },
    { n: "You", xp: 2140, you: true }, { n: "Vitalik B", xp: 1980, you: false },
    { n: "Anna K", xp: 1720, you: false }, { n: "Mike S", xp: 1510, you: false }, { n: "Dana R", xp: 1330, you: false },
  ];
  const [tab, setTab] = useState<"f" | "g">("f");
  const top3 = players.slice(0, 3);
  const [t, setT] = useState(2 * 86400 + 14 * 3600);
  useEffect(() => { const h = setInterval(() => setT((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(h); }, []);
  const hh = Math.floor(t / 3600), mm = Math.floor((t % 3600) / 60), ss = t % 60;
  return (
    <Phone label="Sapphire League">
      <div className="absolute inset-0 flex flex-col p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-cyan"><Glyph name="gem" size={22} /><span className="font-extrabold text-[16px]">Sapphire League</span></div>
          <div className="num text-[11px] font-bold text-mute mt-0.5">Season ends in {hh}h {mm}m {ss}s</div>
        </div>
        <div className="relative mt-3 h-[118px]">
          {[[1, 1], [0, 0], [2, 2]].map(([i, order]) => {
            const p = top3[i];
            const H = [78, 62, 50][i];
            const medal = ["#ffc53d", "#c9d5f5", "#d08a3d"][i];
            return (
              <div key={i} className="absolute bottom-0 flex flex-col items-center transition-all" style={{ left: `calc(${[16, 40, 64][i]}% )`, zIndex: order }}>
                <Avatar name={p.n} size={i === 1 ? 46 : 38} status={p.you ? "online" : undefined} />
                {i === 1 && <span className="absolute -top-4"><Glyph name="crown" size={18} /></span>}
                <div className="w-[72px] rounded-t-xl mt-1 grid place-items-start justify-center pt-1.5" style={{ height: H, background: `linear-gradient(180deg, ${medal}33, #13224e)`, boxShadow: `inset 0 2px 0 ${medal}66, 0 -4px 12px rgba(0,0,0,.3)`, clipPath: "polygon(0 14px, 50% 0, 100% 14px, 100% 100%, 0 100%)" }}>
                  <span className="num text-[13px] font-extrabold" style={{ color: medal }}>{i + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="inset !rounded-xl p-1.5 grid grid-cols-2 relative mt-2">
          <div className={cn("absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_2px_0_#0b1536] transition-transform duration-300", tab === "g" ? "translate-x-[calc(100%+8px)]" : "")} />
          <button onClick={() => { setTab("f"); sfx.tick(); }} className={cn("relative z-10 h-8 rounded-lg text-[11px] font-extrabold", tab === "f" ? "text-white" : "text-mute")}>Friends</button>
          <button onClick={() => { setTab("g"); sfx.tick(); }} className={cn("relative z-10 h-8 rounded-lg text-[11px] font-extrabold", tab === "g" ? "text-white" : "text-mute")}>Global</button>
        </div>
        <div className="flex-1 mt-2 space-y-1 overflow-y-auto [scrollbar-width:none]">
          {players.map((p, i) => (
            <div key={p.n} className={cn("flex items-center gap-2 rounded-xl px-2 py-1.5 anim-fade", p.you ? "bg-blue/20 border border-blue/50" : "hover:bg-white/5")} style={{ animationDelay: `${i * 50}ms` }}>
              <span className={cn("num w-4 text-center text-[12px] font-extrabold", i < 3 ? "text-gold" : "text-mute")}>{i + 1}</span>
              <Avatar name={p.n} size={28} />
              <span className="flex-1 text-[12px] font-bold">{p.n}{p.you && <span className="text-blue"> (you)</span>}</span>
              <CountUp value={p.xp} suffix=" XP" className="text-[11px] num font-bold text-mute" />
            </div>
          ))}
          <div className="border-t-2 border-dashed border-bear/40 pt-1.5 text-center text-[9px] font-extrabold text-bear uppercase tracking-wider">Demotion line</div>
          <div className="h-2" />
        </div>
        <Btn3D size="sm" variant="violet" full onClick={() => { burstAtEl(null, "ring", "#8d5cff"); sfx.pop(); }}>Daily bonus +50 XP</Btn3D>
      </div>
    </Phone>
  );
}

export default function Screens() {
  return (
    <Section id="screens" index="18" title="Game Screens" subtitle="Собранные экраны игры в телефонных фреймах — home, онбординг, paywall, профиль, лига" count={5}>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <Asset title="Home" id="scr.home" desc="HUD, continue-кнопка, юниты, Pro-баннер, таб-бар. Всё кликабельно."><HomeScreen /></Asset>
        <Asset title="Onboarding" id="scr.onboard" desc="3 слайда с маскотом. Финиш запускает celebrate()."><OnboardScreen /></Asset>
        <Asset title="Pro Paywall" id="scr.paywall" desc="Сегмент планов, процессинг покупки, успех + конфетти."><PaywallScreen /></Asset>
        <Asset title="Profile" id="scr.profile" desc="Настройки здесь настоящие: SFX и музыка управляются самим каталогом." tags={["LIVE"]}><ProfileScreen /></Asset>
        <Asset title="League" id="scr.league" desc="Подиум с медальями, живой таймер сезона, zones."><LeagueScreen /></Asset>
      </div>
    </Section>
  );
}
