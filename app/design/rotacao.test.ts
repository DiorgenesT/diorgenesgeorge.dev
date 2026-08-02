import { describe, expect, it } from "vitest";
import { JITTER, obterJitter, obterRotacao, ROTACOES } from "./rotacao";

describe("obterRotacao", () => {
  it("should return the same angle for the same index, always", () => {
    expect(obterRotacao(3)).toBe(obterRotacao(3));
    expect(obterRotacao(3)).toBe(obterRotacao(3 + ROTACOES.length));
  });

  it("should wrap around instead of running off the table", () => {
    expect(obterRotacao(ROTACOES.length)).toBe(obterRotacao(0));
  });

  it("should accept a negative index, because a caller may count backwards", () => {
    expect(obterRotacao(-1)).toBe(obterRotacao(ROTACOES.length - 1));
  });

  it("should keep every angle small enough to read as handmade, not as broken", () => {
    for (const angulo of ROTACOES) {
      expect(Math.abs(angulo)).toBeLessThanOrEqual(6);
    }
  });

  it("should offer more than one angle, or nothing looks collaged", () => {
    expect(new Set(ROTACOES).size).toBeGreaterThan(4);
  });
});

describe("obterJitter", () => {
  it("should return the same offset for the same index, always", () => {
    expect(obterJitter(2)).toEqual(obterJitter(2));
    expect(obterJitter(2)).toEqual(obterJitter(2 + JITTER.length));
  });

  it("should wrap around instead of running off the table", () => {
    expect(obterJitter(JITTER.length)).toEqual(obterJitter(0));
  });

  it("should accept a negative index", () => {
    expect(obterJitter(-1)).toEqual(obterJitter(JITTER.length - 1));
  });

  it("should keep every offset within a few pixels", () => {
    for (const { x, y } of JITTER) {
      expect(Math.abs(x)).toBeLessThanOrEqual(5);
      expect(Math.abs(y)).toBeLessThanOrEqual(5);
    }
  });
});
