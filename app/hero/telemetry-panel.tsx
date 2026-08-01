import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { describeState, noteFor } from "./describe-state";
import type { TelemetryState } from "./telemetry";

export function TelemetryPanel({ state }: { state: TelemetryState }) {
  const locale = useLocale();
  const t = getDictionary(locale);
  const rows = describeState(state, locale, t);

  return (
    <div className="font-mono text-xs">
      <dl
        aria-live="polite"
        aria-busy={state.status === "loading"}
        className="grid gap-x-6 gap-y-3 sm:grid-cols-2"
      >
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="uppercase tracking-widest text-fg-subtle">
              {row.label}
            </dt>
            {/* tabular-nums para o número não empurrar a linha ao trocar de valor. */}
            <dd className="tabular-nums text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-fg-subtle">{noteFor(state, t)}</p>
    </div>
  );
}
