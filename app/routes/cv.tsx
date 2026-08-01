import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/cv";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.cv.title"] }];
}

export default function Cv() {
  const t = getDictionary(useLocale());

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["nav.cv"]}
      </h1>
    </main>
  );
}
