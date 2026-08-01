import {
  LOCALES,
  ROUTE_PATHS,
  localizedHref,
  type RouteKey,
} from "../app/i18n/config";

export function prerenderPaths(): string[] {
  const keys = Object.keys(ROUTE_PATHS) as RouteKey[];
  return LOCALES.flatMap((locale) =>
    keys.map((key) => localizedHref(key, locale)),
  );
}
