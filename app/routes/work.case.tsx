import { useParams } from "react-router";
import { DocumentHeader } from "../components/document-header";
import { JsonLd } from "../components/json-ld";
import { Prose } from "../components/prose";
import { getCase } from "../content/registry";
import { documentHref, localizedHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { breadcrumbJsonLd, caseJsonLd } from "../seo/jsonld";
import { caseMeta } from "../seo/route-meta";
import type { Route } from "./+types/work.case";

export function meta({ location, params }: Route.MetaArgs) {
  return caseMeta(location.pathname, params.slug);
}

export default function WorkCase() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getCase(locale, slug) : undefined;

  if (!doc) throw new Response("Not Found", { status: 404 });

  const { Content, frontmatter } = doc;
  const t = getDictionary(locale);
  const path = documentHref("work", locale, doc.slug);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <JsonLd
        data={caseJsonLd({
          locale,
          path,
          title: frontmatter.title,
          description: frontmatter.answer,
          updated: frontmatter.updated,
          system: frontmatter.title,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t["nav.work"], path: localizedHref("work", locale) },
          { name: frontmatter.title, path },
        ])}
      />
      <DocumentHeader
        title={frontmatter.title}
        answer={frontmatter.answer}
        meta={[frontmatter.org, frontmatter.role, frontmatter.period]}
      />
      <Prose>
        <Content />
      </Prose>

      <p className="mt-14 font-mono text-meta uppercase tracking-widest text-fg-subtle">
        {frontmatter.stack.join(" · ")}
      </p>
    </main>
  );
}
