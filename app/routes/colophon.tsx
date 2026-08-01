import { DocumentHeader } from "../components/document-header";
import { Prose } from "../components/prose";
import { getPage } from "../content/registry";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/colophon";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.colophon.title"] }];
}

export default function Colophon() {
  const locale = useLocale();
  const page = getPage(locale, "colophon");
  if (!page) throw new Error(`colofão ausente no idioma ${locale}`);

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
