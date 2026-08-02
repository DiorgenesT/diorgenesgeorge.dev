import { describe, expect, it } from "vitest";
import {
  cargaDeLatencia,
  DURACAO_DA_RECEPCAO_MS,
  FATIAS,
} from "./desregistro";

describe("FATIAS", () => {
  it("should cut the mark into six bands that cover it whole", () => {
    expect(FATIAS).toHaveLength(6);
  });

  it("should send neighbouring bands in opposite directions, or nothing reads as a tear", () => {
    const sinais = FATIAS.map((fatia) => Math.sign(fatia.direcao));

    expect(new Set(sinais).size).toBe(2);
  });

  it("should give every band its own delay, so they never land together", () => {
    const atrasos = FATIAS.map((fatia) => fatia.atraso);

    expect(new Set(atrasos).size).toBe(FATIAS.length);
  });
});

describe("cargaDeLatencia", () => {
  it("should still show the print happening on a fast connection", () => {
    // Piso alto de propósito: em rede local o RTT é de um a três milissegundos, e
    // sem piso o gesto simplesmente não acontecia para quem está perto do edge.
    const perto = cargaDeLatencia(2);

    expect(perto).toBeGreaterThan(0.3);
    expect(perto).toBeLessThan(0.5);
  });

  it("should saturate on a connection bad enough", () => {
    expect(cargaDeLatencia(900)).toBe(1);
  });

  it("should grow with latency", () => {
    expect(cargaDeLatencia(340)).toBeGreaterThan(cargaDeLatencia(18));
    expect(cargaDeLatencia(900)).toBeGreaterThan(cargaDeLatencia(340));
  });

  it("should never reach a perfect register, because print never does", () => {
    // Mesmo numa latência impossível de boa, a chapa fica levemente fora.
    expect(cargaDeLatencia(0)).toBeGreaterThan(0);
    expect(cargaDeLatencia(-50)).toBeGreaterThan(0);
  });
});

describe("DURACAO_DA_RECEPCAO_MS", () => {
  it("should not depend on latency, so a bad line is not punished twice", () => {
    expect(DURACAO_DA_RECEPCAO_MS).toBe(900);
  });
});
