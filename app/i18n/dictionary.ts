import type { Locale } from "./config";
import { enUS } from "./messages/en-US";
import { ptBR } from "./messages/pt-BR";
import { ptPT } from "./messages/pt-PT";

export type Dictionary = {
  "nav.home": string;
  "nav.about": string;
  "nav.work": string;
  "nav.writing": string;
  "nav.services": string;
  "nav.cv": string;
  "nav.contact": string;
  "nav.colophon": string;
  "meta.about.title": string;
  "meta.cv.title": string;
  "meta.services.title": string;
  "meta.contact.title": string;
  "meta.work.title": string;
  "meta.writing.title": string;
  "a11y.skipToContent": string;
  "theme.toggle": string;
  "theme.dark": string;
  "theme.light": string;
  "locale.label": string;
  "footer.builtWith": string;
  "meta.home.title": string;
  "meta.colophon.title": string;
  "meta.notFound.title": string;
  "notFound.heading": string;
  "notFound.body": string;
  "notFound.back": string;
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "en-US": enUS,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
