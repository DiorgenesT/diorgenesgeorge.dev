"use client";

import type { Dicionario } from "@/i18n";
import CenaParallax, { type Camada, type Luz, type Nevoa } from "./CenaParallax";

/**
 * A cena do topo de Trabalhos: a galeria. Um salão gótico em ruínas ao entardecer (public/trabalhos-cena) e
 * uma parede com três arcos abertos para o vale; ele de costas, olhando o que já construiu. Só parallax.
 */

// posições em frações do quadro 16:9 (.capa); a cena fica à direita, o título à esquerda
const CAMADAS: Camada[] = [
  { id: "fundo", src: "/trabalhos-cena/1-fundo.webp", d: 0.08, x: -0.04, y: -0.04, w: 1.08 },
  { id: "arcos", src: "/trabalhos-cena/2-arcos.webp", d: 0.3, x: 0.34, y: 0.175, w: 0.62 },
  { id: "ele", src: "/trabalhos-cena/3-ele.webp", d: 0.62, x: 0.556, y: 0.47, w: 0.0882 },
  { id: "frente", src: "/trabalhos-cena/4-frente.webp", d: 1.15, x: -0.03, y: 0.7, w: 1.06 },
];

/** As velas nos parapeitos dos arcos e a luz do sol entrando pelo arco do meio. */
const LUZES: Luz[] = [
  { id: "arcos", x: 0.455, y: 0.668, raio: "6% 9%", cor: "rgba(255,180,100,.24)" },
  { id: "arcos", x: 0.7, y: 0.662, raio: "6% 9%", cor: "rgba(255,180,100,.24)" },
  { id: "arcos", x: 0.855, y: 0.675, raio: "6% 9%", cor: "rgba(255,180,100,.22)" },
  { id: "arcos", x: 0.65, y: 0.5, raio: "26% 34%", cor: "rgba(255,200,140,.12)" },
];

/** Névoa na base da parede: ela se apoia no chão do salão em vez de flutuar. */
const NEVOAS: Nevoa[] = [{ id: "arcos", y: 0.7, h: 0.18, opacidade: 0.75 }];

export default function CenaTrabalhos({ t }: { t: Dicionario }) {
  return (
    <CenaParallax
      camadas={CAMADAS}
      luzes={LUZES}
      nevoas={NEVOAS}
      aproximar={["arcos", "ele"]}
      rotulo={t.trabalhos.rotulo}
      titulo={t.trabalhos.titulo}
      sub={t.trabalhos.sub}
      idTitulo="trab-titulo"
      rolar={t.sobre.rolar}
      foco={0.66}
    />
  );
}
