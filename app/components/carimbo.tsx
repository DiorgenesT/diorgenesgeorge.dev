import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Carimbo de tinta vermelha. Usa a datilografada, entao respeita o piso de 13px:
 * `text-meta` existe exatamente para isso, e `text-xs` (12px) e proibido aqui.
 */
export function Carimbo({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block border-2 border-accent px-2 py-0.5 font-mono text-meta uppercase tracking-widest text-accent"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
