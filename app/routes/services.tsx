import { DocumentHeader } from "../components/document-header";
import { JsonLd } from "../components/json-ld";
import { Prose } from "../components/prose";
import { getPage } from "../content/registry";
import { useLocale } from "../i18n/use-locale";
import { localizedHref } from "../i18n/config";
import { serviceJsonLd } from "../seo/jsonld";
import { prosePageMeta } from "../seo/route-meta";
import type { Route } from "./+types/services";

export function meta({ location }: Route.MetaArgs) {
  return prosePageMeta(location.pathname, "services", "services");
}

export default function Services() {
  const locale = useLocale();
  const page = getPage(locale, "services");
  if (!page) throw new Error(`página de serviços ausente no idioma ${locale}`);

  const { Content, frontmatter } = page;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd
        data={serviceJsonLd(
          locale,
          localizedHref("services", locale),
          frontmatter.answer,
        )}
      />
      <DocumentHeader title={frontmatter.title} answer={frontmatter.answer} />
      <Prose>
        <Content />
      </Prose>
    </main>
  );
}
