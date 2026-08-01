import { listArticles } from "../../content/registry";
import { getDictionary } from "../../i18n/dictionary";
import { localeFromPathname } from "../../i18n/use-locale";
import { renderJsonFeed } from "../../seo/feed";

export function loader({ request }: { request: Request }) {
  const path = new URL(request.url).pathname;
  const locale = localeFromPathname(path);
  const title = getDictionary(locale)["meta.writing.title"];

  return new Response(
    renderJsonFeed(locale, title, path, listArticles(locale)),
    { headers: { "Content-Type": "application/feed+json; charset=utf-8" } },
  );
}
