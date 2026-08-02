import type { Coord } from "./projection";

const RAD = Math.PI / 180;

/**
 * Gira em Y para trazer a longitude ao meridiano que encara a câmera, depois em X para
 * a latitude. A câmera olha o globo de +z, e `toVector` põe a longitude 90° nesse eixo
 * — daí o quarto de volta subtraído.
 *
 * A ordem de rotação precisa ser "XYZ", que é o padrão do Three.js: em `applyEuler` a
 * última letra é aplicada primeiro ao vetor, então "XYZ" compõe X depois de Y, que é
 * o que a derivação exige. Trocar para "YXZ" põe o ponto fora do centro.
 */
export function targetRotation(coord: Coord): { x: number; y: number } {
  return { x: coord.lat * RAD, y: coord.lon * RAD - Math.PI / 2 };
}

const FAR_DISTANCE = 4.0;
const NEAR_DISTANCE = 3.4;

/**
 * Um par próximo — Betim e o Rio distam 3 graus — produz um arco de poucos pixels a
 * distância fixa, e o arco é a promessa da cena. A câmera aproxima em vez de o desenho
 * exagerar a distância: o dado continua verdadeiro e o visual passa a comunicar.
 *
 * O piso de 3,4 sai da geometria, não do gosto: com campo de visão de 35 graus, a
 * altura visível é 2·d·tan(17,5°), e o globo tem diâmetro 2. Abaixo de 3,4 a esfera
 * transborda e a silhueta some — sem silhueta não há globo, só um retângulo com linhas.
 *
 * Isso limita a aproximação, e está certo: quando o datacenter está a 331 km, os dois
 * pontos quase coincidirem é o que de fato aconteceu, não uma falha do desenho.
 */
export function cameraDistance(spanRadians: number): number {
  const ratio = Math.min(1, spanRadians / (Math.PI / 3));
  return NEAR_DISTANCE + (FAR_DISTANCE - NEAR_DISTANCE) * ratio;
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

const MARKER_AT_FAR = 0.02;

/** Raio do marcador no mundo, para o tamanho na tela ficar igual em qualquer aproximação. */
export function markerRadius(distance: number): number {
  return MARKER_AT_FAR * (distance / FAR_DISTANCE);
}
