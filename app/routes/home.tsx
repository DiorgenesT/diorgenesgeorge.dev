import { Link } from "react-router";
import { JsonLd } from "../components/json-ld";
import { Hero } from "../hero/hero";
import { Reveal } from "../motion/reveal";
import { ProofStrip } from "../components/proof-strip";
import { listArticleIndex } from "../content/index";
import { documentHref, localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatDate } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { personJsonLd, webSiteJsonLd } from "../seo/jsonld";
import { staticPageMeta } from "../seo/route-meta";
import type { Route } from "./+types/home";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return staticPageMeta(
    location.pathname,
    "home",
    t["meta.home.title"],
    t["home.answer"],
  );
}

export default function Home() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const latest = listArticleIndex(locale).slice(0, 3);

  /*
    O sumário da capa é o índice da publicação, e substitui os três cartões de
    caminho que viviam mais abaixo: eles diziam a mesma coisa duas vezes, e
    remover a repetição é o que deixa a capa com quatro elementos em vez de oito.
  */
  const sumario: { key: RouteKey; label: string }[] = [
    { key: "about", label: t["nav.about"] },
    { key: "work", label: t["nav.work"] },
    { key: "writing", label: t["nav.writing"] },
    { key: "cv", label: t["nav.cv"] },
    { key: "services", label: t["nav.services"] },
    { key: "contact", label: t["nav.contact"] },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <JsonLd data={personJsonLd(locale)} />
      <JsonLd data={webSiteJsonLd(locale, localizedHref("home", locale))} />

      <Hero sumario={sumario} />

      <Reveal>
        <ProofStrip locale={locale} />
      </Reveal>

      {latest.length > 0 && (
        <Reveal>
          <section className="mt-20">
            <h2 className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
              {t["home.latestWriting"]}
            </h2>
            <ul className="mt-6 space-y-6">
              {latest.map(({ slug, frontmatter }) => (
                <li key={slug}>
                  <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
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
        </Reveal>
      )}
    </main>
  );
}
