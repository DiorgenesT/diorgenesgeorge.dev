import { useParams } from "react-router";
import { getCase } from "../content/registry";
import { useLocale } from "../i18n/use-locale";

export default function WorkCase() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getCase(locale, slug) : undefined;

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
