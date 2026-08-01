import { describe, expect, it } from "vitest";
import { AUTHOR } from "../config/site";
import { LOCALES } from "../i18n/config";
import {
  breadcrumbJsonLd,
  caseJsonLd,
  personJsonLd,
  serializeJsonLd,
  serviceJsonLd,
  techArticleJsonLd,
  webSiteJsonLd,
} from "./jsonld";

describe("serializeJsonLd", () => {
  it("should escape a closing script tag inside content", () => {
    const output = serializeJsonLd({ name: "</script><img onerror=alert(1)>" });

    expect(output).not.toContain("</script>");
  });

  it("should still produce parseable json", () => {
    const output = serializeJsonLd({ name: "a < b" });

    expect(JSON.parse(output)).toEqual({ name: "a < b" });
  });
});

describe("personJsonLd", () => {
  it.each(LOCALES)("should carry the name variants in %s", (locale) => {
    expect(personJsonLd(locale).alternateName).toContain("Diorgenes Tavares");
  });

  it("should point sameAs at every declared profile", () => {
    expect(personJsonLd("pt-BR").sameAs).toContain(AUTHOR.linkedin);
    expect(personJsonLd("pt-BR").sameAs).toContain(AUTHOR.github);
    expect(personJsonLd("pt-BR").sameAs).toContain(AUTHOR.instagram);
  });

  it("should declare the legal name separately from the display name", () => {
    expect(personJsonLd("pt-BR").legalName).toBe(
      "Diorgenes George Tavares Silva",
    );
  });

  it("should locate the person in the city that matters to the work", () => {
    expect(personJsonLd("pt-BR").address.addressLocality).toBe("Betim");
  });

  it("should derive knowsAbout from the cv instead of repeating a list", () => {
    expect(personJsonLd("en-US").knowsAbout).toContain("TypeScript");
  });
});

describe("webSiteJsonLd", () => {
  it("should reference the person as publisher by id", () => {
    expect(webSiteJsonLd("pt-BR", "/pt-br/").publisher).toEqual({
      "@id": "https://diorgenesgeorge.dev/#person",
    });
  });
});

describe("breadcrumbJsonLd", () => {
  it("should number positions starting at one", () => {
    const crumb = breadcrumbJsonLd([
      { name: "Trabalho", path: "/pt-br/trabalho/" },
      { name: "Central", path: "/pt-br/trabalho/central/" },
    ]);

    expect(crumb.itemListElement[0]?.position).toBe(1);
  });

  it("should use absolute urls", () => {
    const crumb = breadcrumbJsonLd([{ name: "Trabalho", path: "/pt-br/trabalho/" }]);

    expect(crumb.itemListElement[0]?.item).toBe(
      "https://diorgenesgeorge.dev/pt-br/trabalho/",
    );
  });
});

describe("techArticleJsonLd", () => {
  const input = {
    locale: "pt-BR" as const,
    path: "/pt-br/escritos/numero-sem-dono/",
    title: "Número sem dono",
    description: "Descrição",
    published: "2026-08-01",
    updated: "2026-08-02",
  };

  it("should separate publication from modification", () => {
    expect(techArticleJsonLd(input).datePublished).toBe("2026-08-01");
    expect(techArticleJsonLd(input).dateModified).toBe("2026-08-02");
  });

  it("should fall back to the update date when there is no publication date", () => {
    const { published: _published, ...withoutPublished } = input;

    expect(techArticleJsonLd(withoutPublished).datePublished).toBe("2026-08-02");
  });

  it("should declare the language of the document", () => {
    expect(techArticleJsonLd(input).inLanguage).toBe("pt-BR");
  });
});

describe("caseJsonLd", () => {
  it("should describe the system as the subject, not as source code", () => {
    const data = caseJsonLd({
      locale: "en-US",
      path: "/en/work/central/",
      title: "Central",
      description: "Descrição",
      updated: "2026-08-01",
      system: "Central",
    });

    expect(data.about["@type"]).toBe("SoftwareApplication");
  });
});

describe("serviceJsonLd", () => {
  it("should point the provider at the person", () => {
    expect(serviceJsonLd("pt-BR", "/pt-br/servicos/", "d").provider).toEqual({
      "@id": "https://diorgenesgeorge.dev/#person",
    });
  });

  it("should never fabricate a rating or a review", () => {
    const data = JSON.stringify(serviceJsonLd("pt-BR", "/pt-br/servicos/", "d"));

    expect(data).not.toMatch(/aggregateRating|review/i);
  });
});
