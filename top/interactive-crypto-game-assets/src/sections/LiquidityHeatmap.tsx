/* 51 · LIQUIDITY HEATMAP — bookmap-style scrolling liquidity canvas.
   Walls live, drift, get pulled (spoof) or absorbed · trade bubbles
   · palettes & contrast · click a wall to track its lifetime. */
import { motion } from "framer-motion";
import { Pause, Play, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, colorRamp, useOnScreen, useSceneKeys } from "../showcase/fx";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const COLS = 150;
const ROWS = 72;
const PALETTES = {
  Heat: ["#050a1c", "#0e2a78", "#1f7fd6", "#39e0d8", "#ffe36b", "#ffffff"],
  Ice: ["#040816", "#0b2445", "#12657a", "#3fc6c0", "#c8fff6", "#ffffff"],
  Toxic: ["#06030f", "#2a0b4d", "#6b1ea8", "#b04bff", "#b6ff4a", "#ffffff"],
  Mono: ["#05070d", "#1c2233", "#46506b", "#8d97b2", "#d8def0", "#ffffff"],
} as const;
type Pal = keyof typeof PALETTES;

type Wall = { id: number; row: number; strength: number; life: number; drift: number; spoof: boolean; born: number; hist: number[]; status: "holding" | "pulled" | "absorbed" };
type Bubble = { col: number; row: number; size: number; buy: boolean };

let wallId = 1;

export default function LiquidityHeatmap() {
  const { ref: canvasRef, inView } = useOnScreen<HTMLCanvasElement>();
  const grid = useRef(new Float32Array(ROWS * COLS));
  const priceHist = useRef<number[]>(Array.from({ length: COLS }, () => ROWS / 2));
  const bubbles = useRef<Bubble[]>([]);
  const walls = useRef<Wall[]>([]);
  const price = useRef(ROWS / 2);
  const tickN = useRef(0);
  const hover = useRef<{ c: number; r: number } | null>(null);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<"1" | "2" | "4">("1");
  const [palette, setPalette] = useState<Pal>("Heat");
  const [contrast, setContrast] = useState(55);
  const [showBubbles, setShowBubbles] = useState(true);
  const [spoofMode, setSpoofMode] = useState(false);
  const [tracked, setTracked] = useState<number | null>(null);
  const [, setFrame] = useState(0);
  const [hoverInfo, setHoverInfo] = useState<{ price: number; liq: number; ago: number } | null>(null);
  const settings = useRef({ palette, contrast, showBubbles, spoofMode, tracked });
  settings.current = { palette, contrast, showBubbles, spoofMode, tracked };

  const rowToPrice = (r: number) => 97500 - (r - ROWS / 2) * 12;

  const spawnWall = (nearPrice = false) => {
    const row = nearPrice ? clamp(Math.round(price.current + (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 10)), 2, ROWS - 3) : Math.floor(3 + Math.random() * (ROWS - 6));
    walls.current.push({
      id: wallId++, row, strength: 0.5 + Math.random() * 0.9, life: 60 + Math.random() * 160, drift: (Math.random() - 0.5) * 0.04,
      spoof: settings.current.spoofMode ? Math.random() > 0.4 : Math.random() > 0.85, born: tickN.current, hist: [], status: "holding",
    });
  };

  const step = () => {
    tickN.current++;
    const g = grid.current;
    // shift left
    for (let r = 0; r < ROWS; r++) {
      const off = r * COLS;
      g.copyWithin(off, off + 1, off + COLS);
    }
    // evolve walls
    walls.current.forEach((w) => {
      if (w.status !== "holding") return;
      w.life -= 1;
      w.row = clamp(w.row + w.drift, 1, ROWS - 2);
      w.strength = clamp(w.strength + (Math.random() - 0.5) * 0.06, 0.2, 1.8);
      const dist = Math.abs(w.row - price.current);
      if (w.spoof && dist < 5 && Math.random() > 0.55) { w.status = "pulled"; if (settings.current.tracked === w.id) sfx.error(); }
      else if (dist < 1.2) {
        w.strength -= 0.09;
        if (w.strength < 0.25) { w.status = "absorbed"; if (settings.current.tracked === w.id) sfx.coin(); }
      }
      if (w.life <= 0) w.status = "pulled";
      w.hist.push(w.status === "holding" ? w.strength : 0);
      if (w.hist.length > 60) w.hist.shift();
    });
    walls.current = walls.current.filter((w) => w.status === "holding" || w.id === settings.current.tracked || tickN.current - w.born < 400);
    if (walls.current.filter((w) => w.status === "holding").length < 9 || Math.random() > 0.93) spawnWall(Math.random() > 0.5);

    // price walk: repelled by strong walls
    let force = (Math.random() - 0.5) * 1.1;
    walls.current.forEach((w) => {
      if (w.status !== "holding") return;
      const d = w.row - price.current;
      if (Math.abs(d) < 3 && Math.abs(d) > 0.2) force -= Math.sign(d) * w.strength * 0.18;
    });
    price.current = clamp(price.current + force, 3, ROWS - 4);
    priceHist.current.push(price.current);
    priceHist.current.shift();

    // new column
    const lastCol = COLS - 1;
    for (let r = 0; r < ROWS; r++) {
      let v = Math.random() * 0.08 + 0.04 * Math.exp(-Math.abs(r - price.current) / 18);
      for (const w of walls.current) {
        if (w.status !== "holding") continue;
        v += w.strength * Math.exp(-((r - w.row) ** 2) / 1.6);
      }
      if (Math.abs(r - price.current) < 0.8) v *= 0.35;
      g[r * COLS + lastCol] = v;
    }

    // bubbles
    bubbles.current = bubbles.current.map((b) => ({ ...b, col: b.col - 1 })).filter((b) => b.col >= 0);
    if (Math.random() > 0.45) {
      const prev = priceHist.current[COLS - 2];
      bubbles.current.push({ col: lastCol, row: price.current + (Math.random() - 0.5), size: 0.3 + Math.random() ** 3 * 2.2, buy: price.current <= prev });
    }
  };

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const cw = cv.width, ch = cv.height;
    const cellW = cw / COLS, cellH = ch / ROWS;
    const img = ctx.createImageData(COLS, ROWS);
    const stops = PALETTES[settings.current.palette] as readonly string[];
    const gamma = 0.35 + (100 - settings.current.contrast) / 90;
    const g = grid.current;
    for (let i = 0; i < ROWS * COLS; i++) {
      const t = Math.pow(clamp(g[i] / 1.6, 0, 1), gamma);
      const c = colorRamp(t, stops as string[]);
      img.data[i * 4] = c[0];
      img.data[i * 4 + 1] = c[1];
      img.data[i * 4 + 2] = c[2];
      img.data[i * 4 + 3] = 255;
    }
    // draw scaled via offscreen
    const off = document.createElement("canvas");
    off.width = COLS;
    off.height = ROWS;
    off.getContext("2d")?.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, cw, ch);

    // tracked wall band
    const tr = walls.current.find((w) => w.id === settings.current.tracked);
    if (tr) {
      ctx.fillStyle = tr.status === "holding" ? "rgba(142,242,60,.14)" : "rgba(255,84,112,.14)";
      ctx.fillRect(0, tr.row * cellH - cellH * 1.5, cw, cellH * 3);
      ctx.strokeStyle = tr.status === "holding" ? "#8ef23c" : "#ff5470";
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, tr.row * cellH);
      ctx.lineTo(cw, tr.row * cellH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // price line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    priceHist.current.forEach((p, i) => {
      const x = i * cellW + cellW / 2;
      const y = p * cellH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // bubbles
    if (settings.current.showBubbles) {
      for (const b of bubbles.current) {
        const x = b.col * cellW + cellW / 2;
        const y = b.row * cellH;
        const r = 2 + b.size * 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = b.buy ? "rgba(46,222,138,.55)" : "rgba(255,84,112,.55)";
        ctx.fill();
        ctx.strokeStyle = b.buy ? "#5ff5a8" : "#ff8ba0";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // hover crosshair
    const h = hover.current;
    if (h) {
      ctx.strokeStyle = "rgba(157,185,255,.8)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(h.c * cellW, 0); ctx.lineTo(h.c * cellW, ch);
      ctx.moveTo(0, h.r * cellH); ctx.lineTo(cw, h.r * cellH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // current price tag
    const py = price.current * cellH;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cw - 70, py - 9, 68, 18);
    ctx.fillStyle = "#081130";
    ctx.font = "800 11px JetBrains Mono, monospace";
    ctx.fillText(rowToPrice(price.current).toFixed(0), cw - 62, py + 4);
  };

  // init grid
  useEffect(() => {
    for (let k = 0; k < 10; k++) spawnWall();
    for (let k = 0; k < COLS; k++) step();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resize canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      draw();
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const id = window.setInterval(() => {
      step();
      draw();
      setFrame((f) => (f + 1) % 1000);
    }, 160 / Number(speed));
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed, inView]);

  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [palette, contrast, showBubbles, tracked]);

  const locate = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const c = clamp(Math.floor(((e.clientX - r.left) / r.width) * COLS), 0, COLS - 1);
    const rr = clamp(((e.clientY - r.top) / r.height) * ROWS, 0, ROWS - 1);
    return { c, r: rr };
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = locate(e);
    hover.current = p;
    setHoverInfo({ price: rowToPrice(p.r), liq: grid.current[Math.floor(p.r) * COLS + p.c], ago: COLS - 1 - p.c });
    if (!playing) draw();
  };

  const onClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = locate(e);
    const best = walls.current
      .filter((w) => w.status === "holding")
      .sort((a, b) => Math.abs(a.row - p.r) - Math.abs(b.row - p.r))[0];
    if (best && Math.abs(best.row - p.r) < 5) {
      setTracked(best.id);
      sfx.pop();
    } else {
      setTracked(null);
      sfx.soft();
    }
  };

  const keys = useSceneKeys({
    Space: () => setPlaying((v) => !v),
    b: () => setShowBubbles((v) => !v),
    s: () => setSpoofMode((v) => !v),
    p: () => setPalette((pp) => {
      const k = Object.keys(PALETTES) as Pal[];
      return k[(k.indexOf(pp) + 1) % k.length];
    }),
    Escape: () => setTracked(null),
  });

  const live = walls.current.filter((w) => w.status === "holding").sort((a, b) => b.strength - a.strength).slice(0, 6);
  const tr = walls.current.find((w) => w.id === tracked);
  const pulled = walls.current.filter((w) => w.status === "pulled").length;
  const absorbed = walls.current.filter((w) => w.status === "absorbed").length;

  return (
    <ShowcaseSection
      id="heatmap" index="51" kicker="Liquidity Heatmap" title="Тепловая карта стен ликвидности"
      desc="Лента ордербука во времени: стены светятся, дрейфуют, исчезают (спуф) или съедаются ценой. Пузыри — рыночные сделки. Кликни по стене — начнётся трекинг её жизни."
      accent="#ffc531" variant="scan"
      keys={[{ k: "Space", d: "пауза" }, { k: "B", d: "пузыри" }, { k: "S", d: "spoof-режим" }, { k: "P", d: "палитра" }, { k: "Esc", d: "снять трекинг" }]}
      moment="Запоминающийся момент: цена упирается в яркую стену — и та мгновенно гаснет (спуф)"
      tags={<div className="flex gap-2"><Tag tone="gold">{live.length} walls</Tag><Tag tone={spoofMode ? "red" : "ghost"}>{spoofMode ? "spoof heavy" : "normal book"}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Seg options={Object.keys(PALETTES) as Pal[]} value={palette} onChange={setPalette} accent="#ffc531" />
          <Seg options={["1", "2", "4"] as const} value={speed} onChange={setSpeed} accent="#5b8cff" />
          <button onClick={() => setShowBubbles((v) => !v)} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", showBubbles ? "bg-white/12 text-white" : "bg-white/5 text-[#54678f]")}>Bubbles</button>
          <button onClick={() => { setSpoofMode((v) => !v); sfx.pop(); }} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", spoofMode ? "bg-[#ff5470] text-white" : "bg-white/5 text-[#8ea6d8]")}>Spoof mode</button>
          <label className="ml-auto flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            Contrast
            <input type="range" min={0} max={100} value={contrast} onChange={(e) => setContrast(+e.target.value)} className="lever w-28" style={{ ["--fill" as string]: `${contrast}%` }} />
          </label>
          <button onClick={() => setPlaying((v) => !v)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg">{playing ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <ScenePanel title="BTC/USDT · resting liquidity × time" sub="Клик по яркой полосе — трекинг стены" accent="#ffc531"
            right={hoverInfo ? <span className="num-mono text-[11px] font-bold text-white">{hoverInfo.price.toFixed(0)} · liq {hoverInfo.liq.toFixed(2)} · −{hoverInfo.ago}t</span> : undefined}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ boxShadow: "0 0 50px rgba(255,197,49,.12)" }}>
              <canvas
                ref={canvasRef}
                className="block h-[360px] w-full cursor-crosshair"
                onPointerMove={onMove}
                onPointerLeave={() => { hover.current = null; setHoverInfo(null); if (!playing) draw(); }}
                onPointerDown={onClick}
              />
              <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur">← past</span>
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-[#ffd76a] backdrop-blur">now →</span>
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 flex h-2.5 w-40 overflow-hidden rounded-full border border-white/20">
                {(PALETTES[palette] as readonly string[]).map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
              </div>
            </div>
          </ScenePanel>

          <div className="space-y-4">
            <ScenePanel title="Tracked wall" sub={tr ? `#${tr.id} · ${rowToPrice(tr.row).toFixed(0)}` : "Кликни на стену в карте"} accent={tr ? (tr.status === "holding" ? "#8ef23c" : "#ff5470") : "#5b8cff"}>
              {tr ? (
                <>
                  <motion.p
                    key={tr.status}
                    initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className={cn("display text-xl font-extrabold", tr.status === "holding" ? "text-[#8ef23c]" : tr.status === "absorbed" ? "text-[#ffc531]" : "text-[#ff5470]")}
                  >
                    {tr.status === "holding" ? "HOLDING" : tr.status === "absorbed" ? "ABSORBED" : "PULLED (spoof?)"}
                  </motion.p>
                  <svg viewBox="0 0 240 60" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30">
                    <path
                      d={tr.hist.map((v, i) => `${i ? "L" : "M"}${(i / Math.max(1, tr.hist.length - 1)) * 240},${56 - (v / 1.8) * 50}`).join(" ")}
                      fill="none" stroke={tr.status === "holding" ? "#8ef23c" : "#ff5470"} strokeWidth={2}
                    />
                  </svg>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <SceneStat label="Strength" value={tr.strength.toFixed(2)} color="#fff" />
                    <SceneStat label="Distance" value={`${Math.abs(tr.row - price.current).toFixed(1)} lv`} color="#9db9ff" />
                    <SceneStat label="Age" value={`${tickN.current - tr.born}t`} color="#8ea6d8" />
                    <SceneStat label="Type" value={tr.spoof ? "suspect" : "organic"} color={tr.spoof ? "#ff5470" : "#8ef23c"} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Target size={28} className="text-[#5b8cff]" />
                  <p className="text-xs text-[#7d92c4]">Выбери яркую горизонтальную полосу — это крупная лимитная стена</p>
                </div>
              )}
            </ScenePanel>
            <ScenePanel title="Strongest walls" sub="Клик — трекинг" accent="#ffc531">
              <div className="space-y-1.5">
                {live.map((w) => (
                  <button key={w.id} onClick={() => { setTracked(w.id); sfx.pop(); }}
                    className={cn("relative flex w-full items-center gap-2 overflow-hidden rounded-xl border px-2.5 py-1.5 text-left", tracked === w.id ? "border-[#8ef23c]/60 bg-[#8ef23c]/10" : "border-white/8 bg-black/25")}
                  >
                    <motion.span className="absolute inset-y-0 left-0 bg-[#ffc531]/15" initial={false} animate={{ width: `${(w.strength / 1.8) * 100}%` }} />
                    <span className="num-mono relative text-[11px] font-extrabold text-white">{rowToPrice(w.row).toFixed(0)}</span>
                    <span className={cn("relative ml-auto text-[10px] font-extrabold", w.row < price.current ? "text-[#ff8ba0]" : "text-[#5ff5a8]")}>{w.row < price.current ? "ASK" : "BID"}</span>
                    <span className="num-mono relative w-9 text-right text-[10px] text-[#8ea6d8]">{w.strength.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SceneStat label="Pulled" value={`${pulled}`} color="#ff5470" />
                <SceneStat label="Absorbed" value={`${absorbed}`} color="#ffc531" />
              </div>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
