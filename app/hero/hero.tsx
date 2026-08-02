import { useCallback, useState } from "react";
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

/** O repique do sumário é mais leve e mais curto que a chegada: é um eco, não o gesto. */
const CARGA_DO_REPIQUE = 0.22;
const DURACAO_DO_REPIQUE_MS = 420;


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
  const pronto = telemetry.status === "ready";

  /*
    Quando a marca reimprime, tudo derivado, sem um unico efeito.

    `origem` muda em duas situacoes: troca de idioma e chegada da telemetria. O repique
    do sumario e a terceira, e essa vem de evento, entao vive em estado.

    O repique guarda sobre qual `origem` ele aconteceu. Se ainda for a mesma, a ultima
    coisa que houve foi o hover, e a impressao sai leve; se `origem` mudou depois, quem
    manda e a chegada, e a impressao sai cheia. E o que permite as tres situacoes
    compartilharem o mesmo mecanismo sem nenhum `useEffect`.
  */
  const origem = `${locale}|${pronto ? telemetry.rttMs : "espera"}`;
  const [repique, setRepique] = useState({ n: 0, sobre: origem });
  const repicar = useCallback(
    () => setRepique((anterior) => ({ n: anterior.n + 1, sobre: origem })),
    [origem],
  );

  const ehRepique = repique.n > 0 && repique.sobre === origem;

  const carga = ehRepique
    ? CARGA_DO_REPIQUE
    : pronto
      ? cargaDeLatencia(telemetry.rttMs)
      : CARGA_EM_REPOUSO;

  const duracao = ehRepique
    ? DURACAO_DO_REPIQUE_MS
    : DURACAO_DA_RECEPCAO_MS;

  return (
    /*
      minmax(0, ...) nas duas colunas: sem isso o conteudo da primeira pode forcar a
      largura dela e espremer a segunda, que foi o que aconteceu quando a display
      trocou por uma familia mais larga.
    */
    <section className="relative grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:items-center">
      {/* A marca é decoração: o nome de verdade é o h1 ao lado. */}
      {/* A `key` e o gatilho: trocar de key remonta o monograma, e remontar reinicia a
          animacao de CSS. E o jeito mais barato de reimprimir, e dispensa estado e
          efeito dentro do componente. */}
      <Monograma
        key={`${origem}|${repique.n}`}
        carga={carga}
        duracao={duracao}
      />

      <div className="relative z-2 lg:text-end">
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
                  onPointerEnter={repicar}
                  onFocus={repicar}
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

        {/* O endereco fecha o bloco como o pe de uma pagina impressa: e o unico
            lugar do site onde o dominio aparece escrito por extenso. */}
        <p className="mt-6 font-mono text-meta uppercase tracking-widest text-fg-subtle">
          diorgenesgeorge.dev
        </p>
      </div>
    </section>
  );
}
