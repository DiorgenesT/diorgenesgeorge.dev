import { DocumentHeader } from "../components/document-header";
import { Prose } from "../components/prose";
import { getPage } from "../content/registry";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/services";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.services.title"] }];
}

export default function Services() {
  const locale = useLocale();
  const page = getPage(locale, "services");
  if (!page) throw new Error(`página de serviços ausente no idioma ${locale}`);

  const { Content, frontmatter } = page;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <DocumentHeader title={frontmatter.title} answer={frontmatter.answer} />
      <Prose>
        <Content />
      </Prose>
    </main>
  );
}
