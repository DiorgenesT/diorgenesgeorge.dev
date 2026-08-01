import { Link } from "react-router";
import { AUTHOR } from "../config/site";
import { listCases } from "../content/registry";
import { documentHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { staticPageMeta } from "../seo/route-meta";
import type { Route } from "./+types/work";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return staticPageMeta(
    location.pathname,
    "work",
    t["meta.work.title"],
    t["meta.work.description"],
  );
}

export default function Work() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const cases = listCases(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["nav.work"]}
      </h1>

      {cases.length === 0 ? (
        <p className="mt-8 max-w-prose text-lg leading-relaxed text-fg-muted">
          {t["work.empty"]}{" "}
          <a
            href={AUTHOR.github}
            rel="me noopener"
            target="_blank"
            className="text-accent underline underline-offset-4"
          >
            GitHub
          </a>
        </p>
      ) : (
        <ul className="mt-16 space-y-14">
          {cases.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <article>
                <h2 className="text-2xl font-semibold tracking-tight">
                  <Link
                    to={documentHref("work", locale, slug)}
                    className="hover:text-accent"
                  >
                    {frontmatter.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-prose text-fg-muted">
                  {frontmatter.outcome}
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-fg-subtle">
                  {frontmatter.stack.join(" · ")}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
