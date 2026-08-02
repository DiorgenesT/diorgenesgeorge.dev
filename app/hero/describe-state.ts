import type { Dictionary } from "../i18n/dictionary";
import type { Locale } from "../i18n/config";
import { formatNumber } from "../i18n/format";
import { distanceKm } from "./projection";
import type { TelemetryState } from "./telemetry";

export type Row = { label: string; value: string };

/**
 * A decisão de qual texto cada campo recebe, separada da renderização para poder ser
 * testada. Nenhum estado devolve zero: dado ausente vira "não foi possível medir",
 * porque um zero na tela é indistinguível de uma medição de verdade.
 */
export function describeState(
  state: TelemetryState,
  locale: Locale,
  t: Dictionary,
): Row[] {
  const labels = [
    t["hero.you"],
    t["hero.servedBy"],
    t["hero.distance"],
    t["hero.rtt"],
    t["hero.protocol"],
    t["hero.tls"],
  ];

  if (state.status !== "ready") {
    const placeholder =
      state.status === "idle"
        ? "—"
        : state.status === "loading"
          ? t["hero.measuring"]
          : t["hero.unavailable"];

    return labels.map((label) => ({ label, value: placeholder }));
  }

  const { visitor, colo } = state.data;
  const unavailable = t["hero.unavailable"];

  const where = [visitor.city, visitor.country].filter(Boolean).join(", ");

  const canMeasure =
    visitor.lat !== undefined && visitor.lon !== undefined && colo !== null;

  const distance = canMeasure
    ? `${formatNumber(
        locale,
        Math.round(
          distanceKm(
            { lat: visitor.lat as number, lon: visitor.lon as number },
            { lat: colo.lat, lon: colo.lon },
          ),
        ),
      )} km`
    : unavailable;

  const values = [
    where === "" ? unavailable : where,
    colo === null ? unavailable : colo.code,
    distance,
    `${formatNumber(locale, state.rttMs)} ms`,
    state.data.httpProtocol ?? unavailable,
    state.data.tlsVersion ?? unavailable,
  ];

  return labels.map((label, index) => ({
    label,
    value: values[index] as string,
  }));
}

/** A linha abaixo da lista muda com o estado: sem JavaScript ela explica a ausência. */
export function noteFor(state: TelemetryState, t: Dictionary): string {
  return state.status === "idle" ? t["hero.needsJs"] : t["hero.privacy"];
}
