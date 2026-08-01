import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./negotiate";

describe("negotiateLocale", () => {
  it("should return pt-BR when the browser asks for pt-BR explicitly", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt-BR");
  });

  it("should return pt-PT when the browser asks for pt-PT explicitly", () => {
    expect(negotiateLocale("pt-PT,pt;q=0.9,en;q=0.8")).toBe("pt-PT");
  });

  it("should return pt-BR for generic portuguese", () => {
    expect(negotiateLocale("pt")).toBe("pt-BR");
  });

  it("should return en-US for a non-US english variant", () => {
    expect(negotiateLocale("en-GB,en;q=0.9")).toBe("en-US");
  });

  it("should honour quality values over declaration order", () => {
    expect(negotiateLocale("en;q=0.4,pt-PT;q=0.9")).toBe("pt-PT");
  });

  it("should fall back to the default locale for an unsupported language", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9")).toBe("en-US");
  });

  it("should fall back to the default locale when the header is absent", () => {
    expect(negotiateLocale(null)).toBe("en-US");
  });

  it("should fall back to the default locale when the header is empty", () => {
    expect(negotiateLocale("")).toBe("en-US");
  });

  it("should ignore the wildcard entry", () => {
    expect(negotiateLocale("*")).toBe("en-US");
  });

  it("should match case-insensitively", () => {
    expect(negotiateLocale("PT-br")).toBe("pt-BR");
  });
});
