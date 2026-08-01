import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import {
  LOCALES,
  LOCALE_SEGMENTS,
  ROUTE_PATHS,
  TAG_SEGMENT,
} from "./i18n/config";

const resources: RouteConfig = [
  route("sitemap.xml", "routes/resources/sitemap.ts", { id: "sitemap" }),
  route("robots.txt", "routes/resources/robots.ts", { id: "robots" }),
];

const localized = LOCALES.flatMap((locale) => {
  const segment = LOCALE_SEGMENTS[locale];
  const writing = ROUTE_PATHS.writing[locale];

  return prefix(segment, [
    // Fora do layout: feed não tem interface.
    route(`${writing}/feed.xml`, "routes/resources/feed-rss.ts", {
      id: `feed-rss-${segment}`,
    }),
    route(`${writing}/feed.json`, "routes/resources/feed-json.ts", {
      id: `feed-json-${segment}`,
    }),
    layout("layouts/site.tsx", { id: `site-${segment}` }, [
      index("routes/home.tsx", { id: `home-${segment}` }),
      route(ROUTE_PATHS.about[locale], "routes/about.tsx", {
        id: `about-${segment}`,
      }),
      route(ROUTE_PATHS.cv[locale], "routes/cv.tsx", { id: `cv-${segment}` }),
      route(ROUTE_PATHS.services[locale], "routes/services.tsx", {
        id: `services-${segment}`,
      }),
      route(ROUTE_PATHS.contact[locale], "routes/contact.tsx", {
        id: `contact-${segment}`,
      }),
      route(ROUTE_PATHS.work[locale], "routes/work.tsx", {
        id: `work-${segment}`,
      }),
      route(`${ROUTE_PATHS.work[locale]}/:slug`, "routes/work.case.tsx", {
        id: `work-case-${segment}`,
      }),
      route(writing, "routes/writing.tsx", { id: `writing-${segment}` }),
      route(`${writing}/${TAG_SEGMENT[locale]}/:tag`, "routes/writing.tag.tsx", {
        id: `writing-tag-${segment}`,
      }),
      route(`${writing}/:slug`, "routes/writing.article.tsx", {
        id: `writing-article-${segment}`,
      }),
      route(ROUTE_PATHS.colophon[locale], "routes/colophon.tsx", {
        id: `colophon-${segment}`,
      }),
      // Sem rota nomeada para o 404: o caminho pré-renderizado precisa casar com o mesmo
      // splat que atende qualquer URL desconhecida, ou o id de rota diverge na hidratação.
      route("*", "routes/not-found.tsx", { id: `splat-${segment}` }),
    ]),
  ]);
});

export default [...resources, ...localized] satisfies RouteConfig;
