import { useLocation } from "react-router";
import { DEFAULT_LOCALE, SEGMENT_TO_LOCALE, type Locale } from "./config";

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1] ?? "";
  return SEGMENT_TO_LOCALE[segment] ?? DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  return localeFromPathname(useLocation().pathname);
}
