/* 55 · SESSION CLOCK — 24h market dial + spinning globe.
   Drag the hand · auto-spin time · session arcs & overlaps · radial volume
   profile · macro events jump · globe with day/night terminator & cities. */
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, useOnScreen, useRafLoop, useSceneKeys } from "../showcase/fx";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const SESSIONS = [
  { id: "Sydney", from: 21, to: 6, color: "#14c8f5" },
  { id: "Tokyo", from: 0, to: 9, color: "#a78bff" },
  { id: "London", from: 7, to: 16, color: "#5b8cff" },
  { id: "New York", from: 13, to: 22, color: "#2ede8a" },
];
const CITIES = [
  { n: "Sydney", lon: 151, lat: -33, s: "Sydney" },
  { n: "Tokyo", lon: 139, lat: 35, s: "Tokyo" },
  { n: "Singapore", lon: 104, lat: 1, s: "Tokyo" },
  { n: "Dubai", lon: 55, lat: 25, s: "London" },
  { n: "London", lon: 0, lat: 51, s: "London" },
  { n: "Frankfurt", lon: 8, lat: 50, s: "London" },
  { n: "New York", lon: -74, lat: 40, s: "New York" },
  { n: "Chicago", lon: -87, lat: 41, s: "New York" },
];
const EVENTS = [
  { t: 0, n: "Asia open", c: "#a78bff" },
  { t: 7, n: "London open", c: "#5b8cff" },
  { t: 8, n: "Options expiry", c: "#ffc531" },
  { t: 12.5, n: "US CPI", c: "#ff5470" },
  { t: 13.5, n: "NY open", c: "#2ede8a" },
  { t: 18, n: "FOMC", c: "#ff8b3d" },
];

const inSession = (h: number, s: (typeof SESSIONS)[number]) => (s.from < s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to);
const volAt = (h: number) => {
  const act = SESSIONS.filter((s) => inSession(h, s)).length;
  const bump = Math.exp(-((h - 13.5) ** 2) / 3) * 0.9 + Math.exp(-((h - 7.5) ** 2) / 2) * 0.5;
  return clamp(0.18 + act * 0.2 + bump, 0.1, 1.4);
};
const fmtT = (h: number) => {
  const hh = Math.floor(((h % 24) + 24) % 24);
  const mm = Math.floor((((h % 1) + 1) % 1) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export default function SessionClock() {
  const time = useMotionValue(13.2);
  const [t, setT] = useState(13.2);
  useMotionValueEvent(time, "change", (v) => setT(((v % 24) + 24) % 24));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<"1h/s" | "3h/s" | "8h/s">("1h/s");
  const [tz, setTz] = useState<"UTC" | "Local">("UTC");
  const [hoverH, setHoverH] = useState<number | null>(null);
  const dialRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastHour = useRef(Math.floor(13.2));
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const offset = tz === "Local" ? -new Date().getTimezoneOffset() / 60 : 0;

  useRafLoop((dt) => {
    if (!playing || dragging.current) return;
    const rate = speed === "1h/s" ? 1 : speed === "3h/s" ? 3 : 8;
    time.set(time.get() + dt * rate);
  }, inView && playing);

  const hourNow = Math.floor(t);
  useEffect(() => {
    if (hourNow !== lastHour.current) {
      lastHour.current = hourNow;
      if (playing) sfx.tick();
    }
  }, [hourNow, playing]);

  const S = 380, C = S / 2, R = 150;
  const ang = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2;
  const pt = (h: number, r: number) => ({ x: C + Math.cos(ang(h)) * r, y: C + Math.sin(ang(h)) * r });
  const arc = (from: number, to: number, r: number) => {
    const span = ((to - from + 24) % 24) || 24;
    const a = pt(from, r), b = pt(from + span, r);
    return `M${a.x},${a.y} A${r},${r} 0 ${span > 12 ? 1 : 0} 1 ${b.x},${b.y}`;
  };

  const setFromPointer = (clientX: number, clientY: number) => {
    const r = dialRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((clientX - r.left) / r.width) * S - C;
    const y = ((clientY - r.top) / r.height) * S - C;
    let h = ((Math.atan2(y, x) + Math.PI / 2) / (Math.PI * 2)) * 24;
    if (h < 0) h += 24;
    const cur = ((time.get() % 24) + 24) % 24;
    let d = h - cur;
    if (d > 12) d -= 24;
    if (d < -12) d += 24;
    time.set(time.get() + d);
  };

  const jump = (h: number) => {
    const cur = ((time.get() % 24) + 24) % 24;
    let d = h - cur;
    if (d < 0) d += 24;
    animate(time, time.get() + d, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    sfx.whoosh();
  };

  const keys = useSceneKeys({
    Space: () => setPlaying((p) => !p),
    ArrowRight: () => animate(time, time.get() + 1, { duration: 0.3 }),
    ArrowLeft: () => animate(time, time.get() - 1, { duration: 0.3 }),
    n: () => { const nx = EVENTS.find((e) => e.t > t + 0.05) ?? EVENTS[0]; jump(nx.t); },
  });

  const active = SESSIONS.filter((s) => inSession(t, s));
  const overlap = active.length >= 2;
  const vol = volAt(t);
  const handPt = pt(t, R - 18);
  const nextEv = EVENTS.find((e) => e.t > t) ?? EVENTS[0];
  const toNext = ((nextEv.t - t + 24) % 24);

  // globe
  const G = 190, GR = 82;
  const rot = (t / 24) * 360 - 180;
  const proj = (lon: number, lat: number) => {
    const l = ((lon + rot) * Math.PI) / 180;
    const la = (lat * Math.PI) / 180;
    return { x: G / 2 + GR * Math.cos(la) * Math.sin(l), y: G / 2 - GR * Math.sin(la), front: Math.cos(l) > 0 };
  };

  const hh = hoverH ?? t;

  return (
    <ShowcaseSection
      id="sessions" index="55" kicker="Session Clock" title="Часы мировых торговых сессий"
      desc="Тяни стрелку по циферблату или запусти время. Дуги сессий загораются, пересечения светятся, объём дышит по кругу, а глобус крутится вместе с терминатором дня и ночи."
      accent="#0098EA" variant="radar"
      keys={[{ k: "Space", d: "время" }, { k: "← →", d: "±1 час" }, { k: "N", d: "след. событие" }]}
      moment="Запоминающийся момент: London × New York overlap — кольцо вспыхивает, объём взлетает"
      tags={<div className="flex gap-2"><Tag tone={overlap ? "gold" : "blue"}>{overlap ? "OVERLAP" : `${active.length} session`}</Tag><Tag tone="ghost">{fmtT(t + offset)} {tz}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button onClick={() => { setPlaying((p) => !p); sfx.tap(); }} className={cn("btn3d px-4 py-2 text-[10px]", playing ? "btn3d-ghost" : "btn3d-blue")}>
            {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Run time</>}
          </button>
          <Seg options={["1h/s", "3h/s", "8h/s"] as const} value={speed} onChange={setSpeed} accent="#0098EA" />
          <Seg options={["UTC", "Local"] as const} value={tz} onChange={setTz} accent="#5b8cff" />
          <div className="ml-auto flex flex-wrap gap-1.5">
            {EVENTS.map((e) => (
              <button key={e.n} onClick={() => jump(e.t)} className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-extrabold text-white hover:border-white/30">
                <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: e.c }} />{e.n}
              </button>
            ))}
          </div>
        </div>

        <div ref={wrapRef} className="grid gap-4 lg:grid-cols-[1fr_1fr_280px]">
          {/* DIAL */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle,#0c2448,#050b1f_72%)] p-2" style={{ boxShadow: overlap ? "0 0 70px rgba(255,197,49,.25)" : "0 0 50px rgba(0,152,234,.15)" }}>
            <svg
              ref={dialRef} viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[400px] touch-none select-none"
              onPointerDown={(e) => { dragging.current = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setFromPointer(e.clientX, e.clientY); sfx.tick(); }}
              onPointerMove={(e) => {
                if (dragging.current) { setFromPointer(e.clientX, e.clientY); return; }
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * S - C;
                const y = ((e.clientY - r.top) / r.height) * S - C;
                const d = Math.hypot(x, y);
                if (d > R - 30 && d < R + 40) {
                  let h = ((Math.atan2(y, x) + Math.PI / 2) / (Math.PI * 2)) * 24;
                  if (h < 0) h += 24;
                  setHoverH(Math.floor(h));
                } else setHoverH(null);
              }}
              onPointerUp={() => { dragging.current = false; }}
              onPointerLeave={() => { dragging.current = false; setHoverH(null); }}
            >
              {/* volume profile */}
              {Array.from({ length: 48 }, (_, k) => {
                const h = k / 2;
                const v = volAt(h);
                const a = pt(h, R + 16), b = pt(h, R + 16 + v * 26);
                const cur = Math.abs(((h - t + 24) % 24)) < 0.5;
                return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={cur ? "#fff" : v > 0.9 ? "#ffc531" : "#1f7fd6"} strokeWidth={cur ? 4 : 3} strokeLinecap="round" opacity={cur ? 1 : 0.75} />;
              })}
              <circle cx={C} cy={C} r={R + 6} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={2} />
              {/* sessions */}
              {SESSIONS.map((s, k) => {
                const on = inSession(t, s);
                return (
                  <path key={s.id} d={arc(s.from, s.to, R - 12 - k * 14)} fill="none" stroke={s.color} strokeWidth={on ? 11 : 8} strokeLinecap="round"
                    opacity={on ? 1 : 0.3} style={on ? { filter: `drop-shadow(0 0 10px ${s.color})` } : undefined} />
                );
              })}
              {/* overlap glow */}
              <path d={arc(13, 16, R + 6)} fill="none" stroke="#ffc531" strokeWidth={overlap ? 6 : 3} opacity={overlap ? 1 : 0.4} strokeLinecap="round" style={overlap ? { filter: "drop-shadow(0 0 12px #ffc531)" } : undefined} />
              {/* hour ticks */}
              {Array.from({ length: 24 }, (_, h) => {
                const a = pt(h, R - 72), b = pt(h, R - 64);
                const lp = pt(h, R - 84);
                return (
                  <g key={h}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={h === hourNow ? "#fff" : "rgba(255,255,255,.35)"} strokeWidth={h % 6 === 0 ? 3 : 1.5} />
                    {h % 3 === 0 && <text x={lp.x} y={lp.y + 3.5} textAnchor="middle" fontSize={10} fontWeight={800} fill={h === hourNow ? "#fff" : "#7d92c4"}>{String((h + offset + 24) % 24).padStart(2, "0")}</text>}
                  </g>
                );
              })}
              {/* events */}
              {EVENTS.map((e) => {
                const p = pt(e.t, R + 50);
                return (
                  <g key={e.n} className="cursor-pointer" onPointerDown={(ev) => { ev.stopPropagation(); jump(e.t); }}>
                    <circle cx={p.x} cy={p.y} r={7} fill={e.c} stroke="#fff" strokeWidth={2} />
                  </g>
                );
              })}
              {/* hand */}
              <line x1={C} y1={C} x2={handPt.x} y2={handPt.y} stroke="#fff" strokeWidth={4} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #0098EA)" }} />
              <circle cx={handPt.x} cy={handPt.y} r={10} fill="#0098EA" stroke="#fff" strokeWidth={3} />
              <circle cx={C} cy={C} r={48} fill="#081130" stroke="rgba(255,255,255,.15)" strokeWidth={2} />
              <text x={C} y={C - 2} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily="JetBrains Mono, monospace">{fmtT(t + offset)}</text>
              <text x={C} y={C + 16} textAnchor="middle" fontSize={9} fontWeight={800} fill={overlap ? "#ffc531" : "#7d92c4"} letterSpacing={2}>{overlap ? "OVERLAP" : tz}</text>
            </svg>
          </div>

          {/* GLOBE */}
          <ScenePanel title="Earth · live sessions" sub="Терминатор и города вращаются со временем" accent="#0098EA">
            <div className="flex justify-center">
              <svg viewBox={`0 0 ${G} ${G}`} className="w-full max-w-[300px]">
                <defs>
                  <radialGradient id="globe-g" cx="38%" cy="32%">
                    <stop offset="0" stopColor="#2a6fd6" />
                    <stop offset="1" stopColor="#081a44" />
                  </radialGradient>
                  <clipPath id="globe-clip"><circle cx={G / 2} cy={G / 2} r={GR} /></clipPath>
                </defs>
                <circle cx={G / 2} cy={G / 2} r={GR + 8} fill="#0098EA" opacity={0.12} />
                <circle cx={G / 2} cy={G / 2} r={GR} fill="url(#globe-g)" />
                <g clipPath="url(#globe-clip)">
                  {/* meridians */}
                  {Array.from({ length: 12 }, (_, k) => {
                    const lon = k * 30;
                    const l = ((lon + rot) * Math.PI) / 180;
                    const rx = Math.abs(GR * Math.sin(l));
                    return <ellipse key={k} cx={G / 2} cy={G / 2} rx={rx} ry={GR} fill="none" stroke="rgba(160,200,255,.18)" strokeWidth={1} />;
                  })}
                  {[-60, -30, 0, 30, 60].map((lat) => {
                    const y = G / 2 - GR * Math.sin((lat * Math.PI) / 180);
                    const w = GR * Math.cos((lat * Math.PI) / 180);
                    return <line key={lat} x1={G / 2 - w} x2={G / 2 + w} y1={y} y2={y} stroke="rgba(160,200,255,.18)" />;
                  })}
                  {/* night side */}
                  <motion.rect x={G / 2} y={0} width={GR * 1.2} height={G} fill="#020617" opacity={0.55} style={{ filter: "blur(10px)" }} />
                </g>
                {CITIES.map((c) => {
                  const p = proj(c.lon, c.lat);
                  if (!p.front) return null;
                  const s = SESSIONS.find((x) => x.id === c.s)!;
                  const on = inSession(t, s);
                  return (
                    <g key={c.n}>
                      {on && <circle cx={p.x} cy={p.y} r={9} fill={s.color} opacity={0.3}><animate attributeName="r" values="5;12;5" dur="1.8s" repeatCount="indefinite" /></circle>}
                      <circle cx={p.x} cy={p.y} r={on ? 4 : 2.6} fill={on ? s.color : "#7d92c4"} stroke="#fff" strokeWidth={on ? 1.5 : 0.6} />
                      {on && <text x={p.x + 6} y={p.y - 5} fontSize={8} fontWeight={800} fill="#fff" style={{ paintOrder: "stroke", stroke: "#081130", strokeWidth: 2 }}>{c.n}</text>}
                    </g>
                  );
                })}
                <circle cx={G / 2} cy={G / 2} r={GR} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={1.2} />
              </svg>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {SESSIONS.map((s) => {
                const on = inSession(t, s);
                return (
                  <motion.span key={s.id} animate={{ scale: on ? 1 : 0.92, opacity: on ? 1 : 0.45 }}
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold" style={{ background: on ? s.color : "rgba(255,255,255,.06)", color: on ? "#081130" : "#7d92c4" }}>{s.id}</motion.span>
                );
              })}
            </div>
          </ScenePanel>

          {/* STATS */}
          <div className="space-y-4">
            <ScenePanel title={hoverH !== null ? `Hour ${String(hoverH).padStart(2, "0")}:00` : "Right now"} sub="Типичные параметры часа" accent="#ffc531">
              <div className="grid grid-cols-2 gap-2">
                <SceneStat label="Volume" value={`${Math.round(volAt(hh) * 72)}%`} color={volAt(hh) > 0.9 ? "#ffc531" : "#fff"} />
                <SceneStat label="Spread" value={`${(1.8 - volAt(hh)).toFixed(2)} bp`} color="#9db9ff" />
                <SceneStat label="Range" value={`${(volAt(hh) * 0.9).toFixed(2)}%`} color="#2ede8a" />
                <SceneStat label="Sessions" value={`${SESSIONS.filter((s) => inSession(hh, s)).length}`} color="#fff" />
              </div>
              <div className="mt-3 flex h-16 items-end gap-[2px]">
                {Array.from({ length: 24 }, (_, h) => (
                  <motion.button
                    key={h} onClick={() => jump(h + 0.01)}
                    onPointerEnter={() => setHoverH(h)} onPointerLeave={() => setHoverH(null)}
                    className="flex-1 rounded-t"
                    initial={false}
                    animate={{ height: `${volAt(h) * 70}%`, backgroundColor: h === hourNow ? "#ffffff" : h === hoverH ? "#ffc531" : volAt(h) > 0.9 ? "#ff8b3d" : "#1f7fd6" }}
                  />
                ))}
              </div>
            </ScenePanel>
            <ScenePanel title="Next event" sub="Клик по точке на циферблате — прыжок" accent={nextEv.c}>
              <p className="display text-lg font-extrabold text-white">{nextEv.n}</p>
              <p className="num-mono text-sm font-extrabold" style={{ color: nextEv.c }}>in {Math.floor(toNext)}h {Math.round((toNext % 1) * 60)}m</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
                <motion.div className="h-full rounded-full" style={{ background: nextEv.c }} animate={{ width: `${100 - (toNext / 24) * 100}%` }} />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#8ea6d8]">Volatility now</span><span className="text-white">{Math.round(vol * 70)}</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-black/50">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[#0098EA] via-[#ffc531] to-[#ff5470]" animate={{ width: `${Math.min(100, vol * 72)}%` }} />
                </div>
              </div>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
