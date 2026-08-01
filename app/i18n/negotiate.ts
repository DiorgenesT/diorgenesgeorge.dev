import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

type Preference = { tag: string; quality: number };

/** Português genérico resolve para o Brasil, que concentra a maioria dos falantes. */
const BASE_LANGUAGE_FALLBACK: Record<string, Locale> = {
  pt: "pt-BR",
  en: "en-US",
};

function parseAcceptLanguage(header: string): Preference[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: (tag ?? "").trim().toLowerCase(), quality };
    })
    .filter((p) => p.tag !== "" && p.tag !== "*" && Number.isFinite(p.quality))
    .sort((a, b) => b.quality - a.quality);
}

export function negotiateLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  for (const { tag } of parseAcceptLanguage(header)) {
    const exact = LOCALES.find((locale) => locale.toLowerCase() === tag);
    if (exact) return exact;

    const base = tag.split("-")[0] ?? "";
    const fallback = BASE_LANGUAGE_FALLBACK[base];
    if (fallback) return fallback;
  }

  return DEFAULT_LOCALE;
}
