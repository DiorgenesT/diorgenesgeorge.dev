import { describe, expect, it } from "vitest";
import { listCases } from "../content/registry";
import { LOCALES } from "../i18n/config";

describe("prova da home", () => {
  it.each(LOCALES)(
    "should only expose proof numbers from published cases in %s",
    (locale) => {
      const withProof = listCases(locale).filter(
        (doc) => doc.frontmatter.proof,
      );

      // Case em rascunho não é listado, então nenhum número da home fica sem página de origem.
      expect(
        withProof.every((doc) => doc.frontmatter.status === "publicado"),
      ).toBe(true);
    },
  );

  it.each(LOCALES)("should give every proof a case slug to link to in %s", (locale) => {
    const orphans = listCases(locale)
      .filter((doc) => doc.frontmatter.proof)
      .filter((doc) => doc.slug.length === 0);

    expect(orphans).toEqual([]);
  });
});
