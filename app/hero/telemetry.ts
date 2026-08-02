import { useEffect, useState } from "react";

/** Espelho do tipo de `workers/api/edge.ts`: `app/` não importa de `workers/`. */
export type EdgeTelemetry = {
  visitor: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  colo: { code: string; lat: number; lon: number } | null;
  httpProtocol?: string;
  tlsVersion?: string;
};

export type TelemetryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: EdgeTelemetry; rttMs: number }
  | { status: "failed" };

const TIMEOUT_MS = 4000;

/** O RTT sai do relógio do browser: é a única parte que o servidor não tem como informar. */
export async function measure(
  fetchImpl: typeof fetch,
  now: () => number,
  timeoutMs = TIMEOUT_MS,
): Promise<TelemetryState> {
  const started = now();

  const timeout = new Promise<TelemetryState>((resolve) =>
    setTimeout(() => resolve({ status: "failed" }), timeoutMs),
  );

  const request = (async (): Promise<TelemetryState> => {
    try {
      const response = await fetchImpl("/api/edge", { cache: "no-store" });
      if (!response.ok) return { status: "failed" };

      const data = (await response.json()) as EdgeTelemetry;
      return { status: "ready", data, rttMs: Math.round(now() - started) };
    } catch {
      return { status: "failed" };
    }
  })();

  return Promise.race([request, timeout]);
}

export function useEdgeTelemetry(enabled: boolean): TelemetryState {
  // idle é o estado do HTML pré-renderizado: sem JavaScript ele permanece, e o painel
  // diz que a medição depende de JavaScript em vez de prometer que está medindo.
  const [state, setState] = useState<TelemetryState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    void measure(fetch, () => performance.now()).then((next) => {
      if (alive) setState(next);
    });

    return () => {
      alive = false;
    };
  }, [enabled]);

  // loading é derivado, não guardado: escrevê-lo no efeito dispararia render em cascata.
  return enabled && state.status === "idle" ? { status: "loading" } : state;
}
