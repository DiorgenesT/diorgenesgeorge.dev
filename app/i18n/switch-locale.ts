import {
  ROUTE_PATHS,
  SEGMENT_TO_LOCALE,
  localizedHref,
  type Locale,
  type RouteKey,
} from "./config";

function routeKeyFromPath(pathname: string): RouteKey | null {
  const [, segment = "", ...rest] = pathname.split("/");
  const locale = SEGMENT_TO_LOCALE[segment];
  if (!locale) return null;

  const slug = rest.join("/").replace(/\/$/, "");
  const keys = Object.keys(ROUTE_PATHS) as RouteKey[];
  return keys.find((key) => ROUTE_PATHS[key][locale] === slug) ?? null;
}

/** Leva o visitante para a mesma página no idioma alvo; cai na home se não houver equivalente. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const key = routeKeyFromPath(pathname);
  return key ? localizedHref(key, target) : localizedHref("home", target);
}
