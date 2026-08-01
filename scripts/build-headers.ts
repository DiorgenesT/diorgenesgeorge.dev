import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CLIENT_DIR = "build/client";

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

export function extractInlineScripts(html: string): string[] {
  return [...html.matchAll(INLINE_SCRIPT)]
    .map((match) => match[1] ?? "")
    .filter((body) => body.length > 0);
}

export function sha256Base64(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("base64");
}

export function renderHeadersFile(hashes: string[]): string {
  const scriptHashes = hashes.map((h) => `'sha256-${h}'`).join(" ");
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
`;
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return found.flat();
}

async function main(): Promise<void> {
  const files = await htmlFiles(CLIENT_DIR);
  const bodies = new Set<string>();

  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const body of extractInlineScripts(html)) bodies.add(body);
  }

  const hashes = [...bodies].map(sha256Base64).sort();
  await writeFile(join(CLIENT_DIR, "_headers"), renderHeadersFile(hashes));

  console.log(
    `_headers gerado: ${files.length} páginas, ${hashes.length} scripts inline`,
  );
}

if (process.argv[1]?.endsWith("build-headers.ts")) {
  await main();
}
