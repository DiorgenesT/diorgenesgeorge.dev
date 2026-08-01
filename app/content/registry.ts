import type { ComponentType } from "react";
import type { Locale } from "../i18n/config";
import { parseFileName } from "./file-name";
import type {
  ArticleFrontmatter,
  CaseFrontmatter,
  PageFrontmatter,
} from "./schema";

type MdxModule = { default: ComponentType; frontmatter?: unknown };

export type Doc<T> = {
  slug: string;
  locale: Locale;
  frontmatter: T;
  Content: ComponentType;
};

/**
 * O frontmatter chega validado: `scripts/validate-content.ts` roda antes do build e
 * falha se algo estiver fora do schema. Aqui não há Zod de propósito — ele compila
 * validadores com `new Function`, que a CSP do site bloqueia, e pesa no bundle.
 */
function collect<T>(modules: Record<string, MdxModule>): Doc<T>[] {
  return Object.entries(modules).map(([path, module]) => {
    const parsed = parseFileName(path);
    if (!parsed) throw new Error(`nome de arquivo de conteúdo inválido: ${path}`);

    return {
      ...parsed,
      frontmatter: module.frontmatter as T,
      Content: module.default,
    };
  });
}

const pages = collect<PageFrontmatter>(
  import.meta.glob<MdxModule>("./pages/*.mdx", { eager: true }),
);
const cases = collect<CaseFrontmatter>(
  import.meta.glob<MdxModule>("./cases/*.mdx", { eager: true }),
);
const articles = collect<ArticleFrontmatter>(
  import.meta.glob<MdxModule>("./articles/*.mdx", { eager: true }),
);

const isPublished = (doc: Doc<{ status: string }>) =>
  doc.frontmatter.status === "publicado";

export function getPage(
  locale: Locale,
  key: string,
): Doc<PageFrontmatter> | undefined {
  return pages.find((doc) => doc.locale === locale && doc.slug === key);
}

export function listCases(locale: Locale): Doc<CaseFrontmatter>[] {
  return cases
    .filter((doc) => doc.locale === locale && isPublished(doc))
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getCase(
  locale: Locale,
  slug: string,
): Doc<CaseFrontmatter> | undefined {
  return listCases(locale).find((doc) => doc.slug === slug);
}

export function listArticles(locale: Locale): Doc<ArticleFrontmatter>[] {
  return articles
    .filter((doc) => doc.locale === locale && isPublished(doc))
    .sort((a, b) =>
      b.frontmatter.published.localeCompare(a.frontmatter.published),
    );
}

export function getArticle(
  locale: Locale,
  slug: string,
): Doc<ArticleFrontmatter> | undefined {
  return listArticles(locale).find((doc) => doc.slug === slug);
}

export function listTags(locale: Locale): string[] {
  const tags = listArticles(locale).flatMap((doc) => doc.frontmatter.tags);
  return [...new Set(tags)].sort();
}

export function listArticlesByTag(
  locale: Locale,
  tag: string,
): Doc<ArticleFrontmatter>[] {
  return listArticles(locale).filter((doc) => doc.frontmatter.tags.includes(tag));
}

/** Traduções de um documento a partir do par idioma e slug, que é o que uma URL entrega. */
export function documentTranslations(
  kind: "case" | "article",
  locale: Locale,
  slug: string,
): Partial<Record<Locale, string>> {
  const source = kind === "case" ? cases : articles;
  const doc = source.find((d) => d.locale === locale && d.slug === slug);

  return doc ? translationsOf(kind, doc.frontmatter.translationKey) : {};
}

/** Locale → slug das traduções publicadas do mesmo documento. É a origem do hreflang. */
export function translationsOf(
  kind: "case" | "article" | "page",
  translationKey: string,
): Partial<Record<Locale, string>> {
  const source = kind === "case" ? cases : kind === "article" ? articles : pages;

  return Object.fromEntries(
    source
      .filter(
        (doc) =>
          doc.frontmatter.translationKey === translationKey &&
          (kind === "page" || isPublished(doc)),
      )
      .map((doc) => [doc.locale, doc.slug]),
  );
}
