import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { getDictionary } from "./dictionary";

const REQUIRED_KEYS = [
  "nav.home",
  "nav.colophon",
  "a11y.skipToContent",
  "theme.toggle",
  "theme.dark",
  "theme.light",
  "locale.label",
  "footer.builtWith",
] as const;

describe("getDictionary", () => {
  it.each(LOCALES)("should define every required key for %s", (locale) => {
    const dict = getDictionary(locale);
    for (const key of REQUIRED_KEYS) {
      expect(dict[key], `chave ausente em ${locale}: ${key}`).toBeTruthy();
    }
  });

  it.each(LOCALES)("should not define extra keys for %s", (locale) => {
    expect(Object.keys(getDictionary(locale)).sort()).toEqual(
      [...REQUIRED_KEYS].sort(),
    );
  });

  it("should use distinct wording for pt-BR and en-US", () => {
    expect(getDictionary("pt-BR")["nav.colophon"]).not.toBe(
      getDictionary("en-US")["nav.colophon"],
    );
  });
});
