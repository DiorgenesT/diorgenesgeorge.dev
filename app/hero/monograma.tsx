import type { CSSProperties } from "react";
import { FATIAS } from "../design/desregistro";

type VarsDaFatia = CSSProperties & {
  "--direcao": number;
  "--atraso": string;
};

/**
 * As duas camadas são absolutas sobre a mesma caixa, e quem define essa caixa é o
 * elemento de medida, invisível, em fluxo. Foi a falta disso que fazia a chapa preta
 * e a vermelha partirem de origens diferentes: uma seguia o fluxo do texto e a outra
 * o retângulo da letra, e o desencontro vertical não vinha do deslocamento desenhado,
 * vinha da caixa.
 */
function Letra({ children }: { children: string }) {
  const fatias = FATIAS.map((fatia, indice) => (
    <span
      key={indice}
      className="monograma-fatia"
      style={
        {
          clipPath: fatia.corte,
          "--direcao": fatia.direcao,
          "--atraso": `${fatia.atraso}ms`,
        } as VarsDaFatia
      }
    >
      {children}
    </span>
  ));

  return (
    <span className="monograma-letra">
      <span className="monograma-camada monograma-eco">{fatias}</span>
      <span className="monograma-camada monograma-tinta">{fatias}</span>
      <span className="monograma-medida">{children}</span>
    </span>
  );
}

/**
 * O monograma é decoração: o nome de verdade é o `h1` ao lado. Daí o `aria-hidden`,
 * sem o qual um leitor de tela leria "D G" solto antes do título da página.
 *
 * `carga` vem da latência medida pelo edge e comanda a intensidade do desregistro.
 * `recebendo` dispara a chegada uma única vez, quando o dado responde.
 */
export function Monograma({
  carga,
  recebendo,
  duracao,
}: {
  carga: number;
  recebendo: boolean;
  duracao: number;
}) {
  return (
    <span
      aria-hidden="true"
      data-monograma
      className={`monograma${recebendo ? " monograma-recebendo" : ""}`}
      style={
        {
          "--carga": carga,
          "--duracao": `${duracao}ms`,
        } as CSSProperties & { "--carga": number; "--duracao": string }
      }
    >
      <Letra>D</Letra>
      <Letra>G</Letra>
    </span>
  );
}
