import { Link, useLocation } from "react-router";
import { LOCALES, LOCALE_LABELS } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { switchLocalePath } from "../i18n/switch-locale";
import { useLocale } from "../i18n/use-locale";
import { Bandeira } from "./bandeira";

/**
 * Tres links lado a lado, e nao um `select`. O menu suspenso escondia duas das tres
 * opcoes atras de um clique, e num site de tres idiomas isso e esconder um terco da
 * oferta para economizar quarenta pixels.
 *
 * Sao `Link`, e nao `button` com navegacao por script: o caminho de cada idioma existe
 * de verdade, entao ele deve ser um endereco que o visitante pode abrir em outra aba e
 * que o buscador pode seguir.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const { pathname } = useLocation();

  return (
    <nav aria-label={t["locale.label"]}>
      <ul className="flex items-center gap-2">
        {LOCALES.map((opcao) => {
          const atual = opcao === locale;

          return (
            <li key={opcao}>
              <Link
                to={switchLocalePath(pathname, opcao)}
                viewTransition
                hrefLang={opcao}
                aria-current={atual ? "true" : undefined}
                title={LOCALE_LABELS[opcao]}
                className={`block transition-opacity hover:opacity-100 ${
                  atual ? "opacity-100" : "opacity-45"
                }`}
              >
                {/* O nome acessivel vem daqui, e nao da bandeira: uma bandeira
                    representa um pais, nunca um idioma, e leitor de tela nao le SVG. */}
                <span className="sr-only">{LOCALE_LABELS[opcao]}</span>
                <Bandeira locale={opcao} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
