import { Link, useParams } from "react-router";
import { DocumentHeader } from "../components/document-header";
import { Prose } from "../components/prose";
import { getArticle } from "../content/registry";
import { tagHref } from "../i18n/config";
import { formatDate } from "../i18n/format";
import { useLocale } from "../i18n/use-locale";

export default function Article() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getArticle(locale, slug) : undefined;

  if (!doc) throw new Response("Not Found", { status: 404 });

  const { Content, frontmatter } = doc;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
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
