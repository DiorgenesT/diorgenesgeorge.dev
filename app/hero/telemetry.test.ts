import { describe, expect, it, vi } from "vitest";
import { measure } from "./telemetry";

const payload = {
  visitor: { city: "Betim", lat: -19.9678, lon: -44.1983 },
  colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
};

const ok = () =>
  Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));

describe("measure", () => {
  it("should report the data when the edge answers", async () => {
    const state = await measure(ok as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("ready");
  });

  it("should carry the payload through untouched", async () => {
    const state = await measure(ok as unknown as typeof fetch, () => 0);

    expect(state).toMatchObject({ data: { colo: { code: "GIG" } } });
  });

  it("should measure the round trip from the clock, not from the payload", async () => {
    const clock = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1240);

    const state = await measure(ok as unknown as typeof fetch, clock);

    expect(state).toMatchObject({ rttMs: 240 });
  });

  it("should fail when the edge answers with an error status", async () => {
    const failing = () => Promise.resolve(new Response("", { status: 500 }));

    const state = await measure(failing as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should fail when the network throws", async () => {
    const throwing = () => Promise.reject(new Error("offline"));

    const state = await measure(throwing as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should fail when the answer is not valid json", async () => {
    const garbled = () =>
      Promise.resolve(new Response("<html>", { status: 200 }));

    const state = await measure(garbled as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should give up on a measurement that took too long to be worth anything", async () => {
    const never = () => new Promise<Response>(() => {});

    const state = await measure(never as unknown as typeof fetch, () => 0, 10);

    expect(state.status).toBe("failed");
  });
});
