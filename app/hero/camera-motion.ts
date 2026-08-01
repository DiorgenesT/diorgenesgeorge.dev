import type { Coord } from "./projection";

const RAD = Math.PI / 180;

/** Rotação do globo que traz a coordenada para a frente da câmera. */
export function targetRotation(coord: Coord): { x: number; y: number } {
  return { x: coord.lat * RAD, y: -coord.lon * RAD };
}

const MIN_DURATION = 0.9;
const MAX_DURATION = 2.4;

/**
 * Inércia, não interpolação linear: a duração cresce com a distância angular e satura,
 * e a curva desacelera na chegada. É a diferença entre "a câmera parou" e "a câmera
 * encontrou".
 */
export function settleTween(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { duration: number; ease: string } {
  const travel = Math.hypot(to.x - from.x, to.y - from.y);
  const duration = Math.min(
    MAX_DURATION,
    MIN_DURATION + (travel / Math.PI) * 1.2,
  );

  return { duration, ease: "power3.out" };
}
