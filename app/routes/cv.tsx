import { AnswerBlock } from "../components/answer-block";
import { AUTHOR } from "../config/site";
import { CV, type CvPosition } from "../content/cv";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatMonth } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { staticPageMeta } from "../seo/route-meta";
import type { Route } from "./+types/cv";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return staticPageMeta(
    location.pathname,
    "cv",
    t["meta.cv.title"],
    CV[localeFromPathname(location.pathname)].summary,
  );
}

/** A duração nunca é armazenada: sai das datas na renderização e nunca envelhece. */
function Period({
  position,
  locale,
}: {
  position: CvPosition;
  locale: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
      <time dateTime={position.start}>
        {formatMonth(locale, position.start)}
      </time>
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
      <h1 className="text-4xl leading-tight text-balance sm:text-5xl">
        {AUTHOR.name}
      </h1>
      <p className="mt-4 font-mono text-meta uppercase tracking-widest text-fg-subtle">
        {cv.headline}
      </p>
      <AnswerBlock>{cv.summary}</AnswerBlock>

      <section className="mt-20">
        <h2 className="border-b-2 border-fg pb-3 font-mono text-meta uppercase tracking-widest text-fg">
          {t["cv.experience"]}
        </h2>
        {cv.positions.map((position) => (
          <article
            key={`${position.org}-${position.start}`}
            className="grid gap-x-8 border-b border-hairline py-8 sm:grid-cols-[11rem_1fr]"
          >
            {/* O periodo na coluna da margem: numa ficha impressa a data ancora a
                leitura, e o cargo fica livre para ocupar a largura do texto. */}
            <div>
              <Period position={position} locale={locale} />
            </div>

            <div>
              <h3 className="text-xl leading-tight">{position.role}</h3>
              <p className="mt-1 text-fg-muted">{position.org}</p>
              <ul className="mt-4 list-disc space-y-2 ps-6 text-fg-muted">
                {position.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="border-b-2 border-fg pb-3 font-mono text-meta uppercase tracking-widest text-fg">
          {t["cv.education"]}
        </h2>
        {cv.education.map((entry) => (
          <article
            key={entry.degree}
            className="grid gap-x-8 border-b border-hairline py-8 sm:grid-cols-[11rem_1fr]"
          >
            <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
              <time dateTime={entry.start}>
                {formatMonth(locale, entry.start)}
              </time>
              {" — "}
              <time dateTime={entry.end}>{formatMonth(locale, entry.end)}</time>
            </p>

            <div>
              <h3 className="text-xl leading-tight">{entry.degree}</h3>
              <p className="mt-1 text-fg-muted">{entry.org}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="border-b-2 border-fg pb-3 font-mono text-meta uppercase tracking-widest text-fg">
          {t["cv.skills"]}
        </h2>
        <dl>
          {cv.skills.map((group) => (
            <div
              key={group.group}
              className="grid gap-x-8 border-b border-hairline py-6 sm:grid-cols-[11rem_1fr]"
            >
              <dt className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
                {group.group}
              </dt>
              <dd className="text-fg-muted">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
