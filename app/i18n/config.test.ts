import { describe, expect, it } from "vitest";
import {
  LOCALES,
  LOCALE_SEGMENTS,
  SEGMENT_TO_LOCALE,
  localizedHref,
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
