import { describe, expect, it } from "vitest";
import { LOCALES, ROUTE_PATHS } from "./config";
import { prerenderPaths } from "./prerender";

describe("prerenderPaths", () => {
  it("should produce one path per route per locale", () => {
    expect(prerenderPaths()).toHaveLength(
      Object.keys(ROUTE_PATHS).length * LOCALES.length,
    );
  });

  it("should include the 404 of every locale, which the build turns into 404.html", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/404/");
    expect(paths).toContain("/en/404/");
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

  it("should never include the bare root, which the worker redirects", () => {
    expect(prerenderPaths()).not.toContain("/");
  });

  it("should not contain duplicates", () => {
    const paths = prerenderPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });
});
