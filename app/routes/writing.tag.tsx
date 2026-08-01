import { Link, useParams } from "react-router";
import { listArticlesByTag } from "../content/registry";
import { documentHref } from "../i18n/config";
import { useLocale } from "../i18n/use-locale";

export default function Tag() {
  const locale = useLocale();
  const { tag } = useParams();
  const articles = tag ? listArticlesByTag(locale, tag) : [];

  if (!tag || articles.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">{tag}</h1>
      <ul className="mt-10 space-y-4">
        {articles.map((doc) => (
          <li key={doc.slug}>
            <Link
              to={documentHref("writing", locale, doc.slug)}
              className="text-accent underline underline-offset-4"
            >
              {doc.frontmatter.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
