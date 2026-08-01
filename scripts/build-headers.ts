import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CLIENT_DIR, htmlFiles } from "./html-files";

const SCRIPT_TAG = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

/**
 * Orçamento do cabeçalho de CSP, em bytes. Ele cresce com o número de *rotas*, não de
 * páginas: mil artigos compartilham o mesmo script de módulo da rota de artigo. O valor
 * é idêntico em toda resposta, então a compressão de cabeçalho do HTTP/2 o envia uma vez
 * por conexão. Se estourar, alguma rota passou a emitir script inline por página — o que
 * seria crescimento sem teto, e aí a saída é regra por diretório no _headers.
 */
const CSP_BUDGET_BYTES = 4096;

export function sha256Base64(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("base64");
}

/** Data block (JSON-LD) não é executado pelo browser, então a CSP não o alcança. */
export function executableInlineScripts(html: string): string[] {
  return [...html.matchAll(SCRIPT_TAG)]
    .filter(([, attrs]) => !/\bsrc\s*=/i.test(attrs ?? ""))
    .filter(([, attrs]) => {
      const type = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs ?? "")?.[1];
      return type === undefined || type === "" || type === "module";
    })
    .map(([, , body]) => body ?? "")
    .filter((body) => body.trim() !== "");
}

export function renderHeadersFile(hashes: string[]): string {
  const scriptHashes = hashes.map((hash) => `'sha256-${hash}'`).join(" ");
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  return `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.md
  Content-Type: text/markdown; charset=utf-8
`;
}

export function cspLength(headers: string): number {
  return (/Content-Security-Policy: (.*)/.exec(headers)?.[1] ?? "").length;
}

async function main(): Promise<void> {
  const files = await htmlFiles();
  const bodies = new Set<string>();

  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const body of executableInlineScripts(html)) bodies.add(body);
  }

  const hashes = [...bodies].map(sha256Base64).sort();
  const headers = renderHeadersFile(hashes);
  const size = cspLength(headers);

  if (size > CSP_BUDGET_BYTES) {
    throw new Error(
      `CSP com ${size} bytes, acima do orçamento de ${CSP_BUDGET_BYTES}. ` +
        `São ${hashes.length} scripts inline distintos em ${files.length} páginas: ` +
        `se o número cresce por página e não por rota, o modelo de conteúdo passou a ` +
        `emitir dado embutido por página e a CSP precisa virar regra por diretório.`,
    );
  }

  await writeFile(join(CLIENT_DIR, "_headers"), headers);

  console.log(
    `_headers gerado: ${files.length} páginas, ${hashes.length} hashes, CSP com ${size} de ${CSP_BUDGET_BYTES} bytes`,
  );
}

if (process.argv[1]?.endsWith("build-headers.ts")) {
  await main();
}
