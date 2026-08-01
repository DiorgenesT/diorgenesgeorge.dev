import { useParams } from "react-router";
import { getArticle } from "../content/registry";
import { useLocale } from "../i18n/use-locale";

export default function Article() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getArticle(locale, slug) : undefined;

  if (!doc) throw new Response("Not Found", { status: 404 });

  const { Content, frontmatter } = doc;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {frontmatter.title}
      </h1>
      <Content />
    </main>
  );
}
