import { describe, expect, it } from "vitest";
import { articleSchema, caseSchema, parseFileName } from "./schema";

const validCase = {
  title: "Consolidar 44 painéis sem migrar um banco",
  answer:
    "Quarenta e quatro painéis independentes viraram um hub com login único, sem mover nenhum banco de dados. A consolidação foi feita por script e ficou reversível, porque os dados vivem na plataforma por identificador e mover o código não os toca.",
  translationKey: "central",
  status: "rascunho",
  updated: "2026-08-01",
  org: "Fundação Beta",
  role: "Desenvolvedor full stack",
  period: "2026",
  stack: ["Next.js", "Cloudflare Workers", "D1", "Supabase"],
  outcome:
    "Um login em vez de uma senha compartilhada por painel, e um deploy em vez de dezenas.",
  order: 1,
};

describe("caseSchema", () => {
  it("should accept a complete case frontmatter", () => {
    expect(caseSchema.parse(validCase).translationKey).toBe("central");
  });

  it("should reject an answer block too short to stand on its own", () => {
    const result = caseSchema.safeParse({
      ...validCase,
      answer: "Consolidei painéis.",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a status outside the two known values", () => {
    const result = caseSchema.safeParse({ ...validCase, status: "publicada" });

    expect(result.success).toBe(false);
  });

  it("should reject a translation key that cannot be part of a URL", () => {
    const result = caseSchema.safeParse({
      ...validCase,
      translationKey: "Central Betim",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a date that is not a calendar date", () => {
    const result = caseSchema.safeParse({ ...validCase, updated: "01/08/2026" });

    expect(result.success).toBe(false);
  });

  it("should accept an optional proof number for the home", () => {
    const result = caseSchema.parse({
      ...validCase,
      proof: { value: "44", label: "painéis consolidados em um hub" },
    });

    expect(result.proof?.value).toBe("44");
  });
});

describe("articleSchema", () => {
  const validArticle = {
    title: "Número sem dono não entra em painel de gestão",
    answer: validCase.answer,
    translationKey: "numero-sem-dono",
    status: "rascunho",
    updated: "2026-08-01",
    published: "2026-08-01",
    tags: ["dados"],
  };

  it("should accept a complete article frontmatter", () => {
    expect(articleSchema.parse(validArticle).tags).toEqual(["dados"]);
  });

  it("should require at least one tag", () => {
    const result = articleSchema.safeParse({ ...validArticle, tags: [] });

    expect(result.success).toBe(false);
  });

  it("should reject a tag that cannot be part of a URL", () => {
    const result = articleSchema.safeParse({
      ...validArticle,
      tags: ["Setor Público"],
    });

    expect(result.success).toBe(false);
  });
});

describe("parseFileName", () => {
  it("should split a localized slug from its locale", () => {
    expect(parseFileName("./cases/central.pt-BR.mdx")).toEqual({
      slug: "central",
      locale: "pt-BR",
    });
  });

  it("should return undefined for a locale the site does not serve", () => {
    expect(parseFileName("./cases/central.fr-FR.mdx")).toBeUndefined();
  });

  it("should return undefined when the locale suffix is missing", () => {
    expect(parseFileName("./cases/central.mdx")).toBeUndefined();
  });
});
