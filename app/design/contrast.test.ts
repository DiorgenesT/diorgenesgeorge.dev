import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("should return 21 when comparing pure black and pure white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("should return 1 when both colors are identical", () => {
    expect(contrastRatio("#0A0908", "#0A0908")).toBeCloseTo(1, 5);
  });

  it("should return the documented 4.48 ratio for #777777 on white", () => {
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("should be symmetric regardless of argument order", () => {
    expect(contrastRatio("#FFA033", "#0A0908")).toBeCloseTo(
      contrastRatio("#0A0908", "#FFA033"),
      10,
    );
  });

  it("should accept three-digit shorthand hex", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 2);
  });

  it("should throw when given a value that is not a hex color", () => {
    expect(() => contrastRatio("rebeccapurple", "#FFFFFF")).toThrow();
  });
});
