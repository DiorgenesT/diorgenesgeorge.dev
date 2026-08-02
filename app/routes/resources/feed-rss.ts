import { listArticles } from "../../content/registry";
import { localizedHref } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionary";
import { localeFromPathname } from "../../i18n/use-locale";
import { renderRss } from "../../seo/feed";

export function loader({ request }: { request: Request }) {
  const path = new URL(request.url).pathname;
  const locale = localeFromPathname(path);
  const title = getDictionary(locale)["meta.writing.title"];

  return new Response(renderRss(locale, title, path, listArticles(locale)), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

export const feedPath = (locale: Parameters<typeof localizedHref>[1]) =>
  `${localizedHref("writing", locale)}feed.xml`;
