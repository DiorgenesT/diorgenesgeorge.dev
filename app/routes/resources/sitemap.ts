import { renderSitemap } from "../../seo/sitemap";
import { allIndexableUrls } from "../../seo/urls";

export function loader() {
  const buildDate = new Date().toISOString().slice(0, 10);

  return new Response(renderSitemap(allIndexableUrls(buildDate)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
