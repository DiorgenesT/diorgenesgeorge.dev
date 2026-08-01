import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname } from "../i18n/use-locale";
import type { Route } from "./+types/home";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.home.title"] }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-5xl font-bold tracking-tight">
        Diorgenes George
      </h1>
    </main>
  );
}
