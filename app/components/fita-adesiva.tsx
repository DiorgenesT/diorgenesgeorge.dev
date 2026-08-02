import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Tira de fita crepe. O amarelo nunca carrega texto por conta propria: sobre o papel
 * ele da 1,58:1. Aqui ele e fundo, e o texto e sempre a tinta, o que da 10,74:1.
 */
export function FitaAdesiva({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block bg-fita px-4 py-1 font-bold text-fg"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
