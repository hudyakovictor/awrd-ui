import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { JuiceLayer, type SceneEvent } from "../fx/juice";

function useClock() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const f = () => {
      const d = new Date();
      setT(`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/** 300×620 tactile device: titanium body, inset screen well, glass glare. Content mounts only while visible. */
export function PhoneFrame({ children, onEvent }: { children: ReactNode; onEvent?: (e: SceneEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "150px" });
  const clock = useClock();
  return (
    <div
      ref={ref}
      className="relative h-[620px] w-[300px] shrink-0 rounded-[52px] p-[10px]"
      style={{
        background: "linear-gradient(150deg, #33406b 0%, #1d2747 30%, #0e1426 70%, #253254 100%)",
        boxShadow: "-5px -5px 14px rgba(255,255,255,.08), 12px 18px 40px rgba(1,2,8,.92), inset 0 2px 0 rgba(255,255,255,.2), inset 0 -3px 0 rgba(0,0,0,.65)",
      }}
    >
      {/* antenna lines */}
      <span className="absolute left-10 top-0 h-[3px] w-10 rounded-b bg-black/60" />
      <span className="absolute bottom-0 left-10 h-[3px] w-10 rounded-t bg-black/60" />
      {/* side buttons */}
      <span className="absolute -left-[2.5px] top-[116px] h-8 w-[3px] rounded-l-md" style={{ background: "linear-gradient(180deg,#42507c,#161e36)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)" }} />
      <span className="absolute -left-[2.5px] top-[162px] h-[52px] w-[3px] rounded-l-md" style={{ background: "linear-gradient(180deg,#42507c,#161e36)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)" }} />
      <span className="absolute -right-[2.5px] top-[148px] h-[72px] w-[3px] rounded-r-md" style={{ background: "linear-gradient(180deg,#42507c,#161e36)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)" }} />

      <div
        className="relative h-full w-full overflow-hidden rounded-[42px] bg-[#121b30]"
        style={{ transform: "translateZ(0)", boxShadow: "inset 5px 5px 12px rgba(1,2,8,.85), inset -2px -2px 6px rgba(255,255,255,.06)" }}
      >
        <div className="relative z-40 flex h-9 items-center justify-between px-7 text-[13px] font-extrabold text-white/85">
          <span className="tnum tabular-nums">{clock}</span>
          <span className="absolute left-1/2 top-2.5 flex h-[23px] w-[84px] -translate-x-1/2 items-center justify-end rounded-full bg-[#04060e] pr-2.5" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.08)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #3b5a90, #070c18)", boxShadow: "inset 0 0 2px #000" }} />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex items-end gap-[2px]" aria-hidden>
              {[5, 8, 11].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-white/80" style={{ height: h }} />
              ))}
            </span>
            <span className="h-[11px] w-6 rounded-[4px] border border-white/50 p-[1.5px]">
              <motion.span
                className="block h-full rounded-[2px]"
                style={{ background: "linear-gradient(90deg,#22c55e,#4ade80)" }}
                initial={{ width: "100%" }}
                animate={{ width: ["100%", "72%", "100%"] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-9">{inView ? <JuiceLayer onEvent={onEvent}>{children}</JuiceLayer> : null}</div>

        {/* glass glare */}
        <div
          className="pointer-events-none absolute inset-0 z-[65]"
          style={{ background: "linear-gradient(115deg, rgba(255,255,255,.09) 0%, transparent 22%, transparent 78%, rgba(255,255,255,.04) 100%)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-[70] h-1.5 w-28 -translate-x-1/2 rounded-full bg-white/25" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.5)" }} />
      </div>
    </div>
  );
}
