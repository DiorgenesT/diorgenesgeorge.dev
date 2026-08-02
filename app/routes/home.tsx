import { JsonLd } from "../components/json-ld";
import { Hero } from "../hero/hero";
import { localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
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

/**
 * A capa e uma pagina so, e nao a primeira de uma rolagem.
 *
 * A faixa de prova e a lista de escritos recentes viviam aqui embaixo e sairam em
 * 2026-08-02: capa de publicacao nao tem conteudo de miolo, e quem quer entrar tem o
 * sumario. Os numeros de prova continuam existindo no frontmatter dos cases e o
 * componente que os desenha continua no repositorio, aguardando o lugar certo.
 */
export default function Home() {
  const locale = useLocale();
  const t = getDictionary(locale);

  const sumario: { key: RouteKey; label: string }[] = [
    { key: "about", label: t["nav.about"] },
    { key: "work", label: t["nav.work"] },
    { key: "writing", label: t["nav.writing"] },
    { key: "cv", label: t["nav.cv"] },
    { key: "services", label: t["nav.services"] },
    { key: "contact", label: t["nav.contact"] },
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-13rem)] max-w-4xl items-center px-6 py-16">
      <JsonLd data={personJsonLd(locale)} />
      <JsonLd data={webSiteJsonLd(locale, localizedHref("home", locale))} />

      <div className="w-full">
        <Hero sumario={sumario} />
      </div>
    </main>
  );
}
