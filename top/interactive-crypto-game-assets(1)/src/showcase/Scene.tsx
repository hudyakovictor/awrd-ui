/* Showcase shell for large TRADELINGO exhibition blocks.
   One memorable scene per section: atmosphere, header, fullscreen. */
import { motion } from "framer-motion";
import { Expand, Shrink } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { sfx } from "../fx/sfx";

export function ShowcaseSection({
  id, index, kicker, title, desc, accent = "#8ef23c", tags, children,
}: {
  id: string; index: string; kicker: string; title: string; desc: string;
  accent?: string; tags?: ReactNode; children: ReactNode;
}) {
  const [full, setFull] = useState(false);
  return (
    <section id={id} className="relative mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.55 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="panel-3d flex h-14 w-14 shrink-0 items-center justify-center !rounded-2xl">
            <span className="display text-lg font-extrabold" style={{ color: accent, textShadow: `0 0 18px ${accent}` }}>{index}</span>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-[6px] w-10 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #5b8cff)` }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea6d8]">{kicker}</span>
            </div>
            <h2 className="display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[32px]">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#9fb2dd]">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tags}
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

      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-white/10",
          full && "fixed inset-0 z-[95] overflow-y-auto rounded-none border-0 bg-[#020617]/95 p-4 backdrop-blur-xl sm:p-8",
        )}
        style={{
          background: full
            ? undefined
            : "linear-gradient(180deg, rgba(20,40,90,.55), rgba(6,12,34,.75))",
          boxShadow: full ? undefined : "0 24px 60px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)",
        }}
      >
        {/* atmosphere */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-[90px]" style={{ background: `${accent}26` }} />
          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#5b8cff]/15 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[.5]"
            style={{
              backgroundImage: "linear-gradient(rgba(122,156,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(122,156,255,.06) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 75%)",
            }}
          />
        </div>
        <div className={cn("relative", full && "mx-auto max-w-[1200px] pb-16")}>
          {full && (
            <div className="mb-4 flex items-center justify-between">
              <p className="display text-lg font-extrabold text-white">{title}</p>
              <button onClick={() => setFull(false)} className="btn3d btn3d-ghost px-4 py-2 text-[11px]">
                <Shrink size={14} /> Close
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Seg<T extends string>({
  options, value, onChange, accent = "#8ef23c",
}: {
  options: readonly T[]; value: T; onChange: (v: T) => void; accent?: string;
}) {
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
          style={value === o ? { background: accent, boxShadow: "0 3px 0 rgba(0,0,0,.4)" } : undefined}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function SceneStat({ label, value, sub, color = "#fff" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="panel-inset px-3.5 py-2.5">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#7d92c4]">{label}</p>
      <p className="num-mono text-base font-extrabold leading-tight" style={{ color }}>{value}</p>
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
      className={cn("overflow-hidden rounded-[22px] border border-white/10 bg-[#0a1740]/60 backdrop-blur", className)}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 16px 40px -18px rgba(0,0,0,.7)" }}
    >
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-2.5 pt-3.5">
          <div>
            {title && (
              <p className="display flex items-center gap-2 text-[14px] font-extrabold text-white">
                {accent && <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />}
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
