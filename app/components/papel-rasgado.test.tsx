// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PapelRasgado } from "./papel-rasgado";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica:
// sem isto os elementos de um teste sobrariam no DOM do proximo.
afterEach(cleanup);

describe("PapelRasgado", () => {
  it("should hide itself from assistive technology, because it carries no meaning", () => {
    const { container } = render(<PapelRasgado />);
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
  });

  it("should accept a class, so the caller decides colour and height", () => {
    const { container } = render(<PapelRasgado className="h-4 text-accent" />);

    expect(container.querySelector("svg")?.className.baseVal).toContain(
      "text-accent",
    );
  });

  it("should stretch instead of keeping its ratio, because it is an edge and not a drawing", () => {
    const { container } = render(<PapelRasgado />);

    expect(
      container.querySelector("svg")?.getAttribute("preserveAspectRatio"),
    ).toBe("none");
  });
});
