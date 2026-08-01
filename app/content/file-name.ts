import { LOCALES, type Locale } from "../i18n/config";

const FILE_NAME = /\/([a-z0-9-]+)\.([A-Za-z-]+)\.mdx$/;

/** Vive fora de schema.ts porque o registro do browser precisa dela sem carregar o Zod junto. */
export function parseFileName(
  path: string,
): { slug: string; locale: Locale } | undefined {
  const match = FILE_NAME.exec(path);
  if (!match) return undefined;

  const [, slug, locale] = match;
  if (!LOCALES.includes(locale as Locale)) return undefined;

  return { slug: slug as string, locale: locale as Locale };
}
