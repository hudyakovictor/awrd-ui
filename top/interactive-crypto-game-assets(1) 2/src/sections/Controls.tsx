import { motion } from "framer-motion";
import { Bell, Check, Loader2, Lock, Minus, Plus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, Meter, SectionShell, Tag } from "../components/ui";
import { useMarket } from "../lib/sim";
import { cn } from "../utils/cn";

export default function Controls({ onToast }: { onToast: (t: string, s: string, tone: string) => void }) {
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState(250);
  const [orderType, setOrderType] = useState("Market");
  const [toggles, setToggles] = useState({ sound: true, haptic: true, alerts: false });
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const { coins } = useMarket(true, 2000);
  const filtered = useMemo(() => coins.filter(c => (c.sym + c.name).toLowerCase().includes(q.toLowerCase())), [coins, q]);
  const liq = useMemo(() => 97432 * (1 - 1 / leverage + 0.005), [leverage]);

  const press = (label: string) => onToast(label, "Тактильный отклик · 60fps spring", "green");

  return (
    <SectionShell id="controls" index="02" kicker="Controls" title="Кнопки, поля и рычаги" desc="Всё нажимается: 3D-глубина 5px, пружинная физика, звуко-подобный bounce. Плечо пересчитывает ликвидацию."
      right={<div className="flex gap-2"><Tag tone="green">pressable</Tag><Tag tone="gold">haptic</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Buttons */}
        <Card title="Button Set" sub="Duolingo-глубина · взрослая палитра" action={<Tag tone="green">7 states</Tag>}>
          <div className="flex flex-col gap-3">
            <button onClick={() => press("Continue")} className="btn3d btn3d-green w-full py-4 text-sm">Continue lesson</button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => press("LONG opened")} className="btn3d btn3d-long py-4 text-sm"><TrendingUp size={17} strokeWidth={3} /> Long</button>
              <button onClick={() => press("SHORT opened")} className="btn3d btn3d-short py-4 text-sm"><TrendingDown size={17} strokeWidth={3} /> Short</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); press("Order filled"); }, 1400); }} className="btn3d btn3d-blue py-3.5 text-xs">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Filling…</> : "Place order"}
              </button>
              <button onClick={() => press("Chest claimed")} className="btn3d btn3d-gold py-3.5 text-xs">Claim +50</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn3d btn3d-ghost py-3 text-xs">Ghost</button>
              <button disabled className="btn3d btn3d-ghost py-3 text-xs opacity-60"><Lock size={14} /> Locked</button>
            </div>
            <div className="panel-inset flex items-center gap-2 p-3">
              <button onClick={() => setAmount(Math.max(10, amount - 10))} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl"><Minus size={15} /></button>
              <div className="flex-1 text-center">
                <p className="num-mono text-lg font-extrabold text-white">${amount}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7d92c4]">position size</p>
              </div>
              <button onClick={() => setAmount(Math.min(2000, amount + 10))} className="btn3d btn3d-green h-9 w-9 !rounded-xl"><Plus size={15} /></button>
            </div>
          </div>
        </Card>

        {/* Leverage + order ticket */}
        <Card title="Leverage Ticket" sub="Слайдер → ликвидация вживую" action={<span className="num-mono rounded-lg bg-[#8ef23c]/15 px-2.5 py-1 text-sm font-extrabold text-[#8ef23c]">×{leverage}</span>}>
          <div className="mb-1 flex justify-between text-[11px] font-bold text-[#7d92c4]">
            <span>×1</span><span>×25</span><span>×50</span><span>×100</span>
          </div>
          <input type="range" min={1} max={100} value={leverage} onChange={e => setLeverage(+e.target.value)}
            className="lever w-full" style={{ ["--fill" as string]: `${leverage}%` }} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Market", "Limit", "Stop"].map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={cn("rounded-xl border py-2.5 text-xs font-extrabold transition",
                  orderType === t ? "border-[#8ef23c]/50 bg-[#8ef23c]/15 text-[#a4ff5e]" : "border-white/10 bg-black/25 text-[#8ea6d8] hover:bg-white/5")}>{t}</button>
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            <div className="panel-inset flex items-center justify-between px-3.5 py-2.5">
              <span className="text-xs text-[#8ea6d8]">Liquidation</span>
              <span className="num-mono text-sm font-extrabold text-[#ff5470]">${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="panel-inset flex items-center justify-between px-3.5 py-2.5">
              <span className="text-xs text-[#8ea6d8]">Margin</span>
              <span className="num-mono text-sm font-extrabold text-white">${(amount / leverage).toFixed(2)}</span>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[11px] font-bold"><span className="text-[#8ea6d8]">RISK</span><span className={leverage > 25 ? "text-[#ff5470]" : "text-[#8ef23c]"}>{leverage > 50 ? "DEGEN" : leverage > 25 ? "HIGH" : leverage > 10 ? "MEDIUM" : "LOW"}</span></div>
              <Meter value={leverage} tone={leverage > 25 ? "red" : leverage > 10 ? "gold" : "green"} />
            </div>
          </div>
        </Card>

        {/* Fields + selection */}
        <div className="flex flex-col gap-5">
          <Card title="Search & Fields" sub="Живой фильтр монет">
            <div className="field-3d flex items-center gap-2 px-3.5 py-3">
              <Search size={16} className="text-[#7d92c4]" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="BTC, Solana…" className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#54678f]" />
              {q && <button onClick={() => setQ("")} className="text-xs font-bold text-[#ff8ba0]">Clear</button>}
            </div>
            <div className="mt-2 max-h-[132px] space-y-1.5 overflow-y-auto pr-1">
              {filtered.map(c => (
                <motion.div key={c.sym} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.03] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</span>
                    <span className="text-xs font-extrabold text-white">{c.sym}</span>
                  </div>
                  <span className={cn("num-mono text-xs font-bold", c.chg >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{c.chg >= 0 ? "+" : ""}{c.chg.toFixed(2)}%</span>
                </motion.div>
              ))}
              {filtered.length === 0 && <p className="py-4 text-center text-xs text-[#7d92c4]">Ничего не найдено</p>}
            </div>
          </Card>
          <Card title="Selection & Switches" sub="Tap to toggle">
            <div className="space-y-3">
              {([["sound", "Звук сделок"], ["haptic", "Вибрация кнопок"], ["alerts", "Алерты китов"]] as const).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#c9d8ff]"><Bell size={14} className="text-[#7d92c4]" />{label}</span>
                  <div onClick={() => setToggles({ ...toggles, [k]: !toggles[k] })} className={cn("switch-3d", toggles[k] && "on")}><div className="knob" /></div>
                </div>
              ))}
              <button onClick={() => setAgree(!agree)} className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-left">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg border transition", agree ? "border-[#8ef23c] bg-[#8ef23c] text-[#0a2210]" : "border-white/20 bg-white/5 text-transparent")}><Check size={14} strokeWidth={3.5} /></span>
                <span className="text-xs font-semibold text-[#aebde6]">Я понимаю риски плеча ×{leverage}</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}
