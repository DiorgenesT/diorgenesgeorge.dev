import { describe, expect, it } from "vitest";
import { collectIndexEntries, renderIndexModule } from "./build-content-index";

describe("collectIndexEntries", () => {
  it("should include every published document in the repository", () => {
    const entries = collectIndexEntries();

    expect(entries.length).toBeGreaterThan(0);
    expect(
      entries.every((entry) => entry.frontmatter.status === "publicado"),
    ).toBe(true);
  });

  it("should carry the frontmatter but never the body", () => {
    const entries = collectIndexEntries();

    expect(JSON.stringify(entries)).not.toContain("## ");
  });

  it("should keep the locale of every entry", () => {
    const entries = collectIndexEntries();

    expect(entries.every((entry) => entry.locale.includes("-"))).toBe(true);
  });
});

describe("renderIndexModule", () => {
  it("should emit a module that declares its own type", () => {
    expect(renderIndexModule([])).toContain("export const CONTENT_INDEX");
  });

  it("should warn that the file is generated", () => {
    expect(renderIndexModule([])).toContain(
      "Gerado por scripts/build-content-index.ts",
    );
  });
});
