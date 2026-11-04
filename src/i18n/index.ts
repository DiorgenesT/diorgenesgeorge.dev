import type { Idioma } from "./config";
import en, { type Dicionario } from "./en";
import pt from "./pt";
import es from "./es";

const dicionarios: Record<Idioma, Dicionario> = { en, pt, es };
export const dicionario = (l: Idioma) => dicionarios[l];
export type { Dicionario };
