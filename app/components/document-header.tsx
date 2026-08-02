import { AnswerBlock } from "./answer-block";

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
      <h1 className="font-sans text-4xl font-bold tracking-tight text-balance">
        {title}
      </h1>

      {meta && meta.length > 0 && (
        <p className="mt-4 font-mono text-meta uppercase tracking-widest text-fg-subtle">
          {meta.join(" · ")}
        </p>
      )}

      <AnswerBlock>{answer}</AnswerBlock>
    </header>
  );
}
