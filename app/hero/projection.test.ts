import { describe, expect, it } from "vitest";
import { distanceKm, greatCircle, project, toVector } from "./projection";

const BETIM = { lat: -19.9678, lon: -44.1983 };
const RIO = { lat: -22.81, lon: -43.2506 };
const LISBOA = { lat: 38.7813, lon: -9.1359 };

describe("distanceKm", () => {
  it("should measure the known distance from Betim to Rio", () => {
    // ~331 km: 2,84 graus de latitude valem ~316 km e 0,95 de longitude
    // nessa latitude valem ~98 km, o que dá essa hipotenusa.
    expect(distanceKm(BETIM, RIO)).toBeGreaterThan(320);
    expect(distanceKm(BETIM, RIO)).toBeLessThan(345);
  });

  it("should measure the known distance from Betim to Lisbon", () => {
    // ~7.400 km atravessando o Atlântico.
    expect(distanceKm(BETIM, LISBOA)).toBeGreaterThan(7200);
    expect(distanceKm(BETIM, LISBOA)).toBeLessThan(7600);
  });

  it("should be zero for the same point", () => {
    expect(distanceKm(BETIM, BETIM)).toBeCloseTo(0, 5);
  });

  it("should be symmetric", () => {
    expect(distanceKm(BETIM, LISBOA)).toBeCloseTo(distanceKm(LISBOA, BETIM), 6);
  });
});

describe("toVector", () => {
  it("should put the north pole at the top", () => {
    const point = toVector({ lat: 90, lon: 0 });

    expect(point.y).toBeCloseTo(1, 6);
    expect(point.x).toBeCloseTo(0, 6);
  });

  it("should keep every point on the sphere surface", () => {
    const point = toVector(LISBOA, 3);

    expect(Math.hypot(point.x, point.y, point.z)).toBeCloseTo(3, 6);
  });
});

describe("project", () => {
  it("should place the center of the view at the origin of the screen", () => {
    const projected = project(BETIM, BETIM, 100);

    expect(projected.x).toBeCloseTo(0, 6);
    expect(projected.y).toBeCloseTo(0, 6);
  });

  it("should mark the center of the view as facing the viewer", () => {
    expect(project(BETIM, BETIM, 100).front).toBe(true);
  });

  it("should mark the far side of the globe as hidden", () => {
    const antipode = { lat: -BETIM.lat, lon: BETIM.lon + 180 };

    expect(project(antipode, BETIM, 100).front).toBe(false);
  });

  it("should scale to the given radius", () => {
    const east = project({ lat: 0, lon: 90 }, { lat: 0, lon: 0 }, 100);

    expect(Math.abs(east.x)).toBeCloseTo(100, 4);
  });
});

describe("greatCircle", () => {
  it("should start at the origin and end at the destination", () => {
    const path = greatCircle(BETIM, LISBOA, 8);

    expect(path[0]?.lat).toBeCloseTo(BETIM.lat, 4);
    expect(path.at(-1)?.lon).toBeCloseTo(LISBOA.lon, 4);
  });

  it("should return one more point than the number of segments", () => {
    expect(greatCircle(BETIM, LISBOA, 8)).toHaveLength(9);
  });

  it("should follow the shortest path over the sphere", () => {
    const path = greatCircle(BETIM, LISBOA, 32);
    const walked = path
      .slice(1)
      .reduce(
        (sum, point, index) => sum + distanceKm(path[index] as Coord, point),
        0,
      );

    // A soma dos trechos aproxima a distância direta por cima, nunca por baixo.
    expect(walked).toBeGreaterThanOrEqual(distanceKm(BETIM, LISBOA) - 1);
    expect(walked).toBeLessThan(distanceKm(BETIM, LISBOA) * 1.01);
  });

  it("should keep a single point when origin and destination match", () => {
    const path = greatCircle(BETIM, BETIM, 4);

    expect(path.every((point) => Math.abs(point.lat - BETIM.lat) < 1e-6)).toBe(
      true,
    );
  });
});

type Coord = { lat: number; lon: number };
