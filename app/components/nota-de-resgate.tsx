import { obterJitter, obterRotacao } from "../design/rotacao";

/**
 * Letras recortadas de revista, uma a uma. O texto real vive no `aria-label`: sem isso,
 * um leitor de tela soletraria a palavra letra por letra, porque cada uma e um elemento.
 */
export function NotaDeResgate({ texto }: { texto: string }) {
  return (
    <span role="img" aria-label={texto} className="inline-flex gap-1">
      {[...texto].map((letra, indice) => {
        if (letra.trim() === "") {
          return (
            <span
              key={`espaco-${indice}`}
              aria-hidden="true"
              className="inline-block w-2"
            />
          );
        }

        const jitter = obterJitter(indice);

        return (
          <span
            key={`${letra}-${indice}`}
            aria-hidden="true"
            className="inline-block bg-fg px-1.5 font-black text-bg"
            style={{
              transform: `rotate(${obterRotacao(indice)}deg) translate(${jitter.x}px, ${jitter.y}px)`,
            }}
          >
            {letra}
          </span>
        );
      })}
    </span>
  );
}
