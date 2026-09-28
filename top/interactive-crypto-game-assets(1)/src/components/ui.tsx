import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

export function SectionShell({ id, index, kicker, title, desc, right, children }: {
  id: string; index: string; kicker: string; title: string; desc: string; right?: ReactNode; children: ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .5 }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div className="flex items-start gap-4">
            <div className="panel-3d flex h-14 w-14 shrink-0 items-center justify-center !rounded-2xl">
              <span className="display text-lg font-800 font-extrabold text-[#8ef23c] text-glow-green">{index}</span>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[6px] w-10 rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea6d8]">{kicker}</span>
              </div>
              <h2 className="display text-2xl sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">{title}</h2>
              <p className="mt-1 max-w-xl text-sm text-[#9fb2dd]">{desc}</p>
            </div>
          </div>
          {right}
        </div>
      </motion.div>
      {children}
    </section>
  );
}

export function Card({ className, children, title, sub, action, pad = true }: {
  className?: string; children: ReactNode; title?: string; sub?: string; action?: ReactNode; pad?: boolean;
}) {
  return (
    <div className={cn("panel-3d card-hover overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 pt-4 pb-3">
          <div>
            {title && <h3 className="display text-[15px] font-bold text-white">{title}</h3>}
            {sub && <p className="mt-0.5 text-xs text-[#8ea6d8]">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export function Tag({ children, tone = "blue" }: { children: ReactNode; tone?: "green" | "blue" | "gold" | "red" | "violet" | "ghost" }) {
  const tones: Record<string, string> = {
    green: "bg-[#8ef23c]/15 text-[#a4ff5e] border-[#8ef23c]/30",
    blue: "bg-[#5b8cff]/15 text-[#9db9ff] border-[#5b8cff]/30",
    gold: "bg-[#ffc531]/15 text-[#ffd76a] border-[#ffc531]/30",
    red: "bg-[#ff5470]/15 text-[#ff8ba0] border-[#ff5470]/30",
    violet: "bg-[#a78bff]/15 text-[#c9b6ff] border-[#a78bff]/30",
    ghost: "bg-white/8 text-[#b9c8ee] border-white/15",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold", tones[tone])}>{children}</span>;
}

export function CopyHex({ hex }: { hex: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(hex); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="group flex items-center gap-1.5 rounded-lg bg-black/30 px-2 py-1 font-mono text-[11px] text-[#9fb2dd] transition hover:text-white"
    >
      {hex}
      {ok ? <Check size={12} className="text-[#8ef23c]" /> : <Copy size={12} className="opacity-50 group-hover:opacity-100" />}
    </button>
  );
}

export function Meter({ value, max = 100, tone = "green", h = 12 }: { value: number; max?: number; tone?: "green" | "gold" | "blue" | "red" | "violet"; h?: number }) {
  const grad: Record<string, string> = {
    green: "linear-gradient(180deg,#b6ff7d,#8ef23c 50%,#62c91d)",
    gold: "linear-gradient(180deg,#ffe29a,#ffc531 50%,#e79a06)",
    blue: "linear-gradient(180deg,#9db9ff,#5b8cff 50%,#3358d6)",
    red: "linear-gradient(180deg,#ff9db0,#ff5470 50%,#c81d47)",
    violet: "linear-gradient(180deg,#d5c6ff,#a78bff 50%,#7350e6)",
  };
  return (
    <div className="panel-inset w-full overflow-hidden !rounded-full" style={{ height: h }}>
      <motion.div className="h-full rounded-full" style={{ background: grad[tone], boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)" }}
        initial={false} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
    </div>
  );
}

export function StatPill({ icon, label, value, tone = "gold" }: { icon: ReactNode; label: string; value: string; tone?: "gold" | "green" | "red" | "blue" | "violet" }) {
  const dot: Record<string, string> = { gold: "text-[#ffc531]", green: "text-[#8ef23c]", red: "text-[#ff5470]", blue: "text-[#5b8cff]", violet: "text-[#a78bff]" };
  return (
    <div className="panel-inset flex items-center gap-2.5 rounded-2xl px-3.5 py-2">
      <span className={dot[tone]}>{icon}</span>
      <span className="leading-none">
        <span className="num-mono block text-sm font-extrabold text-white">{value}</span>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7d92c4]">{label}</span>
      </span>
    </div>
  );
}
