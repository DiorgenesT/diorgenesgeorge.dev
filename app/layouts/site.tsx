import { Link, Outlet } from "react-router";
import { LocaleSwitcher } from "../components/locale-switcher";
import { ThemeToggle } from "../components/theme-toggle";
import { localizedHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export default function SiteLayout() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t["a11y.skipToContent"]}
      </a>

      <header className="border-b border-hairline">
        <nav
          aria-label={t["nav.home"]}
          className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4"
        >
          <Link
            to={localizedHref("home", locale)}
            className="font-mono text-sm font-semibold tracking-widest text-accent"
          >
            DG
          </Link>
          <Link
            to={localizedHref("colophon", locale)}
            className="text-sm text-fg-muted hover:text-fg"
          >
            {t["nav.colophon"]}
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <div id="conteudo" className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-8 font-mono text-xs uppercase tracking-widest text-fg-subtle">
          {t["footer.builtWith"]}
        </div>
      </footer>
    </div>
  );
}
