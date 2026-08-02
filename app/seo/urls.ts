import {
  documentTranslationSlugs,
  listArticleIndex,
  listCaseIndex,
  pageIndex,
  pageTranslationLocales,
} from "../content/index";
import {
  LOCALES,
  ROUTE_PATHS,
  documentHref,
  localizedHref,
  type Locale,
  type RouteKey,
} from "../i18n/config";

/** Rota fixa existe em todos os idiomas, então a tradução é o próprio mapa de caminhos. */
export function staticTranslations(key: RouteKey): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, localizedHref(key, locale)]),
  ) as Record<Locale, string>;
}

export function caseTranslations(
  locale: Locale,
  slug: string,
): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    Object.entries(documentTranslationSlugs("case", locale, slug)).map(
      ([target, translated]) => [
        target,
        documentHref("work", target as Locale, translated),
      ],
    ),
  );
}

export function articleTranslations(
  locale: Locale,
  slug: string,
): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    Object.entries(documentTranslationSlugs("article", locale, slug)).map(
      ([target, translated]) => [
        target,
        documentHref("writing", target as Locale, translated),
      ],
    ),
  );
}

export type IndexableUrl = {
  path: string;
  locale: Locale;
  title: string;
  description: string;
  translations: Partial<Record<Locale, string>>;
  lastmod: string;
};

const INDEXABLE_KEYS: RouteKey[] = [
  "home",
  "about",
  "cv",
  "services",
  "work",
  "writing",
  "contact",
  "colophon",
];

/** Tudo que é público e indexável. Fora: 404, arquivos de tag e documento em rascunho. */
export function allIndexableUrls(buildDate: string): IndexableUrl[] {
  const urls: IndexableUrl[] = [];

  for (const locale of LOCALES) {
    for (const key of INDEXABLE_KEYS) {
      const page = pageFor(key, locale);

      urls.push({
        path: localizedHref(key, locale),
        locale,
        title: page?.title ?? ROUTE_PATHS[key][locale],
        description: page?.description ?? "",
        translations:
          key === "about" || key === "services" || key === "colophon"
            ? pageTranslations(key)
            : staticTranslations(key),
        lastmod: page?.lastmod ?? buildDate,
      });
    }

    for (const doc of listCaseIndex(locale)) {
      urls.push({
        path: documentHref("work", locale, doc.slug),
        locale,
        title: doc.frontmatter.title,
        description: doc.frontmatter.answer,
        translations: caseTranslations(locale, doc.slug),
        lastmod: doc.frontmatter.updated,
      });
    }

    for (const doc of listArticleIndex(locale)) {
      urls.push({
        path: documentHref("writing", locale, doc.slug),
        locale,
        title: doc.frontmatter.title,
        description: doc.frontmatter.answer,
        translations: articleTranslations(locale, doc.slug),
        lastmod: doc.frontmatter.updated,
      });
    }
  }

  return urls;
}

const PAGE_KEYS: Partial<Record<RouteKey, string>> = {
  about: "about",
  services: "services",
  colophon: "colophon",
};

function pageFor(key: RouteKey, locale: Locale) {
  const pageKey = PAGE_KEYS[key];
  if (!pageKey) return undefined;

  const page = pageIndex(locale, pageKey);
  if (!page) return undefined;

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.answer,
    lastmod: page.frontmatter.updated,
  };
}

/** Página de prosa se traduz pelo translationKey, como qualquer documento. */
export function pageTranslations(key: RouteKey): Partial<Record<Locale, string>> {
  const pageKey = PAGE_KEYS[key];
  if (!pageKey) return staticTranslations(key);

  const locales = pageTranslationLocales(pageKey);
  if (locales.length === 0) return staticTranslations(key);

  return Object.fromEntries(
    locales.map((locale) => [locale, localizedHref(key, locale)]),
  );
}
