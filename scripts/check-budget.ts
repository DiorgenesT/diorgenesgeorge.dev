import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { CLIENT_DIR } from "./html-files";

/**
 * Teto do JS que toda visita paga, gzipado. Chunk que carrega depois do LCP e so para
 * quem o recebe fica fora desta conta, por decisao: e o caso do GSAP.
 *
 * O teto existe para barrar regressao, nao publicacao. O indice de frontmatter cresce
 * cerca de 800 bytes por documento, e isso e conteudo legitimo: com os 30 documentos da
 * Fase 4 o critico chega perto de 122 KB. Um vazamento chega de uma vez, em dezenas de
 * KB, e continua sendo pego.
 *
 * Ajustado de 132 para 125 KB em 2026-08-02, na Fase 0 do fanzine, depois que o globo
 * 3D, a biblioteca de transicao e as duas fontes sairam. Se a Fase 4 estourar este
 * valor, a saida nao e eleva-lo: e parar de mandar para a home o indice de todo o site.
 * A home precisa dos tres artigos mais recentes, nao do frontmatter de trinta
 * documentos.
 */
const CRITICAL_BUDGET_BYTES = 125 * 1024;

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
