import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { CLIENT_DIR } from "./html-files";

/**
 * Teto do JS que toda visita paga, gzipado. A cena 3D e as bibliotecas de movimento
 * ficam fora desta conta de propósito: carregam depois do LCP e só para quem as recebe.
 * Foi a ausência deste portão que deixou 34 KB de conteúdo desnecessário passarem na
 * Fase 1 — a home baixava o texto de todas as páginas do site.
 *
 * O teto existe para barrar **regressão**, não publicação. O índice de frontmatter
 * cresce cerca de 800 bytes por documento, e isso é conteúdo legítimo: com 30
 * documentos o crítico fica em ~122 KB. Um vazamento como o da Fase 1 chega de uma vez,
 * em dezenas de KB, e continua sendo pego. Ajustado de 120 para 132 KB em 2026-08-01,
 * quando publicar o quinto case deixou 280 bytes de folga.
 */
const CRITICAL_BUDGET_BYTES = 132 * 1024;

const ASSET = /\/assets\/([A-Za-z0-9._-]+\.js)/g;

export function modulesOf(html: string): string[] {
  return [
    ...new Set([...html.matchAll(ASSET)].map((match) => match[1] as string)),
  ];
}

export function renderReport(modules: { name: string; bytes: number }[]): string {
  return [...modules]
    .sort((a, b) => b.bytes - a.bytes)
    .map((module) => `  ${String(module.bytes).padStart(7)} B  ${module.name}`)
    .join("\n");
}

function main(): void {
  const html = readFileSync(join(CLIENT_DIR, "en", "index.html"), "utf8");

  const modules = modulesOf(html).map((name) => ({
    name,
    bytes: gzipSync(readFileSync(join(CLIENT_DIR, "assets", name))).length,
  }));

  const total = modules.reduce((sum, module) => sum + module.bytes, 0);

  console.log(`JS crítico da home:\n${renderReport(modules)}`);
  console.log(
    `  ${String(total).padStart(7)} B  TOTAL (teto ${CRITICAL_BUDGET_BYTES})`,
  );

  if (total > CRITICAL_BUDGET_BYTES) {
    throw new Error(
      `JS crítico em ${total} bytes, acima do teto de ${CRITICAL_BUDGET_BYTES}. ` +
        `O módulo mais pesado está no topo da lista acima. Se o crescimento for ` +
        `legítimo, mude o teto neste arquivo e explique no colofão.`,
    );
  }
}

if (process.argv[1]?.endsWith("check-budget.ts")) {
  main();
}
