import { AUTHOR, SAME_AS, SITE_URL } from "../config/site";
import { CV } from "../content/cv";
import type { Locale } from "../i18n/config";
import { absoluteUrl } from "./meta";

/** Fecha a porta para conteúdo que contenha </script> e escape do data block. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: AUTHOR.name,
    legalName: AUTHOR.legalName,
    // Desambiguação de entidade: diz ao buscador que estas buscas são a mesma pessoa.
    alternateName: [...AUTHOR.alternateNames],
    givenName: AUTHOR.givenName,
    familyName: AUTHOR.familyName,
    jobTitle: CV[locale].headline,
    description: CV[locale].summary,
    url: SITE_URL,
    sameAs: [...SAME_AS],
    address: {
      "@type": "PostalAddress",
      addressLocality: AUTHOR.city,
      addressRegion: AUTHOR.region,
      addressCountry: AUTHOR.country,
    },
    worksFor: { "@type": "Organization", name: "Fundação Beta" },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: CV[locale].education[0]?.org ?? "",
    },
    knowsAbout: CV[locale].skills.flatMap((group) => group.items),
  };
}

export function webSiteJsonLd(locale: Locale, homePath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: absoluteUrl(homePath),
    name: AUTHOR.name,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

export function profilePageJsonLd(locale: Locale, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(path),
    inLanguage: locale,
    mainEntity: { "@id": `${SITE_URL}/#person` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

type ArticleInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  published?: string;
  updated: string;
};

export function techArticleJsonLd(input: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.title,
    description: input.description,
    datePublished: input.published ?? input.updated,
    dateModified: input.updated,
    inLanguage: input.locale,
    author: { "@id": `${SITE_URL}/#person` },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

/**
 * Case é artigo técnico sobre um sistema, e não código-fonte: sem repositório público,
 * declarar SoftwareSourceCode seria marcação vazia. O sistema entra como `about`.
 */
export function caseJsonLd(input: ArticleInput & { system: string }) {
  return {
    ...techArticleJsonLd(input),
    about: {
      "@type": "SoftwareApplication",
      name: input.system,
      applicationCategory: "BusinessApplication",
    },
  };
}

export function serviceJsonLd(locale: Locale, path: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: CV[locale].headline,
    description,
    url: absoluteUrl(path),
    areaServed: AUTHOR.country,
    provider: { "@id": `${SITE_URL}/#person` },
  };
}
