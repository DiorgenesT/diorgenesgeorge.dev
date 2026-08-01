import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listArticles, listCases } from "../app/content/registry";
import { LOCALES } from "../app/i18n/config";
import { contentManifest } from "./content-manifest";

describe("manifesto de conteúdo", () => {
  it("should list exactly the published documents the registry exposes", () => {
    const fromRegistry = LOCALES.flatMap((locale) => [
      ...listCases(locale).map((doc) => `case:${locale}:${doc.slug}`),
      ...listArticles(locale).map((doc) => `article:${locale}:${doc.slug}`),
    ]).sort();

    const fromManifest = contentManifest()
      .map((entry) => `${entry.kind}:${entry.locale}:${entry.slug}`)
      .sort();

    expect(fromManifest).toEqual(fromRegistry);
  });

  it("should tolerate a content directory that does not exist yet", () => {
    expect(() => contentManifest()).not.toThrow();
  });
});

const CONTENT_DIR = "app/content";

function sourceFiles(): string[] {
  return ["pages", "cases", "articles"].flatMap((dir) => {
    const full = join(CONTENT_DIR, dir);
    try {
      return readdirSync(full)
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => join(full, name));
    } catch {
      return [];
    }
  });
}

describe("fonte dos documentos", () => {
  const files = sourceFiles();

  it("should find the content on disk", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("should keep %s as plain markdown", (file) => {
    const body = readFileSync(file, "utf8");

    // Markdown puro é o que permite servir o .md público como cópia fiel da fonte.
    expect(body).not.toMatch(/^import\s/m);
    expect(body).not.toMatch(/<[A-Z][A-Za-z]*/);
  });
});
