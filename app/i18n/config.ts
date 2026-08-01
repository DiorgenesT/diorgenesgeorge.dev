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

export type RouteKey = "home" | "colophon";

/** Slug por rota e por idioma. String vazia significa a raiz do idioma. */
export const ROUTE_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { "pt-BR": "", "pt-PT": "", "en-US": "" },
  colophon: { "pt-BR": "colofao", "pt-PT": "colofao", "en-US": "colophon" },
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
