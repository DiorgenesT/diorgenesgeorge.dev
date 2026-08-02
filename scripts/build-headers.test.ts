import { describe, expect, it } from "vitest";
import {
  cspLength,
  executableInlineScripts,
  renderHeadersFile,
  sha256Base64,
} from "./build-headers";

describe("sha256Base64", () => {
  it("should produce the known digest for an empty string", () => {
    expect(sha256Base64("")).toBe(
      "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
    );
  });
});

describe("renderHeadersFile", () => {
  it("should include every provided hash in script-src", () => {
    const output = renderHeadersFile(["abc=", "def="]);

    expect(output).toContain("'sha256-abc='");
    expect(output).toContain("'sha256-def='");
  });

  it("should never allow unsafe-inline in script-src", () => {
    const scriptSrc = /script-src ([^;]+);/.exec(renderHeadersFile(["abc="]))?.[1] ?? "";

    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("should forbid framing on every path", () => {
    expect(renderHeadersFile([])).toContain("frame-ancestors 'none'");
  });

  it("should set a long immutable cache policy for hashed assets", () => {
    expect(renderHeadersFile([])).toContain("/assets/*");
  });

  it("should declare markdown as the content type of the .md twins", () => {
    expect(renderHeadersFile([])).toContain("text/markdown");
  });
});

describe("cspLength", () => {
  it("should measure only the policy, not the whole file", () => {
    const headers = renderHeadersFile(["abc="]);

    expect(cspLength(headers)).toBeLessThan(headers.length);
  });
});

describe("executableInlineScripts", () => {
  it("should return the body of an inline script", () => {
    expect(executableInlineScripts("<script>alert(1)</script>")).toEqual([
      "alert(1)",
    ]);
  });

  it("should ignore a script loaded from a src attribute", () => {
    expect(executableInlineScripts('<script src="/a.js"></script>')).toEqual([]);
  });

  it("should ignore a JSON-LD data block, which the browser never executes", () => {
    const html = `<script type="application/ld+json">{"a":1}</script>`;

    expect(executableInlineScripts(html)).toEqual([]);
  });

  it("should include a module script", () => {
    expect(
      executableInlineScripts('<script type="module">c()</script>'),
    ).toEqual(["c()"]);
  });

  it("should include a classic script that has to run before the first paint", () => {
    const script = `(function(){try{document.documentElement.dataset.x="1";}catch(e){}})();`;
    const html = `<script>${script}</script>`;

    expect(executableInlineScripts(html)).toEqual([script]);
  });
});
