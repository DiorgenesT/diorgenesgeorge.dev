"use client";

import type { Dicionario } from "@/i18n";
import CenaParallax, { type Camada, type Luz } from "./CenaParallax";

/**
 * A cena do topo de Jogos: a mesa de guerra num salão em ruínas (public/jogos). O xadrez em plena batalha é
 * o Xeque Bárbaro; o cubo de pedra com X e O é o Cubo da Velha. Ele, de costas e de capuz, ao lado da mesa.
 */

// posições em frações do quadro 16:9 (.capa)
const CAMADAS: Camada[] = [
  { id: "fundo", src: "/jogos/1-fundo.webp", d: 0.1, x: -0.04, y: -0.04, w: 1.08 },
  { id: "colunas", src: "/jogos/2-colunas.webp", d: 0.3, x: 0.4, y: 0.24, w: 0.44 },
  { id: "mesa", src: "/jogos/3-mesa.webp", d: 0.55, x: 0.33, y: 0.5, w: 0.53 },
  { id: "ele", src: "/jogos/4-ele.webp", d: 0.72, x: 0.8, y: 0.48, w: 0.125, espelhar: true },
  { id: "frente", src: "/jogos/5-frente.webp", d: 1.15, x: -0.03, y: 0.71, w: 1.06 },
];

/** De onde vem a luz quente (frações do quadro): as duas tochas das colunas e as velas da mesa. */
const LUZES: Luz[] = [
  { id: "colunas", x: 0.475, y: 0.556, raio: "9% 13%", cor: "rgba(255,150,70,.30)" },
  { id: "colunas", x: 0.77, y: 0.552, raio: "9% 13%", cor: "rgba(255,150,70,.30)" },
  { id: "mesa", x: 0.433, y: 0.552, raio: "8% 11%", cor: "rgba(255,190,110,.26)" },
];

export default function CenaJogos({ t }: { t: Dicionario }) {
  return (
    <CenaParallax
      camadas={CAMADAS}
      luzes={LUZES}
      aproximar={["mesa", "ele"]}
      rotulo="Open Digital Games"
      titulo={t.jogos.titulo}
      sub={t.jogos.sub}
      idTitulo="jog-titulo"
      rolar={t.sobre.rolar}
      foco={0.8}
    />
  );
}
