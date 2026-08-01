import { documentTranslationSlugs } from "../content/index";
import {
  ROUTE_PATHS,
  SEGMENT_TO_LOCALE,
  documentHref,
  localizedHref,
  type Locale,
  type RouteKey,
} from "./config";

type Parsed = { locale: Locale; slug: string };

function parse(pathname: string): Parsed | null {
  const [, segment = "", ...rest] = pathname.split("/");
  const locale = SEGMENT_TO_LOCALE[segment];
  if (!locale) return null;

  return { locale, slug: rest.join("/").replace(/\/$/, "") };
}

function staticRouteKey(locale: Locale, slug: string): RouteKey | null {
  const keys = Object.keys(ROUTE_PATHS) as RouteKey[];
  return keys.find((key) => ROUTE_PATHS[key][locale] === slug) ?? null;
}

/** Um documento troca de slug junto com o idioma: o vínculo é o translationKey, não a URL. */
function documentPath(
  parsed: Parsed,
  target: Locale,
  parent: "work" | "writing",
  kind: "case" | "article",
): string | null {
  const prefix = `${ROUTE_PATHS[parent][parsed.locale]}/`;
  if (!parsed.slug.startsWith(prefix)) return null;

  const slug = parsed.slug.slice(prefix.length);
  if (slug === "" || slug.includes("/")) return null;

  const translated = documentTranslationSlugs(kind, parsed.locale, slug)[target];
  return translated ? documentHref(parent, target, translated) : null;
}

/** Leva o visitante para a mesma página no idioma alvo; cai na home se não houver equivalente. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parsed = parse(pathname);
  if (!parsed) return localizedHref("home", target);

  const key = staticRouteKey(parsed.locale, parsed.slug);
  if (key) return localizedHref(key, target);

  return (
    documentPath(parsed, target, "work", "case") ??
    documentPath(parsed, target, "writing", "article") ??
    localizedHref("home", target)
  );
}
