import { useState } from "react";
import { Btn, Burst, Icon, useBump } from "./kit";
import { Mascot } from "./Mascot";
import { cn } from "../utils/cn";

const NODES = ["candle", "trendUp", "gift", "target", "crown"];
const OFF = [0, 44, 60, 20, -36];

export function PhoneHero() {
  const [cur, setCur] = useState(1);
  const [tab, setTab] = useState(0);
  const [b, bump] = useBump();
  const [xp, setXp] = useState(1180);
  const tap = () => { setCur((c) => (c >= NODES.length - 1 ? 0 : c + 1)); setXp((x) => x + 15); bump(); };
  return (
    <div className="relative mx-auto w-[300px]">
      <div className="absolute -inset-10 rounded-full bg-sky/20 blur-3xl" />
      <div className="relative rounded-[48px] bg-gradient-to-b from-ink-600 to-ink-800 p-3 shadow-[0_10px_0_#050b1f,0_40px_80px_-20px_#000,inset_0_1px_0_#ffffff22]">
        <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-ink-900 grid-dots">
          <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          {/* HUD */}
          <div className="relative z-10 flex items-center justify-between px-5 pb-3 pt-11">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-b from-[#ffb547] to-[#f7931a] text-sm font-extrabold text-white shadow-[0_2px_0_#b36200]">₿</span>
            <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-flame"><Icon name="flame" size={20} variant="solid" className="anim-flame" />27</span>
            <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-violet"><Icon name="gem" size={18} variant="solid" />{xp.toLocaleString()}</span>
            <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={20} variant="solid" />5</span>
          </div>
          {/* Unit */}
          <div className="mx-4 rounded-2xl bg-gradient-to-br from-bull to-bull-edge p-3.5 shadow-[0_5px_0_#0b7a4d]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-900/70">Unit 2</div>
                <div className="text-base font-extrabold text-ink-900">Candlestick Patterns</div>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/15"><Icon name="book" size={20} stroke={2.6} className="text-ink-900" /></span>
            </div>
          </div>
          {/* Path */}
          <div className="relative mt-10 flex flex-col items-center gap-5">
            {NODES.map((n, i) => {
              const st = i < cur ? "done" : i === cur ? "cur" : "lock";
              const col = st === "done" ? ["#ffc53d", "#cc8a00"] : st === "cur" ? ["#2ee59d", "#12a46a"] : ["#22376f", "#132250"];
              return (
                <div key={i} className="relative" style={{ transform: `translateX(${OFF[i]}px)` }}>
                  {st === "cur" && <span className="absolute inset-0 rounded-full border-4 border-bull" style={{ animation: "pulseRing 1.6s infinite" }} />}
                  {st === "cur" && <div className="absolute -top-9 left-1/2 z-10 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-bull-edge shadow-[0_3px_0_#c3cdea]" style={{ animation: "bob 1.4s ease-in-out infinite" }}>Start<span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" /></div>}
                  <button onClick={st === "cur" ? tap : undefined} className={cn("relative grid h-[54px] w-[60px] place-items-center rounded-full transition-transform", st === "cur" && "active:translate-y-1.5")}
                    style={{ background: col[0], boxShadow: `0 6px 0 ${col[1]}, inset 0 2px 0 #ffffff55` }}>
                    {st === "done" ? <Icon key={b} name="star" size={26} variant="solid" className="anim-pop text-white" /> : st === "cur" ? <Icon name={n} size={26} stroke={2.8} className="text-ink-900" /> : <Icon name="lock" size={22} className="text-ink-400" />}
                  </button>
                  {i === cur - 1 && <Burst trigger={b} count={10} spread={50} />}
                </div>
              );
            })}
            <div className="absolute -left-1 top-24"><Mascot mood="idle" size={70} className="anim-float" /></div>
          </div>
          {/* Floating quest */}
          <div className="glass absolute bottom-24 left-4 right-4 flex items-center gap-3 rounded-2xl p-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/20"><Icon name="bolt" size={18} variant="solid" className="text-gold" /></span>
            <div className="flex-1">
              <div className="text-[11px] font-extrabold text-white">Earn 50 XP today</div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.min(100, ((xp - 1150) / 50) * 100)}%` }} /></div>
            </div>
            <Btn v="gold" size="sm" className="h-8! px-3! text-[10px]!">Go</Btn>
          </div>
          {/* Tabbar */}
          <div className="absolute inset-x-0 bottom-0 flex border-t border-white/5 bg-ink-850/95 px-2 pb-4 pt-2">
            {[["home", "#2ee59d"], ["chart", "#3d8bff"], ["trophy", "#ffc53d"], ["target", "#ff8a3d"], ["user", "#a174ff"]].map(([ic, c], i) => (
              <button key={ic} onClick={() => setTab(i)} className="flex flex-1 justify-center py-1.5">
                <span className={cn("grid h-10 w-12 place-items-center rounded-xl transition-all", tab === i && "scale-105")} style={tab === i ? { background: `${c}22`, boxShadow: `inset 0 0 0 2px ${c}88` } : undefined}>
                  <Icon name={ic} size={22} variant={tab === i ? "duo" : "line"} style={{ color: tab === i ? c : "#5a70ad" }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
