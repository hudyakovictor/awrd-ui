import { useState } from "react";
import { Asset, Btn, Label, Section, haptic } from "../components/ui";
import { ChestIcon, FlameIcon, GemIcon, HeartIcon, Icon, ShieldIcon, TrophyIcon, XPIcon } from "../components/icons";
import { cn } from "../utils/cn";
import { useGame } from "../lib/game";

function HUD() {
  const game = useGame();
  const hearts = game.hearts;
  const gems = game.gems;
  const [open, setOpen] = useState<"streak" | "gems" | "hearts" | null>(null);
  const [float, setFloat] = useState(0);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <Asset title="Top HUD Bar" code="N-01" tags="hud header top bar streak gems hearts lives currency" span={7} bodyClass="pb-8 min-h-[330px]">
      <div className="panel-raised relative flex items-center gap-2 rounded-2xl p-2">
        <button className="flex h-11 items-center gap-2 rounded-xl px-2 transition hover:bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7931a] font-display text-sm font-black text-white shadow-[0_3px_0_#a35e00]">₿</div>
          <Icon name="chevronDown" size={14} className="text-ink-400" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <HudItem active={open === "streak"} onClick={() => setOpen(open === "streak" ? null : "streak")}>
            <FlameIcon size={26} className="anim-flicker" />
            <span className="text-flame">47</span>
          </HudItem>
          <HudItem
            active={open === "gems"}
            onClick={() => {
              setOpen(open === "gems" ? null : "gems");
            }}
          >
            <GemIcon size={24} />
            <span className="relative text-cyan">
              {gems.toLocaleString()}
              {float > 0 && (
                <span key={float} className="anim-rise absolute -top-2 left-0 text-xs font-black text-cyan">
                  +50
                </span>
              )}
            </span>
          </HudItem>
          <HudItem active={open === "hearts"} onClick={() => setOpen(open === "hearts" ? null : "hearts")}>
            <HeartIcon size={24} className={hearts > 0 ? "anim-heart" : ""} dim={hearts === 0} />
            <span className={hearts ? "text-bear" : "text-ink-500"}>{hearts}</span>
          </HudItem>
        </div>

        {open && (
          <div className="anim-pop panel absolute right-2 top-[calc(100%+14px)] z-20 w-72 origin-top-right rounded-2xl p-4">
            <span className="absolute -top-2 right-10 h-4 w-4 rotate-45 border-l border-t border-white/10 bg-[#182d5c]" />
            {open === "streak" && (
              <>
                <div className="flex items-center gap-3">
                  <FlameIcon size={40} className="anim-flicker" />
                  <div>
                    <div className="font-display text-lg font-black text-flame">47 day streak</div>
                    <div className="text-xs text-ink-300">Trade or learn daily to keep it lit</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {days.map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[10px] font-bold text-ink-400">{d}</div>
                      <div
                        className={cn(
                          "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full",
                          i < 5 ? "bg-flame text-white shadow-[0_2px_0_#c24a0c]" : i === 5 ? "border-2 border-dashed border-flame/70" : "bg-ink-700",
                        )}
                      >
                        {i < 5 && <Icon name="check" size={13} stroke={3.5} />}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {open === "gems" && (
              <>
                <div className="font-display text-lg font-black text-cyan">Gems</div>
                <div className="text-xs text-ink-300">Spend on streak freezes & hints.</div>
                <Btn
                  variant="azure"
                  block
                  size="sm"
                  className="mt-3"
                  onClick={(e) => {
                    game.reward("gems", 50, e.currentTarget);
                    setFloat((f) => f + 1);
                  }}
                >
                  <GemIcon size={18} /> Watch ad · +50
                </Btn>
              </>
            )}
            {open === "hearts" && (
              <>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HeartIcon key={i} size={30} dim={i >= hearts} className={i < hearts ? "anim-pop" : ""} />
                  ))}
                </div>
                <div className="mt-2 text-xs text-ink-300">{hearts < 5 ? "Next heart in 03:24:10" : "You have full hearts!"}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => game.loseHeart()}>
                    Lose 1
                  </Btn>
                  <Btn variant="bear" size="sm" onClick={(e) => game.refillHearts(e.currentTarget)}>
                    Refill
                  </Btn>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Label className="mt-6">Lesson header · progress + exit</Label>
      <LessonHeader />
    </Asset>
  );
}

function LessonHeader() {
  const [p, setP] = useState(40);
  const [combo, setCombo] = useState(2);
  return (
    <div className="flex items-center gap-3">
      <button className="text-ink-400 transition hover:rotate-90 hover:text-white">
        <Icon name="x" size={24} stroke={2.8} />
      </button>
      <div className="relative flex-1">
        <div className="panel-inset h-5 overflow-hidden rounded-full">
          <div className="relative h-full rounded-full bg-gradient-to-b from-[#5ff0bd] to-bull transition-[width] duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ width: `${p}%` }}>
            <div className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/45" />
          </div>
        </div>
        {combo >= 3 && (
          <span key={combo} className="anim-pop absolute -top-5 text-[10px] font-black uppercase text-gold" style={{ left: `calc(${p}% - 40px)` }}>
            {combo} in a row!
          </span>
        )}
      </div>
      <button
        onClick={() => {
          haptic();
          setP((x) => (x >= 100 ? 10 : x + 15));
          setCombo((c) => (p >= 100 ? 0 : c + 1));
        }}
        className="btn3d v-ghost h-9 rounded-xl px-3 text-[11px] [--depth:3px]"
      >
        +Step
      </button>
    </div>
  );
}

function HudItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={() => {
        haptic();
        onClick?.();
      }}
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-xl px-2.5 font-display text-sm font-black transition-all active:scale-95",
        active ? "bg-white/10" : "hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}

function BottomNav() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { i: "home", l: "Learn" },
    { i: "chart", l: "Trade" },
    { i: "trophy", l: "League", dot: true },
    { i: "target", l: "Quests", badge: 3 },
    { i: "user", l: "Profile" },
  ];
  return (
    <Asset title="Bottom Tab Bar" code="N-02" tags="bottom navigation tab bar mobile" span={5}>
      <div className="relative mx-auto max-w-sm">
        <div className="panel-inset mb-4 h-24 rounded-2xl p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Current screen</div>
          <div key={tab} className="anim-slide-up font-display text-2xl font-black text-white">
            {tabs[tab].l}
          </div>
        </div>
        <div className="panel-raised flex rounded-3xl p-1.5">
          {tabs.map((t, i) => (
            <button
              key={t.l}
              onClick={() => {
                haptic();
                setTab(i);
              }}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-all duration-300",
                tab === i ? "bg-azure/15 text-azure ring-2 ring-azure/60" : "text-ink-400 hover:text-ink-200",
              )}
            >
              <span key={tab === i ? "a" : "b"} className={tab === i ? "anim-pop" : ""}>
                <Icon name={t.i} size={24} stroke={tab === i ? 2.6 : 2.2} />
              </span>
              <span className="text-[10px] font-extrabold uppercase">{t.l}</span>
              {t.dot && <span className="absolute right-3 top-1.5 h-2.5 w-2.5 rounded-full bg-bear ring-2 ring-ink-700 anim-glow" />}
              {t.badge && (
                <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black text-ink-950">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

type NodeState = "done" | "current" | "locked";
function LessonPath() {
  const [progress, setProgress] = useState(3);
  const [pop, setPop] = useState<number | null>(3);
  const [chestOpen, setChestOpen] = useState(false);
  const nodes = [
    { t: "What is a candle?", k: "star" },
    { t: "Wicks & bodies", k: "book" },
    { t: "Bullish patterns", k: "trendUp" },
    { t: "Bearish patterns", k: "trendDown" },
    { t: "chest", k: "chest" },
    { t: "Volume basics", k: "chart" },
    { t: "Unit review", k: "trophy" },
  ];
  const offsets = [0, 50, 75, 50, 0, -50, 0];
  const st = (i: number): NodeState => (i < progress ? "done" : i === progress ? "current" : "locked");
  return (
    <Asset title="Lesson Path Map" code="N-03" tags="path map lesson skill tree duolingo units journey" span={5} className="xl:row-span-2">
      <div className="panel-raised relative overflow-hidden rounded-2xl bg-gradient-to-br from-bull to-[#0fa877] p-4 text-ink-950" style={{ background: "linear-gradient(135deg,#22d39a,#0e9e70)", boxShadow: "0 5px 0 #0a6b4a" }}>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Section 1 · Unit 2</div>
        <div className="font-display text-lg font-black">Reading Candlesticks</div>
        <Icon name="candle" size={64} className="absolute -right-2 -top-1 opacity-20" stroke={2.5} />
      </div>
      <div className="relative mt-6 flex flex-col items-center gap-5 pb-4">
        {nodes.map((n, i) => {
          const s = st(i);
          if (n.k === "chest")
            return (
              <button
                key={i}
                onClick={() => s !== "locked" && setChestOpen(true)}
                className={cn("relative transition-transform hover:scale-105", s === "current" && "anim-float")}
                style={{ transform: `translateX(${offsets[i]}px)` }}
              >
                <ChestIcon size={64} open={chestOpen} />
                {chestOpen && <span className="anim-rise absolute -top-4 left-1/2 -translate-x-1/2 font-display text-sm font-black text-gold">+25 XP</span>}
              </button>
            );
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${offsets[i]}px)` }}>
              {s === "current" && (
                <svg className="absolute -inset-2.5 h-[calc(100%+20px)] w-[calc(100%+20px)] -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#1c3365" strokeWidth="7" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#22d39a" strokeWidth="7" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="190" />
                </svg>
              )}
              <button
                onClick={() => {
                  haptic();
                  setPop(pop === i ? null : i);
                }}
                className={cn(
                  "btn3d relative h-[68px] w-[76px] rounded-[50%] [--depth:7px]",
                  s === "done" ? "v-gold" : s === "current" ? "v-bull" : "v-ghost",
                )}
              >
                {s === "locked" ? (
                  <Icon name="lock" size={26} stroke={2.6} className="text-ink-500" />
                ) : n.k === "trophy" ? (
                  <TrophyIcon size={34} />
                ) : (
                  <Icon name={s === "done" ? "check" : n.k} size={30} stroke={3.2} />
                )}
              </button>
              {s === "current" && pop !== i && (
                <div className="anim-float absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-bull">
                  Start
                  <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink-600 bg-ink-800" />
                </div>
              )}
              {pop === i && (
                <div className="anim-pop absolute left-1/2 top-[calc(100%+16px)] z-20 w-56 -translate-x-1/2 origin-top">
                  <div
                    className={cn(
                      "relative rounded-2xl p-4",
                      s === "locked" ? "bg-ink-700 text-ink-300" : s === "done" ? "bg-gold text-ink-950" : "bg-bull text-ink-950",
                    )}
                  >
                    <span className={cn("absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45", s === "locked" ? "bg-ink-700" : s === "done" ? "bg-gold" : "bg-bull")} />
                    <div className="font-display text-sm font-black">{n.t}</div>
                    <div className="mb-3 text-xs font-bold opacity-75">
                      {s === "locked" ? "Complete all levels above to unlock" : s === "done" ? "Lesson 4 of 4 · Legendary available" : "Lesson 2 of 4"}
                    </div>
                    <button
                      disabled={s === "locked"}
                      onClick={() => {
                        haptic(20);
                        if (s === "current") setProgress((p) => Math.min(nodes.length, p + 1));
                        setPop(null);
                      }}
                      className={cn("btn3d h-10 w-full rounded-xl text-xs [--depth:4px]", s === "locked" ? "v-ghost" : "v-light")}
                    >
                      {s === "locked" ? "Locked" : s === "done" ? "Practice +5 XP" : "Start +15 XP"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => { setProgress(3); setChestOpen(false); setPop(3); }} className="mx-auto mt-2 block text-[11px] font-bold text-ink-400 hover:text-white">
        Reset path
      </button>
    </Asset>
  );
}

function TabsNav() {
  const [tab, setTab] = useState(0);
  const tabs = ["Overview", "Positions", "Orders", "History"];
  const [page, setPage] = useState(2);
  const [crumb, setCrumb] = useState(3);
  const crumbs = ["Academy", "Technical", "Candles", "Doji"];
  const total = 10;
  const pages = page <= 3 ? [1, 2, 3, 4, "…", total] : page >= total - 2 ? [1, "…", total - 3, total - 2, total - 1, total] : [1, "…", page - 1, page, page + 1, "…", total];
  return (
    <Asset title="Tabs · Breadcrumbs · Pagination" code="N-04" tags="tabs breadcrumbs pagination navigation" span={7}>
      <Label>Tabs</Label>
      <div className="panel-inset relative flex rounded-2xl p-1">
        <div
          className="absolute bottom-1 top-1 rounded-xl bg-gradient-to-b from-[#5ea0ff] to-azure shadow-[0_3px_0_#1c55c2,inset_0_1px_0_rgba(255,255,255,.3)] transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]"
          style={{ left: `calc(${(tab * 100) / tabs.length}% + 4px)`, width: `calc(${100 / tabs.length}% - 8px)` }}
        />
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={cn("relative z-10 h-10 flex-1 text-xs font-extrabold uppercase tracking-wider transition-colors", tab === i ? "text-white" : "text-ink-400 hover:text-ink-200")}>
            {t}
            {i === 1 && <span className="ml-1 rounded-md bg-bear px-1 text-[9px] text-white">2</span>}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-6 border-b border-white/5">
        {["Spot", "Futures", "Options"].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={cn("relative pb-2 text-sm font-extrabold transition-colors", tab === i ? "text-white" : "text-ink-400")}>
            {t}
            <span className={cn("absolute -bottom-px left-0 h-[3px] rounded-full bg-cyan transition-all duration-300", tab === i ? "w-full" : "w-0")} />
          </button>
        ))}
      </div>

      <Label className="mt-6">Breadcrumbs</Label>
      <div className="panel-inset inline-flex flex-wrap items-center gap-1 rounded-xl p-1.5">
        {crumbs.slice(0, crumb + 1).map((c, i) => (
          <span key={c} className="anim-slide-right flex items-center gap-1" style={{ animationDelay: `${i * 40}ms` }}>
            <button
              onClick={() => setCrumb(i)}
              className={cn(
                "rounded-lg px-2 py-1 text-xs font-bold transition",
                i === crumb ? "bg-ink-600 text-white shadow-[0_2px_0_#0b1838]" : "text-cyan-300 hover:bg-white/5",
              )}
            >
              {i === 0 && <Icon name="home" size={12} className="mr-1 inline -translate-y-px" />}
              {c}
            </button>
            {i < crumb && <Icon name="chevronRight" size={12} className="text-ink-500" />}
          </span>
        ))}
        {crumb < crumbs.length - 1 && (
          <button onClick={() => setCrumb((c) => c + 1)} className="rounded-lg px-2 py-1 text-xs font-bold text-ink-500 hover:text-white">
            +
          </button>
        )}
      </div>

      <Label className="mt-6">Pagination</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Btn variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          <Icon name="chevronLeft" size={14} stroke={3} /> Prev
        </Btn>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-ink-500">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              className={cn("btn3d h-10 w-10 rounded-full text-sm [--depth:4px]", page === p ? "v-azure" : "v-ghost")}
            >
              {p}
            </button>
          ),
        )}
        <Btn variant="ghost" size="sm" disabled={page === total} onClick={() => setPage((p) => p + 1)}>
          Next <Icon name="chevronRight" size={14} stroke={3} />
        </Btn>
      </div>
    </Asset>
  );
}

function Stepper() {
  const steps = [
    { i: "user", l: "Profile" },
    { i: "shield", l: "Verify" },
    { i: "wallet", l: "Deposit" },
    { i: "swap", l: "First trade" },
    { i: "flag", l: "Review" },
  ];
  const [cur, setCur] = useState(2);
  return (
    <Asset title="5-Step Process" code="N-05" tags="stepper steps process onboarding wizard" span={7}>
      <div className="relative flex items-center justify-between px-2 pt-10">
        <div className="panel-inset absolute left-8 right-8 top-[62px] h-2.5 rounded-full" />
        <div
          className="absolute left-8 top-[62px] h-2.5 rounded-full bg-gradient-to-r from-bull to-cyan shadow-[0_0_12px_#22d39a] transition-all duration-500 ease-out"
          style={{ width: `calc((100% - 64px) * ${cur / (steps.length - 1)})` }}
        />
        {steps.map((s, i) => {
          const done = i < cur;
          const now = i === cur;
          return (
            <div key={s.l} className="relative z-10 flex flex-col items-center">
              {now && (
                <div key={cur} className="anim-pop absolute -top-10 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[11px] font-black text-ink-900 shadow-[0_3px_0_#8ea4d2]">
                  {s.l}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
                </div>
              )}
              <button
                onClick={() => setCur(i)}
                className={cn(
                  "btn3d h-12 w-12 rounded-full [--depth:4px]",
                  done ? "v-bull" : now ? "v-azure anim-pulse-ring [--ring:rgba(62,139,255,.6)]" : "v-ghost",
                )}
              >
                <Icon name={done ? "check" : s.i} size={20} stroke={done ? 3.2 : 2.4} />
              </button>
              <span className={cn("mt-2 text-[10px] font-extrabold uppercase", now ? "text-white" : "text-ink-400")}>{s.l}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Btn variant="ghost" size="sm" disabled={cur === 0} onClick={() => setCur((c) => c - 1)}>
          Back
        </Btn>
        <span className="font-mono text-xs text-ink-400">
          Step {cur + 1}/{steps.length}
        </span>
        <Btn variant={cur === steps.length - 1 ? "gold" : "azure"} size="sm" onClick={() => setCur((c) => (c === steps.length - 1 ? 0 : c + 1))}>
          {cur === steps.length - 1 ? "Finish" : "Next"}
        </Btn>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-950/40 p-3 text-xs text-ink-300">
        <ShieldIcon tier="diamond" size={24} /> Completing onboarding grants <b className="text-cyan">Diamond Starter</b> badge
        <XPIcon size={18} className="ml-auto" />
        <b className="text-gold">+100</b>
      </div>
    </Asset>
  );
}

export default function Navigation() {
  return (
    <Section id="navigation" index="03" kicker="Wayfinding" title="Navigation">
      <HUD />
      <BottomNav />
      <LessonPath />
      <TabsNav />
      <Stepper />
    </Section>
  );
}
