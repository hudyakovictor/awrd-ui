import type { Category, Asset } from "../data/catalog";
import { NOTES, FALLBACK_NOTE } from "../data/notes";
import { S, TUNE } from "./motion";

/* =====================================================================
   ГЕНЕРАТОР СПЕЦИФИКАЦИИ — каталог отдаёт не «посмотрите красиво»,
   а готовый хендофф-документ для разработчика: физика, тайминги,
   чеклист приёмки, ловушки и код по каждому экрану.
   ===================================================================== */

const head = () => `# Motion-спецификация «СИГНАЛ»

Сгенерировано каталогом ${new Date().toLocaleDateString("ru-RU")} при текущих параметрах тюнера.

## Базовая физика

| Пресет | stiffness | damping | mass | Назначение |
|---|---|---|---|---|
| \`snap\` | ${S.snap.stiffness} | ${S.snap.damping} | ${S.snap.mass} | кнопки, тумблеры, тапы |
| \`pop\` | ${S.pop.stiffness} | ${S.pop.damping} | ${S.pop.mass} | награды, акценты |
| \`soft\` | ${S.soft.stiffness} | ${S.soft.damping} | ${S.soft.mass} | панели, шиты, экраны |
| \`heavy\` | ${S.heavy.stiffness} | ${S.heavy.damping} | ${S.heavy.mass} | тяжёлые объекты |

**Глобальные множители:** темп ×${TUNE.speed.toFixed(2)} · упругость ×${TUNE.bounce.toFixed(2)} · масса ×${TUNE.weight.toFixed(2)} · каскад ×${TUNE.stagger.toFixed(2)} (${Math.round(70 * TUNE.stagger)} мс) · импакт ×${TUNE.impact.toFixed(2)} · частицы ×${TUNE.particles.toFixed(2)}

**Кривые:** \`out [.16,1,.3,1]\` · \`inOut [.83,0,.17,1]\` · \`back [.34,1.56,.64,1]\`
`;

function assetBlock(a: Asset, i: number) {
  const n = NOTES[a.id] ?? FALLBACK_NOTE;
  return `
### ${i}. ${a.title}
*${a.sub}* — теги: ${a.tags.map((t) => `\`${t}\``).join(", ")}

${a.brief}

**Приёмы**
${a.secrets.map((s) => `- **${s.t}.** ${s.d}`).join("\n")}

**Партитура**

| # | Событие | Тайминг |
|---|---|---|
${n.beats.map((b, k) => `| ${k + 1} | ${b.t} | ${b.ms} мс |`).join("\n")}

**Чеклист приёмки**
${n.check.map((c) => `- [ ] ${c}`).join("\n")}

**Где ломается**
${n.traps.map((c) => `- [!] ${c}`).join("\n")}

**Стоимость:** ${n.perf}

\`\`\`tsx
${a.code}
\`\`\`
`;
}

export function specForCategory(cat: Category) {
  return `${head()}
---

## Категория: ${cat.name}
*${cat.tagline}*

${cat.desc}

Экранов: **${cat.assets.length}**
${cat.assets.map((a, i) => assetBlock(a, i + 1)).join("\n---\n")}
`;
}

export function specForAll(cats: Category[]) {
  let i = 0;
  return `${head()}
---
${cats
  .map(
    (c) => `
## ${c.name}
*${c.tagline}* — ${c.assets.length} экранов

${c.desc}
${c.assets.map((a) => assetBlock(a, ++i)).join("\n")}
`,
  )
  .join("\n---\n")}
`;
}

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
