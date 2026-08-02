import type { ReactNode } from "react";

/**
 * O markdown não carrega classe nenhuma, então o estilo mora aqui, num lugar só.
 * Propriedades lógicas em vez de left/right para o layout sobreviver a um idioma RTL.
 *
 * Cinco decisões carregam este bloco:
 *
 * 1. `h2` sem peso extra: ele já herda a display da camada base, e negrito sobre uma
 *    display pesada empasta.
 * 2. Código entre dois fios, sem arredondamento e sem caixa: ele pertence à coluna de
 *    texto, não flutua nela.
 * 3. Cabeçalho de tabela vira rótulo técnico sob régua grossa, que é o gesto de tabela
 *    de relatório impresso.
 * 4. Citação com fio de acento e sem itálico: impresso destaca por posição e por régua,
 *    nunca por inclinação de letra.
 * 5. O parágrafo não muda. Mesma família, mesmo tamanho, mesma entrelinha: as trinta
 *    páginas existem para serem lidas, e a identidade entra na moldura.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        mt-12 max-w-prose text-fg-muted
        [&_h2]:mt-16 [&_h2]:text-2xl [&_h2]:text-fg
        [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg
        [&_p]:mt-5 [&_p]:leading-relaxed
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6
        [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6
        [&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4
        [&_code]:font-mono [&_code]:text-meta [&_code]:text-fg
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:border-y [&_pre]:border-fg [&_pre]:bg-bg-raised [&_pre]:px-5 [&_pre]:py-4
        [&_blockquote]:mt-8 [&_blockquote]:border-s-2 [&_blockquote]:border-accent [&_blockquote]:ps-6 [&_blockquote]:text-lg [&_blockquote]:text-fg
        [&_table]:mt-8 [&_table]:w-full [&_table]:text-sm
        [&_th]:border-b-2 [&_th]:border-fg [&_th]:py-2 [&_th]:text-start [&_th]:font-mono [&_th]:text-meta [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-fg
        [&_td]:border-b [&_td]:border-hairline [&_td]:py-3 [&_td]:align-top
        [&_strong]:font-semibold [&_strong]:text-fg
      "
    >
      {children}
    </div>
  );
}
