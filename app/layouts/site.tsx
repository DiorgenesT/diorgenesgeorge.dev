import { Link, Outlet, useLocation } from "react-router";
import { LocaleSwitcher } from "../components/locale-switcher";
import { listArticleIndex, listCaseIndex } from "../content/index";
import { localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export default function SiteLayout() {
  const locale = useLocale();
  const t = getDictionary(locale);

  /*
    Na capa o sumário do hero já é o índice da publicação, então repetir os mesmos
    links no cabeçalho seria dizer a mesma coisa duas vezes na mesma tela. Nas outras
    oito rotas o cabeçalho é a única navegação que existe, e por isso ele não some.
  */
  const naCapa = useLocation().pathname === localizedHref("home", locale);

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

      {/* Marca d'agua: decoracao pura, entao sai da arvore de acessibilidade. O nome
          de quem e a pagina esta no h1, nunca aqui. */}
      <span aria-hidden="true" className="marca-dagua">
        DG
      </span>

      {/*
        O z-2 aqui, no conteudo e no rodape existe porque a granulacao aplica um ::after
        com z-index 1 sobre a pagina inteira: sem isto os links ficariam abaixo do veu e
        deixariam de receber clique.
      */}
      {/* A marca do cabeçalho é quieta de propósito: o gesto assinatura vive na
          capa, e repeti-lo em toda página o gastaria. */}
      <header className="relative z-2 border-b border-hairline">
        <nav
          aria-label={t["nav.home"]}
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5"
        >
          <Link
            to={localizedHref("home", locale)}
            viewTransition
            className="font-display text-2xl leading-none tracking-tight hover:text-accent"
          >
            DG
          </Link>

          {!naCapa &&
            links.map(({ key, label }) => (
              <Link
                key={key}
                to={localizedHref(key, locale)}
                viewTransition
                className="font-mono text-meta uppercase tracking-widest text-fg-muted hover:text-accent"
              >
                {label}
              </Link>
            ))}

          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </nav>
      </header>

      <div id="conteudo" className="relative z-2 flex-1">
        <Outlet />
      </div>

      <footer className="relative z-2 border-t border-hairline">
        {/* Sem `font-mono` aqui: o rodape e chrome do site, nao metadado tecnico.
            A monoespacada fica reservada ao que e leitura de maquina (numeracao do
            sumario, cabecalho de edicao, endereco), e o resto usa a pilha do sistema
            em caixa alta com entreletra larga, que da o mesmo ar editorial sem o eco
            de datilografia. */}
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 text-meta uppercase tracking-widest text-fg-subtle">
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
