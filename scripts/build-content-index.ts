import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { parseFileName } from "../app/content/file-name";
import type { Locale } from "../app/i18n/config";

const CONTENT_DIR = "app/content";
const OUT = "app/content/index.generated.ts";

export type IndexEntry = {
  kind: "page" | "case" | "article";
  slug: string;
  locale: Locale;
  frontmatter: Record<string, unknown>;
};

const DIRS = { pages: "page", cases: "case", articles: "article" } as const;

/** Só o frontmatter: o MDX compilado fica no chunk da rota que o renderiza. */
export function collectIndexEntries(): IndexEntry[] {
  return Object.entries(DIRS).flatMap(([dir, kind]) => {
    const full = join(CONTENT_DIR, dir);
    if (!existsSync(full)) return [];

    return readdirSync(full)
      .filter((name) => name.endsWith(".mdx"))
      .flatMap((name): IndexEntry[] => {
        const parsed = parseFileName(`./${dir}/${name}`);
        if (!parsed) return [];

        const { data } = matter(readFileSync(join(full, name), "utf8"));
        if (data.status !== "publicado") return [];

        return [{ kind, ...parsed, frontmatter: data }];
      });
  });
}

export function renderIndexModule(entries: IndexEntry[]): string {
  return `// Gerado por scripts/build-content-index.ts — não editar à mão.
// Só frontmatter: o MDX compilado fica no chunk da rota que o renderiza, para a
// home não baixar o texto de todas as páginas do site.
import type { Locale } from "../i18n/config";
import type {
  ArticleFrontmatter,
  CaseFrontmatter,
  PageFrontmatter,
} from "./schema";

export type IndexEntry =
  | { kind: "page"; slug: string; locale: Locale; frontmatter: PageFrontmatter }
  | { kind: "case"; slug: string; locale: Locale; frontmatter: CaseFrontmatter }
  | {
      kind: "article";
      slug: string;
      locale: Locale;
      frontmatter: ArticleFrontmatter;
    };

export const CONTENT_INDEX: IndexEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

function main(): void {
  const entries = collectIndexEntries();
  writeFileSync(OUT, renderIndexModule(entries));
  console.log(`índice de conteúdo: ${entries.length} documentos`);
}

if (process.argv[1]?.endsWith("build-content-index.ts")) {
  main();
}
