import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/config";
import { getPage, translationsOf } from "./registry";

describe("páginas", () => {
  it.each(LOCALES)("should carry the colophon in %s", (locale) => {
    expect(getPage(locale, "colophon")?.frontmatter.title).toBeTruthy();
  });

  it("should link the three colophons by their translation key", () => {
    expect(Object.keys(translationsOf("page", "colofao")).sort()).toEqual(
      [...LOCALES].sort(),
    );
  });

  it("should keep each locale wording distinct", () => {
    expect(getPage("pt-BR", "colophon")?.frontmatter.title).not.toBe(
      getPage("en-US", "colophon")?.frontmatter.title,
    );
  });
});

