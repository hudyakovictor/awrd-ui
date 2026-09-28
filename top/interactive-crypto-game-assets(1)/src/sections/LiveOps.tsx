/* ------------------------------------------------------------------
 * 24 · LIVE OPS — events, flash challenges, rotating shops, banners
 * ------------------------------------------------------------------ */
import { Bell, Flame, Gem, Radio, Rocket, Swords, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Card, Tag } from "../components/ui";
import { GameSection, TimerRing } from "../fx/gamekit";
import { Reveal, VelocityMarquee } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

const events = [
  { t: "Flash Duel Hour", s: "2× ranking points", c: "#ff5470", left: 3600, icon: Swords },
  { t: "Candle Marathon", s: "50 questions · global board", c: "#F7931A", left: 7200, icon: Flame },
  { t: "Gem Rain", s: "Login every hour · 5 times", c: "#5b8cff", left: 1800, icon: Gem },
  { t: "Boss Rush", s: "3 bosses · one life", c: "#a78bff", left: 5400, icon: Rocket },
];

const shop = [
  { t: "Streak Freeze", p: 200, c: "#5b8cff" },
  { t: "2× XP 1h", p: 150, c: "#8ef23c" },
  { t: "Heart Refill", p: 120, c: "#ff5470" },
  { t: "Rare Pack", p: 300, c: "#ffc531" },
  { t: "Name Color", p: 400, c: "#a78bff" },
  { t: "Trail FX", p: 350, c: "#14c8f5" },
];

export default function LiveOps({ onXp, onGems, toast }: Props) {
  const [times, setTimes] = useState(events.map(e => e.left));
  const [joined, setJoined] = useState<number[]>([]);
  const [bought, setBought] = useState<string[]>([]);
  const [flash, setFlash] = useState(15);
  const [flashLive, setFlashLive] = useState(false);
  const [flashScore, setFlashScore] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTimes(ts => ts.map(t => Math.max(0, t - 1))), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!flashLive) return;
    const id = setInterval(() => setFlash(t => {
      if (t <= 1) { setFlashLive(false); onXp(flashScore * 5); toast(`Flash +${flashScore * 5} XP`, "Event over", "gold"); confetti({ particleCount: 60, spread: 70 }); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [flashLive, flashScore, onXp, toast]);

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <GameSection id="liveops" index="24" kicker="Live Ops" title="События и магазин ротации"
      desc="Таймеры ивентов, flash-challenge на 15 секунд, rotating shop, баннеры сезона. Всё тикает в реальном времени."
      right={<Tag tone="red"><Radio size={11} /> LIVE</Tag>}>

      <div className="mb-5 overflow-hidden rounded-2xl border border-[#ff5470]/30 bg-[#ff5470]/10 py-3">
        <VelocityMarquee baseVelocity={-4}>
          {["FLASH DUEL HOUR", "·", "2× POINTS", "·", "GEM RAIN", "·", "BOSS RUSH", "·", "JOIN NOW", "·"].map((w, i) => (
            <span key={i} className={cn("display text-2xl font-extrabold", w === "·" ? "text-[#ff5470]" : "text-white")}>{w}</span>
          ))}
        </VelocityMarquee>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e, i) => (
          <Reveal key={e.t} delay={i * 0.05}>
            <div className="panel-3d relative overflow-hidden p-4" style={{ borderColor: `${e.c}44` }}>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl" style={{ background: e.c }} />
              <e.icon size={28} style={{ color: e.c }} />
              <p className="display mt-2 text-sm font-extrabold text-white">{e.t}</p>
              <p className="text-[11px] text-[#aebde6]">{e.s}</p>
              <p className="num-mono mt-2 text-xs font-extrabold" style={{ color: e.c }}>{fmt(times[i])}</p>
              <button onClick={() => { setJoined(j => j.includes(i) ? j : [...j, i]); sfx.pop(); toast("Joined event", e.t, "green"); }}
                className={cn("btn3d mt-3 w-full py-2.5 text-[10px]", joined.includes(i) ? "btn3d-green" : "btn3d-ghost")}>
                {joined.includes(i) ? "Joined ✓" : "Join"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Flash Challenge" sub="15s · spam accuracy taps">
          {!flashLive ? (
            <div className="py-6 text-center">
              <Timer size={40} className="mx-auto text-[#ffc531]" />
              <p className="display mt-2 text-lg font-extrabold text-white">Ready?</p>
              <button onClick={() => { setFlashLive(true); setFlash(15); setFlashScore(0); sfx.whoosh(); }} className="btn3d btn3d-gold mt-4 px-8 py-3 text-xs">Start flash</button>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <TimerRing seconds={flash} max={15} color="#ffc531" />
                <span className="num-mono text-2xl font-extrabold text-white">{flashScore}</span>
              </div>
              <button onClick={() => { setFlashScore(s => s + 1); sfx.tap(); }} className="btn3d btn3d-green w-full py-10 text-lg">TAP!</button>
            </div>
          )}
        </Card>
        <Card title="Rotating Shop" sub="Refreshes in 02:14:33">
          <div className="grid grid-cols-2 gap-2">
            {shop.map(s => (
              <button key={s.t} disabled={bought.includes(s.t)} onClick={() => {
                setBought(b => [...b, s.t]); onGems(-s.p); sfx.coin(); toast(s.t, `−${s.p} gems`, "blue");
              }} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-left hover:border-white/25 disabled:opacity-50">
                <p className="text-xs font-extrabold text-white">{s.t}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold" style={{ color: s.c }}><Gem size={12} /> {bought.includes(s.t) ? "Owned" : s.p}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { t: "Push: Whale alert", d: "2400 BTC → Binance", c: "#5b8cff" },
          { t: "Push: Friend passed you", d: "CryptoQueen · +230 XP", c: "#ff5470" },
          { t: "Push: Chest ready", d: "Daily reward available", c: "#ffc531" },
        ].map(p => (
          <div key={p.t} className="panel-inset flex items-start gap-3 p-3">
            <Bell size={18} style={{ color: p.c }} />
            <div><p className="text-xs font-extrabold text-white">{p.t}</p><p className="text-[10px] text-[#8ea6d8]">{p.d}</p></div>
          </div>
        ))}
      </div>
    </GameSection>
  );
}
