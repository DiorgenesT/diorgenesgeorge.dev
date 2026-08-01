import { useParams } from "react-router";
import { DocumentHeader } from "../components/document-header";
import { Prose } from "../components/prose";
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
      <DocumentHeader
        title={frontmatter.title}
        answer={frontmatter.answer}
        meta={[frontmatter.org, frontmatter.role, frontmatter.period]}
      />
      <Prose>
        <Content />
      </Prose>

      <p className="mt-14 font-mono text-xs uppercase tracking-widest text-fg-subtle">
        {frontmatter.stack.join(" · ")}
      </p>
    </main>
  );
}
