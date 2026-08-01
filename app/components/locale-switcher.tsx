import { useLocation, useNavigate } from "react-router";
import { LOCALES, LOCALE_LABELS, type Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { switchLocalePath } from "../i18n/switch-locale";
import { useLocale } from "../i18n/use-locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t["locale.label"]}</span>
      <select
        value={locale}
        onChange={(event) =>
          navigate(switchLocalePath(pathname, event.target.value as Locale))
        }
        className="rounded-md border border-hairline bg-bg px-2 py-1.5 font-mono text-xs text-fg-muted"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {LOCALE_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
