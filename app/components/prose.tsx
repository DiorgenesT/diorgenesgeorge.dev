import type { ReactNode } from "react";

/**
 * O markdown não carrega classe nenhuma, então o estilo mora aqui, num lugar só.
 * Propriedades lógicas em vez de left/right para o layout sobreviver a um idioma RTL.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        mt-12 max-w-prose text-fg-muted
        [&_h2]:mt-14 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg
        [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg
        [&_p]:mt-5 [&_p]:leading-relaxed
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6
        [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6
        [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
        [&_code]:font-mono [&_code]:text-sm [&_code]:text-fg
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-bg-raised [&_pre]:p-4
        [&_blockquote]:mt-6 [&_blockquote]:border-s-2 [&_blockquote]:border-hairline [&_blockquote]:ps-5 [&_blockquote]:italic
        [&_table]:mt-6 [&_table]:w-full [&_table]:text-sm
        [&_th]:border-b [&_th]:border-hairline [&_th]:py-2 [&_th]:text-start [&_th]:text-fg
        [&_td]:border-b [&_td]:border-hairline [&_td]:py-2 [&_td]:align-top
        [&_strong]:font-semibold [&_strong]:text-fg
      "
    >
      {children}
    </div>
  );
}
