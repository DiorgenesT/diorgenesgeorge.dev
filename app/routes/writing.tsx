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
      <h1 className="text-4xl leading-tight sm:text-5xl">{t["nav.writing"]}</h1>

      {articles.length === 0 ? (
        <p className="mt-8 max-w-prose text-lg leading-relaxed text-fg-muted">
          {t["writing.empty"]}
        </p>
      ) : (
        <>
          {tags.length > 0 && (
            <nav
              aria-label={t["writing.tags"]}
              className="mt-8 border-y border-hairline py-3"
            >
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={tagHref(locale, tag)}
                      viewTransition
                      className="font-mono text-meta uppercase tracking-widest text-accent hover:text-fg"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <ul className="mt-16">
            {articles.map(({ slug, frontmatter }, index) => (
              <li key={slug} className="border-t border-hairline last:border-b">
                <article className="group relative grid gap-x-6 py-8 sm:grid-cols-[4rem_1fr]">
                  <span
                    aria-hidden
                    className="font-mono text-meta tabular-nums text-fg-subtle"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h2 className="text-2xl leading-tight text-balance sm:text-3xl">
                      <Link
                        to={documentHref("writing", locale, slug)}
                        viewTransition
                        className="after:absolute after:inset-0 group-hover:text-accent"
                      >
                        {frontmatter.title}
                      </Link>
                    </h2>

                    <p className="mt-4 max-w-prose text-fg-muted">
                      {frontmatter.answer}
                    </p>

                    {/* Data e etiquetas numa linha de rótulo só, no lugar das
                        pílulas: mesma informação, sem competir com o título. */}
                    <p className="mt-6 font-mono text-meta uppercase tracking-widest text-fg-subtle">
                      <time dateTime={frontmatter.published}>
                        {formatDate(locale, frontmatter.published)}
                      </time>
                      {frontmatter.tags.length > 0 &&
                        ` · ${frontmatter.tags.join(", ")}`}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
