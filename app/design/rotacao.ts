/**
 * O caos visual do zine e projetado, nao sorteado. Estas tabelas sao fixas e indexadas
 * pelo elemento, o que da tres garantias: o site parece feito a mao, se comporta igual
 * a cada render, e o HTML do servidor bate com o do cliente. Rotacao sorteada em render
 * quebraria a hidratacao, alem de fazer a pagina tremer a cada visita.
 */
export const ROTACOES = [
  -3, 2.5, -1.5, 4, -2.5, 1, 3.5, -4, 0.5, 2, -5, 5.5,
] as const;

export function obterRotacao(indice: number): number {
  const posicao = normalizar(indice, ROTACOES.length);
  const valor = ROTACOES[posicao];
  // O modulo acima ja garante a faixa; a guarda existe so para o verificador de tipos.
  if (valor === undefined) {
    throw new Error(`indice de rotacao fora da faixa: ${posicao}`);
  }
  return valor;
}

export type Jitter = { x: number; y: number };

/** Deslocamento em pixels, mesmo principio das rotacoes. */
export const JITTER: readonly Jitter[] = [
  { x: -2, y: 1 },
  { x: 3, y: -2 },
  { x: -1, y: 3 },
  { x: 2, y: 2 },
  { x: -3, y: -1 },
  { x: 1, y: -3 },
  { x: 4, y: 0 },
  { x: -4, y: 2 },
] as const;

export function obterJitter(indice: number): Jitter {
  const posicao = normalizar(indice, JITTER.length);
  const valor = JITTER[posicao];
  if (valor === undefined) {
    throw new Error(`indice de jitter fora da faixa: ${posicao}`);
  }
  return valor;
}

/** Modulo que trata indice negativo, que o operador `%` de JavaScript nao trata. */
function normalizar(indice: number, tamanho: number): number {
  return ((indice % tamanho) + tamanho) % tamanho;
}
