import { coloLocation } from "../data/colos";

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

function text(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function coordinate(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Só o que o painel mostra. IP, ASN e organização ficam de fora de propósito:
 * publicá-los mudaria a natureza do que está sendo exibido ao visitante.
 */
export function buildTelemetry(
  cf: IncomingRequestCfProperties | undefined,
): EdgeTelemetry {
  const code = text(cf?.colo);
  const location = code ? coloLocation(code) : undefined;

  return {
    visitor: {
      city: text(cf?.city),
      region: text(cf?.region),
      country: text(cf?.country),
      lat: coordinate(cf?.latitude),
      lon: coordinate(cf?.longitude),
    },
    colo: location && code ? { code: code.toUpperCase(), ...location } : null,
    httpProtocol: text(cf?.httpProtocol),
    tlsVersion: text(cf?.tlsVersion),
  };
}

/** O tipo do cf só é preciso no Request que o handler do Worker recebe. */
export function handleEdge(
  request: Request<unknown, IncomingRequestCfProperties>,
): Response {
  return new Response(JSON.stringify(buildTelemetry(request.cf)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // A resposta é diferente para cada visitante e não pode ser servida a outro.
      "Cache-Control": "no-store",
    },
  });
}
