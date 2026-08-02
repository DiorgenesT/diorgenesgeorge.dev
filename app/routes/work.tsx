import { Link } from "react-router";
import { AUTHOR } from "../config/site";
import { listCaseIndex } from "../content/index";
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
  const cases = listCaseIndex(locale);

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
        <ul className="mt-16 space-y-6">
          {cases.map(({ slug, frontmatter }, index) => (
            <li key={slug}>
              {/* group para o cartão inteiro reagir ao ponteiro, não só o título. */}
              <article className="group relative rounded-xl border border-hairline p-7 transition-colors hover:border-accent focus-within:border-accent sm:p-9">
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden
                    className="font-mono text-xs tabular-nums text-fg-subtle"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-balance">
                    <Link
                      to={documentHref("work", locale, slug)}
                      className="after:absolute after:inset-0 group-hover:text-accent"
                    >
                      {frontmatter.title}
                    </Link>
                  </h2>
                </div>

                <p className="mt-4 max-w-prose text-fg-muted">
                  {frontmatter.outcome}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {frontmatter.stack.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full border border-hairline px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-fg-subtle"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-fg-subtle">
                  {frontmatter.org} · {frontmatter.period}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
