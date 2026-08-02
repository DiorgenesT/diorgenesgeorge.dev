import { describe, expect, it } from "vitest";
import { COLOS, coloLocation } from "./colos";

describe("coloLocation", () => {
  it("should locate the São Paulo colo", () => {
    const location = coloLocation("GRU");

    expect(location?.lat).toBeCloseTo(-23.43, 1);
    expect(location?.lon).toBeCloseTo(-46.47, 1);
  });

  it("should locate the Lisbon colo", () => {
    expect(coloLocation("LIS")?.lat).toBeCloseTo(38.78, 1);
  });

  it("should locate the Rio colo", () => {
    expect(coloLocation("GIG")?.lon).toBeCloseTo(-43.25, 1);
  });

  it("should accept a lowercase code", () => {
    expect(coloLocation("gru")).toEqual(coloLocation("GRU"));
  });

  it("should return undefined for an unknown code instead of guessing", () => {
    expect(coloLocation("ZZZ")).toBeUndefined();
  });

  it("should cover enough airports to reach every colo", () => {
    expect(Object.keys(COLOS).length).toBeGreaterThan(3000);
  });

  it("should keep every coordinate inside the valid range", () => {
    const invalid = Object.entries(COLOS).filter(([, pair]) => {
      const [lat, lon] = pair;
      return (
        pair.length !== 2 ||
        lat === undefined ||
        lon === undefined ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      );
    });

    expect(invalid).toEqual([]);
  });

  it("should use three letter codes only", () => {
    const wrong = Object.keys(COLOS).filter((code) => !/^[A-Z]{3}$/.test(code));

    expect(wrong).toEqual([]);
  });
});
