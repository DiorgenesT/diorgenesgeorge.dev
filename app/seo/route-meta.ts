import {
  findArticleIndex,
  findCaseIndex,
  pageIndex,
} from "../content/index";
import { documentHref, localizedHref, type RouteKey } from "../i18n/config";
import { localeFromPathname } from "../i18n/use-locale";
import { buildMeta } from "./meta";
import {
  articleTranslations,
  caseTranslations,
  pageTranslations,
  staticTranslations,
} from "./urls";

/** Página cujo texto vive em MDX: título e descrição saem do frontmatter, nunca duplicados. */
export function prosePageMeta(pathname: string, key: RouteKey, pageKey: string) {
  const locale = localeFromPathname(pathname);
  const page = pageIndex(locale, pageKey);
  if (!page) throw new Error(`página ${pageKey} ausente no idioma ${locale}`);

  return buildMeta({
    locale,
    path: localizedHref(key, locale),
    title: page.frontmatter.title,
    description: page.frontmatter.answer,
    translations: pageTranslations(key),
  });
}

export function staticPageMeta(
  pathname: string,
  key: RouteKey,
  title: string,
  description: string,
) {
  const locale = localeFromPathname(pathname);

  return buildMeta({
    locale,
    path: localizedHref(key, locale),
    title,
    description,
    translations: staticTranslations(key),
  });
}

export function caseMeta(pathname: string, slug: string | undefined) {
  const locale = localeFromPathname(pathname);
  const doc = slug ? findCaseIndex(locale, slug) : undefined;
  if (!doc) return [{ title: "404" }, { name: "robots", content: "noindex" }];

  return buildMeta({
    locale,
    path: documentHref("work", locale, doc.slug),
    title: doc.frontmatter.title,
    description: doc.frontmatter.answer,
    translations: caseTranslations(locale, doc.slug),
    type: "article",
  });
}

export function articleMeta(pathname: string, slug: string | undefined) {
  const locale = localeFromPathname(pathname);
  const doc = slug ? findArticleIndex(locale, slug) : undefined;
  if (!doc) return [{ title: "404" }, { name: "robots", content: "noindex" }];

  return buildMeta({
    locale,
    path: documentHref("writing", locale, doc.slug),
    title: doc.frontmatter.title,
    description: doc.frontmatter.answer,
    translations: articleTranslations(locale, doc.slug),
    type: "article",
  });
}
