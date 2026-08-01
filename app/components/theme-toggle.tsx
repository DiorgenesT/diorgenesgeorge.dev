import { useSyncExternalStore } from "react";
import {
  applyTheme,
  getServerTheme,
  getTheme,
  subscribeToTheme,
} from "../design/theme";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export function ThemeToggle() {
  const t = getDictionary(useLocale());
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getServerTheme,
  );

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={t["theme.toggle"]}
      aria-pressed={theme === "light"}
      className="rounded-md border border-hairline px-3 py-1.5 font-mono text-xs text-fg-muted hover:text-fg"
    >
      {theme === "dark" ? t["theme.light"] : t["theme.dark"]}
    </button>
  );
}
