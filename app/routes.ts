import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import { LOCALES, LOCALE_SEGMENTS, ROUTE_PATHS } from "./i18n/config";

export default LOCALES.flatMap((locale) => {
  const segment = LOCALE_SEGMENTS[locale];
  return prefix(segment, [
    layout("layouts/site.tsx", { id: `site-${segment}` }, [
      index("routes/home.tsx", { id: `home-${segment}` }),
      route(ROUTE_PATHS.colophon[locale], "routes/colophon.tsx", {
        id: `colophon-${segment}`,
      }),
    ]),
  ]);
}) satisfies RouteConfig;
