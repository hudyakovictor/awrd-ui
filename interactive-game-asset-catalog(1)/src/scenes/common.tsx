import { useEffect, useRef } from "react";

export interface SceneProps {
  run: number;
  cue: () => void;
}

/**
 * useScript — отменяемый async-сценарий.
 * Секрет режиссуры: сцена = линейный скрипт с await-паузами,
 * а не россыпь setTimeout. Каждый await можно отменить при replay/unmount.
 */
export function useScript(run: number, script: (wait: (ms: number) => Promise<void>) => Promise<void>, deps: unknown[] = []) {
  const ref = useRef(script);
  ref.current = script;
  useEffect(() => {
    let alive = true;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        timers.push(window.setTimeout(() => (alive ? res() : rej(new Error("cancel"))), ms));
      });
    ref.current(wait).catch(() => {});
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, ...deps]);
}

export function SceneBg({ tint = "#2ee6c5", children }: { tint?: string; children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#16244a_0%,#0a1122_55%,#060a16_100%)]" />
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl" style={{ background: `${tint}22` }} />
      {children}
    </div>
  );
}
