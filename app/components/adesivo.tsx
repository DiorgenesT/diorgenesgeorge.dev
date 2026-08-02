import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Recorte colado na pagina. A sombra e dura e sem desfoque de proposito: sombra suave
 * pertence a interface de aplicativo, sombra dura pertence a papel sobre papel.
 */
export function Adesivo({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block border-2 border-fg bg-bg-raised px-3 py-1 font-semibold shadow-[3px_3px_0_var(--fg)]"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
