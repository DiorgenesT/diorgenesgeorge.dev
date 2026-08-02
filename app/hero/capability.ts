export type Environment = {
  reducedMotion: boolean;
};

/**
 * Uma decisao so. Movimento reduzido e preferencia declarada e vale para tudo.
 * A deteccao de WebGL e de aparelho fraco saiu com a cena 3D: o que restou de
 * movimento e transform e opacity, que nao pesam o bastante para justificar um portao.
 */
export function decide(env: Environment): { motion: boolean } {
  return { motion: !env.reducedMotion };
}

export function readEnvironment(): Environment {
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };
}
