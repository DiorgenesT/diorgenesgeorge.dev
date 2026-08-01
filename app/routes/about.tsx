import { DocumentHeader } from "../components/document-header";
import { JsonLd } from "../components/json-ld";
import { Prose } from "../components/prose";
import { getPage } from "../content/registry";
import { useLocale } from "../i18n/use-locale";
import { localizedHref } from "../i18n/config";
import { profilePageJsonLd } from "../seo/jsonld";
import { prosePageMeta } from "../seo/route-meta";
import type { Route } from "./+types/about";

export function meta({ location }: Route.MetaArgs) {
  return prosePageMeta(location.pathname, "about", "about");
}

export default function About() {
  const locale = useLocale();
  const page = getPage(locale, "about");
  if (!page) throw new Error(`página sobre ausente no idioma ${locale}`);

  const { Content, frontmatter } = page;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd data={profilePageJsonLd(locale, localizedHref("about", locale))} />
      <DocumentHeader title={frontmatter.title} answer={frontmatter.answer} />
      <Prose>
        <Content />
      </Prose>
    </main>
  );
}
