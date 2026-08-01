import { Link } from "react-router";
import { localizedHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/not-found";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [
    { title: t["meta.notFound.title"] },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFound() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-32">
      <p className="font-mono text-sm uppercase tracking-widest text-accent">404</p>
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["notFound.heading"]}
      </h1>
      <p className="max-w-prose text-fg-muted">{t["notFound.body"]}</p>
      <Link
        to={localizedHref("home", locale)}
        className="font-mono text-sm text-accent underline underline-offset-4"
      >
        {t["notFound.back"]}
      </Link>
    </main>
  );
}
