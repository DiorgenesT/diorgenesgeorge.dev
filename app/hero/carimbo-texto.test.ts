import { describe, expect, it } from "vitest";
import { textoDoCarimbo } from "./carimbo-texto";
import type { TelemetryState } from "./telemetry";
import { ptBR } from "../i18n/messages/pt-BR";

const PRONTO: TelemetryState = {
  status: "ready",
  rttMs: 18,
  data: {
    visitor: {
      city: "Betim",
      region: "Minas Gerais",
      country: "BR",
      lat: -19.9678,
      lon: -44.1983,
    },
    colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
    httpProtocol: "HTTP/3",
    tlsVersion: "TLSv1.3",
  },
};

describe("textoDoCarimbo", () => {
  it("should stamp nothing while there is nothing to stamp", () => {
    for (const status of ["idle", "loading", "failed"] as const) {
      expect(textoDoCarimbo({ status }, "pt-BR", ptBR)).toBeNull();
    }
  });

  it("should name the city and the datacenter that served the page", () => {
    const carimbo = textoDoCarimbo(PRONTO, "pt-BR", ptBR);

    expect(carimbo?.linhas.join(" ")).toContain("Betim");
    expect(carimbo?.linhas.join(" ")).toContain("GIG");
  });

  it("should report the round trip it measured", () => {
    expect(textoDoCarimbo(PRONTO, "pt-BR", ptBR)?.linhas.join(" ")).toContain(
      "18 ms",
    );
  });

  it("should never invent a distance when the datacenter is unknown", () => {
    const semColo: TelemetryState = {
      ...PRONTO,
      data: { ...PRONTO.data, colo: null },
    };
    const texto = textoDoCarimbo(semColo, "pt-BR", ptBR)?.linhas.join(" ") ?? "";

    expect(texto).toContain("Betim");
    expect(texto).not.toContain("km");
  });

  it("should never invent a distance when the visitor has no coordinates", () => {
    const semCoordenada: TelemetryState = {
      ...PRONTO,
      data: {
        ...PRONTO.data,
        visitor: { city: "Betim", country: "BR" },
      },
    };

    expect(
      textoDoCarimbo(semCoordenada, "pt-BR", ptBR)?.linhas.join(" ") ?? "",
    ).not.toContain("km");
  });

  it("should never print a zero, because a zero reads as a real measurement", () => {
    const semNada: TelemetryState = {
      status: "ready",
      rttMs: 18,
      data: { visitor: {}, colo: null },
    };
    const carimbo = textoDoCarimbo(semNada, "pt-BR", ptBR);

    expect(carimbo?.linhas.join(" ") ?? "").not.toMatch(/\b0\s*(km|ms)\b/);
  });

  it("should still stamp the round trip when the location is unknown", () => {
    const semLugar: TelemetryState = {
      status: "ready",
      rttMs: 42,
      data: { visitor: {}, colo: null },
    };

    expect(textoDoCarimbo(semLugar, "pt-BR", ptBR)?.linhas.join(" ")).toContain(
      "42 ms",
    );
  });

  it("should drop the heading when there is no place to name", () => {
    const semLugar: TelemetryState = {
      status: "ready",
      rttMs: 42,
      data: { visitor: {}, colo: null },
    };

    // "Esta cópia chegou em" seguido de nada é texto quebrado.
    expect(textoDoCarimbo(semLugar, "pt-BR", ptBR)?.titulo).toBeNull();
  });

  it("should keep the heading when there is a place", () => {
    expect(textoDoCarimbo(PRONTO, "pt-BR", ptBR)?.titulo).not.toBeNull();
  });
});
