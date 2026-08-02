import { AUTHOR, whatsappHref } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { staticPageMeta } from "../seo/route-meta";
import type { Route } from "./+types/contact";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return staticPageMeta(
    location.pathname,
    "contact",
    t["meta.contact.title"],
    t["meta.contact.description"],
  );
}

export default function Contact() {
  const t = getDictionary(useLocale());

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl leading-tight sm:text-5xl">
        {t["contact.heading"]}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg-muted">
        {t["contact.intro"]}
      </p>

      {/* Bloco reto de acento: a única vez que a cor preenche uma área na página. */}
      <a
        href={whatsappHref(t["contact.whatsappGreeting"])}
        className="mt-10 inline-block bg-accent px-7 py-4 font-semibold text-accent-fg hover:bg-fg"
      >
        {t["contact.whatsapp"]}
      </a>

      {/* Linhas separadas por fio, no mesmo padrão do sumário da capa. */}
      <ul className="mt-14">
        {[
          { nome: "LinkedIn", href: AUTHOR.linkedin },
          { nome: "GitHub", href: AUTHOR.github },
        ].map(({ nome, href }) => (
          <li key={nome} className="border-t border-hairline last:border-b">
            <a
              href={href}
              rel="me noopener"
              target="_blank"
              className="group flex items-baseline justify-between py-4 hover:text-accent"
            >
              <span className="text-lg font-medium">{nome}</span>
              <span
                aria-hidden
                className="font-mono text-meta text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
              >
                &rarr;
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
