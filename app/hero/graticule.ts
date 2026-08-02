import type { Coord } from "./projection";

/** Meridianos e paralelos como listas de pontos, para o SVG desenhar como polilinha. */
export function graticule(step = 30, resolution = 6): Coord[][] {
  const lines: Coord[][] = [];

  for (let lon = -180; lon <= 180; lon += step) {
    lines.push(
      Array.from({ length: 180 / resolution + 1 }, (_, index) => ({
        lat: -90 + index * resolution,
        lon,
      })),
    );
  }

  for (let lat = -60; lat <= 60; lat += step) {
    lines.push(
      Array.from({ length: 360 / resolution + 1 }, (_, index) => ({
        lat,
        lon: -180 + index * resolution,
      })),
    );
  }

  return lines;
}
