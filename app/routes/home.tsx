import { Link } from "react-router";
import { AnswerBlock } from "../components/answer-block";
import { ProofStrip } from "../components/proof-strip";
import { AUTHOR } from "../config/site";
import { listArticles } from "../content/registry";
import { documentHref, localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatDate } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/home";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.home.title"] }];
}

export default function Home() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const latest = listArticles(locale).slice(0, 3);

  const paths: { key: RouteKey; label: string; hint: string }[] = [
    { key: "cv", label: t["home.pathRecruiter"], hint: t["home.pathRecruiterHint"] },
    { key: "services", label: t["home.pathClient"], hint: t["home.pathClientHint"] },
    { key: "work", label: t["home.pathDev"], hint: t["home.pathDevHint"] },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="font-sans text-5xl font-bold tracking-tight text-balance sm:text-6xl">
        {AUTHOR.name}
      </h1>

      <p className="mt-6 max-w-2xl text-2xl leading-snug text-fg-muted text-balance">
        {t["home.taglineLead"]}{" "}
        <em className="font-serif italic text-fg">{t["home.taglineAccent"]}</em>
      </p>

      <AnswerBlock>{t["home.answer"]}</AnswerBlock>

      <ProofStrip locale={locale} />

      <section className="mt-20">
        <h2 className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
          {t["home.pathsHeading"]}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {paths.map(({ key, label, hint }) => (
            <li key={key}>
              <Link
                to={localizedHref(key, locale)}
                className="block h-full rounded-lg border border-hairline p-6 hover:border-accent"
              >
                <span className="block font-semibold">{label}</span>
                <span className="mt-2 block text-sm text-fg-muted">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {latest.length > 0 && (
        <section className="mt-20">
          <h2 className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
            {t["home.latestWriting"]}
          </h2>
          <ul className="mt-6 space-y-6">
            {latest.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <p className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
                  <time dateTime={frontmatter.published}>
                    {formatDate(locale, frontmatter.published)}
                  </time>
                </p>
                <Link
                  to={documentHref("writing", locale, slug)}
                  className="mt-1 block text-lg font-semibold hover:text-accent"
                >
                  {frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
