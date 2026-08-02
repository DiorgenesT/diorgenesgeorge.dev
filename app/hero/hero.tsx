import { Link } from "react-router";
import { AUTHOR } from "../config/site";
import {
  cargaDeLatencia,
  DURACAO_DA_RECEPCAO_MS,
} from "../design/desregistro";
import { localizedHref, type RouteKey } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { Monograma } from "./monograma";
import { useEdgeTelemetry } from "./telemetry";
import { useEnvironment } from "./use-environment";

/** Latência de repouso enquanto o edge não respondeu. */
const CARGA_EM_REPOUSO = 0.34;

export function Hero({
  sumario,
}: {
  sumario: { key: RouteKey; label: string }[];
}) {
  const locale = useLocale();
  const t = getDictionary(locale);

  // env é null no servidor e na primeira pintura do cliente: é o que faz os dois
  // concordarem antes de qualquer decisão que dependa do browser.
  const env = useEnvironment();

  /*
    A telemetria continua sendo medida, mas nada dela é exibido: o único uso é a
    latência, que decide o quanto a marca chega fora de registro. É menos dado na
    tela do que o painel antigo mostrava, e menos dado usado do que ele usava.
  */
  const telemetry = useEdgeTelemetry(env !== null);
  const chegou = telemetry.status === "ready";

  const carga = chegou ? cargaDeLatencia(telemetry.rttMs) : CARGA_EM_REPOUSO;

  return (
    <section className="grid gap-x-10 gap-y-10 lg:grid-cols-[1.75fr_0.85fr] lg:items-center">
      {/* A marca é decoração: o nome de verdade é o h1 ao lado. */}
      <Monograma
        carga={carga}
        recebendo={chegou}
        duracao={DURACAO_DA_RECEPCAO_MS}
      />

      <div className="lg:text-end">
        <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
          {AUTHOR.name}
        </h1>
        <p className="mt-2 font-mono text-meta uppercase tracking-widest text-fg-subtle">
          {t["home.masthead"]}
        </p>

        {/* O sumário é o índice da publicação, e é também a navegação primária da
            home: por isso o cabeçalho esconde os links dele aqui, em vez de dizer
            a mesma coisa duas vezes na mesma tela. */}
        <nav aria-label={t["home.pathsHeading"]} className="mt-8">
          <ul>
            {sumario.map(({ key, label }, indice) => (
              <li key={key} className="border-t border-hairline last:border-b">
                <Link
                  to={localizedHref(key, locale)}
                  viewTransition
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-3 py-3 text-start"
                >
                  <span className="font-mono text-meta tracking-widest text-fg-subtle group-hover:text-accent">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-medium tracking-tight transition-transform group-hover:translate-x-2 group-hover:text-accent">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
