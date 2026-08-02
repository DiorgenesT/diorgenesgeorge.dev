import { Link, useParams } from "react-router";
import { listArticlesByTag } from "../content/registry";
import { documentHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatDate } from "../i18n/format";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/writing.tag";

export function meta({ location, params }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [
    { title: `${t["writing.tagHeading"]} ${params.tag} — ${t["nav.writing"]}` },
    // Arquivo por tag é conteúdo fino: não deve competir com o artigo no índice do buscador.
    { name: "robots", content: "noindex,follow" },
  ];
}

export default function Tag() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const { tag } = useParams();
  const articles = tag ? listArticlesByTag(locale, tag) : [];

  if (!tag || articles.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl leading-tight sm:text-5xl">
        {t["writing.tagHeading"]} {tag}
      </h1>

      <ul className="mt-14">
        {articles.map(({ slug, frontmatter }) => (
          <li key={slug} className="border-t border-hairline last:border-b">
            <article className="group relative grid gap-x-6 py-6 sm:grid-cols-[9rem_1fr]">
              <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
                <time dateTime={frontmatter.published}>
                  {formatDate(locale, frontmatter.published)}
                </time>
              </p>
              <h2 className="text-xl leading-tight">
                <Link
                  to={documentHref("writing", locale, slug)}
                  viewTransition
                  className="after:absolute after:inset-0 group-hover:text-accent"
                >
                  {frontmatter.title}
                </Link>
              </h2>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
