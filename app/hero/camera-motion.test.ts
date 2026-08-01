import { describe, expect, it } from "vitest";
import { settleTween, targetRotation } from "./camera-motion";

describe("targetRotation", () => {
  it("should face the equator without tilting", () => {
    expect(targetRotation({ lat: 0, lon: 0 }).x).toBeCloseTo(0, 6);
  });

  it("should turn the globe by the longitude", () => {
    const rotation = targetRotation({ lat: 0, lon: 90 });

    expect(Math.abs(rotation.y)).toBeCloseTo(Math.PI / 2, 6);
  });

  it("should tilt toward the southern hemisphere for a southern visitor", () => {
    expect(targetRotation({ lat: -20, lon: -44 }).x).toBeLessThan(0);
  });

  it("should tilt toward the northern hemisphere for a northern visitor", () => {
    expect(targetRotation({ lat: 38, lon: -9 }).x).toBeGreaterThan(0);
  });
});

describe("settleTween", () => {
  it("should take longer for a longer way to travel", () => {
    const near = settleTween({ x: 0, y: 0 }, { x: 0, y: 0.1 });
    const far = settleTween({ x: 0, y: 0 }, { x: 0, y: 3 });

    expect(far.duration).toBeGreaterThan(near.duration);
  });

  it("should never take longer than the patience of a reader", () => {
    const across = settleTween({ x: 0, y: 0 }, { x: Math.PI, y: Math.PI });

    expect(across.duration).toBeLessThanOrEqual(2.4);
  });

  it("should still take long enough to read as deceleration", () => {
    expect(settleTween({ x: 0, y: 0 }, { x: 0, y: 0 }).duration).toBeGreaterThanOrEqual(
      0.9,
    );
  });

  it("should ease out, because the globe is arriving and not leaving", () => {
    expect(settleTween({ x: 0, y: 0 }, { x: 0, y: 1 }).ease).toMatch(/out/);
  });
});
