import { Link } from "react-router";
import { listCaseIndex } from "../content/index";
import { documentHref, type Locale } from "../i18n/config";

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
    <ul className="mt-20 grid gap-8 border-y border-hairline py-10 sm:grid-cols-3">
      {proofs.map((proof) => (
        <li key={proof.slug}>
          <Link
            to={documentHref("work", locale, proof.slug)}
            className="group block"
          >
            <span className="block font-mono text-4xl font-semibold text-accent">
              {proof.value}
            </span>
            <span className="mt-2 block text-sm text-fg-muted group-hover:text-fg">
              {proof.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
