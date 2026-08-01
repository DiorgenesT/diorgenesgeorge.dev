import { describe, expect, it } from "vitest";
import {
  extractInlineScripts,
  renderHeadersFile,
  sha256Base64,
} from "./build-headers";

describe("extractInlineScripts", () => {
  it("should return the body of an inline script", () => {
    expect(extractInlineScripts("<script>alert(1)</script>")).toEqual([
      "alert(1)",
    ]);
  });

  it("should ignore scripts loaded from a src attribute", () => {
    expect(extractInlineScripts('<script src="/a.js"></script>')).toEqual([]);
  });

  it("should return every inline script on the page", () => {
    const html = "<script>a()</script><p>x</p><script>b()</script>";
    expect(extractInlineScripts(html)).toEqual(["a()", "b()"]);
  });

  it("should handle attributes on the script tag", () => {
    expect(extractInlineScripts('<script type="module">c()</script>')).toEqual([
      "c()",
    ]);
  });

  it("should return an empty array when there is no script", () => {
    expect(extractInlineScripts("<p>nada</p>")).toEqual([]);
  });
});

describe("sha256Base64", () => {
  it("should produce the known digest for an empty string", () => {
    expect(sha256Base64("")).toBe(
      "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
    );
  });
});

describe("renderHeadersFile", () => {
  it("should forbid framing on every path", () => {
    expect(renderHeadersFile([])).toContain("frame-ancestors 'none'");
  });

  it("should never allow unsafe-inline in script-src", () => {
    const output = renderHeadersFile(["abc="]);
    const scriptSrc = output
      .split(";")
      .find((part) => part.includes("script-src"));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("should include every provided hash in script-src", () => {
    const output = renderHeadersFile(["abc=", "def="]);
    expect(output).toContain("'sha256-abc='");
    expect(output).toContain("'sha256-def='");
  });

  it("should set a long immutable cache policy for hashed assets", () => {
    expect(renderHeadersFile([])).toContain("/assets/*");
  });
});
