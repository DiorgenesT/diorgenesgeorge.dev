import { AnswerBlock } from "./answer-block";

/**
 * Abre todo case e todo artigo. O `font-sans` que estava aqui sobrescrevia a display
 * que o h1 herda da camada base, e era por isso que trinta páginas de conteúdo abriam
 * com título na fonte do sistema enquanto a capa abria em display.
 *
 * Os metadados subiram para cima do título e viraram rótulo técnico entre dois fios:
 * numa página impressa a procedência vem antes do texto, não depois.
 */
export function DocumentHeader({
  title,
  answer,
  meta,
}: {
  title: string;
  answer: string;
  meta?: string[];
}) {
  return (
    <header>
      {meta && meta.length > 0 && (
        <p className="border-y border-hairline py-3 font-mono text-meta uppercase tracking-widest text-fg-subtle">
          {meta.join(" · ")}
        </p>
      )}

      <h1 className="mt-8 text-4xl leading-[1.05] text-balance sm:text-5xl">
        {title}
      </h1>

      <AnswerBlock>{answer}</AnswerBlock>
    </header>
  );
}
