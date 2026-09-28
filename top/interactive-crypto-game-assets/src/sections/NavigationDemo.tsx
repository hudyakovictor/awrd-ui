import { motion } from "framer-motion";
import { BookOpen, CandlestickChart, ChevronRight, Flame, Gem, Heart, Home, Swords, Trophy, User } from "lucide-react";
import { useState } from "react";
import { Card, SectionShell, Tag } from "../components/ui";
import { cn } from "../utils/cn";

export default function NavigationDemo() {
  const [tab, setTab] = useState(2);
  const [step, setStep] = useState(2);
  const [page, setPage] = useState(2);
  const [crumb, setCrumb] = useState(2);
  const tabs = [
    { i: Home, l: "Home" }, { i: BookOpen, l: "Learn" }, { i: CandlestickChart, l: "Trade", center: true },
    { i: Swords, l: "Duel" }, { i: User, l: "Profile" },
  ];
  const crumbs = ["Home", "Academy", "Price Action", "Урок 4"];

  return (
    <SectionShell id="nav" index="07" kicker="Navigation" title="Бары, табы и процессы" desc="Мобильный таб-бар с центральной кнопкой Trade, степпер KYC и пагинация — всё кликабельно."
      right={<Tag tone="violet">mobile-first</Tag>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="App Top Bar" sub="Streak · gems · hearts">
          <div className="panel-inset flex items-center justify-between px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#a4ff5e] to-[#62c91d] text-sm font-black text-[#0a2210]" style={{ boxShadow: "0 3px 0 #3a7d0d" }}>T</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#ff8b3d]"><Flame size={15} className="fill-[#ff8b3d]/30" />12</span>
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#7aa5ff]"><Gem size={15} />240</span>
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#ff5470]"><Heart size={15} className="fill-[#ff5470]" />5</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Segmented tabs</p>
            <div className="panel-inset flex p-1">
              {["Overview", "Orders", "History"].map((t, i) => (
                <button key={t} onClick={() => setPage(i)} className={cn("flex-1 rounded-xl py-2 text-xs font-extrabold transition", page === i ? "bg-gradient-to-b from-[#7aa5ff] to-[#3358d6] text-white" : "text-[#8ea6d8] hover:text-white")}
                  style={page === i ? { boxShadow: "0 3px 0 #1a2f7d, inset 0 1px 0 rgba(255,255,255,.4)" } : {}}>{t}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Breadcrumbs</p>
            <div className="panel-inset flex flex-wrap items-center gap-1 px-3 py-2.5">
              {crumbs.map((c, i) => (
                <span key={c} className="flex items-center gap-1">
                  <button onClick={() => setCrumb(i)} className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold", i === crumb ? "bg-[#8ef23c]/15 text-[#8ef23c]" : i < crumb ? "text-[#7aa5ff]" : "text-[#54678f]")}>{c}</button>
                  {i < crumbs.length - 1 && <ChevronRight size={12} className="text-[#54678f]" />}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Pagination</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(Math.max(0, page - 1))} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">Prev</button>
              {[0, 1, 2, 3].map(p => (
                <button key={p} onClick={() => setPage(p)} className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold transition", page === p ? "bg-[#ff8b3d] text-white" : "bg-white/5 text-[#8ea6d8]")}
                  style={page === p ? { boxShadow: "0 3px 0 #7a3a00" } : {}}>{p + 1}</button>
              ))}
              <button onClick={() => setPage(Math.min(3, page + 1))} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">Next</button>
            </div>
          </div>
        </Card>

        <Card title="Bottom Tab Bar" sub="Центральная Trade-кнопка" action={<Tag tone="green">62px touch</Tag>}>
          <div className="panel-inset relative overflow-visible !rounded-[22px] px-2 pb-3 pt-2">
            <div className="grid grid-cols-5 items-end">
              {tabs.map((t, i) => (
                <button key={t.l} onClick={() => setTab(i)} className="relative flex flex-col items-center gap-1 py-1">
                  {t.center ? (
                    <motion.span whileTap={{ scale: .88 }} className="anim-breathe -mt-7 flex h-[62px] w-[62px] items-center justify-center rounded-[20px] border-2 border-[#b6ff7d]/60 bg-gradient-to-b from-[#a4ff5e] to-[#4e9c14] text-[#0a2210]"
                      style={{ boxShadow: "0 6px 0 #2c5c08, 0 12px 28px rgba(142,242,60,.4), inset 0 2px 0 rgba(255,255,255,.5)" }}>
                      <t.i size={26} strokeWidth={2.6} />
                    </motion.span>
                  ) : (
                    <>
                      <span className={cn("relative flex h-10 w-12 items-center justify-center rounded-2xl transition", tab === i ? "bg-[#8ef23c]/15 text-[#8ef23c]" : "text-[#54678f]")}>
                        <t.i size={21} />
                        {t.l === "Duel" && <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5470] text-[9px] font-black text-white" style={{ boxShadow: "0 2px 0 #7c0f2c" }}>3</span>}
                      </span>
                    </>
                  )}
                  <span className={cn("text-[10px] font-extrabold", tab === i || (t.center && tab === i) ? "text-[#a4ff5e]" : "text-[#54678f]")}>{t.l}</span>
                  {tab === i && !t.center && <motion.span layoutId="tabdot" className="h-1 w-6 rounded-full bg-[#8ef23c]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
            <p className="text-xs text-[#8ea6d8]">Активный экран:</p>
            <p className="display text-sm font-extrabold text-white">{tabs[tab].l} · badge на Duel = 3 вызова</p>
          </div>
        </Card>

        <Card title="5-Step Process" sub="Onboarding · tap to advance" action={<Tag tone="gold"><Trophy size={11} /> KYC</Tag>}>
          <div className="relative px-1 py-2">
            <div className="absolute left-8 right-8 top-[26px] h-1.5 rounded-full bg-black/50" />
            <motion.div className="absolute left-8 top-[26px] h-1.5 rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]"
              initial={false} animate={{ width: `calc(${(step / 4) * 100}% - ${step === 0 ? 0 : 0}px)`, maxWidth: "calc(100% - 64px)" }} />
            <div className="relative flex justify-between">
              {[0, 1, 2, 3, 4].map(s => (
                <button key={s} onClick={() => setStep(s)} className="flex flex-col items-center gap-1.5">
                  <motion.span animate={step === s ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1.4, repeat: step === s ? Infinity : 0 }}
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black",
                      s < step ? "border-[#8ef23c] bg-[#8ef23c] text-[#0a2210]" : s === step ? "anim-pulse-ring border-[#b6ff7d] bg-[#0a2210] text-[#8ef23c]" : "border-white/15 bg-[#101f47] text-[#54678f]")}
                    style={{ boxShadow: "0 4px 0 #030816" }}>
                    {s < step ? "✓" : s + 1}
                  </motion.span>
                  <span className={cn("text-[9px] font-extrabold uppercase", s <= step ? "text-white" : "text-[#54678f]")}>
                    {["Email", "Wallet", "Quiz", "Paper", "Live"][s]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="panel-inset mt-3 p-3.5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#7d92c4]">Current step</p>
            <p className="display text-base font-extrabold text-white">{["Подтверди email", "Подключи кошелёк", "Сдай мини-квиз", "10 paper-сделок", "Готов к Live!"][step]}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setStep(Math.max(0, step - 1))} className="btn3d btn3d-ghost py-2.5 text-[11px]">Back</button>
              <button onClick={() => setStep(Math.min(4, step + 1))} className="btn3d btn3d-green py-2.5 text-[11px]">{step === 4 ? "Finish ✓" : "Next"}</button>
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}
