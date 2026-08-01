import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES } from "./config";
import { getDictionary } from "./dictionary";

/** O tipo Dictionary já garante o conjunto de chaves em compilação; aqui vale a paridade entre idiomas. */
const referenceKeys = Object.keys(getDictionary(DEFAULT_LOCALE)).sort();

describe("getDictionary", () => {
  it.each(LOCALES)("should define exactly the same keys for %s", (locale) => {
    expect(Object.keys(getDictionary(locale)).sort()).toEqual(referenceKeys);
  });

  it.each(LOCALES)("should leave no empty string in %s", (locale) => {
    const empty = Object.entries(getDictionary(locale))
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);

    expect(empty).toEqual([]);
  });

  it("should use distinct wording for pt-BR and en-US", () => {
    expect(getDictionary("pt-BR")["nav.colophon"]).not.toBe(
      getDictionary("en-US")["nav.colophon"],
    );
  });
});
