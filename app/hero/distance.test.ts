import { describe, expect, it } from "vitest";
import { distanceKm } from "./distance";

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
