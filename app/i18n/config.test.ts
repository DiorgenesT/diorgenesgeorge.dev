import { describe, expect, it } from "vitest";
import {
  LOCALES,
  LOCALE_SEGMENTS,
  ROUTE_PATHS,
  SEGMENT_TO_LOCALE,
  documentHref,
  localizedHref,
  tagHref,
} from "./config";

describe("configuração de locales", () => {
  it("should expose exactly the three supported locales", () => {
    expect(LOCALES).toEqual(["pt-BR", "pt-PT", "en-US"]);
  });

  it("should map each locale to its url segment", () => {
    expect(LOCALE_SEGMENTS).toEqual({
      "pt-BR": "pt-br",
      "pt-PT": "pt-pt",
      "en-US": "en",
    });
  });

  it("should invert the segment map without losing any locale", () => {
    expect(SEGMENT_TO_LOCALE).toEqual({
      "pt-br": "pt-BR",
      "pt-pt": "pt-PT",
      en: "en-US",
    });
  });
});

describe("localizedHref", () => {
  it("should return the locale root for the home route", () => {
    expect(localizedHref("home", "pt-BR")).toBe("/pt-br/");
  });

  it("should use the portuguese slug for the colophon in pt-BR", () => {
    expect(localizedHref("colophon", "pt-BR")).toBe("/pt-br/colofao/");
  });

  it("should use the english slug for the colophon in en-US", () => {
    expect(localizedHref("colophon", "en-US")).toBe("/en/colophon/");
  });

  it("should use the portuguese slug for the colophon in pt-PT", () => {
    expect(localizedHref("colophon", "pt-PT")).toBe("/pt-pt/colofao/");
  });
});

describe("documentHref", () => {
  it("should build a case url under the localized work segment", () => {
    expect(documentHref("work", "pt-BR", "central")).toBe(
      "/pt-br/trabalho/central/",
    );
  });

  it("should build an article url in english", () => {
    expect(documentHref("writing", "en-US", "word-not-pdf")).toBe(
      "/en/writing/word-not-pdf/",
    );
  });
});

describe("tagHref", () => {
  it("should use the portuguese segment in pt-PT", () => {
    expect(tagHref("pt-PT", "cloudflare")).toBe(
      "/pt-pt/escritos/etiqueta/cloudflare/",
    );
  });

  it("should use tag in pt-BR, which is the word people search", () => {
    expect(tagHref("pt-BR", "dados")).toBe("/pt-br/escritos/tag/dados/");
  });
});

describe("ROUTE_PATHS", () => {
  it("should give every route a slug in every locale", () => {
    const missing = Object.entries(ROUTE_PATHS).flatMap(([key, byLocale]) =>
      LOCALES.filter((locale) => byLocale[locale] === undefined).map(
        (locale) => `${key}:${locale}`,
      ),
    );

    expect(missing).toEqual([]);
  });

  it("should use the european portuguese spelling for contact", () => {
    expect(ROUTE_PATHS.contact["pt-PT"]).toBe("contacto");
  });
});
