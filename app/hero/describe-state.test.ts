import { describe, expect, it } from "vitest";
import { getDictionary } from "../i18n/dictionary";
import { describeState, noteFor } from "./describe-state";
import type { TelemetryState } from "./telemetry";

const t = getDictionary("pt-BR");

const ready: TelemetryState = {
  status: "ready",
  rttMs: 42,
  data: {
    visitor: {
      city: "Betim",
      country: "BR",
      lat: -19.9678,
      lon: -44.1983,
    },
    colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
    httpProtocol: "HTTP/3",
    tlsVersion: "TLSv1.3",
  },
};

describe("describeState", () => {
  it("should keep every row present while loading, to avoid a layout shift", () => {
    expect(describeState({ status: "loading" }, "pt-BR", t)).toHaveLength(6);
  });

  it("should keep every row present when it failed", () => {
    expect(describeState({ status: "failed" }, "pt-BR", t)).toHaveLength(6);
  });

  it("should never show a zero for a missing measurement", () => {
    const rows = describeState({ status: "failed" }, "pt-BR", t);

    expect(rows.every((row) => row.value === t["hero.unavailable"])).toBe(true);
  });

  it("should not promise a measurement in the state the static html carries", () => {
    const rows = describeState({ status: "idle" }, "pt-BR", t);

    expect(rows.every((row) => row.value === "—")).toBe(true);
  });

  it("should name the city and the country of the visitor", () => {
    expect(describeState(ready, "pt-BR", t)[0]?.value).toBe("Betim, BR");
  });

  it("should show the colo code", () => {
    expect(describeState(ready, "pt-BR", t)[1]?.value).toBe("GIG");
  });

  it("should compute the distance between visitor and colo", () => {
    expect(describeState(ready, "pt-BR", t)[2]?.value).toMatch(/^33\d km$/);
  });

  it("should format the distance with the separator of the locale", () => {
    const far: TelemetryState = {
      ...ready,
      data: {
        ...ready.data,
        colo: { code: "LIS", lat: 38.7813, lon: -9.1359 },
      },
    } as TelemetryState;

    expect(describeState(far, "pt-BR", t)[2]?.value).toMatch(/^7\.\d{3} km$/);
  });

  it("should say it could not measure the distance when the colo is unknown", () => {
    const noColo = {
      ...ready,
      data: { ...ready.data, colo: null },
    } as TelemetryState;

    expect(describeState(noColo, "pt-BR", t)[2]?.value).toBe(
      t["hero.unavailable"],
    );
  });

  it("should say it could not measure a field the platform omitted", () => {
    const noTls = {
      ...ready,
      data: { ...ready.data, tlsVersion: undefined },
    } as TelemetryState;

    expect(describeState(noTls, "pt-BR", t)[5]?.value).toBe(
      t["hero.unavailable"],
    );
  });

  it("should show the measured round trip", () => {
    expect(describeState(ready, "pt-BR", t)[3]?.value).toBe("42 ms");
  });
});

describe("noteFor", () => {
  it("should tell a visitor without javascript why the numbers are missing", () => {
    expect(noteFor({ status: "idle" }, t)).toBe(t["hero.needsJs"]);
  });

  it("should say the data was not stored once it has been measured", () => {
    expect(noteFor(ready, t)).toBe(t["hero.privacy"]);
  });
});
