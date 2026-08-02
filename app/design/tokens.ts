/**
 * A paleta: papel, tinta e uma unica cor de acento. Um tema so.
 *
 * O papel escureceu em 2026-08-02. A queixa era "esta tudo muito branco", e a resposta
 * passou por cinco tentativas de decoracao de fundo antes de alguem tentar a coisa
 * obvia: mudar a cor da folha. Nenhuma forma, nenhuma trama, nenhum movimento.
 *
 * Escurecer o papel obriga a escurecer o acento junto. Com o vermelho anterior
 * (#c81d25) o par acento sobre papel caia para 4,29:1 e reprovava; o vermelho mais
 * fundo devolve 5,35:1, que e mais folga do que a paleta clara tinha (4,92).
 *
 * Cada valor entrou depois de medido, nao antes. O teste ao lado e a autoridade sobre
 * estes numeros.
 */
export const TOKENS: Record<string, string> = {
  bg: "#e2d9c6",
  "bg-raised": "#ece5d6",
  fg: "#0a0a0a",
  "fg-muted": "#4e463d",
  "fg-subtle": "#5b5248",
  accent: "#a8161d",
  "accent-fg": "#ffffff",
};
