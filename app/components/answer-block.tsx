/**
 * O bloco de resposta direta do AEO: 2–3 frases autocontidas, compreensíveis fora da
 * página, que é o trecho que um assistente cita. Nas seções seguintes, prefira heading
 * redigido como pergunta quando soar natural — sem forçar onde o título afirmativo é
 * mais claro.
 */
export function AnswerBlock({ children }: { children: string }) {
  return (
    <p className="mt-8 border-s-2 border-accent ps-5 text-lg leading-relaxed text-fg">
      {children}
    </p>
  );
}
