import { Link, Outlet } from "react-router";
import { LocaleSwitcher } from "../components/locale-switcher";
import { NotaDeResgate } from "../components/nota-de-resgate";
import { PapelRasgado } from "../components/papel-rasgado";
import { listArticleIndex, listCaseIndex } from "../content/index";
import { obterRotacao } from "../design/rotacao";
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
    <div className="textura-granulada flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-fg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t["a11y.skipToContent"]}
      </a>

      {/*
        O z-2 aqui, no conteudo e no rodape existe porque a granulacao aplica um ::after
        com z-index 1 sobre a pagina inteira: sem isto os links ficariam abaixo do veu e
        deixariam de receber clique.
      */}
      <header className="relative z-2 border-b-2 border-fg">
        <nav
          aria-label={t["nav.home"]}
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5"
        >
          <Link to={localizedHref("home", locale)} viewTransition>
            <NotaDeResgate texto="DG" />
          </Link>

          {links.map(({ key, label }, indice) => (
            <Link
              key={key}
              to={localizedHref(key, locale)}
              viewTransition
              className="font-mono text-meta uppercase tracking-widest text-fg-muted hover:text-accent"
              style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
            >
              {label}
            </Link>
          ))}

          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </nav>
        <PapelRasgado className="h-3 w-full text-bg" />
      </header>

      <div id="conteudo" className="relative z-2 flex-1">
        <Outlet />
      </div>

      <footer className="relative z-2 border-t-2 border-fg">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 font-mono text-meta text-fg-subtle">
          <span>{t["footer.builtWith"]}</span>
          <Link
            to={localizedHref("colophon", locale)}
            viewTransition
            className="ms-auto hover:text-accent"
          >
            {t["nav.colophon"]}
          </Link>
        </div>
      </footer>
    </div>
  );
}
