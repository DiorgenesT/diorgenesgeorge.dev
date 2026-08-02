export type Coord = { lat: number; lon: number };
export type Vector3 = { x: number; y: number; z: number };

const EARTH_RADIUS_KM = 6371;
const RAD = Math.PI / 180;

/** Convenção y para cima, a mesma do Three.js, para a cena e o SVG concordarem. */
export function toVector(coord: Coord, radius = 1): Vector3 {
  const lat = coord.lat * RAD;
  const lon = coord.lon * RAD;
  const cosLat = Math.cos(lat);

  return {
    x: radius * cosLat * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: radius * cosLat * Math.sin(lon),
  };
}

/**
 * Projeção ortográfica clássica, na forma que dá para conferir contra a literatura.
 * `front` é falso para o que está do outro lado do globo — o cosseno da distância
 * angular ao centro da vista muda de sinal exatamente na borda visível.
 */
export function project(
  point: Coord,
  center: Coord,
  radius: number,
): { x: number; y: number; front: boolean } {
  const lat = point.lat * RAD;
  const lat0 = center.lat * RAD;
  const dLon = (point.lon - center.lon) * RAD;

  const cosC =
    Math.sin(lat0) * Math.sin(lat) +
    Math.cos(lat0) * Math.cos(lat) * Math.cos(dLon);

  return {
    x: radius * Math.cos(lat) * Math.sin(dLon),
    y:
      radius *
      (Math.cos(lat0) * Math.sin(lat) -
        Math.sin(lat0) * Math.cos(lat) * Math.cos(dLon)),
    front: cosC >= 0,
  };
}

/** Interpolação sobre a esfera: o caminho mais curto de verdade, não uma reta no plano. */
export function greatCircle(from: Coord, to: Coord, segments = 48): Coord[] {
  const a = toVector(from);
  const b = toVector(to);

  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const angle = Math.acos(dot);

  if (angle < 1e-9) {
    return Array.from({ length: segments + 1 }, () => ({ ...from }));
  }

  const sin = Math.sin(angle);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const scaleA = Math.sin((1 - t) * angle) / sin;
    const scaleB = Math.sin(t * angle) / sin;

    const x = a.x * scaleA + b.x * scaleB;
    const y = a.y * scaleA + b.y * scaleB;
    const z = a.z * scaleA + b.z * scaleB;
    const length = Math.hypot(x, y, z);

    return {
      lat: Math.asin(y / length) / RAD,
      lon: Math.atan2(z, x) / RAD,
    };
  });
}

export function distanceKm(from: Coord, to: Coord): number {
  const dLat = (to.lat - from.lat) * RAD;
  const dLon = (to.lon - from.lon) * RAD;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * RAD) * Math.cos(to.lat * RAD) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
