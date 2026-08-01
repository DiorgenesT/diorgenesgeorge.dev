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
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {frontmatter.title}
      </h1>
      <Content />
    </main>
  );
}
