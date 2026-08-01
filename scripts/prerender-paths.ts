import {
  LOCALES,
  ROUTE_PATHS,
  documentHref,
  localizedHref,
  tagHref,
  type RouteKey,
} from "../app/i18n/config";
import { contentManifest } from "./content-manifest";

const STATIC_KEYS = Object.keys(ROUTE_PATHS) as RouteKey[];

/** Publicar um artigo é criar um arquivo: a lista de caminhos sai do conteúdo, não da mão. */
export function prerenderPaths(): string[] {
  const staticPaths = LOCALES.flatMap((locale) =>
    STATIC_KEYS.map((key) => localizedHref(key, locale)),
  );

  const entries = contentManifest();

  const documents = entries.map((entry) =>
    documentHref(
      entry.kind === "case" ? "work" : "writing",
      entry.locale,
      entry.slug,
    ),
  );

  const tags = entries
    .filter((entry) => entry.kind === "article")
    .flatMap((entry) => entry.tags.map((tag) => tagHref(entry.locale, tag)));

  // Recursos não terminam em barra: são arquivos, não diretórios de página.
  const resources = [
    "/sitemap.xml",
    "/robots.txt",
    ...LOCALES.flatMap((locale) => [
      `${localizedHref("writing", locale)}feed.xml`,
      `${localizedHref("writing", locale)}feed.json`,
    ]),
  ];

  return [...new Set([...staticPaths, ...documents, ...tags, ...resources])];
}
