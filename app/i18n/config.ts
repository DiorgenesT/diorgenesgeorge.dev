export const LOCALES = ["pt-BR", "pt-PT", "en-US"] as const;

export type Locale = (typeof LOCALES)[number];

/** Fallback para visitante sem idioma reconhecido — coerente com o x-default apontando para /en/. */
export const DEFAULT_LOCALE: Locale = "en-US";

export const LOCALE_SEGMENTS: Record<Locale, string> = {
  "pt-BR": "pt-br",
  "pt-PT": "pt-pt",
  "en-US": "en",
};

export const SEGMENT_TO_LOCALE: Record<string, Locale> = Object.fromEntries(
  LOCALES.map((locale) => [LOCALE_SEGMENTS[locale], locale]),
) as Record<string, Locale>;

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  "pt-PT": "Português (Portugal)",
  "en-US": "English",
};

export type RouteKey =
  | "home"
  | "about"
  | "cv"
  | "services"
  | "work"
  | "writing"
  | "contact"
  | "colophon"
  | "notFound";

/** Slug por rota e por idioma. String vazia significa a raiz do idioma. */
export const ROUTE_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { "pt-BR": "", "pt-PT": "", "en-US": "" },
  about: { "pt-BR": "sobre", "pt-PT": "sobre", "en-US": "about" },
  cv: { "pt-BR": "cv", "pt-PT": "cv", "en-US": "cv" },
  services: { "pt-BR": "servicos", "pt-PT": "servicos", "en-US": "services" },
  work: { "pt-BR": "trabalho", "pt-PT": "trabalho", "en-US": "work" },
  writing: { "pt-BR": "escritos", "pt-PT": "escritos", "en-US": "writing" },
  contact: { "pt-BR": "contato", "pt-PT": "contacto", "en-US": "contact" },
  colophon: { "pt-BR": "colofao", "pt-PT": "colofao", "en-US": "colophon" },
  notFound: { "pt-BR": "404", "pt-PT": "404", "en-US": "404" },
};

/** Segmento de arquivo por tag, dentro da rota de escritos. */
export const TAG_SEGMENT: Record<Locale, string> = {
  "pt-BR": "tag",
  "pt-PT": "etiqueta",
  "en-US": "tag",
};

/**
 * Sempre com barra final: os assets estáticos são arquivos de índice de diretório,
 * e sem isto o edge devolveria um 307 antes de cada página.
 */
export function localizedHref(routeKey: RouteKey, locale: Locale): string {
  const segment = LOCALE_SEGMENTS[locale];
  const slug = ROUTE_PATHS[routeKey][locale];
  return slug === "" ? `/${segment}/` : `/${segment}/${slug}/`;
}

/** URL de um documento sob o índice que o contém. O slug já vem localizado do arquivo. */
export function documentHref(
  parent: "work" | "writing",
  locale: Locale,
  slug: string,
): string {
  return `${localizedHref(parent, locale)}${slug}/`;
}

export function tagHref(locale: Locale, tag: string): string {
  return `${localizedHref("writing", locale)}${TAG_SEGMENT[locale]}/${tag}/`;
}
