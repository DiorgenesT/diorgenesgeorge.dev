import { AUTHOR, SITE_URL } from "../config/site";
import type { Doc } from "../content/registry";
import type { ArticleFrontmatter } from "../content/schema";
import { documentHref, type Locale } from "../i18n/config";
import { absoluteUrl } from "./meta";
import { escapeXml } from "./sitemap";

function itemUrl(locale: Locale, slug: string): string {
  return absoluteUrl(documentHref("writing", locale, slug));
}

function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

/** Sem corpo completo no feed: o objetivo é levar a leitura para o site. */
export function renderRss(
  locale: Locale,
  title: string,
  selfPath: string,
  docs: Doc<ArticleFrontmatter>[],
): string {
  const items = docs
    .map((doc) =>
      [
        "    <item>",
        `      <title>${escapeXml(doc.frontmatter.title)}</title>`,
        `      <link>${escapeXml(itemUrl(locale, doc.slug))}</link>`,
        `      <guid isPermaLink="true">${escapeXml(itemUrl(locale, doc.slug))}</guid>`,
        `      <pubDate>${rfc822(doc.frontmatter.published)}</pubDate>`,
        `      <description>${escapeXml(doc.frontmatter.answer)}</description>`,
        "    </item>",
      ].join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <atom:link href="${escapeXml(absoluteUrl(selfPath))}" rel="self" type="application/rss+xml"/>
    <language>${locale}</language>
    <description>${escapeXml(title)}</description>
${items}
  </channel>
</rss>
`;
}

export function renderJsonFeed(
  locale: Locale,
  title: string,
  selfPath: string,
  docs: Doc<ArticleFrontmatter>[],
): string {
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title,
      home_page_url: SITE_URL,
      feed_url: absoluteUrl(selfPath),
      language: locale,
      authors: [{ name: AUTHOR.name, url: SITE_URL }],
      items: docs.map((doc) => ({
        id: itemUrl(locale, doc.slug),
        url: itemUrl(locale, doc.slug),
        title: doc.frontmatter.title,
        summary: doc.frontmatter.answer,
        date_published: `${doc.frontmatter.published}T00:00:00Z`,
        date_modified: `${doc.frontmatter.updated}T00:00:00Z`,
        tags: doc.frontmatter.tags,
      })),
    },
    null,
    2,
  );
}
