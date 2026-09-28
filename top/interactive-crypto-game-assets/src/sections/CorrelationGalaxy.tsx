/* 52 · CORRELATION GALAXY — force network of asset correlations.
   Physics layout · drag & pin nodes · threshold edges · layout morph
   (force / ring / sectors) · 3D spin · shock pulse that hops through edges. */
import { AnimatePresence, motion } from "framer-motion";
import { Pin, RotateCw, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, useOnScreen, useRafLoop, useSceneKeys } from "../showcase/fx";
import { mulberry } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Sector = "L1" | "L2" | "DeFi" | "Meme" | "Stable" | "AI";
const SECTOR_COLOR: Record<Sector, string> = { L1: "#F7931A", L2: "#5b8cff", DeFi: "#2ede8a", Meme: "#ffc531", Stable: "#8ea6d8", AI: "#a78bff" };
const NODES: { sym: string; sector: Sector; cap: number }[] = [
  { sym: "BTC", sector: "L1", cap: 10 }, { sym: "ETH", sector: "L1", cap: 8 }, { sym: "SOL", sector: "L1", cap: 6 },
  { sym: "AVAX", sector: "L1", cap: 4 }, { sym: "ARB", sector: "L2", cap: 4 }, { sym: "OP", sector: "L2", cap: 3.6 },
  { sym: "MATIC", sector: "L2", cap: 3.4 }, { sym: "UNI", sector: "DeFi", cap: 4 }, { sym: "AAVE", sector: "DeFi", cap: 3.6 },
  { sym: "LDO", sector: "DeFi", cap: 3 }, { sym: "DOGE", sector: "Meme", cap: 5 }, { sym: "PEPE", sector: "Meme", cap: 3.4 },
  { sym: "WIF", sector: "Meme", cap: 3 }, { sym: "USDT", sector: "Stable", cap: 7 }, { sym: "FET", sector: "AI", cap: 3.4 }, { sym: "RNDR", sector: "AI", cap: 3.2 },
];
const N = NODES.length;
const SECTORS = Object.keys(SECTOR_COLOR) as Sector[];

function buildCorr(seed: number) {
  const rnd = mulberry(seed);
  const m: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const a = NODES[i], b = NODES[j];
      let c: number;
      if (a.sector === "Stable" || b.sector === "Stable") c = -0.25 + rnd() * 0.3;
      else if (a.sector === b.sector) c = 0.62 + rnd() * 0.33;
      else if (a.sym === "BTC" || b.sym === "BTC") c = 0.45 + rnd() * 0.4;
      else c = 0.05 + rnd() * 0.55;
      m[i][j] = m[j][i] = +c.toFixed(2);
    }
    m[i][i] = 1;
  }
  return m;
}

type Body = { x: number; y: number; z: number; vx: number; vy: number; vz: number; pinned: boolean };
type Pulse = { id: number; from: number; to: number; t: number; power: number; depth: number };

let pulseId = 1;

export default function CorrelationGalaxy() {
  const [seed, setSeed] = useState(8);
  const corr = useMemo(() => buildCorr(seed), [seed]);
  const [threshold, setThreshold] = useState(0.55);
  const [layout, setLayout] = useState<"force" | "ring" | "sectors">("force");
  const [spin, setSpin] = useState(false);
  const [showNeg, setShowNeg] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const [sel, setSel] = useState<number>(0);
  const [, setFrame] = useState(0);
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const bodies = useRef<Body[]>(
    NODES.map((_, i) => {
      const a = (i / N) * Math.PI * 2;
      return { x: Math.cos(a) * 160, y: Math.sin(a) * 110, z: (Math.random() - 0.5) * 120, vx: 0, vy: 0, vz: 0, pinned: false };
    }),
  );
  const pulses = useRef<Pulse[]>([]);
  const flashes = useRef<number[]>(Array(N).fill(0));
  const theta = useRef(0);
  const dragIdx = useRef<number | null>(null);
  const settle = useRef(1);

  const W = 720, H = 420, CX = W / 2, CY = H / 2;

  const target = (i: number): { x: number; y: number } | null => {
    if (layout === "ring") {
      const order = [...NODES.keys()].sort((a, b) => SECTORS.indexOf(NODES[a].sector) - SECTORS.indexOf(NODES[b].sector));
      const k = order.indexOf(i);
      const a = (k / N) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * 185, y: Math.sin(a) * 150 };
    }
    if (layout === "sectors") {
      const si = SECTORS.indexOf(NODES[i].sector);
      const a = (si / SECTORS.length) * Math.PI * 2;
      const members = NODES.map((n, k) => (n.sector === NODES[i].sector ? k : -1)).filter((k) => k >= 0);
      const mi = members.indexOf(i);
      const ang2 = (mi / members.length) * Math.PI * 2;
      return { x: Math.cos(a) * 190 + Math.cos(ang2) * 38, y: Math.sin(a) * 140 + Math.sin(ang2) * 38 };
    }
    return null;
  };

  const project = (b: Body) => {
    const c = Math.cos(theta.current), s = Math.sin(theta.current);
    const x = b.x * c - b.z * s;
    const z = b.x * s + b.z * c;
    const k = 620 / (620 + z);
    return { sx: CX + x * k, sy: CY + b.y * k, k, z };
  };

  useRafLoop((dt) => {
    const B = bodies.current;
    const heat = layout === "force" ? Math.max(0.12, settle.current) : 0.6;
    settle.current = Math.max(0.12, settle.current * 0.995);
    for (let i = 0; i < N; i++) {
      const bi = B[i];
      let fx = 0, fy = 0, fz = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const bj = B[j];
        const dx = bi.x - bj.x, dy = bi.y - bj.y, dz = bi.z - bj.z;
        const d2 = dx * dx + dy * dy + dz * dz + 40;
        const d = Math.sqrt(d2);
        const rep = 2600 / d2;
        fx += (dx / d) * rep; fy += (dy / d) * rep; fz += (dz / d) * rep;
        const c = corr[i][j];
        if (layout === "force" && c > threshold) {
          const rest = 60 + (1 - c) * 160;
          const k = (d - rest) * 0.012 * c;
          fx -= (dx / d) * k; fy -= (dy / d) * k; fz -= (dz / d) * k;
        }
      }
      fx -= bi.x * 0.004; fy -= bi.y * 0.006; fz -= bi.z * 0.01;
      const t = target(i);
      if (t) { fx += (t.x - bi.x) * 0.08; fy += (t.y - bi.y) * 0.08; fz += (0 - bi.z) * 0.08; }
      if (!bi.pinned && dragIdx.current !== i) {
        bi.vx = (bi.vx + fx * heat) * 0.86;
        bi.vy = (bi.vy + fy * heat) * 0.86;
        bi.vz = (bi.vz + fz * heat) * 0.86;
        bi.x = clamp(bi.x + bi.vx, -330, 330);
        bi.y = clamp(bi.y + bi.vy, -190, 190);
        bi.z = clamp(bi.z + bi.vz, -220, 220);
      }
    }
    if (spin && dragIdx.current === null) theta.current += dt * 0.5;
    // pulses
    const next: Pulse[] = [];
    for (const p of pulses.current) {
      p.t += dt * 1.6;
      if (p.t >= 1) {
        flashes.current[p.to] = 1;
        if (p.depth < 2) {
          for (let j = 0; j < N; j++) {
            if (j === p.from || j === p.to) continue;
            const c = corr[p.to][j];
            if (c > threshold && p.power * c > 0.25) next.push({ id: pulseId++, from: p.to, to: j, t: 0, power: p.power * c, depth: p.depth + 1 });
          }
        }
      } else next.push(p);
    }
    pulses.current = next.slice(0, 60);
    flashes.current = flashes.current.map((f) => Math.max(0, f - dt * 1.4));
    setFrame((f) => (f + 1) % 100000);
  }, inView);

  const shock = () => {
    flashes.current[sel] = 1;
    for (let j = 0; j < N; j++) {
      if (j !== sel && corr[sel][j] > threshold) pulses.current.push({ id: pulseId++, from: sel, to: j, t: 0, power: corr[sel][j], depth: 0 });
    }
    sfx.levelUp();
  };

  const keys = useSceneKeys({
    Space: shock,
    r: () => setSpin((v) => !v),
    "1": () => setLayout("force"),
    "2": () => setLayout("ring"),
    "3": () => setLayout("sectors"),
    ArrowUp: () => setThreshold((t) => clamp(t + 0.05, 0.2, 0.95)),
    ArrowDown: () => setThreshold((t) => clamp(t - 0.05, 0.2, 0.95)),
  });

  const toSim = (clientX: number, clientY: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((clientX - r.left) / r.width) * W - CX, y: ((clientY - r.top) / r.height) * H - CY };
  };

  const proj = bodies.current.map(project);
  const order = [...proj.keys()].sort((a, b) => proj[b].z - proj[a].z);
  const neighbors = (i: number) => new Set([...Array(N).keys()].filter((j) => j !== i && corr[i][j] > threshold));
  const focus = hover ?? sel;
  const nb = neighbors(focus);
  const edges: { i: number; j: number; c: number }[] = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const c = corr[i][j];
    if (c > threshold || (showNeg && c < -0.05)) edges.push({ i, j, c });
  }
  const avgCorr = edges.length ? edges.reduce((s, e) => s + e.c, 0) / edges.length : 0;
  const selRow = [...Array(N).keys()].filter((j) => j !== sel).sort((a, b) => corr[sel][b] - corr[sel][a]);
  const diversification = 1 - selRow.reduce((s, j) => s + Math.max(0, corr[sel][j]), 0) / (N - 1);

  return (
    <ShowcaseSection
      id="galaxy" index="52" kicker="Correlation Galaxy" title="Галактика корреляций"
      desc="Активы притягиваются силой корреляции. Тяни и закрепляй звёзды, меняй порог связей, переключай раскладку, вращай в 3D. Кнопка Shock запускает импульс, который прыгает по сильным связям."
      accent="#a78bff" variant="stars"
      keys={[{ k: "Space", d: "shock" }, { k: "R", d: "3D spin" }, { k: "1 2 3", d: "раскладка" }, { k: "↑ ↓", d: "порог" }]}
      moment="Запоминающийся момент: шок от BTC волной пробегает по всей сети за полсекунды"
      tags={<div className="flex gap-2"><Tag tone="violet">{edges.length} links</Tag><Tag tone="ghost">ρ ≥ {threshold.toFixed(2)}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Seg options={["force", "ring", "sectors"] as const} value={layout} onChange={(v) => { setLayout(v); settle.current = 1; }} accent="#a78bff" />
          <button onClick={() => { setSpin((v) => !v); sfx.tick(); }} className={cn("btn3d px-3 py-2 text-[10px]", spin ? "btn3d-violet" : "btn3d-ghost")}><RotateCw size={13} /> 3D spin</button>
          <button onClick={() => setShowNeg((v) => !v)} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", showNeg ? "bg-[#ff5470]/20 text-[#ff8ba0]" : "bg-white/5 text-[#54678f]")}>Negative ρ</button>
          <label className="ml-auto flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            Threshold
            <input type="range" min={20} max={95} value={Math.round(threshold * 100)} onChange={(e) => setThreshold(+e.target.value / 100)}
              className="lever w-32" style={{ ["--fill" as string]: `${((threshold * 100 - 20) / 75) * 100}%` }} />
            <span className="num-mono w-9 text-white">{threshold.toFixed(2)}</span>
          </label>
          <button onClick={() => { setSeed((s) => s + 1); settle.current = 1; sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Reseed</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
          <div ref={wrapRef} className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,#1a1450,#050a1c_70%)]" style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,.6), 0 0 60px rgba(167,139,255,.15)" }}>
            <svg
              ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none"
              onPointerMove={(e) => {
                if (dragIdx.current === null) return;
                const p = toSim(e.clientX, e.clientY);
                const b = bodies.current[dragIdx.current];
                const c = Math.cos(theta.current);
                b.x = clamp(p.x / Math.max(0.3, c), -330, 330);
                b.y = clamp(p.y, -190, 190);
                b.vx = b.vy = 0;
              }}
              onPointerUp={() => { if (dragIdx.current !== null) sfx.soft(); dragIdx.current = null; }}
              onPointerLeave={() => { dragIdx.current = null; }}
            >
              <defs>
                <radialGradient id="cg-node" cx="35%" cy="30%">
                  <stop offset="0" stopColor="#fff" stopOpacity=".9" />
                  <stop offset=".35" stopColor="#fff" stopOpacity=".15" />
                  <stop offset="1" stopColor="#000" stopOpacity="0" />
                </radialGradient>
              </defs>
              {edges.map((e) => {
                const a = proj[e.i], b = proj[e.j];
                const neg = e.c < 0;
                const active = focus === e.i || focus === e.j;
                const dim = !active && (hover !== null);
                return (
                  <line
                    key={`${e.i}-${e.j}`} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
                    stroke={neg ? "#ff5470" : active ? SECTOR_COLOR[NODES[focus].sector] : "#9db9ff"}
                    strokeWidth={neg ? 1.2 : 0.6 + Math.abs(e.c) * (active ? 3.4 : 2)}
                    strokeDasharray={neg ? "4 5" : undefined}
                    opacity={dim ? 0.07 : active ? 0.85 : 0.22 + Math.abs(e.c) * 0.25}
                  />
                );
              })}
              {pulses.current.map((p) => {
                const a = proj[p.from], b = proj[p.to];
                const x = a.sx + (b.sx - a.sx) * p.t;
                const y = a.sy + (b.sy - a.sy) * p.t;
                return (
                  <g key={p.id}>
                    <line x1={a.sx + (b.sx - a.sx) * Math.max(0, p.t - 0.18)} y1={a.sy + (b.sy - a.sy) * Math.max(0, p.t - 0.18)} x2={x} y2={y}
                      stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.7 * p.power} />
                    <circle cx={x} cy={y} r={3 + p.power * 4} fill="#fff" style={{ filter: "drop-shadow(0 0 8px #fff)" }} />
                  </g>
                );
              })}
              {order.map((i) => {
                const n = NODES[i];
                const p = proj[i];
                const col = SECTOR_COLOR[n.sector];
                const r = (8 + n.cap * 2.2) * p.k;
                const isFocus = focus === i;
                const isNb = nb.has(i);
                const dim = hover !== null && !isFocus && !isNb;
                const fl = flashes.current[i];
                return (
                  <g
                    key={n.sym} transform={`translate(${p.sx},${p.sy})`} opacity={dim ? 0.3 : 1} className="cursor-grab"
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onPointerDown={(e) => { dragIdx.current = i; (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture?.(e.pointerId); setSel(i); sfx.pop(); }}
                    onDoubleClick={() => { bodies.current[i].pinned = !bodies.current[i].pinned; sfx.tick(); }}
                  >
                    {fl > 0 && <circle r={r + 26 * (1 - fl)} fill="none" stroke="#fff" strokeWidth={3 * fl} opacity={fl} />}
                    <circle r={r * 1.9} fill={col} opacity={isFocus ? 0.28 : 0.12 + fl * 0.4} />
                    <circle r={r} fill={col} stroke={isFocus ? "#fff" : "rgba(255,255,255,.35)"} strokeWidth={isFocus ? 3 : 1.2} />
                    <circle r={r} fill="url(#cg-node)" />
                    <text y={r + 13} textAnchor="middle" fontSize={11 * Math.max(0.8, p.k)} fontWeight={800} fill="#fff" style={{ paintOrder: "stroke", stroke: "#050a1c", strokeWidth: 3 }}>{n.sym}</text>
                    {bodies.current[i].pinned && <circle cx={r * 0.75} cy={-r * 0.75} r={4.5} fill="#ffc531" stroke="#081130" strokeWidth={1.5} />}
                  </g>
                );
              })}
            </svg>
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {SECTORS.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-extrabold text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full" style={{ background: SECTOR_COLOR[s] }} />{s}
                </span>
              ))}
            </div>
            <p className="pointer-events-none absolute right-3 top-3 rounded-lg bg-black/55 px-2 py-1 text-[9px] font-bold text-[#8ea6d8] backdrop-blur">drag · dbl-click = pin</p>
          </div>

          <div className="space-y-4">
            <ScenePanel title={NODES[sel].sym} sub={`${NODES[sel].sector} · correlation profile`} accent={SECTOR_COLOR[NODES[sel].sector]}
              right={<button onClick={shock} className="btn3d btn3d-violet px-3 py-1.5 text-[10px]"><Zap size={12} /> Shock</button>}
            >
              <div className="max-h-[230px] space-y-1 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {selRow.map((j) => {
                    const c = corr[sel][j];
                    return (
                      <motion.button
                        key={`${sel}-${j}`} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                        onClick={() => { setSel(j); sfx.tick(); }}
                        onPointerEnter={() => setHover(j)} onPointerLeave={() => setHover(null)}
                        className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-white/5"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: SECTOR_COLOR[NODES[j].sector] }} />
                        <span className="w-12 text-[11px] font-extrabold text-white">{NODES[j].sym}</span>
                        <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/50">
                          <motion.span
                            className="absolute inset-y-0 rounded-full"
                            initial={false}
                            animate={{ width: `${Math.abs(c) * 100}%`, left: c < 0 ? "auto" : 0 }}
                            style={{ background: c < 0 ? "#ff5470" : c > threshold ? SECTOR_COLOR[NODES[sel].sector] : "#3a5690", right: c < 0 ? 0 : "auto" }}
                          />
                        </span>
                        <span className={cn("num-mono w-10 text-right text-[10px] font-extrabold", c < 0 ? "text-[#ff8ba0]" : c > threshold ? "text-white" : "text-[#54678f]")}>{c.toFixed(2)}</span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SceneStat label="Linked" value={`${neighbors(sel).size}`} sub={`ρ > ${threshold.toFixed(2)}`} color="#fff" />
                <SceneStat label="Diversify" value={`${Math.round(diversification * 100)}%`} color={diversification > 0.55 ? "#2ede8a" : "#ffc531"} />
              </div>
              <button
                onClick={() => { bodies.current[sel].pinned = !bodies.current[sel].pinned; sfx.tick(); setFrame((f) => f + 1); }}
                className="btn3d btn3d-ghost mt-3 w-full py-2 text-[10px]"
              ><Pin size={12} /> {bodies.current[sel].pinned ? "Unpin" : "Pin"} {NODES[sel].sym}</button>
            </ScenePanel>
            <ScenePanel title="Network" sub="Общая картина" accent="#5b8cff">
              <div className="grid grid-cols-2 gap-2">
                <SceneStat label="Avg ρ" value={avgCorr.toFixed(2)} color="#c9b6ff" />
                <SceneStat label="Pulses" value={`${pulses.current.length}`} color="#fff" />
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#aebde6]">
                {threshold > 0.75 ? "Высокий порог — видны только плотные кластеры секторов." : threshold < 0.4 ? "Низкий порог — рынок выглядит как один монолит." : "Сбалансированный порог — видна структура секторов."}
              </p>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
