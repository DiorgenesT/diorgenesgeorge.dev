import { describe, expect, it } from "vitest";
import { absoluteUrl, buildMeta } from "./meta";

const input = {
  locale: "pt-BR" as const,
  path: "/pt-br/sobre/",
  title: "Sobre",
  description:
    "Uma descrição com tamanho suficiente para servir de resumo em resultado de busca.",
  translations: { "pt-BR": "/pt-br/sobre/", "en-US": "/en/about/" },
};

const links = (rel: string, hrefLang?: string) =>
  buildMeta(input).filter(
    (tag) =>
      tag.rel === rel && (hrefLang === undefined || tag.hreflang === hrefLang),
  );

describe("absoluteUrl", () => {
  it("should prefix the canonical origin", () => {
    expect(absoluteUrl("/en/")).toBe("https://diorgenesgeorge.dev/en/");
  });
});

describe("buildMeta", () => {
  it("should emit an absolute canonical url", () => {
    expect(links("canonical")[0]).toMatchObject({
      href: "https://diorgenesgeorge.dev/pt-br/sobre/",
    });
  });

  it("should include the page itself among the alternates", () => {
    expect(links("alternate", "pt-BR")).toHaveLength(1);
  });

  it("should never point hreflang at a translation that does not exist", () => {
    expect(links("alternate", "pt-PT")).toHaveLength(0);
  });

  it("should send x-default to the english page", () => {
    expect(links("alternate", "x-default")[0]).toMatchObject({
      href: "https://diorgenesgeorge.dev/en/about/",
    });
  });

  it("should omit x-default when there is no english translation", () => {
    const tags = buildMeta({
      ...input,
      translations: { "pt-BR": "/pt-br/sobre/" },
    });

    expect(tags.filter((tag) => tag.hreflang === "x-default")).toHaveLength(0);
  });

  it("should mark a noindex page as such", () => {
    const tags = buildMeta({ ...input, noindex: true });

    expect(tags).toContainEqual({ name: "robots", content: "noindex,follow" });
  });

  it("should not mark an indexable page with a robots tag", () => {
    expect(buildMeta(input).some((tag) => tag.name === "robots")).toBe(false);
  });

  it("should carry the title into open graph", () => {
    expect(buildMeta(input)).toContainEqual({
      property: "og:title",
      content: "Sobre",
    });
  });

  it("should use the underscore form of the locale in open graph", () => {
    expect(buildMeta(input)).toContainEqual({
      property: "og:locale",
      content: "pt_BR",
    });
  });

  it("should declare an article as such", () => {
    const tags = buildMeta({ ...input, type: "article" });

    expect(tags).toContainEqual({ property: "og:type", content: "article" });
  });

  it("should never emit an og:image while none is generated", () => {
    // Imagem de OG é escopo da fase 4: apontar para arquivo inexistente é pior que não ter a tag.
    expect(buildMeta(input).some((tag) => tag.property === "og:image")).toBe(
      false,
    );
  });
});
