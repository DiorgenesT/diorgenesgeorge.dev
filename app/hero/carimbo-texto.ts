import type { Locale } from "../i18n/config";
import type { Dictionary } from "../i18n/dictionary";
import { formatNumber } from "../i18n/format";
import { distanceKm } from "./distance";
import type { TelemetryState } from "./telemetry";

export type TextoDoCarimbo = { titulo: string | null; linhas: string[] };

/**
 * O que o carimbo diz, separado de como ele é desenhado, para poder ser testado sem DOM.
 *
 * Duas regras herdadas do painel que ele substitui, e que continuam valendo. Primeira:
 * nada de zero. Um "0 km" na tela é indistinguível de uma medição de verdade, então o
 * dado ausente simplesmente não vira linha. Segunda: distância só existe quando os dois
 * pontos existem; sem coordenada do visitante ou sem datacenter conhecido, não há o que
 * medir, e inventar seria mentir com aparência de precisão.
 */
export function textoDoCarimbo(
  state: TelemetryState,
  locale: Locale,
  t: Dictionary,
): TextoDoCarimbo | null {
  if (state.status !== "ready") return null;

  const { visitor, colo } = state.data;
  const linhas: string[] = [];

  const lugar = [visitor.city, visitor.country].filter(Boolean).join(", ");
  if (lugar !== "") linhas.push(lugar);

  if (colo !== null) {
    const podeMedir = visitor.lat !== undefined && visitor.lon !== undefined;
    const distancia = podeMedir
      ? ` ${formatNumber(
          locale,
          Math.round(
            distanceKm(
              { lat: visitor.lat as number, lon: visitor.lon as number },
              { lat: colo.lat, lon: colo.lon },
            ),
          ),
        )} km`
      : "";

    linhas.push(`${t["hero.servedBy"]} ${colo.code}${distancia}`);
  }

  linhas.push(`${formatNumber(locale, state.rttMs)} ms`);

  if (state.data.httpProtocol !== undefined) {
    linhas.push(state.data.httpProtocol);
  }

  // Sem lugar, o título sai: "Esta cópia chegou em" seguido de nada é texto quebrado.
  return { titulo: lugar === "" ? null : t["hero.stamp"], linhas };
}
