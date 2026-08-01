import { AUTHOR, whatsappHref } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/contact";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.contact.title"] }];
}

export default function Contact() {
  const t = getDictionary(useLocale());

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["contact.heading"]}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg-muted">
        {t["contact.intro"]}
      </p>

      <a
        href={whatsappHref(t["contact.whatsappGreeting"])}
        className="mt-10 inline-block rounded-md bg-accent px-6 py-3 font-semibold text-accent-fg"
      >
        {t["contact.whatsapp"]}
      </a>

      <ul className="mt-12 space-y-3 font-mono text-sm">
        <li>
          <a
            href={AUTHOR.linkedin}
            rel="me noopener"
            target="_blank"
            className="text-accent underline underline-offset-4"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            href={AUTHOR.github}
            rel="me noopener"
            target="_blank"
            className="text-accent underline underline-offset-4"
          >
            GitHub
          </a>
        </li>
      </ul>
    </main>
  );
}
