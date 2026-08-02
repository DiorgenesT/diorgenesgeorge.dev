/**
 * O desregistro de impressão do monograma, em tabela fixa.
 *
 * Mesma regra de identidade das rotações: nada de sorteio em render. Além do site
 * tremer a cada visita, valor aleatório produziria HTML diferente no servidor e no
 * cliente e quebraria a hidratação.
 */
export type Fatia = {
  /** `clip-path: inset(...)` que recorta a faixa horizontal desta fatia. */
  readonly corte: string;
  /** Sentido e força do escorregão, multiplicado pela carga. */
  readonly direcao: number;
  /** Atraso em milissegundos, para as fatias nunca chegarem juntas. */
  readonly atraso: number;
};

export const FATIAS: readonly Fatia[] = [
  { corte: "inset(0 0 84% 0)", direcao: -1, atraso: 0 },
  { corte: "inset(16% 0 68% 0)", direcao: 0.62, atraso: 40 },
  { corte: "inset(32% 0 52% 0)", direcao: -1.4, atraso: 18 },
  { corte: "inset(48% 0 36% 0)", direcao: 0.44, atraso: 76 },
  { corte: "inset(64% 0 20% 0)", direcao: -0.7, atraso: 52 },
  { corte: "inset(80% 0 0 0)", direcao: 1.1, atraso: 96 },
] as const;

const RTT_LIMPO = 10;
const RTT_RUIM = 610;

/**
 * Piso da corrupção. Alto de propósito: em rede local o RTT é de um a três
 * milissegundos, e com um piso baixo a marca chegava praticamente limpa, o que na
 * prática apagava o gesto para quem está perto do datacenter. O piso garante que
 * toda visita veja a impressão acontecer, e a latência decide o quanto além disso.
 */
const CARGA_MINIMA = 0.34;

/**
 * Traduz latência em corrupção. É o que faz o glitch significar alguma coisa: a marca
 * não tem um efeito, ela está chegando, e a conexão de quem visita decide como.
 *
 * O piso existe porque registro perfeito não é impressão: mesmo na melhor conexão a
 * chapa fica levemente fora, que é a marca de o objeto ter sido impresso de verdade.
 */
export function cargaDeLatencia(rttMs: number): number {
  const bruta = (rttMs - RTT_LIMPO) / (RTT_RUIM - RTT_LIMPO);
  return Math.min(1, Math.max(CARGA_MINIMA, bruta));
}

/**
 * Duração fixa da recepção. Quem varia com a latência é a intensidade da corrupção,
 * não o tempo: ligar as duas coisas fazia uma conexão ruim castigar duas vezes, com
 * uma marca mais quebrada e uma espera mais longa antes de a página assentar.
 */
export const DURACAO_DA_RECEPCAO_MS = 900;
