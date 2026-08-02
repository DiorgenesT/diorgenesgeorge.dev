import { describe, expect, it } from "vitest";
import { buildTelemetry } from "./edge";

const cf = {
  city: "Betim",
  region: "Minas Gerais",
  country: "BR",
  latitude: "-19.9678",
  longitude: "-44.1983",
  colo: "GIG",
  httpProtocol: "HTTP/3",
  tlsVersion: "TLSv1.3",
  asOrganization: "Alguma Operadora",
} as unknown as IncomingRequestCfProperties;

describe("buildTelemetry", () => {
  it("should convert the visitor coordinates from string to number", () => {
    expect(buildTelemetry(cf).visitor.lat).toBeCloseTo(-19.9678, 4);
  });

  it("should resolve the colo coordinates from its code", () => {
    expect(buildTelemetry(cf).colo?.lat).toBeCloseTo(-22.81, 1);
  });

  it("should keep the city of the visitor", () => {
    expect(buildTelemetry(cf).visitor.city).toBe("Betim");
  });

  it("should keep the protocol and the tls version", () => {
    const telemetry = buildTelemetry(cf);

    expect(telemetry.httpProtocol).toBe("HTTP/3");
    expect(telemetry.tlsVersion).toBe("TLSv1.3");
  });

  it("should never expose the network operator of the visitor", () => {
    const serialized = JSON.stringify(buildTelemetry(cf));

    expect(serialized).not.toContain("Alguma Operadora");
    expect(serialized).not.toMatch(/asOrganization|asn|"ip"/i);
  });

  it("should report a null colo when the code is unknown, instead of guessing", () => {
    const unknown = {
      ...cf,
      colo: "ZZZ",
    } as unknown as IncomingRequestCfProperties;

    expect(buildTelemetry(unknown).colo).toBeNull();
  });

  it("should omit the coordinates when the platform did not send them", () => {
    const partial = { colo: "GIG" } as unknown as IncomingRequestCfProperties;

    expect(buildTelemetry(partial).visitor.lat).toBeUndefined();
  });

  it("should treat an empty string as absent, not as a value", () => {
    const empty = { ...cf, city: "" } as unknown as IncomingRequestCfProperties;

    expect(buildTelemetry(empty).visitor.city).toBeUndefined();
  });

  it("should survive a request without cf at all", () => {
    expect(buildTelemetry(undefined).colo).toBeNull();
    expect(buildTelemetry(undefined).visitor.city).toBeUndefined();
  });
});
