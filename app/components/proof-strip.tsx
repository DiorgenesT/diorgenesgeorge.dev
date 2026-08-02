import { Link } from "react-router";
import { listCaseIndex } from "../content/index";
import { obterRotacao } from "../design/rotacao";
import { documentHref, type Locale } from "../i18n/config";
import { PapelRasgado } from "./papel-rasgado";

/**
 * Regra 1 do spec virando código: o número não é afirmação da home, é resumo de um case
 * que explica de onde ele vem. Case em rascunho não aparece, então nenhum número fica órfão.
 */
export function ProofStrip({ locale }: { locale: Locale }) {
  const proofs = listCaseIndex(locale).flatMap((doc) =>
    doc.frontmatter.proof ? [{ slug: doc.slug, ...doc.frontmatter.proof }] : [],
  );

  if (proofs.length === 0) return null;

  return (
    <div className="mt-20">
      <PapelRasgado className="h-3 w-full rotate-180 text-bg" />
      <ul className="grid gap-8 border-y-2 border-fg bg-bg-raised px-6 py-10 sm:grid-cols-3">
        {proofs.map((proof, indice) => (
          <li
            key={proof.slug}
            style={{ transform: `rotate(${obterRotacao(indice + 3)}deg)` }}
          >
            <Link
              to={documentHref("work", locale, proof.slug)}
              viewTransition
              className="group block"
            >
              <span className="block font-display text-6xl leading-none text-accent">
                {proof.value}
              </span>
              <span className="mt-3 block text-sm text-fg-muted group-hover:text-fg">
                {proof.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <PapelRasgado className="h-3 w-full text-bg" />
    </div>
  );
}
