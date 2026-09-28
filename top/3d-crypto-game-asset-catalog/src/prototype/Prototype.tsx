import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Chip } from "../components/ui";
import { useWallet, wallet } from "../lib/wallet";
import { tap } from "../lib/fx";
import { cn } from "../utils/cn";
import { Splash, Onboarding, Home, Lesson, Result, League, Quests, ProfileP, ShopP, Boss, PHud, PTabs, type Go } from "./screens";
import { Duel } from "./Duel";

/* ——————————————————————————————————————————————
   Playable prototype: a real navigation stack inside a phone frame.
   Screens animate by direction (forward / back / modal-up).
   —————————————————————————————————————————————— */

const TABBED = ["home", "league", "quests", "profile"];
const HUDDED = ["home", "league", "quests", "profile"];
const FLOW: { k: string; t: string }[] = [
  { k: "splash", t: "Заставка" }, { k: "onboarding", t: "Онбординг" }, { k: "home", t: "Путь" }, { k: "lesson", t: "Урок" },
  { k: "result", t: "Итоги" }, { k: "boss", t: "Босс" }, { k: "league", t: "Лига" }, { k: "quests", t: "Квесты" }, { k: "profile", t: "Профиль" }, { k: "shop", t: "Магазин" },
  { k: "duel", t: "PvP-дуэль" },
];

function StatusBar() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 30000); return () => clearInterval(id); }, []);
  return (
    <div className="flex items-center justify-between px-7 pb-1 pt-3 text-[12px] font-bold">
      <span className="tabular-nums">{t.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
      <span className="flex items-center gap-1.5">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="1" /><rect x="4.3" y="4" width="3" height="6" rx="1" /><rect x="8.6" y="2" width="3" height="8" rx="1" /><rect x="13" y="0" width="3" height="10" rx="1" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="15" height="7" rx="1.8" fill="currentColor" /><rect x="21.5" y="3.5" width="1.8" height="4" rx=".9" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

export function Prototype() {
  const w = useWallet();
  const [screen, setScreen] = useState("splash");
  const [dir, setDir] = useState<"fwd" | "back" | "up">("fwd");
  const [done, setDone] = useState(2);
  const [acc, setAcc] = useState(100);
  const [nav, setNav] = useState(0);
  const go: Go = (s, d = "fwd") => {
    if (s === "home-chest") { setDone((v) => Math.max(v, 4)); s = "home"; d = "fwd"; }
    setDir(d);
    setScreen(s);
    setNav((n) => n + 1);
  };
  const anim = dir === "back" ? "animate-screen-back" : dir === "up" ? "animate-screen-up" : "animate-screen-in";
  let body;
  switch (screen) {
    case "splash": body = <Splash go={go} />; break;
    case "onboarding": body = <Onboarding go={go} />; break;
    case "home": body = <Home go={go} done={done} />; break;
    case "lesson": body = <Lesson go={go} onComplete={(a) => { setAcc(a); setDone((v) => (v === 2 ? 3 : v === 4 ? 5 : v)); }} />; break;
    case "result": body = <Result go={go} acc={acc} />; break;
    case "boss": body = <Boss go={go} onWin={() => setDone(6)} />; break;
    case "league": body = <League />; break;
    case "quests": body = <Quests />; break;
    case "profile": body = <ProfileP go={go} />; break;
    case "shop": body = <ShopP go={go} />; break;
    case "duel": body = <Duel go={go} />; break;
    default: body = <Home go={go} done={done} />;
  }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[1fr_auto_1fr]">
      <div className="order-2 space-y-4 lg:order-1">
        <div>
          <Chip tone="bull">Играбельно</Chip>
          <h3 className="mt-3 font-display text-2xl font-black">Прототип целиком</h3>
          <p className="mt-2 text-sm text-ink-300">11 экранов, настоящий стек навигации, общая экономика с каталогом: всё, что заработаешь в уроке, видно в шапке сайта.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FLOW.map((f, i) => (
            <button key={f.k} onClick={() => { tap("tick"); go(f.k, i < FLOW.findIndex((x) => x.k === screen) ? "back" : "fwd"); }}
              className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold transition-colors", screen === f.k ? "bg-sky/15 text-sky ring-1 ring-sky/50" : "bg-ink-850 text-ink-300 hover:bg-ink-800")}>
              <span className="font-mono text-[10px] text-ink-500">{String(i + 1).padStart(2, "0")}</span>{f.t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { tap(); setDone(2); wallet.reset(); go("splash", "back"); }} className="flex items-center gap-1.5 rounded-xl bg-ink-850 px-3 py-2 text-[12px] font-bold text-ink-300 hover:text-white"><Icon name="refresh" size={14} />Сброс прогресса</button>
          <button onClick={() => { tap(); wallet.setHearts(0); }} className="flex items-center gap-1.5 rounded-xl bg-ink-850 px-3 py-2 text-[12px] font-bold text-ink-300 hover:text-white"><Icon name="heart" size={14} />Обнулить жизни</button>
        </div>
      </div>

      <div className="order-1 mx-auto lg:order-2">
        <div className="relative w-[312px] rounded-[48px] sm:w-[340px] sm:rounded-[52px] bg-gradient-to-b from-[#2a4378] to-[#101f44] p-3 shadow-[0_12px_0_#050b1c,0_50px_90px_-20px_rgba(0,0,0,.85),inset_0_2px_0_rgba(255,255,255,.18)]">
          <span className="absolute -left-1 top-28 h-10 w-1 rounded-l bg-[#2a4378]" /><span className="absolute -left-1 top-44 h-16 w-1 rounded-l bg-[#2a4378]" /><span className="absolute -right-1 top-36 h-20 w-1 rounded-r bg-[#2a4378]" />
          <div className="relative flex h-[660px] flex-col overflow-hidden rounded-[38px] bg-ink-900 sm:h-[700px] sm:rounded-[42px]">
            <div className="absolute left-1/2 top-2.5 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            {screen !== "splash" && <StatusBar />}
            {HUDDED.includes(screen) && <PHud go={go} />}
            <div key={nav} className={cn("relative min-h-0 flex-1", anim)}>{body}</div>
            {TABBED.includes(screen) && <PTabs cur={screen} go={go} />}
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      <div className="order-3 space-y-3">
        <div className="panel-soft p-4">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-ink-400">Состояние игры</div>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[12px]">
            <span className="text-ink-400">Экран</span><span className="text-right font-bold text-sky">{screen}</span>
            <span className="text-ink-400">Пройдено узлов</span><span className="text-right font-bold">{done}/6</span>
            <span className="text-ink-400">Жизни</span><span className="text-right font-bold text-bear">{w.pro ? "∞" : w.hearts}</span>
            <span className="text-ink-400">XP</span><span className="text-right font-bold text-gold">{w.xp}</span>
            <span className="text-ink-400">Pro</span><span className="text-right font-bold">{w.pro ? "да" : "нет"}</span>
          </div>
        </div>
        <div className="panel-soft p-4 text-[12px] leading-relaxed text-ink-300">
          <div className="mb-1 font-display text-xs font-bold text-white">Попробуй сценарий</div>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Заставка → онбординг из 3 вопросов</li>
            <li>Тапни «Тренды» → урок из 4 типов заданий</li>
            <li>Ошибись — жизнь улетит из счётчика</li>
            <li>Итоги: XP летит в стрик, сундук — в монеты</li>
            <li>Открой сундук на пути и победи босса</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
