import { AnswerBlock } from "../components/answer-block";
import { AUTHOR } from "../config/site";
import { CV, type CvPosition } from "../content/cv";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatMonth } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/cv";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.cv.title"] }];
}

/** A duração nunca é armazenada: sai das datas na renderização e nunca envelhece. */
function Period({ position, locale }: { position: CvPosition; locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <p className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
      <time dateTime={position.start}>{formatMonth(locale, position.start)}</time>
      {" — "}
      {position.end ? (
        <time dateTime={position.end}>{formatMonth(locale, position.end)}</time>
      ) : (
        t["cv.current"]
      )}
      {" · "}
      {position.location}
    </p>
  );
}

export default function Cv() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const cv = CV[locale];

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight text-balance">
        {AUTHOR.name}
      </h1>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-fg-subtle">
        {cv.headline}
      </p>
      <AnswerBlock>{cv.summary}</AnswerBlock>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t["cv.experience"]}
        </h2>
        {cv.positions.map((position) => (
          <article key={`${position.org}-${position.start}`} className="mt-10">
            <h3 className="text-lg font-semibold">{position.role}</h3>
            <p className="mt-1 text-fg-muted">{position.org}</p>
            <Period position={position} locale={locale} />
            <ul className="mt-4 list-disc space-y-2 ps-6 text-fg-muted">
              {position.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t["cv.education"]}
        </h2>
        {cv.education.map((entry) => (
          <article key={entry.degree} className="mt-8">
            <h3 className="text-lg font-semibold">{entry.degree}</h3>
            <p className="mt-1 text-fg-muted">{entry.org}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
              <time dateTime={entry.start}>
                {formatMonth(locale, entry.start)}
              </time>
              {" — "}
              <time dateTime={entry.end}>{formatMonth(locale, entry.end)}</time>
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">{t["cv.skills"]}</h2>
        <dl className="mt-8 space-y-6">
          {cv.skills.map((group) => (
            <div key={group.group}>
              <dt className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
                {group.group}
              </dt>
              <dd className="mt-2 text-fg-muted">{group.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
