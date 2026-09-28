import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle2, Info, SearchX, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { Card, Meter, SectionShell, Tag } from "../components/ui";
import { cn } from "../utils/cn";

export default function Feedback({ onToast }: { onToast: (t: string, s: string, tone: string) => void }) {
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(65);
  const [banner, setBanner] = useState(true);

  return (
    <SectionShell id="feedback" index="06" kicker="Feedback" title="Тосты, модалки и состояния" desc="Триггерь тосты, открывай модалку и bottom-sheet, переключай скелетоны. Всё с пружинными анимациями."
      right={<Tag tone="blue">spring · 60fps</Tag>}>
      {banner && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 overflow-hidden rounded-2xl border border-[#ffc531]/40 bg-gradient-to-r from-[#ffc531]/15 via-[#ff8b3d]/10 to-transparent px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffc531] text-[#3a2200]" style={{ boxShadow: "0 3px 0 #8a5c00" }}>
            <AlertTriangle size={18} strokeWidth={2.5} />
          </span>
          <p className="flex-1 text-[13px] font-bold text-white">Margin Call близко · плечо ×50 на ETH. <span className="text-[#ffd76a]">Снизь риск или добавь маржу.</span></p>
          <button onClick={() => onToast("Маржа добавлена", "+$100 к позиции ETH", "green")} className="btn3d btn3d-gold hidden px-4 py-2 text-[11px] sm:inline-flex">Fix</button>
          <button onClick={() => setBanner(false)} className="text-[#8ea6d8] hover:text-white"><X size={16} /></button>
        </motion.div>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        <Card title="Toast Triggers" sub="Улетают вправо-вверх">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onToast("Сделка закрыта +$248", "Take-profit исполнен", "green")} className="btn3d btn3d-green py-3 text-[11px]"><CheckCircle2 size={14} /> Win</button>
            <button onClick={() => onToast("Стоп-лосс −$42", "Риск 1% · по плану", "short")} className="btn3d btn3d-short py-3 text-[11px]"><ShieldAlert size={14} /> Loss</button>
            <button onClick={() => onToast("Кит купил 240 BTC", "Whale alert · Binance", "blue")} className="btn3d btn3d-blue py-3 text-[11px]"><Bell size={14} /> Whale</button>
            <button onClick={() => onToast("Новый урок: Фьючерсы", "Модуль 3 разблокирован", "gold")} className="btn3d btn3d-gold py-3 text-[11px]"><Info size={14} /> Lesson</button>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-bold"><span className="text-[#8ea6d8]">SYNC PROGRESS</span><span className="num-mono text-white">{progress}%</span></div>
            <Meter value={progress} tone="blue" />
            <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(+e.target.value)} className="lever mt-2 w-full" style={{ ["--fill" as string]: `${progress}%` }} />
          </div>
        </Card>

        <Card title="Modal & Sheet" sub="Попробуй оба паттерна">
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setModal(true)} className="btn3d btn3d-blue w-full py-3.5 text-xs">Open modal</button>
            <button onClick={() => setSheet(true)} className="btn3d btn3d-violet w-full py-3.5 text-xs">Open bottom sheet</button>
            <div className="panel-inset p-3 text-center">
              <p className="text-[11px] font-bold text-[#8ea6d8]">Confirm close?</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => onToast("Отменено", "Позиция оставлена", "ghost")} className="btn3d btn3d-ghost py-2 text-[10px]">Cancel</button>
                <button onClick={() => onToast("Закрыто", "PnL зафиксирован", "short")} className="btn3d btn3d-short py-2 text-[10px]">Delete</button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Skeleton / Loaded" sub="Toggle loading" action={
          <button onClick={() => setLoading(!loading)} className={cn("switch-3d !h-7 !w-[52px]", loading && "on")}><div className="knob !h-[20px] !w-[20px]" style={loading ? { left: 27 } : {}} /></button>
        }>
          {loading ? (
            <div className="space-y-2.5">
              {[92, 100, 78].map((w, i) => (
                <div key={i} className="overflow-hidden rounded-xl bg-white/6 p-3" style={{ width: `${w}%` }}>
                  <div className="shimmer-line h-2.5 w-2/3 rounded-full bg-white/10" />
                  <div className="shimmer-line mt-2 h-2 w-1/2 rounded-full bg-white/8" style={{ animationDelay: `${i * .2}s` }} />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8ef23c]/30 border-t-[#8ef23c]" />
                <span className="text-[11px] font-bold text-[#8ea6d8]">Загружаем ордера…</span>
              </div>
            </div>
          ) : (
            <div className="anim-pop space-y-2">
              {[["BTC Long ×10", "+$248.10", "#2ede8a"], ["ETH Short ×5", "−$12.40", "#ff5470"], ["SOL Long ×3", "+$86.00", "#2ede8a"]].map(([t, v, c]) => (
                <div key={t} className="panel-inset flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-bold text-white">{t}</span>
                  <span className="num-mono text-xs font-extrabold" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Empty State" sub="Нет открытых сделок">
          <div className="py-2 text-center">
            <div className="anim-floaty mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/12 bg-gradient-to-b from-[#22345e] to-[#0e1f4a]">
              <SearchX size={28} className="text-[#54678f]" />
            </div>
            <p className="display mt-3 text-sm font-extrabold text-white">No Items Found</p>
            <p className="mb-3 text-[11px] text-[#7d92c4]">Открой первую paper-сделку без риска</p>
            <button onClick={() => onToast("Paper trade создан", "BTC Long · $1,000 virtual", "long")} className="btn3d btn3d-green px-5 py-2.5 text-[11px]">+ New trade</button>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020617]/70 p-4 backdrop-blur-sm" onClick={() => setModal(false)}>
            <motion.div initial={{ scale: .85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 12 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={e => e.stopPropagation()} className="panel-3d w-full max-w-sm p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#ff8ba0] to-[#c81d47] text-white" style={{ boxShadow: "0 4px 0 #7c0f2c" }}>
                <ShieldAlert size={26} />
              </div>
              <h4 className="display mt-3 text-lg font-extrabold text-white">Закрыть все позиции?</h4>
              <p className="mt-1 text-[13px] text-[#8ea6d8]">Суммарный PnL <b className="text-[#2ede8a]">+$321.70</b> будет зафиксирован.</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button onClick={() => setModal(false)} className="btn3d btn3d-ghost py-3 text-xs">Cancel</button>
                <button onClick={() => { setModal(false); onToast("Все позиции закрыты", "+$321.70 · +60 XP", "gold"); }} className="btn3d btn3d-short py-3 text-xs">Close all</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {sheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-[#020617]/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSheet(false)}>
            <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: "spring", stiffness: 220, damping: 26 }}
              onClick={e => e.stopPropagation()} className="panel-3d w-full max-w-md !rounded-b-none p-5 sm:!rounded-[24px]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
              <h4 className="display text-base font-extrabold text-white">Order confirmed</h4>
              <p className="text-xs text-[#8ea6d8]">BTC Long ×10 · swipe-friendly sheet</p>
              <div className="panel-inset mt-3 grid grid-cols-3 gap-2 p-3 text-center">
                {[["Entry", "$97,431"], ["Size", "0.10 BTC"], ["Margin", "$974"]].map(([k, v]) => (
                  <div key={k}><p className="text-[10px] font-bold uppercase tracking-widest text-[#7d92c4]">{k}</p><p className="num-mono text-sm font-extrabold text-white">{v}</p></div>
                ))}
              </div>
              <button onClick={() => { setSheet(false); onToast("Ордер размещён", "BTC Long ×10", "long"); }} className="btn3d btn3d-green mt-4 w-full py-3.5 text-xs">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
