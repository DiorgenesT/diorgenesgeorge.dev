import { SITE_URL } from "../config/site";
import { LOCALES, type Locale } from "../i18n/config";

const X_DEFAULT_LOCALE: Locale = "en-US";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export type MetaInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Locale → caminho da tradução que existe de fato. Nunca inclui idioma ausente. */
  translations: Partial<Record<Locale, string>>;
  type?: "website" | "article";
  noindex?: boolean;
};

type MetaDescriptor = Record<string, string>;

/** Emite title, descrição, canonical absoluta, Open Graph e hreflang recíproco. */
export function buildMeta(input: MetaInput): MetaDescriptor[] {
  const url = absoluteUrl(input.path);

  const tags: MetaDescriptor[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:locale", content: input.locale.replace("-", "_") },
    { name: "twitter:card", content: "summary" },
  ];

  if (input.noindex) {
    tags.push({ name: "robots", content: "noindex,follow" });
  }

  for (const locale of LOCALES) {
    const path = input.translations[locale];
    if (!path) continue;

    tags.push({
      tagName: "link",
      rel: "alternate",
      hreflang: locale,
      href: absoluteUrl(path),
    });
  }

  const xDefault = input.translations[X_DEFAULT_LOCALE];
  if (xDefault) {
    tags.push({
      tagName: "link",
      rel: "alternate",
      hreflang: "x-default",
      href: absoluteUrl(xDefault),
    });
  }

  return tags;
}
