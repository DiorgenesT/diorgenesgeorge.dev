import type { MetadataRoute } from "next";
import { htmlLang, idiomas, SITE_URL } from "@/i18n/config";

// Gerado no build (export estático) como /sitemap.xml: uma URL por idioma, com as alternativas hreflang.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(idiomas.map((l) => [htmlLang[l], `${SITE_URL}/${l}/`]));
  return idiomas.map((lang) => ({
    url: `${SITE_URL}/${lang}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: lang === "en" ? 1 : 0.9,
    alternates: { languages },
  }));
}
