import { describe, expect, it } from "vitest";
import { LOCALES, ROUTE_PATHS } from "../app/i18n/config";
import { contentManifest } from "./content-manifest";
import { prerenderPaths } from "./prerender-paths";

describe("prerenderPaths", () => {
  it("should include every static route in every locale", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/sobre/");
    expect(paths).toContain("/pt-pt/contacto/");
    expect(paths).toContain("/en/work/");
  });

  it("should include the root of every locale", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/");
    expect(paths).toContain("/pt-pt/");
    expect(paths).toContain("/en/");
  });

  it("should include the localized colophon slugs", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/colofao/");
    expect(paths).toContain("/pt-pt/colofao/");
    expect(paths).toContain("/en/colophon/");
  });

  it("should include the 404 of every locale, which the build turns into 404.html", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/404/");
    expect(paths).toContain("/en/404/");
  });

  it("should cover every static route in every locale", () => {
    const staticPaths = prerenderPaths().filter(
      (path) =>
        !path.includes(".") && path.split("/").filter(Boolean).length <= 2,
    );

    expect(staticPaths).toHaveLength(
      Object.keys(ROUTE_PATHS).length * LOCALES.length,
    );
  });

  it("should include one path per published document", () => {
    const paths = prerenderPaths();

    for (const entry of contentManifest()) {
      expect(paths.some((path) => path.endsWith(`/${entry.slug}/`))).toBe(true);
    }
  });

  it("should never include the bare root, which the worker redirects", () => {
    expect(prerenderPaths()).not.toContain("/");
  });

  it("should end every page path with a trailing slash", () => {
    const pages = prerenderPaths().filter((path) => !path.includes("."));

    expect(pages.every((path) => path.endsWith("/"))).toBe(true);
  });

  it("should include the sitemap and the robots file", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/sitemap.xml");
    expect(paths).toContain("/robots.txt");
  });

  it("should include one feed pair per locale", () => {
    const feeds = prerenderPaths().filter((path) => path.includes("feed."));

    expect(feeds).toHaveLength(LOCALES.length * 2);
  });

  it("should not contain duplicates", () => {
    const paths = prerenderPaths();

    expect(new Set(paths).size).toBe(paths.length);
  });
});
