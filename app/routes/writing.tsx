import { Link } from "react-router";
import { listArticleIndex, listTagIndex } from "../content/index";
import { documentHref, tagHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatDate } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { staticPageMeta } from "../seo/route-meta";
import type { Route } from "./+types/writing";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return staticPageMeta(
    location.pathname,
    "writing",
    t["meta.writing.title"],
    t["meta.writing.description"],
  );
}

export default function Writing() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const articles = listArticleIndex(locale);
  const tags = listTagIndex(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["nav.writing"]}
      </h1>

      {articles.length === 0 ? (
        <p className="mt-8 max-w-prose text-lg leading-relaxed text-fg-muted">
          {t["writing.empty"]}
        </p>
      ) : (
        <>
          {tags.length > 0 && (
            <nav aria-label={t["writing.tags"]} className="mt-8">
              <ul className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={tagHref(locale, tag)}
                      className="font-mono text-meta uppercase tracking-widest text-accent"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <ul className="mt-16 space-y-6">
            {articles.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <article className="group relative rounded-xl border border-hairline p-7 transition-colors hover:border-accent focus-within:border-accent sm:p-9">
                  <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
                    <time dateTime={frontmatter.published}>
                      {formatDate(locale, frontmatter.published)}
                    </time>
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
                    <Link
                      to={documentHref("writing", locale, slug)}
                      className="after:absolute after:inset-0 group-hover:text-accent"
                    >
                      {frontmatter.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-prose text-fg-muted">
                    {frontmatter.answer}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {frontmatter.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-hairline px-3 py-1 font-mono text-meta uppercase tracking-widest text-fg-subtle"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
