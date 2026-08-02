import { Euler, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { cameraDistance, settleTween, targetRotation } from "./camera-motion";
import { toVector } from "./projection";

describe("targetRotation", () => {
  it("should face the equator without tilting", () => {
    expect(targetRotation({ lat: 0, lon: 0 }).x).toBeCloseTo(0, 6);
  });

  it("should need no turn for the meridian that already faces the camera", () => {
    expect(targetRotation({ lat: 0, lon: 90 }).y).toBeCloseTo(0, 6);
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
    expect(
      settleTween({ x: 0, y: 0 }, { x: 0, y: 0 }).duration,
    ).toBeGreaterThanOrEqual(0.9);
  });

  it("should ease out, because the globe is arriving and not leaving", () => {
    expect(settleTween({ x: 0, y: 0 }, { x: 0, y: 1 }).ease).toMatch(/out/);
  });
});

describe("targetRotation, aplicada de verdade", () => {
  // O teste que faltava: não basta o sinal estar certo, o ponto precisa acabar
  // virado para a câmera, que olha o globo de +z.
  const applied = (coord: { lat: number; lon: number }) => {
    const point = toVector(coord);
    const { x: rx, y: ry } = targetRotation(coord);

    const euler = new Euler(rx, ry, 0, "XYZ");
    return new Vector3(point.x, point.y, point.z).applyEuler(euler);
  };

  it.each([
    ["Betim", { lat: -19.9678, lon: -44.1983 }],
    ["Lisboa", { lat: 38.7813, lon: -9.1359 }],
    ["Tóquio", { lat: 35.6762, lon: 139.6503 }],
  ])("should bring %s to the front of the camera", (_name, coord) => {
    expect(applied(coord).z).toBeGreaterThan(0.99);
  });
});

describe("cameraDistance", () => {
  it("should come closer for a pair that is a few degrees apart", () => {
    const betimToRio = 3 * (Math.PI / 180);

    expect(cameraDistance(betimToRio)).toBeLessThan(3.6);
  });

  it("should never come so close that the globe outgrows the frame", () => {
    // 2·d·tan(17,5°) precisa passar de 2, o diâmetro do globo. Abaixo disso a
    // silhueta some e sobra um retângulo com linhas.
    const visibleHeight = 2 * cameraDistance(0) * Math.tan((35 / 2) * (Math.PI / 180));

    expect(visibleHeight).toBeGreaterThan(2);
  });

  it("should stay far for a pair on opposite sides of the ocean", () => {
    const betimToLisbon = 70 * (Math.PI / 180);

    expect(cameraDistance(betimToLisbon)).toBeCloseTo(4.0, 5);
  });

  it("should grow with the span", () => {
    expect(cameraDistance(0.5)).toBeGreaterThan(cameraDistance(0.1));
  });
});
