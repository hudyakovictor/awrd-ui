import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Asset } from "../data/catalog";
import { NOTES, FALLBACK_NOTE } from "../data/notes";
import { S, E, feel, useTuneVersion, usePlaying } from "../lib/motion";
import { IcClose, IcRefresh, IcBook, IcCode, IcCheck, IcWarn, IcGauge, IcLayers, IcArrow } from "../ui/icons";
const IcArrowNav = () => <IcArrow size={16} />;
import { Tuner } from "./Tuner";
import { CopyBlock } from "./Lab";

const TABS = [
  { t: "Разбор", Icon: IcBook },
  { t: "Код", Icon: IcCode },
  { t: "Внедрение", Icon: IcCheck },
  { t: "Партитура", Icon: IcLayers },
];

export function Inspector({ asset, tone, onClose, onPrev, onNext, pos }: {
  asset: Asset | null; tone: string; onClose: () => void;
  onPrev?: () => void; onNext?: () => void; pos?: string;
}) {
  const [tab, setTab] = useState(0);
  const [replay, setReplay] = useState(0);
  const v = useTuneVersion();
  const playing = usePlaying();
  const note = asset ? NOTES[asset.id] ?? FALLBACK_NOTE : FALLBACK_NOTE;

  return (
    <AnimatePresence>
      {asset && (
        <motion.div className="no-bar fixed inset-0 z-[90] overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="fixed inset-0 bg-[#060a14]/94 backdrop-blur-xl" onClick={onClose} />

          <motion.div
            initial={{ y: 56, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 36, opacity: 0, scale: 0.98 }}
            transition={{ ...S.soft, damping: 26 }}
            className="relative mx-auto grid max-w-[1240px] gap-8 px-5 py-10 lg:grid-cols-[320px_minmax(0,1fr)_330px]"
          >
            {/* ---- колонка 1: живой экран ---- */}
            <div className="relative mx-auto lg:sticky lg:top-8 lg:self-start">
              <motion.div className="absolute -inset-8 -z-10 rounded-full blur-3xl" style={{ background: tone + "2e" }}
                animate={{ opacity: [0.45, 0.85, 0.45] }} transition={{ duration: 5, repeat: Infinity }} />
              <asset.Comp key={`${replay}-${v}`} live={playing} />
              <button
                onClick={() => { feel("sweep"); setReplay((r) => r + 1); }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] py-2.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-mist hover:text-white"
              >
                <IcRefresh size={13} /> проиграть сцену заново
              </button>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => { feel("tap"); onPrev?.(); }}
                  className="grid h-10 flex-1 place-items-center rounded-2xl border border-white/12 bg-white/[0.04] text-mist hover:text-white">
                  <span className="rotate-180"><IcArrowNav /></span>
                </button>
                <span className="mono w-16 text-center text-[10px] font-bold text-mist">{pos}</span>
                <button onClick={() => { feel("tap"); onNext?.(); }}
                  className="grid h-10 flex-1 place-items-center rounded-2xl border border-white/12 bg-white/[0.04] text-mist hover:text-white">
                  <IcArrowNav />
                </button>
              </div>
              <div className="mono mt-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-mist/70">
                ← → переключение · esc закрыть
              </div>
            </div>

            {/* ---- колонка 2: содержание ---- */}
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.35em]" style={{ color: tone }}>{asset.sub}</div>
                  <h2 className="title-xl mt-2 text-4xl uppercase sm:text-5xl">{asset.title}</h2>
                </div>
                <motion.button whileHover={{ rotate: 90, scale: 1.08 }} whileTap={{ scale: 0.88 }} transition={S.pop}
                  onClick={() => { feel("tap"); onClose(); }}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5 text-mist lg:hidden">
                  <IcClose size={18} />
                </motion.button>
              </div>

              <p className="mt-4 text-sm font-bold leading-relaxed text-mist">{asset.brief}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {asset.tags.map((t) => (
                  <span key={t} className="mono rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ borderColor: tone + "55", color: tone, background: tone + "12" }}>{t}</span>
                ))}
                <span className="mono ml-auto flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-mist">
                  <IcGauge size={12} /> {note.perf.split(".")[0]}
                </span>
              </div>

              <div className="mt-7 flex gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
                {TABS.map((t, i) => (
                  <button key={t.t} onClick={() => { feel("tap"); setTab(i); }} className="relative flex-1 rounded-xl px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-widest">
                    {tab === i && <motion.span layoutId="insp" transition={S.pop} className="absolute inset-0 rounded-xl" style={{ background: tone + "22", boxShadow: `inset 0 0 0 1px ${tone}66` }} />}
                    <span className="relative flex items-center justify-center gap-1.5" style={{ color: tab === i ? tone : "#8fa4c7" }}>
                      <t.Icon size={13} />{t.t}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(8px)" }} transition={{ duration: 0.3, ease: E.out }} className="mt-5">

                  {tab === 0 && (
                    <div className="space-y-3">
                      {asset.secrets.map((s, i) => (
                        <motion.div key={s.t} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06, ...S.soft }}
                          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-white/20">
                          <div className="flex items-start gap-3">
                            <span className="mono mt-0.5 text-sm font-extrabold" style={{ color: tone }}>{String(i + 1).padStart(2, "0")}</span>
                            <div>
                              <div className="text-[14px] font-extrabold">{s.t}</div>
                              <p className="mt-1 text-[13px] font-bold leading-relaxed text-mist">{s.d}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {tab === 1 && (
                    <div className="space-y-4">
                      <CopyBlock code={asset.code} tone={tone} />
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-mist">как подключить</div>
                        <p className="mt-2 text-[12.5px] font-bold leading-relaxed text-mist">
                          Код опирается на общий конфиг пружин. Забери его во вкладке справа («Тюнер») — значения там
                          соответствуют тому, что ты видишь на экране прямо сейчас.
                        </p>
                      </div>
                    </div>
                  )}

                  {tab === 2 && (
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-teal">
                          <IcCheck size={14} /> чеклист
                        </div>
                        <div className="space-y-2">
                          {note.check.map((c, i) => (
                            <motion.div key={c} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05, ...S.soft }}
                              className="flex items-start gap-2.5 rounded-xl border border-teal/20 bg-teal/[0.06] p-3">
                              <span className="mt-0.5 text-teal"><IcCheck size={13} /></span>
                              <span className="text-[12.5px] font-bold text-white/85">{c}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-coral">
                          <IcWarn size={14} /> где ломается
                        </div>
                        <div className="space-y-2">
                          {note.traps.map((c, i) => (
                            <motion.div key={c} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05, ...S.soft }}
                              className="flex items-start gap-2.5 rounded-xl border border-coral/20 bg-coral/[0.06] p-3">
                              <span className="mt-0.5 text-coral"><IcWarn size={13} /></span>
                              <span className="text-[12.5px] font-bold text-white/85">{c}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <span className="mt-0.5 text-mist"><IcGauge size={14} /></span>
                        <span className="text-[12.5px] font-bold text-mist"><b className="text-white">Стоимость: </b>{note.perf}</span>
                      </div>
                    </div>
                  )}

                  {tab === 3 && (
                    <div className="space-y-2">
                      {note.beats.map((b, i) => (
                        <motion.div key={b.t} initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06, ...S.soft }}
                          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
                          <span className="mono w-6 text-[11px] font-extrabold" style={{ color: tone }}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex-1 text-[12.5px] font-extrabold">{b.t}</span>
                          <span className="mono rounded-lg bg-black/40 px-2 py-1 text-[11px] font-bold" style={{ color: tone }}>{b.ms} мс</span>
                        </motion.div>
                      ))}
                      <p className="pt-2 text-[12px] font-bold leading-relaxed text-mist">
                        Тайминги указаны при темпе ×1. Тюнер справа масштабирует их целиком — так проверяют,
                        как сцена ощущается на «медленном» и «быстром» профиле устройства.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ---- колонка 3: тюнер ---- */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="mb-3 hidden justify-end lg:flex">
                <motion.button whileHover={{ rotate: 90, scale: 1.08 }} whileTap={{ scale: 0.88 }} transition={S.pop}
                  onClick={() => { feel("tap"); onClose(); }}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-mist">
                  <IcClose size={18} />
                </motion.button>
              </div>
              <Tuner tone={tone} compact />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
