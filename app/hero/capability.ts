export type Environment = {
  reducedMotion: boolean;
  webgl: boolean;
  memoryGb?: number;
  cores?: number;
};

const MIN_MEMORY_GB = 4;
const MIN_CORES = 4;

/**
 * Dois sinais independentes. Movimento reduzido é preferência declarada e vale para
 * tudo. Aparelho fraco desliga só a cena: transição de rota é barata e não incomoda.
 * Navegador que não informa memória ou núcleos não é penalizado — ausência de dado
 * não é evidência de fraqueza.
 */
export function decide(env: Environment): { scene: boolean; motion: boolean } {
  if (env.reducedMotion) return { scene: false, motion: false };

  const weak =
    (env.memoryGb !== undefined && env.memoryGb < MIN_MEMORY_GB) ||
    (env.cores !== undefined && env.cores < MIN_CORES);

  return { scene: env.webgl && !weak, motion: true };
}

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function readEnvironment(): Environment {
  const hints = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: supportsWebgl(),
    memoryGb: hints.deviceMemory,
    cores: hints.hardwareConcurrency,
  };
}
