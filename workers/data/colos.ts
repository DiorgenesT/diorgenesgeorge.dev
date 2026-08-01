import table from "./colos.json";

/** O JSON chega como number[]: a checagem de tamanho é o que o torna um par confiável. */
export const COLOS: Record<string, number[]> = table;

/** Colo desconhecido devolve undefined: o painel diz que não mediu, em vez de chutar. */
export function coloLocation(
  iata: string,
): { lat: number; lon: number } | undefined {
  const [lat, lon] = COLOS[iata.toUpperCase()] ?? [];

  return lat !== undefined && lon !== undefined ? { lat, lon } : undefined;
}
