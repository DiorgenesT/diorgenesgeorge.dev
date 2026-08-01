import { absoluteUrl } from "./meta";
import type { IndexableUrl } from "./urls";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Cada URL declara as traduções que existem, e só elas: alternate para página ausente é erro de SEO. */
export function renderSitemap(urls: IndexableUrl[]): string {
  const entries = urls
    .map((url) => {
      const alternates = Object.entries(url.translations)
        .map(
          ([locale, path]) =>
            `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(
              absoluteUrl(path),
            )}"/>`,
        )
        .join("\n");

      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(url.path))}</loc>`,
        `    <lastmod>${url.lastmod}</lastmod>`,
        alternates,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}
