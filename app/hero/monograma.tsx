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
 * **Reimprimir é responsabilidade de quem chama, e se faz trocando a `key`.** O
 * componente não guarda estado nem roda efeito: a animação começa na montagem, e
 * remontar é o jeito mais barato e mais direto de reiniciar animação de CSS.
 *
 * A tentativa anterior usava um booleano `recebendo` e falhava: assim que ele ficava
 * verdadeiro na chegada do edge, a classe nunca mais saía, e animação de CSS só
 * reinicia quando a classe é removida e readicionada. Era por isso que o repique do
 * sumário não acontecia depois da primeira impressão.
 */
export function Monograma({
  carga,
  duracao,
}: {
  carga: number;
  duracao: number;
}) {
  return (
    <span
      aria-hidden="true"
      data-monograma
      className="monograma monograma-recebendo"
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
