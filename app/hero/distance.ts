export type Coord = { lat: number; lon: number };

const EARTH_RADIUS_KM = 6371;
const RAD = Math.PI / 180;

/**
 * Haversine. Sobrou de `projection.ts`, que saiu com a cena 3D: o painel de telemetria
 * precisa da distancia entre o visitante e o datacenter, e nada mais da geometria de
 * esfera que servia ao globo.
 */
export function distanceKm(from: Coord, to: Coord): number {
  const dLat = (to.lat - from.lat) * RAD;
  const dLon = (to.lon - from.lon) * RAD;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * RAD) * Math.cos(to.lat * RAD) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
