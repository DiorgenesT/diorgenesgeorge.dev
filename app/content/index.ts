import type { Locale } from "../i18n/config";
import { CONTENT_INDEX, type IndexEntry } from "./index.generated";

/**
 * Frontmatter sem o MDX junto. É o que a navegação, a home e o SEO precisam — e
 * importar o registro completo neles fazia cada visitante baixar o texto de todas
 * as páginas do site.
 */
export function listCaseIndex(
  locale: Locale,
): Extract<IndexEntry, { kind: "case" }>[] {
  return CONTENT_INDEX.filter(
    (entry): entry is Extract<IndexEntry, { kind: "case" }> =>
      entry.kind === "case" && entry.locale === locale,
  ).sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function listArticleIndex(
  locale: Locale,
): Extract<IndexEntry, { kind: "article" }>[] {
  return CONTENT_INDEX.filter(
    (entry): entry is Extract<IndexEntry, { kind: "article" }> =>
      entry.kind === "article" && entry.locale === locale,
  ).sort((a, b) =>
    b.frontmatter.published.localeCompare(a.frontmatter.published),
  );
}

export function pageIndex(
  locale: Locale,
  key: string,
): Extract<IndexEntry, { kind: "page" }> | undefined {
  return CONTENT_INDEX.find(
    (entry): entry is Extract<IndexEntry, { kind: "page" }> =>
      entry.kind === "page" && entry.locale === locale && entry.slug === key,
  );
}

export function listTagIndex(locale: Locale): string[] {
  const tags = listArticleIndex(locale).flatMap(
    (entry) => entry.frontmatter.tags,
  );
  return [...new Set(tags)].sort();
}

export function findCaseIndex(
  locale: Locale,
  slug: string,
): Extract<IndexEntry, { kind: "case" }> | undefined {
  return listCaseIndex(locale).find((entry) => entry.slug === slug);
}

export function findArticleIndex(
  locale: Locale,
  slug: string,
): Extract<IndexEntry, { kind: "article" }> | undefined {
  return listArticleIndex(locale).find((entry) => entry.slug === slug);
}

/** Locale → slug das traduções publicadas de um documento, sem carregar o MDX. */
export function documentTranslationSlugs(
  kind: "case" | "article",
  locale: Locale,
  slug: string,
): Partial<Record<Locale, string>> {
  const source = CONTENT_INDEX.filter((entry) => entry.kind === kind);
  const doc = source.find(
    (entry) => entry.locale === locale && entry.slug === slug,
  );
  if (!doc) return {};

  return Object.fromEntries(
    source
      .filter(
        (entry) =>
          entry.frontmatter.translationKey === doc.frontmatter.translationKey,
      )
      .map((entry) => [entry.locale, entry.slug]),
  );
}

/** Traduções de uma página de prosa, a partir do translationKey compartilhado. */
export function pageTranslationLocales(key: string): Locale[] {
  const any = CONTENT_INDEX.find(
    (entry): entry is Extract<IndexEntry, { kind: "page" }> =>
      entry.kind === "page" && entry.slug === key,
  );
  if (!any) return [];

  return CONTENT_INDEX.filter(
    (entry) =>
      entry.kind === "page" &&
      entry.frontmatter.translationKey === any.frontmatter.translationKey,
  ).map((entry) => entry.locale);
}
