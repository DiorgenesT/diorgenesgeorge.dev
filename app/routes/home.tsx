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

  const paths: { key: RouteKey; label: string; hint: string }[] = [
    {
      key: "cv",
      label: t["home.pathRecruiter"],
      hint: t["home.pathRecruiterHint"],
    },
    {
      key: "services",
      label: t["home.pathClient"],
      hint: t["home.pathClientHint"],
    },
    { key: "work", label: t["home.pathDev"], hint: t["home.pathDevHint"] },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <JsonLd data={personJsonLd(locale)} />
      <JsonLd data={webSiteJsonLd(locale, localizedHref("home", locale))} />

      <Hero />

      <Reveal>
        <ProofStrip locale={locale} />
      </Reveal>

      {/* Sem rótulo em maiúscula aqui: a seção se explica sozinha, e o teto saudável
          é um rótulo a cada três seções. Assimétrico de propósito — o caminho do
          recrutador é o objetivo número um do site, e ocupa o dobro do espaço. */}
      <Reveal>
        <section className="mt-24">
          <h2 className="sr-only">{t["home.pathsHeading"]}</h2>

          <ul className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
            {paths.map(({ key, label, hint }, index) => (
              <li key={key} className={index === 0 ? "md:row-span-2" : ""}>
                <Link
                  to={localizedHref(key, locale)}
                  className={`group flex h-full flex-col rounded-xl border border-hairline transition-colors hover:border-accent ${
                    index === 0 ? "p-8 sm:p-10" : "p-6 sm:p-7"
                  }`}
                >
                  <span
                    className={`font-semibold tracking-tight group-hover:text-accent ${
                      index === 0 ? "text-3xl sm:text-4xl" : "text-lg"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-fg-muted ${
                      index === 0 ? "mt-4 max-w-sm text-base" : "mt-3 text-sm"
                    }`}
                  >
                    {hint}
                  </span>

                  {/* Empurra a seta para o rodapé do cartão: o espaço que sobra vira
                      direção, em vez de buraco entre título e descrição. */}
                  <span
                    aria-hidden
                    className="mt-auto pt-8 font-mono text-sm text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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
