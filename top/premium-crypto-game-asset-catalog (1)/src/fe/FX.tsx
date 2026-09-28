import { type ReactNode, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/* ================================================================== */
/*  GLSL templates — kept as strings for educational banners           */
/* ================================================================== */
export const SHADER_LIBS = {
  noise2D: `
    vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec2 mod289v(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289v(i); vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m;
      m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5;
      vec3 ox=floor(x+0.5);
      vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
  `,
};

export type ShaderKey = "ocean" | "lava" | "nebula" | "circuit" | "diagonal";

/* ================================================================== */
/*  CANVAS BACKDROP — full-screen animated shader-style background.    */
/* ================================================================== */
export function BackdropCanvas({ shader = "ocean", speed = 1 }: { shader?: ShaderKey; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const intRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true });
    if (!ctx) return;

    const Nx = 28;
    const Ny = 20;
    const grid: number[] = new Array((Nx + 1) * (Ny + 1)).fill(0);

    const update = (time: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (c.width !== w * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
        c.style.width = "100%";
        c.style.height = "100%";
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = time / 1000;
      const ow = w / Nx;
      const oh = h / Ny;

      const seed1 = t * 0.3 * speed;
      const seed2 = t * 0.45 * speed;
      const seed3 = t * 0.7 * speed;
      for (let j = 0; j <= Ny; j++) {
        for (let i = 0; i <= Nx; i++) {
          const v =
            Math.sin(seed1 + i * 0.4 + j * 0.3) * 0.5 +
            Math.sin(seed2 + i * 0.7 - j * 0.5) * 0.3 +
            Math.sin(seed3 + i * 0.1 + j * 0.6) * 0.2;
          grid[j * (Nx + 1) + i] = v * 0.5 + 0.5;
        }
      }

      for (let j = 0; j < Ny; j++) {
        for (let i = 0; i < Nx; i++) {
          const v = (grid[j * (Nx + 1) + i] + grid[j * (Nx + 1) + i + 1] + grid[(j + 1) * (Nx + 1) + i] + grid[(j + 1) * (Nx + 1) + i + 1]) / 4;
          let fill = "#04060e";
          if (shader === "ocean" || shader === "diagonal") {
            const mix = (v * 255) | 0;
            fill = `rgb(${4 + (mix / 6) | 0},${6 + (mix / 8) | 0},${14 + (mix / 4) | 0})`;
          } else if (shader === "lava") {
            fill = `rgb(${Math.min(255, (v * 280) | 0)},${Math.min(200, (v * 120) | 0)},${Math.min(60, (v * 60) | 0)})`;
          } else if (shader === "nebula") {
            fill = `rgb(${Math.min(180, (v * 90 + i * 4) | 0)},${Math.min(80, (v * 60) | 0)},${Math.min(180, (v * 140 + j * 3) | 0)})`;
          } else {
            fill = `rgb(${Math.min(180, (v * 80) | 0)},${Math.min(255, (v * 60) | 0)},${Math.min(160, (v * 70) | 0)})`;
          }
          ctx.fillStyle = fill;
          const wobble = 18;
          const cxv = (i * ow + ow / 2) + Math.sin(t * 0.6 + i * 0.5 + j * 0.4) * wobble;
          const cyv = (j * oh + oh / 2) + Math.cos(t * 0.7 + i * 0.3 - j * 0.5) * wobble;
          ctx.beginPath();
          ctx.arc(cxv, cyv, Math.max(4, Math.min(ow, oh) * 0.55 + v * 12), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const grd = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,.55)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      intRef.current = requestAnimationFrame(update);
    };
    intRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(intRef.current);
  }, [shader, speed]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/* ================================================================== */
/*  CHROMATIC ABERRATION overlay                                       */
/* ================================================================== */
export function GlitchOverlay({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !trigger) return;
    el.animate(
      [
        { filter: "hue-rotate(0deg) saturate(1)", opacity: 1 },
        { filter: "hue-rotate(20deg) saturate(1.5)", opacity: 0.9, offset: 0.1 },
        { filter: "hue-rotate(-32deg) saturate(1.6)", opacity: 0.85, offset: 0.3 },
        { filter: "hue-rotate(15deg) saturate(1.2)", opacity: 1, offset: 1 },
      ],
      { duration: 460, easing: "cubic-bezier(.2,.8,.3,1)" },
    );
  }, [trigger]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] mix-blend-screen"
      style={{
        background:
          "repeating-linear-gradient(0deg, rgba(255,0,80,.05) 0 1px, transparent 1px 3px)",
        opacity: 0,
        transition: "opacity 160ms",
      }}
    />
  );
}

/* ================================================================== */
/*  Generic container wrapper that adds a coloured scanline            */
/* ================================================================== */
export function ScanLine({ children, color = "rgba(120, 230, 255, .25)" }: { children: ReactNode; color?: string }) {
  return (
    <div className="relative overflow-hidden">
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 45%, ${color} 50%, transparent 55%)`,
          mixBlendMode: "screen",
          animation: "scan-line 4.6s linear infinite",
          height: "100%",
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  SPARKS PARTICLE PIPELINE                                            */
/* ================================================================== */
export type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  drag: number;
};
export function makeSpark(x: number, y: number, opts: Partial<Spark> = {}): Spark {
  return {
    x,
    y,
    vx: opts.vx ?? (Math.random() - 0.5) * 4,
    vy: opts.vy ?? (Math.random() - 0.5) * 4 - 1,
    life: opts.max ?? 0.9,
    max: opts.max ?? 0.9,
    color: opts.color ?? "#ffc24b",
    size: opts.size ?? 3,
    drag: opts.drag ?? 0.94,
  };
}
export function stepSparks(arr: Spark[], dt: number): void {
  for (let i = arr.length - 1; i >= 0; i--) {
    const s = arr[i];
    s.life -= dt;
    if (s.life <= 0) {
      arr.splice(i, 1);
      continue;
    }
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.18;
    s.vx *= s.drag;
    s.vy *= s.drag;
  }
}
export function drawSparks(ctx: CanvasRenderingContext2D, arr: Spark[]) {
  for (const s of arr) {
    const a = Math.max(0, s.life / s.max);
    ctx.globalAlpha = a;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 12 * a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

/* ================================================================== */
/*  KONAMI / HEATMAP ambient glow that follows the mouse.              */
/* ================================================================== */
export function AmbientGlow({ color }: { color?: string }) {
  // color is intentional styling hook
  void color;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${e.clientX - b.left}px`);
      el.style.setProperty("--gy", `${e.clientY - b.top}px`);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        background:
          "radial-gradient(360px circle at var(--gx,50%) var(--gy,50%), color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
