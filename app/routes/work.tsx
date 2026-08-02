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
      <h1 className="text-4xl leading-tight sm:text-5xl">{t["nav.work"]}</h1>

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
        <ul className="mt-16">
          {cases.map(({ slug, frontmatter }, index) => (
            <li key={slug} className="border-t border-hairline last:border-b">
              {/* group para a linha inteira reagir ao ponteiro, não só o título. */}
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
                      to={documentHref("work", locale, slug)}
                      viewTransition
                      className="after:absolute after:inset-0 group-hover:text-accent"
                    >
                      {frontmatter.title}
                    </Link>
                  </h2>

                  <p className="mt-4 max-w-prose text-fg-muted">
                    {frontmatter.outcome}
                  </p>

                  {/* A pilha vira uma linha de rótulo junto da procedência: mesma
                      informação, sem uma dúzia de pílulas competindo com o título. */}
                  <p className="mt-6 font-mono text-meta uppercase tracking-widest text-fg-subtle">
                    {frontmatter.org} · {frontmatter.period} ·{" "}
                    {frontmatter.stack.join(", ")}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
