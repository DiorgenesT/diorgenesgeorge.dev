import { describe, expect, it } from "vitest";
import { modulesOf, renderReport } from "./check-budget";

const html = `<html><head>
<link rel="modulepreload" href="/assets/entry.client-abc.js"/>
<script type="module">import "/assets/home-def.js";</script>
</head></html>`;

describe("modulesOf", () => {
  it("should find every asset the page pulls", () => {
    expect(modulesOf(html)).toEqual(["entry.client-abc.js", "home-def.js"]);
  });

  it("should never repeat a module", () => {
    expect(modulesOf(html + html)).toHaveLength(2);
  });

  it("should ignore assets that are not javascript", () => {
    expect(modulesOf(`<link href="/assets/style-abc.css"/>`)).toEqual([]);
  });
});

describe("renderReport", () => {
  it("should name the heaviest module first", () => {
    const report = renderReport([
      { name: "small.js", bytes: 10 },
      { name: "big.js", bytes: 100 },
    ]);

    expect(report.indexOf("big.js")).toBeLessThan(report.indexOf("small.js"));
  });
});
