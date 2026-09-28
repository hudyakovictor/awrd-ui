import { useId } from "react";

/** Mini candlestick schematic for a pattern id (+ direction arrow). */
export default function PatternIcon({ id, s = 40 }: { id: string; s?: number }) {
  const u = useId();
  const G = "#1ff0c8", R = "#ff5c6e";
  const c = (x: number, y: number, h: number, up: boolean, wl = 3, wh = 3) => (
    <g key={u + x}>
      <line x1={x + 5.5} y1={y - wl} x2={x + 5.5} y2={y + h + wh} stroke={up ? G : R} strokeWidth="1.6" />
      <rect x={x} y={y} width="11" height={h} rx="2" fill={up ? G : R} />
      <rect x={x + 1.2} y={y + 1} width="2.6" height={Math.max(0, h - 2)} rx="1.3" fill="#fff" opacity=".35" />
    </g>
  );
  let body: React.ReactNode = null;
  switch (id) {
    case "bullEng":
      body = (<>{c(2, 15, 13, false)}{c(18, 8, 25, true)}</>);
      break;
    case "bearEng":
      body = (<>{c(2, 8, 13, true)}{c(18, 4, 25, false)}</>);
      break;
    case "hammer":
      body = (<>{c(8, 5, 7, true, 2, 16)}</>);
      break;
    case "shoot":
      body = (<>{c(8, 21, 7, false, 16, 2)}</>);
      break;
    case "dojiUp":
      body = (<> {c(6, 18, 3, true, 8, 7)} <line x1="8" y1="11" x2="8" y2="28" stroke="#1ff0c8" strokeWidth="1.6" /><rect x="2.5" y="18.5" width="11" height="2.6" rx="1.3" fill="#1ff0c8" /></>);
      body = (<g>{c(18, 18, 2.6, true)}<line x1="23.5" y1="9" x2="23.5" y2="30" stroke="#1ff0c8" strokeWidth="1.6" /></g>);
      break;
    case "soldiers":
      body = (<>{c(2, 18, 10, true)}{c(12, 10, 11, true)}{c(22, 3, 11, true)}</>);
      break;
    case "crows":
      body = (<>{c(2, 3, 10, false)}{c(12, 11, 11, false)}{c(22, 19, 11, false)}</>);
      break;
  }
  const down = ["bearEng", "shoot", "crows"].includes(id);
  return (
    <svg width={s} height={s} viewBox="0 0 36 34" className="block">
      {body}
      {/* direction arrow */}
      <g transform={`translate(${down ? 0 : 0},0)`}>
        <path d={down ? "M30 8 v13 l-3.4 -3.4 M30 21 l3.4 -3.4" : "M30 24 V10 l-3.4 3.4 M30 10 l3.4 3.4"}
          stroke={down ? "#ff5c6e" : "#1ff0c8"} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
