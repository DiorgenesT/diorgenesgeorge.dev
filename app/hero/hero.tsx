import { AnswerBlock } from "../components/answer-block";
import { AUTHOR } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { TelemetryPanel } from "./telemetry-panel";
import { useEdgeTelemetry } from "./telemetry";
import { useEnvironment } from "./use-environment";

export function Hero() {
  const t = getDictionary(useLocale());

  // env é null no servidor e na primeira pintura do cliente: é o que faz os dois
  // concordarem antes de qualquer decisão que dependa do browser.
  const env = useEnvironment();

  const telemetry = useEdgeTelemetry(env !== null);

  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          {AUTHOR.name}
        </h1>

        {/* Ênfase por peso e cor na mesma família. Trocar de família tipográfica no
            meio da frase é o tique que mais denuncia página montada por máquina. */}
        <p className="mt-6 max-w-2xl text-2xl leading-snug text-fg-muted text-pretty">
          {t["home.taglineLead"]}
        </p>
        {/* Linha própria: inline, a ênfase começava no meio da linha e órfãos de uma
            letra apareciam antes dela. */}
        <p className="mt-2 max-w-2xl text-2xl font-semibold leading-snug text-fg text-pretty">
          {t["home.taglineAccent"]}
        </p>

        <AnswerBlock>{t["home.answer"]}</AnswerBlock>
      </div>

      {/* O painel fica. A Fase 2 troca esta lista por um carimbo de recepção,
          alimentado pelo mesmo /api/edge. */}
      <TelemetryPanel state={telemetry} />
    </section>
  );
}
