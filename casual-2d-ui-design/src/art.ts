/**
 * Art is served from the build output (dist/art/*), referenced with relative
 * paths so it resolves correctly no matter what sub-path the app is mounted on.
 * Every consumer degrades gracefully if a file is unavailable:
 *  - <Art> falls back to a tinted radial glow (see lib/ui.tsx)
 *  - background <img> layers sit on top of self-sufficient CSS gradients
 */
const p = (f: string) => new URL(`art/${f}`, document.baseURI).href;

export const ART = {
  chimera: p("chimera.png"),
  dopamine: p("dopamine.png"),
  fomo: p("fomo.png"),
  loss: p("loss.png"),
  paper: p("paper.png"),
  wick: p("wick.png"),
  hero: p("hero.png"),
  bgArena: p("bg-arena.png"),
  bgMap: p("bg-map.png"),
};
