import { AnswerBlock } from "../components/answer-block";
import { FitaAdesiva } from "../components/fita-adesiva";
import { PapelRasgado } from "../components/papel-rasgado";
import { AUTHOR } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { CarimboDeRecepcao } from "./carimbo-de-recepcao";
import { useEdgeTelemetry } from "./telemetry";
import { useEnvironment } from "./use-environment";

export function Hero() {
  const t = getDictionary(useLocale());

  // env é null no servidor e na primeira pintura do cliente: é o que faz os dois
  // concordarem antes de qualquer decisão que dependa do browser.
  const env = useEnvironment();

  const telemetry = useEdgeTelemetry(env !== null);

  return (
    <section className="relative">
      {/* A fita é decoração e não carrega texto: o amarelo dá 1,58:1 sobre o papel. */}
      <span
        aria-hidden="true"
        className="absolute -left-10 -top-6 hidden h-7 w-36 bg-fita opacity-90 sm:block"
        style={{ transform: "rotate(-14deg)" }}
      />

      <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
        {t["home.masthead"]}
      </p>

      {/* O h1 é o elemento de LCP, e é por isso que ele não depende de nada que
          chegue depois: nem de fonte, que carrega em optional, nem de dado. */}
      <h1 className="mt-3 text-6xl leading-[0.92] text-balance sm:text-7xl lg:text-8xl">
        {AUTHOR.name}
      </h1>

      <PapelRasgado className="mt-4 h-3 w-full text-bg" />

      <div className="mt-8 max-w-2xl">
        <p className="font-sans text-2xl leading-snug text-fg-muted text-pretty">
          {t["home.taglineLead"]}
        </p>
        <p className="mt-3 font-sans text-2xl font-semibold leading-snug text-pretty">
          <FitaAdesiva indice={2}>{t["home.taglineAccent"]}</FitaAdesiva>
        </p>
      </div>

      <AnswerBlock>{t["home.answer"]}</AnswerBlock>

      <CarimboDeRecepcao state={telemetry} />
    </section>
  );
}
