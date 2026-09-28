export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 30 } as const,
  bouncy: { type: "spring", stiffness: 300, damping: 14 } as const,
  pop: { type: "spring", stiffness: 420, damping: 17 } as const,
  soft: { type: "spring", stiffness: 150, damping: 22 } as const,
  slow: { type: "spring", stiffness: 70, damping: 16 } as const,
};
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  back: [0.34, 1.56, 0.64, 1] as const,
 antic: [0.68, -0.6, 0.32, 1.6] as const,
};
export const popIn = (d = 0) => ({
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { ...spring.pop, delay: d },
});