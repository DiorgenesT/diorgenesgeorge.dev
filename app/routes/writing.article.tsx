import { Link, useParams } from "react-router";
import { DocumentHeader } from "../components/document-header";
import { JsonLd } from "../components/json-ld";
import { Prose } from "../components/prose";
import { getArticle } from "../content/registry";
import { documentHref, localizedHref, tagHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { formatDate } from "../i18n/format";
import { useLocale } from "../i18n/use-locale";
import { breadcrumbJsonLd, techArticleJsonLd } from "../seo/jsonld";
import { articleMeta } from "../seo/route-meta";
import type { Route } from "./+types/writing.article";

export function meta({ location, params }: Route.MetaArgs) {
  return articleMeta(location.pathname, params.slug);
}

export default function Article() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getArticle(locale, slug) : undefined;

  if (!doc) throw new Response("Not Found", { status: 404 });

  const { Content, frontmatter } = doc;
  const t = getDictionary(locale);
  const path = documentHref("writing", locale, doc.slug);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd
        data={techArticleJsonLd({
          locale,
          path,
          title: frontmatter.title,
          description: frontmatter.answer,
          published: frontmatter.published,
          updated: frontmatter.updated,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t["nav.writing"], path: localizedHref("writing", locale) },
          { name: frontmatter.title, path },
        ])}
      />
      <DocumentHeader
        title={frontmatter.title}
        answer={frontmatter.answer}
        meta={[formatDate(locale, frontmatter.published)]}
      />
      <Prose>
        <Content />
      </Prose>

      <ul className="mt-14 flex flex-wrap gap-3">
        {frontmatter.tags.map((tag) => (
          <li key={tag}>
            <Link
              to={tagHref(locale, tag)}
              className="font-mono text-xs uppercase tracking-widest text-accent"
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
