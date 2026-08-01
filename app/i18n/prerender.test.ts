import { describe, expect, it } from "vitest";
import { prerenderPaths } from "./prerender";

describe("prerenderPaths", () => {
  it("should produce one path per route per locale", () => {
    expect(prerenderPaths()).toHaveLength(6);
  });

  it("should include the root of every locale", () => {
    const paths = prerenderPaths();
    expect(paths).toContain("/pt-br/");
    expect(paths).toContain("/pt-pt/");
    expect(paths).toContain("/en/");
  });

  it("should include the localized colophon slugs", () => {
    const paths = prerenderPaths();
    expect(paths).toContain("/pt-br/colofao");
    expect(paths).toContain("/pt-pt/colofao");
    expect(paths).toContain("/en/colophon");
  });

  it("should never include the bare root, which the worker redirects", () => {
    expect(prerenderPaths()).not.toContain("/");
  });

  it("should not contain duplicates", () => {
    const paths = prerenderPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });
});
