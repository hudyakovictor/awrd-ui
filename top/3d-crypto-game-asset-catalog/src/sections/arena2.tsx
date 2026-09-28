import { useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { AvatarArt, CoinArt, Mascot } from "../components/art";
import { useCountdown } from "../lib/gestures";
import { useInterval, tap, sfx, haptic, notify } from "../lib/fx";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   A06–A07 — Пул прогнозов и кооп-рейд на босса.
   ═══════════════════════════════════════════════════════════════════ */

/* ── A06 · Пул «Куда BTC к пятнице?» ── */
export function PredictionPool() {
  const cd = useCountdown(2 * 24 * 3600 * 1000 + 11 * 3600 * 1000);
  const [up, setUp] = useState(6420);
  const [down, setDown] = useState(4180);
  const [voters, setVoters] = useState(1204);
  const [bet, setBet] = useState<{ side: "up" | "down"; amt: number } | null>(null);
  const [amt, setAmt] = useState(50);
  const [done, setDone] = useState(false);
  const total = up + down;
  const pctUp = Math.round((up / total) * 100);
  useInterval(() => {
    if (done) return;
    const u = Math.floor(Math.random() * 40);
    const d = Math.floor(Math.random() * 30);
    setUp((v) => v + u);
    setDown((v) => v + d);
    setVoters((v) => v + (u + d > 30 ? 1 : 0));
  }, 1800);
  const place = (side: "up" | "down", el: HTMLElement) => {
    if (bet || done) return;
    if (!wallet.spend("coins", amt)) { sfx("error"); notify("Не хватает монет", "warn"); return; }
    setBet({ side, amt });
    if (side === "up") setUp((v) => v + amt); else setDown((v) => v + amt);
    setVoters((v) => v + 1);
    sfx("coin"); haptic(12);
    particles.fly(center2(el), { x: window.innerWidth / 2, y: 120 }, { kind: "coin", count: 6 });
  };
  const resolve = (side: "up" | "down") => {
    setDone(true);
    if (bet && bet.side === side) {
      const share = bet.amt / (side === "up" ? up : down);
      const win = Math.round(total * share);
      sfx("levelup"); haptic([10, 30, 10, 30, 60]);
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, { kind: "coin", count: 30, speed: 560 });
      setTimeout(() => wallet.add({ coins: win }), 600);
      notify(`Прогноз верный! +${win} монет`, "success");
    } else if (bet) {
      sfx("error"); haptic([40, 30, 40]);
      notify("Мимо. В следующий раз повезёт", "error");
    } else tap();
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <Chip tone="gold">Пул недели</Chip>
        <span className="ml-auto font-mono text-[11px] text-ink-400">до закрытия {cd.h}ч {cd.m}м</span>
      </div>
      <div className="mt-2 text-center font-display text-base font-black">BTC выше $70 000 к пятнице?</div>
      <div className="relative mt-3 h-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-bull-d to-bull transition-all duration-1000" style={{ width: `${(up / total) * 100}%` }} />
        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-bear-d to-bear transition-all duration-1000" style={{ width: `${(down / total) * 100}%` }} />
        <div className="absolute inset-0 grid grid-cols-2 items-center px-4 font-display text-lg font-black">
          <span className="flex items-center gap-1.5"><Icon name="up" size={18} stroke={3} />{pctUp}%</span>
          <span className="flex items-center justify-end gap-1.5">{100 - pctUp}%<Icon name="down" size={18} stroke={3} /></span>
        </div>
        {bet && <span className={cn("absolute top-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-black", bet.side === "up" ? "left-2" : "right-2")}>твоя ставка {bet.amt}</span>}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-ink-400">
        <span className="text-bull">{up.toLocaleString("ru-RU")} монет</span>
        <span>{voters.toLocaleString("ru-RU")} участников</span>
        <span className="text-bear">{down.toLocaleString("ru-RU")} монет</span>
      </div>
      {!bet && !done && (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[10, 50, 100, 250].map((a) => (
              <button key={a} onClick={() => { tap("tick"); setAmt(a); }} className={cn("rounded-xl py-2 font-mono text-[12px] font-bold", amt === a ? "bg-gold text-ink-900" : "bg-ink-850 text-ink-300")}>{a}</button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Btn s="md" icon="up" onClick={(e) => place("up", e.currentTarget)}>Да · выше</Btn>
            <Btn s="md" v="bear" icon="down" onClick={(e) => place("down", e.currentTarget)}>Нет · ниже</Btn>
          </div>
        </>
      )}
      {bet && !done && (
        <div className="mt-3 rounded-2xl bg-ink-850 p-3 text-center text-[12px] font-bold">
          Ставка принята: <span className={bet.side === "up" ? "text-bull" : "text-bear"}>{bet.side === "up" ? "ДА" : "НЕТ"} · {bet.amt} монет</span>
          <span className="ml-2 text-ink-400">возможный выигрыш ≈ {Math.round(total * (bet.amt / (bet.side === "up" ? up : down)))}</span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-ink-600 pt-3">
        <span className="text-[10px] font-bold uppercase text-ink-500">Демо-расчёт:</span>
        <Btn s="xs" v="bull" disabled={done} onClick={() => resolve("up")}>Закрыть: ДА</Btn>
        <Btn s="xs" v="bear" disabled={done} onClick={() => resolve("down")}>Закрыть: НЕТ</Btn>
        {done && <button className="ml-auto text-[11px] font-bold text-sky" onClick={() => { setDone(false); setBet(null); }}>Заново</button>}
      </div>
    </div>
  );
}
function center2(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/* ── A07 · Рейд-босс «FUD-Гидра» ── */
const RAIDERS = [
  { n: "Вы", seed: 0, dmg: 0, me: true },
  { n: "Кира", seed: 1, dmg: 0 },
  { n: "Макс", seed: 2, dmg: 0 },
  { n: "Дима", seed: 3, dmg: 0 },
];

export function RaidBoss() {
  const [hp, setHp] = useState(100);
  const [dmg, setDmg] = useState(RAIDERS);
  const [hits, setHits] = useState<{ id: number; v: number; crit: boolean; x: number }[]>([]);
  const [shake, setShake] = useState(0);
  const [over, setOver] = useState(false);
  const boss = useRef<HTMLDivElement>(null);
  useInterval(() => {
    if (over) return;
    setDmg((d) => d.map((r, i) => (i === 0 ? r : { ...r, dmg: r.dmg + 40 + Math.floor(Math.random() * 120) })));
    setHp((h) => Math.max(0, h - (0.4 + Math.random() * 0.9)));
  }, 1400);
  useInterval(() => {
    if (hp <= 0 && !over) {
      setOver(true);
      sfx("levelup"); haptic([10, 30, 10, 30, 80]);
      particles.burstAt(boss.current, { count: 70, speed: 680 });
    }
  }, 500);
  const hit = () => {
    if (over) return;
    const crit = Math.random() < 0.18;
    const v = crit ? 380 + Math.floor(Math.random() * 220) : 90 + Math.floor(Math.random() * 130);
    const id = Date.now() + Math.random();
    setHits((h) => [...h.slice(-8), { id, v, crit, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 900);
    setDmg((d) => d.map((r, i) => (i === 0 ? { ...r, dmg: r.dmg + v } : r)));
    setHp((h) => Math.max(0, h - v / 260));
    setShake(Date.now());
    sfx("hit"); haptic(crit ? [30, 20, 30] : 15);
    if (crit) particles.burstAt(boss.current, { kind: "spark", count: 16, speed: 420, colors: ["#FFC940", "#fff"] });
  };
  const order = [...dmg].sort((a, b) => b.dmg - a.dmg);
  const myPlace = order.findIndex((r) => r.me) + 1;
  const maxD = Math.max(1, ...dmg.map((r) => r.dmg));
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        {hits.map((h) => (
          <span key={h.id} className={cn("absolute font-display font-black animate-rise", h.crit ? "text-xl text-gold" : "text-sm text-white")} style={{ left: `${h.x}%`, top: "30%" }}>
            {h.crit ? `КРИТ ${h.v}` : h.v}
          </span>
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div ref={boss} key={shake} onClick={hit} className={cn("relative cursor-pointer select-none", shake ? "animate-shake" : "animate-bob", over && "opacity-40 grayscale")}>
          <Mascot size={0} mood="idle" />
          <svg width="150" height="120" viewBox="0 0 150 120">
            <ellipse cx="75" cy="112" rx="40" ry="5" fill="#000" opacity=".35" />
            <path d="M30 110C22 80 30 50 55 40c-2 12 2 20 10 24-4-14 2-28 14-34 0 12 4 20 12 24 2-12 10-20 20-24 2 14-2 26-12 32 8 2 14 8 16 16l-10 4-8-6-6 8-10-4-8 6-10-4-6 8-12-4Z" fill="#6A38E0" />
            <path d="M30 110C22 80 30 50 55 40c-2 12 2 20 10 24-4-14 2-28 14-34 0 12 4 20 12 24 2-12 10-20 20-24 2 14-2 26-12 32" fill="none" stroke="#C9A8FF" strokeWidth="2.5" opacity=".7" />
            <circle cx="58" cy="72" r="7" fill="#FF4D6D" /><circle cx="92" cy="72" r="7" fill="#FF4D6D" />
            <circle cx="59.5" cy="70.5" r="2.2" fill="#fff" /><circle cx="93.5" cy="70.5" r="2.2" fill="#fff" />
            <path d="M62 92q13 8 26 0" stroke="#1A0B45" strokeWidth="4" strokeLinecap="round" fill="none" />
            {Array.from({ length: 3 }).map((_, i) => <circle key={i} cx={45 + i * 30} cy={30 - i * 4} r="3" fill="#2BE38B"><animate attributeName="cy" values={`${30 - i * 4};${22 - i * 4};${30 - i * 4}`} dur="1.6s" repeatCount="indefinite" /></circle>)}
          </svg>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-950/80 px-2 py-0.5 text-[10px] font-bold text-ink-300">тапни, чтобы бить</div>
        </div>
        <div className="mt-4 w-full">
          <div className="flex justify-between text-[11px] font-black uppercase"><span className="text-violet">FUD-Гидра</span><span className="font-mono">{hp.toFixed(1)}%</span></div>
          <div className="mt-1 h-4 overflow-hidden rounded-full bg-ink-900 ring-1 ring-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-d via-violet to-[#C9A8FF] transition-all duration-500" style={{ width: `${hp}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {order.map((r, i) => (
          <div key={r.n} className={cn("flex items-center gap-2 rounded-xl px-2 py-1", r.me ? "bg-violet/15 ring-1 ring-violet/40" : "bg-ink-850")}>
            <span className={cn("w-4 text-center font-display text-[11px] font-black", i === 0 ? "text-gold" : "text-ink-500")}>{i + 1}</span>
            <AvatarArt seed={r.seed} size={24} />
            <span className={cn("w-12 text-[11px] font-bold", r.me && "text-violet")}>{r.n}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-900"><div className="h-full rounded-full bg-violet transition-all duration-500" style={{ width: `${(r.dmg / maxD) * 100}%` }} /></div>
            <span className="w-14 text-right font-mono text-[10px] tabular-nums">{r.dmg.toLocaleString("ru-RU")}</span>
          </div>
        ))}
      </div>
      {over && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gold/10 p-3 ring-1 ring-gold/40 animate-zoom-in">
          <CoinArt size={32} />
          <div className="flex-1 text-[12px] font-bold">Гидра повержена! Твоё место: {myPlace} · награда {myPlace === 1 ? 500 : myPlace === 2 ? 300 : 150} монет</div>
          <Btn s="xs" v="gold" onClick={(e) => { particles.flyFrom(e.currentTarget, "coins", "coin", 8, () => wallet.add({ coins: myPlace === 1 ? 500 : myPlace === 2 ? 300 : 150 })); setHp(100); setOver(false); setDmg(RAIDERS); }}>Забрать</Btn>
        </div>
      )}
    </div>
  );
}
