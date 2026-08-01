import { describe, expect, it } from "vitest";
import { switchLocalePath } from "./switch-locale";

describe("switchLocalePath", () => {
  it("should keep the user on the home page when switching locale", () => {
    expect(switchLocalePath("/pt-br/", "en-US")).toBe("/en/");
  });

  it("should translate the colophon slug when switching to english", () => {
    expect(switchLocalePath("/pt-br/colofao", "en-US")).toBe("/en/colophon/");
  });

  it("should translate the colophon slug when switching to portuguese", () => {
    expect(switchLocalePath("/en/colophon", "pt-PT")).toBe("/pt-pt/colofao/");
  });

  it("should accept a path that already carries a trailing slash", () => {
    expect(switchLocalePath("/pt-br/colofao/", "en-US")).toBe("/en/colophon/");
  });

  it("should return the target locale home for an unknown path", () => {
    expect(switchLocalePath("/pt-br/rota-inexistente", "en-US")).toBe("/en/");
  });

  it("should return the target locale home when the path has no locale prefix", () => {
    expect(switchLocalePath("/", "pt-BR")).toBe("/pt-br/");
  });

  it("should be a no-op when the target locale is the current one", () => {
    expect(switchLocalePath("/pt-br/colofao", "pt-BR")).toBe("/pt-br/colofao/");
  });
});
