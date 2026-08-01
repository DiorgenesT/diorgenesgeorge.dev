import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { parseFileName } from "../app/content/file-name";
import { SITE_URL } from "../app/config/site";
import { CV } from "../app/content/cv";
import {
  LOCALES,
  documentHref,
  localizedHref,
  type Locale,
} from "../app/i18n/config";
import { formatMonth } from "../app/i18n/format";
import { CLIENT_DIR } from "./html-files";

const CONTENT_DIR = "app/content";

type Emitted = {
  /** Caminho do arquivo .md dentro de build/client. */
  file: string;
  /** URL pública da versão HTML, que o cabeçalho do markdown cita. */
  canonical: string;
  locale: Locale;
  kind: "page" | "case" | "article";
  title: string;
  answer: string;
  body: string;
};

/** O arquivo .md público é a fonte verbatim, sem frontmatter — por isso o conteúdo é markdown puro. */
function collect(): Emitted[] {
  const out: Emitted[] = [];

  const pageRoute: Record<string, "about" | "services" | "colophon"> = {
    about: "about",
    services: "services",
    colophon: "colophon",
  };

  for (const dir of ["pages", "cases", "articles"] as const) {
    const full = join(CONTENT_DIR, dir);
    if (!existsSync(full)) continue;

    for (const name of readdirSync(full).filter((f) => f.endsWith(".mdx"))) {
      const parsed = parseFileName(`./${dir}/${name}`);
      if (!parsed) continue;

      const { data, content } = matter(readFileSync(join(full, name), "utf8"));
      if (data.status !== "publicado") continue;

      const { slug, locale } = parsed;

      const canonical =
        dir === "pages"
          ? localizedHref(pageRoute[slug] ?? "home", locale)
          : documentHref(dir === "cases" ? "work" : "writing", locale, slug);

      const file =
        dir === "pages"
          ? `${canonical.replace(/\/$/, "")}.md`
          : `${canonical.replace(/\/$/, "")}.md`;

      out.push({
        file,
        canonical,
        locale,
        kind: dir === "pages" ? "page" : dir === "cases" ? "case" : "article",
        title: String(data.title),
        answer: String(data.answer),
        body: content.trim(),
      });
    }
  }

  return out;
}

export function cvToMarkdown(locale: Locale): string {
  const cv = CV[locale];
  const lines = [`# ${cv.headline}`, "", cv.summary, ""];

  for (const position of cv.positions) {
    const end = position.end
      ? formatMonth(locale, position.end)
      : locale === "en-US"
        ? "present"
        : "atual";

    lines.push(
      `## ${position.role} — ${position.org}`,
      "",
      `${formatMonth(locale, position.start)} — ${end} · ${position.location}`,
      "",
      ...position.highlights.map((highlight) => `- ${highlight}`),
      "",
    );
  }

  for (const entry of cv.education) {
    lines.push(
      `## ${entry.degree} — ${entry.org}`,
      "",
      `${formatMonth(locale, entry.start)} — ${formatMonth(locale, entry.end)}`,
      "",
    );
  }

  for (const group of cv.skills) {
    lines.push(`## ${group.group}`, "", group.items.join(", "), "");
  }

  return lines.join("\n");
}

function withHeader(title: string, canonical: string, body: string): string {
  return `# ${title}\n\n${SITE_URL}${canonical}\n\n${body}\n`;
}

async function emit(file: string, contents: string): Promise<void> {
  const target = join(CLIENT_DIR, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents);
}

function llmsIndex(documents: Emitted[]): string {
  const section = (heading: string, kind: Emitted["kind"]) => {
    const items = documents
      .filter((doc) => doc.kind === kind)
      .map(
        (doc) =>
          `- [${doc.title}](${SITE_URL}${doc.file}): ${doc.answer}`,
      );

    return items.length > 0 ? [`## ${heading}`, "", ...items, ""] : [];
  };

  return [
    "# Diorgenes George",
    "",
    "> Desenvolvedor full stack em Betim, Minas Gerais, Brasil. Constrói painéis de dados, portais de serviço e integrações para a administração pública municipal.",
    "",
    ...section("Páginas", "page"),
    ...section("Cases", "case"),
    ...section("Artigos", "article"),
    "## Currículo",
    "",
    ...LOCALES.map(
      (locale) =>
        `- [${CV[locale].headline}](${SITE_URL}${localizedHref("cv", locale).replace(/\/$/, "")}.md): ${CV[locale].summary}`,
    ),
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  const documents = collect();

  for (const doc of documents) {
    await emit(doc.file, withHeader(doc.title, doc.canonical, doc.body));
  }

  for (const locale of LOCALES) {
    const canonical = localizedHref("cv", locale);
    await emit(
      `${canonical.replace(/\/$/, "")}.md`,
      withHeader(CV[locale].headline, canonical, cvToMarkdown(locale)),
    );
  }

  const index = llmsIndex(documents);
  await emit("/llms.txt", index);

  const full = [
    index,
    ...documents.map((doc) =>
      withHeader(doc.title, doc.canonical, doc.body),
    ),
    ...LOCALES.map((locale) =>
      withHeader(
        CV[locale].headline,
        localizedHref("cv", locale),
        cvToMarkdown(locale),
      ),
    ),
  ].join("\n\n---\n\n");

  await emit("/llms-full.txt", full);

  console.log(
    `markdown público: ${documents.length + LOCALES.length} arquivos .md, llms.txt e llms-full.txt (${Math.round(full.length / 1024)} KB)`,
  );
}

if (process.argv[1]?.endsWith("build-markdown.ts")) {
  await main();
}
