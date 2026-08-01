import type { Locale } from "./config";

/** Datas chegam como AAAA-MM-DD e são formatadas em UTC: sem fuso, sem virar o dia. */
export function formatDate(locale: Locale, value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year as number, (month as number) - 1, day as number));
}

/** Períodos de currículo chegam como AAAA-MM. A duração nunca é armazenada, só as datas. */
export function formatMonth(locale: Locale, value: string): string {
  const [year, month] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year as number, (month as number) - 1, 1));
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}
