import { Link, Outlet } from "react-router";
import { LocaleSwitcher } from "../components/locale-switcher";
import { listArticleIndex, listCaseIndex } from "../content/index";
import { localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export default function SiteLayout() {
  const locale = useLocale();
  const t = getDictionary(locale);

  // Um índice vazio não entra no menu: link que leva a lugar nenhum é pior que menu curto.
  const links: { key: RouteKey; label: string }[] = [
    { key: "about", label: t["nav.about"] },
    ...(listCaseIndex(locale).length > 0
      ? [{ key: "work" as const, label: t["nav.work"] }]
      : []),
    ...(listArticleIndex(locale).length > 0
      ? [{ key: "writing" as const, label: t["nav.writing"] }]
      : []),
    { key: "services", label: t["nav.services"] },
    { key: "cv", label: t["nav.cv"] },
    { key: "contact", label: t["nav.contact"] },
  ];

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
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4"
        >
          <Link
            to={localizedHref("home", locale)}
            viewTransition
            className="font-mono text-sm font-semibold tracking-widest text-accent"
          >
            DG
          </Link>

          {links.map(({ key, label }) => (
            <Link
              key={key}
              to={localizedHref(key, locale)}
              viewTransition
              className="text-sm text-fg-muted hover:text-fg"
            >
              {label}
            </Link>
          ))}

          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </nav>
      </header>

      <div id="conteudo" className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 font-mono text-xs uppercase tracking-widest text-fg-subtle">
          <span>{t["footer.builtWith"]}</span>
          <Link
            to={localizedHref("colophon", locale)}
            viewTransition
            className="ms-auto hover:text-fg"
          >
            {t["nav.colophon"]}
          </Link>
        </div>
      </footer>
    </div>
  );
}
