/* Showcase shell v2 for large TRADELINGO exhibition blocks.
   Atmosphere variant · pointer spotlight · scroll parallax · cinematic reveal
   · fullscreen · keyboard hints · "memorable moment" caption. */
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Expand, Keyboard, Shrink, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { sfx } from "../fx/sfx";
import { Backdrop, KeyHints, useSceneKeys, type BackdropVariant } from "./fx";

const VARIANT_BY_INDEX: BackdropVariant[] = ["grid", "aurora", "floor", "scan", "holo", "stars", "radar", "circuit"];

export function ShowcaseSection({
  id, index, kicker, title, desc, accent = "#8ef23c", tags, children, variant, keys, moment, hotkeys,
}: {
  id: string; index: string; kicker: string; title: string; desc: string;
  accent?: string; tags?: ReactNode; children: ReactNode;
  variant?: BackdropVariant; keys?: { k: string; d: string }[]; moment?: string;
  hotkeys?: Record<string, () => void>;
}) {
  const hk = useSceneKeys(hotkeys ?? {});
  const [full, setFull] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bg: BackdropVariant = variant ?? VARIANT_BY_INDEX[(parseInt(index, 10) || 0) % VARIANT_BY_INDEX.length];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const blobA = useTransform(sp, [0, 1], [-80, 80]);
  const blobB = useTransform(sp, [0, 1], [90, -90]);
  const headerX = useTransform(sp, [0, 0.5, 1], [-18, 0, 12]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [full]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={sectionRef} id={id} className="relative mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.55 }}
        style={{ x: headerX }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="panel-3d relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden !rounded-2xl"
            whileHover={{ rotate: -6, scale: 1.06 }}
          >
            <motion.div
              className="absolute inset-0 opacity-40"
              style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent 40%)` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-b from-[#1b3773] to-[#101f47]" />
            <span className="display relative text-lg font-extrabold" style={{ color: accent, textShadow: `0 0 18px ${accent}` }}>{index}</span>
          </motion.div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <motion.span
                className="h-[6px] rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, #5b8cff)` }}
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea6d8]">{kicker}</span>
            </div>
            <h2 className="display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[32px]">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#9fb2dd]">{desc}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags}
          {keys && keys.length > 0 && (
            <button
              onClick={() => { setShowKeys((v) => !v); sfx.tick(); }}
              className={cn("btn3d px-3 py-2.5 text-[11px]", showKeys ? "btn3d-blue" : "btn3d-ghost")}
              aria-label="keyboard"
            >
              <Keyboard size={14} />
            </button>
          )}
          <button
            onClick={() => { setFull((v) => !v); sfx.whoosh(); }}
            className="btn3d btn3d-ghost px-3.5 py-2.5 text-[11px]"
            aria-label="fullscreen"
          >
            {full ? <Shrink size={14} /> : <Expand size={14} />}
            {full ? "Close" : "Expand"}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showKeys && keys && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5">
              <KeyHints keys={keys} />
              <p className="mt-1 text-[10px] text-[#54678f]">Клавиши работают, когда курсор находится над сценой</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerEnter={hk.onPointerEnter}
        onPointerLeave={hk.onPointerLeave}
        initial={{ opacity: 0, y: 40, scale: 0.975, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "group/stage relative overflow-hidden rounded-[28px] border border-white/10",
          full && "!fixed inset-0 z-[95] overflow-y-auto rounded-none border-0 bg-[#020617]/96 p-4 backdrop-blur-xl sm:p-8",
        )}
        style={{
          background: full ? undefined : "linear-gradient(180deg, rgba(20,40,90,.55), rgba(6,12,34,.78))",
          boxShadow: full ? undefined : `0 24px 60px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px ${accent}10`,
        }}
      >
        {/* atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div style={{ y: blobA, background: `${accent}26` }} className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-[90px]" />
          <motion.div style={{ y: blobB }} className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#5b8cff]/15 blur-[100px]" />
          <Backdrop variant={bg} accent={accent} />
          {/* pointer spotlight */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/stage:opacity-100"
            style={{ background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), ${accent}14, transparent 65%)` }}
          />
          {/* animated top edge */}
          <motion.div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
        </div>
        <div className={cn("relative p-3 sm:p-4", full && "mx-auto max-w-[1240px] pb-16")}>
          {full && (
            <div className="mb-4 flex items-center justify-between">
              <p className="display text-lg font-extrabold text-white">{title}</p>
              <button onClick={() => setFull(false)} className="btn3d btn3d-ghost px-4 py-2 text-[11px]">
                <Shrink size={14} /> Close · Esc
              </button>
            </div>
          )}
          {children}
          {moment && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-[#7d92c4]">
              <Sparkles size={13} style={{ color: accent }} />
              <span>{moment}</span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export function Seg<T extends string>({
  options, value, onChange, accent = "#8ef23c",
}: {
  options: readonly T[]; value: T; onChange: (v: T) => void; accent?: string;
}) {
  const uid = useRef(`seg-${Math.random().toString(36).slice(2)}`).current;
  return (
    <div className="panel-inset flex flex-wrap gap-1 p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => { onChange(o); sfx.tick(); }}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition",
            value === o ? "text-[#081130]" : "text-[#8ea6d8] hover:text-white",
          )}
        >
          {value === o && (
            <motion.span
              layoutId={uid}
              className="absolute inset-0 rounded-lg"
              style={{ background: accent, boxShadow: `0 3px 0 rgba(0,0,0,.4), 0 0 14px ${accent}66` }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

export function SceneStat({ label, value, sub, color = "#fff" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="panel-inset relative overflow-hidden px-3.5 py-2.5">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#7d92c4]">{label}</p>
      <motion.p
        key={value}
        initial={{ y: 6, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="num-mono text-base font-extrabold leading-tight"
        style={{ color }}
      >
        {value}
      </motion.p>
      {sub && <p className="text-[10px] font-bold text-[#8ea6d8]">{sub}</p>}
    </div>
  );
}

export function ScenePanel({
  title, sub, right, children, className, accent,
}: {
  title?: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string; accent?: string;
}) {
  return (
    <div
      className={cn(
        "group/panel relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0a1740]/60 backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-white/20",
        className,
      )}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 16px 40px -18px rgba(0,0,0,.7)" }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-2.5 pt-3.5">
          <div>
            {title && (
              <p className="display flex items-center gap-2 text-[14px] font-extrabold text-white">
                {accent && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" style={{ background: accent }} />
                    <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
                  </span>
                )}
                {title}
              </p>
            )}
            {sub && <p className="mt-0.5 text-[11px] text-[#8ea6d8]">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
