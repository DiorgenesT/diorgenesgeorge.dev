import { Carimbo } from "../components/carimbo";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { textoDoCarimbo } from "./carimbo-texto";
import type { TelemetryState } from "./telemetry";

/**
 * O elemento vivo da capa: a página carimba de onde a cópia veio, como uma marca postal.
 *
 * `min-h` no invólucro é o que separa esta implementação de um salto de layout. O dado
 * só existe depois que o cliente busca /api/edge, então o espaço é reservado desde o
 * servidor e o carimbo cai dentro dele. Sem isso, todo visitante veria a página pular
 * uma vez, e o CLS medido seria o dobro do orçamento.
 *
 * Falha é silêncio: sem dado, o invólucro fica vazio e ninguém percebe que houve
 * medição. Melhor um carimbo ausente do que um carimbo pela metade.
 */
export function CarimboDeRecepcao({ state }: { state: TelemetryState }) {
  const locale = useLocale();
  const t = getDictionary(locale);
  const carimbo = textoDoCarimbo(state, locale, t);

  return (
    <div
      data-carimbo
      aria-live="polite"
      className="mt-10 flex min-h-36 items-start"
    >
      {carimbo === null ? null : (
        <div className="flex flex-col gap-3">
          <Carimbo indice={7}>
            {carimbo.titulo === null ? null : (
              <span className="block normal-case tracking-normal">
                {carimbo.titulo}
              </span>
            )}
            {carimbo.linhas.map((linha) => (
              <span key={linha} className="block">
                {linha}
              </span>
            ))}
          </Carimbo>
          <p className="max-w-xs font-mono text-meta text-fg-subtle">
            {t["hero.privacy"]}
          </p>
        </div>
      )}
    </div>
  );
}
