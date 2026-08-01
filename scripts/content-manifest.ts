import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { Locale } from "../app/i18n/config";
import { parseFileName } from "../app/content/schema";

export type ManifestEntry = {
  kind: "case" | "article";
  slug: string;
  locale: Locale;
  tags: string[];
};

const CONTENT_DIR = "app/content";

/** O react-router.config.ts roda em Node e não tem import.meta.glob; o teste de paridade guarda as duas leituras. */
function scan(kind: "case" | "article", dir: string): ManifestEntry[] {
  const full = join(CONTENT_DIR, dir);
  // Nenhum documento ainda é estado válido: o site precisa construir antes do primeiro case.
  if (!existsSync(full)) return [];

  return readdirSync(full)
    .filter((name) => name.endsWith(".mdx"))
    .flatMap((name) => {
      const parsed = parseFileName(`./${dir}/${name}`);
      if (!parsed) return [];

      const { data } = matter(readFileSync(join(full, name), "utf8"));
      if (data.status !== "publicado") return [];

      return [{ kind, ...parsed, tags: (data.tags as string[]) ?? [] }];
    });
}

export function contentManifest(): ManifestEntry[] {
  return [...scan("case", "cases"), ...scan("article", "articles")];
}
