import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Asset } from "../data/catalog";
import { NOTES, FALLBACK_NOTE } from "../data/notes";
import { S, E, TUNE, feel, useTuneVersion, usePlaying, copyText } from "../lib/motion";
import { IcClose, IcRefresh, IcBook, IcCode, IcCheck, IcWarn, IcGauge, IcLayers, IcArrow, IcClock, IcCopy } from "../ui/icons";
const IcArrowNav = () => <IcArrow size={16} />;
import { Tuner } from "./Tuner";
import { CopyBlock } from "./Lab";

const TABS = [
  { t: "Разбор", Icon: IcBook },
  { t: "Код", Icon: IcCode },
  { t: "Переменные", Icon: IcLayers },
  { t: "Внедрение", Icon: IcCheck },
  { t: "Партитура", Icon: IcClock },
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
                    <TokensTab asset={asset} tone={tone} />
                  )}

                  {tab === 3 && (
                    <div className="space-y-5">
                      <div>
                        <Checklist assetId={asset.id} items={note.check} tone={tone} />
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

                  {tab === 4 && (
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


/* =====================================================================
   ТОКЕНЫ СЦЕНЫ — каталог отдаёт переменные, а не только картинку.
   Длительности берутся из партитуры, физика — из текущего тюнера.
   ===================================================================== */
function TokensTab({ asset, tone }: { asset: Asset; tone: string }) {
  useTuneVersion();
  const [fmt, setFmt] = useState<"css" | "json">("css");
  const note = NOTES[asset.id] ?? FALLBACK_NOTE;

  const slug = asset.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const num = (ms: string) => {
    const m = /([\d.]+)/.exec(ms);
    return m ? m[1] : "0";
  };
  const rows = note.beats.map((b) => ({
    k: `--${slug}-${b.t.toLowerCase().replace(/[^a-z0-9а-я]+/gi, "-")}`,
    v: `${num(b.ms)}ms`,
    label: b.t,
    raw: b.ms,
  }));

  const dur = {
    instant: 0,
    micro: Math.round(120 / TUNE.speed),
    base: Math.round(280 / TUNE.speed),
    exit: Math.round(180 / TUNE.speed),
    enter: Math.round(420 / TUNE.speed),
  };

  const css = `:root {
  /* ── ${asset.title} · ${asset.sub} ─────────────────────────── */
  /* физика из тюнера: speed ×${TUNE.speed.toFixed(2)} · bounce ×${TUNE.bounce.toFixed(2)} · weight ×${TUNE.weight.toFixed(2)} */

  /* пружины */
  --${slug}-spring-snap: ${S.snap.stiffness} ${S.snap.damping} ${S.snap.mass};
  --${slug}-spring-pop: ${S.pop.stiffness} ${S.pop.damping} ${S.pop.mass};
  --${slug}-spring-soft: ${S.soft.stiffness} ${S.soft.damping} ${S.soft.mass};
  --${slug}-spring-heavy: ${S.heavy.stiffness} ${S.heavy.damping} ${S.heavy.mass};

  /* длительности */
  --${slug}-d-instant: ${dur.instant}ms;
  --${slug}-d-micro: ${dur.micro}ms;
  --${slug}-d-exit: ${dur.exit}ms;
  --${slug}-d-base: ${dur.base}ms;
  --${slug}-d-enter: ${dur.enter}ms;

  /* кривые */
  --${slug}-e-out: cubic-bezier(.16, 1, .3, 1);
  --${slug}-e-io: cubic-bezier(.83, 0, .17, 1);
  --${slug}-e-back: cubic-bezier(.34, 1.56, .64, 1);

  /* каскад и эффекты */
  --${slug}-stagger: ${Math.round(70 * TUNE.stagger)}ms;
  --${slug}-impact: ${TUNE.impact.toFixed(2)};
  --${slug}-particles: ${TUNE.particles.toFixed(2)};

  /* цвет акцента сцены */
  --${slug}-accent: ${tone};

  /* тайминги партитуры */
${rows.map((r) => `  ${r.k}: ${r.v};   /* ${r.label} */`).join("\n")}
}`;

  const json = `{
  "asset": "${asset.id}",
  "name": ${JSON.stringify(asset.title)},
  "category": ${JSON.stringify(asset.tags[0] ?? "")},
  "physics": {
    "speed": ${TUNE.speed.toFixed(2)},
    "bounce": ${TUNE.bounce.toFixed(2)},
    "weight": ${TUNE.weight.toFixed(2)},
    "springs": {
      "snap":  { "stiffness": ${S.snap.stiffness}, "damping": ${S.snap.damping}, "mass": ${S.snap.mass} },
      "pop":   { "stiffness": ${S.pop.stiffness}, "damping": ${S.pop.damping}, "mass": ${S.pop.mass} },
      "soft":  { "stiffness": ${S.soft.stiffness}, "damping": ${S.soft.damping}, "mass": ${S.soft.mass} },
      "heavy": { "stiffness": ${S.heavy.stiffness}, "damping": ${S.heavy.damping}, "mass": ${S.heavy.mass} }
    }
  },
  "duration": ${JSON.stringify(dur)},
  "stagger": ${Math.round(70 * TUNE.stagger)},
  "impact": ${TUNE.impact.toFixed(2)},
  "accent": "${tone}",
  "timeline": ${JSON.stringify(rows.map((r) => ({ at: r.raw, label: r.label })), null, 2)}
}`;

  const text = fmt === "css" ? css : json;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-mist">design-токены сцены</div>
        <p className="mt-1.5 text-[12.5px] font-bold leading-relaxed text-mist">
          Длительности вычисляются из партитуры экрана, физика берётся из текущего профиля тюнера.
          Меняешь ползунки — и значения здесь обновляются вместе с демо.
        </p>
      </div>

      <div className="flex gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
        {(["css", "json"] as const).map((f) => (
          <button key={f} onClick={() => { feel("tap"); setFmt(f); }}
            className="relative flex-1 rounded-xl px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest">
            {fmt === f && <motion.span layoutId="tokfmt" transition={S.pop} className="absolute inset-0 rounded-xl"
              style={{ background: tone + "22", boxShadow: `inset 0 0 0 1px ${tone}66` }} />}
            <span className="relative" style={{ color: fmt === f ? tone : "#8fa4c7" }}>
              {f === "css" ? "CSS-переменные" : "JSON-конфиг"}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "пружина pop", v: `${S.pop.stiffness}/${S.pop.damping}`, t: "#f2c14e" },
          { l: "каскад", v: `${Math.round(70 * TUNE.stagger)} мс`, t: "#3ec9a7" },
          { l: "импакт", v: `×${TUNE.impact.toFixed(2)}`, t: "#e46a5f" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
            <div className="mono text-[11px] font-extrabold" style={{ color: m.t }}>{m.v}</div>
            <div className="text-[8px] font-extrabold uppercase tracking-widest text-mist">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <pre className="mono max-h-[360px] overflow-auto rounded-2xl border border-white/10 bg-[#080d18] p-4 text-[10.5px] leading-relaxed"
          style={{ color: tone }}>
          {text}
        </pre>
        <button
          onClick={async () => {
            await copyText(text);
            feel("confirm");
            const el = document.getElementById(`tok-${asset.id}`);
            if (el) { el.style.opacity = "1"; setTimeout(() => { el.style.opacity = "0"; }, 1500); }
          }}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#111a2b] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
          <IcCopy size={11} /> копировать
        </button>
        <div id={`tok-${asset.id}`} className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-teal/20 px-2.5 py-1 text-[9px] font-extrabold text-teal"
          style={{ opacity: 0, transition: "opacity .25s" }}>
          скопировано
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">как это применять</div>
        <ul className="mt-2 space-y-1.5 text-[12px] font-bold leading-relaxed text-mist">
          <li>· Вынеси значения в токены до старта верстки: иначе длительности разъедутся по компонентам.</li>
          <li>· Пружину передавай объектом из конфига, а не цифрами в компоненте — так её можно перенастроить централизованно.</li>
          <li>· Тайминги партитуры держи в массиве событий: это единственный способ показать сцену дизайнеру без чтения JSX.</li>
        </ul>
      </div>
    </div>
  );
}


/* =====================================================================
   ЧЕК-ЛИСТ ПРИЁМКИ — состояние живёт между визитами и сбрасывается.
   Так его действительно можно использовать как рабочий список QA.
   ===================================================================== */
const CHECK_STATE = new Map<string, Set<number>>();
function Checklist({ assetId, items, tone }: { assetId: string; items: string[]; tone: string }) {
  useTuneVersion();
  const [, setTick] = useState(0);
  const set = CHECK_STATE.get(assetId) ?? new Set<number>();
  const done = items.filter((_, i) => set.has(i)).length;
  const pct = items.length ? (done / items.length) * 100 : 0;

  const toggle = (i: number) => {
    const s = CHECK_STATE.get(assetId) ?? new Set<number>();
    if (s.has(i)) s.delete(i);
    else { s.add(i); feel("confirm", [8, 16]); }
    CHECK_STATE.set(assetId, s);
    setTick((v) => v + 1);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: tone }}>
          <IcCheck size={14} /> чек-лист приёмки
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] font-extrabold" style={{ color: done === items.length ? tone : "#8fa4c7" }}>
            {done} / {items.length}
          </span>
          {done > 0 && (
            <button onClick={() => { CHECK_STATE.delete(assetId); setTick((v) => v + 1); feel("tap"); }}
              className="flex items-center gap-1 rounded-full border border-white/12 px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
              <IcRefresh size={10} /> сброс
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: done === items.length ? tone : "linear-gradient(90deg," + tone + "aa," + tone + ")" }}
          animate={{ width: `${pct}%` }} transition={{ ...S.soft, damping: 24 }} />
      </div>

      <div className="space-y-2">
        {items.map((c, i) => {
          const on = set.has(i);
          return (
            <motion.button key={c} onClick={() => toggle(i)}
              initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: on ? 0.68 : 1 }}
              transition={{ delay: i * 0.05, ...S.soft }}
              whileTap={{ scale: 0.985 }}
              className="flex w-full items-start gap-2.5 rounded-xl border p-3 text-left"
              style={{
                borderColor: on ? tone + "55" : "rgba(255,255,255,.08)",
                background: on ? tone + "0d" : "rgba(255,255,255,.02)",
              }}>
              <motion.span animate={{ scale: on ? [1, 1.18, 1] : 1 }} transition={{ duration: 0.32 }}
                className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md border"
                style={{ borderColor: on ? tone : "rgba(255,255,255,.22)", background: on ? tone : "transparent", color: "#06231c" }}>
                {on && <IcCheck size={12} />}
              </motion.span>
              <span className="text-[12.5px] font-bold leading-snug text-white/85"
                style={{ textDecoration: on ? "line-through" : "none" }}>{c}</span>
            </motion.button>
          );
        })}
      </div>

      {done === items.length && (
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={S.pop}
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: tone + "1a", boxShadow: `inset 0 0 0 1px ${tone}55` }}>
          <IcCheck size={14} />
          <span className="text-[11px] font-extrabold" style={{ color: tone }}>
            Экран готов к передаче в разработку
          </span>
        </motion.div>
      )}
    </div>
  );
}
